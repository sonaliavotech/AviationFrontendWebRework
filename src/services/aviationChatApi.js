import { CHAT_API_URL } from "../config/appConfig";
import AviationChatSocket from "./AviationChatSocket";

async function parseJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return data;
}

export async function getCaseChatRoom(incidentId, userId = null) {
  const userQuery = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const response = await fetch(
    `${CHAT_API_URL}/case-room/${encodeURIComponent(incidentId)}${userQuery}`,
  );
  const data = await response.json().catch(() => ({}));

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data?.data || null;
}

export async function createCaseChatRoom({ incidentId, caseId = null, crewUserId }) {
  const response = await fetch(`${CHAT_API_URL}/case-room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incidentId, caseId, crewUserId }),
  });
  return parseJson(response);
}

export async function addCaseChatRoomMember(
  incidentId,
  userId,
  { crewUserId = null, caseId = null } = {},
) {
  const response = await fetch(
    `${CHAT_API_URL}/case-room/${encodeURIComponent(incidentId)}/add-member`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        crewUserId: crewUserId || undefined,
        caseId: caseId || undefined,
      }),
    },
  );
  return parseJson(response);
}

export async function ensureCaseChatRoom(
  incidentId,
  { crewUserId, caseId = null, memberUserId = null } = {},
) {
  let room = await getCaseChatRoom(incidentId, memberUserId);
  if (room?.id) {
    return room;
  }

  if (!crewUserId) {
    return null;
  }

  await createCaseChatRoom({ incidentId, caseId, crewUserId });

  if (memberUserId) {
    try {
      await addCaseChatRoomMember(incidentId, memberUserId, { crewUserId, caseId });
    } catch {
      // Member may already exist after assign-physician flow.
    }
  }

  return getCaseChatRoom(incidentId, memberUserId);
}

export async function getAviationMessages(roomId, page = 1, limit = 50, userId = null) {
  const userQuery = userId ? `&userId=${encodeURIComponent(userId)}` : "";
  const response = await fetch(
    `${CHAT_API_URL}/messages/${roomId}?page=${page}&limit=${limit}${userQuery}`,
  );
  const data = await parseJson(response);
  return data?.data || [];
}

export async function deleteAviationMessage(messageId, { userId, scope = "everyone" } = {}) {
  const response = await fetch(
    `${CHAT_API_URL}/message/${encodeURIComponent(messageId)}/delete`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, scope }),
    },
  );
  return parseJson(response);
}

export function emitDelivered({ roomId, messageId, userId }) {
  AviationChatSocket.emitMessageDelivered({ roomId, messageId, userId });
}

export function emitSeen({ roomId, messageId, userId }) {
  AviationChatSocket.emitMessageSeen({ roomId, messageId, userId });
}
