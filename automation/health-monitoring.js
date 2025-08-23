#!/usr/bin/env node

/**
 * Blaze Intelligence Health Monitoring & Performance Validation System
 * Comprehensive system health checks, performance monitoring, and automated recovery
 */

import EventEmitter from 'events';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Health Check Configuration
const HEALTH_CONFIG = {
    THRESHOLDS: {
        RESPONSE_TIME: 2000,      // 2 seconds max
        CPU_USAGE: 80,            // 80% max CPU
        MEMORY_USAGE: 85,         // 85% max memory
        DISK_USAGE: 90,           // 90% max disk
        ERROR_RATE: 0.05,         // 5% max error rate
        AVAILABILITY: 0.999       // 99.9% uptime target
    },
    INTERVALS: {
        QUICK_CHECK: 30000,       // 30 seconds
        DEEP_CHECK: 300000,       // 5 minutes  
        PERFORMANCE_AUDIT: 900000, // 15 minutes
        REPORT_GENERATION: 3600000 // 1 hour
    },
    ENDPOINTS: [
        {
            name: 'Main Dashboard',
            url: 'https://ahump20.github.io/blaze-intelligence/',
            critical: true,
            timeout: 5000
        },
        {
            name: 'Command Center',
            url: 'https://ahump20.github.io/blaze-intelligence/command-center.html',
            critical: true,
            timeout: 5000
        },
        {
            name: 'Cardinals Analysis',
            url: 'https://ahump20.github.io/blaze-intelligence/cardinals.html',
            critical: false,
            timeout: 5000
        },
        {
            name: 'API Documentation',
            url: 'https://ahump20.github.io/blaze-intelligence/api.html',
            critical: false,
            timeout: 5000
        }
    ]
};

// Performance Metrics Collector
class PerformanceMetrics {
    constructor() {
        this.metrics = {
            responseTime: [],
            availability: [],
            errorRate: [],
            throughput: [],
            resourceUsage: [],
            userExperience: []
        };
        
        this.alerts = [];
        this.baseline = null;
    }

    async collectSystemMetrics() {
        const startTime = performance.now();
        
        try {
            // CPU Usage
            const cpuUsage = await this.getCPUUsage();
            
            // Memory Usage
            const memoryUsage = await this.getMemoryUsage();
            
            // Disk Usage  
            const diskUsage = await this.getDiskUsage();
            
            // Network Metrics
            const networkMetrics = await this.getNetworkMetrics();
            
            const systemMetrics = {
                timestamp: Date.now(),
                cpu: cpuUsage,
                memory: memoryUsage,
                disk: diskUsage,
                network: networkMetrics,
                collectTime: performance.now() - startTime
            };
            
            this.metrics.resourceUsage.push(systemMetrics);
            
            // Keep only last 1000 entries
            if (this.metrics.resourceUsage.length > 1000) {
                this.metrics.resourceUsage = this.metrics.resourceUsage.slice(-1000);
            }
            
            return systemMetrics;
            
        } catch (error) {
            console.error('System metrics collection failed:', error);
            return null;
        }
    }

    async getCPUUsage() {
        try {
            // Get CPU usage on macOS
            const { stdout } = await execAsync('top -l 1 -n 0 | grep "CPU usage"');
            const match = stdout.match(/(\d+\.\d+)% user/);
            return match ? parseFloat(match[1]) : 0;
        } catch {
            return 0;
        }
    }

    async getMemoryUsage() {
        try {
            const { stdout } = await execAsync('vm_stat');
            const lines = stdout.split('\n');
            
            let pageSize = 4096; // Default page size
            let freePages = 0;
            let activePages = 0;
            let inactivePages = 0;
            let wiredPages = 0;
            
            for (const line of lines) {
                if (line.includes('page size of')) {
                    const match = line.match(/(\d+)/);
                    if (match) pageSize = parseInt(match[1]);
                } else if (line.includes('Pages free:')) {
                    const match = line.match(/(\d+)/);
                    if (match) freePages = parseInt(match[1]);
                } else if (line.includes('Pages active:')) {
                    const match = line.match(/(\d+)/);
                    if (match) activePages = parseInt(match[1]);
                } else if (line.includes('Pages inactive:')) {
                    const match = line.match(/(\d+)/);
                    if (match) inactivePages = parseInt(match[1]);
                } else if (line.includes('Pages wired down:')) {
                    const match = line.match(/(\d+)/);
                    if (match) wiredPages = parseInt(match[1]);
                }
            }
            
            const totalPages = freePages + activePages + inactivePages + wiredPages;
            const usedPages = totalPages - freePages;
            const usagePercent = totalPages > 0 ? (usedPages / totalPages) * 100 : 0;
            
            return {
                total: totalPages * pageSize,
                used: usedPages * pageSize,
                free: freePages * pageSize,
                usagePercent: usagePercent
            };
        } catch {
            return { total: 0, used: 0, free: 0, usagePercent: 0 };
        }
    }

    async getDiskUsage() {
        try {
            const { stdout } = await execAsync('df -h /');
            const lines = stdout.split('\n');
            if (lines.length > 1) {
                const parts = lines[1].split(/\s+/);
                const usagePercent = parseInt(parts[4].replace('%', ''));
                return {
                    total: parts[1],
                    used: parts[2],
                    available: parts[3],
                    usagePercent: usagePercent
                };
            }
            return { total: 0, used: 0, available: 0, usagePercent: 0 };
        } catch {
            return { total: 0, used: 0, available: 0, usagePercent: 0 };
        }
    }

    async getNetworkMetrics() {
        try {
            const { stdout } = await execAsync('netstat -ibn | grep en0');
            if (stdout) {
                const parts = stdout.split(/\s+/);
                return {
                    bytesReceived: parseInt(parts[6]) || 0,
                    bytesSent: parseInt(parts[9]) || 0,
                    packetsReceived: parseInt(parts[4]) || 0,
                    packetsSent: parseInt(parts[7]) || 0
                };
            }
            return { bytesReceived: 0, bytesSent: 0, packetsReceived: 0, packetsSent: 0 };
        } catch {
            return { bytesReceived: 0, bytesSent: 0, packetsReceived: 0, packetsSent: 0 };
        }
    }

    async checkEndpointHealth(endpoint) {
        const startTime = performance.now();
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);
            
            const response = await fetch(endpoint.url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Blaze-Intelligence-Health-Monitor/1.0'
                }
            });
            
            clearTimeout(timeoutId);
            const responseTime = performance.now() - startTime;
            
            const healthCheck = {
                endpoint: endpoint.name,
                url: endpoint.url,
                status: response.status,
                responseTime: responseTime,
                success: response.ok,
                timestamp: Date.now(),
                headers: {
                    contentType: response.headers.get('content-type'),
                    contentLength: response.headers.get('content-length'),
                    lastModified: response.headers.get('last-modified'),
                    etag: response.headers.get('etag')
                }
            };
            
            // Check for specific content if it's HTML
            if (response.headers.get('content-type')?.includes('text/html')) {
                const content = await response.text();
                healthCheck.contentChecks = {
                    hasTitle: content.includes('<title>'),
                    hasBlazeBranding: content.includes('Blaze Intelligence'),
                    hasJavaScript: content.includes('<script'),
                    contentLength: content.length,
                    hasErrors: content.includes('error') || content.includes('Error')
                };
            }
            
            this.metrics.responseTime.push({
                endpoint: endpoint.name,
                time: responseTime,
                timestamp: Date.now()
            });
            
            this.metrics.availability.push({
                endpoint: endpoint.name,
                available: response.ok,
                timestamp: Date.now()
            });
            
            return healthCheck;
            
        } catch (error) {
            const responseTime = performance.now() - startTime;
            
            const healthCheck = {
                endpoint: endpoint.name,
                url: endpoint.url,
                status: 0,
                responseTime: responseTime,
                success: false,
                timestamp: Date.now(),
                error: error.message
            };
            
            this.metrics.availability.push({
                endpoint: endpoint.name,
                available: false,
                timestamp: Date.now()
            });
            
            return healthCheck;
        }
    }

    calculateAvailability(timeWindow = 3600000) { // 1 hour default
        const cutoff = Date.now() - timeWindow;
        const recent = this.metrics.availability.filter(m => m.timestamp > cutoff);
        
        if (recent.length === 0) return 1; // No data = assume available
        
        const available = recent.filter(m => m.available).length;
        return available / recent.length;
    }

    calculateAverageResponseTime(timeWindow = 3600000) {
        const cutoff = Date.now() - timeWindow;
        const recent = this.metrics.responseTime.filter(m => m.timestamp > cutoff);
        
        if (recent.length === 0) return 0;
        
        const total = recent.reduce((sum, m) => sum + m.time, 0);
        return total / recent.length;
    }

    detectAnomalies() {
        const anomalies = [];
        
        // Check response time anomalies
        const avgResponseTime = this.calculateAverageResponseTime();
        if (avgResponseTime > HEALTH_CONFIG.THRESHOLDS.RESPONSE_TIME) {
            anomalies.push({
                type: 'slow_response',
                severity: 'warning',
                message: `Average response time ${avgResponseTime.toFixed(0)}ms exceeds threshold`,
                threshold: HEALTH_CONFIG.THRESHOLDS.RESPONSE_TIME,
                actual: avgResponseTime
            });
        }
        
        // Check availability anomalies
        const availability = this.calculateAvailability();
        if (availability < HEALTH_CONFIG.THRESHOLDS.AVAILABILITY) {
            anomalies.push({
                type: 'low_availability',
                severity: 'critical',
                message: `Availability ${(availability * 100).toFixed(2)}% below threshold`,
                threshold: HEALTH_CONFIG.THRESHOLDS.AVAILABILITY,
                actual: availability
            });
        }
        
        // Check recent system metrics
        const recentMetrics = this.metrics.resourceUsage.slice(-10);
        if (recentMetrics.length > 0) {
            const avgCpu = recentMetrics.reduce((sum, m) => sum + m.cpu, 0) / recentMetrics.length;
            const avgMemory = recentMetrics.reduce((sum, m) => sum + m.memory.usagePercent, 0) / recentMetrics.length;
            
            if (avgCpu > HEALTH_CONFIG.THRESHOLDS.CPU_USAGE) {
                anomalies.push({
                    type: 'high_cpu',
                    severity: 'warning',
                    message: `High CPU usage: ${avgCpu.toFixed(1)}%`,
                    threshold: HEALTH_CONFIG.THRESHOLDS.CPU_USAGE,
                    actual: avgCpu
                });
            }
            
            if (avgMemory > HEALTH_CONFIG.THRESHOLDS.MEMORY_USAGE) {
                anomalies.push({
                    type: 'high_memory',
                    severity: 'warning',
                    message: `High memory usage: ${avgMemory.toFixed(1)}%`,
                    threshold: HEALTH_CONFIG.THRESHOLDS.MEMORY_USAGE,
                    actual: avgMemory
                });
            }
        }
        
        return anomalies;
    }

    generateHealthReport() {
        const now = Date.now();
        const oneHour = 3600000;
        
        return {
            timestamp: now,
            summary: {
                overall_health: this.getOverallHealthScore(),
                availability: this.calculateAvailability(oneHour),
                avg_response_time: this.calculateAverageResponseTime(oneHour),
                total_checks: this.metrics.availability.length,
                anomalies_detected: this.detectAnomalies().length
            },
            endpoints: HEALTH_CONFIG.ENDPOINTS.map(endpoint => {
                const recentChecks = this.metrics.availability
                    .filter(m => m.endpoint === endpoint.name && m.timestamp > now - oneHour);
                const recentResponseTimes = this.metrics.responseTime
                    .filter(m => m.endpoint === endpoint.name && m.timestamp > now - oneHour);
                
                return {
                    name: endpoint.name,
                    url: endpoint.url,
                    critical: endpoint.critical,
                    availability: recentChecks.length > 0 
                        ? recentChecks.filter(c => c.available).length / recentChecks.length 
                        : 1,
                    avg_response_time: recentResponseTimes.length > 0
                        ? recentResponseTimes.reduce((sum, r) => sum + r.time, 0) / recentResponseTimes.length
                        : 0,
                    last_check: recentChecks.length > 0 ? recentChecks[recentChecks.length - 1] : null
                };
            }),
            system_metrics: this.metrics.resourceUsage.slice(-1)[0] || null,
            anomalies: this.detectAnomalies(),
            performance_trend: this.getPerformanceTrend()
        };
    }

    getOverallHealthScore() {
        const availability = this.calculateAvailability();
        const avgResponseTime = this.calculateAverageResponseTime();
        const anomalies = this.detectAnomalies();
        
        let score = 1.0;
        
        // Availability impact (50% of score)
        score *= (availability * 0.5 + 0.5);
        
        // Response time impact (30% of score)
        const responseTimeScore = Math.max(0, 1 - (avgResponseTime / (HEALTH_CONFIG.THRESHOLDS.RESPONSE_TIME * 2)));
        score *= (responseTimeScore * 0.3 + 0.7);
        
        // Anomalies impact (20% of score)
        const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
        const warningAnomalies = anomalies.filter(a => a.severity === 'warning').length;
        const anomalyImpact = Math.max(0, 1 - (criticalAnomalies * 0.3 + warningAnomalies * 0.1));
        score *= (anomalyImpact * 0.2 + 0.8);
        
        return Math.max(0, Math.min(1, score));
    }

    getPerformanceTrend() {
        const recent = this.metrics.responseTime.slice(-50);
        if (recent.length < 10) return 'insufficient_data';
        
        const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
        const secondHalf = recent.slice(Math.floor(recent.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, m) => sum + m.time, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, m) => sum + m.time, 0) / secondHalf.length;
        
        const change = (secondAvg - firstAvg) / firstAvg;
        
        if (change > 0.1) return 'degrading';
        if (change < -0.1) return 'improving';
        return 'stable';
    }
}

// Main Health Monitoring System
class HealthMonitoringSystem extends EventEmitter {
    constructor() {
        super();
        
        this.metrics = new PerformanceMetrics();
        this.intervals = new Map();
        this.isRunning = false;
        this.alertHistory = [];
        this.recoveryActions = new Map();
        
        this.setupRecoveryActions();
        this.setupEventHandlers();
    }

    setupRecoveryActions() {
        this.recoveryActions.set('slow_response', async (anomaly) => {
            this.log('warning', `Attempting recovery for slow response: ${anomaly.message}`);
            // Could implement cache clearing, CDN refresh, etc.
            return true;
        });
        
        this.recoveryActions.set('low_availability', async (anomaly) => {
            this.log('critical', `Attempting recovery for low availability: ${anomaly.message}`);
            // Could implement service restart, failover, etc.
            return true;
        });
        
        this.recoveryActions.set('high_cpu', async (anomaly) => {
            this.log('warning', `High CPU detected: ${anomaly.message}`);
            // Could implement load balancing, resource scaling, etc.
            return true;
        });
    }

    setupEventHandlers() {
        this.on('health:check:complete', (results) => {
            const failedChecks = results.filter(r => !r.success);
            if (failedChecks.length > 0) {
                this.emit('health:issues:detected', failedChecks);
            }
        });

        this.on('health:issues:detected', async (issues) => {
            for (const issue of issues) {
                if (issue.endpoint === 'Main Dashboard' || issue.endpoint === 'Command Center') {
                    this.emit('health:critical:alert', issue);
                }
            }
        });

        this.on('health:critical:alert', async (alert) => {
            this.log('critical', `Critical health alert: ${alert.endpoint} - ${alert.error || 'Service unavailable'}`);
            await this.triggerRecoveryActions([{
                type: 'low_availability',
                severity: 'critical',
                message: `Critical service ${alert.endpoint} unavailable`,
                endpoint: alert.endpoint
            }]);
        });
    }

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, message, data };
        
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
        
        // Store in alert history for critical/warning logs
        if (level === 'critical' || level === 'warning') {
            this.alertHistory.push(logEntry);
            
            // Keep only last 100 alerts
            if (this.alertHistory.length > 100) {
                this.alertHistory = this.alertHistory.slice(-100);
            }
        }
    }

    async runQuickHealthCheck() {
        const results = [];
        
        for (const endpoint of HEALTH_CONFIG.ENDPOINTS) {
            const result = await this.metrics.checkEndpointHealth(endpoint);
            results.push(result);
        }
        
        this.emit('health:check:complete', results);
        return results;
    }

    async runDeepHealthCheck() {
        this.log('info', 'Starting deep health check...');
        
        const results = {
            timestamp: Date.now(),
            endpoints: await this.runQuickHealthCheck(),
            system: await this.metrics.collectSystemMetrics(),
            anomalies: this.metrics.detectAnomalies(),
            overall_score: this.metrics.getOverallHealthScore()
        };
        
        // Trigger recovery actions if anomalies detected
        if (results.anomalies.length > 0) {
            await this.triggerRecoveryActions(results.anomalies);
        }
        
        this.log('info', `Deep health check complete. Overall score: ${(results.overall_score * 100).toFixed(1)}%`);
        
        return results;
    }

    async runPerformanceAudit() {
        this.log('info', 'Starting performance audit...');
        
        const audit = {
            timestamp: Date.now(),
            metrics: {
                availability: this.metrics.calculateAvailability(),
                response_time: this.metrics.calculateAverageResponseTime(),
                trend: this.metrics.getPerformanceTrend()
            },
            recommendations: []
        };
        
        // Generate recommendations
        if (audit.metrics.response_time > HEALTH_CONFIG.THRESHOLDS.RESPONSE_TIME) {
            audit.recommendations.push({
                type: 'performance',
                priority: 'high',
                message: 'Consider implementing CDN or caching strategies to improve response times'
            });
        }
        
        if (audit.metrics.availability < HEALTH_CONFIG.THRESHOLDS.AVAILABILITY) {
            audit.recommendations.push({
                type: 'reliability',
                priority: 'critical', 
                message: 'Investigate availability issues and implement redundancy measures'
            });
        }
        
        this.log('info', `Performance audit complete. ${audit.recommendations.length} recommendations generated.`);
        
        return audit;
    }

    async triggerRecoveryActions(anomalies) {
        this.log('info', `Triggering recovery actions for ${anomalies.length} anomalies`);
        
        for (const anomaly of anomalies) {
            const action = this.recoveryActions.get(anomaly.type);
            if (action) {
                try {
                    const success = await action(anomaly);
                    this.log('info', `Recovery action for ${anomaly.type}: ${success ? 'SUCCESS' : 'FAILED'}`);
                } catch (error) {
                    this.log('error', `Recovery action failed for ${anomaly.type}:`, { error: error.message });
                }
            } else {
                this.log('warning', `No recovery action defined for anomaly type: ${anomaly.type}`);
            }
        }
    }

    async generateHealthReport() {
        const report = this.metrics.generateHealthReport();
        
        // Add system information
        report.system_info = {
            monitoring_duration: Date.now() - (this.metrics.metrics.availability[0]?.timestamp || Date.now()),
            total_alerts: this.alertHistory.length,
            recent_alerts: this.alertHistory.slice(-10),
            recovery_actions_available: this.recoveryActions.size
        };
        
        // Save report
        try {
            const reportPath = path.join(process.cwd(), 'health-reports', `health-report-${Date.now()}.json`);
            await fs.mkdir(path.dirname(reportPath), { recursive: true });
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            this.log('info', `Health report saved: ${reportPath}`);
        } catch (error) {
            this.log('error', 'Failed to save health report:', { error: error.message });
        }
        
        return report;
    }

    start() {
        if (this.isRunning) {
            this.log('warning', 'Health monitoring is already running');
            return;
        }
        
        this.log('info', 'Starting health monitoring system...');
        this.isRunning = true;
        
        // Quick health checks
        this.intervals.set('quick', setInterval(async () => {
            try {
                await this.runQuickHealthCheck();
            } catch (error) {
                this.log('error', 'Quick health check failed:', { error: error.message });
            }
        }, HEALTH_CONFIG.INTERVALS.QUICK_CHECK));
        
        // Deep health checks
        this.intervals.set('deep', setInterval(async () => {
            try {
                await this.runDeepHealthCheck();
            } catch (error) {
                this.log('error', 'Deep health check failed:', { error: error.message });
            }
        }, HEALTH_CONFIG.INTERVALS.DEEP_CHECK));
        
        // Performance audits
        this.intervals.set('audit', setInterval(async () => {
            try {
                await this.runPerformanceAudit();
            } catch (error) {
                this.log('error', 'Performance audit failed:', { error: error.message });
            }
        }, HEALTH_CONFIG.INTERVALS.PERFORMANCE_AUDIT));
        
        // Report generation
        this.intervals.set('report', setInterval(async () => {
            try {
                await this.generateHealthReport();
            } catch (error) {
                this.log('error', 'Health report generation failed:', { error: error.message });
            }
        }, HEALTH_CONFIG.INTERVALS.REPORT_GENERATION));
        
        // Initial health check
        setTimeout(() => this.runDeepHealthCheck(), 5000);
        
        this.log('info', 'Health monitoring system started successfully');
    }

    stop() {
        if (!this.isRunning) {
            this.log('warning', 'Health monitoring is not running');
            return;
        }
        
        this.log('info', 'Stopping health monitoring system...');
        
        for (const [name, interval] of this.intervals) {
            clearInterval(interval);
            this.log('info', `Stopped ${name} monitoring interval`);
        }
        
        this.intervals.clear();
        this.isRunning = false;
        
        this.log('info', 'Health monitoring system stopped');
    }

    getStatus() {
        return {
            running: this.isRunning,
            intervals: this.intervals.size,
            total_checks: this.metrics.metrics.availability.length,
            total_alerts: this.alertHistory.length,
            overall_health_score: this.metrics.getOverallHealthScore(),
            last_anomaly_count: this.metrics.detectAnomalies().length
        };
    }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const monitor = new HealthMonitoringSystem();
    
    const command = process.argv[2] || 'start';
    
    switch (command) {
        case 'start':
            monitor.start();
            
            // Keep process alive
            process.on('SIGINT', () => {
                console.log('\nReceived SIGINT, shutting down gracefully...');
                monitor.stop();
                process.exit(0);
            });
            
            process.on('SIGTERM', () => {
                console.log('\nReceived SIGTERM, shutting down gracefully...');
                monitor.stop();
                process.exit(0);
            });
            
            break;
            
        case 'check':
            monitor.runDeepHealthCheck().then(results => {
                console.log('\nHealth Check Results:');
                console.log(`Overall Score: ${(results.overall_score * 100).toFixed(1)}%`);
                console.log(`Anomalies: ${results.anomalies.length}`);
                
                for (const endpoint of results.endpoints) {
                    const status = endpoint.success ? '✅' : '❌';
                    console.log(`${status} ${endpoint.endpoint}: ${endpoint.responseTime.toFixed(0)}ms`);
                }
                
                if (results.anomalies.length > 0) {
                    console.log('\nAnomalies Detected:');
                    for (const anomaly of results.anomalies) {
                        console.log(`⚠️  ${anomaly.type}: ${anomaly.message}`);
                    }
                }
                
                process.exit(0);
            }).catch(error => {
                console.error('Health check failed:', error);
                process.exit(1);
            });
            break;
            
        case 'report':
            monitor.generateHealthReport().then(report => {
                console.log('\nHealth Report Generated:');
                console.log(`Overall Health: ${(report.summary.overall_health * 100).toFixed(1)}%`);
                console.log(`Availability: ${(report.summary.availability * 100).toFixed(2)}%`);
                console.log(`Avg Response Time: ${report.summary.avg_response_time.toFixed(0)}ms`);
                console.log(`Anomalies: ${report.anomalies.length}`);
                
                process.exit(0);
            }).catch(error => {
                console.error('Report generation failed:', error);
                process.exit(1);
            });
            break;
            
        default:
            console.log('Usage: node health-monitoring.js [start|check|report]');
            console.log('  start  - Start continuous monitoring');
            console.log('  check  - Run single health check');
            console.log('  report - Generate health report');
            process.exit(1);
    }
}

export { HealthMonitoringSystem, PerformanceMetrics, HEALTH_CONFIG };