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

function ShareReportDialog({ open, handleClose }) {
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
          backgroundColor: "rgba(11, 29, 53, 1)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.35)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
          fontSize: "18px",
          color: "#FFFFFF",
          backgroundColor: "rgba(11, 29, 53, 1)",
          pb: 1,
        }}
      >
        Share template
        <IconButton onClick={handleClose} sx={{ color: "#6E7B91" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          backgroundColor: "rgba(11, 29, 53, 1)",
          color: "#fff",
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(11, 29, 53, 1)",
            gap: 3,
            mt: 1,
          }}
        >
          {/* Row 1 */}
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
                      <PersonAddIcon sx={{ color: "#1976d2", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "#243B63",
                  borderRadius: "8px",
                  color: "#fff",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  "& fieldset": { border: "none" },
                },
                "& input": {
                  color: "#fff",
                  fontSize: "14px",
                },
                "& input::placeholder": {
                  color: "#fff",
                  opacity: 1,
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                minWidth: { xs: "100%", sm: 90 },
                borderRadius: "10px",
                textTransform: "none",
                background: "#1565FF",
              }}
            >
              Share
            </Button>
          </Box>

          {/* OR Divider */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1, height: "1px", background: "#2D4267" }} />
            <Typography sx={{ fontSize: "13px", color: "#6E7B91" }}>
              OR
            </Typography>
            <Box sx={{ flex: 1, height: "1px", background: "#2D4267" }} />
          </Box>

          {/* Row 2 */}
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
                      <GroupIcon sx={{ color: "#1976d2", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "#243B63",
                  borderRadius: "8px",
                  color: "#fff",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  "& fieldset": { border: "none" },
                },
                "& input": {
                  color: "#fff",
                  fontSize: "14px",
                },
                "& input::placeholder": {
                  color: "#fff",
                  opacity: 1,
                },
              }}
            />

            <Button
              variant="contained"
              sx={{
                minWidth: { xs: "100%", sm: 90 },
                borderRadius: "10px",
                textTransform: "none",
                background: "#1565FF",
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
