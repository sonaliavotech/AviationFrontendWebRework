import React from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SyncIcon from "@mui/icons-material/Sync";
import VideocamIcon from "@mui/icons-material/Videocam";
import { AlertsIcon } from "../../assets/Assets";

const SIDEBAR_BG = "#0B1D35";
const CARD_BG = "#102543";
const INNER_CARD_BG = "#0D213D";
const PRIMARY_BLUE = "#015DFF";
const ACTIVE_COLOR = "#4DA3FF";

const SearchKit = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: SIDEBAR_BG,
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Top Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}
      >
        {/* Left */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Chip
            icon={<CheckCircleIcon sx={{ color: "#22C55E !important" }} />}
            label="Device Connected"
            sx={{
              background: "rgba(34,197,94,0.15)",
              color: "#22C55E",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "30px",
              height: 42,
              fontWeight: 500,
            }}
          />

          <Chip
            icon={<SyncIcon sx={{ color: `${ACTIVE_COLOR} !important` }} />}
            label="Last Synced Today 12:00 PM"
            sx={{
              background: "rgba(77,163,255,0.15)",
              color: "#BFD8FF",
              border: "1px solid rgba(77,163,255,0.25)",
              borderRadius: "30px",
              height: 42,
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Right */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Tooltip title="Join Video Call" arrow>
            <Button
              variant="contained"
              startIcon={<VideocamIcon />}
              sx={{
                background: PRIMARY_BLUE,
                borderRadius: "14px",
                textTransform: "none",
                px: 3,
                height: 44,
                fontWeight: 600,
                boxShadow: "0px 4px 15px rgba(1,93,255,0.35)",
                "&:hover": {
                  background: "#0048CC",
                },
              }}
            >
              Join Now
            </Button>
          </Tooltip>

          <Tooltip title="Alerts" arrow>
            <IconButton
              sx={{
                width: 46,
                height: 46,
                background: PRIMARY_BLUE,
                borderRadius: "12px",
                boxShadow: "0px 4px 15px rgba(1,93,255,0.35)",
                "&:hover": {
                  background: "#0048CC",
                },
              }}
            >
              <AlertsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Heading */}
      <Typography
        sx={{
          fontSize: { xs: "24px", md: "30px" },
          fontWeight: 600,
          color: "#FFFFFF",
          mb: 1,
        }}
      >
        Case Outcome & Final Report
      </Typography>

      <Typography
        sx={{
          color: "#AFC2D8",
          fontSize: { xs: "14px", md: "16px" },
          mb: 4,
          maxWidth: "900px",
        }}
      >
        Choose the option that best describes what happened. This will become
        the official record for the medical team.
      </Typography>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}
      >
        <Button
          variant="contained"
          sx={{
            background: PRIMARY_BLUE,
            borderRadius: "12px",
            textTransform: "none",
            px: 3,
            py: 1.4,
            fontWeight: 600,
            boxShadow: "0px 4px 15px rgba(1,93,255,0.35)",
            "&:hover": {
              background: "#0048CC",
            },
          }}
        >
          Generate Full Report PDF
        </Button>

        <Button
          variant="outlined"
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            px: 3,
            py: 1.4,
            fontWeight: 600,
            borderColor: ACTIVE_COLOR,
            color: ACTIVE_COLOR,
            "&:hover": {
              borderColor: ACTIVE_COLOR,
              background: "rgba(77,163,255,0.08)",
            },
          }}
        >
          Email Final Report
        </Button>
      </Box>

      {/* Summary Card */}
      <Paper
        elevation={0}
        sx={{
          background: CARD_BG,
          borderRadius: "20px",
          p: 3,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            background: INNER_CARD_BG,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            p: 1.5,
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              color: "#FFFFFF",
            }}
          >
            Case Summary for John Smith
          </Typography>
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            minHeight: { xs: 100, sm: 120, md: 180 },
            background: INNER_CARD_BG,
            p: 3,
          }}
        ></Box>
        <Typography
          sx={{
            mt: 4,
            color: ACTIVE_COLOR,
            fontSize: "16px",
            fontWeight: 500,
            mb: 2,
          }}
        >
          AI Summary of the Event
        </Typography>

        <Typography
          sx={{
            color: ACTIVE_COLOR,
            fontSize: "16px",
            fontWeight: 500,
            mb: 1,
          }}
        >
          Patient Vitals
        </Typography>
      </Paper>
    </Box>
  );
};

export default SearchKit;
