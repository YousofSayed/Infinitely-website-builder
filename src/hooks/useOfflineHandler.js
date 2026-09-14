import {
  current_project_id,
  is_installation_checked,
} from "@/constants/shared";
import { offlineInstallerWorker, routerWorker } from "@/helpers/defineWorkers";
import {
  getProject,
  getProjectId,
  workerCallbackMaker,
  workerCallbackMakerWithProps,
} from "@/helpers/functions";
import { useEffect } from "react";

export const useOfflineHandler = (state) => {
  useEffect(() => {
    const projectId = +localStorage.getItem(current_project_id);
    if (!projectId) return;

    if (!state) return;

    // workerCallbackMaker(
    //   routerWorker,
    //   "listenToOPFSBroadcastChannel",
    //   async({ done }) => {
    //     // console.log('doneee for ofline worker' , done , await(await fetch(`./assets/videos.json`)).text());

    //     if (done) {
    //       offlineInstallerWorker.postMessage({
    //         command: "offlineInstaller",
    //         props: {
    //           projectId: +localStorage.getItem(current_project_id),
    //         },
    //       });
    //     }
    //   }
    // );

    /**
     *
     * @param {Event} ev
     */
    const onlineCb = (ev) => {
      console.log("online");
      const installaionState = Boolean(
        JSON.parse(sessionStorage.getItem(is_installation_checked)),
      );
      if (!installaionState) {
        console.warn(`You need to installition`);

        // offlineInstallerWorker.postMessage({
        //   command: "offlineInstaller",
        //   props: {
        //     projectId: +localStorage.getItem(current_project_id),
        //   },
        // });

        workerCallbackMakerWithProps(
          offlineInstallerWorker,
          "offlineInstaller",
          { projectId: getProjectId() },
          (res) => {
            console.log(`res from offline installer : ` , res);
            
            if (res.done) {
              sessionStorage.setItem(is_installation_checked, true);
            }
          },
        );
      }
    };

    onlineCb();

    /**
     *
     * @param {MessageEvent} ev
     */
    // const workerCB = (ev) => {
    //   const { command, props } = ev.data;
    //   if (command == "offlineInstaller") {
    //     props.update && sessionStorage.setItem(is_installation_checked, true);
    //     console.log("installaion state : ", props.update);
    //   }
    // };

    window.addEventListener("online", onlineCb);
    // offlineInstallerWorker.addEventListener("message", workerCB);

    return () => {
      window.removeEventListener("online", onlineCb);
      // offlineInstallerWorker.removeEventListener("message", workerCB);
    };
  }, [state]);
};
