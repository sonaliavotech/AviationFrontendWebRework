import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import AirOutlinedIcon from "@mui/icons-material/AirOutlined";
import CoronavirusOutlinedIcon from "@mui/icons-material/CoronavirusOutlined";
import ThermostatOutlinedIcon from "@mui/icons-material/ThermostatOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import OpacityOutlinedIcon from "@mui/icons-material/OpacityOutlined";
import GraphicEqOutlinedIcon from "@mui/icons-material/GraphicEqOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import TimelineIcon from "@mui/icons-material/Timeline";

const vitals = [
  {
    title: "Heart Rate",
    value: "88 bpm",
    color: "#FFFFFF",
    icon: <FavoriteBorderIcon />,
  },
  {
    title: "Blood Pressure",
    value: "135/85 mmHg",
    color: "#FFFFFF",
    icon: <MonitorHeartOutlinedIcon />,
  },
  {
    title: "Oxygen",
    value: "80%",
    color: "#FF4D4F",
    border: "#FF4D4F",
    icon: <AirOutlinedIcon />,
  },
  {
    title: "Respiratory rate",
    value: "24 mins.",
    color: "#FFA940",
    border: "#FFA940",
    icon: <CoronavirusOutlinedIcon />,
  },
  {
    title: "Temperature",
    value: "34.5 C",
    color: "#FFA940",
    border: "#FFA940",
    icon: <ThermostatOutlinedIcon />,
  },
  {
    title: "Skin Colour",
    value: "Normal",
    color: "#FFFFFF",
    icon: <VisibilityOutlinedIcon />,
  },
  {
    title: "Sweating",
    value: "Mild",
    color: "#FFFFFF",
    icon: <OpacityOutlinedIcon />,
  },
  {
    title: "ECG",
    value: "Sinus",
    color: "#FFFFFF",
    icon: <GraphicEqOutlinedIcon />,
  },
  {
    title: "Pain Score",
    value: "6/10",
    color: "#FFFFFF",
    icon: <SentimentSatisfiedAltOutlinedIcon />,
  },
  {
    title: "Blood Glucose",
    value: "100 mg/dl",
    color: "#FFFFFF",
    icon: <OpacityOutlinedIcon />,
  },
  {
    title: "AVPU Score",
    value: "15",
    color: "#FFFFFF",
    border: "#1890FF",
    icon: <SentimentSatisfiedAltOutlinedIcon />,
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
      }}
    >
      {/* Header */}
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

      {/* Vital Cards */}
      {vitals.map((item, index) => (
        <Box
          key={index}
          sx={{
            background: "#1A3254",
            borderRadius: "10px",
            px: 1,
            py: 1,
            mb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderLeft: `3px solid ${item.border || "#FFFFFF"}`,
            minHeight: "50px",
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#9FB0C9",
                fontSize: "11px",
                lineHeight: 1,
                mb: 0.3,
              }}
            >
              {item.title}
            </Typography>

            <Typography
              sx={{
                color: item.color,
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {item.value}
            </Typography>
          </Box>

          <Box
            sx={{
              color: "#60748E",
              display: "flex",
              alignItems: "center",
              "& svg": {
                fontSize: 18,
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