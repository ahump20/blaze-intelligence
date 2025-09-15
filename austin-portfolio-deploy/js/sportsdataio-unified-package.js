/**
 * ========================================================================
 * SPORTSDATAIO UNIFIED PACKAGE - BLAZE INTELLIGENCE
 * ========================================================================
 *
 * Complete SportsDataIO Integration Module
 * For use across all Blaze Intelligence platforms:
 * - Netlify (blaze-intelligence.netlify.app)
 * - Replit (blaze-intelligence.replit.app)
 * - GitHub Pages (ahump20.github.io)
 *
 * Created: September 15, 2025
 * Version: 1.0.0
 * Author: Blaze Intelligence Championship Architect
 *
 * ========================================================================
 */

// ==========================
// CONFIGURATION
// ==========================

const SPORTSDATAIO_CONFIG = {
    // API Credentials - ahump20@outlook.com account
    apiKey: process.env.SPORTSDATAIO_API_KEY || '6ca2adb39404482da5406f0a6cd7aa37',
    baseURL: 'https://api.sportsdata.io/v3',

    // Cache Settings
    cacheTimeout: 30000, // 30 seconds
    maxCacheSize: 100,

    // Team Focus
    teams: {
        NFL: 'TEN',  // Tennessee Titans
        MLB: 'STL',  // St. Louis Cardinals
        NCAA: 'TEX', // Texas Longhorns
        NBA: 'MEM'   // Memphis Grizzlies
    },

    // Performance Targets
    targets: {
        maxLatency: 100,    // ms
        minAccuracy: 94.6,  // %
        cacheHitRate: 70    // %
    }
};

// ==========================
// UNIFIED CONNECTOR CLASS
// ==========================

class SportsDataIOUnified {
    constructor(config = {}) {
        this.config = { ...SPORTSDATAIO_CONFIG, ...config };
        this.cache = new Map();
        this.metrics = {
            apiCalls: 0,
            cacheHits: 0,
            totalLatency: 0,
            errors: 0
        };

        // API Endpoints
        this.endpoints = {
            NFL: {
                teams: '/nfl/scores/json/Teams',
                currentWeek: '/nfl/scores/json/CurrentWeek',
                liveScores: '/nfl/scores/json/LiveScores',
                schedule: '/nfl/scores/json/Schedules/{season}',
                scores: '/nfl/scores/json/ScoresByWeek/{season}/{week}',
                standings: '/nfl/scores/json/Standings/{season}',
                injuries: '/nfl/scores/json/Injuries',
                depthCharts: '/nfl/scores/json/DepthCharts',
                playerStats: '/nfl/stats/json/PlayerGameStatsByWeek/{season}/{week}',
                teamStats: '/nfl/scores/json/TeamSeasonStats/{season}',
                boxScore: '/nfl/stats/json/BoxScore/{scoreid}',
                playByPlay: '/nfl/pbp/json/PlayByPlay/{scoreid}',
                winProbability: '/nfl/scores/json/WinProbability/{scoreid}',
                odds: '/nfl/odds/json/GameOddsByWeek/{season}/{week}',
                bettingMarkets: '/nfl/odds/json/BettingMarkets'
            },
            MLB: {
                teams: '/mlb/scores/json/Teams',
                stadiums: '/mlb/scores/json/Stadiums',
                schedule: '/mlb/scores/json/Games/{season}',
                liveScores: '/mlb/scores/json/GamesByDate/{date}',
                boxScore: '/mlb/stats/json/BoxScore/{gameid}',
                playByPlay: '/mlb/pbp/json/PlayByPlay/{gameid}',
                playerStats: '/mlb/stats/json/PlayerGameStatsByDate/{date}',
                playerSeasonStats: '/mlb/stats/json/PlayerSeasonStats/{season}',
                teamStats: '/mlb/scores/json/TeamSeasonStats/{season}',
                standings: '/mlb/scores/json/Standings/{season}',
                injuries: '/mlb/scores/json/Injuries',
                pitcherStats: '/mlb/stats/json/PitchingStats/{season}',
                batterStats: '/mlb/stats/json/BattingStats/{season}',
                cardinalsSchedule: '/mlb/scores/json/TeamSchedule/STL/{season}',
                cardinalsRoster: '/mlb/scores/json/PlayersbyTeam/STL'
            },
            NCAA_Football: {
                teams: '/cfb/scores/json/Teams',
                conferences: '/cfb/scores/json/Conferences',
                stadiums: '/cfb/scores/json/Stadiums',
                currentWeek: '/cfb/scores/json/CurrentWeek',
                games: '/cfb/scores/json/GamesByWeek/{season}/{week}',
                apRankings: '/cfb/scores/json/RankingsByWeek/{season}/{week}',
                cfpRankings: '/cfb/scores/json/PlayoffRankings/{season}/{week}',
                playerStats: '/cfb/stats/json/PlayerGameStatsByWeek/{season}/{week}',
                teamStats: '/cfb/stats/json/TeamSeasonStats/{season}',
                texasSchedule: '/cfb/scores/json/TeamSchedule/TEX/{season}',
                texasRoster: '/cfb/scores/json/PlayersbyTeam/TEX',
                secStandings: '/cfb/scores/json/ConferenceStandings/SEC/{season}'
            },
            NCAA_Basketball: {
                teams: '/cbb/scores/json/Teams',
                conferences: '/cbb/scores/json/Conferences',
                games: '/cbb/scores/json/GamesByDate/{date}',
                tournament: '/cbb/scores/json/Tournament/{season}',
                apRankings: '/cbb/scores/json/Rankings/{season}',
                playerStats: '/cbb/stats/json/PlayerGameStatsByDate/{date}',
                teamStats: '/cbb/stats/json/TeamSeasonStats/{season}'
            }
        };

        // Initialize
        this.init();
    }

    /**
     * Initialize the connector
     */
    init() {
        console.log('🔥 SportsDataIO Unified Connector Initialized');
        console.log(`📊 API Key: ${this.config.apiKey.substring(0, 8)}...`);
        console.log(`🎯 Team Focus: Cardinals (MLB), Titans (NFL), Longhorns (NCAA)`);
    }

    /**
     * Core API fetch method with caching
     */
    async fetch(sport, endpoint, params = {}) {
        const startTime = performance.now();

        try {
            // Build URL
            let url = `${this.config.baseURL}${this.endpoints[sport][endpoint]}`;

            // Replace parameters
            Object.keys(params).forEach(key => {
                url = url.replace(`{${key}}`, params[key]);
            });

            // Check cache
            const cacheKey = `${sport}:${endpoint}:${JSON.stringify(params)}`;
            const cached = this.getCache(cacheKey);
            if (cached) {
                this.metrics.cacheHits++;
                return cached;
            }

            // Add API key
            url += `?key=${this.config.apiKey}`;

            // Fetch data
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            // Cache result
            this.setCache(cacheKey, data);

            // Update metrics
            this.metrics.apiCalls++;
            this.metrics.totalLatency += (performance.now() - startTime);

            return data;

        } catch (error) {
            this.metrics.errors++;
            console.error(`SportsDataIO Error:`, error);
            throw error;
        }
    }

    /**
     * Cache management
     */
    getCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

        // Limit cache size
        if (this.cache.size > this.config.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    // ==========================
    // NFL METHODS
    // ==========================

    async getNFLCurrentWeek() {
        return this.fetch('NFL', 'currentWeek');
    }

    async getNFLLiveScores() {
        return this.fetch('NFL', 'liveScores');
    }

    async getNFLTeams() {
        return this.fetch('NFL', 'teams');
    }

    async getNFLSchedule(season) {
        return this.fetch('NFL', 'schedule', { season });
    }

    async getNFLScores(season, week) {
        return this.fetch('NFL', 'scores', { season, week });
    }

    async getNFLStandings(season) {
        return this.fetch('NFL', 'standings', { season });
    }

    async getNFLInjuries() {
        return this.fetch('NFL', 'injuries');
    }

    async getNFLDepthCharts() {
        return this.fetch('NFL', 'depthCharts');
    }

    async getNFLPlayerStats(season, week) {
        return this.fetch('NFL', 'playerStats', { season, week });
    }

    async getNFLTeamStats(season) {
        return this.fetch('NFL', 'teamStats', { season });
    }

    async getNFLBoxScore(scoreId) {
        return this.fetch('NFL', 'boxScore', { scoreid: scoreId });
    }

    async getNFLPlayByPlay(scoreId) {
        return this.fetch('NFL', 'playByPlay', { scoreid: scoreId });
    }

    async getNFLWinProbability(scoreId) {
        return this.fetch('NFL', 'winProbability', { scoreid: scoreId });
    }

    async getNFLOdds(season, week) {
        return this.fetch('NFL', 'odds', { season, week });
    }

    // ==========================
    // MLB METHODS
    // ==========================

    async getMLBTeams() {
        return this.fetch('MLB', 'teams');
    }

    async getMLBStadiums() {
        return this.fetch('MLB', 'stadiums');
    }

    async getMLBSchedule(season) {
        return this.fetch('MLB', 'schedule', { season });
    }

    async getMLBLiveScores(date) {
        return this.fetch('MLB', 'liveScores', { date });
    }

    async getMLBBoxScore(gameId) {
        return this.fetch('MLB', 'boxScore', { gameid: gameId });
    }

    async getMLBPlayByPlay(gameId) {
        return this.fetch('MLB', 'playByPlay', { gameid: gameId });
    }

    async getMLBPlayerStats(date) {
        return this.fetch('MLB', 'playerStats', { date });
    }

    async getMLBPlayerSeasonStats(season) {
        return this.fetch('MLB', 'playerSeasonStats', { season });
    }

    async getMLBTeamStats(season) {
        return this.fetch('MLB', 'teamStats', { season });
    }

    async getMLBStandings(season) {
        return this.fetch('MLB', 'standings', { season });
    }

    async getMLBInjuries() {
        return this.fetch('MLB', 'injuries');
    }

    async getMLBPitcherStats(season) {
        return this.fetch('MLB', 'pitcherStats', { season });
    }

    async getMLBBatterStats(season) {
        return this.fetch('MLB', 'batterStats', { season });
    }

    // Cardinals-specific
    async getCardinalsSchedule(season) {
        return this.fetch('MLB', 'cardinalsSchedule', { season });
    }

    async getCardinalsRoster() {
        return this.fetch('MLB', 'cardinalsRoster');
    }

    // ==========================
    // NCAA FOOTBALL METHODS
    // ==========================

    async getNCAAFootballTeams() {
        return this.fetch('NCAA_Football', 'teams');
    }

    async getNCAAFootballConferences() {
        return this.fetch('NCAA_Football', 'conferences');
    }

    async getNCAAFootballCurrentWeek() {
        return this.fetch('NCAA_Football', 'currentWeek');
    }

    async getNCAAFootballGames(season, week) {
        return this.fetch('NCAA_Football', 'games', { season, week });
    }

    async getNCAAFootballAPRankings(season, week) {
        return this.fetch('NCAA_Football', 'apRankings', { season, week });
    }

    async getNCAAFootballCFPRankings(season, week) {
        return this.fetch('NCAA_Football', 'cfpRankings', { season, week });
    }

    async getNCAAFootballPlayerStats(season, week) {
        return this.fetch('NCAA_Football', 'playerStats', { season, week });
    }

    async getNCAAFootballTeamStats(season) {
        return this.fetch('NCAA_Football', 'teamStats', { season });
    }

    // Texas-specific
    async getTexasSchedule(season) {
        return this.fetch('NCAA_Football', 'texasSchedule', { season });
    }

    async getTexasRoster() {
        return this.fetch('NCAA_Football', 'texasRoster');
    }

    async getSECStandings(season) {
        return this.fetch('NCAA_Football', 'secStandings', { season });
    }

    // ==========================
    // NCAA BASKETBALL METHODS
    // ==========================

    async getNCAABasketballTeams() {
        return this.fetch('NCAA_Basketball', 'teams');
    }

    async getNCAABasketballGames(date) {
        return this.fetch('NCAA_Basketball', 'games', { date });
    }

    async getNCAABasketballTournament(season) {
        return this.fetch('NCAA_Basketball', 'tournament', { season });
    }

    async getNCAABasketballRankings(season) {
        return this.fetch('NCAA_Basketball', 'apRankings', { season });
    }

    async getNCAABasketballPlayerStats(date) {
        return this.fetch('NCAA_Basketball', 'playerStats', { date });
    }

    async getNCAABasketballTeamStats(season) {
        return this.fetch('NCAA_Basketball', 'teamStats', { season });
    }

    // ==========================
    // CHAMPIONSHIP DASHBOARDS
    // ==========================

    /**
     * Get comprehensive dashboard data for all sports
     */
    async getChampionshipDashboard() {
        console.log('🏆 Loading Championship Dashboard...');

        const today = new Date().toISOString().split('T')[0];
        const currentYear = new Date().getFullYear();

        try {
            const [nfl, mlb, ncaa, cardinals, titans, longhorns] = await Promise.all([
                this.getNFLLiveScores(),
                this.getMLBLiveScores(today),
                this.getNCAAFootballCurrentWeek(),
                this.getCardinalsSchedule(currentYear),
                this.getNFLTeams().then(teams =>
                    teams.find(t => t.Key === this.config.teams.NFL)
                ),
                this.getTexasSchedule(currentYear)
            ]);

            return {
                timestamp: new Date().toISOString(),
                metrics: this.getMetrics(),
                sports: {
                    NFL: {
                        liveScores: nfl,
                        titansInfo: titans,
                        focus: 'Tennessee Titans'
                    },
                    MLB: {
                        liveScores: mlb,
                        cardinalsSchedule: cardinals,
                        focus: 'St. Louis Cardinals'
                    },
                    NCAA: {
                        currentWeek: ncaa,
                        longhornsSchedule: longhorns,
                        focus: 'Texas Longhorns (SEC)'
                    }
                }
            };
        } catch (error) {
            console.error('Dashboard Error:', error);
            throw error;
        }
    }

    /**
     * Get Cardinals-focused dashboard
     */
    async getCardinalsDashboard() {
        const season = new Date().getFullYear();
        const today = new Date().toISOString().split('T')[0];

        const [schedule, roster, standings, liveGames] = await Promise.all([
            this.getCardinalsSchedule(season),
            this.getCardinalsRoster(),
            this.getMLBStandings(season),
            this.getMLBLiveScores(today)
        ]);

        // Filter for Cardinals games
        const cardinalsGames = liveGames.filter(g =>
            g.HomeTeam === 'STL' || g.AwayTeam === 'STL'
        );

        return {
            team: 'St. Louis Cardinals',
            season,
            schedule,
            roster,
            standings,
            liveGames: cardinalsGames,
            metrics: this.getMetrics()
        };
    }

    /**
     * Get Titans-focused dashboard
     */
    async getTitansDashboard() {
        const season = new Date().getFullYear();

        const [schedule, standings, injuries, depthChart, liveScores] = await Promise.all([
            this.getNFLSchedule(season),
            this.getNFLStandings(season),
            this.getNFLInjuries(),
            this.getNFLDepthCharts(),
            this.getNFLLiveScores()
        ]);

        // Filter for Titans
        const titansSchedule = schedule.filter(g =>
            g.HomeTeam === 'TEN' || g.AwayTeam === 'TEN'
        );
        const titansInjuries = injuries.filter(i => i.Team === 'TEN');
        const titansGames = liveScores.filter(g =>
            g.HomeTeam === 'TEN' || g.AwayTeam === 'TEN'
        );

        return {
            team: 'Tennessee Titans',
            season,
            schedule: titansSchedule,
            standings,
            injuries: titansInjuries,
            depthChart,
            liveGames: titansGames,
            metrics: this.getMetrics()
        };
    }

    /**
     * Get Longhorns-focused dashboard
     */
    async getLonghornsDashboard() {
        const season = new Date().getFullYear();
        const week = await this.getNCAAFootballCurrentWeek();

        const [schedule, roster, rankings, secStandings] = await Promise.all([
            this.getTexasSchedule(season),
            this.getTexasRoster(),
            this.getNCAAFootballAPRankings(season, week.Week),
            this.getSECStandings(season)
        ]);

        // Find Texas in rankings
        const texasRanking = rankings.find(r => r.School === 'Texas');

        return {
            team: 'Texas Longhorns',
            season,
            currentWeek: week,
            schedule,
            roster,
            ranking: texasRanking,
            conference: 'SEC',
            secStandings,
            metrics: this.getMetrics()
        };
    }

    // ==========================
    // UTILITY METHODS
    // ==========================

    /**
     * Get performance metrics
     */
    getMetrics() {
        const avgLatency = this.metrics.apiCalls > 0
            ? Math.round(this.metrics.totalLatency / this.metrics.apiCalls)
            : 0;

        const cacheHitRate = this.metrics.apiCalls > 0
            ? Math.round((this.metrics.cacheHits / (this.metrics.apiCalls + this.metrics.cacheHits)) * 100)
            : 0;

        return {
            apiCalls: this.metrics.apiCalls,
            cacheHits: this.metrics.cacheHits,
            cacheHitRate: `${cacheHitRate}%`,
            averageLatency: `${avgLatency}ms`,
            errors: this.metrics.errors
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }

    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            apiCalls: 0,
            cacheHits: 0,
            totalLatency: 0,
            errors: 0
        };
        console.log('📊 Metrics reset');
    }
}

// ==========================
// EXPORT FOR MULTIPLE PLATFORMS
// ==========================

// Node.js / CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SportsDataIOUnified;
}

// ES6 Modules
if (typeof exports !== 'undefined') {
    exports.SportsDataIOUnified = SportsDataIOUnified;
}

// Browser / Global
if (typeof window !== 'undefined') {
    window.SportsDataIOUnified = SportsDataIOUnified;
}

// ==========================
// USAGE EXAMPLES
// ==========================

/**
 * EXAMPLE 1: Basic Usage
 *
 * const sportsData = new SportsDataIOUnified();
 * const nflScores = await sportsData.getNFLLiveScores();
 * console.log(nflScores);
 */

/**
 * EXAMPLE 2: Championship Dashboard
 *
 * const sportsData = new SportsDataIOUnified();
 * const dashboard = await sportsData.getChampionshipDashboard();
 * console.log(dashboard);
 */

/**
 * EXAMPLE 3: Team-Specific Dashboard
 *
 * const sportsData = new SportsDataIOUnified();
 * const cardinals = await sportsData.getCardinalsDashboard();
 * const titans = await sportsData.getTitansDashboard();
 * const longhorns = await sportsData.getLonghornsDashboard();
 */

/**
 * EXAMPLE 4: Custom Configuration
 *
 * const sportsData = new SportsDataIOUnified({
 *     apiKey: 'your-api-key',
 *     cacheTimeout: 60000, // 1 minute
 *     teams: {
 *         NFL: 'DAL', // Dallas Cowboys
 *         MLB: 'NYY'  // New York Yankees
 *     }
 * });
 */

/**
 * EXAMPLE 5: Replit Integration
 *
 * // In your Replit app
 * import SportsDataIOUnified from './sportsdataio-unified-package.js';
 *
 * const app = express();
 * const sportsData = new SportsDataIOUnified();
 *
 * app.get('/api/sports/live', async (req, res) => {
 *     const data = await sportsData.getChampionshipDashboard();
 *     res.json(data);
 * });
 */

/**
 * EXAMPLE 6: React Component
 *
 * import { useState, useEffect } from 'react';
 * import SportsDataIOUnified from './sportsdataio-unified-package';
 *
 * function SportsDataDashboard() {
 *     const [data, setData] = useState(null);
 *     const sportsData = new SportsDataIOUnified();
 *
 *     useEffect(() => {
 *         async function loadData() {
 *             const dashboard = await sportsData.getChampionshipDashboard();
 *             setData(dashboard);
 *         }
 *         loadData();
 *
 *         // Refresh every 30 seconds
 *         const interval = setInterval(loadData, 30000);
 *         return () => clearInterval(interval);
 *     }, []);
 *
 *     return (
 *         <div>
 *             {data && (
 *                 <div>
 *                     <h2>Live Sports Data</h2>
 *                     <pre>{JSON.stringify(data, null, 2)}</pre>
 *                 </div>
 *             )}
 *         </div>
 *     );
 * }
 */

// ==========================
// END OF UNIFIED PACKAGE
// ==========================

console.log('🔥 SportsDataIO Unified Package Loaded');
console.log('📦 Version: 1.0.0');
console.log('🏆 Ready for Championship Data');