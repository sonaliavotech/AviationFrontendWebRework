import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCaseSummary, generateAiSummary } from "../../services/api";
import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SyncIcon from "@mui/icons-material/Sync";
import VideocamIcon from "@mui/icons-material/Videocam";
import { AlertsIcon } from "../../assets/Assets";
import { useThemeMode } from "../../context/ThemeContext";
import LoadingSpinner from "../../componants/LoadingSpinner";

const PRIMARY_BLUE  = "#015DFF";
const ACTIVE_COLOR  = "#4DA3FF";

const SearchKit = () => {
  const location = useLocation();
  const incidentId = location.state?.incidentId;
  const patient = location.state?.patient;
  const { tokens, darkMode } = useThemeMode();
  const [caseData, setCaseData] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!incidentId) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getCaseSummary(incidentId);
        setCaseData(data);
        const summary = await generateAiSummary(data);
        setAiSummary(summary);
      } catch (err) {
        console.error("OUTCOME SCREEN ERROR =>", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [incidentId]);

  const patientName = caseData?.patientName || patient?.name || "Patient";

  return (
    <Box
      sx={{
        minHeight: { xs: "100dvh", md: "100vh" },
        background: tokens.pageBg,
        p: { xs: 2, sm: 3, md: 4 },
        boxSizing: "border-box",
        transition: "background 0.3s",
      }}
    >
      {/* Top Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}
      >
        {/* Left */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Chip
            icon={<CheckCircleIcon sx={{ color: "#22C55E !important" }} />}
            label="Device Connected"
            sx={{
              background: "rgba(34,197,94,0.15)",
              color: "#22C55E",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "30px",
              height: 42,
              fontWeight: 500,
            }}
          />

          <Chip
            icon={<SyncIcon sx={{ color: `${ACTIVE_COLOR} !important` }} />}
            label="Last Synced Today 12:00 PM"
            sx={{
              background: darkMode ? "rgba(77,163,255,0.15)" : "rgba(1,93,255,0.08)",
              color: darkMode ? "#BFD8FF" : tokens.actionIconColor,
              border: darkMode
                ? "1px solid rgba(77,163,255,0.25)"
                : "1px solid rgba(1,93,255,0.2)",
              borderRadius: "30px",
              height: 42,
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Right */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Tooltip title="Join Video Call" arrow>
            <Button
              variant="contained"
              startIcon={<VideocamIcon />}
              sx={{
                background: PRIMARY_BLUE,
                borderRadius: "14px",
                textTransform: "none",
                px: 3,
                height: 44,
                fontWeight: 600,
                boxShadow: "0px 4px 15px rgba(1,93,255,0.35)",
                "&:hover": {
                  background: "#0048CC",
                },
              }}
            >
              Join Now
            </Button>
          </Tooltip>

          <Tooltip title="Alerts" arrow>
            <IconButton
              sx={{
                width: 46,
                height: 46,
                background: PRIMARY_BLUE,
                borderRadius: "12px",
                boxShadow: "0px 4px 15px rgba(1,93,255,0.35)",
                "&:hover": {
                  background: "#0048CC",
                },
              }}
            >
              <AlertsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Heading */}
      <Typography
        sx={{
          fontSize: { xs: "24px", md: "30px" },
          fontWeight: 600,
          color: tokens.textPrimary,
          mb: 1,
          transition: "color 0.3s",
        }}
      >
        Case Outcome & Final Report
      </Typography>

      <Typography
        sx={{
          color: tokens.textSecondary,
          fontSize: { xs: "14px", md: "16px" },
          mb: 4,
          maxWidth: "900px",
          transition: "color 0.3s",
        }}
      >
        Choose the option that best describes what happened. This will become
        the official record for the medical team.
      </Typography>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}
      >
        <Button
          variant="contained"
          sx={{
            background: PRIMARY_BLUE,
            borderRadius: "12px",
            textTransform: "none",
            px: 3,
            py: 1.4,
            fontWeight: 600,
            boxShadow: "0px 4px 15px rgba(1,93,255,0.35)",
            "&:hover": {
              background: "#0048CC",
            },
          }}
        >
          Generate Full Report PDF
        </Button>

        <Button
          variant="outlined"
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            px: 3,
            py: 1.4,
            fontWeight: 600,
            borderColor: ACTIVE_COLOR,
            color: ACTIVE_COLOR,
            "&:hover": {
              borderColor: ACTIVE_COLOR,
              background: "rgba(77,163,255,0.08)",
            },
          }}
        >
          Email Final Report
        </Button>
      </Box>

      {/* Summary Card */}
      <Paper
        elevation={0}
        sx={{
          background: tokens.cardBg,
          borderRadius: "20px",
          p: 3,
          border: `1px solid ${tokens.borderColor}`,
          transition: "background 0.3s, border 0.3s",
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            background: tokens.inputBg,
            border: `1px solid ${tokens.borderColor}`,
            borderRadius: "12px",
            p: 1.5,
            mb: 2,
            transition: "background 0.3s",
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              color: tokens.textPrimary,
              transition: "color 0.3s",
            }}
          >
            Case Summary for {patientName}
          </Typography>
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            border: `1px solid ${tokens.borderColor}`,
            borderRadius: "12px",
            minHeight: { xs: 100, sm: 120, md: 180 },
            background: tokens.inputBg,
            p: 3,
            transition: "background 0.3s",
            color: tokens.textPrimary,
            fontSize: "14px",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {loading ? (
            <LoadingSpinner
              variant="section"
              size="md"
              message="Loading case summary..."
              sx={{ py: 3 }}
            />
          ) : (
            caseData?.summary ||
            "Select a case from All Events → View report to load data."
          )}
        </Box>
        <Typography
          sx={{
            mt: 4,
            color: darkMode ? ACTIVE_COLOR : tokens.actionIconColor,
            fontSize: "16px",
            fontWeight: 500,
            mb: 2,
          }}
        >
          AI Summary of the Event
        </Typography>
        <Box
          sx={{
            border: `1px solid ${tokens.borderColor}`,
            borderRadius: "12px",
            background: tokens.inputBg,
            p: 2,
            mb: 3,
            color: tokens.textPrimary,
            fontSize: "14px",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {loading ? (
            <LoadingSpinner
              size="sm"
              variant="inline"
              message="Generating AI summary..."
            />
          ) : (
            aiSummary || "—"
          )}
        </Box>
        <Typography
          sx={{
            color: darkMode ? ACTIVE_COLOR : tokens.actionIconColor,
            fontSize: "16px",
            fontWeight: 500,
            mb: 1,
          }}
        >
          Patient Vitals
        </Typography>
        {caseData?.vitals && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, color: tokens.textSecondary, fontSize: "13px" }}>
            {caseData.vitals.heartRate != null && <span>HR: {caseData.vitals.heartRate} bpm</span>}
            {caseData.vitals.oxygen != null && <span>SpO₂: {caseData.vitals.oxygen}%</span>}
            {caseData.vitals.bpSystolic != null && (
              <span>BP: {caseData.vitals.bpSystolic}/{caseData.vitals.bpDiastolic}</span>
            )}
            {caseData.vitals.temperature != null && <span>Temp: {caseData.vitals.temperature}°C</span>}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SearchKit;
