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

  if (cond) {
    console.log("Got Vars", vars, props.obj);
  }
  // self.skipWaiting();
  // event.waitUntil(clients.claim());
});

function parseTextToURI(text = "") {
  return new URL(text, self.origin).pathname.split("/");
}
