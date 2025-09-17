/**
 * Dashboard WebSocket Integration
 * Connects WebSocket Manager to Dashboard UI Components
 * October 15, 2025
 */

class DashboardWebSocketIntegration {
    constructor() {
        this.wsManager = null;
        this.updateHandlers = new Map();
        this.lastUpdates = new Map();
        this.updateCounters = new Map();

        // UI element selectors
        this.selectors = {
            nfl: {
                scores: '.nfl-scores-container',
                standings: '.nfl-standings-table',
                liveIndicator: '.nfl-live-indicator',
                lastUpdate: '.nfl-last-update'
            },
            mlb: {
                scores: '.mlb-scores-container',
                worldSeries: '.world-series-tracker',
                liveIndicator: '.mlb-live-indicator',
                lastUpdate: '.mlb-last-update'
            },
            nba: {
                scores: '.nba-scores-container',
                standings: '.nba-standings-table',
                liveIndicator: '.nba-live-indicator',
                lastUpdate: '.nba-last-update'
            },
            ncaa: {
                rankings: '.ncaa-rankings-container',
                games: '.ncaa-games-container',
                liveIndicator: '.ncaa-live-indicator',
                lastUpdate: '.ncaa-last-update'
            }
        };

        this.init();
    }

    init() {
        // Wait for WebSocket Manager to be available
        if (typeof window.wsManager !== 'undefined') {
            this.wsManager = window.wsManager;
            this.setupSubscriptions();
            this.setupUIHandlers();
        } else {
            // Retry in 100ms
            setTimeout(() => this.init(), 100);
        }
    }

    setupSubscriptions() {
        // Subscribe to NFL updates
        this.wsManager.subscribe('nfl', (data) => {
            this.handleNFLUpdate(data);
        });

        // Subscribe to MLB updates
        this.wsManager.subscribe('mlb', (data) => {
            this.handleMLBUpdate(data);
        });

        // Subscribe to NBA updates
        this.wsManager.subscribe('nba', (data) => {
            this.handleNBAUpdate(data);
        });

        // Subscribe to NCAA updates
        this.wsManager.subscribe('ncaa', (data) => {
            this.handleNCAAUpdate(data);
        });

        // Subscribe to connection status
        this.wsManager.subscribe('connection', (data) => {
            this.handleConnectionStatus(data);
        });

        console.log('Dashboard WebSocket subscriptions initialized');
    }

    setupUIHandlers() {
        // Add refresh button handlers
        document.querySelectorAll('.refresh-button').forEach(button => {
            button.addEventListener('click', () => {
                const sport = button.dataset.sport;
                this.forceRefresh(sport);
            });
        });

        // Add auto-refresh toggle handlers
        document.querySelectorAll('.auto-refresh-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const sport = toggle.dataset.sport;
                this.toggleAutoRefresh(sport, e.target.checked);
            });
        });
    }

    handleNFLUpdate(data) {
        console.log('NFL Update received:', data);

        // Update scores
        const scoresContainer = document.querySelector(this.selectors.nfl.scores);
        if (scoresContainer && data.games) {
            this.updateNFLScores(scoresContainer, data.games);
        }

        // Update standings
        const standingsTable = document.querySelector(this.selectors.nfl.standings);
        if (standingsTable && data.standings) {
            this.updateNFLStandings(standingsTable, data.standings);
        }

        // Update live indicator
        this.updateLiveIndicator('nfl', true);

        // Update timestamp
        this.updateTimestamp('nfl', data.timestamp);

        // Increment counter
        this.incrementUpdateCounter('nfl');

        // Store last update
        this.lastUpdates.set('nfl', data);

        // Trigger animation
        this.triggerUpdateAnimation('nfl');
    }

    handleMLBUpdate(data) {
        console.log('MLB Update received:', data);

        // Update World Series tracker
        const wsTracker = document.querySelector(this.selectors.mlb.worldSeries);
        if (wsTracker && data.worldSeries) {
            this.updateWorldSeriesTracker(wsTracker, data.worldSeries);
        }

        // Update scores
        const scoresContainer = document.querySelector(this.selectors.mlb.scores);
        if (scoresContainer && data.worldSeries) {
            this.updateMLBScores(scoresContainer, data.worldSeries);
        }

        // Update live indicator
        this.updateLiveIndicator('mlb', true);

        // Update timestamp
        this.updateTimestamp('mlb', data.timestamp);

        // Increment counter
        this.incrementUpdateCounter('mlb');

        // Store last update
        this.lastUpdates.set('mlb', data);

        // Trigger animation
        this.triggerUpdateAnimation('mlb');
    }

    handleNBAUpdate(data) {
        console.log('NBA Update received:', data);

        // Update scores
        const scoresContainer = document.querySelector(this.selectors.nba.scores);
        if (scoresContainer && data.games) {
            this.updateNBAScores(scoresContainer, data.games);
        }

        // Update standings
        const standingsTable = document.querySelector(this.selectors.nba.standings);
        if (standingsTable && data.standings) {
            this.updateNBAStandings(standingsTable, data.standings);
        }

        // Update live indicator
        this.updateLiveIndicator('nba', true);

        // Update timestamp
        this.updateTimestamp('nba', data.timestamp);

        // Increment counter
        this.incrementUpdateCounter('nba');

        // Store last update
        this.lastUpdates.set('nba', data);

        // Trigger animation
        this.triggerUpdateAnimation('nba');
    }

    handleNCAAUpdate(data) {
        console.log('NCAA Update received:', data);

        // Update rankings
        const rankingsContainer = document.querySelector(this.selectors.ncaa.rankings);
        if (rankingsContainer && data.top25) {
            this.updateNCAATop25(rankingsContainer, data.top25);
        }

        // Update games
        const gamesContainer = document.querySelector(this.selectors.ncaa.games);
        if (gamesContainer && data.texasGame) {
            this.updateNCAAGames(gamesContainer, data.texasGame);
        }

        // Update live indicator
        this.updateLiveIndicator('ncaa', true);

        // Update timestamp
        this.updateTimestamp('ncaa', data.timestamp);

        // Increment counter
        this.incrementUpdateCounter('ncaa');

        // Store last update
        this.lastUpdates.set('ncaa', data);

        // Trigger animation
        this.triggerUpdateAnimation('ncaa');
    }

    handleConnectionStatus(data) {
        console.log('Connection status:', data);

        const statusIndicator = document.querySelector('.websocket-status');
        if (statusIndicator) {
            statusIndicator.className = `websocket-status ${data.status}`;
            statusIndicator.textContent = data.status === 'connected' ? 'Live' : 'Offline';
        }

        // Update all live indicators based on connection status
        if (data.status !== 'connected') {
            ['nfl', 'mlb', 'nba', 'ncaa'].forEach(sport => {
                this.updateLiveIndicator(sport, false);
            });
        }
    }

    updateNFLScores(container, games) {
        const html = games.map(game => `
            <div class="game-score-card">
                <div class="teams">
                    <div class="team ${game.possession === game.away ? 'has-ball' : ''}">
                        ${game.away}: <span class="score">${game.awayScore}</span>
                    </div>
                    <div class="team ${game.possession === game.home ? 'has-ball' : ''}">
                        ${game.home}: <span class="score">${game.homeScore}</span>
                    </div>
                </div>
                <div class="game-info">
                    Q${game.quarter} - ${game.time}
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updateNFLStandings(table, standings) {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const rows = Object.entries(standings).map(([team, stats]) => `
            <tr class="${team === 'HOU' || team === 'TEN' || team === 'ARI' ? 'highlight' : ''}">
                <td>${team}</td>
                <td>${stats.wins}</td>
                <td>${stats.losses}</td>
                <td>${stats.pct.toFixed(3)}</td>
            </tr>
        `).join('');

        tbody.innerHTML = rows;
    }

    updateWorldSeriesTracker(container, wsData) {
        const html = `
            <div class="world-series-live">
                <h3>🏆 World Series Game ${wsData.game}</h3>
                <div class="series-status">${wsData.series}</div>
                <div class="game-score">
                    <div class="team">
                        ${wsData.away}: <span class="score">${wsData.awayScore}</span>
                    </div>
                    <div class="team">
                        ${wsData.home}: <span class="score">${wsData.homeScore}</span>
                    </div>
                </div>
                <div class="game-situation">
                    ${wsData.topBottom} ${wsData.inning} | ${wsData.outs} out
                    ${wsData.runners.first ? '• 1B' : ''}
                    ${wsData.runners.second ? '• 2B' : ''}
                    ${wsData.runners.third ? '• 3B' : ''}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    updateMLBScores(container, game) {
        const html = `
            <div class="mlb-game-card live">
                <div class="inning-display">
                    ${game.topBottom} ${game.inning}
                </div>
                <div class="teams">
                    <div class="team">
                        LAD: <span class="score">${game.awayScore}</span>
                    </div>
                    <div class="team">
                        NYY: <span class="score">${game.homeScore}</span>
                    </div>
                </div>
                <div class="base-runners">
                    <div class="bases">
                        <div class="base first ${game.runners.first ? 'occupied' : ''}"></div>
                        <div class="base second ${game.runners.second ? 'occupied' : ''}"></div>
                        <div class="base third ${game.runners.third ? 'occupied' : ''}"></div>
                    </div>
                    <div class="outs">${game.outs} out</div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    updateNBAScores(container, games) {
        const html = games.map(game => `
            <div class="nba-game-card">
                <div class="teams">
                    <div class="team">
                        ${game.away}: <span class="score">${game.awayScore}</span>
                        <div class="leader">${game.leaders[game.away].player} - ${game.leaders[game.away].pts} pts</div>
                    </div>
                    <div class="team">
                        ${game.home}: <span class="score">${game.homeScore}</span>
                        <div class="leader">${game.leaders[game.home].player} - ${game.leaders[game.home].pts} pts</div>
                    </div>
                </div>
                <div class="game-info">
                    Q${game.quarter} - ${game.time}
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updateNBAStandings(table, standings) {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const rows = Object.entries(standings).map(([team, stats]) => `
            <tr class="${team === 'MEM' ? 'highlight' : ''}">
                <td>${team}</td>
                <td>${stats.preseasonWins}-${stats.preseasonLosses}</td>
            </tr>
        `).join('');

        tbody.innerHTML = rows;
    }

    updateNCAATop25(container, rankings) {
        const html = rankings.map(team => `
            <div class="ranking-card ${team.team === 'Texas' ? 'highlight' : ''}">
                <div class="rank">#${team.rank}</div>
                <div class="team-info">
                    <div class="team-name">${team.team}</div>
                    <div class="record">${team.record}</div>
                    <div class="next-game">${team.nextGame}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updateNCAAGames(container, game) {
        const html = `
            <div class="texas-game-card">
                <h4>Texas Longhorns Next Game</h4>
                <div class="game-details">
                    <div class="matchup">${game.location === 'Home' ? 'vs' : '@'} ${game.opponent}</div>
                    <div class="time">${game.time}</div>
                    <div class="betting-line">
                        Spread: ${game.spread} | O/U: ${game.ou}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    updateLiveIndicator(sport, isLive) {
        const indicator = document.querySelector(this.selectors[sport].liveIndicator);
        if (indicator) {
            indicator.classList.toggle('active', isLive);
            indicator.innerHTML = isLive ?
                '<span class="pulse"></span> LIVE' :
                'OFFLINE';
        }
    }

    updateTimestamp(sport, timestamp) {
        const element = document.querySelector(this.selectors[sport].lastUpdate);
        if (element) {
            const date = new Date(timestamp);
            element.textContent = `Last update: ${date.toLocaleTimeString()}`;
        }
    }

    incrementUpdateCounter(sport) {
        const current = this.updateCounters.get(sport) || 0;
        this.updateCounters.set(sport, current + 1);

        const counterElement = document.querySelector(`.${sport}-update-counter`);
        if (counterElement) {
            counterElement.textContent = `Updates: ${current + 1}`;
        }
    }

    triggerUpdateAnimation(sport) {
        const containers = document.querySelectorAll(`.${sport}-container`);
        containers.forEach(container => {
            container.classList.add('updating');
            setTimeout(() => {
                container.classList.remove('updating');
            }, 500);
        });
    }

    forceRefresh(sport) {
        console.log(`Force refresh requested for ${sport}`);
        // In simulation mode, trigger an immediate update
        if (this.wsManager) {
            switch(sport) {
                case 'nfl':
                    this.wsManager.simulateNFLUpdate();
                    break;
                case 'mlb':
                    this.wsManager.simulateMLBUpdate();
                    break;
                case 'nba':
                    this.wsManager.simulateNBAUpdate();
                    break;
                case 'ncaa':
                    this.wsManager.simulateNCAAUpdate();
                    break;
            }
        }
    }

    toggleAutoRefresh(sport, enabled) {
        console.log(`Auto-refresh ${enabled ? 'enabled' : 'disabled'} for ${sport}`);
        // Store preference in localStorage
        localStorage.setItem(`autoRefresh_${sport}`, enabled);
    }

    getLastUpdate(sport) {
        return this.lastUpdates.get(sport);
    }

    getUpdateCount(sport) {
        return this.updateCounters.get(sport) || 0;
    }

    getConnectionStatus() {
        return this.wsManager ? this.wsManager.getStatus() : null;
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboardWSIntegration = new DashboardWebSocketIntegration();
    });
} else {
    window.dashboardWSIntegration = new DashboardWebSocketIntegration();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardWebSocketIntegration;
}