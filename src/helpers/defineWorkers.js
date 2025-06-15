import { defineWorker } from "./defineWorker";

 const pageBuilderWorker = defineWorker({url:'./pageBuilderWorker' , origin:import.meta.url , type:'module',});
 const offlineInstallerWorker = defineWorker({url:'./offlineInstallerWorker' ,origin:import.meta.url, type: 'module'});


export { pageBuilderWorker , offlineInstallerWorker };
