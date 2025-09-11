
/**
 * Blaze Intelligence Security Monitoring System
 * Real-time threat detection and incident response
 */

const EventEmitter = require('events');

class BlazeSecurityMonitor extends EventEmitter {
  constructor() {
    super();
    this.threats = new Map();
    this.anomalies = [];
    this.securityEvents = [];
    this.alertThreshold = 0.95;
  }

  // Monitor API requests for threats
  monitorRequest(req, res, next) {
    const securityContext = {
      ip: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method,
      timestamp: Date.now(),
      userId: req.user?.userId
    };

    // Check for SQL injection patterns
    if (this.detectSQLInjection(req)) {
      this.handleThreat('sql_injection', securityContext, 'CRITICAL');
      return res.status(400).json({
        success: false,
        error: 'Invalid request detected',
        errorCode: 'SECURITY_VIOLATION'
      });
    }

    // Check for XSS attempts
    if (this.detectXSS(req)) {
      this.handleThreat('xss_attempt', securityContext, 'HIGH');
      return res.status(400).json({
        success: false,
        error: 'Invalid request detected',
        errorCode: 'SECURITY_VIOLATION'
      });
    }

    // Check for brute force attempts
    if (this.detectBruteForce(securityContext)) {
      this.handleThreat('brute_force', securityContext, 'MEDIUM');
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        errorCode: 'RATE_LIMITED'
      });
    }

    // Check for anomalous behavior
    const anomalyScore = this.calculateAnomalyScore(securityContext);
    if (anomalyScore > this.alertThreshold) {
      this.handleAnomaly(securityContext, anomalyScore);
    }

    // Log security event
    this.logSecurityEvent('request', securityContext, 'INFO');

    next();
  }

  // Detect SQL injection attempts
  detectSQLInjection(req) {
    const sqlPatterns = [
      /('|(\'))+.*(or|union|and|select|insert|update|delete|drop|create|alter|exec|script)/i,
      /union\s+select/i,
      /'\s*or\s*'1'\s*=\s*'1/i,
      /\bdrop\s+table\b/i
    ];

    const checkText = JSON.stringify(req.query) + JSON.stringify(req.body);
    return sqlPatterns.some(pattern => pattern.test(checkText));
  }

  // Detect XSS attempts
  detectXSS(req) {
    const xssPatterns = [
      /<script[^>]*>.*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi
    ];

    const checkText = JSON.stringify(req.query) + JSON.stringify(req.body);
    return xssPatterns.some(pattern => pattern.test(checkText));
  }

  // Detect brute force attempts
  detectBruteForce(securityContext) {
    const key = securityContext.ip;
    const now = Date.now();
    const window = 5 * 60 * 1000; // 5 minutes
    
    if (!this.threats.has(key)) {
      this.threats.set(key, []);
    }
    
    const attempts = this.threats.get(key);
    
    // Clean old attempts
    const recentAttempts = attempts.filter(timestamp => now - timestamp < window);
    this.threats.set(key, recentAttempts);
    
    // Add current attempt
    recentAttempts.push(now);
    
    // Check if threshold exceeded (20 requests in 5 minutes)
    return recentAttempts.length > 20;
  }

  // Calculate anomaly score using simple heuristics
  calculateAnomalyScore(context) {
    let score = 0;
    
    // Unusual time of access (outside business hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) score += 0.3;
    
    // Unusual endpoint access patterns
    if (context.endpoint.includes('admin') && !context.userId) {
      score += 0.4;
    }
    
    // High-value endpoint access
    if (context.endpoint.includes('cardinals-analytics') || 
        context.endpoint.includes('nil-calculator')) {
      score += 0.2;
    }
    
    // Unusual user agent
    if (!context.userAgent || context.userAgent.length < 10) {
      score += 0.3;
    }
    
    return Math.min(1.0, score);
  }

  // Handle detected threats
  handleThreat(threatType, context, severity) {
    const threat = {
      type: threatType,
      severity,
      context,
      timestamp: Date.now(),
      id: this.generateThreatId()
    };

    this.logSecurityEvent('threat_detected', threat, severity);
    this.emit('threat', threat);

    // Auto-block for critical threats
    if (severity === 'CRITICAL') {
      this.blockIP(context.ip, '1 hour');
    }

    // Send alerts
    this.sendSecurityAlert(threat);
  }

  // Handle anomalies
  handleAnomaly(context, score) {
    const anomaly = {
      context,
      score,
      timestamp: Date.now(),
      id: this.generateThreatId()
    };

    this.anomalies.push(anomaly);
    this.logSecurityEvent('anomaly_detected', anomaly, 'MEDIUM');
    this.emit('anomaly', anomaly);

    // Keep only recent anomalies
    this.anomalies = this.anomalies.slice(-1000);
  }

  // Log security events
  logSecurityEvent(type, data, level) {
    const event = {
      timestamp: new Date().toISOString(),
      type,
      level,
      data,
      system: 'blaze-security-monitor'
    };

    this.securityEvents.push(event);
    console.log(`🔒 SECURITY [${level}]: ${type}`, data);

    // In production, send to SIEM system
    this.sendToSIEM(event);
  }

  // Send security alerts
  sendSecurityAlert(threat) {
    const webhook = process.env.SECURITY_WEBHOOK_URL;
    if (!webhook) return;

    const payload = {
      text: `🚨 Security Alert: ${threat.type.toUpperCase()}`,
      attachments: [{
        color: threat.severity === 'CRITICAL' ? 'danger' : 'warning',
        fields: [
          { title: 'Threat Type', value: threat.type, short: true },
          { title: 'Severity', value: threat.severity, short: true },
          { title: 'IP Address', value: threat.context.ip, short: true },
          { title: 'Endpoint', value: threat.context.endpoint, short: true },
          { title: 'Time', value: new Date().toISOString(), short: false }
        ]
      }]
    };

    // Send to Slack/Teams (implementation depends on webhook service)
    fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(console.error);
  }

  // Utility methods
  getClientIP(req) {
    return req.headers['cf-connecting-ip'] ||
           req.headers['x-forwarded-for'] ||
           req.connection.remoteAddress ||
           req.ip;
  }

  generateThreatId() {
    return 'threat_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  blockIP(ip, duration) {
    console.log(`🚫 Blocking IP ${ip} for ${duration}`);
    // Implementation would integrate with firewall/load balancer
  }

  sendToSIEM(event) {
    // Implementation would send to Splunk, ELK, or other SIEM
    // For now, just structured logging
    console.log('SIEM:', JSON.stringify(event));
  }
}

module.exports = BlazeSecurityMonitor;
