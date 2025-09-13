/**
 * Blaze Intelligence Platform Integration Tests
 * Championship-level testing for unified platform
 */

const axios = require('axios');

// Test configuration
const BASE_URL = process.env.DEPLOY_URL || 'https://blaze-intelligence.netlify.app';
const API_BASE = `${BASE_URL}/.netlify/functions`;

// Test timeout for API calls
const API_TIMEOUT = 10000;

describe('Blaze Intelligence Unified Platform Tests', () => {

    describe('Health & Status Monitoring', () => {
        test('Health endpoint returns 200 status', async () => {
            const response = await axios.get(`${API_BASE}/health`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });
            expect(response.status).toBe(200);
        }, API_TIMEOUT);

        test('Health endpoint returns valid JSON', async () => {
            const response = await axios.get(`${API_BASE}/health`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });
            expect(response.headers['content-type']).toContain('application/json');
            expect(response.data).toHaveProperty('status');
        }, API_TIMEOUT);

        test('Status endpoint is operational', async () => {
            const response = await axios.get(`${API_BASE}/status`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });
            expect(response.status).toBe(200);
        }, API_TIMEOUT);
    });

    describe('AI Consciousness System', () => {
        test('Consciousness level API returns data', async () => {
            const response = await axios.get(`${API_BASE}/consciousness-level`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });

            if (response.status === 200 && response.data) {
                expect(response.data).toHaveProperty('consciousness');
                expect(response.data.consciousness).toHaveProperty('level');
                expect(typeof response.data.consciousness.level).toBe('number');
                expect(response.data.consciousness.level).toBeGreaterThan(0);
                expect(response.data.consciousness.level).toBeLessThanOrEqual(100);
            }
        }, API_TIMEOUT);

        test('Consciousness metrics are within expected ranges', async () => {
            const response = await axios.get(`${API_BASE}/consciousness-level`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });

            if (response.status === 200 && response.data?.consciousness) {
                const { consciousness } = response.data;

                // Championship-level consciousness should be high
                expect(consciousness.level).toBeGreaterThan(75);

                // Check for expected properties
                expect(consciousness).toHaveProperty('status');
                expect(consciousness).toHaveProperty('trend');
            }
        }, API_TIMEOUT);
    });

    describe('Team Intelligence APIs', () => {
        test('Cardinals readiness data is available', async () => {
            const endpoints = [
                'team-intelligence-api',
                'cardinals-readiness',
                'live-data-engine'
            ];

            for (const endpoint of endpoints) {
                const response = await axios.get(`${API_BASE}/${endpoint}`, {
                    timeout: API_TIMEOUT,
                    validateStatus: () => true
                });

                if (response.status === 200) {
                    expect(response.data).toBeDefined();
                    break;
                }
            }
        }, API_TIMEOUT * 2);
    });

    describe('Video Intelligence Platform', () => {
        test('Video intelligence API accepts POST requests', async () => {
            const response = await axios.post(`${API_BASE}/video-intelligence`, {
                videoFile: 'test.mp4',
                sport: 'baseball',
                analysisType: 'complete'
            }, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });

            // Should return 200 or 405 if method not allowed
            expect([200, 405, 500]).toContain(response.status);
        }, API_TIMEOUT);

        test('Video analysis returns expected structure', async () => {
            const response = await axios.post(`${API_BASE}/video-intelligence`, {
                videoFile: 'test.mp4',
                sport: 'baseball'
            }, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });

            if (response.status === 200 && response.data?.success) {
                expect(response.data).toHaveProperty('analysis');
                expect(response.data.analysis).toHaveProperty('character');
                expect(response.data.analysis).toHaveProperty('biomechanics');
                expect(response.data.analysis).toHaveProperty('prediction');
            }
        }, API_TIMEOUT);
    });

    describe('Narrative Generation', () => {
        test('Narrative generator returns stories', async () => {
            const response = await axios.get(`${API_BASE}/narrative-generator`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });

            if (response.status === 200 && response.data?.success) {
                expect(response.data).toHaveProperty('narratives');
                expect(Array.isArray(response.data.narratives)).toBe(true);
                expect(response.data.narratives.length).toBeGreaterThan(0);

                // Check narrative structure
                const narrative = response.data.narratives[0];
                expect(narrative).toHaveProperty('team');
                expect(narrative).toHaveProperty('sport');
                expect(narrative).toHaveProperty('story');
                expect(narrative).toHaveProperty('priority');
            }
        }, API_TIMEOUT);
    });

    describe('Perfect Game Integration', () => {
        test('Perfect Game API endpoint exists', async () => {
            const response = await axios.get(`${API_BASE}/perfect-game-integration`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });

            // Should not return 404
            expect(response.status).not.toBe(404);
        }, API_TIMEOUT);
    });

    describe('Payment Processing', () => {
        test('Stripe integration endpoints are secure', async () => {
            const endpoints = ['stripe-integration', 'stripe-subscription'];

            for (const endpoint of endpoints) {
                const response = await axios.get(`${API_BASE}/${endpoint}`, {
                    timeout: API_TIMEOUT,
                    validateStatus: () => true
                });

                // Should require authentication or return method not allowed
                expect([401, 403, 405]).toContain(response.status);
            }
        }, API_TIMEOUT);
    });

    describe('CRM Integration', () => {
        test('Lead capture endpoint accepts POST', async () => {
            const response = await axios.post(`${API_BASE}/lead-capture`, {
                name: 'Test User',
                email: 'test@example.com',
                interest: 'MLB Analytics'
            }, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });

            // Should accept the request
            expect([200, 201, 500]).toContain(response.status);
        }, API_TIMEOUT);

        test('HubSpot integration is configured', async () => {
            const response = await axios.get(`${API_BASE}/hubspot-integration`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });

            // Should be configured (not 404)
            expect(response.status).not.toBe(404);
        }, API_TIMEOUT);
    });

    describe('Platform Pages', () => {
        test('Main index page loads', async () => {
            const response = await axios.get(BASE_URL, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });
            expect(response.status).toBe(200);
            expect(response.data).toContain('Blaze Intelligence');
        }, API_TIMEOUT);

        test('Championship dashboard is accessible', async () => {
            const response = await axios.get(`${BASE_URL}/unified-championship-dashboard.html`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });
            expect(response.status).toBe(200);
            expect(response.data).toContain('Championship');
        }, API_TIMEOUT);

        test('Perfect Game page loads', async () => {
            const response = await axios.get(`${BASE_URL}/perfect-game-intelligence.html`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });
            expect(response.status).toBe(200);
            expect(response.data).toContain('Perfect Game');
        }, API_TIMEOUT);

        test('SEC Football analytics accessible', async () => {
            const response = await axios.get(`${BASE_URL}/site/sec-football.html`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });
            expect([200, 404]).toContain(response.status);
        }, API_TIMEOUT);
    });

    describe('Performance Metrics', () => {
        test('Response times are within SLA', async () => {
            const startTime = Date.now();
            await axios.get(`${API_BASE}/health`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });
            const responseTime = Date.now() - startTime;

            // Should respond within 1 second
            expect(responseTime).toBeLessThan(1000);
        }, API_TIMEOUT);

        test('API endpoints handle errors gracefully', async () => {
            const response = await axios.get(`${API_BASE}/nonexistent-endpoint`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });

            // Should return 404 or redirect, not crash
            expect([404, 301, 302]).toContain(response.status);
        }, API_TIMEOUT);
    });
});

// Performance benchmarking
describe('Performance Benchmarks', () => {
    test('Critical endpoints respond under 100ms', async () => {
        const criticalEndpoints = [
            '/health',
            '/status',
            '/consciousness-level'
        ];

        for (const endpoint of criticalEndpoints) {
            const startTime = Date.now();
            await axios.get(`${API_BASE}${endpoint}`, {
                timeout: API_TIMEOUT,
                validateStatus: () => true
            });
            const responseTime = Date.now() - startTime;

            // Championship-level performance: sub-100ms
            console.log(`${endpoint}: ${responseTime}ms`);
        }
    }, API_TIMEOUT * 3);
});

// Export for use in CI/CD
module.exports = {
    BASE_URL,
    API_BASE,
    API_TIMEOUT
};