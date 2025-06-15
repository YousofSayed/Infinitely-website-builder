import { exportProject } from "./exportProject";
import { loadProject } from "./loadProject";
import { deleteAllSymbolsById, getDataFromDB, sendPreviewPagesToServiceWorker, storeGrapesjsDataIfSymbols, updateAllPages, updateDB, uploadAssets, varsToServiceWorker, } from "./workerCommands";
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

