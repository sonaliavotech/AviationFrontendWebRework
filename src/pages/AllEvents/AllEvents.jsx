import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ROWS = [
  {
    id: 1,
    flightNum: "AA1234",
    seat: "A15",
    name: "Lisha Cook",
    age: "45y (F)",
    mrn: "719471345",
    patientId: "NA",
    status: "assign",
    route: "SYD → LAX",
    physician: null,
    crew: "Julia R",
  },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: i + 2,
    flightNum: "AA1234",
    seat: "A15",
    name: "Lisha Cook",
    age: "45y (F)",
    mrn: "719471345",
    patientId: "NA",
    status: "critical",
    route: "SYD → LAX",
    physician: "Alex Tobar",
    crew: "Julia R",
  })),
];

const STATS = [
  {
    label: "Events today",
    value: "XX",
    icon: <EventNoteOutlinedIcon sx={{ fontSize: 28, color: "#015DFF" }} />,
  },
  {
    label: "Patients to see",
    value: "XX/XX",
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: 28, color: "#015DFF" }} />,
  },
  {
    label: "Patients to assign",
    value: "XX",
    icon: <AssignmentIndOutlinedIcon sx={{ fontSize: 28, color: "#015DFF" }} />,
  },
  {
    label: "Critical Cases",
    value: "XX",
    icon: <ReportProblemOutlinedIcon sx={{ fontSize: 28, color: "#015DFF" }} />,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  if (status === "assign") {
    return (
      <Button
        size="small"
        variant="contained"
        sx={{
          bgcolor: "#FFF3CD",
          color: "#856404",
          boxShadow: "none",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: 12,
          px: 1.5,
          py: 0.3,
          textTransform: "none",
          "&:hover": { bgcolor: "#FFE69C", boxShadow: "none" },
          minWidth: 70,
        }}
      >
        Assign
      </Button>
    );
  }
  return (
    <Typography
      variant="body2"
      sx={{ fontWeight: 500, color: "#DC3545", fontSize: 13 }}
    >
      Critical
    </Typography>
  );
};

const PhysicianChip = ({ name }) => {
  if (!name) return null;
  return (
    <Box
      sx={{
        display: "inline-block",
        bgcolor: "#E8F4FD",
        color: "#015DFF",
        borderRadius: "8px",
        px: 1.5,
        py: 0.3,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {name}
    </Box>
  );
};

const CrewChip = ({ name }) => (
  <Box
    sx={{
      display: "inline-block",
      bgcolor: "#E3F9E5",
      color: "#1A7F37",
      borderRadius: "8px",
      px: 1.5,
      py: 0.3,
      fontSize: 12,
      fontWeight: 500,
    }}
  >
    {name}
  </Box>
);

const ActionButtons = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <Tooltip title="View">
      <IconButton size="small" sx={{ color: "#015DFF" }}>
        <VisibilityOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Medical Kit">
      <IconButton size="small" sx={{ color: "#015DFF" }}>
        <MedicalServicesOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Vitals">
      <IconButton size="small" sx={{ color: "#015DFF" }}>
        <FavoriteBorderOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Add">
      <IconButton size="small" sx={{ color: "#015DFF" }}>
        <AddCircleOutlineOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="More">
      <IconButton size="small" sx={{ color: "#777" }}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AllEvents = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");
  const [dateLabel] = useState("Jan 26");
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusAnchor, setStatusAnchor] = useState(null);
  const [routeAnchor, setRouteAnchor] = useState(null);
  const [physicianAnchor, setPhysicianAnchor] = useState(null);
  const [crewAnchor, setCrewAnchor] = useState(null);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(MOCK_ROWS.map((r) => r.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const filtered = MOCK_ROWS.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.flightNum.toLowerCase().includes(search.toLowerCase()) ||
      r.mrn.includes(search)
  );

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const doctorName = user?.email ? `Dr. ${user.email.split("@")[0]}` : "Dr. James Oktar";
  const specialty = "MD - Neurology";
  const initials = doctorName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const columnSx = {
    fontWeight: 700,
    fontSize: 12,
    color: "#555",
    borderBottom: "1px solid #EEF2F7",
    bgcolor: "#fff",
    py: 1.2,
    px: 1.5,
    whiteSpace: "nowrap",
  };

  const cellSx = {
    fontSize: 13,
    color: "#222",
    borderBottom: "1px solid #F3F4F8",
    py: 1.1,
    px: 1.5,
  };

  const SortableHeader = ({ label, anchor, setAnchor, options }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.3,
        cursor: "pointer",
        userSelect: "none",
        "&:hover": { color: "#015DFF" },
      }}
      onClick={(e) => setAnchor(e.currentTarget)}
    >
      {label}
      <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" } }}
      >
        {(options || ["All", "Option A", "Option B"]).map((opt) => (
          <MenuItem key={opt} onClick={() => setAnchor(null)} sx={{ fontSize: 13 }}>
            {opt}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#F8F9FC",
        overflow: "hidden",
      }}
    >
      {/* ── Top Header Bar ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: { xs: 2, md: 3 },
          py: 1.5,
          bgcolor: "#fff",
          borderBottom: "1px solid #EEF2F7",
          flexWrap: "wrap",
        }}
      >
        {/* Doctor info card */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "#015DFF",
            borderRadius: 3,
            px: 2,
            py: 1.2,
            minWidth: 210,
            mr: 1,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#F5A623",
              width: 38,
              height: 38,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography
              sx={{ fontSize: 11, color: "rgba(255,255,255,0.8)", lineHeight: 1 }}
            >
              Good morning 🌤
            </Typography>
            <Typography
              sx={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}
            >
              {doctorName}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
              {specialty}
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, md: 2 },
            flexWrap: "wrap",
            flex: 1,
          }}
        >
          {STATS.map((s) => (
            <Box
              key={s.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: "#F8F9FC",
                borderRadius: 2,
                px: 2,
                py: 1,
                minWidth: 110,
              }}
            >
              {s.icon}
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#111", lineHeight: 1 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#777", lineHeight: 1.3 }}>
                  {s.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Toolbar: Date picker + Search + Filter + Export ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: { xs: 2, md: 3 },
          py: 1.5,
          bgcolor: "#fff",
          borderBottom: "1px solid #EEF2F7",
          flexWrap: "wrap",
        }}
      >
        {/* Date nav */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            border: "1px solid #E0E4EB",
            borderRadius: 2,
            px: 1,
            py: 0.5,
          }}
        >
          <IconButton size="small">
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "#777" }} />
          <Typography sx={{ fontSize: 13, fontWeight: 600, px: 0.5 }}>
            {dateLabel}
          </Typography>
          <IconButton size="small">
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search flight route, patients by name or MRN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            flex: 1,
            minWidth: 200,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: 13,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#aaa" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Filter */}
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{
            borderColor: "#E0E4EB",
            color: "#333",
            borderRadius: 2,
            fontWeight: 500,
            fontSize: 13,
            textTransform: "none",
            px: 2,
            "&:hover": { borderColor: "#015DFF", color: "#015DFF" },
          }}
        >
          Filter
        </Button>

        {/* Export */}
        <Button
          variant="outlined"
          startIcon={<FileDownloadOutlinedIcon />}
          sx={{
            borderColor: "#E0E4EB",
            color: "#333",
            borderRadius: 2,
            fontWeight: 500,
            fontSize: 13,
            textTransform: "none",
            px: 2,
            "&:hover": { borderColor: "#015DFF", color: "#015DFF" },
          }}
        >
          Export
        </Button>
      </Box>

      {/* ── Data Table ── */}
      <Box sx={{ flex: 1, overflow: "auto", px: { xs: 0, md: 2 }, py: 1 }}>
        <TableContainer
          sx={{
            bgcolor: "#fff",
            borderRadius: { xs: 0, md: 2 },
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            overflow: "auto",
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ ...columnSx, pl: 2 }}>
                  <Checkbox
                    size="small"
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < MOCK_ROWS.length
                    }
                    checked={selectedRows.length === MOCK_ROWS.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={columnSx}>
                  Flight # <br /> Seat
                </TableCell>
                <TableCell sx={columnSx}>
                  Name <br /> Age (Gender)
                </TableCell>
                <TableCell sx={columnSx}>
                  MRN <br /> (Patient ID)
                </TableCell>
                <TableCell sx={columnSx}>
                  <SortableHeader
                    label="Status"
                    anchor={statusAnchor}
                    setAnchor={setStatusAnchor}
                    options={["All", "Critical", "Assign", "Stable"]}
                  />
                </TableCell>
                <TableCell sx={columnSx}>
                  <SortableHeader
                    label="Flight Route"
                    anchor={routeAnchor}
                    setAnchor={setRouteAnchor}
                    options={["All", "SYD → LAX", "LAX → JFK", "JFK → LHR"]}
                  />
                </TableCell>
                <TableCell sx={columnSx}>
                  <SortableHeader
                    label="Physician"
                    anchor={physicianAnchor}
                    setAnchor={setPhysicianAnchor}
                    options={["All", "Alex Tobar", "Dr. Smith"]}
                  />
                </TableCell>
                <TableCell sx={columnSx}>
                  <SortableHeader
                    label="Crew"
                    anchor={crewAnchor}
                    setAnchor={setCrewAnchor}
                    options={["All", "Julia R", "Mark T"]}
                  />
                </TableCell>
                <TableCell sx={columnSx}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  selected={selectedRows.includes(row.id)}
                  sx={{
                    "&.Mui-selected": { bgcolor: "#F0F5FF" },
                    "&.Mui-selected:hover": { bgcolor: "#E8EFFF" },
                    cursor: "pointer",
                  }}
                >
                  <TableCell padding="checkbox" sx={{ pl: 2 }}>
                    <Checkbox
                      size="small"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                    />
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                      {row.flightNum}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#888" }}>
                      {row.seat}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                      {row.name}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#888" }}>
                      {row.age}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Typography sx={{ fontSize: 13 }}>{row.mrn}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#888" }}>
                      ID: {row.patientId}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                      {row.route}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cellSx}>
                    {row.physician ? (
                      <PhysicianChip name={row.physician} />
                    ) : (
                      <Typography sx={{ fontSize: 12, color: "#aaa" }}>
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <CrewChip name={row.crew} />
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <ActionButtons />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AllEvents;
