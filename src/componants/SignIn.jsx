import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import logo2 from "../assets/logo2.png";
import rightImg from "../assets/right_img.jpg";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/all-events", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    // Simulate login — replace with real API call
    setTimeout(() => {
      localStorage.setItem("token", "demo-token");
      localStorage.setItem("user", JSON.stringify({ email, role: "admin" }));
      window.dispatchEvent(new CustomEvent("auth:login"));
      navigate("/all-events", { replace: true });
      setLoading(false);
    }, 900);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        bgcolor: "#fff",
      }}
    >
      {/* Left panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 3, sm: 6, md: 8 },
          py: 4,
          maxWidth: { xs: "100%", md: 520 },
          mx: "auto",
        }}
      >
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Box
            component="img"
            src={logo2}
            alt="Logo"
            sx={{ height: 48, objectFit: "contain", mb: 1 }}
          />
          <Typography variant="h5" fontWeight={700} color="#111">
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", maxWidth: 400 }}
        >
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            size="small"
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              bgcolor: "#015DFF",
              "&:hover": { bgcolor: "#0148CC" },
              py: 1.3,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>
      </Box>

      {/* Right image panel — hidden on mobile */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          flex: 1,
          backgroundImage: `url(${rightImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </Box>
  );
};

export default SignIn;
