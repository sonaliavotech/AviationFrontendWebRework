import IconButton from "@mui/material/IconButton";

import {
  AccessTimeIcon,
  CloseIcon,
  ErrorIcon,
  TimerIcon,
  TrendingDownIcon,
} from "../../assets/Assets";

const WAVE_PATH =
  "M0 38 C20 28, 30 12, 45 18 S75 42, 95 35 S120 18, 135 33 S160 52, 175 15 S200 10, 220 16";

function GraphCard({ title, value = 62, showTrend = false }) {
  return (
    <div style={{
      background: "#EEF1F5",
      borderRadius: "18px",
      padding: "18px 17px 10px",
      marginBottom: "15px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "4px",
      }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
          {title}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <AccessTimeIcon />
          <span style={{
            fontSize: "8px",
            color: "#6B7280",
            borderRadius: "10px",
            background: "rgba(107,114,128,0.08)",
            padding: "2px 6px",
          }}>
            Last 20 min
          </span>
        </div>
      </div>

      {showTrend && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          marginBottom: "3px",
          marginLeft: "2px",
        }}>
          <TrendingDownIcon />
          <span style={{ fontSize: "9px", color: "#7B8794" }}>
            Trending Down
          </span>
        </div>
      )}

      <div style={{ position: "relative", height: "42px", marginTop: "4px" }}>
        <div style={{
          position: "absolute",
          bottom: "-10px",
          left: "-10px",
          width: "115%",
          height: "42px",
          background: "#DCE9F7",
          borderTopLeftRadius: "50%",
          borderTopRightRadius: "50%",
        }} />

        <svg
          width="100%"
          height="42"
          viewBox="0 0 220 60"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
        >
          <path d={WAVE_PATH} stroke="#0B84FF" strokeWidth="3" fill="none" />
          <circle cx="132" cy="33" r="4" fill="#0B84FF" stroke="white" strokeWidth="2" />
          <g>
            <rect x="118" y="2" rx="10" ry="10" width="20" height="18" fill="white" />
            <text x="128" y="15" textAnchor="middle" fontSize="9" fill="#6B7280">
              {value}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function ViewVitalTrends({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      right: 0,
      width: "280px",
      height: "100vh",
      background: "#072244",
      padding: "16px",
      boxSizing: "border-box",
      overflow: "hidden",
      boxShadow: "-6px 0 32px rgba(0,0,0,0.35)",
      zIndex: 9999,
    }}>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "14px",
      }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: "18px" }}>
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

      {/* Graph Cards */}
      <GraphCard title="SpO₂" value={62} showTrend />
      <GraphCard title="Heart Rate" value={62} />
      <GraphCard title="Blood Pressure" value={62} />

      {/* Alert */}
      <div style={{
        background: "#F3D9DE",
        borderRadius: "18px",
        padding: "12px",
        marginTop: "4px",
        marginBottom: "12px",
      }}>
        <div style={{ fontWeight: 700, fontSize: "13px", color: "#111827" }}>
          SpO₂ &lt; 90% - Critical threshold
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
          <ErrorIcon />
          <div style={{ fontSize: "12px", color: "#3B3B3B" }}>
            <b>Recommendation:</b> Increase oxygen 6–8 L/min NRM. Prepare AED.
          </div>
        </div>
      </div>

      {/* Button */}
      <button style={{
        width: "100%",
        background: "#34B26E",
        border: "none",
        borderRadius: "12px",
        padding: "10px 0",
        color: "#fff",
        fontWeight: 600,
        fontSize: "13px",
      }}>
        <TimerIcon />
        Set Reminder
      </button>

    </div>
  );
}