#!/usr/bin/env node

/**
 * Sync to Dev-Files - Sincronizează conversațiile din .cursor-archive/sessions/ în Dev-Files/CHAT_HISTORY/
 * Rulează automat după fiecare salvare sau periodic
 */

const fs = require('fs');
const path = require('path');

class DevFilesSync {
  constructor() {
    // Căile către directoare
    const projectRoot = path.resolve(__dirname, '..');
    this.archivePath = path.join(projectRoot, '.cursor-archive', 'sessions');
    this.devFilesPath = path.join(projectRoot, 'Dev-Files', '06-Documentatie-Dev', 'CHAT_HISTORY');
    
    // Creează directorul Dev-Files dacă nu există
    if (!fs.existsSync(this.devFilesPath)) {
      fs.mkdirSync(this.devFilesPath, { recursive: true });
      console.log(`✅ Created directory: ${this.devFilesPath}`);
    }
  }

  /**
   * Sincronizează toate sesiunile din .cursor-archive/sessions/ în Dev-Files/CHAT_HISTORY/
   */
  syncAllSessions() {
    try {
      console.log('🔄 Starting sync to Dev-Files...');
      
      if (!fs.existsSync(this.archivePath)) {
        console.warn(`⚠️  Archive path does not exist: ${this.archivePath}`);
        return { synced: 0, errors: 0 };
      }

      // Găsește toate fișierele .md din sesiuni
      const sessionFiles = this.findSessionFiles(this.archivePath);
      console.log(`📁 Found ${sessionFiles.length} session files`);

      let synced = 0;
      let errors = 0;

      sessionFiles.forEach(sessionFile => {
        try {
          this.syncSessionFile(sessionFile);
          synced++;
        } catch (error) {
          console.error(`❌ Error syncing ${sessionFile}:`, error.message);
          errors++;
        }
      });

      console.log(`✅ Sync completed: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      console.error('❌ Error in syncAllSessions:', error.message);
      return { synced: 0, errors: 1 };
    }
  }

  /**
   * Găsește toate fișierele .md din directorul de sesiuni
   */
  findSessionFiles(dir) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursiv în subdirectoare
        files.push(...this.findSessionFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    });

    return files;
  }

  /**
   * Sincronizează un fișier de sesiune în Dev-Files
   */
  syncSessionFile(sessionFilePath) {
    const sessionContent = fs.readFileSync(sessionFilePath, 'utf8');
    const sessionFileName = path.basename(sessionFilePath);
    
    // Extrage data din cale (sessions/YYYY-MM-DD/session-id.md)
    const pathParts = sessionFilePath.split(path.sep);
    const dateIndex = pathParts.indexOf('sessions');
    if (dateIndex === -1 || dateIndex + 1 >= pathParts.length) {
      throw new Error(`Invalid session file path: ${sessionFilePath}`);
    }
    
    const dateStr = pathParts[dateIndex + 1]; // YYYY-MM-DD
    
    // Parsează data corect (YYYY-MM-DD)
    const [yearNum, monthNum, dayNum] = dateStr.split('-').map(Number);
    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) {
      throw new Error(`Invalid date format in path: ${dateStr}`);
    }
    const dateObj = new Date(yearNum, monthNum - 1, dayNum); // month - 1 pentru că Date folosește 0-11
    
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }

    // Formatează numele fișierului: chat-DD-MMM-YYYY.md
    const day = String(dateObj.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const chatFileName = `chat-${day}-${month}-${year}.md`;
    const chatFilePath = path.join(this.devFilesPath, chatFileName);

    // Generează conținutul pentru Dev-Files
    const devFilesContent = this.convertToDevFilesFormat(sessionContent, sessionFileName, dateStr);

    // Dacă fișierul există deja, adaugă la el cu separator
    if (fs.existsSync(chatFilePath)) {
      const existingContent = fs.readFileSync(chatFilePath, 'utf8');
      
      // Verifică dacă sesiunea există deja în fișier (evită duplicate)
      if (existingContent.includes(`Sesiune: ${sessionFileName.replace('.md', '')}`)) {
        console.log(`⏭️  Session already exists in ${chatFileName}, skipping...`);
        return;
      }
      
      const separator = '\n\n---\n\n## Continuare Sesiune\n\n';
      const updatedContent = existingContent + separator + devFilesContent;
      fs.writeFileSync(chatFilePath, updatedContent, 'utf8');
      console.log(`🔄 Updated: ${chatFileName}`);
    } else {
      // Creează fișier nou cu header complet
      const headerContent = this.generateDevFilesHeader(dateObj) + '\n\n' + devFilesContent;
      fs.writeFileSync(chatFilePath, headerContent, 'utf8');
      console.log(`✅ Created: ${chatFileName}`);
    }
  }

  /**
   * Generează header-ul pentru fișierul Dev-Files
   */
  generateDevFilesHeader(dateObj) {
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    const monthNames = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 
                        'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
    const monthStr = monthNames[dateObj.getMonth()];
    const yearStr = dateObj.getFullYear();
    
    return `# Chat History - ${dayStr} ${monthStr} ${yearStr}

## Sesiune de Lucru

**Data:** ${dayStr} ${monthStr} ${yearStr}

---
`;
  }

  /**
   * Convertește conținutul unei sesiuni în formatul Dev-Files
   */
  convertToDevFilesFormat(sessionContent, sessionFileName, dateStr) {
    const lines = [];
    const sessionId = sessionFileName.replace('.md', '');
    
    lines.push(`### Sesiune: ${sessionId}`);
    lines.push(`**Data sincronizare:** ${new Date().toLocaleString('ro-RO')}`);
    lines.push('');
    lines.push(sessionContent);
    lines.push('');
    lines.push('---');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Sincronizează o sesiune specifică (apelată după salvare)
   */
  syncSession(sessionFilePath) {
    try {
      if (!fs.existsSync(sessionFilePath)) {
        console.warn(`⚠️  Session file does not exist: ${sessionFilePath}`);
        return false;
      }

      this.syncSessionFile(sessionFilePath);
      return true;
    } catch (error) {
      console.error(`❌ Error syncing session ${sessionFilePath}:`, error.message);
      return false;
    }
  }
}

// Dacă este rulat direct, sincronizează toate sesiunile
if (require.main === module) {
  const sync = new DevFilesSync();
  sync.syncAllSessions();
}

module.exports = DevFilesSync;
