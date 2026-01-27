/**
 * PHASE S4.2 - NIR Controller
 * Request handlers for NIR endpoints
 */

const { nirService } = require('../services/nir.service');

exports.listNir = async (req, res, next) => {
  try {
    const filters = {
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      locationId: req.query.locationId ? parseInt(req.query.locationId as string) : undefined,
      warehouseId: req.query.warehouseId ? parseInt(req.query.warehouseId as string) : undefined,
      status: req.query.status as string | undefined,
    };
    const docs = await nirService.list(filters);
    res.json(docs);
  } catch (error) {
    next(error);
  }
};

exports.getNirById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await nirService.getById(id);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.createNir = async (req, res, next) => {
  try {
    const userId = (req as any).user?.id || 1; // TODO: Get from auth middleware
    const doc = await nirService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
};

exports.updateNir = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1; // TODO: Get from auth middleware
    const doc = await nirService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.signNir = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1; // TODO: Get from auth middleware
    const userName = (req as any).user?.name; // TODO: Get from auth middleware
    const doc = await nirService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.lockNir = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1; // TODO: Get from auth middleware
    const userName = (req as any).user?.name; // TODO: Get from auth middleware
    const doc = await nirService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.pdfNir = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('NIR', id, res, req);
  } catch (error) {
    next(error);
  }
};

/**
 * Export NIR to JSON
 */
exports.exportNirJson = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await nirService.getById(id);
    
    if (!doc) {
      return res.status(404).json({ error: 'NIR not found' });
    }

    // Format data for export
    const exportData = {
      nirNumber: `${doc.series || ''}-${doc.number || ''}`,
      date: doc.date,
      supplierName: doc.supplierName || doc.supplier_name || '',
      invoiceNumber: doc.invoiceNumber || doc.invoice_number || '',
      locationName: doc.locationName || doc.location_name || '',
      items: (doc.lines || []).map((line: any, index: number) => ({
        index: index + 1,
        code: line.code || '',
        name: line.productName || line.product_name || '',
        unit: line.unit || '',
        qtyInvoice: line.quantity || 0,
        qtyReceived: line.quantity || 0,
        priceExVat: line.unitPrice || line.unit_price || 0,
        valueExVat: (line.quantity || 0) * (line.unitPrice || line.unit_price || 0),
        vatAmount: ((line.quantity || 0) * (line.unitPrice || line.unit_price || 0) * (line.vatRate || line.vat_rate || 0)) / 100,
        valueIncVat: ((line.quantity || 0) * (line.unitPrice || line.unit_price || 0) * (1 + (line.vatRate || line.vat_rate || 0) / 100))
      })),
      totalBase: doc.totals?.subtotal || 0,
      totalVat: doc.totals?.vatAmount || 0,
      totalIncVat: doc.totals?.total || 0
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="NIR_${exportData.nirNumber}_${exportData.date}.json"`);
    res.json(exportData);
  } catch (error) {
    next(error);
  }
};

/**
 * Export NIR to CSV
 */
exports.exportNirCsv = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await nirService.getById(id);
    
    if (!doc) {
      return res.status(404).json({ error: 'NIR not found' });
    }

    // Build CSV
    let csv = 'Nr;Cod;Denumire;UM;CantFactura;CantReceptionata;PretUnitarFaraTVA;ValoareFaraTVA;TVA;ValoareCuTVA\n';
    
    (doc.lines || []).forEach((line: any, index: number) => {
      const qty = line.quantity || 0;
      const price = line.unitPrice || line.unit_price || 0;
      const vatRate = line.vatRate || line.vat_rate || 0;
      const valueExVat = qty * price;
      const vatAmount = (valueExVat * vatRate) / 100;
      const valueIncVat = valueExVat + vatAmount;

      csv += `${index + 1};`;
      csv += `"${line.code || ''}";`;
      csv += `"${line.productName || line.product_name || ''}";`;
      csv += `"${line.unit || ''}";`;
      csv += `${qty};`;
      csv += `${qty};`;
      csv += `${price.toFixed(2)};`;
      csv += `${valueExVat.toFixed(2)};`;
      csv += `${vatAmount.toFixed(2)};`;
      csv += `${valueIncVat.toFixed(2)}\n`;
    });

    const totalBase = doc.totals?.subtotal || 0;
    const totalVat = doc.totals?.vatAmount || 0;
    const totalIncVat = doc.totals?.total || 0;
    csv += `;;TOTAL;;;${totalBase.toFixed(2)};${totalVat.toFixed(2)};${totalIncVat.toFixed(2)}\n`;

    res.setHeader('Content-Type', 'text/csv;charset=utf-8;');
    res.setHeader('Content-Disposition', `attachment; filename="NIR_${doc.series || ''}-${doc.number || ''}_${doc.date}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

