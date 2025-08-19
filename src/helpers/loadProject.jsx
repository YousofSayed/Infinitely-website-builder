import JSZip from "jszip";
import {
  buildPage,
  getInitProjectData,
  installFonts,
  installLibs,
  installRestModelsAPI,
  restoreBlobs,
} from "./bridge";
import { parseHTML } from "linkedom";
import { random, sortBy, uniqueId } from "lodash";
import { db } from "./db";
import { uploadAssets, workerSendToast } from "./workerCommands";
import { opfs } from "./initOpfs";
import { preivewScripts } from "../constants/shared";

/**
 *
 * @param {{file:File}} props
 */
export const loadProject = async (props) => {
  const toastIds = [];
  try {
    /**
     * @type {File}
     */
    const file = props.file;
    const mime = await (await import("mime/lite")).default;
    /**
     * @type {import('../../helpers/types').Project}
     */
    let newProject = {
      pages: {},
    };

    const proccessProjectId = uniqueId("proccess-");
    toastIds.push(proccessProjectId);
    workerSendToast({
      msg: "Proccess project",
      type: "loading",
      dataProps: {
        toastId: proccessProjectId,
      },
    });

    const zip = new JSZip();
    const projectZip = await zip.loadAsync(file, {
      // optimizedBinaryString: true,
      // createFolders:true
    });

    const projectFiles = projectZip.files;
    console.log("projectzip : ", projectZip.files);
    const notIncludedFiles = ["editor/infinitely.json", "index.html", "pages/"];
    const isInfinitelyJson = Boolean(projectFiles["editor/infinitely.json"]);
    let infinitelyJson = {};
     if (!isInfinitelyJson) {
      throw new Error(`infinitely.json config file not founded!!`);
    }
    const projectDBId = await db.projects.add({});
    const projectPath = `projects/project-${projectDBId}`;
    const defineRoot = (root = "") =>
      `${projectPath}/${root.replace(projectPath, "")}`;

   
    // console.log(
    //   "isInfinitelyJson  :",
    //   isInfinitelyJson,
    //   projectFiles["editor/infinitely.json"],
    //   Boolean(projectFiles["editor/infinitely.json"])
    // );

    // return;
   
    /**
     * @type {{[key:string] : JSZip.JSZipObject}}
     */
    const pages = {};
    /**
     * @type {import('./types').Project}
     */
    let dbJSONData = getInitProjectData({ pages: {} });
    for (const path in projectFiles) {
      const zipHandle = projectFiles[path];
      if (zipHandle.dir) {
        await opfs.createFolder(defineRoot(path));
        continue;
      } else {
        if (path.startsWith("pages/") || path.startsWith("index.html")) {
          pages[path] = zipHandle;
        }
        if (path.startsWith("editor/infinitely.json")) {
          dbJSONData = await restoreBlobs(JSON.parse(await zipHandle.async("text")));
        }

        // else {
        //   dbJSONData = {
        //     ...dbJSONData,
        //     inited: true,
        //     name:file?.name||`Project-${projectDBId}`,
        //     cssLibs: path.startsWith("libs/css")
        //       ? dbJSONData.cssLibs.concat({ path, isLocal: true })
        //       : dbJSONData.cssLibs,
        //     jsFooterLibs: path.startsWith("libs/js/header")
        //       ? dbJSONData.jsHeaderLibs.concat({
        //           path,
        //           isLocal: true,
        //           header: true,
        //         })
        //       : dbJSONData.jsHeaderLibs,
        //     jsFooterLibs: path.startsWith("libs/js/footer")
        //       ? dbJSONData.jsFooterLibs.concat({
        //           path,
        //           isLocal: true,
        //           footer: true,
        //         })
        //       : dbJSONData.jsFooterLibs,
        //     fonts: path.startsWith("fonts/")
        //       ? {
        //           ...dbJSONData.fonts,
        //           [`${path.split("/").pop()}`]: {
        //             path,
        //             name: path.split("/").pop(),
        //             isCDN: false,
        //           },
        //         }
        //       : dbJSONData.fonts,
        //     blocks: path.startsWith(`editor/blocks`)
        //       ? {
        //           ...dbJSONData.blocks,
        //           [`${path.split("/").pop().split(".").shift()}`]: {
        //             pathes: {
        //               ...(path.endsWith(".html") ? { content: path } : {}),
        //               ...(path.endsWith(".css") ? { style: path } : {}),
        //             },
        //             id: path.split("/").pop().split(".").shift(),
        //             label: path.split("/").pop().split(".").shift(),
        //             name: path.split("/").pop().split(".").shift(),
        //             type: "template",
        //           },
        //         }
        //       : path.startsWith(`editor/symbols`)
        //       ? {
        //           ...dbJSONData.blocks,
        //           [`${path.split("/").pop().split(".").shift()}`]: {
        //             pathes: {
        //               ...(path.endsWith(".html") ? { content: path } : {}),
        //               ...(path.endsWith(".css") ? { style: path } : {}),
        //             },
        //             id: path.split("/").pop().split(".").shift(),
        //             label: path.split("/").pop().split(".").shift(),
        //             name: path.split("/").pop().split(".").shift(),
        //             type: "symbol",
        //           },
        //         }
        //       : dbJSONData.blocks,

        //     symbols: path.startsWith(`editor/symbols`)
        //       ? {
        //           ...dbJSONData.symbols,
        //           [`${path.split("/").pop().split(".").shift()}`]: {
        //             pathes: {
        //               ...(path.endsWith(".html") ? { content: path } : {}),
        //               ...(path.endsWith(".css") ? { style: path } : {}),
        //             },
        //             id: path.split("/").pop().split(".").shift(),
        //             label: path.split("/").pop().split(".").shift(),
        //             name: path.split("/").pop().split(".").shift(),
        //             type: "symbol",
        //           },
        //         }
        //       : dbJSONData.symbols,

        //     logo: path.startsWith("logo") ? path : "",
        //   };
        // }

        if (notIncludedFiles.some((noPath) => noPath.startsWith(path))) {
          continue;
        }
        await opfs.createFile(
          defineRoot(path),
          await zipHandle.async("arraybuffer")
        );
      }
      // zipHandle.dir ?  : await opfs.createFile(defineRoot(path))
    }

    //Write Editor Pages
    for (const path in pages) {
      const page = pages[path];
      const pageName =
        page.name.split("/").pop().split(".").shift() || page.name;
      // const fileContent = await page.async("text");
      if (isInfinitelyJson) {
        const { document } = parseHTML(await page.async("text"));
        // console.log(`page content : ` , document.body.innerHTML);
        document.body.querySelectorAll(`script , link`).forEach((el) => {
          if (el.src || el.href) {
            el.remove();
          }
        });

        await opfs.createFile(
          defineRoot(`editor/pages/${path.replace("pages/", "")}`),
          document.body.innerHTML
        );
      } else {
        // const builtPage = await buildPage({
        //   pageName,
        //   file: page,
        // });
        // dbJSONData.pages = {
        //   ...dbJSONData.pages,
        //   [pageName]: builtPage,
        // };
        // await opfs.createFile(
        //   defineRoot(`editor/pages/${path.replace("pages/", "")}`),
        //   await builtPage.html.arrayBuffer()
        // );
      }
    }
    dbJSONData.id = projectDBId;
    //Write DB Json Data
    await db.projects.update(projectDBId, dbJSONData);

    workerSendToast({
      isNotMessage: true,
      msg: proccessProjectId,
      type: "done",
    });

    workerSendToast({
      msg: "Project loaded successfully",
      type: "success",
    });

    return true;
    // workerSendToast({
    //   isNotMessage: true,
    //   msg: proccessProjectId,
    //   type: "done",
    // });
    /**
     *
     * @param {string} pathName
     * @param {string} extName
     * @returns {{[key:string]:JSZip.JSZipObject}}
     */
    // const getFiles = (pathName, extName) => {
    //   const result = {};
    //   for (const [path, file] of Object.entries(projectZip.files)) {
    //     if (
    //       path.startsWith(pathName) &&
    //       !file.dir &&
    //       (!extName || path.endsWith(extName))
    //     ) {
    //       result[path] = file;
    //     }
    //   }
    //   return result;
    // };
    // const pages = { ...getFiles("pages/"), ...getFiles("index.html") };
    // const css = getFiles("css");
    // const js = getFiles("js");
    // const assets = getFiles("assets");
    // //   const fonts = getFiles("fonts");
    // const jsLibsHeader = getFiles("libs/js/header");
    // const jsLibsFooter = getFiles("libs/js/footer");
    // const jsLibsMinHeader = getFiles("libs/js/min/header");
    // const jsLibsMinFooter = getFiles("libs/js/min/footer");
    // const cssLibs = getFiles("libs/css");
    // const fonts = getFiles("fonts/");
    // const indexPage = getFiles("index.html");
    // console.log(
    //   "files loaded : ",
    //   jsLibsHeader,
    //   jsLibsFooter,
    //   jsLibsMinHeader,
    //   jsLibsMinFooter,
    //   cssLibs,
    //   fonts,
    //   assets
    // );
    // // return;
    // const siteLogo = getFiles("logo.png");
    // const editorData = getFiles("infinitely.json");
    // const globalCss = getFiles("globals/global.css");
    // const globalJs = getFiles("globals/global.js");
    // const isConnected = navigator.onLine ? "done" : "dismiss";

    // /**
    //  * @type {import('./types').Project}
    //  */
    // const dataMap = restoreBlobs(
    //   JSON.parse(await editorData["infinitely.json"].async("text"))
    // );
    // /**
    //  * @type {import('./types').ProjectSetting}
    //  */
    // const projectSettings = dataMap.projectSettings;
    // workerSendToast({
    //   isNotMessage: true,
    //   msg: proccessProjectId,
    //   type: "done",
    // });
    // // return;
    // const pageUpdateId = uniqueId("page-");
    // toastIds.push(pageUpdateId);

    // // console.log("files : ", dataMap);
    // workerSendToast({
    //   msg: "Building pages",
    //   type: "loading",
    //   dataProps: {
    //     toastId: pageUpdateId,
    //   },
    // });

    // /**
    //  * @type {{[key:string] : import('./types').InfinitelyPage}}
    //  */
    // const builtPages = Object.fromEntries(
    //   await Promise.all(
    //     Object.entries(pages).map(async ([path, file]) => {
    //       const pageName = path.replace(/pages\/|\.html/gi, "");
    //       console.log("path : ", path, "page name:", pageName);
    //       return [
    //         pageName,
    //         {
    //           ...dataMap.pages[pageName],
    //           ...(await buildPage(pageName, file)),
    //         },
    //       ];
    //     })
    //   )
    // );

    // workerSendToast({
    //   isNotMessage: true,
    //   msg: pageUpdateId,
    //   type: "done",
    // });

    // // console.log("From worker : pages built : ", newProject.pages);

    // const installing = async (callback = () => {}, msg) => {
    //   const id = uniqueId(`id-${random(22)}-`);
    //   toastIds.push(id);
    //   workerSendToast({
    //     msg,
    //     type: "loading",
    //     dataProps: {
    //       toastId: id,
    //     },
    //   });

    //   await callback();

    //   return id;
    // };

    // console.log("before installing : ", dataMap.fonts, fonts);

    // const fontsId = await installing(async () => {
    //   // await installFonts(dataMap.fonts);
    //   const keysOfFonts = Object.keys(fonts);
    //   for (const font of Object.values(dataMap.fonts)) {
    //     if (font.isCDN || !font.path) continue;
    //     if (keysOfFonts.includes(font.path)) {
    //       const blob = await fonts[font.path].async("blob");
    //       const type = mime.getType(font.path);
    //       const ext = mime.getExtension(type);
    //       const fileName = font.path.split("/").pop().replace(`.${ext}`, "");
    //       font.file = new File([blob], `${fileName}.${ext}`, { type });
    //       delete fonts[font.path];
    //     }
    //   }
    //   // for (const path in fonts) {
    //   //   const blob = new Blob([await fonts[path].async("blob")], {
    //   //     type: mime.getType(path),
    //   //   });
    //   //   const ext = mime.getExtension(mime.getType(path));
    //   //   const fileName = path.split("/").pop().replace(`.${ext}`, "");
    //   //   console.log("path : ", fileName, path, blob.type, ext);
    //   //   if (dataMap.fonts[fileName].isCDN) continue;
    //   //   dataMap.fonts[fileName].file = new File([blob], fileName, {
    //   //     type: blob.type,
    //   //   });
    //   // }
    // }, "Installing Fonts");

    // workerSendToast({
    //   isNotMessage: true,
    //   type: "done",
    //   msg: fontsId,
    // });

    // console.log("fonts installed: ", dataMap.fonts, fonts);

    // const jsLibsId = await installing(async () => {
    //   // await installLibs(dataMap.jsHeaderLibs, "header");
    //   const isMinHeaderJs = Boolean(Object.keys(jsLibsMinHeader).length);
    //   const isMinFooterJs = Boolean(Object.keys(jsLibsMinFooter).length);
    //   const isHeaderJS = Boolean(Object.keys(jsLibsHeader).length);
    //   const isFooterJs = Boolean(Object.keys(jsLibsFooter).length);

    //   const isHeaderGraped =
    //     projectSettings.grap_all_header_scripts_in_single_file;
    //   const isFooterGraped =
    //     projectSettings.grap_all_footer_scripts_in_single_file;

    //   const grapedLibHandler = async (key = "", obj, pos) => {
    //     for (const path in obj) {
    //       let file = await obj[path].async("blob");
    //       const fileName = path.split("/").pop();
    //       const ext = mime.getExtension(mime.getType(path));
    //       dataMap[key].push({
    //         async: projectSettings[`is_async_graped_${pos}_script`],
    //         defer: projectSettings[`is_defer_graped_${pos}_script`],
    //         description: "local graped (minified) js script",
    //         file: new File(
    //           [file],
    //           `${fileName.replace(`.${ext}`, "")}.${ext}`,
    //           { type: mime.getType(path) }
    //         ),
    //         footer: pos == "footer",
    //         header: pos == "header",
    //         name: fileName,
    //         id: uniqueId("js-header-lib-"),
    //         type: "js",
    //         isCDN: false,
    //         isLocal: true,
    //       });
    //       file = null;
    //       delete obj[path];
    //     }
    //   };

    //   const libHandler = async (key, obj = {}) => {
    //     const keysOfLibs = Object.keys(obj);
    //     for (const lib of dataMap[key]) {
    //       console.log("from fooooor");
    //       if (lib.isCDN || !lib.path) continue;
    //       console.log("from for");

    //       if (keysOfLibs.includes(lib.path)) {
    //         console.log("from cond : ", lib.path);

    //         const blob = await obj[lib.path].async("blob");
    //         const type = mime.getType(lib.path);
    //         const ext = mime.getExtension(type);
    //         const fileName = `${lib.path.replace(`.${ext}`, "")}`;
    //         lib.file = new File([blob], `${fileName}.${ext}`, { type });
    //         delete obj[lib.path];
    //       }
    //     }
    //   };

    //   if (isMinHeaderJs && isHeaderGraped) {
    //     dataMap.jsHeaderLibs = [];

    //     await grapedLibHandler("jsHeaderLibs", jsLibsMinHeader, "header");
    //   } else if (!isMinHeaderJs && !isHeaderGraped && isHeaderJS) {
    //     await libHandler("jsHeaderLibs", jsLibsHeader);
    //   }

    //   if (isMinFooterJs && isFooterGraped) {
    //     dataMap.jsFooterLibs = [];
    //     await grapedLibHandler("jsFooterLibs", jsLibsMinFooter, "footer");
    //   } else if (!isMinFooterJs && !isFooterGraped && isFooterJs) {
    //     console.log("Not in my footer");

    //     await libHandler("jsFooterLibs", jsLibsFooter);
    //   }

    //   console.log(
    //     "bool data",
    //     isMinHeaderJs,
    //     isMinFooterJs,
    //     isHeaderGraped,
    //     isFooterGraped,
    //     isHeaderJS,
    //     isFooterJs
    //   );

    //   for (const lib of dataMap.jsHeaderLibs.concat(dataMap.jsFooterLibs)) {
    //     console.log("From for : ", lib.fileUrl, lib.isCDN, navigator.onLine);

    //     if (lib.isCDN && navigator.onLine) {
    //       const res = await fetch(lib.fileUrl);
    //       const blob = await res.blob();
    //       const ext = mime.getExtension(blob.type);
    //       lib.file = new File(
    //         [blob],
    //         `${lib.name.replace(`.${ext}`, "")}.${ext}`,
    //         { type: blob.type }
    //       );
    //     }
    //   }

    //   // console.log(
    //   //   "After installing libs : ",
    //   //   dataMap.jsHeaderLibs,
    //   //   dataMap.jsFooterLibs,
    //   //   jsLibsHeader,
    //   //   jsLibsFooter,
    //   //   isHeaderJS,
    //   //   isFooterJs,
    //   //   isMinHeaderJs,
    //   //   isMinFooterJs,
    //   //   projectSettings
    //   // );
    // }, "Installing js libs");

    // workerSendToast({
    //   isNotMessage: true,
    //   msg: jsLibsId,
    //   type: isConnected,
    // });

    // const cssLibsId = await installing(async () => {
    //   const keysOfLibs = Object.keys(cssLibs);

    //   if (projectSettings.grap_all_css_libs_in_single_file) {
    //     dataMap.cssLibs = [];
    //     let i = 0;
    //     for (const path in cssLibs) {
    //       const blob = await cssLibs[path].async("blob");
    //       const type = mime.getType(path);
    //       const ext = mime.getExtension(type);
    //       const fileName = path.split("/").pop().replace(`.${ext}`, "");
    //       dataMap.cssLibs.push({
    //         name: `${fileName}.${ext}`,
    //         isCDN: false,
    //         isLocal: true,
    //         path,
    //         id: uniqueId("css-lib-"),
    //         sort: i,
    //         description: "css graped (minified) lib",
    //         file: new File([blob], `${fileName}.${ext}`, { type }),
    //       });
    //       i++;
    //     }
    //   } else {
    //     for (const lib of dataMap.cssLibs) {
    //       if (lib.isCDN && navigator.onLine) {
    //         const res = await fetch(lib.fileUrl);
    //         const blob = await res.blob();
    //         lib.file = new File([blob], `${lib.name.replace(".css", "")}.css`, {
    //           type: blob.type,
    //         });
    //       }

    //       if (!lib.isCDN && keysOfLibs.includes(lib.path)) {
    //         const blob = await cssLibs[lib.path].async("blob");
    //         const fileName = lib.path.split("/").pop();
    //         const ext = mime.getExtension(mime.getType(lib.path));
    //         lib.file = new File(
    //           [blob],
    //           `${fileName.replace(`.${ext}`, "")}.${ext}`,
    //           {
    //             type: "text/css",
    //           }
    //         );
    //       }
    //     }
    //   }
    // }, `Installing css libs`);

    // workerSendToast({
    //   isNotMessage: true,
    //   msg: cssLibsId,
    //   type: isConnected,
    // });

    // const restModelsId = await installing(async () => {
    //   const resModels = await installRestModelsAPI(dataMap.restAPIModels);
    //   console.log(resModels);
    // }, "Installing Rest Models");

    // // uniqueId("rest-");

    // workerSendToast({
    //   isNotMessage: true,
    //   msg: restModelsId,
    //   type: "done",
    // });

    // console.log("rest id : ", restModelsId);

    // const editorDataUpdateId = uniqueId("editorData-");
    // toastIds.push(editorDataUpdateId);

    // workerSendToast({
    //   msg: "Uploading editor data",
    //   type: "loading",
    //   dataProps: {
    //     toastId: editorDataUpdateId,
    //   },
    // });

    // // return

    // /**
    //  * @type {import('./types').Project}
    //  */
    // const dbData = {
    //   ...dataMap,
    //   pages: builtPages,
    //   globalJs: new Blob([await Object.values(globalJs)?.[0]?.async("blob")], {
    //     type: "application/javascript",
    //   }),
    //   globalCss: new Blob(
    //     [await Object.values(globalCss)?.[0]?.async("blob")],
    //     {
    //       type: "text/css",
    //     }
    //   ),

    //   logo: new Blob([await Object.values(siteLogo)[0].async("blob")], {
    //     type: mime.getType(".png"),
    //   }),

    //   assets: await Promise.all(
    //     Object.values(assets).map(async (asset) => ({
    //       file: new File(
    //         [await asset.async("blob")],
    //         asset.name.replace("assets/", ""),
    //         { type: mime.getType(asset.name.replace("assets/", "")) }
    //       ),
    //       // buildUrl: asset.name,
    //       id: uniqueId("asset-id-"),
    //     }))
    //   ),
    // };

    // // console.log("from project loader : ", dbData);

    // console.log("my project after before : ", dbData);
    // const projectId = await db.projects.add({});

    // for (const key in dbData) {
    //   await db.projects.update(projectId, {
    //     [key]: dbData[key],
    //   });
    //   delete dbData[key];
    // }

    // console.log(
    //   "my project after build (dbData entries is Deleted) : ",
    //   dbData
    // );

    // workerSendToast({
    //   isNotMessage: true,
    //   msg: editorDataUpdateId,
    //   type: "done",
    // });

    // const assetsUpdateId = uniqueId("assets-");
    // // self.postMessage({
    // //   command: "toast",
    // //   props: {
    // //     msg: "Uploading assets",
    // //     type: "loading",
    // //     dataProps: {
    // //       toastId: assetsUpdateId,
    // //     },
    // //   },
    // // });

    // // await uploadAssets({
    // //   assets: await Promise.all(
    // //     Object.values(assets).map(async (asset) => ({
    // //       file: new File(
    // //         [await asset.async("blob")],
    // //         asset.name.replace("assets/", ""),
    // //         { type: mime.getType(asset.name.replace("assets/", "")) }
    // //       ),
    // //       buildUrl: asset.name,
    // //       id: uniqueId(),
    // //     }))
    // //   ),
    // //   projectId,
    // //   toastId: assetsUpdateId,
    // // });

    // self.postMessage({
    //   command: "toast",
    //   props: {
    //     msg: "Project loaded successfully",
    //     type: "success",
    //   },
    // });

    // //  console.log( mime.getType('dsa.html'),pages , css , js , assets , fonts , jsLibs , cssLibs , indexPage);
    // // console.log("pages :", await pages. );

    /**
     *
     * @param {string} path
     * @param {import('jszip').JSZipObject} file
     */
    // async function buildPage(pageName, file) {
    //   console.log(
    //     "is instance from : ",
    //     file.async && file.async instanceof Function,
    //     file instanceof Blob,
    //     file instanceof File
    //   );
    //   const { document } = parseHTML(await file.async("text"));
    //   const pageTitle = document.title;
    //   const descMetaEl = document.querySelector('meta[name="description"]');
    //   const descMeta = descMetaEl?.getAttribute?.("content") || "";

    //   const authorMetaEl = document.querySelector('meta[name="author"]');
    //   const authorMeta = authorMetaEl?.getAttribute?.("content") || "";

    //   const keywordsMetaEl = document.querySelector('meta[name="keywords"]');
    //   const keywordsMeta = keywordsMetaEl?.getAttribute?.("content") || "";

    //   //Remove none important els
    //   descMetaEl?.remove?.();
    //   authorMetaEl?.remove?.();
    //   keywordsMetaEl?.remove?.();
    //   document.body.querySelectorAll("script").forEach((el) => el.remove());
    //   document.body.querySelectorAll("style").forEach((el) => el.remove());
    //   document.body.querySelectorAll("link").forEach((el) => el.remove());

    //   console.log("helmet : ", pageTitle, descMeta, authorMeta, keywordsMeta);
    //   const allMeta = new Blob(
    //     [
    //       [...document.querySelectorAll("meta")]
    //         .map((el) => el.outerHTML)
    //         .join("\n"),
    //     ],
    //     { type: "text/html" }
    //   );

    //   /**
    //    * @type {import('../../helpers/types').InfinitelyPage}
    //    */
    //   const page = {
    //     html: new Blob([document.body.innerHTML], { type: "text/html" }),
    //     css: new Blob([await css[`css/${pageName}.css`].async("blob")], {
    //       type: "text/css",
    //     }),
    //     js: new Blob([await js[`js/${pageName}.js`].async("blob")], {
    //       type: "application/js",
    //     }),
    //     name: pageName.toLowerCase(),

    //     id: uniqueId(),
    //     helmet: {
    //       description: descMeta,
    //       author: authorMeta,
    //       keywords: keywordsMeta,
    //       title: pageTitle,
    //       customMetaTags: allMeta,
    //     },
    //   };
    //   return page;
    // }
  } catch (error) {
    toastIds.forEach((id) => {
      workerSendToast({
        isNotMessage: true,
        type: "dismiss",
        msg: id,
      });
    });
    workerSendToast({
      type: "error",
      msg: `Error loading project: ${error.message}`,
    });

    throw new Error(`Error loading project: ${error.message}`);
  }
};
