/**
 * Blaze Intelligence Analytics API
 * Championship-level analytics data collection and processing
 */

exports.handler = async (event, context) => {
    const { httpMethod, body, headers } = event;

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    if (httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const analyticsData = JSON.parse(body);

        // Validate analytics data
        if (!analyticsData.sessionId || !analyticsData.events) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Invalid analytics data' })
            };
        }

        // Process analytics data
        const processedData = processAnalyticsData(analyticsData);

        // Log championship insights
        logChampionshipInsights(processedData);

        // Store analytics data (in a real implementation, this would go to a database)
        console.log('📊 Analytics data received:', {
            sessionId: analyticsData.sessionId,
            eventsCount: analyticsData.events.length,
            sessionDuration: analyticsData.sessionDuration,
            performance: analyticsData.performance,
            timestamp: analyticsData.timestamp
        });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                processed: processedData.eventsSummary,
                sessionId: analyticsData.sessionId
            })
        };

    } catch (error) {
        console.error('Analytics processing error:', error);

        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Internal server error',
                message: 'Unable to process analytics data'
            })
        };
    }
};

/**
 * Process and analyze incoming analytics data
 */
function processAnalyticsData(data) {
    const { events, performance, sessionDuration, sessionId } = data;

    // Categorize events
    const eventsByCategory = events.reduce((acc, event) => {
        if (!acc[event.category]) {
            acc[event.category] = [];
        }
        acc[event.category].push(event);
        return acc;
    }, {});

    // Calculate engagement score
    const engagementScore = calculateEngagementScore(events, sessionDuration);

    // Analyze user journey
    const userJourney = analyzeUserJourney(events);

    // Performance analysis
    const performanceAnalysis = analyzePerformance(performance);

    return {
        sessionId,
        eventsSummary: {
            total: events.length,
            byCategory: Object.keys(eventsByCategory).reduce((acc, cat) => {
                acc[cat] = eventsByCategory[cat].length;
                return acc;
            }, {}),
            engagementScore,
            userJourney,
            performanceAnalysis
        }
    };
}

/**
 * Calculate user engagement score
 */
function calculateEngagementScore(events, sessionDuration) {
    let score = 0;

    // Base score from session duration (max 40 points)
    score += Math.min(sessionDuration / 1000 / 60 * 10, 40); // 10 points per minute, max 4 minutes

    // Interaction events (max 30 points)
    const interactions = events.filter(e => e.category === 'interaction');
    score += Math.min(interactions.length * 5, 30);

    // Scroll depth (max 20 points)
    const scrollEvents = events.filter(e => e.category === 'engagement' && e.data.type === 'scroll_depth');
    const maxScrollDepth = Math.max(...scrollEvents.map(e => e.data.percent), 0);
    score += maxScrollDepth / 100 * 20;

    // Form interactions (max 10 points)
    const formEvents = events.filter(e => e.category === 'form');
    score += Math.min(formEvents.length * 10, 10);

    return Math.round(Math.min(score, 100));
}

/**
 * Analyze user journey and behavior patterns
 */
function analyzeUserJourney(events) {
    const pageEvents = events.filter(e => e.category === 'page');
    const interactions = events.filter(e => e.category === 'interaction');
    const conversions = events.filter(e => e.category === 'conversion');

    return {
        pagesVisited: pageEvents.length,
        interactions: interactions.length,
        conversionEvents: conversions.length,
        hasFormSubmission: events.some(e => e.category === 'form' && e.data.type === 'submit'),
        hasDemo Interest: events.some(e => e.category === 'conversion' && e.data.type === 'demo_interest'),
        hasPricingView: events.some(e => e.category === 'conversion' && e.data.type === 'pricing_view'),
        championshipSignals: identifyChampionshipSignals(events)
    };
}

/**
 * Identify championship signals in user behavior
 */
function identifyChampionshipSignals(events) {
    const signals = [];

    // High engagement patterns
    const sessionDuration = Math.max(...events.map(e => e.timeOnPage || 0));
    if (sessionDuration > 300000) { // 5+ minutes
        signals.push('extended-research');
    }

    // Deep content engagement
    const scrollEvents = events.filter(e => e.category === 'engagement' && e.data.type === 'scroll_depth');
    const maxScroll = Math.max(...scrollEvents.map(e => e.data.percent), 0);
    if (maxScroll >= 75) {
        signals.push('deep-content-engagement');
    }

    // Multiple page exploration
    const pageViews = events.filter(e => e.category === 'page').length;
    if (pageViews >= 3) {
        signals.push('multi-page-exploration');
    }

    // Pricing awareness
    const pricingViews = events.filter(e => e.category === 'conversion' && e.data.type === 'pricing_view');
    if (pricingViews.length > 0) {
        signals.push('pricing-aware');
    }

    // Form engagement
    const formEvents = events.filter(e => e.category === 'form');
    if (formEvents.length > 0) {
        signals.push('form-engaged');
    }

    // Demo interest
    const demoInterest = events.filter(e => e.category === 'conversion' && e.data.type === 'demo_interest');
    if (demoInterest.length > 0) {
        signals.push('demo-interested');
    }

    return signals;
}

/**
 * Analyze performance metrics
 */
function analyzePerformance(performance) {
    const analysis = {
        pageLoadGrade: 'unknown',
        webVitalsGrade: 'unknown',
        issues: []
    };

    // Page load time analysis
    if (performance.pageLoadTime) {
        if (performance.pageLoadTime < 2000) {
            analysis.pageLoadGrade = 'excellent';
        } else if (performance.pageLoadTime < 3000) {
            analysis.pageLoadGrade = 'good';
        } else if (performance.pageLoadTime < 5000) {
            analysis.pageLoadGrade = 'fair';
        } else {
            analysis.pageLoadGrade = 'poor';
            analysis.issues.push('slow-page-load');
        }
    }

    // Web Vitals analysis
    let vitalsScore = 0;
    let vitalsMetrics = 0;

    if (performance.largestContentfulPaint) {
        const lcp = performance.largestContentfulPaint;
        if (lcp < 2500) vitalsScore += 100;
        else if (lcp < 4000) vitalsScore += 60;
        else {
            vitalsScore += 20;
            analysis.issues.push('poor-lcp');
        }
        vitalsMetrics++;
    }

    if (performance.cumulativeLayoutShift >= 0) {
        const cls = performance.cumulativeLayoutShift;
        if (cls < 0.1) vitalsScore += 100;
        else if (cls < 0.25) vitalsScore += 60;
        else {
            vitalsScore += 20;
            analysis.issues.push('layout-shift');
        }
        vitalsMetrics++;
    }

    if (performance.firstInputDelay) {
        const fid = performance.firstInputDelay;
        if (fid < 100) vitalsScore += 100;
        else if (fid < 300) vitalsScore += 60;
        else {
            vitalsScore += 20;
            analysis.issues.push('input-delay');
        }
        vitalsMetrics++;
    }

    if (vitalsMetrics > 0) {
        const avgScore = vitalsScore / vitalsMetrics;
        if (avgScore >= 90) analysis.webVitalsGrade = 'excellent';
        else if (avgScore >= 70) analysis.webVitalsGrade = 'good';
        else if (avgScore >= 50) analysis.webVitalsGrade = 'fair';
        else analysis.webVitalsGrade = 'poor';
    }

    return analysis;
}

/**
 * Log championship insights from analytics data
 */
function logChampionshipInsights(processedData) {
    const { eventsSummary } = processedData;

    // Log high-engagement sessions
    if (eventsSummary.engagementScore >= 80) {
        console.log('🏆 Championship engagement detected:', {
            sessionId: processedData.sessionId,
            engagementScore: eventsSummary.engagementScore,
            championshipSignals: eventsSummary.userJourney.championshipSignals
        });
    }

    // Log conversion-ready signals
    if (eventsSummary.userJourney.hasDemo Interest || eventsSummary.userJourney.hasPricingView) {
        console.log('🎯 Conversion signals detected:', {
            sessionId: processedData.sessionId,
            hasDemoInterest: eventsSummary.userJourney.hasDemoInterest,
            hasPricingView: eventsSummary.userJourney.hasPricingView,
            hasFormSubmission: eventsSummary.userJourney.hasFormSubmission
        });
    }

    // Log performance issues
    if (eventsSummary.performanceAnalysis.issues.length > 0) {
        console.warn('⚠️ Performance issues detected:', {
            sessionId: processedData.sessionId,
            issues: eventsSummary.performanceAnalysis.issues,
            pageLoadGrade: eventsSummary.performanceAnalysis.pageLoadGrade,
            webVitalsGrade: eventsSummary.performanceAnalysis.webVitalsGrade
        });
    }
}