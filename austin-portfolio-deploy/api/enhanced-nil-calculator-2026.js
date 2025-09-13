/**
 * Enhanced NIL Calculator with 2025-26 Real Data
 * Using On3 NIL Valuations and SEC/Texas Deep South Focus
 *
 * This represents the cutting edge of NIL valuation intelligence,
 * bringing championship-level analytics to the modern recruiting landscape
 */

const nilData = require('../data/nil/2025-26-valuations.json');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    console.log('🏆 NIL Calculator 2026 - Processing request:', event.httpMethod);

    try {
        const params = event.httpMethod === 'GET'
            ? event.queryStringParameters || {}
            : JSON.parse(event.body || '{}');

        // Calculate NIL valuation based on comprehensive 2025-26 data
        const result = calculateNILValue(params);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                timestamp: new Date().toISOString(),
                calculation: result,
                metadata: {
                    season: '2025-26',
                    dataSource: 'On3 NIL Valuations',
                    lastUpdated: nilData.metadata.lastUpdated
                }
            })
        };
    } catch (error) {
        console.error('❌ NIL Calculation Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};

function calculateNILValue(params) {
    const {
        position = 'QB',
        stars = 4,
        school = 'Texas',
        socialFollowers = 10000,
        performanceMetrics = {},
        location = 'TX'
    } = params;

    console.log(`📊 Calculating NIL for ${stars}⭐ ${position} at ${school}`);

    // Find school data from our 2025-26 dataset
    const schoolData = findSchoolData(school);
    const baseValue = calculateBaseValue(position, stars);
    const schoolMultiplier = calculateSchoolMultiplier(schoolData);
    const socialMultiplier = calculateSocialMultiplier(socialFollowers);
    const performanceMultiplier = calculatePerformanceMultiplier(performanceMetrics, position);
    const marketMultiplier = calculateMarketMultiplier(location);

    // Championship-level NIL calculation
    const totalValue = Math.round(
        baseValue *
        schoolMultiplier *
        socialMultiplier *
        performanceMultiplier *
        marketMultiplier
    );

    // Compare to real 2025-26 data
    const comparison = compareToRealData(totalValue, position, schoolData);

    return {
        athleteProfile: {
            position,
            stars,
            school,
            socialFollowers,
            location
        },
        valuation: {
            base: baseValue,
            total: totalValue,
            formatted: `$${totalValue.toLocaleString()}`
        },
        multipliers: {
            school: schoolMultiplier,
            social: socialMultiplier,
            performance: performanceMultiplier,
            market: marketMultiplier
        },
        comparison,
        insights: generateInsights(totalValue, position, schoolData),
        recommendations: generateRecommendations(totalValue, position, schoolData)
    };
}

function findSchoolData(schoolName) {
    // Search in top 50 programs
    const program = nilData.top50Programs.find(
        p => p.school.toLowerCase() === schoolName.toLowerCase()
    );

    if (program) {
        return {
            ...program,
            tier: 'elite'
        };
    }

    // Search in SEC rankings
    const secProgram = nilData.secRankings.find(
        p => p.school.toLowerCase() === schoolName.toLowerCase()
    );

    if (secProgram) {
        return {
            ...secProgram,
            tier: 'sec'
        };
    }

    // Default for non-ranked schools
    return {
        school: schoolName,
        totalRosterValue: 3000000, // Below top 50 threshold
        avgPlayerValue: 35000,
        tier: 'standard'
    };
}

function calculateBaseValue(position, stars) {
    // Base values aligned with 2025-26 market reality
    const positionValues = {
        'QB': 2500000,   // QBs command premium (see Arch Manning at $6.8M)
        'WR': 1500000,   // Elite WRs valuable (Jeremiah Smith at $4.2M)
        'OL': 800000,    // Texas paying $50K stipends to OL
        'DL': 1200000,   // Premium pass rushers
        'RB': 600000,    // Devalued in modern game
        'LB': 700000,    // Solid defensive value
        'DB': 900000,    // Elite DBs command good money
        'S': 1000000,    // Safety premium (Caleb Downs at $2.4M)
        'TE': 500000,    // Specialist position
        'K': 100000,     // Specialist minimum
        'P': 100000      // Specialist minimum
    };

    const starMultipliers = {
        5: 3.0,   // Elite prospects get 3x
        4: 1.5,   // Strong prospects get 1.5x
        3: 0.7,   // Average prospects
        2: 0.3,   // Below average
        1: 0.1    // Walk-on level
    };

    const base = positionValues[position] || 500000;
    const multiplier = starMultipliers[stars] || 0.5;

    return Math.round(base * multiplier);
}

function calculateSchoolMultiplier(schoolData) {
    if (!schoolData) return 1.0;

    // Based on real 2025-26 roster values
    if (schoolData.totalRosterValue >= 20000000) return 2.5;  // Texas level
    if (schoolData.totalRosterValue >= 15000000) return 2.0;  // Alabama/LSU level
    if (schoolData.totalRosterValue >= 10000000) return 1.5;  // Tennessee level
    if (schoolData.totalRosterValue >= 7000000) return 1.2;   // Mid-SEC level
    if (schoolData.totalRosterValue >= 5000000) return 1.0;   // Lower Power 5
    return 0.8; // Group of 5
}

function calculateSocialMultiplier(followers) {
    // Social media impact on NIL value
    if (followers >= 1000000) return 2.0;  // Million+ followers doubles value
    if (followers >= 500000) return 1.7;
    if (followers >= 100000) return 1.4;
    if (followers >= 50000) return 1.2;
    if (followers >= 10000) return 1.1;
    return 1.0;
}

function calculatePerformanceMultiplier(metrics, position) {
    // Performance-based adjustments
    let multiplier = 1.0;

    if (position === 'QB') {
        if (metrics.passingYards > 4000) multiplier *= 1.5;
        if (metrics.touchdowns > 40) multiplier *= 1.3;
        if (metrics.completionPct > 70) multiplier *= 1.2;
    } else if (position === 'WR') {
        if (metrics.receivingYards > 1200) multiplier *= 1.4;
        if (metrics.touchdowns > 12) multiplier *= 1.3;
    } else if (position === 'RB') {
        if (metrics.rushingYards > 1500) multiplier *= 1.4;
        if (metrics.touchdowns > 15) multiplier *= 1.3;
    }

    return Math.min(multiplier, 2.0); // Cap at 2x
}

function calculateMarketMultiplier(location) {
    // Market size and recruiting hotbed multipliers
    const marketValues = {
        'TX': 1.3,  // Texas is NIL heaven
        'FL': 1.2,  // Florida close second
        'CA': 1.2,  // California markets
        'GA': 1.1,  // Atlanta market
        'LA': 1.1,  // Louisiana (LSU country)
        'AL': 1.1,  // Alabama dominance
        'TN': 1.0,  // Tennessee solid
        'SC': 1.0,  // South Carolina rising
        'MS': 0.9,  // Mississippi schools
        'AR': 0.9,  // Arkansas market
        'KY': 0.9   // Kentucky market
    };

    return marketValues[location] || 1.0;
}

function compareToRealData(calculatedValue, position, schoolData) {
    // Compare to actual 2025-26 valuations
    const comparisons = [];

    // Find similar valued athletes
    if (position === 'QB') {
        if (calculatedValue >= 6000000) {
            comparisons.push({
                athlete: 'Arch Manning',
                school: 'Texas',
                value: 6800000,
                comparison: 'Elite QB Territory'
            });
        } else if (calculatedValue >= 3000000) {
            comparisons.push({
                athlete: 'Drew Allar',
                school: 'Penn State',
                value: 3300000,
                comparison: 'Top QB Range'
            });
        }
    }

    // School comparison
    if (schoolData && schoolData.avgPlayerValue) {
        const percentile = (calculatedValue / schoolData.avgPlayerValue) * 100;
        comparisons.push({
            type: 'School Average',
            schoolAvg: schoolData.avgPlayerValue,
            yourValue: calculatedValue,
            percentile: Math.round(percentile),
            analysis: percentile > 200 ? 'Elite for program' :
                     percentile > 100 ? 'Above average' : 'Below average'
        });
    }

    return comparisons;
}

function generateInsights(value, position, schoolData) {
    const insights = [];

    // Value tier insight
    if (value >= 5000000) {
        insights.push("🏆 Championship-level NIL valuation - Top 1% nationally");
    } else if (value >= 2000000) {
        insights.push("⭐ Elite NIL valuation - Top 5% of college athletes");
    } else if (value >= 1000000) {
        insights.push("💪 Strong NIL valuation - Top 10% range");
    } else if (value >= 500000) {
        insights.push("📈 Solid NIL potential with room for growth");
    }

    // School-specific insight
    if (schoolData && schoolData.trend === 'surging') {
        insights.push(`🚀 ${schoolData.school} NIL is surging - increased ${schoolData.yearOverYearChange?.toLocaleString() || 'significantly'} year-over-year`);
    }

    // Position market insight
    if (position === 'QB') {
        insights.push("🎯 QB position commands highest NIL premiums in 2025-26");
    } else if (position === 'WR') {
        insights.push("⚡ WR position seeing explosive NIL growth with elite prospects");
    }

    // SEC insight
    if (schoolData && schoolData.conference === 'SEC') {
        insights.push("🏈 SEC leads all conferences in NIL spending - competitive advantage");
    }

    return insights;
}

function generateRecommendations(value, position, schoolData) {
    const recommendations = [];

    // Social media growth
    if (value < 1000000) {
        recommendations.push({
            category: 'Social Media',
            action: 'Grow social following to 50K+ for 20% NIL boost',
            impact: 'high'
        });
    }

    // Performance improvement
    recommendations.push({
        category: 'Performance',
        action: `Elite ${position} stats can increase NIL by 40-50%`,
        impact: 'high'
    });

    // School selection
    if (!schoolData || schoolData.totalRosterValue < 10000000) {
        recommendations.push({
            category: 'Transfer Portal',
            action: 'Consider top NIL programs for 2-3x value increase',
            schools: ['Texas ($22M)', 'Alabama ($18.4M)', 'LSU ($17.9M)'],
            impact: 'very high'
        });
    }

    // Brand building
    recommendations.push({
        category: 'Brand Development',
        action: 'Partner with Blaze Intelligence for AI-driven brand optimization',
        impact: 'high'
    });

    return recommendations;
}

// Export for testing
module.exports.calculateNILValue = calculateNILValue;