import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import {
  Box,
  Typography,
  Avatar,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Select,
  InputBase,
  Menu,
  MenuItem,
  Checkbox,
  TableContainer,
  TableSortLabel,
  TablePagination,
  TextField,
  Snackbar,
  Alert,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import Popover from "@mui/material/Popover";

import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { Dialog, DialogContent } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PeopleIcon from "@mui/icons-material/People";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CallIcon from "@mui/icons-material/Call";
import CloseIcon from "@mui/icons-material/Close";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

// SVG assets
import {
  EventCardIcon,
  PatientCardIcon,
  PatientAssignCardIcon,
  CriticalCasesIcon,
  VisibilityIcon,
  ActionIcon2,
  ActionIcon3,
  ActionIcon4,
  FilterSortIcon,
  ExportIcon,
  CalendarTodayIcon,
  ViewVitalIcon,
  ViewReportIcon,
  ShareIcon,
} from "../../assets/Assets";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShareReportDialog from "./ShareReportDialog";
import ViewReport from "./ViewReport";
import ViewVitalTrends from "./ViewVitalTrends";
import Action2 from "../Response/Action2";
import Action3 from "../Response/Action3";

const SidelistTabIcon = ({ isActive }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ color: isActive ? "rgba(15, 38, 70, 1)" : "#94A3B8" }}
  >
    <path
      d="M16 11V9H22V11H16ZM6.175 10.825C5.39167 10.0417 5 9.1 5 8C5 6.9 5.39167 5.95833 6.175 5.175C6.95833 4.39167 7.9 4 9 4C10.1 4 11.0417 4.39167 11.825 5.175C12.6083 5.95833 13 6.9 13 8C13 9.1 12.6083 10.0417 11.825 10.825C11.0417 11.6083 10.1 12 9 12C7.9 12 6.95833 11.6083 6.175 10.825ZM1 20V17.2C1 16.6333 1.14583 16.1125 1.4375 15.6375C1.72917 15.1625 2.11667 14.8 2.6 14.55C3.63333 14.0333 4.68333 13.6458 5.75 13.3875C6.81667 13.1292 7.9 13 9 13C10.1 13 11.1833 13.1292 12.25 13.3875C13.3167 13.6458 14.3667 14.0333 15.4 14.55C15.8833 14.8 16.2708 15.1625 16.5625 15.6375C16.8542 16.1125 17 16.6333 17 17.2V20H1ZM3 18H15V17.2C15 17.0167 14.9542 16.85 14.8625 16.7C14.7708 16.55 14.65 16.4333 14.5 16.35C13.6 15.9 12.6917 15.5625 11.775 15.3375C10.8583 15.1125 9.93333 15 9 15C8.06667 15 7.14167 15.1125 6.225 15.3375C5.30833 15.5625 4.4 15.9 3.5 16.35C3.35 16.55 3.22917 16.65 3.1375 16.7C3.04583 16.85 3 17.0167 3 17.2V18ZM10.4125 9.4125C10.8042 9.02083 11 8.55 11 8C11 7.45 10.8042 6.97917 10.4125 6.5875C10.0208 6.19583 9.55 6 9 6C8.45 6 7.97917 6.19583 7.5875 6.5875C7.19583 6.97917 7 7.45 7 8C7 8.55 7.19583 9.02083 7.5875 9.4125C7.97917 9.80417 8.45 10 9 10C9.55 10 10.0208 9.80417 10.4125 9.4125Z"
      fill="currentColor"
    />
  </svg>
);

const MyAppointmentsIcon = ({ isActive }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke={isActive ? "rgba(15, 38, 70, 1)" : "#94A3B8"}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Patient Profile */}
    <path d="M11 19v-1a3 3 0 0 0-3-3H3a3 3 0 0 0-3 3v1" />
    <circle cx="5.5" cy="9.5" r="2.5" />
    {/* Clock Circle Intersecting */}
    <circle cx="16" cy="11" r="5" />
    {/* Clock Hands */}
    <polyline points="16 8 16 11 18 11" />
  </svg>
);

// Static patient data
const staticPatientData = [
  {
    id: "enc_1",
    patientDbId: "pat_101",
    encounterId: "enc_1",
    room: "AA1234",
    bed: "A15",
    name: "Jennie M",
    age: "35y",
    gender: "Female",
    mrn: "719471345",
    status: "Critical",
    location: "SYD → LAX",
    physician: "",
    providerId: "",
    providerRole: "",
    resident: "Julia R",
    residentId: "res_1",
    residentRole: "RESIDENT",
    visitStatus: "",
    seenByRole: "",
    visitType: "IP",
    dos: "2026-06-02",
    fin: "FIN12345",
    facesheet: "",
    noteStatus: "Final",
    is_sidelist: false,
    sidelist_reason: "",
    is_marked: false,
    updated_at: "2026-06-02T10:30:00Z",
    created_at: "2026-06-01T08:00:00Z",
    duration: "Just now",
  },
  {
    id: "enc_2",
    patientDbId: "pat_102",
    encounterId: "enc_2",
    room: "AA1234",
    bed: "A15",
    name: "Illy",
    age: "45y",
    gender: "male",
    mrn: "719471345",
    status: "Critical",
    location: "SYD → LAX",
    physician: "Alex Tobar",
    providerId: "prov_2",
    providerRole: "DOCTOR",
    resident: "Julia R",
    residentId: "res_1",
    residentRole: "RESIDENT",
    visitStatus: "Seen",
    seenByRole: "PHYSICIAN",
    visitType: "IP",
    dos: "2026-06-02",
    fin: "FIN12346",
    facesheet: "",
    noteStatus: "Draft",
    is_sidelist: false,
    sidelist_reason: "",
    is_marked: false,
    updated_at: "2026-06-02T09:15:00Z",
    created_at: "2026-06-01T09:00:00Z",
    duration: "Just now",
  },
  {
    id: "enc_3",
    patientDbId: "pat_103",
    encounterId: "enc_3",
    room: "AA1234",
    bed: "A15",
    name: "Lisha Cook",
    age: "45y",
    gender: "male",
    mrn: "719471345",
    status: "Critical",
    location: "SYD → LAX",
    physician: "Alex Tobar",
    providerId: "prov_3",
    providerRole: "PHYSICIAN",
    resident: "Julia R",
    residentId: "res_2",
    residentRole: "RESIDENT",
    visitStatus: "Seen",
    seenByRole: "PHYSICIAN",
    visitType: "IP",
    dos: "2026-06-02",
    fin: "FIN12347",
    facesheet: "",
    noteStatus: "",
    is_sidelist: false,
    sidelist_reason: "",
    is_marked: false,
    updated_at: "2026-06-02T11:00:00Z",
    created_at: "2026-06-01T10:00:00Z",
    duration: "Just now",
  },
  {
    id: "enc_4",
    patientDbId: "pat_104",
    encounterId: "enc_4",
    room: "AA1234",
    bed: "A15",
    name: "Lisha Cook",
    age: "45y",
    gender: "male",
    mrn: "719471345",
    status: "Critical",
    location: "SYD → LAX",
    physician: "Alex Tobar",
    providerId: "prov_4",
    providerRole: "PHYSICIAN",
    resident: "Julia R",
    residentId: "",
    residentRole: "",
    visitStatus: "Seen",
    seenByRole: "PHYSICIAN",
    visitType: "IP",
    dos: "2026-06-02",
    fin: "FIN12348",
    facesheet: "",
    noteStatus: "",
    is_sidelist: false,
    sidelist_reason: "",
    is_marked: false,
    updated_at: "2026-06-02T08:00:00Z",
    created_at: "2026-06-01T11:00:00Z",
    duration: "Just now",
  },
  {
    id: "enc_5",
    patientDbId: "pat_105",
    encounterId: "enc_5",
    room: "AA1234",
    bed: "A15",
    name: "Lisha Cook",
    age: "45y",
    gender: "male",
    mrn: "719471345",
    status: "Critical",
    location: "SYD → LAX",
    physician: "Alex Tobar",
    providerId: "prov_4",
    providerRole: "PHYSICIAN",
    resident: "Julia R",
    residentId: "res_3",
    residentRole: "RESIDENT",
    visitStatus: "Seen",
    seenByRole: "PHYSICIAN",
    visitType: "IP",
    dos: "2026-06-02",
    fin: "FIN12349",
    facesheet: "",
    noteStatus: "Final",
    is_sidelist: false,
    sidelist_reason: "",
    is_marked: false,
    updated_at: "2026-06-02T12:00:00Z",
    created_at: "2026-06-01T12:00:00Z",
    duration: "Just now",
  },
  {
    id: "enc_6",
    patientDbId: "pat_106",
    encounterId: "enc_6",
    room: "AA1234",
    bed: "A15",
    name: "Lisha Cook",
    age: "45y",
    gender: "male",
    mrn: "719471345",
    status: "Critical",
    location: "SYD → LAX",
    physician: "Alex Tobar",
    providerId: "prov_5",
    providerRole: "DOCTOR",
    resident: "Julia R",
    residentId: "",
    residentRole: "",
    visitStatus: "Seen",
    seenByRole: "PHYSICIAN",
    visitType: "IP",
    dos: "2026-06-02",
    fin: "FIN12350",
    facesheet: "",
    noteStatus: "Draft",
    is_sidelist: false,
    sidelist_reason: "",
    is_marked: false,
    updated_at: "2026-06-02T10:00:00Z",
    created_at: "2026-06-01T13:00:00Z",
    duration: "Just now",
  },
  {
    id: "enc_1",
    patientDbId: "pat_101",
    encounterId: "enc_1",
    room: "AA1234",
    bed: "A15",
    name: "Jennie M",
    age: "35y",
    gender: "Female",
    mrn: "719471345",
    status: "Critical",
    location: "SYD → LAX",
    physician: "",
    providerId: "",
    providerRole: "",
    resident: "Julia R",
    residentId: "res_1",
    residentRole: "RESIDENT",
    visitStatus: "",
    seenByRole: "",
    visitType: "IP",
    dos: "2026-06-02",
    fin: "FIN12345",
    facesheet: "",
    noteStatus: "Final",
    is_sidelist: false,
    sidelist_reason: "",
    is_marked: false,
    updated_at: "2026-06-02T10:30:00Z",
    created_at: "2026-06-01T08:00:00Z",
    duration: "Just now",
  },
];

// Static provider options for assign modal
const staticProviderOptions = [
  {
    id: "prov_1",
    name: "Alex Tobar",
    specialty: "Flight Physician",
    status: "Available",
    isProvider: true,
    isPcpPhysician: true,
    isAdmittingPhysician: false,
    isResident: false,
  },
  {
    id: "prov_2",
    name: "Dr. James Oktar",
    specialty: "Aviation Medicine",
    status: "Available",
    isProvider: true,
    isPcpPhysician: false,
    isAdmittingPhysician: true,
    isResident: false,
  },
  {
    id: "prov_3",
    name: "Dr. Sarah Malik",
    specialty: "Emergency Medicine",
    status: "On Duty",
    isProvider: true,
    isPcpPhysician: true,
    isAdmittingPhysician: false,
    isResident: false,
  },
  {
    id: "prov_4",
    name: "Dr. Kevin Ross",
    specialty: "Critical Care",
    status: "Available",
    isProvider: true,
    isPcpPhysician: false,
    isAdmittingPhysician: true,
    isResident: false,
  },
  {
    id: "prov_5",
    name: "Dr. Priya Nair",
    specialty: "Cardiology",
    status: "In Flight",
    isProvider: true,
    isPcpPhysician: true,
    isAdmittingPhysician: false,
    isResident: false,
  },
  // {
  //   id: "res_1",
  //   name: "Julia R",
  //   specialty: "Cabin Crew",
  //   status: "Available",
  //   isProvider: false,
  //   isPcpPhysician: false,
  //   isAdmittingPhysician: false,
  //   isResident: true,
  // },
  // {
  //   id: "res_2",
  //   name: "Mark Davis",
  //   specialty: "Cabin Crew",
  //   status: "Available",
  //   isProvider: false,
  //   isPcpPhysician: false,
  //   isAdmittingPhysician: false,
  //   isResident: true,
  // },
  // {
  //   id: "res_3",
  //   name: "Lisa Anderson",
  //   specialty: "Senior Crew",
  //   status: "On Call",
  //   isProvider: false,
  //   isPcpPhysician: false,
  //   isAdmittingPhysician: false,
  //   isResident: true,
  // },
];

export default function AllEvents() {
  const [activeTab, setActiveTab] = useState("Rounding List");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);
  const location = useLocation();
  const [loadingPatients] = useState(false);
  const [patientError] = useState("");
  const [selectedIdsForBulkAdd, setSelectedIdsForBulkAdd] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);
  const [roundingStatusFilter, setRoundingStatusFilter] = useState("");
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [activityLogPatient, setActivityLogPatient] = useState(null);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  const handleActionsMenuOpen = (event) => {
    setActionsMenuAnchor(event.currentTarget);
  };

  const handleActionsMenuClose = () => {
    setActionsMenuAnchor(null);
  };

  const handleMarkNotSeen = async () => {
    const selectedIds = Array.from(selectionModel);

    if (selectedIds.length === 0) {
      showSnackbar("Please select patients first", "warning");
      handleActionsMenuClose();
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        selectedIds.includes(row.id) ? { ...row, is_marked: true } : row,
      ),
    );

    setSelectionModel(new Set());
    showSnackbar(
      `${selectedIds.length} patient(s) marked as Not Seen`,
      "success",
    );
    handleActionsMenuClose();
  };

  const handleBulkSidelist = () => {
    const selectedIds = Array.from(selectionModel);
    if (selectedIds.length === 0) {
      showSnackbar("Please select patients first", "warning");
      handleActionsMenuClose();
      return;
    }

    setSelectedIdsForBulkAdd(selectedIds);
    const firstRow = displayRows.find((r) => r.id === selectedIds[0]);
    setSelectedRow(firstRow);
    setOpenSelectReasonModal(true);
    handleActionsMenuClose();
  };

  const handleDiscardMarked = async () => {
    const selectedIds = Array.from(selectionModel);

    if (selectedIds.length === 0) {
      showSnackbar("Please select patients first", "warning");
      handleActionsMenuClose();
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        selectedIds.includes(row.id) ? { ...row, is_marked: false } : row,
      ),
    );

    setSelectionModel(new Set());
    showSnackbar(
      `${selectedIds.length} patient(s) removed from Marked Not Seen`,
      "success",
    );
    handleActionsMenuClose();
  };

  const handleDiscardSidelist = async () => {
    const selectedIds = Array.from(selectionModel);

    if (selectedIds.length === 0) {
      showSnackbar("Please select patients first", "warning");
      handleActionsMenuClose();
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        selectedIds.includes(row.id)
          ? { ...row, is_sidelist: false, sidelist_reason: "" }
          : row,
      ),
    );

    setSelectionModel(new Set());
    showSnackbar(
      `${selectedIds.length} patient(s) discarded from Sidelist`,
      "success",
    );
    handleActionsMenuClose();
  };

  const [transcribeModalOpen, setTranscribeModalOpen] = useState(false);
  const [currentTranscribePatient, setCurrentTranscribePatient] =
    useState(null);
  const [rows, setRows] = useState(staticPatientData);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectionModel, setSelectionModel] = useState(new Set());
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(null);

  const [facesheetOpen, setFacesheetOpen] = useState(false);
  const [facesheetPatient, setFacesheetPatient] = useState(null);

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleCopyPatients = () => {
    navigate("/copy-patients", {
      state: {
        dos: selectedDate,
      },
    });
  };

  // Static user for UI
  const user = {
    id: "user_1",
    name: "John Smith",
    roles: ["PROVIDER"],
    role: "PROVIDER",
  };

  const hasPermission = () => true; // Mock permission function
  const canAddPatient = true;
  const canEditFacesheet = true;
  const canUseNotesEditor = true;
  const canUploadMedicalNotes = true;
  const canUseSpeechDetection = true;
  const canFaxNotes = true;
  const canUseChat = true;
  const [providerProfile, setProviderProfile] = useState(null);
  const roleList = Array.isArray(user?.roles) ? user.roles : [];

  // Check if facesheet has been modified for a row
  const isFacesheetModified = (row) => {
    if (!row?.facesheet || row?.facesheet === "") return false;
    return row.facesheet && row.facesheet.trim() !== "";
  };

  const getGreetingByTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning 🌤️";
    if (hour < 17) return "Good afternoon ☀️";
    return "Good evening 🌙";
  };

  const getAvatarInitials = (name) => {
    if (!name) return "CT";
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return `${first}${second}`.toUpperCase() || "CT";
  };

  const isClinicalDoctorRole = roleList.some((role) =>
    ["PROVIDER", "PCP_PHYSICIAN", "ADMITTING_PHYSICIAN"].includes(
      String(role).toUpperCase(),
    ),
  );

  const isProviderUser =
    Array.isArray(user?.roles) &&
    user.roles.some((role) =>
      ["PROVIDER", "PCP_PHYSICIAN", "ADMITTING_PHYSICIAN"].includes(
        String(role).toUpperCase(),
      ),
    );

  const canAssignProvider = true;
  const rawName = String(user?.name || "").trim();
  const providerDisplayName = rawName
    ? isClinicalDoctorRole && !/^dr\.?/i.test(rawName)
      ? `Dr. ${rawName}`
      : rawName
    : "Care Team Member";
  const greetingText = getGreetingByTime();

  const specializationText =
    providerProfile?.specialty ||
    providerProfile?.resident_specialty ||
    providerProfile?.sub_specialty ||
    user?.specialty ||
    user?.specialization ||
    (user?.userRole && String(user.userRole).trim()) ||
    "";
  const providerSubtitle = specializationText
    ? `MD • ${specializationText}`
    : "Clinical Team • On Duty";
  const providerInitials = getAvatarInitials(providerDisplayName);

  console.log("selectionModel :", selectionModel);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const APP_TIMEZONE = "Asia/Kolkata";

  const toDateOnly = (value) => {
    if (!value) return "";
    return dayjs(value).tz(APP_TIMEZONE).format("YYYY-MM-DD");
  };

  const dateFilteredRows = React.useMemo(() => {
    const selectedDateStr = dayjs(selectedDate)
      .tz(APP_TIMEZONE)
      .format("YYYY-MM-DD");

    return rows.filter((row) => {
      const dosStr = toDateOnly(row.dos);
      return dosStr === selectedDateStr;
    });
  }, [rows, selectedDate]);

  const tabFilteredRows = React.useMemo(() => {
    if (activeTab === "In Patient") {
      return rows.filter((row) =>
        String(row.visitType || "")
          .toLowerCase()
          .includes("ip"),
      );
    }

    if (activeTab === "Out Patient") {
      return rows.filter((row) =>
        String(row.visitType || "")
          .toLowerCase()
          .includes("op"),
      );
    }

    return dateFilteredRows;
  }, [dateFilteredRows, activeTab]);

  const searchFilteredRows = React.useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) return tabFilteredRows;

    return tabFilteredRows.filter((row) =>
      [
        row.name,
        row.mrn,
        row.fin,
        row.patientDbId,
        row.encounterId,
        row.room,
        row.bed,
        row.status,
        row.location,
        row.physician,
        row.resident,
        row.visitType,
      ]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(query)),
    );
  }, [tabFilteredRows, patientSearch]);

  const displayRows = React.useMemo(() => {
    let filtered = searchFilteredRows;

    if (roundingStatusFilter === "Sidelist") {
      return filtered.filter(
        (row) =>
          row.is_sidelist === true &&
          row.sidelist_reason &&
          row.sidelist_reason.trim() !== "",
      );
    }

    if (roundingStatusFilter === "Marked not seen") {
      return filtered.filter((row) => row.is_marked === true);
    }

    if (roundingStatusFilter === "Unseen") {
      return filtered.filter(
        (row) => !row.is_sidelist && !row.is_marked && !isRowSeen(row),
      );
    }

    if (roundingStatusFilter === "Seen") {
      return filtered.filter(
        (row) => !row.is_sidelist && !row.is_marked && isRowSeen(row),
      );
    }

    return filtered.filter((row) => !row.is_sidelist && !row.is_marked);
  }, [searchFilteredRows, roundingStatusFilter]);

  const sortedRows = React.useMemo(() => {
    const comparator = (a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];

      if (orderBy === "status") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    };
    return [...displayRows].sort(comparator);
  }, [displayRows, order, orderBy]);

  const handleExportPatients = () => {
    if (!displayRows || displayRows.length === 0) {
      alert("No patient data to export");
      return;
    }

    const exportData = displayRows.map((row, index) => ({
      "Sr No": index + 1,
      Room: row.room || "",
      Bed: row.bed || "",
      Name: row.name || "",
      Age: row.age || "",
      Gender: row.gender || "",
      MRN: row.mrn || "",
      status: row.status || "",
      Location: row.location || "",
      Physician: row.physician || "",
      Resident: row.resident || "",
      VisitStatus: row.visitStatus || "",
      VisitType: row.visitType || "",
      DOS: row.dos || "",
      FIN: row.fin || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(fileData, `Patient_List_${dayjs().format("YYYY-MM-DD_HH-mm")}.xlsx`);
  };

  function parseAnyDate(value) {
    if (!value) return null;
    return toDateOnly(value);
  }

  function isSameCalendarDay(dateA, dateB) {
    if (!dateA || !dateB) return false;

    const a =
      typeof dateA === "string"
        ? dateA
        : dayjs(dateA).tz(APP_TIMEZONE).format("YYYY-MM-DD");

    const b = dayjs(dateB).tz(APP_TIMEZONE).format("YYYY-MM-DD");

    return a === b;
  }

  const normalizeProviderName = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/^dr\.?\s*/i, "")
      .replace(/\s+/g, " ");

  const dashboardStats = React.useMemo(() => {
    const appointmentsToday = rows.filter((row) =>
      isSameCalendarDay(parseAnyDate(row.dos), selectedDate),
    ).length;

    const patientsToSee = rows.filter((row) => !isRowSeen(row)).length;

    const currentProviderIds = new Set(
      [user?.id, user?.providerId, user?.provider_id, providerProfile?.id]
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    );
    const currentProviderNames = new Set(
      [user?.name, providerProfile?.name, providerDisplayName, rawName]
        .map((value) => normalizeProviderName(value))
        .filter(Boolean),
    );

    const ownedRows = rows.filter((row) => {
      const rowProviderId = String(
        row.providerId || row.provider?.id || row.provider_id || "",
      ).trim();
      if (rowProviderId && currentProviderIds.has(rowProviderId)) {
        return true;
      }

      const rowPhysician = normalizeProviderName(row.physician);
      return rowPhysician && currentProviderNames.has(rowPhysician);
    });

    const ownedPatientsCount = ownedRows.length;
    const unassignedOwnedCount = ownedRows.filter(
      (row) => !String(row.resident || "").trim(),
    ).length;
    const patientsToAssign = rows.filter(
      (row) => !String(row.providerId || "").trim(),
    ).length;

    const pendingNotes = rows.filter((row) => {
      const status = String(row.noteStatus || "")
        .trim()
        .toLowerCase();
      return status === "draft" || status === "pending" || status === "";
    }).length;

    return {
      appointmentsToday,
      patientsToSee,
      patientsToAssign,
      pendingNotes,
    };
  }, [
    rows,
    selectedDate,
    user?.id,
    user?.name,
    user?.providerId,
    user?.provider_id,
    providerProfile?.id,
    providerProfile?.name,
    providerDisplayName,
    rawName,
  ]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = new Set(sortedRows.map((row) => row.id));
      setSelectionModel(newSelected);
    } else {
      setSelectionModel(new Set());
    }
  };

  const handleRowCheckboxClick = (id) => {
    const newSelected = new Set(selectionModel);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectionModel(newSelected);
  };

  const handleMenuOpen = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(rowId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [assignSearch, setAssignSearch] = useState("");
  const [providerOptions] = useState(staticProviderOptions);
  const [openEncounterModal, setOpenEncounterModal] = useState(false);
  const [openSelectReasonModal, setOpenSelectReasonModal] = useState(false);
  const [assignType, setAssignType] = useState("doctor");
  const [selectedLocation] = useState("");
  const [patientTab, setPatientTab] = useState("all");
  const [patientCustomReasons, setPatientCustomReasons] = useState({});
  const [tableData] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  const calculateAge = (status) => {
    if (!status) return "";
    const birthDate = new Date(status);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return `${age}y`;
  };

  const formatstatus = (status) => {
    if (!status) return "";
    return dayjs(status).format("MM/DD/YYYY");
  };

  const isUuid = (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(value || "").trim(),
    );

  const EYE_COLORS = {
    PHYSICIAN: {
      icon: "rgba(0, 153, 81, 1)",
      bg: "rgba(207, 247, 211, 1)",
      hoverBg: "rgba(207, 247, 211, 0.65)",
    },
    RESIDENT: {
      icon: "rgba(191, 106, 2, 1)",
      bg: "rgba(255, 241, 194, 1)",
      hoverBg: "rgba(255, 241, 194, 0.75)",
    },
    DOCTOR: {
      icon: "rgba(207, 247, 211, 1)",
      bg: "rgba(0, 153, 81, 1)",
      hoverBg: "rgba(0, 153, 81, 0.75)",
    },
    DEFAULT: {
      icon: "rgba(255, 107, 107, 1)",
      bg: "rgba(255, 229, 229, 1)",
      hoverBg: "rgba(255, 229, 229, 0.75)",
    },
  };

  function normalizeSeenRole(value) {
    const role = String(value || "")
      .trim()
      .toUpperCase();
    if (!role) return "";

    if (role.includes("RESIDENT") || role.includes("APP")) {
      return "RESIDENT";
    }

    if (role.includes("DOCTOR") || role === "DR" || role.startsWith("DR_")) {
      return "DOCTOR";
    }

    if (
      role.includes("PHYSICIAN") ||
      role.includes("PROVIDER") ||
      role.includes("ATTENDING")
    ) {
      return "PHYSICIAN";
    }

    if (["RESIDENT", "APP", "RESIDENT/APP", "RESIDENT_APP"].includes(role)) {
      return "RESIDENT";
    }

    if (["DOCTOR", "DR"].includes(role)) {
      return "DOCTOR";
    }

    if (
      [
        "PHYSICIAN",
        "PROVIDER",
        "PCP_PHYSICIAN",
        "ADMITTING_PHYSICIAN",
        "ATTENDING",
      ].includes(role)
    ) {
      return "PHYSICIAN";
    }

    return role;
  }

  const getCurrentUserSeenRole = () => {
    const normalizedUserRoles = roleList.map((role) =>
      String(role || "")
        .trim()
        .toUpperCase(),
    );

    if (
      normalizedUserRoles.some((role) =>
        ["RESIDENT", "APP", "RESIDENT/APP", "RESIDENT_APP"].includes(role),
      )
    ) {
      return "RESIDENT";
    }

    if (normalizedUserRoles.some((role) => ["DOCTOR", "DR"].includes(role))) {
      return "DOCTOR";
    }

    if (normalizedUserRoles.some((role) => role === "PROVIDER")) {
      return "DOCTOR";
    }

    if (
      normalizedUserRoles.some((role) =>
        ["PHYSICIAN", "ATTENDING"].includes(role),
      )
    ) {
      return "PHYSICIAN";
    }

    return "";
  };

  function isRowSeen(row) {
    const status = String(row?.visitStatus || "")
      .trim()
      .toLowerCase();
    const normalizedRole = normalizeSeenRole(
      row?.seenByRole || row?.seen_by_role,
    );

    if (normalizedRole) return true;

    return [
      "seen",
      "completed",
      "in progress",
      "in-progress",
      "done",
      "visited",
    ].includes(status);
  }

  const getEyeColorsForRow = (row) => {
    if (!isRowSeen(row)) {
      return EYE_COLORS.DEFAULT;
    }

    const physicianRole = normalizeSeenRole(row?.providerRole);
    const residentRole = normalizeSeenRole(row?.residentRole);
    const seenRole = normalizeSeenRole(row?.seenByRole || row?.seen_by_role);

    if (physicianRole === "DOCTOR" || physicianRole === "PROVIDER") {
      return EYE_COLORS.DOCTOR;
    }

    if (physicianRole === "PHYSICIAN") {
      return EYE_COLORS.PHYSICIAN;
    }

    if (residentRole === "RESIDENT") {
      return EYE_COLORS.RESIDENT;
    }

    if (seenRole === "DOCTOR" || seenRole === "PROVIDER") {
      return EYE_COLORS.DOCTOR;
    }

    if (seenRole === "PHYSICIAN") {
      return EYE_COLORS.PHYSICIAN;
    }

    if (seenRole === "RESIDENT") {
      return EYE_COLORS.RESIDENT;
    }

    return EYE_COLORS.DEFAULT;
  };

  const handleToggleSeen = async (row) => {
    const nextSeen = !isRowSeen(row);

    setRows((prev) =>
      prev.map((r) => {
        if ((r.encounterId || r.id) !== (row.encounterId || row.id)) return r;
        return {
          ...r,
          visitStatus: nextSeen ? "Seen" : "Not Seen",
          seenByRole: nextSeen ? getCurrentUserSeenRole() : "",
        };
      }),
    );
  };

  const handleCellClick = (rowId, field, currentValue) => {
    setEditingCell({ rowId, field });
    setEditValue(currentValue ?? "");
  };

  const handleCellSave = (rowId, field) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: editValue } : r)),
    );
    setEditingCell(null);
    setEditValue("");
  };

  const handleCellKeyDown = (e, rowId, field) => {
    if (e.key === "Enter") handleCellSave(rowId, field);
    if (e.key === "Escape") {
      setEditingCell(null);
      setEditValue("");
    }
  };

  useEffect(() => {
    if (location.state?.newPatient) {
      setRows((prev) => [...prev, location.state.newPatient]);
    }
  }, [location.state]);

  useEffect(() => {
    setPage(0);
  }, [patientSearch, activeTab]);

  const handleAddCustomReason = (reason) => {
    if (!selectedRow) return;
    setPatientCustomReasons((prev) => {
      const existing = prev[selectedRow.id] || [];
      if (existing.includes(reason)) return prev;
      return { ...prev, [selectedRow.id]: [reason, ...existing] };
    });
  };

  const handleOpenEncounterModal = (row) => {
    setSelectedRow(row);
    setOpenEncounterModal(true);
  };

  const handleSidelistClick = async (row, reason = null) => {
    if (!reason) {
      setSelectedRow(row);
      setOpenSelectReasonModal(true);
      handleMenuClose();
      return;
    }

    const idsToUpdate =
      selectedIdsForBulkAdd.length > 0 ? selectedIdsForBulkAdd : [row?.id];

    setRows((prevRows) =>
      prevRows.map((r) => {
        if (idsToUpdate.includes(r.id)) {
          return {
            ...r,
            is_sidelist: true,
            sidelist_reason: reason,
          };
        }
        return r;
      }),
    );

    setSelectionModel(new Set());
    setSelectedIdsForBulkAdd([]);
    setSelectedRow(null);
    setOpenSelectReasonModal(false);

    showSnackbar(
      `${idsToUpdate.length} patient(s) added to Sidelist`,
      "success",
    );
    handleMenuClose();
  };

  const handleVoiceToText = (row) => {
    if (!canUploadMedicalNotes && !canUseSpeechDetection) return;
    setCurrentTranscribePatient(row);
    setTranscribeModalOpen(true);
  };

  const filteredAssignProviders = providerOptions.filter((doc) => {
    if (assignType === "resident") {
      if (!doc.isResident) return false;
    }

    if (assignType === "doctor") {
      if (!doc.isProvider && !doc.isPcpPhysician && !doc.isAdmittingPhysician) {
        return false;
      }
    }

    const search = assignSearch.trim().toLowerCase();
    if (!search) return true;
    const byName = String(doc.name || "")
      .toLowerCase()
      .includes(search);
    const bySpecialty = String(doc.specialty || "")
      .toLowerCase()
      .includes(search);
    return byName || bySpecialty;
  });

  const handleOpenNoteEditor = (row) => {
    if (!canUseNotesEditor) return;
    console.log("Opening note editor row:", row);

    if (!row.encounterId) {
      alert("Encounter ID missing for this patient.");
      return;
    }

    navigate("/view_details?tab=Notes", {
      state: {
        encounterId: row.encounterId,
        patientId: row.patientDbId,
        patient: row,
      },
    });
  };

  const ATTESTATION_REGEX =
    /(RESIDENT\s*\/?\s*APP\s*ATTESTATION|RESIDENT\s+ATTESTATION|APP\s+ATTESTATION)/i;

  const getCopyHtmlByMode = (html = "", mode = "all") => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const children = Array.from(div.childNodes);
    const attestationIndex = children.findIndex((node) =>
      ATTESTATION_REGEX.test(node.textContent || ""),
    );

    if (attestationIndex === -1) return div.innerHTML;
    div.innerHTML = "";

    if (mode === "attestation") {
      children
        .slice(attestationIndex)
        .forEach((node) => div.appendChild(node.cloneNode(true)));
    } else {
      children
        .slice(0, attestationIndex)
        .forEach((node) => div.appendChild(node.cloneNode(true)));
    }

    return div.innerHTML;
  };

  const copyHtmlLikeNoteEditor = (html, successMessage) => {
    const copyDiv = document.createElement("div");
    copyDiv.innerHTML = html;
    copyDiv.style.position = "fixed";
    copyDiv.style.left = "-9999px";
    copyDiv.style.top = "0";
    copyDiv.style.width = "800px";
    copyDiv.style.background = "white";
    copyDiv.style.fontFamily = "Arial, sans-serif";
    copyDiv.style.fontSize = "14px";
    copyDiv.style.lineHeight = "1.6";
    document.body.appendChild(copyDiv);
    const range = document.createRange();
    range.selectNodeContents(copyDiv);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    const successful = document.execCommand("copy");
    selection.removeAllRanges();
    document.body.removeChild(copyDiv);

    if (!successful) {
      throw new Error("Copy command failed");
    }

    showSnackbar(successMessage, "success");
  };

  const handleCopyNoteFromRL = async (row, mode = "all") => {
    try {
      const encounterId = row?.encounterId || row?.encounter_id || row?.id;

      if (!encounterId) {
        showSnackbar("Encounter ID missing", "warning");
        return;
      }

      // Mock note data
      const mockSummaryHtml = `<div><p>Patient presented with symptoms. Examination revealed normal findings.</p><p>RESIDENT ATTESTATION: This note has been reviewed and approved by the attending physician.</p><p>Plan: Follow up in 2 weeks.</p></div>`;

      const copyHtml = getCopyHtmlByMode(mockSummaryHtml, mode);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = copyHtml;

      if (!(tempDiv.innerText || tempDiv.textContent || "").trim()) {
        showSnackbar("No text found to copy", "warning");
        return;
      }

      copyHtmlLikeNoteEditor(
        copyHtml,
        mode === "attestation"
          ? "Attestation copied"
          : "Summarized note copied",
      );
    } catch (error) {
      console.error("Copy note failed:", error);
      showSnackbar("Failed to copy summarized note", "error");
    }
  };

  // Handle menu actions
  const handleViewVitalTrends = (row) => {
    setOpenVitalTrends(true);
    handleMenuClose();
  };

  const handleViewReport = (row) => {
    setOpenViewReport(true);
    handleMenuClose();
  };

  const handleShareReport = (row) => {
    setSelectedPatient(row);
    setOpenShare(true);
    handleMenuClose();
  };

  const [openVitalTrends, setOpenVitalTrends] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [openViewReport, setOpenViewReport] = useState(false);

  const [openAction2, setOpenAction2] = useState(false);
  const [openAction3, setOpenAction3] = useState(false);

  return (
    <>
      <style>{`
          [contenteditable]:focus {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          [contenteditable]:focus-visible {
            outline: none !important;
          }
        `}</style>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
          overflowY: "visible",
          px: { xs: 1, sm: 2 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Main content area – no scrollbars */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          {/* Header Cards */}
          {/* Row 1: Doctor card + 4 stat cards */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              width: "100%",
              mb: 2,
            }}
          >
            {/* Doctor Card */}
            <Box sx={{ flex: "1 1 180px", minWidth: 0 }}>
              <Box
                sx={{
                  //background: "rgba(40, 151, 255, 1)",
                  background: "#1565FF",
                  color: "rgba(210, 214, 219, 1)",
                  borderRadius: "16px",
                  px: 2,
                  py: 1,
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  overflow: "hidden",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.302)",
                    width: 36,
                    height: 36,
                    fontWeight: 600,
                    fontSize: 10,
                    flexShrink: 0,
                  }}
                >
                  {providerInitials}
                </Avatar>
                <Box sx={{ lineHeight: 1.3, overflow: "hidden" }}>
                  <Typography fontSize={10} noWrap sx={{ opacity: 0.9 }}>
                    {greetingText}
                  </Typography>
                  <Typography fontWeight={700} fontSize={10} noWrap>
                    {providerDisplayName}
                  </Typography>
                  <Typography fontSize={10} noWrap sx={{ opacity: 0.85 }}>
                    {providerSubtitle}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Stat Cards */}
            {[
              {
                value: "XX",
                label: "Events today",
                icon: EventCardIcon,
              },
              {
                value: "XX/XX",
                label: "Patients to see",
                icon: PatientCardIcon,
              },
              {
                value: "XX",
                label: "Patients to assign",
                icon: PatientAssignCardIcon,
              },
              {
                value: "XX",
                label: "Critical Cases",
                icon: CriticalCasesIcon,
              },
            ].map((item, i) => (
              <Box key={i} sx={{ flex: "1 1 120px", minWidth: 0 }}>
                <Box
                  sx={{
                    bgcolor: "rgba(33, 50, 75, 1)",
                    borderRadius: "12px",
                    px: 1.5,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    height: "80px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(210, 214, 219, 1)",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "rgba(1, 93, 255, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <item.icon width={24} height={24} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      fontWeight={700}
                      fontSize={18}
                      lineHeight={1.1}
                      color="red"
                    >
                      {item.value}
                    </Typography>
                    <Typography
                      fontSize={10}
                      fontWeight={700}
                      color="#b89994"
                      sx={{
                        lineHeight: 1.2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Row 2: Date picker + Search + Filter + Export */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {/* Date Picker */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "rgba(33, 50, 75, 1)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.10)",
                px: 1.5,
                py: 0.8,
                gap: 0.5,
                flexShrink: 0,
                cursor: "pointer",
                height: "40px",
                color: "rgba(210, 214, 219, 1)",
              }}
            >
              <ChevronLeftIcon
                sx={{
                  fontSize: 18,
                  color: "rgba(210, 214, 219, 1)",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const prev = new Date(selectedDate);
                  prev.setDate(prev.getDate() - 1);
                  setSelectedDate(prev);
                }}
              />

              <CalendarTodayIcon
                sx={{ fontSize: 16, color: "#94A3B8", cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCalendarAnchorEl(e.currentTarget);
                }}
              />

              <Typography
                fontSize={14}
                fontWeight={500}
                color="#94A3B8"
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  color: "rgba(210, 214, 219, 1)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCalendarAnchorEl(e.currentTarget);
                }}
              >
                {selectedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Typography>

              <ChevronRightIcon
                sx={{
                  fontSize: 18,
                  color: "rgba(210, 214, 219, 1)",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const next = new Date(selectedDate);
                  next.setDate(next.getDate() + 1);
                  setSelectedDate(next);
                }}
              />
            </Box>

            {/* Calendar Popover */}
            <Popover
              open={Boolean(calendarAnchorEl)}
              anchorEl={calendarAnchorEl}
              onClose={() => setCalendarAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
              PaperProps={{
                sx: {
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(33, 50, 75, 1)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.10)",
                  px: 1.5,
                },
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={dayjs(selectedDate)}
                  onChange={(newVal) => {
                    setSelectedDate(newVal.toDate());
                    setCalendarAnchorEl(null);
                  }}
                  sx={{
                    width: 260,
                    "& .MuiPickersDay-root.Mui-selected": {
                      backgroundcolor: "#4DA3FF",
                    },
                    "& .MuiPickersDay-root.Mui-selected:hover": {
                      backgroundColor: "rgba(1, 93, 255, 0.85)",
                    },
                  }}
                />
              </LocalizationProvider>
            </Popover>

            {/* Search Bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                //backgroundColor: "rgba(15, 38, 70, 1)",
                bgcolor: "rgba(33, 50, 75, 1)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.10)",
                px: 1.5,
                height: "40px",
                gap: 1,
                width: "350px",
              }}
            >
              <SearchIcon
                sx={{ color: "rgba(210, 214, 219, 1)", fontSize: 20 }}
              />
              <InputBase
                placeholder="Search flight route, patients by name or MRN..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                sx={{
                  width: "100%",
                  fontSize: "14px",
                  color: "rgba(210, 214, 219, 1)",
                  "& input::placeholder": {
                    color: "rgba(210, 214, 219, 1)",
                    opacity: 1,
                  },
                }}
              />
            </Box>

            {/* Right Side Buttons */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                ml: "auto",
              }}
            >
              <Button
                onClick={() => setFilterModalOpen(true)}
                startIcon={<FilterSortIcon />}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  border: "1.5px solid rgba(210, 214, 219, 1)",
                  color: "rgba(210, 214, 219, 1)",
                  //backgroundColor: "rgba(15, 38, 70, 1)",
                  px: 2,
                  height: "40px",
                  fontWeight: 600,
                  fontSize: "14px",
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: "rgba(1,93,255,0.05)",
                  },
                }}
              >
                Filter
              </Button>

              <Button
                onClick={handleExportPatients}
                startIcon={<ExportIcon />}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  border: "1.5px solid rgba(210, 214, 219, 1)",
                  color: "rgba(210, 214, 219, 1)",
                  //backgroundColor: "rgba(15, 38, 70, 1)",
                  px: 2,
                  height: "40px",
                  fontWeight: 600,
                  fontSize: "14px",
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: "rgba(1,93,255,0.05)",
                  },
                }}
              >
                Export
              </Button>
            </Box>
          </Box>

          {/* Table container – MUI Table with horizontal scroll */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              bgcolor: "rgba(17, 35, 57, 1)",
              borderRadius: "14px",
              border: "1px solid rgba(51, 74, 104, 1)",
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {loadingPatients && (
              <Typography sx={{ p: 2, color: "#94A3B8" }}>
                Loading patients...
              </Typography>
            )}

            {patientError && (
              <Typography sx={{ p: 2, color: "red" }}>
                {patientError}
              </Typography>
            )}
            <TableContainer
              sx={{
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                maxWidth: "100%",
                overflowX: "auto",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Table
                stickyHeader
                sx={{
                  width: "100%",
                  minWidth: { xs: 920, sm: 1000 },
                  tableLayout: "auto",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "rgba(7, 20, 40, 0.9)",
                      "& .MuiTableCell-head": {
                        backgroundColor: "rgba(33, 50, 75, 1)",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "rgba(210, 214, 219, 1)",
                        padding: "6px 6px",
                        borderBottom: "none",
                        whiteSpace: "normal",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                      },
                      "& .MuiTableSortLabel-root": {
                        color: "rgba(210, 214, 219, 1)",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        textAlign: "center",
                      },
                      "& .MuiTableSortLabel-root:hover": {
                        color: "rgba(210, 214, 219, 1)",
                      },
                      "& .MuiTableSortLabel-root.Mui-active": {
                        color: "rgba(210, 214, 219, 1)",
                      },
                    }}
                  >
                    <TableCell
                      padding="checkbox"
                      sx={{
                        width: activeTab === "Sidelist" ? "30px" : "40px",
                        minWidth: activeTab === "Sidelist" ? "30px" : "40px",
                      }}
                    >
                      <Checkbox
                        indeterminate={
                          selectionModel.size > 0 &&
                          selectionModel.size < displayRows.length
                        }
                        checked={
                          displayRows.length > 0 &&
                          selectionModel.size === displayRows.length
                        }
                        onChange={handleSelectAllClick}
                        sx={{
                          color: "#94A3B8",
                          "&.Mui-checked": {
                            color: "#4DA3FF",
                          },
                          "&.MuiCheckbox-indeterminate": {
                            color: "#4DA3FF",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "7%",
                        borderRight: "1px solid rgba(77,163,255,0.2)",
                      }}
                    >
                      <Box sx={{ lineHeight: 1.3 }}>
                        <div>Name</div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "rgba(210, 214, 219, 1)",
                            fontSize: "14px",
                          }}
                        >
                          Age
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "12%",
                        borderRight: "1px solid rgba(77,163,255,0.2)",
                      }}
                    >
                      <Box sx={{ lineHeight: 1.3 }}>
                        <div>Patient</div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "rgba(210, 214, 219, 1)",
                            fontSize: "14px",
                          }}
                        >
                          ID
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "10%",
                        borderRight: "1px solid rgba(77,163,255,0.2)",
                      }}
                    >
                      <Box sx={{ lineHeight: 1.3 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "rgba(210, 214, 219, 1)",
                            fontSize: "14px",
                          }}
                        >
                          Duration
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "10%",
                        borderRight: "1px solid rgba(77,163,255,0.2)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          //alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          cursor: "pointer",
                        }}
                        onClick={() => handleRequestSort("status")}
                      >
                        Status
                        <UnfoldMoreIcon
                          sx={{
                            fontSize: 20,
                            fontWeight: 600,
                            color: "rgba(210,214,219,1)",
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "10%",
                        borderRight: "1px solid rgba(77,163,255,0.2)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          //alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        Route
                        <KeyboardArrowDownIcon
                          sx={{
                            fontSize: 20,
                            fontWeight: 600,
                            color: "rgba(210,214,219,1)",
                          }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        width: "10%",
                        borderRight: "1px solid rgba(77,163,255,0.2)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          justifyContent: "center",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        onClick={() => handleRequestSort("physician")}
                      >
                        Physician
                        <KeyboardArrowDownIcon
                          sx={{ fontSize: 20, fontWeight: 600 }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        width: "11%",
                        borderRight: "1px solid rgba(77,163,255,0.2)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          justifyContent: "center",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        onClick={() => handleRequestSort("resident")}
                      >
                        Crew
                        <KeyboardArrowDownIcon
                          sx={{ fontSize: 20, fontWeight: 600 }}
                        />
                      </Box>
                    </TableCell>

                    {activeTab === "Sidelist" ? (
                      <TableCell sx={{ width: "25%", minWidth: "200px" }}>
                        Reason
                      </TableCell>
                    ) : (
                      <TableCell
                        sx={{
                          width: "auto",
                          minWidth: 280,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {roundingStatusFilter === "Sidelist" ? (
                          <>Reasons</>
                        ) : (
                          <> Actions</>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        align="center"
                        sx={{
                          py: 4,
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#94A3B8",
                          backgroundColor: "rgba(15, 38, 70, 1)",
                        }}
                      >
                        No Patient Found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedRows
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((row) => {
                        const isEditing = (field) =>
                          editingCell?.rowId === row.id &&
                          editingCell?.field === field;
                        const eyeColors = getEyeColorsForRow(row);
                        // const eyeTooltip = isRowSeen(row) ? "Seen" : "Unseen";

                        const EditableCell = ({ field, children, sx }) => {
                          const cellRef = React.useRef(null);

                          React.useEffect(() => {
                            if (isEditing(field) && cellRef.current) {
                              cellRef.current.focus();
                              const range = document.createRange();
                              range.selectNodeContents(cellRef.current);
                              const sel = window.getSelection();
                              sel.removeAllRanges();
                              sel.addRange(range);
                            }
                          }, [isEditing(field)]);

                          return (
                            <TableCell sx={sx}>
                              <Box
                                ref={cellRef}
                                contentEditable={isEditing(field)}
                                suppressContentEditableWarning
                                onClick={() => {
                                  if (!isEditing(field)) {
                                    handleCellClick(row.id, field, row[field]);
                                  }
                                }}
                                onBlur={(e) => {
                                  if (isEditing(field)) {
                                    const newValue =
                                      e.currentTarget.textContent || "";
                                    setRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id
                                          ? { ...r, [field]: newValue }
                                          : r,
                                      ),
                                    );
                                    setEditingCell(null);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                  if (e.key === "Escape") {
                                    e.preventDefault();
                                    setEditingCell(null);
                                    setEditValue("");
                                  }
                                }}
                                sx={{
                                  display: "inline-block",
                                  width: "fit-content",
                                  cursor: isEditing(field) ? "text" : "pointer",
                                  minHeight: 20,
                                  outline: "none !important",
                                  border: "none !important",
                                  boxShadow: "none !important",
                                  borderRadius: "4px",
                                  bgcolor: isEditing(field)
                                    ? "rgba(1, 93, 255, 0.18)"
                                    : "transparent",
                                  px: isEditing(field) ? 0.5 : 0,
                                  "&:hover": {
                                    bgcolor: "rgba(1, 93, 255, 0.12)",
                                  },
                                  "&:focus": {
                                    outline: "none !important",
                                    border: "none !important",
                                    boxShadow: "none !important",
                                    bgcolor: "rgba(1, 93, 255, 0.35)",
                                  },
                                  "&:focus-visible": {
                                    outline: "none !important",
                                  },
                                }}
                              >
                                {isEditing(field) ? editValue : children}
                              </Box>
                            </TableCell>
                          );
                        };

                        return (
                          <TableRow
                            key={row.id}
                            hover
                            sx={{
                              "& .MuiTableCell-body": {
                                padding: "6px 6px",
                                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                                fontSize: "13px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                textAlign: "center",
                                verticalAlign: "middle",
                                color: "rgba(210, 214, 219, 1)",
                              },
                              "& .MuiTableCell-body:last-child": {
                                overflow: "visible",
                              },
                              "&:hover": {
                                backgroundColor: "rgba(11, 29, 53, 0.6)",
                              },
                              // Inner shadow for the row
                              boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.08)", // This creates an inner border/shadow
                              // OR multiple inner shadows for different sides:
                              // boxShadow: "inset 0 1px 0 0 rgba(0, 0, 0, 0.08), inset 0 -1px 0 0 rgba(0, 0, 0, 0.08)",
                            }}
                          >
                            <TableCell
                              padding="checkbox"
                              sx={{
                                width:
                                  activeTab === "Sidelist" ? "30px" : "40px",
                                minWidth:
                                  activeTab === "Sidelist" ? "30px" : "40px",
                              }}
                            >
                              <Checkbox
                                checked={selectionModel.has(row.id)}
                                onChange={() => handleRowCheckboxClick(row.id)}
                                sx={{
                                  color: "#94A3B8",
                                  "&.Mui-checked": {
                                    color: "#4DA3FF",
                                  },
                                }}
                              />
                            </TableCell>

                            {/* Name + Age/Gender */}
                            <EditableCell field="name">
                              <Box
                                fontWeight={600}
                                fontSize={12}
                                sx={{ display: "inline-block" }}
                              >
                                {row.name}
                                <Typography
                                  fontWeight={600}
                                  sx={{ fontSize: "11px", color: "#C0B5AE" }}
                                >
                                  {row.age} ({row.gender})
                                </Typography>
                              </Box>
                            </EditableCell>

                            {/* Patient ID */}
                            <EditableCell field="mrn">
                              <Box
                                fontWeight={600}
                                fontSize={12}
                                sx={{ display: "inline-block" }}
                              >
                                {row.mrn}
                              </Box>
                            </EditableCell>

                            {/* Duration */}
                            <EditableCell field="duration">
                              <Box
                                fontWeight={600}
                                fontSize={12}
                                sx={{ display: "inline-block" }}
                              >
                                {row.duration}
                              </Box>
                            </EditableCell>

                            <EditableCell field="status">
                              <Box fontWeight={600} fontSize={12}>
                                {row.status}
                              </Box>
                            </EditableCell>

                            {/* Location chip — editable */}
                            <TableCell>
                              <Box
                                contentEditable={isEditing("location")}
                                suppressContentEditableWarning
                                onClick={() => {
                                  if (!isEditing("location"))
                                    handleCellClick(
                                      row.id,
                                      "location",
                                      row.location,
                                    );
                                }}
                                onBlur={(e) => {
                                  if (isEditing("location")) {
                                    const newValue =
                                      e.currentTarget.textContent || "";
                                    setRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id
                                          ? { ...r, location: newValue }
                                          : r,
                                      ),
                                    );
                                    setEditingCell(null);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                  if (e.key === "Escape") {
                                    setEditingCell(null);
                                  }
                                }}
                                sx={{
                                  display: "inline-block",
                                  cursor: "pointer",
                                  outline: "none !important",
                                  border: "none !important",
                                  boxShadow: "none !important",
                                  borderRadius: "4px",
                                  bgcolor: isEditing("location")
                                    ? "rgba(1, 93, 255, 0.18)"
                                    : "transparent",
                                  px: isEditing("location") ? 0.5 : 0,
                                  "&:focus": {
                                    outline: "none !important",
                                    border: "none !important",
                                    bgcolor: "rgba(1, 93, 255, 0.35)",
                                  },
                                  "&:focus-visible": {
                                    outline: "none !important",
                                  },
                                }}
                              >
                                {isEditing("location")
                                  ? editValue
                                  : row.location}
                              </Box>
                            </TableCell>

                            {/* Physician */}
                            <TableCell>
                              <Box
                                contentEditable={isEditing("physician")}
                                suppressContentEditableWarning
                                onClick={() => {
                                  if (!canAssignProvider) return;
                                  if (!isEditing("physician")) {
                                    setSelectedRow(row);
                                    setOpenAssignModal(true);
                                    setAssignType("doctor");
                                  }
                                }}
                                onBlur={(e) => {
                                  if (isEditing("physician")) {
                                    const newValue =
                                      e.currentTarget.textContent || "";
                                    setRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id
                                          ? { ...r, physician: newValue }
                                          : r,
                                      ),
                                    );
                                    setEditingCell(null);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                  if (e.key === "Escape") {
                                    setEditingCell(null);
                                  }
                                }}
                                sx={{
                                  cursor: "pointer",
                                  color: "#4DA3FF",
                                  fontWeight: 500,
                                  display: "inline-block",
                                  outline: "none !important",
                                  border: "none !important",
                                  boxShadow: "none !important",
                                  borderRadius: "4px",
                                  bgcolor: isEditing("physician")
                                    ? "rgba(1, 93, 255, 0.18)"
                                    : "transparent",
                                  px: isEditing("physician") ? 0.5 : 0,
                                  "&:focus": {
                                    outline: "none !important",
                                    border: "none !important",
                                    bgcolor: "rgba(1, 93, 255, 0.35)",
                                  },
                                  "&:focus-visible": {
                                    outline: "none !important",
                                  },
                                }}
                              >
                                {isEditing("physician") ? (
                                  editValue
                                ) : row.physician ? (
                                  <Box
                                    sx={{
                                      display: "inline-block",
                                      px: 1.6,
                                      py: 0.8,
                                      borderRadius: "20px",
                                      backgroundColor:
                                        "rgba(161, 120, 0, 0.85)",
                                      color: "rgba(255, 241, 194, 1)",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      lineHeight: 1,
                                    }}
                                  >
                                    {row.physician}
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      display: "inline-block",
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: "20px",
                                      backgroundColor:
                                        "rgba(161, 120, 0, 0.85)",
                                      color: "rgba(255, 241, 194, 1)",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      minWidth: "90px",
                                      textAlign: "center",
                                    }}
                                  >
                                    Assign
                                  </Box>
                                )}
                              </Box>
                            </TableCell>

                            {/* Resident */}
                            <TableCell>
                              <Box
                                suppressContentEditableWarning
                                onClick={() => {}}
                                onBlur={(e) => {
                                  if (isEditing("resident")) {
                                    const newValue =
                                      e.currentTarget.textContent || "";
                                    setRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id
                                          ? { ...r, resident: newValue }
                                          : r,
                                      ),
                                    );
                                    setEditingCell(null);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                  if (e.key === "Escape") {
                                    setEditingCell(null);
                                  }
                                }}
                                sx={{
                                  cursor: "pointer",
                                  color: "#4DA3FF",
                                  fontWeight: 400,
                                  display: "inline-block",
                                  outline: "none !important",
                                  border: "none !important",
                                  boxShadow: "none !important",
                                  borderRadius: "4px",
                                  bgcolor: isEditing("resident")
                                    ? "rgba(1, 93, 255, 0.18)"
                                    : "transparent",
                                  px: isEditing("resident") ? 0.5 : 0,
                                  "&:focus": {
                                    outline: "none !important",
                                    border: "none !important",
                                    bgcolor: "rgba(1, 93, 255, 0.35)",
                                  },
                                  "&:focus-visible": {
                                    outline: "none !important",
                                  },
                                }}
                              >
                                {isEditing("resident") ? (
                                  editValue
                                ) : row.resident ? (
                                  <Box
                                    sx={{
                                      display: "inline-block",
                                      px: 1.6,
                                      py: 0.8,
                                      borderRadius: "20px",
                                      backgroundColor:
                                        "rgba(16, 120, 100, 0.7)",
                                      color: "rgba(210, 214, 219, 1)",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      lineHeight: 1,
                                    }}
                                  >
                                    {row.resident}
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      display: "inline-block",
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: "8px",
                                      backgroundColor:
                                        "rgba(161, 120, 0, 0.85)",
                                      color: "rgba(210, 214, 219, 1)",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      minWidth: "90px",
                                      textAlign: "center",
                                    }}
                                  >
                                    Test Crew
                                  </Box>
                                )}
                              </Box>
                            </TableCell>

                            {roundingStatusFilter === "Sidelist" ? (
                              <TableCell
                                sx={{ width: "25%", minWidth: "200px" }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "13px",
                                      color: "rgba(210, 214, 219, 1)",
                                      fontWeight: 500,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {row.sidelist_reason ||
                                      "No reason provided"}
                                  </Typography>
                                  <Typography
                                    sx={{ fontSize: "11px", color: "#94A3B8" }}
                                  >
                                    {console.log("Rwe", row)}
                                    Added:{" "}
                                    {row.updated_at || row.created_at
                                      ? dayjs(row.sidelistTimestamp).format(
                                          "MM/DD/YYYY hh:mm A",
                                        )
                                      : ""}
                                  </Typography>
                                </Box>
                              </TableCell>
                            ) : (
                              <TableCell
                                sx={{
                                  overflow: "visible !important",
                                  width: "100%",
                                  minWidth: { xs: 280, sm: 320, md: 220 },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "nowrap",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    minWidth: "fit-content",
                                  }}
                                >
                                  <Tooltip
                                    // title={eyeTooltip}
                                    arrow
                                    componentsProps={{
                                      tooltip: {
                                        sx: {
                                          bgcolor: "#000000",
                                          color: "rgba(15, 38, 70, 1)",
                                          fontSize: "0.75rem",
                                          [`& .${tooltipClasses.arrow}`]: {
                                            color: "#000000",
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleSeen(row);
                                      }}
                                      sx={{
                                        p: "4px",
                                        borderRadius: "50%",
                                        marginRight: "15px",
                                        // backgroundColor: eyeColors.bg,
                                        "& svg": {
                                          color: `${eyeColors.icon} !important`,
                                        },
                                        "&:hover": {
                                          // backgroundColor: eyeColors.hoverBg,
                                        },
                                        position: "relative",
                                      }}
                                    >
                                      <VisibilityIcon sx={{ fontSize: 16 }} />
                                      {/* {!isRowSeen(row) && (
                                        <Box
                                          sx={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            fontSize: "28px",
                                            color: eyeColors.icon,
                                            pointerEvents: "none",
                                            lineHeight: 1,
                                          }}
                                        >
                                          /
                                        </Box>
                                      )} */}
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip
                                    // title="List of Encounter"
                                    arrow
                                    componentsProps={{
                                      tooltip: {
                                        sx: {
                                          bgcolor: "#000000",
                                          color: "rgba(15, 38, 70, 1)",
                                          fontSize: "0.75rem",
                                          [`& .${tooltipClasses.arrow}`]: {
                                            color: "#000000",
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      sx={{ p: "4px", flex: "0 0 auto" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenAction2(true);
                                      }}
                                    >
                                      <ActionIcon2 />
                                    </IconButton>
                                  </Tooltip>
                                  {openAction2 && (
                                    <Action2
                                      onClose={() => setOpenAction2(false)}
                                    />
                                  )}

                                  {openAction3 && (
                                    <Action3
                                      onClose={() => setOpenAction3(false)}
                                    />
                                  )}

                                  {canEditFacesheet && (
                                    <Tooltip
                                      // title="Facesheet"
                                      arrow
                                      componentsProps={{
                                        tooltip: {
                                          sx: {
                                            bgcolor: "#000000",
                                            color: "rgba(15, 38, 70, 1)",
                                            fontSize: "0.75rem",
                                            [`& .${tooltipClasses.arrow}`]: {
                                              color: "#000000",
                                            },
                                          },
                                        },
                                      }}
                                    >
                                      <IconButton
                                        size="small"
                                        sx={{
                                          p: "4px",
                                          flex: "0 0 auto",
                                          boxShadow: "none",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenAction3(true);
                                        }}
                                      >
                                        <ActionIcon3 />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  <Tooltip
                                    // title="Video"
                                    arrow
                                    componentsProps={{
                                      tooltip: {
                                        sx: {
                                          bgcolor: "#000000",
                                          color: "rgba(15, 38, 70, 1)",
                                          fontSize: "0.75rem",
                                          [`& .${tooltipClasses.arrow}`]: {
                                            color: "#000000",
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      sx={{ p: "4px", flex: "0 0 auto" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      <ActionIcon4 />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip
                                    // title="More options"
                                    arrow
                                    componentsProps={{
                                      tooltip: {
                                        sx: {
                                          bgcolor: "#000000",
                                          color: "rgba(15, 38, 70, 1)",
                                          fontSize: "0.75rem",
                                          [`& .${tooltipClasses.arrow}`]: {
                                            color: "#000000",
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      sx={{ p: "4px", flex: "0 0 auto" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMenuOpen(e, row.id);
                                      }}
                                    >
                                      <MoreVertIcon
                                        fontSize="small"
                                        sx={{ color: "rgba(210, 214, 219, 1)" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={sortedRows.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{
                borderTop: "1px solid rgba(255,255,255,0.10)",
                fontSize: "13px",
                flexShrink: 0,
                color: "rgba(210, 214, 219, 1)",
                "& .MuiTablePagination-toolbar": {
                  minHeight: "44px",
                  px: { xs: 1, sm: 2 },
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: { xs: "center", sm: "flex-end" },
                },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: { xs: "12px", sm: "13px" },
                    color: "#94A3B8",
                  },
                "& .MuiTablePagination-actions button": {
                  color: "rgba(210, 214, 219, 1)",
                },
              }}
            />
          </Box>
        </Box>

        {/* More Options Menu Popup */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "rgba(11, 29, 53, 1)",
              borderRadius: "12px",
              minWidth: "200px",
              border: "1px solid rgba(51, 74, 104, 1)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              backgroundImage: "none",
            },
            "& .MuiMenuItem-root": {
              py: 1.2,
              px: 2,
              gap: 1.5,
              fontSize: "14px",
              color: "rgba(210, 214, 219, 1)",
              "&:hover": {
                backgroundColor: "rgba(77,163,255,0.1)",
              },
            },
            "& .MuiDivider-root": {
              borderColor: "rgba(77,163,255,0.15)",
              my: 0.5,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              const selectedPatient = rows.find((r) => r.id === menuRowId);
              if (selectedPatient) handleViewVitalTrends(selectedPatient);
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
              }}
            >
              <ViewVitalIcon width={20} height={20} />
              <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                View Vital Trends
              </Typography>
            </Box>
          </MenuItem>

          {/* <Divider /> */}

          <MenuItem
            onClick={() => {
              const selectedPatient = rows.find((r) => r.id === menuRowId);
              if (selectedPatient) handleViewReport(selectedPatient);
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
              }}
            >
              <ViewReportIcon width={20} height={20} />
              <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                View report
              </Typography>
            </Box>
          </MenuItem>

          {/* <Divider /> */}

          <MenuItem
            onClick={() => {
              const selectedPatient = rows.find((r) => r.id === menuRowId);
              if (selectedPatient) handleShareReport(selectedPatient);
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
              }}
            >
              <ShareIcon width={20} height={20} />
              <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                Share report
              </Typography>
            </Box>
          </MenuItem>
        </Menu>

        <ViewVitalTrends
          open={openVitalTrends}
          onClose={() => setOpenVitalTrends(false)}
        />

        <ViewReport
          open={openViewReport}
          onClose={() => setOpenViewReport(false)}
        />

        <ShareReportDialog
          open={openShare}
          handleClose={() => setOpenShare(false)}
          patient={selectedPatient}
        />

        <Dialog
          open={openAssignModal}
          onClose={() => setOpenAssignModal(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            "& .MuiPaper-root": {
              borderRadius: "20px !important",
              overflow: "hidden",
              width: "500px",
              maxWidth: "460px",
              bgcolor: "rgba(7, 20, 40, 1)",
            },
          }}
        >
          <DialogContent
            sx={{ p: 0, display: "flex", flexDirection: "column" }}
          >
            {/* ── TOP HEADER BOX (separate bgcolor) ── */}
            <Box
              sx={{
                px: 3,
                py: 0,
                bgcolor: "rgba(7, 20, 40, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                fontWeight={600}
                fontSize={18}
                sx={{
                  color: "#fff",
                  fontFamily:
                    "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                }}
              >
                {assignType === "doctor" ? "Assign to Provider" : null}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setOpenAssignModal(false)}
              >
                <CloseIcon sx={{ fontSize: 20, color: "#fff" }} />
              </IconButton>
            </Box>

            {/* Divider */}
            <Box
              sx={{
                mt: 2,
                height: "1px",
                bgcolor: "#243B63",
              }}
            />

            {/* ── BOTTOM CONTENT BOX (separate bgcolor) ── */}
            <Box
              sx={{
                px: 3,
                pt: 2,
                pb: 3,
                bgcolor: "rgba(11, 29, 53, 1)",
                display: "flex",
                flexDirection: "column",
                maxHeight: "65vh",
              }}
            >
              {/* Search */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#243B63",
                  borderRadius: "20px",
                  px: 2,
                  py: 0.5,
                  mb: 2,
                }}
              >
                <SearchIcon sx={{ color: "#eee7e7", fontSize: 12 }} />
                <InputBase
                  placeholder="Search by name or specialty"
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  sx={{
                    ml: 1,
                    fontSize: "14px",
                    width: "100%",
                    color: "#fff",
                    "& input::placeholder": {
                      color: "#eee7e7",
                      opacity: 1,
                      fontFamily:
                        "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                    },
                  }}
                />
              </Box>

              {/* List */}
              <Box
                sx={{
                  overflowY: "auto",
                  flex: 1,
                  minHeight: 0,
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
              >
                {filteredAssignProviders.map((doc) => (
                  <Box
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoctor(doc.name);
                      setSelectedDoctorId(doc.id);
                    }}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: "14px",
                      mb: 1.5,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor:
                        selectedDoctorId === doc.id
                          ? "transparent"
                          : "rgba(255,255,255,0.08)",
                      bgcolor:
                        selectedDoctorId === doc.id ? "#243B63" : "transparent",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      "&:hover": {
                        bgcolor: "#243B63",
                        borderColor: "transparent",
                      },
                    }}
                  >
                    <Box>
                      <Typography
                        //fontSize={12}
                        //fontWeight={300}
                        sx={{
                          color: "#eee7e7",
                          fontSize: "12px",
                          fontWeight: 300,
                          fontFamily:
                            "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                        }}
                      >
                        {doc.name}
                      </Typography>
                      <Typography
                        //fontSize={10}
                        //fontWeight={300}
                        sx={{
                          color: "#228B22",
                          mt: 0.2,
                          fontSize: "12px",
                          fontFamily:
                            "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                        }}
                      >
                        {[doc.status, doc.specialty]
                          .filter(Boolean)
                          .join(" • ") || "Available"}
                      </Typography>
                    </Box>

                    {selectedDoctorId === doc.id && (
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          fontSize={12}
                          sx={{ color: "#1565FF", lineHeight: 1 }}
                        >
                          ✓
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}

                {/* {filteredAssignProviders.length === 0 && (
                  <Typography
                    sx={{ px: 1, py: 2, color: "#94A3B8", fontSize: 13 }}
                  >
                    {assignType === "resident"
                      ? "No residents found."
                      : null }
                  </Typography>
                )} */}
              </Box>

              {/* Assign Button */}
              <Button
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  borderRadius: "12px",
                  py: 1,
                  textTransform: "none",
                  fontWeight: 300,
                  fontSize: "14px",
                  bgcolor: "#1565FF",
                  "&:hover": { bgcolor: "#1251CC" },
                }}
                onClick={async () => {
                  if (!selectedDoctor || !selectedDoctorId) return;

                  const selectedIds =
                    selectionModel.size > 0
                      ? Array.from(selectionModel)
                      : selectedRow
                        ? [selectedRow.id]
                        : [];

                  if (selectedIds.length === 0) return;

                  setRows((prev) =>
                    prev.map((row) => {
                      if (!selectedIds.includes(row.id)) return row;
                      if (assignType === "resident") {
                        return {
                          ...row,
                          resident: selectedDoctor,
                          residentId: selectedDoctorId,
                        };
                      }
                      return {
                        ...row,
                        physician: selectedDoctor,
                        providerId: selectedDoctorId,
                      };
                    }),
                  );

                  setOpenAssignModal(false);
                  setSelectedDoctor("");
                  setSelectedDoctorId("");
                  setAssignSearch("");
                }}
              >
                {selectionModel.size > 1
                  ? "Assign to all Selected Patients"
                  : "Assign"}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Snackbar for notifications */}
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
    </>
  );
}
