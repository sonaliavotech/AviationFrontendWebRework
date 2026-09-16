// src/services/PhysicianStatusService.js
//
// Web port of the native PhysicianStatusService (Aviation-physician-frontend).
// This is the SINGLE SOURCE OF TRUTH for the physician's presence status.
// AviationChatSocket is a pure transport: it never decides a status on its
// own anymore, it just exposes onRegistered() (fires on login AND every
// reconnect) and an _inCall flag. Every status decision + DB write happens
// here, so there's no more race between two systems.
//
// Behaviour:
//  - start(userId)              → connect, then force "available" on login
//  - setStatus(status, manual)  → only Available/Away are user-selectable;
//                                  ignored while an active call is in progress
//  - markBusyOnCallAccept()     → automatic Busy (call lifecycle)
//  - markAvailableOnCallEnd()   → restores last manual status (Available/Away)
//  - markOfflineOnLogout()      → force Offline + emit on logout
//  - socket disconnect          → auto "away" (only if was Available)
//  - socket (re)registers       → resync: busy (if in call) or last manual
//                                  status (available/away), on login AND
//                                  every reconnect

import AviationChatSocket from "./AviationChatSocket";
import {
  PHYSICIAN_STATUS,
  MANUAL_PHYSICIAN_STATUSES,
  normalizePhysicianStatus,
} from "../types/physicianStatus";

class PhysicianStatusService {
  constructor() {
    // Start optimistic: a logged-in user is "available" until proven otherwise.
    // This prevents the UI from flashing "Offline" on reload before the socket
    // confirms the DB state. reset()/markOfflineOnLogout() restore Offline.
    this.state = {
      status: PHYSICIAN_STATUS.AVAILABLE,
      isActive: true,
      userId: null,
    };
    this.listeners = new Set();
    this.bound = false;
    this.disconnectInducedAway = false;
    this.lastManualStatus = null;

    this._handleStatusChanged = this._handleStatusChanged.bind(this);
    this._handleSocketDisconnect = this._handleSocketDisconnect.bind(this);
    this._handleRegistered = this._handleRegistered.bind(this);
  }

  subscribe(listener) {
    if (typeof listener !== "function") {
      return () => {};
    }
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

    this.state = {
      ...this.state,
      status: normalized,
      isActive:
        typeof isActive === "boolean"
          ? isActive
          : normalized !== PHYSICIAN_STATUS.OFFLINE,
    };
    this._notify();
  }

  // Emit directly through AviationChatSocket, which queues the
  // aviation_set_status event and flushes it on register/reconnect.
  // This guarantees the server (and thus the DB) receives the change
  // regardless of socket readiness — no silent drops.
  _emitStatus(status) {
    if (!this.state.userId) return;
    try {
      AviationChatSocket.emitStatus({
        userId: this.state.userId,
        status,
      });
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

  start(userId) {
    const nextUserId = String(userId);
    this.bindSocket();

    // Idempotent start: if we already manage this user (e.g. AllEvents
    // remounts during SPA navigation), keep their current status instead of
    // resetting a manually chosen "Away" back to "Available" and re-emitting
    // it to the DB. Only a genuine fresh start forces "available".
    if (this.state.userId === nextUserId) {
      if (!AviationChatSocket.isConnected()) {
        AviationChatSocket.connect(nextUserId);
      }
      return;
    }

    this.state.userId = nextUserId;

    // Apply "available" optimistically IMMEDIATELY so the UI never flashes
    // Offline on reload (the DB flip happens async via the queued emit).
    this.lastManualStatus = PHYSICIAN_STATUS.AVAILABLE;
    this.disconnectInducedAway = false;
    this._applyStatus(PHYSICIAN_STATUS.AVAILABLE, { isActive: true });
    this._emitStatus(PHYSICIAN_STATUS.AVAILABLE);
  }

  reset() {
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

    // Busy (from an active call) always wins — a manual click shouldn't be
    // able to quietly override it while the physician is on a call.
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

  async _markAvailableOnLogin() {
    await AviationChatSocket.whenReady().catch(() => null);
    if (!this.state.userId) return;

    this.lastManualStatus = PHYSICIAN_STATUS.AVAILABLE;
    this._applyStatus(PHYSICIAN_STATUS.AVAILABLE, { isActive: true });
    this._emitStatus(PHYSICIAN_STATUS.AVAILABLE);
  }

  markBusyOnCallAccept() {
    if (!this.state.userId) return;
    AviationChatSocket.setInCall(true);
    this._applyStatus(PHYSICIAN_STATUS.BUSY, { isActive: true });
    this._emitStatus(PHYSICIAN_STATUS.BUSY);
  }

  markAvailableOnCallEnd() {
    if (!this.state.userId) return;

    // Always clear the in-call flag first so a rejected/ended call can never
    // leave the manual-status guard (setStatus) permanently blocked.
    AviationChatSocket.setInCall(false);

    // Restore UNCONDITIONALLY. The old guard (`status !== BUSY → return`)
    // silently skipped the restore whenever the local status got out of sync
    // (e.g. a stale status echo), leaving the UI stuck on "Busy" after the
    // call had ended. Manual picks only ever normalize to AVAILABLE or AWAY,
    // so this is always the correct resting status.
    const restore =
      this.lastManualStatus === PHYSICIAN_STATUS.AWAY
        ? PHYSICIAN_STATUS.AWAY
        : PHYSICIAN_STATUS.AVAILABLE;

    // Skip redundant work only when nothing actually changes.
    if (this.state.status === restore) return;

    this._applyStatus(restore, { isActive: true });
    this._emitStatus(restore);
  }

  markOfflineOnLogout() {
    if (!this.state.userId) {
      this.reset();
      return;
    }

    this.lastManualStatus = null;
    AviationChatSocket.setInCall(false);
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

    const isActive =
      data.is_active !== undefined
        ? Boolean(data.is_active)
        : status !== PHYSICIAN_STATUS.OFFLINE;

    this._applyStatus(status, { isActive });
  }

  _handleSocketDisconnect(reason) {
    if (reason === "io client disconnect") return;
    if (!this.state.userId) return;
    if (AviationChatSocket.isInCall()) return; // don't flip an active call to Away
    if (this.state.status !== PHYSICIAN_STATUS.AVAILABLE) return;

    this._applyStatus(PHYSICIAN_STATUS.AWAY, { isActive: true });
    this._emitStatus(PHYSICIAN_STATUS.AWAY);
  }

  // Bug fix: this replaces the old _handleSocketReconnect, which listened
  // for a "socket_reconnected" call event that AviationChatSocket never
  // actually emitted — so reconnect-restore silently never ran. This now
  // fires on the initial login AND every genuine reconnect (both go
  // through "aviation_registered"), and always resyncs to the correct
  // status: Busy if a call is active, otherwise the last manual choice.
  _handleRegistered() {
    if (!this.state.userId) return;

    const statusToSend = AviationChatSocket.isInCall()
      ? PHYSICIAN_STATUS.BUSY
      : this.lastManualStatus || PHYSICIAN_STATUS.AVAILABLE;

    this._applyStatus(statusToSend, { isActive: true });
    this._emitStatus(statusToSend);
  }
}

export default new PhysicianStatusService();
