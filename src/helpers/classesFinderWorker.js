import { getAllStyleSheetClasses } from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";

const commands = {getAllStyleSheetClasses};

doWorkerPattern(commands)