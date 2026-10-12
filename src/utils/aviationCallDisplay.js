// Shared helpers for displaying caller info on call screens.
// The calling service sends the patient name under a few different keys
// depending on the originating client (mobile crew app, web, push payload),
// so every screen resolves it through the same ordered fallback list.

const firstNonEmptyString = (...values) => {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

// Patient name is the primary identity on an incoming call screen.
// `full_name` / `patient_name` are the aliases used by the mobile client.
export const resolvePatientName = (call = {}) =>
  firstNonEmptyString(
    call.patientName,
    call.full_name,
    call.patient_name,
    call.patientFullName,
    call.patientInfo?.full_name,
    call.patientInfo?.name,
  );

export const resolveCallerName = (call = {}) =>
  firstNonEmptyString(
    call.callerName,
    call.handle,
    call.caller?.name,
    call.caller?.fullName,
  );

export const resolveCallerRole = (call = {}) =>
  firstNonEmptyString(call.callerRole, call.caller?.role, "physician");

export const resolveRoleLabel = (role) => {
  const normalized = String(role || "").trim().toLowerCase();
  if (normalized === "physician" || normalized === "doctor") return "Physician";
  if (normalized === "crew" || normalized === "passenger") return "Crew";
  if (!normalized) return "Caller";
  return "Caller";
};

export const resolveHasVideo = (call = {}) => call.hasVideo !== false;

// Name shown as the big headline on the incoming call screen: the patient when
// the payload carries one, otherwise the person placing the call.
export const resolveCallDisplayName = (call = {}, fallback = "Unknown Caller") =>
  resolvePatientName(call) || resolveCallerName(call) || fallback;

// e.g. "Crew • Incoming Video Call"
export const resolveCallSubtitle = (call = {}, { isRinging = true } = {}) => {
  const roleLabel = resolveRoleLabel(resolveCallerRole(call));
  const callType = resolveHasVideo(call) ? "Video" : "Audio";
  const suffix = isRinging ? `Incoming ${callType} Call` : `${callType} Call`;
  return `${roleLabel} • ${suffix}`;
};

// Merges the resolved patient name back onto the raw socket payload so it
// survives accept/reject round trips and Jitsi hand-off.
export const withResolvedPatientName = (call = {}) => {
  if (!call || typeof call !== "object") return call;
  const patientName = resolvePatientName(call);
  if (!patientName) return call;
  return { ...call, patientName, full_name: call.full_name || patientName };
};

// Avatar for the call screen. Patient photo wins over the caller's, so the
// screen shows the patient when the payload carries one.
export const resolvePatientAvatar = (call = {}) => {
  const candidates = [
    call.patientImage,
    call.patient_image,
    call.patientPhoto,
    call.patientInfo?.image,
    call.patientInfo?.photo,
    call.patientInfo?.profile_image,
    call.callerImage,
    call.caller_image,
    call.caller?.image,
    call.caller?.photo,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
};
