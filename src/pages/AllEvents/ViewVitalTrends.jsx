import IconButton from "@mui/material/IconButton";

import {
  AccessTimeIcon,
  CloseIcon,
  ErrorIcon,
  TimerIcon,
  TrendingDownIcon,
  HeartRateIcon,
  BloodPressureIcon,
  OxygenIcon,
} from "../../assets/Assets";

const BOX_HEIGHT = "110px"; // 🔻 reduced height

/* ===================== GRAPH CARD ===================== */
function GraphCard({ title, value = 62, showTrend = false }) {
  return (
    <div
      style={{
        background: "#EEF1F5",
        borderRadius: "18px",
        marginBottom: "8px",
        position: "relative",
        overflow: "hidden",
        height: BOX_HEIGHT,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "8px 12px 0px 12px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
          {title}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <AccessTimeIcon />
          <span
            style={{
              fontSize: "8px",
              color: "#6B7280",
              borderRadius: "10px",
              background: "rgba(107,114,128,0.08)",
              padding: "2px 6px",
            }}
          >
            Last 20 min
          </span>
        </div>
      </div>

      {/* TREND */}
      {showTrend && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            marginLeft: "12px",
            marginTop: "2px",
            color: "#2897FF",
          }}
        >
          <TrendingDownIcon style={{ color: "#2897FF" }} />
          <span style={{ fontSize: "9px", color: "#2897FF" }}>
            Trending Down
          </span>
        </div>
      )}

      {/* GRAPH AT BOTTOM */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "60px", // 🔻 reduced graph height
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "-10px",
            left: "-10px",
            width: "115%",
            height: "60px",
            background: "#DCE9F7",
            borderTopLeftRadius: "50%",
            borderTopRightRadius: "50%",
          }}
        />

        <svg
          width="100%"
          height="60"
          viewBox="0 0 220 60"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
        >
          <path
            d="M0 38 C20 28, 30 12, 45 18 S75 42, 95 35 S120 18, 135 33 S160 52, 175 15 S200 10, 220 16"
            stroke="#0B84FF"
            strokeWidth="3"
            fill="none"
          />

          {/* BLUE POINT */}
          <circle
            cx="132"
            cy="33"
            r="4"
            fill="#0B84FF"
            stroke="white"
            strokeWidth="2"
          />

          {/* 🔵 VALUE BUBBLE ON POINT */}
          <g>
            <rect
              x="120"
              y="5"
              rx="10"
              ry="10"
              width="22"
              height="16"
              fill="white"
            />
            <text
              x="131"
              y="17"
              textAnchor="middle"
              fontSize="9"
              fill="#0B84FF"
              fontWeight="bold"
            >
              {value}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ===================== MAIN PANEL ===================== */
export default function ViewVitalTrends({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "270px", // 🔼 slightly increased width
        height: "100vh",
        background: "#072244",
        padding: "16px",
        boxSizing: "border-box",
        overflow: "hidden",
        boxShadow: "-6px 0 32px rgba(0,0,0,0.35)",
        zIndex: 9999,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div>
          <div style={{ color: "#fff", fontWeight: 500, fontSize: "15px" }}>
            John Smith, 58 M
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px" }}>
            Flight AA1234 (SYD → LAX)
          </div>
        </div>

        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </div>

      {/* CARDS */}
      <GraphCard title={<span style={{ display: "flex", gap: 6, alignItems: "center" }}><OxygenIcon />SpO₂</span>} value={62} showTrend />
      <GraphCard title={<span style={{ display: "flex", gap: 6, alignItems: "center" }}><HeartRateIcon />Heart Rate</span>} value={62} />
      <GraphCard title={<span style={{ display: "flex", gap: 6, alignItems: "center" }}><BloodPressureIcon />Blood Pressure</span>} value={62} />

      {/* ALERT */}
      <div
        style={{
          background: "#F3D9DE",
          borderRadius: "18px",
          padding: "12px",
          marginTop: "4px",
          marginBottom: "10px",
          height: BOX_HEIGHT,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <ErrorIcon />

        <div>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>
            SpO₂ &lt; 90% - Critical threshold
          </div>
          <div style={{ fontSize: "13px", color: "#3B3B3B" }}>
            <b>Recommendation:</b> Increase oxygen 6–8 L/min NRM. Prepare AED.
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <button
        style={{
          width: "100%",
          background: "#34B26E",
          border: "none",
          borderRadius: "12px",
          padding: "10px 0",
          color: "#fff",
          fontWeight: 600,
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        <TimerIcon />
        Set Reminder
      </button>
    </div>
  );
}