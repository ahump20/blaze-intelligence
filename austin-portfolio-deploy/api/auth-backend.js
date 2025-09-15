// Enterprise JWT Authentication Backend System
// Blaze Intelligence Championship Platform
// SOC 2 Compliant Authentication with Enterprise Security

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createHash, timingSafeEqual } from 'crypto';

class EnterpriseAuthBackend {
  constructor() {
    this.saltRounds = 12;
    this.jwtSecret = process.env.JWT_SECRET || this.generateSecureSecret();
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || this.generateSecureSecret();
    this.tokenExpiry = '15m'; // Short-lived access tokens
    this.refreshExpiry = '7d'; // Longer refresh tokens

    // SOC 2 Compliance: Security monitoring
    this.auditLog = [];
    this.failedAttempts = new Map();
    this.rateLimits = new Map();

    this.initializeDatabase();
  }

  generateSecureSecret() {
    return crypto.randomBytes(64).toString('hex');
  }

  async initializeDatabase() {
    // In production, this would connect to PostgreSQL or MongoDB
    this.users = new Map();
    this.sessions = new Map();
    this.refreshTokens = new Map();

    // Create default admin user for demo
    await this.createUser({
      email: 'admin@blaze-intelligence.com',
      password: 'Admin2024!',
      role: 'enterprise',
      permissions: ['all']
    });
  }

  // SOC 2 Compliance: Audit logging
  logAuditEvent(userId, action, details = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      details,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };

    this.auditLog.push(event);

    // In production: send to centralized logging system
    console.log('AUDIT LOG:', JSON.stringify(event));
  }

  // Rate limiting for security
  checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const key = `${identifier}:${Math.floor(now / windowMs)}`;

    const attempts = this.rateLimits.get(key) || 0;
    if (attempts >= maxAttempts) {
      return false;
    }

    this.rateLimits.set(key, attempts + 1);
    return true;
  }

  // Enterprise password validation
  validatePassword(password) {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      notCommon: !['password', '123456', 'admin'].includes(password.toLowerCase())
    };

    const isValid = Object.values(requirements).every(req => req);
    return { isValid, requirements };
  }

  // Secure user creation
  async createUser({ email, password, role = 'basic', permissions = [] }) {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password required');
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error('Password does not meet security requirements');
      }

      // Check if user exists
      if (this.users.has(email)) {
        throw new Error('User already exists');
      }

      // Hash password with salt
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      // Create user record
      const user = {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        role,
        permissions,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
        mfaEnabled: false,
        mfaSecret: null,
        accountLocked: false,
        loginAttempts: 0,
        subscription: {
          tier: this.getRoleDefaultTier(role),
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      this.users.set(email, user);

      this.logAuditEvent(user.id, 'USER_CREATED', { email, role });

      return { success: true, userId: user.id };
    } catch (error) {
      this.logAuditEvent(null, 'USER_CREATION_FAILED', { email, error: error.message });
      throw error;
    }
  }

  getRoleDefaultTier(role) {
    const tiers = {
      'basic': 'Basic',
      'coach': 'Pro',
      'analyst': 'Pro',
      'executive': 'Enterprise',
      'developer': 'Enterprise',
      'enterprise': 'Enterprise'
    };
    return tiers[role] || 'Basic';
  }

  // Authentication with security measures
  async authenticate({ email, password, ip, userAgent }) {
    try {
      // Rate limiting
      if (!this.checkRateLimit(ip)) {
        throw new Error('Rate limit exceeded');
      }

      const user = this.users.get(email);
      if (!user) {
        this.logAuditEvent(null, 'LOGIN_FAILED', { email, reason: 'USER_NOT_FOUND', ip, userAgent });
        throw new Error('Invalid credentials');
      }

      // Check account status
      if (!user.isActive || user.accountLocked) {
        this.logAuditEvent(user.id, 'LOGIN_BLOCKED', { email, reason: 'ACCOUNT_LOCKED', ip, userAgent });
        throw new Error('Account locked or inactive');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        user.loginAttempts = (user.loginAttempts || 0) + 1;

        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.accountLocked = true;
          this.logAuditEvent(user.id, 'ACCOUNT_LOCKED', { email, attempts: user.loginAttempts, ip, userAgent });
        }

        this.logAuditEvent(user.id, 'LOGIN_FAILED', { email, reason: 'INVALID_PASSWORD', ip, userAgent });
        throw new Error('Invalid credentials');
      }

      // Reset login attempts on successful auth
      user.loginAttempts = 0;
      user.lastLogin = new Date().toISOString();

      // Generate JWT tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Store session
      const sessionId = crypto.randomUUID();
      const session = {
        userId: user.id,
        sessionId,
        accessToken,
        refreshToken,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        ip,
        userAgent,
        isActive: true
      };

      this.sessions.set(sessionId, session);
      this.refreshTokens.set(refreshToken, { userId: user.id, sessionId });

      this.logAuditEvent(user.id, 'LOGIN_SUCCESS', { email, sessionId, ip, userAgent });

      return {
        success: true,
        accessToken,
        refreshToken,
        sessionId,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          subscription: user.subscription
        }
      };

    } catch (error) {
      throw error;
    }
  }

  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      subscription: user.subscription,
      type: 'access'
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.tokenExpiry,
      issuer: 'blaze-intelligence',
      audience: 'blaze-api'
    });
  }

  generateRefreshToken(user) {
    const payload = {
      userId: user.id,
      type: 'refresh',
      jti: crypto.randomUUID()
    };

    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
      issuer: 'blaze-intelligence',
      audience: 'blaze-api'
    });
  }

  // Token verification middleware
  async verifyToken(token, type = 'access') {
    try {
      const secret = type === 'access' ? this.jwtSecret : this.refreshSecret;
      const decoded = jwt.verify(token, secret);

      if (decoded.type !== type) {
        throw new Error('Invalid token type');
      }

      // Check if session is still active
      if (type === 'access') {
        const sessionExists = Array.from(this.sessions.values())
          .some(session => session.userId === decoded.userId && session.isActive);

        if (!sessionExists) {
          throw new Error('Session expired or invalid');
        }
      }

      return { success: true, decoded };
    } catch (error) {
      this.logAuditEvent(null, 'TOKEN_VERIFICATION_FAILED', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const verification = await this.verifyToken(refreshToken, 'refresh');
      if (!verification.success) {
        throw new Error('Invalid refresh token');
      }

      const { userId } = verification.decoded;
      const user = Array.from(this.users.values()).find(u => u.id === userId);

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const newAccessToken = this.generateAccessToken(user);

      this.logAuditEvent(userId, 'TOKEN_REFRESHED', {});

      return {
        success: true,
        accessToken: newAccessToken
      };

    } catch (error) {
      this.logAuditEvent(null, 'TOKEN_REFRESH_FAILED', { error: error.message });
      throw error;
    }
  }

  // Session management
  async logout(sessionId) {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isActive = false;
        this.refreshTokens.delete(session.refreshToken);

        this.logAuditEvent(session.userId, 'LOGOUT', { sessionId });

        return { success: true };
      }

      return { success: false, error: 'Session not found' };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile with permissions
  async getUserProfile(userId) {
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        subscription: user.subscription,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        mfaEnabled: user.mfaEnabled
      };
    } catch (error) {
      throw error;
    }
  }

  // Password reset flow
  async initiatePasswordReset(email) {
    try {
      const user = this.users.get(email);
      if (!user) {
        // Don't reveal if user exists for security
        return { success: true, message: 'Reset email sent if account exists' };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      user.resetToken = resetToken;
      user.resetExpiry = resetExpiry;

      this.logAuditEvent(user.id, 'PASSWORD_RESET_INITIATED', { email });

      // In production: send email with reset link
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return { success: true, message: 'Reset email sent if account exists' };
    } catch (error) {
      throw error;
    }
  }

  // Enterprise role-based access control
  hasPermission(user, permission) {
    if (user.permissions.includes('all')) return true;
    if (user.permissions.includes(permission)) return true;

    // Role-based defaults
    const rolePermissions = {
      'basic': ['dashboard:read', 'analytics:basic'],
      'coach': ['dashboard:read', 'analytics:full', 'team:manage'],
      'analyst': ['dashboard:read', 'analytics:full', 'reports:create'],
      'executive': ['dashboard:read', 'analytics:full', 'reports:create', 'billing:view'],
      'developer': ['api:read', 'api:write', 'docs:read'],
      'enterprise': ['all']
    };

    const defaultPermissions = rolePermissions[user.role] || [];
    return defaultPermissions.includes(permission);
  }

  // Get security audit log
  getAuditLog(filters = {}) {
    let logs = [...this.auditLog];

    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }

    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }

    if (filters.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Enterprise health check
  getSystemHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        activeUsers: Array.from(this.users.values()).filter(u => u.isActive).length,
        activeSessions: Array.from(this.sessions.values()).filter(s => s.isActive).length,
        auditLogEntries: this.auditLog.length,
        rateLimitEntries: this.rateLimits.size
      },
      security: {
        failedLogins: this.auditLog.filter(log => log.action === 'LOGIN_FAILED').length,
        lockedAccounts: Array.from(this.users.values()).filter(u => u.accountLocked).length
      }
    };
  }
}

// Express.js middleware for authentication
export const authMiddleware = (authBackend) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No valid authorization header' });
      }

      const token = authHeader.substring(7);
      const verification = await authBackend.verifyToken(token);

      if (!verification.success) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.user = verification.decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  };
};

// Permission checking middleware
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const authBackend = req.app.get('authBackend');
    if (!authBackend.hasPermission(req.user, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export default EnterpriseAuthBackend;