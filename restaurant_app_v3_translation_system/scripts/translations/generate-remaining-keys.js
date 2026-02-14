const fs = require('fs');
const path = require('path');

// Function to find all TypeScript/TSX files
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

// Function to extract translation keys from a file
function extractTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = [];
  const regex = /"([a-zA-Z_]+\.[a-zA-Z_]+)"|'([a-zA-Z_]+\.[a-zA-Z_]+)'/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    // match[1] este pentru ghilimele duble, match[2] pentru ghilimele simple
    const key = match[1] || match[2];
    keys.push(key);
  }

  return keys.length > 0 ? { filePath, keys } : null;
}

// Main function
function generateReport() {
  const srcDir = path.join(__dirname, 'server', 'admin-vite', 'src');
  const files = findFiles(srcDir);

  console.log(`📁 Procesăm ${files.length} fișiere...\n`);

  const results = [];
  let totalKeys = 0;

  files.forEach(filePath => {
    const result = extractTranslationKeys(filePath);
    if (result) {
      results.push(result);
      totalKeys += result.keys.length;
    }
  });

  // Sort by number of keys (descending)
  results.sort((a, b) => b.keys.length - a.keys.length);

  // Generate markdown report
  let markdown = '# Chei de Traducere Rămase în Cod\n\n';
  markdown += `**Total fișiere:** ${results.length}\n\n`;
  markdown += `**Total chei:** ${totalKeys}\n\n`;
  markdown += '**Generat la:** ' + new Date().toISOString() + '\n\n';

  markdown += '## Rezumat pe Categorii\n\n';

  // Group by prefix
  const categories = {};
  results.forEach(result => {
    result.keys.forEach(key => {
      const prefix = key.split('.')[0];
      if (!categories[prefix]) {
        categories[prefix] = { count: 0, files: new Set() };
      }
      categories[prefix].count++;
      categories[prefix].files.add(result.filePath);
    });
  });

  Object.keys(categories).sort().forEach(category => {
    const data = categories[category];
    markdown += `- **${category}**: ${data.count} chei în ${data.files.size} fișiere\n`;
  });

  markdown += '\n## Fișiere cu Chei de Traducere\n\n';

  results.forEach(result => {
    const relativePath = path.relative(srcDir, result.filePath).replace(/\\/g, '/');
    markdown += `### \`${relativePath}\` (${result.keys.length} chei)\n\n`;

    // Group keys by prefix for this file
    const fileCategories = {};
    result.keys.forEach(key => {
      const prefix = key.split('.')[0];
      if (!fileCategories[prefix]) {
        fileCategories[prefix] = [];
      }
      fileCategories[prefix].push(key);
    });

    Object.keys(fileCategories).forEach(prefix => {
      markdown += `**${prefix}:**\n`;
      fileCategories[prefix].forEach(key => {
        markdown += `- \`${key}\`\n`;
      });
      markdown += '\n';
    });

    markdown += '---\n\n';
  });

  // Write the markdown file
  fs.writeFileSync('remaining-translation-keys.md', markdown, 'utf8');

  console.log(`✅ Raport generat: remaining-translation-keys.md`);
  console.log(`📊 ${totalKeys} chei în ${results.length} fișiere`);
}

generateReport();