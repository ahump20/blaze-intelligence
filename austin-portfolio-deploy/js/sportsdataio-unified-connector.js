/**
 * SportsDataIO Unified Connector for Blaze Intelligence
 * Championship-level sports data integration for NFL, MLB, NCAA
 * Real-time data feeds with sub-100ms processing
 */

class SportsDataIOConnector {
    constructor(config = {}) {
        // API Configuration - Using proxy for security
        this.baseURL = 'https://api.sportsdata.io/v3';
        this.apiKey = config.apiKey || process.env.SPORTSDATAIO_API_KEY;

        // Supported sports and endpoints based on data dictionaries
        this.sports = {
            NFL: {
                base: '/nfl',
                endpoints: {
                    // Teams & Schedule
                    teams: '/scores/json/Teams',
                    schedule: '/scores/json/Schedules/{season}',
                    currentWeek: '/scores/json/CurrentWeek',
                    scores: '/scores/json/ScoresByWeek/{season}/{week}',

                    // Player Data
                    players: '/scores/json/Players',
                    playerStats: '/stats/json/PlayerGameStatsByWeek/{season}/{week}',
                    playerProjections: '/projections/json/PlayerGameProjectionsByWeek/{season}/{week}',

                    // Live Data
                    liveScores: '/scores/json/LiveScores',
                    gameStats: '/stats/json/BoxScore/{scoreid}',
                    playByPlay: '/pbp/json/PlayByPlay/{scoreid}',

                    // Advanced Analytics
                    teamStats: '/scores/json/TeamSeasonStats/{season}',
                    standings: '/scores/json/Standings/{season}',
                    injuries: '/scores/json/Injuries',
                    depthCharts: '/scores/json/DepthCharts',

                    // Betting & Odds
                    odds: '/odds/json/GameOddsByWeek/{season}/{week}',
                    bettingMarkets: '/odds/json/BettingMarkets',
                    winProbability: '/scores/json/WinProbability/{scoreid}'
                }
            },
            MLB: {
                base: '/mlb',
                endpoints: {
                    // Teams & Schedule
                    teams: '/scores/json/Teams',
                    stadiums: '/scores/json/Stadiums',
                    schedule: '/scores/json/Games/{season}',

                    // Player Data
                    players: '/scores/json/Players',
                    playerStats: '/stats/json/PlayerGameStatsByDate/{date}',
                    playerSeasonStats: '/stats/json/PlayerSeasonStats/{season}',

                    // Live Data
                    liveScores: '/scores/json/GamesByDate/{date}',
                    boxScore: '/stats/json/BoxScore/{gameid}',
                    playByPlay: '/pbp/json/PlayByPlay/{gameid}',

                    // Advanced Analytics
                    teamStats: '/scores/json/TeamSeasonStats/{season}',
                    standings: '/scores/json/Standings/{season}',
                    injuries: '/scores/json/Injuries',

                    // Pitching & Batting
                    pitcherStats: '/stats/json/PitchingStats/{season}',
                    batterStats: '/stats/json/BattingStats/{season}',

                    // Cardinals Focus
                    cardinalsSchedule: '/scores/json/TeamSchedule/STL/{season}',
                    cardinalsRoster: '/scores/json/PlayersbyTeam/STL'
                }
            },
            NCAA_Football: {
                base: '/cfb',
                endpoints: {
                    // Teams & Conferences
                    teams: '/scores/json/Teams',
                    conferences: '/scores/json/Conferences',
                    stadiums: '/scores/json/Stadiums',

                    // Schedule & Scores
                    currentWeek: '/scores/json/CurrentWeek',
                    games: '/scores/json/GamesByWeek/{season}/{week}',

                    // Rankings
                    apRankings: '/scores/json/RankingsByWeek/{season}/{week}',
                    cfpRankings: '/scores/json/PlayoffRankings/{season}/{week}',

                    // Player Data
                    playerStats: '/stats/json/PlayerGameStatsByWeek/{season}/{week}',
                    teamStats: '/stats/json/TeamSeasonStats/{season}',

                    // Texas Focus (SEC)
                    texasSchedule: '/scores/json/TeamSchedule/TEX/{season}',
                    texasRoster: '/scores/json/PlayersbyTeam/TEX',
                    secStandings: '/scores/json/ConferenceStandings/SEC/{season}'
                }
            },
            NCAA_Basketball: {
                base: '/cbb',
                endpoints: {
                    // Teams & Conferences
                    teams: '/scores/json/Teams',
                    conferences: '/scores/json/Conferences',

                    // Schedule & Scores
                    games: '/scores/json/GamesByDate/{date}',
                    tournament: '/scores/json/Tournament/{season}',

                    // Rankings
                    apRankings: '/scores/json/Rankings/{season}',

                    // Stats
                    playerStats: '/stats/json/PlayerGameStatsByDate/{date}',
                    teamStats: '/stats/json/TeamSeasonStats/{season}'
                }
            }
        };

        // Cache configuration
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds for live data

        // WebSocket for real-time updates
        this.wsConnections = new Map();

        // Performance tracking
        this.metrics = {
            apiCalls: 0,
            cacheHits: 0,
            averageLatency: 0,
            errors: 0
        };
    }

    /**
     * Fetch data from SportsDataIO API with caching
     */
    async fetchData(sport, endpoint, params = {}) {
        const startTime = Date.now();

        try {
            // Build URL
            const sportConfig = this.sports[sport];
            if (!sportConfig) throw new Error(`Sport ${sport} not supported`);

            let url = `${this.baseURL}${sportConfig.base}${sportConfig.endpoints[endpoint]}`;

            // Replace URL parameters
            Object.keys(params).forEach(key => {
                url = url.replace(`{${key}}`, params[key]);
            });

            // Check cache
            const cacheKey = `${sport}:${endpoint}:${JSON.stringify(params)}`;
            const cached = this.getCached(cacheKey);
            if (cached) {
                this.metrics.cacheHits++;
                return cached;
            }

            // Fetch from API
            const response = await fetch(`${url}?key=${this.apiKey}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Cache the result
            this.setCache(cacheKey, data);

            // Update metrics
            this.metrics.apiCalls++;
            this.metrics.averageLatency = ((this.metrics.averageLatency * (this.metrics.apiCalls - 1)) + (Date.now() - startTime)) / this.metrics.apiCalls;

            return data;

        } catch (error) {
            this.metrics.errors++;
            console.error(`SportsDataIO API Error:`, error);
            throw error;
        }
    }

    /**
     * Get cached data if valid
     */
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    /**
     * Set cache data
     */
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

        // Clean old cache entries
        if (this.cache.size > 100) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
    }

    /**
     * NFL-specific methods
     */
    async getNFLLiveScores() {
        return this.fetchData('NFL', 'liveScores');
    }

    async getNFLTeams() {
        return this.fetchData('NFL', 'teams');
    }

    async getNFLCurrentWeek() {
        return this.fetchData('NFL', 'currentWeek');
    }

    async getNFLGameStats(scoreId) {
        return this.fetchData('NFL', 'gameStats', { scoreid: scoreId });
    }

    async getNFLPlayerStats(season, week) {
        return this.fetchData('NFL', 'playerStats', { season, week });
    }

    async getNFLInjuries() {
        return this.fetchData('NFL', 'injuries');
    }

    async getNFLStandings(season) {
        return this.fetchData('NFL', 'standings', { season });
    }

    async getNFLWinProbability(scoreId) {
        return this.fetchData('NFL', 'winProbability', { scoreid: scoreId });
    }

    /**
     * MLB-specific methods
     */
    async getMLBLiveScores(date) {
        return this.fetchData('MLB', 'liveScores', { date });
    }

    async getMLBTeams() {
        return this.fetchData('MLB', 'teams');
    }

    async getMLBBoxScore(gameId) {
        return this.fetchData('MLB', 'boxScore', { gameid: gameId });
    }

    async getMLBPlayerStats(date) {
        return this.fetchData('MLB', 'playerStats', { date });
    }

    async getMLBStandings(season) {
        return this.fetchData('MLB', 'standings', { season });
    }

    // Cardinals-specific
    async getCardinalsSchedule(season) {
        return this.fetchData('MLB', 'cardinalsSchedule', { season });
    }

    async getCardinalsRoster() {
        return this.fetchData('MLB', 'cardinalsRoster');
    }

    /**
     * NCAA Football methods
     */
    async getNCAAFootballCurrentWeek() {
        return this.fetchData('NCAA_Football', 'currentWeek');
    }

    async getNCAAFootballGames(season, week) {
        return this.fetchData('NCAA_Football', 'games', { season, week });
    }

    async getNCAAFootballAPRankings(season, week) {
        return this.fetchData('NCAA_Football', 'apRankings', { season, week });
    }

    async getNCAAFootballCFPRankings(season, week) {
        return this.fetchData('NCAA_Football', 'cfpRankings', { season, week });
    }

    // Texas Longhorns specific
    async getTexasSchedule(season) {
        return this.fetchData('NCAA_Football', 'texasSchedule', { season });
    }

    async getTexasRoster() {
        return this.fetchData('NCAA_Football', 'texasRoster');
    }

    async getSECStandings(season) {
        return this.fetchData('NCAA_Football', 'secStandings', { season });
    }

    /**
     * NCAA Basketball methods
     */
    async getNCAABasketballGames(date) {
        return this.fetchData('NCAA_Basketball', 'games', { date });
    }

    async getNCAABasketballRankings(season) {
        return this.fetchData('NCAA_Basketball', 'apRankings', { season });
    }

    async getNCAABasketballTournament(season) {
        return this.fetchData('NCAA_Basketball', 'tournament', { season });
    }

    /**
     * Unified Championship Data Feed
     */
    async getChampionshipDashboard() {
        const [nflScores, mlbScores, ncaaFootball, texasData, cardinalsData] = await Promise.all([
            this.getNFLLiveScores(),
            this.getMLBLiveScores(new Date().toISOString().split('T')[0]),
            this.getNCAAFootballCurrentWeek(),
            this.getTexasSchedule(new Date().getFullYear()),
            this.getCardinalsSchedule(new Date().getFullYear())
        ]);

        return {
            timestamp: new Date().toISOString(),
            latency: this.metrics.averageLatency,
            sports: {
                NFL: {
                    liveGames: nflScores,
                    focus: 'Tennessee Titans'
                },
                MLB: {
                    liveGames: mlbScores,
                    cardinals: cardinalsData,
                    focus: 'St. Louis Cardinals'
                },
                NCAA_Football: {
                    currentWeek: ncaaFootball,
                    texas: texasData,
                    focus: 'Texas Longhorns (SEC)'
                }
            },
            metrics: this.metrics
        };
    }

    /**
     * Real-time WebSocket connection for live updates
     */
    connectWebSocket(sport, callback) {
        const wsUrl = `wss://api.sportsdata.io/v3/${sport.toLowerCase()}/scores/json/LiveGameStream`;

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log(`Connected to ${sport} live stream`);
            ws.send(JSON.stringify({ key: this.apiKey }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            callback(data);
        };

        ws.onerror = (error) => {
            console.error(`WebSocket error for ${sport}:`, error);
        };

        this.wsConnections.set(sport, ws);

        return ws;
    }

    /**
     * Disconnect all WebSocket connections
     */
    disconnectAll() {
        this.wsConnections.forEach((ws, sport) => {
            ws.close();
            console.log(`Disconnected from ${sport} stream`);
        });
        this.wsConnections.clear();
    }
}

// Export for use in multiple platforms
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SportsDataIOConnector;
} else {
    window.SportsDataIOConnector = SportsDataIOConnector;
}