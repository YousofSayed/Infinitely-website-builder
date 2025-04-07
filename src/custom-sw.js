// public/dbAssets-sw.js

// import { db } from "./helpers/db";

// const bridgeMap = new Map(); 
var vars = {};
// console.log('db is : ' ,db);

// self.addEventListener("install", (event) => {
//   console.log("SW: Installing...");
//   // self.skipWaiting();
// });

// self.addEventListener("activate", (event) => {
//   console.log("SW: Activating...");
//   // self.skipWaiting();
//   // event.waitUntil(self.clients.claim());
// });

console.log("Precache manifest:", self.__WB_MANIFEST);
console.log("Precache manifest 222:", self.__WB_MANIFEST);

self.addEventListener("message", (ev) => {
  const { command, props } = ev.data;
  const cond = command?.toLowerCase?.() === "setVar".toLowerCase();
  vars = { ...vars, ...props.obj };
  if (cond) {
    console.log("a3aaaaaaaaaaaaaaaa", vars);
  }
  // self.skipWaiting();
  // event.waitUntil(clients.claim());
});

// self.addEventListener("fetch", (event) => {
//   const url = new URL(event.request.url);

//   // Handle /keep-alive first
//   if (url.pathname.includes("/keep-alive")) {
//     event.respondWith(new Response(new Blob(["ok"], { type: "text/plain" })));
//     return;
//   }
//   console.log(`fetch from db assets url : ${url.pathname} ,rororor`);
//   const splittedUrl = url.pathname.split("/");
//   const fileName = splittedUrl[splittedUrl.length - 1];
//   const projectId = vars["projectId"];
  
//   if (projectId) {
//       const projectData = vars["projectData"];
//       const assets = projectData.assets;
//       const fileFromDB = assets
//       .concat(Object.values(projectData.fonts || {}))
//       .find(
//           (asset) =>
//             encodeURIComponent(asset.file.name).toLowerCase() ===
//           fileName.toLowerCase()
//         );
//         console.log('from fetch id: ' ,projectId );
//     console.log(
//       "sw worker 2m : ",
//       projectId,
//       projectData,
//       fileFromDB,
//       fileName.toLowerCase()
//     );
//     if (fileFromDB) {
//       event.respondWith(
//         new Response(fileFromDB.file, {
//           status: 200,
//           headers: { "Content-Type": fileFromDB.file.type },
//         })
//       );
//       return
//     }
//     return
//   }
//   // Single response logic

//   //   self.skipWaiting();

//   // clients.claim();
// });
