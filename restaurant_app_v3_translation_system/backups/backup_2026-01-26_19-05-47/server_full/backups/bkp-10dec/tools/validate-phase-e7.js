/**
 * PHASE E7 VALIDATION SCRIPT
 * 
 * Validates that all SAFE modules have been correctly migrated to enterprise structure.
 * 
 * Checks:
 * - Directory structure (controllers, routes, services, models)
 * - Route files exist
 * - Controller files exist
 * - Loader imports all modules
 * - No duplicate mounts in server.js
 * - Old mounts are commented
 */

const fs = require('fs');
const path = require('path');

const SAFE_MODULES = [
  { name: 'variance', route: '/api/variance' },
  { name: 'technical-sheets', route: '/api/technical-sheets' },
  { name: 'recalls', route: '/api/recalls' },
  { name: 'expiry-alerts', route: '/api/expiry-alerts' },
  { name: 'portions', route: '/api/portions' },
  { name: 'smart-restock', route: '/api/smart-restock-v2' },
  { name: 'hostess', route: '/api/hostess' },
  { name: 'lostfound', route: '/api/lostfound' },
  { name: 'coatroom', route: '/api/coatroom' },
  { name: 'laundry', route: '/api/laundry' },
  { name: 'reports', route: '/api/reports' }
];

const MODULES_DIR = path.join(__dirname, '..', 'src', 'modules');
const LOADER_PATH = path.join(__dirname, '..', 'src', 'loaders', 'routes.js');
const SERVER_PATH = path.join(__dirname, '..', 'server.js');

let errors = [];
let warnings = [];
let passed = [];

console.log('🔍 PHASE E7 VALIDATION - Starting...\n');

// ========================================
// CHECK 1: Directory Structure
// ========================================
console.log('📁 CHECK 1: Directory Structure');
for (const module of SAFE_MODULES) {
  const moduleDir = path.join(MODULES_DIR, module.name);
  const routesFile = path.join(moduleDir, 'routes.js');
  const controllersDir = path.join(moduleDir, 'controllers');
  const servicesDir = path.join(moduleDir, 'services');
  const modelsFile = path.join(moduleDir, 'models', 'index.js');
  
  if (!fs.existsSync(moduleDir)) {
    errors.push(`❌ Module directory missing: ${module.name}`);
    continue;
  }
  
  if (!fs.existsSync(routesFile)) {
    errors.push(`❌ Routes file missing: ${module.name}/routes.js`);
  } else {
    passed.push(`✅ Routes file exists: ${module.name}/routes.js`);
  }
  
  if (!fs.existsSync(controllersDir)) {
    errors.push(`❌ Controllers directory missing: ${module.name}/controllers/`);
  } else {
    const controllerFiles = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));
    if (controllerFiles.length === 0) {
      warnings.push(`⚠️  No controller files in: ${module.name}/controllers/`);
    } else {
      passed.push(`✅ Controllers exist: ${module.name}/controllers/ (${controllerFiles.length} files)`);
    }
  }
  
  if (!fs.existsSync(servicesDir)) {
    warnings.push(`⚠️  Services directory missing: ${module.name}/services/ (expected in PHASE E8)`);
  } else {
    passed.push(`✅ Services directory exists: ${module.name}/services/`);
  }
  
  if (!fs.existsSync(modelsFile)) {
    warnings.push(`⚠️  Models file missing: ${module.name}/models/index.js (expected in PHASE E8)`);
  } else {
    passed.push(`✅ Models file exists: ${module.name}/models/index.js`);
  }
}

// ========================================
// CHECK 2: Loader Routes
// ========================================
console.log('\n🔌 CHECK 2: Routes Loader');
if (!fs.existsSync(LOADER_PATH)) {
  errors.push(`❌ Loader file missing: src/loaders/routes.js`);
} else {
  const loaderContent = fs.readFileSync(LOADER_PATH, 'utf8');
  
  for (const module of SAFE_MODULES) {
    const moduleName = module.name === 'smart-restock' ? 'smart-restock' : module.name;
    const importPattern = new RegExp(`require\\(['"].*modules/${moduleName}/routes['"]\\)`, 'i');
    const mountPattern = new RegExp(`app\\.use\\(['"]${module.route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'i');
    
    if (!importPattern.test(loaderContent)) {
      errors.push(`❌ Import missing in loader: ${module.name}`);
    } else {
      passed.push(`✅ Import exists in loader: ${module.name}`);
    }
    
    if (!mountPattern.test(loaderContent)) {
      errors.push(`❌ Mount missing in loader: ${module.route}`);
    } else {
      passed.push(`✅ Mount exists in loader: ${module.route}`);
    }
  }
  
  // Check for duplicates
  const mountMatches = loaderContent.match(/app\.use\(['"]\/api\/[^'"]+['"]/g) || [];
  const mountCounts = {};
  mountMatches.forEach(mount => {
    mountCounts[mount] = (mountCounts[mount] || 0) + 1;
  });
  
  Object.entries(mountCounts).forEach(([mount, count]) => {
    if (count > 1) {
      errors.push(`❌ Duplicate mount in loader: ${mount} (${count} times)`);
    }
  });
}

// ========================================
// CHECK 3: Server.js Mounts
// ========================================
console.log('\n📝 CHECK 3: Server.js Mounts');
if (!fs.existsSync(SERVER_PATH)) {
  errors.push(`❌ Server file missing: server.js`);
} else {
  const serverContent = fs.readFileSync(SERVER_PATH, 'utf8');
  
  for (const module of SAFE_MODULES) {
    const route = module.route;
    const activeMountPattern = new RegExp(`^[^/]*app\\.use\\(['"]${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'm');
    const commentedMountPattern = new RegExp(`//.*app\\.use\\(['"]${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'm');
    
    const activeMatches = serverContent.match(activeMountPattern);
    const commentedMatches = serverContent.match(commentedMountPattern);
    
    if (activeMatches && activeMatches.length > 0) {
      errors.push(`❌ Active mount found in server.js (should be commented): ${route}`);
    } else if (commentedMatches && commentedMatches.length > 0) {
      passed.push(`✅ Old mount correctly commented: ${route}`);
    } else {
      warnings.push(`⚠️  No mount found (commented or active) for: ${route}`);
    }
  }
  
  // Check for attachRoutes call
  if (!/attachRoutes\(app\)/.test(serverContent)) {
    errors.push(`❌ attachRoutes(app) not called in server.js`);
  } else {
    passed.push(`✅ attachRoutes(app) called in server.js`);
  }
}

// ========================================
// CHECK 4: Route Files Content
// ========================================
console.log('\n📄 CHECK 4: Route Files Content');
for (const module of SAFE_MODULES) {
  const routesFile = path.join(MODULES_DIR, module.name, 'routes.js');
  
  if (fs.existsSync(routesFile)) {
    const content = fs.readFileSync(routesFile, 'utf8');
    
    if (!/module\.exports/.test(content)) {
      errors.push(`❌ Route file missing module.exports: ${module.name}/routes.js`);
    } else {
      passed.push(`✅ Route file exports correctly: ${module.name}/routes.js`);
    }
    
    if (!/require\(['"].*controllers/.test(content)) {
      warnings.push(`⚠️  Route file may not import controller: ${module.name}/routes.js`);
    }
  }
}

// ========================================
// RESULTS
// ========================================
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION RESULTS');
console.log('='.repeat(60));

if (passed.length > 0) {
  console.log(`\n✅ PASSED (${passed.length}):`);
  passed.forEach(p => console.log(`   ${p}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
  warnings.forEach(w => console.log(`   ${w}`));
}

if (errors.length > 0) {
  console.log(`\n❌ ERRORS (${errors.length}):`);
  errors.forEach(e => console.log(`   ${e}`));
  console.log('\n🔴 VALIDATION FAILED - Fix errors before proceeding to PHASE E8');
  process.exit(1);
} else {
  console.log('\n🟢 VALIDATION PASSED - All SAFE modules correctly migrated!');
  console.log('✅ Ready for PHASE E8 - CORE modules migration');
  process.exit(0);
}

