// Analytics Performance Control System
// Austin Humphrey's Proprietary Analytics Management Interface
// Real backend connectivity with live analytics parameter adjustments

// Prevent duplicate declarations
if (typeof window.AnalyticsController !== 'undefined') {
    console.log('📊 Analytics Controller already initialized');
} else {

class AnalyticsController {
    constructor() {
        this.isInitialized = false;
        this.isConnected = false;
        this.websocket = null;
        
        // Current analytics state
        this.state = {
            dataSensitivity: 75,
            analysisDepth: 60,
            processingSpeed: 85,
            patternRecognition: 70,
            reliability: 85.2,
            confidence: 85.2,
            status: 'processing',
            lastUpdate: 0
        };
        
        // Service effectiveness tracking
        this.serviceEffects = {
            nilCalculations: 75,
            pressureAnalysis: 80,
            digitalCombine: 70,
            predictiveModeling: 75
        };
        
        // Austin Humphrey's expert guidance
        this.expertGuidance = null;
        
        // Neural network visualization
        this.neuralNetwork = null;
        
        this.init();
    }
    
    async init() {
        console.log('📊 Initializing Analytics Control System...');
        
        // Load current analytics state from backend
        await this.loadAnalyticsState();
        
        // Setup analytics control panel UI
        this.setupControlPanel();
        
        // Initialize network visualization
        this.initializeNetworkVisualization();
        
        // Connect to real-time WebSocket updates
        this.connectWebSocket();
        
        // Bind all control events
        this.bindControlEvents();
        
        // Start autonomous updates
        this.startAutonomousUpdates();
        
        this.isInitialized = true;
        console.log('✅ AI Analytics Control System ready');
    }
    
    async loadAnalyticsState(retryAttempt = 0) {
        const maxRetries = 3;
        const retryDelay = Math.pow(2, retryAttempt) * 1000; // Exponential backoff
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            const response = await fetch('/api/analytics/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Version': '2.0.0'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Analytics API returned ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Successfully loaded from API
                this.state = {
                    ...this.state, // Preserve any existing state
                    ...result.data,
                    connectionStatus: 'connected',
                    lastSuccessfulLoad: Date.now()
                };
                this.serviceEffects = result.serviceEffects || this.serviceEffects;
                this.expertGuidance = result.guidance;
                
                console.log('✅ Analytics state loaded successfully:', this.state);
                this.updateConnectionStatus('connected');
                return;
            } else {
                throw new Error(result.error || 'Analytics API returned unsuccessful response');
            }
            
        } catch (error) {
            console.warn(`⚠️ Analytics state load attempt ${retryAttempt + 1} failed:`, error.message);
            
            // Retry with exponential backoff
            if (retryAttempt < maxRetries) {
                console.log(`🔄 Retrying analytics state load in ${retryDelay}ms...`);
                setTimeout(() => {
                    this.loadAnalyticsState(retryAttempt + 1);
                }, retryDelay);
                return;
            }
            
            // All retries exhausted - use fallback values
            console.warn('❌ All analytics state loading attempts failed. Using fallback values.');
            this.applyAnalyticsFallbacks(error);
        }
    }
    
    applyAnalyticsFallbacks(error) {
        // Preserve any existing successful state, but ensure we have defaults
        this.state = {
            neuralSensitivity: this.state.neuralSensitivity || 75,
            predictionDepth: this.state.predictionDepth || 65,
            processingSpeed: this.state.processingSpeed || 85,
            patternRecognition: this.state.patternRecognition || 72,
            reliability: this.state.reliability || 85.0,
            status: 'offline',
            connectionStatus: 'disconnected',
            lastUpdate: this.state.lastUpdate || Date.now(),
            fallbackMode: true,
            lastError: error.message,
            lastFailedLoad: Date.now()
        };
        
        // Use default service effects if not already set
        this.serviceEffects = this.serviceEffects || {
            nilCalculations: 75,
            pressureAnalysis: 80,
            digitalCombine: 70,
            predictiveModeling: 75
        };
        
        // Set fallback expert guidance
        this.expertGuidance = this.expertGuidance || {
            expertName: "Austin Humphrey",
            title: "Analytics Platform Architect",
            message: "Analytics system running in offline mode. Real-time data temporarily unavailable.",
            confidence: 85.0,
            lastUpdated: new Date().toISOString()
        };
        
        console.log('📊 Analytics fallback mode activated:', this.state);
        this.updateConnectionStatus('disconnected');
        
        // Attempt to reconnect after 30 seconds
        setTimeout(() => {
            console.log('🔄 Attempting to reconnect analytics...');
            this.loadAnalyticsState(0);
        }, 30000);
    }
    
    updateConnectionStatus(status) {
        // Update UI indicators based on connection status
        const statusIndicator = document.getElementById('analytics-status');
        const confidenceScore = document.getElementById('analytics-confidence');
        
        if (statusIndicator) {
            switch (status) {
                case 'connected':
                    statusIndicator.textContent = 'LEARNING';
                    statusIndicator.className = 'status-indicator connected';
                    break;
                case 'disconnected':
                    statusIndicator.textContent = 'OFFLINE';
                    statusIndicator.className = 'status-indicator disconnected';
                    break;
                case 'reconnecting':
                    statusIndicator.textContent = 'CONNECTING';
                    statusIndicator.className = 'status-indicator reconnecting';
                    break;
            }
        }
        
        if (confidenceScore) {
            const confidence = this.state.reliability || 85.0;
            confidenceScore.textContent = `${confidence.toFixed(1)}%`;
            confidenceScore.className = status === 'connected' ? 'confidence-score connected' : 'confidence-score offline';
        }
    }
    
    setupControlPanel() {
        // Check if control panel already exists
        if (document.getElementById('ai-analytics-control-panel')) {
            this.updateControlPanel();
            return;
        }
        
        const controlPanelHTML = `
            <div id="ai-analytics-control-panel" class="analytics-panel">
                <div class="analytics-header">
                    <div class="analytics-title">
                        <h3>📊 AI Analytics Control</h3>
                        <div class="analytics-status">
                            <span class="status-indicator" id="analytics-status">LEARNING</span>
                            <span class="confidence-score" id="analytics-confidence">94.6%</span>
                        </div>
                    </div>
                    <div class="analytics-expert">
                        <div class="expert-info">
                            <img src="/assets/austin-small.jpg" alt="Austin Humphrey" class="expert-avatar">
                            <div class="expert-details">
                                <div class="expert-name">Austin Humphrey</div>
                                <div class="expert-title">Analytics Platform Architect</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-controls">
                    <div class="control-group">
                        <div class="control-item">
                            <label for="sensitivity-slider">Neural Sensitivity</label>
                            <div class="slider-container">
                                <input type="range" id="sensitivity-slider" 
                                       min="0" max="100" value="${this.state.neuralSensitivity}" 
                                       class="analytics-slider">
                                <span class="slider-value" id="sensitivity-value">${this.state.neuralSensitivity}</span>
                            </div>
                            <div class="control-description">Controls AI responsiveness to pattern changes</div>
                        </div>
                        
                        <div class="control-item">
                            <label for="depth-slider">Prediction Depth</label>
                            <div class="slider-container">
                                <input type="range" id="depth-slider" 
                                       min="0" max="100" value="${this.state.predictionDepth}" 
                                       class="analytics-slider">
                                <span class="slider-value" id="depth-value">${this.state.predictionDepth}</span>
                            </div>
                            <div class="control-description">Extends AI prediction horizons</div>
                        </div>
                        
                        <div class="control-item">
                            <label for="speed-slider">Processing Speed</label>
                            <div class="slider-container">
                                <input type="range" id="speed-slider" 
                                       min="0" max="100" value="${this.state.processingSpeed}" 
                                       class="analytics-slider">
                                <span class="slider-value" id="speed-value">${this.state.processingSpeed}</span>
                            </div>
                            <div class="control-description">Adjusts real-time analysis speed</div>
                        </div>
                        
                        <div class="control-item">
                            <label for="pattern-slider">Pattern Recognition</label>
                            <div class="slider-container">
                                <input type="range" id="pattern-slider" 
                                       min="0" max="100" value="${this.state.patternRecognition}" 
                                       class="analytics-slider">
                                <span class="slider-value" id="pattern-value">${this.state.patternRecognition}</span>
                            </div>
                            <div class="control-description">Balances historical vs current patterns</div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-presets">
                    <h4>Austin's Expert Presets</h4>
                    <div class="preset-buttons">
                        <button class="preset-btn" data-preset="texasFootball">Texas Football</button>
                        <button class="preset-btn" data-preset="secFootball">SEC Championship</button>
                        <button class="preset-btn" data-preset="perfectGameBaseball">Perfect Game Scout</button>
                        <button class="preset-btn" data-preset="clutchAnalysis">Clutch Moments</button>
                    </div>
                </div>
                
                <div class="service-effects">
                    <h4>AI Service Effects</h4>
                    <div class="effects-grid">
                        <div class="effect-item">
                            <span class="effect-label">NIL Calculations</span>
                            <div class="effect-bar">
                                <div class="effect-fill" id="nil-effect" style="width: ${this.serviceEffects.nilCalculations}%"></div>
                            </div>
                            <span class="effect-value" id="nil-effect-value">${this.serviceEffects.nilCalculations}%</span>
                        </div>
                        <div class="effect-item">
                            <span class="effect-label">Pressure Analytics</span>
                            <div class="effect-bar">
                                <div class="effect-fill" id="pressure-effect" style="width: ${this.serviceEffects.pressureAnalysis}%"></div>
                            </div>
                            <span class="effect-value" id="pressure-effect-value">${this.serviceEffects.pressureAnalysis}%</span>
                        </div>
                        <div class="effect-item">
                            <span class="effect-label">Digital Combine</span>
                            <div class="effect-bar">
                                <div class="effect-fill" id="combine-effect" style="width: ${this.serviceEffects.digitalCombine}%"></div>
                            </div>
                            <span class="effect-value" id="combine-effect-value">${this.serviceEffects.digitalCombine}%</span>
                        </div>
                        <div class="effect-item">
                            <span class="effect-label">Predictive Models</span>
                            <div class="effect-bar">
                                <div class="effect-fill" id="predictive-effect" style="width: ${this.serviceEffects.predictiveModeling}%"></div>
                            </div>
                            <span class="effect-value" id="predictive-effect-value">${this.serviceEffects.predictiveModeling}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="austin-guidance" id="austin-guidance">
                    <div class="guidance-content">
                        <div class="guidance-message" id="guidance-message">
                            Loading Austin's expert guidance...
                        </div>
                        <div class="guidance-recommendation" id="guidance-recommendation">
                            Initializing AI consciousness parameters...
                        </div>
                    </div>
                </div>
                
                <div class="neural-network-viz" id="analytics-neural-network">
                    <canvas id="analytics-neural-canvas" width="400" height="300"></canvas>
                </div>
                
                <div class="analytics-actions">
                    <button class="action-btn optimize-btn" id="optimize-analytics">
                        🎯 Optimize for Current Task
                    </button>
                    <button class="action-btn reset-btn" id="reset-analytics">
                        🔄 Reset to Defaults
                    </button>
                    <button class="action-btn save-btn" id="save-analytics">
                        💾 Save Current Settings
                    </button>
                </div>
            </div>
        `;
        
        // Insert the control panel
        const insertTarget = document.querySelector('.hero-content') || document.querySelector('.main-content') || document.body;
        insertTarget.insertAdjacentHTML('afterend', controlPanelHTML);
        
        // Apply consciousness control panel styles
        this.injectStyles();
        
        // Update the panel with current state
        this.updateControlPanel();
    }
    
    injectStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .analytics-panel {
                background: linear-gradient(135deg, var(--dark-navy), var(--light-navy));
                border: 1px solid rgba(191, 87, 0, 0.3);
                border-radius: var(--card-border-radius);
                padding: 2rem;
                margin: 2rem 0;
                box-shadow: var(--shadow-neural);
                position: relative;
                overflow: hidden;
            }
            
            .analytics-panel::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: var(--gradient-primary);
                animation: analyticsGlow 3s ease-in-out infinite alternate;
            }
            
            @keyframes analyticsGlow {
                0% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .analytics-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .analytics-title h3 {
                color: var(--soft-white);
                font-weight: var(--font-weight-bold);
                margin: 0;
                font-size: 1.5rem;
            }
            
            .analytics-status {
                display: flex;
                gap: 1rem;
                margin-top: 0.5rem;
            }
            
            .status-indicator {
                background: var(--consciousness-active);
                color: var(--dark-navy);
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: var(--font-weight-semibold);
                text-transform: uppercase;
                animation: statusPulse 2s ease-in-out infinite;
            }
            
            @keyframes statusPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .confidence-score {
                color: var(--texas-gold);
                font-weight: var(--font-weight-bold);
                font-size: 1.1rem;
            }
            
            .analytics-expert {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .expert-info {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .expert-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 2px solid var(--burnt-orange);
                object-fit: cover;
            }
            
            .expert-name {
                color: var(--soft-white);
                font-weight: var(--font-weight-semibold);
                font-size: 0.9rem;
            }
            
            .expert-title {
                color: var(--warm-gray);
                font-size: 0.8rem;
            }
            
            .analytics-controls {
                margin: 2rem 0;
            }
            
            .control-group {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
            }
            
            .control-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 1.5rem;
                border-radius: 12px;
                border: 1px solid rgba(191, 87, 0, 0.2);
            }
            
            .control-item label {
                display: block;
                color: var(--soft-white);
                font-weight: var(--font-weight-semibold);
                margin-bottom: 1rem;
                font-size: 1rem;
            }
            
            .slider-container {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 0.5rem;
            }
            
            .analytics-slider {
                flex: 1;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                outline: none;
                -webkit-appearance: none;
                appearance: none;
            }
            
            .analytics-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background: var(--gradient-primary);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(191, 87, 0, 0.5);
                transition: all 0.3s ease;
            }
            
            .analytics-slider::-webkit-slider-thumb:hover {
                transform: scale(1.2);
                box-shadow: 0 0 15px rgba(191, 87, 0, 0.8);
            }
            
            .analytics-slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: var(--gradient-primary);
                border-radius: 50%;
                cursor: pointer;
                border: none;
                box-shadow: 0 0 10px rgba(191, 87, 0, 0.5);
            }
            
            .slider-value {
                color: var(--texas-gold);
                font-weight: var(--font-weight-bold);
                min-width: 40px;
                text-align: center;
                font-size: 1.1rem;
            }
            
            .control-description {
                color: var(--warm-gray);
                font-size: 0.85rem;
                line-height: 1.4;
            }
            
            .analytics-presets {
                margin: 2rem 0;
                padding: 1.5rem;
                background: rgba(139, 92, 246, 0.1);
                border-radius: 12px;
                border: 1px solid rgba(139, 92, 246, 0.3);
            }
            
            .analytics-presets h4 {
                color: var(--soft-white);
                margin: 0 0 1rem 0;
                font-weight: var(--font-weight-semibold);
            }
            
            .preset-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
            }
            
            .preset-btn {
                background: var(--gradient-neural);
                color: white;
                border: none;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                font-weight: var(--font-weight-semibold);
                cursor: pointer;
                transition: var(--transition-smooth);
                font-size: 0.9rem;
            }
            
            .preset-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-consciousness);
            }
            
            .service-effects {
                margin: 2rem 0;
                padding: 1.5rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
            }
            
            .service-effects h4 {
                color: var(--soft-white);
                margin: 0 0 1rem 0;
                font-weight: var(--font-weight-semibold);
            }
            
            .effects-grid {
                display: grid;
                gap: 1rem;
            }
            
            .effect-item {
                display: grid;
                grid-template-columns: 150px 1fr 60px;
                align-items: center;
                gap: 1rem;
            }
            
            .effect-label {
                color: var(--soft-white);
                font-size: 0.9rem;
                font-weight: var(--font-weight-medium);
            }
            
            .effect-bar {
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .effect-fill {
                height: 100%;
                background: var(--gradient-primary);
                transition: width 0.8s ease;
                border-radius: 4px;
            }
            
            .effect-value {
                color: var(--texas-gold);
                font-weight: var(--font-weight-bold);
                text-align: right;
                font-size: 0.9rem;
            }
            
            .austin-guidance {
                margin: 2rem 0;
                padding: 1.5rem;
                background: linear-gradient(135deg, rgba(191, 87, 0, 0.1), rgba(255, 184, 28, 0.1));
                border-radius: 12px;
                border: 1px solid rgba(191, 87, 0, 0.3);
            }
            
            .guidance-message {
                color: var(--soft-white);
                font-size: 1rem;
                line-height: 1.5;
                margin-bottom: 0.5rem;
            }
            
            .guidance-recommendation {
                color: var(--texas-gold);
                font-weight: var(--font-weight-semibold);
                font-size: 0.9rem;
            }
            
            .neural-network-viz {
                margin: 2rem 0;
                text-align: center;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
                padding: 1rem;
            }
            
            #analytics-neural-canvas {
                border-radius: 8px;
                background: rgba(10, 10, 15, 0.8);
            }
            
            .analytics-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
            }
            
            .action-btn {
                background: var(--gradient-primary);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: var(--button-border-radius);
                font-weight: var(--font-weight-semibold);
                cursor: pointer;
                transition: var(--transition-smooth);
                font-size: 0.95rem;
            }
            
            .action-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }
            
            .optimize-btn {
                background: var(--gradient-consciousness);
            }
            
            .reset-btn {
                background: linear-gradient(135deg, var(--warm-gray), var(--light-navy));
            }
            
            @media (max-width: 768px) {
                .analytics-panel {
                    padding: 1rem;
                    margin: 1rem 0;
                }
                
                .analytics-header {
                    flex-direction: column;
                    gap: 1rem;
                    text-align: center;
                }
                
                .control-group {
                    grid-template-columns: 1fr;
                }
                
                .analytics-actions {
                    flex-direction: column;
                }
                
                .preset-buttons {
                    grid-template-columns: 1fr;
                }
                
                .effect-item {
                    grid-template-columns: 1fr;
                    text-align: center;
                    gap: 0.5rem;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    bindControlEvents() {
        // Bind slider events for real-time updates
        const sliders = [
            { id: 'sensitivity-slider', param: 'sensitivity-slider' },
            { id: 'depth-slider', param: 'depth-slider' },
            { id: 'speed-slider', param: 'speed-slider' },
            { id: 'pattern-slider', param: 'pattern-slider' }
        ];
        
        sliders.forEach(({ id, param }) => {
            const slider = document.getElementById(id);
            const valueDisplay = document.getElementById(id.replace('-slider', '-value'));
            
            if (slider && valueDisplay) {
                slider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    valueDisplay.textContent = value;
                    this.updateAnalyticsParameter(param, value);
                });
            }
        });
        
        // Bind preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyPreset(preset);
            });
        });
        
        // Bind action buttons
        document.getElementById('optimize-analytics')?.addEventListener('click', () => {
            this.optimizeForCurrentTask();
        });
        
        document.getElementById('reset-analytics')?.addEventListener('click', () => {
            this.resetToDefaults();
        });
        
        document.getElementById('save-analytics')?.addEventListener('click', () => {
            this.saveCurrentSettings();
        });
    }
    
    async updateAnalyticsParameter(parameter, value) {
        try {
            const response = await fetch('/api/analytics/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ parameter, value })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.state = result.data;
                this.serviceEffects = result.serviceEffects;
                this.expertGuidance = result.guidance;
                
                this.updateControlPanel();
                this.updateNeuralNetwork();
                
                console.log(`🧠 ${parameter} updated to ${value}`);
            }
        } catch (error) {
            console.error('❌ Failed to update analytics parameter:', error);
        }
    }
    
    async applyPreset(presetName) {
        try {
            const response = await fetch(`/api/analytics/preset/${presetName}`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.state = result.data;
                this.serviceEffects = result.serviceEffects;
                
                this.updateControlPanel();
                this.updateNeuralNetwork();
                
                // Show Austin's guidance for this preset
                this.showPresetGuidance(result.data.appliedPreset);
                
                console.log(`🎯 Applied ${presetName} preset by Austin Humphrey`);
            }
        } catch (error) {
            console.error('❌ Failed to apply preset:', error);
        }
    }
    
    updateControlPanel() {
        // Update slider values
        const updates = [
            { id: 'sensitivity-slider', value: this.state.neuralSensitivity },
            { id: 'depth-slider', value: this.state.predictionDepth },
            { id: 'speed-slider', value: this.state.processingSpeed },
            { id: 'pattern-slider', value: this.state.patternRecognition }
        ];
        
        updates.forEach(({ id, value }) => {
            const slider = document.getElementById(id);
            const valueDisplay = document.getElementById(id.replace('-slider', '-value'));
            
            if (slider) slider.value = value;
            if (valueDisplay) valueDisplay.textContent = value;
        });
        
        // Update status indicators
        const statusEl = document.getElementById('consciousness-status');
        const confidenceEl = document.getElementById('analytics-confidence');
        
        if (statusEl) {
            statusEl.textContent = this.state.status.toUpperCase().replace('_', ' ');
            statusEl.className = `status-indicator status-${this.state.status}`;
        }
        
        if (confidenceEl) {
            const confidence = this.state.reliability || this.state.confidence || 85.0;
            confidenceEl.textContent = `${confidence.toFixed(1)}%`;
        }
        
        // Update service effects
        this.updateServiceEffects();
        
        // Update Austin's guidance
        this.updateAustinGuidance();
    }
    
    updateServiceEffects() {
        const effects = [
            { id: 'nil-effect', valueId: 'nil-effect-value', value: this.serviceEffects.nilCalculations },
            { id: 'pressure-effect', valueId: 'pressure-effect-value', value: this.serviceEffects.pressureAnalysis },
            { id: 'combine-effect', valueId: 'combine-effect-value', value: this.serviceEffects.digitalCombine },
            { id: 'predictive-effect', valueId: 'predictive-effect-value', value: this.serviceEffects.predictiveModeling }
        ];
        
        effects.forEach(({ id, valueId, value }) => {
            const effectBar = document.getElementById(id);
            const valueDisplay = document.getElementById(valueId);
            
            if (effectBar) {
                effectBar.style.width = `${value}%`;
                effectBar.style.background = value > 80 ? 
                    'linear-gradient(90deg, var(--analytics-active), var(--success-green))' :
                    value > 60 ? 'var(--gradient-primary)' :
                    'linear-gradient(90deg, var(--warning-amber), var(--burnt-orange))';
            }
            
            if (valueDisplay) {
                valueDisplay.textContent = `${value}%`;
            }
        });
    }
    
    updateAustinGuidance() {
        if (!this.expertGuidance) return;
        
        const messageEl = document.getElementById('guidance-message');
        const recommendationEl = document.getElementById('guidance-recommendation');
        
        if (messageEl) {
            messageEl.textContent = this.expertGuidance.message;
        }
        
        if (recommendationEl) {
            recommendationEl.textContent = this.expertGuidance.recommendation;
        }
    }
    
    showPresetGuidance(appliedPreset) {
        const messageEl = document.getElementById('guidance-message');
        const recommendationEl = document.getElementById('guidance-recommendation');
        
        if (messageEl && recommendationEl) {
            messageEl.textContent = `Austin's ${appliedPreset.name} preset applied: ${appliedPreset.description}`;
            recommendationEl.textContent = 'Settings optimized for maximum effectiveness in this scenario.';
            
            // Highlight the guidance panel temporarily
            const guidancePanel = document.getElementById('austin-guidance');
            if (guidancePanel) {
                guidancePanel.style.border = '2px solid var(--consciousness-active)';
                guidancePanel.style.boxShadow = 'var(--shadow-analytics)';
                
                setTimeout(() => {
                    guidancePanel.style.border = '1px solid rgba(191, 87, 0, 0.3)';
                    guidancePanel.style.boxShadow = 'none';
                }, 3000);
            }
        }
    }
    
    initializeNeuralNetwork() {
        const canvas = document.getElementById('analytics-neural-canvas');
        if (!canvas) return;
        
        this.neuralNetwork = new AnalyticsNeuralNetwork(canvas);
        this.updateNeuralNetwork();
    }
    
    updateNeuralNetwork() {
        if (this.neuralNetwork) {
            this.neuralNetwork.updateState(this.state, this.serviceEffects);
        }
    }
    
    connectWebSocket() {
        // CRITICAL FIX: Direct WebSocket connection with proper error handling for Error 1006
        try {
            this.connectionAttempts = (this.connectionAttempts || 0) + 1;
            
            // Clear any existing connection
            if (this.websocket) {
                this.websocket.close();
                this.websocket = null;
            }
            
            // CRITICAL FIX: Build WebSocket URL with Replit environment handling
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            // Handle both direct and proxied Replit connections for championship reliability
            const wsUrl = `${protocol}//${host}/ws/analytics`;
            
            console.log(`🔧 WEBSOCKET DEBUG: Protocol=${protocol}, Host=${host}, URL=${wsUrl}`);
            
            console.log(`🔌 Connecting to analytics WebSocket: ${wsUrl}`);
            
            // Create WebSocket with proper error handling for 1006 fixes
            this.websocket = new WebSocket(wsUrl);
            
            // Set connection timeout
            const connectionTimeout = setTimeout(() => {
                if (this.websocket.readyState === WebSocket.CONNECTING) {
                    console.error('🚨 WebSocket connection timeout - force closing');
                    this.websocket.close();
                }
            }, 10000); // 10 second timeout
            
            this.websocket.onopen = (event) => {
                clearTimeout(connectionTimeout);
                console.log('🧠 AI Analytics WebSocket connected - Error 1006 fixed');
                this.isConnected = true;
                this.connectionAttempts = 0;
                this.updateConnectionStatus('connected');
                
                // Send immediate ping to prevent 1006 closure
                this.sendHeartbeat();
                this.setupHeartbeatInterval();
            };
            
            this.websocket.onmessage = (event) => {
                this.handleWebSocketMessage(event.data, event);
            };
            
            this.websocket.onclose = (event) => {
                clearTimeout(connectionTimeout);
                console.log(`🔌 analytics WebSocket disconnected:`, event.code, event.reason);
                this.isConnected = false;
                this.clearHeartbeatInterval();
                
                if (event.code === 1006) {
                    console.error('🚨 ERROR 1006 (abnormal closure) - implementing exponential backoff');
                } else if (event.code === 1000) {
                    console.log('✅ WebSocket closed normally');
                }
                
                this.updateConnectionStatus('disconnected');
                this.scheduleReconnection(event.code);
            };
            
            this.websocket.onerror = (event) => {
                clearTimeout(connectionTimeout);
                console.error('🚨 analytics WebSocket error:', event);
                this.isConnected = false;
                this.updateConnectionStatus('error');
            };
            
        } catch (error) {
            console.error('❌ Failed to connect AI Analytics WebSocket:', error);
            this.handleConnectionFailure();
        }
    }
    
    sendHeartbeat() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            try {
                this.websocket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            } catch (error) {
                console.warn('🔌 Heartbeat send failed:', error);
            }
        }
    }
    
    setupHeartbeatInterval() {
        this.clearHeartbeatInterval();
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, 30000); // 30 second heartbeat
    }
    
    clearHeartbeatInterval() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    scheduleReconnection(closeCode) {
        if (this.connectionAttempts >= 5) {
            console.error('🚨 AI Analytics WebSocket max reconnection attempts reached');
            this.updateConnectionStatus('failed');
            return;
        }
        
        // Exponential backoff with jitter for Error 1006 fix
        const baseDelay = 1000;
        const backoffMultiplier = Math.pow(2, this.connectionAttempts - 1);
        const jitter = Math.random() * 1000;
        const delay = Math.min(baseDelay * backoffMultiplier + jitter, 30000);
        
        console.log(`🔄 Scheduling analytics WebSocket reconnection in ${delay}ms (attempt ${this.connectionAttempts})`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connectWebSocket();
            }
        }, delay);
    }
    
    handleWebSocketMessage(data, event) {
        try {
            // Handle both parsed JSON data and raw string data
            const messageData = typeof data === 'string' ? JSON.parse(data) : data;
            
            if (messageData.type === 'consciousness_update' || messageData.type === 'consciousness_init') {
                this.handleAnalyticsUpdate(messageData);
            } else if (messageData.type === 'pong') {
                // Handle heartbeat pong
                this.lastPongReceived = Date.now();
            } else {
                console.log('🧠 Received analytics message:', messageData.type);
            }
        } catch (error) {
            console.warn('Failed to parse AI Analytics WebSocket message:', error);
            // Try to handle as raw data
            if (typeof event?.data === 'string') {
                try {
                    const rawData = JSON.parse(event.data);
                    this.handleAnalyticsUpdate(rawData);
                } catch (e) {
                    console.error('Failed to parse raw WebSocket data:', e);
                }
            }
        }
    }
    
    handleAnalyticsUpdate(data) {
        if (data.state) {
            this.state = data.state;
        }
        if (data.serviceEffects) {
            this.serviceEffects = data.serviceEffects;
        }
        
        this.updateControlPanel();
        this.updateNeuralNetwork();
    }
    
    updateConnectionStatus(status) {
        // Update analytics status indicator based on connection
        const analyticsStatus = document.getElementById('analytics-status');
        if (analyticsStatus) {
            if (status === 'connected') {
                analyticsStatus.style.color = '#64FFDA';
                analyticsStatus.textContent = this.state.status.toUpperCase() || 'LEARNING';
            } else if (status === 'error') {
                analyticsStatus.style.color = '#FF5555';
                analyticsStatus.textContent = 'CONNECTION ERROR';
            } else if (status === 'disconnected') {
                analyticsStatus.style.color = '#FFB86C';
                analyticsStatus.textContent = 'RECONNECTING';
            } else {
                analyticsStatus.style.color = '#FF5555';
                analyticsStatus.textContent = 'CONNECTION FAILED';
            }
        }
        
        // Update confidence display
        const confidenceDisplay = document.getElementById('analytics-confidence');
        if (confidenceDisplay) {
            if (status === 'connected') {
                confidenceDisplay.textContent = `${this.state.confidence?.toFixed(1) || '94.6'}%`;
                confidenceDisplay.style.color = '#64FFDA';
            } else {
                confidenceDisplay.textContent = 'N/A';
                confidenceDisplay.style.color = '#8892B0';
            }
        }
    }
    
    handleConnectionFailure() {
        this.isConnected = false;
        this.updateConnectionStatus('failed');
        
        // Fallback to basic WebSocket with exponential backoff
        this.connectionAttempts = (this.connectionAttempts || 0) + 1;
        const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 30000);
        
        console.log(`🔄 AI Consciousness fallback reconnection in ${delay}ms (attempt ${this.connectionAttempts})`);
        
        setTimeout(() => {
            if (this.connectionAttempts <= 5) {
                this.connectWebSocket();
            } else {
                console.error('🚨 AI Analytics WebSocket max reconnection attempts reached');
                this.updateConnectionStatus('failed');
            }
        }, delay);
    }
    
    startAutonomousUpdates() {
        // Periodically sync with backend
        setInterval(async () => {
            if (!this.isConnected) {
                await this.loadConsciousnessState();
                this.updateControlPanel();
                this.updateNeuralNetwork();
            }
        }, 10000); // Every 10 seconds
    }
    
    async optimizeForCurrentTask() {
        // Analyze current page/context and apply optimal settings
        const currentPage = window.location.pathname;
        let optimalPreset = 'clutchAnalysis';
        
        if (currentPage.includes('nil') || currentPage.includes('valuation')) {
            optimalPreset = 'perfectGameBaseball';
        } else if (currentPage.includes('pressure') || currentPage.includes('analytics')) {
            optimalPreset = 'texasFootball';
        } else if (currentPage.includes('digital-combine')) {
            optimalPreset = 'secFootball';
        }
        
        await this.applyPreset(optimalPreset);
    }
    
    async resetToDefaults() {
        const defaultSettings = {
            neuralSensitivity: 75,
            predictionDepth: 60,
            processingSpeed: 85,
            patternRecognition: 70
        };
        
        for (const [param, value] of Object.entries(defaultSettings)) {
            await this.updateConsciousnessParameter(`${param.replace(/([A-Z])/g, '-$1').toLowerCase()}-slider`, value);
        }
    }
    
    saveCurrentSettings() {
        const settings = {
            neuralSensitivity: this.state.neuralSensitivity,
            predictionDepth: this.state.predictionDepth,
            processingSpeed: this.state.processingSpeed,
            patternRecognition: this.state.patternRecognition,
            timestamp: Date.now()
        };
        
        localStorage.setItem('austin_consciousness_settings', JSON.stringify(settings));
        
        // Show save confirmation
        const saveBtn = document.getElementById('save-analytics');
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '✅ Saved!';
            saveBtn.style.background = 'var(--success-green)';
            
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = 'var(--gradient-primary)';
            }, 2000);
        }
        
        console.log('💾 Austin\'s consciousness settings saved');
    }
}

// Neural Network Visualization for Consciousness Controls
class ConsciousnessNeuralNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.particles = [];
        
        this.setupCanvas();
        this.createNetwork();
        this.startAnimation();
    }
    
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = rect.width;
        this.height = rect.height;
    }
    
    createNetwork() {
        // Create layered neural network
        const layers = 4;
        const nodesPerLayer = [3, 5, 4, 2];
        
        this.nodes = [];
        this.connections = [];
        
        for (let layer = 0; layer < layers; layer++) {
            const nodeCount = nodesPerLayer[layer];
            const layerX = (layer / (layers - 1)) * (this.width - 40) + 20;
            
            for (let i = 0; i < nodeCount; i++) {
                const y = ((i + 1) / (nodeCount + 1)) * (this.height - 40) + 20;
                
                this.nodes.push({
                    x: layerX,
                    y: y,
                    layer: layer,
                    index: i,
                    radius: 4 + Math.random() * 3,
                    activity: Math.random(),
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
        }
        
        // Create connections
        for (let layer = 0; layer < layers - 1; layer++) {
            const currentLayerNodes = this.nodes.filter(n => n.layer === layer);
            const nextLayerNodes = this.nodes.filter(n => n.layer === layer + 1);
            
            currentLayerNodes.forEach(node1 => {
                nextLayerNodes.forEach(node2 => {
                    if (Math.random() < 0.7) {
                        this.connections.push({
                            from: node1,
                            to: node2,
                            strength: Math.random() * 0.5 + 0.3,
                            pulseOffset: Math.random() * Math.PI * 2
                        });
                    }
                });
            });
        }
    }
    
    updateState(consciousnessState, serviceEffects) {
        // Update node activities based on consciousness parameters
        const avgEffectiveness = Object.values(serviceEffects).reduce((a, b) => a + b, 0) / Object.values(serviceEffects).length;
        const activityMultiplier = avgEffectiveness / 100;
        
        this.nodes.forEach(node => {
            node.activity = Math.min(1, node.activity * 0.9 + activityMultiplier * 0.1);
        });
        
        // Update connection strengths
        this.connections.forEach(conn => {
            conn.strength = Math.min(1, conn.strength * 0.95 + (consciousnessState.confidence / 100) * 0.05);
        });
    }
    
    startAnimation() {
        const animate = () => {
            this.draw();
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const time = Date.now() * 0.001;
        
        // Draw connections
        this.connections.forEach(conn => {
            const pulse = Math.sin(time + conn.pulseOffset) * 0.5 + 0.5;
            const opacity = conn.strength * pulse * 0.4;
            
            this.ctx.strokeStyle = `rgba(191, 87, 0, ${opacity})`;
            this.ctx.lineWidth = conn.strength * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.stroke();
        });
        
        // Draw nodes
        this.nodes.forEach(node => {
            const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.3 + 0.7;
            const activity = node.activity;
            
            // Node glow
            const glowRadius = node.radius * 2 * pulse * activity;
            const glowGradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, glowRadius
            );
            glowGradient.addColorStop(0, `rgba(191, 87, 0, ${activity * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(191, 87, 0, 0)');
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Node core
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 184, 28, ${activity})`;
            this.ctx.fill();
        });
    }
}

// Initialize consciousness controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page that should have consciousness controls
    const shouldInit = document.querySelector('.hero-content') || 
                      document.querySelector('.main-content') || 
                      window.location.pathname.includes('coach') ||
                      window.location.pathname.includes('neural');
    
    if (shouldInit) {
        window.analyticsController = new AnalyticsController();
        console.log('🧠 Austin Humphrey Analytics Controller initialized');
    }
});

// Export for global access
window.AnalyticsController = AnalyticsController;

} // End duplicate prevention block