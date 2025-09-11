/**
 * Performance Optimization Suite
 * Championship-Grade Performance Monitoring and Optimization
 * Built for Blaze Intelligence - Where Performance Meets Championship Standards
 */

class PerformanceOptimizationSuite {
    constructor() {
        this.performanceMetrics = new Map();
        this.optimizationStrategies = new Map();
        this.monitoringIntervals = new Map();
        this.performanceThresholds = {
            fps: { target: 60, minimum: 30 },
            loadTime: { target: 2000, maximum: 5000 },
            memoryUsage: { target: 50, maximum: 100 }, // MB
            bundleSize: { target: 500, maximum: 1000 }, // KB
            lighthouse: { target: 90, minimum: 70 }
        };
        
        this.optimizationFeatures = {
            lazyLoading: true,
            imageOptimization: true,
            codesplitting: true,
            resourcePreloading: true,
            caching: true,
            compressionOptimization: true,
            animationThrottling: true,
            memoryManagement: true
        };
        
        this.init();
    }
    
    init() {
        this.startPerformanceMonitoring();
        this.implementLazyLoading();
        this.optimizeImages();
        this.setupResourcePreloading();
        this.implementCachingStrategies();
        this.setupAnimationOptimizations();
        this.createPerformanceMonitor();
        this.setupMemoryManagement();
        this.implementIntersectionObservers();
        this.optimizeThirdPartyScripts();
    }
    
    startPerformanceMonitoring() {
        // Web Vitals monitoring
        this.monitorCoreWebVitals();
        
        // Custom performance monitoring
        this.setupCustomMetrics();
        
        // FPS monitoring
        this.startFPSMonitoring();
        
        // Memory usage monitoring
        this.startMemoryMonitoring();
        
        // Network performance monitoring
        this.monitorNetworkPerformance();
        
        console.log('🏆 Championship Performance: Monitoring suite activated');
    }
    
    monitorCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.startTime < performance.now()) {
                    this.recordMetric('LCP', entry.startTime);
                    
                    if (entry.startTime > 2500) {
                        this.triggerOptimization('LCP', entry.startTime);
                    }
                }
            }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.recordMetric('FID', entry.processingStart - entry.startTime);
                
                if (entry.processingStart - entry.startTime > 100) {
                    this.triggerOptimization('FID', entry.processingStart - entry.startTime);
                }
            }
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    this.recordMetric('CLS', clsValue);
                    
                    if (clsValue > 0.1) {
                        this.triggerOptimization('CLS', clsValue);
                    }
                }
            }
        }).observe({ entryTypes: ['layout-shift'] });
    }
    
    setupCustomMetrics() {
        // Time to Interactive
        this.measureTTI();
        
        // Resource loading times
        this.monitorResourceTiming();
        
        // JavaScript execution time
        this.monitorJavaScriptPerformance();
        
        // Championship-specific metrics
        this.monitorChampionshipFeatures();
    }
    
    measureTTI() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigationEntry = performance.getEntriesByType('navigation')[0];
                const tti = navigationEntry.loadEventEnd;
                this.recordMetric('TTI', tti);
                
                if (tti > 5000) {
                    this.triggerOptimization('TTI', tti);
                }
            }, 0);
        });
    }
    
    monitorResourceTiming() {
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const duration = entry.responseEnd - entry.requestStart;
                
                if (entry.initiatorType === 'img' && duration > 1000) {
                    this.optimizeImageLoading(entry);
                } else if (entry.initiatorType === 'script' && duration > 2000) {
                    this.optimizeScriptLoading(entry);
                } else if (entry.initiatorType === 'xmlhttprequest' && duration > 3000) {
                    this.optimizeAPIRequests(entry);
                }
                
                this.recordMetric(`resource-${entry.initiatorType}`, duration);
            }
        }).observe({ entryTypes: ['resource'] });
    }
    
    monitorJavaScriptPerformance() {
        // Long task monitoring
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 50) {
                    console.warn('🚨 Championship Performance: Long task detected', entry);
                    this.optimizeLongTasks(entry);
                }
                this.recordMetric('long-task', entry.duration);
            }
        }).observe({ entryTypes: ['longtask'] });
        
        // Measure function execution times
        this.setupFunctionTiming();
    }
    
    setupFunctionTiming() {
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            const start = performance.now();
            return originalFetch(...args).then(response => {
                const duration = performance.now() - start;
                this.recordMetric('api-call', duration);
                return response;
            });
        };
    }
    
    monitorChampionshipFeatures() {
        // Monitor Three.js performance
        if (window.texasLegacySystem) {
            this.monitorThreeJSPerformance();
        }
        
        // Monitor dashboard performance
        if (window.championshipDashboard) {
            this.monitorDashboardPerformance();
        }
        
        // Monitor mobile interface performance
        if (window.mobileChampionshipInterface) {
            this.monitorMobilePerformance();
        }
    }
    
    monitorThreeJSPerformance() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const checkThreeJSPerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.recordMetric('threejs-fps', fps);
                
                if (fps < this.performanceThresholds.fps.minimum) {
                    this.optimizeThreeJS();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(checkThreeJSPerformance);
        };
        
        checkThreeJSPerformance();
    }
    
    startFPSMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.recordMetric('fps', fps);
                
                if (fps < this.performanceThresholds.fps.minimum) {
                    this.optimizeAnimations();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        measureFPS();
    }
    
    startMemoryMonitoring() {
        if (performance.memory) {
            const monitorMemory = () => {
                const memoryInfo = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                };
                
                this.recordMetric('memory-used', memoryInfo.used);
                this.recordMetric('memory-total', memoryInfo.total);
                
                if (memoryInfo.used > this.performanceThresholds.memoryUsage.maximum) {
                    this.triggerMemoryCleanup();
                }
                
                setTimeout(monitorMemory, 5000);
            };
            
            monitorMemory();
        }
    }
    
    monitorNetworkPerformance() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            this.recordMetric('network-type', connection.effectiveType);
            this.recordMetric('network-speed', connection.downlink);
            
            // Adapt content based on network conditions
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.enableLowQualityMode();
            }
            
            connection.addEventListener('change', () => {
                this.adaptToNetworkConditions(connection);
            });
        }
    }
    
    implementLazyLoading() {
        // Lazy load images
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        document.querySelectorAll('img[data-src], img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
        
        // Lazy load components
        this.setupComponentLazyLoading();
    }
    
    setupComponentLazyLoading() {
        const componentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Load championship components on demand
                    if (element.classList.contains('championship-card')) {
                        this.loadChampionshipCardContent(element);
                    } else if (element.classList.contains('analytics-chart')) {
                        this.loadChartContent(element);
                    } else if (element.classList.contains('live-stream-display')) {
                        this.loadLiveStreamContent(element);
                    }
                    
                    componentObserver.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '100px'
        });
        
        // Observe components for lazy loading
        document.querySelectorAll('.championship-card, .analytics-chart, .live-stream-display').forEach(el => {
            componentObserver.observe(el);
        });
    }
    
    optimizeImages() {
        // Image format optimization
        this.implementNextGenFormats();
        
        // Responsive images
        this.setupResponsiveImages();
        
        // Image compression
        this.compressImages();
        
        // Preload critical images
        this.preloadCriticalImages();
    }
    
    implementNextGenFormats() {
        // Check WebP support
        const supportsWebP = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
        };
        
        // Check AVIF support
        const supportsAVIF = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            return canvas.toDataURL('image/avif').indexOf('avif') !== -1;
        };
        
        if (supportsAVIF()) {
            this.preferredImageFormat = 'avif';
        } else if (supportsWebP()) {
            this.preferredImageFormat = 'webp';
        } else {
            this.preferredImageFormat = 'jpg';
        }
        
        console.log(`🏆 Image Optimization: Using ${this.preferredImageFormat} format`);
    }
    
    setupResourcePreloading() {
        // Preload critical CSS
        const criticalCSS = [
            '/public/css/blaze-professional.css',
            '/public/css/enhanced-visuals.css',
            '/public/css/professional-theme.css'
        ];
        
        criticalCSS.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = href;
            link.as = 'style';
            document.head.appendChild(link);
        });
        
        // Preload critical fonts
        this.preloadFonts();
        
        // Preload championship scripts
        this.preloadChampionshipScripts();
        
        // DNS prefetch for external resources
        this.setupDNSPrefetch();
    }
    
    preloadFonts() {
        const fonts = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Roboto+Mono:wght@400;700&display=swap'
        ];
        
        fonts.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = href;
            link.as = 'style';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    preloadChampionshipScripts() {
        const scripts = [
            '/js/texas-legacy-advanced-system.js',
            '/js/championship-dashboard-enhancements.js',
            '/js/real-time-championship-data.js'
        ];
        
        scripts.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'modulepreload';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    setupDNSPrefetch() {
        const domains = [
            'https://cdnjs.cloudflare.com',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdn.jsdelivr.net'
        ];
        
        domains.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = href;
            document.head.appendChild(link);
        });
    }
    
    implementCachingStrategies() {
        // Service worker for advanced caching
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
        
        // Browser cache optimization
        this.optimizeBrowserCache();
        
        // Local storage optimization
        this.setupLocalStorageCache();
    }
    
    registerServiceWorker() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('🏆 Championship SW: Registered', registration);
                
                // Update service worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            })
            .catch(error => {
                console.warn('🚨 Championship SW: Registration failed', error);
            });
    }
    
    setupAnimationOptimizations() {
        // Throttle animations based on performance
        this.throttleAnimations();
        
        // Optimize scroll animations
        this.optimizeScrollAnimations();
        
        // Reduce motion for low-end devices
        this.adaptAnimationsForDevice();
        
        // Pause animations when tab is inactive
        this.pauseAnimationsOnInactive();
    }
    
    throttleAnimations() {
        const currentFPS = this.performanceMetrics.get('fps') || 60;
        
        if (currentFPS < 30) {
            // Reduce animation complexity
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
            document.documentElement.style.setProperty('--animation-complexity', 'reduced');
            
            console.log('🏆 Championship Performance: Animations throttled for better FPS');
        }
    }
    
    optimizeScrollAnimations() {
        let ticking = false;
        
        const optimizedScrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Your scroll logic here
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }
    
    createPerformanceMonitor() {
        const monitor = document.createElement('div');
        monitor.id = 'championship-performance-monitor';
        monitor.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 34, 68, 0.95);
            color: #BF5700;
            padding: 12px;
            border-radius: 8px;
            font-family: 'Roboto Mono', monospace;
            font-size: 11px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid #BF570040;
            min-width: 200px;
            display: none;
        `;
        
        document.body.appendChild(monitor);
        
        // Toggle monitor with Ctrl+Shift+P
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                const isVisible = monitor.style.display !== 'none';
                monitor.style.display = isVisible ? 'none' : 'block';
                
                if (!isVisible) {
                    this.startMonitorUpdates(monitor);
                }
            }
        });
        
        this.performanceMonitor = monitor;
    }
    
    startMonitorUpdates(monitor) {
        const updateMonitor = () => {
            if (monitor.style.display === 'none') return;
            
            const metrics = this.getLatestMetrics();
            
            monitor.innerHTML = `
                <div style="color: #9BCBEB; font-weight: bold; margin-bottom: 8px;">🏆 Championship Performance</div>
                <div>FPS: <span style="color: ${metrics.fps > 50 ? '#00B2A9' : metrics.fps > 30 ? '#BF5700' : '#FF4444'}">${metrics.fps || 'N/A'}</span></div>
                <div>Memory: <span style="color: ${metrics.memory < 50 ? '#00B2A9' : metrics.memory < 100 ? '#BF5700' : '#FF4444'}">${metrics.memory || 'N/A'}MB</span></div>
                <div>LCP: <span style="color: ${metrics.lcp < 2500 ? '#00B2A9' : metrics.lcp < 4000 ? '#BF5700' : '#FF4444'}">${metrics.lcp || 'N/A'}ms</span></div>
                <div>CLS: <span style="color: ${metrics.cls < 0.1 ? '#00B2A9' : metrics.cls < 0.25 ? '#BF5700' : '#FF4444'}">${metrics.cls || 'N/A'}</span></div>
                <div style="margin-top: 8px; font-size: 10px; color: #9BCBEB;">Press Ctrl+Shift+P to toggle</div>
            `;
            
            setTimeout(updateMonitor, 1000);
        };
        
        updateMonitor();
    }
    
    getLatestMetrics() {
        return {
            fps: this.performanceMetrics.get('fps'),
            memory: this.performanceMetrics.get('memory-used'),
            lcp: this.performanceMetrics.get('LCP'),
            cls: this.performanceMetrics.get('CLS'),
            fid: this.performanceMetrics.get('FID')
        };
    }
    
    setupMemoryManagement() {
        // Automatic memory cleanup
        setInterval(() => {
            this.performMemoryCleanup();
        }, 30000); // Every 30 seconds
        
        // Clean up on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.performMemoryCleanup();
            }
        });
    }
    
    performMemoryCleanup() {
        // Clear unused event listeners
        this.cleanupEventListeners();
        
        // Clear expired cache entries
        this.cleanupCache();
        
        // Garbage collect Three.js objects
        if (window.texasLegacySystem && window.texasLegacySystem.scene) {
            this.cleanupThreeJS();
        }
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        console.log('🏆 Championship Performance: Memory cleanup completed');
    }
    
    cleanupEventListeners() {
        // Remove expired intervals
        this.monitoringIntervals.forEach((interval, key) => {
            if (!document.querySelector(`[data-monitor="${key}"]`)) {
                clearInterval(interval);
                this.monitoringIntervals.delete(key);
            }
        });
    }
    
    cleanupThreeJS() {
        if (window.texasLegacySystem && window.texasLegacySystem.scene) {
            const scene = window.texasLegacySystem.scene;
            
            // Dispose of unused materials and geometries
            scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
    }
    
    implementIntersectionObservers() {
        // Optimize intersection observers for performance
        const optimizedObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activateElement(entry.target);
                } else {
                    this.deactivateElement(entry.target);
                }
            });
        }, {
            threshold: [0, 0.25, 0.5, 0.75, 1],
            rootMargin: '10px'
        });
        
        // Observe championship elements
        document.querySelectorAll('.championship-card, .analytics-chart, .feature-card').forEach(el => {
            optimizedObserver.observe(el);
        });
    }
    
    activateElement(element) {
        // Activate animations and interactions
        element.classList.add('performance-active');
        
        // Load content if needed
        if (element.dataset.lazyContent) {
            this.loadElementContent(element);
        }
    }
    
    deactivateElement(element) {
        // Pause unnecessary animations
        element.classList.remove('performance-active');
        
        // Unload heavy content if out of view for too long
        setTimeout(() => {
            if (!element.classList.contains('performance-active')) {
                this.unloadElementContent(element);
            }
        }, 10000);
    }
    
    optimizeThirdPartyScripts() {
        // Delay non-critical third-party scripts
        this.delayThirdPartyScripts();
        
        // Monitor third-party performance impact
        this.monitorThirdPartyImpact();
        
        // Implement script loading strategies
        this.implementScriptLoadingStrategies();
    }
    
    delayThirdPartyScripts() {
        const thirdPartyScripts = document.querySelectorAll('script[src*="googleapis"], script[src*="cdnjs"], script[src*="jsdelivr"]');
        
        thirdPartyScripts.forEach(script => {
            if (script.dataset.delayed !== 'true') {
                script.dataset.delayed = 'true';
                const originalSrc = script.src;
                script.src = '';
                
                // Load after user interaction or page load
                const loadScript = () => {
                    script.src = originalSrc;
                    document.removeEventListener('scroll', loadScript);
                    document.removeEventListener('click', loadScript);
                    document.removeEventListener('touchstart', loadScript);
                };
                
                document.addEventListener('scroll', loadScript, { once: true, passive: true });
                document.addEventListener('click', loadScript, { once: true });
                document.addEventListener('touchstart', loadScript, { once: true, passive: true });
                
                // Fallback: load after 3 seconds
                setTimeout(loadScript, 3000);
            }
        });
    }
    
    recordMetric(name, value) {
        const timestamp = performance.now();
        
        if (!this.performanceMetrics.has(name)) {
            this.performanceMetrics.set(name, []);
        }
        
        const metrics = this.performanceMetrics.get(name);
        metrics.push({ value, timestamp });
        
        // Keep only recent metrics (last 100 entries)
        if (metrics.length > 100) {
            metrics.shift();
        }
        
        // Trigger alerts for critical metrics
        this.checkPerformanceAlerts(name, value);
    }
    
    checkPerformanceAlerts(metricName, value) {
        const alerts = {
            'fps': { min: 30, message: 'Low FPS detected' },
            'LCP': { max: 4000, message: 'Slow page loading' },
            'memory-used': { max: 100, message: 'High memory usage' },
            'CLS': { max: 0.25, message: 'Layout shift issues' }
        };
        
        const alert = alerts[metricName];
        if (alert) {
            if ((alert.min && value < alert.min) || (alert.max && value > alert.max)) {
                console.warn(`🚨 Championship Performance Alert: ${alert.message} (${metricName}: ${value})`);
                this.triggerOptimization(metricName, value);
            }
        }
    }
    
    triggerOptimization(metricName, value) {
        switch (metricName) {
            case 'fps':
                this.optimizeAnimations();
                break;
            case 'LCP':
                this.optimizeCriticalResourceLoading();
                break;
            case 'memory-used':
                this.triggerMemoryCleanup();
                break;
            case 'CLS':
                this.stabilizeLayout();
                break;
        }
    }
    
    optimizeAnimations() {
        // Reduce animation complexity
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
        
        // Disable non-essential animations
        const animations = document.getAnimations();
        animations.forEach(animation => {
            if (!animation.effect.target.classList.contains('critical-animation')) {
                animation.playbackRate = 0.5;
            }
        });
        
        console.log('🏆 Championship Performance: Animations optimized');
    }
    
    optimizeCriticalResourceLoading() {
        // Prioritize critical resources
        const criticalImages = document.querySelectorAll('img[data-critical="true"]');
        criticalImages.forEach(img => {
            img.loading = 'eager';
            img.fetchPriority = 'high';
        });
        
        console.log('🏆 Championship Performance: Critical resources prioritized');
    }
    
    stabilizeLayout() {
        // Fix layout shift issues
        const images = document.querySelectorAll('img:not([width]):not([height])');
        images.forEach(img => {
            if (img.naturalWidth && img.naturalHeight) {
                img.setAttribute('width', img.naturalWidth);
                img.setAttribute('height', img.naturalHeight);
            }
        });
        
        console.log('🏆 Championship Performance: Layout stabilized');
    }
    
    // Public API
    getPerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: {},
            status: 'championship',
            recommendations: []
        };
        
        // Calculate average metrics
        this.performanceMetrics.forEach((values, name) => {
            if (values.length > 0) {
                const recentValues = values.slice(-10); // Last 10 entries
                const average = recentValues.reduce((sum, entry) => sum + entry.value, 0) / recentValues.length;
                report.metrics[name] = Math.round(average * 100) / 100;
            }
        });
        
        // Generate recommendations
        this.generateRecommendations(report);
        
        return report;
    }
    
    generateRecommendations(report) {
        if (report.metrics.fps < 30) {
            report.recommendations.push('Consider reducing animation complexity');
        }
        if (report.metrics.LCP > 2500) {
            report.recommendations.push('Optimize critical resource loading');
        }
        if (report.metrics['memory-used'] > 50) {
            report.recommendations.push('Implement memory cleanup strategies');
        }
        if (report.metrics.CLS > 0.1) {
            report.recommendations.push('Set explicit dimensions for images and elements');
        }
    }
    
    exportPerformanceData() {
        const data = {
            metrics: Object.fromEntries(this.performanceMetrics),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `championship-performance-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    enableDebugMode() {
        console.log('🏆 Championship Performance: Debug mode enabled');
        
        // Show performance monitor
        if (this.performanceMonitor) {
            this.performanceMonitor.style.display = 'block';
            this.startMonitorUpdates(this.performanceMonitor);
        }
        
        // Enable verbose logging
        this.debugMode = true;
    }
}

// Initialize Performance Optimization Suite
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimization = new PerformanceOptimizationSuite();
    
    // Global performance access
    window.getPerformanceReport = () => {
        return window.performanceOptimization.getPerformanceReport();
    };
    
    window.exportPerformanceData = () => {
        return window.performanceOptimization.exportPerformanceData();
    };
    
    // Championship performance shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey) {
            switch (e.key) {
                case 'P':
                    // Toggle performance monitor
                    break;
                case 'D':
                    window.performanceOptimization.enableDebugMode();
                    break;
                case 'E':
                    window.performanceOptimization.exportPerformanceData();
                    break;
            }
        }
    });
    
    console.log('🏆 Championship Performance Optimization Suite: Activated');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizationSuite;
}