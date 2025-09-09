import React from "react";
import {
  addItemInToolBarForEditor,
  getProjectData,
} from "../../helpers/functions";
import { reactToStringMarkup } from "../../helpers/reactToStringMarkup";
import { Icons } from "../../components/Icons/Icons";
import { mainMotionId, motionId, motionInstanceId } from "../../constants/shared";
import { runGsapMethod } from "../../helpers/customEvents";

export const killGsapMotionTool = (editor) => {
  return addItemInToolBarForEditor({
    label: reactToStringMarkup(Icons.close("white")),
    editor,
    commandName: `run:kill-gsap-motion`,
    forAll: true,
    cond: ()=>{
      const attrs = editor.getSelected().getAttributes()
      return Boolean(attrs[motionId] || attrs[mainMotionId])
    },
    async commandCallback(ed) {
      const selected = ed.getSelected();
      const attrs = selected.getAttributes();
      const mainId = attrs[motionId] || attrs[mainMotionId];
      const instanceId = attrs[motionInstanceId];
      const projectData = await getProjectData();

      if (mainId && !instanceId) {
        const motion = projectData.motions[mainId];
        runGsapMethod(["play"], motion);
      } else {
        const motion = projectData.motions[mainId];
        runGsapMethod(["kill", "revert"], {
          ...motion,
          id: instanceId,
          isInstance: true,
          instances: {},
        });
      }
    },
  });
};
