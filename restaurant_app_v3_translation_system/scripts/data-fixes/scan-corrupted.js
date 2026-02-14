const fs = require('fs');
const path = require('path');

const adminViteSrc = 'e:\\RESTAURANT\\23.01.2026\\restaurant_app\\restaurant_app_v3_translation_system\\server\\admin-vite\\src';

const patterns = {
  corrupted_utf8: /[Èè™ÄäÃÎÅ€‚ƒ„†‡ˆ‰Š‹ŒÈÉÊËìíîïðñòóôõöøùúûüýþÿ]|â[Œ„]|ã|ÃŽ|Ã‰|Ã®|Ã©|ðŸ/,
  quoted_string: /"(se incarca|comenzi|procesate|necesita|mfa|activeaza|sterge|nu exista|configureaza|filtreaza|toate|inlocui)"/i,
};

const foundFiles = {};

function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      scanDir(fullPath);
    } else if (file.name.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, lineNum) => {
          for (const [issueType, pattern] of Object.entries(patterns)) {
            if (pattern.test(line)) {
              if (!foundFiles[fullPath]) foundFiles[fullPath] = [];
              foundFiles[fullPath].push({
                lineNum: lineNum + 1,
                issueType,
                snippet: line.trim().substring(0, 80)
              });
            }
          }
        });
      } catch (err) {
        console.error(`Error reading ${fullPath}:`, err.message);
      }
    }
  }
}

console.log('🔍 Scanning admin-vite for corrupted characters...\n');
scanDir(adminViteSrc);

if (Object.keys(foundFiles).length > 0) {
  console.log(`⚠️  Found issues in ${Object.keys(foundFiles).length} files:\n`);
  
  for (const [filePath, issues] of Object.entries(foundFiles)) {
    const relPath = filePath.replace(adminViteSrc, '').replace(/\\/g, '/');
    console.log(`\n📄 ${relPath}`);
    issues.slice(0, 5).forEach(({ lineNum, issueType, snippet }) => {
      console.log(`   Line ${lineNum}: [${issueType}] ${snippet}...`);
    });
    if (issues.length > 5) {
      console.log(`   ... and ${issues.length - 5} more`);
    }
  }
  console.log(`\n📊 Summary: ${Object.keys(foundFiles).length} files with issues`);
} else {
  console.log('✅ No corrupted characters found!');
}
