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
  addItemInToolBarForEditor({
    label: editorIcons.vue({fill:'white'}),
    editor,
    forAll: true,
    commandName: `run:pv-mount`,
    async commandCallback(ed) {
      // const projectData = await getProjectData();
      // const pageName = localStorage.getItem(current_page_id);
      // const cmds = projectData.pages[`${pageName}`].cmds;
      const sle = editor.getSelected();
      mount({
        editor,
        specificCmp:sle,
      })
      // const sleId = sle.getId();
      // let willSelected;
      // Object.keys(cmds).forEach((id) => {
      //   if(!cmds[id] || !cmds[id].length)return;
      //   const cmp = editor.getWrapper().find(`[${inf_cmds_id}="${id}"]`)[0];
      //   if(!cmp)return;
      //   const cmpId = cmp.getId();
      //   const newCmp = cmp.replaceWith(cmp.clone())[0];
      //   newCmp.addAttributes({ _: buildScriptFromCmds(cmds[id]) });
      //   hsProcessNode(newCmp.getEl());
      //   willSelected = sleId == cmpId ? newCmp : willSelected;
      //   console.log('cmd should done from loop');
      // });
      // console.log('cmd should done  out loop' , cmds);
      
      // const cmps = editor.getWrapper().find("[inf-cmds]");
      // const sle = editor.getSelected();
      // const sleId = sle.getId();
      // cmps.forEach((cmp) => {
      //   const sympolInfo = editor.Components.getSymbolInfo(cmp);
      //   const cmpId = cmp.getId();

        // if (sympolInfo.isSymbol) {
        //   const newInstance = editor.Components.addSymbol(cmp);
        //   const newCmp = cmp.replaceWith(newInstance,{})[0];
        //   // newCmp.set('id',cmp.getId());

        // //   const instance = sympolInfo.instances.filter((rel) => rel == cmp)[0];
        // //   const newInfo = editor.Components.getSymbolInfo(newCmp);

        // //   const instanceEl = newInfo.instances
        // //     .map((rel) => rel.getEl())
        // //     .filter((rel) => rel == newCmp.getEl())[0];

        //   const cmds = newCmp.getAttributes()["inf-cmds"];
        //   const hsScript = buildScriptFromCmds(JSON.parse(cmds));
        //   newCmp.addAttributes({ _: hsScript });
        //   hsProcessNode(newCmp.getEl());
        //   editor.refresh({tools:false});

        //   willSelected = sleId == cmpId ? newCmp : willSelected;
        //   // willSelected = newCmp.getId();
        // //   console.log(sleId, cmpId);

        //   return;
        // }

        //   const newCmp = cmp.replaceWith(
        //     cmp.clone()
        //   )[0];
        //   newCmp.setId(cmpId)
        //   const cmds = newCmp.getAttributes()["inf-cmds"];
        //   console.log(JSON.parse(cmds));

        //   const hsScript = buildScriptFromCmds(JSON.parse(cmds));
        //   newCmp.addAttributes({ _: hsScript });
        //   console.log(newCmp.getEl());

        //   hsProcessNode(newCmp.getEl());
        //   // editor.refresh({tools:false});

        //   willSelected = sleId == cmpId ? newCmp : willSelected;
      // });

      // willSelected && editor.select(willSelected);
      // editor.refresh({tools:true});
      // editor.Canvas.refresh({all:true})
    },
  });
};
