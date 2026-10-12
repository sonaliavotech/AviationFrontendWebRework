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
  Snackbar,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SyncIcon from "@mui/icons-material/Sync";
import VideocamIcon from "@mui/icons-material/Videocam";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MailIcon from "@mui/icons-material/Mail";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import OpacityIcon from "@mui/icons-material/Opacity";
import AirIcon from "@mui/icons-material/Air";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ColorizeIcon from "@mui/icons-material/Colorize";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import { AlertsIcon } from "../../assets/Assets";
import { useThemeMode } from "../../context/ThemeContext";
import LoadingSpinner from "../../componants/LoadingSpinner";
import EmailReportDialog from "./EmailReportDialog";
import { flattenAiSummary } from "./reportBuilder";
import { generateReportPdf } from "../../services/reportPdf";
import { getPhysicianSession } from "../../utils/physicianSession";

const PRIMARY_BLUE = "#015DFF";
const ACTIVE_COLOR = "#4DA3FF";

// Vital card accent colors
const ACCENT = {
  heartRate: "#F97316", // orange
  bloodPressure: "#EF4444", // red
  oxygen: "#EF4444", // red
  respiratory: "#F97316", // orange
  temperature: "#F97316", // orange
  skin: "#9CA3AF", // gray
  sweating: "#9CA3AF", // gray
  ecg: "#9CA3AF", // gray
  pain: "#9CA3AF", // gray
  glucose: "#9CA3AF", // gray
  avpu: "#015DFF", // blue
};

// Helper: returns first non-null, non-empty value from a list of candidates
const pick = (...vals) => vals.find((v) => v != null && v !== "");

const VitalCard = ({ label, value, icon, accent, tokens }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: tokens.cardBg,
      border: `1px solid ${tokens.borderColor}`,
      borderLeft: `4px solid ${accent || tokens.borderColor}`,
      borderRadius: "10px",
      px: 1.5,
      py: 1.2,
      minHeight: 62,
      boxSizing: "border-box",
    }}
  >
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
      <Typography
        sx={{
          fontSize: "12px",
          color: tokens.textSecondary,
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          color: tokens.textPrimary,
          fontWeight: 600,
        }}
      >
        {value}
      </Typography>
    </Box>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: accent || tokens.textSecondary,
        opacity: 0.85,
        ml: 1,
      }}
    >
      {icon}
    </Box>
  </Box>
);

const SearchKit = () => {
  const location = useLocation();
  const incidentId = location.state?.incidentId;
  const patient = location.state?.patient;
  const { tokens, darkMode } = useThemeMode();
  const [caseData, setCaseData] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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
  const physician = getPhysicianSession();

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  const handleGeneratePdf = async () => {
    if (!caseData) {
      showSnackbar(
        "No case data loaded yet — please wait for the summary.",
        "warning",
      );
      return;
    }
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      const { buildFullReportHtml, buildReportFileName } =
        await import("./reportBuilder");
      const fileName = buildReportFileName(
        patientName,
        caseData.incidentId || incidentId,
      );
      const html = buildFullReportHtml({
        caseData,
        aiSummary,
        patient,
      });
      await generateReportPdf(html, fileName);
      showSnackbar(`Report PDF downloaded: ${fileName}`, "success");
    } catch (err) {
      console.error("PDF GENERATION ERROR =>", err);
      showSnackbar(
        "Failed to generate the report PDF. Please try again.",
        "error",
      );
    } finally {
      setPdfLoading(false);
    }
  };

  const handleEmailOpen = () => {
    if (!caseData) {
      showSnackbar(
        "No case data loaded yet — please wait for the summary.",
        "warning",
      );
      return;
    }
    setEmailOpen(true);
  };

  // ---- Vitals normalization ----
  const vitals = caseData?.vitals || {};

  // Debug: uncomment this if Skin Colour / AVPU still don't show
  // console.log("VITALS KEYS =>", Object.keys(vitals), vitals);

  const skinColourValue = pick(
    vitals.skinColour,
    vitals.skinColor,
    vitals.skin_color,
    vitals.skin,
  );

  const avpuValue = pick(
    vitals.avpu,
    vitals.avpuScore,
    vitals.avpu_score,
    vitals.avpuScale,
    vitals.avpu_scale,
  );

  const respiratoryValue = pick(
    vitals.respiratoryRate,
    vitals.respiratory_rate,
    vitals.respiratory,
    vitals.rr,
  );

  const painValue = pick(vitals.painScore, vitals.pain_score, vitals.pain);

  const glucoseValue = pick(
    vitals.bloodGlucose,
    vitals.blood_glucose,
    vitals.glucose,
  );

  const vitalItems = [
    {
      key: "heartRate",
      label: "Heart Rate",
      value: vitals.heartRate != null ? `${vitals.heartRate} bpm` : null,
      icon: <FavoriteBorderIcon fontSize="small" />,
      accent: ACCENT.heartRate,
    },
    {
      key: "bloodPressure",
      label: "Blood Pressure",
      value:
        vitals.bpSystolic != null
          ? `${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`
          : null,
      icon: <MonitorHeartIcon fontSize="small" />,
      accent: ACCENT.bloodPressure,
    },
    {
      key: "oxygen",
      label: "Oxygen",
      value: vitals.oxygen != null ? `${vitals.oxygen}%` : null,
      icon: <OpacityIcon fontSize="small" />,
      accent: ACCENT.oxygen,
    },
    {
      key: "respiratory",
      label: "Respiratory rate",
      value: respiratoryValue != null ? `${respiratoryValue} mins.` : null,
      icon: <AirIcon fontSize="small" />,
      accent: ACCENT.respiratory,
    },
    {
      key: "temperature",
      label: "Temperature",
      value: vitals.temperature != null ? `${vitals.temperature} C` : null,
      icon: <ThermostatIcon fontSize="small" />,
      accent: ACCENT.temperature,
    },
    {
      key: "skin",
      label: "Skin Colour",
      value: skinColourValue != null ? String(skinColourValue) : null,
      icon: <ColorizeIcon fontSize="small" />,
      accent: ACCENT.skin,
    },
    {
      key: "sweating",
      label: "Sweating",
      value: vitals.sweating != null ? String(vitals.sweating) : null,
      icon: <WaterDropIcon fontSize="small" />,
      accent: ACCENT.sweating,
    },
    {
      key: "ecg",
      label: "ECG",
      value: vitals.ecg != null ? String(vitals.ecg) : null,
      icon: (
        <Box component="svg" viewBox="0 0 24 12" sx={{ width: 32, height: 16 }}>
          <polyline
            points="0,6 4,6 6,2 8,10 10,6 14,6 16,3 18,9 20,6 24,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </Box>
      ),
      accent: ACCENT.ecg,
    },
    {
      key: "pain",
      label: "Pain Score",
      value: painValue != null ? `${painValue}/10` : null,
      icon: <SentimentDissatisfiedIcon fontSize="small" />,
      accent: ACCENT.pain,
    },
    {
      key: "glucose",
      label: "Blood Glucose",
      value: glucoseValue != null ? `${glucoseValue} mg/dl` : null,
      icon: <BloodtypeIcon fontSize="small" />,
      accent: ACCENT.glucose,
    },
    {
      key: "avpu",
      label: "AVPU Score",
      value: avpuValue != null ? String(avpuValue) : null,
      icon: <SentimentSatisfiedAltIcon fontSize="small" />,
      accent: ACCENT.avpu,
    },
  ].filter((v) => v.value != null && v.value !== "");

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
        {/* Left — Device Connected / Last Synced chips removed as requested */}
        {/*
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
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
              background: darkMode
                ? "rgba(77,163,255,0.15)"
                : "rgba(1,93,255,0.08)",
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
        */}

        {/* Right */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            ml: "auto",
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
          onClick={handleGeneratePdf}
          disabled={pdfLoading || loading}
          startIcon={
            pdfLoading ? (
              <LoadingSpinner size="sm" variant="inline" color="#FFFFFF" />
            ) : (
              <PictureAsPdfIcon />
            )
          }
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
            "&:disabled": {
              background: "rgba(1,93,255,0.45)",
              color: "#FFFFFF",
            },
          }}
        >
          {pdfLoading ? "Generating PDF…" : "Generate Full Report PDF"}
        </Button>

        <Button
          variant="outlined"
          onClick={handleEmailOpen}
          disabled={loading}
          startIcon={<MailIcon />}
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
          Summary of the Event
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
          }}
        >
          {loading ? (
            <LoadingSpinner
              size="sm"
              variant="inline"
              message="Generating AI summary..."
            />
          ) : (
            (() => {
              const rows = flattenAiSummary(aiSummary);
              if (!rows.length) return "—";
              return (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {rows.map((row, idx) => (
                    <Box key={idx}>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: darkMode
                            ? ACTIVE_COLOR
                            : tokens.actionIconColor,
                          mb: 0.5,
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                        }}
                      >
                        {row.label}
                      </Typography>
                      {row.value.split("\n").map((part, i) => (
                        <Typography
                          key={i}
                          sx={{
                            fontSize: "13px",
                            color: tokens.textPrimary,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {part}
                        </Typography>
                      ))}
                    </Box>
                  ))}
                </Box>
              );
            })()
          )}
        </Box>

        {/* Patient Vitals */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
          }}
        >
          <Typography
            sx={{
              color: tokens.textPrimary,
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            Patient Vitals
          </Typography>
          {caseData?.vitalsUpdatedAt && (
            <Typography
              sx={{
                color: tokens.textSecondary,
                fontSize: "13px",
              }}
            >
              Last updated {caseData.vitalsUpdatedAt}
            </Typography>
          )}
        </Box>

        {loading ? (
          <LoadingSpinner
            size="sm"
            variant="inline"
            message="Loading vitals..."
          />
        ) : vitalItems.length === 0 ? (
          <Typography
            sx={{
              color: tokens.textSecondary,
              fontSize: "13px",
            }}
          >
            No vitals available.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(5, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            {vitalItems.map((v) => (
              <VitalCard
                key={v.key}
                label={v.label}
                value={v.value}
                icon={v.icon}
                accent={v.accent}
                tokens={tokens}
              />
            ))}
          </Box>
        )}
      </Paper>

      <EmailReportDialog
        open={emailOpen}
        handleClose={() => setEmailOpen(false)}
        caseData={caseData}
        aiSummary={aiSummary}
        patient={patient}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SearchKit;
