#!/usr/bin/env node

/**
 * Cursor Archive CLI Tool
 * Comenzi pentru managementul arhivei de conversații
 */

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const CursorArchive = require('./index');

const program = new Command();

program
  .name('cursor-archive')
  .description('Sistem de arhivare automată pentru conversațiile Cursor')
  .version('1.0.0');

// Comandă: init
program
  .command('init')
  .description('Inițializează sistemul de arhivare în proiectul curent')
  .action(() => {
    console.log('🚀 Initializing Cursor Archive System...');
    
    const configPath = '.cursor-archive-config.json';
    if (!fs.existsSync(configPath)) {
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
      
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log('✅ Config file created:', configPath);
    }
    
    const archive = new CursorArchive();
    console.log('✅ Cursor Archive System initialized!');
  });

// Comandă: save
program
  .command('save')
  .description('Salvează manual sesiunea curentă')
  .action(() => {
    const archive = new CursorArchive();
    archive.saveSession();
    console.log('✅ Session saved');
  });

// Comandă: search
program
  .command('search <query>')
  .description('Caută în arhivă după query')
  .option('-t, --tag <tag>', 'Filtrează după tag')
  .option('-d, --date <date>', 'Filtrează după dată (YYYY-MM-DD)')
  .action((query, options) => {
    const archivePath = '.cursor-archive';
    const indexFile = path.join(archivePath, 'index.json');
    
    if (!fs.existsSync(indexFile)) {
      console.log('❌ No archive found. Run "cursor-archive init" first.');
      return;
    }
    
    const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    let results = index.sessions || [];
    
    // Filtrare după tag
    if (options.tag) {
      results = results.filter(s => s.tags && s.tags.includes(options.tag));
    }
    
    // Filtrare după dată
    if (options.date) {
      results = results.filter(s => s.date === options.date);
    }
    
    // Căutare în conținut
    if (query) {
      results = results.filter(session => {
        const sessionFile = path.join(archivePath, session.path);
        if (fs.existsSync(sessionFile)) {
          const content = fs.readFileSync(sessionFile, 'utf8');
          return content.toLowerCase().includes(query.toLowerCase());
        }
        return false;
      });
    }
    
    console.log(`\n🔍 Found ${results.length} session(s):\n`);
    results.slice(0, 10).forEach(session => {
      console.log(`📄 ${session.id}`);
      console.log(`   Date: ${session.date}`);
      console.log(`   Messages: ${session.messageCount}`);
      console.log(`   Tags: ${session.tags?.join(', ') || 'none'}`);
      console.log(`   Path: ${session.path}`);
      console.log('');
    });
  });

// Comandă: recover
program
  .command('recover')
  .description('Generează plan de recovery')
  .option('-l, --last', 'Recovery pentru ultima sesiune')
  .option('-s, --session <id>', 'Recovery pentru sesiune specifică')
  .action((options) => {
    const archivePath = '.cursor-archive';
    
    if (options.last) {
      const recoveryFile = path.join(archivePath, 'recovery-plan.md');
      if (fs.existsSync(recoveryFile)) {
        console.log('📋 Recovery plan found:');
        console.log(fs.readFileSync(recoveryFile, 'utf8'));
      } else {
        console.log('❌ No recovery plan found. Generating new one...');
        const archive = new CursorArchive();
        archive.generateRecoveryPlan();
      }
    } else if (options.session) {
      const indexFile = path.join(archivePath, 'index.json');
      if (!fs.existsSync(indexFile)) {
        console.log('❌ No archive found.');
        return;
      }
      
      const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
      const session = index.sessions.find(s => s.id === options.session);
      
      if (!session) {
        console.log(`❌ Session ${options.session} not found.`);
        return;
      }
      
      const sessionFile = path.join(archivePath, session.path);
      if (fs.existsSync(sessionFile)) {
        console.log('📋 Session content:');
        console.log(fs.readFileSync(sessionFile, 'utf8'));
      }
    } else {
      console.log('❌ Please specify --last or --session <id>');
    }
  });

// Comandă: export
program
  .command('export')
  .description('Exportă conversație în format diferit')
  .requiredOption('-s, --session <id>', 'ID sesiune')
  .option('-f, --format <format>', 'Format (html, pdf, json)', 'html')
  .action((options) => {
    const archivePath = '.cursor-archive';
    const indexFile = path.join(archivePath, 'index.json');
    
    if (!fs.existsSync(indexFile)) {
      console.log('❌ No archive found.');
      return;
    }
    
    const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    const session = index.sessions.find(s => s.id === options.session);
    
    if (!session) {
      console.log(`❌ Session ${options.session} not found.`);
      return;
    }
    
    const sessionFile = path.join(archivePath, session.path);
    if (!fs.existsSync(sessionFile)) {
      console.log(`❌ Session file not found: ${sessionFile}`);
      return;
    }
    
    const content = fs.readFileSync(sessionFile, 'utf8');
    const exportDir = path.join(archivePath, 'exports');
    
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    if (options.format === 'html') {
      const html = generateHTML(content, session);
      const htmlFile = path.join(exportDir, `${options.session}.html`);
      fs.writeFileSync(htmlFile, html, 'utf8');
      console.log(`✅ Exported to: ${htmlFile}`);
    } else if (options.format === 'json') {
      const metadata = JSON.parse(
        fs.readFileSync(
          path.join(archivePath, session.path.replace('.md', '.json')),
          'utf8'
        )
      );
      const jsonFile = path.join(exportDir, `${options.session}.json`);
      fs.writeFileSync(jsonFile, JSON.stringify(metadata, null, 2), 'utf8');
      console.log(`✅ Exported to: ${jsonFile}`);
    } else {
      console.log(`❌ Format ${options.format} not supported yet.`);
    }
  });

// Comandă: stats
program
  .command('stats')
  .description('Afișează statistici despre arhivă')
  .option('-p, --period <period>', 'Perioadă (day, week, month)', 'week')
  .action((options) => {
    const archivePath = '.cursor-archive';
    const indexFile = path.join(archivePath, 'index.json');
    
    if (!fs.existsSync(indexFile)) {
      console.log('❌ No archive found.');
      return;
    }
    
    const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    const sessions = index.sessions || [];
    
    const now = new Date();
    let cutoffDate;
    
    switch (options.period) {
      case 'day':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0);
    }
    
    const filteredSessions = sessions.filter(s => 
      new Date(s.startTime) >= cutoffDate
    );
    
    const totalMessages = filteredSessions.reduce((sum, s) => sum + (s.messageCount || 0), 0);
    const totalSessions = filteredSessions.length;
    
    // Tag statistics
    const tagCounts = {};
    filteredSessions.forEach(s => {
      (s.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    console.log('\n📊 Archive Statistics');
    console.log('='.repeat(50));
    console.log(`Period: ${options.period}`);
    console.log(`Total Sessions: ${totalSessions}`);
    console.log(`Total Messages: ${totalMessages}`);
    console.log(`Average Messages/Session: ${(totalMessages / totalSessions || 0).toFixed(1)}`);
    console.log('\n📌 Tags:');
    Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tag, count]) => {
        console.log(`   ${tag}: ${count}`);
      });
    console.log('');
  });

// Comandă: list
program
  .command('list')
  .description('Listează toate sesiunile')
  .option('-n, --number <n>', 'Număr de sesiuni de afișat', '10')
  .action((options) => {
    const archivePath = '.cursor-archive';
    const indexFile = path.join(archivePath, 'index.json');
    
    if (!fs.existsSync(indexFile)) {
      console.log('❌ No archive found.');
      return;
    }
    
    const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    const sessions = (index.sessions || []).slice(0, parseInt(options.number));
    
    console.log(`\n📚 Last ${sessions.length} sessions:\n`);
    sessions.forEach((session, idx) => {
      console.log(`${idx + 1}. ${session.id}`);
      console.log(`   Date: ${session.date} ${session.startTime.split('T')[1].substring(0, 5)}`);
      console.log(`   Messages: ${session.messageCount}`);
      console.log(`   Tags: ${session.tags?.join(', ') || 'none'}`);
      console.log('');
    });
  });

// Helper function pentru generare HTML
function generateHTML(markdown, session) {
  // Simplificat - în producție ar trebui să folosească un parser markdown
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${session.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; }
    h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
    h2 { margin-top: 30px; color: #555; }
  </style>
</head>
<body>
  <h1>${session.id}</h1>
  <p><strong>Date:</strong> ${session.startTime}</p>
  <p><strong>Messages:</strong> ${session.messageCount}</p>
  <hr>
  <div>${markdown.replace(/\n/g, '<br>').replace(/```/g, '<pre>')}</div>
</body>
</html>`;
}

program.parse();

