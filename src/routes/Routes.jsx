import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "../componants/Sidebar";
import ProtectedRoute from "./ProtectedRoutes";
import SearchKit from "../pages/SearchKit/SearchKit"
// Lazy loaded pages
const AllEvents = lazy(() => import("../pages/AllEvents/AllEvents"));
const SignIn = lazy(() => import("../componants/SignIn"));

const MainLayout = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return (
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          bgcolor: "rgba(11, 29, 53, 1)",
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
      <Route path="/alerts"
      element={
         <MainLayout>
          <SearchKit/>
         </MainLayout>
      }
      />
    </Routes>
  );
};

export default CustomRoutes;
