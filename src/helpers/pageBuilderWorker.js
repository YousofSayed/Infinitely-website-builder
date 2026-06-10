import {
  sendPreviewPagesToServiceWorker,
  sendPreviewPageToServiceWorker,
  varsToServiceWorker,
  writePreviewPage,
  writeFilesToOPFS,
} from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";
import { wpCommands } from "./wp_commands_worker";

const commands = {
  varsToServiceWorker,
  sendPreviewPagesToServiceWorker,
  sendPreviewPageToServiceWorker,
  writePreviewPage,
  writeFilesToOPFS,
  ...wpCommands
};

doWorkerPattern(commands);