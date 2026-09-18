// Singleton shared state: tracks which chat room (if any) the web UI is
// currently showing, plus whether that panel is visible. The chat-notification
// hook uses this to avoid showing a banner when the user is already looking at
// the conversation the message belongs to.
let active = { roomId: null, visible: false };

export const aviationChatUiState = {
  setActiveChat(roomId, visible) {
    active = {
      roomId: roomId ? String(roomId) : null,
      visible: !!visible,
    };
  },
  getActiveChat() {
    return { ...active };
  },
  isActiveChatRoom(roomId) {
    return (
      !!active.visible &&
      roomId != null &&
      !!active.roomId &&
      String(roomId) === String(active.roomId)
    );
  },
  isAnyChatVisible() {
    return !!active.visible;
  },
  reset() {
    active = { roomId: null, visible: false };
  },
};

export default aviationChatUiState;
