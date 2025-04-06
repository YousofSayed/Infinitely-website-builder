// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import removeConsole from "vite-plugin-remove-console";
import { VitePWA } from "vite-plugin-pwa";
import icons from "./public/icons/icons.json";
function hotReloadServiceWorker() {
  return {
    name: "hot-reload-sw",
    configureServer(server) {
      server.watcher.add("src/dbAssets-sw.js"); // Watch src/sw.js
      server.watcher.on("change", async (file) => {
        if (file.endsWith("dbAssets-sw.js")) {
          const srcPath = path.resolve(__dirname, "src/dbAssets-sw.js");
          const destPath = path.resolve(__dirname, "public/dbAssets-sw.js");
          fs.copyFileSync(srcPath, destPath); // Copy to public/
          console.log("SW updated, notifying client...");
          server.ws.send({
            type: "custom",
            event: "sw-updated",
            data: { path: "/dbAssets-sw.js" },
          });
        }
      });
    },
    buildStart() {
      // Initial copy during build
      fs.copyFileSync("src/dbAssets-sw.js", "public/dbAssets-sw.js");
    },
  };
}

function mergePrecacheIntoDbAssetsSw() {
  return {
    name: "merge-precache-into-dbassets-sw",
    writeBundle() {
      const swPath = path.resolve(__dirname, "dist/sw.js"); // Precache from vite-plugin-pwa
      const dbAssetsSwPath = path.resolve(__dirname, "public/dbAssets-sw.js"); // Your SW
      const outputPath = path.resolve(__dirname, "dist/dbAssets-sw.js"); // Final SW

      // Read precaching logic (sw.js)
      const swContent = fs.existsSync(swPath)
        ? fs.readFileSync(swPath, "utf8")
        : "";

      // Extract only the precaching part (avoid duplicate event listeners)
      const precacheLogic = swContent.split("self.addEventListener")[0].trim();

      // Read your dbAssets-sw.js
      const dbAssetsSwContent = fs.readFileSync(dbAssetsSwPath, "utf8");

      // Combine: precache first, then your logic
      const combinedContent = `${precacheLogic}\n\n${dbAssetsSwContent}`;

      // Write the merged file
      fs.writeFileSync(outputPath, combinedContent, "utf8");

      // Clean up sw.js
      if (fs.existsSync(swPath)) {
        fs.unlinkSync(swPath);
      }
    },
  };
}
export default defineConfig({
  plugins: [
    react(),
    // removeConsole(),
    VitePWA({
      registerType: "autoUpdate",
      minify: true,
      devOptions: {
        enabled: true, // Enable service worker in development mode
        type: "module", // Use module type for service worker (if your project supports it)
        navigateFallback: "/", // Fallback for navigation in dev mode
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,tff,webp}"],
        // Add runtime caching for dynamic content
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/, // Cache images at runtime
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /^https?.*/, // Cache all HTTP/HTTPS requests (e.g., APIs)
            handler: "NetworkFirst",
            options: {
              cacheName: "api",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
            },
          },
        ],
      },
      manifest: {
        name: "Infinitely",
        description: "Infinitely website builder",
        theme_color: "#020617",
        background_color: "#020617",
        display: "standalone",
        start_url: "/",
        ...icons,
      },
    })
    // mergePrecacheIntoDbAssetsSw(),
  ],
  worker: {
    format: "es", // Use 'es' instead of 'iife'
  },
  build: {
    // rollupOptions: {
    //   output: {
    //     manualChunks: (id) => {
    //       if (id.includes('node_modules')) {
    //         // Split React and React DOM into their own chunk
    //         if (id.includes('react') || id.includes('react-dom')) {
    //           return 'react-vendor';
    //         }
    //         // Add other large libraries here if applicable (e.g., lodash, axios)
    //         if (id.includes('lodash')) {
    //           return 'lodash-vendor';
    //         }
    //         // All other node_modules go to a generic vendor chunk
    //         return 'vendor';
    //       }
    //       if (id.includes('src/helpers/infinitelyWorker.js')) {
    //         return 'worker';
    //       }
    //       return 'app';
    //     },
    //   },
    // },
  },
});
