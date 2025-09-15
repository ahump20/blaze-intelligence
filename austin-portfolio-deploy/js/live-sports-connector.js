/**
 * Blaze Intelligence - Live Sports Data Connector
 * Real-time sports data integration with 30-second refresh intervals
 * Supports MLB Stats API, ESPN API for NFL/NBA/NCAA data
 */

class LiveSportsConnector {
    constructor() {
        this.cache = new Map();
        this.cacheTTL = 30000; // 30 seconds
        this.refreshInterval = 30000; // 30 seconds
        this.subscribers = new Map();
        this.isInitialized = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second

        // API Configuration
        this.apis = {
            mlb: {
                base: 'https://statsapi.mlb.com/api/v1',
                endpoints: {
                    games: '/schedule/games',
                    teams: '/teams',
                    standings: '/standings',
                    player: '/people/{playerId}',
                    gameStats: '/game/{gameId}/boxscore',
                    liveFeed: '/game/{gameId}/feed/live'
                }
            },
            espn: {
                base: 'https://site.api.espn.com/apis/site/v2/sports',
                endpoints: {
                    nfl: '/football/nfl',
                    nba: '/basketball/nba',
                    ncaaFootball: '/football/college-football',
                    ncaaBasketball: '/basketball/mens-college-basketball'
                }
            }
        };

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Blaze Intelligence Live Sports Connector...');

            // Start refresh intervals
            this.startRefreshCycle();

            // Load initial data
            await this.loadInitialData();

            this.isInitialized = true;
            console.log('✅ Live Sports Connector initialized successfully');

            // Notify subscribers of initialization
            this.emit('initialized', { timestamp: Date.now() });

        } catch (error) {
            console.error('❌ Failed to initialize Live Sports Connector:', error);
            this.emit('error', { type: 'initialization', error: error.message });
        }
    }

    async loadInitialData() {
        const promises = [
            this.refreshMLBData(),
            this.refreshNFLData(),
            this.refreshNBAData(),
            this.refreshCollegeFootballData()
        ];

        await Promise.allSettled(promises);
    }

    startRefreshCycle() {
        // MLB data refresh (during season)
        setInterval(() => this.refreshMLBData(), this.refreshInterval);

        // NFL data refresh (during season)
        setInterval(() => this.refreshNFLData(), this.refreshInterval);

        // NBA data refresh (during season)
        setInterval(() => this.refreshNBAData(), this.refreshInterval);

        // College football refresh (during season)
        setInterval(() => this.refreshCollegeFootballData(), this.refreshInterval);

        console.log(`🔄 Started refresh cycle - updating every ${this.refreshInterval/1000} seconds`);
    }

    async refreshMLBData() {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Get Cardinals and today's games
            const [gamesData, cardinalsData] = await Promise.all([
                this.fetchWithRetry(`${this.apis.mlb.base}/schedule?date=${today}&sportId=1`),
                this.fetchWithRetry(`${this.apis.mlb.base}/teams/138`) // Cardinals team ID
            ]);

            // Process and cache data
            const mlbData = {
                games: gamesData.dates?.[0]?.games || [],
                cardinals: cardinalsData.teams?.[0] || {},
                lastUpdated: Date.now(),
                season: this.getCurrentMLBSeason()
            };

            // Add live game feeds for Cardinals games
            const cardinalsGames = mlbData.games.filter(game =>
                game.teams.home.team.id === 138 || game.teams.away.team.id === 138
            );

            for (const game of cardinalsGames) {
                if (game.status.detailedState === 'In Progress') {
                    const liveFeed = await this.fetchWithRetry(
                        `${this.apis.mlb.base}/game/${game.gamePk}/feed/live`
                    );
                    mlbData[`game_${game.gamePk}_live`] = liveFeed;
                }
            }

            this.updateCache('mlb', mlbData);
            this.emit('mlb-updated', mlbData);

            console.log('📊 MLB data refreshed:', mlbData.games.length, 'games found');

        } catch (error) {
            console.error('❌ MLB data refresh failed:', error);
            this.emit('error', { type: 'mlb-refresh', error: error.message });
        }
    }

    async refreshNFLData() {
        try {
            const [scoresData, standingsData] = await Promise.all([
                this.fetchWithRetry(`${this.apis.espn.base}/football/nfl/scoreboard`),
                this.fetchWithRetry(`${this.apis.espn.base}/football/nfl/standings`)
            ]);

            const nflData = {
                games: scoresData.events || [],
                standings: standingsData.children || [],
                lastUpdated: Date.now(),
                week: this.getCurrentNFLWeek()
            };

            // Focus on Titans data (Tennessee Titans)
            const titansData = await this.fetchWithRetry(
                `${this.apis.espn.base}/football/nfl/teams/10/roster` // Titans team ID
            );
            nflData.titans = titansData;

            this.updateCache('nfl', nflData);
            this.emit('nfl-updated', nflData);

            console.log('🏈 NFL data refreshed:', nflData.games.length, 'games found');

        } catch (error) {
            console.error('❌ NFL data refresh failed:', error);
            this.emit('error', { type: 'nfl-refresh', error: error.message });
        }
    }

    async refreshNBAData() {
        try {
            const [scoresData, standingsData] = await Promise.all([
                this.fetchWithRetry(`${this.apis.espn.base}/basketball/nba/scoreboard`),
                this.fetchWithRetry(`${this.apis.espn.base}/basketball/nba/standings`)
            ]);

            const nbaData = {
                games: scoresData.events || [],
                standings: standingsData.children || [],
                lastUpdated: Date.now(),
                season: this.getCurrentNBASeason()
            };

            // Focus on Grizzlies data (Memphis Grizzlies)
            const grizzliesData = await this.fetchWithRetry(
                `${this.apis.espn.base}/basketball/nba/teams/15/roster` // Grizzlies team ID
            );
            nbaData.grizzlies = grizzliesData;

            this.updateCache('nba', nbaData);
            this.emit('nba-updated', nbaData);

            console.log('🏀 NBA data refreshed:', nbaData.games.length, 'games found');

        } catch (error) {
            console.error('❌ NBA data refresh failed:', error);
            this.emit('error', { type: 'nba-refresh', error: error.message });
        }
    }

    async refreshCollegeFootballData() {
        try {
            const [scoresData, standingsData] = await Promise.all([
                this.fetchWithRetry(`${this.apis.espn.base}/football/college-football/scoreboard`),
                this.fetchWithRetry(`${this.apis.espn.base}/football/college-football/standings`)
            ]);

            const collegeData = {
                games: scoresData.events || [],
                standings: standingsData.children || [],
                lastUpdated: Date.now(),
                week: this.getCurrentCollegeWeek()
            };

            // Focus on Longhorns data (University of Texas)
            const longhornGames = collegeData.games.filter(game =>
                game.competitions?.[0]?.competitors?.some(team =>
                    team.team.displayName?.includes('Texas') &&
                    team.team.displayName?.includes('Longhorns')
                )
            );

            collegeData.longhorns = {
                games: longhornGames,
                teamId: 251, // Texas Longhorns team ID
                conference: 'SEC'
            };

            this.updateCache('college-football', collegeData);
            this.emit('college-football-updated', collegeData);

            console.log('🎓 College Football data refreshed:', collegeData.games.length, 'games found');

        } catch (error) {
            console.error('❌ College Football data refresh failed:', error);
            this.emit('error', { type: 'college-football-refresh', error: error.message });
        }
    }

    async fetchWithRetry(url, options = {}) {
        let lastError;

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Blaze Intelligence Sports Connector/1.0',
                        'Accept': 'application/json',
                        ...options.headers
                    },
                    ...options
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return data;

            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Attempt ${attempt}/${this.retryAttempts} failed for ${url}:`, error.message);

                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        throw lastError;
    }

    updateCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: this.cacheTTL
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > cached.ttl;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    // Public API methods
    getMLBData() {
        return this.getFromCache('mlb');
    }

    getNFLData() {
        return this.getFromCache('nfl');
    }

    getNBAData() {
        return this.getFromCache('nba');
    }

    getCollegeFootballData() {
        return this.getFromCache('college-football');
    }

    getAllSportsData() {
        return {
            mlb: this.getMLBData(),
            nfl: this.getNFLData(),
            nba: this.getNBAData(),
            collegeFootball: this.getCollegeFootballData(),
            lastSync: Date.now()
        };
    }

    // Event system
    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        this.subscribers.get(event).add(callback);

        return () => {
            this.subscribers.get(event)?.delete(callback);
        };
    }

    emit(event, data) {
        const callbacks = this.subscribers.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in ${event} callback:`, error);
                }
            });
        }
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getCurrentMLBSeason() {
        const now = new Date();
        const year = now.getFullYear();
        return now.getMonth() >= 2 ? year : year - 1; // Season starts in March
    }

    getCurrentNFLWeek() {
        const now = new Date();
        const seasonStart = new Date(now.getFullYear(), 8, 1); // September 1st
        if (now < seasonStart) return 0;

        const weeksSinceStart = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(weeksSinceStart + 1, 18);
    }

    getCurrentNBASeason() {
        const now = new Date();
        const year = now.getFullYear();
        return now.getMonth() >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    }

    getCurrentCollegeWeek() {
        const now = new Date();
        const seasonStart = new Date(now.getFullYear(), 7, 15); // August 15th
        if (now < seasonStart) return 0;

        const weeksSinceStart = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));
        return Math.min(weeksSinceStart + 1, 15);
    }

    // Dashboard integration
    getDashboardMetrics() {
        const allData = this.getAllSportsData();

        return {
            activeGames: this.countActiveGames(allData),
            totalTeamsTracked: 4, // Cardinals, Titans, Longhorns, Grizzlies
            dataFreshness: this.calculateDataFreshness(allData),
            apiStatus: this.getAPIStatus(),
            lastUpdateTime: Math.max(
                allData.mlb?.lastUpdated || 0,
                allData.nfl?.lastUpdated || 0,
                allData.nba?.lastUpdated || 0,
                allData.collegeFootball?.lastUpdated || 0
            )
        };
    }

    countActiveGames(data) {
        let activeCount = 0;

        // Count MLB active games
        activeCount += data.mlb?.games?.filter(game =>
            game.status?.detailedState === 'In Progress'
        ).length || 0;

        // Count NFL active games
        activeCount += data.nfl?.games?.filter(game =>
            game.status?.type?.name === 'STATUS_IN_PROGRESS'
        ).length || 0;

        // Count NBA active games
        activeCount += data.nba?.games?.filter(game =>
            game.status?.type?.name === 'STATUS_IN_PROGRESS'
        ).length || 0;

        // Count College Football active games
        activeCount += data.collegeFootball?.games?.filter(game =>
            game.status?.type?.name === 'STATUS_IN_PROGRESS'
        ).length || 0;

        return activeCount;
    }

    calculateDataFreshness(data) {
        const now = Date.now();
        const freshnesScores = [];

        if (data.mlb?.lastUpdated) {
            freshnesScores.push(1 - Math.min((now - data.mlb.lastUpdated) / this.cacheTTL, 1));
        }
        if (data.nfl?.lastUpdated) {
            freshnesScores.push(1 - Math.min((now - data.nfl.lastUpdated) / this.cacheTTL, 1));
        }
        if (data.nba?.lastUpdated) {
            freshnesScores.push(1 - Math.min((now - data.nba.lastUpdated) / this.cacheTTL, 1));
        }
        if (data.collegeFootball?.lastUpdated) {
            freshnesScores.push(1 - Math.min((now - data.collegeFootball.lastUpdated) / this.cacheTTL, 1));
        }

        return freshnesScores.length > 0
            ? freshnesScores.reduce((a, b) => a + b) / freshnesScores.length
            : 0;
    }

    getAPIStatus() {
        return {
            mlb: this.getFromCache('mlb') ? 'connected' : 'disconnected',
            espn: (this.getFromCache('nfl') || this.getFromCache('nba') || this.getFromCache('college-football'))
                ? 'connected' : 'disconnected'
        };
    }
}

// Global instance
window.LiveSportsConnector = LiveSportsConnector;

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.blazeSportsConnector = new LiveSportsConnector();

    // Expose for dashboard integration
    window.getBlazeSpotrsData = () => window.blazeSportsConnector.getAllSportsData();
    window.getBlazeSportsDashboard = () => window.blazeSportsConnector.getDashboardMetrics();
}

export default LiveSportsConnector;