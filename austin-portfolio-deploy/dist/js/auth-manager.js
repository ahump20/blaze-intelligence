/**
 * Blaze Intelligence - Authentication Manager
 * JWT-based authentication with premium feature gating
 * Includes login/signup UI components and session management
 */

class BlazeAuthManager {
    constructor(options = {}) {
        this.config = {
            apiBaseUrl: options.apiBaseUrl || this.getAPIBaseUrl(),
            tokenKey: 'blaze_auth_token',
            refreshTokenKey: 'blaze_refresh_token',
            userKey: 'blaze_user_data',
            tokenExpireBuffer: 5 * 60 * 1000, // 5 minutes before expiry
            autoRefresh: true,
            ...options
        };

        this.state = {
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            lastActivity: Date.now()
        };

        this.listeners = new Map();
        this.refreshTimer = null;

        // Premium feature definitions
        this.premiumFeatures = {
            'advanced-analytics': {
                name: 'Advanced Analytics',
                description: 'Real-time performance metrics and predictive modeling',
                requiredTier: 'pro'
            },
            'live-data-feeds': {
                name: 'Live Data Feeds',
                description: 'Real-time sports data with 30-second refresh',
                requiredTier: 'basic'
            },
            'video-analysis': {
                name: 'Video Analysis',
                description: 'AI-powered video breakdowns and coaching insights',
                requiredTier: 'pro'
            },
            'character-assessment': {
                name: 'Character Assessment',
                description: 'Micro-expression analysis and leadership evaluation',
                requiredTier: 'enterprise'
            },
            'custom-reports': {
                name: 'Custom Reports',
                description: 'Personalized analytics reports and insights',
                requiredTier: 'pro'
            },
            'api-access': {
                name: 'API Access',
                description: 'Full API access for custom integrations',
                requiredTier: 'enterprise'
            },
            'priority-support': {
                name: 'Priority Support',
                description: '24/7 priority support and consultation',
                requiredTier: 'enterprise'
            }
        };

        this.init();
    }

    async init() {
        console.log('🔐 Initializing Blaze Intelligence Auth Manager...');

        try {
            // Load stored authentication data
            await this.loadStoredAuth();

            // Start activity tracking
            this.startActivityTracking();

            // Start auto-refresh if enabled
            if (this.config.autoRefresh && this.state.isAuthenticated) {
                this.scheduleTokenRefresh();
            }

            console.log('✅ Auth Manager initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize Auth Manager:', error);
            this.clearStoredAuth();
        }
    }

    getAPIBaseUrl() {
        const hostname = window.location.hostname;

        if (hostname.includes('netlify.app') || hostname.includes('blaze-intelligence')) {
            return 'https://blaze-intelligence-mcp.onrender.com';
        }

        return 'http://localhost:3005'; // Development
    }

    async loadStoredAuth() {
        const token = localStorage.getItem(this.config.tokenKey);
        const refreshToken = localStorage.getItem(this.config.refreshTokenKey);
        const userData = localStorage.getItem(this.config.userKey);

        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                const tokenData = this.parseJWT(token);

                // Check if token is expired
                if (this.isTokenExpired(tokenData)) {
                    if (refreshToken) {
                        await this.refreshAccessToken();
                    } else {
                        this.clearStoredAuth();
                        return;
                    }
                } else {
                    this.setState({
                        user,
                        token,
                        refreshToken,
                        isAuthenticated: true
                    });
                }

            } catch (error) {
                console.error('❌ Failed to load stored auth:', error);
                this.clearStoredAuth();
            }
        }
    }

    async login(email, password) {
        this.setState({ isLoading: true });

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            await this.handleAuthSuccess(data);
            return { success: true, user: data.user };

        } catch (error) {
            console.error('❌ Login failed:', error);
            this.emit('auth-error', { type: 'login', error: error.message });
            return { success: false, error: error.message };

        } finally {
            this.setState({ isLoading: false });
        }
    }

    async signup(userData) {
        this.setState({ isLoading: true });

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            await this.handleAuthSuccess(data);
            return { success: true, user: data.user };

        } catch (error) {
            console.error('❌ Signup failed:', error);
            this.emit('auth-error', { type: 'signup', error: error.message });
            return { success: false, error: error.message };

        } finally {
            this.setState({ isLoading: false });
        }
    }

    async logout() {
        try {
            if (this.state.token) {
                await fetch(`${this.config.apiBaseUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.state.token}`
                    }
                });
            }
        } catch (error) {
            console.warn('⚠️ Logout request failed:', error);
        }

        this.clearStoredAuth();
        this.setState({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false
        });

        this.emit('auth-logout', { timestamp: Date.now() });
    }

    async refreshAccessToken() {
        if (!this.state.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: this.state.refreshToken
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Token refresh failed');
            }

            await this.handleAuthSuccess(data);
            return true;

        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            this.clearStoredAuth();
            this.emit('auth-error', { type: 'refresh', error: error.message });
            return false;
        }
    }

    async handleAuthSuccess(data) {
        const { user, token, refreshToken } = data;

        // Store authentication data
        localStorage.setItem(this.config.tokenKey, token);
        localStorage.setItem(this.config.userKey, JSON.stringify(user));

        if (refreshToken) {
            localStorage.setItem(this.config.refreshTokenKey, refreshToken);
        }

        // Update state
        this.setState({
            user,
            token,
            refreshToken: refreshToken || this.state.refreshToken,
            isAuthenticated: true
        });

        // Schedule token refresh
        if (this.config.autoRefresh) {
            this.scheduleTokenRefresh();
        }

        this.emit('auth-success', { user, timestamp: Date.now() });
    }

    clearStoredAuth() {
        localStorage.removeItem(this.config.tokenKey);
        localStorage.removeItem(this.config.refreshTokenKey);
        localStorage.removeItem(this.config.userKey);

        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    scheduleTokenRefresh() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        if (!this.state.token) return;

        const tokenData = this.parseJWT(this.state.token);
        const expiryTime = tokenData.exp * 1000; // Convert to milliseconds
        const refreshTime = expiryTime - this.config.tokenExpireBuffer;
        const delay = refreshTime - Date.now();

        if (delay > 0) {
            this.refreshTimer = setTimeout(() => {
                this.refreshAccessToken();
            }, delay);

            console.log(`🔄 Token refresh scheduled in ${Math.round(delay / 1000)} seconds`);
        }
    }

    // Premium feature gating
    hasFeatureAccess(featureId) {
        if (!this.state.isAuthenticated || !this.state.user) {
            return false;
        }

        const feature = this.premiumFeatures[featureId];
        if (!feature) return false;

        const userTier = this.state.user.subscriptionTier || 'free';
        const requiredTier = feature.requiredTier;

        const tierHierarchy = {
            'free': 0,
            'basic': 1,
            'pro': 2,
            'enterprise': 3
        };

        return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
    }

    getFeatureGateInfo(featureId) {
        const feature = this.premiumFeatures[featureId];
        const hasAccess = this.hasFeatureAccess(featureId);

        return {
            featureId,
            name: feature?.name || 'Unknown Feature',
            description: feature?.description || '',
            requiredTier: feature?.requiredTier || 'pro',
            hasAccess,
            userTier: this.state.user?.subscriptionTier || 'free',
            upgradeRequired: !hasAccess
        };
    }

    // UI Component Generation
    createLoginForm(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="blaze-auth-form">
                <div class="blaze-auth-header">
                    <h2>Login to Blaze Intelligence</h2>
                    <p>Access your sports analytics dashboard</p>
                </div>

                <form id="blaze-login-form" class="blaze-form">
                    <div class="blaze-form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required>
                    </div>

                    <div class="blaze-form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>

                    <button type="submit" class="blaze-btn blaze-btn-primary" id="login-btn">
                        <span class="btn-text">Sign In</span>
                        <span class="btn-loading">Signing In...</span>
                    </button>

                    <div class="blaze-auth-links">
                        <a href="#" id="forgot-password-link">Forgot Password?</a>
                        <a href="#" id="signup-link">Create Account</a>
                    </div>
                </form>

                <div id="auth-error" class="blaze-error-message" style="display: none;"></div>
            </div>
        `;

        this.attachLoginFormHandlers();
    }

    createSignupForm(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="blaze-auth-form">
                <div class="blaze-auth-header">
                    <h2>Join Blaze Intelligence</h2>
                    <p>Start your sports analytics journey</p>
                </div>

                <form id="blaze-signup-form" class="blaze-form">
                    <div class="blaze-form-row">
                        <div class="blaze-form-group">
                            <label for="firstName">First Name</label>
                            <input type="text" id="firstName" name="firstName" required>
                        </div>
                        <div class="blaze-form-group">
                            <label for="lastName">Last Name</label>
                            <input type="text" id="lastName" name="lastName" required>
                        </div>
                    </div>

                    <div class="blaze-form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required>
                    </div>

                    <div class="blaze-form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                        <small>Minimum 8 characters, include letters and numbers</small>
                    </div>

                    <div class="blaze-form-group">
                        <label for="organization">Organization (Optional)</label>
                        <input type="text" id="organization" name="organization">
                    </div>

                    <div class="blaze-form-group">
                        <label for="role">Role</label>
                        <select id="role" name="role" required>
                            <option value="">Select your role</option>
                            <option value="coach">Coach</option>
                            <option value="analyst">Sports Analyst</option>
                            <option value="scout">Scout</option>
                            <option value="administrator">Administrator</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div class="blaze-form-group blaze-checkbox-group">
                        <label class="blaze-checkbox">
                            <input type="checkbox" id="terms" name="terms" required>
                            <span class="checkmark"></span>
                            I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                        </label>
                    </div>

                    <button type="submit" class="blaze-btn blaze-btn-primary" id="signup-btn">
                        <span class="btn-text">Create Account</span>
                        <span class="btn-loading">Creating Account...</span>
                    </button>

                    <div class="blaze-auth-links">
                        <a href="#" id="login-link">Already have an account? Sign In</a>
                    </div>
                </form>

                <div id="auth-error" class="blaze-error-message" style="display: none;"></div>
            </div>
        `;

        this.attachSignupFormHandlers();
    }

    attachLoginFormHandlers() {
        const form = document.getElementById('blaze-login-form');
        const button = document.getElementById('login-btn');

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');

            button.classList.add('loading');

            const result = await this.login(email, password);

            button.classList.remove('loading');

            if (result.success) {
                this.showAuthSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                this.showAuthError(result.error);
            }
        });
    }

    attachSignupFormHandlers() {
        const form = document.getElementById('blaze-signup-form');
        const button = document.getElementById('signup-btn');

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                organization: formData.get('organization'),
                role: formData.get('role')
            };

            // Validate password strength
            if (!this.isValidPassword(userData.password)) {
                this.showAuthError('Password must be at least 8 characters long and include letters and numbers');
                return;
            }

            button.classList.add('loading');

            const result = await this.signup(userData);

            button.classList.remove('loading');

            if (result.success) {
                this.showAuthSuccess('Account created successfully! Welcome to Blaze Intelligence!');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                this.showAuthError(result.error);
            }
        });
    }

    showAuthError(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    showAuthSuccess(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.className = 'blaze-success-message';
            errorDiv.style.display = 'block';
        }
    }

    // Feature gating UI
    createFeatureGate(featureId, containerId) {
        const gateInfo = this.getFeatureGateInfo(featureId);
        const container = document.getElementById(containerId);
        if (!container) return;

        if (gateInfo.hasAccess) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = `
            <div class="blaze-feature-gate">
                <div class="feature-gate-header">
                    <h3>🔒 Premium Feature</h3>
                    <span class="required-tier">${gateInfo.requiredTier.toUpperCase()} Plan Required</span>
                </div>

                <div class="feature-gate-content">
                    <h4>${gateInfo.name}</h4>
                    <p>${gateInfo.description}</p>

                    <div class="upgrade-actions">
                        <button class="blaze-btn blaze-btn-primary upgrade-btn"
                                onclick="blazeAuth.navigateToUpgrade('${gateInfo.requiredTier}')">
                            Upgrade to ${gateInfo.requiredTier.charAt(0).toUpperCase() + gateInfo.requiredTier.slice(1)}
                        </button>
                        <a href="/pricing" class="blaze-btn blaze-btn-secondary">View Plans</a>
                    </div>
                </div>
            </div>
        `;

        container.style.display = 'block';
    }

    navigateToUpgrade(tier) {
        window.location.href = `/pricing?upgrade=${tier}`;
    }

    // Utility methods
    parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid token format');
        }
    }

    isTokenExpired(tokenData) {
        const currentTime = Math.floor(Date.now() / 1000);
        return tokenData.exp < currentTime;
    }

    isValidPassword(password) {
        return password.length >= 8 &&
               /[a-zA-Z]/.test(password) &&
               /[0-9]/.test(password);
    }

    startActivityTracking() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, () => {
                this.state.lastActivity = Date.now();
            }, { passive: true });
        });
    }

    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        this.listeners.get(event)?.delete(callback);
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in ${event} callback:`, error);
                }
            });
        }
    }

    setState(updates) {
        Object.assign(this.state, updates);
    }

    // Public API
    getUser() {
        return this.state.user;
    }

    isAuthenticated() {
        return this.state.isAuthenticated;
    }

    getAuthToken() {
        return this.state.token;
    }

    getUserTier() {
        return this.state.user?.subscriptionTier || 'free';
    }
}

// Global instance
window.BlazeAuthManager = BlazeAuthManager;

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.blazeAuth = new BlazeAuthManager();

    // Expose for global use
    window.checkFeatureAccess = (featureId) => window.blazeAuth.hasFeatureAccess(featureId);
    window.createFeatureGate = (featureId, containerId) => window.blazeAuth.createFeatureGate(featureId, containerId);
}

export default BlazeAuthManager;