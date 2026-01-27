#!/usr/bin/env node
/**
 * FULL BACKUP SCRIPT - Restaurant App V3 powered by QrOMS
 * 
 * Creează backup complet al aplicației:
 * - Toate fișierele sursă
 * - Baza de date (restaurant.db)
 * - Configurații
 * - Package.json și dependencies info
 * - Exclude: node_modules, .git, dist, build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurare
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const BACKUP_NAME = `restaurant-app-v3-backup-${TIMESTAMP}`;
const BACKUP_PATH = path.join(BACKUP_DIR, BACKUP_NAME);

// Exclude patterns
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.cache',
  '*.log',
  'backups',
  'Dev-Files',
  '.vscode',
  '.idea',
  '*.swp',
  '*.swo',
  '.DS_Store',
  'Thumbs.db'
];

// Fișiere importante de backup
const IMPORTANT_FILES = [
  'package.json',
  'package-lock.json',
  '.env.example',
  '.gitignore',
  'README.md',
  'CHANGELOG.md'
];

// Directoare importante
const IMPORTANT_DIRS = [
  'server',
  'admin-vite',
  'docs',
  'public'
];

console.log('🚀 Restaurant App V3 - FULL BACKUP');
console.log('=====================================\n');
console.log(`📁 Project Root: ${PROJECT_ROOT}`);
console.log(`💾 Backup Path: ${BACKUP_PATH}`);
console.log(`⏰ Timestamp: ${TIMESTAMP}\n`);

// Creează directorul de backup
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✅ Created backups directory');
}

if (!fs.existsSync(BACKUP_PATH)) {
  fs.mkdirSync(BACKUP_PATH, { recursive: true });
  console.log('✅ Created backup directory\n');
}

// Funcție pentru a verifica dacă un fișier/director trebuie exclus
function shouldExclude(filePath) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  const fileName = path.basename(filePath);
  
  // Verifică pattern-uri de exclude
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      if (regex.test(fileName) || regex.test(relativePath)) {
        return true;
      }
    } else {
      if (relativePath.includes(pattern) || fileName === pattern) {
        return true;
      }
    }
  }
  
  return false;
}

// Funcție pentru copierea recursivă a fișierelor
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (shouldExclude(src)) {
      return;
    }
    
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      if (!shouldExclude(srcPath)) {
        copyRecursive(srcPath, destPath);
      }
    }
  } else {
    if (!shouldExclude(src)) {
      fs.copyFileSync(src, dest);
    }
  }
}

// 1. Copiază fișiere importante din root
console.log('📋 Copying important files...');
for (const file of IMPORTANT_FILES) {
  const srcPath = path.join(PROJECT_ROOT, file);
  if (fs.existsSync(srcPath)) {
    const destPath = path.join(BACKUP_PATH, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`   ✅ ${file}`);
  }
}

// 2. Copiază directoare importante
console.log('\n📁 Copying important directories...');
for (const dir of IMPORTANT_DIRS) {
  const srcPath = path.join(PROJECT_ROOT, dir);
  if (fs.existsSync(srcPath)) {
    const destPath = path.join(BACKUP_PATH, dir);
    console.log(`   📂 ${dir}...`);
    copyRecursive(srcPath, destPath);
    console.log(`   ✅ ${dir} copied`);
  }
}

// 3. Caută și copiază baza de date
console.log('\n🗄️  Searching for database files...');
function findDatabaseFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !shouldExclude(filePath)) {
      findDatabaseFiles(filePath, fileList);
    } else if (file.endsWith('.db') || file.endsWith('.sqlite') || file.endsWith('.sqlite3')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

const dbFiles = findDatabaseFiles(PROJECT_ROOT);
if (dbFiles.length > 0) {
  const dbBackupDir = path.join(BACKUP_PATH, 'database');
  if (!fs.existsSync(dbBackupDir)) {
    fs.mkdirSync(dbBackupDir, { recursive: true });
  }
  
  for (const dbFile of dbFiles) {
    const relativePath = path.relative(PROJECT_ROOT, dbFile);
    const destPath = path.join(BACKUP_PATH, relativePath);
    const destDir = path.dirname(destPath);
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.copyFileSync(dbFile, destPath);
    console.log(`   ✅ ${relativePath}`);
  }
} else {
  console.log('   ⚠️  No database files found');
}

// 4. Creează fișier INFO cu detalii despre backup
console.log('\n📝 Creating backup info file...');
const backupInfo = {
  timestamp: TIMESTAMP,
  date: new Date().toISOString(),
  project: 'Restaurant App V3 powered by QrOMS',
  version: require(path.join(PROJECT_ROOT, 'package.json'))?.version || 'unknown',
  backupType: 'FULL',
  excluded: EXCLUDE_PATTERNS,
  included: {
    files: IMPORTANT_FILES,
    directories: IMPORTANT_DIRS,
    databaseFiles: dbFiles.map(f => path.relative(PROJECT_ROOT, f))
  },
  system: {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  }
};

const infoPath = path.join(BACKUP_PATH, 'BACKUP-INFO.json');
fs.writeFileSync(infoPath, JSON.stringify(backupInfo, null, 2));
console.log(`   ✅ BACKUP-INFO.json created`);

// 5. Creează arhivă ZIP (dacă este disponibil)
console.log('\n📦 Creating archive...');
try {
  // Încearcă să folosească 7z (dacă este instalat)
  const zipPath = `${BACKUP_PATH}.zip`;
  try {
    execSync(`7z a -tzip "${zipPath}" "${BACKUP_PATH}"`, { stdio: 'ignore' });
    console.log(`   ✅ Archive created: ${path.basename(zipPath)}`);
  } catch (e) {
    // Dacă 7z nu este disponibil, încearcă cu PowerShell (Windows)
    if (process.platform === 'win32') {
      try {
        const psCommand = `Compress-Archive -Path "${BACKUP_PATH}" -DestinationPath "${zipPath}" -Force`;
        execSync(`powershell -Command "${psCommand}"`, { stdio: 'ignore' });
        console.log(`   ✅ Archive created: ${path.basename(zipPath)}`);
      } catch (e2) {
        console.log('   ⚠️  Could not create ZIP archive (7z or PowerShell not available)');
        console.log('   💡 You can manually create a ZIP from the backup folder');
      }
    } else {
      // Linux/Mac - încearcă cu zip
      try {
        execSync(`zip -r "${zipPath}" "${BACKUP_PATH}"`, { stdio: 'ignore' });
        console.log(`   ✅ Archive created: ${path.basename(zipPath)}`);
      } catch (e3) {
        console.log('   ⚠️  Could not create ZIP archive (zip command not available)');
        console.log('   💡 You can manually create a ZIP from the backup folder');
      }
    }
  }
} catch (error) {
  console.log('   ⚠️  Archive creation skipped');
}

// 6. Calculează dimensiunea backup-ului
console.log('\n📊 Calculating backup size...');
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const stat = fs.statSync(currentPath);
    
    if (stat.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      for (const file of files) {
        calculateSize(path.join(currentPath, file));
      }
    } else {
      totalSize += stat.size;
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}

const backupSize = getDirectorySize(BACKUP_PATH);
const sizeInMB = (backupSize / (1024 * 1024)).toFixed(2);
const sizeInGB = (backupSize / (1024 * 1024 * 1024)).toFixed(2);

console.log(`   📦 Backup size: ${sizeInMB} MB (${sizeInGB} GB)`);

// 7. Rezumat final
console.log('\n' + '='.repeat(50));
console.log('✅ BACKUP COMPLETED SUCCESSFULLY!');
console.log('='.repeat(50));
console.log(`\n📁 Backup Location: ${BACKUP_PATH}`);
console.log(`📦 Backup Size: ${sizeInMB} MB`);
console.log(`⏰ Timestamp: ${TIMESTAMP}`);
console.log(`\n💡 To restore: Copy the backup folder to your project root`);
console.log(`💡 Database files are in: database/ subdirectory`);
console.log(`\n🎉 Restaurant App V3 powered by QrOMS\n`);

