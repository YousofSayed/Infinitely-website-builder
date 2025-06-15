import { getProjectSettings } from "../helpers/functions";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { projectSettingsState } from "../helpers/atoms";

/**
 * 
 * @returns {[import('../helpers/types').ProjectSetting , React.Dispatch<React.SetStateAction<import('../helpers/types').ProjectSetting>>]}
 */
export const useProjectSettings = () => {
  const projectSettingsFromLocal = getProjectSettings();
  const projectSettings = useRecoilValue(projectSettingsState);
  const setProjectSettingsRs = useSetRecoilState(projectSettingsState);
  /**
   *
   * @param {import('../helpers/types').ProjectSetting} newSettings
   */
  const setProjectSetting = (newSettings) => {
    projectSettingsFromLocal.set(newSettings);
    setProjectSettingsRs((old) => ({ ...old, ...newSettings }));
  };
  return [projectSettings, setProjectSetting];
};
