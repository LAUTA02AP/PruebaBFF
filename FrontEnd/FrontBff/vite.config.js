import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      // ✅ Para probar PWA en dev (opcional)
      devOptions: {
        enabled: true,
      },

      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "icon.png",
      ],

      manifest: {
        name: "FrontBFF",
        short_name: "FrontBFF",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        icons: [
          { src: "icon.png", sizes: "192x192", type: "image/png" },
          { src: "icon.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      // ✅ Workbox (runtime cache para GET del BFF)
      workbox: {
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/bff/sistema/"),
            handler: "NetworkFirst",
            method: "GET",
            options: {
              cacheName: "bff-api-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
