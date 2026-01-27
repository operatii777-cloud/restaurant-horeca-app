import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { PageHeader } from '@/shared/components/PageHeader';
import './ImportExportPage.css';

interface ImportHistory {
  id: number;
  type: string;
  file_name: string;
  status: string;
  records_total: number;
  records_imported: number;
  records_failed: number;
  created_at: string;
}

interface ExportHistory {
  id: number;
  type: string;
  format: string;
  file_path?: string;
  status: string;
  created_at: string;
}

const IMPORT_TYPES = [
  { value: 'products', label: 'Produse' },
  { value: 'ingredients', label: 'Ingrediente' },
  { value: 'menu', label: 'Meniu' },
  { value: 'customers', label: 'Clienți' },
];

const EXPORT_TYPES = [
  { value: 'sales', label: 'Vânzări' },
  { value: 'inventory', label: 'Inventar' },
  { value: 'products', label: 'Produse' },
  { value: 'reports', label: 'Rapoarte' },
];

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' },
  { value: 'pdf', label: 'PDF' },
];

export const ImportExportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('products');
  const [exportType, setExportType] = useState('sales');
  const [exportFormat, setExportFormat] = useState('csv');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: importHistory, refetch: refetchImport } = useApiQuery<ImportHistory[]>('/api/import/history');
  const { data: exportHistory, refetch: refetchExport } = useApiQuery<ExportHistory[]>('/api/export/history');
  const importMutation = useApiMutation();
  const exportMutation = useApiMutation();

  const handleImport = async () => {
    if (!importFile) {
      setAlert({ type: 'error', message: 'Selectează un fișier' });
      return;
    }

    try {
      await importMutation.mutate({
        url: `/api/import/${importType}`,
        method: 'POST',
        data: {
          file_name: importFile.name,
          file_size: importFile.size,
          records_total: 0, // TODO: Parse file to get count
        }
      });
      setAlert({ type: 'success', message: 'Import inițiat cu succes!' });
      setImportFile(null);
      refetchImport();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la import' });
    }
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutate({
        url: `/api/export/${exportType}`,
        method: 'POST',
        data: {
          format: exportFormat,
          filters_json: {}, // TODO: Add filters UI
        }
      });
      setAlert({ type: 'success', message: 'Export inițiat cu succes!' });
      refetchExport();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la export' });
    }
  };

  return (
    <div className="import-export-page">
      <PageHeader
        title="Import & Export Date"
        description="Import și export date în multiple formate (CSV, Excel, PDF)"
      />

      {alert && (
        <InlineAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="import-export-tabs">
        <button
          className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          📥 Import
        </button>
        <button
          className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          📤 Export
        </button>
      </div>

      {activeTab === 'import' && (
        <div className="import-export-section">
          <div className="import-form">
            <h3>Import Date</h3>
            <div className="form-group">
              <label>Tip Import *</label>
              <select
                value={importType}
                onChange={(e) => setImportType(e.target.value)}
              >
                {IMPORT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Fișier *</label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              {importFile && (
                <p className="file-info">📄 {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)</p>
              )}
            </div>
            <button className="btn btn-primary" onClick={handleImport} disabled={!importFile}>
              📥 Importă
            </button>
          </div>

          <div className="import-history">
            <h3>Istoric Import</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Fișier</th>
                  <th>Status</th>
                  <th>Înregistrări</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {importHistory && importHistory.length > 0 ? (
                  importHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.type}</td>
                      <td>{item.file_name}</td>
                      <td>
                        <span className={`badge badge-${item.status === 'success' ? 'success' : item.status === 'error' ? 'danger' : 'warning'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.records_imported}/{item.records_total}</td>
                      <td>{new Date(item.created_at).toLocaleString('ro-RO')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">Nu există import-uri</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="import-export-section">
          <div className="export-form">
            <h3>Export Date</h3>
            <div className="form-group">
              <label>Tip Export *</label>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
              >
                {EXPORT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Format *</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                {EXPORT_FORMATS.map(format => (
                  <option key={format.value} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleExport}>
              📤 Exportă
            </button>
          </div>

          <div className="export-history">
            <h3>Istoric Export</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {exportHistory && exportHistory.length > 0 ? (
                  exportHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.type}</td>
                      <td>{item.format.toUpperCase()}</td>
                      <td>
                        <span className={`badge badge-${item.status === 'success' ? 'success' : item.status === 'error' ? 'danger' : 'warning'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{new Date(item.created_at).toLocaleString('ro-RO')}</td>
                      <td>
                        {item.file_path && item.status === 'success' && (
                          <button className="btn btn-sm btn-primary">
                            ⬇️ Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">Nu există export-uri</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

