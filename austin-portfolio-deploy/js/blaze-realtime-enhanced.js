/**
 * Blaze Intelligence Enhanced Real-Time Synchronization System
 * Advanced WebSocket + polling fallback with intelligent caching
 */

class BlazeRealtimeEnhanced {
    constructor(config = {}) {
        this.config = {
            websocketURL: config.websocketURL || 'wss://stream.blaze-intelligence.pages.dev/v2/live',
            fallbackURL: config.fallbackURL || '/api/enhanced-gateway',
            reconnectInterval: config.reconnectInterval || 3000,
            maxReconnectAttempts: config.maxReconnectAttempts || 15,
            heartbeatInterval: config.heartbeatInterval || 25000,
            pollingInterval: config.pollingInterval || 10000,
            cacheTimeout: config.cacheTimeout || 30000,
            enableCompression: config.enableCompression || true,
            batchUpdates: config.batchUpdates || true,
            ...config
        };

        // Connection state
        this.websocket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.connectionState = 'disconnected'; // disconnected, connecting, connected, error
        this.lastConnectionAttempt = 0;
        
        // Data management
        this.cache = new Map();
        this.subscriptions = new Set();
        this.listeners = new Map();
        this.pendingUpdates = new Map();
        this.messageQueue = [];
        
        // Performance tracking
        this.metrics = {
            messagesReceived: 0,
            messagesSent: 0,
            latencyHistory: [],
            errorCount: 0,
            reconnectCount: 0,
            cacheHitRate: 0,
            lastUpdate: null,
            connectionUptime: 0,
            bytesReceived: 0,
            bytesSent: 0
        };
        
        // Timers and intervals
        this.heartbeatTimer = null;
        this.pollingTimer = null;
        this.cacheCleanupTimer = null;
        this.batchUpdateTimer = null;
        this.connectionHealthTimer = null;
        
        // Initialize system
        this.initializeSystem();
    }
    
    initializeSystem() {
        console.log('🚀 Initializing Blaze Enhanced Real-Time System...');
        
        // Set up periodic cache cleanup
        this.startCacheCleanup();
        
        // Start connection health monitoring
        this.startConnectionHealthMonitoring();
        
        // Attempt WebSocket connection first
        this.connect();
        
        // Set up polling fallback
        this.setupPollingFallback();
        
        // Register global error handlers
        this.setupErrorHandlers();
    }
    
    async connect() {
        if (this.connectionState === 'connecting') return;
        
        this.connectionState = 'connecting';
        this.lastConnectionAttempt = Date.now();
        
        try {
            console.log('🔌 Attempting WebSocket connection...');
            
            this.websocket = new WebSocket(this.config.websocketURL);
            
            // Set up WebSocket event handlers
            this.setupWebSocketHandlers();
            
            // Set connection timeout
            setTimeout(() => {
                if (this.connectionState === 'connecting') {
                    console.warn('⏱️ WebSocket connection timeout, falling back to polling');
                    this.handleConnectionFailure();
                }
            }, 10000);
            
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.handleConnectionFailure();
        }
    }
    
    setupWebSocketHandlers() {
        this.websocket.onopen = () => {
            console.log('✅ WebSocket connected successfully');
            this.connectionState = 'connected';
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.metrics.connectionUptime = Date.now();
            
            // Stop polling fallback if running
            this.stopPollingFallback();
            
            // Start heartbeat
            this.startHeartbeat();
            
            // Resubscribe to channels
            this.resubscribeAll();
            
            // Process queued messages
            this.processMessageQueue();
            
            // Emit connection event
            this.emit('connected', { timestamp: Date.now(), type: 'websocket' });
        };
        
        this.websocket.onmessage = (event) => {
            this.handleWebSocketMessage(event);
        };
        
        this.websocket.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            this.metrics.errorCount++;
            this.emit('error', { error, type: 'websocket' });
        };
        
        this.websocket.onclose = (event) => {
            console.log('🔌 WebSocket disconnected:', event.code, event.reason);
            this.connectionState = 'disconnected';
            this.isConnected = false;
            this.stopHeartbeat();
            
            this.emit('disconnected', { 
                code: event.code, 
                reason: event.reason, 
                timestamp: Date.now() 
            });
            
            // Attempt reconnection or fallback
            this.handleDisconnection();
        };
    }
    
    handleWebSocketMessage(event) {
        try {
            const data = JSON.parse(event.data);
            this.metrics.messagesReceived++;
            this.metrics.bytesReceived += event.data.length;
            
            // Calculate latency if timestamp provided
            if (data.timestamp) {
                const latency = Date.now() - data.timestamp;
                this.updateLatencyMetrics(latency);
            }
            
            // Route message based on type
            switch (data.type) {
                case 'cardinals-update':
                    this.handleCardinalsUpdate(data);
                    break;
                case 'sports-metrics':
                    this.handleSportsMetrics(data);
                    break;
                case 'nil-calculation':
                    this.handleNILUpdate(data);
                    break;
                case 'system-health':
                    this.handleSystemHealth(data);
                    break;
                case 'pong':
                    // Heartbeat response - connection is healthy
                    break;
                case 'error':
                    this.handleServerError(data);
                    break;
                default:
                    this.emit('message', data);
            }
            
            // Cache the data
            if (data.cacheKey) {
                this.updateCache(data.cacheKey, data, data.ttl || this.config.cacheTimeout);
            }
            
        } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
            this.metrics.errorCount++;
        }
    }
    
    handleCardinalsUpdate(data) {
        // Validate Cardinals data structure
        if (!this.validateCardinalsData(data.payload)) {
            console.warn('⚠️ Invalid Cardinals data received:', data);
            return;
        }
        
        // Update cache
        this.updateCache('cardinals-analytics', data.payload);
        
        // Batch or immediate update
        if (this.config.batchUpdates) {
            this.queueBatchUpdate('cardinals', data.payload);
        } else {
            this.updateCardinalsUI(data.payload);
        }
        
        // Emit specific event
        this.emit('cardinals-update', data.payload);
    }
    
    handleSportsMetrics(data) {
        // Process multi-sport metrics update
        Object.entries(data.payload || {}).forEach(([sport, metrics]) => {
            this.updateCache(`${sport}-metrics`, metrics);
            
            if (this.config.batchUpdates) {
                this.queueBatchUpdate(sport, metrics);
            } else {
                this.updateSportUI(sport, metrics);
            }
        });
        
        this.emit('sports-metrics', data.payload);
    }
    
    handleNILUpdate(data) {
        // COPPA compliance check
        if (data.payload.age && data.payload.age < 13) {
            console.warn('⚠️ COPPA compliance: Cannot process data for users under 13');
            return;
        }
        
        // Validate NIL data
        if (!this.validateNILData(data.payload)) {
            console.warn('⚠️ Invalid NIL data received');
            return;
        }
        
        this.updateCache('nil-calculation', data.payload);
        this.emit('nil-update', data.payload);
    }
    
    handleSystemHealth(data) {
        // Update system health metrics
        this.emit('system-health', data.payload);
        
        // Update UI health indicators
        this.updateSystemHealthUI(data.payload);
    }
    
    handleServerError(data) {
        console.error('🚨 Server error received:', data.payload);
        this.metrics.errorCount++;
        this.emit('server-error', data.payload);
    }
    
    // Polling fallback system
    setupPollingFallback() {
        // Don't start polling if WebSocket is connected
        if (this.isConnected) return;
        
        console.log('📡 Starting polling fallback...');
        
        this.pollingTimer = setInterval(async () => {
            if (!this.isConnected) {
                await this.pollForUpdates();
            }
        }, this.config.pollingInterval);
    }
    
    async pollForUpdates() {
        try {
            const endpoints = [
                { key: 'cardinals', url: `${this.config.fallbackURL}?endpoint=cardinals-analytics` },
                { key: 'sports', url: `${this.config.fallbackURL}?endpoint=sports-metrics` },
                { key: 'system', url: `${this.config.fallbackURL}?endpoint=system-health` }
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint.url);
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Check if data has changed (simple hash comparison)
                        const cached = this.cache.get(endpoint.key);
                        const dataHash = this.hashData(data);
                        
                        if (!cached || cached.hash !== dataHash) {
                            this.updateCache(endpoint.key, { ...data, hash: dataHash });
                            this.emit(`${endpoint.key}-update`, data);
                            
                            if (endpoint.key === 'cardinals') {
                                this.updateCardinalsUI(data);
                            } else if (endpoint.key === 'sports') {
                                Object.entries(data).forEach(([sport, metrics]) => {
                                    this.updateSportUI(sport, metrics);
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ Polling failed for ${endpoint.key}:`, error);
                }
            }
            
        } catch (error) {
            console.error('❌ Polling update failed:', error);
            this.metrics.errorCount++;
        }
    }
    
    stopPollingFallback() {
        if (this.pollingTimer) {
            console.log('⏹️ Stopping polling fallback');
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
        }
    }
    
    // Batch update system
    queueBatchUpdate(key, data) {
        this.pendingUpdates.set(key, { data, timestamp: Date.now() });
        
        if (!this.batchUpdateTimer) {
            this.batchUpdateTimer = setTimeout(() => {
                this.processBatchUpdates();
            }, 500); // 500ms batch window
        }
    }
    
    processBatchUpdates() {
        if (this.pendingUpdates.size === 0) return;
        
        console.log(`📦 Processing ${this.pendingUpdates.size} batched updates...`);
        
        for (const [key, update] of this.pendingUpdates) {
            switch (key) {
                case 'cardinals':
                    this.updateCardinalsUI(update.data);
                    break;
                default:
                    if (key.includes('-')) {
                        const [sport] = key.split('-');
                        this.updateSportUI(sport, update.data);
                    }
            }
        }
        
        this.pendingUpdates.clear();
        this.batchUpdateTimer = null;
    }
    
    // UI Update Methods
    updateCardinalsUI(data) {
        const elements = {
            'cardinals-readiness': data.readiness,
            'cardinals-leverage': data.leverage,
            'cardinals-momentum': data.momentum
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value !== undefined) {
                const formattedValue = typeof value === 'number' ? 
                    (value % 1 === 0 ? value : value.toFixed(1)) : value;
                    
                if (element.textContent !== formattedValue.toString()) {
                    element.textContent = formattedValue;
                    this.animateElementUpdate(element);
                }
            }
        });
    }
    
    updateSportUI(sport, data) {
        const sportMap = {
            'titans': 'nfl-titans',
            'longhorns': 'ncaa-longhorns', 
            'grizzlies': 'nba-grizzlies'
        };
        
        const prefix = sportMap[sport] || sport;
        
        Object.entries(data).forEach(([metric, value]) => {
            const elementId = `${prefix}-${metric.toLowerCase()}`;
            const element = document.getElementById(elementId);
            
            if (element && value !== undefined) {
                const formattedValue = typeof value === 'number' ? 
                    (value % 1 === 0 ? value : value.toFixed(1)) : value;
                    
                if (element.textContent !== formattedValue.toString()) {
                    element.textContent = formattedValue;
                    this.animateElementUpdate(element);
                }
            }
        });
    }
    
    updateSystemHealthUI(data) {
        const healthElements = {
            'system-accuracy': data.accuracy,
            'system-latency': data.latency,
            'system-uptime': data.uptime,
            'data-points': data.dataPoints
        };
        
        Object.entries(healthElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value !== undefined) {
                element.textContent = value;
                this.animateElementUpdate(element);
            }
        });
    }
    
    animateElementUpdate(element) {
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.2s ease-out';
        
        requestAnimationFrame(() => {
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        });
    }
    
    // Caching system
    updateCache(key, data, ttl = this.config.cacheTimeout) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
            hash: this.hashData(data)
        });
    }
    
    getCacheData(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        // Check TTL
        if (Date.now() - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }
    
    startCacheCleanup() {
        this.cacheCleanupTimer = setInterval(() => {
            const now = Date.now();
            let cleaned = 0;
            
            for (const [key, cached] of this.cache) {
                if (now - cached.timestamp > cached.ttl) {
                    this.cache.delete(key);
                    cleaned++;
                }
            }
            
            if (cleaned > 0) {
                console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
            }
        }, 60000); // Clean every minute
    }
    
    // Connection health monitoring
    startConnectionHealthMonitoring() {
        this.connectionHealthTimer = setInterval(() => {
            const now = Date.now();
            const timeSinceLastMessage = now - (this.metrics.lastUpdate || now);
            
            // If no messages received in 2 minutes, consider connection stale
            if (this.isConnected && timeSinceLastMessage > 120000) {
                console.warn('⚠️ Connection appears stale, reconnecting...');
                this.reconnect();
            }
            
            // Update connection uptime
            if (this.isConnected && this.metrics.connectionUptime) {
                this.metrics.connectionUptime = now - this.metrics.connectionUptime;
            }
            
        }, 30000); // Check every 30 seconds
    }
    
    // Subscription management
    subscribe(channel) {
        this.subscriptions.add(channel);
        
        if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
            this.sendWebSocketMessage({
                action: 'subscribe',
                channel,
                timestamp: Date.now()
            });
        }
        
        console.log(`📡 Subscribed to ${channel}`);
    }
    
    unsubscribe(channel) {
        this.subscriptions.delete(channel);
        
        if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
            this.sendWebSocketMessage({
                action: 'unsubscribe',
                channel,
                timestamp: Date.now()
            });
        }
        
        console.log(`📡 Unsubscribed from ${channel}`);
    }
    
    resubscribeAll() {
        console.log(`🔄 Resubscribing to ${this.subscriptions.size} channels...`);
        this.subscriptions.forEach(channel => this.subscribe(channel));
    }
    
    // Message handling
    sendWebSocketMessage(data) {
        if (!this.isConnected || this.websocket.readyState !== WebSocket.OPEN) {
            this.messageQueue.push(data);
            return false;
        }
        
        try {
            const message = JSON.stringify(data);
            this.websocket.send(message);
            this.metrics.messagesSent++;
            this.metrics.bytesSent += message.length;
            return true;
        } catch (error) {
            console.error('❌ Failed to send WebSocket message:', error);
            this.messageQueue.push(data);
            return false;
        }
    }
    
    processMessageQueue() {
        if (this.messageQueue.length === 0) return;
        
        console.log(`📤 Processing ${this.messageQueue.length} queued messages...`);
        
        const messages = [...this.messageQueue];
        this.messageQueue = [];
        
        messages.forEach(message => {
            if (!this.sendWebSocketMessage(message)) {
                // If send fails, re-queue the message
                this.messageQueue.push(message);
            }
        });
    }
    
    // Heartbeat system
    startHeartbeat() {
        this.stopHeartbeat();
        
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
                this.sendWebSocketMessage({
                    action: 'ping',
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
    
    // Connection management
    handleConnectionFailure() {
        this.connectionState = 'error';
        this.isConnected = false;
        
        // Start polling fallback immediately
        this.setupPollingFallback();
        
        // Schedule reconnection attempt
        this.scheduleReconnection();
    }
    
    handleDisconnection() {
        // Start polling fallback
        this.setupPollingFallback();
        
        // Schedule reconnection
        this.scheduleReconnection();
    }
    
    scheduleReconnection() {
        if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            console.error('🚫 Max reconnection attempts reached');
            this.emit('max-reconnect-reached', { attempts: this.reconnectAttempts });
            return;
        }
        
        this.reconnectAttempts++;
        const delay = Math.min(this.config.reconnectInterval * this.reconnectAttempts, 30000);
        
        console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${delay}ms`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connect();
            }
        }, delay);
    }
    
    reconnect() {
        this.disconnect();
        setTimeout(() => this.connect(), 1000);
    }
    
    disconnect() {
        console.log('🔌 Disconnecting...');
        
        // Clear all timers
        this.stopHeartbeat();
        this.stopPollingFallback();
        
        if (this.batchUpdateTimer) {
            clearTimeout(this.batchUpdateTimer);
            this.batchUpdateTimer = null;
        }
        
        // Close WebSocket
        if (this.websocket) {
            this.websocket.close(1000, 'Manual disconnect');
            this.websocket = null;
        }
        
        this.isConnected = false;
        this.connectionState = 'disconnected';
    }
    
    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    // Validation methods
    validateCardinalsData(data) {
        if (!data || typeof data !== 'object') return false;
        
        const required = ['readiness'];
        for (const field of required) {
            if (!(field in data)) return false;
        }
        
        if (typeof data.readiness !== 'number' || data.readiness < 0 || data.readiness > 100) {
            return false;
        }
        
        return true;
    }
    
    validateNILData(data) {
        if (!data || typeof data !== 'object') return false;
        
        // COPPA compliance check
        if (data.age && data.age < 13) return false;
        
        // Parental consent required for minors
        if (data.age && data.age < 18 && !data.parentalConsent) return false;
        
        return true;
    }
    
    // Utility methods
    hashData(data) {
        return btoa(JSON.stringify(data)).slice(0, 16);
    }
    
    updateLatencyMetrics(latency) {
        this.metrics.latencyHistory.push(latency);
        if (this.metrics.latencyHistory.length > 100) {
            this.metrics.latencyHistory.shift();
        }
        this.metrics.lastUpdate = Date.now();
    }
    
    setupErrorHandlers() {
        window.addEventListener('error', (event) => {
            if (event.error && event.error.message && 
                event.error.message.includes('WebSocket')) {
                this.handleConnectionFailure();
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('📡 Browser went offline');
            this.emit('network-offline');
        });
        
        window.addEventListener('online', () => {
            console.log('📡 Browser back online');
            this.emit('network-online');
            
            // Attempt to reconnect
            if (!this.isConnected) {
                setTimeout(() => this.connect(), 1000);
            }
        });
    }
    
    // Public API methods
    getConnectionState() {
        return {
            connected: this.isConnected,
            state: this.connectionState,
            reconnectAttempts: this.reconnectAttempts,
            subscriptions: Array.from(this.subscriptions),
            metrics: this.getMetrics()
        };
    }
    
    getMetrics() {
        const avgLatency = this.metrics.latencyHistory.length > 0 ?
            this.metrics.latencyHistory.reduce((a, b) => a + b, 0) / this.metrics.latencyHistory.length : 0;
        
        return {
            ...this.metrics,
            averageLatency: Math.round(avgLatency),
            cacheSize: this.cache.size,
            queuedMessages: this.messageQueue.length,
            connectionUptime: this.isConnected ? Date.now() - this.metrics.connectionUptime : 0
        };
    }
    
    getCachedData(key) {
        return this.getCacheData(key);
    }
    
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }
    
    // Cleanup
    destroy() {
        console.log('🔥 Shutting down Blaze Real-Time System...');
        
        // Disconnect and clean up
        this.disconnect();
        
        // Clear all timers
        if (this.cacheCleanupTimer) {
            clearInterval(this.cacheCleanupTimer);
        }
        if (this.connectionHealthTimer) {
            clearInterval(this.connectionHealthTimer);
        }
        
        // Clear data structures
        this.cache.clear();
        this.subscriptions.clear();
        this.listeners.clear();
        this.pendingUpdates.clear();
        this.messageQueue = [];
    }
}

// Global initialization
if (typeof window !== 'undefined') {
    window.blazeRealtimeEnhanced = null;
    
    window.initializeBlazeRealtime = function(config = {}) {
        if (window.blazeRealtimeEnhanced) {
            window.blazeRealtimeEnhanced.destroy();
        }
        
        window.blazeRealtimeEnhanced = new BlazeRealtimeEnhanced(config);
        
        // Set up standard subscriptions
        window.blazeRealtimeEnhanced.subscribe('cardinals-analytics');
        window.blazeRealtimeEnhanced.subscribe('sports-metrics');
        window.blazeRealtimeEnhanced.subscribe('nil-calculator');
        window.blazeRealtimeEnhanced.subscribe('system-health');
        
        // Global event listeners
        window.blazeRealtimeEnhanced.on('connected', (data) => {
            console.log('🎉 Blaze Real-Time connected via', data.type);
        });
        
        window.blazeRealtimeEnhanced.on('cardinals-update', (data) => {
            console.log('📊 Cardinals update:', data);
        });
        
        window.blazeRealtimeEnhanced.on('error', (data) => {
            console.warn('⚠️ Real-time error:', data);
        });
        
        return window.blazeRealtimeEnhanced;
    };
    
    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.initializeBlazeRealtime();
        });
    } else {
        window.initializeBlazeRealtime();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeRealtimeEnhanced;
}