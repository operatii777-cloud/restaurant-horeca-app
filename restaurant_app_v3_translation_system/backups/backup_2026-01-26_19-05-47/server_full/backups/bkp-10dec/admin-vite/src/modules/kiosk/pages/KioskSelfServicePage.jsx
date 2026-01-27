import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, Spinner } from 'react-bootstrap';
import { 
  ShoppingCart, Plus, Minus, Trash2, CreditCard, 
  ChefHat, Clock, Check, X, ArrowLeft
} from 'lucide-react';
import './KioskSelfServicePage.css';

/**
 * KioskSelfServicePage - Self-Service Ordering Kiosk
 * Fullscreen mode for customer tablets
 * Features:
 * - Browse menu by category
 * - Add to cart with modifiers
 * - Checkout flow
 * - Order confirmation
 */
export const KioskSelfServicePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  // Load menu data
  const loadMenu = useCallback(async () => {
    try {
      // Fetch categories
      let cats = [];
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        cats = Array.isArray(catData) ? catData : (catData.categories || []);
      } catch (e) {
        console.warn('Could not load categories:', e);
      }
      setCategories(cats);
      
      // Fetch products
      let prods = [];
      try {
        const prodRes = await fetch('/api/products?active=true');
        const prodData = await prodRes.json();
        prods = Array.isArray(prodData) ? prodData : (prodData.products || []);
      } catch (e) {
        console.warn('Could not load products:', e);
      }
      setProducts(prods);
      
      // Set first category as default
      if (cats.length > 0) {
        setSelectedCategory(cats[0].id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading menu:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Get products for selected category
  const getCategoryProducts = () => {
    if (!selectedCategory) return products;
    return products.filter(p => p.category_id === selectedCategory);
  };

  // Add to cart
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Update quantity
  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Calculate total
  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Place order
  const placeOrder = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'kiosk',
          items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total: getTotal()
        })
      });
      
      const data = await res.json();
      setOrderNumber(data.order_number || data.id || Math.floor(Math.random() * 900) + 100);
      setShowConfirmation(true);
      setShowCart(false);
      setCart([]);
    } catch (err) {
      console.error('Error placing order:', err);
    }
  };

  if (loading) {
    return (
      <div className="self-service-page self-service-page--loading">
        <Spinner animation="border" variant="warning" />
        <p>Se încarcă meniul...</p>
      </div>
    );
  }

  return (
    <div className="self-service-page">
      {/* Header */}
      <div className="self-service-header">
        <div className="self-service-logo">
          <ChefHat size={32} />
          <span>Comandă Self-Service</span>
        </div>
        <Button 
          variant="warning" 
          className="self-service-cart-btn"
          onClick={() => setShowCart(true)}
        >
          <ShoppingCart size={20} />
          <span>Coș</span>
          {cart.length > 0 && (
            <Badge bg="danger" className="self-service-cart-badge">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Categories */}
      <div className="self-service-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`self-service-category ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="self-service-category__icon">{cat.icon || '🍽️'}</span>
            <span className="self-service-category__name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="self-service-products">
        {getCategoryProducts().map((product) => (
          <Card key={product.id} className="self-service-product" onClick={() => addToCart(product)}>
            <div className="self-service-product__image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="self-service-product__placeholder">
                  <ChefHat size={48} />
                </div>
              )}
            </div>
            <Card.Body>
              <h4 className="self-service-product__name">{product.name}</h4>
              <p className="self-service-product__price">{product.price?.toFixed(2)} RON</p>
              <Button variant="success" className="self-service-product__add">
                <Plus size={20} /> Adaugă
              </Button>
            </Card.Body>
          </Card>
        ))}
        
        {getCategoryProducts().length === 0 && (
          <div className="self-service-empty">
            <p>Nu există produse în această categorie</p>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <Modal 
        show={showCart} 
        onHide={() => setShowCart(false)} 
        fullscreen="md-down"
        className="self-service-cart-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <ShoppingCart size={24} className="me-2" />
            Coșul Tău ({cart.length} produse)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cart.length === 0 ? (
            <div className="self-service-cart-empty">
              <ShoppingCart size={64} />
              <h3>Coșul este gol</h3>
              <p>Adaugă produse pentru a continua</p>
            </div>
          ) : (
            <div className="self-service-cart-items">
              {cart.map((item) => (
                <div key={item.id} className="self-service-cart-item">
                  <div className="self-service-cart-item__info">
                    <h4>{item.name}</h4>
                    <p>{item.price?.toFixed(2)} RON</p>
                  </div>
                  <div className="self-service-cart-item__controls">
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="self-service-cart-item__qty">{item.quantity}</span>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus size={16} />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="self-service-cart-item__subtotal">
                    {(item.price * item.quantity).toFixed(2)} RON
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        {cart.length > 0 && (
          <Modal.Footer className="self-service-cart-footer">
            <div className="self-service-cart-total">
              <span>Total:</span>
              <strong>{getTotal().toFixed(2)} RON</strong>
            </div>
            <Button variant="success" size="lg" onClick={placeOrder}>
              <CreditCard size={20} className="me-2" />
              Plasează Comanda
            </Button>
          </Modal.Footer>
        )}
      </Modal>

      {/* Order Confirmation */}
      <Modal 
        show={showConfirmation} 
        onHide={() => setShowConfirmation(false)}
        centered
        className="self-service-confirmation-modal"
      >
        <Modal.Body className="text-center py-5">
          <div className="self-service-confirmation">
            <div className="self-service-confirmation__icon">
              <Check size={64} />
            </div>
            <h2>Comandă Plasată!</h2>
            <p className="self-service-confirmation__number">
              Numărul comenzii tale:
              <strong>#{orderNumber}</strong>
            </p>
            <p>Vei fi anunțat când comanda este gata.</p>
            <div className="self-service-confirmation__timer">
              <Clock size={20} />
              <span>Timp estimat: 10-15 minute</span>
            </div>
            <Button 
              variant="warning" 
              size="lg" 
              onClick={() => setShowConfirmation(false)}
              className="mt-4"
            >
              Comandă Nouă
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default KioskSelfServicePage;

