/**
 * Admin Backup Controller
 * 
 * Endpoint-uri pentru backup și restore baza de date
 */

const { dbPromise } = require('../../../../database');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * POST /api/admin/backup-database
 * Creează backup complet al bazei de date
 */
async function backupDatabase(req, res, next) {
  try {
    const { mode = 'full' } = req.body; // 'full' sau 'incremental'
    const dbPath = path.join(__dirname, '../../../../restaurant.db');
    const backupDir = path.join(__dirname, '../../../../backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupFileName = `backup-${timestamp}-${Date.now()}.db`;
    const backupPath = path.join(backupDir, backupFileName);

    // Creează directorul backups dacă nu există
    await fs.mkdir(backupDir, { recursive: true });

    // Copiază fișierul bazei de date
    await fs.copyFile(dbPath, backupPath);

    // Obține dimensiunea fișierului
    const stats = await fs.stat(backupPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    res.json({
      success: true,
      message: 'Backup creat cu succes',
      backup: {
        fileName: backupFileName,
        path: backupPath,
        size: `${sizeMB} MB`,
        mode,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Eroare la crearea backup-ului:', error);
    next(error);
  }
}

/**
 * POST /api/admin/restore-database
 * Restaurează baza de date dintr-un backup
 */
async function restoreDatabase(req, res, next) {
  try {
    const { backupFileName } = req.body;
    
    if (!backupFileName) {
      return res.status(400).json({
        success: false,
        error: 'backupFileName este obligatoriu'
      });
    }

    const backupDir = path.join(__dirname, '../../../../backups');
    const backupPath = path.join(backupDir, backupFileName);
    const dbPath = path.join(__dirname, '../../../../restaurant.db');

    // Verifică dacă backup-ul există
    try {
      await fs.access(backupPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Backup-ul nu există'
      });
    }

    // Creează backup al bazei de date actuale înainte de restore
    const currentBackupPath = `${dbPath}.before-restore-${Date.now()}`;
    await fs.copyFile(dbPath, currentBackupPath);

    // Restaurează backup-ul
    await fs.copyFile(backupPath, dbPath);

    res.json({
      success: true,
      message: 'Baza de date restaurată cu succes',
      restoredFrom: backupFileName,
      currentBackup: path.basename(currentBackupPath)
    });
  } catch (error) {
    console.error('❌ Eroare la restaurarea bazei de date:', error);
    next(error);
  }
}

module.exports = {
  backupDatabase,
  restoreDatabase
};

