// src/utils/physicianOrderNoteMappers.js

/**
 * Map a raw socket payload for an order into the same shape used by
 * `fetchOrders` in EventSummaryPanel / CaseDetails.
 */
export const mapOrderFromSocket = (data = {}) => {
  const src = data?.order || data?.data || data || {};
  return {
    id: src.id ?? src.orderId ?? src.order_id,
    title: src.title ?? "",
    instructions: src.instructions ?? "",
    status:
      String(src.status || "").toLowerCase() === "completed"
        ? "Completed"
        : "Pending",
    createdAt: src.created_at ?? src.createdAt ?? null,
    orderType: src.order_type ?? src.orderType ?? "general",
    physicianId: src.physician_id ?? src.physicianId ?? null,
    completedBy: src.completed_by ?? src.completedBy ?? null,
    completedAt: src.completed_at ?? src.completedAt ?? null,
    crewRemarks: src.crew_remarks ?? src.crewRemarks ?? null,
    displayOrder: src.display_order ?? src.displayOrder ?? 0,
  };
};

/**
 * Map a raw socket payload for a note into the shape used by `fetchNotes`.
 */
export const mapNoteFromSocket = (data = {}) => {
  const src = data?.note || data?.data || data || {};
  return {
    id: src.id ?? src.noteId ?? src.note_id,
    content: src.content ?? src.text ?? "",
    note_type: src.note_type ?? src.noteType ?? "diagnosis",
    is_critical: src.is_critical ?? src.isCritical ?? false,
    created_at: src.created_at ?? src.createdAt ?? new Date().toISOString(),
    updated_at: src.updated_at ?? src.updatedAt ?? new Date().toISOString(),
    physician_id: src.physician_id ?? src.physicianId ?? null,
    incident_id: src.incident_id ?? src.incidentId ?? null,
    sender: src.sender ?? src.sender_type ?? "physician",
    is_local: src.is_local ?? src.isLocal ?? false,
  };
};

/**
 * Extract a deleted entity's ID from a variety of possible payload shapes.
 */
export const resolveDeletedEntityId = (payload) => {
  if (payload == null) return null;
  if (typeof payload === "string" || typeof payload === "number") {
    return String(payload);
  }
  const id =
    payload.id ??
    payload.orderId ??
    payload.order_id ??
    payload.noteId ??
    payload.note_id ??
    payload.entityId ??
    payload.entity_id ??
    payload?.data?.id ??
    null;
  return id != null ? String(id) : null;
};
