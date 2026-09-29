import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MailIcon from "@mui/icons-material/Mail";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { getPhysicianSession } from "../../utils/physicianSession";
import { useThemeMode, getTheme } from "../../context/ThemeContext";
import {
  buildReportFileName,
  buildFullReportText,
  buildFullReportHtml,
} from "./reportBuilder";
import { generateReportPdf, buildMailtoUrl } from "../../services/reportPdf";
import LoadingSpinner from "../../componants/LoadingSpinner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EmailReportDialog({
  open,
  handleClose,
  caseData,
  aiSummary,
  patient,
}) {
  const { darkMode } = useThemeMode();
  const theme = getTheme(darkMode);

  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const safeCase = caseData || {};
  const safePatient = patient || {};

  const incidentId =
    safeCase.incidentId || safeCase.id || safePatient.incidentId || safePatient.id || "";
  const patientName =
    safeCase.patientName || safePatient.name || safePatient.full_name || "Patient";
  const fileName = buildReportFileName(patientName, incidentId);

  // ✅ Defaults are (re)built each time the dialog OPENS, using the data that
  //    is loaded at that moment (not the stale/null data from first mount).
  useEffect(() => {
    if (!open) return;

    const session = getPhysicianSession();
    setRecipients(
      [session?.email, safePatient.physicianEmail, safePatient.crewEmail]
        .filter(Boolean)
        .join(", "),
    );
    setSubject(
      `Final Case Report — ${patientName}${incidentId ? ` (${incidentId})` : ""}`,
    );
    try {
      setBody(buildFullReportText({ caseData, aiSummary, patient }));
    } catch (err) {
      console.error("BUILD REPORT TEXT ERROR =>", err);
      setBody("");
    }
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const makePdf = async () => {
    const html = buildFullReportHtml({ caseData, aiSummary, patient });
    await generateReportPdf(html, fileName);
  };

  const handleGeneratePdf = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    setError("");
    try {
      await makePdf();
    } catch (err) {
      console.error("PDF GENERATION ERROR =>", err);
      setError("Failed to generate the PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSend = async () => {
    const emails = recipients
      .split(/[,;]/)
      .map((e) => e.trim())
      .filter(Boolean);
    const invalid = emails.filter((e) => !EMAIL_RE.test(e));

    if (emails.length === 0) {
      setError("Please enter at least one recipient email address.");
      return;
    }
    if (invalid.length) {
      setError(`Invalid email address: ${invalid.join(", ")}`);
      return;
    }

    setError("");
    setSending(true);
    try {
      // 1) Download the full report PDF so it can be attached.
      await makePdf().catch((e) => console.error("PDF (email) ERROR =>", e));

      // 2) Open the mail client with recipients + subject + report body.
      window.location.href = buildMailtoUrl({ to: emails, subject, body });
      handleClose();
    } catch (err) {
      console.error("SEND EMAIL ERROR =>", err);
      setError("Failed to prepare the email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      background: theme.modalSurface,
      borderRadius: "10px",
      color: theme.textPrimary,
      "& fieldset": {
        border: darkMode
          ? "1px solid rgba(255,255,255,0.1)"
          : `1px solid ${theme.borderColor}`,
      },
    },
    "& input, & textarea": { color: theme.textPrimary, fontSize: "14px" },
    "& input::placeholder, & textarea::placeholder": {
      color: theme.textSecondary,
      opacity: 1,
    },
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: "calc(100% - 32px)", sm: "520px" },
          maxWidth: "100%",
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MailIcon sx={{ color: "#015DFF" }} />
          Email Final Report
        </Box>
        <IconButton onClick={handleClose} sx={{ color: theme.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ backgroundColor: theme.modalBg, color: theme.textPrimary, p: 3 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Typography sx={{ fontSize: "13px", color: theme.textSecondary }}>
            Recipient — comma separated email addresses
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="doctor@hospital.com, crew@airline.com"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            disabled={sending}
            sx={inputSx}
          />

          <TextField
            fullWidth
            size="small"
            label="Subject"
            variant="outlined"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sending}
            slotProps={{ inputLabel: { style: { color: theme.textSecondary } } }}
            sx={inputSx}
          />

          <TextField
            fullWidth
            label="Message (full report is pre-filled — edit if needed)"
            multiline
            minRows={7}
            maxRows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={sending}
            slotProps={{ inputLabel: { style: { color: theme.textSecondary } } }}
            sx={inputSx}
          />

          {error && (
            <Typography sx={{ fontSize: "13px", color: "#EF4444" }}>
              {error}
            </Typography>
          )}

          <Divider sx={{ borderColor: theme.divider }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PictureAsPdfIcon sx={{ color: theme.actionIconColor, fontSize: 20 }} />
            <Typography sx={{ flex: 1, fontSize: "13px", color: theme.textSecondary }}>
              The full report PDF is downloaded automatically when you send —
              attach it to the email before sending. Long reports are shortened
              in the email body.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ backgroundColor: theme.modalBg, px: 3, pb: 3, pt: 0 }}>
        <Button
          variant="outlined"
          onClick={handleGeneratePdf}
          disabled={pdfLoading || sending}
          startIcon={
            pdfLoading ? (
              <LoadingSpinner size="xs" variant="inline" />
            ) : (
              <PictureAsPdfIcon />
            )
          }
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            borderColor: theme.actionIconColor,
            color: theme.actionIconColor,
            "&:hover": {
              borderColor: theme.actionIconColor,
              background: "rgba(1,93,255,0.08)",
            },
          }}
        >
          {pdfLoading ? "Generating…" : "Generate PDF"}
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={sending || pdfLoading}
          startIcon={
            sending ? (
              <LoadingSpinner size="xs" variant="inline" color="#FFFFFF" />
            ) : (
              <MailIcon />
            )
          }
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            background: "#015DFF",
            boxShadow: "0px 4px 15px rgba(1,93,255,0.35)",
            "&:hover": { background: "#0048CC" },
          }}
        >
          {sending ? "Preparing…" : "Send Report"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmailReportDialog;