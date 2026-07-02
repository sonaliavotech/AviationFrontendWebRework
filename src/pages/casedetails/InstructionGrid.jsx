import { Box, Typography } from "@mui/material";
import { buildInstructionTheme } from "../../../theme/appStyles";

export const InstructionGrid = ({ instructions, darkMode = true, c }) => {
  const theme = buildInstructionTheme(darkMode, c);

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
            background: theme.cardBg,
            borderRadius: "12px",
            p: 1.5,
            border: `1px solid ${theme.cardBorder}`,
            minHeight: "72px",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: theme.hoverBorder,
              transform: "translateY(-2px)",
            },
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: theme.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: theme.iconColor,
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
                color: theme.title,
                lineHeight: 1.2,
              }}
            >
              {item.title}
            </Typography>

            <Typography
              sx={{
                fontSize: "12px",
                color: theme.description,
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
