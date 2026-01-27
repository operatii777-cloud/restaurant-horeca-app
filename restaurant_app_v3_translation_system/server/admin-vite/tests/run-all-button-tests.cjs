/**
 * RUN ALL BUTTON TESTS
 * 
 * Rulează toate testele de butoane unul câte unul.
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
    name: 'Admin-Vite Buttons',
    command: 'npx playwright test tests/frontend-buttons-complete.spec.ts --reporter=list',
    description: 'Testează toate butoanele din Admin-Vite'
  },
  {
    name: 'Legacy Pages Buttons',
    command: 'npx playwright test tests/legacy-pages-buttons.spec.ts --reporter=list',
    description: 'Testează butoanele din paginile legacy'
  }
];

function runTest(test, index, total) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`[${index + 1}/${total}] ${test.name}`, 'blue');
  log(`${'='.repeat(60)}`, 'cyan');
  log(`📋 ${test.description}`, 'cyan');
  
  try {
    const projectRoot = path.resolve(__dirname, '..');
    execSync(test.command, {
      stdio: 'inherit',
      cwd: projectRoot,
      env: { ...process.env, NODE_ENV: 'test' },
      shell: true,
      timeout: 600000 // 10 minute
    });
    log(`\n✅ ${test.name} - COMPLET`, 'green');
    return true;
  } catch (error) {
    log(`\n❌ ${test.name} - EȘUAT`, 'red');
    log(`Eroare: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🚀 PORNIRE TESTE BUTOANE FRONTEND', 'magenta');
  log('='.repeat(60), 'cyan');
  log('📸 Testează fiecare buton prin accesare efectivă\n', 'yellow');

  const startTime = Date.now();
  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const success = runTest(tests[i], i, tests.length);
    results.push({ test: tests[i].name, success });
    
    if (i < tests.length - 1) {
      log('\n⏳ Așteptare 5 secunde între suite...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log('\n' + '='.repeat(60), 'cyan');
  log('📊 REZUMAT FINAL', 'blue');
  log('='.repeat(60), 'cyan');
  
  results.forEach(r => {
    log(`${r.success ? '✅' : '❌'} ${r.test}`, r.success ? 'green' : 'red');
  });
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`\n✅ Reușite: ${passed}/${results.length}`, passed === results.length ? 'green' : 'yellow');
  log(`❌ Eșuate: ${failed}/${results.length}`, failed > 0 ? 'red' : 'green');
  log(`⏱️  Durată totală: ${duration} secunde`, 'yellow');
  log('📁 Rapoarte: Dev-Files/01-Rapoarte/', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  if (failed === 0) {
    log('🎉 TOATE TESTELE AU REUȘIT!', 'green');
    process.exit(0);
  } else {
    log('⚠️  Unele teste au eșuat. Verifică rapoartele.', 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Eroare fatală: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
