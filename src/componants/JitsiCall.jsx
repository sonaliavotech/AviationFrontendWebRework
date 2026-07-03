import { useCallback, useEffect, useRef, useState } from "react";
import {
    Box,
    IconButton,
    Typography,
    Paper,
    Tooltip,
    CircularProgress,
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

const TELEMEDICINE_TOOLBAR_BUTTONS = [
    "microphone",
    "camera",
    "desktop",
    "chat",
    "raisehand",
    "tileview",
    "settings",
    "hangup",
];

const getParticipantId = (participant) =>
    participant?.id ||
    participant?.participantId ||
    participant?.jid ||
    participant?.displayName;

const isLocalParticipant = (
    participant,
    localParticipantId,
    localParticipantName
) => {
    const participantId = getParticipantId(participant);
    const participantName =
        participant?.displayName ||
        participant?.name ||
        participant?.formattedDisplayName;

    return (
        participant?.local ||
        participant?.isLocal ||
        participant?.formattedDisplayName === "me" ||
        (localParticipantId && participantId === localParticipantId) ||
        (localParticipantName && participantName === localParticipantName)
    );
};

const normalizeJitsiDomain = (jitsiUrl = "") => {
    const trimmedUrl = String(jitsiUrl).trim();

    if (!trimmedUrl) {
        return "tiajitsistg.tiatech.net";
    }

    try {
        const url = new URL(
            trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`
        );
        return url.host;
    } catch (error) {
        console.log("Unable to normalize Jitsi URL:", error);
        return "tiajitsistg.tiatech.net";
    }
};

const getJitsiJwt = (user) =>
    user?.jitsiToken ||
    user?.jitsiJwt ||
    user?.jitsi_token ||
    user?.jwt ||
    null;

const clearTextSelection = () => {
    window.getSelection?.()?.removeAllRanges?.();
};

const preventSelection = (event) => {
    event.preventDefault();
    clearTextSelection();
    return false;
};

const ensureLocalVideoEnabled = async (api) => {
    if (!api?.executeCommand || !api?.isVideoMuted) {
        return;
    }

    try {
        const isVideoMuted = await Promise.resolve(api.isVideoMuted());

        if (isVideoMuted) {
            await Promise.resolve(api.executeCommand("toggleVideo"));
        }
    } catch (error) {
        console.log("Unable to enable Jitsi local video:", error);
    }
};

const JitsiCall = ({
    broadcastId,
    callData,
    onEndCall,
    onClose,
    domain = "tiajitsistg.tiatech.net",
    darkMode = false,
}) => {
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);
    const callDataRef = useRef(callData);
    const localParticipantIdRef = useRef(null);
    const localParticipantNameRef = useRef(null);
    const callEndHandledRef = useRef(false);
    const windowCloseHandledRef = useRef(false);

    const [user, setUser] = useState(null);
    const [isJitsiHidden, setIsJitsiHidden] = useState(false);
    const [jitsiRestartKey, setJitsiRestartKey] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);

    useEffect(() => {
        callDataRef.current = callData;
    }, [callData]);

    // Colors based on dark mode
    const colors = {
        bg: darkMode ? "#0B1525" : "#F8FAFC",
        surface: darkMode ? "#1A2A4A" : "#FFFFFF",
        border: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        text: darkMode ? "#F8FAFC" : "#0F172A",
        textSecondary: darkMode ? "#94A3B8" : "#64748B",
        controlBg: darkMode ? "#1E293B" : "#F1F5F9",
        controlHover: darkMode ? "#334155" : "#E2E8F0",
    };

    const disposeJitsi = useCallback(() => {
        setIsJitsiHidden(true);

        if (jitsiApiRef.current) {
            try {
                jitsiApiRef.current.dispose();
            } catch (e) {
                console.log("Error disposing Jitsi:", e);
            }
            jitsiApiRef.current = null;
        }
    }, []);

    const endCallOnce = useCallback(() => {
        if (callEndHandledRef.current) {
            return;
        }

        callEndHandledRef.current = true;
        disposeJitsi();
        onEndCall?.(callDataRef.current);
    }, [disposeJitsi, onEndCall]);

    const closeWindowOnce = useCallback(() => {
        if (windowCloseHandledRef.current) {
            return;
        }

        windowCloseHandledRef.current = true;
        disposeJitsi();
        onClose?.();
    }, [disposeJitsi, onClose]);

    // Load user data
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = localStorage.getItem("physicianUser");
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    setUser({
                        ...parsedUser,
                        jitsiUrl: domain,
                        name: parsedUser.name || "Physician",
                    });
                } else {
                    setUser({
                        id: callData?.fromUserId || "web-user",
                        name: callData?.callerName || "Physician",
                        jitsiUrl: domain,
                    });
                }
            } catch (err) {
                console.log("Error getting user:", err);
                setUser({
                    id: "web-user",
                    name: "Physician",
                    jitsiUrl: domain,
                });
            }
        };

        loadUser();
    }, [domain, callData]);

    // Initialize Jitsi
    useEffect(() => {
        if (!user || !jitsiContainerRef.current) {
            return;
        }

        const normalizedDomain = normalizeJitsiDomain(user.jitsiUrl || domain);
        const roomName = String(broadcastId || "").trim();
        const jwt = getJitsiJwt(user);

        if (!normalizedDomain || !roomName) {
            console.log("Jitsi join skipped. Missing domain or room:", {
                domain: normalizedDomain,
                roomName,
                broadcastId,
            });
            return;
        }

        // Load Jitsi script if not already loaded
        if (!window.JitsiMeetExternalAPI) {
            console.log("Loading Jitsi script from:", `https://${normalizedDomain}/external_api.js`);
            const script = document.createElement("script");
            script.src = `https://${normalizedDomain}/external_api.js`;
            script.async = true;
            script.onload = () => initializeJitsi();
            script.onerror = () => {
                console.error(`Failed to load Jitsi from ${normalizedDomain}`);
                const fallbackScript = document.createElement("script");
                fallbackScript.src = "https://meet.jit.si/external_api.js";
                fallbackScript.async = true;
                fallbackScript.onload = () => initializeJitsi();
                document.head.appendChild(fallbackScript);
            };
            document.head.appendChild(script);
            return;
        }

        initializeJitsi();

        function initializeJitsi() {
            console.log("Initializing Jitsi with domain:", normalizedDomain);

            const options = {
                roomName,
                userInfo: {
                    displayName: user?.name || "Physician",
                },
                parentNode: jitsiContainerRef.current,
                ...(jwt ? { jwt } : {}),
                configOverwrite: {
                    apiLogLevels: ["log", "error", "warn", "info", "debug"],
                    resolution: 360,
                    enableLayerSuspension: true,
                    disableSimulcast: false,
                    channelLastN: 2,
                    startAudioOnly: false,
                    prejoinPageEnabled: false,
                    prejoinConfig: {
                        enabled: false,
                    },
                    disableInviteFunctions: true,
                    disableDeepLinking: true,
                    toolbarButtons: TELEMEDICINE_TOOLBAR_BUTTONS,
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    buttonsWithNotifyClick: [
                        "hangup",
                        "endConference",
                        "leaveConference",
                        "__end",
                    ],
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: TELEMEDICINE_TOOLBAR_BUTTONS,
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    BRAND_WATERMARK_LINK: "",
                },
            };

            console.log("Joining Jitsi room:", {
                domain: normalizedDomain,
                roomName,
                hasJwt: Boolean(jwt),
                restartKey: jitsiRestartKey,
            });

            const api = new window.JitsiMeetExternalAPI(normalizedDomain, options);
            jitsiApiRef.current = api;

            const allowJitsiScreenCapture = () => {
                const iframe = jitsiContainerRef.current?.querySelector("iframe");

                if (!iframe) {
                    return;
                }

                iframe.setAttribute("draggable", "false");
                iframe.style.userSelect = "none";
                iframe.style.webkitUserSelect = "none";
                iframe.style.webkitUserDrag = "none";
                iframe.onselectstart = preventSelection;
                iframe.ondragstart = preventSelection;

                const existingAllow = iframe.getAttribute("allow") || "";
                const requiredPermissions = [
                    "camera",
                    "microphone",
                    "display-capture",
                    "fullscreen",
                    "autoplay",
                ];
                const mergedAllow = Array.from(
                    new Set(
                        [
                            ...existingAllow
                                .split(";")
                                .map((item) => item.trim())
                                .filter(Boolean),
                            ...requiredPermissions,
                        ]
                    )
                ).join("; ");

                iframe.setAttribute("allow", mergedAllow);
            };

            allowJitsiScreenCapture();
            const allowScreenCaptureTimer = setTimeout(
                allowJitsiScreenCapture,
                1000
            );
            const clearSelectionTimer = setTimeout(
                clearTextSelection,
                1200
            );

            api.addEventListener("videoConferenceJoined", (participant) => {
                localParticipantIdRef.current = getParticipantId(participant);
                localParticipantNameRef.current =
                    participant?.displayName || user?.name || "Physician";
                setIsReady(true);
                setIsConnecting(false);
                ensureLocalVideoEnabled(api);
                setTimeout(() => {
                    if (jitsiApiRef.current === api) {
                        ensureLocalVideoEnabled(api);
                    }
                }, 1000);
                console.log("✅ Joined call");
            });

            api.addEventListener("screenSharingStatusChanged", (event) => {
                console.log("Screen sharing status changed:", event);
                setIsScreenSharing(event?.on || false);
            });

            api.addEventListener("toolbarButtonClicked", (event) => {
                console.log("Jitsi toolbar clicked:", event);

                if (
                    event?.key === "hangup" ||
                    event?.key === "endConference" ||
                    event?.key === "leaveConference" ||
                    event?.key === "__end"
                ) {
                    endCallOnce();
                }
            });

            api.addEventListener("videoConferenceLeft", () => {
                console.log("Call ended (hangup clicked)");
                endCallOnce();
            });

            api.addEventListener("readyToClose", () => {
                console.log("readyToClose triggered");
                endCallOnce();
            });

            api.addEventListener("errorOccurred", (error) => {
                console.log("Jitsi error occurred:", error);

                if (
                    error?.name === "conference.destroyed" ||
                    error?.error === "conference.destroyed" ||
                    error?.details === "conference.destroyed" ||
                    error?.message === "The meeting has been terminated"
                ) {
                    closeWindowOnce();
                    return;
                }

                if (
                    error?.name === "connection.error" ||
                    error?.name === "conference.connectionError" ||
                    error?.error === "connection.error" ||
                    error?.error === "conference.connectionError" ||
                    String(error?.message || "").toLowerCase().includes("connection")
                ) {
                    console.log("Connection error, attempting reconnect...");
                    disposeJitsi();
                    setJitsiRestartKey((key) => key + 1);
                }
            });

            api.addEventListener("log", (event) => {
                const logText = JSON.stringify(event || {});

                if (
                    logText.includes("LeaveReasonDialog") ||
                    logText.includes("conference.destroyed") ||
                    logText.includes("The meeting has been terminated")
                ) {
                    console.log("Hiding terminated Jitsi dialog:", event);
                    closeWindowOnce();
                    return;
                }

                if (
                    logText.includes("UnhandledError") ||
                    logText.includes("UnhandledRejection") ||
                    logText.includes("CONFERENCE_FAILED") ||
                    logText.includes("connection.error") ||
                    logText.includes("conference.connectionError")
                ) {
                    console.log("Error detected, attempting reconnect...");
                    disposeJitsi();
                    setJitsiRestartKey((key) => key + 1);
                }
            });

            // Audio/Video mute status
            api.addEventListener("audioMuteStatusChanged", (data) => {
                setIsMuted(data.muted || false);
            });

            api.addEventListener("videoMuteStatusChanged", (data) => {
                setIsVideoOff(data.muted || false);
            });

            return () => {
                callEndHandledRef.current = false;
                windowCloseHandledRef.current = false;
                setIsJitsiHidden(false);
                clearTimeout(allowScreenCaptureTimer);
                clearTimeout(clearSelectionTimer);
                if (jitsiApiRef.current === api) {
                    try {
                        jitsiApiRef.current.dispose();
                    } catch (e) {
                        console.log("Error disposing Jitsi:", e);
                    }
                    jitsiApiRef.current = null;
                }
            };
        }
    }, [
        broadcastId,
        user,
        domain,
        disposeJitsi,
        endCallOnce,
        closeWindowOnce,
        jitsiRestartKey,
    ]);

    // Handle mute toggle
    const toggleMute = useCallback(() => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.executeCommand("toggleAudio");
        }
    }, []);

    // Handle video toggle
    const toggleVideo = useCallback(() => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.executeCommand("toggleVideo");
        }
    }, []);

    // Handle screen share toggle
    const toggleScreenShare = useCallback(() => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.executeCommand("toggleScreenSharing");
        }
    }, []);

    // Handle hangup
    const handleHangup = useCallback(() => {
        endCallOnce();
    }, [endCallOnce]);

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
            {/* Connecting Overlay */}
            {isConnecting && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 20,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.7)",
                    }}
                >
                    <CircularProgress size={60} sx={{ color: "#015DFF", mb: 2 }} />
                    <Typography sx={{ color: "#fff", fontSize: "16px" }}>
                        Connecting to call...
                    </Typography>
                    <IconButton
                        onClick={handleHangup}
                        sx={{
                            mt: 3,
                            background: "#EF4444",
                            color: "#fff",
                            "&:hover": { background: "#DC2626" },
                            width: 48,
                            height: 48,
                        }}
                    >
                        <CallEnd />
                    </IconButton>
                </Box>
            )}

            {/* Jitsi Container - Full Screen */}
            <Box
                ref={jitsiContainerRef}
                id="jitsi-container"
                sx={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    background: darkMode ? "#0B1525" : "#F1F5F9",
                    display: isJitsiHidden ? "none" : "block",
                }}
            />

            {/* Bottom Controls - Only when ready */}
            {isReady && (
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
                        zIndex: 10,
                    }}
                >
                    <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                        <IconButton
                            onClick={toggleMute}
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
            )}
        </Box>
    );
};

export default JitsiCall;