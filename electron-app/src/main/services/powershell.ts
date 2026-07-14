import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function powershellPath(): string {
  const systemRoot = process.env.SystemRoot ?? "C:\\Windows";
  return path.join(
    systemRoot,
    "System32",
    "WindowsPowerShell",
    "v1.0",
    "powershell.exe"
  );
}

export async function runPowerShell(
  script: string,
  timeout = 15_000
): Promise<string> {
  if (process.platform !== "win32") {
    throw new Error("Windows PowerShell is only available on Windows.");
  }

  const encodedCommand = Buffer.from(script, "utf16le").toString("base64");
  const { stdout } = await execFileAsync(
    powershellPath(),
    [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-EncodedCommand",
      encodedCommand
    ],
    {
      encoding: "utf8",
      windowsHide: true,
      timeout,
      maxBuffer: 1024 * 1024
    }
  );

  return stdout.trim();
}
