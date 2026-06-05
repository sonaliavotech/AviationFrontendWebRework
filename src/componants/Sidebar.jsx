import { useNavigate, useLocation } from "react-router-dom";
import { Box, Tooltip, tooltipClasses, Typography } from "@mui/material";
import * as AppAssets from "../assets/Assets";
import logo from "../assets/logo2.png";
import HelpIcon from "@mui/icons-material/Help";

const SIDEBAR_BG     = "rgba(11, 29, 53, 1)";
const SIDEBAR_BORDER = "rgba(255, 255, 255, 0.08)";
const ACTIVE_BG      = "rgba(1, 93, 255, 0.22)";
const ACTIVE_COLOR   = "#4DA3FF";
const INACTIVE_COLOR = "#FFFFFF";

const ITEM_SIZE = 64;
const ITEM_GAP  = "12px";

const Sidebar = ({ onAiClick, onRequestClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname || "/";

  const mainItems = [
    { label: "All Events", Icon: AppAssets.AllEventsIcon, path: "/all-events", hoverable: true },
    { label: "Search Kit", Icon: AppAssets.SearchKitIcon, path: "/search-kit", hoverable: true },
    {                      Icon: AppAssets.TiaAiIcon,     isAi: true,          hoverable: false },
  ];

  const logoutItem   = { label: "Logout",   Icon: AppAssets.LogoutIcon,   path: "/sign-in",  showLabel: true,  hoverable: false };
  const helpItem     = { label: "Help",     Icon: HelpIcon,               path: "/help",     showLabel: false, hoverable: false };
  const settingsItem = { label: "Settings", Icon: AppAssets.SettingsIcon, path: "/settings", showLabel: false, hoverable: false };

  const handleNavigate = (path, isAi) => {
    if (isAi) { onAiClick?.(); return; }
    navigate(path);
  };

  const isActive = (path) =>
    currentPath === path ||
    (path === "/rounding-list" && currentPath === "/view_details") ||
    (path === "/Dashboard"     && currentPath === "/encounters");

  const itemSx = (active, hoverable) => ({
    width:  ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    gap: "4px",
    flexShrink: 0,
    background: active ? ACTIVE_BG : "transparent",
    transition: "background 0.2s",
    "& svg": { fontSize: "1.4rem" },
    "& svg path":               { fill:   active ? ACTIVE_COLOR : INACTIVE_COLOR },
    "& svg path[stroke]":       { stroke: active ? ACTIVE_COLOR : INACTIVE_COLOR },
    ...(hoverable && {
      "&:hover":                  { background: ACTIVE_BG },
      "&:hover svg path":         { fill:   ACTIVE_COLOR },
      "&:hover svg path[stroke]": { stroke: ACTIVE_COLOR },
    }),
  });

  const aiItemSx = {
    width:  ITEM_SIZE,
    height: ITEM_SIZE,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
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

    if (item.isAi) {
      return (
        <TooltipWrap title={item.label}>
          <Box sx={aiItemSx} onClick={() => handleNavigate(item.path, true)}>
            <Icon />
          </Box>
        </TooltipWrap>
      );
    }

    return (
      <TooltipWrap title={item.label}>
        <Box
          sx={itemSx(active, item.hoverable)}
          onClick={() => handleNavigate(item.path, false)}
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
        <Box sx={itemSx(active, false)} onClick={() => handleNavigate(item.path)}>
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
        width: { xs: 80, sm: 90, md: 100 },
        flexShrink: 0,
        background: SIDEBAR_BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRight: `1px solid ${SIDEBAR_BORDER}`,
        minHeight: "100vh",
        boxSizing: "border-box",
        overflowY: "auto",
        pt: "16px",   // top padding
        pb: "12px",   // bottom padding
      }}
    >
      {/* Logo — mb matches ITEM_GAP so logo→AllEvents = AllEvents→SearchKit */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          mb: "24px",   // ← explicit margin-bottom = 2× ITEM_GAP for clear visual separation
        }}
      >
        <img
          src={logo}
          alt="TiaTELE"
          style={{ width: 55, height: 55, objectFit: "contain" }}
        />
      </Box>

      {/* Main nav */}
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
      </Box>

      {/* Bottom items */}
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
        <BottomItem item={logoutItem} />
        <BottomItem item={helpItem} />
        <BottomItem item={settingsItem} />
      </Box>
    </Box>
  );
};

export default Sidebar;