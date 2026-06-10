import { useState, useMemo } from "react";
import { Box, Typography, Button, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useThemeMode, getTheme } from "../../../context/ThemeContext";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorIcon from "@mui/icons-material/Error";
import AlarmIcon from "@mui/icons-material/Alarm";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BarChartIcon from "@mui/icons-material/BarChart";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChatIcon from "@mui/icons-material/Chat";

import { getVitalsSidebarTheme } from "../../../theme/appStyles";
import { KitSection } from "./KitSection";
import {
  HeartRateIcon, BloodPressureIcon, OxygenIcon,
  RespiratoryRateIcon, TemperatureIcon, SkinColorIcon,
  SweatingIcon, ECGIcon, PainScoreIcon, BloodGlucoseIcon, AVPUIcon,
} from "../../../assets/Assets";

// ── Colors ────────────────────────────────────────────────────────────────────
const DARK_C = {
  bg:           "#0b1d35",
  surface:      "#0f2040",
  surfaceSoft:  "#0d1e38",
  card:         "#112240",
  cardHover:    "#152a50",
  border:       "rgba(255,255,255,0.08)",
  borderLight:  "rgba(255,255,255,0.12)",
  text:         "#e8f0fe",
  textMuted:    "#5a7da0",
  textWhite:    "#ffffff",
  primary:      "#015DFF",
  primarySoft:  "#0a1f40",
  dangerBg:     "#2d1414",
  dangerBorder: "#c13a3a",
  dangerText:   "#f05050",
  dangerLabel:  "#e07070",
  successBg:    "#2e7d52",
  successHover: "#3a9e68",
  tagBg:        "#0a1f38",
  tagText:      "#5a9ad0",
  accent:       "#4a8adc",
};

const buildLightC = (t) => ({
  bg:           t.pageBg,
  surface:      t.cardBg,
  surfaceSoft:  t.tableHeadBg,
  card:         t.cardBg,
  cardHover:    t.tableHoverBg,
  border:       t.borderColor,
  borderLight:  t.divider,
  text:         t.textPrimary,
  textMuted:    t.textSecondary,
  textWhite:    t.textPrimary,
  primary:      "#015DFF",
  primarySoft:  "rgba(1,93,255,0.08)",
  dangerBg:     "#FEF2F2",
  dangerBorder: "#c13a3a",
  dangerText:   "#f05050",
  dangerLabel:  "#e07070",
  successBg:    "#2e7d52",
  successHover: "#3a9e68",
  tagBg:        t.tableHeadBg,
  tagText:      t.actionIconColor,
  accent:       t.actionIconColor,
  cardInner:    t.tableHeadBg,
  iconBg:       t.tableHeadBg,
});

// ── Threshold system (mirrors PatientVitalsSidebar) ───────────────────────────
const THRESHOLDS = {
  heartRate:       { dangerLow: 40,  dangerHigh: 130, warningLow: 50,  warningHigh: 110 },
  oxygen:          { dangerLow: 85,  dangerHigh: null, warningLow: 90, warningHigh: null },
  respiratoryRate: { dangerLow: null, dangerHigh: 30,  warningLow: null, warningHigh: 25 },
  temperature:     { dangerLow: 32,  dangerHigh: 39,  warningLow: 34,  warningHigh: 38 },
  painScore:       { dangerLow: null, dangerHigh: 8,   warningLow: null, warningHigh: 6 },
  bloodGlucose:    { dangerLow: 50,  dangerHigh: 200,  warningLow: 60,  warningHigh: 180 },
  avpu:            { dangerLow: 8,   dangerHigh: null, warningLow: 12,  warningHigh: null },
};

const getVariant = (key, val) => {
  const t = THRESHOLDS[key];
  if (!t || val === null || val === undefined) return "normal";
  const { dangerLow, dangerHigh, warningLow, warningHigh } = t;
  if ((dangerLow  !== null && val < dangerLow)  || (dangerHigh !== null && val > dangerHigh))  return "danger";
  if ((warningLow !== null && val < warningLow) || (warningHigh !== null && val > warningHigh)) return "warning";
  return "normal";
};

const createVitalCardStyles = (vitalTheme) => {
  const bgOf = (v) =>
    v === "danger" ? vitalTheme.cardDng : v === "warning" ? vitalTheme.cardWrn : vitalTheme.cardNml;
  const labelOf = (v) =>
    v === "danger" ? vitalTheme.labelDng : v === "warning" ? vitalTheme.labelWrn : vitalTheme.labelNml;
  const valueOf = (v) =>
    v === "danger" ? vitalTheme.textDng : v === "warning" ? vitalTheme.textWrn : vitalTheme.textWhite;
  const iconOf = (v) =>
    v === "danger"
      ? vitalTheme.iconDng
      : v === "warning"
        ? vitalTheme.iconWrn
        : v === "blue"
          ? vitalTheme.iconBlu
          : vitalTheme.iconNml;
  const borderOf = (v) => {
    if (v === "danger") {
      return {
        borderLeft: `3px solid ${vitalTheme.borderDng}`,
        borderTop: `1px solid ${vitalTheme.borderDngR}`,
        borderRight: `1px solid ${vitalTheme.borderDngR}`,
        borderBottom: `1px solid ${vitalTheme.borderDngR}`,
      };
    }
    if (v === "warning") {
      return {
        borderLeft: `3px solid ${vitalTheme.borderWrn}`,
        borderTop: `1px solid ${vitalTheme.borderWrnR}`,
        borderRight: `1px solid ${vitalTheme.borderWrnR}`,
        borderBottom: `1px solid ${vitalTheme.borderWrnR}`,
      };
    }
    if (v === "blue") {
      return {
        borderLeft: `3px solid ${vitalTheme.borderBlu}`,
        borderTop: `1px solid ${vitalTheme.borderBluR}`,
        borderRight: `1px solid ${vitalTheme.borderBluR}`,
        borderBottom: `1px solid ${vitalTheme.borderBluR}`,
      };
    }
    return {
      borderLeft: `3px solid ${vitalTheme.borderNmlL}`,
      borderTop: `1px solid ${vitalTheme.borderNmlR}`,
      borderRight: `1px solid ${vitalTheme.borderNmlR}`,
      borderBottom: `1px solid ${vitalTheme.borderNmlR}`,
    };
  };

  return { bgOf, labelOf, valueOf, iconOf, borderOf };
};

// ── VitalCard (matches PatientVitalsSidebar exactly) ─────────────────────────
const VitalCard = ({
  label,
  display,
  numericValue,
  thresholdKey,
  forceVariant,
  icon: Icon,
  children,
  vitalTheme,
}) => {
  const { bgOf, labelOf, valueOf, iconOf, borderOf } = createVitalCardStyles(vitalTheme);
  const v = forceVariant ?? getVariant(thresholdKey, numericValue);
  return (
    <Box sx={{
      height: 70, borderRadius: "8px", padding: "10px 13px",
      boxSizing: "border-box", display: "flex", flexDirection: "column",
      justifyContent: "space-between",
      background: bgOf(v), ...borderOf(v),
    }}>
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

// ── Vitals data ───────────────────────────────────────────────────────────────
const VITALS = [
  { label: "Heart Rate",       display: "88 bpm",      numericValue: 88,   thresholdKey: "heartRate",       icon: HeartRateIcon },
  { label: "Blood Pressure",   display: "135/85 mmHg", numericValue: null, thresholdKey: null,              icon: BloodPressureIcon },
  { label: "Oxygen",           display: "80%",         numericValue: 80,   thresholdKey: "oxygen",          icon: OxygenIcon },
  { label: "Respiratory rate", display: "24 mins.",    numericValue: 24,   thresholdKey: "respiratoryRate", icon: RespiratoryRateIcon },
  { label: "Temperature",      display: "34.5 C",      numericValue: 34.5, thresholdKey: "temperature",     icon: TemperatureIcon },
  { label: "Skin Colour",      display: "Normal",      numericValue: null, thresholdKey: null,              icon: SkinColorIcon },
  { label: "Sweating",         display: "Mild",        numericValue: null, thresholdKey: null,              icon: SweatingIcon },
  { label: "ECG",              display: "Sinus",       numericValue: null, thresholdKey: null,              icon: ECGIcon },
  { label: "Pain Score",       display: "6/10",        numericValue: 6,    thresholdKey: "painScore",       icon: PainScoreIcon },
  { label: "Blood Glucose",    display: "100 mg/dl",   numericValue: 100,  thresholdKey: "bloodGlucose",    icon: BloodGlucoseIcon },
  { label: "AVPU Score",       display: "15",          numericValue: 15,   thresholdKey: "avpu",            forceVariant: "blue", icon: AVPUIcon },
];

const essentials    = [{ name: "Pen Torch", icon: "🔦" }, { name: "Pulse Ox", icon: "📊" }];
const medicationsFa = [{ name: "Atropine Sulfate 600mcg/ml", icon: "💊" }, { name: "Aspirin 300 mg tablets", icon: "💊" }];
const instructionsData = [
  { icon: "🛏", title: "Lay the passenger flat",  description: "Rest the passenger on the floor — not seated" },
  { icon: "🤚", title: "Gently lower to floor",   description: "Support head & neck. Do NOT leave seated." },
  { icon: "🦵", title: "Raise legs 30–45 cm",     description: "Use a bag, pillow, or rolled blanket." },
  { icon: "👕", title: "Loosen tight clothing",   description: "Collar, belt, tie — let blood flow freely." },
];

// ── Sparkline ─────────────────────────────────────────────────────────────────
const Sparkline = ({ points, color = "#4a8adc", height = 55 }) => {
  const w = 220, h = height;
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => `${i * step},${h - ((p - min) / range) * (h - 12) - 6}`);
  const id = `g${color.replace("#", "")}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M 0,${h} L ${coords.join(" L ")} L ${w},${h} Z`} fill={`url(#${id})`} />
      <path d={`M ${coords.join(" L ")}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const spo2Points = [98,97,96,95,93,91,89,88,87,85,84,83];
const hrPoints   = [72,74,76,80,85,88,86,90,92,88,85,88];
const bpPoints   = [120,122,125,128,130,132,135,133,136,135,137,135];

// ── TIA Logo ──────────────────────────────────────────────────────────────────
const TIALogo = ({ size = 20 }) => (
  <Box sx={{ width: size, height: size, borderRadius: "6px", background: "linear-gradient(135deg, #015DFF, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <AutoAwesomeIcon sx={{ fontSize: size * 0.6, color: "#fff" }} />
  </Box>
);

// ── Graph Card ────────────────────────────────────────────────────────────────
const GraphCard = ({ title, sparkPoints, sparkColor, badge, c }) => (
  <Box sx={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: "12px", p: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography sx={{ fontSize: "12px", fontWeight: 700, color: c.text }}>{title}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "3px", background: c.tagBg, borderRadius: "20px", px: "7px", py: "2px" }}>
        <AccessTimeIcon sx={{ fontSize: "10px", color: c.accent }} />
        <Typography sx={{ fontSize: "9px", color: c.tagText }}>Last 20 min</Typography>
      </Box>
    </Box>
    {badge && (
      <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <TrendingDownIcon sx={{ fontSize: "12px", color: c.dangerText }} />
        <Typography sx={{ fontSize: "10px", color: c.dangerText }}>{badge}</Typography>
      </Box>
    )}
    <Sparkline points={sparkPoints} color={sparkColor} />
  </Box>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export const CaseDetails = () => {
  const [showTrends, setShowTrends] = useState(false);
  const [showTia, setShowTia]       = useState(true);
  const [view, setView]             = useState("summary");
  const muiTheme = useTheme();
  const { darkMode } = useThemeMode();
  const appTheme = getTheme(darkMode);
  const C = useMemo(
    () => (darkMode ? DARK_C : buildLightC(appTheme)),
    [darkMode, appTheme],
  );
  const vitalTheme = useMemo(() => getVitalsSidebarTheme(darkMode), [darkMode]);
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down("lg"));

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%", background: C.bg, overflow: "hidden", color: C.text, transition: "background 0.3s, color 0.3s" }}>

      {/* ── MAIN CONTENT ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", minWidth: 0 }}>

        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: { xs: "12px", md: "24px" }, pt: "20px", pb: "14px", flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
          <Box>
            <Typography sx={{ fontSize: { xs: "16px", md: "20px" }, fontWeight: 700, color: C.text }}>John Smith, 58 M</Typography>
            <Typography sx={{ fontSize: "12px", color: C.textMuted, mt: "2px" }}>Flight AA1234, SYD → LAX</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button
              startIcon={<VideoCallIcon />}
              sx={{ background: C.primary, color: "#fff", borderRadius: "8px", px: { xs: "10px", md: "16px" }, height: "40px", fontSize: "12px", fontWeight: 600, textTransform: "none", "&:hover": { background: "#0047cc" } }}
            >
              {!isMobile && "Join Now"}
            </Button>
            <Box sx={{ width: 40, height: 40, background: C.primary, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <NotificationsIcon sx={{ color: "#fff", fontSize: "20px" }} />
            </Box>
          </Box>
        </Box>

        {/* Toggle */}
        <Box sx={{ px: { xs: "12px", md: "24px" }, pt: "14px", flexShrink: 0 }}>
          <Box sx={{ display: "inline-flex", height: "40px", background: C.primarySoft, borderRadius: "999px", p: "3px", border: `1px solid ${C.border}` }}>
            {[
              { v: "summary", label: "Event summary", icon: <CalendarTodayIcon sx={{ fontSize: 13 }} /> },
              { v: "chat",    label: "Chat",          icon: <ChatIcon sx={{ fontSize: 13 }} /> },
            ].map(({ v, label, icon }) => (
              <Box key={v} onClick={() => setView(v)} sx={{ display: "flex", alignItems: "center", gap: "6px", px: { xs: "10px", md: "16px" }, borderRadius: "999px", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "all 0.25s", background: view === v ? C.primary : "transparent", color: view === v ? "#fff" : C.accent, whiteSpace: "nowrap" }}>
                {icon}{label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: "auto", px: { xs: "12px", md: "24px" }, pt: "20px", pb: "24px",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { background: C.border, borderRadius: "2px" },
        }}>
          {view === "summary" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: C.text }}>Event Summary</Typography>
              {[
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur laborum.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
              ].map((t, i) => (
                <Typography key={i} sx={{ fontSize: "13px", color: C.textMuted, lineHeight: 1.75 }}>{t}</Typography>
              ))}
            </Box>
          )}

          {view === "chat" && (
            <Box sx={{ background: C.surfaceSoft, borderRadius: "12px", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: "400px" }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 600, p: "16px 16px 0", color: C.text }}>Instructions</Typography>
              <Box sx={{ flex: 1, overflowY: "auto", p: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <Box sx={{ background: C.card, borderRadius: "12px", p: "12px" }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: C.text }}>Pathway A - Vasovagal</Typography>
                  <InstructionGrid instructions={instructionsData} darkMode={darkMode} c={C} />
                  <Typography sx={{ fontSize: "10px", color: C.textMuted, mt: "8px" }}>Dr. Sarah Johnson • 14/03/2026 • 14:28</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px", alignItems: "center" }}>
                  <Box sx={{ background: C.card, borderRadius: "12px", p: "10px 14px", maxWidth: "70%", fontSize: "13px", color: C.text }}>a message from my side</Box>
                  <Box sx={{ width: 36, height: 36, background: "#D0BCFF", borderRadius: "8px", flexShrink: 0 }} />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-start", gap: "8px", alignItems: "center" }}>
                  <Box sx={{ width: 36, height: 36, background: "#B4DBFF", borderRadius: "8px", flexShrink: 0 }} />
                  <Box sx={{ background: C.card, borderRadius: "12px", p: "10px 14px", maxWidth: "70%", fontSize: "13px", color: C.text }}>a message from the opposite end</Box>
                </Box>
              </Box>
              <Box sx={{ position: "relative", borderTop: `1px solid ${C.border}` }}>
                <input
                  style={{ width: "100%", height: "50px", background: C.surface, border: "none", outline: "none", padding: "0 100px 0 20px", fontSize: "13px", boxSizing: "border-box", color: C.text }}
                  placeholder="Click on the mic & start dictating or Type here"
                />
                <Box sx={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "8px", alignItems: "center" }}>
                  <Button sx={{ minWidth: 32, width: 32, height: 32, borderRadius: "999px", border: `1px solid ${C.primary}`, background: "transparent", p: 0 }}>
                    <MicIcon sx={{ fontSize: 15, color: C.primary }} />
                  </Button>
                  <Button sx={{ background: C.primary, color: "#fff", borderRadius: "8px", px: "10px", py: "6px", fontSize: "11px", textTransform: "none", minWidth: "auto", gap: "4px" }}>
                    <SendIcon sx={{ fontSize: 12 }} /> Send
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── TIA SUGGESTS ── */}
      {!isTablet && showTia && (
        <Box sx={{ width: "260px", height: "100vh", py: "20px", px: "16px", background: C.surfaceSoft, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "14px", flexShrink: 0, overflowY: "auto",
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-thumb": { background: C.border, borderRadius: "2px" },
        }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TIALogo size={20} />
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>TIA Suggests</Typography>
              </Box>
              <IconButton size="small" onClick={() => setShowTia(false)} sx={{ color: C.textMuted }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Typography sx={{ fontSize: "11px", color: C.textMuted, mt: "3px" }}>Medicine and equipment in stock</Typography>
          </Box>
          <KitSection c={C} title="Suggested Medications" subtitle="Medicine In Stock"   items={medicationsFa} onClose={() => {}} />
          <KitSection c={C} title="Suggested Essentials"  subtitle="Equipment In Stock" items={essentials}    onClose={() => {}} />
          <Box sx={{ p: "14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "8px" }}>
              <TIALogo size={16} />
              <IconButton size="small" sx={{ color: C.textMuted, p: 0 }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
            </Box>
            <Typography sx={{ fontSize: "12px", color: C.textMuted, lineHeight: 1.6 }}>
              Recent entries show normal activity levels and predictable routines.
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── VITALS SIDEBAR ── */}
      {!isMobile && (
        <Box sx={{
          width: { md: "180px", lg: "215px" },
          background: C.bg,
          borderLeft: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", gap: "6px",
          p: "12px", flexShrink: 0, overflowY: "auto",
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-thumb": { background: C.border, borderRadius: "2px" },
        }}>
          {/* Show Trends Button */}
          <Button
            onClick={() => setShowTrends(!showTrends)}
            fullWidth
            sx={{ background: C.surface, color: C.textMuted, border: `1px solid ${C.borderLight}`, borderRadius: "8px", py: "10px", fontSize: "11px", fontWeight: 600, textTransform: "none", gap: "6px", mb: "4px", "&:hover": { background: C.card } }}
          >
            <BarChartIcon sx={{ fontSize: "16px" }} />
            {showTrends ? "Hide Trends" : "Show Vital trends"}
          </Button>

          {/* Vital Cards — same design as PatientVitalsSidebar */}
          {VITALS.map(({ label, display, numericValue, thresholdKey, forceVariant, icon }) => (
            <VitalCard
              key={label}
              label={label}
              display={display}
              numericValue={numericValue}
              thresholdKey={thresholdKey}
              forceVariant={forceVariant}
              icon={icon}
              vitalTheme={vitalTheme}
            />
          ))}
        </Box>
      )}

      {/* ── VITAL TRENDS OVERLAY ── */}
      {showTrends && (
        <Box sx={{ position: "fixed", top: 0, right: { md: "180px", lg: "215px" }, height: "100vh", width: { xs: "100%", sm: "280px" }, background: C.bg, zIndex: 100, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "12px", p: "16px", boxShadow: "-8px 0 32px rgba(0,0,0,0.5)", overflowY: "auto",
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-thumb": { background: C.border, borderRadius: "2px" },
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", pt: "4px" }}>
            <Box>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: C.text }}>John Smith, 58 M</Typography>
              <Typography sx={{ fontSize: "10px", color: C.textMuted, mt: "2px" }}>Flight AA1234 (SYD → LAX)</Typography>
            </Box>
            <IconButton onClick={() => setShowTrends(false)} size="small" sx={{ color: C.textMuted, "&:hover": { color: C.text } }}>
              <CloseIcon sx={{ fontSize: "16px" }} />
            </IconButton>
          </Box>

          <GraphCard c={C} title="SpO₂"          sparkPoints={spo2Points} sparkColor="#f05050" badge="Trending Down" />
          <GraphCard c={C} title="Heart Rate"     sparkPoints={hrPoints}   sparkColor="#4a8adc" />
          <GraphCard c={C} title="Blood Pressure" sparkPoints={bpPoints}   sparkColor="#a78bfa" />

          <Box sx={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: "12px", p: "12px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <ErrorIcon sx={{ fontSize: 20, color: C.dangerText, flexShrink: 0, mt: "1px" }} />
            <Box>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: C.dangerText, lineHeight: 1.4 }}>
                SpO₂ &lt; 90% - Critical threshold
              </Typography>
              <Typography sx={{ fontSize: "11px", color: C.text, mt: "4px", lineHeight: 1.6 }}>
                <Box component="span" sx={{ fontWeight: 700, color: C.dangerLabel }}>Recommendation: </Box>
                Increase oxygen 6-8 L/min NRM. Prepare AED.
              </Typography>
            </Box>
          </Box>

          <Button fullWidth startIcon={<AlarmIcon sx={{ fontSize: 15 }} />} sx={{ background: C.successBg, color: "#fff", borderRadius: "10px", py: "11px", fontSize: "12px", fontWeight: 700, textTransform: "none", "&:hover": { background: C.successHover } }}>
            Set Reminder
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CaseDetails;