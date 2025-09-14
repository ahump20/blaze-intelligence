/**
 * Blaze Intelligence Analytics Monitor
 * Championship-level performance tracking and user analytics
 */

class BlazeAnalyticsMonitor {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        this.performanceMetrics = {
            pageLoadTime: 0,
            timeToInteractive: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0
        };

        this.init();
        console.log('🎯 Blaze Analytics Monitor initialized - Championship tracking active');
    }

    init() {
        this.setupPerformanceMonitoring();
        this.setupUserInteractionTracking();
        this.setupErrorTracking();
        this.setupConversionTracking();
        this.setupRealTimeAnalytics();

        // Track initial page load
        this.trackPageLoad();
    }

    /**
     * Setup performance monitoring using Web Vitals
     */
    setupPerformanceMonitoring() {
        // Track page load performance
        window.addEventListener('load', () => {
            const loadTime = Date.now() - this.startTime;
            this.performanceMetrics.pageLoadTime = loadTime;

            this.trackEvent('performance', {
                type: 'page_load',
                duration: loadTime,
                timestamp: new Date().toISOString()
            });

            // Get Web Vitals if available
            this.measureWebVitals();
        });

        // Track navigation timing
        if (window.performance && window.performance.getEntriesByType) {
            const navigation = window.performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.trackEvent('performance', {
                    type: 'navigation_timing',
                    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                    tcp: navigation.connectEnd - navigation.connectStart,
                    ttfb: navigation.responseStart - navigation.requestStart,
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
                    complete: navigation.loadEventEnd - navigation.navigationStart
                });
            }
        }

        // Monitor resource loading
        if (window.performance && window.performance.getEntriesByType) {
            window.addEventListener('load', () => {
                const resources = window.performance.getEntriesByType('resource');
                const slowResources = resources.filter(r => r.duration > 1000);

                if (slowResources.length > 0) {
                    this.trackEvent('performance', {
                        type: 'slow_resources',
                        count: slowResources.length,
                        resources: slowResources.map(r => ({
                            name: r.name,
                            duration: r.duration,
                            type: r.initiatorType
                        })).slice(0, 5)
                    });
                }
            });
        }
    }

    /**
     * Measure Web Vitals for championship performance
     */
    measureWebVitals() {
        // LCP - Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.performanceMetrics.largestContentfulPaint = lastEntry.startTime;

                    this.trackEvent('web_vital', {
                        name: 'LCP',
                        value: lastEntry.startTime,
                        rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor'
                    });
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observer not supported');
            }

            // CLS - Cumulative Layout Shift
            try {
                const clsObserver = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    list.getEntries().forEach((entry) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });

                    this.performanceMetrics.cumulativeLayoutShift = clsValue;

                    this.trackEvent('web_vital', {
                        name: 'CLS',
                        value: clsValue,
                        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
                    });
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS observer not supported');
            }

            // FID - First Input Delay
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        this.performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime;

                        this.trackEvent('web_vital', {
                            name: 'FID',
                            value: entry.processingStart - entry.startTime,
                            rating: entry.processingStart - entry.startTime < 100 ? 'good' :
                                   entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor'
                        });
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID observer not supported');
            }
        }
    }

    /**
     * Track user interactions
     */
    setupUserInteractionTracking() {
        // Track button clicks
        document.addEventListener('click', (event) => {
            const target = event.target;

            if (target.matches('button, .btn, .cta-button, a[href]')) {
                this.trackEvent('interaction', {
                    type: 'click',
                    element: target.tagName.toLowerCase(),
                    text: target.textContent?.trim().substring(0, 50) || '',
                    href: target.href || '',
                    className: target.className,
                    id: target.id,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Track form interactions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName === 'FORM') {
                this.trackEvent('form', {
                    type: 'submit',
                    formId: form.id,
                    action: form.action,
                    method: form.method,
                    fieldCount: form.elements.length,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Track scroll depth
        let maxScroll = 0;
        let scrollTimer = null;

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                const scrollPercent = Math.round(
                    (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                );

                if (scrollPercent > maxScroll && scrollPercent >= 25) {
                    maxScroll = Math.floor(scrollPercent / 25) * 25;

                    this.trackEvent('engagement', {
                        type: 'scroll_depth',
                        percent: maxScroll,
                        timestamp: new Date().toISOString()
                    });
                }
            }, 100);
        });

        // Track time milestones
        [30, 60, 120, 300, 600].forEach(seconds => {
            setTimeout(() => {
                this.trackEvent('engagement', {
                    type: 'time_on_page',
                    seconds: seconds,
                    timestamp: new Date().toISOString()
                });
            }, seconds * 1000);
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('engagement', {
                type: 'visibility_change',
                visible: !document.hidden,
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Track JavaScript errors and issues
     */
    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.trackEvent('error', {
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack?.substring(0, 500) || '',
                timestamp: new Date().toISOString()
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.trackEvent('error', {
                type: 'promise_rejection',
                reason: event.reason?.toString().substring(0, 200) || 'Unknown',
                timestamp: new Date().toISOString()
            });
        });

        // Track network errors
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    this.trackEvent('error', {
                        type: 'fetch_error',
                        url: args[0]?.toString().substring(0, 100) || '',
                        status: response.status,
                        statusText: response.statusText,
                        timestamp: new Date().toISOString()
                    });
                }
                return response;
            } catch (error) {
                this.trackEvent('error', {
                    type: 'fetch_failed',
                    url: args[0]?.toString().substring(0, 100) || '',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                throw error;
            }
        };
    }

    /**
     * Track conversion events and funnel progression
     */
    setupConversionTracking() {
        // Track pricing page visits
        if (window.location.pathname.includes('pricing')) {
            this.trackEvent('conversion', {
                type: 'pricing_view',
                timestamp: new Date().toISOString()
            });
        }

        // Track contact page visits
        if (window.location.pathname.includes('contact')) {
            this.trackEvent('conversion', {
                type: 'contact_view',
                timestamp: new Date().toISOString()
            });
        }

        // Track demo requests
        document.addEventListener('click', (event) => {
            const target = event.target;
            const text = target.textContent?.toLowerCase() || '';

            if (text.includes('demo') || text.includes('get started') || text.includes('try')) {
                this.trackEvent('conversion', {
                    type: 'demo_interest',
                    element: text.substring(0, 50),
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    /**
     * Setup real-time analytics dashboard
     */
    setupRealTimeAnalytics() {
        // Send analytics data periodically
        setInterval(() => {
            this.sendAnalytics();
        }, 30000); // Every 30 seconds

        // Send data before page unload
        window.addEventListener('beforeunload', () => {
            this.sendAnalytics(true);
        });

        // Send data when page becomes hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.sendAnalytics();
            }
        });
    }

    /**
     * Track a custom event
     */
    trackEvent(category, data) {
        const event = {
            id: this.generateEventId(),
            category,
            data,
            sessionId: this.sessionId,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            timeOnPage: Date.now() - this.startTime
        };

        this.events.push(event);

        // Log championship events
        if (category === 'conversion' || category === 'form') {
            console.log('🏆 Championship event tracked:', event);
        }

        // Limit event queue size
        if (this.events.length > 50) {
            this.events = this.events.slice(-30);
        }
    }

    /**
     * Track page load event
     */
    trackPageLoad() {
        this.trackEvent('page', {
            type: 'load',
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Send analytics data to server
     */
    async sendAnalytics(isUnload = false) {
        if (this.events.length === 0) return;

        const payload = {
            sessionId: this.sessionId,
            events: [...this.events],
            performance: { ...this.performanceMetrics },
            sessionDuration: Date.now() - this.startTime,
            timestamp: new Date().toISOString()
        };

        try {
            if (isUnload && navigator.sendBeacon) {
                // Use sendBeacon for reliable unload tracking
                navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
            } else {
                // Use fetch for regular analytics
                await fetch('/api/analytics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            }

            // Clear sent events
            this.events = [];

        } catch (error) {
            console.warn('Analytics send failed:', error);
        }
    }

    /**
     * Get current performance summary
     */
    getPerformanceSummary() {
        return {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            eventsTracked: this.events.length,
            performance: this.performanceMetrics,
            webVitalsScore: this.calculateWebVitalsScore()
        };
    }

    /**
     * Calculate Web Vitals score for championship performance
     */
    calculateWebVitalsScore() {
        let score = 0;
        let metrics = 0;

        // LCP scoring
        if (this.performanceMetrics.largestContentfulPaint) {
            const lcp = this.performanceMetrics.largestContentfulPaint;
            if (lcp < 2500) score += 100;
            else if (lcp < 4000) score += 60;
            else score += 20;
            metrics++;
        }

        // CLS scoring
        if (this.performanceMetrics.cumulativeLayoutShift >= 0) {
            const cls = this.performanceMetrics.cumulativeLayoutShift;
            if (cls < 0.1) score += 100;
            else if (cls < 0.25) score += 60;
            else score += 20;
            metrics++;
        }

        // FID scoring
        if (this.performanceMetrics.firstInputDelay) {
            const fid = this.performanceMetrics.firstInputDelay;
            if (fid < 100) score += 100;
            else if (fid < 300) score += 60;
            else score += 20;
            metrics++;
        }

        return metrics > 0 ? Math.round(score / metrics) : 0;
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'blaze_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    }

    /**
     * Generate unique event ID
     */
    generateEventId() {
        return 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    }

    /**
     * Public API for manual event tracking
     */
    track(eventName, properties = {}) {
        this.trackEvent('custom', {
            name: eventName,
            properties,
            timestamp: new Date().toISOString()
        });
    }
}

// Initialize analytics on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.blazeAnalytics = new BlazeAnalyticsMonitor();
});

// Export for external use
window.BlazeAnalyticsMonitor = BlazeAnalyticsMonitor;