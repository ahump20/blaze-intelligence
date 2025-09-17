/**
 * Mobile Responsive Handler for RTI Multimodal Intelligence Dashboard
 * Optimizes RTI system performance for mobile devices and touch interfaces
 * Progressive Web App capabilities with offline functionality
 */

class MobileResponsiveHandler {
    constructor() {
        this.isMobile = this.detectMobileDevice();
        this.orientation = this.getOrientation();
        this.touchCapabilities = this.detectTouchCapabilities();
        this.performanceProfile = this.getPerformanceProfile();

        this.touchGestures = new Map();
        this.orientationLocked = false;
        this.mobileOptimizations = {
            reducedFrameRate: this.isMobile ? 30 : 60,
            lowPowerMode: false,
            adaptiveQuality: true,
            touchOptimizedUI: this.touchCapabilities.hasTouch
        };

        this.setupMobileHandlers();
        this.initializePWA();

        console.log('📱 Mobile Responsive Handler initialized');
        console.log(`Device Profile: ${this.isMobile ? 'Mobile' : 'Desktop'}, Touch: ${this.touchCapabilities.hasTouch}`);
    }

    /**
     * Detect mobile device
     */
    detectMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Mobile patterns
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
        const screenSize = window.screen.width < 768 || window.screen.height < 768;
        const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        return mobileRegex.test(userAgent) || (screenSize && touchDevice);
    }

    /**
     * Get device orientation
     */
    getOrientation() {
        if (screen.orientation) {
            return screen.orientation.angle;
        }
        return window.orientation || 0;
    }

    /**
     * Detect touch capabilities
     */
    detectTouchCapabilities() {
        return {
            hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            gestures: {
                pinchZoom: 'ongesturestart' in window,
                rotation: 'ongesturestart' in window,
                multiTouch: (navigator.maxTouchPoints || 0) > 1
            }
        };
    }

    /**
     * Get device performance profile
     */
    getPerformanceProfile() {
        const memory = navigator.deviceMemory || 4; // GB
        const cores = navigator.hardwareConcurrency || 4;
        const connection = navigator.connection;

        let profile = 'medium';

        // High performance: >8GB RAM, >4 cores, fast connection
        if (memory >= 8 && cores >= 6) {
            profile = 'high';
        }
        // Low performance: <4GB RAM, <=2 cores, slow connection
        else if (memory < 4 || cores <= 2) {
            profile = 'low';
        }

        // Network considerations
        if (connection) {
            if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
                profile = 'low';
            } else if (connection.effectiveType === '4g' && profile !== 'low') {
                profile = profile === 'medium' ? 'high' : profile;
            }
        }

        return {
            level: profile,
            memory: memory,
            cores: cores,
            connection: connection?.effectiveType || 'unknown',
            downlink: connection?.downlink || 0
        };
    }

    /**
     * Setup mobile-specific event handlers
     */
    setupMobileHandlers() {
        // Orientation change
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));

        // Touch events
        if (this.touchCapabilities.hasTouch) {
            this.setupTouchGestures();
        }

        // Performance monitoring
        this.setupPerformanceMonitoring();

        // Battery API
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                this.setupBatteryHandling(battery);
            });
        }

        // Visibility API for performance optimization
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Network status
        window.addEventListener('online', this.handleNetworkStatusChange.bind(this));
        window.addEventListener('offline', this.handleNetworkStatusChange.bind(this));
    }

    /**
     * Handle orientation changes
     */
    handleOrientationChange() {
        setTimeout(() => {
            this.orientation = this.getOrientation();
            console.log(`📱 Orientation changed: ${this.orientation}°`);

            // Adjust RTI settings based on orientation
            this.optimizeForOrientation();

            // Trigger layout adjustments
            this.adjustLayoutForOrientation();

            // Update camera constraints if active
            this.updateCameraConstraints();

        }, 100); // Small delay to ensure orientation is updated
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Debounce resize handling
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.adjustUIForScreenSize();
            this.optimizeRTIForScreenSize();
        }, 250);
    }

    /**
     * Setup touch gestures
     */
    setupTouchGestures() {
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        let lastTouch = null;

        // Touch start
        document.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            lastTouch = e.touches[0];

            // Prevent zoom on double-tap for specific elements
            if (e.target.closest('.rti-dashboard')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Touch end - detect gestures
        document.addEventListener('touchend', (e) => {
            if (!lastTouch) return;

            const touchDuration = Date.now() - touchStartTime;
            const touchEndPos = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY
            };

            const distance = Math.sqrt(
                Math.pow(touchEndPos.x - touchStartPos.x, 2) +
                Math.pow(touchEndPos.y - touchStartPos.y, 2)
            );

            // Tap gesture
            if (touchDuration < 200 && distance < 10) {
                this.handleTap(touchEndPos);
            }
            // Swipe gesture
            else if (distance > 50) {
                this.handleSwipe(touchStartPos, touchEndPos, touchDuration);
            }

            lastTouch = null;
        });

        // Pinch/zoom gesture for mobile RTI control
        if (this.touchCapabilities.gestures.pinchZoom) {
            this.setupPinchZoom();
        }
    }

    /**
     * Setup pinch/zoom gestures
     */
    setupPinchZoom() {
        let initialDistance = 0;
        let initialScale = 1;

        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
            initialScale = e.scale;
        });

        document.addEventListener('gesturechange', (e) => {
            e.preventDefault();
            const currentScale = e.scale;
            const scaleFactor = currentScale / initialScale;

            // Adjust RTI visualization scale
            this.adjustRTIVisualizationScale(scaleFactor);
        });

        document.addEventListener('gestureend', (e) => {
            e.preventDefault();
            // Finalize scale adjustments
        });
    }

    /**
     * Handle tap gestures
     */
    handleTap(position) {
        // Custom tap handling for RTI interface elements
        const element = document.elementFromPoint(position.x, position.y);

        if (element.closest('.pattern-feed-item')) {
            this.expandPatternDetails(element.closest('.pattern-feed-item'));
        } else if (element.closest('.latency-display')) {
            this.toggleLatencyDetails();
        }
    }

    /**
     * Handle swipe gestures
     */
    handleSwipe(start, end, duration) {
        const deltaX = end.x - start.x;
        const deltaY = end.y - start.y;

        // Determine swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                this.handleSwipeRight();
            } else {
                this.handleSwipeLeft();
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                this.handleSwipeDown();
            } else {
                this.handleSwipeUp();
            }
        }
    }

    /**
     * Swipe gesture handlers
     */
    handleSwipeLeft() {
        // Navigate to next RTI panel or collapse current
        this.navigateRTIPanels('next');
    }

    handleSwipeRight() {
        // Navigate to previous RTI panel or expand current
        this.navigateRTIPanels('previous');
    }

    handleSwipeUp() {
        // Expand performance metrics
        this.togglePerformanceMetrics(true);
    }

    handleSwipeDown() {
        // Collapse performance metrics
        this.togglePerformanceMetrics(false);
    }

    /**
     * Optimize RTI for current orientation
     */
    optimizeForOrientation() {
        const isLandscape = Math.abs(this.orientation) === 90;

        if (isLandscape) {
            // Landscape optimizations
            this.mobileOptimizations.videoLayout = 'side-by-side';
            this.mobileOptimizations.hudPosition = 'overlay';
        } else {
            // Portrait optimizations
            this.mobileOptimizations.videoLayout = 'stacked';
            this.mobileOptimizations.hudPosition = 'bottom';
        }

        // Apply optimizations to RTI system
        this.applyRTIOptimizations();
    }

    /**
     * Adjust layout for orientation
     */
    adjustLayoutForOrientation() {
        const dashboard = document.querySelector('.multimodal-dashboard');
        if (!dashboard) return;

        const isLandscape = Math.abs(this.orientation) === 90;

        if (isLandscape) {
            dashboard.classList.add('landscape-mode');
            dashboard.classList.remove('portrait-mode');
        } else {
            dashboard.classList.add('portrait-mode');
            dashboard.classList.remove('landscape-mode');
        }
    }

    /**
     * Update camera constraints for mobile
     */
    updateCameraConstraints() {
        if (!window.videoStream) return;

        const isLandscape = Math.abs(this.orientation) === 90;
        const constraints = {
            width: { ideal: isLandscape ? 1280 : 720 },
            height: { ideal: isLandscape ? 720 : 1280 },
            frameRate: { ideal: this.mobileOptimizations.reducedFrameRate }
        };

        // Apply new constraints
        const videoTrack = window.videoStream.getVideoTracks()[0];
        if (videoTrack && videoTrack.applyConstraints) {
            videoTrack.applyConstraints(constraints).catch(console.error);
        }
    }

    /**
     * Setup performance monitoring for mobile
     */
    setupPerformanceMonitoring() {
        // Monitor frame drops and adjust quality
        setInterval(() => {
            this.checkPerformanceMetrics();
        }, 5000);

        // Memory pressure monitoring
        if ('memory' in performance) {
            setInterval(() => {
                this.checkMemoryUsage();
            }, 10000);
        }
    }

    /**
     * Check performance metrics and adapt
     */
    checkPerformanceMetrics() {
        if (!window.rtiSystem?.fusionEngine) return;

        const metrics = window.rtiSystem.fusionEngine.getMetrics();
        const avgLatency = metrics.totalLatency || 0;

        // Adapt quality based on performance
        if (avgLatency > 120) {
            this.enableLowPowerMode();
        } else if (avgLatency < 80 && this.mobileOptimizations.lowPowerMode) {
            this.disableLowPowerMode();
        }
    }

    /**
     * Check memory usage
     */
    checkMemoryUsage() {
        if (!performance.memory) return;

        const used = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        const total = performance.memory.totalJSHeapSize / 1024 / 1024;
        const limit = performance.memory.jsHeapSizeLimit / 1024 / 1024;

        const usage = used / limit;

        if (usage > 0.8) {
            console.warn('🚨 High memory usage detected, optimizing...');
            this.optimizeMemoryUsage();
        }
    }

    /**
     * Setup battery handling
     */
    setupBatteryHandling(battery) {
        const updateBatteryInfo = () => {
            const level = battery.level;
            const charging = battery.charging;

            // Enable power saving when battery is low
            if (level < 0.2 && !charging) {
                this.enableLowPowerMode();
            } else if (level > 0.5 || charging) {
                this.disableLowPowerMode();
            }
        };

        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);

        updateBatteryInfo(); // Initial check
    }

    /**
     * Handle visibility changes for performance optimization
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - reduce processing
            this.reduceBackgroundProcessing();
        } else {
            // Page is visible - resume full processing
            this.resumeFullProcessing();
        }
    }

    /**
     * Handle network status changes
     */
    handleNetworkStatusChange() {
        const isOnline = navigator.onLine;

        if (isOnline) {
            console.log('📶 Network connection restored');
            this.enableOnlineFeatures();
        } else {
            console.log('📵 Network connection lost - switching to offline mode');
            this.enableOfflineMode();
        }
    }

    /**
     * Performance optimization methods
     */
    enableLowPowerMode() {
        if (this.mobileOptimizations.lowPowerMode) return;

        this.mobileOptimizations.lowPowerMode = true;
        this.mobileOptimizations.reducedFrameRate = Math.max(this.mobileOptimizations.reducedFrameRate / 2, 15);

        // Apply to RTI system
        if (window.rtiSystem?.fusionEngine) {
            // Reduce fusion poll rate
            // Note: This would require modifying the RTI system to support dynamic rate changes
        }

        console.log('🔋 Low power mode enabled');
    }

    disableLowPowerMode() {
        if (!this.mobileOptimizations.lowPowerMode) return;

        this.mobileOptimizations.lowPowerMode = false;
        this.mobileOptimizations.reducedFrameRate = this.isMobile ? 30 : 60;

        console.log('⚡ Low power mode disabled');
    }

    optimizeMemoryUsage() {
        // Clear old detections
        if (window.detections && window.detections.length > 20) {
            window.detections = window.detections.slice(-10);
        }

        // Clear RTI buffers if they exist
        if (window.rtiSystem?.fusionEngine) {
            // This would require implementing buffer cleanup in the RTI system
        }

        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    reduceBackgroundProcessing() {
        // Reduce RTI processing frequency when page is hidden
        this.mobileOptimizations.backgroundProcessing = true;
    }

    resumeFullProcessing() {
        // Resume full RTI processing when page is visible
        this.mobileOptimizations.backgroundProcessing = false;
    }

    enableOfflineMode() {
        // Enable offline capabilities
        this.mobileOptimizations.offlineMode = true;

        // Cache current state
        this.cacheCurrentState();

        // Show offline indicator
        this.showOfflineIndicator();
    }

    enableOnlineFeatures() {
        // Re-enable online features
        this.mobileOptimizations.offlineMode = false;

        // Sync cached data if needed
        this.syncCachedData();

        // Hide offline indicator
        this.hideOfflineIndicator();
    }

    /**
     * PWA functionality
     */
    initializePWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }

        // Handle install prompt
        this.setupInstallPrompt();

        // Setup push notifications
        this.setupPushNotifications();
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('📱 Service Worker registered successfully');

            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateAvailable();
                    }
                });
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton();
        });

        // Handle install button click
        document.addEventListener('click', (e) => {
            if (e.target.matches('.install-pwa-btn')) {
                e.preventDefault();
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('📱 PWA installed');
                        }
                        deferredPrompt = null;
                        this.hideInstallButton();
                    });
                }
            }
        });
    }

    setupPushNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            // Request permission for notifications
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('🔔 Notification permission granted');
                }
            });
        }
    }

    /**
     * UI adjustment methods
     */
    adjustUIForScreenSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Apply appropriate CSS classes based on screen size
        const dashboard = document.querySelector('.multimodal-dashboard');
        if (!dashboard) return;

        dashboard.classList.toggle('small-screen', width < 480);
        dashboard.classList.toggle('medium-screen', width >= 480 && width < 768);
        dashboard.classList.toggle('large-screen', width >= 768);
    }

    optimizeRTIForScreenSize() {
        const width = window.innerWidth;

        // Adjust RTI visualization complexity based on screen size
        if (width < 480) {
            this.mobileOptimizations.visualizationComplexity = 'simple';
        } else if (width < 768) {
            this.mobileOptimizations.visualizationComplexity = 'medium';
        } else {
            this.mobileOptimizations.visualizationComplexity = 'full';
        }

        this.applyVisualizationOptimizations();
    }

    applyRTIOptimizations() {
        // Apply collected optimizations to RTI system
        if (window.rtiSystem) {
            // This would require the RTI system to accept dynamic configuration
            console.log('📱 Applied mobile RTI optimizations:', this.mobileOptimizations);
        }
    }

    applyVisualizationOptimizations() {
        // Adjust Three.js complexity, particle counts, etc.
        if (window.scene) {
            // Reduce particle count on smaller screens
            const particleCount = this.mobileOptimizations.visualizationComplexity === 'simple' ? 50 :
                                this.mobileOptimizations.visualizationComplexity === 'medium' ? 100 : 200;

            // Apply to existing particle systems
        }
    }

    /**
     * Utility methods for UI updates
     */
    showInstallButton() {
        // Show PWA install button
        const button = document.querySelector('.install-pwa-btn');
        if (button) {
            button.style.display = 'block';
        }
    }

    hideInstallButton() {
        const button = document.querySelector('.install-pwa-btn');
        if (button) {
            button.style.display = 'none';
        }
    }

    showUpdateAvailable() {
        // Show update notification
        console.log('📱 App update available');
    }

    showOfflineIndicator() {
        // Show offline mode indicator
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
            indicator.style.display = 'block';
        }
    }

    hideOfflineIndicator() {
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    cacheCurrentState() {
        // Cache current RTI state for offline use
        if ('localStorage' in window) {
            const state = {
                timestamp: Date.now(),
                // Add relevant state data
            };
            localStorage.setItem('rti-offline-state', JSON.stringify(state));
        }
    }

    syncCachedData() {
        // Sync cached data when back online
        if ('localStorage' in window) {
            const cached = localStorage.getItem('rti-offline-state');
            if (cached) {
                // Process cached data
                console.log('📡 Syncing cached RTI data');
            }
        }
    }

    /**
     * Get current mobile optimization settings
     */
    getOptimizations() {
        return {
            ...this.mobileOptimizations,
            deviceInfo: {
                isMobile: this.isMobile,
                orientation: this.orientation,
                touchCapabilities: this.touchCapabilities,
                performanceProfile: this.performanceProfile
            }
        };
    }
}

// Auto-initialize on mobile devices
let mobileHandler;
if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.screen.width < 768) {
    mobileHandler = new MobileResponsiveHandler();
}

// Export for global use
window.MobileResponsiveHandler = MobileResponsiveHandler;
window.mobileHandler = mobileHandler;

console.log('📱 Mobile Responsive Handler module loaded');