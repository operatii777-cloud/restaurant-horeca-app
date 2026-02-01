/**
 * PHASE E9.2 - Module Registry Autoloader with Licensing
 * 
 * Central registry for all enterprise modules.
 * All backend routes are automatically mounted from this registry.
 * 
 * LICENSING SYSTEM:
 * - Each module has a 'plan' field: 'basic', 'pro', 'enterprise'
 * - Tenant license determines which modules are accessible
 * - Unlicensed modules return 403 Forbidden
 * 
 * ZERO manual wiring in server.js
 */

const path = require('path');

// Register ts-node for TypeScript modules (if available)
let tsNodeRegistered = false;
try {
  require('ts-node/register');
  tsNodeRegistered = true;
} catch (e) {
  // ts-node not available, TypeScript modules will be skipped
}

/**
 * License Plans - Define which features are included in each plan
 */
const LICENSE_PLANS = {
  basic: ['basic'],
  pro: ['basic', 'pro'],
  enterprise: ['basic', 'pro', 'enterprise']
};

/**
 * Get current tenant license (from environment or database)
 * In production, this would query the tenant's license from the database
 */
function getTenantLicense(tenantId = null) {
  // Check environment variable first
  const envLicense = process.env.LICENSE_PLAN || 'enterprise';
  return envLicense.toLowerCase();
}

/**
 * Check if a module is licensed for the current tenant
 * @param {Object} module - Module from registry
 * @param {String} tenantLicense - Tenant's license plan
 * @returns {Boolean}
 */
function isModuleLicensed(module, tenantLicense = 'enterprise') {
  // If module has no plan specified, it's available to all
  if (!module.plan) return true;

  // Get allowed plans for this license
  const allowedPlans = LICENSE_PLANS[tenantLicense] || LICENSE_PLANS.basic;

  return allowedPlans.includes(module.plan);
}

/**
 * Create license check middleware
 * Returns 403 if module is not licensed
 */
function createLicenseMiddleware(module) {
  return (req, res, next) => {
    const tenantLicense = req.tenantLicense || getTenantLicense(req.tenantId);

    if (!isModuleLicensed(module, tenantLicense)) {
      return res.status(403).json({
        success: false,
        error: 'Module not licensed',
        code: 'MODULE_NOT_LICENSED',
        module: module.name,
        requiredPlan: module.plan,
        currentPlan: tenantLicense,
        message: `This feature requires a ${module.plan} plan. Please upgrade to access.`
      });
    }

    next();
  };
}

/**
 * Module Registry
 * 
 * Structure:
 * {
 *   name: "module-name",           // Module folder name in src/modules/
 *   route: "/api/route-prefix",    // API route prefix
 *   factory: false,                // true if module uses factory pattern (needs deps)
 *   deps: ["db", "invalidateMenuCache"], // Dependencies for factory modules
 *   enabled: true,                 // Can disable modules without deleting
 *   plan: "basic|pro|enterprise"   // Required license plan (omit for all plans)
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
    enabled: true,
    plan: 'pro' // Variance reporting requires Pro plan
  },
  {
    name: 'technical-sheets',
    route: '/api/technical-sheets',
    factory: false,
    enabled: true,
    plan: 'pro' // Technical sheets requires Pro plan
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
    enabled: true,
    plan: 'enterprise' // AI-powered restock requires Enterprise plan
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
  {
    name: 'stats',
    route: '/api/stats',
    factory: false,
    enabled: true,
    note: 'BI Stats dashboards (coatroom, hostess, lostfound, delivery)'
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
    name: 'delivery-kpi',
    route: '/api/delivery',
    factory: false,
    enabled: true,
    note: 'S17.H - Delivery KPI Dashboard'
  },
  {
    name: 'delivery-sla',
    route: '/api/delivery/sla',
    factory: false,
    enabled: true,
    note: 'FAZA 2.C - Delivery SLA Engine'
  },
  {
    name: 'external-delivery',
    route: '/api/external-delivery',
    factory: false,
    enabled: true,
    note: 'S17.I - External Delivery Integrations (Glovo, Bolt, Tazz, Wolt)'
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
  // FAZA MT.5 - Locations Management
  {
    name: 'locations',
    route: '/api/settings/locations',
    factory: false,
    enabled: true
  },
  // Settings - Printers
  {
    name: 'settings',
    route: '/api/settings',
    factory: false,
    enabled: true,
    note: 'Settings module (printers, payment-methods)'
  },
  // Queue Monitor
  {
    name: 'queue',
    route: '/api/queue',
    factory: false,
    enabled: true,
    note: 'Queue monitor for order processing'
  },
  // FAZA MT.6 - Branding Management
  {
    name: 'branding',
    route: '/api/config/branding',
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
  // PHASE PRODUCTION-READY: Recipes module with cost calculation
  {
    name: 'recipes',
    route: '/api/recipes',
    factory: false,
    enabled: true,
    note: 'PHASE PRODUCTION-READY - Recipes with cost calculation and validation'
  },
  // Menu Engineering with correct CM formula
  {
    name: 'menu-engineering',
    route: '/api/menu-engineering',
    factory: false,
    enabled: true,
    plan: 'pro', // Menu Engineering requires Pro plan
    note: 'Menu Engineering with STAR/PUZZLE/PLOWHORSE/DOG classification'
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
  // FAZA 2: LOYALTY & REWARDS
  // ========================================
  {
    name: 'loyalty',
    route: '/api',
    factory: false,
    enabled: true,
    note: 'FAZA 2 - Loyalty & Rewards (rewards, points, VIP levels)'
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
    route: '/api/payments',
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
  // PHASE S6.3 - ACCOUNTING MODULE v8.0
  // ========================================
  {
    name: 'accounting',
    route: '/api/accounting',
    factory: false,
    enabled: true,
    note: 'PHASE S6.3 - Accounting Module v8.0 (Reports, Settings, Mapping, Stock Balance, Daily Balance, Consumption, Entries by VAT)'
  },

  // ========================================
  // PHASE S4.2 - TIPIZATE ENTERPRISE
  // ========================================
  {
    name: 'tipizate',
    route: '/api/tipizate',
    factory: false,
    enabled: true, // Enabled - TypeScript files are compatible with Node.js via ts-node or compiled
    note: 'PHASE S4.2 - Unified Tipizate Enterprise module (NIR, Bon Consum, Transfer, Inventar, Waste, etc.)'
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
  },

  // ========================================
  // PROMOTIONS MODULES (Happy Hour, Daily Offer, Daily Menu)
  // ========================================
  {
    name: 'promotions',
    route: '/api',
    factory: false,
    enabled: true,
    note: 'Promotions module (happy-hour, daily-offer, daily-menu)'
  },

  // ========================================
  // SAGA EXPORT MODULE
  // ========================================
  {
    name: 'saga-export',
    route: '/api/saga',
    factory: false,
    enabled: true,
    note: 'SAGA Export functionality (NIR and Sales)'
  },
  {
    name: 'archive',
    route: '/api/archive',
    factory: false,
    enabled: true,
    note: 'Archive module (Orders archiving, Cold data management)'
  },
  {
    name: 'compliance',
    route: '/api/compliance',
    factory: false,
    enabled: true,
    note: 'Compliance module (Cleaning schedule, Equipment maintenance, Temperature log)'
  },
  // ========================================
  // WEBHOOKS MODULE
  // ========================================
  {
    name: 'webhooks',
    route: '/api/webhooks',
    factory: false,
    enabled: true,
    note: 'Webhooks system for external integrations'
  },
  // ========================================
  // EXPORTS MODULE - Centralized Export/PDF/Import
  // ========================================
  {
    name: 'exports',
    route: '/api',
    factory: false,
    enabled: true,
    note: 'Centralized Export/PDF/Import functionality'
  },
  // ========================================
  // PIN AUTHENTICATION - Toast/Lightspeed style
  // ========================================
  {
    name: 'auth-pin',
    route: '/api/auth/pin',
    factory: false,
    enabled: true,
    note: 'PIN-based authentication for POS/Kiosk terminals'
  },
  // ========================================
  // PRINTING - ESC/POS thermal printers
  // ========================================
  {
    name: 'printing',
    route: '/api/print',
    factory: false,
    enabled: true,
    note: 'ESC/POS thermal printer integration'
  },
  // ========================================
  // SCHEDULING - Employee shift management
  // ========================================
  {
    name: 'scheduling',
    route: '/api/scheduling',
    factory: false,
    enabled: true,
    note: 'Visual employee scheduling calendar'
  },
  // ========================================
  // FRIENDSRIDE INTEGRATION
  // ========================================
  {
    name: 'friendsride',
    route: '/api/friendsride',
    factory: false,
    enabled: true,
    note: 'Friendsride delivery integration (order sync, status updates, tracking)'
  },
  {
    // ALIAS: Map /api/delivery to the same friendsride module
    // This allows FriendsRide App to POST to /api/delivery/orders
    name: 'friendsride',
    route: '/api/delivery',
    factory: false,
    enabled: true,
    note: 'Alias for Friendsride integration to support external delivery app payload'
  },
  // ========================================
  // CALL CENTER (Simulated)
  // ========================================
  {
    name: 'call-center',
    route: '/api/call-center',
    factory: false,
    enabled: true,
    note: 'Simulated Call Center & Caller ID Service'
  },
  // ========================================
  // ANALYTICS MODULE
  // ========================================
  {
    name: 'analytics',
    route: '/api/analytics',
    factory: false,
    enabled: true,
    note: 'Cancellation predictions and business intelligence stats'
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
      // PHASE S8.8: Special handling for fiscal-engine and other modules with different file names
      let modulePath;
      if (module.name === 'fiscal-engine') {
        // fiscal-engine uses TypeScript routes - try to load with ts-node
        // Note: fiscal-engine is in src/fiscal-engine, not src/modules/fiscal-engine
        // __dirname is src/modules, so ../ goes to src/, then fiscal-engine/routes/
        if (tsNodeRegistered) {
          try {
            const fiscalEnginePath = path.join(__dirname, '../fiscal-engine/routes/fiscalEngine.routes.ts');
            const routes = require(fiscalEnginePath);
            app.use(module.route, routes);
            console.log(`   ✅ ${module.name} → ${module.route} (TypeScript via ts-node)`);
          } catch (tsError) {
            console.log(`   ⚠️  Module ${module.name} - error loading TypeScript routes: ${tsError.message}`);
            if (tsError.stack) {
              console.log(`   Stack: ${tsError.stack.split('\n').slice(0, 3).join('\n')}`);
            }
          }
        } else {
          console.log(`   ℹ️  Module ${module.name} uses TypeScript routes - skipping (ts-node not available)`);
        }
        return;
      } else if (module.name === 'payments') {
        modulePath = path.join(__dirname, module.name, 'payment.routes');
      } else if (module.name === 'cogs') {
        modulePath = path.join(__dirname, module.name, 'cogs.routes');
      } else if (module.name === 'financial') {
        modulePath = path.join(__dirname, module.name, 'financial.routes');
      } else if (module.name === 'accounting') {
        modulePath = path.join(__dirname, module.name, 'accounting.routes');
      } else if (module.name === 'delivery-kpi') {
        modulePath = path.join(__dirname, module.name, 'deliveryKpi.routes');
      } else if (module.name === 'external-delivery') {
        modulePath = path.join(__dirname, module.name, 'externalDelivery.routes');
      } else if (module.name === 'anaf-submit') {
        // Uses TypeScript - try to load with ts-node
        if (tsNodeRegistered) {
          try {
            modulePath = path.join(__dirname, module.name, 'anafSubmit.routes.ts');
            const routes = require(modulePath);
            app.use(module.route, routes);
            console.log(`   ✅ ${module.name} → ${module.route} (TypeScript via ts-node)`);
          } catch (tsError) {
            console.log(`   ⚠️  Module ${module.name} - error loading TypeScript routes: ${tsError.message}`);
          }
        } else {
          console.log(`   ℹ️  Module ${module.name} uses TypeScript routes - skipping (ts-node not available)`);
        }
        return;
      } else if (module.name === 'saft') {
        // Uses TypeScript - try to load with ts-node
        if (tsNodeRegistered) {
          try {
            modulePath = path.join(__dirname, module.name, 'saft.routes.ts');
            const routes = require(modulePath);
            app.use(module.route, routes);
            console.log(`   ✅ ${module.name} → ${module.route} (TypeScript via ts-node)`);
          } catch (tsError) {
            console.log(`   ⚠️  Module ${module.name} - error loading TypeScript routes: ${tsError.message}`);
          }
        } else {
          console.log(`   ℹ️  Module ${module.name} uses TypeScript routes - skipping (ts-node not available)`);
        }
        return;
      } else if (module.name === 'fiscal-codes') {
        // Uses TypeScript - try to load with ts-node
        if (tsNodeRegistered) {
          try {
            modulePath = path.join(__dirname, module.name, 'fiscalCodes.routes.ts');
            const routes = require(modulePath);
            app.use(module.route, routes);
            console.log(`   ✅ ${module.name} → ${module.route} (TypeScript via ts-node)`);
          } catch (tsError) {
            console.log(`   ⚠️  Module ${module.name} - error loading TypeScript routes: ${tsError.message}`);
          }
        } else {
          console.log(`   ℹ️  Module ${module.name} uses TypeScript routes - skipping (ts-node not available)`);
        }
        return;
      } else if (module.name === 'menu') {
        // Menu module routes.js exists now
        modulePath = path.join(__dirname, module.name, 'routes');
      } else if (module.name === 'recipes') {
        // PHASE PRODUCTION-READY: Recipes module with routes.js
        modulePath = path.join(__dirname, module.name, 'routes');
      } else if (module.name === 'tipizate') {
        // Tipizate module uses index.js (JavaScript wrapper for TypeScript)
        modulePath = path.join(__dirname, module.name, 'index');
      } else if (module.name === 'settings') {
        // Settings module uses routes.js
        modulePath = path.join(__dirname, module.name, 'routes');
      } else if (module.name === 'queue') {
        // Queue module uses queue-monitor.routes.js
        modulePath = path.join(__dirname, module.name, 'queue-monitor.routes');
      } else if (module.name === 'promotions') {
        // Promotions module uses routes.js
        modulePath = path.join(__dirname, module.name, 'routes');
      } else if (module.name === 'saga-export') {
        // SAGA Export module uses saga-export.routes.js
        modulePath = path.join(__dirname, module.name, 'saga-export.routes');
      } else if (module.name === 'archive') {
        // Archive module uses archive.routes.js
        modulePath = path.join(__dirname, module.name, 'archive.routes');
      } else if (module.name === 'stats') {
        // Stats module uses stats.routes.js
        modulePath = path.join(__dirname, module.name, 'stats.routes');
      } else if (module.name === 'compliance') {
        // Compliance module uses compliance.routes.js
        modulePath = path.join(__dirname, module.name, 'compliance.routes');
      } else if (module.name === 'webhooks') {
        // Webhooks module uses index.js (exports webhook.routes.js)
        modulePath = path.join(__dirname, module.name, 'index');
      } else if (module.name === 'admin') {
        // Admin module uses routes.js (exists)
        modulePath = path.join(__dirname, module.name, 'routes');
      } else if (module.name === 'exports') {
        // Exports module uses exports.routes.js
        modulePath = path.join(__dirname, module.name, 'exports.routes');
      } else if (module.name === 'auth-pin') {
        // Auth-PIN module uses routes.js
        modulePath = path.join(__dirname, module.name, 'routes');
      } else if (module.name === 'printing') {
        // Printing module uses routes.js
        modulePath = path.join(__dirname, module.name, 'routes');
      } else if (module.name === 'scheduling') {
        // Scheduling module uses routes.js
        modulePath = path.join(__dirname, module.name, 'routes');
      } else if (module.name === 'friendsride') {
        // Friendsride module uses friendsride.routes.js
        modulePath = path.join(__dirname, module.name, 'friendsride.routes');
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
        // Special handling for tipizate module
        if (module.name === 'tipizate') {
          console.log(`   🔍 [modules.registry] Tipizate module loaded:`, {
            hasModuleRoutes: !!moduleRoutes,
            moduleRoutesType: typeof moduleRoutes,
            hasTipizateRouter: !!(moduleRoutes && moduleRoutes.tipizateRouter),
            tipizateRouterType: moduleRoutes && moduleRoutes.tipizateRouter ? typeof moduleRoutes.tipizateRouter : 'undefined',
            isFunction: typeof moduleRoutes === 'function',
            hasStack: moduleRoutes && moduleRoutes.stack ? true : false,
            keys: moduleRoutes ? Object.keys(moduleRoutes) : []
          });

          let tipizateRouter;
          // Express Router objects are functions, but we should check for router properties first
          if (moduleRoutes && moduleRoutes.tipizateRouter) {
            // If it's an object with tipizateRouter property
            console.log(`   ✅ Using moduleRoutes.tipizateRouter`);
            tipizateRouter = moduleRoutes.tipizateRouter;
          } else if (moduleRoutes && typeof moduleRoutes === 'function' && moduleRoutes.stack) {
            // If it's an Express Router (function with stack property), use it directly
            console.log(`   ✅ Using moduleRoutes directly (Express Router)`);
            tipizateRouter = moduleRoutes;
          } else if (typeof moduleRoutes === 'function') {
            // If it's a factory function, call it
            console.log(`   ✅ Calling moduleRoutes as factory function`);
            tipizateRouter = moduleRoutes();
          } else {
            // Otherwise, use it directly (should be the router)
            console.log(`   ⚠️  Using moduleRoutes directly (fallback)`);
            tipizateRouter = moduleRoutes;
          }

          if (tipizateRouter && typeof tipizateRouter === 'function' && tipizateRouter.stack) {
            app.use(module.route, tipizateRouter);
            console.log(`   ✅ ${module.name} → ${module.route} (tipizate router with ${tipizateRouter.stack.length} routes)`);
          } else {
            console.error(`   ❌ tipizateRouter is not a valid Express Router:`, {
              type: typeof tipizateRouter,
              hasStack: tipizateRouter && tipizateRouter.stack ? true : false
            });
          }
        } else if (module.name === 'auth') {
          // Special handling for auth module (routes mounted directly, not under prefix)
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
  mountAllModules,
  // Licensing exports
  LICENSE_PLANS,
  getTenantLicense,
  isModuleLicensed,
  createLicenseMiddleware
};

