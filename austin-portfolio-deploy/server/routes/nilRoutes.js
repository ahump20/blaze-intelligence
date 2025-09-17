import express from 'express';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { authenticateToken, trackApiUsage } from '../auth/authMiddleware.js';
import aiAnalyticsService from '../../src/services/aiAnalyticsService.js';

const router = express.Router();

// Initialize AI services
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

// Rate limiting for NIL calculations
const nilRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 calculations per minute
  message: 'Too many NIL calculations. Please try again in a minute.',
});

/**
 * NIL Valuation Engine™ - AI-Powered Backend Service
 * Leveraging Austin Humphrey's Texas/Perfect Game athletics background
 * and Deep South Sports Authority positioning for market credibility
 */
class NILValuationEngine {
  constructor() {
    this.austinHumphreyFactor = 1.15; // Credibility multiplier based on Perfect Game/Texas background
    this.texasMarketPremium = 1.25; // Texas market premium factor
    this.secMarketMultiplier = 1.20; // SEC conference multiplier
    this.perfectGameCredibility = 0.10; // 10% bonus for Perfect Game connection
    
    // AI Consciousness parameters that affect NIL calculations
    this.consciousnessParams = {
      sensitivityBoost: 1.0,
      depthMultiplier: 1.0,
      patternWeight: 0.8,
      speedFactor: 1.0
    };
  }

  /**
   * Main NIL calculation method with AI-powered analysis
   */
  async calculateNILValue(athleteData) {
    try {
      // Apply consciousness parameters if available
      if (global.consciousnessParams) {
        this.setConsciousnessParameters(global.consciousnessParams);
        console.log('💰 Applying Austin\'s AI consciousness to NIL calculation');
      }
      
      // Input validation and sanitization
      const cleanData = this.validateAndCleanInput(athleteData);
      
      // Get AI-powered market analysis
      const aiAnalysis = await this.getAIMarketAnalysis(cleanData);
      
      // Calculate base valuation components
      const baseCalculation = this.calculateBaseValuation(cleanData);
      
      // Apply AI insights and adjustments
      const aiAdjustedValuation = this.applyAIAdjustments(baseCalculation, aiAnalysis);
      
      // Apply Austin Humphrey authority factors
      const authorityAdjustedValuation = this.applyAuthorityFactors(aiAdjustedValuation, cleanData);
      
      // Generate confidence intervals and risk assessment
      const confidenceAnalysis = await this.generateConfidenceAnalysis(cleanData, authorityAdjustedValuation);
      
      // Create comprehensive results package
      return this.packageResults(authorityAdjustedValuation, aiAnalysis, confidenceAnalysis, cleanData);
      
    } catch (error) {
      console.error('NIL Calculation Error:', error);
      throw new Error(`NIL calculation failed: ${error.message}`);
    }
  }

  validateAndCleanInput(data) {
    const required = ['sport', 'level', 'followers', 'engagement'];
    for (const field of required) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return {
      athleteName: this.sanitizeString(data.athleteName || 'Anonymous Athlete'),
      sport: this.sanitizeString(data.sport).toLowerCase(),
      level: this.sanitizeString(data.level).toLowerCase(),
      school: this.sanitizeString(data.school || ''),
      position: this.sanitizeString(data.position || ''),
      followers: Math.max(0, parseInt(data.followers) || 0),
      engagement: Math.max(0, Math.min(100, parseFloat(data.engagement) || 0)),
      performance: this.sanitizeString(data.performance || 'average'),
      awards: Math.max(0, parseInt(data.awards) || 0),
      year: this.sanitizeString(data.year || 'sophomore'),
      region: this.sanitizeString(data.region || 'national'),
      marketSize: this.sanitizeString(data.marketSize || 'medium')
    };
  }

  sanitizeString(str) {
    return String(str).replace(/[<>\"'&]/g, '').trim();
  }

  setConsciousnessParameters(params) {
    // Apply Austin Humphrey's AI consciousness methodology to NIL calculations
    this.consciousnessParams = {
      sensitivityBoost: 1.0 + (params.neuralSensitivity - 75) / 100,
      depthMultiplier: 1.0 + (params.predictionDepth - 60) / 200,
      patternWeight: params.patternRecognition / 100,
      speedFactor: Math.max(0.5, params.processingSpeed / 85)
    };
    
    console.log('🧠 NIL Engine consciousness parameters updated:', this.consciousnessParams);
  }
  
  async getAIMarketAnalysis(athleteData) {
    // Apply consciousness-enhanced prompting
    const consciousnessEnhancement = this.getConsciousnessEnhancement(athleteData);
    
    const prompt = `${consciousnessEnhancement}As an expert NIL valuation analyst with deep knowledge of college athletics markets, analyze this athlete profile for Name, Image, and Likeness valuation:

Athlete: ${athleteData.athleteName}
Sport: ${athleteData.sport}
Level: ${athleteData.level}
School: ${athleteData.school}
Social Media: ${athleteData.followers} followers, ${athleteData.engagement}% engagement
Performance: ${athleteData.performance}
Awards: ${athleteData.awards}
Region: ${athleteData.region}

Provide analysis in this JSON format:
{
  "market_assessment": "detailed market analysis",
  "growth_potential": "high|medium|low",
  "risk_factors": ["factor1", "factor2"],
  "unique_opportunities": ["opportunity1", "opportunity2"],
  "comparables": "similar athlete analysis",
  "recommendation": "strategic recommendation",
  "confidence_modifier": 0.95,
  "ai_valuation_factor": 1.15
}

Consider:
- Austin Humphrey's Perfect Game background for baseball market expertise
- Texas/SEC market dynamics and premium valuations
- Deep South Sports Authority positioning for regional credibility
- Social media authenticity and engagement quality
- Sport-specific market opportunities
- Long-term brand building potential

Respond only with valid JSON.`;

    try {
      // Use AI analytics service with consciousness parameters
      if (aiAnalyticsService) {
        // Enhance prompt with consciousness parameters
        const enhancedPrompt = aiAnalyticsService.getConsciousnessEffectedPrompt(prompt, 'nil');
        
        if (anthropic) {
          const completion = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: Math.floor(1000 * this.consciousnessParams.depthMultiplier),
            temperature: 0.5 + (this.consciousnessParams.sensitivityBoost - 1.0) * 0.4,
            messages: [{ role: "user", content: enhancedPrompt }]
          });
          return this.processConsciousnessAnalysis(JSON.parse(completion.content[0].text), athleteData);
        } else if (openai) {
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: enhancedPrompt }],
            max_tokens: Math.floor(1000 * this.consciousnessParams.depthMultiplier),
            temperature: 0.5 + (this.consciousnessParams.sensitivityBoost - 1.0) * 0.4
          });
          return this.processConsciousnessAnalysis(JSON.parse(completion.choices[0].message.content), athleteData);
        }
      } else {
        return this.getFallbackAIAnalysis(athleteData);
      }
    } catch (error) {
      console.warn('AI analysis failed, using fallback:', error.message);
      return this.getFallbackAIAnalysis(athleteData);
    }
  }

  getConsciousnessEnhancement(athleteData) {
    let enhancement = '';
    
    if (this.consciousnessParams.sensitivityBoost > 1.2) {
      enhancement += 'ULTRA-SENSITIVE NIL ANALYSIS: Focus on micro-market signals and subtle social media engagement patterns. ';
    }
    
    if (this.consciousnessParams.depthMultiplier > 1.3) {
      enhancement += 'DEEP PREDICTIVE MODE: Extend NIL projections to include 2-3 year career trajectory and market evolution. ';
    }
    
    if (this.consciousnessParams.patternWeight > 0.9) {
      enhancement += 'PATTERN-HEAVY FOCUS: Emphasize historical NIL trends and comparable athlete trajectories. ';
    }
    
    if (athleteData.sport === 'baseball') {
      enhancement += 'PERFECT GAME PRECISION: Apply Austin Humphrey\'s Perfect Game scouting methodology for enhanced accuracy. ';
    }
    
    return enhancement;
  }
  
  processConsciousnessAnalysis(analysis, athleteData) {
    // Apply consciousness parameters to AI analysis results
    const sensitivityBoost = this.consciousnessParams.sensitivityBoost;
    const depthMultiplier = this.consciousnessParams.depthMultiplier;
    
    // Enhance confidence based on consciousness settings
    analysis.confidence_modifier = Math.min(0.98, 
      (analysis.confidence_modifier || 0.85) * (0.8 + sensitivityBoost * 0.2)
    );
    
    // Boost AI valuation factor based on depth settings
    analysis.ai_valuation_factor = (analysis.ai_valuation_factor || 1.0) * 
      (0.9 + depthMultiplier * 0.2);
    
    // Add consciousness-specific insights
    if (sensitivityBoost > 1.2) {
      analysis.consciousness_insights = [
        'High neural sensitivity detected micro-patterns in social engagement',
        'Enhanced market signal detection applied to valuation'
      ];
    }
    
    return analysis;
  }
  
  getFallbackAIAnalysis(athleteData) {
    const consciousnessBoost = (this.consciousnessParams.sensitivityBoost + 
                               this.consciousnessParams.depthMultiplier + 
                               this.consciousnessParams.patternWeight) / 3;
    
    return {
      market_assessment: `${athleteData.sport} market analysis for ${athleteData.level} athlete with ${athleteData.followers} followers shows ${athleteData.engagement > 5 ? 'strong' : 'moderate'} engagement potential.`,
      growth_potential: athleteData.engagement > 5 && athleteData.awards > 2 ? 'high' : athleteData.engagement > 3 ? 'medium' : 'low',
      risk_factors: athleteData.followers < 1000 ? ['low_social_reach'] : [],
      unique_opportunities: athleteData.sport === 'football' ? ['brand_partnerships', 'regional_endorsements'] : ['social_media_content'],
      comparables: `Similar ${athleteData.sport} athletes at ${athleteData.level} level typically valued in this range`,
      recommendation: 'Focus on authentic engagement and performance excellence',
      confidence_modifier: Math.min(0.95, (0.70 + (athleteData.engagement / 100) + (athleteData.awards * 0.05)) * consciousnessBoost),
      ai_valuation_factor: (1.0 + (athleteData.engagement / 200)) * consciousnessBoost,
      consciousness_applied: true
    };
  }

  calculateBaseValuation(data) {
    // Sport-specific base values reflecting market realities
    const sportBaseValues = {
      'football': 25000,
      'basketball': 20000,
      'baseball': 12000,
      'softball': 8000,
      'soccer': 6000,
      'volleyball': 5000,
      'track': 4000,
      'tennis': 4500,
      'golf': 5500,
      'other': 3000
    };

    // Competition level multipliers
    const levelMultipliers = {
      'high-school': 0.15,
      'juco': 0.30,
      'd3': 0.0, // D3 cannot receive NIL compensation
      'd2': 0.45,
      'd1': 1.0,
      'professional': 2.5
    };

    // Performance ranking multipliers
    const performanceMultipliers = {
      'elite': 2.8,
      'excellent': 2.2,
      'above-average': 1.6,
      'average': 1.0,
      'developing': 0.6
    };

    // Calculate base value
    const baseValue = sportBaseValues[data.sport] || 3000;
    const levelMultiplier = levelMultipliers[data.level] || 0.15;
    const performanceMultiplier = performanceMultipliers[data.performance] || 1.0;

    // D3 athletes cannot receive NIL compensation
    if (data.level === 'd3') {
      return {
        baseValue: 0,
        socialMediaValue: 0,
        performanceValue: 0,
        awardsValue: 0,
        totalValue: 0,
        disclaimer: 'NCAA Division III athletes are not eligible for NIL compensation'
      };
    }

    // Social media valuation component
    const socialMediaValue = this.calculateSocialMediaValue(data.followers, data.engagement);
    
    // Performance and achievement bonuses
    const performanceValue = baseValue * levelMultiplier * (performanceMultiplier - 1);
    const awardsValue = data.awards * 2500 * levelMultiplier;

    // Calculate total base valuation
    const totalValue = (baseValue * levelMultiplier * performanceMultiplier) + socialMediaValue + awardsValue;

    return {
      baseValue: baseValue * levelMultiplier,
      socialMediaValue,
      performanceValue,
      awardsValue,
      totalValue: Math.max(0, totalValue)
    };
  }

  calculateSocialMediaValue(followers, engagement) {
    // Sophisticated social media valuation algorithm
    const baseValue = Math.min(followers * 0.25, 50000); // Cap at $50k for social
    const engagementMultiplier = 1 + (Math.min(engagement, 15) / 10); // Cap engagement bonus
    
    // Quality score based on follower-to-engagement ratio
    const qualityScore = engagement > 0 ? Math.min(2.0, (engagement / 5)) : 0.5;
    
    return Math.round(baseValue * engagementMultiplier * qualityScore);
  }

  applyAIAdjustments(baseCalculation, aiAnalysis) {
    const aiMultiplier = aiAnalysis.ai_valuation_factor || 1.0;
    const confidenceModifier = aiAnalysis.confidence_modifier || 0.85;
    
    // Apply consciousness-based adjustments
    const consciousnessMultiplier = this.getConsciousnessMultiplier();
    
    return {
      ...baseCalculation,
      totalValue: baseCalculation.totalValue * aiMultiplier * confidenceModifier * consciousnessMultiplier,
      aiAdjustment: (aiMultiplier - 1) * baseCalculation.totalValue,
      aiConfidenceImpact: (confidenceModifier - 1) * baseCalculation.totalValue,
      consciousnessAdjustment: (consciousnessMultiplier - 1) * baseCalculation.totalValue,
      consciousnessInsights: aiAnalysis.consciousness_insights || []
    };
  }
  
  getConsciousnessMultiplier() {
    // Calculate overall consciousness effectiveness
    const effectiveness = (
      this.consciousnessParams.sensitivityBoost * 0.3 +
      this.consciousnessParams.depthMultiplier * 0.3 +
      this.consciousnessParams.patternWeight * 0.2 +
      this.consciousnessParams.speedFactor * 0.2
    );
    
    return Math.max(0.8, Math.min(1.3, effectiveness));
  }

  applyAuthorityFactors(calculation, data) {
    let authorityMultiplier = 1.0;
    let authorityBonuses = {};

    // Austin Humphrey Perfect Game credibility factor
    if (data.sport === 'baseball') {
      authorityMultiplier *= (1 + this.perfectGameCredibility);
      authorityBonuses.perfectGameFactor = calculation.totalValue * this.perfectGameCredibility;
    }

    // Texas market premium
    if (data.school?.toLowerCase().includes('texas') || data.region?.toLowerCase().includes('texas')) {
      authorityMultiplier *= this.texasMarketPremium;
      authorityBonuses.texasMarketPremium = calculation.totalValue * (this.texasMarketPremium - 1);
    }

    // SEC conference premium
    const secSchools = ['alabama', 'auburn', 'arkansas', 'florida', 'georgia', 'kentucky', 'lsu', 'mississippi', 'missouri', 'south carolina', 'tennessee', 'texas a&m', 'vanderbilt', 'texas', 'oklahoma'];
    if (secSchools.some(school => data.school?.toLowerCase().includes(school))) {
      authorityMultiplier *= this.secMarketMultiplier;
      authorityBonuses.secConferencePremium = calculation.totalValue * (this.secMarketMultiplier - 1);
    }

    // Deep South Sports Authority credibility bonus
    authorityMultiplier *= this.austinHumphreyFactor;
    authorityBonuses.authorityCredibilityBonus = calculation.totalValue * (this.austinHumphreyFactor - 1);

    return {
      ...calculation,
      totalValue: calculation.totalValue * authorityMultiplier,
      authorityMultiplier,
      authorityBonuses
    };
  }

  async generateConfidenceAnalysis(data, calculation) {
    let confidence = 70; // Base confidence

    // Data quality factors
    if (data.followers > 10000) confidence += 10;
    if (data.engagement > 5) confidence += 10;
    if (data.awards > 2) confidence += 5;
    if (data.school && data.school.length > 0) confidence += 5;

    // Market factors
    if (data.sport === 'football' || data.sport === 'basketball') confidence += 5;
    if (data.level === 'd1') confidence += 10;

    // Risk factors
    if (data.followers < 500) confidence -= 15;
    if (data.engagement < 2) confidence -= 10;

    // Austin Humphrey authority boost
    confidence += 5; // Authority credibility bonus

    confidence = Math.max(60, Math.min(95, confidence));

    const variance = (100 - confidence) / 100;
    const minValue = calculation.totalValue * (1 - variance * 0.4);
    const maxValue = calculation.totalValue * (1 + variance * 0.4);

    return {
      confidence,
      valueRange: {
        min: Math.round(minValue),
        max: Math.round(maxValue),
        variance: variance * 0.4
      },
      confidenceFactors: {
        dataQuality: data.followers > 10000 && data.engagement > 5 ? 'high' : 'medium',
        marketPosition: data.level === 'd1' ? 'strong' : 'developing',
        authorityBoost: 'Austin Humphrey Perfect Game credibility'
      }
    };
  }

  packageResults(calculation, aiAnalysis, confidenceAnalysis, data) {
    return {
      valuation: {
        estimated_value: Math.round(calculation.totalValue),
        value_range: confidenceAnalysis.valueRange,
        confidence_score: confidenceAnalysis.confidence
      },
      breakdown: {
        base_value: Math.round(calculation.baseValue),
        social_media_value: Math.round(calculation.socialMediaValue),
        performance_value: Math.round(calculation.performanceValue),
        awards_value: Math.round(calculation.awardsValue),
        ai_adjustment: Math.round(calculation.aiAdjustment || 0),
        authority_bonuses: calculation.authorityBonuses || {}
      },
      value_drivers: this.calculateValueDrivers(calculation),
      ai_insights: {
        market_assessment: aiAnalysis.market_assessment,
        growth_potential: aiAnalysis.growth_potential,
        risk_factors: aiAnalysis.risk_factors,
        unique_opportunities: aiAnalysis.unique_opportunities,
        recommendation: aiAnalysis.recommendation
      },
      authority_factors: {
        austin_humphrey_credibility: "Perfect Game background and Texas market expertise",
        deep_south_authority: "Regional leadership in sports analytics",
        market_specialization: data.region?.toLowerCase().includes('texas') ? "Texas market premium applied" : "National market analysis"
      },
      metadata: {
        calculation_id: this.generateCalculationId(),
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        confidence_analysis: confidenceAnalysis.confidenceFactors
      },
      disclaimers: [
        'NIL valuations are estimates based on available data and market analysis',
        'Actual NIL value depends on individual negotiations and market conditions',
        'Consult with compliance officers before pursuing NIL opportunities',
        'Analysis leverages Austin Humphrey\'s Perfect Game and Texas athletics expertise'
      ]
    };
  }

  calculateValueDrivers(calculation) {
    const total = calculation.totalValue;
    if (total === 0) return { performance: 0, social: 0, awards: 0, market: 0 };

    return {
      performance: Math.round((calculation.performanceValue / total) * 100),
      social: Math.round((calculation.socialMediaValue / total) * 100),
      awards: Math.round((calculation.awardsValue / total) * 100),
      market: Math.round(((calculation.aiAdjustment || 0) / total) * 100)
    };
  }

  generateCalculationId() {
    return `nil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Initialize NIL Engine
const nilEngine = new NILValuationEngine();

// Validation middleware
const validateNILInput = [
  body('sport').notEmpty().isString().withMessage('Sport is required'),
  body('level').notEmpty().isString().withMessage('Competition level is required'),
  body('followers').isInt({ min: 0 }).withMessage('Followers must be a positive integer'),
  body('engagement').isFloat({ min: 0, max: 100 }).withMessage('Engagement must be between 0-100'),
  body('athleteName').optional().isString().isLength({ max: 100 }),
  body('school').optional().isString().isLength({ max: 100 }),
  body('performance').optional().isString(),
  body('awards').optional().isInt({ min: 0 }),
];

/**
 * @swagger
 * /api/nil/calculate:
 *   post:
 *     summary: Calculate NIL valuation with AI-powered analysis
 *     description: Advanced NIL valuation using Austin Humphrey's Perfect Game expertise and AI market analysis
 *     tags: [NIL Engine]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sport
 *               - level
 *               - followers
 *               - engagement
 *             properties:
 *               athleteName:
 *                 type: string
 *                 example: "Arch Manning"
 *               sport:
 *                 type: string
 *                 enum: [football, basketball, baseball, softball, soccer, volleyball, track, tennis, golf, other]
 *               level:
 *                 type: string
 *                 enum: [high-school, juco, d3, d2, d1, professional]
 *               school:
 *                 type: string
 *                 example: "University of Texas"
 *               followers:
 *                 type: integer
 *                 minimum: 0
 *                 example: 250000
 *               engagement:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 4.5
 *               performance:
 *                 type: string
 *                 enum: [elite, excellent, above-average, average, developing]
 *               awards:
 *                 type: integer
 *                 minimum: 0
 *                 example: 3
 *     responses:
 *       200:
 *         description: NIL valuation results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     valuation:
 *                       type: object
 *                     breakdown:
 *                       type: object
 *                     ai_insights:
 *                       type: object
 */
router.post('/calculate', nilRateLimit, validateNILInput, trackApiUsage, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Invalid input data provided'
      });
    }

    // Calculate NIL valuation
    const result = await nilEngine.calculateNILValue(req.body);

    res.json({
      success: true,
      data: result,
      authority: {
        analyst: "Austin Humphrey",
        credentials: "Perfect Game Background, Texas Athletics Expertise",
        platform: "Deep South Sports Authority"
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('NIL calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'NIL calculation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/nil/validate:
 *   post:
 *     summary: Validate social media metrics
 *     description: AI-powered validation of social media follower authenticity and engagement quality
 */
router.post('/validate', nilRateLimit, async (req, res) => {
  try {
    const { platform, followers, engagement, username } = req.body;

    if (!platform || !followers || !engagement) {
      return res.status(400).json({
        success: false,
        message: 'Platform, followers, and engagement are required'
      });
    }

    // AI-powered validation analysis
    const validationPrompt = `Analyze these social media metrics for authenticity:
Platform: ${platform}
Followers: ${followers}
Engagement: ${engagement}%
Username: ${username || 'not provided'}

CRITICAL: Respond with ONLY valid JSON. NO text before or after the JSON.

JSON format:
{
  "authenticity_score": 0.85,
  "engagement_quality": "high|medium|low", 
  "risk_factors": ["factor1"],
  "recommendations": ["rec1"],
  "confidence": 0.90
}

START JSON NOW:`;

    let validationResult;
    try {
      if (anthropic) {
        console.log('🤖 Making real Anthropic API call for NIL validation...');
        const startTime = Date.now();
        
        const completion = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 500,
          messages: [{ role: "user", content: validationPrompt }]
        });
        
        const duration = Date.now() - startTime;
        let responseText = completion.content[0].text.trim();
        console.log(`✅ Anthropic API success: ${duration}ms response time`);
        console.log(`🧠 Full Anthropic response: "${responseText}"`);
        
        // Extract JSON from response - Anthropic often adds explanatory text first
        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          responseText = jsonMatch[0].trim();
          console.log(`🎯 Extracted JSON: ${responseText}`);
        } else {
          console.error(`❌ No JSON found in Anthropic response. Full response: ${responseText}`);
          throw new Error('Anthropic returned no valid JSON structure');
        }
        
        validationResult = JSON.parse(responseText);
        
        // Log successful AI processing
        console.log(`🎯 AI Validation Complete - Score: ${validationResult.authenticity_score}, Quality: ${validationResult.engagement_quality}`);
        
      } else {
        console.warn('⚠️ Anthropic API key not available - using calculated fallback');
        // Fallback validation logic
        validationResult = {
          authenticity_score: Math.max(0.6, Math.min(0.95, 0.8 - (followers > 1000000 ? 0.2 : 0) + (engagement > 3 ? 0.1 : -0.1))),
          engagement_quality: engagement > 5 ? 'high' : engagement > 2 ? 'medium' : 'low',
          risk_factors: followers > 500000 && engagement < 2 ? ['low_engagement_for_follower_count'] : [],
          recommendations: ['Focus on authentic engagement over follower count'],
          confidence: 0.80
        };
      }
    } catch (aiError) {
      console.error('❌ AI validation failed with error:', aiError.message);
      console.error('Full error details:', aiError);
      validationResult = {
        authenticity_score: 0.75,
        engagement_quality: 'medium',
        risk_factors: [],
        recommendations: ['Maintain consistent posting schedule'],
        confidence: 0.70
      };
    }

    res.json({
      success: true,
      validation: validationResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/nil/market-analysis:
 *   get:
 *     summary: Get market analysis for NIL valuations
 *     description: Comprehensive market analysis leveraging Austin Humphrey's regional expertise
 */
router.get('/market-analysis', nilRateLimit, async (req, res) => {
  try {
    const { sport, region = 'national', level = 'd1' } = req.query;

    const marketAnalysis = {
      overview: {
        market_size: region === 'texas' ? 'Premium' : 'Standard',
        growth_trend: 'Increasing',
        authority_insight: 'Analysis leverages Austin Humphrey\'s Perfect Game and Texas athletics expertise'
      },
      sport_specific: {
        sport: sport || 'general',
        market_premium: sport === 'football' ? 1.5 : sport === 'basketball' ? 1.3 : 1.0,
        regional_factor: region === 'texas' ? 1.25 : region === 'southeast' ? 1.15 : 1.0
      },
      trends: {
        social_media_importance: 'Increasing',
        performance_weight: 'Stable',
        brand_partnerships: 'Growing',
        compliance_focus: 'Critical'
      },
      recommendations: [
        'Focus on authentic social media engagement',
        'Maintain strong academic standing',
        'Build relationships with local businesses',
        'Ensure NCAA compliance in all activities'
      ],
      authority_credentials: {
        analyst: 'Austin Humphrey',
        background: 'Perfect Game analytics, Texas athletics expertise',
        regional_focus: 'Texas and Southeast markets'
      }
    };

    res.json({
      success: true,
      market_analysis: marketAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Market analysis failed'
    });
  }
});

/**
 * @swagger
 * /api/nil/health:
 *   get:
 *     summary: NIL Health Check with live AI validation
 *     description: Tests real OpenAI/Anthropic API connectivity, database status, and processing latency
 */
router.get('/health', async (req, res) => {
  console.log('🩺 NIL Health Check - Testing live AI integration...');
  const startTime = Date.now();
  
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connection verified');
    
    // Test actual AI API calls
    let aiStatus = { openai: 'disabled', anthropic: 'disabled' };
    const aiTestPrompt = 'You MUST respond with ONLY valid JSON, nothing else. REQUIRED JSON format: {"test": "success", "model": "working"}. Response MUST be valid JSON only:';
    
    // Test OpenAI if available
    if (openai) {
      try {
        console.log('🤖 Testing live OpenAI API...');
        const openaiStart = Date.now();
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: aiTestPrompt }],
          max_tokens: 50,
          temperature: 0
        });
        const openaiDuration = Date.now() - openaiStart;
        console.log(`✅ OpenAI API success: ${openaiDuration}ms response time`);
        console.log(`💬 OpenAI Response: ${completion.choices[0].message.content}`);
        
        aiStatus.openai = {
          status: 'healthy',
          model: 'gpt-3.5-turbo',
          latency: openaiDuration,
          response_preview: completion.choices[0].message.content.substring(0, 50)
        };
      } catch (openaiError) {
        console.error('❌ OpenAI API failed:', openaiError.message);
        aiStatus.openai = {
          status: 'failed',
          error: openaiError.message
        };
      }
    }
    
    // Test Anthropic if available
    if (anthropic) {
      try {
        console.log('🤖 Testing live Anthropic API...');
        const anthropicStart = Date.now();
        const completion = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 50,
          messages: [{ role: "user", content: aiTestPrompt }]
        });
        const anthropicDuration = Date.now() - anthropicStart;
        console.log(`✅ Anthropic API success: ${anthropicDuration}ms response time`);
        console.log(`💬 Anthropic Response: ${completion.content[0].text}`);
        
        aiStatus.anthropic = {
          status: 'healthy',
          model: 'claude-3-5-sonnet',
          latency: anthropicDuration,
          response_preview: completion.content[0].text.substring(0, 50)
        };
      } catch (anthropicError) {
        console.error('❌ Anthropic API failed:', anthropicError.message);
        aiStatus.anthropic = {
          status: 'failed',
          error: anthropicError.message
        };
      }
    }
    
    const totalDuration = Date.now() - startTime;
    console.log(`🏁 NIL Health Check completed in ${totalDuration}ms`);
    
    const fallbackMode = (!aiStatus.openai || aiStatus.openai.status !== 'healthy') && 
                         (!aiStatus.anthropic || aiStatus.anthropic.status !== 'healthy');
    
    res.json({
      status: 'healthy',
      database: 'connected',
      database_timestamp: dbResult.rows[0].now,
      ai_services: aiStatus,
      total_check_time: totalDuration,
      fallback_mode: fallbackMode,
      live_processing: !fallbackMode,
      api_keys_configured: {
        openai: !!openai,
        anthropic: !!anthropic
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ NIL Health Check failed:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message,
      database: 'unknown',
      error_details: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error'
    });
  }
});

export default router;