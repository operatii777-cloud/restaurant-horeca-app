/**
 * ENTERPRISE MODULE
 * Phase: E4 - Body Parser Middleware
 * DO NOT DELETE – Replaces body parser middleware in server.js
 * 
 * Purpose: Express body parser middleware (json, urlencoded)
 * Created in PHASE E4
 * 
 * TODO PHASE E5: Move express.json and express.urlencoded from server.js
 */

const express = require('express');
const config = require('../config');

function registerBodyParsers(app) {
  // TODO PHASE E5: Move express.json() config from server.js
  app.use(express.json({ limit: config.constants.BODY_PARSER_LIMIT }));
  
  // TODO PHASE E5: Move express.urlencoded() config from server.js
  app.use(express.urlencoded({ extended: true, limit: config.constants.BODY_PARSER_LIMIT }));
  
  return app;
}

module.exports = { registerBodyParsers };

