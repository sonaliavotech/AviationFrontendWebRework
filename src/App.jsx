import React from "react";
import { BrowserRouter } from "react-router-dom";
import CustomRoutes from "./routes/Routes";

const App = () => {
  return (
    <BrowserRouter>
      <CustomRoutes />
    </BrowserRouter>
  );
};

export default App;
