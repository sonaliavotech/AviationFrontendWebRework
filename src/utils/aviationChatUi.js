export function getChatStatusText({
  loading,
  socketConnected,
  otherUserTyping,
  otherUserOnline,
}) {
  if (loading && !socketConnected) return "Connecting…";
  if (!socketConnected) return "Disconnected";
  if (otherUserTyping) return "Typing…";
  if (otherUserOnline) return "Online";
  return "Offline";
}

export function confirmDeleteMessages(
  count,
  { onDeleteForMe, onDeleteForEveryone, canDeleteForEveryone },
) {
  const message =
    count === 1
      ? "Delete this message for everyone or only on your device?"
      : `Delete ${count} selected messages for everyone or only on your device?`;

  if (canDeleteForEveryone) {
    const choice = window.confirm(
      `${message}\n\nOK = Delete for everyone\nCancel = choose another option`,
    );
    if (choice) {
      onDeleteForEveryone();
      return;
    }
    if (window.confirm("Delete for me only?")) {
      onDeleteForMe();
    }
    return;
  }

  if (window.confirm(`${message}\n\nDelete for me?`)) {
    onDeleteForMe();
  }
}
