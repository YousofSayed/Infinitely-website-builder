import type { api } from "../desktop/preload.cjs";

declare global {
  interface Window {
    electron: typeof api;
  }
}

export {};