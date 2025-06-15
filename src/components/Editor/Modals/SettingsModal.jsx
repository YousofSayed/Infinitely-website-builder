import React, { useEffect, useState } from "react";
import { SwitchButton } from "../../Protos/SwitchButton";
import { MiniTitle } from "../Protos/MiniTitle";
import { useGlobalSettings } from "../../../hooks/useGlobalSettings";
import { useProjectSettings } from "../../../hooks/useProjectSettings";
import { Input } from "../Protos/Input";
import {
  advancedSearchSuggestions,
  getProjectSettings,
  isProjectSettingPropTrue,
} from "../../../helpers/functions";

export const SettingsModal = () => {
  const { globalSettings, setGlobalSetting } = useGlobalSettings();
  const [ projectSettings, setProjectSetting] = useProjectSettings();
  const [settings, setSettings] = useState(
    getProjectSettings().projectSettings
  );

  useEffect(() => {
    setSettings(projectSettings);
    // isProjectSettingPropTrue('disable_petite_vue',(projectSettings)=>{
      
    // })
  }, [projectSettings]);

  const search = (value = "") => {
    if (!value) {
      setSettings(getProjectSettings().projectSettings);
      return;
    }
    const filterdKeys = advancedSearchSuggestions(Object.keys(settings), value);
    const newObject = {};
    // const clone = structuredClone(settings);
    filterdKeys.forEach((key) => {
      newObject[key] = settings[key];
    });
    setSettings(newObject);
  };

  return (
    <section className="h-full w-full overflow-auto">
      <section className="flex flex-col gap-4 text-slate-200 font-semibold">
        {/* <h1 className="py-2 px-[30px] border-b-2 border-b-slate-600 w-fit">
          Global Settings
        </h1> */}
        {/* <MiniTitle>Global Settings</MiniTitle> */}
        <Input
          className="w-full bg-slate-800"
          placeholder="Search..."
          onInput={(ev) => {
            search(ev.target.value);
          }}
        />
        <section className="grid grid-cols-3 gap-2">
          {Object.keys(settings).map((key, i) => (
            <article
              key={i}
              title={key}
              className="flex justify-between  gap-2 items-center px-2 py-3 rounded-lg bg-slate-800"
            >
              <h1 className="custom-font-size overflow-hidden text-ellipsis  flex-shrink capitalize">
                {key.replaceAll("_", " ")}
              </h1>
              <SwitchButton
                defaultValue={settings[key]}
                onActive={(ev) => {
                  setProjectSetting({ [key]: true });
                }}
                onUnActive={(ev) => {
                  setProjectSetting({ [key]: false });
                }}
              />
            </article>
          ))}
        </section>
      </section>
    </section>
  );
};
