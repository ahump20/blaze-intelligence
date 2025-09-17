/**
 * Blaze Intelligence - NIL Valuation Intelligence System
 * Market-driven athlete valuation with championship-level precision
 * Includes social media analytics, performance metrics, and market trends
 */

class NILValuationIntelligence {
    constructor(options = {}) {
        this.config = {
            apiEndpoint: options.apiEndpoint || this.getAPIEndpoint(),
            updateInterval: options.updateInterval || 30000, // 30 seconds
            marketDataSources: options.sources || [
                'social_media',
                'performance_metrics',
                'market_trends',
                'demographic_analysis',
                'brand_partnerships'
            ],
            valuationModels: options.models || [
                'baseline_market',
                'performance_weighted',
                'social_influence',
                'projected_earnings',
                'championship_potential'
            ],
            ...options
        };

        this.athletes = new Map();
        this.marketData = new Map();
        this.valuationHistory = new Map();
        this.subscribers = new Map();

        // NIL Market Intelligence
        this.marketFactors = {
            social_media: {
                weight: 0.35,
                metrics: [
                    'follower_count',
                    'engagement_rate',
                    'content_quality',
                    'brand_safety',
                    'audience_demographics'
                ]
            },
            performance: {
                weight: 0.30,
                metrics: [
                    'statistical_performance',
                    'team_success',
                    'individual_awards',
                    'championship_contributions',
                    'clutch_performance'
                ]
            },
            market_position: {
                weight: 0.20,
                metrics: [
                    'sport_popularity',
                    'regional_market_size',
                    'competitive_landscape',
                    'seasonal_timing',
                    'media_coverage'
                ]
            },
            character_brand: {
                weight: 0.15,
                metrics: [
                    'leadership_qualities',
                    'community_involvement',
                    'brand_alignment',
                    'controversy_risk',
                    'authenticity_score'
                ]
            }
        };

        // Championship-tier NIL valuations (example ranges)
        this.benchmarkRanges = {
            'elite_football': { min: 50000, max: 2000000, avg: 250000 },
            'elite_basketball': { min: 30000, max: 1500000, avg: 180000 },
            'elite_baseball': { min: 15000, max: 800000, avg: 85000 },
            'rising_star': { min: 5000, max: 150000, avg: 25000 },
            'regional_talent': { min: 1000, max: 50000, avg: 8000 },
            'emerging_prospect': { min: 500, max: 15000, avg: 3000 }
        };

        this.init();
    }

    async init() {
        console.log('💰 Initializing NIL Valuation Intelligence System...');

        try {
            // Load market data and athlete profiles
            await this.loadMarketBaselines();

            // Initialize real-time tracking
            this.startMarketTracking();

            // Setup prediction models
            this.initializePredictionModels();

            console.log('✅ NIL Valuation Intelligence ready for championship analysis');

        } catch (error) {
            console.error('❌ Failed to initialize NIL system:', error);
        }
    }

    getAPIEndpoint() {
        const hostname = window.location.hostname;
        if (hostname.includes('netlify.app') || hostname.includes('blaze-intelligence')) {
            return 'https://blaze-intelligence-mcp.onrender.com';
        }
        return 'http://localhost:3005';
    }

    async loadMarketBaselines() {
        // Load current market baselines for different sports and tiers
        const marketData = {
            sports: {
                football: {
                    tier_multipliers: { qb: 1.8, skill_position: 1.3, lineman: 0.8 },
                    conference_multipliers: { sec: 1.5, big_ten: 1.3, acc: 1.2, big_12: 1.4 },
                    season_performance_weight: 0.4
                },
                basketball: {
                    tier_multipliers: { guard: 1.2, forward: 1.1, center: 0.9 },
                    conference_multipliers: { sec: 1.4, acc: 1.3, big_ten: 1.2, big_12: 1.3 },
                    season_performance_weight: 0.5
                },
                baseball: {
                    tier_multipliers: { pitcher: 1.3, position_player: 1.0 },
                    conference_multipliers: { sec: 1.6, acc: 1.2, big_12: 1.3 },
                    season_performance_weight: 0.3
                }
            },
            market_trends: {
                social_media_growth: 0.15, // 15% year-over-year
                nil_market_expansion: 0.25, // 25% market growth
                brand_partnership_demand: 0.30 // 30% increase in partnerships
            },
            regional_factors: {
                texas: { multiplier: 1.4, market_size: 'large' },
                sec_footprint: { multiplier: 1.3, market_size: 'large' },
                california: { multiplier: 1.2, market_size: 'large' },
                northeast: { multiplier: 1.1, market_size: 'medium' }
            }
        };

        this.marketData.set('baselines', marketData);
        console.log('📊 Market baselines loaded for championship NIL analysis');
    }

    async calculateNILValuation(athleteProfile) {
        console.log('💰 Calculating NIL valuation for:', athleteProfile.name);

        try {
            const valuation = {
                athlete_id: athleteProfile.id,
                name: athleteProfile.name,
                sport: athleteProfile.sport,
                position: athleteProfile.position,
                school: athleteProfile.school,
                timestamp: Date.now()
            };

            // 1. Baseline Market Value
            const baselineValue = this.calculateBaselineValue(athleteProfile);

            // 2. Social Media Influence Score
            const socialInfluence = this.calculateSocialInfluence(athleteProfile.social);

            // 3. Performance Metrics Multiplier
            const performanceMultiplier = this.calculatePerformanceMultiplier(athleteProfile.stats);

            // 4. Market Position Factor
            const marketPosition = this.calculateMarketPosition(athleteProfile);

            // 5. Character & Brand Safety Score
            const characterScore = this.calculateCharacterBrandValue(athleteProfile.character);

            // Combine all factors using weighted model
            const rawValuation = baselineValue *
                (1 + socialInfluence * this.marketFactors.social_media.weight) *
                (1 + performanceMultiplier * this.marketFactors.performance.weight) *
                (1 + marketPosition * this.marketFactors.market_position.weight) *
                (1 + characterScore * this.marketFactors.character_brand.weight);

            // Apply championship potential bonus
            const championshipBonus = this.calculateChampionshipPotential(athleteProfile);
            const finalValuation = Math.round(rawValuation * (1 + championshipBonus));

            valuation.breakdown = {
                baseline_value: Math.round(baselineValue),
                social_influence: Math.round(socialInfluence * 100),
                performance_multiplier: Math.round(performanceMultiplier * 100),
                market_position: Math.round(marketPosition * 100),
                character_score: Math.round(characterScore * 100),
                championship_bonus: Math.round(championshipBonus * 100)
            };

            valuation.estimated_value = finalValuation;
            valuation.value_range = {
                low: Math.round(finalValuation * 0.7),
                high: Math.round(finalValuation * 1.4),
                confidence: this.calculateConfidence(athleteProfile)
            };

            valuation.market_tier = this.determineMarketTier(finalValuation);
            valuation.recommendation = this.generateRecommendation(valuation);

            // Store valuation history
            this.storeValuationHistory(valuation);

            console.log(`💰 NIL Valuation complete: $${finalValuation.toLocaleString()}`);
            return valuation;

        } catch (error) {
            console.error('❌ NIL valuation calculation failed:', error);
            throw error;
        }
    }

    calculateBaselineValue(profile) {
        const sport = profile.sport.toLowerCase();
        const position = profile.position?.toLowerCase() || '';
        const school = profile.school?.toLowerCase() || '';

        // Get sport baseline
        let baseline = 25000; // Default baseline

        if (sport === 'football') {
            baseline = 45000;
            if (position.includes('qb') || position.includes('quarterback')) baseline *= 1.8;
            else if (position.includes('rb') || position.includes('wr') || position.includes('te')) baseline *= 1.3;
        } else if (sport === 'basketball') {
            baseline = 35000;
            if (position.includes('guard')) baseline *= 1.2;
        } else if (sport === 'baseball') {
            baseline = 20000;
            if (position.includes('pitcher')) baseline *= 1.3;
        }

        // Apply conference/school multipliers
        if (school.includes('texas') || school.includes('longhorn')) baseline *= 1.4;
        else if (school.includes('alabama') || school.includes('georgia') || school.includes('lsu')) baseline *= 1.5;
        else if (school.includes('ohio state') || school.includes('michigan')) baseline *= 1.3;

        return baseline;
    }

    calculateSocialInfluence(socialData) {
        if (!socialData) return 0;

        let influence = 0;
        const followers = socialData.total_followers || 0;
        const engagement = socialData.engagement_rate || 0;

        // Follower count influence (logarithmic scale)
        if (followers > 1000000) influence += 0.8;
        else if (followers > 500000) influence += 0.6;
        else if (followers > 100000) influence += 0.4;
        else if (followers > 50000) influence += 0.2;
        else if (followers > 10000) influence += 0.1;

        // Engagement rate multiplier
        if (engagement > 0.05) influence *= 1.5; // >5% engagement
        else if (engagement > 0.03) influence *= 1.2; // >3% engagement

        // Content quality and brand safety adjustments
        if (socialData.content_quality === 'high') influence *= 1.2;
        if (socialData.brand_safety === 'excellent') influence *= 1.1;

        return Math.min(influence, 1.0); // Cap at 100%
    }

    calculatePerformanceMultiplier(stats) {
        if (!stats) return 0;

        let multiplier = 0;

        // Statistical performance
        if (stats.percentile_rank > 90) multiplier += 0.5;
        else if (stats.percentile_rank > 75) multiplier += 0.3;
        else if (stats.percentile_rank > 50) multiplier += 0.1;

        // Team success
        if (stats.team_wins > 10) multiplier += 0.2;
        if (stats.postseason_appearances > 0) multiplier += 0.3;
        if (stats.championships > 0) multiplier += 0.5;

        // Individual accolades
        if (stats.all_american) multiplier += 0.4;
        if (stats.conference_honors) multiplier += 0.2;
        if (stats.national_awards) multiplier += 0.6;

        // Clutch performance in big games
        if (stats.big_game_performance > 0.8) multiplier += 0.3;

        return Math.min(multiplier, 1.0);
    }

    calculateMarketPosition(profile) {
        let position = 0;

        // Sport popularity in current market
        const sport = profile.sport.toLowerCase();
        if (sport === 'football') position += 0.4;
        else if (sport === 'basketball') position += 0.3;
        else if (sport === 'baseball') position += 0.2;

        // Regional market factors
        const region = profile.region?.toLowerCase() || '';
        if (region.includes('texas') || region.includes('southeast')) position += 0.3;
        else if (region.includes('california') || region.includes('northeast')) position += 0.2;

        // Media market size
        if (profile.media_market === 'large') position += 0.2;
        else if (profile.media_market === 'medium') position += 0.1;

        // Timing factors (in-season vs off-season)
        const currentMonth = new Date().getMonth();
        if (sport === 'football' && currentMonth >= 8 && currentMonth <= 12) position += 0.1;
        else if (sport === 'basketball' && currentMonth >= 10 && currentMonth <= 3) position += 0.1;
        else if (sport === 'baseball' && currentMonth >= 2 && currentMonth <= 6) position += 0.1;

        return Math.min(position, 1.0);
    }

    calculateCharacterBrandValue(characterData) {
        if (!characterData) return 0;

        let value = 0;

        // Character assessment scores (from our character engine)
        if (characterData.leadership > 80) value += 0.3;
        if (characterData.grit > 80) value += 0.2;
        if (characterData.coachability > 80) value += 0.2;

        // Community involvement
        if (characterData.community_score > 0.8) value += 0.2;

        // Brand safety factors
        if (characterData.controversy_risk < 0.2) value += 0.1;
        if (characterData.authenticity_score > 0.8) value += 0.1;

        return Math.min(value, 1.0);
    }

    calculateChampionshipPotential(profile) {
        let potential = 0;

        // Team championship prospects
        if (profile.team_ranking <= 5) potential += 0.3;
        else if (profile.team_ranking <= 15) potential += 0.2;
        else if (profile.team_ranking <= 25) potential += 0.1;

        // Individual championship potential
        if (profile.draft_projection === 'first_round') potential += 0.4;
        else if (profile.draft_projection === 'early_round') potential += 0.2;

        // Historical championship performance
        if (profile.postseason_performance > 0.8) potential += 0.2;

        return Math.min(potential, 0.5); // Cap championship bonus at 50%
    }

    calculateConfidence(profile) {
        let confidence = 0.5; // Base confidence

        // Data completeness
        if (profile.social) confidence += 0.1;
        if (profile.stats) confidence += 0.2;
        if (profile.character) confidence += 0.1;
        if (profile.team_data) confidence += 0.1;

        // Historical data availability
        if (profile.seasons_of_data >= 2) confidence += 0.1;

        return Math.min(confidence, 0.95); // Max 95% confidence
    }

    determineMarketTier(valuation) {
        if (valuation >= 500000) return 'elite_national';
        else if (valuation >= 200000) return 'high_major';
        else if (valuation >= 75000) return 'regional_star';
        else if (valuation >= 25000) return 'rising_prospect';
        else if (valuation >= 10000) return 'emerging_talent';
        else return 'developmental';
    }

    generateRecommendation(valuation) {
        const tier = valuation.market_tier;
        const value = valuation.estimated_value;
        const confidence = valuation.value_range.confidence;

        let recommendation = {
            strategy: '',
            focus_areas: [],
            partnership_types: [],
            timeline: '',
            risk_factors: []
        };

        switch (tier) {
            case 'elite_national':
                recommendation.strategy = 'Premium brand partnerships with national reach';
                recommendation.focus_areas = ['national media', 'major brands', 'championship performance'];
                recommendation.partnership_types = ['national sponsors', 'media deals', 'signature products'];
                recommendation.timeline = 'Immediate activation recommended';
                break;

            case 'high_major':
                recommendation.strategy = 'Regional leadership with national growth potential';
                recommendation.focus_areas = ['regional dominance', 'social media growth', 'performance consistency'];
                recommendation.partnership_types = ['regional brands', 'local businesses', 'emerging sponsors'];
                recommendation.timeline = '3-6 month development cycle';
                break;

            case 'regional_star':
                recommendation.strategy = 'Local market leadership development';
                recommendation.focus_areas = ['local community', 'social engagement', 'performance improvement'];
                recommendation.partnership_types = ['local businesses', 'community organizations', 'fan engagement'];
                recommendation.timeline = '6-12 month growth plan';
                break;

            default:
                recommendation.strategy = 'Foundation building and growth preparation';
                recommendation.focus_areas = ['social media development', 'performance improvement', 'brand building'];
                recommendation.partnership_types = ['micro-partnerships', 'community involvement', 'skill development'];
                recommendation.timeline = '12+ month development cycle';
        }

        // Add risk factors based on confidence
        if (confidence < 0.7) {
            recommendation.risk_factors.push('Limited historical data');
        }
        if (valuation.breakdown.character_score < 70) {
            recommendation.risk_factors.push('Character/brand risk considerations');
        }

        return recommendation;
    }

    storeValuationHistory(valuation) {
        const athleteId = valuation.athlete_id;

        if (!this.valuationHistory.has(athleteId)) {
            this.valuationHistory.set(athleteId, []);
        }

        const history = this.valuationHistory.get(athleteId);
        history.push(valuation);

        // Keep only last 50 valuations per athlete
        if (history.length > 50) {
            history.shift();
        }

        this.emit('valuation-updated', valuation);
    }

    // Market tracking and real-time updates
    startMarketTracking() {
        setInterval(() => {
            this.updateMarketTrends();
        }, this.config.updateInterval);

        console.log('📈 NIL market tracking started - updating every 30 seconds');
    }

    updateMarketTrends() {
        // Simulate market trend updates
        const trends = {
            social_media_growth: 0.15 + (Math.random() - 0.5) * 0.05,
            nil_market_expansion: 0.25 + (Math.random() - 0.5) * 0.1,
            brand_partnership_demand: 0.30 + (Math.random() - 0.5) * 0.08,
            timestamp: Date.now()
        };

        this.marketData.set('current_trends', trends);
        this.emit('market-trends-updated', trends);
    }

    // Comparative analysis
    async compareAthletes(athleteIds) {
        const valuations = [];

        for (const id of athleteIds) {
            const athlete = this.athletes.get(id);
            if (athlete) {
                const valuation = await this.calculateNILValuation(athlete);
                valuations.push(valuation);
            }
        }

        valuations.sort((a, b) => b.estimated_value - a.estimated_value);

        return {
            comparison: valuations,
            insights: this.generateComparisonInsights(valuations),
            timestamp: Date.now()
        };
    }

    generateComparisonInsights(valuations) {
        if (valuations.length < 2) return [];

        const insights = [];
        const top = valuations[0];
        const others = valuations.slice(1);

        // Value gaps
        const valueGap = top.estimated_value - others[0].estimated_value;
        if (valueGap > 100000) {
            insights.push(`${top.name} commands a significant premium of $${valueGap.toLocaleString()} over second-tier athletes`);
        }

        // Performance vs social media correlation
        const socialLeader = valuations.reduce((prev, current) =>
            prev.breakdown.social_influence > current.breakdown.social_influence ? prev : current
        );
        const performanceLeader = valuations.reduce((prev, current) =>
            prev.breakdown.performance_multiplier > current.breakdown.performance_multiplier ? prev : current
        );

        if (socialLeader.name !== performanceLeader.name) {
            insights.push(`Social media leader (${socialLeader.name}) differs from performance leader (${performanceLeader.name})`);
        }

        return insights;
    }

    // UI Dashboard Creation
    createNILDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="nil-dashboard">
                <div class="dashboard-header">
                    <h2>💰 NIL Valuation Intelligence</h2>
                    <div class="market-status">
                        <span class="status-indicator active"></span>
                        <span>Market Analysis Active</span>
                    </div>
                </div>

                <div class="valuation-input">
                    <h3>Athlete Valuation Calculator</h3>
                    <form id="nil-calculator-form">
                        <div class="form-row">
                            <input type="text" id="athlete-name" placeholder="Athlete Name" required>
                            <select id="athlete-sport" required>
                                <option value="">Select Sport</option>
                                <option value="football">Football</option>
                                <option value="basketball">Basketball</option>
                                <option value="baseball">Baseball</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <input type="text" id="athlete-position" placeholder="Position">
                            <input type="text" id="athlete-school" placeholder="School/University">
                        </div>
                        <div class="form-row">
                            <input type="number" id="social-followers" placeholder="Total Social Followers">
                            <input type="number" id="performance-percentile" placeholder="Performance Percentile (0-100)">
                        </div>
                        <button type="submit" class="calculate-btn">Calculate NIL Value</button>
                    </form>
                </div>

                <div id="valuation-results" class="valuation-results" style="display: none;">
                    <!-- Results will be populated here -->
                </div>

                <div class="market-trends">
                    <h3>📈 Current Market Trends</h3>
                    <div class="trends-grid">
                        <div class="trend-card">
                            <span class="trend-label">Social Media Growth</span>
                            <span class="trend-value">+15.2%</span>
                        </div>
                        <div class="trend-card">
                            <span class="trend-label">NIL Market Expansion</span>
                            <span class="trend-value">+24.8%</span>
                        </div>
                        <div class="trend-card">
                            <span class="trend-label">Brand Partnership Demand</span>
                            <span class="trend-value">+29.6%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachDashboardHandlers();
    }

    attachDashboardHandlers() {
        const form = document.getElementById('nil-calculator-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const athleteProfile = {
                id: Date.now(),
                name: formData.get('athlete-name'),
                sport: formData.get('athlete-sport'),
                position: formData.get('athlete-position'),
                school: formData.get('athlete-school'),
                social: {
                    total_followers: parseInt(formData.get('social-followers')) || 0,
                    engagement_rate: 0.035, // Default 3.5%
                    content_quality: 'medium',
                    brand_safety: 'good'
                },
                stats: {
                    percentile_rank: parseInt(formData.get('performance-percentile')) || 50,
                    team_wins: 8, // Default
                    big_game_performance: 0.75 // Default
                },
                character: {
                    leadership: 75,
                    grit: 80,
                    coachability: 85,
                    authenticity_score: 0.8
                },
                region: 'texas', // Default
                media_market: 'large'
            };

            try {
                const valuation = await this.calculateNILValuation(athleteProfile);
                this.displayValuationResults(valuation);
            } catch (error) {
                console.error('Valuation calculation failed:', error);
            }
        });
    }

    displayValuationResults(valuation) {
        const container = document.getElementById('valuation-results');
        if (!container) return;

        container.innerHTML = `
            <h3>💰 NIL Valuation Results</h3>
            <div class="valuation-summary">
                <div class="main-value">
                    <span class="currency">$</span>
                    <span class="amount">${valuation.estimated_value.toLocaleString()}</span>
                    <span class="period">Annual Potential</span>
                </div>
                <div class="value-range">
                    Range: $${valuation.value_range.low.toLocaleString()} - $${valuation.value_range.high.toLocaleString()}
                    <span class="confidence">(${Math.round(valuation.value_range.confidence * 100)}% confidence)</span>
                </div>
            </div>

            <div class="breakdown-analysis">
                <h4>Valuation Breakdown</h4>
                <div class="breakdown-items">
                    <div class="breakdown-item">
                        <span class="factor">Baseline Market Value</span>
                        <span class="value">$${valuation.breakdown.baseline_value.toLocaleString()}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="factor">Social Media Influence</span>
                        <span class="value">+${valuation.breakdown.social_influence}%</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="factor">Performance Multiplier</span>
                        <span class="value">+${valuation.breakdown.performance_multiplier}%</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="factor">Market Position</span>
                        <span class="value">+${valuation.breakdown.market_position}%</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="factor">Character & Brand</span>
                        <span class="value">+${valuation.breakdown.character_score}%</span>
                    </div>
                    <div class="breakdown-item championship">
                        <span class="factor">Championship Bonus</span>
                        <span class="value">+${valuation.breakdown.championship_bonus}%</span>
                    </div>
                </div>
            </div>

            <div class="recommendation">
                <h4>🎯 Strategic Recommendations</h4>
                <div class="strategy">${valuation.recommendation.strategy}</div>
                <div class="focus-areas">
                    <strong>Focus Areas:</strong> ${valuation.recommendation.focus_areas.join(', ')}
                </div>
                <div class="timeline">
                    <strong>Timeline:</strong> ${valuation.recommendation.timeline}
                </div>
            </div>
        `;

        container.style.display = 'block';
    }

    // Event system
    on(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        this.subscribers.get(event).add(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        this.subscribers.get(event)?.delete(callback);
    }

    emit(event, data) {
        const callbacks = this.subscribers.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in ${event} callback:`, error);
                }
            });
        }
    }

    // Public API
    getMarketTrends() {
        return this.marketData.get('current_trends');
    }

    getAthleteValuation(athleteId) {
        const history = this.valuationHistory.get(athleteId);
        return history ? history[history.length - 1] : null;
    }

    getValuationHistory(athleteId) {
        return this.valuationHistory.get(athleteId) || [];
    }
}

// Global instance
window.NILValuationIntelligence = NILValuationIntelligence;

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.blazeNILIntelligence = new NILValuationIntelligence();

    // Expose for global use
    window.calculateNILValue = (profile) => window.blazeNILIntelligence.calculateNILValuation(profile);
    window.createNILDashboard = (containerId) => window.blazeNILIntelligence.createNILDashboard(containerId);
    window.getNILMarketTrends = () => window.blazeNILIntelligence.getMarketTrends();
}

export default NILValuationIntelligence;