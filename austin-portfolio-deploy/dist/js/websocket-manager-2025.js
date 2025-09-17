/**
 * WebSocket Manager for Real-Time Sports Updates
 * Blaze Intelligence Championship Platform
 * October 15, 2025
 */

class WebSocketManager2025 {
    constructor(config = {}) {
        this.config = {
            url: config.url || 'wss://blaze-intelligence.netlify.app/ws',
            reconnectInterval: config.reconnectInterval || 5000,
            maxReconnectAttempts: config.maxReconnectAttempts || 10,
            heartbeatInterval: config.heartbeatInterval || 30000,
            debug: config.debug || false
        };

        this.ws = null;
        this.reconnectAttempts = 0;
        this.isConnected = false;
        this.subscriptions = new Map();
        this.pendingMessages = [];
        this.heartbeatTimer = null;
        this.reconnectTimer = null;

        // Data update intervals by sport
        this.updateIntervals = {
            nfl: 10000,    // 10 seconds
            mlb: 10000,    // 10 seconds
            nba: 15000,    // 15 seconds
            ncaa: 20000,   // 20 seconds
            hs: 30000,     // 30 seconds
            perfectGame: 30000  // 30 seconds
        };

        // Initialize connection
        this.connect();
    }

    connect() {
        try {
            // For now, simulate WebSocket with polling since no server is deployed
            // This will be replaced with actual WebSocket when server is ready
            this.simulateWebSocket();

            if (this.config.debug) {
                console.log('WebSocket Manager initialized (simulation mode)');
            }

            // Start heartbeat
            this.startHeartbeat();

            // Set connected status
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // Notify subscribers of connection
            this.emit('connection', { status: 'connected', mode: 'simulation' });

            // Process any pending messages
            this.processPendingMessages();

        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.scheduleReconnect();
        }
    }

    simulateWebSocket() {
        // Simulate real-time updates using polling
        // This allows the dashboard to work without a WebSocket server

        // NFL Updates (10 seconds)
        setInterval(() => {
            if (this.hasSubscribers('nfl')) {
                this.simulateNFLUpdate();
            }
        }, this.updateIntervals.nfl);

        // MLB Updates (10 seconds)
        setInterval(() => {
            if (this.hasSubscribers('mlb')) {
                this.simulateMLBUpdate();
            }
        }, this.updateIntervals.mlb);

        // NBA Updates (15 seconds)
        setInterval(() => {
            if (this.hasSubscribers('nba')) {
                this.simulateNBAUpdate();
            }
        }, this.updateIntervals.nba);

        // NCAA Updates (20 seconds)
        setInterval(() => {
            if (this.hasSubscribers('ncaa')) {
                this.simulateNCAAUpdate();
            }
        }, this.updateIntervals.ncaa);
    }

    simulateNFLUpdate() {
        const update = {
            type: 'nfl_update',
            timestamp: new Date().toISOString(),
            week: 7,
            games: [
                {
                    home: 'HOU',
                    away: 'GB',
                    homeScore: Math.floor(Math.random() * 7) + 21,
                    awayScore: Math.floor(Math.random() * 7) + 17,
                    quarter: Math.min(Math.floor(Math.random() * 4) + 1, 4),
                    time: Math.floor(Math.random() * 15) + ':' + Math.floor(Math.random() * 60).toString().padStart(2, '0'),
                    possession: Math.random() > 0.5 ? 'HOU' : 'GB'
                },
                {
                    home: 'ARI',
                    away: 'LAC',
                    homeScore: Math.floor(Math.random() * 7) + 14,
                    awayScore: Math.floor(Math.random() * 7) + 20,
                    quarter: Math.min(Math.floor(Math.random() * 4) + 1, 4),
                    time: Math.floor(Math.random() * 15) + ':' + Math.floor(Math.random() * 60).toString().padStart(2, '0'),
                    possession: Math.random() > 0.5 ? 'ARI' : 'LAC'
                }
            ],
            standings: {
                'HOU': { wins: 5, losses: 1, pct: 0.833 },
                'TEN': { wins: 1, losses: 5, pct: 0.167 },
                'ARI': { wins: 2, losses: 4, pct: 0.333 }
            }
        };

        this.emit('nfl', update);
    }

    simulateMLBUpdate() {
        const update = {
            type: 'mlb_update',
            timestamp: new Date().toISOString(),
            worldSeries: {
                game: 5,
                series: 'LAD leads 3-1',
                home: 'NYY',
                away: 'LAD',
                homeScore: Math.floor(Math.random() * 4) + 2,
                awayScore: Math.floor(Math.random() * 4) + 3,
                inning: Math.min(Math.floor(Math.random() * 9) + 1, 9),
                topBottom: Math.random() > 0.5 ? 'Top' : 'Bottom',
                outs: Math.floor(Math.random() * 3),
                runners: {
                    first: Math.random() > 0.7,
                    second: Math.random() > 0.8,
                    third: Math.random() > 0.9
                }
            },
            pitching: {
                'LAD': { pitcher: 'Walker Buehler', ip: 5.2, h: 4, r: 2, er: 2, bb: 1, k: 7 },
                'NYY': { pitcher: 'Gerrit Cole', ip: 6.0, h: 5, r: 3, er: 3, bb: 2, k: 8 }
            }
        };

        this.emit('mlb', update);
    }

    simulateNBAUpdate() {
        const update = {
            type: 'nba_update',
            timestamp: new Date().toISOString(),
            preseason: true,
            games: [
                {
                    home: 'MEM',
                    away: 'CHI',
                    homeScore: Math.floor(Math.random() * 20) + 95,
                    awayScore: Math.floor(Math.random() * 20) + 90,
                    quarter: Math.min(Math.floor(Math.random() * 4) + 1, 4),
                    time: Math.floor(Math.random() * 12) + ':' + Math.floor(Math.random() * 60).toString().padStart(2, '0'),
                    leaders: {
                        'MEM': { player: 'Ja Morant', pts: 24, ast: 7, reb: 5 },
                        'CHI': { player: 'Zach LaVine', pts: 22, ast: 4, reb: 3 }
                    }
                }
            ],
            standings: {
                'MEM': { preseasonWins: 3, preseasonLosses: 1 },
                'CHI': { preseasonWins: 2, preseasonLosses: 2 }
            }
        };

        this.emit('nba', update);
    }

    simulateNCAAUpdate() {
        const update = {
            type: 'ncaa_update',
            timestamp: new Date().toISOString(),
            week: 8,
            top25: [
                { rank: 1, team: 'Georgia', record: '7-0', nextGame: 'vs Florida' },
                { rank: 2, team: 'Michigan', record: '7-0', nextGame: '@ Michigan State' },
                { rank: 3, team: 'Ohio State', record: '6-1', nextGame: 'vs Penn State' },
                { rank: 7, team: 'Texas', record: '6-1', nextGame: '@ Houston' }
            ],
            texasGame: {
                opponent: 'Houston',
                location: 'Away',
                time: 'Saturday 3:30 PM ET',
                spread: 'TEX -14.5',
                ou: '52.5'
            }
        };

        this.emit('ncaa', update);
    }

    subscribe(channel, callback) {
        if (!this.subscriptions.has(channel)) {
            this.subscriptions.set(channel, new Set());
        }
        this.subscriptions.get(channel).add(callback);

        if (this.config.debug) {
            console.log(`Subscribed to channel: ${channel}`);
        }

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscriptions.get(channel);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.subscriptions.delete(channel);
                }
            }
        };
    }

    unsubscribe(channel, callback) {
        const callbacks = this.subscriptions.get(channel);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.subscriptions.delete(channel);
            }
        }
    }

    hasSubscribers(channel) {
        return this.subscriptions.has(channel) && this.subscriptions.get(channel).size > 0;
    }

    emit(channel, data) {
        const callbacks = this.subscriptions.get(channel);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in subscription callback for ${channel}:`, error);
                }
            });
        }

        // Also emit to wildcard subscribers
        const wildcardCallbacks = this.subscriptions.get('*');
        if (wildcardCallbacks) {
            wildcardCallbacks.forEach(callback => {
                try {
                    callback({ channel, data });
                } catch (error) {
                    console.error('Error in wildcard subscription callback:', error);
                }
            });
        }
    }

    send(message) {
        if (this.isConnected) {
            // In simulation mode, just log the message
            if (this.config.debug) {
                console.log('Would send message:', message);
            }
        } else {
            // Queue message for when connection is established
            this.pendingMessages.push(message);
        }
    }

    processPendingMessages() {
        while (this.pendingMessages.length > 0) {
            const message = this.pendingMessages.shift();
            this.send(message);
        }
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected) {
                this.send({ type: 'ping', timestamp: Date.now() });
            }
        }, this.config.heartbeatInterval);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.emit('connection', { status: 'failed', attempts: this.reconnectAttempts });
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.config.reconnectInterval * this.reconnectAttempts, 30000);

        if (this.config.debug) {
            console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
        }

        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }

    disconnect() {
        this.isConnected = false;

        // Clear timers
        this.stopHeartbeat();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // Clear subscriptions
        this.subscriptions.clear();

        // Notify subscribers
        this.emit('connection', { status: 'disconnected' });

        if (this.config.debug) {
            console.log('WebSocket disconnected');
        }
    }

    // Get connection status
    getStatus() {
        return {
            connected: this.isConnected,
            mode: 'simulation',
            reconnectAttempts: this.reconnectAttempts,
            subscriberCount: Array.from(this.subscriptions.values()).reduce((sum, set) => sum + set.size, 0),
            channels: Array.from(this.subscriptions.keys())
        };
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };

        if (newConfig.url && this.isConnected) {
            // Reconnect with new URL
            this.disconnect();
            this.connect();
        }
    }
}

// Create singleton instance
const wsManager = new WebSocketManager2025({
    debug: true,
    reconnectInterval: 5000,
    heartbeatInterval: 30000
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketManager2025;
} else if (typeof window !== 'undefined') {
    window.WebSocketManager2025 = WebSocketManager2025;
    window.wsManager = wsManager;
}