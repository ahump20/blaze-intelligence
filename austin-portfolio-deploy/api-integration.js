// API Integration Layer for Blaze Intelligence
// Real-time sports data connectivity and management

class BlazeAPIConnector {
    constructor() {
        this.endpoints = {
            liveGames: '/api/sports/live-games',
            nflTeams: '/api/nfl/teams',
            mlbStandings: '/api/mlb/standings',
            playerStats: '/api/sports/players/stats',
            analytics: '/api/analytics/dashboard',
            consciousness: '/api/ai/consciousness/health'
        };
        
        this.connectionStatus = 'disconnected';
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.retryDelay = 2000;
    }

    async initialize() {
        console.log('🔌 Initializing Blaze API Connector...');
        
        // Test API connectivity
        await this.testConnection();
        
        // Initialize real-time updates
        this.setupRealTimeUpdates();
        
        // Setup error handling
        this.setupErrorHandling();
        
        console.log('✅ API Connector ready');
    }

    async testConnection() {
        try {
            console.log('🧪 Testing API connections...');
            
            const healthCheck = await fetch('/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Version': '2.0.0'
                }
            });

            if (healthCheck.ok) {
                this.connectionStatus = 'connected';
                console.log('🟢 API connection healthy');
                this.updateConnectionStatus(true);
            } else {
                throw new Error('Health check failed');
            }
            
        } catch (error) {
            console.error('🔴 API connection failed:', error);
            this.connectionStatus = 'error';
            this.updateConnectionStatus(false);
            await this.handleConnectionError();
        }
    }

    async fetchSportsData(endpoint, options = {}) {
        const url = this.endpoints[endpoint] || endpoint;
        
        try {
            console.log(`📊 Fetching data from ${url}...`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Version': '2.0.0',
                    'X-Requested-With': 'BlazeIntelligence',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Data received from ${endpoint}:`, {
                size: JSON.stringify(data).length,
                timestamp: new Date().toISOString()
            });
            
            this.retryAttempts = 0; // Reset on success
            return data;
            
        } catch (error) {
            console.error(`❌ Error fetching ${endpoint}:`, error);
            return await this.handleAPIError(endpoint, error);
        }
    }

    async handleAPIError(endpoint, error) {
        if (this.retryAttempts < this.maxRetries) {
            this.retryAttempts++;
            console.log(`🔄 Retrying ${endpoint} (${this.retryAttempts}/${this.maxRetries})...`);
            
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * this.retryAttempts));
            return this.fetchSportsData(endpoint);
        } else {
            console.error(`💥 Failed to fetch ${endpoint} after ${this.maxRetries} attempts`);
            this.showUserFriendlyError(endpoint);
            return this.getFallbackData(endpoint);
        }
    }

    getFallbackData(endpoint) {
        console.log(`🔄 Using fallback data for ${endpoint}`);
        
        const fallbackData = {
            liveGames: {
                status: 'success',
                games: [
                    {
                        id: 'fallback-1',
                        sport: 'MLB',
                        status: 'live',
                        awayTeam: { name: 'STL Cardinals', score: 5, abbreviation: 'STL' },
                        homeTeam: { name: 'CHC Cubs', score: 3, abbreviation: 'CHC' },
                        gameTime: '7th Inning',
                        venue: 'Wrigley Field'
                    }
                ],
                timestamp: new Date().toISOString(),
                source: 'fallback'
            },
            mlbStandings: {
                status: 'success',
                standings: [
                    { team: 'Cardinals', wins: 83, losses: 79, pct: 0.512, gb: 0 },
                    { team: 'Cubs', wins: 81, losses: 81, pct: 0.500, gb: 2 },
                    { team: 'Brewers', wins: 79, losses: 83, pct: 0.488, gb: 4 }
                ],
                source: 'fallback'
            }
        };
        
        return fallbackData[endpoint] || { status: 'error', message: 'No data available' };
    }

    setupRealTimeUpdates() {
        // Real-time dashboard updates
        setInterval(async () => {
            if (this.connectionStatus === 'connected') {
                await this.updateDashboardData();
            }
        }, 30000); // Update every 30 seconds

        console.log('🔄 Real-time updates configured');
    }

    async updateDashboardData() {
        try {
            console.log('📊 Updating dashboard data...');
            
            const [gamesData, standingsData] = await Promise.all([
                this.fetchSportsData('liveGames'),
                this.fetchSportsData('mlbStandings')
            ]);

            // Update UI components
            this.updateLiveScores(gamesData);
            this.updateStandings(standingsData);
            
            // Update timestamp
            this.updateLastRefresh();
            
        } catch (error) {
            console.error('❌ Error updating dashboard:', error);
        }
    }

    updateLiveScores(data) {
        const element = document.querySelector('.live-scores-container');
        if (!element || !data.games) return;

        element.innerHTML = data.games.slice(0, 4).map(game => `
            <div class="live-score-card" data-status="${game.status}">
                <div class="teams">
                    <span class="away">${game.awayTeam.abbreviation} ${game.awayTeam.score || 0}</span>
                    <span class="vs">-</span>
                    <span class="home">${game.homeTeam.abbreviation} ${game.homeTeam.score || 0}</span>
                </div>
                <div class="status">${game.gameTime}</div>
            </div>
        `).join('');
    }

    updateStandings(data) {
        const element = document.querySelector('.standings-preview');
        if (!element || !data.standings) return;

        element.innerHTML = data.standings.slice(0, 3).map((team, index) => `
            <div class="standing-row">
                <span class="rank">${index + 1}</span>
                <span class="team">${team.team}</span>
                <span class="record">${team.wins}-${team.losses}</span>
            </div>
        `).join('');
    }

    updateLastRefresh() {
        const elements = document.querySelectorAll('.last-update');
        const time = new Date().toLocaleTimeString();
        elements.forEach(el => {
            el.textContent = `Updated: ${time}`;
        });
    }

    updateConnectionStatus(isConnected) {
        const statusElement = document.querySelector('.connection-status');
        if (!statusElement) return;

        statusElement.className = `connection-status ${isConnected ? 'connected' : 'disconnected'}`;
        statusElement.textContent = isConnected ? 'Live Data Active' : 'Connection Error';
    }

    showUserFriendlyError(endpoint) {
        const errorContainer = document.querySelector('.error-notifications');
        if (!errorContainer) return;

        const errorMessage = `
            <div class="error-notification" data-endpoint="${endpoint}">
                <span class="error-icon">⚠️</span>
                <span class="error-text">Unable to load live ${endpoint} data. Using cached results.</span>
                <button class="retry-btn" onclick="window.apiConnector.fetchSportsData('${endpoint}')">Retry</button>
            </div>
        `;
        
        errorContainer.innerHTML = errorMessage;
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            errorContainer.innerHTML = '';
        }, 10000);
    }

    async handleConnectionError() {
        console.log('🔧 Attempting connection recovery...');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        if (this.retryAttempts < this.maxRetries) {
            await this.testConnection();
        }
    }

    setupErrorHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });

        window.addEventListener('error', (event) => {
            console.error('🚨 JavaScript error:', event.error);
        });
    }

    // Utility methods for components
    async getLiveGames() {
        return this.fetchSportsData('liveGames');
    }

    async getMLBStandings() {
        return this.fetchSportsData('mlbStandings');
    }

    async getNFLTeams() {
        return this.fetchSportsData('nflTeams');
    }
}

// Initialize API connector
document.addEventListener('DOMContentLoaded', async () => {
    window.apiConnector = new BlazeAPIConnector();
    await window.apiConnector.initialize();
});

// Export for use by other modules
window.BlazeAPIConnector = BlazeAPIConnector;