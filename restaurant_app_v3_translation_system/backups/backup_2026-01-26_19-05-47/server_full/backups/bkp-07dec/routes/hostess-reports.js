// Hostess Map Reports
// Purpose: Generate occupancy reports and analytics
// Created: 3 Dec 2025

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { generatePdfReport } = require('../utils/pdf-generator');

// Helper
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// GET Occupancy Report (JSON)
router.get('/occupancy', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const sessions = await runQuery(`
      SELECT 
        ts.*,
        t.table_number,
        t.location as zone,
        t.capacity,
        w.name as server_name,
        CAST((julianday(ts.closed_at) - julianday(ts.started_at)) * 1440 AS INTEGER) as duration_minutes
      FROM table_sessions ts
      JOIN tables t ON t.id = ts.table_id
      LEFT JOIN waiters w ON w.id = ts.server_id
      WHERE ts.started_at >= ? AND ts.started_at <= ?
      ORDER BY ts.started_at DESC
    `, [from, to]);
    
    // Calculate summary
    const summary = {
      total_sessions: sessions.length,
      total_covers: sessions.reduce((sum, s) => sum + (s.covers || 0), 0),
      avg_duration: sessions.length > 0 
        ? Math.round(sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length)
        : 0,
      open_sessions: sessions.filter(s => s.status === 'OPEN').length
    };
    
    res.json({ success: true, data: sessions, summary });
  } catch (error) {
    console.error('Error generating occupancy report:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});

// GET Occupancy Report PDF
router.get('/occupancy/pdf', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const sessions = await runQuery(`
      SELECT 
        ts.*,
        t.table_number,
        t.location as zone,
        t.capacity,
        w.name as server_name,
        CAST((julianday(ts.closed_at) - julianday(ts.started_at)) * 1440 AS INTEGER) as duration_minutes
      FROM table_sessions ts
      JOIN tables t ON t.id = ts.table_id
      LEFT JOIN waiters w ON w.id = ts.server_id
      WHERE ts.started_at >= ? AND ts.started_at <= ?
      ORDER BY ts.started_at DESC
    `, [from, to]);
    
    const summary = {
      'Total Sesiuni': sessions.length,
      'Total Clienți': sessions.reduce((sum, s) => sum + (s.covers || 0), 0),
      'Durată Medie': `${Math.round(sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length)} min`
    };
    
    const rows = sessions.map(s => ({
      masa: s.table_number,
      zona: s.zone || '-',
      start: new Date(s.started_at).toLocaleString('ro-RO', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      end: s.closed_at 
        ? new Date(s.closed_at).toLocaleString('ro-RO', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : '-',
      durata: s.duration_minutes ? `${s.duration_minutes} min` : '-',
      covers: s.covers || '-',
      server: s.server_name || '-'
    }));
    
    const pdfPath = await generatePdfReport({
      title: 'Hostess Map – Occupancy Report',
      subtitle: `Perioada: ${new Date(from).toLocaleDateString('ro-RO')} - ${new Date(to).toLocaleDateString('ro-RO')}`,
      columns: [
        { label: 'Masă', field: 'masa', width: 60 },
        { label: 'Zonă', field: 'zona', width: 70 },
        { label: 'Start', field: 'start', width: 90 },
        { label: 'End', field: 'end', width: 60 },
        { label: 'Durată', field: 'durata', width: 70 },
        { label: 'Covers', field: 'covers', width: 50 },
        { label: 'Ospătar', field: 'server', width: 95 }
      ],
      rows,
      summary
    });
    
    res.download(pdfPath, `hostess_occupancy_${from}_${to}.pdf`, (err) => {
      if (err) console.error('Error sending PDF:', err);
      // Clean up temp file
      fs.unlinkSync(pdfPath);
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generating PDF report' });
  }
});

module.exports = router;

