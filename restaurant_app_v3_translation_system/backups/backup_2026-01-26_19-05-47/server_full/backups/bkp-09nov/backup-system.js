// Sistem automat de backup pentru fișierele modificate

const fs = require('fs');
const path = require('path');

class BackupSystem {
    constructor() {
        this.backupDir = path.join(__dirname, 'backups');
        this.ensureBackupDir();
    }

    ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            console.log(`📁 Director backup creat: ${this.backupDir}`);
        }
    }

    createBackup(filePath, description = '') {
        try {
            if (!fs.existsSync(filePath)) {
                console.log(`❌ Fișierul ${filePath} nu există`);
                return false;
            }

            const fileName = path.basename(filePath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `${fileName}.backup.${timestamp}`;
            const backupPath = path.join(this.backupDir, backupFileName);

            // Citește conținutul fișierului original
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Creează backup-ul
            fs.writeFileSync(backupPath, content, 'utf8');
            
            console.log(`✅ Backup creat: ${backupFileName}`);
            console.log(`   📄 Fișier original: ${filePath}`);
            console.log(`   💾 Backup salvat: ${backupPath}`);
            console.log(`   📝 Descriere: ${description || 'Modificare automată'}`);
            console.log(`   📊 Dimensiune: ${content.length} caractere`);
            
            return {
                success: true,
                originalPath: filePath,
                backupPath: backupPath,
                backupFileName: backupFileName,
                size: content.length,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.log(`❌ Eroare la crearea backup-ului pentru ${filePath}: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    updateFile(filePath, newContent, description = '') {
        try {
            // 1. Creează backup înainte de modificare
            const backupResult = this.createBackup(filePath, `Înainte de: ${description}`);
            
            if (!backupResult.success) {
                console.log(`❌ Nu s-a putut crea backup pentru ${filePath}`);
                return { success: false, error: 'Backup creation failed' };
            }

            // 2. Verifică integritatea conținutului nou
            if (typeof newContent !== 'string') {
                console.log(`❌ Conținutul nou trebuie să fie string pentru ${filePath}`);
                return { success: false, error: 'Invalid content type' };
            }

            // 3. Salvează modificarea
            fs.writeFileSync(filePath, newContent, 'utf8');
            
            // 4. Verifică că fișierul a fost salvat corect
            const savedContent = fs.readFileSync(filePath, 'utf8');
            if (savedContent !== newContent) {
                console.log(`❌ Fișierul ${filePath} nu a fost salvat corect`);
                return { success: false, error: 'File save verification failed' };
            }

            console.log(`✅ Fișier actualizat cu succes: ${filePath}`);
            console.log(`   📝 Descriere: ${description}`);
            console.log(`   📊 Dimensiune nouă: ${newContent.length} caractere`);
            console.log(`   💾 Backup disponibil: ${backupResult.backupFileName}`);

            return {
                success: true,
                filePath: filePath,
                newSize: newContent.length,
                backup: backupResult,
                description: description,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.log(`❌ Eroare la actualizarea fișierului ${filePath}: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    listBackups() {
        try {
            const files = fs.readdirSync(this.backupDir);
            const backups = files
                .filter(file => file.endsWith('.backup.'))
                .map(file => {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        fileName: file,
                        filePath: filePath,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    };
                })
                .sort((a, b) => b.created - a.created);

            console.log(`\n📋 LISTA BACKUP-URI (${backups.length} fișiere):`);
            console.log('═'.repeat(80));
            
            if (backups.length === 0) {
                console.log('📭 Nu există backup-uri disponibile');
                return backups;
            }

            backups.forEach((backup, index) => {
                console.log(`${index + 1}. ${backup.fileName}`);
                console.log(`   📁 Cale: ${backup.filePath}`);
                console.log(`   📊 Dimensiune: ${backup.size} bytes`);
                console.log(`   📅 Creat: ${backup.created.toLocaleString()}`);
                console.log(`   🔄 Modificat: ${backup.modified.toLocaleString()}`);
                console.log('');
            });

            return backups;

        } catch (error) {
            console.log(`❌ Eroare la listarea backup-urilor: ${error.message}`);
            return [];
        }
    }

    restoreFromBackup(backupFileName) {
        try {
            const backupPath = path.join(this.backupDir, backupFileName);
            
            if (!fs.existsSync(backupPath)) {
                console.log(`❌ Backup-ul ${backupFileName} nu există`);
                return false;
            }

            // Citește conținutul backup-ului
            const backupContent = fs.readFileSync(backupPath, 'utf8');
            
            // Extrage numele fișierului original din numele backup-ului
            const originalFileName = backupFileName.split('.backup.')[0];
            const originalPath = path.join(__dirname, 'public', originalFileName);
            
            // Creează backup pentru fișierul actual înainte de restaurare
            if (fs.existsSync(originalPath)) {
                this.createBackup(originalPath, `Înainte de restaurare din ${backupFileName}`);
            }

            // Restaurează fișierul
            fs.writeFileSync(originalPath, backupContent, 'utf8');
            
            console.log(`✅ Fișier restaurat cu succes: ${originalFileName}`);
            console.log(`   📁 Din backup: ${backupFileName}`);
            console.log(`   📊 Dimensiune restaurată: ${backupContent.length} caractere`);
            
            return {
                success: true,
                restoredFile: originalPath,
                fromBackup: backupFileName,
                size: backupContent.length
            };

        } catch (error) {
            console.log(`❌ Eroare la restaurarea din backup ${backupFileName}: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    cleanupOldBackups(keepCount = 10) {
        try {
            const backups = this.listBackups();
            
            if (backups.length <= keepCount) {
                console.log(`📭 Nu sunt backup-uri de șters (${backups.length} ≤ ${keepCount})`);
                return { success: true, deleted: 0 };
            }

            const toDelete = backups.slice(keepCount);
            let deletedCount = 0;

            toDelete.forEach(backup => {
                try {
                    fs.unlinkSync(backup.filePath);
                    console.log(`🗑️ Backup șters: ${backup.fileName}`);
                    deletedCount++;
                } catch (error) {
                    console.log(`❌ Eroare la ștergerea ${backup.fileName}: ${error.message}`);
                }
            });

            console.log(`✅ Cleanup completat: ${deletedCount} backup-uri șterse`);
            return { success: true, deleted: deletedCount };

        } catch (error) {
            console.log(`❌ Eroare la cleanup backup-uri: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

// Funcții helper pentru utilizare rapidă
function createBackup(filePath, description) {
    const backupSystem = new BackupSystem();
    return backupSystem.createBackup(filePath, description);
}

function updateFileWithBackup(filePath, newContent, description) {
    const backupSystem = new BackupSystem();
    return backupSystem.updateFile(filePath, newContent, description);
}

function listBackups() {
    const backupSystem = new BackupSystem();
    return backupSystem.listBackups();
}

function restoreFromBackup(backupFileName) {
    const backupSystem = new BackupSystem();
    return backupSystem.restoreFromBackup(backupFileName);
}

function cleanupBackups(keepCount = 10) {
    const backupSystem = new BackupSystem();
    return backupSystem.cleanupOldBackups(keepCount);
}

// Exportă clasa și funcțiile
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BackupSystem,
        createBackup,
        updateFileWithBackup,
        listBackups,
        restoreFromBackup,
        cleanupBackups
    };
}

// Dacă scriptul este rulat direct, afișează informații despre sistem
if (require.main === module) {
    console.log('🛡️ SISTEM BACKUP AUTOMAT');
    console.log('═'.repeat(50));
    console.log('📁 Director backup:', path.join(__dirname, 'backups'));
    console.log('🔧 Funcții disponibile:');
    console.log('   - createBackup(filePath, description)');
    console.log('   - updateFileWithBackup(filePath, newContent, description)');
    console.log('   - listBackups()');
    console.log('   - restoreFromBackup(backupFileName)');
    console.log('   - cleanupBackups(keepCount)');
    console.log('');
    
    const backupSystem = new BackupSystem();
    backupSystem.listBackups();
}

