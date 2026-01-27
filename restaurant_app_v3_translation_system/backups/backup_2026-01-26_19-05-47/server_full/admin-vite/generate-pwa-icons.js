/**
 * Script pentru generarea iconurilor PWA din logo-ul QrOMS
 * Rulează: node generate-pwa-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verifică dacă sharp este instalat
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.error('❌ Sharp nu este instalat!');
  console.log('📦 Instalează sharp: npm install sharp --save-dev');
  console.log('   sau folosește un tool online pentru a redimensiona QrOMS.jpg');
  process.exit(1);
}

const publicDir = path.join(__dirname, 'public');
const logoPath = path.join(publicDir, 'QrOMS.jpg');
const icon192Path = path.join(publicDir, 'icon-192.png');
const icon512Path = path.join(publicDir, 'icon-512.png');

async function generateIcons() {
  try {
    // Verifică dacă logo-ul există
    if (!fs.existsSync(logoPath)) {
      console.error(`❌ Logo nu a fost găsit la: ${logoPath}`);
      process.exit(1);
    }

    console.log('🖼️  Generare iconuri PWA din QrOMS.jpg...');

    // Generează icon-192.png
    await sharp(logoPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(icon192Path);

    console.log('✅ icon-192.png creat');

    // Generează icon-512.png
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(icon512Path);

    console.log('✅ icon-512.png creat');
    console.log('\n🎉 Iconurile PWA au fost generate cu succes!');
    console.log('📱 Aplicația este gata pentru instalare pe mobil.');

  } catch (error) {
    console.error('❌ Eroare la generarea iconurilor:', error.message);
    process.exit(1);
  }
}

generateIcons();

