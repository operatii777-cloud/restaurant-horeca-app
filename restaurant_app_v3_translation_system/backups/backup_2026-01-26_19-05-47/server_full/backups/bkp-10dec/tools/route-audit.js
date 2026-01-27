/**
 * PHASE E9.1 - Full Route Audit Script
 * 
 * Scans the entire project to identify:
 * - All existing routes (legacy + enterprise)
 * - Legacy vs Enterprise mapping
 * - Front-end pages → API mapping
 * - Unused endpoints
 * - Duplicate endpoints
 * - Missing endpoints
 * 
 * Output: DEV-REPORTS/backend-route-audit.json + .md
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const DEV_REPORTS_DIR = path.join(PROJECT_ROOT, 'DEV-REPORTS');
const ROUTES_DIR = path.join(PROJECT_ROOT, 'routes');
const ENTERPRISE_MODULES_DIR = path.join(PROJECT_ROOT, 'src', 'modules');
const ADMIN_VITE_DIR = path.join(PROJECT_ROOT, 'admin-vite', 'src');
const SERVER_JS = path.join(PROJECT_ROOT, 'server.js');

// Ensure DEV-REPORTS directory exists
if (!fs.existsSync(DEV_REPORTS_DIR)) {
  fs.mkdirSync(DEV_REPORTS_DIR, { recursive: true });
}

const audit = {
  timestamp: new Date().toISOString(),
  legacyRoutes: [],
  enterpriseRoutes: [],
  frontendPages: [],
  apiEndpoints: [],
  routeMapping: {},
  duplicates: [],
  unused: [],
  missing: [],
  statistics: {}
};

/**
 * Scan legacy routes directory
 */
function scanLegacyRoutes() {
  console.log('📂 Scanning legacy routes...');
  
  if (!fs.existsSync(ROUTES_DIR)) {
    console.log('⚠️  routes/ directory not found');
    return;
  }

  function scanDirectory(dir, baseDir = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(baseDir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
      
          // Extract route definitions
          const routeMatches = content.matchAll(/app\.use\(['"]([^'"]+)['"],\s*([^)]+)\)/g);
          const routerMatches = content.matchAll(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g);
          
          for (const match of routeMatches) {
            audit.legacyRoutes.push({
              path: match[1],
              file: fullPath.replace(PROJECT_ROOT, ''),
              line: content.substring(0, match.index).split('\n').length,
              type: 'app.use'
            });
          }
          
          for (const match of routerMatches) {
            audit.legacyRoutes.push({
              method: match[1].toUpperCase(),
              path: match[2],
              file: fullPath.replace(PROJECT_ROOT, ''),
              line: content.substring(0, match.index).split('\n').length,
              type: 'router'
            });
          }
        } catch (err) {
          console.warn(`⚠️  Could not read ${fullPath}: ${err.message}`);
        }
      }
    });
  }
  
  scanDirectory(ROUTES_DIR);
  
  console.log(`✅ Found ${audit.legacyRoutes.length} legacy route definitions`);
}

/**
 * Scan enterprise modules
 */
function scanEnterpriseModules() {
  console.log('📂 Scanning enterprise modules...');
  
  if (!fs.existsSync(ENTERPRISE_MODULES_DIR)) {
    console.log('⚠️  src/modules/ directory not found');
    return;
  }

  const modules = fs.readdirSync(ENTERPRISE_MODULES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  modules.forEach(moduleName => {
    const routesFile = path.join(ENTERPRISE_MODULES_DIR, moduleName, 'routes.js');
    
    if (fs.existsSync(routesFile)) {
      const content = fs.readFileSync(routesFile, 'utf8');
      
      // Extract route definitions
      const routerMatches = content.matchAll(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g);
      
      const moduleRoutes = [];
      for (const match of routerMatches) {
        moduleRoutes.push({
          method: match[1].toUpperCase(),
          path: match[2],
          fullPath: `/api/${moduleName}${match[2] === '/' ? '' : match[2]}`,
          file: routesFile.replace(PROJECT_ROOT, ''),
          line: content.substring(0, match.index).split('\n').length
        });
      }
      
      if (moduleRoutes.length > 0) {
        audit.enterpriseRoutes.push({
          module: moduleName,
          basePath: `/api/${moduleName}`,
          routes: moduleRoutes,
          file: routesFile.replace(PROJECT_ROOT, '')
        });
      }
    }
  });
  
  console.log(`✅ Found ${audit.enterpriseRoutes.length} enterprise modules with ${audit.enterpriseRoutes.reduce((sum, m) => sum + m.routes.length, 0)} routes`);
}

/**
 * Scan server.js for route mounts
 */
function scanServerJs() {
  console.log('📂 Scanning server.js...');
  
  if (!fs.existsSync(SERVER_JS)) {
    console.log('⚠️  server.js not found');
    return;
  }

  const content = fs.readFileSync(SERVER_JS, 'utf8');
  
  // Find all app.use('/api/...') mounts
  const appUseMatches = content.matchAll(/app\.use\(['"]([^'"]+)['"],\s*([^)]+)\)/g);
  
  for (const match of appUseMatches) {
    const routePath = match[1];
    if (routePath.startsWith('/api/')) {
      audit.apiEndpoints.push({
        path: routePath,
        file: 'server.js',
        line: content.substring(0, match.index).split('\n').length,
        type: 'mount',
        router: match[2].trim()
      });
    }
  }
  
  // Find commented out routes (legacy migration markers)
  const commentedMatches = content.matchAll(/\/\/\s*(ENTERPRISE MIGRATION|SAFE FIX).*?app\.use\(['"]([^'"]+)['"]/g);
  
  for (const match of commentedMatches) {
    audit.legacyRoutes.push({
      path: match[2],
      file: 'server.js',
      line: content.substring(0, match.index).split('\n').length,
      type: 'commented',
      status: 'migrated'
    });
  }
  
  console.log(`✅ Found ${audit.apiEndpoints.length} route mounts in server.js`);
}

/**
 * Scan frontend pages (admin-vite)
 */
function scanFrontendPages() {
  console.log('📂 Scanning frontend pages...');
  
  if (!fs.existsSync(ADMIN_VITE_DIR)) {
    console.log('⚠️  admin-vite/src/ directory not found');
    return;
  }

  // Scan App.tsx for routes
  const appTsx = path.join(ADMIN_VITE_DIR, 'app', 'App.tsx');
  if (fs.existsSync(appTsx)) {
    const content = fs.readFileSync(appTsx, 'utf8');
    
    // Extract Route paths
    const routeMatches = content.matchAll(/<Route\s+path=["']([^"']+)["']/g);
    
    for (const match of routeMatches) {
      audit.frontendPages.push({
        path: match[1],
        file: 'admin-vite/src/app/App.tsx',
        type: 'route'
      });
    }
  }
  
  // Scan navigation.ts for menu items
  const navigationTs = path.join(ADMIN_VITE_DIR, 'modules', 'layout', 'constants', 'navigation.ts');
  if (fs.existsSync(navigationTs)) {
    const content = fs.readFileSync(navigationTs, 'utf8');
    
    // Extract navigation paths
    const navMatches = content.matchAll(/path:\s*["']([^"']+)["']/g);
    
    for (const match of navMatches) {
      if (!audit.frontendPages.find(p => p.path === match[1])) {
        audit.frontendPages.push({
          path: match[1],
          file: 'admin-vite/src/modules/layout/constants/navigation.ts',
          type: 'navigation'
        });
      }
    }
  }
  
  // Scan modules for API calls
  scanModuleApiCalls(ADMIN_VITE_DIR);
  
  console.log(`✅ Found ${audit.frontendPages.length} frontend pages/routes`);
}

/**
 * Scan modules for API calls to build frontend → backend mapping
 */
function scanModuleApiCalls(dir) {
  function scanDir(currentDir, baseDir = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.join(baseDir, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath, relativePath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
        
        // Find API calls (fetch, axios, api.get, etc.)
        const apiMatches = [
          ...content.matchAll(/fetch\(['"]([^'"]+)['"]/g),
          ...content.matchAll(/axios\.(get|post|put|delete)\(['"]([^'"]+)['"]/g),
          ...content.matchAll(/api\.(get|post|put|delete)\(['"]([^'"]+)['"]/g),
          ...content.matchAll(/['"](\/api\/[^'"]+)['"]/g)
        ];
        
          apiMatches.forEach(match => {
            const apiPath = match[1] || match[2] || match[1];
            if (apiPath && apiPath.startsWith('/api/')) {
              if (!audit.routeMapping[apiPath]) {
                audit.routeMapping[apiPath] = [];
              }
              audit.routeMapping[apiPath].push({
                frontendFile: fullPath.replace(PROJECT_ROOT, ''),
                context: extractContext(content, match.index)
              });
            }
          });
        } catch (err) {
          // Skip files that can't be read
        }
      }
    });
  }
  
  scanDir(dir);
}

/**
 * Extract context around a match (line before/after)
 */
function extractContext(content, index) {
  const lines = content.split('\n');
  const lineIndex = content.substring(0, index).split('\n').length - 1;
  const start = Math.max(0, lineIndex - 2);
  const end = Math.min(lines.length, lineIndex + 3);
  return lines.slice(start, end).join('\n');
}

/**
 * Analyze and find duplicates, unused, missing
 */
function analyzeRoutes() {
  console.log('🔍 Analyzing routes...');
  
  // Collect all API paths
  const allApiPaths = new Set();
  const pathCounts = {};
  
  // From enterprise routes
  audit.enterpriseRoutes.forEach(module => {
    module.routes.forEach(route => {
      const fullPath = `${route.method} ${route.fullPath}`;
      allApiPaths.add(fullPath);
      pathCounts[fullPath] = (pathCounts[fullPath] || 0) + 1;
    });
  });
  
  // From legacy routes
  audit.legacyRoutes.forEach(route => {
    if (route.path && route.path.startsWith('/api/')) {
      const method = route.method || 'ALL';
      const fullPath = `${method} ${route.path}`;
      allApiPaths.add(fullPath);
      pathCounts[fullPath] = (pathCounts[fullPath] || 0) + 1;
    }
  });
  
  // From server.js mounts
  audit.apiEndpoints.forEach(endpoint => {
    const fullPath = `ALL ${endpoint.path}`;
    allApiPaths.add(fullPath);
    pathCounts[fullPath] = (pathCounts[fullPath] || 0) + 1;
  });
  
  // Find duplicates
  Object.entries(pathCounts).forEach(([path, count]) => {
    if (count > 1) {
      audit.duplicates.push({
        path,
        count,
        locations: [
          ...audit.enterpriseRoutes
            .flatMap(m => m.routes)
            .filter(r => `${r.method} ${r.fullPath}` === path)
            .map(r => ({ type: 'enterprise', file: r.file, line: r.line })),
          ...audit.legacyRoutes
            .filter(r => r.path && `${r.method || 'ALL'} ${r.path}` === path)
            .map(r => ({ type: 'legacy', file: r.file, line: r.line })),
          ...audit.apiEndpoints
            .filter(e => `ALL ${e.path}` === path)
            .map(e => ({ type: 'mount', file: e.file, line: e.line }))
        ]
      });
    }
  });
  
  // Find unused (endpoints not called from frontend)
  allApiPaths.forEach(fullPath => {
    const [, path] = fullPath.split(' ', 2);
    if (!audit.routeMapping[path] || audit.routeMapping[path].length === 0) {
      audit.unused.push({
        path: fullPath,
        reason: 'No frontend calls found'
      });
    }
  });
  
  // Find missing (frontend calls but no backend endpoint)
  Object.keys(audit.routeMapping).forEach(apiPath => {
    const found = Array.from(allApiPaths).some(fullPath => {
      const [, path] = fullPath.split(' ', 2);
      return path === apiPath || path.startsWith(apiPath + '/');
    });
    
    if (!found) {
      audit.missing.push({
        path: apiPath,
        calledFrom: audit.routeMapping[apiPath]
      });
    }
  });
  
  console.log(`✅ Analysis complete:`);
  console.log(`   - Duplicates: ${audit.duplicates.length}`);
  console.log(`   - Unused: ${audit.unused.length}`);
  console.log(`   - Missing: ${audit.missing.length}`);
}

/**
 * Calculate statistics
 */
function calculateStatistics() {
  audit.statistics = {
    totalLegacyRoutes: audit.legacyRoutes.length,
    totalEnterpriseModules: audit.enterpriseRoutes.length,
    totalEnterpriseRoutes: audit.enterpriseRoutes.reduce((sum, m) => sum + m.routes.length, 0),
    totalFrontendPages: audit.frontendPages.length,
    totalApiEndpoints: audit.apiEndpoints.length,
    totalMappedRoutes: Object.keys(audit.routeMapping).length,
    duplicatesCount: audit.duplicates.length,
    unusedCount: audit.unused.length,
    missingCount: audit.missing.length,
    migrationProgress: {
      legacy: audit.legacyRoutes.filter(r => r.status === 'migrated').length,
      total: audit.legacyRoutes.length,
      percentage: audit.legacyRoutes.length > 0 
        ? Math.round((audit.legacyRoutes.filter(r => r.status === 'migrated').length / audit.legacyRoutes.length) * 100)
        : 100
    }
  };
}

/**
 * Generate markdown report
 */
function generateMarkdownReport() {
  let md = `# Backend Route Audit Report\n\n`;
  md += `**Generated:** ${audit.timestamp}\n\n`;
  
  md += `## Statistics\n\n`;
  md += `- **Legacy Routes:** ${audit.statistics.totalLegacyRoutes}\n`;
  md += `- **Enterprise Modules:** ${audit.statistics.totalEnterpriseModules}\n`;
  md += `- **Enterprise Routes:** ${audit.statistics.totalEnterpriseRoutes}\n`;
  md += `- **Frontend Pages:** ${audit.statistics.totalFrontendPages}\n`;
  md += `- **API Endpoints:** ${audit.statistics.totalApiEndpoints}\n`;
  md += `- **Mapped Routes:** ${audit.statistics.totalMappedRoutes}\n`;
  md += `- **Migration Progress:** ${audit.statistics.migrationProgress.percentage}% (${audit.statistics.migrationProgress.legacy}/${audit.statistics.migrationProgress.total})\n\n`;
  
  md += `## Enterprise Modules\n\n`;
  audit.enterpriseRoutes.forEach(module => {
    md += `### ${module.module} (${module.basePath})\n\n`;
    md += `**File:** ${module.file}\n\n`;
    md += `**Routes:**\n\n`;
    module.routes.forEach(route => {
      md += `- \`${route.method} ${route.fullPath}\` (line ${route.line})\n`;
    });
    md += `\n`;
  });
  
  md += `## Legacy Routes (To Migrate)\n\n`;
  const unmigrated = audit.legacyRoutes.filter(r => r.status !== 'migrated');
  if (unmigrated.length > 0) {
    md += `**Total:** ${unmigrated.length}\n\n`;
    unmigrated.slice(0, 50).forEach(route => {
      md += `- \`${route.path || route.method + ' ' + route.path}\` - ${route.file}:${route.line}\n`;
    });
    if (unmigrated.length > 50) {
      md += `\n*... and ${unmigrated.length - 50} more*\n\n`;
    }
  } else {
    md += `✅ All routes migrated!\n\n`;
  }
  
  md += `## Duplicate Routes\n\n`;
  if (audit.duplicates.length > 0) {
    audit.duplicates.forEach(dup => {
      md += `### ${dup.path} (${dup.count} occurrences)\n\n`;
      dup.locations.forEach(loc => {
        md += `- ${loc.type}: ${loc.file}:${loc.line}\n`;
      });
      md += `\n`;
    });
  } else {
    md += `✅ No duplicates found!\n\n`;
  }
  
  md += `## Unused Endpoints\n\n`;
  if (audit.unused.length > 0) {
    md += `**Total:** ${audit.unused.length}\n\n`;
    audit.unused.slice(0, 30).forEach(endpoint => {
      md += `- \`${endpoint.path}\` - ${endpoint.reason}\n`;
    });
    if (audit.unused.length > 30) {
      md += `\n*... and ${audit.unused.length - 30} more*\n\n`;
    }
  } else {
    md += `✅ All endpoints are used!\n\n`;
  }
  
  md += `## Missing Endpoints (Frontend calls but no backend)\n\n`;
  if (audit.missing.length > 0) {
    md += `**Total:** ${audit.missing.length}\n\n`;
    audit.missing.slice(0, 30).forEach(missing => {
      md += `### ${missing.path}\n\n`;
      md += `**Called from:**\n`;
      missing.calledFrom.forEach(call => {
        md += `- ${call.frontendFile}\n`;
      });
      md += `\n`;
    });
    if (audit.missing.length > 30) {
      md += `\n*... and ${audit.missing.length - 30} more*\n\n`;
    }
  } else {
    md += `✅ All frontend calls have backend endpoints!\n\n`;
  }
  
  md += `## Frontend → Backend Mapping\n\n`;
  const mappedCount = Object.keys(audit.routeMapping).length;
  md += `**Total mapped routes:** ${mappedCount}\n\n`;
  
  // Show sample mappings
  const sampleMappings = Object.entries(audit.routeMapping).slice(0, 20);
  sampleMappings.forEach(([apiPath, calls]) => {
    md += `### ${apiPath}\n\n`;
    calls.slice(0, 3).forEach(call => {
      md += `- ${call.frontendFile}\n`;
    });
    if (calls.length > 3) {
      md += `- *... and ${calls.length - 3} more*\n`;
    }
    md += `\n`;
  });
  
  return md;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Route Audit (PHASE E9.1)...\n');
  
  scanLegacyRoutes();
  scanEnterpriseModules();
  scanServerJs();
  scanFrontendPages();
  analyzeRoutes();
  calculateStatistics();
  
  // Generate JSON report
  const jsonReport = JSON.stringify(audit, null, 2);
  fs.writeFileSync(
    path.join(DEV_REPORTS_DIR, 'backend-route-audit.json'),
    jsonReport,
    'utf8'
  );
  console.log(`\n✅ JSON report saved: DEV-REPORTS/backend-route-audit.json`);
  
  // Generate Markdown report
  const mdReport = generateMarkdownReport();
  fs.writeFileSync(
    path.join(DEV_REPORTS_DIR, 'backend-route-audit.md'),
    mdReport,
    'utf8'
  );
  console.log(`✅ Markdown report saved: DEV-REPORTS/backend-route-audit.md`);
  
  console.log(`\n📊 Summary:`);
  console.log(`   - Legacy routes: ${audit.statistics.totalLegacyRoutes}`);
  console.log(`   - Enterprise modules: ${audit.statistics.totalEnterpriseModules}`);
  console.log(`   - Enterprise routes: ${audit.statistics.totalEnterpriseRoutes}`);
  console.log(`   - Migration progress: ${audit.statistics.migrationProgress.percentage}%`);
  console.log(`   - Duplicates: ${audit.duplicates.length}`);
  console.log(`   - Unused: ${audit.unused.length}`);
  console.log(`   - Missing: ${audit.missing.length}`);
  console.log(`\n✅ Route audit complete!`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, audit };

