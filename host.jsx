// host.js (parent)
import { createRoot } from "react-dom/client";
import { InfinitelyEvents } from "./src/constants/infinitelyEvents";
import { makeAppResponsive } from "./src/helpers/cocktail";
import { Loader } from "./src/components/Loader";
import { infinitelyCallback } from "./src/helpers/bridge";
import "./src/index.css";
import "./index.css";
/**
 * @type {HTMLIFrameElement | null}
 */
let appFrame = null,
  /**
   * @type {import("react-dom/client").Root | null}
   */
  root = null;
makeAppResponsive("#host");

function mountIframe() {
  const host = document.getElementById("host");
  if (!host) {
    console.error("Host element not found (#host).");
    return;
  }

  const newFrame = document.createElement("iframe");
  newFrame.id = "app-frame";
  newFrame.src = "/app.html"; // Vite entry (app.html next to index.html)
  newFrame.style.width = "100%";
  newFrame.style.height = "100%";
  newFrame.style.border = "none";
  // newFrame.referrerPolicy = "no-referrer";
  // newFrame.sandbox =
  //   "allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads";
  // newFrame.allow = "clipboard-read; clipboard-write;";
  // newFrame.loading = "eager"; // important for service worker control
  // newFrame.allowFullscreen = true;

  // Clear host and put new iframe
  console.log("Mounting iframe...");

  if (!root) {
    host.innerHTML = "";
    host.appendChild(newFrame);
  } else {
    host.appendChild(newFrame);
    newFrame.addEventListener(
      "load",
      () => {
        root.unmount();
        root = null;
      },
      { once: true }
    );

    // host.innerHTML = "";
  }
  appFrame = newFrame;
}

window.addEventListener(InfinitelyEvents.editor.reload, () => {
  if (appFrame) {
    appFrame.contentWindow.dispatchEvent(new CustomEvent("unmount"));
    appFrame.src = "about:blank";
    appFrame.remove();
    appFrame = null;
    // appFrame.contentDocument.location.reload();
    // appFrame.addEventListener(
    //   "load",
    //   () => {
    //     root.unmount();
    //     root = null;
    //   },
    //   { once: true }
    // );
  }
  const container = document.getElementById("host");
  if (!container) return;
  root = createRoot(container);
  root.render(<Loader zIndex={100000} />);
  // resetAppMemory();
  // setTimeout(() => {}, 200);
  infinitelyCallback(() => {
    mountIframe();
  }, 200);
  // resetAppMemory();
});

/**
 * resetAppMemory:
 * 1) Ask iframe to run its internal cleanup (unmount React, stop timers, stop workers, etc.)
 * 2) Wait a beat
 * 3) Set iframe.src = 'about:blank' and remove it
 * 4) Ensure parent drops any references that might keep old iframe alive
 * 5) Recreate iframe
 */
export async function resetAppMemory() {
  if (!appFrame) return;

  const frame = appFrame;

  // 1) Try to run iframe cleanup handshake
  try {
    if (
      frame.contentWindow &&
      typeof frame.contentWindow.__APP_CLEANUP__ === "function"
    ) {
      // call cleanup and wait (cleanup returns a Promise)
      await frame.contentWindow.__APP_CLEANUP__();
      // small pause to settle
      await new Promise((r) => setTimeout(r, 50));
    }
  } catch (err) {
    console.warn("Error calling iframe cleanup:", err);
  }

  // 2) Clear iframe content and remove element
  try {
    frame.src = "about:blank";
  } catch (e) {
    // ignore
  }

  // give browser a frame
  requestAnimationFrame(() => {
    try {
      frame.remove();
    } catch (e) {}
  });

  // 3) Drop references in the parent (best-effort)
  try {
    // Null any global variables that referenced the iframe or its window
    Object.keys(window).forEach((k) => {
      try {
        if (
          window[k] &&
          (window[k] === frame ||
            window[k] === frame.contentWindow ||
            window[k]?.frameElement === frame)
        ) {
          window[k] = null;
        }
      } catch (e) {}
    });

    // Remove any leftover child of host (should be empty)
    // const host = document.getElementById("host");
    // if (host) host.innerHTML = "";
  } catch (e) {}

  // 4) Force a tiny pause and gc hint (dev only)
  await new Promise((r) => setTimeout(r, 60));
  if (typeof window.gc === "function") {
    try {
      window.gc();
    } catch (e) {}
  }

  // 5) Recreate a fresh iframe
  mountIframe();
}

// initial mount
// mountIframe();

// expose for console/testing
// window.resetAppMemory = resetAppMemory;
// window.mountIframe = mountIframe;
