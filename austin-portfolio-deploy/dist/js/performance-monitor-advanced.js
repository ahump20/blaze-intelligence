/**
 * Blaze Intelligence - Advanced Performance Monitor
 * Real-time system monitoring with championship-level metrics
 * Includes WebSocket streaming, analytics tracking, and alert system
 */

class BlazePerformanceMonitor {
    constructor(options = {}) {
        this.config = {
            updateInterval: options.updateInterval || 5000, // 5 seconds
            alertThresholds: {
                latency: 100, // ms
                errorRate: 0.05, // 5%
                cpuUsage: 80, // %
                memoryUsage: 85, // %
                responseTime: 2000 // ms
            },
            retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
            wsEndpoint: options.wsEndpoint || this.getWebSocketEndpoint(),
            apiEndpoint: options.apiEndpoint || this.getAPIEndpoint(),
            ...options
        };

        this.metrics = {
            system: {
                cpu: 0,
                memory: 0,
                uptime: 0,
                load: [0, 0, 0]
            },
            performance: {
                latency: 0,
                throughput: 0,
                errorRate: 0,
                responseTime: 0,
                activeConnections: 0
            },
            sports: {
                mlbQueries: 0,
                nflQueries: 0,
                nbaQueries: 0,
                characterAssessments: 0,
                hawkeyeTracking: 0
            },
            realtime: {
                wsConnections: 0,
                dataStreams: 0,
                updateFrequency: 0,
                lastUpdate: null
            }
        };

        this.history = {
            performance: [],
            errors: [],
            alerts: [],
            usage: []
        };

        this.alerts = new Map();
        this.subscribers = new Map();
        this.wsConnection = null;
        this.updateTimer = null;

        this.init();
    }

    async init() {
        console.log('📊 Initializing Blaze Performance Monitor...');

        try {
            // Start monitoring loop
            this.startMonitoring();

            // Connect to WebSocket for real-time updates
            await this.connectWebSocket();

            // Initialize performance tracking
            this.initPerformanceTracking();

            // Start cleanup timer
            this.startCleanupTimer();

            console.log('✅ Performance Monitor initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize Performance Monitor:', error);
        }
    }

    getWebSocketEndpoint() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

        if (hostname.includes('netlify.app') || hostname.includes('blaze-intelligence')) {
            return 'wss://blaze-intelligence-mcp.onrender.com/ws';
        }

        return 'ws://localhost:3003/ws';
    }

    getAPIEndpoint() {
        const hostname = window.location.hostname;

        if (hostname.includes('netlify.app') || hostname.includes('blaze-intelligence')) {
            return 'https://blaze-intelligence-mcp.onrender.com';
        }

        return 'http://localhost:3005';
    }

    async connectWebSocket() {
        try {
            this.wsConnection = new WebSocket(this.config.wsEndpoint);

            this.wsConnection.onopen = () => {
                console.log('🔌 Performance Monitor WebSocket connected');
                this.emit('websocket-connected', { timestamp: Date.now() });

                // Subscribe to performance updates
                this.wsConnection.send(JSON.stringify({
                    type: 'subscribe',
                    channels: ['performance', 'system-metrics', 'sports-analytics']
                }));
            };

            this.wsConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('❌ WebSocket message parse error:', error);
                }
            };

            this.wsConnection.onclose = () => {
                console.log('🔌 Performance Monitor WebSocket disconnected');
                this.emit('websocket-disconnected', { timestamp: Date.now() });

                // Attempt reconnection after 5 seconds
                setTimeout(() => {
                    this.connectWebSocket();
                }, 5000);
            };

            this.wsConnection.onerror = (error) => {
                console.error('❌ WebSocket connection error:', error);
            };

        } catch (error) {
            console.error('❌ Failed to connect WebSocket:', error);
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'performance-update':
                this.updateMetrics(data.metrics);
                break;

            case 'alert':
                this.handleAlert(data.alert);
                break;

            case 'system-status':
                this.updateSystemMetrics(data.system);
                break;

            case 'sports-activity':
                this.updateSportsMetrics(data.activity);
                break;

            default:
                console.log('📊 Unknown WebSocket message type:', data.type);
        }
    }

    startMonitoring() {
        this.updateTimer = setInterval(async () => {
            try {
                await this.collectMetrics();
                this.checkAlerts();
                this.cleanupHistory();
                this.emit('metrics-updated', this.metrics);
            } catch (error) {
                console.error('❌ Monitoring cycle error:', error);
            }
        }, this.config.updateInterval);

        console.log(`🔄 Performance monitoring started - updating every ${this.config.updateInterval/1000}s`);
    }

    async collectMetrics() {
        const timestamp = Date.now();

        try {
            // Collect system health from API
            const healthResponse = await fetch(`${this.config.apiEndpoint}/health`);
            const healthData = await healthResponse.json();

            // Update system metrics
            this.metrics.system = {
                cpu: Math.random() * 100, // Simulated - replace with real metrics
                memory: healthData.memory?.heapUsed / healthData.memory?.heapTotal * 100 || 0,
                uptime: healthData.uptime || 0,
                load: [Math.random() * 2, Math.random() * 2, Math.random() * 2]
            };

            // Measure API response time
            const startTime = performance.now();
            await fetch(`${this.config.apiEndpoint}/health`);
            const responseTime = performance.now() - startTime;

            this.metrics.performance.responseTime = responseTime;
            this.metrics.performance.latency = responseTime;

            // Update real-time metrics
            this.metrics.realtime = {
                wsConnections: this.wsConnection?.readyState === WebSocket.OPEN ? 1 : 0,
                dataStreams: Object.keys(this.subscribers).length,
                updateFrequency: 1000 / this.config.updateInterval,
                lastUpdate: timestamp
            };

            // Store historical data
            this.history.performance.push({
                timestamp,
                ...this.metrics.performance,
                system: { ...this.metrics.system }
            });

        } catch (error) {
            console.error('❌ Metrics collection error:', error);
            this.recordError('metrics-collection', error.message);
        }
    }

    updateMetrics(newMetrics) {
        Object.assign(this.metrics, newMetrics);
        this.emit('metrics-updated', this.metrics);
    }

    updateSystemMetrics(systemData) {
        this.metrics.system = { ...this.metrics.system, ...systemData };
    }

    updateSportsMetrics(activity) {
        switch (activity.type) {
            case 'mlb-query':
                this.metrics.sports.mlbQueries++;
                break;
            case 'nfl-query':
                this.metrics.sports.nflQueries++;
                break;
            case 'nba-query':
                this.metrics.sports.nbaQueries++;
                break;
            case 'character-assessment':
                this.metrics.sports.characterAssessments++;
                break;
            case 'hawkeye-tracking':
                this.metrics.sports.hawkeyeTracking++;
                break;
        }
    }

    checkAlerts() {
        const alerts = [];

        // Check latency
        if (this.metrics.performance.latency > this.config.alertThresholds.latency) {
            alerts.push({
                type: 'latency',
                severity: 'warning',
                message: `High latency detected: ${this.metrics.performance.latency.toFixed(2)}ms`,
                value: this.metrics.performance.latency,
                threshold: this.config.alertThresholds.latency
            });
        }

        // Check error rate
        if (this.metrics.performance.errorRate > this.config.alertThresholds.errorRate) {
            alerts.push({
                type: 'error-rate',
                severity: 'critical',
                message: `High error rate: ${(this.metrics.performance.errorRate * 100).toFixed(2)}%`,
                value: this.metrics.performance.errorRate,
                threshold: this.config.alertThresholds.errorRate
            });
        }

        // Check CPU usage
        if (this.metrics.system.cpu > this.config.alertThresholds.cpuUsage) {
            alerts.push({
                type: 'cpu',
                severity: 'warning',
                message: `High CPU usage: ${this.metrics.system.cpu.toFixed(1)}%`,
                value: this.metrics.system.cpu,
                threshold: this.config.alertThresholds.cpuUsage
            });
        }

        // Check memory usage
        if (this.metrics.system.memory > this.config.alertThresholds.memoryUsage) {
            alerts.push({
                type: 'memory',
                severity: 'critical',
                message: `High memory usage: ${this.metrics.system.memory.toFixed(1)}%`,
                value: this.metrics.system.memory,
                threshold: this.config.alertThresholds.memoryUsage
            });
        }

        // Process new alerts
        alerts.forEach(alert => {
            if (!this.alerts.has(alert.type)) {
                this.handleAlert(alert);
                this.alerts.set(alert.type, { ...alert, timestamp: Date.now() });
            }
        });
    }

    handleAlert(alert) {
        console.warn(`⚠️ Performance Alert: ${alert.message}`);

        this.history.alerts.push({
            ...alert,
            timestamp: Date.now()
        });

        this.emit('alert', alert);
    }

    recordError(type, message) {
        const error = {
            type,
            message,
            timestamp: Date.now()
        };

        this.history.errors.push(error);
        this.metrics.performance.errorRate = this.calculateErrorRate();

        this.emit('error', error);
    }

    calculateErrorRate() {
        const recentErrors = this.history.errors.filter(
            error => Date.now() - error.timestamp < 60000 // Last minute
        );
        const totalRequests = this.history.performance.length;

        return totalRequests > 0 ? recentErrors.length / totalRequests : 0;
    }

    initPerformanceTracking() {
        // Track page load times
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;

            this.metrics.performance.pageLoadTime = loadTime;
        }

        // Track API call performance
        this.trackAPIPerformance();

        // Track user interactions
        this.trackUserInteractions();
    }

    trackAPIPerformance() {
        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            const startTime = performance.now();

            try {
                const response = await originalFetch.apply(window, args);
                const endTime = performance.now();
                const duration = endTime - startTime;

                this.recordAPICall(args[0], response.status, duration);
                return response;

            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;

                this.recordAPICall(args[0], 0, duration, error);
                throw error;
            }
        };
    }

    recordAPICall(url, status, duration, error = null) {
        const call = {
            url: typeof url === 'string' ? url : url.url,
            status,
            duration,
            error: error?.message,
            timestamp: Date.now()
        };

        this.history.usage.push(call);

        // Update throughput
        const recentCalls = this.history.usage.filter(
            call => Date.now() - call.timestamp < 60000
        );
        this.metrics.performance.throughput = recentCalls.length;

        if (error || status >= 400) {
            this.recordError('api-call', `${call.url} - ${status}: ${error?.message || 'HTTP Error'}`);
        }
    }

    trackUserInteractions() {
        let interactionCount = 0;

        ['click', 'keydown', 'scroll'].forEach(event => {
            document.addEventListener(event, () => {
                interactionCount++;
                this.metrics.performance.userInteractions = interactionCount;
            }, { passive: true });
        });
    }

    cleanupHistory() {
        const cutoff = Date.now() - this.config.retentionPeriod;

        this.history.performance = this.history.performance.filter(
            item => item.timestamp > cutoff
        );
        this.history.errors = this.history.errors.filter(
            item => item.timestamp > cutoff
        );
        this.history.alerts = this.history.alerts.filter(
            item => item.timestamp > cutoff
        );
        this.history.usage = this.history.usage.filter(
            item => item.timestamp > cutoff
        );
    }

    startCleanupTimer() {
        setInterval(() => {
            this.cleanupHistory();
        }, 60000); // Clean up every minute
    }

    // Dashboard UI Generation
    createDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="blaze-performance-dashboard">
                <div class="dashboard-header">
                    <h2>🏆 Championship Performance Monitor</h2>
                    <div class="status-indicator ${this.getOverallStatus()}">
                        <span class="status-dot"></span>
                        <span class="status-text">${this.getOverallStatus().toUpperCase()}</span>
                    </div>
                </div>

                <div class="metrics-grid">
                    <div class="metric-card system-metrics">
                        <h3>System Health</h3>
                        <div class="metric-value">
                            <span class="value">${this.metrics.system.cpu.toFixed(1)}%</span>
                            <span class="label">CPU Usage</span>
                        </div>
                        <div class="metric-value">
                            <span class="value">${this.metrics.system.memory.toFixed(1)}%</span>
                            <span class="label">Memory Usage</span>
                        </div>
                        <div class="metric-value">
                            <span class="value">${Math.floor(this.metrics.system.uptime / 60)}m</span>
                            <span class="label">Uptime</span>
                        </div>
                    </div>

                    <div class="metric-card performance-metrics">
                        <h3>Performance</h3>
                        <div class="metric-value championship">
                            <span class="value">${this.metrics.performance.latency.toFixed(0)}ms</span>
                            <span class="label">Latency</span>
                            <span class="target">Target: <100ms</span>
                        </div>
                        <div class="metric-value">
                            <span class="value">${this.metrics.performance.throughput}</span>
                            <span class="label">Requests/min</span>
                        </div>
                        <div class="metric-value">
                            <span class="value">${(this.metrics.performance.errorRate * 100).toFixed(2)}%</span>
                            <span class="label">Error Rate</span>
                        </div>
                    </div>

                    <div class="metric-card sports-metrics">
                        <h3>Sports Analytics</h3>
                        <div class="metric-value">
                            <span class="value">${this.metrics.sports.mlbQueries}</span>
                            <span class="label">MLB Queries</span>
                        </div>
                        <div class="metric-value">
                            <span class="value">${this.metrics.sports.characterAssessments}</span>
                            <span class="label">Character Assessments</span>
                        </div>
                        <div class="metric-value">
                            <span class="value">${this.metrics.sports.hawkeyeTracking}</span>
                            <span class="label">Hawk-Eye Tracking</span>
                        </div>
                    </div>

                    <div class="metric-card realtime-metrics">
                        <h3>Real-Time Systems</h3>
                        <div class="metric-value">
                            <span class="value">${this.metrics.realtime.wsConnections}</span>
                            <span class="label">WebSocket Connections</span>
                        </div>
                        <div class="metric-value">
                            <span class="value">${this.metrics.realtime.dataStreams}</span>
                            <span class="label">Data Streams</span>
                        </div>
                        <div class="metric-value">
                            <span class="value">${this.metrics.realtime.updateFrequency.toFixed(1)}Hz</span>
                            <span class="label">Update Frequency</span>
                        </div>
                    </div>
                </div>

                <div class="charts-section">
                    <div class="chart-container">
                        <h3>Performance Trend</h3>
                        <canvas id="performance-chart" width="800" height="300"></canvas>
                    </div>
                </div>

                <div class="alerts-section">
                    <h3>Recent Alerts</h3>
                    <div id="alerts-list" class="alerts-list">
                        ${this.renderAlerts()}
                    </div>
                </div>
            </div>
        `;

        this.updateDashboard();
        this.initCharts();
    }

    updateDashboard() {
        // Update metric values if dashboard exists
        const dashboard = document.querySelector('.blaze-performance-dashboard');
        if (!dashboard) return;

        // Update system metrics
        const cpuValue = dashboard.querySelector('.system-metrics .metric-value:nth-child(2) .value');
        if (cpuValue) cpuValue.textContent = `${this.metrics.system.cpu.toFixed(1)}%`;

        const memoryValue = dashboard.querySelector('.system-metrics .metric-value:nth-child(3) .value');
        if (memoryValue) memoryValue.textContent = `${this.metrics.system.memory.toFixed(1)}%`;

        const uptimeValue = dashboard.querySelector('.system-metrics .metric-value:nth-child(4) .value');
        if (uptimeValue) uptimeValue.textContent = `${Math.floor(this.metrics.system.uptime / 60)}m`;

        // Update performance metrics
        const latencyValue = dashboard.querySelector('.performance-metrics .metric-value:nth-child(2) .value');
        if (latencyValue) latencyValue.textContent = `${this.metrics.performance.latency.toFixed(0)}ms`;

        // Update status indicator
        const statusIndicator = dashboard.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${this.getOverallStatus()}`;
            statusIndicator.querySelector('.status-text').textContent = this.getOverallStatus().toUpperCase();
        }

        // Update alerts
        const alertsList = document.getElementById('alerts-list');
        if (alertsList) {
            alertsList.innerHTML = this.renderAlerts();
        }
    }

    renderAlerts() {
        const recentAlerts = this.history.alerts.slice(-5).reverse();

        if (recentAlerts.length === 0) {
            return '<div class="no-alerts">🏆 All systems operating at championship level</div>';
        }

        return recentAlerts.map(alert => `
            <div class="alert-item ${alert.severity}">
                <div class="alert-icon">⚠️</div>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</div>
                </div>
            </div>
        `).join('');
    }

    getOverallStatus() {
        const criticalAlerts = Array.from(this.alerts.values()).filter(
            alert => alert.severity === 'critical'
        );

        if (criticalAlerts.length > 0) return 'critical';

        const warningAlerts = Array.from(this.alerts.values()).filter(
            alert => alert.severity === 'warning'
        );

        if (warningAlerts.length > 0) return 'warning';

        return 'healthy';
    }

    initCharts() {
        // Initialize performance chart (simplified version)
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Simple chart implementation
        this.drawPerformanceChart(ctx, canvas.width, canvas.height);
    }

    drawPerformanceChart(ctx, width, height) {
        const data = this.history.performance.slice(-20); // Last 20 data points
        if (data.length === 0) return;

        ctx.clearRect(0, 0, width, height);

        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, height - 30);
        ctx.lineTo(width - 20, height - 30);
        ctx.moveTo(50, height - 30);
        ctx.lineTo(50, 20);
        ctx.stroke();

        // Draw latency line
        ctx.strokeStyle = '#BF5700';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = 50 + (index / (data.length - 1)) * (width - 70);
            const y = height - 30 - (point.latency / 200) * (height - 50);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Add labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Latency (ms)', 10, height / 2);
        ctx.fillText('Time', width / 2, height - 5);
    }

    // Event system
    on(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        this.subscribers.get(event).add(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        this.subscribers.get(event)?.delete(callback);
    }

    emit(event, data) {
        const callbacks = this.subscribers.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in ${event} callback:`, error);
                }
            });
        }
    }

    // Public API
    getMetrics() {
        return { ...this.metrics };
    }

    getHistory() {
        return { ...this.history };
    }

    getAlerts() {
        return Array.from(this.alerts.values());
    }

    destroy() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        if (this.wsConnection) {
            this.wsConnection.close();
        }

        this.subscribers.clear();
        this.alerts.clear();
    }
}

// Global instance
window.BlazePerformanceMonitor = BlazePerformanceMonitor;

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.blazePerformanceMonitor = new BlazePerformanceMonitor();

    // Expose for global use
    window.getPerformanceMetrics = () => window.blazePerformanceMonitor.getMetrics();
    window.getPerformanceHistory = () => window.blazePerformanceMonitor.getHistory();
    window.createPerformanceDashboard = (containerId) => window.blazePerformanceMonitor.createDashboard(containerId);
}

export default BlazePerformanceMonitor;