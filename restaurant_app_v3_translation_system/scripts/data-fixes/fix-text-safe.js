#!/usr/bin/env node
/**
 * SMART TEXT FIX SCRIPT v2
 * - Fixează DOAR corruption UTF-8 (Ã©, È™, etc)
 * - Preservă quotes și sintaxa JSX
 * - SAFE: nu modifică quoted strings
 */

const fs = require('fs');
const path = require('path');

const adminViteSrc = 'e:\\RESTAURANT\\23.01.2026\\restaurant_app\\restaurant_app_v3_translation_system\\server\\admin-vite\\src';

// ONLY UTF-8 CORRUPTION FIXES - NO QUOTED STRING REPLACEMENTS
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
  
  // Corrupted emoji sequences ONLY
  { from: /â„¹ï¸?/g, to: '[Info]' },
  { from: /âœ…/g, to: '[Check]' },
  { from: /âŒ/g, to: '[Inactive]' },
];

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacementsMade: 0,
  errors: 0,
};

function fixTextInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Apply only corruption mappings
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
      
      if (stats.filesProcessed % 50 === 0) {
        console.log(`  [${stats.filesProcessed}] Processing... (${stats.filesModified} modified)`);
      }
    }
  }
}

// MAIN EXECUTION
console.log('🔧 SMART TEXT FIX v2 - Starting...\n');
console.log('📋 Configuration:');
console.log(`   Source: admin-vite/src`);
console.log(`   Mapping rules: ${corruptionMaps.length} (UTF-8 corruption only)`);
console.log(`   Mode: SAFE (preserves quotes & JSX)\n`);

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
