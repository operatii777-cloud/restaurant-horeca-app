/**
 * PHASE S4.3 - Raport Z Controller
 */

const { raportZService } = require('../services/raport-z.service');

exports.listRaportZ = async (req, res, next) => {
  try {
    const filters = { from: req.query.from, to: req.query.to, locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined, status: req.query.status };
    const docs = await raportZService.list(filters);
    res.json(docs);
  } catch (error) { next(error); }
};

exports.getRaportZById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await raportZService.getById(id);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.createRaportZ = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const doc = await raportZService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) { next(error); }
};

exports.updateRaportZ = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const doc = await raportZService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.signRaportZ = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await raportZService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.lockRaportZ = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await raportZService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.pdfRaportZ = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('RAPORT_Z', id, res, req);
  } catch (error) { next(error); }
};

