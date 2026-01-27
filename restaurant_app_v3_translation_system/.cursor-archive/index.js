#!/usr/bin/env node

/**
 * Cursor Archive System - Main Module
 * Salvează automat conversațiile din Cursor în timp real
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class CursorArchive {
  constructor(configPath = '.cursor-archive-config.json') {
    this.config = this.loadConfig(configPath);
    this.archivePath = path.resolve(this.config.archivePath);
    this.currentSession = null;
    this.messages = [];
    this.lastSaveTime = Date.now();
    this.watchInterval = null;
    this.isBlocked = false;
    this.blockedSince = null;
    
    this.init();
  }

  loadConfig(configPath) {
    const defaultConfig = {
      autoSave: true,
      saveInterval: 10,
      archivePath: ".cursor-archive",
      enableRecovery: true,
      playwrightTimeout: 30,
      compression: { enabled: true, olderThan: 7 },
      notifications: true,
      maxFileSizeMB: 100
    };

    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return { ...defaultConfig, ...config };
      }
    } catch (error) {
      console.error('Error loading config:', error.message);
    }
    
    return defaultConfig;
  }

  init() {
    // Creează structura de directoare
    this.ensureDirectories();
    
    // Inițializează sesiunea curentă
    this.startNewSession();
    
    // Pornește auto-save
    if (this.config.autoSave) {
      this.startAutoSave();
    }
    
    // Monitorizează blocări
    if (this.config.enableRecovery) {
      this.startBlockDetection();
    }
    
    console.log('✅ Cursor Archive System initialized');
    console.log(`📁 Archive path: ${this.archivePath}`);
  }

  ensureDirectories() {
    const dirs = [
      this.archivePath,
      path.join(this.archivePath, 'sessions'),
      path.join(this.archivePath, 'logs'),
      path.join(this.archivePath, 'exports'),
      path.join(this.archivePath, 'checkpoints')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  startNewSession() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    this.currentSession = {
      id: `session-${timeStr}`,
      date: dateStr,
      startTime: now.toISOString(),
      messages: [],
      files: [],
      tags: [],
      context: {}
    };

    this.messages = [];
    console.log(`📝 New session started: ${this.currentSession.id}`);
  }

  saveMessage(type, content, metadata = {}) {
    const message = {
      type, // 'user' | 'assistant' | 'system'
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    this.messages.push(message);
    this.currentSession.messages.push(message);
    
    // Auto-save dacă este activat
    if (this.config.autoSave) {
      const now = Date.now();
      if (now - this.lastSaveTime > this.config.saveInterval * 1000) {
        this.saveSession();
      }
    }
  }

  saveSession() {
    if (!this.currentSession || this.messages.length === 0) {
      return;
    }

    try {
      const dateDir = path.join(
        this.archivePath,
        'sessions',
        this.currentSession.date
      );

      if (!fs.existsSync(dateDir)) {
        fs.mkdirSync(dateDir, { recursive: true });
      }

      const sessionFile = path.join(
        dateDir,
        `${this.currentSession.id}.md`
      );

      // Generează conținutul markdown
      const content = this.generateMarkdown();
      
      fs.writeFileSync(sessionFile, content, 'utf8');

      // Salvează metadata
      const metadataFile = path.join(
        dateDir,
        `${this.currentSession.id}.json`
      );

      this.currentSession.endTime = new Date().toISOString();
      this.currentSession.messageCount = this.messages.length;
      
      fs.writeFileSync(metadataFile, JSON.stringify(this.currentSession, null, 2), 'utf8');

      // Actualizează index
      this.updateIndex();

      // Sincronizează în Dev-Files/CHAT_HISTORY/
      this.syncToDevFiles(sessionFile, content);

      this.lastSaveTime = Date.now();
      console.log(`💾 Session saved: ${this.currentSession.id}`);
      
      // Apelează scriptul de sincronizare extern (non-blocking)
      this.callSyncScript(sessionFile);
    } catch (error) {
      console.error('Error saving session:', error.message);
      this.logError(error);
    }
  }

  syncToDevFiles(sessionFile, content) {
    // Această metodă este acum delegată către sync-to-dev-files.js
    // Păstrăm-o pentru compatibilitate, dar logica reală e în script separat
  }

  callSyncScript(sessionFile) {
    // Apelează scriptul de sincronizare extern (non-blocking)
    try {
      const syncScriptPath = path.join(__dirname, 'sync-to-dev-files.js');
      if (fs.existsSync(syncScriptPath)) {
        // Rulează scriptul în background (non-blocking)
        exec(`node "${syncScriptPath}"`, { cwd: __dirname }, (error, stdout, stderr) => {
          if (error) {
            console.warn(`⚠️  Sync script error: ${error.message}`);
          } else {
            // Log doar dacă există output
            if (stdout.trim()) {
              console.log(`📋 Sync output: ${stdout.trim()}`);
            }
          }
        });
      }
    } catch (error) {
      console.warn(`⚠️  Could not call sync script: ${error.message}`);
    }
  }


  generateMarkdown() {
    const lines = [];
    
    // Header
    lines.push(`# Cursor Chat Session - ${this.currentSession.id}`);
    lines.push(`**Date:** ${this.currentSession.startTime}`);
    lines.push(`**Messages:** ${this.messages.length}`);
    lines.push('');

    // Tags
    if (this.currentSession.tags.length > 0) {
      lines.push(`**Tags:** ${this.currentSession.tags.join(', ')}`);
      lines.push('');
    }

    // Messages
    lines.push('## Conversation');
    lines.push('');

    this.messages.forEach((msg, idx) => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      const role = msg.type === 'user' ? '👤 User' : '🤖 Assistant';
      
      lines.push(`### ${role} - ${time}`);
      lines.push('');
      
      if (msg.type === 'assistant' && msg.code) {
        // Code block
        lines.push('```' + (msg.language || 'javascript'));
        lines.push(msg.code);
        lines.push('```');
        lines.push('');
      }
      
      lines.push(msg.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    // Files modified
    if (this.currentSession.files.length > 0) {
      lines.push('## Files Modified');
      lines.push('');
      this.currentSession.files.forEach(file => {
        lines.push(`- \`${file.path}\` (${file.action})`);
      });
      lines.push('');
    }

    // Context
    if (Object.keys(this.currentSession.context).length > 0) {
      lines.push('## Context');
      lines.push('');
      lines.push('```json');
      lines.push(JSON.stringify(this.currentSession.context, null, 2));
      lines.push('```');
    }

    return lines.join('\n');
  }

  updateIndex() {
    const indexFile = path.join(this.archivePath, 'index.json');
    let index = { sessions: [] };

    if (fs.existsSync(indexFile)) {
      try {
        index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
      } catch (error) {
        console.error('Error reading index:', error.message);
      }
    }

    // Adaugă sesiunea curentă
    const sessionEntry = {
      id: this.currentSession.id,
      date: this.currentSession.date,
      startTime: this.currentSession.startTime,
      endTime: this.currentSession.endTime || null,
      messageCount: this.currentSession.messageCount || 0,
      tags: this.currentSession.tags,
      path: `sessions/${this.currentSession.date}/${this.currentSession.id}.md`
    };

    // Verifică dacă există deja
    const existingIndex = index.sessions.findIndex(s => s.id === sessionEntry.id);
    if (existingIndex >= 0) {
      index.sessions[existingIndex] = sessionEntry;
    } else {
      index.sessions.push(sessionEntry);
    }

    // Sortează după dată (cel mai recent primul)
    index.sessions.sort((a, b) => 
      new Date(b.startTime) - new Date(a.startTime)
    );

    fs.writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf8');
  }

  startAutoSave() {
    this.watchInterval = setInterval(() => {
      if (this.messages.length > 0) {
        this.saveSession();
      }
    }, this.config.saveInterval * 1000);
  }

  startBlockDetection() {
    // Simulează detecția de blocare prin monitorizarea timpului
    // În producție, ar trebui să monitorizeze efectiv procesul Cursor
    setInterval(() => {
      if (this.isBlocked && this.config.enableRecovery) {
        const blockedDuration = (Date.now() - this.blockedSince) / 1000;
        if (blockedDuration > this.config.playwrightTimeout) {
          this.generateRecoveryPlan();
        }
      }
    }, 5000);
  }

  detectBlock() {
    if (!this.isBlocked) {
      this.isBlocked = true;
      this.blockedSince = Date.now();
      console.warn('⚠️  Possible block detected');
    }
  }

  clearBlock() {
    if (this.isBlocked) {
      this.isBlocked = false;
      this.blockedSince = null;
    }
  }

  generateRecoveryPlan() {
    if (!this.config.recovery?.generateRecoveryPlan) {
      return;
    }

    try {
      const recoveryFile = path.join(
        this.archivePath,
        'recovery-plan.md'
      );

      const lastMessages = this.messages.slice(-this.config.recovery.saveLastMessages || 10);
      
      const content = this.generateRecoveryMarkdown(lastMessages);
      
      fs.writeFileSync(recoveryFile, content, 'utf8');
      
      console.log('📋 Recovery plan generated:', recoveryFile);
      
      if (this.config.notifications) {
        this.showNotification('Recovery plan generated', recoveryFile);
      }
    } catch (error) {
      console.error('Error generating recovery plan:', error.message);
      this.logError(error);
    }
  }

  generateRecoveryMarkdown(lastMessages) {
    const lines = [];
    
    lines.push(`# Recovery Plan - Session ${this.currentSession.id}`);
    lines.push(`**Blocked at:** ${new Date().toISOString()}`);
    lines.push(`**Cause:** Playwright test timeout or Cursor block`);
    lines.push('');
    
    lines.push('## Context');
    lines.push(`- Working on: ${this.currentSession.tags.join(', ') || 'Unknown'}`);
    lines.push(`- Last command: Check recovery plan`);
    lines.push(`- Files modified: ${this.currentSession.files.length}`);
    if (this.currentSession.files.length > 0) {
      this.currentSession.files.forEach(file => {
        lines.push(`  - ${file.path} (${file.action})`);
      });
    }
    lines.push('');
    
    lines.push('## What was being done:');
    lines.push('');
    lastMessages.forEach((msg, idx) => {
      const role = msg.type === 'user' ? 'User' : 'Assistant';
      lines.push(`### ${role} (${idx + 1}/${lastMessages.length})`);
      lines.push('');
      lines.push(msg.content);
      lines.push('');
    });
    
    lines.push('## Recovery Steps:');
    lines.push('1. Review the last messages above');
    lines.push('2. Check if any files were in progress');
    lines.push('3. Resume from the last successful point');
    lines.push('4. If Playwright test failed, check test output');
    lines.push('');
    
    lines.push('## Useful context for new chat:');
    lines.push('');
    lines.push('```');
    lines.push('Last conversation context:');
    lines.push(JSON.stringify({
      session: this.currentSession.id,
      lastMessages: lastMessages.map(m => ({
        type: m.type,
        content: m.content.substring(0, 200) + '...'
      })),
      files: this.currentSession.files,
      tags: this.currentSession.tags
    }, null, 2));
    lines.push('```');
    
    return lines.join('\n');
  }

  detectTags(content) {
    if (!this.config.tags?.autoDetect) {
      return [];
    }

    const detectedTags = [];
    const keywords = this.config.tags.keywords || {};
    const lowerContent = content.toLowerCase();

    Object.keys(keywords).forEach(tag => {
      if (keywords[tag].some(keyword => lowerContent.includes(keyword))) {
        detectedTags.push(tag);
      }
    });

    return detectedTags;
  }

  addFile(path, action = 'modified') {
    this.currentSession.files.push({ path, action, timestamp: new Date().toISOString() });
  }

  logError(error) {
    const logFile = path.join(
      this.archivePath,
      'logs',
      `errors-${new Date().toISOString().split('T')[0]}.log`
    );

    const logEntry = `[${new Date().toISOString()}] ${error.message}\n${error.stack}\n\n`;
    
    fs.appendFileSync(logFile, logEntry, 'utf8');
  }

  showNotification(title, message) {
    // Pentru Windows
    if (process.platform === 'win32') {
      try {
        exec(`powershell -Command "New-BurntToastNotification -Text '${title}', '${message}'"`, (error) => {
          if (error) {
            // Fallback la console
            console.log(`📢 ${title}: ${message}`);
          }
        });
      } catch (error) {
        console.log(`📢 ${title}: ${message}`);
      }
    } else {
      console.log(`📢 ${title}: ${message}`);
    }
  }

  shutdown() {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
    }
    
    // Salvează sesiunea finală
    this.saveSession();
    
    console.log('👋 Cursor Archive System shutdown');
  }
}

// Export pentru utilizare ca modul
module.exports = CursorArchive;

// Dacă este rulat direct, pornește în mod watch
if (require.main === module) {
  const archive = new CursorArchive();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    archive.shutdown();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    archive.shutdown();
    process.exit(0);
  });
}

