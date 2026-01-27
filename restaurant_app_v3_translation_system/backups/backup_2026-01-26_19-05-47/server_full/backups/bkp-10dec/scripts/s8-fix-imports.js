/**
 * PHASE S8 FINAL - Fix Import Script
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Automatically fixes old fiscal module imports to use fiscal-engine
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

console.log('\n🔧 S8 FINAL - Fixing Imports\n');
console.log('Restaurant App V3 powered by QrOMS\n');

function findFiles(dir, extensions = ['.js', '.ts'], fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      findFiles(filePath, extensions, fileList);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Import replacement mappings
const importReplacements = [
  {
    // Old: require('../fiscalizare/...')
    // New: require('../../fiscal-engine/engine/...')
    pattern: /require\(['"]\.\.\/fiscalizare\/([^'"]+)['"]\)/g,
    replacement: (match, p1) => {
      // Map old fiscalizare paths to fiscal-engine
      if (p1.includes('fiscalizare.service')) {
        return `require('../../fiscal-engine/engine/receiptEngine')`;
      }
      return match; // Keep if no mapping
    }
  },
  {
    // Old: require('../fiscal-printer/...')
    // New: require('../../fiscal-engine/engine/printerEngine')
    pattern: /require\(['"]\.\.\/fiscal-printer\/([^'"]+)['"]\)/g,
    replacement: () => `require('../../fiscal-engine/engine/printerEngine')`
  },
  {
    // Old: from '../fiscalizare/...'
    // New: from '../../fiscal-engine/engine/...'
    pattern: /from ['"]\.\.\/fiscalizare\/([^'"]+)['"]/g,
    replacement: (match, p1) => {
      if (p1.includes('fiscalizare.service')) {
        return `from '../../fiscal-engine/engine/receiptEngine'`;
      }
      return match;
    }
  },
  {
    // Old: from '../fiscal-printer/...'
    // New: from '../../fiscal-engine/engine/printerEngine'
    pattern: /from ['"]\.\.\/fiscal-printer\/([^'"]+)['"]/g,
    replacement: () => `from '../../fiscal-engine/engine/printerEngine'`
  }
];

// Directories to scan
const scanDirs = [
  path.join(SRC_DIR, 'modules'),
  path.join(SRC_DIR, 'fiscal-engine'),
  path.join(PROJECT_ROOT, 'routes'),
  path.join(PROJECT_ROOT, 'utils')
];

let filesProcessed = 0;
let filesModified = 0;
let replacementsMade = 0;

scanDirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  
  const files = findFiles(dir);
  files.forEach(file => {
    filesProcessed++;
    
    try {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      
      importReplacements.forEach(({ pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
          const newContent = content.replace(pattern, replacement);
          if (newContent !== content) {
            content = newContent;
            modified = true;
            replacementsMade += matches.length;
          }
        }
      });
      
      if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        filesModified++;
        console.log(`  ✅ Fixed: ${path.relative(PROJECT_ROOT, file)}`);
      }
    } catch (err) {
      console.error(`  ❌ Error processing ${file}:`, err.message);
    }
  });
});

console.log('\n' + '='.repeat(60));
console.log('📊 FIX SUMMARY');
console.log('='.repeat(60));
console.log(`\n  Files processed: ${filesProcessed}`);
console.log(`  Files modified: ${filesModified}`);
console.log(`  Replacements made: ${replacementsMade}`);

if (filesModified > 0) {
  console.log('\n✅ Import fixes applied successfully!');
  console.log('💡 Review changes and test before committing');
} else {
  console.log('\n✅ No import fixes needed - all imports are up to date!');
}

process.exit(0);

