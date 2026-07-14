import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testDirectory = fileURLToPath(new URL(".", import.meta.url));
const appRoot = path.resolve(testDirectory, "..");
const repositoryRoot = path.resolve(appRoot, "..");

function source(relativePath: string): string {
  return readFileSync(path.join(appRoot, relativePath), "utf8");
}

describe("Extractly ownership and promotion", () => {
  it("packages the Extractly mark and keeps the canonical links allowlisted", () => {
    const mark = path.join(
      appRoot,
      "src",
      "renderer",
      "public",
      "extractly-mark.png"
    );
    expect(statSync(mark).size).toBeGreaterThan(10_000);

    const ipc = source("src/main/ipc.ts");
    expect(ipc).toContain('extractly: "https://extractly.vip/"');
    expect(ipc).toContain('support: "mailto:support@extractly.vip"');
  });

  it("shows ownership in the persistent UI and legal notice", () => {
    const html = source("src/renderer/index.html");
    const notice = readFileSync(path.join(repositoryRoot, "NOTICE.md"), "utf8");

    expect(html).toContain("extractly-mark.png");
    expect(html).toContain('data-i18n="extractlyProduct"');
    expect(html).toContain('id="extractly-button"');
    expect(notice).toContain("owned and maintained by Extractly.vip");
    expect(notice).toContain("Original developer: voidksa");
  });
});

describe("desktop layout contracts", () => {
  it("uses compact custom controls and disables maximize/full screen", () => {
    const main = source("src/main/index.ts");
    const html = source("src/renderer/index.html");
    expect(main).toContain("frame: false");
    expect(main).toContain("maximizable: false");
    expect(main).toContain("fullscreenable: false");
    expect(main).toContain('app.setName(APP_NAME)');
    expect(main).toContain('app.setAppUserModelId(APP_ID)');
    expect(main).toContain('icon: path.join(rendererRoot(), "app_icon.png")');
    expect(html).toContain('id="window-minimize"');
    expect(html).toContain('id="window-close"');

    const minimizeTag = html.match(
      /<button[^>]*id="window-minimize"[^>]*>/
    )?.[0];
    const closeTag = html.match(/<button[^>]*id="window-close"[^>]*>/)?.[0];
    expect(minimizeTag).not.toContain("title=");
    expect(closeTag).not.toContain("title=");
  });

  it("allows selection only for system information values", () => {
    const css = source("src/renderer/styles.css");
    expect(css).toMatch(/body\s*\{[\s\S]*?user-select:\s*none/);
    expect(css).toMatch(/\.info-value\s*\{[\s\S]*?user-select:\s*text/);
    expect(css).toMatch(/\.dashboard-grid\s*\{[\s\S]*?align-items:\s*start/);
  });
});
