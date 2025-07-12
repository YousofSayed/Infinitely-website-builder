import { listenToOPFSBroadcastChannel } from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";

const commands = {
    listenToOPFSBroadcastChannel,
}
doWorkerPattern(commands)