// Digital Combine™ Enhanced JavaScript
// Championship-Level Athletic Analysis Platform
// Austin Humphrey - Deep South Sports Authority

class DigitalCombineEnhanced {
    constructor() {
        this.selectedSport = 'baseball';
        this.selectedFile = null;
        this.currentSessionId = null;
        this.progressUpdateInterval = null;
        this.websocket = null;
        
        // Austin Humphrey's expertise profiles
        this.expertiseProfiles = {
            baseball: {
                expert: 'Austin Humphrey',
                credentials: 'Perfect Game Elite Athlete & Deep South Sports Authority',
                background: 'Elite-level baseball analysis with Perfect Game scouting integration',
                keyMetrics: ['Bat Speed', 'Exit Velocity', 'Launch Angle', 'Swing Mechanics'],
                specialties: ['Power Development', 'Swing Optimization', 'College Recruitment']
            },
            football: {
                expert: 'Austin Humphrey',
                credentials: 'Texas Running Back #20 & SEC Analytics Authority',
                background: 'Championship-level football performance analysis',
                keyMetrics: ['40-Yard Dash', 'Vertical Jump', 'Agility Score', 'Explosion Index'],
                specialties: ['Speed Development', 'Cutting Mechanics', 'SEC Recruitment']
            },
            basketball: {
                expert: 'Austin Humphrey',
                credentials: 'Multi-Sport Athlete & Deep South Sports Authority',
                background: 'Professional basketball movement analysis',
                keyMetrics: ['Vertical Jump', 'Lateral Quickness', 'Shooting Form', 'Court Vision'],
                specialties: ['Athletic Development', 'Movement Efficiency', 'Performance Optimization']
            },
            track: {
                expert: 'Austin Humphrey',
                credentials: 'Track & Field Specialist & Deep South Sports Authority',
                background: 'Elite track and field performance analysis',
                keyMetrics: ['Sprint Speed', 'Acceleration', 'Form Analysis', 'Efficiency Score'],
                specialties: ['Sprint Mechanics', 'Speed Development', 'Technical Optimization']
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupSportSelection();
        this.setupWebSocket();
        
        console.log('🏆 Digital Combine™ Enhanced System Initialized');
        console.log('🎯 Austin Humphrey - Deep South Sports Authority');
    }
    
    setupEventListeners() {
        // File input change
        const fileInput = document.getElementById('videoFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        // Upload button
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.startAnalysis());
        }
        
        // Form validation
        const playerNameInput = document.getElementById('playerName');
        if (playerNameInput) {
            playerNameInput.addEventListener('input', () => this.validateForm());
        }
    }
    
    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect({ target: { files } });
            }
        });
        
        uploadArea.addEventListener('click', () => {
            document.getElementById('videoFile').click();
        });
    }
    
    setupSportSelection() {
        const sportOptions = document.querySelectorAll('.sport-option');
        sportOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                sportOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked option
                option.classList.add('selected');
                
                // Update selected sport
                this.selectedSport = option.dataset.sport;
                
                // Update expertise display
                this.updateExpertiseDisplay();
                
                // Validate form
                this.validateForm();
                
                console.log(`🏆 Sport selected: ${this.selectedSport}`);
                console.log(`🎯 Expert: ${this.expertiseProfiles[this.selectedSport].expert}`);
            });
        });
        
        // Select default sport (baseball)
        const defaultSport = document.querySelector('[data-sport="baseball"]');
        if (defaultSport) {
            defaultSport.click();
        }
    }
    
    setupWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}`;
            
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = () => {
                console.log('🔗 WebSocket connected for real-time updates');
            };
            
            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            };
            
            this.websocket.onclose = () => {
                console.log('🔗 WebSocket disconnected');
                // Attempt to reconnect after 5 seconds
                setTimeout(() => this.setupWebSocket(), 5000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('WebSocket setup error:', error);
        }
    }
    
    handleWebSocketMessage(data) {
        if (data.type === 'analysis_progress' && data.sessionId === this.currentSessionId) {
            this.updateProgress(data.progress, data.stage);
        } else if (data.type === 'analysis_complete' && data.sessionId === this.currentSessionId) {
            this.displayResults(data.results);
        }
    }
    
    updateExpertiseDisplay() {
        const expertise = this.expertiseProfiles[this.selectedSport];
        // Update any expertise display elements here if needed
        console.log(`🎯 Updated expertise display for ${this.selectedSport}`);
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/x-msvideo', 'video/quicktime', 'video/x-ms-wmv'];
        if (!allowedTypes.includes(file.type)) {
            this.showError('Please select a valid video file (MP4, MOV, AVI, WMV)');
            return;
        }
        
        // Validate file size (2GB limit)
        const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
        if (file.size > maxSize) {
            this.showError('File size must be less than 2GB for professional analysis');
            return;
        }
        
        this.selectedFile = file;
        this.updateFileDisplay(file);
        this.validateForm();
        
        console.log(`📹 File selected: ${file.name} (${this.formatFileSize(file.size)})`);
    }
    
    updateFileDisplay(file) {
        const uploadArea = document.getElementById('uploadArea');
        const uploadText = uploadArea.querySelector('.upload-text');
        const uploadSubtext = uploadArea.querySelector('.upload-subtext');
        const uploadIcon = uploadArea.querySelector('.upload-icon i');
        
        if (uploadText) {
            uploadText.textContent = file.name;
        }
        
        if (uploadSubtext) {
            uploadSubtext.textContent = `${this.formatFileSize(file.size)} • Ready for championship analysis`;
        }
        
        if (uploadIcon) {
            uploadIcon.className = 'fas fa-check-circle';
        }
        
        uploadArea.style.borderColor = 'var(--success-green)';
        uploadArea.style.background = 'linear-gradient(45deg, rgba(40, 167, 69, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)';
    }
    
    validateForm() {
        const playerName = document.getElementById('playerName').value.trim();
        const uploadBtn = document.getElementById('uploadBtn');
        
        const isValid = this.selectedFile && playerName && this.selectedSport;
        
        if (uploadBtn) {
            uploadBtn.disabled = !isValid;
            
            if (isValid) {
                uploadBtn.style.background = 'linear-gradient(45deg, var(--success-green), #20C997)';
                uploadBtn.style.transform = 'translateY(-2px)';
            } else {
                uploadBtn.style.background = 'rgba(108, 117, 125, 0.5)';
                uploadBtn.style.transform = 'none';
            }
        }
        
        return isValid;
    }
    
    async startAnalysis() {
        if (!this.validateForm()) {
            this.showError('Please complete all required fields before starting analysis');
            return;
        }
        
        this.showLoading(true);
        this.showProgress(true);
        
        try {
            const formData = new FormData();
            formData.append('video', this.selectedFile);
            formData.append('playerName', document.getElementById('playerName').value.trim());
            formData.append('position', document.getElementById('position').value.trim() || 'Unknown');
            formData.append('sport', this.selectedSport);
            
            console.log('🚀 Starting Digital Combine™ analysis...');
            console.log(`🏃 Athlete: ${formData.get('playerName')}`);
            console.log(`🏆 Sport: ${this.selectedSport}`);
            console.log(`🎯 Expert: ${this.expertiseProfiles[this.selectedSport].expert}`);
            
            const response = await fetch('/api/digital-combine/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            this.currentSessionId = result.sessionId;
            
            this.showSuccess('Video uploaded successfully! Championship analysis in progress...');
            this.showLoading(false);
            
            // Start polling for progress updates
            this.startProgressPolling();
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showError(`Upload failed: ${error.message}`);
            this.showLoading(false);
            this.showProgress(false);
        }
    }
    
    startProgressPolling() {
        if (this.progressUpdateInterval) {
            clearInterval(this.progressUpdateInterval);
        }
        
        this.progressUpdateInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/digital-combine/status/${this.currentSessionId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch progress');
                }
                
                const status = await response.json();
                
                this.updateProgress(status.progress, status.status);
                this.updateProcessingStages(status.processingStages || []);
                
                if (status.status === 'completed') {
                    clearInterval(this.progressUpdateInterval);
                    await this.fetchResults();
                } else if (status.status === 'failed') {
                    clearInterval(this.progressUpdateInterval);
                    this.showError('Analysis failed. Please try again or contact support.');
                    this.showProgress(false);
                }
                
            } catch (error) {
                console.error('Progress polling error:', error);
            }
        }, 2000); // Poll every 2 seconds
    }
    
    updateProgress(progress, stage) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }
        
        console.log(`📊 Analysis Progress: ${progress}% - ${stage}`);
    }
    
    updateProcessingStages(stages) {
        const stageElements = document.querySelectorAll('.stage-item');
        
        // Define stage mapping
        const stageMapping = {
            'metadata_extraction': 'metadata',
            'frame_extraction': 'frames',
            'pose_detection': 'pose',
            'biomechanical_analysis': 'biomechanics',
            'character_assessment': 'character',
            'injury_risk_analysis': 'ai'
        };
        
        // Update stage status
        stages.forEach(stage => {
            const mappedStage = stageMapping[stage.stage];
            if (mappedStage) {
                const stageElement = document.querySelector(`[data-stage="${mappedStage}"]`);
                if (stageElement) {
                    stageElement.classList.remove('active');
                    stageElement.classList.add('completed');
                }
            }
        });
    }
    
    async fetchResults() {
        try {
            const response = await fetch(`/api/digital-combine/results/${this.currentSessionId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }
            
            const results = await response.json();
            this.displayResults(results);
            
        } catch (error) {
            console.error('Results fetch error:', error);
            this.showError('Failed to fetch analysis results. Please try again.');
        }
    }
    
    displayResults(results) {
        console.log('🏆 Championship analysis complete!');
        console.log('📊 Displaying comprehensive results...');
        
        this.showProgress(false);
        this.showResults(true);
        
        // Display expert analysis
        this.displayExpertAnalysis(results.expertAnalysis);
        
        // Display performance metrics
        this.displayPerformanceMetrics(results.performanceMetrics);
        
        // Display character assessment
        this.displayCharacterAssessment(results.characterAssessment);
        
        // Display recommendations
        this.displayRecommendations(results.recommendations);
        
        // Display injury risk assessment
        if (results.injuryRisk) {
            this.displayInjuryRisk(results.injuryRisk);
        }
        
        // Display Perfect Game analysis (if baseball)
        if (results.perfectGameAnalysis && this.selectedSport === 'baseball') {
            this.displayPerfectGameAnalysis(results.perfectGameAnalysis);
        }
    }
    
    displayExpertAnalysis(expertAnalysis) {
        const expertContent = document.getElementById('expertAnalysisContent');
        if (!expertContent || !expertAnalysis) return;
        
        expertContent.innerHTML = `
            <div class="expert-summary">
                <h4>Overall Rating: <span class="rating-score">${expertAnalysis.overallRating}/100</span></h4>
                <p class="expert-recommendation">${expertAnalysis.recommendation || 'Outstanding athletic potential with professional development opportunities.'}</p>
            </div>
            
            <div class="analysis-sections">
                <div class="analysis-section">
                    <h5><i class="fas fa-star"></i> Key Strengths</h5>
                    <ul>
                        ${expertAnalysis.keyStrengths?.map(strength => `<li>${strength}</li>`).join('') || '<li>Exceptional athletic ability</li>'}
                    </ul>
                </div>
                
                <div class="analysis-section">
                    <h5><i class="fas fa-chart-line"></i> Improvement Areas</h5>
                    <ul>
                        ${expertAnalysis.improvementAreas?.map(area => `<li>${area}</li>`).join('') || '<li>Continue current development trajectory</li>'}
                    </ul>
                </div>
                
                <div class="analysis-section">
                    <h5><i class="fas fa-clipboard-list"></i> Coaching Recommendations</h5>
                    <ul>
                        ${expertAnalysis.coachingRecommendations?.map(rec => `<li>${rec}</li>`).join('') || '<li>Maintain current training intensity</li>'}
                    </ul>
                </div>
            </div>
        `;
    }
    
    displayPerformanceMetrics(metrics) {
        if (!metrics) return;
        
        const resultsGrid = document.getElementById('resultsGrid');
        if (!resultsGrid) return;
        
        const metricsCard = document.createElement('div');
        metricsCard.className = 'result-card';
        
        const metricsHtml = Object.entries(metrics).map(([key, metric]) => {
            const gradeClass = `grade-${metric.grade?.toLowerCase() || 'good'}`;
            return `
                <div class="metric-item">
                    <span class="metric-name">${this.formatMetricName(key)}</span>
                    <div class="metric-values">
                        <span class="metric-value">${metric.value}</span>
                        <span class="metric-grade ${gradeClass}">${metric.grade || 'Good'}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        metricsCard.innerHTML = `
            <div class="card-title">
                <i class="fas fa-chart-bar"></i>
                Performance Metrics
            </div>
            ${metricsHtml}
        `;
        
        resultsGrid.appendChild(metricsCard);
    }
    
    displayCharacterAssessment(assessment) {
        if (!assessment) return;
        
        const resultsGrid = document.getElementById('resultsGrid');
        if (!resultsGrid) return;
        
        const characterCard = document.createElement('div');
        characterCard.className = 'result-card';
        
        const assessmentHtml = Object.entries(assessment).map(([key, value]) => {
            return `
                <div class="metric-item">
                    <span class="metric-name">${this.formatMetricName(key)}</span>
                    <span class="metric-value">${value}/100</span>
                </div>
            `;
        }).join('');
        
        characterCard.innerHTML = `
            <div class="card-title">
                <i class="fas fa-brain"></i>
                Character Assessment
            </div>
            ${assessmentHtml}
        `;
        
        resultsGrid.appendChild(characterCard);
    }
    
    displayRecommendations(recommendations) {
        if (!recommendations) return;
        
        const resultsGrid = document.getElementById('resultsGrid');
        if (!resultsGrid) return;
        
        const recommendationsCard = document.createElement('div');
        recommendationsCard.className = 'result-card';
        
        recommendationsCard.innerHTML = `
            <div class="card-title">
                <i class="fas fa-lightbulb"></i>
                Next Steps & Recommendations
            </div>
            
            <div class="recommendation-section">
                <h5>Immediate Actions</h5>
                <ul>
                    ${recommendations.immediateActions?.map(action => `<li>${action}</li>`).join('') || '<li>Continue current training regimen</li>'}
                </ul>
            </div>
            
            <div class="recommendation-section">
                <h5>Long-term Development</h5>
                <ul>
                    ${recommendations.longTermDevelopment?.map(item => `<li>${item}</li>`).join('') || '<li>Focus on consistent improvement</li>'}
                </ul>
            </div>
            
            <div class="recommendation-section">
                <h5>Recruitment Strategy</h5>
                <p>${recommendations.collegeRecruitment || 'Continue developing skills for college opportunities'}</p>
            </div>
        `;
        
        resultsGrid.appendChild(recommendationsCard);
    }
    
    displayInjuryRisk(injuryRisk) {
        const resultsGrid = document.getElementById('resultsGrid');
        if (!resultsGrid) return;
        
        const riskCard = document.createElement('div');
        riskCard.className = 'result-card';
        
        riskCard.innerHTML = `
            <div class="card-title">
                <i class="fas fa-shield-alt"></i>
                Injury Risk Assessment
            </div>
            
            <div class="risk-overview">
                <div class="risk-level risk-${injuryRisk.overallRisk}">
                    Overall Risk: ${injuryRisk.overallRisk?.toUpperCase() || 'LOW'}
                </div>
            </div>
            
            <div class="risk-factors">
                <h5>Risk Factors</h5>
                <ul>
                    ${injuryRisk.riskFactors?.map(factor => `<li>${factor}</li>`).join('') || '<li>No significant risk factors identified</li>'}
                </ul>
            </div>
            
            <div class="prevention">
                <h5>Prevention Recommendations</h5>
                <ul>
                    ${injuryRisk.preventionRecommendations?.map(rec => `<li>${rec}</li>`).join('') || '<li>Continue current injury prevention protocols</li>'}
                </ul>
            </div>
        `;
        
        resultsGrid.appendChild(riskCard);
    }
    
    displayPerfectGameAnalysis(pgAnalysis) {
        const resultsGrid = document.getElementById('resultsGrid');
        if (!resultsGrid) return;
        
        const pgCard = document.createElement('div');
        pgCard.className = 'result-card perfect-game-card';
        
        pgCard.innerHTML = `
            <div class="card-title">
                <i class="fas fa-baseball-ball"></i>
                Perfect Game Analysis
            </div>
            
            <div class="pg-grade">
                <h5>Scouting Grade: <span class="grade-value">${pgAnalysis.scoutingGrade}/10</span></h5>
            </div>
            
            <div class="comparable-profiles">
                <h5>Comparable Profiles</h5>
                <ul>
                    ${pgAnalysis.comparableProfiles?.map(profile => `<li>${profile}</li>`).join('') || '<li>College-level prospect</li>'}
                </ul>
            </div>
            
            <div class="recruitment-projection">
                <h5>Recruitment Projection</h5>
                <p>${pgAnalysis.recruitmentProjection || 'College recruitment potential'}</p>
            </div>
        `;
        
        resultsGrid.appendChild(pgCard);
    }
    
    // Demo functions
    async runDemo(sport) {
        console.log(`🎬 Running ${sport} demo analysis...`);
        
        this.showLoading(true);
        
        try {
            const response = await fetch('/api/digital-combine/demo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sport: sport,
                    playerName: 'Demo Athlete'
                })
            });
            
            if (!response.ok) {
                throw new Error('Demo analysis failed');
            }
            
            const demoResults = await response.json();
            
            // Simulate analysis progress
            this.showProgress(true);
            await this.simulateAnalysisProgress();
            
            // Display demo results
            this.selectedSport = sport;
            this.displayResults(demoResults);
            
        } catch (error) {
            console.error('Demo error:', error);
            this.showError('Demo analysis failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }
    
    async simulateAnalysisProgress() {
        const stages = [
            { progress: 15, stage: 'metadata' },
            { progress: 30, stage: 'frames' },
            { progress: 60, stage: 'pose' },
            { progress: 80, stage: 'biomechanics' },
            { progress: 90, stage: 'character' },
            { progress: 100, stage: 'complete' }
        ];
        
        for (const stage of stages) {
            await new Promise(resolve => setTimeout(resolve, 800));
            this.updateProgress(stage.progress, stage.stage);
            
            if (stage.stage !== 'complete') {
                const stageElement = document.querySelector(`[data-stage="${stage.stage}"]`);
                if (stageElement) {
                    stageElement.classList.add('active');
                    setTimeout(() => {
                        stageElement.classList.remove('active');
                        stageElement.classList.add('completed');
                    }, 500);
                }
            }
        }
    }
    
    // Utility functions
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    formatMetricName(name) {
        return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }
    
    showProgress(show) {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.style.display = show ? 'block' : 'none';
        }
    }
    
    showResults(show) {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = show ? 'block' : 'none';
            
            if (show) {
                // Clear previous results
                const resultsGrid = document.getElementById('resultsGrid');
                if (resultsGrid) {
                    resultsGrid.innerHTML = '';
                }
            }
        }
    }
    
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
        
        console.error('🚨 Error:', message);
    }
    
    showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 5000);
        }
        
        console.log('✅ Success:', message);
    }
}

// Global functions for demo buttons
window.runDemo = function(sport) {
    if (window.digitalCombine) {
        window.digitalCombine.runDemo(sport);
    }
};

// Initialize Digital Combine™ when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.digitalCombine = new DigitalCombineEnhanced();
    console.log('🏆 Digital Combine™ Enhanced System Ready');
    console.log('🎯 Championship-Level Analysis by Austin Humphrey');
});

// Additional CSS for results display
const additionalStyles = `
    .expert-summary {
        background: rgba(255, 215, 0, 0.1);
        border-radius: 10px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        border: 1px solid var(--primary-gold);
    }
    
    .rating-score {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--primary-gold);
    }
    
    .expert-recommendation {
        font-style: italic;
        font-size: 1.1rem;
        margin-top: 1rem;
        opacity: 0.95;
    }
    
    .analysis-sections {
        display: grid;
        gap: 1.5rem;
    }
    
    .analysis-section h5 {
        color: var(--primary-gold);
        font-size: 1.1rem;
        margin-bottom: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .analysis-section ul {
        list-style: none;
        padding: 0;
    }
    
    .analysis-section li {
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
        padding-left: 1.5rem;
    }
    
    .analysis-section li:before {
        content: '▶';
        position: absolute;
        left: 0;
        color: var(--primary-gold);
        font-size: 0.8rem;
    }
    
    .metric-values {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .recommendation-section {
        margin-bottom: 1.5rem;
    }
    
    .recommendation-section h5 {
        color: var(--primary-gold);
        margin-bottom: 0.8rem;
    }
    
    .risk-level {
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
        font-weight: 700;
        font-size: 1.2rem;
        margin-bottom: 1rem;
    }
    
    .risk-low {
        background: rgba(40, 167, 69, 0.2);
        border: 1px solid var(--success-green);
        color: var(--success-green);
    }
    
    .risk-moderate {
        background: rgba(253, 126, 20, 0.2);
        border: 1px solid var(--warning-orange);
        color: var(--warning-orange);
    }
    
    .risk-high {
        background: rgba(220, 53, 69, 0.2);
        border: 1px solid var(--accent-red);
        color: var(--accent-red);
    }
    
    .perfect-game-card {
        border: 2px solid var(--primary-gold);
        background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
    }
    
    .pg-grade .grade-value {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--primary-gold);
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);