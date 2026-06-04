import React from "react";
import { Box, IconButton, Typography, Avatar, TextField } from "@mui/material";
import tia from "../../assets/tia.png"; // ✅ correct import
export default function ChatWidget({ onClose, visible }) {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 10, sm: 20 },

        // ✅ responsive left position
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
          xs: "70%", // mobile smaller
          sm: 300, // tablet/ipad
          md: 340, // laptop
          lg: 360, // desktop
        },

        height: {
          xs: "68vh", // mobile smaller
          sm: "65vh", // tablet/ipad
          md: 430,
          lg: 440,
        },

        backgroundColor: "#fff",
        borderRadius: "18px 18px 0 0",
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
            xs: 170,
            sm: 180,
          },
          background:
            "conic-gradient(from 223.72deg at 50.12% 33.82%, #ABE1CC 0deg, #83D9DC 103.12deg, #6CD0F3 146.43deg, #015DFF 271deg, #0285C7 345deg, #02589F 360deg)",
        }}
      >
        {/* CLOSE BUTTONS */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 15,
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton
            sx={{
              color: "#fff",
              width: 24,
              height: 24,
            }}
          >
            —
          </IconButton>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              width: 24,
              height: 24,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            ✕
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
          <Avatar
            sx={{
              width: {
                xs: 55,
                sm: 60,
              },
              height: {
                xs: 55,
                sm: 60,
              },
              mb: 1,
              bgcolor: "#fff",
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src={tia}
              alt="Tia"
              sx={{
                width: "100%",
                height: "50px",
                objectFit: "cover", // fills avatar
                objectPosition: "center top", // focus on face
                transform: "scale(1.2)", // zoom in face
                borderRadius: "50%",
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
            borderRadius: "18px",
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
          gap: {
            xs: 0.5,
            sm: 1,
          },
          p: {
            xs: 1.2,
            sm: 2,
          },
          borderTop: "1px solid #102543",
          bgcolor: "#0B1D35",
        }}
      >
        {/* MENU */}
        <IconButton sx={{ p: 0.5 }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/1828/1828859.png"
            width={22}
            height={22}
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
              color:"White",

              "& fieldset": {
                border: "1px solid transparent",
              },

              "&:hover fieldset": {
                border: "1px solid #c5c5c5",
              },

              "&.Mui-focused fieldset": {
                border: "2px solid #000",
              },
            },
          }}
        />

        {/* MIC */}
        <IconButton sx={{ p: 0.5 }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/709/709682.png"
            width={20}
            height={20}
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
            width={22}
            height={22}
            alt="send"
          />
        </IconButton>
      </Box>
    </Box>
  );
}
