/**
 * Aviation Web — API service
 *
 * USE LIVE URLs (same as tab app). Do NOT use localhost unless backend dev says so.
 *
 * Base:  https://api.tiatele.databin.in/api
 * ECG:   https://api.tiatele.databin.in/api/ecg/:incidentId  (same as tab)
 * AI:    https://aisum.databin.in/case-summary  (separate service)
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.tiatele.databin.in/api";

const AI_SUMMARY_URL =
  import.meta.env.VITE_AI_SUMMARY_URL || "https://aisum.databin.in/case-summary";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }
  return json;
}

// ─── 1. All Events table ───────────────────────────────────────────────────
/** GET /api/new-incidents — load events table */
export async function getMedicalIncidents() {
  const json = await request(`${API_BASE_URL}/new-incidents`);
  return json.data || [];
}

// ─── 2. Assign physician ───────────────────────────────────────────────────
/** GET /api/physicians — doctor list for assign modal */
export async function getPhysicians() {
  const json = await request(`${API_BASE_URL}/physicians`);
  return json.data || [];
}

/** PATCH /api/medical-incidents/:id/assign-physician */
export async function assignPhysician(incidentId, physicianId) {
  return request(
    `${API_BASE_URL}/medical-incidents/${incidentId}/assign-physician`,
    {
      method: "PATCH",
      body: JSON.stringify({ physicianId }),
    },
  );
}

/** POST /api/case-logs/:id — log after physician assign */
export async function createCaseLog(incidentId, logData) {
  return request(`${API_BASE_URL}/case-logs/${incidentId}`, {
    method: "POST",
    body: JSON.stringify(logData),
  });
}

// ─── 3. Case detail / report / outcome ─────────────────────────────────────
/** GET /api/:incidentId — full case (timeline, vitals, assessment steps) */
export async function getCaseSummary(incidentId) {
  const json = await request(`${API_BASE_URL}/${incidentId}`);
  return json.data;
}

/** GET /api/vitals/:incidentId — vitals only */
export async function getVitals(incidentId) {
  const json = await request(`${API_BASE_URL}/vitals/${incidentId}`);
  return json.data;
}

/** POST aisum — generate AI summary text */
export async function generateAiSummary(caseData) {
  const json = await request(AI_SUMMARY_URL, {
    method: "POST",
    body: JSON.stringify({ data: caseData }),
  });
  return json.summary || "";
}

// ─── 4. ECG ────────────────────────────────────────────────────────────────
/** GET /api/ecg/:incidentId — same as tab CaseDetailScreen */
export async function getEcgFiles(incidentId) {
  const json = await request(`${API_BASE_URL}/ecg/${incidentId}`);
  return json.ecgs || [];
}

// ─── 5. Login ──────────────────────────────────────────────────────────────
/** POST /api/auth/login — crew kit login */
export async function crewLogin({ company_name, tail_number, kit_number, secure_access_code }) {
  return request(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ company_name, tail_number, kit_number, secure_access_code }),
  });
}

/** POST /api/auth/physician-login — same as tab LoginScreen */
export async function physicianLogin({
  email,
  password,
  deviceId,
  deviceToken,
  platform,
  apn_token,
}) {
  const response = await fetch(`${API_BASE_URL}/auth/physician-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      deviceId,
      deviceToken,
      platform,
      apn_token,
    }),
  });

  const responseText = await response.text();
  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(
      `Server returned invalid response (${response.status}). Check API URL: ${API_BASE_URL}`,
    );
  }

  if (!response.ok || !data.success) {
    throw new Error(data?.message || "Invalid email or password.");
  }

  return data;
}

// ─── 6. Future / workflow APIs (same backend, use when screen is ready) ───
export async function updateChiefComplaint(incidentId, chiefComplaint) {
  return request(`${API_BASE_URL}/${incidentId}/chief-complaint`, {
    method: "PUT",
    body: JSON.stringify({ chiefComplaint }),
  });
}

export async function updateIncidentOutcome(incidentId, outcomeData) {
  return request(`${API_BASE_URL}/${incidentId}/incident-outcome`, {
    method: "PUT",
    body: JSON.stringify(outcomeData),
  });
}

export async function saveAssessmentAction(payload) {
  return request(`${API_BASE_URL}/assessment-action`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Same helper as tab EventsScreenTable */
export function getCaseDuration(incidentStartedAt) {
  if (!incidentStartedAt) return "Just now";
  const started = new Date(incidentStartedAt).getTime();
  const diffMinutes = Math.max(0, Math.floor((Date.now() - started) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes === 1) return "1 min ago";
  return `${diffMinutes} mins ago`;
}

/** Prefer API duration string; fall back to computed minutes. */
export function getCaseDurationFromIncident(incident) {
  if (incident?.duration) return incident.duration;
  if (incident?.case_duration) return incident.case_duration;
  return getCaseDuration(incident?.incident_start_at);
}

/**
 * Map API incident (nested or flat) → AllEvents table row.
 * Matches tab EventsScreenTable formatting.
 */
export function mapIncidentToTableRow(incident) {
  const patient = incident?.patient || {};
  const flight = incident?.flight || {};
  const physician = incident?.physician || {};
  const crew = incident?.crew || {};

  const physicianId =
    physician.id ||
    incident.physician_id ||
    incident.assigned_physician_id ||
    null;

  const physicianName = (
    physician.name ||
    incident.physician_name ||
    incident.assigned_physician_name ||
    ""
  ).trim();

  const origin = flight.origin_iata || incident.origin_iata || null;
  const dest = flight.destination_iata || incident.destination_iata || null;
  const seat = `${incident.seat_row || ""}${incident.seat_letter || ""}`.trim();
  const approxAge =
    patient.approx_age ?? incident.approx_age ?? incident.approxAge ?? null;
  const gender = patient.gender || incident.gender || "NA";
  const patientId = patient.id || incident.patient_id || null;
  const patientName =
    patient.full_name ||
    incident.patient_name ||
    incident.full_name ||
    incident.fullName ||
    "NA";
  const flightNumber = flight.flight_number || incident.flight_number || "NA";
  const crewName =
    crew.name ||
    incident.crew_name ||
    incident.crew_username ||
    incident.crewName ||
    "NA";

  return {
    id: incident.id || incident.incident_id,
    incidentId: incident.id || incident.incident_id,
    encounterId: incident.id || incident.incident_id,
    patientDbId: patientId,
    room: flightNumber,
    bed: seat || "NA",
    name: patientName,
    age: approxAge != null ? `${approxAge}y` : "NA",
    gender,
    mrn: patientId || "NA",
    status: incident.status || "NA",
    duration: getCaseDurationFromIncident(incident),
    location: origin && dest ? `${origin} → ${dest}` : incident.route || "NA",
    physician: physicianName,
    providerId: physicianId || "",
    physicianStatus: physicianId ? "named" : "assign",
    crew: crewName,
    resident: crewName,
    chiefComplaint: incident.chief_complaint,
    caseId: incident.case_id,
    incidentStartAt: incident.incident_start_at,
    dos: incident.incident_start_at || incident.created_at || null,
    flightNumber,
    originIata: origin,
    destinationIata: dest,
    seat: seat || "NA",
    crewId: crew.id || incident.crew_id || null,
    physicianId,
    vitals: incident.vitals || null,
    chatRoomId: incident.chat_room_id || null,
  };
}

/** Map GET /api/physicians item → assign modal option (tab AssignPhysicianModal) */
export function mapPhysicianFromApi(doctor) {
  const name = [doctor.first_name, doctor.last_name].filter(Boolean).join(" ").trim();
  return {
    id: doctor.id,
    name: name || doctor.name || "Unknown",
    specialty: doctor.specialty || "Physician",
    status: "Available",
    isProvider: true,
    isPcpPhysician: true,
    isAdmittingPhysician: false,
    isResident: false,
  };
}

/** Format vitals for ViewReport / Action2 panels */
export function mapVitalsToPatientData(caseData, tableRow) {
  const v = caseData?.vitals || {};
  const bp =
    v.bpSystolic != null && v.bpDiastolic != null
      ? `${v.bpSystolic}/${v.bpDiastolic} mmHg`
      : "—";
  const genderChar = (caseData?.patientAge != null && tableRow?.gender)
    ? String(tableRow.gender).charAt(0).toUpperCase()
    : tableRow?.gender?.charAt(0)?.toUpperCase() || "—";

  return {
    patient: {
      name: caseData?.patientName || tableRow?.name || "—",
      age: caseData?.patientAge ?? tableRow?.age?.replace("y", "") ?? "—",
      gender: genderChar,
      flight: caseData?.flight || tableRow?.flightNumber || tableRow?.room || "—",
      origin: caseData?.route?.split("→")?.[0]?.trim() || tableRow?.originIata || "",
      destination: caseData?.route?.split("→")?.[1]?.trim() || tableRow?.destinationIata || "",
    },
    vitals: {
      heartRate: { value: v.heartRate ?? null, display: v.heartRate != null ? `${v.heartRate} bpm` : "—", key: "heartRate" },
      sweating: { value: null, display: v.sweating || "—", key: null },
      bloodPressure: { value: null, display: bp, key: null },
      ecg: { value: null, display: v.ecg || "—", key: null },
      oxygen: { value: v.oxygen ?? null, display: v.oxygen != null ? `${v.oxygen}%` : "—", key: "oxygen" },
      painScore: { value: v.painScore ?? null, display: v.painScore != null ? `${v.painScore}/10` : "—", key: "painScore" },
      respiratoryRate: { value: v.respiratoryRate ?? null, display: v.respiratoryRate != null ? `${v.respiratoryRate} mins.` : "—", key: "respiratoryRate" },
      bloodGlucose: { value: v.bloodGlucose ?? null, display: v.bloodGlucose != null ? `${v.bloodGlucose} mg/dl` : "—", key: "bloodGlucose" },
      temperature: { value: v.temperature ?? null, display: v.temperature != null ? `${v.temperature} C` : "—", key: "temperature" },
      avpu: { value: v.avpuScore ?? null, display: v.avpuScore != null ? String(v.avpuScore) : "—", key: "avpu" },
      skinColour: { value: null, display: v.skinColor || "—", key: null },
    },
  };
}

export { API_BASE_URL, AI_SUMMARY_URL };
