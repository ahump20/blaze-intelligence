/**
 * Blaze Intelligence Sports Data Service
 * Real-time sports data integration for all major leagues
 * 2025 Season
 */

class BlazeSportsDataService {
    constructor() {
        this.baseUrl = '/data/sports/2025';
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
    }

    // MLB Data Methods
    async getMLBTeamData(teamId) {
        const cacheKey = `mlb_${teamId}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/mlb/${teamId}.json`);
            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Error fetching MLB data for ${teamId}:`, error);
            return this.getMLBFallbackData(teamId);
        }
    }

    getMLBFallbackData(teamId) {
        if (teamId === 'cardinals') {
            return {
                team: "St. Louis Cardinals",
                season: "2025",
                record: { wins: 0, losses: 0, pct: ".000" },
                roster: {
                    starting_lineup: [
                        { name: "Paul Goldschmidt", position: "1B", avg: ".268", hr: 22, rbi: 65 },
                        { name: "Nolan Arenado", position: "3B", avg: ".272", hr: 26, rbi: 103 },
                        { name: "Willson Contreras", position: "C", avg: ".262", hr: 20, rbi: 65 },
                        { name: "Masyn Winn", position: "SS", avg: ".267", hr: 15, rbi: 57 },
                        { name: "Jordan Walker", position: "RF", avg: ".257", hr: 16, rbi: 51 }
                    ]
                },
                lastUpdated: new Date().toISOString()
            };
        }
        return null;
    }

    // NFL Data Methods
    async getNFLTeamData(teamId) {
        const cacheKey = `nfl_${teamId}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/nfl/${teamId}.json`);
            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Error fetching NFL data for ${teamId}:`, error);
            return this.getNFLFallbackData(teamId);
        }
    }

    getNFLFallbackData(teamId) {
        if (teamId === 'titans') {
            return {
                team: "Tennessee Titans",
                season: "2025",
                record: { wins: 0, losses: 0, ties: 0, pct: ".000" },
                roster: {
                    offense: [
                        { name: "Will Levis", position: "QB", comp: 0, att: 0, yards: 0, td: 0 },
                        { name: "Tony Pollard", position: "RB", carries: 0, yards: 0, avg: 0.0, td: 0 },
                        { name: "Calvin Ridley", position: "WR", rec: 0, yards: 0, avg: 0.0, td: 0 }
                    ],
                    defense: [
                        { name: "Jeffery Simmons", position: "DT", tackles: 0, sacks: 0 },
                        { name: "L'Jarius Sneed", position: "CB", tackles: 0, int: 0 }
                    ]
                },
                lastUpdated: new Date().toISOString()
            };
        }
        return null;
    }

    // NBA Data Methods
    async getNBATeamData(teamId) {
        const cacheKey = `nba_${teamId}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/nba/${teamId}.json`);
            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Error fetching NBA data for ${teamId}:`, error);
            return this.getNBAFallbackData(teamId);
        }
    }

    getNBAFallbackData(teamId) {
        if (teamId === 'grizzlies') {
            return {
                team: "Memphis Grizzlies",
                season: "2025-26",
                record: { wins: 0, losses: 0, pct: ".000" },
                roster: {
                    starters: [
                        { name: "Ja Morant", position: "PG", ppg: 25.1, apg: 8.1, rpg: 5.6 },
                        { name: "Marcus Smart", position: "SG", ppg: 14.5, apg: 4.3, rpg: 2.7 },
                        { name: "Desmond Bane", position: "SF", ppg: 23.7, apg: 5.5, rpg: 4.4 },
                        { name: "Jaren Jackson Jr.", position: "PF", ppg: 22.5, rpg: 5.5, bpg: 1.6 },
                        { name: "Zach Edey", position: "C", ppg: 9.8, rpg: 7.2, bpg: 1.8 }
                    ]
                },
                lastUpdated: new Date().toISOString()
            };
        }
        return null;
    }

    // NCAA Data Methods
    async getNCAATeamData(sport, teamId) {
        const cacheKey = `ncaa_${sport}_${teamId}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/ncaa/${sport}/${teamId}.json`);
            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Error fetching NCAA ${sport} data for ${teamId}:`, error);
            return this.getNCAAFallbackData(sport, teamId);
        }
    }

    getNCAAFallbackData(sport, teamId) {
        if (sport === 'football' && teamId === 'longhorns') {
            return {
                team: "Texas Longhorns",
                season: "2025",
                record: { wins: 0, losses: 0, pct: ".000" },
                rankings: {
                    ap_poll: "Preseason #8",
                    coaches_poll: "Preseason #7",
                    cfp_ranking: "TBD"
                },
                roster: {
                    offense: [
                        { name: "Arch Manning", position: "QB", comp: 0, att: 0, yards: 0, td: 0 },
                        { name: "Jaydon Blue", position: "RB", carries: 0, yards: 0, avg: 0.0, td: 0 },
                        { name: "Isaiah Bond", position: "WR", rec: 0, yards: 0, avg: 0.0, td: 0 }
                    ]
                },
                lastUpdated: new Date().toISOString()
            };
        }
        return null;
    }

    // Perfect Game Baseball Data
    async getPerfectGameData(level = 'national') {
        const cacheKey = `pg_${level}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/perfect-game/${level}.json`);
            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Error fetching Perfect Game data:`, error);
            return this.getPerfectGameFallbackData();
        }
    }

    getPerfectGameFallbackData() {
        return {
            level: "National",
            lastUpdated: new Date().toISOString(),
            topProspects: [
                { rank: 1, name: "Ethan Holliday", position: "SS", grad: 2025, commitment: "Oklahoma State" },
                { rank: 2, name: "Cameron Boozer", position: "3B/RHP", grad: 2025, commitment: "LSU" },
                { rank: 3, name: "Blake Larson", position: "LHP", grad: 2025, commitment: "Tennessee" },
                { rank: 4, name: "Tyler Bremner", position: "OF", grad: 2025, commitment: "USC" },
                { rank: 5, name: "Kayson Cunningham", position: "SS", grad: 2025, commitment: "Texas" }
            ],
            tournaments: [
                { name: "WWBA World Championship", location: "Jupiter, FL", dates: "Oct 19-26, 2025" },
                { name: "PG All-American Classic", location: "San Diego, CA", dates: "Aug 9-10, 2025" }
            ]
        };
    }

    // International Pipeline Data
    async getInternationalPipelineData(region) {
        const cacheKey = `intl_${region}`;
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/international/${region}.json`);
            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Error fetching international data for ${region}:`, error);
            return this.getInternationalFallbackData(region);
        }
    }

    getInternationalFallbackData(region) {
        const fallbackData = {
            'latin-america': {
                region: "Latin America",
                topProspects: [
                    { name: "Junior Caminero", country: "Dominican Republic", position: "3B", org: "TB", eta: "2025" },
                    { name: "Cristian Vaquero", country: "Cuba", position: "OF", org: "WSH", eta: "2025" },
                    { name: "Angel Genao", country: "Dominican Republic", position: "SS", org: "CLE", eta: "2026" }
                ]
            },
            'japan-kbo': {
                region: "Japan/KBO",
                players: [
                    { name: "Roki Sasaki", league: "NPB", team: "Chiba Lotte", mlb_interest: "High", eta: "2025-26" },
                    { name: "Munetaka Murakami", league: "NPB", team: "Yakult", position: "3B", ops: ".984" },
                    { name: "Jung Hoo Lee", league: "KBO", team: "Kiwoom", status: "MLB - SF Giants" }
                ]
            }
        };
        return fallbackData[region] || null;
    }

    // Cache Management
    isCacheValid(key) {
        if (!this.cache.has(key)) return false;
        const cached = this.cache.get(key);
        return Date.now() - cached.timestamp < this.cacheTimeout;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // Utility Methods
    async getAllTeamsData() {
        const [cardinals, titans, grizzlies, longhorns] = await Promise.all([
            this.getMLBTeamData('cardinals'),
            this.getNFLTeamData('titans'),
            this.getNBATeamData('grizzlies'),
            this.getNCAATeamData('football', 'longhorns')
        ]);

        return {
            mlb: { cardinals },
            nfl: { titans },
            nba: { grizzlies },
            ncaa: { longhorns },
            lastUpdated: new Date().toISOString()
        };
    }

    // Live Score Integration
    async getLiveScores() {
        try {
            const response = await fetch('/api/live-scores');
            return await response.json();
        } catch (error) {
            console.error('Error fetching live scores:', error);
            return {
                mlb: [],
                nfl: [],
                nba: [],
                ncaa: []
            };
        }
    }

    // Analytics Methods
    calculateTeamMetrics(teamData, sport) {
        const metrics = {
            performance_index: 0,
            trend: 'stable',
            key_metrics: {}
        };

        switch(sport) {
            case 'mlb':
                metrics.key_metrics = {
                    team_ops: teamData.analytics?.team_ops || 0,
                    team_era: teamData.analytics?.team_era || 0,
                    run_differential: teamData.analytics?.run_differential || 0
                };
                break;
            case 'nfl':
                metrics.key_metrics = {
                    offensive_dvoa: teamData.analytics?.offensive_dvoa || 'TBD',
                    defensive_dvoa: teamData.analytics?.defensive_dvoa || 'TBD',
                    projected_wins: teamData.analytics?.projected_wins || 0
                };
                break;
            case 'nba':
                metrics.key_metrics = {
                    offensive_rating: teamData.analytics?.offensive_rating || 0,
                    defensive_rating: teamData.analytics?.defensive_rating || 0,
                    net_rating: teamData.analytics?.net_rating || 0
                };
                break;
            case 'ncaa':
                metrics.key_metrics = {
                    sp_plus_rating: teamData.analytics?.sp_plus_rating || 'TBD',
                    recruiting_score: teamData.analytics?.recruiting_score || 0,
                    playoff_probability: teamData.analytics?.playoff_probability || '0%'
                };
                break;
        }

        return metrics;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeSportsDataService;
} else {
    window.BlazeSportsDataService = BlazeSportsDataService;
}