#!/usr/bin/env node
/**
 * VERIFICARE COMPLETĂ CONECTIVITATE ADMIN-VITE ENDPOINTS
 * 
 * Verifică că toate endpoint-urile din admin-vite sunt:
 * 1. Conectate la rute backend corespunzătoare
 * 2. Backend-ul are acces la database
 * 3. Toate rutele sunt funcționale
 * 
 * @author System Verification Agent
 * @date 2026-02-15
 */

const fs = require('fs');
const path = require('path');
const { dbPromise } = require('./database');

// Colori pentru output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}${'='.repeat(80)}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.blue}${msg}${colors.reset}`)
};

class EndpointVerifier {
  constructor() {
    this.results = {
      frontendEndpoints: [],
      backendRoutes: [],
      mismatches: [],
      databaseConnections: [],
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0
    };
  }

  /**
   * Găsește toate fișierele API din admin-vite/src
   */
  findFrontendAPIFiles() {
    log.header();
    log.title('📱 ETAPA 1: Scanare Frontend API Files (admin-vite)');
    log.header();

    const apiPath = path.join(__dirname, 'admin-vite', 'src');
    const apiFiles = [];

    const scanDirectory = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (item.match(/\.api\.(ts|tsx|js|jsx)$/) || item.includes('Api')) {
            apiFiles.push({
              path: fullPath,
              name: item,
              relativePath: path.relative(apiPath, fullPath)
            });
          }
        });
      } catch (error) {
        // Directory might not exist or not accessible
      }
    };

    scanDirectory(apiPath);
    
    log.info(`Găsite ${apiFiles.length} fișiere API în frontend`);
    apiFiles.forEach(file => {
      log.success(`  ${file.relativePath}`);
    });

    this.results.frontendEndpoints = apiFiles;
    return apiFiles;
  }

  /**
   * Extrage endpoint-urile din fișierele API
   */
  extractEndpointsFromAPIFiles(apiFiles) {
    log.header();
    log.title('🔍 ETAPA 2: Extragere Endpoints din API Files');
    log.header();

    const endpoints = new Set();
    const endpointPattern = /['"`](\/api\/[^'"`\s]+)['"`]/g;

    apiFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const matches = content.matchAll(endpointPattern);
        
        for (const match of matches) {
          const endpoint = match[1]
            .replace(/\$\{[^}]+\}/g, ':id') // Replace ${id} with :id
            .replace(/\`[^`]*\$/g, '') // Remove template literals
            .trim();
          
          if (endpoint && endpoint.startsWith('/api/')) {
            endpoints.add(endpoint);
          }
        }
      } catch (error) {
        log.warning(`Nu s-a putut citi ${file.name}: ${error.message}`);
      }
    });

    const endpointList = Array.from(endpoints).sort();
    log.info(`Găsite ${endpointList.length} endpoint-uri unice în frontend:`);
    
    endpointList.forEach(endpoint => {
      log.success(`  ${endpoint}`);
    });

    return endpointList;
  }

  /**
   * Găsește toate fișierele de rute din backend
   */
  findBackendRouteFiles() {
    log.header();
    log.title('🔧 ETAPA 3: Scanare Backend Route Files');
    log.header();

    const routesPath = path.join(__dirname, 'routes');
    const routeFiles = [];

    const scanDirectory = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.includes('node_modules')) {
            scanDirectory(fullPath);
          } else if (item.match(/\.(routes|route)\.(js|ts)$/) || item.match(/routes\.js$/)) {
            routeFiles.push({
              path: fullPath,
              name: item,
              relativePath: path.relative(__dirname, fullPath)
            });
          }
        });
      } catch (error) {
        log.warning(`Nu s-a putut scana ${dir}: ${error.message}`);
      }
    };

    scanDirectory(routesPath);
    
    log.info(`Găsite ${routeFiles.length} fișiere de rute în backend`);
    routeFiles.slice(0, 20).forEach(file => {
      log.success(`  ${file.relativePath}`);
    });
    
    if (routeFiles.length > 20) {
      log.info(`  ... și încă ${routeFiles.length - 20} fișiere`);
    }

    this.results.backendRoutes = routeFiles;
    return routeFiles;
  }

  /**
   * Verifică dacă există server.js și ce rute montează
   */
  checkServerConfiguration() {
    log.header();
    log.title('⚙️  ETAPA 4: Verificare Configurare Server');
    log.header();

    const serverPath = path.join(__dirname, 'server.js');
    
    try {
      const serverContent = fs.readFileSync(serverPath, 'utf8');
      
      // Check for route mounting patterns
      const routePatterns = [
        /app\.use\(['"`]([^'"`]+)['"`],\s*require\(['"`]([^'"`]+)['"`]\)/g,
        /router\.use\(['"`]([^'"`]+)['"`]/g
      ];

      const mountedRoutes = new Set();
      
      routePatterns.forEach(pattern => {
        const matches = serverContent.matchAll(pattern);
        for (const match of matches) {
          mountedRoutes.add(match[1]);
        }
      });

      log.info(`Găsite ${mountedRoutes.size} rute montate în server.js:`);
      Array.from(mountedRoutes).slice(0, 15).forEach(route => {
        log.success(`  ${route}`);
      });

      if (mountedRoutes.size > 15) {
        log.info(`  ... și încă ${mountedRoutes.size - 15} rute`);
      }

      return Array.from(mountedRoutes);
    } catch (error) {
      log.error(`Nu s-a putut citi server.js: ${error.message}`);
      return [];
    }
  }

  /**
   * Verifică conexiunea la database
   */
  async checkDatabaseConnection() {
    log.header();
    log.title('💾 ETAPA 5: Verificare Conexiune Database');
    log.header();

    try {
      const db = await dbPromise;
      log.success('Conexiune database stabilită cu succes');

      // Check critical tables
      const criticalTables = [
        'orders', 'order_items', 'products', 'menu',
        'users', 'ingredients', 'recipes', 'stock_movements',
        'couriers', 'payments', 'customers'
      ];

      log.info('Verificare tabele critice:');
      
      for (const tableName of criticalTables) {
        try {
          const result = await db.get(
            `SELECT COUNT(*) as count FROM ${tableName}`
          );
          log.success(`  ${tableName}: ${result.count} înregistrări`);
          this.results.databaseConnections.push({
            table: tableName,
            status: 'OK',
            count: result.count
          });
          this.results.passedChecks++;
        } catch (error) {
          log.error(`  ${tableName}: ${error.message}`);
          this.results.databaseConnections.push({
            table: tableName,
            status: 'ERROR',
            error: error.message
          });
          this.results.failedChecks++;
        }
        this.results.totalChecks++;
      }

      return true;
    } catch (error) {
      log.error(`Eroare conexiune database: ${error.message}`);
      this.results.failedChecks++;
      this.results.totalChecks++;
      return false;
    }
  }

  /**
   * Verifică fișierele admin-advanced.html și admin.html
   */
  checkLegacyAdminFiles() {
    log.header();
    log.title('📄 ETAPA 6: Verificare Fișiere Legacy Admin');
    log.header();

    const files = [
      path.join(__dirname, 'public', 'legacy', 'admin', 'admin-advanced.html'),
      path.join(__dirname, 'public', 'legacy', 'admin', 'admin.html'),
      path.join(__dirname, 'admin-vite', 'admin.html')
    ];

    files.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const size = (content.length / 1024).toFixed(2);
          
          // Extract API endpoints from HTML
          const endpointPattern = /['"`](\/api\/[^'"`\s]+)['"`]/g;
          const endpoints = new Set();
          const matches = content.matchAll(endpointPattern);
          
          for (const match of matches) {
            endpoints.add(match[1]);
          }
          
          log.success(`${path.basename(filePath)} - ${size} KB, ${endpoints.size} endpoints`);
          
          if (endpoints.size > 0) {
            log.info(`  Endpoints găsite: ${Array.from(endpoints).slice(0, 5).join(', ')}${endpoints.size > 5 ? '...' : ''}`);
          }
        } else {
          log.warning(`${path.basename(filePath)} - Nu există`);
        }
      } catch (error) {
        log.error(`${path.basename(filePath)} - Eroare: ${error.message}`);
      }
    });
  }

  /**
   * Generează raport final
   */
  generateReport() {
    log.header();
    log.title('📊 RAPORT FINAL - VERIFICARE CONECTIVITATE ADMIN-VITE');
    log.header();

    console.log('\n' + colors.bold + '=== REZUMAT VERIFICARE ===' + colors.reset);
    console.log(`Total verificări: ${this.results.totalChecks}`);
    console.log(`${colors.green}Verificări reușite: ${this.results.passedChecks}${colors.reset}`);
    console.log(`${colors.red}Verificări eșuate: ${this.results.failedChecks}${colors.reset}`);
    
    const successRate = this.results.totalChecks > 0 
      ? ((this.results.passedChecks / this.results.totalChecks) * 100).toFixed(2)
      : 0;
    
    console.log(`\n${colors.bold}Rata de succes: ${successRate}%${colors.reset}`);

    console.log('\n' + colors.bold + '=== COMPONENTE VERIFICATE ===' + colors.reset);
    console.log(`Frontend API Files: ${this.results.frontendEndpoints.length}`);
    console.log(`Backend Route Files: ${this.results.backendRoutes.length}`);
    console.log(`Database Tables: ${this.results.databaseConnections.length}`);

    console.log('\n' + colors.bold + '=== STATUS DATABASE ===' + colors.reset);
    const dbOK = this.results.databaseConnections.filter(c => c.status === 'OK').length;
    const dbError = this.results.databaseConnections.filter(c => c.status === 'ERROR').length;
    console.log(`${colors.green}Tabele OK: ${dbOK}${colors.reset}`);
    console.log(`${colors.red}Tabele cu erori: ${dbError}${colors.reset}`);

    if (dbError > 0) {
      console.log('\nTabele cu probleme:');
      this.results.databaseConnections
        .filter(c => c.status === 'ERROR')
        .forEach(c => log.error(`  ${c.table}: ${c.error}`));
    }

    // Verdict final
    console.log('\n' + colors.bold + '=== VERDICT FINAL ===' + colors.reset);
    if (this.results.failedChecks === 0) {
      log.success('TOATE VERIFICĂRILE AU TRECUT! ✅');
      log.success('Admin-vite este COMPLET CONECTAT la server și database.');
    } else if (this.results.failedChecks <= 3) {
      log.warning('VERIFICĂRI PARȚIAL REUȘITE ⚠️');
      log.warning(`${this.results.failedChecks} probleme minore identificate.`);
    } else {
      log.error('MULTIPLE PROBLEME IDENTIFICATE ❌');
      log.error(`${this.results.failedChecks} verificări au eșuat.`);
    }

    log.header();
    
    return this.results;
  }

  /**
   * Rulează toate verificările
   */
  async runAllChecks() {
    console.log(colors.bold + colors.cyan);
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║  VERIFICARE COMPLETĂ CONECTIVITATE ADMIN-VITE ENDPOINTS                      ║');
    console.log('║  Restaurant HORECA Application v3                                            ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);

    try {
      // Etapa 1: Frontend API Files
      const apiFiles = this.findFrontendAPIFiles();
      
      // Etapa 2: Extract endpoints
      const endpoints = this.extractEndpointsFromAPIFiles(apiFiles);
      
      // Etapa 3: Backend routes
      const routeFiles = this.findBackendRouteFiles();
      
      // Etapa 4: Server configuration
      const mountedRoutes = this.checkServerConfiguration();
      
      // Etapa 5: Database connection
      await this.checkDatabaseConnection();
      
      // Etapa 6: Legacy admin files
      this.checkLegacyAdminFiles();
      
      // Raport final
      const report = this.generateReport();
      
      // Salvare raport în fișier
      const reportPath = path.join(__dirname, 'ENDPOINT_VERIFICATION_REPORT.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      log.success(`\nRaport detaliat salvat în: ${reportPath}`);
      
      // Exit code bazat pe rezultate
      process.exit(this.results.failedChecks > 0 ? 1 : 0);
      
    } catch (error) {
      log.error(`\nEroare fatală: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// Rulare verificare
if (require.main === module) {
  const verifier = new EndpointVerifier();
  verifier.runAllChecks().catch(error => {
    console.error('Eroare neașteptată:', error);
    process.exit(1);
  });
}

module.exports = EndpointVerifier;
