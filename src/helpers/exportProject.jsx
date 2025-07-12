/**
 * /
 * /index.html
 *
 * /infinitely.json
 *
 * /pages
 * ...html files
 * /js
 *  ...js files
 * /css
 * ...css files
 * /fonts
 * ...font files
 * /assets
 * ...any files
 */

/**
 * @typedef  {import('./types')} Types
 */

// import JSZip from "jszip";
import { db } from "./db";
import {
  buildGsapMotionsScript,
  cleanMotions,
  defineFontFace,
  defineRoot,
  doDocument,
  html,
  minifyBlobJSAndCssStream,
  replaceBlobs,
} from "./bridge";
import { parseHTML } from "linkedom";
import {
  buildScripts,
  inf_build_url,
  loading_project_msg,
  motionId,
  project_faild_build_msg,
  project_successfully_build_msg,
} from "../constants/shared";
import { cloneDeep, cloneDeepWith, uniqueId } from "lodash";
import { workerSendToast } from "./workerCommands";
import { opfs } from "./initOpfs";

/**
 *
 * @param {{asJson:boolean , projectId:number , toastId:string, projectSetting : import('./types').ProjectSetting}} props
 */
export const exportProject = async (props) => {
  const JSZip = (await import("jszip")).default;
  const mime = (await import("mime")).default;
  const zip = new JSZip();
  const pageBuildSettings = {
    grapStyles: props.projectSetting.grap_all_css_libs_in_single_file,
    grapHeaderScripts:
      props.projectSetting.grap_all_header_scripts_in_single_file,
    grapeFooterScripts:
      props.projectSetting.grap_all_footer_scripts_in_single_file,
    isHeaderGrapedDefer: props.projectSetting.is_defer_graped_header_script,
    isFooterGrapedDefer: props.projectSetting.is_defer_graped_footer_script,
    isHeaderGrapedAsync: props.projectSetting.is_async_graped_header_script,
    isFooterGrapedAsync: props.projectSetting.is_async_graped_footer_script,
    disablePvue: props.projectSetting.disable_petite_vue,
  };
  const projectData = await db.projects.get(props.projectId);
  await opfs.init(+props.projectId);
  const toastId = uniqueId("toast-");
  // console.log(defineRoot('assets'));

  // return;
  workerSendToast({
    msg: loading_project_msg,
    type: "loading",
    dataProps: {
      toastId,
    },
  });
  // const alpineBlob = await (await fetch("/scripts/alpine.js")).blob();
  // const infImportsBuildBlob = await (
  //   await fetch("/scripts/infImportsBuild.js")
  // ).blob();

  // try {
  const infinitelyStyles = props.projectSetting
    .include_canvas_styles_in_build_file
    ? await (await fetch("/styles/style.css")).blob()
    : "";

  /**
   *
   * @param {File} file
   */
  const transformImageToWebp = (file) => {
    return props.projectSetting.transform_Image_To_Webp &&
      file.type.includes("image")
      ? new File([file], file.name, { type: "image/webp" })
      : file;
  };
  zip.file(
    "logo.png",
    await (await opfs.getFile(defineRoot(projectData.logo))).getOriginFile()
  );
  zip.file(
    "index.html",
    buildPage({
      page: projectData.pages[`index`],
      projectData,
      ...pageBuildSettings,
      urlException: true,
    })
  );
  // zip.file("libs/alpine.js", alpineBlob);
  // zip.file("libs/infImportsBuild.js", infImportsBuildBlob);
  await Promise.all(
    buildScripts({
      disablePvue: props.projectSetting.disable_petite_vue,
      disableGsapCore: props.projectSetting.disable_gsap_core,
      disableGsapScrollTrigger: props.projectSetting.disable_gsap_scrollTrigger,
      // inserts: [
      //   {
      //     index: 2,
      //     item: {
      //       name: `${page.name}.js`,
      //       buildUrl: `/js/motions/${page.name}.js`,
      //     },
      //   },
      // ],
    }).map(async (url) => {
      return zip.file(
        `libs/js/${url.name}`,
        await (await fetch(url.localUrl)).blob()
      );
    })
  );

  //Handling assets folder
  console.log(`Start loading assets....`);

  const assetsHandles = await opfs.getAllFiles(defineRoot(`assets`), {
    recursive: true,
  });
  for (const handle of assetsHandles) {
    const file = await handle.getOriginFile();
    zip.file(`assets/${file.name}`, transformImageToWebp(file), {
      compression: "STORE",
    });
  }
  console.log(`End loading assets....`);
  // projectData.assets.forEach((asset) =>
  //   zip.file(`assets/${asset.file.name}`, transformImageToWebp(asset.file), {
  //     compression: "STORE",
  //   })
  // );

  //Handling js folder
  for (const page of Object.values(projectData.pages)) {
    const jsHandle = await opfs.getFile(defineRoot(page.pathes.js));
    const cssHandle = await opfs.getFile(defineRoot(page.pathes.css));
    const jsFile = await jsHandle.getOriginFile();
    const cssFile = await cssHandle.getOriginFile();
    zip.file(
      page.pathes.js,
      props.projectSetting.minify_Js
        ? await minifyBlobJSAndCssStream(jsFile, "js")
        : jsFile
    );
    if (props.projectSetting.enable_tailwind_calsses) {
      const path = `css/tailwind/${page.name}.css`;
      const tailwindCssHandle = await opfs.getFile(defineRoot(path));
      if (tailwindCssHandle) {
        const twFile = await tailwindCssHandle.getOriginFile();
        zip.file(
          path,
          props.projectSetting.minify_Js
            ? await minifyBlobJSAndCssStream(twFile, "js")
            : twFile
        );
      }
    }
    zip.file(
      page.pathes.css,
      props.projectSetting.minify_Css
        ? await minifyBlobJSAndCssStream(cssFile, "css")
        : cssFile
    );
  }

  // await Promise.all(
  //   Object.values(projectData.pages).map(async (page) =>
  //     zip.file(
  //       `js/${page.name}.js`,
  //       props.projectSetting.minify_Js
  //         ? await minifyBlobJSAndCssStream(page.js, "js")
  //         : page.js
  //     )
  //   )
  // );

  //Handling css folder
  // await Promise.all(
  //   Object.values(projectData.pages).map(async (page) => {
  //     console.log(
  //       "file ",
  //       await page.css.text(),
  //       await (await minifyBlobJSAndCssStream(page.css, "css")).text()
  //     );

  //     return zip.file(
  //       `css/${page.name}.css`,
  //       props.projectSetting.minify_Css
  //         ? await minifyBlobJSAndCssStream(page.css, "css")
  //         : page.css
  //     );
  //   })
  // );

  zip.file("css/fonts.css", buildFontFaces(projectData.fonts));

  // Handling libs folder
  const cssHandles = await opfs.getAllFiles(defineRoot(`libs/css`), {
    recursive: true,
  });
  const cssLibsFiles = await Promise.all(
    cssHandles.map((handle) => handle.getOriginFile())
  );
  if (props.projectSetting.grap_all_css_libs_in_single_file) {
    zip.file(
      `libs/css/lib.css`,
      props.projectSetting.minify_Css
        ? await minifyBlobJSAndCssStream(
            new Blob(cssLibsFiles, { type: `text/css` })
          )
        : new Blob(cssLibsFiles, { type: "text/css" })
    );
  } else {
    for (const lib of projectData.cssLibs) {
      if (lib.isCDN) continue;
      const handle = await opfs.getFile(defineRoot(lib.path));
      const file = await handle.getOriginFile();
      console.log(file, lib.path, lib);
      zip.file(
        lib.path,
        props.projectSetting.minify_Css
          ? await minifyBlobJSAndCssStream(file, "css")
          : file
      );
    }
  }

  //Handling Js
  const jsHandles = await opfs.getAllFiles(defineRoot(`libs/js/header`), {
    recursive: true,
  });
  const jsLibsFiles = await Promise.all(
    jsHandles.map((handle) => handle.getOriginFile())
  );
  if (props.projectSetting.grap_all_header_scripts_in_single_file) {
    zip.file(
      `libs/js/min/header/header.lib.js`,
      props.projectSetting.minify_Js
        ? await minifyBlobJSAndCssStream(
            new Blob(jsLibsFiles, { type: `application/javascript` }),
            "js"
          )
        : new Blob(jsLibsFiles, {
            type: "application/javascript",
          })
    );
  } else {
    for (const lib of projectData.jsHeaderLibs) {
      if (lib.isCDN) continue;
      const handle = await opfs.getFile(defineRoot(lib.path));
      const file = await handle.getOriginFile();

      console.log(file, lib.path, lib);
      zip.file(
        lib.path,
        props.projectSetting.minify_Js
          ? await minifyBlobJSAndCssStream(file, "js")
          : file
      );
    }
  }

  // props.projectSetting.grap_all_header_scripts_in_single_file
  //   ? zip.file(
  //       `libs/js/min/header/header.lib.js`,
  //       props.projectSetting.minify_Js
  //         ? await minifyBlobJSAndCssStream(
  //             new Blob(
  //               projectData.jsHeaderLibs.map((lib) => lib.file),
  //               { type: `application/javascript` }
  //             ),
  //             "js"
  //           )
  //         : new Blob(
  //             projectData.jsHeaderLibs.map((lib) => lib.file),
  //             {
  //               type: "application/javascript",
  //             }
  //           )
  //     )
  //   : await Promise.all(
  //       projectData.jsHeaderLibs.map(async (lib) => {
  //         if (lib.isCDN)
  //           return new Blob([], { type: "application/javascript" });
  //         return zip.file(
  //           `libs/js/header/${lib.file.name}`,
  //           props.projectSetting.minify_Js
  //             ? await minifyBlobJSAndCssStream(lib.file, "js")
  //             : lib.file
  //         );
  //       })
  //     );

  const jsFooterHandles = await opfs.getAllFiles(defineRoot(`libs/js/footer`), {
    recursive: true,
  });
  const jsFooterLibsFiles = await Promise.all(
    jsFooterHandles.map((handle) => handle.getOriginFile())
  );

  if (props.projectSetting.grap_all_footer_scripts_in_single_file) {
    zip.file(
      `libs/js/min/footer/footer.lib.js`,
      props.projectSetting.minify_Js
        ? await minifyBlobJSAndCssStream(
            new Blob(jsFooterLibsFiles, { type: "application/javascript" }),
            "js"
          )
        : new Blob(jsFooterLibsFiles, { type: "application/javascript" })
    );
  } else {
    for (const lib of projectData.jsFooterLibs) {
      if (lib.isCDN) continue;
      const handle = await opfs.getFile(defineRoot(lib.path));
      const file = await handle.getOriginFile();
      console.log(file, lib.path, lib);
      zip.file(
        lib.path,
        props.projectSetting.minify_Js
          ? await minifyBlobJSAndCssStream(file, "js")
          : file
      );
    }
  }

  // props.projectSetting.grap_all_footer_scripts_in_single_file
  //   ? zip.file(
  //       `libs/js/min/footer/footer.lib.js`,
  //       props.projectSetting.minify_Js
  //         ? await minifyBlobJSAndCssStream(
  //             new Blob(
  //               projectData.jsFooterLibs.map((lib) => lib.file),
  //               { type: "application/javascript" }
  //             ),
  //             "js"
  //           )
  //         : new Blob(
  //             projectData.jsFooterLibs.map((lib) => lib.file),
  //             { type: "application/javascript" }
  //           )
  //     )
  //   : await Promise.all(
  //       projectData.jsFooterLibs.map(async (lib) => {
  //         if (lib.isCDN)
  //           return new Blob([], { type: "application/javascript" });
  //         return zip.file(
  //           `libs/js/footer/${lib.file.name}`,
  //           props.projectSetting.minify_Js
  //             ? await minifyBlobJSAndCssStream(lib.file, "js")
  //             : lib.file
  //         );
  //       })
  //     );

  //Handling fonts folder
  for (const font of Object.values(projectData.fonts)) {
    if (font.isCDN) continue;
    const handle = await opfs.getFile(defineRoot(font.path));
    const file = await handle.getOriginFile();
    zip.file(font.path, file);
  }
  // Object.values(projectData.fonts)
  //   .filter((font) => !font.isCDN)
  //   .forEach((font) => zip.file(`fonts/${font.file.name}`, font.file));

  //Handling globals folder
  console.log(`Start loading Globals`);
  const globalJsFile = await (
    await opfs.getFile(defineRoot(`global/global.js`))
  ).getOriginFile();
  const globalCssFile = await (
    await opfs.getFile(defineRoot(`global/global.css`))
  ).getOriginFile();

  zip.file(
    `global/global.js`,
    props.projectSetting.minify_Js
      ? await minifyBlobJSAndCssStream(globalJsFile, "js")
      : globalJsFile
  );
  zip.file(
    `global/global.css`,
    props.projectSetting.minify_Css
      ? await minifyBlobJSAndCssStream(globalCssFile, "css")
      : globalCssFile
  );
  props.projectSetting.include_canvas_styles_in_build_file &&
    zip.file(`global/infinitely.css`, infinitelyStyles);
  console.log(`End loading Globals`);

  //Handling pages folder
  console.log(`Start loading pages`);
  const pages = Object.values(projectData.pages).filter(
    (page) => page.name.toLowerCase() != "index"
    // && page.name.toLowerCase() != "playground"
  );
  console.log("pages build : ", pages);

  for (const page of pages) {
    zip.file(
      page.pathes.html.replace("editor/", ""),
      await buildPage({
        projectData,
        page,
        ...pageBuildSettings,
      })
    );
  }
  console.log(`End loading pages`);

  // await Promise.all(
  //   pages.map(async (page) =>
  //     zip.file(
  //       `pages/${page.name}.html`,
  //       await buildPage({
  //         projectData,
  //         page,
  //         ...pageBuildSettings,
  //       })
  //     )
  //   )
  // );

  // const fontsData = Object.fromEntries(
  //   Object.entries(projectData.fonts).map(([key, value]) => {
  //     if (value.isCDN) return [key, value];
  //     console.log("font type : ", value.file.type);

  //     const ext = mime.getExtension(value.file.type);
  //     const pathName =
  //       `${value?.file?.name.replace(`.${ext}`, "")}.${ext}` || "";
  //     value.file = null;
  //     value.path = pathName ? `fonts/${pathName}` : null;
  //     return [key, value];
  //   })
  // );

  // const jsHeaderLibsData = projectData.jsHeaderLibs.map((lib, i) => {
  //   lib.sort = i;
  //   const ext = mime.getExtension(lib.file.type);
  //   const pathName = `${lib?.file?.name.replace(`.js`, "")}.js` || "";
  //   lib.file = null;
  //   if (lib.isCDN) return lib;
  //   lib.path = pathName ? `libs/js/header/${pathName}` : null;
  //   return lib;
  // });

  // const jsFooterLibsData = projectData.jsFooterLibs.map((lib, i) => {
  //   lib.sort = i;
  //   const ext = mime.getExtension(lib.file.type);
  //   const pathName = `${lib?.file?.name.replace(`.js`, "")}.js` || "";
  //   lib.file = null;
  //   if (lib.isCDN) return lib;
  //   lib.path = pathName ? `libs/js/footer/${pathName}` : null;
  //   return lib;
  // });

  // const cssLibsData = projectData.cssLibs.map((lib, i) => {
  //   lib.sort = i;
  //   const ext = mime.getExtension(lib.file.type);
  //   const pathName = `${lib?.file?.name.replace(`.css`, "")}.css` || "";
  //   lib.file = null;
  //   if (lib.isCDN) return lib;
  //   lib.path = pathName ? `libs/css/${pathName}` : null;
  //   return lib;
  // });
  //Handling Motions

  // const pagesData = Object.fromEntries(
  //   Object.entries(projectData.pages).map(([key, page]) => {
  //     delete page.html;
  //     delete page.css;
  //     delete page.components;
  //     delete page.id;
  //     delete page.js;
  //     delete page.cmds;
  //     delete page.symbols;
  //     delete page.helmet;
  //     return [key, page];
  //   })
  // );

  console.log(`Start loading motions`);
  const cleanedMotions = await cleanMotions(
    projectData.motions,
    projectData.pages
  ); //Will used in build motion scripts function
  const motionScripts = buildMotionScripts({
    motions: cleanedMotions,
    pages: projectData.pages,
  });
  zip.file(
    `js/motions/index.js`,
    props.projectSetting.minify_Js
      ? (await (await import("terser")).minify(motionScripts.index)).code
      : motionScripts.index
  );

  for (const [key, value] of Object.entries(motionScripts.other)) {
    zip.file(
      `js/motions/${key}.js`,
      props.projectSetting.minify_Js
        ? (await (await import("terser")).minify(value)).code
        : value
    );
  }
  console.log(`End loading motions`);

  // await Promise.all(
  //   Object.entries(motionScripts.other).map(async ([key, value]) => {
  //     return zip.file(
  //       `js/motions/${key}.js`,
  //       props.projectSetting.minify_Js
  //         ? (await (await import("terser")).minify(value)).code
  //         : value
  //     );
  //   })
  // );

  //Handling Editor Data
  /**
   * @type {import('../helpers/types').Project}
   */
  // const editorData = {
  //   blocks: projectData.blocks,
  //   imgSrc: projectData.imgSrc,
  //   description: projectData.description,
  //   name: projectData.name,
  //   restAPIModels: projectData.restAPIModels.map((model) => {
  //     model.response = null;
  //     return model;
  //   }),
  //   symbols: projectData.symbols,
  //   type: projectData.type,
  //   fonts: fontsData,
  //   jsHeaderLibs: jsHeaderLibsData,
  //   jsFooterLibs: jsFooterLibsData,
  //   cssLibs: cssLibsData,
  //   pages: pagesData,
  //   motions: cleanedMotions,
  //   projectSettings: props.projectSetting,
  // };
  for (const rm of projectData.restAPIModels) {
    rm.response = "";
  }
  projectData.motions = cleanedMotions;
  const editorDataBlob = new Blob(
    [JSON.stringify(await replaceBlobs(projectData))],
    { type: "application/json" }
  );
  zip.file("editor/infinitely.json", editorDataBlob);
  const screenshot = await (
    await opfs.getFile(defineRoot(`screenshot.webp`))
  ).getOriginFile();
  zip.file("screenshot.webp", screenshot);

  //Handling Editor Data
  if (props.projectSetting.include_symbols_in_export) {
    const allSymbolsFiles = await opfs.getAllFiles(
      defineRoot(`editor/symbols`),
      { recursive: true }
    ); //Css & Js

    for (const handle of allSymbolsFiles) {
      const path = handle.path.replace(
        `projects/project-${props.projectId}/`,
        ""
      );
      const file = await handle.getOriginFile();
      zip.file(path, file);
    }
  }

  if (props.projectSetting.include_templates_in_export) {
    const allTemplatesFiles = await opfs.getAllFiles(
      defineRoot(`editor/templates`),
      { recursive: true }
    ); //Css & Js

    for (const handle of allTemplatesFiles) {
      const path = handle.path.replace(
        `projects/project-${props.projectId}/`,
        ""
      );
      const file = await handle.getOriginFile();
      zip.file(path, file);
    }
  }

  console.log(`Project end loading`);

  self.postMessage({
    command: "exportProject",
    props: {
      file: await zip.generateAsync({
        type: "blob",
        compression: "STORE",
        streamFiles: true,
      }),
      name: `${projectData.name}`,
    },
  });

  workerSendToast({
    isNotMessage: true,
    msg: toastId,
    type: "done",
  });

  workerSendToast({
    msg: project_successfully_build_msg,
    type: "success",
  });

  console.log(`From worker Project built successfully 👍`);
  // } catch (error) {
  //   workerSendToast({
  //     isNotMessage: true,
  //     msg: toastId,
  //     type: "dismiss",
  //   });

  //   workerSendToast({
  //     msg: project_faild_build_msg,
  //     type: "error",
  //   });
  //   throw new Error(error);
  // }
  // zip.file()
};

/**
 *
 * @param {{
 * projectData : import('./types').Project ,
 * page:import('./types').InfinitelyPage ,
 * grapHeaderScripts:boolean ,
 * grapeFooterScripts:boolean ,
 * isHeaderGrapedAsync:boolean ,
 * isHeaderGrapedDefer:boolean ,
 * isFooterGrapedDefer:boolean ,
 * isFooterGrapedAsync:boolean ,
 * grapStyles:boolean ,
 * disablePvue:boolean,
 * urlException : boolean,
 * projectSetting : import('./types').ProjectSetting
 * }} param0
 * @returns
 */
async function buildPage({
  projectData,
  page,
  grapHeaderScripts = false,
  grapeFooterScripts = false,
  isHeaderGrapedDefer,
  isHeaderGrapedAsync,
  isFooterGrapedDefer,
  isFooterGrapedAsync,
  grapStyles = false,
  disablePvue = false,
  urlException = false,
  projectSetting = {},
}) {
  const helmet = page.helmet;
  // const { document } = parseHTML(doDocument(await page.html.text()));
  const pageFile = await (
    await opfs.getFile(defineRoot(page.pathes.html))
  ).getOriginFile();

  const isTailwindExist = await opfs.getFile(defineRoot(`css/tailwind/${page.name}.css`));

  const urlDots = urlException ? "." : "..";
  const helmetRaw = html`
    <meta name="author" content="${helmet.author || ""}" />
    <meta name="description" content="${helmet.description || ""}" />
    <meta name="keywords" content="${helmet.keywords || ""}" />
    <title>${helmet.title || ""}</title>
    <link
      rel="icon"
      href="${projectData.logo ? `${urlDots}/${projectData.logo}` : ""}"
    />
    <link rel="stylesheet" href="${urlDots}/global/infinitely.css" />
    <link rel="stylesheet" href="${urlDots}/global/global.css" />
    <link rel="stylesheet" href="${urlDots}/css/fonts.css" />
    ${projectSetting.enable_tailwind_calsses && isTailwindExist ? `<link rel="stylesheet" href="${urlDots}/css/tailwind/${page.name}.css" />` : ''}
    <link rel="stylesheet" href="${urlDots}/css/${page.name}.css" />
    ${!grapStyles
      ? projectData.cssLibs
          .map(
            (lib) =>
              `<link rel="stylesheet" href="${urlDots}/${
                lib.path.startsWith("/") ? lib.path.replace("/", "") : lib.path
              }" />`
          )
          .join("\n")
      : `<link rel="stylesheet" href="${urlDots}/libs/css/lib.css"/>`}
    ${!grapHeaderScripts
      ? projectData.jsHeaderLibs
          .map(
            (lib) =>
              `<script ${(lib.defer && 'defer="true"') || ""} ${
                (lib.async && 'async="true"') || ""
              }  src="${
                lib.isCDN
                  ? lib.fileUrl
                  : `${urlDots}/${
                      lib.path.startsWith("/")
                        ? lib.path.replace("/", "")
                        : lib.path
                    }`
              }" />`
          )
          .join("\n")
      : `<script ${(isHeaderGrapedDefer && 'defer="true"') || ""} ${
          (isHeaderGrapedAsync && 'async="true"') || ""
        }  src='${urlDots}/libs/js/min/header/header.lib.js'></script>`}
    ${helmet?.customMetaTags instanceof Blob
      ? await helmet?.customMetaTags?.text?.()
      : helmet?.customMetaTags || ""}
  `;

  // const handleSrcBuilds = () => {
  //   document.querySelectorAll(`[${inf_build_url}]`).forEach((el) => {
  //     const url = el.getAttribute(`${inf_build_url}`);
  //     console.log("from worker : url =", url);

  //     el.setAttribute("src", url.replace("infinitely", urlDots));
  //   });
  // };
  // handleSrcBuilds();

  const pageRaw = html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        ${helmetRaw}
      </head>
      <body
        ${Object.keys(page.bodyAttributes || {})
          .map((key) => `${key}="${page.bodyAttributes[key]}"`)
          .join(" ")}
      >
        ${await pageFile.text()}
        ${grapeFooterScripts
          ? `<script ${(isFooterGrapedDefer && 'defer="true"') || ""} ${
              (isFooterGrapedAsync && 'async="true"') || ""
            } src="${urlDots}/libs/js/min/footer/footer.lib.js"></script>`
          : projectData.jsFooterLibs
              .map(
                (lib) =>
                  `<script ${(lib.defer && 'defer="true"') || ""} ${
                    (lib.async && 'async="true"') || ""
                  }  src="${
                    lib.isCDN
                      ? lib.fileUrl
                      : `${urlDots}/${
                          lib.path.startsWith("/")
                            ? lib.path.replace("/", "")
                            : lib.path
                        }`
                  }" />`
              )
              .join("\n")}

        <script src="${urlDots}/global/global.js"></script>
        <script src="${urlDots}/js/${page.name}.js"></script>
        ${buildScripts({
          disablePvue: projectSetting.disable_petite_vue,
          disableGsapCore: projectSetting.disable_gsap_core,
          disableGsapScrollTrigger: projectSetting.disable_gsap_scrollTrigger,
          inserts: [
            {
              index:
                projectSetting.disable_gsap_core &&
                projectSetting.disable_gsap_scrollTrigger
                  ? 0
                  : (!projectSetting.disable_gsap_core &&
                      projectSetting.disable_gsap_scrollTrigger) ||
                    (projectSetting.disable_gsap_core &&
                      !projectSetting.disable_gsap_scrollTrigger)
                  ? 1
                  : !projectSetting.disable_gsap_core &&
                    !projectSetting.disable_gsap_scrollTrigger
                  ? 2
                  : null,
              item: {
                name: `${page.name}.js`,
                buildUrl: `/js/motions/${page.name}.js`,
              },
            },
          ],
        })
          .map(
            (url) =>
              `<script src="${urlDots}${
                url.buildUrl ? `${url.buildUrl}` : `/libs/js/${url.name}`
              }"></script>`
          )
          .join("\n")}
      </body>
    </html>
  `;

  return pageRaw;
}

/**
 *
 * @param {import('../helpers/types').InfinitelyFonts} fonts
 */
function buildFontFaces(fonts) {
  const values = Object.values(fonts)
    .map((font) =>
      defineFontFace({
        family: font.isCDN ? font.name : font.path,
        url: font.isCDN
          ? `url("${font.url}")`
          : `url("../${
              font.path.startsWith("/") ? font.path.replace("/", "") : font.path
            }")`,
      })
    )
    .join("\n\n\n");

  return new Blob([values], { type: "text/css" });
}

/**
 *
 * @param {{motions : {[key:string] : import('./types').MotionType} , pages :  {[key:string]:import('./types').InfinitelyPage}}} param0
 */
function buildMotionScripts({ motions, pages }) {
  // const cleanedMotions = await cleanMotions(motions);
  const finalMotions = {
    index: "",
    other: {},
  };

  // await Promise.all(
  Object.entries(pages).map(([key, page]) => {
    // const pageContent = await page.html.text();
    Object.values(motions).map((motion) => {
      if (motion.pages.includes("index")) {
        finalMotions.index = buildGsapMotionsScript({ [motion.id]: motion });
      } else if (motion.pages.includes(page.name)) {
        finalMotions.other[page.name] = buildGsapMotionsScript({
          [motion.id]: motion,
        });
      }
    });
    return page;
  });
  // );

  return finalMotions;
}
