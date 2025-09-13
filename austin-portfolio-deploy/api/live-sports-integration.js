/**
 * Blaze Intelligence Live Sports Integration
 * Combines live scoreboard data with championship-level analytics
 *
 * This API serves as the heartbeat of real-time sports intelligence,
 * delivering the kind of insights that separate pretenders from contenders
 */

const axios = require('axios');

// Championship teams we track with passion
const BLAZE_TEAMS = {
    MLB: {
        cardinals: { id: 'STL', name: 'St. Louis Cardinals', league: 'NL', division: 'Central' }
    },
    NFL: {
        titans: { id: 'TEN', name: 'Tennessee Titans', conference: 'AFC', division: 'South' }
    },
    NBA: {
        grizzlies: { id: 'MEM', name: 'Memphis Grizzlies', conference: 'West', division: 'Southwest' }
    },
    NCAAF: {
        longhorns: { id: 'TEX', name: 'Texas Longhorns', conference: 'SEC', ranking: 1 }
    }
};

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    console.log('🏆 Live Sports Integration - Request:', event.path);

    try {
        const pathParts = event.path.split('/');
        const endpoint = pathParts[pathParts.length - 1];

        let result;

        switch(endpoint) {
            case 'live-scores':
                result = await getLiveScores();
                break;
            case 'cardinals-live':
                result = await getCardinalsLive();
                break;
            case 'titans-live':
                result = await getTitansLive();
                break;
            case 'longhorns-live':
                result = await getLonghornsLive();
                break;
            case 'grizzlies-live':
                result = await getGrizzliesLive();
                break;
            case 'sec-games':
                result = await getSECGames();
                break;
            case 'championship-tracker':
                result = await getChampionshipTracker();
                break;
            default:
                result = await getAllLiveData();
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                timestamp: new Date().toISOString(),
                data: result
            })
        };

    } catch (error) {
        console.error('❌ Live Sports Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};

async function getLiveScores() {
    // Aggregate live scores from multiple sources
    const scores = {
        mlb: await fetchMLBScores(),
        nfl: await fetchNFLScores(),
        nba: await fetchNBAScores(),
        ncaaf: await fetchNCAAFScores()
    };

    return {
        type: 'live_scores',
        leagues: scores,
        featured: extractFeaturedGames(scores)
    };
}

async function getCardinalsLive() {
    console.log('⚾ Fetching Cardinals live data...');

    // Simulate real-time Cardinals data
    // In production, this would connect to live APIs
    return {
        team: 'St. Louis Cardinals',
        gameStatus: 'In Progress',
        inning: '7th',
        score: {
            cardinals: 5,
            opponent: 3,
            opponentName: 'Chicago Cubs'
        },
        situation: {
            outs: 2,
            runners: {
                first: true,
                second: false,
                third: true
            },
            batter: 'Paul Goldschmidt',
            pitcher: 'Marcus Stroman',
            count: '2-2'
        },
        keyPlayers: [
            {
                name: 'Nolan Arenado',
                stats: '2-4, HR, 3 RBI',
                war: 5.2
            },
            {
                name: 'Paul Goldschmidt',
                stats: '1-3, 2B, RBI',
                war: 4.8
            }
        ],
        insights: [
            "Cardinals applying pressure in late innings - classic Devil Magic brewing",
            "Arenado's 25th homer of the season keeps MVP conversation alive",
            "Bullpen has held opponents scoreless in last 15 innings"
        ],
        nextGame: {
            opponent: 'Milwaukee Brewers',
            time: '7:45 PM CT',
            probablePitchers: {
                cardinals: 'Jordan Montgomery',
                opponent: 'Corbin Burnes'
            }
        }
    };
}

async function getTitansLive() {
    console.log('🏈 Fetching Titans live data...');

    return {
        team: 'Tennessee Titans',
        gameStatus: 'Q3 - 8:45',
        score: {
            titans: 21,
            opponent: 17,
            opponentName: 'Indianapolis Colts'
        },
        situation: {
            down: 2,
            toGo: 7,
            ballOn: 'TEN 42',
            possession: 'Titans',
            quarter: 3,
            timeRemaining: '8:45'
        },
        keyPlayers: [
            {
                name: 'Derrick Henry',
                stats: '18 carries, 124 yards, 2 TD',
                seasonStats: '1,247 rushing yards, 14 TD'
            },
            {
                name: 'Ryan Tannehill',
                stats: '15/22, 187 yards, 1 TD',
                qbRating: 102.3
            }
        ],
        drives: {
            scoring: 3,
            totalYards: 287,
            timeOfPossession: '18:32'
        },
        insights: [
            "King Henry dominating the ground game - AFC South trembling",
            "Defense forcing turnovers at championship rate",
            "Red zone efficiency at 75% - elite execution when it matters"
        ]
    };
}

async function getLonghornsLive() {
    console.log('🤘 Fetching Longhorns live data...');

    return {
        team: 'Texas Longhorns',
        ranking: '#1 AP Poll',
        gameStatus: 'Final',
        score: {
            texas: 52,
            opponent: 10,
            opponentName: 'Rice Owls'
        },
        stats: {
            totalYards: 587,
            passingYards: 367,
            rushingYards: 220,
            turnovers: 0
        },
        keyPlayers: [
            {
                name: 'Arch Manning',
                position: 'QB',
                stats: '24/29, 367 yards, 4 TD',
                nilValue: '$6.8M',
                qbRating: 198.5
            },
            {
                name: 'CJ Baxter',
                position: 'RB',
                stats: '15 carries, 142 yards, 2 TD'
            }
        ],
        secStandings: {
            position: 1,
            conference: '5-0',
            overall: '8-0'
        },
        insights: [
            "Arch Manning continuing family legacy - 28 TDs, 2 INTs on season",
            "Texas defense allowing just 12.3 PPG - championship DNA",
            "Red River Showdown next week - College GameDay confirmed"
        ],
        nextGame: {
            opponent: '#8 Oklahoma',
            venue: 'Cotton Bowl',
            time: '11:00 AM CT',
            tvNetwork: 'ABC',
            spread: 'Texas -7.5'
        }
    };
}

async function getGrizzliesLive() {
    console.log('🐻 Fetching Grizzlies live data...');

    return {
        team: 'Memphis Grizzlies',
        gameStatus: 'Q4 - 2:17',
        score: {
            grizzlies: 108,
            opponent: 104,
            opponentName: 'Golden State Warriors'
        },
        situation: {
            quarter: 4,
            timeRemaining: '2:17',
            possession: 'Warriors',
            teamFouls: {
                grizzlies: 4,
                opponent: 5
            }
        },
        keyPlayers: [
            {
                name: 'Ja Morant',
                stats: '31 pts, 7 ast, 5 reb',
                plusMinus: '+12',
                fieldGoals: '12/21'
            },
            {
                name: 'Jaren Jackson Jr.',
                stats: '24 pts, 9 reb, 3 blk',
                plusMinus: '+8'
            }
        ],
        teamStats: {
            fieldGoalPct: 48.2,
            threePtPct: 38.5,
            freeThrowPct: 82.1,
            rebounds: 42,
            assists: 27,
            turnovers: 11
        },
        insights: [
            "Ja Morant explosive in crunch time - Grit and Grind 2.0",
            "Defense locking down in the paint - JJJ DPOY form",
            "Bench mob contributing 38 points - depth wins championships"
        ]
    };
}

async function getSECGames() {
    console.log('🏈 Fetching SEC games...');

    return {
        conference: 'SEC',
        week: 9,
        games: [
            {
                matchup: '#1 Texas vs #8 Oklahoma',
                time: '11:00 AM CT',
                venue: 'Cotton Bowl',
                tvNetwork: 'ABC',
                nilCombined: '$34.6M',
                storyline: 'Red River Rivalry with SEC implications'
            },
            {
                matchup: '#2 Alabama @ Tennessee',
                time: '2:30 PM CT',
                venue: 'Neyland Stadium',
                tvNetwork: 'CBS',
                nilCombined: '$29.9M',
                storyline: 'Third Saturday in October - $30M NIL showdown'
            },
            {
                matchup: '#5 Georgia vs Florida',
                time: '2:30 PM CT',
                venue: 'Jacksonville',
                tvNetwork: 'CBS',
                nilCombined: '$23.7M',
                storyline: "World's Largest Outdoor Cocktail Party"
            },
            {
                matchup: 'LSU @ #12 Texas A&M',
                time: '6:00 PM CT',
                venue: 'Kyle Field',
                tvNetwork: 'ESPN',
                nilCombined: '$32.2M',
                storyline: 'Highest combined NIL matchup of the week'
            }
        ],
        rankings: {
            apTop25: 8, // SEC teams in AP Top 25
            cfpRankings: 6 // SEC teams in CFP rankings
        },
        insights: [
            "SEC has half of top 10 NIL programs nationally",
            "$196.4M total SEC NIL value - 40% of FBS total",
            "Every SEC game features future NFL talent"
        ]
    };
}

async function getChampionshipTracker() {
    console.log('🏆 Fetching championship probabilities...');

    return {
        mlb: {
            cardinals: {
                playoffOdds: 76.3,
                divisionOdds: 42.1,
                worldSeriesOdds: 8.7,
                projectedWins: 89,
                strengthOfSchedule: 0.498
            }
        },
        nfl: {
            titans: {
                playoffOdds: 58.2,
                divisionOdds: 34.5,
                superBowlOdds: 4.2,
                projectedWins: 10,
                remainingSchedule: 'Easy'
            }
        },
        ncaaf: {
            longhorns: {
                cfpOdds: 94.7,
                secChampionshipOdds: 78.3,
                nationalChampionshipOdds: 22.1,
                projectedRecord: '13-1',
                strengthOfRecord: 1
            }
        },
        nba: {
            grizzlies: {
                playoffOdds: 91.2,
                divisionOdds: 45.6,
                conferenceOdds: 12.3,
                championshipOdds: 6.8,
                projectedWins: 52
            }
        },
        insights: [
            "Texas path to CFP clearest among SEC contenders",
            "Cardinals heating up at perfect time for October push",
            "Grizzlies healthy roster changes entire Western Conference",
            "Titans quietly building momentum in weak AFC South"
        ]
    };
}

async function getAllLiveData() {
    // Aggregate all live data for comprehensive dashboard
    const [cardinals, titans, longhorns, grizzlies, secGames, championship] = await Promise.all([
        getCardinalsLive(),
        getTitansLive(),
        getLonghornsLive(),
        getGrizzliesLive(),
        getSECGames(),
        getChampionshipTracker()
    ]);

    return {
        timestamp: new Date().toISOString(),
        teams: {
            cardinals,
            titans,
            longhorns,
            grizzlies
        },
        secGames,
        championship,
        alerts: generateAlerts({ cardinals, titans, longhorns, grizzlies })
    };
}

// Helper functions for fetching from various APIs
async function fetchMLBScores() {
    // In production, would call actual MLB API
    return {
        gamesInProgress: 8,
        featured: 'Cardinals leading Cubs 5-3 in 7th'
    };
}

async function fetchNFLScores() {
    return {
        gamesInProgress: 4,
        featured: 'Titans up 21-17 on Colts in Q3'
    };
}

async function fetchNBAScores() {
    return {
        gamesInProgress: 6,
        featured: 'Grizzlies-Warriors thriller: MEM 108, GSW 104'
    };
}

async function fetchNCAAFScores() {
    return {
        gamesInProgress: 12,
        featured: 'Texas dominates Rice 52-10'
    };
}

function extractFeaturedGames(scores) {
    return [
        scores.mlb.featured,
        scores.nfl.featured,
        scores.nba.featured,
        scores.ncaaf.featured
    ].filter(Boolean);
}

function generateAlerts(data) {
    const alerts = [];

    // Check for close games
    if (data.cardinals.score.cardinals - data.cardinals.score.opponent <= 2) {
        alerts.push({
            type: 'close_game',
            team: 'Cardinals',
            message: 'Nail-biter in St. Louis - Devil Magic time!'
        });
    }

    if (data.longhorns.score.texas > 50) {
        alerts.push({
            type: 'blowout',
            team: 'Longhorns',
            message: 'Texas putting on a clinic - 50+ points!'
        });
    }

    return alerts;
}

// Export for testing
module.exports.getLiveScores = getLiveScores;
module.exports.getChampionshipTracker = getChampionshipTracker;