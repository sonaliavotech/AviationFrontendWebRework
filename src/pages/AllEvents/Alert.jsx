import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import { useThemeMode } from "../../context/ThemeContext";
import { getPanelColors } from "../../theme/appStyles";

export default function NotificationPanel({ open, onClose }) {
  const { darkMode } = useThemeMode();
  const panel = getPanelColors(darkMode);

  if (!open) return null;

  const Card = () => (
    <Box
      sx={{
        background: panel.alertCardBg,
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px",
        marginBottom: "10px",
        border: darkMode ? "none" : `1px solid ${panel.borderColor}`,
      }}
    >
      <ErrorIcon sx={{ color: "#FF5A67", fontSize: 28 }} />

      <Box sx={{ flex: 1, ml: "10px" }}>
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 700,
            color: panel.alertTitle,
          }}
        >
          Alert Headline
        </Typography>

        <Typography
          sx={{
            fontSize: "13px",
            color: panel.alertDesc,
          }}
        >
          Description. Lorem ipsum dolor sit amet.
        </Typography>
      </Box>

      <IconButton size="small">
        <CloseIcon sx={{ fontSize: 18, color: panel.alertClose }} />
      </IconButton>
    </Box>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        right: 0,
        top: 0,
        width: "320px",
        height: "100vh",
        background: panel.panelBg,
        borderLeft: `1px solid ${panel.panelBorder}`,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: panel.textPrimary,
        transition: "background 0.3s, border-color 0.3s, color 0.3s",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            color: panel.textPrimary,
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          Notification
        </Typography>

        <IconButton onClick={onClose} sx={{ color: panel.textPrimary }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: "16px",
          pb: "16px",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        <Box
          sx={{
            display: "inline-block",
            background: panel.chipBg,
            color: panel.textPrimary,
            fontSize: "10px",
            padding: "4px 10px",
            borderRadius: "20px",
            marginBottom: "12px",
          }}
        >
          TODAY
        </Box>

        <Card />
        <Card />
        <Card />

        <Typography
          sx={{
            mt: 1,
            mb: 1,
            fontSize: "10px",
            color: panel.mutedText,
            fontWeight: 500,
          }}
        >
          12 MARCH 2026
        </Typography>

        <Card />
        <Card />
        <Card />
      </Box>
    </Box>
  );
}
