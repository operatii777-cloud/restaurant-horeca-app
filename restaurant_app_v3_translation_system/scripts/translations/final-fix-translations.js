const fs = require('fs');
const path = require('path');

// Read translations
const translationsPath = path.join(__dirname, 'server', 'admin-vite', 'src', 'i18n', 'ro.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

console.log('🔄 Încep înlocuirea tuturor cheilor de traducere rămase...\n');

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
    // If no translation found, keep the original but remove quotes to show it's untranslated
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Find all TypeScript/TSX files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
      findFiles(filePath, fileList);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const srcDir = path.join(__dirname, 'server', 'admin-vite', 'src');
const files = findFiles(srcDir);

let updatedFiles = 0;
let totalReplacements = 0;

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Count replacements
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
});

console.log(`\n🎉 Finalizat!`);
console.log(`📁 Fișiere actualizate: ${updatedFiles}`);
console.log(`🔄 Total înlocuiri: ${totalReplacements}`);
console.log(`📊 Traduceri disponibile: ${Object.keys(translations).length}`);