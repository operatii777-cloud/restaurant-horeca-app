const fs = require('fs');
const path = require('path');

console.log('🔄 Înlocuiesc toate cheile de traducere rămase cu textul cheii...\n');

// Function to replace translation keys in a file
function replaceTranslationKeys(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace all 'namespace.key' with "namespace.key" (remove single quotes, add double quotes)
  const originalContent = content;
  content = content.replace(/'([a-zA-Z_]+\.[a-zA-Z_]+)'/g, '"$1"');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    const replacements = (originalContent.match(/'[a-zA-Z_]+\.[a-zA-Z_]+'/g) || []).length;
    console.log(`✅ ${path.relative(srcDir, filePath)}: ${replacements} înlocuiri`);
    return replacements;
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

console.log(`📁 Procesăm ${files.length} fișiere...\n`);

let updatedFiles = 0;
let totalReplacements = 0;

files.forEach(filePath => {
  try {
    const replacements = replaceTranslationKeys(filePath);
    if (replacements > 0) {
      updatedFiles++;
      totalReplacements += replacements;
    }
  } catch (err) {
    console.log(`❌ Eroare la ${path.relative(srcDir, filePath)}: ${err.message}`);
  }
});

console.log(`\n🎉 FINALIZAT!`);
console.log(`📁 Fișiere actualizate: ${updatedFiles}`);
console.log(`🔄 Total înlocuiri: ${totalReplacements}`);
console.log(`\n✅ Următorul pas: npm run build:frontend && restart server`);