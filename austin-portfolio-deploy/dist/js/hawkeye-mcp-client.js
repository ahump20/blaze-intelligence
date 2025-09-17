// Hawk-Eye MCP Client for Blaze Intelligence
// Championship Sports Analytics Integration

class HawkEyeMCPClient {
  constructor() {
    this.apiUrl = '/api/mcp-proxy';
    this.sessionId = null;
    this.initialized = false;
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  async initialize() {
    if (this.initialized) return true;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {}
          }
        })
      });

      const data = await response.json();
      if (data.result) {
        this.initialized = true;
        console.log('🏆 Hawk-Eye MCP Client initialized');
        return true;
      }
    } catch (error) {
      console.error('Failed to initialize MCP client:', error);
      return false;
    }
  }

  async callTool(toolName, args = {}) {
    // Check cache first
    const cacheKey = `${toolName}_${JSON.stringify(args)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Ensure initialized
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args
          }
        })
      });

      const data = await response.json();
      if (data.result && data.result.content) {
        const resultText = data.result.content[0].text;
        const parsedResult = JSON.parse(resultText);

        // Cache the result
        this.cache.set(cacheKey, {
          data: parsedResult,
          timestamp: Date.now()
        });

        return parsedResult;
      }
    } catch (error) {
      console.error(`MCP tool call failed for ${toolName}:`, error);
      return null;
    }
  }

  // Championship Analytics Tools
  async getPerfectGameProspects(ageGroup = '17u', region = 'southeast', limit = 10) {
    return this.callTool('get_perfect_game_prospects', { ageGroup, region, limit });
  }

  async getSECTeamData(sport = 'football', season = '2024') {
    return this.callTool('get_sec_team_data', { sport, season });
  }

  async analyzeNILValuations(sport = 'football', school = null) {
    return this.callTool('analyze_nil_valuations', { sport, school });
  }

  async getCardinalsReadiness() {
    return this.callTool('get_cardinals_readiness', {});
  }

  async getChampionshipDashboard() {
    return this.callTool('get_championship_dashboard', {});
  }

  async analyzeStrikeZone(pitchX, pitchZ, batterHeight = 72) {
    return this.callTool('analyze_strike_zone', {
      pitch_x: pitchX,
      pitch_z: pitchZ,
      batter_height: batterHeight
    });
  }

  async predictTrajectory(velocity, spinRate, releaseHeight = 6) {
    return this.callTool('predict_trajectory', {
      initial_velocity: velocity,
      spin_rate: spinRate,
      release_height: releaseHeight
    });
  }

  async parseTrackingCSV(csvData) {
    return this.callTool('parse_tracking_csv', { csv: csvData });
  }
}

// Real-time Data Integration Manager
class BlazeRealTimeIntegration {
  constructor() {
    this.mcpClient = new HawkEyeMCPClient();
    this.updateInterval = 30000; // 30 seconds
    this.activeUpdates = new Map();
  }

  async init() {
    await this.mcpClient.initialize();
    console.log('🚀 Blaze Real-Time Integration initialized');
  }

  // Update NIL valuations on the page
  async updateNILValuations() {
    const nilData = await this.mcpClient.analyzeNILValuations('football', 'Texas');
    if (nilData && nilData.length > 0) {
      const archManning = nilData[0];

      // Update all NIL value displays on the page
      document.querySelectorAll('[data-nil-value]').forEach(element => {
        const formattedValue = `$${(archManning.estimatedValue / 1000000).toFixed(1)}M`;
        element.textContent = formattedValue;
        element.classList.add('updated-flash');
        setTimeout(() => element.classList.remove('updated-flash'), 1000);
      });

      // Update social media followers
      document.querySelectorAll('[data-nil-followers]').forEach(element => {
        element.textContent = `${(archManning.socialMediaFollowers / 1000).toFixed(0)}K followers`;
      });
    }
  }

  // Update SEC team standings
  async updateSECStandings() {
    const secData = await this.mcpClient.getSECTeamData('football', '2024');
    if (secData && secData.length > 0) {
      const container = document.getElementById('sec-standings');
      if (container) {
        container.innerHTML = secData.map(team => `
          <div class="team-card">
            <h4>${team.school}</h4>
            <div class="stats">
              <span>Record: ${team.wins}-${team.losses}</span>
              <span>Conference: ${team.conferenceRecord}</span>
              <span>Championship: ${team.championshipPotential}%</span>
              <span>NIL Efficiency: ${team.nilEfficiency}</span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Update Cardinals readiness metrics
  async updateCardinalsReadiness() {
    const readiness = await this.mcpClient.getCardinalsReadiness();
    if (readiness) {
      // Update team readiness score
      document.querySelectorAll('[data-cardinals-readiness]').forEach(element => {
        element.textContent = `${readiness.teamReadiness}%`;
        element.style.color = readiness.teamReadiness > 75 ? '#00ff7f' : '#ffa500';
      });

      // Update key players
      const playersContainer = document.getElementById('cardinals-players');
      if (playersContainer && readiness.keyPlayers) {
        playersContainer.innerHTML = readiness.keyPlayers.map(player => `
          <div class="player-card">
            <h5>${player.name} (${player.position})</h5>
            <div class="readiness-score" style="color: ${player.readinessScore > 80 ? '#00ff7f' : '#ffa500'}">
              Readiness: ${player.readinessScore}%
            </div>
            <div class="stats">${player.recentPerformance}</div>
            <div class="health">${player.health}</div>
          </div>
        `).join('');
      }
    }
  }

  // Update Perfect Game prospects
  async updatePerfectGameProspects() {
    const prospects = await this.mcpClient.getPerfectGameProspects('17u', 'southeast', 5);
    if (prospects && prospects.length > 0) {
      const container = document.getElementById('perfect-game-prospects');
      if (container) {
        container.innerHTML = prospects.map(prospect => `
          <div class="prospect-card">
            <h5>${prospect.name} - ${prospect.position}</h5>
            <div class="school">${prospect.school}</div>
            <div class="commitment">${prospect.commitmentStatus}</div>
            <div class="metrics">
              ${prospect.exitVelocity ? `Exit Velo: ${prospect.exitVelocity} mph` : ''}
              ${prospect.sixtyTime ? `60-yard: ${prospect.sixtyTime}s` : ''}
            </div>
            <div class="grade">Grade: ${prospect.overallGrade} | Rank: #${prospect.perfectGameRank}</div>
          </div>
        `).join('');
      }
    }
  }

  // Update championship dashboard
  async updateChampionshipDashboard() {
    const dashboard = await this.mcpClient.getChampionshipDashboard();
    if (dashboard) {
      // Update last updated timestamp
      document.querySelectorAll('[data-last-updated]').forEach(element => {
        const time = new Date(dashboard.lastUpdated);
        element.textContent = `Last updated: ${time.toLocaleTimeString()}`;
      });

      // Trigger specific updates based on dashboard data
      if (dashboard.perfectGameHighlights) {
        this.updatePerfectGameProspects();
      }
      if (dashboard.secStandings) {
        this.updateSECStandings();
      }
      if (dashboard.cardinalsReadiness) {
        this.updateCardinalsReadiness();
      }
    }
  }

  // Start automatic updates
  startAutoUpdates() {
    // Initial update
    this.updateAll();

    // Set up interval updates
    this.activeUpdates.set('championship', setInterval(() => {
      this.updateChampionshipDashboard();
    }, this.updateInterval));

    this.activeUpdates.set('nil', setInterval(() => {
      this.updateNILValuations();
    }, this.updateInterval * 2)); // Every 60 seconds

    console.log('⚡ Real-time updates started (30-second intervals)');
  }

  // Update all data
  async updateAll() {
    console.log('🔄 Updating all championship data...');
    await Promise.all([
      this.updateChampionshipDashboard(),
      this.updateNILValuations(),
      this.updateSECStandings(),
      this.updateCardinalsReadiness(),
      this.updatePerfectGameProspects()
    ]);
    console.log('✅ All data updated');
  }

  // Stop automatic updates
  stopAutoUpdates() {
    this.activeUpdates.forEach(interval => clearInterval(interval));
    this.activeUpdates.clear();
    console.log('⏹️ Real-time updates stopped');
  }
}

// Initialize on page load
let blazeIntegration;

document.addEventListener('DOMContentLoaded', async () => {
  // Add update flash animation style
  const style = document.createElement('style');
  style.textContent = `
    .updated-flash {
      animation: flash 1s ease-in-out;
    }
    @keyframes flash {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; background-color: #00ff7f; }
    }
    .live-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      background-color: #00ff7f;
      border-radius: 50%;
      animation: pulse 2s infinite;
      margin-left: 8px;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }
  `;
  document.head.appendChild(style);

  // Initialize integration
  blazeIntegration = new BlazeRealTimeIntegration();
  await blazeIntegration.init();

  // Start automatic updates
  blazeIntegration.startAutoUpdates();

  // Add live indicator to header
  const header = document.querySelector('h1, .hero-title');
  if (header) {
    const indicator = document.createElement('span');
    indicator.className = 'live-indicator';
    indicator.title = 'Real-time data active';
    header.appendChild(indicator);
  }

  console.log('🏆 Hawk-Eye MCP integration active on Blaze Intelligence');
});

// Export for use in other scripts
window.HawkEyeMCPClient = HawkEyeMCPClient;
window.BlazeRealTimeIntegration = BlazeRealTimeIntegration;