export const INCIDENT_SOCKET_EVENTS = {
  PHYSICIAN_ORDER_CREATED: "physician_order_created",
  PHYSICIAN_ORDER_UPDATED: "physician_order_updated",
  PHYSICIAN_ORDER_STATUS_UPDATED: "physician_order_status_updated",
  PHYSICIAN_ORDER_DELETED: "physician_order_deleted",

  PHYSICIAN_NOTE_CREATED: "physician_note_created",
  PHYSICIAN_NOTE_UPDATED: "physician_note_updated",
  PHYSICIAN_NOTE_DELETED: "physician_note_deleted",

  ECG_UPLOADED: "ecg_uploaded",
};

export const INCIDENT_DETAIL_REFRESH_EVENTS = [
  "incident_updated",
  "case_updated",
  "case_log_created",
  "physician_assigned",
  "incident_detail_refresh",
];

export default {
  INCIDENT_SOCKET_EVENTS,
  INCIDENT_DETAIL_REFRESH_EVENTS,
};
