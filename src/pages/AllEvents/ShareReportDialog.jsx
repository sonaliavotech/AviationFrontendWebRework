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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function ShareReportDialog({ open, handleClose }) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          p: 1,
          width: { xs: "95%", sm: "500px" },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 700,
          fontSize: "18px",
          pb: 1,
        }}
      >
        Share Template

        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "#EBF1FE",
                  borderRadius: "10px",
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
            <Box
              sx={{
                flex: 1,
                height: "1px",
                background: "#E5E7EB",
              }}
            />

            <Typography
              sx={{
                fontSize: "13px",
                color: "#6B7280",
              }}
            >
              OR
            </Typography>

            <Box
              sx={{
                flex: 1,
                height: "1px",
                background: "#E5E7EB",
              }}
            />
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "#EBF1FE",
                  borderRadius: "10px",
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