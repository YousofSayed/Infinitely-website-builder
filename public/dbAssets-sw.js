// public/dbAssets-sw.js
const bridgeMap = new Map();
let vars = {};

self.addEventListener("install", (event) => {
  console.log("SW: Installing...");
  event.waitUntil(
    caches.open('my-app-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js'
      ]);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activating...");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (ev) => {
  const { command, props } = ev.data;
  console.log(`Sw : data : `, command, props, ev.data, bridgeMap);
  const cond = command?.toLowerCase?.() === "setVar".toLowerCase();
  vars = { ...vars, ...props.obj };
  if (cond) {
    console.log("a3aaaaaaaaaaaaaaaa", vars);
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle /keep-alive first
  if (url.pathname.includes("/keep-alive")) {
    event.respondWith(new Response(new Blob(["ok"], { type: "text/plain" })));
    return;
  }

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
        console.log("sw worker 2m : ", projectId, projectData, fileFromDB, fileName.toLowerCase());
        if (fileFromDB) {
          return new Response(fileFromDB.file, {
            status: 200,
            headers: { "Content-Type": fileFromDB.file.type },
          });
        }
      }
      // Fallback to fetch if no projectId or no file found
      return await fetch(url);
    })()
  );
});