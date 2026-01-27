/**
 * Queue Configuration - In-Memory Queue
 * 
 * Acest modul inițializează queue-ul in-memory pentru serializarea
 * operațiilor de stoc, eliminând problema "nested transactions" din SQLite.
 * 
 * Folosește In-Memory Queue pentru deployment white-label simplificat,
 * fără dependență de Redis.
 */

const InMemoryQueue = require('./in-memory-queue');

console.log(`📡 Inițializare Stock Queue - In-Memory (White-Label Mode)`);

const stockQueue = new InMemoryQueue({
  maxRetries: 3,              // retry până la 3 ori
  processInterval: 100,        // 100ms între procesări
  maxQueueSize: 1000,         // max 1000 job-uri în coadă
  persistPath: './data/queue-backup.json' // persistență la restart
});

// Wrapper pentru compatibilitate cu Bull Queue API
stockQueue.add = stockQueue.add.bind(stockQueue);
stockQueue.process = stockQueue.process.bind(stockQueue);
stockQueue.close = async () => {
  console.log('🛑 Închidere In-Memory Queue...');
  stockQueue.stopWorker();
  await stockQueue.saveQueue();
  console.log('✅ Queue închis cu succes');
};

// Event emulation pentru monitoring (compatibilitate cu Bull)
stockQueue.on = (event, callback) => {
  // In-Memory Queue nu are events native, dar putem adăuga logging
  console.log(`ℹ️  Event listener '${event}' înregistrat (informațional)`);
};

module.exports = stockQueue;

