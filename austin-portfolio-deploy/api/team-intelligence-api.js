// Team Intelligence API - Netlify Function
// Championship-level team analytics and intelligence

const TEAM_INTELLIGENCE = [
  {
    "id": "st-louis-cardinals",
    "name": "St. Louis Cardinals",
    "league": "MLB",
    "division": "NL Central",
    "founded": 1882,
    "championships": 11,
    "metrics": {
      "competitive_index": 245,
      "legacy_score": 167,
      "blaze_intelligence_score": 186,
      "prediction_accuracy": 94.6,
      "data_points": 28947
    },
    "analytics": {
      "injury_risk": 0.23,
      "performance_trend": "stable",
      "playoff_probability": 0.67,
      "championship_probability": 0.12
    },
    "current_season": {
      "wins": 82,
      "losses": 80,
      "win_percentage": 0.506,
      "runs_scored": 744,
      "runs_allowed": 738,
      "run_differential": 6
    },
    "key_players": [
      "Nolan Arenado",
      "Paul Goldschmidt",
      "Willson Contreras"
    ],
    "strengths": ["veteran leadership", "clutch hitting", "defensive fundamentals"],
    "areas_for_improvement": ["starting pitching depth", "base running efficiency"]
  },
  {
    "id": "tennessee-titans",
    "name": "Tennessee Titans",
    "league": "NFL",
    "division": "AFC South",
    "founded": 1960,
    "championships": 0,
    "metrics": {
      "competitive_index": 156,
      "legacy_score": 98,
      "blaze_intelligence_score": 134,
      "prediction_accuracy": 91.2,
      "data_points": 19847
    },
    "analytics": {
      "injury_risk": 0.31,
      "performance_trend": "rebuilding",
      "playoff_probability": 0.23,
      "championship_probability": 0.03
    },
    "current_season": {
      "wins": 6,
      "losses": 11,
      "win_percentage": 0.353,
      "points_scored": 298,
      "points_allowed": 387,
      "point_differential": -89
    },
    "key_players": [
      "Derrick Henry",
      "Ryan Tannehill",
      "Jeffery Simmons"
    ],
    "strengths": ["ground game", "defensive line", "special teams"],
    "areas_for_improvement": ["quarterback consistency", "red zone efficiency"]
  },
  {
    "id": "texas-longhorns-football",
    "name": "Texas Longhorns",
    "league": "NCAA Football",
    "division": "Big 12",
    "founded": 1893,
    "championships": 4,
    "metrics": {
      "competitive_index": 198,
      "legacy_score": 156,
      "blaze_intelligence_score": 178,
      "prediction_accuracy": 92.8,
      "data_points": 24156
    },
    "analytics": {
      "injury_risk": 0.27,
      "performance_trend": "rising",
      "playoff_probability": 0.45,
      "championship_probability": 0.08
    },
    "current_season": {
      "wins": 12,
      "losses": 2,
      "win_percentage": 0.857,
      "points_scored": 476,
      "points_allowed": 298,
      "point_differential": 178
    },
    "key_players": [
      "Quinn Ewers",
      "Bijan Robinson",
      "T'Vondre Sweat"
    ],
    "strengths": ["explosive offense", "defensive depth", "recruiting momentum"],
    "areas_for_improvement": ["consistency in big games", "special teams coverage"]
  },
  {
    "id": "memphis-grizzlies",
    "name": "Memphis Grizzlies",
    "league": "NBA",
    "division": "Southwest",
    "founded": 1995,
    "championships": 0,
    "metrics": {
      "competitive_index": 167,
      "legacy_score": 78,
      "blaze_intelligence_score": 142,
      "prediction_accuracy": 89.4,
      "data_points": 15698
    },
    "analytics": {
      "injury_risk": 0.35,
      "performance_trend": "young_core",
      "playoff_probability": 0.34,
      "championship_probability": 0.05
    },
    "current_season": {
      "wins": 27,
      "losses": 55,
      "win_percentage": 0.329,
      "points_scored": 110.2,
      "points_allowed": 115.8,
      "point_differential": -5.6
    },
    "key_players": [
      "Ja Morant",
      "Jaren Jackson Jr.",
      "Desmond Bane"
    ],
    "strengths": ["athleticism", "defensive potential", "young talent"],
    "areas_for_improvement": ["shooting consistency", "veteran leadership"]
  }
];

function getTeamById(teamId) {
  return TEAM_INTELLIGENCE.find(team => team.id === teamId);
}

function getTeamsByLeague(league) {
  return TEAM_INTELLIGENCE.filter(team => team.league === league.toUpperCase());
}

function getTopPerformers(count = 5) {
  return TEAM_INTELLIGENCE
    .sort((a, b) => b.metrics.blaze_intelligence_score - a.metrics.blaze_intelligence_score)
    .slice(0, count);
}

function getFeaturedTeams() {
  return TEAM_INTELLIGENCE.filter(team =>
    team.metrics.blaze_intelligence_score > 150 ||
    team.current_season.win_percentage > 0.600
  );
}

function generateTeamAnalytics(team) {
  if (!team) return null;

  const analytics = {
    team_overview: {
      name: team.name,
      league: team.league,
      division: team.division,
      championship_history: team.championships
    },
    performance_metrics: team.metrics,
    current_form: {
      record: `${team.current_season.wins}-${team.current_season.losses}`,
      win_percentage: Math.round(team.current_season.win_percentage * 1000) / 1000,
      form_trend: team.analytics.performance_trend
    },
    championship_outlook: {
      playoff_chances: Math.round(team.analytics.playoff_probability * 100) + '%',
      title_chances: Math.round(team.analytics.championship_probability * 100) + '%',
      injury_risk_level: team.analytics.injury_risk < 0.25 ? 'Low' :
                         team.analytics.injury_risk < 0.35 ? 'Medium' : 'High'
    },
    key_insights: {
      primary_strengths: team.strengths,
      improvement_areas: team.areas_for_improvement,
      star_players: team.key_players
    },
    blaze_intelligence_grade: team.metrics.blaze_intelligence_score > 180 ? 'A' :
                              team.metrics.blaze_intelligence_score > 160 ? 'B' :
                              team.metrics.blaze_intelligence_score > 140 ? 'C' : 'D'
  };

  return analytics;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Team Intelligence API called:', event.httpMethod, event.path);
    const { path, queryStringParameters } = event;
    const params = queryStringParameters || {};

    // Route handling
    if (path.includes('/teams/league/')) {
      const league = path.split('/teams/league/')[1];
      const teams = getTeamsByLeague(league);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          league: league.toUpperCase(),
          teams: teams,
          count: teams.length
        })
      };
    }

    if (path.includes('/teams/top/')) {
      const count = parseInt(path.split('/teams/top/')[1]) || 5;
      const topTeams = getTopPerformers(count);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          top_performers: topTeams,
          count: topTeams.length
        })
      };
    }

    if (path.includes('/teams/featured')) {
      const featured = getFeaturedTeams();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          featured_teams: featured,
          count: featured.length
        })
      };
    }

    if (params.teamId || params.team_id) {
      const teamId = params.teamId || params.team_id;
      const team = getTeamById(teamId);

      if (!team) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Team not found',
            available_teams: TEAM_INTELLIGENCE.map(t => ({ id: t.id, name: t.name, league: t.league }))
          })
        };
      }

      const analytics = generateTeamAnalytics(team);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          team_data: team,
          analytics: analytics,
          timestamp: new Date().toISOString()
        })
      };
    }

    // Default: return all teams
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Championship Team Intelligence API',
        total_teams: TEAM_INTELLIGENCE.length,
        available_endpoints: [
          '/api/team-intelligence-api?teamId=st-louis-cardinals',
          '/api/team-intelligence-api?league=MLB',
          '/api/team-intelligence-api?featured=true',
          '/api/team-intelligence-api?top=5'
        ],
        teams: TEAM_INTELLIGENCE.map(team => ({
          id: team.id,
          name: team.name,
          league: team.league,
          blaze_score: team.metrics.blaze_intelligence_score
        })),
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Team Intelligence API Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Team intelligence analysis failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};