import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const DARK_KIT = {
  card:        "#112240",
  cardInner:   "#0f1e38",
  border:      "rgba(255,255,255,0.08)",
  borderLight: "rgba(255,255,255,0.12)",
  text:        "#e8f0fe",
  textMuted:   "#5a7da0",
  iconBg:      "#0a1a30",
};

export const KitSection = ({ title, subtitle, items, onClose, c = DARK_KIT }) => {
  return (
    <Box
      sx={{
        background: c.card,
        border: `1px solid ${c.borderLight}`,
        borderRadius: "14px",
        p: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: c.text }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: "11px", color: c.textMuted, mt: "2px" }}>
            {subtitle}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: c.textMuted, p: "2px", "&:hover": { color: c.text } }}
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
              background: c.cardInner ?? c.surfaceSoft ?? c.card,
              border: `1px solid ${c.border}`,
              borderRadius: "10px",
              p: "10px 12px",
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: c.iconBg ?? c.surfaceSoft ?? c.card,
                border: `1px solid ${c.border}`,
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
                color: c.text,
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
