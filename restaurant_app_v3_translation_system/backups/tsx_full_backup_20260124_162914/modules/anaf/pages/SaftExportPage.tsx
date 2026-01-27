// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.5 - SAF-T Export Page
 * 
 * UI for generating and exporting SAF-T files
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import './SaftExportPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function validateSaftExport(month: string) {
//   const { t } = useTranslation();
  const response = await fetch(`${API_BASE_URL}/api/saft/export/validate?month="Month"`, {
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

async function downloadSaftXml(month: string) {
  const response = await fetch(`${API_BASE_URL}/api/saft/export?month="Month"`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `saft-"Month".xml`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

async function downloadSaftXlsx(month: string) {
  const response = await fetch(`${API_BASE_URL}/api/saft/export/xlsx?month="Month"`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `saft-"Month".xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export function SaftExportPage() {
//   const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { data: validation, isLoading: isValidating, refetch: revalidate } = useQuery({
    queryKey: ['saft', 'validate', selectedMonth],
    queryFn: () => validateSaftExport(selectedMonth),
    enabled: false, // Manual trigger
  });

  const downloadXmlMutation = useMutation({
    mutationFn: () => downloadSaftXml(selectedMonth),
  });

  const downloadXlsxMutation = useMutation({
    mutationFn: () => downloadSaftXlsx(selectedMonth),
  });

  const handleValidate = () => {
    revalidate();
  };

  const handleDownloadXml = () => {
    downloadXmlMutation.mutate();
  };

  const handleDownloadXlsx = () => {
    downloadXlsxMutation.mutate();
  };

  return (
    <div className="saft-export-page">
      <header className="page-header">
        <h1 className="page-title">SAF-T Export</h1>
        <p className="page-subtitle">"generare si export fisiere saf t pentru anaf"</p>
      </header>

      <div className="export-card">
        <h2 className="card-title">"selectare luna"</h2>
        <div className="form-group">
          <label htmlFor="month-select" className="form-label">
            Lună (YYYY-MM)
          </label>
          <input
            id="month-select"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="actions">
          <button onClick={handleValidate} disabled={isValidating} className="btn btn-secondary">
            {isValidating ? 'Se validează...' : 'Validează înainte de export'}
          </button>
        </div>
      </div>

      {validation && (
        <div className={`validation-card ${validation.success ? 'validation-success' : 'validation-error'}`}>
          <h3 className="card-title">Rezultate Validare</h3>
          {validation.success ? (
            <div className="alert alert-success">
              ✅ Validare reușită! Poți exporta fișierul SAF-T.
            </div>
          ) : (
            <div className="alert alert-danger">
              ❌ Validare eșuată. Verifică erorile înainte de export.
            </div>
          )}

          {validation.data?.errors && validation.data.errors.length > 0 && (
            <div className="errors-list">
              <h4>Erori:</h4>
              <ul>
                {validation.data.errors.map((error: string, index: number) => (
                  <li key={index} className="error-item">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.data?.warnings && validation.data.warnings.length > 0 && (
            <div className="warnings-list">
              <h4>Avertismente:</h4>
              <ul>
                {validation.data.warnings.map((warning: string, index: number) => (
                  <li key={index} className="warning-item">{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="export-actions-card">
        <h2 className="card-title">Export</h2>
        <div className="export-buttons">
          <button
            onClick={handleDownloadXml}
            disabled={downloadXmlMutation.isPending || (validation && !validation.success)}
            className="btn btn-primary"
          >
            {downloadXmlMutation.isPending ? 'Se generează...' : 'Descarcă SAF-T XML'}
          </button>
          <button
            onClick={handleDownloadXlsx}
            disabled={downloadXlsxMutation.isPending || (validation && !validation.success)}
            className="btn btn-primary"
          >
            {downloadXlsxMutation.isPending ? 'Se generează...' : 'Descarcă SAF-T XLSX'}
          </button>
        </div>
      </div>

      <div className="help-card">
        <h3 className="card-title">"Informații"</h3>
        <ul className="help-list">
          <li>SAF-T (Standard Audit File for Tax) este formatul standard pentru raportare fiscală către ANAF</li>
          <li>"exportul include facturi chitante plati miscari st"</li>
          <li>"valideaza intotdeauna inainte de export pentru a v"</li>
          <li>"format xml este standard anaf format xlsx este pen"</li>
        </ul>
      </div>
    </div>
  );
}




