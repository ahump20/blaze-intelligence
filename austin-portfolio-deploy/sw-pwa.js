/**
 * Blaze Intelligence PWA Service Worker
 * Championship-level offline support and caching strategy
 * Version: 3.0.0
 */

const CACHE_VERSION = 'blaze-v3.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Core assets that must be cached for offline
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/blaze-professional.css',
  '/css/championshipDashboard.css',
  '/js/navigation-manager.js',
  '/js/realtime-data-handler.js',
  '/images/brand/blaze-tagline.png',
  '/images/brand/blaze-hero.png'
];

// External CDN resources to cache
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js',
  'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker v3.0.0');

  event.waitUntil(
    Promise.all([
      // Cache core assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      }),
      // Cache CDN assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching CDN assets');
        return Promise.allSettled(
          CDN_ASSETS.map(url =>
            cache.add(url).catch(err =>
              console.warn(`[SW] Failed to cache CDN asset: ${url}`, err)
            )
          )
        );
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      self.skipWaiting(); // Activate immediately
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            // Delete old caches but keep current ones
            return !cacheName.includes(CACHE_VERSION);
          })
          .map(cacheName => {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and browser-sync requests
  if (url.protocol === 'chrome-extension:' || url.hostname === 'localhost' && url.port === '3000') {
    return;
  }

  // API requests - Network First with cache fallback (30 second cache)
  if (url.pathname.startsWith('/api/') || url.pathname.includes('sportsdataio')) {
    event.respondWith(
      networkFirstStrategy(request, API_CACHE, 30000) // 30 second cache
    );
    return;
  }

  // Images - Cache First with network fallback
  if (request.destination === 'image' || /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname)) {
    event.respondWith(
      cacheFirstStrategy(request, IMAGE_CACHE)
    );
    return;
  }

  // JavaScript and CSS - Cache First for production
  if (/\.(js|css)$/i.test(url.pathname)) {
    event.respondWith(
      cacheFirstStrategy(request, STATIC_CACHE)
    );
    return;
  }

  // HTML pages - Network First with cache fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      networkFirstStrategy(request, DYNAMIC_CACHE, 300000) // 5 minute cache
        .catch(() => {
          // If offline, try to return cached page or offline.html
          return caches.match(request.url)
            .then(response => response || caches.match('/offline.html'))
            .then(response => response || new Response('Offline', { status: 503 }));
        })
    );
    return;
  }

  // Default - Network First
  event.respondWith(
    networkFirstStrategy(request, DYNAMIC_CACHE)
  );
});

// Cache First Strategy - check cache, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetchAndCache(request, cache);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    throw error;
  }
}

// Network First Strategy - try network, fallback to cache
async function networkFirstStrategy(request, cacheName, maxAge = 86400000) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Add cache timestamp
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', Date.now().toString());

      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });

      cache.put(request, modifiedResponse);
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Check if cache is still fresh
      const cacheTime = cachedResponse.headers.get('sw-cache-time');
      if (cacheTime && (Date.now() - parseInt(cacheTime)) < maxAge) {
        return cachedResponse;
      }
    }

    throw error;
  }
}

// Background fetch and cache update
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response);
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

// Message handler for cache management
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  if (event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return Promise.all(
          urls.map(url => cache.add(url).catch(() => {}))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Sync any offline analytics data when back online
  console.log('[SW] Syncing analytics data');
  // Implementation would go here
}

// Push notifications support
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Blaze Intelligence',
    icon: '/images/brand/blaze-tagline.png',
    badge: '/images/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Blaze Intelligence', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[SW] Service Worker loaded successfully');