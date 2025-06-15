import React from "react";
import {
  addItemInToolBarForEditor,
  getProjectData,
} from "../../helpers/functions";
import { reactToStringMarkup } from "../../helpers/reactToStringMarkup";
import { Icons } from "../../components/Icons/Icons";
import { motionId } from "../../constants/shared";
import { runGsapMethod } from "../../helpers/customEvents";

export const killGsapMotionTool = (editor) => {
  return addItemInToolBarForEditor({
    label: reactToStringMarkup(Icons.close('white')),
    editor,
    commandName: `run:kill-gsap-motion`,
    forAll: true,
    cond:Boolean(editor.getSelected().getAttributes()[motionId]),
    async commandCallback(ed) {
      const selected = ed.getSelected();
      const motionIdValue = selected.getAttributes()[motionId];
      if (motionIdValue) {
        const projectData = await getProjectData();
        const motion = projectData.motions[motionIdValue];
        runGsapMethod(["kill", "revert"], motion);
      }
    },
  });
};
