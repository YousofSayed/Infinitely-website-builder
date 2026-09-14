import {
  getALLOPFSFiles,
  initOPFS,
  listenToOPFSBroadcastChannel,
  removeOPFSEntry,
  uploadAssets,
} from "@/helpers/workerCommands";
import { doWorkerPattern } from "@/helpers/workersPattern";
import { wpCommands } from "@/helpers/wp_commands_worker";
// import { opfs } from "./initOpfs";

export const commands = {
  uploadAssets,
  initOPFS,
  listenToOPFSBroadcastChannel,
  removeOPFSEntry,
  getALLOPFSFiles,
  ...wpCommands,
};

doWorkerPattern(commands);
