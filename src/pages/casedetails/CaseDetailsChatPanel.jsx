import { useRef, useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  Menu,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useAviationCaseChat } from "../../hooks/useAviationCaseChat";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";
import { getChatStatusText } from "../../utils/aviationChatUi";
import {
  fileFromBrowserInput,
  formatFileSize,
  formatVoiceDuration,
  getDocumentKindLabel,
  isChatDocumentMessage,
  isChatImageMessage,
  isChatVoiceMessage,
} from "../../utils/aviationChatFiles";
import { openRemoteDocument } from "../../utils/aviationChatMedia";

function VoiceMessagePlayer({ item, textColor, metaTextColor, accentColor }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setError(false);
  }, [item.fileUrl]);

  if (!item.fileUrl) {
    return (
      <Typography sx={{ fontSize: 12, color: textColor, fontStyle: "italic" }}>
        Voice message unavailable
      </Typography>
    );
  }

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || error) return;

    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
        return;
      }
      await audio.play();
      setPlaying(true);
    } catch {
      setError(true);
      setPlaying(false);
    }
  };

  const durationLabel = formatVoiceDuration(
    playing && audioRef.current?.currentTime
      ? Math.floor(audioRef.current.currentTime * 1000)
      : item.voiceDurationMs,
  );

  return (
    <Box sx={{ minWidth: { xs: 180, sm: 220 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          sx={{
            border: `1.5px solid ${accentColor}`,
            color: accentColor,
            width: 34,
            height: 34,
          }}
        >
          {playing ? <PauseIcon sx={{ fontSize: 18 }} /> : <PlayArrowIcon sx={{ fontSize: 18 }} />}
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.2)",
              overflow: "hidden",
              mb: 0.75,
            }}
          >
            <Box
              sx={{
                height: 4,
                width: playing ? "62%" : "35%",
                background: accentColor,
                borderRadius: 2,
                transition: "width 0.3s ease",
              }}
            />
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: textColor }}>
            {error ? "Cannot play audio" : durationLabel}
          </Typography>
        </Box>
        <MicIcon sx={{ fontSize: 16, color: textColor, opacity: 0.85 }} />
      </Box>
      <Box
        component="audio"
        ref={audioRef}
        preload="metadata"
        src={item.fileUrl}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onError={() => setError(true)}
        sx={{ display: "none" }}
      />
    </Box>
  );
}

function MessageStatusTicks({ status, darkMode }) {
  if (!status) return null;
  const grey = darkMode ? "#B0BEC5" : "#9E9E9E";
  const blue = darkMode ? "#90CAF9" : "#1565C0";
  const color = status === "read" ? blue : grey;
  return (
    <Typography component="span" sx={{ fontSize: 10, color, fontWeight: 700, ml: 0.5 }}>
      {status === "sent" ? "✓" : "✓✓"}
    </Typography>
  );
}

function ChatMessageBubble({
  item,
  darkMode,
  colors,
  selectionMode,
  isSelected,
  onPress,
  onContextMenu,
}) {
  const isVoice = isChatVoiceMessage(
    item.type,
    item.fileMimeType,
    item.fileName,
    item.voiceDurationMs,
  );
  const isFile = item.type !== "text" && !isVoice;
  const isMine = item.isMine;
  const textColor = isMine ? colors.sentText : colors.receivedText;

  const body = (
    <Box
      onClick={onPress}
      onContextMenu={onContextMenu}
      sx={{
        maxWidth: { xs: "88%", sm: "78%" },
        px: 1.5,
        py: 1.25,
        borderRadius: "14px",
        borderTopLeftRadius: isMine ? "14px" : "4px",
        borderTopRightRadius: isMine ? "4px" : "14px",
        background: isMine ? colors.sentBg : colors.receivedBg,
        border: isSelected ? "2px solid #0A5FFF" : "none",
        cursor: selectionMode ? "pointer" : "default",
      }}
    >
      {isVoice && (
        <VoiceMessagePlayer
          item={item}
          textColor={textColor}
          metaTextColor={colors.metaText}
          accentColor={textColor}
        />
      )}

      {isFile && isChatImageMessage(item.type, item.fileMimeType, item.fileName) && item.fileUrl && (
        <Box
          component="img"
          src={item.fileUrl}
          alt={item.fileName || "attachment"}
          sx={{
            maxWidth: 200,
            maxHeight: 130,
            borderRadius: "8px",
            display: "block",
            mb: item.text && item.text !== item.fileName ? 1 : 0,
            cursor: "pointer",
          }}
        />
      )}

      {isFile && isChatDocumentMessage(item.type, item.fileMimeType, item.fileName) && (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            if (!selectionMode && item.fileUrl) {
              openRemoteDocument(item.fileUrl, item.fileName);
            }
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: item.fileUrl ? "pointer" : "default",
            mb: item.text && item.text !== item.fileName ? 1 : 0,
          }}
        >
          {getDocumentKindLabel(item.fileMimeType, item.fileName) === "PDF" ? (
            <PictureAsPdfIcon sx={{ color: "#E53935" }} />
          ) : (
            <InsertDriveFileIcon sx={{ color: colors.metaText }} />
          )}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: textColor }}>
              {item.fileName || item.text || "Document"}
            </Typography>
            {!!item.fileSize && (
              <Typography sx={{ fontSize: 10, color: colors.metaText }}>
                {formatFileSize(item.fileSize)}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {(!isFile && !isVoice) ||
      (item.text &&
        item.text !== item.fileName &&
        !/^\d+:\d{2}$/.test(String(item.text).trim())) ? (
        <Typography
          sx={{
            fontSize: 13,
            lineHeight: 1.5,
            color: textColor,
            whiteSpace: "pre-wrap",
            mt: isVoice ? 0.5 : 0,
          }}
        >
          {item.text}
        </Typography>
      ) : null}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isMine ? "flex-end" : "flex-start",
          mt: 0.75,
          gap: 0.5,
        }}
      >
        <Typography sx={{ fontSize: 11, color: colors.metaText }}>
          {item.sender} • {item.timestamp}
        </Typography>
        {isMine && <MessageStatusTicks status={item.status} darkMode={darkMode} />}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        mb: 2,
        px: 1,
      }}
    >
      {body}
    </Box>
  );
}

const CaseDetailsChatPanel = ({
  visible,
  onClose,
  chatTitle = "Julia (Crew)",
  incidentId,
  crewUserId,
  chatEnabled = true,
  message,
  setMessage,
  pendingMedicines = [],
  onSendMedicines,
  prefetchedRoomId = null,
  darkMode,
  fullScreen = false,
}) => {
  const fileInputRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuMessage, setMenuMessage] = useState(null);
  const [recordingError, setRecordingError] = useState(null);

  const chat = useAviationCaseChat({
    visible,
    chatEnabled,
    incidentId,
    crewUserId,
    prefetchedRoomId,
    message,
    setMessage,
  });

  const handleVoiceRecorded = useCallback(
    (payload) => {
      setRecordingError(null);
      chat.handleSendVoice(payload);
    },
    [chat.handleSendVoice],
  );

  const voiceRecorder = useVoiceRecorder({
    onRecorded: handleVoiceRecorded,
    onError: setRecordingError,
  });

  const colors = darkMode
    ? {
        cardBg: "#0B1829",
        cardBorder: "#1A2E4A",
        titleBarBg: "#0D1F35",
        titleText: "#B8D0EE",
        divider: "#152E50",
        listBg: "#0B1829",
        receivedBg: "#112240",
        receivedText: "#C8DCF2",
        sentBg: "#1a3a6b",
        sentText: "#E8F0FE",
        metaText: "#3D5A7A",
        inputBarBg: "#0B1829",
        inputText: "#C0D8F0",
        placeholder: "#2A4060",
        iconBorder: "#1E3A58",
        iconColor: "#EBEDF0",
      }
    : {
        cardBg: "#FFFFFF",
        cardBorder: "#A8C0E8",
        titleBarBg: "#EBF1FC",
        titleText: "#1A3A6B",
        divider: "#D4E0F4",
        listBg: "#FFFFFF",
        receivedBg: "#EFF4FF",
        receivedText: "#1A2A40",
        sentBg: "#0A5FFF",
        sentText: "#FFFFFF",
        metaText: "#7A90B0",
        inputBarBg: "#FFFFFF",
        inputText: "#1A2A40",
        placeholder: "#9AAAC0",
        iconBorder: "#B8C8E4",
        iconColor: "#607090",
      };

  const statusText = getChatStatusText({
    loading: chat.loading,
    socketConnected: chat.socketConnected,
    otherUserTyping: chat.otherUserTyping,
    otherUserOnline: chat.otherUserOnline,
  });

  const hasSendContent =
    chat.draft.trim().length > 0 ||
    pendingMedicines.length > 0 ||
    !!chat.pendingFile;

  const handleSendClick = () => {
    if (chat.sending || chat.uploading) return;
    if (!hasSendContent) return;
    chat.handleSend();
    onSendMedicines?.();
  };

  const handleFileChange = (e) => {
    const picked = fileFromBrowserInput(e.target.files);
    if (picked) {
      chat.setPendingFile(picked);
    }
    e.target.value = "";
  };

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: fullScreen ? "fixed" : "absolute",
        inset: 0,
        zIndex: fullScreen ? 1300 : 10,
        background: colors.cardBg,
        border: fullScreen ? "none" : `1px solid ${colors.cardBorder}`,
        display: "flex",
        flexDirection: "column",
        m: fullScreen ? 0 : { xs: "4px", sm: "10px" },
        borderRadius: fullScreen ? 0 : { xs: "10px", sm: "14px" },
        overflow: "hidden",
        maxHeight: fullScreen ? "100dvh" : "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${colors.divider}`,
          background: colors.titleBarBg,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.titleText }}>
            {chatTitle}
          </Typography>
          {!!statusText && (
            <Typography sx={{ fontSize: 11, color: colors.metaText, mt: 0.25 }}>
              {statusText}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {chat.selectionMode && (
            <>
              <IconButton
                size="small"
                disabled={!chat.selectedIds.length}
                onClick={chat.handleDeleteSelected}
                sx={{ color: colors.titleText }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={chat.exitSelectionMode} sx={{ color: colors.titleText }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          )}
          <IconButton size="small" onClick={onClose} sx={{ color: colors.metaText }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {!!chat.chatError && (
        <Typography sx={{ fontSize: 12, color: "#E53935", px: 2, pt: 1 }}>
          {chat.chatError}
        </Typography>
      )}

      {!!recordingError && (
        <Typography sx={{ fontSize: 12, color: "#E53935", px: 2, pt: chat.chatError ? 0 : 1 }}>
          {recordingError}
        </Typography>
      )}

      {(voiceRecorder.isRecording || voiceRecorder.processing) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            px: 2,
            py: 0.75,
            background: darkMode ? "rgba(229,57,53,0.12)" : "#FFEBEE",
            borderBottom: `1px solid ${colors.divider}`,
          }}
        >
          {voiceRecorder.processing ? (
            <>
              <CircularProgress size={14} sx={{ color: "#E53935" }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#E53935" }}>
                Preparing voice for crew…
              </Typography>
            </>
          ) : (
            <>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#E53935",
                  animation: "pulse 1.2s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.35 },
                  },
                }}
              />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#E53935" }}>
                Recording {formatVoiceDuration(voiceRecorder.durationMs)}
              </Typography>
              <Button
                size="small"
                onClick={voiceRecorder.cancelRecording}
                sx={{ ml: "auto", textTransform: "none", fontSize: 11, color: colors.metaText }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      )}

      <Box
        ref={chat.listRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          background: colors.listBg,
          p: 1,
        }}
      >
        {chat.loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} sx={{ color: colors.titleText }} />
          </Box>
        )}

        {!chat.loading && chat.messages.length === 0 && (
          <Typography sx={{ fontSize: 13, color: colors.metaText, p: 2, textAlign: "center" }}>
            No messages yet. Type below or add medicines from the kit panel.
          </Typography>
        )}

        {chat.messages.map((item) => (
          <ChatMessageBubble
            key={item.id}
            item={item}
            darkMode={darkMode}
            colors={colors}
            selectionMode={chat.selectionMode}
            isSelected={chat.selectedIds.includes(String(item.id))}
            onPress={() => {
              if (chat.selectionMode) {
                chat.toggleSelectMessage(item.id);
                return;
              }
              if (
                isChatImageMessage(item.type, item.fileMimeType, item.fileName) &&
                item.fileUrl
              ) {
                chat.setViewerImage({ uri: item.fileUrl, fileName: item.fileName });
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (String(item.id).startsWith("temp-")) return;
              setMenuAnchor(e.currentTarget);
              setMenuMessage(item);
            }}
          />
        ))}
      </Box>

      {chat.pendingFile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mx: 1.5,
            mt: 1,
            p: 1,
            borderRadius: "10px",
            border: `1px solid ${colors.divider}`,
            background: colors.inputBarBg,
          }}
        >
          {chat.pendingFile.localPreview ? (
            <Box
              component="img"
              src={chat.pendingFile.localPreview}
              alt=""
              sx={{ width: 40, height: 40, borderRadius: 1, objectFit: "cover" }}
            />
          ) : (
            <InsertDriveFileIcon sx={{ color: colors.metaText }} />
          )}
          <Typography
            sx={{ flex: 1, fontSize: 12, fontWeight: 600, color: colors.inputText }}
            noWrap
          >
            {chat.pendingFile.name}
          </Typography>
          <IconButton size="small" onClick={chat.clearPendingFile} sx={{ color: colors.metaText }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: { xs: 0.5, sm: 1 },
          px: { xs: 1, sm: 1.5 },
          py: { xs: 1, sm: 1.5 },
          pb: fullScreen
            ? "max(12px, env(safe-area-inset-bottom))"
            : { xs: 1, sm: 1.5 },
          borderTop: `1px solid ${colors.divider}`,
          background: colors.inputBarBg,
          flexShrink: 0,
        }}
      >
        <Box
          component="textarea"
          value={chat.draft}
          onChange={(e) => chat.handleDraftChange(e.target.value)}
          placeholder="Click on the mic or type.."
          disabled={!chat.chatReady}
          sx={{
            flex: 1,
            minHeight: 40,
            maxHeight: 90,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: { xs: 12, sm: 13 },
            fontFamily: "inherit",
            color: colors.inputText,
            "&::placeholder": { color: colors.placeholder },
          }}
        />

        <IconButton
          size="small"
          disabled={
            !chat.chatReady ||
            chat.uploading ||
            chat.loading ||
            chat.sending ||
            voiceRecorder.processing
          }
          onClick={voiceRecorder.toggleRecording}
          sx={{
            border: `1px solid ${voiceRecorder.isRecording ? "#E53935" : colors.iconBorder}`,
            color: voiceRecorder.isRecording ? "#E53935" : colors.iconColor,
            background: voiceRecorder.isRecording
              ? darkMode
                ? "rgba(229,57,53,0.15)"
                : "#FFEBEE"
              : "transparent",
            width: { xs: 34, sm: 38 },
            height: { xs: 34, sm: 38 },
            flexShrink: 0,
            display: "inline-flex",
          }}
        >
          {voiceRecorder.isRecording ? (
            <StopIcon sx={{ fontSize: 18 }} />
          ) : (
            <MicIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*,.pdf,.txt,.doc,.docx"
          onChange={handleFileChange}
        />
        <IconButton
          size="small"
          disabled={!chat.chatReady || chat.uploading || chat.loading}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: `1px solid ${colors.iconBorder}`,
            color: colors.iconColor,
            width: { xs: 34, sm: 38 },
            height: { xs: 34, sm: 38 },
            flexShrink: 0,
          }}
        >
          {chat.uploading ? (
            <CircularProgress size={16} sx={{ color: colors.iconColor }} />
          ) : (
            <AttachFileIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>

        <Button
          size="small"
          onClick={handleSendClick}
          disabled={!hasSendContent || chat.sending || chat.uploading || !chat.chatReady}
          startIcon={
            chat.sending || chat.uploading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <SendIcon sx={{ fontSize: 14 }} />
            )
          }
          sx={{
            background: "#0A5FFF",
            color: "#fff",
            textTransform: "none",
            fontSize: { xs: 11, sm: 12 },
            fontWeight: 600,
            borderRadius: "10px",
            px: { xs: 1.25, sm: 1.75 },
            py: 0.9,
            minWidth: { xs: 56, sm: 72 },
            flexShrink: 0,
            opacity: hasSendContent && !chat.sending && !chat.uploading ? 1 : 0.55,
            "&:hover": { background: "#0047cc" },
            "& .MuiButton-startIcon": { mr: { xs: 0, sm: 0.5 } },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Send
          </Box>
        </Button>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setMenuMessage(null);
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuMessage) {
              chat.setSelectionMode(true);
              chat.toggleSelectMessage(menuMessage.id);
            }
            setMenuAnchor(null);
            setMenuMessage(null);
          }}
        >
          Select message
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuMessage) chat.handleDeleteOne(menuMessage.id);
            setMenuAnchor(null);
            setMenuMessage(null);
          }}
          sx={{ color: "error.main" }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={!!chat.viewerImage}
        onClose={() => chat.setViewerImage(null)}
        maxWidth="md"
        fullWidth
      >
        {chat.viewerImage?.uri && (
          <Box
            component="img"
            src={chat.viewerImage.uri}
            alt={chat.viewerImage.fileName || "image"}
            sx={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default CaseDetailsChatPanel;
