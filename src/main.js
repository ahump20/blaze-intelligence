/**
 * Blaze Intelligence Unified Championship Hub
 * Main application logic for rendering championship platform tiles
 */

import { appsConfig } from './apps.json' assert { type: 'json' };

class ChampionshipHub {
    constructor() {
        this.apps = appsConfig.apps;
        this.categories = appsConfig.categories;
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHeader();
        this.renderFilters();
        this.renderApps();
        this.setupAnimations();
        console.log('🏆 Blaze Intelligence Championship Hub Initialized');
    }

    setupEventListeners() {
        // Filter event listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.handleFilterChange(e.target.dataset.filter);
            }

            if (e.target.classList.contains('app-launch-btn')) {
                this.handleAppLaunch(e.target.dataset.appId, e.target.dataset.embed);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('app-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    renderHeader() {
        const headerContainer = document.getElementById('hub-header');
        if (!headerContainer) return;

        headerContainer.innerHTML = `
            <div class="championship-header">
                <div class="header-content">
                    <div class="brand-section">
                        <div class="brand-icon">
                            <div class="championship-logo"></div>
                        </div>
                        <div class="brand-text">
                            <h1>Blaze Intelligence</h1>
                            <p>Championship Intelligence For Elite Sports Programs</p>
                        </div>
                    </div>
                    <div class="stats-section">
                        <div class="stat-item">
                            <span class="stat-number">${appsConfig.metadata.total_apps}</span>
                            <span class="stat-label">Platforms</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${appsConfig.metadata.live_apps}</span>
                            <span class="stat-label">Live</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">2.8M+</span>
                            <span class="stat-label">Data Points</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">94.6%</span>
                            <span class="stat-label">Accuracy</span>
                        </div>
                    </div>
                </div>
                <div class="search-section">
                    <input type="text" id="app-search" placeholder="Search championship platforms..." />
                </div>
            </div>
        `;
    }

    renderFilters() {
        const filtersContainer = document.getElementById('hub-filters');
        if (!filtersContainer) return;

        const filterButtons = [
            { id: 'all', label: 'All Platforms', count: this.apps.length },
            { id: 'primary', label: 'Championship', count: this.apps.filter(app => app.type === 'primary' || app.type === 'hub').length },
            { id: 'dashboard', label: 'Live Analytics', count: this.apps.filter(app => app.type === 'dashboard' || app.type === 'monitoring').length },
            { id: 'visualization', label: '3D & AI', count: this.apps.filter(app => app.type === 'visualization' || app.type === 'ai').length },
            { id: 'replit', label: 'Deep South', count: this.apps.filter(app => app.type === 'replit' || app.type === 'mirror').length }
        ];

        filtersContainer.innerHTML = `
            <div class="filter-controls">
                ${filterButtons.map(filter => `
                    <button class="filter-btn ${filter.id === 'all' ? 'active' : ''}"
                            data-filter="${filter.id}">
                        ${filter.label}
                        <span class="filter-count">${filter.count}</span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderApps(filteredApps = null) {
        const appsContainer = document.getElementById('hub-apps');
        if (!appsContainer) return;

        const appsToRender = filteredApps || this.apps;

        appsContainer.innerHTML = `
            <div class="apps-grid">
                ${appsToRender.map(app => this.renderAppCard(app)).join('')}
            </div>
        `;

        // Initialize app card animations
        this.animateAppCards();
    }

    renderAppCard(app) {
        const iconSvg = this.getIconSvg(app.icon);
        const statusBadge = this.getStatusBadge(app.status);

        return `
            <div class="app-card" data-type="${app.type}" data-status="${app.status}">
                <div class="app-header">
                    <div class="app-icon">${iconSvg}</div>
                    <div class="app-status">${statusBadge}</div>
                </div>

                <div class="app-content">
                    <h3 class="app-name">${app.name}</h3>
                    <p class="app-description">${app.description}</p>

                    <div class="app-tags">
                        ${app.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>

                    <div class="app-features">
                        ${app.features.slice(0, 2).map(feature => `
                            <div class="feature-item">
                                <span class="feature-icon">⚡</span>
                                <span class="feature-text">${feature}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="app-actions">
                    <button class="app-launch-btn primary"
                            data-app-id="${app.id}"
                            data-embed="${app.embed}">
                        ${app.embed ? 'Launch Platform' : 'Open Platform'}
                    </button>
                    ${app.embed ? `
                        <button class="app-launch-btn secondary"
                                data-app-id="${app.id}"
                                data-embed="false">
                            New Tab
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getIconSvg(iconType) {
        const icons = {
            trophy: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>`,
            activity: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>`,
            zap: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
            </svg>`,
            globe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>`,
            brain: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a3 3 0 0 0-3 3 4 4 0 0 0-4 4v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9a4 4 0 0 0-4-4 3 3 0 0 0-3-3z"/>
                <path d="M16 8a4 4 0 0 1 4 4v6a1 1 0 0 1-1 1h-3"/>
            </svg>`,
            monitor: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>`,
            video: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="23,7 16,12 23,17 23,7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>`,
            mirror: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/>
                <path d="M21 12h-6m-6 0H3"/><path d="m19.5 7.5-4.24 4.24m-6.36 0L4.66 7.5"/>
                <path d="m19.5 16.5-4.24-4.24m-6.36 0L4.66 16.5"/>
            </svg>`,
            server: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
            </svg>`
        };

        return icons[iconType] || icons.trophy;
    }

    getStatusBadge(status) {
        const badges = {
            live: '<span class="status-badge live">Live</span>',
            ready: '<span class="status-badge ready">Ready</span>',
            development: '<span class="status-badge dev">Dev</span>'
        };

        return badges[status] || badges.live;
    }

    handleFilterChange(filterType) {
        this.currentFilter = filterType;

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');

        // Filter apps
        let filteredApps = this.apps;

        if (filterType !== 'all') {
            filteredApps = this.apps.filter(app => {
                switch (filterType) {
                    case 'primary':
                        return ['primary', 'hub'].includes(app.type);
                    case 'dashboard':
                        return ['dashboard', 'monitoring'].includes(app.type);
                    case 'visualization':
                        return ['visualization', 'ai'].includes(app.type);
                    case 'replit':
                        return ['replit', 'mirror'].includes(app.type);
                    default:
                        return true;
                }
            });
        }

        this.renderApps(filteredApps);
    }

    handleSearch(searchTerm) {
        const filteredApps = this.apps.filter(app =>
            app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
            app.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        this.renderApps(filteredApps);
    }

    handleAppLaunch(appId, shouldEmbed) {
        const app = this.apps.find(a => a.id === appId);
        if (!app) return;

        const embed = shouldEmbed === 'true';

        if (embed) {
            // Launch in embedded frame
            window.location.href = `/app-frame.html?app=${appId}&url=${encodeURIComponent(app.url)}&name=${encodeURIComponent(app.name)}`;
        } else {
            // Open in new tab
            window.open(app.url, '_blank', 'noopener,noreferrer');
        }

        // Analytics tracking
        this.trackAppLaunch(app, embed);
    }

    trackAppLaunch(app, embedded) {
        console.log(`🚀 App Launch: ${app.name} (${embedded ? 'embedded' : 'new tab'})`);

        // Add your analytics tracking here
        if (window.gtag) {
            window.gtag('event', 'app_launch', {
                app_name: app.name,
                app_type: app.type,
                launch_mode: embedded ? 'embedded' : 'new_tab'
            });
        }
    }

    setupAnimations() {
        // GSAP animations for the championship hub
        if (window.gsap && window.ScrollTrigger) {
            // Animate header on load
            gsap.from('.championship-header', {
                y: -50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });

            // Animate stats
            gsap.from('.stat-item', {
                scale: 0.8,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                delay: 0.3,
                ease: 'back.out(1.7)'
            });
        }
    }

    animateAppCards() {
        // Animate app cards when they're rendered
        if (window.gsap) {
            gsap.from('.app-card', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            });
        }
    }
}

// Initialize the Championship Hub when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChampionshipHub();
});