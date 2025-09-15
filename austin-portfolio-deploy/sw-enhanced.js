// Blaze Intelligence Enhanced PWA Service Worker
// Version: 3.0.0 - Complete PWA with advanced caching
// Last Updated: 2025-01-14

const CACHE_VERSION = 'v3.0.0';
const CACHE_NAME = `blaze-intelligence-${CACHE_VERSION}`;
const STATIC_CACHE = `blaze-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `blaze-dynamic-${CACHE_VERSION}`;
const DATA_CACHE = `blaze-data-${CACHE_VERSION}`;
const IMAGE_CACHE = `blaze-images-${CACHE_VERSION}`;

// Essential files for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',

  // Core pages
  '/analytics.html',
  '/nil-calculator-advanced.html',
  '/sec-nil-analytics.html',
  '/performance-monitor.html',
  '/sec-football-enhanced.html',
  '/championship-ai-analytics.html',
  '/digital-combine.html',
  '/deep-south-sports-authority.html',
  '/cardinals-intelligence-dashboard.html',
  '/perfect-game-enhanced.html',

  // Core JavaScript
  '/api/sports-data-connector.js',
  '/js/realtime-data-handler.js',
  '/js/three-data-visualizer.js',
  '/js/performance-optimizer.js',
  '/js/rti-fusion-engine.js',
  '/js/rti-decision-engine.js',
  '/js/webrtc-gateway.js',

  // External libraries (cached from CDN)
  'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js',
  'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
];

// Network timeout settings
const NETWORK_TIMEOUT = 3000;
const API_TIMEOUT = 5000;

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log(`🔥 Blaze Intelligence PWA Installing ${CACHE_VERSION}`);

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Pre-caching static assets...');
        // Add files one by one to handle failures gracefully
        return Promise.allSettled(
          STATIC_ASSETS.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
            });
          })
        );
      })
      .then(() => {
        console.log('✅ Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log(`🚀 Blaze Intelligence PWA Activating ${CACHE_VERSION}`);

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => {
            return name.startsWith('blaze-') &&
                   !name.includes(CACHE_VERSION);
          })
          .map(name => {
            console.log('🗑️ Removing old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('✅ Activation complete');
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - advanced caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different resource types
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// API requests - network first with cache fallback
async function handleAPIRequest(request) {
  const cache = await caches.open(DATA_CACHE);

  try {
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), API_TIMEOUT);
    });

    const response = await Promise.race([networkPromise, timeoutPromise]);

    if (response.ok) {
      // Update cache with fresh data
      await cache.put(request, response.clone());
      return response;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    // Try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📦 Serving API from cache:', request.url);
      // Add header to indicate cached response
      const headers = new Headers(cachedResponse.headers);
      headers.append('X-From-Cache', 'true');
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }

    // Return offline API response
    return new Response(JSON.stringify({
      offline: true,
      message: 'Currently offline. Cached data may be available.',
      timestamp: Date.now()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Images - cache first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response);
      }
    }).catch(() => {});

    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder image
    return generatePlaceholderImage();
  }
}

// Static assets - stale while revalidate
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Pages - network first with cache fallback
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    const networkResponse = await fetchWithTimeout(request, NETWORK_TIMEOUT);

    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return generateOfflinePage();
    }

    return new Response('Offline', { status: 503 });
  }
}

// Utility function for fetch with timeout
function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

// Generate placeholder image
function generatePlaceholderImage() {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#0a0e27"/>
      <text x="200" y="150" text-anchor="middle" fill="#BF5700" font-size="20" font-family="Arial">
        🔥 Image Loading...
      </text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache'
    }
  });
}

// Generate offline page
function generateOfflinePage() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Blaze Intelligence - Offline</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0a0e27, #1a1a2e);
          color: #e0e6ed;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        .offline-container {
          text-align: center;
          max-width: 600px;
        }
        .logo {
          font-size: 4rem;
          margin-bottom: 20px;
        }
        h1 {
          color: #BF5700;
          font-size: 2.5rem;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #BF5700, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          font-size: 1.2rem;
          color: #8892b0;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .features {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
        }
        .feature-list {
          list-style: none;
          text-align: left;
        }
        .feature-list li {
          padding: 10px 0;
          color: #9BCBEB;
        }
        .feature-list li:before {
          content: "✓ ";
          color: #4CAF50;
          font-weight: bold;
          margin-right: 10px;
        }
        .retry-button {
          background: linear-gradient(135deg, #BF5700, #FFD700);
          color: white;
          border: none;
          padding: 15px 40px;
          font-size: 1.1rem;
          border-radius: 50px;
          cursor: pointer;
          transition: transform 0.3s ease;
          margin-top: 20px;
        }
        .retry-button:hover {
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="logo">🔥</div>
        <h1>You're Offline</h1>
        <p>
          No worries! Blaze Intelligence works offline too.
          Your cached data and analytics are still available.
        </p>

        <div class="features">
          <h3 style="margin-bottom: 20px; color: #FFD700;">Available Offline:</h3>
          <ul class="feature-list">
            <li>Cached sports analytics and statistics</li>
            <li>Previously viewed player profiles</li>
            <li>NIL calculator functionality</li>
            <li>Three.js visualizations</li>
            <li>Performance monitoring tools</li>
          </ul>
        </div>

        <button class="retry-button" onclick="location.reload()">
          Try Reconnecting
        </button>
      </div>

      <script>
        // Check for connection periodically
        setInterval(() => {
          fetch('/api/health')
            .then(response => {
              if (response.ok) {
                location.reload();
              }
            })
            .catch(() => {});
        }, 5000);
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    }
  });
}

// Background sync event
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'sync-sports-data') {
    event.waitUntil(syncSportsData());
  } else if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

// Sync sports data
async function syncSportsData() {
  try {
    const endpoints = [
      '/api/mlb/cardinals',
      '/api/nfl/titans',
      '/api/ncaa/longhorns',
      '/api/perfectgame/latest',
      '/api/txhs/rankings'
    ];

    const cache = await caches.open(DATA_CACHE);

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          await cache.put(endpoint, response);
        }
      } catch (error) {
        console.error(`Failed to sync ${endpoint}:`, error);
      }
    }

    // Notify clients of update
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'data-updated',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Sports data sync failed:', error);
  }
}

// Sync analytics
async function syncAnalytics() {
  console.log('📊 Syncing analytics...');
  // Implementation for syncing analytics data
}

// Push notification support
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || '🏆 New championship intelligence available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'blaze-update',
    renotify: true,
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View Update'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('🔥 Blaze Intelligence', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const urlToOpen = event.notification.data.url;

    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(windowClients => {
          for (const client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Message handler for client communication
self.addEventListener('message', event => {
  if (event.data.type === 'skip-waiting') {
    self.skipWaiting();
  } else if (event.data.type === 'cache-status') {
    event.waitUntil(
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      })
    );
  }
});

// Get cache status
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    status[name] = {
      count: requests.length,
      version: CACHE_VERSION
    };
  }

  return {
    version: CACHE_VERSION,
    caches: status,
    timestamp: Date.now()
  };
}

console.log(`🔥 Blaze Intelligence PWA ${CACHE_VERSION} ready`);