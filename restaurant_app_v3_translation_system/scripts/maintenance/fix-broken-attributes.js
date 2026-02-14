#!/usr/bin/env node
/**
 * FIX BROKEN ATTRIBUTES
 * Fixează attributes care au pierdut quotes
 * Ex: description=Se încarcă... → description='Se încarcă...'
 */

const fs = require('fs');
const path = require('path');

const adminViteSrc = 'e:\\RESTAURANT\\23.01.2026\\restaurant_app\\restaurant_app_v3_translation_system\\server\\admin-vite\\src';

// Fix patterns for broken attributes
const fixPatterns = [
  // description=Se încarcă... → description='Se încarcă...'
  { from: /description=Se ([^/\s>]+)/g, to: "description='Se $1" },
  // description=Afișează... → description='Afișează...'
  { from: /description=Afișe([^/\s>]+)/g, to: "description='Afișe$1" },
  // description=Gestionare...
  { from: /description=Gestionare([^/\s>]+)/g, to: "description='Gestionare$1" },
  // Any other unquoted description= pattern
  { from: /description=([A-Z][^/\s>]+)/g, to: "description='$1'" },
];

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacementsMade: 0,
  errors: 0,
};

function fixAttributesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Apply all fix patterns
    for (const pattern of fixPatterns) {
      const before = content;
      content = content.replace(pattern.from, pattern.to);
      
      if (content !== before) {
        const count = (before.match(pattern.from) || []).length;
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
      fixAttributesInFile(fullPath);
    }
  }
}

console.log('🔧 FIX BROKEN ATTRIBUTES\n');
console.log('📋 Configuration:');
console.log(`   Target: description attributes without quotes\n`);

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

if (stats.filesModified > 0) {
  console.log(`\n✨ Fixed ${stats.filesModified} attributes!`);
}
