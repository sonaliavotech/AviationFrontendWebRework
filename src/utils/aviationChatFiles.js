import {
  AVIATION_UPLOAD_API_URL,
  CALLING_SERVICE_URL,
} from "../config/appConfig";

const AVIATION_CHAT_UPLOAD_URL = `${AVIATION_UPLOAD_API_URL}/chat`;

export function estimateFileType(mimeType, fileName) {
  const mime = String(mimeType || "").toLowerCase();
  const name = String(fileName || "").toLowerCase();

  if (mime === "application/pdf" || /\.pdf$/i.test(name)) return "document";
  if (/\.(doc|docx|txt|csv|xls|xlsx|ppt|pptx)$/i.test(name)) return "document";
  if (
    mime.includes("pdf") ||
    mime.includes("word") ||
    mime === "text/plain" ||
    mime === "text/csv"
  ) {
    return "document";
  }
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (/\.(png|jpe?g|gif|webp|bmp|heic)$/i.test(name)) return "image";
  if (/\.(mp4|mov|webm|avi)$/i.test(name)) return "video";
  if (/\.(m4a|aac|mp3|wav|ogg)$/i.test(name)) return "audio";
  return "document";
}

export function isChatDocumentMessage(type, mimeType, fileName) {
  if (type === "document") return true;
  return (
    estimateFileType(mimeType, fileName) === "document" &&
    !String(type || "").match(/^(audio|video)$/)
  );
}

export function isChatImageMessage(type, mimeType, fileName) {
  if (isChatDocumentMessage(type, mimeType, fileName)) return false;
  if (type === "image") return true;
  return estimateFileType(mimeType, fileName) === "image";
}

export function isChatVoiceMessage(type, mimeType, fileName, voiceDurationMs) {
  if (voiceDurationMs != null && Number(voiceDurationMs) > 0) return true;
  if (type === "voice" || type === "audio") return true;
  const mime = String(mimeType || "").toLowerCase();
  const name = String(fileName || "").toLowerCase();
  return (
    mime.startsWith("audio/") &&
    (/voice/.test(name) || /\.(m4a|mp4|mp3|wav|aac|ogg|webm)$/i.test(name))
  );
}

export { formatVoiceDuration, buildVoiceMessageLabel } from "./aviationVoiceMessage";

export function resolveChatFileDisplayType(messageType, mimeType, fileName) {
  if (isChatDocumentMessage(messageType, mimeType, fileName)) {
    return "document";
  }
  if (messageType && messageType !== "text") {
    return messageType;
  }
  return estimateFileType(mimeType, fileName);
}

export function getDocumentKindLabel(mimeType, fileName) {
  const mime = String(mimeType || "").toLowerCase();
  const name = String(fileName || "").toLowerCase();
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "PDF";
  if (mime.includes("word") || /\.docx?$/i.test(name)) return "DOC";
  if (mime.includes("sheet") || mime.includes("excel") || /\.xlsx?$/i.test(name))
    return "XLS";
  if (mime.includes("presentation") || /\.pptx?$/i.test(name)) return "PPT";
  if (mime === "text/plain" || name.endsWith(".txt")) return "TXT";
  if (mime === "text/csv" || name.endsWith(".csv")) return "CSV";
  return "FILE";
}

export function resolveAviationChatFileUrl(fileUrl, messageId) {
  if (messageId && !String(messageId).startsWith("temp-")) {
    return `${CALLING_SERVICE_URL}/api/aviation-upload/chat/file/${messageId}`;
  }

  if (!fileUrl || fileUrl.startsWith("/dummy/")) {
    return null;
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  if (fileUrl.startsWith("blob:")) {
    return fileUrl;
  }

  return `${CALLING_SERVICE_URL}/api/aviation-upload/file?url=${encodeURIComponent(fileUrl)}`;
}

export function buildMessageFileFieldsFromUpload(uploaded, messageType) {
  const resolvedType = resolveChatFileDisplayType(
    uploaded.fileType || messageType,
    uploaded.mimeType,
    uploaded.originalName,
  );
  const fileUrl = resolveAviationChatFileUrl(uploaded.url);

  return {
    fileUrl,
    fileName: uploaded.originalName,
    fileSize: uploaded.size,
    fileMimeType: uploaded.mimeType,
    type: resolvedType,
    image: resolvedType === "image" ? fileUrl : null,
  };
}

export async function uploadAviationChatFile(file) {
  const formData = new FormData();
  formData.append("file", file.file || file, file.name || `chat-${Date.now()}`);

  const response = await fetch(AVIATION_CHAT_UPLOAD_URL, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || `Aviation file upload failed (${response.status})`);
  }

  if (!data?.data?.url || String(data.data.url).startsWith("/dummy/")) {
    throw new Error("Upload failed: no valid file path returned");
  }

  return {
    url: data.data.url,
    originalName: data.data.originalName || file.name,
    size: data.data.size,
    mimeType: data.data.mimeType || file.type,
    fileType: data.data.fileType || estimateFileType(file.type, file.name),
  };
}

export function fileFromBrowserInput(fileList) {
  const file = fileList?.[0];
  if (!file) return null;

  const fileType = estimateFileType(file.type, file.name);
  const localPreview = fileType === "image" ? URL.createObjectURL(file) : null;

  return {
    file,
    name: file.name,
    type: file.type || "application/octet-stream",
    fileType,
    localPreview,
    uri: localPreview,
  };
}

export function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!size || Number.isNaN(size)) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
