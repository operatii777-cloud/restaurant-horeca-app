import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkKioskSession } from '../api/KioskApi';

/**
 * Meniu rapid pentru KIOSK - acces la funcționalități suplimentare
 * Se afișează ca un buton flotant cu meniu expandabil
 */
export const KioskQuickMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const session = checkKioskSession();

  const menuItems = [
    { icon: '🎉', label: 'Evenimente', path: '/kiosk/events', description: 'Management nunți, corporate', roles: ['admin', 'supervisor'] },
    { icon: '📓', label: 'Jurnal Tură', path: '/kiosk/shift-handover', description: 'Raport de închidere tură', roles: ['admin', 'supervisor', 'waiter'] },
    { icon: '📺', label: 'Menu Board TV', path: '/kiosk/menu-board', description: 'Digital signage pentru TV', roles: ['admin', 'supervisor'] },
    { icon: '💨', label: 'Vânzare Rapidă', path: '/kiosk/fast-sale', description: 'POS fără masă', roles: ['admin', 'supervisor', 'waiter'] },
    { icon: '📊', label: 'Raport Live', path: '/kiosk/reports/staff-live', description: 'Vânzări în timp real', roles: ['admin', 'supervisor'] },
  ];

  // Filtrează meniul în funcție de rolul utilizatorului
  const visibleItems = session 
    ? menuItems.filter(item => item.roles.includes(session.role))
    : menuItems.filter(item => item.roles.includes('waiter')); // Default: doar ce poate vedea un ospătar

  return (
    <>
      {/* Buton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: isOpen ? '#1e293b' : '#3b82f6',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          zIndex: 1001
        }}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      {/* Meniu */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            minWidth: '280px',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ fontWeight: 'bold', color: '#1e293b' }}>🖥️ KIOSK Menu</div>
            {session && (
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Conectat: {session.username} ({session.role})
              </div>
            )}
          </div>

          {/* Items */}
          <div style={{ padding: '8px' }}>
            {visibleItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '24px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <button
              onClick={() => navigate('/kiosk/tables')}
              style={{
                backgroundColor: '#e2e8f0',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '12px'
              }}
            >
              🏠 Înapoi la Mese
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default KioskQuickMenu;

