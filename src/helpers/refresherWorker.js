import { refreshSW } from "@/helpers/workerCommands";
import { doWorkerPattern } from "@/helpers/workersPattern";

export const commands = {refreshSW};

doWorkerPattern(commands);
