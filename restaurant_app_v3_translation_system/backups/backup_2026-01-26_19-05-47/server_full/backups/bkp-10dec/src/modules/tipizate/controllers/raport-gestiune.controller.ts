/**
 * PHASE S4.3 - Raport Gestiune Controller
 */

const { raportGestiuneService } = require('../services/raport-gestiune.service');

exports.listRaportGestiune = async (req, res, next) => {
  try {
    const filters = { from: req.query.from, to: req.query.to, locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined, status: req.query.status };
    const docs = await raportGestiuneService.list(filters);
    res.json(docs);
  } catch (error) { next(error); }
};

exports.getRaportGestiuneById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await raportGestiuneService.getById(id);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.createRaportGestiune = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const doc = await raportGestiuneService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) { next(error); }
};

exports.updateRaportGestiune = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const doc = await raportGestiuneService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.signRaportGestiune = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await raportGestiuneService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.lockRaportGestiune = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await raportGestiuneService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.pdfRaportGestiune = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('RAPORT_GESTIUNE', id, res, req);
  } catch (error) { next(error); }
};

