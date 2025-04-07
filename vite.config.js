// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import removeConsole from "vite-plugin-remove-console";
import { VitePWA } from "vite-plugin-pwa";
import icons from "./public/icons/icons.json";
// import { manualChunksPlugin } from "vite-plugin-webpackchunkname";
import { chunkSplitPlugin } from "vite-plugin-chunk-split";
// import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    // tailwindcss(),
    
    // removeConsole(),
    VitePWA({
      registerType: "autoUpdate",
      // minify: true,
      devOptions: {
        enabled: true, // Enable SW in dev mode
        type: "classic", // Use module type for SW
        navigateFallback: "/", // Fallback for navigation
      },
      strategies: "generateSW",

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,tff,webp}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes("assets/"),
            handler: ({ url, request, event }) => {
              if (url.pathname.includes("/keep-alive")) {
                event.respondWith(
                  new Response(new Blob(["ok"], { type: "text/plain" }))
                );
                return;
              }

              // const vars = self.__VARS || {};
              const fileName = url.pathname.split("/").pop();
              const projectId = vars["projectId"];

              if (projectId) {
                const projectData = vars["projectData"] || {};
                const assets = projectData.assets || [];
                const fileFromDB = assets
                  .concat(Object.values(projectData.fonts || {}))
                  .find(
                    (asset) =>
                      encodeURIComponent(
                        asset.file?.name || ""
                      ).toLowerCase() === fileName.toLowerCase()
                  );

                if (fileFromDB) {
                  event.respondWith(
                    new Response(fileFromDB.file, {
                      status: 200,
                      headers: {
                        "Content-Type":
                          fileFromDB.file?.type || "application/octet-stream",
                      },
                    })
                  );
                  return;
                }
              }

              // Cache or fetch with offline fallback
              // event.respondWith(
              //   caches.match(request).then((cached) => {
              //     if (cached) return cached;
              //     return fetch(request)
              //       .then((response) => {
              //         caches
              //           .open("assets-cache")
              //           .then((cache) => cache.put(request, response.clone()));
              //         return response;
              //       })
              //       .catch(() => {
              //         return new Response("Offline and no cache", {
              //           status: 503,
              //         });
              //       });
              //   })
              // );
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/, // Cache images at runtime
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              // expiration: {
              //   maxEntries: 50,
              //   maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              // },
            },
          },
          {
            urlPattern: /^https?.*/, // Cache all HTTP/HTTPS requests (e.g., APIs)
            handler: "NetworkFirst",
            options: {
              cacheName: "api",
              // expiration: {
              //   maxEntries: 20,
              //   maxAgeSeconds: 24 * 60 * 60, // 1 day
              // },
            },
          },
        ],
        importScripts: ["/custom-sw.js"],
      },
      manifest: {
        name: "Infinitely",
        description: "Infinitely website builder",
        theme_color: "#1e293b",
        background_color: "#1e293b",
        display: "standalone",
        start_url: "/",
        ...icons,
      },
      // srcDir: "src",
      // filename: "custom-sw.js", // Source file for custom SW
      // injectManifest: {
      //   injectionPoint: undefined, // Let VitePWA handle injection
      // },
    }),
    chunkSplitPlugin({
      strategy: "default",
      customSplitting: {
        vendor: [
          /react/,
          /react-dom/,
          /react-router-dom/,
          /grapesjs/,
          /\@grapesjs\/react/,
          /\@monaco-editor\/react/,
          /react-resizable-panels/,
          /react-virtuoso/,
          // /react-sortablejs/,
          // /linkedom/,
          // /lodash/,
          // /html2canvas-pro/,
          // /csso/,
          // /css/
        ], 
        
      },
    }),
    // mergePrecacheIntoDbAssetsSw(),
  ],
  worker: {
    format: "es", // Use 'es' instead of 'iife'
  },
 
  build: {
    chunkSizeWarningLimit: "5000",
  },
});
