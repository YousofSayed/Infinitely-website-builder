import { installTypes } from "@/helpers/installTypes";
import { shareProject } from "@/helpers/workerCommands";
import { doWorkerPattern } from "@/helpers/workersPattern";
import { wpCommands } from "@/helpers/wp_commands_worker";

export const commands = {
  shareProject,
  installTypes,
  ...wpCommands,
};
doWorkerPattern(commands);
