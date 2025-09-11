
/**
 * Blaze Intelligence Authentication Middleware
 * Enterprise-grade authentication with MFA support
 */

const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const rateLimit = require('express-rate-limit');

class BlazeAuthManager {
  constructor(config) {
    this.jwtSecret = config.JWT_SECRET;
    this.mfaRequired = config.MFA_REQUIRED || false;
    this.sessionTimeout = config.SESSION_TIMEOUT || 86400; // 24 hours
    this.rateLimits = new Map();
  }

  // JWT Token Generation
  generateToken(user, permissions = []) {
    const payload = {
      userId: user.id,
      email: user.email,
      permissions,
      mfaVerified: user.mfaVerified || false,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.sessionTimeout
    };

    return jwt.sign(payload, this.jwtSecret, { 
      algorithm: 'HS256',
      issuer: 'blaze-intelligence',
      audience: 'api-users'
    });
  }

  // Token Verification Middleware
  verifyToken(requiredPermissions = []) {
    return async (req, res, next) => {
      try {
        const token = this.extractToken(req);
        if (!token) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required',
            errorCode: 'NO_TOKEN'
          });
        }

        const decoded = jwt.verify(token, this.jwtSecret);
        
        // Check if MFA is required and verified
        if (this.mfaRequired && !decoded.mfaVerified) {
          return res.status(401).json({
            success: false,
            error: 'MFA verification required',
            errorCode: 'MFA_REQUIRED'
          });
        }

        // Check permissions
        if (requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.every(permission =>
            decoded.permissions.includes(permission)
          );
          
          if (!hasPermission) {
            return res.status(403).json({
              success: false,
              error: 'Insufficient permissions',
              errorCode: 'INSUFFICIENT_PERMISSIONS',
              required: requiredPermissions,
              granted: decoded.permissions
            });
          }
        }

        // Attach user info to request
        req.user = decoded;
        next();
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            error: 'Token expired',
            errorCode: 'TOKEN_EXPIRED'
          });
        }

        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          errorCode: 'INVALID_TOKEN'
        });
      }
    };
  }

  // MFA Verification
  async verifyMFA(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2-step tolerance
    });
  }

  // Rate Limiting by User/IP
  createRateLimit(requests, windowMs, identifier = 'ip') {
    return rateLimit({
      windowMs,
      max: requests,
      keyGenerator: (req) => {
        return identifier === 'user' ? req.user?.userId : req.ip;
      },
      message: {
        success: false,
        error: 'Rate limit exceeded',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  // Extract token from request
  extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Also check query parameter for API compatibility
    return req.query.apiKey;
  }

  // Audit logging
  auditLog(req, action, result) {
    const audit = {
      timestamp: new Date().toISOString(),
      userId: req.user?.userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      action,
      result,
      endpoint: req.path,
      method: req.method
    };

    console.log('🔒 AUDIT:', JSON.stringify(audit));
    // In production, send to secure logging service
  }
}

module.exports = BlazeAuthManager;
