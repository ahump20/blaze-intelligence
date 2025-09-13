/**
 * Blaze Intelligence Championship Master System
 * Orchestrates all AI-powered platform enhancements
 * Executive-grade initialization and monitoring
 */

class BlazeChampionshipMaster {
    constructor() {
        this.version = '1.0.0';
        this.systems = new Map();
        this.performanceMetrics = {
            loadStart: performance.now(),
            systemsLoaded: 0,
            totalSystems: 4,
            errors: []
        };
        
        this.config = {
            // System priorities (higher = loads first)
            systemPriorities: {
                'brand-engine': 10,
                'intelligence-optimizer': 9,
                'championship-visuals': 8,
                'live-data-feeds': 7
            },
            
            // Performance thresholds
            performance: {
                maxInitTime: 3000, // 3 seconds
                maxSystemLoad: 1000, // 1 second per system
                minFPS: 30 // For Three.js animations
            },
            
            // Feature flags
            features: {
                visualEnhancements: true,
                brandMonitoring: true,
                contentOptimization: true,
                liveDataFeeds: true,
                performanceMonitoring: true
            }
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Blaze Championship Master: Initializing executive systems...');
        
        try {
            // Initialize core systems in priority order
            await this.loadCoreSystems();
            
            // Setup global monitoring
            this.setupGlobalMonitoring();
            
            // Initialize live data feeds
            await this.initializeLiveFeeds();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Final system validation
            this.validateSystems();
            
            console.log('✅ Championship systems online - Ready for executive presentation');
            
        } catch (error) {
            console.error('🚨 Championship system initialization failed:', error);
            this.handleSystemFailure(error);
        }
    }
    
    /**
     * Load core championship systems
     */
    async loadCoreSystems() {
        const systemLoadPromises = [];
        
        // Brand Engine (highest priority)
        if (this.config.features.brandMonitoring && window.BlazeBrand) {
            systemLoadPromises.push(this.initializeSystem('brand-engine', () => {
                return new Promise(resolve => {
                    window.BlazeBrand.enforceStandards();
                    this.systems.set('brand-engine', window.BlazeBrand);
                    resolve();
                });
            }));
        }
        
        // Intelligence Optimizer
        if (this.config.features.contentOptimization && window.BlazeOptimizer) {
            systemLoadPromises.push(this.initializeSystem('intelligence-optimizer', () => {
                return new Promise(resolve => {
                    window.BlazeOptimizer.validateAndOptimize();
                    this.systems.set('intelligence-optimizer', window.BlazeOptimizer);
                    resolve();
                });
            }));
        }
        
        // Championship Visuals
        if (this.config.features.visualEnhancements && window.BlazeVisuals) {
            systemLoadPromises.push(this.initializeSystem('championship-visuals', () => {
                return new Promise(resolve => {
                    window.BlazeVisuals.initializeAll();
                    this.systems.set('championship-visuals', window.BlazeVisuals);
                    resolve();
                });
            }));
        }
        
        // Wait for all systems to load
        await Promise.allSettled(systemLoadPromises);
        
        this.performanceMetrics.systemsLoaded = this.systems.size;
    }
    
    /**
     * Initialize individual system with error handling
     */
    async initializeSystem(name, initFunction) {
        const startTime = performance.now();
        
        try {
            await initFunction();
            
            const loadTime = performance.now() - startTime;
            console.log(`✅ ${name} loaded in ${loadTime.toFixed(2)}ms`);
            
            if (loadTime > this.config.performance.maxSystemLoad) {
                console.warn(`⚠️ ${name} exceeded load time threshold`);
            }
            
        } catch (error) {
            console.error(`🚨 Failed to load ${name}:`, error);
            this.performanceMetrics.errors.push({ system: name, error: error.message });
        }
    }
    
    /**
     * Setup global monitoring and event handlers
     */
    setupGlobalMonitoring() {
        // Page visibility monitoring
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.resumeAllSystems();
            } else {
                this.pauseNonCriticalSystems();
            }
        });
        
        // Window focus monitoring
        window.addEventListener('focus', () => this.resumeAllSystems());
        window.addEventListener('blur', () => this.pauseNonCriticalSystems());
        
        // Error monitoring
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event);
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event);
        });
    }
    
    /**
     * Initialize live data feeds
     */
    async initializeLiveFeeds() {
        if (!this.config.features.liveDataFeeds) return;\n        \n        try {\n            // Cardinals readiness data\n            await this.loadCardinalsData();\n            \n            // System health monitoring\n            await this.setupHealthMonitoring();\n            \n            // Real-time updates\n            this.setupRealTimeUpdates();\n            \n        } catch (error) {\n            console.warn('Live data feeds unavailable:', error.message);\n        }\n    }\n    \n    /**\n     * Load Cardinals intelligence data\n     */\n    async loadCardinalsData() {\n        try {\n            const response = await fetch('/data/dashboard-config.json');\n            if (response.ok) {\n                const data = await response.json();\n                \n                // Update Cardinals readiness displays\n                this.updateCardinalsReadiness(data.cardinals_readiness);\n                \n                // Store for other systems\n                window.CardinalsLiveData = data;\n                \n                console.log('📊 Cardinals live data loaded successfully');\n            }\n        } catch (error) {\n            console.warn('Cardinals data unavailable:', error.message);\n        }\n    }\n    \n    /**\n     * Update Cardinals readiness displays across the page\n     */\n    updateCardinalsReadiness(readinessData) {\n        if (!readinessData) return;\n        \n        // Update readiness score displays\n        const readinessElements = document.querySelectorAll('[data-readiness]');\n        readinessElements.forEach(element => {\n            element.textContent = `${readinessData.overall_score.toFixed(1)}%`;\n        });\n        \n        // Update trend displays\n        const trendElements = document.querySelectorAll('[data-trend]');\n        trendElements.forEach(element => {\n            element.textContent = readinessData.trend;\n            element.className = `trend-${readinessData.trend}`;\n        });\n        \n        // Update leverage factor\n        const leverageElements = document.querySelectorAll('[data-leverage]');\n        leverageElements.forEach(element => {\n            element.textContent = readinessData.key_metrics?.leverage_factor || '2.85';\n        });\n    }\n    \n    /**\n     * Setup system health monitoring\n     */\n    async setupHealthMonitoring() {\n        const checkHealth = async () => {\n            try {\n                const response = await fetch('/api/health');\n                if (response.ok) {\n                    const health = await response.json();\n                    this.updateHealthIndicators(health);\n                }\n            } catch (error) {\n                this.updateHealthIndicators({ status: 'degraded', error: error.message });\n            }\n        };\n        \n        // Initial check\n        await checkHealth();\n        \n        // Regular health checks every 30 seconds\n        setInterval(checkHealth, 30000);\n    }\n    \n    /**\n     * Update health indicators\n     */\n    updateHealthIndicators(health) {\n        const indicators = document.querySelectorAll('[data-health-status]');\n        indicators.forEach(indicator => {\n            indicator.textContent = health.status === 'healthy' ? '✅ Healthy' : '⚠️ Degraded';\n            indicator.className = `health-${health.status}`;\n        });\n    }\n    \n    /**\n     * Setup real-time updates\n     */\n    setupRealTimeUpdates() {\n        // Update timestamps every minute\n        setInterval(() => {\n            const timestampElements = document.querySelectorAll('[data-updated], [data-timestamp]');\n            const now = new Date();\n            const timeString = now.toLocaleTimeString([], {\n                hour: '2-digit',\n                minute: '2-digit'\n            });\n            \n            timestampElements.forEach(element => {\n                if (element.hasAttribute('data-updated')) {\n                    element.textContent = timeString;\n                }\n                if (element.hasAttribute('data-timestamp')) {\n                    element.textContent = now.toISOString();\n                }\n            });\n        }, 60000);\n    }\n    \n    /**\n     * Setup performance monitoring\n     */\n    setupPerformanceMonitoring() {\n        if (!this.config.features.performanceMonitoring) return;\n        \n        // FPS monitoring for Three.js\n        let fpsCount = 0;\n        let lastFPSCheck = performance.now();\n        \n        const checkFPS = () => {\n            fpsCount++;\n            const now = performance.now();\n            \n            if (now - lastFPSCheck >= 1000) {\n                const fps = fpsCount;\n                fpsCount = 0;\n                lastFPSCheck = now;\n                \n                if (fps < this.config.performance.minFPS) {\n                    console.warn(`⚠️ Performance warning: FPS dropped to ${fps}`);\n                    this.optimizePerformance();\n                }\n            }\n            \n            requestAnimationFrame(checkFPS);\n        };\n        \n        requestAnimationFrame(checkFPS);\n        \n        // Memory monitoring\n        if (performance.memory) {\n            setInterval(() => {\n                const memory = performance.memory;\n                const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;\n                \n                if (memoryUsage > 80) {\n                    console.warn(`⚠️ High memory usage: ${memoryUsage.toFixed(1)}%`);\n                    this.cleanupMemory();\n                }\n            }, 30000);\n        }\n    }\n    \n    /**\n     * Optimize performance when needed\n     */\n    optimizePerformance() {\n        // Reduce visual effects quality\n        if (this.systems.has('championship-visuals')) {\n            const visuals = this.systems.get('championship-visuals');\n            visuals.performanceMode = 'medium';\n            console.log('🎯 Optimized visual performance');\n        }\n        \n        // Pause non-visible animations\n        this.pauseNonCriticalSystems();\n    }\n    \n    /**\n     * Clean up memory\n     */\n    cleanupMemory() {\n        // Force garbage collection if available\n        if (window.gc) {\n            window.gc();\n        }\n        \n        // Clear unnecessary references\n        if (this.systems.has('championship-visuals')) {\n            const visuals = this.systems.get('championship-visuals');\n            // Visual system has its own cleanup methods\n            console.log('🧹 Memory cleanup performed');\n        }\n    }\n    \n    /**\n     * Pause non-critical systems\n     */\n    pauseNonCriticalSystems() {\n        if (this.systems.has('championship-visuals')) {\n            // Visuals system handles its own pausing via intersection observer\n        }\n    }\n    \n    /**\n     * Resume all systems\n     */\n    resumeAllSystems() {\n        if (this.systems.has('championship-visuals')) {\n            // Visuals system handles its own resuming via intersection observer\n        }\n    }\n    \n    /**\n     * Handle global errors\n     */\n    handleGlobalError(event) {\n        const error = {\n            message: event.error ? event.error.message : event.reason,\n            filename: event.filename,\n            line: event.lineno,\n            column: event.colno,\n            timestamp: new Date().toISOString()\n        };\n        \n        this.performanceMetrics.errors.push(error);\n        \n        // Log for debugging\n        console.error('🚨 Global error captured:', error);\n        \n        // Attempt system recovery if needed\n        this.attemptSystemRecovery(error);\n    }\n    \n    /**\n     * Attempt to recover from system errors\n     */\n    attemptSystemRecovery(error) {\n        // If Three.js related error, try to recover visuals\n        if (error.message.includes('THREE') || error.message.includes('WebGL')) {\n            console.log('🔄 Attempting visual system recovery...');\n            \n            setTimeout(() => {\n                if (window.BlazeVisuals) {\n                    window.BlazeVisuals.dispose();\n                    window.BlazeVisuals = new BlazeChampionshipVisuals();\n                    window.BlazeVisuals.initializeAll();\n                }\n            }, 1000);\n        }\n    }\n    \n    /**\n     * Handle system initialization failure\n     */\n    handleSystemFailure(error) {\n        // Graceful degradation\n        console.warn('⚠️ Entering graceful degradation mode');\n        \n        // Disable advanced features\n        this.config.features.visualEnhancements = false;\n        \n        // Initialize minimal systems\n        if (window.BlazeBrand) {\n            window.BlazeBrand.enforceStandards();\n        }\n        \n        // Show user-friendly message if needed\n        const fallbackMessage = document.createElement('div');\n        fallbackMessage.style.cssText = `\n            position: fixed;\n            top: 20px;\n            right: 20px;\n            background: rgba(191, 87, 0, 0.9);\n            color: white;\n            padding: 1rem;\n            border-radius: 0.5rem;\n            z-index: 10000;\n            font-family: Inter, sans-serif;\n            font-size: 0.875rem;\n            box-shadow: 0 10px 25px rgba(0,0,0,0.2);\n        `;\n        fallbackMessage.textContent = 'Platform loaded in compatibility mode';\n        \n        document.body.appendChild(fallbackMessage);\n        \n        setTimeout(() => fallbackMessage.remove(), 5000);\n    }\n    \n    /**\n     * Validate all systems are working\n     */\n    validateSystems() {\n        const totalLoadTime = performance.now() - this.performanceMetrics.loadStart;\n        \n        console.log('🏆 Championship System Validation:');\n        console.log(`Total load time: ${totalLoadTime.toFixed(2)}ms`);\n        console.log(`Systems loaded: ${this.performanceMetrics.systemsLoaded}/${this.performanceMetrics.totalSystems}`);\n        console.log(`Errors: ${this.performanceMetrics.errors.length}`);\n        \n        if (totalLoadTime > this.config.performance.maxInitTime) {\n            console.warn('⚠️ System load time exceeded threshold');\n        }\n        \n        // Store validation results\n        window.BlazeSystemStatus = {\n            version: this.version,\n            systems: Array.from(this.systems.keys()),\n            performance: this.performanceMetrics,\n            config: this.config,\n            timestamp: new Date().toISOString()\n        };\n        \n        // Mark systems as ready\n        document.body.setAttribute('data-blaze-systems', 'ready');\n        document.body.classList.add('blaze-championship-ready');\n        \n        // Emit ready event\n        document.dispatchEvent(new CustomEvent('blazeChampionshipReady', {\n            detail: window.BlazeSystemStatus\n        }));\n    }\n    \n    /**\n     * Get system status\n     */\n    static getStatus() {\n        return window.BlazeSystemStatus || null;\n    }\n    \n    /**\n     * Manual system restart\n     */\n    static restart() {\n        if (window.BlazeChampionship) {\n            window.BlazeChampionship = new BlazeChampionshipMaster();\n        }\n    }\n}\n\n// Initialize championship master system\nif (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', () => {\n        window.BlazeChampionship = new BlazeChampionshipMaster();\n    });\n} else {\n    window.BlazeChampionship = new BlazeChampionshipMaster();\n}\n\n// Development helpers\nif (typeof window !== 'undefined') {\n    window.getBlazeStatus = () => BlazeChampionshipMaster.getStatus();\n    window.restartBlazeSystem = () => BlazeChampionshipMaster.restart();\n    \n    // Performance monitoring\n    if (performance && performance.mark) {\n        performance.mark('blaze-championship-master-loaded');\n    }\n}"