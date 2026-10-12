import { useCallback } from "react";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import { useThemeMode, getTheme } from "../context/ThemeContext";
import { getPhysicianSession } from "../utils/physicianSession";
import { chatNotificationEmoji } from "../hooks/useAviationChatNotification";

/**
 * In-app "socket notification" banner shown whenever an aviation chat message
 * arrives while the web app (Chrome tab) is open and the user isn't already
 * looking at that conversation. Clicking a banner deep-links to the case and
 * opens the chat panel.
 */
const ChatNotificationBanner = ({ banners = [], onDismiss }) => {
  const { darkMode } = useThemeMode();
  const theme = getTheme(darkMode);
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpen = useCallback(
    (banner) => {
      onDismiss?.(banner.id);

      if (!getPhysicianSession()?.id) return;

      // Already sitting on this case's details page? Just pop the chat panel
      // open instead of re-navigating (avoids a remount).
      const sameCase =
        (banner.incidentId &&
          location.pathname === "/CaseDetails" &&
          String(location.state?.incidentId) === String(banner.incidentId)) ||
        (!banner.incidentId && location.pathname === "/CaseDetails");

      if (sameCase) {
        window.dispatchEvent(
          new CustomEvent("aviation:open-case-chat", {
            detail: { incidentId: banner.incidentId, roomId: banner.roomId },
          }),
        );
        return;
      }

      if (!banner.incidentId) {
        window.focus();
        return;
      }

      navigate("/CaseDetails", {
        state: {
          incidentId: banner.incidentId,
          patient: banner.patientName
            ? {
                name: banner.patientName,
                incidentId: banner.incidentId,
                crew: banner.sender,
                crewId: banner.senderId,
                chatRoomId: banner.roomId,
              }
            : null,
          physicianAssigned: true,
          crewId: banner.senderId,
          crewName: banner.sender,
          roomId: banner.roomId,
          openChatOnLoad: true,
        },
      });
    },
    [location.pathname, location.state?.incidentId, navigate, onDismiss],
  );

  if (!banners.length) return null;
  if (!getPhysicianSession()?.id) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        width: { xs: "calc(100vw - 32px)", sm: 340 },
      }}
    >
      {banners.map((banner) => {
        const emoji = chatNotificationEmoji(banner.type);
        return (
          <Box
            key={banner.id}
            role="button"
            tabIndex={0}
            onClick={() => handleOpen(banner)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpen(banner);
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              p: 1.25,
              borderRadius: "14px",
              cursor: "pointer",
              background: darkMode ? theme.modalSurface : theme.cardBg,
              color: theme.textPrimary,
              border: `1px solid ${theme.borderColor}`,
              boxShadow: "0 8px 24px rgba(2, 32, 71, 0.18)",
              transition:
                "transform 0.15s ease, box-shadow 0.15s ease, background 0.3s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 12px 30px rgba(2, 32, 71, 0.26)",
                background: darkMode ? "#1B3354" : "#F7FAFF",
              },
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: "#0A5FFF",
                color: "#fff",
                flexShrink: 0,
                fontSize: 18,
              }}
            >
              {emoji || <ChatIcon sx={{ fontSize: 18 }} />}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}
                  noWrap
                >
                  {banner.sender}
                </Typography>
                {banner.timestamp && (
                  <Typography
                    sx={{ fontSize: 10, color: theme.textMuted, flexShrink: 0 }}
                  >
                    {banner.timestamp}
                  </Typography>
                )}
              </Box>

              {banner.patientName && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#0A5FFF",
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                  noWrap
                >
                  {banner.patientName}
                </Typography>
              )}

              <Typography
                sx={{ fontSize: 12, color: theme.textSecondary }}
                noWrap
              >
                {banner.preview}
              </Typography>
            </Box>

            <IconButton
              size="small"
              aria-label="Dismiss notification"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss?.(banner.id);
              }}
              sx={{ color: theme.textMuted, flexShrink: 0 }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        );
      })}
    </Box>
  );
};

ChatNotificationBanner.propTypes = {
  banners: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      roomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      incidentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      senderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      sender: PropTypes.string,
      preview: PropTypes.string,
      patientName: PropTypes.string,
      timestamp: PropTypes.string,
      type: PropTypes.string,
    }),
  ),
  onDismiss: PropTypes.func,
};

export default ChatNotificationBanner;
