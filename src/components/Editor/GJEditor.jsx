import { blocks } from "@/Blocks/blocks.jsx";
import { InfinitelyEvents } from "@/constants/infinitelyEvents.js";
import {
  current_symbol_id,
  DEV_SCRIPT_DEFINITIONS_BEFORE_HEADER_FOR_ALL,
  DEV_SCRIPT_DEFINITIONS_EXCLUDES_IN_EDITOR_FOR_HEADER,
} from "@/constants/shared.js";
import {
  cmpRulesState,
  currentElState,
  mediaConditionState,
  reloaderState,
  ruleState,
  selectorState,
  showUpdateDialogState,
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
import { getCachedComponentRules } from "@/helpers/rulesCache";
// import { useConsoleLogs } from "@/hooks/useConsoleFeeds";
import { useSettingsHandler } from "@/hooks/useSettingsHandler";
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
import React, { startTransition, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";

export const GJEditor = ({ children }) => {
  const setSelectedEl = useSetRecoilState(currentElState);
  const setSelector = useSetRecoilState(selectorState);
  const setRule = useSetRecoilState(ruleState);
  const navigate = useNavigate();

  const location = useLocation();
  const locationRef = useRef(location);
  locationRef.current = location;

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
  ]);

  /**
   * PERFORMANCE FIX:
   *
   * We still update currentElState.
   * But we avoid creating a new atom object if selected id did not change.
   *
   * This prevents useless Recoil updates.
   */
  const updateCurrentEl = useCallback(
    (id) => {
      setSelectedEl((prev) => {
        const prevId = prev?.currentEl?.id ?? "";
        const nextId = id || "";

        if (prevId === nextId) {
          return prev;
        }

        return {
          ...prev,
          currentEl: nextId ? { id: nextId } : undefined,
          currentElId: nextId,
        };
      });
    },
    [setSelectedEl],
  );

  /**
   *
   * @param {import('grapesjs').Editor} ev
   */
  const onEditor = (ev) => {
    const editor = ev;
    const idleCallback =
      window.requestIdleCallback ||
      function (cb) {
        return setTimeout(cb, 1);
      };

    const cancelIdleCallback =
      window.cancelIdleCallback ||
      function (id) {
        clearTimeout(id);
      };

    let rulesTimer = null;
    let rulesIdle = null;

    const scheduleRules = () => {
      clearTimeout(rulesTimer);

      if (rulesIdle) {
        cancelIdleCallback(rulesIdle);
        rulesIdle = null;
      }

      rulesTimer = setTimeout(() => {
        rulesIdle = idleCallback(
          () => {
            const sle = editor.getSelected();

            if (!sle) {
              setCmpRules([]);
              return;
            }

            const rules = getCachedComponentRules({
              editor,
              cmp: sle,
              cssCode: editor.getCss({
                keepUnusedStyles: true,
                avoidProtected: true,
              }),
            });
            // getComponentRules({
            //   editor,
            //   cmp: sle,
            //   cssCode: editor.getCss({
            //     keepUnusedStyles: true,
            //     avoidProtected: true,
            //   }),
            // });

            // setCmpRules(rules.rules || []);

            startTransition(() => {
              setCmpRules(rules.rules || []);
            });
          },
          { timeout: 300 },
        );
      }, 120);
    };

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

        iframe.setAttribute("src", "about:srcdoc");
        console.log("iframe work: ", iframe);
      });
    });

    /**
     * Deselection logic.
     * Keep same behavior, but avoid duplicate atom writes.
     */
    ev.on("component:deselected", () => {
      updateCurrentEl("");
      setCmpRules([]);
    });

    ev.on("component:selected", () => {
      const selectedEl = ev.getSelected();
      if (!selectedEl) return;

      const selectedId = selectedEl?.getId?.();
      const symbolInfo = getInfinitelySymbolInfo(selectedEl);

      /**
       * Keep currentElState update.
       */
      updateCurrentEl(selectedId);

      setRule({ is: false, ruleString: "" });
      setSelector("");

      /**
       * Rules are expensive.
       * Keep them inside requestAnimationFrame so selection UI is not blocked.
       */
      // requestAnimationFrame(() => {
      //   const rules = getComponentRules({
      //     editor,
      //     cmp: selectedEl,
      //     cssCode: editor.getCss({
      //       keepUnusedStyles: true,
      //       avoidProtected: true,
      //     }),
      //   });

      //   setCmpRules(rules.rules || []);
      // });
      scheduleRules();

      if (symbolInfo.isSymbol) {
        sessionStorage.setItem(current_symbol_id, symbolInfo.mainId);
      } else {
        sessionStorage.removeItem(current_symbol_id);
      }

      const projectSettings = getProjectSettings().projectSettings;

      /**
       * PERFORMANCE FIX:
       *
       * Do not navigate if already inside styling route.
       */
      if (
        projectSettings.navigate_to_style_when_Select &&
        locationRef.current.pathname !== "/edite/styling"
      ) {
        navigate("/edite/styling");
      }
    });

    ev.on(InfinitelyEvents.storage.loadStart, () => {
      // updateCurrentEl("");
      // setCmpRules([]);
      // setSelectedEl({
      //   currentEl: undefined,
      //   currentElId: undefined,
      // });
    });

    editor.on(InfinitelyEvents.ruleTitle.update, () => {
      // const selectedEl = ev.getSelected();
      // if (!selectedEl) return;

      // const rules = getComponentRules({
      //   editor,
      //   cmp: selectedEl,
      //   cssCode: editor.getCss({
      //     keepUnusedStyles: true,
      //     avoidProtected: true,
      //   }),
      // });

      // setCmpRules(rules.rules || []);
      scheduleRules();
    });

    /**
     * Keep undo/redo behavior.
     * But avoid duplicate currentElState writes.
     */
    ev.on("redo", () => {
      const sle = editor.getSelected();
      updateCurrentEl(sle?.getId?.());

      // if (!sle) {
      //   setCmpRules([]);
      //   return;
      // }

      // const rules = getComponentRules({
      //   editor,
      //   cmp: sle,
      //   cssCode: editor.getCss({
      //     keepUnusedStyles: true,
      //     avoidProtected: true,
      //   }),
      // });

      // setCmpRules(rules.rules || []);
      scheduleRules();
    });

    ev.on("undo", () => {
      const sle = editor.getSelected();
      updateCurrentEl(sle?.getId?.());

      // if (!sle) {
      //   setCmpRules([]);
      //   return;
      // }

      // const rules = getComponentRules({
      //   editor,
      //   cmp: sle,
      //   cssCode: editor.getCss({
      //     keepUnusedStyles: true,
      //     avoidProtected: true,
      //   }),
      // });

      // setCmpRules(rules.rules || []);
      scheduleRules();
    });

    // ev.on('canvas:frame:load:head' , (ev)=>{
    //   const document  = ev.window.document;
    //   const head = ev.window.document.head;
    //   for (const scriptDef of DEV_SCRIPT_DEFINITIONS_BEFORE_HEADER_FOR_ALL) {
    //     const script = document.createElement("script");
    //     Object.entries(scriptDef).forEach(([key, value]) => {
    //       script.setAttribute(key, value);
    //     });
    //     head.prepend(script);
    //   }
    // })

    // Assuming DEV_SCRIPT_DEFINITIONS_BEFORE_HEADER_FOR_ALL is in scope

editor.on("canvas:frame:load", (ev) => {
  const doc = ev.window.document;
  const head = doc.head;

  // 1. EARLY HOOK: The absolute first script. 
  // It executes synchronously and patches console before ANY user scripts run.
  const earlyScript = doc.createElement("script");
  earlyScript.innerHTML = `
    (() => {
      if (window.__infinitelyEarlyConsoleHook) return;
      
      window.__infinitelyEarlyConsoleHook = true;
      window.__earlyLogs = [];
      window.__consoleFeedActive = false;

      const methods = [
        "log", "info", "warn", "error", "debug", "table", "dir", "trace",
        "group", "groupCollapsed", "groupEnd", "clear", "count", "countReset",
        "assert", "time", "timeEnd", "timeLog"
      ];

      for (const method of methods) {
        const original = console[method];
        console[method] = function (...args) {
          // Only buffer if console-feed hasn't taken over yet
          if (!window.__consoleFeedActive) {
            window.__earlyLogs.push({ method, args });
          }
          return original.apply(console, args);
        };
      }
    })();
  `;
  
  // Prepend to ensure it's the first element in <head>
  head.prepend(earlyScript);

  // 2. YOUR CUSTOM SCRIPTS
  // Inject your dev scripts after the early hook but BEFORE GrapesJS injects user scripts
  for (const scriptDef of DEV_SCRIPT_DEFINITIONS_BEFORE_HEADER_FOR_ALL) {
    const script = doc.createElement("script");
    Object.entries(scriptDef).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });
    head.append(script);
  }

  // 3. CONSOLE-FEED LOADER
  // This module script loads asynchronously. Once ready, it takes over the console
  // and replays everything that was buffered by the early hook.
  const hookScript = doc.createElement("script");
  hookScript.type = "module";
  hookScript.innerHTML = `
    import { Hook } from "https://esm.sh/console-feed@latest";

    const sendToParent = (log) => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: "CONSOLE_LOG",
          from: "editor",
          payload: { ...log },
        }, "*");
      }
    };

    // Wrap the current console. 
    // Note: This wraps our early hook wrapper, creating a chain.
    Hook(window.console, (log) => sendToParent(log));
    
    // Tell the early hook to stop buffering logs to prevent memory leaks
    window.__consoleFeedActive = true;

    if (window.__earlyLogs && window.__earlyLogs.length > 0) {
      window.__earlyLogs.forEach((entry) => {
        // Replay early logs. Because console is now wrapped by Hook,
        // this will trigger the sendToParent callback AND print locally!
        if (console[entry.method]) {
          console[entry.method].apply(console, entry.args);
        }
      });
      window.__earlyLogs = [];
    }
    console.log("iframeLogs loaded ✨");
  `;
  
  head.appendChild(hookScript);
});
    
  };

  useSettingsHandler();
  // useConsoleLogs();

  return (
    <GjsEditor
      key={reloader}
      grapesjs={grapesjs}
      className="auto-animate"
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
        domComponents: { useFrameDoc: true },
        richTextEditor: {
          custom: true,
          toolbar: [],
        },
        optsCss: {
          keepUnusedStyles: true,
          clearStyles: false,
          onlyMatched: false,
        },
        parser: {
          optionsHtml: {
            allowScripts: true,
            allowUnsafeAttr: true,
            allowUnsafeAttrValue: true,
            keepEmptyTextNodes: true,
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
          defaults: {},
        },
        protectedCss: ``,
        canvas: {
          scripts: [
            ...((isChrome() && [
              { src: `/scripts/initSw.js`, name: "initSw.js" },
            ]) ||
              []),

            // ...DEV_SCRIPT_DEFINITIONS_EXCLUDES_IN_EDITOR_FOR_HEADER,
            // ...DEV_SCRIPT_DEFINITIONS_BEFORE_HEADER_FOR_ALL
          ],
          styles: [],
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
                    : "bg-brand-primary"}"
                >
                  ${cmp.getIcon()}
                  <figcaption class="text-white font-semibold">
                    ${cmp.getName()}
                  </figcaption>
                </figure>
              `;
            },
        },
      }}
      onEditor={onEditor}
    >
      {children}
    </GjsEditor>
  );
};
