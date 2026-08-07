import { Icons } from "@/components/Icons/Icons";
import {
  mainMotionId,
  motionId,
  motionInstanceId,
} from "@/constants/shared";
import { runGsapMethod } from "@/helpers/customEvents";
import { db } from "@/helpers/db";
import {
  addItemInToolBarForEditor,
  getProjectData,
} from "@/helpers/functions";
import { reactToStringMarkup } from "@/helpers/reactToStringMarkup";
import React from "react";

export const runGsapMotionTool = (editor) => {
  return addItemInToolBarForEditor({
    label: reactToStringMarkup(Icons.play({ fill: "white" })),
    editor,
    commandName: `run:play-gsap-motion`,
    forAll: true,
    cond:  ()=>{
      const attrs = editor.getSelected().getAttributes()
      return Boolean(attrs[motionId] || attrs[mainMotionId])
    },
    async commandCallback(ed) {
      const selected = ed.getSelected();
      const attrs = selected.getAttributes();
      const mainId = attrs[motionId] || attrs[mainMotionId];
      const instanceId = attrs[motionInstanceId];
      const projectData = await getProjectData();

      const motion = projectData.motions[mainId];
      runGsapMethod(["kill", "revert"], motion);
      if (mainId && !instanceId) {
        runGsapMethod(["play"], motion);
      } else {
        // const motion = projectData.motions[mainId];
        runGsapMethod(["play"], {
          ...motion,
          id: instanceId,
          isInstance: true,
          instances: {},
        });
      }
    },
  });
};
