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
        maximumFileSizeToCacheInBytes:`10485760`,
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
        icons: [/Icons\.jsx/],
      },
    }),
    // mergePrecacheIntoDbAssetsSw(),
  ],
  worker: {
    format: "es", // Use 'es' instead of 'iife'
  },

  build: {
    chunkSizeWarningLimit: "5000",
    assetsDir: "static",
    outDir:'dist',
  },
});

// {
//       registerType: "autoUpdate",
//       minify: true,
//       // devOptions: {
//       //   enabled: true, // Enable SW in dev mode
//       //   type: "classic", // Use module type for SW
//       //   navigateFallback: "/", // Fallback for navigation
//       // },
//       strategies: "generateSW",

// workbox: {
//   globPatterns: ["**/*.{js,css,html,ico,png,svg,tff,webp}"],
//   runtimeCaching: [
//     // {
//     //   urlPattern: ({ url }) => {
//     //     const matches = ['/assets/', '/fonts/', '/libs/' , '/pages/', '/global/', '/local/'].some((path) =>
//     //       url.pathname.includes(path)
//     //     );
//     //     return matches;
//     //   },
//     //   handler: ({ url, request, event }) => {
//     //     const params = url.searchParams;
//     //     url.search;
//     //     // console.log("from db sw : ", url, url.origin);

//     //     // Handle /keep-alive first
//     //     if (url.pathname.includes("/keep-alive")) {
//     //       event.respondWith(
//     //         new Response(new Blob(["ok"], { type: "text/plain" }))
//     //       );
//     //       return;
//     //     }
//     //     // console.log(`fetch from db assets url : ${url.pathname} ,rororor`);
//     //     (async () => {
//     //       const splittedUrl = url.pathname.split("/");
//     //       const fileName = new URL(event.request.url).pathname
//     //         .split("/")
//     //         .pop();
//     //         console.log("from db sw : ", fileName, url.pathname, url.href);

//     //       const projectId = vars["projectId"];
//     //       let fileNameFromAssets = "";
//     //       if (projectId) {
//     //         /**
//     //          * @type {import('../src/helpers/types').Project}
//     //          */
//     //         const projectData = vars["projectData"];
//     //         /**
//     //          * @type {import('../src/helpers/types').InfinitelyAsset[] }
//     //          */
//     //         const assets = projectData.assets;
//     //         /**
//     //          * @type {import('../src/helpers/types').InfinitelyAsset }
//     //          */
//     //         if (
//     //           splittedUrl.lastIndexOf("assets") != -1 ||
//     //           splittedUrl.lastIndexOf("fonts") != -1
//     //         ) {
//     //           const fileFromDB = assets
//     //             .concat(Object.values(projectData.fonts || {}))
//     //             .find((asset) => {
//     //               const assetUrl = new URL(
//     //                 `/assets/${asset.file.name}`,
//     //                 url.origin
//     //               ).pathname
//     //                 .split("/")
//     //                 .pop();

//     //               // console.log("sw file data:", encodeURI(asset.file.name), fileName, encodeURI(asset.file.name) == fileName );
//     //               // console.log("sw file 2:", asset.file.name , fileName , encodeURIComponent(asset.file.name) == fileName );
//     //               // console.log("sw file data sd:", assetUrl, fileName, assetUrl == fileName );

//     //               if (!asset?.isCDN && assetUrl == fileName) {
//     //                 fileNameFromAssets = assetUrl;
//     //               }
//     //               return !asset?.isCDN && assetUrl == fileName;
//     //             });

//     //           console.log(
//     //             `got it from ${
//     //               splittedUrl.lastIndexOf("fonts") != -1 && "fonts"
//     //             } ${splittedUrl.lastIndexOf("assets") != -1 && "assets"}`
//     //           );

//     //           if (fileFromDB) {
//     //             // console.log("sw file:", fileFromDB.file.name);
//     //             event.respondWith(
//     //               new Response(fileFromDB.file, {
//     //                 status: 200,
//     //                 headers: {
//     //                   "Content-Type":
//     //                     fileFromDB.file.type ||
//     //                     "application/octet-stream",
//     //                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//     //                 },
//     //               })
//     //             );
//     //           }
//     //         } else if (splittedUrl.lastIndexOf("libs") != -1) {
//     //           /**
//     //            *
//     //            * @param {keyof import('../src/helpers/types').Project} key
//     //            */
//     //           const handleLib = (key) => {
//     //             const file = projectData[key].find(
//     //               (lib) =>
//     //                 new URL(lib.file.name, self.origin).pathname
//     //                   .split("/")
//     //                   .pop() == fileName
//     //             );
//     //             if (!file) return;
//     //             event.respondWith(
//     //               new Response(file.file, {
//     //                 status: 200,
//     //                 headers: {
//     //                   "Content-Type": file.file.type,
//     //                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//     //                 },
//     //               })
//     //             );
//     //           };
//     //           if (url.href.includes("libs/js")) {
//     //             if (url.href.includes("libs/js/header")) {
//     //               handleLib("jsHeaderLibs");
//     //             } else if (url.href.includes("libs/js/footer")) {
//     //               handleLib("jsFooterLibs");
//     //             }
//     //           } else if (url.href.includes("libs/css")) {
//     //             handleLib("cssLibs");
//     //           } else {
//     //             console.error(`From sw : no libs founded`);
//     //           }
//     //         } else if (
//     //           splittedUrl.includes("pages") ||
//     //           fileName.includes("index.html")
//     //         ) {
//     //           // const pageName = fileName.replace(".html", "");
//     //           /**
//     //            * @type {{[key:string]:Blob}}
//     //            */
//     //           const previewPages = vars.previewPages;
//     //           if (!previewPages) {
//     //             console.error("No Preview Pages Founded..");

//     //             event.respondWith(
//     //               new Response(
//     //                 new Blob([`<h1>404 Page Not Founded</h1>`], {
//     //                   type: "text/html",
//     //                 }),
//     //                 {
//     //                   status: 200,
//     //                   headers: {
//     //                     "Content-Type": `text/html`,
//     //                     "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//     //                   },
//     //                 }
//     //               )
//     //             );
//     //             return;
//     //           }
//     //           const previewPage = previewPages[fileName || ""];
//     //           console.log(
//     //             "file page name : ",
//     //             event.request.url,
//     //             url.pathname,
//     //             splittedUrl,
//     //             fileName,
//     //             previewPage
//     //           );

//     //           if (previewPage) {
//     //             event.respondWith(
//     //               new Response(previewPage, {
//     //                 status: 200,
//     //                 headers: {
//     //                   "Content-Type": `text/html`,
//     //                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//     //                 },
//     //               })
//     //             );
//     //           } else {
//     //             event.respondWith(
//     //               new Response(
//     //                 new Blob([`<h1>404 Page Not Founded</h1>`], {
//     //                   type: "text/html",
//     //                 }),
//     //                 {
//     //                   status: 200,
//     //                   headers: {
//     //                     "Content-Type": `text/html`,
//     //                     "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//     //                   },
//     //                 }
//     //               )
//     //             );
//     //           }
//     //         } else if (splittedUrl.lastIndexOf("global") != -1) {
//     //           if (fileName == parseTextToURI("global.js").pop()) {
//     //             event.respondWith(
//     //               new Response(projectData.globalJs, {
//     //                 status: 200,
//     //                 headers: {
//     //                   "Content-Type": projectData.globalJs.type,
//     //                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//     //                 },
//     //               })
//     //             );
//     //           } else if (fileName == parseTextToURI("global.css").pop()) {
//     //             event.respondWith(
//     //               new Response(projectData.globalCss, {
//     //                 status: 200,
//     //                 headers: {
//     //                   "Content-Type": projectData.globalCss.type,
//     //                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//     //                 },
//     //               })
//     //             );
//     //           } else {
//     //             console.error(
//     //               `From sw : global not founded `,
//     //               fileName,
//     //               parseTextToURI("global.css").pop()
//     //             );
//     //           }
//     //         } else if (splittedUrl.lastIndexOf("local") != -1) {
//     //           const pageName = params.get("page");
//     //           if (!pageName) {
//     //             console.error(`From sw : No page name founded...!`);
//     //             return;
//     //           }
//     //           const handleLocalEntry = (key) => {
//     //             event.respondWith(
//     //               new Response(projectData.pages[pageName][key], {
//     //                 status: 200,
//     //                 headers: {
//     //                   "Content-Type":
//     //                     projectData.pages[pageName][key].type,
//     //                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//     //                 },
//     //               })
//     //             );
//     //           };
//     //           if (fileName == "local.js") {
//     //             handleLocalEntry("js");
//     //           } else if (fileName == "local.css") {
//     //             handleLocalEntry("css");
//     //           }
//     //         }
//     //       }
//     //     })();
//     //   },
//     // },
// {
//   urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/, // Cache images at runtime
//   handler: "CacheFirst",
//   options: {
//     cacheName: "images",
//     // expiration: {
//     //   maxEntries: 50,
//     //   maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
//     // },
//   },
// },
// {
//   urlPattern: /^https?.*/, // Cache all HTTP/HTTPS requests (e.g., APIs)
//   handler: "NetworkFirst",
//   options: {
//     cacheName: "api",
//     // expiration: {
//     //   maxEntries: 20,
//     //   maxAgeSeconds: 24 * 60 * 60, // 1 day
//     // },
//   },
// },
//         ],
//         // importScripts: ["custom-sw.js"],
//         importScripts: ["/dbAssets-sw.js"],
//       },
//       manifest: {
//         name: "Infinitely Studio",
//         description: "Infinitely Studio",
//         theme_color: "#1e293b",
//         background_color: "#1e293b",
//         display: "standalone",
//         short_name: "Infinitely",
//         start_url: "/",
//         ...icons,
//       },
//       // srcDir: "src",
//       // filename: "custom-sw.js", // Source file for custom SW
//       // injectManifest: {
//       //   injectionPoint: undefined, // Let VitePWA handle injection
//       // },
//     }

// {
//   urlPattern: ({ url }) => {
//     const matches = ['/assets/', '/fonts/', '/libs/' , '/pages/', '/global/', '/local/'].some((path) =>
//       url.pathname.includes(path)
//     );
//     return matches;
//   },
//   handler: ({ url, request, event }) => {
//     const params = url.searchParams;
//     url.search;
//     // console.log("from db sw : ", url, url.origin);

//     // Handle /keep-alive first
//     if (url.pathname.includes("/keep-alive")) {
//       event.respondWith(
//         new Response(new Blob(["ok"], { type: "text/plain" }))
//       );
//       return;
//     }
//     // console.log(`fetch from db assets url : ${url.pathname} ,rororor`);
//     (async () => {
//       const splittedUrl = url.pathname.split("/");
//       const fileName = new URL(event.request.url).pathname
//         .split("/")
//         .pop();
//         console.log("from db sw : ", fileName, url.pathname, url.href);

//       const projectId = vars["projectId"];
//       let fileNameFromAssets = "";
//       if (projectId) {
//         /**
//          * @type {import('../src/helpers/types').Project}
//          */
//         const projectData = vars["projectData"];
//         /**
//          * @type {import('../src/helpers/types').InfinitelyAsset[] }
//          */
//         const assets = projectData.assets;
//         /**
//          * @type {import('../src/helpers/types').InfinitelyAsset }
//          */
//         if (
//           splittedUrl.lastIndexOf("assets") != -1 ||
//           splittedUrl.lastIndexOf("fonts") != -1
//         ) {
//           const fileFromDB = assets
//             .concat(Object.values(projectData.fonts || {}))
//             .find((asset) => {
//               const assetUrl = new URL(
//                 `/assets/${asset.file.name}`,
//                 url.origin
//               ).pathname
//                 .split("/")
//                 .pop();

//               // console.log("sw file data:", encodeURI(asset.file.name), fileName, encodeURI(asset.file.name) == fileName );
//               // console.log("sw file 2:", asset.file.name , fileName , encodeURIComponent(asset.file.name) == fileName );
//               // console.log("sw file data sd:", assetUrl, fileName, assetUrl == fileName );

//               if (!asset?.isCDN && assetUrl == fileName) {
//                 fileNameFromAssets = assetUrl;
//               }
//               return !asset?.isCDN && assetUrl == fileName;
//             });

//           console.log(
//             `got it from ${
//               splittedUrl.lastIndexOf("fonts") != -1 && "fonts"
//             } ${splittedUrl.lastIndexOf("assets") != -1 && "assets"}`
//           );

//           if (fileFromDB) {
//             // console.log("sw file:", fileFromDB.file.name);
//             event.respondWith(
//               new Response(fileFromDB.file, {
//                 status: 200,
//                 headers: {
//                   "Content-Type":
//                     fileFromDB.file.type ||
//                     "application/octet-stream",
//                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//                 },
//               })
//             );
//           }
//         } else if (splittedUrl.lastIndexOf("libs") != -1) {
//           /**
//            *
//            * @param {keyof import('../src/helpers/types').Project} key
//            */
//           const handleLib = (key) => {
//             const file = projectData[key].find(
//               (lib) =>
//                 new URL(lib.file.name, self.origin).pathname
//                   .split("/")
//                   .pop() == fileName
//             );
//             if (!file) return;
//             event.respondWith(
//               new Response(file.file, {
//                 status: 200,
//                 headers: {
//                   "Content-Type": file.file.type,
//                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//                 },
//               })
//             );
//           };
//           if (url.href.includes("libs/js")) {
//             if (url.href.includes("libs/js/header")) {
//               handleLib("jsHeaderLibs");
//             } else if (url.href.includes("libs/js/footer")) {
//               handleLib("jsFooterLibs");
//             }
//           } else if (url.href.includes("libs/css")) {
//             handleLib("cssLibs");
//           } else {
//             console.error(`From sw : no libs founded`);
//           }
//         } else if (
//           splittedUrl.includes("pages") ||
//           fileName.includes("index.html")
//         ) {
//           // const pageName = fileName.replace(".html", "");
//           /**
//            * @type {{[key:string]:Blob}}
//            */
//           const previewPages = vars.previewPages;
//           if (!previewPages) {
//             console.error("No Preview Pages Founded..");

//             event.respondWith(
//               new Response(
//                 new Blob([`<h1>404 Page Not Founded</h1>`], {
//                   type: "text/html",
//                 }),
//                 {
//                   status: 200,
//                   headers: {
//                     "Content-Type": `text/html`,
//                     "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//                   },
//                 }
//               )
//             );
//             return;
//           }
//           const previewPage = previewPages[fileName || ""];
//           console.log(
//             "file page name : ",
//             event.request.url,
//             url.pathname,
//             splittedUrl,
//             fileName,
//             previewPage
//           );

//           if (previewPage) {
//             event.respondWith(
//               new Response(previewPage, {
//                 status: 200,
//                 headers: {
//                   "Content-Type": `text/html`,
//                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//                 },
//               })
//             );
//           } else {
//             event.respondWith(
//               new Response(
//                 new Blob([`<h1>404 Page Not Founded</h1>`], {
//                   type: "text/html",
//                 }),
//                 {
//                   status: 200,
//                   headers: {
//                     "Content-Type": `text/html`,
//                     "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//                   },
//                 }
//               )
//             );
//           }
//         } else if (splittedUrl.lastIndexOf("global") != -1) {
//           if (fileName == parseTextToURI("global.js").pop()) {
//             event.respondWith(
//               new Response(projectData.globalJs, {
//                 status: 200,
//                 headers: {
//                   "Content-Type": projectData.globalJs.type,
//                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//                 },
//               })
//             );
//           } else if (fileName == parseTextToURI("global.css").pop()) {
//             event.respondWith(
//               new Response(projectData.globalCss, {
//                 status: 200,
//                 headers: {
//                   "Content-Type": projectData.globalCss.type,
//                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//                 },
//               })
//             );
//           } else {
//             console.error(
//               `From sw : global not founded `,
//               fileName,
//               parseTextToURI("global.css").pop()
//             );
//           }
//         } else if (splittedUrl.lastIndexOf("local") != -1) {
//           const pageName = params.get("page");
//           if (!pageName) {
//             console.error(`From sw : No page name founded...!`);
//             return;
//           }
//           const handleLocalEntry = (key) => {
//             event.respondWith(
//               new Response(projectData.pages[pageName][key], {
//                 status: 200,
//                 headers: {
//                   "Content-Type":
//                     projectData.pages[pageName][key].type,
//                   "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//                 },
//               })
//             );
//           };
//           if (fileName == "local.js") {
//             handleLocalEntry("js");
//           } else if (fileName == "local.css") {
//             handleLocalEntry("css");
//           }
//         }
//       }
//     })();
//   },
// },
