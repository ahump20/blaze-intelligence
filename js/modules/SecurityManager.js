/**
 * Security Management Module
 * Handles authentication, authorization, and security measures
 */

export default class SecurityManager {
    constructor(core) {
        this.core = core;
        this.rateLimits = new Map();
        this.securityHeaders = {
            'X-Blaze-Client': 'portfolio-v2',
            'X-Timestamp': () => Date.now().toString(),
            'X-Request-ID': () => this.generateRequestId()
        };
        this.encryptionKey = null;
        this.sessionToken = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            await this.generateEncryptionKey();
            this.setupSecurityHeaders();
            this.initializeRateLimiting();
            this.setupContentSecurityPolicy();
            this.initializeSessionManagement();
            this.startSecurityMonitoring();
            
            this.isInitialized = true;
            console.log('✓ Security Manager initialized');
        } catch (error) {
            console.error('Failed to initialize Security Manager:', error);
            throw error;
        }
    }

    async generateEncryptionKey() {
        if (window.crypto && window.crypto.subtle) {
            try {
                this.encryptionKey = await window.crypto.subtle.generateKey(
                    {
                        name: 'AES-GCM',
                        length: 256
                    },
                    true,
                    ['encrypt', 'decrypt']
                );
            } catch (error) {
                console.warn('Failed to generate encryption key:', error);
                this.encryptionKey = null;
            }
        }
    }

    setupSecurityHeaders() {
        // Add security headers to all requests
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            const secureOptions = await this.secureRequest(options);
            return originalFetch(url, secureOptions);
        };
    }

    async secureRequest(options = {}) {
        const secureOptions = { ...options };
        
        // Add security headers
        secureOptions.headers = {
            ...secureOptions.headers,
            ...this.getSecurityHeaders()
        };

        // Add CSRF protection
        if (this.sessionToken) {
            secureOptions.headers['X-CSRF-Token'] = this.sessionToken;
        }

        // Rate limiting check
        const rateLimitKey = this.getRateLimitKey(options);
        if (!this.checkRateLimit(rateLimitKey)) {
            throw new Error('Rate limit exceeded');
        }

        // Encrypt sensitive data
        if (secureOptions.body && this.encryptionKey) {
            try {
                secureOptions.body = await this.encryptData(secureOptions.body);
                secureOptions.headers['X-Encrypted'] = 'true';
            } catch (error) {
                console.warn('Failed to encrypt request body:', error);
            }
        }

        return secureOptions;
    }

    async secureAIRequest(payload) {
        // Sanitize AI request payload
        const sanitizedPayload = this.sanitizePayload(payload);
        
        // Add AI-specific security headers
        const headers = {
            ...this.getSecurityHeaders(),
            'X-AI-Request': 'true',
            'X-Model-Version': payload.model || 'unknown'
        };

        // Remove sensitive information
        const securePayload = this.removeSensitiveData(sanitizedPayload);

        return {
            ...securePayload,
            headers
        };
    }

    sanitizePayload(payload) {
        if (typeof payload === 'string') {
            return this.sanitizeString(payload);
        }
        
        if (Array.isArray(payload)) {
            return payload.map(item => this.sanitizePayload(item));
        }
        
        if (typeof payload === 'object' && payload !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(payload)) {
                if (!this.isSensitiveField(key)) {
                    sanitized[key] = this.sanitizePayload(value);
                }
            }
            return sanitized;
        }
        
        return payload;
    }

    sanitizeString(str) {
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/data:text\/html/gi, '');
    }

    isSensitiveField(fieldName) {
        const sensitiveFields = [
            'password', 'token', 'secret', 'key', 'auth',
            'credential', 'session', 'cookie', 'api_key'
        ];
        return sensitiveFields.some(field => 
            fieldName.toLowerCase().includes(field)
        );
    }

    removeSensitiveData(payload) {
        const cleaned = { ...payload };
        
        // Remove common sensitive patterns
        const sensitivePatterns = [
            /\b[A-Za-z0-9+/]{40,}\b/g, // Base64 tokens
            /\b[A-Za-z0-9-_]{20,}\b/g, // API keys
            /\b(?:sk-|pk-)[A-Za-z0-9]{20,}\b/g, // OpenAI-style keys
            /\b[A-Za-z0-9]{32}\b/g, // MD5 hashes
            /\b[A-Za-z0-9]{40}\b/g, // SHA1 hashes
            /\b[A-Za-z0-9]{64}\b/g  // SHA256 hashes
        ];

        if (typeof cleaned.body === 'string') {
            sensitivePatterns.forEach(pattern => {
                cleaned.body = cleaned.body.replace(pattern, '[REDACTED]');
            });
        }

        return cleaned;
    }

    initializeRateLimiting() {
        this.rateLimits = new Map();
        
        // Default rate limits
        this.rateLimitConfig = {
            ai: { requests: 10, window: 60000 }, // 10 requests per minute
            api: { requests: 30, window: 60000 }, // 30 requests per minute
            auth: { requests: 5, window: 300000 }, // 5 requests per 5 minutes
            default: { requests: 50, window: 60000 } // 50 requests per minute
        };
    }

    checkRateLimit(key) {
        const now = Date.now();
        const config = this.rateLimitConfig[key] || this.rateLimitConfig.default;
        const windowStart = Math.floor(now / config.window) * config.window;
        const rateLimitKey = `${key}_${windowStart}`;
        
        const currentCount = this.rateLimits.get(rateLimitKey) || 0;
        
        if (currentCount >= config.requests) {
            this.core.emit('security:rate-limit-exceeded', { key, count: currentCount });
            return false;
        }
        
        this.rateLimits.set(rateLimitKey, currentCount + 1);
        return true;
    }

    getRateLimitKey(options) {
        const url = options.url || '';
        
        if (url.includes('/api/ai/')) return 'ai';
        if (url.includes('/api/auth/')) return 'auth';
        if (url.includes('/api/')) return 'api';
        
        return 'default';
    }

    setupContentSecurityPolicy() {
        // Add CSP meta tag if not present
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const csp = document.createElement('meta');
            csp.httpEquiv = 'Content-Security-Policy';
            csp.content = this.buildCSPPolicy();
            document.head.appendChild(csp);
        }
    }

    buildCSPPolicy() {
        return [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' https://generativelanguage.googleapis.com https://api.anthropic.com",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; ');
    }

    initializeSessionManagement() {
        // Generate session token
        this.sessionToken = this.generateSessionToken();
        
        // Store in secure storage
        this.storeSessionToken(this.sessionToken);
        
        // Set up session refresh
        this.setupSessionRefresh();
    }

    generateSessionToken() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    storeSessionToken(token) {
        try {
            // Use sessionStorage for security
            sessionStorage.setItem('blaze_session', token);
        } catch (error) {
            console.warn('Failed to store session token:', error);
        }
    }

    setupSessionRefresh() {
        // Refresh session token every 30 minutes
        setInterval(() => {
            this.refreshSession();
        }, 30 * 60 * 1000);
    }

    refreshSession() {
        const newToken = this.generateSessionToken();
        this.sessionToken = newToken;
        this.storeSessionToken(newToken);
        this.core.emit('security:session-refreshed', { token: newToken });
    }

    startSecurityMonitoring() {
        // Monitor for suspicious activity
        this.setupSuspiciousActivityDetection();
        
        // Monitor for XSS attempts
        this.setupXSSDetection();
        
        // Monitor for CSRF attempts
        this.setupCSRFDetection();
        
        // Monitor performance for security issues
        this.setupPerformanceMonitoring();
    }

    setupSuspiciousActivityDetection() {
        let requestCount = 0;
        let lastRequestTime = 0;
        
        document.addEventListener('beforeunload', () => {
            // Check for rapid requests
            const now = Date.now();
            if (now - lastRequestTime < 100) {
                requestCount++;
                if (requestCount > 10) {
                    this.reportSuspiciousActivity('rapid-requests', { count: requestCount });
                }
            } else {
                requestCount = 0;
            }
            lastRequestTime = now;
        });
    }

    setupXSSDetection() {
        // Monitor for potential XSS in form inputs
        document.addEventListener('input', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                const value = event.target.value;
                if (this.detectXSS(value)) {
                    this.reportSuspiciousActivity('xss-attempt', { 
                        element: event.target.tagName,
                        value: value.substring(0, 100)
                    });
                    event.target.value = this.sanitizeString(value);
                }
            }
        });
    }

    detectXSS(input) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /data:text\/html/gi,
            /vbscript:/gi,
            /expression\(/gi
        ];
        
        return xssPatterns.some(pattern => pattern.test(input));
    }

    setupCSRFDetection() {
        // Monitor for requests without proper CSRF tokens
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [url, options] = args;
            
            if (options?.method && options.method !== 'GET') {
                const hasCSRF = options.headers?.['X-CSRF-Token'];
                if (!hasCSRF && url.includes('/api/')) {
                    this.reportSuspiciousActivity('csrf-missing', { url });
                }
            }
            
            return originalFetch(...args);
        };
    }

    setupPerformanceMonitoring() {
        // Monitor for performance anomalies that might indicate attacks
        setInterval(() => {
            const memory = performance.memory;
            if (memory && memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
                this.reportSuspiciousActivity('high-memory-usage', {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize
                });
            }
        }, 60000); // Check every minute
    }

    reportSuspiciousActivity(type, details) {
        const report = {
            type,
            details,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.warn('Suspicious activity detected:', report);
        this.core.emit('security:suspicious-activity', report);
        
        // Store in local storage for later analysis
        this.storeSuspiciousActivity(report);
    }

    storeSuspiciousActivity(report) {
        try {
            const stored = JSON.parse(localStorage.getItem('blaze_security_reports') || '[]');
            stored.push(report);
            
            // Keep only last 50 reports
            if (stored.length > 50) {
                stored.splice(0, stored.length - 50);
            }
            
            localStorage.setItem('blaze_security_reports', JSON.stringify(stored));
        } catch (error) {
            console.warn('Failed to store security report:', error);
        }
    }

    // Encryption methods
    async encryptData(data) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not available');
        }
        
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            this.encryptionKey,
            dataBuffer
        );
        
        // Combine IV and encrypted data
        const result = new Uint8Array(iv.length + encrypted.byteLength);
        result.set(iv);
        result.set(new Uint8Array(encrypted), iv.length);
        
        return btoa(String.fromCharCode(...result));
    }

    async decryptData(encryptedData) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not available');
        }
        
        const dataBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const iv = dataBuffer.slice(0, 12);
        const encrypted = dataBuffer.slice(12);
        
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            this.encryptionKey,
            encrypted
        );
        
        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decrypted));
    }

    // Utility methods
    getSecurityHeaders() {
        const headers = {};
        
        Object.entries(this.securityHeaders).forEach(([key, value]) => {
            if (typeof value === 'function') {
                headers[key] = value();
            } else {
                headers[key] = value;
            }
        });
        
        return headers;
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Input validation
    validateInput(input, type) {
        switch (type) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
            case 'url':
                try {
                    new URL(input);
                    return true;
                } catch {
                    return false;
                }
            case 'filename':
                return /^[a-zA-Z0-9._-]+$/.test(input);
            case 'alphanumeric':
                return /^[a-zA-Z0-9]+$/.test(input);
            default:
                return true;
        }
    }

    sanitizeFilename(filename) {
        return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    }

    // Security audit methods
    performSecurityAudit() {
        const audit = {
            timestamp: Date.now(),
            checks: {
                https: location.protocol === 'https:',
                csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
                sessionToken: !!this.sessionToken,
                encryptionKey: !!this.encryptionKey,
                rateLimiting: this.rateLimits.size > 0,
                susiciousActivity: this.getSuspiciousActivityCount()
            },
            recommendations: []
        };
        
        // Generate recommendations
        if (!audit.checks.https) {
            audit.recommendations.push('Enable HTTPS for secure communication');
        }
        
        if (!audit.checks.csp) {
            audit.recommendations.push('Implement Content Security Policy');
        }
        
        if (!audit.checks.encryptionKey) {
            audit.recommendations.push('Enable client-side encryption');
        }
        
        return audit;
    }

    getSuspiciousActivityCount() {
        try {
            const stored = JSON.parse(localStorage.getItem('blaze_security_reports') || '[]');
            return stored.length;
        } catch {
            return 0;
        }
    }

    // Cleanup methods
    cleanup() {
        // Clear sensitive data
        this.encryptionKey = null;
        this.sessionToken = null;
        this.rateLimits.clear();
        
        // Clear session storage
        try {
            sessionStorage.removeItem('blaze_session');
        } catch (error) {
            console.warn('Failed to clear session storage:', error);
        }
        
        this.isInitialized = false;
    }

    // Debug methods (remove in production)
    debug() {
        return {
            isInitialized: this.isInitialized,
            hasEncryptionKey: !!this.encryptionKey,
            hasSessionToken: !!this.sessionToken,
            rateLimitCount: this.rateLimits.size,
            suspiciousActivityCount: this.getSuspiciousActivityCount(),
            audit: this.performSecurityAudit()
        };
    }
}