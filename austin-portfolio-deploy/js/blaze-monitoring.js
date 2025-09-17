/**
 * BLAZE INTELLIGENCE - Monitoring & Observability System
 * October 2025 Refresh
 *
 * Tracks performance, errors, and user interactions
 */

class BlazeMonitoring {
    constructor(config = {}) {
        this.config = {
            enabled: config.enabled !== false,
            endpoint: config.endpoint || '/api/metrics',
            bufferSize: config.bufferSize || 50,
            flushInterval: config.flushInterval || 30000, // 30 seconds
            sessionId: this.generateSessionId(),
            userId: config.userId || 'anonymous',
            environment: config.environment || 'production',
            ...config
        };

        this.metrics = [];
        this.timers = new Map();
        this.observers = new Map();

        if (this.config.enabled) {
            this.initialize();
        }
    }

    /**
     * Initialize monitoring systems
     */
    initialize() {
        // Performance monitoring
        this.initPerformanceObserver();

        // Error tracking
        this.initErrorTracking();

        // User interaction tracking
        this.initInteractionTracking();

        // Network monitoring
        this.initNetworkMonitoring();

        // Visibility tracking
        this.initVisibilityTracking();

        // Schedule periodic flush
        this.startFlushInterval();

        // Flush on page unload
        this.initUnloadHandler();

        console.log('🔍 Blaze Monitoring initialized', {
            sessionId: this.config.sessionId,
            environment: this.config.environment
        });
    }

    /**
     * Performance Observer for Core Web Vitals
     */
    initPerformanceObserver() {
        if (!window.PerformanceObserver) return;

        // Largest Contentful Paint (LCP)
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.track('performance.lcp', {
                    value: lastEntry.renderTime || lastEntry.loadTime,
                    element: lastEntry.element?.tagName
                });
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', lcpObserver);
        } catch (e) {
            console.warn('LCP observer not supported');
        }

        // First Input Delay (FID)
        try {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.track('performance.fid', {
                        value: entry.processingStart - entry.startTime,
                        eventType: entry.name
                    });
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
            this.observers.set('fid', fidObserver);
        } catch (e) {
            console.warn('FID observer not supported');
        }

        // Cumulative Layout Shift (CLS)
        try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.track('performance.cls', {
                            value: clsValue,
                            sources: entry.sources?.length || 0
                        });
                    }
                });
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', clsObserver);
        } catch (e) {
            console.warn('CLS observer not supported');
        }

        // Time to First Byte (TTFB)
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const ttfb = timing.responseStart - timing.navigationStart;
            this.track('performance.ttfb', { value: ttfb });
        }

        // Page Load Time
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.track('performance.load', { value: loadTime });

            // Navigation timing
            if (window.performance && window.performance.getEntriesByType) {
                const navEntries = window.performance.getEntriesByType('navigation');
                if (navEntries.length > 0) {
                    const nav = navEntries[0];
                    this.track('performance.navigation', {
                        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
                        domComplete: nav.domComplete,
                        loadComplete: nav.loadEventEnd - nav.loadEventStart
                    });
                }
            }
        });
    }

    /**
     * Error tracking
     */
    initErrorTracking() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.track('error.javascript', {
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
        });

        // Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.track('error.promise', {
                reason: event.reason?.toString(),
                promise: event.promise
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.track('error.resource', {
                    type: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: 'Resource failed to load'
                });
            }
        }, true);
    }

    /**
     * User interaction tracking
     */
    initInteractionTracking() {
        // Click tracking
        document.addEventListener('click', (event) => {
            const target = event.target;
            const selector = this.getElementSelector(target);

            this.track('interaction.click', {
                selector,
                text: target.textContent?.slice(0, 50),
                href: target.href,
                timestamp: Date.now()
            });
        });

        // Form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            this.track('interaction.form_submit', {
                formId: form.id,
                formName: form.name,
                action: form.action,
                method: form.method
            });
        });

        // Scroll depth tracking
        let maxScroll = 0;
        let scrollTimer = null;

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                const scrollPercent = Math.round(
                    (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                );

                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                    this.track('interaction.scroll', {
                        depth: scrollPercent,
                        pageHeight: document.documentElement.scrollHeight
                    });
                }
            }, 500);
        });
    }

    /**
     * Network monitoring
     */
    initNetworkMonitoring() {
        // Monitor fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const [resource, config] = args;

            try {
                const response = await originalFetch(...args);
                const duration = performance.now() - startTime;

                this.track('network.fetch', {
                    url: typeof resource === 'string' ? resource : resource.url,
                    method: config?.method || 'GET',
                    status: response.status,
                    duration,
                    ok: response.ok
                });

                return response;
            } catch (error) {
                const duration = performance.now() - startTime;

                this.track('network.fetch_error', {
                    url: typeof resource === 'string' ? resource : resource.url,
                    method: config?.method || 'GET',
                    error: error.message,
                    duration
                });

                throw error;
            }
        };

        // Monitor XHR requests
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._blazeMonitoring = { method, url, startTime: null };
            return originalXHROpen.apply(this, [method, url, ...rest]);
        };

        XMLHttpRequest.prototype.send = function(...args) {
            if (this._blazeMonitoring) {
                this._blazeMonitoring.startTime = performance.now();

                this.addEventListener('loadend', () => {
                    const duration = performance.now() - this._blazeMonitoring.startTime;

                    window.blazeMonitoring?.track('network.xhr', {
                        url: this._blazeMonitoring.url,
                        method: this._blazeMonitoring.method,
                        status: this.status,
                        duration
                    });
                });
            }

            return originalXHRSend.apply(this, args);
        };
    }

    /**
     * Page visibility tracking
     */
    initVisibilityTracking() {
        let hiddenTime = null;

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                hiddenTime = Date.now();
            } else if (hiddenTime) {
                const hiddenDuration = Date.now() - hiddenTime;
                this.track('visibility.hidden', {
                    duration: hiddenDuration
                });
                hiddenTime = null;
            }
        });
    }

    /**
     * Track a metric
     */
    track(name, data = {}) {
        if (!this.config.enabled) return;

        const metric = {
            name,
            data,
            timestamp: Date.now(),
            sessionId: this.config.sessionId,
            userId: this.config.userId,
            environment: this.config.environment,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.metrics.push(metric);

        // Flush if buffer is full
        if (this.metrics.length >= this.config.bufferSize) {
            this.flush();
        }
    }

    /**
     * Start a timer
     */
    startTimer(name) {
        this.timers.set(name, performance.now());
    }

    /**
     * End a timer and track the duration
     */
    endTimer(name, metadata = {}) {
        const startTime = this.timers.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.timers.delete(name);

            this.track(`timer.${name}`, {
                duration,
                ...metadata
            });

            return duration;
        }
        return null;
    }

    /**
     * Flush metrics to server
     */
    async flush() {
        if (!this.config.enabled || this.metrics.length === 0) return;

        const metricsToSend = [...this.metrics];
        this.metrics = [];

        try {
            // Use sendBeacon if available for reliability
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(metricsToSend)], {
                    type: 'application/json'
                });
                navigator.sendBeacon(this.config.endpoint, blob);
            } else {
                // Fallback to fetch
                await fetch(this.config.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(metricsToSend)
                });
            }

            console.log(`📊 Flushed ${metricsToSend.length} metrics`);
        } catch (error) {
            console.error('Failed to send metrics:', error);
            // Re-add metrics to buffer
            this.metrics = [...metricsToSend, ...this.metrics];
        }
    }

    /**
     * Start periodic flush
     */
    startFlushInterval() {
        this.flushInterval = setInterval(() => {
            this.flush();
        }, this.config.flushInterval);
    }

    /**
     * Handle page unload
     */
    initUnloadHandler() {
        // Try to flush on page unload
        window.addEventListener('beforeunload', () => {
            this.flush();
        });

        // Also try on pagehide (more reliable on mobile)
        window.addEventListener('pagehide', () => {
            this.flush();
        });
    }

    /**
     * Get element selector for tracking
     */
    getElementSelector(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) return `.${element.className.split(' ')[0]}`;
        return element.tagName.toLowerCase();
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get current metrics summary
     */
    getSummary() {
        return {
            sessionId: this.config.sessionId,
            metricsCount: this.metrics.length,
            environment: this.config.environment,
            uptime: Date.now() - parseInt(this.config.sessionId.split('-')[0])
        };
    }

    /**
     * Destroy monitoring
     */
    destroy() {
        // Clear interval
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }

        // Disconnect observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Final flush
        this.flush();

        console.log('🔍 Blaze Monitoring destroyed');
    }
}

// Auto-initialize if not in test environment
if (typeof window !== 'undefined' && !window.blazeMonitoring) {
    window.blazeMonitoring = new BlazeMonitoring({
        enabled: true,
        environment: window.location.hostname === 'localhost' ? 'development' : 'production'
    });
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeMonitoring;
}