// MCP Proxy Function - Robust JSON-RPC handling
exports.handler = async (event) => {
  const headers = { 'content-type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: 'method_not_allowed',
        tip: 'POST a JSON-RPC 2.0 payload'
      })
    };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'invalid_json',
        detail: e.message
      })
    };
  }

  if (payload.jsonrpc !== '2.0' || !payload.method) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'bad_request',
        tip: 'Expected { "jsonrpc":"2.0", "id":"...", "method":"...", "params":{...} }'
      })
    };
  }

  // Route methods to appropriate handlers
  const methods = {
    'ping': () => ({ ok: true, timestamp: new Date().toISOString() }),
    'getChampionshipDashboard': () => ({
      cardinals: { readiness: 0.87, leverage: 0.92, championship_probability: 0.76 },
      titans: { readiness: 0.82, leverage: 0.88, championship_probability: 0.71 },
      longhorns: { readiness: 0.91, leverage: 0.89, championship_probability: 0.84 },
      grizzlies: { readiness: 0.79, leverage: 0.85, championship_probability: 0.68 }
    }),
    'getTeamPerformance': () => ({
      offensive_rating: 0.82,
      defensive_rating: 0.78,
      clutch_factor: 0.89,
      momentum: 0.73
    }),
    'getLiveScores': () => ({
      games: [
        { home: 'Cardinals', away: 'Cubs', score: '5-3', inning: '7th', status: 'In Progress' },
        { home: 'Titans', away: 'Jaguars', score: '24-17', quarter: '3rd', time: '8:42', status: 'In Progress' }
      ]
    }),
    'getPlayerStats': () => ({
      batting_avg: .289,
      ops: .842,
      war: 3.2,
      clutch_rating: 0.87
    }),
    'getNILValuation': () => ({
      base_value: 125000,
      social_multiplier: 1.8,
      performance_bonus: 45000,
      total: 270000
    })
  };

  const handler = methods[payload.method] || (() => ({ ok: true, method: payload.method }));
  const result = handler(payload.params);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: payload.id ?? null,
      result
    })
  };
};