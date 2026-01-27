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
  category: string;
  image_url?: string;
  is_active: boolean;
  stock_management?: boolean;
  current_stock?: number;
  preparation_section?: 'kitchen' | 'bar' | 'none';
}

export function PosProductGrid() {
  const { addItem } = usePosStore();
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get('/api/catalog-produse/products', {
        params: {
          is_active: 1, // Only active products
        },
      });

      const productsData = response.data?.data || response.data || [];
      setProducts(productsData);
    } catch (err: any) {
      console.error('[PosProductGrid] Error loading products:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea produselor');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) {
        cats.add(p.category);
      }
    });
    return Array.from(cats).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.name_en && p.name_en.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term))
      );
    }

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

    // Add to order
    addItem({
      productId: product.id,
      name: product.name,
      qty: 1,
      unitPrice: product.price,
      total: product.price,
      categoryId: undefined, // Can be enhanced
      station: product.preparation_section === 'bar' ? 'bar' : 'kitchen',
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
          <span className="visually-hidden">Se încarcă produsele...</span>
        </div>
        <p className="text-muted mt-2">Se încarcă produsele...</p>
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
          <i className="fas fa-redo me-1"></i>
          Reîncearcă
        </button>
      </div>
    );
  }

  return (
    <div className="pos-product-grid">
      {/* Search Bar */}
      <div className="pos-product-grid-search">
        <div className="input-group">
          <span className="input-group-text">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Caută produs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSearchTerm('')}
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
          onClick={() => setSelectedCategory('all')}
        >
          Toate
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`pos-category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="pos-product-grid-content">
        {Object.keys(groupedProducts).length === 0 ? (
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
                          : `${product.name} - ${product.price.toFixed(2)} RON`
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
                          {product.price.toFixed(2)} RON
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

