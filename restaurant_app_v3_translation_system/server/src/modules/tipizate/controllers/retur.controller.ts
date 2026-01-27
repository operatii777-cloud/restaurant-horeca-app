/**
 * PHASE S4.3 - Retur Controller
 */

const { returService } = require('../services/retur.service');

exports.listRetur = async (req, res, next) => {
  try {
    const filters = { from: req.query.from, to: req.query.to, locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined, status: req.query.status };
    const docs = await returService.list(filters);
    res.json(docs);
  } catch (error) { next(error); }
};

exports.getReturById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await returService.getById(id);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.createRetur = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const doc = await returService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) { next(error); }
};

exports.updateRetur = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const doc = await returService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.signRetur = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await returService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.lockRetur = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await returService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.pdfRetur = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('RETUR', id, res, req);
  } catch (error) { next(error); }
};

