'use strict';

/**
 * HORECA AI Engine - Controller
 */

const AIService = require('../../../services/AIService');
const { dbPromise } = require('../../../database');

async function ingest(req, res) {
  try {
    const text = req.body.text || (req.file ? req.file.buffer.toString('utf8') : '');
    if (!text) return res.json({ ok: false, error: 'No text or file provided' });

    const products = await AIService.extractProducts(text);
    return res.json({ ok: true, data: { products, count: products.length } });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
}

async function extractProducts(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.json({ ok: false, error: 'text is required' });

    const products = await AIService.extractProducts(text);
    return res.json({ ok: true, data: products });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
}

async function detectAllergens(req, res) {
  try {
    const { ingredients, product_id } = req.body;
    if (!ingredients) return res.json({ ok: false, error: 'ingredients is required' });

    const allergens = await AIService.detectAllergens(ingredients);

    // Log to DB if product_id provided (best-effort)
    if (product_id) {
      try {
        const db = await dbPromise;
        await db.run(
          `INSERT INTO allergen_detection_log (product_id, detected_allergens, confidence) VALUES (?, ?, ?)`,
          [product_id, JSON.stringify(allergens), 0.9]
        );
      } catch (_) { /* table may not exist yet, non-fatal */ }
    }

    return res.json({ ok: true, data: { allergens, eu14: AIService.EU14_ALLERGENS } });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
}

async function suggestPrice(req, res) {
  try {
    const product = req.body;
    if (!product || Object.keys(product).length === 0) {
      return res.json({ ok: false, error: 'product data is required' });
    }
    const result = await AIService.suggestPrice(product);
    return res.json({ ok: true, data: result });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
}

async function audit(req, res) {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.json({ ok: false, error: 'products array is required' });
    }
    const result = await AIService.auditMenu(products);

    // Log audit result (best-effort)
    try {
      const db = await dbPromise;
      await db.run(
        `INSERT INTO ai_audit_log (audit_type, issues_found, health_score) VALUES (?, ?, ?)`,
        ['menu_health', result.issues.length, result.healthScore]
      );
    } catch (_) { /* non-fatal */ }

    return res.json({ ok: true, data: result });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
}

async function repair(req, res) {
  try {
    const { product } = req.body;
    if (!product) return res.json({ ok: false, error: 'product is required' });

    const result = await AIService.repairProduct(product);
    return res.json({ ok: true, data: result });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
}

async function marketPrices(req, res) {
  try {
    const prices = AIService.getMarketPrices();
    return res.json({ ok: true, data: prices });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
}

module.exports = { ingest, extractProducts, detectAllergens, suggestPrice, audit, repair, marketPrices };
