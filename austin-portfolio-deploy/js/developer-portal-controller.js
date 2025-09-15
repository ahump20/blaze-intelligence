// Developer Portal Controller
// Blaze Intelligence API Management System

class DeveloperPortalController {
  constructor() {
    this.apiKeys = [];
    this.currentUser = null;
    this.sandboxHistory = [];

    this.init();
  }

  async init() {
    await this.loadUserProfile();
    await this.loadAPIKeys();
    this.setupEventListeners();
    this.initializeNavigation();
    this.loadUsageMetrics();
  }

  setupEventListeners() {
    // Navigation
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('sidebar-link') || e.target.classList.contains('nav-link')) {
        e.preventDefault();
        const section = e.target.getAttribute('href').substring(1);
        this.showSection(section);
      }
    });

    // Tab switching
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-header')) {
        this.switchTab(e.target.dataset.tab);
      }
    });

    // Sandbox form
    const sandboxForm = document.getElementById('sandboxForm');
    if (sandboxForm) {
      sandboxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.executeSandboxRequest();
      });
    }

    // API Key actions
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('copy-key-btn')) {
        this.copyAPIKey(e.target.dataset.key);
      }
      if (e.target.classList.contains('delete-key-btn')) {
        this.deleteAPIKey(e.target.dataset.keyId);
      }
      if (e.target.classList.contains('regenerate-key-btn')) {
        this.regenerateAPIKey(e.target.dataset.keyId);
      }
    });
  }

  async loadUserProfile() {
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

      if (response.ok) {
        this.currentUser = await response.json();
        this.updateRateLimits();
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  async loadAPIKeys() {
    try {
      const response = await fetch('/api/developer/keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        this.apiKeys = await response.json();
        this.renderAPIKeys();
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  }

  async loadUsageMetrics() {
    try {
      const response = await fetch('/api/developer/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const usage = await response.json();
        this.updateUsageDisplay(usage);
      }
    } catch (error) {
      console.error('Failed to load usage metrics:', error);
    }
  }

  updateRateLimits() {
    const tierLimits = {
      'Basic': { perMinute: 100, perDay: 10000, concurrent: 5 },
      'Pro': { perMinute: 1000, perDay: 100000, concurrent: 50 },
      'Enterprise': { perMinute: 10000, perDay: 1000000, concurrent: 500 }
    };

    const tier = this.currentUser?.subscription?.tier || 'Basic';
    const limits = tierLimits[tier];

    document.getElementById('requestsPerMinute').textContent = limits.perMinute.toLocaleString();
    document.getElementById('requestsPerDay').textContent = limits.perDay.toLocaleString();
    document.getElementById('concurrentRequests').textContent = limits.concurrent.toLocaleString();
  }

  updateUsageDisplay(usage) {
    // Update usage metrics in the UI
    const usageElements = {
      'apiCallsToday': usage.apiCallsToday || 0,
      'dataTransferred': this.formatBytes(usage.dataTransferred || 0),
      'errorRate': `${(usage.errorRate || 0).toFixed(2)}%`,
      'avgResponseTime': `${usage.avgResponseTime || 67}ms`
    };

    Object.entries(usageElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  initializeNavigation() {
    // Set up smooth scrolling and active states
    const links = document.querySelectorAll('.sidebar-link, .nav-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        links.forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
  }

  showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update active link
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[href="#${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  switchTab(tabId) {
    // Update tab headers
    document.querySelectorAll('.tab-header').forEach(header => {
      header.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
  }

  async generateAPIKey() {
    const keyName = prompt('Enter a name for this API key:');
    if (!keyName) return;

    try {
      const response = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: keyName,
          environment: 'live' // or 'test'
        })
      });

      if (response.ok) {
        const newKey = await response.json();
        this.apiKeys.push(newKey);
        this.renderAPIKeys();

        // Show the new key in a modal for one-time viewing
        this.showNewKeyModal(newKey);
      } else {
        throw new Error('Failed to generate API key');
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Failed to generate API key. Please try again.');
    }
  }

  showNewKeyModal(keyData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>🎉 New API Key Generated</h3>
        <p><strong>Important:</strong> This is the only time you'll see this key. Copy it now!</p>

        <div class="new-key-display">
          <label>API Key:</label>
          <div class="key-value-container">
            <code class="new-key-value">${keyData.key}</code>
            <button class="btn btn-primary copy-new-key-btn">Copy</button>
          </div>
        </div>

        <div class="key-details">
          <p><strong>Name:</strong> ${keyData.name}</p>
          <p><strong>Environment:</strong> ${keyData.environment}</p>
          <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
            I've Copied the Key
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Copy functionality
    modal.querySelector('.copy-new-key-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(keyData.key);
      alert('API key copied to clipboard!');
    });

    // Auto-close after 5 minutes for security
    setTimeout(() => {
      if (modal.parentElement) {
        modal.remove();
      }
    }, 300000);
  }

  renderAPIKeys() {
    const container = document.getElementById('apiKeysList');
    if (!container) return;

    if (this.apiKeys.length === 0) {
      container.innerHTML = `
        <div class="no-keys-message">
          <p>No API keys generated yet.</p>
          <p>Generate your first API key to start using the Blaze Intelligence API.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.apiKeys.map(key => `
      <div class="api-key-item">
        <div class="key-info">
          <div class="key-name">${key.name}</div>
          <div class="key-value">${this.maskAPIKey(key.key)}</div>
          <div class="key-meta">
            <span class="key-env ${key.environment}">${key.environment}</span>
            <span class="key-created">Created: ${this.formatDate(key.createdAt)}</span>
            <span class="key-usage">Calls: ${key.totalCalls || 0}</span>
          </div>
        </div>
        <div class="key-actions">
          <button class="btn btn-secondary copy-key-btn" data-key="${key.key}">Copy</button>
          <button class="btn btn-secondary regenerate-key-btn" data-key-id="${key.id}">Regenerate</button>
          <button class="btn btn-danger delete-key-btn" data-key-id="${key.id}">Delete</button>
        </div>
      </div>
    `).join('');
  }

  maskAPIKey(key) {
    if (!key) return 'Hidden';
    return `${key.substring(0, 12)}${'*'.repeat(20)}${key.substring(key.length - 4)}`;
  }

  async copyAPIKey(key) {
    try {
      await navigator.clipboard.writeText(key);

      // Show temporary success message
      const button = document.querySelector(`[data-key="${key}"]`);
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('btn-success');

      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('btn-success');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy API key:', error);
      alert('Failed to copy API key to clipboard');
    }
  }

  async deleteAPIKey(keyId) {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/developer/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        this.apiKeys = this.apiKeys.filter(key => key.id !== keyId);
        this.renderAPIKeys();
      } else {
        throw new Error('Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key. Please try again.');
    }
  }

  async regenerateAPIKey(keyId) {
    if (!confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) {
      return;
    }

    try {
      const response = await fetch(`/api/developer/keys/${keyId}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const regeneratedKey = await response.json();

        // Update the key in our local array
        const keyIndex = this.apiKeys.findIndex(key => key.id === keyId);
        if (keyIndex !== -1) {
          this.apiKeys[keyIndex] = regeneratedKey;
          this.renderAPIKeys();
        }

        // Show the new key
        this.showNewKeyModal(regeneratedKey);
      } else {
        throw new Error('Failed to regenerate API key');
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      alert('Failed to regenerate API key. Please try again.');
    }
  }

  async executeSandboxRequest() {
    const endpoint = document.getElementById('sandboxEndpoint').value;
    const method = document.getElementById('sandboxMethod').value;
    const body = document.getElementById('sandboxBody').value;

    // Get the first available API key
    const apiKey = this.apiKeys.find(key => key.environment === 'live')?.key ||
                   this.apiKeys[0]?.key;

    if (!apiKey) {
      alert('Please generate an API key first to use the sandbox.');
      return;
    }

    const requestOptions = {
      method: method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (method !== 'GET' && body.trim()) {
      try {
        JSON.parse(body); // Validate JSON
        requestOptions.body = body;
      } catch (error) {
        alert('Invalid JSON in request body');
        return;
      }
    }

    try {
      // Show loading state
      const responseElement = document.getElementById('sandboxResponse');
      const responseBody = document.getElementById('responseBody');

      responseElement.style.display = 'block';
      responseBody.textContent = 'Loading...';

      const startTime = Date.now();
      const response = await fetch(`https://api.blaze-intelligence.com${endpoint}`, requestOptions);
      const endTime = Date.now();

      const responseData = await response.json();

      // Add request metadata
      const responseWithMeta = {
        ...responseData,
        _request: {
          method: method,
          endpoint: endpoint,
          status: response.status,
          statusText: response.statusText,
          responseTime: `${endTime - startTime}ms`,
          timestamp: new Date().toISOString()
        }
      };

      responseBody.textContent = JSON.stringify(responseWithMeta, null, 2);

      // Add to sandbox history
      this.sandboxHistory.unshift({
        endpoint,
        method,
        body,
        response: responseWithMeta,
        timestamp: new Date().toISOString()
      });

      // Syntax highlighting
      if (window.Prism) {
        Prism.highlightElement(responseBody);
      }

    } catch (error) {
      document.getElementById('responseBody').textContent = JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2);
    }
  }

  // Utility methods
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Export methods for global access
  getAPIKeys() {
    return this.apiKeys;
  }

  getSandboxHistory() {
    return this.sandboxHistory;
  }

  downloadPostmanCollection() {
    const collection = {
      info: {
        name: "Blaze Intelligence API",
        description: "Official Postman collection for Blaze Intelligence API",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      auth: {
        type: "bearer",
        bearer: [
          {
            key: "token",
            value: "{{BLAZE_API_KEY}}",
            type: "string"
          }
        ]
      },
      variable: [
        {
          key: "baseUrl",
          value: "https://api.blaze-intelligence.com/v1"
        },
        {
          key: "BLAZE_API_KEY",
          value: "YOUR_API_KEY_HERE"
        }
      ],
      item: [
        {
          name: "Analytics",
          item: [
            {
              name: "Get Cardinals Latest",
              request: {
                method: "GET",
                url: "{{baseUrl}}/analytics/cardinals/latest"
              }
            },
            {
              name: "Get Player Performance",
              request: {
                method: "GET",
                url: "{{baseUrl}}/analytics/players/{{playerId}}"
              }
            }
          ]
        },
        {
          name: "Predictions",
          item: [
            {
              name: "Next Game Prediction",
              request: {
                method: "GET",
                url: "{{baseUrl}}/predictions/{{team}}/next-game"
              }
            }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blaze-intelligence-api.postman_collection.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Global functions for buttons
function generateAPIKey() {
  if (window.developerPortal) {
    window.developerPortal.generateAPIKey();
  }
}

function downloadPostmanCollection() {
  if (window.developerPortal) {
    window.developerPortal.downloadPostmanCollection();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.developerPortal = new DeveloperPortalController();
});

export default DeveloperPortalController;