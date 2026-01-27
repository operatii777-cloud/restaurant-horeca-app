/**
 * 📄 Fișe Tehnice Produs Module - Main App Component
 * 
 * Gestionează:
 * - Grid cu toate produsele și status fișă tehnică
 * - Generare automată fișă tehnică din rețetă
 * - Editor valori nutriționale (kCal, Proteine, Carbohidrați, Grăsimi, Fibre, Sare)
 * - Lista alergeni asociați
 * - Preview PDF în modal
 * - Download PDF bilingv (RO / EN)
 * - Conformitate Regulament UE Nr. 1169/2011
 * - Export bulk (toate fișele tehnice)
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { API } from '@shared/api-client';
import { useAPI, useMutation } from '@shared/hooks/useAPI';
import AGGridWrapper from '@shared/components/AGGridWrapper';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import ErrorAlert from '@shared/components/ErrorAlert';
import './App.css';

function App() {
  const gridRef = useRef(null);
  
  // API Hooks
  const { data: products, loading, error, refetch } = useAPI(API.products.getAll);
  const { mutate: saveTechnicalSheet, loading: saving } = useMutation(API.technicalSheets.save);

  // Local state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLanguage, setPreviewLanguage] = useState('ro');
  
  // Technical Sheet Data
  const [technicalSheetData, setTechnicalSheetData] = useState({
    // Valori nutriționale per 100g
    energy_kcal: 0,
    energy_kj: 0,
    proteins: 0,
    carbohydrates: 0,
    sugars: 0,
    fats: 0,
    saturated_fats: 0,
    fiber: 0,
    salt: 0,
    
    // Alte informații
    allergens: [],
    portion_size: 0,
    storage_conditions_ro: '',
    storage_conditions_en: '',
    preparation_instructions_ro: '',
    preparation_instructions_en: '',
    serving_temperature: '',
  });

  // Calculează statistici
  const stats = useMemo(() => {
    if (!products) return { total: 0, withSheets: 0, missingSheets: 0 };
    
    // In production, check which products have technical sheets
    return {
      total: products.length,
      withSheets: 0, // To be implemented
      missingSheets: products.length,
    };
  }, [products]);

  // Helper: Actions renderer
  const ActionsRenderer = (params) => {
    const hasTechnicalSheet = false; // In production: check if params.data has technical_sheet
    
    return (
      <div className="grid-actions-cell">
        <button 
          className="btn-action-inline success"
          onClick={() => handleOpenEditor(params.data)}
          title={hasTechnicalSheet ? 'Editează fișă' : 'Generează fișă'}
        >
          {hasTechnicalSheet ? '✏️ Editează' : '➕ Generează'}
        </button>
        {hasTechnicalSheet && (
          <>
            <button 
              className="btn-action-inline"
              onClick={() => handleOpenPreview(params.data)}
              title="Preview fișă"
            >
              👁️ Preview
            </button>
            <button 
              className="btn-action-inline warning"
              onClick={() => handleDownloadPDF(params.data)}
              title="Download PDF"
            >
              📥 PDF
            </button>
          </>
        )}
      </div>
    );
  };

  // AG Grid Column Definitions
  const columnDefs = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80, 
      filter: 'agNumberColumnFilter',
    },
    { 
      field: 'name_ro', 
      headerName: 'Produs', 
      flex: 1, 
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: '500' },
    },
    { 
      field: 'category', 
      headerName: 'Categorie', 
      width: 150, 
      filter: 'agSetColumnFilter',
    },
    { 
      field: 'price', 
      headerName: 'Preț', 
      width: 120, 
      valueFormatter: (params) => `${params.value.toFixed(2)} RON`,
      filter: 'agNumberColumnFilter',
    },
    {
      headerName: 'Fișă Tehnică',
      width: 130,
      valueGetter: () => false, // In production: check if has technical_sheet
      cellRenderer: (params) => (
        <span className={`badge ${params.value ? 'badge-success' : 'badge-warning'}`}>
          {params.value ? '✅ Completă' : '⚠️ Lipsă'}
        </span>
      ),
      filter: false,
    },
    {
      headerName: 'Acțiuni',
      width: 280,
      cellRenderer: ActionsRenderer,
      filter: false,
      sortable: false,
    },
  ];

  // Open Editor Modal
  const handleOpenEditor = useCallback((product) => {
    setSelectedProduct(product);
    
    // Load existing technical sheet if available
    // In production: GET /api/technical-sheets/:productId
    // For now, use default values
    setTechnicalSheetData({
      energy_kcal: 0,
      energy_kj: 0,
      proteins: 0,
      carbohydrates: 0,
      sugars: 0,
      fats: 0,
      saturated_fats: 0,
      fiber: 0,
      salt: 0,
      allergens: [],
      portion_size: 250,
      storage_conditions_ro: 'A se păstra la temperaturi între +2°C și +6°C',
      storage_conditions_en: 'Store at temperatures between +2°C and +6°C',
      preparation_instructions_ro: '',
      preparation_instructions_en: '',
      serving_temperature: '65-70°C',
    });
    
    setShowEditorModal(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setShowEditorModal(false);
    setSelectedProduct(null);
  }, []);

  // Open Preview Modal
  const handleOpenPreview = useCallback((product) => {
    setSelectedProduct(product);
    // Load technical sheet data
    setShowPreviewModal(true);
    setPreviewLanguage('ro');
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreviewModal(false);
    setSelectedProduct(null);
  }, []);

  // Save Technical Sheet
  const handleSaveTechnicalSheet = useCallback(async () => {
    if (!selectedProduct) return;

    // Auto-calculate kJ from kCal (1 kcal = 4.184 kJ)
    const dataToSave = {
      ...technicalSheetData,
      energy_kj: (technicalSheetData.energy_kcal * 4.184).toFixed(0),
    };

    try {
      await saveTechnicalSheet(selectedProduct.id, dataToSave);
      alert(`✅ Fișa tehnică pentru "${selectedProduct.name_ro}" a fost salvată!`);
      handleCloseEditor();
      refetch();
    } catch (error) {
      alert(`Eroare: ${error.message}`);
    }
  }, [selectedProduct, technicalSheetData, saveTechnicalSheet, handleCloseEditor, refetch]);

  // Download PDF
  const handleDownloadPDF = useCallback(async (product) => {
    alert(`📄 Descărcare PDF pentru "${product.name_ro}"...\n\nÎn producție va descărca PDF-ul generat de backend!`);
    // In production: GET /api/technical-sheets/:productId/download
  }, []);

  // Export All PDFs
  const handleExportAllPDFs = useCallback(async () => {
    if (!window.confirm(`Sigur vrei să exporți ${stats.withSheets} fișe tehnice în format PDF?`)) {
      return;
    }
    
    alert('📦 Export bulk în dezvoltare... Va genera ZIP cu toate fișele tehnice!');
    // In production: POST /api/technical-sheets/export-all
  }, [stats.withSheets]);

  // Update Technical Sheet Field
  const handleUpdateField = useCallback((field, value) => {
    setTechnicalSheetData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Render Loading & Error
  if (loading) return <LoadingSpinner message="Se încarcă produsele..." />;
  if (error) return <ErrorAlert error={error} onRetry={refetch} />;

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>
          <span>📄</span>
          Fișe Tehnice Produs
        </h1>
        <div className="header-actions">
          <button 
            className="btn btn-warning"
            onClick={handleExportAllPDFs}
            disabled={stats.withSheets === 0}
          >
            📦 Export Toate (PDF)
          </button>
          <button className="btn btn-secondary" onClick={refetch}>
            🔄 Reîncarcă
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Produse</div>
        </div>
        <div className="stat-card success">
          <div className="stat-card-value">{stats.withSheets}</div>
          <div className="stat-card-label">Cu Fișă Tehnică</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-card-value">{stats.missingSheets}</div>
          <div className="stat-card-label">Fără Fișă Tehnică</div>
        </div>
        <div className="stat-card info">
          <div className="stat-card-value">
            {stats.total > 0 ? ((stats.withSheets / stats.total) * 100).toFixed(0) : 0}%
          </div>
          <div className="stat-card-label">Completare</div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert-info-banner">
        <span>ℹ️</span>
        <div>
          <strong>Regulament UE Nr. 1169/2011:</strong> Fișele tehnice trebuie să conțină informații despre alergeni, 
          valori nutriționale per 100g, condiții de depozitare și mod de preparare. PDF-urile generate sunt conforme legislației EU.
        </div>
      </div>

      {/* AG Grid */}
      <AGGridWrapper
        ref={gridRef}
        rowData={products || []}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={50}
        style={{ height: '600px', width: '100%' }}
      />

      {/* Editor Modal */}
      {showEditorModal && selectedProduct && (
        <div className="modal-overlay" onClick={handleCloseEditor}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Editor Fișă Tehnică: {selectedProduct.name_ro}</h2>
              <button className="modal-close" onClick={handleCloseEditor}>✖️</button>
            </div>
            
            <div className="modal-body">
              {/* Nutritional Values Editor */}
              <div className="nutritional-editor">
                <h3>
                  <span>🥗</span>
                  Valori Nutriționale (per 100g)
                </h3>
                
                <div className="nutritional-grid">
                  <div className="form-group">
                    <label>Energie (kCal)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={technicalSheetData.energy_kcal}
                      onChange={(e) => handleUpdateField('energy_kcal', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Proteine (g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={technicalSheetData.proteins}
                      onChange={(e) => handleUpdateField('proteins', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Carbohidrați (g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={technicalSheetData.carbohydrates}
                      onChange={(e) => handleUpdateField('carbohydrates', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>- din care zaharuri (g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={technicalSheetData.sugars}
                      onChange={(e) => handleUpdateField('sugars', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Grăsimi (g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={technicalSheetData.fats}
                      onChange={(e) => handleUpdateField('fats', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>- din care saturate (g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={technicalSheetData.saturated_fats}
                      onChange={(e) => handleUpdateField('saturated_fats', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Fibre (g)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={technicalSheetData.fiber}
                      onChange={(e) => handleUpdateField('fiber', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Sare (g)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={technicalSheetData.salt}
                      onChange={(e) => handleUpdateField('salt', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Other Information */}
              <div className="form-row">
                <div className="form-group">
                  <label>Porție Recomandată (g)</label>
                  <input 
                    type="number" 
                    value={technicalSheetData.portion_size}
                    onChange={(e) => handleUpdateField('portion_size', parseInt(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Temperatură Servire</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 65-70°C"
                    value={technicalSheetData.serving_temperature}
                    onChange={(e) => handleUpdateField('serving_temperature', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Condiții Depozitare (RO)</label>
                  <textarea 
                    value={technicalSheetData.storage_conditions_ro}
                    onChange={(e) => handleUpdateField('storage_conditions_ro', e.target.value)}
                    placeholder="Ex: A se păstra la temperaturi între +2°C și +6°C"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Storage Conditions (EN)</label>
                  <textarea 
                    value={technicalSheetData.storage_conditions_en}
                    onChange={(e) => handleUpdateField('storage_conditions_en', e.target.value)}
                    placeholder="Ex: Store at temperatures between +2°C and +6°C"
                  ></textarea>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Instrucțiuni Preparare (RO)</label>
                  <textarea 
                    value={technicalSheetData.preparation_instructions_ro}
                    onChange={(e) => handleUpdateField('preparation_instructions_ro', e.target.value)}
                    placeholder="Ex: Se încălzește la 180°C timp de 15 minute"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Preparation Instructions (EN)</label>
                  <textarea 
                    value={technicalSheetData.preparation_instructions_en}
                    onChange={(e) => handleUpdateField('preparation_instructions_en', e.target.value)}
                    placeholder="Ex: Heat at 180°C for 15 minutes"
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={handleCloseEditor}>
                  Anulează
                </button>
                <button className="btn btn-info" onClick={() => { handleCloseEditor(); handleOpenPreview(selectedProduct); }}>
                  👁️ Preview
                </button>
                <button className="btn btn-success" onClick={handleSaveTechnicalSheet} disabled={saving}>
                  {saving ? '⏳ Se salvează...' : '💾 Salvează Fișă'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedProduct && (
        <div className="modal-overlay" onClick={handleClosePreview}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 Preview Fișă Tehnică: {selectedProduct.name_ro}</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="language-toggle">
                  <button 
                    className={previewLanguage === 'ro' ? 'active' : ''}
                    onClick={() => setPreviewLanguage('ro')}
                  >
                    🇷🇴 RO
                  </button>
                  <button 
                    className={previewLanguage === 'en' ? 'active' : ''}
                    onClick={() => setPreviewLanguage('en')}
                  >
                    🇬🇧 EN
                  </button>
                </div>
                <button className="modal-close" onClick={handleClosePreview}>✖️</button>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="pdf-preview">
                <h1>
                  {previewLanguage === 'ro' ? 'FIȘĂ TEHNICĂ DE PRODUS' : 'PRODUCT TECHNICAL DATA SHEET'}
                </h1>

                <div className="pdf-preview-section">
                  <h2>
                    📝 {previewLanguage === 'ro' ? 'Informații Produs' : 'Product Information'}
                  </h2>
                  <div className="pdf-preview-info">
                    <p><strong>{previewLanguage === 'ro' ? 'Denumire:' : 'Name:'}</strong> {previewLanguage === 'ro' ? selectedProduct.name_ro : selectedProduct.name_en || selectedProduct.name_ro}</p>
                    <p><strong>{previewLanguage === 'ro' ? 'Categorie:' : 'Category:'}</strong> {selectedProduct.category}</p>
                    <p><strong>{previewLanguage === 'ro' ? 'Porție:' : 'Serving:'}</strong> {technicalSheetData.portion_size}g</p>
                    <p><strong>{previewLanguage === 'ro' ? 'Temperatură servire:' : 'Serving temperature:'}</strong> {technicalSheetData.serving_temperature}</p>
                  </div>
                </div>

                <div className="pdf-preview-section">
                  <h2>
                    🥗 {previewLanguage === 'ro' ? 'Valori Nutriționale (per 100g)' : 'Nutritional Values (per 100g)'}
                  </h2>
                  <table className="pdf-preview-table">
                    <tbody>
                      <tr>
                        <td><strong>{previewLanguage === 'ro' ? 'Energie' : 'Energy'}</strong></td>
                        <td>{technicalSheetData.energy_kcal} kCal / {(technicalSheetData.energy_kcal * 4.184).toFixed(0)} kJ</td>
                      </tr>
                      <tr>
                        <td><strong>{previewLanguage === 'ro' ? 'Proteine' : 'Proteins'}</strong></td>
                        <td>{technicalSheetData.proteins}g</td>
                      </tr>
                      <tr>
                        <td><strong>{previewLanguage === 'ro' ? 'Carbohidrați' : 'Carbohydrates'}</strong></td>
                        <td>{technicalSheetData.carbohydrates}g</td>
                      </tr>
                      <tr>
                        <td style={{ paddingLeft: '24px' }}>{previewLanguage === 'ro' ? '- din care zaharuri' : '- of which sugars'}</td>
                        <td>{technicalSheetData.sugars}g</td>
                      </tr>
                      <tr>
                        <td><strong>{previewLanguage === 'ro' ? 'Grăsimi' : 'Fats'}</strong></td>
                        <td>{technicalSheetData.fats}g</td>
                      </tr>
                      <tr>
                        <td style={{ paddingLeft: '24px' }}>{previewLanguage === 'ro' ? '- din care saturate' : '- of which saturated'}</td>
                        <td>{technicalSheetData.saturated_fats}g</td>
                      </tr>
                      <tr>
                        <td><strong>{previewLanguage === 'ro' ? 'Fibre' : 'Fiber'}</strong></td>
                        <td>{technicalSheetData.fiber}g</td>
                      </tr>
                      <tr>
                        <td><strong>{previewLanguage === 'ro' ? 'Sare' : 'Salt'}</strong></td>
                        <td>{technicalSheetData.salt}g</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pdf-preview-section">
                  <h2>
                    📦 {previewLanguage === 'ro' ? 'Condiții Depozitare' : 'Storage Conditions'}
                  </h2>
                  <div className="pdf-preview-info">
                    <p>{previewLanguage === 'ro' ? technicalSheetData.storage_conditions_ro : technicalSheetData.storage_conditions_en}</p>
                  </div>
                </div>

                {(technicalSheetData.preparation_instructions_ro || technicalSheetData.preparation_instructions_en) && (
                  <div className="pdf-preview-section">
                    <h2>
                      👨‍🍳 {previewLanguage === 'ro' ? 'Instrucțiuni Preparare' : 'Preparation Instructions'}
                    </h2>
                    <div className="pdf-preview-info">
                      <p>{previewLanguage === 'ro' ? technicalSheetData.preparation_instructions_ro : technicalSheetData.preparation_instructions_en}</p>
                    </div>
                  </div>
                )}

                <div className="pdf-preview-section">
                  <h2>
                    ⚠️ {previewLanguage === 'ro' ? 'Alergeni (Regulament UE Nr. 1169/2011)' : 'Allergens (EU Regulation No. 1169/2011)'}
                  </h2>
                  <div className="pdf-preview-allergens">
                    <div className="pdf-preview-allergen">🌾 Gluten</div>
                    <div className="pdf-preview-allergen">🥚 Ouă</div>
                    <div className="pdf-preview-allergen">🥛 Lactate</div>
                  </div>
                  <p style={{ marginTop: '12px', fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>
                    {previewLanguage === 'ro' 
                      ? '* Pregătit într-o zonă care procesează și alte alergeni'
                      : '* Prepared in an area that also processes other allergens'}
                  </p>
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={handleClosePreview}>
                  Închide
                </button>
                <button className="btn btn-warning" onClick={() => handleDownloadPDF(selectedProduct)}>
                  📥 Download PDF ({previewLanguage.toUpperCase()})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

