/**
 * PHASE E9.7 - Static Files Loader
 * 
 * Configures static file serving.
 */

const express = require('express');
const path = require('path');

function loadStaticFiles(app) {
  // Public static files
  // IMPORTANT: Legacy HTML files are handled BEFORE this middleware in server.js
  // This prevents express.static from intercepting legacy HTML requests
  app.use(express.static('public', {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    // Don't serve HTML files from public root (legacy HTML files are handled separately)
    index: false
  }));
  
  // Admin-vite static files (if exists)
  const adminVitePath = path.join(__dirname, '../../admin-vite/dist');
  try {
    const fs = require('fs');
    if (fs.existsSync(adminVitePath)) {
      // Serve index.html and other files from dist root
      // NOTE: index.html is excluded from caching (handled by SPA middleware with no-cache headers)
      app.use('/admin-vite', express.static(adminVitePath, {
        maxAge: '1d',
        etag: true,
        index: false, // Don't serve index.html automatically (handled by SPA middleware)
        setHeaders: (res, filePath) => {
          // CRITICAL: Exclude index.html from caching - it's handled by SPA middleware
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        }
      }));
      console.log('✅ Admin-vite static files configured:', adminVitePath);
      
      // CRITICAL: Serve assets folder explicitly
      const assetsPath = path.join(adminVitePath, 'assets');
      if (fs.existsSync(assetsPath)) {
        app.use('/admin-vite/assets', express.static(assetsPath, {
          maxAge: '1y',
          etag: true,
          setHeaders: (res, filePath) => {
            // Set correct MIME types
            if (filePath.endsWith('.js')) {
              res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            } else if (filePath.endsWith('.css')) {
              res.setHeader('Content-Type', 'text/css; charset=utf-8');
            }
          }
        }));
        console.log('✅ Admin-vite assets static files configured:', assetsPath);
      } else {
        console.warn('⚠️ Admin-vite assets folder not found:', assetsPath);
      }
    } else {
      console.warn('⚠️ Admin-vite dist folder not found:', adminVitePath);
    }
  } catch (err) {
    console.error('❌ Error configuring admin-vite static files:', err.message);
  }
  
  console.log('📁 Static files configured');
}

module.exports = { loadStaticFiles };

