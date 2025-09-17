/**
 * BLAZE INTELLIGENCE - Progressive Enhancement System
 * October 2025 Refresh
 *
 * Ensures core functionality works without JavaScript,
 * then progressively adds enhanced features
 */

class BlazeProgressiveEnhancement {
    constructor() {
        this.features = new Map();
        this.supported = new Map();
        this.loadQueue = [];
        this.isEnhanced = false;

        // Check browser capabilities
        this.checkCapabilities();

        // Initialize enhancement
        this.init();
    }

    /**
     * Check browser capabilities
     */
    checkCapabilities() {
        // Core features
        this.supported.set('javascript', true); // If we're here, JS is enabled
        this.supported.set('localStorage', this.checkLocalStorage());
        this.supported.set('sessionStorage', this.checkSessionStorage());
        this.supported.set('serviceWorker', 'serviceWorker' in navigator);
        this.supported.set('webGL', this.checkWebGL());
        this.supported.set('webRTC', this.checkWebRTC());
        this.supported.set('intersectionObserver', 'IntersectionObserver' in window);
        this.supported.set('mutationObserver', 'MutationObserver' in window);
        this.supported.set('fetch', 'fetch' in window);
        this.supported.set('promises', 'Promise' in window);
        this.supported.set('async', this.checkAsync());
        this.supported.set('modules', this.checkModules());
        this.supported.set('cssGrid', this.checkCSSGrid());
        this.supported.set('cssCustomProperties', this.checkCSSCustomProperties());
        this.supported.set('webAnimations', 'animate' in Element.prototype);
        this.supported.set('touchEvents', 'ontouchstart' in window);
        this.supported.set('pointerEvents', 'onpointerdown' in window);
        this.supported.set('clipboard', 'clipboard' in navigator);
        this.supported.set('share', 'share' in navigator);
        this.supported.set('vibrate', 'vibrate' in navigator);
        this.supported.set('geolocation', 'geolocation' in navigator);
        this.supported.set('notifications', 'Notification' in window);
        this.supported.set('webWorkers', 'Worker' in window);
        this.supported.set('sharedWorkers', 'SharedWorker' in window);
        this.supported.set('indexedDB', 'indexedDB' in window);
        this.supported.set('webSockets', 'WebSocket' in window);
        this.supported.set('webAssembly', 'WebAssembly' in window);

        // Performance features
        this.supported.set('performanceObserver', 'PerformanceObserver' in window);
        this.supported.set('navigationTiming', 'performance' in window && 'timing' in performance);
        this.supported.set('resourceTiming', 'performance' in window && 'getEntriesByType' in performance);

        // Media features
        this.supported.set('mediaRecorder', 'MediaRecorder' in window);
        this.supported.set('getUserMedia', this.checkGetUserMedia());
        this.supported.set('pictureInPicture', 'pictureInPictureEnabled' in document);

        // Network features
        this.supported.set('onLine', 'onLine' in navigator);
        this.supported.set('connection', 'connection' in navigator || 'mozConnection' in navigator);

        console.log('🔍 Browser capabilities:', Object.fromEntries(this.supported));
    }

    /**
     * Initialize progressive enhancement
     */
    init() {
        // Mark document as enhanced
        document.documentElement.classList.add('js-enabled');
        document.documentElement.classList.remove('no-js');

        // Register core enhancements
        this.registerCoreEnhancements();

        // Register feature-specific enhancements
        this.registerFeatureEnhancements();

        // Apply enhancements
        this.applyEnhancements();

        // Set up lazy loading
        this.setupLazyLoading();

        // Set up network monitoring
        this.setupNetworkMonitoring();

        console.log('✨ Progressive enhancement initialized');
    }

    /**
     * Register core enhancements that should always run
     */
    registerCoreEnhancements() {
        // Enhanced forms
        this.register('forms', () => {
            this.enhanceForms();
        }, ['javascript']);

        // Enhanced navigation
        this.register('navigation', () => {
            this.enhanceNavigation();
        }, ['javascript']);

        // Enhanced images
        this.register('images', () => {
            this.enhanceImages();
        }, ['javascript']);

        // Enhanced tables
        this.register('tables', () => {
            this.enhanceTables();
        }, ['javascript']);
    }

    /**
     * Register feature-specific enhancements
     */
    registerFeatureEnhancements() {
        // Service Worker for offline support
        this.register('serviceWorker', () => {
            this.registerServiceWorker();
        }, ['serviceWorker']);

        // Lazy loading with Intersection Observer
        this.register('lazyLoading', () => {
            this.enableLazyLoading();
        }, ['intersectionObserver']);

        // WebGL visualizations
        this.register('webGL', () => {
            this.loadWebGL();
        }, ['webGL']);

        // WebRTC for real-time features
        this.register('webRTC', () => {
            this.loadWebRTC();
        }, ['webRTC', 'getUserMedia']);

        // Web Animations
        this.register('animations', () => {
            this.enhanceAnimations();
        }, ['webAnimations']);

        // Clipboard functionality
        this.register('clipboard', () => {
            this.enhanceClipboard();
        }, ['clipboard']);

        // Share functionality
        this.register('share', () => {
            this.enhanceShare();
        }, ['share']);

        // Performance monitoring
        this.register('performance', () => {
            this.enablePerformanceMonitoring();
        }, ['performanceObserver']);
    }

    /**
     * Register an enhancement
     */
    register(name, enhancement, requirements = []) {
        this.features.set(name, {
            enhancement,
            requirements,
            applied: false
        });
    }

    /**
     * Apply all registered enhancements
     */
    applyEnhancements() {
        this.features.forEach((feature, name) => {
            if (this.canApply(feature.requirements)) {
                try {
                    feature.enhancement();
                    feature.applied = true;
                    console.log(`✅ Applied enhancement: ${name}`);
                } catch (error) {
                    console.error(`❌ Failed to apply enhancement: ${name}`, error);
                }
            } else {
                console.warn(`⏭️ Skipped enhancement: ${name} (missing requirements)`);
            }
        });

        this.isEnhanced = true;
    }

    /**
     * Check if requirements are met
     */
    canApply(requirements) {
        return requirements.every(req => this.supported.get(req));
    }

    /**
     * Enhance forms with client-side validation and AJAX submission
     */
    enhanceForms() {
        const forms = document.querySelectorAll('form[data-enhance]');

        forms.forEach(form => {
            // Add client-side validation
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Basic validation
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;

                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        field.classList.add('error');
                        isValid = false;
                    } else {
                        field.classList.remove('error');
                    }
                });

                if (!isValid) {
                    console.warn('Form validation failed');
                    return;
                }

                // AJAX submission if fetch is available
                if (this.supported.get('fetch')) {
                    try {
                        const formData = new FormData(form);
                        const response = await fetch(form.action, {
                            method: form.method || 'POST',
                            body: formData
                        });

                        if (response.ok) {
                            form.classList.add('success');
                            form.reset();
                        } else {
                            form.classList.add('error');
                        }
                    } catch (error) {
                        console.error('Form submission error:', error);
                        // Fallback to normal submission
                        form.submit();
                    }
                } else {
                    // Fallback to normal submission
                    form.submit();
                }
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        });
    }

    /**
     * Validate a form field
     */
    validateField(field) {
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.classList.add('error');
            return false;
        }

        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                field.classList.add('error');
                return false;
            }
        }

        field.classList.remove('error');
        return true;
    }

    /**
     * Enhance navigation with smooth scrolling and history API
     */
    enhanceNavigation() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add active states to navigation
        const navLinks = document.querySelectorAll('nav a');
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            if (link.pathname === currentPath) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    /**
     * Enhance images with lazy loading and responsive images
     */
    enhanceImages() {
        const images = document.querySelectorAll('img[data-src]');

        images.forEach(img => {
            // Add loading class
            img.classList.add('loading');

            // Create new image to preload
            const newImg = new Image();
            newImg.onload = () => {
                img.src = newImg.src;
                img.classList.remove('loading');
                img.classList.add('loaded');
            };
            newImg.onerror = () => {
                img.classList.remove('loading');
                img.classList.add('error');
            };
            newImg.src = img.dataset.src;
        });
    }

    /**
     * Enhance tables with sorting and filtering
     */
    enhanceTables() {
        const tables = document.querySelectorAll('table[data-enhance]');

        tables.forEach(table => {
            // Add sorting to headers
            const headers = table.querySelectorAll('th');
            headers.forEach((header, index) => {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    this.sortTable(table, index);
                });
            });

            // Add search/filter
            const searchInput = document.createElement('input');
            searchInput.type = 'search';
            searchInput.placeholder = 'Search table...';
            searchInput.className = 'bml-input table-search';
            searchInput.addEventListener('input', (e) => {
                this.filterTable(table, e.target.value);
            });

            table.parentElement.insertBefore(searchInput, table);
        });
    }

    /**
     * Sort table by column
     */
    sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent;
            const bValue = b.cells[columnIndex].textContent;

            // Try to parse as number
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return aNum - bNum;
            }

            return aValue.localeCompare(bValue);
        });

        // Re-append sorted rows
        rows.forEach(row => tbody.appendChild(row));
    }

    /**
     * Filter table rows
     */
    filterTable(table, searchTerm) {
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const match = text.includes(searchTerm.toLowerCase());
            row.style.display = match ? '' : 'none';
        });
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration);
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Enable lazy loading with Intersection Observer
     */
    enableLazyLoading() {
        const lazyElements = document.querySelectorAll('[data-lazy]');

        const lazyLoadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;

                    // Load different types of content
                    if (element.tagName === 'IMG') {
                        element.src = element.dataset.src;
                    } else if (element.tagName === 'IFRAME') {
                        element.src = element.dataset.src;
                    } else if (element.tagName === 'VIDEO') {
                        element.poster = element.dataset.poster;
                        element.src = element.dataset.src;
                    } else {
                        // Load content via fetch
                        this.loadContent(element);
                    }

                    element.classList.add('lazy-loaded');
                    lazyLoadObserver.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        lazyElements.forEach(element => {
            lazyLoadObserver.observe(element);
        });
    }

    /**
     * Load content dynamically
     */
    async loadContent(element) {
        const url = element.dataset.lazy;
        if (!url) return;

        try {
            const response = await fetch(url);
            const content = await response.text();
            element.innerHTML = content;
        } catch (error) {
            console.error('Failed to load content:', error);
        }
    }

    /**
     * Setup network monitoring
     */
    setupNetworkMonitoring() {
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection;

            // Initial check
            this.updateNetworkStatus(connection);

            // Monitor changes
            connection.addEventListener('change', () => {
                this.updateNetworkStatus(connection);
            });
        }

        // Online/offline events
        window.addEventListener('online', () => {
            document.body.classList.remove('offline');
            document.body.classList.add('online');
            this.showNotification('Connection restored');
        });

        window.addEventListener('offline', () => {
            document.body.classList.remove('online');
            document.body.classList.add('offline');
            this.showNotification('Connection lost - offline mode');
        });
    }

    /**
     * Update network status
     */
    updateNetworkStatus(connection) {
        const status = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            saveData: connection.saveData
        };

        document.body.dataset.network = connection.effectiveType;

        // Adjust quality based on connection
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            document.body.classList.add('low-bandwidth');
        } else {
            document.body.classList.remove('low-bandwidth');
        }

        console.log('📡 Network status:', status);
    }

    /**
     * Show notification
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'bml-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Setup lazy loading for components
     */
    setupLazyLoading() {
        // Define components to lazy load
        const lazyComponents = [
            { selector: '[data-chart]', loader: () => this.loadCharts() },
            { selector: '[data-map]', loader: () => this.loadMaps() },
            { selector: '[data-video]', loader: () => this.loadVideoPlayer() },
            { selector: '[data-3d]', loader: () => this.load3D() }
        ];

        lazyComponents.forEach(({ selector, loader }) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                // Load on interaction or visibility
                if (this.supported.get('intersectionObserver')) {
                    const observer = new IntersectionObserver((entries) => {
                        if (entries.some(entry => entry.isIntersecting)) {
                            loader();
                            observer.disconnect();
                        }
                    });

                    elements.forEach(el => observer.observe(el));
                } else {
                    // Fallback: load on scroll
                    window.addEventListener('scroll', () => {
                        loader();
                    }, { once: true });
                }
            }
        });
    }

    // Lazy load handlers
    async loadCharts() {
        if (!window.Chart) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }

    async loadMaps() {
        // Load map library when needed
        console.log('Loading maps...');
    }

    async loadVideoPlayer() {
        // Load video player when needed
        console.log('Loading video player...');
    }

    async load3D() {
        if (!window.THREE) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }

    // Helper methods for capability checking
    checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch {
            return false;
        }
    }

    checkSessionStorage() {
        try {
            sessionStorage.setItem('test', 'test');
            sessionStorage.removeItem('test');
            return true;
        } catch {
            return false;
        }
    }

    checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch {
            return false;
        }
    }

    checkWebRTC() {
        return !!(window.RTCPeerConnection ||
            window.mozRTCPeerConnection ||
            window.webkitRTCPeerConnection);
    }

    checkGetUserMedia() {
        return !!(navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            (navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    }

    checkAsync() {
        try {
            eval('(async () => {})');
            return true;
        } catch {
            return false;
        }
    }

    checkModules() {
        const script = document.createElement('script');
        return 'noModule' in script;
    }

    checkCSSGrid() {
        return CSS.supports('display', 'grid');
    }

    checkCSSCustomProperties() {
        return CSS.supports('--test', '1');
    }

    // Enhanced features
    enhanceAnimations() {
        // Add smooth animations where supported
        console.log('✨ Animations enhanced');
    }

    enhanceClipboard() {
        // Add copy buttons to code blocks
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            const button = document.createElement('button');
            button.textContent = 'Copy';
            button.className = 'copy-button';
            button.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent);
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
            block.parentElement.appendChild(button);
        });
    }

    enhanceShare() {
        // Add native share buttons
        const shareButtons = document.querySelectorAll('[data-share]');
        shareButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const shareData = {
                    title: button.dataset.shareTitle || document.title,
                    text: button.dataset.shareText || '',
                    url: button.dataset.shareUrl || window.location.href
                };

                try {
                    await navigator.share(shareData);
                } catch (error) {
                    console.log('Share failed:', error);
                }
            });
        });
    }

    enablePerformanceMonitoring() {
        // Load monitoring script if not already loaded
        if (!window.blazeMonitoring) {
            const script = document.createElement('script');
            script.src = '/js/blaze-monitoring.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }

    loadWebGL() {
        console.log('✨ WebGL features loaded');
    }

    loadWebRTC() {
        console.log('✨ WebRTC features loaded');
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    window.blazeEnhancement = new BlazeProgressiveEnhancement();
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeProgressiveEnhancement;
}