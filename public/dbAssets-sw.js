// self.skipWaiting();
// public/dbAssets-sw.js
// importScripts('https://cdn.jsdelivr.net/npm/opfs-tools@0.7.2/dist/opfs-tools.min.js');

const bridgeMap = new Map();
let vars = {};

// console.log("diiiiiiiiiiiiiir", dir);

// self.addEventListener("install", (event) => {
//   console.log("SW: Installing...");
//   self.skipWaiting();
//   // console.error(`Service woooooooooooooooooooooooooooooooooooooooooooooooooooooorker`);
//   clients.claim()
// });

// self.addEventListener("activate", (event) => {
//   console.log("SW: Activating...");
//   // event.waitUntil(self.clients.claim());
//   // self.skipWaiting();
//   // event.waitUntil(self.clients.claim());
// });

self.addEventListener("message", (ev) => {
  const { command, props } = ev.data;
  console.log(`Sw : data : `, command, props);
  const cond = command?.toLowerCase?.() === "setVar".toLowerCase();
  if (
    Object.keys(props?.obj || {}).includes("previewPage") &&
    props?.obj?.updateOnce
  ) {
    vars = {
      ...vars,
      previewPages: {
        ...(vars?.previewPages || {}),
        ...props.obj.previewPage,
      },
    };

    const previewBroadCastChannel = new BroadcastChannel("preview");
    previewBroadCastChannel.postMessage({
      command: "setPreviewUrl",
      props: {
        url: `${props?.obj?.pageUrl}`,
      },
    });
    console.log(
      `Send Preview URL to Broadcast Channel Is Done 👍`,
      props?.obj?.pageUrl,
      "vars is :",
      props.obj.previewPage,
      vars
    );

    return;
  }
  vars = { ...vars, ...props.obj };

  // if (cond) {
  //   console.log("Got Vars", vars, props.obj);
  // }
  // self.skipWaiting();
  // event.waitUntil(clients.claim());
});

function getOPFSFile(path) {
  navigator.sendBeacon;
}

function parseTextToURI(text = "") {
  const searcher = new URLSearchParams(`value=${text}`);
  return searcher.get("value");
}

const folders = [
  "assets",
  "fonts",
  "pages",
  "libs",
  "js",
  "css",
  "global",
  "editor",
  "index.html",
  "logo.png",
  "logo.webp",
  "logo.avif",
  "screentshot.png",
  "screentshot.webp",
  "screentshot.avif",
];

// Reuse a single BroadcastChannel for all OPFS requests
const opfsBroadcastChannel = new BroadcastChannel("opfs");

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  let pathname = parseTextToURI(url.pathname);

  const routePrefixes = [
    "edite/styling",
    "edite/motions",
    "edite/interactions",
    "edite/traits",
    "edite/commands",
    "/edite/",
    "/preview/",
    "/workspace/",
    "/add-blocks/",
  ];
  for (const prefix of routePrefixes) {
    if (pathname.startsWith(prefix)) {
      pathname = `/${pathname.replace(prefix, "")}`;
      break;
    }
  }

  const splittedUrl = pathname.split("/");
  const fileName = splittedUrl.pop();
  let folderPath = splittedUrl.join("/");

  folderPath = folderPath.startsWith("/") ? folderPath.slice(1) : folderPath;
  const entryPoint = folderPath.split("/")[0] || fileName;
  const projectId = vars["projectId"];

  // Handle keep-alive requests
  if (url.pathname.includes("/keep-alive")) {
    event.respondWith(new Response(new Blob(["ok"], { type: "text/plain" })));
    return;
  }

  // Only intercept if the request matches known folders
  if (!folders.includes(entryPoint)) return;

  event.respondWith(
    (async () => {
      const path = `${folderPath}/${fileName}`;
      const fileBraodCastChannel = new BroadcastChannel(path);

      try {
        opfsBroadcastChannel.postMessage({
          type: "getFile",
          from: "sw",
          folderPath,
          fileName,
          projectId,
        });

        const responseFile = await new Promise((resolve, reject) => {
          const callback = (ev) => {
            const { type, file, isExisit, fileName: returnedName } = ev.data;

            if (type !== "sendFile") {
              reject("Invalid response type");
              return;
            }

            if (fileName !== returnedName) {
              reject(
                `File name mismatch: expected ${fileName}, got ${returnedName}`
              );
              return;
            }

            if (isExisit && file) {
              resolve(file);
            } else {
              reject(`No file found: ${path}`);
            }
          };

          fileBraodCastChannel.addEventListener("message", callback, {
            once: true,
          });
        });

        return new Response(responseFile, {
          status: 200,
          headers: {
            "Content-Type": responseFile.type || "application/octet-stream",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        console.error("SW Fetch error:", err);
        return new Response("File not found", {
          status: 404,
          statusText: `File Not Found for Path: ${folderPath}`,
        });
      } finally {
        fileBraodCastChannel.close();
      }
    })()
  );
});

// function parseTextToURI(text = "") {
//   const searcher = new URLSearchParams(`value=${text}`);
//   // console.log(`From sw : `, searcher.get("value"));

//   return searcher.get("value");
// }

// const folders = [
//   "assets",
//   "fonts",
//   "pages",
//   "libs",
//   "js",
//   "css",
//   "global",
//   "editor",
//   "index.html",
//   "logo.png",
//   "logo.webp",
//   "logo.avif",
//   "screentshot.png",
//   "screentshot.webp",
//   "screentshot.avif",
// ];

// self.addEventListener("fetch", (event) => {
//   // console.log(`From Fetch Event :` ,   event);

//   const url = new URL(event.request.url);
//   let pathname = parseTextToURI(url.pathname);
//   const routePrefixes = [
//     "/edite/",
//     "/preview/",
//     "/workspace/",
//     "/add-blocks/",
//     "motions",
//   ];
//   // console.warn("Pathh from sw before", pathname);
//   for (const prefix of routePrefixes) {
//     if (pathname.startsWith(prefix)) {
//       pathname = `/${pathname.replace(prefix, "")}`;
//       break;
//     }
//   }

//   const splittedUrl = pathname.split("/");
//   const fileName = splittedUrl.pop();
//   let folderPath = splittedUrl.join("/");
//   folderPath = folderPath.startsWith("/")
//     ? folderPath.replace("/", "")
//     : folderPath;

//   const entryPoint = folderPath.split("/")[0] || fileName;
//   const projectId = vars["projectId"];
//   // console.warn(
//   //   "Pathh from sw after",
//   //   pathname,
//   //   splittedUrl,
//   //   fileName,
//   //   folderPath
//   // );
//   // Handle /keep-alive first
//   if (url.pathname.includes("/keep-alive")) {
//     event.respondWith(new Response(new Blob(["ok"], { type: "text/plain" })));
//     return;
//   }
//   // self.skipWaiting();
//   // Handle other fetch requests

//   folders.includes(entryPoint) &&
//     event.respondWith(
//       (async () => {
//         const path = `${folderPath}/${fileName}`;
//         const opfsBroadcastChannel = new BroadcastChannel("opfs");
//         const fileBraodCastChannel = new BroadcastChannel(path);
//         // console.log("Paaaaaaaaaaaath is : ", path);

//         // if (!projectId) {
//         //   return new Response(
//         //     new Blob(["Project ID not found"], { type: "text/plain" }),
//         //     {
//         //       status: 400,
//         //     }
//         //   );
//         // }

//         opfsBroadcastChannel.postMessage({
//           type: "getFile",
//           from: "sw",
//           folderPath,
//           fileName,
//           projectId,
//         });

//         /**
//          * @type {File|undefined}
//          */
//         const responseFile = await new Promise((resolve, reject) => {
//           /**
//            * @param {MessageEvent} ev
//            */
//           const callback = (ev) => {
//             // console.log(
//             //   "from service worker sendFile broadcast",
//             //   folderPath,
//             //   fileName
//             // );
//             const { type, file, isExisit, filePath } = ev.data;

//             if (type !== "sendFile") {
//               reject(`No file found: ${file}, ${isExisit}`);
//               fileBraodCastChannel.removeEventListener("message", callback);
//               fileBraodCastChannel.close();
//               return;
//             }

//             if (fileName != ev.data.fileName) {
//               console.error(
//                 `File name not equal file name : ${isExisit}`,
//                 file,
//                 folderPath,
//                 entryPoint,
//                 fileName,
//                 ev.data.fileName,
//                 url.pathname,
//                 pathname
//               );

//               reject(`File name not equal file name : ${isExisit}`);
//               fileBraodCastChannel.removeEventListener("message", callback);
//               fileBraodCastChannel.close();
//               return;
//             }

//             if (isExisit && file) {
//               console.log(`File from sw is : `, file);

//               resolve(file);
//               fileBraodCastChannel.close();
//               opfsBroadcastChannel.close();
//             } else {
//               console.error(
//                 `No file found: ${isExisit}`,
//                 file,
//                 folderPath,
//                 entryPoint,
//                 url.pathname,
//                 pathname
//               );

//               reject(`No file found: ${isExisit}`);
//             }
//             fileBraodCastChannel.removeEventListener("message", callback);
//             fileBraodCastChannel.close();
//           };

//           fileBraodCastChannel.addEventListener("message", callback, {
//             once: true,
//           });
//         });

//         if (responseFile) {
//           // console.log(
//           //   `File is From service worker: `,
//           //   responseFile,
//           //   folderPath,
//           //   entryPoint,
//           //   url.pathname,
//           //   pathname
//           // );
//           return new Response(responseFile, {
//             status: 200,
//             headers: {
//               "Content-Type": responseFile.type || "application/octet-stream",
//               "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//             },
//           });
//         } else {
//           return new Response("File not founded", {
//             status: 404,
//             statusText: `File Not Founded For Path : ${folderPath}!`,
//           });
//         }

//         // return fetch(event.request)
//         // return new Response(new Blob(["404 not found!"], { type: "text/plain" }), {
//         //   status: 404,
//         // });
//       })()
//     );
// });

/**
 * @type {import('../src/helpers/types').Project}
 */
// const projectData = vars["projectData"];
/**
 * @type {import('../src/helpers/types').InfinitelyAsset[] }
 */
// const assets = projectData.assets;
/**
 * @type {import('../src/helpers/types').InfinitelyAsset }
 */
//   if (
//     splittedUrl.lastIndexOf("assets") != -1 ||
//     splittedUrl.lastIndexOf("fonts") != -1
//   ) {
//     const fileFromDB = assets
//       .concat(Object.values(projectData.fonts || {}))
//       .find((asset) => {
//         const assetUrl = new URL(
//           `/assets/${asset.file.name}`,
//           url.origin
//         ).pathname
//           .split("/")
//           .pop();

//         // console.log("sw file data:", encodeURI(asset.file.name), fileName, encodeURI(asset.file.name) == fileName );
//         // console.log("sw file 2:", asset.file.name , fileName , encodeURIComponent(asset.file.name) == fileName );
//         // console.log("sw file data sd:", assetUrl, fileName, assetUrl == fileName );

//         if (!asset?.isCDN && assetUrl == fileName) {
//           fileNameFromAssets = assetUrl;
//         }
//         return !asset?.isCDN && assetUrl == fileName;
//       });

//     console.log(
//       `got it from ${splittedUrl.lastIndexOf("fonts") != -1 && "fonts"} ${
//         splittedUrl.lastIndexOf("assets") != -1 && "assets"
//       }`
//     );

//     if (fileFromDB) {
//       // console.log("sw file:", fileFromDB.file.name);
//       event.respondWith(
//         new Response(fileFromDB.file, {
//           status: 200,
//           headers: {
//             "Content-Type":
//               fileFromDB.file.type || "application/octet-stream",
//             "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//           },
//         })
//       );
//     }
//   } else if (splittedUrl.lastIndexOf("libs") != -1) {
//     /**
//      *
//      * @param {keyof import('../src/helpers/types').Project} key
//      */
//     const handleLib = (key) => {
//       const file = projectData[key].find(
//         (lib) =>
//           new URL(lib.file.name, self.origin).pathname.split("/").pop() ==
//           fileName
//       );
//       if (!file) return;
//       event.respondWith(
//         new Response(file.file, {
//           status: 200,
//           headers: {
//             "Content-Type": file.file.type,
//             "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//           },
//         })
//       );
//     };
//     if (url.href.includes("libs/js")) {
//       if (url.href.includes("libs/js/header")) {
//         handleLib("jsHeaderLibs");
//       } else if (url.href.includes("libs/js/footer")) {
//         handleLib("jsFooterLibs");
//       }
//     } else if (url.href.includes("libs/css")) {
//       handleLib("cssLibs");
//     } else {
//       console.error(`From sw : no libs founded`);
//     }
//   } else if (
//     splittedUrl.includes("pages") ||
//     fileName.includes("index.html")
//   ) {
//     // const pageName = fileName.replace(".html", "");
//     /**
//      * @type {{[key:string]:Blob}}
//      */
//     const previewPages = vars.previewPages;
//     if (!previewPages) {
//       console.error("No Preview Pages Founded..");

//       event.respondWith(
//         new Response(
//           new Blob([`<h1>404 Page Not Founded</h1>`], {
//             type: "text/html",
//           }),
//           {
//             status: 200,
//             headers: {
//               "Content-Type": `text/html`,
//               "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//             },
//           }
//         )
//       );
//       return;
//     }
//     const previewPage = previewPages[fileName || ""];
//     console.log(
//       "file page name : ",
//       event.request.url,
//       url.pathname,
//       splittedUrl,
//       fileName,
//       previewPage
//     );

//     if (previewPage) {
//       event.respondWith(
//         new Response(previewPage, {
//           status: 200,
//           headers: {
//             "Content-Type": `text/html`,
//             "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//           },
//         })
//       );
//     } else {
//       event.respondWith(
//         new Response(
//           new Blob([`<h1>404 Page Not Founded</h1>`], {
//             type: "text/html",
//           }),
//           {
//             status: 200,
//             headers: {
//               "Content-Type": `text/html`,
//               "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//             },
//           }
//         )
//       );
//     }
//   } else if (splittedUrl.lastIndexOf("global") != -1) {
//     if (fileName == parseTextToURI("global.js").pop()) {
//       event.respondWith(
//         new Response(projectData.globalJs, {
//           status: 200,
//           headers: {
//             "Content-Type": projectData.globalJs.type,
//             "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//           },
//         })
//       );
//     } else if (fileName == parseTextToURI("global.css").pop()) {
//       event.respondWith(
//         new Response(projectData.globalCss, {
//           status: 200,
//           headers: {
//             "Content-Type": projectData.globalCss.type,
//             "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//           },
//         })
//       );
//     } else {
//       console.error(
//         `From sw : global not founded `,
//         fileName,
//         parseTextToURI("global.css").pop()
//       );
//     }
//   } else if (splittedUrl.lastIndexOf("local") != -1) {
//     const pageName = params.get("page");
//     if (!pageName) {
//       console.error(`From sw : No page name founded...!`);
//       return;
//     }
//     const handleLocalEntry = (key) => {
//       event.respondWith(
//         new Response(projectData.pages[pageName][key], {
//           status: 200,
//           headers: {
//             "Content-Type": projectData.pages[pageName][key].type,
//             "Access-Control-Allow-Origin": "*", // For cross-origin iframes
//           },
//         })
//       );
//     };
//     if (fileName == "local.js") {
//       handleLocalEntry("js");
//     } else if (fileName == "local.css") {
//       handleLocalEntry("css");
//     }
//   }
// }
