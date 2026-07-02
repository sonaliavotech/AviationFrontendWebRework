import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import LoadingSpinner from "../../componants/LoadingSpinner";
import AiSummaryCard from "./AiSummaryCard";
import {
  formatChiefComplaint,
  cleanTimelineDescription,
  getCommunicationSummary,
  getInitialAssessment,
  getFinalOutcome,
} from "./caseDetailUtils";

const cardSx = (darkMode) => ({
  background: darkMode ? "#111827" : "#FFFFFF",
  border: `1px solid ${darkMode ? "#1F2937" : "#E5E7EB"}`,
  borderRadius: "12px",
  p: "16px",
});

const headingSx = (darkMode) => ({
  fontSize: "14px",
  fontWeight: 700,
  color: darkMode ? "#F8FAFC" : "#111827",
  mb: "8px",
});

const bodySx = (darkMode) => ({
  fontSize: "13px",
  lineHeight: 1.75,
  color: darkMode ? "#CBD5E1" : "#374151",
});

const EventSummaryPanel = ({
  eventData,
  loadingEvent,
  loadingEcg,
  ecgFiles,
  recommendedMedicines,
  aiSummary,
  darkMode,
  onBack,
  onEcgClick,
}) => {
  if (loadingEvent) {
    return (
      <LoadingSpinner
        variant="section"
        size="lg"
        message="Loading case details..."
      />
    );
  }

  const timeline = eventData?.timeline || [];
  const finalOutcome = getFinalOutcome(aiSummary, eventData);

  const quickInfo = [
    ["Patient", `${eventData?.patientName || "—"}, ${eventData?.patientAge || "—"} yrs`],
    ["Flight", eventData?.flight || "—"],
    ["Route", eventData?.route || "—"],
    ["Seat", eventData?.seat || "—"],
    ["Aircraft", eventData?.aircraft || "—"],
    ["Status", eventData?.status || "—"],
    ["Physician", eventData?.physician?.trim() || "Not Assigned"],
    [
      "Date & Time",
      eventData?.dateTime ? new Date(eventData.dateTime).toLocaleString() : "—",
    ],
    ["Duration", eventData?.duration || "—"],
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "14px", pb: "40px" }}>
      {/* Event Notes */}
      <Box sx={cardSx(darkMode)}>
        <Typography sx={{ ...headingSx(darkMode), mb: "12px" }}>Event Notes</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
            gap: "8px",
          }}
        >
          {quickInfo.map(([label, value]) => (
            <Box
              key={label}
              sx={{
                background: darkMode ? "#0F172A" : "#F8FAFC",
                borderRadius: "8px",
                p: "10px",
              }}
            >
              <Typography sx={{ fontSize: "10px", color: darkMode ? "#94A3B8" : "#64748B", mb: "4px" }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: "12px", fontWeight: 500, color: darkMode ? "#F8FAFC" : "#111827" }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Chief Complaint */}
      <Box sx={cardSx(darkMode)}>
        <Typography sx={headingSx(darkMode)}>Chief Complaint</Typography>
        <Typography sx={bodySx(darkMode)}>
          {formatChiefComplaint(eventData?.chiefComplaint)}
        </Typography>
      </Box>

      {/* Initial Assessment */}
      <Box sx={cardSx(darkMode)}>
        <Typography sx={headingSx(darkMode)}>Initial Assessment</Typography>
        <Typography sx={bodySx(darkMode)}>{getInitialAssessment(timeline)}</Typography>
      </Box>

      {/* Timeline */}
      <Typography sx={{ ...headingSx(darkMode), mt: "4px" }}>Timeline of Events</Typography>
      {timeline.map((item, idx) => (
        <Box key={idx} sx={{ display: "flex", gap: "12px" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: "6px" }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: "#0A5FFF" }} />
            {idx !== timeline.length - 1 && (
              <Box sx={{ width: 2, flex: 1, background: darkMode ? "#1F2937" : "#E5E7EB", my: "4px" }} />
            )}
          </Box>
          <Box sx={{ ...cardSx(darkMode), flex: 1, mb: "8px" }}>
            <Typography sx={{ fontSize: "11px", color: darkMode ? "#94A3B8" : "#64748B", mb: "4px" }}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "—"}
            </Typography>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: darkMode ? "#F8FAFC" : "#111827", mb: "4px" }}>
              {item.title}
            </Typography>
            <Typography sx={bodySx(darkMode)}>
              {cleanTimelineDescription(item.description) || "—"}
            </Typography>
          </Box>
        </Box>
      ))}

      {/* Treatment & Interventions */}
      <Box sx={cardSx(darkMode)}>
        <Typography sx={headingSx(darkMode)}>Treatment & Interventions</Typography>
        {(eventData?.assessmentSteps || []).length > 0 ? (
          (eventData.assessmentSteps || []).map((step, idx) => (
            <Box key={idx} sx={{ display: "flex", gap: "8px", alignItems: "flex-start", mb: "6px" }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#0A5FFF", mt: "7px", flexShrink: 0 }} />
              <Typography sx={bodySx(darkMode)}>{step.title}</Typography>
            </Box>
          ))
        ) : (
          <Typography sx={bodySx(darkMode)}>—</Typography>
        )}
      </Box>

      {/* Communication Summary */}
      <Box sx={cardSx(darkMode)}>
        <Typography sx={headingSx(darkMode)}>Communication Summary</Typography>
        <Typography sx={bodySx(darkMode)}>
          {getCommunicationSummary(timeline) || "—"}
        </Typography>
      </Box>

      {/* Recommended Medicines */}
      <Box sx={cardSx(darkMode)}>
        <Typography sx={headingSx(darkMode)}>Recommended Medicines</Typography>
        {recommendedMedicines.length > 0 ? (
          recommendedMedicines.map((medicine, index) => {
            const moduleTitle = medicine?.moduleTitle
              ? medicine.moduleTitle.replace(/:\s*$/, "")
              : "Unassigned Module";
            const medicineName =
              typeof medicine === "string"
                ? medicine
                : medicine?.medicineName || medicine?.name || medicine?.title || "";
            return (
              <Box
                key={`${moduleTitle}-${medicineName}-${index}`}
                sx={{
                  background: "rgba(10,95,255,0.12)",
                  borderRadius: "8px",
                  px: "12px",
                  py: "8px",
                  mb: "6px",
                }}
              >
                <Typography sx={bodySx(darkMode)}>
                  {moduleTitle}: {medicineName}
                </Typography>
              </Box>
            );
          })
        ) : (
          <Typography sx={{ fontSize: "13px", color: darkMode ? "#94A3B8" : "#64748B" }}>
            No medicines recommended yet.
          </Typography>
        )}
      </Box>

      {/* ECG Reports */}
      <Box sx={cardSx(darkMode)}>
        <Typography sx={headingSx(darkMode)}>ECG Reports</Typography>
        {loadingEcg ? (
          <LoadingSpinner size="sm" variant="inline" message="Loading ECG..." />
        ) : ecgFiles.length > 0 ? (
          ecgFiles.map((item, index) => (
            <Box
              key={item.id || index}
              onClick={() => onEcgClick?.(item)}
              sx={{
                p: "12px",
                borderRadius: "10px",
                mb: "8px",
                background: "rgba(10,95,255,0.12)",
                cursor: "pointer",
                "&:hover": { background: "rgba(10,95,255,0.2)" },
              }}
            >
              <Typography sx={{ color: "#0A5FFF", fontWeight: 600, fontSize: "13px" }}>
                📄 {item.file_name}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography sx={bodySx(darkMode)}>No ECG reports available</Typography>
        )}
      </Box>

      {/* AI Event Summary */}
      <AiSummaryCard aiSummary={aiSummary} darkMode={darkMode} />

      {/* Final Outcome */}
      {finalOutcome && (
        <Box
          sx={{
            ...cardSx(darkMode),
            background: darkMode ? "#052E16" : "#ECFDF5",
            borderColor: darkMode ? "#14532D" : "#A7F3D0",
            mt: "20px",
          }}
        >
          <Typography sx={{ ...headingSx(darkMode), color: darkMode ? "#BBF7D0" : "#065F46" }}>
            Final Outcome
          </Typography>
          <Typography sx={{ ...bodySx(darkMode), color: darkMode ? "#D1FAE5" : "#065F46" }}>
            {finalOutcome}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-start", mt: "8px" }}>
        <Button
          onClick={onBack}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            borderColor: darkMode ? "#374151" : "#E5E7EB",
            color: darkMode ? "#F8FAFC" : "#111827",
          }}
        >
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default EventSummaryPanel;
