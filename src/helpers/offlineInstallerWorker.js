import { offlineInstaller } from "@/helpers/workerCommands";
import { doWorkerPattern } from "@/helpers/workersPattern";
import { wpCommands } from "@/helpers/wp_commands_worker";

export const commands = { offlineInstaller , ...wpCommands};

doWorkerPattern(commands);
