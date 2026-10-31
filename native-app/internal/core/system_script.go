package core

const SystemInfoScript = `
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
    $secureBoot = 'unknown'
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
`
