// import { registerSW } from "virtual:pwa-register";
// src/serviceWorkers/initDBAssetsSw.js
export const initDBAssetsSw = async (setSw = () => {}) => {
  if ('serviceWorker' in navigator) {
    console.log('Initializing service worker...');

    // Determine the correct SW file based on environment
    const isDev = import.meta.env.MODE === 'development'; // Vite-specific env check
    const swPath = isDev ? '/dev-sw.js?dev-sw' : '/sw.js'; // Use dev-sw.js in dev, sw.js in prod

    try {
      const reg = await navigator.serviceWorker.register(swPath);
      console.log(`SW Registered: ${reg.scope} (Path: ${swPath})`);

      const sw = await navigator.serviceWorker.ready;
      console.log('SW Ready:', sw.active.state);

      if (sw.active) {
        setSw(sw.active);
        return sw.active;
      } else {
        console.log('SW not active yet...');
        return null;
      }
    } catch (err) {
      console.error('SW Registration Error:', err);
      return null;
    }
  } else {
    console.log('Service workers not supported');
    return null;
  }
};