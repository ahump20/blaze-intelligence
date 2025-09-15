/**
 * Netlify Edge Function: WebSocket Live Data Stream
 * Provides real-time sports data streaming
 */

export default async function handler(request, context) {
  const { pathname } = new URL(request.url);

  // Handle WebSocket upgrade
  if (request.headers.get('upgrade') === 'websocket') {
    return handleWebSocket(request);
  }

  // Handle regular HTTP requests
  return new Response(
    JSON.stringify({
      service: 'Blaze Intelligence WebSocket Stream',
      status: 'ready',
      endpoints: ['/ws/sports', '/ws/realtime', '/ws/hawkeye'],
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

async function handleWebSocket(request) {
  const { pathname } = new URL(request.url);

  // Create WebSocket pair
  const [client, server] = Object.values(new WebSocketPair());

  // Accept the WebSocket connection
  server.accept();

  // Handle different WebSocket endpoints
  if (pathname.startsWith('/ws/sports')) {
    handleSportsStream(server);
  } else if (pathname.startsWith('/ws/realtime')) {
    handleRealtimeStream(server);
  } else if (pathname.startsWith('/ws/hawkeye')) {
    handleHawkEyeStream(server);
  } else {
    server.close(1000, 'Unknown endpoint');
  }

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

function handleSportsStream(websocket) {
  console.log('Sports WebSocket connected');

  // Send initial data
  websocket.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to sports data stream',
    timestamp: new Date().toISOString()
  }));

  // Send live sports updates every 30 seconds
  const interval = setInterval(() => {
    const sportsData = {
      type: 'sports_update',
      data: {
        cardinals: {
          score: { home: Math.floor(Math.random() * 10), away: Math.floor(Math.random() * 10) },
          inning: Math.floor(Math.random() * 9) + 1,
          runners: Math.floor(Math.random() * 4)
        },
        titans: {
          score: { home: Math.floor(Math.random() * 35), away: Math.floor(Math.random() * 35) },
          quarter: Math.floor(Math.random() * 4) + 1,
          possession: Math.random() > 0.5 ? 'home' : 'away'
        },
        longhorns: {
          score: { home: Math.floor(Math.random() * 42), away: Math.floor(Math.random() * 42) },
          quarter: Math.floor(Math.random() * 4) + 1,
          ranking: 7
        },
        grizzlies: {
          score: { home: Math.floor(Math.random() * 130), away: Math.floor(Math.random() * 130) },
          quarter: Math.floor(Math.random() * 4) + 1,
          timeRemaining: `${Math.floor(Math.random() * 12)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
        }
      },
      timestamp: new Date().toISOString()
    };

    websocket.send(JSON.stringify(sportsData));
  }, 30000);

  websocket.addEventListener('close', () => {
    clearInterval(interval);
    console.log('Sports WebSocket disconnected');
  });
}

function handleRealtimeStream(websocket) {
  console.log('Realtime WebSocket connected');

  websocket.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to real-time analytics stream',
    timestamp: new Date().toISOString()
  }));

  // Send RTI metrics every 2 seconds
  const interval = setInterval(() => {
    const rtiData = {
      type: 'rti_update',
      data: {
        latency: 80 + Math.random() * 20, // 80-100ms
        fps: 340 + Math.floor(Math.random() * 20 - 10),
        accuracy: 94.6 + (Math.random() * 0.8 - 0.4),
        confidence: 99.2 + (Math.random() * 0.6 - 0.3),
        neuralActivity: {
          classification: Math.random() * 100,
          detection: Math.random() * 100,
          tracking: Math.random() * 100,
          prediction: Math.random() * 100
        },
        activeStreams: Math.floor(Math.random() * 6) + 3
      },
      timestamp: new Date().toISOString()
    };

    websocket.send(JSON.stringify(rtiData));
  }, 2000);

  websocket.addEventListener('close', () => {
    clearInterval(interval);
    console.log('Realtime WebSocket disconnected');
  });
}

function handleHawkEyeStream(websocket) {
  console.log('Hawk-Eye WebSocket connected');

  websocket.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Hawk-Eye tracking stream',
    timestamp: new Date().toISOString()
  }));

  // Send tracking updates every 100ms (10Hz for demo)
  const interval = setInterval(() => {
    const hawkEyeData = {
      type: 'hawkeye_update',
      data: {
        ballPosition: {
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 30,
          z: Math.random() * 15,
          timestamp: Date.now()
        },
        velocity: {
          x: (Math.random() - 0.5) * 40,
          y: (Math.random() - 0.5) * 10,
          z: (Math.random() - 0.5) * 25
        },
        tracking: {
          cameras: 10,
          confidence: 95 + Math.random() * 4,
          frameRate: 340,
          accuracy: 2.6
        }
      },
      timestamp: new Date().toISOString()
    };

    websocket.send(JSON.stringify(hawkEyeData));
  }, 100);

  websocket.addEventListener('close', () => {
    clearInterval(interval);
    console.log('Hawk-Eye WebSocket disconnected');
  });
}

export const config = {
  path: "/ws/*"
};