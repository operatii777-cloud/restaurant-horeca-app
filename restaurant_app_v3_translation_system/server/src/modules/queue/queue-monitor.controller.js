/**
 * Queue Monitor Controller
 * 
 * Endpoint pentru monitorizarea cozii de comenzi
 */

const orderQueueService = require('../orders/order-queue.service');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/queue/monitor
 * Obține status-ul cozii de comenzi
 */
async function getQueueMonitor(req, res, next) {
  try {
    const queueType = 'memory';
    
    // Obține statistici reale din order queue
    const stats = orderQueueService.getStats();
    
    // Obține job-urile din coadă
    const queueItems = orderQueueService.getQueueItems();
    
    // Obține job-urile eșuate
    const failedJobsDir = path.join(__dirname, '../../../data/failed-jobs');
    const failedJobs = [];
    
    try {
      if (fs.existsSync(failedJobsDir)) {
        const files = fs.readdirSync(failedJobsDir).filter(f => f.endsWith('.json'));
        for (const file of files.slice(0, 20)) { // Limitează la ultimele 20
          try {
            const content = JSON.parse(fs.readFileSync(path.join(failedJobsDir, file), 'utf8'));
            failedJobs.push({
              id: content.job?.id || file.replace('.json', ''),
              failedAt: content.failedAt,
              error: content.error?.message,
              orderData: content.job?.data?.orderData,
            });
          } catch (e) {
            // Skip invalid files
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Error reading failed jobs:', err.message);
    }

    res.json({
      success: true,
      queueType,
      stats: {
        ...stats,
        avgProcessingTime: 0, // TODO: Calculare medie timp procesare
        todayTotal: stats.processed + stats.failed + stats.currentQueueSize,
        ordersByStatus: {
          pending: queueItems.filter(item => item.status === 'waiting').length,
          processing: stats.processing ? 1 : 0,
          completed: stats.processed,
          failed: stats.failed,
        },
      },
      queueItems,
      failedJobs,
      message: `Queue system activ (${queueType})`,
    });
  } catch (error) {
    console.error('❌ Error in getQueueMonitor:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Eroare la încărcarea monitorului cozii',
    });
  }
}

module.exports = {
  getQueueMonitor,
};

