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
// import  "https://cdn.jsdelivr.net/npm/jest-leak-detector@29.7.0/build/index.js";

// import { initDBAssetsSw } from "../serviceWorkers/initDBAssets-sw";
import { opfs } from "../helpers/initOpfs";
import { updateThumbnailTimeout } from "./updateProjectThumbnail";
import { css_beautify } from "js-beautify";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";
import { parseHTML } from "linkedom";
import { isArray, isFunction } from "lodash";
import grapesjs from "grapesjs";
import { editorStorageInstance } from "../constants/InfinitelyInstances";
// import LeakDetector from "jest-leak-detector";

let loadFooterScriptsCallback, loadHeadScriptsCallback, loadMainScriptsCallback;
let storeTimeout;
let pageBuilderTimeout;
let loadTimeout, appenderTimeout;
let currentPageName = localStorage.getItem(current_page_id);
/**
 * @type {HTMLIFrameElement[]}
 */
let frames = [];
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
  const attrsCallback = (editor, projectData) => {
    const { projectSettings } = getProjectSettings();
    /**
     * @type {HTMLBodyElement}
     */
    // const body = ev.window.document.body;
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

    setTimeout(() => {
      editor.clearDirtyCount();
      editor.Storage.setAutosave(projectSettings.enable_auto_save);
      editor.UndoManager.start();
      editor.trigger(InfinitelyEvents.storage.loadEnd);
      editor.infLoading = false;
    }, 0);
    // editor.on("update", updateDirty);

    clearTimeout(storeTimeout);
    // editor.off("canvas:frame:load:body", callback);
  };

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

  if (!projectID) {
    console.error(`Error : No project id founded in local storage`);
    return;
  }

  const dirtyCleanner = (model, attrs) => {
    editor.clearDirtyCount();
    console.log("attrs wrapper changed : ", attrs, model);
  };

  editor.on("update", (update) => {
    console.log("update : ", update, editor.infLoading);
    if (editor.infLoading) {
      editor.clearDirtyCount();
    }
  });
  function clearEditor() {
    const canvas = editor.Canvas;

    // 1. Destroy Frame Completely
    const frameEl = canvas.getFrameEl();
    if (frameEl) {
      frameEl.remove(); // Removes iframe DOM
    }

    const frameView = canvas.getFrame();
    if (frameView) {
      frameView.remove();
    }

    // Clear GrapesJS internal references
    canvas.frames = [];

    // 2. Clear all Components
    editor.DomComponents.clear({ avoidStore: true });
    editor.DomComponents.destroy();
    editor.Components.clear({ avoidStore: true });
    editor.Components.destroy();
    editor.getWrapper()?.empty?.();
    // 3. Clear CSS
    editor.Css.clear({ avoidStore: true });
    editor.Css.destroy();
    editor.CssComposer.clear({ avoidStore: true });
    editor.CssComposer.destroy();

    // 4. Undo Manager
    editor.UndoManager.stop();
    editor.UndoManager.clear();

    // 5. Clear Selections
    editor.select(null);

    // 6. Remove custom event listeners bound to the editor
    editor.off("canvas:frame:load:body");
    editor.off("component:remove:before", editor.removerBeforeHandler);

    // 7. Reset internal object URLs
    URL.createObjectURL = mainCreateObjectURLMethod;
  }

  function fullDestroyCanvas(editor) {
    const canvas = editor.Canvas;

    // 1. Remove iframe DOM
    const frameEl = canvas.getFrameEl();
    if (frameEl) {
      frameEl.remove();
    }

    // 2. Destroy GrapesJS frame view
    const frameView = canvas.getFrame();
    if (frameView) {
      frameView.remove();
    }

    // 3. Reset canvas internals
    canvas.frames = [];
    canvas.wrapper = null;
    canvas.model = null;
  }

  function hardResetEditor() {
    // 1. Remove custom listeners
    // editor.off(); // Completely clear all event listeners

    // 2. Stop Undo Manager
    editor.UndoManager.stop();
    editor.UndoManager.clear();

    // 3. Clear selections
    editor.select(null);

    // 4. Clear components and CSS
    editor.DomComponents.clear({ avoidStore: true });
    editor.CssComposer.clear({ avoidStore: true });

    // 5. Clear wrapper
    editor.getWrapper()?.empty?.();

    // 6. Remove iframe
    const frameEl = editor.Canvas.getFrameEl();
    if (frameEl?.parentNode) {
      frameEl.parentNode.removeChild(frameEl);
    }
    editor.Canvas.frames = [];

    // 7. Clear storage
    // editor.StorageManager.getStorages().forEach((storage) => {
    //   if (storage?.clear) storage.clear();
    // });

    // 8. Force revoke any Blob URLs
    // if (window.__activeBlobUrls) {
    //   window.__activeBlobUrls.forEach((url) => URL.revokeObjectURL(url));
    //   window.__activeBlobUrls = [];
    // }
  }

  const loadElements = async () => {
    const frame = editor.Canvas.getFrameEl();
    // if (frame?.contentDocument?.location) {
    //   frame.contentDocument.location.reload();
    //   const frameRemovedDone = await new Promise((res, rej) => {
    //     if (frame) {
    //       frame.addEventListener("load", () => {
    //         // 3. Force browser to GC old document

    //         frame.contentDocument.body
    //           .querySelectorAll("*")
    //           .forEach((el) => el.remove());
    //         console.log(
    //           "frame remover : ",
    //           frame.contentDocument.body.querySelectorAll("*"),
    //           frame.contentDocument.querySelectorAll("*")
    //         );
    //         frame.replaceWith(frame.cloneNode(false));

    //         // 2. Clear references
    //         frame.onload = null;
    //         frame.src = "about:blank";
    //         setTimeout(() => {
    //           frame.remove();
    //         }, 0);
    //         res(true);
    //       });
    //     } else {
    //       res(true);
    //     }
    //   });
    // }

    // hardResetEditor();
    // clearEditor(editor);
    // fullDestroyCanvas(editor);
    // const oldCnfg = editor.getConfig();
    // if (editor) {
    // editor.destroy();
    // editor = null;
    // document.querySelector("#gjs").innerHTML = ""; // clear container
    // }

    // editor = grapesjs.init(oldCnfg);
    editor.Components.clear({});
    editor.DomComponents.clear({});
    editor.Css.clear({});
    editor.CssComposer.clear({});
    // editor.Canvas.canvas.clear({});
    // editor.Canvas.canvas.destroy();
    // editor.Canvas.canvas.init();

    !editor.loadTimes && (editor.loadTimes = 0);
    editor.loadTimes++;
    editor.trigger(InfinitelyEvents.storage.loadStart);

    const projectData = await db.projects.get(+projectID);
    const projectSettings = getProjectSettings().projectSettings;
    if (!projectData) {
    }

    console.time("loading");
    const storageManager = editor.StorageManager;
    const originalAutosave = storageManager.getConfig().autosave;
    storageManager.setAutosave(false);

    const loadCurrentPage = async () => {
      if (!localStorage.getItem(current_page_id)) {
        localStorage.setItem(current_page_id, "index");
      }
      currentPageName = localStorage.getItem(current_page_id);
      const currentPageId = currentPageName; //it will return void so that will make it take second choics : "index"
      const currentPage = projectData.pages[`${currentPageId}`];
      let cssStyles = await (
        await opfs.getFile(defineRoot(`css/${currentPageId}.css`))
      ).text();
      let allSymbolsStyle = await getAllSymbolsStyles();

      let cssCode = minify(
        `
            ${allSymbolsStyle}
            ${cssStyles}
        `,
        { restructure: true }
      ).css;

      allSymbolsStyle = null; //For garpage collection
      cssStyles = null;
      /**
       *
       * @param {import('grapesjs').Component[]} components
       * @param {number} starter
       * @param {number} ender
       */
      const appender = async (components, chunkSize = 1) => {
        const total = components.length;
        for (let i = 0; i < total; i += chunkSize) {
          const chunk = components.slice(i, i + chunkSize);
          editor.addComponents(chunk.join(""), { avoidStore: true });
          await new Promise((r) => requestAnimationFrame(r)); // smoother rendering
        }
        editor.clearDirtyCount();
      };

      const getElements = async () => {
        infinitelyWorker.postMessage({
          command: "parseHTMLAndRaplceSymbols",
          props: {
            pageName: currentPageId,
            projectId: +projectID,
          },
        });

        let styleElement = " "; // renderCssStyles(editor, cssCode);

        let elements = await new Promise((res, rej) => {
          workerCallbackMaker(
            infinitelyWorker,
            "parseHTMLAndRaplceSymbols",
            (props) => {
              props.response && res([...props.response]);
              !props.response && rej([]);
            }
          );
        });
        console.log("elements : ", elements);

        if (projectSettings.enable_editor_lazy_loading) {
          // Take the first 5 and mutate the original array
          const firstFive = elements.splice(0, 5);

          // Load the first 5 into GrapesJS
          editor.loadProjectData({
            components: firstFive,
          });
          // Now `elements` contains ONLY the remaining ones
          await appender(elements);

          // let tmpElements = [...elements]; // clone
          // const firstFive = tmpElements.splice(0, 5);
          // editor.loadProjectData({ components: firstFive });
          // await appender(tmpElements);
          // tmpElements.length = 0;
          // tmpElements = null;
        } else {
          // const parser = editor.Parser.parseHtml(elements);
          // editor.loadProjectData({
          //   // styles: parser.css, // optional
          //   components:elements,
          // });
          // const el = editor.getEl();
          // frames.push(el);
          // console.log('render el : ' ,el);
          // editor.addComponents(elements , {merge:true});
          // const frame = editor.Canvas.getFrameEl();
          // frame.setAttribute('srcdoc', elements.join(' ')) // = doDocument(elements.join(' '))
        }

        return elements;
      };

      editor.trigger(InfinitelyEvents.pages.select);
      editor.trigger(InfinitelyEvents.pages.update);
      editor.trigger(InfinitelyEvents.pages.all);
      window.dispatchEvent(changePageName({ pageName: currentPageId }));
      const parsed = editor.Parser.parseHtml(await getElements(), {
        asDocument: false,
      });
      let content = isArray(parsed.html) ? [...parsed.html] : [parsed.html];
      return {
        components: [renderCssStyles(editor, cssCode), ...content],
        // styles:editor.Parser.parseCss(cssCode)
      };
    };

    [current_symbol_rule, current_symbol_id, current_template_id].forEach(
      (item) => sessionStorage.removeItem(item)
    );

    // editor.getWrapper().setAttributes({} , {avoidStore:true});

    editor.select(null);
    URL.createObjectURL = mainCreateObjectURLMethod;

    editor.off("canvas:frame:load:body");
    await loadScripts(editor, projectData);
    editor.on("canvas:frame:load:body", () => {
      attrsCallback(editor, projectData);
    });

    editor.clearDirtyCount();

    // if (editor.loadTimes > 1) {
    //   clearEditor(editor);
    // }
    editor.on("component:remove:before", editor.removerBeforeHandler);
    return await loadCurrentPage();
  };

  editor.on("storage:end:load", async() => {
    editor.trigger(InfinitelyEvents.storage.loadEnd);
    editorStorageInstance.emit(InfinitelyEvents.storage.loadEnd);
    // editor.setComponents(await(await loadElements()).components , {merge:true });
    console.log("load end");
  });

  editor.on("storage:start:load", () => {
    editorStorageInstance.emit(InfinitelyEvents.storage.loadStart);
    console.log("start load");
  });

  editor.Storage.add("infinitely", {
    async load(options = {}) {
      console.log("loading options : ", options);
      editor.off("component:remove:before", editor.removerBeforeHandler);
      loadTimeout && clearTimeout(loadTimeout);
      loadTimeout &&
        window.cancelIdleCallback &&
        cancelIdleCallback(loadTimeout);
      editor.infLoading = true;
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
      const projectData = await getProjectData();
      editor.off("canvas:frame:load:body");
      await loadScripts(editor, projectData); 
      editor.on("canvas:frame:load:body", () => {
        attrsCallback(editor, projectData);
      }); 

  

      editor.clearDirtyCount();
      clearTimeouts();
      editor.off("component:remove:before", editor.removerBeforeHandler);

      console.log("should load");

      // return {
      //   components:['<h1>Hello world!!</h1>']
      // }
      // editor.Canvas.getCanvasView().initialize({el:document.body  ,tagName:'h1'});
      return await loadElements();
      // return {components:[]};
    },

    //Storinggg
    store(storeProps = {}) {
      if (storeTimeout) clearTimeout(storeTimeout);
      if (pageBuilderTimeout) clearTimeout(pageBuilderTimeout);
      if (editor.getDirtyCount() < 0) return;

      // editor.UndoManager.stop();

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
              // editor.UndoManager.start();
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
 * @param {import('grapesjs').Editor} editor
 * @param {string} cssCode
 */
export const renderCssStyles = (editor, cssCode) => {
  const styleCmp = editor.getWrapper()?.find?.(`[infinitely-style]`)?.[0];
  // editor.Css.clear({ avoidStore: true });
  styleCmp?.[0] && styleCmp.remove();
  // editor.addComponents(`<style infinitely-style">${cssCode}</style>`, {
  //   avoidStore: true,
  // });
  return `<style infinitely-style">${cssCode}</style>`;
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

//======================Trash=========================
//  const callback = async () => {
//         !editor.loadTimes && (editor.loadTimes = 0);
//         editor.loadTimes++;
//         editor.trigger(InfinitelyEvents.storage.loadStart);
//         editor.off("component:remove:before", editor.removerBeforeHandler);

//         const projectData = await db.projects.get(+projectID);
//         const projectSettings = getProjectSettings().projectSettings;
//         if (!projectData) return;

//         console.time("loading");
//         const storageManager = editor.StorageManager;
//         const originalAutosave = storageManager.getConfig().autosave;
//         storageManager.setAutosave(false);
//         function clearEditor() {
//           const canvas = editor.Canvas;
//           const frameView = canvas.getFrame();

//           if (frameView) {
//             frameView.remove();
//             canvas.frames = [];
//           }

//           // Components & CSS
//           editor.DomComponents.clear({ avoidStore: true });
//           editor.Components.clear({ avoidStore: true });
//           editor.getWrapper()?.empty?.();
//           editor.Css.clear({ avoidStore: true });
//           editor.CssComposer.clear({ avoidStore: true });

//           // Undo manager
//           editor.UndoManager.stop();
//           editor.UndoManager.clear();

//           // Remove all selections
//           editor.select(null);

//           // Force GrapesJS to forget the wrapper
//           editor?.setComponents?.("");
//         }

//         const frame = editor.Canvas.getFrameEl();
//         frame && frames.push(frame);
//         console.log(frames, "frames");
//         frames.forEach((frameEl) => {
//           const els = [...frameEl.querySelectorAll("*")];
//           console.log("frame children length el: ", els.length);

//           els.forEach((el) => el.remove());
//           // frame.contentWindow.location.replace("about:blank");
//           frameEl.remove();
//         });
//         frames = [];
//         // if (editor.loadTimes > 1) {
//         //   clearEditor(editor);
//         // }

//         const loadCurrentPage = async () => {
//           if (!localStorage.getItem(current_page_id)) {
//             localStorage.setItem(current_page_id, "index");
//           }
//           currentPageName = localStorage.getItem(current_page_id);
//           const currentPageId = currentPageName; //it will return void so that will make it take second choics : "index"
//           const currentPage = projectData.pages[`${currentPageId}`];
//           let cssStyles = await (
//             await opfs.getFile(defineRoot(`css/${currentPageId}.css`))
//           ).text();
//           let allSymbolsStyle = await getAllSymbolsStyles();

//           let cssCode = minify(
//             `
//             ${allSymbolsStyle}
//             ${cssStyles}
//         `,
//             { restructure: true }
//           ).css;

//           allSymbolsStyle = null; //For garpage collection
//           cssStyles = null;
//           /**
//            *
//            * @param {import('grapesjs').Component[]} components
//            * @param {number} starter
//            * @param {number} ender
//            */
//           const appender = async (components, chunkSize = 1) => {
//             const total = components.length;
//             for (let i = 0; i < total; i += chunkSize) {
//               const chunk = components.slice(i, i + chunkSize);
//               editor.addComponents(chunk.join(""), { avoidStore: true });
//               await new Promise((r) => requestAnimationFrame(r)); // smoother rendering
//             }
//             editor.clearDirtyCount();
//           };

//           const renderCallback = async () => {
//             infinitelyWorker.postMessage({
//               command: "parseHTMLAndRaplceSymbols",
//               props: {
//                 pageName: currentPageId,
//                 projectId: +projectID,
//               },
//             });

//             let styleElement = renderCssStyles(editor, cssCode);

//             let elements = await new Promise((res, rej) => {
//               workerCallbackMaker(
//                 infinitelyWorker,
//                 "parseHTMLAndRaplceSymbols",
//                 (props) => {
//                   props.response && res([styleElement, ...props.response]);
//                   !props.response && rej([]);
//                 }
//               );
//             });
//             console.log("elements : ", elements);

//             if (projectSettings.enable_editor_lazy_loading) {
//               // Take the first 5 and mutate the original array
//               const firstFive = elements.splice(0, 5);

//               // Load the first 5 into GrapesJS
//               editor.loadProjectData({
//                 components: firstFive,
//               });
//               // Now `elements` contains ONLY the remaining ones
//               await appender(elements);

//               // let tmpElements = [...elements]; // clone
//               // const firstFive = tmpElements.splice(0, 5);
//               // editor.loadProjectData({ components: firstFive });
//               // await appender(tmpElements);
//               // tmpElements.length = 0;
//               // tmpElements = null;
//             } else {
//               // const parser = editor.Parser.parseHtml(elements);
//               // editor.loadProjectData({
//               //   // styles: parser.css, // optional
//               //   components:elements,
//               // });
//               // const el = editor.getEl();
//               // frames.push(el);
//               // console.log('render el : ' ,el);
//               // editor.addComponents(elements , {merge:true});
//               // const frame = editor.Canvas.getFrameEl();
//               // frame.setAttribute('srcdoc', elements.join(' ')) // = doDocument(elements.join(' '))
//             }
//             elements.length = 0;
//             cssCode = null;
//             elements = null;

//             editor.clearDirtyCount();
//             // console.log(editor.removerBeforeHandler,'editor.removerBeforeHandler');
//           };

//           renderCallback();

//           editor.trigger(InfinitelyEvents.pages.select);
//           editor.trigger(InfinitelyEvents.pages.update);
//           editor.trigger(InfinitelyEvents.pages.all);
//           window.dispatchEvent(changePageName({ pageName: currentPageId }));
//         };
//         await loadCurrentPage();

//         [current_symbol_rule, current_symbol_id, current_template_id].forEach(
//           (item) => sessionStorage.removeItem(item)
//         );

//         // editor.getWrapper().setAttributes({} , {avoidStore:true});

//         editor.select(null);
//         URL.createObjectURL = mainCreateObjectURLMethod;

//         editor.off("canvas:frame:load:body");
//         await loadScripts(editor, projectData);
//         editor.on("canvas:frame:load:body", () => {
//           attrsCallback(editor, projectData);
//         });

//         // if(timesLoaded >1)timesLoaded=1

//         console.log("loading end", editor.getDirtyCount());
//         editor.clearDirtyCount();
//         setTimeout(() => {
//           editor.clearDirtyCount();
//           clearTimeout(storeTimeout);
//           updatePrevirePage({
//             data: projectData,
//             pageName: currentPageName,
//             projectId: +projectID,
//             projectSetting: projectSettings,
//             // editorData:{canvasCss:editor.config.canvasCss , editorCss:editor.config.editorCss}
//           });
//           editor.infLoading = false;
//         }, 0);
//         return {};
//       };
