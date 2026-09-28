import { editorAPIs } from "@/api/editor.api";
import { installTypes } from "@/helpers/installTypes";
import { htmlToGrapesjsComponents, minifyCss, shareProject } from "@/helpers/workerCommands";
import { doWorkerPattern } from "@/helpers/workersPattern";
import { wpCommands } from "@/helpers/wp_commands_worker";

export const commands = {
  shareProject,
  installTypes,
  minifyCss,
  ...wpCommands,
  ...editorAPIs,
  htmlToGrapesjsComponents,
};
doWorkerPattern(commands);
