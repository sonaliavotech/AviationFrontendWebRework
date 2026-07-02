import React from "react";
import { createPortal } from "react-dom";
import { Box, Typography } from "@mui/material";
import { useThemeMode, getTheme } from "../context/ThemeContext";
import { APP_FONT_FAMILY } from "../theme/appStyles";

const PRIMARY = "#015DFF";
const PRIMARY_LIGHT = "#4DA3FF";

const SIZE_MAP = {
  xs: 18,
  sm: 24,
  md: 44,
  lg: 56,
  xl: 72,
};

/**
 * TiaTELE loading spinner — matches aviation telecare theme (dark/light).
 *
 * variant:
 *  - inline   → buttons, compact rows
 *  - section  → centered inside a card / panel
 *  - overlay  → absolute overlay on parent (position: relative)
 *  - page     → full-area centered loader (routes, full pages)
 *  - fullscreen → fixed overlay over entire app (sidebar + content)
 */
const LoadingSpinner = ({
  size = "md",
  variant = "inline",
  message,
  color,
  sx,
}) => {
  const { darkMode } = useThemeMode();
  const theme = getTheme(darkMode);
  const px = SIZE_MAP[size] || SIZE_MAP.md;
  const accent = color || (darkMode ? PRIMARY_LIGHT : PRIMARY);
  const track = darkMode ? "rgba(77, 163, 255, 0.18)" : "rgba(1, 93, 255, 0.12)";

  const spinner = (
    <Box
      sx={{
        position: "relative",
        width: px,
        height: px,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer ring */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `${Math.max(2, px * 0.07)}px solid ${track}`,
          borderTopColor: accent,
          borderRightColor: accent,
          animation: "tiaSpinnerRotate 0.85s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        }}
      />
      {/* Inner pulse dot — telecare / vitals cue */}
      <Box
        sx={{
          width: px * 0.22,
          height: px * 0.22,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_LIGHT} 100%)`,
          boxShadow: darkMode
            ? "0 0 12px rgba(77, 163, 255, 0.55)"
            : "0 0 10px rgba(1, 93, 255, 0.35)",
          animation: "tiaSpinnerPulse 1.4s ease-in-out infinite",
        }}
      />
    </Box>
  );

  const label =
    message != null ? (
      <Typography
        sx={{
          mt: variant === "inline" ? 0 : 1.75,
          ml: variant === "inline" ? 1.25 : 0,
          fontFamily: APP_FONT_FAMILY,
          fontSize: size === "sm" || size === "xs" ? "13px" : "14px",
          fontWeight: 500,
          color: theme.textSecondary,
          letterSpacing: "0.01em",
          textAlign: "center",
        }}
      >
        {message}
      </Typography>
    ) : null;

  if (variant === "inline") {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          ...sx,
        }}
        role="status"
        aria-live="polite"
        aria-label={message || "Loading"}
      >
        {spinner}
        {label}
      </Box>
    );
  }

  if (variant === "section") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          px: 2,
          width: "100%",
          ...sx,
        }}
        role="status"
        aria-live="polite"
        aria-label={message || "Loading"}
      >
        {spinner}
        {label}
      </Box>
    );
  }

  if (variant === "overlay") {
    return (
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: darkMode
            ? "rgba(11, 29, 53, 0.72)"
            : "rgba(240, 244, 248, 0.82)",
          backdropFilter: "blur(2px)",
          ...sx,
        }}
        role="status"
        aria-live="polite"
        aria-label={message || "Loading"}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            px: 3,
            py: 2.5,
            borderRadius: "16px",
            background: darkMode ? "rgba(17, 35, 57, 0.95)" : "rgba(255,255,255,0.96)",
            border: `1px solid ${theme.borderColor}`,
            boxShadow: darkMode
              ? "0 12px 40px rgba(0,0,0,0.35)"
              : "0 12px 32px rgba(15, 38, 70, 0.12)",
          }}
        >
          {spinner}
          {label || (
            <Typography
              sx={{
                mt: 1.75,
                fontFamily: APP_FONT_FAMILY,
                fontSize: "14px",
                fontWeight: 500,
                color: theme.textSecondary,
              }}
            >
              Loading...
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  if (variant === "fullscreen") {
    const fullscreen = (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: theme.pageBg,
          ...sx,
        }}
        role="status"
        aria-live="polite"
        aria-label={message || "Loading"}
      >
        {spinner}
        {label || (
          <Typography
            sx={{
              mt: 2,
              fontFamily: APP_FONT_FAMILY,
              fontSize: "15px",
              fontWeight: 500,
              color: theme.textSecondary,
            }}
          >
            Loading...
          </Typography>
        )}
      </Box>
    );

    return createPortal(fullscreen, document.body);
  }

  // page
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: variant === "page" ? "min(320px, 50vh)" : undefined,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: theme.pageBg,
        py: 6,
        ...sx,
      }}
      role="status"
      aria-live="polite"
      aria-label={message || "Loading"}
    >
      {spinner}
      {label || (
        <Typography
          sx={{
            mt: 2,
            fontFamily: APP_FONT_FAMILY,
            fontSize: "15px",
            fontWeight: 500,
            color: theme.textSecondary,
          }}
        >
          Loading...
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
