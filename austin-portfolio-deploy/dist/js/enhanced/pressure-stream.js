// Pressure Stream Visualization Module
// Bloomberg-grade Win Probability and Pressure Analytics
// 60fps Canvas rendering with D3.js

class PressureStream {
  constructor(elementId, options = {}) {
    this.element = document.querySelector(elementId);
    this.options = {
      width: options.width || this.element.clientWidth,
      height: options.height || 380,
      margins: { top: 24, right: 28, bottom: 26, left: 40 },
      colors: {
        winProb: '#9BCBEB',  // Cardinal blue
        pressure: {
          low: 'rgba(155, 203, 235, 0.08)',   // Turquoise
          high: 'rgba(191, 87, 0, 0.25)'      // Burnt orange
        },
        events: '#BF5700',  // Burnt orange
        background: '#0A192F',  // Dark navy
        grid: 'rgba(17, 34, 64, 0.3)'  // Light navy
      },
      fps: 60,
      dataWindow: 18 * 60 * 1000,  // 18 minutes in ms
      ...options
    };
    
    this.data = [];
    this.animationFrame = null;
    this.lastUpdate = 0;
    this.frameInterval = 1000 / this.options.fps;
    
    this.init();
  }
  
  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.element.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d');
    
    // Initialize D3 scales
    this.xScale = d3.scaleTime()
      .range([this.options.margins.left, this.options.width - this.options.margins.right]);
    
    this.yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([this.options.height - this.options.margins.bottom, this.options.margins.top]);
    
    this.pressureScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, this.options.height - this.options.margins.top - this.options.margins.bottom]);
    
    // Start animation loop
    this.animate();
  }
  
  updateData(tick) {
    // Add new data point
    this.data.push({
      t: tick.t || Date.now(),
      wp: tick.wp || 0.5,
      pressure: tick.pressure || 0,
      event: tick.event || null
    });
    
    // Maintain rolling window
    const now = Date.now();
    const cutoff = now - this.options.dataWindow;
    this.data = this.data.filter(d => d.t >= cutoff);
    
    // Update x scale domain
    if (this.data.length > 0) {
      const extent = d3.extent(this.data, d => d.t);
      this.xScale.domain(extent);
    }
  }
  
  drawBackground() {
    // Clear canvas
    this.ctx.fillStyle = this.options.colors.background;
    this.ctx.fillRect(0, 0, this.options.width, this.options.height);
    
    // Draw grid lines
    this.ctx.strokeStyle = this.options.colors.grid;
    this.ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = this.yScale(i / 10);
      this.ctx.beginPath();
      this.ctx.moveTo(this.options.margins.left, y);
      this.ctx.lineTo(this.options.width - this.options.margins.right, y);
      this.ctx.stroke();
    }
    
    // Draw axes labels
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '11px Inter, sans-serif';
    this.ctx.textAlign = 'right';
    
    // Y-axis labels (Win Probability)
    for (let i = 0; i <= 10; i += 2) {
      const y = this.yScale(i / 10);
      this.ctx.fillText(`${i * 10}%`, this.options.margins.left - 5, y + 4);
    }
    
    // Title
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.font = 'bold 13px Inter, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('WIN PROBABILITY × PRESSURE', this.options.margins.left, 15);
  }
  
  drawPressureGlow() {
    if (this.data.length < 2) return;
    
    // Create pressure gradient
    const gradient = this.ctx.createLinearGradient(
      0, this.options.margins.top,
      0, this.options.height - this.options.margins.bottom
    );
    gradient.addColorStop(0, this.options.colors.pressure.high);
    gradient.addColorStop(1, this.options.colors.pressure.low);
    
    this.ctx.fillStyle = gradient;
    
    // Draw pressure area
    this.ctx.beginPath();
    this.ctx.moveTo(this.xScale(this.data[0].t), this.yScale(0));
    
    this.data.forEach(d => {
      const x = this.xScale(d.t);
      const y = this.yScale(d.pressure);
      this.ctx.lineTo(x, y);
    });
    
    this.ctx.lineTo(this.xScale(this.data[this.data.length - 1].t), this.yScale(0));
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  drawWinProbabilityLine() {
    if (this.data.length < 2) return;
    
    this.ctx.strokeStyle = this.options.colors.winProb;
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = this.options.colors.winProb;
    this.ctx.shadowBlur = 8;
    
    this.ctx.beginPath();
    this.data.forEach((d, i) => {
      const x = this.xScale(d.t);
      const y = this.yScale(d.wp);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        // Smooth curve
        const prevD = this.data[i - 1];
        const cpx = (this.xScale(prevD.t) + x) / 2;
        const cpy = (this.yScale(prevD.wp) + y) / 2;
        this.ctx.quadraticCurveTo(this.xScale(prevD.t), this.yScale(prevD.wp), cpx, cpy);
      }
    });
    
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }
  
  drawEventMarkers() {
    this.ctx.fillStyle = this.options.colors.events;
    this.ctx.strokeStyle = this.options.colors.background;
    this.ctx.lineWidth = 2;
    
    this.data.filter(d => d.event).forEach(d => {
      const x = this.xScale(d.t);
      const y = this.yScale(d.wp);
      
      // Draw pulse effect for recent events
      const age = Date.now() - d.t;
      if (age < 2000) {
        const opacity = Math.max(0, 1 - age / 2000);
        this.ctx.save();
        this.ctx.globalAlpha = opacity * 0.3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15 + (age / 100), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
      
      // Draw marker
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Draw event label
      if (d.event.label) {
        this.ctx.save();
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '10px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(d.event.label, x, y - 10);
        this.ctx.restore();
      }
    });
  }
  
  drawCurrentValue() {
    if (this.data.length === 0) return;
    
    const latest = this.data[this.data.length - 1];
    
    // Draw value box
    const boxX = this.options.width - 150;
    const boxY = 35;
    
    this.ctx.fillStyle = 'rgba(17, 34, 64, 0.9)';
    this.ctx.strokeStyle = this.options.colors.winProb;
    this.ctx.lineWidth = 1;
    
    this.ctx.fillRect(boxX, boxY, 140, 60);
    this.ctx.strokeRect(boxX, boxY, 140, 60);
    
    // Win probability
    this.ctx.fillStyle = this.options.colors.winProb;
    this.ctx.font = 'bold 24px Roboto Mono, monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`${(latest.wp * 100).toFixed(1)}%`, boxX + 130, boxY + 30);
    
    // Pressure indicator
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '11px Inter, sans-serif';
    this.ctx.fillText('WIN PROBABILITY', boxX + 130, boxY + 15);
    
    // Pressure level
    const pressureLevel = latest.pressure > 0.7 ? 'EXTREME' : 
                         latest.pressure > 0.5 ? 'HIGH' : 
                         latest.pressure > 0.3 ? 'MODERATE' : 'LOW';
    const pressureColor = latest.pressure > 0.7 ? '#ef4444' : 
                         latest.pressure > 0.5 ? this.options.colors.events : 
                         latest.pressure > 0.3 ? '#f59e0b' : '#10b981';
    
    this.ctx.fillStyle = pressureColor;
    this.ctx.font = 'bold 11px Inter, sans-serif';
    this.ctx.fillText(`${pressureLevel} PRESSURE`, boxX + 130, boxY + 50);
  }
  
  render() {
    this.drawBackground();
    this.drawPressureGlow();
    this.drawWinProbabilityLine();
    this.drawEventMarkers();
    this.drawCurrentValue();
  }
  
  animate(timestamp) {
    if (timestamp - this.lastUpdate >= this.frameInterval) {
      this.render();
      this.lastUpdate = timestamp;
    }
    
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }
  
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.element.innerHTML = '';
  }
  
  // Connect to live data stream with WebSocket and SSE fallback
  connectToStream(endpoint) {
    this.connectionStatus = 'connecting';
    this.updateConnectionStatus();
    
    // Try WebSocket first, fallback to SSE
    this.tryWebSocketConnection(endpoint).catch(() => {
      console.log('WebSocket failed, falling back to SSE');
      this.connectToSSE(endpoint);
    });
  }

  tryWebSocketConnection(endpoint) {
    return new Promise((resolve, reject) => {
      const wsUrl = endpoint.replace('http', 'ws').replace('/stream', '/ws');
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected to pressure stream');
        this.connectionStatus = 'connected';
        this.connectionType = 'websocket';
        this.updateConnectionStatus();
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const tick = JSON.parse(event.data);
          this.updateData(tick);
          this.updateLiveDOMElements(tick);
        } catch (error) {
          console.error('Error parsing WebSocket pressure data:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        this.connectionStatus = 'error';
        this.updateConnectionStatus();
        reject(error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.connectionStatus = 'disconnected';
        this.updateConnectionStatus();
        // Attempt reconnection after 3 seconds
        setTimeout(() => this.connectToStream(endpoint), 3000);
      };
      
      // Timeout after 5 seconds if connection doesn't open
      setTimeout(() => {
        if (this.ws.readyState !== WebSocket.OPEN) {
          this.ws.close();
          reject(new Error('WebSocket connection timeout'));
        }
      }, 5000);
    });
  }

  connectToSSE(endpoint) {
    if (this.eventSource) {
      this.eventSource.close();
    }
    
    this.eventSource = new EventSource(endpoint);
    this.connectionType = 'sse';
    
    this.eventSource.onopen = () => {
      console.log('SSE connected to pressure stream');
      this.connectionStatus = 'connected';
      this.updateConnectionStatus();
    };
    
    this.eventSource.onmessage = (event) => {
      try {
        const tick = JSON.parse(event.data);
        this.updateData(tick);
        this.updateLiveDOMElements(tick);
      } catch (error) {
        console.error('Error parsing SSE pressure data:', error);
      }
    };
    
    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.connectionStatus = 'error';
      this.updateConnectionStatus();
      // Attempt reconnection after 5 seconds
      setTimeout(() => this.connectToSSE(endpoint), 5000);
    };
  }

  // Update live DOM elements with real-time data
  updateLiveDOMElements(tick) {
    // Update live pressure status
    const pressureStatus = document.getElementById('livePressureStatus');
    if (pressureStatus) {
      const pressureLevel = tick.pressure > 0.7 ? 'EXTREME' : 
                           tick.pressure > 0.5 ? 'HIGH' : 
                           tick.pressure > 0.3 ? 'MODERATE' : 'LOW';
      const pressureColor = tick.pressure > 0.7 ? '#ef4444' : 
                           tick.pressure > 0.5 ? '#BF5700' : 
                           tick.pressure > 0.3 ? '#f59e0b' : '#10b981';
      
      pressureStatus.innerHTML = `
        <span style="color: ${pressureColor}; font-weight: bold;">
          ${pressureLevel} PRESSURE
        </span>
        <div style="font-size: 0.8em; color: #64748b;">
          ${(tick.pressure * 100).toFixed(1)}%
        </div>
      `;
    }

    // Update live clutch status
    const clutchStatus = document.getElementById('liveClutchStatus');
    if (clutchStatus && tick.clutchFactor) {
      clutchStatus.innerHTML = `
        <span style="color: #9BCBEB; font-weight: bold;">
          CLUTCH: ${(tick.clutchFactor * 100).toFixed(1)}%
        </span>
      `;
    }

    // Update Win Probability
    const wpDisplay = document.querySelector('#livePressureStatus .wp-display, .win-probability-display');
    if (wpDisplay && tick.wp) {
      wpDisplay.textContent = `${(tick.wp * 100).toFixed(1)}%`;
    }

    // Update Down/Distance
    const downDistance = document.querySelector('.down-distance-display, #downDistanceDisplay');
    if (downDistance && tick.gameState) {
      const { down, distance, yardline } = tick.gameState;
      downDistance.innerHTML = `
        <span class="down">${down}${this.getOrdinalSuffix(down)} & ${distance}</span>
        <span class="yardline">at ${100 - yardline} yard line</span>
      `;
    }

    // Update live KPIs
    this.updateLiveKPIs(tick);
  }

  // Update KPI displays with live data
  updateLiveKPIs(tick) {
    const kpiElements = document.querySelectorAll('.kpi-live-value');
    if (kpiElements.length > 0 && tick.kpis) {
      kpiElements.forEach((el, index) => {
        const kpiKey = el.dataset.kpi;
        if (tick.kpis[kpiKey]) {
          el.textContent = tick.kpis[kpiKey];
          // Add pulse effect for updates
          el.classList.add('kpi-updated');
          setTimeout(() => el.classList.remove('kpi-updated'), 1000);
        }
      });
    }
  }

  // Helper for ordinal suffixes
  getOrdinalSuffix(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return 'th';
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  }

  // Update connection status indicator
  updateConnectionStatus() {
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
      const statusColors = {
        connecting: '#f59e0b',
        connected: '#10b981',
        error: '#ef4444',
        disconnected: '#64748b'
      };
      
      statusEl.innerHTML = `
        <span style="color: ${statusColors[this.connectionStatus]};">
          ● ${this.connectionStatus.toUpperCase()}
        </span>
        ${this.connectionType ? `<span style="font-size: 0.8em;"> (${this.connectionType.toUpperCase()})</span>` : ''}
      `;
    }
  }

  // Close all connections
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.eventSource) {
      this.eventSource.close();
    }
    this.connectionStatus = 'disconnected';
    this.updateConnectionStatus();
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PressureStream;
} else {
  window.PressureStream = PressureStream;
}