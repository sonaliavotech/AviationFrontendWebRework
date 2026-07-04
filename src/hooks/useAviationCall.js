// web/src/hooks/useAviationCall.js
import { useState, useEffect, useCallback, useRef } from "react";
import callSocket from "../services/AviationCallSocket";

export const useAviationCall = (userId) => {
    const [isInCall, setIsInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [activeCall, setActiveCall] = useState(null);
    const [callStatus, setCallStatus] = useState("idle");
    const [error, setError] = useState(null);
    const callStartTimeRef = useRef(null);
    const callTimerRef = useRef(null);

    // Socket event listeners (connection lifecycle is managed at session level)
    useEffect(() => {
        // 🔥 Listen for aviation_incoming_call (backend sends this)
        const incomingHandler = (data) => {
            console.log("📞 Incoming call event:", data);
            // Check if this call is for current user
            const isForMe = data.toUserId === userId || data.receiverId === userId;
            if (!isForMe) {
                console.log("⚠️ Incoming call not for me, ignoring");
                return;
            }
            setIncomingCall(data);
            setCallStatus("ringing");
            setIsInCall(true);
        };
        callSocket.on("aviation_incoming_call", incomingHandler);

        const acceptedHandler = (data) => {
            console.log("✅ Call accepted:", data);
            setCallStatus("connected");
            setActiveCall(data);
            setIncomingCall(null);
            callStartTimeRef.current = Date.now();
        };
        callSocket.on("aviation_call_accepted", acceptedHandler);

        const rejectedHandler = (data) => {
            console.log("❌ Call rejected:", data);
            setCallStatus("idle");
            setIsInCall(false);
            setIncomingCall(null);
            setActiveCall(null);
        };
        callSocket.on("aviation_call_rejected", rejectedHandler);

        const endedHandler = (data) => {
            console.log("📴 Call ended:", data);
            setCallStatus("idle");
            setIsInCall(false);
            setActiveCall(null);
            setIncomingCall(null);
            callStartTimeRef.current = null;
        };
        callSocket.on("aviation_call_ended", endedHandler);

        const participantJoinedHandler = (data) => {
            console.log("👤 Participant joined:", data);
            // Update active call participants
            if (activeCall) {
                setActiveCall(prev => ({
                    ...prev,
                    participants: data.participants || prev.participants
                }));
            }
        };
        callSocket.on("aviation_call_participant_joined", participantJoinedHandler);

        const participantLeftHandler = (data) => {
            console.log("👤 Participant left:", data);
            if (activeCall) {
                setActiveCall(prev => ({
                    ...prev,
                    participants: data.participants || prev.participants
                }));
            }
        };
        callSocket.on("aviation_call_participant_left", participantLeftHandler);

        const participantsListHandler = (data) => {
            console.log("📋 Participants list:", data);
            if (activeCall) {
                setActiveCall(prev => ({
                    ...prev,
                    participants: data.participants || []
                }));
            }
        };
        callSocket.on("aviation_call_participants_list", participantsListHandler);

        const errorHandler = (data) => {
            console.error("⚠️ Call error:", data);
            setError(data.message);
            setCallStatus("idle");
        };
        callSocket.on("aviation_call_error", errorHandler);

        return () => {
            callSocket.off("aviation_incoming_call", incomingHandler);
            callSocket.off("aviation_call_accepted", acceptedHandler);
            callSocket.off("aviation_call_rejected", rejectedHandler);
            callSocket.off("aviation_call_ended", endedHandler);
            callSocket.off("aviation_call_participant_joined", participantJoinedHandler);
            callSocket.off("aviation_call_participant_left", participantLeftHandler);
            callSocket.off("aviation_call_participants_list", participantsListHandler);
            callSocket.off("aviation_call_error", errorHandler);
        };
    }, [userId, activeCall]);

    // Start call timer
    useEffect(() => {
        if (callStatus === "connected") {
            callTimerRef.current = setInterval(() => {
                // Update call duration if needed
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

    // 🔥 Start a call from Web to Mobile/Crew
    const startCall = useCallback((data) => {
        if (!userId) {
            console.error("No userId available");
            return false;
        }

        const callData = {
            ...data,
            fromUserId: userId,
            callFromWeb: true,
            callFromMobile: false,
            callId: data.callId || `call_${Date.now()}`,
            roomId: data.roomId || `room_${Date.now()}`,
            source: 'web', // 🔥 Important: Mark as web source
        };

        console.log("📤 Starting web call:", callData);
        const success = callSocket.callFromWeb(callData);
        if (success) {
            setCallStatus("ringing");
            setActiveCall(callData);
            setIsInCall(true);
        }
        return success;
    }, [userId]);

    // 🔥 Accept incoming call
    const acceptCall = useCallback((data) => {
        if (!userId) {
            console.error("No userId available");
            return false;
        }

        const acceptData = {
            ...data,
            acceptedBy: userId,
            callId: data.callId || incomingCall?.callId,
            roomId: data.roomId || incomingCall?.roomId,
            fromUserId: data.fromUserId || incomingCall?.fromUserId,
            source: 'web', // 🔥 Mark as web source
        };

        console.log("📤 Accepting call:", acceptData);
        const success = callSocket.acceptCall(acceptData);
        if (success) {
            setCallStatus("connecting");
            const roomName = acceptData.roomId || acceptData.callId;
            setActiveCall({ ...acceptData, roomName });
        }
        return success;
    }, [userId, incomingCall]);

    // 🔥 Reject incoming call
    const rejectCall = useCallback((data) => {
        if (!userId) return false;

        const rejectData = {
            ...data,
            rejectedBy: userId,
            callId: data.callId || incomingCall?.callId,
            roomId: data.roomId || incomingCall?.roomId,
            fromUserId: data.fromUserId || incomingCall?.fromUserId,
            source: 'web',
        };

        console.log("📤 Rejecting call:", rejectData);
        const success = callSocket.rejectCall(rejectData);
        if (success) {
            setCallStatus("idle");
            setIsInCall(false);
            setIncomingCall(null);
            setActiveCall(null);
        }
        return success;
    }, [userId, incomingCall]);

    // 🔥 Hangup active call
    const hangupCall = useCallback((data) => {
        if (!userId) return false;

        const hangupData = {
            ...data,
            endedBy: userId,
            callId: data.callId || activeCall?.callId || incomingCall?.callId,
            roomId: data.roomId || activeCall?.roomId || incomingCall?.roomId,
            source: 'web',
        };

        console.log("📤 Hanging up call:", hangupData);
        const success = callSocket.hangupCall(hangupData);
        if (success) {
            setCallStatus("idle");
            setIsInCall(false);
            setIncomingCall(null);
            setActiveCall(null);
            callStartTimeRef.current = null;
        }
        return success;
    }, [userId, activeCall, incomingCall]);

    // 🔥 Get participants
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