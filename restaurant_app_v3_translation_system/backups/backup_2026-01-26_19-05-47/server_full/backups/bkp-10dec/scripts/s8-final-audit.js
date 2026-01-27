/**
 * PHASE S8 FINAL - Fiscal Structure Audit Script
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Verifies fiscal engine consolidation and identifies duplicate modules
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

console.log('\n🔍 S8 FINAL - Fiscal Structure Audit\n');
console.log('Restaurant App V3 powered by QrOMS\n');

const issues = [];
const warnings = [];

// 1. Check fiscal-engine exists
const fiscalEnginePath = path.join(SRC_DIR, 'fiscal-engine');
if (!fs.existsSync(fiscalEnginePath)) {
  issues.push('❌ fiscal-engine directory missing');
} else {
  console.log('✅ fiscal-engine directory exists');
  
  // Check required engines
  const requiredEngines = [
    'engine/fiscalEngine.ts',
    'engine/receiptEngine.ts',
    'engine/ublEngine.ts',
    'engine/tvaEngine.ts',
    'engine/stockEngine.ts',
    'engine/printerEngine.ts',
    'engine/saftEngine.ts',
    'engine/anafEngine.ts'
  ];
  
  requiredEngines.forEach(engine => {
    const enginePath = path.join(fiscalEnginePath, engine);
    if (fs.existsSync(enginePath)) {
      console.log(`  ✅ ${engine}`);
    } else {
      issues.push(`❌ Missing engine: ${engine}`);
    }
  });
  
  // Check adapters
  const requiredAdapters = [
    'adapters/tipizate.adapter.ts',
    'adapters/orders.adapter.ts',
    'adapters/inventory.adapter.ts',
    'adapters/cashRegister.adapter.ts'
  ];
  
  requiredAdapters.forEach(adapter => {
    const adapterPath = path.join(fiscalEnginePath, adapter);
    if (fs.existsSync(adapterPath)) {
      console.log(`  ✅ ${adapter}`);
    } else {
      warnings.push(`⚠️  Missing adapter: ${adapter}`);
    }
  });
}

// 2. Check for old modules (should NOT exist if fully consolidated)
const oldModules = [
  { path: path.join(SRC_DIR, 'modules', 'fiscal'), name: 'modules/fiscal', shouldExist: true }, // Still used by fiscal-engine
  { path: path.join(SRC_DIR, 'modules', 'fiscalizare'), name: 'modules/fiscalizare', shouldExist: false },
  { path: path.join(SRC_DIR, 'modules', 'fiscal-printer'), name: 'modules/fiscal-printer', shouldExist: false },
  { path: path.join(PROJECT_ROOT, 'routes', 'ubl-routes.js'), name: 'routes/ubl-routes.js', shouldExist: true }, // Proxy, OK
  { path: path.join(PROJECT_ROOT, 'utils', 'ubl-generator.js'), name: 'utils/ubl-generator.js', shouldExist: true } // Wrapper, OK
];

console.log('\n📦 Checking old modules:');
oldModules.forEach(module => {
  const exists = fs.existsSync(module.path);
  if (exists && !module.shouldExist) {
    warnings.push(`⚠️  Old module still exists: ${module.name} (consider removing if fully migrated)`);
    console.log(`  ⚠️  ${module.name} - EXISTS (should be removed if fully migrated)`);
  } else if (!exists && module.shouldExist) {
    issues.push(`❌ Required module missing: ${module.name}`);
    console.log(`  ❌ ${module.name} - MISSING`);
  } else if (exists && module.shouldExist) {
    console.log(`  ✅ ${module.name} - EXISTS (OK)`);
  } else {
    console.log(`  ✅ ${module.name} - NOT EXISTS (OK - removed)`);
  }
});

// 3. Check for duplicate imports
console.log('\n🔍 Scanning for duplicate imports...');
const filesToCheck = [
  path.join(SRC_DIR, 'modules', 'fiscal'),
  path.join(SRC_DIR, 'fiscal-engine'),
  path.join(SRC_DIR, 'modules', 'tipizate'),
  path.join(SRC_DIR, 'modules', 'tva'),
  path.join(SRC_DIR, 'modules', 'saft'),
  path.join(SRC_DIR, 'modules', 'anaf-submit'),
  path.join(SRC_DIR, 'modules', 'fiscal-codes')
];

function findFiles(dir, extensions = ['.js', '.ts'], fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findFiles(filePath, extensions, fileList);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const allFiles = [];
filesToCheck.forEach(dir => {
  if (fs.existsSync(dir)) {
    allFiles.push(...findFiles(dir));
  }
});

const oldImportPatterns = [
  /require\(['"]\.\.\/fiscalizare\//,
  /require\(['"]\.\.\/fiscal-printer\//,
  /from ['"]\.\.\/fiscalizare\//,
  /from ['"]\.\.\/fiscal-printer\//
];

let duplicateImports = 0;
allFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    oldImportPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        duplicateImports++;
        warnings.push(`⚠️  Old import pattern in ${path.relative(PROJECT_ROOT, file)}`);
      }
    });
  } catch (err) {
    // Skip binary files
  }
});

if (duplicateImports > 0) {
  console.log(`  ⚠️  Found ${duplicateImports} files with old import patterns`);
} else {
  console.log('  ✅ No old import patterns found');
}

// 4. Check module registry
console.log('\n📋 Checking module registry...');
const registryPath = path.join(SRC_DIR, 'modules', 'modules.registry.js');
if (fs.existsSync(registryPath)) {
  const registryContent = fs.readFileSync(registryPath, 'utf8');
  if (registryContent.includes('fiscal-engine')) {
    console.log('  ✅ fiscal-engine registered in module registry');
  } else {
    issues.push('❌ fiscal-engine not registered in module registry');
  }
} else {
  issues.push('❌ Module registry file missing');
}

// 5. Summary
console.log('\n' + '='.repeat(60));
console.log('📊 AUDIT SUMMARY');
console.log('='.repeat(60));

if (issues.length === 0 && warnings.length === 0) {
  console.log('\n✅ ALL CHECKS PASSED - Fiscal structure is clean!');
  process.exit(0);
} else {
  if (issues.length > 0) {
    console.log('\n❌ CRITICAL ISSUES:');
    issues.forEach(issue => console.log(`  ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`  ${warning}`));
  }
  
  console.log('\n💡 Run s8-fix-imports.js to fix import issues');
  process.exit(issues.length > 0 ? 1 : 0);
}

