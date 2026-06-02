import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Sidebar from "../componants/Sidebar";
import ProtectedRoute from "./ProtectedRoutes";

// Lazy loaded pages
const AllEvents = lazy(() => import("../pages/AllEvents/AllEvents"));
const SignIn = lazy(() => import("../componants/SignIn"));

// Simple stub pages for sidebar routes
const StubPage = ({ title }) => (
  <Box sx={{ p: 4, color: "#333", fontSize: 24, fontWeight: 600 }}>
    {title} — Coming Soon
  </Box>
);

const Loading = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
    }}
  >
    <CircularProgress />
  </Box>
);

// Main layout with sidebar
const MainLayout = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return (
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          bgcolor: "#F8F9FC",
        }}
      >
        <Sidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

const CustomRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public routes */}
        <Route path="/sign-in" element={<SignIn />} />

        {/* Protected routes with sidebar */}
        <Route
          path="/all-events"
          element={
            <MainLayout>
              <AllEvents />
            </MainLayout>
          }
        />
        <Route
          path="/new-event"
          element={
            <MainLayout>
              <StubPage title="New Event" />
            </MainLayout>
          }
        />
        <Route
          path="/search-kit"
          element={
            <MainLayout>
              <StubPage title="Search Kit" />
            </MainLayout>
          }
        />
        <Route
          path="/faqs"
          element={
            <MainLayout>
              <StubPage title="FAQs" />
            </MainLayout>
          }
        />
        <Route
          path="/tia-ai"
          element={
            <MainLayout>
              <StubPage title="Tia AI" />
            </MainLayout>
          }
        />
        <Route
          path="/devisec"
          element={
            <MainLayout>
              <StubPage title="Devices" />
            </MainLayout>
          }
        />
        <Route
          path="/alerts"
          element={
            <MainLayout>
              <StubPage title="Alerts" />
            </MainLayout>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/all-events" replace />} />
        <Route path="*" element={<Navigate to="/all-events" replace />} />
      </Routes>
    </Suspense>
  );
};

export default CustomRoutes;
