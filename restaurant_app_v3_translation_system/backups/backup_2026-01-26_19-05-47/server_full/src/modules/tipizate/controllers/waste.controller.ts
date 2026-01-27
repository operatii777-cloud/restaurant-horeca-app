/**
 * PHASE S4.3 - Waste Controller
 */

const { wasteService } = require('../services/waste.service');

exports.listWaste = async (req, res, next) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined,
      warehouseId: req.query.warehouseId ? parseInt(req.query.warehouseId) : undefined,
      status: req.query.status,
    };
    const docs = await wasteService.list(filters);
    res.json(docs);
  } catch (error) {
    next(error);
  }
};

exports.getWasteById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await wasteService.getById(id);
    if (!doc || doc.type !== 'WASTE') {
      throw new Error('Waste document not found');
    }
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.createWaste = async (req, res, next) => {
  try {
    const userId = (req as any).user?.id || 1;
    const doc = await wasteService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
};

exports.updateWaste = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const doc = await wasteService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.signWaste = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const userName = (req as any).user?.name || 'Admin';
    const doc = await wasteService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.lockWaste = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const userName = (req as any).user?.name || 'Admin';
    const doc = await wasteService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.pdfWaste = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const pdfBuffer = await wasteService.pdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="waste-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

