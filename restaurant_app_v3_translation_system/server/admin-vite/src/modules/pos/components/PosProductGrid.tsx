// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.A - POS Product Grid Component
 * 
 * Grid de produse pentru POS cu:
 * - Încărcare produse din /api/catalog-produse/products
 * - Grupare pe categorii
 * - Search rapid (client-side)
 * - Click → add product to order
 * - Highlight produse indisponibile (0 stock)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { usePosStore } from '../store/posStore';
import { httpClient } from '@/shared/api/httpClient';
import './PosProductGrid.css';

interface PosProduct {
  id: number;
  name: string;
  name_en?: string;
  price: number;
  pret2?: number;
  pret3?: number;
  category: string;
  image_url?: string;
  is_active: boolean;
  stock_management?: boolean;
  current_stock?: number;
  preparation_section?: 'kitchen' | 'bar' | 'none';
}

interface DailyMenuData {
  soup: PosProduct;
  mainCourse: PosProduct;
  discount?: number;
}

/** Returnează prețul efectiv pe baza tier-ului (1=standard, 2=preț 2, 3=preț 3) */
function getEffectivePrice(p: PosProduct, tier: 1 | 2 | 3): number {
  if (tier === 2 && p.pret2 != null && p.pret2 > 0) return p.pret2;
  if (tier === 3 && p.pret3 != null && p.pret3 > 0) return p.pret3;
  return p.price;
}

export function PosProductGrid() {
  //   const { t } = useTranslation();
  const { addItem, priceTier, setPriceTier } = usePosStore();
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dailyMenuData, setDailyMenuData] = useState<DailyMenuData | null>(null);

  // Load products
  useEffect(() => {
    loadProducts();
    loadDailyMenu();
  }, []);

  // Debug: Log when dailyMenuData changes
  useEffect(() => {
    console.log('PosProductGrid dailyMenuData changed:', dailyMenuData);
    console.log('PosProductGrid categories will include Meniul Zilei:', !!dailyMenuData);
  }, [dailyMenuData]);

  // Load daily menu
  const loadDailyMenu = async () => {
    try {
      const response = await httpClient.get('/api/daily-menu');
      console.log('PosProductGrid Daily menu response:', response.data);
      if (response.data && response.data.soup && response.data.mainCourse) {
        setDailyMenuData({
          soup: response.data.soup,
          mainCourse: response.data.mainCourse,
          discount: response.data.discount || 0,
        });
        console.log('PosProductGrid Daily menu loaded successfully');
      } else {
        console.log('PosProductGrid Daily menu data incomplete:', response.data);
        setDailyMenuData(null);
      }
    } catch (err) {
      console.log('PosProductGrid No daily menu for today:', err);
      setDailyMenuData(null);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/catalog-produse/products', {
        params: {
          is_active: 1, // Only active products
        },
      });

      const productsData = response.data?.products || response.data?.data || (Array.isArray(response.data) ? response.data : []) || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err: any) {
      console.error('PosProductGrid Error loading products:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea produselor');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories (include Meniul Zilei if available)
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) {
        cats.add(p.category);
      }
    });
    // Add "Meniul Zilei" if daily menu is available
    if (dailyMenuData && dailyMenuData.soup && dailyMenuData.mainCourse) {
      cats.add('Meniul Zilei');
      console.log('PosProductGrid ✅ Adding Meniul Zilei to categories');
    } else {
      console.log('PosProductGrid ❌ NOT adding Meniul Zilei - dailyMenuData:', dailyMenuData);
    }
    // Sort categories, but put "Meniul Zilei" first if it exists
    const allCats = Array.from(cats);
    const sorted = allCats.sort((a, b) => {
      if (a === 'Meniul Zilei') return -1;
      if (b === 'Meniul Zilei') return 1;
      return a.localeCompare(b);
    });
    console.log('PosProductGrid 📋 Final categories:', sorted);
    return sorted;
  }, [products, dailyMenuData]);

  // Filter products
  const filteredProducts = useMemo(() => {
    console.log('PosProductGrid filteredProducts - searchTerm:', searchTerm, 'selectedCategory:', selectedCategory, 'products:', products.length);

    // If "Meniul Zilei" is selected, return empty array (will show special UI)
    if (selectedCategory === 'Meniul Zilei') {
      return [];
    }

    // If search term exists, search in ALL products regardless of category
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      console.log('PosProductGrid Searching for term:', term);
      const filtered = products.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const nameEn = (p.name_en || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const description = ((p.description || '') + ' ' + (p.description_en || '')).toLowerCase();
        const matches = name.includes(term) || nameEn.includes(term) || category.includes(term) || description.includes(term);
        return matches;
      });
      console.log('PosProductGrid Search results:', filtered.length, 'products');
      return filtered;
    }

    // If no search term, filter by category
    let filtered = products;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    console.log('PosProductGrid Category filtered:', filtered.length, 'products');
    return filtered;
  }, [products, selectedCategory, searchTerm]);

  // Group products by category
  const groupedProducts = useMemo(() => {
    const grouped: Record<string, PosProduct[]> = {};
    filteredProducts.forEach((product) => {
      const category = product.category || 'Necategorizat';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  // Handle product click
  const handleProductClick = (product: PosProduct) => {
    // Check if product is available
    if (!product.is_active) {
      alert('Produsul nu este activ');
      return;
    }

    if (product.stock_management && (product.current_stock || 0) <= 0) {
      alert('Produsul nu este în stoc');
      return;
    }

    const effectivePrice = getEffectivePrice(product, priceTier);
    addItem({
      productId: product.id,
      name: product.name,
      qty: 1,
      unitPrice: effectivePrice,
      total: effectivePrice,
      categoryId: undefined, // Can be enhanced
      station: product.preparation_section?.toLowerCase() === 'bar' ? 'bar' : 'kitchen',
    });
  };

  // Check if product is unavailable
  const isUnavailable = (product: PosProduct) => {
    return (
      !product.is_active ||
      (product.stock_management && (product.current_stock || 0) <= 0)
    );
  };

  if (loading) {
    return (
      <div className="pos-product-grid-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">"se incarca produsele"</span>
        </div>
        <p className="text-muted mt-2">"se incarca produsele"</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pos-product-grid-error">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button className="btn btn-outline-primary" onClick={loadProducts}>
          <i className="fas fa-redo me-1"></i>"Reîncearcă"</button>
      </div>
    );
  }

  return (
    <div className="pos-product-grid">
      {/* Preț Tier Selector */}
      <div className="pos-product-grid-price-tier mb-2">
        <span className="me-2" style={{ fontSize: '0.9rem', color: '#666' }}>Preț:</span>
        {([1, 2, 3] as const).map((tier) => (
          <button
            key={tier}
            type="button"
            className={`btn btn-sm ${priceTier === tier ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setPriceTier(tier)}
          >
            Preț {tier}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="pos-product-grid-search">
        <div className="input-group">
          <span className="input-group-text">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder='[🔍_cauta_produs]'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSearchTerm('')}
              title="Șterge căutarea"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="pos-product-grid-categories">
        <button
          className={`pos-category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => {
            console.log('PosProductGrid Click on "Toate"');
            setSelectedCategory('all');
          }}
        >"Toate"</button>
        {categories.map((category) => (
          <button
            key={category}
            className={`pos-category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => {
              console.log('PosProductGrid Click on category:', category);
              setSelectedCategory(category);
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="pos-product-grid-content">
        {(() => {
          console.log('PosProductGrid 🔍 Rendering grid - selectedCategory:', selectedCategory);
          console.log('PosProductGrid 🔍 dailyMenuData available:', !!dailyMenuData);
          if (dailyMenuData) {
            console.log('PosProductGrid 🔍 dailyMenuData.soup:', !!dailyMenuData.soup);
            console.log('PosProductGrid 🔍 dailyMenuData.mainCourse:', !!dailyMenuData.mainCourse);
          }
          return selectedCategory === 'Meniul Zilei';
        })() ? (
          dailyMenuData && dailyMenuData.soup && dailyMenuData.mainCourse ? (
            <div style={{ width: '100%', padding: '2rem' }}>
              <div style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '1.5rem',
                borderRadius: '16px',
                marginBottom: '2rem',
                border: '2px solid rgba(255, 107, 53, 0.5)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h1 style={{ color: '#ff6b35', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    🍲 Meniul Zilei
                  </h1>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  {/* Soup */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 107, 53, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 107, 53, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      {dailyMenuData.soup.image_url ? (
                        <img
                          src={dailyMenuData.soup.image_url}
                          alt={dailyMenuData.soup.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        <div style={{ width: '60px', height: '60px', background: '#ff6b35', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                          🍲
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#333', margin: 0, marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                          {dailyMenuData.soup.name}
                        </h3>
                        {dailyMenuData.soup.description && (
                          <p style={{ color: '#666', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                            {dailyMenuData.soup.description}
                          </p>
                        )}
                        {dailyMenuData.soup.allergens && (
                          <p style={{ color: '#888', margin: 0, marginTop: '0.5rem', fontSize: '0.75rem' }}>
                            <strong style={{ color: '#333' }}>Alergeni:</strong> {dailyMenuData.soup.allergens}
                          </p>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b', marginLeft: '1rem' }}>
                      {dailyMenuData.soup.price?.toFixed(2)} RON
                    </span>
                  </div>

                  {/* Plus symbol */}
                  <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#ff6b35', margin: '1rem 0', fontWeight: 'bold' }}>+</div>

                  {/* Main Course */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'rgba(255, 107, 53, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 107, 53, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      {dailyMenuData.mainCourse.image_url ? (
                        <img
                          src={dailyMenuData.mainCourse.image_url}
                          alt={dailyMenuData.mainCourse.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        <div style={{ width: '60px', height: '60px', background: '#ff6b35', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                          🍽️
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#333', margin: 0, marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                          {dailyMenuData.mainCourse.name}
                        </h3>
                        {dailyMenuData.mainCourse.description && (
                          <p style={{ color: '#666', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                            {dailyMenuData.mainCourse.description}
                          </p>
                        )}
                        {dailyMenuData.mainCourse.allergens && (
                          <p style={{ color: '#888', margin: 0, marginTop: '0.5rem', fontSize: '0.75rem' }}>
                            <strong style={{ color: '#333' }}>Alergeni:</strong> {dailyMenuData.mainCourse.allergens}
                          </p>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b', marginLeft: '1rem' }}>
                      {dailyMenuData.mainCourse.price?.toFixed(2)} RON
                    </span>
                  </div>
                </div>

                <hr style={{ margin: '1.5rem 0', border: '1px dashed rgba(0, 0, 0, 0.2)' }} />

                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.65rem', color: '#888', textDecoration: 'line-through' }}>
                      Total: {(dailyMenuData.soup.price + dailyMenuData.mainCourse.price).toFixed(2)} RON
                    </span>
                    <br />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b35' }}>
                      Preț Ofertă: {((dailyMenuData.soup.price + dailyMenuData.mainCourse.price) - (dailyMenuData.discount || 0)).toFixed(2)} RON
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-danger"
                  onClick={() => {
                    // Add soup
                    addItem({
                      productId: dailyMenuData.soup.id,
                      name: dailyMenuData.soup.name,
                      qty: 1,
                      unitPrice: dailyMenuData.soup.price,
                      total: dailyMenuData.soup.price,
                      categoryId: undefined,
                      station: 'kitchen',
                    });
                    // Add main course
                    addItem({
                      productId: dailyMenuData.mainCourse.id,
                      name: dailyMenuData.mainCourse.name,
                      qty: 1,
                      unitPrice: dailyMenuData.mainCourse.price,
                      total: dailyMenuData.mainCourse.price,
                      categoryId: undefined,
                      station: 'kitchen',
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    background: '#ff6b35',
                    border: '2px solid #ff6b35',
                    boxShadow: '0 0 10px rgba(255, 107, 53, 0.6)'
                  }}
                >
                  <i className="fas fa-shopping-cart me-2"></i>"adauga in comanda"</button>
              </div>
            </div>
          ) : (
            <div className="pos-product-grid-empty">
              <p className="text-muted">"nu exista meniu al zilei astazi"</p>
            </div>
          )
        ) : Object.keys(groupedProducts).length === 0 ? (
          <div className="pos-product-grid-empty">
            <p className="text-muted">
              {searchTerm
                ? 'Nu s-au găsit produse pentru căutarea ta'
                : 'Nu există produse disponibile'}
            </p>
          </div>
        ) : (
          Object.entries(groupedProducts).map(([category, categoryProducts]) => (
            <div key={category} className="pos-product-category-section">
              <h5 className="pos-product-category-title">{category}</h5>
              <div className="pos-product-grid-items">
                {categoryProducts.map((product) => {
                  const unavailable = isUnavailable(product);
                  return (
                    <button
                      key={product.id}
                      className={`pos-product-card ${unavailable ? 'unavailable' : ''}`}
                      onClick={() => handleProductClick(product)}
                      disabled={unavailable}
                      title={
                        unavailable
                          ? 'Produs indisponibil'
                          : `${product.name} - ${getEffectivePrice(product, priceTier).toFixed(2)} RON`
                      }
                    >
                      {product.image_url ? (
                        <div
                          className="pos-product-image"
                          style={{
                            backgroundImage: `url(${product.image_url})`,
                          }}
                        />
                      ) : (
                        <div className="pos-product-image pos-product-image-placeholder">
                          <i className="fas fa-image"></i>
                        </div>
                      )}
                      <div className="pos-product-info">
                        <div className="pos-product-name">{product.name}</div>
                        <div className="pos-product-price">
                          {getEffectivePrice(product, priceTier).toFixed(2)} RON
                        </div>
                        {product.stock_management && (
                          <div className="pos-product-stock">
                            Stoc: {product.current_stock || 0}
                          </div>
                        )}
                      </div>
                      {unavailable && (
                        <div className="pos-product-unavailable-overlay">
                          <i className="fas fa-ban"></i>
                          Indisponibil
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}





