import IconButton from "@mui/material/IconButton";
import { Box, Typography, Button } from "@mui/material";
import { useThemeMode } from "../../context/ThemeContext";
import { getPanelColors } from "../../theme/appStyles";

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

const BOX_HEIGHT = "110px";

function GraphCard({ title, value = 62, showTrend = false, panel }) {
  return (
    <Box
      sx={{
        background: panel.graphCardBg,
        borderRadius: "18px",
        mb: "8px",
        position: "relative",
        overflow: "hidden",
        height: BOX_HEIGHT,
        border: panel.borderColor ? `1px solid ${panel.borderColor}` : "none",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          px: "12px",
          pt: "8px",
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: "14px", fontWeight: 700, color: panel.graphTitle }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <AccessTimeIcon />
          <Typography
            component="span"
            sx={{
              fontSize: "8px",
              color: panel.graphSubtext,
              borderRadius: "10px",
              background: "rgba(107,114,128,0.08)",
              px: "6px",
              py: "2px",
            }}
          >
            Last 20 min
          </Typography>
        </Box>
      </Box>

      {showTrend && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            ml: "12px",
            mt: "2px",
            color: "#2897FF",
          }}
        >
          <TrendingDownIcon style={{ color: "#2897FF" }} />
          <Typography component="span" sx={{ fontSize: "9px", color: "#2897FF" }}>
            Trending Down
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "60px",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            bottom: "-10px",
            left: "-10px",
            width: "115%",
            height: "60px",
            background: panel.graphWave,
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
          <circle cx="132" cy="33" r="4" fill="#0B84FF" stroke="white" strokeWidth="2" />
          <g>
            <rect x="120" y="5" rx="10" ry="10" width="22" height="16" fill="white" />
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
      </Box>
    </Box>
  );
}

export default function ViewVitalTrends({ open, onClose }) {
  const { darkMode } = useThemeMode();
  const panel = getPanelColors(darkMode);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "270px",
        height: "100vh",
        background: panel.panelBg,
        borderLeft: `1px solid ${panel.panelBorder}`,
        p: "16px",
        boxSizing: "border-box",
        overflow: "hidden",
        boxShadow: darkMode
          ? "-6px 0 32px rgba(0,0,0,0.35)"
          : "-6px 0 32px rgba(15, 23, 42, 0.12)",
        zIndex: 9999,
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: "12px",
        }}
      >
        <Box>
          <Typography
            sx={{ color: panel.textPrimary, fontWeight: 500, fontSize: "15px" }}
          >
            John Smith, 58 M
          </Typography>
          <Typography sx={{ color: panel.textSecondary, fontSize: "12px" }}>
            Flight AA1234 (SYD → LAX)
          </Typography>
        </Box>

        <IconButton onClick={onClose} sx={{ color: panel.textPrimary }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <GraphCard
        title={
          <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
            <OxygenIcon />
            SpO₂
          </Box>
        }
        value={62}
        showTrend
        panel={panel}
      />
      <GraphCard
        title={
          <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
            <HeartRateIcon />
            Heart Rate
          </Box>
        }
        value={62}
        panel={panel}
      />
      <GraphCard
        title={
          <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
            <BloodPressureIcon />
            Blood Pressure
          </Box>
        }
        value={62}
        panel={panel}
      />

      <Box
        sx={{
          background: panel.criticalAlertBg,
          borderRadius: "18px",
          p: "12px",
          mt: "4px",
          mb: "10px",
          height: BOX_HEIGHT,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          border: darkMode ? "none" : `1px solid ${panel.borderColor}`,
        }}
      >
        <ErrorIcon />

        <Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: "14px", color: panel.criticalAlertText }}
          >
            SpO₂ &lt; 90% - Critical threshold
          </Typography>
          <Typography sx={{ fontSize: "13px", color: panel.textSecondary }}>
            <Box component="span" sx={{ fontWeight: 700 }}>
              Recommendation:
            </Box>{" "}
            Increase oxygen 6–8 L/min NRM. Prepare AED.
          </Typography>
        </Box>
      </Box>

      <Button
        fullWidth
        sx={{
          background: "#34B26E",
          borderRadius: "12px",
          py: "10px",
          color: "#fff",
          fontWeight: 600,
          fontSize: "13px",
          textTransform: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          "&:hover": { background: "#2da260" },
        }}
      >
        <TimerIcon />
        Set Reminder
      </Button>
    </Box>
  );
}
