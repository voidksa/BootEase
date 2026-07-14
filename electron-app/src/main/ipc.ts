import {
  app,
  BrowserWindow,
  clipboard,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
  type IpcMainInvokeEvent
} from "electron";
import { promises as fs } from "node:fs";
import type {
  AppSettings,
  ExternalTarget
} from "../shared/contracts";
import { channels } from "../shared/channels";
import { isActionId } from "../shared/guards";
import { performPowerAction } from "./services/power-actions";
import { loadSettings, updateSettings } from "./services/settings";
import { getSystemInfo } from "./services/system-info";
import { checkForUpdates } from "./services/updates";

const allowedExternalTargets: Record<ExternalTarget, string> = {
  repository: "https://github.com/voidksa/BootEase",
  releases: "https://github.com/voidksa/BootEase/releases/latest",
  license: "https://github.com/voidksa/BootEase/blob/main/LICENSE",
  extractly: "https://extractly.vip/",
  support: "mailto:support@extractly.vip"
};

function assertTrustedSender(event: IpcMainInvokeEvent): void {
  const senderUrl = event.senderFrame?.url;
  if (!senderUrl) {
    throw new Error("Missing IPC sender URL.");
  }

  const parsed = new URL(senderUrl);
  if (parsed.protocol !== "bootease:" || parsed.host !== "app") {
    throw new Error("Rejected IPC call from an untrusted sender.");
  }
}

function validateText(value: unknown): string {
  if (typeof value !== "string" || value.length > 100_000) {
    throw new Error("Invalid text payload.");
  }
  return value;
}

function isExternalTarget(value: unknown): value is ExternalTarget {
  return (
    typeof value === "string" &&
    Object.hasOwn(allowedExternalTargets, value)
  );
}

export function registerIpcHandlers(): void {
  ipcMain.handle(channels.bootstrap, async (event) => {
    assertTrustedSender(event);
    const settings = await loadSettings();
    return {
      app: {
        version: app.getVersion(),
        platform: process.platform,
        isDark: nativeTheme.shouldUseDarkColors,
        isPackaged: app.isPackaged
      },
      settings
    };
  });

  ipcMain.handle(channels.systemInfo, async (event) => {
    assertTrustedSender(event);
    return getSystemInfo();
  });

  ipcMain.handle(channels.updateSettings, async (event, patch: unknown) => {
    assertTrustedSender(event);
    const settings = await updateSettings(patch);
    nativeTheme.themeSource = settings.theme;
    return settings;
  });

  ipcMain.handle(channels.performAction, async (event, action: unknown) => {
    assertTrustedSender(event);
    if (!isActionId(action)) {
      throw new Error("Invalid power action.");
    }
    return performPowerAction(action);
  });

  ipcMain.handle(channels.checkUpdates, async (event) => {
    assertTrustedSender(event);
    return checkForUpdates();
  });

  ipcMain.handle(channels.copyText, async (event, value: unknown) => {
    assertTrustedSender(event);
    clipboard.writeText(validateText(value));
  });

  ipcMain.handle(channels.saveSystemInfo, async (event, value: unknown) => {
    assertTrustedSender(event);
    const text = validateText(value);
    const settings: AppSettings = await loadSettings();
    const result = await dialog.showSaveDialog({
      title:
        settings.language === "ar"
          ? "حفظ معلومات النظام"
          : "Save system information",
      defaultPath: "BootEase-SystemInfo.txt",
      filters: [
        {
          name: settings.language === "ar" ? "ملف نصي" : "Text file",
          extensions: ["txt"]
        }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { saved: false };
    }

    await fs.writeFile(result.filePath, text, "utf8");
    return { saved: true, filePath: result.filePath };
  });

  ipcMain.handle(channels.openExternal, async (event, target: unknown) => {
    assertTrustedSender(event);
    if (!isExternalTarget(target)) {
      throw new Error("Invalid external link target.");
    }
    await shell.openExternal(allowedExternalTargets[target]);
  });

  ipcMain.handle(channels.windowMinimize, (event) => {
    assertTrustedSender(event);
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.handle(channels.windowClose, (event) => {
    assertTrustedSender(event);
    BrowserWindow.fromWebContents(event.sender)?.close();
  });
}
