const fs = require('fs');
const path = require('path');

// Read translations
const translationsPath = path.join(__dirname, 'server', 'admin-vite', 'src', 'i18n', 'ro.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

console.log('Loaded translations:', Object.keys(translations).length);

// Function to replace translation keys in a file
function replaceTranslationKeys(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace pattern: 'namespace.key' with actual translation
  content = content.replace(/'([a-zA-Z_]+\.[a-zA-Z_]+)'/g, (match, key) => {
    if (translations[key]) {
      modified = true;
      console.log(`Replacing ${match} with "${translations[key]}"`);
      return `"${translations[key]}"`;
    }
    console.log(`No translation found for: ${key}`);
    return match; // Keep original if translation not found
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  }
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

console.log('🔄 Încep înlocuirea cheilor de traducere rămase cu text românesc...\n');

const srcDir = path.join(__dirname, 'server', 'admin-vite', 'src');
const files = findFiles(srcDir);

console.log(`Found ${files.length} files to process`);

let totalReplaced = 0;
files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Replace pattern: 'namespace.key' with actual translation
  const newContent = content.replace(/'([a-zA-Z_]+\.[a-zA-Z_]+)'/g, (match, key) => {
    if (translations[key]) {
      totalReplaced++;
      return `"${translations[key]}"`;
    }
    return match; // Keep original if translation not found
  });

  if (newContent !== originalContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Updated: ${path.relative(srcDir, filePath)}`);
  }
});

console.log(`\n✅ Finalizat! Am înlocuit ${totalReplaced} chei de traducere cu text românesc.`);