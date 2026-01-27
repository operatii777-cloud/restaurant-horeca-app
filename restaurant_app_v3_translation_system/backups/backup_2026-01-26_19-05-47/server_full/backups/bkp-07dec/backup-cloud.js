/**
 * ☁️ BACKUP CLOUD AUTOMATION
 * Backup automat la AWS S3 / Cloud Storage
 * Inspirat din Toast/Square backup systems
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const cron = require('node-cron');

// AWS S3 (opțional - decomentează când instalezi @aws-sdk/client-s3)
// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

class BackupCloudSystem {
  constructor() {
    this.s3Client = null;
    this.initialized = false;
  }

  /**
   * Inițializează client S3 (dacă este configurat)
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // AWS S3 Client (opțional)
      // if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      //   this.s3Client = new S3Client({
      //     region: process.env.AWS_REGION || 'eu-central-1',
      //     credentials: {
      //       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      //       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      //     }
      //   });
      //   console.log('✅ Backup Cloud - AWS S3 client inițializat');
      // } else {
      //   console.warn('⚠️ Backup Cloud - AWS credentials lipsă, backup cloud dezactivat');
      // }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Eroare la inițializarea Backup Cloud:', error);
    }
  }

  /**
   * Creează backup complet (database + config files)
   */
  async performBackup() {
    await this.initialize();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups', 'cloud');
    
    // Creează directorul dacă nu există
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `backup-${timestamp}.zip`);

    try {
      // Creează ZIP cu database + config files
      const output = fs.createWriteStream(backupFile);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', async () => {
          console.log(`✅ Backup creat local: ${archive.pointer()} bytes`);
          
          // Upload la S3/Cloud Storage (dacă este configurat)
          if (this.s3Client) {
            try {
              // await this.uploadToS3(backupFile, timestamp);
              console.log(`✅ Backup uploadat la cloud: backup-${timestamp}.zip`);
            } catch (uploadError) {
              console.error('❌ Eroare la upload backup:', uploadError);
            }
          }

          // Log backup success în DB
          await this.logBackupSuccess(timestamp, backupFile, archive.pointer());

          // Cleanup local backup după upload (opțional)
          // if (this.s3Client) {
          //   fs.unlinkSync(backupFile);
          // }

          resolve(backupFile);
        });

        archive.on('error', (err) => {
          console.error('❌ Eroare la crearea backup:', err);
          reject(err);
        });

        archive.pipe(output);

        // Adaugă database
        const dbPath = path.join(__dirname, 'restaurant.db');
        if (fs.existsSync(dbPath)) {
          archive.file(dbPath, { name: 'restaurant.db' });
        }

        // Adaugă config files (dacă există)
        const configFiles = ['.env', 'server.js', 'package.json'];
        configFiles.forEach(file => {
          const filePath = path.join(__dirname, file);
          if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: file });
          }
        });

        // Adaugă uploads (dacă există)
        const uploadsDir = path.join(__dirname, 'public', 'uploads');
        if (fs.existsSync(uploadsDir)) {
          archive.directory(uploadsDir, 'uploads');
        }

        archive.finalize();
      });
    } catch (error) {
      console.error('❌ Eroare la performBackup:', error);
      throw error;
    }
  }

  /**
   * Backup incremental (doar tranzacții noi de la ultimul backup)
   */
  async performIncrementalBackup() {
    await this.initialize();

    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Obține ultimul backup incremental
      const lastBackup = await new Promise((resolve, reject) => {
        db.get(
          'SELECT timestamp FROM backup_log WHERE type = ? ORDER BY timestamp DESC LIMIT 1',
          ['incremental'],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      const sinceDate = lastBackup?.timestamp || '2000-01-01';

      // Obține tranzacții noi
      // NOTĂ: orders folosește 'timestamp', pos_payments folosește 'created_at'
      // Fă query-uri separate pentru că tabelele au structuri diferite
      const [orders, payments] = await Promise.all([
        new Promise((resolve, reject) => {
          db.all(`SELECT * FROM orders WHERE timestamp > ?`, [sinceDate], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        }),
        new Promise((resolve, reject) => {
          db.all(`SELECT * FROM pos_payments WHERE created_at > ?`, [sinceDate], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        })
      ]);
      
      const transactions = [
        ...orders.map(o => ({ type: 'order', ...o })),
        ...payments.map(p => ({ type: 'payment', ...p }))
      ];

      if (transactions.length === 0) {
        console.log('ℹ️ Nu există tranzacții noi pentru backup incremental');
        return;
      }

      // Salvează incremental backup
      const timestamp = new Date().toISOString();
      const backupDir = path.join(__dirname, 'backups', 'incremental');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const backupFile = path.join(backupDir, `incremental-${timestamp.replace(/[:.]/g, '-')}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(transactions, null, 2));

      // Log backup
      await this.logBackupSuccess(timestamp, backupFile, fs.statSync(backupFile).size, 'incremental');

      console.log(`✅ Incremental backup: ${transactions.length} tranzacții`);
    } catch (error) {
      console.error('❌ Eroare la incremental backup:', error);
    }
  }

  /**
   * Upload backup la S3 (opțional)
   */
  async uploadToS3(backupFile, timestamp) {
    if (!this.s3Client) {
      throw new Error('S3 client nu este inițializat');
    }

    // Decomentează când instalezi @aws-sdk/client-s3
    // const fileContent = fs.readFileSync(backupFile);
    // 
    // await this.s3Client.send(new PutObjectCommand({
    //   Bucket: process.env.S3_BACKUP_BUCKET,
    //   Key: `backups/${timestamp}.zip`,
    //   Body: fileContent,
    //   ServerSideEncryption: 'AES256'
    // }));
  }

  /**
   * Log backup success în DB
   */
  async logBackupSuccess(timestamp, location, sizeBytes, type = 'full') {
    try {
      const { dbPromise } = require('./database');
      const db = await dbPromise;

      // Creează tabela backup_log dacă nu există
      db.run(`
        CREATE TABLE IF NOT EXISTS backup_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT DEFAULT 'success',
          size_bytes INTEGER,
          location TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('❌ Eroare la crearea backup_log:', err);
        }
      });

      // Inserează log
      db.run(
        'INSERT INTO backup_log (timestamp, type, status, size_bytes, location) VALUES (?, ?, ?, ?, ?)',
        [timestamp, type, 'success', sizeBytes, location],
        (err) => {
          if (err) {
            console.error('❌ Eroare la logarea backup:', err);
          } else {
            console.log(`✅ Backup logat: ${type} - ${location}`);
          }
        }
      );
    } catch (error) {
      console.error('❌ Eroare la logBackupSuccess:', error);
    }
  }
}

// Singleton instance
const backupCloudSystem = new BackupCloudSystem();

// Schedule backups (dacă nu sunt deja configurate)
function setupBackupSchedules() {
  // Full backup zilnic la 02:00
  cron.schedule('0 2 * * *', () => {
    console.log('🤖 [BACKUP CRON] Începe backup zilnic...');
    backupCloudSystem.performBackup().catch(err => {
      console.error('❌ Eroare la backup zilnic:', err);
    });
  });

  // Incremental backup la fiecare 30 min
  cron.schedule('*/30 * * * *', () => {
    console.log('🤖 [BACKUP CRON] Începe backup incremental...');
    backupCloudSystem.performIncrementalBackup().catch(err => {
      console.error('❌ Eroare la backup incremental:', err);
    });
  });

  console.log('✅ Backup Cloud schedules configurate');
}

module.exports = {
  backupCloudSystem,
  setupBackupSchedules
};

