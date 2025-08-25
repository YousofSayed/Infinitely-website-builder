import { installTypes, shareProject } from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";

const commands = {shareProject,installTypes,};
doWorkerPattern(commands);