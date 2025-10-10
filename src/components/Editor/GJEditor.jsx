import GjsEditor from "@grapesjs/react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
// import  "../../helpers/grapesjs.js";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  cmpRulesState,
  currentElState,
  reloaderState,
  ruleState,
  selectorState,
} from "../../helpers/atoms";
import { blocks } from "../../Blocks/blocks.jsx";
// import gStyles from "../../../styles/style.css?raw";

import { useNavigate } from "react-router-dom";
import { addDevices } from "../../plugins/addDevices";
import { customModal } from "../../plugins/cutomModal";
import { addNewTools } from "../../plugins/addNewTools.jsx";
import { addNewBuiltinCommands } from "../../plugins/addNewBuiltinCommands.jsx";
import { customCmps } from "../../plugins/customCmps.jsx";
import { html } from "../../helpers/cocktail.js";
import { IDB } from "../../plugins/IDB";
import { updateProjectThumbnail } from "../../plugins/updateProjectThumbnail.js";
import { customInfinitelySymbols } from "../../plugins/customInfinitelySymbols";
import { current_symbol_id } from "../../constants/shared.js";
import {
  getComponentRules,
  getInfinitelySymbolInfo,
  getProjectSettings,
} from "../../helpers/functions.js";
import { isChrome } from "../../helpers/bridge.js";
import { motionsAndInteractionsCloneHandler } from "../../plugins/motionsAndInteractionsCloneHandler.jsx";
import { globalTraits } from "../../plugins/globalTraits.jsx";
import { initTraitsOnRender } from "../../plugins/initTraitsOnRender.jsx";
import { editorKeymaps } from "../../plugins/editorKeymaps.jsx";

export const GJEditor = ({ children }) => {
  const setSelectedEl = useSetRecoilState(currentElState);
  // const [cmdsContext, setCmdsContext] = useCmdsContext();
  const setSelector = useSetRecoilState(selectorState);
  const setRule = useSetRecoilState(ruleState);
  const navigate = useNavigate();
  const [reloader, setReloader] = useRecoilState(reloaderState);
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);

  // const currentDynamicTemplateId = useRecoilValue(
  //   currentDynamicTemplateIdState
  // );
  // const dynamicTemplates = useRecoilValue(dynamicTemplatesState);
  // const setStyle = useSetClassForCurrentEl();
  const [plugins, setPlugins] = useState([
    customCmps,
    addDevices,
    customModal,
    addNewTools,
    addNewBuiltinCommands,
    motionsAndInteractionsCloneHandler,
    updateProjectThumbnail,
    customInfinitelySymbols,
    globalTraits,
    initTraitsOnRender,
    editorKeymaps,
    IDB,
    // customColors,
    // updateDynamicTemplates,
    // motionsRemoverHandler,
    // handleComponentsOnCreate,
    // selectionPreventer,
    // muatationDomElements,
  ]);

  /**
   *
   * @param {import('grapesjs').Editor} ev
   */
  const onEditor = (ev) => {
    const editor = ev;
    ev.Blocks.categories.add({ id: "others", title: "Others" });
    const lastDevice = localStorage.getItem("last-device");
    const lastDeviceJson = localStorage.getItem("last-device-json");
    if (lastDevice) editor.setDevice(lastDevice);
    if (lastDeviceJson) {
      editor.Devices.add(JSON.parse(lastDeviceJson));
    }
    ev.runCommand("core:component-outline");
    isChrome(() => {
      editor.on("canvas:frame:load", ({ window, el }) => {
        /**
         * @type {HTMLIFrameElement}
         */
        const iframe = el;

        if (iframe.hasAttribute("src")) return;

        // iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
        // iframe.setAttribute("referrerpolicy", "same-origin unsafe-url");
        iframe.setAttribute("src", "about:srcdoc");
        console.log("iframe work: ", iframe);
      });
    });
    //Go to SetClasses to complete ****
    ev.on("component:deselected", () => {
      setSelectedEl({ currentEl: undefined });
      setCmpRules([]);
    });

    ev.on("component:selected", () => {
      const selectedEl = ev.getSelected();
      const symbolInfo = getInfinitelySymbolInfo(selectedEl);
      // selectedEl.set({ resizable: false });
      setSelectedEl({ currentEl: JSON.parse(JSON.stringify(selectedEl)) }); //Fuck bug which make me like a crazy was fucken here , and it was because i set Dom Element in atom , old Code : selectedEl?.getEl()
      setRule({ is: false, ruleString: "" });
      const rules = getComponentRules({
        editor,
        // nested:true
        cmp: selectedEl,
        cssCode: editor.getCss({
          keepUnusedStyles: true,
          avoidProtected: true,
        }),
      });

      setCmpRules(rules.rules || []);
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
      setSelectedEl({
        currentEl: JSON.parse(JSON.stringify(editor.getSelected() || {})),
      });

      const rules = getComponentRules({
        editor,
        // nested:true
        cmp: editor.getSelected(),
        cssCode: editor.getCss({
          keepUnusedStyles: true,
          avoidProtected: true,
        }),
      });

      setCmpRules(rules.rules || []);
    });

    ev.on("undo", (args) => {
      setSelectedEl({
        currentEl: JSON.parse(JSON.stringify(editor.getSelected() || {})),
      });

      const rules = getComponentRules({
        editor,
        // nested:true
        cmp: editor.getSelected(),
        cssCode: editor.getCss({
          keepUnusedStyles: true,
          avoidProtected: true,
        }),
      });

      setCmpRules(rules.rules || []);
    });
  };
  console.log("gj-editor : ", getProjectSettings().projectSettings);

  return (
    <GjsEditor
      key={reloader}
      grapesjs={grapesjs}
      options={{
        height: "100%",
        width: "100%",
        multipleSelection: true,
        mediaCondition: localStorage.getItem("media-condition") || "max-width",
        showOffsets: true,
        keepUnusedStyles: true,
        clearStyles: false,
        keepEmptyTextNodes: true,
        avoidDefaults: true,
        // log: true,
        // fromElement: false,
        domComponents: { useFrameDoc: true },
        richTextEditor: {
          custom: true,
          // adjustToolbar:
          toolbar: [],
        },
        // optsHtml: {
        //   withProps: true,

        // },
        optsCss: {
          keepUnusedStyles: true,
          clearStyles: false,
          onlyMatched: false,
        },
        // autorender: true,

        parser: {
          // parserCss:(css)=>{
          //  return parse(css , {}).stylesheet.rules
          // },

          optionsHtml: {
            // preParser(input){
            //   return input
            // },
            allowScripts: true,
            allowUnsafeAttr: true,
            allowUnsafeAttrValue: true,
            keepEmptyTextNodes: true,
            // htmlType: "text/html",
          },
        },
        showOffsetsSelected: true,
        customUI: true,
        storageManager: {
          autoload: true,
          autosave: getProjectSettings().projectSettings.enable_auto_save,
          type: "infinitely",
        },
        panels: { defaults: [] },
        blockManager: {
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
        canvas: {
          scripts: [
            // {src:'/scripts/willChange.js' , name:'willChange.js'},
            ...((isChrome() && [
              { src: `/scripts/initSw.js`, name: "initSw.js" },
            ]) ||
              []),
            // {src:`${jsToDataURL(`console.log('data js url.............@')`)}`}
          ],
          styles: ["/styles/dev.css", "/styles/style.css"],

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
        },
        // jsInHtml: true,
        plugins,
      }}
      onEditor={onEditor}
    >
      {children}
    </GjsEditor>
  );
};
