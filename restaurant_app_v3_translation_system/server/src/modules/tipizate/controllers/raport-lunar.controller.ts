/**
 * PHASE S4.3 - Raport Lunar Controller
 */

const { raportLunarService } = require('../services/raport-lunar.service');

exports.listRaportLunar = async (req, res, next) => {
  try {
    const filters = { from: req.query.from, to: req.query.to, locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined, status: req.query.status };
    const docs = await raportLunarService.list(filters);
    res.json(docs);
  } catch (error) { next(error); }
};

exports.getRaportLunarById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await raportLunarService.getById(id);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.createRaportLunar = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const doc = await raportLunarService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) { next(error); }
};

exports.updateRaportLunar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const doc = await raportLunarService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.signRaportLunar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await raportLunarService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.lockRaportLunar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await raportLunarService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.pdfRaportLunar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('RAPORT_LUNAR', id, res, req);
  } catch (error) { next(error); }
};

