import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { httpClient } from '@/shared/api/httpClient';
import './DashboardTopProducts.css';

/**
 * Listă Top Produse - primele 4 produse cele mai vândute
 */
export const DashboardTopProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadTopProducts();
    // Refresh la fiecare 30 secunde
    const interval = setInterval(loadTopProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTopProducts = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Folosim endpoint-ul de profitabilitate pentru a obține datele
      const response = await httpClient.get('/api/admin/reports/profitability', {
        params: { 
          startDate: today, 
          endDate: today 
        },
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        // Sortăm după cantitate vândută și luăm primele 4
        const sorted = [...response.data.data]
          .filter(p => p.total_quantity_sold > 0)
          .sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)
          .slice(0, 4);
        
        setProducts(sorted);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading top products:', error);
      // Mock data pentru testare
      setProducts([
        { name: 'Pizza Margherita', total_quantity_sold: 45 },
        { name: 'Paste Carbonara', total_quantity_sold: 38 },
        { name: 'Tiramisu', total_quantity_sold: 32 },
        { name: 'Cappuccino', total_quantity_sold: 28 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="top-products">
        <h2 className="top-products__title">
          <Flame size={20} />
          Top Produse
        </h2>
        <div className="top-products__loading">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="top-products">
      <h2 className="top-products__title">
        <Flame size={20} />
        Top Produse
      </h2>

      {products.length === 0 ? (
        <div className="top-products__empty">
          Nu există date disponibile
        </div>
      ) : (
        <ol className="top-products__list">
          {products.map((product, index) => (
            <li key={index} className="top-products__item">
              <span className="top-products__rank">{index + 1}</span>
              <div className="top-products__info">
                <span className="top-products__name">{product.name}</span>
                <span className="top-products__quantity">{product.total_quantity_sold} bucăți</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

