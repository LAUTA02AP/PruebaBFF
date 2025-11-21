// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Registro del Service Worker (PWA)
import { registerSW } from "virtual:pwa-register";

// Esto registra y auto-actualiza el service worker
registerSW({
  immediate: true,       // activa inmediatamente
  onNeedRefresh() {
    console.log("Nueva versión disponible");
  },
  onOfflineReady() {
    console.log("La app está lista para funcionar offline");
  },
});

// Render principal
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
