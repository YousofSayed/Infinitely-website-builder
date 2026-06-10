import { initOPFS, listenToOPFSBroadcastChannel, removeOPFSEntry, uploadAssets } from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";
import { wpCommands } from "./wp_commands_worker";

const commands = {
    uploadAssets,
    initOPFS,
    listenToOPFSBroadcastChannel,
    removeOPFSEntry,
    ...wpCommands,
};

doWorkerPattern(commands)