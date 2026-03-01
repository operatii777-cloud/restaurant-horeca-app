const express = require('express');
const router = express.Router();

// NOTE: In-memory state is used here for demo/development purposes.
// In production, replace with a persistent database (e.g., SQLite/PostgreSQL).
const nirDocuments = new Map();
let nirCounter = 1;

const VALID_VAT_RATES = [0, 5, 9, 19];

function nextId() {
  return nirCounter++;
}

function generateNirNumber(id, year) {
  return `NIR-${year}-${String(id).padStart(4, '0')}`;
}

function calculateTotals(items) {
  let totalExVAT = 0;
  let totalVAT = 0;
  const vatBreakdown = { '0': 0, '5': 0, '9': 0, '19': 0 };

  const enrichedItems = items.map(item => {
    const discount = item.discount || 0;
    const lineTotal = item.quantityReceived * item.pricePerUnit * (1 - discount / 100);
    const lineVAT = lineTotal * (item.vatRate / 100);
    totalExVAT += lineTotal;
    totalVAT += lineVAT;
    vatBreakdown[String(item.vatRate)] = (vatBreakdown[String(item.vatRate)] || 0) + lineVAT;
    return { ...item, lineTotal, lineVAT, lineTotalInclVAT: lineTotal + lineVAT };
  });

  return {
    items: enrichedItems,
    totalExVAT: Math.round(totalExVAT * 100) / 100,
    totalVAT: Math.round(totalVAT * 100) / 100,
    totalInclVAT: Math.round((totalExVAT + totalVAT) * 100) / 100,
    vatBreakdown,
  };
}

function validateNirData(data) {
  const errors = [];
  if (!data.date) errors.push('date is required');
  if (!data.supplierName) errors.push('supplierName is required');
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0)
    errors.push('items array is required and must not be empty');

  if (Array.isArray(data.items)) {
    data.items.forEach((item, i) => {
      if (!item.name) errors.push(`items[${i}].name is required`);
      if (!item.unit) errors.push(`items[${i}].unit is required`);
      if (item.quantityReceived == null || item.quantityReceived <= 0)
        errors.push(`items[${i}].quantityReceived must be a positive number`);
      if (item.pricePerUnit == null || item.pricePerUnit < 0)
        errors.push(`items[${i}].pricePerUnit must be a non-negative number`);
      if (!VALID_VAT_RATES.includes(Number(item.vatRate)))
        errors.push(`items[${i}].vatRate must be one of ${VALID_VAT_RATES.join(', ')}`);
    });
  }
  return errors;
}

// GET /api/tipizate/nir - List NIR documents
router.get('/nir', (req, res) => {
  let list = Array.from(nirDocuments.values());

  if (req.query.status) {
    list = list.filter(n => n.status === req.query.status.toUpperCase());
  }
  if (req.query.startDate) {
    list = list.filter(n => n.date >= req.query.startDate);
  }
  if (req.query.endDate) {
    list = list.filter(n => n.date <= req.query.endDate);
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(req.query.perPage) || 30));
  const total = list.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  const paged = list.slice((page - 1) * perPage, page * perPage);

  res.json({ success: true, data: { items: paged, total, page, perPage, totalPages } });
});

// GET /api/tipizate/nir/:id - Single NIR
router.get('/nir/:id', (req, res) => {
  const nir = nirDocuments.get(Number(req.params.id));
  if (!nir) return res.status(404).json({ success: false, error: 'NIR not found' });
  res.json({ success: true, data: nir });
});

// POST /api/tipizate/nir - Create NIR
router.post('/nir', (req, res) => {
  const errors = validateNirData(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const year = new Date().getFullYear();
  const { items: rawItems, ...rest } = req.body;
  const { items, totalExVAT, totalVAT, totalInclVAT, vatBreakdown } = calculateTotals(rawItems);

  const id = nextId();
  const nir = {
    id,
    number: rest.number || generateNirNumber(id, year),
    date: rest.date,
    status: 'DRAFT',
    supplierName: rest.supplierName,
    supplierCUI: rest.supplierCUI || null,
    supplierAddress: rest.supplierAddress || null,
    warehouseId: rest.warehouseId || 1,
    referenceDocument: rest.referenceDocument || null,
    notes: rest.notes || null,
    items,
    totalExVAT,
    totalVAT,
    totalInclVAT,
    vatBreakdown,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  nirDocuments.set(id, nir);
  res.status(201).json({ success: true, data: nir });
});

// PUT /api/tipizate/nir/:id - Update NIR (only DRAFT)
router.put('/nir/:id', (req, res) => {
  const nir = nirDocuments.get(Number(req.params.id));
  if (!nir) return res.status(404).json({ success: false, error: 'NIR not found' });
  if (nir.status !== 'DRAFT') {
    return res.status(400).json({ success: false, error: 'Only DRAFT NIR documents can be edited' });
  }

  const { items: rawItems, ...rest } = req.body;
  let updated = { ...nir, ...rest, updatedAt: new Date().toISOString() };

  if (rawItems) {
    const errors = validateNirData({ ...updated, items: rawItems });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    const { items, totalExVAT, totalVAT, totalInclVAT, vatBreakdown } = calculateTotals(rawItems);
    updated = { ...updated, items, totalExVAT, totalVAT, totalInclVAT, vatBreakdown };
  }

  nirDocuments.set(nir.id, updated);
  res.json({ success: true, message: 'NIR saved successfully', data: updated });
});

// DELETE /api/tipizate/nir/:id - Delete NIR (only DRAFT)
router.delete('/nir/:id', (req, res) => {
  const nir = nirDocuments.get(Number(req.params.id));
  if (!nir) return res.status(404).json({ success: false, error: 'NIR not found' });
  if (nir.status !== 'DRAFT') {
    return res.status(400).json({ success: false, error: 'Only DRAFT NIR documents can be deleted' });
  }
  nirDocuments.delete(nir.id);
  res.json({ success: true, message: 'NIR deleted successfully' });
});

// POST /api/tipizate/nir/:id/validate - Validate NIR
router.post('/nir/:id/validate', (req, res) => {
  const nir = nirDocuments.get(Number(req.params.id));
  if (!nir) return res.status(404).json({ success: false, error: 'NIR not found' });
  if (nir.status === 'LOCKED' || nir.status === 'ARCHIVED') {
    return res.status(400).json({ success: false, error: `Cannot validate a ${nir.status} NIR` });
  }
  const updated = { ...nir, status: 'VALIDATED', updatedAt: new Date().toISOString() };
  nirDocuments.set(nir.id, updated);
  res.json({ success: true, data: updated });
});

// POST /api/tipizate/nir/:id/sign - Sign NIR
router.post('/nir/:id/sign', (req, res) => {
  const nir = nirDocuments.get(Number(req.params.id));
  if (!nir) return res.status(404).json({ success: false, error: 'NIR not found' });
  if (nir.status !== 'VALIDATED') {
    return res.status(400).json({ success: false, error: 'NIR must be VALIDATED before signing' });
  }
  const updated = {
    ...nir,
    status: 'SIGNED',
    signedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  nirDocuments.set(nir.id, updated);
  res.json({ success: true, data: updated });
});

// POST /api/tipizate/nir/:id/lock - Lock NIR and update stock
router.post('/nir/:id/lock', (req, res) => {
  const nir = nirDocuments.get(Number(req.params.id));
  if (!nir) return res.status(404).json({ success: false, error: 'NIR not found' });
  if (nir.status !== 'SIGNED') {
    return res.status(400).json({ success: false, error: 'NIR must be SIGNED before locking' });
  }
  const updated = {
    ...nir,
    status: 'LOCKED',
    lockedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  nirDocuments.set(nir.id, updated);
  // In production, trigger stock update and accounting entries here
  const stockUpdates = nir.items.map(item => ({
    ingredientId: item.ingredientId || null,
    name: item.name,
    quantityAdded: item.quantityReceived,
  }));
  res.json({ success: true, data: updated, stockUpdates });
});

// POST /api/tipizate/nir/from-invoice - Create NIR from extracted invoice data (used by Python extractor)
router.post('/nir/from-invoice', (req, res) => {
  const { extractedData, sourceFile } = req.body;
  if (!extractedData) {
    return res.status(400).json({ success: false, error: 'extractedData is required' });
  }

  const errors = validateNirData(extractedData);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const year = new Date().getFullYear();
  const { items: rawItems, ...rest } = extractedData;
  const { items, totalExVAT, totalVAT, totalInclVAT, vatBreakdown } = calculateTotals(rawItems);

  const id = nextId();
  const nir = {
    id,
    number: rest.number || generateNirNumber(id, year),
    date: rest.date || new Date().toISOString().split('T')[0],
    status: 'DRAFT',
    supplierName: rest.supplierName,
    supplierCUI: rest.supplierCUI || null,
    supplierAddress: rest.supplierAddress || null,
    warehouseId: rest.warehouseId || 1,
    referenceDocument: rest.referenceDocument || null,
    notes: rest.notes || null,
    sourceFile: sourceFile || null,
    items,
    totalExVAT,
    totalVAT,
    totalInclVAT,
    vatBreakdown,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'nir-extractor',
  };

  nirDocuments.set(id, nir);
  res.status(201).json({ success: true, data: nir });
});

module.exports = router;
