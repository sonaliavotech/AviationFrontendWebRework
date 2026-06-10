import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useThemeMode } from "../../../context/ThemeContext";
import { buildKitTheme } from "../../../theme/appStyles";

export const KitSection = ({ title, subtitle, items, onClose, c }) => {
  const { darkMode } = useThemeMode();
  const kit = buildKitTheme(darkMode, c);

  return (
    <Box
      sx={{
        background: kit.card,
        border: `1px solid ${kit.borderLight}`,
        borderRadius: "14px",
        p: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: kit.text }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: "11px", color: kit.textMuted, mt: "2px" }}>
            {subtitle}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: kit.textMuted, p: "2px", "&:hover": { color: kit.text } }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: kit.cardInner ?? kit.surfaceSoft ?? kit.card,
              border: `1px solid ${kit.border}`,
              borderRadius: "10px",
              p: "10px 12px",
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: kit.iconBg ?? kit.surfaceSoft ?? kit.card,
                border: `1px solid ${kit.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              {item.icon}
            </Box>

            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                color: kit.text,
                lineHeight: 1.4,
              }}
            >
              {item.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default KitSection;
