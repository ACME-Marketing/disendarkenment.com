const CACHE_NAME = 'disendarkenment-v4';
const STATIC_CACHE = 'disendarkenment-static-v4';
const DYNAMIC_CACHE = 'disendarkenment-dynamic-v4';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/services',
  '/about',
  '/resources',
  '/legal-safety',
  '/get-started',
  '/readiness-assessment',
  '/manifest.json',
  '/favicon.svg',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing v4...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets', error);
      })
  );
});

// Activate event - aggressively clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating v4...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('Service Worker: Found caches:', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete ALL caches that don't match current version
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: All old caches cleared');
        return self.clients.claim();
      })
      .then(() => {
        console.log('Service Worker: Activated and claimed all clients');
      })
  );
});

// Fetch event - bypass cache completely to avoid redirect issues
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  console.log('Service Worker: Handling request for', request.url);

  // For now, always fetch from network to avoid cached redirect issues
  event.respondWith(
    fetch(request, { 
      redirect: 'follow',
      cache: 'no-cache' // Force fresh requests
    })
      .then((networkResponse) => {
        console.log('Service Worker: Network response for', request.url, 'Status:', networkResponse.status, 'Redirected:', networkResponse.redirected);
        
        // Only cache successful, non-redirected responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' && !networkResponse.redirected) {
          // Clone the response for caching
          const responseToCache = networkResponse.clone();

          // Determine which cache to use
          const cacheToUse = STATIC_ASSETS.includes(url.pathname) ? STATIC_CACHE : DYNAMIC_CACHE;

          // Cache the response (but don't wait for it)
          caches.open(cacheToUse)
            .then((cache) => {
              console.log('Service Worker: Caching successful response for', request.url);
              return cache.put(request, responseToCache);
            })
            .catch((error) => {
              console.error('Service Worker: Error caching response for', request.url, error);
            });
        } else {
          console.log('Service Worker: Not caching response for', request.url, 'Status:', networkResponse.status, 'Redirected:', networkResponse.redirected);
        }

        return networkResponse;
      })
      .catch((error) => {
        console.error('Service Worker: Network fetch failed for', request.url, error);
        
        // Try to serve from cache as fallback only
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('Service Worker: Serving from cache as fallback for', request.url);
              return cachedResponse;
            }
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return new Response(
                `<!DOCTYPE html>
                <html>
                <head>
                  <title>Offline - Disendarkenment</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .offline-message { max-width: 500px; margin: 0 auto; }
                    .offline-icon { font-size: 64px; margin-bottom: 20px; }
                  </style>
                </head>
                <body>
                  <div class="offline-message">
                    <div class="offline-icon">📱</div>
                    <h1>You're Offline</h1>
                    <p>It looks like you're not connected to the internet. Some features may not be available.</p>
                    <p>Please check your connection and try again.</p>
                    <button onclick="window.location.reload()">Try Again</button>
                  </div>
                </body>
                </html>`,
                {
                  headers: { 'Content-Type': 'text/html' }
                }
              );
            }
            
            throw error;
          });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any queued form submissions or data sync
  console.log('Service Worker: Performing background sync');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon-32x32.png',
      badge: '/favicon-16x16.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'View Details',
          icon: '/favicon-16x16.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/favicon-16x16.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle cache clearing requests
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Service Worker: Clearing cache', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});