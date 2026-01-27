// server/src/modules/recipes/recipe.types.js
/**
 * S13 — Canonical Recipe Model
 * 
 * Acesta este singurul model de rețetă acceptat în restul aplicației.
 * Tot ce vine din DB sau din API se mapează aici.
 * 
 * Compatibil cu Master Data Layer (ingredientsMaster, productsMaster, unitsMaster)
 */

/**
 * @typedef {Object} CanonicalRecipeLine
 * @property {number} ingredientId            - ID ingredient (FK către ingredients)
 * @property {object|null} ingredient         - Ingredient Master (din ingredientsMaster) sau null dacă nu există
 * @property {number} quantity                - Cantitatea pentru o porție (în unitatea de mai jos)
 * @property {string} unit                    - Unitatea pentru quantity (ex: "g", "kg", "ml", "L", "buc")
 * @property {"mass"|"volume"|"count"|null} unitType - Tipul unității (din unitsMaster) sau null dacă nu poate fi determinat
 * @property {number} wastePercent            - Pierderi / waste [%] (0–100)
 * @property {boolean} isOptional             - Dacă ingredientul e opțional (ex: topping extra)
 * @property {string|null} note               - Notă opțională (ex: "felii subțiri", "adăugat la final")
 * @property {number|null} quantityGross      - Cantitate brută (cu waste) - opțional, calculat automat
 * @property {number|null} quantityNet        - Cantitate netă (fără waste) - opțional, calculat automat
 */

/**
 * @typedef {Object} CanonicalRecipe
 * @property {number|null} id                 - ID-ul rețetei în DB (dacă există)
 * @property {number} productId               - ID produs (FK către menu/products)
 * @property {object|null} product            - Produs Master (din productsMaster) sau null
 * @property {CanonicalRecipeLine[]} lines    - Linii de rețetă
 * @property {number} yieldQuantity           - Output (câte porții rezultă din rețetă)
 * @property {string} yieldUnit               - Unitatea pentru yield (de obicei "portion" sau "buc")
 * @property {number|null} prepTimeMinutes    - Timp de preparare (minute) — opțional
 * @property {string|null} notes              - Note generale pentru rețetă
 * @property {boolean} isActive               - Dacă rețeta este activă
 * @property {string|null} itemType           - Tip item (ingredient, packaging_restaurant, packaging_delivery, recipe)
 * @property {boolean} isSemiFinished        - Dacă este semi-produs finit
 */

/**
 * Creează o linie de rețetă canonică validată parțial.
 * Nu se ocupă de ingredient/units master, doar normalizează shape-ul.
 *
 * @param {Partial<CanonicalRecipeLine>} input
 * @returns {CanonicalRecipeLine}
 */
function createRecipeLine(input) {
  const quantity = Number(input.quantity) || 0;
  const wastePercent = typeof input.wastePercent === "number"
    ? Math.min(Math.max(input.wastePercent, 0), 100)
    : 0;
  
  // Calculează quantityGross și quantityNet dacă nu sunt furnizate
  let quantityGross = input.quantityGross;
  let quantityNet = input.quantityNet;
  
  if (quantityGross === undefined || quantityGross === null) {
    // quantityGross = quantity / (1 - wastePercent/100)
    quantityGross = wastePercent > 0 ? quantity / (1 - wastePercent / 100) : quantity;
  }
  
  if (quantityNet === undefined || quantityNet === null) {
    quantityNet = quantity;
  }

  return {
    ingredientId: Number(input.ingredientId),
    ingredient: input.ingredient || null,
    quantity: quantity,
    unit: input.unit || "g",
    unitType: input.unitType || null,
    wastePercent: wastePercent,
    isOptional: Boolean(input.isOptional),
    note: input.note || null,
    quantityGross: quantityGross,
    quantityNet: quantityNet
  };
}

/**
 * Creează o rețetă canonică dintr-un input brut.
 * @param {Partial<CanonicalRecipe>} input
 * @returns {CanonicalRecipe}
 */
function createCanonicalRecipe(input) {
  const lines = Array.isArray(input.lines) ? input.lines : [];

  return {
    id: input.id != null ? Number(input.id) : null,
    productId: Number(input.productId),
    product: input.product || null,
    lines: lines.map(createRecipeLine),
    yieldQuantity: input.yieldQuantity ? Number(input.yieldQuantity) : 1,
    yieldUnit: input.yieldUnit || "portion",
    prepTimeMinutes:
      input.prepTimeMinutes != null ? Number(input.prepTimeMinutes) : null,
    notes: input.notes || null,
    isActive: input.isActive !== false, // default true
    itemType: input.itemType || "ingredient",
    isSemiFinished: Boolean(input.isSemiFinished)
  };
}

/**
 * Validează o rețetă canonică.
 * NU aruncă excepții, returnează o listă de erori (string-uri).
 *
 * @param {CanonicalRecipe} recipe
 * @returns {string[]} lista de erori (goală dacă e valid)
 */
function validateCanonicalRecipe(recipe) {
  const errors = [];

  if (!recipe.productId || Number.isNaN(recipe.productId)) {
    errors.push("productId este obligatoriu și trebuie să fie numeric.");
  }

  if (!Array.isArray(recipe.lines) || recipe.lines.length === 0) {
    errors.push("Rețeta trebuie să aibă cel puțin o linie.");
  }

  recipe.lines.forEach((line, idx) => {
    if (!line.ingredientId || Number.isNaN(line.ingredientId)) {
      errors.push(`Linia ${idx + 1}: ingredientId este obligatoriu.`);
    }
    if (!line.unit) {
      errors.push(`Linia ${idx + 1}: unit este obligatoriu.`);
    }
    if (line.quantity <= 0) {
      errors.push(`Linia ${idx + 1}: quantity trebuie să fie > 0.`);
    }
    if (line.wastePercent < 0 || line.wastePercent > 100) {
      errors.push(
        `Linia ${idx + 1}: wastePercent trebuie să fie între 0 și 100.`
      );
    }
  });

  if (recipe.yieldQuantity <= 0) {
    errors.push("yieldQuantity trebuie să fie > 0.");
  }

  return errors;
}

module.exports = {
  createRecipeLine,
  createCanonicalRecipe,
  validateCanonicalRecipe
};

