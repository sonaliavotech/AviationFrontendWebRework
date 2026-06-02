import React, { useState, useEffect, useContext, createContext, useCallback } from "react";

const AppContext = createContext();
const THEME_OPTIONS = [
  {
    id: "blue",
    color: "rgba(1, 93, 255, 1)",
    hover: "rgba(1, 77, 209, 1)",
    soft: "rgba(1, 93, 255, 0.10)",
    border: "rgba(1, 93, 255, 0.25)",
  },
  {
    id: "purple",
    color: "rgba(127, 66, 219, 1)",
    hover: "rgba(106, 52, 187, 1)",
    soft: "rgba(127, 66, 219, 0.10)",
    border: "rgba(127, 66, 219, 0.26)",
  },
  {
    id: "teal",
    color: "rgba(18, 133, 132, 1)",
    hover: "rgba(14, 112, 111, 1)",
    soft: "rgba(18, 133, 132, 0.10)",
    border: "rgba(18, 133, 132, 0.24)",
  },
  {
    id: "brown",
    color: "rgba(128, 81, 14, 1)",
    hover: "rgba(108, 67, 11, 1)",
    soft: "rgba(128, 81, 14, 0.12)",
    border: "rgba(128, 81, 14, 0.28)",
  },
];

const mapProvidersToDoctors = (providers) =>
  (providers || []).map((p) => {
    const firstName = p.first_name ?? p.firstName ?? "";
    const lastName = p.last_name ?? p.lastName ?? "";
    const name = [firstName, lastName].filter(Boolean).length
      ? `Dr. ${firstName} ${lastName}`.trim()
      : "Provider";
    return {
      id: p.id,
      name,
      specialty: p.speciality ?? p.specialty ?? "Provider",
      avatarColor: "#FFFFFF",
      status: p.isActive ? "active" : "inactive",
    };
  });

export function AppProvider({ children }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [autoSave, setAutoSave] = useState(true);
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [selectedThemeId, setSelectedThemeId] = useState(() => {
    if (typeof window === "undefined") return "blue";
    return localStorage.getItem("app_theme_id") || "blue";
  });

  const loadDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const userData = localStorage.getItem("user");
      const currentUser = userData ? JSON.parse(userData) : null;
      const role =
        localStorage.getItem("role") ||
        currentUser?.role ||
        currentUser?.userRole;

      if (!currentUser) {
        setDoctorsList([]);
        setSelectedDoctor(null);
        return;
      }

      if (role === "admin" || role === "user") {
        const res = await getProviders("Doctor");
        const providers = res?.data?.data ?? res?.data ?? [];
        const mapped = mapProvidersToDoctors(
          Array.isArray(providers) ? providers : [],
        );
        console.log("mapped :", mapped);

        setDoctorsList(mapped);
        setSelectedDoctor((prev) => {
          if (!mapped.length) return null; // no doctors
          if (!prev) return mapped[0]; // first load

          const existingDoctor = mapped.find(
            (d) => Number(d.id) === Number(prev.id),
          );

          return existingDoctor ?? mapped[0];
        });
      } else {
        const doctor = mapProvidersToDoctors([currentUser])[0];
        setDoctorsList([doctor]);
        setSelectedDoctor(doctor);
      }
    } catch (err) {
      console.error("Failed to load doctors (AppContext)", err);
      setDoctorsList([]);
      setSelectedDoctor(null);
    } finally {
      setDoctorsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      loadDoctors();
    } else {
      setDoctorsLoading(false);
    }
  }, []);

  // Re-load doctors after login (SignInForm dispatches "auth:login")
  useEffect(() => {
    const onAuthLogin = () => loadDoctors();
    window.addEventListener("auth:login", onAuthLogin);
    return () => window.removeEventListener("auth:login", onAuthLogin);
  }, []);

  const handleDoctorSelect = useCallback((doctor) => {
    setSelectedDoctor(doctor);
    setOpenSettings(false);
  }, []);

  const [autoSaveData, setAutoSaveData] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("app_autosave_data");
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("app_autosave_data", JSON.stringify(autoSaveData));
      } catch (_) {}
    }
  }, [autoSaveData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const activeTheme =
      THEME_OPTIONS.find((item) => item.id === selectedThemeId) ||
      THEME_OPTIONS[0];
    try {
      localStorage.setItem("app_theme_id", activeTheme.id);
    } catch (_) {}
    document.documentElement.style.setProperty(
      "--app-primary-color",
      activeTheme.color,
    );
    document.documentElement.style.setProperty(
      "--app-primary-hover",
      activeTheme.hover,
    );
    document.documentElement.style.setProperty(
      "--app-primary-soft",
      activeTheme.soft,
    );
    document.documentElement.style.setProperty(
      "--app-primary-border",
      activeTheme.border,
    );
  }, [selectedThemeId]);

  const saveData = useCallback(
    (key, data) => {
      if (autoSave) {
        setAutoSaveData((prev) => ({
          ...prev,
          [key]: {
            data,
            timestamp: new Date().toISOString(),
          },
        }));
      }
    },
    [autoSave],
  );

  return (
    <AppContext.Provider
      value={{
        globalSearch,
        setGlobalSearch,
        autoSave,
        setAutoSave,
        autoSaveData,
        saveData,
        doctorsList,
        setDoctorsList,
        selectedDoctor,
        setSelectedDoctor,
        openSettings,
        setOpenSettings,
        loadDoctors,
        handleDoctorSelect,
        doctorsLoading,
        themeOptions: THEME_OPTIONS,
        selectedThemeId,
        setSelectedThemeId,
        selectedThemeColor:
          THEME_OPTIONS.find((item) => item.id === selectedThemeId)?.color ||
          THEME_OPTIONS[0].color,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
