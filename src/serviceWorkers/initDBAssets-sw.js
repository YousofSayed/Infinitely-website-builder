export const initDBAssetsSw = async (setSw = () => {}) => {
  if ("serviceWorker" in navigator) {
    console.log("sholud init");
    // window.addEventListener("load", async () => {
    // Wait for page load
    try {
        // "/dbAssets-sw.js"
        // new URL("./dbAssets-sw.js" , import.meta.url)
      const reg = await navigator.serviceWorker.register("/dbAssets-sw.js");
      console.log("SW Registered:", reg.scope);

      // Ensure SW is active
      const sw = await navigator.serviceWorker.ready;

      // Force page control (optional, for dev)
      if (reg.active) {
        console.log("SW State:", reg.active.state);
        setSw(reg.active);
        return reg.active
      } else {
        console.log("SW not active yet, reloading...");
        // window.location.reload(); // Reload to ensure control
        return;
      }

      // Fetch the CSS
    //   const response = await fetch("assets/css/custom-style");
    //   if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    //   const file = await response.blob();
    //   const text = await file.text();
    //   console.log("File is:", text); // Should log: body { color: red; }
    } catch (err) {
      console.error("Error:", err);
    }
    // });
  }
};
