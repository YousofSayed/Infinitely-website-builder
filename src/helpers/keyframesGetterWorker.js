import { getKeyFrames, saveAnimations , removeAnimation } from "@/helpers/workerCommands";
import { doWorkerPattern } from "@/helpers/workersPattern";

export const commands = {
    getKeyFrames,
    saveAnimations,
    removeAnimation,
};

doWorkerPattern(commands)
