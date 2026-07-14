import type {
  ActionId,
  AppSettings,
  Language,
  SecureBootState,
  SystemInfo,
  ThemePreference
} from "../shared/contracts";

const translations = {
  en: {
    appTagline: "System & firmware utility",
    checkUpdates: "Check for updates",
    updates: "Updates",
    changeTheme: "Change color theme",
    windowsReady: "Windows utility ready",
    readyTitle: "Boot options, without the key mashing",
    readyDescription:
      "Review your firmware status and restart exactly where you need.",
    elevationOnDemand: "Elevation only when needed",
    detectingFirmware: "Detecting firmware…",
    deviceOverview: "Device overview",
    systemInformation: "System information",
    copyInformation: "Copy system information",
    saveInformation: "Save system information",
    refreshInformation: "Refresh system information",
    deviceModel: "Device model",
    motherboard: "Motherboard",
    biosVersion: "BIOS version",
    biosMode: "BIOS mode",
    secureBoot: "Secure Boot",
    operatingSystem: "Operating system",
    loadingInformation: "Loading system information…",
    quickActions: "Quick actions",
    powerOptions: "Power options",
    selectAction: "Choose where Windows should restart.",
    actionBios: "BIOS / UEFI",
    actionBiosDescription: "Open firmware settings after restart",
    actionRecovery: "Recovery mode",
    actionRecoveryDescription: "Advanced startup and Safe Mode",
    actionExplorer: "Restart Explorer",
    actionExplorerDescription: "Refresh the Windows desktop only",
    actionRestart: "Normal restart",
    actionRestartDescription: "Restart Windows normally",
    continueButton: "Continue",
    confirmationNote: "You will be asked to confirm before any action.",
    updateAvailable: "A new BootEase version is available",
    viewRelease: "View release",
    sourceRepository: "Source repository",
    rightsAndLicense: "Rights & license",
    extractlyProduct: "BootEase is an Extractly.vip product",
    visitExtractly: "Visit website",
    developerCredit: "Developed by voidksa",
    ownedByExtractly: "Owned and maintained by Extractly.vip",
    discoverExtractly: "Discover Extractly",
    confirmTitle: "Confirm action",
    cancel: "Cancel",
    confirm: "Confirm",
    attributionNotice:
      "Copyright © 2025–2026 Extractly.vip. Licensed under GNU GPLv3.",
    modifiedVersionsNotice:
      "Modified versions must preserve the Extractly ownership notice, original developer credit, and repository link; identify their changes; and must not claim to be the official version.",
    viewLicense: "View GPLv3 license",
    close: "Close",
    minimizeWindow: "Minimize window",
    closeWindow: "Close window",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    switchLanguage: "Switch to Arabic",
    unknown: "Unknown",
    secureEnabled: "Enabled",
    secureDisabled: "Disabled",
    secureUnsupported: "Not supported",
    secureUnknown: "Unknown",
    uefiDetected: "UEFI firmware detected",
    legacyDetected: "Legacy BIOS detected",
    firmwareUnknown: "Firmware mode unavailable",
    capturedAt: "Updated {time}",
    copied: "System information copied to the clipboard.",
    saved: "System information saved successfully.",
    saveCancelled: "Save cancelled.",
    systemInfoError: "Could not load system information.",
    checkingUpdates: "Checking for updates…",
    latestVersion: "You are using the latest version.",
    updateCheckFailed: "Could not check for updates.",
    permissionRequested: "Waiting for Windows permission…",
    explorerRestarted: "Windows Explorer restarted successfully.",
    actionCancelled: "The action was cancelled.",
    actionFailed: "The requested action could not be completed.",
    confirmBios:
      "The computer will restart immediately and open BIOS/UEFI settings. Save your work before continuing.",
    confirmRecovery:
      "The computer will restart immediately into Windows Recovery. Save your work before continuing.",
    confirmExplorer:
      "The desktop and taskbar will briefly disappear while Windows Explorer restarts.",
    confirmRestart:
      "The computer will restart immediately. Save your work before continuing.",
    versionWord: "Version"
  },
  ar: {
    appTagline: "أداة النظام والبيوس",
    checkUpdates: "التحقق من التحديثات",
    updates: "التحديثات",
    changeTheme: "تغيير مظهر الألوان",
    windowsReady: "أداة Windows جاهزة",
    readyTitle: "خيارات الإقلاع بسهولة ووضوح",
    readyDescription:
      "راجع حالة البيوس وأعد تشغيل الجهاز مباشرة إلى الوجهة التي تحتاجها.",
    elevationOnDemand: "طلب الصلاحية عند الحاجة فقط",
    detectingFirmware: "جارٍ اكتشاف نمط البيوس…",
    deviceOverview: "نظرة عامة على الجهاز",
    systemInformation: "معلومات النظام",
    copyInformation: "نسخ معلومات النظام",
    saveInformation: "حفظ معلومات النظام",
    refreshInformation: "تحديث معلومات النظام",
    deviceModel: "موديل الجهاز",
    motherboard: "اللوحة الأم",
    biosVersion: "إصدار البيوس",
    biosMode: "نمط البيوس",
    secureBoot: "الإقلاع الآمن",
    operatingSystem: "نظام التشغيل",
    loadingInformation: "جارٍ تحميل معلومات النظام…",
    quickActions: "إجراءات سريعة",
    powerOptions: "خيارات الطاقة",
    selectAction: "اختر الوجهة التي تريد إعادة تشغيل Windows إليها.",
    actionBios: "BIOS / UEFI",
    actionBiosDescription: "فتح إعدادات البيوس بعد إعادة التشغيل",
    actionRecovery: "وضع الاسترداد",
    actionRecoveryDescription: "بدء التشغيل المتقدم والوضع الآمن",
    actionExplorer: "إعادة تشغيل Explorer",
    actionExplorerDescription: "تحديث سطح مكتب Windows فقط",
    actionRestart: "إعادة تشغيل عادية",
    actionRestartDescription: "إعادة تشغيل Windows بصورة عادية",
    continueButton: "متابعة",
    confirmationNote: "سيُطلب منك التأكيد قبل تنفيذ أي إجراء.",
    updateAvailable: "يتوفر إصدار جديد من BootEase",
    viewRelease: "عرض الإصدار",
    sourceRepository: "المستودع الأصلي",
    rightsAndLicense: "الحقوق والترخيص",
    extractlyProduct: "BootEase منتج تابع لـ Extractly.vip",
    visitExtractly: "زيارة الموقع",
    developerCredit: "طُوّر بواسطة voidksa",
    ownedByExtractly: "مملوك وتتم صيانته بواسطة Extractly.vip",
    discoverExtractly: "اكتشف Extractly",
    confirmTitle: "تأكيد الإجراء",
    cancel: "إلغاء",
    confirm: "تأكيد",
    attributionNotice:
      "حقوق النشر © 2025–2026 محفوظة لـ Extractly.vip. مرخّص بموجب GNU GPLv3.",
    modifiedVersionsNotice:
      "يجب أن تحفظ النسخ المعدلة إشعار ملكية Extractly واسم المطور الأصلي ورابط المستودع، وأن توضّح تعديلاتها، وألا تدّعي أنها النسخة الرسمية.",
    viewLicense: "عرض رخصة GPLv3",
    close: "إغلاق",
    minimizeWindow: "تصغير النافذة",
    closeWindow: "إغلاق النافذة",
    themeSystem: "النظام",
    themeLight: "فاتح",
    themeDark: "داكن",
    switchLanguage: "Switch to English",
    unknown: "غير معروف",
    secureEnabled: "مفعّل",
    secureDisabled: "معطّل",
    secureUnsupported: "غير مدعوم",
    secureUnknown: "غير معروف",
    uefiDetected: "تم اكتشاف UEFI",
    legacyDetected: "تم اكتشاف Legacy BIOS",
    firmwareUnknown: "تعذر تحديد نمط البيوس",
    capturedAt: "آخر تحديث {time}",
    copied: "تم نسخ معلومات النظام إلى الحافظة.",
    saved: "تم حفظ معلومات النظام بنجاح.",
    saveCancelled: "تم إلغاء الحفظ.",
    systemInfoError: "تعذر تحميل معلومات النظام.",
    checkingUpdates: "جارٍ التحقق من التحديثات…",
    latestVersion: "أنت تستخدم أحدث إصدار.",
    updateCheckFailed: "تعذر التحقق من التحديثات.",
    permissionRequested: "بانتظار موافقة صلاحيات Windows…",
    explorerRestarted: "تمت إعادة تشغيل Windows Explorer بنجاح.",
    actionCancelled: "تم إلغاء الإجراء.",
    actionFailed: "تعذر إكمال الإجراء المطلوب.",
    confirmBios:
      "سيُعاد تشغيل الجهاز فورًا والدخول إلى إعدادات BIOS/UEFI. احفظ عملك قبل المتابعة.",
    confirmRecovery:
      "سيُعاد تشغيل الجهاز فورًا إلى بيئة استرداد Windows. احفظ عملك قبل المتابعة.",
    confirmExplorer:
      "سيختفي سطح المكتب وشريط المهام لوقت قصير أثناء إعادة تشغيل Windows Explorer.",
    confirmRestart:
      "سيُعاد تشغيل الجهاز فورًا. احفظ عملك قبل المتابعة.",
    versionWord: "الإصدار"
  }
} as const;

type TranslationKey = keyof (typeof translations)["en"];

const actionTranslationKeys: Record<
  ActionId,
  { name: TranslationKey; confirmation: TranslationKey }
> = {
  bios: { name: "actionBios", confirmation: "confirmBios" },
  recovery: { name: "actionRecovery", confirmation: "confirmRecovery" },
  explorer: { name: "actionExplorer", confirmation: "confirmExplorer" },
  restart: { name: "actionRestart", confirmation: "confirmRestart" }
};

const themeTranslationKeys: Record<ThemePreference, TranslationKey> = {
  system: "themeSystem",
  light: "themeLight",
  dark: "themeDark"
};

let language: Language = "en";
let themePreference: ThemePreference = "system";
let systemDark = false;
let selectedAction: ActionId = "bios";
let systemInfo: SystemInfo | undefined;
let appVersion = "2.0.0";
let toastTimer: number | undefined;

function element<T extends HTMLElement>(selector: string): T {
  const result = document.querySelector<T>(selector);
  if (!result) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return result;
}

function t(
  key: TranslationKey,
  values: Record<string, string> = {}
): string {
  let message: string = translations[language][key];
  for (const [name, value] of Object.entries(values)) {
    message = message.replaceAll(`{${name}}`, value);
  }
  return message;
}

function applyTheme(): void {
  const dark =
    themePreference === "dark" ||
    (themePreference === "system" && systemDark);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  element("#theme-label").textContent = t(
    themeTranslationKeys[themePreference]
  );
}

function applyLanguage(): void {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((target) => {
    const key = target.dataset.i18n as TranslationKey | undefined;
    if (key && key in translations[language]) {
      target.textContent = t(key);
    }
  });

  document
    .querySelectorAll<HTMLElement>("[data-i18n-aria-label]")
    .forEach((target) => {
      const key = target.dataset.i18nAriaLabel as TranslationKey | undefined;
      if (key && key in translations[language]) {
        target.setAttribute("aria-label", t(key));
      }
    });

  const languageLabel = element("#language-label");
  languageLabel.textContent = language === "ar" ? "English" : "العربية";
  element("#language-button").setAttribute("aria-label", t("switchLanguage"));
  element("#window-minimize").setAttribute(
    "aria-label",
    t("minimizeWindow")
  );
  element("#window-close").setAttribute("aria-label", t("closeWindow"));
  element("#about-version").textContent = `${t("versionWord")} ${appVersion}`;
  applyTheme();

  if (systemInfo) {
    renderSystemInfo(systemInfo);
  }

  const confirmationDialog = element<HTMLDialogElement>(
    "#confirmation-dialog"
  );
  if (confirmationDialog.open) {
    renderConfirmation();
  }
}

function displayValue(value: string): string {
  return value === "Unknown" || value.trim().length === 0 ? t("unknown") : value;
}

function combineHardwareName(manufacturer: string, model: string): string {
  const maker = displayValue(manufacturer);
  const product = displayValue(model);
  if (maker === t("unknown")) {
    return product;
  }
  if (product === t("unknown")) {
    return maker;
  }
  if (product.toLocaleLowerCase().startsWith(maker.toLocaleLowerCase())) {
    return product;
  }
  return `${maker} ${product}`;
}

function secureBootLabel(state: SecureBootState): string {
  const keys: Record<SecureBootState, TranslationKey> = {
    enabled: "secureEnabled",
    disabled: "secureDisabled",
    unsupported: "secureUnsupported",
    unknown: "secureUnknown"
  };
  return t(keys[state]);
}

function firmwareLabel(info: SystemInfo): string {
  if (info.biosMode === "UEFI") {
    return t("uefiDetected");
  }
  if (info.biosMode === "Legacy") {
    return t("legacyDetected");
  }
  return t("firmwareUnknown");
}

function renderSystemInfo(info: SystemInfo): void {
  const values = {
    "#device-value": combineHardwareName(info.manufacturer, info.model),
    "#motherboard-value": combineHardwareName(
      info.motherboardManufacturer,
      info.motherboardModel
    ),
    "#bios-version-value": displayValue(info.biosVersion),
    "#bios-mode-value": displayValue(info.biosMode),
    "#os-value": `${displayValue(info.osName)} · ${displayValue(info.architecture)}`
  };

  for (const [selector, value] of Object.entries(values)) {
    const target = element(selector);
    target.textContent = value;
    target.classList.remove("loading-value");
    target.setAttribute("dir", "auto");
    target.title = value;
  }

  const secureBoot = element("#secure-boot-value");
  secureBoot.textContent = secureBootLabel(info.secureBoot);
  secureBoot.className = `state-pill ${
    info.secureBoot === "enabled"
      ? "enabled"
      : info.secureBoot === "disabled"
        ? "disabled"
        : "neutral"
  }`;

  element("#firmware-hero-badge").textContent = firmwareLabel(info);
  const capturedAt = new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(info.capturedAt));
  element("#captured-at").textContent = t("capturedAt", { time: capturedAt });

  element<HTMLButtonElement>("#copy-button").disabled = false;
  element<HTMLButtonElement>("#save-button").disabled = false;
}

function setSystemInfoLoading(loading: boolean): void {
  const refreshButton = element<HTMLButtonElement>("#refresh-button");
  refreshButton.disabled = loading;
  refreshButton.classList.toggle("busy", loading);

  if (loading && !systemInfo) {
    element("#captured-at").textContent = t("loadingInformation");
  }
}

async function loadSystemInfo(): Promise<void> {
  setSystemInfoLoading(true);
  try {
    systemInfo = await window.bootEase.getSystemInfo();
    renderSystemInfo(systemInfo);
  } catch (error) {
    console.error(error);
    showToast(t("systemInfoError"));
  } finally {
    setSystemInfoLoading(false);
  }
}

function systemInfoReport(info: SystemInfo): string {
  const labels = {
    device: t("deviceModel"),
    motherboard: t("motherboard"),
    biosVersion: t("biosVersion"),
    biosMode: t("biosMode"),
    secureBoot: t("secureBoot"),
    operatingSystem: t("operatingSystem")
  };

  return [
    "BootEase — " + t("systemInformation"),
    "========================================",
    `${labels.device}: ${combineHardwareName(info.manufacturer, info.model)}`,
    `${labels.motherboard}: ${combineHardwareName(info.motherboardManufacturer, info.motherboardModel)}`,
    `${labels.biosVersion}: ${displayValue(info.biosVersion)}`,
    `${labels.biosMode}: ${displayValue(info.biosMode)}`,
    `${labels.secureBoot}: ${secureBootLabel(info.secureBoot)}`,
    `${labels.operatingSystem}: ${displayValue(info.osName)} (${displayValue(info.osVersion)}, ${displayValue(info.architecture)})`,
    "----------------------------------------",
    `BootEase ${appVersion}`,
    "https://github.com/voidksa/BootEase"
  ].join("\n");
}

function selectAction(action: ActionId): void {
  selectedAction = action;
  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
    const selected = button.dataset.action === action;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-checked", String(selected));
  });
}

function renderConfirmation(): void {
  const keys = actionTranslationKeys[selectedAction];
  element("#confirmation-message").textContent = t(keys.confirmation);
}

function showConfirmation(): void {
  renderConfirmation();
  const dialog = element<HTMLDialogElement>("#confirmation-dialog");
  if (!dialog.open) {
    dialog.showModal();
  }
}

async function executeSelectedAction(): Promise<void> {
  const dialog = element<HTMLDialogElement>("#confirmation-dialog");
  dialog.close();

  const executeButton = element<HTMLButtonElement>("#execute-button");
  const confirmButton = element<HTMLButtonElement>("#confirm-action-button");
  executeButton.disabled = true;
  confirmButton.disabled = true;
  showToast(t("permissionRequested"));

  try {
    const result = await window.bootEase.performAction(selectedAction);
    if (result.ok) {
      if (selectedAction === "explorer") {
        showToast(t("explorerRestarted"));
      }
      return;
    }

    showToast(
      result.errorCode === "cancelled" ? t("actionCancelled") : t("actionFailed")
    );
  } catch (error) {
    console.error(error);
    showToast(t("actionFailed"));
  } finally {
    executeButton.disabled = false;
    confirmButton.disabled = false;
  }
}

function showToast(message: string): void {
  const toast = element("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  if (toastTimer !== undefined) {
    window.clearTimeout(toastTimer);
  }
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3_200);
}

async function saveSettings(patch: Partial<AppSettings>): Promise<void> {
  try {
    const saved = await window.bootEase.updateSettings(patch);
    language = saved.language;
    themePreference = saved.theme;
  } catch (error) {
    console.error(error);
  }
}

async function cycleTheme(): Promise<void> {
  const order: ThemePreference[] = ["system", "light", "dark"];
  const currentIndex = order.indexOf(themePreference);
  themePreference = order[(currentIndex + 1) % order.length];
  if (themePreference !== "system") {
    systemDark = themePreference === "dark";
  }
  applyTheme();
  await saveSettings({ theme: themePreference });
}

async function toggleLanguage(): Promise<void> {
  language = language === "ar" ? "en" : "ar";
  applyLanguage();
  await saveSettings({ language });
}

async function checkForUpdates(manual: boolean): Promise<void> {
  const button = element<HTMLButtonElement>("#update-button");
  button.disabled = true;
  if (manual) {
    showToast(t("checkingUpdates"));
  }

  try {
    const update = await window.bootEase.checkForUpdates();
    if (update.available) {
      element("#update-version").textContent = `${update.currentVersion} → ${update.latestVersion}`;
      element<HTMLElement>("#update-banner").hidden = false;
    } else if (manual) {
      showToast(t("latestVersion"));
    }
  } catch (error) {
    console.error(error);
    if (manual) {
      showToast(t("updateCheckFailed"));
    }
  } finally {
    button.disabled = false;
  }
}

function bindEvents(): void {
  element("#window-minimize").addEventListener("click", () => {
    void window.bootEase.minimizeWindow();
  });
  element("#window-close").addEventListener("click", () => {
    void window.bootEase.closeWindow();
  });

  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action as ActionId;
      selectAction(action);
    });
  });

  element("#execute-button").addEventListener("click", showConfirmation);
  element("#cancel-action-button").addEventListener("click", () =>
    element<HTMLDialogElement>("#confirmation-dialog").close()
  );
  element("#confirm-action-button").addEventListener("click", () => {
    void executeSelectedAction();
  });

  element("#language-button").addEventListener("click", () => {
    void toggleLanguage();
  });
  element("#theme-button").addEventListener("click", () => {
    void cycleTheme();
  });
  element("#refresh-button").addEventListener("click", () => {
    void loadSystemInfo();
  });
  element("#update-button").addEventListener("click", () => {
    void checkForUpdates(true);
  });

  element("#copy-button").addEventListener("click", () => {
    if (!systemInfo) return;
    void window.bootEase
      .copyText(systemInfoReport(systemInfo))
      .then(() => showToast(t("copied")))
      .catch((error: unknown) => {
        console.error(error);
        showToast(t("actionFailed"));
      });
  });

  element("#save-button").addEventListener("click", () => {
    if (!systemInfo) return;
    void window.bootEase
      .saveSystemInfo(systemInfoReport(systemInfo))
      .then((result) => showToast(t(result.saved ? "saved" : "saveCancelled")))
      .catch((error: unknown) => {
        console.error(error);
        showToast(t("actionFailed"));
      });
  });

  const openRepository = () => window.bootEase.openExternal("repository");
  element("#repository-button").addEventListener("click", () => void openRepository());
  element("#about-repository-button").addEventListener(
    "click",
    () => void openRepository()
  );
  element("#license-button").addEventListener("click", () => {
    void window.bootEase.openExternal("license");
  });
  element("#open-release-button").addEventListener("click", () => {
    void window.bootEase.openExternal("releases");
  });
  const openExtractly = () => window.bootEase.openExternal("extractly");
  element("#extractly-button").addEventListener("click", () =>
    void openExtractly()
  );
  element("#about-extractly-button").addEventListener("click", () =>
    void openExtractly()
  );
  element("#support-button").addEventListener("click", () => {
    void window.bootEase.openExternal("support");
  });

  const aboutDialog = element<HTMLDialogElement>("#about-dialog");
  element("#about-button").addEventListener("click", () => aboutDialog.showModal());
  element("#close-about-button").addEventListener("click", () => aboutDialog.close());

  for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog")) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  }
}

async function initialize(): Promise<void> {
  bindEvents();
  try {
    const bootstrap = await window.bootEase.getBootstrap();
    language = bootstrap.settings.language;
    themePreference = bootstrap.settings.theme;
    systemDark = bootstrap.app.isDark;
    appVersion = bootstrap.app.version;
    element("#version-chip").textContent = `v${appVersion}`;
    applyLanguage();

    window.bootEase.onThemeChanged((isDark) => {
      systemDark = isDark;
      applyTheme();
    });

    await loadSystemInfo();
    window.setTimeout(() => void checkForUpdates(false), 1_500);
  } catch (error) {
    console.error(error);
    applyLanguage();
    showToast(t("systemInfoError"));
  }
}

void initialize();
