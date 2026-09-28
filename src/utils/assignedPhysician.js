// Shared helper: figure out which physician a case is assigned to.
//
// The case detail endpoint, the patients list rows and the deep-link state
// all expose the assignee slightly differently, so every place that needs
// the assignee id should use this resolver instead of re-implementing it.

/**
 * Returns the assigned physician id as a string, or null when nobody is
 * assigned. Accepts the full case payload, a patients-list row, or a
 * navigation state object.
 */
export function resolveAssignedPhysicianId(source) {
  if (!source || typeof source !== "object") return null;

  const nested =
    source.physician && typeof source.physician === "object"
      ? source.physician
      : null;

  const id =
    source.physicianId ||
    source.physician_id ||
    source.assigned_physician_id ||
    source.assignedPhysicianId ||
    nested?.id ||
    nested?.userId ||
    nested?.user_id ||
    null;

  if (id == null) return null;
  const normalized = String(id).trim();
  return normalized || null;
}

/**
 * True only when the given user id is the physician the case is assigned to.
 * This is what gates the Chat / Call actions: a physician may open any case,
 * but those actions only become active for the assigned one.
 */
export function isAssignedPhysicianId(assignedId, userId) {
  if (assignedId == null || userId == null) return false;
  const a = String(assignedId).trim();
  const u = String(userId).trim();
  return !!a && !!u && a === u;
}

export default resolveAssignedPhysicianId;