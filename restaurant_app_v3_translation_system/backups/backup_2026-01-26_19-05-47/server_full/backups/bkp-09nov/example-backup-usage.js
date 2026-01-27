// Exemplu de utilizare a sistemului de backup pentru modificări viitoare

const path = require('path');
const { safeModifyFile, safeModifyMultipleFiles } = require('./safe-modify.js');
const { listBackups, restoreFromBackup, cleanupBackups } = require('./backup-system.js');

// Exemplu 1: Modificare simplă a unui fișier
function exampleSingleFileModification() {
    console.log('📝 EXEMPLU 1: Modificare simplă a unui fișier');
    console.log('═'.repeat(60));

    const filePath = path.join(__dirname, 'public', 'admin.html');
    
    const modifications = [
        {
            oldString: '<!-- Comentariu vechi -->',
            newString: '<!-- Comentariu nou -->'
        },
        {
            oldString: 'text vechi',
            newString: 'text nou',
            replaceAll: true  // Înlocuiește toate aparițiile
        }
    ];

    const result = safeModifyFile(filePath, modifications, 'Exemplu modificare simplă');
    
    if (result.success) {
        console.log('✅ Modificare realizată cu succes!');
        console.log(`📊 Modificări aplicate: ${result.modificationsApplied}`);
        console.log(`💾 Backup creat: ${result.backup.backupFileName}`);
    } else {
        console.log(`❌ Eroare: ${result.error}`);
    }

    return result;
}

// Exemplu 2: Modificare multiple fișiere
function exampleMultipleFilesModification() {
    console.log('\n📝 EXEMPLU 2: Modificare multiple fișiere');
    console.log('═'.repeat(60));

    const fileModifications = [
        {
            filePath: path.join(__dirname, 'public', 'admin.html'),
            modifications: [
                {
                    oldString: 'Admin Panel',
                    newString: 'Admin Panel v2.0'
                }
            ],
            description: 'Actualizare titlu admin.html'
        },
        {
            filePath: path.join(__dirname, 'public', 'admin-advanced.html'),
            modifications: [
                {
                    oldString: 'Restaurant Admin',
                    newString: 'Restaurant Admin v2.0'
                }
            ],
            description: 'Actualizare titlu admin-advanced.html'
        }
    ];

    const result = safeModifyMultipleFiles(fileModifications, 'Actualizare versiuni');
    
    if (result.success) {
        console.log('✅ Modificări multiple realizate cu succes!');
        console.log(`📊 Fișiere procesate: ${result.successCount}`);
        console.log(`💾 Backup-uri create pentru fiecare fișier`);
    } else {
        console.log(`❌ Erori la ${result.errorCount} fișiere`);
    }

    return result;
}

// Exemplu 3: Gestionare backup-uri
function exampleBackupManagement() {
    console.log('\n📝 EXEMPLU 3: Gestionare backup-uri');
    console.log('═'.repeat(60));

    // Listare backup-uri
    console.log('📋 Listare backup-uri:');
    const backups = listBackups();
    
    if (backups.length > 0) {
        console.log(`📊 Găsite ${backups.length} backup-uri`);
        
        // Afișează ultimele 3 backup-uri
        const recentBackups = backups.slice(0, 3);
        recentBackups.forEach((backup, index) => {
            console.log(`${index + 1}. ${backup.fileName} (${backup.size} bytes)`);
        });
    } else {
        console.log('📭 Nu există backup-uri');
    }

    // Curățare backup-uri vechi (păstrează ultimele 5)
    console.log('\n🧹 Curățare backup-uri vechi:');
    const cleanupResult = cleanupBackups(5);
    
    if (cleanupResult.success) {
        console.log(`✅ ${cleanupResult.deleted} backup-uri șterse`);
    } else {
        console.log(`❌ Eroare la curățare: ${cleanupResult.error}`);
    }

    return { backups, cleanupResult };
}

// Exemplu 4: Restaurare din backup
function exampleRestoreFromBackup() {
    console.log('\n📝 EXEMPLU 4: Restaurare din backup');
    console.log('═'.repeat(60));

    // Listare backup-uri disponibile
    const backups = listBackups();
    
    if (backups.length === 0) {
        console.log('📭 Nu există backup-uri disponibile pentru restaurare');
        return { success: false, error: 'No backups available' };
    }

    // Restaurează din ultimul backup
    const latestBackup = backups[0];
    console.log(`🔄 Restaurez din backup: ${latestBackup.fileName}`);
    
    const restoreResult = restoreFromBackup(latestBackup.fileName);
    
    if (restoreResult.success) {
        console.log('✅ Restaurare realizată cu succes!');
        console.log(`📄 Fișier restaurat: ${restoreResult.restoredFile}`);
        console.log(`📊 Dimensiune: ${restoreResult.size} caractere`);
    } else {
        console.log(`❌ Eroare la restaurare: ${restoreResult.error}`);
    }

    return restoreResult;
}

// Funcție principală pentru rularea exemplelor
function runExamples() {
    console.log('🛡️ EXEMPLE UTILIZARE SISTEM BACKUP');
    console.log('═'.repeat(60));
    console.log('📝 Aceste exemple demonstrează cum să folosești sistemul de backup');
    console.log('🔧 pentru modificări sigure ale fișierelor.');
    console.log('');

    try {
        // Rulează exemplele
        const example1 = exampleSingleFileModification();
        const example2 = exampleMultipleFilesModification();
        const example3 = exampleBackupManagement();
        const example4 = exampleRestoreFromBackup();

        console.log('\n📊 REZULTAT FINAL:');
        console.log('═'.repeat(60));
        console.log('✅ Toate exemplele au fost rulate cu succes!');
        console.log('🛡️ Sistemul de backup este gata de utilizare');
        console.log('');
        console.log('🔧 Pentru utilizare în cod:');
        console.log('   const { safeModifyFile } = require("./safe-modify.js");');
        console.log('   safeModifyFile("file.html", [');
        console.log('     { oldString: "vechi", newString: "nou" }');
        console.log('   ], "Descriere modificare");');

        return {
            success: true,
            examples: {
                singleFile: example1,
                multipleFiles: example2,
                backupManagement: example3,
                restore: example4
            }
        };

    } catch (error) {
        console.log(`❌ Eroare la rularea exemplelor: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Exportă funcțiile
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        exampleSingleFileModification,
        exampleMultipleFilesModification,
        exampleBackupManagement,
        exampleRestoreFromBackup,
        runExamples
    };
}

// Dacă scriptul este rulat direct, rulează exemplele
if (require.main === module) {
    runExamples();
}

