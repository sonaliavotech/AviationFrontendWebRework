import { BrowserRouter } from "react-router-dom";
import CustomRoutes from "./routes/Routes";
import { ThemeProvider } from "./context/ThemeContext";
import { useAviationChatNotification } from "./hooks/useAviationChatNotification";
import ChatNotificationBanner from "./componants/ChatNotificationBanner";

const App = () => {
  // Root-level: keeps the chat-message notification listener alive across routes
  // (dashboard, case details, etc.) so sound + in-app banner fire even when the
  // chat panel itself isn't open.
  const { banners, dismissBanner } = useAviationChatNotification();
  return (
    <ThemeProvider>
      <BrowserRouter>
        <CustomRoutes />
        <ChatNotificationBanner banners={banners} onDismiss={dismissBanner} />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
