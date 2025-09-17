/**
 * Enhanced AI Consciousness UI - Championship User Experience
 * By Austin Humphrey - Deep South Sports Authority
 * Provides intuitive, responsive AI consciousness controls with visual feedback
 */

class EnhancedAIConsciousnessUI {
    constructor() {
        this.state = {
            neuralSensitivity: 75,
            predictionDepth: 60,
            processingSpeed: 85,
            patternRecognition: 70
        };
        
        this.isConnected = false;
        this.effectVisibility = true;
        this.presets = new Map();
        
        console.log('🏆 Austin Humphrey AI Consciousness UI - Championship Experience');
        this.initializeUI();
    }
    
    initializeUI() {
        this.createControlPanels();
        this.setupEventListeners();
        this.setupPresets();
        this.createVisualFeedbackSystem();
        this.connectToWebSocket();
    }
    
    createControlPanels() {
        // Create main control panel if it doesn't exist
        const existingPanel = document.querySelector('.ai-consciousness-panel');
        if (existingPanel) {
            this.enhanceExistingPanel(existingPanel);
            return;
        }
        
        // Create new enhanced control panel
        const controlPanel = this.createEnhancedControlPanel();
        this.insertControlPanel(controlPanel);
    }
    
    createEnhancedControlPanel() {
        const panel = document.createElement('div');
        panel.className = 'ai-consciousness-panel enhanced';
        panel.innerHTML = `
            <div class="panel-header">
                <div class="header-content">
                    <h3 class="panel-title">
                        <i class="fas fa-brain"></i>
                        Austin Humphrey AI Consciousness™
                    </h3>
                    <div class="connection-status">
                        <span class="consciousness-status connecting">Connecting</span>
                    </div>
                </div>
                <div class="austin-credentials">
                    <span class="credential-badge">Texas Running Back #20</span>
                    <span class="credential-badge">Perfect Game Elite</span>
                </div>
            </div>
            
            <div class="panel-content">
                <div class="consciousness-controls">
                    ${this.createSliderControl('neuralSensitivity', 'Neural Sensitivity', 'Pressure analysis precision', 75)}
                    ${this.createSliderControl('predictionDepth', 'Prediction Depth', 'Clutch moment forecasting', 60)}
                    ${this.createSliderControl('processingSpeed', 'Processing Speed', 'Real-time analysis rate', 85)}
                    ${this.createSliderControl('patternRecognition', 'Pattern Recognition', 'Behavioral pattern detection', 70)}
                </div>
                
                <div class="consciousness-presets">
                    <h4>Austin's Expert Presets</h4>
                    <div class="preset-buttons">
                        <button class="preset-btn" data-preset="texasFootball">Texas Football</button>
                        <button class="preset-btn" data-preset="secFootball">SEC Elite</button>
                        <button class="preset-btn" data-preset="perfectGameBaseball">Perfect Game</button>
                        <button class="preset-btn" data-preset="clutchAnalysis">Championship</button>
                    </div>
                </div>
                
                <div class="consciousness-effects">
                    <h4>Real-Time AI Effects</h4>
                    <div class="effects-grid">
                        <div class="effect-indicator" data-effect="nilCalculations">
                            <span class="effect-label">NIL Calculator</span>
                            <span class="effect-value">0</span>
                        </div>
                        <div class="effect-indicator" data-effect="pressureAnalysis">
                            <span class="effect-label">Pressure Analysis</span>
                            <span class="effect-value">0</span>
                        </div>
                        <div class="effect-indicator" data-effect="digitalCombine">
                            <span class="effect-label">Digital Combine</span>
                            <span class="effect-value">0</span>
                        </div>
                        <div class="effect-indicator" data-effect="predictiveModeling">
                            <span class="effect-label">Predictive Models</span>
                            <span class="effect-value">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="consciousness-insights">
                    <div class="austin-guidance">
                        <div class="guidance-content">
                            <div class="guidance-icon">🏆</div>
                            <div class="guidance-text">
                                <strong>Championship Configuration Active</strong>
                                <p>AI tuned for peak performance analysis</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return panel;
    }
    
    createSliderControl(id, label, description, value) {
        return `
            <div class="slider-control" data-param="${id}">
                <div class="slider-header">
                    <label class="slider-label">${label}</label>
                    <div class="slider-value-display">
                        <span class="value-number">${value}</span>
                        <span class="value-unit">%</span>
                    </div>
                </div>
                <div class="slider-description">${description}</div>
                <div class="slider-container">
                    <input type="range" 
                           class="consciousness-slider enhanced"
                           id="${id}Slider"
                           min="0" 
                           max="100" 
                           value="${value}"
                           data-param="${id}">
                    <div class="slider-track-fill" style="width: ${value}%"></div>
                </div>
                <div class="slider-impact">
                    <span class="impact-indicator"></span>
                    <span class="impact-text">Optimized</span>
                </div>
            </div>
        `;
    }
    
    enhanceExistingPanel(panel) {
        // Add enhanced classes and features to existing panel
        panel.classList.add('enhanced');
        
        // Add connection status if missing
        if (!panel.querySelector('.consciousness-status')) {
            const header = panel.querySelector('.panel-header') || panel;
            const statusDiv = document.createElement('div');
            statusDiv.className = 'connection-status';
            statusDiv.innerHTML = '<span class="consciousness-status connecting">Connecting</span>';
            header.appendChild(statusDiv);
        }
        
        // Enhance existing sliders
        this.enhanceExistingSliders(panel);
    }
    
    enhanceExistingSliders(panel) {
        const sliders = panel.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            if (!slider.classList.contains('enhanced')) {
                slider.classList.add('enhanced');
                this.addSliderEnhancements(slider);
            }
        });
    }
    
    addSliderEnhancements(slider) {
        const container = slider.parentElement;
        
        // Add track fill if missing
        if (!container.querySelector('.slider-track-fill')) {
            const trackFill = document.createElement('div');
            trackFill.className = 'slider-track-fill';
            trackFill.style.width = `${slider.value}%`;
            container.appendChild(trackFill);
        }
        
        // Add value display if missing
        const control = slider.closest('.slider-control') || slider.closest('.consciousness-control');
        if (control && !control.querySelector('.slider-value-display')) {
            const valueDisplay = document.createElement('div');
            valueDisplay.className = 'slider-value-display';
            valueDisplay.innerHTML = `
                <span class="value-number">${slider.value}</span>
                <span class="value-unit">%</span>
            `;
            
            const label = control.querySelector('label');
            if (label) {
                label.parentElement.appendChild(valueDisplay);
            }
        }
    }
    
    insertControlPanel(panel) {
        // Try to insert in dashboard main area
        const dashboardMain = document.querySelector('.dashboard-main');
        const mainContent = document.querySelector('.main-content');
        const container = dashboardMain || mainContent || document.body;
        
        // Insert at the beginning of main content
        if (container === document.body) {
            // Create a floating panel for full-page layouts
            panel.classList.add('floating');
            panel.style.position = 'fixed';
            panel.style.top = '20px';
            panel.style.right = '20px';
            panel.style.zIndex = '1000';
            panel.style.maxWidth = '350px';
        }
        
        container.insertBefore(panel, container.firstChild);
    }
    
    setupEventListeners() {
        // Enhanced slider event handling
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('consciousness-slider')) {
                this.handleSliderChange(e.target);
            }
        });
        
        // Preset button handling
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('preset-btn')) {
                this.applyPreset(e.target.dataset.preset);
            }
        });
        
        // WebSocket event handling
        window.addEventListener('consciousness-state-updated', (e) => {
            this.updateStateFromWebSocket(e.detail);
        });
        
        window.addEventListener('websocket-connected', (e) => {
            if (e.detail.name === 'consciousness') {
                this.onWebSocketConnected();
            }
        });
        
        window.addEventListener('websocket-disconnected', (e) => {
            if (e.detail.name === 'consciousness') {
                this.onWebSocketDisconnected();
            }
        });
    }
    
    handleSliderChange(slider) {
        const param = slider.dataset.param;
        const value = parseInt(slider.value);
        
        // Update internal state
        this.state[param] = value;
        
        // Visual feedback
        this.updateSliderVisuals(slider, value);
        this.updateImpactIndicator(slider, value);
        
        // Send to server via WebSocket
        this.sendConsciousnessUpdate(param, value);
        
        // Trigger visual effects
        this.triggerParameterEffect(param, value);
    }
    
    updateSliderVisuals(slider, value) {
        const control = slider.closest('.slider-control') || slider.closest('.consciousness-control');
        
        // Update track fill
        const trackFill = control.querySelector('.slider-track-fill');
        if (trackFill) {
            trackFill.style.width = `${value}%`;
            trackFill.style.transition = 'width 0.3s ease';
        }
        
        // Update value display
        const valueNumber = control.querySelector('.value-number');
        if (valueNumber) {
            valueNumber.textContent = value;
            
            // Add change animation
            valueNumber.classList.add('value-changed');
            setTimeout(() => {
                valueNumber.classList.remove('value-changed');
            }, 300);
        }
    }
    
    updateImpactIndicator(slider, value) {
        const control = slider.closest('.slider-control') || slider.closest('.consciousness-control');
        const indicator = control.querySelector('.impact-indicator');
        const text = control.querySelector('.impact-text');
        
        if (!indicator || !text) return;
        
        // Determine impact level
        let impact, color, description;
        if (value >= 90) {
            impact = 'maximum';
            color = '#10B981';
            description = 'Maximum';
        } else if (value >= 75) {
            impact = 'high';
            color = '#BF5700';
            description = 'High Impact';
        } else if (value >= 50) {
            impact = 'medium';
            color = '#F59E0B';
            description = 'Moderate';
        } else {
            impact = 'low';
            color = '#8892B0';
            description = 'Conservative';
        }
        
        indicator.style.background = color;
        indicator.className = `impact-indicator ${impact}`;
        text.textContent = description;
    }
    
    setupPresets() {
        this.presets.set('texasFootball', {
            neuralSensitivity: 85,
            predictionDepth: 75,
            processingSpeed: 90,
            patternRecognition: 80,
            description: 'Optimized for Texas/Big 12 high-pressure scenarios'
        });
        
        this.presets.set('secFootball', {
            neuralSensitivity: 90,
            predictionDepth: 80,
            processingSpeed: 85,
            patternRecognition: 85,
            description: 'SEC championship-level intensity analysis'
        });
        
        this.presets.set('perfectGameBaseball', {
            neuralSensitivity: 75,
            predictionDepth: 85,
            processingSpeed: 80,
            patternRecognition: 90,
            description: 'Perfect Game scouting precision methodology'
        });
        
        this.presets.set('clutchAnalysis', {
            neuralSensitivity: 95,
            predictionDepth: 90,
            processingSpeed: 75,
            patternRecognition: 85,
            description: 'Maximum sensitivity for championship moments'
        });
    }
    
    applyPreset(presetName) {
        const preset = this.presets.get(presetName);
        if (!preset) return;
        
        console.log(`🏆 Applying Austin's ${presetName} preset`);
        
        // Update all sliders with animation
        Object.keys(preset).forEach(param => {
            if (param === 'description') return;
            
            const slider = document.getElementById(`${param}Slider`);
            if (slider) {
                this.animateSliderToValue(slider, preset[param]);
                this.state[param] = preset[param];
            }
        });
        
        // Update guidance text
        this.updateGuidanceText(preset.description);
        
        // Visual feedback
        this.showPresetAppliedFeedback(presetName);
    }
    
    animateSliderToValue(slider, targetValue) {
        const currentValue = parseInt(slider.value);
        const duration = 800;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeInOutQuart = progress < 0.5 
                ? 8 * progress * progress * progress * progress
                : 1 - 8 * (--progress) * progress * progress * progress;
            
            const value = Math.round(currentValue + (targetValue - currentValue) * easeInOutQuart);
            
            slider.value = value;
            this.updateSliderVisuals(slider, value);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Send final update to server
                this.sendConsciousnessUpdate(slider.dataset.param, targetValue);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    showPresetAppliedFeedback(presetName) {
        // Create temporary feedback notification
        const notification = document.createElement('div');
        notification.className = 'preset-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Austin's ${presetName.replace(/([A-Z])/g, ' $1').trim()} preset applied</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in and out
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    createVisualFeedbackSystem() {
        // Add particle effects for parameter changes
        this.particleSystem = new ParameterParticleSystem();
        
        // Add neural network visualization if container exists
        const neuralContainer = document.querySelector('#neural-visualization');
        if (neuralContainer) {
            this.neuralVisualization = new NeuralNetworkVisualization(neuralContainer);
        }
    }
    
    triggerParameterEffect(param, value) {
        // Visual particle effect
        if (this.particleSystem) {
            this.particleSystem.triggerEffect(param, value);
        }
        
        // Update neural visualization
        if (this.neuralVisualization) {
            this.neuralVisualization.updateParameter(param, value);
        }
        
        // Page-wide visual effects
        this.triggerPageEffect(param, value);
    }
    
    triggerPageEffect(param, value) {
        // Subtle page-wide effects based on parameter changes
        const intensity = value / 100;
        
        switch (param) {
            case 'neuralSensitivity':
                this.adjustPageBrightness(0.9 + intensity * 0.1);
                break;
            case 'processingSpeed':
                this.adjustAnimationSpeed(0.5 + intensity * 0.5);
                break;
            case 'patternRecognition':
                this.adjustNeuralMeshOpacity(0.1 + intensity * 0.2);
                break;
        }
    }
    
    adjustPageBrightness(factor) {
        document.documentElement.style.setProperty('--consciousness-brightness', factor);
    }
    
    adjustAnimationSpeed(factor) {
        document.documentElement.style.setProperty('--consciousness-animation-speed', `${factor}s`);
    }
    
    adjustNeuralMeshOpacity(opacity) {
        document.documentElement.style.setProperty('--neural-mesh-opacity', opacity);
    }
    
    async connectToWebSocket() {
        // 🏆 Championship Health Check - Austin Humphrey Smart Connection Strategy
        console.log('🧠 Checking AI Consciousness health before connection...');
        
        try {
            const healthResponse = await fetch('/api/ai/consciousness/health');
            const healthData = await healthResponse.json();
            
            if (!healthData.websocket || healthData.status === 'disabled') {
                console.log('🔒 AI Consciousness WebSocket disabled - Entering graceful offline mode');
                this.enterOfflineMode('Consciousness system currently offline');
                return;
            }
            
            // Use the enhanced WebSocket manager if health check passes
            if (window.wsManager) {
                console.log('🔌 Health check passed - Using enhanced WebSocket manager for consciousness connection');
                this.isConnected = true;
                this.updateConnectionStatus('connected');
            } else {
                console.warn('⚠️ Enhanced WebSocket manager not available');
                this.enterOfflineMode('Connection manager unavailable');
            }
        } catch (error) {
            console.log('🔒 Consciousness health check failed - Graceful offline mode:', error.message);
            this.enterOfflineMode('Service temporarily unavailable');
        }
    }
    
    enterOfflineMode(reason) {
        this.isConnected = false;
        this.updateConnectionStatus('offline', reason);
        
        // Disable consciousness controls gracefully
        const controls = document.querySelectorAll('.consciousness-controls input, .consciousness-controls button');
        controls.forEach(control => {
            control.disabled = true;
            control.style.opacity = '0.5';
        });
        
        // Show subtle offline indicator
        this.showOfflineIndicator(reason);
    }
    
    updateConnectionStatus(status, message = '') {
        const statusElement = document.querySelector('.consciousness-status');
        if (statusElement) {
            statusElement.className = `consciousness-status ${status}`;
            statusElement.textContent = status === 'offline' ? 'Offline' : 
                                       status === 'connected' ? 'Online' : 'Connecting';
        }
    }
    
    showOfflineIndicator(reason) {
        const indicator = document.createElement('div');
        indicator.className = 'consciousness-offline-indicator';
        indicator.innerHTML = `
            <i class="fas fa-cloud-offline"></i>
            <span>AI Consciousness offline</span>
            <small>${reason}</small>
        `;
        indicator.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: rgba(0,0,0,0.8); color: #fff; padding: 12px;
            border-radius: 8px; font-size: 12px; max-width: 200px;
        `;
        
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 5000);
    }
    
    sendConsciousnessUpdate(parameter, value) {
        if (window.wsManager) {
            const success = window.wsManager.send('consciousness', {
                type: 'parameter_update',
                parameter: `${parameter}-slider`,
                value: value,
                timestamp: Date.now()
            });
            
            if (!success) {
                console.log('📦 Consciousness update queued for when connection is ready');
            }
        }
    }
    
    updateStateFromWebSocket(data) {
        if (data.data && data.data.neuralSensitivity !== undefined) {
            const newState = data.data;
            
            // Update internal state
            Object.assign(this.state, {
                neuralSensitivity: newState.neuralSensitivity,
                predictionDepth: newState.predictionDepth,
                processingSpeed: newState.processingSpeed,
                patternRecognition: newState.patternRecognition
            });
            
            // Update UI sliders
            this.updateSlidersFromState();
            
            // Update effect indicators
            if (data.serviceEffects) {
                this.updateEffectIndicators(data.serviceEffects);
            }
        }
    }
    
    updateSlidersFromState() {
        Object.keys(this.state).forEach(param => {
            const slider = document.getElementById(`${param}Slider`);
            if (slider && Math.abs(slider.value - this.state[param]) > 1) {
                slider.value = this.state[param];
                this.updateSliderVisuals(slider, this.state[param]);
            }
        });
    }
    
    updateEffectIndicators(effects) {
        Object.keys(effects).forEach(effect => {
            const indicator = document.querySelector(`[data-effect="${effect}"] .effect-value`);
            if (indicator) {
                indicator.textContent = effects[effect];
                
                // Add change animation
                indicator.classList.add('effect-updated');
                setTimeout(() => {
                    indicator.classList.remove('effect-updated');
                }, 500);
            }
        });
    }
    
    updateGuidanceText(text) {
        const guidanceText = document.querySelector('.guidance-text p');
        if (guidanceText) {
            guidanceText.textContent = text;
        }
    }
    
    onWebSocketConnected() {
        this.isConnected = true;
        
        const statusElements = document.querySelectorAll('.consciousness-status');
        statusElements.forEach(el => {
            el.textContent = 'Connected';
            el.className = 'consciousness-status connected';
        });
        
        console.log('✅ AI Consciousness UI connected to WebSocket');
    }
    
    onWebSocketDisconnected() {
        this.isConnected = false;
        
        const statusElements = document.querySelectorAll('.consciousness-status');
        statusElements.forEach(el => {
            el.textContent = 'Disconnected';
            el.className = 'consciousness-status disconnected';
        });
        
        console.log('🔌 AI Consciousness UI disconnected from WebSocket');
    }
    
    // Public API
    getCurrentState() {
        return { ...this.state };
    }
    
    setParameter(param, value) {
        const slider = document.getElementById(`${param}Slider`);
        if (slider) {
            this.animateSliderToValue(slider, value);
        }
    }
    
    toggleEffectVisibility() {
        this.effectVisibility = !this.effectVisibility;
        const effectsPanel = document.querySelector('.consciousness-effects');
        if (effectsPanel) {
            effectsPanel.style.display = this.effectVisibility ? 'block' : 'none';
        }
    }
}

// Simple particle system for visual effects
class ParameterParticleSystem {
    constructor() {
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.isAnimating = false;
    }
    
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '999';
        canvas.style.opacity = '0.7';
        document.body.appendChild(canvas);
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        return canvas;
    }
    
    resizeCanvas() {
        // CRITICAL FIX: Check canvas exists before setting properties to prevent WebSocket Error 1006 crashes
        if (this.canvas && this.canvas.getContext) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        } else {
            console.warn('⚠️ Canvas not available for resize - preventing Error 1006 crash');
        }
    }
    
    triggerEffect(param, value) {
        const intensity = value / 100;
        const particleCount = Math.floor(3 + intensity * 7);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1,
                decay: 0.02,
                size: 2 + Math.random() * 3,
                color: this.getParamColor(param)
            });
        }
        
        if (!this.isAnimating) {
            this.animate();
        }
    }
    
    getParamColor(param) {
        const colors = {
            neuralSensitivity: '#BF5700',
            predictionDepth: '#10B981',
            processingSpeed: '#64FFDA',
            patternRecognition: '#8B5CF6'
        };
        return colors[param] || '#8892B0';
    }
    
    animate() {
        this.isAnimating = true;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.isAnimating = false;
        }
    }
}

// Enhanced CSS styles for the consciousness UI
const enhancedStyles = `
<style>
.ai-consciousness-panel.enhanced {
    background: linear-gradient(135deg, rgba(17, 34, 64, 0.95), rgba(10, 25, 47, 0.95));
    border: 1px solid rgba(191, 87, 0, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(20px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(136, 146, 176, 0.2);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.panel-title {
    color: #BF5700;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.austin-credentials {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.credential-badge {
    background: linear-gradient(135deg, #BF5700, #FFB81C);
    color: #0A192F;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
}

.slider-control {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(17, 34, 64, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(136, 146, 176, 0.1);
    transition: all 0.3s ease;
}

.slider-control:hover {
    border-color: rgba(191, 87, 0, 0.3);
    transform: translateY(-1px);
}

.slider-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.slider-label {
    color: #E6F1FF;
    font-weight: 600;
    font-size: 0.9rem;
}

.slider-value-display {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
}

.value-number {
    color: #BF5700;
    font-weight: 700;
    font-size: 1.1rem;
    transition: all 0.3s ease;
}

.value-number.value-changed {
    transform: scale(1.2);
    color: #FFB81C;
}

.value-unit {
    color: #8892B0;
    font-size: 0.8rem;
}

.slider-description {
    color: #8892B0;
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
}

.slider-container {
    position: relative;
    margin-bottom: 0.5rem;
}

.consciousness-slider.enhanced {
    width: 100%;
    height: 6px;
    background: rgba(136, 146, 176, 0.2);
    border-radius: 3px;
    outline: none;
    appearance: none;
    position: relative;
    z-index: 2;
}

.consciousness-slider.enhanced::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #BF5700, #FFB81C);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(191, 87, 0, 0.3);
    transition: all 0.2s ease;
}

.consciousness-slider.enhanced::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 20px rgba(191, 87, 0, 0.5);
}

.slider-track-fill {
    position: absolute;
    top: 50%;
    left: 0;
    height: 6px;
    background: linear-gradient(90deg, #BF5700, #FFB81C);
    border-radius: 3px;
    transform: translateY(-50%);
    z-index: 1;
    transition: width 0.3s ease;
}

.slider-impact {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.impact-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #8892B0;
    transition: all 0.3s ease;
}

.impact-text {
    color: #8892B0;
    font-size: 0.75rem;
    font-weight: 500;
}

.consciousness-presets {
    margin: 1.5rem 0;
    padding: 1rem;
    background: rgba(10, 25, 47, 0.5);
    border-radius: 12px;
}

.consciousness-presets h4 {
    color: #BF5700;
    margin: 0 0 1rem 0;
    font-size: 1rem;
}

.preset-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
}

.preset-btn {
    background: rgba(17, 34, 64, 0.8);
    border: 1px solid rgba(191, 87, 0, 0.3);
    color: #E6F1FF;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.preset-btn:hover {
    background: rgba(191, 87, 0, 0.2);
    border-color: #BF5700;
    transform: translateY(-2px);
}

.consciousness-effects {
    margin: 1.5rem 0;
}

.consciousness-effects h4 {
    color: #BF5700;
    margin: 0 0 1rem 0;
    font-size: 1rem;
}

.effects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
}

.effect-indicator {
    background: rgba(17, 34, 64, 0.6);
    border: 1px solid rgba(136, 146, 176, 0.2);
    padding: 0.75rem;
    border-radius: 8px;
    text-align: center;
}

.effect-label {
    display: block;
    color: #8892B0;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
}

.effect-value {
    display: block;
    color: #64FFDA;
    font-size: 1.1rem;
    font-weight: 700;
    transition: all 0.3s ease;
}

.effect-value.effect-updated {
    transform: scale(1.2);
    color: #10B981;
}

.consciousness-insights {
    margin-top: 1.5rem;
}

.austin-guidance {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(191, 87, 0, 0.1));
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 12px;
    padding: 1rem;
}

.guidance-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.guidance-icon {
    font-size: 1.5rem;
}

.guidance-text strong {
    color: #10B981;
    display: block;
    margin-bottom: 0.25rem;
}

.guidance-text p {
    color: #8892B0;
    margin: 0;
    font-size: 0.9rem;
}

.preset-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10B981, #64FFDA);
    color: #0A192F;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
    z-index: 10000;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
}

.preset-notification.show {
    transform: translateX(0);
    opacity: 1;
}

.ai-consciousness-panel.floating {
    max-height: 80vh;
    overflow-y: auto;
    animation: slideInFromRight 0.5s ease;
}

@keyframes slideInFromRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .ai-consciousness-panel.floating {
        position: fixed !important;
        top: 10px !important;
        right: 10px !important;
        left: 10px !important;
        max-width: none !important;
        max-height: 60vh;
    }
    
    .preset-buttons {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .effects-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .slider-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}

/* Dark mode and accessibility improvements */
@media (prefers-reduced-motion: reduce) {
    .consciousness-slider.enhanced::-webkit-slider-thumb,
    .preset-btn,
    .slider-control,
    .value-number,
    .effect-value {
        transition: none;
    }
}

@media (prefers-contrast: high) {
    .ai-consciousness-panel.enhanced {
        border: 2px solid #BF5700;
    }
    
    .slider-control {
        border: 1px solid #8892B0;
    }
}
</style>
`;

// Inject enhanced styles
document.head.insertAdjacentHTML('beforeend', enhancedStyles);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedAIUI = new EnhancedAIConsciousnessUI();
    });
} else {
    window.enhancedAIUI = new EnhancedAIConsciousnessUI();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedAIConsciousnessUI;
}