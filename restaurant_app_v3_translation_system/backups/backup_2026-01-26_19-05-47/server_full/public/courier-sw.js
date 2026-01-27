/**
 * SERVICE WORKER pentru Courier PWA
 * Permite funcționare offline și caching
 */

const CACHE_NAME = 'courier-v3-cache-v1';
const urlsToCache = [
  '/courier',
  '/admin-vite/dist/index.html',
  '/admin-vite/dist/assets/index.css',
  '/admin-vite/dist/assets/index.js',
  '/Trattoria.jpg',
];

// Install - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Cache deschis');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('❌ Service Worker Install Error:', err);
      })
  );
  self.skipWaiting();
});

// Activate - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Ștergere cache vechi:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Doar pentru GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response și salvează în cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Dacă network fail, încearcă din cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Fallback pentru navigare
          if (event.request.mode === 'navigate') {
            return caches.match('/courier');
          }
        });
      })
  );
});

