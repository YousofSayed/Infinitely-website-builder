// src/serviceWorkers/initDBAssetsSw.js
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";
import { refresherWorker } from "../helpers/defineWorkers";

export const initDBAssetsSw = async (setSw = () => {}) => {
  if (!("serviceWorker" in navigator)) {
    console.log("Service workers not supported in this browser");
    return null;
  }

  // Save previous registrations for debugging
  const prevRegs = await navigator.serviceWorker.getRegistrations();
  console.log("Previous registrations:", prevRegs);

  const isDev = import.meta.env.MODE === "development";
  const swPath = isDev ? "/dbAssets-sw.js" : "/sw.js";

  let toastId;
  try {
    // Register the SW
    // navigator.serviceWorker.controller.state;
    // navigator.serviceWorker.controller.state != "activated";
    // if (
    //   !navigator.serviceWorker.controller &&
    //   !navigator.serviceWorker.controller?.state &&
    //   navigator.serviceWorker.controller?.state != "activated"
    // ) {
    //   toastId = toast.loading(<ToastMsgInfo msg="App is installing..." />);
    // }

    if (!navigator.serviceWorker.controller) {
      toastId = toast.loading(<ToastMsgInfo msg="App is installing..." />);
    }
    const reg = await navigator.serviceWorker.register(swPath, {
      scope: "/",
      updateViaCache: "all",
      type: "classic", // could also use "module" in modern setups
    });

    console.log(`SW registered: ${reg.scope} (path: ${swPath})`);

    // Get updated list of registrations
    const currentRegs = await navigator.serviceWorker.getRegistrations();
    console.log("Current registrations:", currentRegs);

    // Show install toast only if no controller exists yet (first install)

    // Wait until the service worker is active
    const swReady = await navigator.serviceWorker.ready;
    const activeSw = swReady.active;

    if (activeSw) {
      console.log(
        "SW active and ready:",
        activeSw.state,
        navigator.serviceWorker.controller
      );
      setSw(activeSw);

      if (activeSw.state === "activated") {
        onActivated(); // run your success logic immediately
      } else {
        activeSw.addEventListener("statechange", () => {
          if (activeSw.state === "activated") {
            onActivated();
          }
        });
      }

      function onActivated() {
        console.log("sw activated");
        if (toastId) toast.done(toastId);

        if (!isDev) {
          toast.success(<ToastMsgInfo msg="App installed successfully 💙" />);
        }

        // refresherWorker.postMessage({
        //   msg: "sw-registration-state",
        //   props: { state: "done" },
        // });

        if (!sessionStorage.getItem("swInstalledReloaded")) {
          sessionStorage.setItem("swInstalledReloaded", "true");
          setTimeout(() => location.reload(), 300);
        }
      }

      return activeSw;
    } else {
      console.warn("SW not active yet…");
      return null;
    }
  } catch (err) {
    console.error("SW registration failed:", err);
    toast.error(<ToastMsgInfo msg="Failed to register service worker ❌" />);
    return null;
  }
};
