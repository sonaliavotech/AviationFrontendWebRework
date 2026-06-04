import { Box, Typography } from "@mui/material";

export const VitalsCard = ({
  title,
  value,
  unit,
  icon: Icon,
  borderColor,
  bgColor,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2.5,
        background: bgColor || "#102746",
        border: `1px solid ${borderColor || "#1d3a63"}`,
        borderRadius: "12px",
        p: 1.5,
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
        }}
      >
        {Icon && <Icon style={{ width: 20, height: 20 }} />}
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 500,
            color: "#8ab4d8",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "16px",
                sm: "18px",
              },
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>

          {unit && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "#8ab4d8",
              }}
            >
              {unit}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};