/**
 * Blaze Intelligence Mega Navigation System
 * Comprehensive navigation with mega-menus, search, and mobile optimization
 */

class BlazeNavigation {
    constructor() {
        this.currentPage = window.location.pathname;
        this.isMenuOpen = false;
        this.searchOpen = false;
        this.activeDropdown = null;
        this.init();
    }

    init() {
        this.createNavigationStructure();
        this.initializeEventListeners();
        this.highlightCurrentPage();
        this.initializeSearch();
        this.initializeMobileMenu();
        this.addKeyboardNavigation();
        this.preloadPages();
    }

    createNavigationStructure() {
        const navigationData = {
            platform: {
                title: 'Platform',
                icon: '⚡',
                sections: [
                    {
                        title: 'Executive Dashboards',
                        items: [
                            {
                                title: 'Executive Intelligence Center',
                                url: '/sports-intelligence-dashboard.html',
                                description: 'C-suite championship command center',
                                badge: 'Executive',
                                icon: '👑'
                            },
                            {
                                title: 'RTI Dashboard',
                                url: '/realtime-multimodal-dashboard.html',
                                description: 'Real-time multimodal intelligence',
                                badge: 'Live',
                                icon: '⚡'
                            },
                            {
                                title: 'Cardinals Intelligence',
                                url: '/cardinals-intelligence-dashboard.html',
                                description: 'MLB analytics dashboard',
                                badge: 'MLB',
                                icon: '⚾'
                            }
                        ]
                    },
                    {
                        title: 'Analytics Platforms',
                        items: [
                            {
                                title: 'Hawk-Eye Tracking',
                                url: '/hawkeye-innovations-dashboard.html',
                                description: 'Ball trajectory & strike zone analysis',
                                badge: 'Pro',
                                icon: '👁️'
                            },
                            {
                                title: 'Perfect Game Intelligence',
                                url: '/perfect-game-enhanced.html',
                                description: 'Youth baseball analytics',
                                badge: 'Youth',
                                icon: '🏆'
                            },
                            {
                                title: 'Video Intelligence',
                                url: '/video-intelligence-upload.html',
                                description: 'AI-powered video analysis',
                                badge: 'AI',
                                icon: '🎬'
                            }
                        ]
                    }
                ]
            },
            analytics: {
                title: 'Analytics',
                icon: '📊',
                sections: [
                    {
                        title: 'Core Analytics',
                        items: [
                            {
                                title: 'Advanced Analytics',
                                url: '/analytics.html',
                                description: 'Deep performance insights',
                                badge: 'Core',
                                icon: '📈'
                            },
                            {
                                title: 'NIL Calculator',
                                url: '/nil-calculator-advanced.html',
                                description: 'Name, image, likeness valuation',
                                badge: 'Popular',
                                icon: '💰'
                            },
                            {
                                title: 'SEC Analytics',
                                url: '/sec-nil-analytics.html',
                                description: 'Conference-specific insights',
                                badge: 'SEC',
                                icon: '🏈'
                            }
                        ]
                    },
                    {
                        title: 'Monitoring & Performance',
                        items: [
                            {
                                title: 'Performance Monitor',
                                url: '/performance-monitor.html',
                                description: 'Real-time system metrics',
                                badge: 'Live',
                                icon: '⚡'
                            },
                            {
                                title: 'Character Assessment',
                                url: '/character-assessment.html',
                                description: 'Micro-expression analysis',
                                badge: 'AI',
                                icon: '🧠'
                            }
                        ]
                    }
                ]
            },
            sports: {
                title: 'Sports',
                icon: '🏆',
                sections: [
                    {
                        title: 'Football',
                        items: [
                            {
                                title: 'SEC Football Enhanced',
                                url: '/sec-football-enhanced.html',
                                description: 'Elite college football analytics',
                                badge: 'SEC',
                                icon: '🏈'
                            },
                            {
                                title: 'Deep South Authority',
                                url: '/deep-south-sports-authority.html',
                                description: 'Regional sports intelligence',
                                badge: 'Regional',
                                icon: '🗺️'
                            }
                        ]
                    },
                    {
                        title: 'Baseball',
                        items: [
                            {
                                title: 'Cardinals Intelligence',
                                url: '/cardinals-intelligence-dashboard.html',
                                description: 'St. Louis Cardinals MLB analytics',
                                badge: 'MLB',
                                icon: '⚾'
                            },
                            {
                                title: 'Perfect Game Enhanced',
                                url: '/perfect-game-enhanced.html',
                                description: 'Youth baseball pipeline',
                                badge: 'Youth',
                                icon: '⭐'
                            }
                        ]
                    },
                    {
                        title: 'Advanced Tools',
                        items: [
                            {
                                title: 'Digital Combine™',
                                url: '/digital-combine.html',
                                description: 'Virtual athlete assessment',
                                badge: 'Pro',
                                icon: '🎯'
                            },
                            {
                                title: 'Championship AI',
                                url: '/championship-ai-analytics.html',
                                description: 'AI-powered predictions',
                                badge: 'AI',
                                icon: '🤖'
                            }
                        ]
                    }
                ]
            },
            resources: {
                title: 'Resources',
                icon: '🛠️',
                sections: [
                    {
                        title: 'Get Started',
                        items: [
                            {
                                title: 'Pricing Plans',
                                url: '/pricing.html',
                                description: 'Flexible subscription options',
                                badge: 'Popular',
                                icon: '💳'
                            },
                            {
                                title: 'Request Demo',
                                url: '/demo.html',
                                description: 'See the platform in action',
                                badge: 'Free',
                                icon: '🎬'
                            },
                            {
                                title: 'ROI Calculator',
                                url: '/roi-calculator.html',
                                description: 'Calculate investment return',
                                badge: 'Tool',
                                icon: '📊'
                            }
                        ]
                    },
                    {
                        title: 'Support',
                        items: [
                            {
                                title: 'Contact Us',
                                url: '/contact.html',
                                description: 'Get in touch with our team',
                                badge: 'Support',
                                icon: '💬'
                            },
                            {
                                title: 'API Documentation',
                                url: '/api-docs.html',
                                description: 'Integration guides and references',
                                badge: 'Dev',
                                icon: '📚'
                            },
                            {
                                title: 'About Us',
                                url: '/about.html',
                                description: 'Learn about Blaze Intelligence',
                                badge: 'Info',
                                icon: 'ℹ️'
                            }
                        ]
                    }
                ]
            }
        };

        this.navigationData = navigationData;
        this.updateNavigationHTML();
    }

    updateNavigationHTML() {
        // Find existing navigation and enhance it
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        // Clear existing dropdowns and rebuild with mega-menu structure
        navLinks.innerHTML = `
            <a href="/" class="nav-link ${this.currentPage === '/' ? 'active' : ''}">
                <span class="nav-icon">🏠</span>
                Home
            </a>
            ${Object.entries(this.navigationData).map(([key, section]) => this.createMegaDropdown(key, section)).join('')}
        `;

        // Add search functionality
        this.addSearchToNavigation();
    }

    createMegaDropdown(key, section) {
        return `
            <div class="nav-dropdown mega-dropdown" data-dropdown="${key}">
                <a href="#" class="nav-link dropdown-trigger">
                    <span class="nav-icon">${section.icon}</span>
                    ${section.title}
                    <span class="dropdown-arrow">▾</span>
                </a>
                <div class="mega-dropdown-content">
                    <div class="mega-dropdown-container">
                        <div class="mega-dropdown-header">
                            <h3>${section.icon} ${section.title}</h3>
                            <p>Explore our ${section.title.toLowerCase()} solutions</p>
                        </div>
                        <div class="mega-dropdown-grid">
                            ${section.sections.map(subsection => this.createMegaSection(subsection)).join('')}
                        </div>
                        <div class="mega-dropdown-footer">
                            <div class="quick-actions">
                                <a href="/demo.html" class="quick-action-btn">
                                    🎬 Request Demo
                                </a>
                                <a href="/contact.html" class="quick-action-btn">
                                    💬 Contact Sales
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createMegaSection(subsection) {
        return `
            <div class="mega-section">
                <h4 class="mega-section-title">${subsection.title}</h4>
                <div class="mega-items">
                    ${subsection.items.map(item => this.createMegaItem(item)).join('')}
                </div>
            </div>
        `;
    }

    createMegaItem(item) {
        const isActive = this.currentPage === item.url;
        return `
            <a href="${item.url}" class="mega-item ${isActive ? 'active' : ''}" data-url="${item.url}">
                <div class="mega-item-icon">${item.icon}</div>
                <div class="mega-item-content">
                    <div class="mega-item-header">
                        <span class="mega-item-title">${item.title}</span>
                        <span class="mega-item-badge mega-badge-${item.badge.toLowerCase()}">${item.badge}</span>
                    </div>
                    <p class="mega-item-description">${item.description}</p>
                </div>
                <div class="mega-item-arrow">→</div>
            </a>
        `;
    }

    addSearchToNavigation() {
        const navCta = document.querySelector('.nav-cta');
        if (!navCta) return;

        // Add search before the existing CTA buttons
        const searchHTML = `
            <div class="nav-search">
                <button class="search-trigger" aria-label="Open search">
                    <span class="search-icon">🔍</span>
                </button>
                <div class="search-overlay">
                    <div class="search-container">
                        <div class="search-header">
                            <input type="text" class="search-input" placeholder="Search platform features..." autocomplete="off">
                            <button class="search-close" aria-label="Close search">✕</button>
                        </div>
                        <div class="search-results">
                            <div class="search-suggestions">
                                <h4>Popular Searches</h4>
                                <div class="suggestion-tags">
                                    <span class="suggestion-tag" data-search="nil calculator">NIL Calculator</span>
                                    <span class="suggestion-tag" data-search="cardinals">Cardinals Analytics</span>
                                    <span class="suggestion-tag" data-search="sec football">SEC Football</span>
                                    <span class="suggestion-tag" data-search="perfect game">Perfect Game</span>
                                    <span class="suggestion-tag" data-search="video analysis">Video Analysis</span>
                                </div>
                            </div>
                            <div class="search-no-results" style="display: none;">
                                <p>No results found. Try searching for:</p>
                                <ul>
                                    <li>Analytics tools</li>
                                    <li>Sports dashboards</li>
                                    <li>Team intelligence</li>
                                    <li>Performance metrics</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        navCta.insertAdjacentHTML('afterbegin', searchHTML);
    }

    initializeEventListeners() {
        // Mega dropdown hover events
        document.addEventListener('mouseenter', (e) => {
            const dropdown = e.target.closest('.mega-dropdown');
            if (dropdown) {
                this.showMegaDropdown(dropdown);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const dropdown = e.target.closest('.mega-dropdown');
            if (dropdown && !dropdown.contains(e.relatedTarget)) {
                this.hideMegaDropdown(dropdown);
            }
        }, true);

        // Search functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('.search-trigger')) {
                this.toggleSearch();
            } else if (e.target.closest('.search-close')) {
                this.closeSearch();
            } else if (e.target.closest('.suggestion-tag')) {
                const searchTerm = e.target.dataset.search;
                this.performSearch(searchTerm);
            }
        });

        // Search input
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('search-input')) {
                this.handleSearchInput(e.target.value);
            }
        });

        // Close search on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchOpen) {
                this.closeSearch();
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mega-dropdown')) {
                this.hideAllDropdowns();
            }
        });
    }

    showMegaDropdown(dropdown) {
        this.hideAllDropdowns();
        this.activeDropdown = dropdown;
        dropdown.classList.add('mega-active');

        // Animate dropdown appearance
        const content = dropdown.querySelector('.mega-dropdown-content');
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(-10px)';

            requestAnimationFrame(() => {
                content.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            });
        }
    }

    hideMegaDropdown(dropdown) {
        if (dropdown.classList.contains('mega-active')) {
            dropdown.classList.remove('mega-active');
            this.activeDropdown = null;
        }
    }

    hideAllDropdowns() {
        document.querySelectorAll('.mega-dropdown').forEach(dropdown => {
            dropdown.classList.remove('mega-active');
        });
        this.activeDropdown = null;
    }

    toggleSearch() {
        if (this.searchOpen) {
            this.closeSearch();
        } else {
            this.openSearch();
        }
    }

    openSearch() {
        this.searchOpen = true;
        const overlay = document.querySelector('.search-overlay');
        const input = document.querySelector('.search-input');

        if (overlay && input) {
            overlay.classList.add('search-active');
            document.body.style.overflow = 'hidden';

            // Focus input after animation
            setTimeout(() => {
                input.focus();
            }, 300);
        }
    }

    closeSearch() {
        this.searchOpen = false;
        const overlay = document.querySelector('.search-overlay');
        const input = document.querySelector('.search-input');

        if (overlay && input) {
            overlay.classList.remove('search-active');
            document.body.style.overflow = '';
            input.value = '';
            this.clearSearchResults();
        }
    }

    handleSearchInput(query) {
        if (query.length < 2) {
            this.showSearchSuggestions();
            return;
        }

        const results = this.searchPages(query);
        this.displaySearchResults(results, query);
    }

    searchPages(query) {
        const allPages = [];

        // Flatten navigation data for searching
        Object.values(this.navigationData).forEach(section => {
            section.sections.forEach(subsection => {
                subsection.items.forEach(item => {
                    allPages.push({
                        ...item,
                        section: section.title,
                        subsection: subsection.title
                    });
                });
            });
        });

        // Search logic
        const searchTerms = query.toLowerCase().split(' ');
        return allPages.filter(page => {
            const searchableText = `${page.title} ${page.description} ${page.section} ${page.subsection}`.toLowerCase();
            return searchTerms.every(term => searchableText.includes(term));
        }).slice(0, 8); // Limit results
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <p>No results found for "${query}"</p>
                    <div class="search-suggestions">
                        <h4>Try searching for:</h4>
                        <ul>
                            <li>Analytics tools</li>
                            <li>Sports dashboards</li>
                            <li>Team intelligence</li>
                            <li>Performance metrics</li>
                        </ul>
                    </div>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="search-results-header">
                <h4>Found ${results.length} results for "${query}"</h4>
            </div>
            <div class="search-results-list">
                ${results.map(result => `
                    <a href="${result.url}" class="search-result-item">
                        <div class="search-result-icon">${result.icon}</div>
                        <div class="search-result-content">
                            <div class="search-result-title">${result.title}</div>
                            <div class="search-result-description">${result.description}</div>
                            <div class="search-result-path">${result.section} > ${result.subsection}</div>
                        </div>
                        <div class="search-result-badge">${result.badge}</div>
                    </a>
                `).join('')}
            </div>
        `;
    }

    showSearchSuggestions() {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="search-suggestions">
                <h4>Popular Searches</h4>
                <div class="suggestion-tags">
                    <span class="suggestion-tag" data-search="nil calculator">NIL Calculator</span>
                    <span class="suggestion-tag" data-search="cardinals">Cardinals Analytics</span>
                    <span class="suggestion-tag" data-search="sec football">SEC Football</span>
                    <span class="suggestion-tag" data-search="perfect game">Perfect Game</span>
                    <span class="suggestion-tag" data-search="video analysis">Video Analysis</span>
                    <span class="suggestion-tag" data-search="hawk-eye">Hawk-Eye Tracking</span>
                </div>
            </div>
        `;
    }

    clearSearchResults() {
        this.showSearchSuggestions();
    }

    performSearch(searchTerm) {
        const input = document.querySelector('.search-input');
        if (input) {
            input.value = searchTerm;
            this.handleSearchInput(searchTerm);
        }
    }

    highlightCurrentPage() {
        // Remove all active classes
        document.querySelectorAll('.nav-link, .mega-item').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page
        const currentLinks = document.querySelectorAll(`[href="${this.currentPage}"]`);
        currentLinks.forEach(link => {
            link.classList.add('active');
        });
    }

    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Tab navigation through mega menu items
            if (e.key === 'Tab' && this.activeDropdown) {
                const focusableElements = this.activeDropdown.querySelectorAll('a, button');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }

            // Close dropdown with Escape
            if (e.key === 'Escape' && this.activeDropdown) {
                this.hideAllDropdowns();
                document.querySelector('.dropdown-trigger').focus();
            }
        });
    }

    initializeMobileMenu() {
        // Mobile menu functionality will be added in the CSS and enhanced here
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        // Add mobile menu toggle
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '<span class="hamburger"></span>';
        mobileToggle.setAttribute('aria-label', 'Toggle mobile menu');

        navbar.appendChild(mobileToggle);

        mobileToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        document.body.classList.toggle('mobile-menu-open', this.isMenuOpen);

        const toggle = document.querySelector('.mobile-menu-toggle');
        if (toggle) {
            toggle.classList.toggle('active', this.isMenuOpen);
        }
    }

    preloadPages() {
        // Preload critical pages on hover for faster navigation
        document.addEventListener('mouseenter', (e) => {
            const link = e.target.closest('a[href]');
            if (link && link.href.includes(window.location.hostname)) {
                this.preloadPage(link.href);
            }
        });
    }

    preloadPage(url) {
        if (document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
            return; // Already preloaded
        }

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.blazeNavigation = new BlazeNavigation();
});

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeNavigation;
}