/**
 * Netlify Function: /api/sports/players/top-performers
 * Top performing players data from SportsDataIO
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
      return getFallbackPlayersData();
    }

    // Fetch MLB player stats (batting leaders)
    const playersResponse = await fetch(
      `https://api.sportsdata.io/v3/mlb/stats/json/PlayerSeasonStats/${new Date().getFullYear()}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey
        }
      }
    );

    if (!playersResponse.ok) {
      throw new Error(`SportsDataIO API error: ${playersResponse.status}`);
    }

    const playersData = await playersResponse.json();
    
    // Filter and sort by batting average (minimum 100 at-bats)
    const topBatters = playersData
      .filter(player => player.AtBats >= 100 && player.BattingAverage > 0)
      .sort((a, b) => b.BattingAverage - a.BattingAverage)
      .slice(0, 6);

    const formattedPlayers = topBatters.map(player => ({
      id: player.PlayerID,
      name: player.Name,
      position: player.Position,
      team: player.Team,
      photo: `https://www.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:default.png/h_213,w_213/v1/people/${player.PlayerID}/headshot/milb/current`,
      primaryStat: {
        value: player.BattingAverage.toFixed(3),
        label: 'AVG'
      },
      secondaryStat: {
        value: player.HomeRuns,
        label: 'HR'
      },
      stats: {
        battingAverage: player.BattingAverage.toFixed(3),
        homeRuns: player.HomeRuns,
        rbi: player.RunsBattedIn,
        hits: player.Hits
      }
    }));

    return new Response(JSON.stringify({
      status: 'success',
      players: formattedPlayers,
      category: 'Batting Leaders',
      timestamp: new Date().toISOString(),
      source: 'sportsdata.io'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600' // 10 minutes
      }
    });

  } catch (error) {
    console.error('Error fetching top performers:', error);
    return getFallbackPlayersData();
  }
};

function getFallbackPlayersData() {
  const fallbackData = {
    status: 'success',
    players: [
      {
        id: 'fallback-1',
        name: 'Nolan Arenado',
        position: '3B',
        team: 'STL',
        photo: 'https://www.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:default.png/h_213,w_213/v1/people/571448/headshot/milb/current',
        primaryStat: { value: '.289', label: 'AVG' },
        secondaryStat: { value: '26', label: 'HR' },
        stats: { battingAverage: '.289', homeRuns: 26, rbi: 93, hits: 156 }
      },
      {
        id: 'fallback-2',
        name: 'Paul Goldschmidt',
        position: '1B',
        team: 'STL',
        photo: 'https://www.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:default.png/h_213,w_213/v1/people/502671/headshot/milb/current',
        primaryStat: { value: '.283', label: 'AVG' },
        secondaryStat: { value: '22', label: 'HR' },
        stats: { battingAverage: '.283', homeRuns: 22, rbi: 65, hits: 144 }
      },
      {
        id: 'fallback-3',
        name: 'Willson Contreras',
        position: 'C',
        team: 'STL',
        photo: 'https://www.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:default.png/h_213,w_213/v1/people/575929/headshot/milb/current',
        primaryStat: { value: '.262', label: 'AVG' },
        secondaryStat: { value: '15', label: 'HR' },
        stats: { battingAverage: '.262', homeRuns: 15, rbi: 36, hits: 71 }
      }
    ],
    category: 'Batting Leaders',
    timestamp: new Date().toISOString(),
    source: 'fallback'
  };

  return new Response(JSON.stringify(fallbackData), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600'
    }
  });
}