import { select_page } from "../constants/InfinitelyCommands";
import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { current_page_id } from "../constants/shared";
import { defineRoot, infinitelyCallback, toMB } from "../helpers/bridge";
import { killAllGsapMotions, runAllGsapMotions } from "../helpers/customEvents";
import { getProjectData } from "../helpers/functions";
import { opfs } from "../helpers/initOpfs";

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
  // const originalRemove = editor.Commands.get('remove');

  editor.Commands.add(select_page, async (editor, sender, options) => {
    const pageId = options.pageId;
    if (pageId == localStorage.getItem(current_page_id)) return;
    if (!pageId) return;
    if (editor.getDirtyCount()) {
      const confirmChange = confirm(
        "You have unsaved changes, are you sure you want to switch pages and lose those changes?"
      );
      if (!confirmChange) return;
    }
    const fileSize = toMB(
      (
        await (
          await opfs.getFile(defineRoot(`editor/pages/${pageId}.html`))
        ).getOriginFile()
      ).size
    );
    console.log(fileSize, fileSize > 0.1, "fileSize");
    window.dispatchEvent(new CustomEvent("clear:script"));
    infinitelyCallback(() => {
      localStorage.setItem(current_page_id, pageId);
      if (fileSize > 0.1) {
        location.replace(location.href + `?page=${pageId}`);
      } else {
        editor.load();
      }
    }, 10);
    //  editor.store();
    // location.replace(location.pathname)
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

  editor.Commands.add("gsap:run-all", {
    async run(editor) {
      runAllGsapMotions((await getProjectData()).motions);
      // console.log("isActive : ", isActive);
    },
  });

  editor.Commands.add("gsap:kill-all", {
    async run(editor) {
      killAllGsapMotions((await getProjectData()).motions);
      // console.log("isActive : ", isActive);
    },
  });
};
