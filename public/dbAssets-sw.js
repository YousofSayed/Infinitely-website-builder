const bridgeMap = new Map();
let vars = {};

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
  const req = event.request;

  // if (
  //   (req.destination === "iframe" || req.destination === "frame") &&
  //   !req.url.startsWith(self.location.origin)
  // ) {
  //   event.respondWith(fetch(req));
  //   return;
  // }


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

        console.log("file from response : ", responseFile);

        return new Response(responseFile.stream(), {
          status: 200,
          headers: {
            "Content-Type": responseFile.type || "image/webp",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            // 🟢 Disable isolation, match Vite’s relaxed mode
            "Cross-Origin-Embedder-Policy": "unsafe-none",
            "Cross-Origin-Opener-Policy": "unsafe-none",
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
