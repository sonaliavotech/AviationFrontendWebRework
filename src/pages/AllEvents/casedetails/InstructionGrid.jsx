import { Box, Typography } from "@mui/material";

export const InstructionGrid = ({ instructions }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr",
          md: "1fr 1fr",
        },
        gap: 2,
        mt: 1.5,
      }}
    >
      {instructions.map((item, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2.5,
            background: "#102746",
            borderRadius: "12px",
            p: 1.5,
            border: "1px solid #1d3a63",
            minHeight: "72px",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "#1f6fff",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#16345c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#4ea1ff",
              fontSize: "20px",
            }}
          >
            {item.icon}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#ffffff",
                lineHeight: 1.2,
              }}
            >
              {item.title}
            </Typography>

            <Typography
              sx={{
                fontSize: "12px",
                color: "#8ab4d8",
                lineHeight: 1.4,
              }}
            >
              {item.description}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};