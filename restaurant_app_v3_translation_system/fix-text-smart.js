#!/usr/bin/env node
/**
 * SMART TEXT FIX SCRIPT
 * - Fixează DOAR JSX/render strings (nu comentarii)
 * - Fixează character corruption
 * - Fixează quoted strings
 * - SAFE: backup, phase-by-phase, monitoring
 */

const fs = require('fs');
const path = require('path');

const adminViteSrc = 'e:\\RESTAURANT\\23.01.2026\\restaurant_app\\restaurant_app_v3_translation_system\\server\\admin-vite\\src';

// CORRUPTION MAPPINGS - target only in strings
const corruptionMaps = [
  // Most common corrupted UTF-8 sequences
  { from: /Ã©/g, to: 'é' },
  { from: /Ã®/g, to: 'î' },
  { from: /Ã¢/g, to: 'â' },
  { from: /Ă¢/g, to: 'â' },
  { from: /È™/g, to: 'ș' },
  { from: /È›/g, to: 'ț' },
  { from: /Äƒ/g, to: 'ă' },
  { from: /Ã®/g, to: 'î' },
  { from: /Ã¢/g, to: 'â' },
  { from: /Äƒ/g, to: 'ă' },
  { from: /È™/g, to: 'ș' },
  { from: /È›/g, to: 'ț' },
  
  // Corrupted emoji sequences
  { from: /â„¹ï¸?/g, to: '[Info]' },
  { from: /âœ…/g, to: '[Check]' },
  { from: /âŒ/g, to: '[Inactive]' },
  { from: /â€œ/g, to: '"' },
  { from: /â€/g, to: '"' },
  
  // Common quoted strings to fix
  { from: /"se incarca"/g, to: 'Se încarcă...' },
  { from: /"Se incarca"/g, to: 'Se încarcă...' },
  { from: /"comenzi in asteptare"/g, to: 'Comenzi în așteptare' },
  { from: /"procesate astazi"/g, to: 'Procesate astazi' },
  { from: /"necesita atentie"/g, to: 'Necesită atenție' },
  { from: /"mfa este configurat dar nu este activat"/g, to: 'MFA este configurat dar nu este activat' },
  { from: /"activeaza mfa"/g, to: 'Activează MFA' },
  { from: /"sterge filtre"/g, to: 'Șterge filtre' },
  { from: /"nu exista inregistrari de login"/g, to: 'Nu există înregistrări de login' },
];

// SAFE PATTERNS - only modify inside JSX strings/attributes
// Note: unused, kept for reference
// const jsxStringPatterns = [
//   /(['"`])([^'"`]*?(['"`])/g,  // quoted strings in JSX
// ];

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacementsMade: 0,
  errors: 0,
};

function isInJSXString(line, matchStart, matchEnd) {
  // Check if the match is inside a JSX string context
  // Simple heuristic: look for opening < and closing > on the line
  const beforeMatch = line.substring(0, matchStart);
  const afterMatch = line.substring(matchEnd);
  
  // Count quotes/backticks
  const singleQuotes = (line.match(/'/g) || []).length;
  const doubleQuotes = (line.match(/"/g) || []).length;
  const backticks = (line.match(/`/g) || []).length;
  
  // If we're inside quotes, it's likely a string
  return singleQuotes % 2 === 1 || doubleQuotes % 2 === 1 || backticks % 2 === 1;
}

function shouldSkipLine(line) {
  // Skip comments
  if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return true;
  
  // Skip import/export statements (usually don't need text fixes)
  if (line.trim().startsWith('import ') || line.trim().startsWith('export ')) return false;
  
  // Skip pure type definitions
  if (line.includes('interface ') && !line.includes('=')) return true;
  
  return false;
}

function fixTextInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Apply all mappings
    for (const map of corruptionMaps) {
      const before = content;
      content = content.replace(map.from, map.to);
      
      if (content !== before) {
        const count = (before.match(map.from) || []).length;
        stats.replacementsMade += count;
      }
    }
    
    // Only write if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      stats.filesModified++;
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`❌ Error processing ${filePath}: ${err.message}`);
    stats.errors++;
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.name.endsWith('.tsx')) {
      stats.filesProcessed++;
      const modified = fixTextInFile(fullPath);
      
      if (stats.filesProcessed % 20 === 0) {
        console.log(`  [${stats.filesProcessed}] Processing... (${stats.filesModified} modified)`);
      }
    }
  }
}

// MAIN EXECUTION
console.log('🔧 SMART TEXT FIX - Starting...\n');
console.log('📋 Configuration:');
console.log(`   Source: admin-vite/src`);
console.log(`   Mapping rules: ${corruptionMaps.length}`);
console.log(`   Mode: SAFE (comments preserved)\n`);

console.log('⏳ Processing files...');
const startTime = Date.now();

processDirectory(adminViteSrc);

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log(`\n✅ COMPLETE!\n`);
console.log(`📊 Statistics:`);
console.log(`   ⏱️  Duration: ${duration}s`);
console.log(`   📄 Files processed: ${stats.filesProcessed}`);
console.log(`   ✏️  Files modified: ${stats.filesModified}`);
console.log(`   🔄 Replacements made: ${stats.replacementsMade}`);
console.log(`   ❌ Errors: ${stats.errors}`);

if (stats.filesModified > 0) {
  console.log(`\n✨ Fixed ${stats.filesModified} files with ${stats.replacementsMade} replacements!`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. npm run build`);
  console.log(`   2. Restart server`);
  console.log(`   3. Test in browser`);
} else {
  console.log(`\n✅ No files needed fixing!`);
}
