/**
 * PHASE E9.7 - Static Files Loader
 * 
 * Configures static file serving.
 */

const express = require('express');
const path = require('path');

function loadStaticFiles(app) {
  // Public static files
  app.use(express.static('public', {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));
  
  // Admin-vite static files (if exists)
  const adminVitePath = path.join(__dirname, '../../admin-vite/dist');
  try {
    const fs = require('fs');
    if (fs.existsSync(adminVitePath)) {
      app.use('/admin-vite', express.static(adminVitePath, {
        maxAge: '1d',
        etag: true
      }));
      console.log('✅ Admin-vite static files configured');
    }
  } catch (err) {
    // Admin-vite not built yet, skip
  }
  
  // Assets
  const assetsPath = path.join(__dirname, '../../admin-vite/dist/assets');
  try {
    const fs = require('fs');
    if (fs.existsSync(assetsPath)) {
      app.use('/assets', express.static(assetsPath, {
        maxAge: '1y',
        etag: true
      }));
      console.log('✅ Assets static files configured');
    }
  } catch (err) {
    // Assets not built yet, skip
  }
  
  console.log('📁 Static files configured');
}

module.exports = { loadStaticFiles };

