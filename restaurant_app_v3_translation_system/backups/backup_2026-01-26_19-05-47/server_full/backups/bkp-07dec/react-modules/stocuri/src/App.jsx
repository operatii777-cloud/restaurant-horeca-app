/**
 * 📦 Stocuri Module - Main App Component
 * 
 * Gestionează:
 * - Vizualizare stocuri curente
 * - Alerte nivel minim (OK / Scăzut / Critic)
 * - Ajustare manuală stoc (+ motivație)
 * - Istoric mișcări (Integration cu API)
 * - Filtrare și sortare
 * - Export CSV
 */

import React, { useState, useCallback, useRef } from 'react';
import { API } from '@shared/api-client';
import { useAPI, useMutation } from '@shared/hooks/useAPI';
import AGGridWrapper from '@shared/components/AGGridWrapper';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import ErrorAlert from '@shared/components/ErrorAlert';
import './App.css';

function App() {
  const gridRef = useRef(null);
  
  // API Hooks
  const { data: stocks, loading, error, refetch } = useAPI(API.stocks.getAll);
  const { data: lowStockAlerts } = useAPI(API.stocks.getLowStock);
  const { mutate: adjustStock, loading: adjusting } = useMutation(API.stocks.adjust);

  // Local state
  const [selectedRows, setSelectedRows] = useState([]);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);

  // Calculează statistici
  const stats = React.useMemo(() => {
    if (!stocks) return { total: 0, ok: 0, low: 0, critical: 0 };
    
    const criticalThreshold = 0.3; // 30% din min_quantity
    const lowThreshold = 1.0; // 100% din min_quantity
    
    let ok = 0, low = 0, critical = 0;
    
    stocks.forEach(item => {
      const qty = item.quantity || 0;
      const min = item.min_quantity || 0;
      
      if (min === 0) {
        ok++; // Dacă nu are min_quantity setat, presupunem că e OK
      } else if (qty < min * criticalThreshold) {
        critical++;
      } else if (qty < min * lowThreshold) {
        low++;
      } else {
        ok++;
      }
    });
    
    return {
      total: stocks.length,
      ok,
      low,
      critical,
    };
  }, [stocks]);

  // Helper: calculează status alert
  const getAlertStatus = (quantity, minQuantity) => {
    if (!minQuantity || minQuantity === 0) return 'ok';
    
    const ratio = quantity / minQuantity;
    if (ratio < 0.3) return 'critical'; // Sub 30%
    if (ratio < 1.0) return 'low';      // Sub 100%
    return 'ok';
  };

  // Helper: Badge renderer pentru status
  const AlertBadgeRenderer = (params) => {
    const status = params.value;
    const icons = { ok: '✅', low: '⚠️', critical: '🔴' };
    const labels = { ok: 'OK', low: 'Scăzut', critical: 'CRITIC' };
    
    return (
      <span className={`alert-badge ${status}`}>
        {icons[status]} {labels[status]}
      </span>
    );
  };

  // AG Grid Column Definitions
  const columnDefs = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80, 
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    { 
      field: 'ingredient_name', 
      headerName: 'Ingredient', 
      flex: 1, 
      editable: false,
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: '500' },
    },
    { 
      field: 'quantity', 
      headerName: 'Cantitate Curentă', 
      width: 160, 
      editable: false,
      valueFormatter: (params) => {
        const qty = params.value || 0;
        const unit = params.data.unit || '';
        return `${qty.toFixed(2)} ${unit}`;
      },
      filter: 'agNumberColumnFilter',
      cellStyle: { fontWeight: '600', fontSize: '14px' },
    },
    { 
      field: 'min_quantity', 
      headerName: 'Nivel Minim', 
      width: 140, 
      editable: false,
      valueFormatter: (params) => {
        const qty = params.value || 0;
        const unit = params.data.unit || '';
        return qty > 0 ? `${qty.toFixed(2)} ${unit}` : '-';
      },
      filter: 'agNumberColumnFilter',
    },
    { 
      field: 'alert_status', 
      headerName: 'Status', 
      width: 130, 
      editable: false,
      cellRenderer: AlertBadgeRenderer,
      filter: 'agSetColumnFilter',
      filterParams: {
        values: ['ok', 'low', 'critical'],
      },
    },
    { 
      field: 'last_updated', 
      headerName: 'Ultima Actualizare', 
      width: 180, 
      editable: false,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleString('ro-RO');
      },
      filter: 'agDateColumnFilter',
    },
    {
      headerName: 'Acțiuni',
      width: 120,
      editable: false,
      filter: false,
      sortable: false,
      cellRenderer: (params) => {
        return (
          <button 
            className="btn-adjust-inline"
            onClick={() => handleOpenAdjustModal(params.data)}
          >
            ⚙️ Ajustează
          </button>
        );
      },
    },
  ];

  // Procesează data pentru grid (adaugă alert_status)
  const gridRowData = React.useMemo(() => {
    if (!stocks) return [];
    
    return stocks.map(item => ({
      ...item,
      alert_status: getAlertStatus(item.quantity, item.min_quantity),
    }));
  }, [stocks]);

  // Handle selection change
  const onSelectionChanged = useCallback((event) => {
    const selected = event.api.getSelectedRows();
    setSelectedRows(selected);
    console.log(`✅ Selected ${selected.length} stocuri`);
  }, []);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `stocuri_export_${new Date().toISOString().split('T')[0]}.csv`,
        columnKeys: ['id', 'ingredient_name', 'quantity', 'min_quantity', 'alert_status', 'last_updated'],
      });
      console.log('📥 CSV Export complet!');
    }
  }, []);

  // Open adjust modal
  const handleOpenAdjustModal = useCallback((item) => {
    setAdjustingItem(item);
    setShowAdjustModal(true);
  }, []);

  // Close adjust modal
  const handleCloseAdjustModal = useCallback(() => {
    setShowAdjustModal(false);
    setAdjustingItem(null);
  }, []);

  // Adjust stock (prin modal)
  const handleAdjustStock = useCallback(async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const adjustmentType = formData.get('adjustmentType');
    const quantityChange = parseFloat(formData.get('quantityChange'));
    const reason = formData.get('reason');
    
    if (isNaN(quantityChange) || quantityChange === 0) {
      alert('Cantitatea trebuie să fie diferită de 0!');
      return;
    }
    
    if (!reason || reason.trim() === '') {
      alert('Motivul este obligatoriu!');
      return;
    }

    const finalQuantity = adjustmentType === 'add' ? quantityChange : -quantityChange;

    try {
      await adjustStock(adjustingItem.ingredient_id, finalQuantity, reason);
      console.log(`✅ Stoc ajustat: ${adjustingItem.ingredient_name} ${finalQuantity > 0 ? '+' : ''}${finalQuantity}`);
      alert(`✅ Stoc ajustat cu succes!\n\n${adjustingItem.ingredient_name}: ${finalQuantity > 0 ? '+' : ''}${finalQuantity} ${adjustingItem.unit}`);
      
      handleCloseAdjustModal();
      refetch();
    } catch (error) {
      alert(`Eroare la ajustare: ${error.message}`);
    }
  }, [adjustingItem, adjustStock, refetch, handleCloseAdjustModal]);

  // Render
  if (loading) return <LoadingSpinner message="Se încarcă stocurile..." />;
  if (error) return <ErrorAlert error={error} onRetry={refetch} />;

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>
          <span>📦</span>
          Gestionare Stocuri
        </h1>
        <div className="header-actions">
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
          <div className="stat-card-value">{stats.ok}</div>
          <div className="stat-card-label">Stoc OK</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-card-value">{stats.low}</div>
          <div className="stat-card-label">Stoc Scăzut</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-card-value">{stats.critical}</div>
          <div className="stat-card-label">Stoc CRITIC</div>
        </div>
      </div>

      {/* AG Grid */}
      <AGGridWrapper
        ref={gridRef}
        rowData={gridRowData}
        columnDefs={columnDefs}
        onSelectionChanged={onSelectionChanged}
        pagination={true}
        paginationPageSize={50}
        style={{ height: '600px', width: '100%' }}
      />

      {/* Adjust Stock Modal */}
      {showAdjustModal && adjustingItem && (
        <div className="modal-overlay" onClick={handleCloseAdjustModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚙️ Ajustează Stoc: {adjustingItem.ingredient_name}</h2>
              <button className="modal-close" onClick={handleCloseAdjustModal}>✖️</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-info">
                <p><strong>Cantitate curentă:</strong> {adjustingItem.quantity.toFixed(2)} {adjustingItem.unit}</p>
                <p><strong>Nivel minim:</strong> {adjustingItem.min_quantity ? `${adjustingItem.min_quantity.toFixed(2)} ${adjustingItem.unit}` : 'N/A'}</p>
                <p><strong>Status:</strong> <span className={`alert-badge ${adjustingItem.alert_status}`}>
                  {adjustingItem.alert_status === 'ok' && '✅ OK'}
                  {adjustingItem.alert_status === 'low' && '⚠️ Scăzut'}
                  {adjustingItem.alert_status === 'critical' && '🔴 CRITIC'}
                </span></p>
              </div>
              
              <form onSubmit={handleAdjustStock}>
                <div className="form-group">
                  <label>Tip Ajustare:</label>
                  <select name="adjustmentType" required>
                    <option value="add">➕ Adaugă la stoc</option>
                    <option value="subtract">➖ Scade din stoc</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Cantitate ({adjustingItem.unit}):</label>
                  <input 
                    type="number" 
                    name="quantityChange" 
                    step="0.01" 
                    min="0.01" 
                    placeholder="Ex: 5.50" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Motiv (obligatoriu):</label>
                  <textarea 
                    name="reason" 
                    placeholder="Ex: Recepție NIR, Inventar corectare, Deteriorare, etc." 
                    rows="3" 
                    required
                  ></textarea>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseAdjustModal}>
                    Anulează
                  </button>
                  <button type="submit" className="btn btn-success" disabled={adjusting}>
                    {adjusting ? '⏳ Se salvează...' : '✅ Salvează Ajustare'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

