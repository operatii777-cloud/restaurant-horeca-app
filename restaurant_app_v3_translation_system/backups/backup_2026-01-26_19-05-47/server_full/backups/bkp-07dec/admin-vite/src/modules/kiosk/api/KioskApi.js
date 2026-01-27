import { httpClient } from '@/shared/api/httpClient';

/**
 * KIOSK API - Folosește doar API-urile existente
 */

// Autentificare
export const kioskLogin = async (username, password) => {
  try {
    console.log('🔐 kioskLogin - Început autentificare...', { username, device_id: 'KIOSK_1' });
    const response = await httpClient.post('/api/admin/auth/login', {
      username,
      password,
      device_id: 'KIOSK_1', // Hardcoded pentru KIOSK
    });
    
    console.log('📥 kioskLogin - Răspuns primit:', {
      status: response.status,
      success: response.data?.success,
      username: response.data?.username,
      role: response.data?.role,
      hasToken: !!response.data?.token
    });
    
    if (response.data?.success) {
      // Salvează sesiunea
      const session = {
        username: response.data.username,
        role: response.data.role,
        token: response.data.token,
        timestamp: Date.now(),
        login_history_id: response.data.login_history_id, // Salvează ID pentru logout
      };
      
      console.log('💾 kioskLogin - Salvare sesiune în sessionStorage...', session);
      sessionStorage.setItem('kiosk_session', JSON.stringify(session));
      
      // Verifică dacă a fost salvată
      const saved = sessionStorage.getItem('kiosk_session');
      if (saved) {
        console.log('✅ kioskLogin - Sesiune salvată cu succes');
      } else {
        console.error('❌ kioskLogin - Sesiunea nu a fost salvată!');
      }
      
      // Setează login history ID global pentru AutoLockManager
      if (window.__kioskSetLoginHistoryId && response.data.login_history_id) {
        window.__kioskSetLoginHistoryId(response.data.login_history_id);
      }
      
      return session;
    }
    
    // Dacă nu există success, verifică eroarea
    const errorMessage = response.data?.error || 'Autentificare eșuată';
    console.error('❌ kioskLogin - Eroare autentificare:', errorMessage, response.data);
    throw new Error(errorMessage);
  } catch (error) {
    // Gestionare erori de rețea sau de răspuns
    console.error('❌ kioskLogin - Exception:', error);
    if (error.response) {
      // Serverul a răspuns cu un status de eroare
      const errorMessage = error.response.data?.error || error.response.data?.message || 'Eroare la autentificare';
      console.error('❌ kioskLogin - Eroare server:', error.response.status, errorMessage, error.response.data);
      throw new Error(errorMessage);
    } else if (error.request) {
      // Cererea a fost făcută dar nu s-a primit răspuns
      console.error('❌ kioskLogin - Nu s-a primit răspuns de la server:', error.message);
      throw new Error('Nu s-a putut conecta la server. Verifică conexiunea la internet.');
    } else {
      // Altă eroare
      console.error('❌ kioskLogin - Altă eroare:', error.message);
      throw error;
    }
  }
};

// Verifică sesiunea
export const checkKioskSession = () => {
  const sessionStr = sessionStorage.getItem('kiosk_session');
  if (!sessionStr) return null;
  const session = JSON.parse(sessionStr);
  // Verifică dacă sesiunea este validă (max 8 ore)
  if (Date.now() - session.timestamp > 8 * 60 * 60 * 1000) {
    sessionStorage.removeItem('kiosk_session');
    return null;
  }
  return session;
};

// Logout
export const kioskLogout = () => {
  sessionStorage.removeItem('kiosk_session');
};

// Status mese
export const getTablesStatus = async () => {
  const response = await httpClient.get('/api/admin/tables/status');
  return response.data?.tables || [];
};

// Produse
export const getProducts = async () => {
  try {
    console.log('🛒 KioskApi.getProducts - Început request...');
    // Folosim endpoint-ul corect /api/menu/all (folosit și de comanda-supervisor1.html)
    const response = await httpClient.get('/api/menu/all?lang=ro');
    console.log('✅ KioskApi.getProducts - Response primit:', {
      status: response.status,
      hasData: !!response.data,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : []
    });
    
    // Endpoint-ul returnează { data: [...] } sau { products: [...] }
    const products = response.data?.data || response.data?.products || [];
    console.log(`✅ KioskApi.getProducts - Produse extrase: ${products.length}`);
    
    if (products.length === 0) {
      console.warn('⚠️ KioskApi.getProducts - Nu s-au găsit produse în răspuns');
    }
    
    return products;
  } catch (error) {
    console.error('❌ KioskApi.getProducts - Eroare:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // 🟢 PATCH: Returnează array gol în loc să arunce eroare pentru 401/403
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('⚠️ KioskApi.getProducts - 401/403, returnez array gol');
      return [];
    }
    
    throw error;
  }
};

// Comenzi
export const createOrder = async (orderData) => {
  const response = await httpClient.post('/api/orders/create', orderData);
  return response.data;
};

export const updateOrder = async (orderId, orderData) => {
  const response = await httpClient.put(`/api/orders/${orderId}`, orderData);
  return response.data;
};

export const getOrder = async (orderId) => {
  if (!orderId) {
    console.warn('⚠️ getOrder - orderId este null sau undefined');
    return null;
  }
  
  try {
    // Folosim endpoint-ul KIOSK care nu necesită autentificare admin
    const response = await httpClient.get(`/api/kiosk/orders/${orderId}`);
    return response.data;
  } catch (err) {
    // Dacă comanda nu există (404), nu logăm ca eroare - este normal pentru comenzi noi
    if (err.response && err.response.status === 404) {
      console.log(`ℹ️ getOrder - Comanda ${orderId} nu există încă (va fi creată)`);
      return null; // Returnează null în loc să arunce eroare
    }
    
    console.error('❌ Eroare la obținerea comenzii:', err);
    // Fallback la endpoint-ul admin dacă KIOSK nu funcționează (doar pentru erori non-404)
    if (err.response && err.response.status !== 404) {
      try {
        const response = await httpClient.get(`/api/orders/${orderId}`);
        return response.data;
      } catch (fallbackErr) {
        console.error('❌ Eroare și la fallback:', fallbackErr);
        // Pentru 404 la fallback, returnează null
        if (fallbackErr.response && fallbackErr.response.status === 404) {
          console.log(`ℹ️ getOrder - Comanda ${orderId} nu există nici în fallback`);
          return null;
        }
        throw err;
      }
    }
    
    // Pentru alte erori, returnează null în loc să arunce
    return null;
  }
};

export const getOrderByTable = async (tableId) => {
  const response = await httpClient.get(`/api/orders/table/${tableId}`);
  return response.data;
};

export const getOrderByTableId = async (tableId) => {
  // Alias pentru getOrderByTable pentru claritate
  return await getOrderByTable(tableId);
};

// Transfer/Unire mese
export const transferOrder = async (orderId, newTableId) => {
  const response = await httpClient.post('/api/orders/transfer', {
    order_id: orderId,
    new_table_id: newTableId,
  });
  return response.data;
};

export const mergeOrders = async (sourceOrderId, targetOrderId) => {
  const response = await httpClient.post('/api/orders/merge', {
    source_order_id: sourceOrderId,
    target_order_id: targetOrderId,
  });
  return response.data;
};

// Claim/Lock comandă
export const claimOrder = async (orderId) => {
  const response = await httpClient.post(`/api/orders/${orderId}/claim`);
  return response.data;
};

// POS Payments
export const processPayment = async (orderId, paymentData) => {
  const response = await httpClient.post('/api/admin/pos/pay', {
    order_id: orderId,
    ...paymentData,
  });
  return response.data;
};

export const getOrderPayments = async (orderId) => {
  const response = await httpClient.get(`/api/admin/pos/order/${orderId}`);
  return response.data;
};

// Fiscalizare
export const fiscalizeOrder = async (orderId) => {
  const response = await httpClient.post('/api/admin/pos/fiscalize', {
    order_id: orderId,
  });
  return response.data;
};

// Fast Sale
export const createFastSaleOrder = async (items) => {
  const orderData = {
    table_id: null,
    items,
    is_fast_sale: true,
  };
  return await createOrder(orderData);
};

// Anulare comandă
export const cancelOrder = async (orderId, cancelReason = '') => {
  const response = await httpClient.post(`/api/orders/${orderId}/cancel`, {
    reason: cancelReason, // Backend așteaptă 'reason', nu 'cancel_reason'
  });
  return response.data;
};

// Rapoarte ospătar (doar admin)
export const getStaffLiveReport = async (waiterId, shiftDate) => {
  const response = await httpClient.get('/api/admin/kiosk/reports/staff-live', {
    params: {
      waiter_id: waiterId,
      shift_date: shiftDate,
    },
  });
  return response.data;
};

