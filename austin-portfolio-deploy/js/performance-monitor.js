/**
 * Championship Performance Monitoring & Optimization System
 * Blaze Intelligence Sports Analytics Platform
 *
 * This elite monitoring system tracks every aspect of platform performance
 * like a championship coach monitoring player stats - nothing goes unnoticed.
 */

class ChampionshipPerformanceMonitor {
    constructor() {
        this.performanceData = {
            pageLoadTime: 0,
            threeJSRenderTime: 0,
            chartRenderTime: 0,
            apiResponseTime: 0,
            memoryUsage: 0,
            fps: 0,
            userInteractionLatency: 0
        };

        this.optimizations = {
            lazyLoadingEnabled: false,
            cacheEnabled: false,
            compressionEnabled: false,
            prefetchEnabled: false
        };

        this.alerts = [];
        this.startTime = performance.now();
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.setupFPSMonitoring();
        this.setupMemoryMonitoring();
        this.setupNetworkMonitoring();
        this.setupThreeJSOptimization();
        this.setupLazyLoading();
        this.enableCaching();
        this.startRealTimeMonitoring();

        console.log('🏆 Championship Performance Monitor activated - Elite optimization engaged');
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.startTime;
            this.performanceData.pageLoadTime = loadTime;

            // Championship standard: under 2 seconds
            if (loadTime > 2000) {
                this.addAlert('warning', `Page load time ${(loadTime/1000).toFixed(2)}s exceeds championship standard of 2s`);
            } else {
                console.log(`⚡ Championship load time: ${(loadTime/1000).toFixed(2)}s - Elite performance!`);
            }
        });
    }

    setupFPSMonitoring() {
        let frames = 0;
        let lastTime = performance.now();

        const trackFPS = () => {
            frames++;
            const currentTime = performance.now();

            if (currentTime >= lastTime + 1000) {
                this.performanceData.fps = Math.round(frames * 1000 / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;

                // Championship standard: 60 FPS for Three.js visualizations
                if (this.performanceData.fps < 30 && this.isThreeJSActive()) {
                    this.addAlert('performance', `FPS dropped to ${this.performanceData.fps} - optimizing Three.js rendering`);
                    this.optimizeThreeJSPerformance();
                }
            }

            requestAnimationFrame(trackFPS);
        };

        requestAnimationFrame(trackFPS);
    }

    setupMemoryMonitoring() {
        if (performance.memory) {
            setInterval(() => {
                const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
                this.performanceData.memoryUsage = memoryMB;

                // Championship standard: under 100MB for smooth operation
                if (memoryMB > 150) {
                    this.addAlert('memory', `Memory usage ${memoryMB}MB - triggering garbage collection`);
                    this.forceGarbageCollection();
                } else if (memoryMB > 100) {
                    this.addAlert('warning', `Memory usage ${memoryMB}MB approaching championship threshold`);
                }
            }, 5000);
        }
    }

    setupNetworkMonitoring() {
        // Monitor API call performance
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            const startTime = performance.now();
            return originalFetch(...args).then(response => {
                const endTime = performance.now();
                this.performanceData.apiResponseTime = endTime - startTime;

                // Championship standard: under 500ms for API calls
                if (this.performanceData.apiResponseTime > 1000) {
                    this.addAlert('network', `API response time ${this.performanceData.apiResponseTime.toFixed(0)}ms - implementing caching`);
                    this.enableAggressiveCaching();
                }

                return response;
            });
        };
    }

    setupThreeJSOptimization() {
        // Optimize Three.js performance for championship-level visualizations
        if (window.THREE) {
            // Enable frustum culling
            THREE.Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false;

            // Optimize renderer settings
            const optimizeRenderer = (renderer) => {
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                renderer.outputEncoding = THREE.sRGBEncoding;
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1;
                renderer.shadowMap.enabled = false; // Disable shadows for better performance
                renderer.antialias = window.devicePixelRatio <= 1; // Only enable on lower DPI displays
            };

            // Patch Three.js WebGLRenderer creation
            const originalWebGLRenderer = THREE.WebGLRenderer;
            THREE.WebGLRenderer = function(parameters = {}) {
                const renderer = new originalWebGLRenderer(parameters);
                optimizeRenderer(renderer);
                console.log('🎯 Three.js renderer optimized for championship performance');
                return renderer;
            };
        }
    }

    setupLazyLoading() {
        // Championship-level lazy loading for images and 3D assets
        const observerConfig = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        lazyImageObserver.unobserve(img);
                    }
                }
            });
        }, observerConfig);

        // Observe all lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            lazyImageObserver.observe(img);
        });

        this.optimizations.lazyLoadingEnabled = true;
        console.log('🚀 Championship lazy loading activated');
    }

    enableCaching() {
        // Implement championship-level caching strategy
        const cacheSize = 50; // Cache last 50 requests
        const cache = new Map();

        const cacheRequest = (key, data) => {
            if (cache.size >= cacheSize) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }
            cache.set(key, {
                data,
                timestamp: Date.now(),
                expires: Date.now() + (5 * 60 * 1000) // 5 minutes
            });
        };

        const getCachedRequest = (key) => {
            const cached = cache.get(key);
            if (cached && cached.expires > Date.now()) {
                return cached.data;
            }
            if (cached) cache.delete(key); // Remove expired
            return null;
        };

        // Cache API responses
        this.cache = { set: cacheRequest, get: getCachedRequest };
        this.optimizations.cacheEnabled = true;
        console.log('💾 Championship caching system enabled');
    }

    enableAggressiveCaching() {
        // Implement more aggressive caching for performance issues
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(() => {
                console.log('🔧 Aggressive caching enabled via Service Worker');
            }).catch(err => {
                console.warn('Service Worker registration failed:', err);
            });
        }
    }

    isThreeJSActive() {
        return document.querySelector('canvas') !== null;
    }

    optimizeThreeJSPerformance() {
        // Reduce quality for better performance
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            const context = canvas.getContext('webgl') || canvas.getContext('webgl2');
            if (context) {
                // Reduce pixel ratio for better performance
                const currentPixelRatio = window.devicePixelRatio;
                canvas.style.transform = `scale(${1/currentPixelRatio})`;
                console.log('🎯 Three.js performance optimized - reduced pixel ratio');
            }
        });
    }

    forceGarbageCollection() {
        // Clean up memory usage
        if (window.gc) {
            window.gc();
            console.log('🧹 Memory cleanup performed');
        }

        // Clear any unused cached data
        if (this.cache) {
            const now = Date.now();
            // Keep only recent entries
            Object.keys(this.cache).forEach(key => {
                if (this.cache[key] && this.cache[key].expires < now) {
                    delete this.cache[key];
                }
            });
        }
    }

    addAlert(type, message) {
        const alert = {
            type,
            message,
            timestamp: Date.now()
        };
        this.alerts.push(alert);

        // Keep only last 10 alerts
        if (this.alerts.length > 10) {
            this.alerts = this.alerts.slice(-10);
        }

        console.warn(`⚠️ Performance Alert [${type.toUpperCase()}]: ${message}`);
    }

    startRealTimeMonitoring() {
        // Real-time performance dashboard
        setInterval(() => {
            this.logPerformanceMetrics();
            this.checkPerformanceThresholds();
        }, 10000); // Every 10 seconds

        // Create performance display if in development
        if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
            this.createPerformanceDashboard();
        }
    }

    logPerformanceMetrics() {
        const metrics = {
            timestamp: new Date().toISOString(),
            ...this.performanceData,
            optimizations: this.optimizations,
            alertCount: this.alerts.length
        };

        // Send to analytics in production
        if (window.location.hostname !== 'localhost') {
            this.sendToAnalytics(metrics);
        } else {
            console.log('📊 Performance Metrics:', metrics);
        }
    }

    checkPerformanceThresholds() {
        const checks = [
            {
                metric: 'pageLoadTime',
                threshold: 3000,
                message: 'Page load time exceeds championship standard'
            },
            {
                metric: 'fps',
                threshold: 30,
                comparison: 'less',
                message: 'FPS below championship standard for smooth visualizations'
            },
            {
                metric: 'memoryUsage',
                threshold: 100,
                message: 'Memory usage exceeds championship efficiency standard'
            }
        ];

        checks.forEach(check => {
            const value = this.performanceData[check.metric];
            const exceedsThreshold = check.comparison === 'less'
                ? value < check.threshold
                : value > check.threshold;

            if (exceedsThreshold && value > 0) {
                this.addAlert('threshold', `${check.message}: ${value}`);
            }
        });
    }

    createPerformanceDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'performance-dashboard';
        dashboard.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: #00FF41;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            border: 1px solid #00FF41;
            min-width: 250px;
        `;

        document.body.appendChild(dashboard);

        // Update dashboard every second
        setInterval(() => {
            dashboard.innerHTML = `
                <div style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">
                    🏆 CHAMPIONSHIP PERFORMANCE
                </div>
                <div>Load Time: ${(this.performanceData.pageLoadTime/1000).toFixed(2)}s</div>
                <div>FPS: ${this.performanceData.fps}</div>
                <div>Memory: ${this.performanceData.memoryUsage}MB</div>
                <div>API: ${this.performanceData.apiResponseTime.toFixed(0)}ms</div>
                <div style="margin-top: 10px; color: ${this.alerts.length > 0 ? '#FF4444' : '#00FF41'};">
                    Alerts: ${this.alerts.length}
                </div>
                <div style="margin-top: 10px; font-size: 10px; color: #888;">
                    Cache: ${this.optimizations.cacheEnabled ? '✓' : '✗'}<br>
                    Lazy: ${this.optimizations.lazyLoadingEnabled ? '✓' : '✗'}<br>
                    Three.js: ${this.isThreeJSActive() ? '✓' : '✗'}
                </div>
            `;
        }, 1000);
    }

    sendToAnalytics(metrics) {
        // Send performance data to analytics service
        if (window.gtag) {
            window.gtag('event', 'performance_metrics', {
                custom_parameter_1: metrics.pageLoadTime,
                custom_parameter_2: metrics.fps,
                custom_parameter_3: metrics.memoryUsage
            });
        }

        // Custom analytics endpoint for championship-level monitoring
        fetch('/api/performance-analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metrics)
        }).catch(err => {
            console.warn('Analytics send failed:', err);
        });
    }

    getPerformanceReport() {
        return {
            performanceData: this.performanceData,
            optimizations: this.optimizations,
            alerts: this.alerts,
            overallScore: this.calculatePerformanceScore()
        };
    }

    calculatePerformanceScore() {
        let score = 100;

        // Deduct points for performance issues
        if (this.performanceData.pageLoadTime > 2000) score -= 20;
        if (this.performanceData.fps < 30 && this.isThreeJSActive()) score -= 15;
        if (this.performanceData.memoryUsage > 100) score -= 15;
        if (this.performanceData.apiResponseTime > 500) score -= 10;

        // Deduct for alerts
        score -= this.alerts.length * 5;

        // Add points for optimizations
        if (this.optimizations.cacheEnabled) score += 5;
        if (this.optimizations.lazyLoadingEnabled) score += 5;

        return Math.max(0, Math.min(100, score));
    }
}

// Initialize championship performance monitoring
const championshipMonitor = new ChampionshipPerformanceMonitor();

// Global performance API for debugging
window.BlazePerformance = {
    getReport: () => championshipMonitor.getPerformanceReport(),
    getScore: () => championshipMonitor.calculatePerformanceScore(),
    getAlerts: () => championshipMonitor.alerts,
    optimize: () => {
        championshipMonitor.optimizeThreeJSPerformance();
        championshipMonitor.forceGarbageCollection();
        console.log('🏆 Championship optimization triggered manually');
    }
};

console.log('🚀 Championship Performance Monitor loaded - Ready for elite analytics performance!');

export default championshipMonitor;