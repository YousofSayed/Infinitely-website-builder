import React from "react";
import { createSymbolTool } from "./tools/createSymbolTool";
import { createReusableCmpTool } from "./tools/createReusableCmpTool";
import { mountAppTool } from "./tools/mountAppTool";
import { createDynamicTemplate } from "./tools/createDynamicTemplate";
import { addClickClass, css, html } from "../helpers/cocktail";
import {
  doActionAndPreventSaving,
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
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";

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
  // editor.on("component:update", (update) => {
  //   console.log("update", update, editor.getDirtyCount());
  // });

  editor.on(
    "component:create",
    /**
     *
     * @param {import('grapesjs').Component} model
     */
    (model) => {
      // console.log("component create : ", model);
      if (model.get("type") == "wrapper") return;
      const props = model.props();
      if (props.droppable && model.components().length == 0) {
        console.log("component create droppp: ", model);
        doActionAndPreventSaving(
          editor,
          () => {
            model.addClass(["drop"]);
          },
          { decreaseSteps: true }
        );
      }
    }
  );

  editor.on(
    "component:add",
    /**
     *
     * @param {import('grapesjs').Component} model
     */
    (model) => {
      if (!model) return;
      const parent = model.parent();
      if (!parent) return;
      if (parent.get("type") == "wrapper") return;
      const modelClasses = [...parent.getClasses()];
      // console.log(
      //   "mod",
      //   modelClasses,
      //   parent.components().length > 1,
      //   modelClasses.includes("drop")
      // );

      if (modelClasses.includes("drop")) {
        console.log("mod 2", modelClasses);
        doActionAndPreventSaving(
          editor,
          (ed) => {
            parent.removeClass(["drop"]);
          },
          { decreaseSteps: true }
        );
      }

      // console.log(model.parent(), editor.getDirtyCount(), "from adder after");
    }
  );

  editor.on(
    "component:update:components",
    /**
     *
     * @param {import('grapesjs').Component} model
     */
    (model) => {
      if (!model) {
        console.warn("no model!!");
        return;
      }
      if (model.get("type") == "wrapper") return;
      const props = model.props();
      if (props.droppable && !model.components().length) {
        model.addClass(["drop"]);
      }
    }
  );

  editor.on(
    "component:remove",
    /**
     *
     * @param {import('grapesjs').Component} model
     */
    (model) => {
      // console.log(model.parent(), editor.getDirtyCount(), "from remover out");
      if (!model) return;
      const parent = model.parent();
      if (!parent) return;
      if (parent.get("type") == "wrapper") return;
      // const modelClasses = [...parent.getClasses()];
      // console.log(
      //   "mod",
      //   modelClasses,
      //   parent.components().length > 1,
      //   modelClasses.includes("drop")
      // );

      if (parent.components().length === 0 && parent.props().droppable) {
        // console.log(
        //   model.parent(),
        //   editor.getDirtyCount(),
        //   "from remover inside"
        // );
        // console.log("mod 2", modelClasses);
        doActionAndPreventSaving(
          editor,
          (ed) => {
            parent.addClass(["drop"]);
          }
          // { decreaseSteps: true }
        );
      }

      // console.log(model.parent(), editor.getDirtyCount(), "from remover after");
    }
  );

  // editor.on(
  //   "component:drag",
  //   /**
  //    *
  //    * @param {{parent : import('grapesjs').Component , target : import('grapesjs').Component}} param0
  //    */
  //   ({ parent, target }) => {
  //     if (!parent || !target) {
  //       console.warn("No Component here");
  //       return;
  //     }
  //     const parentOfParent = parent.parent();
  //     if (parent.get("type") != "wrapper") {

  //       doActionAndPreventSaving(
  //         editor,
  //         () => {
  //           parent.addClass("p-10");
  //         },
  //         { decreaseSteps: true }
  //       );
  //     }

  //     if (parentOfParent && parentOfParent.get('type') =='wrapper' )return;
  //   }
  // );

  // editor.on('component:update:components',
  //   /**
  //    *
  //    * @param {import('grapesjs').Component} model
  //    */
  //   (model)=>{
  //   console.log('cmp mount' , model , model.components().models.length , model.props().droppable);
  //   if(!model.components().models.length && model.props().droppable){
  //     model.components({type:'drop-area'})
  //   }
  // })

  // editor.on(
  //   "component:update:components",
  //   /**
  //    *
  //    * @param {import('grapesjs').Component} model
  //    * @param {import('grapesjs').Components} comps
  //    * @param {{}} opts
  //    */
  //   (model) => {
  //     console.log("update cmp : ", model);
  //     if (!model.components().models.length) {
  //       model.components({ type: "drop-area" });
  //       console.log("model setted : ", model);
  //     }
  //     return;
  //     if (model.get("type") == "wrapper") return;
  //     console.log(model, comps, opts);

  //     if (!comps.models.length) {
  //       const props = model.props();
  //       const isDroppable = props.droppable;
  //       if (isDroppable) {
  //         model.components({
  //           type: "drop-area",
  //         });
  //       }
  //     }
  //   }
  // );

  // editor.on(
  //   "component:add",
  //   /**
  //    *
  //    * @param {import('grapesjs').Component} cmp
  //    */
  //   (cmp) => {
  //     const parent = cmp.parent();
  //     console.log('classes  :' ,parent.getClasses());

  //     if (parent.getClasses().includes("p-10")) {
  //       console.log("From padding remover", cmp);
  //       parent.removeClass("p-10", {});
  //     }
  //   }
  // );

  let scrollTimeout,
    isScrollValue = false;
  editor.on(
    "canvas:frame:load:body",
    /**
     *
     * @param {{window:Window}} param0
     */
    ({ window }) => {
      console.log("loaded from scroller");
      const canvasDoc = editor.Canvas.getDocument();
      const wrapperEl = editor.getWrapper().getEl();
      const canvasBody = editor.Canvas.getBody();
      const scrollCallback = (ev) => {
        console.log('scroll call back');
        // alert('jhahahahahahaahahahaaahahaa')
        editor.trigger("canvas:frame:scroll", {
          window,
          isScroll: true,
        });
        scrollTimeout && clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          editor.trigger("canvas:frame:scroll:stop", {
            window,
            isScroll: false,
          });
        }, 200);
      };
      console.log("canvasDoc, canvasBody, wrapperEl", canvasDoc, canvasBody, wrapperEl);
      // editor.Canvas.get 
      // if (!(canvasDoc && canvasBody && wrapperEl)) {
      //   console.error("no canvas doc or body or wrapper");
      //   return;
      // }
      // canvasDoc.documentElement.style.contain = `paint layout size`;
        const scrollTarget = canvasDoc.scrollingElement || canvasDoc.documentElement;
      canvasBody.style.overflow = "auto";
      canvasDoc.documentElement.style.overflow = "auto";
      canvasDoc.scrollingElement.style.overflow = "auto";
      // scrollTarget.addEventListener("scroll", scrollCallback,{passive:true});
      // canvasDoc.documentElement.addEventListener("scroll", scrollCallback,{passive:true});
      // canvasDoc.scrollingElement.addEventListener("scroll", scrollCallback,{passive:true});
      // window.document.addEventListener("scroll", scrollCallback,{passive:true});
      canvasDoc.removeEventListener("scroll", scrollCallback,{passive:true});
      wrapperEl.removeEventListener("scroll", scrollCallback , {passive:true});
      canvasBody.removeEventListener("scroll", scrollCallback , {passive:true});

      canvasDoc.addEventListener("scroll", scrollCallback,{passive:true});
      wrapperEl.addEventListener("scroll", scrollCallback , {passive:true});
      canvasBody.addEventListener("scroll", scrollCallback , {passive:true});
    }
  );

//   editor.on("load", () => {
//   const frameEl = editor.Canvas.getFrameEl(); // iframe element
//   const doc = frameEl.contentDocument || frameEl.contentWindow.document;

//   // the container that actually scrolls
//   const scrollContainer = doc.scrollingElement || doc.documentElement;

//   scrollContainer.addEventListener("scroll", (e) => {
//     console.log("Canvas scrolled", {
//       scrollTop: scrollContainer.scrollTop,
//       scrollLeft: scrollContainer.scrollLeft,
//     });
//   });
// });


  editor.on("canvas:frame:scroll", ({ window, isScroll }) => {
    // console.log("is scrollll : ", isScroll , window);
    isScrollValue = isScroll;
    editor.Canvas.getBody().classList.add("preventWhenScroll");
  });

  editor.on("canvas:frame:scroll:stop", ({ window, isScroll }) => {
    // console.log("is scrollll stop: ", isScroll);
    isScrollValue = isScroll;
    editor.Canvas.getBody().classList.remove("preventWhenScroll");
  });

  editor.on(
    "component:hovered",
    /**
     *
     * @param { import('grapesjs').Component } component
     */
    (component) => {
      if (!component) return;
      if (isScrollValue) {
        return
      };
      try {
        // const trg = component && component.getEl();
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
        if (badgeEl && highlighter && component && symbolInfo.isSymbol) {
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
    const sles = editor.getSelectedAll();
    const symbolInfo = getInfinitelySymbolInfo(sle);

    if (sles.length > 1 && symbolInfo.isSymbol) {
      editor.selectRemove(sle);
      toast.warn(
        <ToastMsgInfo msg={`Symbols not allowd in multi selections`} />
      );
    }

    // editor.config.multipleSelection
    sle.get("type") == "svg" && sle.set({ resizable: true });
    const sleProps = sle.props();
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
    // const displayVal = isParentFlexOrGrid();
    // if (!sleProps.resizable) return;
    // if (displayVal.isFlex || displayVal.isGrid) return;
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
    // console.log("after set resizer element : ", sle.getEl());

    // interacter = interact(sle.getEl(), {
    //   context: editor.Canvas.getWindow().document,
    // });

    // interacter.resizable({
    //   // resize from all edges and corners
    //   edges: { left: true, right: true, bottom: true, top: true },

    //   listeners: {
    //     start(event) {
    //       event.preventDefault();
    //       disableDragAndDrop(false, editor.getWrapper());
    //     },
    //     move(event) {
    //       console.log("moooooove");
    //       const target = event.target;
    //       event.preventDefault();
    //       if (editor.getSelected() != sle) return;
    //       disableDragAndDrop(false, editor.getWrapper());

    //       styleInfInstance.emit(InfinitelyEvents.style.set, {
    //         cssProp: ["width", "height"],
    //         value: [`${event.rect.width}px`, `${event.rect.height}px`],
    //       });

    //       // event.stopPropagation();
    //     },
    //     end(event) {
    //       event.preventDefault();
    //       event.stopPropagation();
    //       disableDragAndDrop(true, editor.getWrapper());
    //       preventSelectNavigation(editor, sle);
    //       // editor.select(sle);
    //     },
    //   },
    //   modifiers: [
    //     // keep the edges inside the parent
    //     interact.modifiers.restrictEdges({
    //       outer: "parent",
    //     }),

    //     // minimum size
    //     interact.modifiers.restrictSize({
    //       min: { width: 100, height: 50 },
    //     }),
    //   ],

    //   inertia: true,
    // });
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
