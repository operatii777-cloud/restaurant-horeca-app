/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TIPIZATE ANAF ROUTES - Enterprise-Grade Implementation
 * Conform OMFP 2634/2015 și specificațiilor ANAF
 * ═══════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { dbPromise } = require('../../../../database');
const {
  avizInsotireService,
  bonConsumService,
  procesVerbalService,
  bonPierderiService
} = require('../services/anaf-tipizate.service');
const {
  generateAvizInsotirePDF,
  generateBonConsumPDF,
  generateProcesVerbalPDF,
  generateBonPierderiPDF
} = require('../pdf/anaf-pdf-generator');

// ═══════════════════════════════════════════════════════════════════════════
// 1. AVIZ DE ÎNSOȚIRE A MĂRFII (Cod ANAF 14-3-6A)
// ═══════════════════════════════════════════════════════════════════════════

router.post('/aviz-insotire', async (req, res) => {
  try {
    const result = await avizInsotireService.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [Aviz Insotire Create]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/aviz-insotire', async (req, res) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      status: req.query.status
    };
    const avize = await avizInsotireService.list(filters);
    res.json({ success: true, data: avize });
  } catch (error) {
    console.error('❌ [Aviz Insotire List]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/aviz-insotire/:id', async (req, res) => {
  try {
    const aviz = await avizInsotireService.getById(req.params.id);
    if (!aviz) {
      return res.status(404).json({ success: false, error: 'Aviz not found' });
    }
    res.json({ success: true, data: aviz });
  } catch (error) {
    console.error('❌ [Aviz Insotire GetById]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/aviz-insotire/:id/emit', async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    const aviz = await avizInsotireService.emit(req.params.id, userId);
    res.json({ success: true, data: aviz });
  } catch (error) {
    console.error('❌ [Aviz Insotire Emit]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/aviz-insotire/:id/storno', async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    const { motiv } = req.body;
    const aviz = await avizInsotireService.storno(req.params.id, userId, motiv);
    res.json({ success: true, data: aviz });
  } catch (error) {
    console.error('❌ [Aviz Insotire Storno]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. BON DE CONSUM (Cod ANAF 14-3-4A)
// ═══════════════════════════════════════════════════════════════════════════

router.post('/bon-consum', async (req, res) => {
  try {
    const result = await bonConsumService.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [Bon Consum Create]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bon-consum', async (req, res) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      status: req.query.status
    };
    const bonuri = await bonConsumService.list(filters);
    res.json({ success: true, data: bonuri });
  } catch (error) {
    console.error('❌ [Bon Consum List]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bon-consum/:id', async (req, res) => {
  try {
    const bon = await bonConsumService.getById(req.params.id);
    if (!bon) {
      return res.status(404).json({ success: false, error: 'Bon consum not found' });
    }
    res.json({ success: true, data: bon });
  } catch (error) {
    console.error('❌ [Bon Consum GetById]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. PROCES-VERBAL DE SCOATERE DIN GESTIUNE
// ═══════════════════════════════════════════════════════════════════════════

router.post('/proces-verbal', async (req, res) => {
  try {
    const result = await procesVerbalService.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [Proces Verbal Create]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/proces-verbal/:id', async (req, res) => {
  try {
    const pv = await procesVerbalService.getById(req.params.id);
    if (!pv) {
      return res.status(404).json({ success: false, error: 'Proces verbal not found' });
    }
    res.json({ success: true, data: pv });
  } catch (error) {
    console.error('❌ [Proces Verbal GetById]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. BON PIERDERI / REBUTURI / CASARE
// ═══════════════════════════════════════════════════════════════════════════

router.post('/bon-pierderi', async (req, res) => {
  try {
    const result = await bonPierderiService.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [Bon Pierderi Create]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bon-pierderi/:id', async (req, res) => {
  try {
    const bon = await bonPierderiService.getById(req.params.id);
    if (!bon) {
      return res.status(404).json({ success: false, error: 'Bon pierderi not found' });
    }
    res.json({ success: true, data: bon });
  } catch (error) {
    console.error('❌ [Bon Pierderi GetById]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. GENERARE PDF PENTRU TIPIZATE
// ═══════════════════════════════════════════════════════════════════════════

router.get('/aviz-insotire/:id/pdf', async (req, res) => {
  try {
    const aviz = await avizInsotireService.getById(req.params.id);
    if (!aviz) {
      return res.status(404).json({ success: false, error: 'Aviz not found' });
    }
    
    const pdfBuffer = await generateAvizInsotirePDF(aviz);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="aviz-${aviz.serie}-${aviz.numar}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ [Aviz PDF]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bon-consum/:id/pdf', async (req, res) => {
  try {
    const bon = await bonConsumService.getById(req.params.id);
    if (!bon) {
      return res.status(404).json({ success: false, error: 'Bon consum not found' });
    }
    
    const pdfBuffer = await generateBonConsumPDF(bon);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bon-consum-${bon.series}-${bon.number}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ [Bon Consum PDF]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/proces-verbal/:id/pdf', async (req, res) => {
  try {
    const pv = await procesVerbalService.getById(req.params.id);
    if (!pv) {
      return res.status(404).json({ success: false, error: 'Proces verbal not found' });
    }
    
    const pdfBuffer = await generateProcesVerbalPDF(pv);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="proces-verbal-${pv.numar}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ [Proces Verbal PDF]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bon-pierderi/:id/pdf', async (req, res) => {
  try {
    const bon = await bonPierderiService.getById(req.params.id);
    if (!bon) {
      return res.status(404).json({ success: false, error: 'Bon pierderi not found' });
    }
    
    const pdfBuffer = await generateBonPierderiPDF(bon);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bon-pierderi-${bon.serie}-${bon.numar}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ [Bon Pierderi PDF]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. EXPORT DOSAR CONTROL ANAF
// ═══════════════════════════════════════════════════════════════════════════

router.get('/export-anaf', async (req, res) => {
  try {
    const { from, to } = req.query;
    const db = await dbPromise;
    const fromDate = from || '2020-01-01';
    const toDate = to || new Date().toISOString().split('T')[0];
    
    // Colectează toate documentele pentru perioada specificată
    const avize = await avizInsotireService.list({ from: fromDate, to: toDate });
    const bonuri_consum = await bonConsumService.list({ from: fromDate, to: toDate });
    
    // Obține procese verbale
    const procese_verbale = await new Promise((resolve) => {
      db.all(`
        SELECT * FROM procese_verbale_scoatere 
        WHERE data >= ? AND data <= ?
        ORDER BY data DESC
      `, [fromDate, toDate], (err, rows) => {
        resolve(err ? [] : (rows || []));
      });
    });
    
    // Obține bonuri pierderi
    const bonuri_pierderi = await new Promise((resolve) => {
      db.all(`
        SELECT * FROM bonuri_pierderi 
        WHERE data >= ? AND data <= ?
        ORDER BY data DESC
      `, [fromDate, toDate], (err, rows) => {
        resolve(err ? [] : (rows || []));
      });
    });
    
    // Obține note contabile
    const note_contabile = await new Promise((resolve) => {
      db.all(`
        SELECT * FROM note_contabile 
        WHERE data >= ? AND data <= ?
        ORDER BY data DESC
      `, [fromDate, toDate], (err, rows) => {
        resolve(err ? [] : (rows || []));
      });
    });
    
    // Obține jurnal
    const jurnal = await new Promise((resolve) => {
      db.all(`
        SELECT * FROM jurnal_tipizate 
        WHERE created_at >= ? AND created_at <= ?
        ORDER BY created_at DESC
      `, [fromDate, toDate + ' 23:59:59'], (err, rows) => {
        resolve(err ? [] : (rows || []));
      });
    });
    
    // Obține mișcări stoc legate de tipizate
    const miscari_stoc = await new Promise((resolve) => {
      db.all(`
        SELECT * FROM stock_moves 
        WHERE reference_type IN ('BON_CONSUM', 'BON_PIERDERI', 'AVIZ_INSOTIRE')
        AND date >= ? AND date <= ?
        ORDER BY date DESC
      `, [fromDate, toDate], (err, rows) => {
        resolve(err ? [] : (rows || []));
      });
    });
    
    // Calculează hash pentru integritate
    const dataString = JSON.stringify({ avize, bonuri_consum, procese_verbale, bonuri_pierderi, note_contabile });
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    
    res.json({
      success: true,
      data: {
        perioada: { from: fromDate, to: toDate },
        documente: {
          avize,
          bonuri_consum,
          procese_verbale,
          bonuri_pierderi,
          note_contabile,
          jurnal,
          miscari_stoc
        },
        statistici: {
          total_avize: avize.length,
          total_bonuri_consum: bonuri_consum.length,
          total_procese_verbale: procese_verbale.length,
          total_bonuri_pierderi: bonuri_pierderi.length,
          total_note_contabile: note_contabile.length,
          total_miscari_stoc: miscari_stoc.length
        },
        generat_la: new Date().toISOString(),
        hash
      }
    });
  } catch (error) {
    console.error('❌ [Export ANAF]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
