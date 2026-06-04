import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export const KitSection = ({ title, subtitle, items, onClose }) => {
  return (
    <Box sx={{
      background: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
    }}>
      {/* Header */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: "12px",
        py: "10px",
        borderBottom: "1px solid #e2e8f0",
      }}>
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "#64748b", mt: "1px" }}>
            {subtitle}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#94a3b8" }}>
          <CloseIcon sx={{ fontSize: "16px" }} />
        </IconButton>
      </Box>

      {/* Items */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", p: "8px" }}>
        {items.map((item, index) => (
          <Box key={index} sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            px: "8px",
            py: "8px",
            borderRadius: "8px",
            "&:hover": { background: "#f8fafc" },
          }}>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: "#EBF1FE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              flexShrink: 0,
            }}>
              {item.icon}
            </Box>
            <Typography sx={{ fontSize: "12px", color: "#0f172a", fontWeight: 500 }}>
              {item.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};