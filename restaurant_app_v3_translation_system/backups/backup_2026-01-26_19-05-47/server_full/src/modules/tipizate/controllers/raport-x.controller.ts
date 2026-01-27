/**
 * PHASE S4.3 - Raport X Controller
 */

const { raportXService } = require('../services/raport-x.service');

exports.listRaportX = async (req, res, next) => {
  try {
    const filters = { from: req.query.from, to: req.query.to, locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined, status: req.query.status };
    const docs = await raportXService.list(filters);
    res.json(docs);
  } catch (error) { next(error); }
};

exports.getRaportXById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await raportXService.getById(id);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.createRaportX = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const doc = await raportXService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) { next(error); }
};

exports.updateRaportX = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const doc = await raportXService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.signRaportX = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await raportXService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.lockRaportX = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await raportXService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.pdfRaportX = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('RAPORT_X', id, res, req);
  } catch (error) { next(error); }
};

