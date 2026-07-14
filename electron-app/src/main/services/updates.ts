import { app, net } from "electron";
import type { UpdateInfo } from "../../shared/contracts";
import { compareVersions } from "../../shared/version";

const RELEASES_API =
  "https://api.github.com/repos/voidksa/BootEase/releases/latest";
const RELEASES_URL = "https://github.com/voidksa/BootEase/releases/latest";

interface GitHubRelease {
  tag_name?: unknown;
  html_url?: unknown;
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  const currentVersion = app.getVersion();
  const response = await net.fetch(RELEASES_API, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": `BootEase/${currentVersion}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub update check failed with HTTP ${response.status}.`);
  }

  const release = (await response.json()) as GitHubRelease;
  const latestVersion =
    typeof release.tag_name === "string" ? release.tag_name : currentVersion;
  const releaseUrl =
    typeof release.html_url === "string" ? release.html_url : RELEASES_URL;

  return {
    currentVersion,
    latestVersion,
    available: compareVersions(latestVersion, currentVersion) > 0,
    releaseUrl
  };
}
