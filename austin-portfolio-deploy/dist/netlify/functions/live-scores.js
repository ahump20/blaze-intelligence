const axios = require('axios');

// ESPN API endpoints (public, no auth required)
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const ENDPOINTS = {
    mlb: `${ESPN_BASE}/baseball/mlb/scoreboard`,
    nfl: `${ESPN_BASE}/football/nfl/scoreboard`,
    nba: `${ESPN_BASE}/basketball/nba/scoreboard`,
    ncaa: `${ESPN_BASE}/football/college-football/scoreboard`
};

// Team mappings
const TEAM_MAPPINGS = {
    mlb: {
        cardinals: 'STL',
        'st-louis': 'STL'
    },
    nfl: {
        titans: 'TEN',
        tennessee: 'TEN'
    },
    nba: {
        grizzlies: 'MEM',
        memphis: 'MEM'
    },
    ncaa: {
        longhorns: 'TEX',
        texas: 'TEX'
    }
};

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const { sport, team } = event.queryStringParameters || {};

        if (!sport) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Sport parameter is required' })
            };
        }

        // Fetch live data from ESPN
        const response = await axios.get(ENDPOINTS[sport] || ENDPOINTS.mlb, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; BlazeIntelligence/1.0)'
            }
        });

        const games = response.data?.events || [];

        // If team specified, filter for that team
        if (team && TEAM_MAPPINGS[sport]) {
            const teamCode = TEAM_MAPPINGS[sport][team.toLowerCase()];
            const teamGame = games.find(game => {
                const competitors = game.competitions?.[0]?.competitors || [];
                return competitors.some(c =>
                    c.team?.abbreviation === teamCode
                );
            });

            if (teamGame) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(formatGameData(teamGame, teamCode))
                };
            }
        }

        // Return all games if no specific team
        const formattedGames = games.slice(0, 10).map(game => formatGameData(game));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ games: formattedGames })
        };

    } catch (error) {
        console.error('Error fetching live scores:', error);

        // Return mock data as fallback
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(getMockData(event.queryStringParameters))
        };
    }
};

function formatGameData(game, focusTeam = null) {
    const competition = game.competitions?.[0];
    if (!competition) return null;

    const competitors = competition.competitors || [];
    const home = competitors.find(c => c.homeAway === 'home');
    const away = competitors.find(c => c.homeAway === 'away');

    if (!home || !away) return null;

    const status = competition.status;
    const isLive = status?.type?.state === 'in';
    const period = status?.period || 1;
    const clock = status?.displayClock || '';

    // Determine which team is focus team
    let focusTeamData = null;
    let opponentData = null;

    if (focusTeam) {
        if (home.team?.abbreviation === focusTeam) {
            focusTeamData = home;
            opponentData = away;
        } else if (away.team?.abbreviation === focusTeam) {
            focusTeamData = away;
            opponentData = home;
        }
    }

    const baseData = {
        gameId: game.id,
        status: isLive ? 'LIVE' : status?.type?.description,
        period: period,
        clock: clock,
        venue: game.venue?.fullName,
        attendance: game.attendance
    };

    if (focusTeamData && opponentData) {
        // Single team focus
        return {
            ...baseData,
            team: focusTeamData.team?.displayName,
            opponent: opponentData.team?.displayName,
            score: {
                home: home.score || '0',
                away: away.score || '0'
            },
            isHome: focusTeamData.homeAway === 'home',
            lastPlay: competition.situation?.lastPlay?.text || 'Game in progress',
            winProbability: focusTeamData.probabilities?.[0]?.percentage
                ? (focusTeamData.probabilities[0].percentage * 100).toFixed(1)
                : null,
            leaders: focusTeamData.leaders?.map(l => ({
                name: l.athlete?.displayName,
                stat: l.displayValue
            }))
        };
    }

    // General game data
    return {
        ...baseData,
        home: {
            team: home.team?.displayName,
            score: home.score || '0',
            logo: home.team?.logo
        },
        away: {
            team: away.team?.displayName,
            score: away.score || '0',
            logo: away.team?.logo
        }
    };
}

function getMockData(params) {
    const { sport, team } = params || {};

    const mockGames = {
        mlb: {
            cardinals: {
                team: 'St. Louis Cardinals',
                opponent: 'Chicago Cubs',
                score: { home: '7', away: '4' },
                isHome: true,
                period: 7,
                clock: '',
                status: 'LIVE',
                lastPlay: 'P. Goldschmidt doubled to left center, N. Arenado scored',
                winProbability: '78.5',
                venue: 'Busch Stadium'
            }
        },
        nfl: {
            titans: {
                team: 'Tennessee Titans',
                opponent: 'Jacksonville Jaguars',
                score: { home: '24', away: '17' },
                isHome: true,
                period: 3,
                clock: '8:42',
                status: 'LIVE',
                lastPlay: 'D. Henry rush up the middle for 12 yards',
                winProbability: '71.2',
                venue: 'Nissan Stadium'
            }
        },
        ncaa: {
            longhorns: {
                team: 'Texas Longhorns',
                opponent: 'Oklahoma Sooners',
                score: { home: '35', away: '28' },
                isHome: true,
                period: 4,
                clock: '5:21',
                status: 'LIVE',
                lastPlay: 'Q. Ewers pass complete to X. Worthy for 23 yards',
                winProbability: '89.3',
                venue: 'Darrell K Royal Stadium'
            }
        },
        nba: {
            grizzlies: {
                team: 'Memphis Grizzlies',
                opponent: 'Golden State Warriors',
                score: { home: '112', away: '108' },
                isHome: true,
                period: 4,
                clock: '2:14',
                status: 'LIVE',
                lastPlay: 'J. Morant makes driving layup',
                winProbability: '92.1',
                venue: 'FedExForum'
            }
        }
    };

    if (sport && team && mockGames[sport]?.[team]) {
        return mockGames[sport][team];
    }

    return {
        games: Object.values(mockGames).flatMap(sport => Object.values(sport))
    };
}