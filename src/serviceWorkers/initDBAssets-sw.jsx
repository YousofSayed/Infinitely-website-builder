import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { refresherWorker } from "@/helpers/defineWorkers";
import { toast } from "react-toastify";

// export const initDBAssetsSw = async () => {
//   if (!("serviceWorker" in navigator)) {
//     console.warn("Service workers are not supported.");
//     return {
//       installed: false,
//       registration: null,
//       activeWorker: null,
//     };
//   }

//   const isDev = import.meta.env.MODE === "development";
//   const swPath = isDev ? "/dbAssets-sw.js" : "/sw.js";

//   try {
//     // ----------------------------------------------------------
//     // Wait until the document is usable
//     // ----------------------------------------------------------

//     if (document.readyState === "loading") {
//       await new Promise((resolve) => {
//         document.addEventListener("DOMContentLoaded", resolve, {
//           once: true,
//         });
//       });
//     }

//     // ----------------------------------------------------------
//     // Safely get existing registration
//     // ----------------------------------------------------------

//     let registration = null;

//     for (let attempt = 0; attempt < 10; attempt++) {
//       try {
//         registration =
//           await navigator.serviceWorker.getRegistration("/");

//         break;
//       } catch (error) {
//         if (error?.name !== "InvalidStateError") {
//           throw error;
//         }

//         console.warn(
//           `Service worker document not ready. Retry ${attempt + 1}/10`
//         );

//         await new Promise((resolve) => setTimeout(resolve, 100));
//       }
//     }

//     // ----------------------------------------------------------
//     // Register if necessary
//     // ----------------------------------------------------------

//     if (!registration) {
//       registration = await navigator.serviceWorker.register(swPath, {
//         scope: "/",
//         updateViaCache: "all",
//         type: "classic",
//       });

//       console.log(
//         `SW registered: ${registration.scope} (${swPath})`
//       );
//     } else {
//       console.log(
//         "Existing SW registration:",
//         registration.scope
//       );

//       // Ask the existing registration to check for updates.
//       try {
//         await registration.update();
//       } catch (error) {
//         console.warn("SW update check failed:", error);
//       }
//     }

//     // ----------------------------------------------------------
//     // Wait for an active worker
//     // ----------------------------------------------------------

//     let activeWorker = registration.active;

//     if (!activeWorker) {
//       activeWorker = await new Promise((resolve, reject) => {
//         let finished = false;

//         const timeout = setTimeout(() => {
//           if (finished) return;

//           finished = true;

//           reject(
//             new Error(
//               "Service worker activation timed out."
//             )
//           );
//         }, 60000);

//         const check = () => {
//           if (finished) return;

//           if (registration.active) {
//             finished = true;
//             clearTimeout(timeout);
//             resolve(registration.active);
//           }
//         };

//         if (registration.installing) {
//           registration.installing.addEventListener(
//             "statechange",
//             check
//           );
//         }

//         if (registration.waiting) {
//           registration.waiting.addEventListener(
//             "statechange",
//             check
//           );
//         }

//         if (registration.active) {
//           check();
//         }
//       });
//     }

//     console.log(
//       "SW active:",
//       activeWorker.state,
//       registration.scope
//     );

//     // ----------------------------------------------------------
//     // Make sure the SW is actually activated
//     // ----------------------------------------------------------

//     if (activeWorker.state !== "activated") {
//       await new Promise((resolve) => {
//         const checkState = () => {
//           if (activeWorker.state === "activated") {
//             activeWorker.removeEventListener(
//               "statechange",
//               checkState
//             );

//             resolve();
//           }
//         };

//         activeWorker.addEventListener(
//           "statechange",
//           checkState
//         );

//         checkState();
//       });
//     }

//     // ----------------------------------------------------------
//     // Return success
//     // ----------------------------------------------------------

//     console.log("Service worker activated successfully.");

//     return {
//       installed: true,
//       registration,
//       activeWorker,
//     };
//   } catch (error) {
//     console.error(
//       "Service worker initialization failed:",
//       error
//     );

//     return {
//       installed: false,
//       registration: null,
//       activeWorker: null,
//       error,
//     };
//   }
// };

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

    // if (!navigator.serviceWorker.controller) {
    //   toastId = toast.loading(<ToastMsgInfo msg="App is installing..." />);
    // }
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
        // if (toastId) toast.done(toastId);

        // if (!isDev) {
        //   toast.success(<ToastMsgInfo msg="App installed successfully 💙" />);
        // }

        // refresherWorker.postMessage({
        //   msg: "sw-registration-state",
        //   props: { state: "done" },
        // });

        if (!sessionStorage.getItem("swInstalledReloaded")) {
          sessionStorage.setItem("swInstalledReloaded", "true");
        }
        setSw(activeSw);
        if (!(prevRegs.length && navigator.serviceWorker.controller)) {
          location.reload();
          // setTimeout(() => {
          // }, 10);
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
  } finally {
    // navigator.serviceWorker.getRegistration().then((registration) => {
    //   if (registration && registration.active) {
    //     registration.active.addEventListener("statechange", (e) => {
    //       if (e.target.state === "redundant") {
    //         console.log(
    //           "Service Worker became redundant (unregistered or replaced)."
    //         );
    //       }
    //     });
    //   }
    // });
  }
};
