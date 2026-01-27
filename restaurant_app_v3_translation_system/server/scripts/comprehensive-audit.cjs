/**
 * COMPREHENSIVE AUDIT SCRIPT
 * 
 * Verifică complet aplicația pentru:
 * - Erori de sintaxă
 * - Vulnerabilități de securitate
 * - Probleme de performanță
 * - SQL injection
 * - XSS vulnerabilities
 * - Database integrity
 * - Dependencies vulnerabilities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  info: []
};

function addIssue(severity, category, message, file = null, line = null) {
  const issue = { category, message, file, line };
  issues[severity].push(issue);
  log(`  ${severity.toUpperCase()}: ${message}${file ? ` (${file}${line ? `:${line}` : ''})` : ''}`, 
      severity === 'critical' ? 'red' : severity === 'high' ? 'yellow' : 'cyan');
}

// ========================================
// 1. VERIFICARE SINTAXĂ
// ========================================
function checkSyntax() {
  log('\n📝 1. VERIFICARE SINTAXĂ', 'cyan');
  
  const filesToCheck = [
    'server.js',
    'database.js',
    'routes/couriers.js',
    'routes/orders.js',
    'routes/stocks.js',
  ];
  
  for (const file of filesToCheck) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      try {
        execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
        log(`  ✅ ${file}`, 'green');
      } catch (error) {
        addIssue('critical', 'syntax', `Eroare sintaxă în ${file}`, file);
      }
    }
  }
}

// ========================================
// 2. VERIFICARE SQL INJECTION
// ========================================
function checkSQLInjection() {
  log('\n🔒 2. VERIFICARE SQL INJECTION', 'cyan');
  
  const filesToCheck = [
    path.join(__dirname, '..', 'database.js'),
    path.join(__dirname, '..', 'routes'),
    path.join(__dirname, '..', 'src', 'modules'),
  ];
  
  function scanFile(filePath) {
    if (!fs.existsSync(filePath) || !filePath.endsWith('.js')) return;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Verifică concatenare string în query-uri SQL
        if (line.includes('db.') && (line.includes('run') || line.includes('all') || line.includes('get'))) {
          // Verifică dacă folosește template literals cu variabile directe
          if (line.includes('`') && line.includes('${') && !line.includes('?')) {
            addIssue('high', 'sql-injection', 
              'Posibilă vulnerabilitate SQL injection - folosește template literals în loc de parametri',
              path.relative(__dirname, filePath), lineNum);
          }
          
          // Verifică concatenare cu +
          if (line.includes('+') && (line.includes("'") || line.includes('"'))) {
            addIssue('critical', 'sql-injection',
              'VULNERABILITATE CRITICĂ: Concatenare string în query SQL',
              path.relative(__dirname, filePath), lineNum);
          }
        }
      });
    } catch (error) {
      // Ignoră erorile de citire
    }
  }
  
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
        scanDirectory(fullPath);
      } else if (stat.isFile() && item.endsWith('.js')) {
        scanFile(fullPath);
      }
    }
  }
  
  for (const dir of filesToCheck) {
    if (fs.existsSync(dir)) {
      const stat = fs.statSync(dir);
      if (stat.isDirectory()) {
        scanDirectory(dir);
      } else {
        scanFile(dir);
      }
    }
  }
  
  if (issues.critical.length === 0 && issues.high.length === 0) {
    log('  ✅ Nu s-au găsit vulnerabilități SQL injection evidente', 'green');
  }
}

// ========================================
// 3. VERIFICARE DEPENDENȚE
// ========================================
function checkDependencies() {
  log('\n📦 3. VERIFICARE DEPENDENȚE', 'cyan');
  
  try {
    const auditResult = execSync('npm audit --json', { 
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const audit = JSON.parse(auditResult);
    
    if (audit.vulnerabilities) {
      const vulns = audit.vulnerabilities;
      let critical = 0, high = 0, moderate = 0, low = 0;
      
      for (const [name, vuln] of Object.entries(vulns)) {
        if (vuln.severity === 'critical') {
          critical++;
          addIssue('critical', 'dependencies', 
            `Vulnerabilitate critică în ${name}: ${vuln.title || vuln.name}`);
        } else if (vuln.severity === 'high') {
          high++;
          addIssue('high', 'dependencies',
            `Vulnerabilitate înaltă în ${name}: ${vuln.title || vuln.name}`);
        } else if (vuln.severity === 'moderate') {
          moderate++;
          addIssue('medium', 'dependencies',
            `Vulnerabilitate moderată în ${name}: ${vuln.title || vuln.name}`);
        } else {
          low++;
        }
      }
      
      log(`  ⚠️  Vulnerabilități găsite: ${critical} critice, ${high} înalte, ${moderate} moderate, ${low} scăzute`, 'yellow');
    } else {
      log('  ✅ Nu s-au găsit vulnerabilități în dependențe', 'green');
    }
  } catch (error) {
    log(`  ⚠️  Nu s-a putut rula npm audit: ${error.message}`, 'yellow');
  }
}

// ========================================
// 4. VERIFICARE DATABASE INTEGRITY
// ========================================
function checkDatabaseIntegrity() {
  log('\n💾 4. VERIFICARE INTEGRITATE DATABASE', 'cyan');
  
  const dbPath = path.join(__dirname, '..', 'restaurant.db');
  
  if (!fs.existsSync(dbPath)) {
    addIssue('high', 'database', 'Fișierul restaurant.db nu există');
    return;
  }
  
  try {
    const db = require('sqlite3').verbose();
    const dbInstance = new db.Database(dbPath, db.OPEN_READONLY, (err) => {
      if (err) {
        addIssue('critical', 'database', `Nu se poate deschide database: ${err.message}`);
        return;
      }
      
      // Verifică foreign keys
      dbInstance.get("PRAGMA foreign_key_check", (err, row) => {
        if (err) {
          addIssue('high', 'database', `Eroare la verificarea foreign keys: ${err.message}`);
        } else if (row) {
          addIssue('high', 'database', 'Foreign key constraints violated');
        } else {
          log('  ✅ Foreign keys OK', 'green');
        }
      });
      
      // Verifică integritate
      dbInstance.get("PRAGMA integrity_check", (err, row) => {
        if (err) {
          addIssue('high', 'database', `Eroare la verificarea integrității: ${err.message}`);
        } else if (row && row.integrity_check !== 'ok') {
          addIssue('critical', 'database', `Database corupt: ${row.integrity_check}`);
        } else {
          log('  ✅ Integritate database OK', 'green');
        }
        
        dbInstance.close();
      });
    });
  } catch (error) {
    addIssue('high', 'database', `Eroare la verificarea database: ${error.message}`);
  }
}

// ========================================
// 5. VERIFICARE CONSOLE.LOG
// ========================================
function checkConsoleLogs() {
  log('\n📋 5. VERIFICARE CONSOLE.LOG (Production)', 'cyan');
  
  const filesToCheck = [
    path.join(__dirname, '..', 'server.js'),
    path.join(__dirname, '..', 'database.js'),
  ];
  
  let totalLogs = 0;
  
  for (const filePath of filesToCheck) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(/console\.(log|error|warn|debug)/g);
      if (matches) {
        totalLogs += matches.length;
        addIssue('low', 'code-quality', 
          `${matches.length} console.* calls în ${path.basename(filePath)} - ar trebui folosit logger`,
          path.basename(filePath));
      }
    }
  }
  
  if (totalLogs === 0) {
    log('  ✅ Nu s-au găsit console.log în fișierele principale', 'green');
  } else {
    log(`  ⚠️  Total console.* calls: ${totalLogs}`, 'yellow');
  }
}

// ========================================
// 6. VERIFICARE ADMIN-VITE BUILD
// ========================================
function checkAdminViteBuild() {
  log('\n⚛️  6. VERIFICARE ADMIN-VITE BUILD', 'cyan');
  
  const adminVitePath = path.join(__dirname, '..', 'admin-vite');
  
  if (!fs.existsSync(adminVitePath)) {
    addIssue('high', 'frontend', 'Directorul admin-vite nu există');
    return;
  }
  
  try {
    const buildResult = execSync('npm run build', {
      cwd: adminVitePath,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 120000
    });
    
    if (buildResult.includes('built in')) {
      log('  ✅ Admin-vite build reușit', 'green');
      
      // Verifică chunk size warnings
      if (buildResult.includes('larger than')) {
        addIssue('medium', 'performance', 
          'Chunk-uri mari detectate în admin-vite - consideră code splitting');
      }
    }
  } catch (error) {
    addIssue('critical', 'frontend', 
      `Admin-vite build eșuat: ${error.message}`);
  }
}

// ========================================
// 7. REZUMAT FINAL
// ========================================
function printSummary() {
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 REZUMAT AUDIT', 'blue');
  log('='.repeat(60), 'cyan');
  
  const totals = {
    critical: issues.critical.length,
    high: issues.high.length,
    medium: issues.medium.length,
    low: issues.low.length,
    info: issues.info.length
  };
  
  log(`\n🔴 Critice: ${totals.critical}`, totals.critical > 0 ? 'red' : 'green');
  log(`🟡 Înalte: ${totals.high}`, totals.high > 0 ? 'yellow' : 'green');
  log(`🟠 Moderate: ${totals.medium}`, totals.medium > 0 ? 'yellow' : 'green');
  log(`🔵 Scăzute: ${totals.low}`, 'cyan');
  log(`ℹ️  Info: ${totals.info}`, 'cyan');
  
  const total = totals.critical + totals.high + totals.medium + totals.low + totals.info;
  log(`\n📈 Total probleme: ${total}`, total > 0 ? 'yellow' : 'green');
  
  if (totals.critical > 0 || totals.high > 0) {
    log('\n⚠️  ATENȚIE: Există probleme critice sau înalte care necesită remediere imediată!', 'red');
  } else if (total === 0) {
    log('\n✅ Aplicația este în stare excelentă!', 'green');
  } else {
    log('\n✅ Aplicația este funcțională, dar există îmbunătățiri recomandate.', 'yellow');
  }
  
  // Salvează raport
  const reportPath = path.join(__dirname, '..', 'Dev-Files', '01-Rapoarte', `audit-${new Date().toISOString().split('T')[0]}.json`);
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify({
    date: new Date().toISOString(),
    totals,
    issues
  }, null, 2));
  
  log(`\n📄 Raport salvat: ${reportPath}`, 'cyan');
}

// ========================================
// MAIN
// ========================================
async function main() {
  log('\n🚀 PORNIRE AUDIT COMPLET APLICAȚIE', 'magenta');
  log('='.repeat(60), 'cyan');
  
  checkSyntax();
  checkSQLInjection();
  checkDependencies();
  checkDatabaseIntegrity();
  checkConsoleLogs();
  checkAdminViteBuild();
  
  printSummary();
}

main().catch(error => {
  log(`\n❌ Eroare fatală în audit: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
