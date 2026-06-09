import React from "react";
import { BrowserRouter } from "react-router-dom";
import CustomRoutes from "./routes/Routes";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <CustomRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
