// src/modules/tipizate/tipizateApi.js
// API helpers pentru tipizate

export function getNirPdfUrl(id) {
  return `/api/admin/tipizate/nir/${id}/pdf`;
}

export function getBonConsumPdfUrl(id) {
  return `/api/admin/tipizate/bon-consum/${id}/pdf`;
}

export function getAvizPdfUrl(id) {
  return `/api/admin/tipizate/aviz/${id}/pdf`;
}

export function getChitantaPdfUrl(id) {
  return `/api/admin/tipizate/chitanta/${id}/pdf`;
}

export function getRegistruCasaPdfUrl(from, to) {
  const params = new URLSearchParams({ from, to }).toString();
  return `/api/admin/tipizate/registru-casa/pdf?${params}`;
}

export function getFisaMagaziePdfUrl(ingredientId, locationId) {
  return `/api/admin/tipizate/fisa-magazie/${ingredientId}/${locationId}/pdf`;
}

export function getRaportGestiunePdfUrl(locationId, from, to) {
  const params = new URLSearchParams({
    location_id: String(locationId),
    from,
    to,
  }).toString();
  return `/api/admin/tipizate/raport-gestiune/pdf?${params}`;
}

export function getTransferPdfUrl(id) {
  return `/api/admin/tipizate/transfer/${id}/pdf`;
}

export function getInventarPdfUrl(id) {
  return `/api/admin/tipizate/inventar/${id}/pdf`;
}

export function getProductionBatchPdfUrl(id) {
  return `/api/admin/tipizate/production-batch/${id}/pdf`;
}

