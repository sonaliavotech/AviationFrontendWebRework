import React, { useMemo } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useThemeMode } from "../../context/ThemeContext";
import { getNormalVitalCardStyle, getPanelColors } from "../../theme/appStyles";

import {
  HeartRateIcon,
  BloodPressureIcon,
  OxygenIcon,
  RespiratoryRateIcon,
  TemperatureIcon,
  SkinColorIcon,
  SweatingIcon,
  ECGIcon,
  PainScoreIcon,
  BloodGlucoseIcon,
  AVPUIcon,
} from "../../assets/Assets";

function ECGWaveform({ darkMode }) {
  const bg = darkMode ? "#112339" : "#FFFFFF";
  return (
    <svg
      viewBox="0 0 120 52"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
      preserveAspectRatio="none"
    >
      <rect width="120" height="52" fill={bg} />

      <polyline
        points="
          0,26
          8,26
          10,26
          12,22
          14,1
          16,51
          18,26
          22,26
          26,24
          30,26
          34,26
          36,22
          38,1
          40,51
          42,26
          46,26
          50,24
          54,26
          58,26
          60,22
          62,1
          64,51
          66,26
          70,26
          74,24
          78,22
          82,20
          86,18
          90,16
          94,14
          98,12
          102,10
          106,12
          110,14
          114,16
          118,18
          120,18
        "
        fill="none"
        stroke="#E05C6E"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

const buildVitals = (darkMode) => {
  const normal = getNormalVitalCardStyle(darkMode);

  return [
    { title: "Heart Rate", value: "88 bpm", ...normal, icon: <HeartRateIcon /> },
    { title: "Blood Pressure", value: "135/85 mmHg", ...normal, icon: <BloodPressureIcon /> },
    {
      title: "Oxygen",
      value: "80%",
      color: darkMode ? "#FFFFFF" : "#1F2937",
      labelColor: darkMode ? "#BDA7B5" : "#64748B",
      bg: darkMode ? "#4B2B43" : "#FEE2E2",
      border: "#FF4D67",
      icon: <OxygenIcon />,
    },
    {
      title: "Respiratory rate",
      value: "24 mins.",
      color: darkMode ? "#F8F8F8" : "#1F2937",
      labelColor: darkMode ? "#C0B5AE" : "#64748B",
      bg: darkMode ? "#504844" : "#FFFBEB",
      border: "#F5A03C",
      icon: <RespiratoryRateIcon />,
    },
    {
      title: "Temperature",
      value: "34.5 C",
      color: darkMode ? "#F8F8F8" : "#1F2937",
      labelColor: darkMode ? "#C0B5AE" : "#64748B",
      bg: darkMode ? "#504844" : "#FFFBEB",
      border: "#F5A03C",
      icon: <TemperatureIcon />,
    },
    { title: "Skin Colour", value: "Normal", ...normal, icon: <SkinColorIcon /> },
    { title: "Sweating", value: "Mild", ...normal, icon: <SweatingIcon /> },
    { title: "ECG", value: "Sinus", ...normal, icon: <ECGWaveform darkMode={darkMode} /> },
    { title: "Pain Score", value: "6/10", ...normal, icon: <PainScoreIcon /> },
    { title: "Blood Glucose", value: "100 mg/dl", ...normal, icon: <BloodGlucoseIcon /> },
    { title: "AVPU Score", value: "15", ...normal, icon: <AVPUIcon /> },
  ];
};

function Action2({ onClose }) {
  const { darkMode } = useThemeMode();
  const panel = getPanelColors(darkMode);
  const vitals = useMemo(() => buildVitals(darkMode), [darkMode]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "300px",
        height: "100vh",
        background: panel.panelBg,
        borderLeft: `1px solid ${panel.panelBorder}`,
        zIndex: 9999,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        p: 1.5,
        color: panel.textPrimary,
        transition: "background 0.3s, border-color 0.3s, color 0.3s",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          mb: 1.5,
          flexShrink: 0, // ← header never shrinks
        }}
      >
        <Box>
          <Typography
            sx={{
              color: panel.textPrimary,
              fontWeight: 500,
              fontSize: "15px",
              mr: "40px",
            }}
          >
            John Smith, 58 M
          </Typography>
          <Typography sx={{ color: panel.textSecondary, fontSize: "12px" }}>
            Flight AA1234 (SYD → LAX)
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: panel.textPrimary,
            marginTop: "3px",
            marginLeft: "75px",
            width: 32,
            height: 32,
            borderRadius: "10px",
            flexShrink: 0,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* VITAL CARDS — flex column, fills remaining height evenly */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          overflow: "hidden", // ← no scroll
        }}
      >
        {vitals.map((item, index) => (
          <Box
            key={index}
            sx={{
              background: item.bg,
              borderRadius: item.title === "ECG" ? "14px" : "12px",
              px: item.title === "ECG" ? 0 : 1.5,
              py: item.title === "ECG" ? 0 : 0,
              flex: 1, // ← each card takes equal share of height
              display: "flex",
              alignItems: "center",
              borderLeft: `3px solid ${item.border}`,
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            {/* LEFT CONTENT */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                px: item.title === "ECG" ? 1.5 : 0,
              }}
            >
              <Typography
                sx={{
                  color: item.labelColor,
                  fontSize: "11px",
                  fontWeight: 400,
                  lineHeight: "14px",
                  textAlign: "left",
                  mb: 0.3,
                }}
              >
                {item.title}
              </Typography>

              <Typography
                sx={{
                  color: item.color,
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: "18px",
                  textAlign: "left",
                }}
              >
                {item.value}
              </Typography>
            </Box>

            {/* RIGHT ICON */}
            <Box
              sx={{
                width: item.title === "ECG" ? 120 : 30,
                height: item.title === "ECG" ? "100%" : 30,
                flexShrink: 0,
                ml: 1,
                mr: item.title === "ECG" ? 0 : 0,
                overflow: "hidden",
                borderRadius: item.title === "ECG" ? "0 14px 14px 0" : 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  item.title === "ECG"
                    ? darkMode
                      ? "linear-gradient(180deg, #1B3558 0%, #122844 100%)"
                      : "linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 100%)"
                    : "transparent",
                "& svg": {
                  width: item.title === "ECG" ? "100%" : 32,
                  height: item.title === "ECG" ? "100%" : 32,
                  opacity: item.title === "ECG" ? 1 : 0.65,
                },
              }}
            >
              {item.icon}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Action2;
