/**
 * Netlify Function: /api/analytics/dashboard
 * Dashboard analytics and metrics
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
    // Generate realistic analytics data
    const currentTime = new Date();
    const dayOfWeek = currentTime.getDay();
    const hour = currentTime.getHours();

    // Simulate realistic traffic patterns
    const baseTraffic = 1500;
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.8 : 1.0;
    const hourMultiplier = hour >= 18 && hour <= 23 ? 1.5 : 
                          hour >= 9 && hour <= 17 ? 1.2 : 0.7;
    
    const activeUsers = Math.floor(baseTraffic * weekendMultiplier * hourMultiplier);
    
    const analytics = {
      status: 'success',
      dashboard: {
        overview: {
          activeUsers: activeUsers,
          totalSessions: Math.floor(activeUsers * 1.3),
          averageSessionDuration: Math.floor(Math.random() * 120 + 240), // 4-6 minutes
          bounceRate: Math.round((Math.random() * 10 + 25) * 100) / 100 // 25-35%
        },
        traffic: {
          realTime: {
            current: activeUsers,
            peak24h: Math.floor(activeUsers * 1.8),
            growth: Math.round((Math.random() * 20 - 5) * 100) / 100 // -5% to +15%
          },
          sources: [
            { name: 'Direct', users: Math.floor(activeUsers * 0.4), percentage: 40 },
            { name: 'Social Media', users: Math.floor(activeUsers * 0.25), percentage: 25 },
            { name: 'Search Engines', users: Math.floor(activeUsers * 0.2), percentage: 20 },
            { name: 'Referrals', users: Math.floor(activeUsers * 0.15), percentage: 15 }
          ]
        },
        performance: {
          pageLoadTime: Math.round((Math.random() * 0.5 + 1.2) * 1000) / 1000, // 1.2-1.7 seconds
          apiResponseTime: Math.floor(Math.random() * 50 + 85), // 85-135ms
          uptime: 99.97,
          errorRate: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100 // 0.1-0.6%
        },
        content: {
          topPages: [
            { path: '/', views: Math.floor(activeUsers * 0.35), title: 'Austin Humphrey Landing' },
            { path: '/app', views: Math.floor(activeUsers * 0.28), title: 'Sports Dashboard' },
            { path: '/sports-intelligence', views: Math.floor(activeUsers * 0.15), title: 'Live Analytics' },
            { path: '/pressure-dashboard', views: Math.floor(activeUsers * 0.12), title: 'Pressure Analytics' },
            { path: '/manifesto', views: Math.floor(activeUsers * 0.1), title: 'Platform Vision' }
          ],
          engagement: {
            averageTimeOnPage: Math.floor(Math.random() * 60 + 180), // 3-4 minutes
            pagesPerSession: Math.round((Math.random() * 1.5 + 2.5) * 100) / 100, // 2.5-4 pages
            returnVisitorRate: Math.round((Math.random() * 15 + 35) * 100) / 100 // 35-50%
          }
        }
      },
      timestamp: currentTime.toISOString(),
      source: 'blaze-analytics'
    };

    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // 1 minute cache
      }
    });

  } catch (error) {
    console.error('Error generating analytics data:', error);
    
    const errorResponse = {
      status: 'error',
      message: 'Analytics temporarily unavailable',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
};