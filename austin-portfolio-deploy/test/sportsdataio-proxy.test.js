/**
 * BLAZE INTELLIGENCE - SportsDataIO Proxy Test Suite
 * October 2025 Refresh
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handler } from '../netlify/functions/sdio.js';

describe('SportsDataIO Proxy Function', () => {
    let mockFetch;

    beforeEach(() => {
        // Mock fetch
        mockFetch = vi.fn();
        global.fetch = mockFetch;

        // Mock environment
        process.env.SPORTSDATAIO_API_KEY = 'test-api-key';
        process.env.BLAZE_ENV = 'test';
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Health Check Endpoint', () => {
        it('should return health status', async () => {
            const event = {
                path: '/.netlify/functions/sdio/health',
                httpMethod: 'GET'
            };

            const response = await handler(event, {});

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.ok).toBe(true);
            expect(body.service).toBe('sportsdataio-proxy');
            expect(body.env).toBe('test');
            expect(body.timeout).toBe(20000);
        });
    });

    describe('Request Validation', () => {
        it('should reject non-GET requests', async () => {
            const event = {
                httpMethod: 'POST',
                queryStringParameters: { path: '/v3/nfl/scores/json/Teams' }
            };

            const response = await handler(event, {});

            expect(response.statusCode).toBe(405);
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Method not allowed');
        });

        it('should reject missing path parameter', async () => {
            const event = {
                httpMethod: 'GET',
                queryStringParameters: {}
            };

            const response = await handler(event, {});

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Missing path parameter');
        });

        it('should reject invalid API paths', async () => {
            const event = {
                httpMethod: 'GET',
                queryStringParameters: { path: '/invalid/path' }
            };

            const response = await handler(event, {});

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.error).toContain('Invalid path');
        });
    });

    describe('API Proxying', () => {
        it('should proxy valid NFL requests', async () => {
            const mockData = { teams: [{ name: 'Titans' }] };
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                text: async () => JSON.stringify(mockData)
            });

            const event = {
                httpMethod: 'GET',
                queryStringParameters: { path: '/v3/nfl/scores/json/Teams' }
            };

            const response = await handler(event, {});

            expect(response.statusCode).toBe(200);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.sportsdata.io/v3/nfl/scores/json/Teams',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Ocp-Apim-Subscription-Key': 'test-api-key'
                    })
                })
            );

            const body = JSON.parse(response.body);
            expect(body).toEqual(mockData);
        });

        it('should proxy valid MLB requests', async () => {
            const mockData = { teams: [{ name: 'Cardinals' }] };
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                text: async () => JSON.stringify(mockData)
            });

            const event = {
                httpMethod: 'GET',
                queryStringParameters: { path: '/v3/mlb/scores/json/Teams' }
            };

            const response = await handler(event, {});

            expect(response.statusCode).toBe(200);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.sportsdata.io/v3/mlb/scores/json/Teams',
                expect.anything()
            );
        });

        it('should include proper CORS headers', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                text: async () => '{}'
            });

            const event = {
                httpMethod: 'GET',
                queryStringParameters: { path: '/v3/nba/scores/json/Teams' }
            };

            const response = await handler(event, {});

            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Cache-Control']).toBe('public, max-age=30');
        });
    });

    describe('Timeout Handling', () => {
        it('should timeout after 20 seconds', async () => {
            // Mock a slow request
            mockFetch.mockImplementation(() =>
                new Promise(resolve => setTimeout(resolve, 25000))
            );

            const event = {
                httpMethod: 'GET',
                queryStringParameters: { path: '/v3/nfl/scores/json/Teams' }
            };

            // This should timeout
            const startTime = Date.now();
            const response = await handler(event, {});
            const duration = Date.now() - startTime;

            // Should timeout before 25 seconds
            expect(duration).toBeLessThan(22000);
            expect(response.statusCode).toBe(500);
            const body = JSON.parse(response.body);
            expect(body.message).toContain('Timeout');
        }, 30000); // Test timeout of 30 seconds
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const event = {
                httpMethod: 'GET',
                queryStringParameters: { path: '/v3/nfl/scores/json/Teams' }
            };

            const response = await handler(event, {});

            expect(response.statusCode).toBe(500);
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Failed to fetch data');
            expect(body.message).toContain('Network error');
        });

        it('should handle non-200 responses', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
                text: async () => 'Access denied'
            });

            const event = {
                httpMethod: 'GET',
                queryStringParameters: { path: '/v3/nfl/scores/json/Teams' }
            };

            const response = await handler(event, {});

            expect(response.statusCode).toBe(403);
        });
    });
});

describe('Timeout Utility', () => {
    const withTimeout = (promise, ms = 20000) =>
        Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
            )
        ]);

    it('should resolve if promise completes within timeout', async () => {
        const fastPromise = Promise.resolve('success');
        const result = await withTimeout(fastPromise, 1000);
        expect(result).toBe('success');
    });

    it('should reject if timeout exceeded', async () => {
        const slowPromise = new Promise(resolve => setTimeout(() => resolve('slow'), 2000));

        await expect(withTimeout(slowPromise, 100)).rejects.toThrow('Timeout after 100ms');
    });

    it('should pass through rejections', async () => {
        const failingPromise = Promise.reject(new Error('Original error'));

        await expect(withTimeout(failingPromise, 1000)).rejects.toThrow('Original error');
    });
});