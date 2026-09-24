import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Tooltip,
  tooltipClasses,
  Typography,
  Switch,
} from "@mui/material";

import * as AppAssets from "../assets/Assets";

import { useThemeMode } from "../context/ThemeContext";
import { clearPhysicianSession } from "../utils/physicianSession";
import AviationChatSocket from "../services/AviationChatSocket";
import AviationCallSocket from "../services/AviationCallSocket";
import PhysicianStatusService from "../services/PhysicianStatusService";
import NotificationPanel from "../pages/AllEvents/Alert";
import PhysicianDirectory from "./PhysicianDirectory";

// NEW LOGO
import logo from "../assets/logo copy.png";

const ITEM_SIZE = 64;
const ITEM_GAP = "12px";

const Sidebar = ({ onAiClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname || "/";

  const { darkMode, toggleTheme, tokens } = useThemeMode();

  const [openAlert, setOpenAlert] = useState(false);
  const [openDirectory, setOpenDirectory] = useState(false);

  // ============================================================
  // MAIN NAVIGATION ITEMS
  // ============================================================

  const mainItems = [
    {
      label: "All Events",
      Icon: AppAssets.AllEventsIcon,
      path: "/all-events",
      hoverable: true,
    },
    {
      label: "Search Kit",
      Icon: AppAssets.SearchKitIcon,
      path: "/find-medicine",
      hoverable: true,
    },
    {
      label: "Tia AI",
      Icon: AppAssets.TiaAiIcon,
      isAi: true,
      hoverable: false,
    },
    {
      label: "Directory",
      Icon: AppAssets.DirectoryIcon,
      isDirectory: true,
      hoverable: true,
    },
    {
      label: "FAQs",
      Icon: AppAssets.FAQsIcon,
      path: "/faqs",
      hoverable: true,
    },
    {
      label: "Alerts",
      Icon: AppAssets.AlertsIcon,
      isAlert: true,
      hoverable: true,
    },
  ];

  // ============================================================
  // LOGOUT
  // ============================================================

  const logoutItem = {
    label: "Logout",
    Icon: AppAssets.LogoutIcon,
    path: "/sign-in",
    showLabel: true,
  };

  // ============================================================
  // NAVIGATION HANDLER
  // ============================================================

  const handleNavigate = (
    path,
    isAi,
    isAlert,
    isDirectory
  ) => {
    if (isAi) {
      onAiClick?.();
      return;
    }

    if (isAlert) {
      setOpenAlert(true);
      return;
    }

    if (isDirectory) {
      setOpenDirectory(true);
      return;
    }

    if (path === "/sign-in") {
      // Mark physician offline before disconnecting sockets
      PhysicianStatusService.markOfflineOnLogout();

      AviationChatSocket.disconnect();
      AviationCallSocket.disconnect();

      clearPhysicianSession();
    }

    navigate(path);
  };

  // ============================================================
  // ACTIVE ITEM
  // ============================================================

  const isActive = (path) => currentPath === path;

  // ============================================================
  // NAV ITEM STYLE
  // ============================================================

  const itemSx = (active, hoverable) => ({
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: "10px",

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

    cursor: "pointer",
    gap: "4px",
    flexShrink: 0,

    background: active
      ? tokens.sidebarActiveBg
      : "transparent",

    color: active
      ? tokens.sidebarActive
      : tokens.sidebarInactive,

    transition:
      "background 0.2s ease, color 0.2s ease",

    "& svg": {
      fontSize: "1.4rem",
    },

    "& svg path": {
      fill: active
        ? tokens.sidebarActive
        : tokens.sidebarInactive,
    },

    "& svg path[stroke]": {
      stroke: active
        ? tokens.sidebarActive
        : tokens.sidebarInactive,
    },

    ...(hoverable && {
      "&:hover": {
        background: tokens.sidebarActiveBg,
      },

      "&:hover svg path": {
        fill: tokens.sidebarActive,
      },

      "&:hover svg path[stroke]": {
        stroke: tokens.sidebarActive,
      },
    }),
  });

  // ============================================================
  // AI ITEM STYLE
  // ============================================================

  const aiItemSx = {
    width: ITEM_SIZE,
    height: ITEM_SIZE,

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

    cursor: "pointer",
    gap: "4px",
    flexShrink: 0,
  };

  // ============================================================
  // LABEL STYLE
  // ============================================================

  const labelSx = (active) => ({
    fontSize: "0.58rem",
    fontWeight: active ? 700 : 400,

    color: active
      ? tokens.sidebarActive
      : tokens.sidebarInactive,

    textAlign: "center",
    lineHeight: 1,

    userSelect: "none",
    whiteSpace: "nowrap",

    transition: "color 0.2s ease",
  });

  // ============================================================
  // TOOLTIP
  // ============================================================

  const TooltipWrap = ({ title, children }) => (
    <Tooltip
      title={title}
      placement="right"
      arrow
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: darkMode
              ? "#000"
              : "#0F2646",

            color: "#fff",
            fontSize: "0.72rem",

            [`& .${tooltipClasses.arrow}`]: {
              color: darkMode
                ? "#000"
                : "#0F2646",
            },
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );

  // ============================================================
  // NAV ITEM COMPONENT
  // ============================================================

  const NavItem = ({ item }) => {
    const active =
      !item.isAi &&
      !item.isAlert &&
      !item.isDirectory &&
      isActive(item.path);

    const { Icon } = item;

    // AI
    if (item.isAi) {
      return (
        <TooltipWrap title={item.label}>
          <Box
            sx={aiItemSx}
            onClick={() =>
              handleNavigate(null, true, false)
            }
          >
            <Icon />

            <Typography sx={labelSx(false)}>
              {item.label}
            </Typography>
          </Box>
        </TooltipWrap>
      );
    }

    // NORMAL ITEM
    return (
      <TooltipWrap title={item.label}>
        <Box
          sx={itemSx(
            active,
            item.hoverable
          )}
          onClick={() =>
            handleNavigate(
              item.path,
              item.isAi,
              item.isAlert,
              item.isDirectory
            )
          }
        >
          <Icon />

          <Typography sx={labelSx(active)}>
            {item.label}
          </Typography>
        </Box>
      </TooltipWrap>
    );
  };

  // ============================================================
  // LOGO
  // ============================================================

  const logoTextPrimary =
    darkMode
      ? "#FFFFFF"
      : tokens.sidebarActive;

  const logoTextSecondary =
    tokens.primary || "#1976D2";

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <>
      <Box
        component="aside"
        data-theme={darkMode ? "dark" : "light"}
        sx={{
          width: {
            xs: 80,
            sm: 90,
            md: 100,
          },

          flexShrink: 0,

          bgcolor: tokens.sidebarBg,
          backgroundColor: "var(--sidebar-bg)",

          display: "flex",
          flexDirection: "column",
          alignItems: "center",

          borderRight: "1px solid",
          borderColor: "var(--sidebar-border)",

          minHeight: {
            xs: "100dvh",
            md: "100vh",
          },

          boxSizing: "border-box",

          overflowY: "auto",

          pt: "16px",
          pb: "12px",

          transition:
            "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >

        {/* ======================================================
            LOGO
        ====================================================== */}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

            flexShrink: 0,

            mb: "24px",

            width: "100%",

            px: "6px",
          }}
        >

          {/* LOGO IMAGE */}

          <Box
            component="img"
            src={logo}
            alt="Telecare Health"
            sx={{
              width: {
                xs: 58,
                sm: 62,
                md: 64,
              },

              height: {
                xs: 58,
                sm: 62,
                md: 64,
              },

              objectFit: "contain",

              display: "block",

              transition:
                "width 0.3s ease, height 0.3s ease",
            }}
          />

{/* LOGO TEXT */}
<Typography
  component="div"
  sx={{
    mt: "5px",

    fontSize: {
      xs: "8px",
      sm: "8.5px",
      md: "9px",
    },

    fontWeight: 600,
    letterSpacing: "0.5px",
    lineHeight: 1.1,

    textAlign: "center",
    userSelect: "none",

    // IMPORTANT: keep the text in two rows
    display: "flex",
    flexDirection: "column",
    alignItems: "center",

    transition: "color 0.3s ease",
  }}
>
  <Box
    component="span"
    sx={{
      color: logoTextPrimary,
      display: "block",
      whiteSpace: "nowrap",
    }}
  >
    TELECARE
  </Box>

  <Box
    component="span"
    sx={{
      color: logoTextSecondary,
      display: "block",
      whiteSpace: "nowrap",
    }}
  >
    HEALTH
  </Box>
</Typography>
        </Box>

        {/* ======================================================
            MAIN NAVIGATION
        ====================================================== */}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",

            gap: ITEM_GAP,

            flex: 1,

            width: "100%",

            px: "8px",
          }}
        >

          {mainItems.map((item, i) => (
            <NavItem
              key={i}
              item={item}
            />
          ))}

          {/* ==================================================
              THEME TOGGLE
          ================================================== */}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",

              gap: "4px",

              mt: "4px",
            }}
          >

            {/* SUN */}

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
                fill={
                  !darkMode
                    ? tokens.sidebarActive
                    : tokens.sidebarInactive
                }
              />

              <path
                d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
                stroke={
                  !darkMode
                    ? tokens.sidebarActive
                    : tokens.sidebarInactive
                }
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            {/* SWITCH */}

            <Switch
              checked={darkMode}
              onChange={toggleTheme}
              size="small"
              slotProps={{
                input: {
                  "aria-label":
                    "Dark mode toggle",
                },
              }}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked":
                  {
                    color:
                      tokens.sidebarActive,
                  },

                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                  {
                    backgroundColor:
                      tokens.sidebarActive,
                  },

                "& .MuiSwitch-track": {
                  backgroundColor:
                    tokens.sidebarSwitchTrack,
                },
              }}
            />

            {/* MOON */}

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
                fill={
                  darkMode
                    ? tokens.sidebarActive
                    : tokens.sidebarInactive
                }
              />
            </svg>
          </Box>
        </Box>

        {/* ======================================================
            LOGOUT
        ====================================================== */}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",

            gap: ITEM_GAP,

            width: "100%",

            px: "8px",

            flexShrink: 0,
          }}
        >

          <TooltipWrap title={logoutItem.label}>
            <Box
              sx={itemSx(false, false)}
              onClick={() =>
                handleNavigate(
                  logoutItem.path
                )
              }
            >
              <logoutItem.Icon />

              <Typography
                sx={labelSx(false)}
              >
                {logoutItem.label}
              </Typography>
            </Box>
          </TooltipWrap>

        </Box>
      </Box>

      {/* ========================================================
          ALERT PANEL
      ======================================================== */}

      {openAlert && (
        <NotificationPanel
          open={openAlert}
          onClose={() =>
            setOpenAlert(false)
          }
        />
      )}

      {/* ========================================================
          PHYSICIAN DIRECTORY
      ======================================================== */}

      <PhysicianDirectory
        open={openDirectory}
        onClose={() =>
          setOpenDirectory(false)
        }
      />
    </>
  );
};

export default Sidebar;