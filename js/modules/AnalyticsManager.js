/**
 * Analytics Management Module
 * Handles data collection, visualization, and insights
 */

export default class AnalyticsManager {
    constructor(core) {
        this.core = core;
        this.charts = new Map();
        this.dashboards = new Map();
        this.dataCollectors = new Map();
        this.realTimeData = {
            interactions: [],
            performance: [],
            errors: [],
            features: new Map()
        };
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            await this.initializeCharts();
            this.setupDataCollectors();
            this.setupEventListeners();
            this.startRealTimeTracking();
            this.isInitialized = true;
            
            console.log('✓ Analytics Manager initialized');
        } catch (error) {
            console.error('Failed to initialize Analytics Manager:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Listen for state changes
        this.core.on('state:changed', (event) => {
            this.handleStateChange(event.detail);
        });

        // Listen for analytics updates
        this.core.on('analytics:updated', (event) => {
            this.handleAnalyticsUpdate(event.detail);
        });

        // Listen for user interactions
        this.core.on('user:interaction', (event) => {
            this.recordInteraction(event.detail);
        });

        // Listen for performance metrics
        this.core.on('performance:metric', (event) => {
            this.recordPerformanceMetric(event.detail);
        });

        // Setup DOM event listeners
        this.setupDOMEventListeners();
    }

    setupDOMEventListeners() {
        // Track click events
        document.addEventListener('click', (event) => {
            this.trackClick(event);
        });

        // Track form submissions
        document.addEventListener('submit', (event) => {
            this.trackFormSubmission(event);
        });

        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollDepth = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                this.recordScrollDepth(scrollDepth);
            }
        });

        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            this.recordVisibilityChange();
        });
    }

    setupDataCollectors() {
        // Session data collector
        this.dataCollectors.set('session', {
            startTime: Date.now(),
            pageViews: 1,
            interactions: 0,
            totalTime: 0,
            bounceRate: 0
        });

        // User behavior collector
        this.dataCollectors.set('behavior', {
            clickHeatmap: new Map(),
            scrollDepth: 0,
            timeOnPage: 0,
            featureUsage: new Map()
        });

        // Performance collector
        this.dataCollectors.set('performance', {
            pageLoadTime: 0,
            apiResponseTimes: [],
            errorCount: 0,
            memoryUsage: 0
        });

        // AI interaction collector
        this.dataCollectors.set('ai', {
            totalRequests: 0,
            successRate: 0,
            averageResponseTime: 0,
            modelUsage: new Map(),
            errorTypes: new Map()
        });
    }

    async initializeCharts() {
        // Initialize Chart.js charts
        await this.initializeInteractionChart();
        await this.initializePerformanceChart();
        await this.initializeFeatureUsageChart();
        await this.initializeHeatmapChart();
    }

    async initializeInteractionChart() {
        const canvas = document.getElementById('analytics-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Interactions',
                    data: [],
                    borderColor: 'rgba(191, 87, 0, 1)',
                    backgroundColor: 'rgba(191, 87, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(191, 87, 0, 1)'
                }, {
                    label: 'AI Requests',
                    data: [],
                    borderColor: 'rgba(210, 105, 30, 1)',
                    backgroundColor: 'rgba(210, 105, 30, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: 'rgba(210, 105, 30, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Real-Time Activity',
                        color: '#e2e8f0',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        labels: { color: '#94a3b8' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(191, 87, 0, 0.5)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            displayFormats: {
                                minute: 'HH:mm'
                            }
                        },
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#94a3b8',
                            stepSize: 1
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set('interactions', chart);
    }

    async initializePerformanceChart() {
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Fast (<1s)', 'Medium (1-3s)', 'Slow (>3s)'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Response Times',
                        color: '#e2e8f0',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: { color: '#94a3b8', padding: 15 }
                    }
                }
            }
        });

        this.charts.set('performance', chart);
    }

    async initializeFeatureUsageChart() {
        const canvas = document.getElementById('feature-usage-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['AI Chat', 'Code Gen', 'Projects', 'Analytics', 'Other'],
                datasets: [{
                    label: 'Usage Count',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(191, 87, 0, 0.8)',
                        'rgba(210, 105, 30, 0.8)',
                        'rgba(160, 82, 45, 0.8)',
                        'rgba(92, 44, 7, 0.8)',
                        'rgba(139, 69, 19, 0.8)'
                    ],
                    borderColor: [
                        'rgba(191, 87, 0, 1)',
                        'rgba(210, 105, 30, 1)',
                        'rgba(160, 82, 45, 1)',
                        'rgba(92, 44, 7, 1)',
                        'rgba(139, 69, 19, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Feature Usage',
                        color: '#e2e8f0',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#94a3b8',
                            stepSize: 1
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });

        this.charts.set('featureUsage', chart);
    }

    async initializeHeatmapChart() {
        // Create a simple heatmap visualization
        const container = document.getElementById('heatmap-container');
        if (!container) return;

        const heatmapData = {
            clicks: new Map(),
            maxClicks: 0
        };

        this.charts.set('heatmap', heatmapData);
    }

    startRealTimeTracking() {
        // Update charts every 5 seconds
        setInterval(() => {
            this.updateAllCharts();
        }, 5000);

        // Update analytics display every 2 seconds
        setInterval(() => {
            this.updateAnalyticsDisplay();
        }, 2000);

        // Collect performance metrics every 10 seconds
        setInterval(() => {
            this.collectPerformanceMetrics();
        }, 10000);

        // Save analytics data every 30 seconds
        setInterval(() => {
            this.saveAnalyticsData();
        }, 30000);
    }

    // Event handlers
    handleStateChange(change) {
        if (change.path?.startsWith('analytics.')) {
            this.updateAnalyticsDisplay();
        }
    }

    handleAnalyticsUpdate(data) {
        const { metric, value } = data;
        
        // Record the interaction
        this.recordInteraction({
            type: metric,
            value: value,
            timestamp: Date.now()
        });

        // Update specific charts based on metric
        this.updateMetricCharts(metric, value);
    }

    recordInteraction(interaction) {
        const timestamp = Date.now();
        
        // Add to real-time data
        this.realTimeData.interactions.push({
            ...interaction,
            timestamp: timestamp
        });

        // Keep only last 100 interactions
        if (this.realTimeData.interactions.length > 100) {
            this.realTimeData.interactions = this.realTimeData.interactions.slice(-100);
        }

        // Update feature usage
        if (interaction.type) {
            const currentCount = this.realTimeData.features.get(interaction.type) || 0;
            this.realTimeData.features.set(interaction.type, currentCount + 1);
        }

        // Update behavior collector
        const behaviorData = this.dataCollectors.get('behavior');
        if (behaviorData) {
            behaviorData.interactions++;
        }
    }

    recordPerformanceMetric(metric) {
        this.realTimeData.performance.push({
            ...metric,
            timestamp: Date.now()
        });

        // Keep only last 50 performance metrics
        if (this.realTimeData.performance.length > 50) {
            this.realTimeData.performance = this.realTimeData.performance.slice(-50);
        }

        // Update performance collector
        const perfData = this.dataCollectors.get('performance');
        if (perfData && metric.responseTime) {
            perfData.apiResponseTimes.push(metric.responseTime);
        }
    }

    trackClick(event) {
        const target = event.target;
        const elementInfo = this.getElementInfo(target);
        
        this.recordInteraction({
            type: 'click',
            element: elementInfo.tagName,
            id: elementInfo.id,
            class: elementInfo.className,
            text: elementInfo.textContent?.substring(0, 50),
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now()
        });

        // Update click heatmap
        this.updateClickHeatmap(event.clientX, event.clientY);
    }

    trackFormSubmission(event) {
        const form = event.target;
        const formInfo = this.getElementInfo(form);
        
        this.recordInteraction({
            type: 'form_submit',
            form: formInfo.id || formInfo.className,
            timestamp: Date.now()
        });
    }

    recordScrollDepth(depth) {
        const behaviorData = this.dataCollectors.get('behavior');
        if (behaviorData) {
            behaviorData.scrollDepth = Math.max(behaviorData.scrollDepth, depth);
        }
    }

    recordVisibilityChange() {
        const isVisible = !document.hidden;
        this.recordInteraction({
            type: 'visibility_change',
            visible: isVisible,
            timestamp: Date.now()
        });
    }

    // Chart update methods
    updateAllCharts() {
        this.updateInteractionChart();
        this.updatePerformanceChart();
        this.updateFeatureUsageChart();
        this.updateHeatmapChart();
    }

    updateInteractionChart() {
        const chart = this.charts.get('interactions');
        if (!chart) return;

        const now = Date.now();
        const timeWindow = 30 * 60 * 1000; // 30 minutes
        const startTime = now - timeWindow;

        // Filter interactions within time window
        const recentInteractions = this.realTimeData.interactions.filter(
            interaction => interaction.timestamp >= startTime
        );

        // Group by minute
        const minuteGroups = new Map();
        recentInteractions.forEach(interaction => {
            const minute = Math.floor(interaction.timestamp / 60000) * 60000;
            if (!minuteGroups.has(minute)) {
                minuteGroups.set(minute, { total: 0, ai: 0 });
            }
            minuteGroups.get(minute).total++;
            if (interaction.type?.includes('ai') || interaction.type?.includes('AI')) {
                minuteGroups.get(minute).ai++;
            }
        });

        // Update chart data
        const labels = [];
        const totalData = [];
        const aiData = [];

        Array.from(minuteGroups.entries())
            .sort((a, b) => a[0] - b[0])
            .forEach(([minute, data]) => {
                labels.push(new Date(minute));
                totalData.push(data.total);
                aiData.push(data.ai);
            });

        chart.data.labels = labels;
        chart.data.datasets[0].data = totalData;
        chart.data.datasets[1].data = aiData;
        chart.update('none');
    }

    updatePerformanceChart() {
        const chart = this.charts.get('performance');
        if (!chart) return;

        const perfData = this.dataCollectors.get('performance');
        if (!perfData) return;

        const responseTimes = perfData.apiResponseTimes;
        const fast = responseTimes.filter(time => time < 1000).length;
        const medium = responseTimes.filter(time => time >= 1000 && time < 3000).length;
        const slow = responseTimes.filter(time => time >= 3000).length;

        chart.data.datasets[0].data = [fast, medium, slow];
        chart.update('none');
    }

    updateFeatureUsageChart() {
        const chart = this.charts.get('featureUsage');
        if (!chart) return;

        const featureMap = {
            'aiInteractions': 0,
            'codeGenerations': 1,
            'projectIdeas': 2,
            'analyticsView': 3
        };

        const data = [0, 0, 0, 0, 0];
        
        this.realTimeData.features.forEach((count, feature) => {
            const index = featureMap[feature];
            if (index !== undefined) {
                data[index] = count;
            } else {
                data[4] += count; // Other
            }
        });

        chart.data.datasets[0].data = data;
        chart.update('none');
    }

    updateClickHeatmap(x, y) {
        const heatmapData = this.charts.get('heatmap');
        if (!heatmapData) return;

        // Grid-based heatmap (50x50 grid)
        const gridSize = 50;
        const gridX = Math.floor(x / window.innerWidth * gridSize);
        const gridY = Math.floor(y / window.innerHeight * gridSize);
        const key = `${gridX},${gridY}`;

        const currentCount = heatmapData.clicks.get(key) || 0;
        const newCount = currentCount + 1;
        heatmapData.clicks.set(key, newCount);
        heatmapData.maxClicks = Math.max(heatmapData.maxClicks, newCount);

        // Update visual heatmap if container exists
        this.renderHeatmap();
    }

    renderHeatmap() {
        const container = document.getElementById('heatmap-container');
        if (!container) return;

        const heatmapData = this.charts.get('heatmap');
        if (!heatmapData) return;

        // Clear existing heatmap
        container.innerHTML = '';

        // Create heatmap overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
        `;

        heatmapData.clicks.forEach((count, key) => {
            const [gridX, gridY] = key.split(',').map(Number);
            const x = (gridX / 50) * 100;
            const y = (gridY / 50) * 100;
            const intensity = count / heatmapData.maxClicks;

            const dot = document.createElement('div');
            dot.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                width: 20px;
                height: 20px;
                background: rgba(191, 87, 0, ${intensity * 0.8});
                border-radius: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
            `;

            overlay.appendChild(dot);
        });

        container.appendChild(overlay);
    }

    updateMetricCharts(metric, value) {
        // Update charts based on specific metrics
        switch (metric) {
            case 'aiInteractions':
            case 'codeGenerations':
            case 'projectIdeas':
                this.updateFeatureUsageChart();
                break;
            case 'apiResponseTime':
                this.updatePerformanceChart();
                break;
            default:
                this.updateInteractionChart();
        }
    }

    // Analytics display updates
    updateAnalyticsDisplay() {
        const state = this.core.getState('analytics');
        const elements = {
            totalVisits: document.getElementById('total-visits'),
            aiInteractions: document.getElementById('ai-interactions'),
            codeGenerations: document.getElementById('code-generations'),
            trajectoryAnalyses: document.getElementById('trajectory-analyses'),
            projectIdeas: document.getElementById('project-ideas'),
            codeAnalyses: document.getElementById('code-analyses'),
            avgResponseTime: document.getElementById('avg-response-time'),
            lastModel: document.getElementById('last-model'),
            apiCalls: document.getElementById('api-calls'),
            visitorCount: document.getElementById('visitor-count')
        };

        // Update each element
        Object.entries(elements).forEach(([key, element]) => {
            if (element && state[key] !== undefined) {
                this.animateValueUpdate(element, state[key]);
            }
        });

        // Update special metrics
        if (state.responseTimes.length > 0 && elements.avgResponseTime) {
            const avgTime = state.responseTimes.reduce((a, b) => a + b, 0) / state.responseTimes.length;
            elements.avgResponseTime.textContent = `${(avgTime / 1000).toFixed(2)}s`;
        }

        if (elements.lastModel) {
            elements.lastModel.textContent = state.lastModel || 'N/A';
        }
    }

    animateValueUpdate(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const difference = newValue - currentValue;
        
        if (difference === 0) return;

        const duration = 1000; // 1 second
        const steps = 20;
        const stepValue = difference / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const value = currentValue + (stepValue * currentStep);
            element.textContent = Math.round(value);

            if (currentStep >= steps) {
                element.textContent = newValue;
                clearInterval(timer);
            }
        }, stepDuration);
    }

    // Data collection methods
    collectPerformanceMetrics() {
        const performance = window.performance;
        const navigation = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');

        const metrics = {
            pageLoadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
            resourceCount: resources.length,
            slowResources: resources.filter(r => r.duration > 1000).length,
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
            timestamp: Date.now()
        };

        this.recordPerformanceMetric(metrics);
    }

    saveAnalyticsData() {
        const analyticsData = {
            session: this.dataCollectors.get('session'),
            behavior: this.dataCollectors.get('behavior'),
            performance: this.dataCollectors.get('performance'),
            ai: this.dataCollectors.get('ai'),
            realTime: {
                interactions: this.realTimeData.interactions.slice(-50), // Keep last 50
                features: Object.fromEntries(this.realTimeData.features)
            },
            timestamp: Date.now()
        };

        try {
            localStorage.setItem('blazeAnalytics', JSON.stringify(analyticsData));
        } catch (error) {
            console.warn('Failed to save analytics data:', error);
        }
    }

    loadAnalyticsData() {
        try {
            const stored = localStorage.getItem('blazeAnalytics');
            if (stored) {
                const data = JSON.parse(stored);
                
                // Restore data collectors
                Object.entries(data).forEach(([key, value]) => {
                    if (this.dataCollectors.has(key)) {
                        this.dataCollectors.set(key, value);
                    }
                });

                // Restore real-time data
                if (data.realTime) {
                    this.realTimeData.interactions = data.realTime.interactions || [];
                    this.realTimeData.features = new Map(Object.entries(data.realTime.features || {}));
                }
            }
        } catch (error) {
            console.warn('Failed to load analytics data:', error);
        }
    }

    // Utility methods
    getElementInfo(element) {
        return {
            tagName: element.tagName.toLowerCase(),
            id: element.id,
            className: element.className,
            textContent: element.textContent?.trim().substring(0, 100)
        };
    }

    // Export methods
    exportAnalytics() {
        const data = {
            session: this.dataCollectors.get('session'),
            behavior: this.dataCollectors.get('behavior'),
            performance: this.dataCollectors.get('performance'),
            ai: this.dataCollectors.get('ai'),
            realTime: this.realTimeData,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blaze-analytics-${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    // Dashboard methods
    createDashboard(containerId, widgets) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const dashboard = {
            container: container,
            widgets: new Map(),
            layout: widgets
        };

        widgets.forEach((widget, index) => {
            const widgetElement = this.createWidget(widget);
            container.appendChild(widgetElement);
            dashboard.widgets.set(widget.id, widgetElement);
        });

        this.dashboards.set(containerId, dashboard);
    }

    createWidget(config) {
        const widget = document.createElement('div');
        widget.className = 'analytics-widget glass p-6 rounded-2xl';
        widget.innerHTML = `
            <div class="widget-header flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-white">${config.title}</h3>
                <i data-lucide="${config.icon}" class="w-5 h-5 text-orange-400"></i>
            </div>
            <div class="widget-content">
                <div class="widget-value text-2xl font-bold mono-font text-gradient" id="${config.id}-value">
                    ${config.initialValue || '0'}
                </div>
                <div class="widget-label text-sm text-slate-400 mt-1">
                    ${config.description}
                </div>
            </div>
        `;

        return widget;
    }

    // Insights generation
    generateInsights() {
        const insights = [];
        const state = this.core.getState('analytics');
        const behaviorData = this.dataCollectors.get('behavior');
        const performanceData = this.dataCollectors.get('performance');

        // Usage patterns
        if (state.aiInteractions > 0) {
            const aiRatio = state.aiInteractions / (state.visits || 1);
            if (aiRatio > 0.5) {
                insights.push({
                    type: 'usage',
                    title: 'High AI Engagement',
                    description: `${Math.round(aiRatio * 100)}% of visitors engage with AI features`,
                    impact: 'positive',
                    priority: 'high'
                });
            }
        }

        // Performance insights
        if (performanceData && performanceData.apiResponseTimes.length > 0) {
            const avgResponseTime = performanceData.apiResponseTimes.reduce((a, b) => a + b, 0) / performanceData.apiResponseTimes.length;
            if (avgResponseTime > 3000) {
                insights.push({
                    type: 'performance',
                    title: 'Slow API Response',
                    description: `Average response time is ${(avgResponseTime / 1000).toFixed(1)}s`,
                    impact: 'negative',
                    priority: 'high'
                });
            }
        }

        // Behavior insights
        if (behaviorData && behaviorData.scrollDepth > 0.8) {
            insights.push({
                type: 'engagement',
                title: 'High Content Engagement',
                description: `Users scroll through ${Math.round(behaviorData.scrollDepth * 100)}% of content`,
                impact: 'positive',
                priority: 'medium'
            });
        }

        return insights;
    }

    // Cleanup methods
    cleanup() {
        // Clear intervals
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Destroy charts
        this.charts.forEach(chart => {
            if (chart.destroy) {
                chart.destroy();
            }
        });

        // Clear data
        this.realTimeData = {
            interactions: [],
            performance: [],
            errors: [],
            features: new Map()
        };

        this.isInitialized = false;
    }

    // Debug methods
    debug() {
        return {
            state: this.core.getState('analytics'),
            collectors: Object.fromEntries(this.dataCollectors),
            realTimeData: this.realTimeData,
            charts: Array.from(this.charts.keys()),
            insights: this.generateInsights()
        };
    }
}