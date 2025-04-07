// public/dbAssets-sw.js
const bridgeMap = new Map();
let vars = {};

self.addEventListener("install", (event) => {
  console.log("SW: Installing...");
  // self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activating...");
  // self.skipWaiting();
  // event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (ev) => {
  const { command, props } = ev.data;
  console.log(`Sw : data : `, command, props, ev.data, bridgeMap);
  const cond = command?.toLowerCase?.() === "setVar".toLowerCase();
  vars = { ...vars, ...props.obj };
  if (cond) {
    console.log("a3aaaaaaaaaaaaaaaa", vars);
  }
  // self.skipWaiting();
  // event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle /keep-alive first
  if (url.pathname.includes("/keep-alive")) {
    event.respondWith(new Response(new Blob(["ok"], { type: "text/plain" })));
    return;
  }
  console.log(`fetch from db assets url : ${url.pathname} ,rororor`);

  // Single response logic
  event.respondWith(
    (async () => {
      const splittedUrl = url.pathname.split("/");
      const fileName = splittedUrl[splittedUrl.length - 1];
      const projectId = vars["projectId"];

      if (projectId) {
        const projectData = vars["projectData"];
        const assets = projectData.assets;
        const fileFromDB = assets
          .concat(Object.values(projectData.fonts || {}))
          .find(
            (asset) =>
              encodeURIComponent(asset.file.name).toLowerCase() ===
              fileName.toLowerCase()
          );
        console.log(
          "sw worker 2m : ",
          projectId,
          projectData,
          fileFromDB,
          fileName.toLowerCase()
        );
        if (fileFromDB) {
          return new Response(fileFromDB.file, {
            status: 200,
            headers: { "Content-Type": fileFromDB.file.type },
          });
        }
      }
      // Fallback to fetch if no projectId or no file found
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      });
      // try {

      //   const res = await fetch(url);
      //   return res;
      // } catch (error) {
      //   console.error(`error from db assets : ${error}`);
      //   return;
      // }
    })()
  );
  self.skipWaiting();

  // clients.claim();
});
