import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import { useThemeMode, getTheme } from "../../context/ThemeContext";

function ShareReportDialog({ open, handleClose }) {
  const { darkMode } = useThemeMode();
  const theme = getTheme(darkMode);

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      background: theme.modalSurface,
      borderRadius: "8px",
      color: theme.textPrimary,
      height: "40px",
      display: "flex",
      alignItems: "center",
      "& fieldset": {
        border: darkMode ? "none" : `1px solid ${theme.borderColor}`,
      },
    },
    "& input": {
      color: theme.textPrimary,
      fontSize: "14px",
    },
    "& input::placeholder": {
      color: theme.textSecondary,
      opacity: 1,
    },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: "350px",
          borderRadius: "16px",
          backgroundColor: theme.modalBg,
          color: theme.textPrimary,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode
            ? "0px 10px 30px rgba(0,0,0,0.35)"
            : "0px 10px 30px rgba(15, 23, 42, 0.12)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
          fontSize: "18px",
          color: theme.textPrimary,
          backgroundColor: theme.modalHeaderBg,
          pb: 1,
        }}
      >
        Share template
        <IconButton onClick={handleClose} sx={{ color: theme.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          backgroundColor: theme.modalBg,
          color: theme.textPrimary,
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mt: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              fullWidth
              placeholder="Add comma separated emails to share"
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonAddIcon
                        sx={{ color: theme.actionIconColor, fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />
            <Button
              variant="contained"
              sx={{
                minWidth: { xs: "100%", sm: 90 },
                borderRadius: "10px",
                textTransform: "none",
                background: "#015DFF",
                "&:hover": { background: "#0147c7" },
              }}
            >
              Share
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ flex: 1, height: "1px", background: theme.divider }} />
            <Typography sx={{ fontSize: "13px", color: theme.textSecondary }}>
              OR
            </Typography>
            <Box sx={{ flex: 1, height: "1px", background: theme.divider }} />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              fullWidth
              placeholder="Everyone has access"
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupIcon
                        sx={{ color: theme.actionIconColor, fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />

            <Button
              variant="contained"
              sx={{
                minWidth: { xs: "100%", sm: 90 },
                borderRadius: "10px",
                textTransform: "none",
                background: "#015DFF",
                "&:hover": { background: "#0147c7" },
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ShareReportDialog;
