// server/tipizate/tipizatePdfService.js
// Serviciu pentru generarea PDF-urilor tipizate (SAGA-like)

const PDFDocument = require("pdfkit");
const { dbPromise } = require("../database");
const path = require("path");
const fs = require("fs");

const DEFAULT_TENANT_ID = 1;

// ===== Helpers comune =====

function sendPdfResponse(res, filename, buildFn) {
  const doc = new PDFDocument({ size: "A4", margin: 36 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${filename}"`
  );

  doc.pipe(res);
  buildFn(doc);
  doc.end();
}

function drawCompanyHeader(doc, company, title) {
  doc.fontSize(13).font("Helvetica-Bold");
  doc.text(company?.name || company?.restaurant_name || "Nume firmă", { align: "left" });
  doc.fontSize(9).font("Helvetica");
  if (company?.address || company?.restaurant_address) {
    doc.text(company.address || company.restaurant_address);
  }
  const extra = [];
  if (company?.cui || company?.restaurant_cui || company?.tax_id) {
    extra.push(`CUI: ${company.cui || company.restaurant_cui || company.tax_id}`);
  }
  if (company?.regcom || company?.registration_number) {
    extra.push(`Reg. Com: ${company.regcom || company.registration_number}`);
  }
  if (extra.length) doc.text(extra.join(" | "));
  doc.moveDown(0.5);

  doc.fontSize(14).font("Helvetica-Bold");
  doc.text(title, { align: "center", underline: true });
  doc.moveDown();
}

async function getCompany(tenantId) {
  try {
    const db = await dbPromise;
    
    // Încearcă din app_settings
    return new Promise((resolve) => {
      db.get(
        `SELECT value FROM app_settings WHERE key = ? LIMIT 1`,
        ['restaurant_config'],
        (err, row) => {
          if (err || !row) {
            // Fallback la restaurant.json
            try {
              const configPath = path.join(__dirname, '../config/restaurant.json');
              if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                resolve({
                  name: config.basic_info?.name || 'Restaurant',
                  address: config.regional?.address || '',
                  cui: config.regional?.tax_id || config.regional?.fiscal_code || '',
                  regcom: config.regional?.registration_number || '',
                });
              } else {
                resolve({ name: 'Restaurant', address: '', cui: '', regcom: '' });
              }
            } catch (e) {
              resolve({ name: 'Restaurant', address: '', cui: '', regcom: '' });
            }
          } else {
            try {
              const config = JSON.parse(row.value);
              resolve({
                name: config.restaurant_name || 'Restaurant',
                address: config.restaurant_address || '',
                cui: config.restaurant_cui || config.tax_id || '',
                regcom: config.registration_number || '',
              });
            } catch (e) {
              resolve({ name: 'Restaurant', address: '', cui: '', regcom: '' });
            }
          }
        }
      );
    });
  } catch (error) {
    console.error('Eroare la obținerea datelor companiei:', error);
    return { name: 'Restaurant', address: '', cui: '', regcom: '' };
  }
}

// ===== NIR =====

async function generateNirPdf(tenantId, nirId, res) {
  try {
    const db = await dbPromise;
    
    const nir = await new Promise((resolve, reject) => {
      db.get(
        `SELECT nh.*, 
                COALESCE(s.company_name, s.name) AS supplier_name, 
                s.vat_code AS supplier_cui,
                ml.name AS location_name
         FROM nir_headers nh
         LEFT JOIN suppliers s ON s.id = nh.supplier_id
         LEFT JOIN management_locations ml ON ml.id = nh.location_id
         WHERE nh.id = ?`,
        [nirId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!nir) {
      res.status(404).json({ error: "NIR inexistent" });
      return;
    }

    const lines = await new Promise((resolve, reject) => {
      db.all(
        `SELECT nl.*, i.name AS item_name, i.unit
         FROM nir_lines nl
         LEFT JOIN ingredients i ON i.id = nl.ingredient_id
         WHERE nl.nir_id = ?
         ORDER BY nl.id ASC`,
        [nirId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const company = await getCompany(tenantId);

    sendPdfResponse(res, `NIR_${nir.document_number || nir.id}.pdf`, (doc) => {
      drawCompanyHeader(doc, company, "NOTĂ DE RECEPȚIE (NIR)");

      doc.fontSize(9).font("Helvetica");
      doc.text(`Număr: ${nir.document_number || nir.id}`);
      doc.text(`Data: ${nir.document_date || nir.created_at?.substring(0, 10)}`);
      if (nir.location_name) doc.text(`Gestiune: ${nir.location_name}`);
      doc.moveDown(0.3);
      doc.text(`Furnizor: ${nir.supplier_name || ""}`);
      if (nir.supplier_cui) doc.text(`CUI furnizor: ${nir.supplier_cui}`);
      if (nir.notes) doc.text(`Observații: ${nir.notes}`);
      doc.moveDown();

      const startX = doc.x;
      let y = doc.y;
      const headers = [
        "Nr.",
        "Denumire produs",
        "UM",
        "Cant.",
        "Preț",
        "Valoare",
        "TVA %",
        "Valoare TVA",
      ];
      const colWidths = [22, 160, 30, 45, 60, 65, 45, 70];

      doc.font("Helvetica-Bold");
      headers.forEach((h, idx) => {
        const x = startX + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
        doc.text(h, x, y, {
          width: colWidths[idx],
          align: idx === 1 ? "left" : "right",
        });
      });
      doc.moveDown(0.8);
      y = doc.y;
      doc.font("Helvetica");

      let totalBase = 0;
      let totalVat = 0;

      lines.forEach((ln, index) => {
        const base = (ln.quantity || 0) * (ln.unit_price || 0);
        const vat = base * ((ln.tva_percent || 0) / 100);
        totalBase += base;
        totalVat += vat;

        const vals = [
          index + 1,
          ln.item_name || ln.description || "",
          ln.unit || "buc",
          (ln.quantity || 0).toFixed(3),
          (ln.unit_price || 0).toFixed(4),
          base.toFixed(2),
          (ln.tva_percent || 0).toFixed(2),
          vat.toFixed(2),
        ];

        vals.forEach((v, i) => {
          const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc.text(v.toString(), x, y, {
            width: colWidths[i],
            align: i === 1 ? "left" : "right",
          });
        });

        doc.moveDown(0.4);
        y = doc.y;
        if (y > 750) {
          doc.addPage();
          y = doc.y;
        }
      });

      doc.moveDown();
      doc.font("Helvetica-Bold");
      doc.text(`Total bază: ${totalBase.toFixed(2)} lei`, { align: "right" });
      doc.text(`Total TVA: ${totalVat.toFixed(2)} lei`, { align: "right" });
      doc.text(
        `Total general: ${(totalBase + totalVat).toFixed(2)} lei`,
        { align: "right" }
      );

      doc.moveDown(2);
      doc.font("Helvetica").fontSize(9);
      doc.text("Întocmit: ____________________", { continued: true });
      doc.text("      Gestionar: ____________________", {
        align: "left",
      });
      doc.text("Responsabil recepție: ____________________");
    });
  } catch (error) {
    console.error('❌ Eroare la generarea PDF NIR:', error);
    res.status(500).json({ error: 'Eroare la generarea PDF NIR' });
  }
}

// ===== Bon Consum =====

async function generateBonConsumPdf(tenantId, consumptionId, res) {
  try {
    const db = await dbPromise;
    
    const bon = await new Promise((resolve, reject) => {
      db.get(
        `SELECT c.*
         FROM consumption_notes c
         WHERE c.id = ?`,
        [consumptionId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!bon) {
      res.status(404).json({ error: "Bon consum inexistent" });
      return;
    }

    const lines = await new Promise((resolve, reject) => {
      db.all(
        `SELECT cl.*, i.name AS ingredient_name, i.unit
         FROM consumption_lines cl
         LEFT JOIN ingredients i ON i.id = cl.ingredient_id
         WHERE cl.consumption_id = ?
         ORDER BY cl.id ASC`,
        [consumptionId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const company = await getCompany(tenantId);

    sendPdfResponse(res, `BonConsum_${bon.document_number || bon.id}.pdf`, (doc) => {
      drawCompanyHeader(doc, company, "BON DE CONSUM");

      doc.fontSize(9).font("Helvetica");
      doc.text(`Număr: ${bon.document_number || bon.id}`);
      doc.text(`Data: ${bon.date || bon.created_at?.substring(0, 10)}`);
      if (bon.source) doc.text(`Sursă: ${bon.source}`);
      if (bon.destination) doc.text(`Destinație: ${bon.destination}`);
      if (bon.notes) doc.text(`Observații: ${bon.notes}`);
      doc.moveDown();

      const startX = doc.x;
      let y = doc.y;
      const headers = [
        "Nr.",
        "Denumire",
        "UM",
        "Cant.",
        "Cost unitar",
        "Valoare",
      ];
      const colWidths = [22, 190, 30, 55, 70, 80];

      doc.font("Helvetica-Bold");
      headers.forEach((h, idx) => {
        const x = startX + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
        doc.text(h, x, y, {
          width: colWidths[idx],
          align: idx === 1 ? "left" : "right",
        });
      });
      doc.moveDown(0.8);
      y = doc.y;
      doc.font("Helvetica");

      let total = 0;

      lines.forEach((ln, i) => {
        const lineVal = (ln.quantity || 0) * (ln.unit_price || 0);
        total += lineVal;

        const vals = [
          i + 1,
          ln.ingredient_name || "",
          ln.unit || "buc",
          (ln.quantity || 0).toFixed(3),
          (ln.unit_price || 0).toFixed(4),
          lineVal.toFixed(2),
        ];

        vals.forEach((v, idx) => {
          const x = startX + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
          doc.text(v.toString(), x, y, {
            width: colWidths[idx],
            align: idx === 1 ? "left" : "right",
          });
        });

        doc.moveDown(0.4);
        y = doc.y;
        if (y > 750) {
          doc.addPage();
          y = doc.y;
        }
      });

      doc.moveDown();
      doc.font("Helvetica-Bold");
      doc.text(`Total: ${total.toFixed(2)} lei`, { align: "right" });

      doc.moveDown(2);
      doc.font("Helvetica").fontSize(9);
      doc.text("Întocmit: ____________________", { continued: true });
      doc.text("      Aprobat: ____________________");
      doc.text("Gestionar: ____________________");
    });
  } catch (error) {
    console.error('❌ Eroare la generarea PDF Bon Consum:', error);
    res.status(500).json({ error: 'Eroare la generarea PDF Bon Consum' });
  }
}

// ===== Aviz =====

async function generateAvizPdf(tenantId, avizId, res) {
  try {
    const db = await dbPromise;
    
    // TODO: Adaptează la structura reală a tabelelor pentru avize
    // Presupunem că există o tabelă delivery_notes sau similar
    res.status(501).json({ error: "Aviz PDF not implemented yet - needs table structure" });
  } catch (error) {
    console.error('❌ Eroare la generarea PDF Aviz:', error);
    res.status(500).json({ error: 'Eroare la generarea PDF Aviz' });
  }
}

// ===== Chitanță =====

async function generateChitantaPdf(tenantId, chitantaId, res) {
  try {
    const db = await dbPromise;
    
    // Obține chitanța din tipizate_documents
    const chitanta = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM tipizate_documents 
         WHERE id = ? AND type = 'CHITANTA'`,
        [chitantaId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!chitanta) {
      res.status(404).json({ error: "Chitanță inexistentă" });
      return;
    }

    // Parse JSON fields
    const fiscalHeader = chitanta.fiscal_header ? JSON.parse(chitanta.fiscal_header) : {};
    const lines = chitanta.lines ? JSON.parse(chitanta.lines) : [];
    const totals = chitanta.totals ? JSON.parse(chitanta.totals) : {};
    const documentData = chitanta.document_data ? JSON.parse(chitanta.document_data) : {};

    const company = await getCompany(tenantId);

    // Import numberToWords helper (Node.js compatible)
    const { numberToWords } = require('../src/modules/tipizate/utils/numberToWords');

    sendPdfResponse(res, `Chitanta_${chitanta.series || ''}_${chitanta.number || chitanta.id}.pdf`, (doc) => {
      drawCompanyHeader(doc, company, "CHITANȚĂ");

      doc.fontSize(9).font("Helvetica");
      doc.text(`Serie: ${chitanta.series || ''}`);
      doc.text(`Număr: ${chitanta.number || chitanta.id}`);
      doc.text(`Data: ${chitanta.date || chitanta.created_at?.substring(0, 10)}`);
      doc.moveDown(0.3);

      // Date fiscale emitent
      if (fiscalHeader.companyName || company.name) {
        doc.text(`Emitent: ${fiscalHeader.companyName || company.name}`);
      }
      if (fiscalHeader.companyCUI || company.cui) {
        doc.text(`CUI: ${fiscalHeader.companyCUI || company.cui}`);
      }
      if (fiscalHeader.companyAddress || company.address) {
        doc.text(`Adresă: ${fiscalHeader.companyAddress || company.address}`);
      }
      doc.moveDown(0.3);

      // Beneficiar (dacă există)
      if (documentData.clientName) {
        doc.font("Helvetica-Bold");
        doc.text("PRIMIT DE:");
        doc.font("Helvetica");
        doc.text(`Nume: ${documentData.clientName}`);
        if (documentData.clientCUI) doc.text(`CUI: ${documentData.clientCUI}`);
        if (documentData.clientAddress) doc.text(`Adresă: ${documentData.clientAddress}`);
        doc.moveDown(0.3);
      }

      // Suma primită (numeric)
      doc.moveDown();
      doc.fontSize(12).font("Helvetica-Bold");
      const totalAmount = totals.total || 0;
      doc.text(`Suma primită: ${totalAmount.toFixed(2)} RON`, { align: "center" });
      doc.moveDown();

      // Suma în litere (OBLIGATORIU LEGAL)
      doc.fontSize(10).font("Helvetica");
      const amountInWords = documentData.amountInWords || numberToWords(totalAmount);
      doc.text(`Scris cu litere: ${amountInWords}`, { align: "center" });
      doc.moveDown(2);

      // Semnături
      doc.fontSize(9).font("Helvetica");
      doc.text("Primit de:", 50, doc.y);
      doc.text("___________________", 50, doc.y + 20);
      doc.text("Emis de:", 350, doc.y - 20);
      doc.text("___________________", 350, doc.y);
    });
  } catch (error) {
    console.error('❌ Eroare la generarea PDF Chitanță:', error);
    res.status(500).json({ error: 'Eroare la generarea PDF Chitanță', details: error.message });
  }
}

// ===== Registru de casă (interval dată) =====

async function generateRegistruCasaPdf(tenantId, fromDate, toDate, res) {
  try {
    const db = await dbPromise;
    
    const rows = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM cash_register
         WHERE transaction_date >= ? AND transaction_date <= ?
         ORDER BY transaction_date, id`,
        [fromDate, toDate],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const company = await getCompany(tenantId);

    sendPdfResponse(
      res,
      `RegistruCasa_${fromDate}_${toDate}.pdf`,
      (doc) => {
        drawCompanyHeader(doc, company, "REGISTRU DE CASĂ");

        doc.fontSize(9).font("Helvetica");
        doc.text(`Perioada: ${fromDate} - ${toDate}`);
        doc.moveDown();

        const startX = doc.x;
        let y = doc.y;
        const headers = [
          "Nr.",
          "Data",
          "Explicație",
          "Încasări",
          "Plăți",
          "Sold",
        ];
        const colWidths = [22, 60, 200, 60, 60, 60];

        doc.font("Helvetica-Bold");
        headers.forEach((h, idx) => {
          const x = startX + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
          doc.text(h, x, y, {
            width: colWidths[idx],
            align: idx === 2 ? "left" : "right",
          });
        });
        doc.moveDown(0.8);
        y = doc.y;
        doc.font("Helvetica");

        let sold = 0;
        rows.forEach((r, i) => {
          const inc = r.type === 'entry' ? (r.amount || 0) : 0;
          const out = r.type === 'exit' ? (r.amount || 0) : 0;
          sold += inc - out;

          const vals = [
            i + 1,
            r.transaction_date?.substring(0, 10) || '',
            r.description || "",
            inc ? inc.toFixed(2) : "",
            out ? out.toFixed(2) : "",
            sold.toFixed(2),
          ];

          vals.forEach((v, idx) => {
            const x = startX + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
            doc.text(v.toString(), x, y, {
              width: colWidths[idx],
              align: idx === 2 ? "left" : "right",
            });
          });

          doc.moveDown(0.4);
          y = doc.y;
          if (y > 750) {
            doc.addPage();
            y = doc.y;
          }
        });

        doc.moveDown(2);
        doc.text("Casier: ____________________", { align: "right" });
      }
    );
  } catch (error) {
    console.error('❌ Eroare la generarea PDF Registru Casă:', error);
    res.status(500).json({ error: 'Eroare la generarea PDF Registru Casă' });
  }
}

// ===== Fișă magazie (pe ingredient + gestiune) =====

async function generateFisaMagaziePdf(tenantId, ingredientId, locationId, res) {
  try {
    const db = await dbPromise;
    
    const ing = await new Promise((resolve, reject) => {
      db.get(
        `SELECT name, unit FROM ingredients WHERE id = ?`,
        [ingredientId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!ing) {
      res.status(404).json({ error: "Ingredient inexistent" });
      return;
    }

    const loc = await new Promise((resolve, reject) => {
      db.get(
        `SELECT name FROM management_locations WHERE id = ?`,
        [locationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const moves = await new Promise((resolve, reject) => {
      db.all(
        `SELECT date, reference_type, reference_id,
                quantity_in, quantity_out, move_reason
         FROM stock_moves
         WHERE tenant_id = ?
           AND ingredient_id = ?
           AND location_id = ?
         ORDER BY date, id`,
        [tenantId, ingredientId, locationId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const company = await getCompany(tenantId);

    sendPdfResponse(
      res,
      `FisaMagazie_${ingredientId}_${locationId}.pdf`,
      (doc) => {
        drawCompanyHeader(doc, company, "FIȘĂ DE MAGAZIE");

        doc.fontSize(9).font("Helvetica");
        doc.text(`Articol: ${ing.name}`);
        doc.text(`UM: ${ing.unit || "buc"}`);
        if (loc) doc.text(`Gestiune: ${loc.name}`);
        doc.moveDown();

        const startX = doc.x;
        let y = doc.y;
        const headers = [
          "Data",
          "Doc",
          "Intrări",
          "Ieșiri",
          "Stoc",
          "Motiv",
        ];
        const colWidths = [60, 80, 60, 60, 60, 100];

        doc.font("Helvetica-Bold");
        headers.forEach((h, idx) => {
          const x = startX + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
          doc.text(h, x, y, {
            width: colWidths[idx],
            align: idx === 5 ? "left" : "right",
          });
        });
        doc.moveDown(0.8);
        y = doc.y;
        doc.font("Helvetica");

        let stoc = 0;
        moves.forEach((m) => {
          stoc += (m.quantity_in || 0) - (m.quantity_out || 0);
          const docCode = `${m.reference_type || ""} #${m.reference_id || ""}`;
          const vals = [
            m.date?.substring(0, 10) || '',
            docCode,
            m.quantity_in ? m.quantity_in.toFixed(3) : "",
            m.quantity_out ? m.quantity_out.toFixed(3) : "",
            stoc.toFixed(3),
            m.move_reason || "",
          ];

          vals.forEach((v, idx) => {
            const x = startX + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
            doc.text(v.toString(), x, y, {
              width: colWidths[idx],
              align: idx === 5 ? "left" : "right",
            });
          });

          doc.moveDown(0.4);
          y = doc.y;
          if (y > 750) {
            doc.addPage();
            y = doc.y;
          }
        });
      }
    );
  } catch (error) {
    console.error('❌ Eroare la generarea PDF Fișă Magazie:', error);
    res.status(500).json({ error: 'Eroare la generarea PDF Fișă Magazie' });
  }
}

// ===== Raport gestiune (pe gestiune + interval) =====

async function generateRaportGestiunePdf(tenantId, locationId, fromDate, toDate, res) {
  try {
    const db = await dbPromise;
    
    const loc = await new Promise((resolve, reject) => {
      db.get(
        `SELECT name FROM management_locations WHERE id = ?`,
        [locationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const rows = await new Promise((resolve, reject) => {
      db.all(
        `SELECT i.id AS ingredient_id, i.name AS ingredient_name, i.unit,
                SUM(sm.quantity_in) AS total_in,
                SUM(sm.quantity_out) AS total_out
         FROM stock_moves sm
         JOIN ingredients i ON i.id = sm.ingredient_id
         WHERE sm.tenant_id = ?
           AND sm.location_id = ?
           AND sm.date >= ? AND sm.date <= ?
         GROUP BY i.id
         ORDER BY i.name`,
        [tenantId, locationId, fromDate, toDate],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const company = await getCompany(tenantId);

    sendPdfResponse(
      res,
      `RaportGestiune_${locationId}_${fromDate}_${toDate}.pdf`,
      (doc) => {
        drawCompanyHeader(doc, company, "RAPORT DE GESTIUNE");

        doc.fontSize(9).font("Helvetica");
        doc.text(`Gestiune: ${loc?.name || locationId}`);
        doc.text(`Perioada: ${fromDate} - ${toDate}`);
        doc.moveDown();

        const startX = doc.x;
        let y = doc.y;
        const headers = [
          "Articol",
          "UM",
          "Intrări",
          "Ieșiri",
          "Sold (teoretic)",
        ];
        const colWidths = [200, 35, 70, 70, 80];

        doc.font("Helvetica-Bold");
        headers.forEach((h, idx) => {
          const x = startX + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
          doc.text(h, x, y, {
            width: colWidths[idx],
            align: idx === 0 ? "left" : "right",
          });
        });
        doc.moveDown(0.8);
        y = doc.y;
        doc.font("Helvetica");

        rows.forEach((r) => {
          const sold = (r.total_in || 0) - (r.total_out || 0);
          const vals = [
            r.ingredient_name,
            r.unit || "buc",
            (r.total_in || 0).toFixed(3),
            (r.total_out || 0).toFixed(3),
            sold.toFixed(3),
          ];

          vals.forEach((v, idx) => {
            const x = startX + colWidths.slice(0, idx).reduce((a, b) => a + b, 0);
            doc.text(v.toString(), x, y, {
              width: colWidths[idx],
              align: idx === 0 ? "left" : "right",
            });
          });

          doc.moveDown(0.4);
          y = doc.y;
          if (y > 750) {
            doc.addPage();
            y = doc.y;
          }
        });
      }
    );
  } catch (error) {
    console.error('❌ Eroare la generarea PDF Raport Gestiune:', error);
    res.status(500).json({ error: 'Eroare la generarea PDF Raport Gestiune' });
  }
}

// ===== Skeleton pentru restul tipizatelor =====

async function generateTransferPdf(tenantId, transferId, res) {
  // TODO: citește din transfer_headers + transfer_lines + locations și desenează layout
  res.status(501).json({ error: "Transfer PDF not implemented yet" });
}

async function generateRestituirePdf(tenantId, restId, res) {
  res.status(501).json({ error: "Restituire PDF not implemented yet" });
}

async function generateProcesVerbalPdf(tenantId, pvId, res) {
  res.status(501).json({ error: "Proces verbal PDF not implemented yet" });
}

async function generateOpPdf(tenantId, opId, res) {
  res.status(501).json({ error: "OP PDF not implemented yet" });
}

async function generateBorderouPdf(tenantId, borderouId, res) {
  res.status(501).json({ error: "Borderou PDF not implemented yet" });
}

async function generateComandaFurnizorPdf(tenantId, cmdId, res) {
  res.status(501).json({ error: "Comandă furnizor PDF not implemented yet" });
}

async function generateInventarPdf(tenantId, inventoryId, res) {
  // TODO: citește din inventory_headers + inventory_lines și desenează layout
  res.status(501).json({ error: "Inventar PDF not implemented yet" });
}

// ===== Production Batch (Fișă de fabricație) =====

async function generateProductionBatchPdf(tenantId, batchId, res) {
  try {
    const db = await dbPromise;
    
    const batch = await new Promise((resolve, reject) => {
      db.get(
        `SELECT pb.*,
                ml.name AS location_name
         FROM production_batches pb
         LEFT JOIN management_locations ml ON ml.id = pb.location_id
         WHERE pb.tenant_id = ? AND pb.id = ?`,
        [tenantId, batchId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!batch) {
      res.status(404).json({ error: "Production batch inexistent" });
      return;
    }

    const ingredients = await new Promise((resolve, reject) => {
      db.all(
        `SELECT pbi.*, i.name AS ingredient_name, i.unit AS ingredient_unit
         FROM production_batch_items pbi
         LEFT JOIN ingredients i ON i.id = pbi.ingredient_id
         WHERE pbi.batch_id = ?
         ORDER BY pbi.id ASC`,
        [batchId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const results = await new Promise((resolve, reject) => {
      db.all(
        `SELECT pbr.*, m.name AS product_name, m.unit AS product_unit
         FROM production_batch_results pbr
         LEFT JOIN menu m ON m.id = pbr.product_id
         WHERE pbr.batch_id = ?
         ORDER BY pbr.id ASC`,
        [batchId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const company = await getCompany(tenantId);
    const filename = `ProductionBatch_${batch.batch_number || batch.id}.pdf`;

    sendPdfResponse(res, filename, (doc) => {
      drawCompanyHeader(doc, company, "FIȘĂ DE FABRICAȚIE / PRODUCTION BATCH");

      doc.fontSize(9).font("Helvetica");
      doc.text(`Batch #: ${batch.batch_number || batch.id}`);
      doc.text(`Data: ${batch.batch_date || batch.created_at?.substring(0, 10)}`);
      if (batch.location_name) doc.text(`Gestiune: ${batch.location_name}`);
      if (batch.recipe_name) {
        doc.text(`Rețetă: ${batch.recipe_name}`);
      }
      if (batch.responsible) {
        doc.text(`Responsabil: ${batch.responsible}`);
      }
      doc.text(
        `Status: ${batch.status === "completed" ? "FINALIZAT" : batch.status === "in_progress" ? "ÎN PROGRES" : "DRAFT (nefinalizat)"}`
      );
      doc.moveDown();

      // ---- Secțiunea 1: Ingredientele consumate ----
      doc.font("Helvetica-Bold");
      doc.text("1. Ingredientele consumate", { underline: true });
      doc.moveDown(0.4);

      const startX = doc.x;
      let y = doc.y;
      const ingCols = [
        "Nr.",
        "Ingredient",
        "UM",
        "Cant. planificată",
        "Cant. folosită",
        "Cost unitar",
        "Valoare",
      ];
      const ingWidths = [22, 140, 30, 70, 70, 60, 70];

      doc.font("Helvetica-Bold");
      ingCols.forEach((h, idx) => {
        const x = startX + ingWidths.slice(0, idx).reduce((a, b) => a + b, 0);
        doc.text(h, x, y, {
          width: ingWidths[idx],
          align: idx === 1 ? "left" : "right",
        });
      });
      doc.moveDown(0.8);
      y = doc.y;
      doc.font("Helvetica");

      let totalCostIngredients = 0;
      ingredients.forEach((ln, i) => {
        const qtyUsed = Number(ln.quantity_used || 0);
        const costUnit = Number(ln.cost_per_unit || 0);
        const lineVal = Number(ln.total_cost || 0) || (qtyUsed * costUnit);
        totalCostIngredients += lineVal;

        const vals = [
          i + 1,
          ln.ingredient_name || "",
          ln.ingredient_unit || "buc",
          (ln.quantity_planned || 0).toFixed(3),
          qtyUsed.toFixed(3),
          costUnit.toFixed(4),
          lineVal.toFixed(2),
        ];

        vals.forEach((v, idx) => {
          const x = startX + ingWidths.slice(0, idx).reduce((a, b) => a + b, 0);
          doc.text(v.toString(), x, y, {
            width: ingWidths[idx],
            align: idx === 1 ? "left" : "right",
          });
        });

        doc.moveDown(0.4);
        y = doc.y;
        if (y > 750) {
          doc.addPage();
          y = doc.y;
        }
      });

      doc.moveDown();
      doc.font("Helvetica-Bold");
      doc.text(
        `Cost total materii prime: ${totalCostIngredients.toFixed(2)} lei`,
        { align: "right" }
      );
      doc.moveDown(1);

      // ---- Secțiunea 2: Produsele obținute ----
      doc.font("Helvetica-Bold");
      doc.text("2. Produsele obținute", { underline: true });
      doc.moveDown(0.4);

      const resStartX = doc.x;
      y = doc.y;
      const resCols = ["Nr.", "Produs", "UM", "Cantitate", "Cost unitar", "Cost total"];
      const resWidths = [22, 150, 35, 70, 80, 80];

      doc.font("Helvetica-Bold");
      resCols.forEach((h, idx) => {
        const x = resStartX + resWidths.slice(0, idx).reduce((a, b) => a + b, 0);
        doc.text(h, x, y, {
          width: resWidths[idx],
          align: idx === 1 ? "left" : "right",
        });
      });
      doc.moveDown(0.8);
      y = doc.y;
      doc.font("Helvetica");

      let totalQtyProduced = 0;
      let totalCostResults = 0;
      results.forEach((ln, i) => {
        const qty = Number(ln.quantity_produced || 0);
        const costUnit = Number(ln.cost_per_unit || 0);
        const costTotal = Number(ln.total_cost || 0) || (qty * costUnit);
        totalQtyProduced += qty;
        totalCostResults += costTotal;

        const vals = [
          i + 1,
          ln.product_name || "",
          ln.product_unit || "buc",
          qty.toFixed(3),
          costUnit.toFixed(4),
          costTotal.toFixed(2),
        ];

        vals.forEach((v, idx) => {
          const x = resStartX + resWidths.slice(0, idx).reduce((a, b) => a + b, 0);
          doc.text(v.toString(), x, y, {
            width: resWidths[idx],
            align: idx === 1 ? "left" : "right",
          });
        });

        doc.moveDown(0.4);
        y = doc.y;
        if (y > 750) {
          doc.addPage();
          y = doc.y;
        }
      });

      doc.moveDown();
      if (totalQtyProduced > 0 && totalCostIngredients > 0) {
        const unitCost = totalCostIngredients / totalQtyProduced;
        doc.font("Helvetica-Bold");
        doc.text(
          `Cost unitar rezultat (mediu): ${unitCost.toFixed(4)} lei / unitate`,
          { align: "right" }
        );
      }

      doc.moveDown(2);
      doc.font("Helvetica").fontSize(9);
      doc.text("Întocmit: ____________________", { continued: true });
      doc.text("      Șef producție: ____________________");
      doc.text("Gestionar: ____________________");
    });
  } catch (error) {
    console.error('❌ Eroare la generarea PDF Production Batch:', error);
    res.status(500).json({ error: 'Eroare la generarea PDF Production Batch' });
  }
}

module.exports = {
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
};

