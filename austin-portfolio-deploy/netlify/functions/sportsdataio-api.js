/**
 * SportsDataIO API Serverless Function
 * Secure proxy for SportsDataIO API calls with championship-level caching
 */

const https = require('https');

// API Configuration - IMPORTANT: Set this in Netlify environment variables
const SPORTSDATAIO_API_KEY = process.env.SPORTSDATAIO_API_KEY || 'YOUR_API_KEY_HERE';
const BASE_URL = 'api.sportsdata.io';

// Cache for reducing API calls
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds for live data

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Parse request
        const { sport, endpoint, params } = JSON.parse(event.body || '{}');

        if (!sport || !endpoint) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required parameters: sport and endpoint'
                })
            };
        }

        // Build cache key
        const cacheKey = `${sport}:${endpoint}:${JSON.stringify(params || {})}`;

        // Check cache
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('Cache hit:', cacheKey);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    ...cached.data,
                    cached: true,
                    latency: Date.now() - cached.timestamp
                })
            };
        }

        // Build API path
        let apiPath = `/v3/${sport}/${endpoint}`;

        // Replace parameters in path
        if (params) {
            Object.keys(params).forEach(key => {
                apiPath = apiPath.replace(`{${key}}`, params[key]);
            });
        }

        // Add API key
        apiPath += `?key=${SPORTSDATAIO_API_KEY}`;

        console.log('API Request:', apiPath);

        // Make API request
        const startTime = Date.now();
        const data = await makeRequest(apiPath);

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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                ...data,
                cached: false,
                latency: Date.now() - startTime
            })
        };

    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'API request failed',
                message: error.message
            })
        };
    }
};

// Helper function to make HTTPS request
function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            path: path,
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

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}