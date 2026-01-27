/**
 * DYNAMIC PRICING PAGE - UI pentru prețuri dinamice (Happy Hour, Peak Hours)
 * Data: 03 Decembrie 2025
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import './DynamicPricingPage.css';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface DynamicPrice {
  product_id: number;
  product_name: string;
  base_price: number;
  dynamic_price: number;
  discount_percent: number;
  rule_applied: string;
}

export default function DynamicPricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [dynamicPrice, setDynamicPrice] = useState<DynamicPrice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    
    // Update hour every minute
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const handleCalculate = async () => {
    if (!selectedProductId) {
      alert('Selectează un produs!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/pricing/dynamic', {
        productId: selectedProductId,
        hour: currentHour
      });
      
      setDynamicPrice(res.data.data);
    } catch (err: any) {
      alert('Eroare: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getRuleDescription = (rule: string) => {
    const rules: Record<string, string> = {
      'happy_hour': '🍹 Happy Hour (14:00-17:00) - Reducere 20%',
      'peak_hours': '🔥 Peak Hours (19:00-22:00) - Majorare 10%',
      'lunch_special': '🍽️ Lunch Special (12:00-14:00) - Reducere 15%',
      'base': '📌 Preț de bază (fără modificări)'
    };
    
    return rules[rule] || rule;
  };

  const getCurrentRule = () => {
    if (currentHour >= 14 && currentHour < 17) return 'happy_hour';
    if (currentHour >= 19 && currentHour < 22) return 'peak_hours';
    if (currentHour >= 12 && currentHour < 14) return 'lunch_special';
    return 'base';
  };

  return (
    <div className="dynamic-pricing-page">
      <h1 className="page-title">💰 Prețuri Dinamice (Happy Hour / Peak Hours)</h1>

      <div className="card">
        <h3>Calculează Preț Dinamic</h3>
        
        <div className="current-time-box">
          <span className="label">Ora curentă:</span>
          <span className="value">{currentHour}:00</span>
          <span className="rule-badge">{getRuleDescription(getCurrentRule())}</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Produs</label>
            <select 
              value={selectedProductId || ''} 
              onChange={e => setSelectedProductId(parseInt(e.target.value))}
            >
              <option value="">-- Alege produs --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category}) - {p.price} RON
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={handleCalculate} disabled={loading}>
          {loading ? 'Calculez...' : '💰 Calculează Preț Dinamic'}
        </button>
      </div>

      {dynamicPrice && (
        <div className="card result-card">
          <h3>✅ Preț Calculat: {dynamicPrice.product_name}</h3>
          
          <div className="pricing-summary">
            <div className="price-item base">
              <span className="label">Preț de bază:</span>
              <span className="value">{dynamicPrice.base_price.toFixed(2)} RON</span>
            </div>
            
            <div className="arrow">→</div>
            
            <div className="price-item dynamic">
              <span className="label">Preț dinamic:</span>
              <span className="value">{dynamicPrice.dynamic_price.toFixed(2)} RON</span>
            </div>
          </div>

          <div className="rule-info">
            <div className="rule-badge-large">
              {getRuleDescription(dynamicPrice.rule_applied)}
            </div>
            
            {dynamicPrice.discount_percent !== 0 && (
              <div className={`discount-badge ${dynamicPrice.discount_percent > 0 ? 'positive' : 'negative'}`}>
                {dynamicPrice.discount_percent > 0 ? '+' : ''}{dynamicPrice.discount_percent}%
              </div>
            )}
          </div>

          <div className="info-box">
            <strong>ℹ️ Regulile de pricing:</strong>
            <ul>
              <li>🍹 <strong>Happy Hour</strong> (14:00-17:00): -20% reducere</li>
              <li>🍽️ <strong>Lunch Special</strong> (12:00-14:00): -15% reducere</li>
              <li>🔥 <strong>Peak Hours</strong> (19:00-22:00): +10% majorare</li>
              <li>📌 <strong>Restul zilei</strong>: Preț de bază</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

