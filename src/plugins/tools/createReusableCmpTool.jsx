import React from "react";
import { ReusableCmb } from "../../components/Editor/Modals/ReusableCmb";
import { addItemInToolBarForEditor } from "../../helpers/functions";
import { editorIcons } from "../../components/Icons/editorIcons";

export const createReusableCmpTool = (editor) => {
  addItemInToolBarForEditor({
    forAll:true,
    commandCallback: (ed) => {
      ed.runCommand("open:custom:modal", {
        title: `Create Reusable Component`,
        JSXModal: <ReusableCmb editor={ed} />,
      });
    },
    label: editorIcons.save,
    commandName: "open:reusable-creator:modal",
    editor: editor,
  });
};
