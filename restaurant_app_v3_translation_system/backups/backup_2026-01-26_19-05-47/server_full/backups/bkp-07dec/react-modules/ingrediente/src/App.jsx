/**
 * 🥕 Ingrediente Module - Main App Component (UPDATED)
 * 
 * Gestionează:
 * - Listare ingrediente cu AG Grid (TOATE coloanele)
 * - CRUD operații complete (inclusiv date nutriționale)
 * - Modal de editare complet (ca în admin.html)
 * - Filtrare și sortare
 * - Export CSV
 * - Statistici (total, active, hidden, low stock)
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
  const { data: ingredients, loading, error, refetch } = useAPI(API.ingredients.getAll);
  const { mutate: updateIngredient, loading: updating } = useMutation(API.ingredients.update);
  const { mutate: createIngredient, loading: creating } = useMutation(API.ingredients.create);
  const { mutate: deleteIngredient, loading: deleting } = useMutation(API.ingredients.delete);
  const { mutate: hideIngredient, loading: hiding } = useMutation(API.ingredients.hide);

  // Local state
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    name_en: '',
    category: 'Legume',
    unit: 'kg',
    current_stock: 0,
    min_stock: 0,
    cost_per_unit: 0,
    supplier: '',
  });

  // Calculează statistici
  const stats = useMemo(() => {
    if (!ingredients) return { total: 0, active: 0, hidden: 0, lowStock: 0 };
    
    return {
      total: ingredients.length,
      active: ingredients.filter(i => i.is_hidden === 0).length,
      hidden: ingredients.filter(i => i.is_hidden === 1).length,
      lowStock: ingredients.filter(i => 
        i.current_stock !== null && 
        i.min_stock !== null && 
        i.current_stock < i.min_stock
      ).length,
    };
  }, [ingredients]);

  // ❌ REMOVED - duplică call-ul din onGridReady
  // useEffect hook-ul forța sizeColumnsToFit dar ag-Grid încă avea zero width
  // onGridReady este locul corect pentru sizeColumnsToFit()

  // AG Grid Column Definitions - TOATE coloanele (cu flex pentru responsive)
  const columnDefs = [
    { 
      field: 'id', 
      headerName: 'ID', 
      flex: 0.5,              // ✅ Proporție relativă (cel mai îngust)
      minWidth: 70,
      maxWidth: 100,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      pinned: 'left',
    },
    { 
      field: 'name', 
      headerName: '🥕 Nume', 
      flex: 2,                // ✅ Cel mai lat - coloana cea mai importantă
      minWidth: 150,
      filter: 'agTextColumnFilter',
      pinned: 'left',
      cellStyle: { fontWeight: 'bold' },
    },
    { 
      field: 'category', 
      headerName: '📁 Categorie', 
      flex: 1.2,              // ✅ Mai lat decât media
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
    { 
      field: 'unit', 
      headerName: '📏 Unit', 
      flex: 0.6,              // ✅ Mai îngust
      minWidth: 80,
      maxWidth: 100,
    },
    { 
      field: 'current_stock', 
      headerName: '📦 Stoc', 
      flex: 0.8,              // ✅ Proporțional
      minWidth: 100,
      maxWidth: 120,
      valueFormatter: (params) => params.value ? `${params.value} ${params.data.unit || ''}` : '-',
      filter: 'agNumberColumnFilter',
      cellStyle: (params) => {
        if (!params.data.min_stock || !params.value) return {};
        return params.value < params.data.min_stock 
          ? { backgroundColor: '#fee', color: '#c00', fontWeight: 'bold' }
          : {};
      },
    },
    { 
      field: 'min_stock', 
      headerName: '⚠️ Min', 
      flex: 0.8,              // ✅ Proporțional
      minWidth: 100,
      maxWidth: 120,
      valueFormatter: (params) => params.value ? `${params.value} ${params.data.unit || ''}` : '-',
    },
    { 
      field: 'cost_per_unit', 
      headerName: '💰 Cost/Unit', 
      flex: 1,                // ✅ Width mediu
      minWidth: 100,
      valueFormatter: (params) => params.value ? `${params.value} RON` : '-',
      filter: 'agNumberColumnFilter',
    },
    { 
      field: 'supplier', 
      headerName: '🏭 Furnizor', 
      flex: 1.2,              // ✅ Mai lat
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
    // DATE NUTRIȚIONALE
    { 
      field: 'energy_kcal', 
      headerName: '⚡ Energie (kcal)', 
      flex: 0.8,              // ✅ Proporțional
      minWidth: 100,
      maxWidth: 130,
      filter: 'agNumberColumnFilter',
      cellStyle: (params) => ({
        backgroundColor: params.value > 0 ? '#e8f5e9' : '#fff',
        fontWeight: params.value > 0 ? 'bold' : 'normal',
      }),
    },
    { 
      field: 'protein', 
      headerName: '🥩 Proteine (g)', 
      flex: 0.8,              // ✅ Proporțional
      minWidth: 100,
      maxWidth: 130,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value ? `${params.value} g` : '-',
    },
    { 
      field: 'carbs', 
      headerName: '🍞 Carbohidrați (g)', 
      flex: 1,                // ✅ Mai lat pentru text lung
      minWidth: 120,
      maxWidth: 150,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value ? `${params.value} g` : '-',
    },
    { 
      field: 'fat', 
      headerName: '🧈 Grăsimi (g)', 
      flex: 0.8,              // ✅ Proporțional
      minWidth: 100,
      maxWidth: 130,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value ? `${params.value} g` : '-',
    },
    { 
      field: 'fiber', 
      headerName: '🌾 Fibre (g)', 
      flex: 0.8,              // ✅ Proporțional
      minWidth: 100,
      maxWidth: 120,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value ? `${params.value} g` : '-',
    },
    { 
      field: 'salt', 
      headerName: '🧂 Sare (g)', 
      flex: 0.8,              // ✅ Proporțional
      minWidth: 100,
      maxWidth: 120,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value ? `${params.value} g` : '-',
    },
    { 
      field: 'allergens', 
      headerName: '⚠️ Alergeni', 
      flex: 1.5,              // ✅ Mai lat pentru alergeni multipli
      minWidth: 150,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        try {
          const list = JSON.parse(params.value);
          return Array.isArray(list) ? list.join(', ') : '-';
        } catch {
          return params.value || '-';
        }
      },
    },
    { 
      field: 'is_hidden', 
      headerName: '👁️ Status', 
      flex: 0.8,              // ✅ Proporțional
      minWidth: 100,
      maxWidth: 120,
      valueFormatter: (params) => params.value === 1 ? '🚫 Ascuns' : '✅ Activ',
      cellStyle: (params) => ({
        color: params.value === 1 ? '#e74c3c' : '#27ae60',
        fontWeight: 'bold',
      }),
    },
    {
      headerName: '⚙️ Acțiuni',
      flex: 1,                // ✅ Width mediu
      minWidth: 150,
      maxWidth: 180,
      pinned: 'right',
      resizable: false,       // ✅ Nu permite resize pe acțiuni
      cellRenderer: (params) => {
        return (
          <div style={{ display: 'flex', gap: '5px', paddingTop: '5px' }}>
            <button
              className="btn-icon btn-primary"
              onClick={() => handleEditClick(params.data)}
              title="Editează"
            >
              ✏️
            </button>
            <button
              className="btn-icon btn-warning"
              onClick={() => handleHideIngredient(params.data.id, params.data.name)}
              title="Ascunde"
            >
              👻
            </button>
            <button
              className="btn-icon btn-danger"
              onClick={() => handleDeleteIngredient(params.data.id, params.data.name)}
              title="Șterge"
            >
              🗑️
            </button>
          </div>
        );
      },
    },
  ];

  // Handle Edit Click - deschide modal
  const handleEditClick = useCallback((ingredient) => {
    console.log('📝 Opening edit modal for:', ingredient.name);
    setEditingIngredient({
      ...ingredient,
      allergens: ingredient.allergens || '[]',
      additives: ingredient.additives || '[]',
      potential_allergens: ingredient.potential_allergens || '[]',
    });
    setIsEditModalOpen(true);
  }, []);

  // Handle Edit Submit
  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!editingIngredient || !editingIngredient.id) return;
    
    try {
      console.log('📤 Submitting ingredient update:', editingIngredient.id);
      
      // Parsează JSON fields
      const payload = {
        ...editingIngredient,
        allergens: editingIngredient.allergens || null,
        additives: editingIngredient.additives || null,
        potential_allergens: editingIngredient.potential_allergens || null,
      };
      
      await updateIngredient(editingIngredient.id, payload);
      
      console.log('✅ Ingredient actualizat cu succes!');
      setIsEditModalOpen(false);
      setEditingIngredient(null);
      refetch(); // Refresh data
    } catch (error) {
      console.error('❌ Eroare la actualizare:', error);
      alert(`Eroare: ${error.message}`);
    }
  }, [editingIngredient, updateIngredient, refetch]);

  // Handle selection change
  const onSelectionChanged = useCallback((event) => {
    const selected = event.api.getSelectedRows();
    setSelectedRows(selected);
    console.log(`✅ Selected ${selected.length} ingrediente`);
  }, []);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `ingrediente_export_${new Date().toISOString().split('T')[0]}.csv`,
      });
      console.log('📥 CSV Export complet!');
    }
  }, []);

  // Add new ingredient - Open modal
  const handleAddIngredient = useCallback(() => {
    setNewIngredient({ 
      name: '', 
      name_en: '', 
      category: 'Legume',
      unit: 'kg',
      current_stock: 0,
      min_stock: 0,
      cost_per_unit: 0,
      supplier: '',
    });
    setIsModalOpen(true);
  }, []);

  // Submit new ingredient
  const handleSubmitNewIngredient = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newIngredient.name.trim()) {
      alert('Denumirea este obligatorie');
      return;
    }

    try {
      await createIngredient({
        ...newIngredient,
        name_en: newIngredient.name_en || newIngredient.name,
        is_hidden: 0,
      });
      
      console.log('✅ Ingredient adăugat cu succes!');
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      alert(`Eroare la adăugare: ${error.message}`);
    }
  }, [newIngredient, createIngredient, refetch]);

  // Delete selected ingredients
  const handleDeleteSelected = useCallback(async () => {
    if (selectedRows.length === 0) {
      alert('Selectează cel puțin un ingredient pentru a șterge');
      return;
    }

    const confirm = window.confirm(
      `Sigur vrei să ștergi ${selectedRows.length} ingrediente selectate?`
    );
    if (!confirm) return;

    try {
      for (const row of selectedRows) {
        await deleteIngredient(row.id);
      }
      
      console.log(`✅ ${selectedRows.length} ingrediente șterse!`);
      setSelectedRows([]);
      refetch();
    } catch (error) {
      alert(`Eroare la ștergere: ${error.message}`);
    }
  }, [selectedRows, deleteIngredient, refetch]);

  // Hide ingredient
  const handleHideIngredient = useCallback(async (id, name) => {
    const confirm = window.confirm(
      `Sigur vrei să ascunzi ingredientul "${name}"?\n\nAcesta va fi marcat ca NEINVENTARIABIL.`
    );
    if (!confirm) return;

    try {
      await hideIngredient(id);
      console.log(`✅ Ingredient "${name}" ascuns!`);
      refetch();
    } catch (error) {
      alert(`Eroare la ascundere: ${error.message}`);
    }
  }, [hideIngredient, refetch]);

  // Delete single ingredient
  const handleDeleteIngredient = useCallback(async (id, name) => {
    const confirm = window.confirm(
      `Sigur vrei să ștergi ingredientul "${name}"?\n\nAceastă acțiune nu poate fi anulată.`
    );
    if (!confirm) return;

    try {
      await deleteIngredient(id);
      console.log(`✅ Ingredient "${name}" șters!`);
      refetch();
    } catch (error) {
      alert(`Eroare la ștergere: ${error.message}`);
    }
  }, [deleteIngredient, refetch]);

  // Render
  if (loading) return <LoadingSpinner message="Se încarcă ingredientele..." />;
  if (error) return <ErrorAlert error={error} onRetry={refetch} />;

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>🥕 Gestionare Ingrediente</h1>
        <div className="header-actions">
          <button 
            className="btn btn-success" 
            onClick={handleAddIngredient}
            disabled={creating}
          >
            ➕ Adaugă Ingredient
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleDeleteSelected}
            disabled={deleting || selectedRows.length === 0}
          >
            🗑️ Șterge Selectate ({selectedRows.length})
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleExportCSV}
          >
            📥 Export CSV
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={refetch}
          >
            🔄 Reîncarcă
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Ingrediente</div>
        </div>
        <div className="stat-card success">
          <div className="stat-card-value">{stats.active}</div>
          <div className="stat-card-label">Active</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-card-value">{stats.hidden}</div>
          <div className="stat-card-label">Ascunse</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-card-value">{stats.lowStock}</div>
          <div className="stat-card-label">Stoc Scăzut</div>
        </div>
      </div>

      {/* AG Grid */}
      <AGGridWrapper
        ref={gridRef}
        rowData={ingredients}
        columnDefs={columnDefs}
        onSelectionChanged={onSelectionChanged}
        pagination={true}
        paginationPageSize={50}
        suppressSizeToFit={false} // ✅ Permite auto-fit
        
        // ✅ defaultColDef cu flex pentru responsive columns
        defaultColDef={{
          flex: 1,              // ✅ Proporțional width (default)
          minWidth: 100,        // ✅ Width minim pentru lizibilitate
          resizable: true,      // ✅ Permite drag manual pe header
          sortable: true,
          filter: true,
        }}
        
        // ✅ Custom onGridReady cu ResizeObserver + safe sizeColumnsToFit
        onGridReady={(params) => {
          // Salvează API reference pentru debugging
          window.gridApi = params.api;
          window.columnApi = params.columnApi;
          
          // ✅ Helper function - safe sizeColumnsToFit cu verificare width
          const safeSizeColumnsToFit = () => {
            const gridElement = document.querySelector('.ag-theme-alpine');
            const width = gridElement?.offsetWidth || 0;
            
            if (width > 0) {
              console.log(`🔧 Grid Ready - Applying sizeColumnsToFit (width: ${width}px)...`);
              params.api.sizeColumnsToFit();
              return true;
            } else {
              console.warn(`⚠️ Grid has zero width (${width}px), skipping sizeColumnsToFit`);
              return false;
            }
          };
          
          // Încearcă imediat
          if (!safeSizeColumnsToFit()) {
            // Dacă zero width, retry după 100ms
            setTimeout(() => {
              if (!safeSizeColumnsToFit()) {
                // Dacă tot zero, retry final după 500ms
                setTimeout(safeSizeColumnsToFit, 500);
              }
            }, 100);
          }
          
          // ✅ ResizeObserver pentru container resize
          const resizeObserver = new ResizeObserver(() => {
            const width = document.querySelector('.ag-theme-alpine')?.offsetWidth || 0;
            if (width > 0) {
              console.log('📐 Container resized - re-fitting columns...');
              params.api.sizeColumnsToFit();
            }
          });
          
          const gridElement = document.querySelector('.ag-theme-alpine');
          if (gridElement) {
            resizeObserver.observe(gridElement);
          }
          
          // ✅ Window resize listener
          const handleResize = () => {
            setTimeout(() => {
              const width = document.querySelector('.ag-theme-alpine')?.offsetWidth || 0;
              if (width > 0) {
                params.api.sizeColumnsToFit();
              }
            }, 100);
          };
          window.addEventListener('resize', handleResize);
        }}
        
        style={{ height: '600px', width: '100%' }}
      />

      {/* Modal Adăugare Ingredient */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adaugă Ingredient Nou</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitNewIngredient}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Denumire RO *</label>
                  <input
                    type="text"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Denumire EN</label>
                  <input
                    type="text"
                    value={newIngredient.name_en}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name_en: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Categorie</label>
                    <select
                      value={newIngredient.category}
                      onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                    >
                      <option value="Legume">Legume</option>
                      <option value="Fructe">Fructe</option>
                      <option value="Carne">Carne</option>
                      <option value="Pește">Pește</option>
                      <option value="Lactate">Lactate</option>
                      <option value="Condimente">Condimente</option>
                      <option value="Băuturi">Băuturi</option>
                      <option value="Altele">Altele</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Unitate</label>
                    <select
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="l">l</option>
                      <option value="ml">ml</option>
                      <option value="buc">buc</option>
                      <option value="cutie">cutie</option>
                      <option value="pachet">pachet</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Anulează
                </button>
                <button type="submit" className="btn btn-success" disabled={creating}>
                  {creating ? 'Se adaugă...' : 'Adaugă'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editare Ingredient COMPLET */}
      {isEditModalOpen && editingIngredient && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editează Ingredient: {editingIngredient.name}</h2>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body modal-scroll">
                {/* Date de bază */}
                <h3 className="section-title">📋 Date de Bază</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nume Ingredient *</label>
                    <input
                      type="text"
                      value={editingIngredient.name || ''}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nume EN</label>
                    <input
                      type="text"
                      value={editingIngredient.name_en || ''}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, name_en: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Categorie</label>
                    <select
                      value={editingIngredient.category || 'Legume'}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, category: e.target.value })}
                    >
                      <option value="Legume">Legume</option>
                      <option value="Fructe">Fructe</option>
                      <option value="Carne">Carne</option>
                      <option value="Pește">Pește</option>
                      <option value="Lactate">Lactate</option>
                      <option value="Condimente">Condimente</option>
                      <option value="Băuturi">Băuturi</option>
                      <option value="Altele">Altele</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Unitate</label>
                    <select
                      value={editingIngredient.unit || 'kg'}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, unit: e.target.value })}
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="l">l</option>
                      <option value="ml">ml</option>
                      <option value="buc">buc</option>
                      <option value="cutie">cutie</option>
                      <option value="pachet">pachet</option>
                    </select>
                  </div>
                </div>

                {/* Stocuri */}
                <h3 className="section-title">📦 Stocuri</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Stoc Curent</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingIngredient.current_stock || 0}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, current_stock: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Stoc Minim</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingIngredient.min_stock || 0}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, min_stock: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Cost și furnizor */}
                <h3 className="section-title">💰 Cost și Furnizor</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cost per Unitate (RON)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingIngredient.cost_per_unit || 0}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, cost_per_unit: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Furnizor</label>
                    <input
                      type="text"
                      value={editingIngredient.supplier || ''}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, supplier: e.target.value })}
                    />
                  </div>
                </div>

                {/* Date nutriționale */}
                <h3 className="section-title">📊 Date Nutriționale (per 100g/100ml)</h3>
                <div className="form-group">
                  <label>Descriere</label>
                  <input
                    type="text"
                    value={editingIngredient.description || ''}
                    onChange={(e) => setEditingIngredient({ ...editingIngredient, description: e.target.value })}
                    placeholder="ex: Brânză telemea de vacă"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>⚡ Energie (kcal)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingIngredient.energy_kcal || 0}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, energy_kcal: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>🥩 Proteine (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingIngredient.protein || 0}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, protein: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>🍞 Carbohidrați (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingIngredient.carbs || 0}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, carbs: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>🍬 Zaharuri (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingIngredient.sugars || 0}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, sugars: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>🧈 Grăsimi (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingIngredient.fat || 0}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, fat: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>🥓 Grăsimi saturate (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingIngredient.saturated_fat || 0}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, saturated_fat: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>🌾 Fibre (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingIngredient.fiber || 0}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, fiber: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>🧂 Sare (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingIngredient.salt || 0}
                      onChange={(e) => setEditingIngredient({ ...editingIngredient, salt: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Alergeni */}
                <h3 className="section-title">⚠️ Alergeni și Aditivi</h3>
                <div className="form-group">
                  <label>Alergeni (JSON)</label>
                  <textarea
                    rows="2"
                    value={editingIngredient.allergens || '[]'}
                    onChange={(e) => setEditingIngredient({ ...editingIngredient, allergens: e.target.value })}
                    placeholder='["lapte", "ou"]'
                  />
                  <small>Format: ["alergen1", "alergen2"]</small>
                </div>

                <div className="form-group">
                  <label>Aditivi (JSON)</label>
                  <textarea
                    rows="2"
                    value={editingIngredient.additives || '[]'}
                    onChange={(e) => setEditingIngredient({ ...editingIngredient, additives: e.target.value })}
                    placeholder='["E330", "E202"]'
                  />
                  <small>Format: ["E330", "E202"]</small>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Anulează
                </button>
                <button type="submit" className="btn btn-success" disabled={updating}>
                  {updating ? 'Se salvează...' : '💾 Salvează'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
