import { parseHTML } from "linkedom";
import { db } from "./db";
import { inf_cmds_id, inf_symbol_Id_attribute } from "../constants/shared";
// import { doDocument } from "./functions";
// import monacoLoader from "@monaco-editor/loader";
// import { buildDynamicTemplate, buildScriptFromCmds } from "./worker_functions";
import {
  buildPageAsBlobForSecrviceWorker,
  buildPagesAsBlobForSecrviceWorker,
  doDocument,
  getFileSize,
  handleFilesSize,
  installRestModelsAPI,
} from "./bridge";
// import { initDBAssetsSw } from "../serviceWorkers/initDBAssets-sw";
// import Dexie from "dexie";
//
const html = String.raw;
const css = String.raw;

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
 * @param {{data : import('./types').Project ,
 *  projectId : number ,
 *  updatePreviewPages : boolean,
 * pageName:string,
 * pageUrl:string,
 * editorData: { canvasCss:string , editorCss:string },
 * }} props
 */
export async function storeGrapesjsDataIfSymbols(props) {
  // try {
  const projectData = await props.data;
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

  const newData = {
    ...props.data,
    pages: {
      ...updatedPages,
    },
  };

  if (props.updatePreviewPages) {
    varsToServiceWorker({
      pageUrl: props.pageUrl,
      updateOnce: true,
      previewPage: await buildPageAsBlobForSecrviceWorker({
        editorData: props.editorData,
        projectData: {
          ...(await db.projects.get(props.projectId)),
          ...newData,
        },
        pageName: props.pageName,
      }),
    });
  }

  await db.projects.update(props.projectId, newData);

  self.postMessage({
    command: "storeGrapesjsDataIfSymbols",
    props: {
      done: true,
      projectId: props.projectId,
    },
  });
  console.log(`pages updated in worker successfully : `, updatedPages);
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
 * @param {{projectId : string , symbolId:string ,}} props
 */
export async function deleteAllSymbolsById(props) {
  const projectData = await db.projects.get(props.projectId);
  const pages = structuredClone(projectData.pages);
  const updatedPages = {};

  await Promise.all(
    Object.values(pages).map(async (page) => {
      const { document } = parseHTML(doDocument(await page.html.text()));
      const deleteSymbol = (id) => {
        const symbolsById = document.body.querySelectorAll(
          `[${inf_symbol_Id_attribute}="${id}"]`
        );
        symbolsById.forEach((symbol) => symbol.remove());
      };

      Array.isArray(props.symbolId)
        ? props.symbolId.forEach((id) => deleteSymbol(id))
        : deleteSymbol(props.symbolId);

      let pageSymbols = [
        ...document.body.querySelectorAll(`[${inf_symbol_Id_attribute}]`),
      ].map((symbol) => symbol.getAttribute(`[${inf_symbol_Id_attribute}]`));

      page.html = new Blob([document.body.innerHTML], { type: "text/html" });
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
 * @param {{data : import('./types').Project ,
 *  projectId : number ,
 *  updatePreviewPages : boolean ,
 *  pageName:string,
 * pageUrl:string,
 * editorData: { canvasCss:string , editorCss:string },
 * }} props
 */
export async function updateDB(props) {
  try {
    console.log(
      "From worker : Update project is done",
      props.projectId,
      props.data
    );
    if (props.updatePreviewPages) {
      varsToServiceWorker({
        pageUrl: props.pageUrl,
        updateOnce: true,
        previewPage: await buildPageAsBlobForSecrviceWorker({
          editorData: props.editorData,
          projectData: {
            ...(await db.projects.get(props.projectId)),
            ...props.data,
          },
          pageName: props.pageName,
        }),
      });
    }
    const resp = await db.projects.update(props.projectId, props.data);
    self.postMessage({
      command: "updateDB",
      props: {
        done: true,
        projectId: props.projectId,
      },
    });
    return resp;
  } catch (error) {
    console.error(`From worker command updateDB: ${error}`);
    self.postMessage({
      command: "updateDB",
      props: {
        done: false,
        projectId: props.projectId,
      },
    });
    return false;
  }
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
 * @param {{projectId:number , toastId:string, assets : import('./types').InfinitelyAsset[]}} props
 */
export async function uploadAssets(props) {
  console.log("from worker assets update starting: ", props.assets);
  try {
    const getProjectData = async () => await db.projects.get(props.projectId);

    const updateAssets = async (assets = []) => {
      const projectData = await getProjectData();
      // ...projectData.assets,
      // const newAssets = [...projectData.assets, ...(assets || [])];
      if (assets?.length) {
        projectData.assets.push(...assets);
      }
      await db.projects.update(props.projectId, {
        assets: projectData.assets || [],
      });

      // .where('id').equals(props.projectId).modify((project)=>(project.assets || []).push(newAssets))
      console.log("updated assets from updater : ", projectData.assets);

      return projectData.assets;
    };

    const filesHandled = await handleFilesSize(props.assets, props.projectId);

    let isFilesUploaded = false;

    /**
     *
     * @param {number} starterLoopIndex
     * @param {import('./types').InfinitelyAsset[]} assetsFiles
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
      const ender = starterLoopIndex + 3;
      const slicedFiles = assetsFiles.slice(starterLoopIndex, ender);

      slicedFiles.length &&
        (await new Promise((res, rej) => {
          setTimeout(
            async () => {
              const dbResponse = await updateAssets(slicedFiles);
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
                const newProjectData = await db.projects.get(props.projectId);
                self.postMessage({
                  command: "setVar",
                  props: {
                    obj: {
                      projectId: props.projectId,
                      projectData: newProjectData,
                    },
                  },
                });
              }
            },
            starterLoopIndex == 0 ? 0 : 2
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

    await uploadFiles(0, filesHandled.assets, () => {
      isFilesUploaded = true;
    });

    const newProjectData = await db.projects.get(props.projectId);

    self.postMessage({
      command: "toast",
      props: {
        isNotMessage: true,
        msg: props.toastId,
        type: "dismiss",
      },
    });

    isFilesUploaded &&
      self.postMessage({
        command: "toast",
        props: {
          msg: "Files Uploaded Successfully",
          type: "success",
        },
      });

    self.postMessage({
      command: "initSevrviceWorker",
    });

    // !isNoramlFilesUploaded &&
    //   !isBigFilesUploaded &&
    //   notAllowedFiles.length &&
    //   self.postMessage({
    //     command: "toast",
    //     props: {
    //       msg: "Big Files Not Allowed",
    //       type: "error",
    //     },
    //   });

    // (isNoramlFilesUploaded || isBigFilesUploaded) &&
    //   notAllowedFiles.length &&
    //   self.postMessage({
    //     command: "toast",
    //     props: {
    //       msg: `There are ${notAllowedFiles.length} files not allowed to upload`,
    //       type: "warn",
    //     },
    //   });

    // (isNoramlFilesUploaded || isBigFilesUploaded) &&
    //   self.postMessage({
    //     command: "toast",
    //     props: {
    //       msg: "Files Uploaded Successfully",
    //       type: "success",
    //     },
    //   });
    console.log("new assets : ", newProjectData.assets);
  } catch (error) {
    await updateDB({ projectId: props.projectId, data: props.assets });
    console.error(`From worker command uploadAssets: ${error}`);

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
      projectData: props.projectData || await db.projects.get(+props.projectId),
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
          if (lib.file) return lib;
          const res = await fetch(lib.fileUrl);
          const blob = await res.blob();
          const ext = mime.getExtension(blob.type);
          lib.file = new File(
            [blob],
            `${lib.name.replace(`.${ext}`, "")}.${ext}`,
            { type: blob.type }
          );
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
