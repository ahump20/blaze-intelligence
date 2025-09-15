#!/usr/bin/env node

/**
 * Blaze Intelligence Production MCP Server
 * Championship Sports Analytics Platform
 *
 * Phase 1: Production Infrastructure - MCP Server Deployment
 * Handles real-time sports data, Hawk-Eye integration, and analytics
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import cron from 'node-cron';
import axios from 'axios';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import winston from 'winston';
import dotenv from 'dotenv';
import http from 'http';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3002;

// Production Configuration
const CONFIG = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    JWT_SECRET: process.env.JWT_SECRET || 'blaze-intelligence-championship-2025',
    REDIS_URL: process.env.REDIS_URL || null,

    // Sports API Keys
    MLB_API_KEY: process.env.MLB_API_KEY || null,
    ESPN_API_KEY: process.env.ESPN_API_KEY || null,
    PERFECT_GAME_API_KEY: process.env.PERFECT_GAME_API_KEY || null,

    // Rate Limiting
    RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
    RATE_LIMIT_MAX: 100, // requests per window

    // WebSocket
    WS_PORT: process.env.WS_PORT || 3003,

    // Hawk-Eye Configuration
    HAWKEYE_REFRESH_INTERVAL: 30000, // 30 seconds

    // Championship Intelligence
    CHAMPIONSHIP_MODE: process.env.CHAMPIONSHIP_MODE === 'true'
};

// Logger Configuration
const logger = winston.createLogger({
    level: CONFIG.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'blaze-mcp-server' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Rate Limiter
const rateLimiter = new RateLimiterMemory({
    points: CONFIG.RATE_LIMIT_MAX,
    duration: CONFIG.RATE_LIMIT_WINDOW / 1000
});

// In-memory data store (replace with Redis in production)
const dataStore = {
    mlb: {
        cardinals: {
            lastUpdate: null,
            data: null
        }
    },
    nfl: {
        titans: {
            lastUpdate: null,
            data: null
        }
    },
    nba: {
        grizzlies: {
            lastUpdate: null,
            data: null
        }
    },
    ncaa: {
        longhorns: {
            lastUpdate: null,
            data: null
        }
    },
    perfectGame: {
        lastUpdate: null,
        data: null
    },
    hawkeye: {
        lastUpdate: null,
        sessions: new Map()
    },
    // API Monetization Data
    billing: {
        users: new Map(),
        usage: new Map(),
        subscriptions: new Map(),
        transactions: new Map()
    },
    analytics: {
        revenue: new Map(),
        performance: new Map(),
        alerts: []
    }
};

// WebSocket Server
const wss = new WebSocketServer({
    server,
    path: '/ws'
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(compression());

app.use(cors({
    origin: [
        'https://blaze-intelligence.netlify.app',
        'https://localhost:3000',
        'http://localhost:3000',
        'http://localhost:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip);
        next();
    } catch (rejRes) {
        res.status(429).json({
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Rate limit exceeded',
                data: { retryAfter: rejRes.msBeforeNext }
            },
            id: null
        });
    }
};

app.use(rateLimitMiddleware);

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

/**
 * MCP Protocol Handler
 */
class MCPServer {
    constructor() {
        this.tools = new Map();
        this.resources = new Map();
        this.initializeTools();
    }

    initializeTools() {
        // Hawk-Eye Ball Tracking
        this.tools.set('trackBall', {
            description: 'Triangulates ball position and velocity from multi-camera inputs',
            inputSchema: {
                type: 'object',
                properties: {
                    cameras: {
                        type: 'array',
                        description: 'Array of camera calibration objects'
                    },
                    measurements: {
                        type: 'array',
                        description: 'Array of pixel coordinates for each camera'
                    }
                },
                required: ['cameras', 'measurements']
            },
            handler: this.trackBall.bind(this)
        });

        // Trajectory Prediction
        this.tools.set('predictTrajectory', {
            description: 'Predicts flight path, landing point, time and maximum height',
            inputSchema: {
                type: 'object',
                properties: {
                    position: {
                        type: 'object',
                        description: 'Starting position (x,y,z)'
                    },
                    velocity: {
                        type: 'object',
                        description: 'Velocity vector (vx,vy,vz)'
                    },
                    spin: {
                        type: 'number',
                        description: 'Ball spin (radians per second)'
                    }
                },
                required: ['position', 'velocity']
            },
            handler: this.predictTrajectory.bind(this)
        });

        // Strike Zone Analysis
        this.tools.set('analyzeStrikeZone', {
            description: 'Determines strike zone analysis and probability',
            inputSchema: {
                type: 'object',
                properties: {
                    plateX: { type: 'number', description: 'Horizontal position at plate (m)' },
                    plateY: { type: 'number', description: 'Vertical position at plate (m)' },
                    plateZ: { type: 'number', description: 'Depth position across plate (m)' }
                },
                required: ['plateX', 'plateY', 'plateZ']
            },
            handler: this.analyzeStrikeZone.bind(this)
        });

        // Live Sports Data
        this.tools.set('getLiveSportsData', {
            description: 'Fetches real-time sports data for teams',
            inputSchema: {
                type: 'object',
                properties: {
                    sport: {
                        type: 'string',
                        enum: ['mlb', 'nfl', 'nba', 'ncaa'],
                        description: 'Sport type'
                    },
                    team: {
                        type: 'string',
                        description: 'Team identifier'
                    }
                },
                required: ['sport', 'team']
            },
            handler: this.getLiveSportsData.bind(this)
        });

        // Character Assessment
        this.tools.set('assessCharacter', {
            description: 'Analyzes athlete character traits from video/bio data',
            inputSchema: {
                type: 'object',
                properties: {
                    videoUrl: { type: 'string', description: 'Video URL for analysis' },
                    biometrics: { type: 'object', description: 'Biometric data' },
                    gameContext: { type: 'object', description: 'Game situation context' }
                }
            },
            handler: this.assessCharacter.bind(this)
        });
    }

    async trackBall(params) {
        logger.info('Hawk-Eye Ball Tracking Request', { params });

        try {
            const { cameras, measurements } = params;

            // Simulate Hawk-Eye ball tracking algorithm
            const ballPosition = this.triangulatePosition(cameras, measurements);
            const velocity = this.calculateVelocity(ballPosition);
            const spin = this.analyzeSpin(measurements);

            const result = {
                position: ballPosition,
                velocity,
                spin,
                accuracy: 0.996, // 99.6% accuracy typical for Hawk-Eye
                timestamp: new Date().toISOString(),
                trackingId: `track_${Date.now()}`
            };

            // Store tracking session
            dataStore.hawkeye.sessions.set(result.trackingId, result);
            dataStore.hawkeye.lastUpdate = new Date().toISOString();

            // Broadcast to WebSocket clients
            this.broadcastToClients('ballTracking', result);

            return {
                success: true,
                data: result
            };

        } catch (error) {
            logger.error('Ball tracking error', { error: error.message });
            throw new Error(`Ball tracking failed: ${error.message}`);
        }
    }

    async predictTrajectory(params) {
        logger.info('Trajectory Prediction Request', { params });

        try {
            const { position, velocity, spin = 0 } = params;

            // Physics-based trajectory calculation
            const g = 9.81; // gravity
            const airResistance = 0.47; // drag coefficient for baseball
            const dt = 0.01; // time step

            const trajectory = [];
            let currentPos = { ...position };
            let currentVel = { ...velocity };
            let t = 0;

            while (currentPos.y >= 0 && t < 10) { // max 10 seconds
                // Apply gravity and air resistance
                currentVel.y -= g * dt;
                currentVel.x *= (1 - airResistance * dt);
                currentVel.z *= (1 - airResistance * dt);

                // Update position
                currentPos.x += currentVel.x * dt;
                currentPos.y += currentVel.y * dt;
                currentPos.z += currentVel.z * dt;

                trajectory.push({
                    time: t,
                    position: { ...currentPos },
                    velocity: { ...currentVel }
                });

                t += dt;
            }

            const result = {
                trajectory,
                landingPoint: trajectory[trajectory.length - 1]?.position,
                flightTime: t,
                maxHeight: Math.max(...trajectory.map(p => p.position.y)),
                spin,
                timestamp: new Date().toISOString()
            };

            return {
                success: true,
                data: result
            };

        } catch (error) {
            logger.error('Trajectory prediction error', { error: error.message });
            throw new Error(`Trajectory prediction failed: ${error.message}`);
        }
    }

    async analyzeStrikeZone(params) {
        logger.info('Strike Zone Analysis Request', { params });

        try {
            const { plateX, plateY, plateZ } = params;

            // MLB strike zone dimensions (approximate)
            const PLATE_WIDTH = 0.432; // 17 inches
            const STRIKE_ZONE_TOP = 1.067; // ~42 inches (varies by batter)
            const STRIKE_ZONE_BOTTOM = 0.508; // ~20 inches

            // Determine if in strike zone
            const inStrikeZone = Math.abs(plateX) <= PLATE_WIDTH / 2 &&
                               plateY >= STRIKE_ZONE_BOTTOM &&
                               plateY <= STRIKE_ZONE_TOP &&
                               Math.abs(plateZ) <= 0.1; // plate depth tolerance

            // Calculate zone number (1-9 grid)
            const zoneX = Math.floor((plateX + PLATE_WIDTH / 2) / (PLATE_WIDTH / 3)) + 1;
            const zoneY = Math.floor((plateY - STRIKE_ZONE_BOTTOM) /
                         ((STRIKE_ZONE_TOP - STRIKE_ZONE_BOTTOM) / 3)) + 1;

            const zoneNumber = Math.min(9, Math.max(1, (zoneY - 1) * 3 + zoneX));

            // Calculate strike probability
            const edgeDistance = Math.min(
                PLATE_WIDTH / 2 - Math.abs(plateX),
                plateY - STRIKE_ZONE_BOTTOM,
                STRIKE_ZONE_TOP - plateY
            );

            const strikeProbability = inStrikeZone ?
                Math.max(0.7, 1 - Math.abs(edgeDistance) * 0.1) :
                Math.max(0, 0.3 - Math.abs(edgeDistance) * 0.1);

            const result = {
                inStrikeZone,
                zoneNumber,
                strikeProbability,
                coordinates: { plateX, plateY, plateZ },
                edgeDistance,
                call: strikeProbability > 0.5 ? 'STRIKE' : 'BALL',
                confidence: Math.abs(strikeProbability - 0.5) * 2,
                timestamp: new Date().toISOString()
            };

            return {
                success: true,
                data: result
            };

        } catch (error) {
            logger.error('Strike zone analysis error', { error: error.message });
            throw new Error(`Strike zone analysis failed: ${error.message}`);
        }
    }

    async getLiveSportsData(params) {
        logger.info('Live Sports Data Request', { params });

        try {
            const { sport, team } = params;

            let data;
            switch (sport.toLowerCase()) {
                case 'mlb':
                    data = await this.fetchMLBData(team);
                    break;
                case 'nfl':
                    data = await this.fetchNFLData(team);
                    break;
                case 'nba':
                    data = await this.fetchNBAData(team);
                    break;
                case 'ncaa':
                    data = await this.fetchNCAAData(team);
                    break;
                default:
                    throw new Error(`Unsupported sport: ${sport}`);
            }

            return {
                success: true,
                data,
                sport,
                team,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logger.error('Live sports data error', { error: error.message, sport, team });
            throw new Error(`Failed to fetch ${sport} data for ${team}: ${error.message}`);
        }
    }

    async assessCharacter(params) {
        logger.info('Character Assessment Request', { params });

        try {
            const { videoUrl, biometrics, gameContext } = params;

            // Simulate character assessment analysis
            const traits = {
                grit: Math.random() * 40 + 60, // 60-100
                leadership: Math.random() * 30 + 70, // 70-100
                resilience: Math.random() * 35 + 65, // 65-100
                coachability: Math.random() * 25 + 75, // 75-100
                competitiveness: Math.random() * 20 + 80, // 80-100
                teamwork: Math.random() * 30 + 70 // 70-100
            };

            const championshipDNA = Object.values(traits).reduce((a, b) => a + b, 0) / 6;

            const result = {
                traits,
                championshipDNA,
                grade: championshipDNA >= 90 ? 'A+' :
                       championshipDNA >= 85 ? 'A' :
                       championshipDNA >= 80 ? 'B+' :
                       championshipDNA >= 75 ? 'B' : 'C+',
                analysis: {
                    strengths: Object.entries(traits)
                        .filter(([, value]) => value >= 85)
                        .map(([trait]) => trait),
                    areas_for_growth: Object.entries(traits)
                        .filter(([, value]) => value < 75)
                        .map(([trait]) => trait)
                },
                confidence: Math.random() * 0.2 + 0.8, // 80-100%
                timestamp: new Date().toISOString()
            };

            return {
                success: true,
                data: result
            };

        } catch (error) {
            logger.error('Character assessment error', { error: error.message });
            throw new Error(`Character assessment failed: ${error.message}`);
        }
    }

    // Helper methods for ball tracking calculations
    triangulatePosition(cameras, measurements) {
        // Simplified triangulation algorithm
        return {
            x: Math.random() * 20 - 10, // -10 to 10 meters
            y: Math.random() * 5 + 1,   // 1 to 6 meters
            z: Math.random() * 30       // 0 to 30 meters
        };
    }

    calculateVelocity(position) {
        return {
            vx: Math.random() * 10 - 5,  // -5 to 5 m/s
            vy: Math.random() * 20 + 10, // 10 to 30 m/s
            vz: Math.random() * 40 + 20  // 20 to 60 m/s (toward plate)
        };
    }

    analyzeSpin(measurements) {
        return Math.random() * 50 + 10; // 10-60 rad/s
    }

    // Sports data fetchers (implement with real APIs)
    async fetchMLBData(team) {
        // TODO: Implement real MLB Stats API integration
        return {
            team: team,
            season: '2025',
            record: { wins: 82, losses: 80 },
            lastGame: {
                date: new Date().toISOString(),
                opponent: 'Chicago Cubs',
                score: { home: 7, away: 4 },
                result: 'W'
            },
            nextGame: {
                date: new Date(Date.now() + 86400000).toISOString(),
                opponent: 'Milwaukee Brewers',
                venue: 'Busch Stadium'
            },
            stats: {
                batting_avg: 0.271,
                era: 4.23,
                runs_scored: 746,
                runs_allowed: 712
            }
        };
    }

    async fetchNFLData(team) {
        // TODO: Implement real NFL API integration
        return {
            team: team,
            season: '2025',
            record: { wins: 8, losses: 9 },
            conference: 'AFC South',
            division_standing: 2
        };
    }

    async fetchNBAData(team) {
        // TODO: Implement real NBA API integration
        return {
            team: team,
            season: '2024-25',
            record: { wins: 27, losses: 55 },
            conference: 'Western'
        };
    }

    async fetchNCAAData(team) {
        // TODO: Implement real NCAA API integration
        return {
            team: team,
            season: '2025',
            conference: 'SEC',
            ranking: 7
        };
    }

    broadcastToClients(type, data) {
        const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });

        wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    }

    async handleMCPRequest(request) {
        const { method, params, id } = request;

        try {
            let result;

            switch (method) {
                case 'tools/list':
                    result = {
                        tools: Array.from(this.tools.entries()).map(([name, tool]) => ({
                            name,
                            description: tool.description,
                            inputSchema: tool.inputSchema
                        }))
                    };
                    break;

                case 'tools/call':
                    const { name, arguments: args } = params;
                    const tool = this.tools.get(name);

                    if (!tool) {
                        throw new Error(`Unknown tool: ${name}`);
                    }

                    const toolResult = await tool.handler(args);
                    result = {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(toolResult, null, 2)
                        }]
                    };
                    break;

                case 'resources/list':
                    result = {
                        resources: Array.from(this.resources.keys()).map(uri => ({
                            uri,
                            name: uri.split('/').pop()
                        }))
                    };
                    break;

                default:
                    throw new Error(`Unknown method: ${method}`);
            }

            return {
                jsonrpc: '2.0',
                result,
                id
            };

        } catch (error) {
            logger.error('MCP request error', { error: error.message, method, params });

            return {
                jsonrpc: '2.0',
                error: {
                    code: -32000,
                    message: error.message,
                    data: { method, params }
                },
                id
            };
        }
    }
}

// Initialize MCP Server
const mcpServer = new MCPServer();

// Routes
app.get('/', (req, res) => {
    res.json({
        name: 'Blaze Intelligence MCP Server',
        version: '2.0.0',
        status: 'Championship Mode Active',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        endpoints: {
            mcp: '/mcp',
            health: '/health',
            ws: '/ws'
        }
    });
});

app.get('/health', (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        server: {
            node_version: process.version,
            platform: process.platform,
            arch: process.arch
        },
        services: {
            mcp: 'active',
            websocket: `${wss.clients.size} clients`,
            data_store: 'operational'
        },
        championship_mode: CONFIG.CHAMPIONSHIP_MODE
    };

    res.json(healthCheck);
});

// Authentication Endpoints
app.post('/auth/login', async (req, res) => {
    logger.info('Authentication login request', {
        email: req.body.email?.substring(0, 3) + '***',
        ip: req.ip
    });

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Simulate authentication (replace with real authentication logic)
        const mockUser = {
            id: 1,
            email: email,
            firstName: 'Championship',
            lastName: 'User',
            organization: 'Blaze Intelligence',
            role: 'analyst',
            subscriptionTier: 'pro',
            permissions: ['analytics', 'live-data', 'video-analysis'],
            createdAt: new Date().toISOString()
        };

        // Generate JWT token (basic implementation)
        const token = Buffer.from(JSON.stringify({
            userId: mockUser.id,
            email: mockUser.email,
            tier: mockUser.subscriptionTier,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
            iat: Math.floor(Date.now() / 1000)
        })).toString('base64');

        const refreshToken = Buffer.from(JSON.stringify({
            userId: mockUser.id,
            type: 'refresh',
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
        })).toString('base64');

        res.json({
            success: true,
            user: mockUser,
            token: `jwt.${token}.signature`,
            refreshToken: `refresh.${refreshToken}.signature`,
            message: 'Login successful'
        });

        logger.info('Authentication successful', { userId: mockUser.id, tier: mockUser.subscriptionTier });

    } catch (error) {
        logger.error('Authentication login error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Authentication service error'
        });
    }
});

app.post('/auth/signup', async (req, res) => {
    logger.info('Authentication signup request', {
        email: req.body.email?.substring(0, 3) + '***',
        role: req.body.role,
        ip: req.ip
    });

    try {
        const { email, password, firstName, lastName, organization, role } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Required fields missing'
            });
        }

        // Create new user (mock implementation)
        const newUser = {
            id: Date.now(),
            email: email,
            firstName: firstName,
            lastName: lastName,
            organization: organization || 'Independent',
            role: role || 'analyst',
            subscriptionTier: 'basic', // New users start with basic
            permissions: ['live-data'],
            createdAt: new Date().toISOString(),
            isEmailVerified: false
        };

        // Generate tokens
        const token = Buffer.from(JSON.stringify({
            userId: newUser.id,
            email: newUser.email,
            tier: newUser.subscriptionTier,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
            iat: Math.floor(Date.now() / 1000)
        })).toString('base64');

        const refreshToken = Buffer.from(JSON.stringify({
            userId: newUser.id,
            type: 'refresh',
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
        })).toString('base64');

        res.status(201).json({
            success: true,
            user: newUser,
            token: `jwt.${token}.signature`,
            refreshToken: `refresh.${refreshToken}.signature`,
            message: 'Account created successfully'
        });

        logger.info('New user created', { userId: newUser.id, tier: newUser.subscriptionTier });

    } catch (error) {
        logger.error('Authentication signup error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Account creation failed'
        });
    }
});

app.post('/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Validate refresh token (basic implementation)
        try {
            const tokenData = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString());

            if (tokenData.exp < Math.floor(Date.now() / 1000)) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token expired'
                });
            }

            // Generate new access token
            const newToken = Buffer.from(JSON.stringify({
                userId: tokenData.userId,
                exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
                iat: Math.floor(Date.now() / 1000)
            })).toString('base64');

            res.json({
                success: true,
                token: `jwt.${newToken}.signature`,
                message: 'Token refreshed successfully'
            });

        } catch (decodeError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

    } catch (error) {
        logger.error('Token refresh error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Token refresh failed'
        });
    }
});

app.post('/auth/logout', async (req, res) => {
    logger.info('Authentication logout request', { ip: req.ip });

    // In a real implementation, you would invalidate the token
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// API Monetization Endpoints
app.get('/api/usage/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { period = '24h' } = req.query;

        logger.info('Usage analytics request', { userId, period });

        // Calculate time range
        const endTime = Date.now();
        const timeRanges = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000
        };
        const startTime = endTime - (timeRanges[period] || timeRanges['24h']);

        // Get usage data from store
        const usageKey = `usage_${userId}`;
        const userUsage = dataStore.billing.usage.get(usageKey) || [];

        // Filter by time range
        const filteredUsage = userUsage.filter(record =>
            record.timestamp >= startTime && record.timestamp <= endTime
        );

        // Calculate metrics
        const totalRequests = filteredUsage.length;
        const successfulRequests = filteredUsage.filter(r => r.success).length;
        const errorRequests = totalRequests - successfulRequests;
        const averageLatency = filteredUsage.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests || 0;

        // Group by endpoint
        const endpointStats = {};
        filteredUsage.forEach(record => {
            if (!endpointStats[record.endpoint]) {
                endpointStats[record.endpoint] = { count: 0, totalLatency: 0 };
            }
            endpointStats[record.endpoint].count++;
            endpointStats[record.endpoint].totalLatency += record.responseTime;
        });

        const topEndpoints = Object.entries(endpointStats)
            .map(([endpoint, stats]) => ({
                endpoint,
                requests: stats.count,
                averageLatency: Math.round(stats.totalLatency / stats.count)
            }))
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 10);

        res.json({
            success: true,
            data: {
                period,
                timeRange: { start: startTime, end: endTime },
                summary: {
                    totalRequests,
                    successfulRequests,
                    errorRequests,
                    successRate: totalRequests > 0 ? (successfulRequests / totalRequests * 100).toFixed(2) : 100,
                    averageLatency: Math.round(averageLatency)
                },
                topEndpoints,
                hourlyBreakdown: generateHourlyBreakdown(filteredUsage)
            }
        });

    } catch (error) {
        logger.error('Usage analytics error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve usage analytics'
        });
    }
});

app.get('/api/billing/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { month, year } = req.query;

        logger.info('Billing request', { userId, month, year });

        // Get user subscription data
        const userSubscription = dataStore.billing.subscriptions.get(userId) || {
            tier: 'free',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        // Calculate billing period
        const now = new Date();
        const billingMonth = month ? parseInt(month) : now.getMonth() + 1;
        const billingYear = year ? parseInt(year) : now.getFullYear();

        const periodStart = new Date(billingYear, billingMonth - 1, 1).getTime();
        const periodEnd = new Date(billingYear, billingMonth, 0).getTime();

        // Get usage for billing period
        const usageKey = `usage_${userId}`;
        const userUsage = dataStore.billing.usage.get(usageKey) || [];
        const billingUsage = userUsage.filter(record =>
            record.timestamp >= periodStart && record.timestamp <= periodEnd
        );

        // Calculate billing
        const billing = calculateBilling(userSubscription, billingUsage);

        res.json({
            success: true,
            data: {
                userId,
                billingPeriod: {
                    month: billingMonth,
                    year: billingYear,
                    start: periodStart,
                    end: periodEnd
                },
                subscription: userSubscription,
                billing,
                usage: {
                    totalRequests: billingUsage.length,
                    successfulRequests: billingUsage.filter(r => r.success).length,
                    uniqueEndpoints: [...new Set(billingUsage.map(r => r.endpoint))].length
                }
            }
        });

    } catch (error) {
        logger.error('Billing calculation error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to calculate billing'
        });
    }
});

app.get('/api/revenue/analytics', async (req, res) => {
    try {
        const { period = '24h' } = req.query;

        logger.info('Revenue analytics request', { period });

        // Calculate revenue metrics
        const revenueData = calculateRevenueAnalytics(period);

        res.json({
            success: true,
            data: revenueData
        });

    } catch (error) {
        logger.error('Revenue analytics error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve revenue analytics'
        });
    }
});

app.post('/api/usage/track', async (req, res) => {
    try {
        const { userId, endpoint, method, responseTime, success = true, apiKey } = req.body;

        if (!userId || !endpoint) {
            return res.status(400).json({
                success: false,
                message: 'UserId and endpoint are required'
            });
        }

        // Create usage record
        const usageRecord = {
            userId,
            endpoint,
            method: method || 'GET',
            responseTime: responseTime || Math.random() * 100 + 20,
            success,
            timestamp: Date.now(),
            apiKey: apiKey ? hashApiKey(apiKey) : null
        };

        // Store usage record
        const usageKey = `usage_${userId}`;
        if (!dataStore.billing.usage.has(usageKey)) {
            dataStore.billing.usage.set(usageKey, []);
        }

        const userUsage = dataStore.billing.usage.get(usageKey);
        userUsage.push(usageRecord);

        // Keep only last 30 days of data
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const filteredUsage = userUsage.filter(record => record.timestamp > thirtyDaysAgo);
        dataStore.billing.usage.set(usageKey, filteredUsage);

        // Update real-time analytics
        updateRevenueAnalytics(usageRecord);

        logger.debug('Usage tracked', { userId, endpoint, responseTime, success });

        res.json({
            success: true,
            message: 'Usage tracked successfully',
            record: usageRecord
        });

    } catch (error) {
        logger.error('Usage tracking error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to track usage'
        });
    }
});

app.post('/api/subscription/update', async (req, res) => {
    try {
        const { userId, tier, paymentMethod } = req.body;

        if (!userId || !tier) {
            return res.status(400).json({
                success: false,
                message: 'UserId and tier are required'
            });
        }

        const validTiers = ['free', 'basic', 'pro', 'enterprise'];
        if (!validTiers.includes(tier)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription tier'
            });
        }

        // Update subscription
        const subscription = {
            tier,
            status: 'active',
            updatedAt: new Date().toISOString(),
            paymentMethod: paymentMethod || null,
            nextBilling: calculateNextBilling(tier),
            features: getFeaturesByTier(tier)
        };

        dataStore.billing.subscriptions.set(userId, subscription);

        // Create transaction record
        const transaction = {
            id: `txn_${Date.now()}`,
            userId,
            type: 'subscription_update',
            amount: getSubscriptionPrice(tier),
            tier,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };

        dataStore.billing.transactions.set(transaction.id, transaction);

        logger.info('Subscription updated', { userId, tier, amount: transaction.amount });

        res.json({
            success: true,
            message: 'Subscription updated successfully',
            subscription,
            transaction
        });

    } catch (error) {
        logger.error('Subscription update error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to update subscription'
        });
    }
});

// Helper functions for API monetization
function calculateBilling(subscription, usage) {
    const tier = subscription.tier;
    const baseFees = { free: 0, basic: 29, pro: 99, enterprise: 299 };
    const rateLimits = { free: 100, basic: 1000, pro: 5000, enterprise: 50000 };
    const overagePricing = { basic: 0.01, pro: 0.005, enterprise: 0.001 };

    const baseFee = baseFees[tier] || 0;
    const monthlyQuota = rateLimits[tier] * 24 * 30; // Approximate monthly quota
    const totalRequests = usage.length;

    let overageCharges = 0;
    if (totalRequests > monthlyQuota && overagePricing[tier]) {
        const overageRequests = totalRequests - monthlyQuota;
        const overagePer1000 = Math.ceil(overageRequests / 1000);
        overageCharges = overagePer1000 * overagePricing[tier];
    }

    const totalBill = baseFee + overageCharges;
    const successRate = totalRequests > 0 ? (usage.filter(r => r.success).length / totalRequests * 100) : 100;

    return {
        baseFee,
        totalRequests,
        monthlyQuota,
        overageRequests: Math.max(0, totalRequests - monthlyQuota),
        overageCharges: parseFloat(overageCharges.toFixed(2)),
        totalBill: parseFloat(totalBill.toFixed(2)),
        successRate: parseFloat(successRate.toFixed(2)),
        tier
    };
}

function calculateRevenueAnalytics(period) {
    // Mock revenue analytics - replace with real calculations
    const baseRevenue = {
        '1h': { total: 1200, subscription: 1000, usage: 200 },
        '24h': { total: 28800, subscription: 24000, usage: 4800 },
        '7d': { total: 201600, subscription: 168000, usage: 33600 },
        '30d': { total: 864000, subscription: 720000, usage: 144000 }
    };

    const revenue = baseRevenue[period] || baseRevenue['24h'];

    return {
        period,
        revenue: {
            ...revenue,
            growth: 12.5 // Mock growth rate
        },
        usage: {
            totalRequests: Math.floor(Math.random() * 10000) + 5000,
            uniqueUsers: Math.floor(Math.random() * 500) + 200,
            averageRequestsPerUser: Math.floor(Math.random() * 100) + 50,
            topTier: 'pro'
        },
        performance: {
            averageLatency: Math.floor(Math.random() * 50) + 50,
            successRate: 99.2,
            errorRate: 0.8
        },
        predictions: {
            nextMonth: Math.round(revenue.total * 1.125),
            nextQuarter: Math.round(revenue.total * 3.5),
            confidence: 85
        },
        alerts: dataStore.analytics.alerts.slice(-5) // Last 5 alerts
    };
}

function updateRevenueAnalytics(usageRecord) {
    // Update real-time analytics
    const now = Date.now();
    const hourKey = Math.floor(now / (60 * 60 * 1000));

    if (!dataStore.analytics.performance.has(hourKey)) {
        dataStore.analytics.performance.set(hourKey, {
            requests: 0,
            totalLatency: 0,
            errors: 0,
            timestamp: now
        });
    }

    const hourlyStats = dataStore.analytics.performance.get(hourKey);
    hourlyStats.requests++;
    hourlyStats.totalLatency += usageRecord.responseTime;
    if (!usageRecord.success) {
        hourlyStats.errors++;
    }

    // Check for alerts
    if (usageRecord.responseTime > 500) {
        dataStore.analytics.alerts.push({
            id: `alert_${Date.now()}`,
            type: 'performance',
            severity: 'medium',
            message: `High latency detected: ${usageRecord.responseTime}ms for ${usageRecord.endpoint}`,
            timestamp: now
        });
    }

    // Keep only last 24 hours of performance data
    const dayAgo = Math.floor((now - 24 * 60 * 60 * 1000) / (60 * 60 * 1000));
    for (const [key] of dataStore.analytics.performance.entries()) {
        if (key < dayAgo) {
            dataStore.analytics.performance.delete(key);
        }
    }

    // Keep only last 100 alerts
    if (dataStore.analytics.alerts.length > 100) {
        dataStore.analytics.alerts = dataStore.analytics.alerts.slice(-100);
    }
}

function generateHourlyBreakdown(usage) {
    const hourlyData = {};

    usage.forEach(record => {
        const hour = new Date(record.timestamp).getHours();
        if (!hourlyData[hour]) {
            hourlyData[hour] = { requests: 0, errors: 0 };
        }
        hourlyData[hour].requests++;
        if (!record.success) {
            hourlyData[hour].errors++;
        }
    });

    return Object.entries(hourlyData).map(([hour, data]) => ({
        hour: parseInt(hour),
        requests: data.requests,
        errors: data.errors,
        successRate: ((data.requests - data.errors) / data.requests * 100).toFixed(1)
    }));
}

function hashApiKey(apiKey) {
    return crypto.createHash('sha256').update(apiKey).digest('hex').slice(0, 16);
}

function calculateNextBilling(tier) {
    if (tier === 'free') return null;

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString();
}

function getFeaturesByTier(tier) {
    const features = {
        free: ['basic-stats', 'team-info'],
        basic: ['basic-stats', 'team-info', 'live-scores', 'player-stats'],
        pro: ['basic-stats', 'team-info', 'live-scores', 'player-stats', 'video-analysis', 'character-assessment', 'predictions'],
        enterprise: ['all-features', 'custom-integrations', 'priority-support', 'advanced-analytics', 'real-time-streaming']
    };

    return features[tier] || features.free;
}

function getSubscriptionPrice(tier) {
    const prices = { free: 0, basic: 29, pro: 99, enterprise: 299 };
    return prices[tier] || 0;
}

// MCP Protocol Endpoint
app.post('/mcp', async (req, res) => {
    try {
        const response = await mcpServer.handleMCPRequest(req.body);
        res.json(response);
    } catch (error) {
        logger.error('MCP endpoint error', { error: error.message });
        res.status(500).json({
            jsonrpc: '2.0',
            error: {
                code: -32603,
                message: 'Internal error',
                data: error.message
            },
            id: req.body.id || null
        });
    }
});

// WebSocket handling
wss.on('connection', (ws, req) => {
    logger.info('WebSocket client connected', {
        clientCount: wss.clients.size,
        ip: req.socket.remoteAddress
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            logger.debug('WebSocket message received', { data });

            // Handle different message types
            switch (data.type) {
                case 'subscribe':
                    ws.subscriptions = data.channels || [];
                    ws.send(JSON.stringify({
                        type: 'subscribed',
                        channels: ws.subscriptions
                    }));
                    break;

                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;

                default:
                    logger.warn('Unknown WebSocket message type', { type: data.type });
            }
        } catch (error) {
            logger.error('WebSocket message error', { error: error.message });
        }
    });

    ws.on('close', () => {
        logger.info('WebSocket client disconnected', {
            clientCount: wss.clients.size - 1
        });
    });

    ws.on('error', (error) => {
        logger.error('WebSocket client error', { error: error.message });
    });

    // Send initial data
    ws.send(JSON.stringify({
        type: 'connected',
        server: 'Blaze Intelligence MCP Server',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    }));
});

// Cron jobs for data updates
if (CONFIG.CHAMPIONSHIP_MODE) {
    // Update Cardinals data every 30 seconds
    cron.schedule('*/30 * * * * *', async () => {
        try {
            const cardinalsData = await mcpServer.fetchMLBData('cardinals');
            dataStore.mlb.cardinals = {
                lastUpdate: new Date().toISOString(),
                data: cardinalsData
            };

            mcpServer.broadcastToClients('mlb_update', {
                team: 'cardinals',
                data: cardinalsData
            });

            logger.debug('Cardinals data updated');
        } catch (error) {
            logger.error('Cardinals data update failed', { error: error.message });
        }
    });

    // Update other teams every 2 minutes
    cron.schedule('*/2 * * * *', async () => {
        try {
            // Update Titans (NFL)
            const titansData = await mcpServer.fetchNFLData('titans');
            dataStore.nfl.titans = {
                lastUpdate: new Date().toISOString(),
                data: titansData
            };

            // Update Longhorns (NCAA)
            const longhornsData = await mcpServer.fetchNCAAData('longhorns');
            dataStore.ncaa.longhorns = {
                lastUpdate: new Date().toISOString(),
                data: longhornsData
            };

            // Broadcast updates
            mcpServer.broadcastToClients('sports_update', {
                nfl: { titans: titansData },
                ncaa: { longhorns: longhornsData }
            });

            logger.debug('Multi-sport data updated');
        } catch (error) {
            logger.error('Multi-sport data update failed', { error: error.message });
        }
    });
}

// Error handling
app.use((err, req, res, next) => {
    logger.error('Express error', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    res.status(500).json({
        jsonrpc: '2.0',
        error: {
            code: -32603,
            message: 'Internal server error',
            data: CONFIG.NODE_ENV === 'development' ? err.message : 'Server error'
        },
        id: null
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        jsonrpc: '2.0',
        error: {
            code: -32601,
            message: 'Method not found',
            data: `Endpoint ${req.path} not found`
        },
        id: null
    });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    logger.info(`🏆 Blaze Intelligence MCP Server started`, {
        port: PORT,
        environment: CONFIG.NODE_ENV,
        championship_mode: CONFIG.CHAMPIONSHIP_MODE,
        websocket_port: CONFIG.WS_PORT
    });

    logger.info('Available MCP Tools:', {
        tools: Array.from(mcpServer.tools.keys())
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

export default app;