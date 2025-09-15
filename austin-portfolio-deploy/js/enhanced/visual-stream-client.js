/**
 * Visual Stream Client - Championship Visual Intelligence Frontend
 * By Austin Humphrey - Deep South Sports Authority
 * 
 * Advanced frontend client for real-time visual processing
 * Three.js integration with championship-grade sports analysis
 * WebRTC streaming with sub-100ms latency targets
 */

import * as THREE from 'three';

class VisualStreamClient {
    constructor() {
        // Core configuration
        this.config = {
            // WebRTC Configuration
            webrtc: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ],
                configuration: {
                    bundlePolicy: 'max-bundle',
                    rtcpMuxPolicy: 'require'
                }
            },
            
            // Performance Targets - Championship Standards
            performance: {
                targetFPS: 30,
                maxLatencyMs: 100,
                championshipThreshold: 33, // <33ms for championship level
                accuracyThreshold: 0.95
            },
            
            // Visual Processing Configuration
            visual: {
                overlayOpacity: 0.8,
                boundingBoxColors: {
                    player: '#00FF41',
                    ball: '#FF6B35',
                    referee: '#FFD700',
                    equipment: '#00BFFF'
                },
                confidenceThreshold: 0.75,
                trackingColors: ['#FF4B4B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
            },
            
            // Austin Humphrey's Championship Mode
            austinMode: {
                enabled: true,
                expertiseIndicators: true,
                championshipValidation: true,
                texasFootballMode: true,
                perfectGameMode: true
            }
        };

        // State management
        this.state = {
            isConnected: false,
            isStreaming: false,
            currentStream: null,
            processingMetrics: {
                latency: 0,
                fps: 0,
                accuracy: 0,
                championshipStandard: false
            },
            austinInsights: null
        };

        // Visual components
        this.canvas = null;
        this.context = null;
        this.video = null;
        this.overlay = null;
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.visualizations = new Map();
        
        // WebSocket and WebRTC connections
        this.websocket = null;
        this.peerConnection = null;
        this.dataChannel = null;
        
        // Event handlers
        this.eventHandlers = new Map();

        // Initialize the client
        this.initialize();
    }

    async initialize() {
        console.log('🎥 Initializing Visual Stream Client - Championship Analytics');
        console.log('🏆 Austin Humphrey mode: Championship level visual intelligence');
        
        try {
            // Initialize UI components
            this.initializeUI();
            
            // Initialize Three.js scene
            this.initializeThreeJS();
            
            // Setup WebSocket connection
            await this.initializeWebSocket();
            
            // Setup performance monitoring
            this.startPerformanceMonitoring();
            
            console.log('✅ Visual Stream Client initialized - Ready for championship analysis');
            
        } catch (error) {
            console.error('❌ Failed to initialize Visual Stream Client:', error);
            throw error;
        }
    }

    initializeUI() {
        // Create main video container
        const container = document.createElement('div');
        container.id = 'visual-stream-container';
        container.className = 'visual-stream-container';
        container.style.cssText = `
            position: relative;
            width: 100%;
            height: 600px;
            background: #000;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        // Create video element
        this.video = document.createElement('video');
        this.video.id = 'visual-stream-video';
        this.video.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;
        this.video.playsInline = true;
        this.video.muted = true;

        // Create canvas overlay for visual annotations
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'visual-overlay-canvas';
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
        `;
        this.context = this.canvas.getContext('2d');

        // Create Three.js container
        const threeContainer = document.createElement('div');
        threeContainer.id = 'three-visualization';
        threeContainer.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            width: 300px;
            height: 200px;
            z-index: 20;
            background: rgba(0,0,0,0.8);
            border-radius: 4px;
            margin: 10px;
        `;

        // Create control panel
        const controlPanel = this.createControlPanel();

        // Create metrics display
        const metricsDisplay = this.createMetricsDisplay();

        // Create Austin insights panel
        const austinPanel = this.createAustinInsightsPanel();

        // Assemble components
        container.appendChild(this.video);
        container.appendChild(this.canvas);
        container.appendChild(threeContainer);
        container.appendChild(controlPanel);
        container.appendChild(metricsDisplay);
        container.appendChild(austinPanel);

        // Add to DOM
        const targetElement = document.getElementById('visual-client-mount') || document.body;
        targetElement.appendChild(container);

        // Store references
        this.container = container;
        this.threeContainer = threeContainer;
        this.controlPanel = controlPanel;
        this.metricsDisplay = metricsDisplay;
        this.austinPanel = austinPanel;

        console.log('🖼️ UI components initialized');
    }

    createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'visual-control-panel';
        panel.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(0,0,0,0.9);
            padding: 15px;
            border-radius: 8px;
            color: white;
            font-family: 'Inter', sans-serif;
            z-index: 30;
        `;

        panel.innerHTML = `
            <div class="control-row">
                <button id="start-stream-btn" class="visual-btn visual-btn-primary">Start Stream</button>
                <button id="stop-stream-btn" class="visual-btn visual-btn-secondary" disabled>Stop Stream</button>
                <button id="toggle-austin-mode" class="visual-btn visual-btn-austin">Austin Mode: ON</button>
            </div>
            <div class="control-row">
                <label>Sport:</label>
                <select id="sport-select" class="visual-select">
                    <option value="football">Football</option>
                    <option value="baseball">Baseball</option>
                    <option value="basketball">Basketball</option>
                </select>
                <label>Quality:</label>
                <select id="quality-select" class="visual-select">
                    <option value="auto">Auto</option>
                    <option value="high">High (1080p)</option>
                    <option value="medium">Medium (720p)</option>
                    <option value="low">Low (480p)</option>
                </select>
            </div>
            <div class="control-row">
                <label>Expertise Level:</label>
                <select id="expertise-select" class="visual-select">
                    <option value="championship">Championship</option>
                    <option value="sec_authority">SEC Authority</option>
                    <option value="perfect_game">Perfect Game</option>
                    <option value="standard">Standard</option>
                </select>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .control-row {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
            }
            .visual-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
            }
            .visual-btn-primary {
                background: #BF5700;
                color: white;
            }
            .visual-btn-primary:hover {
                background: #A04600;
            }
            .visual-btn-secondary {
                background: #666;
                color: white;
            }
            .visual-btn-austin {
                background: #00FF41;
                color: black;
            }
            .visual-select {
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #666;
                background: #333;
                color: white;
            }
        `;
        document.head.appendChild(style);

        // Add event listeners
        this.setupControlPanelEvents(panel);

        return panel;
    }

    createMetricsDisplay() {
        const display = document.createElement('div');
        display.id = 'visual-metrics-display';
        display.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.9);
            padding: 15px;
            border-radius: 8px;
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            z-index: 30;
            min-width: 200px;
        `;

        display.innerHTML = `
            <div class="metrics-header">
                <h4 style="margin: 0 0 10px 0; color: #BF5700;">Performance Metrics</h4>
            </div>
            <div class="metrics-row">
                <span>Latency:</span>
                <span id="latency-value" class="metric-value">-- ms</span>
            </div>
            <div class="metrics-row">
                <span>FPS:</span>
                <span id="fps-value" class="metric-value">-- fps</span>
            </div>
            <div class="metrics-row">
                <span>Accuracy:</span>
                <span id="accuracy-value" class="metric-value">--%</span>
            </div>
            <div class="metrics-row">
                <span>Championship:</span>
                <span id="championship-status" class="metric-value">--</span>
            </div>
            <div class="metrics-row">
                <span>Austin Grade:</span>
                <span id="austin-grade" class="metric-value austin-grade">--</span>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .metrics-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }
            .metric-value {
                font-weight: bold;
                color: #00FF41;
            }
            .austin-grade {
                color: #FFD700;
                font-size: 14px;
            }
            .championship-met {
                color: #00FF41;
            }
            .championship-missed {
                color: #FF4B4B;
            }
        `;
        document.head.appendChild(style);

        return display;
    }

    createAustinInsightsPanel() {
        const panel = document.createElement('div');
        panel.id = 'austin-insights-panel';
        panel.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.95);
            padding: 15px;
            border-radius: 8px;
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            z-index: 30;
            width: 300px;
            max-height: 400px;
            overflow-y: auto;
        `;

        panel.innerHTML = `
            <div class="austin-header">
                <h4 style="margin: 0 0 10px 0; color: #FFD700;">🏆 Austin Humphrey Analysis</h4>
                <p style="margin: 0 0 15px 0; font-size: 10px; opacity: 0.8;">
                    Texas Running Back #20 - SEC Authority
                </p>
            </div>
            <div id="austin-insights-content">
                <p style="text-align: center; opacity: 0.7; margin: 20px 0;">
                    Start stream to see championship insights...
                </p>
            </div>
        `;

        return panel;
    }

    setupControlPanelEvents(panel) {
        const startBtn = panel.querySelector('#start-stream-btn');
        const stopBtn = panel.querySelector('#stop-stream-btn');
        const austinModeBtn = panel.querySelector('#toggle-austin-mode');

        startBtn.addEventListener('click', () => this.startVisualStream());
        stopBtn.addEventListener('click', () => this.stopVisualStream());
        austinModeBtn.addEventListener('click', () => this.toggleAustinMode());
    }

    initializeThreeJS() {
        // Create Three.js scene for 3D visualizations
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            300 / 200,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(300, 200);
        this.renderer.setClearColor(0x000000, 0.8);

        // Add renderer to container
        this.threeContainer.appendChild(this.renderer.domElement);

        // Setup lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Create field visualization
        this.createFieldVisualization();

        // Start render loop
        this.startThreeJSLoop();

        console.log('🎮 Three.js scene initialized');
    }

    createFieldVisualization() {
        // Create football field visualization
        const fieldGeometry = new THREE.PlaneGeometry(10, 6);
        const fieldMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x228B22,
            transparent: true,
            opacity: 0.7
        });
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.rotation.x = -Math.PI / 2;
        this.scene.add(field);

        // Add yard lines
        for (let i = -4; i <= 4; i++) {
            const lineGeometry = new THREE.PlaneGeometry(0.1, 6);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(i * 1.25, 0.01, 0);
            line.rotation.x = -Math.PI / 2;
            this.scene.add(line);
        }

        console.log('🏈 Field visualization created');
    }

    startThreeJSLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Update visualizations based on detection results
            this.updateThreeJSVisualizations();
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }

    updateThreeJSVisualizations() {
        if (!this.state.currentDetections) return;

        // Update player positions in 3D space
        this.state.currentDetections.objects?.forEach((obj, index) => {
            if (obj.class === 'player') {
                this.visualizePlayerIn3D(obj, index);
            }
        });
    }

    visualizePlayerIn3D(player, index) {
        const playerId = `player_${index}`;
        
        let playerMesh = this.visualizations.get(playerId);
        
        if (!playerMesh) {
            // Create new player visualization
            const geometry = new THREE.CapsuleGeometry(0.2, 1);
            const material = new THREE.MeshPhongMaterial({ 
                color: player.team === 'home' ? 0x0066cc : 0xcc0000 
            });
            playerMesh = new THREE.Mesh(geometry, material);
            this.scene.add(playerMesh);
            this.visualizations.set(playerId, playerMesh);
        }

        // Update position based on field coordinates
        const x = (player.boundingBox.x - 960) / 96; // Normalize to field space
        const z = (player.boundingBox.y - 540) / 90;
        
        playerMesh.position.set(x, 0.5, z);
        playerMesh.visible = player.confidence > this.config.visual.confidenceThreshold;
    }

    async initializeWebSocket() {
        // 🏆 Championship Health Check - Austin Humphrey Smart Visual Strategy
        console.log('🎥 Checking Visual Processing health before connection...');
        
        try {
            const healthResponse = await fetch('/api/visual/health');
            const healthData = await healthResponse.json();
            
            if (!healthData.inference || healthData.status === 'disabled') {
                console.log('🔒 Visual Processing disabled - Entering graceful offline mode');
                this.enterVisualOfflineMode('Visual processing currently offline');
                return;
            }
        } catch (error) {
            console.log('🔒 Visual health check failed - Graceful offline mode:', error.message);
            this.enterVisualOfflineMode('Service temporarily unavailable');
            return;
        }
        
        console.log('🔌 Health check passed - Connecting to Visual Processing WebSocket...');
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/sports`;
        
        try {
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = (event) => {
                console.log('✅ WebSocket connected for visual processing');
                this.state.isConnected = true;
                this.updateConnectionStatus(true);
            };

            this.websocket.onmessage = (event) => {
                this.handleWebSocketMessage(JSON.parse(event.data));
            };

            this.websocket.onclose = (event) => {
                console.log('🔌 WebSocket disconnected');
                this.state.isConnected = false;
                this.updateConnectionStatus(false);
                
                // Attempt reconnection
                setTimeout(() => this.initializeWebSocket(), 5000);
            };

            this.websocket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.updateConnectionStatus(false);
            };

        } catch (error) {
            console.error('❌ Failed to initialize WebSocket:', error);
            throw error;
        }
    }
    
    enterVisualOfflineMode(reason) {
        this.state.isConnected = false;
        this.updateConnectionStatus(false);
        
        // Disable visual processing controls gracefully
        const visualControls = document.querySelectorAll('#visual-stream-container button, #visual-stream-container input');
        visualControls.forEach(control => {
            control.disabled = true;
            control.style.opacity = '0.5';
        });
        
        // Show subtle offline indicator
        this.showVisualOfflineIndicator(reason);
    }
    
    showVisualOfflineIndicator(reason) {
        const indicator = document.createElement('div');
        indicator.className = 'visual-offline-indicator';
        indicator.innerHTML = `
            <i class="fas fa-video-slash"></i>
            <span>Visual processing offline</span>
            <small>${reason}</small>
        `;
        indicator.style.cssText = `
            position: fixed; top: 60px; right: 20px; z-index: 10000;
            background: rgba(0,0,0,0.8); color: #fff; padding: 12px;
            border-radius: 8px; font-size: 12px; max-width: 200px;
        `;
        
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 5000);
    }

    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'connection':
                this.handleConnectionMessage(message);
                break;
                
            case 'visual_frame_result':
                this.handleVisualFrameResult(message);
                break;
                
            case 'visual_analysis_completed':
                this.handleVisualAnalysisCompleted(message);
                break;
                
            case 'austin_expertise_response':
                this.handleAustinExpertiseResponse(message);
                break;
                
            case 'championship_performance':
                this.handleChampionshipPerformance(message);
                break;
                
            case 'stream_status_update':
                this.handleStreamStatusUpdate(message);
                break;
                
            case 'heartbeat':
                // Update consciousness parameters
                if (message.consciousness) {
                    this.updateConsciousnessDisplay(message.consciousness);
                }
                break;
                
            default:
                console.log('📨 Unhandled message type:', message.type);
        }
    }

    handleConnectionMessage(message) {
        console.log('🔌 Connected to Enhanced Sports WebSocket');
        console.log('🏆 Austin Mode:', message.austinMode?.active);
        console.log('⚡ Visual capabilities:', message.capabilities?.visualProcessing);
        
        // Update UI with connection status
        this.updateConnectionStatus(true);
    }

    handleVisualFrameResult(message) {
        const { streamId, result, processingTime, championshipStandard, austinInsights } = message;
        
        // Update performance metrics
        this.state.processingMetrics = {
            latency: processingTime,
            fps: Math.round(1000 / processingTime),
            accuracy: Math.round(result.detection.averageConfidence * 100),
            championshipStandard
        };
        
        // Store current detections for visualization
        this.state.currentDetections = result.detection;
        
        // Update Austin insights
        if (austinInsights) {
            this.state.austinInsights = austinInsights;
            this.updateAustinInsightsDisplay(austinInsights);
        }
        
        // Draw visual overlays
        this.drawVisualOverlays(result.detection);
        
        // Update metrics display
        this.updateMetricsDisplay();
        
        // Log performance
        if (championshipStandard) {
            console.log(`🏆 Championship standard met: ${processingTime}ms`);
        } else {
            console.log(`⚠️ Performance below championship: ${processingTime}ms`);
        }
    }

    handleVisualAnalysisCompleted(message) {
        console.log('✅ Visual analysis completed:', message.job.id);
        console.log('🎯 Austin insights available:', message.job.austinInsights?.keyObservations?.length || 0);
    }

    handleAustinExpertiseResponse(message) {
        console.log('🧠 Austin expertise response:', message.response.expertiseArea);
        
        // Update Austin insights panel with expertise response
        this.updateAustinExpertiseResponse(message);
    }

    handleChampionshipPerformance(message) {
        const { performance, austinGrade } = message;
        
        console.log(`🏆 Championship performance update - Austin Grade: ${austinGrade}`);
        
        // Update performance displays
        this.updateChampionshipDisplay(performance, austinGrade);
    }

    handleStreamStatusUpdate(message) {
        console.log(`📡 Stream status update: ${message.status}`);
        
        if (message.status === 'connected') {
            this.state.isStreaming = true;
            this.updateStreamControls(true);
        } else if (message.status === 'disconnected') {
            this.state.isStreaming = false;
            this.updateStreamControls(false);
        }
    }

    drawVisualOverlays(detectionResult) {
        if (!this.context || !this.canvas) return;
        
        // Clear previous overlays
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!detectionResult.objects || detectionResult.objects.length === 0) {
            return;
        }
        
        // Set canvas size to match video
        if (this.video.videoWidth > 0) {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
        }
        
        // Draw bounding boxes and labels
        detectionResult.objects.forEach((obj, index) => {
            this.drawBoundingBox(obj, index);
            this.drawObjectLabel(obj, index);
            
            if (obj.trackingHistory) {
                this.drawTrackingHistory(obj);
            }
        });
        
        // Draw formation lines for football
        if (detectionResult.sport === 'football') {
            this.drawFormationLines(detectionResult.objects);
        }
        
        // Draw performance indicators
        this.drawPerformanceIndicators();
    }

    drawBoundingBox(obj, index) {
        const { boundingBox, class: objClass, confidence } = obj;
        
        if (confidence < this.config.visual.confidenceThreshold) return;
        
        const color = this.config.visual.boundingBoxColors[objClass] || '#FFFFFF';
        const opacity = this.config.visual.overlayOpacity;
        
        this.context.strokeStyle = color;
        this.context.lineWidth = 3;
        this.context.globalAlpha = opacity;
        
        // Draw bounding box
        this.context.strokeRect(
            boundingBox.x,
            boundingBox.y,
            boundingBox.width,
            boundingBox.height
        );
        
        // Draw confidence indicator
        const confidenceWidth = boundingBox.width * confidence;
        this.context.fillStyle = color;
        this.context.fillRect(
            boundingBox.x,
            boundingBox.y - 8,
            confidenceWidth,
            4
        );
        
        this.context.globalAlpha = 1;
    }

    drawObjectLabel(obj, index) {
        const { boundingBox, class: objClass, confidence, position, jersey } = obj;
        
        if (confidence < this.config.visual.confidenceThreshold) return;
        
        const color = this.config.visual.boundingBoxColors[objClass] || '#FFFFFF';
        
        this.context.fillStyle = color;
        this.context.font = 'bold 14px Inter';
        this.context.textAlign = 'left';
        
        let label = objClass.toUpperCase();
        
        if (position) {
            label += ` (${position})`;
        }
        
        if (jersey) {
            label += ` #${jersey}`;
        }
        
        label += ` ${Math.round(confidence * 100)}%`;
        
        // Draw label background
        const metrics = this.context.measureText(label);
        this.context.fillStyle = 'rgba(0,0,0,0.8)';
        this.context.fillRect(
            boundingBox.x,
            boundingBox.y - 25,
            metrics.width + 10,
            20
        );
        
        // Draw label text
        this.context.fillStyle = color;
        this.context.fillText(
            label,
            boundingBox.x + 5,
            boundingBox.y - 10
        );
    }

    drawTrackingHistory(obj) {
        if (!obj.trackingHistory || obj.trackingHistory.length < 2) return;
        
        const trackingColor = this.config.visual.trackingColors[
            Math.abs(obj.trackingId?.charCodeAt(0) || 0) % this.config.visual.trackingColors.length
        ];
        
        this.context.strokeStyle = trackingColor;
        this.context.lineWidth = 2;
        this.context.globalAlpha = 0.6;
        
        this.context.beginPath();
        obj.trackingHistory.forEach((point, index) => {
            if (index === 0) {
                this.context.moveTo(point.x, point.y);
            } else {
                this.context.lineTo(point.x, point.y);
            }
        });
        this.context.stroke();
        
        this.context.globalAlpha = 1;
    }

    drawFormationLines(objects) {
        const players = objects.filter(obj => obj.class === 'player');
        
        if (players.length < 5) return;
        
        // Draw offensive line for football
        const offensiveLine = players
            .filter(p => ['center', 'guard', 'tackle'].includes(p.position))
            .sort((a, b) => a.boundingBox.x - b.boundingBox.x);
        
        if (offensiveLine.length >= 3) {
            this.context.strokeStyle = '#FFD700';
            this.context.lineWidth = 2;
            this.context.globalAlpha = 0.5;
            
            this.context.beginPath();
            offensiveLine.forEach((player, index) => {
                const centerX = player.boundingBox.x + player.boundingBox.width / 2;
                const centerY = player.boundingBox.y + player.boundingBox.height / 2;
                
                if (index === 0) {
                    this.context.moveTo(centerX, centerY);
                } else {
                    this.context.lineTo(centerX, centerY);
                }
            });
            this.context.stroke();
            
            this.context.globalAlpha = 1;
        }
    }

    drawPerformanceIndicators() {
        // Draw championship indicator
        const { championshipStandard, latency } = this.state.processingMetrics;
        
        const indicatorSize = 20;
        const x = this.canvas.width - indicatorSize - 10;
        const y = 10;
        
        this.context.fillStyle = championshipStandard ? '#00FF41' : '#FF4B4B';
        this.context.fillRect(x, y, indicatorSize, indicatorSize);
        
        this.context.fillStyle = 'white';
        this.context.font = 'bold 10px Inter';
        this.context.textAlign = 'center';
        this.context.fillText(
            championshipStandard ? '🏆' : '⚠️',
            x + indicatorSize / 2,
            y + indicatorSize / 2 + 3
        );
        
        // Draw latency indicator
        this.context.fillStyle = 'rgba(0,0,0,0.8)';
        this.context.fillRect(x - 60, y, 55, indicatorSize);
        
        this.context.fillStyle = championshipStandard ? '#00FF41' : '#FF4B4B';
        this.context.textAlign = 'left';
        this.context.fillText(
            `${latency}ms`,
            x - 55,
            y + indicatorSize / 2 + 3
        );
    }

    updateMetricsDisplay() {
        const { latency, fps, accuracy, championshipStandard } = this.state.processingMetrics;
        
        const latencyEl = document.getElementById('latency-value');
        const fpsEl = document.getElementById('fps-value');
        const accuracyEl = document.getElementById('accuracy-value');
        const championshipEl = document.getElementById('championship-status');
        const austinGradeEl = document.getElementById('austin-grade');
        
        if (latencyEl) {
            latencyEl.textContent = `${latency} ms`;
            latencyEl.className = `metric-value ${championshipStandard ? 'championship-met' : 'championship-missed'}`;
        }
        
        if (fpsEl) {
            fpsEl.textContent = `${fps} fps`;
        }
        
        if (accuracyEl) {
            accuracyEl.textContent = `${accuracy}%`;
        }
        
        if (championshipEl) {
            championshipEl.textContent = championshipStandard ? '🏆 MET' : '⚠️ MISSED';
            championshipEl.className = `metric-value ${championshipStandard ? 'championship-met' : 'championship-missed'}`;
        }
        
        if (austinGradeEl) {
            const grade = this.calculateAustinGrade();
            austinGradeEl.textContent = grade;
        }
    }

    updateAustinInsightsDisplay(insights) {
        const contentEl = document.getElementById('austin-insights-content');
        if (!contentEl) return;
        
        const { expert, background, keyObservations, recommendedFocus } = insights;
        
        contentEl.innerHTML = `
            <div class="austin-expert-info">
                <p><strong>${expert}</strong></p>
                <p style="font-size: 10px; opacity: 0.8; margin-bottom: 15px;">${background}</p>
            </div>
            
            <div class="austin-observations">
                <h5 style="color: #FFD700; margin: 10px 0 5px 0;">Key Observations:</h5>
                <ul style="margin: 0; padding-left: 15px; font-size: 11px;">
                    ${keyObservations.map(obs => `<li style="margin-bottom: 3px;">${obs}</li>`).join('')}
                </ul>
            </div>
            
            <div class="austin-recommendations">
                <h5 style="color: #00FF41; margin: 10px 0 5px 0;">Recommended Focus:</h5>
                <ul style="margin: 0; padding-left: 15px; font-size: 11px;">
                    ${recommendedFocus.map(rec => `<li style="margin-bottom: 3px;">${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    updateAustinExpertiseResponse(message) {
        const contentEl = document.getElementById('austin-insights-content');
        if (!contentEl) return;
        
        const { response, expert, background } = message;
        
        contentEl.innerHTML = `
            <div class="austin-expertise-response">
                <p><strong>${expert}</strong></p>
                <p style="font-size: 10px; opacity: 0.8; margin-bottom: 10px;">${background}</p>
                
                <div style="margin: 10px 0;">
                    <h5 style="color: #FFD700; margin: 5px 0;">Expertise Area:</h5>
                    <p style="font-size: 11px;">${response.expertiseArea}</p>
                </div>
                
                <div style="margin: 10px 0;">
                    <h5 style="color: #00FF41; margin: 5px 0;">Analysis:</h5>
                    <p style="font-size: 11px;">${response.response}</p>
                </div>
                
                <div style="margin: 10px 0;">
                    <h5 style="color: #BF5700; margin: 5px 0;">Championship Mindset:</h5>
                    <p style="font-size: 11px; font-style: italic;">"${response.championshipMindset}"</p>
                </div>
            </div>
        `;
    }

    async startVisualStream() {
        if (!this.state.isConnected || this.state.isStreaming) {
            console.warn('⚠️ Cannot start stream - not connected or already streaming');
            return;
        }

        try {
            const sport = document.getElementById('sport-select')?.value || 'football';
            const quality = document.getElementById('quality-select')?.value || 'auto';
            const expertiseLevel = document.getElementById('expertise-select')?.value || 'championship';

            console.log(`🎥 Starting visual stream - ${sport} (${expertiseLevel})`);

            // Generate stream ID
            const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Request stream creation via API
            const response = await fetch('/api/visual/stream/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    source: 'webcam', // or specific source
                    sport,
                    quality,
                    expertiseLevel,
                    options: {
                        austinMode: this.config.austinMode.enabled,
                        realTime: true,
                        analysisTypes: [
                            'player_detection',
                            'formation_analysis',
                            'pressure_moments',
                            'austin_insights'
                        ]
                    }
                })
            });

            const streamConfig = await response.json();

            if (streamConfig.success) {
                this.state.currentStream = streamConfig;
                
                // Initialize WebRTC for the stream
                await this.initializeWebRTC(streamConfig);
                
                // Send WebSocket message to start visual processing
                this.websocket.send(JSON.stringify({
                    type: 'start_visual_stream',
                    streamId: streamConfig.streamId,
                    source: 'webcam',
                    options: {
                        sport,
                        quality,
                        expertiseLevel,
                        austinMode: this.config.austinMode.enabled
                    }
                }));

                console.log(`✅ Visual stream started: ${streamConfig.streamId}`);
                this.updateStreamControls(true);

            } else {
                throw new Error(streamConfig.error || 'Failed to create stream');
            }

        } catch (error) {
            console.error('❌ Failed to start visual stream:', error);
            alert('Failed to start visual stream: ' + error.message);
        }
    }

    async stopVisualStream() {
        if (!this.state.isStreaming || !this.state.currentStream) {
            console.warn('⚠️ No active stream to stop');
            return;
        }

        try {
            const streamId = this.state.currentStream.streamId;
            
            console.log(`🛑 Stopping visual stream: ${streamId}`);

            // Send WebSocket message to stop processing
            this.websocket.send(JSON.stringify({
                type: 'stop_visual_stream',
                streamId
            }));

            // Stop WebRTC connection
            if (this.peerConnection) {
                this.peerConnection.close();
                this.peerConnection = null;
            }

            // Stop video stream
            if (this.video.srcObject) {
                const tracks = this.video.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                this.video.srcObject = null;
            }

            // Delete stream via API
            await fetch(`/api/visual/stream/${streamId}`, {
                method: 'DELETE'
            });

            this.state.isStreaming = false;
            this.state.currentStream = null;
            
            console.log(`✅ Visual stream stopped: ${streamId}`);
            this.updateStreamControls(false);

        } catch (error) {
            console.error('❌ Failed to stop visual stream:', error);
        }
    }

    async initializeWebRTC(streamConfig) {
        try {
            // Create peer connection
            this.peerConnection = new RTCPeerConnection(this.config.webrtc);

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.websocket.send(JSON.stringify({
                        type: 'webrtc_signal',
                        streamId: streamConfig.streamId,
                        signal: {
                            candidate: event.candidate
                        }
                    }));
                }
            };

            // Handle incoming stream
            this.peerConnection.ontrack = (event) => {
                console.log('📡 Received WebRTC video track');
                this.video.srcObject = event.streams[0];
                this.video.play();
            };

            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: 1280, 
                    height: 720,
                    frameRate: 30
                },
                audio: false
            });

            // Add stream to peer connection
            stream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, stream);
            });

            // Create offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            // Send offer via WebSocket
            this.websocket.send(JSON.stringify({
                type: 'webrtc_signal',
                streamId: streamConfig.streamId,
                signal: offer
            }));

            console.log('✅ WebRTC initialized');

        } catch (error) {
            console.error('❌ WebRTC initialization failed:', error);
            throw error;
        }
    }

    toggleAustinMode() {
        this.config.austinMode.enabled = !this.config.austinMode.enabled;
        
        const btn = document.getElementById('toggle-austin-mode');
        if (btn) {
            btn.textContent = `Austin Mode: ${this.config.austinMode.enabled ? 'ON' : 'OFF'}`;
            btn.style.background = this.config.austinMode.enabled ? '#00FF41' : '#666';
            btn.style.color = this.config.austinMode.enabled ? 'black' : 'white';
        }
        
        console.log(`🧠 Austin Mode: ${this.config.austinMode.enabled ? 'ENABLED' : 'DISABLED'}`);
        
        if (this.state.isStreaming) {
            // Send update to processing service
            this.websocket.send(JSON.stringify({
                type: 'austin_expertise_query',
                query: 'Update Austin Mode settings',
                context: {
                    sport: document.getElementById('sport-select')?.value || 'football',
                    austinMode: this.config.austinMode.enabled
                }
            }));
        }
    }

    updateConnectionStatus(connected) {
        // Update UI elements to reflect connection status
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            background: ${connected ? '#00FF41' : '#FF4B4B'};
            color: ${connected ? 'black' : 'white'};
            border-radius: 4px;
            font-weight: bold;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
        `;
        indicator.textContent = `${connected ? '✅ Connected' : '❌ Disconnected'}`;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 3000);
    }

    updateStreamControls(streaming) {
        const startBtn = document.getElementById('start-stream-btn');
        const stopBtn = document.getElementById('stop-stream-btn');
        
        if (startBtn) {
            startBtn.disabled = streaming;
            startBtn.style.opacity = streaming ? '0.5' : '1';
        }
        
        if (stopBtn) {
            stopBtn.disabled = !streaming;
            stopBtn.style.opacity = streaming ? '1' : '0.5';
        }
    }

    updateConsciousnessDisplay(consciousness) {
        // Update consciousness parameters display if needed
        console.log('🧠 Consciousness update:', consciousness);
    }

    calculateAustinGrade() {
        const { latency, accuracy, championshipStandard } = this.state.processingMetrics;
        
        let grade = 100;
        
        if (!championshipStandard) grade -= 20;
        if (accuracy < 90) grade -= 15;
        if (latency > 50) grade -= 10;
        
        if (grade >= 95) return 'A+';
        if (grade >= 90) return 'A';
        if (grade >= 85) return 'B+';
        if (grade >= 80) return 'B';
        if (grade >= 75) return 'C+';
        return 'Needs Improvement';
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            // Monitor and log performance metrics
            if (this.state.isStreaming) {
                console.log('📊 Performance:', this.state.processingMetrics);
            }
        }, 5000);
    }

    // Public API methods
    getStreamStatus() {
        return {
            connected: this.state.isConnected,
            streaming: this.state.isStreaming,
            currentStream: this.state.currentStream,
            metrics: this.state.processingMetrics,
            austinMode: this.config.austinMode.enabled
        };
    }

    async requestAustinAnalysis(query, context = {}) {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        this.websocket.send(JSON.stringify({
            type: 'austin_expertise_query',
            query,
            context: {
                sport: document.getElementById('sport-select')?.value || 'football',
                ...context
            }
        }));
    }

    async validateChampionshipStandards(metrics) {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        this.websocket.send(JSON.stringify({
            type: 'championship_validation',
            metrics
        }));
    }

    // Cleanup method
    destroy() {
        console.log('🛑 Destroying Visual Stream Client...');
        
        // Stop any active streams
        if (this.state.isStreaming) {
            this.stopVisualStream();
        }
        
        // Close WebSocket
        if (this.websocket) {
            this.websocket.close();
        }
        
        // Close WebRTC
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        
        // Remove DOM elements
        if (this.container) {
            this.container.remove();
        }
        
        console.log('✅ Visual Stream Client destroyed');
    }
}

// Export for use
window.VisualStreamClient = VisualStreamClient;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('visual-client-mount')) {
            window.visualClient = new VisualStreamClient();
        }
    });
} else {
    if (document.getElementById('visual-client-mount')) {
        window.visualClient = new VisualStreamClient();
    }
}

console.log('🎥 Visual Stream Client module loaded - Ready for championship analytics');

export default VisualStreamClient;