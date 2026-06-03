// import React from "react";
// import { BrowserRouter } from "react-router-dom";
// import { AppProvider } from "./componants/useAppContext";
// import CustomRoutes from "./routes/Routes";

// const App = () => {
//   return (
//     <BrowserRouter>
//       <AppProvider>
//         <CustomRoutes />
//       </AppProvider>
//     </BrowserRouter>
//   );
// };

// export default App;

// App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./componants/slices/store";
import CustomRoutes from "./routes/Routes";

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <CustomRoutes />
      </BrowserRouter>
    </Provider>
  );
};

export default App;