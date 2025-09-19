import React from "react";
import {
  addItemInToolBarForEditor,
  getInfinitelySymbolInfo,
} from "../../helpers/functions";
import { ReusableSympol } from "../../components/Editor/Modals/ReusableSympol";
import { editorIcons } from "../../components/Icons/editorIcons";
import { ModalTitle } from "../cutomModal";
import { Icons } from "../../components/Icons/Icons";

export const createSymbolTool = (editor) => {
  const symbolInfo = getInfinitelySymbolInfo(editor.getSelected());
  return addItemInToolBarForEditor({
    forAll: true,
    cond: !symbolInfo.isSymbol,
    commandCallback: (ed) => {
      ed.runCommand("open:custom:modal", {
        title: <ModalTitle icon={Icons.components('white')} title={`Create Sympol (Global Component)`} />,
        JSXModal: <ReusableSympol editor={ed} />,
      });
    },
    label: editorIcons.reuseable,
    commandName: "open:symbols:modal",
    editor: editor,
  });
};
