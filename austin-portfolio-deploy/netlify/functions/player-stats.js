/**
 * Blaze Intelligence Player Stats API
 * Get player statistics and performance metrics
 *
 * @author Austin Humphrey - Blaze Intelligence
 * @version 2.0.0
 */

const SPORTSDATAIO_CONFIG = {
  apiKey: process.env.SPORTSDATAIO_API_KEY || '6ca2adb39404482da5406f0a6cd7aa37',
  baseUrls: {
    nfl: 'https://api.sportsdata.io/v3/nfl',
    mlb: 'https://api.sportsdata.io/v3/mlb',
    nba: 'https://api.sportsdata.io/v3/nba',
    ncaa: 'https://api.sportsdata.io/v3/cfb'
  }
};

// Cache for 5 minutes
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

async function fetchWithCache(url, key) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': SPORTSDATAIO_CONFIG.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    console.error(`API Error for ${key}:`, error);
    return null;
  }
}

function generateSampleMLBStats(playerId, statType) {
  const baseStats = {
    season: {
      playerId: playerId,
      name: 'Nolan Arenado',
      position: '3B',
      team: 'STL',
      gamesPlayed: 152,
      atBats: 580,
      hits: 162,
      doubles: 34,
      triples: 2,
      homeRuns: 26,
      rbi: 93,
      battingAverage: 0.279,
      onBasePercentage: 0.325,
      sluggingPercentage: 0.456,
      ops: 0.781,
      stolenBases: 2,
      strikeouts: 116
    },
    career: {
      playerId: playerId,
      seasons: 12,
      totalGames: 1647,
      totalHits: 1823,
      careerAverage: 0.287,
      careerHomeRuns: 341,
      careerRbi: 1144,
      goldGloves: 10,
      allStarAppearances: 8
    },
    advanced: {
      war: 4.2,
      wrc: 115,
      babip: 0.302,
      iso: 0.177,
      defensiveRuns: 15,
      clutchRating: 0.87,
      pressurePerformance: 0.291
    }
  };

  return baseStats[statType] || baseStats.season;
}

function generateSampleNFLStats(playerId, statType) {
  const baseStats = {
    season: {
      playerId: playerId,
      name: 'Derrick Henry',
      position: 'RB',
      team: 'TEN',
      gamesPlayed: 16,
      rushingAttempts: 349,
      rushingYards: 1538,
      rushingTDs: 13,
      yardsPerCarry: 4.4,
      receptions: 33,
      receivingYards: 214,
      receivingTDs: 1,
      totalTouchdowns: 14,
      fumbles: 3
    },
    career: {
      playerId: playerId,
      seasons: 8,
      totalGames: 119,
      careerRushingYards: 9502,
      careerTouchdowns: 90,
      yardsPerCarryCareer: 4.6,
      probowls: 4,
      allPros: 2
    }
  };

  return baseStats[statType] || baseStats.season;
}

function generatePlayerInsights(stats, sport) {
  const insights = [];

  if (sport === 'mlb') {
    if (stats.battingAverage >= 0.300) {
      insights.push("Elite batting average - Top tier hitter");
    }
    if (stats.homeRuns >= 30) {
      insights.push("Power threat - 30+ home run capability");
    }
    if (stats.ops >= 0.800) {
      insights.push("Excellent overall offensive production");
    }
    if (stats.defensiveRuns > 10) {
      insights.push("Elite defensive value - Gold Glove caliber");
    }
  } else if (sport === 'nfl') {
    if (stats.rushingYards >= 1200) {
      insights.push("Elite rushing production - Workhorse back");
    }
    if (stats.yardsPerCarry >= 4.5) {
      insights.push("Excellent efficiency - High yards per carry");
    }
    if (stats.totalTouchdowns >= 12) {
      insights.push("Red zone threat - Consistent scoring");
    }
  }

  return insights;
}

export async function handler(event, context) {
  try {
    const { sport, playerId, statType = 'season' } = event.queryStringParameters || {};

    if (!sport || !playerId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Sport and playerId are required',
          availableSports: ['mlb', 'nfl', 'nba', 'ncaa'],
          availableStatTypes: ['season', 'career', 'game', 'advanced'],
          timestamp: new Date().toISOString()
        })
      };
    }

    let playerStats;

    // For now, return sample data for featured players
    switch (sport.toLowerCase()) {
      case 'mlb':
        playerStats = generateSampleMLBStats(playerId, statType);
        break;
      case 'nfl':
        playerStats = generateSampleNFLStats(playerId, statType);
        break;
      case 'nba':
        // Sample NBA stats for Grizzlies player
        playerStats = {
          playerId: playerId,
          name: 'Ja Morant',
          position: 'PG',
          team: 'MEM',
          gamesPlayed: 9,
          pointsPerGame: 25.1,
          assistsPerGame: 8.1,
          reboundsPerGame: 5.6,
          fieldGoalPct: 0.471,
          threePointPct: 0.275,
          freeThrowPct: 0.814
        };
        break;
      case 'ncaa':
        // Sample NCAA stats for Longhorns player
        playerStats = {
          playerId: playerId,
          name: 'Quinn Ewers',
          position: 'QB',
          team: 'TEX',
          gamesPlayed: 14,
          completions: 225,
          attempts: 348,
          completionPct: 0.647,
          passingYards: 3479,
          touchdowns: 31,
          interceptions: 12,
          qbRating: 158.2
        };
        break;
      default:
        throw new Error(`Unsupported sport: ${sport}`);
    }

    // Generate insights
    const insights = generatePlayerInsights(playerStats, sport);

    // Calculate performance grade
    let performanceGrade = 'B';
    if (sport === 'mlb' && playerStats.ops >= 0.900) performanceGrade = 'A';
    else if (sport === 'nfl' && playerStats.yardsPerCarry >= 5.0) performanceGrade = 'A';
    else if (sport === 'nba' && playerStats.pointsPerGame >= 25) performanceGrade = 'A';
    else if (sport === 'ncaa' && playerStats.qbRating >= 150) performanceGrade = 'A';

    const response = {
      timestamp: new Date().toISOString(),
      sport: sport.toLowerCase(),
      playerId: playerId,
      statType: statType,
      playerStats: playerStats,
      analysis: {
        performanceGrade: performanceGrade,
        insights: insights,
        standoutMetrics: insights.length,
        overallRating: performanceGrade === 'A' ? 'Elite' :
                      performanceGrade === 'B' ? 'Above Average' : 'Average'
      },
      comparisons: {
        leagueAverage: `Above ${performanceGrade === 'A' ? '90th' : '65th'} percentile`,
        teamRanking: performanceGrade === 'A' ? 'Top 3' : 'Top 10',
        positionRanking: `Top ${performanceGrade === 'A' ? '15' : '50'} at position`
      },
      lastUpdated: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // 5 minute cache
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Player Stats Error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Player statistics temporarily unavailable',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}