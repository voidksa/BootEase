import type { BootEaseApi } from "../shared/contracts";

declare global {
  interface Window {
    bootEase: BootEaseApi;
  }
}

export {};
