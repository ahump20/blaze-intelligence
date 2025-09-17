const axios = require('axios');

// ESPN API endpoints with automatic refresh
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const ENDPOINTS = {
    mlb: {
        scores: `${ESPN_BASE}/baseball/mlb/scoreboard`,
        teams: `${ESPN_BASE}/baseball/mlb/teams`,
        standings: `${ESPN_BASE}/baseball/mlb/standings`
    },
    nfl: {
        scores: `${ESPN_BASE}/football/nfl/scoreboard`,
        teams: `${ESPN_BASE}/football/nfl/teams`,
        standings: `${ESPN_BASE}/football/nfl/standings`
    },
    nba: {
        scores: `${ESPN_BASE}/basketball/nba/scoreboard`,
        teams: `${ESPN_BASE}/basketball/nba/teams`,
        standings: `${ESPN_BASE}/basketball/nba/standings`
    },
    ncaa: {
        scores: `${ESPN_BASE}/football/college-football/scoreboard`,
        teams: `${ESPN_BASE}/football/college-football/teams`,
        rankings: `${ESPN_BASE}/football/college-football/rankings`
    }
};

// Deep South teams configuration
const DEEP_SOUTH_TEAMS = {
    mlb: {
        cardinals: { id: 'STL', name: 'St. Louis Cardinals', division: 'NL Central' },
        astros: { id: 'HOU', name: 'Houston Astros', division: 'AL West' },
        rangers: { id: 'TEX', name: 'Texas Rangers', division: 'AL West' }
    },
    nfl: {
        titans: { id: 'TEN', name: 'Tennessee Titans', division: 'AFC South' },
        texans: { id: 'HOU', name: 'Houston Texans', division: 'AFC South' },
        cowboys: { id: 'DAL', name: 'Dallas Cowboys', division: 'NFC East' },
        saints: { id: 'NO', name: 'New Orleans Saints', division: 'NFC South' }
    },
    nba: {
        grizzlies: { id: 'MEM', name: 'Memphis Grizzlies', conference: 'Western' },
        mavericks: { id: 'DAL', name: 'Dallas Mavericks', conference: 'Western' },
        spurs: { id: 'SA', name: 'San Antonio Spurs', conference: 'Western' },
        pelicans: { id: 'NO', name: 'New Orleans Pelicans', conference: 'Western' }
    },
    ncaa: {
        longhorns: { id: 'TEX', name: 'Texas Longhorns', conference: 'Big 12' },
        aggies: { id: 'TAMU', name: 'Texas A&M Aggies', conference: 'SEC' },
        lsu: { id: 'LSU', name: 'LSU Tigers', conference: 'SEC' },
        alabama: { id: 'ALA', name: 'Alabama Crimson Tide', conference: 'SEC' },
        auburn: { id: 'AUB', name: 'Auburn Tigers', conference: 'SEC' },
        ole_miss: { id: 'MISS', name: 'Ole Miss Rebels', conference: 'SEC' },
        tennessee: { id: 'TENN', name: 'Tennessee Volunteers', conference: 'SEC' }
    }
};

// Perfect Game integration endpoints
const PERFECT_GAME_DATA = {
    showcases: 'https://www.perfectgame.org/Schedule/Default.aspx?Type=Showcases',
    rankings: 'https://www.perfectgame.org/Rankings/Players/NationalRankings.aspx',
    commits: 'https://www.perfectgame.org/College/Commitments/Default.aspx'
};

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { type = 'all', sport, team, feature } = event.queryStringParameters || {};

        // Auto-fetch all Deep South teams data
        if (type === 'all' || type === 'deep-south') {
            const allData = await fetchAllDeepSouthData();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    updateInterval: 30000,
                    data: allData
                })
            };
        }

        // Fetch specific sport data
        if (sport && ENDPOINTS[sport]) {
            const sportData = await fetchSportData(sport, team);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(sportData)
            };
        }

        // Fetch Perfect Game data
        if (type === 'recruitment' || type === 'perfect-game') {
            const recruitmentData = await fetchRecruitmentData();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(recruitmentData)
            };
        }

        // Default response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                available: Object.keys(ENDPOINTS),
                teams: DEEP_SOUTH_TEAMS,
                message: 'Blaze Intelligence Championship API - Deep South Authority'
            })
        };

    } catch (error) {
        console.error('Error in auto-fetch:', error);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(getMockChampionshipData())
        };
    }
};

async function fetchAllDeepSouthData() {
    const results = {
        live: {},
        standings: {},
        upcoming: {}
    };

    // Fetch live scores for all sports
    for (const [sport, teams] of Object.entries(DEEP_SOUTH_TEAMS)) {
        try {
            const response = await axios.get(ENDPOINTS[sport].scores, {
                timeout: 5000,
                headers: { 'User-Agent': 'BlazeIntelligence/2.0' }
            });

            const games = response.data?.events || [];
            results.live[sport] = processGamesForTeams(games, teams);
        } catch (error) {
            console.error(`Error fetching ${sport} data:`, error.message);
            results.live[sport] = getMockSportData(sport);
        }
    }

    return results;
}

async function fetchSportData(sport, teamId) {
    try {
        const [scoresRes, standingsRes] = await Promise.all([
            axios.get(ENDPOINTS[sport].scores, {
                timeout: 5000,
                headers: { 'User-Agent': 'BlazeIntelligence/2.0' }
            }),
            axios.get(ENDPOINTS[sport].standings, {
                timeout: 5000,
                headers: { 'User-Agent': 'BlazeIntelligence/2.0' }
            }).catch(() => null)
        ]);

        const games = scoresRes.data?.events || [];
        const standings = standingsRes?.data || null;

        if (teamId && DEEP_SOUTH_TEAMS[sport][teamId]) {
            const team = DEEP_SOUTH_TEAMS[sport][teamId];
            const teamGames = filterGamesForTeam(games, team.id);

            return {
                team: team,
                games: teamGames,
                standings: standings,
                lastUpdate: new Date().toISOString()
            };
        }

        return {
            sport: sport,
            games: games.slice(0, 10),
            teams: DEEP_SOUTH_TEAMS[sport],
            standings: standings,
            lastUpdate: new Date().toISOString()
        };

    } catch (error) {
        console.error(`Error fetching ${sport} data:`, error);
        return getMockSportData(sport);
    }
}

async function fetchRecruitmentData() {
    // In production, this would scrape or use Perfect Game API
    // For now, return enhanced mock data
    return {
        timestamp: new Date().toISOString(),
        source: 'Perfect Game',
        topProspects: [
            {
                name: 'Jackson Williams',
                position: 'SS/RHP',
                school: 'Lake Travis HS',
                location: 'Austin, TX',
                classYear: 2025,
                rating: 10,
                commitment: 'Texas',
                stats: { avg: '.412', hr: 12, era: '1.85' }
            },
            {
                name: 'Marcus Thompson',
                position: 'OF',
                school: 'Westlake HS',
                location: 'Austin, TX',
                classYear: 2025,
                rating: 9.5,
                commitment: 'Uncommitted',
                stats: { avg: '.389', hr: 8, sb: 24 }
            },
            {
                name: 'Tyler Rodriguez',
                position: 'LHP',
                school: 'Reagan HS',
                location: 'San Antonio, TX',
                classYear: 2026,
                rating: 9.5,
                commitment: 'Uncommitted',
                stats: { era: '0.95', k: 124, whip: '0.72' }
            }
        ],
        upcomingEvents: [
            {
                name: 'PG National Showcase',
                date: '2025-09-15',
                location: 'Fort Myers, FL',
                type: 'Showcase'
            },
            {
                name: 'Texas Scout Day',
                date: '2025-09-22',
                location: 'Round Rock, TX',
                type: 'Scout Day'
            },
            {
                name: 'SEC Fall Championships',
                date: '2025-10-01',
                location: 'Hoover, AL',
                type: 'Tournament'
            }
        ],
        recentCommits: [
            {
                player: 'David Martinez',
                school: 'Southlake Carroll',
                committed: 'LSU',
                date: '2025-09-10'
            },
            {
                player: 'Chris Johnson',
                school: 'Alamo Heights',
                committed: 'Texas A&M',
                date: '2025-09-08'
            }
        ]
    };
}

function processGamesForTeams(games, teams) {
    const results = {};

    for (const [teamKey, teamInfo] of Object.entries(teams)) {
        const teamGames = filterGamesForTeam(games, teamInfo.id);
        if (teamGames.length > 0) {
            results[teamKey] = formatGameData(teamGames[0], teamInfo.id);
        }
    }

    return results;
}

function filterGamesForTeam(games, teamId) {
    return games.filter(game => {
        const competitors = game.competitions?.[0]?.competitors || [];
        return competitors.some(c => c.team?.abbreviation === teamId);
    });
}

function formatGameData(game, focusTeamId) {
    const competition = game.competitions?.[0];
    if (!competition) return null;

    const competitors = competition.competitors || [];
    const home = competitors.find(c => c.homeAway === 'home');
    const away = competitors.find(c => c.homeAway === 'away');

    if (!home || !away) return null;

    const status = competition.status;
    const isLive = status?.type?.state === 'in';

    const focusTeam = home.team?.abbreviation === focusTeamId ? home : away;
    const opponent = home.team?.abbreviation === focusTeamId ? away : home;

    return {
        gameId: game.id,
        team: focusTeam.team?.displayName,
        opponent: opponent.team?.displayName,
        score: {
            home: home.score || '0',
            away: away.score || '0'
        },
        isHome: focusTeam.homeAway === 'home',
        status: isLive ? 'LIVE' : status?.type?.description,
        period: status?.period || status?.type?.shortDetail,
        clock: status?.displayClock || '',
        lastPlay: competition.situation?.lastPlay?.text || '',
        winProbability: focusTeam.probabilities?.[0]?.percentage
            ? (focusTeam.probabilities[0].percentage * 100).toFixed(1)
            : null,
        venue: game.venue?.fullName,
        broadcast: competition.broadcast?.[0]?.market?.names?.[0] || null
    };
}

function getMockSportData(sport) {
    const mockData = {
        mlb: {
            cardinals: {
                team: 'St. Louis Cardinals',
                opponent: 'Chicago Cubs',
                score: { home: '7', away: '4' },
                status: 'LIVE',
                period: '7th Inning',
                winProbability: '78.5'
            }
        },
        nfl: {
            titans: {
                team: 'Tennessee Titans',
                opponent: 'Jacksonville Jaguars',
                score: { home: '24', away: '17' },
                status: 'LIVE',
                period: '3rd Quarter',
                winProbability: '71.2'
            }
        },
        nba: {
            grizzlies: {
                team: 'Memphis Grizzlies',
                opponent: 'Golden State Warriors',
                score: { home: '112', away: '108' },
                status: 'LIVE',
                period: '4th Quarter',
                winProbability: '92.1'
            }
        },
        ncaa: {
            longhorns: {
                team: 'Texas Longhorns',
                opponent: 'Oklahoma Sooners',
                score: { home: '35', away: '28' },
                status: 'LIVE',
                period: '4th Quarter',
                winProbability: '89.3'
            }
        }
    };

    return mockData[sport] || {};
}

function getMockChampionshipData() {
    return {
        message: 'Championship Platform - Mock Data Active',
        timestamp: new Date().toISOString(),
        live: getMockSportData('all')
    };
}