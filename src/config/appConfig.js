/**
 * ═══════════════════════════════════════════════════════════════════
 *  CENTRAL API CONFIG — web (AviationFrontendWebRework)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  LOCAL use karne ke liye:
 *    → LOCAL block uncomment karo
 *    → PRODUCTION block comment karo
 *
 *  PRODUCTION use karne ke liye:
 *    → LOCAL block comment karo
 *    → PRODUCTION block uncomment karo
 *
 *  Same structure as native api-base-path.js
 *
 * ═══════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════
// LOCAL
// ═══════════════════════════════════════════════════════════════════

// const API_ROOT = "http://localhost:5200/api";
// const CALLING_HOST = "http://localhost:5100";

// ═══════════════════════════════════════════════════════════════════
// PRODUCTION
// ═══════════════════════════════════════════════════════════════════

const API_ROOT = "https://api.tiatele.databin.in/api";
const CALLING_HOST = "https://tiacalling.tiamdplus.databin.in";

// ═══════════════════════════════════════════════════════════════════
// MAIN API
// ═══════════════════════════════════════════════════════════════════

/**
 * Host without /api
 *
 * Example:
 * https://api.tiatele.databin.in/api
 * becomes:
 * https://api.tiatele.databin.in
 */
export const API_HOST = API_ROOT.replace(/\/api\/?$/, "");

/**
 * Main REST API base
 *
 * Incidents, physicians, case logs, vitals, notes, etc.
 */
export const API_BASE_URL = API_ROOT;

export const BASE_PATH = API_ROOT;

// ═══════════════════════════════════════════════════════════════════
// CALLING / SOCKET / CHAT
// ═══════════════════════════════════════════════════════════════════

/**
 * Calling / socket / chat microservice host
 */
export const CALLING_API_BASE_PATH = CALLING_HOST;

export const SOCKET_URL = CALLING_HOST;

export const CALLING_SERVICE_URL = CALLING_HOST;

// ═══════════════════════════════════════════════════════════════════
// AUTH / DEVICE API
// ═══════════════════════════════════════════════════════════════════

export const AUTH_BASE_PATH = `${API_ROOT}/auth`;

export const DEVICE_API_PATH = `${API_ROOT}/deviceapi`;

// ═══════════════════════════════════════════════════════════════════
// AVIATION CHAT REST API
// ═══════════════════════════════════════════════════════════════════

export const CHAT_API_URL = `${CALLING_HOST}/api/aviation-chat`;

// ═══════════════════════════════════════════════════════════════════
// AVIATION FILE UPLOAD API
// ═══════════════════════════════════════════════════════════════════

export const AVIATION_UPLOAD_API_URL = `${CALLING_HOST}/api/aviation-upload`;

// ═══════════════════════════════════════════════════════════════════
// ECG / PDF
// ═══════════════════════════════════════════════════════════════════

export const ECG_API_BASE = API_HOST;

// ═══════════════════════════════════════════════════════════════════
// EXTERNAL SERVICES
// ═══════════════════════════════════════════════════════════════════

export const JITSI_SERVER_URL = "https://jitsi.tiatech.ai/";

export const FILES_BASE_URL = "https://files.tiamdplus.databin.in";

export const AI_SUMMARY_URL = "https://aisum.databin.in/case-summary";

// ═══════════════════════════════════════════════════════════════════
// DEV LOGIN DEFAULTS
// ═══════════════════════════════════════════════════════════════════

export const DEFAULT_PHYSICIAN_EMAIL = "";

export const DEFAULT_PHYSICIAN_PASSWORD = "";

// ═══════════════════════════════════════════════════════════════════
// DEBUG LOG
// ═══════════════════════════════════════════════════════════════════

console.log("🔧 Aviation Web API Configuration");

// console.log("API_BASE_URL:", API_BASE_URL);
// console.log("API_HOST:", API_HOST);

// console.log("CALLING_SERVICE_URL:", CALLING_SERVICE_URL);
// console.log("SOCKET_URL:", SOCKET_URL);

// console.log("CHAT_API_URL:", CHAT_API_URL);
// console.log("AVIATION_UPLOAD_API_URL:", AVIATION_UPLOAD_API_URL);

// console.log("FILES_BASE_URL:", FILES_BASE_URL);
// console.log("JITSI_SERVER_URL:", JITSI_SERVER_URL);
// console.log("AI_SUMMARY_URL:", AI_SUMMARY_URL);
