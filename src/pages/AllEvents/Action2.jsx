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
    icon: <ECGIcon />,
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
        width: "240px",
        height: "100vh",
        background: "#081B36",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        p: 1.5,
        overflowY: "auto",
        zIndex: 9999,
        boxSizing: "border-box",

        "&::-webkit-scrollbar": {
          width: "4px",
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          background: "#132C4F",
          borderRadius: "10px",
          px: 1.5,
          py: 1.2,
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <TimelineIcon
            sx={{
              color: "#FFFFFF",
              fontSize: 18,
            }}
          />

          <Typography
            sx={{
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Show Vital trends
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: "#FFFFFF",
            p: 0,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* VITAL CARDS */}
      {vitals.map((item, index) => (
        <Box
          key={index}
          sx={{
            background: item.bg,
            borderRadius: "12px",
            px: 1.5,
            py: 1.2,
            mb: 1,

            display: "flex",
            alignItems: "center",

            borderLeft: `3px solid ${item.border}`,

            minHeight: "40px",
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
              width: 30,
              height: 30,
              flexShrink: 0,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              ml: 1,

              "& svg": {
                width: 32,
                height: 32,
                opacity: 0.65,
              },
            }}
          >
            {item.icon}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default Action2;