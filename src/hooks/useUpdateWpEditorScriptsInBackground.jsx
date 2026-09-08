import React from "react";
import { useWordpress } from "./useWordpress";
import { initMainAndGlobalFilesForWp } from "@/helpers/bridge";
import { db } from "@/helpers/db";
import {
  doInWordpressAsync,
  getProjectId,
  getProjectSettings,
  wpWorkerCallbackMaker,
} from "@/helpers/functions";
import { offlineInstallerWorker } from "@/helpers/defineWorkers";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useLiveQuery } from "dexie-react-hooks";
import {
  buildWpHeaderScripts,
  buildWpScripts,
  buildWpStyles,
  SCRIPT_DEFINITIONS,
} from "@/constants/shared";

export const useUpdateWpEditorScriptsInBackground = () => {
  useWordpress(() => {
    doInWordpressAsync(async () => {
      const projectData = await db.projects.get(getProjectId());
      const { projectSettings } = getProjectSettings();
      if (
        projectData.mainEditorScripts.footer.length ===
        buildWpScripts({ projectSetting: projectSettings }).length
      )
        return;

      if (
        projectData.mainEditorScripts.header.length ===
        buildWpHeaderScripts({ projectSetting: projectSettings }).length
      )
        return;

      if (
        projectData.mainEditorStyles.length ===
        buildWpStyles({ projectSetting: projectSettings }).length + 1 // +1 for fonts.css
      )
        return;

      const tid = toast.loading(
        <ToastMsgInfo msg={`Updating editor scripts in background...`} />,
      );

      wpWorkerCallbackMaker(
        offlineInstallerWorker,
        "initMainAndGlobalFilesForWp",
        {
          data: {
            projectData: await db.projects.get(getProjectId()),
            projectSetting: getProjectSettings().projectSettings,
            id: getProjectId(),
          },
        },
        async ({ done, res }) => {
          console.log(
            "res config from useUpdateWpEditorScriptsInBackground : ",
            res,
            res.config,
          );

          if (res.config) {
            await db.projects.update(getProjectId(), {
              ...res.config,
              scripts_need_to_publish: false,
            });

            wpWorkerCallbackMaker(
              offlineInstallerWorker,
              "wp_update_option",
              {
                optionName: "inf_config",
                projectId: getProjectId(),
                value: await db.projects.get(getProjectId()),
                merge: true,
              },
              (res) => {
                toast.done(tid);
                if (res.success) {
                  toast.success(
                    <ToastMsgInfo msg={`Editor scripts up to date 💙`} />,
                  );
                }
              },
            );
          }
        },
      );
    });
  }, [getProjectId()]);
};
