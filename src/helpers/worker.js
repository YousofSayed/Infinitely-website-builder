// import { getElementRulesWithAst } from "./bridge";
import { exportProject , getProject } from "./exportProject";
import { loadProject } from "./loadProject";
import {
  clearTimeouts,
  createProject,
  deleteAllMotionsById,
  deleteAllSymbolsById,
  deleteAttributesInAllPages,
  getDataFromDB,
  initOPFS,
  parseHTMLAndRaplceSymbols,
  sendPreviewPagesToServiceWorker,
  setInteractionsAttributes,
  storeGrapesjsDataIfSymbols,
  updateAllPages,
  updateDB,
  uploadAssets,
  varsToServiceWorker,
  writeFilesToOPFS,
  updateSymbolsStylesFiles,
  removeAttributesInAllPages,
  setAttributesInAllPages,
  createWpProject,
} from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";
import { wpCommands } from "./wp_commands_worker";
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
  createWpProject,
  initOPFS,
  clearTimeouts,
  writeFilesToOPFS,
  deleteAllMotionsById,
  setInteractionsAttributes,
  deleteAttributesInAllPages,
  parseHTMLAndRaplceSymbols,
  removeAttributesInAllPages,
  ...wpCommands,
  // getElementRulesWithAst,
  updateSymbolsStylesFiles,
  setAttributesInAllPages,
  getProject,
};




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
