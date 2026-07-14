import type {
  ActionId,
  AppSettings,
  Language,
  ThemePreference
} from "./contracts";

const actionIds = new Set<ActionId>([
  "bios",
  "recovery",
  "explorer",
  "restart"
]);

const languages = new Set<Language>(["ar", "en"]);
const themes = new Set<ThemePreference>(["system", "light", "dark"]);

export function isActionId(value: unknown): value is ActionId {
  return typeof value === "string" && actionIds.has(value as ActionId);
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && languages.has(value as Language);
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && themes.has(value as ThemePreference);
}

export function sanitizeSettingsPatch(
  value: unknown
): Partial<AppSettings> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const candidate = value as Record<string, unknown>;
  const result: Partial<AppSettings> = {};

  if (isLanguage(candidate.language)) {
    result.language = candidate.language;
  }

  if (isThemePreference(candidate.theme)) {
    result.theme = candidate.theme;
  }

  return result;
}
