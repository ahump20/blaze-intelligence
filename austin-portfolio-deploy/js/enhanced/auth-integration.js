// Simple Replit Auth integration for Blaze Intelligence
// This provides basic login/logout functionality

class BlazeAuth {
  constructor() {
    this.user = null;
    this.isLoading = true;
    this.isAuthenticated = false;
    this.checkInterval = null;
    
    this.init();
  }

  async init() {
    // Check authentication status
    await this.checkAuthStatus();
    
    // Set up periodic auth check
    this.checkInterval = setInterval(() => {
      this.checkAuthStatus();
    }, 30000); // Check every 30 seconds
    
    // Update UI based on auth status
    this.updateUI();
  }

  async checkAuthStatus() {
    try {
      this.isLoading = true;
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        cache: 'no-cache'
      });

      if (response.ok) {
        this.user = await response.json();
        this.isAuthenticated = true;
        console.log('✅ User authenticated:', this.user.email || 'Unknown');
      } else if (response.status === 401) {
        this.user = null;
        this.isAuthenticated = false;
        console.log('🔓 User not authenticated');
      } else {
        console.warn('⚠️ Auth check failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      this.user = null;
      this.isAuthenticated = false;
    } finally {
      this.isLoading = false;
    }
  }

  login() {
    console.log('🔐 Redirecting to Replit Auth...');
    window.location.href = '/api/login';
  }

  logout() {
    console.log('🔓 Logging out...');
    window.location.href = '/api/logout';
  }

  updateUI() {
    // Update login/logout buttons if they exist
    const loginButtons = document.querySelectorAll('[data-auth="login"]');
    const logoutButtons = document.querySelectorAll('[data-auth="logout"]');
    const userInfo = document.querySelectorAll('[data-auth="user-info"]');
    const protectedContent = document.querySelectorAll('[data-auth="protected"]');

    if (this.isAuthenticated && this.user) {
      // Hide login buttons, show logout buttons
      loginButtons.forEach(btn => btn.style.display = 'none');
      logoutButtons.forEach(btn => btn.style.display = 'block');
      
      // Show user information
      userInfo.forEach(element => {
        element.style.display = 'block';
        element.textContent = this.user.firstName ? 
          `${this.user.firstName} ${this.user.lastName || ''}`.trim() : 
          (this.user.email || 'User');
      });

      // Show protected content
      protectedContent.forEach(element => element.style.display = 'block');
    } else {
      // Show login buttons, hide logout buttons
      loginButtons.forEach(btn => btn.style.display = 'block');
      logoutButtons.forEach(btn => btn.style.display = 'none');
      
      // Hide user information
      userInfo.forEach(element => element.style.display = 'none');
      
      // Hide protected content
      protectedContent.forEach(element => element.style.display = 'none');
    }
  }

  // Get current user data
  getUser() {
    return this.user;
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  // Cleanup
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// Initialize global auth manager
window.blazeAuth = new BlazeAuth();

// Auto-update UI when DOM content loads
document.addEventListener('DOMContentLoaded', () => {
  window.blazeAuth.updateUI();
});

console.log('🔥 Blaze Intelligence Auth System Ready');