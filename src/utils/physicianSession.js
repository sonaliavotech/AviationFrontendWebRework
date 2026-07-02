const PHYSICIAN_SESSION_KEY = "physician_session";

export function mapPhysicianToWebUser(session) {
  if (!session) return null;
  const name =
    session.full_name ||
    `${session.first_name || ""} ${session.last_name || ""}`.trim();
  return {
    id: session.id,
    name,
    email: session.email,
    specialty: session.specialty,
    first_name: session.first_name,
    last_name: session.last_name,
    full_name: session.full_name,
    userRole: "Provider",
    roles: ["PROVIDER", "PCP_PHYSICIAN"],
  };
}

export function savePhysicianSession(session) {
  if (!session) return;
  localStorage.setItem(PHYSICIAN_SESSION_KEY, JSON.stringify(session));
  const webUser = mapPhysicianToWebUser(session);
  if (webUser) {
    localStorage.setItem("user", JSON.stringify(webUser));
    localStorage.setItem("role", webUser.userRole);
  }
}

export function getPhysicianSession() {
  try {
    const raw = localStorage.getItem(PHYSICIAN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPhysicianSession() {
  localStorage.removeItem(PHYSICIAN_SESSION_KEY);
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("token");
}
