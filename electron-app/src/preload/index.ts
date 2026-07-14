import { contextBridge, ipcRenderer } from "electron";
import type {
  ActionId,
  AppSettings,
  BootEaseApi,
  ExternalTarget
} from "../shared/contracts";

// Sandboxed preloads can only require Electron and a small Node.js subset.
// Keep runtime channel names local so the compiled preload is self-contained.
const channels = {
  bootstrap: "app:bootstrap",
  systemInfo: "system:info",
  updateSettings: "settings:update",
  performAction: "power:perform",
  checkUpdates: "updates:check",
  copyText: "clipboard:copy",
  saveSystemInfo: "system:save",
  openExternal: "external:open",
  windowMinimize: "window:minimize",
  windowClose: "window:close",
  themeChanged: "theme:changed"
} as const;

const api: BootEaseApi = {
  getBootstrap: () => ipcRenderer.invoke(channels.bootstrap),
  getSystemInfo: () => ipcRenderer.invoke(channels.systemInfo),
  updateSettings: (patch: Partial<AppSettings>) =>
    ipcRenderer.invoke(channels.updateSettings, patch),
  performAction: (action: ActionId) =>
    ipcRenderer.invoke(channels.performAction, action),
  checkForUpdates: () => ipcRenderer.invoke(channels.checkUpdates),
  copyText: (text: string) => ipcRenderer.invoke(channels.copyText, text),
  saveSystemInfo: (text: string) =>
    ipcRenderer.invoke(channels.saveSystemInfo, text),
  openExternal: (target: ExternalTarget) =>
    ipcRenderer.invoke(channels.openExternal, target),
  minimizeWindow: () => ipcRenderer.invoke(channels.windowMinimize),
  closeWindow: () => ipcRenderer.invoke(channels.windowClose),
  onThemeChanged: (callback: (isDark: boolean) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, isDark: boolean) =>
      callback(isDark);
    ipcRenderer.on(channels.themeChanged, listener);
    return () => ipcRenderer.removeListener(channels.themeChanged, listener);
  }
};

contextBridge.exposeInMainWorld("bootEase", api);
