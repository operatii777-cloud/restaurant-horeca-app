// server/helpers/portion-control-helpers.js
// ============================================
// ETAPA 6: PORTION CONTROL - Backend Helpers
// ============================================

const { dbPromise } = require('../database');

/**
 * ====================================
 * PORTION STANDARDS - CRUD Operations
 * ====================================
 */

/**
 * Obține toate standardele de porții
 * @param {Object} filters - Filtre opționale (product_id, is_active)
 */
async function getAllPortionStandards(filters = {}) {
  const db = await dbPromise;
  
  let query = `
    SELECT 
      ps.id,
      ps.product_id,
      ps.ingredient_id,
      ps.standard_quantity,
      ps.unit,
      ps.tolerance_percentage,
      ps.notes,
      ps.is_active,
      ps.created_at,
      ps.updated_at,
      m.name as product_name,
      i.name as ingredient_name,
      i.category as ingredient_category
    FROM portion_standards ps
    LEFT JOIN menu m ON ps.product_id = m.id
    LEFT JOIN ingredients i ON ps.ingredient_id = i.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (filters.product_id) {
    query += ` AND ps.product_id = ?`;
    params.push(filters.product_id);
  }
  
  if (filters.ingredient_id) {
    query += ` AND ps.ingredient_id = ?`;
    params.push(filters.ingredient_id);
  }
  
  if (filters.is_active !== undefined) {
    query += ` AND ps.is_active = ?`;
    params.push(filters.is_active ? 1 : 0);
  }
  
  query += ` ORDER BY m.name, i.name`;
  
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Obține standardele de porții pentru un produs specific
 * @param {Number} productId - ID-ul produsului
 */
async function getPortionStandardsByProduct(productId) {
  const db = await dbPromise;
  
  const query = `
    SELECT 
      ps.*,
      i.name as ingredient_name,
      i.unit as ingredient_unit,
      i.category as ingredient_category
    FROM portion_standards ps
    LEFT JOIN ingredients i ON ps.ingredient_id = i.id
    WHERE ps.product_id = ? AND ps.is_active = 1
    ORDER BY i.name
  `;
  
  return new Promise((resolve, reject) => {
    db.all(query, [productId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Obține un standard de porție după ID
 * @param {Number} id - ID-ul standardului
 */
async function getPortionStandardById(id) {
  const db = await dbPromise;
  
  const query = `
    SELECT 
      ps.*,
      m.name as product_name,
      i.name as ingredient_name
    FROM portion_standards ps
    LEFT JOIN menu m ON ps.product_id = m.id
    LEFT JOIN ingredients i ON ps.ingredient_id = i.id
    WHERE ps.id = ?
  `;
  
  return new Promise((resolve, reject) => {
    db.get(query, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Creează un nou standard de porție
 * @param {Object} data - Datele standardului
 */
async function createPortionStandard(data) {
  const db = await dbPromise;
  
  const {
    product_id,
    ingredient_id,
    standard_quantity,
    unit,
    tolerance_percentage = 5.0,
    notes = null,
    is_active = 1
  } = data;
  
  // Verificăm dacă există deja un standard pentru acest produs + ingredient
  const existing = await new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM portion_standards 
       WHERE product_id = ? AND ingredient_id = ? AND is_active = 1`,
      [product_id, ingredient_id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
  
  if (existing) {
    throw new Error('Există deja un standard activ pentru acest produs și ingredient');
  }
  
  const query = `
    INSERT INTO portion_standards (
      product_id, ingredient_id, standard_quantity, unit,
      tolerance_percentage, notes, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `;
  
  return new Promise((resolve, reject) => {
    db.run(
      query,
      [product_id, ingredient_id, standard_quantity, unit, tolerance_percentage, notes, is_active],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...data });
      }
    );
  });
}

/**
 * Actualizează un standard de porție
 * @param {Number} id - ID-ul standardului
 * @param {Object} data - Datele de actualizat
 */
async function updatePortionStandard(id, data) {
  const db = await dbPromise;
  
  const fields = [];
  const params = [];
  
  if (data.standard_quantity !== undefined) {
    fields.push('standard_quantity = ?');
    params.push(data.standard_quantity);
  }
  
  if (data.unit !== undefined) {
    fields.push('unit = ?');
    params.push(data.unit);
  }
  
  if (data.tolerance_percentage !== undefined) {
    fields.push('tolerance_percentage = ?');
    params.push(data.tolerance_percentage);
  }
  
  if (data.notes !== undefined) {
    fields.push('notes = ?');
    params.push(data.notes);
  }
  
  if (data.is_active !== undefined) {
    fields.push('is_active = ?');
    params.push(data.is_active ? 1 : 0);
  }
  
  fields.push('updated_at = datetime(\'now\')');
  params.push(id);
  
  const query = `UPDATE portion_standards SET ${fields.join(', ')} WHERE id = ?`;
  
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id, changes: this.changes });
    });
  });
}

/**
 * Șterge un standard de porție (soft delete - setează is_active = 0)
 * @param {Number} id - ID-ul standardului
 */
async function deletePortionStandard(id) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE portion_standards SET is_active = 0, updated_at = datetime('now') WHERE id = ?`,
      [id],
      function(err) {
        if (err) reject(err);
        else resolve({ id, changes: this.changes });
      }
    );
  });
}

/**
 * ====================================
 * COMPLIANCE LOGGING
 * ====================================
 */

/**
 * Înregistrează conformitatea porțiilor pentru o comandă
 * @param {Number} orderId - ID-ul comenzii
 * @param {Array} complianceData - Array cu date de conformitate
 */
async function logPortionCompliance(orderId, complianceData) {
  const db = await dbPromise;
  
  const insertQuery = `
    INSERT INTO portion_compliance_log (
      order_id, product_id, ingredient_id, expected_quantity, actual_quantity,
      variance, variance_percentage, compliance_status, location_id, notes, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;
  
  const results = [];
  
  for (const entry of complianceData) {
    const {
      product_id,
      ingredient_id,
      expected_quantity,
      actual_quantity,
      location_id = null,
      notes = null
    } = entry;
    
    // Calculează variația
    const variance = actual_quantity - expected_quantity;
    const variance_percentage = expected_quantity > 0 
      ? (variance / expected_quantity) * 100 
      : 0;
    
    // Obține toleranța din standardul de porție
    const standard = await new Promise((resolve, reject) => {
      db.get(
        `SELECT tolerance_percentage FROM portion_standards 
         WHERE product_id = ? AND ingredient_id = ? AND is_active = 1`,
        [product_id, ingredient_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    const tolerance = standard ? standard.tolerance_percentage : 5.0;
    
    // Determină statusul de conformitate
    let compliance_status;
    if (Math.abs(variance_percentage) <= tolerance) {
      compliance_status = 'compliant';
    } else if (Math.abs(variance_percentage) <= tolerance * 2) {
      compliance_status = 'warning';
    } else {
      compliance_status = 'critical';
    }
    
    // Inserează în log
    const result = await new Promise((resolve, reject) => {
      db.run(
        insertQuery,
        [
          orderId, product_id, ingredient_id, expected_quantity, actual_quantity,
          variance, variance_percentage, compliance_status, location_id, notes
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, compliance_status, variance_percentage });
        }
      );
    });
    
    results.push(result);
  }
  
  return results;
}

/**
 * ====================================
 * COMPLIANCE REPORTS
 * ====================================
 */

/**
 * Obține rapoarte de conformitate cu filtre
 * @param {Object} filters - Filtre (dateFrom, dateTo, product_id, location_id, compliance_status)
 */
async function getComplianceReport(filters = {}) {
  const db = await dbPromise;
  
  let query = `
    SELECT 
      pcl.id,
      pcl.order_id,
      pcl.product_id,
      pcl.ingredient_id,
      pcl.expected_quantity,
      pcl.actual_quantity,
      pcl.variance,
      pcl.variance_percentage,
      pcl.compliance_status,
      pcl.location_id,
      pcl.notes,
      pcl.timestamp,
      m.name as product_name,
      i.name as ingredient_name,
      i.unit as ingredient_unit,
      ml.name as location_name
    FROM portion_compliance_log pcl
    LEFT JOIN menu m ON pcl.product_id = m.id
    LEFT JOIN ingredients i ON pcl.ingredient_id = i.id
    LEFT JOIN management_locations ml ON pcl.location_id = ml.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (filters.dateFrom) {
    query += ` AND date(pcl.timestamp) >= date(?)`;
    params.push(filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query += ` AND date(pcl.timestamp) <= date(?)`;
    params.push(filters.dateTo);
  }
  
  if (filters.product_id) {
    query += ` AND pcl.product_id = ?`;
    params.push(filters.product_id);
  }
  
  if (filters.ingredient_id) {
    query += ` AND pcl.ingredient_id = ?`;
    params.push(filters.ingredient_id);
  }
  
  if (filters.location_id) {
    query += ` AND pcl.location_id = ?`;
    params.push(filters.location_id);
  }
  
  if (filters.compliance_status) {
    query += ` AND pcl.compliance_status = ?`;
    params.push(filters.compliance_status);
  }
  
  query += ` ORDER BY pcl.timestamp DESC`;
  
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
 * Obține statistici de conformitate
 * @param {Object} filters - Filtre (dateFrom, dateTo, product_id, location_id)
 */
async function getComplianceStatistics(filters = {}) {
  const db = await dbPromise;
  
  let query = `
    SELECT 
      compliance_status,
      COUNT(*) as count,
      AVG(variance_percentage) as avg_variance_percentage,
      MIN(variance_percentage) as min_variance_percentage,
      MAX(variance_percentage) as max_variance_percentage
    FROM portion_compliance_log
    WHERE 1=1
  `;
  
  const params = [];
  
  if (filters.dateFrom) {
    query += ` AND date(timestamp) >= date(?)`;
    params.push(filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query += ` AND date(timestamp) <= date(?)`;
    params.push(filters.dateTo);
  }
  
  if (filters.product_id) {
    query += ` AND product_id = ?`;
    params.push(filters.product_id);
  }
  
  if (filters.location_id) {
    query += ` AND location_id = ?`;
    params.push(filters.location_id);
  }
  
  query += ` GROUP BY compliance_status`;
  
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else {
        // Transformă în format mai ușor de utilizat
        const stats = {
          compliant: 0,
          warning: 0,
          critical: 0,
          total: 0,
          compliantDetails: null,
          warningDetails: null,
          criticalDetails: null
        };
        
        rows.forEach(row => {
          stats[row.compliance_status] = row.count;
          stats[`${row.compliance_status}Details`] = {
            count: row.count,
            avgVariance: row.avg_variance_percentage,
            minVariance: row.min_variance_percentage,
            maxVariance: row.max_variance_percentage
          };
          stats.total += row.count;
        });
        
        resolve(stats);
      }
    });
  });
}

/**
 * Obține top deviații (produse/ingrediente cu cele mai mari deviații)
 * @param {Object} filters - Filtre (dateFrom, dateTo, location_id, limit)
 */
async function getTopDeviations(filters = {}) {
  const db = await dbPromise;
  
  const limit = filters.limit || 10;
  
  let query = `
    SELECT 
      pcl.product_id,
      pcl.ingredient_id,
      m.name as product_name,
      i.name as ingredient_name,
      COUNT(*) as occurrence_count,
      AVG(pcl.variance_percentage) as avg_variance_percentage,
      SUM(CASE WHEN pcl.compliance_status = 'critical' THEN 1 ELSE 0 END) as critical_count,
      SUM(CASE WHEN pcl.compliance_status = 'warning' THEN 1 ELSE 0 END) as warning_count,
      SUM(CASE WHEN pcl.compliance_status = 'compliant' THEN 1 ELSE 0 END) as compliant_count
    FROM portion_compliance_log pcl
    LEFT JOIN menu m ON pcl.product_id = m.id
    LEFT JOIN ingredients i ON pcl.ingredient_id = i.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (filters.dateFrom) {
    query += ` AND date(pcl.timestamp) >= date(?)`;
    params.push(filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query += ` AND date(pcl.timestamp) <= date(?)`;
    params.push(filters.dateTo);
  }
  
  if (filters.location_id) {
    query += ` AND pcl.location_id = ?`;
    params.push(filters.location_id);
  }
  
  query += `
    GROUP BY pcl.product_id, pcl.ingredient_id
    ORDER BY ABS(avg_variance_percentage) DESC
    LIMIT ?
  `;
  
  params.push(limit);
  
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

module.exports = {
  // Portion Standards CRUD
  getAllPortionStandards,
  getPortionStandardsByProduct,
  getPortionStandardById,
  createPortionStandard,
  updatePortionStandard,
  deletePortionStandard,
  
  // Compliance Logging
  logPortionCompliance,
  
  // Compliance Reports
  getComplianceReport,
  getComplianceStatistics,
  getTopDeviations
};

