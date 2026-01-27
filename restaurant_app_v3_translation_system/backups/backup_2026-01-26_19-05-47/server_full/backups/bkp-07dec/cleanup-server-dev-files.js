#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DEV_FILES = path.join(ROOT, 'Dev-Files');

const filesToMove = {
    'Dev-Files/03-Teste': [
        /^test[_-]/,
        /test.*\.(log|json)$/,
        'test_2_comenzi_complete.js',
        'test_comanda_completa_sistem.js',
        'test_complete_ftp_flow.js',
        'test_final_scadere_stoc.js',
        'test_new_grouping_logic.js',
        'test_order_simple.js',
        'test_shaorma_complete.js',
        'test_shaorma_simple.js',
        'test-output.log',
        'test-results-complete.json',
        'test-results-comprehensive.json'
    ],
    'Dev-Files/05-Scripturi-Temporare': [
        /^(actualizeaza|check[_-]|debug[_-]|demo-|analyze-|extract[_-]|map-|mark-|creeaza|verifica|insert-|list-|run-|update-|raport_|fisa_)/,
        /\.(py|ps1|bat|vbs)$/,
        /^(clean-|clear-|copy-)/,
        'jest.config.js',
        'jest.setup.js',
        'playwright.config.js',
        'playwright-login-helper.js',
        'ORGANIZARE-FISIERE-DEV.js',
        'safe-modify.js',
        'translation-helper.js',
        'redis-cache.js',
        'swagger-docs.js',
        'swagger.js',
        'ngrok.exe',
        'ngrok.zip',
        'ingredients-missing-nutrition.csv',
        'fiscal-config.properties',
        'image-category-mapping-final.json',
        'image-category-mapping.json',
        'image-downloader.js',
        'missing-translations.json',
        'MISSING-REACT-MODULES.json',
        'rename-images.json',
        /TEXTE.*\.(txt|csv)$/,
        'extra_options_translations.json'
    ],
    'Dev-Files/07-Backups': [
        /^temp[_-]/,
        /^gemini-/,
        /^load-test/,
        /restaurant.*FULL.*BACKUP/,
        /\.backup/,
        /restaurant\.db[.-]/,
        'restaurant-FULL-BACKUP-2025-10-25-1458.db',
        'restaurant.db.BACKUP-2025-10-29',
        'database.js.backup-2025-10-29',
        'server.js.backup-2025-10-29',
        'server.js.backup-cleanup-redis-29-oct-2025',
        'package.json.backup-cleanup-redis-29-oct-2025',
        'README.md.backup_2025-10-01_21-59-02',
        'MANUAL_INSTRUCTIONS.md.backup_2025-10-01_21-59-02'
    ],
    'Dev-Files/01-Rapoarte': [
        /\.(log|txt)$/,
        'verify-report.txt',
        'final-report.txt',
        'update_status.txt'
    ],
    'Dev-Files/06-Documentatie-Dev': [
        'IMPLEMENTARI-ASTAZI.md',
        'IMPLEMENTATION-INGREDIENTS-NUTRITION.md',
        'INSTRUCTIUNI-TESTARE-TEME.html',
        'README_TESTARE_COMPLETA.md',
        'README-COMPLETARE-INGREDIENTE.md',
        'VALIDARE-MANUALA-INGREDIENTE.md',
        'EXPLICATIE-SISTEM-STOCURI.md',
        'OPTIMIZARE-PERFORMANTA-ADMIN-V4.md',
        'GESTIUNI-TEMPLATES-ARCHITECTURE.md',
        'GESTIUNI-ZONE-MESE-IMPLEMENTARE-03-NOV-2025.md',
        'SMART-DEFAULT-ORDERS-03-NOV-2025.md',
        'INTEGRARE-CONDOR-POS.md',
        'INTEGRARE-POS-EXISTENT.md',
        'RECOMANDARI-POS-CLOUD-CONTABO.md',
        'RESTAURANT-APP-TRANSMITATOR-COMENZI-CONDOR.md',
        'SOLUTII-SINCRONIZARE-STOCURI-CONDOR.md',
        'CASA-FISCALA-INTEGRARE-ANAF.md',
        'REDENUMIRE-BACKUP-COMPLETA.md',
        'REGULI-BACKUPS.md',
        'REGULI-DEZVOLTARE-OBLIGATORII.md',
        'AUTO-RESTART-README.txt'
    ],
    'Dev-Files/04-Analize': [
        'superiority-demo.js',
        'technical-superiority.js',
        'detailed-feature-comparison.js'
    ]
};

// Exclude files (production)
const excludePatterns = [
    /^server\.js$/,
    /^package.*\.json$/,
    /^ecosystem\.config\.js$/,
    /^database\.js$/,
    /^logger\.js$/,
    /^queue\.js$/,
    /^in-memory-queue\.js$/,
    /^backup-system\.js$/,
    /^auto-populate-stocks\.js$/,
    /^ingredient-similarity-checker\.js$/,
    /^bi-helpers\.js$/,
    /^nutritionApi\.js$/,
    /^kpi-registry\.js$/,
    /^health-monitor\.js$/,
    /^allergens-config\.js$/,
    /^database-protection\.js$/,
    /^database-white-label\.sql$/,
    /^Dockerfile/,
    /^docker-compose/,
    /^\.env/
];

function shouldExclude(filename) {
    return excludePatterns.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(filename);
        }
        return filename === pattern;
    });
}

function matchesPattern(filename, patterns) {
    return patterns.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(filename);
        }
        return filename === pattern;
    });
}

let totalMoved = 0;

console.log('\n🔄 CURĂȚARE FIȘIERE DEV DIN SERVER...\n');

// Citește toate fișierele din root
const files = fs.readdirSync(ROOT).filter(item => {
    const itemPath = path.join(ROOT, item);
    return fs.statSync(itemPath).isFile();
});

console.log(`📊 Total fișiere în root: ${files.length}\n`);

// Pentru fiecare categorie
for (const [destination, patterns] of Object.entries(filesToMove)) {
    const destPath = path.join(ROOT, destination);
    
    // Asigură-te că directorul există
    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
    }
    
    let movedInCategory = 0;
    
    for (const file of files) {
        if (shouldExclude(file)) continue;
        if (matchesPattern(file, patterns)) {
            const sourcePath = path.join(ROOT, file);
            const targetPath = path.join(destPath, file);
            
            try {
                fs.renameSync(sourcePath, targetPath);
                console.log(`  ✅ ${file} → ${destination.split('/')[1]}`);
                movedInCategory++;
                totalMoved++;
            } catch (err) {
                console.log(`  ⚠️  ${file}: ${err.message}`);
            }
        }
    }
    
    if (movedInCategory > 0) {
        console.log(`\n📦 ${destination.split('/')[1]}: ${movedInCategory} fișiere\n`);
    }
}

console.log('\n' + '='.repeat(50));
console.log(`✅ TOTAL MUTATE: ${totalMoved} fișiere`);
console.log('='.repeat(50) + '\n');

