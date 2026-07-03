/**
 * Central config — same URLs as Aviation-tab-frontend (api-base-path.js).
 * Chat/calling uses tiacalling host (Chating-Backend), not jitsiapi or incidents API.
 */

const trimUrl = (url) => String(url || "").replace(/\/+$/, "");

// ============================================
// ENVIRONMENT DETECTION
// ============================================
const isLocal = import.meta.env.VITE_USE_LOCAL === "true" ||
  import.meta.env.VITE_ENV === "local" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// ============================================
// LOCAL CHAT/CALLING BACKEND URL (Port 5100)
// ============================================
const LOCAL_CHAT_URL = trimUrl(
  import.meta.env.VITE_LOCAL_CHAT_URL || "http://localhost:5100"
);

// ============================================
// LOCAL API BACKEND URL (Port 5200)
// ============================================
const LOCAL_API_URL = trimUrl(
  import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5200"
);

// ============================================
// PRODUCTION / STAGING BACKEND URL
// ============================================
const PRODUCTION_CALLING_URL = trimUrl(
  import.meta.env.VITE_CALLING_SERVICE_URL ||
  "https://tiacalling.tiamdplus.databin.in"
);

const PRODUCTION_API_URL = trimUrl(
  import.meta.env.VITE_API_BASE_URL || "https://api.tiatele.databin.in/api"
);

// ============================================
// SELECT BASED ON ENVIRONMENT
// ============================================
const CALLING_SERVICE_URL = isLocal
  ? LOCAL_CHAT_URL
  : PRODUCTION_CALLING_URL;

const API_BASE_URL = isLocal
  ? `${LOCAL_API_URL}/api`
  : PRODUCTION_API_URL;

export const AI_SUMMARY_URL =
  import.meta.env.VITE_AI_SUMMARY_URL || "https://aisum.databin.in/case-summary";

export { CALLING_SERVICE_URL, API_BASE_URL };
export const CHAT_API_URL = `${CALLING_SERVICE_URL}/api/aviation-chat`;
export const AVIATION_UPLOAD_API_URL = `${CALLING_SERVICE_URL}/api/aviation-upload`;

// ============================================
// DEBUG LOG (only in development)
// ============================================
if (import.meta.env.DEV) {
  console.log("🔧 App Config:", {
    isLocal,
    CALLING_SERVICE_URL,
    API_BASE_URL,
    CHAT_API_URL,
    AVIATION_UPLOAD_API_URL,
  });
}


/**
 * Central config — same URLs as Aviation-tab-frontend (api-base-path.js).
 * Chat/calling uses tiacalling host (Chating-Backend), not jitsiapi or incidents API.
 */

// const trimUrl = (url) => String(url || "").replace(/\/+$/, "");

// const CALLING_SERVICE_URL = trimUrl(
//   import.meta.env.VITE_CALLING_SERVICE_URL ||
//   "https://tiacalling.tiamdplus.databin.in",
// );

// export const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "https://api.tiatele.databin.in/api";

// export const AI_SUMMARY_URL =
//   import.meta.env.VITE_AI_SUMMARY_URL || "https://aisum.databin.in/case-summary";

// export { CALLING_SERVICE_URL };
// export const CHAT_API_URL = `${CALLING_SERVICE_URL}/api/aviation-chat`;
// export const AVIATION_UPLOAD_API_URL = `${CALLING_SERVICE_URL}/api/aviation-upload`;

