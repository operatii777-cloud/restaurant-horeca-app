#!/usr/bin/env node

/**
 * Playwright Integration pentru Cursor Archive
 * Monitorizează testele Playwright și generează recovery plan când Cursor se blochează
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const CursorArchive = require('./index');

class PlaywrightIntegration {
  constructor() {
    this.archive = new CursorArchive();
    this.testProcess = null;
    this.lastActivity = Date.now();
    this.timeout = 30000; // 30 secunde
    this.checkInterval = null;
  }

  startMonitoring(testCommand = 'npx playwright test') {
    console.log('🎭 Starting Playwright monitoring...');
    
    // Parsează comanda
    const [cmd, ...args] = testCommand.split(' ');
    
    // Pornește procesul Playwright
    this.testProcess = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    // Monitorizează output
    this.testProcess.stdout?.on('data', (data) => {
      this.lastActivity = Date.now();
      this.archive.clearBlock();
      this.logActivity(data.toString());
    });

    this.testProcess.stderr?.on('data', (data) => {
      this.lastActivity = Date.now();
      this.logActivity(data.toString());
    });

    // Monitorizează închiderea procesului
    this.testProcess.on('close', (code) => {
      console.log(`\n✅ Playwright tests finished with code ${code}`);
      this.stopMonitoring();
      process.exit(code);
    });

    this.testProcess.on('error', (error) => {
      console.error('❌ Error running Playwright:', error);
      this.archive.detectBlock();
      this.archive.generateRecoveryPlan();
    });

    // Pornește verificarea de blocare
    this.startBlockDetection();
  }

  startBlockDetection() {
    this.checkInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      
      if (timeSinceLastActivity > this.timeout && this.testProcess) {
        console.warn('\n⚠️  Possible block detected - generating recovery plan...');
        this.archive.detectBlock();
        this.archive.generateRecoveryPlan();
        
        // Salvează contextul Playwright
        this.savePlaywrightContext();
      }
    }, 5000);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  logActivity(data) {
    // Salvează activitatea în arhivă
    this.archive.saveMessage('system', `Playwright output: ${data.substring(0, 200)}`, {
      source: 'playwright',
      timestamp: new Date().toISOString()
    });
  }

  savePlaywrightContext() {
    const contextFile = path.join(
      this.archive.archivePath,
      'checkpoints',
      `playwright-${Date.now()}.json`
    );

    const context = {
      timestamp: new Date().toISOString(),
      lastActivity: new Date(this.lastActivity).toISOString(),
      testCommand: process.argv.slice(2).join(' '),
      workingDirectory: process.cwd(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    fs.writeFileSync(contextFile, JSON.stringify(context, null, 2));
    console.log(`💾 Playwright context saved: ${contextFile}`);
  }
}

// Dacă este rulat direct
if (require.main === module) {
  const integration = new PlaywrightIntegration();
  const testCommand = process.argv.slice(2).join(' ') || 'npx playwright test';
  
  integration.startMonitoring(testCommand);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    integration.stopMonitoring();
    process.exit(0);
  });
}

module.exports = PlaywrightIntegration;

