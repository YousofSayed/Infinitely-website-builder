import { getKeyFrames, saveAnimations , removeAnimation } from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";

const commands = {
    getKeyFrames,
    saveAnimations,
    removeAnimation,
};

doWorkerPattern(commands)