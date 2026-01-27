/**
 * 📱 COURIER MOBILE APP - PWA optimizat pentru telefon
 * Inspirat din HorecaAI DriverView
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, Phone, CheckCircle, Package, MapPin, RefreshCw, 
  Bike, X, History, ArrowLeft, Clock, DollarSign 
} from 'lucide-react';
import { getApiUrl } from '@/utils/serverConfig';
import './CourierMobileApp.css';

interface DeliveryOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total: number;
  status: string;
  created_at: string;
  picked_up_at?: string;
  delivered_at?: string;
}

export const CourierMobileApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [myOrders, setMyOrders] = useState<DeliveryOrder[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [courierId, setCourierId] = useState<number | null>(null);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [courierInfo, setCourierInfo] = useState<any>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Get API token from localStorage (sau ID curier pentru backward compatibility)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || localStorage.getItem('courier_api_token');
    const id = params.get('courier_id') || localStorage.getItem('courier_id');
    
    if (token) {
      setApiToken(token);
      localStorage.setItem('courier_api_token', token);
      // Verifică token și obține info curier
      verifyTokenAndLoadCourier(token);
    } else if (id) {
      // Backward compatibility: folosește ID direct (fără autentificare)
      setCourierId(parseInt(id));
      localStorage.setItem('courier_id', id);
    }
  }, []);

  // Verifică token și încarcă info curier
  const verifyTokenAndLoadCourier = async (token: string) => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/couriers/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.courier) {
        setCourierInfo(data.courier);
        setCourierId(data.courier.id);
        setApiToken(token);
      } else {
        setLoginError('Token invalid');
        setApiToken(null);
        localStorage.removeItem('courier_api_token');
      }
    } catch (err) {
      console.error('Error verifying token:', err);
      setLoginError('Eroare la verificare token');
      setApiToken(null);
      localStorage.removeItem('courier_api_token');
    }
  };

  const refreshOrders = async () => {
    if (!courierId && !apiToken) return;
    
    setIsRefreshing(true);
    try {
      const apiUrl = getApiUrl();
      let res;
      
      // Dacă avem token, folosim endpoint-ul cu autentificare
      if (apiToken) {
        res = await fetch(`${apiUrl}/api/couriers/me/assignments?status=assigned,picked_up`, {
          headers: {
            'Authorization': `Bearer ${apiToken}`
          }
        });
      } else {
        // Backward compatibility: folosește endpoint-ul cu ID (fără autentificare)
        res = await fetch(`${apiUrl}/api/couriers/${courierId}/deliveries?status=assigned,picked_up`);
      }
      
      const data = await res.json();
      if (data.success) {
        setMyOrders(data.deliveries || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    refreshOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshOrders, 30000);
    return () => clearInterval(interval);
  }, [courierId]);

  const activeDeliveries = myOrders.filter(o => o.status === 'assigned' || o.status === 'picked_up');
  const historyDeliveries = myOrders.filter(o => o.status === 'delivered');

  const calculateEarnings = () => {
    const deliveryFee = 15; // RON per delivery
    return historyDeliveries.length * deliveryFee;
  };

  const handleAction = async (order: DeliveryOrder) => {
    if (order.status === 'assigned') {
      // Preia comanda
      if (confirm('Preiei comanda și pleci spre client?')) {
        await updateDeliveryStatus(order.id, 'picked_up');
      }
    } else if (order.status === 'picked_up') {
      // Confirmă livrare cu semnătură
      setSelectedOrder(order);
      setShowSignaturePad(true);
    }
  };

  const updateDeliveryStatus = async (deliveryId: number, status: string) => {
    try {
      const apiUrl = getApiUrl();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      // Dacă avem token, adaugă-l în header
      if (apiToken) {
        headers['Authorization'] = `Bearer ${apiToken}`;
      }
      
      const res = await fetch(`${apiUrl}/api/couriers/delivery/${deliveryId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        refreshOrders();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const confirmDelivery = async () => {
    if (!selectedOrder) return;
    
    const canvas = canvasRef.current;
    const signature = canvas ? canvas.toDataURL() : '';
    
    try {
      await updateDeliveryStatus(selectedOrder.id, 'delivered');
      setShowSignaturePad(false);
      setSelectedOrder(null);
      // Clear canvas
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const openNavigation = (address: string, app: 'google' | 'waze' = 'google') => {
    if (app === 'waze') {
      const wazeUrl = `https://www.waze.com/ul?q=${encodeURIComponent(address)}`;
      window.open(wazeUrl, '_blank');
    } else {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Login cu token API (ca în HorecaAI)
  const handleTokenLogin = async (token: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      await verifyTokenAndLoadCourier(token);
    } catch (err) {
      setLoginError('Eroare la autentificare');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Login cu username/password (ca în HorecaAI)
  const handleUsernamePasswordLogin = async (username: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/couriers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      if (data.success && data.token) {
        setApiToken(data.token);
        setCourierInfo(data.courier);
        setCourierId(data.courier.id);
        localStorage.setItem('courier_api_token', data.token);
        setLoginError(null);
      } else {
        setLoginError(data.error || 'Autentificare eșuată');
      }
    } catch (err: any) {
      setLoginError('Eroare la autentificare: ' + (err.message || 'Conexiune eșuată'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [loginMode, setLoginMode] = useState<'token' | 'username'>('username');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  if (!courierId && !apiToken) {
    return (
      <div className="courier-mobile-login">
        <div className="courier-mobile-login__card">
          <Bike size={48} className="courier-mobile-login__icon" />
          <h2>Mod Curier</h2>
          
          {/* Tabs pentru moduri de login */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setLoginMode('username')}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: loginMode === 'username' ? '#667eea' : '#e5e7eb',
                color: loginMode === 'username' ? 'white' : '#666',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              Username/Password
            </button>
            <button
              onClick={() => setLoginMode('token')}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: loginMode === 'token' ? '#667eea' : '#e5e7eb',
                color: loginMode === 'token' ? 'white' : '#666',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              Token API
            </button>
          </div>
          
          {loginError && (
            <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem', padding: '0.5rem', background: '#fee', borderRadius: '0.5rem' }}>
              {loginError}
            </div>
          )}
          
          {loginMode === 'username' ? (
            <>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                Autentifică-te cu codul/telefonul și parola
              </p>
              <input
                type="text"
                placeholder="Cod / Telefon / Email"
                className="courier-mobile-login__input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && username && password) {
                    handleUsernamePasswordLogin(username, password);
                  }
                }}
              />
              <input
                type="password"
                placeholder="Parolă"
                className="courier-mobile-login__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && username && password) {
                    handleUsernamePasswordLogin(username, password);
                  }
                }}
              />
              <button
                onClick={() => handleUsernamePasswordLogin(username, password)}
                disabled={isLoggingIn || !username || !password}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: (isLoggingIn || !username || !password) ? 'not-allowed' : 'pointer',
                  marginTop: '1rem',
                  opacity: (isLoggingIn || !username || !password) ? 0.6 : 1
                }}
              >
                {isLoggingIn ? 'Se autentifică...' : 'Autentificare'}
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                Introdu token-ul tău API
              </p>
              <input
                type="text"
                placeholder="Token API"
                className="courier-mobile-login__input"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && tokenInput) {
                    handleTokenLogin(tokenInput);
                  }
                }}
              />
              <button
                onClick={() => handleTokenLogin(tokenInput)}
                disabled={isLoggingIn || !tokenInput}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: (isLoggingIn || !tokenInput) ? 'not-allowed' : 'pointer',
                  marginTop: '1rem',
                  opacity: (isLoggingIn || !tokenInput) ? 0.6 : 1
                }}
              >
                {isLoggingIn ? 'Se autentifică...' : 'Autentificare'}
              </button>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                <p>Token-ul API poate fi generat din pagina de gestionare curieri.</p>
              </div>
            </>
          )}
          
          <button 
            onClick={() => window.location.href = '/couriers'}
            className="courier-mobile-login__link"
            style={{ marginTop: '1rem' }}
          >
            Vezi lista curieri →
          </button>
          
          {/* Backward compatibility: ID curier (pentru testare) */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
              Sau folosește ID curier (mod testare):
            </p>
            <input
              type="number"
              placeholder="ID Curier (testare)"
              className="courier-mobile-login__input"
              style={{ fontSize: '0.875rem' }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  if (value) {
                    setCourierId(parseInt(value));
                    localStorage.setItem('courier_id', value);
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="courier-mobile-app">
      {/* Header */}
      <div className="courier-mobile-header">
        <div className="courier-mobile-header__user">
          <div className="courier-mobile-header__avatar">
            <Bike size={24} />
          </div>
          <div className="courier-mobile-header__info">
            <h2 className="courier-mobile-header__name">
              {courierInfo?.name || `Curier #${courierId}`}
            </h2>
            <span className="courier-mobile-header__status">
              <span className="status-dot"></span> {courierInfo?.status || 'Online'}
            </span>
          </div>
        </div>
        <div className="courier-mobile-header__actions">
          <button 
            onClick={refreshOrders} 
            className={`btn-refresh ${isRefreshing ? 'rotating' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw size={18} />
          </button>
          <div className="courier-mobile-header__earnings">
            <span className="earnings-label">Câștig Azi</span>
            <span className="earnings-value">{calculateEarnings()} RON</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="courier-mobile-tabs">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`courier-mobile-tab ${activeTab === 'active' ? 'active' : ''}`}
        >
          <Bike size={16} /> Active ({activeDeliveries.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`courier-mobile-tab ${activeTab === 'history' ? 'active' : ''}`}
        >
          <History size={16} /> Istoric ({historyDeliveries.length})
        </button>
      </div>

      {/* Content */}
      <div className="courier-mobile-content">
        {activeTab === 'active' ? (
          activeDeliveries.length === 0 ? (
            <div className="courier-mobile-empty">
              <Package size={48} />
              <p>Nicio livrare activă</p>
            </div>
          ) : (
            <div className="courier-mobile-orders">
              {activeDeliveries.map(order => (
                <div key={order.id} className="courier-order-card">
                  <div className="courier-order-header">
                    <div>
                      <span className="courier-order-id">#{order.order_number || order.id}</span>
                      <h3 className="courier-order-customer">{order.customer_name}</h3>
                    </div>
                    <div className="courier-order-total">
                      <div className="total-value">{order.total} RON</div>
                      <div className="total-status">
                        {order.status === 'picked_up' ? 'În Transit' : 'Pregătit'}
                      </div>
                    </div>
                  </div>

                  <div className="courier-order-details">
                    <div className="detail-row">
                      <MapPin size={16} />
                      <span>{order.delivery_address}</span>
                    </div>
                    <div className="courier-order-actions">
                      <button 
                        onClick={() => window.open(`tel:${order.customer_phone}`, '_self')}
                        className="action-btn action-btn--call"
                      >
                        <Phone size={14} /> Sună
                      </button>
                      <button 
                        onClick={() => openNavigation(order.delivery_address, 'google')}
                        className="action-btn action-btn--maps"
                      >
                        <Navigation size={14} /> Maps
                      </button>
                      <button 
                        onClick={() => openNavigation(order.delivery_address, 'waze')}
                        className="action-btn action-btn--waze"
                      >
                        <Navigation size={14} /> Waze
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAction(order)}
                    className={`courier-order-action ${order.status === 'picked_up' ? 'action--confirm' : 'action--pickup'}`}
                  >
                    {order.status === 'picked_up' ? (
                      <><CheckCircle size={20} /> CONFIRMĂ LIVRAREA (POD)</>
                    ) : (
                      <><Package size={20} /> PREIA COMANDA</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="courier-mobile-history">
            {historyDeliveries.slice(0, 20).map(order => (
              <div key={order.id} className="courier-history-item">
                <div>
                  <div className="history-id">Livrare #{order.order_number || order.id}</div>
                  <div className="history-time">{new Date(order.delivered_at!).toLocaleTimeString('ro-RO')}</div>
                </div>
                <div className="history-earnings">
                  <DollarSign size={14} />
                  +15 RON
                </div>
              </div>
            ))}
            {historyDeliveries.length === 0 && (
              <div className="courier-mobile-empty">
                <History size={48} />
                <p>Nicio livrare finalizată azi</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Signature Pad Modal */}
      {showSignaturePad && selectedOrder && (
        <div className="signature-modal">
          <div className="signature-modal__content">
            <div className="signature-modal__header">
              <h3>📝 Semnătură Client</h3>
              <button onClick={() => setShowSignaturePad(false)} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>
            
            <div className="signature-pad">
              <canvas 
                ref={canvasRef}
                className="signature-canvas"
                width={300}
                height={400}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="signature-modal__actions">
              <button onClick={clearSignature} className="btn-clear">
                Șterge
              </button>
              <button onClick={confirmDelivery} className="btn-confirm">
                Confirmă Livrarea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to Admin Button */}
      <button 
        onClick={() => window.location.href = '/dispatch'}
        className="courier-mobile-back"
        title="Înapoi la Dispecerat"
      >
        <ArrowLeft size={18} />
      </button>
    </div>
  );
};

