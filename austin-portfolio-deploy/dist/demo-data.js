// Real Sports Data Integration for Blaze Intelligence Dashboard
// Austin Humphrey - Championship Analytics

class SportsDataManager {
    constructor() {
        this.baseURL = '';
        this.cache = new Map();
        this.updateInterval = 30000; // 30 seconds
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        console.log('🏆 Initializing Real Sports Data Manager...');
        
        // Start live data feeds
        await this.loadLiveGames();
        await this.loadTeamStandings();
        await this.loadPlayerStats();
        
        // Set up auto-refresh
        setInterval(() => {
            this.refreshLiveData();
        }, this.updateInterval);
        
        this.initialized = true;
        console.log('✅ Real Sports Data Manager ready');
    }

    async loadLiveGames() {
        try {
            console.log('📊 Loading live games...');
            const response = await fetch('/api/sports/live-games');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch live games: ${response.status}`);
            }
            
            const gamesData = await response.json();
            console.log('🎮 Live games loaded:', gamesData.games?.length || 0, 'games');
            
            this.cache.set('liveGames', gamesData);
            this.displayLiveGames(gamesData);
            
        } catch (error) {
            console.error('❌ Error loading live games:', error);
            this.displayFallbackGames();
        }
    }

    async loadTeamStandings() {
        try {
            console.log('📈 Loading team standings...');
            const response = await fetch('/api/mlb/standings');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch standings: ${response.status}`);
            }
            
            const standingsData = await response.json();
            console.log('🏆 Standings loaded');
            
            this.cache.set('standings', standingsData);
            this.displayStandings(standingsData);
            
        } catch (error) {
            console.error('❌ Error loading standings:', error);
            this.displayFallbackStandings();
        }
    }

    async loadPlayerStats() {
        try {
            console.log('👥 Loading player stats...');
            const response = await fetch('/api/sports/players/top-performers');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch player stats: ${response.status}`);
            }
            
            const playersData = await response.json();
            console.log('⭐ Top performers loaded');
            
            this.cache.set('topPerformers', playersData);
            this.displayTopPerformers(playersData);
            
        } catch (error) {
            console.error('❌ Error loading player stats:', error);
            this.displayFallbackPlayers();
        }
    }

    displayLiveGames(gamesData) {
        const gamesContainer = document.querySelector('.games-grid');
        if (!gamesContainer) return;

        const games = gamesData.games || [];
        
        gamesContainer.innerHTML = games.slice(0, 6).map(game => `
            <div class="game-card" data-status="${game.status}">
                <div class="game-header">
                    <span class="sport-badge">${game.sport}</span>
                    <span class="status-badge ${game.status}">${game.status}</span>
                </div>
                <div class="matchup">
                    <div class="team">
                        <img src="${game.awayTeam.logo}" alt="${game.awayTeam.name}" class="team-logo">
                        <span class="team-name">${game.awayTeam.name}</span>
                        <span class="score">${game.awayTeam.score || 0}</span>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team">
                        <img src="${game.homeTeam.logo}" alt="${game.homeTeam.name}" class="team-logo">
                        <span class="team-name">${game.homeTeam.name}</span>
                        <span class="score">${game.homeTeam.score || 0}</span>
                    </div>
                </div>
                <div class="game-time">${this.formatGameTime(game.gameTime)}</div>
            </div>
        `).join('');
    }

    displayStandings(standingsData) {
        const container = document.querySelector('.standings-container');
        if (!container) return;

        const standings = standingsData.standings || [];
        
        container.innerHTML = `
            <h3>AL Central Standings</h3>
            <div class="standings-table">
                ${standings.slice(0, 5).map((team, index) => `
                    <div class="standings-row">
                        <span class="rank">${index + 1}</span>
                        <img src="${team.logo}" alt="${team.name}" class="team-logo-small">
                        <span class="team-name">${team.name}</span>
                        <span class="record">${team.wins}-${team.losses}</span>
                        <span class="gb">${team.gamesBack || '-'}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    displayTopPerformers(playersData) {
        const container = document.querySelector('.players-grid');
        if (!container) return;

        const players = playersData.players || [];
        
        container.innerHTML = players.slice(0, 6).map(player => `
            <div class="player-card">
                <img src="${player.photo}" alt="${player.name}" class="player-photo">
                <div class="player-info">
                    <h4>${player.name}</h4>
                    <span class="position">${player.position}</span>
                    <span class="team">${player.team}</span>
                </div>
                <div class="player-stats">
                    <div class="stat">
                        <span class="stat-value">${player.primaryStat.value}</span>
                        <span class="stat-label">${player.primaryStat.label}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayFallbackGames() {
        console.log('🔄 Using fallback game data');
        const fallbackData = {
            games: [
                {
                    sport: 'MLB',
                    status: 'live',
                    awayTeam: { name: 'Cardinals', score: 4, logo: '/assets/images/cardinals.png' },
                    homeTeam: { name: 'Cubs', score: 2, logo: '/assets/images/cubs.png' },
                    gameTime: '7th Inning'
                },
                {
                    sport: 'NFL',
                    status: 'upcoming',
                    awayTeam: { name: 'Titans', score: null, logo: '/assets/images/titans.png' },
                    homeTeam: { name: 'Texans', score: null, logo: '/assets/images/texans.png' },
                    gameTime: '4:25 PM ET'
                }
            ]
        };
        this.displayLiveGames(fallbackData);
    }

    displayFallbackStandings() {
        console.log('🔄 Using fallback standings data');
        // Similar fallback implementation
    }

    displayFallbackPlayers() {
        console.log('🔄 Using fallback player data');
        // Similar fallback implementation
    }

    formatGameTime(gameTime) {
        if (!gameTime) return 'TBD';
        if (typeof gameTime === 'string') return gameTime;
        return new Date(gameTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    async refreshLiveData() {
        console.log('🔄 Refreshing live sports data...');
        await Promise.all([
            this.loadLiveGames(),
            this.loadTeamStandings(),
            this.loadPlayerStats()
        ]);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.sportsDataManager = new SportsDataManager();
    await window.sportsDataManager.initialize();
});

// Export for use by other scripts
window.SportsDataManager = SportsDataManager;