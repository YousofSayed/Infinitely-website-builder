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
  chunkHtmlElements,
  cleanMotions,
  defineFontFace,
  defineRoot,
  doDocument,
  html,
  minifyBlobJSAndCssStream,
  replaceBlobs,
} from "./bridge";
// import { parseHTML } from "linkedom";
import {
  buildScripts,
  inf_build_url,
  inf_symbol_Id_attribute,
  loading_project_msg,
  motionId,
  project_faild_build_msg,
  project_successfully_build_msg,
} from "../constants/shared";
import { cloneDeep, cloneDeepWith, isPlainObject, uniqueId } from "lodash";
import { workerSendToast } from "./workerCommands";
import { opfs } from "./initOpfs";
import { html_beautify } from "js-beautify";
import { parseHTML } from "linkedom";

/**
 * @type {{[key:string]:string[]}}
 */
let exportTimeout;

/**
 *
 * @param {{asJson:boolean , projectId:number , toastId:string, projectSetting : import('./types').ProjectSetting}} props
 */
export async function buildProject(props) {
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

  // const alpineBlob = await (await fetch("/scripts/alpine.js")).blob();
  // const infImportsBuildBlob = await (
  //   await fetch("/scripts/infImportsBuild.js")
  // ).blob();

  // try {

  // console.log('props' , props , opfs.id ,projectData.logo, defineRoot(projectData.logo) );

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

  projectData.logo &&
    zip.file(
      "logo.png",
      await (await opfs.getFile(defineRoot(projectData.logo))).getOriginFile()
    );

  zip.file(
    "index.html",
    buildPage({
      page: projectData.pages[`index`],
      projectData,
      projectSetting: props.projectSetting,
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
      projectSetting: props.projectSetting,
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

    zip.file(
      page.pathes.css,
      props.projectSetting.minify_Css
        ? await minifyBlobJSAndCssStream(cssFile, "css")
        : cssFile
    );

    if (props.projectSetting.enable_tailwind) {
      const path = `css/tailwind/${page.name}.css`;
      const tailwindCssHandle = await opfs.getFile(defineRoot(path));
      if (tailwindCssHandle) {
        const twFile = await tailwindCssHandle.getOriginFile();
        zip.file(
          path,
          // props.projectSetting.minify_Css
          //   ? await minifyBlobJSAndCssStream(twFile, "css")
          // :
          twFile
        );
      }
    }

    // if (page.symbols.length) {
    //   const files = await Promise.all(
    //     page.symbols.map(async (symbol) => {
    //       const handle = await opfs.getFile(
    //         defineRoot(`editor/symbols/${symbol}/${symbol}.css`)
    //       );
    //       const file = await handle.getOriginFile();
    //       return file;
    //     })
    //   );
    //   zip.file(
    //     `css/symbols/${page.name}.css`,
    //     props.projectSetting.minify_Css
    //       ? await minifyBlobJSAndCssStream(
    //           new Blob(files, { type: "text/css" }),
    //           "css"
    //         )
    //       : new Blob(files, { type: "text/css" })
    //   );
    // }
  }
  const templates = Object.values(projectData.blocks || {}).filter(
    (block) => block.type == "template"
  );

  const symbols = Object.values(projectData.symbols || {});

  if (templates.length) {
    const files = await Promise.all(
      templates.map(async (template) => {
        const handle = await opfs.getFile(defineRoot(template.pathes.style));
        const file = await handle.getOriginFile();
        return file;
      })
    );
    zip.file(
      `css/templates.css`,
      props.projectSetting.minify_Css
        ? await minifyBlobJSAndCssStream(
            new Blob(files, { type: "text/css" }),
            "css"
          )
        : new Blob(files, { type: "text/css" })
    );
  }

  if (symbols.length) {
    const files = await Promise.all(
      symbols.map(async (symbol) => {
        const handle = await opfs.getFile(
          defineRoot(`editor/symbols/${symbol.id}/${symbol.id}.css`)
        );
        const file = await handle.getOriginFile();
        return file;
      })
    );
    zip.file(
      `css/symbols.css`,
      props.projectSetting.minify_Css
        ? await minifyBlobJSAndCssStream(
            new Blob(files, { type: "text/css" }),
            "css"
          )
        : new Blob(files, { type: "text/css" })
    );
  }

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

  //Handling fonts folder
  for (const font of Object.values(projectData.fonts)) {
    if (font.isCDN) continue;
    const handle = await opfs.getFile(defineRoot(font.path));
    const file = await handle.getOriginFile();
    zip.file(font.path, file);
  }

  //Handling globals folder
  const infinitelyStyles = props.projectSetting
    .include_canvas_styles_in_build_file
    ? await (await fetch("/styles/style.css")).blob()
    : "";

  const globalRules = !props.projectSetting.enable_tailwind
    ? await (await fetch(`/styles/global-rules.css`)).blob()
    : "";

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

  !props.projectSetting.enable_tailwind &&
    zip.file(`/global/global-rules.css`, globalRules);

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
        projectSetting: props.projectSetting,
        ...pageBuildSettings,
      })
    );
  }
  console.log(`End loading pages`);

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
  return zip;
}

/**
 *
 * @param {{asJson:boolean , projectId:number , toastId:string, projectSetting : import('./types').ProjectSetting}} props
 */
export const exportProject = async (props) => {
  const toastId = uniqueId("toast-");
  exportTimeout && clearTimeout(exportTimeout);
  exportTimeout = setTimeout(async () => {
    try {
      workerSendToast({
        msg: loading_project_msg,
        type: "loading",
        dataProps: {
          toastId,
        },
      });
      const projectData = await db.projects.get(props.projectId);

      const project = await buildProject(props);
      self.postMessage({
        command: "exportProject",
        props: {
          file: await project.generateAsync({
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
    } catch (error) {
      workerSendToast({
        isNotMessage: true,
        msg: toastId,
        type: "dismiss",
        dataProps: {
          progressClassName: "bg-[crimson]",
        },
      });

      workerSendToast({
        msg: project_faild_build_msg,
        type: "error",
      });
      throw new Error(error);
    }
  }, 10);
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

  const isTailwindExist = await (
    await opfs.getFile(defineRoot(`css/tailwind/${page.name}.css`))
  ).exists();

  console.log(page.name, isTailwindExist, projectSetting.enable_tailwind);
  // ${page.symbols.length
  //       ? `<link href="${urlDots}/css/symbols/${page.name}.css" rel="stylesheet" />`
  //       : ""}

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
    ${projectSetting.enable_tailwind && isTailwindExist
      ? `<link rel="stylesheet" href="${urlDots}/css/tailwind/${page.name}.css" />`
      : `<link rel="stylesheet" href="${urlDots}/global/global-rules.css" />`}
    ${page.symbols.length
      ? `<link href="${urlDots}/css/symbols.css" rel="stylesheet" />`
      : ""}
    ${Object.values(projectData.blocks).filter(
      (block) => block.type == "template"
    ).length
      ? `<link href="${urlDots}/css/templates.css" rel="stylesheet"/>`
      : ""}
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
    ${projectSetting.enable_spline_viewer
      ? `<script src="https://unpkg.com/@splinetool/viewer@1.10.27/build/spline-viewer.js" type="module"></script>`
      : ""}
  `;

  // const handleSrcBuilds = () => {
  //   document.querySelectorAll(`[${inf_build_url}]`).forEach((el) => {
  //     const url = el.getAttribute(`${inf_build_url}`);
  //     console.log("from worker : url =", url);

  //     el.setAttribute("src", url.replace("infinitely", urlDots));
  //   });
  // };
  // handleSrcBuilds();

  const { document } = parseHTML(doDocument(await pageFile.text()));
  const els = document.querySelectorAll(`[${inf_symbol_Id_attribute}]`);
  for (const el of els) {
    const symbolId = el.getAttribute(inf_symbol_Id_attribute);
    el.outerHTML = await (
      await opfs.getFile(
        defineRoot(`editor/symbols/${symbolId}/${symbolId}.html`)
      )
    ).text();
  }

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
        ${document.body.innerHTML}
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
          projectSetting,
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
              }" ${
                url.attributes && isPlainObject(url.attributes)
                  ? Object.entries(url.attributes).map(
                      ([key, value]) => `${key}="${value}"`
                    )
                  : ""
              }></script>`
          )
          .join("\n")}

        <script>
          const seriousStyle = \`
  font-size: 20px;
  font-weight: 900;
  color: #b91c1c;       
  background: #fef2f2;  
  padding: 8px 12px;
  border: 2px solid #b91c1c;
  border-radius: 6px;
\`;

          const neutralStyle = \`\`; // reset styles

          const decorativeStyle = \`
  background: #1e3a8a; 
  color: white;              
  font-style: italic;
  font-size: 18px;
  font-weight: bold;
  padding: 10px;            
  border-radius: 6px;      
  text-shadow: 2px 2px 6px rgba(0,0,0,0.5);
\`;

          console.clear();
          console.log(
            \`%cThis text 👇 is my copyright, so don’t remove it 😒!%c

%c💙 الحمد لله رب العالمين 💙\`,
            seriousStyle,
            neutralStyle,
            decorativeStyle
          );
        </script>
      </body>
    </html>
  `;

  return html_beautify(pageRaw);
}

/**
 *
 * @param {import('../helpers/types').InfinitelyFonts} fonts
 */
function buildFontFaces(fonts) {
  const values = Object.values(fonts)
    .map((font) =>
      defineFontFace({
        family: font.name,
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
