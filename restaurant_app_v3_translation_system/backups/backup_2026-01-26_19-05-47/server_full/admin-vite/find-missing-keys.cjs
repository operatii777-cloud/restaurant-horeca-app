// Script to find missing translation keys
const fs = require('fs');
const path = require('path');

// Current translations structure
const translations = {
  welcome: {},
  orders: {},
  catalog: {},
  menu: {},
  'daily-menu': {},
  stocks: {},
  allergens: {},
  enterprise: {},
  app: {},
  settings: {},
  archive: {},
  delivery: {},
  'platform-stats': {},
  reservations: {}
};

function extractKeysFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.matchAll(/t\('([^']+)'\)/g);
    const keys = [];
    for (const match of matches) {
      keys.push(match[1]);
    }
    return keys;
  } catch (error) {
    return [];
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  const allKeys = new Set();

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      const keys = walkDirectory(filePath);
      keys.forEach(key => allKeys.add(key));
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      const keys = extractKeysFromFile(filePath);
      keys.forEach(key => allKeys.add(key));
    }
  }

  return allKeys;
}

// Get all used keys
console.log('Finding all translation keys...');
const allUsedKeys = walkDirectory('./src');

// Find keys that are not in translations (no prefix)
const missingKeys = Array.from(allUsedKeys).filter(key => {
  // Skip keys that already have prefixes
  if (key.includes('.')) return false;

  // Skip keys that contain special characters or are already in translations
  return !translations[key] && key.includes('_');
});

console.log('Missing keys that need to be added:');
console.log(missingKeys.sort());