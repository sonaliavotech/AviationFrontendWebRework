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
  [PHYSICIAN_STATUS.APPEAR_AWAY]: "Appear Away",
  [PHYSICIAN_STATUS.DO_NOT_DISTURB]: "Do Not Disturb",
  [PHYSICIAN_STATUS.OFFLINE]: "Offline",
  [PHYSICIAN_STATUS.IN_CALL]: "In Call",
};

// Statuses a physician can manually pick from the web/native picker
export const MANUAL_PHYSICIAN_STATUSES = [
  PHYSICIAN_STATUS.AVAILABLE,
  PHYSICIAN_STATUS.APPEAR_AWAY,
  PHYSICIAN_STATUS.BUSY,
  PHYSICIAN_STATUS.ON_CALL,
  PHYSICIAN_STATUS.DO_NOT_DISTURB,
];

// Which statuses mean "assignable" — i.e., can receive a case
const ASSIGNABLE_STATUSES = new Set([
  PHYSICIAN_STATUS.AVAILABLE,
  PHYSICIAN_STATUS.ON_CALL,
  PHYSICIAN_STATUS.BUSY,
]);

/**
 * Normalize any incoming status string to one of our known statuses.
 * Handles: "Available", "AVAILABLE", "available", "online", "in-call", etc.
 */
export function normalizePhysicianStatus(raw) {
  if (!raw) return PHYSICIAN_STATUS.OFFLINE;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");

  if (s === "available" || s === "online") return PHYSICIAN_STATUS.AVAILABLE;
  if (s === "busy") return PHYSICIAN_STATUS.BUSY;
  if (s === "on_call" || s === "oncall") return PHYSICIAN_STATUS.ON_CALL;
  if (s === "away") return PHYSICIAN_STATUS.AWAY;
  if (s === "appear_away" || s === "appearaway")
    return PHYSICIAN_STATUS.APPEAR_AWAY;
  if (s === "do_not_disturb" || s === "dnd")
    return PHYSICIAN_STATUS.DO_NOT_DISTURB;
  if (s === "offline" || s === "off_line") return PHYSICIAN_STATUS.OFFLINE;
  if (s === "in_call" || s === "incall") return PHYSICIAN_STATUS.IN_CALL;

  return PHYSICIAN_STATUS.OFFLINE;
}

/**
 * A physician is assignable when:
 *  - they're active (backend flag physician_is_active)
 *  - their status is one of the assignable ones
 *
 * This matches the native `isPhysicianAssignable(status, isActive)`.
 */
export function isPhysicianAssignable(status, isActive = true) {
  if (!isActive) return false;
  return ASSIGNABLE_STATUSES.has(status);
}
