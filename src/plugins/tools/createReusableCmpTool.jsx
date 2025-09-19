import React from "react";
import { ReusableCmb } from "../../components/Editor/Modals/ReusableCmb";
import { addItemInToolBarForEditor, getInfinitelySymbolInfo } from "../../helpers/functions";
import { editorIcons } from "../../components/Icons/editorIcons";
import { Icons } from "../../components/Icons/Icons";
import { ModalTitle } from "../cutomModal";


export const createReusableCmpTool = (editor) => {
  const symbolInfo = getInfinitelySymbolInfo(editor.getSelected());

return  addItemInToolBarForEditor({
    forAll:true,
    cond:!symbolInfo.isSymbol,
    commandCallback: (ed) => {
      ed.runCommand("open:custom:modal", {
        title: <ModalTitle icon={Icons.templates({fill:'white'})} title={"Create Template"} />,
        JSXModal: <ReusableCmb editor={ed} />,
      });
    },
    label: editorIcons.save,
    commandName: "open:reusable-creator:modal",
    editor: editor,
  });
};
