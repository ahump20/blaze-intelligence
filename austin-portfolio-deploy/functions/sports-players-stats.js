/**
 * Netlify Function: /api/sports/players/stats
 * Real player statistics from SportsDataIO
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
      return getFallbackStatsData();
    }

    const url = new URL(request.url);
    const sport = url.searchParams.get('sport') || 'mlb';
    const position = url.searchParams.get('position');
    const team = url.searchParams.get('team');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let players = [];

    // Fetch MLB player stats if requested or default
    if (sport.toLowerCase() === 'mlb' || sport.toLowerCase() === 'all') {
      try {
        const mlbResponse = await fetch(
          `https://api.sportsdata.io/v3/mlb/stats/json/PlayerSeasonStats/${new Date().getFullYear()}`,
          {
            headers: {
              'Ocp-Apim-Subscription-Key': apiKey
            }
          }
        );

        if (mlbResponse.ok) {
          const mlbData = await mlbResponse.json();
          
          // Filter active players with significant stats
          const activePlayers = mlbData
            .filter(player => player.AtBats >= 50 && player.BattingAverage > 0)
            .sort((a, b) => b.BattingAverage - a.BattingAverage)
            .slice(0, limit);

          const mlbPlayers = activePlayers.map(player => ({
            id: player.PlayerID,
            name: player.Name,
            team: player.Team,
            sport: 'MLB',
            position: player.Position,
            jerseyNumber: player.Jersey || 0,
            photo: `https://www.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:default.png/h_213,w_213/v1/people/${player.PlayerID}/headshot/milb/current`,
            stats: {
              battingAverage: parseFloat(player.BattingAverage.toFixed(3)),
              homeRuns: player.HomeRuns,
              rbi: player.RunsBattedIn,
              runs: player.Runs,
              hits: player.Hits,
              onBasePercentage: parseFloat((player.OnBasePercentage || 0).toFixed(3)),
              sluggingPercentage: parseFloat((player.SluggingPercentage || 0).toFixed(3)),
              fieldingPercentage: parseFloat((player.FieldingPercentage || 0).toFixed(3))
            },
            rankings: {
              homeRuns: 0, // Would need additional API call to calculate
              rbi: 0,
              battingAverage: 0
            }
          }));

          players = players.concat(mlbPlayers);
        }
      } catch (error) {
        console.warn('Failed to fetch MLB stats:', error.message);
      }
    }

    // Fetch NFL player stats if requested
    if (sport.toLowerCase() === 'nfl' || sport.toLowerCase() === 'all') {
      try {
        const nflResponse = await fetch(
          `https://api.sportsdata.io/v3/nfl/stats/json/PlayerSeasonStats/2024`,
          {
            headers: {
              'Ocp-Apim-Subscription-Key': apiKey
            }
          }
        );

        if (nflResponse.ok) {
          const nflData = await nflResponse.json();
          
          // Filter quarterbacks and running backs with significant stats
          const activeNFLPlayers = nflData
            .filter(player => 
              (player.Position === 'QB' && player.PassingYards > 500) ||
              (player.Position === 'RB' && player.RushingYards > 200) ||
              (player.Position === 'WR' && player.ReceivingYards > 300)
            )
            .slice(0, Math.floor(limit / 2));

          const nflPlayers = activeNFLPlayers.map(player => ({
            id: player.PlayerID,
            name: player.Name,
            team: player.Team,
            sport: 'NFL',
            position: player.Position,
            jerseyNumber: player.Number || 0,
            photo: `https://www.nfl.com/img/headshots/profile/${player.PlayerID}.jpg`,
            stats: player.Position === 'QB' ? {
              passingYards: player.PassingYards,
              passingTouchdowns: player.PassingTouchdowns,
              interceptions: player.Interceptions,
              completionPercentage: parseFloat((player.PassingCompletionPercentage || 0).toFixed(1)),
              rushingYards: player.RushingYards,
              rushingTouchdowns: player.RushingTouchdowns,
              qbRating: parseFloat((player.PasserRating || 0).toFixed(1))
            } : player.Position === 'RB' ? {
              rushingYards: player.RushingYards,
              touchdowns: player.RushingTouchdowns,
              carries: player.RushingAttempts,
              yardsPerCarry: parseFloat((player.RushingYards / (player.RushingAttempts || 1)).toFixed(1)),
              receivingYards: player.ReceivingYards,
              fumbles: player.Fumbles,
              gamesPlayed: player.Games
            } : {
              receivingYards: player.ReceivingYards,
              receptions: player.Receptions,
              touchdowns: player.ReceivingTouchdowns,
              yardsPerReception: parseFloat((player.ReceivingYards / (player.Receptions || 1)).toFixed(1)),
              targets: player.ReceivingTargets,
              gamesPlayed: player.Games
            },
            rankings: {
              primaryStat: 0, // Would need additional calculation
              secondaryStat: 0,
              overallRank: 0
            }
          }));

          players = players.concat(nflPlayers);
        }
      } catch (error) {
        console.warn('Failed to fetch NFL stats:', error.message);
      }
    }

    // Apply additional filters
    if (position) {
      players = players.filter(player => 
        player.position.toLowerCase() === position.toLowerCase()
      );
    }
    
    if (team) {
      players = players.filter(player => 
        player.team.toLowerCase().includes(team.toLowerCase())
      );
    }

    // Limit final results
    players = players.slice(0, limit);

    return new Response(JSON.stringify({
      status: 'success',
      players: players,
      filters: { sport, position, team, limit },
      totalResults: players.length,
      season: new Date().getFullYear().toString(),
      lastUpdated: new Date().toISOString(),
      source: 'sportsdata.io',
      meta: {
        dataSource: 'SportsDataIO Player Statistics',
        updateFrequency: '3 minutes',
        availableSports: ['MLB', 'NFL'],
        totalPlayers: players.length
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=180' // 3 minutes cache
      }
    });

  } catch (error) {
    console.error('Error fetching player stats:', error);
    return getFallbackStatsData();
  }
};

function getFallbackStatsData() {
  const fallbackData = {
    status: 'success',
    players: [
      {
        id: 'fallback-1',
        name: 'Nolan Arenado',
        team: 'STL',
        sport: 'MLB',
        position: '3B',
        jerseyNumber: 28,
        photo: 'https://www.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:default.png/h_213,w_213/v1/people/571448/headshot/milb/current',
        stats: {
          battingAverage: 0.289,
          homeRuns: 26,
          rbi: 93,
          runs: 82,
          hits: 156,
          onBasePercentage: 0.325,
          sluggingPercentage: 0.459,
          fieldingPercentage: 0.976
        }
      },
      {
        id: 'fallback-2',
        name: 'Lamar Jackson',
        team: 'BAL',
        sport: 'NFL',
        position: 'QB',
        jerseyNumber: 8,
        photo: 'https://www.nfl.com/img/headshots/profile/32013030.jpg',
        stats: {
          passingYards: 3678,
          passingTouchdowns: 24,
          interceptions: 7,
          completionPercentage: 66.7,
          rushingYards: 915,
          rushingTouchdowns: 3,
          qbRating: 107.3
        }
      }
    ],
    filters: {},
    totalResults: 2,
    season: new Date().getFullYear().toString(),
    lastUpdated: new Date().toISOString(),
    source: 'fallback',
    meta: {
      dataSource: 'Fallback Player Data',
      updateFrequency: '3 minutes',
      availableSports: ['MLB', 'NFL'],
      totalPlayers: 2
    }
  };

  return new Response(JSON.stringify(fallbackData), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=180'
    }
  });
}