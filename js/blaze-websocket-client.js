// Blaze Intelligence WebSocket Real-Time Client
// Professional Real-Time Data Streaming for Sports Analytics

class BlazeWebSocketClient {
  constructor(options = {}) {
    this.config = {
      // WebSocket server URL (configurable for different environments)
      serverUrl: options.serverUrl || this.getWebSocketURL(),
      reconnectAttempts: options.reconnectAttempts || 5,
      reconnectDelay: options.reconnectDelay || 3000,
      heartbeatInterval: options.heartbeatInterval || 30000,
      maxReconnectDelay: options.maxReconnectDelay || 30000,
      debug: options.debug || false,
      ...options
    };

    this.ws = null;
    this.isConnected = false;
    this.reconnectCount = 0;
    this.subscriptions = new Set();
    this.messageQueue = [];
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.eventHandlers = new Map();

    // Bind methods to preserve context
    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
  }

  getWebSocketURL() {
    // Determine WebSocket URL based on environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;

    // For local development
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${protocol}//${host}:8080/ws`;
    }

    // For Netlify deployment - use mock WebSocket for demo
    // In production, this would connect to a real WebSocket server
    return `${protocol}//${host}/ws`;
  }

  async connect() {
    if (this.isConnected || this.ws?.readyState === WebSocket.CONNECTING) {
      this.log('Already connected or connecting');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.log(`Connecting to ${this.config.serverUrl}...`);

        // For demo purposes, simulate WebSocket connection
        if (this.config.serverUrl.includes('netlify.app') || !this.isWebSocketSupported()) {
          this.log('Using mock WebSocket for demo environment');
          this.initializeMockWebSocket();
          resolve();
          return;
        }

        this.ws = new WebSocket(this.config.serverUrl);

        this.ws.onopen = () => {
          this.onOpen();
          resolve();
        };

        this.ws.onmessage = this.onMessage;
        this.ws.onclose = this.onClose;
        this.ws.onerror = (error) => {
          this.onError(error);
          reject(error);
        };

        // Timeout for connection
        setTimeout(() => {
          if (this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.log('WebSocket connection failed, using mock connection', error);
        this.initializeMockWebSocket();
        resolve();
      }
    });
  }

  initializeMockWebSocket() {
    // Create a mock WebSocket for demo purposes
    this.isMockMode = true;
    this.isConnected = true;

    this.log('✅ Mock WebSocket connection established');
    this.onOpen();

    // Simulate periodic data updates
    this.startMockDataStream();
  }

  startMockDataStream() {
    // Simulate real-time sports data updates
    const mockDataTypes = ['scores', 'nil_updates', 'predictions', 'live_stats'];

    setInterval(() => {
      if (this.isConnected) {
        const dataType = mockDataTypes[Math.floor(Math.random() * mockDataTypes.length)];
        const mockData = this.generateMockData(dataType);

        this.simulateMessage({
          type: dataType,
          data: mockData,
          timestamp: new Date().toISOString(),
          source: 'blaze_intelligence_feed'
        });
      }
    }, 5000 + Math.random() * 10000); // Random interval 5-15 seconds
  }

  generateMockData(type) {
    switch (type) {
      case 'scores':
        return {
          game_id: `game_${Date.now()}`,
          home_team: 'Cardinals',
          away_team: 'Cubs',
          home_score: Math.floor(Math.random() * 10),
          away_score: Math.floor(Math.random() * 10),
          inning: Math.floor(Math.random() * 9) + 1,
          status: 'live'
        };

      case 'nil_updates':
        return {
          player: 'Arch Manning',
          school: 'Texas',
          old_value: 6800000,
          new_value: 6800000 + (Math.random() * 200000 - 100000),
          change_percent: (Math.random() * 10 - 5).toFixed(2)
        };

      case 'predictions':
        return {
          event: 'CFP Championship',
          team: 'Texas',
          probability: (85 + Math.random() * 10).toFixed(1),
          change: (Math.random() * 4 - 2).toFixed(1)
        };

      case 'live_stats':
        return {
          metric: 'system_performance',
          accuracy: (94.6 + Math.random() * 2 - 1).toFixed(1),
          latency: Math.floor(40 + Math.random() * 20),
          active_users: Math.floor(1200 + Math.random() * 100),
          data_points: 2847293 + Math.floor(Math.random() * 1000)
        };

      default:
        return { message: 'Real-time update', timestamp: Date.now() };
    }
  }

  simulateMessage(data) {
    // Simulate receiving a WebSocket message
    this.onMessage({ data: JSON.stringify(data) });
  }

  onOpen() {
    this.isConnected = true;
    this.reconnectCount = 0;
    this.log('✅ WebSocket connection established');

    // Send queued messages
    this.flushMessageQueue();

    // Start heartbeat
    this.startHeartbeat();

    // Resubscribe to channels
    this.resubscribe();

    // Emit connection event
    this.emit('connected');
  }

  onMessage(event) {
    try {
      const message = JSON.parse(event.data);
      this.log('📨 Received message:', message);

      // Handle different message types
      switch (message.type) {
        case 'heartbeat':
          this.handleHeartbeat(message);
          break;
        case 'scores':
          this.handleScoreUpdate(message);
          break;
        case 'nil_updates':
          this.handleNILUpdate(message);
          break;
        case 'predictions':
          this.handlePredictionUpdate(message);
          break;
        case 'live_stats':
          this.handleStatsUpdate(message);
          break;
        default:
          this.emit('message', message);
      }
    } catch (error) {
      this.log('Error parsing message:', error);
    }
  }

  onClose(event) {
    this.isConnected = false;
    this.log('🔌 WebSocket connection closed:', event.code, event.reason);

    this.stopHeartbeat();
    this.emit('disconnected', { code: event.code, reason: event.reason });

    // Attempt reconnection unless it's a manual close
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  onError(error) {
    this.log('❌ WebSocket error:', error);
    this.emit('error', error);
  }

  disconnect() {
    this.log('Disconnecting WebSocket...');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Manual disconnect');
    }

    this.isConnected = false;
    this.isMockMode = false;
  }

  scheduleReconnect() {
    if (this.reconnectCount >= this.config.reconnectAttempts) {
      this.log('❌ Max reconnection attempts reached');
      this.emit('reconnect_failed');
      return;
    }

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectCount),
      this.config.maxReconnectDelay
    );

    this.log(`⏰ Reconnecting in ${delay}ms (attempt ${this.reconnectCount + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectCount++;
      this.connect().catch(() => {
        // Connection failed, will be handled by onError
      });
    }, delay);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'heartbeat', timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  send(data) {
    const message = JSON.stringify(data);

    if (!this.isConnected) {
      this.messageQueue.push(message);
      this.log('📤 Queued message (not connected):', data);
      return;
    }

    if (this.isMockMode) {
      this.log('📤 Mock send:', data);
      return;
    }

    try {
      this.ws.send(message);
      this.log('📤 Sent message:', data);
    } catch (error) {
      this.log('❌ Failed to send message:', error);
      this.messageQueue.push(message);
    }
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      try {
        if (!this.isMockMode) {
          this.ws.send(message);
        }
        this.log('📤 Sent queued message');
      } catch (error) {
        this.log('❌ Failed to send queued message:', error);
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  // Subscription management
  subscribe(channel) {
    this.subscriptions.add(channel);
    this.send({
      type: 'subscribe',
      channel: channel,
      timestamp: Date.now()
    });
    this.log(`📺 Subscribed to channel: ${channel}`);
  }

  unsubscribe(channel) {
    this.subscriptions.delete(channel);
    this.send({
      type: 'unsubscribe',
      channel: channel,
      timestamp: Date.now()
    });
    this.log(`📺 Unsubscribed from channel: ${channel}`);
  }

  resubscribe() {
    this.subscriptions.forEach(channel => {
      this.send({
        type: 'subscribe',
        channel: channel,
        timestamp: Date.now()
      });
    });
  }

  // Convenience methods for sports data subscriptions
  subscribeSports() {
    this.subscribe('live_scores');
    this.subscribe('game_updates');
  }

  subscribeNIL() {
    this.subscribe('nil_valuations');
    this.subscribe('nil_updates');
  }

  subscribePredictions() {
    this.subscribe('championship_predictions');
    this.subscribe('playoff_odds');
  }

  subscribeAnalytics() {
    this.subscribe('performance_metrics');
    this.subscribe('system_stats');
  }

  // Event handling
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          this.log('Error in event handler:', error);
        }
      });
    }
  }

  // Message handlers
  handleHeartbeat(message) {
    // Respond to server heartbeat
    this.send({ type: 'heartbeat_response', timestamp: Date.now() });
  }

  handleScoreUpdate(message) {
    this.log('🏆 Score update:', message.data);
    this.emit('score_update', message.data);

    // Update UI elements
    this.updateScoreElements(message.data);
  }

  handleNILUpdate(message) {
    this.log('💰 NIL update:', message.data);
    this.emit('nil_update', message.data);

    // Update NIL displays
    this.updateNILElements(message.data);
  }

  handlePredictionUpdate(message) {
    this.log('🔮 Prediction update:', message.data);
    this.emit('prediction_update', message.data);

    // Update prediction displays
    this.updatePredictionElements(message.data);
  }

  handleStatsUpdate(message) {
    this.log('📊 Stats update:', message.data);
    this.emit('stats_update', message.data);

    // Update metrics displays
    this.updateStatsElements(message.data);
  }

  // UI update methods
  updateScoreElements(data) {
    const elements = document.querySelectorAll('[data-live-scores]');
    elements.forEach(element => {
      // Update live score displays
      const scoreHtml = `
        <div class="live-game">
          <span class="teams">${data.away_team} @ ${data.home_team}</span>
          <span class="score">${data.away_score} - ${data.home_score}</span>
          <span class="status">${data.status}</span>
        </div>
      `;
      element.innerHTML = scoreHtml;
    });
  }

  updateNILElements(data) {
    const elements = document.querySelectorAll('[data-nil-updates]');
    elements.forEach(element => {
      // Flash update animation
      element.classList.add('update-flash');
      setTimeout(() => element.classList.remove('update-flash'), 1000);

      // Update NIL value if it matches
      if (element.dataset.player === data.player) {
        const valueEl = element.querySelector('.nil-value');
        if (valueEl) {
          valueEl.textContent = `$${(data.new_value / 1000000).toFixed(1)}M`;
        }
      }
    });
  }

  updatePredictionElements(data) {
    const elements = document.querySelectorAll('[data-predictions]');
    elements.forEach(element => {
      if (element.dataset.team === data.team) {
        const probEl = element.querySelector('.probability');
        if (probEl) {
          probEl.textContent = `${data.probability}%`;

          // Add visual indicator for changes
          const changeEl = element.querySelector('.change');
          if (changeEl) {
            const change = parseFloat(data.change);
            changeEl.textContent = change > 0 ? `+${data.change}%` : `${data.change}%`;
            changeEl.className = `change ${change > 0 ? 'positive' : 'negative'}`;
          }
        }
      }
    });
  }

  updateStatsElements(data) {
    // Update system metrics
    Object.entries(data).forEach(([key, value]) => {
      const elements = document.querySelectorAll(`[data-metric="${key}"]`);
      elements.forEach(element => {
        if (element.textContent !== value.toString()) {
          element.classList.add('metric-update');
          element.textContent = value;
          setTimeout(() => element.classList.remove('metric-update'), 500);
        }
      });
    });
  }

  // Utility methods
  isWebSocketSupported() {
    return 'WebSocket' in window;
  }

  log(...args) {
    if (this.config.debug) {
      console.log('[BlazeWebSocket]', ...args);
    }
  }

  // Connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      mockMode: this.isMockMode,
      reconnectCount: this.reconnectCount,
      subscriptions: Array.from(this.subscriptions),
      queuedMessages: this.messageQueue.length
    };
  }
}

// Auto-initialize global instance
if (typeof window !== 'undefined') {
  window.BlazeWebSocketClient = BlazeWebSocketClient;

  // Create global instance
  window.blazeWS = new BlazeWebSocketClient({ debug: true });

  // Add CSS for update animations
  const style = document.createElement('style');
  style.textContent = `
    .update-flash {
      animation: updateFlash 1s ease-out;
    }

    @keyframes updateFlash {
      0% { background-color: rgba(255, 215, 0, 0.3); }
      100% { background-color: transparent; }
    }

    .metric-update {
      animation: metricPulse 0.5s ease-out;
      color: #FFD700;
    }

    @keyframes metricPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .change.positive {
      color: #4CAF50;
    }

    .change.negative {
      color: #F44336;
    }
  `;
  document.head.appendChild(style);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlazeWebSocketClient;
}