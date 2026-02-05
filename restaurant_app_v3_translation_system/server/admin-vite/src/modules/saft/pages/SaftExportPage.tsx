// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.5 - SAF-T Export Page
 * 
 * UI for generating SAF-T XML exports with validation
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import './SaftExportPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Validate SAF-T export
 */
async function validateSaftExport(month: string) {
  //   const { t } = useTranslation();
  const response = await fetch(`${API_BASE_URL}/api/saft/export/validate?month=${month}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to validate: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get export history
 */
async function getExportHistory() {
  const response = await fetch(`${API_BASE_URL}/api/saft/export/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get history: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Download SAF-T export
 */
function downloadSaftExport(month: string) {
  const url = `${API_BASE_URL}/api/saft/export?month=${month}`;
  window.open(url, '_blank');
}

export function SaftExportPage() {
  //   const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { data: validationData, isLoading: validating, refetch: refetchValidation } = useQuery({
    queryKey: ['saft', 'validate', selectedMonth],
    queryFn: () => validateSaftExport(selectedMonth),
    enabled: false, // Only validate on demand
  });

  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['saft', 'export-history'],
    queryFn: getExportHistory,
  });

  /**
   * Handle validation
   */
  const handleValidate = () => {
    refetchValidation();
  };

  /**
   * Handle export
   */
  const handleExport = () => {
    if (!validationData?.success) {
      alert('Validează datele înainte de export!');
      return;
    }
    downloadSaftExport(selectedMonth);
    setTimeout(() => refetchHistory(), 2000); // Refresh history after download
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const validation = validationData?.data;
  const history = historyData?.data || [];

  return (
    <div className="saft-export-page">
      <header className="page-header">
        <h1 className="page-title">Export SAF-T ANAF</h1>
        <p className="page-subtitle">Generează export SAF-T XML pentru trimitere către ANAF</p>
      </header>

      {/* Export Form */}
      <div className="export-form-card">
        <h3 className="card-title">Generare Export</h3>
        <div className="form-group">
          <label htmlFor="export-month" className="form-label">Selectează Luna</label>
          <input
            id="export-month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-control"
            max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
          />
        </div>

        <div className="form-actions">
          <button
            onClick={handleValidate}
            disabled={validating}
            className="btn btn-secondary"
          >
            {validating ? 'Se validează...' : 'Validează Datele'}
          </button>
          <button
            onClick={handleExport}
            disabled={!validation?.valid || validating}
            className="btn btn-primary"
          >Descarcă SAF-T XML</button>
        </div>
      </div>

      {/* Validation Results */}
      {validation && (
        <div className={`validation-card ${validation.valid ? 'validation-success' : 'validation-error'}`}>
          <h3 className="card-title">
            {validation.valid ? '✅ Validare Reușită' : '❌ Erori de Validare'}
          </h3>
          {validation.errors && validation.errors.length > 0 ? (
            <div className="validation-errors">
              <ul>
                {validation.errors.map((error: any, index: number) => (
                  <li key={index}>
                    <strong>{error.code}:</strong> {error.message}
                    {error.details && (
                      <pre className="error-details">{JSON.stringify(error.details, null, 2)}</pre>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="validation-success-message">Toate datele sunt valide. Poți genera exportul SAF-T.</p>
          )}
        </div>
      )}

      {/* Export History */}
      <div className="history-card">
        <h3 className="card-title">Istoric Exporturi</h3>
        {historyLoading ? (
          <div className="loading-spinner">Se încarcă...</div>
        ) : history.length === 0 ? (
          <p className="text-muted">Nu există exporturi anterioare.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Lună</th>
                <th>Data Export</th>
                <th>Status</th>
                <th>Dimensiune</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{item.month}</td>
                  <td>{formatDate(item.exported_at)}</td>
                  <td>
                    <span className={`badge badge-${item.status === 'SUCCESS' ? 'success' : 'danger'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.file_size ? `${(item.file_size / 1024).toFixed(2)} KB` : 'N/A'}</td>
                  <td>
                    {item.status === 'SUCCESS' && (
                      <button
                        onClick={() => downloadSaftExport(item.month)}
                        className="btn btn-sm btn-primary"
                      >Descarcă</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}




