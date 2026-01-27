/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Orders Export Controller
 * Export orders to various formats
 */

const { dbPromise } = require('../../../../database');
const ExcelJS = require('exceljs');

/**
 * GET /api/admin/orders/export
 * Export orders to Excel
 */
async function exportOrders(req, res, next) {
  try {
    const { startDate, endDate, format = 'excel' } = req.query;
    const db = await dbPromise;
    
    let query = `
      SELECT 
        id,
        table_number,
        type,
        status,
        total,
        is_paid,
        timestamp,
        paid_timestamp,
        customer_name,
        customer_phone,
        delivery_address
      FROM orders
      WHERE 1=1
    `;
    const params = [];
    
    if (startDate) {
      query += ' AND DATE(timestamp) >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(timestamp) <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY timestamp DESC';
    
    const orders = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (format === 'excel') {
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');
      
      // Add headers
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Table Number', key: 'table_number', width: 15 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Paid', key: 'is_paid', width: 10 },
        { header: 'Date', key: 'timestamp', width: 20 },
        { header: 'Customer Name', key: 'customer_name', width: 25 },
        { header: 'Customer Phone', key: 'customer_phone', width: 20 }
      ];
      
      // Add data
      orders.forEach(order => {
        worksheet.addRow({
          id: order.id,
          table_number: order.table_number || '',
          type: order.type || '',
          status: order.status || '',
          total: order.total || 0,
          is_paid: order.is_paid ? 'Yes' : 'No',
          timestamp: order.timestamp || '',
          customer_name: order.customer_name || '',
          customer_phone: order.customer_phone || ''
        });
      });
      
      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="orders_${startDate || 'all'}_${endDate || 'all'}.xlsx"`);
      
      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } else {
      // JSON format
      res.json({
        success: true,
        data: orders,
        count: orders.length,
        period: { startDate, endDate },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error exporting orders:', error);
    next(error);
  }
}

module.exports = {
  exportOrders
};

