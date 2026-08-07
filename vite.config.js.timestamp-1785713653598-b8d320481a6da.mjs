// vite.config.js
import { defineConfig } from "file:///J:/code/Infinitely%20studio/node_modules/vite/dist/node/index.js";
import react from "file:///J:/code/Infinitely%20studio/node_modules/@vitejs/plugin-react/dist/index.mjs";
import removeConsole from "file:///J:/code/Infinitely%20studio/node_modules/vite-plugin-remove-console/dist/index.mjs";
import { VitePWA } from "file:///J:/code/Infinitely%20studio/node_modules/vite-plugin-pwa/dist/index.js";

// public/icons/icons.json
var icons_default = {
  icons: [
    {
      src: "icons/android/android-launchericon-192-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "icons/android/android-launchericon-512-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "icons/ios/180.png",
      sizes: "180x180",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "icons/ios/1024.png",
      sizes: "1024x1024",
      type: "image/png",
      purpose: "any maskable"
    },
    {
      src: "icons/android/android-launchericon-192-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable"
    }
  ]
};

// vite.config.js
import { chunkSplitPlugin } from "file:///J:/code/Infinitely%20studio/node_modules/vite-plugin-chunk-split/dist/index.mjs";
import million from "file:///J:/code/Infinitely%20studio/node_modules/million/dist/packages/compiler.mjs";
import mkcert from "file:///J:/code/Infinitely%20studio/node_modules/vite-plugin-mkcert/dist/mkcert.mjs";
import path from "path";
var __vite_injected_original_dirname = "J:\\code\\Infinitely studio";
var vite_config_default = defineConfig({
  base: "/",
  define: {
    global: "globalThis"
    // 'process.env': {}, // Shim process.env
  },
  //  server: {
  //   watch: {
  //     ignored: ['**/node_modules/**', '**/.git/**']
  //   },
  //   //  headers: {
  //   //    "Cross-Origin-Embedder-Policy": "unsafe-none",
  //   //   "Cross-Origin-Opener-Policy": "unsafe-none",
  //   // }
  // },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis"
        // 'process.env': {}, // Shim process.env
      }
    }
  },
  resolve: {
    alias: {
      global: "global-this",
      "@": path.resolve(__vite_injected_original_dirname, "./src")
      // '@grapesjs/react': path.resolve(__dirname, 'src/lib/grapesjs-react-adapter.jsx'),
    }
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
        short_name: "Infinitely Studio",
        start_url: "/",
        ...icons_default
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,tff,webp}"],
        maximumFileSizeToCacheInBytes: 10485760,
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
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            // Cache images at runtime
            handler: "CacheFirst",
            options: {
              cacheName: "images"
              // expiration: {
              //   maxEntries: 50,
              //   maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              // },
            }
          },
          {
            urlPattern: /^https?.*/,
            // Cache all HTTP/HTTPS requests (e.g., APIs)
            handler: "NetworkFirst",
            options: {
              cacheName: "api"
              // expiration: {
              //   maxEntries: 20,
              //   maxAgeSeconds: 24 * 60 * 60, // 1 day
              // },
            }
          }
        ],
        importScripts: ["/dbAssets-sw.js"]
      }
    })
    // chunkSplitPlugin({
    //   strategy: "default",
    //   // customSplitting: {
    //   //   vendor0: [/\breact\b/],
    //   //   vendor1: [/\bgrapesjs\b/],
    //   //   vendor2: [
    //   //     /\@monaco-editor\/react/,
    //   //     /react-resizable-panels/,
    //   //     /react-virtuoso/,
    //   //   ],
    //   //   vendor3: [/react-sortablejs/, /linkedom/, /csso/],
    //   //   vendor4: [
    //   //     /lodash/,
    //   //     /js-beautify/,
    //   //     /interactjs/,
    //   //     /react-error-boundary/,
    //   //     /mime/,
    //   //   ],
    //   //   vendor5: [
    //   //     /react-sticky-el/,
    //   //     // /react-syntax-highlighter/,
    //   //     /react-toastify/,
    //   //     /react-tooltip/,
    //   //     /react-virtuoso/,
    //   //     /recoil/,
    //   //     /serialize-javascript/,
    //   //   ],
    //   //   vendor6: [/react-dom/, /react-router-dom/],
    //   //   vendor7: [/\@grapesjs\/react/],
    //   //   vendor8: [/html-to-image/, /lodash/, /html2canvas-pro/],
    //   //   typescript:[/\btypescript\b/],
    //   //   icons: [/Icons\.jsx/],
    //   // },
    // }),
    // mergePrecacheIntoDbAssetsSw(),
  ],
  worker: {
    format: "es"
    // Use 'es' instead of 'iife'
  },
  build: {
    rollupOptions: {
      // treeshake:false,
      input: {
        main: "./index.html",
        app: "./app.html"
      }
    },
    target: "es2022",
    sourcemap: true,
    minify: "esbuild",
    chunkSizeWarningLimit: "5000",
    assetsDir: "static",
    outDir: "dist",
    server: {
      https: true
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicHVibGljL2ljb25zL2ljb25zLmpzb24iXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJKOlxcXFxjb2RlXFxcXEluZmluaXRlbHkgc3R1ZGlvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJKOlxcXFxjb2RlXFxcXEluZmluaXRlbHkgc3R1ZGlvXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9KOi9jb2RlL0luZmluaXRlbHklMjBzdHVkaW8vdml0ZS5jb25maWcuanNcIjsvLyB2aXRlLmNvbmZpZy5qc1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcbmltcG9ydCByZW1vdmVDb25zb2xlIGZyb20gXCJ2aXRlLXBsdWdpbi1yZW1vdmUtY29uc29sZVwiO1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSBcInZpdGUtcGx1Z2luLXB3YVwiO1xyXG5pbXBvcnQgaWNvbnMgZnJvbSBcIi4vcHVibGljL2ljb25zL2ljb25zLmpzb25cIjtcclxuLy8gaW1wb3J0IHsgbWFudWFsQ2h1bmtzUGx1Z2luIH0gZnJvbSBcInZpdGUtcGx1Z2luLXdlYnBhY2tjaHVua25hbWVcIjtcclxuaW1wb3J0IHsgY2h1bmtTcGxpdFBsdWdpbiB9IGZyb20gXCJ2aXRlLXBsdWdpbi1jaHVuay1zcGxpdFwiO1xyXG4vLyBpbXBvcnQgTWlsbGlvbkxpbnQgZnJvbSBcIkBtaWxsaW9uL2xpbnRcIjtcclxuLy8gaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xyXG5pbXBvcnQgbWlsbGlvbiBmcm9tICdtaWxsaW9uL2NvbXBpbGVyJ1xyXG5pbXBvcnQgbWtjZXJ0IGZyb20gJ3ZpdGUtcGx1Z2luLW1rY2VydCc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBiYXNlOiAnLycsXHJcbiAgZGVmaW5lOiB7XHJcbiAgICBnbG9iYWw6IFwiZ2xvYmFsVGhpc1wiLFxyXG4gICAgLy8gJ3Byb2Nlc3MuZW52Jzoge30sIC8vIFNoaW0gcHJvY2Vzcy5lbnZcclxuICB9LFxyXG5cclxuICAvLyAgc2VydmVyOiB7XHJcbiAgLy8gICB3YXRjaDoge1xyXG4gIC8vICAgICBpZ25vcmVkOiBbJyoqL25vZGVfbW9kdWxlcy8qKicsICcqKi8uZ2l0LyoqJ11cclxuICAvLyAgIH0sXHJcbiAgLy8gICAvLyAgaGVhZGVyczoge1xyXG4gIC8vICAgLy8gICAgXCJDcm9zcy1PcmlnaW4tRW1iZWRkZXItUG9saWN5XCI6IFwidW5zYWZlLW5vbmVcIixcclxuICAvLyAgIC8vICAgXCJDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeVwiOiBcInVuc2FmZS1ub25lXCIsXHJcbiAgLy8gICAvLyB9XHJcbiAgLy8gfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGVzYnVpbGRPcHRpb25zOiB7XHJcbiAgICAgIC8vIE5vZGUuanMgZ2xvYmFsIHRvIGJyb3dzZXIgZ2xvYmFsVGhpc1xyXG4gICAgICBkZWZpbmU6IHtcclxuICAgICAgICBnbG9iYWw6IFwiZ2xvYmFsVGhpc1wiLFxyXG4gICAgICAgIC8vICdwcm9jZXNzLmVudic6IHt9LCAvLyBTaGltIHByb2Nlc3MuZW52XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgZ2xvYmFsOiBcImdsb2JhbC10aGlzXCIsXHJcbiAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgLy8gJ0BncmFwZXNqcy9yZWFjdCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvbGliL2dyYXBlc2pzLXJlYWN0LWFkYXB0ZXIuanN4JyksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgbWtjZXJ0KCksXHJcbiAgICBtaWxsaW9uLnZpdGUoeyBhdXRvOiB0cnVlIH0pLFxyXG4gICAgcmVhY3QoKSxcclxuICAgIC8vIE1pbGxpb25MaW50LnZpdGUoe30pLFxyXG4gICAgLy8gdGFpbHdpbmRjc3MoKSxcclxuXHJcbiAgICAvLyByZW1vdmVDb25zb2xlKCksXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcclxuICAgICAgbWluaWZ5OiB0cnVlLFxyXG4gICAgICAvLyBkZXZPcHRpb25zOiB7XHJcbiAgICAgIC8vICAgZW5hYmxlZDogdHJ1ZSwgLy8gRW5hYmxlIFNXIGluIGRldiBtb2RlXHJcbiAgICAgIC8vICAgdHlwZTogXCJtb2R1bGVcIiwgLy8gRXhwbGljaXRseSBzZXQgdGhlIHNlcnZpY2Ugd29ya2VyIHR5cGUgdG8gbW9kdWxlXHJcbiAgICAgIC8vICAgbmF2aWdhdGVGYWxsYmFjazogXCIvXCIsIC8vIEZhbGxiYWNrIGZvciBuYXZpZ2F0aW9uXHJcbiAgICAgIC8vIH0sXHJcblxyXG4gICAgICBzdHJhdGVnaWVzOiBcImdlbmVyYXRlU1dcIixcclxuICAgICAgLy8gaW5qZWN0TWFuaWZlc3Q6IHtcclxuICAgICAgLy8gICByb2xsdXBGb3JtYXQ6IFwiZXNcIixcclxuXHJcbiAgICAgIC8vIH0sXHJcbiAgICAgIC8vIHNyY0RpcjogXCJzcmNcIixcclxuICAgICAgLy8gZmlsZW5hbWU6IFwic3cudHNcIixcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiBcIkluZmluaXRlbHkgU3R1ZGlvXCIsXHJcbiAgICAgICAgZGVzY3JpcHRpb246IFwiSW5maW5pdGVseSBTdHVkaW9cIixcclxuICAgICAgICB0aGVtZV9jb2xvcjogXCIjMWUyOTNiXCIsXHJcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogXCIjMWUyOTNiXCIsXHJcbiAgICAgICAgZGlzcGxheTogXCJzdGFuZGFsb25lXCIsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogXCJJbmZpbml0ZWx5IFN0dWRpb1wiLFxyXG4gICAgICAgIHN0YXJ0X3VybDogXCIvXCIsXHJcbiAgICAgICAgLi4uaWNvbnMsXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbXCIqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Zyx0ZmYsd2VicH1cIl0sXHJcbiAgICAgICAgbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IDEwNDg1NzYwLFxyXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXHJcbiAgICAgICAgICAvLyAgICAgICB7XHJcbiAgICAgICAgICAvLyAgICAgICAgIGhhbmRsZXIoe2V2ZW50ICwgcmVxdWVzdCAsIHVybCAsIHBhcmFtc30pe1xyXG4gICAgICAgICAgLy8gICAgICAgICAgIChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAvLyAgIGNvbnN0IHVybCA9IG5ldyBVUkwoZXZlbnQucmVxdWVzdC51cmwpO1xyXG4gICAgICAgICAgLy8gICBjb25zdCBzcGxpdHRlZFVybCA9IHVybC5wYXRobmFtZS5zcGxpdChcIi9cIik7XHJcbiAgICAgICAgICAvLyAgIGNvbnN0IGZpbGVOYW1lID0gc3BsaXR0ZWRVcmwucG9wKCk7XHJcbiAgICAgICAgICAvLyAgIGxldCBmb2xkZXJQYXRoID0gc3BsaXR0ZWRVcmwuam9pbihcIi9cIik7XHJcbiAgICAgICAgICAvLyAgIGZvbGRlclBhdGggPSBmb2xkZXJQYXRoLnN0YXJ0c1dpdGgoXCIvXCIpID8gZm9sZGVyUGF0aC5yZXBsYWNlKFwiL1wiLCBcIlwiKSA6IGZvbGRlclBhdGg7XHJcbiAgICAgICAgICAvLyAgIGNvbnN0IHByb2plY3RJZCA9IHZhcnNbXCJwcm9qZWN0SWRcIl07XHJcblxyXG4gICAgICAgICAgLy8gICBpZiAoIXByb2plY3RJZCkge1xyXG4gICAgICAgICAgLy8gICAgIHJldHVybiBuZXcgUmVzcG9uc2UobmV3IEJsb2IoW1wiUHJvamVjdCBJRCBub3QgZm91bmRcIl0sIHsgdHlwZTogXCJ0ZXh0L3BsYWluXCIgfSksIHtcclxuICAgICAgICAgIC8vICAgICAgIHN0YXR1czogNDAwLFxyXG4gICAgICAgICAgLy8gICAgIH0pO1xyXG4gICAgICAgICAgLy8gICB9XHJcblxyXG4gICAgICAgICAgLy8gICBjb25zb2xlLmxvZyhgRnJvbSBzdyBwcm9qZWN0IGlkIGlzOiAke3Byb2plY3RJZH1gKTtcclxuXHJcbiAgICAgICAgICAvLyAgIG9wZnNCcm9hZGNhc3RDaGFubmVsLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICAgIC8vICAgICB0eXBlOiBcImdldEZpbGVcIixcclxuICAgICAgICAgIC8vICAgICBmcm9tOiBcInN3XCIsXHJcbiAgICAgICAgICAvLyAgICAgZm9sZGVyUGF0aCxcclxuICAgICAgICAgIC8vICAgICBmaWxlTmFtZSxcclxuICAgICAgICAgIC8vICAgICBwcm9qZWN0SWQsXHJcbiAgICAgICAgICAvLyAgIH0pO1xyXG5cclxuICAgICAgICAgIC8vICAgLyoqXHJcbiAgICAgICAgICAvLyAgICAqIEB0eXBlIHtGaWxlfHVuZGVmaW5lZH1cclxuICAgICAgICAgIC8vICAgICovXHJcbiAgICAgICAgICAvLyAgIGNvbnN0IHJlc3BvbnNlRmlsZSA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgIC8vICAgICAvKipcclxuICAgICAgICAgIC8vICAgICAgKiBAcGFyYW0ge01lc3NhZ2VFdmVudH0gZXZcclxuICAgICAgICAgIC8vICAgICAgKi9cclxuICAgICAgICAgIC8vICAgICBjb25zdCBjYWxsYmFjayA9IChldikgPT4ge1xyXG4gICAgICAgICAgLy8gICAgICAgY29uc29sZS5sb2coXCJmcm9tIHNlcnZpY2Ugd29ya2VyIHNlbmRGaWxlIGJyb2FkY2FzdFwiLCBmb2xkZXJQYXRoLCBmaWxlTmFtZSk7XHJcbiAgICAgICAgICAvLyAgICAgICBjb25zdCB7IHR5cGUsIGZpbGUsIGlzRXhpc2l0IH0gPSBldi5kYXRhO1xyXG5cclxuICAgICAgICAgIC8vICAgICAgIGlmICh0eXBlICE9PSBcInNlbmRGaWxlXCIpIHtcclxuICAgICAgICAgIC8vICAgICAgICAgcmVqZWN0KGBObyBmaWxlIGZvdW5kOiAke2ZpbGV9LCAke2lzRXhpc2l0fWApO1xyXG4gICAgICAgICAgLy8gICAgICAgICBvcGZzQnJvYWRjYXN0Q2hhbm5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAvLyAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIC8vICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyAgICAgICBpZiAoaXNFeGlzaXQgJiYgZmlsZSkge1xyXG4gICAgICAgICAgLy8gICAgICAgICByZXNvbHZlKGZpbGUpO1xyXG4gICAgICAgICAgLy8gICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vICAgICAgICAgcmVqZWN0KGBObyBmaWxlIGZvdW5kOiAke2ZpbGV9LCAke2lzRXhpc2l0fWApO1xyXG4gICAgICAgICAgLy8gICAgICAgfVxyXG4gICAgICAgICAgLy8gICAgICAgb3Bmc0Jyb2FkY2FzdENoYW5uZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgLy8gICAgIH07XHJcblxyXG4gICAgICAgICAgLy8gICAgIG9wZnNCcm9hZGNhc3RDaGFubmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNhbGxiYWNrKTtcclxuICAgICAgICAgIC8vICAgfSk7XHJcblxyXG4gICAgICAgICAgLy8gICBpZiAocmVzcG9uc2VGaWxlKSB7XHJcbiAgICAgICAgICAvLyAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShyZXNwb25zZUZpbGUsIHtcclxuICAgICAgICAgIC8vICAgICAgIHN0YXR1czogMjAwLFxyXG4gICAgICAgICAgLy8gICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgLy8gICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiByZXNwb25zZUZpbGUudHlwZSB8fCBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxyXG4gICAgICAgICAgLy8gICAgICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIipcIiwgLy8gRm9yIGNyb3NzLW9yaWdpbiBpZnJhbWVzXHJcbiAgICAgICAgICAvLyAgICAgICB9LFxyXG4gICAgICAgICAgLy8gICAgIH0pO1xyXG4gICAgICAgICAgLy8gICB9XHJcblxyXG4gICAgICAgICAgLy8gICByZXR1cm4gZmV0Y2goZXZlbnQucmVxdWVzdClcclxuICAgICAgICAgIC8vICAgLy8gcmV0dXJuIG5ldyBSZXNwb25zZShuZXcgQmxvYihbXCI0MDQgbm90IGZvdW5kIVwiXSwgeyB0eXBlOiBcInRleHQvcGxhaW5cIiB9KSwge1xyXG4gICAgICAgICAgLy8gICAvLyAgIHN0YXR1czogNDA0LFxyXG4gICAgICAgICAgLy8gICAvLyB9KTtcclxuICAgICAgICAgIC8vIH0pKClcclxuICAgICAgICAgIC8vICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL1xcLig/OnBuZ3xqcGd8anBlZ3xzdmd8d2VicCkkLywgLy8gQ2FjaGUgaW1hZ2VzIGF0IHJ1bnRpbWVcclxuICAgICAgICAgICAgaGFuZGxlcjogXCJDYWNoZUZpcnN0XCIsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6IFwiaW1hZ2VzXCIsXHJcbiAgICAgICAgICAgICAgLy8gZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgIC8vICAgbWF4RW50cmllczogNTAsXHJcbiAgICAgICAgICAgICAgLy8gICBtYXhBZ2VTZWNvbmRzOiAzMCAqIDI0ICogNjAgKiA2MCwgLy8gMzAgZGF5c1xyXG4gICAgICAgICAgICAgIC8vIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzPy4qLywgLy8gQ2FjaGUgYWxsIEhUVFAvSFRUUFMgcmVxdWVzdHMgKGUuZy4sIEFQSXMpXHJcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiTmV0d29ya0ZpcnN0XCIsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6IFwiYXBpXCIsXHJcbiAgICAgICAgICAgICAgLy8gZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgIC8vICAgbWF4RW50cmllczogMjAsXHJcbiAgICAgICAgICAgICAgLy8gICBtYXhBZ2VTZWNvbmRzOiAyNCAqIDYwICogNjAsIC8vIDEgZGF5XHJcbiAgICAgICAgICAgICAgLy8gfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgICBpbXBvcnRTY3JpcHRzOiBbXCIvZGJBc3NldHMtc3cuanNcIl0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIC8vIGNodW5rU3BsaXRQbHVnaW4oe1xyXG4gICAgLy8gICBzdHJhdGVneTogXCJkZWZhdWx0XCIsXHJcbiAgICAvLyAgIC8vIGN1c3RvbVNwbGl0dGluZzoge1xyXG4gICAgLy8gICAvLyAgIHZlbmRvcjA6IFsvXFxicmVhY3RcXGIvXSxcclxuICAgIC8vICAgLy8gICB2ZW5kb3IxOiBbL1xcYmdyYXBlc2pzXFxiL10sXHJcbiAgICAvLyAgIC8vICAgdmVuZG9yMjogW1xyXG4gICAgLy8gICAvLyAgICAgL1xcQG1vbmFjby1lZGl0b3JcXC9yZWFjdC8sXHJcbiAgICAvLyAgIC8vICAgICAvcmVhY3QtcmVzaXphYmxlLXBhbmVscy8sXHJcbiAgICAvLyAgIC8vICAgICAvcmVhY3QtdmlydHVvc28vLFxyXG4gICAgLy8gICAvLyAgIF0sXHJcbiAgICAvLyAgIC8vICAgdmVuZG9yMzogWy9yZWFjdC1zb3J0YWJsZWpzLywgL2xpbmtlZG9tLywgL2Nzc28vXSxcclxuXHJcbiAgICAvLyAgIC8vICAgdmVuZG9yNDogW1xyXG4gICAgLy8gICAvLyAgICAgL2xvZGFzaC8sXHJcbiAgICAvLyAgIC8vICAgICAvanMtYmVhdXRpZnkvLFxyXG4gICAgLy8gICAvLyAgICAgL2ludGVyYWN0anMvLFxyXG4gICAgLy8gICAvLyAgICAgL3JlYWN0LWVycm9yLWJvdW5kYXJ5LyxcclxuXHJcbiAgICAvLyAgIC8vICAgICAvbWltZS8sXHJcbiAgICAvLyAgIC8vICAgXSxcclxuICAgIC8vICAgLy8gICB2ZW5kb3I1OiBbXHJcbiAgICAvLyAgIC8vICAgICAvcmVhY3Qtc3RpY2t5LWVsLyxcclxuICAgIC8vICAgLy8gICAgIC8vIC9yZWFjdC1zeW50YXgtaGlnaGxpZ2h0ZXIvLFxyXG4gICAgLy8gICAvLyAgICAgL3JlYWN0LXRvYXN0aWZ5LyxcclxuICAgIC8vICAgLy8gICAgIC9yZWFjdC10b29sdGlwLyxcclxuICAgIC8vICAgLy8gICAgIC9yZWFjdC12aXJ0dW9zby8sXHJcbiAgICAvLyAgIC8vICAgICAvcmVjb2lsLyxcclxuICAgIC8vICAgLy8gICAgIC9zZXJpYWxpemUtamF2YXNjcmlwdC8sXHJcbiAgICAvLyAgIC8vICAgXSxcclxuICAgIC8vICAgLy8gICB2ZW5kb3I2OiBbL3JlYWN0LWRvbS8sIC9yZWFjdC1yb3V0ZXItZG9tL10sXHJcbiAgICAvLyAgIC8vICAgdmVuZG9yNzogWy9cXEBncmFwZXNqc1xcL3JlYWN0L10sXHJcbiAgICAvLyAgIC8vICAgdmVuZG9yODogWy9odG1sLXRvLWltYWdlLywgL2xvZGFzaC8sIC9odG1sMmNhbnZhcy1wcm8vXSxcclxuICAgIC8vICAgLy8gICB0eXBlc2NyaXB0OlsvXFxidHlwZXNjcmlwdFxcYi9dLFxyXG4gICAgLy8gICAvLyAgIGljb25zOiBbL0ljb25zXFwuanN4L10sXHJcbiAgICAvLyAgIC8vIH0sXHJcbiAgICAvLyB9KSxcclxuICAgIC8vIG1lcmdlUHJlY2FjaGVJbnRvRGJBc3NldHNTdygpLFxyXG4gIF0sXHJcbiAgd29ya2VyOiB7XHJcbiAgICBmb3JtYXQ6IFwiZXNcIiwgLy8gVXNlICdlcycgaW5zdGVhZCBvZiAnaWlmZSdcclxuICB9LFxyXG5cclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAvLyB0cmVlc2hha2U6ZmFsc2UsXHJcbiAgICAgIGlucHV0OiB7XHJcbiAgICAgICAgbWFpbjogJy4vaW5kZXguaHRtbCcsXHJcbiAgICAgICAgYXBwOiAnLi9hcHAuaHRtbCcsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgdGFyZ2V0OiAnZXMyMDIyJyxcclxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcclxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiBcIjUwMDBcIixcclxuICAgIGFzc2V0c0RpcjogXCJzdGF0aWNcIixcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIGh0dHBzOiB0cnVlXHJcbiAgICB9XHJcbiAgfSxcclxufSk7XHJcblxyXG4iLCAie1xyXG4gIFwiaWNvbnNcIjogW1xyXG4gICAge1xyXG4gICAgICBcInNyY1wiOiBcImljb25zL2FuZHJvaWQvYW5kcm9pZC1sYXVuY2hlcmljb24tMTkyLTE5Mi5wbmdcIixcclxuICAgICAgXCJzaXplc1wiOiBcIjE5MngxOTJcIixcclxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgIFwicHVycG9zZVwiOiBcImFueVwiXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBcInNyY1wiOiBcImljb25zL2FuZHJvaWQvYW5kcm9pZC1sYXVuY2hlcmljb24tNTEyLTUxMi5wbmdcIixcclxuICAgICAgXCJzaXplc1wiOiBcIjUxMng1MTJcIixcclxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgIFwicHVycG9zZVwiOiBcImFueVwiXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBcInNyY1wiOiBcImljb25zL2lvcy8xODAucG5nXCIsXHJcbiAgICAgIFwic2l6ZXNcIjogXCIxODB4MTgwXCIsXHJcbiAgICAgIFwidHlwZVwiOiBcImltYWdlL3BuZ1wiLFxyXG4gICAgICBcInB1cnBvc2VcIjogXCJhbnlcIlxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgXCJzcmNcIjogXCJpY29ucy9pb3MvMTAyNC5wbmdcIixcclxuICAgICAgXCJzaXplc1wiOiBcIjEwMjR4MTAyNFwiLFxyXG4gICAgICBcInR5cGVcIjogXCJpbWFnZS9wbmdcIixcclxuICAgICAgXCJwdXJwb3NlXCI6IFwiYW55IG1hc2thYmxlXCJcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIFwic3JjXCI6IFwiaWNvbnMvYW5kcm9pZC9hbmRyb2lkLWxhdW5jaGVyaWNvbi0xOTItMTkyLnBuZ1wiLFxyXG4gICAgICBcInNpemVzXCI6IFwiMTkyeDE5MlwiLFxyXG4gICAgICBcInR5cGVcIjogXCJpbWFnZS9wbmdcIixcclxuICAgICAgXCJwdXJwb3NlXCI6IFwibWFza2FibGVcIlxyXG4gICAgfVxyXG4gIF1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMsZUFBZTs7O0FDSnhCO0FBQUEsRUFDRSxPQUFTO0FBQUEsSUFDUDtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsT0FBUztBQUFBLE1BQ1QsTUFBUTtBQUFBLE1BQ1IsU0FBVztBQUFBLElBQ2I7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxPQUFTO0FBQUEsTUFDVCxNQUFRO0FBQUEsTUFDUixTQUFXO0FBQUEsSUFDYjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLE9BQVM7QUFBQSxNQUNULE1BQVE7QUFBQSxNQUNSLFNBQVc7QUFBQSxJQUNiO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsT0FBUztBQUFBLE1BQ1QsTUFBUTtBQUFBLE1BQ1IsU0FBVztBQUFBLElBQ2I7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxPQUFTO0FBQUEsTUFDVCxNQUFRO0FBQUEsTUFDUixTQUFXO0FBQUEsSUFDYjtBQUFBLEVBQ0Y7QUFDRjs7O0FEMUJBLFNBQVMsd0JBQXdCO0FBR2pDLE9BQU8sYUFBYTtBQUNwQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxVQUFVO0FBWmpCLElBQU0sbUNBQW1DO0FBY3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxJQUNOLFFBQVE7QUFBQTtBQUFBLEVBRVY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVdBLGNBQWM7QUFBQSxJQUNaLGdCQUFnQjtBQUFBO0FBQUEsTUFFZCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUE7QUFBQSxNQUVWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNQLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQTtBQUFBLElBRXZDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsUUFBUSxLQUFLLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFBQSxJQUMzQixNQUFNO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BT1IsWUFBWTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQU9aLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULFlBQVk7QUFBQSxRQUNaLFdBQVc7QUFBQSxRQUNYLEdBQUc7QUFBQSxNQUNMO0FBQUEsTUFFQSxTQUFTO0FBQUEsUUFDUCxjQUFjLENBQUMseUNBQXlDO0FBQUEsUUFDeEQsK0JBQStCO0FBQUEsUUFDL0IsZ0JBQWdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBd0VkO0FBQUEsWUFDRSxZQUFZO0FBQUE7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBS2I7QUFBQSxVQUNGO0FBQUEsVUFDQTtBQUFBLFlBQ0UsWUFBWTtBQUFBO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsY0FDUCxXQUFXO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUtiO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBLGVBQWUsQ0FBQyxpQkFBaUI7QUFBQSxNQUNuQztBQUFBLElBQ0YsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQXNDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBO0FBQUEsRUFDVjtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBO0FBQUEsTUFFYixPQUFPO0FBQUEsUUFDTCxNQUFNO0FBQUEsUUFDTixLQUFLO0FBQUEsTUFDUDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLHVCQUF1QjtBQUFBLElBQ3ZCLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxNQUNOLE9BQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
