/**
 * Blaze Intelligence NIL Valuation API
 * Calculate NIL (Name, Image, Likeness) valuation for college athletes
 *
 * @author Austin Humphrey - Blaze Intelligence
 * @version 2.0.0
 */

import { calculateNILValue } from './nil-calculator.js';

// NIL Market Analysis Constants
const NIL_MARKET_DATA = {
  averageDeals: {
    football: { qb: 125000, rb: 85000, wr: 90000, ol: 45000, dl: 55000, lb: 60000, db: 70000 },
    basketball: { guard: 95000, forward: 110000, center: 120000 },
    baseball: { pitcher: 65000, catcher: 45000, infielder: 55000, outfielder: 60000 }
  },
  conferenceMultipliers: {
    'SEC': 2.2,
    'Big Ten': 1.9,
    'Big 12': 1.6,
    'ACC': 1.5,
    'Pac-12': 1.4
  },
  marketTrends: {
    socialMediaWeight: 0.35,
    performanceWeight: 0.45,
    marketabilityWeight: 0.20
  }
};

function generateNILInsights(valuation, sport, position) {
  const insights = [];

  // Performance-based insights
  if (valuation.totalAnnualValue > 100000) {
    insights.push("Elite NIL potential - Top 5% of college athletes");
  } else if (valuation.totalAnnualValue > 50000) {
    insights.push("Strong NIL value - Above average for sport");
  } else if (valuation.totalAnnualValue > 25000) {
    insights.push("Developing NIL opportunity - Room for growth");
  } else {
    insights.push("Foundation NIL value - Focus on brand building");
  }

  // Social media insights
  const socialBonus = valuation.breakdown.socialMediaBonus;
  if (socialBonus > 20000) {
    insights.push("Strong social media presence driving NIL value");
  } else if (socialBonus < 5000) {
    insights.push("Social media growth needed to maximize NIL potential");
  }

  // Sport-specific insights
  if (sport === 'football') {
    if (position === 'QB') {
      insights.push("Quarterback premium - 3x position multiplier applied");
    } else if (['RB', 'WR'].includes(position)) {
      insights.push("Skill position advantage - Higher marketability");
    }
  }

  return insights;
}

function calculateMarketComparison(valuation, sport, position) {
  const marketAverage = NIL_MARKET_DATA.averageDeals[sport]?.[position?.toLowerCase()] || 50000;
  const percentileRank = Math.min(100, Math.round((valuation.totalAnnualValue / marketAverage) * 50));

  return {
    marketAverage,
    percentileRank,
    comparison: valuation.totalAnnualValue >= marketAverage ? 'Above Market' : 'Below Market',
    percentDifference: Math.round(Math.abs(valuation.totalAnnualValue - marketAverage) / marketAverage * 100)
  };
}

export async function handler(event, context) {
  try {
    // Parse request data
    let athleteData;

    if (event.httpMethod === 'POST') {
      athleteData = JSON.parse(event.body);
    } else {
      // GET request with query parameters
      const params = event.queryStringParameters || {};
      athleteData = {
        sport: params.sport || 'football',
        position: params.position,
        conference: params.conference || 'SEC',
        performanceLevel: params.performanceLevel || 'starter',
        socialMedia: {
          instagram: parseInt(params.instagram) || 10000,
          twitter: parseInt(params.twitter) || 5000,
          tiktok: parseInt(params.tiktok) || 8000
        },
        gpa: parseFloat(params.gpa) || 3.5,
        year: params.year || 'junior',
        achievements: params.achievements ? params.achievements.split(',') : []
      };
    }

    // Validate required fields
    if (!athleteData.sport) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Sport is required',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Calculate NIL valuation
    const valuation = calculateNILValue(athleteData);

    // Add market analysis
    const marketComparison = calculateMarketComparison(valuation, athleteData.sport, athleteData.position);

    // Generate insights
    const insights = generateNILInsights(valuation, athleteData.sport, athleteData.position);

    // Calculate deal recommendations
    const dealRecommendations = {
      endorsements: Math.round(valuation.totalAnnualValue * 0.40),
      socialMedia: Math.round(valuation.totalAnnualValue * 0.25),
      appearances: Math.round(valuation.totalAnnualValue * 0.20),
      merchandise: Math.round(valuation.totalAnnualValue * 0.15)
    };

    const response = {
      timestamp: new Date().toISOString(),
      athleteProfile: {
        sport: athleteData.sport,
        position: athleteData.position,
        conference: athleteData.conference,
        performanceLevel: athleteData.performanceLevel,
        year: athleteData.year
      },
      nilValuation: valuation,
      marketAnalysis: marketComparison,
      insights: insights,
      dealRecommendations: dealRecommendations,
      projections: {
        nextYear: Math.round(valuation.totalAnnualValue * 1.15),
        graduation: Math.round(valuation.totalAnnualValue * 0.85),
        professionalPotential: valuation.totalAnnualValue > 100000 ? 'High' :
                               valuation.totalAnnualValue > 50000 ? 'Medium' : 'Developing'
      },
      disclaimer: "NIL valuations are estimates based on market data and should not be used as the sole basis for financial decisions"
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
    console.error('NIL Valuation Error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'NIL valuation calculation failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}