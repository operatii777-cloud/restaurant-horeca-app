/**
 * PHASE E9.7 - Body Parser Loader
 * 
 * Configures body parsing middleware.
 */

function loadBodyParser(app) {
  const express = require('express');
  
  // JSON body parser
  app.use(express.json({ limit: '10mb' }));
  
  // URL encoded body parser
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  console.log('✅ Body parser configured');
}

module.exports = { loadBodyParser };

