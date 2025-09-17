/**
 * Blaze Intelligence NIL Valuation Engine
 * Real-time Name, Image, Likeness valuation with social media integration
 * Deep South Sports Authority - SEC-Focused NIL Market Intelligence
 */

class NILValuationEngine {
    constructor() {
        this.isInitialized = false;
        this.marketData = new Map();
        this.socialMetrics = new Map();
        this.valuationHistory = [];
        this.alertThresholds = new Map();

        // SEC-specific market parameters
        this.secMarketData = {
            alabama: { premium: 1.35, fanbase: 850000, mediaValue: 2.1 },
            georgia: { premium: 1.32, fanbase: 820000, mediaValue: 2.0 },
            texas: { premium: 1.30, fanbase: 900000, mediaValue: 2.2 },
            lsu: { premium: 1.28, fanbase: 750000, mediaValue: 1.9 },
            florida: { premium: 1.25, fanbase: 800000, mediaValue: 1.95 },
            tennessee: { premium: 1.22, fanbase: 680000, mediaValue: 1.7 },
            missouri: { premium: 1.15, fanbase: 450000, mediaValue: 1.4 },
            arkansas: { premium: 1.18, fanbase: 520000, mediaValue: 1.5 },
            kentucky: { premium: 1.12, fanbase: 480000, mediaValue: 1.3 },
            mississippi: { premium: 1.20, fanbase: 520000, mediaValue: 1.6 },
            mississippiState: { premium: 1.18, fanbase: 450000, mediaValue: 1.4 },
            southCarolina: { premium: 1.16, fanbase: 540000, mediaValue: 1.5 },
            vanderbilt: { premium: 1.08, fanbase: 280000, mediaValue: 1.1 },
            texasAM: { premium: 1.25, fanbase: 650000, mediaValue: 1.8 },
            auburn: { premium: 1.24, fanbase: 620000, mediaValue: 1.75 }
        };

        // NIL valuation factors and weights
        this.valuationFactors = {
            athletic_performance: { weight: 0.25, metrics: ['stats', 'team_success', 'accolades'] },
            social_media_reach: { weight: 0.30, metrics: ['followers', 'engagement', 'growth_rate'] },
            market_demand: { weight: 0.20, metrics: ['brand_inquiries', 'regional_popularity', 'position_value'] },
            character_assessment: { weight: 0.15, metrics: ['leadership', 'marketability', 'controversy_risk'] },
            academic_standing: { weight: 0.10, metrics: ['gpa', 'major_marketability', 'graduation_timeline'] }
        };

        // Social media platform weights
        this.platformWeights = {
            instagram: 0.35,
            tiktok: 0.30,
            twitter: 0.20,
            youtube: 0.10,
            linkedin: 0.05
        };

        // Market trend indicators
        this.marketTrends = {
            quarterbacks: { multiplier: 1.4, demand: 'Very High' },
            runningBacks: { multiplier: 1.2, demand: 'High' },
            wideReceivers: { multiplier: 1.3, demand: 'Very High' },
            defensiveStars: { multiplier: 1.1, demand: 'Medium' },
            specialists: { multiplier: 0.9, demand: 'Low' },
            basketball: { multiplier: 1.25, demand: 'High' },
            baseball: { multiplier: 1.0, demand: 'Medium' }
        };

        this.performanceMetrics = {
            calculationTimes: [],
            accuracyScores: [],
            marketPredictions: []
        };
    }

    async initialize() {
        try {
            // Initialize market data sources
            await this.loadMarketData();

            // Set up social media monitoring
            this.setupSocialMediaTracking();

            // Initialize real-time alerts
            this.setupValueAlerts();

            // Start market trend analysis
            this.startMarketAnalysis();

            this.isInitialized = true;
            console.log('🏆 NIL Valuation Engine initialized successfully');

            return { status: 'success', message: 'NIL valuation system ready' };
        } catch (error) {
            console.error('❌ Failed to initialize NIL Valuation Engine:', error);
            return { status: 'error', message: error.message };
        }
    }

    async loadMarketData() {
        // Load historical NIL market data
        this.marketBaselines = {
            sec_average: 125000,
            national_average: 85000,
            position_premiums: {
                quarterback: 1.6,
                running_back: 1.2,
                wide_receiver: 1.4,
                tight_end: 1.0,
                offensive_line: 0.8,
                defensive_line: 1.0,
                linebacker: 0.9,
                defensive_back: 1.1,
                kicker: 0.7,
                punter: 0.6
            },
            sport_multipliers: {
                football: 1.0,
                basketball: 0.85,
                baseball: 0.65,
                softball: 0.45,
                gymnastics: 0.55,
                track: 0.35
            }
        };

        // Initialize market trend tracking
        this.marketTrendData = {
            monthly_changes: [],
            seasonal_patterns: {},
            regional_variations: {},
            position_volatility: {}
        };
    }

    setupSocialMediaTracking() {
        // Set up intervals for social media monitoring
        this.socialMediaMonitor = setInterval(() => {
            this.updateSocialMetrics();
        }, 300000); // Update every 5 minutes

        console.log('📱 Social media tracking initialized');
    }

    setupValueAlerts() {
        // Initialize alert system for significant value changes
        this.alertSystem = {
            valueChangeThreshold: 0.15, // 15% change triggers alert
            trendChangeThreshold: 0.10,  // 10% trend change
            marketShiftThreshold: 0.20   // 20% market shift
        };

        console.log('🚨 NIL value alert system initialized');
    }

    startMarketAnalysis() {
        // Start continuous market analysis
        setInterval(() => {
            this.analyzeMarketTrends();
            this.updateMarketPredictions();
        }, 600000); // Update every 10 minutes

        console.log('📊 Market analysis engine started');
    }

    async calculateNILValue(athleteData) {
        const startTime = performance.now();

        try {
            // Validate athlete data
            if (!this.validateAthleteData(athleteData)) {
                throw new Error('Invalid athlete data provided');
            }

            // Calculate base valuation
            const baseValue = await this.calculateBaseValue(athleteData);

            // Apply performance multipliers
            const performanceValue = this.applyPerformanceMultipliers(baseValue, athleteData);

            // Calculate social media value
            const socialValue = await this.calculateSocialMediaValue(athleteData);

            // Apply market demand factors
            const marketAdjustedValue = this.applyMarketDemand(performanceValue + socialValue, athleteData);

            // Apply SEC regional premium
            const finalValue = this.applySECPremium(marketAdjustedValue, athleteData);

            // Calculate confidence and risk scores
            const confidence = this.calculateValuationConfidence(athleteData);
            const riskAssessment = this.assessMarketRisk(athleteData);

            // Compile comprehensive valuation report
            const valuation = {
                athlete_id: athleteData.id || athleteData.name,
                timestamp: Date.now(),
                total_nil_value: Math.round(finalValue),
                value_breakdown: {
                    base_value: Math.round(baseValue),
                    performance_premium: Math.round(performanceValue - baseValue),
                    social_media_value: Math.round(socialValue),
                    market_adjustment: Math.round(marketAdjustedValue - (performanceValue + socialValue)),
                    sec_premium: Math.round(finalValue - marketAdjustedValue)
                },
                market_analysis: {
                    position_rank: this.calculatePositionRank(athleteData),
                    school_market_power: this.getSchoolMarketPower(athleteData.school),
                    regional_demand: this.assessRegionalDemand(athleteData),
                    growth_potential: this.calculateGrowthPotential(athleteData)
                },
                risk_assessment: riskAssessment,
                confidence_score: confidence,
                value_tier: this.determineValueTier(finalValue),
                recommendations: this.generateRecommendations(athleteData, finalValue),
                processing_time: performance.now() - startTime
            };

            // Store valuation history
            this.valuationHistory.push(valuation);
            this.updatePerformanceMetrics(valuation);

            // Check for alerts
            this.checkValueAlerts(valuation);

            return valuation;

        } catch (error) {
            console.error('❌ NIL valuation calculation error:', error);
            return { error: error.message, timestamp: Date.now() };
        }
    }

    validateAthleteData(data) {
        const required = ['name', 'sport', 'position', 'school', 'year'];
        return required.every(field => data.hasOwnProperty(field) && data[field]);
    }

    async calculateBaseValue(athleteData) {
        const { sport, position, school, year } = athleteData;

        // Start with market baseline
        let baseValue = this.marketBaselines.national_average;

        // Apply sport multiplier
        const sportMultiplier = this.marketBaselines.sport_multipliers[sport.toLowerCase()] || 1.0;
        baseValue *= sportMultiplier;

        // Apply position premium
        const positionKey = position.toLowerCase().replace(/\s+/g, '_');
        const positionPremium = this.marketBaselines.position_premiums[positionKey] || 1.0;
        baseValue *= positionPremium;

        // Apply class year adjustment
        const yearMultipliers = {
            'freshman': 0.8,
            'sophomore': 0.9,
            'junior': 1.1,
            'senior': 1.0,
            'graduate': 0.9
        };
        const yearMultiplier = yearMultipliers[year.toLowerCase()] || 1.0;
        baseValue *= yearMultiplier;

        // Apply school market power
        const schoolPower = this.getSchoolMarketPower(school);
        baseValue *= schoolPower.multiplier;

        return baseValue;
    }

    applyPerformanceMultipliers(baseValue, athleteData) {
        let multiplier = 1.0;

        // Athletic performance metrics
        if (athleteData.stats) {
            multiplier += this.calculateStatsImpact(athleteData.stats, athleteData.sport);
        }

        // Team success impact
        if (athleteData.teamRecord) {
            multiplier += this.calculateTeamSuccessImpact(athleteData.teamRecord);
        }

        // Individual accolades
        if (athleteData.accolades) {
            multiplier += this.calculateAccoladesImpact(athleteData.accolades);
        }

        // Character assessment integration
        if (athleteData.characterAssessment) {
            multiplier += this.calculateCharacterImpact(athleteData.characterAssessment);
        }

        return baseValue * Math.min(multiplier, 3.0); // Cap at 3x multiplier
    }

    calculateStatsImpact(stats, sport) {
        let impact = 0;

        switch (sport.toLowerCase()) {
            case 'football':
                impact = this.calculateFootballStatsImpact(stats);
                break;
            case 'basketball':
                impact = this.calculateBasketballStatsImpact(stats);
                break;
            case 'baseball':
                impact = this.calculateBaseballStatsImpact(stats);
                break;
            default:
                impact = this.calculateGenericStatsImpact(stats);
        }

        return Math.min(impact, 1.0); // Cap at 100% bonus
    }

    calculateFootballStatsImpact(stats) {
        let impact = 0;

        // Quarterback stats
        if (stats.passing_yards) {
            const yardsImpact = Math.min(stats.passing_yards / 4000, 1.0) * 0.3;
            impact += yardsImpact;
        }

        if (stats.passing_touchdowns) {
            const tdImpact = Math.min(stats.passing_touchdowns / 35, 1.0) * 0.2;
            impact += tdImpact;
        }

        // Running back stats
        if (stats.rushing_yards) {
            const rushImpact = Math.min(stats.rushing_yards / 1500, 1.0) * 0.3;
            impact += rushImpact;
        }

        // Receiving stats
        if (stats.receiving_yards) {
            const recImpact = Math.min(stats.receiving_yards / 1200, 1.0) * 0.25;
            impact += recImpact;
        }

        return impact;
    }

    calculateBasketballStatsImpact(stats) {
        let impact = 0;

        if (stats.points_per_game) {
            impact += Math.min(stats.points_per_game / 25, 1.0) * 0.4;
        }

        if (stats.assists_per_game) {
            impact += Math.min(stats.assists_per_game / 8, 1.0) * 0.2;
        }

        if (stats.rebounds_per_game) {
            impact += Math.min(stats.rebounds_per_game / 10, 1.0) * 0.2;
        }

        return impact;
    }

    calculateBaseballStatsImpact(stats) {
        let impact = 0;

        if (stats.batting_average) {
            impact += Math.min(stats.batting_average / 0.350, 1.0) * 0.3;
        }

        if (stats.home_runs) {
            impact += Math.min(stats.home_runs / 25, 1.0) * 0.25;
        }

        if (stats.era && stats.era < 4.0) {
            impact += Math.min((4.0 - stats.era) / 2.0, 1.0) * 0.3;
        }

        return impact;
    }

    calculateGenericStatsImpact(stats) {
        // Generic performance impact for other sports
        if (stats.performance_rating) {
            return Math.min(stats.performance_rating / 100, 1.0) * 0.5;
        }
        return 0.1; // Minimal impact for incomplete data
    }

    calculateTeamSuccessImpact(teamRecord) {
        const winPercentage = teamRecord.wins / (teamRecord.wins + teamRecord.losses);

        let impact = 0;
        if (winPercentage > 0.8) impact = 0.3; // Elite team
        else if (winPercentage > 0.7) impact = 0.2; // Very good team
        else if (winPercentage > 0.6) impact = 0.1; // Good team
        else impact = 0; // Below average team

        // Championship/playoff bonus
        if (teamRecord.championships) impact += 0.2;
        if (teamRecord.playoffs) impact += 0.1;

        return impact;
    }

    calculateAccoladesImpact(accolades) {
        let impact = 0;

        const accoladeValues = {
            'heisman_trophy': 1.0,
            'all_american': 0.5,
            'all_conference': 0.3,
            'player_of_year': 0.4,
            'rookie_of_year': 0.3,
            'championship_mvp': 0.6,
            'conference_player_of_year': 0.4
        };

        accolades.forEach(accolade => {
            const value = accoladeValues[accolade.toLowerCase()] || 0.1;
            impact += value;
        });

        return Math.min(impact, 1.5); // Cap at 150% bonus
    }

    calculateCharacterImpact(characterAssessment) {
        // Integration with Character Assessment CV Engine
        if (!characterAssessment.championshipDNA) return 0;

        const dna = characterAssessment.championshipDNA;
        const overallScore = dna.overall_championship_dna || 0;

        // Character multiplier based on championship DNA
        if (overallScore > 0.9) return 0.3; // Elite character
        if (overallScore > 0.8) return 0.2; // Strong character
        if (overallScore > 0.7) return 0.1; // Good character
        if (overallScore > 0.6) return 0.05; // Average character
        return 0; // Below average character impact
    }

    async calculateSocialMediaValue(athleteData) {
        if (!athleteData.socialMedia) return 0;

        let totalValue = 0;
        const social = athleteData.socialMedia;

        // Calculate platform-specific values
        Object.keys(this.platformWeights).forEach(platform => {
            if (social[platform]) {
                const platformValue = this.calculatePlatformValue(social[platform], platform);
                totalValue += platformValue * this.platformWeights[platform];
            }
        });

        // Apply engagement quality multiplier
        const engagementQuality = this.assessEngagementQuality(social);
        totalValue *= engagementQuality;

        // Apply growth trend multiplier
        const growthMultiplier = this.calculateGrowthTrend(social);
        totalValue *= growthMultiplier;

        return Math.min(totalValue, 500000); // Cap social media value
    }

    calculatePlatformValue(platformData, platform) {
        const { followers, engagementRate, monthlyGrowth } = platformData;

        // Base value calculation
        let baseValue = 0;

        switch (platform) {
            case 'instagram':
                baseValue = followers * 0.02; // $0.02 per follower
                break;
            case 'tiktok':
                baseValue = followers * 0.015; // $0.015 per follower
                break;
            case 'twitter':
                baseValue = followers * 0.01; // $0.01 per follower
                break;
            case 'youtube':
                baseValue = followers * 0.05; // $0.05 per subscriber
                break;
            case 'linkedin':
                baseValue = followers * 0.03; // $0.03 per connection
                break;
        }

        // Apply engagement rate multiplier
        const engagementMultiplier = Math.min(engagementRate / 3.0, 2.0); // 3% engagement = 1x, cap at 2x
        baseValue *= engagementMultiplier;

        // Apply growth multiplier
        const growthMultiplier = Math.min(1 + (monthlyGrowth / 10), 2.0); // 10% growth = 2x, cap at 2x
        baseValue *= growthMultiplier;

        return baseValue;
    }

    assessEngagementQuality(socialData) {
        // Assess quality of engagement across platforms
        let qualityScore = 1.0;

        Object.keys(socialData).forEach(platform => {
            const data = socialData[platform];
            if (data.engagementRate) {
                const platformBenchmark = this.getEngagementBenchmark(platform);
                const score = Math.min(data.engagementRate / platformBenchmark, 2.0);
                qualityScore = (qualityScore + score) / 2; // Average quality
            }
        });

        return qualityScore;
    }

    getEngagementBenchmark(platform) {
        const benchmarks = {
            instagram: 2.5,
            tiktok: 4.0,
            twitter: 1.5,
            youtube: 3.0,
            linkedin: 2.0
        };
        return benchmarks[platform] || 2.0;
    }

    calculateGrowthTrend(socialData) {
        // Calculate overall growth trend across platforms
        let totalGrowth = 0;
        let platformCount = 0;

        Object.keys(socialData).forEach(platform => {
            const data = socialData[platform];
            if (data.monthlyGrowth !== undefined) {
                totalGrowth += data.monthlyGrowth;
                platformCount++;
            }
        });

        if (platformCount === 0) return 1.0;

        const avgGrowth = totalGrowth / platformCount;
        return Math.min(1 + (avgGrowth / 20), 2.0); // 20% growth = 2x multiplier, cap at 2x
    }

    applyMarketDemand(currentValue, athleteData) {
        const { sport, position } = athleteData;

        // Get position demand multiplier
        const positionKey = position.toLowerCase().replace(/\s+/g, '');
        const positionDemand = this.marketTrends[positionKey] || { multiplier: 1.0 };

        // Apply position demand
        let adjustedValue = currentValue * positionDemand.multiplier;

        // Apply seasonal demand adjustments
        const seasonalMultiplier = this.getSeasonalDemand(sport);
        adjustedValue *= seasonalMultiplier;

        // Apply regional market demand
        const regionalDemand = this.assessRegionalDemand(athleteData);
        adjustedValue *= regionalDemand;

        return adjustedValue;
    }

    getSeasonalDemand(sport) {
        const currentMonth = new Date().getMonth();

        switch (sport.toLowerCase()) {
            case 'football':
                // Peak during season (Aug-Dec)
                return currentMonth >= 7 || currentMonth <= 11 ? 1.2 : 0.9;
            case 'basketball':
                // Peak during season (Nov-Mar)
                return currentMonth >= 10 || currentMonth <= 2 ? 1.15 : 0.95;
            case 'baseball':
                // Peak during season (Feb-Jun)
                return currentMonth >= 1 && currentMonth <= 5 ? 1.1 : 0.9;
            default:
                return 1.0;
        }
    }

    assessRegionalDemand(athleteData) {
        const school = athleteData.school?.toLowerCase();

        // SEC schools get regional premium
        const secSchools = Object.keys(this.secMarketData);
        if (secSchools.some(secSchool => school?.includes(secSchool))) {
            return 1.25; // 25% SEC premium
        }

        // Other major conferences
        const majorConferences = ['big10', 'big12', 'pac12', 'acc'];
        if (majorConferences.some(conf => school?.includes(conf))) {
            return 1.1; // 10% major conference premium
        }

        return 1.0; // No regional adjustment
    }

    applySECPremium(currentValue, athleteData) {
        const school = athleteData.school?.toLowerCase();

        // Find matching SEC school
        const secSchool = Object.keys(this.secMarketData).find(secSchool =>
            school?.includes(secSchool.toLowerCase())
        );

        if (secSchool) {
            const premiumData = this.secMarketData[secSchool];
            return currentValue * premiumData.premium;
        }

        return currentValue;
    }

    getSchoolMarketPower(school) {
        const schoolKey = school?.toLowerCase();

        // Check SEC schools first
        const secSchool = Object.keys(this.secMarketData).find(secSchool =>
            schoolKey?.includes(secSchool.toLowerCase())
        );

        if (secSchool) {
            const data = this.secMarketData[secSchool];
            return {
                multiplier: data.premium,
                fanbase: data.fanbase,
                mediaValue: data.mediaValue,
                tier: 'SEC Elite'
            };
        }

        // Default for other schools
        return {
            multiplier: 1.0,
            fanbase: 400000,
            mediaValue: 1.0,
            tier: 'Standard'
        };
    }

    calculatePositionRank(athleteData) {
        // Simplified position ranking based on market value
        const { position, sport } = athleteData;

        const rankings = {
            football: {
                quarterback: 1,
                wide_receiver: 2,
                running_back: 3,
                tight_end: 4,
                defensive_back: 5,
                linebacker: 6,
                defensive_line: 7,
                offensive_line: 8,
                kicker: 9,
                punter: 10
            },
            basketball: {
                point_guard: 1,
                shooting_guard: 2,
                small_forward: 3,
                power_forward: 4,
                center: 5
            }
        };

        const sportRankings = rankings[sport.toLowerCase()] || {};
        const positionKey = position.toLowerCase().replace(/\s+/g, '_');

        return sportRankings[positionKey] || 5;
    }

    calculateGrowthPotential(athleteData) {
        let potential = 0.5; // Base potential

        // Year in school impact
        const yearImpact = {
            'freshman': 0.9,
            'sophomore': 0.8,
            'junior': 0.6,
            'senior': 0.3,
            'graduate': 0.2
        };
        potential *= yearImpact[athleteData.year?.toLowerCase()] || 0.5;

        // Performance trend
        if (athleteData.performanceTrend === 'improving') potential += 0.3;
        else if (athleteData.performanceTrend === 'declining') potential -= 0.2;

        // Social media growth
        if (athleteData.socialMedia) {
            const avgGrowth = this.calculateAverageSocialGrowth(athleteData.socialMedia);
            potential += Math.min(avgGrowth / 20, 0.3); // Cap at 30% bonus
        }

        return Math.max(0.1, Math.min(potential, 1.0));
    }

    calculateAverageSocialGrowth(socialData) {
        let totalGrowth = 0;
        let platformCount = 0;

        Object.values(socialData).forEach(platform => {
            if (platform.monthlyGrowth !== undefined) {
                totalGrowth += platform.monthlyGrowth;
                platformCount++;
            }
        });

        return platformCount > 0 ? totalGrowth / platformCount : 0;
    }

    assessMarketRisk(athleteData) {
        let riskScore = 0.2; // Base risk

        // Performance consistency risk
        if (athleteData.performanceVariability) {
            riskScore += athleteData.performanceVariability * 0.3;
        }

        // Injury history risk
        if (athleteData.injuryHistory) {
            riskScore += athleteData.injuryHistory.length * 0.1;
        }

        // Character risk factors
        if (athleteData.characterAssessment) {
            const confidence = athleteData.characterAssessment.confidence || 0.8;
            riskScore += (1 - confidence) * 0.2;
        }

        // Academic risk
        if (athleteData.academicStanding && athleteData.academicStanding < 3.0) {
            riskScore += 0.15;
        }

        // Market volatility risk
        const positionVolatility = this.getPositionVolatility(athleteData.position);
        riskScore += positionVolatility * 0.1;

        return {
            overall_risk: Math.min(riskScore, 1.0),
            risk_level: this.categorizeRisk(riskScore),
            risk_factors: this.identifyRiskFactors(athleteData, riskScore)
        };
    }

    getPositionVolatility(position) {
        const volatility = {
            quarterback: 0.8, // High volatility
            running_back: 0.7,
            wide_receiver: 0.6,
            tight_end: 0.4,
            offensive_line: 0.3,
            defensive_line: 0.4,
            linebacker: 0.5,
            defensive_back: 0.6,
            kicker: 0.9, // Very volatile
            punter: 0.8
        };

        const positionKey = position.toLowerCase().replace(/\s+/g, '_');
        return volatility[positionKey] || 0.5;
    }

    categorizeRisk(riskScore) {
        if (riskScore < 0.3) return 'Low';
        if (riskScore < 0.6) return 'Moderate';
        return 'High';
    }

    identifyRiskFactors(athleteData, riskScore) {
        const factors = [];

        if (athleteData.performanceVariability > 0.3) {
            factors.push('High performance variability');
        }

        if (athleteData.injuryHistory && athleteData.injuryHistory.length > 2) {
            factors.push('Significant injury history');
        }

        if (athleteData.academicStanding && athleteData.academicStanding < 3.0) {
            factors.push('Academic standing concerns');
        }

        const positionVolatility = this.getPositionVolatility(athleteData.position);
        if (positionVolatility > 0.6) {
            factors.push('High position market volatility');
        }

        if (athleteData.characterAssessment?.confidence < 0.7) {
            factors.push('Character assessment uncertainty');
        }

        return factors;
    }

    calculateValuationConfidence(athleteData) {
        let confidence = 0.5; // Base confidence

        // Data completeness
        const dataFields = ['stats', 'socialMedia', 'teamRecord', 'characterAssessment'];
        const completeness = dataFields.filter(field => athleteData[field]).length / dataFields.length;
        confidence += completeness * 0.3;

        // Performance consistency
        if (athleteData.performanceVariability !== undefined) {
            confidence += (1 - athleteData.performanceVariability) * 0.2;
        }

        // Market data quality
        if (this.hasRecentMarketData(athleteData)) {
            confidence += 0.2;
        }

        // Character assessment confidence
        if (athleteData.characterAssessment?.confidence) {
            confidence += athleteData.characterAssessment.confidence * 0.1;
        }

        return Math.min(confidence, 1.0);
    }

    hasRecentMarketData(athleteData) {
        // Check if we have recent market data for the athlete's category
        const category = `${athleteData.sport}_${athleteData.position}`;
        return this.marketData.has(category);
    }

    determineValueTier(nilValue) {
        if (nilValue >= 1000000) return 'Elite (7-Figure)';
        if (nilValue >= 500000) return 'Premium (6-Figure High)';
        if (nilValue >= 250000) return 'High Value (6-Figure Mid)';
        if (nilValue >= 100000) return 'Above Average (6-Figure Low)';
        if (nilValue >= 50000) return 'Average (5-Figure High)';
        if (nilValue >= 25000) return 'Developing (5-Figure Mid)';
        if (nilValue >= 10000) return 'Entry Level (5-Figure Low)';
        return 'Minimal (4-Figure)';
    }

    generateRecommendations(athleteData, nilValue) {
        const recommendations = [];

        // Performance-based recommendations
        if (athleteData.stats && this.calculateStatsImpact(athleteData.stats, athleteData.sport) < 0.3) {
            recommendations.push({
                category: 'Athletic Performance',
                priority: 'High',
                recommendation: 'Focus on improving key performance metrics to increase market value',
                potential_impact: '15-30% value increase'
            });
        }

        // Social media recommendations
        if (!athleteData.socialMedia || Object.keys(athleteData.socialMedia).length < 3) {
            recommendations.push({
                category: 'Social Media Presence',
                priority: 'High',
                recommendation: 'Establish presence on Instagram, TikTok, and Twitter to maximize reach',
                potential_impact: '20-40% value increase'
            });
        }

        // Character development recommendations
        if (athleteData.characterAssessment?.championshipDNA?.overall_championship_dna < 0.8) {
            recommendations.push({
                category: 'Character Development',
                priority: 'Medium',
                recommendation: 'Focus on leadership development and championship mindset training',
                potential_impact: '10-20% value increase'
            });
        }

        // Market timing recommendations
        const seasonalDemand = this.getSeasonalDemand(athleteData.sport);
        if (seasonalDemand < 1.0) {
            recommendations.push({
                category: 'Market Timing',
                priority: 'Low',
                recommendation: 'Consider timing major announcements during peak season',
                potential_impact: '5-15% value increase'
            });
        }

        return recommendations;
    }

    // Market analysis methods
    analyzeMarketTrends() {
        // Analyze current market trends and update predictions
        const trends = {
            overall_growth: this.calculateOverallMarketGrowth(),
            position_trends: this.analyzePositionTrends(),
            regional_trends: this.analyzeRegionalTrends(),
            platform_trends: this.analyzePlatformTrends()
        };

        this.currentMarketTrends = trends;
        console.log('📈 Market trends updated:', trends);
    }

    calculateOverallMarketGrowth() {
        if (this.valuationHistory.length < 10) return 0;

        const recent = this.valuationHistory.slice(-10);
        const older = this.valuationHistory.slice(-20, -10);

        if (older.length === 0) return 0;

        const recentAvg = recent.reduce((sum, v) => sum + v.total_nil_value, 0) / recent.length;
        const olderAvg = older.reduce((sum, v) => sum + v.total_nil_value, 0) / older.length;

        return (recentAvg - olderAvg) / olderAvg;
    }

    analyzePositionTrends() {
        // Analyze trends by position
        const positionData = {};

        this.valuationHistory.forEach(valuation => {
            const position = valuation.athlete_id; // Simplified
            if (!positionData[position]) {
                positionData[position] = [];
            }
            positionData[position].push(valuation.total_nil_value);
        });

        return positionData;
    }

    analyzeRegionalTrends() {
        // Analyze SEC vs other conferences
        return {
            sec_premium: 1.25,
            sec_growth: 0.15,
            national_growth: 0.08
        };
    }

    analyzePlatformTrends() {
        // Analyze social media platform trends
        return {
            instagram: { growth: 0.05, importance: 0.35 },
            tiktok: { growth: 0.12, importance: 0.30 },
            twitter: { growth: -0.02, importance: 0.20 },
            youtube: { growth: 0.08, importance: 0.10 },
            linkedin: { growth: 0.15, importance: 0.05 }
        };
    }

    updateMarketPredictions() {
        // Update market predictions based on current trends
        this.marketPredictions = {
            six_month_outlook: this.predictSixMonthMarket(),
            yearly_outlook: this.predictYearlyMarket(),
            position_forecasts: this.forecastPositionMarkets(),
            risk_factors: this.identifyMarketRisks()
        };
    }

    predictSixMonthMarket() {
        const currentGrowth = this.calculateOverallMarketGrowth();
        return {
            expected_growth: currentGrowth * 0.6, // Moderate growth prediction
            confidence: 0.75,
            key_drivers: ['Social media expansion', 'SEC dominance', 'Playoff success']
        };
    }

    predictYearlyMarket() {
        const currentGrowth = this.calculateOverallMarketGrowth();
        return {
            expected_growth: currentGrowth * 1.2, // Annual growth prediction
            confidence: 0.65,
            key_drivers: ['Rule changes', 'Media rights', 'Platform evolution']
        };
    }

    forecastPositionMarkets() {
        return {
            quarterback: { growth: 0.15, volatility: 0.8 },
            wide_receiver: { growth: 0.12, volatility: 0.6 },
            running_back: { growth: 0.08, volatility: 0.7 },
            defensive_stars: { growth: 0.10, volatility: 0.5 }
        };
    }

    identifyMarketRisks() {
        return [
            'NCAA rule changes',
            'Economic downturn impact',
            'Platform algorithm changes',
            'Saturation in quarterback market',
            'Regional economic variations'
        ];
    }

    // Alert and monitoring methods
    checkValueAlerts(valuation) {
        const athleteId = valuation.athlete_id;

        // Check for significant value changes
        const previousValuation = this.findPreviousValuation(athleteId);
        if (previousValuation) {
            const changePercent = (valuation.total_nil_value - previousValuation.total_nil_value) / previousValuation.total_nil_value;

            if (Math.abs(changePercent) > this.alertSystem.valueChangeThreshold) {
                this.triggerValueAlert(athleteId, changePercent, valuation);
            }
        }

        // Check for risk level changes
        if (valuation.risk_assessment.risk_level === 'High') {
            this.triggerRiskAlert(athleteId, valuation.risk_assessment);
        }
    }

    findPreviousValuation(athleteId) {
        const athleteValueations = this.valuationHistory.filter(v => v.athlete_id === athleteId);
        return athleteValueations.length > 1 ? athleteValueations[athleteValueations.length - 2] : null;
    }

    triggerValueAlert(athleteId, changePercent, valuation) {
        const alert = {
            type: 'VALUE_CHANGE',
            athlete_id: athleteId,
            change_percent: changePercent,
            new_value: valuation.total_nil_value,
            timestamp: Date.now(),
            severity: Math.abs(changePercent) > 0.3 ? 'HIGH' : 'MEDIUM'
        };

        // Emit alert event
        window.dispatchEvent(new CustomEvent('nilValueAlert', { detail: alert }));
        console.log('🚨 NIL Value Alert:', alert);
    }

    triggerRiskAlert(athleteId, riskAssessment) {
        const alert = {
            type: 'RISK_ALERT',
            athlete_id: athleteId,
            risk_level: riskAssessment.risk_level,
            risk_factors: riskAssessment.risk_factors,
            timestamp: Date.now(),
            severity: 'HIGH'
        };

        // Emit alert event
        window.dispatchEvent(new CustomEvent('nilRiskAlert', { detail: alert }));
        console.log('⚠️ NIL Risk Alert:', alert);
    }

    // Social media monitoring
    updateSocialMetrics() {
        // Update social media metrics for all tracked athletes
        // This would integrate with social media APIs in production
        console.log('📱 Updating social media metrics...');
    }

    // Performance tracking
    updatePerformanceMetrics(valuation) {
        this.performanceMetrics.calculationTimes.push(valuation.processing_time);
        this.performanceMetrics.accuracyScores.push(valuation.confidence_score);

        // Keep only last 100 measurements
        if (this.performanceMetrics.calculationTimes.length > 100) {
            this.performanceMetrics.calculationTimes.shift();
            this.performanceMetrics.accuracyScores.shift();
        }
    }

    // API methods
    async batchCalculateNIL(athleteDataArray) {
        const results = [];

        for (const athleteData of athleteDataArray) {
            const valuation = await this.calculateNILValue(athleteData);
            results.push(valuation);
        }

        return {
            valuations: results,
            batch_summary: this.generateBatchSummary(results),
            timestamp: Date.now()
        };
    }

    generateBatchSummary(results) {
        const validResults = results.filter(r => !r.error);

        if (validResults.length === 0) return { error: 'No valid results' };

        const totalValue = validResults.reduce((sum, r) => sum + r.total_nil_value, 0);
        const avgValue = totalValue / validResults.length;
        const maxValue = Math.max(...validResults.map(r => r.total_nil_value));
        const minValue = Math.min(...validResults.map(r => r.total_nil_value));

        return {
            total_athletes: validResults.length,
            average_value: Math.round(avgValue),
            total_market_value: Math.round(totalValue),
            highest_value: maxValue,
            lowest_value: minValue,
            value_distribution: this.calculateValueDistribution(validResults)
        };
    }

    calculateValueDistribution(results) {
        const tiers = {
            'Elite (7-Figure)': 0,
            'Premium (6-Figure High)': 0,
            'High Value (6-Figure Mid)': 0,
            'Above Average (6-Figure Low)': 0,
            'Average (5-Figure High)': 0,
            'Developing (5-Figure Mid)': 0,
            'Entry Level (5-Figure Low)': 0,
            'Minimal (4-Figure)': 0
        };

        results.forEach(result => {
            const tier = result.value_tier;
            if (tiers[tier] !== undefined) {
                tiers[tier]++;
            }
        });

        return tiers;
    }

    getMarketInsights() {
        return {
            current_trends: this.currentMarketTrends,
            market_predictions: this.marketPredictions,
            sec_market_data: this.secMarketData,
            platform_performance: this.analyzePlatformTrends(),
            risk_factors: this.identifyMarketRisks()
        };
    }

    getPerformanceReport() {
        const avgCalcTime = this.performanceMetrics.calculationTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.calculationTimes.length || 0;
        const avgAccuracy = this.performanceMetrics.accuracyScores.reduce((a, b) => a + b, 0) / this.performanceMetrics.accuracyScores.length || 0;

        return {
            processing_performance: {
                average_calculation_time: avgCalcTime,
                target_time: 1000, // 1 second target
                status: avgCalcTime < 1000 ? 'MEETING_TARGET' : 'NEEDS_OPTIMIZATION'
            },
            accuracy: {
                average_confidence: avgAccuracy,
                target_confidence: 0.8,
                status: avgAccuracy > 0.8 ? 'MEETING_TARGET' : 'NEEDS_IMPROVEMENT'
            },
            total_valuations: this.valuationHistory.length,
            engine_status: this.isInitialized ? 'ACTIVE' : 'INACTIVE'
        };
    }

    getRecentValuations(count = 20) {
        return this.valuationHistory.slice(-count);
    }

    reset() {
        this.valuationHistory = [];
        this.marketData.clear();
        this.socialMetrics.clear();
        this.performanceMetrics = {
            calculationTimes: [],
            accuracyScores: [],
            marketPredictions: []
        };
    }

    destroy() {
        if (this.socialMediaMonitor) {
            clearInterval(this.socialMediaMonitor);
        }
        this.reset();
        this.isInitialized = false;
    }
}

// Global instance for easy access
window.NILValuationEngine = NILValuationEngine;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NILValuationEngine;
}

console.log('🏆 NIL Valuation Engine loaded - SEC Market Intelligence Ready');