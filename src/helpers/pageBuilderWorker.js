import {
  sendPreviewPagesToServiceWorker,
  sendPreviewPageToServiceWorker,
  varsToServiceWorker,
  writePreviewPage,
} from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";

const commands = {
  varsToServiceWorker,
  sendPreviewPagesToServiceWorker,
  sendPreviewPageToServiceWorker,
  writePreviewPage,
};

doWorkerPattern(commands);