import { current_project_id } from "../constants/shared";
import { defineRoot, isDaysAgo } from "../helpers/bridge";
import { db } from "../helpers/db";
import { getImgAsBlob, getProjectData } from "../helpers/functions";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { opfs } from "../helpers/initOpfs";

export let updateThumbnailTimeout;
/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const updateProjectThumbnail = (editor) => {
  const projectID = localStorage.getItem(current_project_id);

  editor.on("storage:after:store", async() => {
    const projectData = await getProjectData();

    const is5DaysAgo = isDaysAgo(projectData.lastScreenshot, 3);
    if (!is5DaysAgo && projectData.lastScreenshot) return;
    updateThumbnailTimeout && clearTimeout(updateThumbnailTimeout);
    updateThumbnailTimeout = setTimeout(async () => {
      console.log("after all done");
      // editor.Canvas.getBody().classList.add("screenshot-mode");

      const blob = await getImgAsBlob(
        editor.getWrapper().getEl(),
        "image/webp",
        {
          x: 0,
          y: 0,
          // width: editor.getContainer().offsetWidth, // or editor.Canvas.getFrameEl().offsetWidth
          height: 600, // limit height
          // scale: editor.getContainer().style.zoom,
        }
      );
      // editor.Canvas.getBody().classList.remove("screenshot-mode");

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
  });
};
