/**
 * PHASE S7.3 - Print Queue Service
 * 
 * Background worker for processing fiscal print jobs with retry logic.
 */

const PrinterService = require('./printer.service');
const PrintJobsRepository = require('../repo/printJobs.repository');
const FiscalizareRepository = require('../repo/fiscalizare.repository');

const MAX_ATTEMPTS = 5;
const BASE_DELAY_SECONDS = 30; // Backoff base delay
const PROCESS_INTERVAL_MS = 3000; // Check every 3 seconds

class PrintQueueService {
  constructor() {
    this.running = false;
    this.loopHandle = null;
    this.isProcessing = false;
  }

  /**
   * Start the print queue worker
   */
  start() {
    if (this.running) {
      console.log('[FISCAL QUEUE] Worker already running');
      return;
    }

    this.running = true;
    this.loopHandle = setInterval(() => this.processNextJob(), PROCESS_INTERVAL_MS);
    console.log('[FISCAL QUEUE] ✅ Started print queue worker (interval: ' + PROCESS_INTERVAL_MS + 'ms)');
  }

  /**
   * Stop the print queue worker
   */
  stop() {
    if (!this.running) {
      return;
    }

    this.running = false;
    if (this.loopHandle) {
      clearInterval(this.loopHandle);
      this.loopHandle = null;
    }
    console.log('[FISCAL QUEUE] ⏹️ Stopped print queue worker');
  }

  /**
   * Process the next pending job
   */
  async processNextJob() {
    if (!this.running || this.isProcessing) {
      return;
    }

    try {
      this.isProcessing = true;

      const job = await PrintJobsRepository.getNextPendingJob();
      if (!job) {
        return; // No pending jobs
      }

      console.log(`[FISCAL QUEUE] Processing job ${job.id} for receipt ${job.receipt_id}`);

      // Mark as processing
      await PrintJobsRepository.markProcessing(job.id);

      // Get receipt
      const receipt = await FiscalizareRepository.getReceipt(job.receipt_id);
      if (!receipt) {
        console.error(`[FISCAL QUEUE] Receipt ${job.receipt_id} not found for job ${job.id}`);
        await PrintJobsRepository.markFailed(
          job.id,
          'Receipt not found',
          0,
          1 // Fail immediately if receipt doesn't exist
        );
        return;
      }

      // Print receipt
      await PrinterService.print(receipt);

      // Mark as success
      await PrintJobsRepository.markSuccess(job.id);
      console.log(`[FISCAL QUEUE] ✅ Job ${job.id} completed successfully`);

    } catch (err) {
      const job = await PrintJobsRepository.getNextPendingJob(); // Re-fetch to get current attempts
      if (job) {
        const attempts = job.attempts || 0;
        const delay = BASE_DELAY_SECONDS * Math.pow(2, attempts); // Exponential backoff: 30s, 60s, 120s, 240s, 480s

        console.error(`[FISCAL QUEUE] ❌ Print failed for job ${job.id} (attempt ${attempts + 1}/${MAX_ATTEMPTS}):`, err.message);

        await PrintJobsRepository.markFailed(
          job.id,
          err.message || String(err),
          delay,
          MAX_ATTEMPTS
        );
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get queue status
   */
  async getStatus() {
    const pending = await PrintJobsRepository.listJobs({ status: 'PENDING', limit: 1 });
    const processing = await PrintJobsRepository.listJobs({ status: 'PROCESSING', limit: 1 });
    const failed = await PrintJobsRepository.listJobs({ status: 'FAILED', limit: 1 });

    return {
      running: this.running,
      isProcessing: this.isProcessing,
      pendingCount: pending.length,
      processingCount: processing.length,
      failedCount: failed.length
    };
  }
}

module.exports = new PrintQueueService();

