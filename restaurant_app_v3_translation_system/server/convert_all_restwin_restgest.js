// convert_all_restwin_restgest.js
// Script pentru conversia tuturor fișierelor din Restwin și RestGest
// - DBF -> CSV (folosește node-dbf)
// - restul fișierelor: copiere directă

const fs = require('fs');
const path = require('path');
const { DBFFile } = require('dbffile');

const sources = [
  {
    src: path.join(__dirname, 'Restwin'),
    dest: path.join(__dirname, 'Restwin_converted'),
  },
  {
    src: path.join(__dirname, 'RestGest'),
    dest: path.join(__dirname, 'RestGest_converted'),
  },
];

async function convertDBFtoCSV(dbfPath, csvPath) {
  try {
    const dbf = await DBFFile.open(dbfPath);
    const records = await dbf.readRecords();
    if (records.length === 0) {
      fs.writeFileSync(csvPath, '');
      return;
    }
    const headers = Object.keys(records[0]);
    const csv = [headers.join(',')].concat(
      records.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ).join('\n');
    fs.writeFileSync(csvPath, csv, 'utf8');
    console.log(`✔ Converted ${dbfPath} -> ${csvPath}`);
  } catch (err) {
    console.error(`✖ Error converting ${dbfPath}:`, err.message);
  }
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`✔ Copied ${src} -> ${dest}`);
}

async function processDir(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      await processDir(srcPath, destPath);
    } else if (file.toLowerCase().endsWith('.dbf')) {
      await convertDBFtoCSV(srcPath, destPath.replace(/\.dbf$/i, '.csv'));
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

(async () => {
  for (const { src, dest } of sources) {
    await processDir(src, dest);
  }
  console.log('=== Conversie completă Restwin & RestGest ===');
})();

// Pentru a rula: npm install dbffile && node convert_all_restwin_restgest.js
