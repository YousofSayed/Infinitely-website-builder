import React, { useEffect, useState } from "react";
import {
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import { isProjectInitedState, showCrtModalState } from "../../helpers/atoms";
import { db } from "../../helpers/db";
import { opfs } from "../../helpers/initOpfs";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Editor/Protos/ToastMsgInfo";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";

export const CreateProjectModal = ({
  onCloseClick = (ev) => {},
  onButtonClick = (ev) => {},
  onInput = (value = "") => {},
  onInputTextarea = (value = "") => {},
  showState = false,
}) => {
  const showCrtModal = useRecoilValue(showCrtModalState);
  const setShowCrtModal = useSetRecoilState(showCrtModalState);
  const [isProjectInited, setIsProjectInited] =
    useRecoilState(isProjectInitedState);

  const [data, setData] = useState({
    name: "",
    description: "",
  });

  // useEffect(()=>{
  //   /**
  //    *
  //    * @param {MessageEvent} ev
  //    */
  //   const cb = (ev)=>{
  //     const {command , props} = ev.data;
  //     if(command == 'createProject'){
  //       setIsProjectInited(true);
  //     }
  //   }
  // },[])

  const addProject = async () => {
    // setIsProjectInited(false);
    // const tId = toast.loading(<ToastMsgInfo msg={`Init Project`} />);

    // const id = await db.projects.add({
    //   name: data.name,
    //   description: data.description,
    //   logo: "",
    //   blocks: {},
    //   // cssLibraries: [],
    //   // jsHeaderLocalLibraries: [],
    //   // jsHeaderCDNLibraries: [],
    //   // jsFooterLocalLibraries: [],
    //   // jsFooterCDNLibraries: [],
    //   // cssFooterCDNLibraries: [],
    //   // cssFooterLocalLibraries: [],
    //   // cssHeaderCDNLibraries: [],
    //   // cssHeaderLocalLibraries: [],
    //   cssLibs: [],
    //   jsHeaderLibs: [],
    //   jsFooterLibs: [],
    //   pages: {
    //     index: {
    //       // html: new Blob([``], { type: "text/html" }),
    //       // css: new Blob([``], { type: "text/css" }),
    //       // js: new Blob([``], { type: "text/javascript" }),
    //       cmds: {},
    //       id: "index",
    //       name: "index",
    //       symbols: [],
    //       components: {},
    //       helmet: {},
    //       bodyAttributes: {},
    //     },
    //     playground: {
    //       // html: new Blob([``], { type: "text/html" }),
    //       // css: new Blob([``], { type: "text/css" }),
    //       // js: new Blob([``], { type: "text/javascript" }),
    //       id: "playground",
    //       symbols: [],
    //       cmds: {},
    //       name: "playground",
    //       components: {},
    //       helmet: {},
    //       bodyAttributes: {},
    //     },
    //   },
    //   // globalCss: new Blob([``], { type: "text/css" }),
    //   // globalJs: new Blob([``], { type: "text/javascript" }),
    //   symbols: {},
    //   assets: [],
    //   dynamicTemplates: {},
    //   restAPIModels: [],
    //   symbolBlocks: [],
    //   globalRules: {},
    //   fonts: {},
    //   imgSrc: "",
    //   motions: {},
    // });

    // const mainRoot = await opfs.root;
    // const projectsRoot = await opfs.getFolder(mainRoot, "projects");
    // const projectDir = await opfs.createFolder(projectsRoot, `project-${id}`);

    // await opfs.createFolders(projectDir, [
    //   "pages",
    //   "css",
    //   "js",
    //   "assets",
    //   "fonts",
    //   "libs",
    //   "editor",
    //   "global",

    //   "libs/js",
    //   "libs/css",
    //   "libs/js/header",
    //   "libs/js/footer",
    // ]);

    // //Creating pages after updating opfs.ts
    // await opfs.createFiles(projectDir, [
    //   {
    //     path: `screenshot.webp`,
    //     content: new File([], "screenshot.webp", { type: "image/webp" }),
    //   },
    //   {
    //     path: "global/global.js",
    //     content: new File([""], "global.js", {
    //       type: "application/javascript",
    //     }),
    //   },

    //   {
    //     path: "global/global.css",
    //     content: new File([""], "global.css", {
    //       type: "text/css",
    //     }),
    //   },
    //   {
    //     path: "editor/pages/index.html",
    //     content: new File([""], "index.html", { type: "text/html" }),
    //   },
    //   {
    //     path: "editor/pages/playground.html",
    //     content: new File([""], "playground.html", { type: "text/html" }),
    //   },
    //   {
    //     path: "js/index.js",
    //     content: new File([""], "index.js", { type: "application/javascript" }),
    //   },
    //   {
    //     path: "js/playground.js",
    //     content: new File([""], "playground.js", {
    //       type: "application/javascript",
    //     }),
    //   },
    //   {
    //     path: "css/index.css",
    //     content: new File([""], "index.css", { type: "text/css" }),
    //   },
    //   {
    //     path: "css/playground.css",
    //     content: new File([""], "playground.css", { type: "text/css" }),
    //   },
    // ]);
    // toast.done(tId);
    infinitelyWorker.postMessage({
      command: "createProject",
      props: {
        data,
      },
    });
    // setIsProjectInited(true);
  };

  return (
    <>
      {showCrtModal && (
        <section
          onClick={(ev) => {
            setShowCrtModal(false);
          }}
          className="fixed inset-0 bg-slate-950 bg-opacity-80 flex items-center justify-center z-50"
          id="createProjectModal"
        >
          <section
            onClick={(ev) => {
              ev.stopPropagation();
              ev.preventDefault();
            }}
            className="bg-slate-900 text-slate-200 rounded-lg shadow-lg max-w-lg w-full p-6"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-semibold">Create New Project</h2>
              <button
                onClick={(ev) => {
                  ev.stopPropagation();
                  ev.preventDefault();
                  onCloseClick();
                  setShowCrtModal(false);
                }}
                className="text-slate-200 hover:text-blue-500 transition duration-150"
                id="closeModalButton"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              <form id="createProjectForm">
                <div className="mb-4">
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium mb-1"
                  >
                    Project Name
                  </label>
                  <input
                    onInput={(ev) => {
                      onInput(ev.target.value);
                      setData({ ...data, name: ev.target.value });
                    }}
                    autoFocus
                    type="text"
                    id="projectName"
                    name="projectName"
                    placeholder="Enter project name"
                    className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="projectDescription"
                    className="block text-sm font-medium mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    onInput={(ev) => {
                      onInputTextarea(ev.target.value);
                      setData({ ...data, description: ev.target.value });
                    }}
                    id="projectDescription"
                    name="projectDescription"
                    placeholder="Enter project description"
                    rows="3"
                    className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-600"
                  ></textarea>
                </div>
                <div className="mt-6">
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      ev.preventDefault();
                      onButtonClick(ev);
                      addProject();
                      setShowCrtModal(false);
                      setData({ name: "", description: "" });
                    }}
                    type="submit"
                    className="w-full bg-blue-600 text-slate-200 hover:bg-slate-600 py-2 rounded-md transition duration-150"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </section>
        </section>
      )}
    </>
  );
};
