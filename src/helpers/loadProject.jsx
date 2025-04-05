import JSZip from "jszip";
import { restoreBlobs } from "./bridge";
import { parseHTML } from "linkedom";
import { uniqueId } from "lodash";
import { db } from "./db";

/**
 *
 * @param {{file:File}} props
 */
export const loadProject = async (props) => {
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
  self.postMessage({
    command: "toast",
    props: {
      msg: "Loading project",
      type: "inf",
    },
  });
  const zip = new JSZip();
  const projectZip = await zip.loadAsync(file);
  const getFiles = (pathName, extName) =>
    Object.fromEntries(
      Object.entries(projectZip.files).filter(([path, file]) => {
        return path.startsWith(pathName) && !file.dir;
      })
    );
  const pages = { ...getFiles("pages/"), ...getFiles("index.html") };
  const css = getFiles("css");
  const js = getFiles("js");
  const assets = getFiles("assets");
  //   const fonts = getFiles("fonts");
  //   const jsLibsHeader = getFiles("libs/js/header");
  //   const jsLibsFooter = getFiles("libs/js/footer");
  //   const jsLibsMin = getFiles("libs/js/min");
  //   const cssLibs = getFiles("libs/css");
  //   const indexPage = getFiles("index.html");
  const siteLogo = getFiles("logo.png");
  const editorData = getFiles("infinitely.json");
    const globalCss = getFiles("globals/global.css");
    const globalJs = getFiles("globals/global.js");
  if (!Object.keys(editorData).length) {
    toast.error(<ToastMsgInfo msg={`Invalid Zip File`} />);
  }
  /**
   * @type {import('./types').Project}
   */
  const dataMap = restoreBlobs(
    JSON.parse(await editorData["infinitely.json"].async("text"))
  );

  self.postMessage({
    command: "toast",
    props: {
      msg: "Project is valid",
      type: "success",
    },
  });

  console.log("files : ", dataMap);

  self.postMessage({
    command: "toast",
    props: {
      msg: "building pages",
      type: "info",
    },
  });

  /**
   * @type {{[key:string] : import('./types').InfinitelyPage}}
   */
  const builtPages = Object.fromEntries(
    await Promise.all(
      Object.entries(pages).map(async ([path, file]) => {
        const pageName = path.replace(/pages\/|\.html/gi, "");
        console.log("path : ", path, "page name:", pageName);
        return [pageName, {
          ...dataMap.pages[pageName],
          ...await buildPage(pageName, file)
        }];
      })
    )
  );

  self.postMessage({
    command: "toast",
    props: {
      msg: "Pages built successfully",
      type: "success",
    },
  });
  console.log("From worker : pages built : ", newProject.pages);

  self.postMessage({
    command: "toast",
    props: {
      msg: "Installing Fonts...",
      type: "info",
    },
  });
  for (const key in dataMap.fonts) {
    const value = dataMap.fonts[key];
    if (value.isCDN) continue;
    const loadedFile = await (await fetch(value.url)).blob();
    console.log("value : ", loadedFile, value.name);

    value.file = new File([loadedFile], key, {
      type: mime.getType(value.path),
    });
  }
  self.postMessage({
    command: "toast",
    props: {
      msg: "Fonts installed successfully",
      type: "success",
    },
  });

  self.postMessage({
    command: "toast",
    props: {
      msg: "Installing js and css libs",
      type: "info",
    },
  });
  for (const lib of dataMap.jsHeaderLibs
    .concat(dataMap.jsFooterLibs)
    .concat(dataMap.cssLibs)) {
    console.log(lib);

    // const loadedFile = await fonts[value.path].async("blob");
    lib.file = new File([await (await fetch(lib.fileUrl)).blob()], lib.name, {
      type: mime.getType(lib.name),
    });
  }

  self.postMessage({
    command: "toast",
    props: {
      msg: "Js and Css libs installed successfully",
      type: "success",
    },
  });

  /**
   * @type {import('./types').Project}
   */
  const dbData = {
    ...dataMap,
    pages: builtPages,
    assets: await Promise.all(
      Object.values(assets).map(async (asset) => ({
        file: new File(
          [await asset.async("blob")],
          asset.name.replace("assets/", ""),
          { type: mime.getType(asset.name.replace("assets/", "")) }
        ),
        buildUrl: asset.name,
        id: uniqueId(),
      }))
    ),
    globalJs: new Blob([await Object.values(globalJs)?.[0]?.async('blob')] , {type:'application/javascript'}),
    globalCss: new Blob([await Object.values(globalCss)?.[0]?.async('blob')] , {type:'text/css'}),

    logo: new Blob([await Object.values(siteLogo)[0].async("blob")], {
      type: mime.getType(".png"),
    }),
  };
  console.log("my project : ", dbData);

  await db.projects.add({ ...dbData });
  self.postMessage({
    command: "toast",
    props: {
      msg: "Project loaded successfully",
      type: "success",
    },
  });

  //  console.log( mime.getType('dsa.html'),pages , css , js , assets , fonts , jsLibs , cssLibs , indexPage);
  // console.log("pages :", await pages. );

  /**
   *
   * @param {string} path
   * @param {import('jszip').JSZipObject} file
   */
  async function buildPage(pageName, file) {
    const { document } = parseHTML(await file.async("text"));
    const pageTitle = document.title;
    const descMetaEl = document.querySelector('meta[name="description"]');
    const descMeta = descMetaEl?.getAttribute?.("content") || "";

    const authorMetaEl = document.querySelector('meta[name="author"]');
    const authorMeta = authorMetaEl?.getAttribute?.("content") || "";

    const keywordsMetaEl = document.querySelector('meta[name="keywords"]');
    const keywordsMeta = keywordsMetaEl?.getAttribute?.("content") || "";

    //Remove none important els
    descMetaEl?.remove?.();
    authorMetaEl?.remove?.();
    keywordsMetaEl?.remove?.();
    document.body.querySelectorAll("script").forEach((el) => el.remove());
    document.body.querySelectorAll("style").forEach((el) => el.remove());
    document.body.querySelectorAll("link").forEach((el) => el.remove());

    console.log("helmet : ", pageTitle, descMeta, authorMeta, keywordsMeta);
    const allMeta = new Blob(
      [
        [...document.querySelectorAll("meta")]
          .map((el) => el.outerHTML)
          .join("\n"),
      ],
      { type: "text/html" }
    );

    /**
     * @type {import('../../helpers/types').InfinitelyPage}
     */
    const page = {
      html: new Blob([document.body.innerHTML], { type: "text/html" }),
      css: new Blob([await css[`css/${pageName}.css`].async("blob")], {
        type: "text/css",
      }),
      js: new Blob([await js[`js/${pageName}.js`].async("blob")], {
        type: "application/js",
      }),
      name: pageName.toLowerCase(),
      id: uniqueId(),
      helmet: {
        description: descMeta,
        author: authorMeta,
        keywords: keywordsMeta,
        title: pageTitle,
        customMetaTags: allMeta,
      },
    };
    return page;
  }
};
