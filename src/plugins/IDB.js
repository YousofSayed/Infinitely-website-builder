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
} from "../helpers/functions";
import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { changePageName } from "../helpers/customEvents";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { minify } from "csso";
import { parseHTML } from "linkedom";
import { getFonts, sendDataToServiceWorker } from "../helpers/bridge";

import { initDBAssetsSw } from "../serviceWorkers/initDBAssets-sw";

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

  async function getAllSymbolsStyles() {
    const projectData = await getProjectData();
    const currentPageId = localStorage.getItem(current_page_id); //it will return void so that will make it take second choics : "index"

    // const currentPage = projectData.pages[`${currentPageId}`];
    const allSymbolsStyle = await (
      await Promise.all(
        Object.values(projectData.blocks)
          .filter((block) => block.type && block.type != "symbol")
          .concat(Object.values(projectData.symbols))
          .filter((block) => block.style && block.style instanceof Blob)
          .map(async (symbol) => await symbol.style.text())
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
      const projectData = await db.projects.get(+projectID);

      if (!projectData) return;
      // infinitelyWorker.postMessage
      await initDBAssetsSw();
      await sendDataToServiceWorker({
        projectId: +localStorage.getItem(current_project_id),
        projectData: projectData,
      });

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
      loadScripts(editor, projectData);
      const storageManager = editor.StorageManager;

      // Disable autosave temporarily
      const originalAutosave = storageManager.getConfig().autosave;
      storageManager.setAutosave(false);

      const loadCurrentPage = async () => {
        if (!localStorage.getItem(current_page_id)) {
          localStorage.setItem(current_page_id, "index");
        }
        const currentPageId = localStorage.getItem(current_page_id); //it will return void so that will make it take second choics : "index"
        const currentPage = projectData.pages[`${currentPageId}`];
        const htmlPage = await currentPage.html.text();
        const allSymbolsStyle = await getAllSymbolsStyles();
        const { document } = parseHTML(doDocument(htmlPage));

        editor.setStyle(``, { avoidStore: true });
        editor.CssComposer.addRules(
          minify(`
          ${getFonts(projectData)}
          ${await currentPage.css.text()}
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
        editor.on("canvas:frame:load:body");
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
      
      editor
        .getWrapper()
        .addAttributes(
          Object.fromEntries(vAttributesFilterd.concat(otherAttributes)),
          {avoidStore:true,}
        );
    

      currentPageId.toLowerCase() != "playground" &&
        sessionStorage.removeItem(current_dynamic_template_id);
      editor.render();
      editor.select(null);

      editor.UndoManager.start();
      storageManager.setAutosave(originalAutosave);
      editor.clearDirtyCount();
      URL.createObjectURL = mainCreateObjectURLMethod;
      console.timeEnd("loading");
      console.log("loading end");

      return {};
    },

    //Storinggg
    async store() {
      storeTimeout && clearTimeout(storeTimeout);
      pageBuilderTimeout && clearTimeout(pageBuilderTimeout);
      editor.UndoManager.stop();
      return new Promise((res, rej) => {
        storeTimeout = setTimeout(async () => {
          console.log("storing...");
          console.time("storing...");

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

          const handleGlobalSymbolRule = () => {
            if (!currentSymbolId) return {};
            console.log("symbol : ", currentSymbolId, editor.getSelected());
            const symbolById = editor
              .getWrapper()
              .find(`[${inf_symbol_Id_attribute}="${currentSymbolId}"]`)[0];
            const symbolInf = getInfinitelySymbolInfo(editor.getSelected());
            const symbol = symbolInf?.symbol || symbolById;
            if (!symbolInf?.symbol && !symbolById) {
              // sessionStorage.removeItem(current_symbol_id)
              // console.log(
              //   "symbol not found : ",
              //   currentSymbolId,
              //   symbolInf,
              //   symbolById
              // );

              return {};
            }
            // console.log(
            //   "symbol content : ",
            //   symbol.toHTML({
            //     withProps: true,
            //     keepInlineStyle: true,
            //   })
            // );

            const content = new Blob(
              [
                symbol.toHTML({
                  withProps: true,
                  keepInlineStyle: true,
                }),
              ],
              { type: "text/html" }
            );

            const style = new Blob(
              [
                getComponentRules({
                  editor,
                  cmp: symbol,
                  nested: true,
                }).stringRules,
              ],
              {
                type: "text/css",
              }
            );

            /**
             * @type {{[key : string] : import('../helpers/types').InfinitelySymbol}}
             */
            const outputSymbol = {
              [`${currentSymbolId}`]: {
                ...projectData.symbols[currentSymbolId],
                content,
                style,
              },
            };

            /**
             * @type {{[key : string] : import('../helpers/types').InfinitelyBlock}}
             */
            const outputBlock = {
              [`${currentSymbolId}`]: {
                ...projectData.blocks[currentSymbolId],
                content,
                style,
              },
            };

            return { outputSymbol, outputBlock };
          };
          // const handleGlobalSymbolRule = () => {
          //   currentRule &&
          //     console.log(
          //       `current rule from store  : `,
          //       currentRule,
          //       currentRule.toCSS()
          //     );

          //   return currentRule
          //     ? {
          //         ...projectData.globalRules,
          //         [symbolRuleDetails.currentSelector]: {
          //           media: symbolRuleDetails.media,
          //           styles: {
          //             // ...data.globalRules[currentSelector],
          //             // ...newCssProps,
          //             ...currentRule.getStyle(),
          //           },
          //           states: symbolRuleDetails.states,
          //         },
          //       }
          //     : { ...projectData.globalRules };
          // };

          // const handleGlobalSymbolBlockThumb = async () => {
          //   const symbolInfo = getInfinitelySymbolInfo(editor.getSelected());
          //   console.log(`###########handleGlobalSymbolBlockThumb`);

          //   if (!currentSymbolId || !symbolInfo?.symbol) return {};
          //   const thumb = await toBlob(symbolInfo.symbol.getEl(), {
          //     type: "image/webp",
          //     width: 300,
          //     height: 300,
          //     quality: 1,
          //   });

          //   return {
          //     [currentSymbolId]: {
          //       ...projectData.blocks[currentSymbolId],
          //       media: thumb,
          //     },
          //   };
          // };

          // const handleBlockTemplateThumb = async () => {
          //   if (!currentTemplateId) return {};
          //   const templateInfo = getTemplateInfo(editor.getSelected());
          //   const thumb = await getImgAsBlob(templateInfo.template.getEl());
          //   return {
          //     [currentTemplateId]: {
          //       ...projectData.blocks[currentTemplateId],
          //       media: thumb,
          //     },
          //   };
          // };

          const handleDynamicTemplateThumbAndProps = async () => {
            const dynamicTemplate = getDynamicComponent(editor.getSelected());
            if (!dynamicTemplate || !currentDynamicTemplateId) return {};
            // const thumb = await toBlob(dynamicTemplate.getEl(), {
            //   type: "image/webp",
            //   quality: 1,
            //   width: 300,
            //   height: 300,
            // });
            // // await getImgAsBlob(dynamicTemplate.getEl());
            console.log(
              "stooore all rules dm : ",
              extractAllRulesWithChildRules(editor.getCss(), dynamicTemplate)
                .asString
            );

            /**
             * @type {{[key:string] : import('../helpers/types').DynamicTemplatesType}}
             */
            const output = {
              // parentRules: extractRulesById(
              //   editor.getCss(),
              //   `#${selectedEl.getId()}`
              // ),
              // childRuls: extractChildsRules(editor.getCss(), selectedEl),
              [currentDynamicTemplateId]: {
                ...projectData.dynamicTemplates[currentDynamicTemplateId],
                cmp: new Blob(
                  [
                    dynamicTemplate.toHTML({
                      withProps: true,
                      keepInlineStyle: true,
                    }),
                  ],
                  { type: "text/html" }
                ),
                allRules: new Blob(
                  [
                    getComponentRules({
                      cmp: dynamicTemplate,
                      editor,
                      nested: true,
                    }).stringRules,
                  ],
                  { type: "text/css" }
                ),
                // imgSrc: thumb
                //   ? thumb
                //   : projectData.dynamicTemplates[currentDynamicTemplateId]
                //       .imgSrc,
              },
            };

            return output;
          };

          // console.log(
          //   "saved css : ",
          //   editor.getCss(),
          //   `\n***nonon***\n`,
          //   removeDuplicateCSS(editor.getCss())
          // );

          // await db.projects.update(+projectID, {
          //   imgSrc: await toBlob(editor.Canvas.getBody(), {
          //     type: "image/webp",
          //     quality: 0.1,
          //   }),
          //   pages: {
          //     ...projectData.pages,
          //     [currentPageId]: {
          //       ...projectData.pages[currentPageId],
          //       html: new Blob(
          //         [
          //           editor.getWrapper().getInnerHTML({
          //             keepInlineStyle: true,
          //             withProps: true,

          //             // asDocument: true,
          //             // cleanId: true,
          //           }),
          //         ],
          //         { type: "text/html" }
          //       ),
          //       components: JSON.stringify(editor.getComponents()),
          //       css: new Blob(
          //         [
          //           minify(
          //             editor.getCss({
          //               avoidProtected: true,
          //               clearStyles: true,
          //               onlyMatched: true, //complete from here... 23/2/2025 ان شاء الله
          //               keepUnusedStyles: false,
          //             })
          //           ).css,
          //         ],
          //         { type: "text/css" }
          //       ),
          //     },
          //   },
          //   // assets: {
          //   //   ...grapesjsProjectData.assets,
          //   // },
          //   ...(currentSymbolId && {
          //     blocks: {
          //       ...projectData.blocks,
          //       ...(await handleGlobalSymbolBlockThumb()),
          //       // ...(await handleBlockTemplateThumb()),
          //     },
          //   }),
          //   ...(currentSymbolId && {
          //     symbols: {
          //       ...projectData.symbols,
          //       ...handleGlobalSymbolRule(),
          //     },
          //   }),
          //   ...(currentDynamicTemplateId && {
          //     dynamicTemplates: {
          //       ...projectData.dynamicTemplates,
          //       ...(await handleDynamicTemplateThumbAndProps()),
          //     },
          //   }),
          //   // globalRules: handleGlobalSymbolRule(),
          //   // gjsProjectData: editor.getProjectData(),
          // });

          const newBlockAndNewSymbol = handleGlobalSymbolRule();

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
                html: new Blob(
                  [
                    editor.getWrapper().getInnerHTML({
                      keepInlineStyle: true,
                      withProps: true,
                    }),
                  ],
                  { type: "text/html" }
                ),
                // components: JSON.stringify(editor.getComponents().models),
                css: new Blob(
                  [
                    minify(
                      editor.getCss({
                        avoidProtected: true,
                        clearStyles: true,
                        onlyMatched: true, //complete from here... 23/2/2025 ان شاء الله
                        keepUnusedStyles: false,
                      })
                    ).css,
                  ],
                  { type: "text/css" }
                ),
              },
            },
            // assets: {
            //   ...grapesjsProjectData.assets,
            // },
            // ...(currentSymbolId && {
            //   blocks: {
            //     ...projectData.blocks,
            //     ...(await handleGlobalSymbolBlockThumb()),
            //     // ...(await handleBlockTemplateThumb()),
            //   },
            // }),
            ...(currentSymbolId && {
              symbols: {
                ...projectData.symbols,
                ...newBlockAndNewSymbol.outputSymbol,
              },
            }),
            ...(currentSymbolId && {
              blocks: {
                ...projectData.blocks,
                ...newBlockAndNewSymbol.outputBlock,
              },
            }),
            ...(currentDynamicTemplateId && {
              dynamicTemplates: {
                ...projectData.dynamicTemplates,
                ...(await handleDynamicTemplateThumbAndProps()),
              },
            }),
            // globalRules: handleGlobalSymbolRule(),
            // gjsProjectData: editor.getProjectData(),
          };

          // await db.projects.update(+projectID,data)

          const props = {
            data,
            projectId: +localStorage.getItem(current_project_id),
            updatePreviewPages: true,
            pageName: currentPageId,
            pageUrl: `pages/${currentPageId}.html`,
            editorData: {
              canvasCss: editor.config.canvasCss,
            },
          };

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

          console.log("store end", data);
          console.timeEnd("storing...");
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
        src: lib.isCDN ? lib.fileUrl : `libs/js/header/${lib.file.name}`, //URL.createObjectURL(lib.file), // jsToDataURL(lib.content),
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
        : lib.file.name.includes("global.css")
        ? `/global.css`
        : `libs/css/${lib.file.name}`; //newObj;

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
      .concat([
        {
          file: new File([projectData.globalCss], "global.css", {
            type: projectData.globalCss.type,
          }),
          name: "globalCss",
        },
      ])
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
  };

  loadFooterScriptsCallback = async (ev) => {
    console.log("evoooooooooooo : ", ev.window.document.body);
    const body = ev.window.document.body;
    const jsFooterLibs = projectData.jsFooterLibs; //.map(lib=>lib.file);
    const globalScript = projectData.globalJs;
    const localScript = projectData.pages[`${currentPageName}`].js;
    const fragment = document.createDocumentFragment();
    let lastScripts;
    const allScripts = [
      ...jsFooterLibs,
      globalScript,
      localScript,
      ...mainScriptsForEditor,
    ];

    /**
     *
     * @param {import('../helpers/types').LibraryConfig[] & Blob[] & string[]} array
     * @param {number} index
     * @param {(script: HTMLScriptElement , lib : import('../helpers/types').LibraryConfig & Blob & string)=>void} callback
     * @returns
     */
    const appendScript = async (
      array = [],
      index,
      callback = (script, lib) => {}
    ) => {
      // console.log("index : ", index, allScripts);

      if (index > array.length - 1) return true;
      const script = document.createElement("script");
      const lib = array[index];

      callback(script, lib);

      // fragment.appendChild(script);
      body.appendChild(script);
      return await new Promise((res, rej) => {
        script.onload = (ev) => {
          res(appendScript(array, index + 1, callback));
        };
      });
    };

    await appendScript(jsFooterLibs, 0, (script, lib) => {
      if (lib.isCDN) {
        script.src = lib.fileUrl;
        script.setAttribute("name", lib.name);
      } else {
        script.src = `libs/js/footer/${lib.file.name}`;
        script.setAttribute("name", lib.name);
      }

      lib?.async && script.setAttribute("async", "");
      lib?.defer && script.setAttribute("defer", "");
    });

    await appendScript([globalScript], 0, (script, lib) => {
      script.src = `global/global.js`;
    });

    await appendScript([localScript], 0, (script, lib) => {
      script.src = `local/local.js?page=${currentPageName}`;
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
