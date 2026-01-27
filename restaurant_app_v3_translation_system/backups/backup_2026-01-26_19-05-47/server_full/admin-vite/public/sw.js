/**
 * Service Worker pentru PWA - Mod Curier
 * Permite funcționare offline și instalare pe mobil
 */

const CACHE_NAME = 'restaurant-courier-v1';
const urlsToCache = [
  '/admin-vite/',
  '/admin-vite/courier',
  '/admin-vite/index.html',
  '/admin-vite/manifest.json',
];

// Install event - cache resursele esențiale
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('[SW] Cache install failed:', err);
      })
  );
  self.skipWaiting(); // Activează imediat noul service worker
});

// Activate event - șterge cache-urile vechi
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Preia controlul imediat
});

// Fetch event - serve din cache sau network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls - trebuie să fie live
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip Socket.IO
  if (url.pathname.startsWith('/socket.io/')) {
    return;
  }

  // Detectează dacă suntem în development
  const isDevelopment = url.hostname === 'localhost' || 
                       url.hostname === '127.0.0.1' ||
                       url.port === '5173';

  // În development - NU cache-ui, doar passthrough
  if (isDevelopment) {
    event.respondWith(fetch(request));
    return;
  }

  // În production - Strategy: Network First, fallback to Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response pentru cache
        const responseToCache = response.clone();
        
        // Cache doar resursele statice (HTML, CSS, JS, imagini)
        if (response.status === 200 && (
          request.destination === 'document' ||
          request.destination === 'script' ||
          request.destination === 'style' ||
          request.destination === 'image'
        )) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed - try cache
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          
          // Fallback pentru navigare - returnează index.html
          if (request.destination === 'document') {
            return caches.match('/admin-vite/index.html');
          }
          
          // Fallback generic
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

// Background sync pentru sincronizare offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  // Poți adăuga logică pentru sincronizare offline a comenzilor
});

// Push notifications (pentru viitor)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  // Poți adăuga logică pentru notificări push
});

