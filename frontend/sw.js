// Service Worker for Arisegenius - Offline Support and Caching
const CACHE_NAME = 'arisegenius-v3'; // Updated version to force refresh
const RUNTIME_CACHE = 'arisegenius-runtime-v3';

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

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Don't cache large files (over 5MB)
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
              return response; // Return without caching
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.log('Service Worker: Cache put failed', error);
              });

            return response;
          })
          .catch((error) => {
            console.log('Service Worker: Fetch failed', error);
            // If network fails and it's a navigation request, return offline page
            if (event.request.mode === 'navigate') {
              const offlinePage = caches.match('/index.html');
              if (offlinePage) {
                return offlinePage;
              }
            }
            // For other requests, return a proper error response
            return new Response('Network error', {
              status: 408,
              statusText: 'Request Timeout',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
      .catch((error) => {
        console.log('Service Worker: Cache match failed', error);
        // Fallback to network fetch - but don't intercept if it fails
        return fetch(event.request).catch((fetchError) => {
          console.log('Service Worker: Network fetch also failed', fetchError);
          // Return a valid error response
          return new Response('Service unavailable', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
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

