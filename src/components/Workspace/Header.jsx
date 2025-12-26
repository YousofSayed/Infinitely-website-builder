import React, { useEffect, useRef, useState } from "react";
import { Icons } from "../Icons/Icons";
import { Button } from "../Protos/Button";
import { Input } from "../Editor/Protos/Input";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { projectState, showCrtModalState } from "../../helpers/atoms";
import { dropBoxFilesMeta, projectsType } from "../../helpers/jsDocs";
import { db } from "../../helpers/db";
import JSZip from "jszip";
import { parseHTML } from "linkedom";
import { uniqueId } from "lodash";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Editor/Protos/ToastMsgInfo";
import { restoreBlobs } from "../../helpers/bridge";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";
import { loadProject } from "../../helpers/functions";
import { OptionsButton } from "../Protos/OptionsButton";
import {
  authDropBox,
  checkDropBoxSignInState,
  getDropBoxAccessToken,
  getDropboxFileBlob,
  handleDropboxRedirect,
  listDropboxFiles,
  loadDropBoxProject,
  logOutFromDropBox,
  refreshDropboxToken,
} from "../../helpers/dropboxHandlers";
import { addClickClass, uniqueID } from "../../helpers/cocktail";
import { dbx_sign_in_state } from "../../constants/shared";
import { SmallButton } from "../Editor/Protos/SmallButton";
import { For } from "million/react";
import { Loader } from "../Loader";

export const Header = () => {
  const setShowCrtModal = useSetRecoilState(showCrtModalState);
  const [dbProjects, setDbProjects] = useRecoilState(projectState);
  const [dropboxFiles, setDropBoxFiles] = useState(dropBoxFilesMeta);
  const [uiRefresher, setUiRefresher] = useState(uniqueId(`${uniqueID()}-`));
  const inpFile = useRef();

  useEffect(() => {
    dbxHandler();
    // (async () => {
    //   console.log("files list");
    // })();
  }, []);

 

  const dbxHandler = async () => {
    const isDropBoxInSignInState = Boolean(
      sessionStorage.getItem(dbx_sign_in_state)
    );
    if (isDropBoxInSignInState) {
    const res =  await handleDropboxRedirect();
     res && toast.success(<ToastMsgInfo msg={`Dropbox sign in successfully 💙`} />);
    }
  };

  const search = async (value = "") => {
    if (!value) return setDbProjects(await db.projects.toArray());

    const projects = await db.projects
      .filter((prjct) => prjct.name.includes(value))
      .toArray();
    setDbProjects(projects);
    console.log(
      await db.projects.filter((prjct) => prjct.name.includes("d")).toArray()
    );
  };

  /**
   *
   * @param {import("react").ChangeEvent} ev
   */
  const loadSite = async (ev) => {
    /**
     * @type {File}
     */
    const file = ev.target.files[0];
    console.log("load File start: ", file);

    loadProject(file);

    ev.target.value = "";
    //   const mime = await (await import("mime/lite")).default;
    //   /**
    //    * @type {import('../../helpers/types').Project}
    //    */
    //   let newProject = {
    //     pages: {},
    //   };
    //   const zip = new JSZip();
    //   const projectZip = await zip.loadAsync(file);
    //   const getFiles = (pathName, extName) =>
    //     Object.fromEntries(
    //       Object.entries(projectZip.files).filter(([path, file]) => {
    //         return path.startsWith(pathName) && !file.dir;
    //       })
    //     );
    //   const pages = { ...getFiles("pages/"), ...getFiles("index.html") };
    //   const css = getFiles("css");
    //   const js = getFiles("js");
    //   const assets = getFiles("assets");
    //   const fonts = getFiles("fonts");
    //   const jsLibsHeader = getFiles("libs/js/header");
    //   const jsLibsFooter = getFiles("libs/js/footer");
    //   const jsLibsMin = getFiles("libs/js/min");
    //   const cssLibs = getFiles("libs/css");
    //   const indexPage = getFiles("index.html");
    //   const siteLogo = getFiles("logo.png");
    //   const editorData = getFiles("infinitely.json");
    //   const globalCss = getFiles("globals/global.css");
    //   const globalJs = getFiles("globals/global.js");
    //   if (!Object.keys(editorData).length) {
    //     toast.error(<ToastMsgInfo msg={`Invalid Zip File`} />);
    //   }
    //   /**
    //    * @type {import('../../helpers/types').Project}
    //    */
    //   const dataMap = restoreBlobs(
    //     JSON.parse(await editorData["infinitely.json"].async("text"))
    //   );

    //   console.log("files : ", dataMap);

    //   newProject.pages = Object.fromEntries(
    //     await Promise.all(
    //       Object.entries(pages).map(async ([path, file]) => {
    //         const pageName = path.replace(/pages\/|\.html/gi, "");
    //         console.log("path : ", path, "page name:", pageName);
    //         return [pageName, await buildPage(pageName, file)];
    //       })
    //     )
    //   );

    //   console.log("pages built : ", newProject.pages);
    //   // newProject.fonts = Object.fromEntries(
    //   //   await Promise.all(
    //   //     Object.entries(dataMap.fonts).map(async ([key, value]) => {
    //   //       if (value.isCDN) return [key, value];
    //   //       const loadedFile = await fonts[value.path].async("blob");
    //   //       value.file = new File([loadedFile], key, {
    //   //         type: mime.getType(value.path),
    //   //       });
    //   //       return [key, value];
    //   //     })
    //   //   )
    //   // );

    //   for (const key in dataMap.fonts) {
    //     const value = dataMap.fonts[key];
    //     if (value.isCDN) continue;
    //     const loadedFile = await(await fetch(value.url)).blob();
    //     console.log('value : ' , loadedFile , value.name);

    //     value.file = new File([loadedFile], key, {
    //       type: mime.getType(value.path),
    //     });
    //   }

    //   for (const lib of dataMap.jsHeaderLibs.concat(dataMap.jsFooterLibs).concat(dataMap.cssLibs)) {
    //     console.log(lib);

    //     // const loadedFile = await fonts[value.path].async("blob");
    //       lib.file = new File([await(await fetch(lib.fileUrl)).blob()] , lib.name , {type : mime.getType(lib.name)})
    //   }

    //   toast.info(<ToastMsgInfo msg={'try'}/>)

    //   // Object.fromEntries(
    //   //   await Promise.all(
    //   //     Object.entries(fonts).map(async ([path, file]) => {
    //   //       const fontFileName = path.replace("fonts/", "");
    //   //       /**
    //   //        * @type {import('../../helpers/types').InfinitelyFont}
    //   //        */
    //   //       const fontFile = {
    //   //         file: new File([await file.async("blob")], fontFileName, {
    //   //           type: mime.getType(path),
    //   //         }),
    //   //         name: fontFileName.split(/\./gi)?.[0],
    //   //         id: uniqueId(),
    //   //       };

    //   //       return [fontFileName.split(/\./gi)?.[0], fontFile];
    //   //     })
    //   //   )
    //   // );
    //  newProject = {...dataMap , pages}
    //   console.log("fonts : ", newProject);

    //   //  console.log( mime.getType('dsa.html'),pages , css , js , assets , fonts , jsLibs , cssLibs , indexPage);
    //   // console.log("pages :", await pages. );

    //   /**
    //    *
    //    * @param {string} path
    //    * @param {import('jszip').JSZipObject} file
    //    */
    //   async function buildPage(pageName, file) {
    //     // pages.forEach(async (path, file) => {
    //     // const blobPage = new Blob([await file.async("blob")], {
    //     //   type: "text/html",
    //     // });
    //     // const pageName = path.replace(/page|\.html/gi, "");
    //     // console.log('page name: ' , pageName);

    //     // console.log(
    //     //   "page from file as text : ",
    //     //   file,
    //     //   path,
    //     //   await blobPage.text()
    //     // );
    //     const { document } = parseHTML(await file.async("text"));
    //     const pageTitle = document.title;
    //     const descMetaEl = document.querySelector('meta[name="description"]');
    //     const descMeta = descMetaEl?.getAttribute?.("content") || "";

    //     const authorMetaEl = document.querySelector('meta[name="author"]');
    //     const authorMeta = authorMetaEl?.getAttribute?.("content") || "";

    //     const keywordsMetaEl = document.querySelector('meta[name="keywords"]');
    //     const keywordsMeta = keywordsMetaEl?.getAttribute?.("content") || "";

    //     //Remove none important els
    //     descMetaEl?.remove?.();
    //     authorMetaEl?.remove?.();
    //     keywordsMetaEl?.remove?.();
    //     document.body.querySelectorAll("script").forEach((el) => el.remove());
    //     document.body.querySelectorAll("style").forEach((el) => el.remove());
    //     document.body.querySelectorAll("link").forEach((el) => el.remove());

    //     console.log("helmet : ", pageTitle, descMeta, authorMeta, keywordsMeta);
    //     const allMeta = new Blob(
    //       [
    //         [...document.querySelectorAll("meta")]
    //           .map((el) => el.outerHTML)
    //           .join("\n"),
    //       ],
    //       { type: "text/html" }
    //     );

    //     /**
    //      * @type {import('../../helpers/types').InfinitelyPage}
    //      */
    //     const page = {
    //       html: new Blob([document.body.innerHTML], { type: "text/html" }),
    //       css: new Blob([css[`css/${pageName}.css`].async("blob")], {
    //         type: "text/css",
    //       }),
    //       js: new Blob([js[`js/${pageName}.js`].async("blob")], {
    //         type: "application/js",
    //       }),
    //       name: pageName.toLowerCase(),
    //       id: uniqueId(),
    //       helmet: {
    //         description: descMeta,
    //         author: authorMeta,
    //         keywords: keywordsMeta,
    //         title: pageTitle,
    //         customMetaTags: allMeta,
    //       },
    //     };
    //     return page;
    //     // console.log(document.querySelectorAll("meta"));
    //     // });
    //   }

    // const promsPages = [];
    // await Promise.all(
    //   projectZip
    //     .filter((path, file) => path.startsWith("pages/") && path.endsWith('.html'))
    //     .map(async (file, index) => {
    //       console.log(file);

    //       const page = await buildPage(file.name, file);
    //       newProject.pages = { ...newProject.pages, ...page };
    //       return page;
    //     })
    // );
    // console.log("indexPage : ", newProject);

    // await buildPage();
  };

  // console.log(document.querySelectorAll('meta'));

  return (
    <header className="w-full   flex  text-slate-200 font-semibold">
      <section className="container m-auto p-2 flex items-center justify-between gap-2 bg-slate-950  rounded-lg">
        <figure className="flex items-center gap-2 pr-2 border-r-2 border-r-slate-600">
          {Icons.logo({})}
          <figcaption className="font-bold">Workspace</figcaption>
        </figure>

        <section className="flex rounded-lg overflow-hidden w-[50%] ">
          <figure className="flex items-center  px-3 bg-slate-900">
            {Icons.search({})}
          </figure>
          <Input
            onInput={(ev) => {
              search(ev.target.value);
            }}
            placeholder="Search..."
            className="bg-slate-900 focus:border-none rounded-tl-none rounded-bl-none w-full"
          />
        </section>

        <section className="flex items-center gap-3">
         
          <OptionsButton
            onClick={async (ev) => {
              if (!checkDropBoxSignInState()) {
                toast.warn(
                  <ToastMsgInfo msg={`You should sign in to dropbox`} />
                );
                return;
              }
              const filesMeta = await listDropboxFiles("", true);
              console.log("files meta : ", filesMeta);

              setDropBoxFiles(filesMeta);
            }}
            icon={Icons.dropbox({ fill: "white" })}
          >
            <menu style={{ width: 300, height: 300 }} className={`${dropboxFiles.length && `grid grid-cols-2 grid-rows-[135px] gap-2 overflow-hidden  overflow-y-auto [scrollbar-gutter:stable] rounded-lg   ${dropboxFiles.length > 4 && `pr-1`}`}`}>
              {Boolean(dropboxFiles.length) && checkDropBoxSignInState() ? (
                <For each={dropboxFiles}>
                  {(fileMeta, i) => (
                    <li key={i} className=" h-[135px]">
                      <figure className="p-2 h-full rounded-lg bg-slate-900 flex flex-col items-center gap-3 w-full">
                        <i>
                          {Icons.file({ fill: "white", width: 30, height: 30 })}
                        </i>
                        <figcaption className="p-2 max-w-full bg-slate-800 rounded-md custom-font-size text-nowrap  overflow-hidden text-ellipsis">
                          {fileMeta.name}
                        </figcaption>
                        <SmallButton
                          tooltipTitle={`Export : ${fileMeta.name}`}
                          className="h-[35px] bg-slate-800"
                          onClick={async (ev) => {
                            addClickClass(ev.currentTarget , 'click')
                            await loadDropBoxProject(fileMeta.path_lower, {
                              apps: "Dropbox",
                              dropboxFileMeta: fileMeta,
                            });
                          }}
                        >
                          {Icons.export("white")}
                        </SmallButton>
                      </figure>
                    </li>
                  )}
                </For>
              ) : (
                <section className="w-full h-full">
                  <Loader />
                </section>
              )}
            </menu>
          </OptionsButton>
          {/* </SmallButton> */}
          <Button
            onClick={(ev) => {
              setShowCrtModal(true);
            }}
          >
            {Icons.plus("white")} New site
          </Button>

          <Button
            onClick={(ev) => {
              inpFile.current.click();
            }}
          >
            {Icons.upload({ strokeColor: "white" })} Load site
          </Button>
          <OptionsButton key={uiRefresher}>
            <menu>
              <li>
                {!checkDropBoxSignInState() ? (
                  <Button
                    onClick={(ev) => {
                      addClickClass(ev.currentTarget, "click");
                      authDropBox();
                    }}
                  >
                    <i>{Icons.dropbox({ fill: "white" })}</i>
                    <h1 className="capitalize">Sign in to dropbox</h1>
                  </Button>
                ) : (
                  <Button
                    style={{
                      backgroundColor: "crimson",
                    }}
                    className="bg-[crimson]"
                    onClick={(ev) => {
                      addClickClass(ev.currentTarget, "click");
                      logOutFromDropBox();
                      setUiRefresher(uniqueId(`${uniqueID()}-`));
                      toast.info(
                        <ToastMsgInfo msg={`You signed out from dropbox 👍`} />
                      );
                    }}
                  >
                    <i>{Icons.dropbox({ fill: "white" })}</i>
                    <h1 className="capitalize">Log out from dropbox</h1>
                  </Button>
                )}
              </li>
            </menu>
          </OptionsButton>
          <input
            type="file"
            ref={inpFile}
            className="hidden"
            accept=".zip"
            onChange={loadSite}
          />
        </section>
      </section>
    </header>
  );
};
