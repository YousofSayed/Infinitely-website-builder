import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { editorContainerInstance } from "@/constants/InfinitelyInstances";
import { killAllGsapMotions } from "@/helpers/customEvents";
import { getProjectData, restartGSAPMotions } from "@/helpers/functions";

export let editorObserver;

/**
 * 
 * @param {import('grapesjs').Editor} editor 
 */
export const addDevices = (editor) => {
  let resizerObserver, mutationsObserver;
  const deviceManager = editor.DeviceManager;

  let timeout;
  let runId = 0;

  // 🔥 Memory-based guard. No DOM attributes.
  let lastAppliedZoom = -1;
  let lastAppliedWidth = "";
  let lastObservedWidth = -1;

  // 🔥 Stable element to observe. Do NOT observe the element we zoom.
  let resizeTarget = null;

  function getCanvasWrapper() {
    return typeof editor.getContainer === "function"
      ? editor.getContainer()
      : null;
  }

  function emitEditorContainerZoom() {
    const canvasWrapper = getCanvasWrapper();

    editorContainerInstance.emit(InfinitelyEvents.editorContainer.update, {
      value: canvasWrapper ? canvasWrapper.style.zoom : "1",
    });
  }

  function getResizeTarget() {
    const canvasWrapper = getCanvasWrapper();
    if (!canvasWrapper) return null;

    if (resizeTarget && resizeTarget.isConnected) {
      return resizeTarget;
    }

    // IMPORTANT:
    // Observe the parent/host if possible.
    // The zoomed container must not be the resize source,
    // otherwise changing zoom triggers ResizeObserver again.
    resizeTarget = canvasWrapper.parentElement || canvasWrapper;

    return resizeTarget;
  }

  function getStableWidth() {
    const canvasWrapper = getCanvasWrapper();
    const target = getResizeTarget();

    if (!canvasWrapper || !target) return 0;

    // If there is no parent fallback, normalize by current zoom.
    // This prevents the element's own zoom from feeding back into itself.
    if (target === canvasWrapper) {
      const currentZoom = parseFloat(canvasWrapper.style.zoom) || 1;
      const rectWidth = canvasWrapper.getBoundingClientRect().width;

      return currentZoom ? rectWidth / currentZoom : rectWidth;
    }

    // Parent/host measurement.
    // Remove padding so we measure usable content width.
    const styles = window.getComputedStyle(target);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;

    return target.clientWidth - paddingLeft - paddingRight;
  }

  // Remove all predefined devices
  [
    "desktop", "Desktop", "tablet", "Tablet", "mobile", "Mobile",
    "mobilePortrait", "Mobile portrait", "mobileLandscape", "Mobile landscape",
  ].forEach((device) => deviceManager.remove(device));

  // Add device presets
  deviceManager.add({
    id: "desktop",
    name: "desktop",
    width: '',
    widthMedia: window.outerWidth + "px", // 🔥 FIX 1: Empty means fluid/base. Do NOT lock to window.outerWidth!
    priority: 1,
  });

  deviceManager.add({
    id: "tablet",
    name: "tablet",
    width: "900px",
    widthMedia: "900px",
    priority: 2,
  });

  deviceManager.add({
    id: "mobile",
    name: "mobile",
    width: "480px",
    widthMedia: "480px",
    priority: 3,
  });

  editor.onReady(() => {
    editor.trigger(InfinitelyEvents.devices.update);
  });

  const zoomToFit = () => {
    timeout && clearTimeout(timeout);

    const thisRun = ++runId;

    timeout = setTimeout(async () => {
      const projectData = await getProjectData();

      // If another zoomToFit was triggered while awaiting, abort this stale run.
      if (thisRun !== runId) return;

      killAllGsapMotions(projectData && projectData.motions);

      if (!editor.Canvas) {
        resizerObserver && resizerObserver.disconnect();
        mutationsObserver && mutationsObserver.disconnect();
        resizerObserver = null;
        mutationsObserver = null;
        return;
      }

      const iframe = editor.Canvas.getFrameEl();
      const canvasWrapper = getCanvasWrapper();
      const target = getResizeTarget();

      if (!iframe || !canvasWrapper || !target) return;

      const wrapperWidth = getStableWidth();

      // 🔥 Startup guard:
      // If panel is not laid out yet, do nothing.
      // ResizeObserver will call again when it has real size.
      if (!wrapperWidth || wrapperWidth <= 0) return;

      const device = editor.getDevice();
      const deviceDef = deviceManager.get(device)?.attributes;

      // const isDesktop = device === 'desktop';
      let targetWidth = parseFloat(deviceDef?.widthMedia);

      // Safety only. Prevents "NaNpx" if widthMedia is missing.
      if (!isFinite(targetWidth) || targetWidth <= 0) {
        targetWidth = wrapperWidth;
      }

      let desiredZoom = 1;
      let desiredIframeWidth = `${targetWidth}px`;

      // If desktop or widthMedia is missing, target width is the available wrapper width
      // if (isDesktop || isNaN(targetWidth)) {
      //   targetWidth = wrapperWidth;
      // }

      // 🔥 FIX 2: Properly handle Desktop vs Tablet/Mobile scaling
      // if (isDesktop) {
      //   // Desktop always fills 100% of the available space without zooming
      //   iframe.style.width = `100%`;
      //   editor.getContainer().style.zoom = `1`;
      // } else if (wrapperWidth < targetWidth) {
      //   // Tablet/Mobile: scale down if wrapper is smaller than device width
      //   const scale = wrapperWidth / targetWidth;
      //   iframe.style.width = `${targetWidth}px`; // Set exact device width so CSS media queries trigger correctly
      //   editor.getContainer().style.zoom = `${scale}`;
      // } else {
      //   // Tablet/Mobile: wrapper is larger than device, center it with fixed width
      //   iframe.style.width = `${targetWidth}px`;
      //   editor.getContainer().style.zoom = `1`;
      // }

      if (wrapperWidth < targetWidth) {
        // Tablet/Mobile: scale down if wrapper is smaller than device width
        const scale = wrapperWidth / targetWidth;
        desiredZoom = scale;
        desiredIframeWidth = `${targetWidth}px`; // Set exact device width so CSS media queries trigger correctly
      } else {
        // Tablet/Mobile: wrapper is larger than device, center it with fixed width
        desiredZoom = 1;
        desiredIframeWidth = `${targetWidth}px`;
      }

      // Invalid state guard
      if (!isFinite(desiredZoom) || desiredZoom <= 0) return;

      // 🔥 If already applied, stop.
      // This is the real infinite-loop breaker.
      if (
        Math.abs(lastAppliedZoom - desiredZoom) < 0.001 &&
        lastAppliedWidth === desiredIframeWidth
      ) {
        return;
      }

      lastAppliedZoom = desiredZoom;
      lastAppliedWidth = desiredIframeWidth;

      // 🔥 Disconnect while mutating layout.
      // This prevents our own style change from immediately re-triggering RO.
      editorObserver && editorObserver.disconnect();

      canvasWrapper.style.willChange = "zoom";

      // IMPORTANT:
      // Removed `size` from contain.
      // `contain: size` on an auto-sized editor root can collapse it
      // and cause ResizeObserver loops at startup.
      canvasWrapper.style.contain = "layout paint";

      iframe.style.width = desiredIframeWidth;
      canvasWrapper.style.zoom = `${desiredZoom}`;

      emitEditorContainerZoom();
      restartGSAPMotions(editor);

      // Re-observe after browser has applied the layout/paint.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (target.isConnected) {
            editorObserver && editorObserver.observe(target);
          }
        });
      });
    }, 80);
  };

  editorObserver = new ResizeObserver((entries) => {
    const entry = entries && entries[0];
    const width = entry ? entry.contentRect.width : 0;

    // 🔥 Ignore subpixel jitter / self-induced micro changes.
    if (Math.abs(width - lastObservedWidth) < 1) return;

    lastObservedWidth = width;
    zoomToFit();
  });

  const initialTarget = getResizeTarget();

  if (initialTarget) {
    editorObserver.observe(initialTarget);
  }

  editor.on("change:device", () => {
    lastAppliedZoom = -1;
    lastAppliedWidth = "";
    lastObservedWidth = -1;
    zoomToFit();
  });

  editor.onReady(() => {
    zoomToFit();
  });

  window.addEventListener("resize", () => {
    const desktopDevice = deviceManager.get("desktop");

    if (desktopDevice) {
      desktopDevice.set({ widthMedia: window.outerWidth + "px" });
    }

    lastAppliedZoom = -1;
    lastAppliedWidth = "";
    lastObservedWidth = -1;

    zoomToFit();
  });
};