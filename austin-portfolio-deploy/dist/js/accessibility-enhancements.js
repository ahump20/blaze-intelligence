/**
 * Accessibility Enhancements for Blaze Intelligence
 * Respects user preferences for reduced motion and improves performance
 * October 15, 2025
 */

class AccessibilityEnhancements {
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.animationsEnabled = !this.prefersReducedMotion;

        this.init();
    }

    init() {
        // Check for reduced motion preference
        this.handleReducedMotion();

        // Add lazy loading to images
        this.setupLazyLoading();

        // Add keyboard navigation enhancements
        this.enhanceKeyboardNavigation();

        // Setup focus visible styles
        this.setupFocusStyles();

        // Monitor preference changes
        this.watchPreferenceChanges();

        console.log('Accessibility enhancements initialized', {
            reducedMotion: this.prefersReducedMotion,
            darkMode: this.prefersColorScheme,
            animations: this.animationsEnabled
        });
    }

    handleReducedMotion() {
        if (this.prefersReducedMotion) {
            // Disable all animations
            document.documentElement.style.setProperty('--animation-duration', '0.01s');
            document.documentElement.classList.add('reduced-motion');

            // Stop particle animations
            if (window.pJSDom && window.pJSDom.length > 0) {
                window.pJSDom.forEach(dom => {
                    if (dom.pJS) {
                        dom.pJS.particles.move.enable = false;
                        dom.pJS.fn.particlesRefresh();
                    }
                });
            }

            // Pause Three.js animations
            if (window.threeAnimationFrameId) {
                cancelAnimationFrame(window.threeAnimationFrameId);
            }

            // Disable GSAP animations
            if (typeof gsap !== 'undefined') {
                gsap.globalTimeline.pause();
                gsap.ticker.remove(gsap.updateRoot);
            }

            // Add static alternatives
            this.addStaticAlternatives();
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }
    }

    addStaticAlternatives() {
        // Replace animated hero with static version
        const animatedHero = document.querySelector('#three-hero-container');
        if (animatedHero) {
            animatedHero.innerHTML = `
                <div class="static-hero" style="
                    background: linear-gradient(135deg, #BF5700 0%, #FFD700 100%);
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2rem;
                    font-weight: bold;
                ">
                    Blaze Intelligence Championship Platform
                </div>
            `;
        }

        // Replace animated charts with static images or simplified versions
        const charts = document.querySelectorAll('canvas.chart-canvas');
        charts.forEach(chart => {
            const staticChart = document.createElement('div');
            staticChart.className = 'static-chart';
            staticChart.innerHTML = 'Chart data available in table format below';
            chart.parentNode.replaceChild(staticChart, chart);
        });
    }

    setupLazyLoading() {
        // Add lazy loading to images
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            if (!img.complete) {
                img.loading = 'lazy';
            }
        });

        // Lazy load iframes
        const iframes = document.querySelectorAll('iframe:not([loading])');
        iframes.forEach(iframe => {
            iframe.loading = 'lazy';
        });

        // Intersection Observer for heavy components
        if ('IntersectionObserver' in window) {
            const heavyComponents = document.querySelectorAll('.heavy-component');
            const componentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Load component when visible
                        const component = entry.target;
                        if (component.dataset.src) {
                            this.loadComponent(component);
                            componentObserver.unobserve(component);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });

            heavyComponents.forEach(component => {
                componentObserver.observe(component);
            });
        }
    }

    loadComponent(component) {
        const src = component.dataset.src;
        if (src) {
            // Dynamic import for JavaScript modules
            if (src.endsWith('.js')) {
                import(src).then(module => {
                    if (module.default && typeof module.default.init === 'function') {
                        module.default.init(component);
                    }
                });
            }
            // Load HTML content
            else if (src.endsWith('.html')) {
                fetch(src)
                    .then(response => response.text())
                    .then(html => {
                        component.innerHTML = html;
                    });
            }
        }
    }

    enhanceKeyboardNavigation() {
        // Add skip links
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: #BF5700;
            color: white;
            padding: 8px;
            text-decoration: none;
            z-index: 100000;
            border-radius: 0 0 4px 0;
        `;
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Enhance tab navigation for cards
        const cards = document.querySelectorAll('.card, .dashboard-card');
        cards.forEach(card => {
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'article');
            }
        });

        // Add keyboard handlers for interactive elements
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.open');
                modals.forEach(modal => {
                    modal.classList.remove('open');
                });
            }

            // Arrow key navigation for tab panels
            if (e.key.startsWith('Arrow')) {
                const focused = document.activeElement;
                if (focused && focused.getAttribute('role') === 'tab') {
                    this.handleTabNavigation(e, focused);
                }
            }
        });
    }

    handleTabNavigation(event, currentTab) {
        const tablist = currentTab.closest('[role="tablist"]');
        if (!tablist) return;

        const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
        const currentIndex = tabs.indexOf(currentTab);

        let nextIndex;
        switch(event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = currentIndex - 1;
                if (nextIndex < 0) nextIndex = tabs.length - 1;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = currentIndex + 1;
                if (nextIndex >= tabs.length) nextIndex = 0;
                break;
            default:
                return;
        }

        event.preventDefault();
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
    }

    setupFocusStyles() {
        // Add focus-visible polyfill styles
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced focus styles */
            :focus-visible {
                outline: 3px solid #BF5700;
                outline-offset: 2px;
            }

            .reduced-motion * {
                animation-duration: 0.01s !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01s !important;
            }

            .reduced-motion .live-indicator {
                animation: none;
                opacity: 1;
            }

            .skip-link:focus {
                top: 0 !important;
            }

            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .card {
                    border-width: 2px;
                }

                button, .btn {
                    border: 2px solid currentColor;
                }
            }

            /* Improved touch targets */
            button, a, .clickable {
                min-height: 44px;
                min-width: 44px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            /* Screen reader only content */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
        `;
        document.head.appendChild(style);
    }

    watchPreferenceChanges() {
        // Monitor reduced motion preference changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.prefersReducedMotion = e.matches;
            this.animationsEnabled = !e.matches;
            this.handleReducedMotion();

            console.log('Reduced motion preference changed:', e.matches);
        });

        // Monitor color scheme preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            this.prefersColorScheme = e.matches;
            console.log('Color scheme preference changed:', e.matches ? 'dark' : 'light');
        });
    }

    // Public API for controlling animations
    enableAnimations() {
        this.animationsEnabled = true;
        document.documentElement.classList.remove('reduced-motion');
    }

    disableAnimations() {
        this.animationsEnabled = false;
        document.documentElement.classList.add('reduced-motion');
    }

    isAnimationEnabled() {
        return this.animationsEnabled;
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.accessibilityEnhancements = new AccessibilityEnhancements();
    });
} else {
    window.accessibilityEnhancements = new AccessibilityEnhancements();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityEnhancements;
}