import {
  current_project_id,
  is_installation_checked,
} from "../constants/shared";
import { useEffect } from "react";
import { offlineInstallerWorker } from "../helpers/defineWorkers";

export const useOfflineHandler = () => {
  useEffect(() => {
    const projectId = +localStorage.getItem(current_project_id);
    if(!projectId)return;
    offlineInstallerWorker.postMessage({
      command: "offlineInstaller",
      props: {
        projectId: +localStorage.getItem(current_project_id),
      },
    });

    /**
     *
     * @param {Event} ev
     */
    const onlineCb = (ev) => {
      console.log("online");
      const installaionState = Boolean(
        JSON.parse(sessionStorage.getItem(is_installation_checked))
      );
      if (!installaionState) {
        console.warn(`You need to installition`);

        offlineInstallerWorker.postMessage({
          command: "offlineInstaller",
          props: {
            projectId: +localStorage.getItem(current_project_id),
          },
        });
      }
    };

    /**
     *
     * @param {MessageEvent} ev
     */
    const workerCB = (ev) => {
      const { command, props } = ev.data;
      if (command == "offlineInstaller") {
        props.update && sessionStorage.setItem(is_installation_checked, true);
        props.update && sessionStorage.setItem(is_installation_checked, false);
        console.log("installaion state : ", props.update);
      }
    };

    window.addEventListener("online", onlineCb);
    offlineInstallerWorker.addEventListener("message", workerCB);

    return () => {
      window.removeEventListener("online", onlineCb);
      offlineInstallerWorker.removeEventListener("message", workerCB);
    };
  }, []);
};
