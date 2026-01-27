/**
 * PHASE S8.7 - ANAF Queue Service
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Queue system for ANAF submissions: white queue (priority), black queue (retries), dead-letter queue
 */

const AnafSubmitService = require('../anafSubmit.service');
const { dbPromise } = require('../../../../database');

interface QueueJob {
  id: number;
  documentType: string;
  documentId: number;
  xml: string;
  priority: 'high' | 'normal';
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'DEAD_LETTER';
  attempts: number;
  lastError: string | null;
  createdAt: string;
  scheduledAt: string;
}

class AnafQueueService {
  private running: boolean = false;
  private loopHandle: NodeJS.Timeout | null = null;
  private readonly MAX_ATTEMPTS = 5; // FAZA 1.3 - Increased to 5 retries
  private readonly BASE_DELAY_MS = 60000; // 1 minute

  /**
   * PHASE S8.7 - Enqueue document for ANAF submission
   */
  async enqueue(job: { documentType: string, documentId: number, xml: string, priority: 'high' | 'normal' }) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    const scheduledAt = job.priority === 'high' ? now : new Date(Date.now() + 5000).toISOString(); // High priority: immediate, Normal: 5s delay

    return new Promise<QueueJob>((resolve, reject) => {
      db.run(
        `INSERT INTO anaf_queue 
         (document_type, document_id, xml, priority, status, attempts, created_at, scheduled_at)
         VALUES (?, ?, ?, ?, 'PENDING', 0, ?, ?)`,
        [job.documentType, job.documentId, job.xml, job.priority, now, scheduledAt],
        function(err) {
          if (err) reject(err);
          else {
            resolve({
              id: this.lastID,
              documentType: job.documentType,
              documentId: job.documentId,
              xml: job.xml,
              priority: job.priority,
              status: 'PENDING',
              attempts: 0,
              lastError: null,
              createdAt: now,
              scheduledAt
            });
          }
        }
      );
    });
  }

  /**
   * PHASE S8.7 - Start queue processor
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.loopHandle = setInterval(() => this.processNextJob(), 5000); // Process every 5 seconds
    console.log('[ANAF QUEUE] Started ANAF submission queue processor');
  }

  /**
   * PHASE S8.7 - Stop queue processor
   */
  stop() {
    this.running = false;
    if (this.loopHandle) {
      clearInterval(this.loopHandle);
      this.loopHandle = null;
    }
    console.log('[ANAF QUEUE] Stopped ANAF submission queue processor');
  }

  /**
   * PHASE S8.7 - Process next job from queue
   */
  async processNextJob() {
    if (!this.running) return;

    const db = await dbPromise;
    
    // Get next pending job (priority: high first, then by scheduled_at)
    const job = await new Promise<QueueJob | null>((resolve, reject) => {
      db.get(
        `SELECT * FROM anaf_queue 
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
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE anaf_queue SET status = 'PROCESSING', updated_at = datetime('now', 'localtime') WHERE id = ?`,
        [job.id],
        (err) => err ? reject(err) : resolve()
      );
    });

    try {
      // Submit to ANAF
      await AnafSubmitService.submitToANAF(job.documentType, job.documentId, job.xml);

      // Mark as success
      await new Promise<void>((resolve, reject) => {
        db.run(
          `UPDATE anaf_queue SET status = 'SUCCESS', updated_at = datetime('now', 'localtime') WHERE id = ?`,
          [job.id],
          (err) => err ? reject(err) : resolve()
        );
      });

      console.log(`[ANAF QUEUE] ✅ Job ${job.id} submitted successfully`);
    } catch (error: any) {
      const attempts = job.attempts + 1;
      const delay = this.BASE_DELAY_MS * Math.pow(2, attempts); // Exponential backoff

      if (attempts >= this.MAX_ATTEMPTS) {
        // Move to dead-letter queue
        await new Promise<void>((resolve, reject) => {
          db.run(
            `UPDATE anaf_queue 
             SET status = 'DEAD_LETTER', 
                 attempts = ?, 
                 last_error = ?,
                 updated_at = datetime('now', 'localtime')
             WHERE id = ?`,
            [attempts, error.message?.slice(0, 1000) || String(error), job.id],
            (err) => err ? reject(err) : resolve()
          );
        });
        console.error(`[ANAF QUEUE] ❌ Job ${job.id} moved to dead-letter queue after ${attempts} attempts`);
      } else {
        // Retry with delay
        const scheduledAt = new Date(Date.now() + delay).toISOString();
        await new Promise<void>((resolve, reject) => {
          db.run(
            `UPDATE anaf_queue 
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
        console.warn(`[ANAF QUEUE] ⚠️ Job ${job.id} failed (attempt ${attempts}/${this.MAX_ATTEMPTS}), retrying in ${delay}ms`);
      }
    }
  }
}

module.exports = new AnafQueueService();


