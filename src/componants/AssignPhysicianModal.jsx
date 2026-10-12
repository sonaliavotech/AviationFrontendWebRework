// src/componants/AssignPhysicianModal.jsx

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";

import { getPhysicians, getPhysicianLiveStatus, mapPhysicianFromApi } from "../services/api";
import { useThemeMode, getTheme } from "../context/ThemeContext";
import {
  PHYSICIAN_STATUS_COLORS,
  PHYSICIAN_STATUS_SHORT_LABELS,
  PHYSICIAN_STATUS,
} from "../types/physicianStatus";

/**
 * Web version of the native AssignPhysicianModal.
 *
 * Props:
 *   open        boolean
 *   onClose     () => void
 *   onAssign    ({ id, name, specialty }) => void | Promise
 *   theme       (optional) — if not passed, uses ThemeContext
 */
export default function AssignPhysicianModal({
  open,
  onClose,
  onAssign,
  theme: themeProp,
}) {
  const themeCtx = useThemeMode();
  const darkMode = themeCtx?.darkMode ?? false;
  const theme = themeProp || getTheme(darkMode);

  const [selectedId, setSelectedId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch physicians + their live status when modal opens
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setSearchText("");
    setError(null);
    setLoading(true);

    const fetchDoctors = async () => {
      try {
        const raw = await getPhysicians();
        const list = Array.isArray(raw) ? raw : [];

        // Enrich each physician with live presence (non-blocking)
        const enriched = await Promise.all(
          list.map(async (doc) => {
            let live = null;
            try {
              live = await getPhysicianLiveStatus(doc.id);
            } catch {
              /* non-fatal — fall back */
            }
            return mapPhysicianFromApi(doc, live);
          }),
        );

        if (cancelled) return;
        setDoctors(enriched);

        // Preselect first assignable physician
        const firstAssignable = enriched.find((d) => d.assignable);
        setSelectedId(firstAssignable?.id ?? null);
      } catch (err) {
        console.error("FETCH PHYSICIANS ERROR =>", err);
        if (!cancelled) {
          setDoctors([]);
          setSelectedId(null);
          setError("Failed to load physicians. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDoctors();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const filteredDoctors = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        (PHYSICIAN_STATUS_SHORT_LABELS[d.status] || "").toLowerCase().includes(q),
    );
  }, [doctors, searchText]);

  const selectedDoctor = doctors.find((d) => d.id === selectedId);
  const canAssign = Boolean(selectedDoctor?.assignable);

  const handleAssign = () => {
    if (!canAssign || !selectedDoctor) return;
    onAssign?.({
      id: selectedDoctor.id,
      name: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      status: selectedDoctor.status,
    });
    onClose?.();
  };

  return (
    <Dialog
      open={!!open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          width: { xs: "calc(100% - 24px)", sm: "500px" },
          maxWidth: { xs: "100%", sm: "500px" },
          background: theme.modalBg || (darkMode ? "#111827" : "#FFFFFF"),
          color: darkMode ? "#F8FAFC" : "#111827",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            Assign to Provider
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: darkMode ? "#94A3B8" : "#64748B" }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Divider */}
        <Box
          sx={{
            height: "1px",
            background: darkMode ? "#1F2937" : "#E5E7EB",
            mx: 3,
            mb: 2,
          }}
        />

        {/* Content */}
        <Box sx={{ px: 3, pb: 3, maxHeight: "65vh", overflow: "auto" }}>
          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name or specialty"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{ fontSize: 18, color: darkMode ? "#94A3B8" : "#64748B" }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                background: darkMode ? "#0F172A" : "#F8FAFC",
                borderRadius: "10px",
                color: darkMode ? "#F8FAFC" : "#111827",
                "& fieldset": {
                  borderColor: darkMode ? "#1E293B" : "#E5E7EB",
                },
                "&:hover fieldset": { borderColor: "#0A5FFF" },
                "&.Mui-focused fieldset": {
                  borderColor: "#0A5FFF",
                  borderWidth: 1.5,
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: darkMode ? "#94A3B8" : "#64748B",
                opacity: 1,
              },
            }}
          />

          {/* Loading */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 6,
              }}
            >
              <CircularProgress size={28} sx={{ color: "#0A5FFF" }} />
            </Box>
          ) : error ? (
            <Typography
              sx={{
                textAlign: "center",
                py: 4,
                color: "#EF4444",
                fontSize: 13,
              }}
            >
              {error}
            </Typography>
          ) : filteredDoctors.length === 0 ? (
            <Typography
              sx={{
                textAlign: "center",
                py: 4,
                color: darkMode ? "#94A3B8" : "#64748B",
                fontSize: 13,
              }}
            >
              No physicians found.
            </Typography>
          ) : (
            filteredDoctors.map((doctor) => {
              const selected = doctor.id === selectedId;
              const disabled = !doctor.assignable;
              const statusColor =
                PHYSICIAN_STATUS_COLORS[doctor.status] ||
                PHYSICIAN_STATUS_COLORS[PHYSICIAN_STATUS.OFFLINE];
              const statusLabel =
                PHYSICIAN_STATUS_SHORT_LABELS[doctor.status] || "Offline";

              return (
                <Box
                  key={doctor.id}
                  onClick={() => {
                    if (!disabled) setSelectedId(doctor.id);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    mb: 1.5,
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: selected
                      ? "#0A5FFF"
                      : darkMode
                        ? "#1E293B"
                        : "#E5E7EB",
                    background: selected
                      ? darkMode
                        ? "rgba(10,95,255,0.12)"
                        : "rgba(10,95,255,0.06)"
                      : darkMode
                        ? "#0F172A"
                        : "#F8FAFC",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.55 : 1,
                    transition: "all 0.15s",
                    "&:hover": {
                      borderColor: disabled
                        ? "inherit"
                        : selected
                          ? "#0A5FFF"
                          : "#94A3B8",
                    },
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: darkMode ? "#F8FAFC" : "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {doctor.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        color: "#10B981",
                        mt: 0.25,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {doctor.specialty}
                    </Typography>

                    {/* Status dot + label */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        mt: 0.75,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: statusColor,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: statusColor,
                        }}
                      >
                        {statusLabel}
                      </Typography>
                    </Box>
                  </Box>

                  {selected && !disabled && (
                    <CheckIcon
                      sx={{
                        fontSize: 18,
                        color: "#0A5FFF",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Box>
              );
            })
          )}

          {/* Assign button */}
          <Button
            fullWidth
            onClick={handleAssign}
            disabled={!canAssign}
            variant="contained"
            sx={{
              mt: 2,
              background: "#1D4ED8",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              borderRadius: "12px",
              py: 1.2,
              "&:hover": { background: "#1E40AF" },
              "&.Mui-disabled": {
                background: "#94A3B8",
                color: "#FFFFFF",
              },
            }}
          >
            {canAssign ? "Assign" : "Select an available physician"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}