/**
 * ENTERPRISE MODULE
 * Phase: E2 - Paths Config Extraction
 * DO NOT DELETE – Replaces legacy config inside server.js
 * 
 * Purpose: File system paths configuration
 * Extracted from server.js in PHASE E2
 */

const path = require('path');

module.exports = {
  // Admin Vite paths
  adminViteDistPath: path.join(__dirname, '..', '..', 'admin-vite', 'dist'),
  adminViteManifestPath: path.join(__dirname, '..', '..', 'admin-vite', 'dist', '.vite', 'manifest.json'),
  
  // Admin HTML paths
  adminHtmlPath: path.join(__dirname, '..', '..', 'public', 'admin.html'),
  dashboardHtmlPath: path.join(__dirname, '..', '..', 'public', 'dashboard.html'),
  adminV4HtmlPath: path.join(__dirname, '..', '..', 'public', 'admin-v4.html'),
  adminV4LoaderPath: path.join(__dirname, '..', '..', 'public', 'admin-v4-loader.html'),
  
  // Public paths
  publicPath: path.join(__dirname, '..', '..', 'public'),
  documentsPath: path.join(__dirname, '..', '..', 'public', 'documents'),
  
  // Root directory
  rootDir: path.join(__dirname, '..', '..')
};

