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

