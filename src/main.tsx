import "./lib/pwa"; // Initialize PWA install prompt capture early
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
