// Service Worker for Arisegenius - Offline Support and Caching
const CACHE_NAME = 'arisegenius-v4'; // Updated version to force refresh and fix image blinking
const RUNTIME_CACHE = 'arisegenius-runtime-v4';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/payment.css',
  '/payment.js',
  '/products.css',
  '/products.js',
  '/favicon.ico',
  '/site.webmanifest'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('Service Worker v3: Activating and cleaning old caches');
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // CRITICAL: Skip video files FIRST - before any other processing
  // Videos are too large to cache and can cause service worker issues
  const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv|m4v)$/i.test(url.pathname) || 
                  url.pathname.includes('/videos/') ||
                  url.pathname.includes('/assets/videos/') ||
                  event.request.headers.get('accept')?.includes('video/');
  if (isVideo) {
    // Don't intercept video requests at all - let browser handle them directly
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests (always use network)
  if (event.request.url.includes('/api/')) {
    return;
  }

  // For images, use cache-first strategy to prevent flickering
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)$/i.test(url.pathname) ||
                  event.request.headers.get('accept')?.includes('image/');
  
  if (isImage) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Always return cached image if available to prevent flickering
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not cached, fetch and cache for next time
          return fetch(event.request)
            .then((response) => {
              // Only cache successful image responses
              if (response && response.status === 200 && response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(RUNTIME_CACHE)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  })
                  .catch(() => {
                    // Silently fail cache put
                  });
              }
              return response;
            })
            .catch(() => {
              // Return a placeholder or let browser handle the error
              return new Response('', { status: 404 });
            });
        })
    );
    return;
  }

  // For other resources, use network-first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch(() => {
              // Silently fail
            });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If it's a navigation request and no cache, return offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background sync for offline form submissions (if needed)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('Service Worker: Background sync triggered')
    );
  }
});

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    vibrate: [200, 100, 200],
    tag: 'arisegenius-notification'
  };

  event.waitUntil(
    self.registration.showNotification('Arisegenius', options)
  );
});

