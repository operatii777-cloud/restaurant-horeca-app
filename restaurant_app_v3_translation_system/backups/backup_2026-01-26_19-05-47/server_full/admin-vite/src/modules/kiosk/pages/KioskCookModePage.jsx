/**
 * 🍳 COOK MODE - Vizualizare Rețetă Fullscreen pentru Bucătari
 * 
 * Funcționalități:
 * - Fullscreen mode pentru bucătărie
 * - Ingrediente cu cantități scalabile
 * - Timer per pas de preparare
 * - Mod noapte (dark theme nativ)
 * - Gesture-friendly (touch optimizat)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Stiluri inline pentru fullscreen
const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    overflow: 'hidden',
    zIndex: 9999,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    background: 'rgba(0,0,0,0.3)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fbbf24',
    margin: 0,
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  closeBtn: {
    background: 'rgba(239, 68, 68, 0.8)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  content: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    padding: '40px',
    overflow: 'auto',
  },
  section: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#60a5fa',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  ingredientsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  ingredientItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    marginBottom: '10px',
    fontSize: '1.2rem',
    border: '1px solid rgba(255,255,255,0.05)',
    transition: 'all 0.2s ease',
  },
  ingredientName: {
    color: '#e5e7eb',
    fontWeight: 500,
  },
  ingredientQty: {
    color: '#34d399',
    fontWeight: 700,
    fontSize: '1.3rem',
    background: 'rgba(52, 211, 153, 0.1)',
    padding: '8px 16px',
    borderRadius: '8px',
  },
  scaleControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    padding: '20px',
    background: 'rgba(251, 191, 36, 0.1)',
    borderRadius: '15px',
    border: '1px solid rgba(251, 191, 36, 0.3)',
  },
  scaleBtn: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: 'none',
    background: '#fbbf24',
    color: '#000',
    fontSize: '1.5rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  scaleValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#fbbf24',
    minWidth: '100px',
    textAlign: 'center',
  },
  timer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '30px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '20px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    marginTop: '20px',
  },
  timerDisplay: {
    fontSize: '4rem',
    fontWeight: 700,
    color: '#ef4444',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '5px',
  },
  timerControls: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
  },
  timerBtn: {
    padding: '15px 30px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  nutritionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginTop: '20px',
  },
  nutritionCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '15px',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  nutritionValue: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#60a5fa',
  },
  nutritionLabel: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    marginTop: '5px',
  },
  costBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    background: 'rgba(0,0,0,0.4)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  costItem: {
    textAlign: 'center',
  },
  costValue: {
    fontSize: '1.8rem',
    fontWeight: 700,
  },
  costLabel: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    marginTop: '5px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontSize: '1.5rem',
    color: '#9ca3af',
  },
  allergenBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginRight: '8px',
    marginBottom: '8px',
  },
  stepItem: {
    padding: '20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    marginBottom: '15px',
    borderLeft: '4px solid #60a5fa',
  },
  stepNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#60a5fa',
    color: '#000',
    fontWeight: 700,
    marginRight: '15px',
  },
};

// Culori pentru alergeni
const allergenColors = {
  MILK: '#fef3c7',
  GLUTEN: '#fce7f3',
  EGGS: '#fff7ed',
  FISH: '#e0f2fe',
  NUTS: '#f3e8ff',
  PEANUTS: '#fef2f2',
  SOYBEANS: '#ecfdf5',
  CELERY: '#f0fdf4',
  MUSTARD: '#fefce8',
  SESAME: '#fdf4ff',
  SULPHITES: '#f5f3ff',
  LUPIN: '#fdf2f8',
  MOLLUSCS: '#f0fdfa',
  CRUSTACEANS: '#fff1f2',
};

export const KioskCookModePage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [recipe, setRecipe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchSize, setBatchSize] = useState(1);
  
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Load recipe data
  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        
        // Încarcă produsul
        const productRes = await fetch(`/api/menu/${productId}`);
        if (!productRes.ok) throw new Error('Produsul nu a fost găsit');
        const productData = await productRes.json();
        setProduct(productData);
        
        // Încarcă rețeta
        const recipeRes = await fetch(`/api/recipes/product/${productId}`);
        if (recipeRes.ok) {
          const recipeData = await recipeRes.json();
          setRecipe(recipeData.items || recipeData || []);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Eroare încărcare rețetă:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    if (productId) {
      loadRecipe();
    }
  }, [productId]);

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  // Close cook mode
  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    navigate(-1);
  };

  // Scale quantity
  const scaleQuantity = (qty) => {
    return (qty * batchSize).toFixed(2).replace(/\.?0+$/, '');
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    return recipe.reduce((sum, item) => {
      const cost = (item.cost_per_unit || 0) * (item.quantity || 0) * batchSize;
      return sum + cost;
    }, 0);
  };

  // Calculate food cost percentage
  const calculateFoodCostPercent = () => {
    if (!product?.price) return 0;
    const cost = calculateTotalCost();
    return ((cost / (product.price * batchSize)) * 100).toFixed(1);
  };

  // Get unique allergens from recipe
  const getAllergens = () => {
    const allergens = new Set();
    recipe.forEach(item => {
      if (item.allergens) {
        const itemAllergens = item.allergens.split(',').map(a => a.trim());
        itemAllergens.forEach(a => allergens.add(a));
      }
    });
    return Array.from(allergens);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          ⏳ Se încarcă rețeta...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          ❌ {error}
          <button 
            onClick={handleClose}
            style={{ ...styles.timerBtn, background: '#ef4444', color: 'white', marginTop: '20px' }}
          >
            Înapoi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={styles.title}>🍳 {product?.name || 'Rețetă'}</h1>
          <button 
            onClick={toggleFullscreen}
            style={{ ...styles.closeBtn, background: 'rgba(96, 165, 250, 0.8)' }}
            title="Toggle Fullscreen"
          >
            ⛶
          </button>
        </div>
        <button 
          onClick={handleClose}
          style={styles.closeBtn}
          title="Închide Cook Mode"
        >
          ✕
        </button>
      </header>

      {/* Content */}
      <div style={styles.content}>
        {/* Left - Ingredients */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            🥗 Ingrediente
          </h2>
          
          {/* Batch Scale Controls */}
          <div style={styles.scaleControls}>
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>Porții:</span>
            <button 
              style={styles.scaleBtn}
              onClick={() => setBatchSize(Math.max(1, batchSize - 1))}
            >
              −
            </button>
            <span style={styles.scaleValue}>{batchSize}x</span>
            <button 
              style={styles.scaleBtn}
              onClick={() => setBatchSize(batchSize + 1)}
            >
              +
            </button>
          </div>

          {/* Ingredients List */}
          <ul style={styles.ingredientsList}>
            {recipe.length === 0 ? (
              <li style={{ ...styles.ingredientItem, justifyContent: 'center', color: '#9ca3af' }}>
                Nu există ingrediente definite pentru acest produs
              </li>
            ) : (
              recipe.map((item, index) => (
                <li 
                  key={item.ingredient_id || index} 
                  style={styles.ingredientItem}
                >
                  <span style={styles.ingredientName}>
                    {item.ingredient_name || item.name || `Ingredient ${index + 1}`}
                  </span>
                  <span style={styles.ingredientQty}>
                    {scaleQuantity(item.quantity || 0)} {item.unit || 'g'}
                  </span>
                </li>
              ))
            )}
          </ul>

          {/* Allergens */}
          {getAllergens().length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ ...styles.sectionTitle, fontSize: '1.2rem' }}>⚠️ Alergeni</h3>
              <div>
                {getAllergens().map(allergen => (
                  <span 
                    key={allergen}
                    style={{
                      ...styles.allergenBadge,
                      background: allergenColors[allergen] || '#f3f4f6',
                      color: '#1f2937',
                    }}
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right - Timer & Nutrition */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            ⏱️ Timer Preparare
          </h2>
          
          <div style={styles.timer}>
            <div style={styles.timerDisplay}>
              {formatTime(timerSeconds)}
            </div>
            <div style={styles.timerControls}>
              <button 
                style={{ 
                  ...styles.timerBtn, 
                  background: timerRunning ? '#ef4444' : '#22c55e',
                  color: 'white',
                }}
                onClick={() => setTimerRunning(!timerRunning)}
              >
                {timerRunning ? '⏸ Pauză' : '▶ Start'}
              </button>
              <button 
                style={{ ...styles.timerBtn, background: '#6b7280', color: 'white' }}
                onClick={() => { setTimerSeconds(0); setTimerRunning(false); }}
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Nutrition Info */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ ...styles.sectionTitle, fontSize: '1.2rem' }}>📊 Valori Nutriționale (per porție)</h3>
            <div style={styles.nutritionGrid}>
              <div style={styles.nutritionCard}>
                <div style={styles.nutritionValue}>{product?.calories || '—'}</div>
                <div style={styles.nutritionLabel}>Calorii</div>
              </div>
              <div style={styles.nutritionCard}>
                <div style={styles.nutritionValue}>{product?.proteins || '—'}g</div>
                <div style={styles.nutritionLabel}>Proteine</div>
              </div>
              <div style={styles.nutritionCard}>
                <div style={styles.nutritionValue}>{product?.carbs || '—'}g</div>
                <div style={styles.nutritionLabel}>Carbohidrați</div>
              </div>
              <div style={styles.nutritionCard}>
                <div style={styles.nutritionValue}>{product?.fats || '—'}g</div>
                <div style={styles.nutritionLabel}>Grăsimi</div>
              </div>
            </div>
          </div>

          {/* Preparation Steps Placeholder */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ ...styles.sectionTitle, fontSize: '1.2rem' }}>📝 Pași Preparare</h3>
            {product?.preparation_steps ? (
              <div>
                {product.preparation_steps.split('\n').map((step, i) => (
                  <div key={i} style={styles.stepItem}>
                    <span style={styles.stepNumber}>{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...styles.stepItem, borderLeftColor: '#6b7280' }}>
                <span style={{ color: '#9ca3af' }}>
                  Nu sunt definiți pași de preparare pentru acest produs.
                  <br /><br />
                  <em>Tip: Adaugă pașii în câmpul "Instrucțiuni preparare" din editorul de produse.</em>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Cost Bar */}
      <footer style={styles.costBar}>
        <div style={styles.costItem}>
          <div style={{ ...styles.costValue, color: '#ef4444' }}>
            {calculateTotalCost().toFixed(2)} RON
          </div>
          <div style={styles.costLabel}>Cost Ingrediente ({batchSize}x)</div>
        </div>
        <div style={styles.costItem}>
          <div style={{ ...styles.costValue, color: '#22c55e' }}>
            {((product?.price || 0) * batchSize).toFixed(2)} RON
          </div>
          <div style={styles.costLabel}>Preț Vânzare ({batchSize}x)</div>
        </div>
        <div style={styles.costItem}>
          <div style={{ 
            ...styles.costValue, 
            color: parseFloat(calculateFoodCostPercent()) > 35 ? '#ef4444' : '#22c55e' 
          }}>
            {calculateFoodCostPercent()}%
          </div>
          <div style={styles.costLabel}>Food Cost %</div>
        </div>
        <div style={styles.costItem}>
          <div style={{ ...styles.costValue, color: '#60a5fa' }}>
            {(((product?.price || 0) * batchSize) - calculateTotalCost()).toFixed(2)} RON
          </div>
          <div style={styles.costLabel}>Profit Brut ({batchSize}x)</div>
        </div>
      </footer>
    </div>
  );
};

export default KioskCookModePage;

