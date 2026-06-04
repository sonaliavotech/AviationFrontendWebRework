import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import {
  HeartRateIcon,
  SweatingIcon,
  BloodPressureIcon,
  OxygenIcon,
  PainScoreIcon,
  RespiratoryRateIcon,
  BloodGlucoseIcon,
  TemperatureIcon,
  AVPUIcon,
  SkinColorIcon,
  ECGIcon,
} from "../../assets/Assets";

const THRESHOLDS = {
  heartRate:       { dangerLow: 40,  dangerHigh: 130, warningLow: 50,  warningHigh: 110 },
  oxygen:          { dangerLow: 85,  dangerHigh: null, warningLow: 90, warningHigh: null },
  respiratoryRate: { dangerLow: null, dangerHigh: 30,  warningLow: null, warningHigh: 25 },
  temperature:     { dangerLow: 32,  dangerHigh: 39,  warningLow: 34,  warningHigh: 38 },
  painScore:       { dangerLow: null, dangerHigh: 8,  warningLow: null, warningHigh: 6 },
  bloodGlucose:    { dangerLow: 50,  dangerHigh: 200, warningLow: 60,  warningHigh: 180 },
  avpu:            { dangerLow: 8,   dangerHigh: null, warningLow: 12, warningHigh: null },
};

const getVariant = (key, val) => {
  const t = THRESHOLDS[key];
  if (!t || val === null || val === undefined) return "normal";
  const { dangerLow, dangerHigh, warningLow, warningHigh } = t;
  if ((dangerLow  !== null && val < dangerLow)  || (dangerHigh !== null && val > dangerHigh))  return "danger";
  if ((warningLow !== null && val < warningLow) || (warningHigh !== null && val > warningHigh)) return "warning";
  return "normal";
};

const DEFAULT_VITALS = {
  patient: { name: "John Smith", age: 58, gender: "M", flight: "AA1234", origin: "SYD", destination: "LAX" },
  vitals: {
    heartRate:       { value: 88,   display: "88 bpm",      key: "heartRate" },
    sweating:        { value: null, display: "Mild",        key: null },
    bloodPressure:   { value: null, display: "135/85 mmHg", key: null },
    ecg:             { value: null, display: "Sinus",       key: null },
    oxygen:          { value: 80,   display: "80%",         key: "oxygen" },
    painScore:       { value: 6,    display: "6/10",        key: "painScore" },
    respiratoryRate: { value: 24,   display: "24 mins.",    key: "respiratoryRate" },
    bloodGlucose:    { value: 100,  display: "100 mg/dl",   key: "bloodGlucose" },
    temperature:     { value: 34.5, display: "34.5 C",      key: "temperature" },
    avpu:            { value: 15,   display: "15",          key: "avpu" },
    skinColour:      { value: null, display: "Normal",      key: null },
  },
};

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG       = "#0d1b2e";
const CARD_NML = "#112240";
const CARD_DNG = "#1f1018";
const CARD_WRN = "#1c1a08";

const BORDER_DNG   = "#c13a3a";
const BORDER_DNG_R = "#2e1a1a";
const BORDER_WRN   = "#c07820";
const BORDER_WRN_R = "#2a2510";
const BORDER_BLU   = "#2060cc";
const BORDER_BLU_R = "#1c3455";

// Normal — soft white accent
const BORDER_NML_L = "#ffffff33";   // left 3px accent
const BORDER_NML_R = "#ffffff18";   // top/right/bottom 1px

const TEXT_WHITE = "#ffffff";
const TEXT_DNG   = "#f05050";
const TEXT_WRN   = "#e09030";

const LABEL_NML  = "#5a7da0";
const LABEL_DNG  = "#9a6060";
const LABEL_WRN  = "#9a7830";

const ICON_NML   = "#2a4a6a";
const ICON_DNG   = "#9a3030";
const ICON_WRN   = "#9a6010";
const ICON_BLU   = "#2a6acc";

const CARD_H = 70;
const GAP    = 6;

// ─── Per-variant helpers ──────────────────────────────────────────────────────
const bgOf    = v => v === "danger" ? CARD_DNG  : v === "warning" ? CARD_WRN  : CARD_NML;
const labelOf = v => v === "danger" ? LABEL_DNG : v === "warning" ? LABEL_WRN : LABEL_NML;
const valueOf = v => v === "danger" ? TEXT_DNG  : v === "warning" ? TEXT_WRN  : TEXT_WHITE;
const iconOf  = v => v === "danger" ? ICON_DNG  : v === "warning" ? ICON_WRN  : v === "blue" ? ICON_BLU : ICON_NML;

const borderOf = (v) => {
  if (v === "danger")  return {
    borderLeft:   `3px solid ${BORDER_DNG}`,
    borderTop:    `1px solid ${BORDER_DNG_R}`,
    borderRight:  `1px solid ${BORDER_DNG_R}`,
    borderBottom: `1px solid ${BORDER_DNG_R}`,
  };
  if (v === "warning") return {
    borderLeft:   `3px solid ${BORDER_WRN}`,
    borderTop:    `1px solid ${BORDER_WRN_R}`,
    borderRight:  `1px solid ${BORDER_WRN_R}`,
    borderBottom: `1px solid ${BORDER_WRN_R}`,
  };
  if (v === "blue") return {
    borderLeft:   `3px solid ${BORDER_BLU}`,
    borderTop:    `1px solid ${BORDER_BLU_R}`,
    borderRight:  `1px solid ${BORDER_BLU_R}`,
    borderBottom: `1px solid ${BORDER_BLU_R}`,
  };
  // normal — soft white, same structure as all other variants
  return {
    borderLeft:   `3px solid ${BORDER_NML_L}`,
    borderTop:    `1px solid ${BORDER_NML_R}`,
    borderRight:  `1px solid ${BORDER_NML_R}`,
    borderBottom: `1px solid ${BORDER_NML_R}`,
  };
};

// ─── VitalCard ────────────────────────────────────────────────────────────────
const VitalCard = ({ label, display, numericValue, thresholdKey, forceVariant, icon: Icon, children, sx = {} }) => {
  const v = forceVariant ?? getVariant(thresholdKey, numericValue);
  return (
    <Box sx={{
      height: CARD_H,
      borderRadius: "8px",
      padding: "10px 13px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      flex: 1,
      minWidth: 0,
      background: bgOf(v),
      ...borderOf(v),
      ...sx,
    }}>
      <Typography sx={{
        fontSize: "11px",
        color: labelOf(v),
        lineHeight: 1,
        letterSpacing: "0.02em",
      }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{
          fontSize: "15px",
          fontWeight: 700,
          color: valueOf(v),
          lineHeight: 1,
        }}>
          {display}
        </Typography>
        <Box sx={{ color: iconOf(v), display: "flex", alignItems: "center", flexShrink: 0 }}>
          {children ?? (Icon && <Icon sx={{ fontSize: "22px", color: iconOf(v) }} />)}
        </Box>
      </Box>
    </Box>
  );
};

// ─── Row ──────────────────────────────────────────────────────────────────────
const Row = ({ children }) => (
  <Box sx={{ display: "flex", gap: `${GAP}px`, width: "100%" }}>
    {children}
  </Box>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const PatientVitalsSidebar = ({ patientData = DEFAULT_VITALS }) => {
  const navigate = useNavigate();
  const { patient, vitals } = patientData;

  return (
    <Box sx={{
      position: "fixed", top: 0, right: 0,
      width: 410, height: "100vh",
      background: BG,
      borderLeft: `1px solid ${BORDER_NML_R}`,
      color: TEXT_WHITE,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      overflowX: "hidden", zIndex: 1200,
    }}>

      {/* ── Header ── */}
      <Box sx={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        padding: "14px 14px 12px",
        borderBottom: `1px solid ${BORDER_NML_R}`,
        flexShrink: 0,
      }}>
        <Box>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: TEXT_WHITE, lineHeight: 1.3 }}>
            {patient.name}, {patient.age} {patient.gender}
          </Typography>
          <Typography sx={{ fontSize: "12px", color: LABEL_NML, mt: "3px" }}>
            Flight {patient.flight} ({patient.origin} → {patient.destination})
          </Typography>
        </Box>
        <IconButton
          onClick={() => navigate(-1)}
          size="small"
          sx={{ color: LABEL_NML, mt: "-2px", "&:hover": { color: TEXT_WHITE } }}
        >
          <CloseIcon sx={{ fontSize: "18px" }} />
        </IconButton>
      </Box>

      {/* ── Grid ── */}
      <Box sx={{
        overflowY: "auto", flex: 1,
        padding: "8px 8px 16px",
        display: "flex", flexDirection: "column", gap: `${GAP}px`,
        "&::-webkit-scrollbar": { width: "3px" },
        "&::-webkit-scrollbar-thumb": { background: BORDER_NML_L, borderRadius: "2px" },
      }}>

        {/* Row 1 — Heart Rate | Sweating */}
        <Row>
          <VitalCard
            label="Heart Rate"
            display={vitals.heartRate.display}
            numericValue={vitals.heartRate.value}
            thresholdKey="heartRate"
            icon={HeartRateIcon}
          />
          <VitalCard
            label="Sweating"
            display={vitals.sweating.display}
            icon={SweatingIcon}
          />
        </Row>

        {/* Row 2 — Blood Pressure | ECG */}
        <Row>
          <VitalCard
            label="Blood Pressure"
            display={vitals.bloodPressure.display}
            icon={BloodPressureIcon}
          />
          <VitalCard label="ECG" display={vitals.ecg.display}>
            <ECGIcon />
          </VitalCard>
        </Row>

        {/* Row 3 — Oxygen | Pain Score */}
        <Row>
          <VitalCard
            label="Oxygen"
            display={vitals.oxygen.display}
            numericValue={vitals.oxygen.value}
            thresholdKey="oxygen"
            icon={OxygenIcon}
          />
          <VitalCard
            label="Pain Score"
            display={vitals.painScore.display}
            numericValue={vitals.painScore.value}
            thresholdKey="painScore"
            icon={PainScoreIcon}
          />
        </Row>

        {/* Row 4 — Respiratory Rate | Blood Glucose */}
        <Row>
          <VitalCard
            label="Respiratory rate"
            display={vitals.respiratoryRate.display}
            numericValue={vitals.respiratoryRate.value}
            thresholdKey="respiratoryRate"
            icon={RespiratoryRateIcon}
          />
          <VitalCard
            label="Blood Glucose"
            display={vitals.bloodGlucose.display}
            numericValue={vitals.bloodGlucose.value}
            thresholdKey="bloodGlucose"
            icon={BloodGlucoseIcon}
          />
        </Row>

        {/* Row 5 — Temperature | AVPU Score */}
        <Row>
          <VitalCard
            label="Temperature"
            display={vitals.temperature.display}
            numericValue={vitals.temperature.value}
            thresholdKey="temperature"
            icon={TemperatureIcon}
          />
          <VitalCard
            label="AVPU Score"
            display={vitals.avpu.display}
            numericValue={vitals.avpu.value}
            thresholdKey="avpu"
            forceVariant="blue"
            icon={AVPUIcon}
          />
        </Row>

        {/* Row 6 — Skin Colour half width */}
        <Row>
          <VitalCard
            label="Skin Colour"
            display={vitals.skinColour.display}
            icon={SkinColorIcon}
            sx={{ flex: "0 0 calc(50% - 3px)", maxWidth: "calc(50% - 3px)" }}
          />
        </Row>

      </Box>
    </Box>
  );
};

export default PatientVitalsSidebar;