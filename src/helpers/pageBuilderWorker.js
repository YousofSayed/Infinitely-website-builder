import {
  sendPreviewPagesToServiceWorker,
  sendPreviewPageToServiceWorker,
  varsToServiceWorker,
  writePreviewPage,
  writeFilesToOPFS,
} from "@/helpers/workerCommands";
import { doWorkerPattern } from "@/helpers/workersPattern";
import { wpCommands } from "@/helpers/wp_commands_worker";

export const commands = {
  varsToServiceWorker,
  sendPreviewPagesToServiceWorker,
  sendPreviewPageToServiceWorker,
  writePreviewPage,
  writeFilesToOPFS,
  ...wpCommands
};

doWorkerPattern(commands);
