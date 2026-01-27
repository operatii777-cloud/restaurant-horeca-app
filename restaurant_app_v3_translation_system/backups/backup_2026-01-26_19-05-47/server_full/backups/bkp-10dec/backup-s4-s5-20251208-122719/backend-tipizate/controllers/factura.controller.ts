/**
 * PHASE S4.3 - Factură Controller
 */

const { facturaService } = require('../services/factura.service');

function createController(service) {
  return {
    list: async (req, res, next) => {
      try {
        const filters = {
          from: req.query.from,
          to: req.query.to,
          locationId: req.query.locationId ? parseInt(req.query.locationId) : undefined,
          status: req.query.status,
        };
        const docs = await service.list(filters);
        res.json(docs);
      } catch (error) {
        next(error);
      }
    },

    getById: async (req, res, next) => {
      try {
        const id = parseInt(req.params.id);
        const doc = await service.getById(id);
        res.json(doc);
      } catch (error) {
        next(error);
      }
    },

    create: async (req, res, next) => {
      try {
        const userId = req.user?.id || 1;
        const doc = await service.create(req.body, userId);
        res.status(201).json(doc);
      } catch (error) {
        next(error);
      }
    },

    update: async (req, res, next) => {
      try {
        const id = parseInt(req.params.id);
        const userId = req.user?.id || 1;
        const doc = await service.update(id, req.body, userId);
        res.json(doc);
      } catch (error) {
        next(error);
      }
    },

    sign: async (req, res, next) => {
      try {
        const id = parseInt(req.params.id);
        const userId = req.user?.id || 1;
        const userName = req.user?.name;
        const doc = await service.sign(id, userId, userName);
        res.json(doc);
      } catch (error) {
        next(error);
      }
    },

    lock: async (req, res, next) => {
      try {
        const id = parseInt(req.params.id);
        const userId = req.user?.id || 1;
        const userName = req.user?.name;
        const doc = await service.lock(id, userId, userName);
        res.json(doc);
      } catch (error) {
        next(error);
      }
    },

    pdf: async (req, res, next) => {
      try {
        const id = parseInt(req.params.id);
        const { generatePdfResponse } = require('../pdf/pdf-controller-helper');
        await generatePdfResponse('FACTURA', id, res, req);
      } catch (error) {
        next(error);
      }
    },
  };
}

const controller = createController(facturaService);

exports.listFactura = controller.list;
exports.getFacturaById = controller.getById;
exports.createFactura = controller.create;
exports.updateFactura = controller.update;
exports.signFactura = controller.sign;
exports.lockFactura = controller.lock;
exports.pdfFactura = controller.pdf;

