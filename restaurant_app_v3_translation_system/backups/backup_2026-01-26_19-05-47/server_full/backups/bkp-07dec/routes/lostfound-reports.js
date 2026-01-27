// Lost & Found Reports
// Purpose: Generate items reports and analytics
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

// GET Items Report PDF
router.get('/items/pdf', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const items = await runQuery(`
      SELECT * FROM lostfound_items
      WHERE DATE(found_at) >= DATE(?) AND DATE(found_at) <= DATE(?)
      ORDER BY found_at DESC
    `, [from, to]);
    
    const summary = {
      'Total Obiecte': items.length,
      'Depozitate': items.filter(i => i.status === 'STORED').length,
      'Returnate': items.filter(i => i.status === 'RETURNED').length,
      'Aruncate': items.filter(i => i.status === 'DISCARDED').length
    };
    
    const rows = items.map(i => ({
      descriere: i.description,
      loc: i.location_found || '-',
      gasit: new Date(i.found_at).toLocaleString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: i.status,
      returnat: i.returned_to || '-',
      data_returnare: i.returned_at 
        ? new Date(i.returned_at).toLocaleDateString('ro-RO')
        : '-'
    }));
    
    const pdfPath = await generatePdfReport({
      title: 'Lost & Found – Items Report',
      subtitle: `Perioada: ${new Date(from).toLocaleDateString('ro-RO')} - ${new Date(to).toLocaleDateString('ro-RO')}`,
      columns: [
        { label: 'Descriere', field: 'descriere', width: 140 },
        { label: 'Locație', field: 'loc', width: 80 },
        { label: 'Găsit La', field: 'gasit', width: 80 },
        { label: 'Status', field: 'status', width: 70 },
        { label: 'Returnat Către', field: 'returnat', width: 90 },
        { label: 'Data Returnare', field: 'data_returnare', width: 80 }
      ],
      rows,
      summary
    });
    
    res.download(pdfPath, `lostfound_report_${from}_${to}.pdf`, (err) => {
      if (err) console.error('Error sending PDF:', err);
      fs.unlinkSync(pdfPath);
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generating PDF report' });
  }
});

module.exports = router;

