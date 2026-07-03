import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    IconButton,
    Typography,
    Paper,
    Tooltip,
} from "@mui/material";
import {
    Mic,
    MicOff,
    Videocam,
    VideocamOff,
    ScreenShare,
    StopScreenShare,
    CallEnd,
} from "@mui/icons-material";
import jitsiService from "../../services/JitsiService";

const JitsiCallWindow = ({
    roomName,
    displayName,
    onClose,
    onHangup,
    callData,
    darkMode = false,
}) => {
    const containerRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Colors
    const colors = {
        bg: darkMode ? "#0B1525" : "#F8FAFC",
        surface: darkMode ? "#1A2A4A" : "#FFFFFF",
        border: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        text: darkMode ? "#F8FAFC" : "#0F172A",
        textSecondary: darkMode ? "#94A3B8" : "#64748B",
        controlBg: darkMode ? "#1E293B" : "#F1F5F9",
        controlHover: darkMode ? "#334155" : "#E2E8F0",
    };

    useEffect(() => {
        if (!roomName || !containerRef.current) return;

        // Load Jitsi script if not already loaded
        if (!window.JitsiMeetExternalAPI) {
            const script = document.createElement("script");
            script.src = "https://meet.jit.si/external_api.js";
            script.async = true;
            script.onload = () => initializeJitsi();
            document.head.appendChild(script);
            return () => {
                document.head.removeChild(script);
            };
        } else {
            initializeJitsi();
        }

        function initializeJitsi() {
            const api = jitsiService.initJitsi(roomName, {
                container: containerRef.current.id || "jitsi-container",
                displayName: displayName || "Physician",
                startWithVideoMuted: isVideoOff,
                startWithAudioMuted: isMuted,
            });

            if (api) {
                jitsiService.onReady(() => {
                    setIsReady(true);
                });

                jitsiService.onConnectionStatus((status) => {
                    console.log("Jitsi connection status:", status);
                });
            }
        }

        return () => {
            jitsiService.dispose();
        };
    }, [roomName, displayName]);

    const toggleAudio = () => {
        setIsMuted(!isMuted);
        jitsiService.muteAudio();
    };

    const toggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        jitsiService.muteVideo();
    };

    const toggleScreenShare = () => {
        setIsScreenSharing(!isScreenSharing);
        jitsiService.shareScreen();
    };

    const handleHangup = () => {
        jitsiService.hangup();
        onHangup?.({
            callId: callData?.callId,
            roomId: callData?.roomId,
            endedBy: callData?.toUserId || callData?.userId,
        });
        onClose?.();
    };

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10000,
                background: colors.bg,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Top Bar - Only End Call Button */}
            <Paper
                elevation={2}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: "8px 16px",
                    background: colors.surface,
                    borderBottom: `1px solid ${colors.border}`,
                    zIndex: 10,
                    flexShrink: 0,
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: colors.text,
                    }}
                >
                    {callData?.callerName || "Call"} — {callData?.callerRole || "Physician"}
                </Typography>

                <Tooltip title="End call">
                    <IconButton
                        onClick={handleHangup}
                        sx={{
                            background: "#EF4444",
                            color: "#fff",
                            "&:hover": { background: "#DC2626" },
                            width: 36,
                            height: 36,
                        }}
                    >
                        <CallEnd sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* Jitsi Container - Full remaining space */}
            <Box
                ref={containerRef}
                id="jitsi-container"
                sx={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    background: darkMode ? "#0B1525" : "#F1F5F9",
                }}
            />

            {/* Bottom Controls - Only Essential */}
            <Paper
                elevation={4}
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: { xs: 2, sm: 3 },
                    p: "10px 16px",
                    background: darkMode ? "rgba(15, 32, 64, 0.95)" : "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    borderTop: `1px solid ${colors.border}`,
                    flexShrink: 0,
                    flexWrap: "wrap",
                }}
            >
                <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                    <IconButton
                        onClick={toggleAudio}
                        sx={{
                            width: { xs: 44, sm: 48 },
                            height: { xs: 44, sm: 48 },
                            background: isMuted ? "#EF4444" : colors.controlBg,
                            color: isMuted ? "#fff" : colors.text,
                            "&:hover": {
                                background: isMuted ? "#DC2626" : colors.controlHover,
                            },
                        }}
                    >
                        {isMuted ? <MicOff /> : <Mic />}
                    </IconButton>
                </Tooltip>

                <Tooltip title={isVideoOff ? "Turn on camera" : "Turn off camera"}>
                    <IconButton
                        onClick={toggleVideo}
                        sx={{
                            width: { xs: 44, sm: 48 },
                            height: { xs: 44, sm: 48 },
                            background: isVideoOff ? "#EF4444" : colors.controlBg,
                            color: isVideoOff ? "#fff" : colors.text,
                            "&:hover": {
                                background: isVideoOff ? "#DC2626" : colors.controlHover,
                            },
                        }}
                    >
                        {isVideoOff ? <VideocamOff /> : <Videocam />}
                    </IconButton>
                </Tooltip>

                <Tooltip title={isScreenSharing ? "Stop sharing" : "Share screen"}>
                    <IconButton
                        onClick={toggleScreenShare}
                        sx={{
                            width: { xs: 44, sm: 48 },
                            height: { xs: 44, sm: 48 },
                            background: isScreenSharing ? "#015DFF" : colors.controlBg,
                            color: isScreenSharing ? "#fff" : colors.text,
                            "&:hover": {
                                background: isScreenSharing ? "#0047CC" : colors.controlHover,
                            },
                        }}
                    >
                        {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                    </IconButton>
                </Tooltip>

                <Tooltip title="End call">
                    <IconButton
                        onClick={handleHangup}
                        sx={{
                            width: { xs: 44, sm: 48 },
                            height: { xs: 44, sm: 48 },
                            background: "#EF4444",
                            color: "#fff",
                            "&:hover": { background: "#DC2626" },
                        }}
                    >
                        <CallEnd />
                    </IconButton>
                </Tooltip>
            </Paper>
        </Box>
    );
};

export default JitsiCallWindow;