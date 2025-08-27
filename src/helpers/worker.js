import { exportProject } from "./exportProject";
import { loadProject } from "./loadProject";
import {
  clearTimeouts,
  createProject,
  deleteAllSymbolsById,
  getDataFromDB,
  initOPFS,
  sendPreviewPagesToServiceWorker,
  storeGrapesjsDataIfSymbols,
  updateAllPages,
  updateDB,
  uploadAssets,
  varsToServiceWorker,
  writeFilesToOPFS,
} from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";
// import { getProjectData } from "./functions";

const commands = {
  updateAllPages,
  deleteAllSymbolsById,
  updateDB,
  // updateDynamicTemplates,
  getDataFromDB,
  exportProject,
  storeGrapesjsDataIfSymbols,
  loadProject,
  uploadAssets,
  varsToServiceWorker,
  sendPreviewPagesToServiceWorker,
  createProject,
  initOPFS,
  clearTimeouts,
  writeFilesToOPFS,
};

const url = 'http://tmpfiles.org/dl/11971384/infinitelystudiofrontpage12.zip';
(async ()=>{

    console.log(await (await fetch(url)).blob());
})()
 

doWorkerPattern(commands);

// self.addEventListener("message", async (ev) => {

//     const {command , props} = ev.data;
//     console.log(`Infinitly worker event got it : ${command}`);
//     if(!command)return;
//     commands[command](props);

// });

// self.addEventListener('error',(ev)=>{
//     console.error(`From Worker : ${ev.error} , with line : ${ev.lineno}`);

// })
