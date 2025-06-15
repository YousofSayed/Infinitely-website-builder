import {
  current_project_id,
  motionId,
  motionInstanceId,
} from "../constants/shared";
import { getProjectData } from "../helpers/functions";
import { infinitelyWorker } from "../helpers/infinitelyWorker";

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export const motionsRemoverHandler = (editor) => {
  let timeout,
    motionIds = [];

  const deleteMotion = async (id) => {
    if (!id) return;
    const projectData = await getProjectData();
    delete projectData.motions[id];
    infinitelyWorker.postMessage({
      command: "updateDB",
      props: {
        projectId: +localStorage.getItem(current_project_id),
        data: { motions: projectData.motions },
      },
    });
  };
  // editor.UndoManager.
  const deleteMotionInstance = async (id, instanceId) => {
    if (!id && !instanceId) return;
    const projectData = await getProjectData();
    delete projectData.motions[id].instances[instanceId];
    await infinitelyWorker.postMessage({
      command: "updateDB",
      props: {
        projectId: +localStorage.getItem(current_project_id),
        data: { motions: projectData.motions },
      },
    });
  };

  /**
   *
   * @param {import('grapesjs').Component} cmp
   */
  const callback = async (cmp) => {
    console.log("before remove cmp: ", cmp);
    const attributes = cmp.getAttributes();
    const motionIdAttr = attributes[motionId],
      instance = attributes[motionInstanceId];
    console.log(motionIdAttr, instance);
    motionIds.push([motionIdAttr, instance]);
    timeout && clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const projectData = await getProjectData();
      const motions = projectData.motions;
      motionIds.forEach(([motionIdAttr, instance], i) => {
        if (!motions[motionIdAttr]) {
          console.warn(`No motion founded , please clean unused motions`);
          return;
        }
        if (Boolean(instance)) {
          delete motions[motionIdAttr].instances[instance]
          // deleteMotionInstance(motionIdAttr, instance);
        } else {
          delete motions[motionIdAttr]
          // deleteMotion(motionIdAttr);
        }
      });
      await infinitelyWorker.postMessage({
        command: "updateDB",
        props: {
          projectId: +localStorage.getItem(current_project_id),
          data: { motions: motions },
        },
      });
      motionIds = [];
    }, 350);
  };
  editor.on("component:remove:before", callback);
};
