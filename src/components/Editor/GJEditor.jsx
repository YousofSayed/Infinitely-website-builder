import { Editor } from "@grapesjs/react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
// import  "../../helpers/grapesjs.js";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  blocksStt,
  currentDynamicTemplateIdState,
  currentElState,
  dynamicTemplatesState,
  ruleState,
  selectorState,
} from "../../helpers/atoms";
import { blocks } from "../../Blocks/blocks.jsx";
// import gStyles from "../../../styles/style.css?raw";

import { useLocation, useNavigate } from "react-router-dom";
import { addDevices } from "../../plugins/addDevices";
import { customModal } from "../../plugins/cutomModal";
import { addNewTools } from "../../plugins/addNewTools.jsx";
import { addNewBuiltinCommands } from "../../plugins/addNewBuiltinCommands.jsx";
import { customCmps } from "../../plugins/customCmps.jsx";
import { html } from "../../helpers/cocktail.js";
import { IDB } from "../../plugins/IDB";
import { updateProjectThumbnail } from "../../plugins/updateProjectThumbnail.js";
import { customInfinitelySymbols } from "../../plugins/customInfinitelySymbols";
import { updateDynamicTemplates } from "../../plugins/updateDynamicTemplates.js";
import { current_symbol_id } from "../../constants/shared.js";
import { cloneDeep } from "lodash";
import {
  getInfinitelySymbolInfo,
  getProjectSettings,
  preventSelectNavigation,
} from "../../helpers/functions.js";
import { muatationDomElements } from "../../plugins/mutation.js";
import { isChrome } from "../../helpers/bridge.js";
import { motionsRemoverHandler } from "../../plugins/motionsRemoverHandler.js";
import { motionsCloneHandler } from "../../plugins/motionsCloneHandler.js";
import { globalTraits } from "../../plugins/globalTraits.jsx";
import { useSetClassForCurrentEl } from "../../hooks/useSetclassForCurrentEl.js";
import { toast } from "react-toastify";
import { handleComponentsOnCreate } from "../../plugins/handleComponentsOnCreate.js";
import { initTraitsOnRender } from "../../plugins/initTraitsOnRender.jsx";

export const GJEditor = memo(({ children }) => {
  const setSelectedEl = useSetRecoilState(currentElState);
  // const [cmdsContext, setCmdsContext] = useCmdsContext();
  const setSelector = useSetRecoilState(selectorState);
  const setRule = useSetRecoilState(ruleState);
  const navigate = useNavigate();
  // const currentDynamicTemplateId = useRecoilValue(
  //   currentDynamicTemplateIdState
  // );
  // const dynamicTemplates = useRecoilValue(dynamicTemplatesState);
  // const setStyle = useSetClassForCurrentEl();
  const [plugins, setPlugins] = useState([
    // customColors,
    customCmps,
    addDevices,
    customModal,
    addNewTools,
    addNewBuiltinCommands,
    IDB,
    updateProjectThumbnail,
    customInfinitelySymbols,
    // updateDynamicTemplates,
    // motionsRemoverHandler,
    motionsCloneHandler,
    globalTraits,
    initTraitsOnRender,
    // handleComponentsOnCreate,
    // selectionPreventer,
    // muatationDomElements,
  ]);

  const onEditor = useCallback(
    /**
     *
     * @param {import('grapesjs').Editor} ev
     */
    async (ev) => {
      //  const types = editor.DomComponents.getTypes();

      //   types.forEach((cy) => {
      //     editor.DomComponents.addType(cy.id, {
      //       model: {
      //         defaults: {
      //           dropabble: true,
      //         },
      //       },
      //     });
      //   });
      ev.Blocks.categories.add({ id: "others", title: "Others" });

      const editor = ev;

      ev.runCommand("core:component-outline");
      isChrome(() => {
        editor.on("canvas:frame:load", ({ window, el }) => {
          /**
           * @type {HTMLIFrameElement}
           */
          const iframe = el;

          if (iframe.hasAttribute("src")) return;
          iframe.setAttribute("referrerpolicy", "same-origin unsafe-url");
          iframe.setAttribute("src", "about:srcdoc");
          console.log("iframe work: ", iframe);
        });
      });

      ev.on("component:deselected", () => {
        setSelectedEl({ currentEl: undefined });
      });

      ev.on("component:selected", () => {
        const selectedEl = ev.getSelected();
        const symbolInfo = getInfinitelySymbolInfo(selectedEl);
        // selectedEl.set({ resizable: false });
        setSelectedEl({ currentEl: JSON.parse(JSON.stringify(selectedEl)) }); //Fuck bug which make me like a crazy was fucken here , and it was because i set Dom Element in atom , old Code : selectedEl?.getEl()
        setRule({ is: false, ruleString: "" });

        // const location = window.location;

        setSelector("");
        if (symbolInfo.isSymbol) {
          sessionStorage.setItem(current_symbol_id, symbolInfo.mainId);
        } else {
          sessionStorage.removeItem(current_symbol_id);
        }
        const projectSettings = getProjectSettings().projectSettings;
        if (projectSettings.navigate_to_style_when_Select) {
          navigate("/edite/styling");
        }
      });

      // ev.on("component:cmds:update", () => {
      //   console.log("updateeeeeeeeeeeeeeeeeeeeeee 89");
      //   const sle = ev.getSelected();
      //   if (!sle) {
      //     console.warn("No Selected Component");
      //     return;
      //   } else {
      //     setCmdsContext(sle);
      //   }
      // });

      ev.on("redo", (args) => {
        // ev.trigger("component:style:update", {
        //   currentDynamicTemplateId,
        //   dynamicTemplates,
        // });
        setSelectedEl({
          currentEl: JSON.parse(JSON.stringify(editor.getSelected() || {})),
        });
      });

      ev.on("undo", (args) => {
        // ev.trigger("component:style:update", {
        //   currentDynamicTemplateId,
        //   dynamicTemplates,
        // });
        setSelectedEl({
          currentEl: JSON.parse(JSON.stringify(editor.getSelected() || {})),
        });
      });

      // ev.on("canvas:dragover", (eve) => {
      //   /**
      //    *
      //    * @param {import('grapesjs').Component} el
      //    */
      //   const getSymbol = (el) => {
      //     ev.mySymbol = el;
      //   };
      //   getSymbol(ev.DomComponents.getById(eve.target.id));
      // });
    },
    [plugins]
  );
  console.log('gj-editor : ' , getProjectSettings().projectSettings);
  
  return (
    <Editor
      grapesjs={grapesjs}
      options={{
        height: "100%",
        width: "100%",
        multipleSelection: true,
        // avoidDefaults: true,
        // nativeDnD:true,
        // showToolbar:true,
        showOffsets: true,
        keepUnusedStyles: true,
        clearStyles: false,
        
        // stylePrefix:'inf-',
        forceClass: true,
        // canvasCss: gStyles,

        // pageManager: {
        //   // selected: "index",

        //   pages: ,
        // },
        // exportWrapper: true,
        domComponents:{ escapeHtml: false},
        richTextEditor: {
          custom: true,
          // adjustToolbar:
          toolbar: [],
        },
        optsHtml: {
          // attributes: true,
          // keepInlineStyle: true,
          // altQuoteAttr: true,

          withProps: true,
          // asDocument: true,
        },
        optsCss: {
          keepUnusedStyles: true,
          clearStyles: false,
          onlyMatched: false,
        },
        autorender: true,
        
        parser: {
          optionsHtml: {
            
            allowScripts: true,
            // detectDocument: true,
            allowUnsafeAttr: true,

            allowUnsafeAttrValue: true,

            htmlType: "text/html",
          },
        },
        showOffsetsSelected: true,
        customUI: true,
        // showToolbar: true,
        // pStylePrefix:'inf',
        storageManager: {
          autoload: true,
          autosave: getProjectSettings().projectSettings.enable_auto_save,
          type: "infinitely",
        },
        panels: { defaults: [] },
        blockManager: {
          // appendTo: "#blocks",

          blocks: blocks,
          custom: true,
        },
        telemetry: false,

        keymaps: {
          defaults: {
            // 'core:undo': '', // Unbind Ctrl+Z
            // 'core:redo': '', // Unbind Ctrl+Y
          },
        },
        protectedCss: ``,
        // customUI: true,
        // headless:true,
        // autorender: false,
        // plugins:[mutationPlugin],
        canvas: {
          // frameContent: (canvas) => {
          //   const html = canvas.getHtml();
          //   const css = canvas.getCss();
          //   const fullHtml = `
          //     <!DOCTYPE html>
          //     <html>
          //     <head>
          //       <style>${css}</style>
          //     </head>
          //     <body>
          //       ${html}
          //     </body>
          //     </html>
          //   `;
          //   const blob = new Blob([fullHtml], { type: 'text/html' });
          //   canvas.getFrame().setAttribute('src', URL.createObjectURL(blob));
          // },
          scripts: [
            ...((isChrome() && [
              { src: `/scripts/initSw.js`, name: "initSw.js" },
            ]) ||
              []),
            // {src:`${jsToDataURL(`console.log('data js url.............@')`)}`}
          ],
          styles: ["/styles/dev.css" , "/styles/style.css"],

          customBadgeLabel:
            /**
             *
             * @param {import('grapesjs').Component} cmp
             */
            (cmp) => {
              const symbolInfo = getInfinitelySymbolInfo(cmp);
              return html`
                <figure
                  id="inf-badge"
                  class="flex gap-2 items-center p-1 w-full ${symbolInfo.isSymbol
                    ? "bg-[var(--symbol-color-hover)]"
                    : "bg-blue-600"}  "
                >
                  ${cmp.getIcon()}
                  <figcaption class="text-white font-semibold ">
                    ${cmp.getName()}
                  </figcaption>
                </figure>
              `;
            },
          // allowExternalDrop: true,
          // notTextable
          // extHl: true,
          // infiniteCanvas:true,
          // scripts: [
          //   { src: "/scripts/hyperscript@0.9.13.js", dev: true },
          //   { src: "/scripts/proccesNodeInHS.js", dev: true },
          // ],
          // styles: [{ href: "/styles/style.css" }],
        },
        jsInHtml: true,
        plugins,
      }}
      onEditor={onEditor}
    >
      {children}
    </Editor>
  );
});
