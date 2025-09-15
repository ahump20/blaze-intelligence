// Blaze Intelligence Real-Time Data Handler
// WebSocket connections for live sports data streaming

class RealtimeDataHandler {
    constructor() {
        this.connections = new Map();
        this.subscribers = new Map();
        this.dataConnector = new SportsDataConnector();
        this.updateInterval = 10000; // 10 seconds
        this.isRunning = false;
    }

    // Initialize real-time connections
    async initialize() {
        console.log('🔥 Initializing Blaze Intelligence Real-Time Data Handler...');

        // Start polling for data updates
        this.startDataPolling();

        // Initialize WebSocket connections if available
        this.initializeWebSockets();

        // Set up event listeners
        this.setupEventListeners();

        this.isRunning = true;
        console.log('✅ Real-time data handler initialized');
    }

    // Start polling for data updates
    startDataPolling() {
        // MLB Updates
        setInterval(async () => {
            if (this.hasSubscribers('mlb')) {
                const data = await this.dataConnector.getCardinalsAnalytics();
                this.broadcastUpdate('mlb', data);
            }
        }, this.updateInterval);

        // NFL Updates
        setInterval(async () => {
            if (this.hasSubscribers('nfl')) {
                const data = await this.dataConnector.getNFLData();
                this.broadcastUpdate('nfl', data);
            }
        }, this.updateInterval * 2);

        // NCAA Updates
        setInterval(async () => {
            if (this.hasSubscribers('ncaa')) {
                const data = await this.dataConnector.getNCAAfootball();
                this.broadcastUpdate('ncaa', data);
            }
        }, this.updateInterval * 2);

        // Perfect Game Updates
        setInterval(async () => {
            if (this.hasSubscribers('perfectgame')) {
                const data = await this.dataConnector.getPerfectGameData();
                this.broadcastUpdate('perfectgame', data);
            }
        }, this.updateInterval * 3);

        // Texas HS Football Updates
        setInterval(async () => {
            if (this.hasSubscribers('txhs')) {
                const data = await this.dataConnector.getTexasHSFootball();
                this.broadcastUpdate('txhs', data);
            }
        }, this.updateInterval * 3);
    }

    // Initialize WebSocket connections
    initializeWebSockets() {
        // Check if we're in a browser environment
        if (typeof WebSocket === 'undefined') {
            console.log('WebSocket not available in this environment');
            return;
        }

        // Simulated WebSocket endpoints (would be real in production)
        const endpoints = {
            mlb: 'wss://blaze-intelligence.com/ws/mlb',
            nfl: 'wss://blaze-intelligence.com/ws/nfl',
            ncaa: 'wss://blaze-intelligence.com/ws/ncaa'
        };

        // Note: In production, these would connect to real WebSocket servers
        // For now, we'll use polling as the primary method
    }

    // Subscribe to data updates
    subscribe(channel, callback) {
        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, new Set());
        }
        this.subscribers.get(channel).add(callback);

        // Return unsubscribe function
        return () => {
            const subs = this.subscribers.get(channel);
            if (subs) {
                subs.delete(callback);
            }
        };
    }

    // Check if channel has subscribers
    hasSubscribers(channel) {
        const subs = this.subscribers.get(channel);
        return subs && subs.size > 0;
    }

    // Broadcast updates to subscribers
    broadcastUpdate(channel, data) {
        const subs = this.subscribers.get(channel);
        if (subs) {
            subs.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in subscriber callback for ${channel}:`, error);
                }
            });
        }

        // Also update DOM elements if they exist
        this.updateDOMElements(channel, data);
    }

    // Update DOM elements with real-time data
    updateDOMElements(channel, data) {
        switch(channel) {
            case 'mlb':
                this.updateMLBElements(data);
                break;
            case 'nfl':
                this.updateNFLElements(data);
                break;
            case 'ncaa':
                this.updateNCAAElements(data);
                break;
            case 'perfectgame':
                this.updatePerfectGameElements(data);
                break;
            case 'txhs':
                this.updateTexasHSElements(data);
                break;
        }
    }

    // Update MLB elements
    updateMLBElements(data) {
        const elements = {
            wins: document.querySelector('[data-mlb-wins]'),
            losses: document.querySelector('[data-mlb-losses]'),
            winPct: document.querySelector('[data-mlb-winpct]'),
            momentum: document.querySelector('[data-mlb-momentum]')
        };

        if (elements.wins) elements.wins.textContent = data.performance?.wins || '0';
        if (elements.losses) elements.losses.textContent = data.performance?.losses || '0';
        if (elements.winPct) elements.winPct.textContent = data.performance?.winPct || '.000';
        if (elements.momentum) {
            const momentum = data.intelligence?.momentum || 0;
            elements.momentum.textContent = momentum.toFixed(1);
            elements.momentum.className = momentum > 5 ? 'positive' : momentum < 3 ? 'negative' : 'neutral';
        }

        // Update upcoming games
        const gamesContainer = document.querySelector('[data-mlb-upcoming]');
        if (gamesContainer && data.upcomingGames) {
            gamesContainer.innerHTML = data.upcomingGames.map(game => `
                <div class="game-card">
                    <div class="game-date">${new Date(game.date).toLocaleDateString()}</div>
                    <div class="game-opponent">${game.home ? 'vs' : '@'} ${game.opponent}</div>
                </div>
            `).join('');
        }
    }

    // Update NFL elements
    updateNFLElements(data) {
        const elements = {
            record: document.querySelector('[data-nfl-record]'),
            standings: document.querySelector('[data-nfl-standings]'),
            offensive: document.querySelector('[data-nfl-offensive]'),
            defensive: document.querySelector('[data-nfl-defensive]')
        };

        if (elements.record) elements.record.textContent = data.record || '0-0';
        if (elements.standings) elements.standings.textContent = data.standings || 'N/A';
        if (elements.offensive) {
            elements.offensive.textContent = data.analytics?.offensiveRating || '0';
            elements.offensive.style.color = data.analytics?.offensiveRating > 80 ? '#4CAF50' : '#FFA726';
        }
        if (elements.defensive) {
            elements.defensive.textContent = data.analytics?.defensiveRating || '0';
            elements.defensive.style.color = data.analytics?.defensiveRating > 80 ? '#4CAF50' : '#FFA726';
        }
    }

    // Update NCAA elements
    updateNCAAElements(data) {
        const elements = {
            record: document.querySelector('[data-ncaa-record]'),
            ranking: document.querySelector('[data-ncaa-ranking]'),
            playoff: document.querySelector('[data-ncaa-playoff]'),
            nil: document.querySelector('[data-ncaa-nil]')
        };

        if (elements.record) elements.record.textContent = data.record || '0-0';
        if (elements.ranking) {
            elements.ranking.textContent = data.ranking || 'Unranked';
            if (data.ranking && !isNaN(data.ranking)) {
                elements.ranking.className = data.ranking <= 10 ? 'top-ten' : 'ranked';
            }
        }
        if (elements.playoff) {
            const prob = data.analytics?.playoffProbability || 0;
            elements.playoff.textContent = `${prob.toFixed(1)}%`;
            elements.playoff.style.background = `linear-gradient(90deg, #BF5700 ${prob}%, #333 ${prob}%)`;
        }
        if (elements.nil) {
            const value = data.analytics?.nilValuation || 0;
            elements.nil.textContent = `$${(value / 1000000).toFixed(1)}M`;
        }
    }

    // Update Perfect Game elements
    updatePerfectGameElements(data) {
        const prospectsContainer = document.querySelector('[data-pg-prospects]');
        if (prospectsContainer && data.topProspects) {
            prospectsContainer.innerHTML = data.topProspects.map(prospect => `
                <div class="prospect-card">
                    <span class="rank">#${prospect.rank}</span>
                    <span class="name">${prospect.name}</span>
                    <span class="position">${prospect.position}</span>
                    <span class="grad">${prospect.grad}</span>
                    <span class="rating">${prospect.rating}</span>
                </div>
            `).join('');
        }

        const metricsContainer = document.querySelector('[data-pg-metrics]');
        if (metricsContainer && data.analytics) {
            metricsContainer.innerHTML = `
                <div class="metric">
                    <label>Avg Velocity</label>
                    <value>${data.analytics.velocityTrends?.avg2025 || 0} mph</value>
                    <trend>${data.analytics.velocityTrends?.increase || '+0'}</trend>
                </div>
                <div class="metric">
                    <label>Exit Velo</label>
                    <value>${data.analytics.exitVelocityAvg || 0} mph</value>
                </div>
                <div class="metric">
                    <label>60 Yard</label>
                    <value>${data.analytics.sixtyYardDash || 0}s</value>
                </div>
            `;
        }
    }

    // Update Texas HS Football elements
    updateTexasHSElements(data) {
        const teamsContainer = document.querySelector('[data-txhs-teams]');
        if (teamsContainer && data.topTeams) {
            teamsContainer.innerHTML = data.topTeams.map(team => `
                <div class="team-row">
                    <span class="rank">${team.rank}</span>
                    <span class="team">${team.team}</span>
                    <span class="class">${team.classification}</span>
                    <span class="record">${team.record}</span>
                    <span class="result">${team.lastWeek}</span>
                </div>
            `).join('');
        }

        const playersContainer = document.querySelector('[data-txhs-players]');
        if (playersContainer && data.topPlayers) {
            playersContainer.innerHTML = data.topPlayers.map(player => `
                <div class="player-card">
                    <div class="player-name">${player.name}</div>
                    <div class="player-info">
                        <span>${player.position}</span> |
                        <span>${player.school}</span> |
                        <span>Class of ${player.class}</span>
                    </div>
                    <div class="committed">${player.committed}</div>
                </div>
            `).join('');
        }
    }

    // Setup event listeners for user interactions
    setupEventListeners() {
        // Listen for refresh requests
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-refresh]')) {
                const channel = e.target.getAttribute('data-refresh');
                this.forceRefresh(channel);
            }
        });

        // Listen for subscription toggles
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-subscribe]')) {
                const channel = e.target.getAttribute('data-subscribe');
                if (e.target.checked) {
                    this.enableChannel(channel);
                } else {
                    this.disableChannel(channel);
                }
            }
        });
    }

    // Force refresh data for a channel
    async forceRefresh(channel) {
        console.log(`🔄 Force refreshing ${channel} data...`);

        let data;
        switch(channel) {
            case 'mlb':
                data = await this.dataConnector.getCardinalsAnalytics();
                break;
            case 'nfl':
                data = await this.dataConnector.getNFLData();
                break;
            case 'ncaa':
                data = await this.dataConnector.getNCAAfootball();
                break;
            case 'perfectgame':
                data = await this.dataConnector.getPerfectGameData();
                break;
            case 'txhs':
                data = await this.dataConnector.getTexasHSFootball();
                break;
            case 'all':
                data = await this.dataConnector.getAllSportsData();
                this.broadcastUpdate('all', data);
                return;
        }

        if (data) {
            this.broadcastUpdate(channel, data);
        }
    }

    // Enable data channel
    enableChannel(channel) {
        console.log(`✅ Enabling ${channel} data stream`);
        // Channel will start receiving updates on next interval
    }

    // Disable data channel
    disableChannel(channel) {
        console.log(`⏸️ Disabling ${channel} data stream`);
        // Clear subscribers for this channel
        this.subscribers.delete(channel);
    }

    // Get current status
    getStatus() {
        return {
            isRunning: this.isRunning,
            activeChannels: Array.from(this.subscribers.keys()),
            subscriberCount: Array.from(this.subscribers.values()).reduce((sum, set) => sum + set.size, 0),
            updateInterval: this.updateInterval
        };
    }

    // Shutdown handler
    shutdown() {
        console.log('🛑 Shutting down real-time data handler...');
        this.isRunning = false;
        this.subscribers.clear();
        this.connections.forEach(conn => conn.close());
        this.connections.clear();
    }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.blazeRealtimeData = new RealtimeDataHandler();
        window.blazeRealtimeData.initialize();
    });
}