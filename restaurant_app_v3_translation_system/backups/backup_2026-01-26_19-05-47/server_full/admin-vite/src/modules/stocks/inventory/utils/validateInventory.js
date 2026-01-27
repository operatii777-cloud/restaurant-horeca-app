const isValidDate = (value) => {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
};

export function validateInventory(inventoryState = {}) {
  const header = inventoryState.header ?? {};
  const lines = Array.isArray(inventoryState.lines) ? inventoryState.lines : [];
  const totals = inventoryState.totals ?? {};

  const headerErrors = {};
  const lineErrors = {};
  const generalErrors = [];
  const warnings = [];

  if (!header.document_number || String(header.document_number).trim() === "") {
    headerErrors.document_number = "Numărul inventarului este obligatoriu.";
  }

  if (!header.document_date) {
    headerErrors.document_date = "Data inventarului este obligatorie.";
  } else if (!isValidDate(header.document_date)) {
    headerErrors.document_date = "Data inventarului nu este validă.";
  }

  if (!header.location || String(header.location).trim() === "") {
    headerErrors.location = "Locația / depozitul este obligatorie.";
  }

  if (!header.responsible || String(header.responsible).trim() === "") {
    headerErrors.responsible = "Responsabilul inventarului este obligatoriu.";
  }

  let validLines = 0;

  lines.forEach((line, index) => {
    const errors = {};
    if (!line?.ingredient_id) {
      errors.ingredient_id = "Ingredientul este obligatoriu.";
    }

    const stockSystem = Number(line?.stock_system);
    const stockCounted = Number(line?.stock_counted);

    if (!Number.isFinite(stockSystem) || stockSystem < 0) {
      errors.stock_system = "Stocul scriptic trebuie să fie ≥ 0.";
    }

    if (!Number.isFinite(stockCounted) || stockCounted < 0) {
      errors.stock_counted = "Stocul faptic trebuie să fie ≥ 0.";
    }

    if (Object.keys(errors).length) {
      lineErrors[index] = errors;
    } else {
      validLines += 1;
    }

    const diff = Number(line?.diff ?? stockCounted - stockSystem);
    if (Number.isFinite(diff) && Math.abs(diff) > 1000) {
      warnings.push(`Linia ${index + 1}: Diferență mare ("Diff"). Verifică dacă este corectă.`);
    }
  });

  if (validLines === 0) {
    generalErrors.push("Inventarul trebuie să conțină cel puțin o linie validă.");
  }

  if (typeof totals.total_positive !== "undefined" || typeof totals.total_negative !== "undefined") {
    const tp = Number(totals.total_positive);
    const tn = Number(totals.total_negative);
    if (!Number.isFinite(tp) || !Number.isFinite(tn)) {
      generalErrors.push("Totalurile diferențelor nu sunt valide.");
    }
  }

  const isValid = !Object.keys(headerErrors).length && !Object.keys(lineErrors).length && generalErrors.length === 0;

  return {
    isValid,
    headerErrors,
    lineErrors,
    generalErrors,
    warnings,
  };
}

