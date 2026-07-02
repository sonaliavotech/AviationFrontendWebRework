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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import rightImg from "../assets/signInBgimg.png";
import logo2 from "../assets/logo4.png";
import logo5 from "../assets/logo5.png";
import { TitleRoundIcon } from "../assets/Assets";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { physicianLogin } from "../services/api";
import AviationChatSocket from "../services/AviationChatSocket";
import {
  savePhysicianSession,
  getPhysicianSession,
} from "../utils/physicianSession";
import { getWebDeviceRegistrationPayload } from "../utils/deviceService";
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

const SignInForm = () => {
  const navigate = useNavigate();
  // const dispatch = useDispatch();
  // const isLoggedIn = useSelector(selectIsLoggedIn);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  React.useEffect(() => {
    document.body.style.overflow = isMobile ? "auto" : "hidden";
    document.body.style.margin = "0";
    return () => {
      document.body.style.overflow = "";
      document.body.style.margin = "";
    };
  }, [isMobile]);

  // React.useEffect(() => {
  //   if (isLoggedIn) {
  //     navigate("/Dashboard", { replace: true });
  //   }
  // }, [isLoggedIn,navigate]);
  React.useEffect(() => {
    if (getPhysicianSession()) {
      navigate("/all-events", { replace: true });
    }
  }, [navigate]);

  // 2FA state - commented out for fake login
  // const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  // const [twoFactorOtp, setTwoFactorOtp] = useState("");
  // const [twoFactorError, setTwoFactorError] = useState("");
  // const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  // const [pendingLoginData, setPendingLoginData] = useState(null);
  // const [twoFactorResendLoading, setTwoFactorResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const theme_colors = isDark
    ? {
        pageBg: "#0B1D35",

        formBg: "#0B1D35",

        inputBg: "#112339",

        inputBorder: "#334A68",

        titleColor: "#D2D6DB",

        labelColor: "#4A5568",

        subtitleColor: "#718096",

        forgotColor: "#D2D6DB",

        dividerColor: "#515f72",

        iconColor: "#D2D6DB",
      }
    : {
        pageBg: "#F0F4F8",

        formBg: "#FFFFFF",

        inputBg: "#F8FAFC",

        inputBorder: "#CBD5E0",

        titleColor: "#1A202C",

        labelColor: "#718096",

        subtitleColor: "#718096",

        forgotColor: "#2D3748",

        dividerColor: "#CBD5E0",

        iconColor: "#4A5568",
      };
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

  const [signInEmail, setSignInEmail] = useState(
    import.meta.env.VITE_DEFAULT_PHYSICIAN_EMAIL || "",
  );
  const [signInPassword, setSignInPassword] = useState(
    import.meta.env.VITE_DEFAULT_PHYSICIAN_PASSWORD || "",
  );
  const [signInEmailError, setSignInEmailError] = useState("");
  const [signInPasswordError, setSignInPasswordError] = useState("");
  const [generalSignInError, setGeneralSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ── Forgot Password — commented out (tab has placeholder only; full flow later) ──
  // const [showForgotPassword, setShowForgotPassword] = useState(false);
  // const [fpStep, setFpStep] = useState(1);
  // const [fpEmail, setFpEmail] = useState("");
  // const [fpEmailError, setFpEmailError] = useState("");
  // const [fpOtp, setFpOtp] = useState("");
  // const [fpOtpError, setFpOtpError] = useState("");
  // const [fpNewPassword, setFpNewPassword] = useState("");
  // const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  // const [fpNewPasswordError, setFpNewPasswordError] = useState("");
  // const [fpConfirmPasswordError, setFpConfirmPasswordError] = useState("");
  // const [fpLoading, setFpLoading] = useState(false);
  // const [fpSuccess, setFpSuccess] = useState(false);
  // const [showFpNewPassword, setShowFpNewPassword] = useState(false);
  // const [showFpConfirmPassword, setShowFpConfirmPassword] = useState(false);
  // const [fpResendTimer, setFpResendTimer] = useState(0);
  // const [fpResendLoading, setFpResendLoading] = useState(false);
  // const [fpResetToken, setFpResetToken] = useState("");

  // React.useEffect(() => {
  //   if (fpResendTimer <= 0) return;
  //   const id = setTimeout(() => setFpResendTimer((t) => t - 1), 1000);
  //   return () => clearTimeout(id);
  // }, [fpResendTimer]);

  // const openForgotPassword = () => { ... };
  // const closeForgotPassword = () => { ... };
  // const handleFpSendOtp = async () => { ... };
  // const handleFpOtpChange = (index, value) => { ... };
  // const handleFpOtpKeyDown = (index, e) => { ... };
  // const handleFpOtpPaste = (e) => { ... };
  // const getOtpValidationMessage = (error) => { ... };
  // const handleFpVerifyOtp = async () => { ... };
  // const handleFpResendOtp = async () => { ... };
  // const handleFpResetPassword = async () => { ... };

  const handleForgotPassword = () => {
    window.alert(
      "Instructions to reset your password will be sent to your registered email address.",
    );
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (e) => e.preventDefault();

  const handleSignInEmailChange = (e) => {
    const value = e.target.value;
    setSignInEmail(value);
    if (signInEmailError) setSignInEmailError("");
    if (generalSignInError) setGeneralSignInError("");
  };

  const handleSignInPasswordChange = (e) => {
    const value = e.target.value;
    setSignInPassword(value);
    if (signInPasswordError) setSignInPasswordError("");
    if (generalSignInError) setGeneralSignInError("");
  };

  const handleSignIn = async () => {
    setSignInEmailError("");
    setSignInPasswordError("");
    setGeneralSignInError("");

    if (!signInEmail.trim()) {
      setSignInEmailError("Please enter your email address");
      return;
    }
    if (!signInPassword.trim()) {
      setSignInPasswordError("Please enter your password");
      return;
    }

    try {
      setSignInLoading(true);
      const devicePayload = getWebDeviceRegistrationPayload();

      const data = await physicianLogin({
        email: signInEmail.trim(),
        password: signInPassword,
        deviceId: devicePayload.deviceId,
        deviceToken: devicePayload.deviceToken,
        platform: devicePayload.platform,
        apn_token: devicePayload.apnToken,
      });

      const userId = data.user?.id;
      if (!userId) {
        setGeneralSignInError("User id missing from login response.");
        return;
      }

      savePhysicianSession(data.user);
      AviationChatSocket.connect(userId);

      setSnackbar({
        open: true,
        message: "Sign-in successful",
        severity: "success",
      });

      navigate("/all-events", { replace: true });
    } catch (error) {
      setGeneralSignInError(
        error?.message || "Unable to login. Please try again.",
      );
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

  const inputSx = {
    "& .MuiOutlinedInput-root, &.MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: theme_colors.inputBg,
      // boxShadow:
      //   "0px 2px 4px 1px #E7EBEE55 inset, 0 4px 12px rgba(0, 0, 0, 0.06), 0 8px 20px rgba(0, 0, 0, 0.04)",
      // transition: "box-shadow 0.2s ease",
      "& fieldset": {
        border: `1px solid ${theme_colors.inputBorder}`,
      },
      "&:hover fieldset": {
        border: `1px solid ${theme_colors.inputBorder}`,
      },
      "&.Mui-focused fieldset": {
        border: `1px solid ${theme_colors.inputBorder}`,
      },
      "&.Mui-focused": {
        boxShadow:
          "0px 2px 6px 2px #E7EBEE66 inset, 0 6px 16px rgba(1, 93, 255, 0.15), 0 10px 24px rgba(1, 93, 255, 0.08)",
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: { xs: "12px 14px", sm: "12px 14px" },
      /* 16px on small screens avoids iOS zoom-on-focus */
      fontSize: { xs: "16px", sm: "15px" },
      color: "#718096",
    },
    "& .MuiOutlinedInput-input::placeholder": { color: "#718096", opacity: 1 },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: `0 0 0 1000px ${theme_colors.inputBg} inset !important`,
      WebkitTextFillColor: isDark ? "#D2D6DB" : "#1A202C",
      borderRadius: "12px",
      transition: "background-color 9999s ease-in-out 0s",
    },

    "& input:-webkit-autofill:hover": {
      WebkitBoxShadow: `0 0 0 1000px ${theme_colors.inputBg} inset !important`,
    },

    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: `0 0 0 1000px ${theme_colors.inputBg} inset !important`,
    },
    "& .MuiInputAdornment-root": { marginRight: "6px" },
    // Hide browser native password reveal button
    "& input::-ms-reveal, & input::-ms-clear": { display: "none" },
    "& input::-webkit-credentials-auto-fill-button": { display: "none" },
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        height: { xs: "auto", md: "100vh" },
        overflow: { xs: "auto", md: "hidden" },
        display: "flex",
        backgroundColor: theme_colors.formBg,
        "@supports not (height: 100dvh)": {
          minHeight: "-webkit-fill-available",
          height: { xs: "auto", md: "100vh" },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          minHeight: { xs: "100dvh", md: 0 },
          flex: 1,
          overflow: { xs: "visible", md: "hidden" },
        }}
      >
        {/* ── Left column — form (full screen on mobile) ── */}
        <Box
          sx={{
            flex: { xs: 1, md: 0.8 },
            width: { xs: "100%", md: "auto" },
            minWidth: 0,
            minHeight: { xs: "100dvh", md: 0 },
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
            pt: {
              xs: "max(24px, env(safe-area-inset-top, 0px))",
              sm: 4,
              md: 4,
            },
            pb: {
              xs: "max(24px, env(safe-area-inset-bottom, 0px))",
              sm: 4,
              md: 4,
            },
            backgroundColor: theme_colors.formBg,
            display: "flex",
            flexDirection: "column",
            justifyContent: { xs: "center", sm: "center", md: "center" },
            height: { xs: "auto", md: "100%" },
            overflowY: { xs: "auto", md: "auto" },
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
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
                mb: { xs: 2, sm: 3 },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between", // ← add this
                width: "100%",
                maxWidth: { xs: "100%", sm: 420, md: 460 },
                mx: "auto",
              }}
            >
              <Box
                component="img"
                src={isDark ? logo2 : logo5}
                alt="Logo"
                sx={{
                  width: { xs: 100, sm: 120, md: 140 },
                  height: "auto",
                }}
              />

              {/* ── Theme Toggle ── */}

              {/* ── Theme Toggle ── */}
              <Box
                onClick={() => setIsDark((prev) => !prev)}
                sx={{
                  width: "72px",
                  height: "34px",
                  borderRadius: "17px",
                  border: `1.5px solid ${isDark ? "#334A68" : "#CBD5E0"}`,
                  backgroundColor: isDark ? "#1a2f4a" : "#E2E8F0",
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.3s ease, border-color 0.3s ease",
                  userSelect: "none",
                }}
              >
                {/* Sun icon — left side */}
                <Typography
                  sx={{
                    position: "absolute",
                    left: "7px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "15px",
                    lineHeight: 1,
                  }}
                >
                  ☀️
                </Typography>

                {/* Moon icon — right side */}
                <Typography
                  sx={{
                    position: "absolute",
                    right: "7px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "15px",
                    lineHeight: 1,
                  }}
                >
                  🌙
                </Typography>

                {/* Sliding thumb */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "3px",
                    left: isDark ? "40px" : "3px",
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    backgroundColor: "#015DFF",
                    transition: "left 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                  }}
                >
                  {isDark ? "🌙" : "☀️"}
                </Box>
              </Box>
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
                    color: theme_colors.titleColor,
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
                    color: theme_colors.subtitleColor,
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
                    color: theme_colors.labelColor,
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
                  placeholder="Enter your email"
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
                    color: theme_colors.labelColor,
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
                    inputProps={{
                      style: {
                        WebkitTextSecurity: showPassword ? "none" : undefined,
                      },
                    }}
                    componentsProps={{ input: { "data-ms-reveal": "false" } }}
                    endAdornment={
                      <InputAdornment position="end">
                        <Box
                          sx={{
                            width: "1px",
                            height: "22px",
                            backgroundColor: theme_colors.dividerColor,
                            marginRight: "8px",
                          }}
                        />
                        <IconButton
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          sx={{
                            color: theme_colors.iconColor,
                            padding: "6px",
                            transform: "scaleX(-1)",
                          }}
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

                {/* Forgot Password — tab-style placeholder alert */}
                <Box sx={{ textAlign: "right", mt: 1, mb: 3 }}>
                  <MuiLink
                    component="button"
                    type="button"
                    onClick={handleForgotPassword}
                    sx={{
                      color: theme_colors.forgotColor,
                      fontWeight: 500,
                      fontSize: { xs: "13px", sm: "14px" },
                      textDecoration: "underline",
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      padding: 0,
                      "&:hover": {
                        color: theme_colors.subtitleColor,
                        textDecoration: "underline",
                      },
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
                      <LoadingSpinner size="sm" variant="inline" color="#FFFFFF" />
                    ) : (
                    "Login"
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Right column — hero (hidden on mobile) ── */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flex: 1,
            position: "relative",
            height: "100%",
            overflow: "hidden",
            flexDirection: "column",
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
                objectPosition: "94% 50%",
                transform: "scale(1)",
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
              background:
                "linear-gradient(180deg, rgba(0, 189, 242, 0) 0%, rgba(0, 189, 242, 0.03) 35%, #015DFF 75%)",
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
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "48px 18px 56px",
              color: "white",
              pointerEvents: "none",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: "28px",
                textAlign: "center",
                textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                lineHeight: 1.22,
                maxWidth: 360,
                letterSpacing: "-0.02em",
              }}
            >
              Real-Time Medical <br />
              Support,
              <br />
              When It Matters Most
            </Typography>
            <Typography
              sx={{
                mb: 3,
                lineHeight: 1.5,
                fontSize: "15px",
                color: "rgba(255,255,255,0.96)",
                textAlign: "center",
                textShadow: "0 1px 8px rgba(0,0,0,0.28)",
                fontWeight: 400,
                px: 0,
                opacity: 1,
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
                gap: "15px",
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
