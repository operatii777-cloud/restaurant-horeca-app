export async function fetchVatRates() {
  const r = await fetch("/api/admin/vat-rates");
  if (!r.ok) throw new Error("Nu s-au putut încărca cotele TVA");
  return r.json();
}

export async function createVatRate(payload) {
  const r = await fetch("/api/admin/vat-rates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Eroare la creare cotă TVA");
  return r.json();
}

export async function updateVatRate(id, payload) {
  const r = await fetch(`/api/admin/vat-rates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Eroare la actualizare cotă TVA");
  return r.json();
}

export async function deleteVatRate(id) {
  const r = await fetch(`/api/admin/vat-rates/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Eroare la dezactivare cotă TVA");
  return r.json();
}


