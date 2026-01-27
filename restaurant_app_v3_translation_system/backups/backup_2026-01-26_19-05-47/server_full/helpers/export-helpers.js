/**
 * ETAPA 8: Export Helpers - Multi-Gestiune
 * 
 * Funcționalități:
 * - Export Excel (toate modulele)
 * - Export CSV (toate modulele)
 * - Generare email cu atașamente
 * - Raport consolidat multi-gestiune
 */

const ExcelJS = require('exceljs');
const { dbPromise } = require('../database');

/**
 * Export Transferuri în Excel
 */
async function exportTransfersToExcel(filters = {}) {
  try {
    const db = await dbPromise;
    
    // Query cu filtrare
    let query = `
      SELECT 
        st.id,
        st.transfer_number,
        st.from_location_id,
        loc1.name as from_location_name,
        st.to_location_id,
        loc2.name as to_location_name,
        st.status,
        st.created_at,
        st.completed_at,
        st.requested_by as created_by,
        st.notes,
        COUNT(ti.id) as items_count
      FROM stock_transfers st
      LEFT JOIN management_locations loc1 ON st.from_location_id = loc1.id
      LEFT JOIN management_locations loc2 ON st.to_location_id = loc2.id
      LEFT JOIN transfer_items ti ON st.id = ti.transfer_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.status) {
      query += ` AND st.status = ?`;
      params.push(filters.status);
    }
    
    if (filters.from_location_id) {
      query += ` AND st.from_location_id = ?`;
      params.push(filters.from_location_id);
    }
    
    if (filters.to_location_id) {
      query += ` AND st.to_location_id = ?`;
      params.push(filters.to_location_id);
    }
    
    if (filters.date_from) {
      query += ` AND date(st.created_at) >= date(?)`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      query += ` AND date(st.created_at) <= date(?)`;
      params.push(filters.date_to);
    }
    
    query += ` GROUP BY st.id ORDER BY st.created_at DESC`;
    
    const transfers = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Creează workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transferuri');
    
    // Header styling
    worksheet.columns = [
      { header: 'Nr. Transfer', key: 'transfer_number', width: 20 },
      { header: 'De la Locație', key: 'from_location_name', width: 25 },
      { header: 'Către Locație', key: 'to_location_name', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Nr. Produse', key: 'items_count', width: 15 },
      { header: 'Creat de', key: 'created_by', width: 20 },
      { header: 'Data Creare', key: 'created_at', width: 20 },
      { header: 'Data Finalizare', key: 'completed_at', width: 20 },
      { header: 'Note', key: 'notes', width: 30 }
    ];
    
    // Add rows
    transfers.forEach(transfer => {
      worksheet.addRow({
        transfer_number: transfer.transfer_number,
        from_location_name: transfer.from_location_name,
        to_location_name: transfer.to_location_name,
        status: transfer.status,
        items_count: transfer.items_count,
        created_by: transfer.created_by,
        created_at: transfer.created_at ? new Date(transfer.created_at).toLocaleString('ro-RO') : '',
        completed_at: transfer.completed_at ? new Date(transfer.completed_at).toLocaleString('ro-RO') : '',
        notes: transfer.notes || ''
      });
    });
    
    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Return buffer
    return await workbook.xlsx.writeBuffer();
    
  } catch (error) {
    console.error('❌ [EXPORT] Eroare export transferuri Excel:', error);
    throw error;
  }
}

/**
 * Export Inventar în Excel
 */
async function exportInventoryToExcel(sessionId) {
  try {
    const db = await dbPromise;
    
    // Get session info
    const session = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM inventory_sessions WHERE session_id = ?`, [sessionId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!session) {
      throw new Error('Sesiune inventar nu a fost găsită');
    }
    
    // Get counts
    const counts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          ic.*,
          i.name as ingredient_name,
          i.unit,
          i.cost_per_unit,
          ml.name as location_name
        FROM inventory_counts ic
        LEFT JOIN ingredients i ON ic.ingredient_id = i.id
        LEFT JOIN management_locations ml ON ic.location_id = ml.id
        WHERE ic.session_id = ?
        ORDER BY ml.name, i.name
      `, [sessionId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventar');
    
    // Header
    worksheet.columns = [
      { header: 'Locație', key: 'location_name', width: 25 },
      { header: 'Ingredient', key: 'ingredient_name', width: 30 },
      { header: 'Stoc Inițial', key: 'initial_stock', width: 15 },
      { header: 'Cantitate Numărată', key: 'counted_quantity', width: 20 },
      { header: 'Diferență', key: 'difference', width: 15 },
      { header: 'Unitate', key: 'unit', width: 10 },
      { header: 'Cost Unitar', key: 'cost_per_unit', width: 15 },
      { header: 'Valoare Diferență', key: 'value_difference', width: 20 }
    ];
    
    // Add rows
    counts.forEach(count => {
      const difference = (count.counted_quantity || 0) - (count.initial_stock || 0);
      const valueDifference = difference * (count.cost_per_unit || 0);
      
      worksheet.addRow({
        location_name: count.location_name,
        ingredient_name: count.ingredient_name,
        initial_stock: count.initial_stock || 0,
        counted_quantity: count.counted_quantity || 0,
        difference: difference,
        unit: count.unit,
        cost_per_unit: count.cost_per_unit || 0,
        value_difference: valueDifference.toFixed(2)
      });
    });
    
    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF90EE90' }
    };
    
    return await workbook.xlsx.writeBuffer();
    
  } catch (error) {
    console.error('❌ [EXPORT] Eroare export inventar Excel:', error);
    throw error;
  }
}

/**
 * Export Portion Control în Excel
 */
async function exportPortionControlToExcel(filters = {}) {
  try {
    const db = await dbPromise;
    
    let query = `
      SELECT 
        pcl.*,
        m.name as product_name,
        i.name as ingredient_name,
        i.unit,
        ml.name as location_name
      FROM portion_compliance_log pcl
      LEFT JOIN menu m ON pcl.product_id = m.id
      LEFT JOIN ingredients i ON pcl.ingredient_id = i.id
      LEFT JOIN management_locations ml ON pcl.location_id = ml.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.product_id) {
      query += ` AND pcl.product_id = ?`;
      params.push(filters.product_id);
    }
    
    if (filters.location_id) {
      query += ` AND pcl.location_id = ?`;
      params.push(filters.location_id);
    }
    
    if (filters.compliance_status) {
      query += ` AND pcl.compliance_status = ?`;
      params.push(filters.compliance_status);
    }
    
    if (filters.date_from) {
      query += ` AND date(pcl.timestamp) >= date(?)`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      query += ` AND date(pcl.timestamp) <= date(?)`;
      params.push(filters.date_to);
    }
    
    query += ` ORDER BY pcl.timestamp DESC LIMIT 1000`;
    
    const logs = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Conformitate Porții');
    
    // Header
    worksheet.columns = [
      { header: 'Data', key: 'logged_at', width: 20 },
      { header: 'Produs', key: 'product_name', width: 30 },
      { header: 'Ingredient', key: 'ingredient_name', width: 25 },
      { header: 'Locație', key: 'location_name', width: 20 },
      { header: 'Cantitate Așteptată', key: 'expected_quantity', width: 20 },
      { header: 'Cantitate Reală', key: 'actual_quantity', width: 20 },
      { header: 'Varianță %', key: 'variance_percentage', width: 15 },
      { header: 'Status', key: 'compliance_status', width: 15 },
      { header: 'Unitate', key: 'unit', width: 10 }
    ];
    
    // Add rows
    logs.forEach(log => {
      worksheet.addRow({
        logged_at: log.timestamp ? new Date(log.timestamp).toLocaleString('ro-RO') : '',
        product_name: log.product_name,
        ingredient_name: log.ingredient_name,
        location_name: log.location_name,
        expected_quantity: log.expected_quantity,
        actual_quantity: log.actual_quantity,
        variance_percentage: log.variance_percentage ? log.variance_percentage.toFixed(2) + '%' : '',
        compliance_status: log.compliance_status,
        unit: log.unit
      });
    });
    
    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB3B' }
    };
    
    return await workbook.xlsx.writeBuffer();
    
  } catch (error) {
    console.error('❌ [EXPORT] Eroare export portion control Excel:', error);
    throw error;
  }
}

/**
 * Export Variance Report în Excel
 */
async function exportVarianceToExcel(reportId) {
  try {
    const db = await dbPromise;
    
    // Get report
    const report = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM variance_reports WHERE id = ?`, [reportId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!report) {
      throw new Error('Raport varianță nu a fost găsit');
    }
    
    // Get analysis
    const analysis = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          va.*,
          i.name as ingredient_name,
          i.unit,
          ml.name as location_name
        FROM variance_analysis va
        LEFT JOIN ingredients i ON va.ingredient_id = i.id
        LEFT JOIN management_locations ml ON va.location_id = ml.id
        WHERE va.report_id = ?
        ORDER BY ABS(va.variance_percentage) DESC
      `, [reportId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Raport Varianță');
    
    // Header
    worksheet.columns = [
      { header: 'Ingredient', key: 'ingredient_name', width: 30 },
      { header: 'Locație', key: 'location_name', width: 20 },
      { header: 'Consum Teoretic', key: 'theoretical_consumption', width: 20 },
      { header: 'Consum Real', key: 'actual_consumption', width: 20 },
      { header: 'Varianță', key: 'variance_quantity', width: 15 },
      { header: 'Varianță %', key: 'variance_percentage', width: 15 },
      { header: 'Valoare Varianță', key: 'variance_value', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Unitate', key: 'unit', width: 10 }
    ];
    
    // Add rows
    analysis.forEach(item => {
      worksheet.addRow({
        ingredient_name: item.ingredient_name,
        location_name: item.location_name,
        theoretical_consumption: item.theoretical_consumption || 0,
        actual_consumption: item.actual_consumption || 0,
        variance_quantity: item.variance_quantity || 0,
        variance_percentage: item.variance_percentage ? item.variance_percentage.toFixed(2) + '%' : '',
        variance_value: item.variance_value ? item.variance_value.toFixed(2) + ' RON' : '',
        status: item.status,
        unit: item.unit
      });
    });
    
    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF5252' }
    };
    
    return await workbook.xlsx.writeBuffer();
    
  } catch (error) {
    console.error('❌ [EXPORT] Eroare export variance Excel:', error);
    throw error;
  }
}

/**
 * Export Raport Consolidat (TOATE modulele)
 */
async function exportConsolidatedReport(period = {}, locationIds = []) {
  try {
    const db = await dbPromise;
    
    // Create workbook with multiple sheets
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Rezumat Executiv
    const summarySheet = workbook.addWorksheet('Rezumat Executiv');
    summarySheet.columns = [
      { header: 'Indicator', key: 'indicator', width: 40 },
      { header: 'Valoare', key: 'value', width: 20 }
    ];
    
    // Get summary data
    const totalLocations = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM management_locations WHERE is_active = 1`, (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
    
    const totalTransfers = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM stock_transfers WHERE status = 'completed'`, (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
    
    const totalInventorySessions = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM inventory_sessions WHERE status = 'completed'`, (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
    
    summarySheet.addRow({ indicator: 'Total Locații Active', value: totalLocations });
    summarySheet.addRow({ indicator: 'Total Transferuri Finalizate', value: totalTransfers });
    summarySheet.addRow({ indicator: 'Total Sesiuni Inventar', value: totalInventorySessions });
    summarySheet.addRow({ indicator: 'Perioada Raport', value: `${period.start || 'N/A'} - ${period.end || 'N/A'}` });
    
    summarySheet.getRow(1).font = { bold: true };
    
    // Sheet 2: Valoare Stoc per Locație
    const stockValueSheet = workbook.addWorksheet('Valoare Stoc');
    stockValueSheet.columns = [
      { header: 'Locație', key: 'location_name', width: 30 },
      { header: 'Valoare Totală Stoc (RON)', key: 'total_value', width: 25 },
      { header: 'Nr. Ingrediente', key: 'ingredient_count', width: 20 }
    ];
    
    const stockValues = await new Promise((resolve, reject) => {
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
    
    stockValues.forEach(item => {
      stockValueSheet.addRow({
        location_name: item.location_name,
        total_value: (item.total_value || 0).toFixed(2),
        ingredient_count: item.ingredient_count || 0
      });
    });
    
    stockValueSheet.getRow(1).font = { bold: true };
    
    // Sheet 3: Top 20 Transferuri Recente
    const transfersSheet = workbook.addWorksheet('Transferuri Recente');
    transfersSheet.columns = [
      { header: 'Nr. Transfer', key: 'transfer_number', width: 20 },
      { header: 'De la', key: 'from_location', width: 20 },
      { header: 'Către', key: 'to_location', width: 20 },
      { header: 'Data', key: 'created_at', width: 20 }
    ];
    
    const recentTransfers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          st.transfer_number,
          loc1.name as from_location,
          loc2.name as to_location,
          st.created_at
        FROM stock_transfers st
        LEFT JOIN management_locations loc1 ON st.from_location_id = loc1.id
        LEFT JOIN management_locations loc2 ON st.to_location_id = loc2.id
        ORDER BY st.created_at DESC
        LIMIT 20
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    recentTransfers.forEach(transfer => {
      transfersSheet.addRow({
        transfer_number: transfer.transfer_number,
        from_location: transfer.from_location,
        to_location: transfer.to_location,
        created_at: transfer.created_at ? new Date(transfer.created_at).toLocaleString('ro-RO') : ''
      });
    });
    
    transfersSheet.getRow(1).font = { bold: true };
    
    return await workbook.xlsx.writeBuffer();
    
  } catch (error) {
    console.error('❌ [EXPORT] Eroare export raport consolidat:', error);
    throw error;
  }
}

/**
 * Convert to CSV
 */
function convertToCSV(data, columns) {
  if (!data || data.length === 0) return '';
  
  // Header
  let csv = columns.map(col => `"${col.header}"`).join(',') + '\n';
  
  // Rows
  data.forEach(row => {
    const values = columns.map(col => {
      const value = row[col.key] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
}

module.exports = {
  exportTransfersToExcel,
  exportInventoryToExcel,
  exportPortionControlToExcel,
  exportVarianceToExcel,
  exportConsolidatedReport,
  convertToCSV
};

