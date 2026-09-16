import { Icons } from "@/components/Icons/Icons";
import { open_symbol_code_editor_modal } from "@/constants/InfinitelyCommands";
import {
  addItemInToolBarForEditor,
  getComponentRules,
  getInfinitelySymbolInfo,
} from "@/helpers/functions";
import { reactToStringMarkup } from "@/helpers/reactToStringMarkup";
import React from "react";

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const titleTool = (editor) => {
  const sle = editor.getSelected();
  if (!sle) return;

  return addItemInToolBarForEditor({
    editor,
    label: `<h1 class="font-bold text-lg">${sle.getName()}</h1>`,
    forAll: true,
    cond: true,
    commandName: "",
  });
};
