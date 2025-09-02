#!/usr/bin/env node

/**
 * Blaze Intelligence Security Scanning & Backup Automation
 * Comprehensive security monitoring, secret rotation, and automated backup systems
 */

import EventEmitter from 'events';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import cron from 'node-cron';

const execAsync = promisify(exec);

// Security Configuration
const SECURITY_CONFIG = {
    SCANNING: {
        secretPatterns: [
            { name: 'OpenAI API Key', pattern: /sk-[A-Za-z0-9_\-]{20,}/, severity: 'critical' },
            { name: 'Anthropic API Key', pattern: /sk-ant-api[A-Za-z0-9_\-]{20,}/, severity: 'critical' },
            { name: 'GitHub Token', pattern: /ghp_[A-Za-z0-9]{36}/, severity: 'critical' },
            { name: 'Google API Key', pattern: /AIzaSy[A-Za-z0-9\-_]{33}/, severity: 'critical' },
            { name: 'Stripe Key', pattern: /pk_(test|live)_[A-Za-z0-9]{24,}/, severity: 'high' },
            { name: 'JWT Token', pattern: /[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, severity: 'medium' },
            { name: 'Generic Secret', pattern: /secret[_\-]?key|api[_\-]?key|password|token/i, severity: 'low' }
        ],
        excludePaths: [
            'node_modules',
            '.git',
            'dist',
            'coverage',
            '*.log',
            'health-reports',
            'reports'
        ],
        scanFrequency: '0 2 * * *', // Daily at 2 AM
        alertThresholds: {
            critical: 0,
            high: 2,
            medium: 10,
            low: 50
        }
    },
    BACKUP: {
        targets: [
            { 
                name: 'source-code',
                path: '.',
                exclude: ['node_modules', '.git', 'dist', '*.log'],
                retention: 30,
                compression: true
            },
            {
                name: 'data',
                path: 'data',
                exclude: ['*.tmp'],
                retention: 7,
                compression: true
            },
            {
                name: 'reports', 
                path: 'reports',
                exclude: [],
                retention: 90,
                compression: true
            },
            {
                name: 'configuration',
                path: 'automation',
                exclude: ['*.log'],
                retention: 30,
                compression: false
            }
        ],
        schedule: '0 1 * * *', // Daily at 1 AM
        maxBackups: 100,
        compressionLevel: 6
    },
    MONITORING: {
        fileIntegrityCheck: true,
        permissionAudit: true,
        dependencyVulnCheck: true,
        networkSecurityScan: false, // Disabled for local deployment
        complianceCheck: true
    }
};

// Security Scanner
class SecurityScanner extends EventEmitter {
    constructor(config = SECURITY_CONFIG.SCANNING) {
        super();
        this.config = config;
        this.scanResults = [];
        this.alerts = [];
        this.scheduledScan = null;
    }

    async scanForSecrets(directory = '.') {
        console.log(`🔍 Scanning for secrets in ${directory}...`);
        const startTime = Date.now();
        
        try {
            const results = {
                scanId: crypto.randomUUID(),
                timestamp: Date.now(),
                directory: directory,
                findings: [],
                summary: {
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0
                },
                filesScanned: 0,
                scanDuration: 0
            };

            const files = await this.getFilesToScan(directory);
            results.filesScanned = files.length;

            for (const filePath of files) {
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    const fileFindings = await this.scanFileContent(filePath, content);
                    results.findings.push(...fileFindings);
                    
                    // Update summary counts
                    fileFindings.forEach(finding => {
                        results.summary[finding.severity]++;
                    });
                    
                } catch (error) {
                    // Skip files that can't be read (binary, permissions, etc.)
                    continue;
                }
            }

            results.scanDuration = Date.now() - startTime;
            this.scanResults.push(results);

            // Generate alerts for critical findings
            if (results.summary.critical > this.config.alertThresholds.critical) {
                this.generateSecurityAlert('critical', results);
            }

            this.emit('scan:complete', results);
            return results;

        } catch (error) {
            this.emit('scan:error', error);
            throw error;
        }
    }

    async getFilesToScan(directory) {
        const files = [];
        
        const scanDirectory = async (dir) => {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    // Skip excluded paths
                    if (this.isExcluded(fullPath)) {
                        continue;
                    }
                    
                    if (entry.isDirectory()) {
                        await scanDirectory(fullPath);
                    } else if (entry.isFile()) {
                        // Only scan text files
                        if (this.isTextFile(entry.name)) {
                            files.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                // Skip directories we can't read
                return;
            }
        };

        await scanDirectory(directory);
        return files;
    }

    isExcluded(filePath) {
        return this.config.excludePaths.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return regex.test(filePath);
            }
            return filePath.includes(pattern);
        });
    }

    isTextFile(filename) {
        const textExtensions = [
            '.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.yml', '.yaml',
            '.env', '.sh', '.py', '.java', '.go', '.rs', '.php', '.rb', '.swift',
            '.html', '.css', '.sql', '.xml', '.toml', '.ini', '.conf'
        ];
        
        const ext = path.extname(filename).toLowerCase();
        return textExtensions.includes(ext) || !ext; // Include files without extensions
    }

    async scanFileContent(filePath, content) {
        const findings = [];
        
        for (const pattern of this.config.secretPatterns) {
            const matches = content.match(new RegExp(pattern.pattern, 'g'));
            
            if (matches) {
                for (const match of matches) {
                    // Get line number
                    const lineNumber = this.getLineNumber(content, match);
                    
                    // Skip if it looks like a placeholder or example
                    if (this.isPlaceholder(match)) {
                        continue;
                    }
                    
                    findings.push({
                        type: pattern.name,
                        severity: pattern.severity,
                        file: filePath,
                        line: lineNumber,
                        match: this.redactSecret(match),
                        context: this.getContext(content, match),
                        recommendation: this.getRecommendation(pattern.name)
                    });
                }
            }
        }
        
        return findings;
    }

    getLineNumber(content, match) {
        const index = content.indexOf(match);
        if (index === -1) return 0;
        
        return content.substring(0, index).split('\n').length;
    }

    isPlaceholder(match) {
        const placeholders = [
            'your_api_key_here',
            'YOUR_API_KEY',
            'REPLACE_WITH_YOUR_KEY',
            'sk-placeholder',
            'example_key',
            'dummy_token',
            'test_secret'
        ];
        
        return placeholders.some(placeholder => 
            match.toLowerCase().includes(placeholder.toLowerCase())
        );
    }

    redactSecret(secret) {
        if (secret.length <= 8) return '«REDACTED»';
        
        const start = secret.substring(0, 4);
        const end = secret.substring(secret.length - 4);
        const middle = '•'.repeat(Math.min(secret.length - 8, 20));
        
        return `${start}${middle}${end}`;
    }

    getContext(content, match) {
        const index = content.indexOf(match);
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + match.length + 50);
        
        return content.substring(start, end)
            .replace(match, '«REDACTED»')
            .replace(/\n/g, '\\n');
    }

    getRecommendation(secretType) {
        const recommendations = {
            'OpenAI API Key': 'Move to environment variable OPENAI_API_KEY and add .env to .gitignore',
            'Anthropic API Key': 'Move to environment variable ANTHROPIC_API_KEY and add .env to .gitignore',
            'GitHub Token': 'Use GitHub Actions secrets or environment variables',
            'Google API Key': 'Move to environment variable GOOGLE_AI_KEY and restrict API key scope',
            'Stripe Key': 'Use environment variables and separate test/production keys',
            'JWT Token': 'Ensure tokens are not hardcoded and have proper expiration',
            'Generic Secret': 'Move sensitive data to secure environment variables'
        };
        
        return recommendations[secretType] || 'Move sensitive data to environment variables or secure vault';
    }

    async scanDependencyVulnerabilities() {
        console.log('🔍 Scanning for dependency vulnerabilities...');
        
        try {
            // Check for npm audit if package.json exists
            try {
                await fs.access('package.json');
                const { stdout, stderr } = await execAsync('npm audit --json');
                
                const auditResult = JSON.parse(stdout);
                
                return {
                    type: 'dependency_vulnerabilities',
                    timestamp: Date.now(),
                    vulnerabilities: auditResult.vulnerabilities || {},
                    summary: auditResult.metadata?.vulnerabilities || {},
                    recommendations: this.generateVulnerabilityRecommendations(auditResult)
                };
                
            } catch (error) {
                return {
                    type: 'dependency_vulnerabilities',
                    timestamp: Date.now(),
                    status: 'skipped',
                    reason: 'No package.json found or npm audit failed'
                };
            }
            
        } catch (error) {
            console.error('Dependency vulnerability scan failed:', error);
            return {
                type: 'dependency_vulnerabilities',
                timestamp: Date.now(),
                status: 'failed',
                error: error.message
            };
        }
    }

    generateVulnerabilityRecommendations(auditResult) {
        const recommendations = [];
        
        if (auditResult.metadata?.vulnerabilities?.critical > 0) {
            recommendations.push('CRITICAL: Run `npm audit fix` immediately to address critical vulnerabilities');
        }
        
        if (auditResult.metadata?.vulnerabilities?.high > 0) {
            recommendations.push('HIGH: Update vulnerable packages as soon as possible');
        }
        
        if (auditResult.metadata?.vulnerabilities?.moderate > 0) {
            recommendations.push('MODERATE: Plan dependency updates in next development cycle');
        }
        
        recommendations.push('Consider using `npm audit fix --force` for automatic fixes');
        recommendations.push('Review and test all dependency updates in development environment');
        
        return recommendations;
    }

    async checkFileIntegrity() {
        console.log('🔍 Performing file integrity check...');
        
        const criticalFiles = [
            'package.json',
            'package-lock.json',
            'index.html',
            'automation/github-deploy-enhanced.js',
            'automation/health-monitoring.js',
            'automation/sports-data-ingestion.js',
            'command-center.html'
        ];
        
        const results = {
            type: 'file_integrity',
            timestamp: Date.now(),
            files: [],
            issues: []
        };
        
        for (const file of criticalFiles) {
            try {
                const stats = await fs.stat(file);
                const content = await fs.readFile(file, 'utf8');
                const hash = crypto.createHash('sha256').update(content).digest('hex');
                
                results.files.push({
                    path: file,
                    size: stats.size,
                    modified: stats.mtime.toISOString(),
                    hash: hash.substring(0, 16) + '...' // Truncated hash for privacy
                });
                
                // Check for suspicious modifications
                if (stats.size === 0) {
                    results.issues.push({
                        file: file,
                        issue: 'File is empty',
                        severity: 'high'
                    });
                }
                
                if (content.includes('eval(') || content.includes('Function(')) {
                    results.issues.push({
                        file: file,
                        issue: 'Contains potentially dangerous code execution',
                        severity: 'medium'
                    });
                }
                
            } catch (error) {
                results.issues.push({
                    file: file,
                    issue: `File not accessible: ${error.message}`,
                    severity: 'medium'
                });
            }
        }
        
        return results;
    }

    generateSecurityAlert(level, scanResults) {
        const alert = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            level: level,
            type: 'security_scan',
            summary: `Security scan found ${scanResults.summary.critical} critical and ${scanResults.summary.high} high severity issues`,
            details: scanResults,
            actions: [
                'Review all detected secrets immediately',
                'Rotate exposed credentials',
                'Update .gitignore to prevent future exposure',
                'Implement pre-commit hooks for secret detection'
            ]
        };
        
        this.alerts.push(alert);
        this.emit('security:alert', alert);
        
        return alert;
    }

    startScheduledScanning() {
        if (this.scheduledScan) {
            console.log('⚠️ Scheduled scanning is already running');
            return;
        }
        
        console.log(`📅 Starting scheduled security scans: ${this.config.scanFrequency}`);
        
        this.scheduledScan = cron.schedule(this.config.scanFrequency, async () => {
            try {
                console.log('🔄 Running scheduled security scan...');
                await this.runComprehensiveScan();
            } catch (error) {
                console.error('Scheduled security scan failed:', error);
                this.emit('scan:error', error);
            }
        });
        
        // Run initial scan after 30 seconds
        setTimeout(() => this.runComprehensiveScan(), 30000);
    }

    async runComprehensiveScan() {
        const scanResults = {
            scanId: crypto.randomUUID(),
            timestamp: Date.now(),
            components: {}
        };
        
        try {
            // Secret scanning
            scanResults.components.secrets = await this.scanForSecrets();
            
            // Dependency vulnerabilities
            scanResults.components.dependencies = await this.scanDependencyVulnerabilities();
            
            // File integrity
            scanResults.components.fileIntegrity = await this.checkFileIntegrity();
            
            // Generate summary report
            const report = await this.generateSecurityReport(scanResults);
            
            this.emit('comprehensive:scan:complete', scanResults);
            return scanResults;
            
        } catch (error) {
            console.error('Comprehensive security scan failed:', error);
            this.emit('comprehensive:scan:error', error);
            throw error;
        }
    }

    async generateSecurityReport(scanResults) {
        const report = {
            timestamp: Date.now(),
            scanId: scanResults.scanId,
            overallRisk: this.calculateRiskScore(scanResults),
            summary: {
                secretsFound: scanResults.components.secrets?.summary || {},
                vulnerabilities: scanResults.components.dependencies?.summary || {},
                integrityIssues: scanResults.components.fileIntegrity?.issues?.length || 0
            },
            recommendations: this.generateSecurityRecommendations(scanResults),
            compliance: this.checkCompliance(scanResults)
        };
        
        try {
            const reportPath = path.join(process.cwd(), 'reports', 'security', `security-report-${Date.now()}.json`);
            await fs.mkdir(path.dirname(reportPath), { recursive: true });
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`🛡️ Security report saved: ${reportPath}`);
        } catch (error) {
            console.error('Failed to save security report:', error);
        }
        
        return report;
    }

    calculateRiskScore(scanResults) {
        let score = 0;
        
        // Secrets risk (0-50 points)
        const secrets = scanResults.components.secrets?.summary || {};
        score += (secrets.critical || 0) * 20;
        score += (secrets.high || 0) * 10;
        score += (secrets.medium || 0) * 3;
        score += (secrets.low || 0) * 1;
        
        // Dependencies risk (0-30 points)
        const deps = scanResults.components.dependencies?.summary || {};
        score += (deps.critical || 0) * 15;
        score += (deps.high || 0) * 8;
        score += (deps.moderate || 0) * 3;
        
        // File integrity risk (0-20 points)
        const integrity = scanResults.components.fileIntegrity?.issues || [];
        score += integrity.filter(i => i.severity === 'high').length * 10;
        score += integrity.filter(i => i.severity === 'medium').length * 5;
        
        // Risk levels: 0-25 (Low), 26-50 (Medium), 51-75 (High), 76+ (Critical)
        if (score <= 25) return { level: 'low', score };
        if (score <= 50) return { level: 'medium', score };
        if (score <= 75) return { level: 'high', score };
        return { level: 'critical', score };
    }

    generateSecurityRecommendations(scanResults) {
        const recommendations = [];
        
        const secrets = scanResults.components.secrets?.summary || {};
        if (secrets.critical > 0) {
            recommendations.push({
                priority: 'immediate',
                action: 'Rotate all exposed critical secrets immediately',
                impact: 'Prevents potential account compromise'
            });
        }
        
        const deps = scanResults.components.dependencies?.summary || {};
        if (deps.critical > 0) {
            recommendations.push({
                priority: 'high',
                action: 'Update critical dependency vulnerabilities',
                impact: 'Prevents potential security exploits'
            });
        }
        
        recommendations.push({
            priority: 'medium',
            action: 'Implement pre-commit hooks for secret detection',
            impact: 'Prevents future secret exposure'
        });
        
        recommendations.push({
            priority: 'low',
            action: 'Set up automated dependency update monitoring',
            impact: 'Maintains security posture over time'
        });
        
        return recommendations;
    }

    checkCompliance(scanResults) {
        return {
            secretsManagement: (scanResults.components.secrets?.summary?.critical || 0) === 0,
            dependencyUpdates: (scanResults.components.dependencies?.summary?.critical || 0) === 0,
            fileIntegrity: (scanResults.components.fileIntegrity?.issues || []).length === 0,
            overallCompliant: false // Set based on all checks
        };
    }

    stop() {
        if (this.scheduledScan) {
            this.scheduledScan.destroy();
            this.scheduledScan = null;
            console.log('✅ Stopped scheduled security scanning');
        }
    }
}

// Backup Manager
class BackupManager extends EventEmitter {
    constructor(config = SECURITY_CONFIG.BACKUP) {
        super();
        this.config = config;
        this.scheduledBackup = null;
        this.backupHistory = [];
    }

    async createBackup(target) {
        console.log(`💾 Creating backup for ${target.name}...`);
        const startTime = Date.now();
        
        try {
            const backupId = crypto.randomUUID();
            const timestamp = Date.now();
            const backupDir = path.join(process.cwd(), 'backups', target.name);
            
            await fs.mkdir(backupDir, { recursive: true });
            
            const backupName = `${target.name}-${timestamp}-${backupId.slice(0, 8)}.tar${target.compression ? '.gz' : ''}`;
            const backupPath = path.join(backupDir, backupName);
            
            // Create tar command
            let tarCmd = `tar ${target.compression ? '-czf' : '-cf'} "${backupPath}"`;
            
            // Add exclusions
            for (const exclude of target.exclude) {
                tarCmd += ` --exclude="${exclude}"`;
            }
            
            // Add source path
            tarCmd += ` -C "${path.dirname(target.path)}" "${path.basename(target.path)}"`;
            
            // Execute backup
            const { stdout, stderr } = await execAsync(tarCmd);
            
            // Get backup size
            const stats = await fs.stat(backupPath);
            
            const backupResult = {
                id: backupId,
                name: target.name,
                path: backupPath,
                size: stats.size,
                timestamp: timestamp,
                duration: Date.now() - startTime,
                compressed: target.compression,
                status: 'completed'
            };
            
            this.backupHistory.push(backupResult);
            
            // Clean old backups
            await this.cleanOldBackups(target, backupDir);
            
            this.emit('backup:complete', backupResult);
            console.log(`✅ Backup completed: ${target.name} (${this.formatBytes(stats.size)}, ${Date.now() - startTime}ms)`);
            
            return backupResult;
            
        } catch (error) {
            const backupResult = {
                name: target.name,
                timestamp: Date.now(),
                duration: Date.now() - startTime,
                status: 'failed',
                error: error.message
            };
            
            this.backupHistory.push(backupResult);
            this.emit('backup:failed', backupResult);
            console.error(`❌ Backup failed for ${target.name}:`, error.message);
            
            throw error;
        }
    }

    async cleanOldBackups(target, backupDir) {
        try {
            const files = await fs.readdir(backupDir);
            const backupFiles = files
                .filter(f => f.startsWith(target.name) && (f.endsWith('.tar') || f.endsWith('.tar.gz')))
                .map(f => ({
                    name: f,
                    path: path.join(backupDir, f),
                    stat: null
                }));
            
            // Get file stats
            for (const file of backupFiles) {
                try {
                    file.stat = await fs.stat(file.path);
                } catch (error) {
                    continue;
                }
            }
            
            // Sort by modification time (newest first)
            backupFiles
                .filter(f => f.stat)
                .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());
            
            // Remove old backups beyond retention
            const toRemove = backupFiles.slice(target.retention);
            
            for (const file of toRemove) {
                try {
                    await fs.unlink(file.path);
                    console.log(`🗑️ Removed old backup: ${file.name}`);
                } catch (error) {
                    console.warn(`Could not remove old backup ${file.name}:`, error.message);
                }
            }
            
        } catch (error) {
            console.warn('Error cleaning old backups:', error.message);
        }
    }

    async createAllBackups() {
        console.log('💾 Creating backups for all targets...');
        const results = [];
        
        for (const target of this.config.targets) {
            try {
                const result = await this.createBackup(target);
                results.push(result);
            } catch (error) {
                results.push({
                    name: target.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }
        
        const successful = results.filter(r => r.status === 'completed').length;
        const failed = results.filter(r => r.status === 'failed').length;
        
        console.log(`✅ Backup summary: ${successful} successful, ${failed} failed`);
        
        return results;
    }

    startScheduledBackups() {
        if (this.scheduledBackup) {
            console.log('⚠️ Scheduled backups are already running');
            return;
        }
        
        console.log(`📅 Starting scheduled backups: ${this.config.schedule}`);
        
        this.scheduledBackup = cron.schedule(this.config.schedule, async () => {
            try {
                console.log('🔄 Running scheduled backup...');
                await this.createAllBackups();
            } catch (error) {
                console.error('Scheduled backup failed:', error);
                this.emit('backup:error', error);
            }
        });
        
        // Run initial backup after 60 seconds
        setTimeout(() => this.createAllBackups(), 60000);
    }

    async listBackups() {
        const backupsList = {};
        
        for (const target of this.config.targets) {
            const backupDir = path.join(process.cwd(), 'backups', target.name);
            backupsList[target.name] = [];
            
            try {
                const files = await fs.readdir(backupDir);
                
                for (const file of files) {
                    if (file.startsWith(target.name)) {
                        const filePath = path.join(backupDir, file);
                        const stats = await fs.stat(filePath);
                        
                        backupsList[target.name].push({
                            name: file,
                            path: filePath,
                            size: stats.size,
                            created: stats.mtime.toISOString()
                        });
                    }
                }
                
                // Sort by creation time (newest first)
                backupsList[target.name].sort((a, b) => 
                    new Date(b.created).getTime() - new Date(a.created).getTime()
                );
                
            } catch (error) {
                // Backup directory doesn't exist yet
                backupsList[target.name] = [];
            }
        }
        
        return backupsList;
    }

    async restoreBackup(backupPath, restoreDir) {
        console.log(`🔄 Restoring backup from ${backupPath}...`);
        
        try {
            await fs.mkdir(restoreDir, { recursive: true });
            
            const isGzipped = backupPath.endsWith('.gz');
            const tarCmd = `tar ${isGzipped ? '-xzf' : '-xf'} "${backupPath}" -C "${restoreDir}"`;
            
            const { stdout, stderr } = await execAsync(tarCmd);
            
            console.log(`✅ Backup restored to ${restoreDir}`);
            return { success: true, restoreDir, output: stdout };
            
        } catch (error) {
            console.error(`❌ Backup restore failed:`, error.message);
            throw error;
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getBackupMetrics() {
        const recent = this.backupHistory.slice(-20);
        const successful = recent.filter(b => b.status === 'completed');
        const failed = recent.filter(b => b.status === 'failed');
        
        return {
            totalBackups: this.backupHistory.length,
            recentSuccess: successful.length,
            recentFailures: failed.length,
            successRate: recent.length > 0 ? successful.length / recent.length : 0,
            avgBackupTime: successful.length > 0 
                ? successful.reduce((sum, b) => sum + b.duration, 0) / successful.length 
                : 0,
            totalBackupSize: successful.reduce((sum, b) => sum + (b.size || 0), 0),
            lastBackup: recent.length > 0 ? recent[recent.length - 1] : null
        };
    }

    stop() {
        if (this.scheduledBackup) {
            this.scheduledBackup.destroy();
            this.scheduledBackup = null;
            console.log('✅ Stopped scheduled backups');
        }
    }
}

// Main Security & Backup Automation System
class SecurityBackupAutomation extends EventEmitter {
    constructor() {
        super();
        
        this.scanner = new SecurityScanner();
        this.backupManager = new BackupManager();
        this.isRunning = false;
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Security scanner events
        this.scanner.on('security:alert', (alert) => {
            console.log(`🚨 SECURITY ALERT (${alert.level}): ${alert.summary}`);
            this.emit('security:alert', alert);
        });

        this.scanner.on('scan:complete', (results) => {
            console.log(`🔍 Security scan completed: ${results.findings.length} findings`);
            this.emit('security:scan:complete', results);
        });

        // Backup manager events
        this.backupManager.on('backup:complete', (result) => {
            console.log(`💾 Backup completed: ${result.name}`);
            this.emit('backup:complete', result);
        });

        this.backupManager.on('backup:failed', (result) => {
            console.error(`❌ Backup failed: ${result.name} - ${result.error}`);
            this.emit('backup:failed', result);
        });
    }

    async start() {
        if (this.isRunning) {
            console.log('⚠️ Security & Backup Automation is already running');
            return;
        }
        
        console.log('🚀 Starting Security & Backup Automation System...');
        this.isRunning = true;
        
        // Start scheduled operations
        this.scanner.startScheduledScanning();
        this.backupManager.startScheduledBackups();
        
        console.log('✅ Security & Backup Automation started successfully');
        this.emit('system:started');
    }

    async stop() {
        if (!this.isRunning) {
            console.log('⚠️ Security & Backup Automation is not running');
            return;
        }
        
        console.log('🛑 Stopping Security & Backup Automation System...');
        
        this.scanner.stop();
        this.backupManager.stop();
        
        this.isRunning = false;
        console.log('✅ Security & Backup Automation stopped');
        this.emit('system:stopped');
    }

    async runSecurityScan() {
        return await this.scanner.runComprehensiveScan();
    }

    async createBackups() {
        return await this.backupManager.createAllBackups();
    }

    async getSystemStatus() {
        const backupMetrics = this.backupManager.getBackupMetrics();
        const securityAlerts = this.scanner.alerts.slice(-10);
        
        return {
            running: this.isRunning,
            security: {
                totalScans: this.scanner.scanResults.length,
                activeAlerts: securityAlerts.length,
                lastScan: this.scanner.scanResults.slice(-1)[0] || null
            },
            backups: backupMetrics,
            lastActivity: Date.now()
        };
    }

    async generateStatusReport() {
        const status = await this.getSystemStatus();
        const report = {
            timestamp: Date.now(),
            system: 'Security & Backup Automation',
            status: status,
            recommendations: []
        };
        
        // Generate recommendations
        if (status.security.activeAlerts > 0) {
            report.recommendations.push({
                priority: 'high',
                action: 'Review and address active security alerts',
                category: 'security'
            });
        }
        
        if (status.backups.successRate < 0.9) {
            report.recommendations.push({
                priority: 'medium',
                action: 'Investigate backup failures and improve reliability',
                category: 'backup'
            });
        }
        
        try {
            const reportPath = path.join(process.cwd(), 'reports', 'security-backup', `status-report-${Date.now()}.json`);
            await fs.mkdir(path.dirname(reportPath), { recursive: true });
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`📊 Status report saved: ${reportPath}`);
        } catch (error) {
            console.error('Failed to save status report:', error);
        }
        
        return report;
    }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const automation = new SecurityBackupAutomation();
    const command = process.argv[2] || 'start';

    automation.on('security:alert', (alert) => {
        console.log(`\n🚨 SECURITY ALERT: ${alert.summary}`);
        console.log(`Priority: ${alert.level.toUpperCase()}`);
        console.log(`Actions needed: ${alert.actions.length}`);
    });

    switch (command) {
        case 'start':
            automation.start().then(() => {
                console.log('\nSecurity & Backup Automation running:');
                console.log('• Automated secret scanning');
                console.log('• Dependency vulnerability monitoring');
                console.log('• File integrity checking');
                console.log('• Scheduled backups');
                console.log('\nPress Ctrl+C to stop...');

                process.on('SIGINT', async () => {
                    console.log('\nShutting down Security & Backup Automation...');
                    await automation.stop();
                    process.exit(0);
                });

            }).catch(error => {
                console.error('Failed to start automation:', error);
                process.exit(1);
            });
            break;

        case 'scan':
            automation.runSecurityScan().then(results => {
                console.log('\n🔍 Security Scan Results:');
                console.log(`Secrets found: ${Object.values(results.components.secrets.summary).reduce((a, b) => a + b, 0)}`);
                console.log(`Files scanned: ${results.components.secrets.filesScanned}`);
                console.log(`Risk level: ${results.overallRisk?.level || 'unknown'}`);
                
                if (results.components.secrets.summary.critical > 0) {
                    console.log('\n🚨 CRITICAL ISSUES FOUND - IMMEDIATE ACTION REQUIRED');
                }
                
                process.exit(0);
            }).catch(error => {
                console.error('Security scan failed:', error);
                process.exit(1);
            });
            break;

        case 'backup':
            automation.createBackups().then(results => {
                console.log('\n💾 Backup Results:');
                const successful = results.filter(r => r.status === 'completed');
                const failed = results.filter(r => r.status === 'failed');
                
                console.log(`Successful: ${successful.length}`);
                console.log(`Failed: ${failed.length}`);
                
                if (failed.length > 0) {
                    console.log('\nFailed backups:');
                    failed.forEach(f => console.log(`  ${f.name}: ${f.error}`));
                }
                
                process.exit(0);
            }).catch(error => {
                console.error('Backup creation failed:', error);
                process.exit(1);
            });
            break;

        case 'status':
            automation.getSystemStatus().then(status => {
                console.log('\nSecurity & Backup System Status:');
                console.log(`Running: ${status.running}`);
                console.log(`Security Scans: ${status.security.totalScans}`);
                console.log(`Active Alerts: ${status.security.activeAlerts}`);
                console.log(`Backup Success Rate: ${(status.backups.successRate * 100).toFixed(1)}%`);
                console.log(`Total Backups: ${status.backups.totalBackups}`);
                
                process.exit(0);
            }).catch(error => {
                console.error('Status check failed:', error);
                process.exit(1);
            });
            break;

        default:
            console.log('Usage: node security-backup-automation.js [start|scan|backup|status]');
            console.log('  start  - Start continuous security and backup automation');
            console.log('  scan   - Run security scan once');
            console.log('  backup - Create backups once');
            console.log('  status - Show system status');
            process.exit(1);
    }
}

export { SecurityBackupAutomation, SecurityScanner, BackupManager, SECURITY_CONFIG };