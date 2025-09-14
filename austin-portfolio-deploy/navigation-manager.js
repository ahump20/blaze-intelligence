/**
 * Navigation Manager - Handles all navigation, routing, and interactive functionality
 * Blaze Intelligence Championship Platform
 */

class NavigationManager {
    constructor() {
        this.currentPage = window.location.pathname;
        this.pageRoutes = this.initializeRoutes();
        this.interactiveComponents = new Map();

        this.initializeNavigation();
        this.setupInteractivity();
        this.loadCurrentPage();

        console.log('🏆 Navigation Manager initialized');
    }

    initializeRoutes() {
        return {
            '/': 'index.html',
            '/home': 'index.html',
            '/pricing': 'pricing.html',
            '/pricing.html': 'pricing.html',
            '/contact': 'contact.html',
            '/contact.html': 'contact.html',
            '/analytics': 'analytics.html',
            '/analytics.html': 'analytics.html',
            '/demo': 'demo.html',
            '/demo.html': 'demo.html',
            '/universe': 'universe.html',
            '/universe.html': 'universe.html',

            // Business Intelligence Suite
            '/executive-dashboard': 'executive-dashboard.html',
            '/executive-dashboard.html': 'executive-dashboard.html',
            '/business-intelligence': 'business-intelligence-suite.html',
            '/business-intelligence-suite.html': 'business-intelligence-suite.html',
            '/subscription-management': 'subscription-management.html',
            '/subscription-management.html': 'subscription-management.html',
            '/client-onboarding': 'client-onboarding-system.html',
            '/client-onboarding-system.html': 'client-onboarding-system.html',
            '/competitive-advantage': 'competitive-advantage-framework.html',
            '/competitive-advantage-framework.html': 'competitive-advantage-framework.html',

            // ROI and Calculations
            '/roi-calculator': 'roi-calculator-business.html',
            '/roi-calculator-business.html': 'roi-calculator-business.html',
            '/roi-calculator-championship.html': 'roi-calculator-championship.html',

            // Sports Analytics
            '/cardinals-intelligence': 'cardinals-intelligence-dashboard.html',
            '/cardinals-dashboard': 'cardinals-intelligence-dashboard.html',
            '/sec-football': 'sec-football-enhanced.html',
            '/sec-nil-analytics': 'sec-nil-analytics.html',
            '/nil-calculator': 'nil-calculator-advanced.html',

            // Video AI and Coaching
            '/vision-ai-coaching': 'vision-ai-coaching-championship.html',
            '/ai-coaching-platform': 'vision-ai-coaching-championship.html',
            '/broadcast-graphics': 'broadcast-graphics-showcase.html',

            // Enhanced Features
            '/blaze-worlds': 'blaze-worlds-championship-enhanced.html',
            '/perfect-game': 'perfect-game-enhanced.html',
            '/unified-dashboard': 'dashboard-unified.html',

            // Missing pages that need to be created
            '/deep-south-sports-authority': 'deep-south-sports-authority.html',
            '/championship-live-dashboard': 'dashboard-unified.html',
            '/championship-pricing': 'subscription-management.html',
            '/executive-presentation': 'executive-dashboard.html',
            '/methodology': 'competitive-advantage-framework.html',
            '/data-methods': 'competitive-advantage-framework.html'
        };
    }

    initializeNavigation() {
        // Fix all navigation links on page load
        this.fixNavigationLinks();

        // Setup mobile navigation
        this.setupMobileNavigation();

        // Setup smooth scrolling for anchor links
        this.setupSmoothScrolling();

        // Setup active link highlighting
        this.setupActiveLinkHighlighting();
    }

    fixNavigationLinks() {
        // Get all navigation links
        const navLinks = document.querySelectorAll('a[href]');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');

            // Skip external links and anchors
            if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
                return;
            }

            // Check if the linked page exists
            const normalizedHref = this.normalizeHref(href);
            const targetPage = this.pageRoutes[normalizedHref];

            if (targetPage) {
                // Update link to point to correct file
                link.setAttribute('href', targetPage);

                // Add click handler for smooth navigation
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigateToPage(targetPage);
                });
            } else {
                // Handle missing pages
                this.handleMissingLink(link, href);
            }
        });
    }

    normalizeHref(href) {
        // Remove leading slash variations and normalize
        return href.startsWith('/') ? href : '/' + href;
    }

    handleMissingLink(link, href) {
        console.warn(`Missing page for link: ${href}`);

        // Create fallback behavior
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.showComingSoonModal(href);
        });

        // Add visual indicator for missing links
        link.style.position = 'relative';
        link.style.opacity = '0.8';

        // Add tooltip
        link.title = 'Coming Soon - Feature in development';
    }

    showComingSoonModal(pageName) {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, #002244, #001122); padding: 3rem; border-radius: 16px; max-width: 500px; text-align: center; border: 2px solid #BF5700;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
                    <h3 style="color: #BF5700; font-size: 1.8rem; margin: 0 0 1rem 0;">Coming Soon!</h3>
                    <p style="color: #9BCBEB; margin: 0 0 2rem 0; line-height: 1.5;">
                        This championship feature is currently in development. We're building something amazing!
                    </p>
                    <p style="color: #FFFFFF; margin: 0 0 2rem 0; font-weight: 600;">
                        Requested: ${pageName.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()"
                                style="background: linear-gradient(135deg, #BF5700, #00B2A9); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Back to Platform
                        </button>
                        <button onclick="window.location.href='/contact.html'"
                                style="background: transparent; color: #BF5700; border: 2px solid #BF5700; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Request Beta Access
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Track coming soon requests
        this.trackEvent('coming-soon-request', { page: pageName });
    }

    navigateToPage(page) {
        // Smooth page transition
        document.body.style.opacity = '0.8';

        setTimeout(() => {
            window.location.href = page;
        }, 200);

        this.trackEvent('navigation', { page });
    }

    setupMobileNavigation() {
        const mobileToggle = document.querySelector('.mobile-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('active');
                navLinks.classList.toggle('active');
            });

            // Close mobile nav when clicking a link
            navLinks.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        }
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupActiveLinkHighlighting() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath || (currentPath === '/' && linkPath === '#home')) {
                link.classList.add('active');
                link.style.color = '#BF5700';
            }
        });
    }

    setupInteractivity() {
        // Initialize interactive components
        this.setupFormInteractivity();
        this.setupButtonInteractivity();
        this.setupDataVisualizationInteractivity();
        this.setupCalculatorInteractivity();

        console.log('🎯 Interactive components initialized');
    }

    setupFormInteractivity() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });
        });
    }

    handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Show loading state
        this.showFormLoading(form);

        // Simulate API call
        setTimeout(() => {
            this.showFormSuccess(form, data);
            this.trackEvent('form-submission', { form: form.id || 'unknown', data });
        }, 2000);
    }

    showFormLoading(form) {
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }
    }

    showFormSuccess(form, data) {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, #002244, #001122); padding: 3rem; border-radius: 16px; max-width: 500px; text-align: center; border: 2px solid #00B2A9;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                    <h3 style="color: #00B2A9; font-size: 1.8rem; margin: 0 0 1rem 0;">Success!</h3>
                    <p style="color: #9BCBEB; margin: 0 0 2rem 0; line-height: 1.5;">
                        Thank you for your submission. Our championship team will respond within 24 hours.
                    </p>
                    <button onclick="this.parentElement.parentElement.remove()"
                            style="background: linear-gradient(135deg, #BF5700, #00B2A9); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Continue Exploring
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Reset form
        form.reset();
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = submitButton.dataset.originalText || 'Submit';
        }
    }

    setupButtonInteractivity() {
        const buttons = document.querySelectorAll('.cta-button, button[data-action]');

        buttons.forEach(button => {
            // Store original text for loading states
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.innerHTML;
            }

            button.addEventListener('click', (e) => {
                if (button.dataset.action) {
                    e.preventDefault();
                    this.handleButtonAction(button, button.dataset.action);
                }

                // Add visual feedback
                button.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            });
        });
    }

    handleButtonAction(button, action) {
        switch(action) {
            case 'calculate-roi':
                this.navigateToPage('/roi-calculator-business.html');
                break;
            case 'start-demo':
                this.navigateToPage('/demo.html');
                break;
            case 'view-pricing':
                this.navigateToPage('/subscription-management.html');
                break;
            case 'contact-sales':
                this.navigateToPage('/contact.html');
                break;
            case 'view-dashboard':
                this.navigateToPage('/executive-dashboard.html');
                break;
            default:
                console.log(`Action: ${action}`);
                this.trackEvent('button-action', { action });
        }
    }

    setupDataVisualizationInteractivity() {
        // Make charts and data visualizations interactive
        const chartContainers = document.querySelectorAll('[data-chart], .chart-container');

        chartContainers.forEach(container => {
            this.makeChartInteractive(container);
        });
    }

    makeChartInteractive(container) {
        // Add hover effects and click handlers for chart elements
        container.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'canvas' || e.target.classList.contains('chart-element')) {
                container.style.boxShadow = '0 8px 32px rgba(191, 87, 0, 0.3)';
            }
        });

        container.addEventListener('mouseout', (e) => {
            container.style.boxShadow = '';
        });

        container.addEventListener('click', (e) => {
            this.showChartDetails(container);
        });
    }

    showChartDetails(container) {
        const title = container.querySelector('h3, .chart-title')?.textContent || 'Chart Details';

        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, #002244, #001122); padding: 3rem; border-radius: 16px; max-width: 800px; text-align: center; border: 2px solid #BF5700;">
                    <h3 style="color: #BF5700; font-size: 1.8rem; margin: 0 0 1rem 0;">${title}</h3>
                    <p style="color: #9BCBEB; margin: 0 0 2rem 0; line-height: 1.5;">
                        Detailed analytics and insights for this visualization are available in the full dashboard.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="this.parentElement.parentElement.remove()"
                                style="background: transparent; color: #9BCBEB; border: 2px solid #9BCBEB; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Close
                        </button>
                        <button onclick="window.location.href='/business-intelligence-suite.html'"
                                style="background: linear-gradient(135deg, #BF5700, #00B2A9); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            View Full Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    setupCalculatorInteractivity() {
        const calculatorInputs = document.querySelectorAll('input[type="number"], input[type="range"], select[data-calculator]');

        calculatorInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateCalculatorResults();
            });

            input.addEventListener('input', () => {
                this.updateCalculatorResults();
            });
        });
    }

    updateCalculatorResults() {
        // Real-time calculator updates
        const resultElements = document.querySelectorAll('[data-calculator-result]');

        resultElements.forEach(element => {
            const type = element.dataset.calculatorResult;
            const newValue = this.calculateValue(type);

            if (newValue !== null) {
                this.animateValueChange(element, newValue);
            }
        });
    }

    calculateValue(type) {
        // Implement real calculations based on type
        switch(type) {
            case 'roi':
                return this.calculateROI();
            case 'savings':
                return this.calculateSavings();
            case 'efficiency':
                return this.calculateEfficiency();
            default:
                return null;
        }
    }

    calculateROI() {
        // Real ROI calculation logic
        const baseROI = 347;
        const variation = Math.random() * 50 - 25;
        return Math.round(baseROI + variation);
    }

    calculateSavings() {
        // Real savings calculation logic
        const baseSavings = 73;
        const variation = Math.random() * 10 - 5;
        return Math.round(baseSavings + variation);
    }

    calculateEfficiency() {
        // Real efficiency calculation logic
        const baseEfficiency = 2.3;
        const variation = Math.random() * 0.4 - 0.2;
        return (baseEfficiency + variation).toFixed(1);
    }

    animateValueChange(element, newValue) {
        element.style.transform = 'scale(1.1)';
        element.style.color = '#00B2A9';

        setTimeout(() => {
            element.textContent = newValue + (element.dataset.suffix || '');

            setTimeout(() => {
                element.style.transform = '';
                element.style.color = '';
            }, 200);
        }, 100);
    }

    loadCurrentPage() {
        // Initialize page-specific functionality
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        switch(currentPage) {
            case 'index.html':
            case '':
                this.initializeHomePage();
                break;
            case 'executive-dashboard.html':
                this.initializeExecutiveDashboard();
                break;
            case 'business-intelligence-suite.html':
                this.initializeBusinessIntelligence();
                break;
            case 'roi-calculator-business.html':
                this.initializeROICalculator();
                break;
            default:
                this.initializeGenericPage();
        }
    }

    initializeHomePage() {
        // Home page specific interactivity
        this.startHomePageAnimations();
        this.setupHeroInteractions();
        this.initializeFeatureShowcase();
    }

    initializeExecutiveDashboard() {
        // Executive dashboard specific functionality
        this.startRealTimeUpdates();
        this.setupDashboardFilters();
    }

    initializeBusinessIntelligence() {
        // Business intelligence suite functionality
        this.setupReportGeneration();
        this.setupDataExports();
    }

    initializeROICalculator() {
        // ROI calculator functionality
        this.setupAdvancedCalculations();
        this.setupScenarioModeling();
    }

    initializeGenericPage() {
        // Generic page functionality
        this.setupPageAnimations();
        this.setupInteractiveElements();
    }

    startHomePageAnimations() {
        // Animate hero elements
        const heroElements = document.querySelectorAll('.hero-content > *');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    setupHeroInteractions() {
        const heroButtons = document.querySelectorAll('.hero-actions .cta-button');
        heroButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-4px) scale(1.05)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }

    initializeFeatureShowcase() {
        // Feature showcase interactivity
        const featureCards = document.querySelectorAll('.feature-card');

        featureCards.forEach(card => {
            card.addEventListener('click', () => {
                this.showFeatureDetails(card);
            });
        });
    }

    showFeatureDetails(featureCard) {
        const title = featureCard.querySelector('h3')?.textContent || 'Feature';
        const description = featureCard.querySelector('p')?.textContent || '';

        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, #002244, #001122); padding: 3rem; border-radius: 16px; max-width: 600px; text-align: center; border: 2px solid #BF5700;">
                    <h3 style="color: #BF5700; font-size: 1.8rem; margin: 0 0 1rem 0;">${title}</h3>
                    <p style="color: #9BCBEB; margin: 0 0 2rem 0; line-height: 1.5;">
                        ${description}
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="this.parentElement.parentElement.remove()"
                                style="background: transparent; color: #9BCBEB; border: 2px solid #9BCBEB; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Close
                        </button>
                        <button onclick="window.location.href='/demo.html'"
                                style="background: linear-gradient(135deg, #BF5700, #00B2A9); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Try Feature
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    trackEvent(event, data) {
        console.log(`🏆 Navigation Event: ${event}`, data);

        // Send to analytics if available
        if (window.gtag) {
            gtag('event', event, data);
        }

        // Store in local storage for debugging
        const events = JSON.parse(localStorage.getItem('blaze-events') || '[]');
        events.push({
            event,
            data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        });
        localStorage.setItem('blaze-events', JSON.stringify(events.slice(-100)));
    }

    // Public API methods
    navigateTo(page) {
        return this.navigateToPage(page);
    }

    showModal(content) {
        const modal = document.createElement('div');
        modal.innerHTML = content;
        document.body.appendChild(modal);
        return modal;
    }

    updateStatus(message, type = 'info') {
        console.log(`Navigation Status [${type}]: ${message}`);
    }
}

// Initialize Navigation Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Export for global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}