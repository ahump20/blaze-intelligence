/**
 * Blaze Intelligence Core System
 * Main application controller and state management
 */

class BlazeCore {
    constructor() {
        this.state = {
            analytics: {
                visits: 1,
                aiInteractions: 0,
                codeGenerations: 0,
                trajectoryAnalyses: 0,
                projectIdeas: 0,
                codeAnalyses: 0,
                apiCalls: 0,
                interactionTimestamps: [],
                responseTimes: [],
                lastModel: 'N/A',
                sessionStart: Date.now()
            },
            ui: {
                mobileMenuOpen: false,
                modalOpen: false,
                darkMode: true,
                animations: true
            },
            chat: {
                history: [],
                currentConversation: null,
                models: {
                    'gemini-2.0-flash': { name: 'Gemini 2.0 Flash', provider: 'google' },
                    'claude-3-sonnet': { name: 'Claude 3 Sonnet', provider: 'anthropic' }
                }
            },
            projects: {
                featured: [],
                generated: [],
                categories: ['Analytics', 'AI/ML', 'Finance', 'Strategy', 'Research']
            }
        };

        this.config = {
            apiEndpoints: {
                gemini: '/api/ai/gemini',
                analytics: '/api/analytics',
                projects: '/api/projects',
                insights: '/api/insights'
            },
            thresholds: {
                analyticsUpdate: 5000, // 5 seconds
                animationDelay: 150,
                responseTimeout: 30000
            }
        };

        this.modules = new Map();
        this.eventBus = new EventTarget();
        this.initializeCore();
    }

    async initializeCore() {
        try {
            this.loadStoredState();
            await this.loadModules();
            this.setupEventListeners();
            this.startPeriodicTasks();
            this.emit('core:initialized');
        } catch (error) {
            console.error('Failed to initialize Blaze Core:', error);
            this.handleCriticalError(error);
        }
    }

    async loadModules() {
        const moduleConfigs = [
            { name: 'ui', path: './modules/UIManager.js' },
            { name: 'ai', path: './modules/AIManager.js' },
            { name: 'analytics', path: './modules/AnalyticsManager.js' },
            { name: 'projects', path: './modules/ProjectManager.js' },
            { name: 'visualization', path: './modules/VisualizationManager.js' },
            { name: 'security', path: './modules/SecurityManager.js' }
        ];

        for (const config of moduleConfigs) {
            try {
                const module = await import(config.path);
                const ModuleClass = module.default;
                const instance = new ModuleClass(this);
                this.modules.set(config.name, instance);
                await instance.initialize();
            } catch (error) {
                console.warn(`Failed to load module ${config.name}:`, error);
            }
        }
    }

    loadStoredState() {
        try {
            const stored = localStorage.getItem('blazeIntelligence');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.state = this.deepMerge(this.state, parsed);
            }
        } catch (error) {
            console.warn('Failed to load stored state:', error);
        }
    }

    saveState() {
        try {
            localStorage.setItem('blazeIntelligence', JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to save state:', error);
        }
    }

    setupEventListeners() {
        // Auto-save state on changes
        this.eventBus.addEventListener('state:changed', () => {
            this.saveState();
        });

        // Global error handling
        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });

        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            this.updateAnalytics('performance', {
                loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                totalTime: perfData.loadEventEnd - perfData.fetchStart
            });
        });

        // Monitor resource loading
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'resource' && entry.duration > 1000) {
                    console.warn(`Slow resource: ${entry.name} (${entry.duration}ms)`);
                }
            });
        });
        observer.observe({ entryTypes: ['resource'] });
    }

    startPeriodicTasks() {
        // Auto-save state every 30 seconds
        setInterval(() => {
            this.saveState();
        }, 30000);

        // Update analytics dashboard every 5 seconds
        setInterval(() => {
            this.emit('analytics:update');
        }, this.config.thresholds.analyticsUpdate);

        // Cleanup old data every hour
        setInterval(() => {
            this.cleanupOldData();
        }, 3600000);
    }

    cleanupOldData() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        // Clean old interaction timestamps
        this.state.analytics.interactionTimestamps = 
            this.state.analytics.interactionTimestamps.filter(
                timestamp => now - timestamp.x < maxAge
            );

        // Clean old response times (keep last 100)
        if (this.state.analytics.responseTimes.length > 100) {
            this.state.analytics.responseTimes = 
                this.state.analytics.responseTimes.slice(-100);
        }

        this.emit('state:changed');
    }

    // State management methods
    updateState(path, value) {
        this.setNestedProperty(this.state, path, value);
        this.emit('state:changed', { path, value });
    }

    getState(path) {
        return this.getNestedProperty(this.state, path);
    }

    updateAnalytics(metric, value) {
        if (typeof value === 'number') {
            this.state.analytics[metric] = (this.state.analytics[metric] || 0) + value;
        } else if (typeof value === 'object' && value !== null) {
            this.state.analytics[metric] = { ...this.state.analytics[metric], ...value };
        } else {
            this.state.analytics[metric] = value;
        }

        // Record interaction timestamp
        this.state.analytics.interactionTimestamps.push({
            x: Date.now(),
            y: 1,
            type: metric
        });

        this.emit('analytics:updated', { metric, value });
        this.emit('state:changed');
    }

    // Module management
    getModule(name) {
        return this.modules.get(name);
    }

    async callModule(name, method, ...args) {
        const module = this.modules.get(name);
        if (!module || typeof module[method] !== 'function') {
            throw new Error(`Module ${name} or method ${method} not found`);
        }
        return await module[method](...args);
    }

    // Event system
    emit(event, data) {
        this.eventBus.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    on(event, callback) {
        this.eventBus.addEventListener(event, callback);
    }

    off(event, callback) {
        this.eventBus.removeEventListener(event, callback);
    }

    // Error handling
    handleError(error) {
        console.error('Blaze Core Error:', error);
        
        // Track error in analytics
        this.updateAnalytics('errors', 1);
        
        // Emit error event for modules to handle
        this.emit('error', error);
        
        // Show user-friendly error message
        this.showNotification('An error occurred. Please try again.', 'error');
    }

    handleCriticalError(error) {
        console.error('Critical Blaze Core Error:', error);
        
        // Show critical error message
        this.showNotification('A critical error occurred. Refreshing page...', 'error');
        
        // Attempt recovery after delay
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    showNotification(message, type = 'info') {
        const uiManager = this.getModule('ui');
        if (uiManager) {
            uiManager.showNotification(message, type);
        } else {
            // Fallback to console
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Utility methods
    deepMerge(target, source) {
        const result = { ...target };
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        });
        return result;
    }

    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }

    getNestedProperty(obj, path) {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }
        return current;
    }

    // Public API for external access
    async api(endpoint, options = {}) {
        const url = this.config.apiEndpoints[endpoint] || endpoint;
        const securityManager = this.getModule('security');
        
        try {
            const secureOptions = securityManager ? 
                await securityManager.secureRequest(options) : options;
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...secureOptions.headers
                },
                ...secureOptions
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // Debug methods
    debug() {
        return {
            state: this.state,
            modules: Array.from(this.modules.keys()),
            config: this.config
        };
    }

    resetState() {
        localStorage.removeItem('blazeIntelligence');
        window.location.reload();
    }
}

// Global instance
window.BlazeCore = BlazeCore;
export default BlazeCore;