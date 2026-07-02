import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Checkbox,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { MODULES } from "./medicineModulesData";

const MedicineModules = ({
  darkMode,
  onAddMedicine,
  searchQuery = "",
  showUsageColumn = false,
  showGlobalAddAll = true,
  showCheckboxes = true,
  showAddButtons = true,
}) => {
  const [openModules, setOpenModules] = useState(() =>
    Object.fromEntries(MODULES.map((m) => [m.id, m.defaultOpen])),
  );
  const [selection, setSelection] = useState(() =>
    Object.fromEntries(MODULES.map((m) => [m.id, new Set()])),
  );

  const colors = useMemo(
    () => ({
      moduleBg: darkMode ? "#0F172A" : "#FFFFFF",
      border: darkMode ? "#1F2937" : "#E5E7EB",
      primary: "#0A5FFF",
      textPrimary: darkMode ? "#F8FAFC" : "#111827",
      textSecondary: darkMode ? "#94A3B8" : "#64748B",
      textTertiary: darkMode ? "#64748B" : "#94A3B8",
      rowBg: darkMode ? "#111827" : "#FFFFFF",
      headerBg: darkMode ? "#1F2937" : "#F0F4FF",
    }),
    [darkMode],
  );

  const selectedCount = useMemo(
    () => Object.values(selection).reduce((sum, set) => sum + set.size, 0),
    [selection],
  );

  const toggleModule = (id) => {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRow = (moduleId, rowIndex) => {
    setSelection((prev) => {
      const next = new Set(prev[moduleId]);
      if (next.has(rowIndex)) next.delete(rowIndex);
      else next.add(rowIndex);
      return { ...prev, [moduleId]: next };
    });
  };

  const handleAddRow = (module, item) => {
    onAddMedicine?.({
      moduleId: module.id,
      moduleTitle: module.title,
      medicineName: item.name,
      usage: item.usage,
    });
  };

  const handleGlobalAddAll = () => {
    const medicines = [];
    MODULES.forEach((module) => {
      const rows = selection[module.id] || new Set();
      rows.forEach((idx) => {
        const item = module.items[idx];
        if (item) {
          medicines.push({
            moduleId: module.id,
            moduleTitle: module.title,
            medicineName: item.name,
            usage: item.usage,
          });
        }
      });
    });
    if (medicines.length) onAddMedicine?.(medicines);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "10px", md: "12px" }, width: "100%", minWidth: 0 }}>
      {showGlobalAddAll && (
        <Box
          sx={{
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            px: { xs: "10px", md: "12px" },
            py: { xs: "8px", md: "10px" },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            background: colors.moduleBg,
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "11px", md: "12px" },
              fontWeight: 700,
              color: colors.textPrimary,
              flex: 1,
              minWidth: 0,
            }}
          >
            Selected medicines: {selectedCount}
          </Typography>
          <Button
            size="small"
            disabled={selectedCount === 0}
            onClick={handleGlobalAddAll}
            sx={{
              borderRadius: "10px",
              px: "14px",
              py: "6px",
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "none",
              background: selectedCount > 0 ? colors.primary : darkMode ? "#1E293B" : "#E2E8F0",
              color: selectedCount > 0 ? "#fff" : colors.textSecondary,
              "&:hover": {
                background: selectedCount > 0 ? "#0047cc" : darkMode ? "#1E293B" : "#E2E8F0",
              },
            }}
          >
            Add All
          </Button>
        </Box>
      )}

      {MODULES.map((module) => {
        const filtered = searchQuery
          ? module.items
              .map((item, originalIdx) => ({ ...item, originalIdx }))
              .filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
          : module.items.map((item, originalIdx) => ({ ...item, originalIdx }));

        const isOpen = openModules[module.id];
        const moduleSelection = selection[module.id] || new Set();

        return (
          <Box
            key={module.id}
            sx={{
              border: `1px solid ${colors.border}`,
              borderRadius: "10px",
              overflow: "hidden",
              background: colors.moduleBg,
            }}
          >
            <Box
              onClick={() => toggleModule(module.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: { xs: "10px", md: "14px" },
                py: { xs: "10px", md: "12px" },
                cursor: "pointer",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px", flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: "14px", md: "15px" }, flexShrink: 0 }}>
                  {module.emoji}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "12px", md: "13px" },
                    fontWeight: 700,
                    color: colors.primary,
                    lineHeight: 1.35,
                    wordBreak: "break-word",
                  }}
                >
                  {module.title}
                </Typography>
              </Box>
              {isOpen ? (
                <KeyboardArrowDownIcon sx={{ color: colors.textSecondary, fontSize: 18 }} />
              ) : (
                <KeyboardArrowUpIcon sx={{ color: colors.textSecondary, fontSize: 18 }} />
              )}
            </Box>

            <Typography
              sx={{
                fontSize: { xs: "10px", md: "11px" },
                lineHeight: 1.4,
                px: { xs: "10px", md: "14px" },
                pb: { xs: "8px", md: "10px" },
                color: colors.textTertiary,
              }}
            >
              {module.description}
            </Typography>

            {isOpen && filtered.length > 0 && (
              <Box
                sx={{
                  mx: { xs: "8px", md: "12px" },
                  mb: { xs: "10px", md: "14px" },
                  border: `1px solid ${colors.border}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                  width: "auto",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: { xs: "8px", md: "10px" },
                    py: { xs: "6px", md: "8px" },
                    background: colors.headerBg,
                  }}
                >
                  {showCheckboxes && <Box sx={{ width: { xs: 24, md: 28 }, flexShrink: 0 }} />}
                  <Typography
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: { xs: "11px", md: "12px" },
                      fontWeight: 700,
                      color: colors.textPrimary,
                    }}
                  >
                    Name
                  </Typography>
                  {showUsageColumn && (
                    <Typography sx={{ flex: 1, fontSize: "12px", fontWeight: 700, color: colors.textPrimary }}>
                      Usage
                    </Typography>
                  )}
                  {showAddButtons && <Box sx={{ width: { xs: 32, md: 36 }, flexShrink: 0 }} />}
                </Box>

                {filtered.map((item) => {
                  const checked = moduleSelection.has(item.originalIdx);
                  return (
                    <Box
                      key={`${module.id}-${item.originalIdx}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        px: { xs: "8px", md: "10px" },
                        py: { xs: "6px", md: "7px" },
                        minHeight: { xs: 36, md: 38 },
                        borderTop: `1px solid ${colors.border}`,
                        background: colors.rowBg,
                        gap: 0.5,
                      }}
                    >
                      {showCheckboxes && (
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => toggleRow(module.id, item.originalIdx)}
                          sx={{
                            p: 0,
                            mr: { xs: "4px", md: "6px" },
                            flexShrink: 0,
                            color: darkMode ? "#4B5563" : "#CBD5E1",
                            "&.Mui-checked": { color: colors.primary },
                          }}
                        />
                      )}
                      <Typography
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          fontSize: { xs: "11px", md: "12px" },
                          color: item.outOfStock ? "#EF4444" : colors.textPrimary,
                          fontWeight: item.outOfStock ? 600 : 400,
                          lineHeight: 1.35,
                          wordBreak: "break-word",
                        }}
                      >
                        {item.name}
                        {item.outOfStock && (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: { xs: "9px", md: "10px" },
                              ml: "4px",
                              color: "#EF4444",
                              display: { xs: "block", sm: "inline" },
                            }}
                          >
                            Out of Stock
                          </Typography>
                        )}
                      </Typography>
                      {showUsageColumn && (
                        <Typography sx={{ flex: 1, fontSize: "11px", color: colors.textSecondary }}>
                          {item.usage || "—"}
                        </Typography>
                      )}
                      {showAddButtons && (
                        <IconButton
                          size="small"
                          onClick={() => handleAddRow(module, item)}
                          sx={{
                            width: { xs: 26, md: 28 },
                            height: { xs: 26, md: 28 },
                            flexShrink: 0,
                            background: colors.primary,
                            color: "#fff",
                            "&:hover": { background: "#0047cc" },
                          }}
                        >
                          <AddIcon sx={{ fontSize: { xs: 14, md: 16 } }} />
                        </IconButton>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default MedicineModules;
