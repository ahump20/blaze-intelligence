/**
 * Blaze Intelligence - Performance Analytics Tracker
 * Comprehensive performance monitoring with error logging and user interaction tracking
 * Real-time dashboard for performance metrics
 */

class BlazeAnalyticsTracker {
    constructor(options = {}) {
        this.config = {
            endpoint: options.endpoint || this.getAnalyticsEndpoint(),
            batchSize: options.batchSize || 50,
            flushInterval: options.flushInterval || 30000, // 30 seconds
            sessionTimeout: options.sessionTimeout || 30 * 60 * 1000, // 30 minutes
            sampleRate: options.sampleRate || 1.0, // 100% sampling
            enableRealUserMetrics: options.enableRealUserMetrics !== false,
            enableErrorTracking: options.enableErrorTracking !== false,
            enableInteractionTracking: options.enableInteractionTracking !== false,
            ...options
        };

        this.state = {
            sessionId: this.generateSessionId(),
            userId: null,
            pageLoadTime: null,
            navigationStart: performance.timing?.navigationStart || Date.now(),
            events: [],
            errors: [],
            metrics: new Map(),
            isInitialized: false
        };

        this.observers = {
            performance: null,
            intersection: null,
            mutation: null
        };

        this.timers = {
            flush: null,
            vitals: null
        };

        this.init();
    }

    async init() {
        try {
            console.log('📊 Initializing Blaze Intelligence Analytics Tracker...');

            // Initialize core systems
            this.initializeSession();
            this.setupPerformanceObserver();
            this.setupErrorHandling();
            this.setupInteractionTracking();
            this.setupRealUserMetrics();
            this.startFlushTimer();

            // Track initial page load
            this.trackPageLoad();

            this.state.isInitialized = true;
            console.log('✅ Analytics Tracker initialized successfully');

            // Send initialization event
            this.track('analytics_initialized', {
                timestamp: Date.now(),
                sessionId: this.state.sessionId,
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            });

        } catch (error) {
            console.error('❌ Failed to initialize Analytics Tracker:', error);
        }
    }

    getAnalyticsEndpoint() {
        const hostname = window.location.hostname;

        if (hostname.includes('netlify.app') || hostname.includes('blaze-intelligence')) {
            return 'https://blaze-analytics.herokuapp.com/api/events';
        }

        return '/api/analytics'; // Local development
    }

    initializeSession() {
        // Set user ID if authenticated
        if (window.blazeAuth?.isAuthenticated()) {
            this.state.userId = window.blazeAuth.getUser()?.id;
        }

        // Track session start
        this.track('session_start', {
            sessionId: this.state.sessionId,
            timestamp: Date.now(),
            referrer: document.referrer,
            url: window.location.href
        });
    }

    setupPerformanceObserver() {
        if (!this.config.enableRealUserMetrics || !window.PerformanceObserver) {
            return;
        }

        try {
            // Navigation timing
            this.observers.performance = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.processPerformanceEntry(entry);
                }
            });

            this.observers.performance.observe({
                entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
            });

        } catch (error) {
            console.warn('⚠️ Performance Observer not fully supported:', error);
        }
    }

    processPerformanceEntry(entry) {
        switch (entry.entryType) {
            case 'navigation':
                this.recordNavigationMetrics(entry);
                break;

            case 'paint':
                this.recordPaintMetrics(entry);
                break;

            case 'largest-contentful-paint':
                this.recordLCPMetric(entry);
                break;

            case 'first-input':
                this.recordFIDMetric(entry);
                break;

            case 'layout-shift':
                this.recordCLSMetric(entry);
                break;

            case 'resource':
                this.recordResourceMetrics(entry);
                break;
        }
    }

    recordNavigationMetrics(entry) {
        const metrics = {
            dns_lookup: entry.domainLookupEnd - entry.domainLookupStart,
            tcp_connect: entry.connectEnd - entry.connectStart,
            ssl_negotiate: entry.connectEnd - entry.secureConnectionStart,
            ttfb: entry.responseStart - entry.requestStart,
            dom_load: entry.domContentLoadedEventEnd - entry.navigationStart,
            page_load: entry.loadEventEnd - entry.navigationStart,
            redirect_time: entry.redirectEnd - entry.redirectStart,
            unload_time: entry.unloadEventEnd - entry.unloadEventStart
        };

        this.state.pageLoadTime = metrics.page_load;

        this.track('navigation_timing', {
            metrics,
            url: entry.name,
            timestamp: Date.now()
        });
    }

    recordPaintMetrics(entry) {
        this.track('paint_timing', {
            type: entry.name,
            value: entry.startTime,
            timestamp: Date.now()
        });
    }

    recordLCPMetric(entry) {
        this.track('largest_contentful_paint', {
            value: entry.startTime,
            element: entry.element?.tagName || 'unknown',
            timestamp: Date.now()
        });
    }

    recordFIDMetric(entry) {
        this.track('first_input_delay', {
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now()
        });
    }

    recordCLSMetric(entry) {
        if (!entry.hadRecentInput) {
            this.track('cumulative_layout_shift', {
                value: entry.value,
                timestamp: Date.now()
            });
        }
    }

    recordResourceMetrics(entry) {
        // Only track significant resources
        if (entry.transferSize > 10000) { // > 10KB
            this.track('resource_timing', {
                name: entry.name,
                type: this.getResourceType(entry),
                size: entry.transferSize,
                duration: entry.duration,
                timestamp: Date.now()
            });
        }
    }

    getResourceType(entry) {
        const name = entry.name.toLowerCase();
        if (name.includes('.js')) return 'script';
        if (name.includes('.css')) return 'stylesheet';
        if (name.includes('.png') || name.includes('.jpg') || name.includes('.jpeg') || name.includes('.gif') || name.includes('.webp')) return 'image';
        if (name.includes('.woff') || name.includes('.ttf')) return 'font';
        return 'other';
    }

    setupErrorHandling() {
        if (!this.config.enableErrorTracking) return;

        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.recordError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        // Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError({
                type: 'promise_rejection',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });

        // Resource loading errors
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.recordError({
                    type: 'resource',
                    message: `Failed to load ${event.target.tagName}: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    recordError(errorData) {
        this.state.errors.push(errorData);

        this.track('error', {
            ...errorData,
            sessionId: this.state.sessionId,
            url: window.location.href,
            userAgent: navigator.userAgent
        });

        console.error('🚨 Tracked error:', errorData);
    }

    setupInteractionTracking() {
        if (!this.config.enableInteractionTracking) return;

        // Click tracking
        document.addEventListener('click', (event) => {
            this.trackInteraction('click', event);
        });

        // Form submissions
        document.addEventListener('submit', (event) => {
            this.trackInteraction('form_submit', event);
        });

        // Input focus/blur
        document.addEventListener('focus', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                this.trackInteraction('input_focus', event);
            }
        }, true);

        // Scroll depth tracking
        this.setupScrollDepthTracking();
    }

    trackInteraction(type, event) {
        const element = event.target;
        const interactionData = {
            type,
            element_tag: element.tagName.toLowerCase(),
            element_id: element.id,
            element_class: element.className,
            element_text: element.textContent?.substring(0, 100),
            page_url: window.location.href,
            timestamp: Date.now()
        };

        // Add specific data based on interaction type
        if (type === 'click') {
            interactionData.button = event.button;
            interactionData.x = event.clientX;
            interactionData.y = event.clientY;
        }

        this.track('interaction', interactionData);
    }

    setupScrollDepthTracking() {
        let maxScrollDepth = 0;
        const scrollDepthMarkers = [25, 50, 75, 100];
        const trackedMarkers = new Set();

        const trackScrollDepth = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;

                // Track milestone markers
                scrollDepthMarkers.forEach(marker => {
                    if (scrollPercent >= marker && !trackedMarkers.has(marker)) {
                        trackedMarkers.add(marker);
                        this.track('scroll_depth', {
                            depth: marker,
                            timestamp: Date.now()
                        });
                    }
                });
            }
        };

        // Throttled scroll tracking
        let scrollTimer = null;
        window.addEventListener('scroll', () => {
            if (scrollTimer) clearTimeout(scrollTimer);
            scrollTimer = setTimeout(trackScrollDepth, 100);
        });
    }

    setupRealUserMetrics() {
        if (!this.config.enableRealUserMetrics) return;

        // Core Web Vitals tracking
        this.trackWebVitals();

        // API latency tracking
        this.setupAPILatencyTracking();

        // Memory usage tracking
        this.setupMemoryTracking();
    }

    trackWebVitals() {
        // Use web-vitals library if available, otherwise implement basic tracking
        if (window.webVitals) {
            window.webVitals.getLCP(metric => this.recordWebVital('LCP', metric));
            window.webVitals.getFID(metric => this.recordWebVital('FID', metric));
            window.webVitals.getCLS(metric => this.recordWebVital('CLS', metric));
            window.webVitals.getFCP(metric => this.recordWebVital('FCP', metric));
            window.webVitals.getTTFB(metric => this.recordWebVital('TTFB', metric));
        }
    }

    recordWebVital(name, metric) {
        this.track('web_vital', {
            name,
            value: metric.value,
            delta: metric.delta,
            id: metric.id,
            timestamp: Date.now()
        });
    }

    setupAPILatencyTracking() {
        // Monkey patch fetch to track API calls
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const url = args[0];

            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();

                this.track('api_call', {
                    url: url.toString(),
                    method: args[1]?.method || 'GET',
                    status: response.status,
                    duration: endTime - startTime,
                    success: response.ok,
                    timestamp: Date.now()
                });

                return response;

            } catch (error) {
                const endTime = performance.now();

                this.track('api_call', {
                    url: url.toString(),
                    method: args[1]?.method || 'GET',
                    duration: endTime - startTime,
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });

                throw error;
            }
        };
    }

    setupMemoryTracking() {
        if (!performance.memory) return;

        setInterval(() => {
            this.track('memory_usage', {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            });
        }, 60000); // Every minute
    }

    // Core tracking methods
    track(eventName, properties = {}) {
        if (Math.random() > this.config.sampleRate) {
            return; // Skip based on sample rate
        }

        const event = {
            event: eventName,
            properties: {
                ...properties,
                session_id: this.state.sessionId,
                user_id: this.state.userId,
                url: window.location.href,
                timestamp: Date.now()
            }
        };

        this.state.events.push(event);

        // Flush if batch is full
        if (this.state.events.length >= this.config.batchSize) {
            this.flush();
        }
    }

    trackPageView(page = window.location.pathname) {
        this.track('page_view', {
            page,
            title: document.title,
            referrer: document.referrer,
            timestamp: Date.now()
        });
    }

    trackPageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();

            this.track('page_load_complete', {
                load_time: loadTime,
                page_url: window.location.href,
                timestamp: Date.now()
            });
        });
    }

    trackCustomEvent(eventName, properties = {}) {
        this.track(`custom_${eventName}`, properties);
    }

    // Business-specific tracking methods
    trackSportsDataUpdate(sport, updateType) {
        this.track('sports_data_update', {
            sport,
            update_type: updateType,
            timestamp: Date.now()
        });
    }

    trackFeatureUsage(featureName, action = 'used') {
        this.track('feature_usage', {
            feature: featureName,
            action,
            user_tier: window.blazeAuth?.getUserTier() || 'free',
            timestamp: Date.now()
        });
    }

    trackDashboardInteraction(widget, action) {
        this.track('dashboard_interaction', {
            widget,
            action,
            timestamp: Date.now()
        });
    }

    // Data management
    async flush() {
        if (this.state.events.length === 0) return;

        const events = [...this.state.events];
        this.state.events = [];

        try {
            await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events,
                    session_id: this.state.sessionId,
                    timestamp: Date.now()
                })
            });

            console.log(`📊 Flushed ${events.length} analytics events`);

        } catch (error) {
            console.error('❌ Failed to flush analytics events:', error);
            // Re-add events to queue for retry
            this.state.events.unshift(...events);
        }
    }

    startFlushTimer() {
        this.timers.flush = setInterval(() => {
            this.flush();
        }, this.config.flushInterval);
    }

    // Dashboard and reporting
    getDashboardMetrics() {
        const now = Date.now();
        const sessionDuration = now - this.state.navigationStart;

        return {
            session: {
                id: this.state.sessionId,
                duration: sessionDuration,
                page_views: this.state.events.filter(e => e.event === 'page_view').length,
                interactions: this.state.events.filter(e => e.event === 'interaction').length,
                errors: this.state.errors.length
            },
            performance: {
                page_load_time: this.state.pageLoadTime,
                api_calls: this.state.events.filter(e => e.event === 'api_call').length,
                avg_api_latency: this.calculateAverageAPILatency(),
                memory_usage: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize
                } : null
            },
            real_time: {
                events_queued: this.state.events.length,
                last_flush: this.getLastFlushTime(),
                sampling_rate: this.config.sampleRate
            }
        };
    }

    calculateAverageAPILatency() {
        const apiCalls = this.state.events.filter(e => e.event === 'api_call');
        if (apiCalls.length === 0) return 0;

        const totalLatency = apiCalls.reduce((sum, call) => sum + (call.properties.duration || 0), 0);
        return totalLatency / apiCalls.length;
    }

    getLastFlushTime() {
        // This would be set when flush completes
        return this.lastFlushTime || null;
    }

    // Utility methods
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    setUserId(userId) {
        this.state.userId = userId;
        this.track('user_identified', { user_id: userId });
    }

    // Public API for dashboard integration
    createPerformanceDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const metrics = this.getDashboardMetrics();

        container.innerHTML = `
            <div class="blaze-performance-dashboard">
                <div class="dashboard-header">
                    <h3>Performance Metrics</h3>
                    <span class="last-updated">Last updated: ${new Date().toLocaleTimeString()}</span>
                </div>

                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-label">Page Load Time</div>
                        <div class="metric-value">${(metrics.performance.page_load_time || 0).toFixed(0)}ms</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">API Calls</div>
                        <div class="metric-value">${metrics.performance.api_calls}</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">Avg API Latency</div>
                        <div class="metric-value">${metrics.performance.avg_api_latency.toFixed(0)}ms</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">Session Duration</div>
                        <div class="metric-value">${Math.floor(metrics.session.duration / 1000)}s</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">Interactions</div>
                        <div class="metric-value">${metrics.session.interactions}</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">Errors</div>
                        <div class="metric-value ${metrics.session.errors > 0 ? 'error' : ''}">${metrics.session.errors}</div>
                    </div>
                </div>

                <div class="events-queue">
                    <span>Events Queued: ${metrics.real_time.events_queued}</span>
                    <span>Sampling: ${(metrics.real_time.sampling_rate * 100).toFixed(0)}%</span>
                </div>
            </div>
        `;

        // Auto-refresh dashboard
        setTimeout(() => {
            this.createPerformanceDashboard(containerId);
        }, 5000);
    }

    // Cleanup
    destroy() {
        // Clear timers
        Object.values(this.timers).forEach(timer => {
            if (timer) clearInterval(timer);
        });

        // Disconnect observers
        Object.values(this.observers).forEach(observer => {
            if (observer) observer.disconnect();
        });

        // Final flush
        this.flush();
    }
}

// Global instance
window.BlazeAnalyticsTracker = BlazeAnalyticsTracker;

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.blazeAnalytics = new BlazeAnalyticsTracker();

    // Expose for dashboard integration
    window.getPerformanceMetrics = () => window.blazeAnalytics.getDashboardMetrics();
    window.trackCustomEvent = (event, props) => window.blazeAnalytics.trackCustomEvent(event, props);
    window.trackFeatureUsage = (feature, action) => window.blazeAnalytics.trackFeatureUsage(feature, action);

    // Auto-track page visibility
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            window.blazeAnalytics.flush();
        }
    });

    // Auto-flush before page unload
    window.addEventListener('beforeunload', () => {
        window.blazeAnalytics.flush();
    });
}

export default BlazeAnalyticsTracker;