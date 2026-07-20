import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography, CircularProgress, IconButton, useTheme } from "@mui/material";
import { PictureInPicture, Fullscreen, Close } from "@mui/icons-material";
import { getPhysicianSession, mapPhysicianToWebUser } from "../utils/physicianSession";

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
    isPiP = false,
    togglePiP,
    domain = "tiajitsistg.tiatech.net",
    darkMode = false,
}) => {
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);
    const callDataRef = useRef(callData);
    const localParticipantIdRef = useRef(null);
    const callEndHandledRef = useRef(false);
    const windowCloseHandledRef = useRef(false);
    const joinedRoomRef = useRef(null);

    const [user, setUser] = useState(null);
    const [isJitsiHidden, setIsJitsiHidden] = useState(false);
    const [jitsiRestartKey, setJitsiRestartKey] = useState(0);
    const [isConnecting, setIsConnecting] = useState(true);

    useEffect(() => {
        callDataRef.current = callData;
    }, [callData]);

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

    useEffect(() => {
        const session = mapPhysicianToWebUser(getPhysicianSession());
        setUser({
            id: session?.id || "web-user",
            name: session?.name || "Physician",
            jitsiUrl: domain,
            jitsiToken: session?.jitsiToken,
        });
    }, [domain]);

    useEffect(() => {
        if (!user || !jitsiContainerRef.current) {
            return;
        }

        const normalizedDomain = normalizeJitsiDomain(user.jitsiUrl || domain);
        const roomName = String(broadcastId || "").trim();
        const jwt = getJitsiJwt(user);

        if (!normalizedDomain || !roomName) {
            return;
        }

        if (joinedRoomRef.current === roomName && jitsiApiRef.current) {
            return;
        }

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
            joinedRoomRef.current = roomName;

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
                setIsConnecting(false);
                ensureLocalVideoEnabled(api);
                setTimeout(() => {
                    if (jitsiApiRef.current === api) {
                        ensureLocalVideoEnabled(api);
                    }
                }, 1000);
                console.log("✅ Joined call");
            });

            api.addEventListener("toolbarButtonClicked", (event) => {
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
                    joinedRoomRef.current = null;
                }
            };
        }
    }, [
        broadcastId,
        user?.id,
        domain,
        disposeJitsi,
        endCallOnce,
        closeWindowOnce,
        jitsiRestartKey,
    ]);

    return (
        <Box
            sx={{
                position: isPiP ? "fixed" : "fixed",
                top: isPiP ? "auto" : 0,
                left: isPiP ? "auto" : 0,
                right: isPiP ? 20 : 0,
                bottom: isPiP ? 20 : 0,
                zIndex: 10000,
                background: darkMode ? "#0B1525" : "#F8FAFC",
                display: "flex",
                flexDirection: "column",
                borderRadius: isPiP ? "16px" : 0,
                boxShadow: isPiP ? "0 8px 32px rgba(0,0,0,0.5)" : "none",
                width: isPiP ? "320px" : "100%",
                height: isPiP ? "240px" : "100%",
            }}
        >
            {/* PiP Controls */}
            {togglePiP && (
                <Box
                    sx={{
                        position: "absolute",
                        top: isPiP ? 8 : 16,
                        right: isPiP ? 8 : 16,
                        zIndex: 100,
                        display: "flex",
                        gap: 1,
                    }}
                >
                    <IconButton
                        onClick={togglePiP}
                        sx={{
                            background: "rgba(0,0,0,0.5)",
                            color: "#fff",
                            "&:hover": { background: "rgba(0,0,0,0.7)" },
                            width: 36,
                            height: 36,
                        }}
                    >
                        {isPiP ? <Fullscreen /> : <PictureInPicture />}
                    </IconButton>
                    {isPiP && (
                        <IconButton
                            onClick={onClose}
                            sx={{
                                background: "rgba(0,0,0,0.5)",
                                color: "#fff",
                                "&:hover": { background: "rgba(0,0,0,0.7)" },
                                width: 36,
                                height: 36,
                            }}
                        >
                            <Close />
                        </IconButton>
                    )}
                </Box>
            )}

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
                        pointerEvents: "none",
                        borderRadius: isPiP ? "16px" : 0,
                    }}
                >
                    <CircularProgress size={isPiP ? 40 : 60} sx={{ color: "#015DFF", mb: 2 }} />
                    <Typography sx={{ color: "#fff", fontSize: isPiP ? "14px" : "16px" }}>
                        Connecting to call...
                    </Typography>
                </Box>
            )}

            <Box
                ref={jitsiContainerRef}
                id="jitsi-container"
                sx={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    background: darkMode ? "#0B1525" : "#F1F5F9",
                    display: isJitsiHidden ? "none" : "block",
                    borderRadius: isPiP ? "16px" : 0,
                }}
            />
        </Box>
    );
};

export default JitsiCall;
