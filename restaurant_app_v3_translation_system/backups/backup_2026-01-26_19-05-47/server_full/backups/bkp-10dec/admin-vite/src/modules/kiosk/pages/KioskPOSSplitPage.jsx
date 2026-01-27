import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { 
  ShoppingCart, Send, CreditCard, Trash2, Plus, Minus, 
  ChefHat, Wine, RefreshCw, Users, Clock, Search,
  X, Check, ArrowLeft, Utensils, Bike, Car, Home, 
  UserPlus, UserMinus, Settings, Package, LogOut
} from 'lucide-react';
import { 
  getProducts, getTablesStatus, createOrder, updateOrder, 
  getOrderByTable, processPayment, checkKioskSession 
} from '../api/KioskApi';
import { useKioskTheme } from '../context/KioskThemeContext';
import { useKioskLoginModal } from '../context/KioskLoginModalContext';
import { Table2D } from '../components/Table2D';
import { useTablesPositions } from '../hooks/useTablesPositions';
import { KioskPaymentsModal } from '../components/KioskPaymentsModal';
import './KioskPOSSplitPage.css';

/**
 * KioskPOSSplitPage - POS Split Screen Enterprise
 * Layout: Stânga = Mese/Produse | Dreapta = Coș Comandă
 */
const TOTAL_TABLES = 30;

export const KioskPOSSplitPage = () => {
  const navigate = useNavigate();
  const { theme } = useKioskTheme();
  const { openLoginModal } = useKioskLoginModal();
  
  // Session
  const [session, setSession] = useState(null);
  
  // Tables State
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const { positions, loading: positionsLoading, updatePosition } = useTablesPositions(TOTAL_TABLES);
  
  // Products State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Order State
  const [cartItems, setCartItems] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  
  // Order Options
  const [orderType, setOrderType] = useState('dine-in');
  const [orderMode, setOrderMode] = useState('together');
  const [deliveryType, setDeliveryType] = useState('here');
  
  // Modifiers Modal
  const [showModifiersModal, setShowModifiersModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [itemNotes, setItemNotes] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [viewMode, setViewMode] = useState('tables');
  
  // Check session
  useEffect(() => {
    const currentSession = checkKioskSession();
    setSession(currentSession);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const productsData = await getProducts();
        setProducts(productsData || []);
        
        // Extract categories preserving order (folosește 'category' din API)
        const uniqueCategories = [];
        (productsData || []).forEach(p => {
          if (p.category && !uniqueCategories.includes(p.category)) {
            uniqueCategories.push(p.category);
          }
        });
        setCategories(uniqueCategories);
        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0]);
        }
        
        await loadTablesStatus();
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Nu s-au putut încărca datele');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load tables status
  const loadTablesStatus = useCallback(async () => {
    try {
      const tablesData = await getTablesStatus();
      const allTables = [];
      for (let i = 1; i <= TOTAL_TABLES; i++) {
        const tableData = tablesData.find((t) => t.number === i);
        allTables.push({
          number: i,
          status: tableData?.status || 'free',
          order_id: tableData?.order_id || null,
          timer: tableData?.timer || null,
          total: tableData?.total || 0,
        });
      }
      setTables(allTables);
    } catch (err) {
      console.error('Error loading tables:', err);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(loadTablesStatus, 10000);
    return () => clearInterval(interval);
  }, [loadTablesStatus]);

  // Handle table move
  const handleTableMove = useCallback((tableNumber, newX, newY) => {
    updatePosition(tableNumber, newX, newY);
  }, [updatePosition]);

  // Handle table selection
  const handleTableSelect = useCallback(async (table) => {
    if (!session) {
      openLoginModal();
      return;
    }
    
    setSelectedTable(table);
    setViewMode('products');
    setCartItems([]);
    
    if (table.status === 'occupied' && table.order_id) {
      try {
        const orderData = await getOrderByTable(table.number);
        if (orderData) {
          setActiveOrder(orderData);
          const items = typeof orderData.items === 'string' 
            ? JSON.parse(orderData.items) 
            : orderData.items;
          setCartItems(items || []);
        }
      } catch (err) {
        console.error('Error loading order:', err);
      }
    } else {
      setActiveOrder(null);
    }
  }, [session, openLoginModal]);

  // Back to tables
  const handleBackToTables = () => {
    setSelectedTable(null);
    setViewMode('tables');
    setCartItems([]);
    setActiveOrder(null);
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    navigate('/kiosk/dashboard');
  };

  // Click pe produs - deschide modal dacă are opțiuni, altfel adaugă direct
  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setSelectedModifiers([]);
    setItemNotes('');
    
    // Dacă produsul are opțiuni, deschide modalul
    if (product.customizations && product.customizations.length > 0) {
      setShowModifiersModal(true);
    } else {
      // Fără opțiuni - adaugă direct în coș
      addProductToCart(product, [], '');
    }
  }, []);

  // Adaugă produs în coș (folosit din modal și direct)
  const addProductToCart = useCallback((product, modifiers, notes) => {
    const modifierTotal = modifiers.reduce((sum, m) => sum + (m.extra_price || 0), 0);
    const finalPrice = product.price + modifierTotal;
    
    setCartItems(prev => [...prev, {
      itemId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      basePrice: product.price,
      quantity: 1,
      station: product.station || 'kitchen',
      status: 'pending',
      customizations: modifiers,
      notes: notes
    }]);
  }, []);

  // Confirmă și adaugă în coș din modal
  const handleAddToCart = useCallback(() => {
    if (selectedProduct) {
      addProductToCart(selectedProduct, selectedModifiers, itemNotes);
      setShowModifiersModal(false);
      setSelectedProduct(null);
      setSelectedModifiers([]);
      setItemNotes('');
    }
  }, [selectedProduct, selectedModifiers, itemNotes, addProductToCart]);

  // Selectează/deselectează opțiune
  const handleToggleOption = useCallback((option) => {
    console.log('🔘 CLICK pe opțiune:', option.option_name, option.id);
    setSelectedModifiers(prev => {
      const exists = prev.find(m => m.id === option.id);
      console.log('🔘 Există deja?', !!exists, 'Lista curentă:', prev.length);
      const newList = exists 
        ? prev.filter(m => m.id !== option.id)
        : [...prev, option];
      console.log('🔘 Noua listă:', newList.length);
      return newList;
    });
  }, []);

  // Update quantity
  const updateQuantity = useCallback((itemId, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.itemId === itemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((itemId) => {
    setCartItems(prev => prev.filter(item => item.itemId !== itemId));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Totals
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return {
      subtotal,
      total: subtotal,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cartItems]);

  // Submit order
  const handleSubmitOrder = useCallback(async () => {
    if (cartItems.length === 0) {
      setError('Coșul este gol!');
      return;
    }
    
    if (!selectedTable && orderType === 'dine-in') {
      setError('Selectează o masă!');
      return;
    }

    try {
      // Format items pentru backend
      const formattedItems = cartItems.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.basePrice,
        quantity: item.quantity,
        station: item.station || 'kitchen',
        status: 'pending',
        customizations: item.customizations || [],
        notes: item.notes || ''
      }));

      const orderData = {
        table_id: selectedTable?.number || selectedTable?.id || 1,
        table_number: selectedTable?.number || 1,
        type: orderType === 'dine-in' ? 'restaurant' : orderType,
        items: formattedItems,
        status: 'pending',
        isTogether: orderMode === 'together' ? 1 : 0,
        delivery_type: deliveryType
      };

      console.log('📤 Trimit comanda:', orderData);

      if (activeOrder?.id) {
        const existingItems = typeof activeOrder.items === 'string' 
          ? JSON.parse(activeOrder.items) 
          : (activeOrder.items || []);
        
        await updateOrder(activeOrder.id, { 
          items: [...existingItems, ...formattedItems],
          status: 'preparing'
        });
      } else {
        await createOrder(orderData);
      }

      setCartItems([]);
      setActiveOrder(null);
      await loadTablesStatus();
      setError(null);
      alert('✅ Comanda a fost trimisă!');
      handleBackToTables();
      
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('Eroare la trimiterea comenzii');
    }
  }, [cartItems, selectedTable, orderType, orderMode, deliveryType, activeOrder, loadTablesStatus]);

  // Payment
  const handleOpenPayment = useCallback(() => {
    if (!activeOrder?.id && cartItems.length === 0) {
      setError('Nu există comandă de încasat!');
      return;
    }
    setShowPayment(true);
  }, [activeOrder, cartItems]);

  // Filter products (folosește 'category' din API)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesSearch = !searchTerm || 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch && p.active !== false;
    });
  }, [products, selectedCategory, searchTerm]);

  // Group products by category for display (folosește 'category' din API)
  const productsByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat] = products.filter(p => p.category === cat && p.active !== false);
    });
    return grouped;
  }, [products, categories]);

  if (loading || positionsLoading) {
    return (
      <div className="pos-split-loading">
        <Spinner animation="border" variant="warning" />
        <p>Se încarcă POS...</p>
      </div>
    );
  }

  return (
    <div className="pos-split-page">
      {/* Error Alert */}
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={() => setError(null)}
          className="pos-split-alert"
        >
          {error}
        </Alert>
      )}

      {/* MAIN HEADER */}
      <div className="pos-main-header">
        <div className="pos-main-header-left">
          <Button 
            variant="outline-secondary" 
            onClick={handleBackToDashboard}
            className="pos-exit-btn"
          >
            <LogOut size={18} /> Ieșire POS
          </Button>
          <h1 className="pos-main-title">
            <ShoppingCart size={28} /> POS Vânzare
          </h1>
        </div>
        <div className="pos-main-header-right">
          <Badge bg="success" className="pos-session-badge">
            {session?.name || 'Guest'}
          </Badge>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={loadTablesStatus}
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* SPLIT CONTAINER */}
      <div className="pos-split-container">
        {/* LEFT PANEL */}
        <div className="pos-split-left">
          {/* Left Header */}
          <div className="pos-panel-header">
            {viewMode === 'products' && (
              <Button 
                variant="warning" 
                onClick={handleBackToTables}
                className="pos-back-btn"
              >
                <ArrowLeft size={18} /> Înapoi la Mese
              </Button>
            )}
            <h2 className="pos-panel-title">
              {viewMode === 'tables' ? (
                <>
                  <Users size={22} /> Plan Mese
                </>
              ) : (
                <>
                  <Utensils size={22} /> 
                  Masa {selectedTable?.number}
                  {activeOrder && (
                    <Badge bg="warning" className="ms-2">
                      #{activeOrder.id}
                    </Badge>
                  )}
                </>
              )}
            </h2>
            
            {/* Butoane Header - Dine-In / Delivery / Drive-Thru */}
            {viewMode === 'tables' && (
              <div className="pos-header-tabs">
                <button className="pos-tab-btn active">
                  <i className="fas fa-utensils"></i> Dine-In
                </button>
                <button 
                  className="pos-tab-btn"
                  onClick={() => window.open('/comanda11.html?type=delivery', '_blank')}
                >
                  <i className="fas fa-motorcycle"></i> Delivery
                </button>
                <button 
                  className="pos-tab-btn"
                  onClick={() => window.open('/comanda11.html?type=drive-thru', '_blank')}
                >
                  <i className="fas fa-car"></i> Drive-Thru
                </button>
                <div className="pos-tab-separator"></div>
                <button 
                  className="pos-action-btn btn-report"
                  onClick={() => navigate('/kiosk/reports/staff-live')}
                >
                  <i className="fas fa-chart-line"></i> Raport
                </button>
                <button 
                  className="pos-action-btn btn-shift"
                  onClick={() => navigate('/kiosk/shift-handover')}
                >
                  <i className="fas fa-clipboard-check"></i> Tură
                </button>
                <button 
                  className="pos-action-btn btn-tv"
                  onClick={() => navigate('/kiosk/menu-board')}
                >
                  <i className="fas fa-tv"></i> TV
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="pos-panel-content">
            {viewMode === 'tables' ? (
              /* TABLE MAP */
              <div className="pos-table-map">
                {tables.map((table) => {
                  const position = positions[table.number] || { 
                    x: ((table.number - 1) % 6) * 120 + 20, 
                    y: Math.floor((table.number - 1) / 6) * 130 + 20 
                  };
                  return (
                    <Table2D
                      key={`table-${table.number}`}
                      id={table.number}
                      tableNumber={table.number}
                      status={table.status}
                      timer={table.timer}
                      x={position.x}
                      y={position.y}
                      onMove={(newX, newY) => handleTableMove(table.number, newX, newY)}
                      onClick={() => handleTableSelect(table)}
                    />
                  );
                })}
              </div>
            ) : (
              /* PRODUCTS WITH CATEGORIES */
              <div className="pos-products-panel">
                {/* Search */}
                <div className="pos-search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Caută produs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button variant="link" size="sm" onClick={() => setSearchTerm('')}>
                      <X size={16} />
                    </Button>
                  )}
                </div>
                
                {/* Categories Buttons */}
                <div className="pos-category-nav">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'warning' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className="pos-category-btn"
                    >
                      {cat}
                      <Badge bg="dark" className="ms-1">
                        {productsByCategory[cat]?.length || 0}
                      </Badge>
                    </Button>
                  ))}
                </div>
                
                {/* Products Grid */}
                <div className="pos-products-content">
                  <div className="pos-products-grid">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="pos-product-card"
                        onClick={() => handleProductClick(product)}
                      >
                        {/* Station indicator */}
                        <div className="pos-product-station-icon">
                          {product.station === 'bar' ? (
                            <Wine size={14} className="text-purple" />
                          ) : (
                            <ChefHat size={14} className="text-orange" />
                          )}
                        </div>
                        
                        {/* Has customizations indicator */}
                        {product.customizations && product.customizations.length > 0 && (
                          <div className="pos-product-mods-indicator">
                            <Settings size={12} />
                            <span>{product.customizations.length}</span>
                          </div>
                        )}
                        
                        <div className="pos-product-name">{product.name}</div>
                        <div className="pos-product-price">{product.price} lei</div>
                        
                        {/* Show available customizations preview */}
                        {product.customizations && product.customizations.length > 0 && (
                          <div className="pos-product-mods-preview">
                            {product.customizations.slice(0, 3).map((mod, idx) => (
                              <span key={idx} className="pos-mod-tag">
                                {mod.option_name}
                              </span>
                            ))}
                            {product.customizations.length > 3 && (
                              <span className="pos-mod-more">+{product.customizations.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - ORDER */}
        <div className="pos-split-right">
          <div className="pos-order-header">
            <h3>
              <ShoppingCart size={20} />
              Comandă
              {totals.itemCount > 0 && (
                <Badge bg="warning" className="ms-2">{totals.itemCount}</Badge>
              )}
            </h3>
            {cartItems.length > 0 && (
              <Button variant="link" className="text-danger" onClick={clearCart}>
                <Trash2 size={16} />
              </Button>
            )}
          </div>

          {/* Order Options */}
          <div className="pos-order-options">
            <div className="pos-opt-row">
              <label>Tip:</label>
              <div className="pos-opt-btns">
                <Button 
                  variant={orderType === 'dine-in' ? 'warning' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setOrderType('dine-in')}
                >
                  <Utensils size={14} /> Restaurant
                </Button>
                <Button 
                  variant={orderType === 'delivery' ? 'warning' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setOrderType('delivery')}
                >
                  <Bike size={14} /> Delivery
                </Button>
              </div>
            </div>

            <div className="pos-opt-row">
              <label>Servire:</label>
              <div className="pos-opt-btns">
                <Button 
                  variant={deliveryType === 'here' ? 'success' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setDeliveryType('here')}
                >
                  <Home size={14} /> Pentru Aici
                </Button>
                <Button 
                  variant={deliveryType === 'home' ? 'success' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setDeliveryType('home')}
                >
                  <Car size={14} /> Pentru Acasă
                </Button>
              </div>
            </div>

            <div className="pos-opt-row">
              <label>Plată:</label>
              <div className="pos-opt-btns">
                <Button 
                  variant={orderMode === 'together' ? 'info' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setOrderMode('together')}
                >
                  <UserPlus size={14} /> Împreună
                </Button>
                <Button 
                  variant={orderMode === 'separate' ? 'info' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setOrderMode('separate')}
                >
                  <UserMinus size={14} /> Separat
                </Button>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="pos-order-items">
            {cartItems.length === 0 ? (
              <div className="pos-order-empty">
                <ShoppingCart size={48} strokeWidth={1} />
                <p>Coșul este gol</p>
                <small>Selectează o masă și adaugă produse</small>
              </div>
            ) : (
              cartItems.map((item) => {
                // Verifică dacă produsul are opțiuni disponibile
                const originalProduct = products.find(p => p.id === item.productId);
                const hasOptions = originalProduct?.customizations?.length > 0;
                
                return (
                  <div key={item.itemId} className="pos-cart-item">
                    <div className="pos-cart-item-info">
                      <div className="pos-cart-item-header">
                        <div className="pos-cart-item-name">{item.name}</div>
                      </div>
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="pos-cart-item-mods">
                          {item.customizations.map((mod, idx) => (
                            <span key={idx} className="pos-cart-mod">
                              + {mod.option_name} {mod.extra_price > 0 && `(+${mod.extra_price})`}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.notes && (
                        <div className="pos-cart-item-notes">📝 {item.notes}</div>
                      )}
                      <div className="pos-cart-item-price">
                        {(item.price * item.quantity).toFixed(2)} lei
                      </div>
                    </div>
                    <div className="pos-cart-item-qty">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => updateQuantity(item.itemId, -1)}
                      >
                        <Minus size={14} />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => updateQuantity(item.itemId, 1)}
                      >
                        <Plus size={14} />
                      </Button>
                      <Button
                        variant="link"
                        className="text-danger"
                        onClick={() => removeFromCart(item.itemId)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="pos-order-footer">
            <div className="pos-order-total">
              <span>Total</span>
              <span className="pos-total-amount">{totals.total.toFixed(2)} lei</span>
            </div>
            
            <div className="pos-order-actions">
              {cartItems.length > 0 ? (
                <Button
                  variant="warning"
                  size="lg"
                  className="pos-btn-send"
                  onClick={handleSubmitOrder}
                >
                  <Send size={20} /> Trimite
                </Button>
              ) : activeOrder ? (
                <Button
                  variant="success"
                  size="lg"
                  className="pos-btn-pay"
                  onClick={handleOpenPayment}
                >
                  <CreditCard size={20} /> Încasează
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Modifiers Overlay */}
      {showModifiersModal && selectedProduct && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h5>
                <Settings size={20} className="me-2" />
                Personalizează: {selectedProduct.name}
              </h5>
              <button 
                className="custom-modal-close"
                onClick={() => {
                  setShowModifiersModal(false);
                  setSelectedModifiers([]);
                  setItemNotes('');
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="custom-modal-body">
              {selectedProduct.customizations && selectedProduct.customizations.length > 0 ? (
                <>
                  <h6 className="text-warning mb-3">Extra opțiuni disponibile:</h6>
                  <div className="custom-options-grid">
                    {selectedProduct.customizations.map((mod) => {
                      const isSelected = selectedModifiers.find(m => m.id === mod.id);
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          className={`custom-option-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            console.log('👆 CLICK!', mod.option_name);
                            handleToggleOption(mod);
                          }}
                        >
                          <span className="custom-option-check">
                            {isSelected ? '✓' : '○'}
                          </span>
                          <span>{mod.option_name}</span>
                          {mod.extra_price > 0 && (
                            <span className="custom-option-price">+{mod.extra_price} lei</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-muted">Nu există opțiuni suplimentare.</p>
              )}
              
              <div className="custom-notes-section">
                <label>Notițe speciale:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Fără ceapă, extra sos..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                />
              </div>
              
              <div className="custom-price-preview">
                <span>Preț final:</span>
                <span className="custom-price-total">
                  {(selectedProduct.price || 0) + selectedModifiers.reduce((s, m) => s + (m.extra_price || 0), 0)} lei
                </span>
              </div>
            </div>
            
            <div className="custom-modal-footer">
              <button 
                className="custom-btn-cancel"
                onClick={() => {
                  setShowModifiersModal(false);
                  setSelectedModifiers([]);
                  setItemNotes('');
                }}
              >
                Anulează
              </button>
              <button 
                className="custom-btn-add"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} /> Adaugă în Coș
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && activeOrder && (
        <KioskPaymentsModal
          show={showPayment}
          onHide={() => setShowPayment(false)}
          orderId={activeOrder.id}
          total={activeOrder.total || totals.total}
          onPaymentComplete={() => {
            setShowPayment(false);
            handleBackToTables();
            loadTablesStatus();
          }}
        />
      )}
    </div>
  );
};

export default KioskPOSSplitPage;
