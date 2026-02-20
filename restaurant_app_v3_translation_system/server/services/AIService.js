'use strict';

/**
 * HORECA AI Engine - AIService
 * Supports: Groq (llama-3.3-70b), OpenAI (gpt-4o), Mock (regex-based)
 * Default: mock (no API key required)
 */

// EU 14 mandatory allergens
const EU14_ALLERGENS = [
  'celery', 'cereals_gluten', 'crustaceans', 'eggs', 'fish',
  'lupin', 'milk', 'molluscs', 'mustard', 'nuts',
  'peanuts', 'sesame', 'soybeans', 'sulphites'
];

// Keyword maps for mock allergen detection (EN + RO)
const ALLERGEN_KEYWORDS = {
  milk: ['milk', 'cream', 'butter', 'cheese', 'dairy', 'lactose', 'whey', 'yogurt',
    'lapte', 'smântână', 'smantana', 'unt', 'brânză', 'branza', 'iaurt', 'frișcă', 'frisca'],
  eggs: ['egg', 'eggs', 'mayonnaise', 'mayo',
    'ou', 'ouă', 'oua', 'maioneză', 'maioneza'],
  cereals_gluten: ['flour', 'wheat', 'gluten', 'bread', 'pasta', 'barley', 'rye', 'oat', 'spelt',
    'făină', 'faina', 'grâu', 'grau', 'pâine', 'paine', 'paste', 'ovăz', 'ovaz', 'secară', 'secara'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'anchovy', 'anchov', 'sardine', 'herring',
    'pește', 'peste', 'somon', 'ton', 'sardină', 'sardina'],
  crustaceans: ['shrimp', 'prawn', 'crab', 'lobster', 'crayfish',
    'creveți', 'creveti', 'crab', 'homar', 'langustă', 'langusta'],
  molluscs: ['squid', 'octopus', 'mussel', 'oyster', 'clam', 'scallop', 'snail',
    'calamari', 'caracatiță', 'caracatita', 'midii', 'scoici', 'stridii', 'melc'],
  nuts: ['almond', 'hazelnut', 'walnut', 'cashew', 'pecan', 'pistachio', 'macadamia', 'pine nut',
    'migdale', 'migdale', 'alune', 'nuci', 'caju', 'fistic'],
  peanuts: ['peanut', 'groundnut', 'arachid',
    'arahide', 'alune de pădure', 'alune de padure'],
  sesame: ['sesame', 'tahini',
    'susan', 'tahini'],
  soybeans: ['soy', 'soya', 'tofu', 'edamame', 'miso',
    'soia', 'tofu'],
  celery: ['celery', 'celeriac',
    'țelină', 'telina'],
  mustard: ['mustard',
    'muștar', 'mustar'],
  lupin: ['lupin', 'lupine',
    'lupin', 'lupini'],
  sulphites: ['sulphite', 'sulfite', 'so2', 'wine', 'dried fruit', 'vinegar',
    'sulfit', 'sulfiti', 'vin', 'oțet', 'otet', 'fructe uscate']
};

// Reference market prices (RON/kg or RON/L) for common ingredients
const MARKET_PRICES = {
  chicken: 18, beef: 32, pork: 22, fish: 35, salmon: 65,
  vegetables: 5, potatoes: 3, tomatoes: 6, onions: 3,
  flour: 3, sugar: 5, oil: 8, butter: 28, milk: 6, eggs: 1.5,
  cheese: 35, cream: 20, pasta: 8, rice: 7,
  spices: 50, herbs: 40, salt: 2, pepper: 80
};

function useMock() {
  return process.env.USE_MOCK_AI === 'true' || (process.env.AI_PROVIDER || 'mock') === 'mock';
}

// ──────────────────────────────────────────────
// Mock implementations (regex-based, no API key)
// ──────────────────────────────────────────────

function mockDetectAllergens(ingredients) {
  if (!ingredients || typeof ingredients !== 'string') return [];
  const lower = ingredients.toLowerCase();
  const detected = [];
  for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      detected.push(allergen);
    }
  }
  return detected;
}

function mockSuggestPrice(product) {
  const cost = parseFloat(product.costPrice || product.cost_price || 0);
  if (cost > 0) {
    // Standard HORECA markup: 3x-4x food cost
    const markup = 3.5;
    const suggested = Math.ceil(cost * markup * 2) / 2; // round to nearest 0.5
    return { suggestedPrice: suggested, markup, basis: 'cost_markup' };
  }
  // Market-based fallback
  const base = parseFloat(product.price || 20);
  return { suggestedPrice: base, markup: null, basis: 'market' };
}

function mockExtractProducts(text) {
  if (!text) return [];
  const lines = text.split(/\n|;/).map(l => l.trim()).filter(Boolean);
  const products = [];
  for (const line of lines) {
    // Try to match: "Product name ... price" pattern
    const priceMatch = line.match(/([^\d]+)\s+(\d+(?:[.,]\d+)?)\s*(lei|ron|€|eur)?/i);
    if (priceMatch) {
      products.push({
        name: priceMatch[1].trim(),
        price: parseFloat(priceMatch[2].replace(',', '.')),
        currency: priceMatch[3] || 'RON'
      });
    } else if (line.length > 2) {
      products.push({ name: line, price: null, currency: 'RON' });
    }
  }
  return products;
}

function mockAuditMenu(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return { healthScore: 100, issues: [], totalProducts: 0 };
  }
  const issues = [];
  let deductions = 0;

  for (const p of products) {
    if (!p.allergens && !p.ingredients) {
      issues.push({ productId: p.id, type: 'missing_allergens', severity: 'warning' });
      deductions += 5;
    }
    if (!p.price || p.price <= 0) {
      issues.push({ productId: p.id, type: 'invalid_price', severity: 'error' });
      deductions += 10;
    }
    if (!p.name) {
      issues.push({ productId: p.id, type: 'missing_name', severity: 'error' });
      deductions += 15;
    }
  }

  const healthScore = Math.max(0, 100 - deductions);
  return { healthScore, issues, totalProducts: products.length };
}

function mockRepairProduct(product) {
  const repaired = { ...product };
  const repairs = [];

  // Detect and fill allergens from ingredients
  if (!repaired.allergens && repaired.ingredients) {
    repaired.allergens = mockDetectAllergens(repaired.ingredients).join(',');
    repairs.push('allergens_detected');
  }

  // Default VAT if missing
  if (!repaired.vat_rate && repaired.vat_rate !== 0) {
    repaired.vat_rate = 9; // Romanian food VAT
    repairs.push('vat_set_to_9');
  }

  // Suggest price if missing
  if (!repaired.price || repaired.price <= 0) {
    const suggestion = mockSuggestPrice(repaired);
    repaired.suggestedPrice = suggestion.suggestedPrice;
    repairs.push('price_suggested');
  }

  return { product: repaired, repairs };
}

// ──────────────────────────────────────────────
// Real AI implementation (lazy-loaded)
// ──────────────────────────────────────────────

let groqClient = null;
let openaiClient = null;

async function getGroqClient() {
  if (groqClient) return groqClient;
  const Groq = require('groq-sdk');
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
}

async function getOpenAIClient() {
  if (openaiClient) return openaiClient;
  const OpenAI = require('openai');
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

async function callAI(prompt) {
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  if (provider === 'groq') {
    const client = await getGroqClient();
    const res = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    });
    return res.choices[0].message.content;
  }
  if (provider === 'openai') {
    const client = await getOpenAIClient();
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    });
    return res.choices[0].message.content;
  }
  throw new Error('No real AI provider configured');
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

const AIService = {
  EU14_ALLERGENS,
  MARKET_PRICES,

  async detectAllergens(ingredients) {
    if (useMock()) return mockDetectAllergens(ingredients);
    try {
      const prompt = `You are a food allergen expert. Given these ingredients: "${ingredients}"
List only the EU 14 mandatory allergens present. Reply with a JSON array of allergen keys from: ${EU14_ALLERGENS.join(', ')}.
Reply ONLY with valid JSON array, e.g. ["milk","eggs"]`;
      const raw = await callAI(prompt);
      return JSON.parse(raw.match(/\[.*\]/s)[0]);
    } catch {
      return mockDetectAllergens(ingredients);
    }
  },

  async suggestPrice(product) {
    if (useMock()) return mockSuggestPrice(product);
    try {
      const prompt = `You are a HORECA pricing expert. Given this product: ${JSON.stringify(product)}
Suggest a selling price in RON. Reply ONLY with JSON: {"suggestedPrice": number, "markup": number, "basis": "string"}`;
      const raw = await callAI(prompt);
      return JSON.parse(raw.match(/\{.*\}/s)[0]);
    } catch {
      return mockSuggestPrice(product);
    }
  },

  async extractProducts(text) {
    if (useMock()) return mockExtractProducts(text);
    try {
      const prompt = `Extract all food products and prices from this menu text: "${text}"
Reply ONLY with JSON array: [{"name":"string","price":number,"currency":"string"}]`;
      const raw = await callAI(prompt);
      return JSON.parse(raw.match(/\[.*\]/s)[0]);
    } catch {
      return mockExtractProducts(text);
    }
  },

  async auditMenu(products) {
    if (useMock()) return mockAuditMenu(products);
    try {
      const prompt = `Audit this restaurant menu for HORECA compliance: ${JSON.stringify(products.slice(0, 20))}
Check allergens, pricing, and completeness. Reply ONLY with JSON: {"healthScore":number,"issues":[],"totalProducts":number}`;
      const raw = await callAI(prompt);
      return JSON.parse(raw.match(/\{.*\}/s)[0]);
    } catch {
      return mockAuditMenu(products);
    }
  },

  async repairProduct(product) {
    if (useMock()) return mockRepairProduct(product);
    try {
      const prompt = `Auto-repair this restaurant product for HORECA compliance: ${JSON.stringify(product)}
Fix allergens (detect from ingredients), set VAT to 9% for food, suggest price if missing.
Reply ONLY with JSON: {"product":{...},"repairs":["string"]}`;
      const raw = await callAI(prompt);
      return JSON.parse(raw.match(/\{.*\}/s)[0]);
    } catch {
      return mockRepairProduct(product);
    }
  },

  getMarketPrices() {
    return { ...MARKET_PRICES };
  }
};

module.exports = AIService;
