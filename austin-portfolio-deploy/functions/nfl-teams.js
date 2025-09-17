/**
 * Netlify Function: /api/nfl/teams
 * Real NFL teams data from SportsDataIO
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
      return getFallbackTeamsData();
    }

    const url = new URL(request.url);
    const conference = url.searchParams.get('conference');
    const division = url.searchParams.get('division');

    // Fetch NFL teams from SportsDataIO
    const teamsResponse = await fetch(
      `https://api.sportsdata.io/v3/nfl/scores/json/Teams`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey
        }
      }
    );

    if (!teamsResponse.ok) {
      throw new Error(`SportsDataIO API error: ${teamsResponse.status}`);
    }

    const teamsData = await teamsResponse.json();

    // Fetch current standings for win/loss records
    const standingsResponse = await fetch(
      `https://api.sportsdata.io/v3/nfl/scores/json/Standings/2024`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey
        }
      }
    );

    let standingsData = [];
    if (standingsResponse.ok) {
      standingsData = await standingsResponse.json();
    }

    // Combine teams with standings data
    const formattedTeams = teamsData.map(team => {
      const standings = standingsData.find(s => s.Team === team.Key) || {};
      
      return {
        id: team.Key.toLowerCase(),
        name: team.FullName,
        abbreviation: team.Key,
        conference: team.Conference,
        division: team.Division,
        city: team.City,
        logo: `https://www.nfl.com/img/franchise/logos/${team.Key}.svg`,
        colors: {
          primary: team.PrimaryColor ? `#${team.PrimaryColor}` : '#000000',
          secondary: team.SecondaryColor ? `#${team.SecondaryColor}` : '#FFFFFF'
        },
        record: {
          wins: standings.Wins || 0,
          losses: standings.Losses || 0,
          ties: standings.Ties || 0
        },
        conference_rank: standings.ConferenceRank || 0,
        division_rank: standings.DivisionRank || 0
      };
    });

    // Filter by conference or division if requested
    let filteredTeams = formattedTeams;
    
    if (conference) {
      filteredTeams = filteredTeams.filter(team => 
        team.conference.toLowerCase() === conference.toLowerCase()
      );
    }
    
    if (division) {
      filteredTeams = filteredTeams.filter(team => 
        team.division.toLowerCase() === division.toLowerCase()
      );
    }

    return new Response(JSON.stringify({
      status: 'success',
      teams: filteredTeams,
      filters: { conference, division },
      season: '2024',
      lastUpdated: new Date().toISOString(),
      source: 'sportsdata.io',
      meta: {
        totalTeams: filteredTeams.length,
        dataSource: 'SportsDataIO NFL API',
        updateFrequency: '5 minutes'
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes
      }
    });

  } catch (error) {
    console.error('Error fetching NFL teams:', error);
    return getFallbackTeamsData();
  }
};

function getFallbackTeamsData() {
  const fallbackData = {
    status: 'success',
    teams: [
      {
        id: 'buf',
        name: 'Buffalo Bills',
        abbreviation: 'BUF',
        conference: 'AFC',
        division: 'East',
        city: 'Buffalo',
        logo: 'https://www.nfl.com/img/franchise/logos/BUF.svg',
        colors: { primary: '#00338D', secondary: '#C60C30' },
        record: { wins: 13, losses: 4, ties: 0 }
      },
      {
        id: 'hou',
        name: 'Houston Texans',
        abbreviation: 'HOU',
        conference: 'AFC',
        division: 'South',
        city: 'Houston',
        logo: 'https://www.nfl.com/img/franchise/logos/HOU.svg',
        colors: { primary: '#03202F', secondary: '#A71930' },
        record: { wins: 10, losses: 7, ties: 0 }
      },
      {
        id: 'dal',
        name: 'Dallas Cowboys',
        abbreviation: 'DAL',
        conference: 'NFC',
        division: 'East',
        city: 'Dallas',
        logo: 'https://www.nfl.com/img/franchise/logos/DAL.svg',
        colors: { primary: '#003594', secondary: '#041E42' },
        record: { wins: 12, losses: 5, ties: 0 }
      }
    ],
    filters: {},
    season: '2024',
    lastUpdated: new Date().toISOString(),
    source: 'fallback',
    meta: {
      totalTeams: 3,
      dataSource: 'Fallback NFL Data',
      updateFrequency: '5 minutes'
    }
  };

  return new Response(JSON.stringify(fallbackData), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60'
    }
  });
}