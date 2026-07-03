class JitsiService {
    constructor() {
        this.api = null;
        this.roomName = null;
        this.isConnected = false;
        this._participants = new Map();
        this._callbacks = {
            onParticipantJoined: null,
            onParticipantLeft: null,
            onConnectionStatus: null,
            onReady: null,
            onParticipantMuted: null,
            onParticipantUnmuted: null,
            onScreenSharing: null,
        };
    }

    initJitsi(roomName, options = {}) {
        if (!window.JitsiMeetExternalAPI) {
            console.error("JitsiMeetExternalAPI not loaded");
            return null;
        }

        const domain = options.domain || "meet.jit.si";
        const container = options.container || "jitsi-container";

        this.api = new window.JitsiMeetExternalAPI(domain, {
            roomName,
            width: "100%",
            height: "100%",
            parentNode: document.getElementById(container),
            configOverwrite: {
                disableDeepLinking: true,
                disableInviteFunctions: true,
                disableProfile: true,
                hideConferenceSubject: true,
                hideConferenceTimer: true,
                hideVideoQualityLabel: true,
                prejoinPageEnabled: false,
                startWithVideoMuted: options.startWithVideoMuted ?? false,
                startWithAudioMuted: options.startWithAudioMuted ?? false,
                enableWelcomePage: false,
                enableClosePage: false,
                enableInsecureRoomNameWarning: false,
                toolbarButtons: [
                    "camera",
                    "microphone",
                    "closedcaptions",
                    "desktop",
                    "chat",
                    "raisehand",
                    "videoquality",
                    "filmstrip",
                    "fullscreen",
                    "settings",
                    "tileview",
                    "hangup",
                ],
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                SHOW_BRAND_WATERMARK: false,
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: false,
                TOOLBAR_ALWAYS_VISIBLE: true,
            },
            userInfo: {
                displayName: options.displayName || "Physician",
                email: options.email || "",
            },
        });

        this.roomName = roomName;
        this._setupEventListeners();

        return this.api;
    }

    _setupEventListeners() {
        if (!this.api) return;

        this.api.addListener("readyToClose", () => {
            console.log("Jitsi ready to close");
        });

        this.api.addListener("participantJoined", (participant) => {
            console.log("Participant joined:", participant);
            this._participants.set(participant.id, participant);
            if (this._callbacks.onParticipantJoined) {
                this._callbacks.onParticipantJoined(participant);
            }
        });

        this.api.addListener("participantLeft", (participant) => {
            console.log("Participant left:", participant);
            this._participants.delete(participant.id);
            if (this._callbacks.onParticipantLeft) {
                this._callbacks.onParticipantLeft(participant);
            }
        });

        this.api.addListener("connectionStatusChanged", (status) => {
            this.isConnected = status === "connected";
            if (this._callbacks.onConnectionStatus) {
                this._callbacks.onConnectionStatus(status);
            }
        });

        this.api.addListener("audioMuteStatusChanged", (data) => {
            if (data.muted && this._callbacks.onParticipantMuted) {
                this._callbacks.onParticipantMuted(data.id, "audio");
            } else if (!data.muted && this._callbacks.onParticipantUnmuted) {
                this._callbacks.onParticipantUnmuted(data.id, "audio");
            }
        });

        this.api.addListener("videoMuteStatusChanged", (data) => {
            if (data.muted && this._callbacks.onParticipantMuted) {
                this._callbacks.onParticipantMuted(data.id, "video");
            } else if (!data.muted && this._callbacks.onParticipantUnmuted) {
                this._callbacks.onParticipantUnmuted(data.id, "video");
            }
        });

        this.api.addListener("screenSharingStatusChanged", (data) => {
            if (this._callbacks.onScreenSharing) {
                this._callbacks.onScreenSharing(data);
            }
        });

        this.api.addListener("videoConferenceJoined", (data) => {
            console.log("Video conference joined:", data);
            if (this._callbacks.onReady) {
                this._callbacks.onReady(data);
            }
        });

        this.api.addListener("videoConferenceLeft", () => {
            console.log("Video conference left");
            this.isConnected = false;
        });
    }

    muteAudio() {
        this.api?.executeCommand("toggleAudio");
    }

    muteVideo() {
        this.api?.executeCommand("toggleVideo");
    }

    shareScreen() {
        this.api?.executeCommand("toggleScreenSharing");
    }

    hangup() {
        this.api?.executeCommand("hangup");
    }

    kickParticipant(participantId) {
        this.api?.executeCommand("kickParticipant", participantId);
    }

    onParticipantJoined(callback) {
        this._callbacks.onParticipantJoined = callback;
    }

    onParticipantLeft(callback) {
        this._callbacks.onParticipantLeft = callback;
    }

    onConnectionStatus(callback) {
        this._callbacks.onConnectionStatus = callback;
    }

    onReady(callback) {
        this._callbacks.onReady = callback;
    }

    onParticipantMuted(callback) {
        this._callbacks.onParticipantMuted = callback;
    }

    onParticipantUnmuted(callback) {
        this._callbacks.onParticipantUnmuted = callback;
    }

    onScreenSharing(callback) {
        this._callbacks.onScreenSharing = callback;
    }

    getParticipants() {
        return Array.from(this._participants.values());
    }

    dispose() {
        if (this.api) {
            this.api.dispose();
            this.api = null;
            this.roomName = null;
            this.isConnected = false;
            this._participants.clear();
        }
    }

    isInCall() {
        return this.isConnected && this.api !== null;
    }
}

const jitsiService = new JitsiService();
export default jitsiService;