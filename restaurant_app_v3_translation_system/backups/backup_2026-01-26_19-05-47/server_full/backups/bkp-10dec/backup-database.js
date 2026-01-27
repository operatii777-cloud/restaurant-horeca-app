const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'restaurant.db');
const BACKUP_DIR = path.join(__dirname, 'backups');
const LOG_DIR = path.join(BACKUP_DIR, 'logs');
const DEFAULT_RETENTION = 2; // păstrăm implicit ultimele două backup-uri

function ensureDirectories() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

function getLogPath(fileName) {
    return path.join(LOG_DIR, `${fileName}.log`);
}

function formatBackupMeta(fileName) {
    const filePath = path.join(BACKUP_DIR, fileName);
    const stats = fs.statSync(filePath);
    const logFilePath = getLogPath(fileName);
    const logExists = fs.existsSync(logFilePath);

    return {
        fileName,
        sizeBytes: stats.size,
        createdAt: stats.mtime.toISOString(),
        jobId: fileName,
        status: 'success',
        createdBy: 'manual',
        durationMs: null,
        location: filePath,
        logAvailable: logExists,
        logFile: logExists ? `${fileName}.log` : null,
    };
}

// Funcție pentru backup-ul bazei de date
function backupDatabase(retention = DEFAULT_RETENTION) {
    ensureDirectories();

    if (!fs.existsSync(DB_PATH)) {
        console.log('❌ Baza de date restaurant.db nu există!');
        return false;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `restaurant_backup_${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, fileName);

    try {
        fs.copyFileSync(DB_PATH, backupPath);
        console.log(`✅ Backup creat cu succes: ${backupPath}`);

        const logContent = [
            '# Backup job',
            `File: ${fileName}`,
            `Created at: ${new Date().toISOString()}`,
            `Source: ${DB_PATH}`,
            `Size bytes: ${fs.statSync(backupPath).size}`,
        ].join('\n');
        fs.writeFileSync(getLogPath(fileName), `${logContent}\n`, { encoding: 'utf-8' });

        cleanupOldBackups(retention);
        return true;
    } catch (error) {
        console.error('❌ Eroare la crearea backup-ului:', error.message);
        return false;
    }
}

// Funcție pentru restaurarea bazei de date
function restoreDatabase(backupFileName) {
    ensureDirectories();
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    if (!fs.existsSync(backupPath)) {
        console.log('❌ Fișierul de backup nu există!');
        return false;
    }

    try {
        fs.copyFileSync(backupPath, DB_PATH);
        console.log(`✅ Baza de date restaurată cu succes din: ${backupFileName}`);
        fs.appendFileSync(
            getLogPath(backupFileName),
            `Restaurare la ${new Date().toISOString()} -> ${DB_PATH}\n`,
            { encoding: 'utf-8' }
        );
        return true;
    } catch (error) {
        console.error('❌ Eroare la restaurarea backup-ului:', error.message);
        return false;
    }
}

// Funcție pentru listarea backup-urilor disponibile (nume simple - compatibilitate veche)
function listBackups() {
    ensureDirectories();

    const files = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.db'))
        .sort((a, b) => {
            const statA = fs.statSync(path.join(BACKUP_DIR, a));
            const statB = fs.statSync(path.join(BACKUP_DIR, b));
            return statB.mtime - statA.mtime;
        });

    return files;
}

// Funcție pentru obținerea metadatelor backup-urilor
function getBackupDetails() {
    ensureDirectories();

    return fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.db'))
        .map(formatBackupMeta)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Funcție pentru ștergerea backup-urilor vechi (maxBackups)
function cleanupOldBackups(maxBackups = DEFAULT_RETENTION) {
    ensureDirectories();

    const files = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.db'))
        .map(file => ({
            name: file,
            path: path.join(BACKUP_DIR, file),
            mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

    if (files.length > maxBackups) {
        const filesToDelete = files.slice(maxBackups);
        filesToDelete.forEach(file => {
            try {
                fs.unlinkSync(file.path);
                console.log(`🗑️ Șters backup vechi: ${file.name}`);
                const logFilePath = getLogPath(file.name);
                if (fs.existsSync(logFilePath)) {
                    fs.unlinkSync(logFilePath);
                }
            } catch (error) {
                console.error(`❌ Eroare la ștergerea ${file.name}:`, error.message);
            }
        });
    }
}

function deleteBackup(backupFileName) {
    ensureDirectories();
    const filePath = path.join(BACKUP_DIR, backupFileName);

    if (!fs.existsSync(filePath)) {
        throw new Error('Backup inexistent');
    }

    fs.unlinkSync(filePath);
    console.log(`🗑️ Backup șters manual: ${backupFileName}`);
    const logFilePath = getLogPath(backupFileName);
    if (fs.existsSync(logFilePath)) {
        fs.unlinkSync(logFilePath);
    }
}

module.exports = {
    backupDatabase,
    restoreDatabase,
    listBackups,
    getBackupDetails,
    cleanupOldBackups,
    deleteBackup,
    BACKUP_DIR,
    LOG_DIR,
    DEFAULT_RETENTION,
};