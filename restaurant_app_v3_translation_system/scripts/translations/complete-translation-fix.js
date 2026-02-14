const fs = require('fs');
const path = require('path');

// Read translations
const translationsPath = path.join(__dirname, 'server', 'admin-vite', 'src', 'i18n', 'ro.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

console.log('🔄 Încep înlocuirea COMPLETĂ a tuturor cheilor de traducere...\n');

// Function to replace translation keys in a file
function replaceTranslationKeys(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace pattern: 'namespace.key' with actual translation
  content = content.replace(/'([a-zA-Z_]+\.[a-zA-Z_]+)'/g, (match, key) => {
    if (translations[key]) {
      modified = true;
      return `"${translations[key]}"`;
    }
    // If no translation found, keep original for debugging
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return modified;
}

// Find all TypeScript/TSX files
function findFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
          findFiles(filePath, fileList);
        } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
          fileList.push(filePath);
        }
      } catch (err) {
        // Skip files we can't access
      }
    });
  } catch (err) {
    // Skip directories we can't access
  }

  return fileList;
}

const srcDir = path.join(__dirname, 'server', 'admin-vite', 'src');
const files = findFiles(srcDir);

console.log(`📁 Procesăm ${files.length} fișiere...\n`);

let updatedFiles = 0;
let totalReplacements = 0;

files.forEach((filePath, index) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Count replacements in this file
    let replacementsInFile = 0;
    const newContent = content.replace(/'([a-zA-Z_]+\.[a-zA-Z_]+)'/g, (match, key) => {
      if (translations[key]) {
        replacementsInFile++;
        totalReplacements++;
        return `"${translations[key]}"`;
      }
      return match;
    });

    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      updatedFiles++;
      console.log(`✅ ${path.relative(srcDir, filePath)}: ${replacementsInFile} înlocuiri`);
    }

    // Progress indicator
    if ((index + 1) % 50 === 0) {
      console.log(`📊 Procesate ${index + 1}/${files.length} fișiere...`);
    }

  } catch (err) {
    console.log(`❌ Eroare la procesarea ${filePath}: ${err.message}`);
  }
});

console.log(`\n🎉 FINALIZAT COMPLET!`);
console.log(`📁 Fișiere actualizate: ${updatedFiles}`);
console.log(`🔄 Total înlocuiri: ${totalReplacements}`);
console.log(`📊 Traduceri disponibile: ${Object.keys(translations).length}`);
console.log(`\n✅ Acum trebuie să faci: npm run build:frontend && restart server`);