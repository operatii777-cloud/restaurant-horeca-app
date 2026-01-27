// Script simplu pentru scanarea textului
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function scanText() {
  console.log('🔍 Scanning for hardcoded text...\n');

  // Găsește toate fișierele TSX/TS
  const files = await new Promise((resolve, reject) => {
    glob('./src/**/*.{tsx,ts}', {
      ignore: ['**/node_modules/**', '**/*.d.ts']
    }, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });

  console.log(`📁 Found ${files.length} files\n`);

  let totalText = 0;
  let hardcodedText = 0;
  let uniqueTexts = new Set();

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');

    // Găsește text între ghilimele
    const textMatches = content.match(/["'`]([^"'`\n]{3,})["'`]/g) || [];

    for (const match of textMatches) {
      const text = match.slice(1, -1); // Remove quotes

      // Skip dacă e URL, path, class, etc.
      if (
        text.includes('http') ||
        text.includes('/') ||
        text.includes('.') && !text.includes(' ') ||
        /^[A-Z_]+$/.test(text) ||
        /^\d/.test(text)
      ) {
        continue;
      }

      // Skip dacă nu conține litere românești sau englezești
      if (!/[a-zăâîșțA-ZĂÂÎȘȚ]/.test(text)) {
        continue;
      }

      totalText++;
      uniqueTexts.add(text);

      // Dacă are ghilimele duble în interior, e hardcoded
      if (match.startsWith('"') && match.endsWith('"')) {
        hardcodedText++;
      }
    }
  }

  console.log('📊 RESULTS:');
  console.log(`   Total text pieces found: ${totalText}`);
  console.log(`   Unique texts: ${uniqueTexts.size}`);
  console.log(`   Hardcoded strings: ${hardcodedText}`);
  console.log(`   Translated strings: ${totalText - hardcodedText}`);

  // Salvează rezultatele
  const results = {
    stats: {
      totalText,
      uniqueTexts: uniqueTexts.size,
      hardcodedText,
      translatedText: totalText - hardcodedText
    },
    uniqueTexts: Array.from(uniqueTexts).sort()
  };

  fs.writeFileSync('./text-scan-results.json', JSON.stringify(results, null, 2));

  // Salvează lista de texte unice
  fs.writeFileSync('./unique-texts.txt', Array.from(uniqueTexts).sort().join('\n'));

  console.log('\n✅ Results saved to:');
  console.log('   - text-scan-results.json');
  console.log('   - unique-texts.txt');
}

// Run
scanText().catch(console.error);