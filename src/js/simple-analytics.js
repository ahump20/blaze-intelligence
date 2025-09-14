// Simple Analytics Module for Athlete Dashboard
// Real-time data integration with Cardinals analytics

class SimpleAnalytics {
    constructor() {
        this.dataEndpoint = '/src/data/readiness.json';
        this.updateInterval = 30000; // 30 seconds
        this.lastUpdate = null;
    }

    async fetchReadinessData() {
        try {
            const response = await fetch(this.dataEndpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.lastUpdate = new Date(data.lastUpdated);
            return data;
        } catch (error) {
            console.error('Failed to fetch readiness data:', error);
            // Return fallback data if fetch fails
            return this.getFallbackData();
        }
    }

    getFallbackData() {
        return {
            readiness: {
                overall: 85,
                offense: 82,
                defense: 88,
                pitching: 90
            },
            predictions: {
                winProbability: 0.55,
                playoffOdds: 0.61,
                projectedWins: 87
            }
        };
    }

    formatPercentage(value) {
        if (typeof value === 'number' && value <= 1) {
            return Math.round(value * 100) + '%';
        }
        return value + '%';
    }

    updateMetric(elementId, value, format = 'raw') {
        const element = document.getElementById(elementId);
        if (!element) return;

        switch(format) {
            case 'percentage':
                element.textContent = this.formatPercentage(value);
                break;
            case 'number':
                element.textContent = Math.round(value);
                break;
            default:
                element.textContent = value;
        }

        // Add animation class
        element.classList.add('updated');
        setTimeout(() => element.classList.remove('updated'), 500);
    }

    updateProgressBar(selector, percentage) {
        const bars = document.querySelectorAll(selector);
        bars.forEach(bar => {
            if (bar) {
                bar.style.width = percentage + '%';
            }
        });
    }

    async initialize() {
        // Initial load
        await this.updateDashboard();

        // Set up periodic updates
        setInterval(() => this.updateDashboard(), this.updateInterval);

        // Add CSS for update animation
        if (!document.getElementById('analytics-styles')) {
            const style = document.createElement('style');
            style.id = 'analytics-styles';
            style.textContent = `
                .updated {
                    animation: pulse 0.5s ease;
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    async updateDashboard() {
        const data = await this.fetchReadinessData();

        // Update readiness metrics
        if (data.readiness) {
            this.updateMetric('readinessIndicator', data.readiness.overall, 'number');

            // Update color based on readiness
            const indicator = document.getElementById('readinessIndicator');
            if (indicator) {
                if (data.readiness.overall >= 85) {
                    indicator.style.background = 'linear-gradient(135deg, #10B981, #00C851)';
                } else if (data.readiness.overall >= 70) {
                    indicator.style.background = 'linear-gradient(135deg, #FF9F0A, #FF6B00)';
                } else {
                    indicator.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
                }
            }

            // Update progress bars
            const progressData = [
                { selector: '.progress-fill', index: 0, value: data.readiness.offense || 78 },
                { selector: '.progress-fill', index: 1, value: data.readiness.defense || 89 },
                { selector: '.progress-fill', index: 2, value: data.readiness.pitching || 94 }
            ];

            progressData.forEach(item => {
                const elements = document.querySelectorAll(item.selector);
                if (elements[item.index]) {
                    elements[item.index].style.width = item.value + '%';
                    // Update the number display
                    const parent = elements[item.index].closest('.progress-item');
                    if (parent) {
                        const label = parent.querySelector('.progress-label span:last-child');
                        if (label) {
                            label.textContent = item.value + '/100';
                        }
                    }
                }
            });
        }

        // Update predictions
        if (data.predictions) {
            this.updateMetric('winProbability', data.predictions.winProbability, 'percentage');

            // Update playoff odds
            const playoffElement = document.querySelector('.quick-stat:nth-child(2) .stat-number');
            if (playoffElement && data.predictions.playoffOdds) {
                playoffElement.textContent = Math.round(data.predictions.playoffOdds * 100) + '%';
            }

            // Update projected wins
            const winsElement = document.querySelector('.quick-stat:nth-child(3) .stat-number');
            if (winsElement && data.predictions.projectedWins) {
                winsElement.textContent = data.predictions.projectedWins;
            }
        }

        // Update team pulse if we have recent performance data
        if (data.recentPerformance) {
            const streakElement = document.querySelector('.card:nth-child(3) div[style*="font-size: 24px"]');
            if (streakElement) {
                if (data.recentPerformance.trend === 'hot') {
                    streakElement.textContent = 'Hot Streak';
                    const descElement = streakElement.nextElementSibling;
                    if (descElement) {
                        descElement.textContent = `${data.recentPerformance.last5Games.wins}-${data.recentPerformance.last5Games.losses} in last 5 games`;
                    }
                }
            }

            // Update team health based on overall readiness
            const healthBar = document.querySelector('.card:nth-child(3) .progress-fill');
            if (healthBar && data.readiness) {
                const healthPercentage = data.readiness.health || data.readiness.overall;
                healthBar.style.width = healthPercentage + '%';
                const healthLabel = document.querySelector('.card:nth-child(3) .progress-label span:last-child');
                if (healthLabel) {
                    healthLabel.textContent = healthPercentage + '%';
                }
            }
        }

        console.log('Dashboard updated at:', new Date().toLocaleTimeString());
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const analytics = new SimpleAnalytics();
        analytics.initialize();
    });
} else {
    const analytics = new SimpleAnalytics();
    analytics.initialize();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleAnalytics;
}