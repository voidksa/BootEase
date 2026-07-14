import os from "node:os";
import type {
  BiosMode,
  SecureBootState,
  SystemInfo
} from "../../shared/contracts";
import { runPowerShell } from "./powershell";

interface PowerShellSystemInfo {
  Manufacturer?: unknown;
  Model?: unknown;
  MotherboardManufacturer?: unknown;
  MotherboardModel?: unknown;
  BiosVersion?: unknown;
  BiosMode?: unknown;
  SecureBoot?: unknown;
  OsName?: unknown;
  OsVersion?: unknown;
  Architecture?: unknown;
}

const SYSTEM_INFO_SCRIPT = String.raw`
$ErrorActionPreference = 'SilentlyContinue'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$computer = Get-CimInstance -ClassName Win32_ComputerSystem
$bios = Get-CimInstance -ClassName Win32_BIOS
$board = Get-CimInstance -ClassName Win32_BaseBoard
$operatingSystem = Get-CimInstance -ClassName Win32_OperatingSystem

$firmwareMode = 'Unknown'
try {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
namespace BootEase.Native {
  public static class Firmware {
    [DllImport("kernel32.dll")]
    public static extern bool GetFirmwareType(out uint firmwareType);
  }
}
'@
  [uint32]$firmwareType = 0
  if ([BootEase.Native.Firmware]::GetFirmwareType([ref]$firmwareType)) {
    if ($firmwareType -eq 2) { $firmwareMode = 'UEFI' }
    elseif ($firmwareType -eq 1) { $firmwareMode = 'Legacy' }
  }
} catch {}

$secureBoot = 'unknown'
if ($firmwareMode -eq 'Legacy') {
  $secureBoot = 'unsupported'
} else {
  try {
    $secureBootValue = (Get-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\SecureBoot\State' -Name UEFISecureBootEnabled -ErrorAction Stop).UEFISecureBootEnabled
    if ($secureBootValue -eq 1) { $secureBoot = 'enabled' }
    else { $secureBoot = 'disabled' }
  } catch {
    if ($firmwareMode -eq 'UEFI') { $secureBoot = 'disabled' }
  }
}

[pscustomobject]@{
  Manufacturer = $computer.Manufacturer
  Model = $computer.Model
  MotherboardManufacturer = $board.Manufacturer
  MotherboardModel = $board.Product
  BiosVersion = $bios.SMBIOSBIOSVersion
  BiosMode = $firmwareMode
  SecureBoot = $secureBoot
  OsName = $operatingSystem.Caption
  OsVersion = $operatingSystem.Version
  Architecture = $operatingSystem.OSArchitecture
} | ConvertTo-Json -Compress
`;

function text(value: unknown, fallback = "Unknown"): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function biosMode(value: unknown): BiosMode {
  return value === "UEFI" || value === "Legacy" ? value : "Unknown";
}

function secureBoot(value: unknown): SecureBootState {
  return value === "enabled" ||
    value === "disabled" ||
    value === "unsupported"
    ? value
    : "unknown";
}

export function normalizeSystemInfo(
  raw: PowerShellSystemInfo,
  capturedAt = new Date().toISOString()
): SystemInfo {
  return {
    manufacturer: text(raw.Manufacturer),
    model: text(raw.Model),
    motherboardManufacturer: text(raw.MotherboardManufacturer),
    motherboardModel: text(raw.MotherboardModel),
    biosVersion: text(raw.BiosVersion),
    biosMode: biosMode(raw.BiosMode),
    secureBoot: secureBoot(raw.SecureBoot),
    osName: text(raw.OsName, "Windows"),
    osVersion: text(raw.OsVersion),
    architecture: text(raw.Architecture, os.arch()),
    capturedAt
  };
}

function fallbackSystemInfo(): SystemInfo {
  return normalizeSystemInfo({
    Manufacturer: os.hostname(),
    Model: "Unknown",
    MotherboardManufacturer: "Unknown",
    MotherboardModel: "Unknown",
    BiosVersion: "Unknown",
    BiosMode: "Unknown",
    SecureBoot: "unknown",
    OsName: os.type(),
    OsVersion: os.release(),
    Architecture: os.arch()
  });
}

export async function getSystemInfo(): Promise<SystemInfo> {
  if (process.platform !== "win32") {
    return fallbackSystemInfo();
  }

  try {
    const output = await runPowerShell(SYSTEM_INFO_SCRIPT, 20_000);
    const raw = JSON.parse(output) as PowerShellSystemInfo;
    return normalizeSystemInfo(raw);
  } catch (error) {
    console.error("Failed to collect Windows system information:", error);
    return fallbackSystemInfo();
  }
}
