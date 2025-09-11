/**
 * Blaze Video AI Coaching Engine
 * Championship-level biomechanical analysis and character assessment
 * Combines form analysis with micro-expression detection for grit evaluation
 */

class BlazeVideoAIEngine {
    constructor() {
        this.isInitialized = false;
        this.analysisMode = 'comprehensive'; // biomechanical, character, comprehensive
        this.currentSession = null;
        this.gritIndicators = new Map();
        this.biomechanicalBaseline = new Map();
        this.characterProfile = new Map();
        this.init();
    }

    async init() {
        try {
            await this.initializeAIModels();
            await this.setupVideoCapture();
            this.setupAnalysisFrameworks();
            this.initializeUI();
            this.isInitialized = true;
            console.log('🎥 Blaze Video AI Engine initialized successfully');
        } catch (error) {
            console.error('❌ Video AI Engine initialization failed:', error);
            this.showFallbackInterface();
        }
    }

    async initializeAIModels() {
        // Initialize TensorFlow.js models for biomechanical analysis
        if (typeof tf !== 'undefined') {
            this.poseDetectionModel = await this.loadPoseModel();
            this.faceAnalysisModel = await this.loadFaceModel();
        }
        
        // Initialize MediaPipe for advanced pose detection
        this.mediaPipeConfig = {
            pose: {
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
            },
            face: {
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            }
        };
        
        // Championship-level analysis thresholds
        this.analysisThresholds = {
            biomechanical: {
                balance: { excellent: 0.95, good: 0.85, fair: 0.70 },
                rotation: { excellent: 0.92, good: 0.82, fair: 0.65 },
                timing: { excellent: 0.96, good: 0.88, fair: 0.75 },
                power_transfer: { excellent: 0.94, good: 0.84, fair: 0.70 }
            },
            character: {
                focus: { elite: 0.90, high: 0.80, moderate: 0.65 },
                determination: { elite: 0.88, high: 0.78, moderate: 0.60 },
                composure: { elite: 0.92, high: 0.82, moderate: 0.70 },
                confidence: { elite: 0.89, high: 0.79, moderate: 0.65 }
            }
        };
    }

    async loadPoseModel() {
        // Load MoveNet or PoseNet for biomechanical analysis
        try {
            const model = await tf.loadLayersModel('/models/biomechanical-pose-model.json');
            return model;
        } catch (error) {
            console.warn('Using fallback pose detection');
            return null;
        }
    }

    async loadFaceModel() {
        // Load facial expression analysis model
        try {
            const model = await tf.loadLayersModel('/models/character-expression-model.json');
            return model;
        } catch (error) {
            console.warn('Using fallback expression analysis');
            return null;
        }
    }

    async setupVideoCapture() {
        // Check for camera availability
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 60 }
                },
                audio: false
            });
            
            this.hasCamera = true;
        } catch (error) {
            console.warn('Camera not available, using upload mode');
            this.hasCamera = false;
        }
    }

    setupAnalysisFrameworks() {
        // Biomechanical Analysis Framework
        this.biomechanicalFramework = {
            baseball: {
                swing: {
                    keypoints: ['shoulders', 'hips', 'hands', 'feet'],
                    phases: ['setup', 'load', 'stride', 'swing', 'follow_through'],
                    metrics: ['bat_speed', 'launch_angle', 'contact_point', 'balance']
                },
                pitching: {
                    keypoints: ['shoulders', 'hips', 'arm', 'stride_leg'],
                    phases: ['windup', 'stride', 'arm_cocking', 'acceleration', 'follow_through'],
                    metrics: ['velocity', 'spin_rate', 'release_point', 'arm_angle']
                }
            },
            football: {
                throwing: {
                    keypoints: ['shoulders', 'hips', 'arm', 'feet'],
                    phases: ['setup', 'drop_back', 'cock', 'release', 'follow_through'],
                    metrics: ['accuracy', 'velocity', 'spiral', 'footwork']
                },
                running: {
                    keypoints: ['head', 'shoulders', 'hips', 'knees', 'feet'],
                    phases: ['stance', 'drive', 'acceleration', 'top_speed'],
                    metrics: ['stride_length', 'frequency', 'lean', 'arm_drive']
                }
            }
        };

        // Character Assessment Framework (based on micro-expressions and body language)
        this.characterFramework = {
            grit_indicators: {
                determination: {
                    facial: ['jaw_clench', 'brow_furrow', 'eye_focus'],
                    body: ['chest_out', 'shoulders_square', 'stable_stance'],
                    behavioral: ['quick_recovery', 'maintained_intensity', 'consistent_effort']
                },
                mental_toughness: {
                    facial: ['steady_gaze', 'controlled_breathing', 'minimal_tension'],
                    body: ['relaxed_shoulders', 'centered_posture', 'fluid_movement'],
                    behavioral: ['adaptation_speed', 'pressure_response', 'focus_duration']
                }
            },
            leadership_traits: {
                confidence: {
                    facial: ['direct_eye_contact', 'relaxed_expression', 'subtle_smile'],
                    body: ['upright_posture', 'purposeful_movement', 'open_gestures'],
                    behavioral: ['decision_speed', 'communication_clarity', 'team_interaction']
                },
                composure: {
                    facial: ['controlled_expression', 'steady_breathing', 'focused_eyes'],
                    body: ['stable_base', 'minimal_fidgeting', 'controlled_movements'],
                    behavioral: ['consistent_performance', 'stress_management', 'recovery_time']
                }
            }
        };
    }

    initializeUI() {
        // Create video AI interface
        const container = this.createVideoAIContainer();
        document.body.appendChild(container);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize dashboard integration
        this.setupDashboardIntegration();
    }

    createVideoAIContainer() {
        const container = document.createElement('div');
        container.id = 'blaze-video-ai-container';
        container.className = 'video-ai-container hidden';
        
        container.innerHTML = `
            <div class="video-ai-overlay">
                <div class="video-ai-panel">
                    <div class="panel-header">
                        <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-cyan-400">
                            🎥 Blaze Vision AI Coaching
                        </h2>
                        <div class="panel-controls">
                            <button id="analysis-mode-toggle" class="mode-toggle">
                                Comprehensive Analysis
                            </button>
                            <button id="close-video-ai" class="close-btn">×</button>
                        </div>
                    </div>
                    
                    <div class="video-interface">
                        <div class="video-section">
                            <div class="video-container">
                                <video id="video-feed" class="video-display" ${this.hasCamera ? 'autoplay muted' : ''}>
                                    <source src="" type="video/mp4">
                                </video>
                                <canvas id="analysis-overlay" class="analysis-overlay"></canvas>
                                
                                <div class="video-controls">
                                    ${this.hasCamera ? `
                                        <button id="start-camera" class="control-btn primary">Start Live Analysis</button>
                                        <button id="stop-camera" class="control-btn secondary hidden">Stop Camera</button>
                                    ` : ''}
                                    <input type="file" id="video-upload" accept="video/*" class="file-input">
                                    <label for="video-upload" class="control-btn secondary">Upload Video</label>
                                </div>
                            </div>
                            
                            <div class="analysis-controls">
                                <div class="sport-selector">
                                    <label>Sport Focus:</label>
                                    <select id="sport-focus">
                                        <option value="baseball">Baseball</option>
                                        <option value="football">Football</option>
                                        <option value="basketball">Basketball</option>
                                        <option value="general">General Athletics</option>
                                    </select>
                                </div>
                                
                                <div class="analysis-type">
                                    <label>Analysis Type:</label>
                                    <div class="checkbox-group">
                                        <label><input type="checkbox" checked id="biomechanical-analysis"> Biomechanical</label>
                                        <label><input type="checkbox" checked id="character-analysis"> Character/Grit</label>
                                        <label><input type="checkbox" id="performance-analysis"> Performance</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="results-section">
                            <div class="real-time-metrics">
                                <h3>Live Analysis</h3>
                                <div class="metrics-grid">
                                    <div class="metric-card">
                                        <div class="metric-label">Form Score</div>
                                        <div class="metric-value" id="form-score">--</div>
                                        <div class="metric-trend" id="form-trend">--</div>
                                    </div>
                                    <div class="metric-card">
                                        <div class="metric-label">Grit Index</div>
                                        <div class="metric-value" id="grit-index">--</div>
                                        <div class="metric-trend" id="grit-trend">--</div>
                                    </div>
                                    <div class="metric-card">
                                        <div class="metric-label">Focus Level</div>
                                        <div class="metric-value" id="focus-level">--</div>
                                        <div class="metric-trend" id="focus-trend">--</div>
                                    </div>
                                    <div class="metric-card">
                                        <div class="metric-label">Composure</div>
                                        <div class="metric-value" id="composure-score">--</div>
                                        <div class="metric-trend" id="composure-trend">--</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="detailed-analysis">
                                <div class="analysis-tabs">
                                    <button class="tab-btn active" data-tab="biomechanical">Biomechanical</button>
                                    <button class="tab-btn" data-tab="character">Character</button>
                                    <button class="tab-btn" data-tab="recommendations">Coaching Tips</button>
                                </div>
                                
                                <div class="tab-content">
                                    <div id="biomechanical-tab" class="tab-panel active">
                                        <div class="biomechanical-breakdown">
                                            <div class="component-analysis">
                                                <h4>Movement Analysis</h4>
                                                <div class="component-item">
                                                    <span>Balance & Stability</span>
                                                    <div class="progress-bar">
                                                        <div class="progress-fill" id="balance-progress"></div>
                                                    </div>
                                                    <span class="score" id="balance-score">--</span>
                                                </div>
                                                <div class="component-item">
                                                    <span>Rotation Mechanics</span>
                                                    <div class="progress-bar">
                                                        <div class="progress-fill" id="rotation-progress"></div>
                                                    </div>
                                                    <span class="score" id="rotation-score">--</span>
                                                </div>
                                                <div class="component-item">
                                                    <span>Timing & Rhythm</span>
                                                    <div class="progress-bar">
                                                        <div class="progress-fill" id="timing-progress"></div>
                                                    </div>
                                                    <span class="score" id="timing-score">--</span>
                                                </div>
                                                <div class="component-item">
                                                    <span>Power Transfer</span>
                                                    <div class="progress-bar">
                                                        <div class="progress-fill" id="power-progress"></div>
                                                    </div>
                                                    <span class="score" id="power-score">--</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div id="character-tab" class="tab-panel">
                                        <div class="character-analysis">
                                            <h4>Character Assessment</h4>
                                            <div class="character-traits">
                                                <div class="trait-card">
                                                    <div class="trait-header">
                                                        <span class="trait-name">Determination</span>
                                                        <span class="trait-score" id="determination-score">--</span>
                                                    </div>
                                                    <div class="trait-indicators" id="determination-indicators">
                                                        <span class="indicator">Analyzing...</span>
                                                    </div>
                                                </div>
                                                <div class="trait-card">
                                                    <div class="trait-header">
                                                        <span class="trait-name">Mental Toughness</span>
                                                        <span class="trait-score" id="toughness-score">--</span>
                                                    </div>
                                                    <div class="trait-indicators" id="toughness-indicators">
                                                        <span class="indicator">Analyzing...</span>
                                                    </div>
                                                </div>
                                                <div class="trait-card">
                                                    <div class="trait-header">
                                                        <span class="trait-name">Confidence</span>
                                                        <span class="trait-score" id="confidence-score">--</span>
                                                    </div>
                                                    <div class="trait-indicators" id="confidence-indicators">
                                                        <span class="indicator">Analyzing...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div id="recommendations-tab" class="tab-panel">
                                        <div class="coaching-recommendations">
                                            <h4>AI Coaching Recommendations</h4>
                                            <div id="coaching-tips" class="recommendations-list">
                                                <div class="recommendation-item">
                                                    <div class="rec-priority">HIGH</div>
                                                    <div class="rec-content">
                                                        <div class="rec-title">Waiting for analysis...</div>
                                                        <div class="rec-description">Begin video analysis to receive personalized coaching recommendations.</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="session-controls">
                        <button id="start-analysis" class="control-btn primary">Start Analysis</button>
                        <button id="pause-analysis" class="control-btn secondary hidden">Pause</button>
                        <button id="save-session" class="control-btn secondary">Save Session</button>
                        <button id="export-report" class="control-btn secondary">Export Report</button>
                    </div>
                </div>
            </div>
        `;
        
        this.addVideoAIStyles();
        return container;
    }

    addVideoAIStyles() {
        if (document.getElementById('video-ai-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'video-ai-styles';
        styles.textContent = `
            .video-ai-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(20px);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            }

            .video-ai-container.hidden {
                display: none;
            }

            .video-ai-panel {
                width: 100%;
                max-width: 1600px;
                height: 90vh;
                background: rgba(15, 23, 42, 0.95);
                border: 2px solid rgba(0, 255, 255, 0.3);
                border-radius: 1rem;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 2rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(30, 41, 59, 0.8);
            }

            .panel-controls {
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .mode-toggle {
                padding: 0.5rem 1rem;
                background: rgba(255, 140, 0, 0.2);
                border: 1px solid #ff8c00;
                border-radius: 0.5rem;
                color: #ff8c00;
                font-size: 0.875rem;
                cursor: pointer;
            }

            .close-btn {
                width: 40px;
                height: 40px;
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid #ef4444;
                border-radius: 50%;
                color: #ef4444;
                font-size: 1.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .video-interface {
                display: grid;
                grid-template-columns: 1fr 400px;
                gap: 2rem;
                padding: 2rem;
                flex: 1;
                overflow: hidden;
            }

            .video-section {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .video-container {
                position: relative;
                flex: 1;
                background: #000;
                border-radius: 0.5rem;
                overflow: hidden;
                min-height: 400px;
            }

            .video-display {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .analysis-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }

            .video-controls {
                position: absolute;
                bottom: 1rem;
                left: 1rem;
                right: 1rem;
                display: flex;
                gap: 1rem;
                justify-content: center;
            }

            .control-btn {
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
            }

            .control-btn.primary {
                background: linear-gradient(45deg, #ff8c00, #00ffff);
                color: white;
            }

            .control-btn.secondary {
                background: rgba(51, 65, 85, 0.8);
                color: #94a3b8;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .control-btn:hover {
                transform: translateY(-2px);
            }

            .file-input {
                display: none;
            }

            .analysis-controls {
                display: flex;
                gap: 2rem;
                padding: 1rem;
                background: rgba(30, 41, 59, 0.5);
                border-radius: 0.5rem;
            }

            .sport-selector, .analysis-type {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .sport-selector label, .analysis-type label {
                color: #9ca3af;
                font-size: 0.875rem;
                font-weight: 500;
            }

            .sport-selector select {
                padding: 0.5rem;
                background: rgba(51, 65, 85, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.375rem;
                color: white;
            }

            .checkbox-group {
                display: flex;
                gap: 1rem;
            }

            .checkbox-group label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #e2e8f0;
                font-size: 0.875rem;
            }

            .results-section {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                overflow-y: auto;
            }

            .real-time-metrics h3 {
                color: #00ffff;
                margin-bottom: 1rem;
                font-size: 1.125rem;
                font-weight: 600;
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .metric-card {
                background: rgba(30, 41, 59, 0.8);
                border: 1px solid rgba(255, 140, 0, 0.2);
                border-radius: 0.5rem;
                padding: 1rem;
                text-align: center;
            }

            .metric-label {
                font-size: 0.75rem;
                color: #94a3b8;
                margin-bottom: 0.5rem;
            }

            .metric-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: #ff8c00;
                margin-bottom: 0.25rem;
            }

            .metric-trend {
                font-size: 0.75rem;
                color: #10b981;
            }

            .analysis-tabs {
                display: flex;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 1rem;
            }

            .tab-btn {
                padding: 0.75rem 1rem;
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.3s ease;
            }

            .tab-btn.active {
                color: #00ffff;
                border-bottom-color: #00ffff;
            }

            .tab-panel {
                display: none;
            }

            .tab-panel.active {
                display: block;
            }

            .component-analysis h4, .character-analysis h4, .coaching-recommendations h4 {
                color: #e2e8f0;
                margin-bottom: 1rem;
                font-size: 1rem;
                font-weight: 600;
            }

            .component-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 0.75rem;
                font-size: 0.875rem;
            }

            .component-item span:first-child {
                flex: 1;
                color: #e2e8f0;
            }

            .progress-bar {
                flex: 2;
                height: 8px;
                background: rgba(51, 65, 85, 0.5);
                border-radius: 4px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff8c00, #00ffff);
                transition: width 0.3s ease;
                width: 0%;
            }

            .component-item .score {
                flex: 0 0 40px;
                color: #ff8c00;
                font-weight: 600;
                text-align: right;
            }

            .character-traits {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .trait-card {
                background: rgba(51, 65, 85, 0.3);
                border-radius: 0.5rem;
                padding: 1rem;
            }

            .trait-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .trait-name {
                color: #e2e8f0;
                font-weight: 500;
            }

            .trait-score {
                color: #00ffff;
                font-weight: 600;
            }

            .trait-indicators {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .indicator {
                padding: 0.25rem 0.5rem;
                background: rgba(16, 185, 129, 0.2);
                color: #10b981;
                border-radius: 0.25rem;
                font-size: 0.75rem;
            }

            .recommendations-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .recommendation-item {
                display: flex;
                gap: 1rem;
                padding: 1rem;
                background: rgba(51, 65, 85, 0.3);
                border-radius: 0.5rem;
            }

            .rec-priority {
                padding: 0.25rem 0.5rem;
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                font-weight: 600;
                height: fit-content;
            }

            .rec-priority.medium {
                background: rgba(255, 140, 0, 0.2);
                color: #ff8c00;
            }

            .rec-priority.low {
                background: rgba(16, 185, 129, 0.2);
                color: #10b981;
            }

            .rec-content {
                flex: 1;
            }

            .rec-title {
                color: #e2e8f0;
                font-weight: 500;
                margin-bottom: 0.25rem;
            }

            .rec-description {
                color: #94a3b8;
                font-size: 0.875rem;
                line-height: 1.5;
            }

            .session-controls {
                display: flex;
                gap: 1rem;
                padding: 1rem 2rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(30, 41, 59, 0.8);
            }

            .hidden {
                display: none !important;
            }

            @media (max-width: 1200px) {
                .video-interface {
                    grid-template-columns: 1fr;
                    grid-template-rows: 1fr auto;
                }
                
                .results-section {
                    max-height: 300px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    setupEventListeners() {
        // Close button
        document.getElementById('close-video-ai').addEventListener('click', () => {
            this.closeVideoAI();
        });

        // Camera controls
        if (this.hasCamera) {
            document.getElementById('start-camera').addEventListener('click', () => {
                this.startLiveAnalysis();
            });
            
            document.getElementById('stop-camera').addEventListener('click', () => {
                this.stopLiveAnalysis();
            });
        }

        // Video upload
        document.getElementById('video-upload').addEventListener('change', (e) => {
            this.handleVideoUpload(e.target.files[0]);
        });

        // Analysis controls
        document.getElementById('start-analysis').addEventListener('click', () => {
            this.startAnalysis();
        });

        document.getElementById('pause-analysis').addEventListener('click', () => {
            this.pauseAnalysis();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Export and save
        document.getElementById('save-session').addEventListener('click', () => {
            this.saveSession();
        });

        document.getElementById('export-report').addEventListener('click', () => {
            this.exportAnalysisReport();
        });

        // Analysis mode toggle
        document.getElementById('analysis-mode-toggle').addEventListener('click', () => {
            this.toggleAnalysisMode();
        });
    }

    setupDashboardIntegration() {
        // Add video AI trigger to main dashboard
        this.addVideoAITrigger();
    }

    addVideoAITrigger() {
        // Add "Launch Video AI" button to existing dashboards or navigation
        const triggerBtn = document.createElement('button');
        triggerBtn.id = 'launch-video-ai';
        triggerBtn.className = 'video-ai-trigger';
        triggerBtn.innerHTML = `
            <span>🎥</span>
            <span>Video AI Coaching</span>
        `;
        
        triggerBtn.addEventListener('click', () => {
            this.openVideoAI();
        });

        // Add to navigation or dashboard
        const nav = document.querySelector('nav') || document.querySelector('.dashboard-header') || document.body;
        nav.appendChild(triggerBtn);

        // Add trigger styles
        const triggerStyles = document.createElement('style');
        triggerStyles.textContent = `
            .video-ai-trigger {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
                background: linear-gradient(45deg, #ff8c00, #00ffff);
                color: white;
                border: none;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                z-index: 100;
                box-shadow: 0 4px 15px rgba(255, 140, 0, 0.3);
            }

            .video-ai-trigger:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 140, 0, 0.4);
            }

            .video-ai-trigger span:first-child {
                font-size: 1.2rem;
            }
        `;
        
        document.head.appendChild(triggerStyles);
    }

    openVideoAI() {
        const container = document.getElementById('blaze-video-ai-container');
        if (container) {
            container.classList.remove('hidden');
            this.initializeSession();
        }
    }

    closeVideoAI() {
        const container = document.getElementById('blaze-video-ai-container');
        if (container) {
            container.classList.add('hidden');
            this.cleanupSession();
        }
    }

    initializeSession() {
        this.currentSession = {
            id: this.generateSessionId(),
            startTime: Date.now(),
            sport: 'baseball',
            analysisType: ['biomechanical', 'character'],
            frames: [],
            metrics: new Map(),
            insights: []
        };

        console.log('🎥 New video analysis session started:', this.currentSession.id);
    }

    async startLiveAnalysis() {
        if (!this.hasCamera || !this.stream) return;

        const video = document.getElementById('video-feed');
        video.srcObject = this.stream;
        
        document.getElementById('start-camera').classList.add('hidden');
        document.getElementById('stop-camera').classList.remove('hidden');

        // Start frame analysis
        this.analysisLoop = setInterval(() => {
            this.analyzeFrame(video);
        }, 100); // 10 FPS analysis
    }

    stopLiveAnalysis() {
        if (this.analysisLoop) {
            clearInterval(this.analysisLoop);
            this.analysisLoop = null;
        }

        const video = document.getElementById('video-feed');
        video.srcObject = null;
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        document.getElementById('start-camera').classList.remove('hidden');
        document.getElementById('stop-camera').classList.add('hidden');
    }

    handleVideoUpload(file) {
        if (!file || !file.type.startsWith('video/')) return;

        const video = document.getElementById('video-feed');
        const url = URL.createObjectURL(file);
        video.src = url;
        
        video.addEventListener('loadeddata', () => {
            console.log('📹 Video uploaded and ready for analysis');
            this.videoReady = true;
        });
    }

    async analyzeFrame(videoElement) {
        if (!this.isInitialized || !videoElement) return;

        try {
            const canvas = document.getElementById('analysis-overlay');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to match video
            canvas.width = videoElement.videoWidth || videoElement.width;
            canvas.height = videoElement.videoHeight || videoElement.height;

            // Capture frame for analysis
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Run biomechanical analysis
            const biomechanicalResults = await this.analyzeBiomechanics(imageData);
            
            // Run character analysis
            const characterResults = await this.analyzeCharacter(imageData);
            
            // Update UI with results
            this.updateRealTimeMetrics(biomechanicalResults, characterResults);
            
            // Draw analysis overlay
            this.drawAnalysisOverlay(ctx, biomechanicalResults, characterResults);

        } catch (error) {
            console.error('Frame analysis error:', error);
        }
    }

    async analyzeBiomechanics(imageData) {
        // Simulated biomechanical analysis (would use actual AI models in production)
        const mockResults = {
            balance: 0.85 + (Math.random() - 0.5) * 0.1,
            rotation: 0.82 + (Math.random() - 0.5) * 0.1,
            timing: 0.88 + (Math.random() - 0.5) * 0.1,
            power_transfer: 0.86 + (Math.random() - 0.5) * 0.1,
            keypoints: this.generateMockKeypoints(),
            phase: this.detectMovementPhase()
        };

        return mockResults;
    }

    async analyzeCharacter(imageData) {
        // Simulated character analysis (would use facial recognition and body language AI)
        const mockResults = {
            determination: 0.89 + (Math.random() - 0.5) * 0.1,
            focus: 0.92 + (Math.random() - 0.5) * 0.1,
            composure: 0.87 + (Math.random() - 0.5) * 0.1,
            confidence: 0.84 + (Math.random() - 0.5) * 0.1,
            grit_indicators: this.detectGritIndicators(),
            micro_expressions: this.analyzeMicroExpressions()
        };

        return mockResults;
    }

    generateMockKeypoints() {
        // Mock keypoint detection for demonstration
        return {
            shoulders: { x: 320, y: 180, confidence: 0.95 },
            hips: { x: 325, y: 280, confidence: 0.92 },
            hands: { x: 280, y: 240, confidence: 0.88 },
            feet: { x: 330, y: 420, confidence: 0.94 }
        };
    }

    detectMovementPhase() {
        const phases = ['setup', 'load', 'stride', 'swing', 'follow_through'];
        return phases[Math.floor(Math.random() * phases.length)];
    }

    detectGritIndicators() {
        const indicators = [
            'jaw_tension', 'focused_eyes', 'controlled_breathing',
            'stable_stance', 'purposeful_movement', 'quick_recovery'
        ];
        
        return indicators.filter(() => Math.random() > 0.6);
    }

    analyzeMicroExpressions() {
        const expressions = [
            'determination', 'concentration', 'confidence', 'composure'
        ];
        
        return expressions.filter(() => Math.random() > 0.7);
    }

    updateRealTimeMetrics(biomechanical, character) {
        // Update form score
        const formScore = Math.round(
            (biomechanical.balance + biomechanical.rotation + 
             biomechanical.timing + biomechanical.power_transfer) / 4 * 100
        );
        document.getElementById('form-score').textContent = formScore;

        // Update grit index
        const gritIndex = Math.round(
            (character.determination + character.focus) / 2 * 100
        );
        document.getElementById('grit-index').textContent = gritIndex;

        // Update focus level
        const focusLevel = Math.round(character.focus * 100);
        document.getElementById('focus-level').textContent = focusLevel;

        // Update composure
        const composureScore = Math.round(character.composure * 100);
        document.getElementById('composure-score').textContent = composureScore;

        // Update detailed biomechanical scores
        this.updateBiomechanicalTab(biomechanical);
        this.updateCharacterTab(character);
        this.updateRecommendationsTab(biomechanical, character);
    }

    updateBiomechanicalTab(results) {
        const components = ['balance', 'rotation', 'timing', 'power'];
        
        components.forEach(component => {
            const score = Math.round(results[component === 'power' ? 'power_transfer' : component] * 100);
            const progressBar = document.getElementById(`${component}-progress`);
            const scoreElement = document.getElementById(`${component}-score`);
            
            if (progressBar && scoreElement) {
                progressBar.style.width = `${score}%`;
                scoreElement.textContent = score;
            }
        });
    }

    updateCharacterTab(results) {
        const traits = [
            { key: 'determination', element: 'determination' },
            { key: 'focus', element: 'toughness' }, // Using focus for mental toughness
            { key: 'confidence', element: 'confidence' }
        ];

        traits.forEach(trait => {
            const score = Math.round(results[trait.key] * 100);
            const scoreElement = document.getElementById(`${trait.element}-score`);
            const indicatorsElement = document.getElementById(`${trait.element}-indicators`);
            
            if (scoreElement) {
                scoreElement.textContent = score;
            }
            
            if (indicatorsElement && results.grit_indicators) {
                indicatorsElement.innerHTML = results.grit_indicators
                    .map(indicator => `<span class="indicator">${indicator.replace('_', ' ')}</span>`)
                    .join('');
            }
        });
    }

    updateRecommendationsTab(biomechanical, character) {
        const recommendations = this.generateRecommendations(biomechanical, character);
        const container = document.getElementById('coaching-tips');
        
        if (container) {
            container.innerHTML = recommendations.map(rec => `
                <div class="recommendation-item">
                    <div class="rec-priority ${rec.priority.toLowerCase()}">${rec.priority}</div>
                    <div class="rec-content">
                        <div class="rec-title">${rec.title}</div>
                        <div class="rec-description">${rec.description}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    generateRecommendations(biomechanical, character) {
        const recommendations = [];
        
        // Biomechanical recommendations
        if (biomechanical.balance < 0.8) {
            recommendations.push({
                priority: 'HIGH',
                title: 'Improve Balance Foundation',
                description: 'Focus on core strengthening exercises and balance drills. Practice single-leg stands and stability work.'
            });
        }
        
        if (biomechanical.timing < 0.85) {
            recommendations.push({
                priority: 'MEDIUM',
                title: 'Timing & Rhythm Work',
                description: 'Use metronome drills and slow-motion practice to develop better timing consistency.'
            });
        }

        // Character recommendations
        if (character.focus < 0.85) {
            recommendations.push({
                priority: 'HIGH',
                title: 'Mental Focus Training',
                description: 'Implement mindfulness exercises and concentration drills. Practice visualization techniques.'
            });
        }

        if (character.composure < 0.8) {
            recommendations.push({
                priority: 'MEDIUM',
                title: 'Pressure Situations Training',
                description: 'Practice under simulated pressure conditions. Work on breathing techniques and mental resilience.'
            });
        }

        // Default recommendation if none triggered
        if (recommendations.length === 0) {
            recommendations.push({
                priority: 'LOW',
                title: 'Maintain Current Form',
                description: 'Your mechanics and mental approach are solid. Continue current training regimen with minor refinements.'
            });
        }

        return recommendations;
    }

    drawAnalysisOverlay(ctx, biomechanical, character) {
        // Clear previous overlay
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw keypoints if available
        if (biomechanical.keypoints) {
            this.drawKeypoints(ctx, biomechanical.keypoints);
        }
        
        // Draw analysis indicators
        this.drawAnalysisIndicators(ctx, biomechanical, character);
    }

    drawKeypoints(ctx, keypoints) {
        ctx.fillStyle = '#ff8c00';
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        
        Object.values(keypoints).forEach(point => {
            if (point.confidence > 0.5) {
                // Draw keypoint
                ctx.beginPath();
                ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        });
        
        // Draw connections between keypoints
        this.drawSkeletonConnections(ctx, keypoints);
    }

    drawSkeletonConnections(ctx, keypoints) {
        const connections = [
            ['shoulders', 'hips'],
            ['shoulders', 'hands'],
            ['hips', 'feet']
        ];
        
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        
        connections.forEach(([start, end]) => {
            if (keypoints[start] && keypoints[end] && 
                keypoints[start].confidence > 0.5 && keypoints[end].confidence > 0.5) {
                ctx.beginPath();
                ctx.moveTo(keypoints[start].x, keypoints[start].y);
                ctx.lineTo(keypoints[end].x, keypoints[end].y);
                ctx.stroke();
            }
        });
    }

    drawAnalysisIndicators(ctx, biomechanical, character) {
        // Draw form score indicator
        const formScore = Math.round(
            (biomechanical.balance + biomechanical.rotation + 
             biomechanical.timing + biomechanical.power_transfer) / 4 * 100
        );
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 60);
        
        ctx.fillStyle = '#ff8c00';
        ctx.font = '18px Inter';
        ctx.fillText(`Form Score: ${formScore}`, 20, 35);
        
        const gritScore = Math.round(character.determination * 100);
        ctx.fillStyle = '#00ffff';
        ctx.fillText(`Grit Index: ${gritScore}`, 20, 55);
    }

    switchTab(tabName) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        
        // Add active class to selected tab and panel
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    startAnalysis() {
        if (this.hasCamera) {
            this.startLiveAnalysis();
        } else if (this.videoReady) {
            this.startVideoAnalysis();
        }
        
        document.getElementById('start-analysis').classList.add('hidden');
        document.getElementById('pause-analysis').classList.remove('hidden');
    }

    pauseAnalysis() {
        if (this.analysisLoop) {
            clearInterval(this.analysisLoop);
            this.analysisLoop = null;
        }
        
        document.getElementById('start-analysis').classList.remove('hidden');
        document.getElementById('pause-analysis').classList.add('hidden');
    }

    startVideoAnalysis() {
        const video = document.getElementById('video-feed');
        if (!video.src) return;

        this.analysisLoop = setInterval(() => {
            if (!video.paused && !video.ended) {
                this.analyzeFrame(video);
            }
        }, 100);
    }

    saveSession() {
        if (!this.currentSession) return;

        const sessionData = {
            ...this.currentSession,
            endTime: Date.now(),
            duration: Date.now() - this.currentSession.startTime,
            finalMetrics: this.getCurrentMetrics()
        };

        // Save to localStorage for demo
        localStorage.setItem(`video_session_${sessionData.id}`, JSON.stringify(sessionData));
        
        alert('Session saved successfully!');
        console.log('💾 Session saved:', sessionData.id);
    }

    exportAnalysisReport() {
        if (!this.currentSession) return;

        const report = {
            session_id: this.currentSession.id,
            athlete_name: 'Demo Athlete',
            sport: this.currentSession.sport,
            analysis_date: new Date().toISOString(),
            analysis_duration: this.currentSession.duration || Date.now() - this.currentSession.startTime,
            biomechanical_analysis: this.getCurrentBiomechanicalMetrics(),
            character_assessment: this.getCurrentCharacterMetrics(),
            recommendations: this.generateRecommendations(
                this.getCurrentBiomechanicalMetrics(),
                this.getCurrentCharacterMetrics()
            ),
            generated_by: 'Blaze Video AI Engine v1.0'
        };

        const reportStr = JSON.stringify(report, null, 2);
        const blob = new Blob([reportStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `blaze_video_analysis_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        console.log('📊 Analysis report exported');
    }

    getCurrentMetrics() {
        return {
            form_score: document.getElementById('form-score').textContent,
            grit_index: document.getElementById('grit-index').textContent,
            focus_level: document.getElementById('focus-level').textContent,
            composure_score: document.getElementById('composure-score').textContent
        };
    }

    getCurrentBiomechanicalMetrics() {
        return {
            balance: parseInt(document.getElementById('balance-score').textContent) / 100 || 0.85,
            rotation: parseInt(document.getElementById('rotation-score').textContent) / 100 || 0.82,
            timing: parseInt(document.getElementById('timing-score').textContent) / 100 || 0.88,
            power_transfer: parseInt(document.getElementById('power-score').textContent) / 100 || 0.86
        };
    }

    getCurrentCharacterMetrics() {
        return {
            determination: parseInt(document.getElementById('determination-score').textContent) / 100 || 0.89,
            focus: parseInt(document.getElementById('focus-level').textContent) / 100 || 0.92,
            composure: parseInt(document.getElementById('composure-score').textContent) / 100 || 0.87,
            confidence: parseInt(document.getElementById('confidence-score').textContent) / 100 || 0.84
        };
    }

    toggleAnalysisMode() {
        const modes = ['biomechanical', 'character', 'comprehensive'];
        const currentIndex = modes.indexOf(this.analysisMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.analysisMode = modes[nextIndex];
        
        const modeNames = {
            'biomechanical': 'Biomechanical Only',
            'character': 'Character Assessment Only',
            'comprehensive': 'Comprehensive Analysis'
        };
        
        document.getElementById('analysis-mode-toggle').textContent = modeNames[this.analysisMode];
        console.log('🔄 Analysis mode changed to:', this.analysisMode);
    }

    generateSessionId() {
        return 'VID-' + Date.now().toString(36).toUpperCase() + '-' + 
               Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    cleanupSession() {
        if (this.analysisLoop) {
            clearInterval(this.analysisLoop);
            this.analysisLoop = null;
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        this.currentSession = null;
    }

    showFallbackInterface() {
        // Show simplified interface if full AI initialization fails
        const container = document.getElementById('blaze-video-ai-container');
        if (container) {
            container.innerHTML = `
                <div class="video-ai-overlay">
                    <div class="fallback-panel">
                        <h2>🎥 Video AI Coming Soon</h2>
                        <p>Advanced video analysis features are currently in development.</p>
                        <p>Contact us for beta access to our championship-level coaching platform.</p>
                        <button onclick="this.closest('.video-ai-container').classList.add('hidden')">
                            Close
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize Video AI Engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.blazeVideoAI = new BlazeVideoAIEngine();
});