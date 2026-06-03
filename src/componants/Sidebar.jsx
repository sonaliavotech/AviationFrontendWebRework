import { useNavigate, useLocation } from "react-router-dom";
import { Box, Tooltip, tooltipClasses, Typography } from "@mui/material";
import * as AppAssets from "../assets/Assets";
import logo from "../assets/logo2.png";

// Dark theme constants
const SIDEBAR_BG        = "rgba(11, 29, 53, 1)";
const SIDEBAR_BORDER    = "rgba(255, 255, 255, 0.08)";
const ACTIVE_BG         = "rgba(1, 93, 255, 0.22)";
const ACTIVE_COLOR      = "#4DA3FF";
const INACTIVE_COLOR    = "#FFFFFF";

const Sidebar = ({ onAiClick, onRequestClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname || "/";

  // Main nav items (icon + label)
  const mainItems = [
    { label: "All Events",  Icon: AppAssets.AllEventsIcon,  path: "/all-events" },
    { label: "New Event",   Icon: AppAssets.NewEventIcon,   path: "/new-event" },
    { label: "Search Kit",  Icon: AppAssets.SearchKitIcon,  path: "/search-kit" },
    { label: "FAQs",        Icon: AppAssets.FAQsIcon,       path: "/faqs" },
    { label: "Tia AI",      Icon: AppAssets.TiaAiIcon,      path: "/Ai", isAi: true },
    { label: "Devices",     Icon: AppAssets.DevisecIcon,    path: "/devices" },
    { label: "Alerts",      Icon: AppAssets.AlertsIcon,     path: "/alerts" },
  ];

  // Bottom items
  const logoutItem   = { label: "Logout",   Icon: AppAssets.LogoutIcon,   path: "/logout",   showLabel: true  };
  const helpItem     = { label: "Help",      Icon: AppAssets.HelpIcon,     path: "/help",     showLabel: false };
  const settingsItem = { label: "Settings",  Icon: AppAssets.SettingsIcon, path: "/settings", showLabel: false };

  const handleNavigate = (path, isAi) => {
    if (isAi) {
      onAiClick?.();
      onRequestClose?.();
      return;
    }
    navigate(path);
    onRequestClose?.();
  };

  const isActive = (path) =>
    currentPath === path ||
    (path === "/rounding-list" && currentPath === "/view_details") ||
    (path === "/Dashboard"     && currentPath === "/encounters");

  /* ── styles ── */
  const itemSx = (active) => ({
    width: 64,
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    py: "6px",
    px: "4px",
    gap: "2px",
    background: active ? ACTIVE_BG : "transparent",
    "& svg path":         { fill:   active ? ACTIVE_COLOR : INACTIVE_COLOR },
    "& svg path[stroke]": { stroke: active ? ACTIVE_COLOR : INACTIVE_COLOR },
    "&:hover":                        { background: ACTIVE_BG },
    "&:hover svg path":               { fill:   ACTIVE_COLOR },
    "&:hover svg path[stroke]":       { stroke: ACTIVE_COLOR },
  });

  const aiItemSx = {
    width: 64,
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    py: "6px",
    px: "4px",
    gap: "2px",
  };

  const labelSx = (active) => ({
    fontSize: "0.58rem",
    fontWeight: active ? 700 : 400,
    color: active ? ACTIVE_COLOR : INACTIVE_COLOR,
    textAlign: "center",
    lineHeight: 1,
    userSelect: "none",
    whiteSpace: "nowrap",
  });

  const TooltipWrap = ({ title, children }) => (
    <Tooltip
      title={title}
      placement="right"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: "#000",
            color: "#fff",
            fontSize: "0.72rem",
            [`& .${tooltipClasses.arrow}`]: { color: "#000" },
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );

  const NavItem = ({ item }) => {
    const active = !item.isAi && isActive(item.path);
    const { Icon } = item;
    return (
      <TooltipWrap title={item.label}>
        <Box
          sx={item.isAi ? aiItemSx : itemSx(active)}
          onClick={() => handleNavigate(item.path, item.isAi)}
        >
          <Icon />
          <Typography sx={labelSx(active)}>{item.label}</Typography>
        </Box>
      </TooltipWrap>
    );
  };

  const BottomItem = ({ item }) => {
    const active = isActive(item.path);
    const { Icon } = item;
    return (
      <TooltipWrap title={item.label}>
        <Box sx={itemSx(active)} onClick={() => handleNavigate(item.path)}>
          <Icon />
          {item.showLabel && (
            <Typography sx={labelSx(active)}>{item.label}</Typography>
          )}
        </Box>
      </TooltipWrap>
    );
  };

  return (
    <Box
      component="aside"
      sx={{
        width: 80,
        flexShrink: 0,
        background: SIDEBAR_BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        borderRight: `1px solid ${SIDEBAR_BORDER}`,
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 2,
          gap: "2px",
        }}
      >
        <img
          src={logo}
          alt="TiaTELE"
          style={{ width: 44, height: 44, objectFit: "contain" }}
        />
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.02em",
            userSelect: "none",
          }}
        >
          Tia<span style={{ color: "#4DA3FF" }}>TELE</span>
        </Typography>
      </Box>

      {/* Main nav */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          flex: 1,
        }}
      >
        {mainItems.map((item, i) => (
          <NavItem key={i} item={item} />
        ))}
      </Box>

      {/* Bottom: Logout (with label) + Help + Settings (no label) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          pb: 1,
        }}
      >
        <BottomItem item={logoutItem} />
        <BottomItem item={helpItem} />
        <BottomItem item={settingsItem} />
      </Box>
    </Box>
  );
};

export default Sidebar;
