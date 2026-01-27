/**
 * PHASE S7.3 - Print Jobs Repository
 * 
 * Repository for managing fiscal print queue jobs.
 */

const { dbPromise } = require('../../../../database');

class PrintJobsRepository {
  /**
   * Create a new print job
   */
  async createPrintJob(receiptId, scheduledAt = null) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO fiscal_print_jobs
          (receipt_id, status, attempts, created_at, updated_at, scheduled_at)
         VALUES (?, 'PENDING', 0, ?, ?, ?)`,
        [receiptId, now, now, scheduledAt || now],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              receiptId,
              status: 'PENDING'
            });
          }
        }
      );
    });
  }

  /**
   * Get next pending job ready to process
   */
  async getNextPendingJob() {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM fiscal_print_jobs
         WHERE status = 'PENDING'
           AND scheduled_at <= datetime('now', 'localtime')
         ORDER BY created_at ASC
         LIMIT 1`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Mark job as processing
   */
  async markProcessing(jobId) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE fiscal_print_jobs
         SET status = 'PROCESSING', updated_at = ?
         WHERE id = ?`,
        [now, jobId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: jobId, status: 'PROCESSING' });
          }
        }
      );
    });
  }

  /**
   * Mark job as successful
   */
  async markSuccess(jobId) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE fiscal_print_jobs
         SET status = 'SUCCESS', updated_at = ?, last_error = NULL
         WHERE id = ?`,
        [now, jobId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: jobId, status: 'SUCCESS' });
          }
        }
      );
    });
  }

  /**
   * Mark job as failed (with retry logic)
   */
  async markFailed(jobId, errorMessage, nextDelaySeconds, maxAttempts) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      // Get current attempts
      db.get(
        `SELECT attempts FROM fiscal_print_jobs WHERE id = ?`,
        [jobId],
        async (err, job) => {
          if (err) {
            reject(err);
            return;
          }

          const attempts = (job?.attempts || 0) + 1;

          if (attempts >= maxAttempts) {
            // Mark as permanently failed
            db.run(
              `UPDATE fiscal_print_jobs
               SET status = 'FAILED',
                   attempts = ?,
                   last_error = ?,
                   updated_at = ?
               WHERE id = ?`,
              [
                attempts,
                errorMessage?.toString().slice(0, 2000) || null,
                now,
                jobId
              ],
              function(updateErr) {
                if (updateErr) {
                  reject(updateErr);
                } else {
                  resolve({ id: jobId, status: 'FAILED', attempts });
                }
              }
            );
          } else {
            // Reschedule for retry
            const scheduledAt = new Date(Date.now() + nextDelaySeconds * 1000).toISOString();
            db.run(
              `UPDATE fiscal_print_jobs
               SET status = 'PENDING',
                   attempts = ?,
                   last_error = ?,
                   updated_at = ?,
                   scheduled_at = ?
               WHERE id = ?`,
              [
                attempts,
                errorMessage?.toString().slice(0, 2000) || null,
                now,
                scheduledAt,
                jobId
              ],
              function(updateErr) {
                if (updateErr) {
                  reject(updateErr);
                } else {
                  resolve({ id: jobId, status: 'PENDING', attempts, scheduledAt });
                }
              }
            );
          }
        }
      );
    });
  }

  /**
   * List jobs with filters
   */
  async listJobs({ status, limit = 100 } = {}) {
    const db = await dbPromise;
    const params = [];
    let where = '1=1';

    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }

    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM fiscal_print_jobs
         WHERE ${where}
         ORDER BY created_at DESC
         LIMIT ?`,
        [...params, limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  /**
   * Requeue a failed job
   */
  async requeueJob(jobId) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE fiscal_print_jobs
         SET status = 'PENDING',
             attempts = 0,
             last_error = NULL,
             updated_at = ?,
             scheduled_at = ?
         WHERE id = ?`,
        [now, now, jobId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: jobId, status: 'PENDING' });
          }
        }
      );
    });
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM fiscal_print_jobs WHERE id = ?`,
        [jobId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }
}

module.exports = new PrintJobsRepository();

