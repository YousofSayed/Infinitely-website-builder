self.addEventListener("install", (event) => {
  console.log("SW: Installing...");
  event.waitUntil(self.skipWaiting()); // Force activation
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activating...");
  event.waitUntil(self.clients.claim()); // Take control immediately
});

self.addEventListener("fetch", async (event) => {
  const url = new URL(event.request.url);
  const splittedUrl = url.pathname.split("/");
  const fileName = splittedUrl[splittedUrl.length - 1];
  // const fileFromDB =
  if (url.pathname === "/css/custom-style") {
    console.log("SW: Intercepted /css/custom-style");
    const cssBlob = new Blob(["body { color: red; }"], { type: "text/css" });
    event.respondWith(
      new Response(cssBlob, {
        status: 200,
        headers: { "Content-Type": "text/css" },
      })
    );
  } else {
    console.log("SW: Fetching", url.pathname); // Debug all requests
  }
});
