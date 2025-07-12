import { initOPFS, listenToOPFSBroadcastChannel, removeOPFSEntry, uploadAssets } from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";

const commands = {
    uploadAssets,
    initOPFS,
    listenToOPFSBroadcastChannel,
    removeOPFSEntry,
};

doWorkerPattern(commands)