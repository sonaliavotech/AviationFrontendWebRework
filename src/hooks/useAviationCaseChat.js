import { useState, useRef, useEffect, useCallback } from "react";
import AviationChatSocket from "../services/AviationChatSocket";
import {
  ensureCaseChatRoom,
  getAviationMessages,
  getCaseChatRoom,
  emitDelivered,
  emitSeen,
  deleteAviationMessage,
} from "../services/aviationChatApi";
import {
  uploadAviationChatFile,
  buildMessageFileFieldsFromUpload,
  resolveChatFileDisplayType,
} from "../utils/aviationChatFiles";
import { confirmDeleteMessages } from "../utils/aviationChatUi";
import { formatMessageTime, mapApiMessage } from "../utils/chatMessageMapper";
import { getPhysicianSession } from "../utils/physicianSession";

export function useAviationCaseChat({
  visible,
  chatEnabled,
  incidentId,
  crewUserId,
  prefetchedRoomId = null,
  message,
  setMessage,
  onChatOpened,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewerImage, setViewerImage] = useState(null);

  const listRef = useRef(null);
  const roomRef = useRef(null);
  const myUserIdRef = useRef(null);
  const otherUserIdRef = useRef(null);
  const optimisticIdRef = useRef(null);
  const typingTimerRef = useRef(null);

  const draft = message || "";
  const setDraft = setMessage;

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  const appendMessage = useCallback(
    (incomingMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === incomingMsg.id)) return prev;
        return [...prev, incomingMsg];
      });
      scrollToEnd();
    },
    [scrollToEnd],
  );

  const updateMessageStatus = useCallback((messageId, updater) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (String(m.id) !== String(messageId)) return m;
        const patch = updater(m);
        return patch ? { ...m, ...patch } : m;
      }),
    );
  }, []);

  const applyOwnMessageReceipt = useCallback(
    (messageId, receipt) => {
      updateMessageStatus(messageId, (m) => {
        if (!m.isMine) return null;
        if (receipt === "read") {
          return { status: "read", is_seen: true, is_delivered: true };
        }
        if (receipt === "delivered") {
          return {
            status: m.status === "read" ? "read" : "delivered",
            is_delivered: true,
          };
        }
        return { status: "sent" };
      });
    },
    [updateMessageStatus],
  );

  const handleIncomingMessage = useCallback(
    (data) => {
      if (!data || String(data.room_id) !== String(roomRef.current)) return;
      if (String(data.sender_id) === String(myUserIdRef.current)) return;

      const mapped = mapApiMessage(data, myUserIdRef.current);
      appendMessage(mapped);

      if (!mapped.isMine && data.id && roomRef.current) {
        emitDelivered({
          roomId: roomRef.current,
          messageId: data.id,
          userId: myUserIdRef.current,
        });
        emitSeen({
          roomId: roomRef.current,
          messageId: data.id,
          userId: myUserIdRef.current,
        });
      }
    },
    [appendMessage],
  );

  const handleMessageSent = useCallback(
    (data) => {
      if (!data || String(data.room_id) !== String(roomRef.current)) return;

      const mapped = mapApiMessage(data, myUserIdRef.current);
      mapped.status = "sent";

      setMessages((prev) => {
        let next = optimisticIdRef.current
          ? prev.filter((m) => m.id !== optimisticIdRef.current)
          : prev;
        optimisticIdRef.current = null;

        const exists = next.some((m) => m.id === mapped.id);
        if (exists) {
          return next.map((m) =>
            m.id === mapped.id ? { ...m, ...mapped, status: "sent" } : m,
          );
        }
        return [...next, mapped];
      });
      scrollToEnd();
    },
    [scrollToEnd],
  );

  const handleMessageDelivered = useCallback(
    (data) => {
      if (!data || String(data.roomId) !== String(roomRef.current)) return;
      if (String(data.userId) === String(myUserIdRef.current)) return;
      if (!data.messageId) return;
      applyOwnMessageReceipt(data.messageId, "delivered");
    },
    [applyOwnMessageReceipt],
  );

  const handleMessageSeen = useCallback(
    (data) => {
      if (!data || String(data.roomId) !== String(roomRef.current)) return;
      if (String(data.userId) === String(myUserIdRef.current)) return;

      if (data.messageId) {
        applyOwnMessageReceipt(data.messageId, "read");
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.isMine
            ? { ...m, status: "read", is_seen: true, is_delivered: true }
            : m,
        ),
      );
    },
    [applyOwnMessageReceipt],
  );

  const handleSocketError = useCallback((payload) => {
    setChatError(payload?.message || "Chat error");
  }, []);

  const handleMessageDeleted = useCallback((data) => {
    if (!data?.messageId) return;
    if (data.roomId && String(data.roomId) !== String(roomRef.current)) return;
    setMessages((prev) => prev.filter((m) => String(m.id) !== String(data.messageId)));
  }, []);

  const handleMessageHidden = useCallback((data) => {
    if (!data?.messageId) return;
    if (data.roomId && String(data.roomId) !== String(roomRef.current)) return;
    if (data.userId && String(data.userId) !== String(myUserIdRef.current)) return;
    setMessages((prev) => prev.filter((m) => String(m.id) !== String(data.messageId)));
  }, []);

  const handleUserTyping = useCallback((data) => {
    if (!data || String(data.roomId) !== String(roomRef.current)) return;
    if (String(data.userId) === String(myUserIdRef.current)) return;
    if (
      otherUserIdRef.current &&
      String(data.userId) !== String(otherUserIdRef.current)
    )
      return;
    setOtherUserTyping(true);
  }, []);

  const handleUserStopTyping = useCallback((data) => {
    if (!data || String(data.roomId) !== String(roomRef.current)) return;
    if (String(data.userId) === String(myUserIdRef.current)) return;
    if (
      otherUserIdRef.current &&
      String(data.userId) !== String(otherUserIdRef.current)
    )
      return;
    setOtherUserTyping(false);
  }, []);

  const handleUserStatus = useCallback((data) => {
    if (!data?.userId) return;
    if (
      otherUserIdRef.current &&
      String(data.userId) !== String(otherUserIdRef.current)
    )
      return;
    setOtherUserOnline(!!data.isOnline);
    if (!data.isOnline) setOtherUserTyping(false);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const toggleSelectMessage = useCallback((messageId) => {
    setSelectedIds((prev) => {
      const id = String(messageId);
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }, []);

  const performDelete = useCallback(
    async (ids, scope = "everyone") => {
      const roomId = roomRef.current;
      const userId = myUserIdRef.current;
      if (!roomId || !userId) return;

      const validIds = ids
        .map((id) => String(id))
        .filter((id) => id && !id.startsWith("temp-"));

      if (!validIds.length) return;

      try {
        await Promise.all(
          validIds.map(async (id) => {
            const socketSent = AviationChatSocket.deleteMessage({
              roomId,
              messageId: id,
              scope,
            });
            if (!socketSent) {
              await deleteAviationMessage(id, { userId, scope });
            }
          }),
        );

        setMessages((prev) => prev.filter((m) => !validIds.includes(String(m.id))));
        exitSelectionMode();
      } catch (err) {
        setChatError(err?.message || "Failed to delete message(s).");
      }
    },
    [exitSelectionMode],
  );

  const canDeleteSelectedForEveryone = useCallback(
    (ids) =>
      ids.every((id) => {
        const msg = messages.find((m) => String(m.id) === String(id));
        return !!msg?.isMine;
      }),
    [messages],
  );

  const handleDeleteOne = useCallback(
    (messageId) => {
      const id = String(messageId);
      const isOwn = messages.some((m) => String(m.id) === id && m.isMine);
      confirmDeleteMessages(1, {
        canDeleteForEveryone: isOwn,
        onDeleteForMe: () => performDelete([id], "me"),
        onDeleteForEveryone: () => performDelete([id], "everyone"),
      });
    },
    [messages, performDelete],
  );

  const handleDeleteSelected = useCallback(() => {
    if (!selectedIds.length) return;
    confirmDeleteMessages(selectedIds.length, {
      canDeleteForEveryone: canDeleteSelectedForEveryone(selectedIds),
      onDeleteForMe: () => performDelete(selectedIds, "me"),
      onDeleteForEveryone: () => performDelete(selectedIds, "everyone"),
    });
  }, [canDeleteSelectedForEveryone, performDelete, selectedIds]);

  const handleDraftChange = useCallback(
    (text) => {
      if (setDraft) setDraft(text);
      if (!roomRef.current) return;
      AviationChatSocket.emitTyping(roomRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        AviationChatSocket.emitStopTyping(roomRef.current);
      }, 1500);
    },
    [setDraft],
  );

  useEffect(() => {
    if (!visible || !chatEnabled || !crewUserId || !incidentId) {
      return undefined;
    }

    let cancelled = false;

    const setupChat = async () => {
      setLoading(true);
      setChatError(null);
      setMessages([]);
      setPendingFile(null);
      setSelectionMode(false);
      setSelectedIds([]);
      setOtherUserTyping(false);
      optimisticIdRef.current = null;
      otherUserIdRef.current = crewUserId ? String(crewUserId) : null;

      try {
        const session = getPhysicianSession();
        const userId = session?.id;

        if (!userId) {
          throw new Error("Please log in to use chat.");
        }

        myUserIdRef.current = String(userId);
        AviationChatSocket.connect(userId);
        await AviationChatSocket.whenReady();

        let room = null;
        if (prefetchedRoomId) {
          room = await getCaseChatRoom(incidentId, userId).catch(() => null);
        }
        if (!room?.id) {
          room = await ensureCaseChatRoom(incidentId, {
            crewUserId,
            memberUserId: userId,
          });
        }

        const roomId = prefetchedRoomId || room?.id;
        if (!roomId) {
          throw new Error("Chat room not available for this case yet.");
        }

        if (cancelled) return;

        roomRef.current = String(roomId);

        const crewMember = Array.isArray(room?.members)
          ? room.members.find((m) => String(m.id) === String(crewUserId))
          : null;
        setOtherUserOnline(!!crewMember?.is_online);
        setSocketConnected(true);

        AviationChatSocket.joinRoom(roomId);

        const [history] = await Promise.all([
          getAviationMessages(roomId, 1, 50, userId),
          AviationChatSocket.joinRoomAsync(roomId),
        ]);

        if (cancelled) return;

        setMessages(history.map((msg) => mapApiMessage(msg, userId)));
        emitSeen({ roomId, userId });
        onChatOpened?.();
      } catch (err) {
        if (!cancelled) {
          const raw = err?.message || "Failed to load chat.";
          const friendly = raw.includes("foreign key")
            ? "Chat could not start. Please log in again on crew and physician apps, then create a new case."
            : raw;
          setChatError(friendly);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSocketConnected(AviationChatSocket.isConnected());
        }
      }
    };

    AviationChatSocket.onNewMessage(handleIncomingMessage);
    AviationChatSocket.onMessageSent(handleMessageSent);
    AviationChatSocket.onMessageDelivered(handleMessageDelivered);
    AviationChatSocket.onMessageSeen(handleMessageSeen);
    AviationChatSocket.onMessageDeleted(handleMessageDeleted);
    AviationChatSocket.onMessageHidden(handleMessageHidden);
    AviationChatSocket.onUserTyping(handleUserTyping);
    AviationChatSocket.onUserStopTyping(handleUserStopTyping);
    AviationChatSocket.onUserStatus(handleUserStatus);
    AviationChatSocket.onError(handleSocketError);
    setupChat();

    const syncConnected = () => {
      setSocketConnected(AviationChatSocket.isConnected());
    };
    AviationChatSocket.whenReady().then(syncConnected).catch(() => {});

    return () => {
      cancelled = true;
      if (roomRef.current) {
        AviationChatSocket.leaveRoom(roomRef.current);
        roomRef.current = null;
      }
      AviationChatSocket.offNewMessage(handleIncomingMessage);
      AviationChatSocket.offMessageSent(handleMessageSent);
      AviationChatSocket.offMessageDelivered(handleMessageDelivered);
      AviationChatSocket.offMessageSeen(handleMessageSeen);
      AviationChatSocket.offMessageDeleted(handleMessageDeleted);
      AviationChatSocket.offMessageHidden(handleMessageHidden);
      AviationChatSocket.offUserTyping(handleUserTyping);
      AviationChatSocket.offUserStopTyping(handleUserStopTyping);
      AviationChatSocket.offUserStatus(handleUserStatus);
      AviationChatSocket.offError(handleSocketError);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [
    visible,
    chatEnabled,
    crewUserId,
    incidentId,
    prefetchedRoomId,
    onChatOpened,
    handleIncomingMessage,
    handleMessageSent,
    handleMessageDelivered,
    handleMessageSeen,
    handleMessageDeleted,
    handleMessageHidden,
    handleUserTyping,
    handleUserStopTyping,
    handleUserStatus,
    handleSocketError,
  ]);

  const handleSend = useCallback(async () => {
    const trimmed = String(draft || "").trim();
    const attachment = pendingFile;
    if ((!trimmed && !attachment) || !roomRef.current || sending || uploading) return;

    setSending(true);
    setChatError(null);
    AviationChatSocket.emitStopTyping(roomRef.current);

    try {
      if (attachment) {
        const optimisticId = `temp-${Date.now()}`;
        optimisticIdRef.current = optimisticId;
        const previewType = resolveChatFileDisplayType(
          attachment.fileType,
          attachment.type,
          attachment.name,
        );

        appendMessage({
          id: optimisticId,
          type: previewType,
          text: trimmed || attachment.name,
          sender: "You",
          timestamp: formatMessageTime(new Date().toISOString()),
          isMine: true,
          showAvatar: true,
          fileUrl: attachment.localPreview || attachment.uri,
          fileName: attachment.name,
          status: "sent",
        });

        setUploading(true);
        const uploaded = await uploadAviationChatFile(attachment);
        setUploading(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId
              ? { ...m, ...buildMessageFileFieldsFromUpload(uploaded, previewType) }
              : m,
          ),
        );

        const sent = AviationChatSocket.sendMessage({
          roomId: roomRef.current,
          message: trimmed || uploaded.originalName,
          messageType: uploaded.fileType || previewType,
          fileUrl: uploaded.url,
          fileName: uploaded.originalName,
          fileSize: uploaded.size,
          fileMimeType: uploaded.mimeType,
        });

        if (sent) {
          if (setDraft) setDraft("");
          setPendingFile(null);
        } else {
          optimisticIdRef.current = null;
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          setChatError("Not connected. File not sent.");
        }
      } else {
        const optimisticId = `temp-${Date.now()}`;
        optimisticIdRef.current = optimisticId;

        appendMessage({
          id: optimisticId,
          type: "text",
          text: trimmed,
          sender: "You",
          timestamp: formatMessageTime(new Date().toISOString()),
          isMine: true,
          showAvatar: true,
          status: "sent",
        });

        const sent = AviationChatSocket.sendMessage({
          roomId: roomRef.current,
          message: trimmed,
          messageType: "text",
        });

        if (sent) {
          if (setDraft) setDraft("");
        } else {
          optimisticIdRef.current = null;
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          setChatError("Not connected. Message not sent.");
        }
      }
    } catch (err) {
      if (optimisticIdRef.current) {
        const tempId = optimisticIdRef.current;
        optimisticIdRef.current = null;
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
      setChatError(err?.message || "Failed to send message.");
    } finally {
      setUploading(false);
      setSending(false);
    }
  }, [appendMessage, draft, pendingFile, sending, setDraft, uploading]);

  const clearPendingFile = useCallback(() => {
    if (pendingFile?.localPreview) {
      URL.revokeObjectURL(pendingFile.localPreview);
    }
    setPendingFile(null);
  }, [pendingFile]);

  return {
    messages,
    loading,
    sending,
    uploading,
    pendingFile,
    setPendingFile,
    clearPendingFile,
    chatError,
    otherUserOnline,
    otherUserTyping,
    socketConnected,
    selectionMode,
    setSelectionMode,
    selectedIds,
    viewerImage,
    setViewerImage,
    listRef,
    draft,
    handleDraftChange,
    handleSend,
    handleDeleteOne,
    handleDeleteSelected,
    exitSelectionMode,
    toggleSelectMessage,
    chatReady: chatEnabled && !!crewUserId && !!incidentId,
  };
}
