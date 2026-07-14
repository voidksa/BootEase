import type { ActionId, ActionResult } from "../../shared/contracts";
import { runPowerShell } from "./powershell";

const shutdownArguments: Partial<Record<ActionId, readonly string[]>> = {
  bios: ["/r", "/fw", "/t", "0"],
  recovery: ["/r", "/o", "/t", "0"],
  restart: ["/r", "/t", "0"]
};

function quotePowerShellLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

async function runElevatedShutdown(arguments_: readonly string[]): Promise<void> {
  const argumentList = arguments_.map(quotePowerShellLiteral).join(", ");
  const script = String.raw`
$ErrorActionPreference = 'Stop'
$shutdown = Join-Path $env:SystemRoot 'System32\shutdown.exe'
Start-Process -FilePath $shutdown -ArgumentList @(${argumentList}) -Verb RunAs -WindowStyle Hidden
`;

  await runPowerShell(script, 30_000);
}

async function restartExplorer(): Promise<void> {
  const script = String.raw`
$ErrorActionPreference = 'Stop'
Get-Process -Name explorer -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 400
Start-Process -FilePath (Join-Path $env:SystemRoot 'explorer.exe')
`;

  await runPowerShell(script, 15_000);
}

function wasCancelled(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /cancelled|canceled|1223/i.test(message);
}

export async function performPowerAction(action: ActionId): Promise<ActionResult> {
  if (process.platform !== "win32") {
    return {
      ok: false,
      action,
      errorCode: "unsupported-platform"
    };
  }

  try {
    if (action === "explorer") {
      await restartExplorer();
    } else {
      const arguments_ = shutdownArguments[action];
      if (!arguments_) {
        throw new Error("Unsupported power action.");
      }
      await runElevatedShutdown(arguments_);
    }

    return { ok: true, action };
  } catch (error) {
    console.error(`Power action '${action}' failed:`, error);
    return {
      ok: false,
      action,
      errorCode: wasCancelled(error) ? "cancelled" : "failed",
      message: error instanceof Error ? error.message : String(error)
    };
  }
}
