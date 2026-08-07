import { initOPFS, listenToOPFSBroadcastChannel, removeOPFSEntry, uploadAssets } from "@/helpers/workerCommands";
import { doWorkerPattern } from "@/helpers/workersPattern";
import { wpCommands } from "@/helpers/wp_commands_worker";

export const commands = {
    uploadAssets,
    initOPFS,
    listenToOPFSBroadcastChannel,
    removeOPFSEntry,
    ...wpCommands,
};

doWorkerPattern(commands)
