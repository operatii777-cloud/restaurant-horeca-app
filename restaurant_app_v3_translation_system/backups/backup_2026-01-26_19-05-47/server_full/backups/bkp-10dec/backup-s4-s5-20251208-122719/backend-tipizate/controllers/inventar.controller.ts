/**
 * PHASE S4.3 - Inventar Controller
 */

const { inventarService } = require('../services/inventar.service');

exports.listInventar = async (req, res, next) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined,
      status: req.query.status,
    };
    const docs = await inventarService.list(filters);
    res.json(docs);
  } catch (error) {
    next(error);
  }
};

exports.getInventarById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await inventarService.getById(id);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.createInventar = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const doc = await inventarService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
};

exports.updateInventar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const doc = await inventarService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.signInventar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await inventarService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.lockInventar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await inventarService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.pdfInventar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('INVENTAR', id, res, req);
  } catch (error) {
    next(error);
  }
};

