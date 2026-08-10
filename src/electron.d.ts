import type { api } from "../preload.cjs";

declare global {
  interface Window {
    electron: typeof api;
  }
}

export {};