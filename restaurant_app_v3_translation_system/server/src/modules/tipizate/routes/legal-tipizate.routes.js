/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TIPIZATE LEGALE ROUTES - Conform OMFP 2634/2015 și Cod Fiscal Art. 319
 * ═══════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const {
  nirService,
  facturaService,
  chitantaService,
  avizService,
  bonConsumService,
  registruCasaService,
  numberToWords
} = require('../services/legal-tipizate.service');

// ═══════════════════════════════════════════════════════════════════════════
// NIR - Notă de Intrare-Recepție
// ═══════════════════════════════════════════════════════════════════════════
router.post('/nir', async (req, res) => {
  try {
    const result = await nirService.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [NIR Create]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/nir', async (req, res) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      supplier: req.query.supplier
    };
    const nirs = await nirService.list(filters);
    res.json({ success: true, data: nirs });
  } catch (error) {
    console.error('❌ [NIR List]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/nir/:id', async (req, res) => {
  try {
    const nir = await nirService.getById(req.params.id);
    if (!nir) {
      return res.status(404).json({ success: false, error: 'NIR not found' });
    }
    res.json({ success: true, data: nir });
  } catch (error) {
    console.error('❌ [NIR GetById]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FACTURA - Conform Cod Fiscal Art. 319
// ═══════════════════════════════════════════════════════════════════════════
router.post('/factura', async (req, res) => {
  try {
    const result = await facturaService.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [Factura Create]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/factura', async (req, res) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      client: req.query.client,
      status: req.query.status
    };
    const facturi = await facturaService.list(filters);
    res.json({ success: true, data: facturi });
  } catch (error) {
    console.error('❌ [Factura List]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/factura/:id', async (req, res) => {
  try {
    const factura = await facturaService.getById(req.params.id);
    if (!factura) {
      return res.status(404).json({ success: false, error: 'Factura not found' });
    }
    res.json({ success: true, data: factura });
  } catch (error) {
    console.error('❌ [Factura GetById]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// CHITANTA - Conform OMFP 2634/2015
// ═══════════════════════════════════════════════════════════════════════════
router.post('/chitanta', async (req, res) => {
  try {
    const result = await chitantaService.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [Chitanta Create]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/chitanta', async (req, res) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to
    };
    const chitante = await chitantaService.list(filters);
    res.json({ success: true, data: chitante });
  } catch (error) {
    console.error('❌ [Chitanta List]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/chitanta/:id', async (req, res) => {
  try {
    const chitanta = await chitantaService.getById(req.params.id);
    if (!chitanta) {
      return res.status(404).json({ success: false, error: 'Chitanta not found' });
    }
    res.json({ success: true, data: chitanta });
  } catch (error) {
    console.error('❌ [Chitanta GetById]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// AVIZ - Aviz de Însoțire a Mărfii
// ═══════════════════════════════════════════════════════════════════════════
router.post('/aviz', async (req, res) => {
  try {
    const result = await avizService.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [Aviz Create]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/aviz', async (req, res) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to
    };
    const avize = await avizService.list(filters);
    res.json({ success: true, data: avize });
  } catch (error) {
    console.error('❌ [Aviz List]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/aviz/:id', async (req, res) => {
  try {
    const aviz = await avizService.getById(req.params.id);
    if (!aviz) {
      return res.status(404).json({ success: false, error: 'Aviz not found' });
    }
    res.json({ success: true, data: aviz });
  } catch (error) {
    console.error('❌ [Aviz GetById]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BON CONSUM
// ═══════════════════════════════════════════════════════════════════════════
router.post('/bon-consum', async (req, res) => {
  try {
    const result = await bonConsumService.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [BonConsum Create]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bon-consum/:id', async (req, res) => {
  try {
    const bonConsum = await bonConsumService.getById(req.params.id);
    if (!bonConsum) {
      return res.status(404).json({ success: false, error: 'Bon consum not found' });
    }
    res.json({ success: true, data: bonConsum });
  } catch (error) {
    console.error('❌ [BonConsum GetById]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRU CASA
// ═══════════════════════════════════════════════════════════════════════════
router.post('/registru-casa/open', async (req, res) => {
  try {
    const result = await registruCasaService.openDay(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [RegistruCasa Open]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/registru-casa/:id/entry', async (req, res) => {
  try {
    const result = await registruCasaService.addEntry(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [RegistruCasa AddEntry]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/registru-casa/:id/close', async (req, res) => {
  try {
    const result = await registruCasaService.closeDay(req.params.id, req.body.verifiedBy);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ [RegistruCasa Close]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/registru-casa/:date', async (req, res) => {
  try {
    const registru = await registruCasaService.getByDate(req.params.date);
    res.json({ success: true, data: registru });
  } catch (error) {
    console.error('❌ [RegistruCasa GetByDate]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ROOT ENDPOINT - GET /api/tipizate-legal (List all document types)
// ═══════════════════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    // Return summary of all tipizate document types available
    res.json({
      success: true,
      data: {
        document_types: [
          { type: 'nir', name: 'Notă de Intrare-Recepție', endpoint: '/api/tipizate-legal/nir' },
          { type: 'factura', name: 'Factură', endpoint: '/api/tipizate-legal/factura' },
          { type: 'chitanta', name: 'Chitanță', endpoint: '/api/tipizate-legal/chitanta' },
          { type: 'aviz', name: 'Aviz de Însoțire a Mărfii', endpoint: '/api/tipizate-legal/aviz' },
          { type: 'bon-consum', name: 'Bon de Consum', endpoint: '/api/tipizate-legal/bon-consum' },
          { type: 'registru-casa', name: 'Registru de Casă', endpoint: '/api/tipizate-legal/registru-casa' }
        ],
        message: 'Legal tipizate documents conform OMFP 2634/2015 și Cod Fiscal Art. 319'
      }
    });
  } catch (error) {
    console.error('❌ [Tipizate Legal Root]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════
router.get('/utils/number-to-words/:amount', (req, res) => {
  try {
    const amount = parseFloat(req.params.amount);
    if (isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }
    res.json({ success: true, data: { amount, words: numberToWords(amount) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

