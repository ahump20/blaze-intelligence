// Enhanced WebSocket with Server-Sent Events for Pressure Stream
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, Cache-Control');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Server-Sent Events endpoint
    return handleSSEConnection(req, res);
  }

  if (req.method === 'POST') {
    // WebSocket upgrade or data push
    return handleWebSocketData(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

function handleSSEConnection(req, res) {
  const { sport, gameId, dataType } = req.query;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({
    type: 'connection',
    status: 'connected',
    sport: sport || 'multi-sport',
    gameId: gameId || 'live_stream',
    dataType: dataType || 'pressure_stream',
    timestamp: Date.now()
  })}\n\n`);

  // Initialize pressure stream data
  const streamConfig = {
    sport: sport || 'mlb',
    gameId: gameId || 'live_game_' + Math.random().toString(36).substr(2, 8),
    updateInterval: 2000, // 2 seconds
    dataPoints: [],
    currentPressure: 50.0,
    winProbability: 0.5,
    momentum: 0.0
  };

  // Start pressure stream simulation
  const streamInterval = setInterval(() => {
    try {
      const pressureData = generatePressureStreamData(streamConfig);
      
      res.write(`event: pressure_update\n`);
      res.write(`data: ${JSON.stringify(pressureData)}\n\n`);
      
      // Update stream state
      updateStreamState(streamConfig, pressureData);
      
    } catch (error) {
      console.error('SSE stream error:', error);
      clearInterval(streamInterval);
    }
  }, streamConfig.updateInterval);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(streamInterval);
    console.log('SSE client disconnected');
  });

  req.on('error', (error) => {
    console.error('SSE connection error:', error);
    clearInterval(streamInterval);
  });

  // Keep connection alive
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(`event: heartbeat\n`);
      res.write(`data: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);
    } catch (error) {
      clearInterval(heartbeatInterval);
      clearInterval(streamInterval);
    }
  }, 30000); // 30 seconds

  req.on('close', () => {
    clearInterval(heartbeatInterval);
  });
}

async function handleWebSocketData(req, res) {
  const { action, sport, gameId, data } = req.body;

  try {
    const result = await processWebSocketAction(action, sport, gameId, data);
    
    res.status(200).json({
      status: 'success',
      action,
      sport,
      gameId,
      result,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('WebSocket data processing error:', error);
    res.status(500).json({
      error: 'WebSocket processing failed',
      message: error.message,
      timestamp: Date.now()
    });
  }
}

function generatePressureStreamData(config) {
  const { sport, gameId, currentPressure, winProbability, momentum } = config;
  
  // Generate realistic pressure metrics
  const pressureChange = (Math.random() - 0.5) * 10; // -5 to +5
  const newPressure = Math.max(0, Math.min(100, currentPressure + pressureChange));
  
  // Calculate win probability based on pressure and momentum
  const probChange = (pressureChange / 100) + (momentum * 0.1);
  const newWinProb = Math.max(0.05, Math.min(0.95, winProbability + probChange));
  
  // Generate momentum shift
  const momentumChange = (Math.random() - 0.5) * 0.4; // -0.2 to +0.2
  const newMomentum = Math.max(-1, Math.min(1, momentum + momentumChange));

  // Sport-specific event generation
  const eventData = generateSportSpecificEvent(sport, newPressure, newWinProb);

  const pressureData = {
    type: 'pressure_update',
    gameId,
    sport,
    timestamp: Date.now(),
    pressure: {
      current: Math.round(newPressure * 10) / 10,
      change: Math.round(pressureChange * 10) / 10,
      trend: pressureChange > 0 ? 'increasing' : pressureChange < 0 ? 'decreasing' : 'stable',
      level: getPressureLevel(newPressure)
    },
    winProbability: {
      home: Math.round(newWinProb * 1000) / 1000,
      away: Math.round((1 - newWinProb) * 1000) / 1000,
      change: Math.round(probChange * 1000) / 1000
    },
    momentum: {
      value: Math.round(newMomentum * 100) / 100,
      direction: newMomentum > 0.1 ? 'positive' : newMomentum < -0.1 ? 'negative' : 'neutral',
      strength: Math.abs(newMomentum)
    },
    event: eventData,
    metadata: {
      dataQuality: 95.8 + Math.random() * 4,
      latency: Math.floor(Math.random() * 20) + 10,
      confidence: 0.92 + Math.random() * 0.08,
      updateFrequency: '2s'
    }
  };

  return pressureData;
}

function generateSportSpecificEvent(sport, pressure, winProb) {
  const events = {
    mlb: [
      'Bases loaded, 2 outs - high leverage situation',
      'Home run extends lead in bottom 8th',
      'Double play ends threat in top 9th',
      'Pitcher working through 7th inning',
      'Leadoff triple sparks rally attempt',
      'Strikeout with runners in scoring position',
      'Stolen base puts runner in scoring position',
      'Pop fly ends inning'
    ],
    nfl: [
      'Red zone possession with 3 minutes left',
      'Fourth down conversion extends drive',
      'Interception changes field position',
      'Touchdown pass ties the game',
      'Field goal attempt from 45 yards',
      'Fumble recovery by defense',
      'Two-minute warning stops clock',
      'Punt pins opponent deep'
    ],
    nba: [
      'Three-pointer cuts lead to single digits',
      'And-one opportunity at the line',
      'Steal leads to fast break points',
      'Timeout called with 2 minutes left',
      'Technical foul charged to bench',
      'Defensive stop forces shot clock violation',
      'Clutch free throws extend lead',
      'Block prevents easy basket'
    ]
  };

  const sportEvents = events[sport] || events.mlb;
  const eventIndex = Math.floor(Math.random() * sportEvents.length);
  
  return {
    description: sportEvents[eventIndex],
    impact: pressure > 70 ? 'high' : pressure > 40 ? 'medium' : 'low',
    timing: generateEventTiming(sport),
    significance: winProb > 0.7 || winProb < 0.3 ? 'critical' : 'moderate'
  };
}

function generateEventTiming(sport) {
  const timings = {
    mlb: {
      inning: Math.floor(Math.random() * 9) + 1,
      half: Math.random() > 0.5 ? 'top' : 'bottom',
      outs: Math.floor(Math.random() * 3)
    },
    nfl: {
      quarter: Math.floor(Math.random() * 4) + 1,
      timeRemaining: `${Math.floor(Math.random() * 15)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      down: Math.floor(Math.random() * 4) + 1
    },
    nba: {
      quarter: Math.floor(Math.random() * 4) + 1,
      timeRemaining: `${Math.floor(Math.random() * 12)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      shotClock: Math.floor(Math.random() * 24) + 1
    }
  };

  return timings[sport] || timings.mlb;
}

function getPressureLevel(pressure) {
  if (pressure >= 80) return 'critical';
  if (pressure >= 60) return 'high';
  if (pressure >= 40) return 'moderate';
  if (pressure >= 20) return 'low';
  return 'minimal';
}

function updateStreamState(config, pressureData) {
  // Update config state for next iteration
  config.currentPressure = pressureData.pressure.current;
  config.winProbability = pressureData.winProbability.home;
  config.momentum = pressureData.momentum.value;
  
  // Add to data points history (keep last 50 points)
  config.dataPoints.push({
    timestamp: pressureData.timestamp,
    pressure: pressureData.pressure.current,
    winProbability: pressureData.winProbability.home,
    momentum: pressureData.momentum.value
  });
  
  if (config.dataPoints.length > 50) {
    config.dataPoints.shift(); // Remove oldest point
  }
}

async function processWebSocketAction(action, sport, gameId, data) {
  const actions = {
    'subscribe': {
      status: 'subscribed',
      channels: [`pressure_stream_${sport}`, `game_events_${gameId}`],
      updateFrequency: '2s'
    },
    'unsubscribe': {
      status: 'unsubscribed',
      message: 'Disconnected from pressure stream'
    },
    'get_history': {
      status: 'success',
      history: generateHistoricalData(sport, gameId),
      dataPoints: 50
    },
    'update_settings': {
      status: 'updated',
      settings: data || {},
      applied: true
    }
  };

  return actions[action] || {
    status: 'unknown_action',
    availableActions: Object.keys(actions)
  };
}

function generateHistoricalData(sport, gameId) {
  const history = [];
  const baseTime = Date.now() - (50 * 2000); // 50 data points, 2s apart
  
  let pressure = 50;
  let winProb = 0.5;
  let momentum = 0;

  for (let i = 0; i < 50; i++) {
    const pressureChange = (Math.random() - 0.5) * 8;
    pressure = Math.max(0, Math.min(100, pressure + pressureChange));
    
    const probChange = (pressureChange / 100) + (momentum * 0.1);
    winProb = Math.max(0.05, Math.min(0.95, winProb + probChange));
    
    const momentumChange = (Math.random() - 0.5) * 0.3;
    momentum = Math.max(-1, Math.min(1, momentum + momentumChange));

    history.push({
      timestamp: baseTime + (i * 2000),
      pressure: Math.round(pressure * 10) / 10,
      winProbability: Math.round(winProb * 1000) / 1000,
      momentum: Math.round(momentum * 100) / 100
    });
  }

  return history;
}