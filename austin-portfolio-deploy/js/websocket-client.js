/**
 * Blaze Intelligence - WebSocket Client Infrastructure
 * Real-time event broadcasting with auto-reconnection logic
 * Connects to dashboard components for live updates
 */

class BlazeWebSocketClient {
    constructor(options = {}) {
        this.config = {
            url: options.url || this.getWebSocketURL(),
            protocols: options.protocols || ['blaze-intelligence-v1'],
            reconnectInterval: options.reconnectInterval || 3000,
            maxReconnectAttempts: options.maxReconnectAttempts || 10,
            heartbeatInterval: options.heartbeatInterval || 30000,
            connectionTimeout: options.connectionTimeout || 10000,
            ...options
        };

        this.state = {
            socket: null,
            isConnected: false,
            isConnecting: false,
            reconnectAttempts: 0,
            lastHeartbeat: null,
            sessionId: null,
            connectionId: this.generateConnectionId()
        };

        this.listeners = new Map();
        this.messageQueue = [];
        this.heartbeatTimer = null;
        this.reconnectTimer = null;

        // Event types for Blaze Intelligence platform
        this.eventTypes = {
            // Sports data events
            MLB_UPDATE: 'mlb-update',
            NFL_UPDATE: 'nfl-update',
            NBA_UPDATE: 'nba-update',
            COLLEGE_FOOTBALL_UPDATE: 'college-football-update',
            GAME_START: 'game-start',
            GAME_END: 'game-end',
            SCORE_UPDATE: 'score-update',

            // Analytics events
            ANALYTICS_UPDATE: 'analytics-update',
            PERFORMANCE_METRIC: 'performance-metric',
            REAL_TIME_STAT: 'real-time-stat',

            // Platform events
            CONNECTION_STATUS: 'connection-status',
            HEARTBEAT: 'heartbeat',
            ERROR: 'error',
            NOTIFICATION: 'notification',

            // Dashboard events
            DASHBOARD_UPDATE: 'dashboard-update',
            WIDGET_REFRESH: 'widget-refresh',
            USER_ACTION: 'user-action'
        };

        this.init();
    }

    init() {
        console.log('🚀 Initializing Blaze Intelligence WebSocket Client...');
        this.connect();

        // Handle page visibility changes
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible' && !this.state.isConnected) {
                    this.connect();
                }
            });
        }

        // Handle network connectivity changes
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                console.log('🌐 Network came back online, reconnecting...');
                this.connect();
            });

            window.addEventListener('offline', () => {
                console.log('📡 Network went offline');
                this.disconnect();
            });
        }
    }

    getWebSocketURL() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = window.location.port;

        // Production URLs
        if (host.includes('netlify.app') || host.includes('blaze-intelligence')) {
            return 'wss://blaze-websocket.herokuapp.com/ws';
        }

        // Development URL
        return `${protocol}//${host}:${port || 8080}/ws`;
    }

    connect() {
        if (this.state.isConnecting || this.state.isConnected) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                this.state.isConnecting = true;
                console.log(`🔌 Connecting to WebSocket: ${this.config.url}`);

                this.state.socket = new WebSocket(this.config.url, this.config.protocols);
                this.state.socket.binaryType = 'arraybuffer';

                // Connection timeout
                const timeoutId = setTimeout(() => {
                    if (this.state.isConnecting) {
                        console.warn('⏰ WebSocket connection timeout');
                        this.state.socket?.close();
                        reject(new Error('Connection timeout'));
                    }
                }, this.config.connectionTimeout);

                this.state.socket.onopen = (event) => {
                    clearTimeout(timeoutId);
                    this.state.isConnecting = false;
                    this.state.isConnected = true;
                    this.state.reconnectAttempts = 0;
                    this.state.sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);

                    console.log('✅ WebSocket connected successfully');

                    // Send initial handshake
                    this.send({
                        type: 'handshake',
                        connectionId: this.state.connectionId,
                        platform: 'blaze-intelligence',
                        version: '1.0.0',
                        timestamp: Date.now()
                    });

                    // Start heartbeat
                    this.startHeartbeat();

                    // Process queued messages
                    this.processMessageQueue();

                    // Emit connection event
                    this.emit(this.eventTypes.CONNECTION_STATUS, {
                        status: 'connected',
                        sessionId: this.state.sessionId,
                        timestamp: Date.now()
                    });

                    resolve();
                };

                this.state.socket.onmessage = (event) => {
                    this.handleMessage(event);
                };

                this.state.socket.onclose = (event) => {
                    clearTimeout(timeoutId);
                    this.state.isConnecting = false;
                    this.state.isConnected = false;
                    this.stopHeartbeat();

                    console.log(`🔌 WebSocket disconnected: ${event.code} - ${event.reason}`);

                    this.emit(this.eventTypes.CONNECTION_STATUS, {
                        status: 'disconnected',
                        code: event.code,
                        reason: event.reason,
                        timestamp: Date.now()
                    });

                    // Attempt reconnection if not intentional
                    if (event.code !== 1000 && this.state.reconnectAttempts < this.config.maxReconnectAttempts) {
                        this.scheduleReconnect();
                    }

                    if (this.state.isConnecting) {
                        reject(new Error(`Connection failed: ${event.code} - ${event.reason}`));
                    }
                };

                this.state.socket.onerror = (error) => {
                    clearTimeout(timeoutId);
                    console.error('❌ WebSocket error:', error);

                    this.emit(this.eventTypes.ERROR, {
                        type: 'websocket-error',
                        error: error.message || 'Unknown WebSocket error',
                        timestamp: Date.now()
                    });

                    if (this.state.isConnecting) {
                        reject(error);
                    }
                };

            } catch (error) {
                this.state.isConnecting = false;
                console.error('❌ Failed to create WebSocket connection:', error);
                reject(error);
            }
        });
    }

    disconnect() {
        this.stopHeartbeat();
        this.clearReconnectTimer();

        if (this.state.socket) {
            this.state.socket.close(1000, 'Client disconnect');
            this.state.socket = null;
        }

        this.state.isConnected = false;
        this.state.isConnecting = false;
        this.state.sessionId = null;
    }

    send(data) {
        if (!this.state.isConnected || !this.state.socket) {
            console.warn('📤 Queuing message - WebSocket not connected');
            this.messageQueue.push({
                data,
                timestamp: Date.now()
            });
            return;
        }

        try {
            const message = JSON.stringify({
                ...data,
                connectionId: this.state.connectionId,
                sessionId: this.state.sessionId,
                timestamp: Date.now()
            });

            this.state.socket.send(message);

        } catch (error) {
            console.error('❌ Failed to send WebSocket message:', error);
            this.emit(this.eventTypes.ERROR, {
                type: 'send-error',
                error: error.message,
                data,
                timestamp: Date.now()
            });
        }
    }

    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);

            // Update last heartbeat
            if (message.type === 'heartbeat') {
                this.state.lastHeartbeat = Date.now();
                return;
            }

            // Emit to listeners
            this.emit(message.type, message);

            // Handle specific message types
            switch (message.type) {
                case 'handshake-ack':
                    console.log('🤝 Handshake acknowledged by server');
                    break;

                case 'sports-update':
                    this.handleSportsUpdate(message);
                    break;

                case 'analytics-update':
                    this.handleAnalyticsUpdate(message);
                    break;

                case 'dashboard-update':
                    this.handleDashboardUpdate(message);
                    break;

                case 'notification':
                    this.handleNotification(message);
                    break;

                case 'error':
                    console.error('🚨 Server error:', message.error);
                    break;

                default:
                    console.log('📨 Received message:', message.type, message);
            }

        } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error, event.data);
        }
    }

    handleSportsUpdate(message) {
        const { sport, data } = message;

        // Route to appropriate event type
        switch (sport) {
            case 'mlb':
                this.emit(this.eventTypes.MLB_UPDATE, data);
                break;
            case 'nfl':
                this.emit(this.eventTypes.NFL_UPDATE, data);
                break;
            case 'nba':
                this.emit(this.eventTypes.NBA_UPDATE, data);
                break;
            case 'college-football':
                this.emit(this.eventTypes.COLLEGE_FOOTBALL_UPDATE, data);
                break;
        }

        // Update connected sports connector if available
        if (window.blazeSportsConnector) {
            window.blazeSportsConnector.emit(`${sport}-updated`, data);
        }
    }

    handleAnalyticsUpdate(message) {
        this.emit(this.eventTypes.ANALYTICS_UPDATE, message.data);

        // Update performance monitoring if available
        if (window.blazePerformanceMonitor) {
            window.blazePerformanceMonitor.recordMetric(message.data);
        }
    }

    handleDashboardUpdate(message) {
        this.emit(this.eventTypes.DASHBOARD_UPDATE, message.data);

        // Trigger dashboard refresh
        const event = new CustomEvent('blaze-dashboard-update', {
            detail: message.data
        });
        document.dispatchEvent(event);
    }

    handleNotification(message) {
        this.emit(this.eventTypes.NOTIFICATION, message);

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(message.title || 'Blaze Intelligence', {
                body: message.message,
                icon: '/favicon.ico',
                tag: 'blaze-notification'
            });
        }
    }

    scheduleReconnect() {
        this.clearReconnectTimer();

        const delay = Math.min(
            this.config.reconnectInterval * Math.pow(2, this.state.reconnectAttempts),
            30000 // Max 30 seconds
        );

        console.log(`🔄 Scheduling reconnect in ${delay}ms (attempt ${this.state.reconnectAttempts + 1}/${this.config.maxReconnectAttempts})`);

        this.reconnectTimer = setTimeout(() => {
            this.state.reconnectAttempts++;
            this.connect();
        }, delay);
    }

    clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    startHeartbeat() {
        this.stopHeartbeat();

        this.heartbeatTimer = setInterval(() => {
            if (this.state.isConnected) {
                this.send({
                    type: 'heartbeat',
                    timestamp: Date.now()
                });
            }
        }, this.config.heartbeatInterval);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const { data } = this.messageQueue.shift();
            this.send(data);
        }
    }

    generateConnectionId() {
        return 'blaze_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        return () => this.off(event, callback);
    }

    off(event, callback) {
        this.listeners.get(event)?.delete(callback);
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in ${event} callback:`, error);
                }
            });
        }
    }

    // Public API methods
    subscribe(event, callback) {
        return this.on(event, callback);
    }

    unsubscribe(event, callback) {
        this.off(event, callback);
    }

    broadcast(type, data) {
        this.send({
            type: 'broadcast',
            eventType: type,
            data
        });
    }

    joinRoom(roomId) {
        this.send({
            type: 'join-room',
            roomId
        });
    }

    leaveRoom(roomId) {
        this.send({
            type: 'leave-room',
            roomId
        });
    }

    // Dashboard integration methods
    subscribeToSportsUpdates(callback) {
        const unsubscribers = [
            this.on(this.eventTypes.MLB_UPDATE, callback),
            this.on(this.eventTypes.NFL_UPDATE, callback),
            this.on(this.eventTypes.NBA_UPDATE, callback),
            this.on(this.eventTypes.COLLEGE_FOOTBALL_UPDATE, callback)
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }

    subscribeToAnalytics(callback) {
        return this.on(this.eventTypes.ANALYTICS_UPDATE, callback);
    }

    subscribeToPerformanceMetrics(callback) {
        return this.on(this.eventTypes.PERFORMANCE_METRIC, callback);
    }

    // Status methods
    getConnectionStatus() {
        return {
            isConnected: this.state.isConnected,
            isConnecting: this.state.isConnecting,
            sessionId: this.state.sessionId,
            connectionId: this.state.connectionId,
            reconnectAttempts: this.state.reconnectAttempts,
            lastHeartbeat: this.state.lastHeartbeat,
            queuedMessages: this.messageQueue.length
        };
    }

    isHealthy() {
        if (!this.state.isConnected) return false;
        if (!this.state.lastHeartbeat) return true; // Just connected

        const timeSinceHeartbeat = Date.now() - this.state.lastHeartbeat;
        return timeSinceHeartbeat < this.config.heartbeatInterval * 2;
    }
}

// WebSocket Server Fallback (for development)
class BlazeWebSocketServerFallback {
    constructor(port = 8080) {
        this.port = port;
        this.clients = new Set();
        this.server = null;
    }

    start() {
        // This would be implemented server-side
        console.log('🚀 Starting WebSocket server fallback on port', this.port);
    }

    broadcast(message) {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
}

// Global instances
window.BlazeWebSocketClient = BlazeWebSocketClient;

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.blazeWebSocket = new BlazeWebSocketClient();

    // Expose for dashboard integration
    window.subscribeToBlazeUpdates = (callback) => {
        return window.blazeWebSocket.subscribeToSportsUpdates(callback);
    };

    window.subscribeToBlazeAnalytics = (callback) => {
        return window.blazeWebSocket.subscribeToAnalytics(callback);
    };

    window.getBlazeConnectionStatus = () => {
        return window.blazeWebSocket.getConnectionStatus();
    };
}

export default BlazeWebSocketClient;