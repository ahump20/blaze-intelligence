// Blaze Intelligence Sports Dashboard Widgets
// Championship-level real-time sports data visualization

class SportsDashboardWidgets {
    constructor(containerId = 'sports-widgets-container') {
        this.container = document.getElementById(containerId);
        this.widgets = new Map();
        this.liveSports = window.liveSportsIntegration;
        this.updateTimers = new Map();
        this.isInitialized = false;

        this.widgetTemplates = {
            cardinals: this.createCardinalsWidget.bind(this),
            titans: this.createTitansWidget.bind(this),
            longhorns: this.createLonghornsWidget.bind(this),
            grizzlies: this.createGrizzliesWidget.bind(this),
            perfectGame: this.createPerfectGameWidget.bind(this),
            texasHS: this.createTexasHSWidget.bind(this),
            systemStatus: this.createSystemStatusWidget.bind(this)
        };

        this.initialize();
    }

    async initialize() {
        console.log('🎯 Initializing Sports Dashboard Widgets...');

        // Create container if it doesn't exist
        if (!this.container) {
            this.createContainer();
        }

        // Set up live data subscriptions
        this.setupLiveDataSubscriptions();

        // Create initial widgets
        await this.createAllWidgets();

        // Set up automatic updates
        this.setupAutoUpdates();

        this.isInitialized = true;
        console.log('✅ Sports Dashboard Widgets initialized - Championship interface ready');
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'sports-widgets-container';
        this.container.className = 'sports-widgets-grid';

        // Add to page
        const targetElement = document.querySelector('.analytics-container') || document.body;
        targetElement.appendChild(this.container);

        // Add CSS
        this.injectWidgetCSS();
    }

    injectWidgetCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .sports-widgets-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 1.5rem;
                margin: 2rem 0;
                padding: 1rem;
            }

            .sports-widget {
                background: rgba(0, 0, 0, 0.6);
                border-radius: 12px;
                border: 1px solid rgba(191, 87, 0, 0.3);
                padding: 1.5rem;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .sports-widget:hover {
                transform: translateY(-3px);
                border-color: var(--championship-gold);
                box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
            }

            .widget-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .widget-title {
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--cardinal-blue);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .widget-status {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.8rem;
            }

            .status-live {
                color: var(--neural-green);
            }

            .status-offline {
                color: var(--error-red);
            }

            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: currentColor;
                animation: pulse 2s infinite;
            }

            .widget-content {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .stat-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .stat-row:last-child {
                border-bottom: none;
            }

            .stat-label {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .stat-value {
                font-size: 1rem;
                font-weight: 600;
                color: var(--text-primary);
            }

            .stat-trend {
                font-size: 0.8rem;
                margin-left: 0.5rem;
            }

            .trend-up {
                color: var(--neural-green);
            }

            .trend-down {
                color: var(--error-red);
            }

            .trend-neutral {
                color: var(--championship-gold);
            }

            .widget-mini-chart {
                height: 60px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                margin-top: 0.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                color: var(--text-secondary);
            }

            .players-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .player-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 6px;
                border-left: 3px solid var(--primary-orange);
            }

            .player-name {
                font-weight: 600;
                color: var(--text-primary);
            }

            .player-stats {
                font-size: 0.8rem;
                color: var(--text-secondary);
            }

            .update-timestamp {
                position: absolute;
                bottom: 0.5rem;
                right: 0.5rem;
                font-size: 0.7rem;
                color: var(--text-secondary);
                opacity: 0.7;
            }

            .widget-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100px;
                color: var(--text-secondary);
            }

            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(191, 87, 0, 0.3);
                border-top: 2px solid var(--primary-orange);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 0.5rem;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .sports-widgets-grid {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    padding: 0.5rem;
                }

                .sports-widget {
                    padding: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupLiveDataSubscriptions() {
        if (!this.liveSports) {
            console.warn('Live sports integration not available');
            return;
        }

        // Subscribe to all team updates
        this.liveSports.subscribe('CARDINALS_UPDATE', (data) => {
            this.updateWidget('cardinals', data);
        });

        this.liveSports.subscribe('TITANS_UPDATE', (data) => {
            this.updateWidget('titans', data);
        });

        this.liveSports.subscribe('LONGHORNS_UPDATE', (data) => {
            this.updateWidget('longhorns', data);
        });

        this.liveSports.subscribe('GRIZZLIES_UPDATE', (data) => {
            this.updateWidget('grizzlies', data);
        });

        this.liveSports.subscribe('PERFECT_GAME_UPDATE', (data) => {
            this.updateWidget('perfectGame', data);
        });

        this.liveSports.subscribe('TEXAS_HS_UPDATE', (data) => {
            this.updateWidget('texasHS', data);
        });

        this.liveSports.subscribe('SYSTEM_STATUS', (data) => {
            this.updateWidget('systemStatus', data);
        });
    }

    async createAllWidgets() {
        const widgets = ['systemStatus', 'cardinals', 'titans', 'longhorns', 'grizzlies', 'perfectGame', 'texasHS'];

        for (const widgetType of widgets) {
            await this.createWidget(widgetType);
        }
    }

    async createWidget(type) {
        const templateFunction = this.widgetTemplates[type];
        if (!templateFunction) {
            console.warn(`No template found for widget type: ${type}`);
            return;
        }

        const widgetElement = templateFunction();
        this.widgets.set(type, widgetElement);
        this.container.appendChild(widgetElement);

        // Load initial data
        await this.loadInitialWidgetData(type);
    }

    async loadInitialWidgetData(type) {
        if (!this.liveSports) return;

        // Get cached data or show loading state
        const cachedData = this.liveSports.getCurrentData(type);
        if (cachedData) {
            this.updateWidget(type, { data: cachedData, fromCache: true });
        } else {
            this.showWidgetLoading(type);
        }
    }

    // Widget Templates
    createCardinalsWidget() {
        const widget = document.createElement('div');
        widget.className = 'sports-widget cardinals-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    ⚾ St. Louis Cardinals
                </div>
                <div class="widget-status status-live">
                    <div class="status-dot"></div>
                    LIVE
                </div>
            </div>
            <div class="widget-content" id="cardinals-content">
                <div class="widget-loading">
                    <div class="loading-spinner"></div>
                    Loading Cardinals data...
                </div>
            </div>
            <div class="update-timestamp" id="cardinals-timestamp"></div>
        `;
        return widget;
    }

    createTitansWidget() {
        const widget = document.createElement('div');
        widget.className = 'sports-widget titans-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    🏈 Tennessee Titans
                </div>
                <div class="widget-status status-live">
                    <div class="status-dot"></div>
                    LIVE
                </div>
            </div>
            <div class="widget-content" id="titans-content">
                <div class="widget-loading">
                    <div class="loading-spinner"></div>
                    Loading Titans data...
                </div>
            </div>
            <div class="update-timestamp" id="titans-timestamp"></div>
        `;
        return widget;
    }

    createLonghornsWidget() {
        const widget = document.createElement('div');
        widget.className = 'sports-widget longhorns-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    🤘 Texas Longhorns
                </div>
                <div class="widget-status status-live">
                    <div class="status-dot"></div>
                    LIVE
                </div>
            </div>
            <div class="widget-content" id="longhorns-content">
                <div class="widget-loading">
                    <div class="loading-spinner"></div>
                    Loading Longhorns data...
                </div>
            </div>
            <div class="update-timestamp" id="longhorns-timestamp"></div>
        `;
        return widget;
    }

    createGrizzliesWidget() {
        const widget = document.createElement('div');
        widget.className = 'sports-widget grizzlies-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    🐻 Memphis Grizzlies
                </div>
                <div class="widget-status status-live">
                    <div class="status-dot"></div>
                    LIVE
                </div>
            </div>
            <div class="widget-content" id="grizzlies-content">
                <div class="widget-loading">
                    <div class="loading-spinner"></div>
                    Loading Grizzlies data...
                </div>
            </div>
            <div class="update-timestamp" id="grizzlies-timestamp"></div>
        `;
        return widget;
    }

    createPerfectGameWidget() {
        const widget = document.createElement('div');
        widget.className = 'sports-widget perfect-game-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    ⚾ Perfect Game Baseball
                </div>
                <div class="widget-status status-live">
                    <div class="status-dot"></div>
                    LIVE
                </div>
            </div>
            <div class="widget-content" id="perfectGame-content">
                <div class="widget-loading">
                    <div class="loading-spinner"></div>
                    Loading Perfect Game data...
                </div>
            </div>
            <div class="update-timestamp" id="perfectGame-timestamp"></div>
        `;
        return widget;
    }

    createTexasHSWidget() {
        const widget = document.createElement('div');
        widget.className = 'sports-widget texas-hs-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    🏈 Texas HS Football
                </div>
                <div class="widget-status status-live">
                    <div class="status-dot"></div>
                    LIVE
                </div>
            </div>
            <div class="widget-content" id="texasHS-content">
                <div class="widget-loading">
                    <div class="loading-spinner"></div>
                    Loading Texas HS data...
                </div>
            </div>
            <div class="update-timestamp" id="texasHS-timestamp"></div>
        `;
        return widget;
    }

    createSystemStatusWidget() {
        const widget = document.createElement('div');
        widget.className = 'sports-widget system-status-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    🔥 System Status
                </div>
                <div class="widget-status status-live">
                    <div class="status-dot"></div>
                    ACTIVE
                </div>
            </div>
            <div class="widget-content" id="systemStatus-content">
                <div class="widget-loading">
                    <div class="loading-spinner"></div>
                    Loading system status...
                </div>
            </div>
            <div class="update-timestamp" id="systemStatus-timestamp"></div>
        `;
        return widget;
    }

    // Update Methods
    updateWidget(type, updateData) {
        const contentElement = document.getElementById(`${type}-content`);
        const timestampElement = document.getElementById(`${type}-timestamp`);

        if (!contentElement) return;

        const data = updateData.data;
        const timestamp = updateData.timestamp || new Date().toISOString();

        // Update timestamp
        if (timestampElement) {
            timestampElement.textContent = `Updated: ${new Date(timestamp).toLocaleTimeString()}`;
        }

        // Update content based on widget type
        switch (type) {
            case 'cardinals':
                this.updateCardinalsContent(contentElement, data);
                break;
            case 'titans':
                this.updateTitansContent(contentElement, data);
                break;
            case 'longhorns':
                this.updateLonghornsContent(contentElement, data);
                break;
            case 'grizzlies':
                this.updateGrizzliesContent(contentElement, data);
                break;
            case 'perfectGame':
                this.updatePerfectGameContent(contentElement, data);
                break;
            case 'texasHS':
                this.updateTexasHSContent(contentElement, data);
                break;
            case 'systemStatus':
                this.updateSystemStatusContent(contentElement, data);
                break;
        }
    }

    updateCardinalsContent(element, data) {
        if (!data) return;

        element.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Record</span>
                <span class="stat-value">${data.performance?.wins || 0}-${data.performance?.losses || 0}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Win Percentage</span>
                <span class="stat-value">${data.performance?.winPct || '.000'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Runs Scored</span>
                <span class="stat-value">${data.performance?.runsScored || 0}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Runs Allowed</span>
                <span class="stat-value">${data.performance?.runsAllowed || 0}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Momentum</span>
                <span class="stat-value">${data.intelligence?.momentum?.toFixed(1) || 'N/A'}</span>
            </div>
        `;
    }

    updateTitansContent(element, data) {
        if (!data) return;

        element.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Record</span>
                <span class="stat-value">${data.record || 'N/A'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Standings</span>
                <span class="stat-value">${data.standings || 'N/A'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Offensive Rating</span>
                <span class="stat-value">${data.analytics?.offensiveRating || 'N/A'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Defensive Rating</span>
                <span class="stat-value">${data.analytics?.defensiveRating || 'N/A'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Special Teams</span>
                <span class="stat-value">${data.analytics?.specialTeamsGrade || 'N/A'}</span>
            </div>
        `;
    }

    updateLonghornsContent(element, data) {
        if (!data) return;

        element.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Record</span>
                <span class="stat-value">${data.record || 'N/A'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Ranking</span>
                <span class="stat-value">${data.ranking || 'Unranked'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Conference</span>
                <span class="stat-value">${data.conference || 'SEC'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Playoff Probability</span>
                <span class="stat-value">${data.analytics?.playoffProbability?.toFixed(1) || 'N/A'}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">NIL Valuation</span>
                <span class="stat-value">$${((data.analytics?.nilValuation || 0) / 1000000).toFixed(1)}M</span>
            </div>
        `;
    }

    updateGrizzliesContent(element, data) {
        if (!data) return;

        element.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Record</span>
                <span class="stat-value">${data.record || 'N/A'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Conference</span>
                <span class="stat-value">${data.standings || 'N/A'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Offensive Rating</span>
                <span class="stat-value">${data.analytics?.offensiveRating?.toFixed(1) || 'N/A'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Defensive Rating</span>
                <span class="stat-value">${data.analytics?.defensiveRating?.toFixed(1) || 'N/A'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Playoff Probability</span>
                <span class="stat-value">${data.analytics?.playoffProbability?.toFixed(1) || 'N/A'}%</span>
            </div>
        `;
    }

    updatePerfectGameContent(element, data) {
        if (!data) return;

        const topProspects = data.topProspects?.slice(0, 3) || [];

        element.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">D1 Commits</span>
                <span class="stat-value">${data.texasPipeline?.d1Commits || 0}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">MLB Draft Picks</span>
                <span class="stat-value">${data.texasPipeline?.mlbDraftPicks || 0}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Exit Velocity Avg</span>
                <span class="stat-value">${data.analytics?.exitVelocityAvg || 'N/A'} mph</span>
            </div>
            <div class="players-list">
                ${topProspects.map(player => `
                    <div class="player-item">
                        <div>
                            <div class="player-name">${player.name}</div>
                            <div class="player-stats">${player.position} • ${player.grad} • ${player.state}</div>
                        </div>
                        <div class="stat-value">${player.rating}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateTexasHSContent(element, data) {
        if (!data) return;

        const topTeams = data.topTeams?.slice(0, 3) || [];

        element.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Total Teams</span>
                <span class="stat-value">${data.analytics?.totalTeams || 'N/A'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">D1 Signees 2024</span>
                <span class="stat-value">${data.analytics?.d1Signees2024 || 'N/A'}</span>
            </div>
            <div class="players-list">
                ${topTeams.map(team => `
                    <div class="player-item">
                        <div>
                            <div class="player-name">#${team.rank} ${team.team}</div>
                            <div class="player-stats">${team.classification} • ${team.record}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateSystemStatusContent(element, data) {
        if (!data) return;

        element.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">System Status</span>
                <span class="stat-value status-${data.status?.toLowerCase() || 'offline'}">${data.status || 'UNKNOWN'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Active Feeds</span>
                <span class="stat-value">${data.activeFeeds || 0}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Subscribers</span>
                <span class="stat-value">${data.subscribers || 0}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Data Sources</span>
                <span class="stat-value">7 Live Streams</span>
            </div>
        `;
    }

    showWidgetLoading(type) {
        const contentElement = document.getElementById(`${type}-content`);
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="widget-loading">
                    <div class="loading-spinner"></div>
                    Loading ${type} data...
                </div>
            `;
        }
    }

    setupAutoUpdates() {
        // Refresh widgets every 30 seconds even without live updates
        setInterval(() => {
            this.refreshAllWidgets();
        }, 30000);
    }

    refreshAllWidgets() {
        if (!this.liveSports) return;

        const allData = this.liveSports.getAllCurrentData();

        Object.entries(allData).forEach(([type, data]) => {
            if (data && this.widgets.has(type)) {
                this.updateWidget(type, { data, timestamp: new Date().toISOString() });
            }
        });
    }

    // Public API
    hideWidget(type) {
        const widget = this.widgets.get(type);
        if (widget) {
            widget.style.display = 'none';
        }
    }

    showWidget(type) {
        const widget = this.widgets.get(type);
        if (widget) {
            widget.style.display = 'block';
        }
    }

    getWidgetData(type) {
        return this.liveSports?.getCurrentData(type) || null;
    }

    destroy() {
        // Clear timers
        this.updateTimers.forEach(timer => clearInterval(timer));
        this.updateTimers.clear();

        // Remove widgets
        this.widgets.forEach(widget => widget.remove());
        this.widgets.clear();

        // Remove container
        if (this.container) {
            this.container.remove();
        }

        console.log('🛑 Sports Dashboard Widgets destroyed');
    }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for live sports integration to be ready
        setTimeout(() => {
            window.sportsDashboardWidgets = new SportsDashboardWidgets();
        }, 1000);
    });
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SportsDashboardWidgets;
}