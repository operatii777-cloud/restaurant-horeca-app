/**
 * PHASE S4.3 - Proces Verbal Controller
 */

const { procesVerbalService } = require('../services/proces-verbal.service');

exports.listProcesVerbal = async (req, res, next) => {
  try {
    const filters = { from: req.query.from, to: req.query.to, locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined, status: req.query.status };
    const docs = await procesVerbalService.list(filters);
    res.json(docs);
  } catch (error) { next(error); }
};

exports.getProcesVerbalById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await procesVerbalService.getById(id);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.createProcesVerbal = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const doc = await procesVerbalService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) { next(error); }
};

exports.updateProcesVerbal = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const doc = await procesVerbalService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.signProcesVerbal = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await procesVerbalService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.lockProcesVerbal = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await procesVerbalService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.pdfProcesVerbal = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('PROCES_VERBAL', id, res, req);
  } catch (error) { next(error); }
};

