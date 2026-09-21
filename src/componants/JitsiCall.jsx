import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  useTheme,
} from "@mui/material";
import { PictureInPicture, Fullscreen, Close } from "@mui/icons-material";
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

  // NEW: guards against duplicate/overlapping reconnect attempts, which is
  // what was causing the web user to briefly appear twice in the room.
  const reconnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

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

  // NEW: single funnel for every reconnect trigger. Both the errorOccurred
  // and log listeners used to call disposeJitsi()+setJitsiRestartKey
  // independently and immediately, which could fire twice for the same
  // underlying event and rejoin before the old session had fully left the
  // room — producing a duplicate participant tile on the other side.
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

    // NEW: cancellation flag so an in-flight script load never calls
    // initializeJitsi() after this effect instance has been torn down
    // (e.g. dev-mode double-invoke, fast prop changes, or a reconnect
    // racing a real unmount). Previously the early `return;` on the
    // script-loading branch meant React never got a cleanup function for
    // that run, so a late-arriving script.onload could still spin up and
    // join a second live session into the room.
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
          // "CONFERENCE_FAILED" as part of benign, non-fatal internals
          // (stats reporting, ICE candidate churn, etc.). Those false
          // positives were triggering unnecessary reconnects, and each
          // reconnect risked a brief double-join in the room.
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
          closeWindowOnce();
          return;
        }

        // Only reconnect on genuine, explicitly-named connection failures —
        // never on a loose substring match against error.message, which
        // could match unrelated, non-fatal text and trigger a false
        // reconnect (and a transient duplicate participant).
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
          closeWindowOnce();
          return;
        }

        // Narrowed: only react to an explicit, structured fatal failure
        // code, not a bare substring match on any log line. The old check
        // matched routine debug/info noise (now excluded via apiLogLevels
        // above too), which was the main source of spurious reconnects
        // that could leave a stale session briefly still in the room while
        // a new one joined — the duplicate-user symptom.
        const isFatalFailure =
          logText.includes('"CONFERENCE_FAILED"') &&
          (logText.includes('"NETWORK_ERROR"') ||
            logText.includes('"connection.error"') ||
            logText.includes('"conference.connectionError"'));

        if (isFatalFailure) {
          console.log("Fatal conference failure detected, attempting reconnect...");
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
          <CircularProgress
            size={isPiP ? 40 : 60}
            sx={{ color: "#015DFF", mb: 2 }}
          />
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