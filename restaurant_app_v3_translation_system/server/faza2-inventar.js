#!/usr/bin/env node

/**
 * FAZA 2: Inventariere Interfețe și Endpoint-uri
 * Complete inventory of all interfaces, APIs, and routes
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.magenta}${'='.repeat(70)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.magenta}${'='.repeat(70)}${colors.reset}\n`)
};

const inventory = {
  interfaces: [],
  apiRoutes: [],
  staticFiles: [],
  components: [],
  timestamp: new Date().toISOString()
};

// Scan HTML interfaces
function scanHTMLInterfaces() {
  log.section('FAZA 2.1: Scanare Interfețe HTML');
  
  const publicDir = path.join(__dirname, 'public');
  const adminViteDir = path.join(__dirname, 'admin-vite');
  
  const htmlFiles = [];
  
  // Scan public directory recursively
  function scanDir(dir, baseUrl = '') {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath, baseUrl + '/' + file);
      } else if (file.endsWith('.html')) {
        const url = baseUrl + '/' + file;
        const relativePath = path.relative(__dirname, fullPath);
        htmlFiles.push({
          name: file,
          path: relativePath,
          url: url,
          size: stat.size,
          type: 'HTML Interface'
        });
        log.success(`Found: ${file} -> ${url}`);
      }
    }
  }
  
  scanDir(publicDir);
  
  // Check admin-vite
  if (fs.existsSync(path.join(adminViteDir, 'index.html'))) {
    htmlFiles.push({
      name: 'Admin-Vite',
      path: 'admin-vite/index.html',
      url: '/admin-vite/',
      size: fs.statSync(path.join(adminViteDir, 'index.html')).size,
      type: 'React SPA'
    });
    log.success(`Found: Admin-Vite -> /admin-vite/`);
  }
  
  inventory.interfaces = htmlFiles;
  log.info(`Total interfaces found: ${htmlFiles.length}`);
  
  return htmlFiles;
}

// Scan API routes
function scanAPIRoutes() {
  log.section('FAZA 2.2: Mapare Endpoint-uri API');
  
  const routesDir = path.join(__dirname, 'routes');
  const routes = [];
  
  if (fs.existsSync(routesDir)) {
    const files = fs.readdirSync(routesDir);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(routesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract route patterns
        const routerMatches = content.match(/router\.(get|post|put|delete|patch)\s*\(['"`]([^'"`]+)['"`]/g) || [];
        const appMatches = content.match(/app\.(get|post|put|delete|patch)\s*\(['"`]([^'"`]+)['"`]/g) || [];
        
        const allMatches = [...routerMatches, ...appMatches];
        
        if (allMatches.length > 0) {
          log.success(`${file}: ${allMatches.length} endpoints`);
          
          routes.push({
            file: file,
            path: `routes/${file}`,
            endpoints: allMatches.length,
            methods: allMatches.map(m => {
              const match = m.match(/(get|post|put|delete|patch)\s*\(['"`]([^'"`]+)['"`]/);
              return match ? { method: match[1].toUpperCase(), path: match[2] } : null;
            }).filter(Boolean)
          });
        }
      }
    }
  }
  
  inventory.apiRoutes = routes;
  log.info(`Total route files: ${routes.length}`);
  log.info(`Total endpoints: ${routes.reduce((sum, r) => sum + r.endpoints, 0)}`);
  
  return routes;
}

// Scan server.js for mounted routes
function scanServerMounts() {
  log.section('FAZA 2.3: Verificare Montări Rute în Server');
  
  const serverPath = path.join(__dirname, 'server.js');
  const mounts = [];
  
  if (fs.existsSync(serverPath)) {
    const content = fs.readFileSync(serverPath, 'utf8');
    
    // Find app.use patterns
    const useMatches = content.match(/app\.use\s*\(['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\)/g) || [];
    
    log.info(`Found ${useMatches.length} app.use() mounts`);
    
    for (const match of useMatches) {
      const details = match.match(/app\.use\s*\(['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\)/);
      if (details) {
        mounts.push({
          path: details[1],
          handler: details[2].trim()
        });
        log.success(`Mount: ${details[1]} -> ${details[2].trim()}`);
      }
    }
  }
  
  inventory.serverMounts = mounts;
  return mounts;
}

// Scan React components
function scanReactComponents() {
  log.section('FAZA 2.4: Scanare Componente React (Admin-Vite)');
  
  const srcDir = path.join(__dirname, 'admin-vite', 'src');
  const components = [];
  
  function scanComponents(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanComponents(fullPath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        const relativePath = path.relative(path.join(__dirname, 'admin-vite'), fullPath);
        components.push({
          name: file,
          path: relativePath,
          type: file.endsWith('.tsx') ? 'TypeScript React' : 'JavaScript React'
        });
      }
    }
  }
  
  scanComponents(srcDir);
  
  inventory.components = components;
  log.info(`Total React components: ${components.length}`);
  
  return components;
}

// Generate summary report
function generateReport() {
  log.section('FAZA 2.5: Generare Raport Inventar');
  
  const report = {
    timestamp: inventory.timestamp,
    summary: {
      totalInterfaces: inventory.interfaces.length,
      totalRouteFiles: inventory.apiRoutes.length,
      totalEndpoints: inventory.apiRoutes.reduce((sum, r) => sum + r.endpoints, 0),
      totalServerMounts: inventory.serverMounts?.length || 0,
      totalComponents: inventory.components.length
    },
    interfaces: inventory.interfaces,
    apiRoutes: inventory.apiRoutes,
    serverMounts: inventory.serverMounts,
    components: inventory.components.slice(0, 20) // First 20 components
  };
  
  // Save to file
  const reportPath = path.join(__dirname, '../../FAZA2_INVENTAR_COMPLET.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log.success(`Report saved: FAZA2_INVENTAR_COMPLET.json`);
  
  // Generate markdown summary
  const mdReport = `# FAZA 2: Inventar Complet Interfețe și Endpoint-uri

**Data:** ${new Date().toLocaleString('ro-RO')}

## Rezumat

- **Total Interfețe HTML:** ${report.summary.totalInterfaces}
- **Total Fișiere Rute:** ${report.summary.totalRouteFiles}
- **Total Endpoint-uri API:** ${report.summary.totalEndpoints}
- **Total Montări Server:** ${report.summary.totalServerMounts}
- **Total Componente React:** ${report.summary.totalComponents}

## Interfețe HTML Disponibile

${inventory.interfaces.map((iface, i) => `${i + 1}. **${iface.name}**
   - URL: \`${iface.url}\`
   - Tip: ${iface.type}
   - Fișier: \`${iface.path}\`
`).join('\n')}

## Statistici API Routes

${inventory.apiRoutes.map((route, i) => `${i + 1}. **${route.file}**
   - Endpoint-uri: ${route.endpoints}
   - Exemple: ${route.methods.slice(0, 3).map(m => `\`${m.method} ${m.path}\``).join(', ')}
`).join('\n')}

## Status

✅ FAZA 2 Completă - Inventar generat cu succes!

---
*Generat automat de FAZA 2 inventory script*
`;
  
  const mdPath = path.join(__dirname, '../../FAZA2_INVENTAR_COMPLET.md');
  fs.writeFileSync(mdPath, mdReport);
  log.success(`Markdown report saved: FAZA2_INVENTAR_COMPLET.md`);
  
  return report;
}

// Main execution
async function main() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  FAZA 2: Inventariere Interfețe și Endpoint-uri                    ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  try {
    const interfaces = scanHTMLInterfaces();
    const routes = scanAPIRoutes();
    const mounts = scanServerMounts();
    const components = scanReactComponents();
    const report = generateReport();
    
    log.section('FAZA 2: COMPLETĂ! ✅');
    console.log(`
${colors.green}Inventar Complet:${colors.reset}
  • ${report.summary.totalInterfaces} interfețe HTML
  • ${report.summary.totalRouteFiles} fișiere de rute
  • ${report.summary.totalEndpoints} endpoint-uri API
  • ${report.summary.totalServerMounts} montări în server
  • ${report.summary.totalComponents} componente React

${colors.cyan}Rapoarte generate:${colors.reset}
  • FAZA2_INVENTAR_COMPLET.json
  • FAZA2_INVENTAR_COMPLET.md

${colors.yellow}Următorul pas:${colors.reset} FAZA 3 - Testare Automată
`);
    
    process.exit(0);
  } catch (error) {
    log.error(`Eroare: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();
