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

// import JSZip from "jszip";
import { db } from "./db";
import {
  defineFontFace,
  doDocument,
  html,
  minifyBlobJSAndCssStream,
  replaceBlobs,
} from "./bridge";
import { parseHTML } from "linkedom";
import { buildScripts, inf_build_url } from "../constants/shared";

/**
 *
 * @param {{asJson:boolean , projectId:number , projectSetting : import('./types').ProjectSetting}} props
 */
export const exportProject = async (props) => {
  const JSZip = (await import('jszip')).default
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
    disablePvue:props.projectSetting.disable_petite_vue
  };
  const projectData = await db.projects.get(props.projectId);
  // const alpineBlob = await (await fetch("/scripts/alpine.js")).blob();
  // const infImportsBuildBlob = await (
  //   await fetch("/scripts/infImportsBuild.js")
  // ).blob();

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
  zip.file("logo.png", projectData.logo);
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
    buildScripts(props.projectSetting.disable_petite_vue).map(async (url) => {
      return zip.file(
        `libs/js/${url.name}`,
        await (await fetch(url.localUrl)).blob()
      );
    })
  );
  //Handling assets folder
  projectData.assets.forEach((asset) =>
    zip.file(`assets/${asset.file.name}`, transformImageToWebp(asset.file))
  );

  //Handling js folder
  await Promise.all(
    Object.values(projectData.pages).map(async (page) =>
      zip.file(
        `js/${page.name}.js`,
        props.projectSetting.minify_Js
          ? await minifyBlobJSAndCssStream(page.js, "js")
          : page.js
      )
    )
  );

  //Handling css folder
  await Promise.all(
    Object.values(projectData.pages).map(async (page) =>
      zip.file(
        `css/${page.name}.css`,
        props.projectSetting.minify_Css
          ? await minifyBlobJSAndCssStream(page.css, "css")
          : page.css
      )
    )
  );
  zip.file("css/fonts.css", buildFontFaces(projectData.fonts));

  //Handling libs folder
  props.projectSetting.grap_all_css_libs_in_single_file
    ? zip.file(
        `libs/css/lib.css`,
        props.projectSetting.minify_Css
          ? await minifyBlobJSAndCssStream(
              new Blob(
                projectData.cssLibs.map((lib) => lib.file),
                { type: `text/css` }
              )
            )
          : new Blob(
              projectData.cssLibs.map((lib) => lib.file),
              { type: "text/css" }
            )
      )
    : await Promise.all(
        projectData.cssLibs.map(async (lib) =>
          zip.file(
            `libs/css/${lib.file.name}`,
            props.projectSetting.minify_Css
              ? await minifyBlobJSAndCssStream(lib.file, "css")
              : lib.file
          )
        )
      );

  //Handling Js
  props.projectSetting.grap_all_header_scripts_in_single_file
    ? zip.file(
        `libs/js/min/header/header.lib.js`,
        props.projectSetting.minify_Js
          ? await minifyBlobJSAndCssStream(
              new Blob(
                projectData.jsHeaderLibs.map((lib) => lib.file),
                { type: `application/javascript` }
              ),
              "js"
            )
          : new Blob(
              projectData.jsHeaderLibs.map((lib) => lib.file),
              {
                type: "application/javascript",
              }
            )
      )
    : await Promise.all(
        projectData.jsHeaderLibs.map(async (lib) =>
          zip.file(
            `libs/js/header/${lib.file.name}`,
            props.projectSetting.minify_Js
              ? await minifyBlobJSAndCssStream(lib.file, "js")
              : lib.file
          )
        )
      );

  props.projectSetting.grap_all_footer_scripts_in_single_file
    ? zip.file(
        `libs/js/min/footer/footer.lib.js`,
        props.projectSetting.minify_Js
          ? await minifyBlobJSAndCssStream(
              new Blob(
                projectData.jsFooterLibs.map((lib) => lib.file),
                { type: "application/javascript" }
              ),
              "js"
            )
          : new Blob(
              projectData.jsFooterLibs.map((lib) => lib.file),
              { type: "application/javascript" }
            )
      )
    : await Promise.all(
        projectData.jsFooterLibs.map(async (lib) =>
          zip.file(
            `libs/js/footer/${lib.file.name}`,
            props.projectSetting.minify_Js
              ? await minifyBlobJSAndCssStream(lib.file, "js")
              : lib.file
          )
        )
      );

  //Handling fonts folder
  Object.values(projectData.fonts)
    .filter((font) => !font.isCDN)
    .forEach((font) => zip.file(`fonts/${font.file.name}`, font.file));

  //Handling globals folder
  zip.file(
    `globals/global.js`,
    props.projectSetting.minify_Js
      ? await minifyBlobJSAndCssStream(projectData.globalJs, "js")
      : projectData.globalJs
  );
  zip.file(
    `globals/global.css`,
    props.projectSetting.minify_Css
      ? await minifyBlobJSAndCssStream(projectData.globalCss, "css")
      : projectData.globalCss
  );
  props.projectSetting.include_canvas_styles_in_build_file &&
    zip.file(`globals/infinitely.css`, infinitelyStyles);

  //Handling pages folder
  const pages = Object.values(projectData.pages).filter(
    (page) =>
      page.name.toLowerCase() != "index" &&
      page.name.toLowerCase() != "playground"
  );
  console.log("pages build : ", pages);

  await Promise.all(
    pages.map(async (page) =>
      zip.file(
        `pages/${page.name}.html`,
        await buildPage({
          projectData,
          page,
          ...pageBuildSettings,
        })
      )
    )
  );

  const fontsData = Object.fromEntries(
    Object.entries(projectData.fonts).map(([key, value]) => {
      const pathName = value?.file?.name || "";
      value.file = null;
      value.path = pathName ? `fonts/${pathName}` : null;
      return [key, value];
    })
  );
  const jsHeaderLibsData = projectData.jsHeaderLibs.map((lib) => {
    const pathName = lib?.file?.name || "";
    lib.file = null;
    lib.path = pathName ? `libs/js/header/${pathName}` : null;
    return lib;
  });
  const jsFooterLibsData = projectData.jsFooterLibs.map((lib) => {
    const pathName = lib?.file?.name || "";
    lib.file = null;
    lib.path = pathName ? `libs/js/header/${pathName}` : null;
    return lib;
  });

  const cssLibsData = projectData.cssLibs.map((lib) => {
    const pathName = lib?.file?.name || "";
    lib.file = null;
    lib.path = pathName ? `libs/js/header/${pathName}` : null;
    return lib;
  });

  const pagesData = Object.fromEntries(
    Object.entries(projectData.pages).map(([key, page]) => {
      delete page.html;
      delete page.css;
      delete page.components;
      delete page.id;
      delete page.js;
      delete page.cmds;
      delete page.symbols;
      delete page.helmet;
      return [key, page];
    })
  );

  //Handling Editor Data
  /**
   * @type {import('../helpers/types').Project}
   */
  const editorData = {
    blocks: projectData.blocks,
    imgSrc: projectData.imgSrc,
    description: projectData.description,
    name: projectData.name,
    restAPIModels: projectData.restAPIModels,
    symbols: projectData.symbols,
    type: projectData.type,
    fonts: fontsData,
    jsHeaderLibs: jsHeaderLibsData,
    jsFooterLibs: jsFooterLibsData,
    cssLibs: cssLibsData,
    pages: pagesData,
  };
  const editorDataBlob = new Blob(
    [JSON.stringify(await replaceBlobs(editorData))],
    { type: "application/json" }
  );
  zip.file("infinitely.json", editorDataBlob);

  self.postMessage({
    command: "exportProject",
    props: {
      file: await zip.generateAsync({ type: "blob" }),
      name: projectData.name,
    },
  });
  console.log(`From worker Project built successfully 👍`);
  // zip.file()
};

/**
 *
 * @param {{projectData : import('./types').Project , page:import('./types').InfinitelyPage , grapHeaderScripts:boolean , grapeFooterScripts:boolean ,isHeaderGrapedAsync:boolean , isHeaderGrapedDefer:boolean , isFooterGrapedDefer:boolean , isFooterGrapedAsync:boolean ,grapStyles:boolean , disablePvue:boolean, urlException : boolean}} param0
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
}) {
  const helmet = page.helmet;
  // const { document } = parseHTML(doDocument(await page.html.text()));
  const urlDots = urlException ? "." : "..";
  const helmetRaw = html`
    <meta name="author" content="${helmet.author || ""}" />
    <meta name="description" content="${helmet.description || ""}" />
    <meta name="keywords" content="${helmet.keywords || ""}" />
    <title>${helmet.title || ""}</title>
    <link rel="icon" href="${projectData.logo ? `${urlDots}/logo.png` : ""}" />
    <link rel="stylesheet" href="${urlDots}/globals/infinitely.css" />
    <link rel="stylesheet" href="${urlDots}/globals/global.css" />
    <link rel="stylesheet" href="${urlDots}/css/fonts.css" />
    <link rel="stylesheet" href="${urlDots}/css/${page.name}.css" />
    ${!grapStyles
      ? projectData.cssLibs
          .map(
            (lib) =>
              `<link rel="stylesheet" href="${urlDots}/libs/css/${lib.file.name}" />`
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
                  : `${urlDots}/libs/js/header/${lib.file.name}`
              }" />`
          )
          .join("\n")
      : `<script ${(isHeaderGrapedDefer && 'defer="true"') || ""} ${
          (isHeaderGrapedAsync && 'async="true"') || ""
        }  src='${urlDots}/libs/js/min/header/header.lib.js'></script>`}
    ${(await helmet?.customMetaTags?.text?.()) || ""}
  `;

  const handleSrcBuilds = () => {
    document.querySelectorAll(`[${inf_build_url}]`).forEach((el) => {
      const url = el.getAttribute(`${inf_build_url}`);
      console.log("from worker : url =", url);

      el.setAttribute("src", url.replace("infinitely", urlDots));
    });
  };
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
        ${await page.html.text()}
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
                      : `${urlDots}/libs/js/footer/${lib.file.name}`
                  }" />`
              )
              .join("\n")}
        <script src="${urlDots}/globals/global.js"></script>
        <script src="${urlDots}/js/${page.name}.js"></script>
        ${buildScripts(disablePvue)
          .map(
            (url) => `<script src="${urlDots}/libs/js/${url.name}"></script>`
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
        family: font.file.name.split(/\.\w+/gi).join("").trim(),
        url: `url("../fonts/${font.file.name}")`,
      })
    )
    .join("\n\n\n");

  return new Blob([values], { type: "text/css" });
}
