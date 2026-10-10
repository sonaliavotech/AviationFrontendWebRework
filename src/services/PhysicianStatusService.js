// src/services/PhysicianStatusService.js
//
// Web port of the native PhysicianStatusService (Aviation-physician-frontend).
// SINGLE SOURCE OF TRUTH for the physician's presence status.

import AviationChatSocket from "./AviationChatSocket";
import { getPhysicians } from "./api";
import {
  PHYSICIAN_STATUS,
  MANUAL_PHYSICIAN_STATUSES,
  normalizePhysicianStatus,
} from "../types/physicianStatus";

class PhysicianStatusService {
  constructor() {
    this.state = {
      status: PHYSICIAN_STATUS.AVAILABLE,
      isActive: true,
      userId: null,
    };
    this.listeners = new Set();
    this.bound = false;
    this.disconnectInducedAway = false;
    this.lastManualStatus = null;

    this._refreshTimer = null;
    this._refreshing = false;

    // Post-call grace window. While active:
    //   - refreshFromServer() will NOT apply a "busy"/"offline" DB row
    //   - _handleStatusChanged() will NOT apply a "busy" echo
    // This stops the just-restored "available" from being clobbered by
    // stale server state before our emit has been processed.
    this._suppressStaleBusyUntil = 0;

    this._handleStatusChanged = this._handleStatusChanged.bind(this);
    this._handleSocketDisconnect = this._handleSocketDisconnect.bind(this);
    this._handleRegistered = this._handleRegistered.bind(this);
  }

  subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return { ...this.state };
  }

  _notify() {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.warn(
          "[PhysicianStatusService] listener error:",
          error?.message ?? error,
        );
      }
    });
  }

  _applyStatus(status, { isActive } = {}) {
    const normalized = normalizePhysicianStatus(status);
    if (!normalized) return;

    const prev = this.state.status;
    const nextIsActive =
      typeof isActive === "boolean"
        ? isActive
        : normalized !== PHYSICIAN_STATUS.OFFLINE;

    if (prev === normalized && this.state.isActive === nextIsActive) {
      return;
    }

    this.state = {
      ...this.state,
      status: normalized,
      isActive: nextIsActive,
    };
    this._notify();
  }

  // Emit a status. If the chat socket isn't registered yet, we try to
  // connect it and re-emit as soon as it's ready — instead of silently
  // queueing and never flushing.
  _emitStatus(status, { force = false } = {}) {
    if (!this.state.userId) return;

    const payload = {
      userId: this.state.userId,
      status,
    };

    try {
      if (AviationChatSocket.isRegistered?.()) {
        AviationChatSocket.emitStatus(payload);
        return;
      }

      // Socket not ready — kick a reconnect and retry once registered.
      // `force` is used by markAvailableOnCallEnd so an "available" emit
      // ALWAYS lands, even if the chat socket momentarily dropped.
      if (force || !AviationChatSocket.isConnected?.()) {
        AviationChatSocket.connect(this.state.userId);
      }

      // Always also push into the socket's pending queue so it goes out
      // on the next registered event.
      AviationChatSocket.emitStatus(payload);
    } catch (error) {
      console.warn(
        "[PhysicianStatusService] emit failed:",
        error?.message ?? error,
      );
    }
  }

  bindSocket() {
    if (this.bound) return;
    this.bound = true;

    if (typeof AviationChatSocket.onUserStatus === "function") {
      AviationChatSocket.onUserStatus(this._handleStatusChanged);
    }
    if (typeof AviationChatSocket.onDisconnect === "function") {
      AviationChatSocket.onDisconnect(this._handleSocketDisconnect);
    }
    if (typeof AviationChatSocket.onRegistered === "function") {
      AviationChatSocket.onRegistered(this._handleRegistered);
    }
  }

  async refreshFromServer({ skipStaleBusy = false } = {}) {
    if (!this.state.userId || this._refreshing) return;

    // Full skip while inside the post-call grace window — the DB is still
    // stale (busy) and re-reading it would just flip the chip back.
    if (Date.now() < this._suppressStaleBusyUntil) {
      return;
    }

    this._refreshing = true;
    try {
      const list = await getPhysicians();
      const me = (Array.isArray(list) ? list : []).find(
        (doc) => doc && String(doc.id) === String(this.state.userId),
      );
      if (!me) return;

      const normalized = normalizePhysicianStatus(
        me.status || (me.is_online ? "available" : null),
      );
      if (!normalized) return;

      const isActive =
        me.physician_is_active === true ||
        String(me.physician_is_active || "").toLowerCase() === "true" ||
        me.physician_is_active === undefined;

      // Never clobber an in-call "busy" with a stale DB row.
      if (AviationChatSocket.isInCall()) {
        this._applyStatus(PHYSICIAN_STATUS.BUSY, { isActive: true });
        return;
      }

      // After a call ends, "busy" from the DB is stale — skip it.
      if (skipStaleBusy && normalized === PHYSICIAN_STATUS.BUSY) {
        return;
      }

      this._applyStatus(normalized, { isActive });
    } catch (error) {
      console.warn(
        "[PhysicianStatusService] refreshFromServer failed:",
        error?.message ?? error,
      );
    } finally {
      this._refreshing = false;
    }
  }

  _startRefreshLoop() {
    this._stopRefreshLoop();
    this._refreshTimer = setInterval(() => {
      this.refreshFromServer();
    }, 30000);
  }

  _stopRefreshLoop() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  start(userId) {
    const nextUserId = String(userId);
    this.bindSocket();

    if (this.state.userId === nextUserId) {
      if (!AviationChatSocket.isConnected()) {
        AviationChatSocket.connect(nextUserId);
      }
      this.refreshFromServer();
      this._startRefreshLoop();
      return;
    }

    this.state.userId = nextUserId;
    this.lastManualStatus = PHYSICIAN_STATUS.AVAILABLE;
    this.disconnectInducedAway = false;

    this._applyStatus(PHYSICIAN_STATUS.AVAILABLE, { isActive: true });
    this._emitStatus(PHYSICIAN_STATUS.AVAILABLE);

    this.refreshFromServer();
    this._startRefreshLoop();
  }

  reset() {
    this._stopRefreshLoop();
    this.state = {
      status: PHYSICIAN_STATUS.OFFLINE,
      isActive: false,
      userId: null,
    };
    this.lastManualStatus = null;
    this._notify();
  }

  setStatus(status, { source = "manual" } = {}) {
    const normalized = normalizePhysicianStatus(status);
    if (!normalized || !MANUAL_PHYSICIAN_STATUSES.includes(normalized)) {
      return false;
    }

    if (source === "manual" && AviationChatSocket.isInCall()) {
      return false;
    }

    if (source === "manual") {
      this.lastManualStatus = normalized;
    }

    this._applyStatus(normalized, { isActive: true });
    this._emitStatus(normalized);
    return true;
  }

  markBusyOnCallAccept() {
    if (!this.state.userId) return;
    AviationChatSocket.setInCall(true);
    // Cancel any lingering grace window from a previous call.
    this._suppressStaleBusyUntil = 0;
    this._applyStatus(PHYSICIAN_STATUS.BUSY, { isActive: true });
    this._emitStatus(PHYSICIAN_STATUS.BUSY);
  }

  markAvailableOnCallEnd() {
    if (!this.state.userId) return;

    // ⚠️ ORDER MATTERS:
    // 1. Clear the in-call flag FIRST so nothing re-applies busy.
    AviationChatSocket.setInCall(false);

    // 2. Open the grace window BEFORE emitting, so any concurrent
    //    refreshFromServer / status echo is already suppressed.
    this._suppressStaleBusyUntil = Date.now() + 30000; // 30s

    // 3. Determine the restore value.
    const restore =
      this.lastManualStatus === PHYSICIAN_STATUS.APPEAR_AWAY
        ? PHYSICIAN_STATUS.APPEAR_AWAY
        : PHYSICIAN_STATUS.AVAILABLE;

    // 4. Apply + emit — with force, so the emit reaches the server even if
    //    the chat socket was momentarily disconnected.
    this._applyStatus(restore, { isActive: true });
    this._emitStatus(restore, { force: true });

    // 5. Do NOT call refreshFromServer here. The DB is still stale and
    //    re-reading it would flip the chip back to busy. The 30s refresh
    //    loop will naturally re-sync once the server has caught up.
  }

  markOfflineOnLogout() {
    this._stopRefreshLoop();
    if (!this.state.userId) {
      this.reset();
      return;
    }

    this.lastManualStatus = null;
    AviationChatSocket.setInCall(false);
    this._suppressStaleBusyUntil = 0;
    this._applyStatus(PHYSICIAN_STATUS.OFFLINE, { isActive: false });
    this._emitStatus(PHYSICIAN_STATUS.OFFLINE);
    this.state.userId = null;
  }

  _handleStatusChanged(data = {}) {
    const incomingUserId = String(data.userId || data.id || "");
    if (
      incomingUserId &&
      this.state.userId &&
      incomingUserId !== this.state.userId
    ) {
      return;
    }

    const status = normalizePhysicianStatus(data.status);
    if (!status) return;

    // While the grace window is active, ignore a "busy" echo for our own
    // user — it's the stale value the server sent before processing our
    // "available" emit.
    if (
      status === PHYSICIAN_STATUS.BUSY &&
      Date.now() < this._suppressStaleBusyUntil
    ) {
      return;
    }

    const isActive =
      data.is_active !== undefined
        ? Boolean(data.is_active)
        : status !== PHYSICIAN_STATUS.OFFLINE;

    this._applyStatus(status, { isActive });
  }

  _handleSocketDisconnect(reason) {
    if (reason === "io client disconnect") return;
    if (!this.state.userId) return;
    if (AviationChatSocket.isInCall()) return;
    if (this.state.status !== PHYSICIAN_STATUS.AVAILABLE) return;

    this._applyStatus(PHYSICIAN_STATUS.APPEAR_AWAY, { isActive: true });
    this._emitStatus(PHYSICIAN_STATUS.APPEAR_AWAY);
  }

  _handleRegistered() {
    if (!this.state.userId) return;

    // If we're still inside the post-call grace window, don't push busy —
    // the server may still be processing our "available" emit.
    const inGrace = Date.now() < this._suppressStaleBusyUntil;

    const statusToSend = AviationChatSocket.isInCall()
      ? PHYSICIAN_STATUS.BUSY
      : inGrace
        ? this.lastManualStatus || PHYSICIAN_STATUS.AVAILABLE
        : this.lastManualStatus || PHYSICIAN_STATUS.AVAILABLE;

    this._applyStatus(statusToSend, { isActive: true });
    this._emitStatus(statusToSend);

    // Only pull DB truth when we're NOT in the grace window.
    if (!inGrace) {
      this.refreshFromServer();
    }
  }
}

export default new PhysicianStatusService();
