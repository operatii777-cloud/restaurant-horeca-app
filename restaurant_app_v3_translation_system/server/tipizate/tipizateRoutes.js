// server/tipizate/tipizateRoutes.js
// Routes pentru tipizate (documente nefiscale)

const {
  generateNirPdf,
  generateBonConsumPdf,
  generateAvizPdf,
  generateChitantaPdf,
  generateRegistruCasaPdf,
  generateFisaMagaziePdf,
  generateRaportGestiunePdf,
  generateTransferPdf,
  generateRestituirePdf,
  generateProcesVerbalPdf,
  generateOpPdf,
  generateBorderouPdf,
  generateComandaFurnizorPdf,
  generateInventarPdf,
  generateProductionBatchPdf,
} = require("./tipizatePdfService");

// checkAdminAuth este definit în server.js, nu într-un modul separat
// Vom primi funcția ca parametru sau o vom defini aici
const DEFAULT_TENANT_ID = 1;

function registerTipizateRoutes(app, checkAdminAuth) {
  // NIR
  app.get("/api/admin/tipizate/nir/:id/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const nirId = parseInt(req.params.id);
    if (!nirId) {
      return res.status(400).json({ error: "ID NIR invalid" });
    }
    generateNirPdf(tenantId, nirId, res);
  });

  // Bon consum
  app.get("/api/admin/tipizate/bon-consum/:id/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const consumptionId = parseInt(req.params.id);
    if (!consumptionId) {
      return res.status(400).json({ error: "ID Bon Consum invalid" });
    }
    generateBonConsumPdf(tenantId, consumptionId, res);
  });

  // Aviz
  app.get("/api/admin/tipizate/aviz/:id/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const avizId = parseInt(req.params.id);
    if (!avizId) {
      return res.status(400).json({ error: "ID Aviz invalid" });
    }
    generateAvizPdf(tenantId, avizId, res);
  });

  // Transfer
  app.get("/api/admin/tipizate/transfer/:id/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const transferId = parseInt(req.params.id);
    if (!transferId) {
      return res.status(400).json({ error: "ID Transfer invalid" });
    }
    generateTransferPdf(tenantId, transferId, res);
  });

  // Restituire
  app.get("/api/admin/tipizate/restituire/:id/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const restId = parseInt(req.params.id);
    if (!restId) {
      return res.status(400).json({ error: "ID Restituire invalid" });
    }
    generateRestituirePdf(tenantId, restId, res);
  });

  // Proces verbal
  app.get("/api/admin/tipizate/proces-verbal/:id/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const pvId = parseInt(req.params.id);
    if (!pvId) {
      return res.status(400).json({ error: "ID Proces Verbal invalid" });
    }
    generateProcesVerbalPdf(tenantId, pvId, res);
  });

  // Inventar
  app.get("/api/admin/tipizate/inventar/:id/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const inventoryId = parseInt(req.params.id);
    if (!inventoryId) {
      return res.status(400).json({ error: "ID Inventar invalid" });
    }
    generateInventarPdf(tenantId, inventoryId, res);
  });

  // Fișă magazie
  app.get(
    "/api/admin/tipizate/fisa-magazie/:ingredientId/:locationId/pdf",
    checkAdminAuth,
    (req, res) => {
      const tenantId = DEFAULT_TENANT_ID;
      const ingredientId = parseInt(req.params.ingredientId);
      const locationId = parseInt(req.params.locationId);
      if (!ingredientId || !locationId) {
        return res.status(400).json({ error: "ID ingredient sau location invalid" });
      }
      generateFisaMagaziePdf(tenantId, ingredientId, locationId, res);
    }
  );

  // Raport gestiune
  app.get("/api/admin/tipizate/raport-gestiune/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const locationId = parseInt(req.query.location_id);
    const from = req.query.from;
    const to = req.query.to;
    
    if (!locationId || !from || !to) {
      return res.status(400).json({ 
        error: "Parametri invalizi: location_id, from, to sunt obligatorii" 
      });
    }
    
    generateRaportGestiunePdf(tenantId, locationId, from, to, res);
  });

  // Chitanță
  app.get("/api/admin/tipizate/chitanta/:id/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const chitantaId = parseInt(req.params.id);
    if (!chitantaId) {
      return res.status(400).json({ error: "ID Chitanță invalid" });
    }
    generateChitantaPdf(tenantId, chitantaId, res);
  });

  // Registru casă
  app.get("/api/admin/tipizate/registru-casa/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const from = req.query.from;
    const to = req.query.to;
    
    if (!from || !to) {
      return res.status(400).json({ 
        error: "Parametri invalizi: from și to sunt obligatorii" 
      });
    }
    
    generateRegistruCasaPdf(tenantId, from, to, res);
  });

  // OP
  app.get("/api/admin/tipizate/op/:id/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const opId = parseInt(req.params.id);
    if (!opId) {
      return res.status(400).json({ error: "ID OP invalid" });
    }
    generateOpPdf(tenantId, opId, res);
  });

  // Borderou
  app.get("/api/admin/tipizate/borderou/:id/pdf", checkAdminAuth, (req, res) => {
    const tenantId = DEFAULT_TENANT_ID;
    const borderouId = parseInt(req.params.id);
    if (!borderouId) {
      return res.status(400).json({ error: "ID Borderou invalid" });
    }
    generateBorderouPdf(tenantId, borderouId, res);
  });

  // Comandă furnizor
  app.get(
    "/api/admin/tipizate/comanda-furnizor/:id/pdf",
    checkAdminAuth,
    (req, res) => {
      const tenantId = DEFAULT_TENANT_ID;
      const cmdId = parseInt(req.params.id);
      if (!cmdId) {
        return res.status(400).json({ error: "ID Comandă Furnizor invalid" });
      }
      generateComandaFurnizorPdf(tenantId, cmdId, res);
    }
  );

  // Production Batch
  app.get(
    "/api/admin/tipizate/production-batch/:id/pdf",
    checkAdminAuth,
    (req, res) => {
      const tenantId = DEFAULT_TENANT_ID;
      const batchId = parseInt(req.params.id);
      if (!batchId) {
        return res.status(400).json({ error: "ID Production Batch invalid" });
      }
      generateProductionBatchPdf(tenantId, batchId, res);
    }
  );
}

module.exports = { registerTipizateRoutes };

