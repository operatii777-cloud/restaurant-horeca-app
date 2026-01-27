#!/usr/bin/env node
/**
 * TEST RUNNER - Rulează toate testele și generează raport
 * Data: 03 Decembrie 2025
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 RESTAURANT APP V3 - TEST SUITE');
console.log('=====================================\n');

// Verifică dacă serverul rulează
console.log('🔍 Verificare server...');
exec('curl -s http://localhost:3001/api/health || echo "Server not running"', (error, stdout) => {
  if (stdout.includes('Server not running')) {
    console.log('❌ Serverul NU rulează! Pornește serverul cu: node server.js');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  
  // Instalează Playwright dacă e necesar
  console.log('📦 Verificare Playwright...');
  exec('npx playwright --version', (error, stdout) => {
    if (error) {
      console.log('⚠️ Playwright nu este instalat. Instalare...');
      exec('npm install --save-dev @playwright/test', (installError) => {
        if (installError) {
          console.error('❌ Eroare la instalarea Playwright:', installError);
          process.exit(1);
        }
        runTests();
      });
    } else {
      console.log(`✅ Playwright ${stdout.trim()} is installed\n`);
      runTests();
    }
  });
});

function runTests() {
  console.log('🧪 Rulare teste Playwright...\n');
  console.log('=====================================\n');
  
  const testProcess = exec('npx playwright test tests/test-all-modules.spec.js --reporter=list', {
    cwd: path.join(__dirname, '..')
  });
  
  testProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  testProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  testProcess.on('close', (code) => {
    console.log('\n=====================================');
    if (code === 0) {
      console.log('✅ TOATE TESTELE AU TRECUT!');
    } else {
      console.log(`⚠️ Unele teste au eșuat (exit code: ${code})`);
    }
    
    // Generează raport HTML
    console.log('\n📊 Generare raport HTML...');
    exec('npx playwright show-report', (error) => {
      if (!error) {
        console.log('✅ Raport generat: playwright-report/index.html');
      }
    });
  });
}

