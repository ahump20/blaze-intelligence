// Enhanced NIL Calculator - Netlify Function
// Championship-level NIL valuation with real market data

const NIL_MARKET_DATA = {
  average_deals: {
    football: {
      quarterback: 45000,
      skill_position: 25000,
      lineman: 15000,
      other: 12000
    },
    basketball: {
      point_guard: 35000,
      wing: 28000,
      big_man: 22000,
      bench: 8000
    },
    baseball: {
      pitcher: 18000,
      position_player: 15000,
      utility: 8000
    }
  },
  market_multipliers: {
    power5_conferences: {
      'SEC': 1.25,
      'Big Ten': 1.20,
      'Big 12': 1.15,
      'ACC': 1.10,
      'Pac-12': 1.05
    },
    social_media_rates: {
      instagram_per_1k_followers: 0.75,
      tiktok_per_1k_followers: 0.50,
      twitter_per_1k_followers: 0.25,
      engagement_bonus_high: 1.30,
      engagement_bonus_medium: 1.10,
      engagement_bonus_low: 0.90
    }
  }
};

function calculateBaseNIL(profile) {
  const sport = profile.sport || 'football';
  const position = profile.position || 'other';

  let baseValue = NIL_MARKET_DATA.average_deals[sport]?.[position] ||
                  NIL_MARKET_DATA.average_deals[sport]?.other ||
                  15000;

  // Apply conference multiplier
  const conference = profile.conference || '';
  const conferenceMultiplier = NIL_MARKET_DATA.market_multipliers.power5_conferences[conference] || 1.0;

  return baseValue * conferenceMultiplier;
}

function calculateSocialMediaValue(profile) {
  const social = profile.social || {};
  const rates = NIL_MARKET_DATA.market_multipliers.social_media_rates;

  const instagramValue = (social.instagram_followers || 0) / 1000 * rates.instagram_per_1k_followers;
  const tiktokValue = (social.tiktok_followers || 0) / 1000 * rates.tiktok_per_1k_followers;
  const twitterValue = (social.twitter_followers || 0) / 1000 * rates.twitter_per_1k_followers;

  const totalSocialValue = instagramValue + tiktokValue + twitterValue;

  // Apply engagement bonus
  const engagement = social.engagement_rate || 0.03;
  let engagementMultiplier = rates.engagement_bonus_low;

  if (engagement > 0.08) {
    engagementMultiplier = rates.engagement_bonus_high;
  } else if (engagement > 0.05) {
    engagementMultiplier = rates.engagement_bonus_medium;
  }

  return totalSocialValue * engagementMultiplier;
}

function calculatePerformanceMultiplier(profile) {
  const performance = profile.performance || {};
  let multiplier = 1.0;

  // Sport-specific performance metrics
  if (profile.sport === 'football') {
    const touchdowns = performance.touchdowns || 0;
    const yards = (performance.passing_yards || 0) + (performance.rushing_yards || 0);

    if (touchdowns > 25 && yards > 3000) {
      multiplier = 1.4;
    } else if (touchdowns > 15 && yards > 2000) {
      multiplier = 1.2;
    }
  } else if (profile.sport === 'basketball') {
    const points = performance.points_per_game || 0;
    const assists = performance.assists_per_game || 0;

    if (points > 20 || assists > 8) {
      multiplier = 1.3;
    } else if (points > 15 || assists > 5) {
      multiplier = 1.15;
    }
  }

  return multiplier;
}

function generateNILReport(profile, finalValue, breakdown) {
  return {
    athlete_profile: {
      name: profile.name || 'Anonymous Athlete',
      sport: profile.sport,
      position: profile.position,
      school: profile.school || 'Unknown',
      conference: profile.conference,
      year: profile.year_in_school
    },
    nil_valuation: {
      estimated_annual_value: Math.round(finalValue),
      estimated_monthly_value: Math.round(finalValue / 12),
      estimated_per_deal_value: Math.round(finalValue / 6), // Assuming 6 deals per year
      market_tier: finalValue > 50000 ? 'Elite' : finalValue > 25000 ? 'High' : finalValue > 10000 ? 'Medium' : 'Developing'
    },
    value_breakdown: breakdown,
    recommendations: {
      primary_focus: finalValue > 30000 ? 'Brand partnerships' : 'Social media growth',
      growth_opportunity: 'Increase social media engagement',
      market_position: `Top ${finalValue > 40000 ? '5%' : finalValue > 20000 ? '15%' : '35%'} in ${profile.sport}`
    },
    disclaimer: 'NIL valuations are estimates based on market data and should not be considered guaranteed earnings.',
    timestamp: new Date().toISOString()
  };
}

exports.handler = async (event, context) => {
  // Handle CORS
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

  try {
    let profile = {};

    if (event.httpMethod === 'POST') {
      profile = JSON.parse(event.body || '{}');
    } else if (event.httpMethod === 'GET') {
      profile = event.queryStringParameters || {};
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Calculate NIL value with championship precision
    const baseValue = calculateBaseNIL(profile);
    const socialValue = calculateSocialMediaValue(profile);
    const performanceMultiplier = calculatePerformanceMultiplier(profile);

    const totalValue = (baseValue + socialValue) * performanceMultiplier;

    const breakdown = {
      base_market_value: Math.round(baseValue),
      social_media_value: Math.round(socialValue),
      performance_multiplier: Math.round(performanceMultiplier * 100) / 100,
      total_estimated_value: Math.round(totalValue)
    };

    const report = generateNILReport(profile, totalValue, breakdown);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: report,
        calculation_time: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Enhanced NIL Calculator Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Championship NIL calculation failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};