/**
 * Mobile Optimization System - Championship Mobile Experience
 * By Austin Humphrey - Deep South Sports Authority
 * Delivers optimal mobile and touch device experience
 */

class MobileOptimizationSystem {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        this.isTouch = 'ontouchstart' in window;
        this.orientation = window.screen.orientation || { angle: 0 };
        
        this.optimizations = {
            touchEnhancements: false,
            performanceOptimizations: false,
            responsiveAdjustments: false,
            navigationOptimizations: false
        };
        
        console.log('🏆 Austin Humphrey Mobile Optimization - Championship Mobile Experience');
        this.initializeOptimizations();
    }
    
    initializeOptimizations() {
        this.detectDeviceCapabilities();
        this.setupViewportOptimization();
        this.enhanceTouchInteractions();
        this.optimizePerformanceForMobile();
        this.setupResponsiveAdjustments();
        this.optimizeNavigation();
        this.setupOrientationHandling();
        this.addMobileSpecificFeatures();
        
        // Monitor for changes
        this.setupEventListeners();
        
        console.log(`📱 Mobile optimizations applied for ${this.getDeviceType()}`);
    }
    
    detectDeviceCapabilities() {
        // Device type detection
        this.deviceInfo = {
            type: this.getDeviceType(),
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isTouch: this.isTouch,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            pixelRatio: window.devicePixelRatio || 1,
            connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 'unknown'
        };
        
        // Performance capabilities
        this.performanceProfile = this.assessPerformanceProfile();
        
        console.log('📊 Device capabilities detected:', this.deviceInfo);
    }
    
    getDeviceType() {
        if (this.isMobile) return 'mobile';
        if (this.isTablet) return 'tablet';
        return 'desktop';
    }
    
    assessPerformanceProfile() {
        const profile = {
            level: 'high', // high, medium, low
            supportsAdvancedAnimations: true,
            supportsHighResGraphics: true,
            recommendedChartPoints: 50
        };
        
        // Adjust based on device capabilities
        if (this.deviceInfo.hardwareConcurrency < 4 || this.deviceInfo.memory < 4) {
            profile.level = 'medium';
            profile.recommendedChartPoints = 30;
        }
        
        if (this.isMobile && this.deviceInfo.pixelRatio < 2) {
            profile.level = 'low';
            profile.supportsAdvancedAnimations = false;
            profile.supportsHighResGraphics = false;
            profile.recommendedChartPoints = 20;
        }
        
        // Check connection speed
        if (this.deviceInfo.connection && this.deviceInfo.connection.effectiveType) {
            const connectionType = this.deviceInfo.connection.effectiveType;
            if (connectionType === 'slow-2g' || connectionType === '2g') {
                profile.level = 'low';
                profile.recommendedChartPoints = 15;
            }
        }
        
        return profile;
    }
    
    setupViewportOptimization() {
        // Ensure proper viewport configuration
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
            );
        }
        
        // Add viewport height handling for mobile browsers
        this.updateViewportHeight();
        
        this.optimizations.responsiveAdjustments = true;
    }
    
    updateViewportHeight() {
        // Handle mobile browser viewport height issues
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.documentElement.style.setProperty('--mobile-vh', `${window.innerHeight}px`);
    }
    
    enhanceTouchInteractions() {
        if (!this.isTouch) return;
        
        // Add touch-specific styles
        document.body.classList.add('touch-device');
        
        // Enhance touch targets
        this.optimizeTouchTargets();
        
        // Add touch gesture support
        this.setupTouchGestures();
        
        // Optimize AI consciousness sliders for touch
        this.optimizeConsciousnessSliders();
        
        // Enhanced button interactions
        this.enhanceButtonTouchFeedback();
        
        this.optimizations.touchEnhancements = true;
        console.log('✅ Touch interactions enhanced');
    }
    
    optimizeTouchTargets() {
        // Ensure minimum touch target size (44px x 44px)
        const style = document.createElement('style');
        style.textContent = `
            .touch-device button,
            .touch-device .btn,
            .touch-device .consciousness-slider,
            .touch-device .nav-link,
            .touch-device .preset-btn {
                min-height: 44px !important;
                min-width: 44px !important;
                padding: 12px 16px !important;
            }
            
            .touch-device .consciousness-slider {
                height: 8px !important;
                border-radius: 4px !important;
            }
            
            .touch-device .consciousness-slider::-webkit-slider-thumb {
                width: 24px !important;
                height: 24px !important;
                border-radius: 50% !important;
            }
            
            .touch-device .nav-menu {
                gap: 1rem !important;
            }
            
            .touch-device .preset-buttons {
                gap: 1rem !important;
            }
            
            .touch-device .effect-indicator {
                padding: 1rem !important;
                min-height: 60px !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupTouchGestures() {
        // Add swipe gesture support for navigation
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Detect swipe gestures
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            }
        }, { passive: true });
    }
    
    handleSwipeRight() {
        // Open mobile menu or navigate back
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('active')) {
            mobileMenu.classList.add('active');
        }
    }
    
    handleSwipeLeft() {
        // Close mobile menu
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
        }
    }
    
    optimizeConsciousnessSliders() {
        // Enhanced consciousness slider handling for mobile
        const sliders = document.querySelectorAll('.consciousness-slider');
        
        sliders.forEach(slider => {
            // Add haptic feedback if supported
            slider.addEventListener('input', (e) => {
                if (navigator.vibrate) {
                    navigator.vibrate(10); // Subtle haptic feedback
                }
                
                // Visual feedback for touch
                slider.classList.add('slider-active');
                setTimeout(() => {
                    slider.classList.remove('slider-active');
                }, 150);
            });
            
            // Improve touch handling
            slider.addEventListener('touchstart', (e) => {
                e.preventDefault();
                slider.focus();
            }, { passive: false });
        });
    }
    
    enhanceButtonTouchFeedback() {
        // Add touch feedback to all interactive elements
        const interactiveElements = document.querySelectorAll('button, .btn, .preset-btn, .nav-link');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.classList.add('touch-active');
            }, { passive: true });
            
            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.classList.remove('touch-active');
                }, 150);
            }, { passive: true });
        });
    }
    
    optimizePerformanceForMobile() {
        // Reduce animations on low-performance devices
        if (this.performanceProfile.level === 'low') {
            this.disableExpensiveAnimations();
        }
        
        // Optimize chart rendering
        this.optimizeChartsForMobile();
        
        // Lazy load images and videos
        this.setupLazyLoading();
        
        // Optimize Three.js for mobile
        this.optimizeThreeJSForMobile();
        
        this.optimizations.performanceOptimizations = true;
        console.log('✅ Performance optimized for mobile');
    }
    
    disableExpensiveAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            .low-performance * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            
            .low-performance .neural-mesh {
                animation: none !important;
                opacity: 0.2 !important;
            }
            
            .low-performance .consciousness-overlay {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        document.body.classList.add('low-performance');
    }
    
    optimizeChartsForMobile() {
        // Configure chart performance settings for mobile
        if (window.dashboardLoader) {
            window.dashboardLoader.mobileConfig = {
                maxDataPoints: this.performanceProfile.recommendedChartPoints,
                animationDuration: this.performanceProfile.level === 'low' ? 0 : 300,
                responsiveUpdate: true
            };
        }
    }
    
    setupLazyLoading() {
        // Implement intersection observer for lazy loading
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
    
    optimizeThreeJSForMobile() {
        // Optimize Three.js rendering for mobile devices
        if (window.threeManager) {
            const mobileSettings = {
                pixelRatio: Math.min(window.devicePixelRatio, 2),
                shadowMap: this.performanceProfile.level === 'high',
                antialias: this.performanceProfile.level !== 'low',
                powerPreference: this.isMobile ? 'low-power' : 'high-performance'
            };
            
            window.threeManager.mobileOptimizations = mobileSettings;
        }
    }
    
    setupResponsiveAdjustments() {
        // Dynamic font size adjustments
        this.adjustTypographyForMobile();
        
        // Optimize spacing and layout
        this.adjustLayoutForMobile();
        
        // Optimize form interactions
        this.optimizeFormsForMobile();
        
        console.log('✅ Responsive adjustments applied');
    }
    
    adjustTypographyForMobile() {
        if (this.isMobile) {
            const style = document.createElement('style');
            style.textContent = `
                .mobile-optimized h1 { font-size: 2rem !important; }
                .mobile-optimized h2 { font-size: 1.5rem !important; }
                .mobile-optimized h3 { font-size: 1.25rem !important; }
                .mobile-optimized p { font-size: 1rem !important; line-height: 1.6 !important; }
                
                .mobile-optimized .hero-title { 
                    font-size: 2.5rem !important; 
                    line-height: 1.2 !important; 
                }
                
                .mobile-optimized .austin-expertise h3 { 
                    font-size: 1.5rem !important; 
                }
                
                .mobile-optimized .metric-value { 
                    font-size: 1.2rem !important; 
                }
            `;
            document.head.appendChild(style);
            document.body.classList.add('mobile-optimized');
        }
    }
    
    adjustLayoutForMobile() {
        if (this.isMobile) {
            // Adjust consciousness panel for mobile
            const consciousnessPanel = document.querySelector('.ai-consciousness-panel');
            if (consciousnessPanel) {
                consciousnessPanel.style.position = 'relative';
                consciousnessPanel.style.margin = '1rem';
                consciousnessPanel.style.maxWidth = 'none';
            }
            
            // Optimize grid layouts
            const grids = document.querySelectorAll('.grid, .features-grid, .metrics-grid');
            grids.forEach(grid => {
                grid.style.gridTemplateColumns = '1fr';
                grid.style.gap = '1rem';
            });
        }
    }
    
    optimizeFormsForMobile() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Prevent zoom on focus for iOS
            input.addEventListener('focus', () => {
                if (this.isMobile) {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 
                            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                        );
                    }
                }
            });
            
            input.addEventListener('blur', () => {
                if (this.isMobile) {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 
                            'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
                        );
                    }
                }
            });
        });
    }
    
    optimizeNavigation() {
        this.createMobileMenu();
        this.optimizeNavigationInteractions();
        this.addScrollToTopFunctionality();
        
        this.optimizations.navigationOptimizations = true;
        console.log('✅ Navigation optimized for mobile');
    }
    
    createMobileMenu() {
        if (!this.isMobile) return;
        
        // Check if mobile menu already exists
        let mobileMenu = document.querySelector('.mobile-menu-overlay');
        if (mobileMenu) return;
        
        // Create mobile menu overlay
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu-overlay';
        mobileMenu.innerHTML = `
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <h3>Deep South Sports Authority</h3>
                    <button class="mobile-menu-close">&times;</button>
                </div>
                <nav class="mobile-nav">
                    <a href="/" class="mobile-nav-link">Home</a>
                    <a href="/dashboard" class="mobile-nav-link">Dashboard</a>
                    <a href="/digital-combine" class="mobile-nav-link">Digital Combine</a>
                    <a href="/nil" class="mobile-nav-link">NIL Calculator</a>
                    <a href="/pressure-dashboard" class="mobile-nav-link">Pressure Analytics</a>
                    <a href="/about-austin" class="mobile-nav-link">About Austin</a>
                    <a href="/pricing" class="mobile-nav-link">Pricing</a>
                </nav>
                <div class="mobile-menu-footer">
                    <p>Championship-Level AI</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(mobileMenu);
        
        // Add mobile menu styles
        const style = document.createElement('style');
        style.textContent = `
            .mobile-menu-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(10, 25, 47, 0.98);
                backdrop-filter: blur(20px);
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .mobile-menu-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .mobile-menu-content {
                padding: 2rem;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .mobile-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid rgba(191, 87, 0, 0.3);
            }
            
            .mobile-menu-header h3 {
                color: #BF5700;
                margin: 0;
            }
            
            .mobile-menu-close {
                background: none;
                border: none;
                color: #E6F1FF;
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .mobile-nav {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .mobile-nav-link {
                color: #E6F1FF;
                text-decoration: none;
                padding: 1rem;
                border-radius: 12px;
                border: 1px solid rgba(136, 146, 176, 0.2);
                transition: all 0.3s ease;
                font-size: 1.1rem;
                font-weight: 600;
            }
            
            .mobile-nav-link:hover,
            .mobile-nav-link:active {
                background: rgba(191, 87, 0, 0.2);
                border-color: rgba(191, 87, 0, 0.5);
                transform: translateX(10px);
            }
            
            .mobile-menu-footer {
                text-align: center;
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid rgba(136, 146, 176, 0.2);
                color: #8892B0;
            }
        `;
        document.head.appendChild(style);
        
        // Add event listeners
        const closeBtn = mobileMenu.querySelector('.mobile-menu-close');
        closeBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
        
        // Close on outside click
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                mobileMenu.classList.remove('active');
            }
        });
        
        // Close on nav link click
        const navLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => {
                    mobileMenu.classList.remove('active');
                }, 300);
            });
        });
    }
    
    optimizeNavigationInteractions() {
        // Add mobile hamburger menu trigger
        const navToggle = document.querySelector('.nav-toggle') || this.createNavToggle();
        
        navToggle.addEventListener('click', () => {
            const mobileMenu = document.querySelector('.mobile-menu-overlay');
            if (mobileMenu) {
                mobileMenu.classList.toggle('active');
            }
        });
    }
    
    createNavToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'nav-toggle mobile-only';
        toggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        // Add to navigation
        const nav = document.querySelector('.nav-content, .nav-header');
        if (nav) {
            nav.appendChild(toggle);
        }
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .nav-toggle {
                display: none;
                flex-direction: column;
                justify-content: space-around;
                width: 30px;
                height: 30px;
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 0;
            }
            
            .nav-toggle span {
                width: 100%;
                height: 3px;
                background: #E6F1FF;
                border-radius: 2px;
                transition: all 0.3s ease;
            }
            
            @media (max-width: 768px) {
                .nav-toggle {
                    display: flex;
                }
                
                .mobile-only {
                    display: block !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        return toggle;
    }
    
    addScrollToTopFunctionality() {
        // Create scroll-to-top button
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        
        document.body.appendChild(scrollBtn);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .scroll-to-top {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #BF5700, #FFB81C);
                color: #0A192F;
                border: none;
                border-radius: 50%;
                font-size: 1.2rem;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
                box-shadow: 0 4px 20px rgba(191, 87, 0, 0.3);
            }
            
            .scroll-to-top.visible {
                opacity: 1;
                visibility: visible;
            }
            
            .scroll-to-top:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 25px rgba(191, 87, 0, 0.4);
            }
            
            .scroll-to-top:active {
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);
        
        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top functionality
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    setupOrientationHandling() {
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateViewportHeight();
                this.handleOrientationChange();
            }, 100);
        });
        
        // Also handle resize for desktop
        window.addEventListener('resize', () => {
            this.updateViewportHeight();
            this.handleResize();
        });
    }
    
    handleOrientationChange() {
        // Adjust layout for orientation
        const orientation = window.screen.orientation || { angle: 0 };
        document.body.classList.toggle('landscape', Math.abs(orientation.angle) === 90);
        
        // Notify other systems
        window.dispatchEvent(new CustomEvent('mobile-orientation-changed', {
            detail: { orientation: orientation.angle }
        }));
    }
    
    handleResize() {
        // Update device type on resize
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        
        // Re-apply optimizations if device type changed
        if (wasMobile !== this.isMobile) {
            this.initializeOptimizations();
        }
    }
    
    addMobileSpecificFeatures() {
        // Add pull-to-refresh if supported
        this.setupPullToRefresh();
        
        // Add haptic feedback
        this.setupHapticFeedback();
        
        // Optimize video controls
        this.optimizeVideoControls();
        
        console.log('✅ Mobile-specific features added');
    }
    
    setupPullToRefresh() {
        if (!this.isMobile) return;
        
        let startY = 0;
        let pullDistance = 0;
        const threshold = 100;
        
        document.addEventListener('touchstart', (e) => {
            if (window.pageYOffset === 0) {
                startY = e.touches[0].pageY;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (window.pageYOffset === 0 && startY) {
                pullDistance = e.touches[0].pageY - startY;
                
                if (pullDistance > 0) {
                    // Add visual feedback for pull-to-refresh
                    const pullIndicator = document.querySelector('.pull-to-refresh') || this.createPullIndicator();
                    const progress = Math.min(pullDistance / threshold, 1);
                    
                    pullIndicator.style.opacity = progress;
                    pullIndicator.style.transform = `translateY(${pullDistance * 0.5}px)`;
                    
                    if (progress >= 1) {
                        pullIndicator.classList.add('ready');
                    } else {
                        pullIndicator.classList.remove('ready');
                    }
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (pullDistance >= threshold) {
                window.location.reload();
            }
            
            // Reset
            startY = 0;
            pullDistance = 0;
            
            const pullIndicator = document.querySelector('.pull-to-refresh');
            if (pullIndicator) {
                pullIndicator.style.opacity = '0';
                pullIndicator.style.transform = 'translateY(-50px)';
                pullIndicator.classList.remove('ready');
            }
        }, { passive: true });
    }
    
    createPullIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'pull-to-refresh';
        indicator.innerHTML = '<i class="fas fa-sync-alt"></i><span>Pull to refresh</span>';
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .pull-to-refresh {
                position: fixed;
                top: -50px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(191, 87, 0, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10000;
            }
            
            .pull-to-refresh.ready {
                background: rgba(16, 185, 129, 0.9);
            }
            
            .pull-to-refresh.ready i {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(indicator);
        return indicator;
    }
    
    setupHapticFeedback() {
        if (!navigator.vibrate) return;
        
        // Add haptic feedback to key interactions
        this.addHapticToElements('.btn, button, .preset-btn', [10]);
        this.addHapticToElements('.consciousness-slider', [5]);
        this.addHapticToElements('.nav-link', [8]);
    }
    
    addHapticToElements(selector, pattern) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener('touchstart', () => {
                navigator.vibrate(pattern);
            }, { passive: true });
        });
    }
    
    optimizeVideoControls() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            // Optimize for mobile playback
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            
            // Add mobile-friendly controls
            if (this.isMobile) {
                video.controls = true;
                video.preload = 'metadata'; // Save bandwidth
            }
        });
    }
    
    setupEventListeners() {
        // Performance monitoring
        window.addEventListener('load', () => {
            this.reportPerformanceMetrics();
        });
        
        // Network status monitoring
        window.addEventListener('online', () => {
            this.handleNetworkChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleNetworkChange(false);
        });
        
        // Visibility change handling
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }
    
    reportPerformanceMetrics() {
        if (performance.timing) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`📊 Mobile load time: ${loadTime}ms on ${this.getDeviceType()}`);
            
            // Report to analytics if available
            if (window.analytics) {
                window.analytics.track('mobile_performance', {
                    device_type: this.getDeviceType(),
                    load_time: loadTime,
                    performance_profile: this.performanceProfile.level
                });
            }
        }
    }
    
    handleNetworkChange(isOnline) {
        console.log(`📱 Network status: ${isOnline ? 'online' : 'offline'}`);
        
        if (!isOnline && this.isMobile) {
            this.showOfflineMessage();
        } else {
            this.hideOfflineMessage();
        }
    }
    
    showOfflineMessage() {
        let offlineMsg = document.querySelector('.offline-message');
        if (!offlineMsg) {
            offlineMsg = document.createElement('div');
            offlineMsg.className = 'offline-message';
            offlineMsg.innerHTML = `
                <i class="fas fa-wifi"></i>
                <span>You're offline. Some features may not work.</span>
            `;
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .offline-message {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #FF3B30;
                    color: white;
                    padding: 10px;
                    text-align: center;
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-size: 14px;
                    transform: translateY(-100%);
                    transition: transform 0.3s ease;
                }
                
                .offline-message.show {
                    transform: translateY(0);
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(offlineMsg);
        }
        
        setTimeout(() => {
            offlineMsg.classList.add('show');
        }, 100);
    }
    
    hideOfflineMessage() {
        const offlineMsg = document.querySelector('.offline-message');
        if (offlineMsg) {
            offlineMsg.classList.remove('show');
            setTimeout(() => {
                offlineMsg.remove();
            }, 300);
        }
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause expensive operations when tab is hidden
            this.pauseExpensiveOperations();
        } else {
            // Resume operations when tab becomes visible
            this.resumeExpensiveOperations();
        }
    }
    
    pauseExpensiveOperations() {
        // Pause Three.js animations
        if (window.threeManager) {
            window.threeManager.pauseAll?.();
        }
        
        // Pause chart animations
        if (window.dashboardLoader) {
            window.dashboardLoader.pauseAnimations?.();
        }
    }
    
    resumeExpensiveOperations() {
        // Resume Three.js animations
        if (window.threeManager) {
            window.threeManager.resumeAll?.();
        }
        
        // Resume chart animations
        if (window.dashboardLoader) {
            window.dashboardLoader.resumeAnimations?.();
        }
    }
    
    // Public API
    getOptimizationStatus() {
        return {
            deviceInfo: this.deviceInfo,
            performanceProfile: this.performanceProfile,
            optimizations: this.optimizations,
            isOptimized: Object.values(this.optimizations).every(Boolean)
        };
    }
    
    forceOptimization(optimizationType) {
        switch (optimizationType) {
            case 'touch':
                this.enhanceTouchInteractions();
                break;
            case 'performance':
                this.optimizePerformanceForMobile();
                break;
            case 'responsive':
                this.setupResponsiveAdjustments();
                break;
            case 'navigation':
                this.optimizeNavigation();
                break;
            default:
                this.initializeOptimizations();
        }
    }
}

// Initialize mobile optimization system
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileOptimizer = new MobileOptimizationSystem();
    });
} else {
    window.mobileOptimizer = new MobileOptimizationSystem();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileOptimizationSystem;
}