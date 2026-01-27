// import { useTranslation } from '@/i18n/I18nContext';
import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { PageHeader } from '@/shared/components/PageHeader';
import { InlineAlert } from '@/shared/components/InlineAlert';
import { allergensApi } from '../api/allergensApi';
import type { AllergenProduct } from '../api/allergensApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './AllergensPage.css';

// Lista standard de alergeni (UE 14 alergeni majori)
const COMMON_ALLERGENS = [
  'lapte', 'ouă', 'gluten', 'pește', 'crustacee', 'moluște',
  'nuci', 'arahide', 'soia', 'țelină', 'muștar', 'susan',
  'lupină', 'dioxid de sulf', 'sulfiti'
];

export const AllergensPage = () => {
//   const { t } = useTranslation();
  const [products, setProducts] = useState<AllergenProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AllergenProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState<keyof AllergenProduct>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await allergensApi.fetchProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('❌ Eroare la încărcarea produselor:', err);
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
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

  const handleEdit = (product: AllergenProduct) => {
    setSelectedProduct(product);
    const current = product.current_allergens || '';
    const allergensList = current.split(',').map(a => a.trim()).filter(a => a);
    setSelectedAllergens(allergensList);
    setIsModalOpen(true);
  };

  const handleRecalculate = async (productId: number) => {
    if (!window.confirm('Recalculezi alergenii pentru acest produs?')) return;
    
    try {
      await allergensApi.recalculateProduct(productId);
      setFeedback({ type: 'success', message: '✅ Alergeni recalculați cu succes!' });
      await fetchProducts();
    } catch (err: any) {
      console.error('❌ Eroare la recalculare:', err);
      setFeedback({ type: 'error', message: '❌ Eroare la recalculare: ' + (err.message || 'Eroare necunoscută') });
    }
  };

  const handleRecalculateAll = async () => {
    if (!window.confirm(`Recalculezi alergenii pentru TOATE cele ${stats.total} produse? Poate dura câteva secunde...`)) return;
    
    setIsRecalculating(true);
    try {
      const response = await allergensApi.recalculateAll();
      setFeedback({ 
        type: 'success', 
        message: `✅ ${response.message}\nActualizate: ${response.success_count}/${response.total_products}` 
      });
      await fetchProducts();
    } catch (err: any) {
      console.error('❌ Eroare la recalculare totală:', err);
      setFeedback({ type: 'error', message: '❌ Eroare: ' + (err.message || 'Eroare necunoscută') });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleSaveAllergens = async () => {
    if (!selectedProduct) return;
    
    const allergensText = selectedAllergens.join(', ');
    
    try {
      await allergensApi.updateProductAllergens(selectedProduct.id, allergensText, allergensText);
      setFeedback({ type: 'success', message: '✅ Alergeni salvați cu succes!' });
      setIsModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      console.error('❌ Eroare la salvare:', err);
      setFeedback({ type: 'error', message: '❌ Eroare la salvare: ' + (err.message || 'Eroare necunoscută') });
    }
  };

  const toggleAllergen = (allergen: string) => {
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
      ...rows.map(row => row.map(cell => `""Cell""`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alergeni_produse_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSort = (field: keyof AllergenProduct) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="allergens-page">
      <PageHeader
        title="🏷️ Gestionare Alergeni"
        description="Calculare automată din ingrediente și gestionare alergeni produse"
        actions={[
          {
            label: isRecalculating ? '⏳ Se recalculează...' : '🔄 Recalculează Tot',
            variant: 'secondary',
            onClick: handleRecalculateAll,
          },
          {
            label: '📥 Export CSV',
            variant: 'secondary',
            onClick: handleExportCSV,
          },
          {
            label: '🔄 Reîncarcă',
            variant: 'secondary',
            onClick: fetchProducts,
          },
        ]}
      />

      {feedback && (
        <InlineAlert 
          type={feedback.type} 
          message={feedback.message} 
          onClose={() => setFeedback(null)} 
        />
      )}
      {error && <InlineAlert type="error" message={error} onClose={() => setError(null)} />}

      {/* Stats Cards */}
      <div className="row mt-4">
        <div className="col-md-3">
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h3 className="mb-0">{stats.total}</h3>
              <p className="text-muted mb-0">Total Produse</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center shadow-sm border-danger">
            <Card.Body>
              <h3 className="mb-0 text-danger">{stats.withDifferences}</h3>
              <p className="text-muted mb-0">"cu diferente"</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center shadow-sm border-warning">
            <Card.Body>
              <h3 className="mb-0 text-warning">{stats.withoutAllergens}</h3>
              <p className="text-muted mb-0">Fără Alergeni</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center shadow-sm border-success">
            <Card.Body>
              <h3 className="mb-0 text-success">{stats.complete}</h3>
              <p className="text-muted mb-0">Complete</p>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-4">
        <Form.Control
          type="text"
          placeholder='[🔍_cauta_produs_categorie_sau_alergeni]'
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" size="sm" className="me-2" />"se incarca produsele"</div>
      ) : (
        <Card className="mt-4 shadow-sm">
          <Card.Body className="p-0">
            <Table striped bordered hover responsive className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th 
                    onClick={() => handleSor[id]} 
                    style={{ cursor: 'pointer' }}
                  >
                    ID {sortField === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th 
                    onClick={() => handleSor[name]} 
                    style={{ cursor: 'pointer' }}
                  >
                    🍽️ Produs {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th 
                    onClick={() => handleSor[category]} 
                    style={{ cursor: 'pointer' }}
                  >
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
                    <td style={{ fontWeight: 'bold' }}>{product.name}</td>
                    <td>{product.category}</td>
                    <td className="text-center">{product.ingredient_count}</td>
                    <td style={{
                      backgroundColor: (!product.current_allergens || product.current_allergens.trim() === '') ? '#ffebee' : 'transparent',
                      color: (!product.current_allergens || product.current_allergens.trim() === '') ? '#c62828' : 'inherit'
                    }}>
                      {product.current_allergens || 'niciunul'}
                    </td>
                    <td style={{ backgroundColor: '#e8f5e9' }}>
                      {product.calculated_allergens || 'niciunul'}
                    </td>
                    <td className="text-center">
                      {product.has_difference ? 
                        <Badge bg="warning">⚠️ DA</Badge> : 
                        <Badge bg="success">✓ OK</Badge>
                      }
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleEdit(product)}
                          title="Editează"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button 
                          variant="warning" 
                          size="sm"
                          onClick={() => handleRecalculate(product.id)}
                          title="Recalculează"
                        >
                          <i className="fas fa-sync-alt"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <div className="mt-3 text-center text-muted">
        Afișare: {filteredAndSortedProducts.length} / {products.length} produse
      </div>

      {/* Modal Editare */}
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>✏️ Editează Alergeni: {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <>
              <Alert variant="info">
                <p className="mb-1"><strong>📦 Ingrediente în rețetă:</strong> {selectedProduct.ingredient_count}</p>
                <p className="mb-1"><strong>🧮 Alergeni calculați automat:</strong> {selectedProduct.calculated_allergens || 'niciunul'}</p>
                <p className="mb-0"><strong>🏷️ Alergeni declarați curent:</strong> {selectedProduct.current_allergens || 'niciunul'}</p>
              </Alert>

              <h5 className="mt-3">"selecteaza alergenii"</h5>
              <div className="allergen-checkboxes">
                {COMMON_ALLERGENS.map(allergen => (
                  <Form.Check
                    key={allergen}
                    type="checkbox"
                    id={`allergen-"Allergen"`}
                    label={allergen}
                    checked={selectedAllergens.includes(allergen)}
                    onChange={() => toggleAllergen(allergen)}
                    className="allergen-checkbox"
                  />
                ))}
              </div>

              <Form.Group className="mt-3">
                <Form.Label>"alergeni selectati"</Form.Label>
                <Form.Control 
                  type="text" 
                  value={selectedAllergens.join(', ')} 
                  readOnly
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>"Anulează"</Button>
          <Button variant="success" onClick={handleSaveAllergens}>
            💾 Salvează Alergeni
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};




