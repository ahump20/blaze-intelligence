/**
 * Blaze Intelligence Advanced Analytics Tracker
 * Comprehensive user behavior and performance analytics
 */

class BlazeAnalyticsTracker {
  constructor(config = {}) {
    this.config = {
      trackingId: config.trackingId || 'blaze-intelligence',
      apiEndpoint: config.apiEndpoint || '/api/analytics',
      sampleRate: config.sampleRate || 1.0,
      enableUserTracking: config.enableUserTracking !== false,
      enablePerformanceTracking: config.enablePerformanceTracking !== false,
      enableErrorTracking: config.enableErrorTracking !== false,
      enableBusinessMetrics: config.enableBusinessMetrics !== false,
      batchSize: config.batchSize || 10,
      flushInterval: config.flushInterval || 30000, // 30 seconds
      ...config
    };
    
    this.queue = [];
    this.session = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: 0,
      interactions: 0,
      errors: 0
    };
    
    this.user = {
      id: this.getUserId(),
      properties: {}
    };
    
    this.performance = {
      navigationStart: performance.timing.navigationStart,
      metrics: new Map()
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startPerformanceTracking();
    this.startBatchProcessor();
    this.trackPageView();
    
    // Track initial page load performance
    window.addEventListener('load', () => {
      this.trackPageLoadPerformance();
    });
  }

  // Event Tracking Methods
  trackEvent(eventName, properties = {}, context = {}) {
    if (!this.shouldTrack()) return;
    
    const event = {
      type: 'event',
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        session_id: this.session.id,
        user_id: this.user.id,
        page_url: window.location.href,
        page_title: document.title,
        user_agent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      context
    };
    
    this.enqueue(event);
  }

  trackPageView(properties = {}) {
    this.session.pageViews++;
    
    this.trackEvent('page_view', {
      ...properties,
      session_page_views: this.session.pageViews,
      referrer: document.referrer,
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash
    });
  }

  trackUserAction(action, element = null, properties = {}) {
    this.session.interactions++;
    
    const actionProperties = {
      action,
      session_interactions: this.session.interactions,
      ...properties
    };
    
    if (element) {
      actionProperties.element = {
        tag: element.tagName,
        id: element.id,
        className: element.className,
        text: element.textContent?.substring(0, 100),
        attributes: this.getElementAttributes(element)
      };
    }
    
    this.trackEvent('user_action', actionProperties);
  }

  // Performance Tracking
  trackPageLoadPerformance() {
    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0];
    
    const performanceMetrics = {
      // Core Web Vitals
      lcp: this.getLCP(),
      fid: this.getFID(),
      cls: this.getCLS(),
      
      // Navigation Timing
      dns_lookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcp_connection: timing.connectEnd - timing.connectStart,
      server_response: timing.responseStart - timing.requestStart,
      dom_loading: timing.domContentLoadedEventEnd - timing.domLoading,
      page_load: timing.loadEventEnd - timing.navigationStart,
      
      // Resource Timing
      first_byte: timing.responseStart - timing.navigationStart,
      first_paint: this.getFirstPaint(),
      first_contentful_paint: this.getFirstContentfulPaint(),
      
      // Navigation API
      redirect_count: navigation?.redirectCount || 0,
      connection_type: navigator.connection?.effectiveType,
      
      // Custom Metrics
      api_calls_during_load: this.performance.metrics.get('api_calls') || 0,
      errors_during_load: this.session.errors
    };
    
    this.trackEvent('page_performance', performanceMetrics);
  }

  trackAPICall(endpoint, method, duration, success, error = null) {
    const apiCallCount = this.performance.metrics.get('api_calls') || 0;
    this.performance.metrics.set('api_calls', apiCallCount + 1);
    
    this.trackEvent('api_call', {
      endpoint,
      method,
      duration,
      success,
      error: error?.message,
      total_api_calls: apiCallCount + 1
    });
  }

  trackError(error, context = {}) {
    this.session.errors++;
    
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      filename: error.filename,
      line: error.line,
      column: error.column,
      context,
      session_errors: this.session.errors
    });
  }

  // Business Metrics Tracking
  trackCardinalsInteraction(interactionType, data = {}) {
    this.trackEvent('cardinals_interaction', {
      interaction_type: interactionType,
      readiness_score: data.readiness_score,
      trend: data.trend,
      confidence: data.confidence,
      timestamp: Date.now()
    });
  }

  trackSportsDataView(sport, team, dataType) {
    this.trackEvent('sports_data_view', {
      sport,
      team,
      data_type: dataType,
      view_duration: Date.now() - this.session.startTime
    });
  }

  trackFeatureUsage(feature, action, properties = {}) {
    this.trackEvent('feature_usage', {
      feature,
      action,
      ...properties
    });
  }

  // Performance Metrics Helpers
  getLCP() {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }

  getFID() {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          resolve(entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });
    });
  }

  getCLS() {
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
    
    return clsValue;
  }

  getFirstPaint() {
    const paintTiming = performance.getEntriesByType('paint');
    const firstPaint = paintTiming.find(entry => entry.name === 'first-paint');
    return firstPaint?.startTime || null;
  }

  getFirstContentfulPaint() {
    const paintTiming = performance.getEntriesByType('paint');
    const fcp = paintTiming.find(entry => entry.name === 'first-contentful-paint');
    return fcp?.startTime || null;
  }

  // Event Listeners Setup
  setupEventListeners() {
    // Click tracking
    document.addEventListener('click', (event) => {
      this.trackUserAction('click', event.target, {
        x: event.clientX,
        y: event.clientY
      });
    });
    
    // Form interactions
    document.addEventListener('submit', (event) => {
      this.trackUserAction('form_submit', event.target);
    });
    
    // Scroll tracking
    let scrollDepth = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (currentScroll > scrollDepth && currentScroll % 25 === 0) {
        scrollDepth = currentScroll;
        this.trackUserAction('scroll', null, { depth: scrollDepth });
      }
    });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', {
        hidden: document.hidden,
        visibility_state: document.visibilityState
      });
    });
    
    // Error tracking
    window.addEventListener('error', (event) => {
      this.trackError(event.error, {
        source: 'window_error',
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason, {
        source: 'unhandled_promise_rejection'
      });
    });
    
    // Page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', {
        session_duration: Date.now() - this.session.startTime,
        total_page_views: this.session.pageViews,
        total_interactions: this.session.interactions,
        total_errors: this.session.errors
      });
      
      this.flush(true); // Send immediately
    });
  }

  // Performance Tracking
  startPerformanceTracking() {
    // Track resource loading
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('api/')) {
          this.trackEvent('resource_load', {
            name: entry.name,
            type: 'api',
            duration: entry.duration,
            size: entry.transferSize
          });
        }
      }
    }).observe({ entryTypes: ['resource'] });
    
    // Track long tasks
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.trackEvent('long_task', {
          duration: entry.duration,
          start_time: entry.startTime
        });
      }
    }).observe({ entryTypes: ['longtask'] });
  }

  // Queue Management
  enqueue(event) {
    if (this.queue.length >= 1000) {
      this.queue.shift(); // Remove oldest event if queue is full
    }
    
    this.queue.push(event);
    
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  startBatchProcessor() {
    setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  async flush(immediate = false) {
    if (this.queue.length === 0) return;
    
    const events = this.queue.splice(0, this.config.batchSize);
    
    const payload = {
      events,
      session: this.session,
      user: this.user,
      metadata: {
        sdk_version: '1.0.0',
        platform: 'web',
        timestamp: Date.now(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
    
    try {
      if (immediate && navigator.sendBeacon) {
        // Use sendBeacon for immediate sending during page unload
        navigator.sendBeacon(
          this.config.apiEndpoint,
          JSON.stringify(payload)
        );
      } else {
        await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch (error) {
      // Re-queue events if sending failed
      this.queue.unshift(...events);
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Utility Methods
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  getUserId() {
    let userId = localStorage.getItem('blaze_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('blaze_user_id', userId);
    }
    return userId;
  }

  shouldTrack() {
    return Math.random() < this.config.sampleRate;
  }

  getElementAttributes(element) {
    const attributes = {};
    for (const attr of element.attributes) {
      if (['id', 'class', 'href', 'src', 'data-track'].includes(attr.name)) {
        attributes[attr.name] = attr.value;
      }
    }
    return attributes;
  }

  // Public API Methods
  identify(userId, properties = {}) {
    this.user.id = userId;
    this.user.properties = { ...this.user.properties, ...properties };
    
    this.trackEvent('user_identify', {
      user_id: userId,
      properties
    });
  }

  setUserProperty(key, value) {
    this.user.properties[key] = value;
  }

  reset() {
    this.session = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: 0,
      interactions: 0,
      errors: 0
    };
    
    this.user = {
      id: this.generateSessionId(),
      properties: {}
    };
    
    localStorage.removeItem('blaze_user_id');
  }
}

// Auto-initialize analytics tracker
let analyticsTracker = null;

export function initializeAnalytics(config = {}) {
  if (!analyticsTracker) {
    analyticsTracker = new BlazeAnalyticsTracker(config);
  }
  return analyticsTracker;
}

export function getAnalyticsTracker() {
  if (!analyticsTracker) {
    analyticsTracker = new BlazeAnalyticsTracker();
  }
  return analyticsTracker;
}

// Browser/Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlazeAnalyticsTracker, initializeAnalytics, getAnalyticsTracker };
} else if (typeof window !== 'undefined') {
  window.BlazeAnalyticsTracker = BlazeAnalyticsTracker;
  window.initializeAnalytics = initializeAnalytics;
  window.getAnalyticsTracker = getAnalyticsTracker;
  
  // Auto-initialize with default config
  document.addEventListener('DOMContentLoaded', () => {
    initializeAnalytics({
      trackingId: 'blaze-intelligence-prod',
      sampleRate: 1.0 // Track all users in production
    });
  });
}