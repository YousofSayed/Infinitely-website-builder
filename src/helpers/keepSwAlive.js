import { current_project_id } from "../constants/shared";
import { initDBAssetsSw } from "../serviceWorkers/initDBAssets-sw";
import { isDevMode } from "./bridge";
import { db } from "./db";
import { getProjectData } from "./functions";
import { infinitelyWorker } from "./infinitelyWorker";

export const swAliveInterval = setInterval(() => {
  // infinitelyWorker.postMessage({
  //   command: "keepSwLive",
  //   props: {
  //     projectId: +localStorage.getItem(current_project_id),
  //   },
  // });
  console.log("akive");

  initDBAssetsSw(() => {}).then(async (sw) => {
    const projectId = +localStorage.getItem(current_project_id);
    if (!projectId) {
      console.log("no project id dude");
      return;
    }
    // if(sw){
    //   console.log('sw is here');
    // isDevMode(
    //   async (isDev) => {
    //     if (!sw) {
    //       console.log("Not sw here");
    //       return;
    //     }
    //     sw.postMessage({
    //       command: "setVar",
    //       props: {
    //         obj: {
    //           projectId: +localStorage.getItem(current_project_id),
    //           projectData: await getProjectData(),
    //         },
    //       },
    //     });
    //   },
    //   async (isDev) => {
    //     navigator.serviceWorker.controller.postMessage({
    //       command: "setVar",
    //       props: {
    //         obj: {
    //           projectId: +localStorage.getItem(current_project_id),
    //           projectData: await getProjectData(),
    //         },
    //       },
    //     });
    //   }
    // );

    // }
  });
}, 15000);
