/**
 * Integration Tests for Enhanced Gateway API
 * Testing end-to-end API functionality and data flow
 */

const request = require('supertest');
const { createServer } = require('../../api/enhanced-gateway');

describe('Enhanced Gateway API Integration', () => {
  let app;
  let server;

  beforeAll(async () => {
    app = createServer();
    server = app.listen(0); // Use random port for tests
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('Health Check Endpoint', () => {
    test('should return operational status', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        status: 'operational',
        timestamp: expect.any(String)
      });
    });

    test('should include system metrics in health check', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=health')
        .expect(200);

      expect(response.body.system).toMatchObject({
        uptime: expect.any(Number),
        memory: expect.any(Object),
        performance: expect.any(Object)
      });
    });
  });

  describe('Cardinals Analytics Endpoint', () => {
    test('should return Cardinals readiness data', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=cardinals-analytics')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          performance: {
            overall: expect.any(Number)
          },
          readiness: expect.any(Number),
          trend: expect.stringMatching(/positive|stable|declining/)
        }
      });

      // Validate readiness score is within valid range
      expect(response.body.data.readiness).toBeGreaterThanOrEqual(0);
      expect(response.body.data.readiness).toBeLessThanOrEqual(100);
    });

    test('should complete Cardinals analysis within performance budget', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=cardinals-analytics')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      // Should complete within 100ms performance budget
      expect(responseTime).toBeLessThan(100);
      expect(response.body.success).toBe(true);
    });

    test('should handle high concurrent Cardinals requests', async () => {
      const concurrentRequests = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/enhanced-gateway?endpoint=cardinals-analytics')
          .expect(200)
      );

      const responses = await Promise.all(concurrentRequests);
      
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.readiness).toBeDefined();
      });
    });
  });

  describe('Multi-Sport Dashboard Endpoint', () => {
    test('should return data for all supported sports', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=multi-sport-dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.teams).toBeDefined();
      
      // Should include our core sports teams
      const teams = response.body.data.teams;
      expect(teams).toHaveProperty('cardinals'); // MLB
      expect(teams).toHaveProperty('titans');    // NFL
      expect(teams).toHaveProperty('longhorns'); // NCAA
      expect(teams).toHaveProperty('grizzlies'); // NBA
    });

    test('should exclude soccer/football references', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=multi-sport-dashboard')
        .expect(200);

      const responseText = JSON.stringify(response.body);
      
      // Should not contain soccer references
      expect(responseText.toLowerCase()).not.toMatch(/soccer|football(?!.*american)/i);
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits for anonymous requests', async () => {
      const requests = [];
      
      // Make rapid requests to trigger rate limiting
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .get('/api/enhanced-gateway?endpoint=health')
        );
      }
      
      const responses = await Promise.allSettled(requests);
      const rateLimitedResponses = responses.filter(
        result => result.value?.status === 429
      );
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should provide rate limit headers', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid endpoint gracefully', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=nonexistent')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.any(String),
        timestamp: expect.any(String)
      });
    });

    test('should handle malformed query parameters', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should handle timeout scenarios', async () => {
      // Mock a slow endpoint for timeout testing
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=health&delay=5000')
        .timeout(3000)
        .expect(408);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('timeout')
      });
    }, 10000); // Extended timeout for this test
  });

  describe('Caching Behavior', () => {
    test('should cache Cardinals analytics data appropriately', async () => {
      // First request
      const response1 = await request(app)
        .get('/api/enhanced-gateway?endpoint=cardinals-analytics')
        .expect(200);

      // Second request (should be cached)
      const response2 = await request(app)
        .get('/api/enhanced-gateway?endpoint=cardinals-analytics')
        .expect(200);

      // Both should succeed and have consistent data structure
      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
      expect(response1.body.data).toBeDefined();
      expect(response2.body.data).toBeDefined();
    });

    test('should include cache headers', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=cardinals-analytics')
        .expect(200);

      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers).toHaveProperty('etag');
    });
  });

  describe('Data Accuracy', () => {
    test('should maintain 94.6% accuracy benchmark in responses', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=cardinals-analytics')
        .expect(200);

      // If we claim 94.6% accuracy, validate data consistency
      const { data } = response.body;
      
      if (data.accuracy !== undefined) {
        expect(data.accuracy).toBeGreaterThanOrEqual(94.6);
      }
      
      // Ensure readiness score consistency
      expect(data.readiness).toBe(parseFloat(data.readiness.toFixed(2)));
    });

    test('should provide methods and definitions link for benchmarks', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=cardinals-analytics')
        .expect(200);

      // If benchmark metrics are present, should include methods link
      if (response.body.data.accuracy || response.body.data.latency) {
        expect(response.body.metadata).toHaveProperty('methodsLink');
        expect(response.body.metadata.methodsLink).toMatch(/methods.*definitions/i);
      }
    });
  });

  describe('Performance Monitoring', () => {
    test('should track performance metrics', async () => {
      const response = await request(app)
        .get('/api/enhanced-gateway?endpoint=health')
        .expect(200);

      expect(response.body.system.performance).toMatchObject({
        responseTime: expect.any(Number),
        requestsProcessed: expect.any(Number)
      });
    });

    test('should meet <100ms latency claims', async () => {
      const startTime = process.hrtime();
      
      await request(app)
        .get('/api/enhanced-gateway?endpoint=health')
        .expect(200);
      
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const milliseconds = seconds * 1000 + nanoseconds / 1000000;
      
      // Validate we meet our <100ms latency claims
      expect(milliseconds).toBeLessThan(100);
    });
  });
});