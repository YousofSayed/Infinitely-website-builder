import {
  current_dynamic_template_id,
  current_project_id,
} from "../constants/shared";
import { db } from "../helpers/db";
import {
  getDynamicComponent,
  getProjectData,
  isDynamicComponent,
} from "../helpers/functions";
import { infinitelyWorker } from "../helpers/infinitelyWorker";

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const updateDynamicTemplates = (editor) => {
  editor.on("component:update:components", async (cmp) => {
    const currentDynamicTemplateId = sessionStorage.getItem(
      current_dynamic_template_id
    );
    if (!currentDynamicTemplateId) return;
    const dynamicComponent = getDynamicComponent(cmp);
    if (!dynamicComponent || !isDynamicComponent(cmp)) return;
    const projectId = +localStorage.getItem(current_project_id);
    const projectData = await getProjectData();
    // await db.projects.update(projectId, {
    //   dynamicTemplates: {
    //     ...projectData.dynamicTemplates,
    //     [`${currentDynamicTemplateId}`]: {
    //       ...projectData.dynamicTemplates[currentDynamicTemplateId],
    //       // jsonCmp:JSON.stringify(dynamicComponent),
    //       cmp: new Blob(
    //         [
    //           dynamicComponent.toHTML({
    //             withProps: true,
    //             keepInlineStyle: true,
    //           }),
    //         ],
    //         { type: "text/html" }
    //       ),
    //       // cmpChilds: dynamicComponent.getInnerHTML({withProps:true, keepInlineStyle:true}),
    //       // imgSrc: await toBlob(dynamicComponent.getEl(), {
    //       //   type: "image/webp",
    //       // }),
    //     },
    //   },
    // });

    infinitelyWorker.postMessage({
      command: "updateDB",
      props: {
        projectId,
        data: {
          dynamicTemplates: {
            ...projectData.dynamicTemplates,
            [`${currentDynamicTemplateId}`]: {
              ...projectData.dynamicTemplates[currentDynamicTemplateId],
              // jsonCmp:JSON.stringify(dynamicComponent),
              cmp: new Blob(
                [
                  dynamicComponent.toHTML({
                    withProps: true,
                    keepInlineStyle: true,
                  }),
                ],
                { type: "text/html" }
              ),
              // cmpChilds: dynamicComponent.getInnerHTML({withProps:true, keepInlineStyle:true}),
              // imgSrc: await toBlob(dynamicComponent.getEl(), {
              //   type: "image/webp",
              // }),
            },
          },
        },
      },
    });
    console.log(
      "dynamic updated .....%%%%%%%%%%% : ",
      JSON.stringify(dynamicComponent)
    );
  });
};
