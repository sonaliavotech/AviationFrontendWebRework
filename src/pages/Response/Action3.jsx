import React, { useMemo, useState } from "react";
import { Box, Typography, Button, IconButton, Paper } from "@mui/material";
import { useThemeMode } from "../../context/ThemeContext";
import {
  APP_FONT_FAMILY,
  getAiAlertStyles,
  getEcgTheme,
  getPanelColors,
} from "../../theme/appStyles";

import {
  EcgBg,
  SyncIcon,
  DeviceConnectedIcon,
  VideoCallIcon,
  NotificationIcon,
  AIAssistIcon,
} from "../../assets/Assets";
import EcgWaveSvg from "../../assets/ECG-Graph.svg";
import Lead1Svg from "../../assets/lead1.svg";
import Lead2Svg from "../../assets/lead2.svg";
import Lead3Svg from "../../assets/lead3.svg";
const ECG_LEADS = [Lead1Svg, Lead2Svg, Lead3Svg];
// ECG Data generation
const ECG_DATA = Array.from({ length: 200 }, (_, i) => {
  const t = i / 20;
  const base = Math.sin(t * 0.5) * 2;
  const qrs = i % 40 === 10 ? -8 : i % 40 === 11 ? 28 : i % 40 === 12 ? -6 : 0;
  const p = i % 40 === 5 ? 6 : i % 40 === 6 ? 8 : i % 40 === 7 ? 6 : 0;
  const t_wave =
    i % 40 >= 16 && i % 40 <= 22
      ? Math.sin((((i % 40) - 16) / 6) * Math.PI) * 7
      : 0;
  return base + qrs + p + t_wave + (Math.random() - 0.5) * 1.5;
});

const WAVE_ROWS = [
  ECG_DATA,
  ECG_DATA.map((v) => v * 0.85 + (Math.random() - 0.5) * 2),
  ECG_DATA.map((v) => v * 1.0 + (Math.random() - 0.5) * 2),
];

const MEASUREMENTS = [
  { label: "HR", value: "81 bpm" },
  { label: "Axis", value: "+105°" },
  { label: "PR", value: "164 ms" },
  { label: "QRS", value: "92 ms" },
  { label: "QT", value: "448 ms" },
  { label: "QTC", value: "468 ms" },
  { label: "ST-II", value: "+2.4 mm" },
  { label: "ST-V5", value: "+1.8 mm" },
  { label: "P-amp", value: "0.18 mV" },
  { label: "R-amp", value: "1.4 mV" },
  { label: "T-inv", value: "aVL, V1" },
  { label: "Δ-wave", value: "None" },
];

const AI_ALERT_CONTENT = [
  {
    title: "Inferior STEMI pattern — leads II, III, aVF",
    desc: "ST elevation ≥2mm with reciprocal depression in aVL",
  },
  {
    title: "QTc prolongation — 468 ms",
    desc: "Risk of Torsades. Avoid QT-prolonging medications",
  },
  {
    title: "Right axis deviation (+105°)",
    desc: "May suggest RV strain or posterior involvement",
  },
  {
    title: "T-wave inversion in aVL, V1",
    desc: "Reciprocal changes consistent with inferior event",
  },
  {
    title: "No ventricular ectopics detected",
    desc: "QRS morphology normal. No bundle branch block",
  },
];

// ECG Wave Component - Pure SVG with dynamic IDs for patterns
const ECGWave = ({
  data,
  height = 80,
  color = "#ef4444",
  id = "wave",
  ecg,
}) => {
  const width = 660;
  const mid = height / 2;
  const scale = height / 80;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${mid - v * scale}`)
    .join(" ");

  return (
    <Box sx={{ width: "100%", display: "block" }}>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
      >
        <defs>
          <pattern
            id={`grid-v-${id}`}
            width="82.5"
            height={height}
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="82.5"
              y1="0"
              x2="82.5"
              y2={height}
              stroke={ecg.gridStroke}
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id={`grid-h-${id}`}
            width={width}
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="20"
              x2={width}
              y2="20"
              stroke={ecg.gridStroke}
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill={ecg.bg} />
        <rect width={width} height={height} fill={`url(#grid-v-${id})`} />
        <rect width={width} height={height} fill={`url(#grid-h-${id})`} />
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
          <text
            key={s}
            x={(s / 8) * width + 2}
            y={height - 3}
            fill={ecg.labelColor}
            fontSize="8"
          >
            {s}s
          </text>
        ))}
      </svg>
    </Box>
  );
};

function Action3({ onClose }) {
  const { darkMode } = useThemeMode();
  const panel = getPanelColors(darkMode);
  const ecg = getEcgTheme(darkMode);
  const aiAlerts = useMemo(
    () =>
      AI_ALERT_CONTENT.map((alert, idx) => ({
        ...alert,
        ...getAiAlertStyles(darkMode)[idx],
      })),
    [darkMode],
  );
  const connectedPill = darkMode
    ? { bg: "#293831", text: "#F2F2F7" }
    : { bg: "#DCFCE7", text: "#166534" };
  const [time] = useState("Today 12:00 PM");

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: { xs: "80px", sm: "90px", md: "100px" },
        background: panel.panelBg,
        fontFamily: APP_FONT_FAMILY,
        color: panel.textPrimary,
        zIndex: 9999,
        overflowY: "auto",
        overflowX: "hidden",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          //   background: "#0f1e36",
          //   borderBottom: "1px solid #1e3a5f",
          p: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Device Connected Pill */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            width: "184px",
            height: "30px",
            px: "16px",
            background: connectedPill.bg,
            borderRadius: "27px",
            flexShrink: 0,
            transition: "background 0.3s",
          }}
        >
          <Box
            component="svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="#4ade80"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Box>

          <Typography
            sx={{
              fontSize: "14px",
              color: connectedPill.text,
              whiteSpace: "nowrap",
            }}
          >
            Device Connected
          </Typography>
        </Box>

        {/* Last Synced Pill */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <SyncIcon />

          <Typography
            sx={{
              fontSize: "14px",
              color: panel.textSecondary,
              whiteSpace: "nowrap",
            }}
          >
            Last synced {time}
          </Typography>
        </Box>

        <Box sx={{ ml: "auto" }}>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              height: "40px",
              px: 3,
              background: "#015DFF",
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 600,
              "&:hover": {
                background: "#015DFF",
              },
            }}
          >
            Back
          </Button>
        </Box>
      </Box>

      {/* Main Layout - Responsive */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
        }}
      >
        {/* Left Content */}
        <Box sx={{ flex: 1, p: "20px 24px", minWidth: 0 }}>
          {/* Patient Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "20px",
                  lineHeight: "140%",
                  color: panel.textPrimary,
                }}
              >
                John Smith, 58 M
              </Typography>
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "140%",
                  color: panel.textSecondary,
                }}
              >
                Flight AA1234, SYD → LAX
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Button
                variant="contained"
                startIcon={
                  <Box
                    component="svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Box>
                }
                sx={{
                  width: "100px",
                  height: "40px",
                  background: "#015DFF",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  "&:hover": { background: "#015DFF" },
                }}
              >
                Chat
              </Button>
              <Button
                variant="contained"
                startIcon={<VideoCallIcon />}
                sx={{
                  width: "125px",
                  height: "40px",
                  background: "#015DFF",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  "&:hover": { background: "#015DFF" },
                }}
              >
                Join Now
              </Button>
              <IconButton
                sx={{
                  width: 36,
                  height: 36,
                  background: "#015DFF",
                  border: "1px solid #015DFF",
                  borderRadius: "8px",
                  color: "#015DFF",
                  "&:hover": { background: "#015DFF" },
                }}
              >
                <NotificationIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Rhythm Banner */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "20px",
                  lineHeight: "100%",
                  color: panel.textPrimary,
                  whiteSpace: "nowrap",
                }}
              >
                Sinus Rhythm —
              </Typography>
              <Box
                component="svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                sx={{ fill: panel.textPrimary }}
              >
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.193 4.068 1 7.5 1c1.973 0 3.866.9 5.133 2.398C13.634 1.9 15.527 1 17.5 1c3.432 0 6.5 2.193 6.5 6.191 0 4.105-5.37 8.863-11 14.402z" />
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "20px",
                  lineHeight: "100%",
                  color: panel.textPrimary,
                  whiteSpace: "nowrap",
                }}
              >
                77 BPM Average
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "130%",
                  color: panel.textSecondary,
                }}
              >
                This ECG does not show signs of atrial fibrillation.
              </Typography>
              <Typography
                sx={{
                  color: panel.mutedText,
                  fontSize: "11px",
                  whiteSpace: "nowrap",
                }}
              >
                Recorded on 7 Aug 2024 at 10.23
              </Typography>
            </Box>
          </Box>

          {/* Main ECG Strip */}
          <Paper
            sx={{
              position: "relative",
              height: "135px",
              overflow: "hidden",
              borderRadius: "12px",
              border: `1px solid ${panel.panelBorderStrong}`,
              background: panel.cardBg,
              mb: 3,
              transition: "background 0.3s, border-color 0.3s",
            }}
          >
            <Box
              component="img"
              src={EcgWaveSvg}
              alt="ECG Wave"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Paper>

          {/* 12-Lead Section */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                sx={{ fontSize: 15, fontWeight: 700, color: panel.textPrimary }}
              >
                12-Lead Overview
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  fontSize: 11,
                  color: panel.mutedText,
                  flexWrap: "wrap",
                }}
              >
                <Typography component="span" sx={{ fontSize: 11 }}>
                  Auto-gain
                </Typography>
                <Typography component="span">·</Typography>
                <Typography component="span" sx={{ fontSize: 11 }}>
                  25mm/s
                </Typography>
                <Typography component="span">·</Typography>
                <Typography component="span" sx={{ fontSize: 11 }}>
                  10mm/mV
                </Typography>
                <Typography component="span">·</Typography>
                <Typography component="span" sx={{ fontSize: 11 }}>
                  OK
                </Typography>
                <Typography component="span">·</Typography>
                <Typography component="span" sx={{ fontSize: 11 }}>
                  Artifact
                </Typography>
              </Box>
            </Box>

            {ECG_LEADS.map((lead, idx) => (
              <Paper
                key={idx}
                sx={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: `1px solid ${ecg.gridStroke}`,
                  mb: 1,
                  background: ecg.bg,
                  transition: "background 0.3s, border-color 0.3s",
                }}
              >
                <Box
                  component="img"
                  src={lead}
                  alt={`Lead ${idx + 1}`}
                  sx={{
                    width: "100%",
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Right Panel */}
        <Box
          sx={{
            width: { xs: "100%", md: "350px" },
            background: panel.panelBg,
            p: "20px 16px",
            height: "auto",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            transition: "background 0.3s",
          }}
        >
          {/* Main wrapper background */}
          <Box
            sx={{
              background: panel.panelSurface,
              minHeight: "140vh",
              p: "16px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderRadius: "12px",
              transition: "background 0.3s",
            }}
          >
            {/* ECG Measurements Card */}
            <Box
              sx={{
                background: panel.chipBg,
                borderRadius: "16px",
                p: "24px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                transition: "background 0.3s",
              }}
            >
              {/* Header */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "16px",
                    lineHeight: "19px",
                    letterSpacing: "0.005em",
                    color: panel.textPrimary,
                  }}
                >
                  ECG Measurements
                </Typography>
              </Box>

              {/* Measurements Grid */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {Array.from({ length: 6 }, (_, rowIdx) => {
                  const left = MEASUREMENTS[rowIdx * 2];
                  const right = MEASUREMENTS[rowIdx * 2 + 1];

                  return (
                    <Box
                      key={rowIdx}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1, width: "120px" }}>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 300,
                            color: panel.textSecondary,
                          }}
                        >
                          {left.label}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: panel.textPrimary,
                          }}
                        >
                          {left.value}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, width: "120px" }}>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 300,
                            color: panel.textSecondary,
                          }}
                        >
                          {right.label}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: panel.textPrimary,
                          }}
                        >
                          {right.value}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* AI Assist Card */}
            <Box
              sx={{
                background: panel.chipBg,
                borderRadius: "8px",
                p: "16px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                gap: 1.5,
                transition: "background 0.3s",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 1,
                  width: "100%",
                }}
              >
                <AIAssistIcon />

                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "16px",
                    lineHeight: "19px",
                    letterSpacing: "0.005em",
                    color: panel.textPrimary,
                    textAlign: "left",
                  }}
                >
                  AI Assist
                </Typography>
              </Box>

              {/* Alert Cards */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 1.5,
                  width: "100%",
                }}
              >
                {aiAlerts.map((alert, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      background: alert.bg,
                      borderRadius: "16px",
                      p: 1.5,
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      textAlign: "left",
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "12px",
                        lineHeight: "15px",
                        color: alert.titleColor,
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      {alert.title}
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 400,
                        fontSize: "10px",
                        lineHeight: "16px",
                        letterSpacing: "0.01em",
                        color: alert.descColor,
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      {alert.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Action3;
