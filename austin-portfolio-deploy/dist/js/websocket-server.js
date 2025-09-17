/**
 * Blaze Intelligence - Production WebSocket Server
 * Real-time sports data broadcasting with sub-100ms latency
 * Championship-level performance for live analytics
 */

const WebSocket = require('ws');
const http = require('http');
const LiveSportsConnector = require('./live-sports-connector.js');

class BlazeWebSocketServer {
    constructor(port = 8080) {
        this.port = port;
        this.server = null;
        this.wss = null;
        this.clients = new Map();
        this.rooms = new Map();
        this.sportsConnector = null;
        this.heartbeatInterval = 30000; // 30 seconds
        this.messageQueue = [];
        this.maxQueueSize = 1000;

        // Performance monitoring
        this.metrics = {
            connections: 0,
            messagesPerSecond: 0,
            averageLatency: 0,
            totalMessages: 0,
            errors: 0,
            startTime: Date.now()
        };

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Blaze Intelligence WebSocket Server...');

            // Create HTTP server
            this.server = http.createServer();

            // Create WebSocket server
            this.wss = new WebSocket.Server({
                server: this.server,
                perMessageDeflate: {
                    zlibDeflateOptions: {
                        chunkSize: 1024,
                        windowBits: 13,
                        level: 3
                    },
                    concurrencyLimit: 10,
                    threshold: 1024
                }
            });

            // Initialize sports data connector
            this.initializeSportsConnector();

            // Set up WebSocket event handlers
            this.setupWebSocketHandlers();

            // Start server
            this.server.listen(this.port, () => {
                console.log(`🏆 Blaze WebSocket Server running on port ${this.port}`);
                console.log(`📊 Real-time sports analytics broadcasting active`);
                console.log(`⚡ Target latency: <100ms for championship performance`);
            });

            // Start monitoring
            this.startPerformanceMonitoring();

        } catch (error) {
            console.error('❌ Failed to initialize WebSocket server:', error);
            throw error;
        }
    }

    initializeSportsConnector() {
        try {
            // Initialize sports data connector
            this.sportsConnector = new LiveSportsConnector();

            // Subscribe to sports data updates
            this.sportsConnector.subscribe('mlb-updated', (data) => {
                this.broadcastToRoom('sports', {
                    type: 'MLB_UPDATE',
                    data: data,
                    timestamp: Date.now()
                });
            });

            this.sportsConnector.subscribe('nfl-updated', (data) => {
                this.broadcastToRoom('sports', {
                    type: 'NFL_UPDATE',
                    data: data,
                    timestamp: Date.now()
                });
            });

            this.sportsConnector.subscribe('nba-updated', (data) => {
                this.broadcastToRoom('sports', {
                    type: 'NBA_UPDATE',
                    data: data,
                    timestamp: Date.now()
                });
            });

            this.sportsConnector.subscribe('college-football-updated', (data) => {
                this.broadcastToRoom('sports', {
                    type: 'COLLEGE_FOOTBALL_UPDATE',
                    data: data,
                    timestamp: Date.now()
                });
            });

            console.log('📡 Sports data connector initialized and subscribed');

        } catch (error) {
            console.error('❌ Failed to initialize sports connector:', error);
        }
    }

    setupWebSocketHandlers() {
        this.wss.on('connection', (ws, request) => {
            const clientId = this.generateClientId();
            const clientInfo = {
                id: clientId,
                socket: ws,
                rooms: new Set(),
                lastPing: Date.now(),
                userAgent: request.headers['user-agent'] || 'Unknown',
                ip: request.headers['x-forwarded-for'] || request.connection.remoteAddress
            };

            this.clients.set(clientId, clientInfo);
            this.metrics.connections++;

            console.log(`🔗 Client connected: ${clientId} (${this.clients.size} total)`);

            // Send welcome message
            this.sendToClient(clientId, {
                type: 'WELCOME',
                clientId: clientId,
                server: 'Blaze Intelligence WebSocket Server',
                version: '2.0.0',
                capabilities: ['real-time-sports', 'analytics', 'notifications'],
                timestamp: Date.now()
            });

            // Set up client event handlers
            ws.on('message', (message) => {
                this.handleClientMessage(clientId, message);
            });

            ws.on('pong', () => {
                const client = this.clients.get(clientId);
                if (client) {
                    client.lastPing = Date.now();
                }
            });

            ws.on('close', (code, reason) => {
                this.handleClientDisconnect(clientId, code, reason);
            });

            ws.on('error', (error) => {
                console.error(`❌ WebSocket error for client ${clientId}:`, error);
                this.metrics.errors++;
            });

            // Auto-join to sports room
            this.joinRoom(clientId, 'sports');
        });

        // Start heartbeat
        this.startHeartbeat();
    }

    handleClientMessage(clientId, rawMessage) {
        try {
            const startTime = Date.now();
            const message = JSON.parse(rawMessage);
            this.metrics.totalMessages++;

            console.log(`📨 Message from ${clientId}:`, message.type);

            switch (message.type) {
                case 'JOIN_ROOM':
                    this.joinRoom(clientId, message.room);
                    break;

                case 'LEAVE_ROOM':
                    this.leaveRoom(clientId, message.room);
                    break;

                case 'GET_SPORTS_DATA':
                    this.sendSportsData(clientId, message.sport);
                    break;

                case 'GET_DASHBOARD_METRICS':
                    this.sendDashboardMetrics(clientId);
                    break;

                case 'PING':
                    this.sendToClient(clientId, {
                        type: 'PONG',
                        timestamp: Date.now(),
                        latency: Date.now() - (message.timestamp || Date.now())
                    });
                    break;

                case 'SUBSCRIBE_NOTIFICATIONS':
                    this.subscribeToNotifications(clientId, message.types);
                    break;

                default:
                    this.sendToClient(clientId, {
                        type: 'ERROR',
                        message: `Unknown message type: ${message.type}`,
                        timestamp: Date.now()
                    });
            }

            // Update latency metrics
            const latency = Date.now() - startTime;
            this.updateLatencyMetrics(latency);

        } catch (error) {
            console.error(`❌ Error handling message from ${clientId}:`, error);
            this.sendToClient(clientId, {
                type: 'ERROR',
                message: 'Invalid message format',
                timestamp: Date.now()
            });
            this.metrics.errors++;
        }
    }

    sendSportsData(clientId, sport = null) {
        try {
            let data;

            if (sport) {
                switch (sport.toLowerCase()) {
                    case 'mlb':
                        data = this.sportsConnector.getMLBData();
                        break;
                    case 'nfl':
                        data = this.sportsConnector.getNFLData();
                        break;
                    case 'nba':
                        data = this.sportsConnector.getNBAData();
                        break;
                    case 'college-football':
                        data = this.sportsConnector.getCollegeFootballData();
                        break;
                    default:
                        data = this.sportsConnector.getAllSportsData();
                }
            } else {
                data = this.sportsConnector.getAllSportsData();
            }

            this.sendToClient(clientId, {
                type: 'SPORTS_DATA',
                sport: sport || 'all',
                data: data,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error(`❌ Error sending sports data to ${clientId}:`, error);
            this.sendToClient(clientId, {
                type: 'ERROR',
                message: 'Failed to retrieve sports data',
                timestamp: Date.now()
            });
        }
    }

    sendDashboardMetrics(clientId) {
        try {
            const metrics = this.sportsConnector.getDashboardMetrics();
            const serverMetrics = this.getServerMetrics();

            this.sendToClient(clientId, {
                type: 'DASHBOARD_METRICS',
                data: {
                    sports: metrics,
                    server: serverMetrics
                },
                timestamp: Date.now()
            });

        } catch (error) {
            console.error(`❌ Error sending dashboard metrics to ${clientId}:`, error);
        }
    }

    joinRoom(clientId, roomName) {
        const client = this.clients.get(clientId);
        if (!client) return;

        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, new Set());
        }

        this.rooms.get(roomName).add(clientId);
        client.rooms.add(roomName);

        console.log(`🏠 Client ${clientId} joined room: ${roomName}`);

        this.sendToClient(clientId, {
            type: 'ROOM_JOINED',
            room: roomName,
            memberCount: this.rooms.get(roomName).size,
            timestamp: Date.now()
        });

        // Send initial data for sports room
        if (roomName === 'sports') {
            this.sendSportsData(clientId);
        }
    }

    leaveRoom(clientId, roomName) {
        const client = this.clients.get(clientId);
        if (!client) return;

        if (this.rooms.has(roomName)) {
            this.rooms.get(roomName).delete(clientId);
            if (this.rooms.get(roomName).size === 0) {
                this.rooms.delete(roomName);
            }
        }

        client.rooms.delete(roomName);

        this.sendToClient(clientId, {
            type: 'ROOM_LEFT',
            room: roomName,
            timestamp: Date.now()
        });
    }

    broadcastToRoom(roomName, message) {
        const room = this.rooms.get(roomName);
        if (!room) return;

        const messageStr = JSON.stringify(message);
        let sentCount = 0;

        room.forEach(clientId => {
            const client = this.clients.get(clientId);
            if (client && client.socket.readyState === WebSocket.OPEN) {
                try {
                    client.socket.send(messageStr);
                    sentCount++;
                } catch (error) {
                    console.error(`❌ Failed to send to client ${clientId}:`, error);
                    this.handleClientDisconnect(clientId, 1006, 'Send failed');
                }
            }
        });

        if (sentCount > 0) {
            console.log(`📢 Broadcasted ${message.type} to ${sentCount} clients in room: ${roomName}`);
        }
    }

    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client || client.socket.readyState !== WebSocket.OPEN) {
            return false;
        }

        try {
            client.socket.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error(`❌ Failed to send to client ${clientId}:`, error);
            this.handleClientDisconnect(clientId, 1006, 'Send failed');
            return false;
        }
    }

    handleClientDisconnect(clientId, code, reason) {
        const client = this.clients.get(clientId);
        if (!client) return;

        // Remove from all rooms
        client.rooms.forEach(roomName => {
            if (this.rooms.has(roomName)) {
                this.rooms.get(roomName).delete(clientId);
                if (this.rooms.get(roomName).size === 0) {
                    this.rooms.delete(roomName);
                }
            }
        });

        // Remove client
        this.clients.delete(clientId);
        this.metrics.connections--;

        console.log(`🔌 Client disconnected: ${clientId} (${this.clients.size} remaining) - Code: ${code}, Reason: ${reason}`);
    }

    startHeartbeat() {
        setInterval(() => {
            const now = Date.now();
            const deadClients = [];

            this.clients.forEach((client, clientId) => {
                if (client.socket.readyState === WebSocket.OPEN) {
                    // Check if client is responsive
                    if (now - client.lastPing > this.heartbeatInterval * 2) {
                        deadClients.push(clientId);
                    } else {
                        // Send ping
                        client.socket.ping();
                    }
                } else {
                    deadClients.push(clientId);
                }
            });

            // Clean up dead clients
            deadClients.forEach(clientId => {
                this.handleClientDisconnect(clientId, 1006, 'Heartbeat timeout');
            });

            if (deadClients.length > 0) {
                console.log(`💔 Cleaned up ${deadClients.length} dead connections`);
            }

        }, this.heartbeatInterval);
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            // Calculate messages per second
            const now = Date.now();
            const uptime = (now - this.metrics.startTime) / 1000;
            this.metrics.messagesPerSecond = this.metrics.totalMessages / uptime;

            // Log performance metrics
            console.log(`📊 Server Performance:`, {
                connections: this.clients.size,
                rooms: this.rooms.size,
                messagesPerSecond: this.metrics.messagesPerSecond.toFixed(2),
                averageLatency: `${this.metrics.averageLatency.toFixed(2)}ms`,
                errors: this.metrics.errors,
                uptime: `${Math.floor(uptime)}s`
            });

        }, 60000); // Every minute
    }

    updateLatencyMetrics(latency) {
        // Simple moving average
        this.metrics.averageLatency = (this.metrics.averageLatency * 0.9) + (latency * 0.1);
    }

    getServerMetrics() {
        const now = Date.now();
        const uptime = (now - this.metrics.startTime) / 1000;

        return {
            connections: this.clients.size,
            rooms: this.rooms.size,
            messagesPerSecond: parseFloat(this.metrics.messagesPerSecond.toFixed(2)),
            averageLatency: parseFloat(this.metrics.averageLatency.toFixed(2)),
            totalMessages: this.metrics.totalMessages,
            errors: this.metrics.errors,
            uptime: Math.floor(uptime),
            memoryUsage: process.memoryUsage(),
            timestamp: now
        };
    }

    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Graceful shutdown
    async shutdown() {
        console.log('🔄 Shutting down WebSocket server...');

        // Notify all clients
        this.clients.forEach((client, clientId) => {
            this.sendToClient(clientId, {
                type: 'SERVER_SHUTDOWN',
                message: 'Server is shutting down',
                timestamp: Date.now()
            });
        });

        // Close all connections
        this.wss.close(() => {
            console.log('✅ WebSocket server shutdown complete');
        });

        // Close HTTP server
        this.server.close(() => {
            console.log('✅ HTTP server shutdown complete');
        });
    }
}

// Start server if run directly
if (require.main === module) {
    const port = process.env.PORT || 8080;
    const server = new BlazeWebSocketServer(port);

    // Graceful shutdown handlers
    process.on('SIGTERM', () => server.shutdown());
    process.on('SIGINT', () => server.shutdown());
}

module.exports = BlazeWebSocketServer;