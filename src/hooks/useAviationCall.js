import { useState, useEffect, useCallback, useRef } from "react";
import callSocket from "../services/AviationCallSocket";
import jitsiService from "../services/JitsiService";

export const useAviationCall = (userId) => {
    const [isInCall, setIsInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [activeCall, setActiveCall] = useState(null);
    const [callStatus, setCallStatus] = useState("idle");
    const [error, setError] = useState(null);
    const callStartTimeRef = useRef(null);
    const callTimerRef = useRef(null);

    // Connect socket when userId changes
    useEffect(() => {
        if (userId) {
            callSocket.connect(userId);
        }
        return () => {
            callSocket.disconnect();
        };
    }, [userId]);

    // Socket event listeners
    useEffect(() => {
        const incomingHandler = (data) => {
            console.log("📞 Incoming call event:", data);
            setIncomingCall(data);
            setCallStatus("ringing");
            setIsInCall(true);
        };
        callSocket.on("incoming_call", incomingHandler);

        const acceptedHandler = (data) => {
            console.log("✅ Call accepted:", data);
            setCallStatus("connected");
            setActiveCall(data);
            setIncomingCall(null);
            callStartTimeRef.current = Date.now();
        };
        callSocket.on("call_accepted", acceptedHandler);

        const rejectedHandler = (data) => {
            console.log("❌ Call rejected:", data);
            setCallStatus("idle");
            setIsInCall(false);
            setIncomingCall(null);
            setActiveCall(null);
        };
        callSocket.on("call_rejected", rejectedHandler);

        const endedHandler = (data) => {
            console.log("📴 Call ended:", data);
            setCallStatus("idle");
            setIsInCall(false);
            setActiveCall(null);
            setIncomingCall(null);
            callStartTimeRef.current = null;
            jitsiService.hangup();
            jitsiService.dispose();
        };
        callSocket.on("call_ended", endedHandler);

        const participantJoinedHandler = (data) => {
            console.log("👤 Participant joined:", data);
        };
        callSocket.on("participant_joined", participantJoinedHandler);

        const participantLeftHandler = (data) => {
            console.log("👤 Participant left:", data);
        };
        callSocket.on("participant_left", participantLeftHandler);

        const errorHandler = (data) => {
            console.error("⚠️ Call error:", data);
            setError(data.message);
            setCallStatus("idle");
        };
        callSocket.on("call_error", errorHandler);

        return () => {
            callSocket.off("incoming_call", incomingHandler);
            callSocket.off("call_accepted", acceptedHandler);
            callSocket.off("call_rejected", rejectedHandler);
            callSocket.off("call_ended", endedHandler);
            callSocket.off("participant_joined", participantJoinedHandler);
            callSocket.off("participant_left", participantLeftHandler);
            callSocket.off("call_error", errorHandler);
        };
    }, []);

    // Start call timer
    useEffect(() => {
        if (callStatus === "connected") {
            callTimerRef.current = setInterval(() => {
                // Update call duration
            }, 1000);
        } else {
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
                callTimerRef.current = null;
            }
        }
        return () => {
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
        };
    }, [callStatus]);

    const startCall = useCallback(
        (data) => {
            const callData = {
                ...data,
                fromUserId: userId,
                callFromWeb: true,
                callFromMobile: false,
                callId: data.callId || `call_${Date.now()}`,
                roomId: data.roomId || `call_${Date.now()}`,
            };

            const success = callSocket.callFromWeb(callData);
            if (success) {
                setCallStatus("ringing");
                setActiveCall(callData);
                setIsInCall(true);
            }
            return success;
        },
        [userId]
    );

    const acceptCall = useCallback(
        (data) => {
            const acceptData = {
                ...data,
                acceptedBy: userId,
                callId: data.callId || incomingCall?.callId,
                roomId: data.roomId || incomingCall?.roomId,
                fromUserId: data.fromUserId || incomingCall?.fromUserId,
            };

            const success = callSocket.acceptCall(acceptData);
            if (success) {
                setCallStatus("connecting");
                const roomName = acceptData.roomId || acceptData.callId;
                setActiveCall({ ...acceptData, roomName });
            }
            return success;
        },
        [userId, incomingCall]
    );

    const rejectCall = useCallback(
        (data) => {
            const rejectData = {
                ...data,
                rejectedBy: userId,
                callId: data.callId || incomingCall?.callId,
                roomId: data.roomId || incomingCall?.roomId,
                fromUserId: data.fromUserId || incomingCall?.fromUserId,
            };

            const success = callSocket.rejectCall(rejectData);
            if (success) {
                setCallStatus("idle");
                setIsInCall(false);
                setIncomingCall(null);
                setActiveCall(null);
            }
            return success;
        },
        [userId, incomingCall]
    );

    const hangupCall = useCallback(
        (data) => {
            const hangupData = {
                ...data,
                endedBy: userId,
                callId: data.callId || activeCall?.callId || incomingCall?.callId,
                roomId: data.roomId || activeCall?.roomId || incomingCall?.roomId,
            };

            const success = callSocket.hangupCall(hangupData);
            if (success) {
                setCallStatus("idle");
                setIsInCall(false);
                setIncomingCall(null);
                setActiveCall(null);
                jitsiService.hangup();
                jitsiService.dispose();
                callStartTimeRef.current = null;
            }
            return success;
        },
        [userId, activeCall, incomingCall]
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