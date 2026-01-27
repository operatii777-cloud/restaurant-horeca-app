/**
 * FAZA 1.6 - Fiscal Print Queue Service
 * 
 * Manages print queue for fiscal receipts with retry logic
 */

const { dbPromise } = require('../../../../database');

class FiscalPrintQueueService {
  constructor() {
    this.running = false;
    this.loopHandle = null;
    this.MAX_ATTEMPTS = 5; // FAZA 1.6 - Increased to 5 retries
    this.BASE_DELAY_MS = 30000; // 30 seconds
  }

  /**
   * FAZA 1.6 - Enqueue fiscal receipt for printing
   */
  async enqueue(orderId, receiptData, priority = 'normal') {
    const db = await dbPromise;
    const now = new Date().toISOString();
    const scheduledAt = priority === 'high' ? now : new Date(Date.now() + 5000).toISOString();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO fiscal_print_queue 
         (order_id, receipt_data, priority, status, attempts, created_at, scheduled_at)
         VALUES (?, ?, ?, 'PENDING', 0, ?, ?)`,
        [orderId, JSON.stringify(receiptData), priority, now, scheduledAt],
        function(err) {
          if (err) reject(err);
          else {
            resolve({
              id: this.lastID,
              orderId,
              status: 'PENDING',
              attempts: 0,
              createdAt: now,
              scheduledAt
            });
          }
        }
      );
    });
  }

  /**
   * FAZA 1.6 - Start print queue processor
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.loopHandle = setInterval(() => this.processNextJob(), 10000); // Process every 10 seconds
    console.log('[FISCAL PRINT QUEUE] Started fiscal print queue processor');
  }

  /**
   * FAZA 1.6 - Stop print queue processor
   */
  stop() {
    this.running = false;
    if (this.loopHandle) {
      clearInterval(this.loopHandle);
      this.loopHandle = null;
    }
    console.log('[FISCAL PRINT QUEUE] Stopped fiscal print queue processor');
  }

  /**
   * FAZA 1.6 - Process next print job
   */
  async processNextJob() {
    if (!this.running) return;

    const db = await dbPromise;
    
    // Get next pending job
    const job = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM fiscal_print_queue 
         WHERE status = 'PENDING' 
           AND scheduled_at <= datetime('now', 'localtime')
         ORDER BY 
           CASE priority WHEN 'high' THEN 0 ELSE 1 END,
           scheduled_at ASC
         LIMIT 1`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });

    if (!job) return;

    // Mark as processing
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE fiscal_print_queue SET status = 'PROCESSING', updated_at = datetime('now', 'localtime') WHERE id = ?`,
        [job.id],
        (err) => err ? reject(err) : resolve()
      );
    });

    try {
      // Attempt to print
      const FiscalPrinterDriver = require('../drivers/fiscalPrinterDriver');
      const receiptData = typeof job.receipt_data === 'string' 
        ? JSON.parse(job.receipt_data) 
        : job.receipt_data;

      await FiscalPrinterDriver.printReceipt(job.order_id, receiptData);

      // Mark as success
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE fiscal_print_queue SET status = 'SUCCESS', updated_at = datetime('now', 'localtime') WHERE id = ?`,
          [job.id],
          (err) => err ? reject(err) : resolve()
        );
      });

      // Update order
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE orders SET fiscal_receipt_printed = 1, fiscal_receipt_printed_at = datetime('now', 'localtime') WHERE id = ?`,
          [job.order_id],
          (err) => err ? reject(err) : resolve()
        );
      });

      console.log(`[FISCAL PRINT QUEUE] ✅ Job ${job.id} printed successfully`);
    } catch (error) {
      const attempts = job.attempts + 1;
      const delay = this.BASE_DELAY_MS * Math.pow(2, attempts); // Exponential backoff

      if (attempts >= this.MAX_ATTEMPTS) {
        // Mark as failed
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE fiscal_print_queue 
             SET status = 'FAILED', 
                 attempts = ?, 
                 last_error = ?,
                 updated_at = datetime('now', 'localtime')
             WHERE id = ?`,
            [attempts, error.message?.slice(0, 1000) || String(error), job.id],
            (err) => err ? reject(err) : resolve()
          );
        });
        console.error(`[FISCAL PRINT QUEUE] ❌ Job ${job.id} failed after ${attempts} attempts`);
      } else {
        // Retry with delay
        const scheduledAt = new Date(Date.now() + delay).toISOString();
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE fiscal_print_queue 
             SET status = 'PENDING',
                 attempts = ?,
                 last_error = ?,
                 scheduled_at = ?,
                 updated_at = datetime('now', 'localtime')
             WHERE id = ?`,
            [attempts, error.message?.slice(0, 1000) || String(error), scheduledAt, job.id],
            (err) => err ? reject(err) : resolve()
          );
        });
        console.warn(`[FISCAL PRINT QUEUE] ⚠️ Job ${job.id} failed (attempt ${attempts}/${this.MAX_ATTEMPTS}), retrying in ${delay}ms`);
      }
    }
  }

  /**
   * FAZA 1.6 - Get queue stats
   */
  async getStats() {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'PROCESSING' THEN 1 ELSE 0 END) as processing,
          SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
        FROM fiscal_print_queue`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
}

module.exports = new FiscalPrintQueueService();

