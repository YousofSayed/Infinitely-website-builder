// public/dbAssets-sw.js
const bridgeMap = new Map();
let vars = {};

self.addEventListener("install", (event) => {
  console.log("SW: Installing...");
  // self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activating...");
  event.waitUntil(clients.claim());
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
  console.log("from db sw : ", url, url.origin);

  // Handle /keep-alive first
  if (url.pathname.includes("/keep-alive")) {
    event.respondWith(new Response(new Blob(["ok"], { type: "text/plain" })));
    return;
  }
  // console.log(`fetch from db assets url : ${url.pathname} ,rororor`);
  (async () => {
    const splittedUrl = url.pathname.split("/");
    const fileName = splittedUrl[splittedUrl.length - 1];
    const projectId = vars["projectId"];
    let fileNameFromAssets = "";
    if (projectId) {
      /**
       * @type {import('../src/helpers/types').Project}
       */
      const projectData = vars["projectData"];
      /**
       * @type {import('../src/helpers/types').InfinitelyAsset[] }
       */
      const assets = projectData.assets;
      /**
       * @type {import('../src/helpers/types').InfinitelyAsset }
       */
      const fileFromDB = assets
        .concat(Object.values(projectData.fonts || {}))
        .find((asset) => {
          if (
            !asset?.isCDN &&
            encodeURIComponent(asset.file.name.toLowerCase()) ==
              fileName.toLowerCase()
          ) {
            fileNameFromAssets = asset.file.name.toLowerCase();
          }
          return !asset?.isCDN && (encodeURIComponent(asset.file.name) == fileName);
        });
      // console.log(
      //   "sw worker 2m : ",
      //   projectId,
      //   projectData,
      //   fileFromDB,

      //   fileName.toLowerCase()
      // );
      // console.log('files name :' ,assets.map(asset=>asset.file.name) ,fileName );
      if (fileFromDB) {
        // console.log("sw file:", fileFromDB.file.name);
        event.respondWith(
          new Response(fileFromDB.file, {
            status: 200,
            headers: {
              "Content-Type":
                fileFromDB.file.type || "application/octet-stream",
              "Access-Control-Allow-Origin": "*", // For cross-origin iframes
            },
          })
        );
        // return ;
      } else {
        // try {
        //   console.error(`sw noooooo res:`);
        //   const res = await fetch(event.request)
        //   return res
        // } catch (error) {
        //   console.error('Fucken sw error');
        //   const res = await fetch(url);
        //   return res
        // }
      }
    }
    // Fallback to fetch if no projectId or no file found
    // caches.match(event.request).then((cachedResponse) => {
    //   if (cachedResponse) {
    //     return cachedResponse;
    //   }
    //   return fetch(event.request);
    // });
    // try {

    //   const res = await fetch(url);
    //   return res;
    // } catch (error) {
    //   console.error(`error from db assets : ${error}`);
    //   return;
    // }
  })();
  // Single response logic

  // self.skipWaiting();

  // clients.claim();
});
