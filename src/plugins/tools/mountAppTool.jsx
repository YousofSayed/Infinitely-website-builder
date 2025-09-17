import React from "react";
import {
  addItemInToolBarForEditor,
  buildScriptFromCmds,
  getProjectData,
  mount,
} from "../../helpers/functions";
import { editorIcons } from "../../components/Icons/editorIcons";
import { current_page_id, inf_cmds_id } from "../../constants/shared";

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const mountAppTool = (editor) => {
return  addItemInToolBarForEditor({
    label: editorIcons.vue({fill:'white'}),
    editor,
    forAll: true,
    cond:Boolean(editor.getSelected().getAttributes()["v-scope"]),
    commandName: `run:pv-mount`,
    async commandCallback(ed) {
      // const projectData = await getProjectData();
      // const pageName = localStorage.getItem(current_page_id);
      // const cmds = projectData.pages[`${pageName}`].cmds;
      editor.runCommand("run:kill-gsap-motion")
      const sle = editor.getSelected();
      mount({
        editor,
        specificCmp:sle,
      })
    
    },
  });
};
