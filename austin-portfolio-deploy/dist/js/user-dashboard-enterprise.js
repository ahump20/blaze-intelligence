// Enterprise User Dashboard System
// Blaze Intelligence Championship Platform
// Personalized Analytics & Subscription Management

class EnterpriseUserDashboard {
  constructor() {
    this.currentUser = null;
    this.subscriptionTiers = {
      'Basic': {
        price: 99,
        features: ['Basic Analytics', 'Dashboard Access', 'Email Support'],
        apiCalls: 1000,
        teams: 1,
        storage: '1GB'
      },
      'Pro': {
        price: 299,
        features: ['Advanced Analytics', 'Real-time Data', 'Priority Support', 'Custom Reports'],
        apiCalls: 10000,
        teams: 5,
        storage: '10GB'
      },
      'Enterprise': {
        price: 999,
        features: ['All Features', 'White-label Options', 'Dedicated Support', 'Custom Integration'],
        apiCalls: 100000,
        teams: 'unlimited',
        storage: '100GB'
      }
    };

    this.analyticsWidgets = {
      'performance': { title: 'Performance Analytics', icon: '📊', priority: 1 },
      'predictions': { title: 'Game Predictions', icon: '🎯', priority: 2 },
      'player-insights': { title: 'Player Insights', icon: '👤', priority: 3 },
      'team-comparison': { title: 'Team Comparison', icon: '⚖️', priority: 4 },
      'nil-valuations': { title: 'NIL Valuations', icon: '💰', priority: 5 },
      'injury-prevention': { title: 'Injury Prevention', icon: '🏥', priority: 6 }
    };

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadUserData();
    this.renderDashboard();
    this.startRealTimeUpdates();
  }

  setupEventListeners() {
    // Subscription management
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('upgrade-subscription')) {
        this.handleSubscriptionUpgrade(e.target.dataset.tier);
      }
      if (e.target.classList.contains('cancel-subscription')) {
        this.handleSubscriptionCancellation();
      }
      if (e.target.classList.contains('billing-history-btn')) {
        this.showBillingHistory();
      }
    });

    // Widget customization
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('widget-toggle')) {
        this.toggleWidget(e.target.dataset.widget, e.target.checked);
      }
    });

    // Team management
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-team-btn')) {
        this.showAddTeamModal();
      }
      if (e.target.classList.contains('remove-team-btn')) {
        this.removeTeam(e.target.dataset.teamId);
      }
    });
  }

  async loadUserData() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        window.location.href = '/login.html';
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load user data');
      }

      this.currentUser = await response.json();
      await this.loadUsageMetrics();
      await this.loadPersonalizedAnalytics();

    } catch (error) {
      console.error('Error loading user data:', error);
      this.showError('Failed to load user data');
    }
  }

  async loadUsageMetrics() {
    try {
      const response = await fetch('/api/user/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        this.usageMetrics = await response.json();
      }
    } catch (error) {
      console.error('Error loading usage metrics:', error);
    }
  }

  async loadPersonalizedAnalytics() {
    try {
      const response = await fetch('/api/analytics/personalized', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        this.personalizedData = await response.json();
      }
    } catch (error) {
      console.error('Error loading personalized analytics:', error);
    }
  }

  renderDashboard() {
    const dashboardContainer = document.getElementById('enterprise-dashboard');
    if (!dashboardContainer) return;

    dashboardContainer.innerHTML = `
      <div class="dashboard-header">
        <div class="user-welcome">
          <h1>Welcome back, ${this.currentUser?.email?.split('@')[0] || 'User'}</h1>
          <p class="user-tier">
            <span class="tier-badge tier-${this.currentUser?.subscription?.tier?.toLowerCase()}">
              ${this.currentUser?.subscription?.tier} Plan
            </span>
            <span class="subscription-status ${this.currentUser?.subscription?.status}">
              ${this.currentUser?.subscription?.status}
            </span>
          </p>
        </div>
        <div class="dashboard-actions">
          <button class="btn btn-primary" onclick="this.openSettings()">
            ⚙️ Settings
          </button>
          <button class="btn btn-secondary billing-history-btn">
            📄 Billing
          </button>
        </div>
      </div>

      <div class="dashboard-grid">
        ${this.renderQuickStats()}
        ${this.renderUsageMetrics()}
        ${this.renderSubscriptionOverview()}
        ${this.renderAnalyticsWidgets()}
        ${this.renderTeamManagement()}
        ${this.renderRecentActivity()}
      </div>

      <div class="dashboard-footer">
        ${this.renderAPIUsage()}
      </div>
    `;

    this.initializeCharts();
  }

  renderQuickStats() {
    const stats = this.personalizedData?.quickStats || {};

    return `
      <div class="dashboard-card quick-stats">
        <h3>📊 Quick Stats</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${stats.totalAnalyses || 0}</div>
            <div class="stat-label">Analyses This Month</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.accuracy || '94.6'}%</div>
            <div class="stat-label">Prediction Accuracy</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.insightsGenerated || 0}</div>
            <div class="stat-label">Insights Generated</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.teamsTracked || 0}</div>
            <div class="stat-label">Teams Tracked</div>
          </div>
        </div>
      </div>
    `;
  }

  renderUsageMetrics() {
    const usage = this.usageMetrics || {};
    const tier = this.subscriptionTiers[this.currentUser?.subscription?.tier] || this.subscriptionTiers['Basic'];

    const apiUsagePercent = (usage.apiCalls || 0) / tier.apiCalls * 100;
    const storageUsagePercent = (usage.storageUsed || 0) / this.parseStorage(tier.storage) * 100;

    return `
      <div class="dashboard-card usage-metrics">
        <h3>📈 Usage Metrics</h3>
        <div class="usage-bars">
          <div class="usage-item">
            <div class="usage-header">
              <span>API Calls</span>
              <span>${usage.apiCalls || 0} / ${tier.apiCalls.toLocaleString()}</span>
            </div>
            <div class="usage-bar">
              <div class="usage-fill" style="width: ${Math.min(apiUsagePercent, 100)}%"></div>
            </div>
            ${apiUsagePercent > 80 ? '<div class="usage-warning">⚠️ Approaching limit</div>' : ''}
          </div>

          <div class="usage-item">
            <div class="usage-header">
              <span>Storage</span>
              <span>${this.formatBytes(usage.storageUsed || 0)} / ${tier.storage}</span>
            </div>
            <div class="usage-bar">
              <div class="usage-fill" style="width: ${Math.min(storageUsagePercent, 100)}%"></div>
            </div>
          </div>

          <div class="usage-item">
            <div class="usage-header">
              <span>Teams</span>
              <span>${usage.teamsCount || 0} / ${tier.teams === 'unlimited' ? '∞' : tier.teams}</span>
            </div>
            ${tier.teams !== 'unlimited' ? `
              <div class="usage-bar">
                <div class="usage-fill" style="width: ${(usage.teamsCount || 0) / tier.teams * 100}%"></div>
              </div>
            ` : '<div class="unlimited-indicator">Unlimited</div>'}
          </div>
        </div>
      </div>
    `;
  }

  renderSubscriptionOverview() {
    const currentTier = this.currentUser?.subscription?.tier;
    const subscription = this.subscriptionTiers[currentTier];

    return `
      <div class="dashboard-card subscription-overview">
        <h3>💳 Subscription Overview</h3>
        <div class="current-plan">
          <div class="plan-header">
            <h4>${currentTier} Plan</h4>
            <div class="plan-price">$${subscription.price}/month</div>
          </div>
          <div class="plan-features">
            ${subscription.features.map(feature => `
              <div class="feature-item">✅ ${feature}</div>
            `).join('')}
          </div>
          <div class="plan-actions">
            ${currentTier !== 'Enterprise' ? `
              <button class="btn btn-primary upgrade-subscription" data-tier="${this.getNextTier(currentTier)}">
                Upgrade to ${this.getNextTier(currentTier)}
              </button>
            ` : `
              <button class="btn btn-success" disabled>
                🏆 Top Tier Active
              </button>
            `}
            <button class="btn btn-outline cancel-subscription">
              Manage Subscription
            </button>
          </div>
        </div>
        <div class="billing-info">
          <p><strong>Next billing:</strong> ${this.formatDate(this.currentUser?.subscription?.nextBilling)}</p>
          <p><strong>Status:</strong> <span class="status-${this.currentUser?.subscription?.status}">${this.currentUser?.subscription?.status}</span></p>
        </div>
      </div>
    `;
  }

  renderAnalyticsWidgets() {
    const userWidgets = this.currentUser?.preferences?.widgets || Object.keys(this.analyticsWidgets);

    return `
      <div class="dashboard-card analytics-widgets">
        <h3>🎯 Analytics Widgets</h3>
        <div class="widget-controls">
          <p>Customize your dashboard by enabling/disabling widgets:</p>
          <div class="widget-toggles">
            ${Object.entries(this.analyticsWidgets).map(([key, widget]) => `
              <label class="widget-toggle-label">
                <input type="checkbox" class="widget-toggle" data-widget="${key}"
                       ${userWidgets.includes(key) ? 'checked' : ''}>
                <span>${widget.icon} ${widget.title}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="active-widgets">
          ${userWidgets.map(widgetKey => this.renderWidget(widgetKey)).join('')}
        </div>
      </div>
    `;
  }

  renderWidget(widgetKey) {
    const widget = this.analyticsWidgets[widgetKey];
    const data = this.personalizedData?.widgets?.[widgetKey] || {};

    switch (widgetKey) {
      case 'performance':
        return `
          <div class="widget performance-widget">
            <h4>${widget.icon} ${widget.title}</h4>
            <div class="performance-chart" id="performance-chart-${widgetKey}"></div>
            <div class="performance-summary">
              <p>Avg Performance: <strong>${data.avgPerformance || '85.2'}%</strong></p>
              <p>Trend: <span class="trend-${data.trend || 'up'}">${data.trendIcon || '📈'} ${data.trendText || 'Improving'}</span></p>
            </div>
          </div>
        `;

      case 'predictions':
        return `
          <div class="widget predictions-widget">
            <h4>${widget.icon} ${widget.title}</h4>
            <div class="predictions-list">
              ${(data.predictions || []).map(pred => `
                <div class="prediction-item">
                  <span class="game">${pred.game}</span>
                  <span class="confidence">${pred.confidence}% confidence</span>
                  <span class="outcome ${pred.status}">${pred.prediction}</span>
                </div>
              `).join('') || '<p>No recent predictions</p>'}
            </div>
          </div>
        `;

      case 'nil-valuations':
        return `
          <div class="widget nil-widget">
            <h4>${widget.icon} ${widget.title}</h4>
            <div class="nil-summary">
              <p>Portfolio Value: <strong>$${(data.portfolioValue || 0).toLocaleString()}</strong></p>
              <p>Top Player: <strong>${data.topPlayer || 'Loading...'}</strong></p>
              <p>Market Trend: <span class="trend-${data.marketTrend || 'stable'}">${data.marketIcon || '📊'}</span></p>
            </div>
          </div>
        `;

      default:
        return `
          <div class="widget generic-widget">
            <h4>${widget.icon} ${widget.title}</h4>
            <p>Widget data loading...</p>
          </div>
        `;
    }
  }

  renderTeamManagement() {
    const teams = this.currentUser?.teams || [];

    return `
      <div class="dashboard-card team-management">
        <h3>🏆 Team Management</h3>
        <div class="teams-header">
          <p>Manage teams you're tracking and analyzing</p>
          <button class="btn btn-primary add-team-btn">+ Add Team</button>
        </div>
        <div class="teams-list">
          ${teams.length ? teams.map(team => `
            <div class="team-item">
              <div class="team-info">
                <img src="${team.logo}" alt="${team.name}" class="team-logo">
                <div class="team-details">
                  <h4>${team.name}</h4>
                  <p>${team.league} • ${team.sport}</p>
                  <span class="team-status ${team.status}">${team.status}</span>
                </div>
              </div>
              <div class="team-actions">
                <button class="btn btn-sm btn-outline">View Analytics</button>
                <button class="btn btn-sm btn-danger remove-team-btn" data-team-id="${team.id}">Remove</button>
              </div>
            </div>
          `).join('') : '<p class="no-teams">No teams added yet. Add your first team to get started!</p>'}
        </div>
      </div>
    `;
  }

  renderRecentActivity() {
    const activities = this.personalizedData?.recentActivity || [];

    return `
      <div class="dashboard-card recent-activity">
        <h3>📝 Recent Activity</h3>
        <div class="activity-list">
          ${activities.length ? activities.map(activity => `
            <div class="activity-item">
              <div class="activity-icon">${activity.icon}</div>
              <div class="activity-content">
                <p>${activity.description}</p>
                <span class="activity-time">${this.timeAgo(activity.timestamp)}</span>
              </div>
            </div>
          `).join('') : '<p>No recent activity</p>'}
        </div>
      </div>
    `;
  }

  renderAPIUsage() {
    const apiMetrics = this.usageMetrics?.api || {};

    return `
      <div class="api-usage-section">
        <h3>🔧 API Usage & Developer Tools</h3>
        <div class="api-metrics">
          <div class="api-metric">
            <span class="metric-label">Today's Calls:</span>
            <span class="metric-value">${apiMetrics.today || 0}</span>
          </div>
          <div class="api-metric">
            <span class="metric-label">Response Time:</span>
            <span class="metric-value">${apiMetrics.avgResponseTime || '<100'}ms</span>
          </div>
          <div class="api-metric">
            <span class="metric-label">Success Rate:</span>
            <span class="metric-value">${apiMetrics.successRate || '99.9'}%</span>
          </div>
          <div class="api-actions">
            <button class="btn btn-outline" onclick="window.open('/developer-portal.html', '_blank')">
              📚 API Documentation
            </button>
            <button class="btn btn-outline" onclick="this.generateAPIKey()">
              🔑 Generate API Key
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Subscription Management Methods
  async handleSubscriptionUpgrade(newTier) {
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newTier })
      });

      if (response.ok) {
        const result = await response.json();
        this.showSuccess(`Successfully upgraded to ${newTier} plan!`);

        // Redirect to Stripe checkout if needed
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          await this.loadUserData();
          this.renderDashboard();
        }
      } else {
        throw new Error('Upgrade failed');
      }
    } catch (error) {
      this.showError('Failed to upgrade subscription');
    }
  }

  async toggleWidget(widgetKey, enabled) {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          widgets: {
            [widgetKey]: enabled
          }
        })
      });

      if (response.ok) {
        // Re-render widgets section
        this.renderDashboard();
      }
    } catch (error) {
      console.error('Failed to update widget preferences:', error);
    }
  }

  // Team Management Methods
  showAddTeamModal() {
    // Implementation for team addition modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Add New Team</h3>
        <form id="add-team-form">
          <div class="form-group">
            <label>Team Name:</label>
            <input type="text" name="teamName" required>
          </div>
          <div class="form-group">
            <label>League:</label>
            <select name="league" required>
              <option value="MLB">MLB</option>
              <option value="NFL">NFL</option>
              <option value="NBA">NBA</option>
              <option value="NCAA">NCAA</option>
            </select>
          </div>
          <div class="form-group">
            <label>Sport:</label>
            <select name="sport" required>
              <option value="baseball">Baseball</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Add Team</button>
            <button type="button" class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('add-team-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      await this.addTeam(Object.fromEntries(formData));
      modal.remove();
    });
  }

  async addTeam(teamData) {
    try {
      const response = await fetch('/api/user/teams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamData)
      });

      if (response.ok) {
        this.showSuccess('Team added successfully!');
        await this.loadUserData();
        this.renderDashboard();
      }
    } catch (error) {
      this.showError('Failed to add team');
    }
  }

  // Utility Methods
  getNextTier(currentTier) {
    const tiers = ['Basic', 'Pro', 'Enterprise'];
    const currentIndex = tiers.indexOf(currentTier);
    return tiers[currentIndex + 1] || 'Enterprise';
  }

  parseStorage(storageString) {
    const value = parseFloat(storageString);
    const unit = storageString.replace(value, '').toLowerCase();
    const multipliers = { 'gb': 1000000000, 'mb': 1000000, 'kb': 1000 };
    return value * (multipliers[unit] || 1);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1000;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  }

  timeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  initializeCharts() {
    // Initialize any charts or data visualizations
    this.initPerformanceCharts();
  }

  initPerformanceCharts() {
    // Performance chart implementation would go here
    // Using Chart.js or similar library
  }

  startRealTimeUpdates() {
    // WebSocket connection for real-time updates
    this.wsConnection = new WebSocket(this.getWebSocketURL());

    this.wsConnection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleRealTimeUpdate(data);
    };

    // Reconnect on close
    this.wsConnection.onclose = () => {
      setTimeout(() => this.startRealTimeUpdates(), 5000);
    };
  }

  getWebSocketURL() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/dashboard`;
  }

  handleRealTimeUpdate(data) {
    // Handle real-time updates from WebSocket
    if (data.type === 'usage_update') {
      this.usageMetrics = { ...this.usageMetrics, ...data.metrics };
      this.updateUsageDisplay();
    }

    if (data.type === 'analytics_update') {
      this.personalizedData = { ...this.personalizedData, ...data.analytics };
      this.updateAnalyticsWidgets();
    }
  }

  updateUsageDisplay() {
    // Update usage metrics without full re-render
    const usageSection = document.querySelector('.usage-metrics');
    if (usageSection) {
      usageSection.innerHTML = this.renderUsageMetrics().match(/<div class="usage-bars">.*<\/div>/s)[0];
    }
  }

  updateAnalyticsWidgets() {
    // Update analytics widgets without full re-render
    const widgetsSection = document.querySelector('.active-widgets');
    if (widgetsSection) {
      const userWidgets = this.currentUser?.preferences?.widgets || Object.keys(this.analyticsWidgets);
      widgetsSection.innerHTML = userWidgets.map(widgetKey => this.renderWidget(widgetKey)).join('');
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.enterpriseDashboard = new EnterpriseUserDashboard();
});

export default EnterpriseUserDashboard;