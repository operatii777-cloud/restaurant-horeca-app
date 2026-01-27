/**
 * Production Files Validator
 * 
 * Verifică și previne salvarea de fișiere non-production în directorul production.
 * Rulează automat la crearea/modificarea fișierelor.
 * 
 * Reguli:
 * - Fișiere de test trebuie să fie în Dev-Files/03-Teste/
 * - Fișiere de fixuri trebuie să fie în Dev-Files/02-Fixuri/
 * - Rapoarte trebuie să fie în Dev-Files/01-Rapoarte/
 * - Analize trebuie să fie în Dev-Files/04-Analize/
 * - Scripturi temporare trebuie să fie în Dev-Files/05-Scripturi-Temporare/
 * - Documentație dev trebuie să fie în Dev-Files/06-Documentatie-Dev/
 */

const fs = require('fs');
const path = require('path');

const PRODUCTION_ROOT = __dirname;
const DEV_FILES_ROOT = path.join(PRODUCTION_ROOT, 'Dev-Files');

// Patterns pentru fișiere non-production
const NON_PRODUCTION_PATTERNS = {
  test: {
    patterns: [
      /^test-/i,
      /\.test\./i,
      /\.spec\./i,
      /^run-.*test/i,
      /^auto-run/i,
      /^setup-and-test/i,
      /test-.*\.(js|ts|jsx|tsx)$/i,
      /-test\./i,
      /test-results/i,
      /playwright-report/i
    ],
    targetDir: '03-Teste'
  },
  fix: {
    patterns: [
      /^fix-/i,
      /-fix\./i,
      /^FIX-/i,
      /quickfix/i,
      /hotfix/i,
      /patch/i
    ],
    targetDir: '02-Fixuri'
  },
  report: {
    patterns: [
      /^RAPORT-/i,
      /^REZUMAT-/i,
      /-REPORT/i,
      /-RAPORT/i,
      /^AUDIT-/i,
      /test.*result/i,
      /\.log$/i,
      /^PLAYWRIGHT-/i
    ],
    targetDir: '01-Rapoarte'
  },
  analysis: {
    patterns: [
      /^ANALIZA-/i,
      /^AUDIT-/i,
      /analysis/i,
      /diagnostic/i,
      /audit.*report/i
    ],
    targetDir: '04-Analize'
  },
  script: {
    patterns: [
      /^cleanup-/i,
      /^move-/i,
      /^backup-/i,
      /^migrate-/i,
      /^check-/i,
      /^update-/i,
      /^populate-/i,
      /-cleanup\./i,
      /-migration\./i,
      /-temporary/i
    ],
    targetDir: '05-Scripturi-Temporare'
  },
  playwright: {
    patterns: [
      /playwright.*config/i,
      /playwright.*analysis/i
    ],
    targetDir: '03-Teste'
  },
  docs: {
    patterns: [
      /^CHANGELOG/i,
      /^TODO/i,
      /^NOTES/i,
      /^PROMPT/i,
      /-dev\.md$/i,
      /development/i,
      /dev.*guide/i
    ],
    targetDir: '06-Documentatie-Dev'
  }
};

// Fișiere production permise (nu se mută)
const PRODUCTION_ALLOWED = [
  'server.js',
  'package.json',
  'package-lock.json',
  'README.md',
  'README-PRODUCTION.md',
  'MANUAL-INSTRUCTIUNI.md',
  'database.js',
  'database.db',
  'tsconfig.json',
  '.env',
  '.env.example',
  '.gitignore',
  'ecosystem.config.js',
  'Dockerfile',
  'docker-compose.yml'
];

/**
 * Verifică dacă un fișier este non-production
 */
function isNonProductionFile(fileName) {
  // Verifică dacă e în whitelist production
  if (PRODUCTION_ALLOWED.includes(fileName)) {
    return null;
  }

  // Verifică dacă e deja în Dev-Files sau node_modules sau dist
  if (fileName.includes('Dev-Files') || 
      fileName.includes('node_modules') || 
      fileName.includes('dist') ||
      fileName.startsWith('.')) {
    return null;
  }

  // Verifică patterns
  for (const [category, config] of Object.entries(NON_PRODUCTION_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(fileName)) {
        return {
          category,
          targetDir: config.targetDir
        };
    }
    }
  }

  return null;
}

/**
 * Validează un fișier și sugerează mutarea dacă e necesar
 */
function validateFile(filePath) {
  const fileName = path.basename(filePath);
  const relativePath = path.relative(PRODUCTION_ROOT, filePath);
  
  // Ignoră fișierele din Dev-Files
  if (relativePath.startsWith('Dev-Files')) {
    return null;
  }
  
  // Verifică dacă e în root server/ sau admin-vite/ root
  const isInProductionRoot = relativePath.split(path.sep).length <= 2;
  const isAdminViteRoot = relativePath.startsWith('admin-vite') && relativePath.split(path.sep).length <= 2;
  
  if (!isInProductionRoot && !isAdminViteRoot) {
    return null; // E deja într-un subfolder, OK
  }

  const nonProduction = isNonProductionFile(fileName);
  
  if (nonProduction) {
    const targetDir = path.join(DEV_FILES_ROOT, nonProduction.targetDir);
    const targetPath = path.join(targetDir, fileName);
    
    return {
      shouldMove: true,
      category: nonProduction.category,
      currentPath: filePath,
      targetPath: targetPath,
      targetDir: nonProduction.targetDir,
      message: `⚠️  Fișier non-production detectat: ${fileName}\n` +
               `   Categorie: ${nonProduction.category}\n` +
               `   Trebuie mutat în: Dev-Files/${nonProduction.targetDir}/\n` +
               `   Path complet: ${targetPath}`
    };
  }

  return null;
}

/**
 * Verifică toate fișierele din root production
 */
function validateProductionRoot() {
  const issues = [];
  
  // Verifică server/ root (exclude Dev-Files)
  try {
    const files = fs.readdirSync(PRODUCTION_ROOT, { withFileTypes: true });
    for (const file of files) {
      // Ignoră Dev-Files și alte directoare speciale
      if (file.isDirectory() && (file.name === 'Dev-Files' || file.name === 'node_modules' || file.name === 'dist' || file.name.startsWith('.'))) {
        continue;
      }
      if (file.isFile() && !file.name.startsWith('.')) {
        const filePath = path.join(PRODUCTION_ROOT, file.name);
        const relativePath = path.relative(PRODUCTION_ROOT, filePath);
        // Dublă verificare - ignoră dacă e în Dev-Files
        if (!relativePath.startsWith('Dev-Files')) {
          const validation = validateFile(filePath);
          if (validation) {
            issues.push(validation);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error reading production root:', err);
  }

  // Verifică admin-vite/ root
  const adminViteRoot = path.join(PRODUCTION_ROOT, 'admin-vite');
  if (fs.existsSync(adminViteRoot)) {
    try {
      const files = fs.readdirSync(adminViteRoot, { withFileTypes: true });
      for (const file of files) {
        if (file.isFile() && !file.name.startsWith('.') && 
            !['package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'index.html'].includes(file.name)) {
          const filePath = path.join(adminViteRoot, file.name);
          const validation = validateFile(filePath);
          if (validation) {
            issues.push(validation);
          }
        }
      }
    } catch (err) {
      console.error('Error reading admin-vite root:', err);
    }
  }

  return issues;
}

module.exports = {
  validateFile,
  validateProductionRoot,
  isNonProductionFile,
  NON_PRODUCTION_PATTERNS
};

// Dacă rulează direct, validare automată
if (require.main === module) {
  console.log('🔍 Validare fișiere production...\n');
  const issues = validateProductionRoot();
  
  if (issues.length === 0) {
    console.log('✅ Toate fișierele sunt OK - nu există fișiere non-production în root production');
  } else {
    console.log(`⚠️  Găsite ${issues.length} fișiere non-production în root production:\n`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.message}\n`);
    });
    console.log('\n💡 Sfat: Mută aceste fișiere în Dev-Files/ conform categoriei');
    process.exit(1);
  }
}

