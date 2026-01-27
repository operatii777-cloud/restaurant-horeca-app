#!/usr/bin/env node

/**
 * 💾 BACKUP FULL - White Label Ready
 * Creare backup complet al aplicației
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Nume backup scurt conform preferințelor
const date = new Date();
const day = String(date.getDate()).padStart(2, '0');
const months = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const month = months[date.getMonth()];
const backupName = `bkp-${day}${month}`;

const ROOT_DIR = __dirname;
const BACKUP_DIR = path.join(ROOT_DIR, 'backups');
const BACKUP_PATH = path.join(BACKUP_DIR, backupName);

console.log('\n╔═══════════════════════════════════════════════╗');
console.log('║  💾 BACKUP FULL - White Label Ready          ║');
console.log('╚═══════════════════════════════════════════════╝\n');

// Verifică dacă există deja backup cu acest nume
if (fs.existsSync(BACKUP_PATH)) {
    console.log(`⚠️  Backup ${backupName} există deja!`);
    console.log(`📁 ${BACKUP_PATH}`);
    
    // Adaugă timestamp pentru unicitate
    const timestamp = date.getHours() + '' + date.getMinutes();
    const backupNameWithTime = `${backupName}-${timestamp}`;
    const newBackupPath = path.join(BACKUP_DIR, backupNameWithTime);
    
    console.log(`\n✅ Creare backup cu timestamp: ${backupNameWithTime}\n`);
    createBackup(newBackupPath, backupNameWithTime);
} else {
    createBackup(BACKUP_PATH, backupName);
}

function createBackup(targetPath, name) {
    try {
        // Crează director backup dacă nu există
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }
        
        console.log(`🔄 Creare backup: ${name}...`);
        
        // Fișiere și directoare de exclus
        const excludes = [
            'node_modules',
            'backups',
            'logs',
            'cache',
            'coverage',
            'playwright-report',
            '.git',
            'Dev-Files',  // Exclude Dev-Files din backup
            '*.log',
            'database.db',     // DB va fi copiat separat
            'orders.db'
        ];
        
        // Crează director backup
        fs.mkdirSync(targetPath, { recursive: true });
        
        // Copiază toate fișierele și directoarele (recursiv)
        copyDirectory(ROOT_DIR, targetPath, excludes);
        
        // Copiază database-urile separat (dacă există)
        if (fs.existsSync(path.join(ROOT_DIR, 'database.db'))) {
            fs.copyFileSync(
                path.join(ROOT_DIR, 'database.db'),
                path.join(targetPath, 'database.db')
            );
            console.log('  ✅ database.db');
        }
        
        if (fs.existsSync(path.join(ROOT_DIR, 'orders.db'))) {
            fs.copyFileSync(
                path.join(ROOT_DIR, 'orders.db'),
                path.join(targetPath, 'orders.db')
            );
            console.log('  ✅ orders.db');
        }
        
        // Calculează dimensiune
        const size = getDirectorySize(targetPath);
        const sizeMB = (size / 1024 / 1024).toFixed(2);
        
        console.log('\n╔═══════════════════════════════════════════════╗');
        console.log('║  ✅ BACKUP COMPLET!                          ║');
        console.log('╚═══════════════════════════════════════════════╝\n');
        console.log(`📁 Locație: ${targetPath}`);
        console.log(`📊 Dimensiune: ${sizeMB} MB`);
        console.log(`📅 Data: ${date.toLocaleString('ro-RO')}`);
        console.log(`\n🎯 Backup white label ready!`);
        console.log(`   → Dev-Files EXCLUS din backup`);
        console.log(`   → node_modules EXCLUS`);
        console.log(`   → Gata pentru production deployment\n`);
        
    } catch (error) {
        console.error(`\n❌ EROARE backup: ${error.message}`);
        process.exit(1);
    }
}

function copyDirectory(src, dest, excludes = []) {
    // Verifică excludes
    const baseName = path.basename(src);
    if (excludes.some(exclude => {
        if (exclude.includes('*')) {
            // Wildcard
            const pattern = new RegExp('^' + exclude.replace(/\*/g, '.*') + '$');
            return pattern.test(baseName);
        }
        return baseName === exclude;
    })) {
        return;
    }
    
    // Crează director destinație
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    // Citește conținutul
    const items = fs.readdirSync(src);
    
    for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        // Skip excludes
        if (excludes.some(exclude => {
            if (exclude.includes('*')) {
                const pattern = new RegExp('^' + exclude.replace(/\*/g, '.*') + '$');
                return pattern.test(item);
            }
            return item === exclude;
        })) {
            continue;
        }
        
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
            // Recursiv pentru directoare
            copyDirectory(srcPath, destPath, excludes);
        } else {
            // Copiază fișier
            try {
                fs.copyFileSync(srcPath, destPath);
            } catch (err) {
                console.log(`  ⚠️  Skip: ${item} (${err.message})`);
            }
        }
    }
}

function getDirectorySize(dirPath) {
    let totalSize = 0;
    
    function calculateSize(currentPath) {
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
            const itemPath = path.join(currentPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                calculateSize(itemPath);
            } else {
                totalSize += stat.size;
            }
        }
    }
    
    calculateSize(dirPath);
    return totalSize;
}

// Run
createBackup;

