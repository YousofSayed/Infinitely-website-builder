// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import removeConsole from "vite-plugin-remove-console";
import { VitePWA } from "vite-plugin-pwa";
import icons from "./public/icons/icons.json";
// import { manualChunksPlugin } from "vite-plugin-webpackchunkname";
import { chunkSplitPlugin } from "vite-plugin-chunk-split";
// import MillionLint from "@million/lint";
// import tailwindcss from '@tailwindcss/vite'
import million from "million/compiler";
import mkcert from "vite-plugin-mkcert";
import path from "path";

export default defineConfig({
  base: "/",
  define: {
    global: "globalThis",
    // 'process.env': {}, // Shim process.env
  },

  server: {
    https: true,
    port: 5173,
    strictPort: true,
    // hmr: {
    //   protocol: "wss",
    //   host: "127.0.0.1",
    //   port: 5173,
    // },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
        // 'process.env': {}, // Shim process.env
      },
    },
  },
  resolve: {
    alias: {
      global: "global-this",
      "@": path.resolve(__dirname, "./src"),
      // '@grapesjs/react': path.resolve(__dirname, 'src/lib/grapesjs-react-adapter.jsx'),
    },
  },
  plugins: [
    mkcert(),
    million.vite({ auto: true }),
    react(),
    // MillionLint.vite({}),
    // tailwindcss(),

    // removeConsole(),
    VitePWA({
      registerType: "autoUpdate",
      minify: true,
      // devOptions: {
      //   enabled: true, // Enable SW in dev mode
      //   type: "module", // Explicitly set the service worker type to module
      //   navigateFallback: "/", // Fallback for navigation
      // },
      devOptions: {
        enabled: false,
      },

      strategies: "generateSW",
      manifest: {
        name: "Infinitely Studio",
        description: "Infinitely Studio",
        theme_color: "#1e293b",
        background_color: "#1e293b",
        display: "standalone",
        short_name: "Infinitely Studio",
        start_url: "/",
        ...icons,
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,tff,webp}"],
        maximumFileSizeToCacheInBytes: 10485760,
        runtimeCaching: [
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
        importScripts: ["/dbAssets-sw.js"],
      },
    }),
  ],
  worker: {
    format: "es", // Use 'es' instead of 'iife'
  },

  build: {
    rollupOptions: {
      // treeshake:false,
      input: {
        main: "./index.html",
        app: "./app.html",
      },
    },
    target: "es2022",
    sourcemap: true,
    minify: "esbuild",
    chunkSizeWarningLimit: "5000",
    assetsDir: "static",
    outDir: "dist",
    server: {
      https: true,
    },
  },
});
