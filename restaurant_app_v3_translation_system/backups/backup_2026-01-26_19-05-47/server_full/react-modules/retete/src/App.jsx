/**
 * 📖 Rețete & Fișe Tehnice Module - Main App Component
 * 
 * Gestionează:
 * - Lista produse (stânga) - selectare produs pentru editare rețetă
 * - Recipe Builder (dreapta) - adăugare/ștergere ingrediente + cantități
 * - Calcul automat cost per porție
 * - Validare disponibilitate ingrediente în stoc
 * - Preview fișă tehnică
 * - Export PDF (prin API backend)
 * - Statistici (Total rețete, Cost mediu, Ingrediente unice)
 */

import React, { useState, useCallback, useMemo } from 'react';
import { API } from '@shared/api-client';
import { useAPI, useMutation } from '@shared/hooks/useAPI';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import ErrorAlert from '@shared/components/ErrorAlert';
import './App.css';

function App() {
  // API Hooks
  const { data: products, loading: loadingProducts, error: errorProducts, refetch: refetchProducts } = useAPI(API.products.getAll);
  const { data: ingredients, loading: loadingIngredients } = useAPI(API.ingredients.getAll);
  const { data: stocks, loading: loadingStocks } = useAPI(API.stocks.getAll);
  const { mutate: saveRecipe, loading: saving } = useMutation(API.recipes.save);

  // Local state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');

  // Helper: Get stock quantity for ingredient
  const getStockQuantity = useCallback((ingredientId) => {
    if (!stocks) return 0;
    const stock = stocks.find(s => s.ingredient_id === ingredientId);
    return stock ? stock.quantity : 0;
  }, [stocks]);

  // Helper: Get ingredient by ID
  const getIngredientById = useCallback((ingredientId) => {
    if (!ingredients) return null;
    return ingredients.find(ing => ing.id === ingredientId);
  }, [ingredients]);

  // Calculează statistici
  const stats = useMemo(() => {
    if (!products) return { total: 0, withRecipes: 0, avgCost: 0, uniqueIngredients: 0 };
    
    // In production, fetch actual recipe data from backend
    // For now, show placeholder stats
    return {
      total: products.length,
      withRecipes: 0, // To be implemented
      avgCost: 0,
      uniqueIngredients: recipeIngredients.length,
    };
  }, [products, recipeIngredients]);

  // Calculează cost total rețetă
  const recipeCost = useMemo(() => {
    return recipeIngredients.reduce((total, item) => {
      const ingredient = getIngredientById(item.ingredientId);
      if (!ingredient) return total;
      
      const cost = (ingredient.cost_per_unit || 0) * item.quantity;
      return total + cost;
    }, 0);
  }, [recipeIngredients, getIngredientById]);

  // Selectare produs
  const handleSelectProduct = useCallback((product) => {
    setSelectedProduct(product);
    
    // Load existing recipe if available
    // In production, fetch from API: GET /api/recipes/:productId
    // For now, start with empty recipe
    setRecipeIngredients([]);
  }, []);

  // Adăugare ingredient în rețetă
  const handleAddIngredient = useCallback((e) => {
    e.preventDefault();
    
    if (!selectedIngredientId || !ingredientQuantity || parseFloat(ingredientQuantity) <= 0) {
      alert('Selectează un ingredient și cantitatea!');
      return;
    }

    const ingredient = getIngredientById(parseInt(selectedIngredientId));
    if (!ingredient) {
      alert('Ingredient invalid!');
      return;
    }

    // Check if ingredient already in recipe
    const existing = recipeIngredients.find(item => item.ingredientId === ingredient.id);
    if (existing) {
      alert(`Ingredientul "${ingredient.name_ro}" este deja adăugat! Modifică cantitatea din tabel.`);
      return;
    }

    const newItem = {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name_ro,
      quantity: parseFloat(ingredientQuantity),
      unit: ingredient.unit,
      costPerUnit: ingredient.cost_per_unit || 0,
      totalCost: (ingredient.cost_per_unit || 0) * parseFloat(ingredientQuantity),
    };

    setRecipeIngredients([...recipeIngredients, newItem]);
    setSelectedIngredientId('');
    setIngredientQuantity('');
    
    console.log(`✅ Ingredient adăugat: ${newItem.ingredientName} - ${newItem.quantity} ${newItem.unit}`);
  }, [selectedIngredientId, ingredientQuantity, recipeIngredients, getIngredientById]);

  // Ștergere ingredient din rețetă
  const handleRemoveIngredient = useCallback((ingredientId) => {
    setRecipeIngredients(recipeIngredients.filter(item => item.ingredientId !== ingredientId));
    console.log(`🗑️ Ingredient șters: ${ingredientId}`);
  }, [recipeIngredients]);

  // Salvare rețetă
  const handleSaveRecipe = useCallback(async () => {
    if (!selectedProduct) {
      alert('Selectează un produs!');
      return;
    }

    if (recipeIngredients.length === 0) {
      alert('Adaugă cel puțin un ingredient!');
      return;
    }

    const recipeData = {
      productId: selectedProduct.id,
      ingredients: recipeIngredients.map(item => ({
        ingredient_id: item.ingredientId,
        quantity: item.quantity,
      })),
      costPerServing: recipeCost,
    };

    try {
      await saveRecipe(selectedProduct.id, recipeData);
      alert(`✅ Rețeta pentru "${selectedProduct.name_ro}" a fost salvată!`);
      console.log('Recipe saved:', recipeData);
    } catch (error) {
      alert(`Eroare: ${error.message}`);
    }
  }, [selectedProduct, recipeIngredients, recipeCost, saveRecipe]);

  // Validare stoc
  const stockValidation = useMemo(() => {
    const issues = [];
    
    recipeIngredients.forEach(item => {
      const stockQty = getStockQuantity(item.ingredientId);
      if (stockQty < item.quantity) {
        issues.push({
          ingredientName: item.ingredientName,
          required: item.quantity,
          available: stockQty,
          missing: item.quantity - stockQty,
          unit: item.unit,
        });
      }
    });
    
    return issues;
  }, [recipeIngredients, getStockQuantity]);

  // Export PDF
  const handleExportPDF = useCallback(async () => {
    if (!selectedProduct) return;
    
    alert('📄 Export PDF în dezvoltare... Va genera fișă tehnică completă!');
    // In production: POST /api/recipes/:productId/export-pdf
  }, [selectedProduct]);

  // Preview Modal
  const handleOpenPreview = useCallback(() => {
    if (recipeIngredients.length === 0) {
      alert('Adaugă cel puțin un ingredient pentru preview!');
      return;
    }
    setShowPreviewModal(true);
  }, [recipeIngredients]);

  const handleClosePreview = useCallback(() => {
    setShowPreviewModal(false);
  }, []);

  // Render Loading & Error
  if (loadingProducts || loadingIngredients || loadingStocks) {
    return <LoadingSpinner message="Se încarcă datele..." />;
  }

  if (errorProducts) {
    return <ErrorAlert error={errorProducts} onRetry={refetchProducts} />;
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>
          <span>📖</span>
          Rețete & Fișe Tehnice
        </h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={refetchProducts}>
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
          <div className="stat-card-value">{stats.withRecipes}</div>
          <div className="stat-card-label">Cu Rețete</div>
        </div>
        <div className="stat-card info">
          <div className="stat-card-value">{recipeCost.toFixed(2)} RON</div>
          <div className="stat-card-label">Cost Rețetă Curentă</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-card-value">{stats.uniqueIngredients}</div>
          <div className="stat-card-label">Ingrediente Folosite</div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert-info-banner">
        <span>ℹ️</span>
        <div>
          <strong>Cum funcționează:</strong> Selectează un produs din lista din stânga, apoi construiește rețeta adăugând ingrediente + cantități. Costul se calculează automat!
        </div>
      </div>

      {/* Split Layout: Products List + Recipe Builder */}
      <div className="split-layout">
        {/* Left Panel: Products List */}
        <div className="products-list-panel">
          <h3>
            <span>🎫</span>
            Lista Produse
          </h3>
          
          {products && products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className={`product-list-item ${selectedProduct?.id === product.id ? 'active' : ''}`}
                onClick={() => handleSelectProduct(product)}
              >
                <div className="product-list-item-icon">
                  {selectedProduct?.id === product.id ? '✅' : '📝'}
                </div>
                <div className="product-list-item-content">
                  <div className="product-list-item-name">{product.name_ro}</div>
                  <div className="product-list-item-info">
                    {product.category} • {product.price.toFixed(2)} RON
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-subtitle">Niciun produs găsit</div>
          )}
        </div>

        {/* Right Panel: Recipe Builder */}
        <div className="recipe-builder-panel">
          {selectedProduct ? (
            <>
              <div className="recipe-builder-header">
                <h2>
                  <span>👨‍🍳</span>
                  Rețetă: {selectedProduct.name_ro}
                </h2>
                <div className="recipe-builder-actions">
                  <button 
                    className="btn btn-info btn-small"
                    onClick={handleOpenPreview}
                    disabled={recipeIngredients.length === 0}
                  >
                    👁️ Preview
                  </button>
                  <button 
                    className="btn btn-warning btn-small"
                    onClick={handleExportPDF}
                    disabled={recipeIngredients.length === 0}
                  >
                    📄 Export PDF
                  </button>
                  <button 
                    className="btn btn-success btn-small"
                    onClick={handleSaveRecipe}
                    disabled={recipeIngredients.length === 0 || saving}
                  >
                    {saving ? '⏳ Salvează...' : '💾 Salvează Rețetă'}
                  </button>
                </div>
              </div>

              {/* Add Ingredient Form */}
              <div className="add-ingredient-section">
                <form className="add-ingredient-form" onSubmit={handleAddIngredient}>
                  <div className="form-group-inline">
                    <label>Ingredient</label>
                    <select 
                      value={selectedIngredientId}
                      onChange={(e) => setSelectedIngredientId(e.target.value)}
                      required
                    >
                      <option value="">Selectează ingredient...</option>
                      {ingredients && ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name_ro} ({ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-inline">
                    <label>Cantitate</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      placeholder="0.00"
                      value={ingredientQuantity}
                      onChange={(e) => setIngredientQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-inline">
                    <label>Cost/Unitate</label>
                    <input 
                      type="text" 
                      value={selectedIngredientId ? (getIngredientById(parseInt(selectedIngredientId))?.cost_per_unit?.toFixed(2) || '0.00') : '0.00'}
                      disabled
                      style={{ background: '#f8f9fa' }}
                    />
                  </div>

                  <div className="form-group-inline">
                    <label>&nbsp;</label>
                    <button type="submit" className="btn btn-success btn-small">
                      ➕ Adaugă
                    </button>
                  </div>
                </form>
              </div>

              {/* Ingredients Table */}
              {recipeIngredients.length > 0 ? (
                <>
                  <table className="ingredients-table">
                    <thead>
                      <tr>
                        <th>Ingredient</th>
                        <th>Cantitate</th>
                        <th>Cost/Unitate</th>
                        <th>Cost Total</th>
                        <th>Stoc Disponibil</th>
                        <th>Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipeIngredients.map((item) => {
                        const stockQty = getStockQuantity(item.ingredientId);
                        const hasStock = stockQty >= item.quantity;
                        
                        return (
                          <tr key={item.ingredientId}>
                            <td>{item.ingredientName}</td>
                            <td>{item.quantity.toFixed(2)} {item.unit}</td>
                            <td>{item.costPerUnit.toFixed(2)} RON</td>
                            <td style={{ fontWeight: '600', color: '#27ae60' }}>
                              {item.totalCost.toFixed(2)} RON
                            </td>
                            <td>
                              <span className={`badge ${hasStock ? 'badge-success' : 'badge-danger'}`}>
                                {hasStock ? '✅' : '⚠️'} {stockQty.toFixed(2)} {item.unit}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-danger btn-icon"
                                onClick={() => handleRemoveIngredient(item.ingredientId)}
                                title="Șterge ingredient"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Stock Validation Alerts */}
                  {stockValidation.length > 0 && (
                    <div className="stock-validation-alert">
                      <div className="stock-validation-alert-title">
                        ⚠️ Alerte Stoc (Ingrediente Insuficiente)
                      </div>
                      {stockValidation.map((issue, idx) => (
                        <div key={idx} className="stock-validation-item">
                          • <strong>{issue.ingredientName}</strong>: Necesari {issue.required.toFixed(2)} {issue.unit}, 
                          disponibili {issue.available.toFixed(2)} {issue.unit} 
                          (lipsă: {issue.missing.toFixed(2)} {issue.unit})
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cost Summary */}
                  <div className="cost-summary">
                    <div className="cost-summary-item">
                      <div className="cost-summary-label">Cost Total</div>
                      <div className="cost-summary-value">{recipeCost.toFixed(2)} RON</div>
                    </div>
                    <div className="cost-summary-item">
                      <div className="cost-summary-label">Preț Vânzare</div>
                      <div className="cost-summary-value">{selectedProduct.price.toFixed(2)} RON</div>
                    </div>
                    <div className="cost-summary-item">
                      <div className="cost-summary-label">Profit Brut</div>
                      <div className="cost-summary-value">
                        {(selectedProduct.price - recipeCost).toFixed(2)} RON
                      </div>
                    </div>
                    <div className="cost-summary-item">
                      <div className="cost-summary-label">Marjă</div>
                      <div className="cost-summary-value">
                        {selectedProduct.price > 0 
                          ? (((selectedProduct.price - recipeCost) / selectedProduct.price) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="ingredients-table-empty">
                  📝 Adaugă primul ingredient pentru a începe construirea rețetei...
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👈</div>
              <div className="empty-state-title">Selectează un produs</div>
              <div className="empty-state-subtitle">
                Alege un produs din lista din stânga pentru a crea/edita rețeta
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedProduct && (
        <div className="modal-overlay" onClick={handleClosePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 Preview Fișă Tehnică: {selectedProduct.name_ro}</h2>
              <button className="modal-close" onClick={handleClosePreview}>✖️</button>
            </div>
            
            <div className="modal-body">
              <h3 style={{ marginBottom: '16px' }}>Ingrediente:</h3>
              <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
                {recipeIngredients.map((item) => (
                  <li key={item.ingredientId} style={{ marginBottom: '8px' }}>
                    <strong>{item.ingredientName}</strong>: {item.quantity.toFixed(2)} {item.unit}
                  </li>
                ))}
              </ul>

              <h3 style={{ marginBottom: '16px' }}>Costuri:</h3>
              <table style={{ width: '100%', marginBottom: '24px' }}>
                <tbody>
                  <tr>
                    <td><strong>Cost Total Ingrediente:</strong></td>
                    <td style={{ textAlign: 'right' }}>{recipeCost.toFixed(2)} RON</td>
                  </tr>
                  <tr>
                    <td><strong>Preț Vânzare:</strong></td>
                    <td style={{ textAlign: 'right' }}>{selectedProduct.price.toFixed(2)} RON</td>
                  </tr>
                  <tr>
                    <td><strong>Profit Brut:</strong></td>
                    <td style={{ textAlign: 'right', color: '#27ae60', fontWeight: 'bold' }}>
                      {(selectedProduct.price - recipeCost).toFixed(2)} RON
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Marjă Profit:</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      {selectedProduct.price > 0 
                        ? (((selectedProduct.price - recipeCost) / selectedProduct.price) * 100).toFixed(1)
                        : 0}%
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontSize: '13px', color: '#6c757d', fontStyle: 'italic' }}>
                ℹ️ Fișa tehnică completă (PDF) va include: valori nutriționale, alergeni, mod de preparare, 
                temperatură servire, etc.
              </div>
              
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={handleClosePreview}>
                  Închide
                </button>
                <button className="btn btn-warning" onClick={handleExportPDF}>
                  📄 Export PDF
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

