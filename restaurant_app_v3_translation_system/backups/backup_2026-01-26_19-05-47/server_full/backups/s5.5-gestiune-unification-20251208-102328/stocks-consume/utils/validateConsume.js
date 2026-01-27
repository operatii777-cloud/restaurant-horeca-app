const isValidDate = (value) => {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
};

export function validateConsume(consumeState = {}) {
  const header = consumeState.header ?? {};
  const lines = Array.isArray(consumeState.lines) ? consumeState.lines : [];
  const totals = consumeState.totals ?? {};

  const headerErrors = {};
  const lineErrors = {};
  const generalErrors = [];
  const warnings = [];

  if (!header.document_number || String(header.document_number).trim() === "") {
    headerErrors.document_number = "Numărul documentului este obligatoriu.";
  }

  if (!header.document_date) {
    headerErrors.document_date = "Data documentului este obligatorie.";
  } else if (!isValidDate(header.document_date)) {
    headerErrors.document_date = "Data documentului nu este validă.";
  }

  if (!header.destination || String(header.destination).trim() === "") {
    headerErrors.destination = "Destinația este obligatorie.";
  }

  if (!header.reason || String(header.reason).trim() === "") {
    headerErrors.reason = "Motivul consumului este obligatoriu.";
  }

  let validLines = 0;

  lines.forEach((line, index) => {
    const errors = {};
    const ingredientId = line?.ingredient_id;
    const quantity = Number(line?.quantity);

    if (!ingredientId) {
      errors.ingredient_id = "Ingredientul este obligatoriu.";
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.quantity = "Cantitatea trebuie să fie mai mare decât 0.";
    }

    if (Object.keys(errors).length) {
      lineErrors[index] = errors;
    } else {
      validLines += 1;
    }

    if (Number.isFinite(quantity) && quantity > 10000) {
      warnings.push(`Linia ${index + 1}: Cantitate foarte mare (${quantity}). Verifică dacă este corectă.`);
    }
  });

  if (validLines === 0) {
    generalErrors.push("Bonul de consum trebuie să conțină cel puțin o linie validă.");
  }

  if (typeof totals.total_quantity !== "undefined") {
    const totalQuantity = Number(totals.total_quantity);
    if (!Number.isFinite(totalQuantity) || totalQuantity < 0) {
      generalErrors.push("Totalul cantităților nu poate fi negativ.");
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

