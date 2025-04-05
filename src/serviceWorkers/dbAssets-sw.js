// import { db } from "../../src/helpers/db";

const bridgeMap = new Map();
let vars = {}

self.addEventListener("install", (event) => {
  console.log("SW: Installing...");
  event.waitUntil(self.skipWaiting()); // Force activation
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activating...");
  event.waitUntil(self.clients.claim()); // Take control immediately
});

self.addEventListener("message", (ev) => {
  const { command, props } = ev.data;
  console.log(`Sw : data : ` ,command , props, ev.data , bridgeMap, command?.toLowerCase?.() == "setVar".toLowerCase());
  const cond = command?.toLowerCase?.() == "setVar".toLowerCase();
  vars = {...vars , ...props.obj}
  // for (const key in props.obj) {
  //   console.log(`Sw : data : cond` ,command , props, ev.data , bridgeMap);
  //   // bridgeMap.set(key, obj[key]);
  // }
  if (cond) {
    console.log('a3aaaaaaaaaaaaaaaa' , vars);
    
  }
});

self.addEventListener("fetch", async (event) => {
  const url = new URL(event.request.url);
  const splittedUrl = url.pathname.split("/");
  const fileName = splittedUrl[splittedUrl.length - 1];
  const projectId = vars["projectId"];
  
  if (projectId) {
    /**
     * @type {import('../helpers/types').Project}
    */
   const projectData = vars["projectData"];
   const assets = projectData.assets;
   const fileFromDB = assets.concat(Object.values(projectData.fonts || {})).find(
     (asset) => encodeURIComponent(asset.file.name).toLowerCase() == fileName.toLowerCase()
    );
    console.log("sw worker 2m : ", projectId , projectData , fileFromDB  , fileName.toLowerCase());
    if (fileFromDB) {
      event.respondWith(
        new Response(fileFromDB.file, {
          status: 200,
          headers: { "Content-Type": fileFromDB.file.type },
        })
      );
    } else {
      event.respondWith(await fetch(url));
    }
  } else {
    event.respondWith(await fetch(url));
  }
  // const fileFromDB =
  //   if (url.pathname === "/assets/css/custom-style") {
  //     console.log("SW: Intercepted /css/custom-style");
  //     const cssBlob = new Blob(["body { color: red; }"], { type: "text/css" });
  //     event.respondWith(
  //       new Response(cssBlob, {
  //         status: 200,
  //         headers: { "Content-Type": "text/css" },
  //       })
  //     );
  //   } else {
  //     console.log("SW: Fetching", url.pathname); // Debug all requests
  //   }
});
