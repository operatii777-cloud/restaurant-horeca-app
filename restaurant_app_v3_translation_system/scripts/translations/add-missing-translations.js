/**
 * Add Missing Translations
 * Adaugă toate cheile lipsă din not-found-keys.txt în fișierul ro.json
 */

const fs = require('fs');
const path = require('path');

function addMissingTranslations() {
  const notFoundKeysFile = 'server/not-found-keys.txt';
  const translationsFile = 'server/admin-vite/src/i18n/ro.json';

  console.log('===============================================');
  console.log('ADD MISSING TRANSLATIONS');
  console.log('===============================================\n');

  try {
    // 1. Citește cheile lipsă
    console.log('Step 1: Reading missing keys...');
    const notFoundKeysContent = fs.readFileSync(notFoundKeysFile, 'utf8');
    const missingKeys = notFoundKeysContent.split('\n').filter(key => key.trim().length > 0);
    console.log(`Found ${missingKeys.length} missing keys\n`);

    // 2. Citește traducerile existente
    console.log('Step 2: Reading existing translations...');
    const translationsContent = fs.readFileSync(translationsFile, 'utf8');
    const translations = JSON.parse(translationsContent);
    console.log(`Loaded ${Object.keys(translations).length} existing translations\n`);

    // 3. Adaugă cheile lipsă în structura JSON
    console.log('Step 3: Adding missing keys to translations...');
    let addedCount = 0;

    missingKeys.forEach(key => {
      const parts = key.split('.');
      let current = translations;

      // Navighează prin structura nested până la penultima parte
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }

      // Adaugă ultima parte cu valoarea egală cu cheia (deoarece cheile par să fie deja în română)
      const lastPart = parts[parts.length - 1];
      if (!current[lastPart]) {
        // Pentru majoritatea cheilor, folosim cheia însăși ca valoare (aparent sunt deja în română)
        // Pentru cheile care conțin underscore, le convertim în spații
        const translationValue = lastPart.replace(/_/g, ' ');
        current[lastPart] = translationValue;
        addedCount++;
      }
    });

    console.log(`Added ${addedCount} new translations\n`);

    // 4. Salvează fișierul actualizat
    console.log('Step 4: Saving updated translations...');
    const updatedContent = JSON.stringify(translations, null, 2);
    fs.writeFileSync(translationsFile, updatedContent, 'utf8');

    console.log('✅ Translations file updated successfully!');
    console.log(`📊 Total translations now: ${Object.keys(translations).length}\n`);

    console.log('NEXT STEPS:');
    console.log('1. Review some of the added translations to ensure they are correct');
    console.log('2. Run the replacement script again:');
    console.log('   cd server && node replace-translation-keys.js');
    console.log('3. Test the application: npm run dev');

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  addMissingTranslations();
}