import { io } from "socket.io-client";

import { CALLING_SERVICE_URL } from "../config/appConfig";

class AviationCallSocket {
    constructor() {
        this.socket = null;
        this.userId = null;
        this.registered = false;
        this._listeners = new Map();
    }

    connect(userId) {
        if (this.socket?.connected && this.userId === userId) {
            return this.socket;
        }

        if (this.socket) {
            this.disconnect();
        }

        this.userId = userId;
        this.socket = io(CALLING_SERVICE_URL, {
            transports: ["polling", "websocket"],
            reconnection: true,
            reconnectionAttempts: 15,
            reconnectionDelay: 1000,
        });

        this.socket.on("connect", () => {
            console.log("AviationCallSocket connected");
            this.socket.emit("aviation_register", { userId: this.userId });
        });

        this.socket.on("aviation_registered", () => {
            console.log("AviationCallSocket registered");
            this.registered = true;
        });

        this.socket.on("disconnect", () => {
            this.registered = false;
        });

        // Call Events
        this.socket.on("aviation_incoming_call", (data) => {
            console.log("📞 Incoming call:", data);
            this._emit("incoming_call", data);
        });

        this.socket.on("aviation_call_accepted", (data) => {
            console.log("✅ Call accepted:", data);
            this._emit("call_accepted", data);
        });

        this.socket.on("aviation_call_accept_ack", (data) => {
            this._emit("call_accept_ack", data);
        });

        this.socket.on("aviation_call_rejected", (data) => {
            console.log("❌ Call rejected:", data);
            this._emit("call_rejected", data);
        });

        this.socket.on("aviation_call_reject_ack", (data) => {
            this._emit("call_reject_ack", data);
        });

        this.socket.on("aviation_call_ended", (data) => {
            console.log("📴 Call ended:", data);
            this._emit("call_ended", data);
        });

        this.socket.on("aviation_call_left_ack", (data) => {
            this._emit("call_left_ack", data);
        });

        this.socket.on("aviation_call_participant_joined", (data) => {
            console.log("👤 Participant joined:", data);
            this._emit("participant_joined", data);
        });

        this.socket.on("aviation_call_participant_left", (data) => {
            console.log("👤 Participant left:", data);
            this._emit("participant_left", data);
        });

        this.socket.on("aviation_call_participants_list", (data) => {
            console.log("📋 Participants list:", data);
            this._emit("participants_list", data);
        });

        this.socket.on("aviation_call_error", (data) => {
            console.error("⚠️ Call error:", data);
            this._emit("call_error", data);
        });

        return this.socket;
    }

    callFromWeb(data) {
        if (!this.socket?.connected) {
            console.error("Socket not connected");
            return false;
        }
        this.socket.emit("aviation_callFromWeb", data);
        return true;
    }

    callFromMobile(data) {
        if (!this.socket?.connected) {
            console.error("Socket not connected");
            return false;
        }
        this.socket.emit("aviation_callFromMobile", data);
        return true;
    }

    acceptCall(data) {
        if (!this.socket?.connected) {
            console.error("Socket not connected");
            return false;
        }
        this.socket.emit("aviation_callAccept", data);
        return true;
    }

    rejectCall(data) {
        if (!this.socket?.connected) {
            console.error("Socket not connected");
            return false;
        }
        this.socket.emit("aviation_rejectCall", data);
        return true;
    }

    hangupCall(data) {
        if (!this.socket?.connected) {
            console.error("Socket not connected");
            return false;
        }
        this.socket.emit("aviation_hangupCall", data);
        return true;
    }

    getCallParticipants(callId) {
        if (!this.socket?.connected) {
            console.error("Socket not connected");
            return false;
        }
        this.socket.emit("aviation_getCallParticipants", { callId });
        return true;
    }

    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        this._listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this._listeners.has(event)) return;
        const listeners = this._listeners.get(event);
        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    _emit(event, data) {
        const listeners = this._listeners.get(event);
        if (listeners) {
            listeners.forEach((cb) => cb(data));
        }
    }

    isConnected() {
        return this.socket?.connected ?? false;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.registered = false;
            this._listeners.clear();
        }
    }
}

export default new AviationCallSocket();