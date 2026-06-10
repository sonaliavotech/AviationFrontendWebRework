export const APP_FONT_FAMILY = "'Inter', 'Roboto', sans-serif";

export const getSignInColors = () => ({
  formBg: "#FFFFFF",
  inputBg: "#FFFFFF",
  inputBorder: "#E2E8F0",
  titleColor: "#1A202C",
  subtitleColor: "#718096",
  labelColor: "#4A5568",
  dividerColor: "#E2E8F0",
  iconColor: "#718096",
  forgotColor: "#015DFF",
});

export const getPanelColors = (darkMode) => {
  if (darkMode) {
    return {
      panelBg: "#0B1D35",
      panelSurface: "#112339",
      panelBorder: "rgba(255,255,255,0.08)",
      panelBorderStrong: "#1F3047",
      textPrimary: "#FFFFFF",
      textSecondary: "#94A3B8",
      borderColor: "rgba(255,255,255,0.08)",
      alertCardBg: "#112339",
      alertTitle: "#FFFFFF",
      alertDesc: "#94A3B8",
      alertClose: "#94A3B8",
      chipBg: "#21324B",
      mutedText: "#64748B",
      graphCardBg: "#112339",
      graphTitle: "#FFFFFF",
      graphSubtext: "#94A3B8",
      graphWave: "rgba(1, 93, 255, 0.12)",
      cardBg: "#112339",
      inputBg: "#21324B",
      criticalAlertBg: "#2d1414",
      criticalAlertText: "#f05050",
    };
  }

  return {
    panelBg: "#F0F4F8",
    panelSurface: "#FFFFFF",
    panelBorder: "#E2E8F0",
    panelBorderStrong: "#E2E8F0",
    textPrimary: "#0F2646",
    textSecondary: "#64748B",
    borderColor: "#E2E8F0",
    alertCardBg: "#FFFFFF",
    alertTitle: "#0F2646",
    alertDesc: "#64748B",
    alertClose: "#64748B",
    chipBg: "#F8FAFC",
    mutedText: "#94A3B8",
    graphCardBg: "#FFFFFF",
    graphTitle: "#0F2646",
    graphSubtext: "#64748B",
    graphWave: "rgba(1, 93, 255, 0.08)",
    cardBg: "#FFFFFF",
    inputBg: "#FFFFFF",
    criticalAlertBg: "#FEF2F2",
    criticalAlertText: "#DC2626",
  };
};

export const getVitalsSidebarTheme = (darkMode) => {
  if (darkMode) {
    return {
      bg: "#0b1d35",
      cardNml: "#112240",
      cardDng: "#1f1018",
      cardWrn: "#1c1a08",
      textWhite: "#ffffff",
      textDng: "#f05050",
      textWrn: "#e09030",
      labelNml: "#5a7da0",
      labelDng: "#9a6060",
      labelWrn: "#9a7830",
      iconNml: "#2a4a6a",
      iconDng: "#9a3030",
      iconWrn: "#9a6010",
      iconBlu: "#2a6acc",
      borderDng: "#c13a3a",
      borderDngR: "#2e1a1a",
      borderWrn: "#c07820",
      borderWrnR: "#2a2510",
      borderBlu: "#2060cc",
      borderBluR: "#1c3455",
      borderNmlL: "#ffffff33",
      borderNmlR: "#ffffff18",
    };
  }

  return {
    bg: "#F0F4F8",
    cardNml: "#FFFFFF",
    cardDng: "#FEF2F2",
    cardWrn: "#FFFBEB",
    textWhite: "#0F2646",
    textDng: "#DC2626",
    textWrn: "#D97706",
    labelNml: "#64748B",
    labelDng: "#B91C1C",
    labelWrn: "#B45309",
    iconNml: "#64748B",
    iconDng: "#DC2626",
    iconWrn: "#D97706",
    iconBlu: "#2563EB",
    borderDng: "#FCA5A5",
    borderDngR: "#FEE2E2",
    borderWrn: "#FCD34D",
    borderWrnR: "#FEF3C7",
    borderBlu: "#93C5FD",
    borderBluR: "#DBEAFE",
    borderNmlL: "#CBD5E1",
    borderNmlR: "#E2E8F0",
  };
};

export const getNormalVitalCardStyle = (darkMode) => {
  if (darkMode) {
    return {
      color: "#FFFFFF",
      labelColor: "#C0B5AE",
      bg: "#504844",
      border: "#ffffff18",
    };
  }

  return {
    color: "#1F2937",
    labelColor: "#64748B",
    bg: "#FFFFFF",
    border: "#E2E8F0",
  };
};

export const getEcgTheme = (darkMode) =>
  darkMode
    ? {
        bg: "#0d1f35",
        gridStroke: "#1e3a5f",
        labelColor: "#4a7fa5",
      }
    : {
        bg: "#F8FAFC",
        gridStroke: "#CBD5E1",
        labelColor: "#64748B",
      };

export const getAiAlertStyles = (darkMode) => {
  if (darkMode) {
    return [
      {
        bg: "#3b1f24",
        titleColor: "#FECDD3",
        descColor: "#FDA4AF",
      },
      {
        bg: "#3a2f14",
        titleColor: "#FDE68A",
        descColor: "#FCD34D",
      },
      {
        bg: "#3a2f14",
        titleColor: "#FDE68A",
        descColor: "#FCD34D",
      },
      {
        bg: "#142338",
        titleColor: "#BFDBFE",
        descColor: "#93C5FD",
      },
      {
        bg: "#143024",
        titleColor: "#BBF7D0",
        descColor: "#86EFAC",
      },
    ];
  }

  return [
    { bg: "#FFE2E5", titleColor: "#1F2024", descColor: "#494A50" },
    { bg: "#FFF4E4", titleColor: "#1F2024", descColor: "#494A50" },
    { bg: "#FFF4E4", titleColor: "#1F2024", descColor: "#494A50" },
    { bg: "#EAF2FF", titleColor: "#1F2024", descColor: "#494A50" },
    { bg: "#E7F4E8", titleColor: "#1F2024", descColor: "#494A50" },
  ];
};

export const buildInstructionTheme = (darkMode, c) => ({
  cardBg: c?.card ?? (darkMode ? "#112240" : "#FFFFFF"),
  cardBorder: c?.border ?? (darkMode ? "rgba(255,255,255,0.08)" : "#E2E8F0"),
  hoverBorder: darkMode ? "rgba(77,163,255,0.35)" : "rgba(1,93,255,0.35)",
  iconBg: c?.iconBg ?? (darkMode ? "#0a1f38" : "#EAF2FF"),
  iconColor: c?.accent ?? (darkMode ? "#4a8adc" : "#015DFF"),
  title: c?.text ?? (darkMode ? "#e8f0fe" : "#0F2646"),
  description: c?.textMuted ?? (darkMode ? "#5a7da0" : "#64748B"),
});

export const buildKitTheme = (darkMode, c) => ({
  card: c?.card ?? (darkMode ? "#112240" : "#FFFFFF"),
  borderLight: c?.borderLight ?? (darkMode ? "rgba(255,255,255,0.12)" : "#E2E8F0"),
  text: c?.text ?? (darkMode ? "#e8f0fe" : "#0F2646"),
  textMuted: c?.textMuted ?? (darkMode ? "#5a7da0" : "#64748B"),
  cardInner: c?.cardInner ?? c?.surfaceSoft ?? (darkMode ? "#0d1e38" : "#F8FAFC"),
  surfaceSoft: c?.surfaceSoft ?? (darkMode ? "#0d1e38" : "#F8FAFC"),
  border: c?.border ?? (darkMode ? "rgba(255,255,255,0.08)" : "#E2E8F0"),
  iconBg: c?.iconBg ?? (darkMode ? "#0a1f38" : "#EAF2FF"),
});
