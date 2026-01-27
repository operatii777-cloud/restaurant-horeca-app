/**
 * ACCOUNTING MODULE v8.0 - Service Layer
 * 
 * Business logic pentru modulul CONTABILITATE
 */

const { dbPromise } = require('../../../../database');

// Helper to get DB with timeout
async function getDb() {
  try {
    return await Promise.race([
      dbPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
    ]);
  } catch (dbError) {
    console.warn('⚠️ Database not ready for accounting:', dbError.message);
    throw dbError;
  }
}

// Helper functions for database queries
async function dbAll(query, params = []) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function dbGet(query, params = []) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function dbRun(query, params = []) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * STOCK BALANCE SERVICE
 */

async function generateStockBalanceSnapshot(locationId, reportDate) {
  const db = await getDb();
  
  // Generează report_id unic
  const reportId = `SB-${locationId}-${reportDate.replace(/-/g, '')}`;
  
  // Verifică dacă snapshot-ul există deja
  const existing = await dbGet(
    'SELECT id FROM stock_balance_snapshot WHERE report_id = ?',
    [reportId]
  );
  
  if (existing) {
    return existing.id;
  }
  
  // Creează snapshot nou
  const snapshotResult = await dbRun(
    `INSERT INTO stock_balance_snapshot (report_id, location_id, report_date)
     VALUES (?, ?, ?)`,
    [reportId, locationId, reportDate]
  );
  
  const snapshotId = snapshotResult.lastID;
  
  // Calculează balanța pentru fiecare ingredient
  // Agregă din stock_movements pentru perioada până la report_date
  const ingredients = await dbAll(
    `SELECT DISTINCT ingredient_id FROM stock_movements
     WHERE movement_date <= DATE(?, '+1 day')
     ORDER BY ingredient_id`,
    [reportDate]
  );
  
  for (const ing of ingredients) {
    const ingredientId = ing.ingredient_id;
    
    // Obține stocul inițial (ultimul snapshot sau 0)
    const lastSnapshot = await dbGet(
      `SELECT closing_stock, closing_value FROM stock_balance_items
       WHERE ingredient_id = ? AND snapshot_id IN (
         SELECT id FROM stock_balance_snapshot
         WHERE location_id = ? AND report_date < ?
         ORDER BY report_date DESC LIMIT 1
       )`,
      [ingredientId, locationId, reportDate]
    );
    
    const openingStock = lastSnapshot?.closing_stock || 0;
    const openingValue = lastSnapshot?.closing_value || 0;
    
    // Calculează intrări (IN movements)
    // stock_movements nu are unit_price, trebuie să obținem din nir_items sau ingredients
    const entries = await dbAll(
      `SELECT COALESCE(SUM(quantity), 0) as qty
       FROM stock_movements
       WHERE ingredient_id = ? 
         AND movement_type IN ('in', 'purchase', 'transfer_in')
         AND DATE(movement_date) <= DATE(?, '+1 day')`,
      [ingredientId, reportDate]
    );
    
    const entriesQty = parseFloat(entries[0]?.qty || 0);
    
    // Obține preț mediu din nir_items sau ingredients
    let avgPrice = 0;
    try {
      const nirPrice = await dbGet(
        `SELECT AVG(unit_price) as avg_price FROM nir_items
         WHERE ingredient_id = ? AND unit_price > 0`,
        [ingredientId]
      );
      avgPrice = parseFloat(nirPrice?.avg_price || 0);
    } catch (e) {
      // Fallback: preț din ingredients
    }
    
    if (avgPrice === 0) {
      const ing = await dbGet('SELECT avg_price FROM ingredients WHERE id = ?', [ingredientId]);
      avgPrice = parseFloat(ing?.avg_price || 0);
    }
    
    const entriesValue = entriesQty * avgPrice;
    
    // Calculează consumuri (OUT movements)
    const consumption = await dbAll(
      `SELECT 
        COALESCE(SUM(quantity), 0) as qty
       FROM stock_movements
       WHERE ingredient_id = ?
         AND movement_type IN ('out', 'consumption', 'production')
         AND DATE(movement_date) <= DATE(?, '+1 day')`,
      [ingredientId, reportDate]
    );
    
    const consumptionQty = parseFloat(consumption[0]?.qty || 0);
    const consumptionValue = consumptionQty * avgPrice;
    
    // Calculează waste (WASTE movements)
    const waste = await dbAll(
      `SELECT 
        COALESCE(SUM(quantity), 0) as qty
       FROM stock_movements
       WHERE ingredient_id = ?
         AND movement_type = 'waste'
         AND DATE(movement_date) <= DATE(?, '+1 day')`,
      [ingredientId, reportDate]
    );
    
    const wasteQty = parseFloat(waste[0]?.qty || 0);
    const wasteValue = wasteQty * avgPrice;
    
    // Calculează stoc final
    const closingStock = openingStock + entriesQty - consumptionQty - wasteQty;
    const closingValue = openingValue + entriesValue - consumptionValue - wasteValue;
    
    // Obține unit_name din ingredients
    const ingredient = await dbGet(
      'SELECT unit FROM ingredients WHERE id = ?',
      [ingredientId]
    );
    
    // Inserează item în snapshot
    await dbRun(
      `INSERT INTO stock_balance_items (
        snapshot_id, ingredient_id, unit_name,
        opening_stock, opening_value,
        entries_qty, entries_value,
        consumption_qty, consumption_value,
        waste_qty, waste_value,
        closing_stock, closing_value,
        valuation_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        snapshotId, ingredientId, ingredient?.unit || 'kg',
        openingStock, openingValue,
        entriesQty, entriesValue,
        consumptionQty, consumptionValue,
        wasteQty, wasteValue,
        closingStock, closingValue,
        'weighted_average'
      ]
    );
  }
  
  return snapshotId;
}

async function getStockBalance(filters) {
  const { locationId, reportDate, subcategory } = filters;
  
  // Generează snapshot dacă nu există
  const snapshotId = await generateStockBalanceSnapshot(locationId, reportDate);
  
  // Obține snapshot ID
  const snapshot = await dbGet(
    'SELECT id FROM stock_balance_snapshot WHERE report_id = ?',
    [snapshotId]
  );
  
  if (!snapshot) {
    throw new Error('Snapshot not found');
  }
  
  // Construiește query pentru items
  let itemsQuery = `
    SELECT 
      sbi.id,
      sbi.ingredient_id,
      i.name as nomenclature,
      sbi.unit_name as unit,
      sbi.opening_stock,
      sbi.opening_value,
      sbi.entries_qty,
      sbi.entries_value,
      sbi.consumption_qty,
      sbi.consumption_value,
      sbi.waste_qty,
      sbi.waste_value,
      sbi.closing_stock,
      sbi.closing_value
    FROM stock_balance_items sbi
    JOIN ingredients i ON sbi.ingredient_id = i.id
    WHERE sbi.snapshot_id = ?
  `;
  
  const params = [snapshot.id];
  
  if (subcategory) {
    itemsQuery += ' AND i.category = ?';
    params.push(subcategory);
  }
  
  itemsQuery += ' ORDER BY i.name';
  
  const items = await dbAll(itemsQuery, params);
  
  // Calculează totaluri
  const totals = items.reduce((acc, item) => ({
    opening_value: acc.opening_value + (parseFloat(item.opening_value) || 0),
    entries_value: acc.entries_value + (parseFloat(item.entries_value) || 0),
    consumption_value: acc.consumption_value + (parseFloat(item.consumption_value) || 0),
    waste_value: acc.waste_value + (parseFloat(item.waste_value) || 0),
    closing_value: acc.closing_value + (parseFloat(item.closing_value) || 0)
  }), {
    opening_value: 0,
    entries_value: 0,
    consumption_value: 0,
    waste_value: 0,
    closing_value: 0
  });
  
  return {
    snapshot_id: snapshot.id,
    report_id: snapshotId,
    report_date: reportDate,
    location_id: locationId,
    items: items.map(item => ({
      ...item,
      opening_stock: parseFloat(item.opening_stock) || 0,
      opening_value: parseFloat(item.opening_value) || 0,
      entries_qty: parseFloat(item.entries_qty) || 0,
      entries_value: parseFloat(item.entries_value) || 0,
      consumption_qty: parseFloat(item.consumption_qty) || 0,
      consumption_value: parseFloat(item.consumption_value) || 0,
      waste_qty: parseFloat(item.waste_qty) || 0,
      waste_value: parseFloat(item.waste_value) || 0,
      closing_stock: parseFloat(item.closing_stock) || 0,
      closing_value: parseFloat(item.closing_value) || 0
    })),
    totals
  };
}

async function getStockVariance(snapshotId) {
  const variance = await dbAll(
    `SELECT 
      svd.id,
      svd.ingredient_id,
      i.name as nomenclature,
      svd.theoretical_stock,
      svd.physical_stock,
      svd.variance_qty,
      svd.variance_percentage,
      svd.variance_type,
      svd.variance_reason
    FROM stock_variance_detail svd
    JOIN ingredients i ON svd.ingredient_id = i.id
    WHERE svd.snapshot_id = ?
    ORDER BY ABS(svd.variance_qty) DESC`,
    [snapshotId]
  );
  
  return variance.map(v => ({
    ...v,
    theoretical_stock: parseFloat(v.theoretical_stock) || 0,
    physical_stock: parseFloat(v.physical_stock) || 0,
    variance_qty: parseFloat(v.variance_qty) || 0,
    variance_percentage: parseFloat(v.variance_percentage) || 0
  }));
}

/**
 * PRODUCT ACCOUNTING MAPPING SERVICE
 */

async function getProductMapping(ingredientId) {
  const mapping = await dbGet(
    `SELECT 
      pam.*,
      aa_stock.account_code as stock_account_code,
      aa_stock.account_name as stock_account_name,
      aa_consumption.account_code as consumption_account_code,
      aa_consumption.account_name as consumption_account_name,
      aa_entry.account_code as entry_account_code,
      aa_entry.account_name as entry_account_name,
      aa_cogs.account_code as cogs_account_code,
      aa_cogs.account_name as cogs_account_name
    FROM product_accounting_mapping pam
    LEFT JOIN accounting_accounts aa_stock ON pam.stock_account_id = aa_stock.id
    LEFT JOIN accounting_accounts aa_consumption ON pam.consumption_account_id = aa_consumption.id
    LEFT JOIN accounting_accounts aa_entry ON pam.entry_account_id = aa_entry.id
    LEFT JOIN accounting_accounts aa_cogs ON pam.cogs_account_id = aa_cogs.id
    WHERE pam.ingredient_id = ?`,
    [ingredientId]
  );
  
  return mapping;
}

async function updateProductMapping(data) {
  const {
    ingredient_id,
    stock_account_id,
    consumption_account_id,
    entry_account_id,
    cogs_account_id,
    sub_account_code,
    valuation_method,
    change_reason,
    modified_by
  } = data;
  
  // Verifică dacă maparea există
  const existing = await getProductMapping(ingredient_id);
  
  if (existing) {
    // Update
    await dbRun(
      `UPDATE product_accounting_mapping
       SET stock_account_id = ?,
           consumption_account_id = ?,
           entry_account_id = ?,
           cogs_account_id = ?,
           sub_account_code = ?,
           valuation_method = ?,
           modified_by = ?,
           modified_at = CURRENT_TIMESTAMP
       WHERE ingredient_id = ?`,
      [
        stock_account_id,
        consumption_account_id,
        entry_account_id,
        cogs_account_id,
        sub_account_code,
        valuation_method,
        modified_by,
        ingredient_id
      ]
    );
  } else {
    // Insert
    await dbRun(
      `INSERT INTO product_accounting_mapping (
        ingredient_id, stock_account_id, consumption_account_id,
        entry_account_id, cogs_account_id, sub_account_code,
        valuation_method, modified_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ingredient_id,
        stock_account_id,
        consumption_account_id,
        entry_account_id,
        cogs_account_id,
        sub_account_code,
        valuation_method,
        modified_by
      ]
    );
  }
  
  // Inserează în history (trigger-ul ar trebui să facă asta, dar facem manual pentru siguranță)
  if (existing && change_reason) {
    const oldAccountCode = existing.stock_account_code;
    const newAccount = await dbGet(
      'SELECT account_code FROM accounting_accounts WHERE id = ?',
      [stock_account_id]
    );
    
    // Obține mapping_id
    const mapping = await dbGet(
      'SELECT id FROM product_accounting_mapping WHERE ingredient_id = ?',
      [ingredient_id]
    );
    
    if (mapping) {
      await dbRun(
        `INSERT INTO product_accounting_mapping_history (
          mapping_id, ingredient_id, old_account_code, new_account_code,
          change_reason, changed_by
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          mapping.id,
          ingredient_id,
          oldAccountCode,
          newAccount?.account_code || '',
          change_reason,
          modified_by
        ]
      );
    }
  }
  
  return { success: true };
}

async function getProductMappingHistory(ingredientId) {
  try {
    const history = await dbAll(
      `SELECT 
        pah.id,
        pah.old_account_code,
        pah.new_account_code,
        pah.change_reason,
        pah.changed_by,
        pah.changed_at
      FROM product_accounting_mapping_history pah
      WHERE pah.ingredient_id = ?
      ORDER BY pah.changed_at DESC`,
      [ingredientId]
    );
    
    return history;
  } catch (error) {
    // Dacă tabela nu există, returnează array gol
    if (error.message.includes('no such table')) {
      return [];
    }
    throw error;
  }
}

/**
 * DAILY BALANCE SERVICE
 */

async function getDailyBalance(filters) {
  const { locationId, reportDate } = filters;
  
  // Verifică dacă raportul există
  let report = await dbGet(
    'SELECT id FROM daily_balance_report WHERE location_id = ? AND report_date = ?',
    [locationId, reportDate]
  );
  
  if (!report) {
    // Creează raport nou
    const result = await dbRun(
      `INSERT INTO daily_balance_report (report_date, report_time, location_id)
       VALUES (?, CURRENT_TIME, ?)`,
      [reportDate, locationId]
    );
    report = { id: result.lastID };
  }
  
  // Obține detalii
  const details = await dbAll(
    `SELECT 
      dbd.id,
      dbd.ingredient_id,
      i.name as nomenclature,
      dbd.unit_name as unit,
      dbd.opening_stock,
      dbd.opening_value,
      dbd.entries_today_qty,
      dbd.entries_today_value,
      dbd.consumption_today_qty,
      dbd.consumption_today_value,
      dbd.closing_stock,
      dbd.closing_value,
      dbd.variance_qty
    FROM daily_balance_details dbd
    JOIN ingredients i ON dbd.ingredient_id = i.id
    WHERE dbd.report_id = ?
    ORDER BY i.name`,
    [report.id]
  );
  
  // Calculează totaluri
  const totals = details.reduce((acc, item) => ({
    opening_value: acc.opening_value + (parseFloat(item.opening_value) || 0),
    entries_value: acc.entries_value + (parseFloat(item.entries_today_value) || 0),
    consumption_value: acc.consumption_value + (parseFloat(item.consumption_today_value) || 0),
    closing_value: acc.closing_value + (parseFloat(item.closing_value) || 0)
  }), {
    opening_value: 0,
    entries_value: 0,
    consumption_value: 0,
    closing_value: 0
  });
  
  return {
    report_id: report.id,
    report_date: reportDate,
    location_id: locationId,
    items: details.map(item => ({
      ...item,
      opening_stock: parseFloat(item.opening_stock) || 0,
      opening_value: parseFloat(item.opening_value) || 0,
      entries_today_qty: parseFloat(item.entries_today_qty) || 0,
      entries_today_value: parseFloat(item.entries_today_value) || 0,
      consumption_today_qty: parseFloat(item.consumption_today_qty) || 0,
      consumption_today_value: parseFloat(item.consumption_today_value) || 0,
      closing_stock: parseFloat(item.closing_stock) || 0,
      closing_value: parseFloat(item.closing_value) || 0,
      variance_qty: parseFloat(item.variance_qty) || 0
    })),
    totals
  };
}

/**
 * CONSUMPTION SITUATION SERVICE
 */

async function getConsumptionSituation(filters) {
  const { locationId, periodStart, periodEnd } = filters;
  
  // Verifică dacă raportul există
  let report = await dbGet(
    `SELECT id FROM consumption_situation_report 
     WHERE location_id = ? AND period_start = ? AND period_end = ?`,
    [locationId, periodStart, periodEnd]
  );
  
  if (!report) {
    // Creează raport nou
    const result = await dbRun(
      `INSERT INTO consumption_situation_report (period_start, period_end, location_id)
       VALUES (?, ?, ?)`,
      [periodStart, periodEnd, locationId]
    );
    report = { id: result.lastID };
  }
  
  // Obține toate ingredientele cu mișcări în perioadă
  const ingredients = await dbAll(
    `SELECT DISTINCT i.id, i.name, i.unit, i.category
     FROM ingredients i
     WHERE EXISTS (
       SELECT 1 FROM stock_movements sm
       WHERE sm.ingredient_id = i.id
         AND DATE(sm.movement_date) BETWEEN ? AND ?
     )
     ORDER BY i.name`,
    [periodStart, periodEnd]
  );
  
  const items = [];
  let totalDishesSold = 0;
  
  for (const ing of ingredients) {
    // Stoc inițial (la începutul perioadei)
    const openingStock = await dbAll(
      `SELECT COALESCE(SUM(CASE WHEN movement_type IN ('in', 'purchase', 'transfer_in') THEN quantity ELSE -quantity END), 0) as stock
       FROM stock_movements
       WHERE ingredient_id = ? AND DATE(movement_date) < ?`,
      [ing.id, periodStart]
    );
    const openingQty = parseFloat(openingStock[0]?.stock || 0);
    
    // Obține preț mediu pentru valoare (din nir_items sau ingredients)
    let unitPrice = 0;
    try {
      const nirPrice = await dbGet(
        `SELECT AVG(unit_price) as avg_price FROM nir_items
         WHERE ingredient_id = ? AND unit_price > 0`,
        [ing.id]
      );
      unitPrice = parseFloat(nirPrice?.avg_price || 0);
    } catch (e) {
      // Fallback
    }
    
    if (unitPrice === 0) {
      const ingPrice = await dbGet('SELECT avg_price FROM ingredients WHERE id = ?', [ing.id]);
      unitPrice = parseFloat(ingPrice?.avg_price || 0);
    }
    
    const openingValue = openingQty * unitPrice;
    
    // Intrări (purchases) în perioadă
    const purchases = await dbAll(
      `SELECT COALESCE(SUM(quantity), 0) as qty
       FROM stock_movements
       WHERE ingredient_id = ? 
         AND movement_type IN ('in', 'purchase', 'transfer_in')
         AND DATE(movement_date) BETWEEN ? AND ?`,
      [ing.id, periodStart, periodEnd]
    );
    const purchasesQty = parseFloat(purchases[0]?.qty || 0);
    const purchasesValue = purchasesQty * unitPrice;
    
    // Disponibil = stoc inițial + intrări
    const availableQty = openingQty + purchasesQty;
    const availableValue = openingValue + purchasesValue;
    
    // Consumuri în perioadă
    const consumption = await dbAll(
      `SELECT SUM(quantity) as qty, SUM(quantity * COALESCE(unit_price, 0)) as value
       FROM stock_movements
       WHERE ingredient_id = ?
         AND movement_type IN ('out', 'consumption', 'production')
         AND DATE(movement_date) BETWEEN ? AND ?`,
      [ing.id, periodStart, periodEnd]
    );
    const consumptionQty = parseFloat(consumption[0]?.qty || 0);
    const consumptionValue = parseFloat(consumption[0]?.value || 0) || (consumptionQty * unitPrice);
    
    // Stoc final
    const closingQty = availableQty - consumptionQty;
    const closingValue = availableValue - consumptionValue;
    
    // Procent consum
    const consumptionPercentage = availableQty > 0 ? (consumptionQty / availableQty) * 100 : 0;
    
    // Obține consumuri pe dieșuri (din recipes și orders)
    const consumptionByDishes = await dbAll(
      `SELECT 
        p.id as dish_id,
        p.name as dish_name,
        SUM(oi.quantity) as number_of_dishes_sold,
        SUM(r.quantity * oi.quantity) as consumption_qty,
        SUM(r.quantity * oi.quantity * ?) as consumption_value
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN recipes r ON oi.product_id = r.product_id
       JOIN products p ON r.product_id = p.id
       WHERE r.ingredient_id = ?
         AND o.status IN ('paid', 'completed', 'delivered')
         AND DATE(o.timestamp) BETWEEN ? AND ?
       GROUP BY p.id, p.name`,
      [unitPrice, ing.id, periodStart, periodEnd]
    );
    
    const dishesData = consumptionByDishes.map(dish => {
      const dishesSold = parseInt(dish.number_of_dishes_sold || 0);
      const qty = parseFloat(dish.consumption_qty || 0);
      const consumptionPerDish = dishesSold > 0 ? qty / dishesSold : 0;
      totalDishesSold += dishesSold;
      
      return {
        id: dish.dish_id,
        dish_name: dish.dish_name,
        consumption_qty: qty,
        consumption_value: parseFloat(dish.consumption_value || 0),
        number_of_dishes_sold: dishesSold,
        consumption_per_dish: consumptionPerDish
      };
    });
    
    items.push({
      id: ing.id,
      nomenclature: ing.name,
      unit: ing.unit || 'kg',
      opening_stock: openingQty,
      opening_value: openingValue,
      purchases_qty: purchasesQty,
      purchases_value: purchasesValue,
      available_qty: availableQty,
      available_value: availableValue,
      consumption_qty: consumptionQty,
      consumption_value: consumptionValue,
      consumption_percentage: consumptionPercentage,
      closing_stock: closingQty,
      closing_value: closingValue,
      consumption_by_dishes: dishesData
    });
  }
  
  // Calculează totaluri
  const totals = items.reduce((acc, item) => ({
    opening_value: acc.opening_value + item.opening_value,
    purchases_value: acc.purchases_value + item.purchases_value,
    available_value: acc.available_value + item.available_value,
    consumption_value: acc.consumption_value + item.consumption_value,
    closing_value: acc.closing_value + item.closing_value
  }), {
    opening_value: 0,
    purchases_value: 0,
    available_value: 0,
    consumption_value: 0,
    closing_value: 0
  });
  
  // Procent consum mediu
  const averageConsumptionPercentage = items.length > 0
    ? items.reduce((sum, item) => sum + item.consumption_percentage, 0) / items.length
    : 0;
  
  return {
    items,
    totals,
    average_consumption_percentage: averageConsumptionPercentage,
    total_dishes_sold: totalDishesSold
  };
}

/**
 * ENTRIES BY VAT SERVICE
 */

async function getEntriesByVat(filters) {
  const { locationId, periodStart, periodEnd } = filters;
  
  // Verifică dacă raportul există
  let report = await dbGet(
    `SELECT id FROM entries_by_vat_account_report
     WHERE location_id = ? AND period_start = ? AND period_end = ?`,
    [locationId, periodStart, periodEnd]
  );
  
  if (!report) {
    // Creează raport nou
    const result = await dbRun(
      `INSERT INTO entries_by_vat_account_report (period_start, period_end, location_id)
       VALUES (?, ?, ?)`,
      [periodStart, periodEnd, locationId]
    );
    report = { id: result.lastID };
  }
  
  // Obține toate intrările (NIR items) din perioadă
  const nirEntries = await dbAll(
    `SELECT 
      ni.id,
      ni.ingredient_id,
      i.name as nomenclature,
      ni.quantity,
      ni.unit_price,
      ni.vat_rate,
      ni.total_price,
      nd.nir_date as document_date,
      nd.nir_number as document_number,
      s.name as supplier_name,
      s.id as supplier_id
     FROM nir_items ni
     JOIN nir_documents nd ON ni.nir_id = nd.id
     JOIN ingredients i ON ni.ingredient_id = i.id
     LEFT JOIN suppliers s ON nd.supplier_id = s.id
     WHERE DATE(nd.nir_date) BETWEEN ? AND ?
     ORDER BY nd.nir_date, ni.id`,
    [periodStart, periodEnd]
  );
  
  // Agregă după cota TVA
  const vatMap = new Map();
  const accountMap = new Map();
  
  for (const entry of nirEntries) {
    const vatRate = parseFloat(entry.vat_rate || 0);
    const baseValue = parseFloat(entry.total_price || 0) / (1 + vatRate / 100);
    const vatValue = parseFloat(entry.total_price || 0) - baseValue;
    const totalValue = parseFloat(entry.total_price || 0);
    
    // Agregă după TVA
    if (!vatMap.has(vatRate)) {
      vatMap.set(vatRate, {
        vat_percentage: vatRate,
        total_base_value: 0,
        total_vat_value: 0,
        total_with_vat: 0
      });
    }
    const vatSummary = vatMap.get(vatRate);
    vatSummary.total_base_value += baseValue;
    vatSummary.total_vat_value += vatValue;
    vatSummary.total_with_vat += totalValue;
    
    // Obține contul contabil pentru ingredient (din product_accounting_mapping)
    const mapping = await dbGet(
      `SELECT entry_account_id, accounting_accounts.account_code, accounting_accounts.account_name
       FROM product_accounting_mapping
       LEFT JOIN accounting_accounts ON product_accounting_mapping.entry_account_id = accounting_accounts.id
       WHERE ingredient_id = ?`,
      [entry.ingredient_id]
    );
    
    const accountCode = mapping?.account_code || '401'; // Default: Achiziții
    const accountName = mapping?.account_name || 'Achiziții Materii Prime';
    const accountId = mapping?.entry_account_id || null;
    
    // Agregă după cont contabil
    if (!accountMap.has(accountCode)) {
      accountMap.set(accountCode, {
        account_code: accountCode,
        account_name: accountName,
        account_id: accountId,
        total_base_value: 0,
        total_vat_value: 0,
        total_with_vat: 0,
        document_count: 0,
        entries: []
      });
    }
    const accountEntry = accountMap.get(accountCode);
    accountEntry.total_base_value += baseValue;
    accountEntry.total_vat_value += vatValue;
    accountEntry.total_with_vat += totalValue;
    accountEntry.document_count += 1;
    
    // Adaugă detaliu
    accountEntry.entries.push({
      id: entry.id,
      nomenclature: entry.nomenclature,
      quantity_entered: parseFloat(entry.quantity || 0),
      average_cost_per_unit: parseFloat(entry.unit_price || 0),
      base_value: baseValue,
      vat_percentage: vatRate,
      vat_value: vatValue,
      total_value: totalValue,
      document_type: 'NIR',
      document_number: entry.document_number,
      document_date: entry.document_date,
      supplier_name: entry.supplier_name
    });
  }
  
  // Convertește map-urile în array-uri
  const vatSummary = Array.from(vatMap.values()).map((v, idx) => ({
    id: idx + 1,
    ...v
  }));
  
  const entriesByAccount = Array.from(accountMap.values()).map((acc, idx) => ({
    id: idx + 1,
    ...acc
  }));
  
  // Calculează totaluri generale
  const totals = {
    total_base_value: vatSummary.reduce((sum, v) => sum + v.total_base_value, 0),
    total_vat_value: vatSummary.reduce((sum, v) => sum + v.total_vat_value, 0),
    total_with_vat: vatSummary.reduce((sum, v) => sum + v.total_with_vat, 0)
  };
  
  return {
    vat_summary: vatSummary,
    entries_by_account: entriesByAccount,
    totals
  };
}

/**
 * GET Digital Signatures
 * Lista semnături digitale pentru documente contabile
 */
async function getDigitalSignatures() {
  try {
    // Verifică dacă tabelul există
    const tableCheck = await dbGet(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='digital_signatures'
    `);
    
    if (!tableCheck) {
      // Tabelul nu există, returnează array gol
      return [];
    }
    
    const signatures = await dbAll(`
      SELECT 
        id,
        document_type,
        document_id,
        document_number,
        signed_by,
        signature_hash,
        signature_time,
        signature_method,
        certificate_info,
        is_valid,
        verified_at,
        verified_by
      FROM digital_signatures
      ORDER BY signature_time DESC
    `);
    
    return signatures || [];
  } catch (error) {
    console.error('Error in getDigitalSignatures:', error);
    if (error.message.includes('no such table')) {
      return [];
    }
    throw error;
  }
}

/**
 * GET Digital Signature by ID
 * Detalii semnătură digitală
 */
async function getDigitalSignatureById(id) {
  try {
    const tableCheck = await dbGet(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='digital_signatures'
    `);
    
    if (!tableCheck) {
      return null;
    }
    
    const signature = await dbGet(`
      SELECT 
        id,
        document_type,
        document_id,
        document_number,
        signed_by,
        signature_hash,
        signature_time,
        signature_method,
        certificate_info,
        is_valid,
        verified_at,
        verified_by
      FROM digital_signatures
      WHERE id = ?
    `, [id]);
    
    return signature || null;
  } catch (error) {
    console.error('Error in getDigitalSignatureById:', error);
    if (error.message.includes('no such table')) {
      return null;
    }
    throw error;
  }
}

/**
 * POST Verify Digital Signature
 * Verificare semnătură digitală
 */
async function verifyDigitalSignature(id) {
  try {
    const tableCheck = await dbGet(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='digital_signatures'
    `);
    
    if (!tableCheck) {
      throw new Error('Tabelul digital_signatures nu există');
    }
    
    // Verifică dacă semnătura există
    const signature = await getDigitalSignatureById(id);
    if (!signature) {
      throw new Error('Semnătură nu a fost găsită');
    }
    
    // Actualizează statusul de verificare
    // În producție, aici ar trebui să se facă verificarea reală a semnăturii
    const now = new Date().toISOString();
    await dbRun(`
      UPDATE digital_signatures
      SET is_valid = 1,
          verified_at = ?,
          verified_by = 'system'
      WHERE id = ?
    `, [now, id]);
    
    return {
      id,
      is_valid: true,
      verified_at: now,
      verified_by: 'system'
    };
  } catch (error) {
    console.error('Error in verifyDigitalSignature:', error);
    throw error;
  }
}

/**
 * GET Permissions
 * Lista permisiuni contabilitate
 */
async function getPermissions() {
  try {
    // Verifică dacă tabelul există
    const tableCheck = await dbGet(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='accounting_permissions'
    `);
    
    if (!tableCheck) {
      // Returnează permisiuni default dacă tabelul nu există
      return [
        { id: 1, name: 'Vizualizare Rapoarte', code: 'reports.view', description: 'Poate vizualiza rapoarte contabile', category: 'reports', is_active: 1 },
        { id: 2, name: 'Export Date', code: 'export.data', description: 'Poate exporta date contabile', category: 'export', is_active: 1 },
        { id: 3, name: 'Gestionare Setări', code: 'settings.manage', description: 'Poate modifica setările contabilitate', category: 'settings', is_active: 1 },
        { id: 4, name: 'Vizualizare Audit', code: 'audit.view', description: 'Poate vizualiza log-uri audit', category: 'audit', is_active: 1 }
      ];
    }
    
    const permissions = await dbAll(`
      SELECT 
        id,
        name,
        code,
        description,
        category,
        is_active
      FROM accounting_permissions
      ORDER BY category, name
    `);
    
    return permissions || [];
  } catch (error) {
    console.error('Error in getPermissions:', error);
    if (error.message.includes('no such table')) {
      return [];
    }
    throw error;
  }
}

/**
 * GET User Permissions
 * Lista permisiuni utilizatori
 */
async function getUserPermissions() {
  try {
    const tableCheck = await dbGet(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='accounting_user_permissions'
    `);
    
    if (!tableCheck) {
      return [];
    }
    
    const userPermissions = await dbAll(`
      SELECT 
        up.user_id,
        u.username,
        up.permission_id,
        p.name as permission_name,
        up.granted_at,
        up.granted_by
      FROM accounting_user_permissions up
      LEFT JOIN users u ON u.id = up.user_id
      LEFT JOIN accounting_permissions p ON p.id = up.permission_id
      ORDER BY u.username, p.name
    `);
    
    return userPermissions || [];
  } catch (error) {
    console.error('Error in getUserPermissions:', error);
    if (error.message.includes('no such table')) {
      return [];
    }
    throw error;
  }
}

/**
 * GET Users
 * Lista utilizatori
 */
async function getUsers() {
  try {
    const tableCheck = await dbGet(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `);
    
    if (!tableCheck) {
      return [];
    }
    
    const users = await dbAll(`
      SELECT 
        id,
        username,
        email,
        role_id,
        (SELECT name FROM user_roles WHERE id = users.role_id) as role
      FROM users
      WHERE is_active = 1
      ORDER BY username
    `);
    
    return users || [];
  } catch (error) {
    console.error('Error in getUsers:', error);
    if (error.message.includes('no such table')) {
      return [];
    }
    throw error;
  }
}

/**
 * POST Assign User Permission
 * Asignează permisiune utilizator
 */
async function assignUserPermission(userId, permissionId) {
  try {
    // Verifică dacă tabelele există
    const permissionsTable = await dbGet(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='accounting_permissions'
    `);
    
    const userPermsTable = await dbGet(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='accounting_user_permissions'
    `);
    
    if (!userPermsTable) {
      // Creează tabelul dacă nu există
      await dbRun(`
        CREATE TABLE IF NOT EXISTS accounting_user_permissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          permission_id INTEGER NOT NULL,
          granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          granted_by TEXT,
          UNIQUE(user_id, permission_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (permission_id) REFERENCES accounting_permissions(id) ON DELETE CASCADE
        )
      `);
    }
    
    // Verifică dacă permisiunea există deja
    const existing = await dbGet(`
      SELECT id FROM accounting_user_permissions
      WHERE user_id = ? AND permission_id = ?
    `, [userId, permissionId]);
    
    if (existing) {
      throw new Error('Permisiunea este deja asignată acestui utilizator');
    }
    
    // Asignează permisiunea
    const now = new Date().toISOString();
    const result = await dbRun(`
      INSERT INTO accounting_user_permissions (user_id, permission_id, granted_at, granted_by)
      VALUES (?, ?, ?, ?)
    `, [userId, permissionId, now, 'system']);
    
    return {
      id: result.lastID,
      user_id: userId,
      permission_id: permissionId,
      granted_at: now
    };
  } catch (error) {
    console.error('Error in assignUserPermission:', error);
    throw error;
  }
}

/**
 * DELETE Remove User Permission
 * Elimină permisiune utilizator
 */
async function removeUserPermission(userId, permissionId) {
  try {
    const result = await dbRun(`
      DELETE FROM accounting_user_permissions
      WHERE user_id = ? AND permission_id = ?
    `, [userId, permissionId]);
    
    if (result.changes === 0) {
      throw new Error('Permisiunea nu a fost găsită');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in removeUserPermission:', error);
    throw error;
  }
}

module.exports = {
  getStockBalance,
  getStockVariance,
  getProductMapping,
  updateProductMapping,
  getProductMappingHistory,
  getDailyBalance,
  getConsumptionSituation,
  getEntriesByVat,
  getDigitalSignatures,
  getDigitalSignatureById,
  verifyDigitalSignature,
  getPermissions,
  getUserPermissions,
  getUsers,
  assignUserPermission,
  removeUserPermission
};

