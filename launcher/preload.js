'use strict';

/**
 * HorecaAI Electron Launcher - Preload Script
 *
 * Secure bridge between the main process and renderer pages.
 * Only exposes the specific APIs needed by each renderer.
 * contextIsolation: true  /  nodeIntegration: false
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('horeca', {
  // ── Splash screen ──────────────────────────────────────────────────────────
  onProgress:      (cb) => ipcRenderer.on('progress',       (_e, v) => cb(v)),
  onServerReady:   (cb) => ipcRenderer.on('server-ready',   (_e)    => cb()),
  onServerTimeout: (cb) => ipcRenderer.on('server-timeout', (_e)    => cb()),

  // ── PIN pad ────────────────────────────────────────────────────────────────
  submitPin: (pin) => ipcRenderer.invoke('submit-pin', pin),

  // Navigate to app after successful PIN (main process handles window creation)
  openApp: (role) => ipcRenderer.send('navigate-to-app', { role }),

  // ── Auto-lock overlay (main window) ───────────────────────────────────────
  onShowLockOverlay: (cb) => ipcRenderer.on('show-lock-overlay', (_e) => cb()),
  verifyLockPin: (pin) => ipcRenderer.invoke('verify-lock-pin', pin),
  unlockOverlay: () => ipcRenderer.send('unlock-overlay'),
});

