import { installTypes } from "./installTypes";
import { shareProject } from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";
import { wpCommands } from "./wp_commands_worker";

const commands = {
  shareProject,
  installTypes,
  ...wpCommands,
};
doWorkerPattern(commands);
