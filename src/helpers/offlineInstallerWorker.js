import { offlineInstaller } from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";

const commands = { offlineInstaller };

doWorkerPattern(commands);
