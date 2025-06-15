import { motionId, motionInstanceId } from "../constants/shared";

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export const motionsCloneHandler = (editor) => {
  editor.on("component:clone", (newModel) => {
    // Set the 'cloned' attribute on the cloned component
    const aatibutes = newModel.getAttributes();
    const motionIdAttr = aatibutes[motionId],
      motionInstanceIdAttr = aatibutes[motionInstanceId];

    if (!motionIdAttr && !motionInstanceIdAttr) return;
    if (motionIdAttr && !motionInstanceIdAttr) {
      newModel.addAttributes({ [motionInstanceId]: motionIdAttr });
    }
  });
};
