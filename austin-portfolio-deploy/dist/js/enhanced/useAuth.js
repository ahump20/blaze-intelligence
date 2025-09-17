// Client-side authentication hook for Replit Auth
// Compatible with existing Blaze Intelligence platform

class AuthManager {
  constructor() {
    this.user = null;
    this.isLoading = true;
    this.isAuthenticated = false;
    this.listeners = [];
    
    // Initialize auth state
    this.checkAuthStatus();
  }

  async checkAuthStatus() {
    try {
      this.isLoading = true;
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        this.user = await response.json();
        this.isAuthenticated = true;
      } else {
        this.user = null;
        this.isAuthenticated = false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.user = null;
      this.isAuthenticated = false;
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  login() {
    window.location.href = '/api/login';
  }

  logout() {
    window.location.href = '/api/logout';
  }

  // Subscribe to auth state changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        user: this.user,
        isLoading: this.isLoading,
        isAuthenticated: this.isAuthenticated
      });
    });
  }

  // Get current auth state
  getAuthState() {
    return {
      user: this.user,
      isLoading: this.isLoading,
      isAuthenticated: this.isAuthenticated
    };
  }
}

// Global auth manager instance
window.authManager = new AuthManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { authManager: window.authManager };
}

// Utility function to check for unauthorized errors
function isUnauthorizedError(error) {
  return error.message && /^401: .*Unauthorized/.test(error.message);
}

// Enhanced fetch with auth error handling
async function authenticatedFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Handle unauthorized error
      console.warn('Authentication required, redirecting to login...');
      setTimeout(() => {
        window.location.href = '/api/login';
      }, 1000);
      throw new Error('401: Unauthorized - Please log in');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    throw error;
  }
}

// Make authenticatedFetch globally available
window.authenticatedFetch = authenticatedFetch;
window.isUnauthorizedError = isUnauthorizedError;

console.log('🔐 Blaze Intelligence Auth System Loaded');