// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import icons from "./public/icons/icons.json" with { type: "json" };
// import million from "million/compiler";
import mkcert from "vite-plugin-mkcert";
import path from "path";
import MagicString from "magic-string"; // Crucial for preserving sourcemaps between plugins!

// --- THE FIXED WORKER PLUGIN (Preserves sourcemaps for Million!) ---
const forceWorkerSharingPlugin = () => {
  return {
    name: "force-worker-sharing",
    enforce: "pre",
    apply: "build",
    async transform(code, id) {
      if (!code.includes("new Worker(new URL(")) return null;

      const regex =
        /new\s+Worker\(\s*new\s+URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)\s*,\s*\{[^}]*type:\s*["']module["'][^}]*\}\s*\)/g;
      const matches = [...code.matchAll(regex)];
      if (matches.length === 0) return null;

      // MagicString preserves the AST/sourcemap chain so Million.js doesn't crash!
      const s = new MagicString(code);

      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const fullMatch = match[0];
        const workerPath = match[1];
        const resolved = await this.resolve(workerPath, id);
        if (!resolved || !resolved.id) continue;

        const referenceId = this.emitFile({ type: "chunk", id: resolved.id });
        const replacement = `new Worker(import.meta.ROLLUP_FILE_URL_${referenceId}, { type: "module" })`;

        s.overwrite(match.index, match.index + fullMatch.length, replacement);
      }

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true }),
      };
    },
  };
};

// --- WEBSITE BUILDER CHUNKING STRATEGY ---
const manualChunks = (id) => {
  if (typeof id !== "string") return;
  if (
    id.includes("node_modules/typescript") ||
    id.includes("@babel/standalone") ||
    id.includes("@typescript/ata")
  )
    return "vendor-compilers";
  if (id.includes("grapesjs") || id.includes("@grapesjs"))
    return "vendor-grapesjs";
  if (
    id.includes("linkedom") ||
    id.includes("jszip") ||
    id.includes("css-tree") ||
    id.includes("csso") ||
    id.includes("html2canvas-pro") ||
    id.includes("js-beautify")
  )
    return "vendor-export-tools";
  if (
    id.includes("node_modules/react") ||
    id.includes("node_modules/react-dom") ||
    id.includes("framer-motion") ||
    id.includes("recoil")
  )
    return "vendor-ui";
  if (id.includes("node_modules")) return "vendor";
};

export default defineConfig({
  base: "/",
  define: { global: "globalThis" },
  server: { https: true, port: 5173, strictPort: true },
  optimizeDeps: {
    exclude: ["@grapesjs/react", "grapesjs"], // ← ADD THIS LINE
    rolldownOptions: { define: { global: "globalThis" } },
  },
  resolve: {
    alias: [
      {
        find: "@welldone-software/why-did-you-render",
        replacement: path.resolve(
          import.meta.dirname,
          "node_modules/vite/dist/client/env.mjs",
        ),
      },
      { find: "global", replacement: "global-this" },
      { find: "@", replacement: path.resolve(import.meta.dirname, "./src") },
    ],
  },
  plugins: [
    forceWorkerSharingPlugin(),
    mkcert(),
    // million.vite({ auto: true }), // RESTORED! It will now work perfectly.
    react(),
    VitePWA({
      registerType: "autoUpdate",
      minify: true,
      devOptions: { enabled: false },
      strategies: "generateSW",
      manifest: {
        name: "Infinitely Studio",
        short_name: "Infinitely Studio",
        theme_color: "#1e293b",
        background_color: "#1e293b",
        display: "standalone",
        start_url: "/",
        ...icons,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,ttf,webp}"],
        maximumFileSizeToCacheInBytes: 15728640,
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: "CacheFirst",
            options: { cacheName: "images" },
          },
          {
            urlPattern: /^https?.*/,
            handler: "NetworkFirst",
            options: { cacheName: "api" },
          },
        ],
        importScripts: ["/dbAssets-sw.js"],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: { main: "./index.html" },
      output: { manualChunks },
    },
    target: "es2022",
    sourcemap: false,

    // FIX: Use esbuild. Vite 8's native Oxc minifier sometimes aggressively minifies away
    // the specific global markers that Million.js relies on to verify the compiler ran.
    minify: "esbuild",

    chunkSizeWarningLimit: 10000,
    assetsDir: "static",
    outDir: "dist",
  },
});
// // vite.config.js
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import removeConsole from "vite-plugin-remove-console";
// import { VitePWA } from "vite-plugin-pwa";
// import icons from "./public/icons/icons.json";
// // import { manualChunksPlugin } from "vite-plugin-webpackchunkname";
// import { chunkSplitPlugin } from "vite-plugin-chunk-split";
// // import MillionLint from "@million/lint";
// // import tailwindcss from '@tailwindcss/vite'
// import million from "million/compiler";
// import mkcert from "vite-plugin-mkcert";
// import path from "path";

// export default defineConfig({
//   base: "/",
//   define: {
//     global: "globalThis",
//     // 'process.env': {}, // Shim process.env
//   },

//   server: {
//     https: true,
//     port: 5173,
//     strictPort: true,
//     // hmr: {
//     //   protocol: "wss",
//     //   host: "127.0.0.1",
//     //   port: 5173,
//     // },
//   },
//   optimizeDeps: {
//     esbuildOptions: {
//       // Node.js global to browser globalThis
//       define: {
//         global: "globalThis",
//         // 'process.env': {}, // Shim process.env
//       },
//     },
//   },
//   resolve: {
//     alias: {
//       global: "global-this",
//       "@": path.resolve(__dirname, "./src"),
//       // '@grapesjs/react': path.resolve(__dirname, 'src/lib/grapesjs-react-adapter.jsx'),
//     },
//   },
//   plugins: [
//     mkcert(),
//     million.vite({ auto: true }),
//     react(),
//     // MillionLint.vite({}),
//     // tailwindcss(),

//     // removeConsole(),
//     VitePWA({
//       registerType: "autoUpdate",
//       minify: true,
//       // devOptions: {
//       //   enabled: true, // Enable SW in dev mode
//       //   type: "module", // Explicitly set the service worker type to module
//       //   navigateFallback: "/", // Fallback for navigation
//       // },
//       devOptions: {
//         enabled: false,
//       },

//       strategies: "generateSW",
//       manifest: {
//         name: "Infinitely Studio",
//         description: "Infinitely Studio",
//         theme_color: "#1e293b",
//         background_color: "#1e293b",
//         display: "standalone",
//         short_name: "Infinitely Studio",
//         start_url: "/",
//         ...icons,
//       },

//       workbox: {
//         globPatterns: ["**/*.{js,css,html,ico,png,svg,tff,webp}"],
//         maximumFileSizeToCacheInBytes: 10485760,
//         runtimeCaching: [
//           {
//             urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/, // Cache images at runtime
//             handler: "CacheFirst",
//             options: {
//               cacheName: "images",
//               // expiration: {
//               //   maxEntries: 50,
//               //   maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
//               // },
//             },
//           },
//           {
//             urlPattern: /^https?.*/, // Cache all HTTP/HTTPS requests (e.g., APIs)
//             handler: "NetworkFirst",
//             options: {
//               cacheName: "api",
//               // expiration: {
//               //   maxEntries: 20,
//               //   maxAgeSeconds: 24 * 60 * 60, // 1 day
//               // },
//             },
//           },
//         ],
//         importScripts: ["/dbAssets-sw.js"],
//       },
//     }),
//   ],
//   worker: {
//     format: "es", // Use 'es' instead of 'iife'
//   },

//   build: {
//     rollupOptions: {
//       // treeshake:false,
//       input: {
//         main: "./index.html",
//       },
//     },
//     target: "es2022",
//     sourcemap: false,
//     minify: "esbuild",
//     chunkSizeWarningLimit: "5000",
//     assetsDir: "static",
//     outDir: "dist",
//     server: {
//       https: true,
//     },
//   },
// });
