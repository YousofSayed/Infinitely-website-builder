import { getAllStyleSheetClasses } from "@/helpers/workerCommands";
import { doWorkerPattern } from "@/helpers/workersPattern";

export const commands = {getAllStyleSheetClasses};

doWorkerPattern(commands)
