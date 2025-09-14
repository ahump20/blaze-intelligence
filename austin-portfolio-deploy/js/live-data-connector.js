/**
 * Blaze Intelligence Live Data Connector
 * Connects interactive dashboards to real-time sports analytics
 */

class LiveDataConnector {
    constructor() {
        this.apiBase = '/.netlify/functions/live-dashboard-data';
        this.updateInterval = 30000; // 30 seconds
        this.activeSubscriptions = new Map();
        this.cache = new Map();
        this.isOnline = navigator.onLine;

        this.initializeConnector();
        console.log('🏆 Live Data Connector initialized');
    }

    initializeConnector() {
        // Monitor online status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.resumeAllSubscriptions();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.pauseAllSubscriptions();
        });

        // Initialize dashboard data if dashboard elements exist
        if (document.querySelector('[data-live-dashboard]')) {
            this.initializeDashboard();
        }
    }

    async initializeDashboard() {
        try {
            const dashboardData = await this.fetchDashboardData();
            this.updateDashboardElements(dashboardData);

            // Subscribe to real-time updates
            this.subscribeToDashboard();
            console.log('🎯 Dashboard connected to live data feeds');
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.showOfflineMode();
        }
    }

    async fetchDashboardData() {
        const cacheKey = 'dashboard';

        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
                return cached.data;
            }
        }

        try {
            const response = await fetch(`${this.apiBase}?endpoint=dashboard`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            // Cache the response
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            return this.getFallbackData();
        }
    }

    updateDashboardElements(data) {
        // Update Cardinals readiness metrics
        this.updateElement('[data-cardinals-readiness]', data.cardinals?.overall, 'percentage');
        this.updateElement('[data-cardinals-batting]', data.cardinals?.batting, 'percentage');
        this.updateElement('[data-cardinals-pitching]', data.cardinals?.pitching, 'percentage');
        this.updateElement('[data-cardinals-defense]', data.cardinals?.defense, 'percentage');

        // Update NIL insights
        this.updateElement('[data-nil-today]', data.nilInsights?.todayValue, 'currency');
        this.updateElement('[data-nil-growth]', data.nilInsights?.weekGrowth, 'percentage');
        this.updateElement('[data-nil-top-deal]', data.nilInsights?.topDeal);
        this.updateElement('[data-nil-trending]', data.nilInsights?.trending);

        // Update Perfect Game metrics
        this.updateElement('[data-pg-events]', data.perfectGame?.events);
        this.updateElement('[data-pg-scouts]', data.perfectGame?.scouts);
        this.updateElement('[data-pg-commitments]', data.perfectGame?.commitments);

        // Update Deep South coverage
        this.updateElement('[data-texas-games]', data.deepSouthCoverage?.texas?.games);
        this.updateElement('[data-sec-teams]', data.deepSouthCoverage?.sec?.teams);
        this.updateElement('[data-recruiting-commits]', data.deepSouthCoverage?.recruiting?.commits);

        // Update active games
        this.updateActiveGames(data.activeGames);

        // Update top prospects
        this.updateTopProspects(data.topProspects);

        // Show last updated time
        this.updateElement('[data-last-updated]', new Date().toLocaleTimeString());
    }

    updateElement(selector, value, format = 'text') {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;

        let displayValue = value;

        switch (format) {
            case 'percentage':
                displayValue = value ? `${value.toFixed(1)}%` : 'N/A';
                break;
            case 'currency':
                displayValue = value ? `$${value.toLocaleString()}` : 'N/A';
                break;
            case 'number':
                displayValue = value ? value.toLocaleString() : '0';
                break;
        }

        elements.forEach(element => {
            element.textContent = displayValue;

            // Add animation for updates
            element.style.transition = 'color 0.3s ease';
            element.style.color = '#00FF41'; // Neural green for updates
            setTimeout(() => {
                element.style.color = '';
            }, 1000);
        });
    }

    updateActiveGames(games) {
        const container = document.querySelector('[data-active-games]');
        if (!container || !games) return;

        container.innerHTML = games.map(game => `
            <div class="game-item" style="
                background: rgba(191, 87, 0, 0.1);
                border: 1px solid rgba(191, 87, 0, 0.3);
                border-radius: 8px;
                padding: 1rem;
                margin: 0.5rem 0;
            ">
                <div style="color: #BF5700; font-weight: 600;">${game.teams}</div>
                <div style="color: #9BCBEB; font-size: 0.9rem;">
                    ${game.status} ${game.score || game.weather || ''}
                    ${game.rivalry ? '🏆 Rivalry Game' : ''}
                </div>
            </div>
        `).join('');
    }

    updateTopProspects(prospects) {
        const container = document.querySelector('[data-top-prospects]');
        if (!container || !prospects) return;

        container.innerHTML = prospects.map((prospect, index) => `
            <div class="prospect-item" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(155, 203, 235, 0.2);
            ">
                <div>
                    <div style="color: #fff; font-weight: 600;">${prospect.name || `Prospect #${index + 1}`}</div>
                    <div style="color: #9BCBEB; font-size: 0.8rem;">${prospect.position || 'Multiple'} - ${prospect.school || 'Uncommitted'}</div>
                </div>
                <div style="color: #00B2A9; font-weight: 600;">${prospect.rating || '★★★★'}</div>
            </div>
        `).join('');
    }

    subscribeToDashboard() {
        const subscription = setInterval(async () => {
            if (!this.isOnline) return;

            try {
                const data = await this.fetchDashboardData();
                this.updateDashboardElements(data);
            } catch (error) {
                console.error('Dashboard update failed:', error);
            }
        }, this.updateInterval);

        this.activeSubscriptions.set('dashboard', subscription);
    }

    async fetchSportsData(league) {
        try {
            const response = await fetch(`${this.apiBase}?endpoint=sports&league=${league}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch ${league} data:`, error);
            return null;
        }
    }

    async fetchCardinalsData() {
        try {
            const response = await fetch(`${this.apiBase}?endpoint=cardinals`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch Cardinals data:', error);
            return null;
        }
    }

    async fetchNILData() {
        try {
            const response = await fetch(`${this.apiBase}?endpoint=nil`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch NIL data:', error);
            return null;
        }
    }

    getFallbackData() {
        return {
            timestamp: new Date().toISOString(),
            activeGames: [
                { teams: "Cardinals @ Brewers", status: "Tonight 7:15 PM", rivalry: false }
            ],
            topProspects: [
                { name: "Loading...", position: "Data", school: "Updating" }
            ],
            nilInsights: {
                todayValue: 0,
                weekGrowth: 0,
                topDeal: "Loading...",
                trending: "Data updating..."
            },
            cardinals: {
                overall: 0,
                batting: 0,
                pitching: 0,
                defense: 0
            },
            perfectGame: {
                events: 0,
                scouts: 0,
                commitments: 0
            },
            deepSouthCoverage: {
                texas: { games: 0 },
                sec: { teams: 0 },
                recruiting: { commits: 0 }
            }
        };
    }

    showOfflineMode() {
        const offlineIndicator = document.createElement('div');
        offlineIndicator.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(191, 87, 0, 0.9);
                color: white;
                padding: 1rem;
                border-radius: 8px;
                z-index: 10000;
                font-weight: 600;
            ">
                🔌 Offline Mode - Using cached data
            </div>
        `;
        document.body.appendChild(offlineIndicator);

        setTimeout(() => {
            offlineIndicator.remove();
        }, 5000);
    }

    pauseAllSubscriptions() {
        this.activeSubscriptions.forEach((subscription, key) => {
            clearInterval(subscription);
        });
        console.log('🔄 Data subscriptions paused (offline)');
    }

    resumeAllSubscriptions() {
        this.activeSubscriptions.clear();
        this.initializeDashboard();
        console.log('🔄 Data subscriptions resumed (online)');
    }

    // Public methods for manual data fetching
    async refreshDashboard() {
        const data = await this.fetchDashboardData();
        this.updateDashboardElements(data);
        return data;
    }

    async getSportsAnalytics(league) {
        return await this.fetchSportsData(league);
    }

    async getCardinalsAnalytics() {
        return await this.fetchCardinalsData();
    }

    async getNILAnalytics() {
        return await this.fetchNILData();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.liveDataConnector = new LiveDataConnector();
});

// Export for external use
window.LiveDataConnector = LiveDataConnector;