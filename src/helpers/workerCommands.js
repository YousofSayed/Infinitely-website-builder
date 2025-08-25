import { parseHTML } from "linkedom";
import { db } from "./db";
import { inf_cmds_id, inf_symbol_Id_attribute } from "../constants/shared";
import * as ts from "typescript";
// import { doDocument } from "./functions";
// import monacoLoader from "@monaco-editor/loader";
// import { buildDynamicTemplate, buildScriptFromCmds } from "./worker_functions";
import {
  buildPageAsBlobForSecrviceWorker,
  buildPagesAsBlobForSecrviceWorker,
  defineRoot,
  doDocument,
  getFileSize,
  getOPFSProjectDir,
  getProjectRoot,
  handleFilesSize,
  hasExportDefault,
  installRestModelsAPI,
  needsWrapping,
  uploadProjectToTMP,
  wrapModule,
} from "./bridge";
import { uniqueId, isPlainObject, random } from "lodash";
import { opfs } from "./initOpfs";
import { tailwindClasses } from "../constants/tailwindClasses";
import { css_beautify } from "js-beautify";
import { stringify } from "css";
import { minify } from "csso";
import { setupTypeAcquisition } from "@typescript/ata";
import { walk, parse } from "css-tree";
// import { initDBAssetsSw } from "../serviceWorkers/initDBAssets-sw";
// import Dexie from "dexie";
//
const html = String.raw;
const css = String.raw;

let storeTimeout;

export function clearTimeouts(props) {
  clearTimeout(storeTimeout);
}

/**
 *
 * @param {{projectId : number }} props
 */
export async function updateAllPages(props) {
  try {
    const projectData = await db.projects.get(props.projectId);
    const pages = structuredClone(Object.values(projectData.pages));
    const updatedPages = {};
    await Promise.all(
      pages.map(async (page) => {
        const pageSymbols = [];
        const pageContent = await page.html.text();
        if (!pageContent) {
          page.symbols = pageSymbols;
          updatedPages[page.name] = page;
          return page;
        }

        const { document } = parseHTML(doDocument(pageContent));
        const oldSymbols = document.body.querySelectorAll(
          `[${inf_symbol_Id_attribute}]`
        );

        if (!oldSymbols.length) {
          page.symbols = pageSymbols;
          updatedPages[page.name] = page;
          return page;
        }

        await Promise.all(
          [...oldSymbols].map(async (oldSybmol) => {
            const symbolId = oldSybmol.getAttribute(inf_symbol_Id_attribute);
            pageSymbols.push(symbolId);
            const dbSymbol = projectData.symbols[`${symbolId}`];

            oldSybmol.outerHTML = await dbSymbol.content.text();

            return await oldSybmol;
          })
        );

        page.html = new Blob([document.body.innerHTML], { type: "text/html" });
        page.symbols = pageSymbols;
        updatedPages[page.name] = page;
        return page;
      })
    );

    await db.projects.update(props.projectId, {
      pages: {
        ...updatedPages,
      },
    });

    console.log(`pages updated in worker successfully : `, updatedPages);
  } catch (error) {
    console.error(`From Worker : ${error}`);
  }
}

/**
 *
 * @param {{
 * data : import('./types').Project ,
 * files:{[key:string] : File},
 *  projectId : number ,
 *  updatePreviewPages : boolean ,
 *  pageName:string,
 * pageUrl:string,
 * tailwindcssStyle:string | undefined;
 * editorData: { canvasCss:string , editorCss:string },
 * }} props
 */
export async function storeGrapesjsDataIfSymbols(props) {
  // try {
  storeTimeout && clearTimeout(storeTimeout);
  storeTimeout = setTimeout(async () => {
    const projectDataFromDB = await db.projects.get(props.projectId);
    const projectData = await props.data;
    const pages = structuredClone(Object.values(projectData.pages));
    const updatedPages = {};
    if (props.files && isPlainObject(props.files)) {
      await opfs.writeFiles(
        Object.entries(props.files).map(([key, file]) => ({
          path: defineRoot(key),
          content: file,
        }))
      );
    }

    if (props.tailwindcssStyle) {
      console.log("from worker : ", props.tailwindcssStyle);

      await opfs.writeFiles([
        {
          path: defineRoot(`css/tailwind/${props.pageName}.css`),
          content: props.tailwindcssStyle,
        },
      ]);
    }

    await Promise.all(
      pages.map(async (page) => {
        const pageSymbols = [];
        const pageContent = await (
          await opfs.getFile(defineRoot(page.pathes.html))
        ).text();
        if (!pageContent) {
          page.symbols = pageSymbols;
          updatedPages[page.name] = page;
          return page;
        }

        const { document } = parseHTML(doDocument(pageContent));
        const oldSymbols = document.body.querySelectorAll(
          `[${inf_symbol_Id_attribute}]`
        );

        if (!oldSymbols.length) {
          page.symbols = pageSymbols;
          updatedPages[page.name] = page;
          return page;
        }

        await Promise.all(
          [...oldSymbols].map(async (oldSybmol) => {
            const symbolId = oldSybmol.getAttribute(inf_symbol_Id_attribute);
            pageSymbols.push(symbolId);
            const dbSymbol = projectDataFromDB.symbols[`${symbolId}`];

            oldSybmol.outerHTML = await (
              await opfs.getFile(defineRoot(dbSymbol.pathes.content))
            ).text();

            return await oldSybmol;
          })
        );

        await opfs.writeFiles([
          {
            path: defineRoot(page.pathes.html),
            content: document.body.innerHTML,
          },
        ]);
        // page.html = new Blob([document.body.innerHTML], { type: "text/html" });
        page.symbols = pageSymbols;
        updatedPages[page.name] = page;
        return page;
      })
    );

    const newData = {
      ...props.data,
      pages: {
        ...updatedPages,
      },
    };

    await db.projects.update(props.projectId, newData);
    if (props.updatePreviewPages) {
      await writePreviewPage(props);
    }
    self.postMessage({
      command: "storeGrapesjsDataIfSymbols",
      props: {
        done: true,
        projectId: props.projectId,
      },
    });
    console.log(`pages updated in worker successfully : `, updatedPages);
  }, 15);

  // }

  // catch (error) {
  //   self.postMessage({
  //     command: "storeGrapesjsDataIfSymbols",
  //     props: {
  //       done: false,
  //       projectId: props.projectId,
  //     },
  //   });
  //   console.error(`From Worker : ${error}`);
  // }
}

/**
 *
 * @param {{projectId : string , symbolId:string , unlink : boolean , deleteAll:boolean}} props
 */
export async function deleteAllSymbolsById(props) {
  const projectData = await db.projects.get(props.projectId);
  const pages = structuredClone(projectData.pages);
  const updatedPages = {};

  await Promise.all(
    Object.values(pages).map(async (page) => {
      const { document } = parseHTML(
        doDocument(
          await (await opfs.getFile(defineRoot(page.pathes.html))).text()
        )
      );
      const deleteSymbol = (id) => {
        const symbolsById = document.body.querySelectorAll(
          `[${inf_symbol_Id_attribute}="${id}"]`
        );
        symbolsById.forEach((symbol) => {
          if (props.unlink && !props.deleteAll) {
            symbol.removeAttribute(inf_symbol_Id_attribute);
          } else if (props.deleteAll) {
            symbol.remove();
          }
        });
      };

      Array.isArray(props.symbolId)
        ? props.symbolId.forEach((id) => deleteSymbol(id))
        : deleteSymbol(props.symbolId);

      let pageSymbols = [
        ...document.body.querySelectorAll(`[${inf_symbol_Id_attribute}]`),
      ].map((symbol) => symbol.getAttribute(`[${inf_symbol_Id_attribute}]`));

      await opfs.writeFiles([
        {
          path: defineRoot(page.pathes.html),
          content: document.body.innerHTML,
        },
      ]);
      // page.html = new Blob([document.body.innerHTML], { type: "text/html" });
      page.symbols = pageSymbols;
      updatedPages[page.name] = page;
      return page;
    })
  );

  await db.projects.update(props.projectId, {
    pages: updatedPages,
  });

  self.postMessage({ command: "deleteAllSymbolsById", props: { done: true } });
  console.log("From worker : deleted props is done");
}

/**
 *
 * @param {{
 * data : import('./types').Project ,
 * files:{[key:string] : File},
 *  projectId : number ,
 *  updatePreviewPages : boolean ,
 *  pageName:string,
 * pageUrl:string,
 * tailwindcssStyle:string | undefined;
 * editorData: { canvasCss:string , editorCss:string },
 * }} props
 */
export async function updateDB(props) {
  console.log("From updateDB ");

  // try {

  if (!opfs.id) {
    throw new Error(`OPFS Id not founded!`);
  }

  if (!props.projectId && !opfs.id) {
    throw new Error(`DB Id not founded!`);
  }
  // const projectDir = await getOPFSProjectDir();
  // const projectRoot = `projects/project-${opfs.id}`;
  console.log(
    "From worker : Update project is done"
    // props.projectId,
    // props.data
  );

  return new Promise((res, rej) => {
    storeTimeout && clearTimeout(storeTimeout);
    storeTimeout = setTimeout(async () => {
      console.warn("Before save to db", props.files);

      if (props.files && isPlainObject(props.files)) {
        await opfs.writeFiles(
          Object.entries(props.files).map(([key, file]) => ({
            path: defineRoot(key),
            content: file,
          }))
        );
      }

      if (props.tailwindcssStyle) {
        console.log("from worker : ", props.tailwindcssStyle);

        await opfs.writeFiles([
          {
            path: defineRoot(`css/tailwind/${props.pageName}.css`),
            content: props.tailwindcssStyle,
          },
        ]);
      }

      const resp = await db.projects.update(
        props.projectId || opfs.id,
        props.data
      );
      if (props.updatePreviewPages) {
        await writePreviewPage(props);
      }
      console.warn("after save to db");
      self.postMessage({
        command: "updateDB",
        props: {
          done: true,
          projectId: props.projectId,
        },
      });
      res(resp);
      return resp;
    }, 15);
  });
  // } catch (error) {
  //   console.error(`From worker command updateDB: ${error}`);
  //   self.postMessage({
  //     command: "updateDB",
  //     props: {
  //       done: false,
  //       projectId: props.projectId,
  //     },
  //   });
  //   return false;
  // }
}

/**
 *
 * @param {{
 * data : import('./types').Project ,
 * projectSetting:import('./types').ProjectSetting,
 *  projectId : number ,
 *  updatePreviewPages : boolean ,
 *  pageName:string,
 * pageUrl:string,
 * editorData: { canvasCss:string , editorCss:string },
 * }} props
 */
export async function writePreviewPage(props) {
  const pageFile = (
    await buildPageAsBlobForSecrviceWorker({
      editorData: props.editorData,
      projectData: {
        ...(await db.projects.get(props.projectId)),
        ...props.data,
      },
      pageName: props.pageName,
      projectSetting: props.projectSetting || {},
    })
  )[`${props.pageName}.html`];

  await opfs.writeFiles([
    {
      path: defineRoot(
        `${props.pageName == "index" ? "" : "pages"}/${props.pageName}.html`
      ),
      content: pageFile,
    },
  ]);

  const previewBraodcast = new BroadcastChannel("preview");
  previewBraodcast.postMessage({
    command: "preview",
    props: {
      url: `${props.pageName == "index" ? "" : "pages"}/${props.pageName}.html`,
    },
  });

  previewBraodcast.close();
}

/**
 *
 * @param {{projectId : number , dynamicTemplateId: string, data : import('./types').CMD[]}} props
 */
// export async function updateDynamicTemplates(props) {
//   const projectData = await db.projects.get(props.projectId);
//   const dynamicTemplates = projectData.dynamicTemplates;
//   const targetDynamicTemplate = dynamicTemplates[props.dynamicTemplateId];
//   const pages = projectData.pages;

//   console.log("from worker : ", props);

//   for (const pageKey in pages) {
//     const page = pages[pageKey];
//     const pageCmds = page.cmds;
//     const { document } = parseHTML(doDocument(await page.html.text()));

//     for (const cmdsKey in pageCmds) {
//       for (const cmd of pageCmds[cmdsKey]) {
//         if (cmd.name.toLowerCase() != "put_dynamic_template") continue;

//         for (const param of cmd.params) {
//           if (
//             !param?.renderDynamicElement &&
//             param?.dynamicTemplateId != props?.dynamicTemplateId
//           )
//             continue;

//           param.value = buildDynamicTemplate(
//             html` ${await targetDynamicTemplate.cmp.text()} `,
//             html`
//               <style id="style-of-${targetDynamicTemplate.id}-dynamic-template">
//                 ${await targetDynamicTemplate.allRules.text()}
//               </style>
//             `
//           );
//         }
//       }

//       document
//         .querySelectorAll(`[${inf_cmds_id}="${cmdsKey}"]`)
//         .forEach((el) => {
//           el.setAttribute("_", buildScriptFromCmds(pageCmds[cmdsKey]));
//         });
//     }

//     page.html = new Blob([document.body.innerHTML], { type: "text/html" });
//   }

//   for (const key in dynamicTemplates) {
//     const template = dynamicTemplates[key];
//     if (template.id == props.dynamicTemplateId) continue;
//     const { document } = parseHTML(doDocument(await template.cmp.text()));
//     const cmdsObj = template.cmds;

//     for (const cmdKey in cmdsObj) {
//       const cmds = cmdsObj[cmdKey];

//       for (const cmd of cmds) {
//         if (cmd.name != "put_dynamic_template") continue;

//         for (const param of cmd.params) {
//           console.log("paaarraam : ", param);

//           if (
//             !param.renderDynamicElement ||
//             param?.dynamicTemplateId?.toLowerCase?.() != props.dynamicTemplateId
//           )
//             continue;
//           param.value = buildDynamicTemplate(
//             html` ${await targetDynamicTemplate.cmp.text()} `,
//             html`
//               <style id="style-of-${targetDynamicTemplate.id}-dynamic-template">
//                 ${await targetDynamicTemplate.allRules.text()}
//               </style>
//             `
//           );
//         }
//       }

//       document
//         .querySelectorAll(`[${inf_cmds_id}="${cmdKey}"]`)
//         .forEach((el) => {
//           el.setAttribute("_", buildScriptFromCmds(cmds));
//         });
//     }

//     template.cmp = new Blob([document.body.innerHTML], { type: "text/html" });
//   }

//   await db.projects.update(props.projectId, {
//     pages,
//     dynamicTemplates,
//   });

//   console.log(`From worker all dynamics templates update done 👍`);
// }

/**
 *
 * @param {{projectId:number , key:string}} props
 */
export async function getDataFromDB(props) {
  const projectData = await db.projects.get(props.projectId);

  self.postMessage({
    command: "getDataFromDB",
    props: {
      key: props.key,
      data: projectData[props.key],
    },
  });
  console.log(`From worker ${props.key} geted done 👍`);
}

// /**
//  *
//  * @param {{projectId : number }} props
//  */
// // workerCommands.js
// export function keepSwLive(props) {
//   console.log("alive");

//   initDBAssetsSw(() => {}).then(async () => {
//     // Ensure the SW is registered and active
//     // const registration = await navigator.serviceWorker.getRegistration();

//     // if (!registration || !registration.active) {
//     //   console.log("No active SW, registering...");
//     //   await navigator.serviceWorker.register('/dbAssets-sw.js');
//     //   keepSwLive(props)
//     //   return; // Wait for next interval to post message
//     // }

//     // const controller = navigator.serviceWorker.controller;
//     // if (controller) {
//     self.postMessage({
//       command: "setVar",
//       props: {
//         obj: {
//           projectId: props.projectId,
//           projectData: await db.projects.get(props.projectId),
//         },
//       },
//     });
//     // } else {
//     //   console.log("SW controller not available yet");
//     // }
//   });

//   fetch("/keep-alive", { mode: "no-cors" });
// }

/**
 *
 * @param {{projectId:number , toastId:string, assets : File[]}} props
 */
export async function uploadAssets(props) {
  console.log("from worker assets update starting: ", props.assets);
  const toastId = uniqueId("upload-toast-id-");
  workerSendToast({
    msg: "Uploading Files...",
    type: "loading",
    dataProps: { toastId },
  });
  try {
    const filesHandled = await handleFilesSize(props.assets, props.projectId);

    let isFilesUploaded = false;

    /**
     *
     * @param {number} starterLoopIndex
     * @param {File[]} assetsFiles
     * @param {Function} endCallback
     * @returns
     */
    const uploadFiles = async (
      starterLoopIndex = 0,
      assetsFiles = [],
      endCallback = () => {}
    ) => {
      console.log("uploading files : ", assetsFiles, "from worker");
      if (!assetsFiles.length) return;
      const ender = starterLoopIndex + 15;
      const slicedFiles = assetsFiles.slice(starterLoopIndex, ender + 1);

      slicedFiles.length &&
        (await new Promise((res, rej) => {
          setTimeout(
            async () => {
              const dbResponse = await (
                await opfs.createFiles(
                  slicedFiles.map((file) => ({
                    path: defineRoot(`assets/${file.name}`),
                    content: file,
                  })),
                  true
                )
              ).length;
              // slicedFiles.forEach(async file=>{
              //   const stream = file.file.stream();
              //   const reader = stream.getReader();
              //   while(true){
              //     const {value , done}=await reader.read();
              //     if(done)break;

              //   }
              // })
              console.log(
                "updating  files before response : ",
                slicedFiles,
                "from worker"
              );
              if (dbResponse) {
                console.log(
                  "updating files after response : ",
                  slicedFiles,
                  "from worker"
                );

                res(dbResponse);
              }
            },
            starterLoopIndex == 0 ? 0 : 50
          );
        }));

      if (slicedFiles.length == 0) {
        endCallback();
        return;
      } else {
        return uploadFiles(ender + 1, assetsFiles, endCallback);
      }
    };

    // await uploadFiles(0, normalFiles, () => {
    //   isNoramlFilesUploaded = true;
    // });

    // await uploadFiles(0, bigFiles, async () => {
    //   isBigFilesUploaded = true;
    // });

    filesHandled.igonredFiles.length &&
      self.postMessage({
        command: "toast",
        props: {
          msg: `${filesHandled.igonredFiles.length} Files Ignored Because Maximum Size Is 250MB`,
          type: "warn",
        },
      });

    // await uploadFiles(0, filesHandled.assets, () => {
    //   isFilesUploaded = true;
    // });
    // const assetsNew = await (await getProjectData()).assets;
    // assetsNew.push(...filesHandled.assets);
    // await db.projects.update(props.projectId, {
    //   assets: assetsNew, // update assets in db
    // });
    // const willUploadAssets = filesHandled.assets.map((asset) => ({
    //   path: defineRoot(`assets/${asset.name}`),
    //   content: asset,
    // }));

    // await opfs.createFiles(willUploadAssets);

    await uploadFiles(0, filesHandled.assets, () => {
      isFilesUploaded = true;
    });

    workerSendToast({
      isNotMessage: true,
      msg: toastId,
      type: "done",
    });

    isFilesUploaded &&
      workerSendToast({
        msg: "Files Uploaded Successfully",
        type: "success",
      });

    self.postMessage({
      command: "initSevrviceWorker",
    });
  } catch (error) {
    // await updateDB({ projectId: props.projectId, data: props.assets });
    console.error(`From worker command uploadAssets: ${error}`);
    workerSendToast({
      isNotMessage: true,
      msg: toastId,
      type: "dismiss",
      dataProps: {
        progressClassName: "bg-[crimson]",
      },
    });
    self.postMessage({
      command: "toast",
      props: {
        msg: "Faild To Upload Files",
        type: "error",
      },
    });
  }
}

export function varsToServiceWorker(props = {}) {
  try {
    self.postMessage({
      command: "varsToServiceWorker",
      props: {
        vars: { ...props },
      },
    });

    console.log("From worker varsToServiceWorker callback is done well 👍");
  } catch (error) {
    console.error(
      `From worker varsToServiceWorker callback error  ${error.message}`
    );
  }
}

/**
 *
 * @param {{editorData : {canvasCss:string , editorCss:string} , projectId:number}} props
 */
export async function sendPreviewPagesToServiceWorker(props) {
  varsToServiceWorker({
    pageUrl: props.pageUrl,
    previewPages: await buildPagesAsBlobForSecrviceWorker({
      editorData: props.editorData,
      projectData: await db.projects.get(+props.projectId),
    }),
  });
}

/**
 *
 * @param {{editorData : {canvasCss:string , editorCss:string} , projectId:number , pageName:string ,
 *  projectData : import('./types').Project
 * }} props
 */
export async function sendPreviewPageToServiceWorker(props) {
  console.log("sending page to preview");

  varsToServiceWorker({
    pageUrl: props.pageUrl,
    updateOnce: true,
    previewPage: await buildPageAsBlobForSecrviceWorker({
      editorData: props.editorData,
      projectData:
        props.projectData || (await db.projects.get(+props.projectId)),
      pageName: props.pageName,
    }),
  });
}

// export function refreshServiceWorker(params) {
//   setTimeout(() => {
//     const swContainer = new ServiceWorkerContainer();
//     swContainer.register
//   }, 15000);
// }

/**
 *
 * @param {{msg:string , type: import('react-toastify').TypeOptions | 'loading' | 'done' | 'dismiss' , dataProps:import('react-toastify').ToastOptions , isNotMessage:boolean}} param0
 */
export function workerSendToast({
  msg = "",
  type = "",
  dataProps = {},
  isNotMessage,
}) {
  self.postMessage({
    command: "toast",
    props: {
      isNotMessage,
      msg,
      type,
      dataProps,
    },
  });
}

/**
 *
 * @param {{projectId : number}} props
 */
export async function offlineInstaller(props) {
  try {
    await initOPFS({ id: props.projectId });
    const projectData = await db.projects.get(props.projectId);
    const mime = (await import("mime")).default;
    await installRestModelsAPI(projectData.restAPIModels);
    await Promise.all(
      projectData.jsFooterLibs
        .concat(projectData.jsHeaderLibs)
        .concat(projectData.cssLibs)
        // .concat(Object.values(projectData.fonts))
        .map(async (lib) => {
          if (!lib.isCDN) return lib;
          if (lib.isInstallDone) return lib;
          const res = await fetch(lib.fileUrl);
          const blob = await res.blob();
          const ext = mime.getExtension(blob.type);
          const file = new File(
            [blob],
            `${lib.name.replace(`.${ext}`, "")}.${ext}`,
            { type: blob.type }
          );

          await opfs.writeFiles([
            {
              path: defineRoot(lib.path),
              content: file,
            },
          ]);
          lib.size = getFileSize(file).MB;
          lib.isInstallDone = true;
          return lib;
        })
    );

    await db.projects.update(props.projectId, {
      // fonts: projectData.fonts,
      jsHeaderLibs: projectData.jsHeaderLibs,
      jsFooterLibs: projectData.jsFooterLibs,
      cssLibs: projectData.cssLibs,
      restAPIModels: projectData.restAPIModels,
    });

    self.postMessage({
      command: "offlineInstaller",
      props: {
        update: true,
      },
    });
  } catch (error) {
    console.error(`From offline installer worker : ${error.message}`);
    self.postMessage({
      command: "offlineInstaller",
      props: {
        update: false,
      },
    });
  }
}

let allStyleSheetClasses;
/**
 *
 * @param {{
 * projectId : number ,
 * inlineStylesInners : string[],
 * editorCss:string,
 * projectSettings : import('./types').ProjectSetting
 * }} props
 * @returns
 */
export const getAllStyleSheetClasses = async (props) => {
  try {
    allStyleSheetClasses && clearTimeout(allStyleSheetClasses);
    allStyleSheetClasses = setTimeout(async () => {
      //   const myLol = 'myLol'
      //  console.log(eval(` console.log(myLol)`));
      await initOPFS({ id: props.projectId });
      // const per1 = performance.now();
      console.log(defineRoot(`libs/css`));
      const calssRgx = /(?<!\/\*.*)\.[a-zA-Z_][a-zA-Z0-9_-]*(?=[,{\s:])/gi; ///(?<=\s|^)\.[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*{)/g;
      const commentRgx = /\/\*[\s\S]*?\*\//g;
      const prjectData = await db.projects.get(props.projectId);
      const getClasses = (value = "") => {
        // const parsedValue = parse(value)
        //   .stylesheet.rules.filter(
        //     (rule) =>
        //       (rule.type == "rule" || rule.type == "media") &&
        //       rule.selectors?.length == 1 &&
        //       rule.selectors[0].match(calssRgx)
        //   )
        //   .map((rule) =>
        //     rule.selectors[0].startsWith(".")
        //       ? rule.selectors[0].slice(1)
        //       : rule.selectors[0]
        //   )

        // console.log(parsedValue);

        const ast = parse(value);
        const classes = new Set();

        walk(ast, (node) => {
          if (node.type === "ClassSelector") {
            classes.add(node.name); // Set removes duplicates
          }
        });
        console.log("cllassses : ", classes);

        return [...classes].sort();

        // value = stringify({
        //   stylesheet: {
        //     rules: parse(value).stylesheet.rules.filter(
        //       (rule) =>
        //         (rule.type == "rule" || rule.type == "media") &&
        //         rule.selectors?.length == 1 &&
        //         rule.selectors[0].match(calssRgx)
        //     ).map(rule=>rule.selectors[0].startsWith(".") ? rule.selectors[0].slice(1) : rule.selectors[0]),
        //   },
        // });

        // return (
        //   value
        //     .replaceAll(commentRgx, "")
        //     .match(calssRgx)
        //     ?.map((cls) => (cls.startsWith(".") ? cls.slice(1) : cls)) || []
        // );
      };
      // const cssLibsClasses = (
      //   (await Promise.all(
      //     (
      //       await opfs.getAllFiles(defineRoot(`libs/css`), { recursive: true })
      //     ).map((handle) => handle.stream())
      //   )) || []
      // )
      //   .join("\n")
      //   .replaceAll(commentRgx, "")
      //   .match(calssRgx);

      for (const fHandle of await opfs.getAllFiles(defineRoot(`libs/css`), {
        recursive: true,
      })) {
        self.postMessage({
          command: "classes-chunks",
          props: {
            classes: getClasses(await fHandle.text()),
          },
        });
        // const stream = await fHandle.stream();
        // const reader = stream.getReader();
        // while (true) {
        //   const { done, value } = await reader.read();
        //   if (done) break;

        //   const encodedValue = new TextDecoder().decode(value);
        //   console.log("gettting : ", encodedValue);
        // self.postMessage({
        //   command: "classes-chunks",
        //   props: {
        //     classes: getClasses(encodedValue),
        //   },
        // });
        // }
      }

      self.postMessage({
        command: "classes-chunks",
        props: {
          classes: getClasses(props.editorCss),
        },
      });

      // const editorClasses =
      //   css_beautify(props.editorCss).replaceAll(commentRgx, "").match(calssRgx) ||
      //   [];
      // for (const inlineStyle of props.inlineStylesInners) {
      //   self.postMessage({
      //     command: "classes-chunks",
      //     props: {
      //       classes: getClasses(inlineStyle),
      //     },
      //   });
      // }

      if (props.projectSettings.enable_tailwind) {
        self.postMessage({
          command: "classes-chunks",
          props: {
            classes: tailwindClasses,
          },
        });
      }
      // const inlineStyles = css_beautify(props.inlineStylesInners.join("\n"))
      //   .replaceAll(commentRgx, "")
      //   .match(calssRgx);

      // let tailwindClasses = [];
      // if (props.projectSettings.enable_tailwind) {
      //   // const tailwindStyles = await (await fetch("/styles/tailwind.min.css")).text();

      //   tailwindClasses = tailwindStyles.replaceAll(commentRgx, "").match(calssRgx);
      //   console.log('tailwind response : ', tailwindStyles , tailwindClasses);
      // }
      // console.log("libs", cssLibsClasses, inlineStyles);

      // const allClasses = [
      //   ...new Set([
      //     ...(cssLibsClasses || []),
      //     ...(editorClasses || []),
      //     ...(inlineStyles || []),
      //     ...(props.projectSettings.enable_tailwind ? tailwindClasses : []),
      //   ]),
      // ].sort();

      const per2 = performance.now();
      console.log(per2);
      // console.log("Classes : ", allClasses);
      // const classes =
      //   allClasses.map((className) => className.replace(".", "")) || [];
      // console.log("classes", classes);

      // self.postMessage({ command: "classes", props: { classes } });
      // return classes;
    }, 70);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 *
 * @param {{data : {
 * name:string,
 * description:string,
 * }}} param0
 */
export async function createProject({ data }) {
  const tId = uniqueId("toast-");
  try {
    workerSendToast({
      msg: "Init Project",
      type: "loading",
      dataProps: {
        toastId: tId,
      },
    });

    const id = await db.projects.add({
      name: data.name,
      description: data.description,
      logo: "logo.png",
      blocks: {},
      // cssLibraries: [],
      // jsHeaderLocalLibraries: [],
      // jsHeaderCDNLibraries: [],
      // jsFooterLocalLibraries: [],
      // jsFooterCDNLibraries: [],
      // cssFooterCDNLibraries: [],
      // cssFooterLocalLibraries: [],
      // cssHeaderCDNLibraries: [],
      // cssHeaderLocalLibraries: [],
      cssLibs: [],
      jsHeaderLibs: [],
      jsFooterLibs: [],
      pages: {
        index: {
          // html: new Blob([``], { type: "text/html" }),
          // css: new Blob([``], { type: "text/css" }),
          // js: new Blob([``], { type: "text/javascript" }),
          pathes: {
            html: "editor/pages/index.html",
            css: "css/index.css",
            js: "js/index.js",
          },
          cmds: {},
          id: "index",
          name: "index",
          symbols: [],
          components: {},
          helmet: {},
          bodyAttributes: {},
        },
        playground: {
          // html: new Blob([``], { type: "text/html" }),
          // css: new Blob([``], { type: "text/css" }),
          // js: new Blob([``], { type: "text/javascript" }),
          pathes: {
            html: "editor/pages/playground.html",
            css: "css/playground.css",
            js: "js/playground.js",
          },
          id: "playground",
          symbols: [],
          cmds: {},
          name: "playground",
          components: {},
          helmet: {},
          bodyAttributes: {},
        },
      },
      // globalCss: new Blob([``], { type: "text/css" }),
      // globalJs: new Blob([``], { type: "text/javascript" }),
      symbols: {},
      assets: [],
      dynamicTemplates: {},
      restAPIModels: [],
      symbolBlocks: [],
      globalRules: {},
      fonts: {},
      motions: {},
      interactions: {},
      inited: false,
    });
    const mainPath = `/projects/project-${id}`;

    // await dir(mainPath).create()

    const mainRoot = await opfs.root;
    // const projectsRoot = await opfs.getFolder(mainRoot, "projects");
    // const projectDir = await opfs.createFolder(projectsRoot, `project-${id}`);
    const dirs = [
      `${mainPath}/pages`,
      `${mainPath}/css`,
      `${mainPath}/js`,
      `${mainPath}/assets`,
      `${mainPath}/fonts`,
      `${mainPath}/libs`,
      `${mainPath}/editor`,
      `${mainPath}/editor/pages`,
      `${mainPath}/editor/symbols`,
      `${mainPath}/editor/templates`,
      `${mainPath}/global`,
      `${mainPath}/libs/js`,
      `${mainPath}/libs/css`,
      `${mainPath}/libs/js/header`,
      `${mainPath}/libs/js/footer`,
    ];

    const files = [
      {
        path: `${mainPath}/screenshot.webp`,
        content: "",
      },
      {
        path: `${mainPath}/index.html`,
        content: "",
      },
      {
        path: `${mainPath}/global/global.js`,
        content: "",
      },

      {
        path: `${mainPath}/global/global.css`,
        content: "",
      },
      {
        path: `${mainPath}/editor/pages/index.html`,
        content: "",
      },
      {
        path: `${mainPath}/editor/pages/playground.html`,
        content: "",
      },
      {
        path: `${mainPath}/js/index.js`,
        content: "",
      },
      {
        path: `${mainPath}/js/playground.js`,
        content: "",
      },
      {
        path: `${mainPath}/css/index.css`,
        content: "",
      },
      {
        path: `${mainPath}/css/playground.css`,
        content: "",
      },
    ];
    // await write()
    // for (const dirTx of dirs) {
    //   await dir(`${mainPath}/${dirTx}`).create()
    // }

    // for (const fileDetails of files) {
    //   await write(`${mainPath}/${fileDetails.path}` , fileDetails.content)
    // }

    await opfs.createFolders(dirs);
    await opfs.createFiles(files);

    await db.projects.update(id, { inited: true });
    workerSendToast({
      isNotMessage: true,
      msg: tId,
      type: "done",
    });

    self.postMessage({
      command: "createProject",
      props: {
        done: true,
      },
    });
  } catch (error) {
    workerSendToast({
      isNotMessage: true,
      msg: tId,
      type: "dismiss",
      dataProps: {
        progressClassName: "bg-[crimson]",
      },
    });

    self.postMessage({
      command: "createProject",
      props: {
        done: false,
      },
    });
    throw new Error(error);
  }
}

export async function initOPFS({ id }) {
  await opfs.init(id);
}

export async function listenToOPFSBroadcastChannel({ id }) {
  console.log("INited listenToOPFSBroadcastChannel", id);

  await initOPFS({ id });
  const opfsBc = new BroadcastChannel("opfs");
  opfsBc.addEventListener("message", (ev) => {
    console.log(`opfcBc : `, ev.data);
  });
  const broadCastCleaner = opfs.onBroadcast(
    "getFile",
    async (data) => {
      const path = `${data.folderPath}/${data.fileName}`;
      console.log(
        "recived getFile event from boadcast",
        opfs.id,
        data.projectId,
        path
      );
      try {
        if (!opfs.id) {
          opfs.opfsBraodcast.postMessage({
            type: "sendFile",
            file: undefined,
            isExisit: false,
            fileName: undefined,
            filePath: undefined,
          });
          throw new Error(`Project id not found`);
        }

        const fileHandle = await opfs.getFile(
          `${getProjectRoot(id)}/${
            data.folderPath ? `${data.folderPath}/` : ""
          }${data.fileName}`
        );
        const file = await fileHandle.getOriginFile();

        console.log(
          "recived path : ",
          `${getProjectRoot(id)}/${
            data.folderPath ? `${data.folderPath}/` : ""
          }${data.fileName}`,
          file,
          {
            type: "sendFile",
            file: file,
            isExisit: file ? true : false,
            fileName: fileHandle.name,
            filePath: fileHandle.path,
          }
        );
        if (!file) {
          throw new Error(`File not founded`);
        }
        const fileBraodcast = new BroadcastChannel(path);
        fileBraodcast.postMessage({
          type: "sendFile",
          file: file,
          isExisit: file ? true : false,
          fileName: fileHandle.name,
          filePath: fileHandle.path,
        });
      } catch (error) {
        const fileBraodcast = new BroadcastChannel(path);
        fileBraodcast.postMessage({
          type: "sendFile",
          file: undefined,
          isExisit: false,
          fileName: undefined,
          filePath: undefined,
        });
        throw new Error(error);
      }
    }
    // { once: true }
  );
  /**
   *
   * @param {MessageEvent} ev
   */
  const clean = (ev) => {
    if (ev.data.command == "clean-opfs-broadcast") {
      broadCastCleaner();
      self.removeEventListener("message", clean);
    }
  };

  self.addEventListener("message", clean);

  self.postMessage({
    command: "listenToOPFSBroadcastChannel",
    props: {
      done: true,
    },
  });
  return broadCastCleaner;
}

export async function removeOPFSEntry({
  path = "",
  toastMsg = "Deleting...",
  isFill = false,
}) {
  const toastId = uniqueId(`toast-${random(999, 1000)}`);
  try {
    workerSendToast({
      msg: toastMsg,
      type: "loading",
      dataProps: {
        toastId,
      },
    });
    const handle = isFill
      ? await opfs.getFile(path)
      : await opfs.getFolder(path);
    await opfs.remove({
      dirOrFile: handle,
    });
    workerSendToast({
      msg: toastId,
      type: "done",
      isNotMessage: true,
    });
  } catch (error) {
    workerSendToast({
      msg: toastId,
      type: "dismiss",
      isNotMessage: true,
      dataProps: {
        progressClassName: "bg-[crimson]",
      },
    });
    throw new Error(error);
  }
}

let swRegistrationState = "",
  refreshSWInterval,
  refreshSWTimeout,
  isFirstLoad = true;
// navigator.serviceWorker.getRegistration
export async function refreshSW() {
  const runer = async (delay = 0) => {
    refreshSWTimeout && clearTimeout(refreshSWTimeout);
    refreshSWTimeout = setTimeout(async () => {
      const response = await (await fetch(`/keep-alive`)).text();
      console.log(response);
      if (response != "ok") {
        // swRegistrationState != "done" &&
        self.postMessage({
          command: "refreshSW",
          error: "",
          props: {},
        });
      } else {
        await runer(15000);
      }
    }, delay);

    // refreshSWInterval = setInterval(
    //   async () => {
    //     try {
    //       const response = await (await fetch(`/keep-alive`)).text();
    //       console.log(response);

    //       if (!response.includes("ok")) {
    //         // swRegistrationState != "done" &&
    //         self.postMessage({
    //           command: "refreshSW",
    //           error: "",
    //           props: {},
    //         });
    //         clearInterval(refreshSWInterval);
    //       }
    //     } catch (error) {
    //       // swRegistrationState != "done" &&
    //       self.postMessage({
    //         command: "refreshSW",
    //         error,
    //         props: {},
    //       });
    //       clearInterval(refreshSWInterval);
    //       throw new Error(error);
    //     } finally {
    //       // firstCount = 15000
    //       isFirstLoad = false;
    //     }
    //   },
    //   isFirstLoad ? 0 : 15000
    // );
  };

  runer();
  // isFirstLoad = false;

  self.addEventListener("message", async (ev) => {
    const { data } = ev;
    const { msg, props } = data;
    if (msg == "sw-registration-state") {
      swRegistrationState = props.state;
      console.log(
        `From refreshSW worker got Registration state : `,
        props.state
      );
      await runer();
    }
  });

  return refreshSWInterval;
}

/**
 *
 * @param {{projectId:number , editorCss:string}} param0
 */
export async function getKeyFrames({
  projectId,
  editorCss = "",
  pageName = "",
}) {
  if (!projectId) {
    throw new Error("Project ID is required to get keyframes");
  }
  !opfs.id && (await initOPFS({ id: projectId }));
  let projectData = await db.projects.get(projectId);

  const editorKeyframes = parse(`${editorCss}} `).stylesheet.rules.filter(
    (rule) => rule.type == "keyframes"
  );

  const libsKeyframes = Object.fromEntries(
    await Promise.all(
      projectData.cssLibs
        .map(async (lib) => [
          lib.path,
          parse(
            await (await opfs.getFile(defineRoot(lib.path))).text()
          ).stylesheet.rules.filter(
            (rule) => rule.type == "keyframes" && rule.vendor == undefined
          ),
        ])
        .concat([[`css/${pageName}.css`, editorKeyframes]])
    )
  );

  self.postMessage({
    command: "getKeyFrames",
    props: Object.entries(libsKeyframes).flatMap(([path, animes]) =>
      animes.map((anim) => ({ ...anim, path }))
    ),
  });
}

export async function writeFilesToOPFS({ files }) {
  await opfs.writeFiles(files);
}

/**
 *
 * @param {{[key:string]:import('css').KeyFrames[]}} param0
 */
export async function saveAnimations({ animations }) {
  console.log("ana 3abet we ahbal begaad");

  const tId = uniqueId("toast-");

  // try {
  workerSendToast({
    msg: "Saving Animations",
    type: "loading",
    dataProps: {
      toastId: tId,
    },
  });

  const result = animations.reduce((acc, item) => {
    if (!acc[item.path]) {
      acc[item.path] = [];
    }
    acc[item.path].push(item);
    return acc;
  }, {});

  console.log("results : ", result);

  for (const key in result) {
    console.log(
      "stringify(result[key]) : ",
      stringify({ stylesheet: { rules: result[key] } })
    );
    const fileContent = await (await opfs.getFile(defineRoot(key))).text();
    await opfs.writeFiles([
      {
        path: key,
        content: minify(
          `${fileContent} \n ${stringify({
            stylesheet: { rules: result[key] },
          })}`,
          {
            restructure: true,
          }
        ).css,
      },
    ]);
  }

  self.postMessage({
    command: "saveAnimations",
    props: {
      done: true,
    },
  });

  workerSendToast({
    isNotMessage: true,
    msg: tId,
    type: "done",
  });
  workerSendToast({
    msg: "Animations Saved Successfully 👍",
    type: "success",
  });
  // } catch (error) {
  //   self.postMessage({
  //     command:'saveAnimations',
  //     props:{
  //       done:false
  //     }
  //   })

  //   workerSendToast({
  //     isNotMessage:true,
  //     msg:tId,
  //     type:'dismiss',
  //   });

  //   workerSendToast({
  //     msg:'Faild To Save Animations',
  //     type:'error'
  //   });

  //   throw new Error(error)
  // }
}

/**
 *
 * @param {{ projectId:number ,  projectSetting : import('./types').ProjectSetting}} props
 */
export async function shareProject(props) {
  let tId = uniqueId("share-project-");
  try {
    workerSendToast({
      msg: "Uploading...",
      type: "loading",
      dataProps: { toastId: tId },
    });
    const res = await uploadProjectToTMP(props);
    self.postMessage({
      command: "shareProject",
      response: res,
    });

    workerSendToast({
      isNotMessage: true,
      msg: tId,
      type: "done",
    });

    workerSendToast({
      msg: "Project shared successfully 💙",
      type: "success",
    });

    workerSendToast({
      msg: "URL expier after 60 minute",
      type: "warning",
    });
  } catch (error) {
    workerSendToast({
      isNotMessage: true,
      msg: tId,
      type: "dismiss",
      dataProps: {
        progressClassName: "bg-[crimson]",
      },
    });

    workerSendToast({
      msg: "Faild to upload & share project 💙",
      type: "error",
    });

    throw new Error(error);
  }
}

/**
 *
 * @param {{code:string , projectId:number , libConfig : import('./types').LibraryConfig }} props
 */
export async function installTypes({ projectId, code, libConfig }) {
  if (!code) return;
  const tId = uniqueId("install-types-id-");
  const projectData = await db.projects.get(projectId);
  await initOPFS({ id: +projectId });

  try {
    const ata = setupTypeAcquisition({
      projectName: projectData.name,
      logger: console,
      typescript: ts,
      delegate: {
        errorMessage: (userErrorMessage, error) => {
          workerSendToast({
            isNotMessage: true,
            msg: tId,
            type: "dismiss",
            dataProps: {
              progressClassName: "bg-[crimson]",
            },
          });
          workerSendToast({
            msg: userErrorMessage,
            type: "error",
          });
          throw new Error(error);
        },

        started: () => {
          workerSendToast({
            msg: "Installing library types...",
            type: "loading",
            dataProps: {
              toastId: tId,
            },
          });
        },

        finished: (files) => {
          files.forEach((value, path) => {
            opfs.writeFiles([
              {
                path: defineRoot(`types/${libConfig.nameWithoutExt}${path}`),
                content:
                  needsWrapping(value) && libConfig.globalName
                    ? wrapModule(
                        libConfig.nameWithoutExt,
                        value
                        // hasExportDefault(value)
                        //   ? value.replace("export default", "export")
                        //   : value
                      )
                    : value,
              },
            ]);
          });
          console.log("Type installed successfully");
          workerSendToast({
            isNotMessage: true,
            msg: tId,
            type: "done",
            dataProps: {
              progressClassName: "bg-green-500",
            },
          });
        },
      },
    });

    ata(code);
  } catch (error) {
    workerSendToast({
      isNotMessage: true,
      msg: tId,
      type: "dismiss",
      dataProps: {
        progressClassName: "bg-[crimson]",
      },
    });

    workerSendToast({
      msg: error.message,
      type: "error",
    });
    throw new Error(error);
  }
}
