
/**
 * Blaze Intelligence Access Control System
 * Role-based and attribute-based access control
 */

class BlazeAccessControl {
  constructor() {
    this.roles = new Map([
      ['super_admin', ['*']],
      ['admin', ['read:all', 'write:configuration', 'manage:users', 'view:analytics']],
      ['api_user', ['read:cardinals-analytics', 'read:nil-calculator', 'write:nil-calculations', 'read:multi-sport']],
      ['readonly', ['read:public-analytics', 'read:dashboard']]
    ]);
    
    this.ipWhitelist = new Set();
    this.ipBlacklist = new Set();
    this.failedAttempts = new Map();
  }

  // Check if user has required permission
  hasPermission(userPermissions, requiredPermission) {
    if (userPermissions.includes('*')) return true;
    if (userPermissions.includes(requiredPermission)) return true;
    
    // Check wildcard permissions
    const [action, resource] = requiredPermission.split(':');
    return userPermissions.some(permission => {
      const [permAction, permResource] = permission.split(':');
      return (permAction === '*' && permResource === resource) ||
             (permAction === action && permResource === '*');
    });
  }

  // Middleware for endpoint protection
  requirePermission(permission) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          errorCode: 'NOT_AUTHENTICATED'
        });
      }

      if (!this.hasPermission(req.user.permissions, permission)) {
        this.auditDeniedAccess(req, permission);
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          errorCode: 'ACCESS_DENIED',
          required: permission
        });
      }

      next();
    };
  }

  // Cardinals analytics access control
  cardinalsAnalyticsAccess() {
    return this.requirePermission('read:cardinals-analytics');
  }

  // NIL calculator access with age verification
  nilCalculatorAccess() {
    return [
      this.requirePermission('read:nil-calculator'),
      (req, res, next) => {
        // COPPA compliance check
        if (req.body.age && req.body.age < 13) {
          return res.status(400).json({
            success: false,
            error: 'COPPA compliance: Cannot process data for users under 13',
            errorCode: 'COPPA_VIOLATION'
          });
        }

        if (req.body.age && req.body.age < 18 && !req.body.parentalConsent) {
          return res.status(400).json({
            success: false,
            error: 'Parental consent required for users under 18',
            errorCode: 'PARENTAL_CONSENT_REQUIRED'
          });
        }

        next();
      }
    ];
  }

  // IP-based access control
  ipAccessControl() {
    return (req, res, next) => {
      const clientIP = this.getClientIP(req);
      
      // Check blacklist
      if (this.ipBlacklist.has(clientIP)) {
        this.auditBlacklistedAccess(req, clientIP);
        return res.status(403).json({
          success: false,
          error: 'Access denied from this IP',
          errorCode: 'IP_BLACKLISTED'
        });
      }

      // Check failed attempts
      const attempts = this.failedAttempts.get(clientIP) || 0;
      if (attempts >= 5) {
        this.ipBlacklist.add(clientIP);
        return res.status(429).json({
          success: false,
          error: 'Too many failed attempts - IP temporarily blocked',
          errorCode: 'IP_RATE_LIMITED'
        });
      }

      // Geo-blocking for admin endpoints
      if (req.path.includes('/admin/') && !this.isUSIP(clientIP)) {
        return res.status(403).json({
          success: false,
          error: 'Admin access restricted to US IPs',
          errorCode: 'GEO_RESTRICTED'
        });
      }

      next();
    };
  }

  // Security headers middleware
  securityHeaders() {
    return (req, res, next) => {
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self' api.blaze-intelligence.netlify.app"
      );
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      next();
    };
  }

  // Input validation middleware
  validateInput() {
    return (req, res, next) => {
      // Sanitize request body
      if (req.body) {
        req.body = this.sanitizeObject(req.body);
      }

      // Validate request size
      const contentLength = parseInt(req.get('content-length')) || 0;
      if (contentLength > 10 * 1024 * 1024) { // 10MB limit
        return res.status(413).json({
          success: false,
          error: 'Request too large',
          errorCode: 'REQUEST_TOO_LARGE'
        });
      }

      next();
    };
  }

  // Utility methods
  getClientIP(req) {
    return req.headers['cf-connecting-ip'] ||
           req.headers['x-forwarded-for'] ||
           req.connection.remoteAddress ||
           req.ip;
  }

  sanitizeObject(obj) {
    if (typeof obj === 'string') {
      return obj.replace(/<script[^<]*(?:(?!</script>)<[^<]*)*</script>/gi, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  }

  isUSIP(ip) {
    // Implementation would use IP geolocation service
    // Placeholder for now
    return true;
  }

  auditDeniedAccess(req, permission) {
    console.log('🚫 ACCESS DENIED:', {
      timestamp: new Date().toISOString(),
      userId: req.user?.userId,
      ip: this.getClientIP(req),
      endpoint: req.path,
      requiredPermission: permission,
      userPermissions: req.user?.permissions
    });
  }

  auditBlacklistedAccess(req, ip) {
    console.log('🚨 BLACKLISTED ACCESS:', {
      timestamp: new Date().toISOString(),
      ip,
      endpoint: req.path,
      userAgent: req.get('User-Agent')
    });
  }
}

module.exports = BlazeAccessControl;
