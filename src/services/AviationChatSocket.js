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
      // Polling first — more reliable in browsers / corporate networks than websocket-only
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

    this.socket.on("aviation_registered", () => {
      this.registered = true;
      this._markReady();
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

  onNewMessage(callback) {
    this.socket?.on("aviation_new_message", callback);
  }

  onMessageSent(callback) {
    this.socket?.on("aviation_message_sent", callback);
  }

  onMessageDelivered(callback) {
    this.socket?.on("aviation_message_delivered", callback);
  }

  onMessageSeen(callback) {
    this.socket?.on("aviation_message_seen", callback);
  }

  onMessageDeleted(callback) {
    this.socket?.on("aviation_message_deleted", callback);
  }

  onMessageHidden(callback) {
    this.socket?.on("aviation_message_hidden", callback);
  }

  onUserTyping(callback) {
    this.socket?.on("aviation_user_typing", callback);
  }

  onUserStopTyping(callback) {
    this.socket?.on("aviation_user_stop_typing", callback);
  }

  onUserStatus(callback) {
    this.socket?.on("aviation_user_status", callback);
  }

  onChatUnread(callback) {
    this.socket?.on("aviation_chat_unread", callback);
  }

  onError(callback) {
    this.socket?.on("aviation_error", callback);
  }

  offNewMessage(callback) {
    this.socket?.off("aviation_new_message", callback);
  }

  offMessageSent(callback) {
    this.socket?.off("aviation_message_sent", callback);
  }

  offMessageDelivered(callback) {
    this.socket?.off("aviation_message_delivered", callback);
  }

  offMessageSeen(callback) {
    this.socket?.off("aviation_message_seen", callback);
  }

  offMessageDeleted(callback) {
    this.socket?.off("aviation_message_deleted", callback);
  }

  offMessageHidden(callback) {
    this.socket?.off("aviation_message_hidden", callback);
  }

  offUserTyping(callback) {
    this.socket?.off("aviation_user_typing", callback);
  }

  offUserStopTyping(callback) {
    this.socket?.off("aviation_user_stop_typing", callback);
  }

  offUserStatus(callback) {
    this.socket?.off("aviation_user_status", callback);
  }

  offChatUnread(callback) {
    this.socket?.off("aviation_chat_unread", callback);
  }

  offError(callback) {
    this.socket?.off("aviation_error", callback);
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
  }
}

export default new AviationChatSocket();
