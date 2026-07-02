import { Box, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { formatSectionKey } from "./caseDetailUtils";

const AiSummaryCard = ({ aiSummary, darkMode }) => {
  if (!aiSummary) return null;

  const cardBg = darkMode ? "#111827" : "#F8F9FE";
  const border = darkMode ? "#1F2937" : "#E5E7EB";
  const heading = darkMode ? "#F8FAFC" : "#111827";
  const body = darkMode ? "#CBD5E1" : "#374151";
  const label = darkMode ? "#94A3B8" : "#64748B";
  const value = darkMode ? "#F8FAFC" : "#111827";

  const renderSectionValue = (sectionKey, sectionValue) => {
    if (Array.isArray(sectionValue)) {
      return sectionValue.map((item, idx) => (
        <Typography key={idx} sx={{ fontSize: "13px", lineHeight: 1.6, mb: "4px", color: body }}>
          • {typeof item === "object" ? item.description || "—" : String(item)}
        </Typography>
      ));
    }

    if (typeof sectionValue === "object" && sectionValue !== null) {
      return Object.entries(sectionValue).map(([key, val]) => {
        if (
          sectionKey === "chiefComplaint" &&
          ["symptoms", "symptomsReported", "symptoms_reported"].includes(key)
        ) {
          return null;
        }

        let displayValue = val;
        if (key.toLowerCase().includes("age") && val != null) {
          displayValue = `${val} years`;
        }
        if (["incidentTimestamp", "dateTime", "recordedAt"].includes(key) && val) {
          displayValue = new Date(val).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        }
        if (typeof displayValue === "string" && displayValue.includes("_")) {
          displayValue = displayValue
            .replaceAll("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        }
        if (Array.isArray(displayValue)) displayValue = displayValue.join(", ");
        if (typeof displayValue === "object" && displayValue !== null) {
          displayValue = displayValue.description || JSON.stringify(displayValue);
        }

        return (
          <Typography key={key} sx={{ fontSize: "13px", lineHeight: 1.6, mb: "4px", color: body }}>
            <Box component="span" sx={{ fontWeight: 600, color: label }}>
              {formatSectionKey(key)}:{" "}
            </Box>
            <Box component="span" sx={{ fontWeight: 500, color: value }}>
              {displayValue ?? "—"}
            </Box>
          </Typography>
        );
      });
    }

    return (
      <Typography sx={{ fontSize: "13px", lineHeight: 1.6, color: body }}>
        {String(sectionValue)}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        background: cardBg,
        border: `1px solid ${border}`,
        borderRadius: "12px",
        p: "16px",
        mt: "16px",
        mb: "16px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "12px" }}>
        <AutoAwesomeIcon sx={{ fontSize: 18, color: "#0A5FFF" }} />
        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: heading }}>
          AI Event Summary
        </Typography>
      </Box>

      {Object.entries(aiSummary).map(([sectionKey, sectionValue]) => (
        <Box key={sectionKey} sx={{ mb: "14px" }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, mb: "6px", color: heading }}>
            {formatSectionKey(sectionKey)}
          </Typography>
          {renderSectionValue(sectionKey, sectionValue)}
        </Box>
      ))}
    </Box>
  );
};

export default AiSummaryCard;
