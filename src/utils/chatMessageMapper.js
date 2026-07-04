import {
  resolveAviationChatFileUrl,
  resolveChatFileDisplayType,
} from "./aviationChatFiles";

export function formatMessageTime(dateStr) {
  if (!dateStr) {
    return new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function deriveMessageStatus(msg, isMine) {
  if (!isMine) return null;
  if (msg.is_seen) return "read";
  if (msg.is_delivered) return "delivered";
  return "sent";
}

/** Normalize REST + socket payloads (snake_case and camelCase). */
export function normalizeChatPayload(msg) {
  if (!msg) return null;
  return {
    id: msg.id,
    room_id: msg.room_id ?? msg.roomId,
    sender_id: msg.sender_id ?? msg.senderId,
    sender_name: msg.sender_name ?? msg.senderName,
    message: msg.message,
    message_type: msg.message_type ?? msg.messageType,
    file_url: msg.file_url ?? msg.fileUrl,
    file_name: msg.file_name ?? msg.fileName,
    file_size: msg.file_size ?? msg.fileSize,
    file_mime_type: msg.file_mime_type ?? msg.fileMimeType,
    voice_duration_ms: msg.voice_duration_ms ?? msg.voiceDurationMs,
    created_at: msg.created_at ?? msg.createdAt,
    is_delivered: msg.is_delivered ?? msg.isDelivered,
    is_seen: msg.is_seen ?? msg.isSeen,
  };
}

export function mapApiMessage(msg, myUserId) {
  const normalized = normalizeChatPayload(msg);
  if (!normalized?.id) return null;

  const isMine = String(normalized.sender_id) === String(myUserId);
  const rawType = String(normalized.message_type || "").toLowerCase();
  const hasVoiceDuration =
    normalized.voice_duration_ms != null && Number(normalized.voice_duration_ms) > 0;
  const isVoiceAudio = rawType === "voice" || (rawType === "audio" && hasVoiceDuration);
  const hasFile = !!normalized.file_url || isVoiceAudio;
  const messageType = hasFile
    ? isVoiceAudio
      ? "audio"
      : resolveChatFileDisplayType(
          normalized.message_type,
          normalized.file_mime_type,
          normalized.file_name,
        )
    : "text";
  const fileUrl = hasFile
    ? resolveAviationChatFileUrl(normalized.file_url, normalized.id)
    : null;

  return {
    id: String(normalized.id),
    type: messageType,
    text: normalized.message,
    sender: normalized.sender_name || (isMine ? "You" : "Crew"),
    timestamp: formatMessageTime(normalized.created_at),
    isMine,
    showAvatar: true,
    fileUrl,
    fileName: normalized.file_name,
    fileSize: normalized.file_size,
    fileMimeType: normalized.file_mime_type,
    voiceDurationMs: normalized.voice_duration_ms || null,
    status: deriveMessageStatus(normalized, isMine),
    is_delivered: !!normalized.is_delivered,
    is_seen: !!normalized.is_seen,
  };
}
