/**
 * Blaze Intelligence - SportsDataIO Integration for Replit
 * Championship-level sports data pipeline with real-time updates
 *
 * @author Austin Humphrey
 * @version 2.0.0
 * @license MIT
 */

const express = require('express');
const cors = require('cors');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// SportsDataIO Configuration
const SPORTSDATAIO_API_KEY = process.env.SPORTSDATAIO_API_KEY || '6ca2adb39404482da5406f0a6cd7aa37';
const BASE_URL = 'api.sportsdata.io';

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Performance metrics
const metrics = {
    totalRequests: 0,
    cacheHits: 0,
    apiErrors: 0,
    avgLatency: 0,
    startTime: Date.now()
};

/**
 * Make API request to SportsDataIO
 */
function makeAPIRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            path: path + (path.includes('?') ? '&' : '?') + `key=${SPORTSDATAIO_API_KEY}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode === 200) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`API returned ${res.statusCode}: ${data}`));
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

/**
 * Generic API endpoint handler
 */
app.post('/api/sportsdataio', async (req, res) => {
    try {
        const { sport, endpoint, params } = req.body;

        if (!sport || !endpoint) {
            return res.status(400).json({
                error: 'Missing required parameters: sport and endpoint'
            });
        }

        // Build cache key
        const cacheKey = `${sport}:${endpoint}:${JSON.stringify(params || {})}`;

        // Check cache
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            metrics.cacheHits++;
            console.log('Cache hit:', cacheKey);
            return res.json({
                ...cached.data,
                cached: true,
                latency: Date.now() - cached.timestamp
            });
        }

        // Build API path
        let apiPath = `/v3/${sport}/${endpoint}`;

        // Replace parameters in path
        if (params) {
            Object.keys(params).forEach(key => {
                apiPath = apiPath.replace(`{${key}}`, params[key]);
            });
        }

        console.log('API Request:', apiPath);

        // Make request
        const startTime = Date.now();
        const data = await makeAPIRequest(apiPath);
        const latency = Date.now() - startTime;

        // Update metrics
        metrics.totalRequests++;
        metrics.avgLatency = Math.round((metrics.avgLatency * (metrics.totalRequests - 1) + latency) / metrics.totalRequests);

        // Cache the result
        cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        // Clean cache if too large
        if (cache.size > 100) {
            const oldestKey = cache.keys().next().value;
            cache.delete(oldestKey);
        }

        res.json({
            ...data,
            cached: false,
            latency
        });

    } catch (error) {
        metrics.apiErrors++;
        console.error('API Error:', error);
        res.status(500).json({
            error: 'API request failed',
            message: error.message
        });
    }
});

// NFL endpoints
app.get('/api/nfl/live', async (req, res) => {
    try {
        const data = await makeAPIRequest('/v3/nfl/scores/json/ScoresByWeek/2025/1');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/nfl/teams', async (req, res) => {
    try {
        const data = await makeAPIRequest('/v3/nfl/scores/json/Teams');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MLB endpoints
app.get('/api/mlb/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const data = await makeAPIRequest(`/v3/mlb/scores/json/GamesByDate/${today}`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/mlb/cardinals', async (req, res) => {
    try {
        const data = await makeAPIRequest('/v3/mlb/scores/json/TeamSchedule/STL/2025');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// NCAA Football endpoints
app.get('/api/ncaa/football/live', async (req, res) => {
    try {
        const data = await makeAPIRequest('/v3/cfb/scores/json/GamesByWeek/2025/3');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/ncaa/football/texas', async (req, res) => {
    try {
        const data = await makeAPIRequest('/v3/cfb/scores/json/TeamSchedule/TEX/2025');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Championship Dashboard endpoint
app.get('/api/championship-dashboard', async (req, res) => {
    try {
        const [nfl, mlb, ncaa] = await Promise.all([
            makeAPIRequest('/v3/nfl/scores/json/ScoresByWeek/2025/1').catch(() => []),
            makeAPIRequest(`/v3/mlb/scores/json/GamesByDate/${new Date().toISOString().split('T')[0]}`).catch(() => []),
            makeAPIRequest('/v3/cfb/scores/json/GamesByWeek/2025/3').catch(() => [])
        ]);

        res.json({
            nfl: Array.isArray(nfl) ? nfl.slice(0, 5) : [],
            mlb: Array.isArray(mlb) ? mlb.slice(0, 5) : [],
            ncaa: Array.isArray(ncaa) ? ncaa.slice(0, 5) : [],
            metrics: {
                ...metrics,
                uptime: Math.floor((Date.now() - metrics.startTime) / 1000),
                cacheSize: cache.size
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        metrics: {
            ...metrics,
            uptime: Math.floor((Date.now() - metrics.startTime) / 1000),
            cacheSize: cache.size
        }
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'replit-sportsdataio-deployment.html'));
});

// WebSocket support for real-time updates (if needed)
const server = app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║   Blaze Intelligence - SportsDataIO Championship Server   ║
║                                                            ║
║   Server running at: http://localhost:${PORT}              ║
║                                                            ║
║   Endpoints:                                               ║
║   • POST /api/sportsdataio     - Generic API proxy        ║
║   • GET  /api/nfl/live         - NFL live scores          ║
║   • GET  /api/mlb/today        - MLB today's games        ║
║   • GET  /api/mlb/cardinals    - Cardinals schedule       ║
║   • GET  /api/ncaa/football/live - NCAA live scores       ║
║   • GET  /api/championship-dashboard - All sports         ║
║   • GET  /api/health           - Server health status     ║
║                                                            ║
║   API Key: ${SPORTSDATAIO_API_KEY.substring(0, 10)}...    ║
║   Cache Duration: 30 seconds                              ║
║                                                            ║
╚══════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;