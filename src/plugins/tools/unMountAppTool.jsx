import React from "react";
import { addItemInToolBarForEditor, unMount } from "../../helpers/functions";
import { editorIcons } from "../../components/Icons/editorIcons";

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export const unMountAppTool = (editor) => {
  addItemInToolBarForEditor({
    editor,
    label: editorIcons.editGjsComponent({ fill: "white" }),
    forAll: true,
    commandName: `run:pv-unmount`,
    commandCallback(editor) {
      const sle = editor.getSelected();
      unMount({
        editor,
        specificCmp: sle,
        selectAfterUnMout:true
      });
    },
  });
};
