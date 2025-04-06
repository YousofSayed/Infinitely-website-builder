import { current_project_id } from "../constants/shared";
import { initDBAssetsSw } from "../serviceWorkers/initDBAssets-sw";
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
  console.log('akive');
  
  initDBAssetsSw(()=>{}).then(async sw=>{
    if(sw){
      sw.postMessage({
        command: "setVar",
        props: {
          obj: {
            projectId: +localStorage.getItem(current_project_id),
            projectData: await getProjectData(),
          },
        },
      })
    }
  })
}, 15000);
