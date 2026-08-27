import gStyles from "../../../public/styles/style.css?raw";
import { blocks } from "@/Blocks/blocks.jsx";
import { InfinitelyEvents } from "@/constants/infinitelyEvents.js";
import { current_symbol_id } from "@/constants/shared.js";
import {
  cmpRulesState,
  currentElState,
  mediaConditionState,
  reloaderState,
  ruleState,
  selectorState,
} from "@/helpers/atoms";
import { isChrome } from "@/helpers/bridge.js";
import { html } from "@/helpers/cocktail.js";
import {
  getComponentRules,
  getCurrentStorageType,
  getInfinitelySymbolInfo,
  getProjectSettings,
  isNormal,
  isWordpress,
} from "@/helpers/functions";
import { useShortcuts } from "@/hooks/useShortcuts";
import { addDevices } from "@/plugins/addDevices";
import { addNewBuiltinCommands } from "@/plugins/addNewBuiltinCommands.jsx";
import { addNewTools } from "@/plugins/addNewTools.jsx";
import { customCmps } from "@/plugins/customCmps.jsx";
import { customInfinitelySymbols } from "@/plugins/customInfinitelySymbols";
import { customModal } from "@/plugins/cutomModal";
import { editorKeymaps } from "@/plugins/editorKeymaps.jsx";
import { globalTraits } from "@/plugins/globalTraits.jsx";
import { IDB } from "@/plugins/IDB";
import { infProps } from "@/plugins/infProps.jsx";
import { initTraitsOnRender } from "@/plugins/initTraitsOnRender.jsx";
import { motionsAndInteractionsCloneHandler } from "@/plugins/motionsAndInteractionsCloneHandler.jsx";
import { updateEditorStyleAfterTemplateOrBlockAdded } from "@/plugins/updateEditorStyleAfterTemplateOrBlockAdded.jsx";
import { updateProjectThumbnail } from "@/plugins/updateProjectThumbnail.jsx";
import { wp_remote_storage } from "@/plugins/wp_remote_storage.jsx";
import GjsEditor from "@grapesjs/react";
import grapesjs from "grapesjs";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";

const plugins = [
  infProps,
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
  ...(isNormal() ? [IDB] : isWordpress() ? [wp_remote_storage] : []),
  updateEditorStyleAfterTemplateOrBlockAdded,
  // customColors,
  // updateDynamicTemplates,
  // motionsRemoverHandler,
  // handleComponentsOnCreate,
  // selectionPreventer,
  // muatationDomElements,
];

export const GJEditor = ({ children }) => {
  const setSelectedEl = useSetRecoilState(currentElState);
  // const [cmdsContext, setCmdsContext] = useCmdsContext();
  const setSelector = useSetRecoilState(selectorState);
  const setRule = useSetRecoilState(ruleState);
  const navigate = useNavigate();
  const [reloader, setReloader] = useRecoilState(reloaderState);
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  const [mediaCond, setMediaCond] = useRecoilState(mediaConditionState);
  const plugins = useRef([
    infProps,
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
    ...(isNormal() ? [IDB] : isWordpress() ? [wp_remote_storage] : []),
    updateEditorStyleAfterTemplateOrBlockAdded,
    // customColors,
    // updateDynamicTemplates,
    // motionsRemoverHandler,
    // handleComponentsOnCreate,
    // selectionPreventer,
    // muatationDomElements,
  ]);

  // const currentDynamicTemplateId = useRecoilValue(
  //   currentDynamicTemplateIdState
  // );
  // const dynamicTemplates = useRecoilValue(dynamicTemplatesState);
  // const setStyle = useSetClassForCurrentEl();

  /**
   *
   * @param {import('grapesjs').Editor} ev
   */
  const onEditor = (ev) => {
    const editor = ev;
    ev.Blocks.categories.add({ id: "others", title: "Others" });
    setMediaCond(localStorage.getItem("media-condition") || "max-width");
    ev.runCommand("core:component-outline");
    isChrome(() => {
      editor.on("canvas:frame:load", ({ window, el }) => {
        /**
         * @type {HTMLIFrameElement}
         */
        const iframe = el;
        iframe.contentDocument.head.insertAdjacentHTML(
          `afterbegin`,
          `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
        );

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

    editor.on(InfinitelyEvents.ruleTitle.update, () => {
      const selectedEl = ev.getSelected();
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


  return (
    <GjsEditor
      key={reloader}
      grapesjs={grapesjs}
      options={{
        plugins: plugins.current,
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
        // baseCss:'body:{background:unset;}',

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
          type: getCurrentStorageType(),
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
                    : "bg-brand-primary"}  "
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
      }}
      onEditor={onEditor}
    >
      {children}
    </GjsEditor>
  );
};
