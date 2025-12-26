# BootEase 🚀

<div align="center">
  <img src="https://raw.githubusercontent.com/voidksa/BootEase/main/app.ico" alt="BootEase Logo" width="128" height="128" />
  <br>
  <p><b>One-Click BIOS/UEFI Entry Utility for Windows</b></p>
  
  <p>
    <a href="README.md">English</a> | <a href="README_AR.md">العربية</a>
  </p>
</div>

**BootEase** is a lightweight, modern Windows utility designed to restart your computer and automatically enter the **BIOS/UEFI** firmware settings with a single click. No need to spam F2, DEL, or ESC keys anymore!

## ✨ Features

<div align="center">
  <img src="https://raw.githubusercontent.com/voidksa/BootEase/main/screenshots/app_en.png" alt="BootEase Application" width="45%" />
  <img src="https://raw.githubusercontent.com/voidksa/BootEase/main/screenshots/setup_en.png" alt="BootEase Installer" width="45%" />
</div>

- **One-Click BIOS Entry**: Instantly restart and boot directly into UEFI settings.
- **UEFI Detection**: Automatically detects if your system supports UEFI.
- **Admin Elevation**: Auto-requests necessary privileges to perform firmware commands.
- **Modern UI**: Clean, minimalist interface built with WPF (supports English & Arabic).
- **Safety First**: Confirmation dialog prevents accidental restarts.
- **Portable & Installer**: Available as a standalone executable or a full installer.

## 🛠️ Installation

You can download the latest installer from the [Releases](https://github.com/voidksa/BootEase/releases) page.

1. Download `BootEaseSetup.exe`.
2. Run the installer.
3. You can switch the installer language (English/Arabic) using the button in the top corner.
4. Launch **BootEase** from your desktop or start menu.

## ⚖️ License & Legal

**This project is protected under the GNU General Public License v3.0 (GPLv3).**

### What this means:
- ✅ **You CAN**: Use this software, modify it, fork it, and distribute your own versions.
- ❌ **You CANNOT**: Close the source code. Any modifications or forks **MUST** remain open-source under the same GPLv3 license.
- ❌ **You CANNOT**: Sell this software as a proprietary product without providing the source code.

This ensures that **BootEase** remains free and open for everyone.

## 🏗️ Build from Source

Requirements:
- .NET 8.0 SDK
- Visual Studio 2022

```powershell
# Clone the repository
git clone https://github.com/voidksa/BootEase.git

# Navigate to the project
cd BootEase

# Build the project
dotnet build BootEase.csproj -c Release

# To build the self-contained installer (optional)
# See the build scripts or instructions in README_AR.md for detailed steps.
```

## 🤝 Contributing

Contributions are welcome!
1. **Fork** the repository.
2. Create a new branch.
3. Commit your changes.
4. Push to the branch.
5. Open a **Pull Request**.
