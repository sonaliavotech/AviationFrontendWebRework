import React, { lazy, useState, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box } from "@mui/material";

import { getPhysicianSession } from "../utils/physicianSession";
import Sidebar from "../componants/Sidebar";
import ProtectedRoute from "./ProtectedRoutes";
import ChatWidget from "../pages/ChatWidget/ChatWidget";
import CaseDetails from "../pages/casedetails/CaseDetails";
import { useThemeMode, getTheme } from "../context/ThemeContext";
import NotificationPanel from "../pages/AllEvents/Alert";
import LoadingSpinner from "../componants/LoadingSpinner";
import AllEvents from "../pages/AllEvents/AllEvents";

// Lazy loaded pages (AllEvents is eager — default landing page)
const SignIn = lazy(() => import("../componants/SignIn"));
const FindMedicineinKit = lazy(
  () => import("../pages/FindMedicineinKit/FindMedicineinKit"),
);
const SearchKit = lazy(() => import("../pages/SearchKit/SearchKit"));
const FAQs = lazy(() => import("../pages/FAQs/FAQs"));

const MainLayout = ({ children }) => {
  const isAuthenticated = !!getPhysicianSession();
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
          height: { xs: "100dvh", md: "100vh" },
          minHeight: { xs: "100dvh", md: "100vh" },
          overflow: "hidden",
          bgcolor: theme.pageBg,
          position: "relative",
          transition: "background-color 0.3s ease",
          "@supports not (height: 100dvh)": {
            height: { xs: "-webkit-fill-available", md: "100vh" },
            minHeight: { xs: "-webkit-fill-available", md: "100vh" },
          },
        }}
      >
        {/* Sidebar */}
        <Sidebar onAiClick={handleOpenChat} />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            bgcolor: theme.pageBg,
            transition: "background-color 0.3s ease",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </Box>

        {openChat && <ChatWidget onClose={handleCloseChat} visible={visible} />}
      </Box>
    </ProtectedRoute>
  );
};

const CustomRoutes = () => {
  return (
    <Suspense
      fallback={
        <LoadingSpinner
          variant="fullscreen"
          size="lg"
          message="Loading TiaTELE..."
        />
      }
    >
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

        <Route
          path="/search-kit"
          element={
            <MainLayout>
              <SearchKit />
            </MainLayout>
          }
        />

        <Route
          path="/find-medicine"
          element={
            <MainLayout>
              <FindMedicineinKit />
            </MainLayout>
          }
        />

        <Route
          path="/faqs"
          element={
            <MainLayout>
              <FAQs />
            </MainLayout>
          }
        />

        <Route
          path="/alert"
          element={
            <MainLayout>
              <NotificationPanel />
            </MainLayout>
          }
        />

        <Route
          path="/CaseDetails"
          element={
            <MainLayout>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <CaseDetails />
              </Box>
            </MainLayout>
          }
        />

        {/* Redirect root and unknown paths */}
        <Route path="/" element={<Navigate to="/all-events" replace />} />
        <Route path="*" element={<Navigate to="/all-events" replace />} />
      </Routes>
    </Suspense>
  );
};

export default CustomRoutes;
