import { io } from "socket.io-client";
import { API_HOST } from "../config/appConfig";

class IncidentSocket {
  constructor() {
    this.socket = null;
    this.currentIncidentId = null;
    this.inFeedRoom = false;
  }

  connect() {
    if (this.socket?.connected) return this.socket;

    if (!this.socket) {
      this.socket = io(API_HOST, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.io.on("reconnect", () => {
        if (this.inFeedRoom) {
          this.socket.emit("join_incidents_feed");
        }
        if (this.currentIncidentId) {
          this.socket.emit("join_incident_room", {
            incidentId: this.currentIncidentId,
          });
        }
      });
    } else if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  joinIncidentsFeed() {
    this.connect();
    this.inFeedRoom = true;
    if (this.socket.connected) {
      this.socket.emit("join_incidents_feed");
    } else {
      this.socket.once("connect", () => {
        if (this.inFeedRoom) this.socket.emit("join_incidents_feed");
      });
    }
  }

  leaveIncidentsFeed() {
    if (!this.socket || !this.inFeedRoom) return;
    this.socket.emit("leave_incidents_feed");
    this.inFeedRoom = false;
  }

  joinIncident(incidentId) {
    if (!incidentId) return;
    this.connect();
    this.currentIncidentId = String(incidentId);
    if (this.socket.connected) {
      this.socket.emit("join_incident_room", {
        incidentId: this.currentIncidentId,
      });
    } else {
      this.socket.once("connect", () => {
        if (this.currentIncidentId) {
          this.socket.emit("join_incident_room", {
            incidentId: this.currentIncidentId,
          });
        }
      });
    }
  }

  leaveIncident() {
    if (!this.socket || !this.currentIncidentId) return;
    this.socket.emit("leave_incident_room", {
      incidentId: this.currentIncidentId,
    });
    this.currentIncidentId = null;
  }

  on(event, callback) {
    this.connect();
    this.socket.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }

  disconnect() {
    this.leaveIncident();
    this.leaveIncidentsFeed();
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
  }
}

export default new IncidentSocket();