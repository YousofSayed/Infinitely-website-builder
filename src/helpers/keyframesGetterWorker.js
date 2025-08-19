import { getKeyFrames, saveAnimations } from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";

const commands = {
    getKeyFrames,
    saveAnimations,
};

doWorkerPattern(commands)