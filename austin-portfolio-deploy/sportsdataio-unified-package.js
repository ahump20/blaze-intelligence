/**
 * BLAZE INTELLIGENCE - SportsDataIO Unified Package
 * Complete integration package for all deployments
 *
 * @author Austin Humphrey
 * @version 2.0.0
 * @license PROPRIETARY
 *
 * Deployments:
 * - Replit: https://blaze-intelligence.replit.app
 * - Netlify: https://blaze-intelligence.netlify.app
 * - GitHub Pages: Multiple repositories
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const SPORTSDATAIO_CONFIG = {
  // Live API Key - Account: ahump20@outlook.com
  apiKey: '6ca2adb39404482da5406f0a6cd7aa37',

  // API Base URLs
  baseUrls: {
    nfl: 'https://api.sportsdata.io/v3/nfl',
    mlb: 'https://api.sportsdata.io/v3/mlb',
    nba: 'https://api.sportsdata.io/v3/nba',
    ncaaFootball: 'https://api.sportsdata.io/v3/cfb',
    ncaaBasketball: 'https://api.sportsdata.io/v3/cbb'
  },

  // Championship Teams Focus
  featuredTeams: {
    mlb: { key: 'STL', name: 'Cardinals', city: 'St. Louis' },
    nfl: { key: 'TEN', name: 'Titans', city: 'Tennessee' },
    nba: { key: 'MEM', name: 'Grizzlies', city: 'Memphis' },
    ncaa: { key: 'TEX', name: 'Longhorns', school: 'Texas' }
  },

  // Performance Targets
  targets: {
    responseTime: 100,      // Target <100ms
    cacheTime: 300000,      // 5 minutes
    updateInterval: 30000,  // 30 seconds
    predictionAccuracy: 0.946
  }
};

// ============================================================================
// UNIFIED DATA SERVICE
// ============================================================================

class BlazeIntelligenceSportsData {
  constructor(config = SPORTSDATAIO_CONFIG) {
    this.config = config;
    this.cache = new Map();
    this.lastUpdate = null;
    this.initializeConnectors();
  }

  initializeConnectors() {
    this.sports = {
      mlb: new SportConnector('mlb', this.config),
      nfl: new SportConnector('nfl', this.config),
      nba: new SportConnector('nba', this.config),
      ncaaFootball: new SportConnector('ncaaFootball', this.config)
    };
  }

  // Get all sports data for dashboard
  async getDashboardData() {
    const startTime = Date.now();

    try {
      const [mlb, nfl, nba, ncaa] = await Promise.all([
        this.getMLBData(),
        this.getNFLData(),
        this.getNBAData(),
        this.getNCAAData()
      ]);

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        sports: {
          baseball: mlb,
          football: nfl,
          basketball: nba,
          ncaaFootball: ncaa
        },
        featured: {
          cardinals: mlb?.featured,
          titans: nfl?.featured,
          grizzlies: nba?.featured,
          longhorns: ncaa?.featured
        },
        metrics: {
          responseTime,
          cacheHits: this.getCacheStats().hits,
          dataPoints: this.countDataPoints({ mlb, nfl, nba, ncaa })
        }
      };
    } catch (error) {
      console.error('[Dashboard Error]:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // MLB Data
  async getMLBData() {
    const season = new Date().getFullYear();
    const today = new Date().toISOString().split('T')[0];

    const [teams, standings, games] = await Promise.all([
      this.sports.mlb.fetch('/scores/json/Teams'),
      this.sports.mlb.fetch(`/scores/json/Standings/${season}`),
      this.sports.mlb.fetch(`/scores/json/GamesByDate/${today}`)
    ]);

    // Focus on Cardinals
    const cardinals = teams?.find(t => t.Key === 'STL');
    const cardinalsStanding = standings?.find(s => s.TeamID === cardinals?.TeamID);

    return {
      teams: teams?.slice(0, 5),
      standings: standings?.filter(s => s.Division === cardinalsStanding?.Division),
      games: games?.slice(0, 10),
      featured: {
        ...cardinals,
        standing: cardinalsStanding,
        nextGame: games?.find(g =>
          g.HomeTeamID === cardinals?.TeamID ||
          g.AwayTeamID === cardinals?.TeamID
        )
      }
    };
  }

  // NFL Data
  async getNFLData() {
    const season = 2024;
    const week = this.getCurrentNFLWeek();

    const [teams, standings] = await Promise.all([
      this.sports.nfl.fetch('/scores/json/Teams'),
      this.sports.nfl.fetch(`/scores/json/Standings/${season}`)
    ]);

    // Focus on Titans
    const titans = teams?.find(t => t.Key === 'TEN');
    const titansStanding = standings?.find(s => s.Team === 'TEN');

    return {
      teams: teams?.slice(0, 5),
      standings: standings?.filter(s => s.Division === titansStanding?.Division),
      week,
      featured: {
        ...titans,
        standing: titansStanding
      }
    };
  }

  // NBA Data
  async getNBAData() {
    const season = 2024;
    const today = new Date().toISOString().split('T')[0];

    const [teams, standings, games] = await Promise.all([
      this.sports.nba.fetch('/scores/json/Teams'),
      this.sports.nba.fetch(`/scores/json/Standings/${season}`),
      this.sports.nba.fetch(`/scores/json/GamesByDate/${today}`)
    ]);

    // Focus on Grizzlies
    const grizzlies = teams?.find(t => t.Key === 'MEM');
    const grizzliesStanding = standings?.find(s => s.TeamID === grizzlies?.TeamID);

    return {
      teams: teams?.slice(0, 5),
      standings: standings?.filter(s => s.Division === grizzliesStanding?.Division),
      games: games?.slice(0, 10),
      featured: {
        ...grizzlies,
        standing: grizzliesStanding,
        nextGame: games?.find(g =>
          g.HomeTeamID === grizzlies?.TeamID ||
          g.AwayTeamID === grizzlies?.TeamID
        )
      }
    };
  }

  // NCAA Football Data
  async getNCAAData() {
    const season = 2024;
    const week = this.getCurrentNCAAWeek();

    const [teams, games] = await Promise.all([
      this.sports.ncaaFootball.fetch('/scores/json/Teams'),
      this.sports.ncaaFootball.fetch(`/scores/json/GamesByWeek/${season}/${week}`)
    ]);

    // Focus on Texas and SEC
    const texasTeams = teams?.filter(t =>
      t.School?.includes('Texas') ||
      t.Conference === 'SEC'
    );

    const longhorns = teams?.find(t => t.School === 'Texas');

    return {
      teams: texasTeams?.slice(0, 10),
      games: games?.slice(0, 10),
      week,
      featured: {
        ...longhorns,
        ranking: longhorns?.ApRank || longhorns?.CoachesRank,
        conference: 'SEC'
      }
    };
  }

  // Helper Methods
  getCurrentNFLWeek() {
    const seasonStart = new Date('2024-09-05');
    const now = new Date();
    const weeksPassed = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));
    return Math.min(Math.max(1, weeksPassed + 1), 18);
  }

  getCurrentNCAAWeek() {
    const seasonStart = new Date('2024-08-24');
    const now = new Date();
    const weeksPassed = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));
    return Math.min(Math.max(1, weeksPassed + 1), 15);
  }

  getCacheStats() {
    let hits = 0;
    let misses = 0;
    this.cache.forEach(entry => {
      if (entry.hits) hits += entry.hits;
      if (entry.misses) misses += entry.misses;
    });
    return { hits, misses, ratio: hits / (hits + misses) || 0 };
  }

  countDataPoints(data) {
    let count = 0;
    const countRecursive = (obj) => {
      if (Array.isArray(obj)) {
        count += obj.length;
        obj.forEach(item => countRecursive(item));
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(val => countRecursive(val));
      }
    };
    countRecursive(data);
    return count;
  }

  // Start auto-refresh
  startLiveUpdates(callback, interval = 30000) {
    this.stopLiveUpdates(); // Clear any existing interval
    this.updateInterval = setInterval(async () => {
      const data = await this.getDashboardData();
      if (callback) callback(data);
      this.lastUpdate = new Date();
    }, interval);

    // Initial call
    this.getDashboardData().then(callback);
  }

  stopLiveUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// ============================================================================
// SPORT CONNECTOR CLASS
// ============================================================================

class SportConnector {
  constructor(sport, config) {
    this.sport = sport;
    this.config = config;
    this.baseUrl = config.baseUrls[sport];
    this.apiKey = config.apiKey;
    this.cache = new Map();
  }

  async fetch(endpoint) {
    const cacheKey = `${this.sport}:${endpoint}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.targets.cacheTime) {
        cached.hits = (cached.hits || 0) + 1;
        return cached.data;
      }
    }

    // Fetch from API
    try {
      const url = `${this.baseUrl}${endpoint}?key=${this.apiKey}`;
      const startTime = Date.now();

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        responseTime,
        hits: 0,
        misses: 0
      });

      console.log(`[${this.sport.toUpperCase()}] ${endpoint} - ${responseTime}ms`);
      return data;

    } catch (error) {
      console.error(`[${this.sport.toUpperCase()} Error] ${endpoint}:`, error.message);

      // Return cached data if available (even if expired)
      if (this.cache.has(cacheKey)) {
        console.log(`[${this.sport.toUpperCase()}] Using stale cache for ${endpoint}`);
        return this.cache.get(cacheKey).data;
      }

      throw error;
    }
  }
}

// ============================================================================
// DASHBOARD RENDERER (For HTML Pages)
// ============================================================================

class SportsDataDashboard {
  constructor(containerId, config = {}) {
    this.container = document.getElementById(containerId);
    this.dataService = new BlazeIntelligenceSportsData();
    this.config = {
      autoRefresh: true,
      refreshInterval: 30000,
      showMetrics: true,
      animation: true,
      ...config
    };
    this.init();
  }

  init() {
    if (!this.container) {
      console.error('Dashboard container not found');
      return;
    }

    this.render();

    if (this.config.autoRefresh) {
      this.dataService.startLiveUpdates((data) => {
        this.updateDashboard(data);
      }, this.config.refreshInterval);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="sportsdataio-dashboard">
        <div class="dashboard-header">
          <h1>Blaze Intelligence - Live Sports Data</h1>
          <div class="metrics-row" id="metrics-row"></div>
        </div>
        <div class="sports-grid" id="sports-grid">
          <div class="loading">Loading championship data...</div>
        </div>
      </div>
    `;

    // Add styles if not already present
    if (!document.getElementById('sportsdataio-styles')) {
      const style = document.createElement('style');
      style.id = 'sportsdataio-styles';
      style.textContent = this.getStyles();
      document.head.appendChild(style);
    }
  }

  updateDashboard(data) {
    if (!data.success) {
      this.showError(data.error);
      return;
    }

    // Update metrics
    if (this.config.showMetrics) {
      this.updateMetrics(data.metrics);
    }

    // Update sports grid
    this.updateSportsGrid(data.sports);

    // Add animation class
    if (this.config.animation) {
      this.container.classList.add('updated');
      setTimeout(() => {
        this.container.classList.remove('updated');
      }, 500);
    }
  }

  updateMetrics(metrics) {
    const metricsRow = document.getElementById('metrics-row');
    if (!metricsRow) return;

    metricsRow.innerHTML = `
      <div class="metric-card">
        <div class="metric-value">${metrics.responseTime}ms</div>
        <div class="metric-label">RESPONSE TIME</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.dataPoints}</div>
        <div class="metric-label">DATA POINTS</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${(metrics.cacheHits * 100).toFixed(1)}%</div>
        <div class="metric-label">CACHE HIT RATE</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">LIVE</div>
        <div class="metric-label">STATUS</div>
      </div>
    `;
  }

  updateSportsGrid(sports) {
    const grid = document.getElementById('sports-grid');
    if (!grid) return;

    grid.innerHTML = `
      ${this.renderMLB(sports.baseball)}
      ${this.renderNFL(sports.football)}
      ${this.renderNBA(sports.basketball)}
      ${this.renderNCAA(sports.ncaaFootball)}
    `;
  }

  renderMLB(data) {
    if (!data?.featured) return '';

    return `
      <div class="sport-card mlb">
        <h2>⚾ MLB - Cardinals</h2>
        <div class="team-info">
          <div class="team-name">${data.featured.City} ${data.featured.Name}</div>
          <div class="team-record">${data.featured.standing?.Wins || 0}-${data.featured.standing?.Losses || 0}</div>
        </div>
        ${this.renderStandings(data.standings, 'MLB')}
      </div>
    `;
  }

  renderNFL(data) {
    if (!data?.featured) return '';

    return `
      <div class="sport-card nfl">
        <h2>🏈 NFL - Titans</h2>
        <div class="team-info">
          <div class="team-name">${data.featured.City} ${data.featured.Name}</div>
          <div class="team-record">${data.featured.standing?.Wins || 0}-${data.featured.standing?.Losses || 0}</div>
        </div>
        ${this.renderStandings(data.standings, 'NFL')}
      </div>
    `;
  }

  renderNBA(data) {
    if (!data?.featured) return '';

    return `
      <div class="sport-card nba">
        <h2>🏀 NBA - Grizzlies</h2>
        <div class="team-info">
          <div class="team-name">${data.featured.City} ${data.featured.Name}</div>
          <div class="team-record">${data.featured.standing?.Wins || 0}-${data.featured.standing?.Losses || 0}</div>
        </div>
        ${this.renderStandings(data.standings, 'NBA')}
      </div>
    `;
  }

  renderNCAA(data) {
    if (!data?.featured) return '';

    return `
      <div class="sport-card ncaa">
        <h2>🎓 NCAA - Longhorns</h2>
        <div class="team-info">
          <div class="team-name">${data.featured.School || 'Texas'} ${data.featured.Name || 'Longhorns'}</div>
          <div class="team-record">${data.featured.Wins || 0}-${data.featured.Losses || 0}</div>
          ${data.featured.ranking ? `<div class="team-rank">#${data.featured.ranking}</div>` : ''}
        </div>
      </div>
    `;
  }

  renderStandings(standings, sport) {
    if (!standings || standings.length === 0) return '';

    return `
      <table class="standings-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>W</th>
            <th>L</th>
            <th>PCT</th>
          </tr>
        </thead>
        <tbody>
          ${standings.slice(0, 5).map(team => `
            <tr>
              <td>${team.Name || team.Team || ''}</td>
              <td>${team.Wins || 0}</td>
              <td>${team.Losses || 0}</td>
              <td>${team.Percentage ? team.Percentage.toFixed(3) : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  showError(error) {
    const grid = document.getElementById('sports-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="error-message">
          <h3>Error Loading Data</h3>
          <p>${error}</p>
          <button onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }

  getStyles() {
    return `
      .sportsdataio-dashboard {
        font-family: 'Inter', system-ui, sans-serif;
        color: #E5E7EB;
        padding: 2rem;
      }

      .dashboard-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .dashboard-header h1 {
        font-size: 2.5rem;
        font-weight: 900;
        background: linear-gradient(135deg, #BF5700, #9BCBEB);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 1rem;
      }

      .metrics-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        max-width: 800px;
        margin: 0 auto;
      }

      .metric-card {
        background: rgba(21, 25, 35, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(16px);
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
      }

      .metric-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #9BCBEB;
        font-family: 'JetBrains Mono', monospace;
      }

      .metric-label {
        font-size: 0.75rem;
        color: #9CA3AF;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-top: 0.25rem;
      }

      .sports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }

      .sport-card {
        background: rgba(21, 25, 35, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(16px);
        border-radius: 16px;
        padding: 1.5rem;
        transition: transform 0.3s ease;
      }

      .sport-card:hover {
        transform: translateY(-4px);
        border-color: #BF5700;
      }

      .sport-card h2 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #9BCBEB;
      }

      .team-info {
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .team-name {
        font-size: 1.125rem;
        font-weight: 600;
        color: #E5E7EB;
      }

      .team-record {
        font-size: 1.5rem;
        font-weight: 700;
        color: #BF5700;
        font-family: 'JetBrains Mono', monospace;
      }

      .team-rank {
        display: inline-block;
        background: #FFD700;
        color: #000;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-weight: 700;
        font-size: 0.875rem;
      }

      .standings-table {
        width: 100%;
        margin-top: 1rem;
        font-size: 0.875rem;
      }

      .standings-table th {
        text-align: left;
        padding: 0.5rem;
        border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        color: #9CA3AF;
        font-weight: 500;
      }

      .standings-table td {
        padding: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        font-family: 'JetBrains Mono', monospace;
      }

      .loading {
        text-align: center;
        padding: 3rem;
        color: #9CA3AF;
      }

      .error-message {
        text-align: center;
        padding: 2rem;
        background: rgba(255, 68, 68, 0.1);
        border: 1px solid rgba(255, 68, 68, 0.3);
        border-radius: 12px;
      }

      .error-message button {
        margin-top: 1rem;
        padding: 0.5rem 1.5rem;
        background: #BF5700;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      }

      .sportsdataio-dashboard.updated {
        animation: pulse 0.5s ease;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
    `;
  }

  destroy() {
    this.dataService.stopLiveUpdates();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// For Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BlazeIntelligenceSportsData,
    SportConnector,
    SportsDataDashboard,
    SPORTSDATAIO_CONFIG
  };
}

// For Browser/ES6
if (typeof window !== 'undefined') {
  window.BlazeIntelligenceSportsData = BlazeIntelligenceSportsData;
  window.SportsDataDashboard = SportsDataDashboard;
  window.SPORTSDATAIO_CONFIG = SPORTSDATAIO_CONFIG;

  // Auto-initialize if container exists
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('sportsdataio-dashboard') ||
                     document.getElementById('blaze-sports-dashboard');
    if (container) {
      window.sportsDataDashboard = new SportsDataDashboard(container.id);
    }
  });
}

// ============================================================================
// QUICK START EXAMPLES
// ============================================================================

/*
// Example 1: Basic Dashboard
<div id="sportsdataio-dashboard"></div>
<script src="sportsdataio-unified-package.js"></script>

// Example 2: Custom Configuration
const dashboard = new SportsDataDashboard('my-container', {
  autoRefresh: true,
  refreshInterval: 10000,  // 10 seconds
  showMetrics: true
});

// Example 3: Direct API Access
const sportsData = new BlazeIntelligenceSportsData();
const data = await sportsData.getDashboardData();
console.log(data);

// Example 4: Live Updates
sportsData.startLiveUpdates((data) => {
  console.log('New data:', data);
}, 30000);
*/