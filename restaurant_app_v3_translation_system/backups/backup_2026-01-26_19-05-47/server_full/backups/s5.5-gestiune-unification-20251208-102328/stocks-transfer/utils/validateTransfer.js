export const validateTransfer = (state = {}) => {
  const headerErrors = {};
  const lineErrors = {};
  const generalErrors = [];
  const header = state.header || {};
  const lines = Array.isArray(state.lines) ? state.lines : [];

  if (!header.document_number) headerErrors.document_number = "Număr document obligatoriu.";
  if (!header.document_date) headerErrors.document_date = "Data este obligatorie.";
  if (!header.source_location) headerErrors.source_location = "Sursa este obligatorie.";
  if (!header.target_location) headerErrors.target_location = "Destinația este obligatorie.";
  if (!header.responsible) headerErrors.responsible = "Responsabilul este obligatoriu.";
  if (header.source_location && header.target_location && header.source_location === header.target_location) {
    generalErrors.push("Sursa și destinația trebuie să fie diferite.");
  }
  if (!lines.length) generalErrors.push("Adaugă cel puțin o linie.");

  lines.forEach((l, idx) => {
    const e = {};
    if (!l.ingredient_id) e.ingredient_id = "Ingredient obligatoriu.";
    if (!(Number(l.quantity) > 0)) e.quantity = "Cantitatea trebuie să fie > 0.";
    if (Object.keys(e).length) lineErrors[idx] = e;
  });

  const isValid =
    Object.keys(headerErrors).length === 0 &&
    Object.keys(lineErrors).length === 0 &&
    generalErrors.length === 0;

  return { isValid, headerErrors, lineErrors, generalErrors };
};


