import React from "react";
import {
  addItemInToolBarForEditor,
  getProjectData,
} from "../../helpers/functions";
import { reactToStringMarkup } from "../../helpers/reactToStringMarkup";
import { Icons } from "../../components/Icons/Icons";
import { motionId } from "../../constants/shared";
import { db } from "../../helpers/db";
import { runGsapMethod } from "../../helpers/customEvents";

export const runGsapMotionTool = (editor) => {
  return addItemInToolBarForEditor({
    label: reactToStringMarkup(Icons.play({ fill: "white" })),
    editor,
    commandName: `run:play-gsap-motion`,
    forAll: true,
    cond : Boolean(editor.getSelected().getAttributes()[motionId]),
    async commandCallback(ed) {
      const selected = ed.getSelected();
      const motionIdValue = selected.getAttributes()[motionId];
      if (motionIdValue) {
        const projectData = await getProjectData();
        const motion = projectData.motions[motionIdValue];
        runGsapMethod(["play"], motion);
      }
    },
  });
};
