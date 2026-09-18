// src/types/physicianStatus.js

export const PHYSICIAN_STATUS = {
  AVAILABLE: "available",
  BUSY: "busy",
  ON_CALL: "on_call",
  AWAY: "away",
  APPEAR_AWAY: "appear_away",
  DO_NOT_DISTURB: "do_not_disturb",
  OFFLINE: "offline",
  IN_CALL: "in_call",
};

export const PHYSICIAN_STATUS_COLORS = {
  [PHYSICIAN_STATUS.AVAILABLE]: "#22C55E",
  [PHYSICIAN_STATUS.BUSY]: "#EF4444",
  [PHYSICIAN_STATUS.ON_CALL]: "#F59E0B",
  [PHYSICIAN_STATUS.AWAY]: "#94A3B8",
  [PHYSICIAN_STATUS.APPEAR_AWAY]: "#94A3B8",
  [PHYSICIAN_STATUS.DO_NOT_DISTURB]: "#DC2626",
  [PHYSICIAN_STATUS.OFFLINE]: "#64748B",
  [PHYSICIAN_STATUS.IN_CALL]: "#3B82F6",
};

export const PHYSICIAN_STATUS_SHORT_LABELS = {
  [PHYSICIAN_STATUS.AVAILABLE]: "Available",
  [PHYSICIAN_STATUS.BUSY]: "Busy",
  [PHYSICIAN_STATUS.ON_CALL]: "On Call",
  [PHYSICIAN_STATUS.AWAY]: "Away",
  [PHYSICIAN_STATUS.APPEAR_AWAY]: "Away",
  [PHYSICIAN_STATUS.DO_NOT_DISTURB]: "Do Not Disturb",
  [PHYSICIAN_STATUS.OFFLINE]: "Offline",
  [PHYSICIAN_STATUS.IN_CALL]: "Busy",
};

/**
 * Only two statuses can be picked manually.
 * Busy / On Call / In Call are set automatically by the call lifecycle.
 *
 * IMPORTANT (matches the native app): the value SENT to the server / stored in
 * the DB for manual "Away" is `appear_away` — the backend does not recognize
 * the plain `away` string. `PHYSICIAN_STATUS.AWAY` is kept only as a display
 * alias; it must never be emitted on the socket.
 */
export const MANUAL_PHYSICIAN_STATUSES = [
  PHYSICIAN_STATUS.AVAILABLE,
  PHYSICIAN_STATUS.APPEAR_AWAY,
];

// Statuses considered "assignable"
const ASSIGNABLE_STATUSES = new Set([
  PHYSICIAN_STATUS.AVAILABLE,
  PHYSICIAN_STATUS.ON_CALL,
  PHYSICIAN_STATUS.BUSY,
]);

export function normalizePhysicianStatus(raw) {
  if (!raw) return PHYSICIAN_STATUS.OFFLINE;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");

  if (s === "available" || s === "online") return PHYSICIAN_STATUS.AVAILABLE;
  if (s === "busy") return PHYSICIAN_STATUS.BUSY;
  if (s === "on_call" || s === "oncall") return PHYSICIAN_STATUS.ON_CALL;
  // Canonicalize every "away" variant to `appear_away` — the ONLY value the
  // backend / DB accepts (mirrors the native app's normalizePhysicianStatus).
  if (s === "away" || s === "appear_away" || s === "appearaway")
    return PHYSICIAN_STATUS.APPEAR_AWAY;
  if (s === "do_not_disturb" || s === "dnd")
    return PHYSICIAN_STATUS.DO_NOT_DISTURB;
  if (s === "offline" || s === "off_line") return PHYSICIAN_STATUS.OFFLINE;
  if (s === "in_call" || s === "incall") return PHYSICIAN_STATUS.IN_CALL;

  return PHYSICIAN_STATUS.OFFLINE;
}

export function isPhysicianAssignable(status, isActive = true) {
  if (!isActive) return false;
  return ASSIGNABLE_STATUSES.has(status);
}