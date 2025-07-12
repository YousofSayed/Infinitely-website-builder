import { exportProject } from "./exportProject";
import { loadProject } from "./loadProject";
import { createProject, deleteAllSymbolsById, getDataFromDB, initOPFS, sendPreviewPagesToServiceWorker, storeGrapesjsDataIfSymbols, updateAllPages, updateDB, uploadAssets, varsToServiceWorker, } from "./workerCommands";
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
};

doWorkerPattern(commands)


// self.addEventListener("message", async (ev) => {
    
//     const {command , props} = ev.data;
//     console.log(`Infinitly worker event got it : ${command}`);
//     if(!command)return;
//     commands[command](props);
    
// });

// self.addEventListener('error',(ev)=>{
//     console.error(`From Worker : ${ev.error} , with line : ${ev.lineno}`);
    
// })

