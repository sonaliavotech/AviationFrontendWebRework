const WEB_DEVICE_ID_KEY = "web_device_id";

export function getWebDeviceRegistrationPayload() {
  let deviceId = localStorage.getItem(WEB_DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `web_${crypto.randomUUID()}`
        : `web_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(WEB_DEVICE_ID_KEY, deviceId);
  }

  return {
    deviceId,
    deviceToken: null,
    apnToken: null,
    platform: "web",
  };
}
