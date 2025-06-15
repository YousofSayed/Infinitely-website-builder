import {
  sendPreviewPagesToServiceWorker,
  sendPreviewPageToServiceWorker,
  varsToServiceWorker,
} from "./workerCommands";
import { doWorkerPattern } from "./workersPattern";

const commands = {
  varsToServiceWorker,
  sendPreviewPagesToServiceWorker,
  sendPreviewPageToServiceWorker,
};

doWorkerPattern(commands);