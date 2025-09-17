/**
 * Blaze Intelligence - Enhanced WebSocket Client
 * Championship-level real-time sports data streaming with <100ms latency
 * Production-ready with auto-reconnection and comprehensive error handling
 */

class BlazeWebSocketClient {
    constructor(serverUrl = null) {
        // Smart server URL detection
        this.serverUrl = serverUrl || this.detectServerUrl();
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.heartbeatInterval = 30000; // 30 seconds
        this.heartbeatTimer = null;

        // Event listeners
        this.listeners = new Map();

        // Message queue for offline messages
        this.messageQueue = [];
        this.maxQueueSize = 100;

        // Connection state
        this.clientId = null;
        this.joinedRooms = new Set();

        // Performance tracking
        this.metrics = {
            messagesReceived: 0,
            messagesSent: 0,
            averageLatency: 0,
            connectionUptime: 0,
            lastConnectionTime: null,
            targetLatency: 100 // Championship target: <100ms
        };

        // Dashboard integration
        this.dashboardCallbacks = new Map();

        this.init();
    }

    detectServerUrl() {
        // Production environment detection
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

            // Production URLs for Blaze Intelligence
            if (hostname.includes('blaze-intelligence.netlify.app')) {
                return 'wss://hawkeye-mcp.onrender.com/ws'; // Production WebSocket
            } else if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
                return 'ws://localhost:8080'; // Local development
            } else {
                return `${protocol}//${hostname}:8080`; // Default port
            }
        }

        return 'ws://localhost:8080'; // Fallback
    }

    init() {
        console.log('🚀 Initializing Blaze Intelligence WebSocket Client...');
        console.log('🎯 Target Performance: <100ms latency for championship analytics');
        this.connect();
    }

    connect() {
        try {
            console.log(`🔌 Connecting to WebSocket server: ${this.serverUrl}`);

            this.socket = new WebSocket(this.serverUrl);

            this.socket.onopen = this.handleOpen.bind(this);
            this.socket.onmessage = this.handleMessage.bind(this);
            this.socket.onclose = this.handleClose.bind(this);
            this.socket.onerror = this.handleError.bind(this);

        } catch (error) {
            console.error('❌ Failed to create WebSocket connection:', error);
            this.scheduleReconnect();
        }
    }

    handleOpen(event) {
        console.log('✅ WebSocket connection established - Championship analytics live!');

        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.metrics.lastConnectionTime = Date.now();

        // Start heartbeat
        this.startHeartbeat();

        // Process queued messages
        this.processMessageQueue();

        // Emit connection event
        this.emit('connected', { timestamp: Date.now() });

        // Update dashboard status
        this.updateDashboardStatus('connected');
    }

    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            this.metrics.messagesReceived++;

            // Calculate message latency if timestamp provided
            if (message.timestamp) {
                const latency = Date.now() - message.timestamp;
                this.updateLatencyMetrics(latency);

                // Log if exceeding championship standards
                if (latency > this.metrics.targetLatency) {
                    console.warn(`⚠️ Latency warning: ${latency}ms (target: <${this.metrics.targetLatency}ms)`);
                }
            }

            console.log(`📨 Received ${message.type} (${this.metrics.averageLatency.toFixed(1)}ms avg latency)`);

            switch (message.type) {
                case 'WELCOME':
                    this.handleWelcome(message);
                    break;

                case 'MLB_UPDATE':
                    this.emit('mlb-data', message.data);
                    this.updateDashboard('mlb', message.data);
                    break;

                case 'NFL_UPDATE':
                    this.emit('nfl-data', message.data);
                    this.updateDashboard('nfl', message.data);
                    break;

                case 'NBA_UPDATE':
                    this.emit('nba-data', message.data);
                    this.updateDashboard('nba', message.data);
                    break;

                case 'COLLEGE_FOOTBALL_UPDATE':
                    this.emit('college-football-data', message.data);
                    this.updateDashboard('college-football', message.data);
                    break;

                case 'SPORTS_DATA':
                    this.emit('sports-data', message.data);
                    this.updateDashboard('all-sports', message.data);
                    break;

                case 'DASHBOARD_METRICS':
                    this.emit('dashboard-metrics', message.data);
                    this.updateDashboard('metrics', message.data);
                    break;

                case 'PONG':
                    this.handlePong(message);
                    break;

                case 'ROOM_JOINED':
                    this.joinedRooms.add(message.room);
                    this.emit('room-joined', message);
                    console.log(`🏠 Joined room: ${message.room} (${message.memberCount} members)`);
                    break;

                case 'ROOM_LEFT':
                    this.joinedRooms.delete(message.room);
                    this.emit('room-left', message);
                    break;

                case 'ERROR':
                    console.error('❌ Server error:', message.message);
                    this.emit('error', message);
                    this.updateDashboardStatus('error', message.message);
                    break;

                case 'SERVER_SHUTDOWN':
                    console.warn('⚠️ Server is shutting down');
                    this.emit('server-shutdown', message);
                    this.updateDashboardStatus('shutdown');
                    break;

                default:
                    console.warn('Unknown message type:', message.type);
                    this.emit('unknown-message', message);
            }

        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    }

    handleWelcome(message) {
        this.clientId = message.clientId;
        console.log(`🎉 Welcome! Client ID: ${this.clientId}`);
        console.log(`🏆 Server: ${message.server} v${message.version}`);
        console.log(`⚡ Capabilities: ${message.capabilities?.join(', ')}`);

        // Auto-join sports room for real-time updates
        this.joinRoom('sports');

        // Request initial data
        setTimeout(() => {
            this.getSportsData();
            this.getDashboardMetrics();
        }, 1000);

        this.emit('welcome', message);
        this.updateDashboardStatus('ready');
    }

    handlePong(message) {
        if (message.latency !== undefined) {
            this.updateLatencyMetrics(message.latency);

            // Update dashboard latency display
            this.updateDashboard('latency', {
                current: message.latency,
                average: this.metrics.averageLatency,
                target: this.metrics.targetLatency
            });
        }
    }

    handleClose(event) {
        console.log(`🔌 WebSocket connection closed: ${event.code} - ${event.reason}`);

        this.isConnected = false;
        this.clientId = null;
        this.joinedRooms.clear();

        // Stop heartbeat
        this.stopHeartbeat();

        // Calculate uptime
        if (this.metrics.lastConnectionTime) {
            this.metrics.connectionUptime += Date.now() - this.metrics.lastConnectionTime;
        }

        // Emit disconnection event
        this.emit('disconnected', {
            code: event.code,
            reason: event.reason,
            timestamp: Date.now()
        });

        // Update dashboard status
        this.updateDashboardStatus('disconnected', event.reason);

        // Attempt to reconnect unless it was a normal closure
        if (event.code !== 1000) {
            this.scheduleReconnect();
        }
    }

    handleError(error) {
        console.error('❌ WebSocket error:', error);
        this.emit('error', { error: error.message, timestamp: Date.now() });
        this.updateDashboardStatus('error', error.message);
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached. Championship connection failed.');
            this.emit('max-reconnect-attempts', { attempts: this.reconnectAttempts });
            this.updateDashboardStatus('failed', 'Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;

        console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);
        this.updateDashboardStatus('reconnecting', `Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);

        // Exponential backoff with jitter
        this.reconnectDelay = Math.min(
            this.reconnectDelay * 2 + (Math.random() * 1000),
            this.maxReconnectDelay
        );
    }

    send(message) {
        if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify(message));
                this.metrics.messagesSent++;
                return true;
            } catch (error) {
                console.error('❌ Failed to send message:', error);
                this.queueMessage(message);
                return false;
            }
        } else {
            this.queueMessage(message);
            return false;
        }
    }

    queueMessage(message) {
        if (this.messageQueue.length >= this.maxQueueSize) {
            this.messageQueue.shift(); // Remove oldest message
        }

        this.messageQueue.push(message);
        console.log(`📦 Message queued (${this.messageQueue.length}/${this.maxQueueSize})`);
    }

    processMessageQueue() {
        if (this.messageQueue.length === 0) return;

        console.log(`📤 Processing ${this.messageQueue.length} queued messages`);

        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    // Public API methods
    joinRoom(roomName) {
        return this.send({
            type: 'JOIN_ROOM',
            room: roomName,
            timestamp: Date.now()
        });
    }

    leaveRoom(roomName) {
        return this.send({
            type: 'LEAVE_ROOM',
            room: roomName,
            timestamp: Date.now()
        });
    }

    getSportsData(sport = null) {
        return this.send({
            type: 'GET_SPORTS_DATA',
            sport: sport,
            timestamp: Date.now()
        });
    }

    getDashboardMetrics() {
        return this.send({
            type: 'GET_DASHBOARD_METRICS',
            timestamp: Date.now()
        });
    }

    ping() {
        return this.send({
            type: 'PING',
            timestamp: Date.now()
        });
    }

    subscribeToNotifications(types = []) {
        return this.send({
            type: 'SUBSCRIBE_NOTIFICATIONS',
            types: types,
            timestamp: Date.now()
        });
    }

    // Dashboard integration methods
    registerDashboardCallback(type, callback) {
        if (!this.dashboardCallbacks.has(type)) {
            this.dashboardCallbacks.set(type, new Set());
        }
        this.dashboardCallbacks.get(type).add(callback);

        return () => {
            this.dashboardCallbacks.get(type)?.delete(callback);
        };
    }

    updateDashboard(type, data) {
        const callbacks = this.dashboardCallbacks.get(type);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in dashboard callback for ${type}:`, error);
                }
            });
        }
    }

    updateDashboardStatus(status, message = '') {
        const statusData = {
            status,
            message,
            timestamp: Date.now(),
            isConnected: this.isConnected,
            clientId: this.clientId,
            latency: this.metrics.averageLatency
        };

        this.updateDashboard('connection-status', statusData);
    }

    // Heartbeat management
    startHeartbeat() {
        this.stopHeartbeat(); // Clear any existing timer

        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected) {
                this.ping();
            }
        }, this.heartbeatInterval);

        console.log(`💓 Heartbeat started (${this.heartbeatInterval/1000}s interval)`);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        return () => {
            this.listeners.get(event)?.delete(callback);
        };
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

    // Performance metrics
    updateLatencyMetrics(latency) {
        // Exponential moving average for smoother metrics
        this.metrics.averageLatency = (this.metrics.averageLatency * 0.9) + (latency * 0.1);
    }

    getMetrics() {
        const now = Date.now();
        const currentUptime = this.metrics.lastConnectionTime
            ? now - this.metrics.lastConnectionTime
            : 0;

        return {
            ...this.metrics,
            currentUptime: currentUptime,
            totalUptime: this.metrics.connectionUptime + currentUptime,
            isConnected: this.isConnected,
            clientId: this.clientId,
            joinedRooms: Array.from(this.joinedRooms),
            queuedMessages: this.messageQueue.length,
            performanceGrade: this.getPerformanceGrade()
        };
    }

    getPerformanceGrade() {
        if (!this.isConnected) return 'F';
        if (this.metrics.averageLatency < 50) return 'A+';
        if (this.metrics.averageLatency < 100) return 'A';
        if (this.metrics.averageLatency < 200) return 'B';
        if (this.metrics.averageLatency < 500) return 'C';
        return 'D';
    }

    // Connection management
    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'Client disconnect');
        }
    }

    reconnect() {
        console.log('🔄 Manual reconnection initiated');
        this.disconnect();
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        setTimeout(() => this.connect(), 1000);
    }

    // Utility methods for dashboard integration
    isChampionshipPerformance() {
        return this.isConnected && this.metrics.averageLatency < this.metrics.targetLatency;
    }

    getConnectionHealth() {
        if (!this.isConnected) return 'poor';
        if (this.metrics.averageLatency < 50) return 'excellent';
        if (this.metrics.averageLatency < 100) return 'good';
        if (this.metrics.averageLatency < 200) return 'fair';
        return 'poor';
    }
}

// Global exports
if (typeof window !== 'undefined') {
    window.BlazeWebSocketClient = BlazeWebSocketClient;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeWebSocketClient;
}

export default BlazeWebSocketClient;