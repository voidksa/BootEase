# BootEase 🚀

<div align="center">
  <img src="https://raw.githubusercontent.com/voidksa/BootEase/main/app.ico" alt="BootEase Logo" width="128" height="128" />
  <br>
  <p><b>One-Click BIOS/UEFI Entry Utility for Windows</b></p>
  
  <p>
    <a href="https://github.com/voidksa/BootEase/releases/latest">
      <img src="https://img.shields.io/github/v/release/voidksa/BootEase?style=for-the-badge&label=Download%20Latest&color=success" alt="Download Latest Release" />
    </a>
  </p>

  <p>
    <a href="README.md">English</a> | <a href="README_AR.md">العربية</a>
  </p>
</div>

**BootEase** is a lightweight, modern Windows utility designed to restart your computer and automatically enter the **BIOS/UEFI** firmware settings with a single click. No need to spam F2, DEL, or ESC keys anymore!

## ✨ Features

<div align="center">
  <img src="https://raw.githubusercontent.com/voidksa/BootEase/main/screenshots/app_en.png" alt="BootEase Application" width="70%" />
</div>

- **One-Click BIOS Entry**: Instantly restart and boot directly into UEFI settings.
- **Advanced Power Menu**: Options to restart to **Recovery Mode (Safe Mode)**, **BIOS**, or just restart **Windows Explorer**.
- **System Information**: Displays detailed info including **BIOS Version**, **BIOS Mode** (UEFI/Legacy), **Secure Boot** status, and **Motherboard Model**.
- **Dark/Light Mode**: Toggle between themes with a single click.
- **UEFI Detection**: Automatically detects if your system supports UEFI.
- **Command Line Support**: Supports arguments `/bios`, `/safe`, and `/recovery` for automation/shortcuts.
- **Admin Elevation**: Auto-requests necessary privileges to perform firmware commands.
- **Modern UI**: Clean, card-based interface built with WPF (supports English & Arabic).
- **Portable & Installer**: Available as a standalone executable or a full installer with uninstallation support.

## 🛠️ Installation

You can download the latest installer from the [Releases](https://github.com/voidksa/BootEase/releases) page.

1. Download `BootEaseSetup.exe`.
2. Run the installer.
3. You can switch the installer language (English/Arabic) using the button in the top corner.
4. Launch **BootEase** from your desktop or start menu.

## ⚖️ License & Attribution (Important)

**This project is protected under the GNU General Public License v3.0 (GPLv3) with additional attribution terms.**

### Terms of Use & Modification:
1.  ✅ **Right to Modify:** You are free to fork, modify, and improve the source code.
2.  ✅ **Contributor Credit:** You may add your name as a "Contributor" or "Modifier" to your own forked version.
3.  ⛔ **Mandatory Attribution:** You **MUST NOT** remove the original repository link (GitHub) or the original author's name from the software UI or documentation.
4.  ⛔ **No Impersonation:** You cannot present a fork as the "Official Version" or claim original ownership. Forks must be clearly labeled as **"Unofficial / Modified"**.
5.  ⛔ **Stay Open:** Any modifications must remain Open Source under GPLv3. You cannot close the source or sell it as a proprietary product.

**In short:** Fork and improve as you wish, but do not steal credit, and keep the original source link visible.

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
```

## 🤝 Contributing

Contributions are welcome!
1. **Fork** the repository.
2. Create a new branch.
3. Commit your changes.
4. Push to the branch.
5. Open a **Pull Request**.
