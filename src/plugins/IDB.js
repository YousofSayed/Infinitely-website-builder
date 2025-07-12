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
} from "../helpers/functions";
import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { changePageName } from "../helpers/customEvents";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { minify } from "csso";
import { parseHTML } from "linkedom";
import {
  defineRoot,
  getFileFromHandle,
  getFonts,
  getOPFSProjectDir,
  sendDataToServiceWorker,
} from "../helpers/bridge";

import { initDBAssetsSw } from "../serviceWorkers/initDBAssets-sw";
import { opfs } from "../helpers/initOpfs";

let loadFooterScriptsCallback, loadHeadScriptsCallback, loadMainScriptsCallback;
let storeTimeout;
let pageBuilderTimeout;
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
  let isLoadEnd = false;

  async function getAllSymbolsStyles() {
    const projectData = await getProjectData();
    const currentPageId = localStorage.getItem(current_page_id); //it will return void so that will make it take second choics : "index"

    // const currentPage = projectData.pages[`${currentPageId}`];
    const allSymbolsStyle = await (
      await Promise.all(
        Object.values(projectData.blocks)
          .filter((block) => block.type && block.type != "symbol")
          .concat(Object.values(projectData.symbols))
          .filter((block) => block.pathes.style)
          .map(
            async (symbol) =>
              await (await opfs.getFile(defineRoot(symbol.pathes.style))).text()
          )
      )
    ).join("\n");

    return minify(allSymbolsStyle).css;
  }

  if (!projectID) {
    console.error(`Error : No project id founded in local storage`);
    return;
  }

  editor.Storage.add("infinitely", {
    async load() {
      isLoadEnd = false;
      const projectData = await db.projects.get(+projectID);

      if (!projectData) return;
      // infinitelyWorker.postMessage

      await initDBAssetsSw();
      loadScripts(editor, projectData);

      // await sendDataToServiceWorker({
      //   projectId: +localStorage.getItem(current_project_id),
      //   projectData: projectData,
      // });
      // await fetch('/keep-live');

      console.time("loading");
      if (
        loadFooterScriptsCallback &&
        loadHeadScriptsCallback
        // &&
        // loadMainScriptsCallback
      ) {
        editor.off("canvas:frame:load:body", loadFooterScriptsCallback);
        editor.off("canvas:frame:load:body", loadMainScriptsCallback);
        editor.off("canvas:frame:load", loadHeadScriptsCallback);
      }

      editor.UndoManager.stop();
      editor.DomComponents.clear();
      // editor.UndoManager.clear();

      willRevokedURLs.forEach((value, key) => {
        console.log("From revoked map : ", value, key);
        URL.revokeObjectURL(value);
      });
      willRevokedURLs.clear();
      const storageManager = editor.StorageManager;

      // Disable autosave temporarily
      const originalAutosave = storageManager.getConfig().autosave;
      storageManager.setAutosave(false);
      // const projectDir = await getOPFSProjectDir();

      const loadCurrentPage = async () => {
        if (!localStorage.getItem(current_page_id)) {
          localStorage.setItem(current_page_id, "index");
        }
        const currentPageId = localStorage.getItem(current_page_id); //it will return void so that will make it take second choics : "index"
        const currentPage = projectData.pages[`${currentPageId}`];
        // const htmlPage = await currentPage.html.text();
        const htmlPage = await (
          await opfs.getFile(defineRoot(`editor/pages/${currentPageId}.html`))
        ).text();
        const cssStyles = await (
          await opfs.getFile(defineRoot(`css/${currentPageId}.css`))
        ).text();
        const allSymbolsStyle = await getAllSymbolsStyles();
        const { document } = parseHTML(doDocument(htmlPage));
        // const { document } = parseHTML(doDocument(htmlPage));

        editor.setStyle(``, { avoidStore: true });
        editor.CssComposer.addRules(
          minify(`
          ${getFonts(projectData)}
          ${cssStyles}
          ${allSymbolsStyle}
         `).css
        );

        editor.setComponents(document.body.innerHTML);

        const callback = () => {
          // editor.trigger(InfinitelyEvents.pages.select);
          // editor.trigger(InfinitelyEvents.pages.update);
          // editor.trigger(InfinitelyEvents.pages.all);
          editor.off("canvas:frame:load", callback);
        };
        // editor.on("canvas:frame:load:body",()=>{
        //   console.log('innnnnnnnner:' , editor.getWrapper().getInnerHTML({withProps:true}));

        // });
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
      editor.getWrapper().setClass("");
      editor
        .getWrapper()
        .setAttributes(
          Object.fromEntries(vAttributesFilterd.concat(otherAttributes)),
          { avoidStore: true }
        );

      currentPageId.toLowerCase() != "playground" &&
        sessionStorage.removeItem(current_dynamic_template_id);
      editor.render();
      editor.select(null);
      editor.UndoManager.start();
      URL.createObjectURL = mainCreateObjectURLMethod;
      console.timeEnd("loading");
      editor.clearDirtyCount();
      console.log("loading end", editor.getDirtyCount());
      storageManager.setAutosave(originalAutosave);
      isLoadEnd = editor.getDirtyCount();
      return {};
    },

    //Storinggg
    async store() {
      console.log("storageManager.store", editor.getDirtyCount(), isLoadEnd);

      if (!isLoadEnd) {
        isLoadEnd = editor.getDirtyCount();
        return;
      }
      storeTimeout && clearTimeout(storeTimeout);
      pageBuilderTimeout && clearTimeout(pageBuilderTimeout);
      editor.UndoManager.stop();
      return new Promise((res, rej) => {
        storeTimeout = setTimeout(async () => {
          console.log("storing...");
          console.time("storing end");

          const currentPageId = localStorage.getItem(current_page_id);
          const currentSymbolId = sessionStorage.getItem(current_symbol_id);
          const currentTemplateId = sessionStorage.getItem(current_template_id);
          const currentDynamicTemplateId = sessionStorage.getItem(
            current_dynamic_template_id
          );
          const projectData = await db.projects.get(+projectID);
          // const grapesjsProjectData = editor.getProjectData();
          // const symbolRuleDetails = getGlobalSymbolRuleInfo();
          // if(!symbolRuleDetails.rule )
          // const currentRule = editor.Css.getRule(
          //   symbolRuleDetails.ruleName,
          //   symbolRuleDetails.media
          // );

          const handleGlobalSymbolRule = async () => {
            if (!currentSymbolId) return false;
            console.log("symbol : ", currentSymbolId, editor.getSelected());
            const symbolById = editor
              .getWrapper()
              .find(`[${inf_symbol_Id_attribute}="${currentSymbolId}"]`)[0];
            const symbolInf = getInfinitelySymbolInfo(editor.getSelected());
            const symbol = symbolInf?.symbol || symbolById;
            if (!symbolInf?.symbol && !symbolById) {
              return false;
            }
            const currentSymbol = projectData.symbols[currentSymbolId];
            const content = symbol.toHTML({
              withProps: true,
              keepInlineStyle: true,
            });

            const style = getComponentRules({
              editor,
              cmp: symbol,
              nested: true,
            }).stringRules;

            await opfs.writeFiles([
              {
                path: defineRoot(currentSymbol.pathes.content),
                content,
              },
              {
                path: defineRoot(currentSymbol.pathes.style),
                content: style,
              },
            ]);

            /**
             * @type {{[key : string] : import('../helpers/types').InfinitelySymbol}}
             */
            // const outputSymbol = {
            //   [`${currentSymbolId}`]: {
            //     ...projectData.symbols[currentSymbolId],
            //     // content,
            //     // style,
            //   },
            // };

            /**
             * @type {{[key : string] : import('../helpers/types').InfinitelyBlock}}
             */
            // const outputBlock = {
            //   [`${currentSymbolId}`]: {
            //     ...projectData.blocks[currentSymbolId],
            //     // content,
            //     // style,
            //   },
            // };
            return true;
            // return { outputSymbol, outputBlock };
          };

          const newBlockAndNewSymbol = await handleGlobalSymbolRule();

          /**
           * @type {import('../helpers/types').Project}
           */
          const data = {
            // imgSrc: await getImgAsBlob(editor.Canvas.getBody()),
            pages: {
              ...projectData.pages,
              [`${currentPageId}`]: {
                ...projectData.pages[currentPageId],
                bodyAttributes: editor.getWrapper().getAttributes() || {},
                // html: new Blob(
                //   [
                //     editor.getWrapper().getInnerHTML({
                //       keepInlineStyle: true,
                //       withProps: true,
                //     }),
                //   ],
                //   { type: "text/html" }
                // ),
                // // components: JSON.stringify(editor.getComponents().models),
                // css: new Blob(
                //   [
                //     minify(
                //       editor.getCss({
                //         avoidProtected: true,
                //         clearStyles: true,
                //         onlyMatched: true, //complete from here... 23/2/2025 ان شاء الله
                //         keepUnusedStyles: false,
                //       })
                //     ).css,
                //   ],
                //   { type: "text/css" }
                // ),
              },
            },

            // ...(currentSymbolId && {
            //   symbols: {
            //     ...projectData.symbols,
            //     ...newBlockAndNewSymbol.outputSymbol,
            //   },
            // }),
            // ...(currentSymbolId && {
            //   blocks: {
            //     ...projectData.blocks,
            //     ...newBlockAndNewSymbol.outputBlock,
            //   },
            // }),
            // ...(currentDynamicTemplateId && {
            //   dynamicTemplates: {
            //     ...projectData.dynamicTemplates,
            //     ...(await handleDynamicTemplateThumbAndProps()),
            //   },
            // }),
            // globalRules: handleGlobalSymbolRule(),
            // gjsProjectData: editor.getProjectData(),
          };

          // await db.projects.update(+projectID,data)
          console.log("before props");
          const projectSetting = getProjectSettings().projectSettings;
          let tailwindcssStyle;
          if (projectSetting.enable_tailwind_calsses) {
            tailwindcssStyle = [
              ...editor.Canvas.getDocument().head.querySelectorAll(`style`),
            ].filter((style) =>
              style.innerHTML.includes(`MIT License | https://tailwindcss.com `)
            )[0].innerHTML;

            console.log("tailwindcssStyle  : ", tailwindcssStyle);
          }

          const props = {
            data,
            files: {
              [`editor/pages/${currentPageId}.html`]: editor
                .getWrapper()
                .getInnerHTML({
                  keepInlineStyle: true,
                  withProps: true,
                }),
              // components: JSON.stringify(editor.getComponents().models),
              [`css/${currentPageId}.css`]: minify(
                editor.getCss({
                  avoidProtected: true,
                  clearStyles: true,
                  onlyMatched: true, //complete from here... 23/2/2025 ان شاء الله
                  keepUnusedStyles: false,
                })
              ).css,
            },
            tailwindcssStyle,
            projectId: +localStorage.getItem(current_project_id),
            updatePreviewPages: true,
            pageName: currentPageId,
            pageUrl: `pages/${currentPageId}.html`,
            editorData: {
              canvasCss: editor.config.canvasCss,
            },
          };

          console.log("after props");

          !currentSymbolId
            ? infinitelyWorker.postMessage({
                command: "updateDB",
                props,
              })
            : infinitelyWorker.postMessage({
                command: "storeGrapesjsDataIfSymbols",
                props,
              });

          // currentDynamicTemplateId &&
          //   infinitelyWorker.postMessage({
          //     command: "updateDynamicTemplates",
          //     props: {
          //       projectId: +localStorage.getItem(current_project_id),
          //       dynamicTemplateId: currentDynamicTemplateId,
          //     },
          //   });
          // editor.trigger("block:add");

          /**
           *
           * @param {MessageEvent} ev
           */
          const updateCallback = (ev) => {
            const { command, props } = ev.data;
            if (
              (command == "updateDB" ||
                command == "storeGrapesjsDataIfSymbols") &&
              props.done &&
              props.projectId == +projectID
            ) {
              infinitelyWorker.removeEventListener("message", updateCallback);
              // allowWorkerToBuildPageForPreview({
              //   pageName: localStorage.getItem(current_page_id),
              //   canvasCss: editor.config.canvasCss,
              // pageUrl: `pages/${localStorage.getItem(current_page_id)}.html`,
              //   allowToUpdate: true,
              // });
              editor.trigger("block:add");
              editor.trigger("block:update");
              console.log("updateDB done");
              console.log("store end", data);
              console.timeEnd("storing end");
              // editor.trigger("block:add");
            }
          };
          infinitelyWorker.addEventListener("message", updateCallback);

          res(await db.projects.get(+projectID));
          // pageBuilderTimeout = setTimeout(() => {}, 70);
          editor.UndoManager.start();
        }, 300);
      });
    },
  });
};

/**
 *
 * @param {import('grapesjs').Editor } editor
 * @param {import('../helpers/types').Project } projectData
 */
const loadScripts = async (editor, projectData) => {
  const currentPageName = localStorage.getItem(current_page_id);

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

      const isExist = editor.config.canvas.scripts.filter(
        (existLib) =>
          existLib && existLib.name.toLowerCase() == libData.name.toLowerCase()
      ).length;
      !isExist && editor.config.canvas.scripts.push(libData);
    });
    // console.log("cssLibs : ", cssLibs);

    cssLibs
      // .concat([
      //   {
      //     file: new File([projectData.globalCss], "global.css", {
      //       type: projectData.globalCss.type,
      //     }),
      //     name: "globalCss",
      //   },
      // ])
      .forEach((lib) => {
        if (typeof lib == "string") {
          return lib;
        }
        const libData = getCssLib(lib);
        const isExist = editor.config.canvas.styles.find(
          (lib) =>
            typeof lib != "string" &&
            lib.name.toLowerCase() == libData.libData.name.toLowerCase()
        );
        !isExist &&
          editor.config.canvas.styles.push({
            href: libData.url,
            name: libData.libData.name,
          });
        // console.log(`Libbbbbbbbbbbbbbb@@#: `, libData);
      });

    //For Global Css
    const globalCss = editor.config.canvas.styles.find(
      (lib) => lib && typeof lib != "string" && lib?.name == "global-css"
    );
    !globalCss &&
      editor.config.canvas.styles.push({
        href: `/global/global.css`,
        name: "global-css",
      });

    const projectSetting = getProjectSettings().projectSettings;
    if (projectSetting.enable_tailwind_calsses) {
      // const tScript = document.createElement('script');
      // tScript.src = `/scripts/tailwindcss.v4.js`
      // editor.Canvas.getDocument().head.appendChild
      editor.config.canvas.scripts.push({
        src: `/scripts/tailwindcss.v4.js`,
        name: "tailwindcss.js",
      });
    }
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
        console.log(await (await fetch(`/keep-alive`)).text());
        console.log("Appending script:", script.src, lib);

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
    // loadMainScriptsCallback(body);
    // loadFooterLibs(body);
    // appendLocalPageAndGlobalCssAndJs(body);
    // editor.off("canvas:frame:load:body", loadFooterScripts);
  };

  loadHeadScriptsCallback();
  editor.on("canvas:frame:load:body", loadFooterScriptsCallback);
  // editor.on("canvas:frame:load:body", loadMainScriptsCallback);
  // editor.on("canvas:frame:load:head", loadHeadScriptsCallback);
};
