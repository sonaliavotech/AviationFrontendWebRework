import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  FormControl,
  OutlinedInput,
  FormHelperText,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import rightImg from "../assets/signInBgimg.png";
import logo2 from "../assets/logo4.png";
import { TitleRoundIcon } from "../assets/Assets";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
// import { loginSuccess } from "../../redux/slices/authSlice";
// import { fetchMyPermissions } from "../../redux/slices/permissionsSlice";
// import { useDispatch, useSelector } from "react-redux";
// import { selectIsLoggedIn } from "../../redux/slices/authSelectors";
// import {
//   loginApi,
//   verifyOtpApi,
//   resendOtpApi,
//   fpSendOtpApi,
//   fpVerifyOtpApi,
//   fpResetPasswordApi,
//   fpResendOtpApi,
// } from "../../lib/api-auth";

let PhoneInput;
try {
  PhoneInput = require("react-phone-input-2").default;
  require("react-phone-input-2/lib/style.css");
} catch (e) {
  PhoneInput = null;
}

const SignInForm = () => {
  const navigate = useNavigate();
  // const dispatch = useDispatch();
  // const isLoggedIn = useSelector(selectIsLoggedIn);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    return () => {
      document.body.style.overflow = "";
      document.body.style.margin = "";
    };
  }, []);

  // React.useEffect(() => {
  //   if (isLoggedIn) {
  //     navigate("/Dashboard", { replace: true });
  //   }
  // }, [isLoggedIn,navigate]);
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/Dashboard", { replace: true });
    }
  }, []);

  // 2FA state - commented out for fake login
  // const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  // const [twoFactorOtp, setTwoFactorOtp] = useState("");
  // const [twoFactorError, setTwoFactorError] = useState("");
  // const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  // const [pendingLoginData, setPendingLoginData] = useState(null);
  // const [twoFactorResendLoading, setTwoFactorResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2FA OTP expiry countdown (5 min = 300s) and resend cooldown (60s)
  // const OTP_TTL = 5 * 60; // seconds — must match backend otpStore TTL
  // const [otpExpiryTimer, setOtpExpiryTimer] = useState(0);
  // const [twoFactorResendTimer, setTwoFactorResendTimer] = useState(0);

  // Tick the 2FA expiry countdown
  // React.useEffect(() => {
  //   if (otpExpiryTimer <= 0) return;
  //   const id = setTimeout(() => setOtpExpiryTimer((t) => t - 1), 1000);
  //   return () => clearTimeout(id);
  // }, [otpExpiryTimer]);

  // Tick the 2FA resend cooldown
  // React.useEffect(() => {
  //   if (twoFactorResendTimer <= 0) return;
  //   const id = setTimeout(() => setTwoFactorResendTimer((t) => t - 1), 1000);
  //   return () => clearTimeout(id);
  // }, [twoFactorResendTimer]);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInEmailError, setSignInEmailError] = useState("");
  const [signInPasswordError, setSignInPasswordError] = useState("");
  const [generalSignInError, setGeneralSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ── Forgot Password state ──
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [fpStep, setFpStep] = useState(1); // 1 = email, 2 = OTP, 3 = new password
  const [fpEmail, setFpEmail] = useState("");
  const [fpEmailError, setFpEmailError] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpOtpError, setFpOtpError] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpNewPasswordError, setFpNewPasswordError] = useState("");
  const [fpConfirmPasswordError, setFpConfirmPasswordError] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpSuccess, setFpSuccess] = useState(false);
  const [showFpNewPassword, setShowFpNewPassword] = useState(false);
  const [showFpConfirmPassword, setShowFpConfirmPassword] = useState(false);
  const [fpResendTimer, setFpResendTimer] = useState(0);
  const [fpResendLoading, setFpResendLoading] = useState(false);
  const [fpResetToken, setFpResetToken] = useState("");

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (fpResendTimer <= 0) return;
    const id = setTimeout(() => setFpResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [fpResendTimer]);

  const openForgotPassword = () => {
    setShowForgotPassword(true);
    setFpStep(1);
    setFpEmail("");
    setFpEmailError("");
    setFpOtp("");
    setFpOtpError("");
    setFpNewPassword("");
    setFpConfirmPassword("");
    setFpNewPasswordError("");
    setFpConfirmPasswordError("");
    setFpLoading(false);
    setFpSuccess(false);
    setFpResendTimer(0);
    setFpResetToken("");
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
  };

  const handleFpSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    if (!fpEmail.trim()) {
      setFpEmailError("Email is required");
      return;
    }
    if (!emailRegex.test(fpEmail)) {
      setFpEmailError("Please enter a valid email address");
      return;
    }
    setFpEmailError("");
    setFpLoading(true);
    try {
      // Mock API call - replace with actual API when needed
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await fpSendOtpApi(fpEmail.trim().toLowerCase());
      setFpStep(2);
      setFpOtp("");
      setFpOtpError("");
      setFpResendTimer(60);
    } catch (error) {
      setFpEmailError(
        error?.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setFpLoading(false);
    }
  };

  const handleFpOtpChange = (index, value) => {
    const arr = fpOtp.split("");
    arr[index] = value;
    const next = arr.join("");
    setFpOtp(next);
    if (fpOtpError) setFpOtpError("");
    if (value && index < 5) {
      const el = document.getElementById(`fp-otp-${index + 1}`);
      if (el) el.focus();
    }
  };

  const handleFpOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !fpOtp[index] && index > 0) {
      const el = document.getElementById(`fp-otp-${index - 1}`);
      if (el) el.focus();
    }
  };

  const handleFpOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;
    setFpOtp(pasted.padEnd(6, "").slice(0, 6));
    if (fpOtpError) setFpOtpError("");
    // Focus the next empty box or the last one
    const nextIndex = Math.min(pasted.length, 5);
    const el = document.getElementById(`fp-otp-${nextIndex}`);
    if (el) el.focus();
  };

  const getOtpValidationMessage = (error) => {
    const rawMessage = String(
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "",
    ).toLowerCase();

    if (
      rawMessage.includes("invalid") ||
      rawMessage.includes("incorrect") ||
      rawMessage.includes("wrong")
    ) {
      return "Invalid OTP. Please check the code and try again.";
    }

    if (rawMessage.includes("expired")) {
      return "OTP has expired. Please resend the code and try again.";
    }

    return "Unable to verify OTP. Please try again.";
  };

  const handleFpVerifyOtp = async () => {
    if (!fpOtp.trim() || fpOtp.length < 6) {
      setFpOtpError("Please enter the 6-digit OTP");
      return;
    }
    setFpOtpError("");
    setFpLoading(true);
    try {
      // Mock API call - replace with actual API when needed
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const res = await fpVerifyOtpApi({
      //   email: fpEmail.trim().toLowerCase(),
      //   otp: fpOtp.trim(),
      // });
      setFpResetToken("mock_reset_token_" + Date.now());
      setFpStep(3);
      setFpNewPassword("");
      setFpConfirmPassword("");
      setFpNewPasswordError("");
      setFpConfirmPasswordError("");
    } catch (error) {
      setFpOtpError(getOtpValidationMessage(error));
    } finally {
      setFpLoading(false);
    }
  };

  const handleFpResendOtp = async () => {
    setFpResendLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await fpResendOtpApi(fpEmail.trim().toLowerCase());
      setFpOtp("");
      setFpOtpError("");
      setFpResendTimer(60);
    } catch (error) {
      setFpOtpError(
        error?.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setFpResendLoading(false);
    }
  };

  const handleFpResetPassword = async () => {
    let hasError = false;
    if (!fpNewPassword.trim()) {
      setFpNewPasswordError("New password is required");
      hasError = true;
    } else if (fpNewPassword.length < 8) {
      setFpNewPasswordError("Password must be at least 8 characters");
      hasError = true;
    } else {
      setFpNewPasswordError("");
    }
    if (!fpConfirmPassword.trim()) {
      setFpConfirmPasswordError("Please confirm your password");
      hasError = true;
    } else if (fpNewPassword !== fpConfirmPassword) {
      setFpConfirmPasswordError("Passwords do not match");
      hasError = true;
    } else {
      setFpConfirmPasswordError("");
    }
    if (hasError) return;

    setFpLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await fpResetPasswordApi({
      //   email: fpEmail.trim().toLowerCase(),
      //   resetToken: fpResetToken,
      //   newPassword: fpNewPassword,
      // });
      setFpSuccess(true);
      // Auto-redirect to sign-in after 2 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setFpSuccess(false);
        setFpStep(1);
        setFpResetToken("");
      }, 2000);
    } catch (error) {
      setFpNewPasswordError(
        error?.response?.data?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setFpLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (e) => e.preventDefault();

  const handleSignInEmailChange = (e) => {
    const value = e.target.value;
    setSignInEmail(value);
    if (signInEmailError) setSignInEmailError("");
    if (generalSignInError) setGeneralSignInError("");
    if (value.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
      if (!emailRegex.test(value))
        setSignInEmailError("Please enter a valid email address");
    } else if (value.trim()) {
      const phoneDigits = value.replace(/\D/g, "");
      const cleanDigits = phoneDigits.replace(/^(\d{1,3})/, "");
      if (
        phoneDigits.length > 0 &&
        (cleanDigits.length < 8 || cleanDigits.length > 15)
      ) {
        setSignInEmailError("Please enter a valid phone number (8-15 digits)");
      }
    }
  };

  const handleSignInPasswordChange = (e) => {
    const value = e.target.value;
    setSignInPassword(value);
    if (signInPasswordError) setSignInPasswordError("");
    if (generalSignInError) setGeneralSignInError("");
    if (value.trim() && value.length < 4)
      setSignInPasswordError("Password must be at least 4 characters");
  };

  // FAKE LOGIN - Direct login without 2FA
  const handleSignIn = async () => {
    setSignInEmailError("");
    setSignInPasswordError("");
    setGeneralSignInError("");

    let hasError = false;

    if (!signInEmail.trim()) {
      setSignInEmailError("Email is required");
      hasError = true;
    }

    if (!signInPassword.trim()) {
      setSignInPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;

    try {
      setSignInLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create fake user data based on email
      const mockUser = {
        id: "mock_user_" + Date.now(),
        email: signInEmail.trim(),
        userRole: signInEmail.includes("admin") ? "Super Admin" :
          signInEmail.includes("provider") ? "Provider" :
            signInEmail.includes("tenant") ? "Tenant" : "User",
        name: signInEmail.split('@')[0],
        roles: [signInEmail.includes("admin") ? "SUPER_ADMIN" :
          signInEmail.includes("provider") ? "PROVIDER" :
            signInEmail.includes("tenant") ? "TENANT" : "USER"]
      };

      const mockToken = "mock_jwt_token_" + Date.now() + "_" + Math.random().toString(36).substr(2);

      // Save to localStorage
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("role", mockUser.userRole);

      // Dispatch actions if needed (uncomment when redux is set up)
      // dispatch(loginSuccess({ token: mockToken, user: mockUser }));
      // dispatch(fetchMyPermissions());

      setSnackbar({
        open: true,
        message: "Sign-in successful",
        severity: "success",
      });

      // Navigate to dashboard
      navigate("/Dashboard", { replace: true });

    } catch (error) {
      setGeneralSignInError("Login failed. Please check your credentials and try again.");
    } finally {
      setSignInLoading(false);
    }
  };

  // Commented out 2FA handlers
  // const handleVerifyTwoFactor = async () => { ... };
  // const handleOtpChange = (index, value) => { ... };
  // const handleOtpKeyDown = (index, e) => { ... };
  // const handleOtpPaste = (e) => { ... };
  // const handleResendTwoFactorCode = async () => { ... };
  // const handleCloseTwoFactorPopup = () => { ... };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  /** 6 OTP cells — flex so row never overflows narrow viewports */
  const otpGap = isXs ? 6 : 12;
  const otpInputBase = {
    flex: "1 1 0",
    minWidth: isXs ? 28 : 40,
    maxWidth: 52,
    textAlign: "center",
    fontWeight: 600,
    border: "2px solid #E5E7EB",
    borderRadius: "8px",
    backgroundColor: "#fff",
    color: "#111827",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const inputSx = {
    "& .MuiOutlinedInput-root, &.MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#112339",
      // boxShadow:
      //   "0px 2px 4px 1px #E7EBEE55 inset, 0 4px 12px rgba(0, 0, 0, 0.06), 0 8px 20px rgba(0, 0, 0, 0.04)",
      // transition: "box-shadow 0.2s ease",
      "& fieldset": {
        border: "1px solid #334A68",
      },
      "&:hover fieldset": {
        border: "1px solid #334A68",
      },
      "&.Mui-focused fieldset": {
        border: "1px solid #334A68",
      },
      "&.Mui-focused": {
        boxShadow:
          "0px 2px 6px 2px #E7EBEE66 inset, 0 6px 16px rgba(1, 93, 255, 0.15), 0 10px 24px rgba(1, 93, 255, 0.08)",
      },
      "&.Mui-focused fieldset": { borderColor: "#718096" },
    },
    "& .MuiOutlinedInput-input": {
      padding: { xs: "12px 14px", sm: "12px 14px" },
      /* 16px on small screens avoids iOS zoom-on-focus */
      fontSize: { xs: "16px", sm: "15px" },
      color: "#718096",
    },
    "& .MuiOutlinedInput-input::placeholder": { color: "#718096", opacity: 1 },
    "& .MuiInputAdornment-root": { marginRight: "6px" },
    // Hide browser native password reveal button
    "& input::-ms-reveal, & input::-ms-clear": { display: "none" },
    "& input::-webkit-credentials-auto-fill-button": { display: "none" },
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        height: { xs: "100dvh", md: "100vh" },
        overflow: "hidden",
        display: "flex",
        "@supports not (height: 100dvh)": {
          minHeight: "-webkit-fill-available",
          height: { xs: "-webkit-fill-available", md: "100vh" },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          minHeight: 0,
          flex: 1,
          overflow: { xs: "visible", md: "hidden" },
        }}
      >
        {/* ── Left column — below md: after hero image (order) ── */}
        <Box
          sx={{
            order: { xs: 1, md: 0 },
            flex: { xs: "1 1 auto", md: 0.8 },
            minWidth: 0,
            minHeight: 0,
            pl: {
              xs: "max(16px, env(safe-area-inset-left, 0px))",
              sm: 4,
              md: 8,
            },
            pr: {
              xs: "max(16px, env(safe-area-inset-right, 0px))",
              sm: 4,
              md: 8,
            },
            py: { xs: 2.75, sm: 4, md: 2 },
            pt: { xs: 2.25, sm: 4, md: 4 },
            pb: {
              xs: "max(24px, env(safe-area-inset-bottom, 0px))",
              sm: 4,
              md: 4,
            },
            background: {
              xs: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 48%, #eef2f6 100%)",
              md: "#ffffff",
            },
            backgroundColor: { xs: "transparent", md: "#0B1D35" },
            display: "flex",
            flexDirection: "column",
            justifyContent: { xs: "flex-start", sm: "center" },
            minHeight: 0,
            height: "100%",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            borderRadius: { xs: "24px 24px 0 0", md: 0 },
            boxShadow: {
              xs: "0 -6px 28px rgba(15, 23, 42, 0.06)",
              md: "none",
            },
            position: { xs: "relative", md: "static" },
            zIndex: { xs: 1, md: "auto" },
            mt: { xs: "-14px", md: 0 },
          }}
        >
          {/* ── Forgot Password UI ── */}
          {showForgotPassword ? (
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: "100%", sm: 420, md: 480 },
                mx: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Logo */}
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Box
                  component="img"
                  src={logo2}
                  alt="Logo"
                  sx={{
                    width: { xs: 100, sm: 130, md: 150 },
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </Box>

              {/* Step indicator dots — left-aligned, shown after title+subtitle */}

              {/* Shared: title + back-link + dots (shown on all steps) */}
              {!fpSuccess && (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#D2D6DB", mb: 0.5, fontSize: { xs: "24px", sm: "28px", md: "32px" }, letterSpacing: "-0.02em" }}>
                    {fpStep === 1 ? 'Reset password' : fpStep === 2 ? 'Enter OTP' : 'Set new password'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280", mb: 1.5, fontSize: { xs: "13px", sm: "14px" } }}>
                    Back to sign in?{' '}
                    <MuiLink component="button" type="button" onClick={closeForgotPassword}
                      sx={{ color: "#015DFF", fontWeight: 500, fontSize: { xs: "13px", sm: "14px" }, textDecoration: "none", cursor: "pointer", background: "none", border: "none", padding: 0, "&:hover": { color: "#0040B3", textDecoration: "underline" } }}>
                      Sign in
                    </MuiLink>
                  </Typography>
                  {/* Step dots — center-aligned */}
                  <Box sx={{ display: "flex", gap: 1, mb: 2.5, justifyContent: "center" }}>
                    {[1, 2, 3].map((s) => (
                      <Box key={s} sx={{ width: s === fpStep ? 24 : 8, height: 8, borderRadius: "4px", backgroundColor: s === fpStep ? "#015DFF" : s < fpStep ? "#015DFF" : "#D1D5DB", transition: "all 0.3s ease", opacity: s < fpStep ? 0.4 : 1 }} />
                    ))}
                  </Box>
                </>
              )}

              {/* Success state — shows inline on step 3, then auto-redirects */}
              {fpSuccess ? (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#111827", mb: 1, fontSize: { xs: "24px", sm: "28px", md: "32px" }, letterSpacing: "-0.02em" }}>
                    Reset Password
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280", mb: 3, fontSize: { xs: "14px", sm: "15px" } }}>
                    Choose a strong new password for your account.
                  </Typography>

                  {/* New password — disabled after success */}
                  <Typography variant="body2" sx={{ color: "#718096", fontWeight: 500, mb: 1, fontSize: { xs: "12px", sm: "14px", md: "16px" } }}>
                    New password <Box component="span" sx={{ color: "red" }}>*</Box>
                  </Typography>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <OutlinedInput type="password" value={fpNewPassword} disabled sx={inputSx} />
                  </FormControl>

                  <Typography variant="body2" sx={{ color: "#718096", fontWeight: 500, mb: 1, fontSize: { xs: "12px", sm: "14px", md: "16px" } }}>
                    Confirm password <Box component="span" sx={{ color: "red" }}>*</Box>
                  </Typography>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <OutlinedInput type="password" value={fpConfirmPassword} disabled sx={inputSx} />
                  </FormControl>

                  <Alert severity="success" sx={{ borderRadius: "8px", fontFamily: "'Inter', sans-serif", mb: 1 }}>
                    Password reset successful! You can now sign in with your new password.
                  </Alert>
                </Box>
              ) : (
                <>
                  {/* Step 1 — Enter email */}
                  {fpStep === 1 && (
                    <Box>
                      <Typography variant="body2" sx={{ color: "#6B7280", mb: 3, fontSize: { xs: "12px", sm: "14px" } }}>
                        Enter your registered email address and we'll send you an OTP.
                      </Typography>
                      {/* <Typography variant="body2" sx={{ color: "#718096", fontWeight: 500, mb: 1, fontSize: { xs: "14px", sm: "15px", md: "16px" } }}>
                        Email address <Box component="span" sx={{ color: "red" }}>*</Box>
                      </Typography> */}
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter your email"
                        value={fpEmail}
                        onChange={(e) => { setFpEmail(e.target.value); if (fpEmailError) setFpEmailError(""); }}
                        error={!!fpEmailError}
                        helperText={fpEmailError}
                        autoCapitalize="none"
                        sx={{ mb: 2, ...inputSx }}
                        onKeyDown={(e) => { if (e.key === "Enter") handleFpSendOtp(); }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={fpLoading}
                        onClick={handleFpSendOtp}
                        sx={{ backgroundColor: "#015DFF", color: "white", py: { xs: "8px", sm: "10px" }, fontSize: { xs: "12px", sm: "14px" }, fontWeight: 600, borderRadius: "8px", textTransform: "none", "&:hover": { backgroundColor: "#0040B3" } }}
                      >
                        {fpLoading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Send OTP"}
                      </Button>
                    </Box>
                  )}

                  {/* Step 2 — Enter OTP */}
                  {fpStep === 2 && (
                    <Box>
                      <Typography variant="body2" sx={{ color: "#6B7280", mb: 3, fontSize: { xs: "12px", sm: "14px" } }}>
                        Enter the 6-digit code sent to <strong>{fpEmail}</strong>
                      </Typography>

                      {/* OTP boxes */}
                      <Box
                        sx={{
                          display: "flex",
                          gap: `${otpGap}px`,
                          justifyContent: "center",
                          mb: 2,
                          width: "100%",
                          maxWidth: "100%",
                        }}
                      >
                        {Array.from({ length: 6 }).map((_, index) => (
                          <input
                            key={index}
                            id={`fp-otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={fpOtp[index] || ""}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              if (val) handleFpOtpChange(index, val);
                              else handleFpOtpChange(index, "");
                            }}
                            onKeyDown={(e) => handleFpOtpKeyDown(index, e)}
                            onPaste={handleFpOtpPaste}
                            style={{
                              ...otpInputBase,
                              height: isXs ? 44 : 52,
                              fontSize: isXs ? 20 : 24,
                              border: fpOtpError
                                ? "2px solid #EF4444"
                                : "2px solid #E5E7EB",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#015DFF")}
                            onBlur={(e) =>
                            (e.target.style.borderColor = fpOtpError
                              ? "#EF4444"
                              : "#E5E7EB")
                            }
                          />
                        ))}
                      </Box>

                      {fpOtpError && (
                        <Typography variant="caption" sx={{ color: "#EF4444", display: "block", textAlign: "center", mb: 1 }}>
                          {fpOtpError}
                        </Typography>
                      )}

                      {/* Resend row */}
                      <Box sx={{ textAlign: "center", mb: 2 }}>
                        <Typography variant="body2" sx={{ color: "#6B7280", display: "inline", fontSize: { xs: "12px", sm: "14px" } }}>
                          Didn't receive a code?{" "}
                        </Typography>
                        {fpResendTimer > 0 ? (
                          <Typography variant="body2" sx={{ display: "inline", color: "#9CA3AF", fontSize: { xs: "12px", sm: "14px" } }}>
                            Resend in {fpResendTimer}s
                          </Typography>
                        ) : (
                          <MuiLink
                            component="button"
                            type="button"
                            onClick={handleFpResendOtp}
                            disabled={fpResendLoading}
                            sx={{ color: "#015DFF", fontWeight: 600, textDecoration: "underline", cursor: "pointer", background: "none", border: "none", padding: 0, fontSize: { xs: "12px", sm: "14px" }, "&:hover": { color: "#0040B3" } }}
                          >
                            {fpResendLoading ? "Sending…" : "Resend"}
                          </MuiLink>
                        )}
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        disabled={fpLoading || fpOtp.length !== 6}
                        onClick={handleFpVerifyOtp}
                        sx={{ backgroundColor: "#015DFF", color: "white", py: { xs: "8px", sm: "10px" }, fontSize: { xs: "12px", sm: "14px" }, fontWeight: 600, borderRadius: "8px", textTransform: "none", "&:hover": { backgroundColor: "#0040B3" }, "&:disabled": { backgroundColor: "#93C5FD" } }}
                      >
                        {fpLoading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Verify OTP"}
                      </Button>
                    </Box>
                  )}

                  {/* Step 3 — New password */}
                  {fpStep === 3 && (
                    <Box>
                      <Typography variant="body2" sx={{ color: "#6B7280", mb: 3, fontSize: { xs: "14px", sm: "15px" } }}>
                        Create a new password for your account.
                      </Typography>

                      {/* New password */}
                      <Typography variant="body2" sx={{ color: "#718096", fontWeight: 500, mb: 1, fontSize: { xs: "12px", sm: "14px", md: "16px" } }}>
                        New password <Box component="span" sx={{ color: "red" }}>*</Box>
                      </Typography>
                      <FormControl fullWidth variant="outlined" error={!!fpNewPasswordError} sx={{ mb: 2 }}>
                        <OutlinedInput
                          type={showFpNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={fpNewPassword}
                          onChange={(e) => { setFpNewPassword(e.target.value); if (fpNewPasswordError) setFpNewPasswordError(""); }}
                          sx={inputSx}
                          endAdornment={
                            <InputAdornment position="end">
                              <Box sx={{ width: "1px", height: "22px", backgroundColor: "#D7DFEA", marginRight: "8px" }} />
                              <IconButton onClick={() => setShowFpNewPassword((v) => !v)} edge="end" sx={{ color: "#666", padding: "6px" }}>
                                {showFpNewPassword ? <Visibility /> : <VisibilityOff />}
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                        <FormHelperText>{fpNewPasswordError || ""}</FormHelperText>
                      </FormControl>

                      {/* Confirm password */}
                      <Typography variant="body2" sx={{ color: "#718096", fontWeight: 500, mb: 1, fontSize: { xs: "12px", sm: "14px", md: "16px" } }}>
                        Confirm password <Box component="span" sx={{ color: "red" }}>*</Box>
                      </Typography>
                      <FormControl fullWidth variant="outlined" error={!!fpConfirmPasswordError} sx={{ mb: 2 }}>
                        <OutlinedInput
                          type={showFpConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={fpConfirmPassword}
                          onChange={(e) => { setFpConfirmPassword(e.target.value); if (fpConfirmPasswordError) setFpConfirmPasswordError(""); }}
                          sx={inputSx}
                          endAdornment={
                            <InputAdornment position="end">
                              <Box sx={{ width: "1px", height: "22px", backgroundColor: "#D7DFEA", marginRight: "8px" }} />
                              <IconButton onClick={() => setShowFpConfirmPassword((v) => !v)} edge="end" sx={{ color: "#666", padding: "6px" }}>
                                {showFpConfirmPassword ? <Visibility /> : <VisibilityOff />}
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                        <FormHelperText>{fpConfirmPasswordError || ""}</FormHelperText>
                      </FormControl>

                      <Button
                        fullWidth
                        variant="contained"
                        disabled={fpLoading}
                        onClick={handleFpResetPassword}
                        sx={{ backgroundColor: "#015DFF", color: "white", py: { xs: "8px", sm: "10px" }, fontSize: { xs: "12px", sm: "14px" }, fontWeight: 600, borderRadius: "8px", textTransform: "none", "&:hover": { backgroundColor: "#0040B3" } }}
                      >
                        {fpLoading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Reset Password"}
                      </Button>
                    </Box>
                  )}
                </>
              )}

              {/* Back to sign in — now shown inline above dots */}
            </Box>
          ) : (
            <Box
              component="form"
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
            >
              {/* Logo */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: { xs: "100%", sm: 420, md: 460 },
                  mx: "auto",
                  mb: { xs: 2, sm: 3 },
                }}
              >
                <Box
                  component="img"
                  src={logo2}
                  alt="Logo"
                  sx={{
                    width: { xs: 100, sm: 120, md: 140 },
                    height: "auto",
                  }}
                />
              </Box>

              {/* Form content — centered block */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "stretch", sm: "center" },
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: { xs: "100%", sm: 420, md: 460 },
                    mx: "auto",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "#D2D6DB",
                      mb: 1,
                      fontSize: { xs: "22px", sm: "24px", md: "28px" },
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Telecare Provider Portal
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#718096",
                      mb: 4,
                      fontSize: { xs: "14px", sm: "15px" },
                      fontWeight: 400,
                    }}
                  >
                    Please enter the below details to login
                  </Typography>

                  {generalSignInError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {generalSignInError}
                    </Alert>
                  )}

                  {/* Email / Phone */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4A5568",
                      fontWeight: 500,
                      mb: 1,
                      mt: { xs: 1.5, sm: 2 },
                      fontSize: { xs: "13px", sm: "14px", md: "15px" },
                    }}
                  >
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="dr.johnson@telecare.com"
                    value={signInEmail}
                    onChange={handleSignInEmailChange}
                    error={!!signInEmailError}
                    helperText={signInEmailError}
                    autoCapitalize="none"
                    sx={{ marginBottom: { xs: "10px", sm: "14px" }, ...inputSx }}
                  />

                  {/* Password */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4A5568",
                      fontWeight: 500,
                      mb: 1,
                      mt: 1,
                      fontSize: { xs: "13px", sm: "14px", md: "15px" },
                    }}
                  >
                    Password
                  </Typography>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={!!signInPasswordError}
                  >
                    <OutlinedInput
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={signInPassword}
                      onChange={handleSignInPasswordChange}
                      sx={inputSx}
                      inputProps={{ style: { WebkitTextSecurity: showPassword ? 'none' : undefined } }}
                      componentsProps={{ input: { 'data-ms-reveal': 'false' } }}
                      endAdornment={
                        <InputAdornment position="end">
                          <Box
                            sx={{
                              width: "1px",
                              height: "22px",
                              backgroundColor: "#515f72",
                              marginRight: "8px",
                            }}
                          />
                          <IconButton
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            sx={{ color: "#D2D6DB", padding: "6px", transform: "scaleX(-1)", }}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    <FormHelperText error={!!signInPasswordError}>
                      {signInPasswordError || ""}
                    </FormHelperText>
                  </FormControl>

                  {/* Forgot Password link */}
                  <Box sx={{ textAlign: "right", mt: 1, mb: 3 }}>
                    <MuiLink
                      component="button"
                      type="button"
                      onClick={openForgotPassword}
                      sx={{
                        color: "#D2D6DB",
                        fontWeight: 500,
                        fontSize: { xs: "13px", sm: "14px" },
                        textDecoration: "underline",
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                        "&:hover": { color: "#c0c3c7", textDecoration: "underline" },
                      }}
                    >
                      Forgot Password?
                    </MuiLink>
                  </Box>

                  {/* Submit */}
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={signInLoading}
                    sx={{
                      backgroundColor: "#015DFF",
                      color: "white",
                      padding: { xs: "12px 0", sm: "12px 0" },
                      minHeight: { xs: 48, sm: 48 },
                      fontSize: { xs: "15px", sm: "16px" },
                      fontWeight: 600,
                      borderRadius: "12px",
                      textTransform: "none",
                      mt: { xs: 1, sm: 1 },
                      boxShadow: {
                        xs: "0 8px 22px rgba(1, 93, 255, 0.35)",
                        sm: "none",
                      },
                      "&:hover": { backgroundColor: "#0145cc" },
                    }}
                  >
                    {signInLoading ? (
                      <CircularProgress size={22} sx={{ color: "white" }} />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* ── Right column — hero (stacked on small screens, split on md+) ── */}
        <Box
          sx={{
            order: { xs: 0, md: 1 },
            flex: { xs: "0 0 auto", md: 1 },
            position: "relative",
            height: {
              xs: "clamp(200px, 38vh, 320px)",
              md: "100%",
            },
            minHeight: { xs: 200, md: "auto" },
            maxHeight: { xs: "min(42vh, 340px)", md: "none" },
            width: { xs: "100%", md: "auto" },
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRadius: { xs: "0 0 22px 22px", md: 0 },
            boxShadow: {
              xs: "0 10px 40px rgba(1, 93, 255, 0.22), 0 2px 12px rgba(0,0,0,0.08)",
              md: "none",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0b4ed1",
            }}
          >
            <Box
              component="img"
              src={rightImg}
              alt="Medical professional"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                resizeMode: "cover",
                objectPosition: { xs: "50% 12%", sm: "50% 18%", md: "94% 50%" },

                transform: {
                  xs: "scale(1.2)", // mobile par 20% zoom
                  sm: "scale(1.1)",
                  md: "scale(1)", // desktop par 30% zoom
                },

                transformOrigin: "center center",
              }}
            />
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: {
                xs: "linear-gradient(180deg, rgba(0, 189, 242, 0) 0%, rgba(0, 189, 242, 0.03) 35%, #015DFF 50%)",
                md: "linear-gradient(180deg, rgba(0, 189, 242, 0) 0%, rgba(0, 189, 242, 0.03) 35%, #015DFF 75%)",
              },
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: { xs: "center", md: "flex-end" },
              alignItems: "center",
              padding: {
                xs: "max(10px, env(safe-area-inset-top, 0px)) 16px 18px",
                sm: "22px 24px 28px",
                md: "48px 18px 56px",
              },
              color: "white",
              pointerEvents: "none",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: { xs: 0.75, sm: 1.5, md: 2 },
                fontSize: { xs: "19px", sm: "22px", md: "28px" },
                textAlign: "center",
                textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                lineHeight: 1.22,
                maxWidth: { xs: "92%", sm: 360 },
                letterSpacing: { xs: "-0.02em", md: "-0.02em" },
              }}
            >
              Real-Time Medical Support,
              <br />
              When It Matters Most
            </Typography>
            <Typography
              sx={{
                mb: { xs: 1, sm: 2, md: 3 },

                lineHeight: 1.5,
                fontSize: { xs: "12.5px", sm: "14px", md: "15px" },
                color: "rgba(255,255,255,0.96)",
                textAlign: "center",
                textShadow: "0 1px 8px rgba(0,0,0,0.28)",
                fontWeight: 400,
                px: 0,
                opacity: { xs: 0.98, md: 1 },
              }}
            >
              Empowering you with instant physician guidance to handle
              <br />
              onboard medical emergencies with confidence
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "nowrap",
                gap: { xs: "8px", sm: "12px", md: "15px" },
                justifyContent: "center",
                alignItems: "center",
                overflowX: "auto",
                transform: "translateX(20px)", // right shift
              }}
            >
              {[
                "24/7 access\nto qualified physicians",
                "Instant \ntele-assistance for emergencies",
                "Guided \ndecision-making for critical care",
              ].map((text) => (
                <Box
                  key={text}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    px: 1,
                    py: 0.3,
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TitleRoundIcon width="100%" height="100%" />
                  </Box>

                  <Typography
                    fontSize="11px"
                    sx={{
                      fontWeight: 125,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Two-Factor Authentication Dialog — COMPLETELY COMMENTED OUT ── */}
      {/* <Dialog
        open={showTwoFactorAuth}
        onClose={(event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        }}
        disableEscapeKeyDown
        fullScreen={isXs}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: { xs: 0, sm: "24px" },
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            overflow: "hidden",
            backgroundColor: "#fff",
            mx: { xs: 0, sm: 2 },
            width: { xs: "100%", sm: "auto" },
            maxHeight: { xs: "100dvh", sm: "none" },
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            bgcolor: "#fff",
            ...(isXs && {
              display: "flex",
              flexDirection: "column",
              minHeight: "100dvh",
              maxHeight: "100dvh",
              overflow: "hidden",
              pt: "env(safe-area-inset-top, 0px)",
            }),
          }}
        >
          ... 2FA Dialog Content ...
        </DialogContent>
      </Dialog> */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: isXs ? "bottom" : "top",
          horizontal: "center",
        }}
        sx={{
          bottom: isXs
            ? "max(16px, env(safe-area-inset-bottom, 16px)) !important"
            : undefined,
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignInForm;