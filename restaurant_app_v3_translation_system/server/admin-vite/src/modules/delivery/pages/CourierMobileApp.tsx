/**
 * 📱 COURIER MOBILE APP - PWA optimizat pentru telefon
 * Inspirat din HorecaAI DriverView
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation, Phone, CheckCircle, Package, MapPin, RefreshCw,
  Bike, X, History, ArrowLeft, Clock, DollarSign, Download
} from 'lucide-react';
import { getApiUrl } from '@/utils/serverConfig';
import { initPWAInstall, showInstallPrompt, isPWAInstalled, isInstallPromptAvailable } from '@/utils/pwa-install';
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
  delivery_fee?: number;
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
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize PWA install
  useEffect(() => {
    initPWAInstall();
    setIsInstalled(isPWAInstalled());

    // Listen for install prompt availability
    const handleInstallAvailable = () => {
      console.log('📱 PWA install prompt available - showing button');
      setShowInstallButton(true);
    };

    const handleInstalled = () => {
      console.log('✅ PWA installed - hiding button');
      setIsInstalled(true);
      setShowInstallButton(false);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    // Check if install prompt is available (Android/Chrome)
    if (isInstallPromptAvailable()) {
      console.log('📱 Install prompt already available');
      setShowInstallButton(true);
    }

    // For iOS Safari - always show install button (uses Share menu)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS && isSafari && !isPWAInstalled()) {
      console.log('🍎 iOS Safari detected - showing manual install button');
      setShowInstallButton(true);
    }

    // Check again after a delay (in case event fires late)
    const timeout = setTimeout(() => {
      if (!isPWAInstalled() && !showInstallButton) {
        // Try to show button if conditions are met
        if (isInstallPromptAvailable()) {
          setShowInstallButton(true);
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
      clearTimeout(timeout);
    };
  }, []);

  // Get API token from localStorage (sau ID curier pentru backward compatibility)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || localStorage.getItem('courier_api_token');
    const id = params.get("courier id") || localStorage.getItem('courier_id');

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
      // apiUrl deja conține /api, deci folosim doar /couriers/me
      const res = await fetch(`${apiUrl}/couriers/me`, {
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
      // Include toate statusurile: active (assigned, picked_up) și istoric (delivered)
      if (apiToken) {
        // apiUrl deja conține /api, deci folosim doar /couriers/me/assignments
        // Include toate statusurile pentru a avea și istoricul
        res = await fetch(`${apiUrl}/couriers/me/assignments?status=assigned,picked_up,delivered`, {
          headers: {
            'Authorization': `Bearer ${apiToken}`
          }
        });
      } else {
        // Backward compatibility: folosește endpoint-ul cu ID (fără autentificare)
        // apiUrl deja conține /api, deci folosim doar /couriers/...
        // Include toate statusurile pentru a avea și istoricul
        res = await fetch(`${apiUrl}/couriers/${courierId}/deliveries?status=assigned,picked_up,delivered`);
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
    if (courierId || apiToken) {
      refreshOrders();
      // Auto-refresh every 30 seconds
      const interval = setInterval(refreshOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [courierId, apiToken]);

  const activeDeliveries = myOrders.filter(o => o.status === 'assigned' || o.status === 'picked_up');
  const historyDeliveries = myOrders.filter(o => o.status === 'delivered');

  // 🔴 FIX: Calculează câștigurile doar pentru ziua curentă
  const calculateEarnings = () => {
    const deliveryFee = 15; // RON per delivery
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todayDeliveries = historyDeliveries.filter(d => {
      if (!d.delivered_at) return false;
      const deliveredDate = new Date(d.delivered_at).toISOString().split('T')[0];
      return deliveredDate === today;
    });
    return todayDeliveries.length * deliveryFee;
  };

  // 🔴 FIX: Grupează istoricul pe zile calendaristice cu câștigurile respective
  const getHistoryByDate = () => {
    const groupedByDate: { [key: string]: { deliveries: DeliveryOrder[], earnings: number } } = {};

    historyDeliveries.forEach(delivery => {
      if (!delivery.delivered_at) return;

      const deliveredDate = new Date(delivery.delivered_at).toISOString().split('T')[0];
      const dateKey = deliveredDate;

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { deliveries: [], earnings: 0 };
      }

      groupedByDate[dateKey].deliveries.push(delivery);
      groupedByDate[dateKey].earnings += delivery.delivery_fee || 15;
    });

    // Sortează zilele descrescător (cele mai recente primele)
    return Object.entries(groupedByDate)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, data]) => ({
        date,
        deliveries: data.deliveries.sort((a, b) =>
          new Date(b.delivered_at!).getTime() - new Date(a.delivered_at!).getTime()
        ),
        earnings: data.earnings
      }));
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

      // apiUrl deja conține /api, deci folosim doar /couriers/...
      const res = await fetch(`${apiUrl}/couriers/delivery/${deliveryId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Eroare necunoscută' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        refreshOrders();
      } else {
        console.error('Failed to update status:', data);
        alert(`Eroare: ${data.error || 'Nu s-a putut actualiza statusul'}`);
      }
    } catch (err: any) {
      console.error('Error updating delivery status:', err);
      alert(`Eroare: ${err.message || 'Nu s-a putut actualiza statusul'}`);
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
      // apiUrl deja conține /api, deci folosim doar /couriers/login
      const res = await fetch(`${apiUrl}/couriers/login`, {
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

  const handleInstallPWA = async () => {
    // Check if iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS && isSafari) {
      // iOS Safari - show instructions
      alert('📱 Pentru a instala aplicația pe iOS:\n\n1. Apasă butonul Share (pătrat cu săgeată)\n2. Selectează "Adaugă pe ecranul principal"\n3. Confirmă instalarea');
      return;
    }

    // Android/Chrome - use install prompt
    const installed = await showInstallPrompt();
    if (installed) {
      setShowInstallButton(false);
      setIsInstalled(true);
    } else {
      // Fallback: show manual instructions
      alert('📱 Pentru a instala aplicația:\n\n1. Apasă meniul browser-ului (3 puncte)\n2. Selectează "Adaugă pe ecranul principal" sau "Instalează aplicația"\n3. Confirmă instalarea');
    }
  };

  useEffect(() => {
    if (apiToken) {
      setButtonEnabled(true);
    }
  }, [apiToken]);

  if (!courierId && !apiToken) {
    return (
      <div className="courier-mobile-login">
        <div className="courier-mobile-login__card">
          <Bike size={48} className="courier-mobile-login__icon" />
          <h2>Mod Curier</h2>

          {/* Tabs pentru moduri de login */}
          <div className="d-flex gap-2 mb-3">
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
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>"introdu token ul tau api"</p>
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
                <p>"token ul api poate fi generat din pagina de gestio"</p>
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
          {showInstallButton && !isInstalled && (
            <button
              onClick={handleInstallPWA}
              className="btn-install-pwa"
              title='Instalează aplicația pe telefon'
            >
              <Download size={18} />
            </button>
          )}
          <button
            onClick={refreshOrders}
            className={`btn-refresh ${isRefreshing ? 'rotating' : ''}`}
            disabled={isRefreshing}
            title="Reîmprospătează comenzile"
          >
            <RefreshCw size={18} />
          </button>
          <div className="courier-mobile-header__earnings">
            <span className="earnings-label">Câștig azi</span>
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
              <p>"nicio livrare activa"</p>
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
                        <Phone size={14} />"Sună"</button>
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
            {getHistoryByDate().map(({ date, deliveries, earnings }) => {
              const dateObj = new Date(date);
              const isToday = date === new Date().toISOString().split('T')[0];
              const dateLabel = isToday
                ? 'Astăzi'
                : dateObj.toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

              return (
                <div key={date} className="courier-history-day-group">
                  <div className="history-day-header">
                    <div className="history-day-label">{dateLabel}</div>
                    <div className="history-day-earnings">
                      <DollarSign size={14} />
                      {earnings.toFixed(0)} RON
                    </div>
                  </div>
                  {deliveries.map(order => (
                    <div key={order.id} className="courier-history-item">
                      <div>
                        <div className="history-id">Livrare #{order.order_number || order.id}</div>
                        <div className="history-time">{new Date(order.delivered_at!).toLocaleTimeString('ro-RO')}</div>
                      </div>
                      <div className="history-earnings">
                        <DollarSign size={14} />
                        +{order.delivery_fee || 15} RON
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            {historyDeliveries.length === 0 && (
              <div className="courier-mobile-empty">
                <History size={48} />
                <p>"nicio livrare finalizata"</p>
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
              <button onClick={() => setShowSignaturePad(false)} className="btn-close-modal" title="Închide semnătură">
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
              <button onClick={clearSignature} className="btn-clear">"Șterge"</button>
              <button onClick={confirmDelivery} className="btn-confirm">"confirma livrarea"</button>
            </div>
          </div>
        </div>
      )}

      {/* Back to Admin Button */}
      <button
        onClick={() => window.location.href = '/dispatch'}
        className="courier-mobile-back"
        title='Înapoi la dispecerat'
      >
        <ArrowLeft size={18} />
      </button>
    </div>
  );
};




