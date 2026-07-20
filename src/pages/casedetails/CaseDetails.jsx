import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LoadingSpinner from "../../componants/LoadingSpinner";
import { getCaseSummary, getEcgFiles } from "../../services/api";
import { useThemeMode, getTheme } from "../../context/ThemeContext";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorIcon from "@mui/icons-material/Error";
import AlarmIcon from "@mui/icons-material/Alarm";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BarChartIcon from "@mui/icons-material/BarChart";
import ChatIcon from "@mui/icons-material/Chat";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DescriptionIcon from "@mui/icons-material/Description";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
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
import { getVitalsSidebarTheme } from "../../theme/appStyles";
import EventSummaryPanel from "./EventSummaryPanel";
import MedicineModules from "./MedicineModules";
import CaseDetailsChatPanel from "./CaseDetailsChatPanel";
import {
  parseAiSummary,
  getMedicineKey,
  formatMedicineLine,
} from "./caseDetailUtils";

// Import Call Context
import { useAviationCallContext } from "../../context/AviationCallContext";

const DARK_C = {
  bg: "#0b1d35",
  surface: "#0f2040",
  card: "#112240",
  border: "rgba(255,255,255,0.08)",
  borderLight: "rgba(255,255,255,0.12)",
  text: "#e8f0fe",
  textMuted: "#5a7da0",
  primary: "#015DFF",
  dangerBg: "#2d1414",
  dangerBorder: "#c13a3a",
  dangerText: "#f05050",
  dangerLabel: "#e07070",
  successBg: "#2e7d52",
  successHover: "#3a9e68",
  tagBg: "#0a1f38",
  tagText: "#5a9ad0",
  accent: "#4a8adc",
};

const buildLightC = (t) => ({
  bg: t.pageBg,
  surface: t.cardBg,
  card: t.cardBg,
  border: t.borderColor,
  borderLight: t.divider,
  text: t.textPrimary,
  textMuted: t.textSecondary,
  primary: "#015DFF",
  dangerBg: "#FEF2F2",
  dangerBorder: "#c13a3a",
  dangerText: "#f05050",
  dangerLabel: "#e07070",
  successBg: "#2e7d52",
  successHover: "#3a9e68",
  tagBg: t.tableHeadBg,
  tagText: t.actionIconColor,
  accent: t.actionIconColor,
});

const THRESHOLDS = {
  heartRate: {
    dangerLow: 40,
    dangerHigh: 130,
    warningLow: 50,
    warningHigh: 110,
  },
  oxygen: {
    dangerLow: 85,
    dangerHigh: null,
    warningLow: 90,
    warningHigh: null,
  },
  respiratoryRate: {
    dangerLow: null,
    dangerHigh: 30,
    warningLow: null,
    warningHigh: 25,
  },
  temperature: {
    dangerLow: 32,
    dangerHigh: 39,
    warningLow: 34,
    warningHigh: 38,
  },
  painScore: {
    dangerLow: null,
    dangerHigh: 8,
    warningLow: null,
    warningHigh: 6,
  },
  bloodGlucose: {
    dangerLow: 50,
    dangerHigh: 200,
    warningLow: 60,
    warningHigh: 180,
  },
  avpu: { dangerLow: 8, dangerHigh: null, warningLow: 12, warningHigh: null },
};

const getVariant = (key, val) => {
  const t = THRESHOLDS[key];
  if (!t || val == null) return "normal";
  const { dangerLow, dangerHigh, warningLow, warningHigh } = t;
  if (
    (dangerLow != null && val < dangerLow) ||
    (dangerHigh != null && val > dangerHigh)
  )
    return "danger";
  if (
    (warningLow != null && val < warningLow) ||
    (warningHigh != null && val > warningHigh)
  )
    return "warning";
  return "normal";
};

const createVitalCardStyles = (vitalTheme) => {
  const bgOf = (v) =>
    v === "danger"
      ? vitalTheme.cardDng
      : v === "warning"
        ? vitalTheme.cardWrn
        : vitalTheme.cardNml;
  const labelOf = (v) =>
    v === "danger"
      ? vitalTheme.labelDng
      : v === "warning"
        ? vitalTheme.labelWrn
        : vitalTheme.labelNml;
  const valueOf = (v) =>
    v === "danger"
      ? vitalTheme.textDng
      : v === "warning"
        ? vitalTheme.textWrn
        : vitalTheme.textWhite;
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

const VitalCard = ({
  label,
  display,
  numericValue,
  thresholdKey,
  forceVariant,
  icon: Icon,
  vitalTheme,
}) => {
  const { bgOf, labelOf, valueOf, iconOf, borderOf } =
    createVitalCardStyles(vitalTheme);
  const v = forceVariant ?? getVariant(thresholdKey, numericValue);
  return (
    <Box
      sx={{
        height: 70,
        borderRadius: "8px",
        padding: "10px 13px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: bgOf(v),
        ...borderOf(v),
      }}
    >
      <Typography sx={{ fontSize: "11px", color: labelOf(v), lineHeight: 1 }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "15px",
            fontWeight: 700,
            color: valueOf(v),
            lineHeight: 1,
          }}
        >
          {display}
        </Typography>
        <Box sx={{ color: iconOf(v), display: "flex", alignItems: "center" }}>
          {Icon && <Icon sx={{ fontSize: "22px", color: iconOf(v) }} />}
        </Box>
      </Box>
    </Box>
  );
};

const DEFAULT_VITALS = [
  {
    label: "Heart Rate",
    display: "—",
    numericValue: null,
    thresholdKey: "heartRate",
    icon: HeartRateIcon,
  },
  {
    label: "Blood Pressure",
    display: "—",
    numericValue: null,
    thresholdKey: null,
    icon: BloodPressureIcon,
  },
  {
    label: "Oxygen",
    display: "—",
    numericValue: null,
    thresholdKey: "oxygen",
    icon: OxygenIcon,
  },
  {
    label: "Respiratory rate",
    display: "—",
    numericValue: null,
    thresholdKey: "respiratoryRate",
    icon: RespiratoryRateIcon,
  },
  {
    label: "Temperature",
    display: "—",
    numericValue: null,
    thresholdKey: "temperature",
    icon: TemperatureIcon,
  },
  {
    label: "Skin Colour",
    display: "—",
    numericValue: null,
    thresholdKey: null,
    icon: SkinColorIcon,
  },
  {
    label: "Sweating",
    display: "—",
    numericValue: null,
    thresholdKey: null,
    icon: SweatingIcon,
  },
  {
    label: "ECG",
    display: "—",
    numericValue: null,
    thresholdKey: null,
    icon: ECGIcon,
  },
  {
    label: "Pain Score",
    display: "—",
    numericValue: null,
    thresholdKey: "painScore",
    icon: PainScoreIcon,
  },
  {
    label: "Blood Glucose",
    display: "—",
    numericValue: null,
    thresholdKey: "bloodGlucose",
    icon: BloodGlucoseIcon,
  },
  {
    label: "AVPU Score",
    display: "—",
    numericValue: null,
    thresholdKey: "avpu",
    forceVariant: "blue",
    icon: AVPUIcon,
  },
];

const buildVitalsFromCase = (v) => {
  if (!v) return DEFAULT_VITALS;
  const fmt = (val, suffix = "") =>
    val != null && val !== "" ? `${val}${suffix}` : "—";
  return [
    {
      label: "Heart Rate",
      display: fmt(v.heartRate, " bpm"),
      numericValue: v.heartRate ?? null,
      thresholdKey: "heartRate",
      icon: HeartRateIcon,
    },
    {
      label: "Blood Pressure",
      display:
        v.bpSystolic != null ? `${v.bpSystolic}/${v.bpDiastolic} mmHg` : "—",
      numericValue: null,
      thresholdKey: null,
      icon: BloodPressureIcon,
    },
    {
      label: "Oxygen",
      display: fmt(v.oxygen, "%"),
      numericValue: v.oxygen ?? null,
      thresholdKey: "oxygen",
      icon: OxygenIcon,
    },
    {
      label: "Respiratory rate",
      display: fmt(v.respiratoryRate, " mins."),
      numericValue: v.respiratoryRate ?? null,
      thresholdKey: "respiratoryRate",
      icon: RespiratoryRateIcon,
    },
    {
      label: "Temperature",
      display: fmt(v.temperature, " C"),
      numericValue: v.temperature ?? null,
      thresholdKey: "temperature",
      icon: TemperatureIcon,
    },
    {
      label: "Skin Colour",
      display: v.skinColor || "—",
      numericValue: null,
      thresholdKey: null,
      icon: SkinColorIcon,
    },
    {
      label: "Sweating",
      display: v.sweating || "—",
      numericValue: null,
      thresholdKey: null,
      icon: SweatingIcon,
    },
    {
      label: "ECG",
      display: v.ecg || "—",
      numericValue: null,
      thresholdKey: null,
      icon: ECGIcon,
    },
    {
      label: "Pain Score",
      display: v.painScore != null ? `${v.painScore}/10` : "—",
      numericValue: v.painScore ?? null,
      thresholdKey: "painScore",
      icon: PainScoreIcon,
    },
    {
      label: "Blood Glucose",
      display: fmt(v.bloodGlucose, " mg/dl"),
      numericValue: v.bloodGlucose ?? null,
      thresholdKey: "bloodGlucose",
      icon: BloodGlucoseIcon,
    },
    {
      label: "AVPU Score",
      display: fmt(v.avpuScore),
      numericValue: v.avpuScore ?? null,
      thresholdKey: "avpu",
      forceVariant: "blue",
      icon: AVPUIcon,
    },
  ];
};

const Sparkline = ({ points, color = "#4a8adc", height = 55 }) => {
  const w = 220;
  const h = height;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map(
    (p, i) => `${i * step},${h - ((p - min) / range) * (h - 12) - 6}`,
  );
  const id = `g${color.replace("#", "")}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M 0,${h} L ${coords.join(" L ")} L ${w},${h} Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M ${coords.join(" L ")}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

const GraphCard = ({ title, sparkPoints, sparkColor, badge, c }) => (
  <Box
    sx={{
      background: c.card,
      border: `1px solid ${c.border}`,
      borderRadius: "12px",
      p: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography sx={{ fontSize: "12px", fontWeight: 700, color: c.text }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          background: c.tagBg,
          borderRadius: "20px",
          px: "7px",
          py: "2px",
        }}
      >
        <AccessTimeIcon sx={{ fontSize: "10px", color: c.accent }} />
        <Typography sx={{ fontSize: "9px", color: c.tagText }}>
          Last 20 min
        </Typography>
      </Box>
    </Box>
    {badge && (
      <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <TrendingDownIcon sx={{ fontSize: "12px", color: c.dangerText }} />
        <Typography sx={{ fontSize: "10px", color: c.dangerText }}>
          {badge}
        </Typography>
      </Box>
    )}
    <Sparkline points={sparkPoints} color={sparkColor} />
  </Box>
);

const spo2Points = [98, 97, 96, 95, 93, 91, 89, 88, 87, 85, 84, 83];
const hrPoints = [72, 74, 76, 80, 85, 88, 86, 90, 92, 88, 85, 88];
const bpPoints = [120, 122, 125, 128, 130, 132, 135, 133, 136, 135, 137, 135];

export const CaseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const incidentId = location.state?.incidentId;
  const tablePatient = location.state?.patient;

  // State for case data
  const [eventData, setEventData] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [ecgFiles, setEcgFiles] = useState([]);
  const [loadingEcg, setLoadingEcg] = useState(false);

  // UI state
  const [showTrends, setShowTrends] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [pendingMedicines, setPendingMedicines] = useState([]);
  const [recommendedMedicines, setRecommendedMedicines] = useState([]);
  const [mobilePanel, setMobilePanel] = useState("summary");

  // Call state (UI overlays handled globally by AviationCallProvider)
  const { startCall, openJitsi, physicianUser, callError } =
    useAviationCallContext();

  // Theme and responsive
  const muiTheme = useTheme();
  const { darkMode } = useThemeMode();
  const appTheme = getTheme(darkMode);
  const C = useMemo(
    () => (darkMode ? DARK_C : buildLightC(appTheme)),
    [darkMode, appTheme],
  );
  const vitalTheme = useMemo(() => getVitalsSidebarTheme(darkMode), [darkMode]);
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const isSmallTablet = useMediaQuery(muiTheme.breakpoints.down("lg"));
  const isNarrow = useMediaQuery(muiTheme.breakpoints.down("xl"));

  // Compute derived values
  const physicianAssigned = useMemo(
    () =>
      location.state?.physicianAssigned ||
      !!eventData?.physicianId ||
      !!eventData?.physician_id ||
      !!tablePatient?.physicianId ||
      tablePatient?.physicianStatus === "named",
    [location.state?.physicianAssigned, eventData, tablePatient],
  );

  const crewUserId = useMemo(
    () =>
      location.state?.crewId ||
      location.state?.crewUserId ||
      tablePatient?.crewId ||
      eventData?.crewId ||
      eventData?.crew_id ||
      null,
    [location.state, tablePatient, eventData],
  );

  const crewDisplayName = useMemo(
    () =>
      location.state?.crewName ||
      tablePatient?.crew ||
      eventData?.crew ||
      eventData?.crew_name ||
      "Crew",
    [location.state?.crewName, tablePatient, eventData],
  );

  const prefetchedRoomId = useMemo(
    () =>
      location.state?.roomId ||
      tablePatient?.chatRoomId ||
      eventData?.chat_room_id ||
      null,
    [location.state?.roomId, tablePatient, eventData],
  );

  const chatEnabled = physicianAssigned && !!crewUserId;

  // Fetch case data
  useEffect(() => {
    if (!incidentId) return;
    setLoadingEvent(true);
    getCaseSummary(incidentId)
      .then(setEventData)
      .catch((err) => {
        console.error("CASE DETAILS FETCH ERROR =>", err);
        setEventData(null);
      })
      .finally(() => setLoadingEvent(false));
  }, [incidentId]);

  // Fetch ECG files
  useEffect(() => {
    if (!incidentId) return;
    setLoadingEcg(true);
    getEcgFiles(incidentId)
      .then(setEcgFiles)
      .catch((err) => console.error("ECG FETCH ERROR =>", err))
      .finally(() => setLoadingEcg(false));
  }, [incidentId]);

  // Handle call error
  useEffect(() => {
    if (callError) {
      console.error("Call error:", callError);
    }
  }, [callError]);

  // Handle Join Now click
  const handleJoinNow = useCallback(() => {
    if (!physicianAssigned) {
      console.warn("Physician not assigned");
      return;
    }

    if (!crewUserId) {
      console.warn("No crew available");
      return;
    }

    const callId = `call_${incidentId}_${Date.now()}`;

    const callData = {
      callId,
      roomId: callId,
      fromUserId: physicianUser?.id || "physician-web-user",
      callerName: physicianUser?.name || "Physician",
      callerRole: "physician",
      toUserId: crewUserId,
      receiverRole: "crew",
      hasVideo: true,
      callType: "video",
      callerId: physicianUser?.id || "physician-web-user",
      incidentId: incidentId,
      organizationName: "Aviation Medical",
      participants: [
        {
          userId: crewUserId,
          role: "crew"
        }
      ]
    };

    const success = startCall(callData);
    if (success) {
      openJitsi(callData);
      console.log("📞 Call initiated:", callData);
    }
  }, [physicianAssigned, crewUserId, incidentId, prefetchedRoomId, physicianUser, startCall, openJitsi]);

  const aiSummary = useMemo(() => parseAiSummary(eventData), [eventData]);

  const patientHeader = eventData
    ? `${eventData.patientName || "—"}, ${eventData.patientAge || "—"} Y`
    : tablePatient
      ? `${tablePatient.name}, ${tablePatient.age?.replace("y", "") || "—"} Y`
      : "Loading...";

  const flightHeader = eventData
    ? `Flight ${eventData.flight || "—"}, ${eventData.route || "—"}`
    : tablePatient
      ? `Flight ${tablePatient.room || "—"}, ${tablePatient.location || "—"}`
      : "";

  const displayVitals = useMemo(
    () => buildVitalsFromCase(eventData?.vitals),
    [eventData],
  );

  const addPendingMedicine = useCallback((medicineOrMedicines) => {
    const medicines = Array.isArray(medicineOrMedicines)
      ? medicineOrMedicines
      : [medicineOrMedicines];
    const normalized = medicines
      .map((m) =>
        typeof m === "string"
          ? { moduleId: "", moduleTitle: "", medicineName: m, usage: "" }
          : {
            moduleId: m?.moduleId || "",
            moduleTitle: m?.moduleTitle || "",
            medicineName: m?.medicineName || m?.name || m?.title || "",
            usage: m?.usage || "",
          },
      )
      .filter((m) => m.medicineName);

    if (!normalized.length) return;

    setPendingMedicines((prev) => {
      const existingKeys = new Set(prev.map(getMedicineKey));
      const next = [...prev];
      normalized.forEach((medicine) => {
        const key = getMedicineKey(medicine);
        if (!existingKeys.has(key)) {
          next.push(medicine);
          existingKeys.add(key);
        }
      });
      return next;
    });

    setChatMessage((prev) => {
      const existingLines = prev.split("\n").filter(Boolean);
      const newLines = normalized
        .map(formatMedicineLine)
        .filter(Boolean)
        .filter((line) => !existingLines.includes(line));
      return [...existingLines, ...newLines].join("\n");
    });

    setChatVisible(true);
    if (isMobile) setMobilePanel("summary");
  }, [isMobile]);

  const handleSendChatMedicines = useCallback(() => {
    if (pendingMedicines.length === 0 && !chatMessage.trim()) return;

    if (pendingMedicines.length > 0) {
      setRecommendedMedicines((prev) => {
        const existingKeys = new Set(prev.map(getMedicineKey));
        const next = [...prev];
        pendingMedicines.forEach((medicine) => {
          const key = getMedicineKey(medicine);
          if (!existingKeys.has(key)) {
            next.push(medicine);
            existingKeys.add(key);
          }
        });
        return next;
      });
    }

    setPendingMedicines([]);
    setChatMessage("");
  }, [pendingMedicines, chatMessage]);

  const handleEcgClick = (item) => {
    const url = `https://files.tiamdplus.databin.in/${item.storage_url}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderMedicinePanel = () =>
    showTrends ? (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: C.text }}>
            Vital Trends
          </Typography>
          <IconButton size="small" onClick={() => setShowTrends(false)}>
            <CloseIcon sx={{ fontSize: 16, color: C.textMuted }} />
          </IconButton>
        </Box>
        <GraphCard
          c={C}
          title="SpO₂"
          sparkPoints={spo2Points}
          sparkColor="#f05050"
          badge="Trending Down"
        />
      </Box>
    ) : (
      <MedicineModules darkMode={darkMode} onAddMedicine={addPendingMedicine} />
    );

  const renderVitalsPanel = () => (
    <>
      <Button
        onClick={() => setShowTrends(!showTrends)}
        fullWidth
        sx={{
          background: C.surface,
          color: C.textMuted,
          border: `1px solid ${C.borderLight}`,
          borderRadius: "8px",
          py: "10px",
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "none",
          gap: "6px",
          mb: "4px",
          "&:hover": { background: C.card },
        }}
      >
        <BarChartIcon sx={{ fontSize: "16px" }} />
        {showTrends ? "Hide Trends" : "Show Vital trends"}
      </Button>

      {displayVitals.map(
        ({
          label,
          display,
          numericValue,
          thresholdKey,
          forceVariant,
          icon,
        }) => (
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
        ),
      )}
    </>
  );

  const mobileTabs = [
    { id: "summary", label: "Summary", icon: DescriptionIcon },
    { id: "kit", label: "Kit", icon: MedicalServicesIcon },
    { id: "vitals", label: "Vitals", icon: MonitorHeartIcon },
  ];

  const renderMobileTabBar = () => (
    <Box
      sx={{
        display: { xs: "flex", md: "none" },
        flexShrink: 0,
        borderTop: `1px solid ${C.border}`,
        background: darkMode ? "#0F172A" : C.surface,
        px: 1,
        py: 0.75,
        gap: 0.75,
        safeAreaBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {mobileTabs.map(({ id, label, icon: TabIcon }) => {
        const active = mobilePanel === id;
        return (
          <Button
            key={id}
            fullWidth
            onClick={() => setMobilePanel(id)}
            startIcon={<TabIcon sx={{ fontSize: 18 }} />}
            sx={{
              minHeight: 44,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: "12px",
              fontWeight: active ? 700 : 500,
              color: active ? "#fff" : C.textMuted,
              background: active ? "#0A5FFF" : "transparent",
              "&:hover": {
                background: active ? "#0047cc" : darkMode ? "#1E293B" : "#F1F5F9",
              },
            }}
          >
            {label}
          </Button>
        );
      })}
    </Box>
  );

  const chatPanelProps = {
    visible: chatVisible,
    onClose: () => setChatVisible(false),
    chatTitle: crewDisplayName,
    incidentId,
    crewUserId,
    chatEnabled,
    prefetchedRoomId,
    message: chatMessage,
    setMessage: setChatMessage,
    pendingMedicines,
    onSendMedicines: handleSendChatMedicines,
    darkMode,
    fullScreen: isMobile,
  };

  const medicinePanelWidth = isMobile
    ? "100%"
    : isSmallTablet
      ? 260
      : isNarrow
        ? 285
        : 309;
  const vitalsPanelWidth = isSmallTablet ? 200 : 218;

  // Render main content function to avoid duplication
  const renderMainContent = () => (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        alignSelf: "stretch",
        minHeight: 0,
        width: "100%",
        background: C.bg,
        overflow: "hidden",
        color: C.text,
        position: "relative",
      }}
    >
      {/* Main column: header + body */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: { xs: "wrap", md: "nowrap" },
            px: { xs: "12px", md: "14px" },
            py: "14px",
            flexShrink: 0,
            borderBottom: `1px solid ${C.border}`,
            background: darkMode ? "#0F172A" : C.surface,
            gap: "12px",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: "15px", md: "16px" },
                fontWeight: 700,
                color: darkMode ? "#F8FAFC" : C.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {patientHeader}
            </Typography>
            <Typography
              sx={{ fontSize: "12px", color: C.textMuted, mt: "2px" }}
            >
              {flightHeader}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexShrink: 0,
              flexWrap: { xs: "wrap", md: "nowrap" },
              justifyContent: { xs: "flex-start", md: "flex-end" },
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Button
              startIcon={<ChatIcon sx={{ fontSize: { xs: 16, md: 18 } }} />}
              disabled={!chatEnabled}
              onClick={() => {
                if (!chatEnabled) return;
                if (isMobile) setMobilePanel("summary");
                setChatVisible((v) => !v);
              }}
              sx={{
                background: chatEnabled
                  ? "#0A5FFF"
                  : darkMode
                    ? "#1E293B"
                    : "#E2E8F0",
                color: chatEnabled ? "#fff" : C.textMuted,
                borderRadius: "8px",
                px: { xs: "10px", sm: "14px" },
                height: { xs: 36, md: 38 },
                fontSize: { xs: "11px", md: "12px" },
                fontWeight: 600,
                textTransform: "none",
                opacity: chatEnabled ? 1 : 0.6,
                flex: { xs: 1, sm: "none" },
                minWidth: 0,
                "&:hover": {
                  background: chatEnabled ? "#0047cc" : undefined,
                },
              }}
            >
              {chatVisible ? "Close Chat" : "Chat"}
            </Button>

            <Button
              startIcon={<VideoCallIcon sx={{ fontSize: { xs: 16, md: 18 } }} />}
              disabled={!physicianAssigned || !crewUserId}
              onClick={handleJoinNow}
              sx={{
                background: physicianAssigned && crewUserId
                  ? "#0A5FFF"
                  : darkMode
                    ? "#1E293B"
                    : "#E2E8F0",
                color: physicianAssigned && crewUserId ? "#fff" : C.textMuted,
                borderRadius: "8px",
                px: { xs: "10px", sm: "14px" },
                height: { xs: 36, md: 38 },
                fontSize: { xs: "11px", md: "12px" },
                fontWeight: 600,
                textTransform: "none",
                opacity: physicianAssigned && crewUserId ? 1 : 0.6,
                flex: { xs: 1, sm: "none" },
                minWidth: 0,
                "&:hover": {
                  background: physicianAssigned && crewUserId ? "#0047cc" : undefined,
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Join Now
              </Box>
              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                Join
              </Box>
            </Button>

            <IconButton
              sx={{
                width: 38,
                height: 38,
                background: "#0A5FFF",
                borderRadius: "8px",
                "&:hover": { background: "#0047cc" },
              }}
            >
              <NotificationsIcon sx={{ color: "#fff", fontSize: "20px" }} />
            </IconButton>
          </Box>
        </Box>

        {/* Body: responsive panels */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            {/* Summary */}
            <Box
              sx={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
                background: darkMode ? "#0B1525" : C.bg,
                minWidth: 0,
                display: {
                  xs: mobilePanel === "summary" ? "flex" : "none",
                  md: "flex",
                },
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  px: { xs: "10px", sm: "12px", md: "16px" },
                  py: { xs: "12px", md: "16px" },
                  WebkitOverflowScrolling: "touch",
                  "&::-webkit-scrollbar": { width: "4px" },
                  "&::-webkit-scrollbar-thumb": {
                    background: C.border,
                    borderRadius: "2px",
                  },
                }}
              >
                <EventSummaryPanel
                  eventData={eventData}
                  loadingEvent={loadingEvent}
                  loadingEcg={loadingEcg}
                  ecgFiles={ecgFiles}
                  recommendedMedicines={recommendedMedicines}
                  aiSummary={aiSummary}
                  darkMode={darkMode}
                  onBack={() => navigate("/all-events")}
                  onEcgClick={handleEcgClick}
                />
              </Box>

              {!isMobile && chatVisible && (
                <CaseDetailsChatPanel {...chatPanelProps} />
              )}
            </Box>

            {/* Medicine kit */}
            <Box
              sx={{
                width: { xs: "100%", md: medicinePanelWidth },
                flexShrink: 0,
                borderLeft: { md: `1px solid ${C.border}` },
                background: darkMode ? "#0B1525" : C.surface,
                overflowY: "auto",
                overflowX: "hidden",
                p: { xs: "10px", md: "12px" },
                WebkitOverflowScrolling: "touch",
                display: {
                  xs: mobilePanel === "kit" ? "block" : "none",
                  md: "block",
                },
                minWidth: 0,
                "&::-webkit-scrollbar": { width: "3px" },
                "&::-webkit-scrollbar-thumb": {
                  background: C.border,
                  borderRadius: "2px",
                },
              }}
            >
              {renderMedicinePanel()}
            </Box>

            {/* Vitals */}
            <Box
              sx={{
                display: {
                  xs: mobilePanel === "vitals" ? "flex" : "none",
                  md: "none",
                },
                flex: 1,
                flexDirection: "column",
                gap: "6px",
                overflowY: "auto",
                p: "12px",
                background: C.bg,
                WebkitOverflowScrolling: "touch",
              }}
            >
              {renderVitalsPanel()}
            </Box>
          </Box>

          {!chatVisible && renderMobileTabBar()}
        </Box>
      </Box>

      {/* Right — vitals sidebar */}
      <Box
        sx={{
          width: vitalsPanelWidth,
          flexShrink: 0,
          background: C.bg,
          borderLeft: `1px solid ${C.border}`,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          gap: "6px",
          p: { md: "10px", lg: "12px" },
          overflowY: "auto",
          minWidth: 0,
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-thumb": {
            background: C.border,
            borderRadius: "2px",
          },
        }}
      >
        {renderVitalsPanel()}
      </Box>

      {/* Mobile fullscreen chat overlay */}
      {isMobile && chatVisible && <CaseDetailsChatPanel {...chatPanelProps} />}

      {/* Vital trends overlay */}
      {showTrends && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            right: { xs: 0, md: vitalsPanelWidth },
            height: "100dvh",
            width: { xs: "100%", sm: 320, md: 280 },
            maxWidth: "100vw",
            background: C.bg,
            zIndex: 1100,
            borderLeft: { md: `1px solid ${C.border}` },
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            p: { xs: "12px", md: "16px" },
            boxShadow: { md: "-8px 0 32px rgba(0,0,0,0.5)" },
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: "14px", fontWeight: 700, color: C.text }}
              >
                {patientHeader}
              </Typography>
              <Typography
                sx={{ fontSize: "10px", color: C.textMuted, mt: "2px" }}
              >
                {flightHeader}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setShowTrends(false)}
              size="small"
              sx={{ color: C.textMuted }}
            >
              <CloseIcon sx={{ fontSize: "16px" }} />
            </IconButton>
          </Box>

          <GraphCard
            c={C}
            title="SpO₂"
            sparkPoints={spo2Points}
            sparkColor="#f05050"
            badge="Trending Down"
          />
          <GraphCard
            c={C}
            title="Heart Rate"
            sparkPoints={hrPoints}
            sparkColor="#4a8adc"
          />
          <GraphCard
            c={C}
            title="Blood Pressure"
            sparkPoints={bpPoints}
            sparkColor="#a78bfa"
          />

          <Box
            sx={{
              background: C.dangerBg,
              border: `1px solid ${C.dangerBorder}`,
              borderRadius: "12px",
              p: "12px",
              display: "flex",
              gap: "10px",
            }}
          >
            <ErrorIcon
              sx={{ fontSize: 20, color: C.dangerText, flexShrink: 0 }}
            />
            <Box>
              <Typography
                sx={{ fontSize: "12px", fontWeight: 700, color: C.dangerText }}
              >
                SpO₂ &lt; 90% - Critical threshold
              </Typography>
              <Typography
                sx={{
                  fontSize: "11px",
                  color: C.text,
                  mt: "4px",
                  lineHeight: 1.6,
                }}
              >
                <Box
                  component="span"
                  sx={{ fontWeight: 700, color: C.dangerLabel }}
                >
                  Recommendation:{" "}
                </Box>
                Increase oxygen 6-8 L/min NRM. Prepare AED.
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            startIcon={<AlarmIcon sx={{ fontSize: 15 }} />}
            sx={{
              background: C.successBg,
              color: "#fff",
              borderRadius: "10px",
              py: "11px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { background: C.successHover },
            }}
          >
            Set Reminder
          </Button>
        </Box>
      )}

      {loadingEvent && (
        <LoadingSpinner
          variant="overlay"
          size="lg"
          message="Loading case..."
        />
      )}
    </Box>
  );

  return renderMainContent();
};

export default CaseDetails;