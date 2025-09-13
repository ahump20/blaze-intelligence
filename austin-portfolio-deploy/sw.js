/**
 * Championship Service Worker - Elite Caching Strategy
 * Blaze Intelligence Sports Analytics Platform
 *
 * Like a championship team's playbook, this service worker ensures
 * our platform performs flawlessly even under pressure.
 */

const CACHE_NAME = 'blaze-intelligence-v1.2.0';
const STATIC_CACHE = 'blaze-static-v1.2.0';
const DYNAMIC_CACHE = 'blaze-dynamic-v1.2.0';

// Championship-level static assets to cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/analytics.html',
    '/analytics-enhanced.html',
    '/cardinals-intelligence-dashboard.html',
    '/nil-calculator-advanced.html',
    '/demo.html',
    '/contact.html',
    '/js/performance-monitor.js',
    '/manifest.json'
];

// CDN resources critical for Three.js and Charts
const CDN_ASSETS = [
    'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Championship caching strategies
const CACHE_STRATEGIES = {
    // Critical assets: Cache first, network fallback
    CACHE_FIRST: 'cache-first',
    // Dynamic content: Network first, cache fallback
    NETWORK_FIRST: 'network-first',
    // Static assets: Stale while revalidate
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - Pre-cache championship assets
self.addEventListener('install', event => {
    console.log('🏆 Championship Service Worker installing...');

    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Caching static championship assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Cache critical CDN resources
            caches.open(CACHE_NAME).then(cache => {
                console.log('🌐 Caching critical CDN resources...');
                return cache.addAll(CDN_ASSETS);
            })
        ]).then(() => {
            console.log('⚡ Championship assets cached successfully');
            self.skipWaiting(); // Activate immediately
        })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
    console.log('🚀 Championship Service Worker activating...');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Clean up old versions
                    if (cacheName !== CACHE_NAME &&
                        cacheName !== STATIC_CACHE &&
                        cacheName !== DYNAMIC_CACHE) {
                        console.log('🧹 Cleaning up old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('🏆 Championship Service Worker activated');
            self.clients.claim(); // Take control immediately
        })
    );
});

// Fetch event - Championship routing strategy
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different types of requests with championship strategies
    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(request));
    } else if (isAPICall(url)) {
        event.respondWith(networkFirst(request));
    } else if (isCDNResource(url)) {
        event.respondWith(staleWhileRevalidate(request));
    } else if (isHTMLPage(request)) {
        event.respondWith(networkFirst(request));
    } else {
        event.respondWith(cacheFirst(request));
    }
});

// Championship Strategy: Cache First (for static assets)
async function cacheFirst(request) {
    try {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.warn('Cache first failed:', error);
        return new Response('Championship Service Worker: Asset unavailable', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Championship Strategy: Network First (for dynamic content)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        // Cache successful responses for dynamic content
        if (networkResponse.ok && shouldCache(request)) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.warn('Network first failed, trying cache:', error);

        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        // Return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            return createOfflinePage();
        }

        return new Response('Championship Service Worker: Network unavailable', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Championship Strategy: Stale While Revalidate (for CDN resources)
async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);

    // Always try to fetch fresh version in background
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(err => {
        console.warn('Stale while revalidate fetch failed:', err);
        return cached; // Return cached version if network fails
    });

    // Return cached version immediately if available
    return cached || fetchPromise;
}

// Helper functions for championship routing
function isStaticAsset(url) {
    return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isAPICall(url) {
    return url.pathname.startsWith('/api/') ||
           url.pathname.startsWith('/netlify/functions/');
}

function isCDNResource(url) {
    const cdnHosts = [
        'cdn.jsdelivr.net',
        'cdnjs.cloudflare.com',
        'unpkg.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com'
    ];
    return cdnHosts.some(host => url.hostname.includes(host));
}

function isHTMLPage(request) {
    return request.headers.get('accept').includes('text/html');
}

function shouldCache(request) {
    // Don't cache POST, PUT, DELETE requests
    if (request.method !== 'GET') return false;

    // Don't cache authentication related requests
    if (request.url.includes('auth') || request.url.includes('login')) return false;

    // Don't cache real-time data
    if (request.url.includes('live') || request.url.includes('realtime')) return false;

    return true;
}

// Create championship offline page
function createOfflinePage() {
    const offlineHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Championship Mode: Offline | Blaze Intelligence</title>
            <style>
                body {
                    font-family: 'Inter', -apple-system, sans-serif;
                    background: linear-gradient(135deg, #002244 0%, #1a1a2e 100%);
                    color: #fff;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    text-align: center;
                }
                .offline-container {
                    max-width: 600px;
                    padding: 40px;
                }
                .championship-logo {
                    font-size: 4rem;
                    margin-bottom: 20px;
                }
                h1 {
                    font-size: 2.5rem;
                    color: #FFD700;
                    margin-bottom: 20px;
                }
                p {
                    font-size: 1.2rem;
                    color: #d1d5db;
                    margin-bottom: 30px;
                    line-height: 1.6;
                }
                .retry-button {
                    background: #BF5700;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .retry-button:hover {
                    background: #d66600;
                    transform: translateY(-2px);
                }
                .features {
                    margin-top: 40px;
                    text-align: left;
                }
                .feature {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                    color: #00FF41;
                }
                .feature::before {
                    content: '⚡';
                    margin-right: 10px;
                    font-size: 1.2rem;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="championship-logo">🏆</div>
                <h1>Championship Mode: Offline</h1>
                <p>You're experiencing championship-level offline capabilities! Some cached content is available while we reconnect to live sports data.</p>

                <button class="retry-button" onclick="window.location.reload()">
                    🚀 Reconnect to Live Data
                </button>

                <div class="features">
                    <div class="feature">Cached analytics still accessible</div>
                    <div class="feature">Offline Three.js visualizations available</div>
                    <div class="feature">NIL calculator functional offline</div>
                    <div class="feature">Elite user experience maintained</div>
                </div>
            </div>

            <script>
                // Auto-retry connection every 30 seconds
                setInterval(() => {
                    if (navigator.onLine) {
                        window.location.reload();
                    }
                }, 30000);

                // Listen for online event
                window.addEventListener('online', () => {
                    window.location.reload();
                });

                console.log('🏆 Championship offline mode activated');
            </script>
        </body>
        </html>
    `;

    return new Response(offlineHTML, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// Background sync for championship data updates
self.addEventListener('sync', event => {
    if (event.tag === 'championship-data-sync') {
        event.waitUntil(syncChampionshipData());
    }
});

async function syncChampionshipData() {
    try {
        console.log('🔄 Syncing championship data in background...');

        // Sync critical sports data
        const endpoints = [
            '/api/cardinals/readiness',
            '/api/nil-calculator',
            '/api/analytics'
        ];

        const syncPromises = endpoints.map(async endpoint => {
            try {
                const response = await fetch(endpoint);
                if (response.ok) {
                    const cache = await caches.open(DYNAMIC_CACHE);
                    cache.put(endpoint, response.clone());
                }
            } catch (error) {
                console.warn(`Failed to sync ${endpoint}:`, error);
            }
        });

        await Promise.all(syncPromises);
        console.log('✅ Championship data sync completed');
    } catch (error) {
        console.error('❌ Championship data sync failed:', error);
    }
}

// Push notifications for championship updates
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Championship update available!',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'championship-update',
            data: data.url || '/',
            actions: [
                {
                    action: 'view',
                    title: '🏆 View Update'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Blaze Intelligence', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'view' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data || '/')
        );
    }
});

console.log('🏆 Championship Service Worker loaded - Elite caching and offline capabilities ready!');