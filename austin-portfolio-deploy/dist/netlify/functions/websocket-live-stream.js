const WebSocket = require('ws');

// WebSocket handler for real-time sports data streaming
exports.handler = async (event, context) => {
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
        const { action, sport, team } = event.queryStringParameters || {};

        if (action === 'subscribe') {
            // Return WebSocket connection details
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    websocket: {
                        url: 'wss://blaze-intelligence.netlify.app/.netlify/functions/websocket-live-stream',
                        protocol: 'blaze-live-v1',
                        reconnectInterval: 5000
                    },
                    subscription: {
                        sport,
                        team,
                        channels: getChannels(sport, team)
                    }
                })
            };
        }

        // Return live stream data
        const liveData = await getLiveStreamData(sport, team);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                stream: 'live',
                data: liveData
            })
        };

    } catch (error) {
        console.error('WebSocket handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Stream connection failed' })
        };
    }
};

function getChannels(sport, team) {
    const channels = ['scores', 'stats', 'plays'];

    if (sport === 'mlb') {
        channels.push('pitches', 'at-bats', 'innings');
    } else if (sport === 'nfl') {
        channels.push('drives', 'downs', 'timeouts');
    } else if (sport === 'nba') {
        channels.push('quarters', 'fouls', 'shots');
    } else if (sport === 'ncaa') {
        channels.push('rankings', 'conferences', 'bowls');
    }

    return channels;
}

async function getLiveStreamData(sport, team) {
    // Simulate real-time data stream
    const baseData = {
        gameTime: new Date().toISOString(),
        updateFrequency: 100, // milliseconds
        quality: 'ultra-hd',
        latency: Math.floor(Math.random() * 50) + 30
    };

    // Sport-specific live data
    const sportData = {
        mlb: {
            cardinals: {
                currentBatter: 'Paul Goldschmidt',
                count: { balls: 2, strikes: 1 },
                runners: { first: true, second: false, third: true },
                pitch: {
                    type: 'Fastball',
                    velocity: 94.3,
                    location: { x: 0.3, y: 2.1 },
                    result: 'Ball'
                },
                leverageIndex: 2.4,
                winExpectancy: 0.785,
                runExpectancy: 1.43
            }
        },
        nfl: {
            titans: {
                currentDrive: {
                    plays: 6,
                    yards: 48,
                    time: '2:31',
                    startField: 'TEN 25'
                },
                situation: {
                    down: 2,
                    distance: 7,
                    fieldPosition: 'JAX 42',
                    playCall: 'Pass'
                },
                personnel: {
                    offense: '11',
                    defense: 'Nickel'
                },
                successRate: 0.67,
                epa: 0.18
            }
        },
        nba: {
            grizzlies: {
                currentPossession: {
                    player: 'Ja Morant',
                    shotClock: 14,
                    playType: 'Pick and Roll'
                },
                lastShot: {
                    player: 'Jaren Jackson Jr.',
                    type: 'Three Pointer',
                    distance: 26,
                    result: 'Made',
                    assistedBy: 'Ja Morant'
                },
                pace: 102.3,
                offensiveRating: 118.5,
                defensiveRating: 110.1
            }
        },
        ncaa: {
            longhorns: {
                currentDrive: {
                    plays: 8,
                    yards: 75,
                    time: '3:45'
                },
                quarterback: {
                    name: 'Quinn Ewers',
                    completions: 28,
                    attempts: 35,
                    yards: 389,
                    touchdowns: 4,
                    qbr: 158.7
                },
                teamStats: {
                    totalYards: 512,
                    thirdDownEff: '8/12',
                    timeOfPossession: '32:18'
                },
                sp_plus: 24.7,
                fpi: 18.3
            }
        }
    };

    const data = sportData[sport]?.[team] || {};

    return {
        ...baseData,
        sport,
        team,
        live: data,
        momentum: calculateMomentum(data),
        predictions: generatePredictions(sport, team, data)
    };
}

function calculateMomentum(data) {
    // Calculate momentum score based on recent events
    let momentum = 0;

    if (data.winExpectancy) momentum += (data.winExpectancy - 0.5) * 20;
    if (data.successRate) momentum += (data.successRate - 0.5) * 15;
    if (data.epa) momentum += data.epa * 10;
    if (data.offensiveRating && data.defensiveRating) {
        momentum += (data.offensiveRating - data.defensiveRating) * 0.5;
    }

    return {
        score: momentum.toFixed(2),
        trend: momentum > 0 ? 'positive' : 'negative',
        strength: Math.abs(momentum) > 10 ? 'strong' : 'moderate'
    };
}

function generatePredictions(sport, team, data) {
    const predictions = {
        nextScore: {
            team: team,
            probability: 0.5 + (Math.random() * 0.3),
            expectedTime: '3:45',
            confidence: 'high'
        },
        finalScore: {
            projection: generateScoreProjection(sport),
            confidence: 0.82,
            variance: 7.5
        },
        keyFactors: [
            'Current momentum strongly favors ' + team,
            'Historical performance in similar situations: 73% success',
            'Fatigue factor minimal based on rotation patterns'
        ]
    };

    return predictions;
}

function generateScoreProjection(sport) {
    const projections = {
        mlb: { home: 8, away: 5 },
        nfl: { home: 31, away: 24 },
        nba: { home: 118, away: 112 },
        ncaa: { home: 42, away: 35 }
    };

    return projections[sport] || { home: 0, away: 0 };
}