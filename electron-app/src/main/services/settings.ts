import { app } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { AppSettings } from "../../shared/contracts";
import { sanitizeSettingsPatch } from "../../shared/guards";

let cachedSettings: AppSettings | undefined;

function settingsPath(): string {
  return path.join(app.getPath("userData"), "settings.json");
}

function defaultSettings(): AppSettings {
  return {
    language: app.getLocale().toLowerCase().startsWith("ar") ? "ar" : "en",
    theme: "system"
  };
}

export async function loadSettings(): Promise<AppSettings> {
  if (cachedSettings) {
    return { ...cachedSettings };
  }

  const defaults = defaultSettings();
  try {
    const content = await fs.readFile(settingsPath(), "utf8");
    const saved = sanitizeSettingsPatch(JSON.parse(content));
    cachedSettings = { ...defaults, ...saved };
  } catch {
    cachedSettings = defaults;
  }

  return { ...cachedSettings };
}

export async function updateSettings(
  patch: unknown
): Promise<AppSettings> {
  const current = await loadSettings();
  cachedSettings = {
    ...current,
    ...sanitizeSettingsPatch(patch)
  };

  const target = settingsPath();
  const temporary = `${target}.tmp`;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(temporary, JSON.stringify(cachedSettings, null, 2), "utf8");
  await fs.rename(temporary, target);

  return { ...cachedSettings };
}
