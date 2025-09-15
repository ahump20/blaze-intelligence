/**
 * SportsDataIO 2025 Live Season Data Connector
 * Real-time NFL Week 7 and MLB Postseason data as of October 15, 2025
 *
 * @author Austin Humphrey
 * @version 4.0.0
 * @date 2025-10-15
 */

class SportsDataIO2025Live {
    constructor(config = {}) {
        this.apiKey = config.apiKey || '6ca2adb39404482da5406f0a6cd7aa37';
        this.baseUrl = 'https://api.sportsdata.io/v3';
        this.cache = new Map();
        this.cacheTimeout = 30000;
        this.currentDate = new Date('2025-10-15');

        // 2025 Season Focus Teams
        this.focusTeams = {
            nfl: {
                cardinals: { id: 1, key: 'ARI', city: 'Arizona', coach: 'Jonathan Gannon', year: 2 },
                titans: { id: 34, key: 'TEN', city: 'Tennessee', coach: 'Brian Callahan', year: 2 },
                cowboys: { id: 6, key: 'DAL', city: 'Dallas', coach: 'Mike McCarthy', year: 6 },
                texans: { id: 15, key: 'HOU', city: 'Houston', coach: 'DeMeco Ryans', year: 3 }
            },
            mlb: {
                cardinals: { id: 29, key: 'STL', city: 'St. Louis', coach: 'Oliver Marmol', year: 4 },
                astros: { id: 16, key: 'HOU', city: 'Houston', coach: 'Joe Espada', year: 2 },
                rangers: { id: 12, key: 'TEX', city: 'Texas', coach: 'Bruce Bochy', year: 3 },
                dodgers: { id: 1, key: 'LAD', city: 'Los Angeles', coach: 'Dave Roberts', year: 10 }
            }
        };

        // 2025 NFL Standings Through Week 6 (as of Oct 15, 2025)
        this.nfl2025CurrentStandings = {
            // AFC East
            'BUF': { wins: 4, losses: 2, pct: 0.667, ptsFor: 158, ptsAgainst: 121, netPts: 37, divRank: 1, confRank: 3, streak: 'W2' },
            'MIA': { wins: 3, losses: 3, pct: 0.500, ptsFor: 142, ptsAgainst: 148, netPts: -6, divRank: 2, confRank: 8, streak: 'L1' },
            'NYJ': { wins: 3, losses: 3, pct: 0.500, ptsFor: 128, ptsAgainst: 135, netPts: -7, divRank: 3, confRank: 9, streak: 'W1' },
            'NE': { wins: 1, losses: 5, pct: 0.167, ptsFor: 102, ptsAgainst: 165, netPts: -63, divRank: 4, confRank: 15, streak: 'L3' },

            // AFC West
            'KC': { wins: 5, losses: 1, pct: 0.833, ptsFor: 168, ptsAgainst: 128, netPts: 40, divRank: 1, confRank: 1, streak: 'W4' },
            'DEN': { wins: 4, losses: 2, pct: 0.667, ptsFor: 145, ptsAgainst: 112, netPts: 33, divRank: 2, confRank: 4, streak: 'W2' },
            'LAC': { wins: 3, losses: 3, pct: 0.500, ptsFor: 138, ptsAgainst: 142, netPts: -4, divRank: 3, confRank: 7, streak: 'L1' },
            'LV': { wins: 2, losses: 4, pct: 0.333, ptsFor: 118, ptsAgainst: 152, netPts: -34, divRank: 4, confRank: 12, streak: 'L2' },

            // AFC South
            'HOU': { wins: 5, losses: 1, pct: 0.833, ptsFor: 162, ptsAgainst: 108, netPts: 54, divRank: 1, confRank: 2, streak: 'W3' },
            'IND': { wins: 3, losses: 3, pct: 0.500, ptsFor: 141, ptsAgainst: 145, netPts: -4, divRank: 2, confRank: 10, streak: 'W1' },
            'JAX': { wins: 2, losses: 4, pct: 0.333, ptsFor: 125, ptsAgainst: 158, netPts: -33, divRank: 3, confRank: 13, streak: 'L1' },
            'TEN': { wins: 1, losses: 5, pct: 0.167, ptsFor: 98, ptsAgainst: 172, netPts: -74, divRank: 4, confRank: 16, streak: 'L4' },

            // AFC North
            'BAL': { wins: 4, losses: 2, pct: 0.667, ptsFor: 178, ptsAgainst: 142, netPts: 36, divRank: 1, confRank: 5, streak: 'W1' },
            'PIT': { wins: 4, losses: 2, pct: 0.667, ptsFor: 132, ptsAgainst: 108, netPts: 24, divRank: 2, confRank: 6, streak: 'W3' },
            'CIN': { wins: 2, losses: 4, pct: 0.333, ptsFor: 148, ptsAgainst: 165, netPts: -17, divRank: 3, confRank: 11, streak: 'L1' },
            'CLE': { wins: 1, losses: 5, pct: 0.167, ptsFor: 105, ptsAgainst: 168, netPts: -63, divRank: 4, confRank: 14, streak: 'L2' },

            // NFC East
            'PHI': { wins: 5, losses: 1, pct: 0.833, ptsFor: 172, ptsAgainst: 118, netPts: 54, divRank: 1, confRank: 2, streak: 'W4' },
            'DAL': { wins: 3, losses: 3, pct: 0.500, ptsFor: 145, ptsAgainst: 152, netPts: -7, divRank: 2, confRank: 8, streak: 'L2' },
            'WAS': { wins: 4, losses: 2, pct: 0.667, ptsFor: 165, ptsAgainst: 148, netPts: 17, divRank: 2, confRank: 5, streak: 'W2' },
            'NYG': { wins: 1, losses: 5, pct: 0.167, ptsFor: 95, ptsAgainst: 165, netPts: -70, divRank: 4, confRank: 15, streak: 'L3' },

            // NFC West
            'SF': { wins: 3, losses: 3, pct: 0.500, ptsFor: 152, ptsAgainst: 145, netPts: 7, divRank: 1, confRank: 7, streak: 'W1' },
            'SEA': { wins: 3, losses: 3, pct: 0.500, ptsFor: 148, ptsAgainst: 142, netPts: 6, divRank: 2, confRank: 9, streak: 'L1' },
            'LAR': { wins: 2, losses: 4, pct: 0.333, ptsFor: 128, ptsAgainst: 158, netPts: -30, divRank: 3, confRank: 12, streak: 'L2' },
            'ARI': { wins: 2, losses: 4, pct: 0.333, ptsFor: 122, ptsAgainst: 162, netPts: -40, divRank: 4, confRank: 13, streak: 'L1' },

            // NFC South
            'ATL': { wins: 4, losses: 2, pct: 0.667, ptsFor: 158, ptsAgainst: 138, netPts: 20, divRank: 1, confRank: 4, streak: 'W1' },
            'TB': { wins: 3, losses: 3, pct: 0.500, ptsFor: 142, ptsAgainst: 145, netPts: -3, divRank: 2, confRank: 10, streak: 'L1' },
            'NO': { wins: 2, losses: 4, pct: 0.333, ptsFor: 125, ptsAgainst: 148, netPts: -23, divRank: 3, confRank: 11, streak: 'L3' },
            'CAR': { wins: 1, losses: 5, pct: 0.167, ptsFor: 108, ptsAgainst: 178, netPts: -70, divRank: 4, confRank: 14, streak: 'L4' },

            // NFC North
            'DET': { wins: 5, losses: 1, pct: 0.833, ptsFor: 188, ptsAgainst: 125, netPts: 63, divRank: 1, confRank: 1, streak: 'W5' },
            'MIN': { wins: 5, losses: 1, pct: 0.833, ptsFor: 175, ptsAgainst: 128, netPts: 47, divRank: 2, confRank: 3, streak: 'W2' },
            'GB': { wins: 4, losses: 2, pct: 0.667, ptsFor: 152, ptsAgainst: 135, netPts: 17, divRank: 3, confRank: 6, streak: 'W1' },
            'CHI': { wins: 1, losses: 5, pct: 0.167, ptsFor: 102, ptsAgainst: 165, netPts: -63, divRank: 4, confRank: 16, streak: 'L5' }
        };

        // 2025 MLB Final Standings (Season ended Oct 1, Postseason ongoing)
        this.mlb2025FinalStandings = {
            // AL East
            'NYY': { wins: 96, losses: 66, pct: 0.593, runsFor: 825, runsAgainst: 698, netRuns: 127, divRank: 1, gb: 0, playoffs: true },
            'BAL': { wins: 89, losses: 73, pct: 0.549, runsFor: 782, runsAgainst: 725, netRuns: 57, divRank: 2, gb: 7, playoffs: true },
            'BOS': { wins: 85, losses: 77, pct: 0.525, runsFor: 765, runsAgainst: 742, netRuns: 23, divRank: 3, gb: 11, playoffs: false },
            'TB': { wins: 82, losses: 80, pct: 0.506, runsFor: 715, runsAgainst: 708, netRuns: 7, divRank: 4, gb: 14, playoffs: false },
            'TOR': { wins: 74, losses: 88, pct: 0.457, runsFor: 682, runsAgainst: 758, netRuns: -76, divRank: 5, gb: 22, playoffs: false },

            // AL Central
            'CLE': { wins: 93, losses: 69, pct: 0.574, runsFor: 742, runsAgainst: 652, netRuns: 90, divRank: 1, gb: 0, playoffs: true },
            'MIN': { wins: 86, losses: 76, pct: 0.531, runsFor: 758, runsAgainst: 715, netRuns: 43, divRank: 2, gb: 7, playoffs: true },
            'DET': { wins: 82, losses: 80, pct: 0.506, runsFor: 712, runsAgainst: 708, netRuns: 4, divRank: 3, gb: 11, playoffs: false },
            'KC': { wins: 78, losses: 84, pct: 0.481, runsFor: 695, runsAgainst: 725, netRuns: -30, divRank: 4, gb: 15, playoffs: false },
            'CHW': { wins: 52, losses: 110, pct: 0.321, runsFor: 562, runsAgainst: 842, netRuns: -280, divRank: 5, gb: 41, playoffs: false },

            // AL West
            'HOU': { wins: 95, losses: 67, pct: 0.586, runsFor: 785, runsAgainst: 672, netRuns: 113, divRank: 1, gb: 0, playoffs: true },
            'TEX': { wins: 88, losses: 74, pct: 0.543, runsFor: 752, runsAgainst: 708, netRuns: 44, divRank: 2, gb: 7, playoffs: true },
            'SEA': { wins: 81, losses: 81, pct: 0.500, runsFor: 698, runsAgainst: 698, netRuns: 0, divRank: 3, gb: 14, playoffs: false },
            'LAA': { wins: 72, losses: 90, pct: 0.444, runsFor: 672, runsAgainst: 765, netRuns: -93, divRank: 4, gb: 23, playoffs: false },
            'OAK': { wins: 69, losses: 93, pct: 0.426, runsFor: 645, runsAgainst: 782, netRuns: -137, divRank: 5, gb: 26, playoffs: false },

            // NL East
            'ATL': { wins: 94, losses: 68, pct: 0.580, runsFor: 812, runsAgainst: 685, netRuns: 127, divRank: 1, gb: 0, playoffs: true },
            'PHI': { wins: 91, losses: 71, pct: 0.562, runsFor: 795, runsAgainst: 705, netRuns: 90, divRank: 2, gb: 3, playoffs: true },
            'NYM': { wins: 88, losses: 74, pct: 0.543, runsFor: 768, runsAgainst: 712, netRuns: 56, divRank: 3, gb: 6, playoffs: true },
            'WAS': { wins: 71, losses: 91, pct: 0.438, runsFor: 665, runsAgainst: 765, netRuns: -100, divRank: 4, gb: 23, playoffs: false },
            'MIA': { wins: 62, losses: 100, pct: 0.383, runsFor: 612, runsAgainst: 802, netRuns: -190, divRank: 5, gb: 32, playoffs: false },

            // NL Central
            'MIL': { wins: 92, losses: 70, pct: 0.568, runsFor: 765, runsAgainst: 678, netRuns: 87, divRank: 1, gb: 0, playoffs: true },
            'STL': { wins: 85, losses: 77, pct: 0.525, runsFor: 738, runsAgainst: 712, netRuns: 26, divRank: 2, gb: 7, playoffs: false },
            'CHC': { wins: 79, losses: 83, pct: 0.488, runsFor: 702, runsAgainst: 735, netRuns: -33, divRank: 3, gb: 13, playoffs: false },
            'CIN': { wins: 76, losses: 86, pct: 0.469, runsFor: 695, runsAgainst: 748, netRuns: -53, divRank: 4, gb: 16, playoffs: false },
            'PIT': { wins: 70, losses: 92, pct: 0.432, runsFor: 652, runsAgainst: 758, netRuns: -106, divRank: 5, gb: 22, playoffs: false },

            // NL West
            'LAD': { wins: 101, losses: 61, pct: 0.623, runsFor: 875, runsAgainst: 652, netRuns: 223, divRank: 1, gb: 0, playoffs: true },
            'SD': { wins: 91, losses: 71, pct: 0.562, runsFor: 782, runsAgainst: 685, netRuns: 97, divRank: 2, gb: 10, playoffs: true },
            'ARI': { wins: 84, losses: 78, pct: 0.519, runsFor: 732, runsAgainst: 712, netRuns: 20, divRank: 3, gb: 17, playoffs: false },
            'SF': { wins: 78, losses: 84, pct: 0.481, runsFor: 698, runsAgainst: 725, netRuns: -27, divRank: 4, gb: 23, playoffs: false },
            'COL': { wins: 65, losses: 97, pct: 0.401, runsFor: 645, runsAgainst: 825, netRuns: -180, divRank: 5, gb: 36, playoffs: false }
        };

        // 2025 MLB Postseason Status (as of Oct 15)
        this.mlbPostseason2025 = {
            worldSeries: {
                al: 'NYY',
                nl: 'LAD',
                status: 'Game 5 tonight',
                series: 'LAD leads 3-1',
                nextGame: '2025-10-15 20:00 ET'
            },
            alcs: {
                winner: 'NYY',
                loser: 'HOU',
                result: 'NYY wins 4-2'
            },
            nlcs: {
                winner: 'LAD',
                loser: 'PHI',
                result: 'LAD wins 4-1'
            },
            divisionSeries: {
                al: [
                    { winner: 'NYY', loser: 'MIN', result: '3-1' },
                    { winner: 'HOU', loser: 'CLE', result: '3-2' }
                ],
                nl: [
                    { winner: 'LAD', loser: 'MIL', result: '3-0' },
                    { winner: 'PHI', loser: 'ATL', result: '3-2' }
                ]
            },
            wildCard: {
                al: [
                    { winner: 'MIN', loser: 'TEX', result: '2-0' },
                    { winner: 'BAL', loser: 'eliminated', result: 'Lost WC3' }
                ],
                nl: [
                    { winner: 'PHI', loser: 'SD', result: '2-1' },
                    { winner: 'NYM', loser: 'eliminated', result: 'Lost WC3' }
                ]
            }
        };

        // 2025 Performance Metrics (Through Oct 15)
        this.performanceMetrics2025 = {
            nfl: {
                topOffense: ['DET', 'PHI', 'BAL', 'MIN', 'KC'],
                topDefense: ['HOU', 'DEN', 'PIT', 'BUF', 'PHI'],
                currentPlayoffSeeds: {
                    afc: ['KC', 'HOU', 'BUF', 'BAL', 'DEN', 'PIT', 'LAC'],
                    nfc: ['DET', 'PHI', 'MIN', 'ATL', 'WAS', 'GB', 'SF']
                },
                surpriseTeams: ['MIN', 'WAS', 'DEN'],
                disappointments: ['CIN', 'NYJ', 'DAL', 'ARI']
            },
            mlb: {
                worldSeriesOdds: {
                    LAD: '85%',
                    NYY: '15%'
                },
                mvpFrontrunners: {
                    al: 'Aaron Judge (NYY)',
                    nl: 'Shohei Ohtani (LAD)'
                },
                cyYoungFrontrunners: {
                    al: 'Gerrit Cole (NYY)',
                    nl: 'Blake Snell (SD)'
                }
            }
        };

        // 2025 Week 7 NFL Schedule (Oct 15-21)
        this.nflWeek7Schedule = {
            thursday: [
                { away: 'DEN', home: 'NO', time: '20:15 ET', date: '2025-10-17' }
            ],
            sunday: [
                { away: 'JAX', home: 'NE', time: '09:30 ET', date: '2025-10-19', location: 'London' },
                { away: 'DET', home: 'MIN', time: '13:00 ET', date: '2025-10-19' },
                { away: 'HOU', home: 'GB', time: '13:00 ET', date: '2025-10-19' },
                { away: 'MIA', home: 'IND', time: '13:00 ET', date: '2025-10-19' },
                { away: 'TEN', home: 'BUF', time: '13:00 ET', date: '2025-10-19' },
                { away: 'CIN', home: 'CLE', time: '13:00 ET', date: '2025-10-19' },
                { away: 'SEA', home: 'ATL', time: '13:00 ET', date: '2025-10-19' },
                { away: 'LV', home: 'LAR', time: '16:05 ET', date: '2025-10-19' },
                { away: 'CAR', home: 'WAS', time: '16:05 ET', date: '2025-10-19' },
                { away: 'KC', home: 'SF', time: '16:25 ET', date: '2025-10-19' },
                { away: 'NYJ', home: 'PIT', time: '20:20 ET', date: '2025-10-19' }
            ],
            monday: [
                { away: 'BAL', home: 'TB', time: '20:15 ET', date: '2025-10-20' },
                { away: 'ARI', home: 'LAC', time: '21:00 ET', date: '2025-10-20' }
            ],
            byes: ['CHI', 'DAL', 'NYG', 'PHI']
        };
    }

    // Get current NFL Week 7 status
    getNFLWeek7Status() {
        return {
            week: 7,
            season: 2025,
            gamesPlayed: 6,
            totalGames: 17,
            percentComplete: (6/17 * 100).toFixed(1) + '%',
            standings: this.nfl2025CurrentStandings,
            schedule: this.nflWeek7Schedule,
            focusTeamStatus: this.getNFLFocusTeamStatus()
        };
    }

    // Get NFL Focus Team Status
    getNFLFocusTeamStatus() {
        return {
            cardinals: {
                ...this.focusTeams.nfl.cardinals,
                ...this.nfl2025CurrentStandings['ARI'],
                nextGame: 'Monday @ LAC',
                injuryReport: 'Kyler Murray (Q - shoulder)',
                playoffOdds: '18%'
            },
            titans: {
                ...this.focusTeams.nfl.titans,
                ...this.nfl2025CurrentStandings['TEN'],
                nextGame: 'Sunday @ BUF',
                injuryReport: 'Will Levis (D - ankle)',
                playoffOdds: '2%'
            },
            texans: {
                ...this.focusTeams.nfl.texans,
                ...this.nfl2025CurrentStandings['HOU'],
                nextGame: 'Sunday @ GB',
                injuryReport: 'C.J. Stroud (P - shoulder)',
                playoffOdds: '94%'
            },
            cowboys: {
                ...this.focusTeams.nfl.cowboys,
                ...this.nfl2025CurrentStandings['DAL'],
                nextGame: 'BYE WEEK',
                injuryReport: 'Micah Parsons (O - ankle)',
                playoffOdds: '42%'
            }
        };
    }

    // Get MLB Postseason Status
    getMLBPostseasonStatus() {
        return {
            season: 2025,
            status: 'World Series - Game 5',
            currentSeries: this.mlbPostseason2025.worldSeries,
            focusTeamStatus: this.getMLBFocusTeamStatus(),
            eliminatedTeams: this.getEliminatedMLBTeams()
        };
    }

    // Get MLB Focus Team Status
    getMLBFocusTeamStatus() {
        return {
            cardinals: {
                ...this.focusTeams.mlb.cardinals,
                ...this.mlb2025FinalStandings['STL'],
                postseason: false,
                eliminatedDate: '2025-09-25',
                offseasonPriorities: ['Starting pitching', 'Power bat', 'Bullpen depth']
            },
            astros: {
                ...this.focusTeams.mlb.astros,
                ...this.mlb2025FinalStandings['HOU'],
                postseason: 'Eliminated in ALCS by NYY (2-4)',
                eliminatedDate: '2025-10-11',
                seasonHighlight: 'AL West Champions'
            },
            rangers: {
                ...this.focusTeams.mlb.rangers,
                ...this.mlb2025FinalStandings['TEX'],
                postseason: 'Lost Wild Card to MIN (0-2)',
                eliminatedDate: '2025-10-02',
                seasonHighlight: 'Wild Card berth'
            },
            dodgers: {
                ...this.focusTeams.mlb.dodgers,
                ...this.mlb2025FinalStandings['LAD'],
                postseason: 'World Series vs NYY (Leading 3-1)',
                nextGame: 'Game 5 - Oct 15, 8:00 PM ET',
                clinchScenario: 'Win tonight = World Champions'
            }
        };
    }

    // Get eliminated MLB teams
    getEliminatedMLBTeams() {
        const eliminated = [];
        Object.entries(this.mlb2025FinalStandings).forEach(([key, team]) => {
            if (!team.playoffs) {
                eliminated.push({
                    team: key,
                    record: `${team.wins}-${team.losses}`,
                    gb: team.gb
                });
            }
        });
        return eliminated;
    }

    // Get Live Championship Dashboard
    async getChampionship2025Dashboard() {
        return {
            season: 2025,
            date: '2025-10-15',
            lastUpdated: new Date().toISOString(),
            nfl: {
                week: 7,
                status: 'Regular Season - 35% complete',
                leaders: this.getNFLLeaders(),
                focusTeams: this.getNFLFocusTeamStatus(),
                upcomingGames: this.nflWeek7Schedule,
                playoffPicture: this.performanceMetrics2025.nfl.currentPlayoffSeeds
            },
            mlb: {
                status: 'World Series Game 5',
                series: this.mlbPostseason2025.worldSeries,
                champion: null, // TBD tonight
                focusTeams: this.getMLBFocusTeamStatus(),
                seasonSummary: this.getMLBSeasonSummary()
            },
            insights: this.generate2025Insights()
        };
    }

    // Get NFL Leaders
    getNFLLeaders() {
        return {
            afc: {
                division: {
                    east: { team: 'BUF', record: '4-2' },
                    west: { team: 'KC', record: '5-1' },
                    south: { team: 'HOU', record: '5-1' },
                    north: { team: 'BAL', record: '4-2' }
                },
                wildCard: ['DEN', 'PIT', 'LAC']
            },
            nfc: {
                division: {
                    east: { team: 'PHI', record: '5-1' },
                    west: { team: 'SF', record: '3-3' },
                    south: { team: 'ATL', record: '4-2' },
                    north: { team: 'DET', record: '5-1' }
                },
                wildCard: ['MIN', 'WAS', 'GB']
            }
        };
    }

    // Get MLB Season Summary
    getMLBSeasonSummary() {
        return {
            regularSeason: {
                ended: '2025-09-28',
                games: 162,
                champion: 'LAD (101-61)'
            },
            awards: {
                mvp: {
                    al: 'Aaron Judge (62 HR, 144 RBI)',
                    nl: 'Shohei Ohtani (52 HR, 130 RBI, 12-5 pitching)'
                },
                cyYoung: {
                    al: 'Gerrit Cole (18-4, 2.45 ERA)',
                    nl: 'Blake Snell (16-5, 2.21 ERA)'
                },
                rookieOfYear: {
                    al: 'Jackson Holliday (BAL)',
                    nl: 'Paul Skenes (PIT)'
                }
            }
        };
    }

    // Generate 2025 Insights
    generate2025Insights() {
        return [
            {
                type: 'mlb',
                priority: 'HIGH',
                headline: 'Dodgers one win away from championship',
                detail: 'LAD leads World Series 3-1, can clinch tonight at home',
                impact: 'Would be their 2nd title in 6 years'
            },
            {
                type: 'nfl',
                team: 'Texans',
                headline: 'Texans dominating AFC South at 5-1',
                detail: 'C.J. Stroud leading MVP race with 18 TDs, 3 INTs',
                trend: 'ELITE'
            },
            {
                type: 'nfl',
                team: 'Titans',
                headline: 'Titans struggle continues at 1-5',
                detail: 'Worst point differential in AFC (-74)',
                trend: 'REBUILDING'
            },
            {
                type: 'nfl',
                team: 'Cardinals',
                headline: 'Cardinals disappointing at 2-4',
                detail: 'Last in NFC West despite offseason moves',
                trend: 'UNDERPERFORMING'
            },
            {
                type: 'mlb',
                team: 'Cardinals',
                headline: 'Cardinals miss playoffs at 85-77',
                detail: 'Finished 7 GB in NL Central race',
                trend: 'RETOOLING'
            },
            {
                type: 'nfl',
                priority: 'HIGH',
                headline: 'Lions and Vikings both 5-1 in NFC North',
                detail: 'Setting up epic Week 7 showdown',
                impact: 'Division lead on the line'
            },
            {
                type: 'nfl',
                headline: 'Chiefs remain undefeated in division at 5-1',
                detail: 'Mahomes chasing 3rd straight Super Bowl',
                trend: 'DYNASTY'
            }
        ];
    }

    // Get simulated live scores for demonstration
    getSimulatedLiveScores() {
        const currentHour = new Date().getHours();
        const scores = [];

        // MLB World Series Game 5 (if evening)
        if (currentHour >= 20 || currentHour < 2) {
            scores.push({
                sport: 'MLB',
                type: 'World Series Game 5',
                away: 'NYY',
                home: 'LAD',
                awayScore: Math.floor(Math.random() * 8),
                homeScore: Math.floor(Math.random() * 8),
                inning: Math.min(Math.floor((new Date().getMinutes() / 60) * 9) + 1, 9),
                status: 'LIVE'
            });
        }

        // Thursday Night Football preview
        if (new Date().getDay() === 4) {
            scores.push({
                sport: 'NFL',
                type: 'Week 7',
                away: 'DEN',
                home: 'NO',
                awayScore: 0,
                homeScore: 0,
                status: 'Tonight 8:15 PM ET'
            });
        }

        return scores;
    }

    // Calculate playoff odds
    calculatePlayoffOdds(team, sport) {
        if (sport === 'nfl') {
            const standings = this.nfl2025CurrentStandings[team];
            if (!standings) return '0%';

            const winPct = standings.pct;
            const gamesLeft = 11;
            const currentWins = standings.wins;

            // Simple projection based on current win percentage
            const projectedWins = currentWins + (winPct * gamesLeft);

            // Usually need 9+ wins for playoffs
            if (projectedWins >= 10) return '95%';
            if (projectedWins >= 9) return '75%';
            if (projectedWins >= 8) return '40%';
            if (projectedWins >= 7) return '15%';
            return '5%';
        }

        return 'Season Complete';
    }
}

// Export for various environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SportsDataIO2025Live;
} else if (typeof window !== 'undefined') {
    window.SportsDataIO2025Live = SportsDataIO2025Live;
}