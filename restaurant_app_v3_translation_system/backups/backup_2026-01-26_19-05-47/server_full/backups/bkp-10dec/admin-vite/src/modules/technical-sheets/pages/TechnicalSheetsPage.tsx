import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { httpClient } from '@/shared/api/httpClient';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TechnicalSheetsPage.css';

interface TechnicalSheet {
  id: number;
  product_id: number;
  name_ro: string;
  name_en?: string;
  category: string;
  allergens: string;
  portion_size_grams: number;
  cost_per_portion: number;
  status: 'draft' | 'approved' | 'locked' | 'archived';
  approved_by_chef?: string;
  approved_by_manager?: string;
}

interface Product {
  id: number;
  name: string;
  name_en?: string;
  category: string;
}

interface Recipe {
  id: number;
  product_id: number;
  name?: string;
  description?: string;
}

export const TechnicalSheetsPage = () => {
  const [sheets, setSheets] = useState<TechnicalSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<TechnicalSheet | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // State pentru modal
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/technical-sheets');
      setSheets(response.data?.data || []);
    } catch (error) {
      console.error('Error loading technical sheets:', error);
      setFeedback({ type: 'error', message: 'Eroare la încărcarea fișelor tehnice' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Încarcă produsele care au rețete definite
   */
  const loadProductsWithRecipes = async () => {
    setLoadingProducts(true);
    try {
      const response = await httpClient.get('/api/catalog-produse/products', {
        params: { has_recipe: 1, is_active: 1 }
      });
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Error loading products with recipes:', error);
      setFeedback({ type: 'error', message: 'Eroare la încărcarea produselor' });
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  /**
   * Încarcă rețetele pentru un produs selectat
   */
  const loadRecipesForProduct = async (productId: number) => {
    setLoadingRecipes(true);
    setRecipes([]);
    setSelectedRecipeId(null);
    
    try {
      const response = await httpClient.get(`/api/recipes/product/${productId}`);
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        setRecipes(response.data.data);
      } else if (Array.isArray(response.data)) {
        setRecipes(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setRecipes(response.data.data);
      } else {
        setRecipes([]);
      }
    } catch (error: any) {
      console.error('Error loading recipes:', error);
      setFeedback({ type: 'error', message: 'Eroare la încărcarea rețetelor' });
      setRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };

  /**
   * Generează fișă tehnică din rețetă
   */
  const generateFromRecipe = async (productId: number, recipeId: number) => {
    if (!productId || !recipeId) {
      setFeedback({ type: 'error', message: 'Selectează un produs și o rețetă' });
      return;
    }

    setGenerating(true);
    try {
      const response = await httpClient.post('/api/technical-sheets/generate', {
        product_id: productId,
        recipe_id: recipeId
      });
      
      if (response.data?.success) {
        setFeedback({ type: 'success', message: 'Fișă tehnică generată cu succes!' });
        setShowModal(false);
        // Reset modal state
        setSelectedProductId(null);
        setSelectedRecipeId(null);
        setRecipes([]);
        // Reload sheets
        loadSheets();
      } else {
        setFeedback({ type: 'error', message: response.data?.error || 'Eroare la generare' });
      }
    } catch (error: any) {
      console.error('Error generating technical sheet:', error);
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la generare' });
    } finally {
      setGenerating(false);
    }
  };

  const approveByChef = async (sheetId: number) => {
    try {
      const chefName = prompt('Nume Chef:');
      if (!chefName) return;
      
      const notes = prompt('Notițe (opțional):');
      
      await httpClient.post(`/api/technical-sheets/${sheetId}/approve-chef`, {
        chef_name: chefName,
        notes
      });
      
      setFeedback({ type: 'success', message: 'Aprobat de Chef!' });
      loadSheets();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la aprobare' });
    }
  };

  const approveByManager = async (sheetId: number) => {
    try {
      const managerName = prompt('Nume Manager:');
      if (!managerName) return;
      
      const notes = prompt('Notițe (opțional):');
      
      await httpClient.post(`/api/technical-sheets/${sheetId}/approve-manager`, {
        manager_name: managerName,
        notes
      });
      
      setFeedback({ type: 'success', message: 'Aprobat de Manager! PDF generat automat.' });
      loadSheets();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la aprobare' });
    }
  };

  const lockSheet = async (sheetId: number) => {
    if (!confirm('Ești sigur? Fișa LOCKED nu mai poate fi modificată!')) return;
    
    try {
      const reason = prompt('Motiv lock:') || 'Aprobat final';
      
      await httpClient.post(`/api/technical-sheets/${sheetId}/lock`, {
        locked_by: 'Admin',
        reason
      });
      
      setFeedback({ type: 'success', message: 'Fișă tehnică LOCKED!' });
      loadSheets();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Eroare la lock' });
    }
  };

  const downloadPDF = async (sheetId: number) => {
    try {
      const response = await httpClient.get(`/api/technical-sheets/${sheetId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `fisa-tehnica-${sheetId}.pdf`;
      link.click();
    } catch (error) {
      setFeedback({ type: 'error', message: 'Eroare la descărcare PDF' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'draft': 'secondary',
      'approved': 'success',
      'locked': 'primary',
      'archived': 'dark'
    };
    
    return <Badge bg={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="technical-sheets-page">
      <PageHeader 
        title="Fișe Tehnice de Produs"
        subtitle="Conform Ordin ANSVSA 201/2022 + UE 1169/2011"
      />

      {feedback && (
        <Alert variant={feedback.type === 'success' ? 'success' : 'danger'} dismissible onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Lista Fișe Tehnice</h5>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <i className="fas fa-plus me-2"></i>
              Generează Fișă Nouă
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : sheets.length === 0 ? (
            <Alert variant="info">
              Nu există fișe tehnice. Generează prima fișă din rețete!
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produs</th>
                  <th>Categorie</th>
                  <th>Alergeni</th>
                  <th>Gramaj</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {sheets.map(sheet => {
                  const allergens = JSON.parse(sheet.allergens || '[]');
                  
                  return (
                    <tr key={sheet.id}>
                      <td>{sheet.id}</td>
                      <td>
                        <strong>{sheet.name_ro}</strong>
                        {sheet.name_en && <div className="text-muted small">{sheet.name_en}</div>}
                      </td>
                      <td>{sheet.category}</td>
                      <td>
                        {allergens.length > 0 ? (
                          <div className="allergen-badges">
                            {allergens.map((a: string) => (
                              <Badge key={a} bg="danger" className="me-1">{a}</Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge bg="success">Fără alergeni</Badge>
                        )}
                      </td>
                      <td>{sheet.portion_size_grams}g</td>
                      <td>{sheet.cost_per_portion?.toFixed(2)} RON</td>
                      <td>{getStatusBadge(sheet.status)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {sheet.status === 'draft' && (
                            <>
                              <Button variant="success" size="sm" onClick={() => approveByChef(sheet.id)}>
                                👨‍🍳 Chef
                              </Button>
                              <Button variant="primary" size="sm" onClick={() => approveByManager(sheet.id)}>
                                👔 Manager
                              </Button>
                            </>
                          )}
                          
                          {sheet.status === 'approved' && (
                            <Button variant="warning" size="sm" onClick={() => lockSheet(sheet.id)}>
                              🔒 Lock
                            </Button>
                          )}
                          
                          <Button variant="info" size="sm" onClick={() => downloadPDF(sheet.id)}>
                            📄 PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal pentru generare fișă nouă */}
      <Modal 
        show={showModal} 
        onHide={() => {
          setShowModal(false);
          setSelectedProductId(null);
          setSelectedRecipeId(null);
          setRecipes([]);
        }} 
        size="lg"
        onShow={loadProductsWithRecipes}
      >
        <Modal.Header closeButton>
          <Modal.Title>Generează Fișă Tehnică</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            Selectează un produs cu rețetă pentru a genera automat fișa tehnică.
            Sistemul va calcula automat: alergeni, aditivi, valori nutriționale, cost FIFO.
          </Alert>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Produs {loadingProducts && <span className="spinner-border spinner-border-sm ms-2" />}
              </Form.Label>
              <Form.Select
                value={selectedProductId || ''}
                onChange={(e) => {
                  const productId = parseInt(e.target.value);
                  setSelectedProductId(productId || null);
                  setSelectedRecipeId(null);
                  if (productId) {
                    loadRecipesForProduct(productId);
                  } else {
                    setRecipes([]);
                  }
                }}
                disabled={loadingProducts}
              >
                <option value="">Selectează produs...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.name_en ? `(${product.name_en})` : ''} - {product.category}
                  </option>
                ))}
              </Form.Select>
              {products.length === 0 && !loadingProducts && (
                <Form.Text className="text-muted">
                  Nu există produse cu rețete definite.
                </Form.Text>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                Rețetă {loadingRecipes && <span className="spinner-border spinner-border-sm ms-2" />}
              </Form.Label>
              <Form.Select
                value={selectedRecipeId || ''}
                onChange={(e) => setSelectedRecipeId(parseInt(e.target.value) || null)}
                disabled={!selectedProductId || loadingRecipes || recipes.length === 0}
              >
                <option value="">Selectează rețetă...</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    Rețetă #{recipe.id} {recipe.name ? `- ${recipe.name}` : ''}
                  </option>
                ))}
              </Form.Select>
              {selectedProductId && !loadingRecipes && recipes.length === 0 && (
                <Form.Text className="text-warning">
                  Acest produs nu are rețete definite.
                </Form.Text>
              )}
              {selectedProductId && loadingRecipes && (
                <Form.Text className="text-muted">
                  Se încarcă rețetele...
                </Form.Text>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowModal(false);
              setSelectedProductId(null);
              setSelectedRecipeId(null);
              setRecipes([]);
            }}
            disabled={generating}
          >
            Anulează
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (selectedProductId && selectedRecipeId) {
                generateFromRecipe(selectedProductId, selectedRecipeId);
              } else {
                setFeedback({ type: 'error', message: 'Selectează un produs și o rețetă' });
              }
            }}
            disabled={!selectedProductId || !selectedRecipeId || generating}
          >
            {generating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Se generează...
              </>
            ) : (
              'Generează Fișă Tehnică'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

