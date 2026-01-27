const allowedTvaValues = new Set([0, 5, 9, 19]);

const isValidDate = (value) => {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
};

export function validateNir(nirState = {}) {
  const header = nirState.header ?? {};
  const lines = Array.isArray(nirState.lines) ? nirState.lines : [];
  const totals = nirState.totals ?? {};

  const headerErrors = {};
  const lineErrors = {};
  const generalErrors = [];
  const warnings = [];

  if (!header.supplier_id && header.supplier_id !== 0) {
    headerErrors.supplier_id = "Selectează un furnizor.";
  }

  const documentNumber = typeof header.document_number === "string" ? header.document_number.trim() : "";
  if (!documentNumber) {
    headerErrors.document_number = "Numărul documentului este obligatoriu.";
  }

  if (!header.document_date) {
    headerErrors.document_date = "Data documentului este obligatorie.";
  } else if (!isValidDate(header.document_date)) {
    headerErrors.document_date = "Data documentului nu este validă.";
  }

  if (!lines.length) {
    generalErrors.push("NIR-ul trebuie să conțină cel puțin o linie.");
  }

  let validLineCount = 0;

  lines.forEach((line, index) => {
    const errors = {};
    const ingredientId = line?.ingredient_id;
    const quantity = Number(line?.quantity);
    const unitPrice = Number(line?.unit_price);
    const tvaPercent = Number(line?.tva_percent);

    if (!ingredientId) {
      errors.ingredient_id = "Ingredientul este obligatoriu.";
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.quantity = "Cantitatea trebuie să fie mai mare decât 0.";
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      errors.unit_price = "Prețul unitar nu poate fi negativ.";
    } else if (unitPrice === 0) {
      warnings.push(`Linia ${index + 1}: Prețul unitar este 0.`);
    }

    if (!Number.isFinite(tvaPercent) || tvaPercent < 0) {
      errors.tva_percent = "TVA-ul trebuie să fie un număr pozitiv.";
    } else if (!allowedTvaValues.has(tvaPercent)) {
      warnings.push(`Linia ${index + 1}: TVA ${tvaPercent}% este atipic.`);
    } else if (tvaPercent === 0 && unitPrice > 0) {
      warnings.push(`Linia ${index + 1}: TVA este 0% pentru un preț pozitiv.`);
    }

    if (Object.keys(errors).length) {
      lineErrors[index] = errors;
    } else if (ingredientId) {
      validLineCount += 1;
    }
  });

  if (validLineCount === 0) {
    generalErrors.push("NIR-ul trebuie să conțină cel puțin o linie validă.");
  }

  const totalValue = Number(totals.total_value);
  if (Number.isFinite(totalValue) && totalValue < 0) {
    generalErrors.push("Totalul valoric nu poate fi negativ.");
  }

  const totalTva = Number(totals.total_tva);
  if (Number.isFinite(totalTva) && totalTva < 0) {
    generalErrors.push("Totalul TVA nu poate fi negativ.");
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
