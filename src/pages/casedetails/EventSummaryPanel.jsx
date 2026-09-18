// EventSummaryPanel

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import LoadingSpinner from "../../componants/LoadingSpinner";
import AiSummaryCard from "./AiSummaryCard";
import { useThemeMode } from "../../context/ThemeContext";
import { getPhysicianSession } from "../../utils/physicianSession";
import IncidentSocket from "../../services/IncidentSocket";
import {
  INCIDENT_SOCKET_EVENTS,
  INCIDENT_DETAIL_REFRESH_EVENTS,
} from "../../constants/incidentSocketEvents";
import {
  mapOrderFromSocket,
  mapNoteFromSocket,
  resolveDeletedEntityId,
} from "../../utils/physicianOrderNoteMappers";
import { API_BASE_URL, API_HOST, FILES_BASE_URL } from "../../config/appConfig";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const TIMELINE_COLLAPSE_THRESHOLD = 5;
const NOTES_COLLAPSE_THRESHOLD = 7;

const resolveAssignedPhysicianId = (source) => {
  if (!source || typeof source !== "object") return null;
  const nested =
    source.physician && typeof source.physician === "object"
      ? source.physician
      : null;
  const id =
    source.physicianId ||
    source.physician_id ||
    source.assigned_physician_id ||
    nested?.id ||
    nested?.userId ||
    nested?.user_id ||
    null;
  return id != null && String(id).trim() ? String(id) : null;
};

const formatAssessmentAnswer = (answer) => {
  if (answer == null || answer === "") return "-";
  if (typeof answer === "boolean") return answer ? "Yes" : "No";
  if (Array.isArray(answer)) {
    if (answer.length === 0) return "-";
    return answer
      .map((item) => formatAssessmentAnswer(item))
      .filter((item) => item && item !== "-")
      .join(", ");
  }
  if (typeof answer === "string") {
    const normalized = answer.trim().toLowerCase();
    if (normalized === "yes") return "Yes";
    if (normalized === "no") return "No";
    return answer;
  }
  if (typeof answer === "object" && Array.isArray(answer.regionNames)) {
    return answer.regionNames.join(", ") || "-";
  }
  return String(answer);
};

const formatTimelineDateTime = (value) => {
  if (!value) return "--, --:--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--, --:--";
  const date = parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date}, ${time}`;
};

const cleanTimelineDescription = (description = "") =>
  description
    ?.replace(/pathway\s+[a-z]\s+selected\.?/gi, "Assessment Initiated.")
    ?.replace(
      /pathway\s+[a-z]\s+assessment\s+initiated\.?/gi,
      "Assessment Initiated.",
    )
    ?.replace(/pathway\s+[a-z]\s+for\s+condition\s+identified\.?/gi, "")
    ?.replace(/\s+/g, " ")
    ?.trim() || "";

const logCaseEvent = async (incidentId, logPayload) => {
  if (!incidentId) return;
  try {
    const response = await fetch(`${API_BASE_URL}/case-logs/${incidentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(logPayload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.log("CASE LOG ERROR =>", errorText);
    }
  } catch (error) {
    console.log("CASE LOG ERROR =>", error);
  }
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const EventSummaryPanel = ({
  eventData: eventDataProp,
  loadingEvent: loadingEventProp,
  loadingEcg: loadingEcgProp,
  ecgFiles: ecgFilesProp,
  medicineOrderDraft = null,
  onMedicineOrderConsumed,
  onClearMedicineOrderDraft,
  aiSummary: aiSummaryProp,
  darkMode: darkModeProp,
  onBack,
  onEcgClick,
  incidentId: incidentIdProp,
  navigation,
}) => {
  const themeCtx = useThemeMode();
  const darkMode = darkModeProp ?? themeCtx?.darkMode ?? false;

  const incidentId =
    incidentIdProp || eventDataProp?.incidentId || eventDataProp?.id || null;

  // ── State ──
  const [eventData, setEventData] = useState(eventDataProp || null);
  const [loadingEvent, setLoadingEvent] = useState(!!loadingEventProp);
  const [ecgFiles, setEcgFiles] = useState(ecgFilesProp || []);
  const [loadingEcg, setLoadingEcg] = useState(!!loadingEcgProp);

  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [message, setMessage] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);

  // ── Refs used to scroll to / focus the note textarea when "Edit" is
  // clicked on a previous note, so the physician lands right in the
  // input instead of having to scroll up and click into it manually. ──
  const noteInputRef = useRef(null);
  const noteSectionRef = useRef(null);

  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orderTitle, setOrderTitle] = useState("");
  const [orderInstructions, setOrderInstructions] = useState("");
  const [titleFocused, setTitleFocused] = useState(false);
  const [instructionsFocused, setInstructionsFocused] = useState(false);

  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  const [physicianSession, setPhysicianSession] = useState(null);
  const [physicianAssigned, setPhysicianAssigned] = useState(false);

  const [selectedOrderForAction, setSelectedOrderForAction] = useState(null);
  const [orderActionOpen, setOrderActionOpen] = useState(false);
  const [viewOrderOpen, setViewOrderOpen] = useState(false);
  const [editOrderOpen, setEditOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editInstructions, setEditInstructions] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const handleCloseSnackbar = (e, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  // ── Sync props ──
  useEffect(() => {
    if (eventDataProp) setEventData(eventDataProp);
  }, [eventDataProp]);

  useEffect(() => {
    setLoadingEvent(!!loadingEventProp);
  }, [loadingEventProp]);

  useEffect(() => {
    if (ecgFilesProp && ecgFilesProp.length > 0) setEcgFiles(ecgFilesProp);
  }, [ecgFilesProp]);

  useEffect(() => {
    setLoadingEcg(!!loadingEcgProp);
  }, [loadingEcgProp]);

  useEffect(() => {
    setTimelineExpanded(false);
    setNotesExpanded(false);
  }, [incidentId]);

  // ── Physician session ──
  useEffect(() => {
    let mounted = true;

    const applySession = (session) => {
      if (!mounted) return;
      setPhysicianSession(session);
      const assignedId = resolveAssignedPhysicianId(eventData);
      if (session?.id && assignedId) {
        setPhysicianAssigned(String(assignedId) === String(session.id));
      }
    };

    const result = getPhysicianSession();
    if (result && typeof result.then === "function") {
      result.then(applySession).catch(() => applySession(null));
    } else {
      applySession(result);
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!physicianSession?.id || !eventData) return;
    const assignedId = resolveAssignedPhysicianId(eventData);
    setPhysicianAssigned(
      !!assignedId && String(assignedId) === String(physicianSession.id),
    );
  }, [eventData, physicianSession?.id]);

  const canManageNote = useCallback(
    () => physicianAssigned,
    [physicianAssigned],
  );
  const canManageOrder = useCallback(
    () => physicianAssigned,
    [physicianAssigned],
  );

  const assignedPhysicianId = useMemo(
    () => resolveAssignedPhysicianId(eventData),
    [eventData],
  );

  const getPhysicianId = useCallback(() => {
    return (
      physicianSession?.id ||
      assignedPhysicianId ||
      eventData?.physicianId ||
      eventData?.physician_id ||
      null
    );
  }, [physicianSession, assignedPhysicianId, eventData]);

  // ── Fetch event detail ──
  const fetchEventNotes = useCallback(async () => {
    if (!incidentId) return null;
    try {
      setLoadingEvent(true);
      const response = await fetch(`${API_BASE_URL}/${incidentId}`);
      const result = await response.json();
      const next = result?.data || result;
      if (next && typeof next === "object") {
        const assignedId = resolveAssignedPhysicianId(next);
        if (assignedId) {
          next.physicianId = assignedId;
          if (!next.physician_id) next.physician_id = assignedId;
        }
      }
      setEventData(next);
      return next;
    } catch (error) {
      console.log("EVENT NOTES ERROR =>", error);
      setEventData(null);
      return null;
    } finally {
      setLoadingEvent(false);
    }
  }, [incidentId]);

  // ── FETCH ECG FILES ──
  const fetchEcgFiles = useCallback(async () => {
    if (!incidentId) return;
    try {
      setLoadingEcg(true);
      const response = await fetch(`${API_HOST}/api/ecg/${incidentId}`);
      if (!response.ok) {
        throw new Error(`ECG fetch failed: ${response.status}`);
      }
      const result = await response.json();
      const list = Array.isArray(result?.ecgs)
        ? result.ecgs
        : Array.isArray(result?.data)
          ? result.data
          : [];
      setEcgFiles(list);
      console.log("📄 ECG files fetched:", list);
    } catch (error) {
      console.error("ECG FETCH ERROR =>", error);
      setEcgFiles([]);
    } finally {
      setLoadingEcg(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchEcgFiles();
  }, [fetchEcgFiles]);

  // ── Fetch notes ──
  const fetchNotes = useCallback(async () => {
    if (!incidentId) return;
    try {
      setLoadingNotes(true);
      const response = await fetch(
        `${API_HOST}/api/incidents/${incidentId}/physician-notes`,
      );
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();
      if (result.success && result.data) {
        const sorted = [...result.data].sort((a, b) => {
          const dateA = new Date(a.created_at || a.createdAt || 0);
          const dateB = new Date(b.created_at || b.createdAt || 0);
          return dateA - dateB;
        });
        setNotes(sorted);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  }, [incidentId]);

  // ── Fetch orders ──
  const fetchOrders = useCallback(async () => {
    if (!incidentId) return;
    try {
      setLoadingOrders(true);
      const response = await fetch(
        `${API_HOST}/api/incidents/${incidentId}/physician-orders`,
      );
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();
      if (result.success && result.data) {
        setOrders(
          result.data.map((order) => ({
            id: order.id,
            title: order.title,
            instructions: order.instructions || "",
            status: order.status === "completed" ? "Completed" : "Pending",
            createdAt: order.created_at,
            orderType: order.order_type,
            physicianId: order.physician_id,
            completedBy: order.completed_by,
            completedAt: order.completed_at,
            crewRemarks: order.crew_remarks,
            displayOrder: order.display_order,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchNotes();
    fetchOrders();
  }, [fetchNotes, fetchOrders]);

  // ── Socket wiring ──
  useEffect(() => {
    if (!incidentId) return undefined;
    IncidentSocket.joinIncident(incidentId);

    const onOrderCreated = (data) => {
      const mapped = mapOrderFromSocket(data);
      setOrders((prev) =>
        prev.some((o) => String(o.id) === String(mapped.id))
          ? prev
          : [...prev, mapped],
      );
    };
    const onOrderUpdated = (data) => {
      const mapped = mapOrderFromSocket(data);
      setOrders((prev) =>
        prev.map((o) =>
          String(o.id) === String(mapped.id) ? { ...o, ...mapped } : o,
        ),
      );
    };
    const onOrderStatusUpdated = (data) => {
      const mapped = mapOrderFromSocket(data);
      setOrders((prev) =>
        prev.map((o) => (o.id === mapped.id ? { ...o, ...mapped } : o)),
      );
    };
    const onOrderDeleted = (payload) => {
      const deletedId = resolveDeletedEntityId(payload);
      if (!deletedId) return;
      setOrders((prev) => prev.filter((o) => o.id !== deletedId));
    };
    const onNoteCreated = (data) => {
      const mapped = mapNoteFromSocket(data);
      setNotes((prev) =>
        prev.some((n) => String(n.id) === String(mapped.id))
          ? prev
          : [...prev, mapped],
      );
    };
    const onNoteUpdated = (data) => {
      const mapped = mapNoteFromSocket(data);
      setNotes((prev) =>
        prev.map((n) =>
          String(n.id) === String(mapped.id) ? { ...n, ...mapped } : n,
        ),
      );
    };
    const onNoteDeleted = (payload) => {
      const deletedId = resolveDeletedEntityId(payload);
      if (!deletedId) return;
      setNotes((prev) => prev.filter((n) => n.id !== deletedId));
    };
    const onCaseDetailRefresh = () => fetchEventNotes();

    const onEcgUploaded = (payload) => {
      console.log("📄 ECG uploaded event received:", payload);
      fetchEcgFiles();
    };

    IncidentSocket.on(
      INCIDENT_SOCKET_EVENTS.PHYSICIAN_ORDER_CREATED,
      onOrderCreated,
    );
    IncidentSocket.on(
      INCIDENT_SOCKET_EVENTS.PHYSICIAN_ORDER_UPDATED,
      onOrderUpdated,
    );
    IncidentSocket.on(
      INCIDENT_SOCKET_EVENTS.PHYSICIAN_ORDER_STATUS_UPDATED,
      onOrderStatusUpdated,
    );
    IncidentSocket.on(
      INCIDENT_SOCKET_EVENTS.PHYSICIAN_ORDER_DELETED,
      onOrderDeleted,
    );
    IncidentSocket.on(
      INCIDENT_SOCKET_EVENTS.PHYSICIAN_NOTE_CREATED,
      onNoteCreated,
    );
    IncidentSocket.on(
      INCIDENT_SOCKET_EVENTS.PHYSICIAN_NOTE_UPDATED,
      onNoteUpdated,
    );
    IncidentSocket.on(
      INCIDENT_SOCKET_EVENTS.PHYSICIAN_NOTE_DELETED,
      onNoteDeleted,
    );

    if (INCIDENT_SOCKET_EVENTS.ECG_UPLOADED) {
      IncidentSocket.on(INCIDENT_SOCKET_EVENTS.ECG_UPLOADED, onEcgUploaded);
    }

    INCIDENT_DETAIL_REFRESH_EVENTS.forEach((eventName) => {
      IncidentSocket.on(eventName, onCaseDetailRefresh);
    });

    return () => {
      IncidentSocket.off(
        INCIDENT_SOCKET_EVENTS.PHYSICIAN_ORDER_CREATED,
        onOrderCreated,
      );
      IncidentSocket.off(
        INCIDENT_SOCKET_EVENTS.PHYSICIAN_ORDER_UPDATED,
        onOrderUpdated,
      );
      IncidentSocket.off(
        INCIDENT_SOCKET_EVENTS.PHYSICIAN_ORDER_STATUS_UPDATED,
        onOrderStatusUpdated,
      );
      IncidentSocket.off(
        INCIDENT_SOCKET_EVENTS.PHYSICIAN_ORDER_DELETED,
        onOrderDeleted,
      );
      IncidentSocket.off(
        INCIDENT_SOCKET_EVENTS.PHYSICIAN_NOTE_CREATED,
        onNoteCreated,
      );
      IncidentSocket.off(
        INCIDENT_SOCKET_EVENTS.PHYSICIAN_NOTE_UPDATED,
        onNoteUpdated,
      );
      IncidentSocket.off(
        INCIDENT_SOCKET_EVENTS.PHYSICIAN_NOTE_DELETED,
        onNoteDeleted,
      );
      if (INCIDENT_SOCKET_EVENTS.ECG_UPLOADED) {
        IncidentSocket.off(INCIDENT_SOCKET_EVENTS.ECG_UPLOADED, onEcgUploaded);
      }
      INCIDENT_DETAIL_REFRESH_EVENTS.forEach((eventName) => {
        IncidentSocket.off(eventName, onCaseDetailRefresh);
      });
      IncidentSocket.leaveIncident();
    };
  }, [incidentId, fetchEventNotes, fetchEcgFiles]);

  // ═════════════════════════════════════════════
  // TRIAGE / PATHWAY ROUNDS
  // ═════════════════════════════════════════════
  const triageAssessmentItems = useMemo(() => {
    const items = [];
    (eventData?.triageAnswers || []).forEach((assessment) => {
      const round = assessment.roundNumber || assessment.round_number || 1;
      const pathwayCode =
        assessment.pathwayCode || assessment.pathway_code || "PATHWAY";
      const answers = assessment.answers || {};
      Object.entries(answers).forEach(([key, value]) => {
        if (
          key === "id" ||
          key === "pathwayCode" ||
          key === "pathway_code" ||
          key === "roundNumber" ||
          key === "round_number" ||
          key === "syncStatus" ||
          key === "created_at" ||
          key === "updated_at"
        )
          return;

        let question = "";
        let answer = "";
        if (value && typeof value === "object") {
          question =
            value.question ||
            key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          const rawAnswer =
            value.answer !== undefined ? value.answer : value.value;
          answer = formatAssessmentAnswer(
            rawAnswer !== undefined ? rawAnswer : value,
          );
          if (answer === "-" && value.text) answer = value.text;
        } else if (value !== null && value !== undefined) {
          question = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          answer = formatAssessmentAnswer(value);
        }
        if (question && answer !== "-" && answer !== "") {
          items.push({
            question,
            answer,
            roundNumber: round,
            pathwayCode,
            questionKey: key,
          });
        }
      });
    });
    return items;
  }, [eventData?.triageAnswers]);

  const pathwayRounds = useMemo(() => {
    const grouped = {};
    const sortedRounds = [];
    triageAssessmentItems.forEach((item) => {
      const round = item.roundNumber ?? 1;
      if (!sortedRounds.includes(round)) sortedRounds.push(round);
    });
    sortedRounds.sort((a, b) => a - b);
    const roundMap = {};
    sortedRounds.forEach((origRound, index) => {
      roundMap[origRound] = index + 1;
    });
    triageAssessmentItems.forEach((item) => {
      const seq = roundMap[item.roundNumber ?? 1] || 1;
      if (!grouped[seq]) grouped[seq] = [];
      grouped[seq].push(item);
    });
    return grouped;
  }, [triageAssessmentItems]);

  const primarySurveyRounds = useMemo(() => {
    const grouped = {};
    const sortedRounds = [];
    (eventData?.primarySurveyAnswers || []).forEach((survey) => {
      const round = survey.roundNumber || survey.round_number || 1;
      if (!sortedRounds.includes(round)) sortedRounds.push(round);
    });
    sortedRounds.sort((a, b) => a - b);
    const roundMap = {};
    sortedRounds.forEach((origRound, index) => {
      roundMap[origRound] = index + 1;
    });
    (eventData?.primarySurveyAnswers || []).forEach((survey) => {
      const seq = roundMap[survey.roundNumber || survey.round_number || 1] || 1;
      if (!grouped[seq]) grouped[seq] = { findings: [], qaItems: [] };
      const answers = survey.answers || {};
      if (typeof answers !== "object") return;
      Object.values(answers).forEach((answer) => {
        if (answer && typeof answer === "object") {
          const rawAnswer = answer.answer;
          const hasAnswer =
            rawAnswer != null && rawAnswer !== "" && rawAnswer !== "-";
          if (hasAnswer) {
            const q = answer.question || "";
            const a = formatAssessmentAnswer(rawAnswer);
            if (q && a !== "-") {
              grouped[seq].qaItems.push({ question: q, answer: a });
            }
          }
          if (hasAnswer && answer.finding) {
            grouped[seq].findings.push(answer.finding);
          }
        }
      });
    });
    return grouped;
  }, [eventData?.primarySurveyAnswers]);

  const primarySurveyTitles = useMemo(
    () =>
      new Set(
        (eventData?.assessmentSteps || [])
          .filter((step) => {
            const st = step.sourceType || step.source_type || "";
            return st === "PRIMARY_SURVEY" || st === "primary_survey";
          })
          .map((step) => step.title),
      ),
    [eventData?.assessmentSteps],
  );

  const primarySurveyInterventionsByRound = useMemo(() => {
    const grouped = {};
    const allSteps = (eventData?.assessmentSteps || []).filter((step) => {
      const st = step.sourceType || step.source_type || "";
      return st === "PRIMARY_SURVEY" || st === "primary_survey";
    });
    const sortedRounds = [];
    allSteps.forEach((step) => {
      const round = step.roundNumber ?? step.round_number ?? 1;
      if (!sortedRounds.includes(round)) sortedRounds.push(round);
    });
    sortedRounds.sort((a, b) => a - b);
    const roundMap = {};
    sortedRounds.forEach((origRound, index) => {
      roundMap[origRound] = index + 1;
    });
    allSteps.forEach((step) => {
      const seq = roundMap[step.roundNumber ?? step.round_number ?? 1] || 1;
      if (!grouped[seq]) grouped[seq] = [];
      grouped[seq].push(step);
    });
    return grouped;
  }, [eventData?.assessmentSteps]);

  const pathwayInterventionsByRound = useMemo(() => {
    const grouped = {};
    const allSteps = (eventData?.assessmentSteps || []).filter((step) => {
      const st = step.sourceType || step.source_type || "";
      if (st === "PRIMARY_SURVEY" || st === "primary_survey") return false;
      const isPathway = st === "PATHWAY" || st === "pathway";
      const isUntyped = !st || st === "";
      return isPathway || isUntyped;
    });
    const finalSteps = allSteps.filter(
      (step) => !primarySurveyTitles.has(step.title),
    );
    const sortedRounds = [];
    finalSteps.forEach((step) => {
      const round = step.roundNumber ?? step.round_number ?? 1;
      if (!sortedRounds.includes(round)) sortedRounds.push(round);
    });
    sortedRounds.sort((a, b) => a - b);
    const roundMap = {};
    sortedRounds.forEach((origRound, index) => {
      roundMap[origRound] = index + 1;
    });
    finalSteps.forEach((step) => {
      const seq = roundMap[step.roundNumber ?? step.round_number ?? 1] || 1;
      if (!grouped[seq]) grouped[seq] = [];
      grouped[seq].push(step);
    });
    return grouped;
  }, [eventData?.assessmentSteps, primarySurveyTitles]);

  const timelineItems = useMemo(
    () => eventData?.timeline || [],
    [eventData?.timeline],
  );
  const hasCollapsibleTimeline =
    timelineItems.length >= TIMELINE_COLLAPSE_THRESHOLD;
  const visibleTimelineItems =
    hasCollapsibleTimeline && !timelineExpanded ? [] : timelineItems;

  const dedupedNotes = useMemo(() => {
    const seen = new Map();
    notes.forEach((n) => seen.set(String(n.id), n));
    return Array.from(seen.values());
  }, [notes]);

  const dedupedOrders = useMemo(() => {
    const seen = new Map();
    orders.forEach((o) => seen.set(String(o.id), o));
    return Array.from(seen.values());
  }, [orders]);

  useEffect(() => {
    const groups = medicineOrderDraft?.groups;
    if (!groups || !groups.length) return;
    setOrderTitle(groups.map((g) => g.moduleTitle).join("\n"));

    const instructionLines = [];
    groups.forEach((g) => {
      instructionLines.push(g.moduleTitle);
      g.medicines.forEach((name) => instructionLines.push(name));
    });
    setOrderInstructions(instructionLines.join("\n"));

    setShowAddOrder(true);
  }, [medicineOrderDraft]);

  const hasCollapsibleNotes = dedupedNotes.length > NOTES_COLLAPSE_THRESHOLD;
  const visibleNotes =
    hasCollapsibleNotes && !notesExpanded ? [] : dedupedNotes;

  // ═════════════════════════════════════════════
  // SAVE / EDIT / DELETE NOTE
  // ═════════════════════════════════════════════
  const handleSaveNote = useCallback(async () => {
    if (!message.trim()) {
      showSnackbar("Please enter a note", "warning");
      return;
    }
    if (!physicianAssigned) {
      showSnackbar("Please assign a physician before adding notes", "warning");
      return;
    }
    if (editingNoteId) {
      const noteBeingEdited = notes.find((n) => n.id === editingNoteId);
      if (!noteBeingEdited || !canManageNote()) {
        showSnackbar(
          "Only the assigned physician can edit this note.",
          "error",
        );
        return;
      }
    }
    if (!incidentId) {
      showSnackbar("No incident ID found", "error");
      return;
    }
    const physicianId = getPhysicianId();
    if (!physicianId) {
      showSnackbar("Physician not assigned to this case.", "error");
      return;
    }

    const url = editingNoteId
      ? `${API_HOST}/api/physician-notes/${editingNoteId}`
      : `${API_HOST}/api/incidents/${incidentId}/physician-notes`;
    const method = editingNoteId ? "PATCH" : "POST";

    const payload = {
      physicianId,
      noteType: "diagnosis",
      content: message.trim(),
      isCritical: false,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
      }
      if (!response.ok) {
        throw new Error(
          `Server error (${response.status}): ${result?.message || responseText}`,
        );
      }
      const noteId = result?.data?.id || result?.id;
      if (!noteId) {
        showSnackbar(result?.message || "Failed to save note", "error");
        return;
      }

      showSnackbar(
        editingNoteId ? "Note updated successfully" : "Physician note saved",
        "success",
      );
      setMessage("");
      setEditingNoteId(null);

      await logCaseEvent(incidentId, {
        eventType: "PHYSICIAN_NOTE",
        eventTitle: payload.isCritical
          ? "Critical Physician Note"
          : "Physician Note",
        description: message.trim(),
        performedBy: physicianId,
        metadata: {
          noteId,
          noteType: payload.noteType,
          isCritical: payload.isCritical,
        },
      });

      const newNote = {
        id: noteId,
        content: message.trim(),
        note_type: payload.noteType,
        is_critical: payload.isCritical,
        created_at: result?.data?.created_at || new Date().toISOString(),
        updated_at: result?.data?.updated_at || new Date().toISOString(),
        physician_id: physicianId,
        incident_id: incidentId,
        sender: "physician",
      };

      setNotes((prev) => {
        if (editingNoteId) {
          return prev.map((n) =>
            String(n.id) === String(editingNoteId) ? { ...n, ...newNote } : n,
          );
        }
        return prev.some((n) => String(n.id) === String(newNote.id))
          ? prev
          : [...prev, newNote];
      });

      await fetchNotes();
      await fetchEventNotes();
    } catch (error) {
      console.error("SAVE NOTE ERROR =>", error);
      showSnackbar(error.message || "Failed to save note", "error");
    }
  }, [
    message,
    incidentId,
    physicianAssigned,
    editingNoteId,
    notes,
    canManageNote,
    getPhysicianId,
    fetchNotes,
    fetchEventNotes,
  ]);

  const handleDeleteNote = useCallback(
    (note) => {
      if (!canManageNote()) {
        showSnackbar(
          "Only the assigned physician can delete this note.",
          "error",
        );
        return;
      }
      if (!window.confirm("Are you sure you want to delete this note?")) return;

      (async () => {
        try {
          const response = await fetch(
            `${API_HOST}/api/physician-notes/${note.id}`,
            { method: "DELETE" },
          );
          const responseText = await response.text();
          let result;
          try {
            result = JSON.parse(responseText);
          } catch {
            setNotes((prev) => prev.filter((n) => n.id !== note.id));
            showSnackbar("Note removed from view", "success");
            return;
          }
          if (response.ok && result.success) {
            setNotes((prev) => prev.filter((n) => n.id !== note.id));
            const physicianId = getPhysicianId();
            await logCaseEvent(incidentId, {
              eventType: "PHYSICIAN_NOTE_DELETED",
              eventTitle: "Physician Note Deleted",
              description: note.content
                ? `Deleted note: ${note.content}`
                : "A physician note was deleted.",
              performedBy: physicianId,
              metadata: {
                noteId: note.id,
                deleted: true,
                originalContent: note.content || "",
              },
            });
            await fetchEventNotes();
            showSnackbar("Note deleted successfully", "success");
          } else {
            setNotes((prev) => prev.filter((n) => n.id !== note.id));
            showSnackbar("Note removed from view", "success");
          }
        } catch (error) {
          console.error("DELETE NOTE ERROR =>", error);
          setNotes((prev) => prev.filter((n) => n.id !== note.id));
          showSnackbar("Note removed from view", "success");
        }
      })();
    },
    [canManageNote, getPhysicianId, incidentId, fetchEventNotes],
  );

  const handleEditNote = useCallback(
    (note) => {
      if (!canManageNote()) {
        showSnackbar(
          "Only the assigned physician can edit this note.",
          "error",
        );
        return;
      }
      setMessage(note.content || "");
      setEditingNoteId(note.id);

      // Bring the note box into view and focus it so the physician can
      // start typing immediately instead of having to scroll up manually.
      requestAnimationFrame(() => {
        noteSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        const focusTimer = setTimeout(
          () => {
            const el = noteInputRef.current;
            if (el) {
              el.focus();
              // place the cursor at the end of the existing note text
              const len = el.value?.length ?? 0;
              try {
                el.setSelectionRange(len, len);
              } catch (_) {
                // setSelectionRange can throw on some input types; safe to ignore
              }
            }
          },
          300,
        );
        return () => clearTimeout(focusTimer);
      });
    },
    [canManageNote],
  );

  const handleCancelEdit = () => {
    setMessage("");
    setEditingNoteId(null);
  };

  // ═════════════════════════════════════════════
  // ORDERS
  // ═════════════════════════════════════════════
  const createOrder = useCallback(
    async (orderData) => {
      if (!physicianAssigned) {
        showSnackbar(
          "Physician is not assigned to this case. Please wait for assignment.",
          "warning",
        );
        return false;
      }
      if (!incidentId) {
        showSnackbar("No incident ID found", "error");
        return false;
      }
      const physicianId = getPhysicianId();
      if (!physicianId) {
        showSnackbar(
          "Physician not assigned to this case. Please assign a physician first.",
          "error",
        );
        return false;
      }

      try {
        const payload = {
          physicianId,
          orderType: orderData.orderType || "general",
          title: orderData.title,
          instructions: orderData.instructions || "",
        };

        const response = await fetch(
          `${API_HOST}/api/incidents/${incidentId}/physician-orders`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        const result = await response.json();

        if (result.success && result.data) {
          const newOrder = {
            id: result.data.id,
            title: result.data.title,
            instructions: result.data.instructions || "",
            status:
              result.data.status === "completed" ? "Completed" : "Pending",
            createdAt: result.data.created_at,
            orderType: result.data.order_type,
            physicianId: result.data.physician_id,
          };
          setOrders((prev) =>
            prev.some((o) => String(o.id) === String(newOrder.id))
              ? prev
              : [...prev, newOrder],
          );

          await logCaseEvent(incidentId, {
            eventType: "PHYSICIAN_ORDER",
            eventTitle: `Physician Order: ${newOrder.title || "Order"}`,
            description: newOrder.instructions || "",
            performedBy: physicianId,
            metadata: {
              orderId: newOrder.id,
              orderType: newOrder.orderType,
            },
          });
          await fetchEventNotes();

          showSnackbar("Order created successfully", "success");
          return true;
        } else {
          showSnackbar(result.message || "Failed to create order", "error");
          return false;
        }
      } catch (error) {
        showSnackbar(
          error.message || "Failed to create order. Please try again.",
          "error",
        );
        return false;
      }
    },
    [incidentId, physicianAssigned, getPhysicianId, fetchEventNotes],
  );

  const handleAddOrder = useCallback(async () => {
    if (!physicianAssigned) {
      showSnackbar(
        "Physician is not assigned to this case. Please wait for assignment.",
        "warning",
      );
      return;
    }
    if (!orderTitle.trim()) {
      showSnackbar("Please enter order title", "warning");
      return;
    }

    const success = await createOrder({
      orderType: "general",
      title: orderTitle.trim(),
      instructions: orderInstructions.trim(),
    });

    if (success) {
      setOrderTitle("");
      setOrderInstructions("");
      setShowAddOrder(false);
      onMedicineOrderConsumed?.();
    }
  }, [
    orderTitle,
    orderInstructions,
    physicianAssigned,
    createOrder,
    onMedicineOrderConsumed,
  ]);

  const deleteOrder = useCallback(
    async (orderId, orderSnapshot = null) => {
      const orderData =
        orderSnapshot || orders.find((o) => String(o.id) === String(orderId));
      try {
        const response = await fetch(
          `${API_HOST}/api/physician-orders/${orderId}`,
          { method: "DELETE" },
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const result = await response.json();
        if (result.success) {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
          if (incidentId && orderData) {
            await logCaseEvent(incidentId, {
              eventType: "PHYSICIAN_ORDER_DELETED",
              eventTitle: "Physician Order Deleted",
              description: orderData.title
                ? `Deleted order "${orderData.title}"`
                : "A physician order was deleted.",
              performedBy: getPhysicianId(),
              metadata: { orderId: orderData.id, deleted: true },
            });
            await fetchEventNotes();
          }
          showSnackbar("Order deleted successfully", "success");
        } else {
          showSnackbar(result.message || "Failed to delete order", "error");
        }
      } catch (error) {
        showSnackbar(error.message || "Failed to delete order", "error");
      }
    },
    [orders, incidentId, getPhysicianId, fetchEventNotes],
  );

  const handleDeleteOrder = useCallback(
    (id) => {
      const order = orders.find((o) => o.id === id);
      if (!order || !canManageOrder()) {
        showSnackbar(
          "Only the assigned physician can delete this order.",
          "error",
        );
        return;
      }
      if (!window.confirm("Are you sure you want to delete this order?"))
        return;
      deleteOrder(id, order);
    },
    [orders, canManageOrder, deleteOrder],
  );

  const updateOrder = useCallback(async (orderId, updateData) => {
    try {
      const payload = {};
      if (updateData.title !== undefined) payload.title = updateData.title;
      if (updateData.instructions !== undefined)
        payload.instructions = updateData.instructions;
      if (updateData.orderType !== undefined)
        payload.orderType = updateData.orderType;

      const response = await fetch(
        `${API_HOST}/api/physician-orders/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();
      if (result.success && result.data) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  title: result.data.title || o.title,
                  instructions: result.data.instructions || o.instructions,
                  orderType: result.data.order_type || o.orderType,
                }
              : o,
          ),
        );
        showSnackbar("Order updated successfully", "success");
        return true;
      }
      showSnackbar(result.message || "Failed to update order", "error");
      return false;
    } catch (error) {
      showSnackbar(error.message || "Failed to update order", "error");
      return false;
    }
  }, []);

  const handleOpenEditOrder = (order) => {
    if (!canManageOrder()) {
      showSnackbar("Only the assigned physician can edit this order.", "error");
      return;
    }
    setSelectedOrder(order);
    setEditTitle(order.title || "");
    setEditInstructions(order.instructions || "");
    setEditOrderOpen(true);
    setOrderActionOpen(false);
  };

  const handleSaveEditedOrder = async () => {
    if (!selectedOrder) return;
    const ok = await updateOrder(selectedOrder.id, {
      title: editTitle.trim(),
      instructions: editInstructions.trim(),
      orderType: selectedOrder.orderType || "general",
    });
    if (ok) {
      setEditOrderOpen(false);
      setSelectedOrder(null);
    }
  };

  // ── ECG open handler ──
  const handleOpenEcg = useCallback(
    (item) => {
      const rawUrl = item?.storage_url || item?.storageUrl || item?.url || "";
      const fullUrl = rawUrl.startsWith("http")
        ? rawUrl
        : `${FILES_BASE_URL}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

      if (onEcgClick) {
        onEcgClick(item, fullUrl);
      } else {
        window.open(fullUrl, "_blank", "noopener,noreferrer");
      }
    },
    [onEcgClick],
  );

  // ═════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════
  const cardSx = {
    background: darkMode ? "#111827" : "#FFFFFF",
    border: `1px solid ${darkMode ? "#1F2937" : "#E5E7EB"}`,
    borderRadius: "14px",
    p: "16px",
    mb: "14px",
  };
  const headingSx = {
    fontSize: "15px",
    fontWeight: 700,
    color: darkMode ? "#F8FAFC" : "#111827",
    mb: "12px",
  };
  const bodySx = {
    fontSize: "13px",
    lineHeight: 1.7,
    color: darkMode ? "#CBD5E1" : "#374151",
  };
  const inputSx = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      background: darkMode ? "#0F172A" : "#F9FAFB",
      color: darkMode ? "#F8FAFC" : "#111827",
      "& fieldset": { borderColor: darkMode ? "#334155" : "#D1D5DB" },
      "&:hover fieldset": { borderColor: "#0A5FFF" },
      "&.Mui-focused fieldset": { borderColor: "#0A5FFF", borderWidth: 2 },
    },
    "& .MuiInputBase-input::placeholder": {
      color: darkMode ? "#94A3B8" : "#64748B",
      opacity: 1,
    },
  };

  // ⭐ Note textarea while editing an existing note: stays highlighted with
  // a thicker blue border the whole time it's in edit mode (not just while
  // focused), so it's obvious to the physician which note is being edited —
  // same treatment as the native app's noteInput/noteSectionEditing style.
  const noteInputSx = {
    ...inputSx,
    "& .MuiOutlinedInput-root": {
      ...inputSx["& .MuiOutlinedInput-root"],
      "& fieldset": {
        borderColor: editingNoteId
          ? "#0A5FFF"
          : darkMode
            ? "#334155"
            : "#D1D5DB",
        borderWidth: editingNoteId ? 2 : 1,
      },
    },
  };

  if (loadingEvent && !eventData) {
    return (
      <LoadingSpinner
        variant="section"
        size="lg"
        message="Loading case details..."
      />
    );
  }

  const quickInfo = [
    [
      "Patient",
      `${eventData?.patientName || "—"}, ${eventData?.patientAge || "—"} yrs`,
    ],
    ["Flight", eventData?.flight || "—"],
    ["Route", eventData?.route || "—"],
    ["Seat", eventData?.seat || "—"],
    ["Aircraft", eventData?.aircraft || "—"],
    ["Status", eventData?.status || "—"],
    ["Physician", eventData?.physician?.trim() || "Not Assigned"],
    [
      "Date & Time",
      eventData?.dateTime ? new Date(eventData.dateTime).toLocaleString() : "—",
    ],
    ["Duration", eventData?.duration || "—"],
  ];

  const physicianBubbleSx = {
    alignSelf: "flex-start",
    background: darkMode ? "rgba(1, 93, 255, 0.12)" : "rgba(1, 93, 255, 0.08)",
    borderLeft: "3px solid #015DFF",
    borderRadius: "14px",
    p: "10px 12px",
    mb: "10px",
    maxWidth: "75%",
    minWidth: "30%",
  };
  const crewBubbleSx = {
    alignSelf: "flex-end",
    background: darkMode
      ? "rgba(245, 158, 11, 0.14)"
      : "rgba(245, 158, 11, 0.08)",
    borderRight: "3px solid #F59E0B",
    borderRadius: "14px",
    p: "10px 12px",
    mb: "10px",
    maxWidth: "75%",
    minWidth: "30%",
  };

  // ── ⭐ Recommended Medicines / Orders table column widths ──
  // Matched 1:1 to the native (React Native) app's table columns so both
  // platforms line up identically: No. / Title / Instructions / Status / Action
  const ORDERS_TABLE_COL = {
    no: "50px",
    title: "110px",
    status: "100px",
    action: "50px",
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: "4px", pb: "40px" }}
    >
      {/* ───── EVENT NOTES ───── */}
      <Box sx={cardSx}>
        <Typography sx={headingSx}>Event Notes</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "repeat(3, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: "10px",
          }}
        >
          {quickInfo.map(([label, value]) => (
            <Box
              key={label}
              sx={{
                background: darkMode ? "#0F172A" : "#F8FAFC",
                borderRadius: "10px",
                p: "10px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "10px",
                  color: darkMode ? "#94A3B8" : "#64748B",
                  mb: "4px",
                }}
              >
                {label}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: darkMode ? "#F8FAFC" : "#111827",
                  wordBreak: "break-word",
                }}
              >
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ───── CHIEF COMPLAINT ───── */}
      <Box sx={cardSx}>
        <Typography sx={headingSx}>Chief Complaint</Typography>
        <Typography sx={bodySx}>
          {eventData?.chiefComplaint
            ?.replaceAll("_", " ")
            ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "—"}
        </Typography>
      </Box>

      {/* ───── PRIMARY SURVEY FINDINGS ───── */}
      {Object.keys(primarySurveyRounds).length > 0 ? (
        Object.entries(primarySurveyRounds).map(([round, data]) => (
          <Box key={`ps-${round}`} sx={cardSx}>
            <Typography sx={headingSx}>
              Primary Survey Findings (Round {round})
            </Typography>
            {data.qaItems?.length > 0 ? (
              data.qaItems.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    mb: "10px",
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#015DFF",
                      mt: "6px",
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography sx={{ ...bodySx, fontWeight: 600 }}>
                      {item.question}
                    </Typography>
                    <Typography sx={{ ...bodySx, mt: "3px" }}>
                      Answer: {item.answer}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : data.findings?.length > 0 ? (
              data.findings.map((finding, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    mb: "8px",
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#015DFF",
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={bodySx}>{finding}</Typography>
                </Box>
              ))
            ) : (
              <Typography sx={bodySx}>No findings recorded</Typography>
            )}
          </Box>
        ))
      ) : (
        <Box sx={cardSx}>
          <Typography sx={headingSx}>Primary Survey Findings</Typography>
          <Typography sx={bodySx}>
            No primary survey findings recorded
          </Typography>
        </Box>
      )}

      {/* ───── PATHWAY ASSESSMENT ───── */}
      {Object.keys(pathwayRounds).length > 0 ? (
        Object.entries(pathwayRounds).map(([round, items]) => (
          <Box key={`pw-${round}`} sx={cardSx}>
            <Typography sx={headingSx}>
              Initial Assessment (Round {round})
            </Typography>
            {items.length > 0 ? (
              items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    mb: "10px",
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#015DFF",
                      mt: "6px",
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography sx={{ ...bodySx, fontWeight: 600 }}>
                      {item.question}
                    </Typography>
                    <Typography sx={{ ...bodySx, mt: "3px" }}>
                      Answer: {item.answer}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography sx={bodySx}>
                No assessment answers recorded
              </Typography>
            )}
          </Box>
        ))
      ) : (
        <Box sx={cardSx}>
          <Typography sx={headingSx}>Pathway Assessment</Typography>
          <Typography sx={bodySx}>No pathway assessment recorded</Typography>
        </Box>
      )}

      {/* ───── PATHWAY INTERVENTIONS ───── */}
      {Object.keys(pathwayInterventionsByRound).length > 0
        ? Object.entries(pathwayInterventionsByRound).map(([round, items]) => (
            <Box key={`pwi-${round}`} sx={cardSx}>
              <Typography sx={headingSx}>
                Initial Interventions (Round {round})
              </Typography>
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      mb: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#015DFF",
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={bodySx}>
                      {item.title || "Untitled Intervention"}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={bodySx}>
                  No Initial Interventions recorded
                </Typography>
              )}
            </Box>
          ))
        : (() => {
            const allInterventions = (eventData?.assessmentSteps || [])
              .filter((step) => {
                const st = step.sourceType || step.source_type || "";
                if (st === "PRIMARY_SURVEY" || st === "primary_survey")
                  return false;
                return true;
              })
              .filter((step) => !primarySurveyTitles.has(step.title));
            if (allInterventions.length === 0) return null;
            return (
              <Box sx={cardSx}>
                <Typography sx={headingSx}>Initial Interventions</Typography>
                {allInterventions.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      mb: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#015DFF",
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={bodySx}>
                      {item.title || "Untitled Intervention"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })()}

      {/* ───── PRIMARY SURVEY INTERVENTIONS ───── */}
      {Object.keys(primarySurveyInterventionsByRound).length > 0 &&
        Object.entries(primarySurveyInterventionsByRound).map(
          ([round, items]) => (
            <Box key={`psi-${round}`} sx={cardSx}>
              <Typography sx={headingSx}>
                Primary Survey Interventions (Round {round})
              </Typography>
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      mb: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#015DFF",
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={bodySx}>
                      {item.title || "Untitled Intervention"}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={bodySx}>
                  No primary survey interventions recorded
                </Typography>
              )}
            </Box>
          ),
        )}

      {/* ───── TIMELINE ───── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: hasCollapsibleTimeline ? "pointer" : "default",
          mt: "8px",
          mb: "4px",
          userSelect: "none",
        }}
        onClick={() => {
          if (hasCollapsibleTimeline) setTimelineExpanded((p) => !p);
        }}
      >
        <Typography
          sx={{
            fontSize: "15px",
            fontWeight: 700,
            color: darkMode ? "#F8FAFC" : "#111827",
          }}
        >
          Timeline of Events
          {hasCollapsibleTimeline ? ` (${timelineItems.length})` : ""}
        </Typography>
        {hasCollapsibleTimeline &&
          (timelineExpanded ? (
            <KeyboardArrowUpIcon
              sx={{ color: darkMode ? "#94A3B8" : "#6B7280" }}
            />
          ) : (
            <KeyboardArrowDownIcon
              sx={{ color: darkMode ? "#94A3B8" : "#6B7280" }}
            />
          ))}
      </Box>
      {hasCollapsibleTimeline && !timelineExpanded && (
        <Typography
          sx={{
            fontSize: "12px",
            color: darkMode ? "#94A3B8" : "#6B7280",
            mb: "12px",
          }}
        >
          Tap to show {timelineItems.length} events
        </Typography>
      )}

      {visibleTimelineItems.map((item, idx, arr) => {
        const dateTimeLabel = formatTimelineDateTime(
          item.createdAt || item.created_at,
        );
        const description = cleanTimelineDescription(item.description);
        return (
          <Box key={item.id || idx} sx={{ display: "flex", gap: "12px" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pt: "14px",
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#015DFF",
                }}
              />
              {idx !== arr.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    background: darkMode ? "#334155" : "#E5E7EB",
                    my: "2px",
                  }}
                />
              )}
            </Box>
            <Box sx={{ ...cardSx, flex: 1, mb: "12px", mt: 0 }}>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: darkMode ? "#F8FAFC" : "#111827",
                  mb: "4px",
                }}
              >
                {item.title}
              </Typography>
              {description && (
                <Typography
                  sx={{
                    ...bodySx,
                    mb: "6px",
                    color: darkMode ? "#CBD5E1" : "#4B5563",
                  }}
                >
                  {description}
                </Typography>
              )}
              <Typography
                sx={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#3B82F6",
                }}
              >
                {dateTimeLabel}
              </Typography>
            </Box>
          </Box>
        );
      })}

      {/* ───── DOCTOR NOTES ───── */}
      <Box
        ref={noteSectionRef}
        sx={{
          ...cardSx,
          ...(editingNoteId
            ? {
                border: "2px solid #0A5FFF",
                // keep the box the same visual size even though the
                // border got thicker, so nothing else in the layout shifts
                p: "15px",
              }
            : {}),
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "10px",
            cursor: hasCollapsibleNotes ? "pointer" : "default",
            userSelect: "none",
          }}
          onClick={() => {
            if (hasCollapsibleNotes) setNotesExpanded((p) => !p);
          }}
        >
          <Typography sx={{ ...headingSx, mb: 0 }}>
            Doctor Notes
            {dedupedNotes.length > 0 ? ` (${dedupedNotes.length})` : ""}
          </Typography>
          {hasCollapsibleNotes &&
            (notesExpanded ? (
              <KeyboardArrowUpIcon
                sx={{ color: darkMode ? "#94A3B8" : "#6B7280" }}
              />
            ) : (
              <KeyboardArrowDownIcon
                sx={{ color: darkMode ? "#94A3B8" : "#6B7280" }}
              />
            ))}
        </Box>

        <Box sx={{ position: "relative" }}>
          <TextField
            multiline
            minRows={4}
            placeholder="Write a note..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!physicianAssigned}
            inputRef={noteInputRef}
            onFocus={() => {
              if (!physicianAssigned) {
                showSnackbar(
                  "Please assign a physician before adding notes",
                  "warning",
                );
              }
            }}
            sx={noteInputSx}
          />
        </Box>

        {editingNoteId && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: "8px",
            }}
          >
            <Typography
              sx={{ fontSize: "13px", fontWeight: 600, color: "#F59E0B" }}
            >
              Editing note...
            </Typography>
            <Button
              onClick={handleCancelEdit}
              size="small"
              sx={{ textTransform: "none", color: "#0A5FFF" }}
            >
              Cancel
            </Button>
          </Box>
        )}

        <Button
          onClick={handleSaveNote}
          disabled={!physicianAssigned || !message.trim()}
          variant="contained"
          sx={{
            mt: "12px",
            background: "#0A5FFF",
            textTransform: "none",
            fontWeight: 700,
            "&:hover": { background: "#0847B8" },
            "&.Mui-disabled": { background: "#5b5d60", color: "#FFFFFF" },
          }}
        >
          {editingNoteId ? "Update Note" : "Save Note"}
        </Button>

        {!loadingNotes && dedupedNotes.length > 0 && (
          <Box
            sx={{
              mt: "16px",
              pt: "12px",
              borderTop: `1px solid ${darkMode ? "#1F2937" : "#E5E7EB"}`,
            }}
          >
            <Typography sx={headingSx}>Previous Notes</Typography>
            {hasCollapsibleNotes && !notesExpanded && (
              <Typography
                onClick={() => setNotesExpanded(true)}
                sx={{
                  fontSize: "12px",
                  color: darkMode ? "#94A3B8" : "#6B7280",
                  cursor: "pointer",
                  mb: "10px",
                }}
              >
                Tap to show {dedupedNotes.length} notes
              </Typography>
            )}

            {/* ⭐ WhatsApp-style thread: flex column so alignSelf on each
                bubble (physicianBubbleSx = flex-start / left,
                crewBubbleSx = flex-end / right) actually works. Without
                this flex wrapper, alignSelf has no effect and every
                bubble just stacks on the left. */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              {visibleNotes.map((note) => {
                const isCrew =
                  note.sender === "crew" ||
                  note.is_local ||
                  note.note_type === "crew_note" ||
                  note.note_type === "crew_reply";
                const noteManageable = !isCrew && canManageNote(note);
                const ts =
                  note.created_at ||
                  note.createdAt ||
                  note.date ||
                  note.timestamp;
                let formattedDate = "";
                if (ts) {
                  const d = new Date(ts);
                  if (!isNaN(d.getTime())) {
                    formattedDate = d.toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });
                  }
                }
                return (
                  <Box
                    key={String(note.id)}
                    sx={isCrew ? crewBubbleSx : physicianBubbleSx}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        mb: "6px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: 0.3,
                          textTransform: "uppercase",
                          color: isCrew ? "#F59E0B" : "#0A5FFF",
                        }}
                      >
                        {isCrew ? "Crew" : "Physician"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "10px",
                          color: darkMode ? "#94A3B8" : "#64748B",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formattedDate}
                        {note.is_critical && (
                          <span style={{ color: "#DC2626", fontWeight: 700 }}>
                            {" "}
                            • Critical
                          </span>
                        )}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        lineHeight: 1.5,
                        color: darkMode ? "#F8FAFC" : "#111827",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {note.content}
                    </Typography>
                    {noteManageable && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "6px",
                          mt: "8px",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleEditNote(note)}
                          sx={{
                            background: "rgba(16, 185, 129, 0.08)",
                            borderRadius: "6px",
                            p: "4px",
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16, color: "#10B981" }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNote(note)}
                          sx={{
                            background: "rgba(239, 68, 68, 0.08)",
                            borderRadius: "6px",
                            p: "4px",
                          }}
                        >
                          <DeleteOutlineOutlinedIcon
                            sx={{ fontSize: 16, color: "#EF4444" }}
                          />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* ───── RECOMMENDED MEDICINES + ADD ORDER ───── */}
      <Box sx={cardSx}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "12px",
          }}
        >
          <Typography sx={{ ...headingSx, mb: 0 }}>
            Recommended Medicines
          </Typography>
          <IconButton
            size="small"
            onClick={() => {
              if (!physicianAssigned) {
                showSnackbar(
                  "Please assign a physician before adding orders",
                  "warning",
                );
                return;
              }
              setShowAddOrder((p) => !p);
            }}
            sx={{
              background: "#0A5FFF",
              color: "#FFFFFF",
              width: 34,
              height: 34,
              "&:hover": { background: "#0847B8" },
            }}
          >
            {showAddOrder ? (
              <CloseIcon sx={{ fontSize: 20 }} />
            ) : (
              <AddIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Box>

        {showAddOrder && (
          <Box
            sx={{
              background: darkMode ? "#0F172A" : "#FFFFFF",
              border: `1px solid ${darkMode ? "#1E293B" : "#E2E8F0"}`,
              borderRadius: "14px",
              p: "14px",
              mb: "14px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: "14px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "8px",
                    background: "rgba(10,95,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AddIcon sx={{ fontSize: 18, color: "#0A5FFF" }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: darkMode ? "#F8FAFC" : "#111827",
                  }}
                >
                  Add Order
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => {
                  setShowAddOrder(false);
                  setOrderTitle("");
                  setOrderInstructions("");
                  onClearMedicineOrderDraft?.();
                }}
                sx={{ color: darkMode ? "#94A3B8" : "#64748B" }}
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            <Box sx={{ mb: "14px" }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  mb: "6px",
                  color: darkMode ? "#F8FAFC" : "#111827",
                }}
              >
                TITLE
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter order title"
                value={orderTitle}
                onChange={(e) => setOrderTitle(e.target.value)}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: darkMode ? "#111827" : "#F8FAFC",
                    color: darkMode ? "#CBD5E1" : "#374151",
                    borderRadius: "10px",
                    fontSize: "13px",
                    "& fieldset": {
                      borderColor: titleFocused
                        ? "#0A5FFF"
                        : darkMode
                          ? "#1E293B"
                          : "#E5E7EB",
                      borderWidth: titleFocused ? 1.5 : 1,
                    },
                  },
                  "& .MuiInputBase-input": { py: "10px", px: "12px" },
                  "& .MuiInputBase-input::placeholder": {
                    color: darkMode ? "#94A3B8" : "#64748B",
                    opacity: 1,
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: "16px" }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  mb: "6px",
                  color: darkMode ? "#F8FAFC" : "#111827",
                }}
              >
                INSTRUCTIONS
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Enter instructions"
                value={orderInstructions}
                onChange={(e) => setOrderInstructions(e.target.value)}
                onFocus={() => setInstructionsFocused(true)}
                onBlur={() => setInstructionsFocused(false)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: darkMode ? "#111827" : "#F8FAFC",
                    color: darkMode ? "#CBD5E1" : "#374151",
                    borderRadius: "10px",
                    fontSize: "13px",
                    "& fieldset": {
                      borderColor: instructionsFocused
                        ? "#0A5FFF"
                        : darkMode
                          ? "#1E293B"
                          : "#E5E7EB",
                      borderWidth: instructionsFocused ? 1.5 : 1,
                    },
                  },
                  "& .MuiInputBase-input": { py: "10px", px: "12px" },
                  "& .MuiInputBase-input::placeholder": {
                    color: darkMode ? "#94A3B8" : "#64748B",
                    opacity: 1,
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                height: 1,
                background: darkMode ? "#1E293B" : "#EEF1F5",
                mb: "14px",
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Button
                onClick={() => {
                  setShowAddOrder(false);
                  setOrderTitle("");
                  setOrderInstructions("");
                  onClearMedicineOrderDraft?.();
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: darkMode ? "#F8FAFC" : "#111827",
                  px: 2,
                  py: 1,
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddOrder}
                disabled={!orderTitle.trim() || !physicianAssigned}
                variant="contained"
                sx={{
                  background: "#0A5FFF",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                  borderRadius: "10px",
                  px: 2.5,
                  py: 1,
                  "&:hover": { background: "#0847B8" },
                  "&.Mui-disabled": {
                    background: "#5b5d60",
                    color: "#FFFFFF",
                  },
                }}
              >
                Add Order
              </Button>
            </Box>
          </Box>
        )}

        {loadingOrders ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={22} sx={{ color: "#0A5FFF" }} />
          </Box>
        ) : dedupedOrders.length > 0 ? (
          <TableContainer
            sx={{
              border: `1px solid ${darkMode ? "#1F2937" : "#E5E7EB"}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <Table size="small" sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow
                  sx={{
                    background: darkMode ? "#1E293B" : "#F3F4F6",
                    "& th": { height: "36px" },
                  }}
                >
                  {/* No. — matches native tableColNo (width: 50) */}
                  <TableCell
                    align="center"
                    sx={{
                      color: darkMode ? "#F8FAFC" : "#111827",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      py: "8px",
                      width: ORDERS_TABLE_COL.no,
                    }}
                  >
                    No.
                  </TableCell>

                  {/* Title — matches native tableColTitle (width: 110) */}
                  <TableCell
                    sx={{
                      color: darkMode ? "#F8FAFC" : "#111827",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      py: "8px",
                      width: ORDERS_TABLE_COL.title,
                    }}
                  >
                    Title
                  </TableCell>

                  {/* Instructions — matches native tableColInstructions (flex: 1) */}
                  <TableCell
                    sx={{
                      color: darkMode ? "#F8FAFC" : "#111827",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      py: "8px",
                      minWidth: "60px",
                    }}
                  >
                    Instructions
                  </TableCell>

                  {/* Status — matches native tableColStatus (width: 100) */}
                  <TableCell
                    align="center"
                    sx={{
                      color: darkMode ? "#F8FAFC" : "#111827",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      py: "8px",
                      width: ORDERS_TABLE_COL.status,
                    }}
                  >
                    Status
                  </TableCell>

                  {/* Action — matches native tableColAction (width: 50) */}
                  <TableCell
                    align="center"
                    sx={{
                      color: darkMode ? "#F8FAFC" : "#111827",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      py: "8px",
                      width: ORDERS_TABLE_COL.action,
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dedupedOrders.map((order, index) => {
                  const orderManageable = canManageOrder(order);

                  const titleModules = (order.title || "")
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const instructionModules = (order.instructions || "")
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);

                  const buildDisplayRows = () => {
                    if (
                      titleModules.length === 0 &&
                      instructionModules.length > 0
                    ) {
                      return instructionModules.map((instr) => ({
                        title: "Unassigned Module",
                        instructions: [instr],
                      }));
                    }
                    if (
                      titleModules.length > 0 &&
                      instructionModules.length === 0
                    ) {
                      return titleModules.map((t) => ({
                        title: t,
                        instructions: [],
                      }));
                    }

                    const headingOf = (line) => {
                      const trimmed = (line || "").trim();
                      if (!trimmed) return null;
                      return (
                        titleModules.find((t) => t.trim() === trimmed) || null
                      );
                    };

                    const usesHeadings = instructionModules.some((line) =>
                      headingOf(line),
                    );

                    const rows = [];
                    if (usesHeadings) {
                      let currentTitle = null;
                      instructionModules.forEach((line) => {
                        const heading = headingOf(line);
                        if (heading) {
                          currentTitle = heading;
                          return;
                        }
                        rows.push({
                          title:
                            currentTitle ||
                            titleModules[0] ||
                            "Unassigned Module",
                          instructions: [line],
                        });
                      });
                    } else {
                      const maxLen = Math.max(
                        titleModules.length,
                        instructionModules.length,
                      );
                      for (let i = 0; i < maxLen; i++) {
                        const title =
                          i < titleModules.length
                            ? titleModules[i]
                            : titleModules[titleModules.length - 1] ||
                              "Unassigned Module";
                        let instruction =
                          i < instructionModules.length
                            ? instructionModules[i]
                            : "—";
                        const titlePrefix = title + ":";
                        if (instruction.startsWith(titlePrefix)) {
                          instruction = instruction
                            .substring(titlePrefix.length)
                            .trim();
                        }
                        if (!instruction) continue;
                        rows.push({ title, instructions: [instruction] });
                      }
                    }
                    if (rows.length === 0) {
                      titleModules.forEach((t) =>
                        rows.push({ title: t, instructions: [] }),
                      );
                    }
                    return rows;
                  };

                  const displayRows = buildDisplayRows();

                  return (
                    <TableRow
                      key={String(order.id)}
                      sx={{
                        background: darkMode ? "#111827" : "#FFFFFF",
                        // NOTE: no blanket verticalAlign here on purpose —
                        // it used to force every <td> to "top" and, because
                        // that rule's selector is more specific than the
                        // per-cell sx below, it silently overrode the
                        // "middle" alignment set on the No./Status/Action
                        // cells. Each TableCell now sets its own
                        // verticalAlign (Title/Instructions = "top",
                        // No./Status/Action = "middle") and that now wins.
                        "& td": {
                          borderBottom: `1px solid ${
                            darkMode ? "#1F2937" : "#E5E7EB"
                          }`,
                          py: "8px",
                          px: "10px",
                        },
                      }}
                    >
                      {/* No. — matches native tableColNo */}
                      <TableCell
                        align="center"
                        sx={{
                          verticalAlign: "middle",
                          color: darkMode ? "#F8FAFC" : "#111827",
                          fontSize: "10px",
                          fontWeight: 700,
                          width: ORDERS_TABLE_COL.no,
                        }}
                      >
                        {index + 1}
                      </TableCell>

                      {/* Title — matches native tableColTitle */}
                      <TableCell
                        sx={{
                          width: ORDERS_TABLE_COL.title,
                          verticalAlign: "top",
                        }}
                      >
                        {displayRows.map((r, i) => (
                          <Box
                            key={i}
                            sx={{
                              minHeight: 40,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              mb: i < displayRows.length - 1 ? "10px" : 0,
                            }}
                          >
                            <Typography
                              noWrap={false}
                              sx={{
                                fontSize: "12px",
                                fontWeight: 500,
                                lineHeight: 1.4,
                                color: darkMode ? "#F8FAFC" : "#111827",
                                wordBreak: "break-word",
                              }}
                            >
                              {r.title}
                            </Typography>
                          </Box>
                        ))}
                      </TableCell>

                      {/* Instructions — matches native tableColInstructions */}
                      <TableCell
                        sx={{
                          minWidth: "60px",
                          maxWidth: "300px",
                          verticalAlign: "top",
                        }}
                      >
                        {displayRows.map((r, ri) =>
                          r.instructions.length ? (
                            r.instructions.map((instr, ii) => (
                              <Box
                                key={`${ri}-${ii}`}
                                sx={{
                                  minHeight: 40,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-start",
                                  mb:
                                    ri === displayRows.length - 1 &&
                                    ii === r.instructions.length - 1
                                      ? 0
                                      : "10px",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: "12px",
                                    lineHeight: 1.4,
                                    color: darkMode ? "#CBD5E1" : "#374151",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {instr}
                                </Typography>
                              </Box>
                            ))
                          ) : (
                            <Box
                              key={`${ri}-empty`}
                              sx={{
                                minHeight: 40,
                                display: "flex",
                                alignItems: "center",
                                mb: "10px",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  lineHeight: 1.4,
                                  color: darkMode ? "#CBD5E1" : "#374151",
                                }}
                              >
                                —
                              </Typography>
                            </Box>
                          ),
                        )}
                      </TableCell>

                      {/* Status — matches native tableColStatus, centered horizontally & vertically */}
                      <TableCell
                        align="center"
                        sx={{
                          width: ORDERS_TABLE_COL.status,
                          textAlign: "center",
                          verticalAlign: "middle",
                          p: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            py: "10px",
                          }}
                        >
                          <Chip
                            label={order.status}
                            size="small"
                            sx={{
                              background:
                                order.status === "Completed"
                                  ? "#DCFCE7"
                                  : "#FEF3C7",
                              color:
                                order.status === "Completed"
                                  ? "#166534"
                                  : "#92400E",
                              fontSize: "9px",
                              fontWeight: 700,
                              height: 22,
                              minWidth: 48,
                            }}
                          />
                        </Box>
                      </TableCell>

                      {/* Action — matches native tableColAction, centered horizontally & vertically */}
                      <TableCell
                        align="center"
                        sx={{
                          width: ORDERS_TABLE_COL.action,
                          textAlign: "center",
                          verticalAlign: "middle",
                          p: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            py: "10px",
                          }}
                        >
                          {orderManageable ? (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedOrderForAction(order);
                                setOrderActionOpen(true);
                              }}
                            >
                              <MoreVertIcon
                                sx={{
                                  color: darkMode ? "#F8FAFC" : "#111827",
                                  fontSize: 20,
                                }}
                              />
                            </IconButton>
                          ) : null}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography
            sx={{ fontSize: "13px", color: darkMode ? "#94A3B8" : "#64748B" }}
          >
            No orders added yet.
          </Typography>
        )}
      </Box>

      {/* ───── COMMUNICATION SUMMARY ───── */}
      <Box sx={cardSx}>
        <Typography sx={headingSx}>Communication Summary</Typography>
        <Typography sx={bodySx}>
          {(() => {
            const currentOrderIds = new Set(orders.map((o) => String(o.id)));
            const currentNoteIds = new Set(notes.map((n) => String(n.id)));
            const filtered = timelineItems.filter((item) => {
              if (
                item.title?.includes("Physician Order") ||
                item.eventType === "PHYSICIAN_ORDER" ||
                item.eventType === "PHYSICIAN_ORDER_DELETED"
              ) {
                if (item.eventType === "PHYSICIAN_ORDER_DELETED") return false;
                const orderId = item.metadata?.orderId || item.orderId;
                if (orderId && !currentOrderIds.has(String(orderId)))
                  return false;
                return true;
              }
              if (
                item.title?.includes("Physician Note") ||
                item.eventType === "PHYSICIAN_NOTE" ||
                item.eventType === "PHYSICIAN_NOTE_DELETED"
              ) {
                if (item.eventType === "PHYSICIAN_NOTE_DELETED") return false;
                const noteId = item.metadata?.noteId || item.noteId;
                if (noteId && !currentNoteIds.has(String(noteId))) return false;
                return true;
              }
              return true;
            });
            const summary = filtered
              .map((item) => {
                const description = item.description
                  ?.replace(/pathway\s+[a-z]\s+selected\.?/gi, "")
                  ?.replace(/pathway\s+[a-z]\s+assessment\s+initiated\.?/gi, "")
                  ?.trim();
                if (
                  item.eventType === "PHYSICIAN_ORDER" &&
                  item.metadata?.orderTitle
                )
                  return `${item.title}: ${item.metadata.orderTitle}`;
                if (
                  item.eventType === "PHYSICIAN_NOTE" &&
                  item.metadata?.notePreview
                )
                  return `${item.title}: ${item.metadata.notePreview}`;
                return description || item.title || "";
              })
              .filter(Boolean)
              .join(" ");
            return summary || "No communication summary available";
          })()}
        </Typography>
      </Box>

      {/* ───── ⭐ ECG REPORTS ⭐ ───── */}
      <Box sx={cardSx}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "12px",
          }}
        >
          <Typography sx={{ ...headingSx, mb: 0 }}>
            ECG Reports
            {ecgFiles.length > 0 ? ` (${ecgFiles.length})` : ""}
          </Typography>
          <Tooltip title="Refresh" arrow>
            <span>
              <IconButton
                size="small"
                onClick={fetchEcgFiles}
                disabled={loadingEcg}
                sx={{
                  color: darkMode ? "#94A3B8" : "#64748B",
                  "&:hover": { color: "#0A5FFF" },
                }}
              >
                {loadingEcg ? (
                  <CircularProgress size={16} sx={{ color: "#0A5FFF" }} />
                ) : (
                  <RefreshIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {loadingEcg && ecgFiles.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={22} sx={{ color: "#0A5FFF" }} />
          </Box>
        ) : ecgFiles.length > 0 ? (
          ecgFiles.map((item, index) => {
            const fileName =
              item?.file_name ||
              item?.fileName ||
              item?.name ||
              `ECG Report ${index + 1}`;
            const uploadedAt =
              item?.created_at || item?.createdAt || item?.uploaded_at || null;

            return (
              <Box
                key={item?.id || item?.ecgId || index}
                onClick={() => handleOpenEcg(item)}
                sx={{
                  p: "12px",
                  borderRadius: "10px",
                  mb: "8px",
                  background: "rgba(10,95,255,0.12)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  transition: "background 0.2s, transform 0.15s",
                  "&:hover": {
                    background: "rgba(10,95,255,0.2)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <DescriptionOutlinedIcon
                  sx={{ color: "#0A5FFF", fontSize: 20, flexShrink: 0 }}
                />
                <Typography
                  sx={{
                    color: "#0A5FFF",
                    fontWeight: 600,
                    fontSize: "13px",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fileName}
                </Typography>
                {uploadedAt && (
                  <Typography
                    sx={{
                      color: darkMode ? "#94A3B8" : "#64748B",
                      fontSize: "11px",
                      flexShrink: 0,
                    }}
                  >
                    {new Date(uploadedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </Typography>
                )}
                <OpenInNewIcon
                  sx={{
                    color: darkMode ? "#94A3B8" : "#64748B",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                />
              </Box>
            );
          })
        ) : (
          <Box
            sx={{
              py: 3,
              px: 2,
              borderRadius: "10px",
              background: darkMode ? "#0F172A" : "#F8FAFC",
              textAlign: "center",
            }}
          >
            <DescriptionOutlinedIcon
              sx={{
                color: darkMode ? "#475569" : "#CBD5E1",
                fontSize: 32,
                mb: 0.5,
              }}
            />
            <Typography
              sx={{
                fontSize: "13px",
                color: darkMode ? "#94A3B8" : "#64748B",
              }}
            >
              No ECG reports available
            </Typography>
          </Box>
        )}
      </Box>

      {/* AI Event Summary (optional) */}
      {/* {aiSummaryProp && (
        <AiSummaryCard aiSummary={aiSummaryProp} darkMode={darkMode} />
      )} */}

      {/* Back button */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", mt: "8px" }}>
        <Button
          onClick={onBack}
          variant="contained"
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
            background: "#015DFF",
            color: "#FFFFFF",
            px: 3,
            py: 1.2,
            "&:hover": { background: "#0847B8" },
          }}
        >
          Back
        </Button>
      </Box>

      {/* ───────── ORDER ACTION MENU ───────── */}
      <Dialog
        open={orderActionOpen}
        onClose={() => setOrderActionOpen(false)}
        PaperProps={{
          sx: {
            background: darkMode ? "#1E293B" : "#FFFFFF",
            color: darkMode ? "#F8FAFC" : "#111827",
            borderRadius: "14px",
            minWidth: 260,
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${darkMode ? "#334155" : "#E2E8F0"}`,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "14px" }}>
              Order Actions
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                mt: 0.5,
                color: darkMode ? "#CBD5E1" : "#374151",
              }}
            >
              {selectedOrderForAction?.title}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.5,
              cursor: "pointer",
              "&:hover": { background: "rgba(10,95,255,0.08)" },
            }}
            onClick={() => {
              setViewOrderOpen(true);
              setOrderActionOpen(false);
            }}
          >
            <VisibilityIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: "13px" }}>View Details</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.5,
              cursor: "pointer",
              "&:hover": { background: "rgba(10,95,255,0.08)" },
            }}
            onClick={() => handleOpenEditOrder(selectedOrderForAction)}
          >
            <EditIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: "13px" }}>Edit Order</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.5,
              cursor: "pointer",
              borderTop: `1px solid ${darkMode ? "#334155" : "#E2E8F0"}`,
              "&:hover": { background: "rgba(239,68,68,0.08)" },
            }}
            onClick={() => {
              const id = selectedOrderForAction?.id;
              setOrderActionOpen(false);
              if (id) handleDeleteOrder(id);
            }}
          >
            <DeleteOutlineOutlinedIcon
              sx={{ fontSize: 18, color: "#EF4444" }}
            />
            <Typography sx={{ fontSize: "13px", color: "#EF4444" }}>
              Delete Order
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              px: 2,
              py: 1.5,
              borderTop: `1px solid ${darkMode ? "#334155" : "#E2E8F0"}`,
              cursor: "pointer",
            }}
            onClick={() => setOrderActionOpen(false)}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
              Cancel
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog
        open={viewOrderOpen}
        onClose={() => setViewOrderOpen(false)}
        PaperProps={{
          sx: {
            background: darkMode ? "#1E293B" : "#FFFFFF",
            color: darkMode ? "#F8FAFC" : "#111827",
            borderRadius: "16px",
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "16px" }}>
          Order Details
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 700,
                mb: 0.5,
                color: darkMode ? "#94A3B8" : "#64748B",
              }}
            >
              TITLE
            </Typography>
            <Typography sx={{ fontSize: "14px" }}>
              {selectedOrderForAction?.title}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 700,
                mb: 0.5,
                color: darkMode ? "#94A3B8" : "#64748B",
              }}
            >
              INSTRUCTIONS
            </Typography>
            <Typography sx={{ fontSize: "14px" }}>
              {selectedOrderForAction?.instructions ||
                "No instructions provided"}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 700,
                mb: 0.5,
                color: darkMode ? "#94A3B8" : "#64748B",
              }}
            >
              STATUS
            </Typography>
            <Chip
              label={selectedOrderForAction?.status}
              size="small"
              sx={{
                background:
                  selectedOrderForAction?.status === "Completed"
                    ? "#DCFCE7"
                    : "#FEF3C7",
                color:
                  selectedOrderForAction?.status === "Completed"
                    ? "#166534"
                    : "#92400E",
                fontWeight: 700,
              }}
            />
          </Box>
          {selectedOrderForAction?.createdAt && (
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  mb: 0.5,
                  color: darkMode ? "#94A3B8" : "#64748B",
                }}
              >
                CREATED
              </Typography>
              <Typography sx={{ fontSize: "13px" }}>
                {new Date(selectedOrderForAction.createdAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setViewOrderOpen(false)}
            variant="contained"
            sx={{
              background: "#0A5FFF",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              "&:hover": { background: "#0847B8" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog
        open={editOrderOpen}
        onClose={() => setEditOrderOpen(false)}
        PaperProps={{
          sx: {
            background: darkMode ? "#1E293B" : "#FFFFFF",
            color: darkMode ? "#F8FAFC" : "#111827",
            borderRadius: "16px",
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "16px" }}>
          Edit Order
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ ...inputSx, mt: 1, mb: 2 }}
          />
          <TextField
            label="Instructions"
            fullWidth
            multiline
            minRows={3}
            value={editInstructions}
            onChange={(e) => setEditInstructions(e.target.value)}
            sx={inputSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setEditOrderOpen(false)}
            sx={{
              textTransform: "none",
              color: darkMode ? "#94A3B8" : "#64748B",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEditedOrder}
            disabled={!editTitle.trim()}
            variant="contained"
            sx={{
              background: "#0A5FFF",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              "&:hover": { background: "#0847B8" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventSummaryPanel;