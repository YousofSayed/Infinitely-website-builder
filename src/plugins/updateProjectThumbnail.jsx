import { isFunction } from "lodash";
import { current_project_id } from "../constants/shared";
import { defineRoot, isDaysAgo } from "../helpers/bridge";
import { db } from "../helpers/db";
import {
  getImgAsBlob,
  getProjectData,
  workerCallbackMaker,
} from "../helpers/functions";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { opfs } from "../helpers/initOpfs";
import { snapdom } from "@zumer/snapdom";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";
import { pageBuilderWorker } from "../helpers/defineWorkers";
export let updateThumbnailTimeout;

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @param {boolean} calcDays
 * @param {(()=>void)|undefined} callback
 * @returns
 */
export const takeScreenShot = async (editor, calcDays = true, callback) => {
  let tId;

  const projectID = localStorage.getItem(current_project_id);

  const projectData = await getProjectData();

  const is5DaysAgo = isDaysAgo(projectData.lastScreenshot, 3);
  if (calcDays) {
    if (!is5DaysAgo && projectData.lastScreenshot) return;
  }
  updateThumbnailTimeout && clearTimeout(updateThumbnailTimeout);
  updateThumbnailTimeout = setTimeout(async () => {
    try {
      const iframe = editor.Canvas.getFrameEl();
      const canvasWrapper = editor.getContainer();
      if (!iframe || !canvasWrapper) return;
      tId = toast.loading(
        <ToastMsgInfo msg={"Taking project screenshot..."} />
      );
      // iframe.contentDocument.body
      //   .querySelectorAll("img , audio , video")
      //   .forEach((el) => {
      //     el.crossOrigin = "anonymous";
      //   });
      // fixBackgroundImages(editor.getWrapper().getEl());

      const blob = await getImgAsBlob(
        editor.getWrapper().getEl(),
        "image/webp",
        {
          // scale: 2,
        }
      );

      editor.Canvas.getBody().classList.remove("screenshot-mode");
      
      console.log("blob : ", blob);

       workerCallbackMaker(
        pageBuilderWorker,
        "writeFilesToOPFS",
        async ({ done }) => {
          console.log('recived message from take screenshot' , done);
          
          if (!done) {
            toast.dismiss(tId);
            toast.error(<ToastMsgInfo msg={`Error taking screenshot`} />);
            throw new Error(`Error when updating screenshot`);
          } else {
            await db.projects.update(+projectID, {
              lastScreenshot: new Date(),
            });

            toast.done(tId);
            toast.success(
              <ToastMsgInfo msg={`Screenshot updated successfully👍`} />
            );
            isFunction(callback) && (await callback());
            console.log("after all done");
          }
        }
      );

      pageBuilderWorker.postMessage({
        command: "writeFilesToOPFS",
        props: {
          files: [
            {
              path: defineRoot(`screenshot.webp`),
              content: blob,
            },
          ],
        },
      });

     

      // localStorage.setItem("last-screenshot", new Date());
    } catch (error) {
      toast.dismiss(tId);
      toast.error(<ToastMsgInfo msg={`Error taking screenshot: ${error}`} />);
      console.error("Error taking screenshot: ", error);
    }
  }, 700);
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
