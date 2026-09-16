import { io } from "socket.io-client";

import { CALLING_SERVICE_URL } from "../config/appConfig";

class AviationChatSocket {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.registered = false;
    this._readyPromise = null;
    this._readyResolve = null;
    this._pendingEmits = [];
    this._joinWaiters = new Map();
    this._registeredCallbacks = new Set();

    // Last manual status (only "available" or "away")
    this._lastStatus = null;

    // True while the user is in an active call — status is forced to "busy"
    this._inCall = false;
  }

  _resetReadyPromise() {
    if (this._readyResolve) {
      this._readyResolve(this.socket);
    }
    this._readyPromise = new Promise((resolve) => {
      this._readyResolve = resolve;
    });
  }

  _markReady() {
    if (this._readyResolve) {
      this._readyResolve(this.socket);
      this._readyResolve = null;
    }
    this._flushPendingEmits();
  }

  _flushPendingEmits() {
    if (!this.socket?.connected || !this.registered) return;
    const queue = [...this._pendingEmits];
    this._pendingEmits = [];
    queue.forEach(({ event, payload }) => {
      this.socket.emit(event, payload);
    });
  }

  _queueEmit(event, payload) {
    if (this.socket?.connected && this.registered) {
      this.socket.emit(event, payload);
      return true;
    }
    this._pendingEmits.push({ event, payload });
    if (this.userId) {
      this.connect(this.userId);
    }
    return false;
  }

  whenReady(timeoutMs = 15000) {
    if (this.socket?.connected && this.registered) {
      return Promise.resolve(this.socket);
    }
    if (!this._readyPromise) {
      this._resetReadyPromise();
    }
    if (!timeoutMs) {
      return this._readyPromise;
    }
    return Promise.race([
      this._readyPromise,
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              "Unable to connect to chat server. Check network or VITE_CALLING_SERVICE_URL.",
            ),
          );
        }, timeoutMs);
      }),
    ]);
  }

  connect(userId) {
    const nextUserId = String(userId);

    if (this.userId && this.userId !== nextUserId && this.socket) {
      this.disconnect();
    }

    this.userId = nextUserId;

    if (this.socket?.connected && this.registered) {
      return this.socket;
    }

    if (this.socket && !this.socket.connected) {
      this.socket.connect();
      return this.socket;
    }

    this._resetReadyPromise();

    this.socket = io(CALLING_SERVICE_URL, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 4000,
    });

    this.socket.on("connect", () => {
      this.registered = false;
      this.socket.emit("aviation_register", { userId: this.userId });
    });

    // NOTE: This handler used to also decide and push a status itself
    // (_inCall ? "busy" : _lastStatus || "available"), racing against
    // PhysicianStatusService. That responsibility now lives ENTIRELY in
    // PhysicianStatusService, which subscribes via onRegistered() below.
    // This fires on the initial login AND every reconnect, so it replaces
    // the old (never-fired) "socket_reconnected" mechanism too.
    this.socket.on("aviation_registered", () => {
      this.registered = true;
      this._markReady();
      this._registeredCallbacks.forEach((cb) => {
        try {
          cb();
        } catch (error) {
          console.warn(
            "AviationChatSocket onRegistered callback error:",
            error?.message ?? error,
          );
        }
      });
    });

    this.socket.on("aviation_joined_room", ({ roomId }) => {
      const key = String(roomId);
      const waiters = this._joinWaiters.get(key);
      if (waiters?.length) {
        waiters.forEach((resolve) => resolve());
        this._joinWaiters.delete(key);
      }
    });

    this.socket.on("connect_error", (err) => {
      console.warn("AviationChatSocket connect_error:", err?.message);
    });

    return this.socket;
  }

  // Fires every time the socket (re)connects and registers with the server
  // (login, network blip recovery, etc). PhysicianStatusService uses this
  // as its single resync point instead of guessing at socket internals.
  onRegistered(cb) {
    if (typeof cb !== "function") return () => {};
    this._registeredCallbacks.add(cb);
    return () => this._registeredCallbacks.delete(cb);
  }

  // ---------- Raw status emit (system-driven: login/call/reconnect) ----------
  // No _inCall guard here — this is the trusted internal path used by
  // PhysicianStatusService, which already decides what SHOULD be sent.
  emitStatus(payload) {
    if (!payload?.userId || !payload?.status) return false;

    // Always cache the last status so reconnect/registration restores it.
    this._lastStatus = payload.status;

    if (this.socket?.connected && this.registered) {
      this.socket.emit("aviation_set_status", payload);
      return true;
    }

    this._pendingEmits.push({ event: "aviation_set_status", payload });
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    } else if (!this.socket && payload.userId) {
      this.connect(payload.userId);
    }
    return false;
  }

  // ---------- Manual status (Available / Away only) ----------
  // Guarded: manual UI clicks should never override an active call's
  // "busy" status. Kept for any direct callers; PhysicianStatusService
  // now does its own in-call guard before calling emitStatus() directly.
  setPhysicianStatus(statusOrPayload) {
    const payload =
      typeof statusOrPayload === "string"
        ? { userId: this.userId, status: statusOrPayload }
        : statusOrPayload;

    if (!payload?.userId || !payload?.status) return false;
    if (this._inCall) return false;

    return this.emitStatus(payload);
  }

  // ---------- Call-in-progress flag ----------
  // Pure flag now — does NOT emit anything itself. PhysicianStatusService
  // decides and pushes the resulting status (busy / restored status).
  setInCall(inCallOrPayload) {
    const inCall =
      typeof inCallOrPayload === "boolean"
        ? inCallOrPayload
        : inCallOrPayload?.inCall;
    this._inCall = !!inCall;
    return this._inCall;
  }

  isInCall() {
    return this._inCall;
  }

  getLastStatus() {
    return this._lastStatus;
  }

  // ---------- Chat room helpers ----------
  joinRoom(roomId) {
    if (!this.socket) return;
    const id = String(roomId);

    const emitJoin = () => {
      this.socket.emit("aviation_join_room", {
        roomId: id,
        userId: this.userId,
      });
    };

    if (this.socket.connected && this.registered) {
      emitJoin();
      return;
    }

    this.whenReady().then(emitJoin);
  }

  joinRoomAsync(roomId, timeoutMs = 8000) {
    const id = String(roomId);
    this.joinRoom(id);

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        const waiters = this._joinWaiters.get(id) || [];
        this._joinWaiters.set(
          id,
          waiters.filter((fn) => fn !== done),
        );
        resolve();
      }, timeoutMs);

      const done = () => {
        clearTimeout(timer);
        resolve();
      };

      const waiters = this._joinWaiters.get(id) || [];
      waiters.push(done);
      this._joinWaiters.set(id, waiters);
    });
  }

  leaveRoom(roomId) {
    if (!this.socket?.connected || !roomId) return;
    this.socket.emit("aviation_leave_room", { roomId: String(roomId) });
  }

  sendMessage({
    roomId,
    message,
    messageType = "text",
    fileUrl = null,
    fileName = null,
    fileSize = null,
    fileMimeType = null,
    voiceDurationMs = null,
  }) {
    if (!this.socket?.connected) {
      console.warn("AviationChatSocket: not connected");
      return false;
    }

    this.socket.emit("aviation_send_message", {
      roomId: String(roomId),
      senderId: this.userId,
      message,
      messageType,
      fileUrl,
      fileName,
      fileSize,
      fileMimeType,
      voiceDurationMs,
    });
    return true;
  }

  deleteMessage({ roomId, messageId, scope = "everyone" }) {
    if (!this.socket?.connected) return false;

    this.socket.emit("aviation_delete_message", {
      roomId: String(roomId),
      messageId: String(messageId),
      scope,
    });

    return true;
  }

  emitTyping(roomId) {
    if (!roomId) return false;
    return this._queueEmit("aviation_typing", {
      roomId: String(roomId),
      userId: this.userId,
    });
  }

  emitStopTyping(roomId) {
    if (!roomId) return false;
    return this._queueEmit("aviation_stop_typing", {
      roomId: String(roomId),
      userId: this.userId,
    });
  }

  emitMessageDelivered({ roomId, messageId, userId }) {
    return this._queueEmit("aviation_message_delivered", {
      roomId: String(roomId),
      messageId,
      userId: String(userId || this.userId),
    });
  }

  emitMessageSeen({ roomId, messageId, userId }) {
    return this._queueEmit("aviation_seen_message", {
      roomId: String(roomId),
      messageId: messageId || null,
      userId: String(userId || this.userId),
    });
  }

  _bind(event, callback) {
    if (!this.socket || !callback) return;
    this.socket.off(event, callback);
    this.socket.on(event, callback);
  }

  onNewMessage(cb) {
    this._bind("aviation_new_message", cb);
  }
  onMessageSent(cb) {
    this._bind("aviation_message_sent", cb);
  }
  onMessageDelivered(cb) {
    this._bind("aviation_message_delivered", cb);
  }
  onMessageSeen(cb) {
    this._bind("aviation_message_seen", cb);
  }
  onMessageDeleted(cb) {
    this._bind("aviation_message_deleted", cb);
  }
  onMessageHidden(cb) {
    this._bind("aviation_message_hidden", cb);
  }
  onUserTyping(cb) {
    this._bind("aviation_user_typing", cb);
  }
  onUserStopTyping(cb) {
    this._bind("aviation_user_stop_typing", cb);
  }
  onUserStatus(cb) {
    this._bind("aviation_user_status", cb);
  }
  onChatUnread(cb) {
    this._bind("aviation_chat_unread", cb);
  }
  onError(cb) {
    this._bind("aviation_error", cb);
  }

  // ---------- Disconnect / reconnect lifecycle (matches native) ----------
  onDisconnect(cb) {
    if (!this.socket || typeof cb !== "function") return;
    this.socket.on("disconnect", cb);
  }
  offDisconnect(cb) {
    this.socket?.off("disconnect", cb);
  }

  onCallEvent(event, cb) {
    if (!this.socket || typeof cb !== "function") return;
    this.socket.on(event, cb);
  }
  offCallEvent(event, cb) {
    this.socket?.off(event, cb);
  }

  offNewMessage(cb) {
    this.socket?.off("aviation_new_message", cb);
  }
  offMessageSent(cb) {
    this.socket?.off("aviation_message_sent", cb);
  }
  offMessageDelivered(cb) {
    this.socket?.off("aviation_message_delivered", cb);
  }
  offMessageSeen(cb) {
    this.socket?.off("aviation_message_seen", cb);
  }
  offMessageDeleted(cb) {
    this.socket?.off("aviation_message_deleted", cb);
  }
  offMessageHidden(cb) {
    this.socket?.off("aviation_message_hidden", cb);
  }
  offUserTyping(cb) {
    this.socket?.off("aviation_user_typing", cb);
  }
  offUserStopTyping(cb) {
    this.socket?.off("aviation_user_stop_typing", cb);
  }
  offUserStatus(cb) {
    this.socket?.off("aviation_user_status", cb);
  }
  offChatUnread(cb) {
    this.socket?.off("aviation_chat_unread", cb);
  }
  offError(cb) {
    this.socket?.off("aviation_error", cb);
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
  isRegistered() {
    return this.registered;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.userId = null;
    this.registered = false;
    this._pendingEmits = [];
    this._joinWaiters.clear();
    this._readyResolve = null;
    this._readyPromise = null;
    // Keep _lastStatus and _inCall so a quick reconnect restores correctly
  }
}

export default new AviationChatSocket();