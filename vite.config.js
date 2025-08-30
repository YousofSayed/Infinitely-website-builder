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
import million from 'million/compiler'

export default defineConfig({
  base:'/',
  define: {
    global: "globalThis",
    // 'process.env': {}, // Shim process.env
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
    },
  },
  plugins: [
    million.vite({auto:true}),
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

      strategies: "generateSW",
      // injectManifest: {
      //   rollupFormat: "es",

      // },
      // srcDir: "src",
      // filename: "sw.ts",
      manifest: {
        name: "Infinitely Studio",
        description: "Infinitely Studio",
        theme_color: "#1e293b",
        background_color: "#1e293b",
        display: "standalone",
        short_name: "Infinitely",
        start_url: "/",
        ...icons,
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,tff,webp}"],
        maximumFileSizeToCacheInBytes:10485760,
        runtimeCaching: [
    //       {
    //         handler({event , request , url , params}){
    //           (async () => {
    //   const url = new URL(event.request.url);
    //   const splittedUrl = url.pathname.split("/");
    //   const fileName = splittedUrl.pop();
    //   let folderPath = splittedUrl.join("/");
    //   folderPath = folderPath.startsWith("/") ? folderPath.replace("/", "") : folderPath;
    //   const projectId = vars["projectId"];

    //   if (!projectId) {
    //     return new Response(new Blob(["Project ID not found"], { type: "text/plain" }), {
    //       status: 400,
    //     });
    //   }

    //   console.log(`From sw project id is: ${projectId}`);

    //   opfsBroadcastChannel.postMessage({
    //     type: "getFile",
    //     from: "sw",
    //     folderPath,
    //     fileName,
    //     projectId,
    //   });

    //   /**
    //    * @type {File|undefined}
    //    */
    //   const responseFile = await new Promise((resolve, reject) => {
    //     /**
    //      * @param {MessageEvent} ev
    //      */
    //     const callback = (ev) => {
    //       console.log("from service worker sendFile broadcast", folderPath, fileName);
    //       const { type, file, isExisit } = ev.data;

    //       if (type !== "sendFile") {
    //         reject(`No file found: ${file}, ${isExisit}`);
    //         opfsBroadcastChannel.removeEventListener("message", callback);
    //         return;
    //       }

    //       if (isExisit && file) {
    //         resolve(file);
    //       } else {
    //         reject(`No file found: ${file}, ${isExisit}`);
    //       }
    //       opfsBroadcastChannel.removeEventListener("message", callback);
    //     };

    //     opfsBroadcastChannel.addEventListener("message", callback);
    //   });

    //   if (responseFile) {
    //     return new Response(responseFile, {
    //       status: 200,
    //       headers: {
    //         "Content-Type": responseFile.type || "application/octet-stream",
    //         "Access-Control-Allow-Origin": "*", // For cross-origin iframes
    //       },
    //     });
    //   }

    //   return fetch(event.request)
    //   // return new Response(new Blob(["404 not found!"], { type: "text/plain" }), {
    //   //   status: 404,
    //   // });
    // })()
    //         }
    //       },
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
    chunkSplitPlugin({
      strategy: "default",
      customSplitting: {
        vendor0: [/\breact\b/],
        vendor1: [/\bgrapesjs\b/],
        vendor2: [
          /\@monaco-editor\/react/,
          /react-resizable-panels/,
          /react-virtuoso/,
        ],
        vendor3: [/react-sortablejs/, /linkedom/, /csso/, /css/],
        vendor4: [
          /lodash/,
          /js-beautify/,
          /interactjs/,
          /react-error-boundary/,

          /mime/,
        ],
        vendor5: [
          /react-sticky-el/,
          // /react-syntax-highlighter/,
          /react-toastify/,
          /react-tooltip/,
          /react-virtuoso/,
          /recoil/,
          /serialize-javascript/,
        ],
        vendor6: [/react-dom/, /react-router-dom/],
        vendor7: [/\@grapesjs\/react/],
        vendor8: [/html-to-image/, /lodash/, /html2canvas-pro/],
        typescript:[/\btypescript\b/],
        icons: [/Icons\.jsx/],
      },
    }),
    // mergePrecacheIntoDbAssetsSw(),
  ],
  worker: {
    format: "es", // Use 'es' instead of 'iife'
  },

  build: {
    rollupOptions:{
      treeshake:true,
    },
    minify:'esbuild',
    chunkSizeWarningLimit: "5000",
    assetsDir: "static",
    outDir:'dist',
  },
});

