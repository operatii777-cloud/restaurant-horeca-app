/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVICE WORKER - PWA pentru Restaurant App
 * 
 * Funcționalități:
 * - Offline support
 * - Caching strategic (network-first, cache fallback)
 * - Background sync pentru comenzi
 * - Push notifications
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CACHE_VERSION = 'restaurant-app-v3.0.0';
const CACHE_NAME = `${CACHE_VERSION}-cache`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Resurse esențiale pentru offline
const ESSENTIAL_CACHE_URLS = [
  '/legacy/orders/comanda.html',
  '/css/ux-improvements.css',
  '/js/ux-improvements.js',
  '/js/allergens-client.js',
  '/translation/translation.js',
  '/translation/translation-compat.js',
  '/config.js',
  '/Trattoria.jpg',
  '/socket.io/socket.io.js',
];

// Resurse pentru cache runtime (API responses, imagini)
const RUNTIME_CACHE_PATTERNS = [
  /\/api\/kiosk\/menu/,
  /\/api\/kiosk\/products/,
  /\/images\//,
  /\/assets\//,
];

/**
 * INSTALL - Cache resurse esențiale
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential resources');
        return cache.addAll(ESSENTIAL_CACHE_URLS.map(url => {
          try {
            return new Request(url, { cache: 'reload' });
          } catch (e) {
            return url;
          }
        }));
      })
      .then(() => {
        console.log('[SW] Service Worker installed');
        return self.skipWaiting(); // Activează imediat
      })
      .catch((err) => {
        console.error('[SW] Install error:', err);
      })
  );
});

/**
 * ACTIVATE - Cleanup cache-uri vechi
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim(); // Preia controlul imediat
      })
  );
});

/**
 * FETCH - Network-first strategy cu cache fallback
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (doar pentru același origin)
  if (url.origin !== location.origin) {
    return;
  }
  
  // Skip Socket.IO
  if (url.pathname.startsWith('/socket.io/')) {
    return;
  }
  
  // Strategy: Network-first pentru API, Cache-first pentru static
  if (url.pathname.startsWith('/api/')) {
    // API: Network-first, cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    // Runtime cache: Network-first, cache fallback
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  } else {
    // Static resources: Cache-first, network fallback
    event.respondWith(cacheFirstStrategy(request));
  }
});

/**
 * Network-first strategy
 */
async function networkFirstStrategy(request, cacheName = CACHE_NAME) {
  try {
    const networkResponse = await fetch(request);
    
    // Clone și salvează în cache dacă e valid
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Fallback la cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback pentru navigare
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/legacy/orders/comanda.html');
      if (fallback) {
        return fallback;
      }
    }
    
    // Return offline page sau error
    return new Response('Offline - Conținutul nu este disponibil offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Cache-first strategy
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * BACKGROUND SYNC - Pentru comenzi offline
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

/**
 * Sincronizează comenzi offline
 */
async function syncPendingOrders() {
  try {
    // Obține comenzi offline din IndexedDB sau localStorage
    const pendingOrders = await getPendingOrders();
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/kiosk/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          await removePendingOrder(order.id);
          console.log('[SW] Order synced:', order.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync order:', order.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync error:', error);
  }
}

/**
 * Helper: Obține comenzi offline (mock - trebuie implementat cu IndexedDB)
 */
async function getPendingOrders() {
  // TODO: Implementare cu IndexedDB
  return [];
}

/**
 * Helper: Șterge comandă sincronizată
 */
async function removePendingOrder(orderId) {
  // TODO: Implementare cu IndexedDB
}

/**
 * PUSH NOTIFICATIONS
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Notificare nouă',
    icon: '/Trattoria.jpg',
    badge: '/Trattoria.jpg',
    vibrate: [200, 100, 200],
    tag: 'restaurant-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Deschide' },
      { action: 'close', title: 'Închide' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Restaurant App', options)
  );
});

/**
 * NOTIFICATION CLICK
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/legacy/orders/comanda.html')
    );
  }
});

/**
 * MESSAGE - Comunicare cu app
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
