import React from "react";
import { getGlobalSettings } from "../helpers/functions";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSettingsState } from "../helpers/atoms";

export const useGlobalSettings = () => {
  const globalSettingsFromLocal = getGlobalSettings();
  const globalSettings = useRecoilValue(globalSettingsState);
  const setGlobalSettingsRs = useSetRecoilState(globalSettingsState);

  return {
    globalSettings,
    /**
     *
     * @param {import('../helpers/types').GlobalSettings} newSettings
     */
    setGlobalSetting(newSettings) {
      globalSettingsFromLocal.set(newSettings);
      setGlobalSettingsRs((old) => ({ ...old, ...newSettings }));
    },
  };
};
