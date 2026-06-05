// src/pages/AllEvents/KitSection.jsx
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const C = {
  card:        "#112240",
  cardInner:   "#0f1e38",
  border:      "rgba(255,255,255,0.08)",
  borderLight: "rgba(255,255,255,0.12)",
  text:        "#e8f0fe",
  textMuted:   "#5a7da0",
  iconBg:      "#0a1a30",
};

export const KitSection = ({ title, subtitle, items, onClose }) => {
  return (
    <Box
      sx={{
        background: C.card,
        border: `1px solid ${C.borderLight}`,
        borderRadius: "14px",
        p: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: C.text }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: "11px", color: C.textMuted, mt: "2px" }}>
            {subtitle}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: C.textMuted, p: "2px", "&:hover": { color: C.text } }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      {/* Items */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: C.cardInner,
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
              p: "10px 12px",
            }}
          >
            {/* Icon bubble */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: C.iconBg,
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              {item.icon}
            </Box>

            {/* Name */}
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                color: C.text,
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