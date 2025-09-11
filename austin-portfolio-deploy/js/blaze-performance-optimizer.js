/**
 * Blaze Intelligence Performance Optimization & Caching System
 * Advanced caching, lazy loading, and performance monitoring
 */

class BlazePerformanceOptimizer {
    constructor(config = {}) {
        this.config = {
            enableServiceWorker: config.enableServiceWorker || true,
            enableLazyLoading: config.enableLazyLoading || true,
            enableImageOptimization: config.enableImageOptimization || true,
            cacheStrategy: config.cacheStrategy || 'cache-first', // cache-first, network-first, stale-while-revalidate
            maxCacheSize: config.maxCacheSize || 50 * 1024 * 1024, // 50MB
            performanceThresholds: {
                lcp: config.lcpThreshold || 2500, // Largest Contentful Paint
                fid: config.fidThreshold || 100,  // First Input Delay
                cls: config.clsThreshold || 0.1,  // Cumulative Layout Shift
                ttfb: config.ttfbThreshold || 800, // Time to First Byte
                ...config.performanceThresholds
            },
            ...config
        };
        
        // Performance tracking
        this.metrics = {
            pageLoadTimes: [],
            apiResponseTimes: [],
            cacheHitRate: 0,
            memoryUsage: [],
            networkRequests: [],
            errorRate: 0
        };
        
        // Cache management
        this.cache = new Map();
        this.cacheMetrics = {
            hits: 0,
            misses: 0,
            size: 0,
            lastCleanup: Date.now()
        };
        
        // Performance observers
        this.observers = new Map();
        
        // Resource loading queue
        this.loadingQueue = new Map();
        this.priorityQueue = [];
        
        this.initializeOptimizer();
    }
    
    initializeOptimizer() {
        console.log('🚀 Initializing Blaze Performance Optimizer...');
        
        // Set up performance monitoring
        this.initializePerformanceMonitoring();
        
        // Initialize caching system
        this.initializeCaching();
        
        // Set up lazy loading
        if (this.config.enableLazyLoading) {
            this.initializeLazyLoading();
        }
        
        // Initialize image optimization
        if (this.config.enableImageOptimization) {
            this.initializeImageOptimization();
        }
        
        // Set up service worker
        if (this.config.enableServiceWorker) {
            this.initializeServiceWorker();
        }
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        // Schedule cache cleanup
        this.scheduleCacheCleanup();
    }
    
    // Performance Monitoring
    initializePerformanceMonitoring() {
        // Core Web Vitals monitoring
        if ('PerformanceObserver' in window) {
            this.observeLCP(); // Largest Contentful Paint
            this.observeFID(); // First Input Delay  
            this.observeCLS(); // Cumulative Layout Shift
            this.observeTTFB(); // Time to First Byte
            this.observeResourceTiming();
        }
        
        // Memory usage monitoring
        this.monitorMemoryUsage();
        
        // Network monitoring
        this.monitorNetworkRequests();
    }
    
    observeLCP() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const lcp = entry.startTime;
                this.metrics.lcp = lcp;
                
                if (lcp > this.config.performanceThresholds.lcp) {
                    console.warn(`⚠️ LCP threshold exceeded: ${lcp}ms > ${this.config.performanceThresholds.lcp}ms`);
                    this.optimizeLCP();
                }
            }
        });
        
        try {
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', observer);
        } catch (error) {
            console.warn('⚠️ LCP observation not supported:', error);
        }
    }
    
    observeFID() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const fid = entry.processingStart - entry.startTime;
                this.metrics.fid = fid;
                
                if (fid > this.config.performanceThresholds.fid) {
                    console.warn(`⚠️ FID threshold exceeded: ${fid}ms > ${this.config.performanceThresholds.fid}ms`);
                    this.optimizeFID();
                }
            }
        });
        
        try {
            observer.observe({ entryTypes: ['first-input'] });
            this.observers.set('fid', observer);
        } catch (error) {
            console.warn('⚠️ FID observation not supported:', error);
        }
    }
    
    observeCLS() {
        let clsScore = 0;
        
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsScore += entry.value;
                    this.metrics.cls = clsScore;
                    
                    if (clsScore > this.config.performanceThresholds.cls) {
                        console.warn(`⚠️ CLS threshold exceeded: ${clsScore} > ${this.config.performanceThresholds.cls}`);
                        this.optimizeCLS();
                    }
                }
            }
        });
        
        try {
            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', observer);
        } catch (error) {
            console.warn('⚠️ CLS observation not supported:', error);
        }
    }
    
    observeTTFB() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === window.location.href) {
                    const ttfb = entry.responseStart - entry.requestStart;
                    this.metrics.ttfb = ttfb;
                    
                    if (ttfb > this.config.performanceThresholds.ttfb) {
                        console.warn(`⚠️ TTFB threshold exceeded: ${ttfb}ms > ${this.config.performanceThresholds.ttfb}ms`);
                        this.optimizeTTFB();
                    }
                }
            }
        });
        
        try {
            observer.observe({ entryTypes: ['navigation'] });
            this.observers.set('ttfb', observer);
        } catch (error) {
            console.warn('⚠️ TTFB observation not supported:', error);
        }
    }
    
    observeResourceTiming() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.metrics.networkRequests.push({
                    name: entry.name,
                    duration: entry.duration,
                    size: entry.transferSize || 0,
                    type: entry.initiatorType,
                    timestamp: entry.startTime
                });
                
                // Keep only last 100 requests
                if (this.metrics.networkRequests.length > 100) {
                    this.metrics.networkRequests.shift();
                }
            }
        });
        
        try {
            observer.observe({ entryTypes: ['resource'] });
            this.observers.set('resource', observer);
        } catch (error) {
            console.warn('⚠️ Resource timing observation not supported:', error);
        }
    }
    
    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
                
                this.metrics.memoryUsage.push(memory);
                
                // Keep only last 20 measurements
                if (this.metrics.memoryUsage.length > 20) {
                    this.metrics.memoryUsage.shift();
                }
                
                // Warn if memory usage is high
                const usagePercent = (memory.used / memory.limit) * 100;
                if (usagePercent > 80) {
                    console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(1)}%`);
                    this.optimizeMemoryUsage();
                }
            }, 10000); // Every 10 seconds
        }
    }
    
    monitorNetworkRequests() {
        // Override fetch to monitor API requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            
            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                this.metrics.apiResponseTimes.push(duration);
                if (this.metrics.apiResponseTimes.length > 50) {
                    this.metrics.apiResponseTimes.shift();
                }
                
                // Log slow API calls
                if (duration > 2000) {
                    console.warn(`🐌 Slow API request: ${args[0]} took ${duration.toFixed(0)}ms`);
                }
                
                return response;
            } catch (error) {
                this.metrics.errorRate++;
                throw error;
            }
        };
    }
    
    // Caching System
    initializeCaching() {
        console.log('💾 Initializing advanced caching system...');
        
        // Set up different cache levels
        this.memoryCache = new Map();
        this.storageCache = this.initializeStorageCache();
        
        // Cache API responses
        this.setupAPICache();
    }
    
    initializeStorageCache() {
        try {
            // Use IndexedDB for large data caching
            if ('indexedDB' in window) {
                return this.initializeIndexedDB();
            } else if ('localStorage' in window) {
                return this.initializeLocalStorage();
            }
        } catch (error) {
            console.warn('⚠️ Storage cache initialization failed:', error);
            return null;
        }
    }
    
    async initializeIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BlazeCache', 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                const db = request.result;
                resolve({
                    get: async (key) => {
                        const transaction = db.transaction(['cache'], 'readonly');
                        const store = transaction.objectStore('cache');
                        const request = store.get(key);
                        
                        return new Promise((resolve) => {
                            request.onsuccess = () => {
                                const result = request.result;
                                if (result && result.expires > Date.now()) {
                                    this.cacheMetrics.hits++;
                                    resolve(result.data);
                                } else {
                                    this.cacheMetrics.misses++;
                                    resolve(null);
                                }
                            };
                            request.onerror = () => {
                                this.cacheMetrics.misses++;
                                resolve(null);
                            };
                        });
                    },
                    
                    set: async (key, data, ttl = 3600000) => {
                        const transaction = db.transaction(['cache'], 'readwrite');
                        const store = transaction.objectStore('cache');
                        store.put({
                            key,
                            data,
                            expires: Date.now() + ttl,
                            size: JSON.stringify(data).length
                        });
                    },
                    
                    delete: async (key) => {
                        const transaction = db.transaction(['cache'], 'readwrite');
                        const store = transaction.objectStore('cache');
                        store.delete(key);
                    }
                });
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('cache')) {
                    const store = db.createObjectStore('cache', { keyPath: 'key' });
                    store.createIndex('expires', 'expires', { unique: false });
                }
            };
        });
    }
    
    initializeLocalStorage() {
        return {
            get: (key) => {
                try {
                    const item = localStorage.getItem(`blaze_${key}`);
                    if (!item) {
                        this.cacheMetrics.misses++;
                        return null;
                    }
                    
                    const parsed = JSON.parse(item);
                    if (parsed.expires > Date.now()) {
                        this.cacheMetrics.hits++;
                        return parsed.data;
                    } else {
                        localStorage.removeItem(`blaze_${key}`);
                        this.cacheMetrics.misses++;
                        return null;
                    }
                } catch (error) {
                    this.cacheMetrics.misses++;
                    return null;
                }
            },
            
            set: (key, data, ttl = 3600000) => {
                try {
                    const item = {
                        data,
                        expires: Date.now() + ttl
                    };
                    localStorage.setItem(`blaze_${key}`, JSON.stringify(item));
                } catch (error) {
                    console.warn('⚠️ LocalStorage cache set failed:', error);
                }
            },
            
            delete: (key) => {
                localStorage.removeItem(`blaze_${key}`);
            }
        };
    }
    
    async cacheGet(key, level = 'memory') {
        try {
            // Try memory cache first
            if (this.memoryCache.has(key)) {
                const cached = this.memoryCache.get(key);
                if (cached.expires > Date.now()) {
                    this.cacheMetrics.hits++;
                    return cached.data;
                } else {
                    this.memoryCache.delete(key);
                }
            }
            
            // Try storage cache
            if (level !== 'memory' && this.storageCache) {
                const data = await this.storageCache.get(key);
                if (data) {
                    // Promote to memory cache
                    this.memoryCache.set(key, {
                        data,
                        expires: Date.now() + 300000 // 5 minutes in memory
                    });
                    return data;
                }
            }
            
            this.cacheMetrics.misses++;
            return null;
        } catch (error) {
            console.error('❌ Cache get error:', error);
            this.cacheMetrics.misses++;
            return null;
        }
    }
    
    async cacheSet(key, data, ttl = 3600000) {
        try {
            // Set in memory cache
            this.memoryCache.set(key, {
                data,
                expires: Date.now() + Math.min(ttl, 300000) // Max 5 minutes in memory
            });
            
            // Set in storage cache
            if (this.storageCache) {
                await this.storageCache.set(key, data, ttl);
            }
            
            this.updateCacheSize();
        } catch (error) {
            console.error('❌ Cache set error:', error);
        }
    }
    
    setupAPICache() {
        // Cache Cardinals analytics data
        const originalCardinalsAPI = window.blazeAPI?.getCardinalsAnalytics;
        if (originalCardinalsAPI) {
            window.blazeAPI.getCardinalsAnalytics = async (options = {}) => {
                const cacheKey = `cardinals-${JSON.stringify(options)}`;
                
                // Try cache first
                const cached = await this.cacheGet(cacheKey);
                if (cached && !options.forceRefresh) {
                    return cached;
                }
                
                // Fetch fresh data
                try {
                    const data = await originalCardinalsAPI(options);
                    await this.cacheSet(cacheKey, data, 300000); // 5 minutes cache
                    return data;
                } catch (error) {
                    // Return cached data if available, even if expired
                    if (cached) {
                        console.warn('⚠️ Using stale cache due to API error');
                        return cached;
                    }
                    throw error;
                }
            };
        }
    }
    
    // Lazy Loading System
    initializeLazyLoading() {
        console.log('📋 Initializing lazy loading...');
        
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback for older browsers
            this.setupScrollBasedLazyLoading();
        }
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadResource(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px', // Load 50px before entering viewport
            threshold: 0.1
        });
        
        // Observe all lazy-loadable elements
        document.querySelectorAll('[data-lazy]').forEach(element => {
            observer.observe(element);
        });
        
        this.observers.set('intersection', observer);
    }
    
    setupScrollBasedLazyLoading() {
        const checkLazyElements = () => {
            const elements = document.querySelectorAll('[data-lazy]:not([data-loaded])');
            
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                if (rect.top < window.innerHeight + 50) {
                    this.loadResource(element);
                }
            });
        };
        
        window.addEventListener('scroll', this.throttle(checkLazyElements, 100));
        window.addEventListener('resize', this.throttle(checkLazyElements, 100));
        
        // Initial check
        checkLazyElements();
    }
    
    loadResource(element) {
        const src = element.dataset.lazy;
        const type = element.dataset.lazyType || 'image';
        
        switch (type) {
            case 'image':
                this.loadLazyImage(element, src);
                break;
            case 'script':
                this.loadLazyScript(element, src);
                break;
            case 'component':
                this.loadLazyComponent(element, src);
                break;
            default:
                console.warn('⚠️ Unknown lazy type:', type);
        }
    }
    
    loadLazyImage(element, src) {
        const img = new Image();
        img.onload = () => {
            element.src = src;
            element.classList.add('loaded');
            element.dataset.loaded = 'true';
        };
        img.onerror = () => {
            element.classList.add('error');
            console.error('❌ Failed to load lazy image:', src);
        };
        img.src = src;
    }
    
    loadLazyScript(element, src) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            element.dataset.loaded = 'true';
        };
        script.onerror = () => {
            console.error('❌ Failed to load lazy script:', src);
        };
        document.head.appendChild(script);
    }
    
    loadLazyComponent(element, componentName) {
        // Load component dynamically
        if (window.blazeComponents && window.blazeComponents[componentName]) {
            const component = new window.blazeComponents[componentName](element);
            component.render();
            element.dataset.loaded = 'true';
        } else {
            console.error('❌ Component not found:', componentName);
        }
    }
    
    // Image Optimization
    initializeImageOptimization() {
        console.log('🖼️ Initializing image optimization...');
        
        // Optimize existing images
        this.optimizeExistingImages();
        
        // Set up automatic optimization for new images
        this.observeNewImages();
    }
    
    optimizeExistingImages() {
        const images = document.querySelectorAll('img:not([data-optimized])');
        
        images.forEach(img => {
            this.optimizeImage(img);
        });
    }
    
    observeNewImages() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const images = node.tagName === 'IMG' ? [node] : 
                                     node.querySelectorAll('img');
                        
                        images.forEach(img => {
                            if (!img.dataset.optimized) {
                                this.optimizeImage(img);
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.observers.set('imageOptimization', observer);
    }
    
    optimizeImage(img) {
        // Add responsive attributes if not present
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }
        
        // Add responsive sizes if not present
        if (!img.hasAttribute('sizes') && img.hasAttribute('data-sizes')) {
            img.setAttribute('sizes', img.dataset.sizes);
        }
        
        img.dataset.optimized = 'true';
    }
    
    // Service Worker
    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('👷 Service Worker registered:', registration);
                
                // Update on reload
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🆕 Service Worker updated');
                        }
                    });
                });
            } catch (error) {
                console.warn('⚠️ Service Worker registration failed:', error);
            }
        }
    }
    
    // Performance Optimization Actions
    optimizeLCP() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Optimize images in viewport
        this.optimizeAboveTheFoldImages();
        
        // Remove render-blocking resources
        this.deferNonCriticalCSS();
    }
    
    optimizeFID() {
        // Break up long tasks
        this.breakUpLongTasks();
        
        // Defer non-essential JavaScript
        this.deferNonEssentialJS();
        
        // Use web workers for heavy computation
        this.offloadToWebWorkers();
    }
    
    optimizeCLS() {
        // Set dimensions for media elements
        this.setMediaDimensions();
        
        // Reserve space for dynamic content
        this.reserveSpaceForDynamicContent();
    }
    
    optimizeTTFB() {
        // Implement caching strategies
        // (Already implemented in caching system)
        
        // Use service worker for faster responses
        // (Already implemented)
    }
    
    optimizeMemoryUsage() {
        // Clear unused cache entries
        this.cleanupCache();
        
        // Remove unused event listeners
        this.cleanupEventListeners();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }
    
    preloadCriticalResources() {
        const criticalResources = [
            '/js/blaze-realtime-enhanced.js',
            '/css/blaze-critical.css',
            '/data/dashboard-config.json'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = this.getResourceType(resource);
            document.head.appendChild(link);
        });
    }
    
    optimizeAboveTheFoldImages() {
        const viewportHeight = window.innerHeight;
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.top < viewportHeight) {
                img.setAttribute('fetchpriority', 'high');
                img.removeAttribute('loading'); // Remove lazy loading for above-fold images
            }
        });
    }
    
    deferNonCriticalCSS() {
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        
        nonCriticalCSS.forEach(link => {
            link.media = 'print';
            link.onload = function() {
                this.media = 'all';
            };
        });
    }
    
    breakUpLongTasks() {
        // Use scheduler.postTask if available
        if ('scheduler' in window && 'postTask' in scheduler) {
            this.useSchedulerAPI();
        } else {
            // Fallback to setTimeout
            this.useSetTimeoutFallback();
        }
    }
    
    useSchedulerAPI() {
        // Implementation for modern scheduler API
        window.blazeScheduler = {
            postTask: (callback, priority = 'background') => {
                return scheduler.postTask(callback, { priority });
            }
        };
    }
    
    useSetTimeoutFallback() {
        // Break up long tasks using setTimeout
        window.blazeScheduler = {
            postTask: (callback, priority = 'background') => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(callback());
                    }, 0);
                });
            }
        };
    }
    
    // Utility Methods
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    getResourceType(url) {
        if (url.endsWith('.js')) return 'script';
        if (url.endsWith('.css')) return 'style';
        if (url.endsWith('.json')) return 'fetch';
        if (url.match(/\.(jpg|jpeg|png|webp|svg)$/)) return 'image';
        return 'fetch';
    }
    
    updateCacheSize() {
        let totalSize = 0;
        
        // Calculate memory cache size
        for (const [key, value] of this.memoryCache) {
            totalSize += JSON.stringify(value).length;
        }
        
        this.cacheMetrics.size = totalSize;
        
        // Calculate hit rate
        const total = this.cacheMetrics.hits + this.cacheMetrics.misses;
        this.cacheMetrics.hitRate = total > 0 ? (this.cacheMetrics.hits / total) * 100 : 0;
    }
    
    scheduleCacheCleanup() {
        setInterval(() => {
            this.cleanupCache();
        }, 300000); // Every 5 minutes
    }
    
    cleanupCache() {
        const now = Date.now();
        let cleaned = 0;
        
        // Clean memory cache
        for (const [key, value] of this.memoryCache) {
            if (value.expires < now) {
                this.memoryCache.delete(key);
                cleaned++;
            }
        }
        
        // Clean storage cache if possible
        if (this.storageCache && this.storageCache.cleanup) {
            this.storageCache.cleanup();
        }
        
        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
            this.updateCacheSize();
        }
        
        this.cacheMetrics.lastCleanup = now;
    }
    
    startPerformanceMonitoring() {
        setInterval(() => {
            this.reportPerformanceMetrics();
        }, 30000); // Every 30 seconds
    }
    
    reportPerformanceMetrics() {
        const metrics = this.getPerformanceMetrics();
        
        // Log performance summary
        console.log('📈 Performance Metrics:', {
            coreWebVitals: {
                lcp: metrics.lcp,
                fid: metrics.fid,
                cls: metrics.cls,
                ttfb: metrics.ttfb
            },
            cache: {
                hitRate: metrics.cacheHitRate.toFixed(1) + '%',
                size: (metrics.cacheSize / 1024).toFixed(1) + 'KB'
            },
            api: {
                avgResponseTime: metrics.avgApiResponseTime.toFixed(0) + 'ms',
                errorRate: metrics.errorRate
            }
        });
        
        // Emit performance event
        window.dispatchEvent(new CustomEvent('blazePerformanceReport', {
            detail: metrics
        }));
    }
    
    // Public API
    getPerformanceMetrics() {
        const avgApiResponseTime = this.metrics.apiResponseTimes.length > 0 ?
            this.metrics.apiResponseTimes.reduce((a, b) => a + b, 0) / this.metrics.apiResponseTimes.length : 0;
        
        const currentMemory = this.metrics.memoryUsage.length > 0 ?
            this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1] : null;
        
        return {
            // Core Web Vitals
            lcp: this.metrics.lcp || 0,
            fid: this.metrics.fid || 0,
            cls: this.metrics.cls || 0,
            ttfb: this.metrics.ttfb || 0,
            
            // Cache metrics
            cacheHitRate: this.cacheMetrics.hitRate,
            cacheSize: this.cacheMetrics.size,
            
            // API metrics
            avgApiResponseTime,
            errorRate: this.metrics.errorRate,
            
            // Memory metrics
            memoryUsage: currentMemory ? {
                used: (currentMemory.used / 1024 / 1024).toFixed(1) + 'MB',
                total: (currentMemory.total / 1024 / 1024).toFixed(1) + 'MB',
                usagePercent: ((currentMemory.used / currentMemory.limit) * 100).toFixed(1) + '%'
            } : null,
            
            // Network metrics
            networkRequests: this.metrics.networkRequests.length,
            
            timestamp: Date.now()
        };
    }
    
    getCacheStats() {
        return {
            ...this.cacheMetrics,
            memorySize: this.memoryCache.size,
            lastCleanup: new Date(this.cacheMetrics.lastCleanup).toISOString()
        };
    }
    
    clearAllCaches() {
        this.memoryCache.clear();
        
        if (this.storageCache) {
            // Clear storage cache
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('blaze_')) {
                    localStorage.removeItem(key);
                }
            });
        }
        
        console.log('🧹 All caches cleared');
        this.updateCacheSize();
    }
    
    // Cleanup
    destroy() {
        console.log('🔥 Shutting down Performance Optimizer...');
        
        // Disconnect all observers
        this.observers.forEach((observer, name) => {
            try {
                observer.disconnect();
            } catch (error) {
                console.warn(`⚠️ Failed to disconnect ${name} observer:`, error);
            }
        });
        
        // Clear caches
        this.clearAllCaches();
        
        // Clear data structures
        this.observers.clear();
        this.loadingQueue.clear();
        this.priorityQueue = [];
    }
}

// Global initialization
if (typeof window !== 'undefined') {
    window.blazePerformanceOptimizer = null;
    
    window.initializeBlazePerformance = function(config = {}) {
        if (window.blazePerformanceOptimizer) {
            window.blazePerformanceOptimizer.destroy();
        }
        
        window.blazePerformanceOptimizer = new BlazePerformanceOptimizer(config);
        
        // Global performance API
        window.blazePerformance = {
            getMetrics: () => window.blazePerformanceOptimizer.getPerformanceMetrics(),
            getCacheStats: () => window.blazePerformanceOptimizer.getCacheStats(),
            clearCaches: () => window.blazePerformanceOptimizer.clearAllCaches(),
            optimize: () => {
                window.blazePerformanceOptimizer.optimizeLCP();
                window.blazePerformanceOptimizer.optimizeFID();
                window.blazePerformanceOptimizer.optimizeCLS();
            }
        };
        
        return window.blazePerformanceOptimizer;
    };
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.initializeBlazePerformance();
        });
    } else {
        window.initializeBlazePerformance();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazePerformanceOptimizer;
}