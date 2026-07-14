export type Language = "ar" | "en";
export type ThemePreference = "system" | "light" | "dark";
export type ActionId = "bios" | "recovery" | "explorer" | "restart";
export type SecureBootState = "enabled" | "disabled" | "unsupported" | "unknown";
export type BiosMode = "UEFI" | "Legacy" | "Unknown";
export type ExternalTarget =
  | "repository"
  | "releases"
  | "license"
  | "extractly"
  | "support";

export interface AppSettings {
  language: Language;
  theme: ThemePreference;
}

export interface AppInfo {
  version: string;
  platform: string;
  isDark: boolean;
  isPackaged: boolean;
}

export interface BootstrapData {
  app: AppInfo;
  settings: AppSettings;
}

export interface SystemInfo {
  manufacturer: string;
  model: string;
  motherboardManufacturer: string;
  motherboardModel: string;
  biosVersion: string;
  biosMode: BiosMode;
  secureBoot: SecureBootState;
  osName: string;
  osVersion: string;
  architecture: string;
  capturedAt: string;
}

export interface ActionResult {
  ok: boolean;
  action: ActionId;
  errorCode?: "unsupported-platform" | "cancelled" | "failed";
  message?: string;
}

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  available: boolean;
  releaseUrl: string;
}

export interface SaveResult {
  saved: boolean;
  filePath?: string;
}

export interface BootEaseApi {
  getBootstrap(): Promise<BootstrapData>;
  getSystemInfo(): Promise<SystemInfo>;
  updateSettings(patch: Partial<AppSettings>): Promise<AppSettings>;
  performAction(action: ActionId): Promise<ActionResult>;
  checkForUpdates(): Promise<UpdateInfo>;
  copyText(text: string): Promise<void>;
  saveSystemInfo(text: string): Promise<SaveResult>;
  openExternal(target: ExternalTarget): Promise<void>;
  minimizeWindow(): Promise<void>;
  closeWindow(): Promise<void>;
  onThemeChanged(callback: (isDark: boolean) => void): () => void;
}
