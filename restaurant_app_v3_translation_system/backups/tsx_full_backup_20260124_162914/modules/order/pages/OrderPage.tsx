// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Order Page (Comanda)
 * 
 * React implementation replacing comanda.html.
 * Main interface for creating orders (menu, cart, table selection).
 */

import React, { useEffect, useState } from 'react';
import { useOrderStore, type MenuItem, type CartItem } from '../orderStore';
import { getMenuItems, getCategories, createOrder, getTables } from '../api/orderApi';
import { useOrderEvents } from '@/core/hooks/useOrderEvents';
import './OrderPage.css';

/**
 * Order Page Component
 */
export function OrderPage() {
//   const { t } = useTranslation();
  const {
    menuItems,
    categories,
    selectedCategory,
    cart,
    selectedTable,
    orderType,
    notes,
    isCartOpen,
    isLoading,
    setMenuItems,
    setCategories,
    setSelectedCategory,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setSelectedTable: setTable,
    setOrderType,
    setNotes,
    toggleCart,
    setLoading,
    getCartTotal,
    getCartItemCount,
    getFilteredMenuItems,
  } = useOrderStore();
  
  const [tables, setTables] = useState<Array<{ id: number; number: string; status?: string }>>([]);
  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<number, Customization[]>>({});
  
  // Sync with order events (optional, for real-time updates)
  useOrderEvents();
  
  // Load menu and categories on mount
  useEffect(() => {
    loadMenu();
    loadTables();
  }, [lang]);
  
  const loadMenu = async () => {
    try {
      setLoading(true);
      const [menuData, categoriesData] = await Promise.all([
        getMenuItems(lang),
        getCategories(lang),
      ]);
      setMenuItems(menuData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('OrderPage Error loading menu:', error);
      alert('Eroare la încărcarea meniului');
    } finally {
      setLoading(false);
    }
  };
  
  const loadTables = async () => {
    try {
      const tablesData = await getTables();
      setTables(tablesData);
    } catch (error) {
      console.error('OrderPage Error loading tables:', error);
    }
  };
  
  const handleAddToCart = (product: MenuItem) => {
    const customizations = selectedCustomizations[product.id] || [];
    addToCart(product, 1, customizations);
    // Reset customizations for this product
    setSelectedCustomizations(prev => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };
  
  const handleCustomizationToggle = (productId: number, customization: Customization) => {
    setSelectedCustomizations(prev => {
      const current = prev[productId] || [];
      const exists = current.find(c => c.id === customization.id);
      
      if (exists) {
        // Remove if already selected
        return {
          ...prev,
          [productId]: current.filter(c => c.id !== customization.id),
        };
      } else {
        // Add if not selected
        // Check if exclusive - remove others if so
        if (customization.is_exclusive) {
          return {
            ...prev,
            [productId]: 'customization',
          };
        }
        return {
          ...prev,
          [productId]: [...current, customization],
        };
      }
    });
  };
  
  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      alert('Coșul este gol');
      return;
    }
    
    if (!orderType) {
      alert('Selectează tipul comenzii');
      return;
    }
    
    if (orderType === 'dine_in' && !selectedTable) {
      alert('Selectează o masă');
      return;
    }
    
    try {
      setLoading(true);
      
      const orderItems = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        customizations: item.customizations.map(c => ({ id: c.id })),
        isFree: item.isFree || false,
      }));
      
      const total = getCartTotal();
      
      const result = await createOrder({
        items: orderItems,
        table: selectedTable,
        type: orderType,
        notes,
        total,
      });
      
      if (result.success) {
        alert(`Comandă creată cu succes! ID: ${result.orderId}`);
        clearCart();
        setTable(null);
        setOrderType(null);
        setNotes('');
        toggleCart();
      }
    } catch (error: any) {
      console.error('OrderPage Error creating order:', error);
      alert(`Eroare la crearea comenzii: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredItems = getFilteredMenuItems();
  
  return (
    <div className="order-page">
      {/* Top Bar */}
      <header className="order-top-bar">
        <div className="order-restaurant-name">"Restaurant"</div>
        <div className="order-header-actions">
          <button className="order-cart-btn" onClick={toggleCart}>
            🛒 Coș ({getCartItemCount()})
          </button>
          <button className="order-lang-btn" onClick={() => setLang(lang === 'ro' ? 'en' : 'ro')}>
            {lang === 'ro' ? 'EN' : 'RO'}
          </button>
        </div>
      </header>
      
      {/* Categories */}
      <div className="order-categories">
        <button
          className={`order-category-btn ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >"Toate"</button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`order-category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {lang === 'ro' ? cat.name : cat.name_en || cat.name}
          </button>
        ))}
      </div>
      
      {/* Menu Items */}
      <div className="order-menu-container">
        {isLoading ? (
          <div className="order-loading">"se incarca"</div>
        ) : (
          <div className="order-menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="order-product-card">
                {item.image_url && (
                  <div className="order-product-image">
                    <img src={item.image_url} alt={item.name} />
                  </div>
                )}
                <div className="order-product-info">
                  <h3 className="order-product-name">
                    {lang === 'ro' ? item.name : item.name_en || item.name}
                  </h3>
                  <p className="order-product-description">
                    {lang === 'ro' ? item.description : item.description_en || item.description}
                  </p>
                  <div className="order-product-price">
                    {item.price.toFixed(2)} RON
                  </div>
                  
                  {item.customizations && item.customizations.length > 0 && (
                    <div className="order-customizations">
                      {item.customizations.map((custom) => {
                        const isSelected = (selectedCustomizations[item.id] || []).some(c => c.id === custom.id);
                        return (
                          <label key={custom.id} className="order-customization-option">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCustomizationToggle(item.id, custom)}
                            />
                            <span>
                              {custom.option_name}
                              {custom.extra_price > 0 && ` (+${custom.extra_price.toFixed(2)} RON)`}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  
                  <button
                    className="order-add-btn"
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.is_available}
                  >
                    {item.is_available ? 'Adaugă în Coș' : 'Indisponibil'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Cart Modal */}
      {isCartOpen && (
        <div className="order-cart-modal" onClick={(e) => {
          if (e.target === e.currentTarget) toggleCart();
        }}>
          <div className="order-cart-content" onClick={(e) => e.stopPropagation()}>
            <div className="order-cart-header">
              <h2>"cos de cumparaturi"</h2>
              <button className="order-cart-close" onClick={toggleCart}>×</button>
            </div>
            
            <div className="order-cart-items">
              {cart.length === 0 ? (
                <div className="order-cart-empty">"cosul este gol"</div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="order-cart-item">
                    <div className="order-cart-item-info">
                      <div className="order-cart-item-name">
                        {lang === 'ro' ? item.product.name : item.product.name_en || item.product.name}
                        {item.isFree && <span className="order-cart-item-free"> (GRATUIT)</span>}
                      </div>
                      <div className="order-cart-item-price">
                        {item.isFree ? '0.00' : ((item.product.price + item.customizations.reduce((sum, c) => sum + c.extra_price, 0)) * item.quantity).toFixed(2)} RON
                      </div>
                    </div>
                    <div className="order-cart-item-actions">
                      <button onClick={() => updateCartQuantity(item.cartId, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.cartId, 1)}>+</button>
                      <button onClick={() => removeFromCart(item.cartId)} className="order-cart-remove">🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <>
                <div className="order-cart-total">
                  <strong>Total: {getCartTotal().toFixed(2)} RON</strong>
                </div>
                
                <div className="order-cart-form">
                  <div className="order-form-group">
                    <label>"tip comanda"</label>
                    <select value={orderType || ''} onChange={(e) => setOrderType(e.target.value as any)}>
                      <option value="">"Selectează..."</option>
                      <option value="dine_in">"la masa"</option>
                      <option value="takeout">Takeaway</option>
                      <option value="delivery">Livrare</option>
                    </select>
                  </div>
                  
                  {orderType === 'dine_in' && (
                    <div className="order-form-group">
                      <label>"Masă:"</label>
                      <select value={selectedTable || ''} onChange={(e) => setTable(e.target.value)}>
                        <option value="">"selecteaza masa"</option>
                        {tables.map((table) => (
                          <option key={table.id} value={table.number}>
                            Masa {table.number}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="order-form-group">
                    <label>Note:</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="note pentru comanda"
                      rows={3}
                    />
                  </div>
                  
                  <button
                    className="order-submit-btn"
                    onClick={handleCreateOrder}
                    disabled={isLoading || cart.length === 0 || !orderType}
                  >
                    {isLoading ? 'Se procesează...' : 'Plasează Comanda'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}






