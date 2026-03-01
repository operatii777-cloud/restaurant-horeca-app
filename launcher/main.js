'use strict';

/**
 * HorecaAI Electron Launcher - Main Process
 *
 * Starts the Node.js server as a child process, shows a splash screen
 * while waiting for the server to become ready, then shows a PIN screen
 * for authentication. After successful login it loads the appropriate URL
 * based on the user role and enforces an inactivity auto-lock.
 */

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ── Configuration ────────────────────────────────────────────────────────────
const SERVER_PORT = 3001;
const SERVER_URL  = `http://localhost:${SERVER_PORT}`;
const ADMIN_URL   = `${SERVER_URL}/admin-vite/`;
const POS_URL     = `${SERVER_URL}/admin-vite/kiosk/pos-split`;
// Path to the server directory (one level up from launcher/)
const SERVER_DIR  = path.join(__dirname, '..', 'restaurant_app_v3_translation_system', 'server');
const LOG_FILE    = path.join(__dirname, 'logs', 'error.log');
// Use 'start' in production, 'dev' in development
const SERVER_CMD  = process.env.NODE_ENV === 'production' ? 'start' : 'dev';

// Ensure logs directory exists
fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });

// ── State ────────────────────────────────────────────────────────────────────
let splashWin      = null;
let mainWin        = null;
let serverProcess  = null;
let currentRole    = null;
let autoLockTimer  = null;
let autoLockSecs   = 60;

// ── Logging ──────────────────────────────────────────────────────────────────
function logError(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.error(msg);
}

// ── Single-instance lock ─────────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWin) { mainWin.focus(); } else if (splashWin) { splashWin.focus(); }
  });
}

// ── Server management ────────────────────────────────────────────────────────
function startServer() {
  if (serverProcess) return;
  try {
    serverProcess = spawn('npm', ['run', SERVER_CMD], {
      cwd: SERVER_DIR,
      shell: true,
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    serverProcess.stdout.on('data', (d) => console.log('[server]', d.toString().trim()));
    serverProcess.stderr.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg) logError('[server stderr] ' + msg);
    });
    serverProcess.on('error', (err) => logError('Server spawn error: ' + err.message));
    serverProcess.on('exit', (code) => console.log('[server] exited with code', code));
  } catch (err) {
    logError('Failed to start server: ' + err.message);
  }
}

function stopServer() {
  if (!serverProcess) return;
  try {
    serverProcess.kill('SIGTERM');
    setTimeout(() => {
      try { serverProcess.kill('SIGKILL'); } catch (_) {}
    }, 3000);
    serverProcess = null;
  } catch (err) {
    logError('Error stopping server: ' + err.message);
  }
}

// ── Wait for server ──────────────────────────────────────────────────────────
function waitForServer(onReady, onTimeout) {
  const maxMs   = 30000;
  const interval = 500;
  let elapsed   = 0;

  function check() {
    elapsed += interval;
    if (elapsed > maxMs) { onTimeout(); return; }
    const req = http.get(`${SERVER_URL}/health`, (res) => {
      if (res.statusCode < 500) { onReady(); }
      else { setTimeout(check, interval); }
    });
    req.on('error', () => setTimeout(check, interval));
    req.setTimeout(400, () => { req.destroy(); setTimeout(check, interval); });
  }
  setTimeout(check, interval);
}

// ── Window helpers ───────────────────────────────────────────────────────────
function createSplashWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  splashWin = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    fullscreen: true,
    frame: false,
    resizable: false,
    show: false,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  splashWin.loadFile(path.join(__dirname, 'renderer', 'splash.html'));
  splashWin.once('ready-to-show', () => splashWin.show());
  splashWin.on('closed', () => { splashWin = null; });
}

function createPinWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const pinWin = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    fullscreen: true,
    frame: false,
    resizable: false,
    show: false,
    backgroundColor: '#0f0f23',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  pinWin.loadFile(path.join(__dirname, 'renderer', 'pinpad.html'));
  pinWin.once('ready-to-show', () => {
    pinWin.show();
    if (splashWin) { splashWin.close(); splashWin = null; }
  });
  return pinWin;
}

function createMainWindow(url, role) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWin = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    fullscreen: true,
    frame: false,
    resizable: false,
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWin.loadURL(url);
  mainWin.once('ready-to-show', () => {
    mainWin.show();
    injectRoleCSS(role);
    startAutoLockTimer();
  });
  mainWin.on('closed', () => { mainWin = null; });

  // Track user activity to reset inactivity timer
  mainWin.webContents.on('before-input-event', resetAutoLock);
  mainWin.webContents.on('cursor-changed', resetAutoLock);
}

// ── Role-based sidebar filtering ─────────────────────────────────────────────
function injectRoleCSS(role) {
  if (!mainWin || !mainWin.webContents) return;
  // Store role in page for renderer access
  mainWin.webContents.executeJavaScript(
    `window.__horeca_role = ${JSON.stringify(role)};`
  ).catch(() => {});

  if (role === 'ospatar') {
    // Ospătar sees ONLY: POS Vânzare, KDS Bucătărie, KDS Bar
    const css = `
      /* Hide all sidebar items then reveal allowed ones */
      [data-sidebar-item]:not([data-sidebar-item="pos"]):not([data-sidebar-item="kds-kitchen"]):not([data-sidebar-item="kds-bar"]) {
        display: none !important;
      }
    `;
    mainWin.webContents.insertCSS(css).catch(() => {});
  }
  // Manager sees full sidebar - no filtering needed
}

// ── Auto-lock ────────────────────────────────────────────────────────────────
function startAutoLockTimer() {
  clearTimeout(autoLockTimer);
  autoLockTimer = setTimeout(() => triggerAutoLock(), autoLockSecs * 1000);
}

function resetAutoLock() {
  if (autoLockTimer) startAutoLockTimer();
}

function triggerAutoLock() {
  if (!mainWin || !mainWin.webContents) return;
  mainWin.webContents.send('show-lock-overlay');
}

// ── IPC handlers ─────────────────────────────────────────────────────────────

// Splash screen tells us the server is ready → show PIN
ipcMain.on('server-ready', () => {
  createPinWindow();
});

// Splash screen progress updates
ipcMain.handle('get-server-status', async () => {
  return new Promise((resolve) => {
    const req = http.get(`${SERVER_URL}/health`, (res) => {
      resolve(res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(400, () => { req.destroy(); resolve(false); });
  });
});

// PIN submission from pinpad
ipcMain.handle('submit-pin', async (event, pin) => {
  try {
    const result = await fetch(`${SERVER_URL}/api/auth/pin/direct-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await result.json();
    if (!data.success) {
      return { success: false, message: data.message || 'PIN incorect' };
    }
    currentRole   = data.role;
    autoLockSecs  = data.autoLockSeconds || 60;
    return { success: true, role: data.role, userName: data.userName };
  } catch (err) {
    return { success: false, message: 'Server unavailable' };
  }
});

// Navigate to app after successful PIN
ipcMain.on('navigate-to-app', (event, { role }) => {
  const url = role === 'admin' ? ADMIN_URL : POS_URL;
  // Close all existing windows except the one that sent the message
  const sender = BrowserWindow.fromWebContents(event.sender);
  createMainWindow(url, role);
  if (sender && !sender.isDestroyed()) {
    setTimeout(() => { try { sender.close(); } catch (_) {} }, 300);
  }
});

// Auto-lock PIN verification (overlay in main window)
ipcMain.handle('verify-lock-pin', async (event, pin) => {
  try {
    const result = await fetch(`${SERVER_URL}/api/auth/pin/direct-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await result.json();
    if (data.success && data.role === currentRole) {
      startAutoLockTimer();
      return { success: true };
    }
    return { success: false, message: 'PIN incorect' };
  } catch (err) {
    return { success: false, message: 'Server unavailable' };
  }
});

// Unlock after overlay
ipcMain.on('unlock-overlay', () => {
  startAutoLockTimer();
});

// ── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createSplashWindow();
  startServer();

  // Start polling for server readiness and forward progress to splash
  let elapsed = 0;
  const interval = 500;
  const maxMs = 30000;
  const ticker = setInterval(() => {
    elapsed += interval;
    const progress = Math.min(elapsed / maxMs, 0.95);
    if (splashWin && !splashWin.isDestroyed()) {
      splashWin.webContents.send('progress', progress);
    }
    const req = http.get(`${SERVER_URL}/health`, (res) => {
      if (res.statusCode < 500) {
        clearInterval(ticker);
        if (splashWin && !splashWin.isDestroyed()) {
          splashWin.webContents.send('progress', 1);
          splashWin.webContents.send('server-ready');
        }
      }
    });
    req.on('error', () => {});
    req.setTimeout(400, () => { try { req.destroy(); } catch (_) {} });

    if (elapsed >= maxMs) {
      clearInterval(ticker);
      logError('Server did not start within 30 seconds');
      if (splashWin && !splashWin.isDestroyed()) {
        splashWin.webContents.send('server-timeout');
      }
    }
  }, interval);
});

app.on('window-all-closed', () => {
  stopServer();
  app.quit();
});

app.on('before-quit', () => {
  clearTimeout(autoLockTimer);
  stopServer();
});
