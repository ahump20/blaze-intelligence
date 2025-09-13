/**
 * Blaze Intelligence Real-Time Data Connector
 * Championship-level real-time data streaming for all sports platforms
 */

class BlazeRealtimeConnector {
    constructor() {
        this.connections = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.retryDelay = 5000;

        this.endpoints = {
            consciousness: '/api/consciousness-stream',
            narratives: '/api/narrative-generator',
            cardinals: '/api/cardinals-readiness',
            titans: '/api/titans-power',
            longhorns: '/api/longhorns-recruiting',
            grizzlies: '/api/grizzlies-metrics',
            perfectGame: '/api/perfect-game-live',
            secFootball: '/api/sec-football-live'
        };

        this.callbacks = new Map();
        this.init();
    }

    init() {
        // Initialize all real-time connections
        this.establishConnections();

        // Set up reconnection monitoring
        this.monitorConnections();

        // Initialize dashboard updates
        this.initializeDashboardUpdates();
    }

    establishConnections() {
        // Establish SSE connections for real-time data
        Object.entries(this.endpoints).forEach(([key, endpoint]) => {
            this.createConnection(key, endpoint);
        });
    }

    createConnection(key, endpoint) {
        if (typeof(EventSource) === "undefined") {
            console.warn('SSE not supported, falling back to polling for:', key);
            this.initializePolling(key, endpoint);
            return;
        }

        try {
            const eventSource = new EventSource(endpoint);

            eventSource.onopen = () => {
                console.log(`✅ Connected to ${key} stream`);
                this.retryAttempts.set(key, 0);
                this.updateConnectionStatus(key, 'connected');
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleRealtimeData(key, data);
                } catch (error) {
                    console.error(`Error parsing ${key} data:`, error);
                }
            };

            eventSource.onerror = (event) => {
                console.error(`❌ Connection error for ${key}:`, event);
                this.handleConnectionError(key, endpoint);
            };

            this.connections.set(key, eventSource);
        } catch (error) {
            console.error(`Failed to create connection for ${key}:`, error);
            this.initializePolling(key, endpoint);
        }
    }

    handleConnectionError(key, endpoint) {
        const attempts = this.retryAttempts.get(key) || 0;

        if (attempts < this.maxRetries) {
            this.retryAttempts.set(key, attempts + 1);
            this.updateConnectionStatus(key, 'reconnecting');

            setTimeout(() => {
                console.log(`🔄 Retrying connection for ${key} (${attempts + 1}/${this.maxRetries})`);
                this.reconnect(key, endpoint);
            }, this.retryDelay * Math.pow(2, attempts));
        } else {
            console.warn(`⚠️ Max retries reached for ${key}, switching to polling`);
            this.closeConnection(key);
            this.initializePolling(key, endpoint);
        }
    }

    reconnect(key, endpoint) {
        this.closeConnection(key);
        this.createConnection(key, endpoint);
    }

    closeConnection(key) {
        const connection = this.connections.get(key);
        if (connection) {
            connection.close();
            this.connections.delete(key);
        }
    }

    initializePolling(key, endpoint) {
        // Fallback polling mechanism
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(endpoint.replace('-stream', '-level'));
                if (response.ok) {
                    const data = await response.json();
                    this.handleRealtimeData(key, data);
                }
            } catch (error) {
                console.error(`Polling error for ${key}:`, error);
            }
        }, 3000);

        // Store interval for cleanup
        this.connections.set(key, { type: 'polling', interval: pollInterval });
    }

    handleRealtimeData(key, data) {
        // Update dashboard based on data type
        switch(key) {
            case 'consciousness':
                this.updateConsciousnessMetrics(data);
                break;
            case 'cardinals':
                this.updateCardinalsMetrics(data);
                break;
            case 'titans':
                this.updateTitansMetrics(data);
                break;
            case 'longhorns':
                this.updateLonghornsMetrics(data);
                break;
            case 'grizzlies':
                this.updateGrizzliesMetrics(data);
                break;
            case 'perfectGame':
                this.updatePerfectGameMetrics(data);
                break;
            case 'secFootball':
                this.updateSECFootballMetrics(data);
                break;
            case 'narratives':
                this.updateNarratives(data);
                break;
        }

        // Execute registered callbacks
        const callbacks = this.callbacks.get(key) || [];
        callbacks.forEach(callback => callback(data));
    }

    updateConsciousnessMetrics(data) {
        // Update AI consciousness indicators
        const levelElement = document.getElementById('consciousnessLevel');
        if (levelElement) {
            levelElement.textContent = `${data.consciousness.level.toFixed(1)}%`;

            // Add pulse effect on significant changes
            if (Math.abs(data.consciousness.level - parseFloat(levelElement.dataset.lastValue || 0)) > 2) {
                levelElement.classList.add('pulse-effect');
                setTimeout(() => levelElement.classList.remove('pulse-effect'), 1000);
            }
            levelElement.dataset.lastValue = data.consciousness.level;
        }

        // Update neural activity indicators
        const neuralIndicator = document.querySelector('.neural-pulse');
        if (neuralIndicator && data.neural) {
            neuralIndicator.style.animationDuration = `${3 - (data.neural.processing / 50)}s`;
        }
    }

    updateCardinalsMetrics(data) {
        this.updateMetric('cardinalsReadiness', data.readiness, '%');
        this.updateMetric('cardinalsLeverage', data.leverage, 'x');
        this.updateMetric('cardinalsMomentum', data.momentum);

        // Update chart if available
        if (window.charts && window.charts.cardinals) {
            this.updateChartData(window.charts.cardinals, data);
        }
    }

    updateTitansMetrics(data) {
        this.updateMetric('titansPower', data.power);
        this.updateMetric('titansEfficiency', data.efficiency, '%');

        // Visual indicator for power levels
        const powerElement = document.getElementById('titansPower');
        if (powerElement && data.power > 85) {
            powerElement.classList.add('elite-performance');
        }
    }

    updateLonghornsMetrics(data) {
        this.updateMetric('longhornsRank', `#${data.rank}`);
        this.updateMetric('longhornsPotential', data.potential, '%');
        this.updateMetric('longhornsRecruits', data.commits);
    }

    updateGrizzliesMetrics(data) {
        this.updateMetric('grizzliesRating', data.rating);
        this.updateMetric('grizzliesVelocity', data.velocity);
        this.updateMetric('grizzliesEfficiency', data.efficiency, '%');
    }

    updatePerfectGameMetrics(data) {
        // Update prospect rankings
        if (data.prospects) {
            const prospectList = document.querySelector('.prospect-list');
            if (prospectList) {
                this.renderProspects(prospectList, data.prospects);
            }
        }

        // Update showcase metrics
        this.updateMetric('showcaseEvents', data.events);
        this.updateMetric('draftProjections', data.firstRoundProjections);
    }

    updateSECFootballMetrics(data) {
        // Update SEC standings
        if (data.standings) {
            this.renderSECStandings(data.standings);
        }

        // Update recruiting rankings
        if (data.recruiting) {
            this.renderRecruitingRankings(data.recruiting);
        }

        // Update championship probability
        this.updateMetric('secChampionshipProb', data.championshipProbability, '%');
    }

    updateNarratives(data) {
        const feedElement = document.getElementById('narrativeFeed');
        if (!feedElement) return;

        // Add new narratives with animation
        data.narratives.forEach((narrative, index) => {
            setTimeout(() => {
                const item = this.createNarrativeElement(narrative);
                feedElement.insertBefore(item, feedElement.firstChild);

                // Limit feed to 10 items
                while (feedElement.children.length > 10) {
                    feedElement.removeChild(feedElement.lastChild);
                }
            }, index * 200);
        });
    }

    createNarrativeElement(narrative) {
        const item = document.createElement('div');
        item.className = 'narrative-item fade-in';
        item.innerHTML = `
            <div class="narrative-team">${narrative.team} • ${narrative.sport}</div>
            <div class="narrative-story">${narrative.story}</div>
            <div class="narrative-timestamp">${new Date(narrative.timestamp).toLocaleTimeString()}</div>
        `;
        return item;
    }

    updateMetric(elementId, value, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseFloat(element.textContent) || 0;
        const newValue = typeof value === 'number' ? value : parseFloat(value) || 0;

        // Animate value change
        if (Math.abs(newValue - currentValue) > 0.1) {
            this.animateValue(element, currentValue, newValue, 500, suffix);

            // Add highlight effect
            element.classList.add('value-updated');
            setTimeout(() => element.classList.remove('value-updated'), 1000);
        }
    }

    animateValue(element, start, end, duration, suffix = '') {
        const range = end - start;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const current = start + (range * easeProgress);

            if (typeof end === 'number') {
                element.textContent = current.toFixed(1) + suffix;
            } else {
                element.textContent = Math.round(current) + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    renderProspects(container, prospects) {
        container.innerHTML = prospects.slice(0, 5).map((prospect, index) => `
            <div class="prospect-item">
                <div class="prospect-rank">${index + 1}</div>
                <div class="prospect-info">
                    <div class="prospect-name">${prospect.name}</div>
                    <div class="prospect-details">
                        <span>${prospect.position}</span>
                        <span>•</span>
                        <span>${prospect.school}</span>
                        <span>•</span>
                        <span>${prospect.height} ${prospect.weight}</span>
                    </div>
                </div>
                <div class="prospect-metrics">
                    <div class="prospect-grade">${prospect.grade}</div>
                    <div class="prospect-projection">${prospect.projection}</div>
                </div>
            </div>
        `).join('');
    }

    renderSECStandings(standings) {
        const container = document.getElementById('secStandings');
        if (!container) return;

        container.innerHTML = standings.map(team => `
            <div class="team-standing">
                <span class="team-rank">${team.rank}</span>
                <span class="team-name">${team.name}</span>
                <span class="team-record">${team.wins}-${team.losses}</span>
                <span class="team-percentage">${team.percentage}</span>
            </div>
        `).join('');
    }

    renderRecruitingRankings(rankings) {
        const container = document.getElementById('recruitingRankings');
        if (!container) return;

        container.innerHTML = rankings.map(school => `
            <div class="recruiting-rank">
                <span class="rank-number">${school.rank}</span>
                <span class="school-name">${school.name}</span>
                <span class="recruit-score">${school.score}</span>
                <span class="five-stars">${school.fiveStars}★</span>
            </div>
        `).join('');
    }

    updateChartData(chart, data) {
        if (!chart || !chart.data) return;

        // Update chart data points
        chart.data.datasets[0].data.push(data.value);

        // Keep only last 20 points
        if (chart.data.datasets[0].data.length > 20) {
            chart.data.datasets[0].data.shift();
        }

        chart.update('none'); // Update without animation for smooth real-time
    }

    monitorConnections() {
        // Monitor connection health every 30 seconds
        setInterval(() => {
            this.connections.forEach((connection, key) => {
                if (connection && connection.readyState === EventSource.CLOSED) {
                    console.log(`🔄 Reconnecting ${key}...`);
                    this.reconnect(key, this.endpoints[key]);
                }
            });
        }, 30000);
    }

    updateConnectionStatus(key, status) {
        const statusElement = document.querySelector(`[data-connection="${key}"]`);
        if (statusElement) {
            statusElement.className = `connection-status ${status}`;
            statusElement.title = `${key}: ${status}`;
        }
    }

    initializeDashboardUpdates() {
        // Set up automatic dashboard refreshes
        if (document.querySelector('.dashboard-container')) {
            console.log('🎯 Real-time dashboard initialized');

            // Add connection status indicators
            this.addConnectionIndicators();
        }
    }

    addConnectionIndicators() {
        const header = document.querySelector('.header') || document.querySelector('header');
        if (!header) return;

        const indicators = document.createElement('div');
        indicators.className = 'connection-indicators';
        indicators.innerHTML = Object.keys(this.endpoints).map(key =>
            `<span class="connection-status pending" data-connection="${key}" title="${key}: connecting"></span>`
        ).join('');

        header.appendChild(indicators);
    }

    // Public API for registering callbacks
    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event).push(callback);
    }

    off(event, callback) {
        const callbacks = this.callbacks.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // Cleanup method
    destroy() {
        this.connections.forEach((connection, key) => {
            if (connection.close) {
                connection.close();
            } else if (connection.interval) {
                clearInterval(connection.interval);
            }
        });
        this.connections.clear();
        this.callbacks.clear();
    }
}

// Initialize real-time connector
const blazeRealtime = new BlazeRealtimeConnector();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeRealtimeConnector;
}