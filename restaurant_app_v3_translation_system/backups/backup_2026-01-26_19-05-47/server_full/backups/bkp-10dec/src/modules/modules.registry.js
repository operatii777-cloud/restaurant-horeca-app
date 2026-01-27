/**
 * PHASE E9.2 - Module Registry Autoloader
 * 
 * Central registry for all enterprise modules.
 * All backend routes are automatically mounted from this registry.
 * 
 * ZERO manual wiring in server.js
 */

const path = require('path');

/**
 * Module Registry
 * 
 * Structure:
 * {
 *   name: "module-name",           // Module folder name in src/modules/
 *   route: "/api/route-prefix",    // API route prefix
 *   factory: false,                // true if module uses factory pattern (needs deps)
 *   deps: ["db", "invalidateMenuCache"], // Dependencies for factory modules
 *   enabled: true                  // Can disable modules without deleting
 * }
 */
const modulesRegistry = [
  // ========================================
  // SAFE MODULES (PHASE E7 - Migrated)
  // ========================================
  {
    name: 'variance',
    route: '/api/variance',
    factory: false,
    enabled: true
  },
  {
    name: 'technical-sheets',
    route: '/api/technical-sheets',
    factory: false,
    enabled: true
  },
  {
    name: 'recalls',
    route: '/api/recalls',
    factory: false,
    enabled: true
  },
  {
    name: 'expiry-alerts',
    route: '/api/expiry-alerts',
    factory: false,
    enabled: true
  },
  {
    name: 'portions',
    route: '/api/portions',
    factory: false,
    enabled: true
  },
  {
    name: 'smart-restock',
    route: '/api/smart-restock-v2',
    factory: false,
    enabled: true
  },
  {
    name: 'hostess',
    route: '/api/hostess',
    factory: false,
    enabled: true
  },
  {
    name: 'lostfound',
    route: '/api/lostfound',
    factory: false,
    enabled: true
  },
  {
    name: 'coatroom',
    route: '/api/coatroom',
    factory: false,
    enabled: true
  },
  {
    name: 'laundry',
    route: '/api/laundry',
    factory: false,
    enabled: true
  },
  {
    name: 'reports',
    route: '/api/reports',
    factory: false,
    enabled: true,
    note: 'Delivery reports only, not BI'
  },

  // ========================================
  // CORE MODULES (PHASE E8 - Migrated)
  // ========================================
  {
    name: 'stocks',
    route: '/api/stocks',
    factory: false,
    enabled: true
  },
  {
    name: 'catalog',
    route: '/api/catalog',
    factory: true,
    deps: ['invalidateMenuCache'],
    enabled: true
  },
  {
    name: 'admin',
    route: '/api/admin',
    factory: false,
    enabled: true,
    note: 'Aggregator pattern with sub-routes'
  },
  {
    name: 'orders',
    route: '/api/orders',
    factory: false,
    enabled: true
  },
  {
    name: 'delivery',
    route: '/api/orders/delivery',
    factory: false,
    enabled: true
  },
  {
    name: 'drive-thru',
    route: '/api/orders/drive-thru',
    factory: false,
    enabled: true
  },
  {
    name: 'bi',
    route: '/api/bi',
    factory: false,
    enabled: true
  },
  {
    name: 'suppliers',
    route: '/api/suppliers',
    factory: false,
    enabled: true
  },
  {
    name: 'customers',
    route: '/api/customers',
    factory: false,
    enabled: true
  },
  {
    name: 'allergens',
    route: '/api/allergens',
    factory: false,
    enabled: true
  },
  {
    name: 'food-cost',
    route: '/api/food-cost',
    factory: false,
    enabled: true
  },
  {
    name: 'supplier-orders',
    route: '/api/supplier-orders',
    factory: false,
    enabled: true
  },
  {
    name: 'vouchers',
    route: '/api/vouchers',
    factory: false,
    enabled: true
  },
  {
    name: 'training',
    route: '/api/training',
    factory: false,
    enabled: true
  },
  {
    name: 'cash-register',
    route: '/api/cash-register',
    factory: false,
    enabled: true
  },
  {
    name: 'labels',
    route: '/api/labels',
    factory: false,
    enabled: true
  },
  {
    name: 'ingredient-catalog',
    route: '/api/ingredient-catalog',
    factory: true,
    deps: ['db'],
    enabled: true
  },
  {
    name: 'recipe-templates',
    route: '/api/recipe-templates',
    factory: true,
    deps: ['db'],
    enabled: true
  },

  // ========================================
  // ADDITIONAL MODULES (To be migrated)
  // ========================================
  {
    name: 'couriers',
    route: '/api/couriers',
    factory: false,
    enabled: true,
    note: 'May need migration'
  },
  {
    name: 'menu',
    route: '/api/menu',
    factory: false,
    enabled: true,
    note: 'Menu PDF routes'
  },

  // ========================================
  // LEGAL ENTERPRISE SUITE (PHASE E10)
  // ========================================
  {
    name: 'fiscal',
    route: '/api/fiscal',
    factory: false,
    enabled: true,
    note: 'ANAF fiscal receipt generation + e-Factura UBL 2.1'
  },
  {
    name: 'tva',
    route: '/api/tva',
    factory: false,
    enabled: true,
    note: 'PHASE S8.4 - TVA System v2 (date-based, product-based VAT resolution)'
  },
  {
    name: 'saft',
    route: '/api/saft',
    factory: false,
    enabled: true,
    note: 'PHASE S8.5 - SAF-T Validation (fiscal documents, UBL, stock, payments)'
  },
  {
    name: 'fiscal-codes',
    route: '/api/fiscal-codes',
    factory: false,
    enabled: true,
    note: 'PHASE S8.6 - Fiscal Codes (NCM/CN mapping and validation)'
  },
  {
    name: 'anaf-submit',
    route: '/api/anaf',
    factory: false,
    enabled: true,
    note: 'PHASE S8.7 - ANAF Direct Submit v2 (SPV API + queue + signatures)'
  },
  {
    name: 'fiscal-engine',
    route: '/api/fiscal-engine',
    factory: false,
    enabled: true,
    note: 'PHASE S8.8 - Unified Fiscal Engine (consolidates all fiscal operations)'
  },

  // ========================================
  // PHASE S12 - PAYMENT ENGINE V3
  // ========================================
  {
    name: 'payments',
    route: '/api',
    factory: false,
    enabled: true,
    note: 'PHASE S12 - Payment Engine V3 (multi-payment, split bill, cash/card/voucher)'
  },

  // ========================================
  // PHASE S13 - COGS ENGINE
  // ========================================
  {
    name: 'cogs',
    route: '/api/cogs',
    factory: false,
    enabled: true,
    note: 'PHASE S13 - COGS Engine (Cost of Goods Sold calculations and reporting)'
  },

  // ========================================
  // PHASE S15 - FINANCIAL REPORTS
  // ========================================
  {
    name: 'financial',
    route: '/api/financial',
    factory: false,
    enabled: true,
    note: 'PHASE S15 - Financial Reports (Daily Summary, P&L, Cashflow, Category Mix)'
  },

  // ========================================
  // PHASE S4.2 - TIPIZATE ENTERPRISE
  // ========================================
  {
    name: 'tipizate',
    route: '/api/tipizate',
    factory: false,
    enabled: true,
    note: 'PHASE S4.2 - Unified Tipizate Enterprise module (NIR, Bon Consum, Transfer, Inventar, etc.)'
  },

  // ========================================
  // AUTH MODULE (Kiosk/Admin Login)
  // ========================================
  {
    name: 'auth',
    route: '', // Routes are mounted directly (not under /api/auth)
    factory: false,
    enabled: true,
    note: 'Authentication for Kiosk and Admin users'
  }
];

/**
 * Get enabled modules
 */
function getEnabledModules() {
  return modulesRegistry.filter(m => m.enabled);
}

/**
 * Get factory modules (require dependencies)
 */
function getFactoryModules() {
  return modulesRegistry.filter(m => m.factory && m.enabled);
}

/**
 * Get simple modules (no factory pattern)
 */
function getSimpleModules() {
  return modulesRegistry.filter(m => !m.factory && m.enabled);
}

/**
 * Mount all modules to Express app
 * @param {Express} app - Express application instance
 * @param {Object} deps - Dependencies (e.g., { db, invalidateMenuCache })
 */
function mountAllModules(app, deps = {}) {
  const enabled = getEnabledModules();
  
  console.log(`\n📦 Mounting ${enabled.length} enterprise modules from registry...`);
  
  enabled.forEach(module => {
    try {
      // PHASE S4.2: Special handling for tipizate module (uses index.ts)
      // PHASE S8.8: Special handling for fiscal-engine (uses index.js in parent fiscal-engine folder)
      let modulePath;
      if (module.name === 'tipizate') {
        modulePath = path.join(__dirname, module.name, 'index');
      } else if (module.name === 'fiscal-engine') {
        modulePath = path.join(__dirname, '..', 'fiscal-engine', 'index');
      } else {
        modulePath = path.join(__dirname, module.name, 'routes');
      }
      let moduleRoutes;
      
      try {
        moduleRoutes = require(modulePath);
      } catch (requireErr) {
        console.error(`   ⚠️  Could not require ${modulePath}: ${requireErr.message}`);
        return;
      }
      
      if (module.factory) {
        // Factory pattern - pass dependencies
        const factoryDeps = {};
        if (module.deps) {
          module.deps.forEach(depName => {
            if (deps[depName]) {
              factoryDeps[depName] = deps[depName];
            }
          });
        }
        
        const routes = typeof moduleRoutes === 'function' 
          ? moduleRoutes(factoryDeps)
          : moduleRoutes;
        
        app.use(module.route, routes);
        console.log(`   ✅ ${module.name} → ${module.route} (factory)`);
      } else {
        // Simple module - direct require
        // Special handling for auth module (routes mounted directly, not under prefix)
        if (module.name === 'auth') {
          app.use(moduleRoutes);
          console.log(`   ✅ ${module.name} → (direct routes)`);
        } else {
          app.use(module.route, moduleRoutes);
          console.log(`   ✅ ${module.name} → ${module.route}`);
        }
      }
    } catch (err) {
      console.error(`   ❌ Failed to mount ${module.name}: ${err.message}`);
    }
  });
  
  console.log(`✅ All modules mounted from registry\n`);
}

module.exports = {
  modulesRegistry,
  getEnabledModules,
  getFactoryModules,
  getSimpleModules,
  mountAllModules
};

