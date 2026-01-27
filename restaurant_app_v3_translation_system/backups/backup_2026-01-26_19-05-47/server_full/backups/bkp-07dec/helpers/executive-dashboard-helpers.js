/**
 * ETAPA 8: Executive Dashboard Helpers
 * 
 * Funcționalități:
 * - Metrici consolidate pentru toate locațiile
 * - Comparație KPI între locații
 * - Top ingrediente cu mișcare mare
 * - Statistici varianță și conformitate
 */

const { dbPromise } = require('../database');

/**
 * Get Consolidated Metrics (KPIs)
 */
async function getConsolidatedMetrics(period = {}, locationIds = []) {
  try {
    const db = await dbPromise;
    const { start, end } = period;
    
    // Total Valoare Stoc (toate locațiile)
    let stockValueQuery = `
      SELECT SUM(current_stock * cost_per_unit) as total_stock_value
      FROM ingredients
      WHERE 1=1
    `;
    const stockValueParams = [];
    
    if (locationIds && locationIds.length > 0) {
      stockValueQuery += ` AND location_id IN (${locationIds.map(() => '?').join(',')})`;
      stockValueParams.push(...locationIds);
    }
    
    const stockValue = await new Promise((resolve, reject) => {
      db.get(stockValueQuery, stockValueParams, (err, row) => {
        if (err) reject(err);
        else resolve(row?.total_stock_value || 0);
      });
    });
    
    // Total Transferuri
    let transfersQuery = `
      SELECT COUNT(*) as total_transfers
      FROM stock_transfers
      WHERE status = 'completed'
    `;
    const transfersParams = [];
    
    if (start && end) {
      transfersQuery += ` AND date(created_at) >= date(?) AND date(created_at) <= date(?)`;
      transfersParams.push(start, end);
    }
    
    const transfers = await new Promise((resolve, reject) => {
      db.get(transfersQuery, transfersParams, (err, row) => {
        if (err) reject(err);
        else resolve(row?.total_transfers || 0);
      });
    });
    
    // Rata Conformitate Porții
    const complianceRate = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(CASE WHEN compliance_status = 'compliant' THEN 1 END) * 100.0 / COUNT(*) as rate
        FROM portion_compliance_log
        WHERE 1=1
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row?.rate || 0);
      });
    });
    
    // Varianță Totală
    const totalVariance = await new Promise((resolve, reject) => {
      db.get(`
        SELECT SUM(ABS(variance_value)) as total_variance
        FROM variance_analysis
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row?.total_variance || 0);
      });
    });
    
    return {
      success: true,
      data: {
        totalStockValue: Number(stockValue).toFixed(2),
        totalTransfers: transfers,
        complianceRate: Number(complianceRate).toFixed(2),
        totalVariance: Number(totalVariance).toFixed(2)
      }
    };
    
  } catch (error) {
    console.error('❌ [EXECUTIVE DASHBOARD] Eroare metrici consolidate:', error);
    throw error;
  }
}

/**
 * Get Location Comparison (KPI per locație)
 */
async function getLocationComparison(period = {}) {
  try {
    const db = await dbPromise;
    const { start, end } = period;
    
      // Get all active locations
      const locations = await new Promise((resolve, reject) => {
        db.all(`
          SELECT id, name, type as location_type
          FROM management_locations
          WHERE is_active = 1
          ORDER BY name
        `, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    
    // For each location, get KPIs
    const comparison = [];
    
    for (const location of locations) {
      // Valoare stoc
      const stockValue = await new Promise((resolve, reject) => {
        db.get(`
          SELECT SUM(current_stock * cost_per_unit) as value
          FROM ingredients
          WHERE location_id = ?
        `, [location.id], (err, row) => {
          if (err) reject(err);
          else resolve(row?.value || 0);
        });
      });
      
      // Număr transferuri (din + către)
      let transfersQuery = `
        SELECT COUNT(*) as count
        FROM stock_transfers
        WHERE (from_location_id = ? OR to_location_id = ?)
          AND status = 'completed'
      `;
      const transfersParams = [location.id, location.id];
      
      if (start && end) {
        transfersQuery += ` AND date(created_at) >= date(?) AND date(created_at) <= date(?)`;
        transfersParams.push(start, end);
      }
      
      const transfers = await new Promise((resolve, reject) => {
        db.get(transfersQuery, transfersParams, (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        });
      });
      
      // Rata conformitate
      const complianceRate = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COUNT(CASE WHEN compliance_status = 'compliant' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as rate
          FROM portion_compliance_log
          WHERE location_id = ?
        `, [location.id], (err, row) => {
          if (err) reject(err);
          else resolve(row?.rate || 0);
        });
      });
      
      // Varianță
      const variance = await new Promise((resolve, reject) => {
        db.get(`
          SELECT SUM(ABS(variance_value)) as value
          FROM variance_analysis
          WHERE location_id = ?
        `, [location.id], (err, row) => {
          if (err) reject(err);
          else resolve(row?.value || 0);
        });
      });
      
      comparison.push({
        location_id: location.id,
        location_name: location.name,
        location_type: location.location_type,
        stock_value: Number(stockValue).toFixed(2),
        transfers_count: transfers,
        compliance_rate: Number(complianceRate).toFixed(2),
        variance_value: Number(variance).toFixed(2)
      });
    }
    
    return {
      success: true,
      data: comparison
    };
    
  } catch (error) {
    console.error('❌ [EXECUTIVE DASHBOARD] Eroare comparație locații:', error);
    throw error;
  }
}

/**
 * Get Stock Value by Location (pentru grafice)
 */
async function getStockValueByLocation() {
  try {
    const db = await dbPromise;
    
    const data = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          ml.name as location_name,
          SUM(i.current_stock * i.cost_per_unit) as total_value,
          COUNT(i.id) as ingredient_count
        FROM management_locations ml
        LEFT JOIN ingredients i ON i.location_id = ml.id
        WHERE ml.is_active = 1
        GROUP BY ml.id
        ORDER BY total_value DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    return {
      success: true,
      data: data.map(item => ({
        location_name: item.location_name,
        total_value: Number(item.total_value || 0).toFixed(2),
        ingredient_count: item.ingredient_count || 0
      }))
    };
    
  } catch (error) {
    console.error('❌ [EXECUTIVE DASHBOARD] Eroare valoare stoc per locație:', error);
    throw error;
  }
}

/**
 * Get Top Moving Ingredients (cel mai des transferate)
 */
async function getTopMovingIngredients(period = {}, locationIds = [], limit = 10) {
  try {
    const db = await dbPromise;
    const { start, end } = period;
    
    let query = `
      SELECT 
        i.id,
        i.name as ingredient_name,
        i.category,
        i.unit,
        COUNT(ti.id) as transfer_count,
        SUM(ti.quantity) as total_quantity_transferred
      FROM ingredients i
      LEFT JOIN transfer_items ti ON i.id = ti.ingredient_id
      LEFT JOIN stock_transfers st ON ti.transfer_id = st.id
      WHERE st.status = 'completed'
    `;
    const params = [];
    
    if (start && end) {
      query += ` AND date(st.created_at) >= date(?) AND date(st.created_at) <= date(?)`;
      params.push(start, end);
    }
    
    if (locationIds && locationIds.length > 0) {
      query += ` AND (st.from_location_id IN (${locationIds.map(() => '?').join(',')}) 
                 OR st.to_location_id IN (${locationIds.map(() => '?').join(',')}))`;
      params.push(...locationIds, ...locationIds);
    }
    
    query += `
      GROUP BY i.id
      ORDER BY transfer_count DESC, total_quantity_transferred DESC
      LIMIT ?
    `;
    params.push(limit);
    
    const data = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    return {
      success: true,
      data: data.map(item => ({
        ingredient_id: item.id,
        ingredient_name: item.ingredient_name,
        category: item.category,
        unit: item.unit,
        transfer_count: item.transfer_count || 0,
        total_quantity: Number(item.total_quantity_transferred || 0).toFixed(2)
      }))
    };
    
  } catch (error) {
    console.error('❌ [EXECUTIVE DASHBOARD] Eroare top ingrediente:', error);
    throw error;
  }
}

/**
 * Get Variance Summary by Location
 */
async function getVarianceSummaryByLocation(period = {}) {
  try {
    const db = await dbPromise;
    const { start, end } = period;
    
    let query = `
      SELECT 
        ml.name as location_name,
        COUNT(va.id) as total_analyses,
        SUM(CASE WHEN va.variance_status = 'critical' THEN 1 ELSE 0 END) as critical_count,
        SUM(ABS(va.variance_value)) as total_variance_value
      FROM management_locations ml
      LEFT JOIN variance_analysis va ON ml.id = va.location_id
      LEFT JOIN variance_reports vr ON va.report_id = vr.id
      WHERE ml.is_active = 1
    `;
    const params = [];
    
    if (start && end) {
      query += ` AND date(vr.period_start) >= date(?) AND date(vr.period_end) <= date(?)`;
      params.push(start, end);
    }
    
    query += ` GROUP BY ml.id ORDER BY total_variance_value DESC`;
    
    const data = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    return {
      success: true,
      data: data.map(item => ({
        location_name: item.location_name,
        total_analyses: item.total_analyses || 0,
        critical_count: item.critical_count || 0,
        total_variance_value: Number(item.total_variance_value || 0).toFixed(2)
      }))
    };
    
  } catch (error) {
    console.error('❌ [EXECUTIVE DASHBOARD] Eroare varianță per locație:', error);
    throw error;
  }
}

/**
 * Get Portion Compliance Summary by Location
 */
async function getPortionComplianceSummaryByLocation(period = {}) {
  try {
    const db = await dbPromise;
    const { start, end } = period;
    
    let query = `
      SELECT 
        ml.name as location_name,
        COUNT(pcl.id) as total_logs,
        SUM(CASE WHEN pcl.compliance_status = 'compliant' THEN 1 ELSE 0 END) as compliant_count,
        SUM(CASE WHEN pcl.compliance_status = 'warning' THEN 1 ELSE 0 END) as warning_count,
        SUM(CASE WHEN pcl.compliance_status = 'critical' THEN 1 ELSE 0 END) as critical_count
      FROM management_locations ml
      LEFT JOIN portion_compliance_log pcl ON ml.id = pcl.location_id
      WHERE ml.is_active = 1
    `;
    const params = [];
    
    if (start && end) {
      query += ` AND date(pcl.logged_at) >= date(?) AND date(pcl.logged_at) <= date(?)`;
      params.push(start, end);
    }
    
    query += ` GROUP BY ml.id ORDER BY total_logs DESC`;
    
    const data = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    return {
      success: true,
      data: data.map(item => ({
        location_name: item.location_name,
        total_logs: item.total_logs || 0,
        compliant_count: item.compliant_count || 0,
        warning_count: item.warning_count || 0,
        critical_count: item.critical_count || 0,
        compliance_rate: item.total_logs > 0 
          ? ((item.compliant_count / item.total_logs) * 100).toFixed(2) 
          : '0.00'
      }))
    };
    
  } catch (error) {
    console.error('❌ [EXECUTIVE DASHBOARD] Eroare conformitate per locație:', error);
    throw error;
  }
}

module.exports = {
  getConsolidatedMetrics,
  getLocationComparison,
  getStockValueByLocation,
  getTopMovingIngredients,
  getVarianceSummaryByLocation,
  getPortionComplianceSummaryByLocation
};

