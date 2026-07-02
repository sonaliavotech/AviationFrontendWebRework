/**
 * Central config — same URLs as Aviation-tab-frontend (api-base-path.js).
 * Chat/calling uses tiacalling host (Chating-Backend), not jitsiapi or incidents API.
 */

const trimUrl = (url) => String(url || "").replace(/\/+$/, "");

const CALLING_SERVICE_URL = trimUrl(
  import.meta.env.VITE_CALLING_SERVICE_URL ||
    "https://tiacalling.tiamdplus.databin.in",
);

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.tiatele.databin.in/api";

export const AI_SUMMARY_URL =
  import.meta.env.VITE_AI_SUMMARY_URL || "https://aisum.databin.in/case-summary";

export { CALLING_SERVICE_URL };
export const CHAT_API_URL = `${CALLING_SERVICE_URL}/api/aviation-chat`;
export const AVIATION_UPLOAD_API_URL = `${CALLING_SERVICE_URL}/api/aviation-upload`;
