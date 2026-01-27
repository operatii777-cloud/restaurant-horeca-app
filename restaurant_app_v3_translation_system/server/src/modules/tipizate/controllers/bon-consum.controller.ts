/**
 * PHASE S4.3 - Bon Consum Controller
 */

const { bonConsumService } = require('../services/bon-consum.service');

exports.listBonConsum = async (req, res, next) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined,
      warehouseId: req.query.warehouseId ? parseInt(req.query.warehouseId) : undefined,
      status: req.query.status,
    };
    const docs = await bonConsumService.list(filters);
    res.json(docs);
  } catch (error) {
    next(error);
  }
};

exports.getBonConsumById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await bonConsumService.getById(id);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.createBonConsum = async (req, res, next) => {
  try {
    const userId = (req as any).user?.id || 1;
    const doc = await bonConsumService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
};

exports.updateBonConsum = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const doc = await bonConsumService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.signBonConsum = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const userName = (req as any).user?.name;
    const doc = await bonConsumService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.lockBonConsum = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const userName = (req as any).user?.name;
    const doc = await bonConsumService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.pdfBonConsum = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('BON_CONSUM', id, res, req);
  } catch (error) {
    next(error);
  }
};

