// vite.config.js
import { defineConfig } from "file:///E:/code/Infinitely%20studio/node_modules/vite/dist/node/index.js";
import react from "file:///E:/code/Infinitely%20studio/node_modules/@vitejs/plugin-react/dist/index.mjs";
import removeConsole from "file:///E:/code/Infinitely%20studio/node_modules/vite-plugin-remove-console/dist/index.mjs";
import { VitePWA } from "file:///E:/code/Infinitely%20studio/node_modules/vite-plugin-pwa/dist/index.js";

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
import { chunkSplitPlugin } from "file:///E:/code/Infinitely%20studio/node_modules/vite-plugin-chunk-split/dist/index.mjs";
import million from "file:///E:/code/Infinitely%20studio/node_modules/million/dist/packages/compiler.mjs";
var vite_config_default = defineConfig({
  base: "/",
  define: {
    global: "globalThis"
    // 'process.env': {}, // Shim process.env
  },
  server: {
    watch: {
      ignored: ["**/node_modules/**", "**/.git/**"]
    }
    //  headers: {
    //    "Cross-Origin-Embedder-Policy": "unsafe-none",
    //   "Cross-Origin-Opener-Policy": "unsafe-none",
    // }
  },
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
      global: "global-this"
      // '@grapesjs/react': path.resolve(__dirname, 'src/grapesjs-react-adapter.jsx'),
    }
  },
  plugins: [
    million.vite({ auto: true }),
    react(),
    // MillionLint.vite({}),
    // tailwindcss(),
    removeConsole(),
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
    }),
    chunkSplitPlugin({
      strategy: "default",
      customSplitting: {
        vendor0: [/\breact\b/],
        vendor1: [/\bgrapesjs\b/],
        vendor2: [
          /\@monaco-editor\/react/,
          /react-resizable-panels/,
          /react-virtuoso/
        ],
        vendor3: [/react-sortablejs/, /linkedom/, /csso/, /css/],
        vendor4: [
          /lodash/,
          /js-beautify/,
          /interactjs/,
          /react-error-boundary/,
          /mime/
        ],
        vendor5: [
          /react-sticky-el/,
          // /react-syntax-highlighter/,
          /react-toastify/,
          /react-tooltip/,
          /react-virtuoso/,
          /recoil/,
          /serialize-javascript/
        ],
        vendor6: [/react-dom/, /react-router-dom/],
        vendor7: [/\@grapesjs\/react/],
        vendor8: [/html-to-image/, /lodash/, /html2canvas-pro/],
        typescript: [/\btypescript\b/],
        icons: [/Icons\.jsx/]
      }
    })
    // mergePrecacheIntoDbAssetsSw(),
  ],
  worker: {
    format: "es"
    // Use 'es' instead of 'iife'
  },
  build: {
    rollupOptions: {
      treeshake: true,
      input: {
        main: "./index.html",
        app: "./app.html"
      }
    },
    minify: "esbuild",
    chunkSizeWarningLimit: "5000",
    assetsDir: "static",
    outDir: "dist"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicHVibGljL2ljb25zL2ljb25zLmpzb24iXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxjb2RlXFxcXEluZmluaXRlbHkgc3R1ZGlvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxjb2RlXFxcXEluZmluaXRlbHkgc3R1ZGlvXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9jb2RlL0luZmluaXRlbHklMjBzdHVkaW8vdml0ZS5jb25maWcuanNcIjsvLyB2aXRlLmNvbmZpZy5qc1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcbmltcG9ydCByZW1vdmVDb25zb2xlIGZyb20gXCJ2aXRlLXBsdWdpbi1yZW1vdmUtY29uc29sZVwiO1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSBcInZpdGUtcGx1Z2luLXB3YVwiO1xyXG5pbXBvcnQgaWNvbnMgZnJvbSBcIi4vcHVibGljL2ljb25zL2ljb25zLmpzb25cIjtcclxuLy8gaW1wb3J0IHsgbWFudWFsQ2h1bmtzUGx1Z2luIH0gZnJvbSBcInZpdGUtcGx1Z2luLXdlYnBhY2tjaHVua25hbWVcIjtcclxuaW1wb3J0IHsgY2h1bmtTcGxpdFBsdWdpbiB9IGZyb20gXCJ2aXRlLXBsdWdpbi1jaHVuay1zcGxpdFwiO1xyXG4vLyBpbXBvcnQgTWlsbGlvbkxpbnQgZnJvbSBcIkBtaWxsaW9uL2xpbnRcIjtcclxuLy8gaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xyXG5pbXBvcnQgbWlsbGlvbiBmcm9tICdtaWxsaW9uL2NvbXBpbGVyJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTonLycsXHJcbiAgZGVmaW5lOiB7XHJcbiAgICBnbG9iYWw6IFwiZ2xvYmFsVGhpc1wiLFxyXG4gICAgLy8gJ3Byb2Nlc3MuZW52Jzoge30sIC8vIFNoaW0gcHJvY2Vzcy5lbnZcclxuICB9LFxyXG4gICBzZXJ2ZXI6IHtcclxuICAgIHdhdGNoOiB7XHJcbiAgICAgIGlnbm9yZWQ6IFsnKiovbm9kZV9tb2R1bGVzLyoqJywgJyoqLy5naXQvKionXVxyXG4gICAgfSxcclxuICAgIC8vICBoZWFkZXJzOiB7XHJcbiAgICAvLyAgICBcIkNyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3lcIjogXCJ1bnNhZmUtbm9uZVwiLFxyXG4gICAgLy8gICBcIkNyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5XCI6IFwidW5zYWZlLW5vbmVcIixcclxuICAgIC8vIH1cclxuICB9LFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgLy8gTm9kZS5qcyBnbG9iYWwgdG8gYnJvd3NlciBnbG9iYWxUaGlzXHJcbiAgICAgIGRlZmluZToge1xyXG4gICAgICAgIGdsb2JhbDogXCJnbG9iYWxUaGlzXCIsXHJcbiAgICAgICAgLy8gJ3Byb2Nlc3MuZW52Jzoge30sIC8vIFNoaW0gcHJvY2Vzcy5lbnZcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBnbG9iYWw6IFwiZ2xvYmFsLXRoaXNcIixcclxuICAgICAgLy8gJ0BncmFwZXNqcy9yZWFjdCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvZ3JhcGVzanMtcmVhY3QtYWRhcHRlci5qc3gnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICBtaWxsaW9uLnZpdGUoe2F1dG86dHJ1ZSB9KSxcclxuICAgIHJlYWN0KCksXHJcbiAgICAvLyBNaWxsaW9uTGludC52aXRlKHt9KSxcclxuICAgIC8vIHRhaWx3aW5kY3NzKCksXHJcblxyXG4gICAgcmVtb3ZlQ29uc29sZSgpLFxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXHJcbiAgICAgIG1pbmlmeTogdHJ1ZSxcclxuICAgICAgLy8gZGV2T3B0aW9uczoge1xyXG4gICAgICAvLyAgIGVuYWJsZWQ6IHRydWUsIC8vIEVuYWJsZSBTVyBpbiBkZXYgbW9kZVxyXG4gICAgICAvLyAgIHR5cGU6IFwibW9kdWxlXCIsIC8vIEV4cGxpY2l0bHkgc2V0IHRoZSBzZXJ2aWNlIHdvcmtlciB0eXBlIHRvIG1vZHVsZVxyXG4gICAgICAvLyAgIG5hdmlnYXRlRmFsbGJhY2s6IFwiL1wiLCAvLyBGYWxsYmFjayBmb3IgbmF2aWdhdGlvblxyXG4gICAgICAvLyB9LFxyXG5cclxuICAgICAgc3RyYXRlZ2llczogXCJnZW5lcmF0ZVNXXCIsXHJcbiAgICAgIC8vIGluamVjdE1hbmlmZXN0OiB7XHJcbiAgICAgIC8vICAgcm9sbHVwRm9ybWF0OiBcImVzXCIsXHJcblxyXG4gICAgICAvLyB9LFxyXG4gICAgICAvLyBzcmNEaXI6IFwic3JjXCIsXHJcbiAgICAgIC8vIGZpbGVuYW1lOiBcInN3LnRzXCIsXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogXCJJbmZpbml0ZWx5IFN0dWRpb1wiLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkluZmluaXRlbHkgU3R1ZGlvXCIsXHJcbiAgICAgICAgdGhlbWVfY29sb3I6IFwiIzFlMjkzYlwiLFxyXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6IFwiIzFlMjkzYlwiLFxyXG4gICAgICAgIGRpc3BsYXk6IFwic3RhbmRhbG9uZVwiLFxyXG4gICAgICAgIHNob3J0X25hbWU6IFwiSW5maW5pdGVseSBTdHVkaW9cIixcclxuICAgICAgICBzdGFydF91cmw6IFwiL1wiLFxyXG4gICAgICAgIC4uLmljb25zLFxyXG4gICAgICB9LFxyXG5cclxuICAgICAgd29ya2JveDoge1xyXG4gICAgICAgIGdsb2JQYXR0ZXJuczogW1wiKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsdGZmLHdlYnB9XCJdLFxyXG4gICAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOjEwNDg1NzYwLFxyXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIGhhbmRsZXIoe2V2ZW50ICwgcmVxdWVzdCAsIHVybCAsIHBhcmFtc30pe1xyXG4gICAgLy8gICAgICAgICAgIChhc3luYyAoKSA9PiB7XHJcbiAgICAvLyAgIGNvbnN0IHVybCA9IG5ldyBVUkwoZXZlbnQucmVxdWVzdC51cmwpO1xyXG4gICAgLy8gICBjb25zdCBzcGxpdHRlZFVybCA9IHVybC5wYXRobmFtZS5zcGxpdChcIi9cIik7XHJcbiAgICAvLyAgIGNvbnN0IGZpbGVOYW1lID0gc3BsaXR0ZWRVcmwucG9wKCk7XHJcbiAgICAvLyAgIGxldCBmb2xkZXJQYXRoID0gc3BsaXR0ZWRVcmwuam9pbihcIi9cIik7XHJcbiAgICAvLyAgIGZvbGRlclBhdGggPSBmb2xkZXJQYXRoLnN0YXJ0c1dpdGgoXCIvXCIpID8gZm9sZGVyUGF0aC5yZXBsYWNlKFwiL1wiLCBcIlwiKSA6IGZvbGRlclBhdGg7XHJcbiAgICAvLyAgIGNvbnN0IHByb2plY3RJZCA9IHZhcnNbXCJwcm9qZWN0SWRcIl07XHJcblxyXG4gICAgLy8gICBpZiAoIXByb2plY3RJZCkge1xyXG4gICAgLy8gICAgIHJldHVybiBuZXcgUmVzcG9uc2UobmV3IEJsb2IoW1wiUHJvamVjdCBJRCBub3QgZm91bmRcIl0sIHsgdHlwZTogXCJ0ZXh0L3BsYWluXCIgfSksIHtcclxuICAgIC8vICAgICAgIHN0YXR1czogNDAwLFxyXG4gICAgLy8gICAgIH0pO1xyXG4gICAgLy8gICB9XHJcblxyXG4gICAgLy8gICBjb25zb2xlLmxvZyhgRnJvbSBzdyBwcm9qZWN0IGlkIGlzOiAke3Byb2plY3RJZH1gKTtcclxuXHJcbiAgICAvLyAgIG9wZnNCcm9hZGNhc3RDaGFubmVsLnBvc3RNZXNzYWdlKHtcclxuICAgIC8vICAgICB0eXBlOiBcImdldEZpbGVcIixcclxuICAgIC8vICAgICBmcm9tOiBcInN3XCIsXHJcbiAgICAvLyAgICAgZm9sZGVyUGF0aCxcclxuICAgIC8vICAgICBmaWxlTmFtZSxcclxuICAgIC8vICAgICBwcm9qZWN0SWQsXHJcbiAgICAvLyAgIH0pO1xyXG5cclxuICAgIC8vICAgLyoqXHJcbiAgICAvLyAgICAqIEB0eXBlIHtGaWxlfHVuZGVmaW5lZH1cclxuICAgIC8vICAgICovXHJcbiAgICAvLyAgIGNvbnN0IHJlc3BvbnNlRmlsZSA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIC8vICAgICAvKipcclxuICAgIC8vICAgICAgKiBAcGFyYW0ge01lc3NhZ2VFdmVudH0gZXZcclxuICAgIC8vICAgICAgKi9cclxuICAgIC8vICAgICBjb25zdCBjYWxsYmFjayA9IChldikgPT4ge1xyXG4gICAgLy8gICAgICAgY29uc29sZS5sb2coXCJmcm9tIHNlcnZpY2Ugd29ya2VyIHNlbmRGaWxlIGJyb2FkY2FzdFwiLCBmb2xkZXJQYXRoLCBmaWxlTmFtZSk7XHJcbiAgICAvLyAgICAgICBjb25zdCB7IHR5cGUsIGZpbGUsIGlzRXhpc2l0IH0gPSBldi5kYXRhO1xyXG5cclxuICAgIC8vICAgICAgIGlmICh0eXBlICE9PSBcInNlbmRGaWxlXCIpIHtcclxuICAgIC8vICAgICAgICAgcmVqZWN0KGBObyBmaWxlIGZvdW5kOiAke2ZpbGV9LCAke2lzRXhpc2l0fWApO1xyXG4gICAgLy8gICAgICAgICBvcGZzQnJvYWRjYXN0Q2hhbm5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBjYWxsYmFjayk7XHJcbiAgICAvLyAgICAgICAgIHJldHVybjtcclxuICAgIC8vICAgICAgIH1cclxuXHJcbiAgICAvLyAgICAgICBpZiAoaXNFeGlzaXQgJiYgZmlsZSkge1xyXG4gICAgLy8gICAgICAgICByZXNvbHZlKGZpbGUpO1xyXG4gICAgLy8gICAgICAgfSBlbHNlIHtcclxuICAgIC8vICAgICAgICAgcmVqZWN0KGBObyBmaWxlIGZvdW5kOiAke2ZpbGV9LCAke2lzRXhpc2l0fWApO1xyXG4gICAgLy8gICAgICAgfVxyXG4gICAgLy8gICAgICAgb3Bmc0Jyb2FkY2FzdENoYW5uZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgY2FsbGJhY2spO1xyXG4gICAgLy8gICAgIH07XHJcblxyXG4gICAgLy8gICAgIG9wZnNCcm9hZGNhc3RDaGFubmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNhbGxiYWNrKTtcclxuICAgIC8vICAgfSk7XHJcblxyXG4gICAgLy8gICBpZiAocmVzcG9uc2VGaWxlKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShyZXNwb25zZUZpbGUsIHtcclxuICAgIC8vICAgICAgIHN0YXR1czogMjAwLFxyXG4gICAgLy8gICAgICAgaGVhZGVyczoge1xyXG4gICAgLy8gICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiByZXNwb25zZUZpbGUudHlwZSB8fCBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxyXG4gICAgLy8gICAgICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIipcIiwgLy8gRm9yIGNyb3NzLW9yaWdpbiBpZnJhbWVzXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgIH0pO1xyXG4gICAgLy8gICB9XHJcblxyXG4gICAgLy8gICByZXR1cm4gZmV0Y2goZXZlbnQucmVxdWVzdClcclxuICAgIC8vICAgLy8gcmV0dXJuIG5ldyBSZXNwb25zZShuZXcgQmxvYihbXCI0MDQgbm90IGZvdW5kIVwiXSwgeyB0eXBlOiBcInRleHQvcGxhaW5cIiB9KSwge1xyXG4gICAgLy8gICAvLyAgIHN0YXR1czogNDA0LFxyXG4gICAgLy8gICAvLyB9KTtcclxuICAgIC8vIH0pKClcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL1xcLig/OnBuZ3xqcGd8anBlZ3xzdmd8d2VicCkkLywgLy8gQ2FjaGUgaW1hZ2VzIGF0IHJ1bnRpbWVcclxuICAgICAgICAgICAgaGFuZGxlcjogXCJDYWNoZUZpcnN0XCIsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6IFwiaW1hZ2VzXCIsXHJcbiAgICAgICAgICAgICAgLy8gZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgIC8vICAgbWF4RW50cmllczogNTAsXHJcbiAgICAgICAgICAgICAgLy8gICBtYXhBZ2VTZWNvbmRzOiAzMCAqIDI0ICogNjAgKiA2MCwgLy8gMzAgZGF5c1xyXG4gICAgICAgICAgICAgIC8vIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzPy4qLywgLy8gQ2FjaGUgYWxsIEhUVFAvSFRUUFMgcmVxdWVzdHMgKGUuZy4sIEFQSXMpXHJcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiTmV0d29ya0ZpcnN0XCIsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6IFwiYXBpXCIsXHJcbiAgICAgICAgICAgICAgLy8gZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgIC8vICAgbWF4RW50cmllczogMjAsXHJcbiAgICAgICAgICAgICAgLy8gICBtYXhBZ2VTZWNvbmRzOiAyNCAqIDYwICogNjAsIC8vIDEgZGF5XHJcbiAgICAgICAgICAgICAgLy8gfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgICBpbXBvcnRTY3JpcHRzOiBbXCIvZGJBc3NldHMtc3cuanNcIl0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIGNodW5rU3BsaXRQbHVnaW4oe1xyXG4gICAgICBzdHJhdGVneTogXCJkZWZhdWx0XCIsXHJcbiAgICAgIGN1c3RvbVNwbGl0dGluZzoge1xyXG4gICAgICAgIHZlbmRvcjA6IFsvXFxicmVhY3RcXGIvXSxcclxuICAgICAgICB2ZW5kb3IxOiBbL1xcYmdyYXBlc2pzXFxiL10sXHJcbiAgICAgICAgdmVuZG9yMjogW1xyXG4gICAgICAgICAgL1xcQG1vbmFjby1lZGl0b3JcXC9yZWFjdC8sXHJcbiAgICAgICAgICAvcmVhY3QtcmVzaXphYmxlLXBhbmVscy8sXHJcbiAgICAgICAgICAvcmVhY3QtdmlydHVvc28vLFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgdmVuZG9yMzogWy9yZWFjdC1zb3J0YWJsZWpzLywgL2xpbmtlZG9tLywgL2Nzc28vLCAvY3NzL10sXHJcbiAgICAgICAgdmVuZG9yNDogW1xyXG4gICAgICAgICAgL2xvZGFzaC8sXHJcbiAgICAgICAgICAvanMtYmVhdXRpZnkvLFxyXG4gICAgICAgICAgL2ludGVyYWN0anMvLFxyXG4gICAgICAgICAgL3JlYWN0LWVycm9yLWJvdW5kYXJ5LyxcclxuXHJcbiAgICAgICAgICAvbWltZS8sXHJcbiAgICAgICAgXSxcclxuICAgICAgICB2ZW5kb3I1OiBbXHJcbiAgICAgICAgICAvcmVhY3Qtc3RpY2t5LWVsLyxcclxuICAgICAgICAgIC8vIC9yZWFjdC1zeW50YXgtaGlnaGxpZ2h0ZXIvLFxyXG4gICAgICAgICAgL3JlYWN0LXRvYXN0aWZ5LyxcclxuICAgICAgICAgIC9yZWFjdC10b29sdGlwLyxcclxuICAgICAgICAgIC9yZWFjdC12aXJ0dW9zby8sXHJcbiAgICAgICAgICAvcmVjb2lsLyxcclxuICAgICAgICAgIC9zZXJpYWxpemUtamF2YXNjcmlwdC8sXHJcbiAgICAgICAgXSxcclxuICAgICAgICB2ZW5kb3I2OiBbL3JlYWN0LWRvbS8sIC9yZWFjdC1yb3V0ZXItZG9tL10sXHJcbiAgICAgICAgdmVuZG9yNzogWy9cXEBncmFwZXNqc1xcL3JlYWN0L10sXHJcbiAgICAgICAgdmVuZG9yODogWy9odG1sLXRvLWltYWdlLywgL2xvZGFzaC8sIC9odG1sMmNhbnZhcy1wcm8vXSxcclxuICAgICAgICB0eXBlc2NyaXB0OlsvXFxidHlwZXNjcmlwdFxcYi9dLFxyXG4gICAgICAgIGljb25zOiBbL0ljb25zXFwuanN4L10sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIC8vIG1lcmdlUHJlY2FjaGVJbnRvRGJBc3NldHNTdygpLFxyXG4gIF0sXHJcbiAgd29ya2VyOiB7XHJcbiAgICBmb3JtYXQ6IFwiZXNcIiwgLy8gVXNlICdlcycgaW5zdGVhZCBvZiAnaWlmZSdcclxuICB9LFxyXG5cclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczp7XHJcbiAgICAgIHRyZWVzaGFrZTp0cnVlLFxyXG4gICAgICBpbnB1dDoge1xyXG4gICAgICAgIG1haW46ICcuL2luZGV4Lmh0bWwnLFxyXG4gICAgICAgIGFwcDogJy4vYXBwLmh0bWwnLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIG1pbmlmeTonZXNidWlsZCcsXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IFwiNTAwMFwiLFxyXG4gICAgYXNzZXRzRGlyOiBcInN0YXRpY1wiLFxyXG4gICAgb3V0RGlyOidkaXN0JyxcclxuICB9LFxyXG59KTtcclxuXHJcbiIsICJ7XHJcbiAgXCJpY29uc1wiOiBbXHJcbiAgICB7XHJcbiAgICAgIFwic3JjXCI6IFwiaWNvbnMvYW5kcm9pZC9hbmRyb2lkLWxhdW5jaGVyaWNvbi0xOTItMTkyLnBuZ1wiLFxyXG4gICAgICBcInNpemVzXCI6IFwiMTkyeDE5MlwiLFxyXG4gICAgICBcInR5cGVcIjogXCJpbWFnZS9wbmdcIixcclxuICAgICAgXCJwdXJwb3NlXCI6IFwiYW55XCJcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIFwic3JjXCI6IFwiaWNvbnMvYW5kcm9pZC9hbmRyb2lkLWxhdW5jaGVyaWNvbi01MTItNTEyLnBuZ1wiLFxyXG4gICAgICBcInNpemVzXCI6IFwiNTEyeDUxMlwiLFxyXG4gICAgICBcInR5cGVcIjogXCJpbWFnZS9wbmdcIixcclxuICAgICAgXCJwdXJwb3NlXCI6IFwiYW55XCJcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIFwic3JjXCI6IFwiaWNvbnMvaW9zLzE4MC5wbmdcIixcclxuICAgICAgXCJzaXplc1wiOiBcIjE4MHgxODBcIixcclxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgIFwicHVycG9zZVwiOiBcImFueVwiXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBcInNyY1wiOiBcImljb25zL2lvcy8xMDI0LnBuZ1wiLFxyXG4gICAgICBcInNpemVzXCI6IFwiMTAyNHgxMDI0XCIsXHJcbiAgICAgIFwidHlwZVwiOiBcImltYWdlL3BuZ1wiLFxyXG4gICAgICBcInB1cnBvc2VcIjogXCJhbnkgbWFza2FibGVcIlxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgXCJzcmNcIjogXCJpY29ucy9hbmRyb2lkL2FuZHJvaWQtbGF1bmNoZXJpY29uLTE5Mi0xOTIucG5nXCIsXHJcbiAgICAgIFwic2l6ZXNcIjogXCIxOTJ4MTkyXCIsXHJcbiAgICAgIFwidHlwZVwiOiBcImltYWdlL3BuZ1wiLFxyXG4gICAgICBcInB1cnBvc2VcIjogXCJtYXNrYWJsZVwiXHJcbiAgICB9XHJcbiAgXVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxtQkFBbUI7QUFDMUIsU0FBUyxlQUFlOzs7QUNKeEI7QUFBQSxFQUNFLE9BQVM7QUFBQSxJQUNQO0FB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
