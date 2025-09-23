import { select_page } from "../constants/InfinitelyCommands";
import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { current_page_id } from "../constants/shared";

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export const addNewBuiltinCommands = (editor) => {
  editor.Commands.add("open:symbols-manager", (editor, sender, options) => {
    editor.runCommand("open:symbols:modal");
  });

  editor.Commands.add("close:current:modal", (editor, sender, options) => {
    editor.runCommand("close:custom:modal");
  });
  const originalRemove = editor.Commands.get('remove');

 

  editor.Commands.add(select_page, (editor, sender, options) => {
    const pageId = options.pageId;
    if (pageId == localStorage.getItem(current_page_id)) return;
    localStorage.setItem(current_page_id, pageId);
    //  editor.store();
    editor.load();
  });

  editor.Commands.add("toggle-preview", {
    run(editor) {
      const isPreview = editor.Commands.isActive("preview");
      const isOutline = editor.Commands.isActive("core:component-outline");
      if (isOutline) {
        sessionStorage.setItem("inf_ui_outline", "true");
      }
      if (isPreview) {
        // Stop preview and restore outline
        editor.stopCommand("preview");
        const isOutline = sessionStorage.getItem("inf_ui_outline");
        if (isOutline) {
          editor.runCommand("core:component-outline");
          sessionStorage.removeItem("inf_ui_outline");
        }
      } else {
        // Start preview
        editor.stopCommand("core:component-outline");
        editor.runCommand("preview");
      }
    },
  });

  editor.Commands.add("store", {
    run(editor) {
      editor.store();
    },
  });

  editor.Commands.add("ui:outline", {
    run(editor) {
      if (editor.Commands.isActive("preview")) return;
      const command = `core:component-outline`;
      const isActive = editor.Commands.isActive(command);
      isActive ? editor.stopCommand(command) : editor.runCommand(command);
      // console.log("isActive : ", isActive);
    },
  });
};
