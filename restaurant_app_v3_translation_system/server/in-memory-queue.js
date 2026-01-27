// in-memory-queue.js
// Queue în memorie pentru serializarea operațiunilor de stoc
// Alternativă la Redis Queue pentru white-label deployment

const fs = require('fs');
const path = require('path');

class InMemoryQueue {
  constructor(options = {}) {
    this.queue = [];
    this.processing = false;
    this.maxRetries = options.maxRetries || 3;
    this.processInterval = options.processInterval || 100; // ms între procesări
    this.persistPath = options.persistPath || path.join(__dirname, 'data', 'queue-backup.json');
    this.maxQueueSize = options.maxQueueSize || 1000;
    this.stats = {
      processed: 0,
      failed: 0,
      retried: 0,
      queued: 0
    };

    // Restaurează queue-ul din fișier la pornire (dacă există)
    this.restoreQueue();

    // Pornește worker-ul automat
    this.startWorker();

    // Salvează queue-ul la oprire
    this.setupGracefulShutdown();

    console.log('✅ In-Memory Queue inițializat cu succes');
    console.log(`   → Max queue size: ${this.maxQueueSize}`);
    console.log(`   → Max retries: ${this.maxRetries}`);
    console.log(`   → Process interval: ${this.processInterval}ms`);
    console.log(`   → Persistence: ${this.persistPath}`);
  }

  /**
   * Adaugă un job în coadă
   * @param {Object} data - Datele job-ului (orderId, finalItems, orderType)
   * @param {Object} options - Opțiuni (priority, jobId)
   * @returns {Promise<void>}
   */
  async add(data, options = {}) {
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error(`Queue is full (max: ${this.maxQueueSize}). Cannot add more jobs.`);
    }

    const job = {
      id: options.jobId || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: data,
      priority: options.priority || 5,
      retries: 0,
      addedAt: Date.now(),
      status: 'waiting'
    };

    // Inserează bazat pe prioritate (priority 1 = highest)
    const insertIndex = this.queue.findIndex(j => j.priority > job.priority);
    if (insertIndex === -1) {
      this.queue.push(job);
    } else {
      this.queue.splice(insertIndex, 0, job);
    }

    this.stats.queued++;
    console.log(`📥 [Queue] Job adăugat: ${job.id} | Queue size: ${this.queue.length} | Priority: ${job.priority}`);
    
    return Promise.resolve();
  }

  /**
   * Worker care procesează job-urile din coadă
   */
  startWorker() {
    this.workerInterval = setInterval(async () => {
      if (this.processing || this.queue.length === 0) {
        return;
      }

      this.processing = true;
      const job = this.queue[0]; // Ia primul job (cel mai prioritar)

      try {
        console.log(`🔄 [Queue Worker] Procesare job: ${job.id} | Retries: ${job.retries}/${this.maxRetries}`);
        
        // Procesează job-ul (apelează funcția de procesare externă)
        if (this.processor) {
          await this.processor(job);
          
          // Succes - elimină din coadă
          this.queue.shift();
          this.stats.processed++;
          console.log(`✅ [Queue Worker] Job finalizat: ${job.id} | Remaining: ${this.queue.length}`);
        } else {
          console.error('❌ [Queue Worker] Nu există processor definit!');
          this.queue.shift(); // Elimină job-ul pentru a nu bloca coada
        }

      } catch (error) {
        job.retries++;
        this.stats.retried++;

        if (job.retries >= this.maxRetries) {
          // Max retries atins - mută în failed queue
          console.error(`❌ [Queue Worker] Job eșuat permanent: ${job.id} după ${job.retries} încercări`);
          console.error(`   Eroare: ${error.message}`);
          
          this.queue.shift(); // Elimină din coadă
          this.stats.failed++;
          
          // Salvează job-ul eșuat în fișier pentru analiză
          this.saveFailedJob(job, error);
        } else {
          // Reîncearcă - mută la sfârșitul cozii pentru a nu bloca alte job-uri
          console.warn(`⚠️ [Queue Worker] Job eșuat, reîncearcă: ${job.id} (tentativa ${job.retries}/${this.maxRetries})`);
          this.queue.shift();
          this.queue.push(job);
        }
      } finally {
        this.processing = false;
      }
    }, this.processInterval);

    console.log('🚀 Queue Worker pornit');
  }

  /**
   * Oprește worker-ul
   */
  stopWorker() {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      console.log('⏹️ Queue Worker oprit');
    }
  }

  /**
   * Setează funcția de procesare pentru job-uri
   * @param {Function} processorFn - Funcția care procesează un job
   */
  process(processorFn) {
    this.processor = processorFn;
  }

  /**
   * Salvează coada în fișier (pentru persistență la restart)
   */
  async saveQueue() {
    try {
      const dataDir = path.dirname(this.persistPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const queueData = {
        savedAt: new Date().toISOString(),
        stats: this.stats,
        jobs: this.queue.map(job => ({
          ...job,
          status: 'pending' // Resetează status la restore
        }))
      };

      fs.writeFileSync(this.persistPath, JSON.stringify(queueData, null, 2));
      console.log(`💾 Queue salvat: ${this.queue.length} job-uri → ${this.persistPath}`);
    } catch (error) {
      console.error(`❌ Eroare salvare queue: ${error.message}`);
    }
  }

  /**
   * Restaurează coada din fișier (la pornire)
   */
  restoreQueue() {
    try {
      if (fs.existsSync(this.persistPath)) {
        const queueData = JSON.parse(fs.readFileSync(this.persistPath, 'utf8'));
        this.queue = queueData.jobs || [];
        console.log(`📂 Queue restaurat: ${this.queue.length} job-uri din ${queueData.savedAt}`);
        
        // Șterge fișierul după restaurare
        fs.unlinkSync(this.persistPath);
      }
    } catch (error) {
      console.error(`⚠️ Eroare restaurare queue: ${error.message}`);
    }
  }

  /**
   * Salvează job-ul eșuat pentru debugging
   */
  saveFailedJob(job, error) {
    try {
      const failedDir = path.join(__dirname, 'data', 'failed-jobs');
      if (!fs.existsSync(failedDir)) {
        fs.mkdirSync(failedDir, { recursive: true });
      }

      const failedJobPath = path.join(failedDir, `${job.id}.json`);
      const failedJobData = {
        job: job,
        error: {
          message: error.message,
          stack: error.stack
        },
        failedAt: new Date().toISOString()
      };

      fs.writeFileSync(failedJobPath, JSON.stringify(failedJobData, null, 2));
      console.log(`💾 Job eșuat salvat pentru analiză: ${failedJobPath}`);
    } catch (err) {
      console.error(`❌ Eroare salvare failed job: ${err.message}`);
    }
  }

  /**
   * Setup pentru salvare automată la shutdown
   */
  setupGracefulShutdown() {
    const shutdown = async () => {
      console.log('\n🛑 Shutdown detectat - salvare queue...');
      this.stopWorker();
      await this.saveQueue();
      console.log('✅ Queue salvat. Shutdown complet.');
      process.exit(0);
    };

    // Temporarily disable shutdown signals for testing
    // process.on('SIGINT', shutdown);
    // process.on('SIGTERM', shutdown);

    process.on('exit', () => {
      // Salvare sincronă la exit
      if (this.queue.length > 0) {
        this.saveQueue();
      }
    });
  }

  /**
   * Returnează statistici despre coadă
   */
  getStats() {
    return {
      ...this.stats,
      currentQueueSize: this.queue.length,
      processing: this.processing
    };
  }

  /**
   * Golește coada (folosit pentru testing)
   */
  clear() {
    this.queue = [];
    console.log('🗑️ Queue golit');
  }
}

module.exports = InMemoryQueue;

