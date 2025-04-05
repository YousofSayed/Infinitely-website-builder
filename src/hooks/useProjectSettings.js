import { getProjectSettings } from "../helpers/functions";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { projectSettingsState } from "../helpers/atoms";

export const useProjectSettings = () => {
  const projectSettingsFromLocal = getProjectSettings();
  const projectSettings = useRecoilValue(projectSettingsState);
  const setProjectSettingsRs = useSetRecoilState(projectSettingsState);

  return {
    projectSettings,
    /**
     *
     * @param {import('../helpers/types').ProjectSetting} newSettings
     */
    setProjectSetting(newSettings) {
      projectSettingsFromLocal.set(newSettings);
      setProjectSettingsRs((old) => ({ ...old, ...newSettings }));
    },
  };
};
