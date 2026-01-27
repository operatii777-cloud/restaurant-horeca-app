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

interface ImportFilters {
  entityType: string;
  mode: 'create' | 'update' | 'upsert';
  locationId?: number;
  skipFirstRow?: boolean;
}

export const ImportExportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('products');
  const [exportType, setExportType] = useState('sales');
  const [exportFormat, setExportFormat] = useState('csv');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Import filters state
  const [importFilters, setImportFilters] = useState<ImportFilters>({
    entityType: 'products',
    mode: 'upsert',
    skipFirstRow: true,
  });
  const [fileRowCount, setFileRowCount] = useState<number | null>(null);
  const [parsingFile, setParsingFile] = useState(false);

  const { data: importHistory, refetch: refetchImport } = useApiQuery<ImportHistory[]>('/api/import/history');
  const { data: exportHistory, refetch: refetchExport } = useApiQuery<ExportHistory[]>('/api/export/history');
  const importMutation = useApiMutation();
  const exportMutation = useApiMutation();

  /**
   * Parsează fișierul pentru a obține numărul de rânduri
   */
  const parseFileToGetCount = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const fileName = file.name.toLowerCase();
          
          if (fileName.endsWith('.csv')) {
            // Parse CSV - numără liniile (exclude header dacă există)
            const lines = text.split('\n').filter(line => line.trim().length > 0);
            // Prima linie este de obicei header
            const dataRows = lines.length > 1 ? lines.length - 1 : lines.length;
            resolve(dataRows);
          } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            // Pentru Excel, estimăm sau trimitem la backend
            // Estimare simplă bazată pe mărimea fișierului (aproximativ)
            // O linie Excel ocupă ~100-200 bytes în medie
            const estimatedRows = Math.max(1, Math.floor(file.size / 150));
            resolve(estimatedRows);
          } else {
            // Fallback
            resolve(0);
          }
        } catch (error) {
          console.error('Error parsing file:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Eroare la citirea fișierului'));
      };
      
      // Pentru Excel, citim doar primii bytes pentru estimare
      if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        // Pentru Excel, folosim estimare bazată pe mărime
        const estimatedRows = Math.max(1, Math.floor(file.size / 150));
        resolve(estimatedRows);
      } else {
        // Pentru CSV, citim tot fișierul
        reader.readAsText(file);
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportFile(file);
    setFileRowCount(null);
    
    if (file) {
      setParsingFile(true);
      try {
        const count = await parseFileToGetCount(file);
        setFileRowCount(count);
      } catch (error: any) {
        console.error('Error parsing file:', error);
        setAlert({ type: 'error', message: 'Eroare la parsarea fișierului' });
      } finally {
        setParsingFile(false);
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setAlert({ type: 'error', message: 'Selectează un fișier' });
      return;
    }

    if (!fileRowCount || fileRowCount === 0) {
      setAlert({ type: 'error', message: 'Fișierul nu conține date valide' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('entity_type', importFilters.entityType);
      formData.append('mode', importFilters.mode);
      formData.append('skip_first_row', String(importFilters.skipFirstRow ? 1 : 0));
      if (importFilters.locationId) {
        formData.append('location_id', String(importFilters.locationId));
      }

      await importMutation.mutate({
        url: `/api/import/${importType}`,
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setAlert({ type: 'success', message: `Import inițiat cu succes! ${fileRowCount} înregistrări detectate.` });
      setImportFile(null);
      setFileRowCount(null);
      refetchImport();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Eroare la import' });
    }
  };

  const handleExport = async () => {
    try {
      const filters = {
        format: exportFormat,
        dateFrom: undefined as string | undefined,
        dateTo: undefined as string | undefined,
        category: undefined as string | undefined,
      };
      
      await exportMutation.mutate({
        url: `/api/export/${exportType}`,
        method: 'POST',
        data: {
          format: exportFormat,
          filters_json: filters,
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
                onChange={handleFileChange}
              />
              {importFile && (
                <div className="file-info">
                  <p>📄 {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)</p>
                  {parsingFile ? (
                    <p className="text-muted">⏳ Se analizează fișierul...</p>
                  ) : fileRowCount !== null ? (
                    <p className="text-success">
                      ✅ {fileRowCount} {fileRowCount === 1 ? 'înregistrare' : 'înregistrări'} detectate
                    </p>
                  ) : null}
                </div>
              )}
            </div>
            
            {/* Filtre Import */}
            <div className="form-group">
              <label>Mod Import *</label>
              <select
                value={importFilters.mode}
                onChange={(e) => setImportFilters({ ...importFilters, mode: e.target.value as 'create' | 'update' | 'upsert' })}
              >
                <option value="create">Creează doar (skip dacă există)</option>
                <option value="update">Actualizează doar (skip dacă nu există)</option>
                <option value="upsert">Creează sau Actualizează</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={importFilters.skipFirstRow}
                  onChange={(e) => setImportFilters({ ...importFilters, skipFirstRow: e.target.checked })}
                />
                {' '}Sare prima linie (header)
              </label>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={handleImport} 
              disabled={!importFile || !fileRowCount || fileRowCount === 0 || parsingFile}
            >
              📥 Importă {fileRowCount ? `(${fileRowCount} înregistrări)` : ''}
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

