import { current_project_id } from "../constants/shared";
import { getImgAsBlob } from "../helpers/functions";
import { infinitelyWorker } from "../helpers/infinitelyWorker";

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const updateProjectThumbnail = (editor) => {
  const projectID = localStorage.getItem(current_project_id);
  let timeout;

  editor.on("storage:after:store", () => {
    timeout && clearTimeout(timeout);
    timeout = setTimeout(async () => {
      console.log("after all done",);

      // await db.projects.update(+projectID, {
      //   imgSrc: await getImgAsBlob(editor.Canvas.getBody()),
      // });
      const blob = await getImgAsBlob(editor.Canvas.getBody());
      console.log('blob : ' , blob);
      

      infinitelyWorker.postMessage({
        command: "updateDB",
        props: {
          projectId: +localStorage.getItem(current_project_id),
          data: {
            imgSrc: blob // await getImgAsBlob(editor.Canvas.getBody()),
          },
        },
      });
    }, 2000);
  });
};
