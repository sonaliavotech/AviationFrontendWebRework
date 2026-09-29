/**
 * SearchKit — Full Report builder
 *
 * Builds the Case Outcome & Final Report as:
 *   1. a self-contained, print-ready HTML document (-> PDF)
 *   2. a plain-text version (-> email body)
 *
 * Every function here is NULL-SAFE: caseData / aiSummary / patient may be
 * null, undefined, strings or objects and nothing will throw.
 */

// ═══════════════════════════════════════════════════════════════════════
// Small utilities
// ═══════════════════════════════════════════════════════════════════════

export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** "chiefComplaint"/"chief_complaint" -> "Chief Complaint" */
export function labelize(key = "") {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Convert ANY value into plain text (never returns an object).
 * Prevents "Objects are not valid as a React child" and "[object Object]".
 */
export function toText(value) {
  if (value === null || value === undefined) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => {
        const t = toText(v);
        return t ? `${labelize(k)}: ${t}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return String(value);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  try {
    return dt.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(value);
  }
}

/** Format a raw backend answer -> friendly display string */
export function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const text = typeof value === "object" ? toText(value) : String(value);
  if (!text) return "—";
  if (/^(true|yes)$/i.test(text)) return "Yes";
  if (/^(false|no)$/i.test(text)) return "No";
  if (/^none$/i.test(text)) return "None";
  return text;
}

export function buildReportFileName(patientName, incidentId) {
  const safeName = String(patientName || "Patient")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const safeId = String(incidentId || "case").replace(/[^a-zA-Z0-9_-]/g, "");
  return `Final_Report_${safeName || "Patient"}_${safeId}.pdf`;
}

const fallback = (value, alt) =>
  value === null || value === undefined || value === "" ? alt : value;

const asObject = (v) =>
  v && typeof v === "object" && !Array.isArray(v) ? v : {};
const asArray = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

// ═══════════════════════════════════════════════════════════════════════
// AI summary normalisation
// ═══════════════════════════════════════════════════════════════════════

/**
 * The AI service can return an object, an array or a plain string.
 * Normalises to [{ label, value }] where value is ALWAYS a string.
 */
export function flattenAiSummary(aiSummary) {
  if (!aiSummary) return [];

  if (typeof aiSummary === "string") {
    const trimmed = aiSummary.trim();
    return trimmed ? [{ label: "Summary", value: trimmed }] : [];
  }

  if (Array.isArray(aiSummary)) {
    const text = toText(aiSummary);
    return text ? [{ label: "Summary", value: text }] : [];
  }

  if (typeof aiSummary !== "object") return [];

  return Object.entries(aiSummary)
    .map(([key, value]) => ({ label: labelize(key), value: toText(value) }))
    .filter((row) => row.value);
}

// ═══════════════════════════════════════════════════════════════════════
// Data gathering
// ═══════════════════════════════════════════════════════════════════════

export function collectReportData(caseData, patient) {
  const d = asObject(caseData);
  const p = asObject(patient);
  const vitals = asObject(d.vitals);

  const bpSystolic = fallback(vitals.bpSystolic, d.bpSystolic);
  const bpDiastolic = fallback(vitals.bpDiastolic, d.bpDiastolic);

  const rawAge = fallback(
    d.patientAge,
    fallback(p.age, fallback(d.patient_age, p.approx_age)),
  );
  const patientAge =
    rawAge === null || rawAge === undefined
      ? "—"
      : /y$/i.test(String(rawAge))
        ? String(rawAge)
        : `${rawAge}y`;

  const has = (x) => x !== null && x !== undefined && x !== "";

  const vitalsList = [
    {
      label: "Heart Rate",
      display: has(vitals.heartRate) ? `${vitals.heartRate} bpm` : "—",
    },
    {
      label: "Blood Pressure",
      display:
        has(bpSystolic) && has(bpDiastolic)
          ? `${bpSystolic}/${bpDiastolic} mmHg`
          : has(bpSystolic)
            ? `${bpSystolic} mmHg`
            : "—",
    },
    {
      label: "Oxygen Saturation",
      display: has(vitals.oxygen) ? `${vitals.oxygen}%` : "—",
    },
    {
      label: "Respiratory Rate",
      display: has(vitals.respiratoryRate)
        ? `${vitals.respiratoryRate} /min`
        : "—",
    },
    {
      label: "Temperature",
      display: has(vitals.temperature) ? `${vitals.temperature}°C` : "—",
    },
    {
      label: "Blood Glucose",
      display: has(vitals.bloodGlucose) ? `${vitals.bloodGlucose} mg/dL` : "—",
    },
    {
      label: "Pain Score",
      display: has(vitals.painScore) ? `${vitals.painScore}/10` : "—",
    },
    {
      label: "AVPU Score",
      display: formatValue(fallback(vitals.avpuScore, vitals.avpu)),
    },
    {
      label: "Skin Colour",
      display: formatValue(fallback(vitals.skinColor, vitals.skinColour)),
    },
    {
      label: "Sweating",
      display: formatValue(fallback(vitals.sweating, vitals.sweatingLevel)),
    },
    {
      label: "ECG Rhythm",
      display: formatValue(fallback(vitals.ecg, vitals.ecgRhythm)),
    },
  ];

  return {
    incidentId: fallback(
      d.incidentId,
      fallback(d.id, fallback(p.incidentId, p.id)),
    ),
    caseId: fallback(d.caseId, d.case_id),
    patientName: String(
      fallback(
        d.patientName,
        fallback(p.name, fallback(p.full_name, "Patient")),
      ),
    ),
    patientAge,
    gender: String(fallback(d.gender, fallback(p.gender, "—"))).trim() || "—",
    medicalHistoryKnown: d.medicalHistoryKnown,
    flight: String(
      fallback(d.flight, fallback(p.flightNumber, fallback(p.room, "—"))),
    ),
    route: String(fallback(d.route, fallback(p.location, "—"))),
    aircraft: fallback(d.aircraft, "—"),
    seat: String(fallback(d.seat, fallback(p.bed, "—"))),
    status: String(fallback(d.status, fallback(p.status, "—"))).trim() || "—",
    physician:
      String(
        fallback(d.physician, fallback(p.physician, "Not assigned")),
      ).trim() || "Not assigned",
    crewResident: String(
      fallback(d.crew, fallback(p.crew, fallback(p.resident, "—"))),
    ),
    dateTime: fallback(
      d.dateTime,
      fallback(d.incidentStartAt, fallback(p.incidentStartAt, p.dos)),
    ),
    duration: String(fallback(d.duration, fallback(p.duration, "—"))),
    chiefComplaint: String(
      fallback(d.chiefComplaint, fallback(p.chiefComplaint, "—")),
    ),
    outcome: d.outcome,
    travellingAlone: d.travellingAlone,
    medicalVolunteerType: d.medicalVolunteerType,
    medicalVolunteerName: d.medicalVolunteerName,
    groundSupportContacted: d.groundSupportContacted,
    groundSupportContactTime: d.groundSupportContactTime,
    airportMedicalNotified: d.airportMedicalNotified,
    diversionAdvised: d.diversionAdvised,
    pilotDecision: d.pilotDecision,
    vitalsList,
    vitalsRecordedAt: vitals.recordedAt,
    timeline: asArray(d.timeline),
    assessmentSteps: asArray(d.assessmentSteps),
    triageAnswers: asArray(d.triageAnswers),
    primarySurveyAnswers: asArray(d.primarySurveyAnswers),
    clinicalAssessmentAnswers: asArray(d.clinicalAssessmentAnswers),
    summaryText: toText(fallback(d.summary, d.caseSummary)),
  };
}

// ═══════════════════════════════════════════════════════════════════════
// HTML report
// ═══════════════════════════════════════════════════════════════════════

function rowHtml(label, valueHtml) {
  return `<tr><td class="k">${escapeHtml(label)}</td><td class="v">${valueHtml}</td></tr>`;
}

function answerRows(answers) {
  return Object.entries(asObject(answers))
    .map(([key, entry]) => {
      const isObj = entry !== null && typeof entry === "object";
      const q = isObj ? entry.question || labelize(key) : labelize(key);
      const a = isObj ? fallback(entry.answer, entry.finding) : entry;
      return rowHtml(q, escapeHtml(formatValue(a)));
    })
    .join("");
}

// Every selector is scoped under .report-root so nothing leaks into the app.
const STYLES = `
.report-root { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #111827; background: #ffffff; width: 100%; }
.report-root, .report-root * { box-sizing: border-box; }
.report-root .top { border-bottom: 3px solid #015DFF; padding-bottom: 10px; display: flex; justify-content: space-between; gap: 14px; }
.report-root .brand { display: flex; align-items: center; gap: 10px; }
.report-root .logo { width: 34px; height: 34px; border-radius: 9px; background: #015DFF; color: #fff; font-weight: 800; font-size: 15px; display: flex; align-items: center; justify-content: center; }
.report-root h1 { font-size: 20px; font-weight: 700; color: #0F2A52; margin: 0; }
.report-root .sub { color: #64748B; font-size: 11px; margin-top: 2px; }
.report-root .meta { text-align: right; font-size: 10.5px; color: #475569; white-space: pre-line; }
.report-root h2 { font-size: 13px; font-weight: 700; color: #0F2A52; text-transform: uppercase; letter-spacing: 0.4px; margin: 16px 0 6px; padding: 3px 8px; background: #EAF1FF; border-left: 4px solid #015DFF; }
.report-root table.kv { width: 100%; border-collapse: collapse; }
.report-root table.kv td { border: 1px solid #DDE3EC; padding: 5px 8px; font-size: 11.5px; }
.report-root table.kv td.k { width: 34%; background: #F1F5FB; color: #334155; font-weight: 600; }
.report-root .grid { width: 100%; border-collapse: collapse; }
.report-root .grid th { background: #E4EDF7; color: #1E3A5F; text-align: left; padding: 5px 8px; font-size: 10.5px; border: 1px solid #CFDAE8; }
.report-root .grid td { border: 1px solid #DDE3EC; padding: 5px 8px; font-size: 11px; }
.report-root .grid td.k { width: 34%; background: #F1F5FB; font-weight: 600; }
.report-root .case { border: 1px solid #DDE3EC; border-radius: 8px; padding: 10px 12px; background: #FBFCFE; font-size: 12px; line-height: 1.55; white-space: pre-wrap; }
.report-root .ai { margin: 0 0 8px; }
.report-root .ai-label { display: block; font-weight: 700; color: #0F2A52; font-size: 11.5px; margin-bottom: 2px; }
.report-root .ai-body { color: #374151; font-size: 11.5px; line-height: 1.5; }
.report-root h3 { font-size: 11.5px; font-weight: 700; color: #334155; margin: 10px 0 4px; }
.report-root h3 .dim { color: #94A3B8; font-weight: 400; font-size: 10.5px; }
.report-root .muted { color: #94A3B8; font-size: 11px; }
.report-root .badge { display: inline-block; padding: 1px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; background: #EAF1FF; color: #015DFF; }
.report-root .badge.critical { background: #FDECEC; color: #B91C1C; }
.report-root .badge.closed { background: #E7F6EC; color: #1D7A3C; }
.report-root .foot { margin-top: 18px; border-top: 1px solid #CBD5E1; padding-top: 6px; font-size: 9.5px; color: #94A3B8; }
.report-root .sign { margin-top: 34px; font-size: 11px; color: #475569; }
`;

/** Build the full, self-contained report HTML used for the PDF. */
export function buildFullReportHtml({ caseData, aiSummary, patient } = {}) {
  const data = collectReportData(caseData, patient);
  const aiRows = flattenAiSummary(aiSummary || asObject(caseData).aiSummary);

  const aiHtml = aiRows.length
    ? aiRows
        .map(
          (row) =>
            `<div class="ai"><span class="ai-label">${escapeHtml(row.label)}</span><div class="ai-body">${escapeHtml(
              row.value,
            ).replace(/\n/g, "<br/>")}</div></div>`,
        )
        .join("")
    : `<p class="muted">No AI summary available.</p>`;

  const timelineHtml = data.timeline.length
    ? `<table class="grid">
        <thead><tr><th>Time</th><th>Type</th><th>Event</th><th>Details</th></tr></thead>
        <tbody>${data.timeline
          .map(
            (t) =>
              `<tr><td>${escapeHtml(formatDateTime(t.createdAt || t.created_at))}</td><td>${escapeHtml(labelize(t.eventType || "event"))}</td><td>${escapeHtml(toText(t.title) || "—")}</td><td>${escapeHtml(toText(t.description) || "—")}</td></tr>`,
          )
          .join("")}</tbody></table>`
    : `<p class="muted">No timeline events recorded.</p>`;

  const assessmentHtml = data.assessmentSteps.length
    ? `<table class="grid">
        <thead><tr><th>Protocol</th><th>Step</th><th>Status</th><th>Round</th></tr></thead>
        <tbody>${data.assessmentSteps
          .map(
            (s) =>
              `<tr><td>${escapeHtml(s.groupName || s.sourceCode || "—")}</td><td>${escapeHtml(toText(s.title) || "—")}</td><td>${escapeHtml(labelize(s.status || "—"))}</td><td>${escapeHtml(String(s.roundNumber || "—"))}</td></tr>`,
          )
          .join("")}</tbody></table>`
    : `<p class="muted">No assessment steps recorded.</p>`;

  const surveyHtml = (rounds, title) =>
    rounds
      .map((round) => {
        const time = round.createdAt || round.updatedAt || round.created_at;
        const rows = answerRows(round.answers) || rowHtml("Answer", "—");
        return `<h3>${escapeHtml(`${title} — Round ${round.roundNumber || 1}`)}<span class="dim">${
          time ? ` · ${escapeHtml(formatDateTime(time))}` : ""
        }</span></h3><table class="grid">${rows}</table>`;
      })
      .join("");

  const primaryHtml = surveyHtml(data.primarySurveyAnswers, "Primary Survey");
  const clinicalHtml = surveyHtml(
    data.clinicalAssessmentAnswers,
    "Clinical Assessment",
  );
  const triageHtml = surveyHtml(data.triageAnswers, "Triage");

  const today = formatDateTime(new Date());
  const statusClass = String(data.status)
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Case Outcome &amp; Final Report</title>
<style>${STYLES}</style>
</head>
<body>
<div class="report-root">
  <div class="top">
    <div class="brand">
      <div class="logo">✈</div>
      <div>
        <h1>Case Outcome &amp; Final Report</h1>
        <div class="sub">In-Flight Medical Event · ${escapeHtml(data.flight)} · ${escapeHtml(data.route)}</div>
      </div>
    </div>
    <div class="meta">Generated: ${escapeHtml(today)}
Incident ID: ${escapeHtml(data.incidentId || "—")}
Case ID: ${escapeHtml(data.caseId || "—")}</div>
  </div>

  <h2>Patient &amp; Flight</h2>
  <table class="kv">
    ${rowHtml("Patient Name", escapeHtml(data.patientName))}
    ${rowHtml("Age", escapeHtml(data.patientAge))}
    ${rowHtml("Gender", escapeHtml(data.gender))}
    ${rowHtml("Medical History Known", escapeHtml(formatValue(data.medicalHistoryKnown)))}
    ${rowHtml("Flight", escapeHtml(data.flight))}
    ${rowHtml("Route", escapeHtml(data.route))}
    ${rowHtml("Aircraft", escapeHtml(formatValue(data.aircraft)))}
    ${rowHtml("Seat", escapeHtml(data.seat))}
  </table>

  <h2>Incident</h2>
  <table class="kv">
    ${rowHtml("Status", `<span class="badge ${escapeHtml(statusClass)}">${escapeHtml(data.status)}</span>`)}
    ${rowHtml("Chief Complaint", escapeHtml(data.chiefComplaint))}
    ${rowHtml("Started", escapeHtml(formatDateTime(data.dateTime)))}
    ${rowHtml("Duration", escapeHtml(data.duration))}
    ${rowHtml("Travelling Alone", escapeHtml(formatValue(data.travellingAlone)))}
    ${rowHtml("Treatment Outcome", escapeHtml(formatValue(data.outcome)))}
  </table>

  <h2>Medical Team</h2>
  <table class="kv">
    ${rowHtml("Assigned Physician", escapeHtml(data.physician))}
    ${rowHtml("Crew / Resident", escapeHtml(data.crewResident))}
    ${rowHtml(
      "Medical Volunteer",
      `${escapeHtml(formatValue(data.medicalVolunteerType))}${
        data.medicalVolunteerName
          ? ` (${escapeHtml(data.medicalVolunteerName)})`
          : ""
      }`,
    )}
    ${rowHtml("Ground Support Contacted", escapeHtml(formatValue(data.groundSupportContacted)))}
    ${rowHtml("Ground Support Contact Time", escapeHtml(formatDateTime(data.groundSupportContactTime)))}
    ${rowHtml("Airport Medical Notified", escapeHtml(formatValue(data.airportMedicalNotified)))}
    ${rowHtml("Diversion Advised", escapeHtml(formatValue(data.diversionAdvised)))}
    ${rowHtml("Pilot Decision", escapeHtml(formatValue(data.pilotDecision)))}
  </table>

  <h2>Patient Vitals</h2>
  <table class="grid">
    <thead><tr><th>Vital</th><th>Value</th></tr></thead>
    <tbody>${data.vitalsList
      .map(
        (v) =>
          `<tr><td>${escapeHtml(v.label)}</td><td>${escapeHtml(v.display)}</td></tr>`,
      )
      .join("")}</tbody>
  </table>
  <p class="muted">Recorded at ${escapeHtml(formatDateTime(data.vitalsRecordedAt))}</p>

  <h2>Case Summary</h2>
  <div class="case">${escapeHtml(data.summaryText || "No case summary recorded.")}</div>

  <h2>AI Summary of the Event</h2>
  ${aiHtml}

  <h2>Timeline</h2>
  ${timelineHtml}

  <h2>Assessment Steps</h2>
  ${assessmentHtml}

  ${primaryHtml ? `<h2>Primary Survey</h2>${primaryHtml}` : ""}
  ${clinicalHtml ? `<h2>Clinical Assessment</h2>${clinicalHtml}` : ""}
  ${triageHtml ? `<h2>Triage</h2>${triageHtml}` : ""}

  <div class="foot">
    This report was generated from the in-flight medical case maintained by the
    aviation telecare system. Incident ${escapeHtml(data.incidentId || "—")} · Generated on ${escapeHtml(today)}.
  </div>
  <div class="sign">Medical team signature / attestation: ______________________________</div>
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════
// Plain-text report (email body)
// ═══════════════════════════════════════════════════════════════════════

const LINE = "--------------------------------------------------------------";

function textSection(title) {
  return `\n\n» ${title.toUpperCase()}\n${LINE}`;
}

export function buildFullReportText({ caseData, aiSummary, patient } = {}) {
  const data = collectReportData(caseData, patient);
  const aiRows = flattenAiSummary(aiSummary || asObject(caseData).aiSummary);

  const lines = [];
  lines.push("CASE OUTCOME & FINAL REPORT");
  lines.push(LINE);
  lines.push(
    `Patient:   ${data.patientName}  (${data.gender}, ${data.patientAge})`,
  );
  lines.push(
    `Flight:    ${data.flight}  |  ${data.route}  |  Seat ${data.seat}`,
  );
  lines.push(`Incident:  ${data.incidentId || "—"}`);
  lines.push(`Case:      ${data.caseId || "—"}`);

  lines.push(textSection("Incident"));
  lines.push(`Status:              ${data.status}`);
  lines.push(`Chief Complaint:     ${data.chiefComplaint}`);
  lines.push(`Started:             ${formatDateTime(data.dateTime)}`);
  lines.push(`Duration:            ${data.duration}`);
  lines.push(`Travelling Alone:    ${formatValue(data.travellingAlone)}`);
  lines.push(`Treatment Outcome:   ${formatValue(data.outcome)}`);

  lines.push(textSection("Medical Team"));
  lines.push(`Assigned Physician:  ${data.physician}`);
  lines.push(`Crew / Resident:     ${data.crewResident}`);
  lines.push(
    `Medical Volunteer:   ${formatValue(data.medicalVolunteerType)}${
      data.medicalVolunteerName ? ` (${data.medicalVolunteerName})` : ""
    }`,
  );
  lines.push(
    `Ground Support:      ${formatValue(data.groundSupportContacted)}${
      data.groundSupportContactTime
        ? ` at ${formatDateTime(data.groundSupportContactTime)}`
        : ""
    }`,
  );
  lines.push(
    `Airport Medical:     ${formatValue(data.airportMedicalNotified)}`,
  );
  lines.push(`Diversion Advised:   ${formatValue(data.diversionAdvised)}`);
  lines.push(`Pilot Decision:      ${formatValue(data.pilotDecision)}`);

  lines.push(textSection("Patient Vitals"));
  data.vitalsList.forEach((v) =>
    lines.push(`${v.label.padEnd(22)} ${v.display}`),
  );
  lines.push(`Recorded at:         ${formatDateTime(data.vitalsRecordedAt)}`);

  lines.push(textSection("Case Summary"));
  lines.push(data.summaryText || "No case summary recorded.");

  lines.push(textSection("AI Summary of the Event"));
  if (aiRows.length) {
    aiRows.forEach((row) => {
      lines.push(`${row.label}:`);
      row.value.split("\n").forEach((part) => lines.push(`  • ${part}`));
    });
  } else {
    lines.push("No AI summary available.");
  }

  if (data.timeline.length) {
    lines.push(textSection("Timeline"));
    data.timeline.forEach((t) => {
      const desc = toText(t.description);
      lines.push(
        `${formatDateTime(t.createdAt || t.created_at)}  |  ${labelize(t.eventType || "event")}  |  ${toText(t.title) || "—"}${desc ? ` — ${desc}` : ""}`,
      );
    });
  }

  if (data.assessmentSteps.length) {
    lines.push(textSection("Assessment Steps"));
    data.assessmentSteps.forEach((s) =>
      lines.push(
        `[${labelize(s.status || "—")}] ${s.groupName || s.sourceCode || "—"} → ${toText(s.title) || "—"} (Round ${s.roundNumber || "—"})`,
      ),
    );
  }

  const appendSurvey = (label, rounds) => {
    if (!rounds.length) return;
    lines.push(textSection(label));
    rounds.forEach((round) => {
      lines.push(
        `Round ${round.roundNumber || 1}${round.createdAt ? ` · ${formatDateTime(round.createdAt)}` : ""}`,
      );
      Object.entries(asObject(round.answers)).forEach(([key, entry]) => {
        const isObj = entry !== null && typeof entry === "object";
        const q = isObj ? entry.question || labelize(key) : labelize(key);
        const a = isObj ? fallback(entry.answer, entry.finding) : entry;
        lines.push(`  ${q}: ${formatValue(a)}`);
      });
    });
  };
  appendSurvey("Primary Survey", data.primarySurveyAnswers);
  appendSurvey("Clinical Assessment", data.clinicalAssessmentAnswers);
  appendSurvey("Triage", data.triageAnswers);

  lines.push(`\n${LINE}`);
  lines.push(`Generated ${formatDateTime(new Date())}`);
  lines.push("This report was produced by the aviation telecare system.");

  return lines.join("\n");
}
