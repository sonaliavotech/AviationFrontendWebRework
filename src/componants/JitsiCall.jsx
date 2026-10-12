import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography, CircularProgress, IconButton } from "@mui/material";
import {
  PictureInPicture,
  Fullscreen,
  Close,
  DragIndicator,
} from "@mui/icons-material";
import {
  getPhysicianSession,
  mapPhysicianToWebUser,
} from "../utils/physicianSession";

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

// Delay before we allow a fresh join after disposing a broken session.
// Gives the old session's "participant left" time to reach the signaling
// server so the crew side doesn't briefly see the web user twice.
const RECONNECT_DELAY_MS = 800;

// Default PiP size (unused when full-screen).
const PIP_WIDTH = 320;
const PIP_HEIGHT = 240;

// Title bar height inside the PiP window (drag handle).
const PIP_TITLEBAR_HEIGHT = 32;

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
      trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`,
    );
    return url.host;
  } catch (error) {
    console.log("Unable to normalize Jitsi URL:", error);
    return "tiajitsistg.tiatech.net";
  }
};

const getJitsiJwt = (user) =>
  user?.jitsiToken || user?.jitsiJwt || user?.jitsi_token || user?.jwt || null;

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

// Clamp a PiP position so the window stays fully inside the viewport.
const clampPosition = (x, y, width, height) => {
  const maxX = Math.max(0, window.innerWidth - width);
  const maxY = Math.max(0, window.innerHeight - height);
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  };
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

  // Guards against duplicate/overlapping reconnect attempts, which is
  // what was causing the web user to briefly appear twice in the room.
  const reconnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isJitsiHidden, setIsJitsiHidden] = useState(false);
  const [jitsiRestartKey, setJitsiRestartKey] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);

  // ── PiP drag state ───────────────────────────────────────────────────
  // Initial position: bottom-right corner with a 20px inset.
  const [pipPos, setPipPos] = useState(() => {
    if (typeof window === "undefined") return { x: 20, y: 20 };
    return {
      x: Math.max(0, window.innerWidth - PIP_WIDTH - 20),
      y: Math.max(0, window.innerHeight - PIP_HEIGHT - 20),
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({
    pointerId: null,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
  });

  useEffect(() => {
    callDataRef.current = callData;
  }, [callData]);

  const disposeJitsi = useCallback(() => {
    setIsJitsiHidden(true);

    if (jitsiApiRef.current) {
      try {
        // executeCommand("hangup") first so the signaling server gets an
        // explicit "leave" event before we tear the api object down, rather
        // than relying purely on the socket disconnect to imply departure.
        jitsiApiRef.current.executeCommand?.("hangup");
      } catch (e) {
        console.log("Error sending hangup command to Jitsi:", e);
      }

      try {
        jitsiApiRef.current.dispose();
      } catch (e) {
        console.log("Error disposing Jitsi:", e);
      }
      jitsiApiRef.current = null;
    }

    joinedRoomRef.current = null;
  }, []);

  // Single funnel for every reconnect trigger.
  const safeReconnect = useCallback(
    (reason) => {
      if (reconnectingRef.current) {
        return;
      }
      reconnectingRef.current = true;
      console.log("Reconnecting Jitsi due to:", reason);

      disposeJitsi();

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectingRef.current = false;
        setJitsiRestartKey((key) => key + 1);
      }, RECONNECT_DELAY_MS);
    },
    [disposeJitsi],
  );

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

  // ── PiP drag handlers ────────────────────────────────────────────────
  // We use Pointer Events (works for mouse, touch, and pen). Drag is only
  // allowed when isPiP === true, and only from the title bar so the Jitsi
  // iframe's own controls remain fully clickable.

  const handleDragStart = useCallback(
    (event) => {
      if (!isPiP) return;
      // Only left mouse button / primary touch / pen.
      if (event.button !== undefined && event.button !== 0) return;

      const target = event.currentTarget;
      try {
        target.setPointerCapture(event.pointerId);
      } catch (e) {
        // Some browsers throw if the pointer was already released.
      }

      dragStateRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - pipPos.x,
        offsetY: event.clientY - pipPos.y,
        startX: pipPos.x,
        startY: pipPos.y,
      };
      setIsDragging(true);
      event.preventDefault();
      event.stopPropagation();
    },
    [isPiP, pipPos.x, pipPos.y],
  );

  const handleDragMove = useCallback(
    (event) => {
      if (!isDragging) return;
      if (dragStateRef.current.pointerId !== event.pointerId) return;

      const { offsetX, offsetY } = dragStateRef.current;
      const nextX = event.clientX - offsetX;
      const nextY = event.clientY - offsetY;
      const clamped = clampPosition(nextX, nextY, PIP_WIDTH, PIP_HEIGHT);
      setPipPos(clamped);
      event.preventDefault();
      event.stopPropagation();
    },
    [isDragging],
  );

  const handleDragEnd = useCallback((event) => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (e) {
      // ignore
    }
    dragStateRef.current.pointerId = null;
    setIsDragging(false);
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // Keep the PiP window inside the viewport if the user resizes the browser.
  useEffect(() => {
    if (!isPiP) return;
    const onResize = () => {
      setPipPos((prev) => clampPosition(prev.x, prev.y, PIP_WIDTH, PIP_HEIGHT));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isPiP]);

  // ── Jitsi lifecycle (unchanged, guarded against duplicates) ──────────
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

    // Cancellation flag so an in-flight script load never calls
    // initializeJitsi() after this effect instance has been torn down
    // (e.g. dev-mode double-invoke, fast prop changes, or a reconnect
    // racing a real unmount).
    let cancelled = false;

    const tryLoadScript = (url, onSuccess, onFail) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => {
        if (!cancelled) onSuccess();
      };
      script.onerror = () => {
        if (!cancelled) onFail();
      };
      document.head.appendChild(script);
    };

    if (!window.JitsiMeetExternalAPI) {
      const primaryUrl = `https://${normalizedDomain}/external_api.js`;
      console.log("Loading Jitsi script from:", primaryUrl);

      tryLoadScript(
        primaryUrl,
        () => initializeJitsi(normalizedDomain),
        () => {
          console.warn(
            `Failed to load Jitsi from ${normalizedDomain}, using meet.jit.si fallback`,
          );
          tryLoadScript(
            "https://meet.jit.si/external_api.js",
            () => initializeJitsi("meet.jit.si"),
            () => {
              console.error("Both primary Jitsi and fallback failed to load");
              setIsConnecting(false);
            },
          );
        },
      );

      return () => {
        cancelled = true;
      };
    }

    return initializeJitsi(normalizedDomain);

    function initializeJitsi(activeDomain) {
      if (cancelled) return undefined;

      const finalDomain = activeDomain || normalizedDomain;
      console.log("Initializing Jitsi with domain:", finalDomain);

      const options = {
        roomName,
        userInfo: {
          displayName: user?.name || "Physician",
        },
        parentNode: jitsiContainerRef.current,
        ...(jwt ? { jwt } : {}),
        configOverwrite: {
          // Dropped "debug" and "info" — those levels emit large volumes of
          // routine internal Jitsi log lines, some of which happened to
          // contain substrings like "connection.error" or
          // "CONFERENCE_FAILED" as part of benign, non-fatal internals.
          apiLogLevels: ["log", "error", "warn"],
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

      const api = new window.JitsiMeetExternalAPI(finalDomain, options);
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
          new Set([
            ...existingAllow
              .split(";")
              .map((item) => item.trim())
              .filter(Boolean),
            ...requiredPermissions,
          ]),
        ).join("; ");

        iframe.setAttribute("allow", mergedAllow);
      };

      allowJitsiScreenCapture();
      const allowScreenCaptureTimer = setTimeout(allowJitsiScreenCapture, 1000);
      const clearSelectionTimer = setTimeout(clearTextSelection, 1200);

      api.addEventListener("videoConferenceJoined", (participant) => {
        localParticipantIdRef.current = getParticipantId(participant);
        setIsConnecting(false);
        reconnectingRef.current = false;
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
          endCallOnce();
          return;
        }

        const isFatalConnectionError =
          error?.name === "connection.error" ||
          error?.name === "conference.connectionError" ||
          error?.error === "connection.error" ||
          error?.error === "conference.connectionError";

        if (isFatalConnectionError) {
          console.log("Fatal connection error, attempting reconnect...");
          safeReconnect(error);
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
          endCallOnce();
          return;
        }

        const isFatalFailure =
          logText.includes('"CONFERENCE_FAILED"') &&
          (logText.includes('"NETWORK_ERROR"') ||
            logText.includes('"connection.error"') ||
            logText.includes('"conference.connectionError"'));

        if (isFatalFailure) {
          console.log(
            "Fatal conference failure detected, attempting reconnect...",
          );
          safeReconnect(event);
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
            jitsiApiRef.current.executeCommand?.("hangup");
          } catch (e) {
            console.log("Error sending hangup command to Jitsi:", e);
          }
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
    safeReconnect,
    jitsiRestartKey,
  ]);

  // Clean up any pending reconnect timer on unmount.
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // ── Layout values ────────────────────────────────────────────────────
  // Full-screen (non-PiP): fixed, fills viewport.
  // PiP: fixed, small, positioned via `pipPos`, draggable from title bar.
  const outerSx = isPiP
    ? {
        position: "fixed",
        top: `${pipPos.y}px`,
        left: `${pipPos.x}px`,
        right: "auto",
        bottom: "auto",
        zIndex: 10000,
        width: `${PIP_WIDTH}px`,
        height: `${PIP_HEIGHT}px`,
        cursor: isDragging ? "grabbing" : "default",
        userSelect: "none",
        touchAction: "none",
      }
    : {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        width: "100%",
        height: "100%",
      };

  return (
    <Box
      sx={{
        ...outerSx,
        background: darkMode ? "#0B1525" : "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        borderRadius: isPiP ? "16px" : 0,
        boxShadow: isPiP ? "0 8px 32px rgba(0,0,0,0.5)" : "none",
        overflow: "hidden",
        // Prevent the underlying page from scrolling while dragging on touch.
        transition: isDragging ? "none" : "box-shadow 0.15s ease",
      }}
    >
      {/* 
        Title bar — drag handle.
        Only visible in PiP mode; the Jitsi iframe lives below this bar so
        Jitsi's own controls are never covered.
      */}
      {isPiP && (
        <Box
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          sx={{
            height: `${PIP_TITLEBAR_HEIGHT}px`,
            minHeight: `${PIP_TITLEBAR_HEIGHT}px`,
            background: darkMode ? "#0B1525" : "#F8FAFC",
            borderBottom: `1px solid ${
              darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1,
            cursor: isDragging ? "grabbing" : "grab",
            // Critical: prevent the browser's native drag/select on the bar.
            userSelect: "none",
            touchAction: "none",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <DragIndicator
              sx={{
                fontSize: 18,
                color: darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
              }}
            />
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: darkMode ? "#fff" : "#0F172A",
              }}
            >
              Video Call
            </Typography>
          </Box>

          {/* Buttons on the title bar. These do NOT trigger drag because
              pointerdown is stopped on the buttons themselves. */}
          <Box
            sx={{ display: "flex", gap: 0.5 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <IconButton
              size="small"
              onClick={togglePiP}
              title="Return to full screen"
              sx={{
                color: darkMode ? "#fff" : "#0F172A",
                width: 24,
                height: 24,
              }}
            >
              <Fullscreen sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={onClose}
              title="Close"
              sx={{
                color: darkMode ? "#fff" : "#0F172A",
                width: 24,
                height: 24,
              }}
            >
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Full-screen mode controls (top-right) */}
      {!isPiP && togglePiP && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 100,
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton
            onClick={togglePiP}
            title="Minimize to picture-in-picture"
            sx={{
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              "&:hover": { background: "rgba(0,0,0,0.7)" },
              width: 36,
              height: 36,
            }}
          >
            <PictureInPicture />
          </IconButton>
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
          <CircularProgress
            size={isPiP ? 32 : 60}
            sx={{ color: "#015DFF", mb: 2 }}
          />
          <Typography sx={{ color: "#fff", fontSize: isPiP ? "12px" : "16px" }}>
            Connecting to call...
          </Typography>
        </Box>
      )}

      {/*
        Jitsi container. While dragging, we set pointer-events:none so the
        iframe doesn't swallow the pointermove events — the drag continues
        smoothly even if the cursor passes over the video.
      */}
      <Box
        ref={jitsiContainerRef}
        id="jitsi-container"
        sx={{
          flex: 1,
          width: "100%",
          height: "100%",
          minHeight: 0,
          position: "relative",
          overflow: "hidden",
          background: darkMode ? "#0B1525" : "#F1F5F9",
          display: isJitsiHidden ? "none" : "block",
          borderRadius: isPiP ? "0 0 16px 16px" : 0,
          pointerEvents: isDragging ? "none" : "auto",
        }}
      />
    </Box>
  );
};

export default JitsiCall;
