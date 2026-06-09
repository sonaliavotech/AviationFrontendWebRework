import React, { useMemo, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Backdrop,
  Fade,
} from "@mui/material";
import { ExpandMore, ExpandLess, Close } from "@mui/icons-material";
import kitIconDark from "../../assets/kit-icon1.png";
import { Calculate, Mic, SearchIcon, PillIcon } from "../../assets/Assets";
import OutlinedInput from "@mui/material/OutlinedInput";
import { getTheme, useThemeMode } from "../../context/ThemeContext";
import kitIconLight from "../../assets/kit-icon2.png";
import adrenaline_ampoule_1000 from "../../assets/medicineKit/adrenaline_ampoule_1000.png";
import ambu_bag from "../../assets/medicineKit/ambu_bag.jpg";
import amiodarone_150mg from "../../assets/medicineKit/amiodarone_150mg.jpg";
import atropine_600mcg from "../../assets/medicineKit/atropine_600mcg.jpg";
import bp_stethoscope from "../../assets/medicineKit/bp_stethoscope.jpg";
import epinephrine_auto_injector from "../../assets/medicineKit/epinephrine_auto_injector.webp";
import guedel_airway from "../../assets/medicineKit/guedel_airway.jpg";
import life_vac_choking_kit from "../../assets/medicineKit/life_vac_choking_kit.webp";
import manual_suction_laerdal_v_vac from "../../assets/medicineKit/manual_suction_laerdal_v_vac.jpg";
import metoclopramide_10mg from "../../assets/medicineKit/metoclopramide_10mg.webp";
import nasopharyngeal_airway from "../../assets/medicineKit/nasopharyngeal_airway.jpg";
import promethazine_hcl_50mg from "../../assets/medicineKit/promethazine_hcl_50mg.webp";
import salbutamol_ventolin_inhaler from "../../assets/medicineKit/salbutamol_ventolin_inhaler.jpg";
import sodium_chloride_posi_flush_10ml from "../../assets/medicineKit/sodium_chloride_posi_flush_10ml.jpg";
import solu_cortef_100mg_2ml from "../../assets/medicineKit/solu_cortef_100mg_2ml.webp";
import spacer_disposable from "../../assets/medicineKit/spacer_disposable.jpg";

const medicineImages = {
  "Atropine ampoule 600 mcg/ml": atropine_600mcg,
  "Adrenaline (Epinephrine) 1:1000 ampoule": adrenaline_ampoule_1000,
  "Epipen OR NEFFY": epinephrine_auto_injector,
  "Amiodarone Ampoule": amiodarone_150mg,
  "Hydrocortisone sodium succinate 250 mg": solu_cortef_100mg_2ml,
  " iphenhydramine 50mgml": promethazine_hcl_50mg,
  "Salbutamol (Albuterol) inhaler": salbutamol_ventolin_inhaler,

  "INJ Metoclopramide 10mg": metoclopramide_10mg,

  "Oropharyngeal airway (sizes 0-4)": guedel_airway,
  "Nasopharyngeal airway size 6 & 7": nasopharyngeal_airway,
  "Bag Valve Mask (adult & paediatric)": ambu_bag,
  "Suction catheter (yankauer)": manual_suction_laerdal_v_vac,

  "Blood pressure cuff (adult / paediatric)": bp_stethoscope,
  "Normal Saline 0.9% 500ml bag": sodium_chloride_posi_flush_10ml,
};
const getMedicineKitTheme = (darkMode) => {
  const base = getTheme(darkMode);

  if (darkMode) {
    return {
      ...base,
      sectionBg: "#051429",
      tableBg: "#0B1D35",
      tableHeadBg: "#0B1D35",
      modalInnerBg: "#0f1e33",
      previewBg: "#13223c",
      previewImgBg: "#0a121e",
      border: "#1F3047",
      borderSoft: "#1a3060",
      borderRow: "#0f2040",
      borderModal: "#334A68",
      textUsage: "#c8d8f0",
      nameHover: "#4d9fff",
      chipBg: "#292C41",
      chipText: "#F16154",
      cardBg: "#111a28",
      inputBg: "#21324B",
    };
  }

  return {
    ...base,
    sectionBg: "#FFFFFF",
    tableBg: "#FFFFFF",
    tableHeadBg: "#F8FAFC",
    modalInnerBg: "#F8FAFC",
    previewBg: "#FFFFFF",
    previewImgBg: "#F1F5F9",
    border: "#E2E8F0",
    borderSoft: "#E2E8F0",
    borderRow: "#E2E8F0",
    borderModal: "#CBD5E1",
    textUsage: "#64748B",
    nameHover: "#015DFF",
    chipBg: "#FEE2E2",
    chipText: "#DC2626",
    cardBg: "#FFFFFF",
    inputBg: "#FFFFFF",
  };
};

// ── Multiple modules data ──
const modules = [
  {
    id: "A",
    title: "Module A (Essential):",
    description:
      "Essential emergency medicines and first-response supplies for immediate onboard care.",
    medicines: [
      {
        name: "Atropine ampoule 600 mcg/ml",
        usage: "Slow heart rate / Cardiac arrest",

      },
      { name: "Adrenaline (Epinephrine) 1:1000 ampoule", usage: "Anaphylaxis", },
      { name: "Epipen OR NEFFY", usage: "Anaphylaxis", outOfStock: true, },
      { name: "Midozalam ( Buccal or intranasal )", usage: "Seizure" },
      {
        name: "Amiodarone Ampoule",
        usage: "Ventricular tachycardia / Fibrillation",
      },
      { name: "Hydrocortisone sodium succinate 250 mg", usage: "Asthma" },
      { name: " iphenhydramine 50mgml", usage: "Allergy" },
      {
        name: "Aspirin 300 mg tablets",
        usage: "Chest pain / Heart attack/ MI",
      },
      { name: "GTN SPRAY 400 mcg", usage: "Angina" },
      { name: "Salbutamol (Albuterol) inhaler", usage: "Asthma" },
      {
        name: "Dextrose,50% injectable",
        usage: "Hypoglycemia / low blood sugar",
      },
      {
        name: "Glucose gel ( 2 x tubes supplied)",
        usage: "Hypoglycemia / low blood sugar",
      },
    ],
  },
  {
    id: "B",
    title: "Module B (Medication):",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    medicines: [
      { name: "INJ Morphine 10mg/ml ampoule", usage: "Severe pain management" },
      { name: "INJ Ondansetron 4mg/2ml", usage: "Nausea / Vomiting" },
      { name: "INJ Metoclopramide 10mg", usage: "Nausea / Vomiting" },
      { name: "INJ Diazepam 10mg/2ml", usage: "Seizure / Anxiety" },
      { name: "INJ Furosemide 20mg/2ml", usage: "Pulmonary oedema" },
      {
        name: "INJ Dexamethasone 4mg/ml",
        usage: "Severe allergic reaction / Asthma",
      },
      { name: "Paracetamol 500mg tablets", usage: "Pain / Fever" },
      { name: "Ibuprofen 400mg tablets", usage: "Pain / Inflammation" },
    ],
  },
  {
    id: "C",
    title: "Module C (Airway):",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    medicines: [
      { name: "Oropharyngeal airway (sizes 0-4)", usage: "Airway management" },
      { name: "Nasopharyngeal airway size 6 & 7", usage: "Airway management" },
      {
        name: "Bag Valve Mask (adult & paediatric)",
        usage: "Ventilation support",
      },
      { name: "Pocket mask with O2 inlet", usage: "CPR / Ventilation" },
      { name: "Suction catheter (yankauer)", usage: "Airway clearance" },
      { name: "Laryngeal Mask Airway size 3 & 4", usage: "Advanced airway" },
    ],
  },
  {
    id: "D",
    title: "Module D (Circulation):",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    medicines: [
      { name: "IV Cannula (14G, 16G, 18G, 20G)", usage: "IV access" },
      { name: "IV Giving set", usage: "IV fluid administration" },
      { name: "Normal Saline 0.9% 500ml bag", usage: "IV fluid replacement" },
      { name: "Hartmann's solution 500ml bag", usage: "IV fluid replacement" },
      {
        name: "Blood pressure cuff (adult / paediatric)",
        usage: "Vital signs monitoring",
      },
      { name: "Tourniquet", usage: "Haemorrhage control" },
      { name: "Haemostatic dressing", usage: "Severe bleeding" },
    ],
  },
];

// ── Reusable Module Accordion ──
const ModuleAccordion = ({ module, search, onMedicineClick, theme }) => {
  const [expanded, setExpanded] = useState(module.id === "A");

  const filtered = module.medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.usage.toLowerCase().includes(search.toLowerCase()),
  );

  if (search && filtered.length === 0) return null;

  return (
    <Box
      sx={{
        background: theme.sectionBg,
        borderRadius: "16px",
        mb: 2,
        overflow: "hidden",
        border: `1px solid ${theme.border}`,
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      {/* Module header */}
      <Box
        sx={{
          p: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <PillIcon />
            <Typography
              sx={{
                fontWeight: 600,
                color: theme.textPrimary,
                fontSize: "16px",
                lineHeight: "22px",
              }}
            >
              {module.title}
            </Typography>
          </Box>
          <Typography
            sx={{
              color: theme.textSecondary,
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            {module.description}
          </Typography>
        </Box>
        <IconButton sx={{ color: theme.actionIconColor, pointerEvents: "none" }}>
          {expanded ? (
            <ExpandLess sx={{ fontSize: 28 }} />
          ) : (
            <ExpandMore sx={{ fontSize: 28 }} />
          )}
        </IconButton>
      </Box>

      {/* Medicine table */}
      {expanded && (
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "transparent",
            border: `1px solid ${theme.border}`,
            borderRadius: "8px",
            mx: "16px",
            mb: "16px",
            width: "calc(100% - 32px)",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: theme.tableHeadBg }}>
                <TableCell
                  sx={{
                    color: theme.textPrimary,
                    fontWeight: 500,
                    fontSize: "14px",
                    borderBottom: `1px solid ${theme.borderSoft}`,
                    py: 1.5,
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.textUsage,
                    fontWeight: 500,
                    fontSize: "13px",
                    borderBottom: `1px solid ${theme.borderSoft}`,
                    py: 1.5,
                  }}
                >
                  Usage
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((medicine, index) => (
                <TableRow key={index} sx={{ background: theme.tableBg }}>
                  <TableCell
                    sx={{
                      color: theme.textPrimary,
                      fontSize: "14px",
                      fontWeight: 300,
                      lineHeight: "22px",
                      letterSpacing: "0.25px",
                      py: 1.5,
                      borderBottom:
                        index < filtered.length - 1
                          ? `1px solid ${theme.borderRow}`
                          : "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMedicineClick({
                            ...medicine,
                            image: medicineImages[medicine.name] || null,
                          });
                        }}
                        sx={{
                          color: theme.textPrimary,
                          fontSize: "14px",
                          fontWeight: 300,
                          cursor: "pointer",
                          textDecoration: "underline",
                          textDecorationColor: `${theme.textPrimary}66`,
                          "&:hover": { color: theme.nameHover },
                        }}
                      >
                        {medicine.name}
                      </Typography>
                      {medicine.outOfStock && (
                        <Chip
                          label="Out of Stock"
                          size="small"
                          sx={{
                            ml: 1,
                            height: "24px",
                            borderRadius: "16px",
                            background: theme.chipBg,
                            color: theme.chipText,
                            fontSize: "12px",
                            fontWeight: 400,
                            "& .MuiChip-label": { px: "8px" },
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.textUsage,
                      fontSize: "14px",
                      fontWeight: 300,
                      lineHeight: "22px",
                      py: 1.5,
                      borderBottom:
                        index < filtered.length - 1
                          ? `1px solid ${theme.borderRow}`
                          : "none",
                    }}
                  >
                    {medicine.usage}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

const FindMedicineInKit = () => {
  const { darkMode } = useThemeMode();
  const theme = useMemo(() => getMedicineKitTheme(darkMode), [darkMode]);

  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [dosageOpen, setDosageOpen] = useState(false);
  const [drugName, setDrugName] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState("10 Mg");
  const [previewMedicine, setPreviewMedicine] = useState(null);

  const inputSx = useMemo(
    () => ({
      width: "100%",
      "& .MuiOutlinedInput-root": {
        height: "56px",
        background: theme.cardBg,
        borderRadius: "12px",
        fontFamily: "Inter",
        fontSize: "14px",
        color: theme.textPrimary,
        "& fieldset": { borderColor: theme.border },
        "&:hover fieldset": {
          borderColor: darkMode ? "#2a4a7a" : theme.borderColor,
        },
        "&.Mui-focused fieldset": { borderColor: "#015DFF" },
      },
      "& .MuiInputBase-input": {
        color: theme.textPrimary,
        fontSize: "14px",
        fontFamily: "Inter",
        "&::placeholder": { color: theme.textMuted, opacity: 1 },
      },
    }),
    [theme, darkMode],
  );

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: theme.pageBg,
        p: { xs: 2, sm: 3, md: 4 },
        boxSizing: "border-box",
        transition: "background-color 0.3s",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: theme.textPrimary,
            fontSize: { xs: "20px", sm: "22px", md: "20px" },
          }}
        >
          Find Medicine in Kit
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            width: "273.33px",
            height: "48px",
            minHeight: "48px",
            backgroundColor: theme.inputBg,
            borderRadius: "9999px",
            p: "4px",
            border: darkMode ? "none" : `1px solid ${theme.borderColor}`,
            transition: "background-color 0.3s, border-color 0.3s",
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTabs-flexContainer": { height: "100%" },
          }}
        >
          {["Medical Kit", "Digital Kit"].map((label, index) => (
            <Tab
              key={label}
              label={label}
              disableRipple
              sx={{
                width: "132.67px",
                height: "40px",
                minHeight: "40px",
                borderRadius: "9999px",
                p: "8px 0",
                textTransform: "none",
                fontFamily: "Inter, sans-serif",
                // fontWeight: activeTab === index ? 700 : 500,
                fontSize: "15px",
                letterSpacing: "-0.03em",
                color: theme.textPrimary,
                "&.Mui-selected": { color: "#FFFFFF !important" },
                backgroundColor:
                  activeTab === index ? "#015DFF" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor:
                    activeTab === index ? "#015DFF" : "transparent",
                },
              }}
            />
          ))}
        </Tabs>

        <OutlinedInput
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon
                sx={{ width: "16px", height: "16px", color: "#006FFD" }}
              />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <Mic sx={{ width: "20px", height: "20px", color: "#0088FF" }} />
            </InputAdornment>
          }
          sx={{
            width: "200px",
            height: "48px",
            background: theme.inputBg,
            borderRadius: "24px",
            px: "12px",
            border: darkMode ? "none" : `1px solid ${theme.borderColor}`,
            transition: "background-color 0.3s, border-color 0.3s",
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            "& .MuiOutlinedInput-input": {
              p: 0,
              ml: 1,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "14px",
              color: theme.textPrimary,
              "&::placeholder": { color: theme.textMuted, opacity: 1 },
            },
            "& .MuiInputAdornment-root": { margin: 0 },
          }}
        />

        <Button
          variant="contained"
          startIcon={<Calculate />}
          onClick={() => setDosageOpen(true)}
          sx={{
            width: "169px",
            height: "48px",
            minWidth: "169px",
            background: "#015DFF",
            borderRadius: "12px",
            textTransform: "none",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: "12px",
            color: "#FFFFFF",
            "& .MuiButton-startIcon": { "& svg": { width: "22px" } },
            "&:hover": { background: "#0150e0" },
          }}
        >
          Dosage Calculator
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", lg: "row" },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {modules.map((module) => (
            <ModuleAccordion
              key={module.id}
              module={module}
              search={search}
              onMedicineClick={setPreviewMedicine}
              theme={theme}
            />
          ))}
        </Box>

        <Box
          sx={{
            width: { xs: "100%", sm: "347px" },
            height: { xs: "347px", sm: "510px" },
            mt: { sm: -19 },
            background: theme.sectionBg,
            border: `1px solid ${theme.border}`,
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
            transition: "background-color 0.3s, border-color 0.3s",
          }}
        >
          <Box
            component="img"
            src={darkMode ? kitIconDark : kitIconLight}
            alt="Medical Kit"
            sx={{
              width: { xs: "200px", sm: "293px" },
              height: { xs: "200px", sm: "293px" },
              opacity: darkMode ? 0.4 : 0.85,
              objectFit: "contain",
            }}
          />
        </Box>
      </Box>

      <Modal
        open={Boolean(previewMedicine)}
        onClose={() => setPreviewMedicine(null)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: { backgroundColor: "rgba(0,0,0,0.6)" },
          },
        }}
      >
        <Fade in={Boolean(previewMedicine)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 539 },
              background: theme.previewBg,
              borderRadius: "24px",
              p: "32px",
              outline: "none",
              boxShadow: darkMode
                ? "0px 24px 48px rgba(0,0,0,0.3)"
                : "0px 24px 48px rgba(15, 23, 42, 0.12)",
              border: darkMode ? "none" : `1px solid ${theme.borderColor}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: "20px",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "22px",
                    lineHeight: "28px",
                    color: theme.textPrimary,
                    mb: "4px",
                    pr: 4,
                  }}
                >
                  {previewMedicine?.name}
                </Typography>
                <Typography
                  sx={{ fontSize: "14px", color: theme.textMuted }}
                >
                  Medicine kit item preview
                </Typography>
              </Box>
              <IconButton
                onClick={() => setPreviewMedicine(null)}
                sx={{
                  color: theme.textPrimary,
                  "&:hover": {
                    background: darkMode
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(15,38,70,0.06)",
                  },
                }}
              >
                <Close sx={{ fontSize: 22 }} />
              </IconButton>
            </Box>
            <Box
              sx={{
                background: theme.previewImgBg,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "340px",
                overflow: "hidden",
              }}
            >
              {previewMedicine?.image ? (
                <Box
                  component="img"
                  src={previewMedicine.image}
                  alt={previewMedicine.name}
                  sx={{
                    maxHeight: "280px",
                    maxWidth: "80%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#015DFF",
                      mb: 1,
                    }}
                  >
                    Coming Soon
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: theme.textMuted,
                    }}
                  >
                    Image for this medicine is not available yet.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Modal
        open={dosageOpen}
        onClose={() => setDosageOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: { backgroundColor: "rgba(0,0,0,0.6)" },
          },
        }}
      >
        <Fade in={dosageOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 539,
              maxWidth: "95vw",
              background: theme.modalBg,
              borderRadius: "24px",
              p: "40px",
              outline: "none",
              boxShadow: darkMode
                ? "0px 24px 48px rgba(0,0,0,0.3)"
                : "0px 24px 48px rgba(15, 23, 42, 0.12)",
              border: darkMode ? "none" : `1px solid ${theme.borderColor}`,
            }}
          >
            <Box sx={{ position: "relative", mb: "24px" }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "24px",
                  lineHeight: "24px",
                  color: theme.textPrimary,
                  mb: "6px",
                }}
              >
                Dosage Calculator
              </Typography>
              <Typography sx={{ fontSize: "14px", color: theme.textMuted }}>
                Calculate Safe Dosage
              </Typography>
              <IconButton
                onClick={() => setDosageOpen(false)}
                sx={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  color: theme.textPrimary,
                  "&:hover": {
                    background: darkMode
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(15,38,70,0.06)",
                  },
                }}
              >
                <Close sx={{ fontSize: 22 }} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", gap: "28px", mb: "20px" }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    mb: "8px",
                    color: theme.textPrimary,
                    fontSize: "13px",
                  }}
                >
                  Medication
                </Typography>
                <TextField
                  placeholder="Drug name"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  fullWidth
                  sx={inputSx}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    mb: "8px",
                    color: theme.textPrimary,
                    fontSize: "13px",
                  }}
                >
                  Weight (kg)
                </Typography>
                <TextField
                  placeholder="85"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  fullWidth
                  sx={inputSx}
                />
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={() => setResult("10 mg")}
              sx={{
                height: "40px",
                background: "#015DFF",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 500,
                textTransform: "none",
                mb: "20px",
                "&:hover": { background: "#0147c7" },
              }}
            >
              Calculate
            </Button>

            <Box
              sx={{
                background: theme.modalInnerBg,
                border: `1px solid ${theme.borderModal}`,
                borderRadius: "20px",
                p: "15px 16px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  color: theme.textPrimary,
                  mb: "6px",
                }}
              >
                Recommended Dosage
              </Typography>
              <Typography
                sx={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: theme.textPrimary,
                }}
              >
                {result}
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default FindMedicineInKit;
