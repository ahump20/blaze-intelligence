/**
 * NETLIFY SERVERLESS FUNCTION - SPORTSDATAIO PROXY
 * Secure API proxy to protect API keys
 *
 * Handles all SportsDataIO API requests from the frontend
 */

exports.handler = async (event, context) => {
    // CORS headers
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

    // Get API key from environment variable
    const API_KEY = process.env.SPORTSDATAIO_API_KEY || 'YOUR_API_KEY_HERE';

    try {
        // Parse request
        const { league, endpoint, params } = JSON.parse(event.body || '{}');

        if (!league || !endpoint) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required parameters: league and endpoint'
                })
            };
        }

        // Construct API URL
        const baseUrls = {
            nfl: 'https://api.sportsdata.io/v3/nfl',
            mlb: 'https://api.sportsdata.io/v3/mlb',
            nba: 'https://api.sportsdata.io/v3/nba',
            ncaaf: 'https://api.sportsdata.io/v3/cfb',
            ncaab: 'https://api.sportsdata.io/v3/cbb'
        };

        const baseUrl = baseUrls[league];
        if (!baseUrl) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: `Invalid league: ${league}`
                })
            };
        }

        // Build full URL with endpoint and API key
        const url = `${baseUrl}/${endpoint}?key=${API_KEY}`;

        // Make API request
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Return successful response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: data,
                timestamp: new Date().toISOString(),
                cached: false
            })
        };

    } catch (error) {
        console.error('SportsDataIO Proxy Error:', error);

        // Return fallback data for demo purposes
        const fallbackData = getFallbackData(event.body ? JSON.parse(event.body).endpoint : '');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message,
                data: fallbackData,
                timestamp: new Date().toISOString(),
                cached: true,
                fallback: true
            })
        };
    }
};

// Fallback data for demonstration
function getFallbackData(endpoint) {
    const fallbacks = {
        'scores/json/ScoresByWeek': [
            {
                GameKey: '202501151',
                Date: '2025-01-15T20:00:00',
                AwayTeam: 'HOU',
                HomeTeam: 'TEN',
                AwayScore: 24,
                HomeScore: 21,
                Quarter: 'F',
                TimeRemaining: '00:00',
                Stadium: 'Nissan Stadium'
            },
            {
                GameKey: '202501152',
                Date: '2025-01-15T20:00:00',
                AwayTeam: 'DAL',
                HomeTeam: 'NO',
                AwayScore: 31,
                HomeScore: 28,
                Quarter: '4',
                TimeRemaining: '02:34',
                Stadium: 'Caesars Superdome'
            }
        ],
        'scores/json/Standings': [
            {
                Team: 'HOU',
                Name: 'Houston Texans',
                Wins: 11,
                Losses: 5,
                Percentage: 0.688,
                ConferenceWins: 8,
                ConferenceLosses: 3,
                DivisionWins: 4,
                DivisionLosses: 1
            },
            {
                Team: 'TEN',
                Name: 'Tennessee Titans',
                Wins: 9,
                Losses: 7,
                Percentage: 0.563,
                ConferenceWins: 6,
                ConferenceLosses: 5,
                DivisionWins: 3,
                DivisionLosses: 2
            }
        ],
        'projections/json/PlayerSeasonProjectionStats': [
            {
                PlayerID: 25725,
                Name: 'Jose Altuve',
                Team: 'HOU',
                Position: '2B',
                BattingAverage: 0.298,
                HomeRuns: 28,
                RunsBattedIn: 92,
                StolenBases: 18,
                OnBasePercentage: 0.362,
                SluggingPercentage: 0.487,
                WAR: 4.8
            },
            {
                PlayerID: 24853,
                Name: 'Alex Bregman',
                Team: 'HOU',
                Position: '3B',
                BattingAverage: 0.274,
                HomeRuns: 25,
                RunsBattedIn: 85,
                StolenBases: 3,
                OnBasePercentage: 0.354,
                SluggingPercentage: 0.456,
                WAR: 3.9
            }
        ],
        'default': {
            message: 'Demo data - Connect SportsDataIO API key for live data',
            timestamp: new Date().toISOString()
        }
    };

    // Find matching fallback or return default
    for (const key in fallbacks) {
        if (endpoint && endpoint.includes(key)) {
            return fallbacks[key];
        }
    }

    return fallbacks.default;
}