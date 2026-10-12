// AviationCallContext

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Snackbar, Alert } from "@mui/material";
import { useAviationCall } from "../hooks/useAviationCall";
import AviationCallSocket from "../services/AviationCallSocket";
import PhysicianStatusService from "../services/PhysicianStatusService";
import {
  getPhysicianSession,
  mapPhysicianToWebUser,
} from "../utils/physicianSession";
import IncomingCallScreen from "../componants/calls/IncomingCallScreen";
import JitsiCall from "../componants/JitsiCall";
import LoadingSpinner from "../componants/LoadingSpinner";
import { useThemeMode } from "./ThemeContext";
import { JITSI_SERVER_URL } from "../config/appConfig";
import {
  resolvePatientName,
  resolvePatientAvatar,
} from "../utils/aviationCallDisplay";

const AviationCallContext = createContext(null);

const resolveRoomId = (call = {}) => {
  const roomId =
    call.roomId || call.callId || call.roomName || call.broadcastId;
  return roomId ? String(roomId).trim() : "";
};

export function AviationCallProvider({ children }) {
  const session = getPhysicianSession();
  const userId = session?.id ? String(session.id) : null;
  const { darkMode } = useThemeMode();
  const [showJitsi, setShowJitsi] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [jitsiRoomId, setJitsiRoomId] = useState(null);
  const [cancelledSnackbar, setCancelledSnackbar] = useState({
    open: false,
    message: "",
  });
  const jitsiCallDataRef = useRef(null);

  // Tracks whether we've already restored the status for the CURRENT call
  // cycle. Guards against firing markAvailableOnCallEnd multiple times for
  // the same end event (e.g. hangup + aviation_call_ended + videoConferenceLeft).
  const statusRestoredRef = useRef(false);

  useEffect(() => {
    if (!userId) return;
    AviationCallSocket.connect(userId);
  }, [userId]);

  const {
    isInCall,
    incomingCall,
    activeCall,
    callStatus,
    error: callError,
    startCall,
    acceptCall,
    rejectCall,
    hangupCall,
    getParticipants,
    clearError,
  } = useAviationCall(userId);

  useEffect(() => {
    if (!userId) return;
    PhysicianStatusService.start(userId);
  }, [userId]);

  // Keep the physician presence status in sync with the active call on every
  // page (not just AllEvents). While a call is active the provider is "busy";
  // when it ends/rejects the last manual status (available/away) is restored.
  useEffect(() => {
    if (!userId) return;
    const inActiveCall =
      isInCall || callStatus === "ringing" || callStatus === "connected";
    if (typeof window !== "undefined") {
      window.__AVIATION_CALL_ACTIVE = !!inActiveCall;
    }
    if (inActiveCall) {
      // Reset the restore guard whenever a new call cycle begins.
      statusRestoredRef.current = false;
      PhysicianStatusService.markBusyOnCallAccept();
    } else if (!statusRestoredRef.current) {
      // Only restore ONCE per call cycle.
      statusRestoredRef.current = true;
      PhysicianStatusService.markAvailableOnCallEnd();
    }
  }, [isInCall, callStatus, userId]);

  // Belt-and-braces: some call-end signals only arrive as `left_ack` on the
  // socket (e.g. the physician leaving/hanging up on their side). Make sure
  // the presence restore runs for those too — and run it IMMEDIATELY, not
  // waiting for the isInCall/callStatus effect to catch up.
  useEffect(() => {
    if (!userId) return;

    const restoreNow = () => {
      if (statusRestoredRef.current) return;
      statusRestoredRef.current = true;
      PhysicianStatusService.markAvailableOnCallEnd();
    };

    const events = [
      "aviation_call_left_ack",
      "aviation_call_cancelled",
      "aviation_call_ended",
      "aviation_call_rejected",
      "aviation_call_reject_ack",
    ];
    events.forEach((evt) => AviationCallSocket.on(evt, restoreNow));
    return () =>
      events.forEach((evt) => AviationCallSocket.off(evt, restoreNow));
  }, [userId]);

  // Show snackbar when call is cancelled because another device answered
  useEffect(() => {
    if (!userId) return;
    const handleCancelled = (data) => {
      if (data?.reason === "answered_on_other_device") {
        setCancelledSnackbar({
          open: true,
          message: data?.message || "Call answered on another device",
        });
      }
    };
    AviationCallSocket.on("aviation_call_cancelled", handleCancelled);
    return () =>
      AviationCallSocket.off("aviation_call_cancelled", handleCancelled);
  }, [userId]);

  const prepareJitsiSession = useCallback((callPayload) => {
    const roomId = resolveRoomId(callPayload);
    if (!roomId) return false;

    jitsiCallDataRef.current = { ...callPayload, roomId };
    setJitsiRoomId(roomId);
    setShowJitsi(true);
    return true;
  }, []);

  useEffect(() => {
    if (callStatus === "idle" && !isInCall) {
      setShowJitsi(false);
      setIsPiP(false);
      setJitsiRoomId(null);
      jitsiCallDataRef.current = null;
    }
  }, [callStatus, isInCall]);

  const openJitsi = useCallback(
    (callOverride) => {
      const callPayload = callOverride || activeCall;
      return prepareJitsiSession(callPayload);
    },
    [activeCall, prepareJitsiSession],
  );

  const closeJitsi = useCallback(() => setShowJitsi(false), []);
  const togglePiP = useCallback(() => setIsPiP((prev) => !prev), []);
  const setPiPMode = useCallback((next) => setIsPiP(Boolean(next)), []);

  const physicianUser = useMemo(
    () => mapPhysicianToWebUser(session),
    [session],
  );

  const handleAcceptCall = useCallback(
    (data) => {
      const callPayload = {
        ...incomingCall,
        ...data,
        callId:
          data?.callId || incomingCall?.callId || incomingCall?.broadcastId,
        roomId: data?.roomId || incomingCall?.roomId || data?.callId,
        fromUserId:
          data?.fromUserId ||
          incomingCall?.fromUserId ||
          incomingCall?.callerId,
        callerId:
          data?.fromUserId ||
          incomingCall?.fromUserId ||
          incomingCall?.callerId,
        callerName: incomingCall?.callerName || data?.callerName,
        callerRole: incomingCall?.callerRole || data?.callerRole,
        toUserId: data?.toUserId || incomingCall?.toUserId || userId,
        patientName:
          resolvePatientName(incomingCall) || resolvePatientName(data) || null,
        incidentId: data?.incidentId || incomingCall?.incidentId || null,
        acceptedByName: physicianUser?.name || "Physician",
      };

      const roomId = resolveRoomId(callPayload);
      if (!roomId) {
        console.error("handleAcceptCall: missing roomId", callPayload);
        return false;
      }

      // New call cycle begins — reset the restore guard.
      statusRestoredRef.current = false;

      prepareJitsiSession(callPayload);
      return acceptCall(callPayload);
    },
    [acceptCall, incomingCall, physicianUser, prepareJitsiSession, userId],
  );

  const handleRejectCall = useCallback(
    (data) => {
      rejectCall(data);
      // Restore status IMMEDIATELY on reject — don't wait for the effect.
      if (!statusRestoredRef.current) {
        statusRestoredRef.current = true;
        PhysicianStatusService.markAvailableOnCallEnd();
      }
      setShowJitsi(false);
      setIsPiP(false);
      setJitsiRoomId(null);
      jitsiCallDataRef.current = null;
    },
    [rejectCall],
  );

  const handleHangup = useCallback(
    (data) => {
      hangupCall(data);
      // Restore status IMMEDIATELY on hangup — don't wait for the effect.
      if (!statusRestoredRef.current) {
        statusRestoredRef.current = true;
        PhysicianStatusService.markAvailableOnCallEnd();
      }
      setShowJitsi(false);
      setIsPiP(false);
      setJitsiRoomId(null);
      jitsiCallDataRef.current = null;
    },
    [hangupCall],
  );

  const value = useMemo(
    () => ({
      userId,
      physicianUser,
      isInCall,
      incomingCall,
      activeCall,
      callStatus,
      callError,
      showJitsi,
      isPiP,
      startCall,
      acceptCall,
      rejectCall,
      hangupCall,
      getParticipants,
      clearError,
      openJitsi,
      closeJitsi,
      togglePiP,
      setIsPiP: setPiPMode,
      handleAcceptCall,
      handleRejectCall,
      handleHangup,
    }),
    [
      userId,
      physicianUser,
      isInCall,
      incomingCall,
      activeCall,
      callStatus,
      callError,
      showJitsi,
      isPiP,
      startCall,
      acceptCall,
      rejectCall,
      hangupCall,
      getParticipants,
      clearError,
      openJitsi,
      closeJitsi,
      togglePiP,
      setPiPMode,
      handleAcceptCall,
      handleRejectCall,
      handleHangup,
    ],
  );

  const stableJitsiCallData = jitsiCallDataRef.current || activeCall;

  return (
    <AviationCallContext.Provider value={value}>
      {children}

      {callStatus === "ringing" && incomingCall && !showJitsi && (
        <IncomingCallScreen
          callData={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          onHangup={handleHangup}
          callerImage={resolvePatientAvatar(incomingCall)}
          isRinging
        />
      )}

      {showJitsi && jitsiRoomId && stableJitsiCallData && (
        <JitsiCall
          key={jitsiRoomId}
          broadcastId={jitsiRoomId}
          callData={{
            ...stableJitsiCallData,
            patientName:
              resolvePatientName(stableJitsiCallData) ||
              stableJitsiCallData.patientName ||
              null,
            callerName:
              stableJitsiCallData.callerName ||
              physicianUser?.name ||
              "Physician",
            callerRole: stableJitsiCallData.callerRole || "physician",
            toUserId: stableJitsiCallData.toUserId,
          }}
          onEndCall={handleHangup}
          onClose={closeJitsi}
          isPiP={isPiP}
          togglePiP={togglePiP}
          setIsPiP={setPiPMode}
          domain={JITSI_SERVER_URL}
          darkMode={darkMode}
        />
      )}

      <Snackbar
        open={cancelledSnackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setCancelledSnackbar({ ...cancelledSnackbar, open: false })
        }
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="info"
          onClose={() =>
            setCancelledSnackbar({ ...cancelledSnackbar, open: false })
          }
          sx={{ width: "100%", maxWidth: 400 }}
        >
          {cancelledSnackbar.message}
        </Alert>
      </Snackbar>
    </AviationCallContext.Provider>
  );
}

export function useAviationCallContext() {
  const ctx = useContext(AviationCallContext);
  if (!ctx) {
    throw new Error(
      "useAviationCallContext must be used within AviationCallProvider",
    );
  }
  return ctx;
}

export default AviationCallContext;
