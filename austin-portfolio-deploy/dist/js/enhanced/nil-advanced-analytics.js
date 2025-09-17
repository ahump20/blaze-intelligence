// NIL Advanced Analytics and Historical Analysis
class NILAdvancedAnalytics {
    constructor() {
        this.historicalData = new Map();
        this.trendAnalysis = null;
        this.peerAnalytics = null;
        this.performanceModeling = null;
        this.init();
    }

    init() {
        this.initializeHistoricalAnalysis();
        this.setupPerformanceModeling();
        this.bindAdvancedEvents();
    }

    initializeHistoricalAnalysis() {
        // Simulate historical NIL data trends
        this.historicalData.set('market_growth', {
            '2021': { average_nil: 15000, growth_rate: 0 },
            '2022': { average_nil: 28000, growth_rate: 86.7 },
            '2023': { average_nil: 45000, growth_rate: 60.7 },
            '2024': { average_nil: 62000, growth_rate: 37.8 },
            '2025': { average_nil: 78000, growth_rate: 25.8 }
        });

        this.historicalData.set('sport_trends', {
            'football': { multiplier_2024: 1.5, predicted_2025: 1.6 },
            'basketball': { multiplier_2024: 1.3, predicted_2025: 1.4 },
            'baseball': { multiplier_2024: 1.0, predicted_2025: 1.1 }
        });

        this.historicalData.set('texas_market_data', {
            premium_factor: 1.25,
            sec_transition_impact: 1.15,
            austin_metro_bonus: 1.10,
            perfect_game_credibility: 0.10
        });
    }

    async generateTrendAnalysis(athleteData) {
        const sport = athleteData.sport;
        const level = athleteData.level;
        const region = athleteData.school?.toLowerCase().includes('texas') ? 'texas' : 'national';

        const marketGrowth = this.historicalData.get('market_growth');
        const sportTrends = this.historicalData.get('sport_trends')[sport] || { multiplier_2024: 1.0, predicted_2025: 1.1 };
        const texasData = this.historicalData.get('texas_market_data');

        // Calculate trend projections
        const currentYearProjection = marketGrowth['2025'].average_nil * sportTrends.predicted_2025;
        const nextYearProjection = currentYearProjection * 1.15; // Conservative growth estimate

        let regionalMultiplier = 1.0;
        if (region === 'texas') {
            regionalMultiplier = texasData.premium_factor * texasData.sec_transition_impact;
        }

        this.trendAnalysis = {
            current_market_value: Math.round(currentYearProjection * regionalMultiplier),
            projected_12_month: Math.round(nextYearProjection * regionalMultiplier),
            growth_potential: this.calculateGrowthPotential(athleteData, sportTrends, regionalMultiplier),
            market_position: this.assessMarketPosition(athleteData, currentYearProjection),
            risk_factors: this.identifyRiskFactors(athleteData, region),
            opportunity_timeline: this.generateOpportunityTimeline(athleteData, region),
            authority_insights: this.getAuthorityInsights(region, sport)
        };

        return this.trendAnalysis;
    }

    calculateGrowthPotential(athleteData, sportTrends, regionalMultiplier) {
        let growth_score = 50; // Base score

        // Age/experience factor
        if (athleteData.year === 'freshman' || athleteData.year === 'sophomore') {
            growth_score += 20;
        }

        // Performance trajectory
        if (athleteData.performance === 'elite' || athleteData.performance === 'excellent') {
            growth_score += 15;
        }

        // Social media momentum
        if (athleteData.engagement > 5) {
            growth_score += 10;
        }

        // Regional advantages
        if (regionalMultiplier > 1.2) {
            growth_score += 10;
        }

        // Sport-specific trends
        if (sportTrends.predicted_2025 > sportTrends.multiplier_2024) {
            growth_score += 5;
        }

        return Math.min(95, growth_score);
    }

    assessMarketPosition(athleteData, marketAverage) {
        const estimatedValue = this.estimateBasicValue(athleteData);
        const percentile = (estimatedValue / marketAverage) * 50; // Rough percentile estimation

        if (percentile > 90) return 'Elite (Top 10%)';
        if (percentile > 75) return 'Excellent (Top 25%)';
        if (percentile > 50) return 'Above Average (Top 50%)';
        if (percentile > 25) return 'Average (Top 75%)';
        return 'Developing (Bottom 25%)';
    }

    estimateBasicValue(athleteData) {
        const baseValues = { 'football': 25000, 'basketball': 20000, 'baseball': 12000 };
        const performanceMultipliers = { 'elite': 2.5, 'excellent': 2.0, 'above-average': 1.5, 'average': 1.0 };
        
        const base = baseValues[athleteData.sport] || 15000;
        const performance = performanceMultipliers[athleteData.performance] || 1.0;
        const social = Math.min(athleteData.followers * 0.20, 50000);
        
        return (base * performance) + social;
    }

    identifyRiskFactors(athleteData, region) {
        const risks = [];

        if (athleteData.followers > 500000 && athleteData.engagement < 2) {
            risks.push('Low engagement rate may indicate follower authenticity issues');
        }

        if (athleteData.sport === 'football' && region === 'texas') {
            risks.push('High competition in Texas football NIL market');
        }

        if (athleteData.level === 'd1' && !athleteData.awards) {
            risks.push('Limited performance track record for D1 level');
        }

        if (athleteData.engagement > 10) {
            risks.push('Unusually high engagement rate may indicate artificial inflation');
        }

        return risks;
    }

    generateOpportunityTimeline(athleteData, region) {
        const timeline = [];

        // Immediate opportunities (0-3 months)
        timeline.push({
            timeframe: 'Immediate (0-3 months)',
            opportunities: [
                'Local business partnerships',
                'Social media content creation',
                'Autograph signings and appearances'
            ]
        });

        // Short-term opportunities (3-12 months)
        const shortTerm = ['Regional brand endorsements', 'Community engagement programs'];
        if (region === 'texas') {
            shortTerm.push('Texas-based energy sector partnerships', 'Austin tech company collaborations');
        }
        timeline.push({
            timeframe: 'Short-term (3-12 months)',
            opportunities: shortTerm
        });

        // Long-term opportunities (1-3 years)
        const longTerm = ['National brand partnerships', 'Media and broadcasting opportunities'];
        if (athleteData.sport === 'football' && region === 'texas') {
            longTerm.push('SEC network feature opportunities', 'NFL draft preparation partnerships');
        }
        timeline.push({
            timeframe: 'Long-term (1-3 years)',
            opportunities: longTerm
        });

        return timeline;
    }

    getAuthorityInsights(region, sport) {
        const insights = {
            analyst: 'Austin Humphrey',
            credentials: 'Perfect Game Background, Texas Athletics Expertise',
            regional_expertise: region === 'texas' ? 'Deep Texas market knowledge and SEC transition insights' : 'National market analysis with regional specialization'
        };

        if (sport === 'baseball') {
            insights.sport_expertise = 'Perfect Game background provides unique insights into baseball talent evaluation and market positioning';
        }

        if (region === 'texas') {
            insights.market_advantage = 'Extensive Texas market relationships and SEC conference transition expertise provides competitive advantage in valuations';
        }

        return insights;
    }

    async generatePerformanceProjection(currentValuation, athleteData) {
        const trendAnalysis = await this.generateTrendAnalysis(athleteData);
        
        // Calculate projections based on multiple factors
        const projections = {
            six_months: this.projectValue(currentValuation, 0.5, trendAnalysis.growth_potential),
            twelve_months: this.projectValue(currentValuation, 1.0, trendAnalysis.growth_potential),
            twenty_four_months: this.projectValue(currentValuation, 2.0, trendAnalysis.growth_potential),
            confidence_factors: {
                data_quality: athleteData.followers > 10000 ? 'High' : 'Medium',
                market_stability: trendAnalysis.risk_factors.length < 2 ? 'Stable' : 'Volatile',
                performance_track_record: athleteData.awards > 2 ? 'Strong' : 'Developing'
            }
        };

        return projections;
    }

    projectValue(baseValue, yearsFuture, growthPotential) {
        const annualGrowthRate = (growthPotential / 100) * 0.3; // Conservative growth rate
        const projectedValue = baseValue * Math.pow(1 + annualGrowthRate, yearsFuture);
        
        return {
            estimated: Math.round(projectedValue),
            range: {
                conservative: Math.round(projectedValue * 0.8),
                optimistic: Math.round(projectedValue * 1.2)
            }
        };
    }

    displayAdvancedAnalytics(valuationData, athleteData) {
        this.generateTrendAnalysis(athleteData).then(trendAnalysis => {
            this.generatePerformanceProjection(valuationData.valuation.estimated_value, athleteData).then(projections => {
                this.renderAdvancedAnalyticsDisplay(trendAnalysis, projections);
            });
        });
    }

    renderAdvancedAnalyticsDisplay(trendAnalysis, projections) {
        let analyticsDiv = document.getElementById('advanced-analytics');
        if (!analyticsDiv) {
            analyticsDiv = document.createElement('div');
            analyticsDiv.id = 'advanced-analytics';
            analyticsDiv.style.cssText = 'background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 24px; margin-top: 24px;';
            
            const lastElement = document.querySelector('#market-trends') || document.querySelector('#peer-comparison') || document.querySelector('#ai-insights');
            if (lastElement) {
                lastElement.parentNode.insertBefore(analyticsDiv, lastElement.nextSibling);
            }
        }

        analyticsDiv.innerHTML = `
            <h3 style="color: var(--accent); margin-bottom: 16px;">📊 Advanced Analytics</h3>
            
            <!-- Performance Projections -->
            <div style="margin-bottom: 24px;">
                <h4 style="color: var(--ink); margin-bottom: 12px;">Performance Projections</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                    <div style="text-align: center; padding: 12px; background: rgba(191, 87, 0, 0.1); border-radius: 8px;">
                        <div style="color: var(--muted); font-size: 12px;">6 Months</div>
                        <div style="color: var(--accent); font-size: 16px; font-weight: 600;">$${projections.six_months.estimated.toLocaleString()}</div>
                        <div style="color: var(--muted); font-size: 10px;">${projections.six_months.range.conservative.toLocaleString()} - ${projections.six_months.range.optimistic.toLocaleString()}</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(191, 87, 0, 0.15); border-radius: 8px;">
                        <div style="color: var(--muted); font-size: 12px;">12 Months</div>
                        <div style="color: var(--accent); font-size: 16px; font-weight: 600;">$${projections.twelve_months.estimated.toLocaleString()}</div>
                        <div style="color: var(--muted); font-size: 10px;">${projections.twelve_months.range.conservative.toLocaleString()} - ${projections.twelve_months.range.optimistic.toLocaleString()}</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(191, 87, 0, 0.2); border-radius: 8px;">
                        <div style="color: var(--muted); font-size: 12px;">24 Months</div>
                        <div style="color: var(--accent); font-size: 16px; font-weight: 600;">$${projections.twenty_four_months.estimated.toLocaleString()}</div>
                        <div style="color: var(--muted); font-size: 10px;">${projections.twenty_four_months.range.conservative.toLocaleString()} - ${projections.twenty_four_months.range.optimistic.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <!-- Market Position -->
            <div style="margin-bottom: 24px;">
                <h4 style="color: var(--ink); margin-bottom: 12px;">Market Position & Growth</h4>
                <div style="margin-bottom: 8px;"><strong>Current Position:</strong> ${trendAnalysis.market_position}</div>
                <div style="margin-bottom: 8px;"><strong>Growth Potential:</strong> ${trendAnalysis.growth_potential}%</div>
                <div style="margin-bottom: 8px;"><strong>Market Trajectory:</strong> ${trendAnalysis.current_market_value < trendAnalysis.projected_12_month ? 'Upward' : 'Stable'}</div>
            </div>

            <!-- Opportunity Timeline -->
            <div style="margin-bottom: 24px;">
                <h4 style="color: var(--ink); margin-bottom: 12px;">Opportunity Timeline</h4>
                ${trendAnalysis.opportunity_timeline.map(phase => `
                    <div style="margin-bottom: 16px; padding: 12px; background: rgba(255, 255, 255, 0.02); border-radius: 8px;">
                        <div style="color: var(--accent); font-weight: 600; margin-bottom: 8px;">${phase.timeframe}</div>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${phase.opportunities.map(opp => `<li style="color: var(--muted); font-size: 14px; margin-bottom: 4px;">${opp}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>

            <!-- Risk Assessment -->
            ${trendAnalysis.risk_factors.length > 0 ? `
                <div style="margin-bottom: 24px;">
                    <h4 style="color: var(--ink); margin-bottom: 12px;">Risk Assessment</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${trendAnalysis.risk_factors.map(risk => `<li style="color: #F59E0B; font-size: 14px; margin-bottom: 4px;">${risk}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <!-- Authority Insights -->
            <div style="font-size: 12px; color: var(--muted); border-top: 1px solid var(--line); padding-top: 16px;">
                🎯 <strong>Expert Analysis:</strong> ${trendAnalysis.authority_insights.analyst} - ${trendAnalysis.authority_insights.regional_expertise}
            </div>
        `;
    }

    bindAdvancedEvents() {
        // Listen for calculation completion to trigger advanced analytics
        document.addEventListener('nilCalculationComplete', (event) => {
            if (event.detail && event.detail.valuationData && event.detail.athleteData) {
                this.displayAdvancedAnalytics(event.detail.valuationData, event.detail.athleteData);
            }
        });
    }
}

// Initialize advanced analytics
document.addEventListener('DOMContentLoaded', () => {
    window.nilAdvancedAnalytics = new NILAdvancedAnalytics();
});

export default NILAdvancedAnalytics;