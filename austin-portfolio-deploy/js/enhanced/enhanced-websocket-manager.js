/**
 * Enhanced WebSocket Manager - Championship Connection System
 * By Austin Humphrey - Deep South Sports Authority
 * Provides rock-solid WebSocket connections with intelligent reconnection
 */

class EnhancedWebSocketManager {
    constructor() {
        this.connections = new Map();
        this.reconnectAttempts = new Map();
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.heartbeatInterval = 30000;
        this.messageQueue = new Map();
        
        this.isOnline = navigator.onLine;
        this.setupNetworkMonitoring();
        
        console.log('🏆 Austin Humphrey WebSocket Manager - Championship Connection System');
    }
    
    /**
     * Create or get existing WebSocket connection
     * @param {string} name - Connection identifier
     * @param {string} url - WebSocket URL
     * @param {object} options - Connection options
     */
    connect(name, url, options = {}) {
        if (this.connections.has(name)) {
            const existing = this.connections.get(name);
            if (existing.ws && existing.ws.readyState === WebSocket.OPEN) {
                console.log(`✅ Using existing ${name} WebSocket connection`);
                return existing.ws;
            }
        }
        
        const fullUrl = url.startsWith('ws') ? url : this.buildWebSocketUrl(url);
        console.log(`🔌 Connecting to ${name} WebSocket: ${fullUrl}`);
        
        const connectionConfig = {
            name,
            url: fullUrl,
            options: {
                autoReconnect: true,
                heartbeat: true,
                queueMessages: true,
                ...options
            },
            ws: null,
            lastPing: null,
            heartbeatTimer: null,
            reconnectTimer: null,
            messageQueue: []
        };
        
        this.establishConnection(connectionConfig);
        this.connections.set(name, connectionConfig);
        
        return connectionConfig.ws;
    }
    
    establishConnection(config) {
        try {
            config.ws = new WebSocket(config.url);
            
            config.ws.onopen = () => {
                console.log(`✅ ${config.name} WebSocket connected successfully`);
                this.onConnectionOpen(config);
            };
            
            config.ws.onmessage = (event) => {
                this.onMessage(config, event);
            };
            
            config.ws.onclose = (event) => {
                console.log(`🔌 ${config.name} WebSocket disconnected:`, event.code, event.reason);
                this.onConnectionClose(config, event);
            };
            
            config.ws.onerror = (error) => {
                console.error(`🚨 ${config.name} WebSocket error:`, error);
                this.onConnectionError(config, error);
            };
            
        } catch (error) {
            console.error(`🚨 Failed to create ${config.name} WebSocket:`, error);
            this.scheduleReconnect(config);
        }
    }
    
    onConnectionOpen(config) {
        // Reset reconnection attempts
        this.reconnectAttempts.set(config.name, 0);
        
        // Clear any pending reconnection
        if (config.reconnectTimer) {
            clearTimeout(config.reconnectTimer);
            config.reconnectTimer = null;
        }
        
        // Send queued messages
        this.flushMessageQueue(config);
        
        // Start heartbeat if enabled
        if (config.options.heartbeat) {
            this.startHeartbeat(config);
        }
        
        // Trigger custom open handler
        if (config.options.onOpen) {
            config.options.onOpen(config.ws);
        }
        
        // Dispatch custom event
        this.dispatchConnectionEvent('websocket-connected', {
            name: config.name,
            url: config.url
        });
    }
    
    onMessage(config, event) {
        try {
            const data = JSON.parse(event.data);
            
            // Handle internal messages
            if (data.type === 'pong') {
                config.lastPing = Date.now();
                return;
            }
            
            // Trigger custom message handler
            if (config.options.onMessage) {
                config.options.onMessage(data, event);
            }
            
            // Dispatch custom event
            this.dispatchConnectionEvent('websocket-message', {
                name: config.name,
                data: data,
                raw: event.data
            });
            
        } catch (error) {
            console.error(`🚨 Error parsing ${config.name} WebSocket message:`, error);
            
            // Still trigger handler with raw data
            if (config.options.onMessage) {
                config.options.onMessage(event.data, event);
            }
        }
    }
    
    onConnectionClose(config, event) {
        // Clear heartbeat
        if (config.heartbeatTimer) {
            clearInterval(config.heartbeatTimer);
            config.heartbeatTimer = null;
        }
        
        // Trigger custom close handler
        if (config.options.onClose) {
            config.options.onClose(event);
        }
        
        // Dispatch custom event
        this.dispatchConnectionEvent('websocket-disconnected', {
            name: config.name,
            code: event.code,
            reason: event.reason
        });
        
        // Schedule reconnection if enabled and not intentionally closed
        if (config.options.autoReconnect && event.code !== 1000 && this.isOnline) {
            this.scheduleReconnect(config);
        }
    }
    
    onConnectionError(config, error) {
        // Trigger custom error handler
        if (config.options.onError) {
            config.options.onError(error);
        }
        
        // Dispatch custom event
        this.dispatchConnectionEvent('websocket-error', {
            name: config.name,
            error: error
        });
    }
    
    scheduleReconnect(config) {
        const attempts = this.reconnectAttempts.get(config.name) || 0;
        
        if (attempts >= this.maxReconnectAttempts) {
            console.error(`🚨 ${config.name} WebSocket max reconnection attempts reached`);
            this.dispatchConnectionEvent('websocket-failed', {
                name: config.name,
                attempts: attempts
            });
            return;
        }
        
        const delay = this.reconnectDelay * Math.pow(2, attempts); // Exponential backoff
        console.log(`🔄 Scheduling ${config.name} WebSocket reconnection in ${delay}ms (attempt ${attempts + 1})`);
        
        config.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts.set(config.name, attempts + 1);
            this.establishConnection(config);
        }, delay);
    }
    
    startHeartbeat(config) {
        config.heartbeatTimer = setInterval(() => {
            if (config.ws && config.ws.readyState === WebSocket.OPEN) {
                this.send(config.name, { type: 'ping', timestamp: Date.now() });
            }
        }, this.heartbeatInterval);
    }
    
    send(connectionName, data) {
        const config = this.connections.get(connectionName);
        if (!config) {
            console.error(`🚨 WebSocket connection '${connectionName}' not found`);
            return false;
        }
        
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        
        if (config.ws && config.ws.readyState === WebSocket.OPEN) {
            try {
                config.ws.send(message);
                return true;
            } catch (error) {
                console.error(`🚨 Failed to send message to ${connectionName}:`, error);
                
                // Queue message if queueing is enabled
                if (config.options.queueMessages) {
                    config.messageQueue.push(message);
                }
                
                return false;
            }
        } else {
            // Queue message if queueing is enabled
            if (config.options.queueMessages) {
                config.messageQueue.push(message);
                console.log(`📦 Queued message for ${connectionName} (connection not ready)`);
            }
            
            return false;
        }
    }
    
    flushMessageQueue(config) {
        if (config.messageQueue.length > 0) {
            console.log(`📤 Sending ${config.messageQueue.length} queued messages for ${config.name}`);
            
            config.messageQueue.forEach(message => {
                try {
                    config.ws.send(message);
                } catch (error) {
                    console.error(`🚨 Failed to send queued message:`, error);
                }
            });
            
            config.messageQueue = [];
        }
    }
    
    disconnect(connectionName) {
        const config = this.connections.get(connectionName);
        if (!config) {
            return;
        }
        
        // Clear timers
        if (config.heartbeatTimer) {
            clearInterval(config.heartbeatTimer);
        }
        if (config.reconnectTimer) {
            clearTimeout(config.reconnectTimer);
        }
        
        // Close connection
        if (config.ws && config.ws.readyState !== WebSocket.CLOSED) {
            config.ws.close(1000, 'Intentional disconnect');
        }
        
        this.connections.delete(connectionName);
        this.reconnectAttempts.delete(connectionName);
        
        console.log(`👋 ${connectionName} WebSocket disconnected`);
    }
    
    getConnection(connectionName) {
        const config = this.connections.get(connectionName);
        return config ? config.ws : null;
    }
    
    getConnectionStatus(connectionName) {
        const config = this.connections.get(connectionName);
        if (!config || !config.ws) {
            return 'disconnected';
        }
        
        switch (config.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'connecting';
            case WebSocket.OPEN:
                return 'connected';
            case WebSocket.CLOSING:
                return 'closing';
            case WebSocket.CLOSED:
                return 'disconnected';
            default:
                return 'unknown';
        }
    }
    
    getAllConnections() {
        const status = {};
        this.connections.forEach((config, name) => {
            status[name] = {
                status: this.getConnectionStatus(name),
                url: config.url,
                attempts: this.reconnectAttempts.get(name) || 0,
                queueLength: config.messageQueue.length,
                lastPing: config.lastPing
            };
        });
        return status;
    }
    
    buildWebSocketUrl(path) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}${path}`;
    }
    
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            console.log('🌐 Network connection restored');
            this.isOnline = true;
            
            // Attempt to reconnect all disconnected connections
            this.connections.forEach((config, name) => {
                if (this.getConnectionStatus(name) === 'disconnected' && config.options.autoReconnect) {
                    console.log(`🔄 Attempting to reconnect ${name} after network restoration`);
                    this.establishConnection(config);
                }
            });
        });
        
        window.addEventListener('offline', () => {
            console.log('🌐 Network connection lost');
            this.isOnline = false;
        });
    }
    
    dispatchConnectionEvent(eventType, detail) {
        window.dispatchEvent(new CustomEvent(eventType, { detail }));
    }
    
    // Cleanup method
    destroy() {
        this.connections.forEach((config, name) => {
            this.disconnect(name);
        });
        
        console.log('🧹 WebSocket Manager destroyed');
    }
}

// Initialize global WebSocket manager
window.wsManager = new EnhancedWebSocketManager();

// Enhanced AI Consciousness WebSocket Connection
function initializeAIConsciousnessWebSocket() {
    const wsManager = window.wsManager;
    
    // Connect to AI consciousness WebSocket
    wsManager.connect('consciousness', '/ws/consciousness', {
        autoReconnect: true,
        heartbeat: true,
        queueMessages: true,
        
        onOpen: (ws) => {
            console.log('🧠 AI Consciousness WebSocket connected');
            
            // Update UI connection status
            const statusElements = document.querySelectorAll('.consciousness-status');
            statusElements.forEach(el => {
                el.textContent = 'Connected';
                el.className = 'consciousness-status connected';
            });
        },
        
        onMessage: (data) => {
            if (data.type === 'consciousness_state') {
                // Update consciousness state in UI
                window.dispatchEvent(new CustomEvent('consciousness-state-updated', {
                    detail: data
                }));
            }
        },
        
        onClose: () => {
            console.log('🧠 AI Consciousness WebSocket disconnected');
            
            // Update UI connection status
            const statusElements = document.querySelectorAll('.consciousness-status');
            statusElements.forEach(el => {
                el.textContent = 'Disconnected';
                el.className = 'consciousness-status disconnected';
            });
        },
        
        onError: (error) => {
            console.error('🚨 AI Consciousness WebSocket error:', error);
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAIConsciousnessWebSocket);
} else {
    initializeAIConsciousnessWebSocket();
}

// Add connection status indicator styles
const statusStyles = `
<style>
.consciousness-status {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.consciousness-status.connected {
    background: rgba(16, 185, 129, 0.2);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.consciousness-status.disconnected {
    background: rgba(255, 59, 48, 0.2);
    color: #FF3B30;
    border: 1px solid rgba(255, 59, 48, 0.3);
}

.consciousness-status.connecting {
    background: rgba(245, 158, 11, 0.2);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.3);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', statusStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedWebSocketManager;
}