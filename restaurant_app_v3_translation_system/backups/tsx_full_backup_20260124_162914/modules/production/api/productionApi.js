// src/modules/production/api/productionApi.js
// API client pentru Production Batches

export async function listBatches() {
  const r = await fetch("/api/admin/production/batches");
  if (!r.ok) throw new Error("Eroare la încărcarea batch-urilor");
  return r.json();
}

export async function getBatch(id) {
  const r = await fetch(`/api/admin/production/batches/${Number(id)}`);
  if (!r.ok) throw new Error("Eroare la încărcarea batch-ului");
  return r.json();
}

export async function createBatch(payload) {
  const r = await fetch("/api/admin/production/batches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: "Eroare la crearea batch-ului" }));
    throw new Error(err.error || "Eroare la crearea batch-ului");
  }
  return r.json();
}

export async function updateBatch(id, payload) {
  const r = await fetch(`/api/admin/production/batches/${Number(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: "Eroare la actualizarea batch-ului" }));
    throw new Error(err.error || "Eroare la actualizarea batch-ului");
  }
  return r.json();
}

export async function deleteBatch(id) {
  const r = await fetch(`/api/admin/production/batches/${Number(id)}`, {
    method: "DELETE",
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: "Eroare la ștergerea batch-ului" }));
    throw new Error(err.error || "Eroare la ștergerea batch-ului");
  }
  return r.json();
}

export async function finalizeBatch(id) {
  const r = await fetch(`/api/admin/production/batches/${Number(id)}/finalize`, {
    method: "POST",
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: "Eroare la finalizarea batch-ului" }));
    throw new Error(err.error || "Eroare la finalizarea batch-ului");
  }
  return r.json();
}

