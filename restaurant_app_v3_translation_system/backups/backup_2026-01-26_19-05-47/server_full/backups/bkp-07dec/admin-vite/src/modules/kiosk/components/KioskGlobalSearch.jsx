import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * Global Search (Cmd+K) - Căutare rapidă în tot sistemul
 * Pentru interfața KIOSK - găsește rapid produse, clienți, comenzi, mese
 */
export const KioskGlobalSearch = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      const searchResults = [];
      const lowerQuery = query.toLowerCase();

      try {
        // 1. Căutare produse (menu)
        const menuRes = await axios.get('/api/admin/catalog');
        if (menuRes.data && menuRes.data.products) {
          menuRes.data.products
            .filter(p => p.name.toLowerCase().includes(lowerQuery))
            .slice(0, 5)
            .forEach(item => {
              searchResults.push({
                type: 'product',
                id: item.id,
                label: item.name,
                subLabel: `${item.price} RON - ${item.category || 'Fără categorie'}`,
                icon: '🍽️',
                action: () => onNavigate && onNavigate('catalog', { productId: item.id })
              });
            });
        }

        // 2. Căutare mese
        const tablesRes = await axios.get('/api/tables');
        if (tablesRes.data) {
          tablesRes.data
            .filter(t => t.id.toString().includes(lowerQuery) || t.name?.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .forEach(table => {
              searchResults.push({
                type: 'table',
                id: table.id,
                label: `Masa ${table.id}`,
                subLabel: `${table.seats || 4} locuri - ${table.status === 'occupied' ? '🔴 Ocupată' : '🟢 Liberă'}`,
                icon: '🪑',
                action: () => onNavigate && onNavigate('table', { tableId: table.id })
              });
            });
        }

        // 3. Căutare comenzi recente
        const ordersRes = await axios.get('/api/orders/recent?limit=50');
        if (ordersRes.data) {
          ordersRes.data
            .filter(o => 
              o.id?.toString().includes(lowerQuery) || 
              o.order_id?.toString().includes(lowerQuery) ||
              o.client_name?.toLowerCase().includes(lowerQuery)
            )
            .slice(0, 4)
            .forEach(order => {
              searchResults.push({
                type: 'order',
                id: order.id || order.order_id,
                label: `Comanda #${order.id || order.order_id}`,
                subLabel: `${order.total || 0} RON - ${order.status || 'pending'}`,
                icon: '📋',
                action: () => onNavigate && onNavigate('order', { orderId: order.id || order.order_id })
              });
            });
        }

      } catch (error) {
        console.error('Eroare căutare:', error);
      }

      setResults(searchResults.slice(0, 10));
      setSelectedIndex(0);
      setLoading(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, onNavigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        results[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="kiosk-global-search-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh'
      }}
    >
      <div 
        className="kiosk-global-search-modal"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          width: '100%',
          maxWidth: '600px',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'zoomIn 0.15s ease-out'
        }}
      >
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <span style={{ fontSize: '24px' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Caută produse, mese, comenzi..."
            style={{
              flex: 1,
              fontSize: '18px',
              border: 'none',
              outline: 'none',
              color: '#1f2937'
            }}
          />
          <kbd style={{
            backgroundColor: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#6b7280',
            border: '1px solid #e5e7eb'
          }}>ESC</kbd>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
            <p>Se caută...</p>
          </div>
        ) : results.length > 0 ? (
          <div style={{ padding: '8px 0' }}>
            <div style={{ 
              padding: '8px 20px', 
              fontSize: '11px', 
              fontWeight: 'bold', 
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Rezultate</div>
            {results.map((res, idx) => (
              <div
                key={`${res.type}-${res.id}`}
                onClick={() => { res.action(); onClose(); }}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  backgroundColor: idx === selectedIndex ? '#eef2ff' : 'transparent',
                  borderLeft: idx === selectedIndex ? '4px solid #6366f1' : '4px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  fontSize: '24px',
                  backgroundColor: idx === selectedIndex ? '#e0e7ff' : '#f3f4f6',
                  padding: '8px',
                  borderRadius: '8px'
                }}>{res.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '14px',
                    color: idx === selectedIndex ? '#4338ca' : '#1f2937'
                  }}>{res.label}</div>
                  {res.subLabel && (
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{res.subLabel}</div>
                  )}
                </div>
                {idx === selectedIndex && <span style={{ color: '#818cf8' }}>→</span>}
              </div>
            ))}
          </div>
        ) : query && query.length >= 2 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.3 }}>#</div>
            <p>Nu am găsit rezultate pentru "{query}"</p>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.3 }}>⌘</div>
            <p>Tastează pentru a căuta în tot sistemul...</p>
          </div>
        )}

        {/* Footer Shortcuts */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '10px 20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
          fontSize: '11px',
          color: '#9ca3af'
        }}>
          <span>↑↓ Navighează</span>
          <span>↵ Selectează</span>
          <span>ESC Închide</span>
        </div>
      </div>

      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default KioskGlobalSearch;
