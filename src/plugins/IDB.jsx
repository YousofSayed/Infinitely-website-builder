import {
  current_dynamic_template_id,
  current_page_id,
  current_project_id,
  current_symbol_id,
  current_symbol_rule,
  current_template_id,
  inf_symbol_Id_attribute,
  mainScriptsForEditor,
} from "../constants/shared";
import { db } from "../helpers/db";
import {
  doDocument,
  extractAllRulesWithChildRules,
  getComponentRules,
  getDynamicComponent,
  getInfinitelySymbolInfo,
  getProjectData,
  getProjectSettings,
  initSymbolTimout,
  screenshotTimout,
  updatePrevirePage,
  workerCallbackMaker,
} from "../helpers/functions";
import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { changePageName } from "../helpers/customEvents";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { minify } from "csso";
import {
  chunkHtmlElements,
  defineRoot,
  getPageURLException,
} from "../helpers/bridge";

// import { initDBAssetsSw } from "../serviceWorkers/initDBAssets-sw";
import { opfs } from "../helpers/initOpfs";
import { updateThumbnailTimeout } from "./updateProjectThumbnail";
import { css_beautify } from "js-beautify";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";
import { parseHTML } from "linkedom";
import { isFunction } from "lodash";
// import LeakDetector from "jest-leak-detector";

let loadFooterScriptsCallback, loadHeadScriptsCallback, loadMainScriptsCallback;
let storeTimeout;
let pageBuilderTimeout;
let loadTimeout, appenderTimeout;
let currentPageName = localStorage.getItem(current_page_id);

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const IDB = (editor) => {
  const projectID = localStorage.getItem(current_project_id);
  const mainCreateObjectURLMethod = URL.createObjectURL;
  const willRevokedURLs = new Map();
  URL.createObjectURL = (obj) => {
    const url = mainCreateObjectURLMethod(obj);
    willRevokedURLs.set(url);
    return url;
  };
  let isLoadEnd = false,
    timesLoaded = 0;
  let tId;
  editor.infDirty = 0;
  // const detector = new LeakDetector(editor , {shouldGenerateV8HeapSnapshot:true});

  // editor.getDirtyCount = () => editor.infDirty;
  // editor.clearDirtyCount = () => (editor.infDirty = 0);
  const updateDirty = () => {
    editor.infDirty++;
  };
  // editor.on("update", updateDirty);

  // window.addEventListener("beforeunload", (e) => {
  //   // Check if there are unsaved changes
  //   if (editor.getDirtyCount() > 0) {
  //     e.preventDefault();
  //     e.returnValue = "Changes you made may not be saved!"; // This triggers the browser's native confirmation dialog
  //     return "";
  //   }
  // });

  async function getAllSymbolsStyles() {
    const projectData = await getProjectData();
    const currentPageId = localStorage.getItem(current_page_id); //it will return void so that will make it take second choics : "index"

    // const currentPage = projectData.pages[`${currentPageId}`];
    const allSymbolsStyle = await (
      await Promise.all(
        Object.values(projectData.blocks)
          // .filter((block) => block.type && block.type != "symbol")
          // .concat(Object.values(projectData.symbols))
          .filter((block) => block.pathes.style)
          .map(
            async (symbol) =>
              await (await opfs.getFile(defineRoot(symbol.pathes.style))).text()
          )
      )
    ).join("\n");

    return minify(allSymbolsStyle).css;
  }

  const clearTimeouts = () => {
    infinitelyWorker.postMessage({
      command: "clearTimeouts",
    });
    console.log(
      `Timeouts : `,
      initSymbolTimout,
      loadTimeout,
      storeTimeout,
      appenderTimeout,
      screenshotTimout,
      updateThumbnailTimeout
    );

    initSymbolTimout && clearTimeout(initSymbolTimout);
    loadTimeout && clearTimeout(loadTimeout);
    storeTimeout && clearTimeout(storeTimeout);
    // appenderTimeout && clearTimeout(appenderTimeout);
    screenshotTimout && clearTimeout(screenshotTimout);
    updateThumbnailTimeout && clearTimeout(updateThumbnailTimeout);
  };

  editor.on("component:drag", () => {
    clearTimeouts();
  });

  // editor.on(InfinitelyEvents.storage.loadEnd, ({ originalAutosave }) => {
  //   setTimeout(() => {
  //     clearTimeout(storeTimeout);

  //
  //     editor.clearDirtyCount();
  //     editor.Storage.setAutosave(originalAutosave);
  //     editor.UndoManager.start();
  //     editor.infLoading = false;
  //   }, 0);
  // });

  // editor.on("canvas:spot", () => {
  //   console.log("pooooooooooooointer");
  // });

  if (!projectID) {
    console.error(`Error : No project id founded in local storage`);
    return;
  }

  const dirtyCleanner = (model, attrs) => {
    editor.clearDirtyCount();
    console.log("attrs wrapper changed : ", attrs, model);

    // if (!editor.infLoading) return;
    // console.log("cleaner : :");

    // setTimeout(() => {
    //   editor.clearDirtyCount();
    //   dirtyCleanner();
    // }, 0);
  };
  editor.on("update", (update) => {
    console.log("update : ", update, editor.infLoading);
    if (editor.infLoading) {
      editor.clearDirtyCount();
    }
  });

  // editor.on(
  //   "canvas:frame:load",
  //   /**
  //    *
  //    * @param {{window : Window , el : HTMLIFrameElement}} param0
  //    */
  //   ({ window, el }) => {
  //     window.document.documentElement.remove();
  //   }
  // );

  editor.Storage.add("infinitely", {
    async load(options) {
      // console.log('loading options : ' , options);
      loadTimeout && clearTimeout(loadTimeout);
      loadTimeout &&
        window.cancelIdleCallback &&
        cancelIdleCallback(loadTimeout);

      // editor.off("canvas:frame:load:body");
      // editor.off("update");
      // editor.off(InfinitelyEvents.storage.storeEnd);

      console.log(
        "before loading : ",
        editor.Storage.config.autosave,
        editor.Storage.getStepsBeforeSave(),
        editor.getDirtyCount()
      );

      if (editor.getDirtyCount() > 0) {
        console.log(
          "loading state : ",
          editor.infLoading,
          editor.getDirtyCount.toString()
        );

        const cnfrm = confirm(
          `There is changes not saved and you lost it after reload , Are you want to save changes ? `
        );

        if (cnfrm) {
          await editor.store();
          const callback = async () => {
            await editor.load();
            editor.off(InfinitelyEvents.storage.storeEnd, callback);
          };
          editor.on(InfinitelyEvents.storage.storeEnd, callback);
          editor.StorageManager.setStepsBeforeSave(0);
          editor.clearDirtyCount();
          return;
        }
      }

      clearTimeouts();

      const callback = async () => {
        // editor.off("update", updateDirty);
        // editor.getWrapper().off("change:attributes", dirtyCleanner);
        // editor.getWrapper().on("change:attributes", dirtyCleanner);

        editor.trigger(InfinitelyEvents.storage.loadStart);
        const projectData = await db.projects.get(+projectID);
        const projectSettings = getProjectSettings().projectSettings;
        if (!projectData) return;
        // infinitelyWorker.postMessage

        // await initDBAssetsSw();
        await loadScripts(editor, projectData);

        // await sendDataToServiceWorker({
        //   projectId: +localStorage.getItem(current_project_id),
        //   projectData: projectData,
        // });
        // await fetch('/keep-live');

        console.time("loading");
        const storageManager = editor.StorageManager;
        const originalAutosave = storageManager.getConfig().autosave;
        storageManager.setAutosave(false);
        // editor.render();
        editor.UndoManager.stop();
        editor.UndoManager.clear();
        editor.DomComponents.clear({ avoidStore: false });
        editor
          .getWrapper()
          .set({ content: "" }, undefined, { avoidStore: true });
        editor.getWrapper().setAttributes({}, { avoidStore: true });
        // editor.getWrapper().destroy();

        // const frame = editor?.Canvas?.getFrameEl?.();
        // let frame = editor?.Canvas?.getFrameEl?.();

        // if (frame) {
        //   // Remove all event listeners on the iframe window
        //   // const iframeWindow = frame.contentWindow;
        //   // if (iframeWindow) {
        //   //   iframeWindow.removeEventListener("load", () => {});
        //   //   iframeWindow.document.body.innerHTML = ""; // Clear inner content
        //   // }
        //   // frame.src = "about:blank"; // Detach content to help GC
        //   // frame.contentDocument.documentElement.remove();
        //   // frame.remove(); // Finally remove from DOM
        //   // if (frame) {
        //   //   // Remove all event listeners from iframe's window and document
        //   //   const iframeWindow = frame.contentWindow;
        //   //   if (iframeWindow) {
        //   //     // Clear all event listeners by replacing the document
        //   //     iframeWindow.document.open();
        //   //     iframeWindow.document.write("");
        //   //     iframeWindow.document.close();
        //   //     // Remove window references
        //   //     iframeWindow.location = "about:blank";
        //   //   }
        //   //   // Remove iframe from DOM
        //   //   frame.parentNode?.removeChild(frame);
        //   //   frame.contentDocument?.querySelectorAll?.("*")?.forEach?.((el) => {
        //   //     el.remove();
        //   //   });
        //   //   frame = null; // Nullify reference
        //   //   console.log("iframe removed 👍");
        //   // }
        //   // editor.Canvas.destroy();
        //   editor.Layers.destroy();
        //   editor.LayerManager.destroy();
        //   editor.Assets.destroy();
        //   editor.Blocks.destroy();
        //   editor.BlockManager.destroy();
        //   editor.CodeManager.destroy();
        //   editor.Panels.destroy();
        //   // editor.Pages.destroy();
        //   editor.Traits.destroy();
        //   editor.TraitManager.destroy();
        //   editor.SelectorManager.destroy();
        //   editor.RichTextEditor.destroy();
        //   editor.Selectors.destroy();
        //   editor.Styles.destroy();
        //   editor.StyleManager.destroy();
        //   editor.I18n.destroy();
        //   editor.DomComponents.destroy();
        //   editor.Components.destroy();
        //   editor.Css.destroy();
        //   editor.CssComposer.destroy();
        //   // editor.EditorModel.destroy({});
        //   // editor.EditorModel.init(editor,);
        //   // editor.getWrapper().destroy();
        //   // editor.getWrapper().init();
        // }

        const loadCurrentPage = async () => {
          if (!localStorage.getItem(current_page_id)) {
            localStorage.setItem(current_page_id, "index");
          }
          currentPageName = localStorage.getItem(current_page_id);
          const currentPageId = currentPageName; //it will return void so that will make it take second choics : "index"
          const currentPage = projectData.pages[`${currentPageId}`];
          // const htmlPage = await currentPage.html.text();
          // const htmlPage = await (
          //   await opfs.getFile(defineRoot(`editor/pages/${currentPageId}.html`))
          // ).text();
          const cssStyles = await (
            await opfs.getFile(defineRoot(`css/${currentPageId}.css`))
          ).text();
          let allSymbolsStyle = await getAllSymbolsStyles();
          let htmlPage = [];
          // let { document } = parseHTML(doDocument(htmlPage));
          // const { document } = parseHTML(doDocument(htmlPage));
          // ${getFonts(projectData)}

          // editor.setStyle(``, { avoidStore: true });
          let cssCode = minify(
            `
            ${cssStyles}
            ${allSymbolsStyle}
        `,
            { restructure: true }
          ).css;

          // console.log("css code  : ", css_beautify(cssStyles));
          // console.log("css code  : ", css_beautify(allSymbolsStyle));
          allSymbolsStyle = null; //For garpage collection

          /**
           *
           * @param {import('grapesjs').Component[]} components
           * @param {number} starter
           * @param {number} ender
           */
          const appender = async (components, chunkSize = 5) => {
            const total = components.length;
            for (let i = 0; i < total; i += chunkSize) {
              const chunk = components.slice(i, i + chunkSize);
              editor.addComponents(chunk.join(""), { avoidStore: true });
              await new Promise((r) => requestAnimationFrame(r)); // smoother rendering
            }
            storageManager.setStepsBeforeSave(0);
            editor.clearDirtyCount();
          };

          // /**
          //  *
          //  * @param {import('grapesjs').Component[]} components
          //  * @param {number} starter
          //  * @param {number} ender
          //  */
          // const appender = (
          //   components,
          //   starter = 0,
          //   ender = 7,
          //   timeout = 50
          // ) => {
          //   const sliced = components.slice(starter, ender); //.filter(Boolean);

          //   // console.log(sliced, starter, ender);
          //   if (!sliced.length) return;
          //   // let paresd = editor.Parser.parseHtml(sliced.join(""));
          //   // console.log("parsed : ", paresd);

          //   editor.addComponents(sliced.join(""), {
          //     avoidStore: true,
          //     // merge: true,
          //     // sort: true,
          //     // temporary: true,
          //     // avoidUpdateStyle: true,
          //   });

          //   // paresd = null;

          //   return new Promise((res, rej) => {
          //     appenderTimeout && clearTimeout(appenderTimeout);
          //     appenderTimeout = setTimeout(() => {
          //       editor.clearDirtyCount();
          //       editor.StorageManager.setStepsBeforeSave(0);
          //       try {
          //         if (!sliced && !sliced.length) {
          //           res(true);
          //           htmlPage = null; // For garbage collection
          //           return;
          //         }

          //         res(appender(components, starter + ender, ender + ender));
          //       } catch (error) {
          //         rej(error);
          //       }
          //     }, timeout);
          //   });
          // };

          // console.log("loaded css code : \n", css_beautify(cssCode));

          const renderCallback = async () => {
            // 1. Clear styles completely
            // editor.setStyle(css_beautify(cssCode), { avoidStore: true });
            // const { document } = parseHTML(
            //   doDocument(
            //     await (
            //       await opfs.getFile(
            //         defineRoot(`editor/pages/${currentPageId}.html`)
            //       )
            //     ).text()
            //   )
            // );
            // const els = document.querySelectorAll(
            //   `[${inf_symbol_Id_attribute}]`
            // );
            // for (const el of els) {
            //   const symbolId = el.getAttribute(inf_symbol_Id_attribute);
            //   el.outerHTML = await (
            //     await opfs.getFile(
            //       defineRoot(`editor/symbols/${symbolId}/${symbolId}.html`)
            //     )
            //   ).text();
            // }
            infinitelyWorker.postMessage({
              command: "parseHTMLAndRaplceSymbols",
              props: {
                pageName: currentPageId,
                projectId: +projectID,
              },
            });

            const elements = await new Promise((res, rej) => {
              workerCallbackMaker(
                infinitelyWorker,
                "parseHTMLAndRaplceSymbols",
                (props) => {
                  props.response && res(props.response);
                  !props.response && rej([]);
                }
              );
            });

            // editor.setComponents(``, { avoidStore: true });
            // editor.Css.clear({ avoidStore: true });
            // editor.setStyle(cssCode, { avoidStore: true });

            const styleCmp = editor.getWrapper().find(`[infinitely-style]`)[0];
            editor.Css.clear({ avoidStore: true });
            styleCmp?.[0] && styleCmp.remove();
            editor.addComponents(
              `<style infinitely-style">${cssCode}</style>`,
              { avoidStore: true }
            );

            if (projectSettings.enable_editor_lazy_loading) {
              // editor.addStyle(css_beautify(cssCode) , {avoidStore:true})

              editor.clearDirtyCount();
              const appenderResponse = await appender(elements);
            } else {
              const wrapper = editor.getWrapper();
              // editor.Css.clear({ avoidStore: true });
              // editor.addStyle(cssCode, { avoidStore: true  });
              // editor.setStyle(cssCode, { avoidStore: true  });
              // const styleCmp = wrapper.find(`[infinitely-style]`)[0];
              // styleCmp?.[0] && styleCmp.remove();
              // wrapper.components(`${htmlPage}` , {merge:false,skipDomReset:true,sort:false})
              editor.addComponents(elements, {
                avoidStore: true,
              });
              // editor.addComponents(
              //   `<style infinitely-style">${cssCode}</style>`,
              //   { avoidStore: true }
              // );

              // htmlPage = null; // For garbage collection
            }
            editor.clearDirtyCount();
          };

          renderCallback();

          editor.trigger(InfinitelyEvents.pages.select);
          editor.trigger(InfinitelyEvents.pages.update);
          editor.trigger(InfinitelyEvents.pages.all);
          window.dispatchEvent(changePageName({ pageName: currentPageId }));
        };
        await loadCurrentPage();
        // editor.refresh();

        // isLoading = false;
        [current_symbol_rule, current_symbol_id, current_template_id].forEach(
          (item) => sessionStorage.removeItem(item)
        );
        const currentPageId = localStorage.getItem(current_page_id);
        const attributesAsEntries = Object.entries(
          projectData.pages[`${currentPageId}`].bodyAttributes || {}
        );

        const vAttributesFilterd = attributesAsEntries.filter(
          ([key, value]) => key.startsWith("v-") && value
        );

        const otherAttributes = attributesAsEntries.filter(
          ([key, value]) => !key.startsWith("v-")
        );

        // editor.getWrapper().setAttributes({} , {avoidStore:true});

        currentPageId.toLowerCase() != "playground" &&
          sessionStorage.removeItem(current_dynamic_template_id);
        editor.select(null);
        URL.createObjectURL = mainCreateObjectURLMethod;
        // editor.render();
        const frame = editor?.Canvas?.getFrameEl?.();
        if (frame) {
          console.log('there is frame.');
          frame && frame.contentWindow?.location
            ? frame.contentWindow?.location?.reload?.()
            : editor.render();

          editor.trigger("canvas:frame:load:body", {
            window: frame.contentWindow,
            el: frame,
          });
        }
        // editor.render()
        const callback = (ev) => {
          /**
           * @type {HTMLBodyElement}
           */
          const body = ev.window.document.body;
          // const originalStore = editor.Storage.store;
          // editor.Storage.store = () =>
          //   console.log(`Store prevented while loading`);
          editor.Storage.setAutosave(false);

          // editor.getWrapper().setClass("");
          const attributes = Object.fromEntries(
            vAttributesFilterd.concat(otherAttributes)
          );
          delete attributes["id"];
          if (projectSettings.stop_all_animation_on_page) {
            attributes["class"] = `${
              attributes["class"] || ""
            } inf-stop-all-animations`;
          } else {
            attributes["class"] =
              attributes["class"]?.replace("inf-stop-all-animations", "") || "";
          }
          const classes = attributes?.class || ""; //|| [...editor.getWrapper().getClasses()].join(" ");
          console.log("classes equal : ", classes);

          editor
            .getWrapper()
            .removeAttributes(Object.keys(attributes), { avoidStore: true });

          editor.getWrapper().setAttributes(attributes, {
            avoidStore: true,
            // silent: true,
          });

          editor.clearDirtyCount();

          const wrapperEl = editor.getWrapper().getEl();
          // Object.entries(attributes).forEach(([key, value]) => {
          //   wrapperEl.setAttribute(key, value);
          // });
          // if (!editor.wrapperAddIsDone) {
          //   const originalAddAttributes = editor.getWrapper().addAttributes;
          //   editor.getWrapper().addAttributes = (newAttrs, opts) => {
          //     const attrs = editor.getWrapper().getAttributes();
          //     originalAddAttributes({ ...attrs, ...newAttrs }, opts);
          //     editor.wrapperAddIsDone = true;
          //   };
          // }

          // editor.getWrapper().addClass(classes.split(" "));
          // editor.getWrapper().setClass(classes.split(" "))

          console.log(classes.split(" "));

          dirtyCleanner();

          setTimeout(() => {
            editor.UndoManager.start();
            editor.clearDirtyCount();
            editor.Storage.setAutosave(originalAutosave);
            editor.infLoading = false;
            editor.infDirty = 0;
            editor.trigger(InfinitelyEvents.storage.loadEnd, {
              originalAutosave,
            });
            editor.on("update", updateDirty);

            clearTimeout(storeTimeout);
          }, 100);
          editor.off("canvas:frame:load:body", callback);
        };

        editor.off("canvas:frame:load:body", callback);
        editor.on("canvas:frame:load:body", callback);

        // if(timesLoaded >1)timesLoaded=1

        console.log("loading end", editor.getDirtyCount());
        editor.clearDirtyCount();
        setTimeout(() => {
          // editor.off("canvas:frame:load:body", loadFooterScriptsCallback);

          editor.clearDirtyCount();
          // editor.Storage.setAutosave(originalAutosave);
          clearTimeout(storeTimeout);
          // editor.infLoading = false;
          updatePrevirePage({
            data: projectData,
            pageName: currentPageName,
            projectId: +projectID,
            projectSetting: projectSettings,
            // editorData:{canvasCss:editor.config.canvasCss , editorCss:editor.config.editorCss}
          });
        }, 0);
        return {};
      };

      if (window.requestIdleCallback) {
        loadTimeout = requestIdleCallback(async () => {
          editor.infLoading = true;
          isLoadEnd = false;
          dirtyCleanner();
          await callback();
        });
      } else {
        loadTimeout = setTimeout(async () => {
          editor.infLoading = true;
          isLoadEnd = false;
          dirtyCleanner();
          await callback();
          // return await new Promise((res, rej) => {

          //     res(true);
          //   }, 10);
        });
      }

      return loadTimeout;
    },

    //Storinggg
    store(storeProps = {}) {
      if (storeTimeout) clearTimeout(storeTimeout);
      if (pageBuilderTimeout) clearTimeout(pageBuilderTimeout);
      if (editor.getDirtyCount() < 0) return;
      // if (editor.infDirty < 0) {
      //   editor.clearDirtyCount();
      //   editor.infDirty++;
      //   return;
      // }
      // if (editor.infLoading) {
      //   editor.clearDirtyCount();
      //   return;
      // }
      editor.UndoManager.stop();

      // return new Promise((res, rej) => {
      storeTimeout = setTimeout(
        () => {
          const runStore = async () => {
            console.log(
              "prrrrrrrrrrrrops from store : ",
              storeProps,
              editor.infLoading
            );
            const projectSettings = getProjectSettings().projectSettings;
            editor.trigger(InfinitelyEvents.storage.storeStart);
            console.log("Before storing:", {
              dirty: editor.getDirtyCount(),
              steps: editor.StorageManager.getStepsBeforeSave(),
            });
            // if (!editor.getDirtyCount()) return;
            try {
              toast.clearWaitingQueue({
                // containerId: `main-toast-container`,
              });
              tId && toast.done(tId);
              if (!projectSettings.enable_auto_save) {
                tId = toast.loading(<ToastMsgInfo msg={"Saving..."} />);
              }

              const projectID = +localStorage.getItem(current_project_id);
              const currentPageId = currentPageName;
              const currentSymbolId = sessionStorage.getItem(current_symbol_id);
              const projectData = await db.projects.get(projectID);
              const files = {};
              let tailwindcssStyle;

              // Handle global symbol
              const handleGlobalSymbol = async () => {
                if (!currentSymbolId) return false;

                const symbolEl = editor
                  .getWrapper()
                  .find(`[${inf_symbol_Id_attribute}="${currentSymbolId}"]`)[0];

                const symbolInf = getInfinitelySymbolInfo(editor.getSelected());
                const symbol = symbolInf?.symbol || symbolEl;
                const currentSymbol = projectData?.symbols?.[currentSymbolId];

                if (!symbol || !currentSymbol) return false;

                const content = symbol.toHTML({
                  withProps: true,
                  keepInlineStyle: true,
                });

                const style = getComponentRules({
                  editor,
                  cmp: symbol,
                  nested: true,
                }).stringRules;

                // minify(

                //   { restructure: true }
                // ).css;

                files[currentSymbol.pathes.content] = content;
                files[currentSymbol.pathes.style] = style;

                return true;
              };

              await handleGlobalSymbol();

              // Minify full CSS
              let cssCode = editor.getCss({
                avoidProtected: true,
                keepUnusedStyles: false,
              });

              // minify(
              //  ,
              //   { restructure: true }
              // ).css;

              if (projectSettings?.enable_tailwind) {
                const tailwindStyle = [
                  ...editor.Canvas.getDocument().head.querySelectorAll("style"),
                ].find((style) =>
                  style.innerHTML.includes(
                    "MIT License | https://tailwindcss.com"
                  )
                );
                tailwindcssStyle = tailwindStyle?.innerHTML || "";
              }

              const data = {
                pages: {
                  ...projectData.pages,
                  [currentPageId]: {
                    ...projectData.pages[currentPageId],
                    bodyAttributes: editor.getWrapper().getAttributes() || {},
                    symbols: (
                      editor
                        .getWrapper()
                        .find(`[${inf_symbol_Id_attribute}]`) || []
                    ).map(
                      (cmp) => cmp.getAttributes()[inf_symbol_Id_attribute]
                    ),
                  },
                },
              };
              editor.Parser.config.optionsHtml.allowScripts = false;

              files[`editor/pages/${currentPageId}.html`] = editor
                .getWrapper()
                .getInnerHTML({ withProps: true });
              editor.Parser.config.optionsHtml.allowScripts = true;

              files[`css/${currentPageId}.css`] = cssCode;
              console.log(
                "from store",
                currentPageName,
                `editor/pages/${currentPageId}.html`,
                editor.getWrapper().getInnerHTML({ withProps: true })
              );

              const propsData = {
                data,
                files,
                projectSetting: projectSettings,
                tailwindcssStyle,
                projectId: projectID,
                pageName: currentPageId,
                pageUrl: `pages/${currentPageId}.html`,
                updatePreviewPages: true,
                editorData: {
                  canvasCss: editor.config.canvasCss,
                },
              };

              const props = {
                ...propsData,
                ...(isFunction(storeProps)
                  ? storeProps(propsData)
                  : storeProps || {}),
              };

              console.log("props will store : ", props);

              const onWorkerMessage = (ev) => {
                const { command, props: resProps } = ev.data;
                const isMatch = resProps?.projectId === projectID;

                if (
                  isMatch &&
                  (command === "updateDB" ||
                    command === "storeGrapesjsDataIfSymbols")
                ) {
                  infinitelyWorker.removeEventListener(
                    "message",
                    onWorkerMessage
                  );

                  // if (currentSymbolId) {
                  //   editor.trigger("block:add");
                  //   editor.trigger("block:update");
                  // }
                  editor.trigger("block:add");
                  editor.trigger("block:update");
                  editor.infDirty = 0;
                  editor.clearDirtyCount();
                  console.log("Store complete:", { pageId: currentPageId });
                  console.timeEnd("storing end");
                  editor.trigger(InfinitelyEvents.storage.storeEnd);
                  if (!projectSettings.enable_auto_save) {
                    toast.done(tId);
                    toast.success(
                      <ToastMsgInfo msg={`Project saved successfully👍`} />
                    );
                  }

                  // res(true);
                }
              };

              infinitelyWorker.addEventListener("message", onWorkerMessage);

              console.time("storing end");

              infinitelyWorker.postMessage({
                // command: currentSymbolId
                //   ? "storeGrapesjsDataIfSymbols"
                //   : "updateDB",
                command: "updateDB",
                props,
              });
            } catch (err) {
              console.error("Storage failed:", err);
              if (!projectSettings.enable_auto_save) {
                tId && toast.dismiss(tId);
                toast.error(<ToastMsgInfo msg={`Faild to save project🙁`} />, {
                  progressClassName: "bg-[crimson]",
                });
              }
              // res(false);
            } finally {
              editor.UndoManager.start();
            }
          };

          // if ("requestIdleCallback" in window) {
          //   requestIdleCallback(runStore);
          // } else {
          // }
          runStore();
        },
        getProjectSettings().projectSettings?.enable_auto_save ? 700 : 0
      );
      // });

      return storeTimeout;
    },
  });
};

/**
 *
 * @param {import('grapesjs').Editor } editor
 * @param {import('../helpers/types').Project } projectData
 */
export const loadScripts = async (editor, projectData) => {
  const currentPageName = localStorage.getItem(current_page_id);
  const { projectSettings, set } = getProjectSettings();
  /**
   *
   * @param {{type:'styles' | 'scripts' , attributes:{name:string} , condition:boolean }} param0
   * @returns
   */
  const appendToHeader = ({ type = "", attributes = {}, condition = true }) => {
    if (!type) return;
    const isExist = editor.config.canvas[type].findIndex(
      (lib) => lib && typeof lib != "string" && lib?.name == attributes.name
    );
    if (isExist == -1 && condition) {
      editor.config.canvas[type].push(attributes);
    } else if (isExist != -1 && !condition) {
      editor.config.canvas[type].splice(isExist, 1);
    }
  };

  editor.off("canvas:frame:load:body", loadFooterScriptsCallback);

  loadHeadScriptsCallback = (ev) => {
    console.log("from head event", ev);

    const jsHeaderLibs = projectData.jsHeaderLibs;
    const cssLibs = projectData.cssLibs;

    /**
     *
     * @param {import('../helpers/types').LibraryConfig} lib
     * @returns
     */
    const getJsLib = (lib) => {
      const newObj = {
        src: lib.isCDN ? lib.fileUrl : lib.path, //URL.createObjectURL(lib.file), // jsToDataURL(lib.content),
        name: lib.name,
        async: lib.async,
        defer: lib.defer,
      };

      !lib.defer && delete newObj.defer;
      !lib.async && delete newObj.async;
      return newObj;
    };

    /**
     *
     * @param {import('../helpers/types').LibraryConfig} lib
     * @returns
     */
    const getCssLib = (lib) => {
      // console.log("@!lib : ", lib.file);

      const url = lib.isCDN
        ? lib.fileUrl
        : // : lib.file.name.includes("global.css")
          // ? `/global.css`
          lib.path; //newObj;

      return {
        url,
        libData: lib,
      };
    };

    // console.log("scriiipts : ", jsHeaderLibs, editor.config.canvas.scripts);

    jsHeaderLibs.forEach((lib) => {
      const libData = getJsLib(lib);
      // head.appendChild(libData);

      // const isExist = editor.config.canvas.scripts.filter(
      //   (existLib) =>
      //     existLib && existLib.name.toLowerCase() == libData.name.toLowerCase()
      // ).length;
      // !isExist && editor.config.canvas.scripts.push(libData);

      appendToHeader({
        type: "scripts",
        attributes: libData,
      });
    });
    // console.log("cssLibs : ", cssLibs);

    cssLibs.map((lib) => {
      if (typeof lib == "string") {
        return lib;
      }
      const libData = getCssLib(lib);
      // const isExist = editor.config.canvas.styles.find(
      //   (lib) =>
      //     typeof lib != "string" &&
      //     lib.name.toLowerCase() == libData.libData.name.toLowerCase()
      // );
      // !isExist &&
      //   editor.config.canvas.styles.push({
      //     href: libData.url,
      //     name: libData.libData.name,
      //   });

      appendToHeader({
        type: "styles",
        attributes: {
          href: libData.url,
          name: libData.libData.name,
        },
      });
      // console.log(`Libbbbbbbbbbbbbbb@@#: `, libData);
    });

    //For Global Css
    // const globalCss = editor.config.canvas.styles.find(
    //   (lib) => lib && typeof lib != "string" && lib?.name == "global-css"
    // );
    // !globalCss &&
    //   editor.config.canvas.styles.push({
    //     href: `/global/global.css`,
    //     name: "global-css",
    //   });

    appendToHeader({
      type: "styles",
      attributes: {
        href: `/global/global.css`,
        name: "global-css",
      },
    });

    const projectSetting = getProjectSettings().projectSettings;

    appendToHeader({
      type: "scripts",
      attributes: {
        src: `/scripts/tailwindcss.v4.js`,
        name: "tailwindcss.js",
      },
      condition: projectSetting.enable_tailwind,
    });

    appendToHeader({
      type: "styles",
      attributes: {
        href: `/styles/global-rules.css`,
        name: "global-rules.css",
        rel: "stylesheet",
      },
      condition: !projectSetting.enable_tailwind,
    });

    // if (projectSetting.enable_tailwind) {
    //   // const tScript = document.createElement('script');
    //   // tScript.src = `/scripts/tailwindcss.v4.js`
    //   // editor.Canvas.getDocument().head.appendChild
    //   editor.config.canvas.scripts.push({
    //     src: `/scripts/tailwindcss.v4.js`,
    //     name: "tailwindcss.js",
    //   });
    // } else {
    //   editor.config.canvas.styles.push({
    //     href: `/styles/global-rules.css`,
    //     name: "global-rules.css",
    //     rel: "stylesheet",
    //   });
    // }

    // if (
    //   projectSetting.enable_spline_viewer &&
    //   !find(
    //     editor.config.canvas.scripts,
    //     (lib) => isPlainObject(lib) && lib.name == "spline-viewer.js"
    //   )
    // ) {
    //   editor.config.canvas.scripts.push({
    //     src: `https://unpkg.com/@splinetool/viewer@1.10.27/build/spline-viewer.js`,
    //     name: "spline-viewer.js",
    //     type: "module",
    //   });
    // }
    appendToHeader({
      type: "scripts",
      attributes: {
        src: `https://unpkg.com/@splinetool/viewer@1.10.27/build/spline-viewer.js`,
        name: "spline-viewer.js",
        type: "module",
      },
      condition: projectSetting.enable_spline_viewer,
    });

    appendToHeader({
      type: "styles",
      attributes: {
        href: `${getPageURLException(currentPageName)}/css/fonts.css`,
        rel: "stylesheet",
        name: "fonts-installed",
      },
      condition: Object.values(projectData.fonts).length,
    });
  };

  loadFooterScriptsCallback = async (ev) => {
    console.log("evoooooooooooo : ", ev.window.document.body);
    /**
     * @type {HTMLBodyElement}
     */
    const body = ev.window.document.body;
    const jsFooterLibs = projectData.jsFooterLibs; //.map(lib=>lib.file);
    // const globalScript = projectData.globalJs;
    // const localScript = projectData.pages[`${currentPageName}`].js;
    // const fragment = document.createDocumentFragment();
    // let lastScripts;
    // const allScripts = [
    //   ...jsFooterLibs,
    //   globalScript,
    //   localScript,
    //   ...mainScriptsForEditor,
    // ];
    /**
     * @param {import('../helpers/types').LibraryConfig[] & Blob[] & string[]} array
     * @param {number} index
     * @param {(script: HTMLScriptElement, lib: import('../helpers/types').LibraryConfig & Blob & string) => void} callback
     * @returns {Promise<boolean>}
     */
    const appendScript = async (
      array = [],
      index = 0,
      callback = (script, lib) => {}
    ) => {
      if (index > array.length - 1) return true;
      const script = document.createElement("script");
      const lib = array[index];

      try {
        callback(script, lib);
        // console.log(await (await fetch(`/keep-alive`)).text());
        console.log("Appending script:", script.src);

        if (!script.src) {
          console.warn("Skipping script with empty src:", lib);
          return await appendScript(array, index + 1, callback);
        }

        if (!body) {
          console.error("Body element is undefined");
          return false;
        }

        body.appendChild(script);

        return await new Promise((res) => {
          const loadCb = async () => {
            console.log(`Script loaded: ${script.src}`);
            script.removeEventListener("load", loadCb);
            res(await appendScript(array, index + 1, callback));
          };
          script.addEventListener("load", loadCb);

          const errCb = async (ev) => {
            console.error(`Error loading script: ${script.src}`, ev);
            script.removeEventListener("error", errCb);
            res(await appendScript(array, index + 1, callback)); // Continue on error
          };
          script.addEventListener("error", errCb);
        });
      } catch (err) {
        console.error(
          `Unexpected error in appendScript for ${script.src}:`,
          err
        );
        return await appendScript(array, index + 1, callback); // Continue on error
      }
    };

    // Usage example
    await appendScript(jsFooterLibs, 0, (script, lib) => {
      if (lib.isCDN) {
        script.src = lib.fileUrl;
        script.setAttribute("name", lib.name);
      } else {
        script.src = lib.path;
        script.setAttribute("name", lib.name);
      }
      lib?.async && script.setAttribute("async", "");
      lib?.defer && script.setAttribute("defer", "");
    });

    await appendScript(["/global/global.js"], 0, (script, lib) => {
      script.src = lib;
    });

    await appendScript(mainScriptsForEditor, 0, (script, lib) => {
      script.src = lib;
    });

    projectSettings.enable_swiperjs &&
      (await appendScript(
        [
          "https://cdn.jsdelivr.net/npm/swiper@latest/swiper-bundle.min.js",
          "https://cdn.jsdelivr.net/npm/swiper@latest/swiper-element-bundle.min.js",
        ],
        0,
        (script, lib) => {
          script.src = lib;
        }
      ));

    // loadMainScriptsCallback(body);
    // loadFooterLibs(body);
    // appendLocalPageAndGlobalCssAndJs(body);
    editor.off("canvas:frame:load:body", loadFooterScriptsCallback);
  };

  loadHeadScriptsCallback();
  editor.on("canvas:frame:load:body", loadFooterScriptsCallback);
  // editor.on("canvas:frame:load:body", loadMainScriptsCallback);
  // editor.on("canvas:frame:load:head", loadHeadScriptsCallback);
};
