import React from "react";
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  TextField,
} from "@mui/material";
import tia from "../../assets/tia.png";

import RemoveIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";

export default function ChatWidget({ onClose, visible }) {
  return (
  <Box
  sx={{
    position: "fixed",

    bottom: {
      xs: 10,
      sm: 15,
      md: 20,
    },

    // RIGHT OF SIDEBAR + GAP
    left: {
      xs: "88px",   // mobile
      sm: "105px",  // tablet
      md: "110px",  // ipad / medium
      lg: "108px",  // desktop
      xl: "112px",  // large screens
    },

    transform: visible
      ? "translateY(0)"
      : "translateY(20px)",

    width: {
      xs: "calc(100vw - 98px)",
      sm: 320,
      md: 340,
      lg: 360,
      xl: 380,
    },

    maxWidth: "380px",

    height: {
      xs: "72vh",
      sm: "68vh",
      md: 430,
      lg: 490,
    },

    maxHeight: "90vh",

    borderRadius: "18px",

    boxShadow:
      "0px 12px 30px rgba(0,0,0,0.22)",

    overflow: "hidden",
    zIndex: 9999,

    display: "flex",
    flexDirection: "column",

    opacity: visible ? 1 : 0,

    transition:
      "transform 0.3s ease, opacity 0.3s ease",

    pointerEvents: visible ? "auto" : "none",
  }}
>
      {/* HEADER */}
      <Box
        sx={{
          position: "relative",

          height: {
            xs: 145,
            sm: 155,
            md: 160,
          },

          flexShrink: 0,

          background:
            "conic-gradient(from 223.72deg at 50.12% 33.82%, #ABE1CC 0deg, #83D9DC 103.12deg, #6CD0F3 146.43deg, #015DFF 271deg, #0285C7 345deg, #02589F 360deg)",
        }}
      >
        {/* TOP RIGHT ICONS */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            gap: 0.5,
          }}
        >
          {/* MINIMIZE */}
          <IconButton
            disableRipple
            sx={{
              color: "#fff",
              width: 22,
              height: 22,
              p: 0,
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <RemoveIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* CLOSE */}
          <IconButton
            onClick={onClose}
            disableRipple
            sx={{
              color: "#fff",
              width: 22,
              height: 22,
              p: 0,
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* CENTER CONTENT */}
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            px: 2,
          }}
        >
          {/* PROFILE */}
          <Avatar
            sx={{
              width: {
                xs: 56,
                sm: 60,
                md: 62,
              },

              height: {
                xs: 56,
                sm: 60,
                md: 62,
              },

              mb: 1,
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src={tia}
              alt="Tia"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
              }}
            />
          </Avatar>

          <Typography
            sx={{
              color: "#fff",
              fontWeight: 600,

              fontSize: {
                xs: "18px",
                sm: "20px",
                md: "22px",
              },
            }}
          >
            Hello I'm Tia AI
          </Typography>

          <Typography
            sx={{
              color: "#fff",

              fontSize: {
                xs: "11px",
                sm: "12px",
                md: "13px",
              },

              mt: 0.5,
              opacity: 0.9,
            }}
          >
            How may I help you today?
          </Typography>
        </Box>
      </Box>

      {/* CHAT BODY */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          backgroundColor: "#0B1D35",

          backgroundImage:
            "radial-gradient(rgba(2,88,159,0.08) 1px, transparent 1px)",

          backgroundSize: "18px 18px",

          overflowY: "auto",

          "&::-webkit-scrollbar": {
            width: "4px",
          },
        }}
      >
        <Box
          sx={{
            display: "inline-block",
            bgcolor: "#102543",
            color: "#fff",
            px: 2,
            py: 1.2,
            borderRadius: "8px",
            maxWidth: "85%",

            fontSize: {
              xs: "12px",
              sm: "14px",
            },
          }}
        >
          I’m here to answer any questions you may have..
        </Box>
      </Box>

      {/* INPUT SECTION */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,

          px: 1,
          py: 1,

          borderTop: "1px solid #102543",
          bgcolor: "#0B1D35",

          flexShrink: 0,
        }}
      >
        {/* MENU */}
        <IconButton sx={{ p: 0.5, flexShrink: 0 }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/1828/1828859.png"
            width={20}
            height={20}
            alt="menu"
            style={{
              filter:
                "invert(24%) sepia(89%) saturate(1655%) hue-rotate(189deg) brightness(92%) contrast(101%)",
            }}
          />
        </IconButton>

       <TextField
  fullWidth
  size="small"
  placeholder="Type a message..."
  sx={{
    flex: 1,

    "& .MuiOutlinedInput-root": {
      borderRadius: "999px",

      height: {
        xs: 40,
        sm: 42,
      },

      backgroundColor: "#102543",
      color: "white",

      // SAME BORDER ALWAYS
      "& fieldset": {
        border: "1px solid transparent",
      },

      "&:hover fieldset": {
        border: "1px solid transparent",
      },

      "&.Mui-focused fieldset": {
        border: "1px solid transparent",
      },

      // remove focus glow
      "&.Mui-focused": {
        boxShadow: "none",
      },
    },

    "& input": {
      color: "white",

      fontSize: {
        xs: "12px",
        sm: "13px",
      },
    },

    "& input::placeholder": {
      color: "#bdbdbd",
      opacity: 1,
    },
  }}
/>

        {/* RIGHT ICONS */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {/* MIC */}
          <IconButton sx={{ p: 0.5 }}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/709/709682.png"
              width={18}
              height={18}
              alt="mic"
              style={{
                filter:
                  "invert(24%) sepia(89%) saturate(1655%) hue-rotate(189deg) brightness(92%) contrast(101%)",
              }}
            />
          </IconButton>

          {/* SEND */}
          <IconButton sx={{ p: 0.5 }}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/3682/3682321.png"
              width={20}
              height={20}
              alt="send"
            />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}