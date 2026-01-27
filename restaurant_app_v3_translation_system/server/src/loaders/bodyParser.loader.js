/**
 * PHASE E9.7 - Body Parser Loader
 * 
 * Configures body parsing middleware.
 */

function loadBodyParser(app) {
  const express = require('express');
  
  // JSON body parser cu UTF-8 - accept both with and without charset
  app.use(express.json({ 
    limit: '10mb',
    type: ['application/json', 'application/json; charset=utf-8']
  }));
  
  // URL encoded body parser
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));
  
  console.log('✅ Body parser configured with UTF-8 support');
}

module.exports = { loadBodyParser };

