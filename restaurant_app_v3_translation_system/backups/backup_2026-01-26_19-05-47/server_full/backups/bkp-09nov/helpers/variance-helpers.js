// server/helpers/variance-helpers.js
// =====================================================
// ETAPA 7: VARIANCE REPORTING - Backend Helpers
// =====================================================
// 
// Calculează și analizează variațiile între consumul teoretic 
// (din rețete și vânzări) și consumul real (din mișcări stoc)

const { dbPromise } = require('../database');

/**
 * ====================================
 * CONSUMPTION CALCULATIONS
 * ====================================
 */

/**
 * Calculează consumul teoretic de ingrediente pe bază de comenzi și rețete
 * @param {Date} periodStart - Data de început
 * @param {Date} periodEnd - Data de sfârșit
 * @param {Number} locationId - ID gestiune (optional)
 * @returns {Object} consumption per ingredient { ingredientId: { quantity, unit, name, cost } }
 */
async function calculateTheoreticalConsumption(periodStart, periodEnd, locationId = null) {
  const db = await dbPromise;
  
  // Query pentru comenzile din perioadă
  let ordersQuery = `
    SELECT id, items, location_id
    FROM orders
    WHERE status IN ('completed', 'delivered')
      AND completed_timestamp IS NOT NULL
      AND date(completed_timestamp) >= date(?)
      AND date(completed_timestamp) <= date(?)
  `;
  
  const params = [periodStart, periodEnd];
  
  if (locationId) {
    ordersQuery += ` AND location_id = ?`;
    params.push(locationId);
  }
  
  const orders = await new Promise((resolve, reject) => {
    db.all(ordersQuery, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`📊 [VARIANCE] Găsite ${orders.length} comenzi în perioada ${periodStart} - ${periodEnd}`);
  
  // Obține toate rețetele din baza de date
  const recipes = await new Promise((resolve, reject) => {
    db.all(`SELECT * FROM recipes`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  // Obține informații despre ingrediente
  const ingredients = await new Promise((resolve, reject) => {
    db.all(`SELECT id, name, unit, cost_per_unit FROM ingredients`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  // Creează map-uri pentru acces rapid
  const ingredientMap = {};
  ingredients.forEach(ing => {
    ingredientMap[ing.id] = ing;
  });
  
  const recipeMap = {};
  recipes.forEach(recipe => {
    if (!recipeMap[recipe.menu_item_id]) {
      recipeMap[recipe.menu_item_id] = [];
    }
    recipeMap[recipe.menu_item_id].push(recipe);
  });
  
  // Calculează consumul teoretic
  const consumption = {};
  
  for (const order of orders) {
    if (!order.items) continue;
    
    let items;
    try {
      items = JSON.parse(order.items);
    } catch (e) {
      console.error('❌ [VARIANCE] Eroare la parsare items pentru comanda', order.id);
      continue;
    }
    
    for (const item of items) {
      const productId = item.id;
      const quantity = item.quantity || 1;
      
      // Obține rețeta pentru produs
      const productRecipes = recipeMap[productId] || [];
      
      for (const recipe of productRecipes) {
        const ingredientId = recipe.ingredient_id;
        const recipeQuantity = recipe.quantity * quantity;
        
        if (!consumption[ingredientId]) {
          const ingredient = ingredientMap[ingredientId];
          consumption[ingredientId] = {
            ingredientId: ingredientId,
            name: ingredient?.name || 'Unknown',
            unit: ingredient?.unit || 'unknown',
            quantity: 0,
            cost_per_unit: ingredient?.cost_per_unit || 0
          };
        }
        
        consumption[ingredientId].quantity += recipeQuantity;
      }
    }
  }
  
  console.log(`📊 [VARIANCE] Calculat consum teoretic pentru ${Object.keys(consumption).length} ingrediente`);
  
  return consumption;
}

/**
 * Calculează consumul real de ingrediente din mișcări de stoc
 * @param {Date} periodStart - Data de început
 * @param {Date} periodEnd - Data de sfârșit
 * @param {Number} locationId - ID gestiune (optional)
 * @returns {Object} consumption per ingredient { ingredientId: { quantity, unit, name } }
 */
async function calculateActualConsumption(periodStart, periodEnd, locationId = null) {
  const db = await dbPromise;
  
  // Query pentru mișcările de stoc din perioadă
  // Consumul real = mișcări negative (order, waste, production, etc.)
  let movementsQuery = `
    SELECT 
      sm.ingredient_id,
      sm.quantity_change as quantity,
      sm.movement_type,
      i.name,
      i.unit,
      i.cost_per_unit
    FROM stock_movements sm
    LEFT JOIN ingredients i ON sm.ingredient_id = i.id
    WHERE sm.created_at IS NOT NULL
      AND date(sm.created_at) >= date(?)
      AND date(sm.created_at) <= date(?)
      AND sm.movement_type IN ('order', 'waste', 'production', 'manual_adjustment')
      AND sm.quantity_change < 0
  `;
  
  const params = [periodStart, periodEnd];
  
  if (locationId) {
    movementsQuery += ` AND i.location_id = ?`;
    params.push(locationId);
  }
  
  const movements = await new Promise((resolve, reject) => {
    db.all(movementsQuery, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  console.log(`📊 [VARIANCE] Găsite ${movements.length} mișcări de stoc (consumuri) în perioada`);
  
  // Calculează consumul real
  const consumption = {};
  
  for (const movement of movements) {
    const ingredientId = movement.ingredient_id;
    const quantity = Math.abs(movement.quantity); // Facem pozitivă pentru consistență
    
    if (!consumption[ingredientId]) {
      consumption[ingredientId] = {
        ingredientId: ingredientId,
        name: movement.name || 'Unknown',
        unit: movement.unit || 'unknown',
        quantity: 0,
        cost_per_unit: movement.cost_per_unit || 0
      };
    }
    
    consumption[ingredientId].quantity += quantity;
  }
  
  console.log(`📊 [VARIANCE] Calculat consum real pentru ${Object.keys(consumption).length} ingrediente`);
  
  return consumption;
}

/**
 * Calculează variația între consumul teoretic și cel real
 * @param {Object} theoreticalConsumption - Consum teoretic
 * @param {Object} actualConsumption - Consum real
 * @param {Number} warningThreshold - Pragul pentru warning (default 10%)
 * @param {Number} criticalThreshold - Pragul pentru critical (default 20%)
 * @returns {Array} variance analysis per ingredient
 */
function calculateVariance(theoreticalConsumption, actualConsumption, warningThreshold = 10, criticalThreshold = 20) {
  const analysis = [];
  
  // Combine toate ingredientele (teoretice + reale)
  const allIngredients = new Set([
    ...Object.keys(theoreticalConsumption),
    ...Object.keys(actualConsumption)
  ]);
  
  for (const ingredientId of allIngredients) {
    const theoretical = theoreticalConsumption[ingredientId] || { quantity: 0, name: 'Unknown', unit: 'unknown', cost_per_unit: 0 };
    const actual = actualConsumption[ingredientId] || { quantity: 0, name: theoretical.name, unit: theoretical.unit, cost_per_unit: theoretical.cost_per_unit };
    
    // Asigură-ne că avem date consistente
    const name = theoretical.name || actual.name || 'Unknown';
    const unit = theoretical.unit || actual.unit || 'unknown';
    const cost_per_unit = theoretical.cost_per_unit || actual.cost_per_unit || 0;
    
    const variance = actual.quantity - theoretical.quantity;
    const variance_percentage = theoretical.quantity > 0 
      ? (variance / theoretical.quantity) * 100 
      : (actual.quantity > 0 ? 100 : 0);
    
    const variance_value = variance * cost_per_unit;
    
    // Determină statusul variației
    let variance_status;
    if (Math.abs(variance_percentage) <= warningThreshold) {
      variance_status = 'acceptable';
    } else if (Math.abs(variance_percentage) <= criticalThreshold) {
      variance_status = 'warning';
    } else {
      variance_status = 'critical';
    }
    
    analysis.push({
      ingredientId: parseInt(ingredientId),
      name,
      unit,
      theoretical_consumption: theoretical.quantity,
      actual_consumption: actual.quantity,
      variance,
      variance_percentage,
      variance_value,
      variance_status,
      cost_per_unit
    });
  }
  
  console.log(`📊 [VARIANCE] Analizate ${analysis.length} ingrediente pentru varianță`);
  
  return analysis;
}

/**
 * ====================================
 * VARIANCE REPORTS - CRUD
 * ====================================
 */

/**
 * Generează un raport complet de varianță pentru o perioadă
 * @param {Object} data - { period_start, period_end, location_id, created_by, notes }
 * @returns {Object} raport complet cu analiză
 */
async function generateVarianceReport(data) {
  const db = await dbPromise;
  
  const {
    period_start,
    period_end,
    location_id = null,
    created_by = null,
    notes = null
  } = data;
  
  console.log(`📊 [VARIANCE] Generare raport varianță: ${period_start} - ${period_end}, Location: ${location_id || 'ALL'}`);
  
  // Calculează consumurile
  console.log('📊 [VARIANCE] Step 1: Calculare consum teoretic...');
  const theoreticalConsumption = await calculateTheoreticalConsumption(period_start, period_end, location_id);
  
  console.log('📊 [VARIANCE] Step 2: Calculare consum real...');
  const actualConsumption = await calculateActualConsumption(period_start, period_end, location_id);
  
  console.log('📊 [VARIANCE] Step 3: Calculare varianță...');
  const analysis = calculateVariance(theoreticalConsumption, actualConsumption);
  
  // Statistici
  const total_ingredients = analysis.length;
  const critical_variances = analysis.filter(a => a.variance_status === 'critical').length;
  const total_variance_value = analysis.reduce((sum, a) => sum + a.variance_value, 0);
  
  // Generează număr raport
  const timestamp = Date.now();
  const report_number = `VAR-${timestamp}`;
  
  // Creează raportul în baza de date
  const reportId = await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO variance_reports (
        report_number, period_start, period_end, location_id,
        total_ingredients, critical_variances, total_variance_value,
        status, notes, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, datetime('now'))`,
      [
        report_number,
        period_start,
        period_end,
        location_id,
        total_ingredients,
        critical_variances,
        total_variance_value,
        notes,
        created_by
      ],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
  
  console.log(`✅ [VARIANCE] Raport creat cu ID: ${reportId}`);
  
  // Inserează analiza detaliată
  for (const item of analysis) {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO variance_analysis (
          report_id, ingredient_id, location_id, theoretical_consumption,
          actual_consumption, variance, variance_percentage, variance_value,
          variance_status, unit, cost_per_unit, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          reportId,
          item.ingredientId,
          location_id,
          item.theoretical_consumption,
          item.actual_consumption,
          item.variance,
          item.variance_percentage,
          item.variance_value,
          item.variance_status,
          item.unit,
          item.cost_per_unit
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  
  console.log(`✅ [VARIANCE] Inserată analiză pentru ${analysis.length} ingrediente`);
  
  return {
    reportId,
    report_number,
    period_start,
    period_end,
    location_id,
    total_ingredients,
    critical_variances,
    total_variance_value,
    analysis
  };
}

/**
 * Obține toate rapoartele de varianță cu filtre
 * @param {Object} filters - { status, location_id, dateFrom, dateTo, limit }
 */
async function getAllVarianceReports(filters = {}) {
  const db = await dbPromise;
  
  let query = `
    SELECT 
      vr.*,
      ml.name as location_name
    FROM variance_reports vr
    LEFT JOIN management_locations ml ON vr.location_id = ml.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (filters.status) {
    query += ` AND vr.status = ?`;
    params.push(filters.status);
  }
  
  if (filters.location_id) {
    query += ` AND vr.location_id = ?`;
    params.push(filters.location_id);
  }
  
  if (filters.dateFrom) {
    query += ` AND date(vr.period_start) >= date(?)`;
    params.push(filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query += ` AND date(vr.period_end) <= date(?)`;
    params.push(filters.dateTo);
  }
  
  query += ` ORDER BY vr.created_at DESC`;
  
  if (filters.limit) {
    query += ` LIMIT ?`;
    params.push(filters.limit);
  }
  
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Obține un raport de varianță după ID
 * @param {Number} reportId - ID raport
 */
async function getVarianceReportById(reportId) {
  const db = await dbPromise;
  
  const report = await new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        vr.*,
        ml.name as location_name
      FROM variance_reports vr
      LEFT JOIN management_locations ml ON vr.location_id = ml.id
      WHERE vr.id = ?`,
      [reportId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
  
  if (!report) {
    return null;
  }
  
  // Obține analiza detaliată
  const analysis = await new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        va.*,
        i.name as ingredient_name
      FROM variance_analysis va
      LEFT JOIN ingredients i ON va.ingredient_id = i.id
      WHERE va.report_id = ?
      ORDER BY ABS(va.variance_percentage) DESC`,
      [reportId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
  
  return {
    ...report,
    analysis
  };
}

/**
 * Actualizează statusul unui raport
 * @param {Number} reportId - ID raport
 * @param {String} status - Noul status
 * @param {String} approvedBy - Utilizator care a aprobat (optional)
 */
async function updateVarianceReportStatus(reportId, status, approvedBy = null) {
  const db = await dbPromise;
  
  let query = `UPDATE variance_reports SET status = ?`;
  const params = [status];
  
  if (status === 'completed') {
    query += `, completed_at = datetime('now')`;
  }
  
  if (status === 'approved' && approvedBy) {
    query += `, approved_by = ?, approved_at = datetime('now')`;
    params.push(approvedBy);
  }
  
  query += ` WHERE id = ?`;
  params.push(reportId);
  
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: reportId, changes: this.changes });
    });
  });
}

/**
 * Șterge un raport de varianță
 * @param {Number} reportId - ID raport
 */
async function deleteVarianceReport(reportId) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM variance_reports WHERE id = ?`,
      [reportId],
      function(err) {
        if (err) reject(err);
        else resolve({ id: reportId, changes: this.changes });
      }
    );
  });
}

/**
 * Obține statistici de varianță pentru o perioadă
 * @param {Object} filters - { dateFrom, dateTo, location_id }
 */
async function getVarianceStatistics(filters = {}) {
  const db = await dbPromise;
  
  let query = `
    SELECT 
      COUNT(DISTINCT vr.id) as total_reports,
      SUM(vr.total_ingredients) as total_ingredients,
      SUM(vr.critical_variances) as total_critical,
      SUM(vr.total_variance_value) as total_variance_value,
      AVG(vr.total_variance_value) as avg_variance_value
    FROM variance_reports vr
    WHERE 1=1
  `;
  
  const params = [];
  
  if (filters.dateFrom) {
    query += ` AND date(vr.period_start) >= date(?)`;
    params.push(filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query += ` AND date(vr.period_end) <= date(?)`;
    params.push(filters.dateTo);
  }
  
  if (filters.location_id) {
    query += ` AND vr.location_id = ?`;
    params.push(filters.location_id);
  }
  
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

module.exports = {
  // Consumption calculations
  calculateTheoreticalConsumption,
  calculateActualConsumption,
  calculateVariance,
  
  // Variance reports CRUD
  generateVarianceReport,
  getAllVarianceReports,
  getVarianceReportById,
  updateVarianceReportStatus,
  deleteVarianceReport,
  
  // Statistics
  getVarianceStatistics
};

