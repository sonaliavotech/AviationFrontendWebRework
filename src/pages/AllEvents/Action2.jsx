import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TimelineIcon from "@mui/icons-material/Timeline";

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

function ECGWaveform() {
  return (
    <svg
      viewBox="0 0 120 52"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
      preserveAspectRatio="none"
    >
      <rect width="120" height="52" fill="white" />


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

const vitals = [
  {
    title: "Heart Rate",
    value: "88 bpm",
    color: "#F2F6FC",
    labelColor: "#8EA3BC",
    bg: "#183355",
    border: "#2A527C",
    icon: <HeartRateIcon />,
  },
  {
    title: "Blood Pressure",
    value: "135/85 mmHg",
    color: "#F2F6FC",
    labelColor: "#8EA3BC",
    bg: "#183355",
    border: "#2A527C",
    icon: <BloodPressureIcon />,
  },
  {
    title: "Oxygen",
    value: "80%",
    color: "#FFFFFF",
    labelColor: "#BDA7B5",
    bg: "#4B2B43",
    border: "#FF4D67",
    icon: <OxygenIcon />,
  },
  {
    title: "Respiratory rate",
    value: "24 mins.",
    color: "#F8F8F8",
    labelColor: "#C0B5AE",
    bg: "#504844",
    border: "#F5A03C",
    icon: <RespiratoryRateIcon />,
  },
  {
    title: "Temperature",
    value: "34.5 C",
    color: "#F8F8F8",
    labelColor: "#C0B5AE",
    bg: "#504844",
    border: "#F5A03C",
    icon: <TemperatureIcon />,
  },
  {
    title: "Skin Colour",
    value: "Normal",
    color: "#F2F6FC",
    labelColor: "#8EA3BC",
    bg: "#183355",
    border: "#2A527C",
    icon: <SkinColorIcon />,
  },
  {
    title: "Sweating",
    value: "Mild",
    color: "#F2F6FC",
    labelColor: "#8EA3BC",
    bg: "#183355",
    border: "#2A527C",
    icon: <SweatingIcon />,
  },
  {
    title: "ECG",
    value: "Sinus",
    color: "#F2F6FC",
    labelColor: "#8EA3BC",
    bg: "#183355",
    border: "#2A527C",
    icon: <ECGWaveform />,
  },
  {
    title: "Pain Score",
    value: "6/10",
    color: "#F2F6FC",
    labelColor: "#8EA3BC",
    bg: "#183355",
    border: "#2A527C",
    icon: <PainScoreIcon />,
  },
  {
    title: "Blood Glucose",
    value: "100 mg/dl",
    color: "#F2F6FC",
    labelColor: "#8EA3BC",
    bg: "#183355",
    border: "#2A527C",
    icon: <BloodGlucoseIcon />,
  },
  {
    title: "AVPU Score",
    value: "15",
    color: "#F2F6FC",
    labelColor: "#8EA3BC",
    bg: "#183355",
    border: "#2A527C",
    icon: <AVPUIcon />,
  },
];

function Action2({ onClose }) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "280px",
        height: "100vh",
        background: "#081B36",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        zIndex: 9999,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",         // ← no scroll at all
        p: 1.5,
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          mb: 1.5,
          flexShrink: 0,            // ← header never shrinks
        }}
      >
        <Box
          sx={{
            flex: 1,
            background: "#132C4F",
            borderRadius: "10px",
            px: 1.5,
            py: 1.2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TimelineIcon sx={{ color: "#FFFFFF", fontSize: 18 }} />
            <Typography sx={{ color: "#FFFFFF", fontSize: "14px", fontWeight: 500 }}>
              Show Vital trends
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: "#FFFFFF",
            marginTop: "3px",
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
          overflow: "hidden",       // ← no scroll
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
              flex: 1,              // ← each card takes equal share of height
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
                    ? "linear-gradient(180deg, #1B3558 0%, #122844 100%)"
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