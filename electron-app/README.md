# BootEase Electron application

This directory contains the BootEase 2.x desktop application for Windows,
an [Extractly.vip](https://extractly.vip/) product developed by voidksa.
The renderer is built with TypeScript and Vite, while privileged Windows
operations remain in Electron's main process behind a narrow IPC allowlist.

## Requirements

- Windows 10 or Windows 11 (x64)
- Node.js 22 or newer
- npm 11 or newer

## Development

```powershell
cd electron-app
npm install
npm start
```

## Validation

```powershell
npm test
npm run build
```

## Windows packages

```powershell
# Unpacked application for local testing
npm run pack:win

# NSIS installer and portable executable
npm run dist:win
```

Generated output is written to `release/` and is intentionally ignored by
Git. The application runs as the current user and requests UAC elevation only
when a selected Windows restart action requires it.

## Security model

- Renderer sandboxing and context isolation are enabled.
- Node.js integration is disabled in the renderer.
- The preload exposes one method per allowed operation.
- IPC senders and payloads are validated in the main process.
- Navigation, popups, webviews, and permission requests are blocked.
- External links use a fixed allowlist.

Copyright (C) 2025-2026 Extractly.vip. See `../LICENSE` and
`../NOTICE.md`. Product support: support@extractly.vip.
