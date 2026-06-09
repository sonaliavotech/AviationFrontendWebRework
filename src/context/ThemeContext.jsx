import React, { createContext, useContext, useState, useMemo, useLayoutEffect } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// ─── Raw token maps (still available for components that need specific values) ─
export const DARK = {
  pageBg:           "#0B1D35",
  cardBg:           "#112339",
  headerBg:         "#0B1D35",
  tableHeadBg:      "#21324B",
  tableRowBg:       "#112339",
  tableHoverBg:     "rgba(1,93,255,0.08)",
  inputBg:          "#0F2646",
  borderColor:      "rgba(255,255,255,0.08)",
  menuBg:           "#132035",
  popoverBg:        "#0f2035",
  textPrimary:      "#FFFFFF",
  textSecondary:    "#94A3B8",
  textMuted:        "#64748B",
  statCardBg:       "rgba(255,255,255,0.06)",
  statCardBorder:   "rgba(255,255,255,0.08)",
  divider:          "rgba(255,255,255,0.06)",
  btnOutlineBorder: "rgba(255,255,255,0.2)",
  btnOutlineText:   "#FFFFFF",
  searchBg:         "rgba(255,255,255,0.06)",
  searchBorder:     "rgba(255,255,255,0.12)",
  tableBorder:      "rgba(51,74,104,1)",
  iconColor:        "#94A3B8",
  actionIconColor:  "#FFFFFF",
  statIconBg:       "rgba(36, 59, 94, 1)",
  statIconColor:    "rgba(0, 111, 253, 1)",
  menuBorder:       "rgba(255,255,255,0.08)",
  sidebarBg:        "#0B1D35",
  sidebarBorder:    "rgba(255,255,255,0.08)",
  sidebarInactive:  "#FFFFFF",
  sidebarActive:    "#4DA3FF",
  sidebarActiveBg:  "rgba(1,93,255,0.22)",
  sidebarSwitchTrack: "#334A68",
  modalBg:          "rgba(11, 29, 53, 1)",
  modalHeaderBg:    "rgba(7, 20, 40, 1)",
  modalSurface:     "#243B63",
  modalDivider:     "#243B63",
};

export const LIGHT = {
  pageBg:           "#F0F4F8",
  cardBg:           "#FFFFFF",
  headerBg:         "#FFFFFF",
  tableHeadBg:      "#F8FAFC",
  tableRowBg:       "#FFFFFF",
  tableHoverBg:     "rgba(1,93,255,0.04)",
  inputBg:          "#FFFFFF",
  borderColor:      "#E2E8F0",
  menuBg:           "#FFFFFF",
  popoverBg:        "#FFFFFF",
  textPrimary:      "#0F2646",
  textSecondary:    "#64748B",
  textMuted:        "#94A3B8",
  statCardBg:       "#FFFFFF",
  statCardBorder:   "#E2E8F0",
  divider:          "#E2E8F0",
  btnOutlineBorder: "#CBD5E1",
  btnOutlineText:   "#334155",
  searchBg:         "#FFFFFF",
  searchBorder:     "#CBD5E1",
  tableBorder:      "#E2E8F0",
  iconColor:        "#64748B",
  actionIconColor:  "rgba(0, 111, 253, 1)",
  statIconBg:       "rgba(234, 242, 255, 1)",
  statIconColor:    "rgba(0, 111, 253, 1)",
  menuBorder:       "#E2E8F0",
  sidebarBg:        "#FFFFFF",
  sidebarBorder:    "#E2E8F0",
  sidebarInactive:  "#64748B",
  sidebarActive:    "rgba(0, 111, 253, 1)",
  sidebarActiveBg:  "rgba(0, 111, 253, 0.1)",
  sidebarSwitchTrack: "#CBD5E1",
  modalBg:          "#FFFFFF",
  modalHeaderBg:    "#FFFFFF",
  modalSurface:     "#F8FAFC",
  modalDivider:     "#E2E8F0",
};

export const getTheme = (darkMode) => darkMode ? DARK : LIGHT;

// ─── Context (for custom token access) ────────────────────────────────────────
const ThemeContext = createContext(null);

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }
  return ctx;
};

const applyCssVariables = (tokens) => {
  const root = document.documentElement;
  root.style.setProperty("--sidebar-bg", tokens.sidebarBg);
  root.style.setProperty("--sidebar-border", tokens.sidebarBorder);
  root.style.setProperty("--sidebar-inactive", tokens.sidebarInactive);
  root.style.setProperty("--sidebar-active", tokens.sidebarActive);
  root.style.setProperty("--page-bg", tokens.pageBg);
  root.style.setProperty("--text-primary", tokens.textPrimary);
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const toggleTheme = () => setDarkMode((p) => !p);
  const tokens = darkMode ? DARK : LIGHT;

  useLayoutEffect(() => {
    applyCssVariables(tokens);
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode, tokens]);

  const contextValue = useMemo(
    () => ({ darkMode, toggleTheme, tokens }),
    [darkMode, tokens],
  );

  // MUI theme — sets palette so ALL MUI components auto-switch
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          background: {
            default: tokens.pageBg,
            paper:   tokens.cardBg,
          },
          text: {
            primary:   tokens.textPrimary,
            secondary: tokens.textSecondary,
          },
          primary: { main: "#015DFF" },
          divider: tokens.divider,
        },
        components: {
          // Every Box/Paper inherits correct background
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                transition: "background-color 0.3s ease, color 0.3s ease",
              },
            },
          },
          // Inputs
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                backgroundColor: tokens.inputBg,
                transition: "background-color 0.3s ease",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: tokens.borderColor },
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              root: { color: tokens.textPrimary },
            },
          },
          // Table
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: tokens.divider,
                color: tokens.textPrimary,
                transition: "background-color 0.3s ease, color 0.3s ease",
              },
              head: {
                backgroundColor: tokens.tableHeadBg,
                color: tokens.textPrimary,
              },
              body: {
                backgroundColor: tokens.tableRowBg,
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                "&:hover td": { backgroundColor: tokens.tableHoverBg },
              },
            },
          },
          // Menu / Popover
          MuiMenu: {
            styleOverrides: {
              paper: { backgroundColor: tokens.menuBg, border: `1px solid ${tokens.borderColor}` },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                color: tokens.textPrimary,
                "&:hover": { backgroundColor: "rgba(77,163,255,0.1)" },
              },
            },
          },
          MuiPopover: {
            styleOverrides: {
              paper: { backgroundColor: tokens.popoverBg },
            },
          },
          // Pagination
          MuiTablePagination: {
            styleOverrides: {
              root: { color: tokens.textPrimary, backgroundColor: tokens.cardBg },
              selectIcon: { color: tokens.textPrimary },
              actions: { color: tokens.textPrimary },
            },
          },
          // Divider
          MuiDivider: {
            styleOverrides: {
              root: { borderColor: tokens.divider },
            },
          },
          // Chip
          MuiChip: {
            styleOverrides: {
              root: { transition: "background-color 0.3s ease" },
            },
          },
          // Button — outlined variant inherits border color
          MuiButton: {
            styleOverrides: {
              outlinedPrimary: {
                borderColor: tokens.btnOutlineBorder,
                color: tokens.btnOutlineText,
              },
            },
          },
        },
        transitions: {
          duration: { shortest: 150, shorter: 200, short: 250, standard: 300 },
        },
      }),
    [darkMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline /> {/* applies background.default to <body> automatically */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
