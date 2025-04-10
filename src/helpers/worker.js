import { exportProject } from "./exportProject";
import { loadProject } from "./loadProject";
import { deleteAllSymbolsById, getDataFromDB, keepSwLive, storeGrapesjsDataIfSymbols, updateAllPages, updateDB, uploadAssets, } from "./workerCommands";
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
    keepSwLive,
    uploadAssets,
};


self.addEventListener("message", async (ev) => {
    
    const {command , props} = ev.data;
    if(!command)return;
    commands[command](props);
    
});

self.addEventListener('error',(ev)=>{
    console.error(`From Worker : ${ev.error} , with line : ${ev.lineno}`);
    
})

