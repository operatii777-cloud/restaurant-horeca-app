/**
 * SYSTEMATIC TESTING SCRIPT
 * 
 * Rulează teste unul câte unul pentru a nu bloca aplicația.
 * Verifică toate funcționalitățile critice Horeca.
 */

const { execSync } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const tests = [
  {
    name: 'Backend Server Start',
    command: 'node -c server.js',
    description: 'Verificare sintaxă server.js'
  },
  {
    name: 'Database Connection',
    command: 'node -e "require(\'./database\').dbPromise.then(() => console.log(\'OK\')).catch(e => {console.error(e); process.exit(1);})"',
    description: 'Verificare conexiune database'
  },
  {
    name: 'Admin-Vite Build',
    command: 'cd admin-vite && npm run build',
    description: 'Build admin-vite React app',
    cwd: path.join(__dirname, '..')
  }
];

async function runTest(test, index, total) {
  log(`\n[${index + 1}/${total}] ${test.name}`, 'cyan');
  log(`   ${test.description}`, 'blue');
  
  try {
    const cwd = test.cwd || path.join(__dirname, '..');
    execSync(test.command, {
      cwd,
      stdio: 'inherit',
      timeout: 120000
    });
    log(`   ✅ ${test.name} - SUCCES`, 'green');
    return true;
  } catch (error) {
    log(`   ❌ ${test.name} - EȘUAT`, 'red');
    log(`   Eroare: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🧪 PORNIRE TESTE SISTEMATICE', 'magenta');
  log('='.repeat(60), 'cyan');
  
  const results = [];
  
  for (let i = 0; i < tests.length; i++) {
    const result = await runTest(tests[i], i, tests.length);
    results.push({ test: tests[i].name, success: result });
    
    // Pauză între teste
    if (i < tests.length - 1) {
      log('   ⏳ Așteptare 2 secunde...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Rezumat
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 REZUMAT TESTE', 'blue');
  log('='.repeat(60), 'cyan');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach(r => {
    log(`${r.success ? '✅' : '❌'} ${r.test}`, r.success ? 'green' : 'red');
  });
  
  log(`\n✅ Reușite: ${passed}/${results.length}`, passed === results.length ? 'green' : 'yellow');
  log(`❌ Eșuate: ${failed}/${results.length}`, failed > 0 ? 'red' : 'green');
  
  if (failed === 0) {
    log('\n🎉 TOATE TESTELE AU REUȘIT!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Unele teste au eșuat. Verifică erorile de mai sus.', 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Eroare fatală: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
