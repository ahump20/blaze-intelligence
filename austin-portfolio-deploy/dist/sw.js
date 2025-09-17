/**
 * Service Worker for Blaze Intelligence RTI Platform
 * Provides offline functionality, caching, and background sync
 * Optimized for real-time sports analytics and performance
 */

const CACHE_NAME = 'blaze-rti-v1.0.0';
const STATIC_CACHE_NAME = 'blaze-rti-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'blaze-rti-dynamic-v1.0.0';

// Core files to cache for offline functionality
const CORE_CACHE_FILES = [
  '/',
  '/index.html',
  '/multimodal-intelligence-working.html',
  '/manifest.json',

  // RTI System Core
  '/js/rti-fusion-engine.js',
  '/js/webrtc-gateway.js',
  '/js/rti-decision-engine.js',
  '/js/sports-pattern-library.js',
  '/js/rti-performance-tester.js',
  '/js/mobile-responsive-handler.js',

  // Essential Libraries
  '/js/tensorflow.min.js',
  '/js/three.min.js',
  '/js/chart.min.js',

  // CSS and Assets
  '/css/all.min.css',
  '/css/video-js.css'
];

// Dynamic content patterns to cache
const CACHE_PATTERNS = {
  api: /^\/api\//,
  images: /\.(png|jpg|jpeg|webp|gif|svg)$/i,
  videos: /\.(mp4|webm|mov|avi)$/i,
  data: /\.(json|csv)$/i,
  fonts: /\.(woff|woff2|eot|ttf)$/i
};

// Network timeouts
const TIMEOUT_DURATION = 3000;
const OFFLINE_TIMEOUT = 1000;

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // Cache core files
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('📦 Caching core files...');
        return cache.addAll(CORE_CACHE_FILES);
      }),

      // Pre-load critical RTI data
      preloadCriticalData()
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),

      // Initialize background sync
      initializeBackgroundSync(),

      // Setup push notifications
      initializePushNotifications()
    ]).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
  );
});

/**
 * Fetch Event Handler - Main caching and offline strategy
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension URLs
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (CACHE_PATTERNS.api.test(url.pathname)) {
    event.respondWith(handleAPIRequest(request));
  } else if (CACHE_PATTERNS.images.test(url.pathname)) {
    event.respondWith(handleImageRequest(request));
  } else if (CACHE_PATTERNS.videos.test(url.pathname)) {
    event.respondWith(handleVideoRequest(request));
  } else if (CACHE_PATTERNS.data.test(url.pathname)) {
    event.respondWith(handleDataRequest(request));
  } else {
    event.respondWith(handleGeneralRequest(request));
  }
});

/**
 * Background Sync Event Handler
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'rti-data-sync') {
    event.waitUntil(syncRTIData());
  } else if (event.tag === 'performance-metrics-sync') {
    event.waitUntil(syncPerformanceMetrics());
  } else if (event.tag === 'analysis-results-sync') {
    event.waitUntil(syncAnalysisResults());
  }
});

/**
 * Push Event Handler
 */
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');

  if (event.data) {
    const data = event.data.json();
    event.waitUntil(showNotification(data));
  }
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

/**
 * Request Handling Strategies
 */

async function handleAPIRequest(request) {
  try {
    // Try network first for API requests
    const networkResponse = await fetchWithTimeout(request, TIMEOUT_DURATION);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cache
    console.log('📡 Network failed, trying cache for API request');
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for RTI API
    return createOfflineAPIResponse(request);
  }
}

async function handleImageRequest(request) {
  // Cache first strategy for images
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return placeholder image
    return createPlaceholderImageResponse();
  }
}

async function handleVideoRequest(request) {
  // Network first for videos (large files)
  try {
    const networkResponse = await fetch(request);

    // Don't cache large video files automatically
    if (networkResponse.ok && request.headers.get('range')) {
      // Handle range requests for video streaming
      return networkResponse;
    }

    return networkResponse;
  } catch (error) {
    console.log('📹 Video request failed:', error);
    return new Response('Video unavailable offline', { status: 503 });
  }
}

async function handleDataRequest(request) {
  // Stale while revalidate for data files
  const cachedResponse = await caches.match(request);

  // Return cached version immediately
  const cachePromise = cachedResponse ? Promise.resolve(cachedResponse) : Promise.reject();

  // Update cache in background
  const networkPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return Promise.race([
    cachePromise,
    networkPromise
  ]).catch(() => {
    return createOfflineDataResponse(request);
  });
}

async function handleGeneralRequest(request) {
  // Network first for HTML, then cache
  try {
    const networkResponse = await fetchWithTimeout(request, TIMEOUT_DURATION);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match('/offline.html') || createOfflineResponse();
  }
}

/**
 * Utility Functions
 */

function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name =>
    name.startsWith('blaze-rti-') && name !== CACHE_NAME &&
    name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME
  );

  return Promise.all(
    oldCaches.map(name => {
      console.log('🗑️ Deleting old cache:', name);
      return caches.delete(name);
    })
  );
}

async function preloadCriticalData() {
  try {
    // Pre-load sports pattern library
    const patternsResponse = await fetch('/api/sports-patterns');
    if (patternsResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put('/api/sports-patterns', patternsResponse);
    }
  } catch (error) {
    console.log('⚠️ Failed to preload critical data:', error);
  }
}

function initializeBackgroundSync() {
  // Register background sync tags
  return self.registration.sync?.register('rti-data-sync').catch(() => {
    console.log('Background sync not supported');
  });
}

function initializePushNotifications() {
  // Setup push notification handling
  console.log('🔔 Push notifications initialized');
}

function createOfflineAPIResponse(request) {
  const url = new URL(request.url);

  // Create mock responses for different API endpoints
  const mockData = {
    '/api/health': { status: 'offline', timestamp: Date.now() },
    '/api/sports-patterns': { patterns: [], cached: true },
    '/api/performance-metrics': { metrics: {}, offline: true }
  };

  const responseData = mockData[url.pathname] || { error: 'Service unavailable offline' };

  return new Response(JSON.stringify(responseData), {
    status: url.pathname in mockData ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Offline': 'true'
    }
  });
}

function createOfflineDataResponse(request) {
  return new Response(JSON.stringify({
    error: 'Data unavailable offline',
    cached: false,
    timestamp: Date.now()
  }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json',
      'X-Offline': 'true'
    }
  });
}

function createPlaceholderImageResponse() {
  // Return a simple placeholder SVG
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#0a0e27"/>
      <text x="100" y="100" text-anchor="middle" fill="#BF5700" font-family="Arial" font-size="16">
        Image Offline
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

function createOfflineResponse() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Blaze RTI - Offline</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #0a0e27, #1a1a2e);
          color: #e0e6ed;
          text-align: center;
          padding: 50px 20px;
        }
        .offline-content {
          max-width: 500px;
          margin: 0 auto;
        }
        .logo {
          color: #BF5700;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .message {
          font-size: 1.1rem;
          margin-bottom: 30px;
        }
        .retry-btn {
          background: #BF5700;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }
        .retry-btn:hover {
          background: #a04800;
        }
      </style>
    </head>
    <body>
      <div class="offline-content">
        <div class="logo">🔥 Blaze RTI</div>
        <div class="message">
          You're currently offline. Some features may be limited.
          <br><br>
          Cached RTI data and offline analysis are still available.
        </div>
        <button class="retry-btn" onclick="location.reload()">
          Try Again
        </button>
      </div>
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

/**
 * Background Sync Functions
 */

async function syncRTIData() {
  try {
    console.log('🔄 Syncing RTI data...');

    // Get pending RTI data from IndexedDB
    const pendingData = await getPendingRTIData();

    if (pendingData.length > 0) {
      for (const data of pendingData) {
        await uploadRTIData(data);
      }

      await clearPendingRTIData();
      console.log('✅ RTI data synced successfully');
    }
  } catch (error) {
    console.error('❌ RTI data sync failed:', error);
    throw error;
  }
}

async function syncPerformanceMetrics() {
  try {
    console.log('📊 Syncing performance metrics...');

    const metrics = await getPendingMetrics();
    if (metrics.length > 0) {
      await uploadPerformanceMetrics(metrics);
      await clearPendingMetrics();
    }
  } catch (error) {
    console.error('❌ Performance metrics sync failed:', error);
    throw error;
  }
}

async function syncAnalysisResults() {
  try {
    console.log('🧠 Syncing analysis results...');

    const results = await getPendingAnalysisResults();
    if (results.length > 0) {
      await uploadAnalysisResults(results);
      await clearPendingAnalysisResults();
    }
  } catch (error) {
    console.error('❌ Analysis results sync failed:', error);
    throw error;
  }
}

/**
 * IndexedDB Helper Functions (simplified - would need full implementation)
 */

async function getPendingRTIData() {
  // Implementation would use IndexedDB to retrieve pending data
  return [];
}

async function clearPendingRTIData() {
  // Implementation would clear synced data from IndexedDB
}

async function getPendingMetrics() {
  return [];
}

async function clearPendingMetrics() {
  // Clear metrics from local storage
}

async function getPendingAnalysisResults() {
  return [];
}

async function clearPendingAnalysisResults() {
  // Clear analysis results from local storage
}

async function uploadRTIData(data) {
  return fetch('/api/rti-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

async function uploadPerformanceMetrics(metrics) {
  return fetch('/api/performance-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics)
  });
}

async function uploadAnalysisResults(results) {
  return fetch('/api/analysis-results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results)
  });
}

/**
 * Push Notification Functions
 */

async function showNotification(data) {
  const title = data.title || 'Blaze RTI Notification';
  const options = {
    body: data.body || 'New analysis results available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'rti-notification',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Results'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: data.priority === 'high'
  };

  return self.registration.showNotification(title, options);
}

console.log('🛠️ Service Worker loaded successfully');