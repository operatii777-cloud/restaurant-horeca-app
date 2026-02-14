const fs = require('fs');
const path = require('path');

// Read translations
const translationsPath = path.join(__dirname, 'server', 'admin-vite', 'src', 'i18n', 'ro.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

console.log(`🔄 Încep înlocuirea FINALĂ COMPLETĂ - ${Object.keys(translations).length} traduceri disponibile\n`);

// Function to replace translation keys in a file
function replaceTranslationKeys(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let replacementsInFile = 0;

  // Replace each translation key
  Object.keys(translations).forEach(key => {
    const pattern = `'${key}'`;
    const replacement = `"${translations[key]}"`;

    // Use global regex to replace all occurrences
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const beforeLength = content.length;

    content = content.replace(regex, replacement);

    if (content.length !== beforeLength) {
      replacementsInFile += (beforeLength - content.length) / (pattern.length - replacement.length);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${path.relative(srcDir, filePath)}: ${Math.round(replacementsInFile)} înlocuiri`);
    return Math.round(replacementsInFile);
  }

  return 0;
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

console.log(`📁 Procesăm ${files.length} fișiere pentru toate cheile de traducere...\n`);

let updatedFiles = 0;
let totalReplacements = 0;
let processedFiles = 0;

files.forEach(filePath => {
  try {
    const replacements = replaceTranslationKeys(filePath);
    if (replacements > 0) {
      updatedFiles++;
      totalReplacements += replacements;
    }

    processedFiles++;
    if (processedFiles % 20 === 0) {
      console.log(`📊 Procesate ${processedFiles}/${files.length} fișiere... (${totalReplacements} înlocuiri totale)`);
    }

  } catch (err) {
    console.log(`❌ Eroare la ${path.relative(srcDir, filePath)}: ${err.message}`);
  }
});

console.log(`\n🎉 FINALIZAT COMPLET!`);
console.log(`📁 Fișiere actualizate: ${updatedFiles}`);
console.log(`🔄 Total înlocuiri: ${totalReplacements}`);
console.log(`\n✅ Următorul pas: npm run build:frontend && restart server`);