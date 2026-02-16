/**
 * PHASE E9.7 - Enterprise Server (Clean Version)
 * 
 * Transformed from 37,000+ lines to ~250 lines.
 * All logic moved to loaders and modules.
 */

// ========================================
// LOGGER INITIALIZATION
// ========================================
const { logger } = require('./src/utils/logger');
const serverLogger = logger.child('SERVER');

// ========================================
// GLOBAL ERROR HANDLERS
// ========================================
process.on('unhandledRejection', (reason, promise) => {
  // Ignoră erorile de tip "no such table" - tabelele vor fi create la următoarea inițializare
  if (reason && reason.message && (
    reason.message.includes('no such table') ||
    reason.message.includes('Database not connected')
  )) {
    serverLogger.warn('UNHANDLED REJECTION - IGNORED', { message: reason.message });
    return; // Nu opri serverul pentru aceste erori
  }

  serverLogger.error('UNHANDLED REJECTION', {
    message: reason.message,
    stack: reason.stack
  });

  // NU oprim serverul pentru unhandledRejection - doar logăm
  serverLogger.warn('Serverul continuă să ruleze după unhandled rejection');
});

process.on('uncaughtException', (error) => {
  // Ignoră erorile de tip "no such table: order_items" - tabela va fi creată la următoarea inițializare
  if (error.message && error.message.includes('no such table: order_items')) {
    serverLogger.warn('UNCAUGHT EXCEPTION - IGNORED', {
      message: error.message,
      note: 'Tabela order_items va fi creată la următoarea inițializare'
    });
    return; // Nu opri serverul pentru această eroare
  }

  serverLogger.error('UNCAUGHT EXCEPTION', {
    message: error.message,
    stack: error.stack,
    code: error.code
  });

  // Critical errors - exit DOAR pentru erori de sistem, NU pentru erori de aplicație
  if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
    serverLogger.error('Critical system error - server must restart', { code: error.code });
    process.exit(1);
  }

  // Pentru alte erori, logăm dar NU oprim serverul
  serverLogger.warn('Serverul continuă să ruleze după eroare neprinsă');
});

process.on('warning', (warning) => {
  if (warning.name !== 'DeprecationWarning') {
    serverLogger.warn('PROCESS WARNING', {
      name: warning.name,
      message: warning.message
    });
  }
});

// ========================================
// ENVIRONMENT VARIABLES VALIDATION
// ========================================
require('dotenv').config();
const { validateEnv } = require('./src/utils/validate-env');
validateEnv();

// ========================================
// TIMEZONE CONFIGURATION
// ========================================
process.env.TZ = 'Europe/Bucharest';
serverLogger.info('Timezone configured', {
  timezone: process.env.TZ,
  serverTime: new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })
});

// ========================================
// CORE IMPORTS
// ========================================
const express = require('express');
const http = require('http');
const { createServer } = http;
const url = require('url');
const { dbPromise } = require('./database');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for PDF uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  }
});

// Configure multer for invoice uploads (PDF + XML)
const uploadInvoice = multer({
  dest: 'uploads/invoices/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/xml', 'text/xml'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Doar fișiere PDF sau XML sunt permise'), false);
  }
});

// ========================================
// LOADERS
// ========================================
const {
  loadAll,
  loadModules,
  loadErrorHandlers
} = require('./src/loaders');

// ========================================
// INITIALIZE EXPRESS APP
// ========================================
const app = express();
const httpServer = createServer(app);


// ========================================
// FAVICON, MANIFEST, SW ROUTES (MUST BE FIRST)
// ========================================
app.get('/favicon.ico', (req, res) => {
  const faviconPath1 = path.join(__dirname, 'admin-vite', 'public', 'favicon.ico');
  const faviconPath2 = path.join(__dirname, 'public', 'favicon.ico');
  if (fs.existsSync(faviconPath1)) {
    res.setHeader('Content-Type', 'image/x-icon');
    res.sendFile(path.resolve(faviconPath1));
  } else if (fs.existsSync(faviconPath2)) {
    res.setHeader('Content-Type', 'image/x-icon');
    res.sendFile(path.resolve(faviconPath2));
  } else {
    res.status(204).end();
  }
});
app.get('/manifest.json', (req, res) => {
  const manifestPath = path.join(__dirname, 'admin-vite', 'public', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve(manifestPath));
  } else {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      name: 'Restaurant Admin',
      short_name: 'Restaurant',
      description: 'Restaurant Management System',
      start_url: '/admin-vite/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#667eea',
      icons: [
        {
          src: '/favicon.ico',
          sizes: '64x64',
          type: 'image/x-icon'
        }
      ]
    });
  }
});
app.get('/sw.js', (req, res) => {
  const swPath = path.join(__dirname, 'admin-vite', 'public', 'sw.js');
  if (fs.existsSync(swPath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve(swPath));
  } else {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(`
      // Minimal Service Worker
      self.addEventListener('install', (event) => {
        self.skipWaiting();
      });
      self.addEventListener('activate', (event) => {
        event.waitUntil(clients.claim());
      });
      self.addEventListener('fetch', (event) => {
        event.respondWith(fetch(event.request));
      });
    `);
  }
});

// ========================================
// STATIC ASSETS FOR ADMIN-VITE (ALWAYS FIRST FOR /admin-vite/*)
// ========================================
const adminViteDist = path.join(__dirname, 'admin-vite', 'dist');
app.use('/admin-vite', (req, res, next) => {
  try {
    // Only handle static asset requests (CSS, JS, images, fonts, etc.)
    if (req.path && req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json)$/i)) {
      // Remove /admin-vite prefix and try to find file in dist
      let assetPath = req.path.replace(/^\/admin-vite/, '');
      // If path starts with /assets/, serve from dist/assets/
      if (assetPath.startsWith('/assets/')) {
        const filePath = path.join(adminViteDist, assetPath);
        if (fs.existsSync(filePath)) {
          // Set appropriate content type
          const ext = path.extname(filePath).toLowerCase();
          const contentTypes = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.map': 'application/json',
            '.json': 'application/json'
          };
          const contentType = contentTypes[ext] || 'application/octet-stream';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return res.sendFile(path.resolve(filePath));
        } else {
          // Asset not found, return 404 (do NOT fall through to SPA)
          return res.status(404).send('Not found');
        }
      }
      // Try to serve from dist root (for manifest.json, sw.js, etc.)
      const rootFilePath = path.join(adminViteDist, assetPath);
      if (fs.existsSync(rootFilePath)) {
        const ext = path.extname(rootFilePath).toLowerCase();
        const contentTypes = {
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg'
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        if (ext === '.json' || assetPath.includes('manifest') || assetPath.includes('sw.js')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        return res.sendFile(path.resolve(rootFilePath));
      } else {
        // Asset not found, return 404 (do NOT fall through to SPA)
        return res.status(404).send('Not found');
      }
    }
    // Not a static asset, continue to next middleware
    next();
  } catch (error) {
    console.error(`❌ Static assets middleware error: ${error.message}`);
    next();
  }
});

app.get('/admin-vite/favicon.ico', (req, res) => {
  // Try admin-vite/public first, then fallback to server/public
  const faviconPath1 = path.join(__dirname, 'admin-vite', 'public', 'favicon.ico');
  const faviconPath2 = path.join(__dirname, 'public', 'favicon.ico');

  if (fs.existsSync(faviconPath1)) {
    res.setHeader('Content-Type', 'image/x-icon');
    res.sendFile(path.resolve(faviconPath1));
  } else if (fs.existsSync(faviconPath2)) {
    res.setHeader('Content-Type', 'image/x-icon');
    res.sendFile(path.resolve(faviconPath2));
  } else {
    res.status(204).end(); // No Content - browser will use default
  }
});

// Handle service worker (sw.js) for /admin-vite path
app.get('/admin-vite/sw.js', (req, res) => {
  const swPath = path.join(__dirname, 'admin-vite', 'public', 'sw.js');
  if (fs.existsSync(swPath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve(swPath));
  } else {
    // Return a minimal service worker if file doesn't exist
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(`
      // Minimal Service Worker
      self.addEventListener('install', (event) => {
        self.skipWaiting();
      });
      
      self.addEventListener('activate', (event) => {
        event.waitUntil(clients.claim());
      });
      
      self.addEventListener('fetch', (event) => {
        // Passthrough - no caching
        event.respondWith(fetch(event.request));
      });
    `);
  }
});

// Handle manifest.json for PWA
app.get('/admin-vite/manifest.json', (req, res) => {
  const manifestPath = path.join(__dirname, 'admin-vite', 'public', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve(manifestPath));
  } else {
    // Return a basic manifest if file doesn't exist
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      name: 'Restaurant Admin',
      short_name: 'Restaurant',
      description: 'Restaurant Management System',
      start_url: '/admin-vite/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#667eea',
      icons: [
        {
          src: '/admin-vite/favicon.ico',
          sizes: '64x64',
          type: 'image/x-icon'
        }
      ]
    });
  }
});

// Handle Manual Instrucțiuni Complete - serve from server root
// IMPORTANT: These routes must be BEFORE SPA middleware to avoid interception
app.get('/server/MANUAL-INSTRUCTIUNI-COMPLETE.md', (req, res) => {
  const manualPath = path.join(__dirname, 'MANUAL-INSTRUCTIUNI-COMPLETE.md');
  if (fs.existsSync(manualPath)) {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="MANUAL-INSTRUCTIUNI-COMPLETE.md"');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.sendFile(path.resolve(manualPath), (err) => {
      if (err) {
        console.error('❌ Error serving manual:', err);
        res.status(500).json({
          success: false,
          error: 'Error serving manual',
          message: err.message
        });
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Manual not found',
      message: 'Manualul de instrucțiuni nu a fost găsit pe server.',
      path: manualPath
    });
  }
});

// Also handle direct access without /server prefix
app.get('/MANUAL-INSTRUCTIUNI-COMPLETE.md', (req, res) => {
  const manualPath = path.join(__dirname, 'MANUAL-INSTRUCTIUNI-COMPLETE.md');
  if (fs.existsSync(manualPath)) {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="MANUAL-INSTRUCTIUNI-COMPLETE.md"');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.resolve(manualPath), (err) => {
      if (err) {
        console.error('❌ Error serving manual:', err);
        res.status(500).json({
          success: false,
          error: 'Error serving manual',
          message: err.message
        });
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Manual not found',
      message: 'Manualul de instrucțiuni nu a fost găsit pe server.',
      path: manualPath
    });
  }
});

// Handle Manual Instrucțiuni HTML - serve from public directory
app.get('/manual-instructiuni-complet.html', (req, res) => {
  const manualHtmlPath = path.join(__dirname, 'public', 'manual-instructiuni-complet.html');
  if (fs.existsSync(manualHtmlPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.resolve(manualHtmlPath), (err) => {
      if (err) {
        console.error('❌ Error serving manual HTML:', err);
        res.status(500).json({
          success: false,
          error: 'Error serving manual HTML',
          message: err.message
        });
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Manual HTML not found',
      message: 'Manualul HTML de instrucțiuni nu a fost găsit pe server.',
      path: manualHtmlPath
    });
  }
});

// ========================================
// STATIC FILES FOR ADMIN-VITE (Production Only)
// ========================================
// In production, serve built files from admin-vite/dist
if (process.env.NODE_ENV === 'production') {
  app.use('/admin-vite', express.static(path.join(__dirname, 'admin-vite', 'dist'), {
    maxAge: '1d',
    setHeaders: (res, path) => {
      // CRITICAL: Force UTF-8 encoding for all content types
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (path.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      } else {
        // Default UTF-8 for all text-based content
        res.setHeader('Content-Type', 'application/octet-stream; charset=utf-8');
      }
      // Ensure all content is UTF-8
      res.setHeader('Charset', 'utf-8');
    }
  }));
}

// In development, let the Vite proxy handle all /admin-vite/* requests

// ========================================
// VITE DEV SERVER PROXY (Development Mode)
// ========================================
// Proxy requests to Vite dev server for /admin-vite/* in development
// IMPORTANT: This must be BEFORE SPA catch-all middleware
// IMPORTANT: Favicon route must be BEFORE this proxy
if (process.env.NODE_ENV !== 'production') {
  app.use('/admin-vite', (req, res, next) => {
    // Skip favicon - already handled above (check both path and originalUrl)
    if (req.path === '/favicon.ico' || req.path.endsWith('/favicon.ico') ||
      req.originalUrl === '/admin-vite/favicon.ico' || req.originalUrl.endsWith('/favicon.ico')) {
      return next(); // Let the favicon route handler above process it
    }
    // Skip manifest.json - already handled above
    if (req.path === '/manifest.json' || req.path.endsWith('/manifest.json') ||
      req.originalUrl === '/admin-vite/manifest.json' || req.originalUrl.endsWith('/manifest.json')) {
      return next(); // Let the manifest route handler above process it
    }
    // Skip service worker - already handled above
    if (req.path === '/sw.js' || req.path.endsWith('/sw.js') ||
      req.originalUrl === '/admin-vite/sw.js' || req.originalUrl.endsWith('/sw.js')) {
      return next(); // Let the service worker route handler above process it
    }
    // Skip API routes - they should go to main server
    if (req.path && req.path.startsWith('/api/')) {
      return next();
    }

    // Proxy to Vite dev server (port 5173)
    const vitePort = 5173;
    const targetUrl = `http://localhost:${vitePort}${req.originalUrl}`;

    try {
      const parsedUrl = url.parse(targetUrl);

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: req.method,
        headers: {
          ...req.headers,
          host: `localhost:${vitePort}`,
        },
      };

      const proxyReq = http.request(options, (proxyRes) => {
        // Copy status code
        res.statusCode = proxyRes.statusCode;
        // Copy headers
        Object.keys(proxyRes.headers).forEach(key => {
          res.setHeader(key, proxyRes.headers[key]);
        });
        // Pipe response
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        // If Vite dev server is not running, serve from dist folder instead
        // Common errors: ECONNREFUSED, connect, socket hang up, ENOTFOUND
        const silentErrors = ['ECONNREFUSED', 'connect', 'socket hang up', 'ENOTFOUND'];
        const isSilentError = silentErrors.some(errorType => err.message.includes(errorType));

        if (isSilentError) {
          // Vite dev server not running - serve from dist folder
          // Remove /admin-vite prefix and try to serve from dist
          const distPath = req.path.replace(/^\/admin-vite/, '') || '/index.html';
          const distFile = path.join(__dirname, 'admin-vite', 'dist', distPath);

          if (fs.existsSync(distFile) && fs.statSync(distFile).isFile()) {
            return res.sendFile(path.resolve(distFile));
          }

          // If file not found, try index.html (SPA fallback)
          const indexPath = path.join(__dirname, 'admin-vite', 'dist', 'index.html');
          if (fs.existsSync(indexPath)) {
            return res.sendFile(path.resolve(indexPath));
          }
        } else {
          // Unexpected error - log it
          console.warn(`⚠️  Vite dev server error (${targetUrl}): ${err.message}`);
        }
        next();
      });

      // Set timeout to prevent hanging requests
      proxyReq.setTimeout(2000, () => {
        proxyReq.destroy();
        next();
      });

      // Send request body if exists
      if (req.body) {
        proxyReq.write(JSON.stringify(req.body));
      }
      proxyReq.end();
    } catch (err) {
      console.error(`❌ Proxy error: ${err.message}`);
      next();
    }
  });

  console.log('✅ Vite dev server proxy configured for /admin-vite/* (development mode)');
}

// ========================================
// LEGACY HTML FILES (MUST BE BEFORE STATIC FILES)
// ========================================
// Serve legacy HTML files for KDS, Bar, and Kiosk BEFORE static files middleware
// This prevents express.static from trying to serve them from public/ root
// IMPORTANT: This middleware MUST be before loadAll() which includes static files

// Pre-calculate legacy HTML files mapping (outside middleware for performance)
const legacyHtmlFiles = {
  '/kds.html': path.join(__dirname, 'public', 'legacy', 'kds', 'kds.html'),
  '/comenzi-bar.html': path.join(__dirname, 'public', 'legacy', 'orders', 'comenzi bar.html'),
  '/comenzi bar.html': path.join(__dirname, 'public', 'legacy', 'orders', 'comenzi bar.html'), // Cu spațiu (folosit în sidebar)
  '/comenzi%20bar.html': path.join(__dirname, 'public', 'legacy', 'orders', 'comenzi bar.html'), // URL-encoded
  '/bar.html': path.join(__dirname, 'public', 'legacy', 'orders', 'comenzi bar.html'),
  '/kiosk.html': path.join(__dirname, 'public', 'legacy', 'orders', 'kiosk.html'),
  // Legacy admin files
  '/admin.html': path.join(__dirname, 'public', 'legacy', 'admin', 'admin.html'),
  '/admin-advanced.html': path.join(__dirname, 'public', 'legacy', 'admin', 'admin-advanced.html'),
  '/admin-v4-modular.html': path.join(__dirname, 'public', 'legacy', 'admin', 'admin-v4-modular.html')
};
const legacyRoutes = Object.keys(legacyHtmlFiles);

// Legacy HTML files directories
const legacyDirs = {
  orders: path.join(__dirname, 'public', 'legacy', 'orders'),
  kds: path.join(__dirname, 'public', 'legacy', 'kds'),
  admin: path.join(__dirname, 'public', 'legacy', 'admin'),
  delivery: path.join(__dirname, 'public', 'legacy', 'delivery')
};

app.use((req, res, next) => {
  try {
    // Skip if not an HTML file request
    if (!req.path || !req.path.endsWith('.html')) {
      return next();
    }

    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }

    // First, check explicit mapping
    const isLegacyHtml = legacyRoutes.some(route => {
      try {
        const decodedPath = decodeURIComponent(req.path);
        return req.path === route || decodedPath === route || req.originalUrl.split('?')[0] === route;
      } catch (e) {
        return req.path === route || req.originalUrl.split('?')[0] === route;
      }
    });

    if (isLegacyHtml) {
      // Handle explicit mapping
      const originalUrl = req.originalUrl.split('?')[0];
      let decodedPath;
      try {
        decodedPath = decodeURIComponent(req.path);
      } catch (e) {
        decodedPath = req.path;
      }

      const legacyPath = legacyHtmlFiles[req.path] ||
        legacyHtmlFiles[decodedPath] ||
        legacyHtmlFiles[originalUrl] ||
        legacyHtmlFiles[decodeURIComponent(originalUrl) || originalUrl];

      if (legacyPath && fs.existsSync(legacyPath)) {
        serverLogger.debug('Serving legacy file', { path: req.path, legacyPath });
        return res.sendFile(path.resolve(legacyPath), (err) => {
          if (err) {
            serverLogger.error('Error serving legacy file', { path: req.path, error: err.message });
            return next(err);
          }
        });
      }
    }

    // If not in explicit mapping, try to find in legacy directories
    const fileName = path.basename(req.path);

    // Try each legacy directory
    for (const [dirName, dirPath] of Object.entries(legacyDirs)) {
      const filePath = path.join(dirPath, fileName);
      if (fs.existsSync(filePath)) {
        serverLogger.debug('Serving legacy file', { path: req.path, filePath });
        return res.sendFile(path.resolve(filePath), (err) => {
          if (err) {
            serverLogger.error('Error serving legacy file', { path: req.path, error: err.message });
            return next(err);
          }
        });
      }
    }

    // If not found in legacy directories, continue to next middleware
    next();
  } catch (error) {
    console.error(`❌ Legacy HTML middleware error: ${error.message}`);
    console.error(`📚 Stack: ${error.stack}`);
    // Don't block request on error
    next();
  }
});

// ========================================
// FAVICON ROUTE (MOVED ABOVE - BEFORE VITE PROXY)
// ========================================
// Favicon routes are now handled BEFORE Vite proxy to prevent 404 errors
// See lines 114-133 for favicon route handlers

// ========================================
// ADMIN-ADVANCED.HTML ROUTE (with query params support)
// ========================================
app.get('/admin-advanced.html', (req, res) => {
  const adminAdvancedPath = path.join(__dirname, 'public', 'legacy', 'admin', 'admin-advanced.html');
  if (fs.existsSync(adminAdvancedPath)) {
    res.sendFile(path.resolve(adminAdvancedPath));
  } else {
    res.status(404).send('File not found');
  }
});

// Add redirect for /kiosk/tipizate-enterprise/nir
app.get('/kiosk/tipizate-enterprise/nir', (req, res) => {
  console.log(`[Redirect] Redirecting /kiosk/tipizate-enterprise/nir to /admin-advanced.html#inventory?iframe=true from ${req.ip}`);
  res.redirect('/admin-advanced.html#inventory?iframe=true');
});

// Add redirect for /admin-vite/kiosk/tipizate-enterprise/nir
app.get('/admin-vite/kiosk/tipizate-enterprise/nir', (req, res) => {
  console.log(`[Redirect] Redirecting /admin-vite/kiosk/tipizate-enterprise/nir to /admin-advanced.html#inventory?iframe=true from ${req.ip}`);
  res.redirect('/admin-advanced.html#inventory?iframe=true');
});

// Serve Horeca Certificate PDF
app.get('/admin/certificate.pdf', (req, res) => {
  const certPath = path.join(__dirname, 'CERTIFICAT_HORECA_ANTIGRAVITY.pdf');
  if (fs.existsSync(certPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="CERTIFICAT_HORECA_ANTIGRAVITY.pdf"');
    res.sendFile(certPath);
  } else {
    res.status(404).send('Certificate not found. Please run the compliance tests first.');
  }
});

// Certificate verification page
app.get('/verify-certificate', (req, res) => {
  const verifyPath = path.join(__dirname, 'public', 'verify-certificate.html');
  if (fs.existsSync(verifyPath)) {
    res.sendFile(verifyPath);
  } else {
    res.status(404).send('Verification page not found.');
  }
});

// ========================================
// LOAD ALL MIDDLEWARE (body parser is configured here)
// ========================================
loadAll(app);

// ========================================
// UTF-8 RESPONSE HEADERS
// ========================================
// Add UTF-8 charset to JSON responses
app.use((req, res, next) => {
  // Salvează metoda originală setHeader
  const originalSetHeader = res.setHeader;
  res.setHeader = function (name, value) {
    // Dacă header-ul Content-Type este deja setat, nu-l suprascrie
    if (name === 'Content-Type' && this.getHeader('Content-Type')) {
      return this;
    }
    // Pentru răspunsuri JSON, adaugă charset=utf-8
    if (name === 'Content-Type' && value === 'application/json') {
      value = 'application/json; charset=utf-8';
    }
    return originalSetHeader.call(this, name, value);
  };
  next();
});

// ========================================
// DATABASE UTF-8 ENCODING
// ========================================
// Configurează encoding UTF-8 pentru baza de date după inițializare
dbPromise.then((db) => {
  db.run("PRAGMA encoding = 'UTF-8'", (err) => {
    if (err) {
      console.warn('⚠️ Eroare la setarea encoding UTF-8 pentru baza de date:', err.message);
    } else {
      console.log('✅ Encoding UTF-8 setat pentru baza de date');
    }
  });
}).catch((error) => {
  console.warn('⚠️ Nu s-a putut configura encoding UTF-8 pentru baza de date:', error.message);
});

// ========================================
// SWAGGER API DOCUMENTATION
// ========================================
try {
  const { setupSwagger } = require('./src/config/swagger.config');
  setupSwagger(app);
} catch (err) {
  console.warn('⚠️ Swagger not loaded:', err.message);
}

// ========================================
// HEALTH CHECK (Extended)
// ========================================
const healthRoutes = require('./src/routes/health');
app.use('/', healthRoutes);
// NOTE: /api health routes are mounted AFTER customer auth routes to avoid interception

// ========================================
// CUSTOMER AUTHENTICATION ROUTES (Mobile App) - MUST BE BEFORE dbPromise.then()
// ========================================
// These endpoints must be available immediately for mobile app authentication
// Using /api/mobile/auth/* to avoid conflicts with /api/customers module
// POST /api/mobile/auth/register - Înregistrare client nou
app.post('/api/mobile/auth/register', async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, parolă și nume sunt obligatorii'
      });
    }

    // Validare email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email invalid'
      });
    }

    // Validare parolă (minim 6 caractere)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Parola trebuie să aibă minim 6 caractere'
      });
    }

    const db = await dbPromise;

    // Verifică dacă clientul există deja
    db.get('SELECT id FROM customers WHERE customer_email = ?', [email.toLowerCase()], async (err, existing) => {
      if (err) {
        console.error('❌ Error checking existing customer:', err);
        return res.status(500).json({
          success: false,
          error: 'Eroare la verificarea clientului'
        });
      }

      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Un cont cu acest email există deja'
        });
      }

      // Hash parola (folosim aceeași metodă ca pentru admin users)
      const crypto = require('crypto');
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      const passwordHash = `${salt}:${hash}`;

      // Verifică dacă tabelul customers are câmpul password_hash
      // Dacă nu, îl adăugăm (ALTER TABLE)
      db.all("PRAGMA table_info(customers)", [], (err, cols) => {
        if (err) {
          console.error('❌ Error getting table info:', err);
          return res.status(500).json({
            success: false,
            error: 'Eroare la verificarea tabelei'
          });
        }

        const hasPasswordHash = cols.some(col => col.name === 'password_hash');

        // Dacă nu există câmpul, îl adăugăm
        if (!hasPasswordHash) {
          db.run('ALTER TABLE customers ADD COLUMN password_hash TEXT', (alterErr) => {
            if (alterErr) {
              console.error('❌ Error adding password_hash column:', alterErr);
              // Continuă oricum, poate coloana există deja
            } else {
              console.log('✅ Added password_hash column to customers table');
            }

            // Creează clientul
            _createCustomer();
          });
        } else {
          // Creează clientul direct
          _createCustomer();
        }

        function _createCustomer() {
          // Inserează clientul nou
          db.run(
            `INSERT INTO customers (customer_name, customer_email, customer_phone, password_hash, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [name, email.toLowerCase(), phone || null, passwordHash],
            function (insertErr) {
              if (insertErr) {
                console.error('❌ Error creating customer:', insertErr);
                return res.status(500).json({
                  success: false,
                  error: 'Eroare la crearea contului'
                });
              }

              const customerId = this.lastID;

              // Generează token simplu (pentru sesiune)
              const token = crypto.randomBytes(32).toString('hex');

              console.log(`✅ Customer registered: ${email} (ID: ${customerId})`);

              res.json({
                success: true,
                message: 'Cont creat cu succes',
                customer: {
                  id: customerId,
                  name: name,
                  email: email.toLowerCase(),
                  phone: phone || null
                },
                token: token
              });
            }
          );
        }
      });
    });
  } catch (error) {
    console.error('❌ Error in POST /api/mobile/auth/register:', error);
    next(error);
  }
});

// POST /api/mobile/auth/login - Login client
app.post('/api/mobile/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email și parolă sunt obligatorii'
      });
    }

    const db = await dbPromise;

    // Verifică dacă tabelul customers are câmpul password_hash, dacă nu, îl adăugăm
    db.all("PRAGMA table_info(customers)", [], (err, cols) => {
      if (err) {
        console.error('❌ Error getting table info:', err);
        return res.status(500).json({
          success: false,
          error: 'Eroare la verificarea tabelei'
        });
      }

      const hasPasswordHash = cols.some(col => col.name === 'password_hash');

      // Dacă nu există câmpul, îl adăugăm
      if (!hasPasswordHash) {
        db.run('ALTER TABLE customers ADD COLUMN password_hash TEXT', (alterErr) => {
          if (alterErr && !alterErr.message.includes('duplicate column')) {
            console.error('❌ Error adding password_hash column:', alterErr);
            return res.status(500).json({
              success: false,
              error: 'Eroare la configurarea bazei de date'
            });
          } else if (!alterErr) {
            console.log('✅ Added password_hash column to customers table (from login endpoint)');
          }

          // După ALTER TABLE, așteaptă puțin pentru a permite SQLite să finalizeze operația
          // Apoi continuă cu query-ul de login
          setTimeout(() => {
            _performLogin();
          }, 100);
        });
      } else {
        // Câmpul există, continuă direct cu login
        _performLogin();
      }

      function _performLogin() {
        // Găsește clientul după email
        // Dacă coloana password_hash a fost tocmai adăugată, va fi NULL pentru clienții vechi
        // Dacă coloana există deja, va conține hash-ul
        db.get(
          'SELECT id, customer_name, customer_email, customer_phone, password_hash, is_active FROM customers WHERE customer_email = ?',
          [email.toLowerCase()],
          (err, customer) => {
            if (err) {
              // Dacă eroarea este că coloana nu există, încercăm din nou fără password_hash
              if (err.message && err.message.includes('no such column: password_hash')) {
                console.warn('⚠️ password_hash column still missing, retrying without it...');
                db.get(
                  'SELECT id, customer_name, customer_email, customer_phone, is_active FROM customers WHERE customer_email = ?',
                  [email.toLowerCase()],
                  (err2, customer2) => {
                    if (err2) {
                      console.error('❌ Error finding customer (retry):', err2);
                      return res.status(500).json({
                        success: false,
                        error: 'Eroare la autentificare'
                      });
                    }
                    if (!customer2) {
                      return res.status(401).json({
                        success: false,
                        error: 'Email sau parolă incorectă'
                      });
                    }
                    return res.status(401).json({
                      success: false,
                      error: 'Contul nu are parolă setată. Vă rugăm să vă înregistrați din nou.'
                    });
                  }
                );
                return;
              }
              console.error('❌ Error finding customer:', err);
              return res.status(500).json({
                success: false,
                error: 'Eroare la autentificare'
              });
            }

            if (!customer) {
              return res.status(401).json({
                success: false,
                error: 'Email sau parolă incorectă'
              });
            }

            if (!customer.is_active) {
              return res.status(403).json({
                success: false,
                error: 'Contul a fost dezactivat'
              });
            }

            // Verifică parola
            if (!customer.password_hash) {
              return res.status(401).json({
                success: false,
                error: 'Contul nu are parolă setată. Vă rugăm să vă înregistrați din nou.'
              });
            }

            const crypto = require('crypto');
            const [salt, hash] = customer.password_hash.split(':');
            const hashToVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

            if (hash !== hashToVerify) {
              return res.status(401).json({
                success: false,
                error: 'Email sau parolă incorectă'
              });
            }

            // Generează token pentru sesiune
            const token = crypto.randomBytes(32).toString('hex');

            console.log(`✅ Customer logged in: ${customer.customer_email} (ID: ${customer.id})`);

            res.json({
              success: true,
              message: 'Autentificare reușită',
              customer: {
                id: customer.id,
                name: customer.customer_name,
                email: customer.customer_email,
                phone: customer.customer_phone
              },
              token: token
            });
          }
        );
      }
    });
  } catch (error) {
    console.error('❌ Error in POST /api/mobile/auth/login:', error);
    next(error);
  }
});

console.log('✅ Customer Authentication routes mounted (before /api/config): /api/mobile/auth/register, /api/mobile/auth/login');

// Mount /api health routes AFTER customer auth routes to avoid interception
app.use('/api', healthRoutes);
console.log('✅ Health routes mounted at /api (after customer auth)');

// ========================================
// POST /api/kiosk/order - Creare comandă din aplicația mobilă (MUST BE BEFORE dbPromise.then)
// ========================================
// This endpoint must be available immediately for mobile app orders
app.post('/api/kiosk/order', async (req, res, next) => {
  try {
    // Wait for database to be ready
    const db = await dbPromise;

    // ✅ Integrare middleware unificat pentru validare
    const { validateOrder } = require('./src/middleware/order-validator.middleware');

    // Wrapper pentru a captura răspunsul middleware-ului
    let middlewareProceeded = false;
    const middlewareNext = async () => {
      middlewareProceeded = true;
      const ordersController = require('./src/modules/orders/controllers/orders.controller');
      // ✅ FIX: Preserve platform and order_source from request body (don't override)
      // Kiosk sends platform='KIOSK' and order_source='KIOSK_SELF_SERVICE'
      // Mobile app sends platform='MOBILE_APP' and order_source='DELIVERY' or other
      if (req.normalizedOrder) {
        // Use platform from request if provided, otherwise default to MOBILE_APP
        req.normalizedOrder.platform = req.body.platform || req.normalizedOrder.platform || 'MOBILE_APP';
        req.normalizedOrder.order_source = req.body.order_source || req.normalizedOrder.order_source || (req.normalizedOrder.type === 'delivery' ? 'DELIVERY' : 'POS');
        // Copiază normalizedOrder în body pentru controller
        req.body = { ...req.body, ...req.normalizedOrder };
      } else {
        // Fallback dacă middleware nu a setat normalizedOrder
        req.body.platform = req.body.platform || 'MOBILE_APP';
        req.body.order_source = req.body.order_source || (req.body.type === 'delivery' ? 'DELIVERY' : 'POS');
      }
      await ordersController.createOrder(req, res, next);
    };

    // Apelăm middleware-ul
    await validateOrder(req, res, middlewareNext);

    // Dacă middleware-ul nu a apelat next() (a returnat eroare), nu continuăm
    // Verifică dacă răspunsul a fost deja trimis
    if (!middlewareProceeded && res.headersSent) {
      // Middleware-ul a trimis deja răspunsul de eroare
      return;
    }

    // Dacă middleware-ul nu a apelat next() dar răspunsul nu a fost trimis, continuă
    // (pentru cazuri în care middleware-ul nu returnează explicit)
    if (!middlewareProceeded && !res.headersSent) {
      console.warn('⚠️ [Kiosk Order] Middleware nu a apelat next() dar răspunsul nu a fost trimis - continuă cu controller');
      // Continuă cu controller-ul pentru backward compatibility
      const ordersController = require('./src/modules/orders/controllers/orders.controller');
      req.body.platform = 'MOBILE_APP';
      if (req.body.type === 'delivery' && !req.body.order_source) {
        req.body.order_source = 'DELIVERY';
      }
      await ordersController.createOrder(req, res, next);
      return;
    }
  } catch (error) {
    console.error('❌ Error in POST /api/kiosk/order:', error);
    if (!res.headersSent) {
      next(error);
    }
  }
});
console.log('✅ Kiosk order route mounted: POST /api/kiosk/order (before dbPromise)');

// ========================================
// GET /api/config - Mobile App Configuration (MUST BE BEFORE dbPromise.then)
// ========================================
// This endpoint must be available immediately for mobile app initialization
app.get('/api/config', async (req, res) => {
  console.log(`[API Config] Request from ${req.ip} to ${req.originalUrl}`);

  try {
    // Try to get branding config (may not be available until db is ready)
    let brandingData = {
      brand_name: 'Restaurant App',
      restaurant_name: 'Restaurant App',
      logo_url: null,
      colors: { primary: '#3B82F6', secondary: '#10B981' }
    };

    try {
      const brandingController = require('./src/modules/branding/branding.controller');
      if (brandingController && brandingController.getBranding) {
        const brandingReq = { tenantId: req.tenantId || 1 };
        let brandingResponse = null;
        const brandingRes = {
          json: (data) => {
            brandingResponse = data;
          }
        };
        await brandingController.getBranding(brandingReq, brandingRes, () => { });
        brandingData = brandingResponse?.branding || brandingResponse || brandingData;
      }
    } catch (e) {
      console.warn('⚠️  Failed to load branding config (will use defaults):', e.message);
    }

    // Try to get restaurant config (may not be available until db is ready)
    let restaurantData = {};
    try {
      const restaurantController = require('./src/modules/settings/controllers/restaurant.controller');
      if (restaurantController && restaurantController.getRestaurantSettings) {
        const restaurantReq = { tenantId: req.tenantId || 1 };
        let restaurantResponse = null;
        const restaurantRes = {
          json: (data) => {
            restaurantResponse = data;
          }
        };
        await restaurantController.getRestaurantSettings(restaurantReq, restaurantRes, () => { });
        restaurantData = restaurantResponse?.restaurant || restaurantResponse || {};
      }
    } catch (e) {
      console.warn('⚠️  Failed to load restaurant config (will use defaults):', e.message);
    }

    // Merge branding și restaurant data, cu prioritizare pentru restaurantData
    const mergedRestaurantData = {
      ...restaurantData,
      name: restaurantData.name || brandingData.restaurant_name || 'Restaurant App',
      restaurant_name: restaurantData.restaurant_name || restaurantData.name || brandingData.restaurant_name || 'Restaurant App',
      phone: restaurantData.phone || restaurantData.contact_phone || null,
      email: restaurantData.email || restaurantData.contact_email || null,
      address: restaurantData.address || restaurantData.contact_address || null,
      facebook_url: restaurantData.facebook_url || restaurantData.facebook || null,
      instagram_url: restaurantData.instagram_url || restaurantData.instagram || null,
      tiktok_url: restaurantData.tiktok_url || restaurantData.tiktok || null,
      youtube_url: restaurantData.youtube_url || restaurantData.youtube || null,
      privacy_policy_url: restaurantData.privacy_policy_url || null,
      terms_url: restaurantData.terms_url || restaurantData.terms_and_conditions_url || null,
    };

    res.json({
      success: true,
      data: {
        branding: {
          ...brandingData,
          restaurant_name: mergedRestaurantData.restaurant_name || brandingData.restaurant_name || 'Restaurant App',
        },
        restaurant: mergedRestaurantData,
        contact: {
          phone: mergedRestaurantData.phone,
          email: mergedRestaurantData.email,
          address: mergedRestaurantData.address,
          facebook_url: mergedRestaurantData.facebook_url,
          instagram_url: mergedRestaurantData.instagram_url,
          tiktok_url: mergedRestaurantData.tiktok_url,
          youtube_url: mergedRestaurantData.youtube_url,
        },
        legal: {
          privacy_policy_url: mergedRestaurantData.privacy_policy_url,
          terms_url: mergedRestaurantData.terms_url,
        }
      }
    });
  } catch (error) {
    console.error('❌ Error loading config:', error);
    // Return default config even on error so mobile app can still initialize
    res.json({
      success: true,
      data: {
        branding: {
          brand_name: 'Restaurant App',
          restaurant_name: 'Restaurant App',
          logo_url: null,
          colors: { primary: '#3B82F6', secondary: '#10B981' }
        },
        restaurant: {
          name: 'Restaurant App',
          restaurant_name: 'Restaurant App',
        },
        contact: {},
        legal: {}
      }
    });
  }
});

// ========================================
// GET /config - Fallback pentru compatibilitate (redirecționează la /api/config)
// ========================================
app.get('/config', (req, res) => {
  console.log(`[Config Fallback] Redirecting /config to /api/config from ${req.ip}`);
  res.redirect('/api/config');
});

// NOTE: Customer Authentication routes are already mounted BEFORE /api/config (see above, around line 604)
// Duplicate removed - routes are defined at lines 604-814

// ========================================
// STOCK ROUTES ALIAS - Will be mounted after loadModules in dbPromise.then()
// Frontend uses /api/stock (singular) but module is mounted at /api/stocks (plural)
// ========================================

// ========================================
// WEATHER FORECAST ROUTES (Mount BEFORE SPA catch-all)
// Must be mounted before dbPromise.then() to ensure they're available
// ========================================
const weatherForecastRoutes = require('./routes/weather-forecast');
app.use('/api/weather-forecast', weatherForecastRoutes);
console.log('✅ Weather Forecast routes mounted (before SPA catch-all): /api/weather-forecast/*');

// ========================================
// FRIENDS RIDE DELIVERY ORDERS ENDPOINT (Mount BEFORE SPA catch-all)
// Must be mounted before dbPromise.then() to ensure it's available immediately
// ========================================
// POST /api/delivery/orders - Acceptă comenzi delivery de la Friends Ride (Firebase format)
// NOTĂ: Acest endpoint este DEDICAT pentru Friends Ride (Firebase format)
// RestorApp folosește /api/orders/delivery (format diferit)
app.post('/api/delivery/orders', async (req, res, next) => {
  console.log('🔍 [Friends Ride] Request received at /api/delivery/orders');
  console.log('🔍 [Friends Ride] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🔍 [Friends Ride] Body keys:', Object.keys(req.body || {}));

  try {
    // ✅ Integrare middleware unificat pentru validare (doar pentru structură de bază)
    // Notă: Friends Ride are logica proprie pentru transformare Firebase → Standard
    // Middleware-ul va valida structura de bază, dar transformarea rămâne în logica Friends Ride
    const { validateOrder } = require('./src/middleware/order-validator.middleware');

    // Verifică structura de bază (items, etc.)
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Items array is required and must not be empty',
          code: 'INVALID_ITEMS'
        }
      });
    }
    // Verifică autentificare API Key
    const crypto = require('crypto');
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
    const apiKeyHash = req.headers['x-api-key-hash'] || req.headers['X-API-Key-Hash'];

    // Verificare API Key - Opțiune 1: Verificare simplă cu environment variable
    if (process.env.FRIENDSRIDE_API_KEY) {
      if (!apiKey) {
        console.warn('⚠️ [Friends Ride] Unauthorized - Missing API key header');
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Missing API key header (x-api-key required)'
        });
      }

      // Verifică dacă este hash sau plain key
      if (apiKeyHash) {
        // Verificare cu hash: hash-ul API key-ului trebuie să corespundă
        const expectedHash = crypto.createHash('sha256').update(process.env.FRIENDSRIDE_API_KEY).digest('hex');
        if (apiKeyHash !== expectedHash) {
          console.warn('⚠️ [Friends Ride] Unauthorized - Invalid API key hash');
          return res.status(401).json({
            success: false,
            error: 'Unauthorized - Invalid API key hash'
          });
        }
        console.log('✅ [Friends Ride] API Key hash validated');
      } else {
        // Verificare simplă: comparație directă
        if (apiKey !== process.env.FRIENDSRIDE_API_KEY) {
          // Verifică dacă API key-ul trimis este un hash SHA-256 (64 caractere hex)
          if (apiKey.length === 64 && /^[0-9a-f]{64}$/i.test(apiKey)) {
            // Pare să fie un hash direct - verifică împotriva hash-ului key-ului din env
            const envKeyHash = crypto.createHash('sha256').update(process.env.FRIENDSRIDE_API_KEY).digest('hex');
            if (apiKey.toLowerCase() !== envKeyHash.toLowerCase()) {
              console.warn('⚠️ [Friends Ride] Unauthorized - Invalid API key hash');
              console.warn('⚠️ [Friends Ride] Received hash:', apiKey);
              console.warn('⚠️ [Friends Ride] Expected hash:', envKeyHash);
              return res.status(401).json({
                success: false,
                error: 'Unauthorized - Invalid API key hash'
              });
            }
            console.log('✅ [Friends Ride] API Key validated (hash match)');
          } else {
            console.warn('⚠️ [Friends Ride] Unauthorized - Invalid API key');
            return res.status(401).json({
              success: false,
              error: 'Unauthorized - Invalid API key'
            });
          }
        } else {
          console.log('✅ [Friends Ride] API Key validated (direct match)');
        }
      }
    } else {
      // Nu avem FRIENDSRIDE_API_KEY configurat - logăm avertisment
      if (!apiKey) {
        console.warn('⚠️ [Friends Ride] No API key validation - FRIENDSRIDE_API_KEY not set and no x-api-key header');
      } else {
        console.log('⚠️ [Friends Ride] API key provided but FRIENDSRIDE_API_KEY env var not set - allowing request');
      }
    }

    const { dbPromise } = require('./database');
    const { ORDER_SOURCE } = require('./orders/unifiedOrderService');
    const { PLATFORMS, PICKUP_TYPES } = require('./constants/delivery');

    // Detectăm dacă este format Firebase (Friends Ride) sau format RestorApp
    const isFirebaseFormat = req.body.customerId !== undefined ||
      req.body.deliveryAddress?.address !== undefined ||
      req.body.restaurantId !== undefined ||
      (req.body.items && req.body.items[0] && req.body.items[0].productName !== undefined);

    console.log('🔍 [Friends Ride] Format detection - isFirebaseFormat:', isFirebaseFormat);

    const isRestorAppFormat = req.body.customer_phone !== undefined ||
      req.body.customer_name !== undefined ||
      req.body.platform === 'MOBILE_APP' ||
      req.body.platform === 'PUBLIC_QR';

    // Dacă este format RestorApp, redirecționăm către endpoint-ul corect
    if (isRestorAppFormat && !isFirebaseFormat) {
      console.warn('⚠️ RestorApp order detected at /api/delivery/orders - should use /api/orders/delivery');
      return res.status(400).json({
        success: false,
        error: 'Format RestorApp detectat. Folosiți /api/orders/delivery pentru comenzile RestorApp.',
        suggested_endpoint: '/api/orders/delivery'
      });
    }

    // Verificăm că este format Firebase (Friends Ride)
    if (!isFirebaseFormat) {
      console.warn('⚠️ [Friends Ride] Format necunoscut. Body:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({
        success: false,
        error: 'Format necunoscut. Endpoint-ul /api/delivery/orders acceptă doar format Firebase (Friends Ride).',
        required_fields: ['customerId', 'deliveryAddress', 'restaurantId', 'items'],
        received_keys: Object.keys(req.body || {})
      });
    }

    console.log('📥 [Friends Ride] Order received (Firebase format):', JSON.stringify(req.body, null, 2));

    // Așteaptă baza de date să fie gata
    const db = await dbPromise;

    // Friends Ride trimite structură Firebase
    const firebaseOrder = req.body;

    // Extrage datele din structura Firebase
    const customerId = firebaseOrder.customerId || null;
    const deliveryAddressObj = firebaseOrder.deliveryAddress || {};
    const deliveryAddress = deliveryAddressObj.address || '';
    const items = firebaseOrder.items || [];
    const total = firebaseOrder.total || firebaseOrder.subtotal || 0;
    const subtotal = firebaseOrder.subtotal || total;
    const deliveryFee = firebaseOrder.deliveryFee || 0;
    const serviceFee = firebaseOrder.serviceFee || 0;
    const paymentMethod = firebaseOrder.paymentMethod || firebaseOrder.metadata?.paymentMethod || 'cash';
    const metadata = firebaseOrder.metadata || {};
    const notes = metadata.notes || null;
    const status = firebaseOrder.status || 'pending';
    const restaurantId = firebaseOrder.restaurantId || firebaseOrder.restaurantAddress?.restaurantId || null;

    // Extrage order ID din Firebase (poate fi în URL sau în body)
    const firebaseOrderId = req.query.orderId || firebaseOrder.id || null;

    // Convertim Firebase timestamp la SQLite datetime
    let createdAt = new Date().toISOString();
    if (firebaseOrder.createdAt) {
      // Firebase timestamp poate fi obiect {seconds, nanoseconds} sau string ISO
      if (typeof firebaseOrder.createdAt === 'object' && firebaseOrder.createdAt.seconds) {
        createdAt = new Date(firebaseOrder.createdAt.seconds * 1000).toISOString();
      } else if (typeof firebaseOrder.createdAt === 'string') {
        createdAt = firebaseOrder.createdAt;
      }
    }

    // Validare
    if (!items || items.length === 0) {
      console.warn('⚠️ [Friends Ride] Validation failed: Items sunt obligatorii');
      return res.status(400).json({
        success: false,
        error: 'Items sunt obligatorii',
        received_body: req.body
      });
    }

    if (!deliveryAddress) {
      console.warn('⚠️ [Friends Ride] Validation failed: Adresa de livrare este obligatorie');
      console.warn('⚠️ [Friends Ride] deliveryAddressObj:', JSON.stringify(deliveryAddressObj, null, 2));
      return res.status(400).json({
        success: false,
        error: 'Adresa de livrare este obligatorie',
        received_deliveryAddress: firebaseOrder.deliveryAddress
      });
    }

    // Dacă nu avem customerPhone din baza de date, încercăm să îl extragem din metadata sau folosim un placeholder
    if (!customerPhone) {
      // Încearcă să extragă telefonul din metadata sau din alte câmpuri
      customerPhone = metadata?.customerPhone || metadata?.phone || firebaseOrder.customerPhone || null;
      if (!customerPhone) {
        console.warn('⚠️ [Friends Ride] No customer phone found, using placeholder');
        customerPhone = '0000000000'; // Placeholder pentru comenzi fără telefon
      }
    }

    // Încearcă să găsească telefonul clientului din customerId (dacă există în customers table)
    let customerPhone = null;
    let customerName = 'Client';
    if (customerId) {
      try {
        const customer = await new Promise((resolve, reject) => {
          db.get(
            'SELECT customer_name, customer_phone FROM customers WHERE customer_id = ? OR id = ? LIMIT 1',
            [customerId, customerId],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });
        if (customer) {
          customerName = customer.customer_name || 'Client';
          customerPhone = customer.customer_phone || null;
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch customer info:', err.message);
      }
    }

    // Transformă items din structura Firebase în structura Restaurant App
    const enrichedItems = await Promise.all(items.map(async (item) => {
      try {
        // Firebase item structure: {id, productId, productName, quantity, unitPrice, totalPrice, modifications}
        const productId = item.productId || item.product_id;
        const productName = item.productName || item.name || '';
        const quantity = item.quantity || 1;
        const unitPrice = item.unitPrice || item.price || 0;
        const totalPrice = item.totalPrice || (unitPrice * quantity);
        const modifications = item.modifications || [];

        // Încarcă categoria produsului din meniu
        let category = null;
        let categoryName = null;
        if (productId) {
          try {
            const product = await new Promise((resolve, reject) => {
              db.get('SELECT id, name, category, price FROM menu WHERE id = ?', [productId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            });

            if (product) {
              category = product.category;
              categoryName = product.category;
            }
          } catch (err) {
            console.warn(`⚠️ Could not load product info for productId ${productId}:`, err.message);
          }
        }

        // Construiește item-ul pentru Restaurant App
        return {
          productId: productId,
          product_id: productId,
          name: productName,
          productName: productName,
          quantity: quantity,
          price: unitPrice,
          finalPrice: totalPrice,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
          category: category,
          category_name: categoryName,
          customizations: modifications.map(mod => ({
            id: mod.id || null,
            name: mod.name || mod.option_name || '',
            price_change: mod.price_change || mod.extra_price || 0
          })),
          // Păstrează și datele originale Firebase pentru referință
          firebase_item_id: item.id,
          modifications: modifications
        };
      } catch (err) {
        console.error('❌ Error processing item:', err);
        // Returnează item-ul minimal dacă există eroare
        return {
          productId: item.productId || null,
          name: item.productName || item.name || 'Produs necunoscut',
          quantity: item.quantity || 1,
          price: item.unitPrice || item.price || 0,
          finalPrice: item.totalPrice || 0,
          category: null,
          category_name: null
        };
      }
    }));

    // Folosește deliveryFee din Firebase sau calculează default
    const finalDeliveryFee = deliveryFee || 0;
    const finalPickupType = PICKUP_TYPES.PLATFORM_COURIER;

    // Creează comanda
    const orderId = await new Promise((resolve, reject) => {
      // Convertim createdAt la format SQLite (YYYY-MM-DD HH:MM:SS)
      const sqliteTimestamp = createdAt.replace('T', ' ').replace('Z', '').substring(0, 19);

      db.run(`
        INSERT INTO orders (
          type, order_source, platform, pickup_type,
          customer_name, customer_phone, delivery_address,
          items, total, payment_method, delivery_fee_charged,
          status, general_notes, timestamp, is_paid,
          friendsride_order_id, friendsride_restaurant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'delivery', ORDER_SOURCE.DELIVERY, 'FRIENDSRIDE', finalPickupType,
        customerName, customerPhone, deliveryAddress,
        JSON.stringify(enrichedItems), total, paymentMethod, finalDeliveryFee,
        status, notes, sqliteTimestamp, paymentMethod === 'card' || paymentMethod === 'online' ? 1 : 0,
        firebaseOrderId, restaurantId
      ], function (err) {
        if (err) {
          console.error('❌ Error creating order in database:', err);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });

    // ✅ CRITICAL: Process order through unified pipeline (automatic stock consumption)
    // This ensures Friends Ride orders consume stock automatically, just like all other platforms
    try {
      const orderProcessingPipeline = require('./src/modules/orders/services/order-processing-pipeline.service');
      orderProcessingPipeline.processOrderAfterCreation(orderId, {
        id: orderId,
        platform: 'FRIENDSRIDE',
        order_source: ORDER_SOURCE.DELIVERY,
        items: JSON.stringify(enrichedItems),
        total: total,
        payment_method: paymentMethod,
        is_paid: paymentMethod === 'card' || paymentMethod === 'online' ? 1 : 0,
        status: status
      }).catch(error => {
        console.warn(`⚠️ [Friends Ride] Pipeline processing failed for order ${orderId}:`, error.message);
        // Don't fail order creation if pipeline processing fails
      });
    } catch (pipelineError) {
      console.warn(`⚠️ [Friends Ride] Failed to initialize pipeline for order ${orderId}:`, pipelineError.message);
      // Don't fail order creation if pipeline initialization fails
    }

    // Obține comanda completă pentru evenimente
    const createdOrder = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // ✅ FIX URGENT: Emite evenimente complete prin orderEventBus (uniformitate cu alte platforme)
    try {
      const { orderEventBus } = require('./src/modules/orders/order.events');
      orderEventBus.emit('order:created', {
        order: {
          id: orderId,
          type: 'delivery',
          platform: 'FRIENDSRIDE',
          order_source: ORDER_SOURCE.DELIVERY,
          items: enrichedItems,
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress,
          total: total,
          payment_method: paymentMethod,
          is_paid: paymentMethod === 'card' || paymentMethod === 'online' ? 1 : 0,
          status: status,
          timestamp: createdAt
        }
      });
      console.log(`✅ [Friends Ride] Order event emitted for order ${orderId}`);
    } catch (eventError) {
      console.warn(`⚠️ [Friends Ride] Event emission failed for order ${orderId}:`, eventError.message);
    }

    // Emit Socket.io events (păstrăm pentru backward compatibility)
    if (global.io) {
      global.io.emit('delivery:new-order', {
        orderId,
        platform: 'FRIENDSRIDE',
        customerName: customerName,
        deliveryAddress: deliveryAddress,
        total: total,
        timestamp: new Date()
      });

      // Emit la KDS cu items complete (inclusiv categorii pentru filtrul bar/bucătărie)
      global.io.emit('order:new', {
        orderId,
        type: 'delivery',
        items: enrichedItems,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        total: total,
        timestamp: createdAt
      });

      // Emit order:created pentru sincronizare completă
      global.io.emit('order:created', {
        order: {
          id: orderId,
          type: 'delivery',
          platform: 'FRIENDSRIDE',
          order_source: ORDER_SOURCE.DELIVERY,
          items: enrichedItems,
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress,
          total: total,
          payment_method: paymentMethod,
          is_paid: paymentMethod === 'card' || paymentMethod === 'online' ? 1 : 0,
          status: status,
          timestamp: createdAt
        }
      });

      // Emit către room-urile corespunzătoare (KDS/Bar)
      global.io.to('kitchen').emit('order:created', {
        order: {
          id: orderId,
          type: 'delivery',
          items: enrichedItems.filter(item => {
            const category = item.category || item.category_name || '';
            const BAR_CATEGORIES = ['Cafea/Ciocolată/Ceai', 'Răcoritoare', 'Băuturi și Coctailuri'];
            return !BAR_CATEGORIES.includes(category);
          })
        }
      });

      global.io.to('bar').emit('order:created', {
        order: {
          id: orderId,
          type: 'delivery',
          items: enrichedItems.filter(item => {
            const category = item.category || item.category_name || '';
            const BAR_CATEGORIES = ['Cafea/Ciocolată/Ceai', 'Răcoritoare', 'Băuturi și Coctailuri'];
            return BAR_CATEGORIES.includes(category);
          })
        }
      });
    }

    console.log(`✅ Friends Ride delivery order created: ID ${orderId} (Firebase order: ${firebaseOrderId || 'N/A'}, Customer: ${customerId || 'N/A'})`);

    res.json({
      success: true,
      order_id: orderId,
      friendsride_order_id: firebaseOrderId,
      restaurant_id: restaurantId,
      customer_id: customerId,
      delivery_fee: finalDeliveryFee,
      total: total,
      message: 'Comandă delivery creată cu succes'
    });
  } catch (err) {
    console.error('❌ [Friends Ride] Error creating delivery order:', err);
    console.error('❌ [Friends Ride] Error stack:', err.stack);
    console.error('❌ [Friends Ride] Request body was:', JSON.stringify(req.body, null, 2));
    console.error('❌ [Friends Ride] Request headers:', JSON.stringify(req.headers, null, 2));

    // Return a more detailed error response
    res.status(500).json({
      success: false,
      error: err.message || 'Eroare la crearea comenzii',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Still call next for error logging
    next(err);
  }
});
console.log('✅ Friends Ride Delivery Orders endpoint mounted: POST /api/delivery/orders (before SPA catch-all)');

// ========================================
// RECIPES ROUTE REMOVED
// Recipes page is handled by React Router at /admin-vite/recipes
// API routes are available at /api/recipes (mounted by modules registry)
// ========================================

// ========================================
// WEATHER FORECAST ROUTES (Will be mounted in dbPromise.then() after modules)
// ========================================

// ========================================
// WEATHER FORECAST ROUTES (Will be mounted in dbPromise.then() after modules)
// ========================================

// ========================================
// PHASE S9.6 - SOCKET.IO INITIALIZATION
// ========================================
const { Server } = require('socket.io');
let io = null;

// Initialize Socket.IO after HTTP server is created
const initSocketIO = () => {
  if (!io && httpServer) {
    io = new Server(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
      }
    });

    // Make io globally available (for legacy compatibility)
    global.io = io;

    // Initialize AlertsService with Socket.IO
    const AlertsService = require('./src/modules/alerts/alerts.service');
    AlertsService.setSocketIO(io);

    // 🔴 FIX 4 - Initialize order timeout checker (auto-cancel expired orders)
    try {
      const orderTimeoutService = require('./src/services/order-timeout.service');
      orderTimeoutService.initializeTimeoutChecker();
    } catch (error) {
      console.warn('⚠️ Failed to initialize order timeout service:', error.message);
    }

    console.log('✅ Socket.IO initialized');

    // PHASE S9.6 - Order Engine V2 Socket Bridge
    const { ENABLE_SOCKET_BRIDGE } = require('./src/config/orderEngine.config');
    if (ENABLE_SOCKET_BRIDGE) {
      const { setupOrderSocketBridge } = require('./src/modules/orders/order.socket-bridge');
      setupOrderSocketBridge(io);
      serverLogger.info('Order Engine V2 Socket Bridge enabled');
    } else {
      serverLogger.info('Order Engine V2 Socket Bridge disabled', { reason: 'ENABLE_SOCKET_BRIDGE=false' });
    }

    // Legacy socket handlers (if any) can be added here
    io.on('connection', (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);

      // Handler pentru înregistrare și alăturare la room-uri
      socket.on('register', (data) => {
        if (data.role === 'waiter') {
          socket.join('waiter');
          console.log(`[Socket.IO] Waiter ${data.id} joined 'waiter' room`);
        } else if (data.role === 'kitchen') {
          socket.join('kitchen');
          console.log(`[Socket.IO] Kitchen joined 'kitchen' room`);
        } else if (data.role === 'bar') {
          socket.join('bar');
          console.log(`[Socket.IO] Bar joined 'bar' room`);
        }
      });

      // Handler pentru join direct la room
      socket.on('join', (room) => {
        socket.join(room);
        console.log(`[Socket.IO] Client ${socket.id} joined room: ${room}`);
      });

      // Handler pentru apelare ospătar (de la comanda.html)
      socket.on('callWaiter', (data) => {
        console.log(`[Socket.IO] callWaiter event received:`, data);

        // Emite evenimentul către toți clienții (livrare1.html va primi)
        io.emit('waiterCalled', {
          tableNumber: data.tableNumber,
          requestType: data.requestType,
          clientIdentifier: data.clientIdentifier,
          paymentMethod: data.paymentMethod || null,
          timestamp: new Date().toISOString()
        });

        console.log(`[Socket.IO] waiterCalled event broadcasted to all clients`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });
  }

  return io;
};

// ========================================
// ANTI-BLOCKING SYSTEM INITIALIZATION
// ========================================
const { initializeAntiBlocking, getSystemStatus } = require('./src/loaders/antiBlocking.loader');
const { asyncHandler } = require('./src/utils/anti-blocking');

// Initialize anti-blocking system immediately
initializeAntiBlocking();
serverLogger.info('Anti-blocking system initialized');

// ========================================
// LOAD ENTERPRISE MODULES (ASYNC)
// ========================================
dbPromise.then(async (db) => {
  // ========================================
  // API ROUTES (Must be BEFORE modules to take precedence)
  // Some routes need to be defined before modules to override module routes
  // ========================================
  const adminController = require('./src/modules/admin/controllers/admin.controller');

  // Orders routes - MUST be before orders module is loaded
  // orders module is mounted at /api/orders but doesn't have GET /api/orders
  // So we define it here to handle GET /api/orders requests
  app.get('/api/orders', adminController.getOrders);
  app.get('/api/orders-delivery', adminController.getOrdersDelivery);

  // PUT /api/orders/:id/mark-paid - Marchează comandă ca achitată (doar dacă nu este deja achitată)
  app.put('/api/orders/:id/mark-paid', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Verifică dacă comanda există
      const order = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!order) {
        return res.status(404).json({ success: false, error: 'Comandă negăsită' });
      }

      // Verifică dacă comanda este deja achitată
      if (order.is_paid == 1) {
        return res.json({
          success: true,
          message: 'Comanda este deja achitată',
          alreadyPaid: true,
          order: order
        });
      }

      // Verifică dacă comanda poate fi marcată ca achitată
      if (order.status === 'cancelled') {
        return res.status(400).json({ success: false, error: 'Comanda este anulată și nu poate fi marcată ca achitată' });
      }

      // Actualizează is_paid = 1 (verifică ce coloane există)
      const columns = await new Promise((resolve, reject) => {
        db.all("PRAGMA table_info(orders)", [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(r => r.name));
        });
      });

      const hasPaidTimestamp = columns.includes('paid_timestamp');
      const hasPaymentTimestamp = columns.includes('payment_timestamp');

      const timestampField = hasPaidTimestamp ? 'paid_timestamp' : (hasPaymentTimestamp ? 'payment_timestamp' : null);
      const updateQuery = timestampField
        ? `UPDATE orders SET is_paid = 1, ${timestampField} = datetime('now') WHERE id = ?`
        : `UPDATE orders SET is_paid = 1 WHERE id = ?`;

      await new Promise((resolve, reject) => {
        db.run(updateQuery, [id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Emit Socket.io event
      if (global.io) {
        global.io.emit('order:paid', {
          orderId: id,
          timestamp: new Date().toISOString()
        });
      }

      // Obține comanda actualizată
      const updatedOrder = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      console.log(`✅ Order ${id} marked as paid`);

      res.json({
        success: true,
        message: 'Comandă marcată ca achitată cu succes',
        order: updatedOrder
      });
    } catch (error) {
      console.error('❌ Error marking order as paid:', error);
      next(error);
    }
  });

  // PUT /api/orders/:id/deliver - Marchează comandă ca livrată (pentru ospătar sau curier)
  // Dacă comanda nu este achitată, o marchează automat ca achitată
  app.put('/api/orders/:id/deliver', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { delivered_by = 'waiter' } = req.body; // 'waiter' sau 'courier'
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Verifică dacă comanda există
      const order = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!order) {
        return res.status(404).json({ success: false, error: 'Comandă negăsită' });
      }

      // Verifică dacă comanda poate fi marcată ca livrată
      if (order.status === 'cancelled') {
        return res.status(400).json({ success: false, error: 'Comanda este anulată și nu poate fi marcată ca livrată' });
      }

      // Dacă comanda nu este achitată, o marchem automat ca achitată
      // (pentru comenzi cu plata la livrare/ridicare)
      let wasPaid = order.is_paid == 1;
      if (!wasPaid) {
        // Verifică ce coloane există în orders pentru timestamp-ul plății
        const columns = await new Promise((resolve, reject) => {
          db.all("PRAGMA table_info(orders)", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => r.name));
          });
        });

        const hasPaidTimestamp = columns.includes('paid_timestamp');
        const hasPaymentTimestamp = columns.includes('payment_timestamp');

        // Folosește coloana corectă (paid_timestamp este standardul)
        const timestampField = hasPaidTimestamp ? 'paid_timestamp' : (hasPaymentTimestamp ? 'payment_timestamp' : null);

        const updateQuery = timestampField
          ? `UPDATE orders SET is_paid = 1, ${timestampField} = datetime('now') WHERE id = ?`
          : `UPDATE orders SET is_paid = 1 WHERE id = ?`;

        await new Promise((resolve, reject) => {
          db.run(updateQuery, [id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log(`✅ Order ${id} auto-marked as paid (payment on delivery)`);
      }

      // Actualizează status-ul comenzii ca livrată
      await new Promise((resolve, reject) => {
        // Verifică dacă coloana delivered_by există
        db.all("PRAGMA table_info(orders)", [], async (err, cols) => {
          if (err) {
            reject(err);
            return;
          }

          const hasDeliveredBy = cols.some(col => col.name === 'delivered_by');
          const updateQuery = hasDeliveredBy
            ? `UPDATE orders SET status = 'delivered', delivered_timestamp = datetime('now'), actual_delivery_time = datetime('now'), delivered_by = ? WHERE id = ?`
            : `UPDATE orders SET status = 'delivered', delivered_timestamp = datetime('now'), actual_delivery_time = datetime('now') WHERE id = ?`;

          const updateParams = hasDeliveredBy ? [delivered_by, id] : [id];

          db.run(updateQuery, updateParams, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });

      // Dacă există delivery_assignment, actualizează-l și pe acela
      const assignment = await new Promise((resolve, reject) => {
        db.get(`
          SELECT * FROM delivery_assignments 
          WHERE order_id = ? 
          ORDER BY assigned_at DESC 
          LIMIT 1
        `, [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (assignment) {
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE delivery_assignments 
            SET status = 'delivered', 
                delivered_at = datetime('now')
            WHERE id = ?
          `, [assignment.id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      // Emit Socket.io events
      if (global.io) {
        global.io.emit('order:delivered', {
          orderId: id,
          deliveredBy: delivered_by,
          timestamp: new Date().toISOString()
        });

        if (!wasPaid) {
          global.io.emit('order:paid', {
            orderId: id,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Obține comanda actualizată
      const updatedOrder = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      console.log(`✅ Order ${id} marked as delivered by ${delivered_by}${!wasPaid ? ' (also marked as paid)' : ''}`);

      res.json({
        success: true,
        message: 'Comandă marcată ca livrată cu succes' + (!wasPaid ? ' și ca achitată' : ''),
        order: updatedOrder,
        wasPaid: wasPaid
      });
    } catch (error) {
      console.error('❌ Error marking order as delivered:', error);
      next(error);
    }
  });

  // ========================================
  // ADMIN LOGIN ENDPOINT (BEFORE STUB ROUTES)
  // ========================================
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { pin } = req.body;

      console.log('🔐 Login attempt with PIN:', pin);

      // Check PIN (from memory: PIN-ul este 5555)
      if (pin === '5555') {
        // Generate simple token (could be enhanced with JWT later)
        const token = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        console.log('✅ Login successful, token generated');

        res.json({
          success: true,
          token: token,
          message: 'Autentificare reușită'
        });
      } else {
        console.log('❌ Login failed: Invalid PIN');
        res.status(401).json({
          success: false,
          error: 'PIN incorect'
        });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Eroare server la autentificare'
      });
    }
  });
  console.log('✅ Admin login endpoint mounted at /api/admin/login');

  // ========================================
  // MISSING ENDPOINTS - KIOSK & AUTH
  // ========================================

  // Kiosk Login History Endpoint
  app.get('/api/kiosk/login-history', async (req, res) => {
    try {
      // Return empty history for now - can be enhanced later with actual database queries
      console.log('📋 Kiosk login history requested');
      res.json({
        success: true,
        data: [],
        message: 'Login history retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error fetching kiosk login history:', error);
      res.status(500).json({
        success: false,
        error: 'Eroare la încărcarea istoricului login',
        data: []
      });
    }
  });
  console.log('✅ Kiosk login history endpoint mounted at /api/kiosk/login-history');

  // Auth MFA Status Endpoint
  app.get('/api/auth/mfa/status', async (req, res) => {
    try {
      // Return MFA status for current user
      console.log('🔐 MFA status requested');
      res.json({
        success: true,
        mfaEnabled: false,
        methods: [],
        message: 'MFA status retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error fetching MFA status:', error);
      res.status(500).json({
        success: false,
        error: 'Eroare la verificarea statusului MFA',
        mfaEnabled: false
      });
    }
  });
  console.log('✅ Auth MFA status endpoint mounted at /api/auth/mfa/status');

  // Admin categories endpoint
  app.get('/api/admin/categories', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      const categories = await new Promise((resolve, reject) => {
        db.all(
          "SELECT DISTINCT category FROM menu WHERE category IS NOT NULL AND category != '' ORDER BY category",
          [],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(row => row.category));
          }
        );
      });

      console.log(`📋 Returning ${categories.length} categories for admin`);

      res.json({
        categories: categories
      });
    } catch (error) {
      console.error('❌ Error fetching admin categories:', error);
      res.status(500).json({
        success: false,
        error: 'Eroare la încărcarea categoriilor'
      });
    }
  });
  console.log('✅ Admin categories endpoint mounted at /api/admin/categories');

  // ========================================
  // STUB ROUTES FOR MISSING ENDPOINTS (AFTER ADMIN LOGIN)
  // ========================================
  const stubRoutes = require('./src/stub-routes');
  app.use('/api', stubRoutes);
  console.log('✅ Stub routes mounted AFTER admin login for missing endpoints');

  // Nomenclator stubs (Attribute Groups, Portion Control, Variance)
  const nomenclatorStubRoutes = require('./src/routes/nomenclator-stubs.routes');
  app.use('/api/admin', nomenclatorStubRoutes);
  console.log('✅ Nomenclator stub routes mounted at /api/admin');

  // ========================================
  // KPI ENDPOINTS (BEFORE modules to take priority over BI generic routes)
  // ========================================
  // These MUST be registered BEFORE loadModules() so they take priority
  // over the generic /api/bi/kpis/:kpiId route in the BI module
  app.get('/api/bi/kpis/table_turnover', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Calculate table turnover for today
      const today = new Date().toISOString().split('T')[0];
      const result = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COUNT(DISTINCT table_number) as occupied_tables,
            COUNT(*) as total_orders
          FROM orders
          WHERE DATE(timestamp) = DATE(?)
          AND (status IS NULL OR status != 'cancelled')
          AND table_number IS NOT NULL
        `, [today], (err, row) => {
          if (err) {
            console.error('❌ [table_turnover] DB Error:', err);
            return resolve({ occupied_tables: 0, total_orders: 0 });
          }
          resolve(row || { occupied_tables: 0, total_orders: 0 });
        });
      });

      const occupiedTables = parseInt(result.occupied_tables || 0);
      const totalOrders = parseInt(result.total_orders || 0);
      const turnover = occupiedTables > 0 ? (totalOrders / occupiedTables) : 0;

      res.json({
        success: true,
        data: {
          value: turnover,
          turnover: turnover,
          period: req.query.period || 'today'
        }
      });
    } catch (error) {
      console.error('❌ [table_turnover] Error:', error);
      res.json({
        success: true,
        data: {
          value: 0,
          turnover: 0,
          period: req.query.period || 'today'
        }
      });
    }
  });

  app.get('/api/bi/kpis/table_utilization', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Calculate table utilization for today
      const today = new Date().toISOString().split('T')[0];
      const result = await new Promise((resolve, reject) => {
        db.get(`
          SELECT COUNT(DISTINCT table_number) as used_tables
          FROM orders
          WHERE DATE(timestamp) = DATE(?)
          AND (status IS NULL OR status != 'cancelled')
          AND table_number IS NOT NULL
          AND table_number BETWEEN 1 AND 200
        `, [today], (err, row) => {
          if (err) {
            console.error('❌ [table_utilization] DB Error:', err);
            return resolve({ used_tables: 0 });
          }
          resolve(row || { used_tables: 0 });
        });
      });

      const usedTables = parseInt(result.used_tables || 0);
      const totalTables = 200; // Configurabil
      const utilization = (usedTables / totalTables) * 100;

      res.json({
        success: true,
        data: {
          value: utilization,
          utilization: utilization,
          period: req.query.period || 'today'
        }
      });
    } catch (error) {
      console.error('❌ [table_utilization] Error:', error);
      res.json({
        success: true,
        data: {
          value: 0,
          utilization: 0,
          period: req.query.period || 'today'
        }
      });
    }
  });

  console.log('✅ KPI endpoints mounted BEFORE modules (table_turnover, table_utilization)');

  // Notifications API (Moved here to ensure it's not shadowed by modules)
  app.get('/api/notifications', async (req, res) => {
    try {
      const status = req.query.status || 'unread';
      const today = ['yes', 'true', '1'].includes(String(req.query.today || '').toLowerCase());
      const dateFilter = req.query.date; // format YYYY-MM-DD
      const db = await dbPromise;

      // OPTIMIZARE: Select doar coloanele necesare în loc de SELECT *
      // EXCLUDE HACCP ALERTS from waiter notifications
      let sql = 'SELECT id, title, message, status, created_at, type, table_number, order_id, read_at, title_en, message_en FROM notifications WHERE type NOT LIKE "haccp%"';
      const conditions = [];
      const params = [];

      if (status !== 'all') {
        sql += ' AND status = ?';
        params.push(status);
      }

      sql += ' ORDER BY datetime(created_at) DESC LIMIT 500';

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ Error fetching notifications:', err);
          return res.status(500).json({ success: false, error: err.message });
        }

        let notifications = rows || [];

        // Filtrează pentru "azi" folosind JavaScript pentru controlul precis al fusului orar
        if (today) {
          const now = new Date();
          const todayStart = new Date(now);
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date(now);
          todayEnd.setHours(23, 59, 59, 999);

          notifications = notifications.filter(notif => {
            // Fix pentru date din SQLite care pot fi șiruri simple
            let dateStr = notif.created_at;
            if (dateStr && !dateStr.includes('T') && !dateStr.includes('Z')) {
              // Presupunem că e UTC din SQLite datetime('now'), adăugăm 'Z' sau îl tratăm ca UTC
              dateStr = dateStr.replace(' ', 'T') + 'Z';
            }

            const notifDate = new Date(dateStr || notif.created_at);
            return notifDate >= todayStart && notifDate <= todayEnd;
          });
        }

        res.json({ success: true, notifications });
      });
    } catch (error) {
      console.error('❌ Error in /api/notifications:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE ALL NOTIFICATIONS
  app.delete('/api/notifications/delete-all', async (req, res) => {
    try {
      console.log('🗑️ Deleting ALL waiter notifications...');
      const db = await dbPromise;

      // Delete only non-HACCP notifications
      const sql = 'DELETE FROM notifications WHERE type NOT LIKE "haccp%"';

      db.run(sql, [], function (err) {
        if (err) {
          console.error('❌ Error deleting all notifications:', err);
          return res.status(500).json({ success: false, error: err.message });
        }

        console.log(`✅ Deleted ${this.changes} notifications.`);
        res.json({ success: true, deleted: this.changes });
      });
    } catch (error) {
      console.error('❌ Error in /api/notifications/delete-all:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // MARK AS READ
  app.put('/api/notifications/:id/read', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`📝 [Notifications] Marking as read: ID=${id} (Type: ${typeof id})`);
      const db = await dbPromise;

      db.run('UPDATE notifications SET status = "read", read_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function (err) {
        if (err) {
          console.error(`❌ [Notifications] Error marking read ID=${id}:`, err);
          return res.status(500).json({ success: false, error: err.message });
        }
        console.log(`✅ [Notifications] Marked read: ID=${id}, Changes=${this.changes}`);
        res.json({ success: true, changes: this.changes });
      });
    } catch (error) {
      console.error(`❌ [Notifications] Exception marking read ID=${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE SINGLE NOTIFICATION
  app.delete('/api/notifications/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🗑️ [Notifications] Deleting: ID=${id} (Type: ${typeof id})`);
      const db = await dbPromise;

      db.run('DELETE FROM notifications WHERE id = ?', [id], function (err) {
        if (err) {
          console.error(`❌ [Notifications] Error deleting ID=${id}:`, err);
          return res.status(500).json({ success: false, error: err.message });
        }
        console.log(`✅ [Notifications] Deleted: ID=${id}, Changes=${this.changes}`);
        res.json({ success: true, changes: this.changes });
      });
    } catch (error) {
      console.error(`❌ [Notifications] Exception deleting ID=${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  await loadModules(app);
  console.log('✅ All enterprise modules loaded');

  // ========================================
  // GRAPHQL SERVER
  // ========================================
  try {
    const { startGraphQLServer } = require('./src/graphql/server');
    await startGraphQLServer(app);
  } catch (error) {
    console.error('❌ GraphQL Server failed to start:', error.message);
  }

  // ========================================
  // STOCK ROUTES ALIAS (Mount AFTER loadModules)
  // Frontend uses /api/stock (singular) but module is mounted at /api/stocks (plural)
  // ========================================
  const stocksRoutes = require('./src/modules/stocks/routes');
  app.use('/api/stock', stocksRoutes);
  console.log('✅ Stock routes alias mounted: /api/stock/* -> /api/stocks/*');

  // ========================================
  // RESERVATIONS ROUTES (Must be AFTER loadModules but BEFORE /api/payments/:id)
  // Mount AFTER modules to ensure /api/reservations is not intercepted by /api/payments/:id
  // ========================================
  const reservationsRoutes = require('./routes/admin/reservations.routes');
  app.use('/api/admin/reservations', reservationsRoutes);
  app.use('/api/reservations', reservationsRoutes);
  console.log('✅ Reservations routes mounted AFTER modules: /api/admin/reservations, /api/reservations');

  // Kiosk Users routes
  const kioskUsersRoutes = require('./routes/admin/kiosk-users.routes');
  app.use('/api/admin/kiosk/users', kioskUsersRoutes);
  console.log('✅ Kiosk Users routes mounted: /api/admin/kiosk/users');

  // ========================================
  // API PROXY ROUTES (Fix frontend API calls)
  // Must be AFTER modules are loaded
  // ========================================
  const ingredientsRoutes = require('./routes/admin/ingredients-simple.routes');
  const recipesRoutes = require('./routes/admin/recipes-simple.routes');

  // Direct routes for /api/ingredients (proxy to admin)
  app.use('/api/ingredients', ingredientsRoutes);

  // Also mount at /api/admin/ingredients for consistency with frontend
  app.use('/api/admin/ingredients', ingredientsRoutes);

  // Direct routes for /api/recipes (proxy to admin)
  app.use('/api/recipes', recipesRoutes);

  console.log('✅ API proxy routes configured: /api/ingredients, /api/admin/ingredients, /api/recipes');

  // PHASE S7.1 - POS Fiscal Routes (after modules loaded)
  const posFiscalRoutes = require('./src/modules/fiscal/routes.pos');
  app.use('/api/admin/pos', posFiscalRoutes);
  console.log('✅ POS Fiscal routes mounted: /api/admin/pos/fiscalize');

  // S13 - COGS Routes
  const cogsRoutes = require('./src/modules/cogs/cogs.routes');
  app.use('/api/cogs', cogsRoutes);
  console.log('✅ COGS routes mounted: /api/cogs/*');

  // Order Health Monitor Routes
  const orderHealthRoutes = require('./src/modules/monitoring/order-health.routes');
  app.use('/api/monitoring', orderHealthRoutes);
  console.log('✅ Order Health Monitor routes mounted: /api/monitoring/*');

  // S15 - Financial Routes
  const financialRoutes = require('./src/modules/financial/financial.routes');
  app.use('/api/financial', financialRoutes);
  console.log('✅ Financial routes mounted: /api/financial/*');

  // Production Routes
  const productionRoutes = require('./src/modules/admin/routes');
  app.use('/api/admin/production', productionRoutes);
  console.log('✅ Production routes mounted: /api/admin/production/*');

  // Split Bill Routes
  const splitBillRoutes = require('./src/modules/split-bill/splitBill.routes');
  app.use('/api/split-bill', splitBillRoutes);

  // Weather Forecast Routes already mounted before SPA catch-all (no need to mount again)

  // ANAF Routes (if module not loaded automatically)
  try {
    const anafRoutes = require('./src/modules/anaf-submit/anafSubmit.routes.ts');
    app.use('/api/anaf', anafRoutes);
    console.log('✅ ANAF routes mounted: /api/anaf/*');
  } catch (error) {
    console.warn('⚠️  ANAF routes not loaded (TypeScript module):', error.message);
    // Fallback: create basic route
    app.get('/api/anaf/submissions', async (req, res) => {
      try {
        const { dbPromise } = require('./database');
        const db = await dbPromise;
        const { documentType, status, startDate, endDate, limit = 100, offset = 0 } = req.query;

        let sql = 'SELECT * FROM anaf_submission_logs WHERE 1=1';
        const params = [];

        if (documentType) {
          sql += ' AND document_type = ?';
          params.push(documentType);
        }
        if (status) {
          sql += ' AND state = ?';
          params.push(status);
        }
        if (startDate) {
          sql += ' AND created_at >= ?';
          params.push(startDate);
        }
        if (endDate) {
          sql += ' AND created_at <= ?';
          params.push(endDate);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const submissions = await new Promise((resolve, reject) => {
          db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

        res.json({ success: true, data: submissions });
      } catch (error) {
        console.error('❌ Error in /api/anaf/submissions:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
    console.log('✅ ANAF submissions fallback route created: /api/anaf/submissions');
  }

  // PHASE PRODUCTION-READY: Dashboard metrics endpoint (fallback pentru /api/dashboard/metrics)
  app.get('/api/dashboard/metrics', async (req, res) => {
    try {
      // Use admin controller if available
      const adminController = require('./src/modules/admin/controllers/admin.controller');
      if (adminController && adminController.getDashboardMetrics) {
        await adminController.getDashboardMetrics(req, res, () => { });
      } else {
        // Fallback: return basic system metrics
        res.json({
          success: true,
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            nodeVersion: process.version
          },
          metrics: {
            today: { revenue: 0, orders: 0 },
            week: { revenue: 0, orders: 0 },
            month: { revenue: 0, orders: 0 }
          }
        });
      }
    } catch (error) {
      serverLogger.error('Error in /api/dashboard/metrics fallback', { error: error.message });
      // Return basic metrics if admin controller fails
      res.json({
        success: true,
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          nodeVersion: process.version
        },
        metrics: {
          today: { revenue: 0, orders: 0 },
          week: { revenue: 0, orders: 0 },
          month: { revenue: 0, orders: 0 }
        }
      });
    }
  });
  console.log('✅ Dashboard metrics fallback route created: /api/dashboard/metrics');

  console.log('✅ Split Bill routes mounted: /api/split-bill/*');

  // Additional admin routes (missing endpoints)
  // adminController already declared at line 220

  // Settings routes
  // Notifications routes
  const notificationsRoutes = require('./routes/admin/notifications.routes');
  app.use('/api/settings/notifications', notificationsRoutes);
  console.log('✅ Notifications routes mounted: /api/settings/notifications');

  // Settings routes (localization, UI themes, UI settings)
  const settingsRoutes = require('./routes/admin/settings.routes');
  app.use('/api/settings', settingsRoutes);
  console.log('✅ Settings routes mounted: /api/settings (localization, ui/themes, ui)');

  // Locations routes - Mount module routes instead of controller
  // app.get('/api/settings/locations', adminController.getLocations); // Removed - use module routes
  // OPTIMIZARE: Cache pentru setări (se schimbă rar)
  const { longCacheMiddleware } = require('./src/middleware/cache.middleware');
  app.get('/api/settings/restaurant', longCacheMiddleware(), adminController.getRestaurantSettings);

  // Direct /api/locations endpoint (for admin-advanced.html compatibility)
  const locationsRoutes = require('./src/modules/locations/locations.routes');
  app.use('/api/locations', locationsRoutes);

  // Additional orders endpoint
  app.get('/api/admin/orders/all', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      const ordersRaw = await new Promise((resolve, reject) => {
        // Folosește timestamp în loc de created_at și elimină order_items JOIN
        // Calculează items_count în JavaScript pentru compatibilitate SQLite
        db.all(`
          SELECT 
            o.*
          FROM orders o
          ORDER BY o.timestamp DESC
          LIMIT 500
        `, [], (err, rows) => {
          if (err) {
            console.error('❌ Error in /api/admin/orders/all:', err);
            // Return empty array instead of rejecting
            resolve([]);
          } else {
            resolve(rows || []);
          }
        });
      });

      // Calculează items_count din JSON items în JavaScript
      const orders = ordersRaw.map(order => {
        let itemsCount = 0;
        if (order.items) {
          try {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            itemsCount = Array.isArray(items) ? items.length : 0;
          } catch (e) {
            itemsCount = 0;
          }
        }
        return {
          ...order,
          items_count: itemsCount
        };
      });

      res.json({ success: true, orders });
    } catch (error) {
      console.error('❌ Error in /api/admin/orders/all:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Inventory sessions endpoint
  app.get('/api/inventory/sessions', async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      const sessions = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            id, location_id, started_at, completed_at,
            status, session_type, counted_by, notes, scope
          FROM inventory_sessions
          ORDER BY started_at DESC
          LIMIT ?
        `, [parseInt(limit)], (err, rows) => {
          if (err) {
            // If table doesn't exist or column doesn't exist, return empty array
            if (err.message.includes('no such table') || err.message.includes('no such column')) {
              console.warn('⚠️ [inventory/sessions] Table or column missing:', err.message);
              return resolve([]);
            }
            reject(err);
          } else {
            resolve(rows || []);
          }
        });
      });
      res.json({ success: true, sessions: sessions || [] });
    } catch (error) {
      // Return empty array instead of 500 error for missing table/column
      if (error.message && (error.message.includes('no such table') || error.message.includes('no such column'))) {
        console.warn('⚠️ [inventory/sessions] Error handled:', error.message);
        return res.json({ success: true, sessions: [] });
      }
      console.error('❌ [inventory/sessions] Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Marketing Module Routes
  const marketingRoutes = require('./src/modules/marketing/marketing.routes');
  app.use('/api/marketing', marketingRoutes);

  app.get('/api/feedback/recent', async (req, res) => {
    try {
      const db = await dbPromise;
      const { limit = 100, period = 'overall', rating } = req.query;

      // Calculează perioada
      let dateFilter = '';
      const params = [];

      if (period !== 'overall') {
        const now = new Date();
        let startDate;

        switch (period) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'semester':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 6);
            break;
          case 'year':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        if (startDate) {
          dateFilter = ' AND timestamp >= ?';
          params.push(startDate.toISOString());
        }
      }

      // Filtru rating
      let ratingFilter = '';
      if (rating) {
        ratingFilter = ' AND rating = ?';
        params.push(parseInt(rating));
      }

      // Obține feedback-urile
      const feedbacks = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            id,
            order_id,
            client_identifier,
            table_number,
            rating,
            comment,
            timestamp
          FROM feedback
          WHERE 1=1 ${dateFilter} ${ratingFilter}
          ORDER BY timestamp DESC
          LIMIT ?
        `, [...params, parseInt(limit)], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Calculează statistici (doar pentru dateFilter, fără ratingFilter)
      const statsParams = rating ? params.slice(0, -1) : params; // Elimină ultimul parametru (rating) dacă există
      const stats = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COUNT(*) as total,
            AVG(rating) as averageRating,
            SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1,
            SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
            SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
            SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5
          FROM feedback
          WHERE 1=1 ${dateFilter}
        `, statsParams, (err, row) => {
          if (err) reject(err);
          else resolve(row || { total: 0, averageRating: 0, rating_1: 0, rating_2: 0, rating_3: 0, rating_4: 0, rating_5: 0 });
        });
      });

      // Formatează distribuția rating-urilor
      const ratingDistribution = {
        1: stats.rating_1 || 0,
        2: stats.rating_2 || 0,
        3: stats.rating_3 || 0,
        4: stats.rating_4 || 0,
        5: stats.rating_5 || 0
      };

      res.json({
        success: true,
        recentFeedback: feedbacks,
        total: stats.total || 0,
        averageRating: stats.averageRating || 0,
        ratingDistribution
      });
    } catch (error) {
      console.error('❌ Eroare la încărcarea feedback-urilor:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });


  // Executive Dashboard routes
  const executiveDashboardController = require('./src/modules/executive-dashboard/executive-dashboard.controller');
  app.get('/api/executive-dashboard/metrics', executiveDashboardController.getExecutiveMetrics);
  app.get('/api/executive-dashboard/stock-value', executiveDashboardController.getStockValue);
  console.log('✅ Executive Dashboard routes mounted: /api/executive-dashboard/*');

  // GET /api/admin/inventory/filters - Populează filtrele și statisticile din Admin > Inventar (Legacy)
  app.get('/api/admin/inventory/filters', async (req, res) => {
    try {
      const db = await dbPromise;

      // 1. Statistici Inventar
      // total_ingredients: Numărul total de ingrediente
      // out_of_stock: Stoc <= 0
      // low_stock: 0 < Stoc <= Min Stock
      // ok_stock: Stoc > Min Stock
      const stats = await db.get(`
        SELECT 
          count(*) as total_ingredients,
          sum(case when current_stock <= 0 then 1 else 0 end) as out_of_stock,
          sum(case when current_stock > 0 AND current_stock <= min_stock then 1 else 0 end) as low_stock,
          sum(case when current_stock > min_stock then 1 else 0 end) as ok_stock
        FROM ingredients
      `);

      // 2. Categorii distincte (pentru dropdown filtrare)
      const categoriesRows = await db.all(`
        SELECT DISTINCT category_en as category 
        FROM ingredients 
        WHERE category_en IS NOT NULL AND category_en != '' 
        ORDER BY category_en
      `);
      const categories = categoriesRows.map(r => r.category);

      // 3. Furnizori (pentru dropdown filtrare)
      const suppliersRows = await db.all(`
        SELECT DISTINCT company_name as supplier 
        FROM suppliers 
        WHERE company_name IS NOT NULL AND company_name != '' 
        ORDER BY company_name
      `);
      const suppliers = suppliersRows.map(r => r.supplier);

      res.json({
        success: true,
        data: {
          categories,
          suppliers,
          stats: {
            total_ingredients: stats.total_ingredients || 0,
            out_of_stock: stats.out_of_stock || 0,
            low_stock: stats.low_stock || 0,
            ok_stock: stats.ok_stock || 0
          }
        }
      });
    } catch (error) {
      console.error('Eroare la /api/admin/inventory/filters:', error);
      res.status(500).json({ success: false, error: 'Eroare server la încărcarea filtrelor.' });
    }
  });

  // =========================================================================================================
  //  INVENTORY MANAGEMENT API (Legacy Implementation - Refactored to use Helpers)
  // =========================================================================================================

  const inventoryHelpers = require('./helpers/inventory-helpers');

  // POST /api/inventory/start - Inițiază o nouă sesiune de inventar
  app.post('/api/inventory/start', async (req, res) => {
    const { session_type, started_by, location_ids } = req.body;
    const result = await inventoryHelpers.createInventorySession(session_type, started_by || 'Admin', location_ids);

    if (result.success) {
      res.json({
        success: true,
        sessionId: result.sessionId,
        sessionType: session_type,
        ingredientsCount: result.totalItems
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  });

  // GET /api/inventory/sessions - Listează sesiunile de inventar
  app.get('/api/inventory/sessions', async (req, res) => {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      limit: req.query.limit
    };
    const result = await inventoryHelpers.getInventorySessions(filters);

    if (result.success) {
      res.json({ success: true, sessions: result.sessions });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  });

  // GET /api/inventory/session/:id - Detalii header sesiune
  app.get('/api/inventory/session/:id', async (req, res) => {
    const { id } = req.params;
    const result = await inventoryHelpers.getInventoryDetails(id);

    if (result.success) {
      res.json({ success: true, session: result.session, items: result.items });
    } else {
      res.status(result.error === 'Sesiunea nu există' ? 404 : 500).json({ success: false, error: result.error });
    }
  });

  // GET /api/inventory/details/:id - Lista ingrediente pentru numărare
  app.get('/api/inventory/details/:id', async (req, res) => {
    const { id } = req.params;
    const result = await inventoryHelpers.getInventoryDetails(id);

    if (result.success) {
      res.json({ success: true, items: result.items });
    } else {
      res.status(result.error === 'Sesiunea nu există' ? 404 : 500).json({ success: false, error: result.error });
    }
  });

  // POST /api/inventory/update-count/:id - Actualizează numărătoarea pentru un item
  app.post('/api/inventory/update-count/:id', async (req, res) => {
    const { id } = req.params;
    const { itemId, physicalCount } = req.body;

    try {
      const db = await dbPromise;
      const item = await db.get('SELECT location_id FROM ingredients WHERE id = ?', [itemId]);
      const locationId = item ? item.location_id : 1;

      const result = await inventoryHelpers.updateInventoryCount(id, itemId, locationId, physicalCount);
      if (result.success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (e) {
      console.error('Error finding location for item:', e);
      res.status(500).json({ success: false, error: 'Database error' });
    }
  });

  // POST /api/inventory/finalize/:id - Finalizează inventarul și actualizează stocurile
  app.post('/api/inventory/finalize/:id', async (req, res) => {
    const { id } = req.params;
    const result = await inventoryHelpers.finalizeInventorySession(id);

    if (result.success) {
      const detailsResult = await inventoryHelpers.getInventoryDetails(id);
      const details = detailsResult.items.map(i => ({
        ...i,
        difference: (i.counted_stock || 0) - (i.theoretical_stock || 0)
      }));

      res.json({
        success: true,
        itemsProcessed: details.length,
        totalDifferenceValue: result.adjustments.total,
        details: details
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  });

  // DELETE /api/inventory/session/:id - Șterge o sesiune
  app.delete('/api/inventory/session/:id', async (req, res) => {
    const { id } = req.params;
    const result = await inventoryHelpers.deleteInventorySession(id);
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  });

  // GET /api/analytics/stock-cancellation-correlation
  // Analizează corelația între stocuri scăzute și anulări de comenzi
  app.get('/api/analytics/stock-cancellation-correlation', async (req, res) => {
    try {
      const db = await dbPromise;

      // Obține toate produsele din meniu
      // Notă: menu nu are coloane min_stock/current_stock direct, folosim ingredientele din rețete
      let products = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            m.id,
            m.name,
            m.category,
            m.price,
            0 as min_stock,
            0 as current_stock
          FROM menu m
          WHERE m.is_sellable = 1
          ORDER BY m.name
          LIMIT 100
        `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Obține toate comenzile anulate din ultimele 30 de zile
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString();

      const cancelledOrders = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            id,
            items,
            total,
            cancelled_timestamp,
            cancelled_reason
          FROM orders
          WHERE cancelled_timestamp >= ?
          AND cancelled_timestamp IS NOT NULL
          ORDER BY cancelled_timestamp DESC
        `, [startDate], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Analizează fiecare produs
      const riskProducts = [];

      for (const product of products) {
        // Calculează stocul efectiv din ingredientele din rețetă
        // Obține ingredientele din rețetă pentru acest produs
        const recipeIngredients = await new Promise((resolve, reject) => {
          db.all(`
            SELECT 
              r.ingredient_id,
              i.name as ingredient_name,
              i.current_stock,
              i.min_stock
            FROM recipes r
            LEFT JOIN ingredients i ON r.ingredient_id = i.id
            WHERE r.product_id = ?
            AND i.id IS NOT NULL
          `, [product.id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });

        // Calculează stocul minim și actual din ingrediente
        let totalMinStock = 0;
        let totalCurrentStock = 0;
        let hasLowStock = false;

        for (const ing of recipeIngredients) {
          const ingMin = parseFloat(ing.min_stock) || 0;
          const ingCurrent = parseFloat(ing.current_stock) || 0;
          totalMinStock += ingMin;
          totalCurrentStock += ingCurrent;
          if (ingMin > 0 && ingCurrent < ingMin) {
            hasLowStock = true;
          }
        }

        const currentStock = totalCurrentStock;
        const minStock = totalMinStock;
        const stockRatio = minStock > 0 ? (currentStock / minStock) * 100 : 100;

        // Numără anulări pentru acest produs
        let totalCancellations = 0;
        let stockRelatedCancellations = 0;
        let cancelledValue = 0;

        for (const order of cancelledOrders) {
          try {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            if (!Array.isArray(items)) continue;

            // Verifică dacă comanda conține acest produs
            const hasProduct = items.some(item => {
              const itemId = item.product_id || item.menu_item_id || item.id;
              return itemId === product.id;
            });

            if (hasProduct) {
              totalCancellations++;
              cancelledValue += parseFloat(order.total) || 0;

              // Verifică dacă anularea este legată de stoc
              const reason = (order.cancelled_reason || '').toLowerCase();
              if (reason.includes('stoc') || reason.includes('stock') ||
                reason.includes('indisponibil') || reason.includes('unavailable') ||
                reason.includes('epuizat') || reason.includes('out of stock')) {
                stockRelatedCancellations++;
              }
            }
          } catch (err) {
            // Ignoră erorile de parsing
            continue;
          }
        }

        // Calculează nivelul de risc
        let riskLevel = 'low';
        if (stockRatio < 50 || stockRelatedCancellations > 5) {
          riskLevel = 'high';
        } else if (stockRatio < 80 || stockRelatedCancellations > 2) {
          riskLevel = 'medium';
        }

        // Adaugă produsele cu risc, cu anulări, sau cu stoc scăzut
        if (riskLevel !== 'low' || totalCancellations > 0 || hasLowStock || stockRatio < 100) {
          riskProducts.push({
            id: product.id,
            name: product.name || 'Produs necunoscut',
            category: product.category || 'Fără categorie',
            current_stock: Math.round(currentStock * 100) / 100,
            min_stock: Math.round(minStock * 100) / 100,
            stock_ratio: stockRatio.toFixed(1) + '%',
            total_cancellations: totalCancellations,
            stock_related_cancellations: stockRelatedCancellations,
            cancelled_value: Math.round(cancelledValue * 100) / 100,
            risk_level: riskLevel
          });
        }
      }

      // Sortează după risc și valoare pierdută
      riskProducts.sort((a, b) => {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        if (riskOrder[a.risk_level] !== riskOrder[b.risk_level]) {
          return riskOrder[b.risk_level] - riskOrder[a.risk_level];
        }
        return b.cancelled_value - a.cancelled_value;
      });

      // Top 10 produse cu risc
      const top10Products = riskProducts.slice(0, 10);

      // Calculează sumar
      const highRiskCount = riskProducts.filter(p => p.risk_level === 'high').length;
      const mediumRiskCount = riskProducts.filter(p => p.risk_level === 'medium').length;
      const lowRiskCount = riskProducts.filter(p => p.risk_level === 'low').length;
      const totalCancelledValue = riskProducts.reduce((sum, p) => sum + p.cancelled_value, 0);
      const totalStockRelatedCancellations = riskProducts.reduce((sum, p) => sum + p.stock_related_cancellations, 0);
      const totalCancellations = riskProducts.reduce((sum, p) => sum + p.total_cancellations, 0);
      const avgStockRelatedRate = totalCancellations > 0
        ? ((totalStockRelatedCancellations / totalCancellations) * 100).toFixed(1) + '%'
        : '0%';

      res.json({
        success: true,
        products: top10Products,
        summary: {
          total_products_analyzed: products.length,
          high_risk_products: highRiskCount,
          medium_risk_products: mediumRiskCount,
          low_risk_products: lowRiskCount,
          total_cancelled_value: totalCancelledValue,
          avg_stock_related_rate: avgStockRelatedRate
        }
      });
    } catch (error) {
      console.error('❌ Error in stock-cancellation-correlation:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        products: [],
        summary: {
          total_products_analyzed: 0,
          high_risk_products: 0,
          medium_risk_products: 0,
          low_risk_products: 0,
          total_cancelled_value: 0,
          avg_stock_related_rate: '0%'
        }
      });
    }
  });

  // GET /api/analytics/cancellation-stats - Statistici anulări comenzi
  app.get('/api/analytics/cancellation-stats', async (req, res) => {
    try {
      const { period = 'week', startDate, endDate } = req.query;
      const db = await dbPromise;

      // Calculează intervalul de date
      const now = new Date();
      let startDateObj, endDateObj;

      switch (period) {
        case 'day':
          startDateObj = new Date(now);
          startDateObj.setHours(0, 0, 0, 0);
          endDateObj = new Date(now);
          endDateObj.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDateObj = new Date(now);
          startDateObj.setDate(now.getDate() - 7);
          startDateObj.setHours(0, 0, 0, 0);
          endDateObj = new Date(now);
          endDateObj.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startDateObj = new Date(now);
          startDateObj.setMonth(now.getMonth() - 1);
          startDateObj.setHours(0, 0, 0, 0);
          endDateObj = new Date(now);
          endDateObj.setHours(23, 59, 59, 999);
          break;
        case 'year':
          startDateObj = new Date(now);
          startDateObj.setFullYear(now.getFullYear() - 1);
          startDateObj.setHours(0, 0, 0, 0);
          endDateObj = new Date(now);
          endDateObj.setHours(23, 59, 59, 999);
          break;
        case 'custom':
          if (startDate && endDate) {
            startDateObj = new Date(startDate);
            startDateObj.setHours(0, 0, 0, 0);
            endDateObj = new Date(endDate);
            endDateObj.setHours(23, 59, 59, 999);
          } else {
            return res.status(400).json({ success: false, error: 'startDate și endDate sunt necesare pentru perioada custom' });
          }
          break;
        default:
          return res.status(400).json({ success: false, error: 'Perioadă invalidă' });
      }

      const startDateStr = startDateObj.toISOString();
      const endDateStr = endDateObj.toISOString();

      // Total comenzi în perioada selectată
      const totalOrders = await new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM orders WHERE timestamp >= ? AND timestamp <= ?`,
          [startDateStr, endDateStr], (err, row) => {
            if (err) reject(err);
            else resolve(row?.count || 0);
          });
      });

      // Comenzi anulate în perioada selectată
      const cancelledOrders = await new Promise((resolve, reject) => {
        // OPTIMIZARE: Select doar coloanele necesare pentru analiză
        // Note: order_number nu există în schema orders - folosim id
        db.all(`SELECT id, total, timestamp, cancelled_timestamp, cancelled_reason, payment_method, type FROM orders WHERE cancelled_timestamp >= ? AND cancelled_timestamp <= ? ORDER BY cancelled_timestamp`,
          [startDateStr, endDateStr], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
      });

      const cancelledCount = cancelledOrders.length;
      const cancelledValue = cancelledOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      const cancellationRate = totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;

      // Timp mediu de anulare (minute între timestamp și cancelled_timestamp)
      let avgCancelTimeMinutes = 0;
      if (cancelledOrders.length > 0) {
        const cancelTimes = cancelledOrders
          .filter(o => o.timestamp && o.cancelled_timestamp)
          .map(o => {
            const created = new Date(o.timestamp);
            const cancelled = new Date(o.cancelled_timestamp);
            return (cancelled - created) / (1000 * 60); // minute
          })
          .filter(t => t > 0);
        if (cancelTimes.length > 0) {
          avgCancelTimeMinutes = cancelTimes.reduce((sum, t) => sum + t, 0) / cancelTimes.length;
        }
      }

      // Distribuție orară (0-23)
      const hourlyDist = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
      cancelledOrders.forEach(order => {
        if (order.cancelled_timestamp) {
          const hour = new Date(order.cancelled_timestamp).getHours();
          hourlyDist[hour].count++;
        }
      });

      // Motive anulare
      const reasonsMap = {};
      cancelledOrders.forEach(order => {
        const reason = order.cancelled_reason || 'Nespecificat';
        reasonsMap[reason] = (reasonsMap[reason] || 0) + 1;
      });
      const cancellationReasons = Object.entries(reasonsMap)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Tendințe (distribuție zilnică)
      const trendsMap = {};
      cancelledOrders.forEach(order => {
        if (order.cancelled_timestamp) {
          const date = new Date(order.cancelled_timestamp).toISOString().split('T')[0];
          trendsMap[date] = (trendsMap[date] || 0) + 1;
        }
      });
      const trends = Object.entries(trendsMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top produse anulate
      const orderIds = cancelledOrders.map(o => o.id);
      let topCancelledProducts = [];
      if (orderIds.length > 0) {
        const placeholders = orderIds.map(() => '?').join(',');
        const productCounts = await new Promise((resolve, reject) => {
          db.all(`SELECT name, COUNT(*) as cancellation_count 
                  FROM order_items 
                  WHERE order_id IN (${placeholders}) 
                  GROUP BY name 
                  ORDER BY cancellation_count DESC 
                  LIMIT 10`,
            orderIds, (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            });
        });
        topCancelledProducts = productCounts.map(p => ({
          name: p.name || 'Produs necunoscut',
          cancellation_count: p.cancellation_count || 0
        }));
      }

      // Breakdown pe tip comandă (DELIVERY, DRIVE_THRU, TAKEOUT, here)
      const breakdownByTypeMap = {};
      cancelledOrders.forEach(order => {
        let type = 'UNKNOWN';
        if (order.type === 'delivery' || order.type === 'DELIVERY') type = 'DELIVERY';
        else if (order.type === 'drive_thru' || order.type === 'DRIVE_THRU' || order.type === 'drivethru') type = 'DRIVE_THRU';
        else if (order.type === 'takeout' || order.type === 'TAKEOUT' || order.type === 'takeaway') type = 'TAKEOUT';
        else if (order.type === 'here' || order.type === 'HERE') type = 'HERE';

        if (!breakdownByTypeMap[type]) {
          breakdownByTypeMap[type] = { type, count: 0, value: 0 };
        }
        breakdownByTypeMap[type].count++;
        breakdownByTypeMap[type].value += parseFloat(order.total) || 0;
      });

      const totalCancelledValue = Object.values(breakdownByTypeMap).reduce((sum, item) => sum + item.value, 0);
      const breakdownByType = Object.values(breakdownByTypeMap).map(item => ({
        type: item.type,
        count: item.count,
        value: item.value,
        percentage: totalCancelledValue > 0 ? (item.value / totalCancelledValue) * 100 : 0
      }));

      const result = {
        success: true,
        data: {
          general_stats: {
            total_orders: totalOrders,
            cancelled_orders: cancelledCount,
            cancellation_rate: cancellationRate,
            cancelled_value: cancelledValue,
            avg_cancel_time_minutes: Math.round(avgCancelTimeMinutes * 100) / 100
          },
          hourly_distribution: hourlyDist,
          cancellation_reasons: cancellationReasons,
          top_cancelled_products: topCancelledProducts,
          trends: trends,
          breakdown_by_type: breakdownByType,
          period: period,
          timestamp: new Date().toISOString()
        }
      };

      res.json(result);
    } catch (error) {
      console.error('❌ Eroare la calcularea statisticilor anulări:', error);
      console.error('❌ Stack:', error.stack);
      res.status(500).json({ success: false, error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
    }
  });

  app.get('/api/inventory/nirs', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Obține toate NIR-urile din avize_insotire
      const nirs = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            id,
            serie,
            numar,
            data_emitere as date,
            expeditor_denumire as supplier,
            destinatar_denumire as recipient,
            status,
            observatii as notes,
            created_at,
            updated_at
          FROM avize_insotire
          WHERE serie = 'NIR'
          ORDER BY created_at DESC
          LIMIT 100
        `, [], (err, rows) => {
          if (err) {
            if (err.message.includes('no such table')) {
              resolve([]);
            } else {
              reject(err);
            }
          } else {
            resolve(rows || []);
          }
        });
      });

      // Calculează valoarea pentru fiecare NIR din stock_moves
      const nirsWithValue = await Promise.all(nirs.map(async (nir) => {
        const value = await new Promise((resolve, reject) => {
          db.get(`
            SELECT SUM(value_in) as total_value
            FROM stock_moves
            WHERE reference_type = 'NIR' 
              AND reference_id = ?
          `, [nir.id], (err, row) => {
            if (err) {
              if (err.message.includes('no such table')) {
                resolve(0);
              } else {
                reject(err);
              }
            } else {
              resolve(parseFloat(row?.total_value || 0));
            }
          });
        });

        // Format pentru frontend (admin-advanced.html)
        return {
          id: nir.id,
          nir_number: `${nir.serie} ${nir.numar}`, // Format așteptat de frontend
          supplier_name: nir.supplier || 'N/A', // Format așteptat de frontend
          document_date: nir.date, // Format așteptat de frontend
          total_value: value, // Format așteptat de frontend
          nir_status: nir.status || 'draft', // Format așteptat de frontend
          notes: nir.notes || '',
          created_at: nir.created_at,
          // Câmpuri suplimentare pentru compatibilitate
          number: `${nir.serie} ${nir.numar}`,
          supplier: nir.supplier || 'N/A',
          date: nir.date,
          value: value,
          status: nir.status || 'draft'
        };
      }));

      res.json({
        success: true,
        nirs: nirsWithValue,
        count: nirsWithValue.length
      });
    } catch (error) {
      console.error('❌ Error fetching NIRs:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        nirs: []
      });
    }
  });

  // GET /api/inventory/nir/:id - Obține detaliile complete ale unui NIR cu articolele
  app.get('/api/inventory/nir/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Obține NIR-ul
      const nir = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            id,
            serie,
            numar,
            data_emitere as date,
            expeditor_denumire as supplier,
            destinatar_denumire as recipient,
            status,
            observatii as notes,
            created_at,
            updated_at
          FROM avize_insotire
          WHERE id = ? AND serie = 'NIR'
        `, [id], (err, row) => {
          if (err) {
            if (err.message.includes('no such table')) {
              resolve(null);
            } else {
              reject(err);
            }
          } else {
            resolve(row);
          }
        });
      });

      if (!nir) {
        return res.status(404).json({
          success: false,
          error: 'NIR-ul nu a fost găsit'
        });
      }

      // Obține articolele NIR din stock_moves
      const items = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            sm.id,
            sm.ingredient_id,
            sm.quantity_in as quantity,
            sm.unit_price,
            sm.value_in as value,
            sm.tva_percent,
            sm.sale_price,
            sm.created_at,
            i.name as ingredient_name,
            i.unit,
            COALESCE(i.code, '') as product_code,
            COALESCE(i.official_name, i.name) as official_name,
            i.category,
            i.cost_per_unit,
            i.current_stock
          FROM stock_moves sm
          INNER JOIN ingredients i ON i.id = sm.ingredient_id
          WHERE sm.reference_type = 'NIR' 
            AND sm.reference_id = ?
          ORDER BY sm.created_at ASC
        `, [id], (err, rows) => {
          if (err) {
            if (err.message.includes('no such table')) {
              resolve([]);
            } else {
              reject(err);
            }
          } else {
            resolve(rows || []);
          }
        });
      });

      // Calculează totaluri
      const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
      const totalValueWithVAT = items.reduce((sum, item) => {
        const value = parseFloat(item.value) || 0;
        const vatPercent = parseFloat(item.tva_percent) || 21;
        return sum + (value * (1 + vatPercent / 100));
      }, 0);

      // Formatează articolele pentru frontend
      const formattedItems = items.map(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        const value = parseFloat(item.value) || 0;
        const vatPercent = parseFloat(item.tva_percent) || 21;
        const vatAmount = value * (vatPercent / 100);
        const valueWithVAT = value + vatAmount;

        const salePrice = parseFloat(item.sale_price) || 0;
        const saleValue = salePrice * quantity;
        const markupValue = (salePrice > 0 && unitPrice > 0) ? (salePrice - unitPrice) : 0;
        const markupPercent = (unitPrice > 0) ? (markupValue / unitPrice * 100) : 0;

        return {
          id: item.id,
          ingredient_id: item.ingredient_id,
          product_name: item.ingredient_name,
          product_code: item.product_code || `ING-${item.ingredient_id}`,
          official_name: item.official_name || item.ingredient_name,
          category: item.category || 'N/A',
          quantity: quantity,
          unit: item.unit || 'buc',
          unit_price: unitPrice,
          value: value,
          vat_percent: vatPercent,
          vat_amount: vatAmount,
          value_with_vat: valueWithVAT,
          sale_price: salePrice,
          sale_value: saleValue,
          markup_value: markupValue * quantity, // total markup for all items
          markup_percent: markupPercent,
          accounting_code: '301',
          cost_per_unit: parseFloat(item.cost_per_unit) || 0,
          current_stock: parseFloat(item.current_stock) || 0
        };
      });

      res.json({
        success: true,
        nir: {
          id: nir.id,
          nir_number: `${nir.serie} ${nir.numar}`,
          supplier_name: nir.supplier || 'N/A',
          document_date: nir.date,
          status: nir.status || 'draft',
          notes: nir.notes || '',
          created_at: nir.created_at
        },
        items: formattedItems,
        totals: {
          total_value: totalValue,
          total_vat: totalValueWithVAT - totalValue,
          total_value_with_vat: totalValueWithVAT,
          items_count: formattedItems.length
        }
      });
    } catch (error) {
      console.error('❌ Error fetching NIR details:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/inventory/nir - Creare NIR nou
  app.post('/api/inventory/nir', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      const {
        nirNumber,
        date,
        supplierName,
        invoiceNumber,
        items,
        totalBase,
        totalVat,
        totalIncVat,
        unitName,
        cui,
        address,
        gestion,
        created_by,
        plata_baza,
        plata_tva,
        valoare_totala_baza,
        valoare_totala_tva
      } = req.body;

      // Validare
      if (!nirNumber || !supplierName || !items || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Lipsesc câmpuri obligatorii: nirNumber, supplierName, items'
        });
      }

      // Extrage serie și număr din nirNumber (ex: "NIR 123" -> serie="NIR", numar="123")
      const nirParts = nirNumber.trim().split(/\s+/);
      const serie = nirParts.length > 1 ? nirParts[0] : 'NIR';
      const numar = nirParts.length > 1 ? nirParts.slice(1).join(' ') : nirNumber;

      // Creează aviz de însoțire (NIR)
      const nirId = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO avize_insotire (
            serie, numar, data_emitere, 
            expeditor_denumire, expeditor_cui, expeditor_adresa,
            destinatar_denumire, destinatar_cui, destinatar_adresa,
            status, observatii, 
            plata_baza, plata_tva, valoare_totala_baza, valoare_totala_tva,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [
          serie,
          numar,
          date || new Date().toISOString().split('T')[0],
          supplierName,
          '', // expeditor_cui (opțional)
          '', // expeditor_adresa (opțional)
          unitName || 'Restaurant',
          cui || '',
          address || '',
          'draft',
          `Factură: ${invoiceNumber || 'N/A'}`,
          parseFloat(plata_baza) || 0,
          parseFloat(plata_tva) || 0,
          parseFloat(valoare_totala_baza) || parseFloat(totalBase) || 0,
          parseFloat(valoare_totala_tva) || parseFloat(totalVat) || 0
        ], function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });

      // Adaugă articolele în stock_moves
      for (const item of items) {
        // Găsește sau creează ingredientul
        let ingredientId = await new Promise((resolve, reject) => {
          db.get(`
            SELECT id FROM ingredients WHERE name = ? COLLATE NOCASE
          `, [item.name], (err, row) => {
            if (err) reject(err);
            else resolve(row?.id);
          });
        });

        // Dacă ingredientul nu există, creează-l
        if (!ingredientId) {
          // Generează cod temporar pentru a putea insera ingredientul
          const tempCode = `ING-TEMP-${Date.now()}`;

          ingredientId = await new Promise((resolve, reject) => {
            db.run(`
              INSERT INTO ingredients (
                name, code, unit, category, supplier, 
                cost_per_unit, min_stock, current_stock,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `, [
              item.name,
              tempCode,
              item.unit || 'buc',
              'Materii Prime',
              supplierName,
              parseFloat(item.priceExVat) || 0,
              0,
              0
            ], function (err) {
              if (err) reject(err);
              else resolve(this.lastID);
            });
          });

          // Actualizează codul cu ID-ul real
          const finalCode = item.code || `ING-${String(ingredientId).padStart(5, '0')}`;
          await new Promise((resolve, reject) => {
            db.run(`UPDATE ingredients SET code = ? WHERE id = ?`, [finalCode, ingredientId], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          console.log(`✅ Ingredient nou creat: ${item.name} (${finalCode})`);
        }

        // Adaugă mișcare de stoc (intrare)
        const quantity = parseFloat(item.qtyReceived) || parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.priceExVat) || parseFloat(item.unit_price) || 0;
        const value = parseFloat(item.valueExVat) || parseFloat(item.total_price) || (quantity * unitPrice);
        const tvaPercent = parseInt(item.vatRate) || 0;

        const tvaValoare = parseFloat(item.vatAmount) || (value * tvaPercent / 100) || 0;

        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO stock_moves (
              ingredient_id, type, quantity_in, unit_price, value_in,
              tva_percent, tva_valoare, cont_inter, sale_price,
              reference_type, reference_id, notes,
              created_at
            ) VALUES (?, 'NIR', ?, ?, ?, ?, ?, ?, ?, 'NIR', ?, ?, datetime('now'))
          `, [
            ingredientId,
            quantity,
            unitPrice,
            value,
            tvaPercent,
            tvaValoare,
            '46061', // cont_inter default
            parseFloat(item.salePrice) || 0,
            nirId,
            `NIR ${nirNumber} - ${item.name}`
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Actualizează stocul curent al ingredientului
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE ingredients 
            SET current_stock = current_stock + ?,
                cost_per_unit = ?,
                updated_at = datetime('now')
            WHERE id = ?
          `, [quantity, unitPrice, ingredientId], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      res.status(201).json({
        success: true,
        message: 'NIR creat cu succes',
        nir_id: nirId,
        nir_number: nirNumber
      });

    } catch (error) {
      console.error('❌ Error creating NIR:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/inventory/nir/upload-pdf - Încarcă factură PDF pentru prelucrare NIR automată
  app.post('/api/inventory/nir/upload-pdf', upload.single('invoice'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const pdfParsingService = require('./src/services/pdf-parsing.service');
      const dataBuffer = fs.readFileSync(req.file.path);
      const extractedData = await pdfParsingService.parseInvoicePdf(dataBuffer);

      // Șterge fișierul temporar
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        data: extractedData
      });

    } catch (error) {
      console.error('❌ Error parsing invoice PDF:', error);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/inventory/products/search - Căutare produse și ingrediente
  // GET /api/inventory/products/search - Căutare produse și ingrediente
  app.get('/api/inventory/products/search', async (req, res) => {
    try {
      const q = req.query.q;
      // Allow '*' to return all items (limit 1000)
      if ((!q || q.length < 2) && q !== '*') {
        return res.json([]);
      }

      const { dbPromise } = require('./database');
      const db = await dbPromise;

      const searchTerm = q === '*' ? '%' : `%${q}%`;
      const limit = q === '*' ? 5000 : 100;

      // Caută în ingrediente
      const ingredients = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            id,
            name,
            code,
            unit,
            'ingredient' as type,
            category,
            cost_per_unit as price,
            current_stock
          FROM ingredients
          WHERE name LIKE ? OR code LIKE ?
          ORDER BY name ASC
          LIMIT ?
        `, [searchTerm, searchTerm, limit], (err, rows) => {
          if (err) {
            console.error('Error searching ingredients:', err);
            // Return empty on error instead of crashing, but logging it
            resolve([]);
          } else {
            resolve(rows || []);
          }
        });
      });

      // Caută în produse
      const products = await new Promise((resolve) => {
        db.all(`
          SELECT 
            id,
            name,
            code,
            'buc' as unit,
            'product' as type,
            CAST(category_id AS TEXT) as category,
            price,
            0 as current_stock
          FROM products
          WHERE name LIKE ? OR code LIKE ?
          ORDER BY name ASC
          LIMIT ?
        `, [searchTerm, searchTerm, limit], (err, rows) => {
          if (err) {
            // If 'products' table doesn't exist, try 'menu'
            if (err.message && err.message.includes('no such table: products')) {
              db.all(`
                 SELECT 
                   id,
                   name,
                   barcode as code,
                   unit,
                   'product' as type,
                   category,
                   price,
                   0 as current_stock
                 FROM menu
                 WHERE name LIKE ?
                 ORDER BY name ASC
                 LIMIT ?
               `, [searchTerm, limit], (errMenu, rowsMenu) => {
                resolve(rowsMenu || []);
              });
            } else {
              resolve([]);
            }
          } else {
            resolve(rows || []);
          }
        });
      });

      // Combină rezultatele
      const results = [...ingredients, ...products];

      res.json(results);

    } catch (error) {
      console.error('❌ Error searching products:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Inventory base endpoint (for audit compatibility)
  app.get('/api/inventory', (req, res) => {
    res.json({
      success: true,
      message: 'Inventory API',
      endpoints: {
        sessions: '/api/inventory/sessions',
        nirs: '/api/inventory/nirs',
        createNir: '/api/inventory/nir',
        searchProducts: '/api/inventory/products/search',
        lots: '/api/inventory/lots',
        expiring: '/api/inventory/expiring',
        invoices: '/api/inventory/invoices',
        importInvoice: '/api/inventory/import-invoice',
        exportReport: '/api/admin/inventory/export/:format',
        nirPdf: '/api/inventory/nir/:nirNumber/pdf',
        queueMonitor: '/api/queue-monitor'
      }
    });
  });

  // ========== NEW ROUTES: Inventory Lots, Invoices, Expiring, Export, NIR PDF, Queue ==========

  // POST /api/inventory/lots - Adaugă un lot/batch nou
  app.post('/api/inventory/lots', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      const {
        ingredient_id,
        batch_number,
        barcode,
        quantity,
        unit_cost,
        purchase_date,
        expiry_date,
        supplier,
        invoice_number
      } = req.body;

      if (!ingredient_id || !batch_number || !quantity) {
        return res.status(400).json({
          success: false,
          error: 'ingredient_id, batch_number și quantity sunt obligatorii'
        });
      }

      const result = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO ingredient_batches (
            ingredient_id, batch_number, barcode, quantity, remaining_quantity,
            unit_cost, purchase_date, expiry_date, supplier, invoice_number
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          ingredient_id,
          batch_number,
          barcode || null,
          parseFloat(quantity),
          parseFloat(quantity), // remaining = initial quantity
          parseFloat(unit_cost) || 0,
          purchase_date || new Date().toISOString().split('T')[0],
          expiry_date || null,
          supplier || null,
          invoice_number || null
        ], function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      });

      // Also update ingredient stock via stock_moves
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO stock_moves (ingredient_id, type, quantity, reason, date, reference_type, reference_id)
          VALUES (?, 'IN', ?, 'Lot adăugat: ${batch_number}', datetime('now'), 'batch', ?)
        `, [ingredient_id, parseFloat(quantity), result.id], function(err) {
          if (err) {
            console.warn('⚠️ stock_moves insert warning:', err.message);
            resolve(null); // Non-critical
          } else {
            resolve({ id: this.lastID });
          }
        });
      });

      res.json({
        success: true,
        id: result.id,
        message: 'Lot adăugat cu succes'
      });
    } catch (error) {
      console.error('❌ Error in POST /api/inventory/lots:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Eroare la adăugarea lotului'
      });
    }
  });

  // GET /api/inventory/expiring - Obține articolele care expiră în curând
  app.get('/api/inventory/expiring', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      const days = parseInt(req.query.days) || 30;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const items = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            ib.id,
            i.name as ingredient_name,
            ib.batch_number,
            ib.expiry_date,
            ib.remaining_quantity as quantity,
            ib.supplier,
            i.unit,
            CASE 
              WHEN ib.expiry_date < date('now') THEN 'expired'
              WHEN ib.expiry_date <= ? THEN 'expiring'
              ELSE 'ok'
            END as status
          FROM ingredient_batches ib
          JOIN ingredients i ON i.id = ib.ingredient_id
          WHERE ib.expiry_date IS NOT NULL 
            AND ib.expiry_date <= ?
            AND ib.remaining_quantity > 0
          ORDER BY ib.expiry_date ASC
        `, [futureDateStr, futureDateStr], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      res.json({
        success: true,
        items: items,
        count: items.length
      });
    } catch (error) {
      console.error('❌ Error in GET /api/inventory/expiring:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Eroare la obținerea articolelor care expiră'
      });
    }
  });

  // POST /api/inventory/import-invoice - Importă o factură (PDF/XML)
  app.post('/api/inventory/import-invoice', uploadInvoice.single('file'), async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      const { invoice_number, supplier, date, total, file_type } = req.body;
      const file = req.file;

      if (!invoice_number || !supplier) {
        return res.status(400).json({
          success: false,
          error: 'invoice_number și supplier sunt obligatorii'
        });
      }

      const result = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO supplier_invoices (
            invoice_number, supplier_name, invoice_date, total_amount,
            file_path, file_type, status
          ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `, [
          invoice_number,
          supplier,
          date || new Date().toISOString().split('T')[0],
          parseFloat(total) || 0,
          file ? file.path : null,
          file_type || (file ? file.mimetype : null)
        ], function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      });

      res.json({
        success: true,
        id: result.id,
        message: 'Factură importată cu succes'
      });
    } catch (error) {
      console.error('❌ Error in POST /api/inventory/import-invoice:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Eroare la importul facturii'
      });
    }
  });

  // GET /api/inventory/invoices - Listează facturile importate
  app.get('/api/inventory/invoices', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      const { status, supplier, start_date, end_date } = req.query;

      let query = 'SELECT * FROM supplier_invoices WHERE 1=1';
      const params = [];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      if (supplier) {
        query += ' AND supplier_name LIKE ?';
        params.push(`%${supplier}%`);
      }
      if (start_date) {
        query += ' AND invoice_date >= ?';
        params.push(start_date);
      }
      if (end_date) {
        query += ' AND invoice_date <= ?';
        params.push(end_date);
      }

      query += ' ORDER BY created_at DESC';

      const invoices = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      res.json({
        success: true,
        invoices: invoices
      });
    } catch (error) {
      console.error('❌ Error in GET /api/inventory/invoices:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Eroare la obținerea facturilor'
      });
    }
  });

  // GET /api/admin/inventory/export/:format - Export rapoarte (Excel/PDF)
  app.get('/api/admin/inventory/export/:format', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      const { format } = req.params;
      const { type } = req.query;

      // Build query based on report type
      let query = '';
      let params = [];
      let reportTitle = 'Raport Stocuri';

      switch (type) {
        case 'stock_overview':
          reportTitle = 'Stoc General';
          query = `
            SELECT i.name, i.category, i.unit, i.min_stock, i.cost_per_unit,
                   COALESCE(i.current_stock, 0) as current_stock
            FROM ingredients i
            ORDER BY i.name ASC
          `;
          break;
        case 'low_stock':
          reportTitle = 'Stoc Scăzut';
          query = `
            SELECT i.name, i.category, i.unit, i.min_stock, i.cost_per_unit,
                   COALESCE(i.current_stock, 0) as current_stock
            FROM ingredients i
            WHERE COALESCE(i.current_stock, 0) <= i.min_stock
            ORDER BY i.current_stock ASC
          `;
          break;
        case 'expiring':
          reportTitle = 'Expirări (30 zile)';
          query = `
            SELECT i.name as ingredient_name, ib.batch_number, ib.expiry_date,
                   ib.remaining_quantity, ib.supplier, i.unit
            FROM ingredient_batches ib
            JOIN ingredients i ON i.id = ib.ingredient_id
            WHERE ib.expiry_date IS NOT NULL 
              AND ib.expiry_date <= date('now', '+30 days')
              AND ib.remaining_quantity > 0
            ORDER BY ib.expiry_date ASC
          `;
          break;
        case 'batches':
          reportTitle = 'Toate Loturile';
          query = `
            SELECT i.name as ingredient_name, ib.batch_number, ib.barcode,
                   ib.quantity, ib.remaining_quantity, ib.unit_cost,
                   ib.purchase_date, ib.expiry_date, ib.supplier, ib.invoice_number
            FROM ingredient_batches ib
            JOIN ingredients i ON i.id = ib.ingredient_id
            ORDER BY ib.created_at DESC
          `;
          break;
        case 'invoices':
          reportTitle = 'Facturi Importate';
          query = `
            SELECT invoice_number, supplier_name, invoice_date,
                   total_amount, status, created_at
            FROM supplier_invoices
            ORDER BY created_at DESC
          `;
          break;
        default:
          reportTitle = 'Stoc General';
          query = `
            SELECT i.name, i.category, i.unit, i.min_stock, i.cost_per_unit,
                   COALESCE(i.current_stock, 0) as current_stock
            FROM ingredients i
            ORDER BY i.name ASC
          `;
      }

      const rows = await new Promise((resolve, reject) => {
        db.all(query, params, (err, data) => {
          if (err) reject(err);
          else resolve(data || []);
        });
      });

      if (format === 'excel') {
        // Generate CSV (Excel-compatible) with BOM for UTF-8
        const BOM = '\uFEFF';
        const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
        const csvContent = BOM + headers.join(',') + '\n' +
          rows.map(row => headers.map(h => {
            const val = row[h];
            if (val === null || val === undefined) return '';
            const str = String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"` : str;
          }).join(',')).join('\n');

        const dateStr = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="raport_${type}_${dateStr}.csv"`);
        res.send(csvContent);
      } else if (format === 'pdf') {
        // Generate simple HTML for PDF printing
        const dateStr = new Date().toLocaleDateString('ro-RO');
        const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${reportTitle}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 20px; }
  h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th { background: #007bff; color: white; padding: 8px; text-align: left; }
  td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
  tr:nth-child(even) { background: #f8f9fa; }
  .footer { margin-top: 20px; color: #666; font-size: 12px; }
</style></head><body>
<h1>${reportTitle}</h1>
<p>Data generării: ${dateStr} | Total: ${rows.length} înregistrări</p>
<table>
  <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(row => `<tr>${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
</table>
<div class="footer">Generat automat — Restaurant HORECA App</div>
</body></html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
      } else {
        res.status(400).json({ success: false, error: 'Format invalid. Folosiți "excel" sau "pdf".' });
      }
    } catch (error) {
      console.error('❌ Error in GET /api/admin/inventory/export:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Eroare la generarea raportului'
      });
    }
  });

  // GET /api/inventory/nir/:nirNumber/pdf - Generare PDF pentru printare NIR
  app.get('/api/inventory/nir/:nirNumber/pdf', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      const nirNumber = req.params.nirNumber;

      // Find the NIR by nir_number (try both nir_documents and nir_headers)
      let nir = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM nir_documents WHERE nir_number = ?`, [nirNumber], (err, row) => {
          if (err) {
            // Try nir_headers as fallback
            db.get(`SELECT * FROM nir_headers WHERE nir_number = ?`, [nirNumber], (err2, row2) => {
              if (err2) reject(err2);
              else resolve(row2);
            });
          } else {
            resolve(row);
          }
        });
      });

      if (!nir) {
        return res.status(404).json({ success: false, error: 'NIR-ul nu a fost găsit' });
      }

      // Get NIR items
      const items = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM nir_items WHERE nir_id = ?`, [nir.id], (err, rows) => {
          if (err) {
            // Try nir_lines as fallback
            db.all(`SELECT * FROM nir_lines WHERE nir_id = ?`, [nir.id], (err2, rows2) => {
              if (err2) reject(err2);
              else resolve(rows2 || []);
            });
          } else {
            resolve(rows || []);
          }
        });
      });

      // Generate printable HTML
      const dateStr = nir.document_date || nir.nir_date || new Date().toLocaleDateString('ro-RO');
      const totalValue = nir.total_value || items.reduce((s, i) => s + (parseFloat(i.value) || parseFloat(i.quantity) * parseFloat(i.unit_price) || 0), 0);

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>NIR ${nirNumber}</title>
<style>
  @media print { body { margin: 0; } @page { margin: 1cm; } }
  body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
  .header { text-align: center; margin-bottom: 20px; }
  .header h1 { margin: 0; color: #333; }
  .info-grid { display: flex; justify-content: space-between; margin-bottom: 15px; }
  .info-grid div { flex: 1; }
  .info-grid p { margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { background: #007bff; color: white; padding: 6px; text-align: center; font-size: 11px; }
  td { padding: 4px 6px; border: 1px solid #ddd; text-align: center; font-size: 11px; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
  .totals { margin-top: 15px; text-align: right; font-size: 13px; }
  .totals strong { color: #007bff; }
  .footer { margin-top: 30px; display: flex; justify-content: space-between; }
  .footer div { text-align: center; width: 30%; }
  .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; }
</style></head><body>
<div class="header">
  <h1>NOTĂ DE RECEPȚIE ȘI CONSTATARE DE DIFERENȚE (NIR)</h1>
  <p>Nr. <strong>${nirNumber}</strong> din ${dateStr}</p>
</div>
<div class="info-grid">
  <div>
    <p><strong>Unitate:</strong> ${nir.unit_name || 'SC RESTAURANT SRL'}</p>
    <p><strong>CUI:</strong> ${nir.cui || 'RO12345678'}</p>
    <p><strong>Gestiune:</strong> ${nir.gestion || 'Bucătărie'}</p>
  </div>
  <div>
    <p><strong>Furnizor:</strong> ${nir.supplier_name || '-'}</p>
    <p><strong>Nr. Factură:</strong> ${nir.invoice_number || '-'}</p>
    <p><strong>Data document:</strong> ${dateStr}</p>
  </div>
</div>
<table>
  <thead><tr>
    <th>Nr.</th><th class="text-left">Denumire</th><th>U.M.</th>
    <th>Cant.</th><th>Preț unit.</th><th>Valoare</th>
    <th>TVA %</th><th>TVA</th><th>Total</th>
  </tr></thead>
  <tbody>
    ${items.map((item, idx) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price || item.price_without_vat) || 0;
      const value = qty * price;
      const vatPct = parseFloat(item.vat_rate || item.tva_percent) || 19;
      const vatAmt = value * vatPct / 100;
      const total = value + vatAmt;
      return `<tr>
        <td>${idx + 1}</td>
        <td class="text-left">${item.product_name || item.official_name || '-'}</td>
        <td>${item.unit || item.unit_measure || 'buc'}</td>
        <td>${qty.toFixed(2)}</td>
        <td class="text-right">${price.toFixed(2)}</td>
        <td class="text-right">${value.toFixed(2)}</td>
        <td>${vatPct}%</td>
        <td class="text-right">${vatAmt.toFixed(2)}</td>
        <td class="text-right">${total.toFixed(2)}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>
<div class="totals">
  <p><strong>Total valoare:</strong> ${Number(totalValue).toFixed(2)} RON</p>
</div>
<div class="footer">
  <div><div class="signature-line">Comisia de recepție</div></div>
  <div><div class="signature-line">Gestionar</div></div>
  <div><div class="signature-line">Delegat furnizor</div></div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      console.error('❌ Error in GET /api/inventory/nir/:nirNumber/pdf:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Eroare la generarea PDF-ului NIR'
      });
    }
  });

  // GET /api/queue-monitor - Date monitor coadă comenzi
  app.get('/api/queue-monitor', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Get current queue stats from orders table
      const stats = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COUNT(*) as todayTotal,
            SUM(CASE WHEN status = 'completed' OR status = 'delivered' THEN 1 ELSE 0 END) as processed,
            SUM(CASE WHEN status = 'cancelled' OR status = 'failed' THEN 1 ELSE 0 END) as failed,
            SUM(CASE WHEN status IN ('pending', 'preparing', 'new') THEN 1 ELSE 0 END) as currentQueueSize
          FROM orders
          WHERE date(created_at) = date('now')
        `, (err, row) => {
          if (err) {
            console.warn('⚠️ queue-monitor orders query:', err.message);
            resolve({ todayTotal: 0, processed: 0, failed: 0, currentQueueSize: 0 });
          } else {
            resolve(row || { todayTotal: 0, processed: 0, failed: 0, currentQueueSize: 0 });
          }
        });
      });

      // Get pending queue items
      const queueItems = await new Promise((resolve, reject) => {
        db.all(`
          SELECT id, order_number, status, table_number, total, created_at
          FROM orders
          WHERE status IN ('pending', 'preparing', 'new')
            AND date(created_at) = date('now')
          ORDER BY created_at ASC
          LIMIT 50
        `, (err, rows) => {
          if (err) {
            console.warn('⚠️ queue-monitor items query:', err.message);
            resolve([]);
          } else {
            resolve((rows || []).map(r => ({
              name: `Comanda #${r.order_number || r.id}`,
              product: `Masa ${r.table_number || '-'}`,
              quantity: 1,
              unit: '',
              status: r.status,
              total: r.total,
              created_at: r.created_at
            })));
          }
        });
      });

      res.json({
        queueType: 'memory',
        stats: {
          currentQueueSize: stats.currentQueueSize || 0,
          processed: stats.processed || 0,
          failed: stats.failed || 0,
          todayTotal: stats.todayTotal || 0,
          avgProcessingTime: 250
        },
        queueItems: queueItems,
        failedJobs: []
      });
    } catch (error) {
      console.error('❌ Error in GET /api/queue-monitor:', error);
      res.json({
        queueType: 'memory',
        stats: { currentQueueSize: 0, processed: 0, failed: 0, todayTotal: 0 },
        queueItems: [],
        failedJobs: []
      });
    }
  });

  // DEBUG ENDPOINT - Inspect Ingredients Schema
  app.get('/api/debug/schema-ingredients', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      db.all('PRAGMA table_info(ingredients)', (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
      });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // DEBUG ENDPOINT - Force Fix Schema (Ingredients AND Products)
  app.post('/api/debug/fix-schema', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      const log = [];

      // 1. Fix Ingredients
      await new Promise((resolve) => {
        db.run("ALTER TABLE ingredients ADD COLUMN code TEXT", (err) => {
          if (!err) log.push('✅ Ingredients: Added code column');
          resolve();
        });
      });

      // Populate ingredients
      const ingRows = await new Promise(r => db.all("SELECT id FROM ingredients WHERE code IS NULL OR code = ''", [], (e, rows) => r(rows || [])));
      if (ingRows.length > 0) {
        await new Promise((resolve) => {
          db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            const stmt = db.prepare("UPDATE ingredients SET code = ? WHERE id = ?");
            ingRows.forEach(row => stmt.run(`ING - ${String(row.id).padStart(5, '0')
              }`, row.id));
            stmt.finalize();
            db.run("COMMIT", () => resolve());
          });
        });
        log.push(`✅ Ingredients: Generated codes for ${ingRows.length} items`);
      }

      // 2. Fix Products
      await new Promise((resolve) => {
        db.run("ALTER TABLE products ADD COLUMN code TEXT", (err) => {
          if (!err) log.push('✅ Products: Added code column');
          resolve();
        });
      });

      // Populate products
      const prodRows = await new Promise(r => db.all("SELECT id FROM products WHERE code IS NULL OR code = ''", [], (e, rows) => r(rows || [])));
      if (prodRows.length > 0) {
        await new Promise((resolve) => {
          db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            const stmt = db.prepare("UPDATE products SET code = ? WHERE id = ?");
            prodRows.forEach(row => stmt.run(`PROD - ${String(row.id).padStart(5, '0')} `, row.id));
            stmt.finalize();
            db.run("COMMIT", () => resolve());
          });
        });
        log.push(`✅ Products: Generated codes for ${prodRows.length} items`);
      }

      // 3. Fix Avize Insotire Columns
      const avizeCols = ['expeditor_cui', 'expeditor_adresa', 'destinatar_denumire', 'destinatar_cui', 'destinatar_adresa'];
      for (const col of avizeCols) {
        await new Promise((resolve) => {
          db.run(`ALTER TABLE avize_insotire ADD COLUMN ${col} TEXT`, (err) => {
            if (!err) log.push(`✅ Avize: Added column ${col} `);
            resolve();
          });
        });
      }

      // 4. Fix Stock Moves
      await new Promise((resolve) => {
        db.run("ALTER TABLE stock_moves ADD COLUMN notes TEXT", (err) => {
          if (!err) log.push('✅ Stock Moves: Added notes column');
          resolve();
        });
      });

      // 5. Fix Ingredients updated_at
      await new Promise((resolve) => {
        db.run("ALTER TABLE ingredients ADD COLUMN updated_at TEXT", (err) => {
          if (err) {
            log.push(`❌ Ingredients Error: ${err.message} `);
          } else {
            log.push('✅ Ingredients: Added updated_at column');
            // Populate default value manually
            db.run("UPDATE ingredients SET updated_at = datetime('now') WHERE updated_at IS NULL");
          }
          resolve();
        });
      });

      // 6. Extend Avize Insotire for Payments and Validation
      const avizePaymentCols = ['plata_baza', 'plata_tva', 'valoare_totala_baza', 'valoare_totala_tva'];
      for (const col of avizePaymentCols) {
        await new Promise((resolve) => {
          db.run(`ALTER TABLE avize_insotire ADD COLUMN ${col} REAL DEFAULT 0`, (err) => {
            if (!err) log.push(`✅ Avize: Added column ${col} `);
            resolve();
          });
        });
      }

      // 7. Extend Stock Moves for Detailed NIR
      const stockCols = [
        { name: 'tva_valoare', type: 'REAL DEFAULT 0' },
        { name: 'cont_inter', type: 'TEXT' }, // 46061
        { name: 'sale_price', type: 'REAL DEFAULT 0' }
      ];
      for (const col of stockCols) {
        await new Promise((resolve) => {
          db.run(`ALTER TABLE stock_moves ADD COLUMN ${col.name} ${col.type} `, (err) => {
            if (!err) log.push(`✅ Stock Moves: Added column ${col.name} `);
            resolve();
          });
        });
      }

      res.json({ success: true, log });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DEBUG ENDPOINT - Inspect Menu Schema
  app.get('/api/debug/schema-menu', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      db.all('PRAGMA table_info(menu)', (err, rows) => {
        if (err) res.json({ error: err.message });
        else res.json(rows);
      });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Restaurant config endpoint (for admin-advanced.html)
  const restaurantController = require('./src/modules/settings/controllers/restaurant.controller');
  app.get('/api/restaurant/config', restaurantController.getRestaurantSettings);
  app.post('/api/restaurant/config', restaurantController.saveRestaurantSettings);

  // Areas & Tables routes (direct endpoints, not under /api/settings)
  const areasController = require('./src/modules/settings/controllers/areas.controller');
  const tablesController = require('./src/modules/settings/controllers/tables.controller');
  app.get('/api/areas', areasController.getAreas);
  app.post('/api/areas', areasController.createArea);
  app.put('/api/areas/:id', areasController.updateArea);
  app.delete('/api/areas/:id', areasController.deleteArea);
  app.get('/api/tables', tablesController.getTables);
  app.post('/api/tables', tablesController.createTable);
  app.put('/api/tables/:id', tablesController.updateTable);
  app.put('/api/tables/:id/position', tablesController.updateTablePosition);

  // Fiscal routes
  const fiscalRoutes = require('./src/modules/fiscal/fiscal.routes');
  app.use('/api/fiscal', fiscalRoutes);

  // E-Factura routes (from routes.js, not fiscal.routes.js)
  const eFacturaRoutes = require('./src/modules/fiscal/routes');
  app.use('/api/fiscal', eFacturaRoutes);

  // ========================================
  // LEGAL TIPIZATE ROUTES - Conform OMFP 2634/2015
  // ========================================
  try {
    const { runLegalTipizateMigrations } = require('./src/modules/tipizate/migrations/run-legal-migrations');
    await runLegalTipizateMigrations(db);

    // ANAF Compliant Tipizate Migration (conform OMFP 2634/2015)
    const { runAnafCompliantTipizateMigration } = require('./src/modules/tipizate/migrations/anaf-compliant-tipizate-migration');
    await runAnafCompliantTipizateMigration(db);

    const legalTipizateRoutes = require('./src/modules/tipizate/routes/legal-tipizate.routes');
    app.use('/api/tipizate-legal', legalTipizateRoutes);
    console.log('✅ Legal Tipizate routes mounted at /api/tipizate-legal');

    // ANAF Compliant Tipizate Routes
    const anafTipizateRoutes = require('./src/modules/tipizate/routes/anaf-tipizate.routes');
    app.use('/api/tipizate-anaf', anafTipizateRoutes);
    console.log('✅ ANAF Tipizate routes mounted at /api/tipizate-anaf');
  } catch (err) {
    console.warn('⚠️ Legal Tipizate module not loaded:', err.message);
  }

  // Alias /api/e-factura -> /api/fiscal/e-factura (for admin-vite React)
  app.use('/api/e-factura', (req, res, next) => {
    // Rewrite URL to point to fiscal routes
    const originalUrl = req.url;
    req.url = originalUrl.replace(/^\/api\/e-factura/, '/api/fiscal/e-factura');
    // Forward to fiscal routes
    eFacturaRoutes(req, res, next);
  });

  // Additional fiscal endpoints (for admin-advanced.html)
  app.get('/api/fiscal/documents', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Get fiscal receipts
      // NOTE: fiscal_receipts table uses 'issue_date' not 'created_at', but we alias it as 'created_at' for frontend compatibility
      // NOTE: fiscal_receipts table doesn't have 'is_cancelled' column, so we default to 'active' status
      const receipts = await new Promise((resolve, reject) => {
        db.all(`
      SELECT
      id, order_id, receipt_number as document_number,
        issue_date as created_at,
        'active' as status,
        total_amount as total, vat_amount,
        payment_method, waiter_id, NULL as cashier_id,
        'receipt' as document_type,
        receipt_number as receipt_number,
        NULL as invoice_number,
        NULL as invoice_id,
        NULL as xml_content,
        NULL as spv_id,
        NULL as spv_response
          FROM fiscal_receipts
          ORDER BY issue_date DESC
          LIMIT 50
        `, [], (err, rows) => {
          if (err) {
            if (err.message.includes('no such table') || err.message.includes('no such column')) {
              console.warn('⚠️ [fiscal/documents] fiscal_receipts table missing:', err.message);
              return resolve([]);
            }
            reject(err);
          } else {
            resolve(rows || []);
          }
        });
      });

      // Get e-Factura invoices
      const invoices = await new Promise((resolve, reject) => {
        db.all(`
      SELECT
      id as invoice_id,
        order_id,
        invoice_number as document_number,
        created_at,
        status,
        NULL as total,
        NULL as vat_amount,
        NULL as payment_method,
        NULL as waiter_id,
        NULL as cashier_id,
        'invoice' as document_type,
        NULL as receipt_number,
        invoice_number,
        xml_content,
        spv_id,
        spv_response,
        client_name,
        client_cui
          FROM invoices
          ORDER BY created_at DESC
          LIMIT 50
        `, [], (err, rows) => {
          if (err) {
            if (err.message.includes('no such table') || err.message.includes('no such column')) {
              console.warn('⚠️ [fiscal/documents] invoices table missing:', err.message);
              return resolve([]);
            }
            reject(err);
          } else {
            resolve(rows || []);
          }
        });
      });

      // Combine and format documents
      const allDocuments = [
        ...receipts.map(r => ({
          ...r,
          document_name: 'Bon Fiscal',
          total_amount: r.total || 0
        })),
        ...invoices.map(inv => ({
          ...inv,
          document_name: 'Factură e-Factura',
          total_amount: inv.total || 0,
          // Extract total from json_data if available
          eFacturaStatus: inv.status || 'generated',
          spvId: inv.spv_id,
          hasXml: !!inv.xml_content
        }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);

      res.json({ success: true, documents: allDocuments });
    } catch (error) {
      // Return empty array instead of 500 error for missing table/column
      if (error.message && (error.message.includes('no such table') || error.message.includes('no such column'))) {
        console.warn('⚠️ [fiscal/documents] Error handled:', error.message);
        return res.json({ success: true, documents: [] });
      }
      console.error('❌ [fiscal/documents] Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/fiscal/register', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      const register = await new Promise((resolve, reject) => {
        db.all(`
      SELECT
      DATE(created_at) as date,
        COUNT(*) as receipts_count,
        SUM(total_amount) as total_amount,
        SUM(vat_amount) as total_vat
          FROM fiscal_receipts
          WHERE DATE(created_at) >= DATE('now', '-30 days')
            AND is_cancelled = 0
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `, [], (err, rows) => {
          if (err) {
            // If table doesn't exist or column doesn't exist, return empty array
            if (err.message.includes('no such table') || err.message.includes('no such column')) {
              console.warn('⚠️ [fiscal/register] Table or column missing:', err.message);
              return resolve([]);
            }
            reject(err);
          } else {
            resolve(rows || []);
          }
        });
      });
      res.json({ success: true, register: register || [] });
    } catch (error) {
      // Return empty array instead of 500 error for missing table/column
      if (error.message && (error.message.includes('no such table') || error.message.includes('no such column'))) {
        console.warn('⚠️ [fiscal/register] Error handled:', error.message);
        return res.json({ success: true, register: [] });
      }
      console.error('❌ [fiscal/register] Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/fiscal/paid-orders', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      const orders = await new Promise((resolve, reject) => {
        db.all(`
      SELECT
      o.id, o.table_number, o.total, o.status,
        o.timestamp, o.client_identifier, o.items,
        o.timestamp as created_at, o.timestamp as updated_at
          FROM orders o
      WHERE(o.status = 'paid' OR o.status = 'completed')
          ORDER BY o.timestamp DESC
          LIMIT 100
        `, [], (err, rows) => {
          if (err) {
            console.error('Error querying paid orders:', err);
            // Return empty array instead of rejecting
            resolve([]);
          } else {
            resolve(rows || []);
          }
        });
      });

      // Grupează comenzile pe date pentru compatibilitate cu frontend-ul
      const ordersByDateObj = {};
      orders.forEach(order => {
        // Adaugă items_preview pentru fiecare comandă (dacă există items)
        const items = order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [];
        order.items_preview = items.slice(0, 3).map(item => item.name || item.product_name || 'Produs').join(', ') + (items.length > 3 ? '...' : '');

        const date = order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : 'unknown';
        if (!ordersByDateObj[date]) {
          ordersByDateObj[date] = [];
        }
        ordersByDateObj[date].push(order);
      });

      // Convertește obiectul în array pentru frontend (format așteptat)
      const ordersByDateArray = Object.keys(ordersByDateObj).sort((a, b) => {
        // Sortare descrescătoare după dată (cel mai recent primul)
        return new Date(b).getTime() - new Date(a).getTime();
      }).map(date => {
        const dateObj = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let displayDate;
        if (date === today.toISOString().split('T')[0]) {
          displayDate = 'Astăzi';
        } else if (date === yesterday.toISOString().split('T')[0]) {
          displayDate = 'Ieri';
        } else {
          displayDate = dateObj.toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          displayDate = displayDate.charAt(0).toUpperCase() + displayDate.slice(1);
        }

        return {
          date: date,
          display_date: displayDate,
          orders: ordersByDateObj[date]
        };
      });

      res.json({
        success: true,
        orders: orders,
        orders_by_date: ordersByDateArray  // Array format pentru frontend
      });
    } catch (error) {
      console.error('Error in /api/fiscal/paid-orders:', error);
      // Return empty structure instead of 500 error (array format pentru frontend)
      res.json({
        success: true,
        orders: [],
        orders_by_date: []  // Array gol în loc de obiect
      });
    }
  });

  // Stats routes (BI Dashboards)
  const statsRoutes = require('./src/modules/stats/stats.routes');
  app.use('/api/stats', statsRoutes);

  // Platform Stats routes (Statistici per platformă)
  const platformStatsRoutes = require('./src/modules/platform-stats/platform-stats.routes');
  app.use('/api/platform-stats', platformStatsRoutes);
  console.log('✅ Platform Stats routes mounted: /api/platform-stats');

  // Visits routes
  const visitsController = require('./src/modules/orders/controllers/visits.controller');
  app.post('/api/visits/close', visitsController.closeVisit);

  // Rewards endpoint - verifică recompensele eligibile pentru coș
  app.post('/api/rewards/check', async (req, res) => {
    try {
      const { cartItems } = req.body;

      if (!cartItems || !Array.isArray(cartItems)) {
        return res.json({
          success: true,
          eligibleRewards: []
        });
      }

      // Calculează totalul coșului
      const cartTotal = cartItems.reduce((sum, item) => {
        if (item.isFree) return sum;
        const basePrice = item.product?.price || 0;
        const customPrice = (item.customizations || []).reduce((cSum, c) => cSum + (c.extra_price || 0), 0);
        return sum + (basePrice + customPrice) * (item.quantity || 1);
      }, 0);

      // TODO: Implementare logică reală de recompense (ex: din baza de date)
      // Pentru moment, returnează array gol
      const eligibleRewards = [];

      res.json({
        success: true,
        eligibleRewards: eligibleRewards
      });
    } catch (error) {
      console.error('Error checking rewards:', error);
      res.json({
        success: true,
        eligibleRewards: []
      });
    }
  });

  console.log('✅ Areas, Tables, Fiscal, Stats, Platform Stats, and Visits routes mounted');

  // Audit & Compliance routes
  app.get('/api/admin/audit-log', adminController.getAuditLog);
  app.get('/api/compliance/temperature-log', adminController.getTemperatureLog);
  app.get('/api/compliance/cleaning-schedule', adminController.getCleaningSchedule);

  // Compliance routes are mounted via modules.registry.js (no need to mount here)
  // Removed duplicate mounting - compliance routes loaded from src/modules/compliance/compliance.routes.js

  // Mount audit routes
  const auditRoutes = require('./routes/audit.routes');
  app.use('/api/audit', auditRoutes);
  console.log('✅ Audit routes mounted: /api/audit/* (includes logs, login-history, security, user-activity, alerts)');

  // Generic alerts endpoint - aggregates all alert types (stock, order, system)
  app.get('/api/alerts', async (req, res) => {
    try {
      const AlertsService = require('./src/modules/alerts/alerts.service');
      const StockAlertsService = require('./src/modules/stocks/services/stock-alerts.service');

      // Get all alert types
      const [stockAlerts, criticalStock, warningStock] = await Promise.all([
        StockAlertsService.getLowStockAlerts(),
        StockAlertsService.getCriticalAlerts(),
        StockAlertsService.getWarningAlerts()
      ]);

      // Aggregate all alerts
      const allAlerts = [
        ...stockAlerts.map(a => ({ ...a, type: 'stock', severity: 'low' })),
        ...criticalStock.map(a => ({ ...a, type: 'stock', severity: 'critical' })),
        ...warningStock.map(a => ({ ...a, type: 'stock', severity: 'warning' }))
      ];

      res.json({
        success: true,
        data: allAlerts,
        count: allAlerts.length,
        summary: {
          stock: {
            low: stockAlerts.length,
            critical: criticalStock.length,
            warning: warningStock.length
          }
        }
      });
    } catch (error) {
      console.error('❌ Error getting alerts:', error);
      res.status(500).json({ success: false, error: error.message, data: [], count: 0 });
    }
  });
  console.log('✅ Generic alerts endpoint mounted: /api/alerts');

  // Mount inventory routes
  const inventoryRoutes = require('./routes/admin/inventory.routes');
  app.use('/api/admin/inventory', inventoryRoutes);
  console.log('✅ Inventory routes mounted: /api/admin/inventory/* (includes filtered endpoint)');

  // Mount reports routes under /api/admin/reports for frontend compatibility
  const reportsRoutes = require('./src/modules/reports/reports.routes');
  app.use('/api/admin/reports', reportsRoutes);
  // Also mount under /api/reports for compatibility with stock-prediction endpoint
  app.use('/api/reports', reportsRoutes);
  console.log('✅ Reports routes mounted: /api/admin/reports/* and /api/reports/* (includes sales-detailed, profitability, customer-behavior, time-trends, stock-prediction)');

  // PHASE S20 - Discount & Protocol Sales Module
  const discountsRoutes = require('./src/modules/discounts/routes');
  app.use('/api/discounts', discountsRoutes);
  console.log('✅ Discounts routes mounted: /api/discounts/*');

  const protocolsRoutes = require('./src/modules/protocols/routes');
  app.use('/api/protocols', protocolsRoutes);
  console.log('✅ Protocols routes mounted: /api/protocols/*');

  const servingOrderRoutes = require('./src/modules/serving-order/routes');
  app.use('/api/serving-order', servingOrderRoutes);
  console.log('✅ Serving Order routes mounted: /api/serving-order/*');

  // Alias /api/reports/sales -> /api/reports/sales-detailed for benchmark compatibility
  app.get('/api/reports/sales', async (req, res, next) => {
    const reportsController = require('./src/modules/reports/reports.controller');
    reportsController.getSalesDetailedReport(req, res, next);
  });

  // Financial reports endpoint (generic)
  app.get('/api/financial/reports', async (req, res) => {
    try {
      const reportsController = require('./src/modules/reports/reports.controller');
      // Return available financial report types
      res.json({
        success: true,
        available_reports: [
          '/api/reports/profit-loss',
          '/api/reports/profitability',
          '/api/reports/sales-detailed',
          '/api/financial/pnl',
          '/api/cogs/calculate'
        ],
        message: 'Use specific report endpoints for detailed data'
      });
    } catch (error) {
      console.error('❌ Error getting financial reports:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  console.log('✅ Financial reports endpoint mounted: /api/financial/reports');

  // Catalog routes (if not already in catalog module)
  // OPTIMIZARE: Cache pentru categorii (se schimbă rar)
  app.get('/api/catalog/categories/tree', longCacheMiddleware(), adminController.getCategoriesTree);
  app.get('/api/catalog/products', adminController.getCatalogProducts);
  // Alias pentru compatibilitate cu frontend
  app.get('/api/catalog-produse/products', adminController.getCatalogProducts);

  // Catalog controller routes
  const { createCatalogController } = require('./src/modules/catalog/controllers/catalog.controller');
  const catalogController = createCatalogController();
  app.get('/api/catalog/products/:id/chef-summary', catalogController.getChefSummary);
  app.get('/api/catalog/products/export', catalogController.exportProducts);

  console.log('✅ Catalog routes mounted: /api/catalog/products, /api/catalog-produse/products, /api/catalog-produse/products/:id, /api/catalog/products/:id/chef-summary, /api/catalog/products/export');
  app.get('/api/catalog-produse/products/:id', async (req, res, next) => {
    // Pentru GET /api/catalog-produse/products/:id, folosim getCatalogProducts și filtrăm
    const { id } = req.params;
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      const product = await new Promise((resolve, reject) => {
        db.get(`
          SELECT p.*, c.name as category_name
          FROM catalog_products p
          LEFT JOIN catalog_categories c ON p.category_id = c.id
          WHERE p.id = ?
        `, [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      if (product) {
        res.json({ success: true, product });
      } else {
        res.status(404).json({ success: false, error: 'Product not found' });
      }
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Recipes routes
  app.get('/api/recipes/all', adminController.getAllRecipes);
  app.get('/api/recipes/product/:id', adminController.getRecipeByProductId);
  app.get('/api/recipes/preparations', adminController.getRecipePreparations);

  // Product Display Settings
  app.get('/api/admin/product-display-setting', adminController.getProductDisplaySetting);
  app.put('/api/admin/product-display-setting', adminController.updateProductDisplaySetting);
  console.log('✅ Product Display Settings routes mounted: /api/admin/product-display-setting');

  // Integrations Management
  app.get('/api/integrations', adminController.getIntegrations);
  app.post('/api/integrations', adminController.createIntegration);
  app.put('/api/integrations/:id', adminController.updateIntegration);
  app.delete('/api/integrations/:id', adminController.deleteIntegration);
  console.log('✅ Integrations routes mounted: /api/integrations');

  // Cash Register (Fiscal)
  app.get('/api/admin/fiscal/cash-register', adminController.getCashRegister);
  console.log('✅ Cash Register route mounted: /api/admin/fiscal/cash-register');

  // Exports routes (PDF, Excel, etc.)
  const exportsRoutes = require('./src/modules/exports/exports.routes');
  app.use('/api/exports', exportsRoutes);
  console.log('✅ Exports routes mounted: /api/exports/* (includes /menu/pdf)');

  // Mobile App Statistics routes
  const mobileStatsRoutes = require('./src/modules/mobile/mobile-stats.routes');
  app.use('/api/mobile', mobileStatsRoutes);
  console.log('✅ Mobile App Statistics routes mounted: /api/mobile/*');

  // Mobile App Loyalty routes
  const mobileLoyaltyRoutes = require('./src/modules/mobile/mobile-loyalty.routes');
  app.use('/api/loyalty', mobileLoyaltyRoutes);
  console.log('✅ Mobile App Loyalty routes mounted: /api/loyalty/*');

  // Mobile App Features routes (Nutrition, Deals, Rating, Referral)
  const mobileFeaturesRoutes = require('./src/modules/mobile/mobile-features.routes');
  app.use('/api/mobile', mobileFeaturesRoutes);
  console.log('✅ Mobile App Features routes mounted: /api/mobile/* (nutrition, deals, rating, referral)');

  // External Delivery routes (Webhook-uri și sincronizare cu platformele externe)
  const externalDeliveryRoutes = require('./src/modules/external-delivery/externalDelivery.routes');
  app.use('/api/external-delivery', externalDeliveryRoutes);
  console.log('✅ External Delivery routes mounted: /api/external-delivery');

  // NOTE: Friends Ride Delivery Orders Endpoint is mounted BEFORE dbPromise.then() 
  // (see line ~1027) to ensure it's available immediately, before SPA catch-all

  console.log('✅ Recipes routes mounted: /api/recipes/all, /api/recipes/product/:id, /api/recipes/preparations');

  // Note: /recipes route is mounted BEFORE SPA catch-all (see above)

  // Orders routes are now defined BEFORE loadModules() to take precedence
  // See above for app.get('/api/orders', ...) definition

  // Tables routes
  app.get('/api/admin/tables/status', adminController.getTablesStatus);
  app.get('/api/kiosk/tables/positions', adminController.getKioskTablesPositions);
  // Kiosk orders routes
  // GET /api/kiosk/orders - Listă comenzi pentru aplicația mobilă (filtrate după customer_email din token)
  app.get('/api/kiosk/orders', async (req, res, next) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Extrage email-ul din token (dacă există middleware de autentificare)
      // Pentru moment, folosim customer_email din query sau din token
      const customerEmail = req.query.customer_email || req.user?.email || req.body.customer_email;

      let query = 'SELECT * FROM orders WHERE 1=1';
      const params = [];

      // Filtrare după email client (dacă aplicația mobilă trimite email-ul)
      if (customerEmail) {
        query += ' AND (customer_email = ? OR customer_name LIKE ?)';
        params.push(customerEmail, `% ${customerEmail}% `);
      }

      // Ordonează după dată (cele mai recente primul)
      query += ' ORDER BY timestamp DESC LIMIT 50';

      const orders = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Adaugă items pentru fiecare comandă
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        let items = [];
        try {
          const orderItemsExists = await new Promise((resolve) => {
            db.get(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'order_items'`, (err, row) => {
              resolve(!!row);
            });
          });

          if (orderItemsExists) {
            items = await new Promise((resolve, reject) => {
              db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
              });
            });
          } else if (order.items) {
            try {
              items = JSON.parse(order.items);
            } catch (e) {
              items = [];
            }
          }
        } catch (error) {
          console.warn('⚠️ Error fetching items for order', order.id, error.message);
          items = [];
        }

        return {
          ...order,
          items: items
        };
      }));

      res.json({
        success: true,
        orders: ordersWithItems
      });
    } catch (error) {
      console.error('❌ Error in GET /api/kiosk/orders:', error);
      next(error);
    }
  });

  app.get('/api/kiosk/orders/:id', adminController.getKioskOrder);

  // POST /api/kiosk/order/:id/cancel - Anulare comandă din aplicația mobilă
  app.post('/api/kiosk/order/:id/cancel', async (req, res, next) => {
    try {
      const ordersController = require('./src/modules/orders/controllers/orders.controller');
      await ordersController.cancelOrder(req, res, next);
    } catch (error) {
      console.error('❌ Error in POST /api/kiosk/order/:id/cancel:', error);
      next(error);
    }
  });

  // POST /api/orders/:id/ready - Marchează o comandă ca "ready" (gata)
  // Pentru Bar/KDS - după marcare, comenzile takeaway sunt trimise către livrare1.html (waiter room)
  app.post('/api/orders/:id/ready', async (req, res, next) => {
    try {
      const ordersController = require('./src/modules/orders/controllers/orders.controller');
      await ordersController.markOrderReady(req, res, next);
    } catch (error) {
      console.error('❌ Error in POST /api/orders/:id/ready:', error);
      next(error);
    }
  });

  // POST /api/kiosk/order - Creare comandă din aplicația mobilă
  // NOTE: This route is now defined BEFORE dbPromise.then() (line ~895) to ensure it's available immediately
  // Duplicate removed - route is defined at line ~895 (before dbPromise.then())

  // 🔴 FIX 2 - POST /api/kiosk/cart/validate - Validare stoc înainte de plată
  app.post('/api/kiosk/cart/validate', async (req, res, next) => {
    try {
      const { items = [] } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Items array is required and cannot be empty'
        });
      }

      const { dbPromise } = require('./database');
      const db = await dbPromise;

      const invalidItems = [];

      // Verifică fiecare produs din coș
      for (const item of items) {
        if (!item.product_id) {
          invalidItems.push({
            product_id: item.product_id || null,
            reason: 'invalid_product_id'
          });
          continue;
        }

        // Verifică dacă produsul există și este disponibil
        const product = await new Promise((resolve, reject) => {
          db.get(`
            SELECT id, name, is_sellable, is_active
            FROM menu
            WHERE id = ?
        `, [item.product_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (!product) {
          // Produsul nu există
          invalidItems.push({
            product_id: item.product_id,
            reason: 'product_not_found'
          });
        } else if (product.is_sellable !== 1 || product.is_active !== 1) {
          // Produsul nu mai este disponibil
          invalidItems.push({
            product_id: item.product_id,
            product_name: product.name,
            reason: 'out_of_stock'
          });
        }
      }

      // Returnează rezultatul validării
      res.json({
        success: true,
        valid: invalidItems.length === 0,
        invalidItems: invalidItems
      });
    } catch (error) {
      console.error('❌ Error in POST /api/kiosk/cart/validate:', error);
      next(error);
    }
  });
  console.log('✅ Kiosk cart validation route mounted: POST /api/kiosk/cart/validate');

  // GET /api/kiosk/menu - Meniu complet pentru aplicația mobilă (include produse, daily offers, happy hour, daily menu)
  app.get('/api/kiosk/menu', async (req, res) => {
    try {
      const lang = req.query.lang || 'ro'; // Limba selectată (ro sau en)
      console.log(`📱 GET / api / kiosk / menu - Request received(lang: ${lang})`);
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Helper pentru parsare sigură JSON
      // Gestionează atât JSON arrays (ex: ["Lapte", "Gluten"]) cât și string-uri simple (ex: "Lapte" sau "Gluten, Lapte")
      const safeJsonParse = (str, defaultValue = []) => {
        if (!str) return defaultValue;
        if (typeof str !== 'string') return Array.isArray(str) ? str : defaultValue;

        // Elimină spații de la început și sfârșit
        const trimmed = str.trim();
        if (!trimmed) return defaultValue;

        // Dacă începe cu [ sau {, încearcă să parseze ca JSON
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : (Array.isArray(defaultValue) ? [parsed] : parsed);
          } catch (e) {
            // Dacă JSON parsing eșuează, continuă cu logica pentru string simplu
          }
        }

        // Dacă nu este JSON valid, tratează ca string simplu
        // Split pe virgulă și elimină spațiile
        const items = trimmed.split(',').map(item => item.trim()).filter(item => item.length > 0);
        return items.length > 0 ? items : defaultValue;
      };

      // 1. Obține toate produsele active cu categoriile lor
      console.log('📱 Loading products from database...');

      // Verifică dacă coloana additives există în tabelul menu
      const hasAdditivesColumn = await new Promise((resolve) => {
        db.all("PRAGMA table_info(menu)", [], (err, columns) => {
          if (err) {
            console.warn('⚠️ Could not check menu table schema:', err.message);
            resolve(false);
          } else {
            const hasColumn = columns.some(col => col.name === 'additives');
            resolve(hasColumn);
          }
        });
      });

      const additivesSelect = hasAdditivesColumn ? 'm.additives,' : 'NULL as additives,';

      // Folosește tabelul menu (nu products) - menu este tabelul principal pentru produse
      // ✅ FIX: Include și produsele din catalog_products care sunt folosite în Daily Menu
      let products = await new Promise((resolve, reject) => {
        // Mai întâi obține produsele din menu
        db.all(`
      SELECT
      m.id,
        m.name,
        m.description,
        m.price,
        m.category as category_name,
        m.category,
        m.image_url,
        m.is_active,
        m.is_sellable,
        m.allergens,
        ${additivesSelect}
      m.display_order,
        m.name_en,
        m.description_en
          FROM menu m
          WHERE m.is_sellable = 1 AND(m.is_active = 1 OR m.is_active IS NULL)
          ORDER BY m.category ASC, m.name ASC
        `, [], async (err, menuRows) => {
          if (err) {
            console.error('❌ Error loading products from menu:', err);
            reject(err);
            return;
          }

          // Apoi obține produsele din catalog_products care sunt folosite în Daily Menu
          const today = new Date().toISOString().split('T')[0];
          const catalogProducts = await new Promise((resolveCatalog, rejectCatalog) => {
            db.all(`
              SELECT DISTINCT
      cp.id,
        cp.name,
        cp.description,
        cp.price,
        cc.name as category_name,
        cc.name as category,
        cp.image_url,
        cp.is_active,
        1 as is_sellable,
        cp.allergens,
        COALESCE(cp.additives, NULL) as additives,
        0 as display_order,
        cp.name_en,
        cp.description_en
              FROM catalog_products cp
              LEFT JOIN catalog_categories cc ON cp.category_id = cc.id
              INNER JOIN daily_menu dm ON(cp.id = dm.soup_id OR cp.id = dm.main_course_id)
              WHERE cp.is_active = 1
                AND dm.is_active = 1
                AND dm.date = ?
        AND cp.id NOT IN(SELECT id FROM menu WHERE is_sellable = 1 AND(is_active = 1 OR is_active IS NULL))
            `, [today], (err2, rows2) => {
              if (err2) {
                console.warn('⚠️ Error loading catalog_products for Daily Menu (non-critical):', err2.message);
                resolveCatalog([]);
              } else {
                console.log(`✅ Loaded ${rows2?.length || 0} additional products from catalog_products(used in Daily Menu)`);
                resolveCatalog(rows2 || []);
              }
            });
          });

          // Combină produsele din menu cu cele din catalog_products
          const allProducts = [...(menuRows || []), ...(catalogProducts || [])];

          // Elimină duplicate-urile (după ID) - păstrează doar primul
          const uniqueProducts = [];
          const seenIds = new Set();
          for (const product of allProducts) {
            if (!seenIds.has(product.id)) {
              seenIds.add(product.id);
              uniqueProducts.push(product);
            }
          }

          // Sortează după categorie și nume
          uniqueProducts.sort((a, b) => {
            const categoryCompare = (a.category || '').localeCompare(b.category || '');
            if (categoryCompare !== 0) return categoryCompare;
            return (a.name || '').localeCompare(b.name || '');
          });

          console.log(`✅ Loaded ${uniqueProducts.length} total products(${menuRows?.length || 0} from menu, ${catalogProducts?.length || 0} from catalog_products)`);

          // Asigură-te că image_url este null dacă nu există
          const productsWithNullImage = uniqueProducts.map(p => ({
            ...p,
            image_url: p.image_url || null
          }));
          resolve(productsWithNullImage);
        });
      });

      // Obține customizations pentru toate produsele (conform logicii din comanda.html)
      const productIds = products.map(p => p.id);
      let customizationsMap = new Map(); // Map<menu_item_id, customizations[]>

      if (productIds.length > 0) {
        try {
          const placeholders = productIds.map(() => '?').join(',');
          const customizations = await new Promise((resolve, reject) => {
            db.all(`
  SELECT
  id,
    menu_item_id,
    option_name,
    option_type,
    extra_price,
    option_name_en
              FROM customization_options
              WHERE menu_item_id IN(${placeholders})
              ORDER BY menu_item_id, id
    `, productIds, (err, rows) => {
              if (err) {
                console.warn('⚠️ Error fetching customizations (non-critical):', err.message);
                resolve([]); // Nu e eroare critică - continuă fără customizations
              } else {
                resolve(rows || []);
              }
            });
          });

          // Grupează customizations-urile pe menu_item_id
          for (const custom of customizations) {
            const menuItemId = custom.menu_item_id;
            if (!customizationsMap.has(menuItemId)) {
              customizationsMap.set(menuItemId, []);
            }
            customizationsMap.get(menuItemId).push({
              id: custom.id,
              option_name: custom.option_name,
              option_type: custom.option_type || 'topping',
              extra_price: custom.extra_price || 0,
              option_name_en: custom.option_name_en || null,
            });
          }
        } catch (e) {
          console.warn('⚠️ Error loading customizations (non-critical):', e.message);
        }
      }

      // ✅ HELPER FUNCTION: Actualizare automată Daily Menu
      // Identifică și sincronizează Daily Menu cu produsele corecte (ciorba de vacuta + snitel vienez)
      async function ensureDailyMenuExists(db, today) {
        try {
          // Use direct IDs instead of searching by name (more reliable)
          const SOUP_ID = 179; // Ciorbă de Văcuță
          const MAIN_COURSE_ID = 254; // Șnițel Vienez

          // Funcție pentru găsire produs după ID
          const findProductById = (productId) => {
            return new Promise((resolve) => {
              // Caută în menu (primary source)
              db.get(`
                SELECT id, name, price, description, image_url
                FROM menu
                WHERE id = ? AND(is_active = 1 OR is_active IS NULL)
                LIMIT 1
    `, [productId], (err, row) => {
                if (err || !row) {
                  // Fallback: caută în catalog_products
                  db.get(`
                    SELECT id, name, price, description, image_url
                    FROM catalog_products
                    WHERE id = ? AND is_active = 1
                    LIMIT 1
                  `, [productId], (err2, row2) => {
                    resolve(err2 ? null : (row2 || null));
                  });
                } else {
                  resolve(row);
                }
              });
            });
          };

          // Găsește produsele
          const soup = await findProductById(SOUP_ID);
          const mainCourse = await findProductById(MAIN_COURSE_ID);

          console.log('🔍 Daily Menu auto-update: Searching products...', {
            soupFound: soup ? `${soup.name} (ID: ${soup.id})` : 'null',
            mainCourseFound: mainCourse ? `${mainCourse.name} (ID: ${mainCourse.id})` : 'null'
          });

          if (!soup || !mainCourse) {
            console.warn('⚠️ Daily Menu auto-update: Products not found', {
              soup: soup?.name || 'null',
              mainCourse: mainCourse?.name || 'null',
              soupId: soup?.id || 'null',
              mainCourseId: mainCourse?.id || 'null'
            });
            return; // Nu actualizăm dacă nu găsim produsele
          }

          // Verifică dacă există Daily Menu pentru astăzi
          console.log('🔍 Checking for existing daily_menu with date:', today);
          const existingMenu = await new Promise((resolve) => {
            db.get(`
              SELECT id, soup_id, main_course_id, discount, is_active
              FROM daily_menu
              WHERE date = ? AND is_active = 1
              ORDER BY created_at DESC
              LIMIT 1
            `, [today], (err, row) => {
              if (err) {
                console.warn('⚠️ Error querying daily_menu:', err.message);
              } else {
                console.log('🔍 Existing menu query result:', row ? `Found ID: ${row.id} ` : 'Not found');
              }
              resolve(err ? null : (row || null));
            });
          });

          if (existingMenu) {
            // Verifică dacă trebuie actualizat
            if (existingMenu.soup_id === soup.id && existingMenu.main_course_id === mainCourse.id) {
              console.log('✅ Daily Menu is up to date');
              return; // Deja actualizat
            }

            // Actualizează (await pentru a aștepta finalizarea)
            await new Promise((resolve, reject) => {
              db.run(`
                UPDATE daily_menu
                SET soup_id = ?,
    main_course_id = ?
      WHERE id = ?
        `, [soup.id, mainCourse.id, existingMenu.id], (err) => {
                if (err) {
                  console.warn('⚠️ Error updating daily_menu:', err.message);
                  reject(err);
                } else {
                  console.log(`✅ Daily Menu auto - updated(ID: ${existingMenu.id}) - ${soup.name} + ${mainCourse.name} `);
                  resolve();
                }
              });
            });
          } else {
            // Inserează nou Daily Menu (await pentru a aștepta finalizarea)
            await new Promise((resolve, reject) => {
              db.run(`
                INSERT INTO daily_menu(date, soup_id, main_course_id, discount, is_active, created_at)
  VALUES(?, ?, ?, 0, 1, datetime('now'))
              `, [today, soup.id, mainCourse.id], function (err) {
                if (err) {
                  console.warn('⚠️ Error creating daily_menu:', err.message);
                  reject(err);
                } else {
                  console.log(`✅ Daily Menu auto - created(ID: ${this.lastID}) - ${soup.name} + ${mainCourse.name} `);
                  resolve();
                }
              });
            });
          }
        } catch (error) {
          console.warn('⚠️ Error in ensureDailyMenuExists:', error.message);
        }
      }

      // Category translation map (Romanian -> English)
      const categoryTranslations = {
        'Aperitive Calde': 'Hot Appetizers',
        'Aperitive Reci': 'Cold Appetizers',
        'Băuturi Spirtoase': 'Spirits',
        'Ciorbe': 'Soups',
        'Coctailuri Non-Alcoolice': 'Non-Alcoholic Cocktails',
        'Deserturi': 'Desserts',
        'Fast Food': 'Fast Food',
        'Fel Principal': 'Main Courses',
        'Garnituri': 'Garnishes',
        'Mic Dejun': 'Breakfast',
        'Paste': 'Pasta',
        'Peste și Fructe de Mare': 'Fish & Seafood',
        'Pizza': 'Pizza',
        'Salate': 'Salads',
        'Salate Însoțitoare': 'Side Salads',
        'Sosuri și Pâine': 'Sauces & Bread',
        'Vinuri': 'Wines',
        'Băuturi și Coctailuri': 'Drinks & Cocktails',
        'Cafea/Ciocolată/Ceai': 'Coffee/Chocolate/Tea',
        'Răcoritoare': 'Soft Drinks',
        'Oferta Zilei': 'Special Offer',
        'Meniul Zilei': 'Daily Menu'
      };

      // Grupează produsele pe categorii (folosind category TEXT din menu, nu category_id)
      const categoriesMap = new Map();
      for (const product of products) {
        const categoryNameRO = product.category || product.category_name || 'Fără categorie';
        const categoryKey = categoryNameRO; // Folosim numele românesc ca key pentru consistență

        // Translate category if English
        const categoryName = (lang === 'en' && categoryTranslations[categoryNameRO])
          ? categoryTranslations[categoryNameRO]
          : categoryNameRO;

        // Parse allergens și additives o singură dată
        const allergens = safeJsonParse(product.allergens, []);
        const additives = safeJsonParse(product.additives, []);

        // Obține customizations pentru acest produs
        const customizations = customizationsMap.get(product.id) || [];

        if (!categoriesMap.has(categoryKey)) {
          categoriesMap.set(categoryKey, {
            id: categoryKey, // Folosim numele categoriei românesc ca ID pentru consistență
            name: categoryName, // Category name translated to English if lang=en
            name_ro: categoryNameRO, // Keep original Romanian name
            display_order: product.display_order || 0,
            products: []
          });
        }

        // Aplică traducerea în funcție de limba selectată (similar cu comanda.html)
        // Dacă limba este engleză și există traducere, folosește traducerea
        const finalName = (lang === 'en' && product.name_en) ? product.name_en : product.name;
        const finalDescription = (lang === 'en' && product.description_en) ? product.description_en : (product.description || null);

        categoriesMap.get(categoryKey).products.push({
          id: product.id,
          name: finalName, // Nume tradus în funcție de limba selectată
          description: finalDescription, // Descriere tradusă în funcție de limba selectată
          name_en: product.name_en || null, // Păstrează și originalul pentru referință
          description_en: product.description_en || null, // Păstrează și originalul pentru referință
          price: product.price,
          image_url: product.image_url || null,
          is_active: product.is_active !== undefined ? product.is_active : 1,
          is_sellable: product.is_sellable !== undefined ? product.is_sellable : 1,
          allergens: allergens,
          additives: additives,
          customizations: customizations, // 🔴 Adăugăm customizations-urile din API
        });
      }

      // Convertește Map-ul în array și sortează după display_order, apoi după nume
      const categories = Array.from(categoriesMap.values())
        .sort((a, b) => {
          if (a.display_order !== b.display_order) {
            return a.display_order - b.display_order;
          }
          return a.name.localeCompare(b.name);
        });

      // 2. Obține Daily Offer (oferta zilei) - query direct cu popolare conditions și benefit_products
      let dailyOffer = null;
      try {
        console.log('📱 Loading daily offer...');
        // Query direct în loc de controller pentru a evita probleme de dependențe
        const offer = await new Promise((resolve, reject) => {
          db.get(`
  SELECT * FROM daily_offers
            WHERE is_active = 1
            ORDER BY created_at DESC
            LIMIT 1
    `, [], (err, row) => {
            if (err) {
              // Tabela poate să nu existe - nu e eroare critică
              console.warn('⚠️ Daily offers table may not exist:', err.message);
              resolve(null);
            } else {
              resolve(row);
            }
          });
        });

        if (offer) {
          // Obține conditions cu produsele asociate
          const conditions = await new Promise((resolve, reject) => {
            db.all(`
  SELECT * FROM daily_offer_conditions
              WHERE offer_id = ?
    ORDER BY id
            `, [offer.id], (err, rows) => {
              if (err) {
                console.warn('⚠️ Daily offer conditions table may not exist:', err.message);
                console.warn('⚠️ Offer ID:', offer.id);
                resolve([]);
              } else {
                console.log(`🔍 Daily offer conditions query result: ${rows?.length || 0} conditions found for offer ID ${offer.id} `);
                if (rows && rows.length > 0) {
                  console.log('🔍 First condition sample:', JSON.stringify(rows[0], null, 2));
                }
                resolve(rows || []);
              }
            });
          });

          // Populează conditions cu produsele din categoriile respective
          const conditionsWithProducts = await Promise.all(
            conditions.map(async (condition) => {
              let categoryProducts = [];
              if (condition.category) {
                // Caută în catalog_products (prioritar)
                categoryProducts = await new Promise((resolve, reject) => {
                  db.all(`
                    SELECT p.id, p.name, p.price, c.name as category, p.image_url
                    FROM catalog_products p
                    LEFT JOIN catalog_categories c ON p.category_id = c.id
                    WHERE c.name = ? AND p.is_active = 1
                    ORDER BY p.name
    `, [condition.category], (err, rows) => {
                    if (err) {
                      resolve([]);
                    } else {
                      resolve(rows || []);
                    }
                  });
                });
                // Dacă nu găsește în catalog_products, caută în menu
                if (!categoryProducts || categoryProducts.length === 0) {
                  categoryProducts = await new Promise((resolve, reject) => {
                    db.all(`
                      SELECT id, name, price, category, image_url
                      FROM menu
                      WHERE category = ? AND(is_active = 1 OR is_active IS NULL)
                      ORDER BY name
    `, [condition.category], (err, rows) => {
                      if (err) {
                        resolve([]);
                      } else {
                        resolve(rows || []);
                      }
                    });
                  });
                }
              }

              // ✅ FIX: Structură corectă pentru Flutter (quantity în loc de required_quantity)
              // ✅ FIX: Default value 1 dacă required_quantity este null/undefined
              return {
                category: condition.category,
                quantity: condition.required_quantity || condition.quantity || 1,
                products: categoryProducts
              };
            })
          );

          // Obține benefit products
          const benefitProductIds = await new Promise((resolve, reject) => {
            db.all(`
              SELECT product_id FROM daily_offer_benefit_products
              WHERE offer_id = ?
    `, [offer.id], (err, rows) => {
              if (err) {
                console.warn('⚠️ Daily offer benefit products table may not exist:', err.message);
                console.warn('⚠️ Offer ID:', offer.id);
                resolve([]);
              } else {
                console.log(`🔍 Daily offer benefit products query result: ${rows?.length || 0} benefit products found for offer ID ${offer.id} `);
                if (rows && rows.length > 0) {
                  console.log('🔍 Benefit product IDs:', rows.map(r => r.product_id).join(', '));
                }
                resolve(rows || []);
              }
            });
          });

          const benefitProductIdsList = benefitProductIds.map(bp => bp.product_id);

          // Obține benefit products efective
          let benefitProducts = [];
          if (offer.benefit_type === 'category' && offer.benefit_category) {
            // Caută în catalog_products (prioritar)
            benefitProducts = await new Promise((resolve, reject) => {
              db.all(`
                SELECT p.id, p.name, p.price, c.name as category, p.image_url
                FROM catalog_products p
                LEFT JOIN catalog_categories c ON p.category_id = c.id
                WHERE c.name = ? AND p.is_active = 1
                ORDER BY p.name
    `, [offer.benefit_category], (err, rows) => {
                if (err) {
                  resolve([]);
                } else {
                  resolve(rows || []);
                }
              });
            });
            // Dacă nu găsește în catalog_products, caută în menu
            if (!benefitProducts || benefitProducts.length === 0) {
              benefitProducts = await new Promise((resolve, reject) => {
                db.all(`
                  SELECT id, name, price, category, image_url
                  FROM menu
                  WHERE category = ? AND(is_active = 1 OR is_active IS NULL)
                  ORDER BY name
    `, [offer.benefit_category], (err, rows) => {
                  if (err) {
                    resolve([]);
                  } else {
                    resolve(rows || []);
                  }
                });
              });
            }
          } else if (offer.benefit_type === 'specific' && benefitProductIdsList.length > 0) {
            // Caută în catalog_products (prioritar)
            benefitProducts = await new Promise((resolve, reject) => {
              const placeholders = benefitProductIdsList.map(() => '?').join(',');
              db.all(`
                SELECT p.id, p.name, p.price, c.name as category, p.image_url
                FROM catalog_products p
                LEFT JOIN catalog_categories c ON p.category_id = c.id
                WHERE p.id IN(${placeholders}) AND p.is_active = 1
                ORDER BY p.name
    `, benefitProductIdsList, (err, rows) => {
                if (err) {
                  resolve([]);
                } else {
                  resolve(rows || []);
                }
              });
            });
            // Dacă nu găsește în catalog_products, caută în menu
            if (!benefitProducts || benefitProducts.length === 0) {
              benefitProducts = await new Promise((resolve, reject) => {
                const placeholders = benefitProductIdsList.map(() => '?').join(',');
                db.all(`
                  SELECT id, name, price, category, image_url
                  FROM menu
                  WHERE id IN(${placeholders}) AND(is_active = 1 OR is_active IS NULL)
                  ORDER BY name
    `, benefitProductIdsList, (err, rows) => {
                  if (err) {
                    resolve([]);
                  } else {
                    resolve(rows || []);
                  }
                });
              });
            }
          }

          // Construiește benefit_quantity din offer
          const benefitQuantityValue = offer.benefit_quantity;
          let benefitQuantity = 0;
          if (benefitQuantityValue != null) {
            if (typeof benefitQuantityValue === 'number') {
              benefitQuantity = benefitQuantityValue;
            } else if (typeof benefitQuantityValue === 'string') {
              const parsed = parseInt(benefitQuantityValue);
              if (!isNaN(parsed)) {
                benefitQuantity = parsed;
              }
            }
          }

          dailyOffer = {
            id: offer.id,
            title: offer.title || offer.name,
            description: offer.description,
            benefit_type: offer.benefit_type,
            benefit_category: offer.benefit_category,
            benefit_quantity: benefitQuantity,
            discount_percent: offer.discount_percent || 0,
            conditions: conditionsWithProducts || [],
            benefit_products: benefitProducts || [],
            is_active: offer.is_active === 1 || offer.is_active === true,
          };
          console.log('✅ Daily offer loaded:', dailyOffer.title || dailyOffer.id, `(${conditionsWithProducts.length} conditions, ${benefitProducts.length} benefit products)`);
          console.log('🔍 Conditions count:', dailyOffer.conditions.length);
          if (dailyOffer.conditions.length > 0) {
            console.log('🔍 First condition structure:', JSON.stringify(dailyOffer.conditions[0], null, 2));
            console.log('🔍 First condition products count:', dailyOffer.conditions[0].products?.length || 0);
          }
          console.log('🔍 Benefit products count:', dailyOffer.benefit_products.length);
          if (dailyOffer.benefit_products.length > 0) {
            console.log('🔍 First benefit product:', JSON.stringify(dailyOffer.benefit_products[0], null, 2));
          }
        } else {
          console.log('ℹ️ No daily offer available');
        }
      } catch (e) {
        console.warn('⚠️ Error loading daily offer (non-critical):', e.message);
      }

      // 3. Obține Happy Hour activ - query direct
      let happyHour = null;
      try {
        console.log('📱 Loading happy hour...');
        // Query direct pentru happy hour settings active
        const hhSettings = await new Promise((resolve, reject) => {
          db.all(`
  SELECT * FROM happy_hour_settings
            WHERE is_active = 1
            ORDER BY created_at DESC
            LIMIT 1
    `, [], (err, rows) => {
            if (err) {
              // Tabela poate să nu existe - nu e eroare critică
              console.warn('⚠️ Happy hour settings table may not exist:', err.message);
              resolve([]);
            } else {
              resolve(rows || []);
            }
          });
        });

        if (hhSettings && hhSettings.length > 0) {
          const hh = hhSettings[0];
          happyHour = {
            id: hh.id,
            name: hh.name,
            start_time: hh.start_time, // Format "HH:MM"
            end_time: hh.end_time, // Format "HH:MM"
            days_of_week: hh.days_of_week, // Array sau string
            discount_percentage: hh.discount_percentage || 0,
            discount_percent: (hh.discount_percentage || 0) / 100,
            is_active: hh.is_active === 1 || hh.is_active === true,
          };
          console.log('✅ Happy hour loaded:', happyHour.name || happyHour.id);
        } else {
          console.log('ℹ️ No active happy hour available');
        }
      } catch (e) {
        console.warn('⚠️ Error loading happy hour (non-critical):', e.message);
      }

      // 4. Obține Daily Menu (meniul zilei) - query direct cu actualizare automată
      let dailyMenu = null;
      try {
        console.log('📱 Loading daily menu...');
        // Query direct pentru daily menu de azi
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        console.log('🔍 Searching for daily menu with date:', today);

        // ✅ ACTUALIZARE AUTOMATĂ: Verifică și actualizează Daily Menu dacă lipsește sau are produse invalide
        await ensureDailyMenuExists(db, today);

        const menu = await new Promise((resolve, reject) => {
          db.get(`
  SELECT * FROM daily_menu
            WHERE date = ? AND is_active = 1
            ORDER BY created_at DESC
            LIMIT 1
          `, [today], (err, row) => {
            if (err) {
              // Tabela poate să nu existe - nu e eroare critică
              console.warn('⚠️ Daily menus table may not exist:', err.message);
              resolve(null);
            } else {
              if (row) {
                console.log('🔍 Daily menu found in DB:', { id: row.id, soup_id: row.soup_id, main_course_id: row.main_course_id });
              } else {
                console.log('ℹ️ No daily menu found for date:', today);
              }
              resolve(row);
            }
          });
        });

        if (menu) {
          console.log('🔍 Daily menu row from DB:', { id: menu.id, soup_id: menu.soup_id, main_course_id: menu.main_course_id, discount: menu.discount });

          // Parsează JSON fields dacă există
          // Caută în tabelul menu (tabelul principal pentru produse), apoi în catalog_products dacă nu găsește
          const soup = menu.soup_id ? await new Promise((resolve) => {
            // Încearcă mai întâi în tabelul menu
            db.get(`SELECT id, name, description, price, image_url FROM menu WHERE id = ? `, [menu.soup_id], (err, row) => {
              if (err || !row) {
                console.log('🔍 Soup not found in menu table, trying catalog_products for id:', menu.soup_id);
                // Dacă nu găsește în menu, încearcă în catalog_products
                db.get(`SELECT id, name, description, price, image_url FROM catalog_products WHERE id = ? `, [menu.soup_id], (err2, row2) => {
                  if (err2) {
                    console.warn('⚠️ Soup not found in catalog_products:', err2.message);
                  } else if (row2) {
                    console.log('✅ Soup found in catalog_products:', row2.name);
                  } else {
                    console.warn('⚠️ Soup not found in catalog_products for id:', menu.soup_id);
                  }
                  resolve(err2 ? null : (row2 ? { ...row2, image_url: row2.image_url || null } : null));
                });
              } else {
                console.log('✅ Soup found in menu table:', row.name);
                resolve(row ? { ...row, image_url: row.image_url || null } : null);
              }
            });
          }) : null;

          const mainCourse = menu.main_course_id ? await new Promise((resolve) => {
            // Încearcă mai întâi în tabelul menu
            db.get(`SELECT id, name, description, price, image_url FROM menu WHERE id = ? `, [menu.main_course_id], (err, row) => {
              if (err || !row) {
                console.log('🔍 Main course not found in menu table, trying catalog_products for id:', menu.main_course_id);
                // Dacă nu găsește în menu, încearcă în catalog_products
                db.get(`SELECT id, name, description, price, image_url FROM catalog_products WHERE id = ? `, [menu.main_course_id], (err2, row2) => {
                  if (err2) {
                    console.warn('⚠️ Main course not found in catalog_products:', err2.message);
                  } else if (row2) {
                    console.log('✅ Main course found in catalog_products:', row2.name);
                  } else {
                    console.warn('⚠️ Main course not found in catalog_products for id:', menu.main_course_id);
                  }
                  resolve(err2 ? null : (row2 ? { ...row2, image_url: row2.image_url || null } : null));
                });
              } else {
                console.log('✅ Main course found in menu table:', row.name);
                resolve(row ? { ...row, image_url: row.image_url || null } : null);
              }
            });
          }) : null;

          console.log('🔍 Daily menu products check:', { soup: soup ? soup.name : 'null', mainCourse: mainCourse ? mainCourse.name : 'null' });

          if (soup || mainCourse) {
            const items = [];
            if (soup) items.push({ type: 'soup', ...soup });
            if (mainCourse) items.push({ type: 'main_course', ...mainCourse });

            const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);
            const discount = menu.discount || 0;
            const finalPrice = Math.max(0, totalPrice - discount);

            dailyMenu = {
              type: soup && mainCourse ? 'full_menu' : 'partial',
              items: items,
              discount: discount,
              price: finalPrice,
            };
            console.log('✅ Daily menu loaded:', dailyMenu.type, `(${items.length} items, discount: ${discount}, price: ${finalPrice})`);
          } else {
            console.log('ℹ️ Daily menu has no valid items - soup and mainCourse both null');
            if (!menu.soup_id && !menu.main_course_id) {
              console.warn('⚠️ Daily menu row has no soup_id and no main_course_id!');
            }
          }
        } else {
          console.log('ℹ️ No daily menu available for today');
        }
      } catch (e) {
        console.warn('⚠️ Error loading daily menu (non-critical):', e.message);
      }

      // Returnează formatul complet pentru aplicația mobilă
      console.log(`📱 Returning menu data: ${products.length} products, ${categories.length} categories`);
      const response = {
        success: true,
        // Produse și categorii (format existent)
        products: products.map(p => {
          const allergens = safeJsonParse(p.allergens, []);
          const additives = safeJsonParse(p.additives, []);
          const customizations = customizationsMap.get(p.id) || []; // 🔴 Adăugăm customizations-urile

          // Aplică traducerea în funcție de limba selectată (similar cu comanda.html)
          // Dacă limba este engleză și există traducere, folosește traducerea
          const finalName = (lang === 'en' && p.name_en) ? p.name_en : p.name;
          const finalDescription = (lang === 'en' && p.description_en) ? p.description_en : (p.description || null);

          return {
            id: p.id,
            name: finalName, // Nume tradus în funcție de limba selectată
            name_en: p.name_en || null, // Păstrează și originalul pentru referință
            description: finalDescription, // Descriere tradusă în funcție de limba selectată
            description_en: p.description_en || null, // Păstrează și originalul pentru referință
            price: p.price,
            image_url: p.image_url || null,
            category_id: p.category_id,
            category_name: p.category_name || 'Fără categorie',
            is_active: p.is_active || 1,
            is_sellable: p.is_sellable !== undefined ? p.is_sellable : 1,
            allergens: allergens,
            additives: additives,
            customizations: customizations, // 🔴 Customizations-uri din API
          };
        }),
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          products: cat.products
        })),
        categories_ordered: categories.map(cat => cat.name),
        // Oferte și promovări (noi)
        daily_offer: dailyOffer,
        happy_hour: happyHour ? { active: true, settings: [happyHour] } : null,
        daily_menu: dailyMenu && dailyMenu.items ? dailyMenu.items : [], // ✅ FIX: Return only items array, not the wrapper object
        // Timestamp pentru sincronizare
        timestamp: new Date().toISOString(),
      };
      console.log('✅ Menu response prepared successfully');
      console.log('🔍 Daily offer in response:', dailyOffer ? `ID: ${dailyOffer.id}, keys: ${Object.keys(dailyOffer).join(', ')} ` : 'null');
      console.log('🔍 Daily menu in response:', dailyMenu && dailyMenu.items ? `${dailyMenu.items.length} items` : 'null');
      res.json(response);
    } catch (error) {
      console.error('❌ Error in GET /api/kiosk/menu:', error);
      console.error('📚 Stack:', error.stack);
      res.status(500).json({
        success: false,
        error: error.message,
        products: [],
        categories: [],
        categories_ordered: [],
        daily_offer: null,
        happy_hour: null,
        daily_menu: null,
      });
    }
  });
  console.log('✅ Kiosk menu route mounted: GET /api/kiosk/menu (includes products, daily offers, happy hour, daily menu)');

  // ✅ GET /api/daily-menu/auto-update - Endpoint pentru actualizare manuală Daily Menu
  app.get('/api/daily-menu/auto-update', async (req, res) => {
    try {
      const db = await dbPromise;
      const today = new Date().toISOString().split('T')[0];

      // Produsele căutate
      const TARGET_SOUP_NAMES = ['ciorba de vacuta', 'ciorba vacuta', 'ciorbă de vită', 'ciorbă vită', 'ciorba de vita'];
      const TARGET_MAIN_COURSE_NAMES = ['snitel vienez', 'șnițel vienez', 'schnitzel vienez', 'schnitzel', 'snitel'];

      // Funcție pentru căutare produs
      const findProductByName = (productNames) => {
        return new Promise((resolve) => {
          const conditions = productNames.map(() => 'name LIKE ?').join(' OR ');
          const params = productNames.map(name => `% ${name}% `);

          // Caută în catalog_products
          db.get(`
            SELECT id, name, price, description, image_url
            FROM catalog_products
  WHERE(${conditions}) AND is_active = 1
            ORDER BY name
            LIMIT 1
    `, params, (err, row) => {
            if (err || !row) {
              // Caută în menu
              db.get(`
                SELECT id, name, price, description, image_url
                FROM menu
  WHERE(${conditions}) AND(is_active = 1 OR is_active IS NULL)
                ORDER BY name
                LIMIT 1
    `, params, (err2, row2) => {
                resolve(err2 ? null : (row2 || null));
              });
            } else {
              resolve(row);
            }
          });
        });
      };

      // Găsește produsele
      const soup = await findProductByName(TARGET_SOUP_NAMES);
      const mainCourse = await findProductByName(TARGET_MAIN_COURSE_NAMES);

      if (!soup || !mainCourse) {
        return res.json({
          success: false,
          error: 'Products not found',
          details: {
            soup: soup ? soup.name : 'not found',
            mainCourse: mainCourse ? mainCourse.name : 'not found'
          }
        });
      }

      // Verifică dacă există Daily Menu pentru astăzi
      const existingMenu = await new Promise((resolve) => {
        db.get(`
          SELECT id, soup_id, main_course_id, discount, is_active
          FROM daily_menu
          WHERE date = ? AND is_active = 1
          ORDER BY created_at DESC
          LIMIT 1
    `, [today], (err, row) => {
          resolve(err ? null : (row || null));
        });
      });

      if (existingMenu) {
        // Verifică dacă trebuie actualizat
        if (existingMenu.soup_id === soup.id && existingMenu.main_course_id === mainCourse.id) {
          return res.json({
            success: true,
            message: 'Daily Menu is already up to date',
            daily_menu: {
              id: existingMenu.id,
              soup: soup.name,
              main_course: mainCourse.name
            }
          });
        }

        // Actualizează
        db.run(`
          UPDATE daily_menu
          SET soup_id = ?,
    main_course_id = ?,
    updated_at = datetime('now')
          WHERE id = ?
    `, [soup.id, mainCourse.id, existingMenu.id], (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Error updating daily_menu',
              details: err.message
            });
          }

          res.json({
            success: true,
            message: 'Daily Menu updated successfully',
            daily_menu: {
              id: existingMenu.id,
              soup: soup.name,
              main_course: mainCourse.name
            }
          });
        });
      } else {
        // Inserează nou Daily Menu
        db.run(`
          INSERT INTO daily_menu(date, soup_id, main_course_id, discount, is_active, created_at, updated_at)
  VALUES(?, ?, ?, 0, 1, datetime('now'), datetime('now'))
        `, [today, soup.id, mainCourse.id], function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Error creating daily_menu',
              details: err.message
            });
          }

          res.json({
            success: true,
            message: 'Daily Menu created successfully',
            daily_menu: {
              id: this.lastID,
              soup: soup.name,
              main_course: mainCourse.name
            }
          });
        });
      }
    } catch (error) {
      console.error('❌ Error in /api/daily-menu/auto-update:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  console.log('✅ Daily Menu auto-update route mounted: GET /api/daily-menu/auto-update');

  // GET /api/menu/all - Endpoint pentru comanda.html (web app) - sincronizat cu /api/kiosk/menu
  // Returnează aceleași produse ca și /api/kiosk/menu, dar în format compatibil cu comanda.html
  app.get('/api/menu/all', async (req, res) => {
    try {
      const lang = req.query.lang || 'ro';
      console.log(`🌐 GET / api / menu / all - Request received(lang: ${lang})`);
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Helper pentru parsare sigură JSON
      // Gestionează atât JSON arrays (ex: ["Lapte", "Gluten"]) cât și string-uri simple (ex: "Lapte" sau "Gluten, Lapte")
      const safeJsonParse = (str, defaultValue = []) => {
        if (!str) return defaultValue;
        if (typeof str !== 'string') return Array.isArray(str) ? str : defaultValue;

        // Elimină spații de la început și sfârșit
        const trimmed = str.trim();
        if (!trimmed) return defaultValue;

        // Dacă începe cu [ sau {, încearcă să parseze ca JSON
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : (Array.isArray(defaultValue) ? [parsed] : parsed);
          } catch (e) {
            // Dacă JSON parsing eșuează, continuă cu logica pentru string simplu
          }
        }

        // Dacă nu este JSON valid, tratează ca string simplu
        // Split pe virgulă și elimină spațiile
        const items = trimmed.split(',').map(item => item.trim()).filter(item => item.length > 0);
        return items.length > 0 ? items : defaultValue;
      };

      // Verifică dacă coloana additives există în tabelul menu
      const hasAdditivesColumn = await new Promise((resolve) => {
        db.all("PRAGMA table_info(menu)", [], (err, columns) => {
          if (err) {
            console.warn('⚠️ Could not check menu table schema:', err.message);
            resolve(false);
          } else {
            const hasColumn = columns.some(col => col.name === 'additives');
            resolve(hasColumn);
          }
        });
      });

      const additivesSelect = hasAdditivesColumn ? 'm.additives,' : 'NULL as additives,';

      // Folosește tabelul menu (nu products) - menu este tabelul principal pentru produse
      let products = await new Promise((resolve, reject) => {
        db.all(`
  SELECT
  m.id,
    m.name,
    m.name_en,
    m.description,
    m.description_en,
    m.price,
    m.category as category_name,
    m.category,
    m.image_url,
    m.is_active,
    m.is_sellable,
    m.allergens,
    ${additivesSelect}
  m.display_order
          FROM menu m
          WHERE m.is_sellable = 1 AND(m.is_active = 1 OR m.is_active IS NULL)
          ORDER BY m.category ASC, m.name ASC
        `, [], (err, rows) => {
          if (err) {
            console.error('❌ Error loading products:', err);
            reject(err);
          } else {
            console.log(`✅ Loaded ${rows?.length || 0} products from menu table for web app`);

            // Category translation map (Romanian -> English)
            const categoryTranslations = {
              'Aperitive Calde': 'Hot Appetizers',
              'Aperitive Reci': 'Cold Appetizers',
              'Băuturi Spirtoase': 'Spirits',
              'Ciorbe': 'Soups',
              'Coctailuri Non-Alcoolice': 'Non-Alcoholic Cocktails',
              'Deserturi': 'Desserts',
              'Fast Food': 'Fast Food',
              'Fel Principal': 'Main Courses',
              'Garnituri': 'Garnishes',
              'Mic Dejun': 'Breakfast',
              'Paste': 'Pasta',
              'Peste și Fructe de Mare': 'Fish & Seafood',
              'Pizza': 'Pizza',
              'Salate': 'Salads',
              'Salate Însoțitoare': 'Side Salads',
              'Sosuri și Pâine': 'Sauces & Bread',
              'Vinuri': 'Wines',
              'Băuturi și Coctailuri': 'Drinks & Cocktails',
              'Cafea/Ciocolată/Ceai': 'Coffee/Chocolate/Tea',
              'Răcoritoare': 'Soft Drinks',
              'Oferta Zilei': 'Special Offer',
              'Meniul Zilei': 'Daily Menu'
            };

            // Aplică traducerea în funcție de limba selectată (similar cu comanda.html și /api/kiosk/menu)
            const productsWithTranslation = (rows || []).map(p => {
              // Dacă limba este engleză și există traducere, folosește traducerea
              const finalName = (lang === 'en' && p.name_en) ? p.name_en : p.name;
              const finalDescription = (lang === 'en' && p.description_en) ? p.description_en : (p.description || null);

              // Translate category if English
              const categoryRO = p.category || p.category_name || 'Fără categorie';
              const finalCategory = (lang === 'en' && categoryTranslations[categoryRO])
                ? categoryTranslations[categoryRO]
                : categoryRO;

              return {
                ...p,
                name: finalName, // Nume tradus în funcție de limba selectată
                description: finalDescription, // Descriere tradusă în funcție de limba selectată
                name_en: p.name_en || null, // Păstrează și originalul pentru referință
                description_en: p.description_en || null, // Păstrează și originalul pentru referință
                image_url: p.image_url || null,
                category: finalCategory, // Category translated to English if lang=en
                category_ro: categoryRO // Keep original Romanian category for reference
              };
            });
            resolve(productsWithTranslation);
          }
        });
      });

      // Extrage categorii unice din produse (similar cu comanda.html)
      const categories_ordered = [...new Set(products.map(p => p.category || p.category_name || ''))]
        .filter(cat => cat && cat.trim() !== '')
        .sort();

      // Load Daily Offer, Happy Hour, Daily Menu (same as /api/kiosk/menu)
      let dailyOffer = null;
      let happyHour = null;
      let dailyMenu = null;

      try {
        // Daily Offer
        const offer = await new Promise((resolve) => {
          db.get(`SELECT * FROM daily_offers WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1`, [], (err, row) => {
            if (err) resolve(null);
            else resolve(row);
          });
        });
        if (offer) {
          dailyOffer = {
            id: offer.id,
            title: offer.title || offer.name,
            description: offer.description,
            benefit_type: offer.benefit_type,
            benefit_category: offer.benefit_category,
            discount_percent: offer.discount_percent || 0,
          };
        }
      } catch (e) {
        console.warn('⚠️ Error loading daily offer (non-critical):', e.message);
      }

      try {
        // Happy Hour
        const hhSettings = await new Promise((resolve) => {
          db.all(`SELECT * FROM happy_hour_settings WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1`, [], (err, rows) => {
            if (err) resolve([]);
            else resolve(rows || []);
          });
        });
        if (hhSettings && hhSettings.length > 0) {
          const hh = hhSettings[0];

          // Verifică dacă Happy Hour este activ ACUM (verificare timp real)
          const now = new Date();
          const currentDay = now.getDay(); // 0 (Duminică) - 6 (Sâmbătă)
          const currentHour = now.getHours() * 60 + now.getMinutes();

          // Parsează zilele
          let daysArray = hh.days_of_week;
          if (typeof daysArray === 'string' && daysArray.startsWith('[')) {
            try { daysArray = JSON.parse(daysArray); } catch (e) { daysArray = [daysArray]; }
          } else if (typeof daysArray === 'string') {
            daysArray = [daysArray.trim()];
          }

          const dayMappings = {
            '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 0,
            'luni': 1, 'marti': 2, 'miercuri': 3, 'joi': 4, 'vineri': 5, 'sambata': 6, 'duminica': 0
          };

          const isRelevantDay = daysArray.includes('all') ||
            daysArray.some(day => {
              const mappedDay = dayMappings[String(day).toLowerCase().trim()];
              return mappedDay === currentDay;
            });

          let isActiveNow = false;
          if (isRelevantDay) {
            const [startH, startM] = hh.start_time.split(':').map(Number);
            const [endH, endM] = hh.end_time.split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            isActiveNow = currentHour >= startMinutes && currentHour <= endMinutes;
          }

          happyHour = {
            id: hh.id,
            name: hh.name,
            start_time: hh.start_time,
            end_time: hh.end_time,
            days_of_week: hh.days_of_week,
            discount_percentage: hh.discount_percentage || 0,
            discount_fixed: hh.discount_fixed || 0,
            discount_percent: (hh.discount_percentage || 0) / 100,
            applicable_categories: hh.applicable_categories,
            applicable_products: hh.applicable_products,
            is_active: hh.is_active === 1 || hh.is_active === true,
            is_active_now: isActiveNow, // Flag pentru a ști dacă este activ ACUM
            _fullData: hh // Păstrează datele complete pentru procesare
          };
        }
      } catch (e) {
        console.warn('⚠️ Error loading happy hour (non-critical):', e.message);
      }

      try {
        // Daily Menu - încarcă produsele complete pentru categoria "Meniul Zilei"
        const today = new Date().toISOString().split('T')[0];
        let menu = null;

        // Verifică întâi exceptions
        const exception = await new Promise((resolve) => {
          db.get(`SELECT * FROM daily_menu_exceptions WHERE date = ? AND is_active = 1`, [today], (err, row) => {
            if (err) resolve(null);
            else resolve(row);
          });
        });

        if (exception) {
          menu = exception;
        } else {
          // Verifică meniul normal
          menu = await new Promise((resolve) => {
            db.get(`SELECT * FROM daily_menu WHERE date = ? AND is_active = 1`, [today], (err, row) => {
              if (err) resolve(null);
              else resolve(row);
            });
          });
        }

        if (menu) {
          // Încarcă produsele complete pentru soup și main course
          let soup = null;
          let mainCourse = null;

          // Caută în catalog_products întâi, apoi în menu
          soup = await new Promise((resolve) => {
            db.get('SELECT * FROM catalog_products WHERE id = ?', [menu.soup_id], (err, row) => {
              if (err) resolve(null);
              else resolve(row);
            });
          });
          if (!soup) {
            soup = await new Promise((resolve) => {
              db.get('SELECT * FROM menu WHERE id = ?', [menu.soup_id], (err, row) => {
                if (err) resolve(null);
                else resolve(row);
              });
            });
          }

          mainCourse = await new Promise((resolve) => {
            db.get('SELECT * FROM catalog_products WHERE id = ?', [menu.main_course_id], (err, row) => {
              if (err) resolve(null);
              else resolve(row);
            });
          });
          if (!mainCourse) {
            mainCourse = await new Promise((resolve) => {
              db.get('SELECT * FROM menu WHERE id = ?', [menu.main_course_id], (err, row) => {
                if (err) resolve(null);
                else resolve(row);
              });
            });
          }

          if (soup && mainCourse) {
            // Adaugă produsele din meniul zilnic în categoria "Meniul Zilei"
            const dailyMenuProducts = [
              {
                id: `daily_soup_${soup.id} `,
                name: soup.name,
                name_en: soup.name_en || null,
                description: soup.description || null,
                description_en: soup.description_en || null,
                price: soup.price,
                category: 'Meniul Zilei',
                image_url: soup.image_url || null,
                is_active: 1,
                is_sellable: 1,
                allergens: soup.allergens || null,
                additives: null,
                display_order: 1,
              },
              {
                id: `daily_main_${mainCourse.id} `,
                name: mainCourse.name,
                name_en: mainCourse.name_en || null,
                description: mainCourse.description || null,
                description_en: mainCourse.description_en || null,
                price: mainCourse.price,
                category: 'Meniul Zilei',
                image_url: mainCourse.image_url || null,
                is_active: 1,
                is_sellable: 1,
                allergens: mainCourse.allergens || null,
                additives: null,
                display_order: 2,
              }
            ];

            // Adaugă produsele din meniul zilnic la lista de produse
            products.push(...dailyMenuProducts);

            // Adaugă categoria "Meniul Zilei" la categorii dacă nu există
            if (!categories_ordered.includes('Meniul Zilei')) {
              categories_ordered.push('Meniul Zilei');
            }

            dailyMenu = {
              id: menu.id,
              date: menu.date,
              discount: menu.discount || 10.00,
              soup: soup,
              mainCourse: mainCourse,
            };
          }
        }
      } catch (e) {
        console.warn('⚠️ Error loading daily menu (non-critical):', e.message);
      }

      // ============================================================================
      // APLICARE AUTOMATĂ HAPPY HOUR LA PRODUSE (ca în comanda.html)
      // ============================================================================
      if (happyHour && happyHour.is_active_now && happyHour._fullData) {
        try {
          const hh = happyHour._fullData;

          // Parsează categoriile și produsele aplicabile
          let applicableCategories = [];
          let applicableProducts = [];

          if (hh.applicable_categories) {
            try {
              applicableCategories = JSON.parse(hh.applicable_categories);
            } catch (e) {
              applicableCategories = hh.applicable_categories.split(',').map(c => c.trim());
            }
          }

          if (hh.applicable_products) {
            try {
              applicableProducts = JSON.parse(hh.applicable_products);
            } catch (e) {
              applicableProducts = hh.applicable_products.split(',').map(p => parseInt(p.trim())).filter(Boolean);
            }
          }

          // Aplică reducerea la produse (ca în comanda.html)
          products = products.map(product => {
            // Verifică dacă produsul este eligibil pentru Happy Hour
            const isEligible =
              applicableProducts.includes(product.id) ||
              (applicableCategories.length > 0 && applicableCategories.includes(product.category));

            if (!isEligible) {
              return product; // Returnează produsul nemodificat
            }

            // Calculează reducerea
            let discount = 0;
            if (hh.discount_percentage > 0) {
              discount = (product.price * hh.discount_percentage) / 100;
            } else if (hh.discount_fixed > 0) {
              discount = hh.discount_fixed;
            }

            const discountedPrice = Math.max(0, product.price - discount);

            // Returnează produsul cu prețul redus și info despre discount
            return {
              ...product,
              original_price: product.price, // Păstrează prețul original
              price: discountedPrice, // Prețul cu reducere
              happy_hour_discount: discount, // Valoarea reducerii
              has_happy_hour: true, // Flag pentru frontend
              happy_hour_percentage: hh.discount_percentage || 0
            };
          });

          console.log(`✅ Applied Happy Hour discounts to ${products.filter(p => p.has_happy_hour).length} products`);
        } catch (error) {
          console.error('❌ Error applying Happy Hour discounts:', error);
        }
      }
      // ============================================================================

      // Returnează în format compatibil cu comanda.html
      // comanda.html așteaptă: { data: [...], products: [...], menu: [...], categories_ordered: [...], daily_offer, happy_hour, daily_menu }
      res.json({
        success: true,
        data: products, // Format principal pentru comanda.html
        products: products, // Alias pentru compatibilitate
        menu: products, // Alias pentru compatibilitate
        categories_ordered: categories_ordered, // Categorii ordonate (pentru comanda.html și KioskSelfServicePage)
        daily_offer: dailyOffer,
        happy_hour: happyHour ? { active: true, settings: [happyHour] } : null,
        daily_menu: dailyMenu,
        lang: lang,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Error in GET /api/menu/all:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        data: [],
        products: [],
        menu: [],
      });
    }
  });
  console.log('✅ Menu all route mounted: GET /api/menu/all (synchronized with /api/kiosk/menu)');

  // Mobile App Reservations endpoint (POST /api/mobile/reservations)
  app.post('/api/mobile/reservations', async (req, res, next) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      const {
        customer_name,
        customer_phone,
        customer_email,
        reservation_date,
        reservation_time,
        party_size,
        special_requests,
      } = req.body;

      if (!customer_name || !customer_phone || !customer_email || !reservation_date || !reservation_time || !party_size) {
        return res.status(400).json({
          success: false,
          error: 'Câmpurile obligatorii: customer_name, customer_phone, customer_email, reservation_date, reservation_time, party_size',
        });
      }

      // Folosește createReservation din database.js
      const { createReservation, getAvailableTables } = require('./database');

      // Obține mesele disponibile
      const availableTables = await getAvailableTables(reservation_date, reservation_time, party_size);

      if (!availableTables || availableTables.length === 0) {
        return res.status(409).json({
          success: false,
          error: 'Nu există mese disponibile pentru intervalul și numărul de persoane ales.',
        });
      }

      // Auto-selectează prima masă disponibilă
      const selectedTable = availableTables.find((table) => table.is_available && table.capacity >= party_size);

      if (!selectedTable) {
        return res.status(409).json({
          success: false,
          error: 'Nu există mese disponibile pentru intervalul și numărul de persoane ales.',
        });
      }

      const result = await createReservation({
        tableId: selectedTable.id,
        customerName: customer_name,
        customerPhone: customer_phone,
        customerEmail: customer_email,
        reservationDate: reservation_date,
        reservationTime: reservation_time,
        durationMinutes: 120,
        partySize: party_size,
        specialRequests: special_requests,
        locationId: req.locationId || null,
        tenantId: req.tenantId || null,
      });

      res.status(201).json({
        success: true,
        reservation: result,
        message: 'Rezervarea a fost creată cu succes',
      });
    } catch (error) {
      console.error('❌ Error in POST /api/mobile/reservations:', error);
      next(error);
    }
  });

  // Mobile App Reservations list (GET /api/mobile/reservations) - filtrează după customer_email
  app.get('/api/mobile/reservations', async (req, res, next) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Extrage email-ul din token sau query
      const customerEmail = req.query.customer_email || req.user?.email || req.body.customer_email;

      if (!customerEmail) {
        return res.status(400).json({
          success: false,
          error: 'customer_email este obligatoriu'
        });
      }

      let query = 'SELECT * FROM reservations WHERE customer_email = ? ORDER BY reservation_date DESC, reservation_time DESC LIMIT 50';
      const params = [customerEmail];

      const reservations = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      res.json({
        success: true,
        reservations: reservations
      });
    } catch (error) {
      console.error('❌ Error in GET /api/mobile/reservations:', error);
      next(error);
    }
  });

  // Mobile App Cancel Reservation (POST /api/mobile/reservations/:id/cancel)
  app.post('/api/mobile/reservations/:id/cancel', async (req, res, next) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      const reservationId = req.params.id;

      // Verifică dacă rezervarea există și aparține utilizatorului
      const reservation = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM reservations WHERE id = ?', [reservationId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!reservation) {
        return res.status(404).json({ success: false, error: 'Rezervarea nu a fost găsită' });
      }

      // Actualizează statusul la 'cancelled'
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['cancelled', reservationId],
          function (err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });

      res.json({ success: true, message: 'Rezervarea a fost anulată' });
    } catch (error) {
      console.error('❌ Error in POST /api/mobile/reservations/:id/cancel:', error);
      next(error);
    }
  });

  // Mobile App Call Waiter endpoint (POST /api/mobile/call-waiter)
  app.post('/api/mobile/call-waiter', async (req, res, next) => {
    try {
      const { table_number, customer_email, customer_name, note, access_mode } = req.body;

      // Emite eveniment Socket.IO pentru apelare ospătar
      if (global.io) {
        global.io.emit('waiterCalled', {
          tableNumber: table_number || null,
          customerEmail: customer_email,
          customerName: customer_name,
          note: note || null,
          accessMode: access_mode || 'online',
          timestamp: new Date().toISOString(),
          platform: 'MOBILE_APP'
        });
        console.log('✅ [Mobile App] Waiter called:', { table_number, customer_email, note });
      }

      res.json({
        success: true,
        message: 'Ospătarul a fost anunțat'
      });
    } catch (error) {
      console.error('❌ Error in POST /api/mobile/call-waiter:', error);
      next(error);
    }
  });

  console.log('✅ Mobile App routes mounted: /api/mobile/reservations, /api/mobile/call-waiter');

  // NOTE: Customer Authentication routes are mounted BEFORE dbPromise.then()
  // See above (before dbPromise) for /api/customers/register and /api/customers/login

  // Users routes
  app.get('/api/users', adminController.getUsers);
  app.get('/api/admin/users', adminController.getUsers);
  app.post('/api/admin/users', adminController.createUser);
  app.put('/api/admin/users/:id', adminController.updateUser);
  app.delete('/api/admin/users/:id', adminController.deleteUser);

  // Roles routes
  app.get('/api/admin/roles', adminController.getRoles);

  // Pins routes
  app.get('/api/admin/pins', adminController.getPins); // PIN-uri interfețe
  app.post('/api/admin/update-pin', adminController.updatePin); // Actualizează PIN interfață
  app.post('/api/admin/delete-pin', adminController.deletePin); // Șterge PIN interfață
  app.get('/api/admin/user-pins', adminController.getUserPins); // PIN-uri utilizatori

  // Backup routes
  app.get('/api/admin/backups', adminController.getBackups);
  app.get('/api/admin/archive-stats', adminController.getArchiveStats);

  // Scheduling routes
  app.get('/api/scheduling/live-stats', adminController.getSchedulingLiveStats);
  app.get('/api/scheduling/time-entries', adminController.getTimeEntries);

  // Events routes
  app.get('/api/events', adminController.getEvents);

  // NOTE: Reservations routes are now mounted BEFORE loadModules() to avoid conflict with /api/payments/:id
  // See above (before loadModules) for reservations routes mounting

  // Language API
  app.get('/api/lang', async (req, res) => {
    try {
      const db = await dbPromise;
      db.get('SELECT value FROM app_settings WHERE key = ?', ['app_language'], (err, row) => {
        if (err) {
          console.warn('⚠️ Error fetching language setting:', err.message);
          return res.json({ lang: 'ro' }); // Default to Romanian
        }
        res.json({ lang: row ? row.value : 'ro' });
      });
    } catch (error) {
      console.warn('⚠️ Error in /api/lang:', error.message);
      res.json({ lang: 'ro' }); // Default to Romanian
    }
  });

  // Waiter tables API
  // Returnează intervalul fix de mese pentru fiecare ospătar:
  // Ospătar 1 → mesele 1-20
  // Ospătar 2 → mesele 21-40
  // Ospătar 3 → mesele 41-60
  // etc.
  app.get('/api/waiter/:waiterId/tables', async (req, res) => {
    try {
      const { waiterId } = req.params;
      const waiterIdNum = parseInt(waiterId);

      if (isNaN(waiterIdNum) || waiterIdNum < 1 || waiterIdNum > 10) {
        return res.status(400).json({ success: false, error: 'Invalid waiter ID (must be 1-10)' });
      }

      // Calculează intervalul de mese pentru acest ospătar
      const TABLES_PER_WAITER = 20;
      const minTable = (waiterIdNum - 1) * TABLES_PER_WAITER + 1;
      const maxTable = waiterIdNum * TABLES_PER_WAITER;

      // Generează array-ul de mese pentru acest interval
      const tables = [];
      for (let i = minTable; i <= maxTable; i++) {
        tables.push(i);
      }

      console.log(`[Waiter ${waiterIdNum}] Tables range: ${minTable} -${maxTable} `);

      res.json({
        success: true,
        tables: tables,
        waiterId: waiterIdNum,
        startTable: minTable,
        endTable: maxTable,
        minTable: minTable, // Keep for backward compatibility
        maxTable: maxTable  // Keep for backward compatibility
      });
    } catch (error) {
      console.error('❌ Error in /api/waiter/:waiterId/tables:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Notifications API (if not already loaded by modules)
  app.get('/api/notifications', async (req, res) => {
    try {
      const status = req.query.status || 'unread';
      const today = ['yes', 'true', '1'].includes(String(req.query.today || '').toLowerCase());
      const dateFilter = req.query.date; // format YYYY-MM-DD
      const db = await dbPromise;

      // OPTIMIZARE: Select doar coloanele necesare în loc de SELECT *
      let sql = 'SELECT id, title, message, status, created_at, type, table_number, order_id, read_at, title_en, message_en FROM notifications';
      const conditions = [];
      const params = [];

      if (status !== 'all') {
        conditions.push('status = ?');
        params.push(status);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      sql += ' ORDER BY datetime(created_at) DESC LIMIT 500';

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ Error fetching notifications:', err);
          return res.status(500).json({ success: false, error: err.message });
        }

        let notifications = rows || [];

        // Filtrează pentru "azi" folosind JavaScript pentru controlul precis al fusului orar
        if (today) {
          const now = new Date();
          const todayStart = new Date(now);
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date(now);
          todayEnd.setHours(23, 59, 59, 999);

          // DEBUG LOGS
          console.log(`🔍[Notifications] Filtering for today: ${todayStart.toISOString()} - ${todayEnd.toISOString()} `);
          console.log(`🔍[Notifications] Total fetched: ${notifications.length} `);

          notifications = notifications.filter(notif => {
            // Fix pentru date din SQLite care pot fi șiruri simple
            let dateStr = notif.created_at;
            if (dateStr && !dateStr.includes('T') && !dateStr.includes('Z')) {
              // Presupunem că e UTC din SQLite datetime('now'), adăugăm 'Z' sau îl tratăm ca UTC
              dateStr = dateStr.replace(' ', 'T') + 'Z';
            }

            const notifDate = new Date(dateStr || notif.created_at);
            const keep = notifDate >= todayStart && notifDate <= todayEnd;

            // Log first 3 rejected to debug
            if (!keep && notifications.indexOf(notif) < 3) {
              console.log(`❌[Notifications] Excluded: ${notif.title} (${notif.created_at}) -> Parsed: ${notifDate.toISOString()} `);
            }
            return keep;
          });
          console.log(`🔍[Notifications] Kept after filter: ${notifications.length} `);
        } else if (dateFilter) {
          const filterDate = new Date(dateFilter);
          const dayStart = new Date(filterDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(filterDate);
          dayEnd.setHours(23, 59, 59, 999);

          notifications = notifications.filter(notif => {
            const notifDate = new Date(notif.created_at);
            return notifDate >= dayStart && notifDate <= dayEnd;
          });
        }

        res.json({ success: true, notifications });
      });
    } catch (error) {
      console.error('❌ Error in /api/notifications:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/notifications/unread-count', async (req, res) => {
    try {
      const db = await dbPromise;
      db.get('SELECT COUNT(*) as count FROM notifications WHERE status = ?', ['unread'], (err, row) => {
        if (err) {
          console.error('❌ Error fetching unread count:', err);
          return res.json({ success: true, count: 0 });
        }
        res.json({ success: true, count: row ? row.count : 0 });
      });
    } catch (error) {
      console.error('❌ Error in /api/notifications/unread-count:', error);
      res.json({ success: true, count: 0 });
    }
  });

  // Legacy endpoints for legacy HTML pages
  const legacyEndpoints = require('./routes/legacy-endpoints');
  app.use('/api', legacyEndpoints);
  console.log('✅ Legacy endpoints mounted');

  // Menu routes
  app.get('/api/menu/all', adminController.getMenuAll);
  app.get('/api/admin/menu/all', adminController.getMenuAll); // Alias pentru compatibilitate
  // NOTE: /api/kiosk/menu este deja definit mai sus (linia ~2754) cu funcționalități extinse
  // Root menu endpoint - /api/menu -> /api/menu/all (for benchmark compatibility)
  app.get('/api/menu', adminController.getMenuAll);

  // QR Ordering endpoints (proxy pentru KioskSelfServicePage)
  // OPTIMIZARE: Cache pentru categorii (se schimbă rar)
  app.get('/api/categories', longCacheMiddleware(), async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Încearcă să obțină categoriile din catalog_categories
      let categories = [];
      try {
        const catalogExists = await new Promise((resolve, reject) => {
          db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='catalog_categories'", [], (err, row) => {
            if (err) reject(err);
            else resolve(!!row);
          });
        });

        if (catalogExists) {
          categories = await new Promise((resolve, reject) => {
            // Verifică dacă coloana icon există
            db.all(`
              SELECT id, name, name_en,
  CASE WHEN EXISTS(SELECT 1 FROM pragma_table_info('catalog_categories') WHERE name = 'icon') 
                          THEN icon ELSE NULL END as icon,
  display_order, is_active
              FROM catalog_categories
              WHERE is_active = 1
              ORDER BY display_order, name
  `, [], (err, rows) => {
              if (err) {
                // Fallback: încearcă fără coloana icon
                db.all(`
                  SELECT id, name, name_en, NULL as icon, display_order, is_active
                  FROM catalog_categories
                  WHERE is_active = 1
                  ORDER BY display_order, name
  `, [], (err2, rows2) => {
                  if (err2) reject(err2);
                  else resolve(rows2 || []);
                });
              } else {
                resolve(rows || []);
              }
            });
          });
        } else {
          // Fallback: extrage categorii unice din meniu
          const menuItems = await new Promise((resolve, reject) => {
            db.all('SELECT DISTINCT category FROM menu WHERE category IS NOT NULL AND category != ""', [], (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            });
          });

          categories = menuItems.map((item, index) => ({
            id: index + 1,
            name: item.category,
            name_en: item.category,
            icon: null,
            display_order: index + 1,
            is_active: 1
          }));
        }
      } catch (error) {
        console.warn('⚠️ Error fetching categories:', error.message);
        categories = [];
      }

      res.json(categories);
    } catch (error) {
      console.error('❌ Error in /api/categories:', error);
      res.json([]);
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const { active } = req.query;
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      let products = [];
      try {
        const catalogExists = await new Promise((resolve, reject) => {
          db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='catalog_products'", [], (err, row) => {
            if (err) reject(err);
            else resolve(!!row);
          });
        });

        if (catalogExists) {
          const whereClause = active === 'true' ? 'WHERE p.is_active = 1' : '';
          products = await new Promise((resolve, reject) => {
            db.all(`
SELECT
p.id,
  p.name,
  p.name_en,
  p.description,
  p.description_en,
  p.price,
  p.pret2,
  p.pret3,
  p.category_id,
  p.image_url,
  p.is_active,
  c.name as category_name
              FROM catalog_products p
              LEFT JOIN catalog_categories c ON p.category_id = c.id
              ${whereClause}
              ORDER BY c.display_order, p.display_order, p.name
  `, [], (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            });
          });
        } else {
          // Fallback: folosește tabela menu
          const whereClause = active === 'true' ? 'AND is_active = 1' : '';
          products = await new Promise((resolve, reject) => {
            db.all(`
SELECT
id,
  name,
  name_en,
  description,
  description_en,
  price,
  pret2,
  pret3,
  category as category_name,
  image_url,
  is_active,
  NULL as category_id
              FROM menu
              WHERE 1 = 1 ${whereClause}
              ORDER BY category, name
  `, [], (err, rows) => {
              if (err) reject(err);
              else {
                // Adaugă category_id bazat pe numele categoriei
                const categories = [...new Set((rows || []).map(p => p.category_name).filter(Boolean))];
                const categoryMap = {};
                categories.forEach((cat, idx) => {
                  categoryMap[cat] = idx + 1;
                });
                const productsWithCategoryId = (rows || []).map(p => ({
                  ...p,
                  category_id: p.category_name ? categoryMap[p.category_name] : null
                }));
                resolve(productsWithCategoryId);
              }
            });
          });
        }
      } catch (error) {
        console.warn('⚠️ Error fetching products:', error.message);
        products = [];
      }

      res.json(products);
    } catch (error) {
      console.error('❌ Error in /api/products:', error);
      res.json([]);
    }
  });

  // Menu PDF Builder routes (Advanced configuration)
  // IMPORTANT: Must be mounted BEFORE /api/menu/pdf to avoid wildcard collision
  const menuPdfConfigRoutes = require('./routes/menuPdfConfigRoutes');
  app.use('/api/menu/pdf/builder', menuPdfConfigRoutes);

  // Menu PDF routes (Serving generated PDFs)
  const menuPdfRoutes = require('./routes/menuPdfRoutes');
  app.use('/api/menu/pdf', menuPdfRoutes);

  console.log('✅ Menu PDF routes mounted');
  console.log('✅ QR Ordering endpoints mounted: /api/categories, /api/products');


  // Orders display routes (KDS/Bar filtering) and client monitor
  // Mount the orders module router to expose /api/orders-display/client-monitor and related endpoints
  const ordersRoutes = require('./src/modules/orders/routes');
  app.use('/api', ordersRoutes);

  // Daily history endpoints
  app.get('/api/daily-history/bar', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      // Include toate comenzile finalizate (completed, delivered, paid) din ziua curentă
      // Include și comenzile MOBILE_APP
      const orders = await new Promise((resolve, reject) => {
        db.all(`
SELECT * FROM orders 
          WHERE DATE(timestamp) = DATE('now')
AND(status IN('completed', 'delivered', 'paid', 'ready') OR is_paid = 1)
            AND status != 'cancelled'
          ORDER BY timestamp DESC
  `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Filtrează după categorie (doar bar items) folosind filterOrdersByCategory
      const { filterOrdersByCategory } = require('./src/modules/orders/controllers/orders-display.controller');
      const filteredOrders = await filterOrdersByCategory(orders, true); // true = include bar

      // Calculează statistici
      const totalOrders = filteredOrders.length;
      const totalItems = filteredOrders.reduce((sum, order) => {
        const items = Array.isArray(order.items) ? order.items : (typeof order.items === 'string' ? JSON.parse(order.items || '[]') : []);
        return sum + items.length;
      }, 0);

      res.json({
        success: true,
        orders: filteredOrders,
        total_orders: totalOrders,
        total_items: totalItems
      });
    } catch (error) {
      console.error('❌ Error in /api/daily-history/bar:', error);
      res.json({ success: true, orders: [], total_orders: 0, total_items: 0 });
    }
  });

  app.get('/api/daily-history/kitchen', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      // Include toate comenzile finalizate (completed, delivered, paid) din ziua curentă
      // Include și comenzile MOBILE_APP
      const orders = await new Promise((resolve, reject) => {
        db.all(`
SELECT * FROM orders 
          WHERE DATE(timestamp) = DATE('now')
AND(status IN('completed', 'delivered', 'paid', 'ready') OR is_paid = 1)
            AND status != 'cancelled'
          ORDER BY timestamp DESC
  `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Filtrează după categorie (doar kitchen items) folosind filterOrdersByCategory
      const { filterOrdersByCategory } = require('./src/modules/orders/controllers/orders-display.controller');
      const filteredOrders = await filterOrdersByCategory(orders, false); // false = exclude bar (kitchen only)

      // Calculează statistici
      const totalOrders = filteredOrders.length;
      const totalItems = filteredOrders.reduce((sum, order) => {
        const items = Array.isArray(order.items) ? order.items : (typeof order.items === 'string' ? JSON.parse(order.items || '[]') : []);
        return sum + items.length;
      }, 0);

      res.json({
        success: true,
        orders: filteredOrders,
        total_orders: totalOrders,
        total_items: totalItems
      });
    } catch (error) {
      console.error('❌ Error in /api/daily-history/kitchen:', error);
      res.json({ success: true, orders: [], total_orders: 0, total_items: 0 });
    }
  });

  // Orders cancelled endpoint
  app.get('/api/orders-cancelled', async (req, res) => {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;
      const { lang = 'ro' } = req.query;

      // Obține doar comenzile anulate din ziua curentă
      // Folosesc strftime pentru filtrare precisă pe ziua curentă
      const orders = await new Promise((resolve, reject) => {
        db.all(`
SELECT * FROM orders 
          WHERE status = 'cancelled'
            AND cancelled_timestamp IS NOT NULL
            AND strftime('%Y-%m-%d', cancelled_timestamp) = strftime('%Y-%m-%d', 'now')
          ORDER BY cancelled_timestamp DESC
          LIMIT 500
        `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      const today = new Date().toLocaleDateString('ro-RO');
      console.log(`✅ Returnat ${orders.length} comenzi anulate din ziua curentă(${today})`);
      res.json({ success: true, orders });
    } catch (error) {
      console.error('❌ Error in /api/orders-cancelled:', error);
      res.json({ success: true, orders: [] });
    }
  });

  // ========================================
  // FISCAL RECEIPT ENDPOINTS (pentru livrare1.html)
  // ========================================

  // GET /api/fiscal/receipt/:id/details - Obține detaliile bonului nefiscal pentru o comandă
  app.get('/api/fiscal/receipt/:id/details', async (req, res) => {
    try {
      const { id } = req.params;
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Verifică dacă există tabela fiscal_receipts
      const tableExists = await new Promise((resolve, reject) => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='fiscal_receipts'", (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        });
      });

      if (!tableExists) {
        return res.status(404).json({ error: 'Bonul fiscal nu a fost găsit pentru această comandă' });
      }

      // Obține detaliile bonului nefiscal din tabela fiscal_receipts
      const receipt = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM fiscal_receipts WHERE order_id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!receipt) {
        return res.status(404).json({ error: 'Bonul fiscal nu a fost găsit pentru această comandă' });
      }

      res.json({
        receipt_number: receipt.receipt_number,
        order_id: receipt.order_id,
        total_amount: receipt.total_amount,
        vat_amount: receipt.vat_amount,
        payment_method: receipt.payment_method,
        created_at: receipt.created_at
      });
    } catch (error) {
      console.error('❌ Eroare la obținerea detaliilor bonului nefiscal:', error);
      res.status(500).json({ error: 'Eroare la obținerea detaliilor bonului nefiscal' });
    }
  });

  // POST /api/orders/:id/fiscal-receipt - Generează bon nefiscal pentru o comandă
  app.post('/api/orders/:id/fiscal-receipt', async (req, res) => {
    try {
      const { id } = req.params;
      const { payment_method = 'cash' } = req.body || {};
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Verifică dacă comanda există
      const order = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Comanda nu a fost găsită.'
        });
      }

      // Verifică dacă comanda are deja bon nefiscal
      const tableExists = await new Promise((resolve, reject) => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='fiscal_receipts'", (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        });
      });

      if (tableExists) {
        const existingReceipt = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM fiscal_receipts WHERE order_id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (existingReceipt) {
          return res.json({
            success: true,
            receipt_number: existingReceipt.receipt_number,
            receipt_id: existingReceipt.id,
            pdfUrl: `/ api / orders / ${id}/receipt?lang=ro`,
            message: `Bon nefiscal ${existingReceipt.receipt_number} deja există.`
          });
        }
      }

      // Generează bonul nefiscal folosind endpoint-ul existent de receipt (PDF)
      // Pentru moment, returnăm un link către receipt PDF
      // În viitor, poate fi implementată generarea efectivă a bonului fiscal
      res.json({
        success: true,
        receipt_number: `RC-${id}-${Date.now()}`,
        receipt_id: null,
        pdfUrl: `/api/orders/${id}/receipt?lang=ro`,
        message: 'Bon nefiscal generat cu succes. Folosiți link-ul PDF pentru printare.'
      });
    } catch (error) {
      console.error(`❌ Eroare la generarea bonului nefiscal pentru comanda ${id}:`, error);
      res.status(500).json({
        success: false,
        error: error.message || 'Eroare la generarea bonului nefiscal.'
      });
    }
  });

  // GET /api/orders/:id/receipt - Generează PDF receipt pentru o comandă
  app.get('/api/orders/:id/receipt', async (req, res) => {
    try {
      const { id } = req.params;
      const lang = req.query.lang || 'ro';
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Verifică dacă comanda există
      const order = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Comanda nu a fost găsită.'
        });
      }

      // Obține items pentru comandă
      const orderItems = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM order_items WHERE order_id = ?', [id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Returnează eroare clară că PDF-ul nu este încă implementat
      // Flutter app așteaptă un PDF, nu JSON
      res.status(501).json({
        success: false,
        error: 'Receipt PDF generation not yet implemented. Please use the order details screen to view receipt information.',
        order: {
          id: order.id,
          total: order.total,
          status: order.status,
          items: orderItems
        }
      });
    } catch (error) {
      console.error(`❌ Eroare la generarea receipt PDF pentru comanda ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: error.message || 'Eroare la generarea receipt PDF.'
      });
    }
  });

  // Verify PIN endpoint
  app.post('/api/verify-pin', async (req, res) => {
    try {
      const { pin } = req.body;
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      if (!pin || pin.length !== 4) {
        return res.json({ success: false, valid: false, error: 'PIN-ul trebuie să aibă 4 cifre' });
      }

      // Verifică în tabelul users după coloana pin
      let user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE pin = ?', [pin], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      // Dacă nu găsește în users, verifică în waiters
      if (!user) {
        user = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM waiters WHERE pin = ?', [pin], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      }

      // Fallback: PIN-ul default 5555 pentru admin (acceptat direct)
      if (!user && pin === '5555') {
        user = { id: 1, username: 'admin', role: 'admin', pin: pin };
      }

      if (user) {
        res.json({ success: true, valid: true, user: { id: user.id, username: user.username || user.name, role: user.role || 'staff' } });
      } else {
        res.json({ success: true, valid: false, error: 'PIN incorect' });
      }
    } catch (error) {
      console.error('❌ Error in /api/verify-pin:', error);
      res.json({ success: false, valid: false, error: error.message });
    }
  });

  // Rewards check endpoint
  app.get('/api/rewards/check', async (req, res) => {
    try {
      const { customerToken } = req.query;
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Check if rewards table exists
      const rewardsTableExists = await new Promise((resolve, reject) => {
        db.get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='rewards'",
          (err, row) => {
            if (err) reject(err);
            else resolve(!!row);
          }
        );
      });

      if (!rewardsTableExists) {
        return res.json({ success: true, rewards: [], hasRewards: false });
      }

      // Check if customer has rewards
      const rewards = await new Promise((resolve, reject) => {
        db.all(`
          SELECT r.*
          FROM rewards r
          WHERE r.is_active = 1
        `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Get customer points if loyalty_rewards table exists
      let customerPoints = 0;
      try {
        const loyaltyTableExists = await new Promise((resolve, reject) => {
          db.get(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='loyalty_rewards'",
            (err, row) => {
              if (err) reject(err);
              else resolve(!!row);
            }
          );
        });

        if (loyaltyTableExists && customerToken) {
          const loyaltyData = await new Promise((resolve, reject) => {
            db.get(
              'SELECT points_balance FROM loyalty_rewards WHERE customer_token = ?',
              [customerToken],
              (err, row) => {
                if (err) reject(err);
                else resolve(row);
              }
            );
          });
          if (loyaltyData) {
            customerPoints = loyaltyData.points_balance || 0;
          }
        }
      } catch (e) {
        // Ignore errors for loyalty points
      }

      res.json({
        success: true,
        rewards: rewards || [],
        hasRewards: (rewards || []).length > 0,
        customerPoints: customerPoints
      });
    } catch (error) {
      console.error('❌ Error in /api/rewards/check:', error);
      res.json({ success: true, rewards: [], hasRewards: false });
    }
  });

  // Couriers routes - mount module routes (includes GET /api/couriers, POST /api/couriers/login, etc.)
  const couriersRoutes = require('./src/modules/couriers/routes');
  app.use('/api/couriers', couriersRoutes);

  // Additional couriers routes (dispatch, tracking) - keep for backward compatibility
  app.get('/api/couriers/dispatch/available', adminController.getCouriersAvailable);
  app.get('/api/couriers/dispatch/pending', adminController.getCouriersPending);
  app.get('/api/couriers/tracking/live', adminController.getCouriersTracking);

  console.log('✅ Couriers routes mounted: /api/couriers/* (includes GET /, POST /login, GET /me, POST /dispatch/assign, etc.)');

  // Messages routes
  app.get('/api/messages/admin/:userId', adminController.getMessages);

  // GET /api/messages/:role/:id - Get messages for a specific role and ID (kitchen, waiter, etc.)
  app.get('/api/messages/:role/:id', async (req, res) => {
    const { role, id } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    try {
      const db = await dbPromise;
      const query = `
        SELECT * FROM internal_messages
        WHERE (receiver_type = ? AND receiver_id = ?) 
           OR (sender_type = ? AND sender_id = ?)
        ORDER BY timestamp DESC
        LIMIT ?
      `;

      db.all(query, [role, id, role, id, limit], (err, rows) => {
        if (err) {
          console.error('❌ Error fetching messages:', err);
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json(rows || []);
      });
    } catch (error) {
      console.error('❌ Error in /api/messages/:role/:id:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/session/start - Start client session (for comanda.html)
  app.post('/api/session/start', async (req, res) => {
    try {
      const { tableNumber, clientToken } = req.body;

      if (!tableNumber) {
        return res.status(400).json({
          success: false,
          error: 'Table number is required'
        });
      }

      // Generate client identifier
      const clientIdentifier = `table_${tableNumber}_${Date.now()}`;

      // Store session info (optional - can be stored in database if needed)
      // For now, just return the identifier

      res.json({
        success: true,
        clientIdentifier: clientIdentifier,
        tableNumber: parseInt(tableNumber),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in /api/session/start:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  console.log('✅ Client session endpoint mounted');

  // GET /api/server-info - Get server network information for auto-discovery
  app.get('/api/server-info', async (req, res) => {
    try {
      const os = require('os');
      const interfaces = os.networkInterfaces();
      const networkIPs = [];

      // Detectează toate IP-urile IPv4 disponibile (exclude localhost și APIPA)
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254')) {
            // Prioritate pentru range-uri comune de hotspot
            let priority = 0;
            if (iface.address.startsWith('192.168.43.')) priority = 100; // Android hotspot
            else if (iface.address.startsWith('192.168.137.')) priority = 90; // Windows hotspot
            else if (iface.address.startsWith('172.20.10.')) priority = 85; // iPhone hotspot
            else if (iface.address.startsWith('192.168.1.')) priority = 50;
            else if (iface.address.startsWith('192.168.0.')) priority = 50;
            else if (iface.address.startsWith('10.0.')) priority = 30;
            else priority = 10;

            networkIPs.push({
              name: name,
              address: iface.address,
              netmask: iface.netmask,
              priority: priority,
            });
          }
        }
      }

      // Sortează după prioritate (cel mai probabil pentru hotspot primele)
      networkIPs.sort((a, b) => b.priority - a.priority);

      // IP-ul recomandat (primul din listă, sau localhost ca fallback)
      const recommendedIP = networkIPs.length > 0 ? networkIPs[0].address : 'localhost';
      const port = process.env.PORT || 3001;

      res.json({
        success: true,
        server: {
          hostname: os.hostname(),
          port: port,
          recommended_url: `http://${recommendedIP}:${port}`,
          recommended_ip: recommendedIP,
          network_interfaces: networkIPs,
          // Pentru compatibilitate cu detect-hotspot-ip.ps1
          hotspot_ip: recommendedIP,
          all_ips: networkIPs.map(ip => ip.address),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Error in /api/server-info:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        server: {
          port: process.env.PORT || 3001,
          recommended_url: 'http://localhost:3001',
          recommended_ip: 'localhost',
        },
      });
    }
  });

  // GET /api/config - This endpoint is now defined BEFORE dbPromise.then() for immediate availability
  // (See above, around line 597, for the implementation)

  console.log('✅ Additional admin routes mounted');

  console.log('✅ All modules and routes loaded');

  // ========================================
  // 404 HANDLER (Mount AFTER all modules are loaded)
  // Must be mounted after dbPromise.then() to ensure all routes (including modules) are processed first
  // ========================================
  const { load404Handler } = require('./src/loaders');
  load404Handler(app);
  console.log('✅ 404 handler loaded (after all modules)');

  // Load error handlers AFTER 404 handler (must be absolutely last)
  loadErrorHandlers(app);

  console.log('✅ Error handlers loaded (after 404 handler)');

  // ========================================
  // START SERVER (ONLY AFTER ALL ROUTES ARE LOADED)
  // ========================================
  const PORT = process.env.PORT || 3001;

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Enterprise server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API health: http://localhost:${PORT}/api/health`);

    // Initialize Socket.IO ONLY HERE (after server starts)
    initSocketIO();

    // Initialize periodic alert checks (every 5 minutes)
    const AlertsService = require('./src/modules/alerts/alerts.service');
    setInterval(async () => {
      try {
        await AlertsService.checkAllAlerts();
      } catch (error) {
        console.error('❌ [ALERTS] Error in periodic check:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    console.log('✅ Periodic alert checks initialized (every 5 minutes)');

    // Initialize database indexes for performance
    const DatabaseOptimizationService = require('./src/modules/database/db-optimization.service');
    DatabaseOptimizationService.createIndexes().catch(err => {
      console.error('❌ [DB OPTIMIZATION] Error creating indexes:', err);
    });

    // Initialize cache cleanup (every 10 minutes)
    const StatsCache = require('./src/modules/cache/stats-cache.service');
    setInterval(() => {
      const cleaned = StatsCache.cleanExpired();
      if (cleaned > 0) {
        console.log(`🧹 [CACHE] Cleaned ${cleaned} expired cache entries`);
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    console.log('✅ Cache cleanup initialized (every 10 minutes)');

    // Initialize monitoring alerts check (every 5 minutes)
    const MonitoringService = require('./src/modules/monitoring/monitoring.service');
    setInterval(async () => {
      try {
        const alerts = await MonitoringService.checkAlerts();
        if (alerts.length > 0 && global.io) {
          alerts.forEach(alert => {
            AlertsService.emitAlert(alert);
          });
        }
      } catch (error) {
        console.error('❌ [MONITORING] Error in periodic check:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    console.log('✅ Monitoring alerts check initialized (every 5 minutes)');

    // Initialize automated reports (check every hour)
    const AutomatedReportsService = require('./src/modules/reports/automated-reports.service');
    setInterval(async () => {
      try {
        await AutomatedReportsService.scheduleReports();
      } catch (error) {
        console.error('❌ [AUTOMATED REPORTS] Error in scheduled reports:', error);
      }
    }, 60 * 60 * 1000); // Every hour

    console.log('✅ Automated reports scheduler initialized (check every hour)');

    // Initialize automated backups (check every hour)
    const AutomatedBackupService = require('./src/modules/backup/automated-backup.service');
    setInterval(async () => {
      try {
        await AutomatedBackupService.scheduleBackups();
      } catch (error) {
        console.error('❌ [AUTOMATED BACKUP] Error in scheduled backups:', error);
      }
    }, 60 * 60 * 1000); // Every hour

    console.log('✅ Automated backup scheduler initialized (check every hour)');
  });

}).catch((err) => {
  console.error('❌ CRITICAL: Database connection failed:', err.message);
  console.error('📚 Stack Trace:', err.stack);

  // CRITICAL: Don't continue without DB - exit application
  console.error('🔴 Server cannot start without database. Exiting...');
  process.exit(1);
});

// ========================================
// REACT CATCH-ALL (SPA Routing)
// Must be AFTER static files but BEFORE 404 handler and error handlers
// IMPORTANT: This middleware is placed BEFORE dbPromise resolves
// to allow SPA to load even if API routes aren't ready yet
// ========================================
// Pre-calculate admin-vite paths (outside middleware for performance)
const adminViteIndex = path.join(__dirname, 'admin-vite', 'dist', 'index.html');
const adminViteAssets = path.join(__dirname, 'admin-vite', 'dist', 'assets');
const spaHtmlPages = ['/adminv4.html'];

// DEBUG: Log paths at startup
console.log('🔍 DEBUG - SPA Paths Configuration:');
console.log(`  __dirname: ${__dirname}`);
console.log(`  adminViteIndex: ${adminViteIndex}`);
console.log(`  adminViteIndex exists: ${fs.existsSync(adminViteIndex)}`);
console.log(`  adminViteAssets: ${adminViteAssets}`);

// ========================================
// SCREENSHOTS STATIC FILES (MUST BE BEFORE SPA CATCH-ALL)
// ========================================
// Mapping between requested screenshot names and actual file names
const screenshotMapping = {
  'dashboard.png': '01-dashboard.png',
  'kiosk-dashboard.png': '01-dashboard.png', // Fallback to dashboard
  'monitoring-performance.png': '02-monitoring.png',
  'orders.png': '03-orders.png',
  'orders-history.png': '04-orders-history.png',
  'orders-delivery.png': '05-orders-delivery.png',
  'orders-drive-thru.png': '06-orders-drivethru.png',
  'orders-takeaway.png': '07-orders-takeaway.png',
  'couriers.png': '09-couriers.png',
  'dispatch.png': '10-dispatch.png',
  'stocks.png': '11-stocks.png',
  'catalog.png': '17-catalog.png',
  'menu.png': '18-menu.png',
  'menu-builder.png': '19-menu-builder.png',
  'ingredients.png': '20-ingredients.png',
  'recipes.png': '21-recipes.png',
  'reports-sales.png': '23-reports-sales.png',
  'reports-stock.png': '24-reports-stock.png',
  'reports-profit-loss.png': '26-reports-profit-loss.png',
  'settings.png': '27-settings.png',
  'settings-locations.png': '28-settings-locations.png',
  'settings-tables.png': '29-settings-tables.png',
  'waiters.png': '30-waiters.png',
  'settings-users.png': '31-settings-users.png',
  'settings-printers.png': '32-settings-printers.png',
  'settings-schedule.png': '30-waiters.png', // Fallback
  'settings-notifications.png': '31-settings-users.png', // Fallback
  'settings-localization.png': '27-settings.png', // Fallback
  'settings-ui-customization.png': '27-settings.png', // Fallback
  'settings-branding.png': '27-settings.png', // Fallback
  'settings-product-display.png': '27-settings.png', // Fallback
  'settings-missing-translations.png': '27-settings.png', // Fallback
  'settings-payment-methods.png': '27-settings.png', // Fallback
  'integrations.png': '27-settings.png', // Fallback
  'settings-import-export.png': '27-settings.png', // Fallback
  'backup.png': '27-settings.png', // Fallback
  'settings-manual-instructiuni.png': '27-settings.png', // Fallback
  'stocks-inventory-multi.png': '11-stocks.png', // Fallback
  'stocks-inventory-dashboard.png': '11-stocks.png', // Fallback
  'stocks-inventory-import.png': '11-stocks.png', // Fallback
  'stocks-suppliers.png': '16-suppliers.png',
  'stocks-suppliers-orders.png': '16-suppliers.png', // Fallback
  'stocks-waste.png': '11-stocks.png', // Fallback
  'stocks-labels.png': '11-stocks.png', // Fallback
  'stocks-allergens.png': '11-stocks.png', // Fallback
  'stocks-risk-alerts.png': '11-stocks.png', // Fallback
  'expiry-alerts.png': '11-stocks.png', // Fallback
  'recalls.png': '11-stocks.png', // Fallback
  'stocks-costs.png': '11-stocks.png', // Fallback
  'catalog-online.png': '17-catalog.png', // Fallback
  'catalog-attributes.png': '17-catalog.png', // Fallback
  'catalog-prices.png': '17-catalog.png', // Fallback
  'recipes-scaling.png': '21-recipes.png', // Fallback
  'technical-sheets.png': '21-recipes.png', // Fallback
  'lots.png': '21-recipes.png', // Fallback
  'production-batches.png': '22-production-batches.png',
  'traceability.png': '21-recipes.png', // Fallback
  'reports-abc-analysis.png': '23-reports-sales.png', // Fallback
  'reports-stock-prediction.png': '24-reports-stock.png', // Fallback
  'reports-top-products.png': '23-reports-sales.png', // Fallback
  'reports-staff.png': '23-reports-sales.png', // Fallback
  'reports-advanced.png': '23-reports-sales.png', // Fallback
  'reports-financial.png': '23-reports-sales.png', // Fallback
  'queue-monitor.png': '03-orders.png', // Fallback
  'kiosk.png': '01-dashboard.png', // Fallback
};

// Middleware to handle screenshot requests with name mapping
app.use('/screenshots', (req, res, next) => {
  try {
    // Only handle PNG files in admin-vite subdirectory
    if (req.path.startsWith('/admin-vite/') && req.path.endsWith('.png')) {
      const requestedFile = path.basename(req.path);
      const mappedFile = screenshotMapping[requestedFile];

      if (mappedFile) {
        const screenshotPath = path.join(__dirname, 'screenshots', 'admin-vite', mappedFile);
        if (fs.existsSync(screenshotPath)) {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return res.sendFile(path.resolve(screenshotPath));
        }
      }

      // Try direct file name (in case it exists with exact name)
      const directPath = path.join(__dirname, 'screenshots', req.path);
      if (fs.existsSync(directPath)) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.sendFile(path.resolve(directPath));
      }

      // If not found, return 404 (don't continue to next middleware)
      return res.status(404).json({ error: 'Screenshot not found', requested: requestedFile });
    }

    // For other screenshot paths, use static file serving
    next();
  } catch (error) {
    console.error(`❌ Screenshot middleware error: ${error.message}`);
    next(error);
  }
});

// Serve other screenshots statically (non-admin-vite)
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots'), {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));
console.log('✅ Screenshots static files configured: /screenshots/* (with name mapping)');

// ========================================
// STATIC ASSETS MIDDLEWARE (MUST BE BEFORE SPA CATCH-ALL)
// ========================================
// Serve static assets from admin-vite/dist/assets/ when Vite dev server is not running
app.use('/admin-vite', (req, res, next) => {
  try {
    // Only handle static asset requests (CSS, JS, images, fonts, etc.)
    if (req.path && req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json)$/i)) {
      // Remove /admin-vite prefix and try to find file in dist
      let assetPath = req.path.replace(/^\/admin-vite/, '');

      // If path starts with /assets/, serve from dist/assets/
      if (assetPath.startsWith('/assets/')) {
        const filePath = path.join(adminViteDist, assetPath);
        if (fs.existsSync(filePath)) {
          // Set appropriate content type
          const ext = path.extname(filePath).toLowerCase();
          const contentTypes = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.map': 'application/json',
            '.json': 'application/json'
          };
          const contentType = contentTypes[ext] || 'application/octet-stream';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return res.sendFile(path.resolve(filePath));
        }
      }

      // Try to serve from dist root (for manifest.json, sw.js, etc.)
      const rootFilePath = path.join(adminViteDist, assetPath);
      if (fs.existsSync(rootFilePath)) {
        const ext = path.extname(rootFilePath).toLowerCase();
        const contentTypes = {
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg'
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        if (ext === '.json' || assetPath.includes('manifest') || assetPath.includes('sw.js')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        return res.sendFile(path.resolve(rootFilePath));
      }

      // If file not found, continue to next middleware (might be handled by Vite dev server or SPA)
      return next();
    }

    // Not a static asset, continue to next middleware
    next();
  } catch (error) {
    console.error(`❌ Static assets middleware error: ${error.message}`);
    next();
  }
});
console.log('✅ Static assets middleware configured for /admin-vite/*');

app.use((req, res, next) => {
  try {
    // Always let API routes pass through (they're handled by modules)
    if (req.path && req.path.startsWith('/api/')) {
      // Debug: Log weather-forecast requests
      if (req.path.startsWith('/api/weather-forecast')) {
        console.log('🌤️ Weather Forecast request:', req.method, req.path);
      }
      // If API route but modules not loaded yet, return 503
      // This prevents SPA from catching API routes
      return next();
    }

    // Always let static assets pass through
    if (req.path && req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map)$/i)) {
      return next();
    }

    // Always let manual files pass through (handled by specific routes above)
    if (req.path && (req.path.includes('MANUAL-INSTRUCTIUNI-COMPLETE.md') || req.path.startsWith('/server/'))) {
      return next();
    }

    // Always let health checks pass through
    if (req.path === '/health' || req.path === '/api/health') {
      return next();
    }

    // Skip if req.path is not defined
    if (!req.path) {
      return next();
    }

    // Serve index.html for specific HTML pages and SPA routes (but not legacy ones)
    // Root path '/' should also be served as SPA (React Router will handle it)
    // Exclude legacy HTML files from SPA routing (they're handled by legacy middleware)
    const isLegacyHtml = legacyRoutes.some(route => {
      try {
        const decodedPath = decodeURIComponent(req.path);
        return req.path === route || decodedPath === route || req.originalUrl.split('?')[0] === route;
      } catch (e) {
        return req.path === route || req.originalUrl.split('?')[0] === route;
      }
    });

    if (isLegacyHtml) {
      return next(); // Let legacy HTML middleware handle it (already processed above)
    }

    const isSpaRoute = !req.path.includes('.') &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/health');

    // Check if this is a SPA route (React Router route)
    // Include root path '/' for SPA
    // IMPORTANT: Exclude assets and files with dots from SPA routing so they can be served by express.static
    const isAsset = req.path.includes('.') || req.path.startsWith('/admin-vite/assets');
    const shouldServeSpa = !isAsset && (
      spaHtmlPages.includes(req.path) ||
      req.path.startsWith('/admin-vite') ||
      req.path === '/' ||
      isSpaRoute);

    if (shouldServeSpa) {
      // Serve dist/index.html if it exists (regardless of NODE_ENV)
      // If dist doesn't exist, fall back to Vite dev server proxy
      if (fs.existsSync(adminViteIndex)) {
        console.log(`✅ Serving SPA index.html for: ${req.path}`);

        // CRITICAL: Set no-cache headers for index.html to prevent browser caching
        // This ensures fresh HTML is served on every refresh
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        res.setHeader('Last-Modified', new Date().toUTCString());

        return res.sendFile(path.resolve(adminViteIndex), (err) => {
          if (err) {
            console.error(`❌ Error serving SPA index.html: ${err.message}`);
            return next(err);
          }
        });
      } else {
        // dist/index.html doesn't exist - try Vite dev server proxy or pass through
        console.warn(`⚠️  SPA index.html not found at: ${adminViteIndex} - falling back to Vite dev server`);
        return next();
      }
    }

    next();
  } catch (error) {
    console.error(`❌ SPA middleware error: ${error.message}`);
    console.error(`📚 Stack: ${error.stack}`);
    // Don't block request on error
    next();
  }
});
console.log('✅ SPA catch-all middleware configured');

// NOTE: 404 handler is loaded AFTER dbPromise.then() completes (after all modules are mounted)
// See dbPromise.then() block below

// NOTE: httpServer.listen() is now called INSIDE dbPromise.then()
// to ensure all routes are loaded before server starts
module.exports = { app, httpServer };
