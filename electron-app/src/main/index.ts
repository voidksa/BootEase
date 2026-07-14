import {
  app,
  BrowserWindow,
  nativeTheme,
  net,
  protocol,
  session
} from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { ActionId } from "../shared/contracts";
import { channels } from "../shared/channels";
import { actionFromArguments } from "../shared/cli";
import { registerIpcHandlers } from "./ipc";
import { performPowerAction } from "./services/power-actions";
import { loadSettings } from "./services/settings";

const APP_SCHEME = "bootease";
const APP_HOST = "app";
const APP_ID = "com.voidksa.bootease";
const APP_NAME = "BootEase";
let mainWindow: BrowserWindow | null = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true
    }
  }
]);

app.enableSandbox();
app.setName(APP_NAME);

if (process.platform === "win32") {
  app.setAppUserModelId(APP_ID);
}

function rendererRoot(): string {
  return path.resolve(__dirname, "..", "..", "renderer");
}

async function registerAppProtocol(): Promise<void> {
  const root = rendererRoot();
  await protocol.handle(APP_SCHEME, async (request) => {
    const url = new URL(request.url);
    if (url.host !== APP_HOST) {
      return new Response("Not found", { status: 404 });
    }

    const relativePath = decodeURIComponent(url.pathname)
      .replace(/^\/+/, "") || "index.html";
    const target = path.resolve(root, relativePath);
    const relative = path.relative(root, target);

    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      return new Response("Not found", { status: 404 });
    }

    return net.fetch(pathToFileURL(target).toString());
  });
}

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    title: APP_NAME,
    icon: path.join(rendererRoot(), "app_icon.png"),
    width: 1120,
    height: 780,
    minWidth: 900,
    minHeight: 700,
    maximizable: false,
    fullscreenable: false,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    roundedCorners: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0c111b" : "#f3f6fb",
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: !app.isPackaged
    }
  });

  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event, navigationUrl) => {
    const url = new URL(navigationUrl);
    if (url.protocol !== `${APP_SCHEME}:` || url.host !== APP_HOST) {
      event.preventDefault();
    }
  });

  window.once("ready-to-show", () => window.show());
  void window.loadURL(`${APP_SCHEME}://${APP_HOST}/index.html`);
  return window;
}

async function runCliAction(action: ActionId): Promise<void> {
  const result = await performPowerAction(action);
  if (!result.ok) {
    console.error(result.message ?? result.errorCode ?? "Power action failed.");
    app.exit(1);
    return;
  }
  app.quit();
}

async function initialize(): Promise<void> {
  await registerAppProtocol();

  session.defaultSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => callback(false)
  );

  const settings = await loadSettings();
  nativeTheme.themeSource = settings.theme;
  registerIpcHandlers();

  nativeTheme.on("updated", () => {
    mainWindow?.webContents.send(
      channels.themeChanged,
      nativeTheme.shouldUseDarkColors
    );
  });

  const startupAction = actionFromArguments(process.argv.slice(1));
  if (startupAction) {
    await runCliAction(startupAction);
    return;
  }

  mainWindow = createWindow();
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine) => {
    const action = actionFromArguments(commandLine);
    if (action) {
      void runCliAction(action);
      return;
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  app.on("web-contents-created", (_event, contents) => {
    contents.on("will-attach-webview", (event) => event.preventDefault());
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });

  app.on("window-all-closed", () => app.quit());

  void app.whenReady().then(initialize).catch((error: unknown) => {
    console.error("BootEase failed to start:", error);
    app.exit(1);
  });
}
