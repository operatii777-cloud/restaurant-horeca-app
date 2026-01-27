// server/src/modules/cogs/cogs.sync.service.js
/**
 * S13 - COGS Sync Service
 *
 * Rol:
 *  - sincronizează rezultatele COGS cu tabela de produse (ex: menu)
 *  - actualizează câmpurile food_cost, food_cost_percent, margin_percent
 *  - poate rula per produs sau pentru toate produsele
 */

const { dbPromise } = require('../../../database');
const masterData = require("../../../master-data");
const cogsEngine = require("./cogs.engine");

const { productsMaster } = masterData;

// Ajustează numele tabelei și coloanelor dacă la tine sunt diferite
const MENU_TABLE = "menu";
const MENU_ID_COL = "id";
const MENU_FOOD_COST_COL = "food_cost";
const MENU_FOOD_COST_PERCENT_COL = "food_cost_percent";
const MENU_MARGIN_PERCENT_COL = "margin_percent";
const MENU_LAST_COGS_AT_COL = "last_cogs_calculated_at";

/**
 * Verifică dacă coloanele COGS există în tabela menu.
 * Dacă nu există, le creează (migrare automată).
 * 
 * @returns {Promise<boolean>}
 */
async function ensureCogsColumnsExist() {
  const db = await dbPromise;
  
  try {
    // Security: Validate table name (PRAGMA doesn't support placeholders)
    const ALLOWED_TABLES = ['menu', 'products'];
    if (!ALLOWED_TABLES.includes(MENU_TABLE.toLowerCase())) {
      throw new Error(`Invalid table name: ${MENU_TABLE}`);
    }
    
    // Verifică dacă coloanele există
    const tableInfo = await db.all(`PRAGMA table_info(${MENU_TABLE})`);
    const columns = tableInfo.map(col => col.name.toLowerCase());
    
    const needsFoodCost = !columns.includes(MENU_FOOD_COST_COL.toLowerCase());
    const needsFoodCostPercent = !columns.includes(MENU_FOOD_COST_PERCENT_COL.toLowerCase());
    const needsMarginPercent = !columns.includes(MENU_MARGIN_PERCENT_COL.toLowerCase());
    const needsLastCogsAt = !columns.includes(MENU_LAST_COGS_AT_COL.toLowerCase());
    
    if (needsFoodCost) {
      await db.run(`ALTER TABLE ${MENU_TABLE} ADD COLUMN ${MENU_FOOD_COST_COL} REAL DEFAULT 0`);
      console.log(`✅ Coloană ${MENU_FOOD_COST_COL} adăugată în ${MENU_TABLE}`);
    }
    
    if (needsFoodCostPercent) {
      await db.run(`ALTER TABLE ${MENU_TABLE} ADD COLUMN ${MENU_FOOD_COST_PERCENT_COL} REAL DEFAULT 0`);
      console.log(`✅ Coloană ${MENU_FOOD_COST_PERCENT_COL} adăugată în ${MENU_TABLE}`);
    }
    
    if (needsMarginPercent) {
      await db.run(`ALTER TABLE ${MENU_TABLE} ADD COLUMN ${MENU_MARGIN_PERCENT_COL} REAL DEFAULT 0`);
      console.log(`✅ Coloană ${MENU_MARGIN_PERCENT_COL} adăugată în ${MENU_TABLE}`);
    }
    
    if (needsLastCogsAt) {
      await db.run(`ALTER TABLE ${MENU_TABLE} ADD COLUMN ${MENU_LAST_COGS_AT_COL} DATETIME`);
      console.log(`✅ Coloană ${MENU_LAST_COGS_AT_COL} adăugată în ${MENU_TABLE}`);
    }
    
    return true;
  } catch (err) {
    // Dacă coloana există deja, ignoră eroarea
    if (err.message && err.message.includes('duplicate column')) {
      return true;
    }
    console.error(`❌ Eroare la verificarea coloanelor COGS:`, err.message);
    return false;
  }
}

/**
 * Actualizează COGS în tabela de produse pentru un singur produs.
 *
 * @param {number} productId
 * @returns {Promise<{
 *   productId: number,
 *   success: boolean,
 *   error?: string,
 *   cogs?: Awaited<ReturnType<typeof cogsEngine.calculateCogsForProduct>>
 * }>}
 */
async function syncCogsForProduct(productId) {
  const db = await dbPromise;
  
  // Asigură că coloanele există
  await ensureCogsColumnsExist();
  
  const cogs = await cogsEngine.calculateCogsForProduct(productId);
  if (!cogs) {
    return {
      productId,
      success: false,
      error: "Nu există rețetă pentru acest produs."
    };
  }

  if (cogs.errors && cogs.errors.length > 0) {
    return {
      productId,
      success: false,
      error: `Rețetă invalidă: ${cogs.errors.join("; ")}`
    };
  }

  const foodCost = cogs.totalCostPerPortion || 0;
  const foodCostPercent = cogs.foodCostPercent || 0;
  const marginPercent = cogs.marginPercent || 0;

  const sql = `
    UPDATE ${MENU_TABLE}
    SET
      ${MENU_FOOD_COST_COL} = ?,
      ${MENU_FOOD_COST_PERCENT_COL} = ?,
      ${MENU_MARGIN_PERCENT_COL} = ?,
      ${MENU_LAST_COGS_AT_COL} = CURRENT_TIMESTAMP
    WHERE ${MENU_ID_COL} = ?
  `;

  try {
    await db.run(sql, [
      foodCost,
      foodCostPercent,
      marginPercent,
      productId
    ]);

    return {
      productId,
      success: true,
      cogs
    };
  } catch (err) {
    return {
      productId,
      success: false,
      error: `Eroare DB la update COGS: ${err.message}`
    };
  }
}

/**
 * Sincronizează COGS pentru toate produsele din Master Data.
 *
 * @returns {Promise<{
 *   totalProducts: number,
 *   updated: number,
 *   failed: number,
 *   errors: { productId: number, error: string }[]
 * }>}
 */
async function syncCogsForAllProducts() {
  // Asigură că coloanele există
  await ensureCogsColumnsExist();
  
  const allProducts = productsMaster.getAllProducts();
  let updated = 0;
  let failed = 0;
  const errors = [];

  for (const prod of allProducts) {
    const productId = prod.id;
    if (!productId) continue;

    const result = await syncCogsForProduct(productId);
    if (!result.success) {
      failed += 1;
      errors.push({ productId, error: result.error });
    } else {
      updated += 1;
    }
  }

  return {
    totalProducts: allProducts.length,
    updated,
    failed,
    errors
  };
}

module.exports = {
  syncCogsForProduct,
  syncCogsForAllProducts,
  ensureCogsColumnsExist
};

