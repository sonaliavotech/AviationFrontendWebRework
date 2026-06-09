import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Tooltip,
  tooltipClasses,
  Typography,
  Switch,
} from "@mui/material";
import * as AppAssets from "../assets/Assets";
import logoDark from "../assets/logo1.png";
import logoLight from "../assets/logo2.png";
import { useThemeMode } from "../context/ThemeContext";
import NotificationPanel from "../pages/AllEvents/Alert";

const ITEM_SIZE = 64;
const ITEM_GAP = "12px";

const Sidebar = ({ onAiClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname || "/";
  const { darkMode, toggleTheme, tokens } = useThemeMode();
  const [openAlert, setOpenAlert] = useState(false);

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
      path: "/search-kit",
      hoverable: true,
    },
    {
      label: "Tia AI",
      Icon: AppAssets.TiaAiIcon,
      isAi: true,
      hoverable: false,
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

  const logoutItem = {
    label: "Logout",
    Icon: AppAssets.LogoutIcon,
    path: "/sign-in",
    showLabel: true,
  };

  const handleNavigate = (path, isAi, isAlert) => {
    if (isAi) {
      onAiClick?.();
      return;
    }

    if (isAlert) {
      setOpenAlert(true);
      return;
    }

    if (path === "/sign-in") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }

    navigate(path);
  };

  const isActive = (path) => currentPath === path;

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
    background: active ? tokens.sidebarActiveBg : "transparent",
    color: active ? tokens.sidebarActive : tokens.sidebarInactive,
    transition: "background 0.2s, color 0.2s",
    "& svg": { fontSize: "1.4rem" },
    "& svg path": {
      fill: active ? tokens.sidebarActive : tokens.sidebarInactive,
    },
    "& svg path[stroke]": {
      stroke: active ? tokens.sidebarActive : tokens.sidebarInactive,
    },
    ...(hoverable && {
      "&:hover": { background: tokens.sidebarActiveBg },
      "&:hover svg path": { fill: tokens.sidebarActive },
      "&:hover svg path[stroke]": { stroke: tokens.sidebarActive },
    }),
  });

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

  const labelSx = (active) => ({
    fontSize: "0.58rem",
    fontWeight: active ? 700 : 400,
    color: active ? tokens.sidebarActive : tokens.sidebarInactive,
    textAlign: "center",
    lineHeight: 1,
    userSelect: "none",
    whiteSpace: "nowrap",
    transition: "color 0.2s",
  });

  const TooltipWrap = ({ title, children }) => (
    <Tooltip
      title={title}
      placement="right"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: darkMode ? "#000" : "#0F2646",
            color: "#fff",
            fontSize: "0.72rem",
            [`& .${tooltipClasses.arrow}`]: {
              color: darkMode ? "#000" : "#0F2646",
            },
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );

  const NavItem = ({ item }) => {
    const active = !item.isAi && !item.isAlert && isActive(item.path);
    const { Icon } = item;

    if (item.isAi) {
      return (
        <TooltipWrap title={item.label}>
          <Box sx={aiItemSx} onClick={() => handleNavigate(null, true, false)}>
            <Icon />
            <Typography sx={labelSx(false)}>{item.label}</Typography>
          </Box>
        </TooltipWrap>
      );
    }

    return (
      <TooltipWrap title={item.label}>
        <Box
          sx={itemSx(active, item.hoverable)}
          onClick={() => handleNavigate(item.path, false, item.isAlert)}
        >
          <Icon />
          <Typography sx={labelSx(active)}>{item.label}</Typography>
        </Box>
      </TooltipWrap>
    );
  };

  return (
    <>
      <Box
        component="aside"
        data-theme={darkMode ? "dark" : "light"}
        sx={{
          width: { xs: 80, sm: 90, md: 100 },
          flexShrink: 0,
          bgcolor: tokens.sidebarBg,
          backgroundColor: "var(--sidebar-bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRight: "1px solid",
          borderColor: "var(--sidebar-border)",
          minHeight: "100vh",
          boxSizing: "border-box",
          overflowY: "auto",
          pt: "16px",
          pb: "12px",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexShrink: 0,
            mb: "24px",
          }}
        >
          <img
            src={darkMode ? logoDark : logoLight}
            alt="TiaTELE"
            style={{ width: 55, height: 55, objectFit: "contain" }}
          />
        </Box>

        {/* Main Nav Items */}
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
            <NavItem key={i} item={item} />
          ))}

          {/* Theme Toggle */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              mt: "4px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
                fill={!darkMode ? tokens.sidebarActive : tokens.sidebarInactive}
              />
              <path
                d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
                stroke={
                  !darkMode ? tokens.sidebarActive : tokens.sidebarInactive
                }
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <Switch
              checked={darkMode}
              onChange={toggleTheme}
              size="small"
              inputProps={{ "aria-label": "Dark mode toggle" }}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: tokens.sidebarActive,
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: tokens.sidebarActive,
                },
                "& .MuiSwitch-track": {
                  backgroundColor: tokens.sidebarSwitchTrack,
                },
              }}
            />

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
                fill={darkMode ? tokens.sidebarActive : tokens.sidebarInactive}
              />
            </svg>
          </Box>
        </Box>

        {/* Logout */}
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
              onClick={() => handleNavigate(logoutItem.path)}
            >
              <logoutItem.Icon />
              <Typography sx={labelSx(false)}>{logoutItem.label}</Typography>
            </Box>
          </TooltipWrap>
        </Box>
      </Box>

      {openAlert && (
        <NotificationPanel
          open={openAlert}
          onClose={() => setOpenAlert(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
