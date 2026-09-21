// src/services/PhysicianStatusService.js
//
// Web port of the native PhysicianStatusService (Aviation-physician-frontend).
// SINGLE SOURCE OF TRUTH for the physician's presence status.
//
// Changes in this revision:
//  - start() / _handleRegistered() now ALSO pull the authoritative status from
//    GET /api/physicians (the same directory the Assign modal uses) and apply
//    it immediately. Previously the service only applied an optimistic
//    "available" and waited for a socket echo, so the header chip stayed on
//    "Offline" whenever the backend didn't emit `aviation_user_status` for
//    the current physician (or the echo was stale).
//  - A 30s interval keeps the chip in sync with the DB without a page refresh.

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
      return; // no change — avoid needless re-renders
    }

    this.state = {
      ...this.state,
      status: normalized,
      isActive: nextIsActive,
    };
    this._notify();
  }

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

  // ---- Authoritative DB read ----
  // GET /api/physicians returns the directory with DB columns
  // status / is_online / physician_is_active. We find our own row and apply
  // its status — same source the Assign modal uses, so both stay consistent.
  async refreshFromServer({ skipStaleBusy = false } = {}) {
    if (!this.state.userId || this._refreshing) return;
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

      // Don't clobber an in-call "busy" with a stale DB row.
      if (AviationChatSocket.isInCall()) {
        this._applyStatus(PHYSICIAN_STATUS.BUSY, { isActive: true });
        return;
      }

      // "busy" is ONLY ever written by the call lifecycle. The instant after a
      // call ends the DB row can still contain the previous "busy" because the
      // server may not have processed our just-emitted "available" yet. In that
      // window the freshly restored status must win, otherwise the chip flips
      // straight back to busy. Used only by markAvailableOnCallEnd().
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
    // Poll every 30s — matches AllEvents' incidents poll cadence and keeps
    // the chip honest even if the socket echo never arrives.
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

    // Idempotent start — do NOT reset a manual Away on remount.
    if (this.state.userId === nextUserId) {
      if (!AviationChatSocket.isConnected()) {
        AviationChatSocket.connect(nextUserId);
      }
      // Still refresh once and keep the loop alive.
      this.refreshFromServer();
      this._startRefreshLoop();
      return;
    }

    this.state.userId = nextUserId;
    this.lastManualStatus = PHYSICIAN_STATUS.AVAILABLE;
    this.disconnectInducedAway = false;

    // Optimistic UI: never flash Offline on login.
    this._applyStatus(PHYSICIAN_STATUS.AVAILABLE, { isActive: true });
    this._emitStatus(PHYSICIAN_STATUS.AVAILABLE);

    // Then reconcile with the DB (Assign modal's source of truth).
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
    this._applyStatus(PHYSICIAN_STATUS.BUSY, { isActive: true });
    this._emitStatus(PHYSICIAN_STATUS.BUSY);
  }

  markAvailableOnCallEnd() {
    if (!this.state.userId) return;

    AviationChatSocket.setInCall(false);

    const restore =
      this.lastManualStatus === PHYSICIAN_STATUS.APPEAR_AWAY
        ? PHYSICIAN_STATUS.APPEAR_AWAY
        : PHYSICIAN_STATUS.AVAILABLE;

    if (this.state.status === restore) return;

    this._applyStatus(restore, { isActive: true });
    this._emitStatus(restore);

    // Pull DB status again right after a call ends — matches what the
    // Assign modal would see on its next open. skipStaleBusy keeps the
    // optimistic restore (available / away) from being clobbered by the old
    // "busy" row if the server hasn't processed the emit above yet.
    this.refreshFromServer({ skipStaleBusy: true });
  }

  markOfflineOnLogout() {
    this._stopRefreshLoop();
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
    if (AviationChatSocket.isInCall()) return;
    if (this.state.status !== PHYSICIAN_STATUS.AVAILABLE) return;

    // Emit `appear_away` (not `away`) so the backend actually persists the
    // status — matches the native app's disconnect behavior.
    this._applyStatus(PHYSICIAN_STATUS.APPEAR_AWAY, { isActive: true });
    this._emitStatus(PHYSICIAN_STATUS.APPEAR_AWAY);
  }

  // Fires on initial login AND every (re)connect. Re-emit + re-read from DB.
  _handleRegistered() {
    if (!this.state.userId) return;

    const statusToSend = AviationChatSocket.isInCall()
      ? PHYSICIAN_STATUS.BUSY
      : this.lastManualStatus || PHYSICIAN_STATUS.AVAILABLE;

    this._applyStatus(statusToSend, { isActive: true });
    this._emitStatus(statusToSend);

    // After the socket registers, pull the DB truth so the chip can't stay
    // stuck on the optimistic value if the server rejects/overrides it.
    this.refreshFromServer();
  }
}

export default new PhysicianStatusService();
