/**
 * PHASE S4.3 - Aviz Controller
 */

const { avizService } = require('../services/aviz.service');

exports.listAviz = async (req, res, next) => {
  try {
    const filters = { from: req.query.from, to: req.query.to, locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined, status: req.query.status };
    const docs = await avizService.list(filters);
    res.json(docs);
  } catch (error) { next(error); }
};

exports.getAvizById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await avizService.getById(id);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.createAviz = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const doc = await avizService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) { next(error); }
};

exports.updateAviz = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const doc = await avizService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.signAviz = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await avizService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.lockAviz = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await avizService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.pdfAviz = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('AVIZ', id, res, req);
  } catch (error) { next(error); }
};

