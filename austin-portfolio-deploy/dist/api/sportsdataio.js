/**
 * Blaze Intelligence - SportsDataIO Netlify Function
 * Serverless API endpoint for sports data
 */

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const path = event.path.replace('/.netlify/functions/sportsdataio', '');
        const segments = path.split('/').filter(Boolean);

        // Parse query parameters
        const params = event.queryStringParameters || {};

        // Mock SportsDataIO response structure for demo
        let response = {};

        // Route handling
        switch (segments[0]) {
            case 'stats':
                response = await getStats(segments[1], params);
                break;

            case 'scores':
                response = await getScores(segments[1], params);
                break;

            case 'teams':
                response = await getTeams(segments[1]);
                break;

            case 'blaze':
                response = await getBlazeData(segments[1]);
                break;

            case 'dictionary':
                response = await getDataDictionary();
                break;

            default:
                response = {
                    status: 'ready',
                    timestamp: new Date().toISOString(),
                    endpoints: [
                        '/stats/{league}',
                        '/scores/{league}',
                        '/teams/{league}',
                        '/blaze/performance',
                        '/dictionary'
                    ]
                };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: error.message
            })
        };
    }
};

// Get statistics
async function getStats(league, params) {
    const mockStats = {
        nfl: {
            titans: {
                wins: 7,
                losses: 3,
                pointsScored: 247,
                pointsAgainst: 198,
                passingYards: 2456,
                rushingYards: 1234
            }
        },
        mlb: {
            cardinals: {
                wins: 83,
                losses: 79,
                runsScored: 726,
                runsAgainst: 681,
                battingAverage: 0.256,
                era: 3.79
            }
        },
        nba: {
            grizzlies: {
                wins: 51,
                losses: 31,
                pointsPerGame: 115.5,
                opponentsPPG: 109.9,
                fieldGoalPct: 0.461
            }
        },
        ncaa: {
            longhorns: {
                wins: 11,
                losses: 1,
                pointsPerGame: 38.7,
                yardsPerGame: 487.3,
                ranking: 3
            }
        }
    };

    return {
        league,
        season: params.season || '2025',
        data: mockStats[league] || {},
        timestamp: new Date().toISOString()
    };
}

// Get scores
async function getScores(league, params) {
    const mockScores = {
        nfl: [
            {
                homeTeam: 'TEN',
                awayTeam: 'HOU',
                homeScore: 27,
                awayScore: 24,
                quarter: 'Final',
                date: '2025-01-12'
            }
        ],
        mlb: [
            {
                homeTeam: 'STL',
                awayTeam: 'CHC',
                homeScore: 5,
                awayScore: 3,
                inning: 'Final',
                date: '2025-01-11'
            }
        ],
        nba: [
            {
                homeTeam: 'MEM',
                awayTeam: 'LAL',
                homeScore: 112,
                awayScore: 108,
                quarter: '4th',
                time: '2:35',
                date: '2025-01-12'
            }
        ]
    };

    return {
        league,
        week: params.week || 'current',
        scores: mockScores[league] || [],
        timestamp: new Date().toISOString()
    };
}

// Get teams
async function getTeams(league) {
    const teams = {
        nfl: [
            { id: 'TEN', name: 'Tennessee Titans', conference: 'AFC', division: 'South' },
            { id: 'ARI', name: 'Arizona Cardinals', conference: 'NFC', division: 'West' }
        ],
        mlb: [
            { id: 'STL', name: 'St. Louis Cardinals', league: 'NL', division: 'Central' }
        ],
        nba: [
            { id: 'MEM', name: 'Memphis Grizzlies', conference: 'Western', division: 'Southwest' }
        ],
        ncaa: [
            { id: 'TEX', name: 'Texas Longhorns', conference: 'Big 12', sport: 'Football' }
        ]
    };

    return {
        league,
        teams: teams[league] || [],
        count: teams[league]?.length || 0,
        timestamp: new Date().toISOString()
    };
}

// Get Blaze Intelligence custom data
async function getBlazeData(endpoint) {
    const blazeData = {
        performance: {
            cardinals: {
                readinessScore: 87.3,
                championshipProb: 0.623,
                keyPlayers: [
                    { name: 'Goldschmidt', avg: 0.285, hr: 35, rbi: 115 },
                    { name: 'Arenado', avg: 0.293, hr: 28, rbi: 103 }
                ]
            },
            titans: {
                powerIndex: 91.2,
                playoffProb: 0.784,
                keyPlayers: [
                    { name: 'Henry', rushYards: 1243, td: 13 },
                    { name: 'Tannehill', qbr: 67.8, passYards: 3124 }
                ]
            },
            longhorns: {
                championshipProb: 0.941,
                ranking: 3,
                keyPlayers: [
                    { name: 'Ewers', passYards: 3124, td: 29 },
                    { name: 'Brooks', rushYards: 912, td: 10 }
                ]
            },
            grizzlies: {
                efficiencyRating: 89.7,
                playoffSeed: 2,
                keyPlayers: [
                    { name: 'Morant', ppg: 27.4, apg: 8.3 },
                    { name: 'Jackson Jr', ppg: 16.3, rpg: 6.4 }
                ]
            }
        },
        predictions: {
            accuracy: 94.6,
            recentPredictions: [
                { game: 'TEN vs HOU', prediction: 'TEN by 3', actual: 'TEN by 3', correct: true },
                { game: 'STL vs CHC', prediction: 'STL by 2', actual: 'STL by 2', correct: true },
                { game: 'MEM vs LAL', prediction: 'MEM by 4', actual: 'MEM by 4', correct: true }
            ]
        },
        aiInsights: {
            patterns: [
                'Titans show 78% win rate in divisional games',
                'Cardinals batting improves 23% with runners in scoring position',
                'Grizzlies outscore opponents by avg 12.3 in 3rd quarter',
                'Longhorns defense allows 67% fewer yards in red zone'
            ],
            recommendations: [
                'Increase Titans passing plays on 3rd down',
                'Cardinals should bat Goldschmidt 3rd for optimal RBI opportunities',
                'Grizzlies maintain current 3rd quarter rotation',
                'Longhorns continue zone coverage in red zone'
            ]
        }
    };

    if (endpoint && blazeData[endpoint]) {
        return blazeData[endpoint];
    }

    return blazeData;
}

// Get data dictionary stats
async function getDataDictionary() {
    return {
        nfl: {
            tables: 77,
            fields: 3218,
            dataTypes: {
                integer: 1842,
                string: 876,
                boolean: 234,
                datetime: 156,
                decimal: 110
            },
            topTables: [
                { name: 'TeamGame', fields: 256 },
                { name: 'TeamSeason', fields: 239 },
                { name: 'PlayerGame', fields: 169 },
                { name: 'PlayerSeason', fields: 141 },
                { name: 'Score', fields: 78 }
            ]
        },
        apiCoverage: {
            leagues: ['nfl', 'mlb', 'nba', 'ncaaf', 'ncaab'],
            totalEndpoints: 147,
            realTimeEndpoints: 23,
            historicalYears: 10
        },
        blazeIntegration: {
            customEndpoints: 12,
            aiModels: 4,
            predictionAccuracy: 94.6,
            responseTime: '87ms'
        },
        timestamp: new Date().toISOString()
    };
}