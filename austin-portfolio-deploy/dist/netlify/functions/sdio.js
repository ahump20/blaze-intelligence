/**
 * SportsDataIO Proxy Function
 * Securely proxies API requests without exposing keys to the client
 * October 15, 2025 Refresh - Added timeout wrapper and health check
 */

// Timeout utility
const withTimeout = (promise, ms = 20000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    )
  ]);

export async function handler(event, context) {
    // Handle health check endpoint
    if (event.path === '/.netlify/functions/sdio/health') {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                ok: true,
                service: 'sportsdataio-proxy',
                timestamp: new Date().toISOString(),
                env: process.env.BLAZE_ENV || 'production',
                cacheMaxAge: 30,
                timeout: 20000,
                version: '1.0.0'
            })
        };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Extract the path from query parameters
        const { path } = event.queryStringParameters || {};

        if (!path) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing path parameter' })
            };
        }

        // Validate the path (only allow SportsDataIO API paths)
        const validPathPattern = /^\/v3\/(nfl|mlb|nba|ncaa-fb|ncaa-bb)\//;
        if (!validPathPattern.test(path)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid path. Must be a valid SportsDataIO endpoint.' })
            };
        }

        // Get API key from environment
        const apiKey = process.env.SPORTSDATAIO_API_KEY || '6ca2adb39404482da5406f0a6cd7aa37';

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API key not configured' })
            };
        }

        // Build the full URL
        const baseUrl = 'https://api.sportsdata.io';
        const fullUrl = `${baseUrl}${path}`;

        console.log(`Proxying request to: ${fullUrl}`);

        // Make the request to SportsDataIO with timeout protection
        const response = await withTimeout(
            fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Ocp-Apim-Subscription-Key': apiKey,
                    'Accept': 'application/json'
                }
            }),
            20000 // 20 second timeout
        );

        // Get the response data
        const data = await response.text();

        // Return the proxied response
        return {
            statusCode: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: data
        };

    } catch (error) {
        console.error('Proxy error:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to fetch data',
                message: error.message
            })
        };
    }
}

// Alternative handler using undici (if available)
export async function handlerWithUndici(event, context) {
    // Dynamic import for environments that support it
    let request;
    try {
        const undici = await import('undici');
        request = undici.request;
    } catch {
        // Fall back to fetch
        return handler(event, context);
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { path } = event.queryStringParameters || {};

        if (!path || !/^\/v3\/(nfl|mlb|nba|ncaa-fb|ncaa-bb)\//.test(path)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid path' })
            };
        }

        const apiKey = process.env.SPORTSDATAIO_API_KEY || '6ca2adb39404482da5406f0a6cd7aa37';

        const { statusCode, headers, body } = await request(`https://api.sportsdata.io${path}`, {
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey
            }
        });

        let data = '';
        for await (const chunk of body) {
            data += chunk;
        }

        return {
            statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=30',
                'Access-Control-Allow-Origin': '*'
            },
            body: data
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Proxy failed', message: error.message })
        };
    }
}