import React from "react";
import { addItemInToolBarForEditor } from "../../helpers/functions";
import { ReusableSympol } from "../../components/Editor/Modals/ReusableSympol";
import { editorIcons } from "../../components/Icons/editorIcons";
import { dynamic_container } from "../../constants/cmpsTypes";
import { DynamicTemplatesCreator } from "../../components/Editor/Modals/DynamicTemplatesCreator";

export const createDynamicTemplate = (editor) => {
  addItemInToolBarForEditor({
    cmpType:dynamic_container,
    forAll:false,
    showInDynamic:true,
    commandCallback: (ed) => {
      ed.runCommand("open:custom:modal", {
        title: `Create Dynamic Template For Rest API`,
        JSXModal: <DynamicTemplatesCreator  />,
      });
    },
    label: editorIcons.dynamicTemp,
    toolId: dynamic_container,
    commandName: "open:dynamic-templates-creator:modal",
    editor: editor,
    
  });
};
