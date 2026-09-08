import {
  wp_update_meta,
  wp_update_option,
} from "@/Apps/wordpress/functions.jsx";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { reloadRequiredInstance } from "@/constants/InfinitelyInstances";
import { current_project_id } from "@/constants/shared";
import { cleanInteractions, cleanMotions } from "@/helpers/bridge";
import { addClickClass } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import {
  classesFinderWorker,
  fetcherWorker,
  pageBuilderWorker,
} from "@/helpers/defineWorkers";
import {
  advancedSearchSuggestions,
  doInNormalAsync,
  doInWordpressAsync,
  emitChange,
  getProjectData,
  getProjectId,
  getProjectSettings,
  getWpPageConfig,
  isProjectSettingPropTrue,
  wpWorkerCallbackMaker,
} from "@/helpers/functions";
import { useProjectSettings } from "@/hooks/useProjectSettings";
import { takeScreenShot } from "@/plugins/updateProjectThumbnail.jsx";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { Hr } from "@/components/Protos/Hr";
import { SwitchButton } from "@/components/Protos/SwitchButton";
import { Input } from "@/components/Editor/Protos/Input";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { For } from "million/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { Wordpress } from "@/components/Protos/wordpress/Wordpress";
import { useUpdateWpScriptsMutation } from "@/queries/wp.queries";
import { useBusyCallback } from "@/hooks/useBusyCallback";
import { wp_save_editor_scripts } from "@/Apps/wordpress/functions_ui";

export const SettingsModal = () => {
  const editor = useEditorMaybe();
  const projectId = getProjectId();
  const [projectSettings, setProjectSetting] = useProjectSettings();
  const timeout = useRef();
  const [searchValue, setSearchValue] = useState("");
  const [currentChange, setCurrentChange] = useState("");
  const [searchedSettings, setSearchedSettings] = useState();
  const { mutateAsync: updateWpScripts, isPending: isUpdateWpScriptsPending } =
    useUpdateWpScriptsMutation();
  /**
   *
   * @param {keyof import('@/helpers/types').ProjectSetting} key
   * @param {(key:keyof import('@/helpers/types').ProjectSetting)=>void} callback
   */
  const isCurrentChange = (key, callback = () => {}, currentChange) => {
    if (key == currentChange) {
      callback(key);
    }
  };

  const callback = (currentChange) => {
    // console.log("dadsad");

    //  timeout.current && timeout.current.close()
    timeout.current && clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      console.log("storaaaaaaaaaage", currentChange);
      // return
      const enableTailwind = () => {
        classesFinderWorker.postMessage({
          command: "getAllStyleSheetClasses",
          props: {
            projectId,
            editorCss: editor.getCss({
              clearStyles: false,
              keepUnusedStyles: true,
            }),
            projectSettings: projectSettings,
            inlineStylesInners: [
              ...(editor?.Canvas?.getDocument?.()?.querySelectorAll?.(
                "style",
              ) || []),
            ].map((styleEl) => styleEl.innerHTML),
          },
        });
        // editor.load();
        emitChange();
      };

      isCurrentChange(
        "enable_tailwind",
        () => {
          isProjectSettingPropTrue(
            "enable_tailwind",
            enableTailwind,
            enableTailwind,
          );
        },
        currentChange,
      );

      isCurrentChange(
        "enable_spline_viewer",
        () => {
          // console.log("lalalalalalaala");

          // editor.load();
          emitChange();
        },
        currentChange,
      );

      isCurrentChange(
        "stop_all_animation_on_page",
        (key) => {
          isProjectSettingPropTrue(
            "stop_all_animation_on_page",
            () => {
              editor.getWrapper().addClass(`inf-stop-all-animations`);
            },
            () => {
              editor.getWrapper().removeClass(`inf-stop-all-animations`);
            },
          );
        },
        currentChange,
      );

      isCurrentChange(
        "enable_auto_save",
        () => {
          isProjectSettingPropTrue(
            "enable_auto_save",
            () => {
              editor.StorageManager.setAutosave(true);
            },
            () => {
              editor.StorageManager.setAutosave(false);
            },
          );
        },
        currentChange,
      );

      isCurrentChange(
        "enable_swiperjs",
        () => {
          // editor.load();
          emitChange();
        },
        currentChange,
      );

      isCurrentChange(
        "disable_will_change_in_editor",
        () => {
          // editor.load();
          emitChange();
        },
        currentChange,
      );
      isCurrentChange(
        "optimize_outlines",
        () => {
          emitChange();
        },
        currentChange,
      );

      isCurrentChange("disable_gsap_core", emitChange, currentChange);
      isCurrentChange("disable_gsap_scrollTrigger", emitChange, currentChange);
      isCurrentChange("disable_gsap_splitText", emitChange, currentChange);
    }, 100);
  };

  const [saveEditorScripts, { isLoading: isSaveEditorScriptsPending }] =
    useBusyCallback(async (key, value) => {
      await doInWordpressAsync(async () => {
        await wp_save_editor_scripts();
      });

      const handler = async (ev) => {
        callback(key);
        console.log("local-storage is emited");
        const { projectSettings } = getProjectSettings();
        await db.projects.update(projectId, {
          projectSetting: projectSettings,
        });
        window.removeEventListener("local-storage", handler);
      };
      window.addEventListener("local-storage", handler);

      setCurrentChange(key);
      setProjectSetting({ [key]: value });
      // setTimeout(() => {
      // });
    });

  const search = (value = "") => {
    if (!value) {
      setSearchedSettings();
      return;
    }
    const filterdKeys = advancedSearchSuggestions(
      Object.keys(projectSettings),
      value,
    );
    const newObject = Object.fromEntries(
      filterdKeys.map((key) => [key, projectSettings[key]]),
    );

    console.log(newObject);

    setSearchedSettings(newObject);
  };

  return (
    <section className="h-full w-full overflow-auto flex flex-col gap-2 pr-1">
      <section className="flex flex-col gap-4 text-text-primary font-semibold w-full h-full">
        <Input
          className="w-full bg-surface-tertiary"
          placeholder="Search..."
          value={searchValue}
          onInput={(ev) => {
            setSearchValue(ev.target.value);
            search(ev.target.value);
          }}
        />

        <section className="grid grid-cols-3 gap-2">
          <For
            each={Object.entries(
              searchedSettings ? searchedSettings : projectSettings,
            )}
          >
            {([key, value], i) => (
              <article
                key={key}
                title={key}
                className="flex justify-between  gap-2 items-center px-2 py-3 rounded-lg bg-surface-tertiary"
              >
                <h1 className="custom-font-size overflow-hidden text-ellipsis  flex-shrink capitalize">
                  {key.replaceAll("_", " ")}
                </h1>
                <SwitchButton
                  disabled={isSaveEditorScriptsPending}
                  defaultValue={
                    searchedSettings?.[key]
                      ? searchedSettings?.[key]
                      : projectSettings[key]
                  }
                  onActive={async (ev) => {
                    await saveEditorScripts(key, true);
                    // setCurrentChange(key);
                    // setTimeout(() => {
                    //   setProjectSetting({ [key]: true });
                    // });
                  }}
                  onUnActive={async (ev) => {
                    await saveEditorScripts(key, false);
                    // setCurrentChange(key);
                    // setTimeout(() => {
                    //   setProjectSetting({ [key]: false });
                    // });
                  }}
                />
              </article>
            )}
          </For>
        </section>
      </section>

      <hr className="border-border-default" />

      <footer className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
        <Button
          style={{
            justifyContent: "center",
          }}
          onClick={async (ev) => {
            // addClickClass(ev.currentTarget , 'click')
            const tId = toast.loading(
              <ToastMsgInfo msg={`Process cleaning...`} />,
            );
            try {
              await doInNormalAsync(async () => {
                const projectData = await getProjectData();
                const cleanedMotions = await cleanMotions(
                  projectData.motions,
                  projectData.pages,
                );

                console.log("cleaned motions: ", cleanedMotions);

                await db.projects.update(projectId, {
                  motions: cleanedMotions,
                });

                toast.done(tId);
                toast.success(
                  <ToastMsgInfo msg={`Motions cleared successfully`} />,
                );
              });

              await doInWordpressAsync(async () => {
                // const projectData = await getProjectData();
                const wp_post = getWpPageConfig();
                editor.trigger(InfinitelyEvents.storage.storeStart);
                wpWorkerCallbackMaker(
                  fetcherWorker,
                  "wp_clean_motions",
                  {
                    projectId,
                  },
                  async (res) => {
                    console.log("res : ", res);
                    if (res.done) {
                      await db.projects.update(projectId, {
                        motions: res.res,
                      });
                      const projectData = await getProjectData();
                      projectData.current_inf_meta = {};
                      projectData.currentEditingPage = {};
                      delete projectData.wp_meta.password;
                      delete projectData.wp_meta.app_password;
                      await wp_update_option({
                        optionName: "inf_config",
                        value: projectData,
                        merge: true,
                        projectId,
                      });
                      toast.done(tId);
                      toast.success(
                        <ToastMsgInfo msg={`Motions cleared successfully`} />,
                      );
                      editor.trigger(InfinitelyEvents.storage.storeEnd);
                    } else {
                      throw new Error(`Faild to clear motions`);
                    }
                  },
                );
              });
            } catch (error) {
              toast.dismiss(tId);
              toast.success(<ToastMsgInfo msg={error.message} />);
            }
          }}
        >
          Clean unused motions
        </Button>

        <Button
          style={{
            justifyContent: "center",
          }}
          onClick={async (ev) => {
            // addClickClass(ev.currentTarget , 'click')
            const tId = toast.loading(
              <ToastMsgInfo msg={`Process cleaning...`} />,
            );
            try {
              await doInNormalAsync(async () => {
                const projectData = await getProjectData();
                const cleanedInteractions = await cleanInteractions(
                  projectData.interactions,
                  projectData.pages,
                );
                console.log("cleand interactions : ", cleanedInteractions);

                await db.projects.update(projectId, {
                  interactions: cleanedInteractions,
                });
                toast.done(tId);
                toast.success(
                  <ToastMsgInfo msg={`Interactions cleared successfully`} />,
                );
              });

              await doInWordpressAsync(async () => {
                const wp_post = getWpPageConfig();
                editor.trigger(InfinitelyEvents.storage.storeStart);
                wpWorkerCallbackMaker(
                  pageBuilderWorker,
                  "wp_clean_interactions",
                  { projectId },
                  async (props) => {
                    if (props.done) {
                      console.log("interactions props : ", props);
                      await db.projects.update(projectId, {
                        interactions: props.res,
                      });
                      const projectData = await getProjectData();
                      projectData.current_inf_meta = {};
                      projectData.currentEditingPage = {};
                      delete projectData.wp_meta.password;
                      delete projectData.wp_meta.app_password;
                      await wp_update_option({
                        optionName: "inf_config",
                        value: projectData,
                        merge: true,
                        projectId,
                      });
                      toast.done(tId);
                      toast.success(
                        <ToastMsgInfo
                          msg={`Interactions cleared successfully`}
                        />,
                      );
                      editor.trigger(InfinitelyEvents.storage.storeEnd);
                    } else {
                      throw new Error(`Faild to clean interactions`);
                    }
                  },
                );
              });
            } catch (error) {
              toast.dismiss(tId);
              toast.success(<ToastMsgInfo msg={error.message} />);
            }

            // console.log(projectData.interactions ,await cleanInteractions(projectData.interactions , projectData.pages));
          }}
        >
          Clean unused interactions
        </Button>

        <Button
          style={{
            justifyContent: "center",
          }}
          onClick={(ev) => {
            // addClickClass(ev.currentTarget, "click");
            takeScreenShot(editor, false);
          }}
        >
          {Icons.image({ fill: "white" })}
          <h1>Take Screenshot</h1>
        </Button>

        <Wordpress>
          <Button
            disabled={isUpdateWpScriptsPending}
            style={{
              justifyContent: "center",
            }}
            onClick={async (ev) => {
              // addClickClass(ev.currentTarget, "click");
              const tid = toast.loading(
                <ToastMsgInfo msg="Updating wordpress scripts..." />,
              );
              try {
                await updateWpScripts({
                  data: {
                    id: getProjectId(),
                    update_project_config: true,
                    projectSetting: projectSettings,
                    projectData: await getProjectData(),
                  },
                });
                toast.done(tid);
                toast.success(
                  <ToastMsgInfo msg="Wordpress scripts updated successfully" />,
                );
              } catch (error) {
                toast.dismiss(tid);
                toast.error(<ToastMsgInfo msg={error.message} />);
                console.error(error.message);
              } finally {
                toast.done(tid);
              }
            }}
          >
            <h1>Update Wordpress Scripts</h1>
          </Button>
        </Wordpress>
      </footer>
    </section>
  );
};
