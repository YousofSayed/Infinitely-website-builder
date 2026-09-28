import { config } from "@/config/brand";
import {
  open_custom_font_installer_modal,
  open_dynamic_templates_modal,
  open_files_manager_modal,
  open_library_installer_modal,
  open_pages_manager_modal,
  open_rest_models_modal,
  open_settings_modal,
  open_symbols_and_templates_manager_modal,
} from "@/constants/InfinitelyCommands";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { globalInstance } from "@/constants/InfinitelyInstances";
import { current_project_id } from "@/constants/shared";
import { addClickClass } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import {
  checkDropBoxSignInState,
  getDropboxFileBlob,
  getDropboxFileMeta,
  pullProject,
  shareLink,
  uploadDbxFileWithToastProgress,
  uploadDropboxFile,
} from "@/helpers/dropboxHandlers";
import {
  getAppType,
  getLogoAppNavLink,
  getProject,
  getProjectData,
  isWordpress,
  loadProject,
  workerCallbackMaker,
} from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { opfs } from "@/helpers/initOpfs";
import { dropBoxFilesMeta, refType } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { Li } from "@/components/Protos/Li";
import { OptionsButton } from "@/components/Protos/OptionsButton";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { minify } from "csso";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShowIf } from "../ShowIf";
import { Wordpress } from "../Protos/wordpress/Wordpress";
import { useRecoilState } from "recoil";
import {
  consoleLogsNotification,
  isAnimationsChangedState,
  showComponentsInLeftPanelState,
  viewsKeyState,
} from "@/helpers/atoms";
import { animationsSavingMsg } from "@/constants/confirms";
import { useBusyCallback } from "@/hooks/useBusyCallback";

export const HomeNav = () => {
  const editor = useEditorMaybe();
  const navigate = useNavigate();
  const pushRef = useRef(refType);
  const pullRef = useRef(refType);
  const projectData = useLiveQuery(async () => {
    return await getProjectData();
  });
  const [showsComponents, setShowsComponents] = useRecoilState(
    showComponentsInLeftPanelState,
  );
  const [logsNotification, setLogsNotification] = useRecoilState(
    consoleLogsNotification,
  );
  const [viewsKey, setViewKey] = useRecoilState(viewsKeyState);

  const [isAnimationsChanged, setAnimationsChanged] = useRecoilState(
    isAnimationsChangedState,
  );

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

  const [handleDBXInit, { isLoading: isDBXInitLoading }] = useBusyCallback(
    async () => {
      const tid = toast.loading(
        <ToastMsgInfo msg={`Initializing dropbox project...`} />,
      );
      const dataMeta = await uploadDbxFileWithToastProgress(
        `/${projectData.name}.zip`,
        await getProject(),
        "",
      );
      if (!dataMeta) {
        throw new Error(`No data meta founded`);
      }
      console.log("data meta : ", dataMeta);
      await db.projects.update(+localStorage.getItem(current_project_id), {
        dbx_pull_requried: false,
        dropboxFileMeta: dataMeta,
      });
      toast.dismiss(tid);
      toast.success(<ToastMsgInfo msg={`Dropbox project initialized! 🎉`} />);
    },
  );

  const [pushToDBX, { isLoading: isDBXPushLoading }] = useBusyCallback(
    async () => {
      const tid = toast.loading(
        <ToastMsgInfo msg={`Pushing dropbox project...`} />,
      );
      const dataMeta = await uploadDbxFileWithToastProgress(
        projectData.dropboxFileMeta.path_lower,
        await getProject(),
        projectData.dropboxFileMeta.rev,
      );
      if (!dataMeta) {
        throw new Error(`No data meta founded`);
      }
      console.log("data meta : ", dataMeta);
      await db.projects.update(+localStorage.getItem(current_project_id), {
        dbx_pull_requried: false,
        dropboxFileMeta: dataMeta,
      });
      toast.dismiss(tid);
      toast.success(<ToastMsgInfo msg={`Dropbox project pushed! 🎉`} />);
    },
  );

  const [pullFromDBX, { isLoading: isDBXPullLoading }] = useBusyCallback(async () => {
    const tid = toast.loading(
      <ToastMsgInfo msg={`Pulling dropbox project...`} />,
    );
    const cnfrm = confirm(
      `Are you sure you want to pull from dropbox? This will overwrite your local project files.`,
    );
    if (!cnfrm) return;
    console.log("refff : ", pushRef.current);
    const btn = ev.currentTarget;
    addClickClass(btn, "click");

    btn.disabled = true;
    pushRef.current.disabled = true;
    try {
      await pullProject(projectData);
      btn.disabled = true;
    } catch (error) {
      throw new Error(error);
    } finally {
      btn.disabled = null;
      // pushRef.current.disabled = null;
    }

    toast.dismiss(tid);
    toast.success(<ToastMsgInfo msg={`Dropbox project pulled! 🎉`} />);
  });

  const leave = () => {
    if (editor.getDirtyCount()) {
      const cnfrm = confirm(
        `Unsaved changes will be lost. Are you sure you want to leave?`,
      );
      cnfrm && navigate(getLogoAppNavLink(), { viewTransition: true });
      return;
    }

    if (editor.infStore) {
      alert(`Hang tight, saving your work! 😍`);
      return;
    }

    navigate(getLogoAppNavLink(), { viewTransition: true });
  };

  return (
    <nav className="disable-when-load h-full  w-[55px] [&_svg]:!w-[21px] [&_svg]:!aspect-square border-r border-r-slate-600  p-2 flex flex-col justify-between items-center bg-surface-secondary auto-animate animate-go-to ">
      {/* <iframe ref={testRef} className="z-[15000] bg-white fixed top-0 left-0 w-full h-full border-2 border-border-default" ></iframe> */}
      <div className="flex flex-col items-center gap-4">
        <figure className="pb-[10px] pt-1 border-b-[1px] border-slate-600 ">
          {/* {Icons.logo({})} */}
          <button onClick={leave} className="cursor-pointer" viewTransition>
            <img src={config.logo} alt="logo" />
          </button>
        </figure>

        <section className="flex flex-col gap-2">
          <ul className="flex flex-col gap-5 items-center p-1.5 bg-surface-tertiary rounded-lg">
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

            {/* {Boolean(checkDropBoxSignInState()) && (
              <li className="group relative li-btn h-[30px] w-[30px]     rounded-lg cursor-pointer grid place-items-center transition-all hover:bg-brand-primary   [&_#dbx-svg]:hover:fill-white [&_#dbx-svg_g]:hover:fill-white ">
                <OptionsButton icon={Icons.dropbox({})}>
                  <menu className="flex flex-col gap-2 min-w-[100px]">
                    {projectData?.dropboxFileMeta?.path_lower && (
                      <>
                        <Button
                          refForward={pushRef}
                          // disabled={projectData.dbx_pull_requried}
                          onClick={async (ev) => {
                            // let tId = toast.loading(
                            //   <ToastMsgInfo msg={`Pushing project...`} />
                            // );
                            pushRef.current.disabled = true;
                            pullRef.current.disabled = true;

                            try {
                              addClickClass(ev.currentTarget, "click");
                              const dataMeta =
                                await uploadDbxFileWithToastProgress(
                                  projectData.dropboxFileMeta.path_lower,
                                  await getProject(),
                                  projectData.dropboxFileMeta.rev,
                                );
                              if (!dataMeta) {
                                throw new Error(`No data meta founded`);
                              }
                              console.log("data meta : ", dataMeta);
                              await db.projects.update(
                                +localStorage.getItem(current_project_id),
                                {
                                  dbx_pull_requried: false,
                                  dropboxFileMeta: dataMeta,
                                },
                              );
                              // toast.done(tId);
                            } catch (error) {
                              // if(error.message.includes("conflict")){
                              //   console.error('hahahahahahahahahah');

                              // }
                              // toast.dismiss(tId);
                              throw new Error(error);
                            } finally {
                              pushRef.current.disabled = false;
                              pullRef.current.disabled = false;
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
                            const cnfrm = confirm(
                              `Are you sure you want to pull from dropbox? This will overwrite your local project files.`,
                            );
                            if (!cnfrm) return;
                            console.log("refff : ", pushRef.current);
                            const btn = ev.currentTarget;
                            addClickClass(btn, "click");

                            btn.disabled = true;
                            pushRef.current.disabled = true;
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
                      </>
                    )}
                  </menu>
                </OptionsButton>
              </li>
            )} */}

            {/* <Li title="Github" icon={Icons.git} /> */}
          </ul>

          <ul className="flex flex-col  gap-5 items-center p-1.5 bg-surface-tertiary rounded-lg empty:hidden">
            <Li
              className="shrink-0"
              icon={Icons.layers}
              title="layers"
              onClick={(ev) => {
                // setShowLayers((old) => !old);
                // setShowAnimBuilder(false);

                setShowsComponents((old) => ({
                  ...old,
                  layers: !old.layers,
                  animationsBuilder: false,
                  viewPanel: false,
                }));
              }}
            />

            <Li
              // linkClassName="flex items-center justify-center"
              className="shrink-0"
              title="Animation Builder"
              onClick={(ev) => {
                // console.log(showPreview, isAnimationsChanged);

                if (isAnimationsChanged && showsComponents.animationsBuilder) {
                  const cnfrm = confirm(animationsSavingMsg);
                  if (cnfrm) {
                    setAnimationsChanged(false);
                    setAnimations([]);
                    // setShowAnimBuilder(false);
                    setShowsComponents((old) => ({
                      ...old,
                      layers: false,
                      animationsBuilder: false,
                      viewPanel: false,
                    }));
                  }
                } else {
                  // setShowAnimBuilder(!showAnimBuilder);
                  // setShowLayers(false);
                  setShowsComponents((old) => ({
                    ...old,
                    layers: false,
                    animationsBuilder: !old.animationsBuilder,
                    viewPanel: false, // old?.viewPanel,
                  }));
                  navigate("edite/styling");
                }
                // setShowAnimBuilder((old) => !old);
              }}

              // icon={Icons.animation}
            >
              {Icons.animation()}
            </Li>

            <Wordpress>
              <Li
                title="Wordpress"
                // icon={}
                onClick={() => {
                  setShowsComponents((old) => ({
                    ...old,
                    animationsBuilder: false,
                    layers: false,
                    stylesBuilder: false,
                    viewPanel: !old?.viewPanel,
                    // showsComponents.views.viewKey === "wordpress"
                    //   ? !old?.viewPanel
                    //   : true,
                    views: {
                      ...old?.views,
                      viewKey: "wordpress",
                    },
                  }));
                }}
              >
                <Icons.wordpress />
              </Li>
            </Wordpress>

            <Li
              title="Infinitely AI"
              // icon={}
              onClick={() => {
                setShowsComponents((old) => ({
                  ...old,
                  animationsBuilder: false,
                  layers: false,
                  stylesBuilder: false,
                  viewPanel: !old?.viewPanel,
                  views: {
                    ...old?.views,
                    viewKey: "aiBuilder",
                  },
                }));
              }}
            >
              <i className="[&_path]:transition-all [&:hover_path]:fill-white  w-full h-full flex justify-center items-center">
                <Icons.ai />
              </i>
            </Li>

            <Li
              title="themes"
              // icon={}
              onClick={() => {
                setShowsComponents((old) => ({
                  ...old,
                  animationsBuilder: false,
                  layers: false,
                  stylesBuilder: false,
                  viewPanel:
                    showsComponents.views.viewKey === "themesBuilder"
                      ? !old?.viewPanel
                      : true,
                  views: {
                    ...old?.views,
                    viewKey: "themesBuilder",
                  },
                }));
              }}
            >
              <i className="[&_path]:transition-all [&:hover_path]:fill-white [&:hover_path]:stroke-white  w-full h-full flex justify-center items-center">
                <Icons.themes />
              </i>
            </Li>

            <Li
              title="console"
              notify={logsNotification}
              onClick={() => {
                setShowsComponents((old) => ({
                  ...old,
                  animationsBuilder: false,
                  layers: false,
                  stylesBuilder: false,
                  viewPanel:
                    showsComponents.views.viewKey === "console"
                      ? !old?.viewPanel
                      : true,
                  views: {
                    ...old?.views,
                    viewKey: "console",
                  },
                }));
              }}
            >
              <i className="[&_path]:transition-all [&:hover_path]:fill-white [&:hover_path]:stroke-white  w-full h-full flex justify-center items-center">
                <Icons.console />
              </i>
            </Li>

            {/* <Li title="Github" icon={Icons.git} /> */}
          </ul>
        </section>
      </div>

      <div>
        <ul className="flex flex-col gap-5 items-center p-1.5 py-2 bg-surface-tertiary rounded-lg ">
          {checkDropBoxSignInState() && (
            <OptionsButton
              icon={
                <i
                  className="
              w-full h-full flex justify-center items-center
              [&_path]:transition-all
              [&:hover_path]:fill-white
              "
                >
                  {Icons.dropbox({})}
                </i>
              }
            >
              <ShowIf condition={!projectData?.dropboxFileMeta?.path_lower}>
                <Button
                  disabled={isDBXInitLoading}
                  onClick={async (ev) => {
                    await handleDBXInit();
                  }}
                >
                  {Icons.initial({ strokeColor: "white" })} Init Project
                </Button>
              </ShowIf>

              <ShowIf condition={projectData?.dropboxFileMeta?.path_lower}>
                <menu className="flex flex-col gap-2 min-w-[100px]">
                  {projectData?.dropboxFileMeta?.path_lower && (
                    <>
                      <Button
                        refForward={pushRef}
                        disabled={isDBXPushLoading || isDBXPullLoading}
                        onClick={async (ev) => {
                          await pushToDBX();
                        }}
                      >
                        {Icons.upload({ strokeColor: "white" })}
                        <h1>Push</h1>
                      </Button>

                      <Button
                        refForward={pullRef}
                        // disabled={!projectData.dbx_pull_requried}
                        disabled={isDBXPullLoading || isDBXPushLoading}
                        onClick={async (ev) => {
                          await pullFromDBX();
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
                    </>
                  )}
                </menu>
              </ShowIf>
            </OptionsButton>
          )}

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
                  `There is changes not saved , are you sure to leave ?`,
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
