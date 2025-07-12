// import { registerSW } from "virtual:pwa-register";
// src/serviceWorkers/initDBAssetsSw.js
export const initDBAssetsSw = async (setSw = () => {}) => {
  if ("serviceWorker" in navigator) {
    const prevRegs = await navigator.serviceWorker.getRegistrations();
    console.log("Initializing service worker...", prevRegs);

    // Determine the correct SW file based on environment
    const isDev = import.meta.env.MODE === "development"; // Vite-specific env check
    const swPath = isDev ? "/dbAssets-sw.js" : "/sw.js"; // Use dev-sw.js in dev, sw.js in prod
    // const swPath = isDev ? '/dev-sw.js?dev-sw' : '/sw.js'; // Use dev-sw.js in dev, sw.js in prod
    //{ type: import.meta.env.MODE === 'production' ? 'classic' : 'module' }
    try {
      const reg = await navigator.serviceWorker.register(swPath, {
        scope: "/",
        updateViaCache: "all",
        type: "classic",
      });
      const currentRegs = await navigator.serviceWorker.getRegistrations();

      console.log(
        `SW Registered: ${reg.scope} (Path: ${swPath})`,
        prevRegs,
        currentRegs
      );

      const sw = await navigator.serviceWorker.ready;
      console.log("SW Ready:", sw.active.state);

      if (sw.active) {
        console.log("SW Ready to use:", sw.active.state);
        setSw(sw.active);
        if (!prevRegs.length && currentRegs.length) {
          location.reload();
        }
        return sw.active;
      } else {
        console.log("SW not active yet...");
        return null;
      }
    } catch (err) {
      console.error("SW Registration Error:", err);
      return null;
    }
  } else {
    console.log("Service workers not supported");
    return null;
  }
};
