import { getProjectSettings } from "../helpers/functions";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { projectSettingsState } from "../helpers/atoms";

/**
 * 
 * @returns {[import('../helpers/types').ProjectSetting , React.Dispatch<React.SetStateAction<import('../helpers/types').ProjectSetting>>]}
 */
export const useProjectSettings = () => {
  const projectSettingsFromLocal = getProjectSettings();
  const [projectSettings , setProjectSettingsRs] = useRecoilState(projectSettingsState);
  // const setProjectSettingsRs = useSetRecoilState(projectSettingsState);
  /**
   *
   * @param {import('../helpers/types').ProjectSetting} newSettings
   */
  const setProjectSetting = (newSettings) => {
    projectSettingsFromLocal.set(newSettings);
    setProjectSettingsRs((old) => ({ ...old, ...newSettings }));
    window.dispatchEvent(new CustomEvent('local-storage',{detail:{ ...projectSettings, ...newSettings }}))
  };
  return [projectSettings, setProjectSetting];
};
