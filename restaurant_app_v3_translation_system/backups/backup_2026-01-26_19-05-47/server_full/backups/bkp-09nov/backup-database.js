const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Funcție pentru backup-ul bazei de date
function backupDatabase() {
    const dbPath = './restaurant.db';
    const backupDir = './backups';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `restaurant_backup_${timestamp}.db`);
    
    // Creează directorul de backup dacă nu există
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Verifică dacă baza de date există
    if (!fs.existsSync(dbPath)) {
        console.log('❌ Baza de date restaurant.db nu există!');
        return false;
    }
    
    try {
        // Copiază fișierul bazei de date
        fs.copyFileSync(dbPath, backupPath);
        console.log(`✅ Backup creat cu succes: ${backupPath}`);
        return true;
    } catch (error) {
        console.error('❌ Eroare la crearea backup-ului:', error.message);
        return false;
    }
}

// Funcție pentru restaurarea bazei de date
function restoreDatabase(backupFileName) {
    const dbPath = './restaurant.db';
    const backupDir = './backups';
    const backupPath = path.join(backupDir, backupFileName);
    
    if (!fs.existsSync(backupPath)) {
        console.log('❌ Fișierul de backup nu există!');
        return false;
    }
    
    try {
        // Copiază backup-ul peste baza de date curentă
        fs.copyFileSync(backupPath, dbPath);
        console.log(`✅ Baza de date restaurată cu succes din: ${backupFileName}`);
        return true;
    } catch (error) {
        console.error('❌ Eroare la restaurarea backup-ului:', error.message);
        return false;
    }
}

// Funcție pentru listarea backup-urilor disponibile
function listBackups() {
    const backupDir = './backups';
    
    if (!fs.existsSync(backupDir)) {
        console.log('📁 Nu există backup-uri disponibile.');
        return [];
    }
    
    const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.db'))
        .sort((a, b) => {
            const statA = fs.statSync(path.join(backupDir, a));
            const statB = fs.statSync(path.join(backupDir, b));
            return statB.mtime - statA.mtime; // Sortare descrescătoare (cel mai recent primul)
        });
    
    console.log('📋 Backup-uri disponibile:');
    files.forEach((file, index) => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(2);
        const date = stats.mtime.toLocaleString('ro-RO');
        console.log(`${index + 1}. ${file} (${size} KB) - ${date}`);
    });
    
    return files;
}

// Funcție pentru ștergerea backup-urilor vechi (păstrează ultimele 10)
function cleanupOldBackups() {
    const backupDir = './backups';
    const maxBackups = 10;
    
    if (!fs.existsSync(backupDir)) {
        return;
    }
    
    const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.db'))
        .map(file => ({
            name: file,
            path: path.join(backupDir, file),
            mtime: fs.statSync(path.join(backupDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
    
    if (files.length > maxBackups) {
        const filesToDelete = files.slice(maxBackups);
        filesToDelete.forEach(file => {
            try {
                fs.unlinkSync(file.path);
                console.log(`🗑️ Șters backup vechi: ${file.name}`);
            } catch (error) {
                console.error(`❌ Eroare la ștergerea ${file.name}:`, error.message);
            }
        });
    }
}

// Export funcțiile pentru utilizare în alte module
module.exports = {
    backupDatabase,
    restoreDatabase,
    listBackups,
    cleanupOldBackups
};

// Dacă scriptul este rulat direct, creează un backup
if (require.main === module) {
    console.log('🔄 Creare backup automat...');
    backupDatabase();
    cleanupOldBackups();
}


