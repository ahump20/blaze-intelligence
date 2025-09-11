/**
 * Blaze Intelligence Main Enhanced Integration System
 * Orchestrates all real-time components with performance optimization
 */

class BlazeMainEnhanced {
    constructor(config = {}) {
        this.config = {
            enableWebSocket: config.enableWebSocket !== false,
            enablePerformanceOptimization: config.enablePerformanceOptimization !== false,
            enableServiceWorker: config.enableServiceWorker !== false,
            autoStart: config.autoStart !== false,
            debug: config.debug || false,
            ...config
        };
        
        // Component references
        this.components = new Map();
        this.realtimeSync = null;
        this.performanceOptimizer = null;
        
        // System state
        this.initialized = false;
        this.starting = false;
        this.systemHealth = {
            status: 'initializing',
            components: {},
            lastHealthCheck: null,
            errors: []
        };
        
        // Event management
        this.eventListeners = new Map();
        
        if (this.config.autoStart) {
            this.initialize();
        }
    }
    
    async initialize() {
        if (this.initialized || this.starting) return;
        
        this.starting = true;
        console.log('🚀 Initializing Blaze Intelligence Enhanced System...');
        
        try {
            // Initialize core systems
            await this.initializeCoreComponents();
            
            // Initialize real-time synchronization
            if (this.config.enableWebSocket) {
                await this.initializeRealtimeSync();
            }
            
            // Initialize performance optimization
            if (this.config.enablePerformanceOptimization) {
                await this.initializePerformanceOptimization();
            }
            
            // Initialize UI components
            await this.initializeUIComponents();
            
            // Set up system health monitoring
            this.initializeHealthMonitoring();
            
            // Set up event coordination
            this.setupEventCoordination();
            
            // Start all systems
            await this.startAllSystems();
            
            this.initialized = true;
            this.starting = false;
            this.systemHealth.status = 'running';
            
            console.log('✅ Blaze Intelligence Enhanced System initialized successfully');
            this.emit('system:initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Blaze system:', error);
            this.systemHealth.status = 'error';
            this.systemHealth.errors.push({
                timestamp: Date.now(),
                error: error.message,
                component: 'main'
            });
            this.starting = false;
            throw error;
        }
    }
    
    async initializeCoreComponents() {
        console.log('🔧 Initializing core components...');
        
        // Initialize API client
        if (typeof window !== 'undefined' && window.blazeAPI) {
            this.components.set('api', window.blazeAPI);
            this.systemHealth.components.api = 'initialized';
        }
        
        // Initialize error handler
        if (typeof window !== 'undefined' && window.blazeErrorHandler) {
            this.components.set('errorHandler', window.blazeErrorHandler);
            this.systemHealth.components.errorHandler = 'initialized';
        }
        
        // Wait for DOM to be ready
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', resolve);
                } else {
                    resolve();
                }
            });
        }
    }
    
    async initializeRealtimeSync() {
        console.log('📡 Initializing real-time synchronization...');
        
        try {
            // Wait for BlazeRealtimeEnhanced to be available
            if (typeof BlazeRealtimeEnhanced === 'undefined' && typeof window !== 'undefined') {
                await this.waitForGlobal('BlazeRealtimeEnhanced', 5000);
            }
            
            // Initialize real-time sync
            const realtimeConfig = {
                websocketURL: this.config.websocketURL || 'wss://stream.blaze-intelligence.pages.dev/v2/live',
                fallbackURL: this.config.fallbackURL || '/api/enhanced-gateway',
                enableCompression: true,
                batchUpdates: true,
                ...this.config.realtime
            };
            
            if (typeof window !== 'undefined' && window.initializeBlazeRealtime) {
                this.realtimeSync = window.initializeBlazeRealtime(realtimeConfig);
            } else if (typeof BlazeRealtimeEnhanced !== 'undefined') {
                this.realtimeSync = new BlazeRealtimeEnhanced(realtimeConfig);
            }
            
            if (this.realtimeSync) {
                this.components.set('realtimeSync', this.realtimeSync);
                this.systemHealth.components.realtimeSync = 'initialized';
                
                // Set up real-time event handlers
                this.setupRealtimeEventHandlers();
            } else {
                throw new Error('Failed to initialize real-time sync');
            }
            
        } catch (error) {
            console.error('❌ Real-time sync initialization failed:', error);
            this.systemHealth.components.realtimeSync = 'error';
            this.systemHealth.errors.push({
                timestamp: Date.now(),
                error: error.message,
                component: 'realtimeSync'
            });
        }
    }
    
    async initializePerformanceOptimization() {
        console.log('⚡ Initializing performance optimization...');
        
        try {
            // Wait for BlazePerformanceOptimizer to be available
            if (typeof BlazePerformanceOptimizer === 'undefined' && typeof window !== 'undefined') {
                await this.waitForGlobal('BlazePerformanceOptimizer', 5000);
            }
            
            // Initialize performance optimizer
            const perfConfig = {
                enableServiceWorker: this.config.enableServiceWorker,
                enableLazyLoading: true,
                enableImageOptimization: true,
                cacheStrategy: 'stale-while-revalidate',
                ...this.config.performance
            };
            
            if (typeof window !== 'undefined' && window.initializeBlazePerformance) {
                this.performanceOptimizer = window.initializeBlazePerformance(perfConfig);
            } else if (typeof BlazePerformanceOptimizer !== 'undefined') {
                this.performanceOptimizer = new BlazePerformanceOptimizer(perfConfig);
            }
            
            if (this.performanceOptimizer) {
                this.components.set('performanceOptimizer', this.performanceOptimizer);
                this.systemHealth.components.performanceOptimizer = 'initialized';
            } else {
                throw new Error('Failed to initialize performance optimizer');
            }
            
        } catch (error) {
            console.error('❌ Performance optimization initialization failed:', error);
            this.systemHealth.components.performanceOptimizer = 'error';
            this.systemHealth.errors.push({
                timestamp: Date.now(),
                error: error.message,
                component: 'performanceOptimizer'
            });
        }
    }
    
    async initializeUIComponents() {
        console.log('🎨 Initializing UI components...');
        
        // Cardinals Analytics Component
        await this.initializeCardinalsComponent();
        
        // NIL Calculator Component
        await this.initializeNILComponent();
        
        // Sports Metrics Components
        await this.initializeSportsComponents();
        
        // System Health Dashboard
        await this.initializeHealthDashboard();
        
        // Interactive Elements
        await this.initializeInteractiveElements();
    }
    
    async initializeCardinalsComponent() {
        const cardinalsContainer = document.querySelector('[data-blaze="cardinals-analytics"]');
        if (cardinalsContainer) {
            try {
                const cardinalsComponent = {
                    container: cardinalsContainer,
                    update: (data) => {
                        this.updateCardinalsUI(data);
                    },
                    refresh: async () => {
                        if (this.realtimeSync) {
                            const cached = this.realtimeSync.getCachedData('cardinals-analytics');
                            if (cached) {
                                this.updateCardinalsUI(cached);
                            }
                        }
                    }
                };
                
                this.components.set('cardinals', cardinalsComponent);
                this.systemHealth.components.cardinals = 'initialized';
                
                // Initial data load
                await cardinalsComponent.refresh();
                
            } catch (error) {
                console.error('❌ Cardinals component initialization failed:', error);
                this.systemHealth.components.cardinals = 'error';
            }
        }
    }
    
    async initializeNILComponent() {
        const nilContainer = document.querySelector('[data-blaze="nil-calculator"]');
        if (nilContainer) {
            try {
                const nilComponent = {
                    container: nilContainer,
                    calculate: (data) => {
                        return this.calculateNIL(data);
                    },
                    validateInput: (data) => {
                        return this.validateNILInput(data);
                    }
                };
                
                this.components.set('nil', nilComponent);
                this.systemHealth.components.nil = 'initialized';
                
                // Set up form handlers
                this.setupNILFormHandlers(nilContainer);
                
            } catch (error) {
                console.error('❌ NIL component initialization failed:', error);
                this.systemHealth.components.nil = 'error';
            }
        }
    }
    
    async initializeSportsComponents() {
        const sportsContainers = document.querySelectorAll('[data-blaze^="sports-"]');
        
        for (const container of sportsContainers) {
            const sport = container.dataset.blaze.replace('sports-', '');
            
            try {
                const sportsComponent = {
                    container,
                    sport,
                    update: (data) => {
                        this.updateSportUI(sport, data);
                    }
                };
                
                this.components.set(`sports-${sport}`, sportsComponent);
                this.systemHealth.components[`sports-${sport}`] = 'initialized';
                
            } catch (error) {
                console.error(`❌ Sports component (${sport}) initialization failed:`, error);
                this.systemHealth.components[`sports-${sport}`] = 'error';
            }
        }
    }
    
    async initializeHealthDashboard() {
        const healthContainer = document.querySelector('[data-blaze="system-health"]');
        if (healthContainer) {
            try {
                const healthComponent = {
                    container: healthContainer,
                    update: () => {
                        this.updateHealthDashboard();
                    }
                };
                
                this.components.set('health', healthComponent);
                this.systemHealth.components.health = 'initialized';
                
                // Initial update
                this.updateHealthDashboard();
                
            } catch (error) {
                console.error('❌ Health dashboard initialization failed:', error);
                this.systemHealth.components.health = 'error';
            }
        }
    }
    
    async initializeInteractiveElements() {
        // Refresh buttons
        document.querySelectorAll('[data-blaze-action="refresh"]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.dataset.blazeTarget;
                this.refreshComponent(target);
            });
        });
        
        // Clear cache buttons
        document.querySelectorAll('[data-blaze-action="clear-cache"]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearAllCaches();
            });
        });
        
        // Performance metrics toggle
        document.querySelectorAll('[data-blaze-action="toggle-metrics"]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePerformanceMetrics();
            });
        });
    }
    
    setupRealtimeEventHandlers() {
        if (!this.realtimeSync) return;
        
        // Cardinals data updates
        this.realtimeSync.on('cardinals-update', (data) => {
            const component = this.components.get('cardinals');
            if (component) {
                component.update(data);
            }
            this.emit('data:cardinals-updated', data);
        });
        
        // Sports metrics updates
        this.realtimeSync.on('sports-metrics', (data) => {
            Object.entries(data).forEach(([sport, metrics]) => {
                const component = this.components.get(`sports-${sport}`);
                if (component) {
                    component.update(metrics);
                }
            });
            this.emit('data:sports-updated', data);
        });
        
        // NIL calculation updates
        this.realtimeSync.on('nil-update', (data) => {
            this.emit('data:nil-updated', data);
        });
        
        // System health updates
        this.realtimeSync.on('system-health', (data) => {
            this.updateSystemHealth(data);
        });
        
        // Connection state changes
        this.realtimeSync.on('connected', (data) => {
            this.systemHealth.components.realtimeSync = 'connected';
            this.emit('system:realtime-connected', data);
        });
        
        this.realtimeSync.on('disconnected', (data) => {
            this.systemHealth.components.realtimeSync = 'disconnected';
            this.emit('system:realtime-disconnected', data);
        });
        
        // Error handling
        this.realtimeSync.on('error', (error) => {
            this.systemHealth.errors.push({
                timestamp: Date.now(),
                error: error.message || 'Real-time sync error',
                component: 'realtimeSync'
            });
            this.emit('system:error', error);
        });
    }
    
    initializeHealthMonitoring() {
        // Regular health checks
        setInterval(() => {
            this.performHealthCheck();
        }, 30000); // Every 30 seconds
        
        // Performance monitoring
        if (this.performanceOptimizer) {
            setInterval(() => {
                const metrics = this.performanceOptimizer.getPerformanceMetrics();
                this.updatePerformanceMetrics(metrics);
            }, 10000); // Every 10 seconds
        }
    }
    
    setupEventCoordination() {
        // Coordinate between components
        this.on('data:cardinals-updated', (data) => {
            // Update related UI elements
            this.updateRelatedElements('cardinals', data);
        });
        
        this.on('system:error', (error) => {
            // Handle system-wide errors
            this.handleSystemError(error);
        });
        
        this.on('system:performance-alert', (alert) => {
            // Handle performance alerts
            this.handlePerformanceAlert(alert);
        });
    }
    
    async startAllSystems() {
        console.log('🔥 Starting all systems...');
        
        const startPromises = [];
        
        // Start real-time sync
        if (this.realtimeSync && typeof this.realtimeSync.connect === 'function') {
            startPromises.push(
                this.realtimeSync.connect().catch(error => {
                    console.warn('⚠️ Real-time sync failed to start:', error);
                })
            );
        }
        
        // Initialize service worker
        if (this.config.enableServiceWorker && 'serviceWorker' in navigator) {
            startPromises.push(
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('🔧 Service Worker registered:', registration);
                }).catch(error => {
                    console.warn('⚠️ Service Worker registration failed:', error);
                })
            );
        }
        
        await Promise.allSettled(startPromises);
    }
    
    // UI Update Methods
    updateCardinalsUI(data) {
        const elements = {
            'cardinals-readiness': data.readiness,
            'cardinals-leverage': data.leverage,
            'cardinals-momentum': data.momentum,
            'cardinals-trend': data.trend
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value !== undefined) {
                const formattedValue = typeof value === 'number' ? 
                    (Number.isInteger(value) ? value : value.toFixed(1)) : value;
                
                if (element.textContent !== formattedValue.toString()) {
                    element.textContent = formattedValue;
                    this.animateElementUpdate(element);
                }
            }
        });
    }
    
    updateSportUI(sport, data) {
        Object.entries(data).forEach(([metric, value]) => {
            const elementId = `${sport}-${metric.toLowerCase()}`;
            const element = document.getElementById(elementId);
            
            if (element && value !== undefined) {
                const formattedValue = typeof value === 'number' ? 
                    (Number.isInteger(value) ? value : value.toFixed(1)) : value;
                
                if (element.textContent !== formattedValue.toString()) {
                    element.textContent = formattedValue;
                    this.animateElementUpdate(element);
                }
            }
        });
    }
    
    updateHealthDashboard() {
        const healthContainer = document.querySelector('[data-blaze="system-health"]');
        if (!healthContainer) return;
        
        // Update system status
        const statusElement = healthContainer.querySelector('.system-status');
        if (statusElement) {
            statusElement.textContent = this.systemHealth.status;
            statusElement.className = `system-status status-${this.systemHealth.status}`;
        }
        
        // Update component statuses
        const componentsContainer = healthContainer.querySelector('.component-statuses');
        if (componentsContainer) {
            const html = Object.entries(this.systemHealth.components)
                .map(([name, status]) => `
                    <div class="component-status ${status}">
                        <span class="component-name">${name}</span>
                        <span class="component-state">${status}</span>
                    </div>
                `).join('');
            componentsContainer.innerHTML = html;
        }
        
        // Update error count
        const errorCountElement = healthContainer.querySelector('.error-count');
        if (errorCountElement) {
            errorCountElement.textContent = this.systemHealth.errors.length;
        }
        
        // Update last check time
        const lastCheckElement = healthContainer.querySelector('.last-check');
        if (lastCheckElement) {
            lastCheckElement.textContent = this.systemHealth.lastHealthCheck ? 
                new Date(this.systemHealth.lastHealthCheck).toLocaleTimeString() : 'Never';
        }
    }
    
    animateElementUpdate(element) {
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.2s ease-out';
        
        requestAnimationFrame(() => {
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        });
    }
    
    // NIL Calculator Methods
    calculateNIL(data) {
        // COPPA compliance check
        if (data.age && data.age < 13) {
            throw new Error('Cannot calculate NIL for users under 13 (COPPA compliance)');
        }
        
        // Parental consent check for minors
        if (data.age && data.age < 18 && !data.parentalConsent) {
            throw new Error('Parental consent required for users under 18');
        }
        
        // Basic NIL calculation (simplified)
        const baseValue = (data.performance || 0) * 1000;
        const socialMultiplier = Math.log10((data.followers || 1000) / 1000) + 1;
        const sportMultiplier = this.getSportMultiplier(data.sport);
        
        const nilValue = baseValue * socialMultiplier * sportMultiplier;
        
        return {
            estimatedValue: Math.round(nilValue),
            breakdown: {
                performance: data.performance || 0,
                socialReach: data.followers || 0,
                sport: data.sport || 'unknown',
                multipliers: {
                    social: socialMultiplier.toFixed(2),
                    sport: sportMultiplier
                }
            },
            disclaimer: 'Estimates are for educational purposes only and may not reflect actual market value.',
            coppaCompliant: data.age >= 13,
            parentalConsentRequired: data.age < 18
        };
    }
    
    validateNILInput(data) {
        const errors = [];
        
        if (!data.age || data.age < 1 || data.age > 100) {
            errors.push('Valid age is required');
        }
        
        if (data.age < 13) {
            errors.push('COPPA compliance: Cannot process data for users under 13');
        }
        
        if (data.age < 18 && !data.parentalConsent) {
            errors.push('Parental consent required for users under 18');
        }
        
        if (!data.sport) {
            errors.push('Sport is required');
        }
        
        if (data.performance && (data.performance < 0 || data.performance > 100)) {
            errors.push('Performance rating must be between 0 and 100');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    getSportMultiplier(sport) {
        const multipliers = {
            'football': 1.5,
            'basketball': 1.4,
            'baseball': 1.2,
            'tennis': 1.1,
            'golf': 1.0,
            'other': 0.8
        };
        
        return multipliers[sport] || multipliers.other;
    }
    
    setupNILFormHandlers(container) {
        const form = container.querySelector('form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                age: parseInt(formData.get('age')),
                sport: formData.get('sport'),
                performance: parseInt(formData.get('performance')),
                followers: parseInt(formData.get('followers')),
                parentalConsent: formData.get('parental_consent') === 'true'
            };
            
            // Validate input
            const validation = this.validateNILInput(data);
            if (!validation.valid) {
                this.showValidationErrors(validation.errors);
                return;
            }
            
            try {
                const result = this.calculateNIL(data);
                this.displayNILResult(result);
                this.emit('nil:calculated', { input: data, result });
            } catch (error) {
                this.showError('NIL calculation failed: ' + error.message);
            }
        });
    }
    
    displayNILResult(result) {
        const resultContainer = document.querySelector('.nil-result');
        if (!resultContainer) return;
        
        resultContainer.innerHTML = `
            <div class="nil-value">
                <h3>Estimated NIL Value</h3>
                <div class="value">$${result.estimatedValue.toLocaleString()}</div>
            </div>
            <div class="nil-breakdown">
                <h4>Breakdown</h4>
                <div class="breakdown-item">
                    <span>Performance Rating:</span>
                    <span>${result.breakdown.performance}/100</span>
                </div>
                <div class="breakdown-item">
                    <span>Social Reach:</span>
                    <span>${result.breakdown.socialReach.toLocaleString()} followers</span>
                </div>
                <div class="breakdown-item">
                    <span>Sport Multiplier:</span>
                    <span>${result.breakdown.multipliers.sport}x</span>
                </div>
            </div>
            <div class="nil-disclaimer">
                <p>${result.disclaimer}</p>
                <p><small>COPPA Compliant: ${result.coppaCompliant ? 'Yes' : 'No'}</small></p>
            </div>
        `;
        
        resultContainer.style.display = 'block';
        this.animateElementUpdate(resultContainer);
    }
    
    showValidationErrors(errors) {
        const errorContainer = document.querySelector('.nil-errors');
        if (!errorContainer) return;
        
        errorContainer.innerHTML = errors.map(error => 
            `<div class="error-message">${error}</div>`
        ).join('');
        
        errorContainer.style.display = 'block';
    }
    
    showError(message) {
        console.error('❌ Error:', message);
        
        // Show toast notification if available
        if (window.showNotification) {
            window.showNotification(message, 'error');
        }
    }
    
    // System Management Methods
    performHealthCheck() {
        this.systemHealth.lastHealthCheck = Date.now();
        
        // Check component health
        this.components.forEach((component, name) => {
            if (component.healthCheck && typeof component.healthCheck === 'function') {
                try {
                    const health = component.healthCheck();
                    this.systemHealth.components[name] = health.status || 'unknown';
                } catch (error) {
                    this.systemHealth.components[name] = 'error';
                }
            }
        });
        
        // Check real-time connection
        if (this.realtimeSync) {
            const connectionState = this.realtimeSync.getConnectionState();
            this.systemHealth.components.realtimeSync = connectionState.connected ? 'connected' : 'disconnected';
        }
        
        // Update health dashboard
        this.updateHealthDashboard();
        
        this.emit('system:health-checked', this.systemHealth);
    }
    
    updateSystemHealth(data) {
        Object.assign(this.systemHealth, data);
        this.updateHealthDashboard();
    }
    
    updatePerformanceMetrics(metrics) {
        // Update performance dashboard if available
        const perfDashboard = document.querySelector('[data-blaze="performance-metrics"]');
        if (perfDashboard) {
            const metricsHTML = `
                <div class="core-web-vitals">
                    <div class="metric">
                        <span class="label">LCP</span>
                        <span class="value">${metrics.lcp}ms</span>
                    </div>
                    <div class="metric">
                        <span class="label">FID</span>
                        <span class="value">${metrics.fid}ms</span>
                    </div>
                    <div class="metric">
                        <span class="label">CLS</span>
                        <span class="value">${metrics.cls.toFixed(3)}</span>
                    </div>
                </div>
                <div class="cache-metrics">
                    <div class="metric">
                        <span class="label">Cache Hit Rate</span>
                        <span class="value">${metrics.cacheHitRate.toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span class="label">API Response</span>
                        <span class="value">${metrics.avgApiResponseTime}ms</span>
                    </div>
                </div>
            `;
            perfDashboard.innerHTML = metricsHTML;
        }
        
        // Check for performance alerts
        this.checkPerformanceThresholds(metrics);
    }
    
    checkPerformanceThresholds(metrics) {
        const alerts = [];
        
        if (metrics.lcp > 2500) {
            alerts.push({ type: 'lcp', value: metrics.lcp, threshold: 2500 });
        }
        
        if (metrics.fid > 100) {
            alerts.push({ type: 'fid', value: metrics.fid, threshold: 100 });
        }
        
        if (metrics.cls > 0.1) {
            alerts.push({ type: 'cls', value: metrics.cls, threshold: 0.1 });
        }
        
        if (metrics.cacheHitRate < 70) {
            alerts.push({ type: 'cache', value: metrics.cacheHitRate, threshold: 70 });
        }
        
        if (alerts.length > 0) {
            this.emit('system:performance-alert', alerts);
        }
    }
    
    handleSystemError(error) {
        console.error('🚨 System error:', error);
        
        // Log error
        this.systemHealth.errors.push({
            timestamp: Date.now(),
            error: error.message || 'Unknown error',
            component: error.component || 'system'
        });
        
        // Keep only last 50 errors
        if (this.systemHealth.errors.length > 50) {
            this.systemHealth.errors = this.systemHealth.errors.slice(-50);
        }
        
        // Show notification if available
        if (window.showNotification) {
            window.showNotification(`System error: ${error.message}`, 'error');
        }
    }
    
    handlePerformanceAlert(alerts) {
        console.warn('⚠️ Performance alert:', alerts);
        
        alerts.forEach(alert => {
            console.warn(`Performance threshold exceeded: ${alert.type} = ${alert.value} (threshold: ${alert.threshold})`);
        });
        
        // Trigger performance optimization
        if (this.performanceOptimizer) {
            this.performanceOptimizer.optimize?.();
        }
    }
    
    // Public API Methods
    refreshComponent(componentName) {
        const component = this.components.get(componentName);
        if (component && component.refresh) {
            component.refresh();
        } else {
            console.warn(`Component '${componentName}' not found or not refreshable`);
        }
    }
    
    clearAllCaches() {
        // Clear performance optimizer caches
        if (this.performanceOptimizer) {
            this.performanceOptimizer.clearAllCaches();
        }
        
        // Clear real-time sync caches
        if (this.realtimeSync) {
            this.realtimeSync.clearCache();
        }
        
        // Clear service worker caches
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CLEAR_CACHE'
            });
        }
        
        console.log('🗑️ All caches cleared');
        this.emit('system:caches-cleared');
    }
    
    togglePerformanceMetrics() {
        const perfContainer = document.querySelector('[data-blaze="performance-metrics"]');
        if (perfContainer) {
            perfContainer.style.display = perfContainer.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    getSystemStatus() {
        return {
            ...this.systemHealth,
            initialized: this.initialized,
            components: Array.from(this.components.keys()),
            realtimeConnected: this.realtimeSync?.getConnectionState()?.connected || false,
            performanceMetrics: this.performanceOptimizer?.getPerformanceMetrics() || null
        };
    }
    
    // Event System
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const callbacks = this.eventListeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        if (this.config.debug) {
            console.log(`🔔 Event: ${event}`, data);
        }
        
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in event listener for ${event}:`, error);
                }
            });
        }
        
        // Also dispatch DOM event
        window.dispatchEvent(new CustomEvent(`blaze:${event}`, { detail: data }));
    }
    
    // Utility Methods
    async waitForGlobal(globalName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (typeof window !== 'undefined' && window[globalName]) {
                resolve(window[globalName]);
                return;
            }
            
            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (typeof window !== 'undefined' && window[globalName]) {
                    clearInterval(checkInterval);
                    resolve(window[globalName]);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error(`Timeout waiting for global: ${globalName}`));
                }
            }, 100);
        });
    }
    
    updateRelatedElements(component, data) {
        // Update any elements that depend on this component's data
        const relatedElements = document.querySelectorAll(`[data-blaze-depends="${component}"]`);
        
        relatedElements.forEach(element => {
            const property = element.dataset.blazeProperty;
            if (property && data[property] !== undefined) {
                element.textContent = data[property];
                this.animateElementUpdate(element);
            }
        });
    }
    
    // Cleanup
    destroy() {
        console.log('🔥 Shutting down Blaze Intelligence Enhanced System...');
        
        // Destroy components
        this.components.forEach((component, name) => {
            if (component.destroy && typeof component.destroy === 'function') {
                try {
                    component.destroy();
                } catch (error) {
                    console.warn(`⚠️ Failed to destroy component ${name}:`, error);
                }
            }
        });
        
        // Destroy real-time sync
        if (this.realtimeSync && this.realtimeSync.destroy) {
            this.realtimeSync.destroy();
        }
        
        // Destroy performance optimizer
        if (this.performanceOptimizer && this.performanceOptimizer.destroy) {
            this.performanceOptimizer.destroy();
        }
        
        // Clear data structures
        this.components.clear();
        this.eventListeners.clear();
        
        this.initialized = false;
    }
}

// Global initialization
if (typeof window !== 'undefined') {
    window.blazeMainEnhanced = null;
    
    window.initializeBlazeEnhanced = function(config = {}) {
        if (window.blazeMainEnhanced) {
            window.blazeMainEnhanced.destroy();
        }
        
        window.blazeMainEnhanced = new BlazeMainEnhanced(config);
        
        // Global API
        window.blazeSystem = {
            getStatus: () => window.blazeMainEnhanced.getSystemStatus(),
            refresh: (component) => window.blazeMainEnhanced.refreshComponent(component),
            clearCaches: () => window.blazeMainEnhanced.clearAllCaches(),
            toggleMetrics: () => window.blazeMainEnhanced.togglePerformanceMetrics()
        };
        
        return window.blazeMainEnhanced;
    };
    
    // Auto-initialize when all scripts are loaded
    window.addEventListener('load', () => {
        // Wait a bit for all modules to load
        setTimeout(() => {
            window.initializeBlazeEnhanced({
                debug: window.location.search.includes('debug=true')
            });
        }, 1000);
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeMainEnhanced;
}