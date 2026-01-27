/**
 * FAZA 1 - ANAF Submit Module Initialization
 * 
 * Initializes token refresh cron and queue processor
 */

const anafTokenService = require('./token/anafToken.service');
const AnafQueueService = require('./queue/anafQueue.service');
const FiscalPrintQueueService = require('../fiscal/services/fiscalPrintQueue.service');

/**
 * Initialize ANAF module
 */
function initializeAnafModule() {
  // Start token refresh cron (checks daily for expiration)
  anafTokenService.startTokenRefreshCron();
  
  // Start ANAF submission queue processor (processes submissions every 5 seconds)
  const queueService = new AnafQueueService();
  queueService.start();
  
  // FAZA 1.6 - Start fiscal print queue processor
  FiscalPrintQueueService.start();
  
  console.log('[ANAF Module] ✅ ANAF module initialized: token refresh cron + ANAF queue + print queue started');
}

module.exports = {
  initializeAnafModule
};

