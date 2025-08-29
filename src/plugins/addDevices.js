import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { editorContainerInstance } from "../constants/InfinitelyInstances";

/**
 * @param {import('grapesjs').Editor} editor
 */
export const addDevices = (editor) => {
  let resizerObserver, mutationsObserver;
  const deviceManager = editor.DeviceManager;
  function emitEditorContainerZoom() {
    console.log("i emit !!");

    editorContainerInstance.emit(InfinitelyEvents.editorContainer.update, {
      value: editor.getContainer().style.zoom,
    });
  }
  let timeout;
  // Remove all predefined devices
  ["desktop", "Desktop", "tablet", "Tablet", "mobile", "Mobile"].forEach(
    (device) => deviceManager.remove(device)
  );

  // Add device presets
  // window.outerWidth
  deviceManager.add({
    name: "desktop",
    width: "",
    widthMedia: window.outerWidth + "px",
  });

  deviceManager.add({
    name: "tablet",
    width: "100%",
    widthMedia: "768px",
  });

  deviceManager.add({
    name: "mobile",
    width: "100%",
    widthMedia: "360px",
  });

  const zoomToFit = () => {
    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      editor.getContainer().style.zoom = 1;
      // editor.getContainer().style.transform = `scale(1)`;
      if (!editor.Canvas) {
        resizerObserver && resizerObserver.disconnect();
        mutationsObserver && mutationsObserver.disconnect();
        resizerObserver = null;
        mutationsObserver = null;
        return;
      }
      const iframe = editor.Canvas.getFrameEl();
      const canvasWrapper = editor.getContainer();

      if (!iframe || !canvasWrapper) return;

      const device = editor.getDevice();
      const deviceDef = deviceManager.get(device)?.attributes;

      const targetWidth = parseFloat(deviceDef?.widthMedia || "1080");
      // console.log("target width : ", targetWidth, deviceDef?.widthMedia);

      const wrapperWidth = canvasWrapper.clientWidth;
      // const iframeBody = iframe.contentDocument.body;
      // iframeBody.style.transition = `.2s`;
      editor.getContainer().style.transformOrigin = "0 0";
      editor.getContainer().style.willChange = "zoom";
      editor.getContainer().style.contain = `layout paint size`;
      editor.getContainer().style.backfaceVisibility = `hidden`;
      editor.getContainer().style.transform = `translateZ(0)`;

      if (wrapperWidth < targetWidth) {
        const scale = wrapperWidth / targetWidth;

        iframe.style.width = `100%`;
        editor.getContainer().style.zoom = `${scale}`;

        // editor.on('component:create',(model)=>{
        //   model.getEl().style.zoom = scale;
        // })
        // editor.getContainer().style.transform = `scale(${scale})`;
        // editor.getContainer().style.width = `${editor.getContainer().clientWidth + (editor.getContainer().clientWidth * scale)}px`;
        // editor.getContainer().style.height = `${editor.getContainer().clientHeight + (editor.getContainer().clientHeight * scale)}px`;
        // editor.getContainer().style.transform = `scale(${scale})`;
        // editor.Canvas.refresh({ all: true, spots: true });
        // editor.refresh({ tools: true });
      } else {
        iframe.style.width = `${targetWidth}px`;
        editor.getContainer().style.zoom = `1`;
        // editor.getContainer().style.transform = `scale(1)`;
        // editor.Canvas.refresh({ all: true, spots: true });
        // editor.refresh({ tools: true });
      }
      emitEditorContainerZoom();
    }, 80);
  };

  resizerObserver = new ResizeObserver(() => {
    zoomToFit();
  });
  mutationsObserver = new MutationObserver((entries) => {
    const rightPanel = document.querySelector(`#right-panel`);
    const leftPanel = document.querySelector(`#left-panel`);
    // entries.forEach((entry) => {
    //   entry.removedNodes.forEach((node) => {
    //     resizerObserver.unobserve(node);
    //   });
    // });
    if (rightPanel) {
      resizerObserver.observe(rightPanel);
    }
    if (leftPanel) {
      resizerObserver.observe(leftPanel);
    }
  });

  editor.on("change:device", () => {
    // editor.getContainer().style.zoom = 1;

    zoomToFit();
  });
  // editor.on("canvas:frame:load:body", () => {
  //   // editor.getContainer().style.zoom = 1;
  //   zoomToFit();
  // });

  editor.on("canvas:frame:load",
    /**
     * 
     * @param {{window:Window}} param0 
     */
    ({window}) => {
    // console.log('from load ;' , document.querySelector(`#right-panel`));
    //document.querySelector(`#panel-group`)
    console.log('from load window' , window);
    window.document
    zoomToFit();
    mutationsObserver.observe(document.querySelector(`#panels-group`), {
      childList: true,
      subtree: true,
    });
    // resizerObserver.observe(document.querySelector(`#right-panel`));
    // resizerObserver.observe(document.querySelector(`#left-panel`));
  });

  window.addEventListener("resize", () => zoomToFit());
};
