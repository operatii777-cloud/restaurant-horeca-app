/**
 * PHASE S4.3 - Chitanță Controller
 */

const { chitantaService } = require('../services/chitanta.service');

exports.listChitanta = async (req, res, next) => {
  try {
    const filters = { from: req.query.from, to: req.query.to, locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined, status: req.query.status };
    const docs = await chitantaService.list(filters);
    res.json(docs);
  } catch (error) { next(error); }
};

exports.getChitantaById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await chitantaService.getById(id);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.createChitanta = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const doc = await chitantaService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) { next(error); }
};

exports.updateChitanta = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const doc = await chitantaService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.signChitanta = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await chitantaService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.lockChitanta = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await chitantaService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.pdfChitanta = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('CHITANTA', id, res, req);
  } catch (error) { next(error); }
};

