import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
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

export function AviationCallProvider({ children }) {
  const session = getPhysicianSession();
  const userId = session?.id ? String(session.id) : null;
  const { darkMode } = useThemeMode();
  const [showJitsi, setShowJitsi] = useState(false);

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
    if (callStatus === "idle" && !isInCall) {
      setShowJitsi(false);
    }
  }, [callStatus, isInCall]);

  const openJitsi = useCallback(() => setShowJitsi(true), []);
  const closeJitsi = useCallback(() => setShowJitsi(false), []);

  const handleAcceptCall = useCallback(
    (data) => {
      const success = acceptCall(data);
      if (success) setShowJitsi(true);
      return success;
    },
    [acceptCall],
  );

  const handleRejectCall = useCallback(
    (data) => {
      rejectCall(data);
      setShowJitsi(false);
    },
    [rejectCall],
  );

  const handleHangup = useCallback(
    (data) => {
      hangupCall(data);
      setShowJitsi(false);
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
      startCall,
      acceptCall,
      rejectCall,
      hangupCall,
      getParticipants,
      clearError,
      openJitsi,
      closeJitsi,
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
      startCall,
      acceptCall,
      rejectCall,
      hangupCall,
      getParticipants,
      clearError,
      openJitsi,
      closeJitsi,
      handleAcceptCall,
      handleRejectCall,
      handleHangup,
    ],
  );

  const incidentId = activeCall?.incidentId;

  return (
    <AviationCallContext.Provider value={value}>
      {children}

      {callStatus === "ringing" && incomingCall && (
        <IncomingCallScreen
          callData={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          onHangup={handleHangup}
          isRinging
        />
      )}

      {showJitsi && activeCall && (
        <JitsiCall
          broadcastId={
            activeCall.roomId ||
            activeCall.callId ||
            (incidentId ? `call_${incidentId}` : `call_${Date.now()}`)
          }
          callData={{
            ...activeCall,
            callerName: activeCall.callerName || physicianUser?.name || "Physician",
            callerRole: activeCall.callerRole || "physician",
            toUserId: activeCall.toUserId,
          }}
          setIsChatOpen={() => {}}
          onOnlyParticipantTimeout={() => {}}
          onRemoteParticipantAvailable={() => {}}
          onEndCall={handleHangup}
          onClose={closeJitsi}
          domain="tiajitsistg.tiatech.net"
          darkMode={darkMode}
        />
      )}

      {callStatus === "connecting" && activeCall && !showJitsi && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center", color: "#fff" }}>
            <LoadingSpinner
              variant="inline"
              size="lg"
              message="Connecting to call..."
            />
            <Button
              onClick={() => handleHangup({ callId: activeCall.callId })}
              sx={{
                mt: 2,
                color: "#EF4444",
                borderColor: "#EF4444",
                "&:hover": { borderColor: "#DC2626", color: "#DC2626" },
              }}
              variant="outlined"
            >
              Cancel
            </Button>
          </Box>
        </Box>
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
