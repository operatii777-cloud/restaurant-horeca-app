/**
 * PHASE S8.3 - UBL Tipizate API Client

 * Restaurant App V3 powered by QrOMS
 */

const BASE_URL = '/api/tipizate';

export interface UBLGenerateResponse {
  success: boolean;
  data?: {
    documentId: number;
    documentType: string;
    documentNumber: string | null;
    xml: string;
    xmlLength: number;
    generatedAt: string;
  };
  error?: string;
}

/**
 * Generate UBL XML for a tipizate document
 */
export async function generateUBL(docType: string, docId: number): Promise<UBLGenerateResponse> {
  const response = await fetch(`${BASE_URL}/${docType}/${docId}/ubl`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate UBL');
  }

  return response.json();
}

/**
 * Get UBL XML for a tipizate document
 */
export async function getUBLXml(docType: string, docId: number): Promise<string> {
  const response = await fetch(`${BASE_URL}/${docType}/${docId}/ubl/xml`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to get UBL XML');
  }

  return response.text();
}

/**
 * Download UBL XML for a tipizate document
 */
export async function downloadUBL(docType: string, docId: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${docType}/${docId}/ubl/download`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to download UBL XML');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElemen[a];
  a.href = url;
  a.download = `${docType}_${docId}_${new Date().toISOString().split('T')[0]}.xml`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}


