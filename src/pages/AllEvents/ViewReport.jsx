import React, { useMemo } from "react";
import { Box, Typography, IconButton, Slide } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useThemeMode } from "../../context/ThemeContext";
import { getVitalsSidebarTheme } from "../../theme/appStyles";
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
  heartRate: { dangerLow: 40, dangerHigh: 130, warningLow: 50, warningHigh: 110 },
  oxygen: { dangerLow: 85, dangerHigh: null, warningLow: 90, warningHigh: null },
  respiratoryRate: { dangerLow: null, dangerHigh: 30, warningLow: null, warningHigh: 25 },
  temperature: { dangerLow: 32, dangerHigh: 39, warningLow: 34, warningHigh: 38 },
  painScore: { dangerLow: null, dangerHigh: 8, warningLow: null, warningHigh: 6 },
  bloodGlucose: { dangerLow: 50, dangerHigh: 200, warningLow: 60, warningHigh: 180 },
  avpu: { dangerLow: 8, dangerHigh: null, warningLow: 12, warningHigh: null },
};

const getVariant = (key, val) => {
  const t = THRESHOLDS[key];
  if (!t || val === null || val === undefined) return "normal";
  const { dangerLow, dangerHigh, warningLow, warningHigh } = t;
  if ((dangerLow !== null && val < dangerLow) || (dangerHigh !== null && val > dangerHigh)) return "danger";
  if ((warningLow !== null && val < warningLow) || (warningHigh !== null && val > warningHigh)) return "warning";
  return "normal";
};

const DEFAULT_VITALS = {
  patient: { name: "John Smith", age: 58, gender: "M", flight: "AA1234", origin: "SYD", destination: "LAX" },
  vitals: {
    heartRate: { value: 88, display: "88 bpm", key: "heartRate" },
    sweating: { value: null, display: "Mild", key: null },
    bloodPressure: { value: null, display: "135/85 mmHg", key: null },
    ecg: { value: null, display: "Sinus", key: null },
    oxygen: { value: 80, display: "80%", key: "oxygen" },
    painScore: { value: 6, display: "6/10", key: "painScore" },
    respiratoryRate: { value: 24, display: "24 mins.", key: "respiratoryRate" },
    bloodGlucose: { value: 100, display: "100 mg/dl", key: "bloodGlucose" },
    temperature: { value: 34.5, display: "34.5 C", key: "temperature" },
    avpu: { value: 15, display: "15", key: "avpu" },
    skinColour: { value: null, display: "Normal", key: null },
  },
};

const CARD_H = 70;
const GAP = 6;

const createVitalStyles = (V) => {
  const bgOf = (v) => (v === "danger" ? V.cardDng : v === "warning" ? V.cardWrn : V.cardNml);
  const labelOf = (v) => (v === "danger" ? V.labelDng : v === "warning" ? V.labelWrn : V.labelNml);
  const valueOf = (v) => (v === "danger" ? V.textDng : v === "warning" ? V.textWrn : V.textWhite);
  const iconOf = (v) =>
    v === "danger" ? V.iconDng : v === "warning" ? V.iconWrn : v === "blue" ? V.iconBlu : V.iconNml;
  const borderOf = (v) => {
    if (v === "danger") {
      return {
        borderLeft: `3px solid ${V.borderDng}`,
        borderTop: `1px solid ${V.borderDngR}`,
        borderRight: `1px solid ${V.borderDngR}`,
        borderBottom: `1px solid ${V.borderDngR}`,
      };
    }
    if (v === "warning") {
      return {
        borderLeft: `3px solid ${V.borderWrn}`,
        borderTop: `1px solid ${V.borderWrnR}`,
        borderRight: `1px solid ${V.borderWrnR}`,
        borderBottom: `1px solid ${V.borderWrnR}`,
      };
    }
    if (v === "blue") {
      return {
        borderLeft: `3px solid ${V.borderBlu}`,
        borderTop: `1px solid ${V.borderBluR}`,
        borderRight: `1px solid ${V.borderBluR}`,
        borderBottom: `1px solid ${V.borderBluR}`,
      };
    }
    return {
      borderLeft: `3px solid ${V.borderNmlL}`,
      borderTop: `1px solid ${V.borderNmlR}`,
      borderRight: `1px solid ${V.borderNmlR}`,
      borderBottom: `1px solid ${V.borderNmlR}`,
    };
  };

  return { bgOf, labelOf, valueOf, iconOf, borderOf };
};

const VitalCard = ({
  styles,
  label,
  display,
  numericValue,
  thresholdKey,
  forceVariant,
  icon: Icon,
  children,
  sx = {},
}) => {
  const v = forceVariant ?? getVariant(thresholdKey, numericValue);
  const { bgOf, labelOf, valueOf, iconOf, borderOf } = styles;

  return (
    <Box
      sx={{
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
      }}
    >
      <Typography sx={{ fontSize: "11px", color: labelOf(v), lineHeight: 1, letterSpacing: "0.02em" }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: valueOf(v), lineHeight: 1 }}>
          {display}
        </Typography>
        <Box sx={{ color: iconOf(v), display: "flex", alignItems: "center", flexShrink: 0 }}>
          {children ?? (Icon && <Icon sx={{ fontSize: "22px", color: iconOf(v) }} />)}
        </Box>
      </Box>
    </Box>
  );
};

const Row = ({ children }) => (
  <Box sx={{ display: "flex", gap: `${GAP}px`, width: "100%" }}>{children}</Box>
);

const PatientVitalsSidebar = ({ open = false, onClose, patientData = DEFAULT_VITALS }) => {
  const { darkMode } = useThemeMode();
  const V = useMemo(() => getVitalsSidebarTheme(darkMode), [darkMode]);
  const styles = useMemo(() => createVitalStyles(V), [V]);
  const { patient, vitals } = patientData;

  return (
    <>
      {open && (
        <Box
          onClick={onClose}
          sx={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 10000,
          }}
        />
      )}

      <Slide direction="left" in={open} mountOnEnter unmountOnExit timeout={300}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            width: 380,
            height: "100vh",
            background: V.bg,
            borderLeft: `1px solid ${V.borderNmlR}`,
            color: V.textWhite,
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
            zIndex: 10001,
            transition: "background 0.3s, color 0.3s, border-color 0.3s",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "14px 14px 12px",
              borderBottom: `1px solid ${V.borderNmlR}`,
              flexShrink: 0,
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: V.textWhite, lineHeight: 1.3 }}>
                {patient.name}, {patient.age} {patient.gender}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: V.labelNml, mt: "3px" }}>
                Flight {patient.flight} ({patient.origin} → {patient.destination})
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: V.labelNml, mt: "-2px", "&:hover": { color: V.textWhite } }}
            >
              <CloseIcon sx={{ fontSize: "18px" }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              overflowY: "auto",
              flex: 1,
              padding: "8px 8px 16px",
              display: "flex",
              flexDirection: "column",
              gap: `${GAP}px`,
              "&::-webkit-scrollbar": { width: "3px" },
              "&::-webkit-scrollbar-thumb": { background: V.borderNmlL, borderRadius: "2px" },
            }}
          >
            <Row>
              <VitalCard styles={styles} label="Heart Rate" display={vitals.heartRate.display} numericValue={vitals.heartRate.value} thresholdKey="heartRate" icon={HeartRateIcon} />
              <VitalCard styles={styles} label="Sweating" display={vitals.sweating.display} icon={SweatingIcon} />
            </Row>
            <Row>
              <VitalCard styles={styles} label="Blood Pressure" display={vitals.bloodPressure.display} icon={BloodPressureIcon} />
              <VitalCard styles={styles} label="ECG" display={vitals.ecg.display}><ECGIcon /></VitalCard>
            </Row>
            <Row>
              <VitalCard styles={styles} label="Oxygen" display={vitals.oxygen.display} numericValue={vitals.oxygen.value} thresholdKey="oxygen" icon={OxygenIcon} />
              <VitalCard styles={styles} label="Pain Score" display={vitals.painScore.display} numericValue={vitals.painScore.value} thresholdKey="painScore" icon={PainScoreIcon} />
            </Row>
            <Row>
              <VitalCard styles={styles} label="Respiratory rate" display={vitals.respiratoryRate.display} numericValue={vitals.respiratoryRate.value} thresholdKey="respiratoryRate" icon={RespiratoryRateIcon} />
              <VitalCard styles={styles} label="Blood Glucose" display={vitals.bloodGlucose.display} numericValue={vitals.bloodGlucose.value} thresholdKey="bloodGlucose" icon={BloodGlucoseIcon} />
            </Row>
            <Row>
              <VitalCard styles={styles} label="Temperature" display={vitals.temperature.display} numericValue={vitals.temperature.value} thresholdKey="temperature" icon={TemperatureIcon} />
              <VitalCard styles={styles} label="AVPU Score" display={vitals.avpu.display} numericValue={vitals.avpu.value} thresholdKey="avpu" forceVariant="blue" icon={AVPUIcon} />
            </Row>
            <Row>
              <VitalCard styles={styles} label="Skin Colour" display={vitals.skinColour.display} icon={SkinColorIcon} sx={{ flex: "0 0 calc(50% - 3px)", maxWidth: "calc(50% - 3px)" }} />
            </Row>
          </Box>
        </Box>
      </Slide>
    </>
  );
};

export default PatientVitalsSidebar;
