/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTOMATED BACKUP SERVICE
 * 
 * Backup automat programat:
 * - Backup zilnic automat (la 2:00 AM)
 * - Retenție backup (ultimele 7 zilnice + 4 săptămânale + 12 lunare)
 * - Verificare integritate backup-uri
 * - Notificare dacă backup-ul eșuează
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

class AutomatedBackupService {
  constructor() {
    this.backupBaseDir = path.join(__dirname, '../../../../..'); // Go to restaurant_app root
    this.backupTargetDir = path.join(this.backupBaseDir, 'backups-automated');
    this.maxDailyBackups = 7;
    this.maxWeeklyBackups = 4;
    this.maxMonthlyBackups = 12;
  }

  /**
   * Ensure backup directory exists
   */
  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupTargetDir)) {
      fs.mkdirSync(this.backupTargetDir, { recursive: true });
    }
  }

  /**
   * Create backup
   */
  async createBackup(type = 'daily') {
    try {
      this.ensureBackupDirectory();
      
      const timestamp = new Date();
      const dateStr = timestamp.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '');
      const backupName = `bkp-${type}-${dateStr}-${timeStr}`;
      const backupPath = path.join(this.backupTargetDir, backupName);
      
      console.log(`🔄 [AUTOMATED BACKUP] Creating ${type} backup: ${backupName}`);
      
      // Exclude directories
      const excludeDirs = [
        'node_modules',
        '.git',
        'backups-automated',
        'bkp-*',
        '*.log',
        'hs_err_pid*.log',
        'replay_pid*.log'
      ];
      
      // Build robocopy command (Windows)
      const sourceDir = this.backupBaseDir;
      const excludeArgs = excludeDirs.map(dir => `/XD ${dir}`).join(' ');
      
      // Use PowerShell for cross-platform compatibility
      const psScript = `
        $source = "${sourceDir.replace(/\\/g, '/')}"
        $dest = "${backupPath.replace(/\\/g, '/')}"
        $exclude = @('node_modules', '.git', 'backups-automated', '*.log')
        
        if (Test-Path $dest) {
          Remove-Item -Recurse -Force $dest
        }
        
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        
        Get-ChildItem -Path $source -Directory | Where-Object {
          $exclude -notcontains $_.Name -and $_.Name -notlike 'bkp-*'
        } | ForEach-Object {
          Copy-Item -Path $_.FullName -Destination (Join-Path $dest $_.Name) -Recurse -Force
        }
        
        Get-ChildItem -Path $source -File | Where-Object {
          $exclude -notcontains $_.Name -and $_.Name -notlike '*.log'
        } | ForEach-Object {
          Copy-Item -Path $_.FullName -Destination $dest -Force
        }
      `;
      
      // Execute PowerShell script
      const { stdout, stderr } = await execAsync(
        `powershell -ExecutionPolicy Bypass -Command "${psScript.replace(/"/g, '\\"')}"`
      );
      
      if (stderr && !stderr.includes('Information')) {
        throw new Error(stderr);
      }
      
      // Verify backup integrity
      const integrityCheck = await this.verifyBackupIntegrity(backupPath);
      
      if (!integrityCheck.valid) {
        throw new Error(`Backup integrity check failed: ${integrityCheck.error}`);
      }
      
      // Calculate backup size
      const backupSize = await this.getDirectorySize(backupPath);
      
      console.log(`✅ [AUTOMATED BACKUP] Backup created successfully: ${backupName} (${(backupSize / 1024 / 1024).toFixed(2)} MB)`);
      
      // Clean old backups
      await this.cleanOldBackups(type);
      
      // Emit alert if global.io is available
      if (global.io) {
        const AlertsService = require('../alerts/alerts.service');
        AlertsService.emitAlert({
          type: 'BACKUP_COMPLETED',
          severity: 'info',
          message: `Backup ${type} creat cu succes: ${backupName}`,
          data: {
            backup_name: backupName,
            backup_path: backupPath,
            backup_size_mb: (backupSize / 1024 / 1024).toFixed(2),
            type: type
          },
          timestamp: new Date().toISOString()
        });
      }
      
      return {
        success: true,
        backup_name: backupName,
        backup_path: backupPath,
        backup_size_mb: (backupSize / 1024 / 1024).toFixed(2),
        type: type
      };
    } catch (error) {
      console.error(`❌ [AUTOMATED BACKUP] Error creating backup:`, error);
      
      // Emit alert for backup failure
      if (global.io) {
        const AlertsService = require('../alerts/alerts.service');
        AlertsService.emitAlert({
          type: 'BACKUP_FAILED',
          severity: 'error',
          message: `Backup ${type} eșuat: ${error.message}`,
          data: {
            type: type,
            error: error.message
          },
          timestamp: new Date().toISOString()
        });
      }
      
      throw error;
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackupIntegrity(backupPath) {
    try {
      // Check if backup directory exists
      if (!fs.existsSync(backupPath)) {
        return { valid: false, error: 'Backup directory does not exist' };
      }
      
      // Check if backup is not empty
      const files = fs.readdirSync(backupPath);
      if (files.length === 0) {
        return { valid: false, error: 'Backup directory is empty' };
      }
      
      // Check for critical files/directories
      const criticalItems = ['server', 'package.json'];
      const missingItems = criticalItems.filter(item => {
        const itemPath = path.join(backupPath, item);
        return !fs.existsSync(itemPath);
      });
      
      if (missingItems.length > 0) {
        return { valid: false, error: `Missing critical items: ${missingItems.join(', ')}` };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get directory size
   */
  async getDirectorySize(dirPath) {
    let totalSize = 0;
    
    const getSize = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          getSize(filePath);
        } else {
          totalSize += stats.size;
        }
      });
    };
    
    getSize(dirPath);
    return totalSize;
  }

  /**
   * Clean old backups based on retention policy
   */
  async cleanOldBackups(type) {
    try {
      if (!fs.existsSync(this.backupTargetDir)) {
        return;
      }
      
      const backups = fs.readdirSync(this.backupTargetDir)
        .filter(item => {
          const itemPath = path.join(this.backupTargetDir, item);
          return fs.statSync(itemPath).isDirectory() && item.startsWith(`bkp-${type}-`);
        })
        .map(item => {
          const itemPath = path.join(this.backupTargetDir, item);
          const stats = fs.statSync(itemPath);
          return {
            name: item,
            path: itemPath,
            mtime: stats.mtime
          };
        })
        .sort((a, b) => b.mtime - a.mtime); // Most recent first
      
      let maxBackups;
      if (type === 'daily') {
        maxBackups = this.maxDailyBackups;
      } else if (type === 'weekly') {
        maxBackups = this.maxWeeklyBackups;
      } else if (type === 'monthly') {
        maxBackups = this.maxMonthlyBackups;
      } else {
        maxBackups = 7; // Default
      }
      
      // Delete backups beyond retention limit
      const backupsToDelete = backups.slice(maxBackups);
      for (const backup of backupsToDelete) {
        try {
          fs.rmSync(backup.path, { recursive: true, force: true });
          console.log(`🗑️  [AUTOMATED BACKUP] Deleted old backup: ${backup.name}`);
        } catch (error) {
          console.error(`❌ [AUTOMATED BACKUP] Error deleting backup ${backup.name}:`, error);
        }
      }
      
      if (backupsToDelete.length > 0) {
        console.log(`✅ [AUTOMATED BACKUP] Cleaned ${backupsToDelete.length} old ${type} backups`);
      }
    } catch (error) {
      console.error(`❌ [AUTOMATED BACKUP] Error cleaning old backups:`, error);
    }
  }

  /**
   * Schedule backups (should be called by cron/scheduler)
   */
  async scheduleBackups() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const date = now.getDate();
    
    try {
      // Daily backup at 2:00 AM
      if (hour === 2 && now.getMinutes() < 5) {
        await this.createBackup('daily');
      }
      
      // Weekly backup on Sunday at 2:00 AM
      if (day === 0 && hour === 2 && now.getMinutes() < 5) {
        await this.createBackup('weekly');
      }
      
      // Monthly backup on first day of month at 2:00 AM
      if (date === 1 && hour === 2 && now.getMinutes() < 5) {
        await this.createBackup('monthly');
      }
    } catch (error) {
      console.error('❌ [AUTOMATED BACKUP] Error in scheduled backups:', error);
    }
  }
}

module.exports = new AutomatedBackupService();
