/**
 * SportsDataIO Proxy Function
 * Securely proxies API requests without exposing keys to the client
 * October 15, 2025
 */

export async function handler(event, context) {
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

        // Make the request to SportsDataIO
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
                'Accept': 'application/json'
            }
        });

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