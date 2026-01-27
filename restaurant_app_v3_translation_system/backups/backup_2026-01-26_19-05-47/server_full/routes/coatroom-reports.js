// Coatroom Reports
// Purpose: Generate daily summaries and analytics
// Created: 3 Dec 2025

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { generatePdfReport } = require('../utils/pdf-generator');
const fs = require('fs');

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// GET Daily Summary PDF
router.get('/daily/pdf', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    
    const tickets = await runQuery(`
      SELECT * FROM coatroom_tickets
      WHERE DATE(created_at) = DATE(?)
      ORDER BY created_at ASC
    `, [date]);
    
    const summary = {
      'Total Tichete': tickets.length,
      'Active': tickets.filter(t => t.status === 'OPEN').length,
      'Închise': tickets.filter(t => t.status === 'CLOSED').length,
      'Pierdute': tickets.filter(t => t.status === 'LOST').length
    };
    
    const rows = tickets.map(t => ({
      cod: t.code,
      tip: t.type,
      client: t.customer_name || '-',
      status: t.status,
      ora: new Date(t.created_at).toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
    
    const pdfPath = await generatePdfReport({
      title: 'Coatroom – Daily Summary',
      subtitle: `Data: ${new Date(date).toLocaleDateString('ro-RO')}`,
      columns: [
        { label: 'Cod', field: 'cod', width: 100 },
        { label: 'Tip', field: 'tip', width: 80 },
        { label: 'Client', field: 'client', width: 130 },
        { label: 'Status', field: 'status', width: 80 },
        { label: 'Ora', field: 'ora', width: 80 }
      ],
      rows,
      summary
    });
    
    res.download(pdfPath, `coatroom_daily_${date}.pdf`, (err) => {
      if (err) console.error('Error sending PDF:', err);
      fs.unlinkSync(pdfPath);
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generating PDF report' });
  }
});

module.exports = router;

