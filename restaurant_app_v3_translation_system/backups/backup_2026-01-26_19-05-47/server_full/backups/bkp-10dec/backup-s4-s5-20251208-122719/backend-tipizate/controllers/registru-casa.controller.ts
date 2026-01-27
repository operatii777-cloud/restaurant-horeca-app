/**
 * PHASE S4.3 - Registru Casă Controller
 */

const { registruCasaService } = require('../services/registru-casa.service');

exports.listRegistruCasa = async (req, res, next) => {
  try {
    const filters = { from: req.query.from, to: req.query.to, locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined, status: req.query.status };
    const docs = await registruCasaService.list(filters);
    res.json(docs);
  } catch (error) { next(error); }
};

exports.getRegistruCasaById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await registruCasaService.getById(id);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.createRegistruCasa = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;
    const doc = await registruCasaService.create(req.body, userId);
    res.status(201).json(doc);
  } catch (error) { next(error); }
};

exports.updateRegistruCasa = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const doc = await registruCasaService.update(id, req.body, userId);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.signRegistruCasa = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await registruCasaService.sign(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.lockRegistruCasa = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id || 1;
    const userName = req.user?.name;
    const doc = await registruCasaService.lock(id, userId, userName);
    res.json(doc);
  } catch (error) { next(error); }
};

exports.pdfRegistruCasa = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
    await generatePdfResponse('REGISTRU_CASA', id, res, req);
  } catch (error) { next(error); }
};

