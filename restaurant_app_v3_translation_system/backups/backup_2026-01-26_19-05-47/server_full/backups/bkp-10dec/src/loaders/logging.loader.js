/**
 * PHASE E9.7 - Logging Loader
 * 
 * Configures Morgan HTTP logging and Winston error logging.
 */

const morgan = require('morgan');
const logger = require('../../logger');
const enterpriseLogger = require('../utils/logger.enterprise');

function loadLogging(app) {
  // Morgan HTTP logging
  app.use(morgan('combined', { stream: logger.stream }));
  
  // Winston error logger
  app.use(logger.errorLogger);
  
  // Request tracking middleware
  app.use((req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      enterpriseLogger.logRequest(req, res, responseTime);
    });
    
    next();
  });
  
  console.log('📝 Logging middleware activated (Morgan + Winston)');
}

module.exports = { loadLogging };

