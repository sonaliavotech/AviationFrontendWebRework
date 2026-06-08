import React, { lazy, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";

import Sidebar from "../componants/Sidebar";
import ProtectedRoute from "./ProtectedRoutes";
import SearchKit from "../pages/SearchKit/SearchKit"
// import PatientVitalsSidebar from "../pages/AllEvents/Event";
import ChatWidget from "../pages/ChatWidget/ChatWidget";
import CaseDetails from "../pages/AllEvents/casedetails/CaseDetails";


import Response from "../pages/Response/Response";


// Lazy loaded pages
const AllEvents = lazy(() => import("../pages/AllEvents/AllEvents"));
const SignIn = lazy(() => import("../componants/SignIn"));
const FindMedicineinKit = lazy(() => import("../pages/FindMedicineinKit/FindMedicineinKit"));

const MainLayout = ({ children }) => {
  const isAuthenticated =
    !!localStorage.getItem("token");

  // CHAT STATE
  const [openChat, setOpenChat] = useState(false);
  const [visible, setVisible] = useState(false);

  // OPEN CHAT
  const handleOpenChat = () => {
    setOpenChat(true);
    setTimeout(() => setVisible(true), 10); // allow render first
  };

  // CLOSE CHAT
  const handleCloseChat = () => {
    setVisible(false); // trigger animation first

    setTimeout(() => {
      setOpenChat(false); // then remove
    }, 200);
  };

  return (
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          bgcolor: "rgba(11, 29, 53, 1)",
          position: "relative",
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
          }}
        >
          {children}
        </Box>

        {/* CHAT (NO BUG NOW) */}
        {openChat && (
          <ChatWidget
            onClose={handleCloseChat}
            visible={visible}
          />
        )}
      </Box>
    </ProtectedRoute>
  );
};

const CustomRoutes = () => {
  return (
    <Routes>
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
      <Route path="/search-kit"
      element={
         <MainLayout>
          <SearchKit/>
         </MainLayout>
      }
      />
      <Route path="/alerts"
        element={
          <MainLayout>
            <SearchKit />
          </MainLayout>
        }
      />
         <Route
        path="/FindMedicineinKit"
        element={
          <MainLayout>
            <FindMedicineinKit />
          </MainLayout>
        }
      />
         <Route
        path="/Response"
        element={
          <MainLayout>
            <Response />
          </MainLayout>
        }
      />
      {/* <Route path="/Event" element={<PatientVitalsSidebar/>} /> */}
      <Route path="/CaseDetails" element={<MainLayout><CaseDetails/></MainLayout>} />
    </Routes>
  );
};

export default CustomRoutes;