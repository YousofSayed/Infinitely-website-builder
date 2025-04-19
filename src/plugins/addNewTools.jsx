import React from "react";
import { createSymbolTool } from "./tools/createSymbolTool";
import { createReusableCmpTool } from "./tools/createReusableCmpTool";
import { mountAppTool } from "./tools/mountAppTool";
import { createDynamicTemplate } from "./tools/createDynamicTemplate";
import { addClickClass, html } from "../helpers/cocktail";
import {
  getInfinitelySymbolInfo,
  isDynamicComponent,
} from "../helpers/functions";
import { unMountAppTool } from "./tools/unMountAppTool";
import { cloneDeep } from "lodash";

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export const addNewTools = (editor) => {
  let children;
  /**
   * @type {HTMLElement | undefined}
   */
  let resizerEl;
  console.log(`resizer el out":`, document.querySelector(`.gjs-resizer-c`));
  editor.on("component:selected", (args) => {
 
    const sle = editor.getSelected();
    const symbolInfo = getInfinitelySymbolInfo(sle);
    !children && (children = editor.Canvas.getResizerEl().children);
    // editor.refresh({ tools.: true });
    // editor.Canvas.refresh({ all: true, spots: true });

    // sle.updateView();

    if (isDynamicComponent(sle)) {
      createDynamicTemplate(editor);
      console.log(true, " yes is dynamic");

      // runHsCmdsTool(editor);
    } else {
      // createDynamicTemplate(editor);
      mountAppTool(editor);
      unMountAppTool(editor);
      createSymbolTool(editor);
      !symbolInfo.isSymbol && createReusableCmpTool(editor);
    }

    const renderTool = () => {
      const toolbarEl = editor.Canvas.getToolbarEl();
      const toolbarItemsClass = `gjs-toolbar-items`;
      const toolbarItemClass = `gjs-toolbar-item`;
      const toolbarItemsEl = toolbarEl.querySelector(`.${toolbarItemsClass}`);
      const cmpTools = sle.toolbar;
      const moveCommand = `tlb-move`;
      const noTouchClass = `gjs-no-touch-actions`;
      // tlb-move gjs-no-touch-actions
      // if (!toolbarItemsEl) {
      console.log("hahahahahah");
      toolbarEl.innerHTML = "";
      const newToolbarItemsEl = document.createElement("menu");
      newToolbarItemsEl.className = toolbarItemsClass;
      //====================Append Tools===========
      cmpTools.forEach((tool) => {
        const toolEl = document.createElement("li");
        toolEl.className = toolbarItemClass;
        if (tool.command == moveCommand) {
          toolEl.draggable = "true";
          toolEl.classList.add(noTouchClass);
        }
        toolEl.insertAdjacentHTML("beforeend", tool.label);
        if (tool.command == moveCommand) {
          toolEl.addEventListener("mousedown", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            if (typeof tool.command == "string") {
              editor.runCommand(tool.command);
            } else if (typeof tool.command == "function") {
              tool.command(editor);
            }
          });
        } else {
          toolEl.addEventListener("click", (ev) => {
            addClickClass(ev.currentTarget, "click");
            if (typeof tool.command == "string") {
              editor.runCommand(tool.command);
            } else if (typeof tool.command == "function") {
              tool.command(editor);
            }
          });
        }
        newToolbarItemsEl.appendChild(toolEl);
      });
      toolbarEl.appendChild(newToolbarItemsEl);
    };
    console.log("done render");
    // };

    renderTool();
    console.log("resizer : ");
    // editor.Canvas.getResizerEl().remove()

    // [...children].forEach((el) => editor.Canvas.getResizerEl().appendChild(el));
    // editor.Canvas.getResizerEl().innerHTML = "";
    if (sle.is("wrapper")) {
      console.log("i am wrapper");
      return;
    }

    // setTimeout(() => {
      !resizerEl && (resizerEl = document.querySelector(`.gjs-resizer-c`));
      if (resizerEl) {
        resizerEl.style.display = "unset";
        console.log("resizer exist");

        resizerEl.style.cssText = `
      display:block!important;
      `;
        editor.Canvas.getResizerEl().appendChild(resizerEl);
      } else if (!document.querySelector(`.gjs-resizer-c`) && resizerEl) {
        console.log("resizer not exist");
        editor.Canvas.getResizerEl().appendChild(resizerEl);
        resizerEl.style.display = "block";
      }
      console.log(
        `resizer el ":`,
        document.querySelector(`.gjs-resizer-c`),
        resizerEl
      );
    // }, 0);
    // console.log("resizer element : ", editor.Canvas.getResizerEl());
    // console.log(
    //   "resizer children html : ",
    //   editor.Canvas.getResizerEl().innerHTML
    // );
    // console.log(
    //   "resizer children els : ",
    //   children,
    //   sle.getEl().__trackedListeners
    // );
    // editor.Canvas.getResizerEl().insertAdjacentHTML(
    //   "beforeend",
    //   `<div class="gjs-resizer-c" style="display: block;"><i class="gjs-resizer-h gjs-resizer-h-tl" data-gjs-handler="tl"></i><i class="gjs-resizer-h gjs-resizer-h-tc" data-gjs-handler="tc"></i><i class="gjs-resizer-h gjs-resizer-h-tr" data-gjs-handler="tr"></i><i class="gjs-resizer-h gjs-resizer-h-cl" data-gjs-handler="cl"></i><i class="gjs-resizer-h gjs-resizer-h-cr" data-gjs-handler="cr"></i><i class="gjs-resizer-h gjs-resizer-h-bl" data-gjs-handler="bl"></i><i class="gjs-resizer-h gjs-resizer-h-bc" data-gjs-handler="bc"></i><i class="gjs-resizer-h gjs-resizer-h-br" data-gjs-handler="br"></i></div>`
    // );
    // editor.Canvas.refresh({all:true});
    // editor.refresh({tools:true})
    // editor.Canvas.removeSpots({
    //   component: sle,
    //   type: "resize",
    // });
    // editor.Canvas.addSpot({
    //   component: sle,
    //   type: "resize",
    // });
    // sle.set("resizable", {
    //   tl: 0, // Top-left
    //   tc: 0, // Top-center
    //   tr: 0, // Top-right
    //   cl: 0, // Center-left
    //   cr: 1, // Center-right
    //   bl: 0, // Bottom-left
    //   br: 0, // Bottom-right
    //   bc: 0, // Bottom-center
    //   minDim: 20, // Minimum dimension
    //   step: 0.2, // Resize step
    // });

    // editor.Canvas.getCanvasView().updateFrames();
    // editor.refresh();
  });
  // editor.on('component:resize', (component) => {
  //   const { width, height } = component.getStyle();
  //   component.setStyle({ width, height }); // Ensure model is updated
  //   component.view.render(); // Rerender component view
  // });
};
