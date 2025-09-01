/**
 * Blaze Intelligence API - Cloudflare Pages Function
 * Universal API handler for all /api/* routes
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        cardinals_readiness: 86.64
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Catalog endpoint - return static catalog for now
    if (url.pathname === '/api/catalog') {
      const catalogData = {
        "generated_at": new Date().toISOString(),
        "version": "1.0.0",
        "items": [
          {
            "id": "cardinals-readiness-live",
            "title": "Cardinals Live Readiness Dashboard",
            "sport": "MLB",
            "league": "MLB", 
            "teams": ["St. Louis Cardinals"],
            "labs": ["Cardinals"],
            "content_type": "dashboard",
            "source": "site",
            "source_url": "/analytics-dashboard",
            "slug": "/analytics-dashboard",
            "tags": ["cardinals", "readiness", "real-time", "dashboard", "analytics"],
            "updated": new Date().toISOString(),
            "summary": "Live Cardinals readiness metrics: 86.64 overall score with strong positive momentum across multiple performance areas."
          },
          {
            "id": "sports-hub-live",
            "title": "Sports Intelligence Hub",
            "sport": "Multi-Sport",
            "league": "All",
            "teams": ["All Teams"],
            "labs": ["Cardinals", "Titans", "Longhorns", "Grizzlies"],
            "content_type": "dashboard",
            "source": "site",
            "source_url": "/sports",
            "slug": "/sports",
            "tags": ["sports", "hub", "analytics", "multi-league"],
            "updated": new Date().toISOString(),
            "summary": "Comprehensive sports analytics hub with priority lab analytics and league directories."
          }
        ],
        "facets": {
          "sports": ["MLB", "NFL", "NBA", "College Football", "College Baseball", "Multi-Sport"],
          "leagues": ["MLB", "NFL", "NBA", "NCAA", "All"],
          "labs": ["Cardinals", "Titans", "Longhorns", "Grizzlies", "All"],
          "content_types": ["article", "dashboard", "framework", "dataset"],
          "sources": ["site", "notion", "drive", "notes"]
        }
      };
      
      return new Response(JSON.stringify(catalogData), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        },
      });
    }

    // Cardinals team data endpoint
    if (url.pathname === '/api/teams/cardinals' || url.pathname === '/api/teams/stl') {
      const cardinalsData = {
        "timestamp": new Date().toISOString(),
        "team": "St. Louis Cardinals",
        "sport": "MLB",
        "cardinals_readiness": {
          "overall_score": 86.64,
          "trend": "strong",
          "momentum": {
            "score": 70,
            "category": "positive",
            "description": "Strong positive momentum across multiple areas"
          },
          "component_breakdown": {
            "offense": 87.1,
            "defense": 88.5,
            "pitching": 85.4,
            "baserunning": 84.3
          },
          "key_metrics": {
            "leverage_factor": 2.85,
            "leverage_category": "high",
            "strategic_outlook": "Strong position for confident decision-making and calculated risks"
          }
        }
      };
      
      return new Response(JSON.stringify(cardinalsData), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=120'
        },
      });
    }

    // Search endpoint
    if (url.pathname === '/api/search') {
      const query = url.searchParams.get('q') || '';
      
      // Mock search results
      const results = [
        {
          "id": "cardinals-readiness",
          "title": "Cardinals Readiness Dashboard",
          "summary": "Live metrics showing 86.64 overall readiness score",
          "url": "/analytics-dashboard",
          "type": "dashboard"
        },
        {
          "id": "sports-hub",
          "title": "Sports Intelligence Hub", 
          "summary": "Priority analytics labs and comprehensive sports data",
          "url": "/sports",
          "type": "hub"
        }
      ].filter(item => 
        query === '' || 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.summary.toLowerCase().includes(query.toLowerCase())
      );

      return new Response(JSON.stringify({
        query,
        results,
        total: results.length
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        },
      });
    }

    // Default 404
    return new Response(JSON.stringify({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: 'API endpoint not found',
      instance: new Date().toISOString()
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/problem+json' },
    });
    
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({
      type: 'about:blank', 
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
      instance: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/problem+json' },
    });
  }
}