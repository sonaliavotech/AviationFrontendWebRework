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

export function mapApiMessage(msg, myUserId) {
  const isMine = String(msg.sender_id) === String(myUserId);
  const hasFile = !!msg.file_url;
  const messageType = hasFile
    ? resolveChatFileDisplayType(msg.message_type, msg.file_mime_type, msg.file_name)
    : "text";
  const fileUrl = hasFile
    ? resolveAviationChatFileUrl(msg.file_url, msg.id)
    : null;

  return {
    id: String(msg.id),
    type: messageType,
    text: msg.message,
    sender: msg.sender_name || (isMine ? "You" : "Crew"),
    timestamp: formatMessageTime(msg.created_at),
    isMine,
    showAvatar: true,
    fileUrl,
    fileName: msg.file_name,
    fileSize: msg.file_size,
    fileMimeType: msg.file_mime_type,
    voiceDurationMs: msg.voice_duration_ms || null,
    status: deriveMessageStatus(msg, isMine),
    is_delivered: !!msg.is_delivered,
    is_seen: !!msg.is_seen,
  };
}
