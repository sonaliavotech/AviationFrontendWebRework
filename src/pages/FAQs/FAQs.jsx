import React from "react";
import { Box, Typography, Chip, Paper } from "@mui/material";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import { useThemeMode, getTheme } from "../../context/ThemeContext";
import { FAQsIcon } from "../../assets/Assets";
import { APP_FONT_FAMILY } from "../../theme/appStyles";

const FAQs = () => {
  const { darkMode } = useThemeMode();
  const theme = getTheme(darkMode);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.pageBg,
        fontFamily: APP_FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
        transition: "background 0.3s",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: "20px",
          background: theme.cardBg,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode
            ? "0 8px 32px rgba(0, 0, 0, 0.25)"
            : "0 8px 32px rgba(15, 38, 70, 0.08)",
          transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "18px",
            background: darkMode
              ? "rgba(1, 93, 255, 0.15)"
              : "rgba(1, 93, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2.5,
            color: darkMode ? "#4DA3FF" : "#015DFF",
          }}
        >
          <FAQsIcon />
        </Box>

        <Chip
          icon={
            <ConstructionOutlinedIcon
              sx={{ fontSize: "16px !important", color: "#015DFF !important" }}
            />
          }
          label="Under Development"
          sx={{
            mb: 2,
            background: darkMode
              ? "rgba(1, 93, 255, 0.12)"
              : "rgba(1, 93, 255, 0.08)",
            color: darkMode ? "#4DA3FF" : "#015DFF",
            border: darkMode
              ? "1px solid rgba(77, 163, 255, 0.25)"
              : "1px solid rgba(1, 93, 255, 0.2)",
            fontWeight: 600,
            fontSize: "12px",
            height: 32,
          }}
        />

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: "22px", sm: "26px" },
            color: theme.textPrimary,
            mb: 1.5,
            lineHeight: 1.3,
          }}
        >
          Frequently Asked Questions
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: "14px", sm: "15px" },
            color: theme.textSecondary,
            lineHeight: 1.7,
            mb: 2,
            maxWidth: 440,
            mx: "auto",
          }}
        >
          We are currently building this section to provide clear, reliable
          answers to common questions about the TiaTELE Aviation platform.
        </Typography>

        <Box
          sx={{
            background: darkMode
              ? "rgba(255, 255, 255, 0.04)"
              : "rgba(1, 93, 255, 0.04)",
            borderRadius: "12px",
            px: 2.5,
            py: 2,
            border: `1px solid ${theme.borderColor}`,
          }}
        >
          <Typography
            sx={{
              fontSize: "13px",
              color: theme.textMuted,
              lineHeight: 1.6,
            }}
          >
            Our team is actively working on this feature. Please check back soon
            for updates.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default FAQs;
