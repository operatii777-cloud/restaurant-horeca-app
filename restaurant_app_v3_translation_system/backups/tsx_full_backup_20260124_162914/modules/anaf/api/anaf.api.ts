/**
 * FAZA 1 - ANAF API Client
 * 
 * API functions for ANAF certificate management, health dashboard, and token management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get ANAF Health Dashboard data
 */
export async function fetchAnafHealth() {
  const response = await fetch(`${API_BASE_URL}/api/anaf/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ANAF health: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get ANAF submissions with filters
 */
export async function fetchAnafSubmissions(params: {
  documentType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.documentType) queryParams.append('documentType', params.documentType);
  if (params.status) queryParams.append('status', params.status);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const response = await fetch(`${API_BASE_URL}/api/anaf/submissions?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch submissions: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get certificate status
 */
export async function fetchCertificateStatus() {
  const response = await fetch(`${API_BASE_URL}/api/anaf/certificate/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch certificate status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Upload certificate
 */
export async function uploadCertificate(file: File, password: string) {
  const formData = new FormData();
  formData.append('certificate', file);
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/api/anaf/certificate/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to upload certificate: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete certificate
 */
export async function deleteCertificate() {
  const response = await fetch(`${API_BASE_URL}/api/anaf/certificate`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete certificate: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Refresh ANAF token
 */
export async function refreshAnafToken() {
  const response = await fetch(`${API_BASE_URL}/api/anaf/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to refresh token: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Map ANAF error codes to user-friendly messages
 */
export function getAnafErrorMessage(errorCode: string | number): string {
  const errorMap: Record<string, string> = {
    '702': 'Certificat invalid sau expirat. Verifică certificatul și data expirării.',
    '703': 'Token expirat – reînnoire necesară. Tokenul va fi reînnoit automat.',
    '500': 'ANAF indisponibil – încercați mai târziu. Serviciul ANAF este temporar indisponibil.',
    '400': 'Document invalid – verificați datele fiscale. Datele documentului nu sunt valide.',
    '408': 'Timeout – document în coadă. Documentul va fi trimis automat când serverul ANAF răspunde.',
  };

  const code = errorCode.toString();
  return errorMap[code] || `Eroare ANAF: ${errorCode}`;
}


