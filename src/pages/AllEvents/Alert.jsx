import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";

export default function NotificationPanel({ open, onClose }) {
  if (!open) return null;

  const Card = () => (
    <Box
      sx={{
        background: "#FFDDE2",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px",
        marginBottom: "10px", // transparent gap between cards
      }}
    >
      {/* LEFT ICON */}
      <ErrorIcon sx={{ color: "#FF5A67", fontSize: 28 }} />

      {/* TEXT */}
      <Box sx={{ flex: 1, ml: "10px" }}>
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#111",
          }}
        >
          Alert Headline
        </Typography>

        <Typography
          sx={{
            fontSize: "13px",
            color: "#555",
          }}
        >
          Description. Lorem ipsum dolor sit amet.
        </Typography>
      </Box>

      {/* CLOSE */}
      <IconButton size="small">
        <CloseIcon sx={{ fontSize: 18, color: "#444" }} />
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
        background: "#0B1F36",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // removes unwanted bottom section
      }}
    >
      {/* HEADER */}
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
            color: "#fff",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          Notification
        </Typography>

        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* BODY */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: "16px",
          pb: "16px", // prevents unwanted bottom action section
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
        }}
      >
        {/* TODAY CHIP */}
        <Box
          sx={{
            display: "inline-block",
            background: "#1F3A5B",
            color: "#fff",
            fontSize: "10px",
            padding: "4px 10px",
            borderRadius: "20px",
            marginBottom: "12px",
          }}
        >
          TODAY
        </Box>

        {/* TODAY NOTIFICATIONS */}
        <Card />
        <Card />
        <Card />

        {/* DATE LABEL */}
        <Typography
          sx={{
            mt: 1,
            mb: 1,
            fontSize: "10px",
            color: "#9FB3C8",
            fontWeight: 500,
          }}
        >
          12 MARCH 2026
        </Typography>

        {/* OLD NOTIFICATIONS */}
        <Card />
        <Card />
        <Card />
      </Box>
    </Box>
  );
}