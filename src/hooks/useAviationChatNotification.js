import { useCallback, useEffect, useRef, useState } from "react";
import AviationChatSocket from "../services/AviationChatSocket";
import { getPhysicianSession } from "../utils/physicianSession";
import {
  mapApiMessage,
  normalizeChatPayload,
} from "../utils/chatMessageMapper";
import aviationChatUiState from "../services/aviationChatUiState";
import notificationSound from "../assets/notification_sound.wav";

// Browsers block Notification.requestPermission() without a user gesture, so we
// latch onto the first real interaction and request permission then.
let _permissionPromise = null;
const requestPermission = () => {
  if (_permissionPromise) return _permissionPromise;
  if (typeof Notification === "undefined") {
    return Promise.resolve("denied");
  }
  _permissionPromise = Notification.requestPermission();
  return _permissionPromise;
};

let _gestureBound = false;
const bindGesture = () => {
  if (_gestureBound || typeof Notification === "undefined") return;
  _gestureBound = true;
  const onGesture = () => {
    requestPermission();
    window.removeEventListener("click", onGesture);
    window.removeEventListener("keydown", onGesture);
    window.removeEventListener("touchstart", onGesture);
  };
  window.addEventListener("click", onGesture, { once: true });
  window.addEventListener("touchstart", onGesture, { once: true });
  window.addEventListener("keydown", onGesture, { once: true });
};

let _audio = null;
const playSound = () => {
  try {
    if (_audio) {
      _audio.pause();
      _audio = null;
    }
    _audio = new Audio(notificationSound);
    _audio.volume = 0.5;
    _audio.play().catch(() => {});
  } catch (_) {
    /* ignore autoplay/asset errors */
  }
};

/** Build a short, human-readable preview that matches the message type. */
function buildPreviewText(mapped) {
  switch (mapped?.type) {
    case "audio":
      return "Voice message";
    case "image":
      return "Photo";
    case "video":
      return "Video";
    case "file":
    case "document":
    case "pdf":
      return mapped.fileName || "File";
    default:
      return mapped?.text || "New message";
  }
}

/** Type -> emoji used by the in-app banner avatar. */
export function chatNotificationEmoji(mappedType) {
  switch (mappedType) {
    case "audio":
      return "🎵";
    case "image":
      return "📷";
    case "video":
      return "🎥";
    case "file":
    case "document":
    case "pdf":
      return "📎";
    default:
      return null;
  }
}

const BANNER_DURATION_MS = 6000;
const MAX_STACKED_BANNERS = 3;

export const useAviationChatNotification = () => {
  const myUserIdRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const timersRef = useRef(new Map());

  const dismissBanner = useCallback((id) => {
    const key = String(id);
    setBanners((prev) => prev.filter((b) => String(b.id) !== key));
    const timer = timersRef.current.get(key);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(key);
    }
  }, []);

  const enqueueBanner = useCallback(
    (item) => {
      const key = String(item.id);
      setBanners((prev) => {
        if (prev.some((b) => String(b.id) === key)) return prev;
        return [...prev.filter((b) => String(b.id) !== key), item].slice(
          -MAX_STACKED_BANNERS,
        );
      });
      if (timersRef.current.has(key)) clearTimeout(timersRef.current.get(key));
      const timer = setTimeout(() => dismissBanner(key), BANNER_DURATION_MS);
      timersRef.current.set(key, timer);
    },
    [dismissBanner],
  );

  useEffect(() => {
    bindGesture();
    const session = getPhysicianSession();
    myUserIdRef.current = session?.id ? String(session.id) : null;
    const timers = timersRef.current;

    const onMessage = (msg) => {
      if (!msg) return;

      // Don't notify while a call UI is active (clashes with call ringtone).
      if (window.__AVIATION_CALL_ACTIVE) return;

      const mapped = mapApiMessage(msg, myUserIdRef.current);
      if (!mapped || mapped.isMine) return;

      const normalized = normalizeChatPayload(msg);
      const roomId = normalized?.room_id ?? msg?.roomId ?? msg?.room_id;

      // The user is already looking at this exact conversation — no banner.
      if (aviationChatUiState.isActiveChatRoom(roomId)) return;

      playSound();

      const preview = buildPreviewText(mapped);
      const patientName =
        msg?.patient_full_name || msg?.patientInfo?.full_name || null;
      const incidentId = msg?.incident_id || msg?.incidentId || null;
      const senderId = normalized?.sender_id ?? null;

      // Page is open in front (Chrome side open) -> show the socket
      // notification UI (in-app banner) instead of the native one, because
      // Chrome suppresses native notifications while the tab is focused.
      if (!document.hidden) {
        enqueueBanner({
          id: mapped.id,
          roomId,
          incidentId,
          senderId,
          sender: mapped.sender || "Crew",
          preview,
          patientName,
          timestamp: mapped.timestamp,
          type: mapped.type,
        });
        return;
      }

      // Tab is in the background -> fall back to the native browser
      // notification.
      const notifTitle = patientName
        ? `${mapped.sender || "Crew"} · ${patientName}`
        : mapped.sender || "New message";
      requestPermission().then((perm) => {
        if (perm !== "granted") return;
        const notif = new Notification(notifTitle, {
          body: preview.slice(0, 200),
          icon: "/vite.svg",
          tag: `chat-${roomId || mapped.id}`,
          data: { roomId, messageId: mapped.id, incidentId },
        });
        notif.onclick = () => {
          window.focus();
        };
      });
    };

    AviationChatSocket.onNewMessage(onMessage);
    return () => {
      AviationChatSocket.offNewMessage(onMessage);
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, [enqueueBanner]);

  return { banners, dismissBanner };
};
