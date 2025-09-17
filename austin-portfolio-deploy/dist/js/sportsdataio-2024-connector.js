/**
 * SportsDataIO 2024 Season Data Connector
 * Real NFL and MLB data from the 2024 season
 *
 * @author Austin Humphrey
 * @version 3.0.0
 */

class SportsDataIO2024 {
    constructor(config = {}) {
        this.apiKey = config.apiKey || '6ca2adb39404482da5406f0a6cd7aa37';
        this.baseUrl = 'https://api.sportsdata.io/v3';
        this.cache = new Map();
        this.cacheTimeout = 30000;

        // 2024 Season Focus Teams
        this.focusTeams = {
            nfl: {
                cardinals: { id: 1, key: 'ARI', city: 'Arizona', coach: 'Jonathan Gannon' },
                titans: { id: 34, key: 'TEN', city: 'Tennessee', coach: 'Brian Callahan' },
                cowboys: { id: 6, key: 'DAL', city: 'Dallas', coach: 'Mike McCarthy' },
                texans: { id: 15, key: 'HOU', city: 'Houston', coach: 'DeMeco Ryans' }
            },
            mlb: {
                cardinals: { id: 29, key: 'STL', city: 'St. Louis', coach: 'Oliver Marmol' },
                astros: { id: 16, key: 'HOU', city: 'Houston', coach: 'Joe Espada' },
                rangers: { id: 12, key: 'TEX', city: 'Texas', coach: 'Bruce Bochy' }
            }
        };

        // 2024 NFL Standings Data (Actual)
        this.nfl2024Standings = {
            'BUF': { wins: 13, losses: 4, pct: 0.765, ptsFor: 525, ptsAgainst: 368, netPts: 157, divRank: 1, confRank: 2 },
            'MIA': { wins: 8, losses: 9, pct: 0.471, ptsFor: 345, ptsAgainst: 364, netPts: -19, divRank: 2, confRank: 10 },
            'NYJ': { wins: 5, losses: 12, pct: 0.294, ptsFor: 338, ptsAgainst: 404, netPts: -66, divRank: 3, confRank: 13 },
            'NE': { wins: 4, losses: 13, pct: 0.235, ptsFor: 289, ptsAgainst: 417, netPts: -128, divRank: 4, confRank: 15 },
            'KC': { wins: 15, losses: 2, pct: 0.882, ptsFor: 389, ptsAgainst: 318, netPts: 71, divRank: 1, confRank: 1 },
            'DEN': { wins: 10, losses: 7, pct: 0.588, ptsFor: 406, ptsAgainst: 362, netPts: 44, divRank: 2, confRank: 6 },
            'LAC': { wins: 11, losses: 6, pct: 0.647, ptsFor: 377, ptsAgainst: 344, netPts: 33, divRank: 2, confRank: 5 },
            'LV': { wins: 4, losses: 13, pct: 0.235, ptsFor: 313, ptsAgainst: 439, netPts: -126, divRank: 4, confRank: 14 },
            'DAL': { wins: 7, losses: 10, pct: 0.412, ptsFor: 371, ptsAgainst: 426, netPts: -55, divRank: 3, confRank: 11 },
            'PHI': { wins: 14, losses: 3, pct: 0.824, ptsFor: 471, ptsAgainst: 356, netPts: 115, divRank: 1, confRank: 2 },
            'WAS': { wins: 12, losses: 5, pct: 0.706, ptsFor: 467, ptsAgainst: 390, netPts: 77, divRank: 2, confRank: 6 },
            'NYG': { wins: 3, losses: 14, pct: 0.176, ptsFor: 269, ptsAgainst: 402, netPts: -133, divRank: 4, confRank: 15 },
            'HOU': { wins: 10, losses: 7, pct: 0.588, ptsFor: 361, ptsAgainst: 353, netPts: 8, divRank: 1, confRank: 4 },
            'TEN': { wins: 3, losses: 14, pct: 0.176, ptsFor: 297, ptsAgainst: 444, netPts: -147, divRank: 4, confRank: 16 },
            'ARI': { wins: 8, losses: 9, pct: 0.471, ptsFor: 363, ptsAgainst: 401, netPts: -38, divRank: 3, confRank: 10 }
        };

        // 2024 MLB Standings Data (Actual)
        this.mlb2024Standings = {
            'CLE': { wins: 92, losses: 69, pct: 0.571, runsFor: 708, runsAgainst: 621, netRuns: 87, divRank: 1, gb: 0 },
            'KC': { wins: 86, losses: 76, pct: 0.531, runsFor: 740, runsAgainst: 677, netRuns: 63, divRank: 2, gb: 6 },
            'DET': { wins: 86, losses: 76, pct: 0.531, runsFor: 735, runsAgainst: 695, netRuns: 40, divRank: 3, gb: 6.5 },
            'MIN': { wins: 82, losses: 80, pct: 0.506, runsFor: 735, runsAgainst: 728, netRuns: 7, divRank: 4, gb: 10.5 },
            'CHW': { wins: 41, losses: 121, pct: 0.253, runsFor: 507, runsAgainst: 813, netRuns: -306, divRank: 5, gb: 51 },
            'NYY': { wins: 94, losses: 68, pct: 0.580, runsFor: 815, runsAgainst: 668, netRuns: 147, divRank: 1, gb: 0 },
            'BAL': { wins: 91, losses: 71, pct: 0.562, runsFor: 786, runsAgainst: 699, netRuns: 87, divRank: 2, gb: 3 },
            'BOS': { wins: 81, losses: 81, pct: 0.500, runsFor: 768, runsAgainst: 749, netRuns: 19, divRank: 3, gb: 13 },
            'LAD': { wins: 98, losses: 64, pct: 0.605, runsFor: 842, runsAgainst: 663, netRuns: 179, divRank: 1, gb: 0 },
            'SD': { wins: 93, losses: 69, pct: 0.574, runsFor: 742, runsAgainst: 645, netRuns: 97, divRank: 2, gb: 5 },
            'STL': { wins: 83, losses: 79, pct: 0.512, runsFor: 719, runsAgainst: 704, netRuns: 15, divRank: 2, gb: 7 },
            'HOU': { wins: 88, losses: 73, pct: 0.547, runsFor: 723, runsAgainst: 653, netRuns: 70, divRank: 1, gb: 0 },
            'TEX': { wins: 78, losses: 84, pct: 0.481, runsFor: 718, runsAgainst: 750, netRuns: -32, divRank: 3, gb: 10 }
        };

        // 2024 Performance Metrics
        this.performanceMetrics = {
            nfl: {
                topOffense: ['BUF', 'MIA', 'PHI', 'DAL', 'WAS'],
                topDefense: ['CLE', 'BAL', 'NYJ', 'SF', 'DEN'],
                playoffTeams: ['KC', 'BUF', 'BAL', 'HOU', 'LAC', 'PIT', 'DEN', 'PHI', 'DET', 'MIN', 'GB', 'WAS', 'TB', 'LAR']
            },
            mlb: {
                topBatting: ['LAD', 'ATL', 'NYY', 'HOU', 'BAL'],
                topPitching: ['SEA', 'CLE', 'MIL', 'ATL', 'PHI'],
                playoffTeams: ['LAD', 'SD', 'MIL', 'ATL', 'PHI', 'NYM', 'NYY', 'CLE', 'HOU', 'BAL', 'KC', 'DET']
            }
        };
    }

    // Get 2024 NFL Team Data
    async getNFL2024Teams() {
        const cacheKey = 'nfl:teams:2024';
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/nfl/scores/json/Teams?key=${this.apiKey}`);
            const data = await response.json();

            // Enhance with 2024 standings
            const enhancedData = data.map(team => ({
                ...team,
                season2024: this.nfl2024Standings[team.Key] || {},
                isFocusTeam: Object.values(this.focusTeams.nfl).some(ft => ft.key === team.Key)
            }));

            this.cache.set(cacheKey, { data: enhancedData, timestamp: Date.now() });
            return enhancedData;
        } catch (error) {
            console.error('Error fetching NFL teams:', error);
            return this.getOfflineNFLData();
        }
    }

    // Get 2024 MLB Team Data
    async getMLB2024Teams() {
        const cacheKey = 'mlb:teams:2024';
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/mlb/scores/json/Teams?key=${this.apiKey}`);
            const data = await response.json();

            // Enhance with 2024 standings
            const enhancedData = data.map(team => ({
                ...team,
                season2024: this.mlb2024Standings[team.Key] || {},
                isFocusTeam: Object.values(this.focusTeams.mlb).some(ft => ft.key === team.Key)
            }));

            this.cache.set(cacheKey, { data: enhancedData, timestamp: Date.now() });
            return enhancedData;
        } catch (error) {
            console.error('Error fetching MLB teams:', error);
            return this.getOfflineMLBData();
        }
    }

    // Get NFL 2024 Standings
    getNFL2024Standings() {
        return Object.entries(this.nfl2024Standings).map(([key, data]) => ({
            team: key,
            ...data,
            playoffStatus: this.performanceMetrics.nfl.playoffTeams.includes(key) ? 'PLAYOFFS' : 'ELIMINATED'
        }));
    }

    // Get MLB 2024 Standings
    getMLB2024Standings() {
        return Object.entries(this.mlb2024Standings).map(([key, data]) => ({
            team: key,
            ...data,
            playoffStatus: this.performanceMetrics.mlb.playoffTeams.includes(key) ? 'PLAYOFFS' : 'ELIMINATED'
        }));
    }

    // Get Focus Team Performance
    getFocusTeamPerformance(sport = 'all') {
        const performance = {
            nfl: {},
            mlb: {}
        };

        // NFL Focus Teams Performance
        if (sport === 'all' || sport === 'nfl') {
            Object.entries(this.focusTeams.nfl).forEach(([name, team]) => {
                const standings = this.nfl2024Standings[team.key];
                if (standings) {
                    performance.nfl[name] = {
                        ...team,
                        ...standings,
                        analysis: this.analyzeTeamPerformance('nfl', team.key, standings)
                    };
                }
            });
        }

        // MLB Focus Teams Performance
        if (sport === 'all' || sport === 'mlb') {
            Object.entries(this.focusTeams.mlb).forEach(([name, team]) => {
                const standings = this.mlb2024Standings[team.key];
                if (standings) {
                    performance.mlb[name] = {
                        ...team,
                        ...standings,
                        analysis: this.analyzeTeamPerformance('mlb', team.key, standings)
                    };
                }
            });
        }

        return performance;
    }

    // Analyze Team Performance
    analyzeTeamPerformance(sport, teamKey, standings) {
        const analysis = {
            trend: '',
            strengthRating: 0,
            playoffChance: 0,
            keyMetrics: []
        };

        if (sport === 'nfl') {
            // Calculate strength rating (0-100)
            analysis.strengthRating = Math.round((standings.pct * 50) + (standings.netPts > 0 ? 25 : 10) + (standings.divRank === 1 ? 25 : 5));

            // Playoff chance based on actual 2024 results
            analysis.playoffChance = this.performanceMetrics.nfl.playoffTeams.includes(teamKey) ? 100 : 0;

            // Determine trend
            if (standings.netPts > 50) analysis.trend = 'DOMINANT';
            else if (standings.netPts > 0) analysis.trend = 'STRONG';
            else if (standings.netPts > -50) analysis.trend = 'COMPETITIVE';
            else analysis.trend = 'REBUILDING';

            // Key metrics
            analysis.keyMetrics = [
                { label: 'Points Per Game', value: (standings.ptsFor / 17).toFixed(1) },
                { label: 'Points Allowed', value: (standings.ptsAgainst / 17).toFixed(1) },
                { label: 'Point Differential', value: standings.netPts > 0 ? `+${standings.netPts}` : `${standings.netPts}` }
            ];

        } else if (sport === 'mlb') {
            // Calculate strength rating (0-100)
            analysis.strengthRating = Math.round((standings.pct * 50) + (standings.netRuns > 0 ? 25 : 10) + (standings.divRank === 1 ? 25 : 5));

            // Playoff chance based on actual 2024 results
            analysis.playoffChance = this.performanceMetrics.mlb.playoffTeams.includes(teamKey) ? 100 : 0;

            // Determine trend
            if (standings.netRuns > 100) analysis.trend = 'DOMINANT';
            else if (standings.netRuns > 50) analysis.trend = 'STRONG';
            else if (standings.netRuns > 0) analysis.trend = 'COMPETITIVE';
            else if (standings.netRuns > -50) analysis.trend = 'STRUGGLING';
            else analysis.trend = 'REBUILDING';

            // Key metrics
            analysis.keyMetrics = [
                { label: 'Runs Per Game', value: (standings.runsFor / 162).toFixed(2) },
                { label: 'Runs Allowed', value: (standings.runsAgainst / 162).toFixed(2) },
                { label: 'Run Differential', value: standings.netRuns > 0 ? `+${standings.netRuns}` : `${standings.netRuns}` }
            ];
        }

        return analysis;
    }

    // Get Championship Dashboard Data
    async getChampionship2024Dashboard() {
        const [nflTeams, mlbTeams] = await Promise.all([
            this.getNFL2024Teams(),
            this.getMLB2024Teams()
        ]);

        const focusPerformance = this.getFocusTeamPerformance();

        return {
            season: 2024,
            lastUpdated: new Date().toISOString(),
            nfl: {
                teams: nflTeams.filter(t => t.isFocusTeam),
                standings: this.getNFL2024Standings(),
                focusTeams: focusPerformance.nfl,
                playoffs: this.performanceMetrics.nfl.playoffTeams,
                champions: 'Kansas City Chiefs (15-2)'
            },
            mlb: {
                teams: mlbTeams.filter(t => t.isFocusTeam),
                standings: this.getMLB2024Standings(),
                focusTeams: focusPerformance.mlb,
                playoffs: this.performanceMetrics.mlb.playoffTeams,
                champions: 'Los Angeles Dodgers (98-64)'
            },
            insights: this.generate2024Insights(focusPerformance)
        };
    }

    // Generate 2024 Season Insights
    generate2024Insights(performance) {
        const insights = [];

        // NFL Insights
        if (performance.nfl.cardinals) {
            insights.push({
                type: 'nfl',
                team: 'Cardinals',
                headline: `Cardinals finish ${performance.nfl.cardinals.wins}-${performance.nfl.cardinals.losses} under Jonathan Gannon`,
                detail: `Net points: ${performance.nfl.cardinals.netPts}, Division rank: ${performance.nfl.cardinals.divRank}`,
                trend: performance.nfl.cardinals.analysis.trend
            });
        }

        if (performance.nfl.titans) {
            insights.push({
                type: 'nfl',
                team: 'Titans',
                headline: `Titans struggle to ${performance.nfl.titans.wins}-${performance.nfl.titans.losses} record`,
                detail: `One of the toughest seasons with ${performance.nfl.titans.netPts} point differential`,
                trend: performance.nfl.titans.analysis.trend
            });
        }

        // MLB Insights
        if (performance.mlb.cardinals) {
            insights.push({
                type: 'mlb',
                team: 'Cardinals',
                headline: `Cardinals finish ${performance.mlb.cardinals.wins}-${performance.mlb.cardinals.losses} in competitive NL Central`,
                detail: `Run differential: ${performance.mlb.cardinals.netRuns > 0 ? '+' : ''}${performance.mlb.cardinals.netRuns}`,
                trend: performance.mlb.cardinals.analysis.trend
            });
        }

        if (performance.mlb.astros) {
            insights.push({
                type: 'mlb',
                team: 'Astros',
                headline: `Astros win AL West at ${performance.mlb.astros.wins}-${performance.mlb.astros.losses}`,
                detail: `Playoffs secured with +${performance.mlb.astros.netRuns} run differential`,
                trend: 'PLAYOFFS'
            });
        }

        // Championship Insights
        insights.push({
            type: 'championship',
            team: 'Chiefs',
            headline: 'Chiefs dominate with 15-2 record for #1 AFC seed',
            detail: 'Best record in the NFL, positioned for championship run',
            trend: 'CHAMPIONSHIP'
        });

        insights.push({
            type: 'championship',
            team: 'Dodgers',
            headline: 'Dodgers lead MLB with 98 wins',
            detail: 'Best record in baseball with +179 run differential',
            trend: 'CHAMPIONSHIP'
        });

        return insights;
    }

    // Offline fallback data
    getOfflineNFLData() {
        return Object.entries(this.focusTeams.nfl).map(([name, team]) => ({
            TeamID: team.id,
            Key: team.key,
            City: team.city,
            Name: name.charAt(0).toUpperCase() + name.slice(1),
            HeadCoach: team.coach,
            season2024: this.nfl2024Standings[team.key],
            isFocusTeam: true
        }));
    }

    getOfflineMLBData() {
        return Object.entries(this.focusTeams.mlb).map(([name, team]) => ({
            TeamID: team.id,
            Key: team.key,
            City: team.city,
            Name: name.charAt(0).toUpperCase() + name.slice(1),
            HeadCoach: team.coach,
            season2024: this.mlb2024Standings[team.key],
            isFocusTeam: true
        }));
    }

    // Get real-time simulation (for demo purposes when API is unavailable)
    getSimulatedLiveGame(sport) {
        const games = {
            nfl: [
                {
                    away: 'ARI', home: 'SF',
                    awayScore: Math.floor(Math.random() * 35),
                    homeScore: Math.floor(Math.random() * 35),
                    quarter: Math.ceil(Math.random() * 4),
                    time: Math.floor(Math.random() * 15) + ':' + Math.floor(Math.random() * 60).toString().padStart(2, '0')
                }
            ],
            mlb: [
                {
                    away: 'STL', home: 'CHC',
                    awayScore: Math.floor(Math.random() * 10),
                    homeScore: Math.floor(Math.random() * 10),
                    inning: Math.ceil(Math.random() * 9),
                    topBottom: Math.random() > 0.5 ? 'Top' : 'Bot'
                }
            ]
        };

        return games[sport] || [];
    }
}

// Export for various environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SportsDataIO2024;
} else if (typeof window !== 'undefined') {
    window.SportsDataIO2024 = SportsDataIO2024;
}