// Live Scores API for Blaze Intelligence
// Real-time sports data for Cardinals, Titans, Longhorns, Grizzlies

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60' // Cache for 1 minute
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { sport = 'all' } = event.queryStringParameters || {};

    // Sample live scores data - in production, this would fetch from real APIs
    const liveScores = {
      mlb: [
        {
          id: 'mlb_1',
          sport: 'MLB',
          home: {
            team: 'St. Louis Cardinals',
            score: 7,
            logo: '/images/cardinals-logo.svg'
          },
          away: {
            team: 'Chicago Cubs',
            score: 4,
            logo: '/images/cubs-logo.svg'
          },
          status: 'Final',
          inning: '9',
          venue: 'Busch Stadium',
          timestamp: new Date().toISOString()
        },
        {
          id: 'mlb_2',
          sport: 'MLB',
          home: {
            team: 'Houston Astros',
            score: 3,
            logo: '/images/astros-logo.svg'
          },
          away: {
            team: 'Texas Rangers',
            score: 5,
            logo: '/images/rangers-logo.svg'
          },
          status: 'Top 7th',
          inning: '7',
          venue: 'Minute Maid Park',
          timestamp: new Date().toISOString()
        }
      ],
      nfl: [
        {
          id: 'nfl_1',
          sport: 'NFL',
          home: {
            team: 'Tennessee Titans',
            score: 24,
            logo: '/images/titans-logo.svg'
          },
          away: {
            team: 'Jacksonville Jaguars',
            score: 17,
            logo: '/images/jaguars-logo.svg'
          },
          status: '3rd Quarter',
          quarter: '3',
          time: '8:42',
          venue: 'Nissan Stadium',
          timestamp: new Date().toISOString()
        }
      ],
      ncaa: [
        {
          id: 'ncaa_1',
          sport: 'NCAA Football',
          home: {
            team: 'Texas Longhorns',
            score: 35,
            logo: '/images/longhorns-logo.svg'
          },
          away: {
            team: 'Oklahoma Sooners',
            score: 28,
            logo: '/images/sooners-logo.svg'
          },
          status: '4th Quarter',
          quarter: '4',
          time: '2:15',
          venue: 'DKR Texas Memorial Stadium',
          timestamp: new Date().toISOString()
        }
      ],
      nba: [
        {
          id: 'nba_1',
          sport: 'NBA',
          home: {
            team: 'Memphis Grizzlies',
            score: 98,
            logo: '/images/grizzlies-logo.svg'
          },
          away: {
            team: 'San Antonio Spurs',
            score: 92,
            logo: '/images/spurs-logo.svg'
          },
          status: '3rd Quarter',
          quarter: '3',
          time: '5:23',
          venue: 'FedExForum',
          timestamp: new Date().toISOString()
        }
      ]
    };

    // Filter by sport if specified
    let responseData;
    if (sport === 'all') {
      responseData = {
        success: true,
        count: Object.values(liveScores).flat().length,
        scores: liveScores,
        lastUpdated: new Date().toISOString()
      };
    } else if (liveScores[sport.toLowerCase()]) {
      responseData = {
        success: true,
        sport: sport.toUpperCase(),
        count: liveScores[sport.toLowerCase()].length,
        scores: liveScores[sport.toLowerCase()],
        lastUpdated: new Date().toISOString()
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Invalid sport: ${sport}. Valid options are: all, mlb, nfl, ncaa, nba`
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('Live Scores API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch live scores',
        message: error.message
      })
    };
  }
};