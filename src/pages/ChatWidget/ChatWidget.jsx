import React from "react";
import { Box, IconButton, Typography, Avatar, TextField } from "@mui/material";
import tia from "../../assets/tia.png";

import RemoveIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";

export default function ChatWidget({ onClose, visible }) {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 10, sm: 20 },

        // responsive left position
        left: {
          xs: "63%",
          sm: 110,
          md: 130,
        },

        transform: {
          xs: visible
            ? "translateX(-50%)"
            : "translateX(-50%) translateY(20px)",
          sm: visible ? "translateX(0)" : "translateX(-40px)",
        },

        width: {
          xs: "70%",
          sm: 300,
          md: 340,
          lg: 360,
        },

        height: {
          xs: "68vh",
          sm: "65vh",
          md: 430,
          lg: 440,
        },

        borderRadius: "10px 10px 0 0",
        boxShadow: "0px 5px 15px rgba(0,0,0,0.25)",
        overflow: "hidden",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",

        opacity: visible ? 1 : 0,
        transition: "all 0.25s ease-in-out",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          position: "relative",
          height: {
            xs: 150,
            sm: 160,
          },
          background:
            "conic-gradient(from 223.72deg at 50.12% 33.82%, #ABE1CC 0deg, #83D9DC 103.12deg, #6CD0F3 146.43deg, #015DFF 271deg, #0285C7 345deg, #02589F 360deg)",
        }}
      >
        {/* TOP RIGHT ICONS */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 15,
            display: "flex",
            gap: 0.5,
          }}
        >
          {/* MINIMIZE ICON */}
          <IconButton
            disableRipple
            sx={{
              color: "#fff",
              width: 20,
              height: 20,
              p: 0,
              backgroundColor: "transparent",

              "&:hover": {
                backgroundColor: "transparent",
              },

              "&:focus": {
                backgroundColor: "transparent",
              },

              "&:active": {
                backgroundColor: "transparent",
              },
            }}
          >
            <RemoveIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* CLOSE BUTTON */}
          <IconButton
            onClick={onClose}
            disableRipple
            sx={{
              color: "#fff",
              width: 20,
              height: 20,
              p: 0,
              backgroundColor: "transparent",

              "&:hover": {
                backgroundColor: "transparent",
              },

              "&:focus": {
                backgroundColor: "transparent",
              },

              "&:active": {
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
          {/* PROFILE IMAGE */}
          <Avatar
            sx={{
              width: {
                xs: 58,
                sm: 62,
              },
              height: {
                xs: 58,
                sm: 62,
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
                objectFit: "cover", // ✅ full face visible
                objectPosition: "center top", // ✅ center image
                transform: "scale(1.00)", // ✅ slightly zoom out
              }}
            />
          </Avatar>

          <Typography
            sx={{
              color: "#fff",
              fontWeight: 600,
              fontSize: {
                xs: "20px",
                sm: "22px",
              },
            }}
          >
            Hello I'm Tia AI
          </Typography>

          <Typography
            sx={{
              color: "#fff",
              fontSize: {
                xs: "12px",
                sm: "13px",
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
            fontSize: "14px",
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
    px: 1,
    py: 1.2,
    borderTop: "1px solid #102543",
    bgcolor: "#0B1D35",
  }}
>
  {/* MENU */}
  <IconButton
    sx={{
      p: 0.5,
      mr: 0.5,
    }}
  >
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

  {/* INPUT */}
  <TextField
    fullWidth
    size="small"
    placeholder="Type a message..."
    sx={{
      flex: 1,

      "& .MuiOutlinedInput-root": {
        borderRadius: "999px",
        height: 42,
        backgroundColor: "#102543",
        color: "white",

        "& fieldset": {
          border: "1px solid transparent",
        },

        "&:hover fieldset": {
          border: "1px solid #c5c5c5",
        },

        "&.Mui-focused fieldset": {
          border: "2px solid #fff",
        },
      },

      "& input": {
        color: "white",
        fontSize: {
          xs: "12px",
          sm: "13px",
        },
        px: 1,
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
      ml: 0.5,
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
