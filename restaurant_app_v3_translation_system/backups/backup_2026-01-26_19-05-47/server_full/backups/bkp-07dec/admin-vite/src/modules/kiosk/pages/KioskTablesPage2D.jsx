import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Alert, Nav } from 'react-bootstrap';
import { getTablesStatus, checkKioskSession, createOrder } from '../api/KioskApi';
import { useKioskLoginModal } from '../context/KioskLoginModalContext';
import { useKioskTheme, ThemeToggleButton, CompactLegend } from '../context/KioskThemeContext';
import { Table2D } from '../components/Table2D';
import { useTablesPositions } from '../hooks/useTablesPositions';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../kiosk.css';

const TOTAL_TABLES = 30;
const STANDBY_TIMEOUT = 30000; // 30 secunde

export const KioskTablesPage2D = () => {
  const navigate = useNavigate();
  const { openLoginModal, showLoginModal } = useKioskLoginModal();
  const { theme, isDarkTheme } = useKioskTheme();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [standbyMode, setStandbyMode] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const standbyTimerRef = useRef(null);

  // Hook pentru poziții mese
  const { positions, loading: positionsLoading, updatePosition } = useTablesPositions(TOTAL_TABLES);

  // Verifică sesiunea
  useEffect(() => {
    const currentSession = checkKioskSession();
    console.log('🔍 KioskTablesPage2D - Session check:', currentSession);
    setSession(currentSession);
    setLastActivity(Date.now());
  }, []);

  // Standby mode - lock după 30 secunde de inactivitate
  useEffect(() => {
    const hasValidSession = session && session.username && session.role;
    
    if (!hasValidSession) {
      setStandbyMode(true);
      return;
    }

    // Reset timer la orice activitate
    const resetStandbyTimer = () => {
      setLastActivity(Date.now());
      setStandbyMode(false);
      
      if (standbyTimerRef.current) {
        clearTimeout(standbyTimerRef.current);
      }
      
      standbyTimerRef.current = setTimeout(() => {
        console.log('🔒 Standby mode activat - 30 secunde de inactivitate');
        setStandbyMode(true);
      }, STANDBY_TIMEOUT);
    };

    // Event listeners pentru activitate
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, resetStandbyTimer);
    });

    // Start timer inițial
    resetStandbyTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetStandbyTimer);
      });
      if (standbyTimerRef.current) {
        clearTimeout(standbyTimerRef.current);
      }
    };
  }, [session]);

  // Încarcă status mese
  const loadTablesStatus = useCallback(async () => {
    try {
      const tablesData = await getTablesStatus();
      
      // Creează array pentru toate mesele (1-30)
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
      setLoading(false); // 🟢 FIX: Setează loading false imediat după setTables
    } catch (err) {
      console.error('❌ Eroare la încărcarea statusului meselor:', err);
      setError('Nu s-a putut încărca statusul meselor.');
      setLoading(false); // 🟢 FIX: Setează loading false și la eroare
    }
  }, []);

  useEffect(() => {
    // 🟢 FIX: Încarcă datele imediat
    loadTablesStatus();
    
    // Refresh periodic (fiecare 10 secunde)
    const interval = setInterval(() => {
      loadTablesStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadTablesStatus]);

  // Handle click pe masă
  const handleTableClick = useCallback(async (table) => {
    console.log(`🖱️ handleTableClick - Masa ${table.number}, status: ${table.status}, standbyMode: ${standbyMode}, session:`, session);
    
    // 🔒 Dacă e StandBy → cere login
    const isStandBy = typeof window !== 'undefined' && window.__KIOSK_STANDBY__;
    if (standbyMode || !session || isStandBy) {
      console.log('🔒 handleTableClick - Standby sau fără sesiune, deschid login');
      openLoginModal();
      return;
    }

    // Verifică rolul
    const allowedRoles = ['waiter', 'supervisor', 'admin'];
    if (!allowedRoles.includes(session.role)) {
      alert('Acces restricționat. Doar ospătari, supervisori și admin pot accesa KIOSK.');
      return;
    }

    if (table.status === 'reserved') {
      alert(`Masa ${table.number} este rezervată.`);
      return;
    }

    // 🟢 FIX: Navighează direct la comanda-supervisor11.html, fără să treacă prin React Router
    // Verifică dacă există comandă existentă
    if (table.status === 'occupied' && table.order_id) {
      console.log(`📦 handleTableClick - Încarcă comanda existentă ${table.order_id} pentru masa ${table.number}`);
      const url = `/comanda-supervisor11.html?kiosk=true&table=${table.number}&order_id=${table.order_id}&_t=${Date.now()}`;
      console.log(`🔄 handleTableClick - Navigare directă la: ${url}`);
      window.location.href = url;
    } else {
      // ❗ NU MAI CREĂM comanda aici - doar navigăm la editor
      // Comanda va fi creată doar când se apasă "Salvează comanda" în comanda-supervisor11.html
      console.log(`🆕 handleTableClick - Navighează la editor comandă pentru masa ${table.number} (fără comandă pre-creată)`);
      const url = `/comanda-supervisor11.html?kiosk=true&table=${table.number}&_t=${Date.now()}`;
      console.log(`🔄 handleTableClick - Navigare directă la: ${url}`);
      window.location.href = url;
    }
  }, [session, standbyMode, navigate, openLoginModal]);

  // Handle drag & drop - mutare masă
  const handleTableMove = useCallback((tableId, newX, newY) => {
    console.log(`🔄 Masă ${tableId} mutată la: (${newX}, ${newY})`);
    updatePosition(tableId, newX, newY);
  }, [updatePosition]);

  // Verifică dacă există sesiune validă
  const hasValidSession = session && session.username && session.role;

  if (loading || positionsLoading) {
    return (
      <div className="kiosk-tables-page-2d" style={{ background: theme.bg, minHeight: '100vh' }}>
        <div className="text-center py-5">
          <i className="fas fa-spinner fa-spin fa-3x" style={{ color: theme.accent }}></i>
          <p className="mt-3" style={{ color: theme.textMuted }}>Se încarcă planul meselor...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="kiosk-tables-page-2d" 
      style={{ 
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: theme.bg,
        cursor: standbyMode ? 'not-allowed' : 'default'
      }}
    >
      {/* Header - Dark Theme */}
      <div className="kiosk-header" style={{ 
        position: 'relative', 
        zIndex: 1000000, 
        background: theme.surface, 
        backdropFilter: 'blur(12px)',
        padding: '1rem 1.5rem', 
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div>
          {/* Titlu și User Info */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 style={{ color: theme.text, marginBottom: '0.25rem', fontWeight: 600 }}>
                <i className="fas fa-table me-2" style={{ color: theme.accent }}></i>Plan Mese
              </h2>
              <p className="mb-0" style={{ color: theme.textMuted, fontSize: '0.9rem' }}>
                {hasValidSession ? (
                  <>
                    <span style={{ 
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                      padding: '2px 10px', 
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      marginRight: '8px'
                    }}>
                      {session.role === 'admin' ? '👑 Admin' : session.role === 'supervisor' ? '⭐ Supervisor' : '🍽️ Ospătar'}
                    </span>
                    <strong style={{ color: theme.text }}>{session.username}</strong>
                    {standbyMode && <span style={{ color: '#fbbf24', marginLeft: '12px' }}>🔒 StandBy</span>}
                  </>
                ) : (
                  <span style={{ color: '#fbbf24' }}>
                    <i className="fas fa-lock me-2"></i>StandBy - Autentificare necesară
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* Tabs și Butoane pe aceeași linie, aliniate la stânga - FĂRĂ padding lateral */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            {/* Tabs pentru tipuri de comenzi */}
            <Nav variant="tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
              <Nav.Item>
                <Nav.Link 
                  active 
                  style={{ 
                    fontWeight: 700, 
                    background: 'linear-gradient(to right, #fbbf24, #f97316)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    borderBottom: '3px solid #f97316',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    padding: '0.5rem 1rem'
                  }}
                >
                  <i className="fas fa-utensils me-2"></i>Dine-In
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  onClick={() => window.open('/comanda11.html?type=delivery', '_blank')}
                  style={{ 
                    fontWeight: 700, 
                    background: 'linear-gradient(to right, #fbbf24, #f97316)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    cursor: 'pointer',
                    opacity: 0.7,
                    fontSize: '0.875rem',
                    padding: '0.5rem 1rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                  <i className="fas fa-motorcycle me-2"></i>Delivery
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  onClick={() => window.open('/comanda11.html?type=drive-thru', '_blank')}
                  style={{ 
                    fontWeight: 700, 
                    background: 'linear-gradient(to right, #fbbf24, #f97316)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    cursor: 'pointer',
                    opacity: 0.7,
                    fontSize: '0.875rem',
                    padding: '0.5rem 1rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                  <i className="fas fa-car me-2"></i>Drive-Thru
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Separator vizual */}
            <div style={{ width: '1px', height: '24px', background: '#dee2e6' }}></div>

            {/* Butoane Admin/Supervisor */}
            {hasValidSession && (session.role === 'admin' || session.role === 'supervisor') && (
              <>
                <Button
                  style={{ 
                    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', 
                    border: 'none',
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem'
                  }}
                  size="sm"
                  onClick={() => navigate('/kiosk/reports/staff-live')}
                >
                  <i className="fas fa-chart-line me-1"></i>Raport
                </Button>
                <Button
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981, #059669)', 
                    border: 'none',
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem'
                  }}
                  size="sm"
                  onClick={() => navigate('/kiosk/shift-handover')}
                >
                  <i className="fas fa-clipboard-check me-1"></i>Tură
                </Button>
                <Button
                  style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
                    border: 'none',
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem'
                  }}
                  size="sm"
                  onClick={() => navigate('/kiosk/menu-board')}
                >
                  <i className="fas fa-tv me-1"></i>TV
                </Button>
              </>
            )}

            {/* Fast Sale - disponibil pentru toți */}
            {hasValidSession && (
              <Button 
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                  border: 'none',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  padding: '0.375rem 0.75rem'
                }}
                size="sm" 
                onClick={() => navigate('/kiosk/fast-sale')}
              >
                <i className="fas fa-bolt me-1"></i>Fast Sale
              </Button>
            )}

            {/* Buton Refresh */}
            <Button 
              style={{ 
                background: theme.surfaceLight, 
                border: `1px solid ${theme.border}`,
                color: theme.text,
                fontWeight: 500,
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem'
              }}
              size="sm" 
              onClick={loadTablesStatus}
            >
              <i className="fas fa-sync-alt me-2"></i>Refresh
            </Button>
            {hasValidSession && session.role === 'admin' && (
              <Button
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                  border: 'none',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  padding: '0.375rem 0.75rem'
                }}
                size="sm"
                onClick={() => window.location.href = '/admin-vite/'}
                title="Înapoi la Admin"
              >
                <i className="fas fa-arrow-left me-1"></i>Admin
              </Button>
            )}
            {/* 🌙 Theme Toggle */}
            <ThemeToggleButton size="sm" />
            
            {/* 📊 Legenda inline - compact */}
            <CompactLegend />
        </div>
      </div>

      {/* Card Autentificare - Dreapta Sus (doar când e autentificat, nu în StandBy) */}
      {/* 🟢 PATCH: Cardul de autentificare este gestionat de KioskStandByBoundary, nu mai afișăm aici */}
      {false && hasValidSession && !standbyMode && (
        <div 
          className="kiosk-standby-auth-card"
          style={{ 
            position: 'fixed',
            top: '18px',
            right: '18px',
            zIndex: 3999, // Sub cardul StandBy (4000)
            maxWidth: '180px',
            width: 'auto'
          }}
        >
          <Card 
            className="border-success shadow-lg" 
            style={{ 
              backgroundColor: '#d4edda', 
              borderWidth: '2px',
              borderColor: '#28a745',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
            }}
          >
            <Card.Body className="text-center py-2 px-2">
              <div className="mb-2">
                <i className="fas fa-user-check text-success mb-1" style={{ display: 'block', fontSize: '0.9rem' }}></i>
                <h6 className="mb-1" style={{ color: '#155724', fontWeight: 'bold', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                  {session.role === 'admin' ? 'Admin' : session.role === 'supervisor' ? 'Supervisor' : 'Ospătar'}
                </h6>
                <p className="text-muted mb-0" style={{ fontSize: '0.6rem', color: '#6c757d', marginBottom: '0.2rem' }}>
                  {session.username}
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Error Alert - Dark Theme */}
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={() => setError(null)} 
          className="mb-3" 
          style={{ 
            position: 'absolute', 
            top: '100px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 1000,
            background: 'rgba(239, 68, 68, 0.9)',
            border: '1px solid #ef4444',
            color: '#fff',
            backdropFilter: 'blur(8px)'
          }}
        >
          {error}
        </Alert>
      )}

      {/* Legenda mutată în navbar - vezi mai sus */}

      {/* Plan mese 2D - Container pentru drag & drop - Dark Theme */}
      <div
        style={{
          position: 'absolute',
          top: '90px',
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'auto',
          pointerEvents: standbyMode ? 'none' : 'auto',
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)'
        }}
        onClick={(e) => {
          // Previne click-ul pe container să deschidă comanda
          if (e.target === e.currentTarget) {
            e.stopPropagation();
          }
        }}
      >
        {Array.from({ length: TOTAL_TABLES }, (_, index) => {
          const tableNumber = index + 1;
          const table = tables.find((t) => t.number === tableNumber);
          const position = positions[tableNumber] || { x: 0, y: 0 };
          
          return (
            <Table2D
              key={`table-${tableNumber}-${position.x}-${position.y}`}
              id={tableNumber}
              tableNumber={tableNumber}
              status={table?.status || 'free'}
              timer={table?.timer || null}
              x={position.x}
              y={position.y}
              onMove={(newX, newY) => {
                console.log(`🔄 KioskTablesPage2D - onMove pentru masa ${tableNumber}: (${newX}, ${newY})`);
                handleTableMove(tableNumber, newX, newY);
              }}
              onClick={() => {
                console.log(`🖱️ KioskTablesPage2D - Click pe masa ${tableNumber}`);
                handleTableClick(table || { number: tableNumber, status: 'free' });
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

