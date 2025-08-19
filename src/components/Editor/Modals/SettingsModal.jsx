import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SwitchButton } from "../../Protos/SwitchButton";
import { MiniTitle } from "../Protos/MiniTitle";
import { useProjectSettings } from "../../../hooks/useProjectSettings";
import { Input } from "../Protos/Input";
import {
  advancedSearchSuggestions,
  getProjectData,
  getProjectSettings,
  isProjectSettingPropTrue,
} from "../../../helpers/functions";
import { Hr } from "../../Protos/Hr";
import { Button } from "../../Protos/Button";
import { cleanInteractions, cleanMotions } from "../../../helpers/bridge";
import { db } from "../../../helpers/db";
import { current_project_id } from "../../../constants/shared";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { classesFinderWorker } from "../../../helpers/defineWorkers";

export const SettingsModal = () => {
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);
  const [projectSettings, setProjectSetting] = useProjectSettings();
  const timeout = useRef();
  const [searchValue, setSearchValue] = useState("");
  const [currentChange, setCurrentChange] = useState("");
  const [searchedSettings, setSearchedSettings] = useState();
  // getProjectSettings().projectSettings
  // const [settings, setSettings] = useState(
  //   getProjectSettings().projectSettings
  // );

  const isCurrentChange = useCallback(
    /**
     *
     * @param {keyof import('../../../helpers/types').ProjectSetting} key
     * @param {(key:keyof import('../../../helpers/types').ProjectSetting)=>void} callback
     */

    (key, callback = () => {}) => {
      if (key == currentChange) {
        callback(key);
      }
    },
    [currentChange]
  );

  const callback = useCallback(
    (ev) => {
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
                  "style"
                ) || []),
              ].map((styleEl) => styleEl.innerHTML),
            },
          });
          editor.load();
        };

        isCurrentChange("enable_tailwind", () => {
          isProjectSettingPropTrue(
            "enable_tailwind",
            enableTailwind,
            enableTailwind
          );
        });

        isCurrentChange("enable_spline_viewer", () => {
          console.log("lalalalalalaala");

          editor.load();
        });

        isCurrentChange("enable_auto_save", () => {
          isProjectSettingPropTrue(
            "enable_auto_save",
            () => {
              editor.StorageManager.setAutosave(true);
            },
            () => {
              editor.StorageManager.setAutosave(false);
            }
          );
        });
      }, 100);
    },
    [currentChange]
  );

  useEffect(() => {
    if (!editor) return;

    window.addEventListener("local-storage", callback);
    return () => {
      window.removeEventListener("local-storage", callback);
    };
  }, [editor, currentChange]);

  // useEffect(() => {
  //   // if (!editor) return;
  //   setSettings(projectSettings);

  //   // isProjectSettingPropTrue('disable_petite_vue',(projectSettings)=>{

  //   // })
  // }, [projectSettings]);

  const search = (value = "") => {
    if (!value) {
      setSearchedSettings();
      return;
    }
    const filterdKeys = advancedSearchSuggestions(
      Object.keys(projectSettings),
      value
    );
    const newObject = Object.fromEntries(
      filterdKeys.map((key) => [key, projectSettings[key]])
    );
    // const clone = structuredClone(settings);
    // filterdKeys.forEach((key) => {
    //   newObject[key] = settings[key];
    // });
    console.log(newObject);

    setSearchedSettings(newObject);
  };

  return (
    <section className="h-full w-full overflow-auto flex flex-col gap-2 pr-1">
      <section className="flex flex-col gap-4 text-slate-200 font-semibold">
        {/* <h1 className="py-2 px-[30px] border-b-2 border-b-slate-600 w-fit">
          Global Settings
        </h1> */}
        {/* <MiniTitle>Global Settings</MiniTitle> */}
        <Input
          className="w-full bg-slate-800"
          placeholder="Search..."
          value={searchValue}
          onInput={(ev) => {
            setSearchValue(ev.target.value);
            search(ev.target.value);
          }}
        />
        <section className="grid grid-cols-3 gap-2">
          {Object.entries(
            searchedSettings ? searchedSettings : projectSettings
          ).map(([key, value], i) => (
            <article
              key={i}
              title={key}
              className="flex justify-between  gap-2 items-center px-2 py-3 rounded-lg bg-slate-800"
            >
              <h1 className="custom-font-size overflow-hidden text-ellipsis  flex-shrink capitalize">
                {key.replaceAll("_", " ")}
              </h1>
              <SwitchButton
                defaultValue={
                  searchedSettings?.[key]
                    ? searchedSettings?.[key]
                    : projectSettings[key]
                }
                onActive={(ev) => {
                  setCurrentChange(key);
                  setTimeout(() => {
                    setProjectSetting({ [key]: true });
                  });
                }}
                onUnActive={(ev) => {
                  setCurrentChange(key);
                  setTimeout(() => {
                    setProjectSetting({ [key]: false });
                  });
                }}
              />
            </article>
          ))}
        </section>
      </section>
      <hr className="border-slate-600" />
      <section className="flex gap-2">
        <Button
          onClick={async () => {
            const tId = toast.loading(
              <ToastMsgInfo msg={`Process cleaning...`} />
            );
            try {
              const projectData = await getProjectData();
              const cleanedMotions = await cleanMotions(
                projectData.motions,
                projectData.pages
              );

              console.log("cleaned motions: ", cleanedMotions);

              await db.projects.update(projectId, {
                motions: cleanedMotions,
              });
              toast.done(tId);
              toast.success(
                <ToastMsgInfo msg={`Motions cleared successfully`} />
              );
            } catch (error) {
              toast.dismiss(tId);
              toast.success(<ToastMsgInfo msg={`Faild to clean motions`} />);
            }
          }}
        >
          Clean unused motions
        </Button>
        <Button
          onClick={async () => {
            const tId = toast.loading(
              <ToastMsgInfo msg={`Process cleaning...`} />
            );
            try {
              const projectData = await getProjectData();
              const cleanedInteractions = await cleanInteractions(
                projectData.interactions,
                projectData.pages
              );
              console.log("cleand interactions : ", cleanedInteractions);

              await db.projects.update(projectId, {
                interactions: cleanedInteractions,
              });
              toast.done(tId);
              toast.success(
                <ToastMsgInfo msg={`Interactions cleared successfully`} />
              );
            } catch (error) {
              toast.dismiss(tId);
              toast.success(
                <ToastMsgInfo msg={`Faild to clean interactions`} />
              );
            }

            // console.log(projectData.interactions ,await cleanInteractions(projectData.interactions , projectData.pages));
          }}
        >
          Clean unused interactions
        </Button>
      </section>
    </section>
  );
};
