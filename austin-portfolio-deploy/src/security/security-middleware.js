
/**
 * Blaze Intelligence Security Middleware Integration
 * Combines all security measures into Express middleware
 */

const BlazeAuthManager = require('../src/security/auth-manager');
const BlazeAccessControl = require('../src/security/access-control');
const BlazeSecurityMonitor = require('../src/security/security-monitor');
const BlazeComplianceManager = require('../src/security/compliance-manager');
const BlazeEncryption = require('../src/security/encryption');

class BlazeSecurityMiddleware {
  constructor(config = {}) {
    this.auth = new BlazeAuthManager(config.auth || {});
    this.access = new BlazeAccessControl();
    this.monitor = new BlazeSecurityMonitor();
    this.compliance = new BlazeComplianceManager();
    this.encryption = new BlazeEncryption();
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Handle security threats
    this.monitor.on('threat', (threat) => {
      console.log('🚨 SECURITY THREAT DETECTED:', threat.type);
      this.handleSecurityThreat(threat);
    });

    // Handle anomalies
    this.monitor.on('anomaly', (anomaly) => {
      console.log('⚠️ SECURITY ANOMALY:', anomaly.score);
      this.handleSecurityAnomaly(anomaly);
    });
  }

  // Complete security middleware stack
  getMiddlewareStack() {
    return [
      // 1. Security headers
      this.access.securityHeaders(),
      
      // 2. Input validation
      this.access.validateInput(),
      
      // 3. IP access control
      this.access.ipAccessControl(),
      
      // 4. Security monitoring
      this.monitor.monitorRequest.bind(this.monitor),
      
      // 5. Rate limiting
      this.auth.createRateLimit(100, 15 * 60 * 1000), // 100 requests per 15 minutes
      
      // 6. Authentication (optional - applied per endpoint)
      // this.auth.verifyToken(),
      
      // 7. Access control (applied per endpoint with permissions)
      // this.access.requirePermission('read:endpoint')
    ];
  }

  // Cardinals Analytics protection
  protectCardinalsEndpoint() {
    return [
      ...this.getMiddlewareStack(),
      this.auth.verifyToken(['read:cardinals-analytics']),
      this.access.cardinalsAnalyticsAccess(),
      (req, res, next) => {
        // Encrypt sensitive Cardinals data before sending
        const originalSend = res.send;
        res.send = (data) => {
          if (typeof data === 'object' && data.data) {
            data.data = this.encryption.encryptCardinalsData(data.data);
          }
          originalSend.call(res, data);
        };
        next();
      }
    ];
  }

  // NIL Calculator protection (COPPA compliant)
  protectNILEndpoint() {
    return [
      ...this.getMiddlewareStack(),
      this.auth.verifyToken(['read:nil-calculator']),
      ...this.access.nilCalculatorAccess(),
      (req, res, next) => {
        // Validate COPPA compliance
        const validation = this.compliance.validateCOPPACompliance(req.body);
        if (!validation.compliant) {
          return res.status(400).json({
            success: false,
            error: 'COPPA compliance violation',
            errors: validation.errors
          });
        }
        
        // Log NIL calculation for SOX compliance
        res.on('finish', () => {
          if (res.statusCode === 200) {
            this.compliance.auditNILCalculation({
              inputs: req.body,
              outputs: res.locals.calculationResult,
              userId: req.user?.userId,
              algorithmVersion: '1.0.0',
              dataSources: ['performance-stats', 'social-media', 'market-data']
            });
          }
        });
        
        next();
      }
    ];
  }

  // Security incident handlers
  handleSecurityThreat(threat) {
    switch (threat.severity) {
      case 'CRITICAL':
        this.blockIP(threat.context.ip, '24 hours');
        this.notifySecurityTeam(threat, 'immediate');
        break;
      case 'HIGH':
        this.increaseMonitoring(threat.context.ip);
        this.notifySecurityTeam(threat, '1 hour');
        break;
      case 'MEDIUM':
        this.logSecurityEvent(threat);
        break;
    }
  }

  handleSecurityAnomaly(anomaly) {
    if (anomaly.score > 0.9) {
      this.notifySecurityTeam(anomaly, '4 hours');
    }
  }

  // Utility methods
  blockIP(ip, duration) {
    console.log(`🚫 Security: Blocking IP ${ip} for ${duration}`);
    // Integration with firewall/load balancer would go here
  }

  notifySecurityTeam(incident, urgency) {
    console.log(`🚨 Security: Notifying team with ${urgency} urgency`);
    // Integration with alerting system would go here
  }

  increaseMonitoring(ip) {
    console.log(`👁️ Security: Increased monitoring for IP ${ip}`);
    // Enhanced logging and monitoring for specific IP
  }

  logSecurityEvent(event) {
    console.log('📝 Security Event Logged:', event.type);
    // Structured logging to SIEM system
  }
}

module.exports = BlazeSecurityMiddleware;
