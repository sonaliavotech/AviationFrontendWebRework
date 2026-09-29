import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Chip,
  Fade,
  Modal,
  Backdrop,
} from "@mui/material";
import {
  CallEnd,
  Videocam,
  VideocamOff,
  VolumeUp,
  Person,
  Phone,
  Mic,
  MicOff,
  ScreenShare,
} from "@mui/icons-material";
import ringtone from "../../assets/ringtone.mp3";
import {
  resolveCallDisplayName,
  resolvePatientName,
  resolveRoleLabel,
  resolveCallerRole,
  resolveHasVideo,
} from "../../utils/aviationCallDisplay";

const IncomingCallScreen = ({
  callData,
  onAccept,
  onReject,
  onHangup,
  isRinging = true,
  callerImage,
  open = true,
  onClose,
  airlineName, // optional: overrides the airline pill text
}) => {
  const patientName = resolvePatientName(callData);
  const displayName = resolveCallDisplayName(callData);
  const callerRole = resolveCallerRole(callData);
  const hasVideo = resolveHasVideo(callData);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!hasVideo);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const audioRef = useRef(null);

  const airline =
    airlineName ||
    callData?.airlineName ||
    callData?.airline?.name ||
    "SkyLink Airways";

  const stopRingtone = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Play ringtone when incoming call is active
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(ringtone);
      audioRef.current.loop = true;
    }

    if (isRinging && open) {
      audioRef.current
        .play()
        .catch((err) => console.log("Ringtone play failed:", err));
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [isRinging, open]);

  // Auto-dismiss ringing after 30 seconds
  useEffect(() => {
    if (!isRinging || !open) return;
    const timer = setTimeout(() => {
      onReject?.({
        callId: callData?.callId,
        roomId: callData?.roomId,
        rejectedBy: callData?.toUserId,
        fromUserId: callData?.fromUserId,
      });
    }, 30000);

    return () => clearTimeout(timer);
  }, [isRinging, callData, onReject, open]);

  // Call duration timer
  useEffect(() => {
    if (isRinging || !open) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRinging, open]);

  // Auto-hide controls after 5 seconds in active call
  useEffect(() => {
    if (isRinging || isHovering || !open) return;
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isRinging, isHovering, open]);

  // Show controls again whenever the pointer comes back
  useEffect(() => {
    if (isHovering) setShowControls(true);
  }, [isHovering]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const roleLabel = resolveRoleLabel(callerRole);
  const subtitle = isRinging
    ? `${roleLabel} • Incoming ${hasVideo ? "Video" : "Audio"} Call`
    : `${roleLabel} • ${formatDuration(callDuration)}`;

  const circleBtn = {
    width: 64,
    height: 64,
    color: "#ffffff",
    transition: "all 0.25s ease",
    "&:hover": { transform: "scale(1.06)" },
  };

  const activeBtn = (active) => ({
    width: 46,
    height: 46,
    background: active ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)",
    color: active ? "#ef4444" : "#ffffff",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.25s ease",
    "&:hover": {
      background: active ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.12)",
      transform: "scale(1.05)",
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          background: "rgba(8, 14, 28, 0.92)",
        },
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <Fade in={open} timeout={400}>
        <Box
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          sx={{
            width: "100%",
            maxWidth: 320,
            mx: 2,
            outline: "none",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              px: 3,
              pt: 4,
              pb: 3.5,
              borderRadius: "22px",
              background: "linear-gradient(180deg, #12274d 0%, #0f2144 100%)",
              border: "1px solid rgba(59,130,246,0.25)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {/* Airline pill */}
            <Chip
              size="small"
              label={airline}
              sx={{
                background: "rgba(59,130,246,0.15)",
                color: "#60a5fa",
                border: "1px solid rgba(96,165,250,0.5)",
                fontWeight: 600,
                fontSize: "12px",
                height: 24,
                "& .MuiChip-label": { px: 1.5 },
              }}
            />

            {/* Avatar with halo */}
            <Box
              sx={{
                mt: 1.5,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(59,130,246,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...(isRinging && {
                  animation: "haloPulse 2s ease-in-out infinite",
                  "@keyframes haloPulse": {
                    "0%, 100%": { transform: "scale(1)", opacity: 0.85 },
                    "50%": { transform: "scale(1.06)", opacity: 1 },
                  },
                }),
              }}
            >
              <Avatar
                src={callerImage}
                sx={{
                  width: 70,
                  height: 70,
                  background: "#1e3a8a",
                  border: "3px solid #3b82f6",
                  color: "#93c5fd",
                }}
              >
                <Person sx={{ fontSize: 34 }} />
              </Avatar>
            </Box>

            {/* Caller info */}
            <Box sx={{ mt: 2.2 }}>
              {patientName && (
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    mb: 0.3,
                  }}
                >
                  Patient
                </Typography>
              )}
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#ffffff",
                  fontSize: "22px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.3px",
                }}
              >
                {displayName}
              </Typography>
              <Typography
                sx={{
                  color: "#60a5fa",
                  fontSize: "13px",
                  mt: 0.8,
                }}
              >
                {subtitle}
              </Typography>
            </Box>

            {/* Controls */}
            <Box sx={{ mt: 3, width: "100%" }}>
              {isRinging ? (
                <Box
                  sx={{
                    display: "flex",
                    gap: 5,
                    justifyContent: "center",
                  }}
                >
                  {/* Decline */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        stopRingtone();
                        onReject?.({
                          callId: callData?.callId,
                          roomId: callData?.roomId,
                          rejectedBy: callData?.toUserId,
                          fromUserId: callData?.fromUserId,
                        });
                      }}
                      sx={{
                        ...circleBtn,
                        background: "#ef4444",
                        boxShadow: "0 6px 20px rgba(239,68,68,0.45)",
                        "&:hover": {
                          background: "#dc2626",
                          transform: "scale(1.06)",
                        },
                      }}
                    >
                      <CallEnd sx={{ fontSize: 28 }} />
                    </IconButton>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      Decline
                    </Typography>
                  </Box>

                  {/* Accept */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        stopRingtone();
                        onAccept?.({
                          callId: callData?.callId,
                          roomId: callData?.roomId,
                          acceptedBy: callData?.toUserId,
                          fromUserId: callData?.fromUserId,
                        });
                      }}
                      sx={{
                        ...circleBtn,
                        background: "#22c55e",
                        boxShadow: "0 6px 20px rgba(34,197,94,0.45)",
                        "&:hover": {
                          background: "#16a34a",
                          transform: "scale(1.06)",
                        },
                      }}
                    >
                      {hasVideo ? (
                        <Videocam sx={{ fontSize: 28 }} />
                      ) : (
                        <Phone sx={{ fontSize: 28 }} />
                      )}
                    </IconButton>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      Accept
                    </Typography>
                  </Box>
                </Box>
              ) : (
                // Active call controls
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.2,
                      justifyContent: "center",
                      flexWrap: "wrap",
                      opacity: showControls ? 1 : 0.25,
                      transition: "opacity 0.5s ease",
                    }}
                  >
                    <IconButton
                      onClick={() => setIsMuted(!isMuted)}
                      sx={activeBtn(isMuted)}
                    >
                      {isMuted ? (
                        <MicOff sx={{ fontSize: 22 }} />
                      ) : (
                        <Mic sx={{ fontSize: 22 }} />
                      )}
                    </IconButton>

                    <IconButton
                      onClick={() => setIsVideoOff(!isVideoOff)}
                      sx={activeBtn(isVideoOff)}
                    >
                      {isVideoOff ? (
                        <VideocamOff sx={{ fontSize: 22 }} />
                      ) : (
                        <Videocam sx={{ fontSize: 22 }} />
                      )}
                    </IconButton>

                    <IconButton sx={activeBtn(false)}>
                      <ScreenShare sx={{ fontSize: 22 }} />
                    </IconButton>

                    <IconButton sx={activeBtn(false)}>
                      <VolumeUp sx={{ fontSize: 22 }} />
                    </IconButton>

                    <IconButton
                      onClick={() =>
                        onHangup?.({
                          callId: callData?.callId,
                          roomId: callData?.roomId,
                          endedBy: callData?.toUserId,
                        })
                      }
                      sx={{
                        width: 46,
                        height: 46,
                        background: "#ef4444",
                        color: "#ffffff",
                        boxShadow: "0 6px 16px rgba(239,68,68,0.4)",
                        transition: "all 0.25s ease",
                        "&:hover": {
                          background: "#dc2626",
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <CallEnd sx={{ fontSize: 24 }} />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Modal>
  );
};

export default IncomingCallScreen;
