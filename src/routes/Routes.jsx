import React, { lazy, useState, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box } from "@mui/material";

import Sidebar from "../componants/Sidebar";
import ProtectedRoute from "./ProtectedRoutes";
import SearchKit from "../pages/SearchKit/SearchKit"
import ChatWidget from "../pages/ChatWidget/ChatWidget";
import CaseDetails from "../pages/AllEvents/casedetails/CaseDetails";
import { useThemeMode, getTheme } from "../context/ThemeContext";

// Lazy loaded pages
const AllEvents = lazy(() => import("../pages/AllEvents/AllEvents"));
const SignIn = lazy(() => import("../componants/SignIn"));
const FindMedicineinKit = lazy(() => import("../pages/FindMedicineinKit/FindMedicineinKit"));

const MainLayout = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const { darkMode } = useThemeMode();
  const theme = getTheme(darkMode);

  // CHAT STATE
  const [openChat, setOpenChat] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleOpenChat = () => {
    setOpenChat(true);
    setTimeout(() => setVisible(true), 10);
  };

  const handleCloseChat = () => {
    setVisible(false);
    setTimeout(() => setOpenChat(false), 200);
  };

  return (
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          bgcolor: theme.pageBg,
          position: "relative",
          transition: "background-color 0.3s ease",
        }}
      >
        {/* Sidebar */}
        <Sidebar onAiClick={handleOpenChat} />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            bgcolor: theme.pageBg,
            transition: "background-color 0.3s ease",
          }}
        >
          {children}
        </Box>

        {openChat && (
          <ChatWidget onClose={handleCloseChat} visible={visible} />
        )}
      </Box>
    </ProtectedRoute>
  );
};

const CustomRoutes = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />

        <Route
          path="/all-events"
          element={
            <MainLayout>
              <AllEvents />
            </MainLayout>
          }
        />
        <Route path="/search-kit"
        element={
           <MainLayout>
            <SearchKit/>
           </MainLayout>
        }
        />
        {/* <Route path="/Event" element={<PatientVitalsSidebar/>} /> */}
        <Route path="/CaseDetails" element={<MainLayout><CaseDetails/></MainLayout>} />

        {/* Redirect root and unknown paths */}
        <Route path="/" element={<Navigate to="/all-events" replace />} />
        <Route path="*" element={<Navigate to="/all-events" replace />} />
      </Routes>
    </Suspense>
  );
};

export default CustomRoutes;