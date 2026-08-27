import {
  wp_create_option,
  wp_get_media_files_by_slugs,
  wp_update_media_files,
  wp_update_media_files_by_slugs,
  wp_update_meta,
  wp_update_option,
  wp_upload_file,
} from "@/Apps/wordpress/functions";
import {
  buildScripts,
  global_types,
  inf_cmds_id,
  inf_symbol_Id_attribute,
  interactionId,
  interactionInstanceId,
  mainInteractionId,
  mainMotionId,
  motionId,
  motionInstanceId,
} from "@/constants/shared";

import {
  buildInteractionsAttributes,
  buildPageAsBlobForSecrviceWorker,
  buildPagesAsBlobForSecrviceWorker,
  defineRoot,
  doDocument,
  doGlobalType,
  doInNormalAsyncInWorker,
  doInWordpressAsyncInWorker,
  extractElementStyles,
  getFileSize,
  // getOPFSProjectDir,
  getProjectRoot,
  handleFilesSize,
  initMainAndGlobalFilesForWp,
  // hasExportDefault,
  installRestModelsAPI,
  svgToDataURL,
  // needsWrapping,
  uploadProjectToTMP,
  // wrapModule,
} from "@/helpers/bridge";
import { db } from "@/helpers/db";
import { opfs } from "@/helpers/initOpfs";
import { installTypes } from "@/helpers/installTypes";
// FIXME: unresolved import - buildDynamicTemplate/buildScriptFromCmds are not defined anywhere in this codebase snapshot - needs manual attention

import { minify } from "csso";
import { parseHTML } from "linkedom";

import { uniqueId, isPlainObject, random, isNumber } from "lodash";

//
//
//

//
//
//

//
//
//
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
          `[${inf_symbol_Id_attribute}]`,
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
          }),
        );

        page.html = new Blob([document.body.innerHTML], { type: "text/html" });
        page.symbols = pageSymbols;
        updatedPages[page.name] = page;
        return page;
      }),
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
 * data : import('@/helpers/types').Project ,
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
        })),
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
          `[${inf_symbol_Id_attribute}]`,
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
          }),
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
      }),
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
  try {
    await Promise.all(
      Object.values(pages).map(async (page) => {
        const { document } = parseHTML(
          doDocument(
            await (await opfs.getFile(defineRoot(page.pathes.html))).text(),
          ),
        );
        const deleteSymbol = (id) => {
          const symbolsById = document.body.querySelectorAll(
            `[${inf_symbol_Id_attribute}="${id}"]`,
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
      }),
    );

    await db.projects.update(props.projectId, {
      pages: updatedPages,
    });

    self.postMessage({
      command: "deleteAllSymbolsById",
      props: { done: true },
    });
    console.log("From worker : deleted props is done");
    return { done: true };
  } catch (error) {
    return { done: false };
  }
}

/**
 * @param {{
 *  data: import('@/helpers/types').Project,
 *  files: { [key: string]: File },
 *  projectId: number,
 *  updatePreviewPages: boolean,
 *  pageName: string,
 *  pageUrl: string,
 *  tailwindcssStyle?: string,
 * isWordpress:boolean;
 *  editorData: { canvasCss: string, editorCss: string },
 * }} props
 */
export async function updateDB(props) {
  console.log("From updateDB", opfs.id);

  if (!opfs.id && props.projectId) {
    await initOPFS({ id: props.projectId });
    console.error(`OPFS Id not found!`);
  }
  if (!props.projectId && !opfs.id) throw new Error(`DB Id not found!`);

  // copy only the values we need now
  const {
    files,
    tailwindcssStyle,
    projectId,
    data,
    updatePreviewPages,
    pageName,
    __seq,
    __requestId,
  } = props;

  // Use a microtask instead of setTimeout to avoid closure retention
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        if (files && isPlainObject(files)) {
          await opfs.writeFiles(
            Object.entries(files).map(([key, file]) => ({
              path: defineRoot(key),
              content: file,
            })),
          );
        }

        if (tailwindcssStyle) {
          await opfs.writeFiles([
            {
              path: defineRoot(`css/tailwind/${pageName}.css`),
              content: tailwindcssStyle,
            },
          ]);
        }

        const resp = await db.projects.update(projectId || opfs.id, data);

        if (updatePreviewPages && !props.isWordpress) {
          // pass a minimal props object to avoid capturing the original huge props
          await writePreviewPage({
            projectId,
            data,
            pageName,
            editorData: props.editorData,
            projectSetting: props.projectSetting,
          });
        }

        self.postMessage({
          command: "updateDB",
          props: { done: true, projectId },
          __ackSeq: __seq, // THIS IS CRUCIAL
          __requestId: __requestId, // echo request id if present (optional)
        });

        resolve(resp);
      } catch (err) {
        console.error("UpdateDB Error:", err);
        reject(err);
      } finally {
        // explicitly drop big refs from the outer scope
        // (note: we copied into local consts, so deleting props is optional but okay)
        for (let key in props) delete props[key];
      }
    })();
  });
}

/**
 *
 * @param {{
 * data : import('@/helpers/types').Project ,
 * projectSetting:import('@/helpers/types').ProjectSetting,
 * projectId : number ,
 * pageName:string,
 * editorData: { canvasCss:string , editorCss:string },
 * }} props
 */
export async function writePreviewPage(props) {
  let pageFile = (
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
        `${props.pageName == "index" ? "" : "pages"}/${props.pageName}.html`,
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
  pageFile = null;
  previewBraodcast.close();
}

/**
 *
 * @param {{projectId : number , dynamicTemplateId: string, data : import('@/helpers/types').CMD[]}} props
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
      endCallback = () => {},
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
                  true,
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
                "from worker",
              );
              if (dbResponse) {
                console.log(
                  "updating files after response : ",
                  slicedFiles,
                  "from worker",
                );

                res(dbResponse);
              }
            },
            starterLoopIndex == 0 ? 0 : 50,
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
      `From worker varsToServiceWorker callback error  ${error.message}`,
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
 *  projectData : import('@/helpers/types').Project
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
    let isTypesInstalled = false;
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
            { type: blob.type },
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
        }),
    );

    if (!projectData?.installStates?.types) {
      for (const lib of [
        ...projectData.jsFooterLibs,
        ...projectData.jsHeaderLibs,
      ]) {
        await installTypes({
          projectId: projectData.id,
          code: doGlobalType(lib.nameWithoutExt, lib.globalName),
          libConfig: lib,
        });
      }
      // console.log("lib type after: ", defineRoot(lib.path), lib  ,await (await opfs.getFile(defineRoot(lib.path))).text());
      projectData.installStates.types = true;
    }

    if (!projectData?.installStates?.globalTypes) {
      for (const lib of global_types) {
        await installTypes({
          projectId: projectData.id,
          code: doGlobalType(lib.nameWithoutExt, lib.globalName),
          libConfig: lib,
        });
      }

      // console.log("lib type after: ", defineRoot(lib.path), lib  ,await (await opfs.getFile(defineRoot(lib.path))).text());
      projectData.installStates.globalTypes = true;
    }

    await db.projects.update(props.projectId, {
      // fonts: projectData.fonts,
      jsHeaderLibs: projectData.jsHeaderLibs,
      jsFooterLibs: projectData.jsFooterLibs,
      cssLibs: projectData.cssLibs,
      restAPIModels: projectData.restAPIModels,
      installStates: projectData.installStates,
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
 * projectSettings : import('@/helpers/types').ProjectSetting
 * }} props
 * @returns
 */
export const getAllStyleSheetClasses = async (props) => {
  try {
    if (!self.classesCache) {
      self.classesCache = {};
    }
    allStyleSheetClasses && clearTimeout(allStyleSheetClasses);
    allStyleSheetClasses = setTimeout(async () => {
      //   const myLol = 'myLol'
      //  console.log(eval(` console.log(myLol)`));
      const { parse, walk } = await import("css-tree");
      const { tailwindClasses } = await import("@/constants/tailwindClasses");
      await initOPFS({ id: props.projectId });

      const prjectData = await db.projects.get(props.projectId);
      const getClasses = (value = "") => {
        const ast = parse(value);
        const classes = new Set();

        walk(ast, (node) => {
          if (node.type === "ClassSelector") {
            classes.add(node.name); // Set removes duplicates
          }
        });
        console.log("cllassses : ", classes);

        return [...classes].sort();
      };

      await doInNormalAsyncInWorker(props.projectId, async () => {
        for (const fHandle of await opfs.getAllFiles(defineRoot(`libs/css`), {
          recursive: true,
        })) {
          const file = await fHandle.getFile();
          const lastModified = file.lastModified;
          const cacheKey = fHandle.name;

          if (
            self.classesCache[cacheKey] &&
            self.classesCache[cacheKey].lastModified === lastModified
          ) {
            self.postMessage({
              command: "classes-chunks",
              props: {
                classes: self.classesCache[cacheKey].classes,
              },
            });
            continue;
          }

          const content = await file.text();
          const classes = getClasses(content);
          self.classesCache[cacheKey] = {
            lastModified: lastModified,
            classes: classes,
          };
          self.postMessage({
            command: "classes-chunks",
            props: {
              classes,
            },
          });
        }
      });

      await doInWordpressAsyncInWorker(props.projectId, async (project) => {
        const slugs = project.cssLibs
          .map((lib) => lib.slug)
          .concat(project.globalCss.slug);

        // Check cache for slugs
        const uncachedSlugs = slugs.filter((slug) => !self.classesCache[slug]);

        slugs.forEach((slug) => {
          if (self.classesCache[slug]) {
            self.postMessage({
              command: "classes-chunks",
              props: {
                classes: self.classesCache[slug].classes,
              },
            });
          }
        });

        if (uncachedSlugs.length === 0) return;

        const wp_get_files_res = await wp_get_media_files_by_slugs({
          projectId: props.projectId,
          slugs: uncachedSlugs,
        });

        if (wp_get_files_res) {
          Object.values(wp_get_files_res)
            .filter((res) => !res.error)
            .forEach((res) => {
              const classes = getClasses(res.content);
              self.classesCache[res.slug] = {
                classes,
              };
              self.postMessage({
                command: "classes-chunks",
                props: {
                  classes,
                },
              });
            });
        }
      });

      self.postMessage({
        command: "classes-chunks",
        props: {
          classes: getClasses(props.editorCss),
        },
      });

      if (props.projectSettings.enable_tailwind) {
        self.postMessage({
          command: "classes-chunks",
          props: {
            classes: tailwindClasses,
          },
        });
      }

      // send empty array to stop loader in classes selector component
      self.postMessage({
        command: "end-classes-chunks",
        props: {
          classes: null,
        },
      });

      const per2 = performance.now();
      console.log(per2);
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
 * app_type:string,
 * wp_meta:{
 * website_url: string,
 * username: string,
 * password: string,
 * }
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

    // const ids = (await db.projects.toArray()).map((proj) => proj.id);
    // let newId = random(0, 1000000000);
    // while (ids.some((id) => newId === id)) {
    //   newId = random(0, 1000000000);
    // }
    const id = await db.projects.add({
      // id: newId,
      name: data.name,
      description: data.description,
      logo: "logo.png",
      blocks: {},
      app_type: data.app_type,
      wp_meta: data.wp_meta,
      cssLibs: [],
      jsHeaderLibs: [],
      jsFooterLibs: [],
      pages: {
        index: {
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
      apps: undefined,
      installStates: {
        types: false,
        cssLibs: false,
        fonts: false,
        globalTypes: false,
        jsFooterLibs: false,
        jsHeaderLibs: false,
      },
      lastScreenshot: "",
      dropboxFileMeta: {},
      dbx_pull_requried: false,
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

/**
 *
 * @param {{data : {
 * name:string,
 * description:string,
 * projectSetting:import('@/helpers/types').ProjectSetting
 * exsitedConfig:import('@/helpers/types').WpProject
 * app_type:string,
 * wp_meta:{
 * website_url: string,
 * username: string,
 * password: string,
 *  app_password: string,
 * }
 * }}} param0
 */
export async function createWpProject({ data }) {
  const tId = uniqueId("toast-");
  const scriptTid = uniqueId("script-toast-");

  try {
    workerSendToast({
      msg: "Init wordpress Project",
      type: "loading",
      dataProps: {
        toastId: tId,
      },
    });

    if (
      isPlainObject(data.exsitedConfig) &&
      isNumber(data?.exsitedConfig?.id)
    ) {
      await db.projects.delete(data.exsitedConfig.id);
      delete data.exsitedConfig.id;
    }
    if (
      isPlainObject(data.exsitedConfig) &&
      !Boolean(Object.keys(data.exsitedConfig).length)
    ) {
      await wp_create_option({
        optionName: "inf_config",
        wp_meta_data: data.wp_meta,
        value: {
          inited: false,
        },
      });
    }
    // const ids = (await db.projects.toArray()).map((proj) => proj.id);
    // let newId = random(0, 1000000000);
    // while (ids.some((id) => newId === id)) {
    //   newId = random(0, 1000000000);
    // }
    const id = await db.projects.add({
      // id: newId,

      logo: "logo.png",
      blocks: {},
      app_type: data.app_type,
      wp_meta: data.wp_meta,
      cssLibs: [],
      jsHeaderLibs: [],
      jsFooterLibs: [],
      currentEditingPage: {
        id: null,
        symbols: [],
        cmds: {},
        name: "",
        components: {},
        helmet: {},
        bodyAttributes: {},
      },
      // pages: {
      //   index: {
      //     pathes: {
      //       html: "editor/pages/index.html",
      //       css: "css/index.css",
      //       js: "js/index.js",
      //     },
      //     cmds: {},
      //     id: "index",
      //     name: "index",
      //     symbols: [],
      //     components: {},
      //     helmet: {},
      //     bodyAttributes: {},
      //   },
      //   playground: {
      //     // html: new Blob([``], { type: "text/html" }),
      //     // css: new Blob([``], { type: "text/css" }),
      //     // js: new Blob([``], { type: "text/javascript" }),
      //     pathes: {
      //       html: "editor/pages/playground.html",
      //       css: "css/playground.css",
      //       js: "js/playground.js",
      //     },
      //     id: "playground",
      //     symbols: [],
      //     cmds: {},
      //     name: "playground",
      //     components: {},
      //     helmet: {},
      //     bodyAttributes: {},
      //   },
      // },
      // globalCss: new Blob([``], { type: "text/css" }),
      // globalJs: new Blob([``], { type: "text/javascript" }),
      apps: undefined,
      installStates: {
        types: false,
        cssLibs: false,
        fonts: false,
        globalTypes: false,
        jsFooterLibs: false,
        jsHeaderLibs: false,
      },
      lastScreenshot: "",
      dropboxFileMeta: {},
      dbx_pull_requried: false,
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
      minified_css: {},
      minified_js: {},
      projectSetting: data.projectSetting,
      ...(isPlainObject(data.exsitedConfig) ? data.exsitedConfig : {}),
      name: data.name,
      description: data.description,
    });
    const mainPath = `/projects/project-${id}`;

    // await dir(mainPath).create()

    const mainRoot = await opfs.root;
    // const projectsRoot = await opfs.getFolder(mainRoot, "projects");
    // const projectDir = await opfs.createFolder(projectsRoot, `project-${id}`);
    // const dirs = [
    //   `${mainPath}/pages`,
    //   `${mainPath}/css`,
    //   `${mainPath}/js`,
    //   `${mainPath}/assets`,
    //   `${mainPath}/fonts`,
    //   `${mainPath}/libs`,
    //   `${mainPath}/editor`,
    //   `${mainPath}/editor/pages`,
    //   `${mainPath}/editor/symbols`,
    //   `${mainPath}/editor/templates`,
    //   `${mainPath}/global`,
    //   `${mainPath}/libs/js`,
    //   `${mainPath}/libs/css`,
    //   `${mainPath}/libs/js/header`,
    //   `${mainPath}/libs/js/footer`,
    // ];

    // const files = [
    //   {
    //     path: `${mainPath}/screenshot.webp`,
    //     content: "",
    //   },
    //   {
    //     path: `${mainPath}/index.html`,
    //     content: "",
    //   },
    //   {
    //     path: `${mainPath}/global/global.js`,
    //     content: "",
    //   },

    //   {
    //     path: `${mainPath}/global/global.css`,
    //     content: "",
    //   },
    //   {
    //     path: `${mainPath}/editor/pages/index.html`,
    //     content: "",
    //   },
    //   {
    //     path: `${mainPath}/editor/pages/playground.html`,
    //     content: "",
    //   },
    //   {
    //     path: `${mainPath}/js/index.js`,
    //     content: "",
    //   },
    //   {
    //     path: `${mainPath}/js/playground.js`,
    //     content: "",
    //   },
    //   {
    //     path: `${mainPath}/css/index.css`,
    //     content: "",
    //   },
    //   {
    //     path: `${mainPath}/css/playground.css`,
    //     content: "",
    //   },
    // ];

    // await write()
    // for (const dirTx of dirs) {
    //   await dir(`${mainPath}/${dirTx}`).create()
    // }

    // for (const fileDetails of files) {
    //   await write(`${mainPath}/${fileDetails.path}` , fileDetails.content)
    // }

    // await opfs.createFolders(dirs);
    // await opfs.createFiles(files);
    workerSendToast({
      msg: `Uploading editor scripts and styles...`,
      type: "loading",
      dataProps: {
        toastId: scriptTid,
      },
    });

    const updatedConfig = await (
      await initMainAndGlobalFilesForWp({
        data: {
          projectData: await db.projects.get(id),
          projectSetting: data.projectSetting,
          id,
        },
      })
    ).config;

    workerSendToast({
      isNotMessage: true,
      msg: scriptTid,
      type: "done",
    });

    await db.projects.update(id, { ...updatedConfig, inited: true });

    // if (
    //   isPlainObject(data.exsitedConfig) &&
    //   !Boolean(Object.keys(data.exsitedConfig).length)
    // ) {
    // }
    const projectData = await db.projects.get(id);
    console.log(" wp_update_option prj data: ", projectData, id);

    await wp_update_option({
      optionName: "inf_config",
      projectId: id,
      value: { ...projectData },
    });

    workerSendToast({
      isNotMessage: true,
      msg: tId,
      type: "done",
    });

    workerSendToast({
      msg: `Wordpress created successfully 💙`,
      type: "success",
    });

    self.postMessage({
      command: "createWpProject",
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

    workerSendToast({
      isNotMessage: true,
      msg: scriptTid,
      type: "dismiss",
      dataProps: {
        progressClassName: "bg-[crimson]",
      },
    });

    workerSendToast({
      msg: `Faild to create wp project 😩`,
      type: "error",
      // dataProps: {
      //   progressClassName: "bg-[crimson]",
      // },
    });

    self.postMessage({
      command: "createWpProject",
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

/**
 *
 * @param {{id : number}} param0
 * @returns
 */
export async function listenToOPFSBroadcastChannel({ id }) {
  console.log("Initialized listenToOPFSBroadcastChannel", id);

  if (!id) {
    console.error(
      `Project id not found in listenToOPFSBroadcastChannel with id : ${id}`,
    );
    return { done: false };
  }

  await initOPFS({ id });
  // const opfsBc = new BroadcastChannel("opfs");

  // opfsBc.addEventListener("message", (ev) => {
  //   console.log(`opfcBc message:`, ev.data);
  // });

  const broadCastCleaner = opfs.onBroadcast("getFile", async (data) => {
    const path = `${data.folderPath}/${data.fileName}`;
    // console.log(
    //   "Received getFile event from broadcast",
    //   opfs.id,
    //   data.projectId,
    //   path
    // );

    let fileBraodcast;

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
        `${getProjectRoot(id)}/${data.folderPath ? `${data.folderPath}/` : ""}${
          data.fileName
        }`,
      );
      const file = await fileHandle.getOriginFile();

      if (!file) throw new Error(`File not found`);

      fileBraodcast = new BroadcastChannel(path);
      fileBraodcast.postMessage({
        type: "sendFile",
        file,
        isExisit: true,
        fileName: fileHandle.name,
        filePath: fileHandle.path,
      });
    } catch (error) {
      console.error("Broadcast getFile error:", error);

      if (!fileBraodcast) fileBraodcast = new BroadcastChannel(path);
      fileBraodcast.postMessage({
        type: "sendFile",
        file: undefined,
        isExisit: false,
        fileName: undefined,
        filePath: undefined,
      });
    } finally {
      if (fileBraodcast) fileBraodcast.close();
    }
  });

  const clean = (ev) => {
    if (ev.data.command === "clean-opfs-broadcast") {
      broadCastCleaner();
      self.removeEventListener("message", clean);
    }
  };

  self.addEventListener("message", clean);

  self.postMessage({
    command: "listenToOPFSBroadcastChannel",
    props: { done: true },
  });

  // return broadCastCleaner;
  return { done: true };
}

// export async function listenToOPFSBroadcastChannel({ id }) {
//   console.log("INited listenToOPFSBroadcastChannel", id);

//   await initOPFS({ id });
//   const opfsBc = new BroadcastChannel("opfs");
//   opfsBc.addEventListener("message", (ev) => {
//     console.log(`opfcBc : `, ev.data);
//   });
//   const broadCastCleaner = opfs.onBroadcast(
//     "getFile",
//     async (data) => {
//       const path = `${data.folderPath}/${data.fileName}`;
//       console.log(
//         "recived getFile event from boadcast",
//         opfs.id,
//         data.projectId,
//         path
//       );
//       try {
//         if (!opfs.id) {
//           opfs.opfsBraodcast.postMessage({
//             type: "sendFile",
//             file: undefined,
//             isExisit: false,
//             fileName: undefined,
//             filePath: undefined,
//           });
//           throw new Error(`Project id not found`);
//         }

//         const fileHandle = await opfs.getFile(
//           `${getProjectRoot(id)}/${
//             data.folderPath ? `${data.folderPath}/` : ""
//           }${data.fileName}`
//         );
//         const file = await fileHandle.getOriginFile();

//         // console.log(
//         //   "recived path : ",
//         //   `${getProjectRoot(id)}/${
//         //     data.folderPath ? `${data.folderPath}/` : ""
//         //   }${data.fileName}`,
//         //   file,
//         //   {
//         //     type: "sendFile",
//         //     file: file,
//         //     isExisit: file ? true : false,
//         //     fileName: fileHandle.name,
//         //     filePath: fileHandle.path,
//         //   }
//         // );
//         if (!file) {
//           throw new Error(`File not founded`);
//         }
//         const fileBraodcast = new BroadcastChannel(path);
//         fileBraodcast.postMessage({
//           type: "sendFile",
//           file: file,
//           isExisit: file ? true : false,
//           fileName: fileHandle.name,
//           filePath: fileHandle.path,
//         });
//       } catch (error) {
//         const fileBraodcast = new BroadcastChannel(path);
//         fileBraodcast.postMessage({
//           type: "sendFile",
//           file: undefined,
//           isExisit: false,
//           fileName: undefined,
//           filePath: undefined,
//         });
//         throw new Error(error);
//       }
//     }
//     // { once: true }
//   );
//   /**
//    *
//    * @param {MessageEvent} ev
//    */
//   const clean = (ev) => {
//     if (ev.data.command == "clean-opfs-broadcast") {
//       broadCastCleaner();
//       self.removeEventListener("message", clean);
//     }
//   };

//   self.addEventListener("message", clean);

//   self.postMessage({
//     command: "listenToOPFSBroadcastChannel",
//     props: {
//       done: true,
//     },
//   });
//   return broadCastCleaner;
// }

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
        props.state,
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
  const { parse } = await import("css");
  !opfs.id && (await initOPFS({ id: projectId }));
  let projectData = await db.projects.get(projectId);

  const editorKeyframes = parse(`${editorCss}} `).stylesheet.rules.filter(
    (rule) => rule.type == "keyframes",
  );

  let libsKeyframes = {};

  await doInNormalAsyncInWorker(projectId, async () => {
    libsKeyframes = Object.fromEntries(
      await Promise.all(
        projectData.cssLibs
          .concat({ path: "global/global.css" })
          .map(async (lib) => [
            lib.path,
            parse(
              await (await opfs.getFile(defineRoot(lib.path))).text(),
            ).stylesheet.rules.filter(
              (rule) => rule.type == "keyframes" && rule.vendor == undefined,
            ),
          ])
          .concat([[`css/${pageName}.css`, editorKeyframes]]),
      ),
    );
  });

  await doInWordpressAsyncInWorker(projectId, async (project) => {
    const slugs = project.cssLibs
      .concat(project.globalCss)
      .map((lib) => lib.slug);
    const wp_files_res = await wp_get_media_files_by_slugs({
      projectId,
      slugs,
    });
    if (isPlainObject(wp_files_res)) {
      console.log("wp_files_res  : ", wp_files_res);
      for (const [key, value] of Object.entries(wp_files_res)) {
        if (!isPlainObject(value) || value.error) {
          continue;
        }

        libsKeyframes[key] = parse(value.content).stylesheet.rules.filter(
          (rule) => rule.type == "keyframes" && rule.vendor == undefined,
        );
      }

      libsKeyframes["css/main.css"] = parse(editorCss).stylesheet.rules.filter(
        (rule) => rule.type == "keyframes" && rule.vendor == undefined,
      );
    }
  });

  console.log("libsKeyframes : ", libsKeyframes);
  const response = Object.entries(libsKeyframes).flatMap(([path, animes]) =>
    animes.map((anim) => ({ ...anim, path })),
  );

  self.postMessage({
    command: "getKeyFrames",
    props: response,
  });

  return response;
}

export async function writeFilesToOPFS({ files }) {
  try {
    await opfs.writeFiles(files);
    self.postMessage({
      command: "writeFilesToOPFS",
      props: {
        done: true,
        roots: files.map((file) => file.path),
      },
    });
  } catch (error) {
    self.postMessage({
      command: "writeFilesToOPFS",
      props: {
        done: false,
        msg: error.message,
      },
    });
  }
}

/**
 *
 * @param {{keyframes : import('css').KeyFrames[] , projectId : number , editorCss:string}} param0
 */
export async function removeAnimation({
  path,
  keyframes,
  projectId,
  editorCss,
}) {
  let tId = uniqueId("toast-remove-animation-");
  const { stringify, parse } = await import("css");

  workerSendToast({
    msg: "Removing animation...",
    type: "loading",
    dataProps: {
      toastId: tId,
    },
  });

  try {
    await doInNormalAsyncInWorker(projectId, async () => {
      // Group keyframes by path to batch operations
      const keyframesByPath = keyframes.reduce((acc, kf) => {
        if (!acc[kf.path]) acc[kf.path] = [];
        acc[kf.path].push(kf);
        return acc;
      }, {});

      for (const [path, kfs] of Object.entries(keyframesByPath)) {
        try {
          const fileContent = await (
            await opfs.getFile(defineRoot(path))
          ).text();
          const parsedFile = parse(fileContent);

          const kfNames = new Set(kfs.map((kf) => kf.name));

          parsedFile.stylesheet.rules = parsedFile.stylesheet.rules.filter(
            (rule) => !(rule.type == "keyframes" && kfNames.has(rule.name)),
          );
          console.log("Removing keyframes from path:", path, kfs);

          await opfs.writeFiles([
            {
              path: defineRoot(path),
              content: stringify(parsedFile),
            },
          ]);

          kfs.forEach((kf) => {
            self.postMessage({
              command: "removeAnimation",
              props: {
                done: true,
                keyframeName: kf.name,
                path: kf.path,
              },
            });

            workerSendToast({
              msg: `Animation ${kf.name} removed successfully💙`,
              type: "success",
            });
          });
        } catch (error) {
          kfs.forEach((kf) => {
            self.postMessage({
              command: "removeAnimation",
              props: {
                done: false,
                keyframeName: kf.name,
                path: path,
              },
            });
            workerSendToast({
              msg: `Faild to remove ${kf.name} animation for path (${kf.path || path})`,
              type: "error",
            });
          });

          workerSendToast({
            isNotMessage: true,
            msg: tId,
            type: "dismiss",
            dataProps: {
              progressClassName: "bg-[crimson]",
            },
          });

          throw new Error(error);
        }
      }
    });

    await doInWordpressAsyncInWorker(projectId, async (project) => {
      const slugs = keyframes
        .map((kf) => kf.path)
        .filter((path) => path != "css/main.css");
      const wp_files_res = await wp_get_media_files_by_slugs({
        projectId,
        slugs,
      });
      if (isPlainObject(wp_files_res)) {
        let wp_files_res_handler = Object.values(wp_files_res)
          .filter((value) => !value.error)
          .map((value) => {
            const parsedFile = parse(value.content);
            parsedFile.stylesheet.rules = parsedFile.stylesheet.rules.filter(
              (rule) =>
                !(
                  rule.type == "keyframes" &&
                  keyframes.some(
                    (kf) => rule.name == kf.name && kf.path === value.slug,
                  )
                ),
            );

            value.content = stringify(parsedFile);
            return value;
          });

        const wp_update_media_res = await wp_update_media_files_by_slugs({
          projectId,
          files: Object.fromEntries(
            wp_files_res_handler.map((value) => [value.slug, value.content]),
          ),
        });

        if (!wp_update_media_res.success) {
          throw new Error(
            `wp_files_res is not plain object  ${wp_update_media_res}`,
          );
        }

        //current-post-editing
        const parsedFile = parse(editorCss);
        parsedFile.stylesheet.rules = parsedFile.stylesheet.rules.filter(
          (rule) =>
            !(
              rule.type == "keyframes" &&
              keyframes.some(
                (kf) => rule.name == kf.name && kf.path == "css/main.css",
              )
            ),
        );

        const css_meta = stringify(parsedFile);
        !project.current_inf_meta.saved &&
          (project.current_inf_meta.saved = {});
        !project.current_inf_meta.before_save &&
          (project.current_inf_meta.before_save = {});
        const meta_value = {
          ...project.current_inf_meta,
          [project.currentEditingPage.save_state]: {
            ...project.current_inf_meta[project.currentEditingPage.save_state],
            css: css_meta,
          },
        };
        const wp_update_meta_res = await wp_update_meta({
          projectId,
          meta_key: "inf_meta",
          meta_value,
          merge: true,
          post_id: project.currentEditingPage.id,
          post_type: project.currentEditingPage.type,
        });

        if (!wp_update_meta_res.success) {
          throw new Error(
            `wp_update_meta_res is not plain object  ${wp_update_meta_res}`,
          );
        }

        await db.projects.update(projectId, {
          current_inf_meta: meta_value,
        });
      } else {
        throw new Error(`wp_files_res is not plain object  ${wp_files_res}`);
      }
    });

    workerSendToast({
      isNotMessage: true,
      msg: tId,
      type: "done",
    });
    self.postMessage({
      command: "animationsRemoved",
      props: {
        done: true,
      },
    });
  } catch (error) {
    self.postMessage({
      command: "animationsRemoved",
      props: {
        done: false,
      },
    });
    throw new Error(error);
  }
}

/**
 *
 * @param {{[key:string]:import('css').KeyFrames[] , projectId:number , editorCss:string}} param0
 */
export async function saveAnimations({ animations, projectId, editorCss }) {
  console.log("ana 3abet we ahbal begaad");

  const tId = uniqueId("toast-");
  const { stringify } = await import("css");
  const projectData = await db.projects.get(projectId);

  // try {
  workerSendToast({
    msg: "Saving Animations",
    type: "loading",
    dataProps: {
      toastId: tId,
    },
  });

  let wordpressCssMain = [];
  let wordpressGlobal = [];

  const result = animations.reduce((acc, item) => {
    if (!acc[item.path]) {
      acc[item.path] = [];
    }

    if (item.path === "css/main.css") {
      wordpressCssMain.push(item);
    }

    if (item.path === projectData?.globalCss?.slug) {
      wordpressGlobal.push(item);
    }

    acc[item.path].push(item);
    return acc;
  }, {});

  console.log("results : ", result);

  await doInNormalAsyncInWorker(projectId, async (project) => {
    for (const key in result) {
      console.log(
        "stringify(result[key]) : ",
        stringify({ stylesheet: { rules: result[key] } }),
      );

      const fileContent = await (await opfs.getFile(defineRoot(key))).text();

      await opfs.writeFiles([
        {
          path: defineRoot(key),
          content: minify(
            `${fileContent} \n ${stringify({
              stylesheet: { rules: result[key] },
            })}`,
            {
              restructure: true,
            },
          ).css,
        },
      ]);
    }
  });

  await doInWordpressAsyncInWorker(projectId, async (project) => {
    const slugs = Object.keys(result);
    const wp_files_res = await wp_get_media_files_by_slugs({
      projectId,
      slugs,
    });

    if (isPlainObject(wp_files_res)) {
      const wp_files_res_handler = Object.values(wp_files_res)
        .filter((value) => !value.error)
        .map((value) => {
          // const parsedFile = parse(value.content);

          value.content = minify(
            `${value.content} \n ${stringify({
              stylesheet: { rules: result[value.slug] },
            })}`,
            {
              restructure: true,
            },
          ).css;
          return value;
        });

      const wp_update_media_res = await wp_update_media_files_by_slugs({
        projectId,
        files: Object.fromEntries(
          wp_files_res_handler.map((value) => [value.slug, value.content]),
        ),
      });

      if (!isPlainObject(wp_update_media_res)) {
        throw new Error(
          `wp_update_media_res is not plain object  ${wp_update_media_res}`,
        );
      }
    } else {
      console.error(wp_files_res, slugs);
      throw new Error(
        `wp_files_res is not plain object  ${wp_files_res} : ${wp_files_res}`,
      );
    }

    if (wordpressCssMain.length) {
      const css_meta = minify(
        `${editorCss} \n ${stringify({
          stylesheet: { rules: wordpressCssMain },
        })}`,
        {
          restructure: true,
        },
      ).css;

      const meta_value = {
        ...project.current_inf_meta,
        [project.currentEditingPage.save_state]: {
          ...project.current_inf_meta[project.currentEditingPage.save_state],
          css: css_meta,
        },
      };

      const wp_update_meta_res = await wp_update_meta({
        projectId,
        meta_key: "inf_meta",
        meta_value,
        merge: true,
        post_id: project.currentEditingPage.id,
        post_type: project.currentEditingPage.type,
      });

      await db.projects.update(projectId, {
        current_inf_meta: meta_value,
      });

      if (!wp_update_meta_res.success) {
        throw new Error(
          `wp_update_meta_res is not plain object  ${wp_update_meta_res}`,
        );
      }
    }

    if (wordpressGlobal.length) {
      const wpGlobalCss = await (
        await opfs.getFile(defineRoot(`global.css`))
      ).text();
      const newFileContent = minify(
        `${wpGlobalCss} ${stringify({
          stylesheet: { rules: wordpressGlobal },
        })}`,
        { restructure: true },
      ).css;
      await opfs.writeFiles([
        {
          path: defineRoot(`global.css`),
          content: newFileContent,
        },
      ]);
    }
  });

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
 * @param {{ projectId:number ,  projectSetting : import('@/helpers/types').ProjectSetting}} props
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
 * @param {{ projectId:number  , attributes : {[key:string]:string | null } ,  selector:string}} props
 */
export async function deleteAttributesInAllPages({
  projectId,
  attributes = {},
  selector,
}) {
  const projectData = await db.projects.get(projectId);
  !opfs.id && (await initOPFS({ id: projectId }));
  const content = [];
  for (const key in projectData.pages) {
    const page = projectData.pages[key];
    const { document } = parseHTML(
      doDocument(
        await (await opfs.getFile(defineRoot(page.pathes.html))).text(),
      ),
    );

    /**
     * @type {NodeListOf<Element>}
     */
    let els = [];

    selector && (els = document.querySelectorAll(selector));

    for (const key in attributes) {
      !selector &&
        (els = document.querySelectorAll(
          `[${attributes[key] ? `${key}="${attributes[key]}"` : key}]`,
        ));

      els.forEach((el) => {
        el.removeAttribute(key);
      });

      if (els && els.length) {
        els.forEach((el) => {
          el.removeAttribute(motionId);
          el.removeAttribute(mainMotionId);
          el.removeAttribute(motionInstanceId);
        });

        content.push({
          path: defineRoot(page.pathes.html),
          content: document.body.innerHTML,
        });
      }
    }
  }

  await opfs.writeFiles(content);
  self.postMessage({
    command: "attributes-deleted",
    props: {
      done: true,
    },
  });
}

/**
 *
 * @param {{ projectId:number  , attributes : {[key:string]:string | null } ,  selectors:{[key:string]:{}}}} props
 */
export async function setAttributesInAllPages({ projectId, selectors = {} }) {
  try {
    const projectData = await db.projects.get(projectId);
    !opfs.id && (await initOPFS({ id: projectId }));
    const content = [];
    for (const key in projectData.pages) {
      const page = projectData.pages[key];
      const { document } = parseHTML(
        doDocument(
          await (await opfs.getFile(defineRoot(page.pathes.html))).text(),
        ),
      );

      for (const selector in selectors) {
        const attributes = selectors[selector];
        /**
         * @type {NodeListOf<Element>}
         */
        let els = [];

        selector && (els = document.querySelectorAll(selector));
        console.log("els from worker : ", els);

        for (const key in attributes) {
          if (els && els.length) {
            els.forEach((el) => {
              el.setAttribute(key, attributes[key]);
            });

            content.push({
              path: defineRoot(page.pathes.html),
              content: document.body.innerHTML,
            });
          }
        }
      }

      await opfs.writeFiles(content);
      self.postMessage({
        command: "attributes-setted",
        props: {
          done: true,
        },
      });
    }
  } catch (error) {
    self.postMessage({
      command: "attributes-setted",
      props: {
        done: false,
      },
    });

    throw new Error(error);
  }
}

/**
 *
 * @param {{ projectId:number  , attributes : {[key:string]:string | null } ,  selectors:{[key:string]:{}}}} props
 */
export async function removeAttributesInAllPages({
  projectId,
  selectors = {},
}) {
  try {
    console.log("projectoooooo:", projectId);

    const projectData = await db.projects.get(projectId);
    console.log("projectData : ", projectData);

    !opfs.id && (await initOPFS({ id: projectId }));
    const content = [];
    for (const key in projectData.pages) {
      const page = projectData.pages[key];
      const { document } = parseHTML(
        doDocument(
          await (await opfs.getFile(defineRoot(page.pathes.html))).text(),
        ),
      );

      for (const selector in selectors) {
        const attributes = selectors[selector];
        /**
         * @type {NodeListOf<Element>}
         */
        let els = [];

        selector && (els = document.querySelectorAll(selector));
        console.log("els from worker : ", els);

        for (const key in attributes) {
          if (els && els.length) {
            els.forEach((el) => {
              el.removeAttribute(key);
            });

            content.push({
              path: defineRoot(page.pathes.html),
              content: document.body.innerHTML,
            });
          }
        }
      }

      await opfs.writeFiles(content);
      self.postMessage({
        command: "attributes-removed",
        props: {
          done: true,
        },
      });
    }
  } catch (error) {
    self.postMessage({
      command: "attributes-removed",
      props: {
        done: false,
      },
    });

    throw new Error(error);
  }
}

/**
 *
 * @param {{ projectId:number  , mId : number}} props
 */
export async function deleteAllMotionsById({ projectId, mId }) {
  const projectData = await db.projects.get(projectId);
  !opfs.id && (await initOPFS({ id: projectId }));
  const content = [];
  for (const key in projectData.pages) {
    const page = projectData.pages[key];
    const { document } = parseHTML(
      doDocument(
        await (await opfs.getFile(defineRoot(page.pathes.html))).text(),
      ),
    );

    const els = document.querySelectorAll(
      `[${motionId}="${mId}"] , [${mainMotionId}="${mId}"]`,
    );
    if (els && els.length) {
      els.forEach((el) => {
        el.removeAttribute(motionId);
        el.removeAttribute(mainMotionId);
        el.removeAttribute(motionInstanceId);
      });

      content.push({
        path: defineRoot(page.pathes.html),
        content: document.body.innerHTML,
      });
    }
  }

  await opfs.writeFiles(content);
  self.postMessage({
    command: "motion-delete",
    props: {
      done: true,
    },
  });
}

/**
 *
 * @param {{ projectId:number , interactionsId}} props
 */
export async function setInteractionsAttributes({ interactionsId, projectId }) {
  const projectData = await db.projects.get(+projectId);
  const interactions = projectData.interactions[interactionsId];
  const content = [];
  !opfs.id && initOPFS({ id: projectId });
  for (const key in projectData.pages) {
    const page = projectData.pages[key];
    const { document } = parseHTML(
      doDocument(
        await (await opfs.getFile(defineRoot(page.pathes.html))).text(),
      ),
    );

    const els = document.querySelectorAll(
      `[${interactionId}="${interactionsId}"] , [${mainInteractionId}="${interactionsId}"]`,
    );

    els.forEach((el) => {
      const instanceId = el.getAttribute(interactionInstanceId);
      const interactionsAttributes = buildInteractionsAttributes(
        interactions,
        instanceId ? instanceId : interactionsId,
        Boolean(instanceId),
      );
      for (const attr in interactionsAttributes) {
        el.setAttribute(attr, interactionsAttributes[attr]);
      }
    });

    if (els && els.length) {
      content.push({
        path: defineRoot(page.pathes.html),
        content: document.body.innerHTML,
      });
    }
  }

  await opfs.writeFiles(content);
  self.postMessage({
    command: "interctions-setted",
    props: {
      done: true,
    },
  });
}

export async function parseHTMLAndRaplceSymbols({ pageName = "", projectId }) {
  try {
    const html = await (
      await opfs.getFile(defineRoot(`editor/pages/${pageName}.html`))
    ).text();
    if (!opfs.id && !projectId) throw new Error(`Project ID not found!`);
    !opfs.id && initOPFS({ id: projectId });
    let { document } = parseHTML(doDocument(html));
    const els = document.querySelectorAll(`[${inf_symbol_Id_attribute}]`);
    for (const el of els) {
      const symbolId = el.getAttribute(inf_symbol_Id_attribute);
      el.outerHTML = await (
        await opfs.getFile(
          defineRoot(`editor/symbols/${symbolId}/${symbolId}.html`),
        )
      ).text();
    }
    // document.querySelectorAll("script").forEach((script) => script.remove());
    // document.querySelectorAll("svg").forEach((svg) => {
    //   const attributes = [...svg.attributes].concat([
    //     {
    //       name: "src",
    //       value: svgToDataURL(svg.outerHTML),
    //     },
    //     {
    //       name: "type",
    //       value: "image/xml+svg",
    //     },

    //     {
    //       name: "data-gjs-type",
    //       value: "image",
    //     },
    //   ]);
    //   const img = document.createElement("img");
    //   attributes.forEach((attr) => {
    //     img.setAttribute(attr.name, attr.value);
    //   });
    //   svg.replaceWith(img);
    // });
    let response = [...document.body.children].map((el) => el.outerHTML);
    const propsRes = {
      response,
      symbols: Object.fromEntries(
        [...els].map((el) => [
          el.getAttribute(inf_symbol_Id_attribute),
          el.outerHTML,
        ]),
      ),
      // bodyInnerHTML : document.body.innerHTML,
      done: true,
    };

    self.postMessage({
      command: "parseHTMLAndRaplceSymbols",
      props: propsRes,
    });
    response = null;
    document.body.innerHTML = "";
    document = null;
    return propsRes;
  } catch (error) {
    self.postMessage({
      command: "parseHTMLAndRaplceSymbols",
      props: {
        response: [],
        symbols: {},
        // bodyInnerHTML : document.body.innerHTML,
        done: false,
        msg: error.message,
      },
    });
    throw new Error(error);
  }
  // return response;
}

export async function updateSymbolsStylesFiles({ symbols = {}, cssCode = "" }) {
  try {
    for (const [id, symbol] of Object.entries(symbols)) {
      const styles = await (
        await extractElementStyles({
          elementsHTML: Object.values(symbol),
          cssCode,
        })
      ).stringRules;
      await opfs.writeFiles([
        {
          path: defineRoot(`editor/symbols/${id}/${id}.css`),
          content: styles,
        },
      ]);
    }

    self.postMessage({
      command: "updateSymbolsStylesFiles",
      props: {
        done: true,
      },
    });
  } catch (error) {
    self.postMessage({
      command: "updateSymbolsStylesFiles",
      props: {
        done: false,
        msg: error.message,
      },
    });
    throw new Error(error);
  }
}
