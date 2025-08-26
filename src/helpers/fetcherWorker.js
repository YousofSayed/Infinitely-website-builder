import { installTypes } from "./installTypes";
import { shareProject } from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";

const commands = {shareProject,installTypes,};
doWorkerPattern(commands);