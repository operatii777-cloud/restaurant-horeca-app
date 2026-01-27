/**
 * SCRIPT PENTRU RULARE SECVENȚIALĂ A TESTELOR DE SCREENSHOTS
 * 
 * Rulează testele unul câte unul pentru a nu bloca aplicația.
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

function runCommand(command, description) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`📋 ${description}`, 'blue');
  log(`${'='.repeat(60)}`, 'cyan');
  
  try {
    const projectRoot = path.resolve(__dirname, '..');
    
    execSync(command, {
      stdio: 'inherit',
      cwd: projectRoot,
      env: { ...process.env, NODE_ENV: 'test' },
      shell: true
    });
    log(`✅ ${description} - COMPLET`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - EȘUAT`, 'red');
    log(`Eroare: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🚀 PORNIRE CAPTURARE SCREENSHOTS PENTRU MANUAL INSTRUCȚIUNI', 'cyan');
  log('📸 Rulează testele unul câte unul pentru a nu bloca aplicația\n', 'yellow');

  const startTime = Date.now();

  // 1. Teste Playwright pentru Admin-Vite
  log('\n📱 FAZA 1: Admin-Vite (Playwright)', 'yellow');
  const playwrightSuccess = runCommand(
    'npx playwright test tests/manual-screenshots-admin-vite.spec.ts --reporter=list',
    'Capturare screenshots Admin-Vite'
  );

  // Pauză între suite
  if (playwrightSuccess) {
    log('\n⏳ Așteptare 5 secunde între suite...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // 2. Teste Puppeteer pentru POS/Kiosk
  log('\n🖥️  FAZA 2: POS/Kiosk (Puppeteer)', 'yellow');
  const puppeteerSuccess = runCommand(
    'node tests/manual-screenshots-pos-kiosk.cjs',
    'Capturare screenshots POS/Kiosk'
  );

  // 3. Generare documentație
  log('\n📚 FAZA 3: Generare Documentație', 'yellow');
  const docSuccess = runCommand(
    'node tests/generate-page-documentation.cjs',
    'Generare documentație HTML pentru toate paginile'
  );

  // Rezumat final
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log('\n' + '='.repeat(60), 'cyan');
  log('📊 REZUMAT FINAL', 'blue');
  log('='.repeat(60), 'cyan');
  log(`✅ Admin-Vite: ${playwrightSuccess ? 'SUCCES' : 'EȘUAT'}`, playwrightSuccess ? 'green' : 'red');
  log(`✅ POS/Kiosk: ${puppeteerSuccess ? 'SUCCES' : 'EȘUAT'}`, puppeteerSuccess ? 'green' : 'red');
  log(`⏱️  Durată totală: ${duration} secunde`, 'yellow');
  log(`📁 Screenshots: server/screenshots/`, 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  if (playwrightSuccess && puppeteerSuccess) {
    log('🎉 TOATE SCREENSHOT-URILE AU FOST CAPTURATE CU SUCCES!', 'green');
    process.exit(0);
  } else {
    log('⚠️  Unele teste au eșuat. Verifică logurile de mai sus.', 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log(`❌ Eroare fatală: ${error.message}`, 'red');
  process.exit(1);
});
