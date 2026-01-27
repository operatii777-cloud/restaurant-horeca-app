/**
 * PHASE S4.3 - Transfer Controller
 */

const { transferService } = require('../services/transfer.service');

exports.listTransfer = async (req, res, next) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined,
      status: req.query.status,
    };
    const docs = await transferService.list(filters);
    res.json(docs);
  } catch (error) {
    next(error);
  }
};

exports.getTransferById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await transferService.getById(id);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.createTransfer = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const doc = await transferService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
};

exports.updateTransfer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const doc = await transferService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.signTransfer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await transferService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.lockTransfer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await transferService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.pdfTransfer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('TRANSFER', id, res, req);
  } catch (error) {
    next(error);
  }
};

