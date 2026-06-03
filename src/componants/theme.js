import { createTheme } from "@mui/material";

export const colorTokens = {
  primary: "#015DFF",
  primarySoft: "rgba(1, 93, 255, 0.18)",
  bgApp: "rgba(11, 29, 53, 1)",
  sidebarActiveBg: "rgba(1, 93, 255, 0.22)",
  sidebarIconActive: "#4DA3FF",
  bgPaper: "rgba(15, 38, 70, 1)",
  border: "rgba(255,255,255,0.08)",
  borderSoft: "rgba(255,255,255,0.06)",
  textPrimary: "#E8EDF5",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  white: "#FFFFFF",
};

// Add this theme object
export const theme = {
  colors: {
    surface: colorTokens.bgPaper,
    border: colorTokens.borderSoft,
    primary: colorTokens.primary,
    text: {
      primary: colorTokens.textPrimary,
      secondary: colorTokens.textSecondary,
      tertiary: "#94A3B8",
      inverse: "#FFFFFF"
    }
  },
  borderRadius: {
    lg: "12px",
    md: "8px",
    sm: "4px",
    full: "9999px"
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    6: "24px",
    8: "32px"
  },
  typography: {
    sizes: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      '2xl': "24px"
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
  }
};

const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: colorTokens.primary, contrastText: colorTokens.white },
    background: { default: colorTokens.bgApp, paper: colorTokens.bgPaper },
    text: {
      primary: colorTokens.textPrimary,
      secondary: colorTokens.textSecondary,
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", borderRadius: 8 } },
    },
  },
});

export default appTheme;