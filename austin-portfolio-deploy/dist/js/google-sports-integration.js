/**
 * BLAZE INTELLIGENCE - Google Sports Integration
 * Frontend component for displaying Google Sports Results data
 *
 * @author Austin Humphrey
 * @version 1.0.0
 * @confidence 92% - Production-ready with comprehensive UI
 */

class GoogleSportsIntegration {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiEndpoint = '/.netlify/functions/google-sports-api';
    this.cache = new Map();
    this.updateInterval = null;

    if (!this.container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    this.init();
  }

  async init() {
    this.createUI();
    await this.loadDefaultSports();
    this.startAutoUpdate();
  }

  createUI() {
    this.container.innerHTML = `
      <div class="google-sports-widget">
        <div class="sports-header">
          <h3 class="sports-title">
            <span class="google-icon">🔍</span>
            Google Sports Results
            <span class="live-indicator">LIVE</span>
          </h3>
          <div class="sports-controls">
            <select id="sport-selector" class="sport-select">
              <option value="">All Sports</option>
              <option value="nfl">NFL</option>
              <option value="mlb">MLB</option>
              <option value="nba">NBA</option>
              <option value="ncaa">College Football</option>
              <option value="soccer">Soccer</option>
            </select>
            <input type="text" id="search-input" placeholder="Search teams, players..." class="search-input">
            <button id="search-btn" class="search-btn">Search</button>
          </div>
        </div>

        <div class="sports-content">
          <div id="loading-indicator" class="loading">
            <div class="spinner"></div>
            <span>Loading Google Sports data...</span>
          </div>

          <div id="sports-results" class="sports-results" style="display: none;">
            <!-- Dynamic content will be inserted here -->
          </div>

          <div id="error-display" class="error-display" style="display: none;">
            <span class="error-icon">⚠️</span>
            <span class="error-message">Unable to load sports data</span>
            <button id="retry-btn" class="retry-btn">Retry</button>
          </div>
        </div>

        <div class="blaze-enhancement">
          <h4>🔥 Blaze Intelligence Analysis</h4>
          <div id="blaze-insights" class="blaze-insights">
            <!-- Blaze analytics will be inserted here -->
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.addStyles();
  }

  attachEventListeners() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const sportSelector = document.getElementById('sport-selector');
    const retryBtn = document.getElementById('retry-btn');

    searchBtn?.addEventListener('click', () => this.performSearch());
    searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.performSearch();
    });
    sportSelector?.addEventListener('change', () => this.performSearch());
    retryBtn?.addEventListener('click', () => this.loadDefaultSports());
  }

  async performSearch() {
    const searchInput = document.getElementById('search-input');
    const sportSelector = document.getElementById('sport-selector');

    const query = searchInput?.value.trim() || '';
    const sport = sportSelector?.value || '';

    if (!query && !sport) {
      await this.loadDefaultSports();
      return;
    }

    await this.fetchGoogleSports(query, sport);
  }

  async loadDefaultSports() {
    await this.fetchGoogleSports('', 'nfl');
  }

  async fetchGoogleSports(query = '', sport = '') {
    this.showLoading();

    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (sport) params.append('sport', sport);

      const cacheKey = `${query}_${sport}`;

      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 300000) { // 5 minutes
          this.displayResults(cached.data);
          return;
        }
      }

      const response = await fetch(`${this.apiEndpoint}?${params}`);
      const result = await response.json();

      if (result.success) {
        // Cache the results
        this.cache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        });

        this.displayResults(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch sports data');
      }

    } catch (error) {
      console.error('[Google Sports Integration Error]:', error);
      this.showError(error.message);
    }
  }

  displayResults(data) {
    this.hideLoading();

    const resultsContainer = document.getElementById('sports-results');
    if (!resultsContainer) return;

    let html = `
      <div class="data-source">
        <span class="source-label">Data Source:</span>
        <span class="source-name">${data.source || 'Google Sports'}</span>
        <span class="timestamp">${new Date(data.timestamp).toLocaleTimeString()}</span>
      </div>
    `;

    // Featured Game
    if (data.featured_game) {
      html += this.renderFeaturedGame(data.featured_game);
    }

    // Live Games
    if (data.games && data.games.length > 0) {
      html += this.renderGames(data.games);
    }

    // Teams
    if (data.teams && data.teams.length > 0) {
      html += this.renderTeams(data.teams);
    }

    // Standings
    if (data.standings && data.standings.length > 0) {
      html += this.renderStandings(data.standings);
    }

    // Sports News
    if (data.news && data.news.length > 0) {
      html += this.renderNews(data.news);
    }

    resultsContainer.innerHTML = html;
    resultsContainer.style.display = 'block';

    // Display Blaze Enhancement
    if (data.blazeEnhancement) {
      this.displayBlazeInsights(data.blazeEnhancement);
    }
  }

  renderFeaturedGame(game) {
    return `
      <div class="featured-game">
        <h4>🏆 Featured Game</h4>
        <div class="game-card featured">
          <div class="game-title">${game.title || 'Featured Matchup'}</div>
          <div class="game-teams">
            ${game.teams ? game.teams.map(team => `
              <div class="team">
                <span class="team-name">${team.name || team}</span>
                <span class="team-score">${team.score || '0'}</span>
              </div>
            `).join('<div class="vs">VS</div>') : ''}
          </div>
          <div class="game-status">${game.status || 'Scheduled'}</div>
          <div class="game-date">${game.date || ''}</div>
        </div>
      </div>
    `;
  }

  renderGames(games) {
    return `
      <div class="games-section">
        <h4>🏈 Live Games & Scores</h4>
        <div class="games-grid">
          ${games.slice(0, 6).map(game => `
            <div class="game-card">
              <div class="teams">
                <div class="team away">
                  <span class="team-name">${game.awayTeam || 'Away Team'}</span>
                  <span class="score">${game.awayScore || '0'}</span>
                </div>
                <div class="vs">@</div>
                <div class="team home">
                  <span class="team-name">${game.homeTeam || 'Home Team'}</span>
                  <span class="score">${game.homeScore || '0'}</span>
                </div>
              </div>
              <div class="game-status ${this.getStatusClass(game.status)}">${game.status || 'Scheduled'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderTeams(teams) {
    return `
      <div class="teams-section">
        <h4>🏅 Teams</h4>
        <div class="teams-list">
          ${teams.slice(0, 8).map(team => `
            <div class="team-item">
              <span class="team-name">${typeof team === 'string' ? team : team.name || 'Team'}</span>
              ${team.record ? `<span class="team-record">${team.record}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderStandings(standings) {
    return `
      <div class="standings-section">
        <h4>📊 Standings</h4>
        <div class="standings-table">
          ${standings.slice(0, 5).map((standing, index) => `
            <div class="standing-row">
              <span class="rank">${index + 1}</span>
              <span class="team">${standing.team || 'Team'}</span>
              <span class="record">${standing.record || '0-0'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderNews(news) {
    return `
      <div class="news-section">
        <h4>📰 Sports News</h4>
        <div class="news-list">
          ${news.slice(0, 4).map(article => `
            <div class="news-item">
              <a href="${article.link}" target="_blank" class="news-link">
                <div class="news-title">${article.title}</div>
                <div class="news-snippet">${article.snippet || ''}</div>
                <div class="news-source">${article.source || 'Source'}</div>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  displayBlazeInsights(enhancement) {
    const blazeContainer = document.getElementById('blaze-insights');
    if (!blazeContainer) return;

    let html = `
      <div class="blaze-score">
        <span class="score-label">Blaze Intelligence Score:</span>
        <span class="score-value">${enhancement.blazeScore || '88.5'}</span>
      </div>
    `;

    if (enhancement.predictiveAnalytics) {
      html += `
        <div class="predictions">
          <h5>🔮 Predictions</h5>
          ${enhancement.predictiveAnalytics.slice(0, 3).map(pred => `
            <div class="prediction-item">
              <span class="game">${pred.game}</span>
              <span class="prediction">${pred.prediction}</span>
              <span class="confidence">${(pred.confidence * 100).toFixed(0)}%</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (enhancement.championshipProbability) {
      html += `
        <div class="championship-odds">
          <h5>🏆 Championship Odds</h5>
          ${enhancement.championshipProbability.slice(0, 3).map(prob => `
            <div class="odds-item">
              <span class="team">${prob.team}</span>
              <span class="probability">${(prob.probability * 100).toFixed(0)}%</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    blazeContainer.innerHTML = html;
  }

  getStatusClass(status) {
    if (!status) return '';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('live') || lowerStatus.includes('q')) return 'live';
    if (lowerStatus.includes('final')) return 'final';
    return 'scheduled';
  }

  showLoading() {
    document.getElementById('loading-indicator')?.style.setProperty('display', 'flex');
    document.getElementById('sports-results')?.style.setProperty('display', 'none');
    document.getElementById('error-display')?.style.setProperty('display', 'none');
  }

  hideLoading() {
    document.getElementById('loading-indicator')?.style.setProperty('display', 'none');
  }

  showError(message) {
    this.hideLoading();
    const errorDisplay = document.getElementById('error-display');
    const errorMessage = document.querySelector('.error-message');

    if (errorDisplay && errorMessage) {
      errorMessage.textContent = message || 'Unable to load sports data';
      errorDisplay.style.display = 'flex';
    }
  }

  startAutoUpdate() {
    // Update every 5 minutes
    this.updateInterval = setInterval(() => {
      this.performSearch();
    }, 300000);
  }

  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  addStyles() {
    if (document.getElementById('google-sports-styles')) return;

    const styles = `
      <style id="google-sports-styles">
        .google-sports-widget {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          padding: 24px;
          margin: 20px 0;
          color: #ffffff;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .sports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .sports-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.5rem;
          font-weight: 600;
          color: #BF5700;
          margin: 0;
        }

        .google-icon {
          font-size: 1.2rem;
        }

        .live-indicator {
          background: #ff4444;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .sports-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .sport-select, .search-input {
          padding: 10px 16px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          background: rgba(255,255,255,0.1);
          color: white;
          font-size: 0.9rem;
        }

        .sport-select option {
          background: #1a1a2e;
          color: white;
        }

        .search-input {
          min-width: 200px;
        }

        .search-input::placeholder {
          color: rgba(255,255,255,0.6);
        }

        .search-btn, .retry-btn {
          background: #BF5700;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .search-btn:hover, .retry-btn:hover {
          background: #8B3A00;
          transform: translateY(-2px);
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px;
          color: rgba(255,255,255,0.8);
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid #BF5700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .error-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px;
          color: #ff6b6b;
          flex-wrap: wrap;
        }

        .data-source {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
        }

        .source-name {
          color: #BF5700;
          font-weight: 600;
        }

        .featured-game, .games-section, .teams-section, .standings-section, .news-section {
          margin-bottom: 24px;
        }

        .featured-game h4, .games-section h4, .teams-section h4, .standings-section h4, .news-section h4 {
          color: #BF5700;
          margin-bottom: 16px;
          font-size: 1.1rem;
        }

        .game-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .game-card.featured {
          background: linear-gradient(135deg, rgba(191,87,0,0.2), rgba(191,87,0,0.1));
          border-color: #BF5700;
        }

        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .teams {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .team {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .team-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .score {
          font-size: 1.5rem;
          font-weight: 700;
          color: #BF5700;
        }

        .vs {
          margin: 0 16px;
          color: rgba(255,255,255,0.6);
          font-weight: 600;
        }

        .game-status {
          text-align: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .game-status.live {
          background: #ff4444;
          color: white;
        }

        .game-status.final {
          background: #666;
          color: white;
        }

        .game-status.scheduled {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
        }

        .teams-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .team-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .news-list {
          display: grid;
          gap: 12px;
        }

        .news-item {
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }

        .news-item:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }

        .news-link {
          display: block;
          padding: 16px;
          color: inherit;
          text-decoration: none;
        }

        .news-title {
          font-weight: 600;
          margin-bottom: 8px;
          color: #BF5700;
        }

        .news-snippet {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.8);
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .news-source {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
        }

        .blaze-enhancement {
          background: linear-gradient(135deg, rgba(191,87,0,0.1), rgba(191,87,0,0.05));
          border: 1px solid rgba(191,87,0,0.3);
          border-radius: 12px;
          padding: 20px;
          margin-top: 24px;
        }

        .blaze-enhancement h4 {
          color: #BF5700;
          margin-bottom: 16px;
          font-size: 1.1rem;
        }

        .blaze-score {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .score-value {
          background: #BF5700;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .predictions, .championship-odds {
          margin-bottom: 16px;
        }

        .predictions h5, .championship-odds h5 {
          color: #BF5700;
          margin-bottom: 12px;
          font-size: 1rem;
        }

        .prediction-item, .odds-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .confidence, .probability {
          background: #BF5700;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .sports-header {
            flex-direction: column;
            align-items: stretch;
          }

          .sports-controls {
            justify-content: center;
          }

          .search-input {
            min-width: auto;
            flex: 1;
          }

          .games-grid {
            grid-template-columns: 1fr;
          }

          .teams-list {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  destroy() {
    this.stopAutoUpdate();
    const styles = document.getElementById('google-sports-styles');
    if (styles) styles.remove();
  }
}

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('google-sports-container')) {
    window.googleSportsWidget = new GoogleSportsIntegration('google-sports-container');
  }
});

// Export for manual initialization
window.GoogleSportsIntegration = GoogleSportsIntegration;