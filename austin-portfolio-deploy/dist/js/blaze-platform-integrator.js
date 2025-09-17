/**
 * Blaze Intelligence - Platform Integrator
 * Orchestrates all platform components for seamless operation
 * Connects live sports data, WebSocket, auth, and analytics
 */

class BlazePlatformIntegrator {
    constructor() {
        this.components = {
            sportsConnector: null,
            webSocket: null,
            auth: null,
            analytics: null
        };

        this.state = {
            isInitialized: false,
            isConnected: false,
            lastUpdate: null,
            activeFeatures: new Set(),
            dashboardMetrics: {}
        };

        this.config = {
            updateInterval: 30000, // 30 seconds
            maxRetries: 3,
            healthCheckInterval: 60000 // 1 minute
        };

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Blaze Intelligence Platform...');

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize components in order
            await this.initializeComponents();

            // Setup component integrations
            this.setupIntegrations();

            // Start health monitoring
            this.startHealthMonitoring();

            // Setup dashboard updates
            this.setupDashboardUpdates();

            this.state.isInitialized = true;
            console.log('✅ Blaze Intelligence Platform initialized successfully');

            // Emit platform ready event
            this.emitPlatformEvent('platform_ready', {
                timestamp: Date.now(),
                components: Object.keys(this.components),
                features: Array.from(this.state.activeFeatures)
            });

        } catch (error) {
            console.error('❌ Failed to initialize Blaze Intelligence Platform:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeComponents() {
        try {
            // Initialize Analytics first (for tracking everything else)
            if (window.BlazeAnalyticsTracker) {
                this.components.analytics = window.blazeAnalytics || new window.BlazeAnalyticsTracker();
                console.log('📊 Analytics component initialized');
                this.state.activeFeatures.add('analytics');
            }

            // Initialize Authentication
            if (window.BlazeAuthManager) {
                this.components.auth = window.blazeAuth || new window.BlazeAuthManager();
                console.log('🔐 Authentication component initialized');
                this.state.activeFeatures.add('auth');
            }

            // Initialize WebSocket
            if (window.BlazeWebSocketClient) {
                this.components.webSocket = window.blazeWebSocket || new window.BlazeWebSocketClient();
                console.log('🔌 WebSocket component initialized');
                this.state.activeFeatures.add('websocket');
            }

            // Initialize Sports Data Connector
            if (window.LiveSportsConnector) {
                this.components.sportsConnector = window.blazeSportsConnector || new window.LiveSportsConnector();
                console.log('📡 Sports data connector initialized');
                this.state.activeFeatures.add('sports-data');
            }

            // Wait for all components to be ready
            await this.waitForComponentsReady();

        } catch (error) {
            console.error('❌ Component initialization failed:', error);
            throw error;
        }
    }

    async waitForComponentsReady() {
        const maxWait = 10000; // 10 seconds
        const checkInterval = 100; // 100ms
        let waited = 0;

        return new Promise((resolve, reject) => {
            const checkReady = () => {
                const componentsReady = [
                    !this.components.analytics || this.components.analytics.state?.isInitialized,
                    !this.components.auth || this.components.auth.state,
                    !this.components.webSocket || this.components.webSocket.state,
                    !this.components.sportsConnector || this.components.sportsConnector.isInitialized
                ].every(ready => ready);

                if (componentsReady) {
                    resolve();
                } else if (waited >= maxWait) {
                    reject(new Error('Components failed to initialize within timeout'));
                } else {
                    waited += checkInterval;
                    setTimeout(checkReady, checkInterval);
                }
            };

            checkReady();
        });
    }

    setupIntegrations() {
        // Connect sports data to WebSocket
        if (this.components.sportsConnector && this.components.webSocket) {
            this.integrateSportsDataWithWebSocket();
        }

        // Connect auth state changes to analytics
        if (this.components.auth && this.components.analytics) {
            this.integrateAuthWithAnalytics();
        }

        // Connect WebSocket events to analytics
        if (this.components.webSocket && this.components.analytics) {
            this.integrateWebSocketWithAnalytics();
        }

        // Setup feature gating
        if (this.components.auth) {
            this.setupFeatureGating();
        }

        console.log('🔗 Component integrations established');
    }

    integrateSportsDataWithWebSocket() {
        const { sportsConnector, webSocket } = this.components;

        // Forward sports updates to WebSocket
        sportsConnector.subscribe('mlb-updated', (data) => {
            webSocket.broadcast('sports-update', { sport: 'mlb', data });
            this.updateDashboard('mlb', data);
        });

        sportsConnector.subscribe('nfl-updated', (data) => {
            webSocket.broadcast('sports-update', { sport: 'nfl', data });
            this.updateDashboard('nfl', data);
        });

        sportsConnector.subscribe('nba-updated', (data) => {
            webSocket.broadcast('sports-update', { sport: 'nba', data });
            this.updateDashboard('nba', data);
        });

        sportsConnector.subscribe('college-football-updated', (data) => {
            webSocket.broadcast('sports-update', { sport: 'college-football', data });
            this.updateDashboard('college-football', data);
        });

        console.log('🔗 Sports data integrated with WebSocket');
    }

    integrateAuthWithAnalytics() {
        const { auth, analytics } = this.components;

        // Track auth events
        auth.on('auth-success', (data) => {
            analytics.setUserId(data.user.id);
            analytics.track('user_login', {
                user_tier: data.user.subscriptionTier || 'free',
                login_method: 'email'
            });
        });

        auth.on('auth-logout', () => {
            analytics.track('user_logout');
        });

        auth.on('auth-error', (data) => {
            analytics.track('auth_error', {
                error_type: data.type,
                error_message: data.error
            });
        });

        console.log('🔗 Authentication integrated with analytics');
    }

    integrateWebSocketWithAnalytics() {
        const { webSocket, analytics } = this.components;

        // Track WebSocket connection events
        webSocket.on('connection-status', (data) => {
            analytics.track('websocket_status', {
                status: data.status,
                session_id: data.sessionId
            });

            this.state.isConnected = data.status === 'connected';
        });

        // Track WebSocket errors
        webSocket.on('error', (data) => {
            analytics.track('websocket_error', {
                error_type: data.type,
                error_message: data.error
            });
        });

        console.log('🔗 WebSocket integrated with analytics');
    }

    setupFeatureGating() {
        const { auth } = this.components;

        // Create feature gates for premium features
        const premiumFeatures = [
            'advanced-analytics',
            'video-analysis',
            'character-assessment',
            'custom-reports',
            'api-access'
        ];

        premiumFeatures.forEach(feature => {
            const gateContainer = document.getElementById(`${feature}-gate`);
            if (gateContainer) {
                auth.createFeatureGate(feature, gateContainer.id);
            }
        });

        // Listen for auth state changes to update gates
        auth.on('auth-success', () => {
            this.refreshFeatureGates();
        });

        auth.on('auth-logout', () => {
            this.refreshFeatureGates();
        });

        console.log('🔗 Feature gating configured');
    }

    refreshFeatureGates() {
        const { auth } = this.components;

        // Refresh all feature gates
        const premiumFeatures = [
            'advanced-analytics',
            'video-analysis',
            'character-assessment',
            'custom-reports',
            'api-access'
        ];

        premiumFeatures.forEach(feature => {
            const gateContainer = document.getElementById(`${feature}-gate`);
            if (gateContainer) {
                auth.createFeatureGate(feature, gateContainer.id);
            }
        });
    }

    updateDashboard(sport, data) {
        this.state.lastUpdate = Date.now();
        this.state.dashboardMetrics[sport] = {
            ...data,
            lastUpdated: this.state.lastUpdate
        };

        // Update dashboard UI if present
        this.refreshDashboardDisplay();

        // Track sports data update
        if (this.components.analytics) {
            this.components.analytics.trackSportsDataUpdate(sport, 'live_update');
        }
    }

    setupDashboardUpdates() {
        // Real-time dashboard metrics
        setInterval(() => {
            this.updatePlatformMetrics();
        }, 5000); // Every 5 seconds

        // Setup dashboard auto-refresh
        const dashboardContainer = document.getElementById('platform-dashboard');
        if (dashboardContainer) {
            this.createPlatformDashboard(dashboardContainer.id);
        }
    }

    updatePlatformMetrics() {
        const metrics = this.getPlatformMetrics();

        // Emit dashboard update event
        this.emitPlatformEvent('dashboard_update', metrics);

        // Update WebSocket subscribers
        if (this.components.webSocket && this.state.isConnected) {
            this.components.webSocket.broadcast('dashboard-update', metrics);
        }
    }

    createPlatformDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const metrics = this.getPlatformMetrics();

        container.innerHTML = `
            <div class="blaze-platform-dashboard">
                <div class="dashboard-header">
                    <h2>🎯 Blaze Intelligence Platform Status</h2>
                    <div class="status-indicator ${this.state.isConnected ? 'connected' : 'disconnected'}">
                        ${this.state.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </div>
                </div>

                <div class="platform-metrics">
                    <div class="metrics-section">
                        <h3>Components Status</h3>
                        <div class="component-grid">
                            ${Object.entries(metrics.components).map(([name, status]) => `
                                <div class="component-status">
                                    <span class="component-name">${name}</span>
                                    <span class="status-badge ${status ? 'active' : 'inactive'}">
                                        ${status ? '✅' : '❌'}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="metrics-section">
                        <h3>Sports Data</h3>
                        <div class="sports-metrics">
                            <div class="metric">
                                <span>Active Games</span>
                                <span class="value">${metrics.sports.activeGames}</span>
                            </div>
                            <div class="metric">
                                <span>Last Update</span>
                                <span class="value">${metrics.sports.lastUpdate}</span>
                            </div>
                            <div class="metric">
                                <span>Data Freshness</span>
                                <span class="value">${(metrics.sports.freshness * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>

                    <div class="metrics-section">
                        <h3>Performance</h3>
                        <div class="performance-metrics">
                            <div class="metric">
                                <span>API Latency</span>
                                <span class="value">${metrics.performance.apiLatency}ms</span>
                            </div>
                            <div class="metric">
                                <span>WebSocket Status</span>
                                <span class="value">${metrics.performance.websocketStatus}</span>
                            </div>
                            <div class="metric">
                                <span>Errors</span>
                                <span class="value ${metrics.performance.errors > 0 ? 'error' : ''}">${metrics.performance.errors}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="platform-actions">
                    <button onclick="blazePlatform.refreshAllData()" class="action-btn">
                        🔄 Refresh Data
                    </button>
                    <button onclick="blazePlatform.runHealthCheck()" class="action-btn">
                        🏥 Health Check
                    </button>
                    <button onclick="blazePlatform.exportMetrics()" class="action-btn">
                        📊 Export Metrics
                    </button>
                </div>
            </div>
        `;

        // Auto-refresh dashboard
        setTimeout(() => {
            this.createPlatformDashboard(containerId);
        }, 10000); // Every 10 seconds
    }

    getPlatformMetrics() {
        const sportsData = this.components.sportsConnector?.getAllSportsData() || {};
        const dashboardMetrics = this.components.sportsConnector?.getDashboardMetrics() || {};
        const performanceMetrics = this.components.analytics?.getDashboardMetrics() || {};

        return {
            timestamp: Date.now(),
            components: {
                'Sports Data': !!this.components.sportsConnector,
                'WebSocket': !!this.components.webSocket && this.state.isConnected,
                'Authentication': !!this.components.auth,
                'Analytics': !!this.components.analytics
            },
            sports: {
                activeGames: dashboardMetrics.activeGames || 0,
                freshness: dashboardMetrics.dataFreshness || 0,
                lastUpdate: this.state.lastUpdate ? new Date(this.state.lastUpdate).toLocaleTimeString() : 'Never'
            },
            performance: {
                apiLatency: Math.round(performanceMetrics.performance?.avg_api_latency || 0),
                websocketStatus: this.state.isConnected ? 'Connected' : 'Disconnected',
                errors: performanceMetrics.session?.errors || 0
            },
            features: Array.from(this.state.activeFeatures),
            health: this.getHealthScore()
        };
    }

    getHealthScore() {
        const checks = [
            this.state.isInitialized,
            this.state.isConnected,
            !!this.components.sportsConnector,
            !!this.components.analytics,
            Date.now() - (this.state.lastUpdate || 0) < 60000 // Data updated within last minute
        ];

        const healthScore = checks.filter(check => check).length / checks.length;
        return Math.round(healthScore * 100);
    }

    startHealthMonitoring() {
        setInterval(() => {
            this.runHealthCheck();
        }, this.config.healthCheckInterval);

        console.log('🏥 Health monitoring started');
    }

    async runHealthCheck() {
        const healthData = {
            timestamp: Date.now(),
            components: {},
            overall: 'healthy'
        };

        // Check each component
        try {
            if (this.components.sportsConnector) {
                const sportsHealth = this.components.sportsConnector.getDashboardMetrics();
                healthData.components.sportsConnector = {
                    status: sportsHealth ? 'healthy' : 'unhealthy',
                    metrics: sportsHealth
                };
            }

            if (this.components.webSocket) {
                const wsHealth = this.components.webSocket.isHealthy();
                healthData.components.webSocket = {
                    status: wsHealth ? 'healthy' : 'unhealthy',
                    connected: this.state.isConnected
                };
            }

            if (this.components.auth) {
                healthData.components.auth = {
                    status: 'healthy',
                    authenticated: this.components.auth.isAuthenticated()
                };
            }

            if (this.components.analytics) {
                const analyticsHealth = this.components.analytics.getDashboardMetrics();
                healthData.components.analytics = {
                    status: analyticsHealth ? 'healthy' : 'unhealthy',
                    metrics: analyticsHealth
                };
            }

            // Calculate overall health
            const unhealthyComponents = Object.values(healthData.components)
                .filter(comp => comp.status === 'unhealthy').length;

            if (unhealthyComponents > 0) {
                healthData.overall = unhealthyComponents > 1 ? 'critical' : 'degraded';
            }

        } catch (error) {
            healthData.overall = 'critical';
            healthData.error = error.message;
        }

        // Emit health check event
        this.emitPlatformEvent('health_check', healthData);

        // Track health metrics
        if (this.components.analytics) {
            this.components.analytics.track('platform_health_check', {
                overall_status: healthData.overall,
                healthy_components: Object.values(healthData.components)
                    .filter(comp => comp.status === 'healthy').length
            });
        }

        return healthData;
    }

    // Public API methods
    refreshAllData() {
        console.log('🔄 Refreshing all platform data...');

        if (this.components.sportsConnector) {
            this.components.sportsConnector.refreshMLBData();
            this.components.sportsConnector.refreshNFLData();
            this.components.sportsConnector.refreshNBAData();
            this.components.sportsConnector.refreshCollegeFootballData();
        }

        if (this.components.analytics) {
            this.components.analytics.track('platform_refresh', {
                timestamp: Date.now(),
                manual: true
            });
        }
    }

    exportMetrics() {
        const metrics = this.getPlatformMetrics();
        const blob = new Blob([JSON.stringify(metrics, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blaze-metrics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📊 Metrics exported successfully');
    }

    // Event system
    emitPlatformEvent(eventName, data) {
        const event = new CustomEvent(`blaze-platform-${eventName}`, {
            detail: data
        });
        document.dispatchEvent(event);

        // Also emit through WebSocket if connected
        if (this.components.webSocket && this.state.isConnected) {
            this.components.webSocket.broadcast('platform-event', {
                event: eventName,
                data
            });
        }
    }

    refreshDashboardDisplay() {
        // Trigger dashboard refresh event
        const event = new CustomEvent('blaze-dashboard-refresh', {
            detail: this.state.dashboardMetrics
        });
        document.dispatchEvent(event);
    }

    handleInitializationError(error) {
        console.error('🚨 Platform initialization error:', error);

        // Try to initialize analytics at least
        if (window.BlazeAnalyticsTracker && !this.components.analytics) {
            try {
                this.components.analytics = new window.BlazeAnalyticsTracker();
                this.components.analytics.track('platform_initialization_error', {
                    error: error.message,
                    timestamp: Date.now()
                });
            } catch (analyticsError) {
                console.error('Failed to initialize analytics for error tracking:', analyticsError);
            }
        }

        // Show user-friendly error message
        this.showErrorNotification('Platform initialization failed. Please refresh the page.');
    }

    showErrorNotification(message) {
        // Create error notification if not exists
        let notification = document.getElementById('blaze-error-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'blaze-error-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4757;
                color: white;
                padding: 1rem;
                border-radius: 6px;
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }
}

// Global instance
window.BlazePlatformIntegrator = BlazePlatformIntegrator;

// Auto-initialize
if (typeof window !== 'undefined') {
    window.blazePlatform = new BlazePlatformIntegrator();

    // Expose public methods
    window.refreshBlazeData = () => window.blazePlatform.refreshAllData();
    window.exportBlazeMetrics = () => window.blazePlatform.exportMetrics();
    window.runBlazeHealthCheck = () => window.blazePlatform.runHealthCheck();
}

export default BlazePlatformIntegrator;