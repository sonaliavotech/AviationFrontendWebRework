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
                inset: 0,
                zIndex: 10000,
                background: "#000",
            }}
        >
            <Box
                ref={containerRef}
                id="jitsi-container"
                sx={{
                    width: "100%",
                    height: "100%",
                }}
            />
        </Box>
    );
};

export default JitsiCallWindow;