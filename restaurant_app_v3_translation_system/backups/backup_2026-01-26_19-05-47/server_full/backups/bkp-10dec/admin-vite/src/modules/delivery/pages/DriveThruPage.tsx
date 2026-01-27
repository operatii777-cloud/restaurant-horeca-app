// =====================================================================
// DRIVE-THRU PAGE
// POS simplificat pentru comenzi drive-thru
// =====================================================================

import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Badge, Alert } from 'react-bootstrap';
import './DriveThruPage.css';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image?: string;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface DriveThruOrder {
  id: number;
  lane_number: string;
  car_plate?: string;
  items: any[];
  total: number;
  status: string;
  wait_time_minutes: number;
}

interface Stats {
  orders_today: number;
  avg_service_time_seconds: number;
  current_queue_length: number;
  slow_orders_count: number;
}

export const DriveThruPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Toate');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [laneNumber, setLaneNumber] = useState('A1');
  const [carPlate, setCarPlate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [queue, setQueue] = useState<DriveThruOrder[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [alert, setAlert] = useState<{type: string, message: string} | null>(null);

  // Încarcă produse
  useEffect(() => {
    fetchProducts();
    fetchQueue();
    fetchStats();
    
    const interval = setInterval(() => {
      fetchQueue();
      fetchStats();
    }, 10000); // Refresh la 10s
    
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/menu/all');
      const data = await response.json();
      if (data.success) {
        setProducts(data.menu);
        const cats = ['Toate', ...Array.from(new Set(data.menu.map((p: Product) => p.category)))];
        setCategories(cats);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/orders/drive-thru/queue');
      const data = await response.json();
      if (data.success) {
        setQueue(data.orders);
      }
    } catch (err) {
      console.error('Error loading queue:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/orders/drive-thru/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => {
    setCart([]);
    setCarPlate('');
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      setAlert({ type: 'warning', message: 'Coșul este gol!' });
      return;
    }

    if (!paymentMethod) {
      setAlert({ type: 'warning', message: 'Selectează metoda de plată!' });
      return;
    }

    try {
      const orderData = {
        lane_number: laneNumber,
        car_plate: carPlate || null,
        items: JSON.stringify(cart.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))),
        total: calculateTotal(),
        payment_method: paymentMethod
      };

      const response = await fetch('/api/orders/drive-thru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (data.success) {
        setAlert({ type: 'success', message: `Comandă #${data.order_id} creată cu succes!` });
        clearCart();
        fetchQueue();
        fetchStats();
      } else {
        setAlert({ type: 'danger', message: data.error || 'Eroare la creare comandă' });
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Eroare de conexiune' });
    }
  };

  const completeOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/drive-thru/${orderId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: `Comandă #${orderId} finalizată!` });
        fetchQueue();
        fetchStats();
      }
    } catch (err) {
      console.error('Error completing order:', err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Toate' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="drive-thru-page">
      {/* Header cu KPI-uri */}
      <div className="drive-thru-header">
        <h2>🚗 Drive-Thru</h2>
        {stats && (
          <div className="drive-thru-kpis">
            <div className="kpi-card">
              <div className="kpi-value">{stats.orders_today}</div>
              <div className="kpi-label">Comenzi Azi</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{formatTime(stats.avg_service_time_seconds)}</div>
              <div className="kpi-label">Timp Mediu</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{stats.current_queue_length}</div>
              <div className="kpi-label">În Coadă</div>
            </div>
            {stats.slow_orders_count > 0 && (
              <div className="kpi-card alert-kpi">
                <div className="kpi-value">⚠️ {stats.slow_orders_count}</div>
                <div className="kpi-label">Peste 5 min</div>
              </div>
            )}
          </div>
        )}
      </div>

      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}

      <div className="drive-thru-content">
        {/* Produse (stânga) */}
        <div className="drive-thru-products">
          {/* Filtru categorie */}
          <div className="category-buttons">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Search */}
          <Form.Control
            type="text"
            placeholder="🔍 Caută produs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />

          {/* Grid produse */}
          <div className="products-grid">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className="product-card"
                onClick={() => addToCart(product)}
              >
                {product.image && <Card.Img variant="top" src={product.image} />}
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text className="product-price">{product.price.toFixed(2)} RON</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>

        {/* Comandă (dreapta) */}
        <div className="drive-thru-order">
          <Card>
            <Card.Header>
              <h5>📋 Comandă Curentă</h5>
            </Card.Header>
            <Card.Body>
              {/* Lane & Car */}
              <Form.Group className="mb-3">
                <Form.Label>Bandă</Form.Label>
                <Form.Select value={laneNumber} onChange={(e) => setLaneNumber(e.target.value)}>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Număr Mașină (opțional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: B-123-ABC"
                  value={carPlate}
                  onChange={(e) => setCarPlate(e.target.value.toUpperCase())}
                />
              </Form.Group>

              {/* Cart Items */}
              <div className="cart-items">
                {cart.length === 0 ? (
                  <p className="text-muted text-center">Coșul este gol</p>
                ) : (
                  cart.map(item => (
                    <div key={item.productId} className="cart-item">
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span>{item.price.toFixed(2)} RON</span>
                      </div>
                      <div className="cart-item-controls">
                        <Button size="sm" variant="outline-secondary" onClick={() => updateQuantity(item.productId, -1)}>−</Button>
                        <span className="cart-qty">{item.quantity}</span>
                        <Button size="sm" variant="outline-secondary" onClick={() => updateQuantity(item.productId, 1)}>+</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Method */}
              <Form.Group className="mb-3">
                <Form.Label>Metoda Plată</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    label="💵 Cash"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="💳 Card"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                </div>
              </Form.Group>

              {/* Total */}
              <div className="cart-total">
                <strong>TOTAL:</strong>
                <strong>{calculateTotal().toFixed(2)} RON</strong>
              </div>

              {/* Actions */}
              <div className="cart-actions">
                <Button variant="danger" onClick={clearCart} disabled={cart.length === 0}>
                  Golește
                </Button>
                <Button variant="success" onClick={submitOrder} disabled={cart.length === 0}>
                  Plasează Comandă
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Queue */}
          <Card className="mt-3">
            <Card.Header>
              <h6>🚦 Coadă ({queue.length})</h6>
            </Card.Header>
            <Card.Body className="queue-list">
              {queue.map(order => (
                <div key={order.id} className={`queue-item ${order.wait_time_minutes > 5 ? 'slow' : ''}`}>
                  <div>
                    <strong>#{order.id}</strong> - {order.lane_number}
                    {order.car_plate && <span className="text-muted"> ({order.car_plate})</span>}
                    <br />
                    <small>
                      {order.wait_time_minutes}min - 
                      <Badge bg={order.status === 'completed' ? 'success' : 'warning'} className="ms-1">
                        {order.status}
                      </Badge>
                    </small>
                  </div>
                  {order.status === 'completed' && (
                    <Button size="sm" variant="success" onClick={() => completeOrder(order.id)}>
                      Servit
                    </Button>
                  )}
                </div>
              ))}
              {queue.length === 0 && <p className="text-muted text-center mb-0">Nicio comandă în așteptare</p>}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriveThruPage;

