/**
 * Blaze Intelligence NIL (Name, Image, Likeness) Calculator
 * Core calculation engine for college athlete valuations
 *
 * @author Austin Humphrey - Blaze Intelligence
 * @version 2.0.0
 */

// NIL Valuation Constants
const NIL_CONSTANTS = {
    // Base values by sport
    SPORT_BASE_VALUES: {
        'football': 50000,
        'basketball': 40000,
        'baseball': 25000,
        'softball': 20000,
        'soccer': 15000,
        'golf': 15000,
        'tennis': 15000,
        'track': 10000,
        'swimming': 10000,
        'volleyball': 15000,
        'wrestling': 10000,
        'gymnastics': 20000,
        'hockey': 15000,
        'lacrosse': 10000,
        'other': 5000
    },

    // Position multipliers (football)
    POSITION_MULTIPLIERS: {
        'QB': 3.0,
        'RB': 2.0,
        'WR': 2.0,
        'TE': 1.5,
        'OL': 1.3,
        'DL': 1.5,
        'LB': 1.8,
        'DB': 1.6,
        'K': 1.2,
        'P': 1.1
    },

    // Conference multipliers
    CONFERENCE_MULTIPLIERS: {
        'SEC': 2.0,
        'Big Ten': 1.8,
        'Big 12': 1.5,
        'ACC': 1.5,
        'Pac-12': 1.4,
        'Big East': 1.2,
        'AAC': 1.0,
        'Mountain West': 0.9,
        'Conference USA': 0.8,
        'MAC': 0.7,
        'Sun Belt': 0.7,
        'other': 0.5
    },

    // Performance level multipliers
    PERFORMANCE_MULTIPLIERS: {
        'all-american': 3.0,
        'all-conference': 2.0,
        'starter': 1.5,
        'rotation': 1.0,
        'reserve': 0.5
    },

    // Social media impact (per 10k followers)
    SOCIAL_MEDIA_VALUE: {
        'instagram': 500,
        'twitter': 300,
        'tiktok': 400,
        'youtube': 600
    }
};

/**
 * Calculate base NIL valuation for a college athlete
 * @param {Object} athleteData - Athlete information
 * @returns {Object} NIL valuation details
 */
export function calculateNILValue(athleteData) {
    const {
        sport = 'football',
        position = null,
        conference = 'other',
        performanceLevel = 'reserve',
        socialMedia = {},
        gpa = 3.0,
        year = 'freshman',
        achievements = []
    } = athleteData;

    // Start with base sport value
    let baseValue = NIL_CONSTANTS.SPORT_BASE_VALUES[sport.toLowerCase()] || 5000;

    // Apply position multiplier (football only)
    if (sport.toLowerCase() === 'football' && position) {
        const positionMultiplier = NIL_CONSTANTS.POSITION_MULTIPLIERS[position.toUpperCase()] || 1.0;
        baseValue *= positionMultiplier;
    }

    // Apply conference multiplier
    const conferenceMultiplier = NIL_CONSTANTS.CONFERENCE_MULTIPLIERS[conference] || 0.5;
    baseValue *= conferenceMultiplier;

    // Apply performance multiplier
    const performanceMultiplier = NIL_CONSTANTS.PERFORMANCE_MULTIPLIERS[performanceLevel.toLowerCase()] || 0.5;
    baseValue *= performanceMultiplier;

    // Calculate social media bonus
    let socialMediaBonus = 0;
    Object.entries(socialMedia).forEach(([platform, followers]) => {
        const platformValue = NIL_CONSTANTS.SOCIAL_MEDIA_VALUE[platform.toLowerCase()] || 0;
        socialMediaBonus += (followers / 10000) * platformValue;
    });

    // Academic bonus (high GPA)
    let academicBonus = 0;
    if (gpa >= 3.8) {
        academicBonus = baseValue * 0.15; // 15% bonus for excellent academics
    } else if (gpa >= 3.5) {
        academicBonus = baseValue * 0.10; // 10% bonus for good academics
    }

    // Year in school multiplier
    const yearMultipliers = {
        'freshman': 0.8,
        'sophomore': 1.0,
        'junior': 1.2,
        'senior': 1.1,
        'graduate': 0.9
    };
    const yearMultiplier = yearMultipliers[year.toLowerCase()] || 1.0;
    baseValue *= yearMultiplier;

    // Achievement bonuses
    let achievementBonus = 0;
    achievements.forEach(achievement => {
        switch (achievement.toLowerCase()) {
            case 'national champion':
                achievementBonus += 50000;
                break;
            case 'conference champion':
                achievementBonus += 20000;
                break;
            case 'heisman finalist':
                achievementBonus += 100000;
                break;
            case 'award winner':
                achievementBonus += 10000;
                break;
            case 'record holder':
                achievementBonus += 15000;
                break;
            default:
                achievementBonus += 5000;
        }
    });

    // Calculate total valuation
    const totalValue = Math.round(baseValue + socialMediaBonus + academicBonus + achievementBonus);

    // Calculate monthly value (annual / 12)
    const monthlyValue = Math.round(totalValue / 12);

    // Calculate per-post value for social media
    const perPostValue = Math.round(socialMediaBonus / 52); // Weekly posts

    return {
        totalAnnualValue: totalValue,
        monthlyValue: monthlyValue,
        breakdown: {
            baseValue: Math.round(baseValue),
            socialMediaBonus: Math.round(socialMediaBonus),
            academicBonus: Math.round(academicBonus),
            achievementBonus: Math.round(achievementBonus)
        },
        marketingValue: {
            perPost: perPostValue,
            perAppearance: Math.round(totalValue / 20), // Estimate 20 appearances per year
            perAutograph: Math.round(totalValue / 1000) // Estimate 1000 autographs per year
        },
        recommendations: generateRecommendations(totalValue, athleteData)
    };
}

/**
 * Generate strategic recommendations based on NIL value
 * @param {number} totalValue - Total NIL valuation
 * @param {Object} athleteData - Athlete information
 * @returns {Array} List of recommendations
 */
function generateRecommendations(totalValue, athleteData) {
    const recommendations = [];

    // Value tier recommendations
    if (totalValue < 10000) {
        recommendations.push('Focus on building social media presence');
        recommendations.push('Pursue local business partnerships');
        recommendations.push('Consider group NIL deals with teammates');
    } else if (totalValue < 50000) {
        recommendations.push('Target regional brand partnerships');
        recommendations.push('Develop personal brand identity');
        recommendations.push('Engage with fan base through exclusive content');
    } else if (totalValue < 100000) {
        recommendations.push('Pursue national brand opportunities');
        recommendations.push('Consider professional representation');
        recommendations.push('Develop signature merchandise line');
    } else {
        recommendations.push('Maximize national media exposure');
        recommendations.push('Establish long-term brand partnerships');
        recommendations.push('Consider equity deals with startups');
        recommendations.push('Build post-college brand foundation');
    }

    // Sport-specific recommendations
    if (athleteData.sport?.toLowerCase() === 'football') {
        recommendations.push('Leverage game-day activations');
        recommendations.push('Partner with sports equipment brands');
    } else if (athleteData.sport?.toLowerCase() === 'basketball') {
        recommendations.push('Focus on shoe and apparel deals');
        recommendations.push('Build highlight reel content');
    }

    // Social media recommendations
    const totalFollowers = Object.values(athleteData.socialMedia || {}).reduce((a, b) => a + b, 0);
    if (totalFollowers < 10000) {
        recommendations.push('Grow social media following to unlock higher valuations');
    } else if (totalFollowers < 50000) {
        recommendations.push('Engage consistently to reach 50K+ follower milestone');
    } else {
        recommendations.push('Monetize large following with sponsored content');
    }

    return recommendations;
}

/**
 * Compare athlete NIL value to market averages
 * @param {Object} athleteData - Athlete information
 * @param {number} calculatedValue - Calculated NIL value
 * @returns {Object} Market comparison data
 */
export function compareToMarket(athleteData, calculatedValue) {
    // Market averages by sport and level
    const marketAverages = {
        'football': {
            'all-american': 250000,
            'all-conference': 100000,
            'starter': 50000,
            'rotation': 20000,
            'reserve': 5000
        },
        'basketball': {
            'all-american': 200000,
            'all-conference': 80000,
            'starter': 40000,
            'rotation': 15000,
            'reserve': 3000
        },
        'baseball': {
            'all-american': 100000,
            'all-conference': 40000,
            'starter': 20000,
            'rotation': 10000,
            'reserve': 2000
        },
        'other': {
            'all-american': 50000,
            'all-conference': 20000,
            'starter': 10000,
            'rotation': 5000,
            'reserve': 1000
        }
    };

    const sport = athleteData.sport?.toLowerCase() || 'other';
    const level = athleteData.performanceLevel?.toLowerCase() || 'reserve';

    const sportAverages = marketAverages[sport] || marketAverages['other'];
    const marketAverage = sportAverages[level] || 5000;

    const percentileRank = Math.min(100, Math.round((calculatedValue / marketAverage) * 50));
    const marketPosition = calculatedValue >= marketAverage ? 'above' : 'below';
    const difference = Math.abs(calculatedValue - marketAverage);
    const percentDifference = Math.round((difference / marketAverage) * 100);

    return {
        marketAverage,
        calculatedValue,
        difference,
        percentDifference,
        marketPosition,
        percentileRank,
        marketInsight: generateMarketInsight(percentileRank, marketPosition, sport)
    };
}

/**
 * Generate market insight based on comparison
 * @param {number} percentileRank - Athlete's percentile rank
 * @param {string} marketPosition - Above or below market
 * @param {string} sport - Sport type
 * @returns {string} Market insight message
 */
function generateMarketInsight(percentileRank, marketPosition, sport) {
    if (percentileRank >= 90) {
        return `Elite tier NIL valuation - Top 10% of ${sport} athletes`;
    } else if (percentileRank >= 75) {
        return `Strong NIL potential - Top 25% of ${sport} athletes`;
    } else if (percentileRank >= 50) {
        return `Solid market position - Above average for ${sport}`;
    } else if (percentileRank >= 25) {
        return `Growth opportunity - Room to increase NIL value`;
    } else {
        return `Foundation phase - Focus on building brand presence`;
    }
}

/**
 * Project future NIL value based on trajectory
 * @param {Object} currentData - Current athlete data
 * @param {Object} projectionParams - Projection parameters
 * @returns {Object} Future value projections
 */
export function projectFutureValue(currentData, projectionParams = {}) {
    const {
        yearsAhead = 1,
        expectedPerformanceImprovement = 'moderate',
        socialMediaGrowthRate = 0.25,
        additionalAchievements = []
    } = projectionParams;

    // Performance improvement multipliers
    const improvementMultipliers = {
        'none': 1.0,
        'slight': 1.1,
        'moderate': 1.25,
        'significant': 1.5,
        'exceptional': 2.0
    };

    // Calculate current value
    const currentValue = calculateNILValue(currentData);

    // Project social media growth
    const projectedSocialMedia = {};
    Object.entries(currentData.socialMedia || {}).forEach(([platform, followers]) => {
        projectedSocialMedia[platform] = Math.round(followers * (1 + socialMediaGrowthRate * yearsAhead));
    });

    // Create projected data
    const projectedData = {
        ...currentData,
        socialMedia: projectedSocialMedia,
        achievements: [...(currentData.achievements || []), ...additionalAchievements]
    };

    // Apply performance improvement
    const improvementMultiplier = improvementMultipliers[expectedPerformanceImprovement] || 1.25;

    // Calculate projected value
    const projectedValue = calculateNILValue(projectedData);
    const adjustedProjectedValue = Math.round(projectedValue.totalAnnualValue * improvementMultiplier);

    return {
        currentValue: currentValue.totalAnnualValue,
        projectedValue: adjustedProjectedValue,
        growthAmount: adjustedProjectedValue - currentValue.totalAnnualValue,
        growthPercentage: Math.round(((adjustedProjectedValue - currentValue.totalAnnualValue) / currentValue.totalAnnualValue) * 100),
        timeline: `${yearsAhead} year${yearsAhead > 1 ? 's' : ''}`,
        assumptions: {
            performanceImprovement: expectedPerformanceImprovement,
            socialMediaGrowth: `${Math.round(socialMediaGrowthRate * 100)}%`,
            newAchievements: additionalAchievements
        }
    };
}

// Default export
export default {
    calculateNILValue,
    compareToMarket,
    projectFutureValue,
    NIL_CONSTANTS
};