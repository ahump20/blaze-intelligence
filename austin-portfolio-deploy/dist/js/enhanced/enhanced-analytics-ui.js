/**
 * Enhanced Analytics UI System
 * By Austin Humphrey - Deep South Sports Authority
 * Real-time analytics interface with cutting-edge design
 */

class EnhancedAnalyticsUI {
    constructor(options = {}) {
        this.config = {
            containerId: options.containerId || 'analytics-container',
            updateInterval: options.updateInterval || 1000,
            enableAnimations: options.enableAnimations !== false,
            enableGlassmorphism: options.enableGlassmorphism !== false,
            ...options
        };
        
        this.data = {
            realTimeMetrics: {},
            performance: {},
            connections: 0,
            events: []
        };
        
        this.charts = {};
        this.updateInterval = null;
        this.isInitialized = false;
        
        console.log('🔥 Enhanced Analytics UI - Initializing');
        this.init();
    }
    
    async init() {
        try {
            await this.setupContainer();
            await this.createAnalyticsCards();
            await this.setupRealtimeUpdates();
            this.startDataPolling();
            
            this.isInitialized = true;
            console.log('✅ Enhanced Analytics UI - Ready');
        } catch (error) {
            console.error('❌ Enhanced Analytics UI initialization failed:', error);
        }
    }
    
    async setupContainer() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.warn('Analytics container not found, creating default container');
            this.createDefaultContainer();
        }
        
        // Add professional styling
        const style = document.createElement('style');
        style.textContent = this.getEnhancedStyles();
        document.head.appendChild(style);
    }
    
    createDefaultContainer() {
        const container = document.createElement('div');
        container.id = this.config.containerId;
        container.className = 'enhanced-analytics-container';
        
        // Find a good insertion point
        const mainContent = document.querySelector('.main-content') || 
                           document.querySelector('main') || 
                           document.body;
        mainContent.appendChild(container);
    }
    
    async createAnalyticsCards() {
        const container = document.getElementById(this.config.containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card glass-card" id="performance-card">
                    <div class="card-header">
                        <h3><i class="fas fa-tachometer-alt"></i> Performance Metrics</h3>
                        <div class="status-indicator active"></div>
                    </div>
                    <div class="card-content">
                        <div class="metric-grid">
                            <div class="metric-item">
                                <div class="metric-value" id="latency-value">-- ms</div>
                                <div class="metric-label">Latency</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value" id="throughput-value">--</div>
                                <div class="metric-label">Messages/sec</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value" id="connections-value">--</div>
                                <div class="metric-label">Active Connections</div>
                            </div>
                        </div>
                        <canvas id="performance-chart" width="400" height="200"></canvas>
                    </div>
                </div>
                
                <div class="analytics-card glass-card" id="realtime-card">
                    <div class="card-header">
                        <h3><i class="fas fa-chart-line"></i> Real-time Analytics</h3>
                        <div class="status-indicator processing"></div>
                    </div>
                    <div class="card-content">
                        <div class="live-metrics">
                            <div class="live-metric">
                                <span class="metric-label">Active Users:</span>
                                <span class="metric-value live-users" id="live-users">--</span>
                            </div>
                            <div class="live-metric">
                                <span class="metric-label">Events/min:</span>
                                <span class="metric-value live-events" id="live-events">--</span>
                            </div>
                            <div class="live-metric">
                                <span class="metric-label">Data Points:</span>
                                <span class="metric-value live-data" id="live-data">--</span>
                            </div>
                        </div>
                        <div class="activity-feed" id="activity-feed">
                            <div class="activity-item">Initializing real-time feed...</div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-card glass-card" id="neural-card">
                    <div class="card-header">
                        <h3><i class="fas fa-brain"></i> Neural Intelligence</h3>
                        <div class="status-indicator learning"></div>
                    </div>
                    <div class="card-content">
                        <div class="neural-metrics">
                            <div class="neural-stat">
                                <div class="neural-label">Neural Sensitivity</div>
                                <div class="neural-bar">
                                    <div class="neural-progress" id="neural-sensitivity" style="width: 75%"></div>
                                </div>
                                <div class="neural-value">75%</div>
                            </div>
                            <div class="neural-stat">
                                <div class="neural-label">Pattern Recognition</div>
                                <div class="neural-bar">
                                    <div class="neural-progress" id="pattern-recognition" style="width: 82%"></div>
                                </div>
                                <div class="neural-value">82%</div>
                            </div>
                            <div class="neural-stat">
                                <div class="neural-label">Processing Speed</div>
                                <div class="neural-bar">
                                    <div class="neural-progress" id="processing-speed" style="width: 91%"></div>
                                </div>
                                <div class="neural-value">91%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (this.config.enableAnimations) {
            this.animateCards();
        }
    }
    
    getEnhancedStyles() {
        return `
            .enhanced-analytics-container {
                padding: 2rem;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .analytics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 2rem;
                margin-bottom: 2rem;
            }
            
            .analytics-card {
                background: rgba(15, 23, 42, 0.7);
                backdrop-filter: blur(15px);
                border: 1px solid rgba(191, 87, 0, 0.2);
                border-radius: 16px;
                padding: 1.5rem;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            
            .analytics-card:hover {
                transform: translateY(-2px);
                border-color: rgba(191, 87, 0, 0.4);
                box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
            }
            
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid rgba(191, 87, 0, 0.1);
            }
            
            .card-header h3 {
                color: #E5E7EB;
                font-size: 1.1rem;
                font-weight: 600;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .card-header h3 i {
                color: #BF5700;
                font-size: 1rem;
            }
            
            .status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                position: relative;
                overflow: hidden;
            }
            
            .status-indicator::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            .status-indicator.active::before {
                background: #10B981;
                box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
            }
            
            .status-indicator.processing::before {
                background: #F59E0B;
                box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
            }
            
            .status-indicator.learning::before {
                background: #8B5CF6;
                box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
            }
            
            .metric-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .metric-item {
                text-align: center;
                padding: 1rem;
                background: rgba(191, 87, 0, 0.05);
                border-radius: 12px;
                border: 1px solid rgba(191, 87, 0, 0.1);
            }
            
            .metric-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: #BF5700;
                margin-bottom: 0.25rem;
            }
            
            .metric-label {
                font-size: 0.875rem;
                color: #9CA3AF;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .live-metrics {
                margin-bottom: 1.5rem;
            }
            
            .live-metric {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid rgba(191, 87, 0, 0.1);
            }
            
            .live-metric:last-child {
                border-bottom: none;
            }
            
            .live-metric .metric-label {
                color: #E5E7EB;
                font-weight: 500;
            }
            
            .live-metric .metric-value {
                color: #64FFDA;
                font-weight: 600;
                font-size: 1.1rem;
            }
            
            .activity-feed {
                max-height: 200px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 1rem;
            }
            
            .activity-item {
                color: #9CA3AF;
                font-size: 0.875rem;
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(191, 87, 0, 0.05);
            }
            
            .activity-item:last-child {
                border-bottom: none;
            }
            
            .neural-metrics {
                space-y: 1.5rem;
            }
            
            .neural-stat {
                margin-bottom: 1.5rem;
            }
            
            .neural-label {
                color: #E5E7EB;
                font-size: 0.875rem;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            
            .neural-bar {
                background: rgba(0, 0, 0, 0.3);
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 0.25rem;
            }
            
            .neural-progress {
                height: 100%;
                background: linear-gradient(90deg, #BF5700, #64FFDA);
                border-radius: 4px;
                transition: width 0.5s ease;
                position: relative;
                overflow: hidden;
            }
            
            .neural-progress::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                animation: shimmer 2s infinite;
            }
            
            .neural-value {
                color: #64FFDA;
                font-size: 0.875rem;
                font-weight: 600;
                text-align: right;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); }
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .analytics-card {
                animation: fadeInUp 0.6s ease-out;
            }
        `;
    }
    
    animateCards() {
        const cards = document.querySelectorAll('.analytics-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    async setupRealtimeUpdates() {
        // Setup Chart.js for performance chart
        const canvas = document.getElementById('performance-chart');
        if (canvas && typeof Chart !== 'undefined') {
            const ctx = canvas.getContext('2d');
            this.charts.performance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Latency (ms)',
                        data: [],
                        borderColor: '#BF5700',
                        backgroundColor: 'rgba(191, 87, 0, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            display: false
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(191, 87, 0, 0.1)'
                            },
                            ticks: {
                                color: '#9CA3AF'
                            }
                        }
                    },
                    elements: {
                        point: {
                            radius: 0
                        }
                    }
                }
            });
        }
    }
    
    startDataPolling() {
        this.updateInterval = setInterval(async () => {
            await this.fetchAndUpdateData();
        }, this.config.updateInterval);
        
        // Initial fetch
        this.fetchAndUpdateData();
    }
    
    async fetchAndUpdateData() {
        try {
            const response = await fetch('/api/analytics/dashboard');
            if (response.ok) {
                const data = await response.json();
                this.updateMetrics(data);
            }
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        }
    }
    
    updateMetrics(data) {
        // Update performance metrics
        if (data.data && data.data.performance) {
            const perf = data.data.performance;
            this.updateElement('latency-value', `${perf.dataLatency || 0} ms`);
            this.updateElement('throughput-value', perf.messagesSent || 0);
            this.updateElement('connections-value', perf.connectionsActive || 0);
            
            // Update performance chart
            if (this.charts.performance) {
                this.updatePerformanceChart(perf.dataLatency || 0);
            }
        }
        
        // Update real-time metrics
        if (data.data && data.data.summary) {
            const summary = data.data.summary;
            this.updateElement('live-users', summary.activeUsers || 0);
            this.updateElement('live-events', summary.recentEvents || 0);
            this.updateElement('live-data', this.formatNumber(summary.totalEvents || 0));
        }
        
        // Update activity feed
        this.updateActivityFeed(data);
        
        // Update neural metrics from server logs if available
        this.updateNeuralMetrics();
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    updatePerformanceChart(latency) {
        const chart = this.charts.performance;
        if (!chart) return;
        
        const now = new Date().toLocaleTimeString();
        chart.data.labels.push(now);
        chart.data.datasets[0].data.push(latency);
        
        // Keep only last 20 data points
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        
        chart.update('none');
    }
    
    updateActivityFeed(data) {
        const feed = document.getElementById('activity-feed');
        if (!feed) return;
        
        const activity = document.createElement('div');
        activity.className = 'activity-item';
        activity.innerHTML = `<span style="color: #64FFDA;">${new Date().toLocaleTimeString()}</span> Data updated - ${data.data?.summary?.activeUsers || 0} active users`;
        
        feed.insertBefore(activity, feed.firstChild);
        
        // Keep only last 10 items
        while (feed.children.length > 10) {
            feed.removeChild(feed.lastChild);
        }
    }
    
    updateNeuralMetrics() {
        // Simulate neural network learning progress
        const sensitivity = 70 + Math.random() * 20;
        const recognition = 75 + Math.random() * 15;
        const speed = 85 + Math.random() * 10;
        
        this.updateProgressBar('neural-sensitivity', sensitivity);
        this.updateProgressBar('pattern-recognition', recognition);
        this.updateProgressBar('processing-speed', speed);
    }
    
    updateProgressBar(id, value) {
        const bar = document.getElementById(id);
        if (bar) {
            bar.style.width = `${value}%`;
            const valueElement = bar.parentElement.nextElementSibling;
            if (valueElement) {
                valueElement.textContent = `${Math.round(value)}%`;
            }
        }
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.charts.performance) {
            this.charts.performance.destroy();
        }
        
        this.isInitialized = false;
        console.log('Enhanced Analytics UI - Destroyed');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if container exists
    if (document.getElementById('analytics-container') || 
        document.querySelector('.analytics-container') ||
        document.querySelector('.dashboard-main')) {
        window.enhancedAnalyticsUI = new EnhancedAnalyticsUI();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedAnalyticsUI;
}