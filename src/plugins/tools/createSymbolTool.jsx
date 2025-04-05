import React from "react";
import { addItemInToolBarForEditor } from "../../helpers/functions";
import { ReusableSympol } from "../../components/Editor/Modals/ReusableSympol";
import { editorIcons } from "../../components/Icons/editorIcons";

export const createSymbolTool = (editor) => {
  addItemInToolBarForEditor({
    forAll : true,
    commandCallback: (ed) => {
      ed.runCommand("open:custom:modal", {
        title: `Create Sympol (Global Component)`,
        JSXModal: <ReusableSympol editor={ed} />,
      });
    },
    label: editorIcons.reuseable,
    commandName: "open:symbols:modal",
    editor: editor,
  });
};
