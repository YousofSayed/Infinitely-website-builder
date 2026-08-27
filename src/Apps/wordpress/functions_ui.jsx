import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { current_project_id } from "@/constants/shared";
import { createRestartableAsync } from "@/helpers/bridge";
import { db } from "@/helpers/db";
import {
  getProjectData,
  getProjectSettings,
  getWpPageConfig,
} from "@/helpers/functions";
import { wp_update_main_global_files, wp_update_option } from "@/Apps/wordpress/functions";
import { isFunction } from "lodash";
import { toast } from "react-toastify";

export async function wp_toast_handler({
  returnCallback = () => {},
  toast_loading_msg,
  toast_success_msg,
  toast_error_msg,
  onSuccess = () => {},
  onError = () => {},
}) {
  const tid = toast.loading(<ToastMsgInfo msg={toast_loading_msg} />);
  try {
    const jsonRes = await returnCallback();
    if (jsonRes.success || jsonRes.id || jsonRes.slug) {
      toast.done(tid);
      console.log("app psw : ", jsonRes);
      toast.success(
        <ToastMsgInfo
          msg={
            isFunction(toast_success_msg)
              ? toast_success_msg(jsonRes)
              : toast_success_msg
          }
        />,
      );
      await onSuccess(jsonRes);
    } else {
      toast.dismiss(tid);
      console.error(jsonRes.message);

      toast.error(<ToastMsgInfo msg={jsonRes?.message ||  `Error while fetch deta 😔`} />);
    }
  } catch (error) {
    toast.dismiss(tid);
    toast.error(
      <ToastMsgInfo
        msg={isFunction(toast_error_msg) ? toast_error_msg() : toast_error_msg}
      />,
    );
    await onError();
    throw new Error(error);
  }
}

export function wp_get_post_id() {
  const wp_post = getWpPageConfig();
  return wp_post.type === "wp_template" ? wp_post.wp_id : wp_post.id;
}

export const wp_save_editor_scripts = createRestartableAsync(async () => {
  const projectId = +localStorage.getItem(current_project_id);
  const projectData = await getProjectData();
  const wp_post = getWpPageConfig();
  const { projectSettings } = getProjectSettings();
  const isProjectSettingsChanged =
    JSON.stringify(projectData.projectSetting) !==
    JSON.stringify(projectSettings);

  if (!window._r_wp_tid) {
    window._r_wp_tid = toast.loading(
      <ToastMsgInfo msg={"Saving editor scripts...✨"} />,
    );
  }

  try {
    if (isProjectSettingsChanged) {
      await wp_update_main_global_files({
        data: {
          id: projectId,
          projectSetting: projectSettings,
          projectData,
          global: {
            // css: "",
            // js: "",
          },
        },
      });

      await db.projects.update(projectId, {
        scripts_need_to_publish: false,
        projectSetting: projectSettings,
        currentEditingPage: {
          ...projectData.currentEditingPage,
          need_publish_to_wp: true,
        },
      });

      const newProjectData = await getProjectData();
      newProjectData.currentEditingPage = {};
      newProjectData.current_inf_meta = {};
      await wp_update_option({
        optionName: "inf_config",
        projectId,
        value: newProjectData,
      });
    }
    toast.done(window._r_wp_tid);
    toast.success(<ToastMsgInfo msg={`Editor scripts updated 💙`} />);
    window._r_wp_tid = null;
  } catch (error) {
    toast.dismiss(window._r_wp_tid);
    toast.error(<ToastMsgInfo msg={`Faild to update editor scripts 😡`} />);
    window._r_wp_tid = null;
    throw new Error(error);
  }
});
