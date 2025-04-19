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
import gStyles from "../../../public/styles/style.css?raw";

import { useLocation, useNavigate } from "react-router-dom";
import { addDevices } from "../../plugins/addDevices";
import { customModal } from "../../plugins/cutomModal";
import { addNewTools } from "../../plugins/addNewTools.jsx";
import { addNewBuiltinCommands } from "../../plugins/addNewBuiltinCommands.jsx";
import { customCmps } from "../../plugins/customCmps.jsx";
import { html } from "../../helpers/cocktail.js";
import { IDB } from "../../plugins/IDB.js";
import { updateProjectThumbnail } from "../../plugins/updateProjectThumbnail.js";
import { customInfinitelySymbols } from "../../plugins/customInfinitelySymbols.js";
import { updateDynamicTemplates } from "../../plugins/updateDynamicTemplates.js";
import { useGlobalSettings } from "../../hooks/useGlobalSettings.js";
import { current_symbol_id } from "../../constants/shared.js";
import { cloneDeep } from "lodash";
import { getProjectSettings } from "../../helpers/functions.js";
import { muatationDomElements } from "../../plugins/mutation.js";
import { isChrome } from "../../helpers/bridge.js";
// import { infinitelyGrapesjs } from "../../helpers/backbonePacher.js";

export const GJEditor = memo(({ children }) => {
  const setBlocksAtom = useSetRecoilState(blocksStt);
  const setSelectedEl = useSetRecoilState(currentElState);
  const editorRef = useRef();
  // const blocks = useRecoilValue(blocksStt);
  const { globalSettings, setGlobalSetting } = useGlobalSettings();
  // const [cmdsContext, setCmdsContext] = useCmdsContext();
  const setSelector = useSetRecoilState(selectorState);
  const setRule = useSetRecoilState(ruleState);
  const navigate = useNavigate();
  const currentDynamicTemplateId = useRecoilValue(
    currentDynamicTemplateIdState
  );
  const setDynamicTemplates = useSetRecoilState(dynamicTemplatesState);
  const dynamicTemplates = useRecoilValue(dynamicTemplatesState);
  const location = useLocation();
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
    updateDynamicTemplates,
    muatationDomElements,
  ]);

  useEffect(() => {}, []);

  const onEditor = useCallback(
    /**
     *
     * @param {import('grapesjs').Editor} ev
     */
    async (ev) => {
      ev.Blocks.categories.add({ id: "others", title: "Others" });
      // setBlocksAtom({
      //   ...await handleCustomBlock(ev.Blocks.getAll().models.map(block=>block.attributes), ev),
      //   // symbols: [],
      // });
      // ev.on("load", () => {
      //   console.log("csss ruuuules", ev.CssComposer.getAll().models);
      // });
      const editor = ev; // Assuming 'ev' is your GrapesJS editor instance
      // editor.on("canvas:frame:load:body", ({window}) => {
      //   console.log("Editor loaded, attempting to override document.write");

      //   // Get the canvas iframe element
      //   // const iframe = editor.Canvas.getFrameEl();
      //   // if (!iframe) {
      //   //   console.error("No iframe found in Canvas.getFrameEl()");
      //   //   return;
      //   // }

      //   console.log('wdsads' , window);
      //   /**
      //    * @type {Document}
      //    */
      //   const doc = window.document;

      //   // iframe.setAttribute('sandbox' , '')
      //   // console.log(editor.Canvas.getDocument().readyState , 'state');
      //   console.error(doc.readyState , 'state');
      //   doc.addEventListener('DOMContentLoaded',()=>{
          
      //     console.error(doc.readyState , 'state ev');
      //   })
        
      // });

        editor.on('load', ({ window }) => {
          // const iframeDoc = window.document;
        //  isChrome((bool)=>{
        //   console.error('chrome');
          
        //    editor.Canvas.getFrameEl().srcdoc = 'about:blank'
        //    editor.Canvas.getFrameEl().sandbox = 'allow-same-origin allow-scripts'
        //  })
          // Set base URL
          
      });

      ev.on("storage:end:store", () => {});
      // setCmdsContext();
      ev.runCommand("core:component-outline");
      // blocks.forEach(block=>{
      //   ev.Blocks.add(block.id , block)

      // })
      // ev.on(
      //   "block:add",
      //   /**
      //    *
      //    * @param {import('grapesjs').Block} block
      //    */
      //   async (block) => {
      //     if (!block.attributes.category || !block.attributes.category.id) {
      //       block.attributes.category = "others";
      //     }
      //     const handledBlocks = await handleCustomBlock(ev.Blocks.getAll().models.map(block=>block.attributes), ev);
      //     setBlocksAtom((old) => ({
      //       ...old,
      //       ...handledBlocks,
      //     }));
      //   }
      // );

      // ev.on("storage:end:load", () => {
      //   // const cmps = ev.getComponents().models;
      //   // cmps.forEach((cmp) => {
      //   // });
      // });
      // setCmdsContext(); //cmp

      ev.on("component:deselected", () => {
        setSelectedEl({ currentEl: undefined });
      });

      ev.on("component:selected", () => {
        const selectedEl = ev.getSelected();
      
        
        setSelectedEl({ currentEl: selectedEl?.getEl() });
        setRule({ is: false, ruleString: "" });

        console.log(
          "is Main Symbol ? :",
          ev.Components.getSymbolInfo(ev.getSelected()).isMain
        );

        const location = window.location;
        const isBlockedNavigatedPath =
          location.pathname.includes("traits") ||
          location.pathname.includes("commands");
        console.log(
          isBlockedNavigatedPath,
          location.pathname,
          window.location.pathname
        );
        setSelector("");
        sessionStorage.removeItem(current_symbol_id);
        const projectSettings = getProjectSettings().projectSettings;
        if (projectSettings.navigate_to_style_when_Select) {
          navigate("/edite/styling");
        }
        // console.log((!isBlockedNavigatedPath ||
        //   !projectSettings.navigate_to_style_when_Select) , getProjectSettings().projectSettings.navigate_to_style_when_Select);

        // (!isBlockedNavigatedPath ||
        //   !projectSettings.navigate_to_style_when_Select) &&
        //   navigate("/edite/styling");
      });

      ev.on("component:cmds:update", () => {
        console.log("updateeeeeeeeeeeeeeeeeeeeeee 89");
        const sle = ev.getSelected();
        if (!sle) {
          console.warn("No Selected Component");
          return;
        } else {
          setCmdsContext(sle);
        }
      });

      ev.on("redo", (args) => {
        ev.trigger("component:style:update", {
          currentDynamicTemplateId,
          dynamicTemplates,
        });
        setSelectedEl({ currentEl: ev?.getSelected()?.getEl() });
      });

      ev.on("undo", (args) => {
        ev.trigger("component:style:update", {
          currentDynamicTemplateId,
          dynamicTemplates,
        });
        setSelectedEl({ currentEl: ev?.getSelected()?.getEl() });
      });

      ev.on("canvas:dragover", (eve) => {
        /**
         *
         * @param {import('grapesjs').Component} el
         */
        const getSymbol = (el) => {
          ev.mySymbol = el;
        };
        getSymbol(ev.DomComponents.getById(eve.target.id));
      });
    },
    [plugins, dynamicTemplates, currentDynamicTemplateId]
  );

  // useEffect(()=>{
  //   return ()=>{
  //     editorRef.current.destroy()
  //   }
  // },[])

  return (
    <Editor
      grapesjs={grapesjs}
      options={cloneDeep({
        height: "100%",
        width: "100%",
        multipleSelection: true,
        // avoidDefaults: true,
        showOffsets: true,
        keepUnusedStyles: true,
        clearStyles: false,
        // stylePrefix:'inf-',
        forceClass: true,
        canvasCss: gStyles,

        // pageManager: {
        //   // selected: "index",

        //   pages: ,
        // },
        // exportWrapper: true,
        optsHtml: {
          // attributes: true,
          keepInlineStyle: true,
          altQuoteAttr: true,

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
            detectDocument: true,
            // preParser:
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
          autosave: true,
          type: "infinitely",
        },
        panels: { defaults: [] },
        blockManager: {
          // appendTo: "#blocks",

          blocks: blocks,
          custom: true,
        },
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
          scripts: [
            // { src: `/scripts/initSw.js`, name: "initSw.js" },
            // {src:`${jsToDataURL(`console.log('data js url.............@')`)}`}
          ],
          styles: [],

          customBadgeLabel:
            /**
             *
             * @param {import('grapesjs').Component} cmp
             */
            (cmp) => {
              return html`
                <figure class="flex gap-2 items-center p-1 w-full bg-blue-600">
                  ${cmp.getIcon()}
                  <figcaption class="text-slate-200 font-semibold ">
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
      })}
      onEditor={onEditor}
    >
      {children}
    </Editor>
  );
});
