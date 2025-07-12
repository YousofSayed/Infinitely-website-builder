import React from "react";
import { createSymbolTool } from "./tools/createSymbolTool";
import { createReusableCmpTool } from "./tools/createReusableCmpTool";
import { mountAppTool } from "./tools/mountAppTool";
import { createDynamicTemplate } from "./tools/createDynamicTemplate";
import { addClickClass, css, html } from "../helpers/cocktail";
import {
  getInfinitelySymbolInfo,
  getProjectSettings,
  initToolbar,
  isDynamicComponent,
  preventSelectNavigation,
} from "../helpers/functions";
import { unMountAppTool } from "./tools/unMountAppTool";
import { cloneDeep } from "lodash";
import { motionId } from "../constants/shared";
import { runGsapMotionTool } from "./tools/runGsapMotionTool";
import { killGsapMotionTool } from "./tools/killGsapMotion";
import interact from "interactjs";
import { Infinitely } from "../helpers/Infinitely";
import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { styleInfInstance } from "../constants/InfinitelyInstances";

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export const addNewTools = (editor) => {
  /**
   * @type {Interact.Interactable}
   */
  let interacter;

  /**
   *
   * @param {boolean} value
   * @param {import('grapesjs').Component} cmp
   */
  const disableDragAndDrop = (value = false, cmp) => {
    const props = cmp.props();
    cmp.set({
      ...props,
      draggable: value,
      droppable: value || false,
    });
    // editor.select()
    cmp.forEachChild((child) => disableDragAndDrop(value, child));
  };

  editor.on(
    "component:hovered",
    /**
     *
     * @param { import('grapesjs').Component } component
     */
    (component) => {
      try {
        const trg = component && component.getEl();
        const highlighter = document.querySelector(
          `.gjs-cv-canvas .gjs-highlighter`
        );
        const symbolInfo = getInfinitelySymbolInfo(component);
        /**
         * @type {HTMLElement | undefined}
         */
        const badgeEl = editor.Canvas.getBadgeEl();
        // component.getName();
        // console.log(
        //   "hover : ",
        //   badgeEl,
        //   editor.Canvas.getHighlighter(),
        //   document.querySelector(`.gjs-cv-canvas .gjs-highlighter`),
        //   editor.Canvas.getHighlighter(),
        //   component,
        //   trg
        // );
        if (badgeEl && highlighter && component && symbolInfo.isMain) {
          highlighter.classList.add("symbol-highlight");
          badgeEl.classList.add("badge-symbol-highlight");
        } else {
          badgeEl.classList.remove("badge-symbol-highlight");
          highlighter.classList.remove("symbol-highlight");
        }

        const toolbarEl = editor.Canvas.getToolbarEl();
        const top = toolbarEl.style.top;
        const newTopValue = `${toolbarEl.style.top + (top < 0 ? -5 : 5)}px`;
        toolbarEl.style.top = newTopValue;
      } catch (error) {
        throw new Error(error);
      }
    }
  );

  editor.on("component:selected", (cmp) => {
    const sle = editor.getSelected();
    sle.get("type") == "svg" && sle.set({ resizable: true });
    const sleProps = sle.props();
    const symbolInfo = getInfinitelySymbolInfo(sle);
    interacter && interacter.unset();
    console.log("done render");

    if (sle.is("wrapper")) {
      console.log("i am wrapper");
      return;
    }
    initToolbar(editor, sle);
    console.log("resizable sle :", sle.get("resizable"), sle.get("resizable"));
    console.log("props sle :", sleProps);
    editor.Canvas.getResizerEl() && editor.Canvas.getResizerEl().remove();
    const isParentFlexOrGrid = () => {
      const el = sle.parent().getEl();
      const cmStyles = window.getComputedStyle(el);
      const displayVal = cmStyles.display;
      return {
        isFlex: displayVal == "flex",
        isGrid: displayVal == "grid",
      };
    };
    const displayVal = isParentFlexOrGrid();
    if (!sleProps.resizable) return;
    if(displayVal.isFlex || displayVal.isGrid)return;
    // const resizerEl = editor.Canvas.getResizerEl();
    // resizerEl.innerHTML = html`<div
    //   class="gjs-resizer-c"
    //   style="display: block;"
    // >
    //   <i class="gjs-resizer-h gjs-resizer-h-tl" data-gjs-handler="tl"></i
    //   ><i class="gjs-resizer-h gjs-resizer-h-tc" data-gjs-handler="tc"></i
    //   ><i class="gjs-resizer-h gjs-resizer-h-tr" data-gjs-handler="tr"></i
    //   ><i class="gjs-resizer-h gjs-resizer-h-cl" data-gjs-handler="cl"></i
    //   ><i class="gjs-resizer-h gjs-resizer-h-cr" data-gjs-handler="cr"></i
    //   ><i class="gjs-resizer-h gjs-resizer-h-bl" data-gjs-handler="bl"></i
    //   ><i class="gjs-resizer-h gjs-resizer-h-bc" data-gjs-handler="bc"></i
    //   ><i class="gjs-resizer-h gjs-resizer-h-br" data-gjs-handler="br"></i>
    // </div>`;
    // const resizer = resizerEl.querySelector(`.gjs-resizer-c`);
    console.log("after set resizer element : ", sle.getEl());

    interacter = interact(sle.getEl(), {
      context: editor.Canvas.getWindow().document,
    });

    interacter.resizable({
      // resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },

      listeners: {
        start(event) {
          event.preventDefault();
          disableDragAndDrop(false, editor.getWrapper());
        },
        move(event) {
          console.log("moooooove");
          const target = event.target;
          event.preventDefault();
          if (editor.getSelected() != sle) return;
          disableDragAndDrop(false, editor.getWrapper());

          styleInfInstance.emit(InfinitelyEvents.style.set, {
            cssProp: ["width", "height"],
            value: [`${event.rect.width}px`, `${event.rect.height}px`],
          });

          // event.stopPropagation();
        },
        end(event) {
          event.preventDefault();
          event.stopPropagation();
          disableDragAndDrop(true, editor.getWrapper());
          preventSelectNavigation(editor, sle);
          // editor.select(sle);
        },
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: "parent",
        }),

        // minimum size
        interact.modifiers.restrictSize({
          min: { width: 100, height: 50 },
        }),
      ],

      inertia: true,
    });
  });

  editor.on(
    "component:deselected",
    /**
     *
     * @param {import('grapesjs').Component} cmp
     */
    (cmp) => {
      interacter && interacter.unset();
      console.log("cmp interactjs unseted");
    }
  );
};
