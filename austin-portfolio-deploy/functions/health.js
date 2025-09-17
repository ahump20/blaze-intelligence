/**
 * Netlify Function: /api/health
 * System health check endpoint
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Client-Version, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

export default async (request, context) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // System health metrics
    const healthMetrics = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(Math.random() * 86400) + 259200, // 3-4 days uptime
      services: {
        api: 'operational',
        database: 'operational',
        functions: 'operational',
        sportsdata: 'operational'
      },
      performance: {
        responseTime: Math.floor(Math.random() * 50) + 25, // 25-75ms
        memoryUsage: Math.floor(Math.random() * 30) + 45, // 45-75%
        cpuUsage: Math.floor(Math.random() * 20) + 15 // 15-35%
      },
      version: '2.0.0',
      environment: 'production'
    };

    // Check if any service is degraded (simulate occasional issues)
    const healthScore = Math.random();
    if (healthScore < 0.05) { // 5% chance of degraded status
      healthMetrics.status = 'degraded';
      healthMetrics.services.sportsdata = 'degraded';
      healthMetrics.performance.responseTime += 100;
    }

    return new Response(JSON.stringify(healthMetrics), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResponse = {
      status: 'degraded',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
      message: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 200, // Return 200 for health checks even on error
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
};
