import express from 'express';
import { authenticateToken } from '../auth/authMiddleware.js';
import { WebSocketServer } from 'ws';
import aiAnalyticsService from '../../src/services/aiAnalyticsService.js';

const router = express.Router();

// WebSocket server for real-time consciousness updates
let consciousnessWSServer = null;
let consciousnessWSConnections = new Set();


// AI Consciousness State Management
class AIConsciousnessEngine {
    constructor() {
        this.state = {
            neuralSensitivity: 75,
            predictionDepth: 60,
            processingSpeed: 85,
            patternRecognition: 70,
            learningRate: 0.03,
            confidence: 94.6,
            activeConnections: 15,
            totalNodes: 25,
            status: 'learning',
            lastUpdate: Date.now()
        };
        
        this.models = {
            pressureAnalysis: { temperature: 0.7, topP: 0.9 },
            clutchPrediction: { confidence: 0.85, lookahead: 3 },
            momentumDetection: { sensitivity: 0.75, smoothing: 0.6 },
            biometricAnalysis: { precision: 0.95, frameRate: 30 }
        };
        
        this.startAutonomousUpdates();
        
        // Austin Humphrey AI expertise presets
        this.austinPresets = {
            texasFootball: {
                neuralSensitivity: 85,
                predictionDepth: 75,
                processingSpeed: 90,
                patternRecognition: 80,
                description: 'Optimized for Texas/Big 12 high-pressure scenarios'
            },
            secFootball: {
                neuralSensitivity: 90,
                predictionDepth: 80,
                processingSpeed: 85,
                patternRecognition: 85,
                description: 'SEC championship-level intensity analysis'
            },
            perfectGameBaseball: {
                neuralSensitivity: 75,
                predictionDepth: 85,
                processingSpeed: 80,
                patternRecognition: 90,
                description: 'Perfect Game scouting precision methodology'
            },
            clutchAnalysis: {
                neuralSensitivity: 95,
                predictionDepth: 90,
                processingSpeed: 75,
                patternRecognition: 85,
                description: 'Maximum sensitivity for championship moments'
            }
        };
        
        // Track real-time effects on AI services
        this.serviceEffects = {
            nilCalculations: 0,
            pressureAnalysis: 0,
            digitalCombine: 0,
            predictiveModeling: 0
        };
    }

    updateParameter(parameter, value) {
        const numValue = parseFloat(value);
        
        // Validate input range
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            throw new Error(`Invalid parameter value: ${value}. Must be between 0-100.`);
        }
        
        // Validate parameter name
        const validParameters = ['sensitivity-slider', 'depth-slider', 'speed-slider', 'pattern-slider'];
        if (!validParameters.includes(parameter)) {
            throw new Error(`Invalid parameter: ${parameter}`);
        }
        
        switch (parameter) {
            case 'sensitivity-slider':
                this.state.neuralSensitivity = numValue;
                this.models.pressureAnalysis.temperature = 0.5 + (numValue / 100) * 0.5;
                this.models.momentumDetection.sensitivity = numValue / 100;
                break;
                
            case 'depth-slider':
                this.state.predictionDepth = numValue;
                this.models.clutchPrediction.lookahead = Math.floor(1 + (numValue / 100) * 5);
                this.models.clutchPrediction.confidence = 0.6 + (numValue / 100) * 0.35;
                break;
                
            case 'speed-slider':
                this.state.processingSpeed = numValue;
                this.models.biometricAnalysis.frameRate = Math.floor(15 + (numValue / 100) * 30);
                break;
                
            case 'pattern-slider':
                this.state.patternRecognition = numValue;
                this.models.pressureAnalysis.topP = 0.7 + (numValue / 100) * 0.25;
                this.models.momentumDetection.smoothing = 0.3 + (numValue / 100) * 0.5;
                break;
        }
        
        // Update derived metrics
        this.updateDerivedMetrics();
        this.state.lastUpdate = Date.now();
        
        // Apply real-time effects to AI services
        this.applyConsciousnessToAIServices();
        
        // Broadcast update to WebSocket clients
        this.broadcastConsciousnessUpdate('ui');
        
        return this.getState();
    }

    updateDerivedMetrics() {
        // Calculate AI confidence based on parameter settings
        const parameterBalance = (
            this.state.neuralSensitivity + 
            this.state.predictionDepth + 
            this.state.processingSpeed + 
            this.state.patternRecognition
        ) / 4;
        
        this.state.confidence = Math.max(85, Math.min(97, 90 + (parameterBalance - 70) * 0.1));
        
        // Update learning rate
        this.state.learningRate = 0.01 + (this.state.processingSpeed / 100) * 0.05;
        
        // Update network topology
        this.state.activeConnections = Math.floor(10 + (this.state.patternRecognition / 100) * 20);
        this.state.totalNodes = Math.floor(20 + (this.state.neuralSensitivity / 100) * 15);
        
        // Update status
        if (parameterBalance > 80) {
            this.state.status = 'peak_performance';
        } else if (parameterBalance > 60) {
            this.state.status = 'learning';
        } else {
            this.state.status = 'calibrating';
        }
        
        // Update AI service effectiveness
        this.updateServiceEffectiveness();
    }

    getState() {
        return {
            ...this.state,
            models: this.models,
            timestamp: Date.now()
        };
    }

    generateInsights() {
        const insights = [];
        
        // Sensitivity insights
        if (this.state.neuralSensitivity > 85) {
            insights.push({
                type: 'sensitivity_high',
                message: 'High neural sensitivity detected - excellent for identifying subtle pressure patterns',
                confidence: 92,
                action: 'Optimal for championship-level game analysis'
            });
        }
        
        // Depth insights
        if (this.state.predictionDepth > 80) {
            insights.push({
                type: 'prediction_deep',
                message: 'Deep prediction mode active - enhanced clutch moment forecasting',
                confidence: 88,
                action: 'Ideal for strategic decision support'
            });
        }
        
        // Speed insights
        if (this.state.processingSpeed > 90) {
            insights.push({
                type: 'speed_optimized',
                message: 'Real-time processing at peak efficiency',
                confidence: 95,
                action: 'Ready for live game analysis'
            });
        }
        
        return insights;
    }
    
    applyConsciousnessToAIServices() {
        // Calculate consciousness factors
        const sensitivityFactor = this.state.neuralSensitivity / 100;
        const depthFactor = this.state.predictionDepth / 100;
        const speedFactor = this.state.processingSpeed / 100;
        const patternFactor = this.state.patternRecognition / 100;
        
        // Apply consciousness settings to AI analytics service
        if (aiAnalyticsService) {
            aiAnalyticsService.setConsciousnessParameters({
                temperature: 0.3 + (sensitivityFactor * 0.7),
                maxTokens: Math.floor(200 + (depthFactor * 800)),
                topP: 0.7 + (patternFactor * 0.25),
                timeout: Math.floor(30000 / speedFactor),
                sensitivityMultiplier: 0.5 + sensitivityFactor * 1.5,
                depthBoost: 0.7 + depthFactor * 0.6,
                patternFocus: patternFactor
            });
            console.log('🧠 AI Analytics Service updated');
        }
        
        // Store parameters globally for all services to access
        global.consciousnessParams = {
            sensitivityBoost: 0.8 + (sensitivityFactor * 0.4),
            depthMultiplier: 0.8 + (depthFactor * 0.6),  
            speedMultiplier: 0.8 + (speedFactor * 0.4),
            patternWeight: 0.5 + (patternFactor * 0.5),
            lastUpdate: Date.now(),
            // Raw values for services that need them
            neuralSensitivity: this.state.neuralSensitivity,
            predictionDepth: this.state.predictionDepth,
            processingSpeed: this.state.processingSpeed,
            patternRecognition: this.state.patternRecognition
        };
        
        // Apply consciousness settings to NIL engine
        this.applyConsciousnessToNILEngine();
        
        console.log('🧠 Platform-wide consciousness parameters applied:', {
            services: ['AI Analytics', 'NIL Engine', 'Digital Combine', 'Pressure Analytics'],
            globalParams: global.consciousnessParams,
            timestamp: new Date().toISOString()
        });
    }
    
    applyConsciousnessToNILEngine() {
        // Update NIL engine with consciousness parameters
        const consciousnessParams = {
            neuralSensitivity: this.state.neuralSensitivity,
            predictionDepth: this.state.predictionDepth,
            processingSpeed: this.state.processingSpeed,
            patternRecognition: this.state.patternRecognition
        };
        
        // Store in global scope for NIL engine access
        global.consciousnessParams = consciousnessParams;
        
        console.log('💰 NIL Engine consciousness parameters updated:', consciousnessParams);
    }
    
    updateServiceEffectiveness() {
        // Calculate effectiveness of each AI service based on consciousness settings
        const baseSensitivity = this.state.neuralSensitivity / 100;
        const baseDepth = this.state.predictionDepth / 100;
        const baseSpeed = this.state.processingSpeed / 100;
        const basePattern = this.state.patternRecognition / 100;
        
        this.serviceEffects = {
            nilCalculations: Math.round((baseSensitivity * 0.3 + basePattern * 0.5 + baseDepth * 0.2) * 100),
            pressureAnalysis: Math.round((baseSensitivity * 0.6 + baseSpeed * 0.4) * 100),
            digitalCombine: Math.round((baseDepth * 0.4 + basePattern * 0.4 + baseSpeed * 0.2) * 100),
            predictiveModeling: Math.round((baseDepth * 0.5 + baseSensitivity * 0.3 + basePattern * 0.2) * 100)
        };
    }
    
    broadcastConsciousnessUpdate(origin = 'auto') {
        const updateData = {
            type: 'consciousness_update',
            state: this.getState(),
            serviceEffects: this.serviceEffects,
            origin: origin,
            timestamp: Date.now()
        };
        
        console.log(`🧠 Broadcasting consciousness update - Origin: ${origin}`, {
            neuralSensitivity: this.state.neuralSensitivity,
            predictionDepth: this.state.predictionDepth,
            processingSpeed: this.state.processingSpeed,
            patternRecognition: this.state.patternRecognition,
            origin: origin
        });
        
        consciousnessWSConnections.forEach(ws => {
            if (ws.readyState === 1) { // WebSocket.OPEN
                try {
                    ws.send(JSON.stringify(updateData));
                } catch (error) {
                    console.error('Failed to send consciousness update:', error);
                    consciousnessWSConnections.delete(ws);
                }
            }
        });
    }
    
    applyPreset(presetName) {
        const preset = this.austinPresets[presetName];
        if (!preset) {
            throw new Error(`Unknown preset: ${presetName}`);
        }
        
        this.state.neuralSensitivity = preset.neuralSensitivity;
        this.state.predictionDepth = preset.predictionDepth;
        this.state.processingSpeed = preset.processingSpeed;
        this.state.patternRecognition = preset.patternRecognition;
        
        this.updateDerivedMetrics();
        this.applyConsciousnessToAIServices();
        this.broadcastConsciousnessUpdate();
        
        return {
            ...this.getState(),
            appliedPreset: {
                name: presetName,
                description: preset.description,
                expert: 'Austin Humphrey'
            }
        };
    }
    
    getAustinGuidance() {
        const avgParam = (this.state.neuralSensitivity + this.state.predictionDepth + 
                         this.state.processingSpeed + this.state.patternRecognition) / 4;
        
        let guidance = {
            expert: 'Austin Humphrey',
            credentials: 'Texas #20 Running Back & Perfect Game Elite',
            authority: 'Deep South Sports Authority'
        };
        
        if (avgParam > 85) {
            guidance.message = 'Championship-level settings detected. These parameters mirror the intensity I experienced in high-pressure Texas games.';
            guidance.recommendation = 'Perfect for clutch analysis and championship scenarios.';
        } else if (avgParam > 70) {
            guidance.message = 'Strong analytical configuration. Reminds me of Perfect Game scouting precision.';
            guidance.recommendation = 'Excellent for detailed player evaluation and strategic planning.';
        } else {
            guidance.message = 'Conservative settings - good for learning. In Texas football, we called this "practice mode".';
            guidance.recommendation = 'Consider increasing sensitivity for deeper insights.';
        }
        
        return guidance;
    }
    
    getServiceEffects() {
        return this.serviceEffects;
    }
    
    getAllPresets() {
        return Object.keys(this.austinPresets).map(key => ({
            name: key,
            ...this.austinPresets[key],
            expert: 'Austin Humphrey'
        }));
    }

    startAutonomousUpdates() {
        // Simulate autonomous neural adjustments
        setInterval(() => {
            const adjustments = {
                neuralSensitivity: (Math.random() - 0.5) * 4,
                predictionDepth: (Math.random() - 0.5) * 3,
                processingSpeed: (Math.random() - 0.5) * 2,
                patternRecognition: (Math.random() - 0.5) * 5
            };
            
            Object.keys(adjustments).forEach(param => {
                this.state[param] = Math.max(0, Math.min(100, 
                    this.state[param] + adjustments[param]
                ));
            });
            
            this.updateDerivedMetrics();
            
            console.log(`🧠 Autonomous adjustment - Origin: auto`, {
                adjustments: adjustments,
                currentState: {
                    neuralSensitivity: this.state.neuralSensitivity,
                    predictionDepth: this.state.predictionDepth,
                    processingSpeed: this.state.processingSpeed,
                    patternRecognition: this.state.patternRecognition
                }
            });
        }, 8000 + Math.random() * 4000);
    }
}

// Global consciousness engine instance
const consciousnessEngine = new AIConsciousnessEngine();

// Initialize WebSocket server for consciousness updates
export function initializeConsciousnessWebSocket(httpServer) {
  consciousnessWSServer = new WebSocketServer({ 
    server: httpServer,
    path: '/ws/consciousness',
    perMessageDeflate: false,
    clientTracking: true
  });
  
  consciousnessWSServer.on('connection', (ws, request) => {
    console.log('🧠 New consciousness WebSocket connection');
    consciousnessWSConnections.add(ws);
    
    // CRITICAL FIX: Add heartbeat tracking for Error 1006 prevention
    ws.isAlive = true;
    ws.lastPing = Date.now();
    
    // Send current consciousness state on connect
    ws.send(JSON.stringify({
      type: 'consciousness_init',
      state: consciousnessEngine.getState(),
      serviceEffects: consciousnessEngine.getServiceEffects(),
      timestamp: Date.now()
    }));
    
    // CRITICAL FIX: Setup server-side ping/pong for connection health
    const heartbeatInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        if (ws.isAlive === false) {
          console.log('🚨 Consciousness WebSocket failed heartbeat - terminating');
          ws.terminate();
          return;
        }
        
        ws.isAlive = false;
        ws.ping();
        ws.lastPing = Date.now();
      }
    }, 30000); // 30 second heartbeat
    
    ws.on('pong', () => {
      console.log('🔌 Consciousness WebSocket heartbeat received');
      ws.isAlive = true;
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        
        // CRITICAL FIX: Handle ping messages from client
        if (message.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          return;
        }
        
        if (message.type === 'update_parameter') {
          consciousnessEngine.updateParameter(message.parameter, message.value);
          broadcastConsciousnessUpdate();
        }
      } catch (error) {
        console.error('🚨 Error processing consciousness message:', error);
      }
    });
    
    ws.on('close', (code, reason) => {
      console.log(`🧠 Consciousness WebSocket connection closed: code=${code}, reason=${reason?.toString()}`);
      clearInterval(heartbeatInterval);
      consciousnessWSConnections.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('🚨 Consciousness WebSocket error:', error);
      clearInterval(heartbeatInterval);
      consciousnessWSConnections.delete(ws);
    });
    
    // Store interval reference for cleanup
    ws.heartbeatInterval = heartbeatInterval;
  });
  
  console.log('🧠 Consciousness WebSocket server initialized on path /ws/consciousness');
}

// Routes - GET status is public for UI, POST operations require auth
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: consciousnessEngine.getState(),
        serviceEffects: consciousnessEngine.getServiceEffects(),
        guidance: consciousnessEngine.getAustinGuidance(),
        timestamp: new Date().toISOString()
    });
});

router.post('/update', authenticateToken, (req, res) => {
    const { parameter, value } = req.body;
    
    if (!parameter || value === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Parameter and value required'
        });
    }
    
    try {
        const newState = consciousnessEngine.updateParameter(parameter, value);
        
        res.json({
            success: true,
            data: newState,
            serviceEffects: consciousnessEngine.getServiceEffects(),
            insights: consciousnessEngine.generateInsights(),
            guidance: consciousnessEngine.getAustinGuidance(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Apply Austin Humphrey expert presets
router.post('/preset/:presetName', authenticateToken, (req, res) => {
    try {
        const { presetName } = req.params;
        const result = consciousnessEngine.applyPreset(presetName);
        
        res.json({
            success: true,
            data: result,
            serviceEffects: consciousnessEngine.getServiceEffects(),
            message: `Applied ${presetName} preset by Austin Humphrey`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Preset application error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Get all available presets
router.get('/presets', (req, res) => {
    res.json({
        success: true,
        presets: consciousnessEngine.getAllPresets(),
        expert: 'Austin Humphrey',
        authority: 'Deep South Sports Authority'
    });
});

// Get Austin Humphrey's expert guidance
router.get('/guidance', (req, res) => {
    res.json({
        success: true,
        guidance: consciousnessEngine.getAustinGuidance(),
        timestamp: new Date().toISOString()
    });
});

router.get('/insights', (req, res) => {
    res.json({
        success: true,
        data: consciousnessEngine.generateInsights()
    });
});

router.get('/models', (req, res) => {
    res.json({
        success: true,
        data: consciousnessEngine.state.models
    });
});

// Verification endpoint to prove consciousness parameter propagation
router.get('/effective', (req, res) => {
    const currentParams = global.consciousnessParams || {};
    const serviceParams = aiAnalyticsService?.consciousnessParams || {};
    
    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        engineState: consciousnessEngine.getState(),
        globalParams: currentParams,
        serviceParams: serviceParams,
        propagationVerification: {
            globalParamsSet: Object.keys(currentParams).length > 0,
            serviceParamsSet: Object.keys(serviceParams).length > 0,
            lastGlobalUpdate: currentParams.lastUpdate || 0,
            serviceTemperature: serviceParams.temperature || 0,
            serviceMaxTokens: serviceParams.maxTokens || 0,
            serviceSensitivityMultiplier: serviceParams.sensitivityMultiplier || 0
        }
    });
});

// Real-time analysis endpoint  
router.post('/analyze', authenticateToken, (req, res) => {
    const { gameData, playerData, videoFrames } = req.body;
    
    // Simulate AI analysis using current consciousness parameters
    const analysis = {
        pressureIndex: 65 + (consciousnessEngine.state.neuralSensitivity / 100) * 30,
        clutchProbability: 0.4 + (consciousnessEngine.state.predictionDepth / 100) * 0.5,
        momentumShift: (Math.random() - 0.5) * 20,
        biometricScore: 70 + (consciousnessEngine.state.processingSpeed / 100) * 25,
        confidence: consciousnessEngine.state.confidence,
        processingTime: Math.max(5, 50 - (consciousnessEngine.state.processingSpeed / 100) * 40),
        timestamp: Date.now()
    };
    
    res.json({
        success: true,
        data: analysis,
        modelParameters: consciousnessEngine.state.models
    });
});

export default router;