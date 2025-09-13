/**
 * Blaze Intelligence Unified Navigation System
 * Championship-level platform navigation connecting all features
 */

class BlazeUnifiedNavigation {
    constructor() {
        this.platforms = {
            main: 'https://blaze-intelligence.netlify.app',
            replit: 'https://blaze-intelligence-replit.netlify.app',
            original: 'https://blaze-intelligence.replit.app'
        };

        this.features = {
            intelligence: [
                { name: 'AI Consciousness', path: '/unified-championship-dashboard.html', icon: 'fa-brain', priority: 'championship' },
                { name: 'Video Intelligence', path: '/api/video-intelligence', icon: 'fa-video', priority: 'elite' },
                { name: 'Live Metrics', path: '/dashboard.html', icon: 'fa-chart-line', priority: 'championship' },
                { name: 'Data Stories', path: '/api/narrative-generator', icon: 'fa-book-open', priority: 'elite' }
            ],
            sports: [
                { name: 'Cardinals Analytics', path: '/cardinals-intelligence.html', icon: 'fa-baseball-ball', team: 'MLB' },
                { name: 'Titans Command', path: '/titans-intelligence.html', icon: 'fa-football-ball', team: 'NFL' },
                { name: 'Longhorns Recruiting', path: '/longhorns-intelligence.html', icon: 'fa-university', team: 'NCAA' },
                { name: 'Grizzlies Metrics', path: '/grizzlies-intelligence.html', icon: 'fa-basketball-ball', team: 'NBA' },
                { name: 'Perfect Game Pipeline', path: '/perfect-game-analytics.html', icon: 'fa-trophy', team: 'Youth' },
                { name: 'SEC Football Intel', path: '/sec-football.html', icon: 'fa-helmet-safety', team: 'SEC' }
            ],
            tools: [
                { name: 'NIL Calculator', path: '/nil-calculator', icon: 'fa-calculator', type: 'valuation' },
                { name: 'Scouting Reports', path: '/scouting', icon: 'fa-clipboard-list', type: 'analysis' },
                { name: 'Recruitment Tracker', path: '/recruitment', icon: 'fa-user-graduate', type: 'tracking' },
                { name: 'Championship Predictor', path: '/predictor', icon: 'fa-chart-area', type: 'prediction' }
            ],
            demos: [
                { name: 'Live Demo', path: '/live-demo', icon: 'fa-play-circle' },
                { name: 'Chad Tatum Demo', path: '/chad-tatum', icon: 'fa-user-tie' },
                { name: 'Orioles Executive', path: '/orioles', icon: 'fa-briefcase' },
                { name: 'Project Blackbird', path: '/blackbird', icon: 'fa-crow' }
            ]
        };

        this.init();
    }

    init() {
        // Initialize navigation on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupNavigation());
        } else {
            this.setupNavigation();
        }

        // Set up real-time feature updates
        this.initializeRealTimeUpdates();
    }

    setupNavigation() {
        // Create unified navigation menu
        const navContainer = document.getElementById('unified-nav') || this.createNavContainer();

        // Build navigation structure
        const navHTML = this.buildNavigationHTML();
        navContainer.innerHTML = navHTML;

        // Attach event handlers
        this.attachEventHandlers();

        // Highlight current page
        this.highlightCurrentPage();

        // Initialize mobile menu
        this.initializeMobileMenu();
    }

    createNavContainer() {
        const nav = document.createElement('nav');
        nav.id = 'unified-nav';
        nav.className = 'blaze-unified-navigation';

        // Insert at top of body or after header
        const header = document.querySelector('header') || document.querySelector('.header');
        if (header) {
            header.insertAdjacentElement('afterend', nav);
        } else {
            document.body.insertAdjacentElement('afterbegin', nav);
        }

        return nav;
    }

    buildNavigationHTML() {
        return `
            <div class="nav-wrapper">
                <div class="nav-brand">
                    <a href="/" class="brand-link">
                        <span class="brand-icon">🔥</span>
                        <span class="brand-text">Blaze Intelligence</span>
                        <span class="brand-tagline">Championship Platform</span>
                    </a>
                </div>

                <div class="nav-menu">
                    <!-- Intelligence Features -->
                    <div class="nav-section">
                        <button class="nav-dropdown-toggle" data-section="intelligence">
                            <i class="fas fa-brain"></i>
                            Intelligence
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="nav-dropdown" id="dropdown-intelligence">
                            ${this.buildDropdownItems(this.features.intelligence)}
                        </div>
                    </div>

                    <!-- Sports Analytics -->
                    <div class="nav-section">
                        <button class="nav-dropdown-toggle" data-section="sports">
                            <i class="fas fa-trophy"></i>
                            Sports
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="nav-dropdown" id="dropdown-sports">
                            ${this.buildDropdownItems(this.features.sports)}
                        </div>
                    </div>

                    <!-- Tools & Calculators -->
                    <div class="nav-section">
                        <button class="nav-dropdown-toggle" data-section="tools">
                            <i class="fas fa-tools"></i>
                            Tools
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="nav-dropdown" id="dropdown-tools">
                            ${this.buildDropdownItems(this.features.tools)}
                        </div>
                    </div>

                    <!-- Live Demos -->
                    <div class="nav-section">
                        <button class="nav-dropdown-toggle" data-section="demos">
                            <i class="fas fa-play"></i>
                            Demos
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="nav-dropdown" id="dropdown-demos">
                            ${this.buildDropdownItems(this.features.demos)}
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="nav-actions">
                        <a href="/unified-championship-dashboard.html" class="nav-cta dashboard-link">
                            <i class="fas fa-tachometer-alt"></i>
                            Dashboard
                        </a>
                        <a href="/contact.html" class="nav-cta primary">
                            Start Free Trial
                        </a>
                    </div>
                </div>

                <!-- Mobile Menu Toggle -->
                <button class="mobile-menu-toggle" aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        `;
    }

    buildDropdownItems(items) {
        return items.map(item => {
            const badge = item.priority ? `<span class="priority-badge ${item.priority}">${item.priority}</span>` : '';
            const teamBadge = item.team ? `<span class="team-badge">${item.team}</span>` : '';
            const typeBadge = item.type ? `<span class="type-badge">${item.type}</span>` : '';

            return `
                <a href="${item.path}" class="dropdown-item">
                    <i class="fas ${item.icon}"></i>
                    <span>${item.name}</span>
                    ${badge}${teamBadge}${typeBadge}
                </a>
            `;
        }).join('');
    }

    attachEventHandlers() {
        // Dropdown toggles
        document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const section = toggle.dataset.section;
                this.toggleDropdown(section);
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-section')) {
                this.closeAllDropdowns();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }

    toggleDropdown(section) {
        const dropdown = document.getElementById(`dropdown-${section}`);
        const toggle = document.querySelector(`[data-section="${section}"]`);

        if (dropdown && toggle) {
            const isOpen = dropdown.classList.contains('active');

            // Close all other dropdowns
            this.closeAllDropdowns();

            if (!isOpen) {
                dropdown.classList.add('active');
                toggle.classList.add('active');
            }
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
    }

    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');

        if (navMenu && mobileToggle) {
            navMenu.classList.toggle('mobile-active');
            mobileToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        }
    }

    highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const currentLink = document.querySelector(`a[href="${currentPath}"]`);

        if (currentLink) {
            currentLink.classList.add('current-page');

            // Also highlight parent section
            const parentSection = currentLink.closest('.nav-section');
            if (parentSection) {
                const toggle = parentSection.querySelector('.nav-dropdown-toggle');
                if (toggle) {
                    toggle.classList.add('section-active');
                }
            }
        }
    }

    initializeMobileMenu() {
        // Add touch support for mobile dropdowns
        if ('ontouchstart' in window) {
            document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
                toggle.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const section = toggle.dataset.section;
                    this.toggleDropdown(section);
                });
            });
        }
    }

    initializeRealTimeUpdates() {
        // Connect to SSE for live navigation updates (new features, alerts, etc.)
        if (typeof(EventSource) !== "undefined") {
            const updateSource = new EventSource('/api/navigation-updates');

            updateSource.onmessage = (event) => {
                const update = JSON.parse(event.data);
                this.handleNavigationUpdate(update);
            };
        }
    }

    handleNavigationUpdate(update) {
        // Handle real-time navigation updates
        if (update.type === 'new_feature') {
            console.log('New feature available:', update.feature);
            // Could add a badge or notification
        } else if (update.type === 'alert') {
            // Show navigation alert
            this.showNavigationAlert(update.message);
        }
    }

    showNavigationAlert(message) {
        const alertEl = document.createElement('div');
        alertEl.className = 'nav-alert';
        alertEl.textContent = message;

        const nav = document.getElementById('unified-nav');
        if (nav) {
            nav.appendChild(alertEl);

            setTimeout(() => {
                alertEl.remove();
            }, 5000);
        }
    }
}

// Initialize navigation system
const blazeNav = new BlazeUnifiedNavigation();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeUnifiedNavigation;
}