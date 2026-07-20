import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Box, Button } from "@mui/material";
import { useAviationCall } from "../hooks/useAviationCall";
import AviationCallSocket from "../services/AviationCallSocket";
import {
  getPhysicianSession,
  mapPhysicianToWebUser,
} from "../utils/physicianSession";
import IncomingCallScreen from "../componants/calls/IncomingCallScreen";
import JitsiCall from "../componants/JitsiCall";
import LoadingSpinner from "../componants/LoadingSpinner";
import { useThemeMode } from "./ThemeContext";

const AviationCallContext = createContext(null);

const resolveRoomId = (call = {}) => {
  const roomId = call.roomId || call.callId || call.roomName || call.broadcastId;
  return roomId ? String(roomId).trim() : "";
};

export function AviationCallProvider({ children }) {
  const session = getPhysicianSession();
  const userId = session?.id ? String(session.id) : null;
  const { darkMode } = useThemeMode();
  const [showJitsi, setShowJitsi] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [jitsiRoomId, setJitsiRoomId] = useState(null);
  const jitsiCallDataRef = useRef(null);

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

  const handleAcceptCall = useCallback(
    (data) => {
      const callPayload = {
        ...incomingCall,
        ...data,
        callId: data?.callId || incomingCall?.callId || incomingCall?.broadcastId,
        roomId: data?.roomId || incomingCall?.roomId || data?.callId,
        fromUserId: data?.fromUserId || incomingCall?.fromUserId || incomingCall?.callerId,
        callerId: data?.fromUserId || incomingCall?.fromUserId || incomingCall?.callerId,
        callerName: incomingCall?.callerName || data?.callerName,
        callerRole: incomingCall?.callerRole || data?.callerRole,
        toUserId: data?.toUserId || incomingCall?.toUserId || userId,
      };

      const roomId = resolveRoomId(callPayload);
      if (!roomId) {
        console.error("handleAcceptCall: missing roomId", callPayload);
        return false;
      }

      prepareJitsiSession(callPayload);
      return acceptCall(callPayload);
    },
    [acceptCall, incomingCall, prepareJitsiSession, userId],
  );

  const handleRejectCall = useCallback(
    (data) => {
      rejectCall(data);
      setShowJitsi(false);
      setJitsiRoomId(null);
      jitsiCallDataRef.current = null;
    },
    [rejectCall],
  );

  const handleHangup = useCallback(
    (data) => {
      hangupCall(data);
      setShowJitsi(false);
      setJitsiRoomId(null);
      jitsiCallDataRef.current = null;
    },
    [hangupCall],
  );

  const physicianUser = useMemo(
    () => mapPhysicianToWebUser(session),
    [session],
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
          isRinging
        />
      )}

      {showJitsi && jitsiRoomId && stableJitsiCallData && (
        <JitsiCall
          key={jitsiRoomId}
          broadcastId={jitsiRoomId}
          callData={{
            ...stableJitsiCallData,
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
          domain="tiajitsistg.tiatech.net"
          darkMode={darkMode}
        />
      )}
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
