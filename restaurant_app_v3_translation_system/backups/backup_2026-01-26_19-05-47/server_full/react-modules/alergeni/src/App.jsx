import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Lista standard de alergeni
const COMMON_ALLERGENS = [
  'lapte', 'ouă', 'gluten', 'pește', 'crustacee', 'moluște',
  'nuci', 'arahide', 'soia', 'țelină', 'muștar', 'susan',
  'lupină', 'dioxid de sulf', 'sulfiti'
];

function App() {
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterText, setFilterText] = useState('');
  
  // API Base URL
  const API_BASE = '';
  const AUTH_TOKEN = localStorage.getItem('adminToken');
  const authHeaders = AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {};

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/api/allergens/products`, {
        headers: authHeaders
      });
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('❌ Eroare la încărcarea produselor:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, [AUTH_TOKEN]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Calculează statistici
  const stats = {
    total: products.length,
    withDifferences: products.filter(p => p.has_difference).length,
    withoutAllergens: products.filter(p => !p.current_allergens || p.current_allergens.trim() === '').length,
    complete: products.filter(p => p.current_allergens && !p.has_difference).length
  };

  // Sortare și filtrare
  const filteredAndSortedProducts = products
    .filter(p => {
      if (!filterText) return true;
      const searchLower = filterText.toLowerCase();
      return (
        p.name?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower) ||
        p.current_allergens?.toLowerCase().includes(searchLower) ||
        p.calculated_allergens?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Handlers
  const handleEdit = (product) => {
    setSelectedProduct(product);
    const current = product.current_allergens || '';
    const allergensList = current.split(',').map(a => a.trim()).filter(a => a);
    setSelectedAllergens(allergensList);
    setIsModalOpen(true);
  };

  const handleRecalculate = async (productId) => {
    if (!confirm('Recalculezi alergenii pentru acest produs?')) return;
    
    try {
      await axios.post(`${API_BASE}/api/allergens/recalculate/${productId}`, {}, {
        headers: authHeaders
      });
      alert('✅ Alergeni recalculați cu succes!');
      fetchProducts();
    } catch (err) {
      console.error('❌ Eroare la recalculare:', err);
      alert('❌ Eroare la recalculare: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRecalculateAll = async () => {
    if (!confirm(`Recalculezi alergenii pentru TOATE cele ${stats.total} produse? Poate dura câteva secunde...`)) return;
    
    setIsRecalculating(true);
    try {
      const response = await axios.post(`${API_BASE}/api/allergens/recalculate-all`, {}, {
        headers: authHeaders
      });
      alert(`✅ ${response.data.message}\nActualizate: ${response.data.success_count}/${response.data.total_products}`);
      fetchProducts();
    } catch (err) {
      console.error('❌ Eroare la recalculare totală:', err);
      alert('❌ Eroare: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleSaveAllergens = async () => {
    if (!selectedProduct) return;
    
    const allergensText = selectedAllergens.join(', ');
    
    try {
      await axios.put(`${API_BASE}/api/menu/${selectedProduct.id}`, {
        allergens: allergensText,
        allergens_en: allergensText
      }, {
        headers: authHeaders
      });
      
      alert('✅ Alergeni salvați cu succes!');
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('❌ Eroare la salvare:', err);
      alert('❌ Eroare la salvare: ' + (err.response?.data?.error || err.message));
    }
  };

  const toggleAllergen = (allergen) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergen)) {
        return prev.filter(a => a !== allergen);
      } else {
        return [...prev, allergen];
      }
    });
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Produs', 'Categorie', 'Ingrediente', 'Alergeni Declarați', 'Alergeni Calculați', 'Diferență'];
    const rows = filteredAndSortedProducts.map(p => [
      p.id,
      p.name,
      p.category,
      p.ingredient_count,
      p.current_allergens || '',
      p.calculated_allergens || '',
      p.has_difference ? 'DA' : 'NU'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alergeni_produse_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">⏳ Se încarcă produsele...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-alert">❌ Eroare: {error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>🏷️ Gestionare Alergeni</h1>
          <p style={{margin: 0, opacity: 0.9}}>Calculare automată din ingrediente și gestionare alergeni produse</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-warning" onClick={handleRecalculateAll} disabled={isRecalculating}>
            {isRecalculating ? '⏳ Se recalculează...' : '🔄 Recalculează Tot'}
          </button>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
          <button className="btn btn-secondary" onClick={fetchProducts}>
            🔄 Reîncarcă
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Produse</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-card-value">{stats.withDifferences}</div>
          <div className="stat-card-label">Cu Diferențe</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-card-value">{stats.withoutAllergens}</div>
          <div className="stat-card-label">Fără Alergeni</div>
        </div>
        <div className="stat-card success">
          <div className="stat-card-value">{stats.complete}</div>
          <div className="stat-card-label">Complete</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="🔍 Caută produs, categorie sau alergeni..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 15px',
            fontSize: '14px',
            border: '2px solid #e0e0e0',
            borderRadius: '5px'
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="allergens-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>
                ID {sortField === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('name')} style={{cursor: 'pointer'}}>
                🍽️ Produs {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('category')} style={{cursor: 'pointer'}}>
                📁 Categorie {sortField === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th>📦 Ingrediente</th>
              <th>🏷️ Alergeni Declarați</th>
              <th>🧮 Alergeni Calculați</th>
              <th>⚠️ Diferență</th>
              <th>⚙️ Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProducts.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td style={{fontWeight: 'bold'}}>{product.name}</td>
                <td>{product.category}</td>
                <td style={{textAlign: 'center'}}>{product.ingredient_count}</td>
                <td style={{
                  backgroundColor: (!product.current_allergens || product.current_allergens.trim() === '') ? '#ffebee' : 'transparent',
                  color: (!product.current_allergens || product.current_allergens.trim() === '') ? '#c62828' : 'inherit'
                }}>
                  {product.current_allergens || 'niciunul'}
                </td>
                <td style={{backgroundColor: '#e8f5e9'}}>
                  {product.calculated_allergens || 'niciunul'}
                </td>
                <td style={{textAlign: 'center'}}>
                  {product.has_difference ? 
                    <span style={{color: '#f57c00', fontWeight: 'bold'}}>⚠️ DA</span> : 
                    <span style={{color: '#4caf50'}}>✓ OK</span>
                  }
                </td>
                <td>
                  <div style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                    <button 
                      className="btn-icon btn-primary" 
                      onClick={() => handleEdit(product)}
                      title="Editează"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon btn-warning" 
                      onClick={() => handleRecalculate(product.id)}
                      title="Recalculează"
                    >
                      🔄
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{marginTop: '15px', textAlign: 'center', color: '#666'}}>
        Afișare: {filteredAndSortedProducts.length} / {products.length} produse
      </div>

      {/* Modal Editare */}
      {isModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editează Alergeni: {selectedProduct.name}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body modal-scroll">
              <div className="info-box">
                <p><strong>📦 Ingrediente în rețetă:</strong> {selectedProduct.ingredient_count}</p>
                <p><strong>🧮 Alergeni calculați automat:</strong> {selectedProduct.calculated_allergens || 'niciunul'}</p>
                <p><strong>🏷️ Alergeni declarați curent:</strong> {selectedProduct.current_allergens || 'niciunul'}</p>
              </div>

              <h3>Selectează Alergenii:</h3>
              <div className="allergen-checkboxes">
                {COMMON_ALLERGENS.map(allergen => (
                  <label key={allergen} className="allergen-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedAllergens.includes(allergen)}
                      onChange={() => toggleAllergen(allergen)}
                    />
                    <span>{allergen}</span>
                  </label>
                ))}
              </div>

              <div className="form-group">
                <label>Alergeni Selectați:</label>
                <input 
                  type="text" 
                  value={selectedAllergens.join(', ')} 
                  readOnly
                  style={{backgroundColor: '#f5f5f5'}}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Anulează
              </button>
              <button className="btn btn-success" onClick={handleSaveAllergens}>
                💾 Salvează Alergeni
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
