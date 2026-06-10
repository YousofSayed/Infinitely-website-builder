const hmrBroadcastChannel = new BroadcastChannel("preview");
hmrBroadcastChannel.addEventListener("message", async (ev) => {
  const currentUrl = location.href;
  const { command, props } = ev.data;
  console.log("yes i eval me from broadcast", props, command, currentUrl);
  const { url } = props;
  if (!url) return;
  const parsedURL = new URL(url, window.origin);
  if (location.pathname.toLowerCase() == parsedURL.pathname.toLowerCase()) {
    console.log("yes i equal me from broadcast", url);
    location.reload();
  
  }
});
