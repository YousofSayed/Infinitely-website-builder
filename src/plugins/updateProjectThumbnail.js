import { isFunction } from "lodash";
import { current_project_id } from "../constants/shared";
import { defineRoot, isDaysAgo } from "../helpers/bridge";
import { db } from "../helpers/db";
import { getImgAsBlob, getProjectData } from "../helpers/functions";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { opfs } from "../helpers/initOpfs";
import {snapdom} from '@zumer/snapdom'
export let updateThumbnailTimeout;
async function fixBackgroundImages(el) {
  const elements = el.querySelectorAll("*");
  await Promise.all(
    Array.from(elements).map(async (node) => {
      const bg = getComputedStyle(node).backgroundImage;
      const match = bg.match(/url\(["']?(.*?)["']?\)/);
      if (match) {
        const url = match[1];
        try {
          const res = await fetch(url, { mode: "cors", cache: "force-cache" });
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          node.style.backgroundImage = `url("${objectUrl}")`;
        } catch (e) {
          console.warn("Failed to load BG image", url, e);
        }
      }
    })
  );
}

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @param {boolean} calcDays
 * @param {(()=>void)|undefined} callback
 * @returns
 */
export const takeScreenShot = async (editor, calcDays = true, callback) => {
  const projectID = localStorage.getItem(current_project_id);

  const projectData = await getProjectData();

  const is5DaysAgo = isDaysAgo(projectData.lastScreenshot, 3);
  if (calcDays) {
    if (!is5DaysAgo && projectData.lastScreenshot) return;
  }
  updateThumbnailTimeout && clearTimeout(updateThumbnailTimeout);
  updateThumbnailTimeout = setTimeout(async () => {
    console.log("after all done");
    // editor.Canvas.getBody().classList.add("screenshot-mode");
    // console.log('screentshot element : ' , editor.Canvas.getBody());
    const iframe = editor.Canvas.getFrameEl();
    const canvasWrapper = editor.getContainer();
    if (!iframe || !canvasWrapper) return;
    // iframe.style.display = "none";
    // const deviceManager = editor.DeviceManager;
    // const device = editor.getDevice();
    // const deviceDef = deviceManager.get(device)?.attributes;
    // let width, height;
    // const targetWidth = parseFloat(deviceDef?.widthMedia || "1080");
    // // console.log("target width : ", targetWidth, deviceDef?.widthMedia);

    // const wrapperWidth = canvasWrapper.clientWidth;
    // const body = iframe?.contentDocument?.body;
    // if (!body) return;
    // const currentZoom = canvasWrapper.style.zoom || 1;

    // canvasWrapper.style.zoom = 1;
    iframe.contentDocument.body.querySelectorAll('img , audio , video').forEach(el=>{
      el.crossOrigin = "anonymous";

    })
    fixBackgroundImages(editor.getWrapper().getEl())
    // // Wait a bit for layout to stabilize
    // await new Promise((r) => setTimeout(r, 100));
    // const blob = await(await snapdom(document.body , {
    //   fast:true,
    //   format:'webp',
    //   type:'webp',
    //   useProxy:'https://proxy.corsfix.com/?',
    //   debug:true,
    //   // embedFonts:true,
      
    // })).toBlob({
    //   debug:true
    // });
    const blob = await getImgAsBlob(iframe.contentDocument.body, "image/webp", {
      // x: 0,
      // y: 0,
      // width: iframe.clientWidth / currentZoom,
      // height: iframe.clientHeight / currentZoom,
      // windowWidth: iframe.contentWindow.innerWidth / currentZoom,
      // windowHeight: iframe.contentWindow.innerHeight / currentZoom,
      scale: 2,
      // width: editor.getContainer().offsetWidth, // or editor.Canvas.getFrameEl().offsetWidth
      // height: 600, // limit height
      // scale: editor.getContainer().style.zoom,
    });

    editor.Canvas.getBody().classList.remove("screenshot-mode");

    console.log("blob : ", blob);
    if ("requestIdleCallback" in window) {
      requestIdleCallback(async () => {
        infinitelyWorker.postMessage({
          command: "writeFilesToOPFS",
          props: {
            files: [
              {
                path: defineRoot(`/screenshot.webp`),
                content: blob,
              },
            ],
          },
        });
      });
    } else {
      // await opfs.writeFiles([
      //   {
      //     path: defineRoot(`/screenshot.webp`),
      //     content: blob,
      //   },
      // ]);

      infinitelyWorker.postMessage({
        command: "writeFilesToOPFS",
        props: {
          files: [
            {
              path: defineRoot(`/screenshot.webp`),
              content: blob,
            },
          ],
        },
      });
    }

    // localStorage.setItem("last-screenshot", new Date());
    await db.projects.update(+projectID, {
      lastScreenshot: new Date(),
    });

    isFunction(callback) && (await callback());
    // infinitelyWorker.postMessage({
    //   command: "updateDB",
    //   props: {
    //     projectId: +localStorage.getItem(current_project_id),
    //     data: {
    //       imgSrc: blob // await getImgAsBlob(editor.Canvas.getBody()),
    //     },
    //   },
    // });
  }, 2000);
};
/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const updateProjectThumbnail = (editor) => {
  editor.on("storage:after:store", async () => {
    await takeScreenShot(editor);
  });
};
