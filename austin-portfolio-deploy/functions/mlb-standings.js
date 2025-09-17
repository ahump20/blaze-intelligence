/**
 * Netlify Function: /api/mlb/standings
 * MLB standings data from SportsDataIO
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
    const apiKey = process.env.SPORTSDATA_IO_API_KEY;
    if (!apiKey) {
      console.error('SPORTSDATA_IO_API_KEY not configured');
      return getFallbackStandingsData();
    }

    // Fetch current MLB standings
    const standingsResponse = await fetch(
      `https://api.sportsdata.io/v3/mlb/scores/json/Standings/${new Date().getFullYear()}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey
        }
      }
    );

    if (!standingsResponse.ok) {
      throw new Error(`SportsDataIO API error: ${standingsResponse.status}`);
    }

    const standingsData = await standingsResponse.json();
    
    // Filter for AL Central division (or modify as needed)
    const alCentral = standingsData.filter(team => 
      team.Division === 'AL Central'
    ).sort((a, b) => b.Percentage - a.Percentage);

    const formattedStandings = alCentral.map(team => ({
      name: team.Name,
      wins: team.Wins,
      losses: team.Losses,
      pct: team.Percentage.toFixed(3),
      gamesBack: team.GamesBack || 0,
      logo: `https://www.mlbstatic.com/team-logos/${team.TeamID}.svg`,
      streak: team.Streak
    }));

    return new Response(JSON.stringify({
      status: 'success',
      standings: formattedStandings,
      division: 'AL Central',
      timestamp: new Date().toISOString(),
      source: 'sportsdata.io'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes
      }
    });

  } catch (error) {
    console.error('Error fetching MLB standings:', error);
    return getFallbackStandingsData();
  }
};

function getFallbackStandingsData() {
  const fallbackData = {
    status: 'success',
    standings: [
      {
        name: 'St. Louis Cardinals',
        wins: 83,
        losses: 79,
        pct: '0.512',
        gamesBack: 0,
        logo: 'https://www.mlbstatic.com/team-logos/138.svg',
        streak: 'W2'
      },
      {
        name: 'Chicago Cubs',
        wins: 81,
        losses: 81,
        pct: '0.500',
        gamesBack: 2,
        logo: 'https://www.mlbstatic.com/team-logos/112.svg',
        streak: 'L1'
      },
      {
        name: 'Milwaukee Brewers',
        wins: 79,
        losses: 83,
        pct: '0.488',
        gamesBack: 4,
        logo: 'https://www.mlbstatic.com/team-logos/158.svg',
        streak: 'W1'
      }
    ],
    division: 'AL Central',
    timestamp: new Date().toISOString(),
    source: 'fallback'
  };

  return new Response(JSON.stringify(fallbackData), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300'
    }
  });
}