import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "icon.png"
      ],

      manifest: {
        name: "FrontBFF",
        short_name: "FrontBFF",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",

        icons: [
          {
            src: "icon.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icon.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })
  ]
});
