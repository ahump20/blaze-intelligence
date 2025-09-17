/**
 * Blaze Intelligence Unified Platform Connector
 * ==============================================
 * Enables seamless navigation and data sharing between:
 * - Main Platform: https://blaze-intelligence.netlify.app
 * - Analytics Hub: https://blaze-intelligence-main.netlify.app
 * - 3D Universe: https://blaze-3d.netlify.app
 */

class UnifiedPlatformConnector {
    constructor() {
        // Platform URLs
        this.platforms = {
            main: 'https://blaze-intelligence.netlify.app',
            analytics: 'https://blaze-intelligence-main.netlify.app',
            universe3d: 'https://blaze-3d.netlify.app'
        };

        // Current platform detection
        this.currentPlatform = this.detectCurrentPlatform();

        // Shared state management
        this.sharedState = this.initializeSharedState();

        // Cross-domain messaging
        this.messageHandlers = new Map();
        this.setupCrossDomainMessaging();

        // Navigation state
        this.navigationHistory = [];
    }

    /**
     * Detect which platform we're currently on
     */
    detectCurrentPlatform() {
        const hostname = window.location.hostname;

        if (hostname.includes('blaze-3d')) {
            return 'universe3d';
        } else if (hostname.includes('blaze-intelligence-main')) {
            return 'analytics';
        } else {
            return 'main';
        }
    }

    /**
     * Initialize shared state from localStorage
     */
    initializeSharedState() {
        const stored = localStorage.getItem('blazeUnifiedState');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse shared state:', e);
            }
        }

        return {
            user: null,
            preferences: {
                theme: 'dark',
                autoplay3D: true,
                dataRefreshInterval: 30000
            },
            currentTeam: 'cardinals',
            lastVisitedPlatform: this.currentPlatform,
            sessionStartTime: Date.now()
        };
    }

    /**
     * Save shared state to localStorage
     */
    saveSharedState() {
        try {
            localStorage.setItem('blazeUnifiedState', JSON.stringify(this.sharedState));
        } catch (e) {
            console.error('Failed to save shared state:', e);
        }
    }

    /**
     * Setup cross-domain messaging
     */
    setupCrossDomainMessaging() {
        window.addEventListener('message', (event) => {
            // Verify origin
            const trustedOrigins = Object.values(this.platforms);
            if (!trustedOrigins.includes(event.origin)) {
                return;
            }

            const { type, data } = event.data;

            // Handle different message types
            switch (type) {
                case 'SYNC_STATE':
                    this.syncState(data);
                    break;
                case 'NAVIGATE':
                    this.handleNavigationRequest(data);
                    break;
                case 'DATA_REQUEST':
                    this.handleDataRequest(data, event.origin);
                    break;
                case 'ANALYTICS_EVENT':
                    this.trackCrossPlatformEvent(data);
                    break;
                default:
                    // Custom handlers
                    if (this.messageHandlers.has(type)) {
                        this.messageHandlers.get(type)(data, event.origin);
                    }
            }
        });
    }

    /**
     * Navigate to another platform
     */
    navigateToPlatform(platform, path = '/', params = {}) {
        if (!this.platforms[platform]) {
            console.error(`Unknown platform: ${platform}`);
            return;
        }

        // Save current state before navigation
        this.sharedState.lastVisitedPlatform = this.currentPlatform;
        this.saveSharedState();

        // Build URL with parameters
        const url = new URL(this.platforms[platform] + path);
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });

        // Add unified session token
        url.searchParams.set('unified_session', this.generateSessionToken());

        // Navigate
        window.location.href = url.toString();
    }

    /**
     * Open platform in new window/tab
     */
    openPlatformInNewWindow(platform, path = '/', params = {}) {
        if (!this.platforms[platform]) {
            console.error(`Unknown platform: ${platform}`);
            return null;
        }

        const url = new URL(this.platforms[platform] + path);
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });

        url.searchParams.set('unified_session', this.generateSessionToken());

        const newWindow = window.open(url.toString(), '_blank');

        // Setup communication with new window
        if (newWindow) {
            setTimeout(() => {
                this.sendMessageToPlatform(newWindow, 'SYNC_STATE', this.sharedState);
            }, 1000);
        }

        return newWindow;
    }

    /**
     * Send message to specific platform window
     */
    sendMessageToPlatform(targetWindow, type, data) {
        const message = {
            type,
            data,
            source: this.currentPlatform,
            timestamp: Date.now()
        };

        // Try all platform origins since we might not know which one
        Object.values(this.platforms).forEach(origin => {
            try {
                targetWindow.postMessage(message, origin);
            } catch (e) {
                // Silently fail for non-matching origins
            }
        });
    }

    /**
     * Broadcast message to all platforms
     */
    broadcastToAllPlatforms(type, data) {
        const message = {
            type,
            data,
            source: this.currentPlatform,
            timestamp: Date.now()
        };

        // Try to communicate with iframes if present
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            Object.values(this.platforms).forEach(origin => {
                try {
                    iframe.contentWindow.postMessage(message, origin);
                } catch (e) {
                    // Silently fail
                }
            });
        });

        // Also try parent window if we're in an iframe
        if (window.parent && window.parent !== window) {
            Object.values(this.platforms).forEach(origin => {
                try {
                    window.parent.postMessage(message, origin);
                } catch (e) {
                    // Silently fail
                }
            });
        }
    }

    /**
     * Sync state across platforms
     */
    syncState(newState) {
        // Merge with existing state
        this.sharedState = {
            ...this.sharedState,
            ...newState,
            lastSyncTime: Date.now()
        };

        this.saveSharedState();

        // Trigger state change event
        window.dispatchEvent(new CustomEvent('blazeStateSync', {
            detail: this.sharedState
        }));
    }

    /**
     * Handle navigation requests from other platforms
     */
    handleNavigationRequest(data) {
        const { path, params } = data;

        // Build URL
        const url = new URL(window.location.origin + path);
        if (params) {
            Object.keys(params).forEach(key => {
                url.searchParams.set(key, params[key]);
            });
        }

        // Navigate
        window.location.href = url.toString();
    }

    /**
     * Handle data requests from other platforms
     */
    async handleDataRequest(data, origin) {
        const { requestId, dataType, params } = data;

        try {
            let responseData = null;

            // Handle different data types
            switch (dataType) {
                case 'SPORTS_DATA':
                    responseData = await this.fetchSportsData(params);
                    break;
                case 'USER_PREFERENCES':
                    responseData = this.sharedState.preferences;
                    break;
                case 'ANALYTICS':
                    responseData = await this.fetchAnalytics(params);
                    break;
                default:
                    throw new Error(`Unknown data type: ${dataType}`);
            }

            // Send response back
            this.sendMessageToOrigin(origin, 'DATA_RESPONSE', {
                requestId,
                data: responseData,
                success: true
            });
        } catch (error) {
            this.sendMessageToOrigin(origin, 'DATA_RESPONSE', {
                requestId,
                error: error.message,
                success: false
            });
        }
    }

    /**
     * Send message to specific origin
     */
    sendMessageToOrigin(origin, type, data) {
        window.parent.postMessage({
            type,
            data,
            source: this.currentPlatform,
            timestamp: Date.now()
        }, origin);
    }

    /**
     * Track cross-platform analytics events
     */
    trackCrossPlatformEvent(data) {
        const event = {
            ...data,
            platform: this.currentPlatform,
            sessionId: this.generateSessionToken(),
            timestamp: Date.now()
        };

        // Store locally
        const events = JSON.parse(localStorage.getItem('blazeAnalyticsEvents') || '[]');
        events.push(event);

        // Keep only last 100 events
        if (events.length > 100) {
            events.shift();
        }

        localStorage.setItem('blazeAnalyticsEvents', JSON.stringify(events));

        // Trigger analytics event
        window.dispatchEvent(new CustomEvent('blazeAnalytics', {
            detail: event
        }));
    }

    /**
     * Generate session token for cross-platform tracking
     */
    generateSessionToken() {
        const sessionKey = 'blazeUnifiedSession';
        let token = sessionStorage.getItem(sessionKey);

        if (!token) {
            token = `bus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem(sessionKey, token);
        }

        return token;
    }

    /**
     * Fetch sports data (stub - implement based on your APIs)
     */
    async fetchSportsData(params) {
        // This would connect to your actual sports data APIs
        return {
            team: params.team || 'cardinals',
            stats: {},
            lastUpdated: Date.now()
        };
    }

    /**
     * Fetch analytics (stub - implement based on your analytics)
     */
    async fetchAnalytics(params) {
        return {
            pageViews: 0,
            events: [],
            conversions: 0
        };
    }

    /**
     * Register custom message handler
     */
    registerMessageHandler(type, handler) {
        this.messageHandlers.set(type, handler);
    }

    /**
     * Create unified navigation menu
     */
    createUnifiedNavigation() {
        const nav = document.createElement('div');
        nav.className = 'blaze-unified-nav';
        nav.innerHTML = `
            <style>
                .blaze-unified-nav {
                    position: fixed;
                    top: 0;
                    right: 20px;
                    z-index: 9999;
                    background: rgba(10, 14, 39, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(191, 87, 0, 0.3);
                    border-radius: 0 0 12px 12px;
                    padding: 10px;
                    display: flex;
                    gap: 10px;
                    font-family: 'Inter', sans-serif;
                }

                .blaze-platform-link {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 8px 15px;
                    background: rgba(191, 87, 0, 0.1);
                    border: 1px solid rgba(191, 87, 0, 0.3);
                    border-radius: 8px;
                    color: #fff;
                    text-decoration: none;
                    transition: all 0.3s;
                    cursor: pointer;
                    font-size: 14px;
                }

                .blaze-platform-link:hover {
                    background: rgba(191, 87, 0, 0.3);
                    border-color: #BF5700;
                    transform: translateY(-2px);
                }

                .blaze-platform-link.active {
                    background: #BF5700;
                    border-color: #BF5700;
                }

                .platform-icon {
                    width: 20px;
                    height: 20px;
                }
            </style>
            <a class="blaze-platform-link ${this.currentPlatform === 'main' ? 'active' : ''}"
               onclick="blazeUnified.navigateToPlatform('main')">
                <span class="platform-icon">🏆</span>
                Main Platform
            </a>
            <a class="blaze-platform-link ${this.currentPlatform === 'analytics' ? 'active' : ''}"
               onclick="blazeUnified.navigateToPlatform('analytics')">
                <span class="platform-icon">📊</span>
                Analytics Hub
            </a>
            <a class="blaze-platform-link ${this.currentPlatform === 'universe3d' ? 'active' : ''}"
               onclick="blazeUnified.navigateToPlatform('universe3d')">
                <span class="platform-icon">🌌</span>
                3D Universe
            </a>
        `;

        return nav;
    }

    /**
     * Initialize unified platform features
     */
    initialize() {
        // Add unified navigation if enabled
        if (this.sharedState.preferences.showUnifiedNav !== false) {
            const nav = this.createUnifiedNavigation();
            document.body.appendChild(nav);
        }

        // Track page view
        this.trackCrossPlatformEvent({
            type: 'pageview',
            page: window.location.pathname,
            referrer: document.referrer
        });

        // Check for unified session parameter
        const urlParams = new URLSearchParams(window.location.search);
        const unifiedSession = urlParams.get('unified_session');
        if (unifiedSession) {
            sessionStorage.setItem('blazeUnifiedSession', unifiedSession);
        }

        // Broadcast platform ready
        this.broadcastToAllPlatforms('PLATFORM_READY', {
            platform: this.currentPlatform,
            features: this.getAvailableFeatures()
        });

        console.log(`Blaze Unified Platform Connector initialized on ${this.currentPlatform}`);
    }

    /**
     * Get available features for current platform
     */
    getAvailableFeatures() {
        const features = {
            main: ['dashboard', 'sports-data', 'nil-calculator', 'video-upload'],
            analytics: ['real-time-data', 'advanced-charts', 'reports', 'predictions'],
            universe3d: ['3d-visualization', 'babylon-engine', 'ray-tracing', 'vr-ready']
        };

        return features[this.currentPlatform] || [];
    }
}

// Initialize global instance
window.blazeUnified = new UnifiedPlatformConnector();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.blazeUnified.initialize();
    });
} else {
    window.blazeUnified.initialize();
}

// Export for module usage
export default UnifiedPlatformConnector;