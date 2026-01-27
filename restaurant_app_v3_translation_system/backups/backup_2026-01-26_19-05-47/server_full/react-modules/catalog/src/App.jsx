/**
 * 🎫 Catalog Produse Module - MODERN Layout
 * 
 * Layout MODERN cu:
 * - Panel lateral categorii (arborescent)
 * - Toolbar complet cu butoane acțiune
 * - Tabel complet cu toate coloanele
 * - Editare inline și bulk
 * - Export, clonare, ștergere
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
  const { data: allProducts, loading, error, refetch } = useAPI(API.products.getAll);
  const { data: categories, loading: loadingCategories } = useAPI(API.categories.getTree);
  const { mutate: updateProduct, loading: updating } = useMutation(API.products.update);
  const { mutate: createProduct, loading: creating } = useMutation(API.products.create);
  const { mutate: deleteProduct, loading: deleting } = useMutation(API.products.delete);

  // Local state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryAction, setCategoryAction] = useState(null); // 'add', 'edit', 'delete', 'order', 'clone'

  // Filter products based on selected category, active status, and search
  const products = useMemo(() => {
    if (!allProducts) return [];
    
    let filtered = [...allProducts];
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Filter by active status
    if (showOnlyActive) {
      filtered = filtered.filter(p => p.is_active === 1);
    }
    
    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(search)) ||
        (p.name_en && p.name_en.toLowerCase().includes(search)) ||
        (p.category && p.category.toLowerCase().includes(search))
      );
    }
    
    return filtered;
  }, [allProducts, selectedCategory, showOnlyActive, searchText]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!allProducts) return { total: 0, active: 0, inactive: 0, avgPrice: 0 };
    
    const active = allProducts.filter(p => p.is_active === 1).length;
    const inactive = allProducts.filter(p => p.is_active === 0).length;
    const avgPrice = allProducts.length > 0 
      ? (allProducts.reduce((sum, p) => sum + (p.price || 0), 0) / allProducts.length).toFixed(2)
      : 0;
    
    return {
      total: allProducts.length,
      active,
      inactive,
      avgPrice,
    };
  }, [allProducts]);

  // Get unique categories from products (flat list)
  const flatCategories = useMemo(() => {
    if (!allProducts) return [];
    const cats = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [allProducts]);

  // Checkbox renderer
  const CheckboxRenderer = (params) => {
    const isChecked = params.value === 1 || params.value === true;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <input 
          type="checkbox" 
          checked={isChecked}
          onChange={() => {
            const newValue = isChecked ? 0 : 1;
            updateProduct(params.data.id, { [params.colDef.field]: newValue })
              .then(() => refetch())
              .catch(err => alert(`Eroare: ${err.message}`));
          }}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
      </div>
    );
  };

  // AG Grid Column Definitions (MODERN STYLE)
  const columnDefs = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70, 
      checkboxSelection: true,
      headerCheckboxSelection: true,
      filter: 'agNumberColumnFilter',
      pinned: 'left',
    },
    { 
      field: 'name', 
      headerName: 'Nume', 
      flex: 1,
      minWidth: 200,
      editable: true,
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: '500' },
    },
    { 
      field: 'price', 
      headerName: 'Preț unitar cu TVA', 
      width: 150, 
      editable: true,
      valueFormatter: (params) => `${(params.value || 0).toFixed(2)} RON`,
      filter: 'agNumberColumnFilter',
      cellStyle: { fontWeight: '600', color: '#27ae60' },
    },
    { 
      field: 'vat_rate', 
      headerName: 'Cotă TVA', 
      width: 100, 
      editable: true,
      valueFormatter: (params) => `${params.value || 24}%`,
      filter: 'agNumberColumnFilter',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [9, 11, 21, 24],
      },
    },
    { 
      field: 'unit', 
      headerName: 'U.M.', 
      width: 90, 
      editable: true,
      filter: 'agSetColumnFilter',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['buc', 'kg', 'l', 'gr', 'ml', 'port'],
      },
    },
    { 
      field: 'category', 
      headerName: 'Categorie', 
      width: 150, 
      editable: true,
      filter: 'agSetColumnFilter',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: flatCategories,
      },
    },
    { 
      field: 'stock_management', 
      headerName: 'Gestiune', 
      width: 120, 
      editable: true,
      filter: 'agSetColumnFilter',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Bar', 'Bucătărie', 'Livrare'],
      },
    },
    { 
      field: 'preparation_section', 
      headerName: 'Secție de preparare', 
      width: 160, 
      editable: true,
      filter: 'agSetColumnFilter',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['BAR', 'BUCĂTĂRIE CALDĂ', 'BUCĂTĂRIE RECE', 'PIZZERIE'],
      },
    },
    { 
      field: 'is_sellable', 
      headerName: 'La vânzare', 
      width: 110, 
      cellRenderer: CheckboxRenderer,
      filter: false,
      sortable: true,
    },
    { 
      field: 'has_recipe', 
      headerName: 'Are rețetă', 
      width: 110, 
      cellRenderer: CheckboxRenderer,
      filter: false,
      sortable: true,
    },
    { 
      field: 'is_fraction', 
      headerName: 'Fracționabil', 
      width: 120, 
      cellRenderer: CheckboxRenderer,
      filter: false,
      sortable: true,
    },
  ];

  // Handle cell value changed (editare inline)
  const onCellValueChanged = useCallback(async (event) => {
    const updatedProduct = event.data;
    const field = event.colDef.field;
    const newValue = event.newValue;
    const oldValue = event.oldValue;

    if (newValue === oldValue) return;

    console.log(`✏️ Editare: ${updatedProduct.name} - ${field}: ${oldValue} → ${newValue}`);

    try {
      await updateProduct(updatedProduct.id, { [field]: newValue });
      console.log(`✅ Produs actualizat: ${updatedProduct.name}`);
      refetch();
    } catch (error) {
      console.error('Eroare la actualizare:', error);
      alert(`Eroare: ${error.message}`);
      // Revert change
      event.node.setDataValue(field, oldValue);
    }
  }, [updateProduct, refetch]);

  // Handle selection change
  const onSelectionChanged = useCallback((event) => {
    const selected = event.api.getSelectedRows();
    setSelectedRows(selected);
    console.log(`✅ Selectate ${selected.length} produse`);
  }, []);

  // =============== TOOLBAR ACTIONS ===============

  // Reload
  const handleReload = useCallback(() => {
    refetch();
  }, [refetch]);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `catalog_produse_${new Date().toISOString().split('T')[0]}.csv`,
        columnKeys: ['id', 'name', 'price', 'vat_rate', 'unit', 'category', 'stock_management', 'preparation_section'],
      });
      console.log('📥 CSV Export complet!');
    }
  }, []);

  // Add product
  const handleAdd = useCallback(() => {
    setCurrentProduct(null);
    setShowAddModal(true);
  }, []);

  // Edit product
  const handleEdit = useCallback(() => {
    if (selectedRows.length === 0) {
      alert('Selectează un produs pentru a-l modifica!');
      return;
    }
    if (selectedRows.length > 1) {
      alert('Selectează un singur produs!');
      return;
    }
    setCurrentProduct(selectedRows[0]);
    setShowEditModal(true);
  }, [selectedRows]);

  // Delete product(s)
  const handleDelete = useCallback(async () => {
    if (selectedRows.length === 0) {
      alert('Selectează cel puțin un produs pentru ștergere!');
      return;
    }

    const productNames = selectedRows.map(p => p.name).join(', ');
    if (!window.confirm(`Sigur vrei să ștergi ${selectedRows.length} produs(e)?\n\n${productNames}`)) {
      return;
    }

    try {
      for (const product of selectedRows) {
        await deleteProduct(product.id);
      }
      alert(`✅ ${selectedRows.length} produs(e) șters(e)!`);
      refetch();
      setSelectedRows([]);
    } catch (error) {
      alert(`Eroare: ${error.message}`);
    }
  }, [selectedRows, deleteProduct, refetch]);

  // Clone product
  const handleClone = useCallback(async () => {
    if (selectedRows.length === 0) {
      alert('Selectează un produs pentru a-l clona!');
      return;
    }
    if (selectedRows.length > 1) {
      alert('Selectează un singur produs!');
      return;
    }

    const product = selectedRows[0];
    const clonedProduct = {
      ...product,
      name: `${product.name} (Copie)`,
      name_en: product.name_en ? `${product.name_en} (Copy)` : '',
      id: undefined, // Remove ID to create new
    };

    try {
      await createProduct(clonedProduct);
      alert(`✅ Produs clonat: ${clonedProduct.name}`);
      refetch();
      setSelectedRows([]);
    } catch (error) {
      alert(`Eroare: ${error.message}`);
    }
  }, [selectedRows, createProduct, refetch]);

  // Submit add/edit modal
  const handleSubmitModal = useCallback(async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get('name'),
      name_en: formData.get('name_en') || '',
      category: formData.get('category'),
      price: parseFloat(formData.get('price')),
      vat_rate: parseInt(formData.get('vat_rate')),
      unit: formData.get('unit'),
      stock_management: formData.get('stock_management'),
      preparation_section: formData.get('preparation_section'),
      is_sellable: formData.get('is_sellable') === 'on' ? 1 : 0,
      has_recipe: formData.get('has_recipe') === 'on' ? 1 : 0,
      is_fraction: formData.get('is_fraction') === 'on' ? 1 : 0,
      is_active: formData.get('is_active') === 'on' ? 1 : 0,
    };

    try {
      if (currentProduct) {
        // Edit
        await updateProduct(currentProduct.id, productData);
        alert(`✅ Produs actualizat: ${productData.name}`);
      } else {
        // Add
        await createProduct(productData);
        alert(`✅ Produs adăugat: ${productData.name}`);
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      setCurrentProduct(null);
      refetch();
    } catch (error) {
      alert(`Eroare: ${error.message}`);
    }
  }, [currentProduct, updateProduct, createProduct, refetch]);

  // =============== CATEGORY ACTIONS ===============

  const handleCategoryAction = useCallback((action) => {
    setCategoryAction(action);
    setShowCategoryModal(true);
  }, []);

  const handleCategoryAdd = useCallback(() => {
    handleCategoryAction('add');
  }, [handleCategoryAction]);

  const handleCategoryEdit = useCallback(() => {
    if (!selectedCategory) {
      alert('Selectează o categorie pentru a o modifica!');
      return;
    }
    handleCategoryAction('edit');
  }, [selectedCategory, handleCategoryAction]);

  const handleCategoryDelete = useCallback(() => {
    if (!selectedCategory) {
      alert('Selectează o categorie pentru a o șterge!');
      return;
    }
    if (window.confirm(`Sigur vrei să ștergi categoria "${selectedCategory}"?\n\nAtenție: Produsele din această categorie vor rămâne fără categorie!`)) {
      // TODO: Implementare ștergere categorie prin API
      alert('⚠️ Funcția de ștergere categorii va fi implementată în curând!');
    }
  }, [selectedCategory]);

  const handleCategoryOrder = useCallback(() => {
    handleCategoryAction('order');
  }, [handleCategoryAction]);

  const handleCategoryClone = useCallback(() => {
    if (!selectedCategory) {
      alert('Selectează o categorie pentru a o clona!');
      return;
    }
    handleCategoryAction('clone');
  }, [selectedCategory, handleCategoryAction]);

  // Render
  if (loading) return <LoadingSpinner message="Se încarcă catalogul..." />;
  if (error) return <ErrorAlert error={error} onRetry={refetch} />;

  return (
    <div className="MODERN-layout">
      {/* Toolbar */}
      <div className="MODERN-toolbar">
        <button className="toolbar-btn success" onClick={handleAdd} title="Adaugă produs nou">
          ➕ Adaugă
        </button>
        <button className="toolbar-btn warning" onClick={handleEdit} title="Modifică produsul selectat">
          ✏️ Modifică
        </button>
        <button className="toolbar-btn danger" onClick={handleDelete} title="Șterge produs(e)">
          🗑️ Șterge
        </button>
        <button className="toolbar-btn primary" onClick={handleReload} title="Reîncarcă datele">
          🔄 Reîncarcă
        </button>
        <button className="toolbar-btn secondary" onClick={handleClone} title="Clonează produs">
          📋 Clonare
        </button>
        <button className="toolbar-btn info" onClick={handleExportCSV} title="Export CSV">
          📥 Exportă
        </button>

        <div style={{ flex: 1 }}></div>

        <label className="toolbar-checkbox">
          <input 
            type="checkbox" 
            checked={showOnlyActive}
            onChange={(e) => setShowOnlyActive(e.target.checked)}
          />
          <span>Doar produse active</span>
        </label>
      </div>

      {/* Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Produse</div>
        </div>
        <div className="stat-card success">
          <div className="stat-card-value">{stats.active}</div>
          <div className="stat-card-label">Active</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-card-value">{stats.inactive}</div>
          <div className="stat-card-label">Inactive</div>
        </div>
        <div className="stat-card info">
          <div className="stat-card-value">{stats.avgPrice} RON</div>
          <div className="stat-card-label">Preț Mediu</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-card-value">{products.length}</div>
          <div className="stat-card-label">Afișate</div>
        </div>
      </div>

      {/* Main Content: 2-Panel Layout */}
      <div className="MODERN-content">
        {/* Left Panel: Categories */}
        <div className="MODERN-categories-panel">
          <div className="categories-header">
            <div className="categories-title">
              <h3>📁 Categorii</h3>
              <button 
                className="btn-reset-filter"
                onClick={() => setSelectedCategory(null)}
                title="Afișează toate categoriile"
              >
                Toate
              </button>
            </div>
            <div className="categories-toolbar">
              <button 
                className="category-toolbar-btn success" 
                onClick={handleCategoryAdd}
                title="Adaugă categorie nouă"
              >
                ➕
              </button>
              <button 
                className="category-toolbar-btn warning" 
                onClick={handleCategoryEdit}
                title="Modifică categoria selectată"
              >
                ✏️
              </button>
              <button 
                className="category-toolbar-btn danger" 
                onClick={handleCategoryDelete}
                title="Șterge categoria selectată"
              >
                🗑️
              </button>
              <button 
                className="category-toolbar-btn secondary" 
                onClick={handleCategoryOrder}
                title="Ordonare categorii"
              >
                🔢
              </button>
              <button 
                className="category-toolbar-btn info" 
                onClick={handleCategoryClone}
                title="Clonează categoria selectată"
              >
                📋
              </button>
            </div>
          </div>
          <div className="categories-list">
            {flatCategories.map(cat => {
              const count = allProducts.filter(p => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <div 
                  key={cat}
                  className={`category-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(isSelected ? null : cat)}
                >
                  <span className="category-name">{cat}</span>
                  <span className="category-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Products Table */}
        <div className="MODERN-table-panel">
          <div className="table-header">
            <input 
              type="text" 
              className="search-input"
              placeholder="🔍 Căutare..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <AGGridWrapper
            ref={gridRef}
            rowData={products || []}
            columnDefs={columnDefs}
            onCellValueChanged={onCellValueChanged}
            onSelectionChanged={onSelectionChanged}
            pagination={true}
            paginationPageSize={50}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{currentProduct ? '✏️ Modifică Produs' : '➕ Adaugă Produs Nou'}</h2>
              <button className="modal-close" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>✖️</button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmitModal}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nume RO *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      defaultValue={currentProduct?.name || ''}
                      placeholder="Ex: Pizza Margherita" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Nume EN</label>
                    <input 
                      type="text" 
                      name="name_en" 
                      defaultValue={currentProduct?.name_en || ''}
                      placeholder="Ex: Margherita Pizza" 
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Categorie *</label>
                    <select name="category" required defaultValue={currentProduct?.category || ''}>
                      <option value="">Selectează...</option>
                      {flatCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Preț (RON) *</label>
                    <input 
                      type="number" 
                      name="price" 
                      step="0.01" 
                      min="0" 
                      required 
                      defaultValue={currentProduct?.price || ''}
                      placeholder="Ex: 25.50" 
                    />
                  </div>
                  <div className="form-group">
                    <label>TVA (%) *</label>
                    <select name="vat_rate" required defaultValue={currentProduct?.vat_rate || 24}>
                      <option value="9">9%</option>
                      <option value="11">11%</option>
                      <option value="21">21%</option>
                      <option value="24">24%</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>U.M. *</label>
                    <select name="unit" required defaultValue={currentProduct?.unit || 'buc'}>
                      <option value="buc">buc</option>
                      <option value="kg">kg</option>
                      <option value="l">l</option>
                      <option value="gr">gr</option>
                      <option value="ml">ml</option>
                      <option value="port">port</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Gestiune</label>
                    <select name="stock_management" defaultValue={currentProduct?.stock_management || 'Bar'}>
                      <option value="">Fără gestiune</option>
                      <option value="Bar">Bar</option>
                      <option value="Bucătărie">Bucătărie</option>
                      <option value="Livrare">Livrare</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Secție preparare</label>
                    <select name="preparation_section" defaultValue={currentProduct?.preparation_section || ''}>
                      <option value="">Fără secție</option>
                      <option value="BAR">BAR</option>
                      <option value="BUCĂTĂRIE CALDĂ">BUCĂTĂRIE CALDĂ</option>
                      <option value="BUCĂTĂRIE RECE">BUCĂTĂRIE RECE</option>
                      <option value="PIZZERIE">PIZZERIE</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group-checkbox">
                    <label>
                      <input 
                        type="checkbox" 
                        name="is_sellable" 
                        defaultChecked={currentProduct?.is_sellable === 1}
                      />
                      La vânzare
                    </label>
                  </div>
                  <div className="form-group-checkbox">
                    <label>
                      <input 
                        type="checkbox" 
                        name="has_recipe" 
                        defaultChecked={currentProduct?.has_recipe === 1}
                      />
                      Are rețetă
                    </label>
                  </div>
                  <div className="form-group-checkbox">
                    <label>
                      <input 
                        type="checkbox" 
                        name="is_fraction" 
                        defaultChecked={currentProduct?.is_fraction === 1}
                      />
                      Fracționabil
                    </label>
                  </div>
                  <div className="form-group-checkbox">
                    <label>
                      <input 
                        type="checkbox" 
                        name="is_active" 
                        defaultChecked={currentProduct?.is_active === 1}
                      />
                      Activ
                    </label>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                  >
                    Anulează
                  </button>
                  <button type="submit" className="btn btn-success" disabled={creating || updating}>
                    {(creating || updating) ? '⏳ Se salvează...' : '✅ Salvează'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {categoryAction === 'add' && '➕ Adaugă Categorie Nouă'}
                {categoryAction === 'edit' && '✏️ Modifică Categorie'}
                {categoryAction === 'delete' && '🗑️ Șterge Categorie'}
                {categoryAction === 'order' && '🔢 Ordonare Categorii'}
                {categoryAction === 'clone' && '📋 Clonează Categorie'}
              </h2>
              <button className="modal-close" onClick={() => setShowCategoryModal(false)}>✖️</button>
            </div>
            
            <div className="modal-body">
              {categoryAction === 'add' && (
                <div>
                  <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                    Introduceți denumirea noii categorii:
                  </p>
                  <input 
                    type="text" 
                    placeholder="Ex: Produse Noi" 
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #e9ecef', 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <p style={{ marginTop: '16px', fontSize: '13px', color: '#999' }}>
                    ⚠️ Funcția va fi implementată complet în curând. Deocamdată, categoriile se adaugă automat când creezi produse noi.
                  </p>
                </div>
              )}
              
              {categoryAction === 'edit' && (
                <div>
                  <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                    Editați denumirea categoriei: <strong>{selectedCategory}</strong>
                  </p>
                  <input 
                    type="text" 
                    defaultValue={selectedCategory}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #e9ecef', 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <p style={{ marginTop: '16px', fontSize: '13px', color: '#999' }}>
                    ⚠️ Funcția va fi implementată complet în curând.
                  </p>
                </div>
              )}
              
              {categoryAction === 'order' && (
                <div>
                  <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                    Ordonare categorii prin drag & drop:
                  </p>
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    textAlign: 'center' 
                  }}>
                    <p style={{ fontSize: '48px', margin: '20px 0' }}>🔢</p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      Funcția de ordonare va permite drag & drop pentru a schimba ordinea categoriilor.
                    </p>
                    <p style={{ marginTop: '16px', fontSize: '13px', color: '#999' }}>
                      ⚠️ În dezvoltare...
                    </p>
                  </div>
                </div>
              )}
              
              {categoryAction === 'clone' && (
                <div>
                  <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                    Clonează categoria: <strong>{selectedCategory}</strong>
                  </p>
                  <input 
                    type="text" 
                    defaultValue={`${selectedCategory} (Copie)`}
                    placeholder="Denumire nouă categorie"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #e9ecef', 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <p style={{ marginTop: '16px', fontSize: '13px', color: '#999' }}>
                    ⚠️ Funcția va fi implementată complet în curând.
                  </p>
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowCategoryModal(false)}
                >
                  Închide
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => {
                    alert('⚠️ Funcția va fi implementată în curând!\n\nDeocamdată, categoriile se gestionează automat când adaugi produse.');
                    setShowCategoryModal(false);
                  }}
                >
                  ✅ Salvează
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
