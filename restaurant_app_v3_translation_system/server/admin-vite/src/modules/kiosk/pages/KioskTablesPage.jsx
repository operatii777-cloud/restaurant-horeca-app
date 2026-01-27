import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Alert, Modal } from 'react-bootstrap';
import { getTablesStatus, checkKioskSession, createOrder, kioskLogin } from '../api/KioskApi';
import { useKioskLoginModal } from '../context/KioskLoginModalContext';
import { httpClient } from '@/shared/api/httpClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../kiosk.css';

const TABLE_ROWS = 10;
const TABLE_COLS = 3;
const TOTAL_TABLES = 30;

export const KioskTablesPage = () => {
  console.log('🚀 KioskTablesPage - Component montat!');
  
  const navigate = useNavigate();
  const { openLoginModal, showLoginModal, registerLoginSuccessCallback } = useKioskLoginModal();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [authRequiredMessage, setAuthRequiredMessage] = useState(null);
  
  console.log('🔍 KioskTablesPage - State initial:', { loading, hasSession: !!session, showLoginModal });

  // Mutăm loadTablesStatus înainte de handleLoginSuccess pentru a evita probleme de hoisting
  const loadTablesStatus = useCallback(async () => {
    try {
      let tablesData = await getTablesStatus();
      
      // Asigură-te că tablesData este un array
      if (!Array.isArray(tablesData)) {
        console.warn('⚠️ getTablesStatus returned non-array:', tablesData);
        tablesData = [];
      }
      
      // Creează array pentru toate mesele (1-30)
      const allTables = [];
      for (let i = 1; i <= TOTAL_TABLES; i++) {
        const tableData = tablesData.find((t) => t.number === i || t.table_number === i);
        allTables.push({
          number: i,
          status: tableData?.status || 'free', // free, occupied, reserved
          order_id: tableData?.order_id || null,
          timer: tableData?.timer || null,
          total: tableData?.total || 0,
        });
      }
      setTables(allTables);
    } catch (err) {
      console.error('❌ Eroare la încărcarea statusului meselor:', err);
      setError('Nu s-a putut încărca statusul meselor.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = useCallback((newSession) => {
    console.log('✅ KioskTablesPage - Login success, session:', newSession);
    
    // Verifică dacă sesiunea este validă
    if (!newSession || !newSession.username || !newSession.role) {
      console.error('❌ Sesiune invalidă primită:', newSession);
      return;
    }
    
    // 🟢 FIX: Salvează sesiunea imediat în sessionStorage dacă nu există
    const savedSession = checkKioskSession();
    if (!savedSession) {
      console.log('💾 KioskTablesPage - Salvez sesiunea în sessionStorage');
      sessionStorage.setItem('kiosk_session', JSON.stringify(newSession));
    }
    
    // 🟢 FIX: Actualizează state-ul imediat
    setSession(newSession);
    setAuthRequiredMessage(null);
    
    // Reîncarcă status mese după login
    loadTablesStatus();
    
    // 🟢 FIX: Forțează re-render imediat și după delay-uri pentru siguranță
    // Prima verificare imediată
    const immediateSession = checkKioskSession();
    if (immediateSession) {
      console.log('✅ KioskTablesPage - Sesiune confirmată imediat:', immediateSession);
      setSession(immediateSession);
    }
    
    // A doua verificare după un mic delay
    setTimeout(() => {
      const updatedSession = checkKioskSession();
      if (updatedSession) {
        console.log('✅ KioskTablesPage - Sesiune validă confirmată după 100ms:', updatedSession);
        setSession(updatedSession); // Forțează re-render
      } else {
        console.warn('⚠️ KioskTablesPage - Sesiunea nu a fost găsită după 100ms, reîncerc...');
        // Reîncearcă salvarea
        sessionStorage.setItem('kiosk_session', JSON.stringify(newSession));
        setSession(newSession);
      }
    }, 100);
    
    // A treia verificare după un delay mai mare
    setTimeout(() => {
      const updatedSession = checkKioskSession();
      if (updatedSession) {
        console.log('✅ KioskTablesPage - Sesiune validă confirmată după 500ms:', updatedSession);
        setSession(updatedSession);
      }
    }, 500);
  }, [loadTablesStatus]);

  useEffect(() => {
    // Verifică sesiunea (poate fi null - permite vizualizare StandBy)
    const currentSession = checkKioskSession();
    console.log('🔍 KioskTablesPage - Session check:', currentSession);
    setSession(currentSession);

    // Încarcă status mese (chiar dacă nu e autentificat)
    loadTablesStatus();

    // Refresh la fiecare 3 secunde
    const interval = setInterval(loadTablesStatus, 3000);
    
    // 🟢 FIX: Verifică sesiunea periodic pentru a detecta login-uri
    const sessionCheckInterval = setInterval(() => {
      const latestSession = checkKioskSession();
      if (latestSession && (!session || session.username !== latestSession.username)) {
        console.log('🔄 KioskTablesPage - Sesiune nouă detectată în interval:', latestSession);
        setSession(latestSession);
      }
    }, 1000); // Verifică la fiecare secundă
    
    // Înregistrează callback pentru login success
    const cleanup = registerLoginSuccessCallback(handleLoginSuccess);
    
    return () => {
      clearInterval(interval);
      clearInterval(sessionCheckInterval);
      if (cleanup) cleanup();
    };
  }, [registerLoginSuccessCallback, handleLoginSuccess, loadTablesStatus, session]);

  const handleTableClick = async (table) => {
    // Verifică dacă utilizatorul este autentificat
    const currentSession = checkKioskSession();
    if (!currentSession) {
      // Nu e autentificat - afișează mesaj și deschide modal login
      setAuthRequiredMessage(`Trebuie să te autentifici pentru a opera interfața.`);
      openLoginModal();
      return;
    }

    // Verifică rolul
    const allowedRoles = ['waiter', 'supervisor', 'admin'];
    if (!allowedRoles.includes(currentSession.role)) {
      setAuthRequiredMessage(`Acces restricționat. Doar ospătari, supervisori și admin pot accasa KIOSK.`);
      openLoginModal();
      return;
    }

    // Actualizează sesiunea
    setSession(currentSession);

    if (table.status === 'reserved') {
      alert(`Masa ${table.number} este rezervată.`);
      return;
    }

    if (table.status === 'occupied' && table.order_id) {
      // Încarcă comanda existentă
      navigate(`/kiosk/order/${table.number}?order_id=${table.order_id}`);
    } else {
      // Creează comandă nouă
      try {
        const orderData = {
          table_id: table.number,
          items: [],
          status: 'pending',
        };
        const newOrder = await createOrder(orderData);
        
        // Log acțiune
        try {
          await httpClient.post('/api/kiosk/actions-log', {
            username: currentSession.username,
            table_id: table.number,
            order_id: newOrder.id,
            action_type: 'CREATE_ORDER',
            details_json: JSON.stringify({ table_number: table.number }),
          });
        } catch (err) {
          console.error('❌ Eroare la logarea acțiunii:', err);
        }

        navigate(`/kiosk/order/${table.number}?order_id=${newOrder.id}`);
      } catch (err) {
        console.error('❌ Eroare la crearea comenzii:', err);
        alert('Nu s-a putut crea comanda. Încearcă din nou.');
      }
    }
  };


  const getTableStatusColor = (status) => {
    switch (status) {
      case 'free':
        return 'success'; // Verde
      case 'occupied':
        return 'danger'; // Roșu
      case 'reserved':
        return 'primary'; // Albastru
      default:
        return 'secondary';
    }
  };

  const getTableStatusIcon = (status) => {
    switch (status) {
      case 'free':
        return 'fa-circle';
      case 'occupied':
        return 'fa-circle';
      case 'reserved':
        return 'fa-calendar';
      default:
        return 'fa-question';
    }
  };

  const formatTimer = (seconds) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `"Mins":${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="kiosk-tables-page">
        <div className="text-center py-5">
          <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
          <p className="mt-3">Se încarcă planul meselor...</p>
        </div>
      </div>
    );
  }

  // Verifică dacă există sesiune validă
  const hasValidSession = session && session.username && session.role;
  console.log('🔍 KioskTablesPage Render - hasValidSession:', hasValidSession, 'session:', session, 'showLoginModal:', showLoginModal);

  return (
    <div className="kiosk-tables-page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="kiosk-header" style={{ position: 'relative', zIndex: 1000000 }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>
              <i className="fas fa-table me-2"></i>Plan Mese
            </h2>
            <p className="text-muted mb-0">
              {hasValidSession ? (
                <>
                  {session.role === 'admin' ? 'Admin' : session.role === 'supervisor' ? 'Supervisor' : 'Ospătar'}: <strong>{session.username}</strong> | Rol: <strong>{session.role}</strong>
                </>
              ) : (
                <span className="text-warning">
                  <i className="fas fa-lock me-2"></i>StandBy - Autentificare necesară
                </span>
              )}
            </p>
          </div>
          <div>
            {!hasValidSession ? (
              <Button
                variant="primary"
                size="lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔓 Buton autentificare din header apăsat - CLICK DETECTAT!');
                  console.log('🔍 openLoginModal disponibil:', typeof openLoginModal === 'function');
                  setAuthRequiredMessage(null);
                  openLoginModal();
                  console.log('✅ openLoginModal apelat');
                }}
                className="me-2 kiosk-login-button"
                data-kiosk-login="true"
                style={{ 
                  zIndex: 1000001, 
                  position: 'relative',
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => console.log('🖱️ Mouse enter pe buton autentificare')}
                onMouseDown={() => console.log('🖱️ Mouse down pe buton autentificare')}
              >
                <i className="fas fa-sign-in-alt me-2"></i>Autentificare
              </Button>
            ) : (
              <>
                {session.role === 'admin' && (
                  <Button
                    variant="outline-info"
                    size="lg"
                    onClick={() => navigate('/kiosk/reports/staff-live')}
                    className="me-2"
                  >
                    <i className="fas fa-chart-line me-2"></i>Raport Ospătari
                  </Button>
                )}
                <Button variant="outline-primary" size="lg" onClick={() => navigate('/kiosk/fast-sale')} className="me-2">
                  <i className="fas fa-bolt me-2"></i>Fast Sale
                </Button>
              </>
            )}
            <Button variant="outline-secondary" size="lg" onClick={loadTablesStatus}>
              <i className="fas fa-sync-alt me-2"></i>Refresh
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}

      {/* Card Autentificare StandBy - Poziționat în dreapta sus - REDUS */}
      {!hasValidSession && (
        <div 
          className="kiosk-standby-auth-card"
          style={{ 
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 1000000,
            maxWidth: '200px',
            width: 'auto'
          }}
        >
          <Card 
            className="border-warning shadow-lg" 
            style={{ 
              backgroundColor: '#fff3cd', 
              borderWidth: '2px',
              borderColor: '#ffc107',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
            }}
          >
            <Card.Body className="text-center py-2 px-2">
              <div className="mb-2">
                <i className="fas fa-lock text-warning mb-1" style={{ display: 'block', fontSize: '1rem' }}></i>
                <h6 className="mb-1" style={{ color: '#856404', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  StandBy
                </h6>
                <p className="text-muted mb-2" style={{ fontSize: '0.65rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                  Autentificare
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔓 Buton autentificare din card apăsat');
                  setAuthRequiredMessage(null);
                  openLoginModal();
                }}
                className="px-2 py-1 kiosk-login-button"
                data-kiosk-login="true"
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  minWidth: '100px',
                  padding: '0.25rem 0.5rem',
                  zIndex: 1000001,
                  position: 'relative'
                }}
              >
                <i className="fas fa-sign-in-alt me-1"></i>Login
              </Button>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Legenda */}
      <div className="kiosk-legend mb-4">
        <Card>
          <Card.Body className="py-2">
            <div className="d-flex justify-content-center gap-4">
              <div>
                <span className="badge bg-success me-2">
                  <i className="fas fa-circle"></i>
                </span>
                Masa liberă
              </div>
              <div>
                <span className="badge bg-danger me-2">
                  <i className="fas fa-circle"></i>
                </span>
                Masa ocupată
              </div>
              <div>
                <span className="badge bg-primary me-2">
                  <i className="fas fa-calendar"></i>
                </span>
                Masa rezervată
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Grilă mese */}
      <div className="kiosk-tables-grid">
        {Array.from({ length: TABLE_ROWS }, (_, rowIndex) => (
          <div key={rowIndex} className="kiosk-tables-row">
            {Array.from({ length: TABLE_COLS }, (_, colIndex) => {
              const tableNumber = rowIndex * TABLE_COLS + colIndex + 1;
              const table = tables.find((t) => t.number === tableNumber);
              const statusColor = getTableStatusColor(table?.status || 'free');
              const statusIcon = getTableStatusIcon(table?.status || 'free');

              return (
                <Card
                  key={tableNumber}
                  className={`kiosk-table-card kiosk-table-card--${statusColor}`}
                  onClick={() => handleTableClick(table || { number: tableNumber, status: 'free' })}
                >
                  <Card.Body className="text-center p-2">
                    <div className="kiosk-table-number">
                      <i className={`fas ${statusIcon}`}></i>
                      <h3>Masa {tableNumber}</h3>
                    </div>
                    {table?.timer && (
                      <div className="kiosk-table-timer">
                        <i className="fas fa-clock"></i>
                        {formatTimer(table.timer)}
                      </div>
                    )}
                    {table?.total > 0 && (
                      <div className="kiosk-table-total">
                        <i className="fas fa-euro-sign"></i>
                        {table.total.toFixed(2)} RON
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        ))}
      </div>

      {/* Modal Login - FOLOSIM MODALUL DIN KioskStandByBoundary */}
      {/* Nu mai renderăm modal aici pentru a evita duplicarea */}
      {/* Modalul este gestionat de KioskStandByBoundary care învelește întreaga aplicație */}

      {/* Alert pentru mesaj autentificare necesară */}
      {authRequiredMessage && !showLoginModal && (
        <Alert
          variant="warning"
          dismissible
          onClose={() => setAuthRequiredMessage(null)}
          className="position-fixed top-0 start-50 translate-middle-x mt-3"
          style={{ zIndex: 1050, maxWidth: '500px' }}
        >
          <i className="fas fa-exclamation-triangle me-2"></i>
          {authRequiredMessage}
        </Alert>
      )}
    </div>
  );
};

