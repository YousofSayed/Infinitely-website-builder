import { listenToOPFSBroadcastChannel } from "@/helpers/workerCommands";
import { doWorkerPattern } from "@/helpers/workersPattern";

export const commands = {
    listenToOPFSBroadcastChannel,
}
doWorkerPattern(commands)
