import {
  current_dynamic_template_id,
  current_page_id,
  current_project_id,
  current_symbol_id,
  current_symbol_rule,
  current_template_id,
  inf_build_url,
  inf_css_urls,
  mainScripts,
  mainScriptsForEditor,
} from "../constants/shared";
import { css, html } from "../helpers/cocktail";
import { parse as parseCss, stringify as stringifyCss } from "css";
import { db } from "../helpers/db";
import {
  defineFontFace,
  doDocument,
  extractAllRulesWithChildRules,
  getComponentRules,
  getDynamicComponent,
  getGlobalSymbolRuleInfo,
  getImgAsBlob,
  getInfinitelySymbolInfo,
  getProjectData,
  getTemplateInfo,
  parseInfinitelyURL,
} from "../helpers/functions";
import { refType } from "../helpers/jsDocs";
import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { changePageName } from "../helpers/customEvents";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { minify } from "csso";
import { parseHTML } from "linkedom";
import { toBlob } from "html-to-image";
import { parse } from "@wordpress/block-serialization-default-parser";
import { replaceCssURLS } from "../helpers/bridge";

let loadFooterScriptsCallback, loadHeadScriptsCallback, loadMainScriptsCallback;
let isLoading = 0;
let storeTimeout;
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
    const projectData = await await getProjectData();
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
      console.log("load");

      if (
        loadFooterScriptsCallback &&
        loadHeadScriptsCallback &&
        loadMainScriptsCallback
      ) {
        editor.off("canvas:frame:load:body", loadFooterScriptsCallback);
        editor.off("canvas:frame:load:body", loadMainScriptsCallback);
        editor.off("canvas:frame:load", loadHeadScriptsCallback);
      }

      editor.DomComponents.clear();
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
        const assets = projectData.assets;
        const currentPage = projectData.pages[`${currentPageId}`];
        const htmlPage = await currentPage.html.text();
        const allSymbolsStyle = await getAllSymbolsStyles();
        const { document } = parseHTML(doDocument(htmlPage));
        const cssPropsUrlsElsArr = [];
        const srcElements = [...document.querySelectorAll(`[src]`)];

        // await Promise.all(
        //   srcElements.map(async (el) => {
        //     console.error("srccc :", el);
        //     const url = await (await fetch(el.src)).blob();
        //     el.src = URL.createObjectURL(url);
        //     console.error("srccc :", el.src);
        //     return url;
        //   })
        // );

        // console.error(
        //   "innner :",
        //   [...document.querySelectorAll(`[src]`)]
        //     .map((el) => el.outerHTML)
        //     .join("")
        // );

        const getFonts = () => {
          const fonts = Object.values(projectData.fonts);
          const stringFonts = fonts.map((font) =>
            defineFontFace({
              family: font.file.name.split(/\.\w+/gi).join("").trim(),
              url: font.isCDN ? font.url : `url("../fonts/${font.file.name}") `,
            })
          );
          return stringFonts.join("\n");
        };

        editor.setStyle(``, { avoidStore: true });
        editor.CssComposer.addRules(
          minify(`
          ${getFonts()}
          ${await currentPage.css.text()}
          ${allSymbolsStyle}
         `).css
        );
        // const mainIframeFunction = editor.Canvas.getFrameEl().contentDocument.write ;
        // console.log('mainIframeFunction : ' , mainIframeFunction);

        // editor.setComponents( `<iframe src='../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4'></iframe>` );

        console.error("innner : ", document.body.innerHTML);

        editor.once('load',()=>{
          
          // editor.Canvas.getFrameEl().sandbox =  `allow-top-navigation-by-user-activation allow-top-navigation allow-scripts allow-same-origin allow-presentation`
        })
        editor.setComponents(document.body.innerHTML);
       
        // editor.setComponents(
        //   `<img data-gjs-highlightable="true" id="ilmj" data-gjs-type="image" draggable="true" src="../assets/SD7000-.png" class="Mjg0NQ" />
        //   <div id="iook" data-gjs-type="video" draggable="true"   class="MjgxNA"><video src='../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4' controles="true"  allowfullscreen="allowfullscreen"></video></div>
        //   <div id="iook" data-gjs-type="video" draggable="true"   class="MjgxNA"><video src='../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4' controles="true"  allowfullscreen="allowfullscreen"></video></div>
        //   `
        // );

        // editor.EditorModel.b
        // editor.addComponents(
        //   `<video
        //     src="../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4"
        //     controls
        //   ></video>`,
        //   { }
        // );
        // editor.Canvas.
        // editor.Canvas.config.frameContent=`<video
        //     src="../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4"
        //     controls
        //   ></video>`

        // editor.on('canvas:frame:load',(model)=>{
        //   console.log('winnnnnnnnnnnn : ' , model);

        //   // editor.Canvas.getFrameEl().srcdoc = `<video
        //   //   src="../assets/WhatsApp Video 2025-04-09 at 6.37.02 AM.mp4"
        //   //   controls
        //   // ></video>`
        //   model.window.navigator.serviceWorker.register(`dbAssets-sw.js` )
        // })

        //         console.log(
        //           "csssssss:",
        //           minify(`
        //   ${getFonts()}
        //    ${allSymbolsStyle}
        //    ${await currentPage.css.text()}
        //  `).css
        //         );

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
      console.log("fucken page : ", currentPageId);
      editor
        .getWrapper()
        .addAttributes(
          Object.fromEntries(
            Object.entries(
              projectData.pages[`${currentPageId}`].bodyAttributes || {}
            ).filter(([key, value]) => key.startsWith("v-") && value)
          )
        );
      console.log(
        "wrapper attributes : ",
        projectData.pages[`${currentPageId}`].bodyAttributes
      );

      currentPageId.toLowerCase() != "playground" &&
        sessionStorage.removeItem(current_dynamic_template_id);
      editor.select(null);
      editor.render();
      storageManager.setAutosave(originalAutosave);
      editor.clearDirtyCount();
      URL.createObjectURL = mainCreateObjectURLMethod;
      return {};
    },

    //Storinggg
    async store() {
      // if (isLoading >= 1) {
      //   console.log(isLoading);
      //   isLoading++;
      //   return
      // };

      storeTimeout && clearTimeout(storeTimeout);

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
          const grapesjsProjectData = editor.getProjectData();
          const symbolRuleDetails = getGlobalSymbolRuleInfo();
          // if(!symbolRuleDetails.rule )
          // const currentRule = editor.Css.getRule(
          //   symbolRuleDetails.ruleName,
          //   symbolRuleDetails.media
          // );

          const handleGlobalSymbolRule = () => {
            if (!currentSymbolId || !editor.getSelected()) return {};
            const symbolInf = getInfinitelySymbolInfo(editor.getSelected());
            const content = new Blob(
              [
                symbolInf.symbol.toHTML({
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
                  cmp: symbolInf.symbol,
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

          const handleGlobalSymbolBlockThumb = async () => {
            const symbolInfo = getInfinitelySymbolInfo(editor.getSelected());
            console.log(`###########handleGlobalSymbolBlockThumb`);

            if (!currentSymbolId || !symbolInfo?.symbol) return {};
            const thumb = await toBlob(symbolInfo.symbol.getEl(), {
              type: "image/webp",
              width: 300,
              height: 300,
              quality: 1,
            });

            return {
              [currentSymbolId]: {
                ...projectData.blocks[currentSymbolId],
                media: thumb,
              },
            };
          };

          const handleBlockTemplateThumb = async () => {
            if (!currentTemplateId) return {};
            const templateInfo = getTemplateInfo(editor.getSelected());
            const thumb = await getImgAsBlob(templateInfo.template.getEl());
            return {
              [currentTemplateId]: {
                ...projectData.blocks[currentTemplateId],
                media: thumb,
              },
            };
          };

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
                      // attributes:(cmp , attr)=>{
                      //   console.log('save attrs :' , cmp.get('type') , attr);

                      // attr
                      // }
                      // asDocument: true,
                      // cleanId: true,
                    }),
                  ],
                  { type: "text/html" }
                ),
                components: JSON.stringify(editor.getComponents()),
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

          !currentSymbolId
            ? infinitelyWorker.postMessage({
                command: "updateDB",
                props: {
                  data,
                  projectId: +localStorage.getItem(current_project_id),
                },
              })
            : infinitelyWorker.postMessage({
                command: "storeGrapesjsDataIfSymbols",
                props: {
                  data,
                  projectId: +localStorage.getItem(current_project_id),
                },
              });

          currentDynamicTemplateId &&
            infinitelyWorker.postMessage({
              command: "updateDynamicTemplates",
              props: {
                projectId: +localStorage.getItem(current_project_id),
                dynamicTemplateId: currentDynamicTemplateId,
              },
            });
          // editor.trigger("block:add");
          console.log("store end", data);
          console.timeEnd("storing...");
          res(await db.projects.get(+projectID));
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
  const currentPageName = localStorage.getItem(current_page_id) || "index";
  // console.log("i load now......", editor.getWrapper().getEl());

  // const mainScripts = [
  //   // "/scripts/hyperscript@0.9.13.js",
  //   "/scripts/proccesNodeInHS.js",
  //   "/scripts/p-vue.js",
  //   // "/scripts/alpine.js",
  //   // 'https://cdn.tailwindcss.com',
  //   // 'https://cdnjs.cloudflare.com/ajax/libs/hyperscript/0.9.11/_hyperscript.min.js'
  // ];
  // const wrapper = editor.getWrapper().getEl();
  // const head = editor.Canvas.getDocument().head;

  // const getFonts = () => {
  //   const fonts = Object.values(projectData.fonts);
  //   const stringFonts = fonts.map((font) =>
  //     defineFontFace({
  //       family: font.file.name,
  //       url: font.isCDN ? font.url : URL.createObjectURL(font.file),
  //     })
  //   );
  //   return stringFonts.join("\n");
  // };

  loadHeadScriptsCallback = (ev) => {
    // const head = editor.Canvas.getDocument().head;
    // const head = ev.window.document.head;
    console.log("from head event", ev);

    // editor.config.canvas.scripts = [];
    // editor.config.canvas.styles = [];

    // new Set().

    // const jsHeaderCDN = projectData.jsHeaderCDNLibraries;
    // const jsHeaderLocal = projectData.jsHeaderLocalLibraries;
    // // .concat({
    // //   content: `console.log('I load From Header')`,
    // //   name: "hedo",
    // // });
    // const cssHeaderLocal = projectData.cssHeaderLocalLibraries;
    // const cssHeaderCDN = projectData.cssHeaderCDNLibraries;
    const jsHeaderLibs = projectData.jsHeaderLibs;
    // const jsFooterLibs = projectData.jsFooterLibs;
    const cssLibs = projectData.cssLibs;

    /**
     *
     * @param {import('../helpers/types').LibraryConfig} lib
     * @returns
     */
    const getJsLib = (lib) => {
      const newObj = {
        src: lib.isCDN ? lib.fileUrl : URL.createObjectURL(lib.file), // jsToDataURL(lib.content),
        name: lib.name,
        async: lib.async,
        defer: lib.defer,
      };

      !lib.defer && delete newObj.defer;
      !lib.async && delete newObj.async;
      // const script = document.createElement('script');
      // for (const key in newObj) {
      //   script.setAttribute(key , newObj[key])
      // }
      return newObj;
    };

    /**
     *
     * @param {import('../helpers/types').LibraryConfig} lib
     * @returns
     */
    const getCssLib = (lib) => {
      console.log("@!lib : ", lib.file);

      const url = lib.isCDN ? lib.fileUrl : URL.createObjectURL(lib.file); //newObj;
      // const link = document.createElement('link');
      // link.href = url;
      // link.setAttribute('name' , lib.name)
      return {
        url,
        libData: lib,
      };
    };

    jsHeaderLibs.forEach((lib) => {
      const libData = getJsLib(lib);
      // head.appendChild(libData);

      const isExist = editor.config.canvas.scripts.filter(
        (existLib) => existLib.name.toLowerCase() == libData.name.toLowerCase()
      ).length;
      !isExist && editor.config.canvas.scripts.push(libData);
    });
    console.log("cssLibs : ", cssLibs);

    cssLibs
      .concat([{ file: projectData.globalCss, name: "globalCss" }])
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
        console.log(`Libbbbbbbbbbbbbbb@@#: `, libData);

        //For Fonts
        // const isFontsExist = editor.config.canvas.styles.find(
        //   (existLib) => existLib.name.toLowerCase() == "fonts"
        // );
      });

    // jsHeaderLocal.forEach((lib) => {
    //   const libData = getJsLib(lib);
    //   editor.config.canvas.scripts.push(libData);
    // });

    // editor.off("canvas:frame:load", headCallback);
  };

  //===body

  const loadFooterLibs = (body) => {
    // const body = editor.Canvas.getBody();
    // const body = editor.Canvas.getBody();
    // const jsFooterCDN = projectData.jsFooterCDNLibraries;
    // const jsFooterLocal = projectData.jsFooterLocalLibraries;
    // const cssFooterLocal = projectData.cssFooterLocalLibraries;
    // const cssFooterCDN = projectData.cssFooterCDNLibraries;

    // appendScriptInElForLocal(body, jsFooterLocal);

    // appendStylesForLocal(body, cssFooterLocal);
    // appendScriptInElForCDN(body, jsFooterCDN);
    // appendStylesForCDN(body, cssFooterCDN);
    const jsFooterLibs = projectData.jsFooterLibs;
    appendFooterScripts(body, jsFooterLibs);
    console.log("from body event");
  };

  //====Init

  const appendScriptInEl = (el = refType, scripts = []) => {
    const mainScripts = [];

    scripts.forEach((script) => {
      const scriptEl = document.createElement("script");
      scriptEl.src = script;
      el.append(scriptEl);
      // mainScripts.push(scriptEl.outerHTML);
    });
    // el.insertAdjacentHTML("beforeend", mainScripts.join("\n"));
  };

  // const appendScriptInElForCDN = (el = refType, scripts = []) => {
  //   const scriptsArr = [];

  //   scripts.forEach((scriptConf) => {
  //     const script = document.createElement("script");
  //     script.src = scriptConf.fileUrl;
  //     scriptConf.async && (script.async = scriptConf.async);
  //     scriptConf.defer && (script.defer = scriptConf.defer);
  //     editor
  //       .getWrapper()
  //       .getEl()
  //       ?.querySelector(`script["name"=${scriptConf.name}]`)
  //       ?.remove();
  //     script.setAttribute("name", scriptConf.name);
  //     // fragment.appendChild(script);
  //     // scripts.push(scriptsArr.outerHTML);
  //     el.append(script);
  //   });
  //   // el.insertAdjacentHTML("beforeend", scriptsArr.reverse().join("\n"));
  // };

  // const appendScriptInElForLocal = (el = refType, scripts = []) => {
  //   const scriptsArr = [];

  //   scripts.forEach(async (scriptConf) => {
  //     const script = document.createElement("script");
  //     script.innerHTML = await scriptConf.blob.text();
  //     scriptConf.async && (script.async = scriptConf.async);
  //     scriptConf.defer && (script.defer = scriptConf.defer);
  //     script.setAttribute("name", scriptConf.name);
  //     el.appendChild(script);
  //     // console.log(el.tagName, el, scripts, scriptConf, el.children);
  //     // scriptsArr.push(script.outerHTML);
  //   });

  //   // el.insertAdjacentHTML("beforeend", scriptsArr.reverse().join("\n"));
  // };

  // const appendStylesForLocal = (el = refType, styles = []) => {
  //   const stylesArr = [];

  //   styles.forEach(async (styleConf) => {
  //     const style = document.createElement("style");
  //     style.innerHTML = await styleConf.blob.text();
  //     style.setAttribute("name", styleConf.name);
  //     stylesArr.push(style.outerHTML);
  //   });
  //   el.insertAdjacentHTML("beforeend", stylesArr.join("\n"));
  // };

  // const appendStylesForCDN = (el = refType, styles = []) => {
  //   const stylesArr = [];

  //   styles.forEach((styleConf) => {
  //     const style = document.createElement("link");
  //     style.href = styleConf.fileUrl;
  //     style.setAttribute("name", styleConf.name);
  //     stylesArr.push(style.outerHTML);
  //   });
  //   el.insertAdjacentHTML("beforeend", stylesArr.join("\n"));
  // };

  const appendLocalPageAndGlobalCssAndJs = (body) => {
    const currentPageName = localStorage.getItem(current_page_id);
    const localScript = document.createElement("script");
    const localStyle = document.createElement("style");
    const globalScript = document.createElement("script");
    const globalStyle = document.createElement("style");

    // globalStyle.innerHTML = await projectData.globalCss.text();

    // localStyle.innerHTML = await projectData.pages[
    //   `${currentPageName}`
    // ].css.text();
    globalScript.src = URL.createObjectURL(projectData.globalJs);
    localScript.src = URL.createObjectURL(
      projectData.pages[`${currentPageName}`].js
    );

    // const body = editor.Canvas.getBody();
    [globalScript, localScript].forEach((item) => body.append(item));
  };

  /**
   *
   * @param {HTMLElement} el
   * @param {import('../helpers/types').LibraryConfig[]} libs
   */
  const appendFooterScripts = async (el, libs) => {
    const fragment = document.createDocumentFragment();
    libs.forEach(({ async, defer, file, fileUrl, isCDN }) => {
      const script = document.createElement("script");
      async && script.setAttribute("async", "true");
      defer && script.setAttribute("defer", "true");
      script.src = isCDN ? fileUrl : URL.createObjectURL(file);
      script.setAttribute("name", file.name);
      fragment.appendChild(script);
    });
    el.appendChild(fragment);
  };

  loadMainScriptsCallback = (body) => {
    // const body = editor.Canvas.getBody();
    // console.log("body : ", body);

    appendScriptInEl(body, mainScriptsForEditor);
    // editor.off("canvas:frame:load:body", loadMainScript);
  };

  loadFooterScriptsCallback = (ev) => {
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
    // .forEach((url) => {
    //   const script = document.createElement("script");
    //   if (url.file && url.file instanceof Blob) {
    //     script.src = URL.createObjectURL(url.file);
    //     script.setAttribute("name", url.name);
    //   } else if (!url.file && url instanceof Blob) {
    //     script.src = URL.createObjectURL(url);
    //     // script.setAttribute('name' , 'global')
    //   } else if (typeof url == "string") {
    //     script.src = url;
    //   }

    //   // fragment.appendChild(script);
    //   body.appendChild(script);
    // });

    const appendScript = (index) => {
      // console.log("index : ", index, allScripts);

      if (index > allScripts.length - 1) return;
      const script = document.createElement("script");
      const url = allScripts[index];
      if (url.file && url.file instanceof Blob) {
        script.src = URL.createObjectURL(url.file);
        script.setAttribute("name", url.name);
      } else if (!url.file && url instanceof Blob) {
        script.src = URL.createObjectURL(url);
        // script.setAttribute('name' , 'global')
      } else if (typeof url == "string") {
        script.src = url;
      }

      // fragment.appendChild(script);
      body.appendChild(script);
      script.onload = (ev) => {
        appendScript(index + 1);
      };
    };
    appendScript(0);
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
