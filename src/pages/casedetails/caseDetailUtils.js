/** Shared helpers — mirrors Aviation-tab-frontend CaseDetailScreen logic */

export function formatSectionKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

export function formatChiefComplaint(text) {
  if (!text) return "—";
  return text
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function cleanTimelineDescription(text = "") {
  return text
    ?.replace(/pathway\s+[a-z]\s+selected\.?/gi, "")
    ?.replace(/pathway\s+[a-z]\s+assessment\s+initiated\.?/gi, "Assessment Initiated.")
    ?.replace(/pathway\s+[a-z]\s+for\s+condition\s+identified\.?/gi, "")
    ?.replace(/\s+/g, " ")
    ?.trim();
}

export function getCommunicationSummary(timeline = []) {
  return timeline
    .map((item) =>
      item.description
        ?.replace(/pathway\s+[a-z]\s+selected\.?/gi, "")
        ?.replace(/pathway\s+[a-z]\s+assessment\s+initiated\.?/gi, "")
        ?.trim(),
    )
    .filter(Boolean)
    .join(" ");
}

export function getInitialAssessment(timeline = []) {
  return (
    timeline.find((t) => t.eventType === "CONDITION_IDENTIFIED")?.description ||
    "—"
  );
}

export function parseAiSummary(eventData) {
  const raw = eventData?.aiSummary || eventData?.summary;
  if (!raw) return null;

  const safeParse = (data) => {
    try {
      if (typeof data === "object" && data !== null) return data;
      if (typeof data === "string") {
        let cleaned = data.trim();
        if (
          (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
          (cleaned.startsWith("'") && cleaned.endsWith("'"))
        ) {
          cleaned = cleaned.slice(1, -1);
        }
        cleaned = cleaned.replace(/\\"/g, '"').replace(/\\n/g, " ");
        return JSON.parse(cleaned);
      }
      return null;
    } catch {
      return null;
    }
  };

  let result = safeParse(raw);
  if (typeof result === "string") {
    result = safeParse(result);
  }

  if (result && typeof result === "object" && !Array.isArray(result)) {
    return result;
  }
  return null;
}

export function getFinalOutcome(aiSummary, eventData) {
  const outcome = aiSummary?.outcome ?? eventData?.outcome;
  if (!outcome) return null;
  if (typeof outcome === "string") return outcome;
  if (typeof outcome === "object") {
    return outcome.description || outcome.summary || JSON.stringify(outcome);
  }
  return String(outcome);
}

export function getMedicineKey(medicine) {
  const moduleId =
    medicine?.moduleId || medicine?.moduleTitle || medicine?.moduleName || "";
  const medicineName =
    typeof medicine === "string"
      ? medicine
      : medicine?.medicineName || medicine?.name || medicine?.title || "";
  return `${moduleId}__${medicineName}`;
}

export function formatMedicineLine(medicine) {
  const name =
    typeof medicine === "string"
      ? medicine
      : medicine?.medicineName || medicine?.name || medicine?.title || "";
  return name ? `💊 ${name}` : "";
}
