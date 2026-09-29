// web/src/hooks/useAviationCall.js
import { useState, useEffect, useCallback, useRef } from "react";
import callSocket from "../services/AviationCallSocket";
import { withResolvedPatientName } from "../utils/aviationCallDisplay";

const normalizeCallId = (value) => String(value || "").trim();

// How long the CALLER waits for an answer before the call auto-ends. The
// callee side already has its own 30s auto-reject in IncomingCallScreen —
// this is the missing counterpart for the person who placed the call.
const NO_ANSWER_TIMEOUT_MS = 30000;

// Belt-and-braces dedup: if the backend ever emits an overlapping
// "participant joined" event for the same user, this makes sure the UI
// never ends up rendering the same participant twice.
const dedupeParticipants = (list = []) => {
  const byId = new Map();
  list.forEach((p) => {
    const key = String(
      p.userId ?? p.id ?? p.participantId ?? p.jid ?? p.displayName ?? "",
    );
    if (!key) return;
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
  const incomingCallRef = useRef(null);
  const processedAcceptRef = useRef(null);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  // The call this user is currently involved in, in EITHER state. While a call
  // is still ringing it only exists in `incomingCall`; once accepted it moves
  // to `activeCall`. End/cancel/reject handlers must match against both,
  // otherwise a cancel arriving during ringing matches nothing and the
  // incoming-call screen never dismisses.
  const currentCallId = useCallback(() => {
    const incoming = incomingCallRef.current;
    const active = activeCallRef.current;
    return normalizeCallId(
      (active && (active.callId || active.broadcastId)) ||
        (incoming && (incoming.callId || incoming.broadcastId)) ||
        "",
    );
  }, []);

  // Shared teardown for every "this call is over" socket event.
  const teardownCall = useCallback((data, { requireMatchingCallId = false } = {}) => {
    if (requireMatchingCallId) {
      const callId = normalizeCallId(data?.callId || data?.broadcastId);
      if (callId && normalizeCallId(currentCallId()) !== callId) return false;
    }
    processedAcceptRef.current = null;
    callStartTimeRef.current = null;
    setCallStatus("idle");
    setIsInCall(false);
    setIncomingCall(null);
    setActiveCall(null);
    return true;
  }, [currentCallId]);

  useEffect(() => {
    if (!userId) return;

    const incomingHandler = (data) => {
      const callId = normalizeCallId(data.callId || data.broadcastId);
      const isForMe =
        String(data.toUserId) === String(userId) ||
        String(data.receiverId) === String(userId);
      if (!isForMe || !callId) return;

      if (activeCallRef.current?.callId === callId) return;

      setIncomingCall(withResolvedPatientName(data));
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

    // Someone (another physician, or the caller) declined/ended. Must dismiss
    // the ringing screen too, so no callId matching is required here.
    const rejectedHandler = (data) => {
      teardownCall(data);
    };
    callSocket.on("aviation_call_rejected", rejectedHandler);

    const endedHandler = (data) => {
      teardownCall(data);
    };
    callSocket.on("aviation_call_ended", endedHandler);

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
      setError(data?.message);
      teardownCall(data);
    };
    callSocket.on("aviation_call_error", errorHandler);

    // The caller (crew) hung up or cancelled while we were still ringing.
    // This is the "incoming call screen won't go away" path: it has to match
    // against the RINGING call, which lives in `incomingCallRef`, not just
    // `activeCallRef` (empty until the call is accepted).
    const cancelledHandler = (data) => {
      const callId = normalizeCallId(data?.callId || data?.broadcastId);
      if (!callId) return;
      if (normalizeCallId(currentCallId()) !== callId) return;
      teardownCall(data, { requireMatchingCallId: true });
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
  }, [userId, currentCallId, teardownCall]);

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

      // Jitsi is joined by the caller regardless of the emit result, so the
      // local state has to move to "connected" even when the socket is down —
      // otherwise the ringing screen would sit on top of the live Jitsi call.
      const emitted = callSocket.acceptCall(acceptData);
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
      return emitted;
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

      // Best-effort emit: if the socket is down the server never hears about
      // the decline, but the physician already tapped Decline. Always tear
      // the UI down, otherwise a disconnected socket leaves the incoming-call
      // screen stuck on screen with no way to dismiss it.
      const emitted = callSocket.rejectCall(rejectData);
      teardownCall(rejectData);
      return emitted;
    },
    [userId, incomingCall, teardownCall],
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

      // Same rationale as rejectCall: local teardown must not depend on the
      // emit succeeding, or a dropped socket leaves the call UI stuck.
      const emitted = callSocket.hangupCall(hangupData);
      teardownCall(hangupData);
      return emitted;
    },
    [userId, activeCall, incomingCall, teardownCall],
  );

  // Always call the LATEST hangupCall from the timeout below without
  // putting the (frequently-changing) hangupCall function itself in that
  // effect's dependency array — otherwise every minor activeCall update
  // (e.g. a participants-list tick) would reset the 30s countdown.
  const hangupCallRef = useRef(hangupCall);
  useEffect(() => {
    hangupCallRef.current = hangupCall;
  }, [hangupCall]);

  // ── Auto-end an outbound call nobody answered within 30 seconds ────
  // Only applies to the CALLER (the device that placed the call, i.e.
  // activeCall.fromUserId === userId). The callee's own 30s ring timeout
  // already lives in IncomingCallScreen and auto-rejects on their side;
  // this is the caller-side counterpart so a web user who calls someone
  // that never answers doesn't ring forever.
  useEffect(() => {
    const isOutboundRinging =
      callStatus === "ringing" &&
      activeCall &&
      String(activeCall.fromUserId) === String(userId);

    if (!isOutboundRinging) {
      return undefined;
    }

    const callId = activeCall.callId;
    const roomId = activeCall.roomId;

    const timeoutId = setTimeout(() => {
      // Re-check we're still ringing on the SAME call before acting —
      // guards against a stale timer firing after the call already
      // connected/ended/changed identity.
      const current = activeCallRef.current;
      if (
        !current ||
        normalizeCallId(current.callId) !== normalizeCallId(callId)
      ) {
        return;
      }

      console.log(
        `No answer within ${NO_ANSWER_TIMEOUT_MS / 1000}s — auto-ending outbound call`,
        callId,
      );

      hangupCallRef.current?.({
        callId,
        roomId,
        endedBy: userId,
        reason: "no-answer",
      });
    }, NO_ANSWER_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [
    callStatus,
    activeCall?.callId,
    activeCall?.fromUserId,
    activeCall?.roomId,
    userId,
  ]);

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
