import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { getProducts, createFastSaleOrder, checkKioskSession } from '../api/KioskApi';
import { useKioskCart } from '../hooks/useKioskCart';
import { KioskCartModal } from '../components/KioskCartModal';
import { KioskPaymentsModal } from '../components/KioskPaymentsModal';
import { KioskFiscalModal } from '../components/KioskFiscalModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../kiosk.css';

export const KioskFastSalePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [showFiscal, setShowFiscal] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const {
    items,
    totals,
    addItem,
    removeItem,
    incrementQuantity,
    decrementQuantity,
    updateItemNotes,
    clearCart,
  } = useKioskCart([]);

  useEffect(() => {
    const currentSession = checkKioskSession();
    if (!currentSession) {
      navigate('/kiosk/login');
      return;
    }
    setSession(currentSession);
    loadProducts();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      const productsData = await getProducts();
      // Filtrează doar produsele rapide (apă, cafea, sucuri, înghețată, etc.)
      const fastSaleProducts = productsData.filter((p) => {
        const category = p.category?.toLowerCase() || '';
        const name = p.name?.toLowerCase() || '';
        return (
          category.includes('băuturi') ||
          category.includes('bauturi') ||
          category.includes('cafea') ||
          category.includes('sucuri') ||
          category.includes('înghețată') ||
          category.includes('inghetata') ||
          name.includes('apă') ||
          name.includes('apa') ||
          name.includes('cafea') ||
          name.includes('suc') ||
          name.includes('cola') ||
          name.includes('pepsi')
        );
      });
      setProducts(fastSaleProducts);
      
      const uniqueCategories = [...new Set(fastSaleProducts.map((p) => p.category))];
      setCategories(uniqueCategories);
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }
    } catch (err) {
      console.error('❌ Eroare la încărcarea produselor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product) => {
    addItem(product, [], [], 1);
    setShowCart(true);
  };

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        table_id: null,
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          modifiers: item.modifiers,
          extras: item.extras,
          notes: item.notes,
        })),
        is_fast_sale: true,
        status: 'pending',
        total: totals.total,
      };

      const newOrder = await createFastSaleOrder(orderData.items);
      setOrderId(newOrder.id);
      setShowCart(false);
      setShowPayments(true);
    } catch (err) {
      console.error('❌ Eroare la crearea comenzii:', err);
      alert('Nu s-a putut crea comanda. Încearcă din nou.');
    }
  };

  const handlePaymentComplete = () => {
    setShowPayments(false);
    setShowFiscal(true);
  };

  const handleFiscalComplete = () => {
    setShowFiscal(false);
    clearCart();
    setOrderId(null);
    alert('Vânzarea rapidă a fost finalizată cu succes!');
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="kiosk-fast-sale-page">
        <div className="text-center py-5">
          <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
          <p className="mt-3">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-fast-sale-page">
      {/* Header */}
      <div className="kiosk-fast-sale-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>
              <i className="fas fa-bolt me-2"></i>Fast Sale
            </h2>
            <p className="text-muted mb-0">Vânzări rapide fără masă</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="lg" onClick={() => navigate('/kiosk/tables')}>
              <i className="fas fa-arrow-left me-2"></i>Înapoi
            </Button>
            <Button variant="primary" size="lg" onClick={() => setShowCart(true)}>
              <i className="fas fa-shopping-cart me-2"></i>
              Coș ({items.length})
              {totals.total > 0 && <span className="ms-2">{totals.total.toFixed(2)} RON</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Căutare */}
      <div className="kiosk-search-section mb-4">
        <InputGroup size="lg">
          <InputGroup.Text>
            <i className="fas fa-search"></i>
          </InputGroup.Text>
          <Form.Control
            id="kiosk-fast-sale-search"
            name="search"
            type="text"
            placeholder="Caută produs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
        </InputGroup>
      </div>

      {/* Categorii */}
      {categories.length > 0 && (
        <div className="kiosk-categories mb-4">
          <div className="d-flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'outline-primary'}
                size="lg"
                onClick={() => setSelectedCategory(category)}
                className="kiosk-category-btn"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Produse */}
      <div className="kiosk-products-grid">
        {filteredProducts.length === 0 ? (
          <Alert variant="info" className="text-center">
            <i className="fas fa-info-circle me-2"></i>Nu există produse disponibile pentru fast sale.
          </Alert>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="kiosk-product-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{product.name}</h5>
                    <p className="text-muted small mb-0">{product.description}</p>
                  </div>
                  <div className="text-end">
                    <div className="h4 text-primary mb-0">{product.price.toFixed(2)} RON</div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-100"
                  onClick={() => handleAddProduct(product)}
                >
                  <i className="fas fa-plus me-2"></i>Adaugă
                </Button>
              </Card.Body>
            </Card>
          ))
        )}
      </div>

      {/* Modal coș */}
      <KioskCartModal
        show={showCart}
        onHide={() => setShowCart(false)}
        items={items}
        totals={totals}
        onRemove={removeItem}
        onIncrement={incrementQuantity}
        onDecrement={decrementQuantity}
        onUpdateNotes={updateItemNotes}
        onSave={handleCreateOrder}
        orderId={null}
        tableId={null}
        session={session}
      />

      {/* Modal plăți */}
      {showPayments && orderId && (
        <KioskPaymentsModal
          show={showPayments}
          onHide={() => setShowPayments(false)}
          orderId={orderId}
          total={totals.total}
          session={session}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Modal fiscalizare */}
      {showFiscal && orderId && (
        <KioskFiscalModal
          show={showFiscal}
          onHide={() => setShowFiscal(false)}
          orderId={orderId}
          onFiscalComplete={handleFiscalComplete}
        />
      )}
    </div>
  );
};

