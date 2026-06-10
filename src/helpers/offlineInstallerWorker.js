import { offlineInstaller } from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";
import { wpCommands } from "./wp_commands_worker";

const commands = { offlineInstaller , ...wpCommands};

doWorkerPattern(commands);
