import React, { useEffect, useRef } from "react";
import { Icons } from "../Icons/Icons";
import { Li } from "../Protos/Li";
import { useEditorMaybe } from "@grapesjs/react";
import { useNavigate } from "react-router-dom";
import {
  open_custom_font_installer_modal,
  open_dynamic_templates_modal,
  open_files_manager_modal,
  open_library_installer_modal,
  open_pages_manager_modal,
  open_rest_models_modal,
  open_settings_modal,
  open_symbols_and_templates_manager_modal,
} from "../../constants/InfinitelyCommands";

import { dropBoxFilesMeta, refType } from "../../helpers/jsDocs";
import { useLiveQuery } from "dexie-react-hooks";
import {
  getProject,
  getProjectData,
  loadProject,
  workerCallbackMaker,
} from "../../helpers/functions";
import { OptionsButton } from "../Protos/OptionsButton";
import { Button } from "../Protos/Button";
import { addClickClass } from "../../helpers/cocktail";
import {
  getDropboxFileBlob,
  getDropboxFileMeta,
  pullProject,
  shareLink,
  uploadDbxFileWithToastProgress,
  uploadDropboxFile,
} from "../../helpers/dropboxHandlers";
import { db } from "../../helpers/db";
import { current_project_id } from "../../constants/shared";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
import { globalInstance } from "../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../constants/infinitelyEvents";
import { opfs } from "../../helpers/initOpfs";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";
import { FitTitle } from "./Protos/FitTitle";

export const HomeNav = () => {
  const editor = useEditorMaybe();
  const navigate = useNavigate();
  const pushRef = useRef(refType);
  const pullRef = useRef(refType);
  const projectData = useLiveQuery(async () => {
    return await getProjectData();
  });
  useEffect(() => {
    const callback = async ({ detail }) => {
      console.log("req :", detail);

      if (detail.req) {
        await db.projects.update(+projectData.id, {
          dbx_pull_requried: true,
        });
      }
    };

    globalInstance.on(InfinitelyEvents.global.pull_require, callback);

    return () => {
      globalInstance.off(InfinitelyEvents.global.pull_require, callback);
    };
  }, [projectData]);

  // useEffect(() => {
  //   (async () => {
  //     const currentPagetId = localStorage.getItem(current_page_id);
  //     const page = await (await getProjectData()).pages[`${currentPagetId}`];
  //     const pageFile = await(await opfs.getFile(defineRoot(page.pathes.html))).getOriginFile();
  //     const content =  html_beautify(
  //         await (
  //           await Promise.all(
  //             chunkHtmlElements(await pageFile.text()).map(async (el) => {
  //               if (!el.includes(inf_symbol_Id_attribute)) return el;
  //               for (const symbolId of page.symbols) {
  //                 const symbolHandle = await opfs.getFile(
  //                   defineRoot(`editor/symbols/${symbolId}/${symbolId}.html`)
  //                 );
  //                 if (!symbolHandle.exists()) continue;
  //                 const symbolContent = await symbolHandle.text();
  //                 el = symbolContent;
  //               }
  //               return el;
  //             })
  //           )
  //         ).join("\n")
  //       );

  //     console.log(
  //       'page : html',
  //       defineRoot(page.pathes.html),
  //       pageFile,
  //       content,

  //     );

  //     testRef.current.setAttribute('srcdoc' ,  doDocument(content)) ;
  //   })();
  // });

  return (
    <nav className="h-full  w-[55px]  p-2 flex flex-col justify-between items-center bg-slate-900 ">
      {/* <iframe ref={testRef} className="z-[15000] bg-white fixed top-0 left-0 w-full h-full border-2 border-slate-600" ></iframe> */}
      <div className="flex flex-col items-center gap-5">
        <figure className="pb-[20px] pt-1 border-b-[1px] border-slate-400 ">
          {Icons.logo({})}
        </figure>
        <ul className="flex flex-col gap-5 items-center">
          {/* <Li>{Icons.plus()}</Li> */}
          <Li
            title="Pages"
            icon={Icons.stNote}
            onClick={(ev) => {
              // console.log(minify(``));

              // return;
              editor.runCommand(open_pages_manager_modal);
            }}
          />
          {/* <Li
            title="Dynamic Templates"
            onClick={() => {
              editor.runCommand(open_dynamic_templates_modal);
            }}
          >
            {Icons.dynamicTemp({})}
          </Li> */}
          <Li
            title="Sympols & Templates"
            icon={Icons.components}
            onClick={() => {
              editor.runCommand(open_symbols_and_templates_manager_modal);
            }}
          />
          <Li
            title="Rest API Models"
            icon={Icons.db}
            onClick={() => {
              editor.runCommand(open_rest_models_modal);
            }}
          />
          <Li
            title="Library Installer"
            onClick={() => {
              editor.runCommand(open_library_installer_modal);
            }}
          >
            {Icons.installLibrary({ width: 25, height: 25 })}
          </Li>

          <Li
            title="Fonts Installer"
            onClick={() => {
              editor.runCommand(open_custom_font_installer_modal);
            }}
          >
            {Icons.fonts({ width: 22.5, height: 22.5 })}
          </Li>

          <Li
            title="Files Manager"
            icon={Icons.gallery}
            onClick={() => {
              editor.runCommand(open_files_manager_modal);
            }}
          />

          {Boolean(projectData?.apps) && (
            <li className="group relative li-btn h-[30px] w-[30px]     rounded-lg cursor-pointer grid place-items-center transition-all hover:bg-blue-600   [&_#dbx-svg]:hover:fill-white [&_#dbx-svg_g]:hover:fill-white ">
              {Boolean(
                projectData.apps == "Dropbox" && projectData.dropboxFileMeta
              ) && (
                <OptionsButton icon={Icons.dropbox({})}>
                  <menu className="flex flex-col gap-2 w-[100px]">
                    <Button
                      refForward={pushRef}
                      disabled={projectData.dbx_pull_requried}
                      onClick={async (ev) => {
                        // let tId = toast.loading(
                        //   <ToastMsgInfo msg={`Pushing project...`} />
                        // );
                        try {
                          addClickClass(ev.currentTarget, "click");
                          const dataMeta = await uploadDbxFileWithToastProgress(
                            projectData.dropboxFileMeta.path_lower,
                            await getProject(),
                            projectData.dropboxFileMeta.rev
                          );
                          if (!dataMeta) {
                            throw new Error(`No data meta founded`);
                          }
                          console.log("data meta : ", dataMeta);
                          await db.projects.update(
                            +localStorage.getItem(current_project_id),
                            {
                              dropboxFileMeta: dataMeta,
                            }
                          );
                          // toast.done(tId);
                        } catch (error) {
                          // if(error.message.includes("conflict")){
                          //   console.error('hahahahahahahahahah');

                          // }
                          // toast.dismiss(tId);
                          throw new Error(error);
                        }
                      }}
                    >
                      {Icons.upload({ strokeColor: "white" })}
                      <h1>Push</h1>
                    </Button>
                    <Button
                      refForward={pullRef}
                      // disabled={!projectData.dbx_pull_requried}
                      onClick={async (ev) => {
                        console.log("refff : ", pushRef.current);
                        const btn = ev.currentTarget;
                        addClickClass(btn, "click");

                        // pushRef.current.disabled = true;
                        try {
                          await pullProject(projectData);
                          btn.disabled = true;
                        } catch (error) {
                          throw new Error(error);
                        } finally {
                          btn.disabled = null;
                          // pushRef.current.disabled = null;
                        }
                      }}
                      style={{
                        backgroundColor: projectData.dbx_pull_requried
                          ? "crimson"
                          : null,
                      }}
                    >
                      {Icons.export("white")}
                      <h1>Pull</h1>
                    </Button>
                    {/* <Button
                      onClick={async (ev) => {
                        addClickClass(ev.currentTarget, "click");
                        await shareLink(projectData);
                      }}
                    >
                      {Icons.share({ strokeColor: "white" })}
                      <span>Share</span>
                    </Button> */}
                  </menu>
                </OptionsButton>
              )}
            </li>
          )}
          {/* <Li title="Github" icon={Icons.git} /> */}
        </ul>
      </div>

      <div>
        <ul className="flex flex-col gap-5 items-center">
          {/* <Li>{Icons.headphone()}</Li> */}
          <Li
            title="Settings"
            icon={Icons.setting}
            onClick={() => {
              editor.runCommand(open_settings_modal);
            }}
          />
          <Li
            title="Out to projects"
            icon={Icons.logOut}
            to=""
            onClick={() => {
              // editor.trigger("leave:project");
              // console.log("navigated");
              editor.leaving = true;
              if (editor.getDirtyCount()) {
                const cnfrm = confirm(
                  `There is changes not saved , are you sure to leave ?`
                );
                if (cnfrm) {
                  navigate("workspace");
                }
              } else {
                navigate("workspace");
              }
            }}
          />
        </ul>
      </div>
    </nav>
  );
};
