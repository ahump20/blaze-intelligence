/**
 * Optimized Dashboard Loader - Championship Performance System
 * By Austin Humphrey - Deep South Sports Authority
 * Delivers smooth, fast chart loading and navigation experience
 */

class OptimizedDashboardLoader {
    constructor() {
        this.charts = new Map();
        this.lazyLoadQueue = [];
        this.isIntersectionObserverSupported = 'IntersectionObserver' in window;
        this.performanceMetrics = {
            chartsLoaded: 0,
            averageLoadTime: 0,
            memoryUsage: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('🏆 Austin Humphrey Dashboard Optimizer - Championship Performance Mode');
        this.setupIntersectionObserver();
        this.optimizeExistingCharts();
        this.setupNavigationEnhancements();
        this.setupPerformanceMonitoring();
    }
    
    setupIntersectionObserver() {
        if (!this.isIntersectionObserverSupported) {
            console.warn('⚠️ IntersectionObserver not supported - falling back to immediate loading');
            this.loadAllCharts();
            return;
        }
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadChart(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px', // Start loading 100px before chart enters viewport
            threshold: 0.1
        });
        
        // Observe all chart containers
        document.querySelectorAll('.chart-container, .chart-card, [data-chart]').forEach(container => {
            if (!container.dataset.loaded) {
                this.observer.observe(container);
            }
        });
    }
    
    async loadChart(container) {
        const startTime = performance.now();
        const chartType = container.dataset.chart || 'line';
        const chartId = container.id || `chart-${Date.now()}`;
        
        try {
            // Add loading state
            this.showLoadingState(container);
            
            // Simulate data loading (replace with actual API calls)
            const chartData = await this.loadChartData(chartType, container);
            
            // Create optimized chart configuration
            const chartConfig = this.createOptimizedChartConfig(chartType, chartData);
            
            // Find or create canvas
            let canvas = container.querySelector('canvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = `${chartId}-canvas`;
                container.appendChild(canvas);
            }
            
            // Initialize Chart.js with optimization
            const chart = new Chart(canvas.getContext('2d'), chartConfig);
            
            // Store chart reference for cleanup
            this.charts.set(chartId, chart);
            
            // Mark as loaded
            container.dataset.loaded = 'true';
            this.hideLoadingState(container);
            
            // Update performance metrics
            const loadTime = performance.now() - startTime;
            this.updatePerformanceMetrics(loadTime);
            
            console.log(`✅ Chart ${chartId} loaded in ${loadTime.toFixed(2)}ms`);
            
        } catch (error) {
            console.error(`🚨 Failed to load chart ${chartId}:`, error);
            this.showErrorState(container, error);
        }
    }
    
    async loadChartData(chartType, container) {
        // Championship-level mock data - replace with real API calls
        const dataSize = parseInt(container.dataset.points) || 20;
        
        switch (chartType) {
            case 'pressure':
                return this.generatePressureData(dataSize);
            case 'performance':
                return this.generatePerformanceData(dataSize);
            case 'momentum':
                return this.generateMomentumData(dataSize);
            case 'analytics':
                return this.generateAnalyticsData(dataSize);
            default:
                return this.generateDefaultData(dataSize);
        }
    }
    
    createOptimizedChartConfig(chartType, data) {
        const baseConfig = {
            type: chartType === 'analytics' ? 'bar' : 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#8892B0',
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 34, 64, 0.95)',
                        titleColor: '#E6F1FF',
                        bodyColor: '#8892B0',
                        borderColor: '#BF5700',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(136, 146, 176, 0.1)',
                            borderColor: 'rgba(136, 146, 176, 0.2)'
                        },
                        ticks: {
                            color: '#8892B0',
                            font: {
                                family: 'Inter, sans-serif'
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(136, 146, 176, 0.1)',
                            borderColor: 'rgba(136, 146, 176, 0.2)'
                        },
                        ticks: {
                            color: '#8892B0',
                            font: {
                                family: 'Inter, sans-serif'
                            }
                        }
                    }
                },
                // Performance optimizations
                datasets: {
                    line: {
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        tension: 0.4
                    }
                }
            }
        };
        
        return baseConfig;
    }
    
    generatePressureData(points) {
        const labels = Array.from({length: points}, (_, i) => `Q${Math.floor(i/5)+1}-${i%5+1}`);
        return {
            labels,
            datasets: [{
                label: 'Championship Pressure Index',
                data: Array.from({length: points}, () => 60 + Math.random() * 40),
                borderColor: '#BF5700',
                backgroundColor: 'rgba(191, 87, 0, 0.1)',
                fill: true
            }]
        };
    }
    
    generatePerformanceData(points) {
        const labels = Array.from({length: points}, (_, i) => `Game ${i+1}`);
        return {
            labels,
            datasets: [{
                label: 'Performance Rating',
                data: Array.from({length: points}, () => 75 + Math.random() * 25),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true
            }]
        };
    }
    
    generateMomentumData(points) {
        const labels = Array.from({length: points}, (_, i) => `Play ${i+1}`);
        return {
            labels,
            datasets: [{
                label: 'Momentum Shift',
                data: Array.from({length: points}, () => -50 + Math.random() * 100),
                borderColor: '#64FFDA',
                backgroundColor: 'rgba(100, 255, 218, 0.1)',
                fill: true
            }]
        };
    }
    
    generateAnalyticsData(points) {
        const labels = ['Pressure', 'Clutch', 'Momentum', 'Biometric', 'Overall'];
        return {
            labels,
            datasets: [{
                label: 'Austin Humphrey AI Analysis',
                data: [94.6, 89.2, 92.1, 87.5, 91.3],
                backgroundColor: [
                    'rgba(191, 87, 0, 0.8)',
                    'rgba(255, 184, 28, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(100, 255, 218, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: '#BF5700',
                borderWidth: 1
            }]
        };
    }
    
    generateDefaultData(points) {
        const labels = Array.from({length: points}, (_, i) => `Point ${i+1}`);
        return {
            labels,
            datasets: [{
                label: 'Data Points',
                data: Array.from({length: points}, () => Math.random() * 100),
                borderColor: '#8892B0',
                backgroundColor: 'rgba(136, 146, 176, 0.1)',
                fill: true
            }]
        };
    }
    
    showLoadingState(container) {
        const loader = document.createElement('div');
        loader.className = 'chart-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="austin-spinner"></div>
                <p>Loading championship data...</p>
            </div>
        `;
        container.appendChild(loader);
    }
    
    hideLoadingState(container) {
        const loader = container.querySelector('.chart-loader');
        if (loader) {
            loader.remove();
        }
    }
    
    showErrorState(container, error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chart-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load chart data</p>
                <button onclick="location.reload()" class="retry-btn">Retry</button>
            </div>
        `;
        container.appendChild(errorDiv);
    }
    
    optimizeExistingCharts() {
        // Clean up any existing charts to prevent memory leaks
        this.charts.forEach((chart, id) => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts.clear();
    }
    
    setupNavigationEnhancements() {
        // Smooth scrolling for dashboard navigation
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Add active navigation indicators
        this.setupActiveNavigation();
    }
    
    setupActiveNavigation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Update active navigation
                    const navLinks = document.querySelectorAll('.nav-link');
                    navLinks.forEach(link => link.classList.remove('active'));
                    
                    const activeLink = document.querySelector(`a[href="#${entry.target.id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, { threshold: 0.5 });
        
        document.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });
    }
    
    setupPerformanceMonitoring() {
        // Monitor memory usage and performance
        setInterval(() => {
            if (performance.memory) {
                this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
                
                // Warn if memory usage is high
                if (this.performanceMetrics.memoryUsage > 100) {
                    console.warn(`⚠️ High memory usage: ${this.performanceMetrics.memoryUsage.toFixed(2)}MB`);
                }
            }
        }, 30000); // Check every 30 seconds
    }
    
    updatePerformanceMetrics(loadTime) {
        this.performanceMetrics.chartsLoaded++;
        this.performanceMetrics.averageLoadTime = 
            (this.performanceMetrics.averageLoadTime * (this.performanceMetrics.chartsLoaded - 1) + loadTime) 
            / this.performanceMetrics.chartsLoaded;
    }
    
    getPerformanceReport() {
        return {
            ...this.performanceMetrics,
            activeCharts: this.charts.size,
            timestamp: new Date().toISOString()
        };
    }
    
    // Public API methods
    loadAllCharts() {
        document.querySelectorAll('.chart-container, .chart-card, [data-chart]').forEach(container => {
            if (!container.dataset.loaded) {
                this.loadChart(container);
            }
        });
    }
    
    destroyChart(chartId) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.destroy();
            this.charts.delete(chartId);
        }
    }
    
    refreshChart(chartId) {
        this.destroyChart(chartId);
        const container = document.getElementById(chartId);
        if (container) {
            container.dataset.loaded = 'false';
            this.loadChart(container);
        }
    }
}

// Enhanced CSS for loading states
const optimizedStyles = `
<style>
.chart-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background: rgba(17, 34, 64, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(191, 87, 0, 0.2);
}

.loader-content {
    text-align: center;
    color: #8892B0;
}

.austin-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(191, 87, 0, 0.3);
    border-top: 3px solid #BF5700;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.chart-error {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background: rgba(255, 59, 48, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(255, 59, 48, 0.3);
}

.error-content {
    text-align: center;
    color: #FF3B30;
}

.error-content i {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.retry-btn {
    background: #BF5700;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 1rem;
    font-family: 'Inter', sans-serif;
    transition: background 0.3s ease;
}

.retry-btn:hover {
    background: #A04A00;
}

.nav-link.active {
    color: #BF5700 !important;
    position: relative;
}

.nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: #BF5700;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', optimizedStyles);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboardLoader = new OptimizedDashboardLoader();
    });
} else {
    window.dashboardLoader = new OptimizedDashboardLoader();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizedDashboardLoader;
}