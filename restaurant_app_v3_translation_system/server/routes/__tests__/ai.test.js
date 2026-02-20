'use strict';

/**
 * HORECA AI Engine - Unit Tests
 * Tests AIService directly (mock mode, no API key needed)
 */

// Ensure mock mode for all tests
process.env.USE_MOCK_AI = 'true';
process.env.AI_PROVIDER = 'mock';

const AIService = require('../../services/AIService');

describe('AIService', () => {
  // 1. AIService loads without errors
  test('AIService loads without errors', () => {
    expect(AIService).toBeDefined();
    expect(typeof AIService.detectAllergens).toBe('function');
    expect(typeof AIService.suggestPrice).toBe('function');
    expect(typeof AIService.extractProducts).toBe('function');
    expect(typeof AIService.auditMenu).toBe('function');
    expect(typeof AIService.repairProduct).toBe('function');
  });

  // 2. Mock allergen detection returns EU14 allergen list structure
  test('EU14_ALLERGENS contains all 14 allergens', () => {
    expect(AIService.EU14_ALLERGENS).toHaveLength(14);
    expect(AIService.EU14_ALLERGENS).toContain('milk');
    expect(AIService.EU14_ALLERGENS).toContain('eggs');
    expect(AIService.EU14_ALLERGENS).toContain('cereals_gluten');
  });

  // 3. Mock price suggestion returns numeric value
  test('suggestPrice returns numeric suggestedPrice', async () => {
    const result = await AIService.suggestPrice({ name: 'Pasta', price: 25 });
    expect(result).toHaveProperty('suggestedPrice');
    expect(typeof result.suggestedPrice).toBe('number');
    expect(result.suggestedPrice).toBeGreaterThan(0);
  });

  // 4. Mock product extraction returns array
  test('extractProducts returns array', async () => {
    const result = await AIService.extractProducts('Pizza Margherita 25 lei\nPasta Carbonara 30 lei');
    expect(Array.isArray(result)).toBe(true);
  });

  // 5. Mock audit returns health score
  test('auditMenu returns healthScore', async () => {
    const result = await AIService.auditMenu([{ id: 1, name: 'Salata', price: 20 }]);
    expect(result).toHaveProperty('healthScore');
    expect(typeof result.healthScore).toBe('number');
  });

  // 6. Allergen detection for Romanian milk/eggs/gluten ingredients
  test('detectAllergens finds milk, eggs, gluten in "lapte, oua, faina"', async () => {
    const allergens = await AIService.detectAllergens('lapte, oua, faina');
    expect(allergens).toContain('milk');
    expect(allergens).toContain('eggs');
    expect(allergens).toContain('cereals_gluten');
  });

  // 7. Allergen detection for safe ingredients returns empty or no major allergens
  test('detectAllergens for "ulei, sare, zahar" returns no major allergens', async () => {
    const allergens = await AIService.detectAllergens('ulei, sare, zahar');
    expect(allergens).not.toContain('milk');
    expect(allergens).not.toContain('eggs');
    expect(allergens).not.toContain('cereals_gluten');
  });

  // 8. Price suggestion with cost uses markup
  test('suggestPrice with costPrice uses cost markup', async () => {
    const result = await AIService.suggestPrice({ name: 'Friptura', costPrice: 10 });
    expect(result.suggestedPrice).toBeGreaterThan(10);
    expect(result.basis).toBe('cost_markup');
    expect(result.markup).toBeGreaterThan(1);
  });

  // 9. Price suggestion without cost uses market-based approach
  test('suggestPrice without costPrice uses market basis', async () => {
    const result = await AIService.suggestPrice({ name: 'Salata', price: 18 });
    expect(result).toHaveProperty('suggestedPrice');
    expect(result.basis).toBe('market');
  });

  // 10. Extract products from text returns array with names
  test('extractProducts parses product names from text', async () => {
    const result = await AIService.extractProducts('Ciorba de burta 22 lei\nMici 18 lei');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('name');
  });

  // 11. Audit of empty products returns 100 health score
  test('auditMenu with empty array returns healthScore 100', async () => {
    const result = await AIService.auditMenu([]);
    expect(result.healthScore).toBe(100);
    expect(result.totalProducts).toBe(0);
    expect(result.issues).toHaveLength(0);
  });

  // 12. Audit of products missing allergens returns lower score
  test('auditMenu with products missing allergens returns score < 100', async () => {
    const products = [
      { id: 1, name: 'Pizza', price: 30 },
      { id: 2, name: 'Pasta', price: 25 }
    ];
    const result = await AIService.auditMenu(products);
    expect(result.healthScore).toBeLessThan(100);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  // 13. Repair product adds missing allergens from ingredients
  test('repairProduct adds allergens from ingredients', async () => {
    const product = { id: 1, name: 'Omleta', ingredients: 'oua, lapte, unt' };
    const result = await AIService.repairProduct(product);
    expect(result).toHaveProperty('product');
    expect(result).toHaveProperty('repairs');
    expect(result.product.allergens).toBeTruthy();
    expect(result.repairs).toContain('allergens_detected');
  });

  // 14. Market prices returns object with ingredient prices
  test('getMarketPrices returns object with ingredient reference prices', () => {
    const prices = AIService.getMarketPrices();
    expect(typeof prices).toBe('object');
    expect(prices).toHaveProperty('chicken');
    expect(prices).toHaveProperty('milk');
    expect(typeof prices.chicken).toBe('number');
  });

  // 15. AIService handles errors gracefully (mock mode never throws)
  test('detectAllergens handles null input gracefully', async () => {
    const result = await AIService.detectAllergens(null);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  // 16. Repair product sets VAT if missing
  test('repairProduct sets default VAT when missing', async () => {
    const product = { id: 2, name: 'Supa', price: 15 };
    const result = await AIService.repairProduct(product);
    expect(result.product.vat_rate).toBe(9);
    expect(result.repairs).toContain('vat_set_to_9');
  });

  // 17. extractProducts handles empty string
  test('extractProducts handles empty string', async () => {
    const result = await AIService.extractProducts('');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});
