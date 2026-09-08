import {
  getProjectData,
  getProjectSettings,
  setProjectSettings,
} from "@/helpers/functions";
import { projectSettingsType } from "@/helpers/jsDocs";
import { useLiveQuery } from "dexie-react-hooks";
import { isPlainObject } from "lodash";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProjectSettings } from "./useProjectSettings";

export const useSettingsHandler = () => {
  const location = useLocation();
  const [projectSettings, setProjectSettingsSate] = useProjectSettings();
  useEffect(() => {
    (async () => {
      const { projectSetting } = await getProjectData();
      const value =
        isPlainObject(projectSetting) &&
        Object.values(projectSetting).length > 0
          ? projectSetting
          : projectSettingsType;
      console.log(` useLiveQuery setProjectSettings :`, value);

      setProjectSettings(JSON.stringify(value));
      setProjectSettingsSate(getProjectSettings().projectSettings);
    })();
  }, []);
};
