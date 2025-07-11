import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import ChatProvider from "./context/ChatProvider";

createRoot(document.getElementById("root")).render(
  <Router>
    <ChatProvider>
      <App />
    </ChatProvider>
  </Router>
);
