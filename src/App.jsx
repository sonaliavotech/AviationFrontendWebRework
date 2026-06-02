import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./componants/useAppContext";
import CustomRoutes from "./routes/Routes";

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <CustomRoutes />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
