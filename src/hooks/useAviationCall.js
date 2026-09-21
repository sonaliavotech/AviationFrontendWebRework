// web/src/hooks/useAviationCall.js
import { useState, useEffect, useCallback, useRef } from "react";
import callSocket from "../services/AviationCallSocket";

const normalizeCallId = (value) => String(value || "").trim();

// NEW: belt-and-braces dedup. If the backend ever emits an overlapping
// "participant joined" event for the same user (e.g. a race between the
// original join and a reconnect join before the old session's "left" event
// has propagated — see the JitsiCall reconnect fix), this makes sure the
// UI never ends up rendering the same participant twice regardless of
// what the server sends.
const dedupeParticipants = (list = []) => {
  const byId = new Map();
  list.forEach((p) => {
    const key = String(
      p.userId ?? p.id ?? p.participantId ?? p.jid ?? p.displayName ?? "",
    );
    if (!key) return;
    // Last write wins, so the most recent info for that participant is kept.
    byId.set(key, p);
  });
  return Array.from(byId.values());
};

export const useAviationCall = (userId) => {
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [error, setError] = useState(null);
  const callStartTimeRef = useRef(null);
  const callTimerRef = useRef(null);
  const activeCallRef = useRef(null);
  const processedAcceptRef = useRef(null);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    if (!userId) return;

    const incomingHandler = (data) => {
      const callId = normalizeCallId(data.callId || data.broadcastId);
      const isForMe =
        String(data.toUserId) === String(userId) ||
        String(data.receiverId) === String(userId);
      if (!isForMe || !callId) return;

      if (activeCallRef.current?.callId === callId) return;

      setIncomingCall(data);
      setCallStatus("ringing");
      setIsInCall(true);
    };
    callSocket.on("aviation_incoming_call", incomingHandler);

    const acceptedHandler = (data) => {
      const callId = normalizeCallId(data.callId || data.broadcastId);
      if (!callId) return;

      if (processedAcceptRef.current === callId) return;
      processedAcceptRef.current = callId;

      const current = activeCallRef.current;
      const isOutboundCaller =
        current &&
        normalizeCallId(current.callId) === callId &&
        String(current.fromUserId) === String(userId);

      setCallStatus("connected");
      setIncomingCall(null);
      callStartTimeRef.current = Date.now();

      if (isOutboundCaller) {
        setActiveCall((prev) =>
          prev
            ? {
                ...prev,
                ...data,
                roomId: prev.roomId || data.roomId,
                callId: prev.callId || data.callId,
                participants: dedupeParticipants(
                  data.participants || prev.participants,
                ),
              }
            : prev,
        );
        return;
      }

      setActiveCall((prev) => ({
        ...(prev || {}),
        ...data,
        callId,
        roomId: data.roomId || prev?.roomId || callId,
        participants: dedupeParticipants(
          data.participants || prev?.participants,
        ),
      }));
    };
    callSocket.on("aviation_call_accepted", acceptedHandler);

    const acceptAckHandler = (data) => {
      const callId = normalizeCallId(data.callId || data.broadcastId);
      if (!callId) return;

      const current = activeCallRef.current;
      if (current && normalizeCallId(current.callId) !== callId) {
        return;
      }

      setCallStatus("connected");
      setIncomingCall(null);
      setIsInCall(true);
      callStartTimeRef.current = Date.now();
    };
    callSocket.on("aviation_call_accept_ack", acceptAckHandler);

    const rejectedHandler = () => {
      processedAcceptRef.current = null;
      setCallStatus("idle");
      setIsInCall(false);
      setIncomingCall(null);
      setActiveCall(null);
    };
    callSocket.on("aviation_call_rejected", rejectedHandler);

    const endedHandler = () => {
      processedAcceptRef.current = null;
      setCallStatus("idle");
      setIsInCall(false);
      setActiveCall(null);
      setIncomingCall(null);
      callStartTimeRef.current = null;
    };
    callSocket.on("aviation_call_ended", endedHandler);

    // NEW: dedupe on every participant-list-affecting event. This is the
    // defensive layer — even if a stale Jitsi session briefly re-announces
    // itself (the race the JitsiCall fix addresses), the UI list itself
    // can never contain the same participant id twice.
    const participantJoinedHandler = (data) => {
      setActiveCall((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: dedupeParticipants(
            data.participants || prev.participants,
          ),
        };
      });
    };
    callSocket.on("aviation_call_participant_joined", participantJoinedHandler);

    const participantLeftHandler = (data) => {
      setActiveCall((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: dedupeParticipants(
            data.participants || prev.participants,
          ),
        };
      });
    };
    callSocket.on("aviation_call_participant_left", participantLeftHandler);

    const participantsListHandler = (data) => {
      setActiveCall((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: dedupeParticipants(data.participants || []),
        };
      });
    };
    callSocket.on("aviation_call_participants_list", participantsListHandler);

    const errorHandler = (data) => {
      setError(data.message);
      setCallStatus("idle");
      setIsInCall(false);
      setIncomingCall(null);
      setActiveCall(null);
    };
    callSocket.on("aviation_call_error", errorHandler);

    const cancelledHandler = (data) => {
      const callId = normalizeCallId(data.callId || data.broadcastId);
      // Only clear if it's a call we're actually ringing on (avoid nuking an active call)
      if (!callId || activeCallRef.current?.callId !== callId) return;
      processedAcceptRef.current = null;
      setCallStatus("idle");
      setIsInCall(false);
      setIncomingCall(null);
      setActiveCall(null);
      callStartTimeRef.current = null;
    };
    callSocket.on("aviation_call_cancelled", cancelledHandler);

    return () => {
      callSocket.off("aviation_incoming_call", incomingHandler);
      callSocket.off("aviation_call_accepted", acceptedHandler);
      callSocket.off("aviation_call_accept_ack", acceptAckHandler);
      callSocket.off("aviation_call_rejected", rejectedHandler);
      callSocket.off("aviation_call_ended", endedHandler);
      callSocket.off(
        "aviation_call_participant_joined",
        participantJoinedHandler,
      );
      callSocket.off("aviation_call_participant_left", participantLeftHandler);
      callSocket.off(
        "aviation_call_participants_list",
        participantsListHandler,
      );
      callSocket.off("aviation_call_error", errorHandler);
      callSocket.off("aviation_call_cancelled", cancelledHandler);
    };
  }, [userId]);

  useEffect(() => {
    if (callStatus === "connected") {
      callTimerRef.current = setInterval(() => {}, 1000);
    } else if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callStatus]);

  const startCall = useCallback(
    (data) => {
      if (!userId) return false;

      processedAcceptRef.current = null;
      const callId = normalizeCallId(data.callId || `call_${Date.now()}`);
      const roomId = normalizeCallId(data.roomId || callId);

      const callData = {
        ...data,
        fromUserId: userId,
        callFromWeb: true,
        callFromMobile: false,
        callId,
        roomId,
        source: "web",
      };

      const success = callSocket.callFromWeb(callData);
      if (success) {
        setCallStatus("ringing");
        setActiveCall(callData);
        setIsInCall(true);
      }
      return success;
    },
    [userId],
  );

  const acceptCall = useCallback(
    (data) => {
      if (!userId) return false;

      const acceptData = {
        ...data,
        acceptedBy: userId,
        callId: normalizeCallId(data.callId || data.broadcastId),
        roomId: normalizeCallId(data.roomId || data.callId),
        fromUserId: data.fromUserId || data.callerId,
        source: "web",
      };

      if (!acceptData.callId || !acceptData.roomId || !acceptData.fromUserId) {
        console.error("acceptCall missing required fields:", acceptData);
        return false;
      }

      const success = callSocket.acceptCall(acceptData);
      if (success) {
        processedAcceptRef.current = acceptData.callId;
        setCallStatus("connected");
        setIncomingCall(null);
        setIsInCall(true);
        callStartTimeRef.current = Date.now();
        setActiveCall({
          ...data,
          ...acceptData,
          roomName: acceptData.roomId,
        });
      }
      return success;
    },
    [userId],
  );

  const rejectCall = useCallback(
    (data) => {
      if (!userId) return false;

      const rejectData = {
        ...data,
        rejectedBy: userId,
        callId: data.callId || incomingCall?.callId,
        roomId: data.roomId || incomingCall?.roomId,
        fromUserId: data.fromUserId || incomingCall?.fromUserId,
        source: "web",
      };

      const success = callSocket.rejectCall(rejectData);
      if (success) {
        processedAcceptRef.current = null;
        setCallStatus("idle");
        setIsInCall(false);
        setIncomingCall(null);
        setActiveCall(null);
      }
      return success;
    },
    [userId, incomingCall],
  );

  const hangupCall = useCallback(
    (data) => {
      if (!userId) return false;

      const hangupData = {
        ...data,
        endedBy: userId,
        callId: data.callId || activeCall?.callId || incomingCall?.callId,
        roomId: data.roomId || activeCall?.roomId || incomingCall?.roomId,
        source: "web",
      };

      const success = callSocket.hangupCall(hangupData);
      if (success) {
        processedAcceptRef.current = null;
        setCallStatus("idle");
        setIsInCall(false);
        setIncomingCall(null);
        setActiveCall(null);
        callStartTimeRef.current = null;
      }
      return success;
    },
    [userId, activeCall, incomingCall],
  );

  const getParticipants = useCallback((callId) => {
    return callSocket.getCallParticipants(callId);
  }, []);

  return {
    isInCall,
    incomingCall,
    activeCall,
    callStatus,
    error,
    startCall,
    acceptCall,
    rejectCall,
    hangupCall,
    getParticipants,
    clearError: () => setError(null),
  };
};

export default useAviationCall;
