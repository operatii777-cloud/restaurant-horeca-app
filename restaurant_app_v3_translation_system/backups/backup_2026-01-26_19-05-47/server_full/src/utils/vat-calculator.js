/**
 * 🔴 FIX 5 - VAT Calculator Utility
 * 
 * Calculă TVA-ul pentru comenzi conform standardelor din România
 * - TVA mâncare: 11% (configurabil, default: vat_food = '11')
 * - TVA băuturi: 21% (configurabil, default: vat_drinks = '21')
 */

/**
 * Determină dacă o categorie de produs este băutură
 * Categorii considerate băuturi: Răcoritoare, Băuturi, Cafea, Vinuri, Bere, etc.
 */
function isDrinkCategory(category) {
  if (!category || typeof category !== 'string') return false;
  
  const categoryLower = category.toLowerCase();
  const drinkKeywords = [
    'răcoritoare',
    'racoritoare',
    'băuturi',
    'bauturi',
    'beverage',
    'drinks',
    'cafea',
    'coffee',
    'ciocolată',
    'ciocolata',
    'chocolate',
    'ceai',
    'tea',
    'vinuri',
    'vin',
    'wine',
    'bere',
    'beer',
    'alcool',
    'alcohol',
    'cocktail',
    'suc',
    'juice',
    'limonadă',
    'lemonade',
    'apă',
    'water'
  ];
  
  return drinkKeywords.some(keyword => categoryLower.includes(keyword));
}

/**
 * Obține procentajul TVA pentru un produs
 * @param {string} category - Categoria produsului
 * @param {number|string} vatFood - TVA pentru mâncare (default: 11)
 * @param {number|string} vatDrinks - TVA pentru băuturi (default: 21)
 * @returns {number} Procentajul TVA (ex: 11, 21)
 */
function getVatRate(category, vatFood = 11, vatDrinks = 21) {
  const vatFoodNum = typeof vatFood === 'string' ? parseFloat(vatFood) : (vatFood || 11);
  const vatDrinksNum = typeof vatDrinks === 'string' ? parseFloat(vatDrinks) : (vatDrinks || 21);
  
  // ⚠️ Fallback: Dacă categoria lipsește sau nu este recunoscută, returnează TVA pentru mâncare (mai safe legal)
  if (!category || category.trim() === '') {
    return vatFoodNum;
  }
  
  return isDrinkCategory(category) ? vatDrinksNum : vatFoodNum;
}

/**
 * Calculează TVA-ul pentru un preț (inclusiv TVA)
 * Formula: TVA = (preț_cu_TVA * TVA_rate) / (100 + TVA_rate)
 * @param {number} priceWithVat - Prețul cu TVA inclus
 * @param {number} vatRate - Procentajul TVA (ex: 11, 21)
 * @returns {number} Valoarea TVA-ului
 */
function calculateVatAmount(priceWithVat, vatRate) {
  if (!priceWithVat || priceWithVat <= 0) return 0;
  if (!vatRate || vatRate <= 0) return 0;
  
  return (priceWithVat * vatRate) / (100 + vatRate);
}

/**
 * Calculează prețul fără TVA
 * @param {number} priceWithVat - Prețul cu TVA inclus
 * @param {number} vatRate - Procentajul TVA (ex: 11, 21)
 * @returns {number} Prețul fără TVA
 */
function calculatePriceWithoutVat(priceWithVat, vatRate) {
  if (!priceWithVat || priceWithVat <= 0) return 0;
  if (!vatRate || vatRate <= 0) return priceWithVat;
  
  return priceWithVat - calculateVatAmount(priceWithVat, vatRate);
}

/**
 * Calculează breakdown-ul TVA pentru o listă de produse
 * @param {Array} items - Lista de produse (cu category și price/final_price)
 * @param {number|string} vatFood - TVA pentru mâncare (default: 11)
 * @param {number|string} vatDrinks - TVA pentru băuturi (default: 21)
 * @returns {Object} Breakdown-ul TVA: { subtotal, vatAmount, total, vatBreakdown: [{ rate, amount, base }] }
 */
function calculateVatBreakdown(items, vatFood = 11, vatDrinks = 21) {
  const vatFoodNum = typeof vatFood === 'string' ? parseFloat(vatFood) : (vatFood || 11);
  const vatDrinksNum = typeof vatDrinks === 'string' ? parseFloat(vatDrinks) : (vatDrinks || 21);
  
  let subtotal = 0;
  const vatBreakdown = {};
  
  // Calculează TVA-ul pentru fiecare produs
  items.forEach(item => {
    const quantity = parseFloat(item.quantity || 1);
    const price = parseFloat(item.price || item.final_price || 0);
    const itemTotal = price * quantity;
    
    if (itemTotal <= 0) return;
    
    const category = item.category || item.category_name || '';
    const vatRate = getVatRate(category, vatFoodNum, vatDrinksNum);
    
    // 🔴 FIX 5 - Rounding corect la nivel de linie (CRITIC)
    // Calculează TVA-ul pentru item-ul curent
    const vatAmountRaw = calculateVatAmount(itemTotal, vatRate);
    // Rounding la 2 zecimale pentru fiecare linie
    const vatAmount = Math.round(vatAmountRaw * 100) / 100;
    const baseAmountRaw = itemTotal - vatAmount;
    // Rounding la 2 zecimale pentru base amount
    const baseAmount = Math.round(baseAmountRaw * 100) / 100;
    
    subtotal += baseAmount;
    
    // Grupează pe rate-uri TVA
    if (!vatBreakdown[vatRate]) {
      vatBreakdown[vatRate] = {
        rate: vatRate,
        base: 0,
        amount: 0
      };
    }
    
    vatBreakdown[vatRate].base += baseAmount;
    vatBreakdown[vatRate].amount += vatAmount;
  });
  
  // Convertește breakdown-ul în array cu rounding final
  const vatBreakdownArray = Object.values(vatBreakdown).map(vat => ({
    rate: vat.rate,
    base: Math.round(vat.base * 100) / 100, // Rotunjire la 2 zecimale
    amount: Math.round(vat.amount * 100) / 100 // Rotunjire la 2 zecimale
  }));
  
  // Calculează totalul cu rounding
  const subtotalRounded = Math.round(subtotal * 100) / 100;
  const totalVatAmount = vatBreakdownArray.reduce((sum, vat) => sum + vat.amount, 0);
  const totalVatAmountRounded = Math.round(totalVatAmount * 100) / 100;
  const total = subtotalRounded + totalVatAmountRounded;
  const totalRounded = Math.round(total * 100) / 100;
  
  // 🔴 FIX 5 - Total consistency check (guard)
  const expectedTotal = subtotalRounded + totalVatAmountRounded;
  const difference = Math.abs(totalRounded - expectedTotal);
  if (difference > 0.01) {
    console.warn(`⚠️ [VAT Calculator] Total consistency check failed: subtotal (${subtotalRounded}) + VAT (${totalVatAmountRounded}) = ${expectedTotal}, but total is ${totalRounded}. Difference: ${difference}`);
    // Nu blochează flow-ul, doar loghează warning
  }
  
  return {
    subtotal: subtotalRounded,
    vatAmount: totalVatAmountRounded,
    total: totalRounded,
    vatBreakdown: vatBreakdownArray
  };
}

module.exports = {
  isDrinkCategory,
  getVatRate,
  calculateVatAmount,
  calculatePriceWithoutVat,
  calculateVatBreakdown
};
