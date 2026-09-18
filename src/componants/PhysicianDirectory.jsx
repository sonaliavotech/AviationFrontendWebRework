// src/componants/PhysicianDirectory.jsx
// Web version of the native PhysicianDirectory (Aviation-physician-frontend Sidebar).
// Shows the full physician directory from GET /api/physicians with each doctor's
// live status, search + All/Available/Unavailable tabs, multi-select (with
// indeterminate "select all"), and a "Video call" action that starts a web call
// with the selected physicians (mirrors native startOneToOneCall / startGroupCall).
import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  Fade,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import VideocamIcon from "@mui/icons-material/Videocam";

import { getPhysicians } from "../services/api";
import AviationChatSocket from "../services/AviationChatSocket";
import { useThemeMode } from "../context/ThemeContext";
import { useAviationCallContext } from "../context/AviationCallContext";
import { DirectoryIcon } from "../assets/Assets";
import {
  getPhysicianSession,
  mapPhysicianToWebUser,
} from "../utils/physicianSession";
import {
  PHYSICIAN_STATUS,
  normalizePhysicianStatus,
} from "../types/physicianStatus";

const TABS = [
  { key: "all", label: "All" },
  { key: "available", label: "Available" },
  { key: "unavailable", label: "Unavailable" },
];

const AVATAR_COLORS = [
  { bg: "#DBEAFE", text: "#1D4ED8" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#EDE9FE", text: "#6D28D9" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#FEE2E2", text: "#B91C1C" },
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const mapDoctor = (doctor) => {
  const status = normalizePhysicianStatus(
    doctor.status || (doctor.is_online ? "available" : null),
  );
  const active =
    doctor.physician_is_active === true ||
    String(doctor.physician_is_active || "").toLowerCase() === "true" ||
    doctor.physician_is_active === undefined;

  return {
    id: doctor.id,
    name: `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim(),
    specialty: doctor.specialty || doctor.department || "Physician",
    department: doctor.department || "",
    status,
    active,
    available: status === PHYSICIAN_STATUS.AVAILABLE && active,
  };
};

export default function PhysicianDirectory({ open, onClose }) {
  const { darkMode, tokens } = useThemeMode();
  const { startCall, openJitsi, callStatus, isInCall, callError } =
    useAviationCallContext();

  const [physicians, setPhysicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(() => new Set());
  const [calling, setCalling] = useState(false);
  const [snack, setSnack] = useState(null);

  const session = getPhysicianSession();
  const currentUser = useMemo(() => mapPhysicianToWebUser(session), [session]);

  // Surface any global call error as an in-app toast.
  useEffect(() => {
    if (callError) {
      setSnack({ severity: "error", message: callError });
    }
  }, [callError]);

  // ── Fetch physicians when the modal opens (mirrors native) ──
  const fetchPhysicians = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPhysicians();
      const list = (Array.isArray(data) ? data : []).map(mapDoctor);
      setPhysicians(list);
    } catch (error) {
      console.log("DIRECTORY ERROR =>", error);
      setPhysicians([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setTab("all");
    setSelected(new Set());
    fetchPhysicians();
  }, [open, fetchPhysicians]);

  // ── Live filter (tabs + search) ──
  const filtered = useMemo(() => {
    let list = physicians;
    if (tab === "available") {
      list = list.filter((d) => d.available === true);
    } else if (tab === "unavailable") {
      list = list.filter((d) => d.available !== true);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.specialty?.toLowerCase().includes(q) ||
          d.department?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, tab, physicians]);

  // ── Checkbox helpers ──
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.size === filtered.length
        ? new Set()
        : new Set(filtered.map((d) => d.id)),
    );
  };

  const allSelected = filtered.length > 0 && selected.size === filtered.length;
  const someSelected = selected.size > 0;

  // A call is active if we're ringing / connected / in-call (web statuses).
  const callActive =
    isInCall || callStatus === "ringing" || callStatus === "connected";

  // ── Video call handler ──
  const handleCallDr = useCallback(() => {
    if (!someSelected) {
      setSnack({
        severity: "warning",
        message:
          "No physician selected. Please select at least one physician to call.",
      });
      return;
    }

    if (callActive || calling) {
      setSnack({
        severity: "warning",
        message:
          "A call is already in progress. End it before starting a new one.",
      });
      return;
    }

    const selectedDoctors = physicians.filter((d) => selected.has(d.id));
    const myUserId = currentUser?.id ? String(currentUser.id) : "";
    const targets = myUserId
      ? selectedDoctors.filter((d) => String(d.id) !== myUserId)
      : selectedDoctors;

    if (targets.length === 0) {
      setSnack({ severity: "warning", message: "You cannot call yourself." });
      return;
    }

    const organizationName = currentUser?.organizationName || "Aviation";
    const fromUserId = currentUser?.id ? String(currentUser.id) : "";
    const callId = `dir_${Date.now()}`;
    const base = {
      callId,
      roomId: callId,
      fromUserId,
      callerId: fromUserId,
      callerName: currentUser?.name || "Physician",
      callerRole: "physician",
      hasVideo: true,
      callType: "video",
      organizationName,
    };

    setCalling(true);
    onClose();

    try {
      if (fromUserId && !AviationChatSocket.isConnected()) {
        AviationChatSocket.connect(fromUserId);
      }

      let success = false;
      if (targets.length === 1) {
        const doctor = targets[0];
        success = startCall({
          ...base,
          toUserId: String(doctor.id),
          receiverRole: "physician",
          participants: [
            {
              userId: String(doctor.id),
              id: String(doctor.id),
              role: "physician",
              name: doctor.name,
            },
          ],
        });
      } else {
        success = startCall({
          ...base,
          participants: targets.map((d) => ({
            userId: String(d.id),
            id: String(d.id),
            role: "physician",
            name: d.name,
          })),
        });
      }

      if (success) {
        openJitsi(base);
      } else {
        setSnack({
          severity: "error",
          message:
            "Could not start the video call. Please check your connection.",
        });
      }
    } catch (error) {
      console.log("DIRECTORY CALL ERROR =>", error);
      setSnack({
        severity: "error",
        message: error?.message || "Could not start the video call.",
      });
    } finally {
      setCalling(false);
    }
  }, [
    someSelected,
    callActive,
    calling,
    physicians,
    selected,
    currentUser,
    startCall,
    openJitsi,
    onClose,
  ]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        scroll="paper"
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            p: 0,
            borderRadius: 2,
            width: { xs: "92vw", sm: 420 },
            maxWidth: "100%",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: tokens.cardBg,
            color: tokens.textPrimary,
          },
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            pt: 1.5,
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "10px",
                bgcolor: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DirectoryIcon />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, color: tokens.textPrimary }}
              >
                Physician Directory
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filtered.length} physician{filtered.length !== 1 ? "s" : ""}
                {someSelected ? `  ·  ${selected.size} selected` : ""}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="close"
            sx={{ width: 28, height: 28 }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* ── Search ── */}
        <Box sx={{ px: 2, pb: 1 }}>
          <TextField
            size="small"
            placeholder="Search name, specialty…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{ fontSize: 16, color: tokens.textSecondary }}
                  />
                </InputAdornment>
              ),
              endAdornment:
                search.length > 0 ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearch("")}
                      edge="end"
                      aria-label="clear search"
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                backgroundColor: darkMode ? "#0F172A" : "#F9FAFB",
                "& fieldset": { borderColor: tokens.divider },
              },
            }}
            inputProps={{ "aria-label": "Search physicians" }}
          />
        </Box>

        {/* ── Tabs + Select All ── */}
        <Box
          sx={{
            px: 2,
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {TABS.map((tb) => {
            const active = tb.key === tab;
            return (
              <Button
                key={tb.key}
                size="small"
                onClick={() => setTab(tb.key)}
                variant={active ? "contained" : "text"}
                sx={{
                  borderRadius: 20,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 11,
                  ...(active
                    ? { backgroundColor: "#2563EB" }
                    : {
                        color: tokens.textSecondary,
                        "&:hover": { backgroundColor: "action.hover" },
                      }),
                }}
              >
                {tb.label}
              </Button>
            );
          })}

          <Box
            sx={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              pl: 1,
              color: tokens.textSecondary,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={toggleSelectAll}
            role="button"
          >
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={toggleSelectAll}
              inputProps={{ "aria-label": "Select all" }}
            />
            All
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }} />

        {/* ── List ── */}
        <Box
          sx={{
            flex: "1 1 auto",
            overflowY: "auto",
            minWidth: 0,
            px: 1,
          }}
        >
          {loading ? (
            <Box
              sx={{
                py: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                color: tokens.textSecondary,
              }}
            >
              <CircularProgress size={24} sx={{ color: "#2563EB" }} />
              <Typography variant="caption">Loading…</Typography>
            </Box>
          ) : filtered.length === 0 ? (
            <Box
              sx={{
                py: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                color: tokens.textSecondary,
              }}
            >
              <Typography variant="h6" sx={{ fontSize: 22, opacity: 0.35 }}>
                &#x1F44E;
              </Typography>
              <Typography variant="caption">No physicians found</Typography>
            </Box>
          ) : (
            filtered.map((d, idx) => {
              const avail = d.available;
              const aColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const checked = selected.has(d.id);
              return (
                <Box
                  key={d.id}
                  onClick={() => toggleSelect(d.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mx: 1,
                    my: 0.75,
                    p: 1,
                    borderRadius: 1.5,
                    cursor: "pointer",
                    border: checked
                      ? "1.5px solid #2563EB"
                      : "1px solid transparent",
                    backgroundColor: checked
                      ? "action.hovered"
                      : "background.paper",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={checked}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(d.id);
                    }}
                    inputProps={{ "aria-label": d.name }}
                  />
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: aColor.bg,
                      color: aColor.text,
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(d.name)}
                  </Avatar>

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: tokens.textPrimary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {d.name || "—"}
                    </Typography>
                    {d.specialty || d.department ? (
                      <Typography
                        variant="caption"
                        sx={{
                          color: tokens.textSecondary,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {[d.specialty, d.department]
                          .filter(Boolean)
                          .join(" · ")}
                      </Typography>
                    ) : null}
                  </Box>

                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 1,
                      py: 0.25,
                      borderRadius: 10,
                      backgroundColor: avail ? "#D1FAE5" : "#FEE2E2",
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        backgroundColor: avail ? "#10B981" : "#EF4444",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: avail ? "#065F46" : "#B91C1C",
                      }}
                    >
                      {avail ? "Available" : "Unavailable"}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        {/* ── Footer: Video call ── */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            backgroundColor: tokens.cardBg,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            onClick={handleCallDr}
            disabled={calling || !someSelected || callActive}
            startIcon={
              calling ? <CircularProgress size={16} /> : <VideocamIcon />
            }
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              backgroundColor: "#2563EB",
              "&:hover": { backgroundColor: "#1D4ED8" },
              ...(!someSelected || callActive
                ? { backgroundColor: "action.disabledBackground" }
                : {}),
            }}
          >
            {calling
              ? "Starting call…"
              : someSelected
                ? `Video call (${selected.size})`
                : "Video call"}
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack(null)}
          severity={snack?.severity || "info"}
          sx={{ width: "100%" }}
        >
          {snack?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

PhysicianDirectory.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
