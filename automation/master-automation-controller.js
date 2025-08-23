#!/usr/bin/env node

/**
 * Blaze Intelligence Master Automation Controller
 * Orchestrates all automation systems: Command Center, GitHub Deployment, Health Monitoring,
 * Sports Data Ingestion, AI Workflow Orchestration, Report Generation, and Security & Backup
 */

import EventEmitter from 'events';
import fs from 'fs/promises';
import path from 'path';
import { GitHubDeploymentAutomation } from './github-deploy-enhanced.js';
import { HealthMonitoringSystem } from './health-monitoring.js';
import { SportsDataIngestionSystem } from './sports-data-ingestion.js';
import { AIOrchestratorDeploymentManager } from './ai-orchestrator-deploy.js';
import { ReportPipelineDeploymentManager } from './report-pipeline-deploy.js';
import { SecurityBackupAutomation } from './security-backup-automation.js';

// Master Automation Configuration
const AUTOMATION_CONFIG = {
    SYSTEMS: {
        'github-deployment': {
            name: 'GitHub Deployment Automation',
            enabled: true,
            critical: true,
            startupDelay: 0
        },
        'health-monitoring': {
            name: 'Health Monitoring System',
            enabled: true,
            critical: true,
            startupDelay: 5000
        },
        'sports-ingestion': {
            name: 'Sports Data Ingestion',
            enabled: true,
            critical: false,
            startupDelay: 10000
        },
        'ai-orchestrator': {
            name: 'AI Workflow Orchestrator',
            enabled: true,
            critical: false,
            startupDelay: 15000
        },
        'report-pipeline': {
            name: 'Report Generation Pipeline',
            enabled: true,
            critical: false,
            startupDelay: 20000
        },
        'security-backup': {
            name: 'Security & Backup Automation',
            enabled: true,
            critical: true,
            startupDelay: 25000
        }
    },
    MONITORING: {
        healthCheckInterval: 60000,    // 1 minute
        statusUpdateInterval: 300000,  // 5 minutes
        alertThresholds: {
            systemFailures: 2,
            responseTime: 10000,
            errorRate: 0.05
        }
    },
    RECOVERY: {
        autoRestartEnabled: true,
        maxRestartAttempts: 3,
        restartDelay: 30000,
        escalationEnabled: true
    }
};

// Command Center Integration
class CommandCenterHub extends EventEmitter {
    constructor() {
        super();
        this.systems = new Map();
        this.metrics = {
            totalEvents: 0,
            systemUpdates: 0,
            alerts: 0,
            startTime: Date.now()
        };
    }

    registerSystem(systemId, system) {
        this.systems.set(systemId, {
            instance: system,
            status: 'registered',
            lastUpdate: Date.now(),
            metrics: {
                events: 0,
                errors: 0,
                uptime: 0
            }
        });

        // Set up event forwarding
        system.on('*', (event, data) => {
            this.handleSystemEvent(systemId, event, data);
        });

        console.log(`🔗 Registered system: ${systemId}`);
    }

    handleSystemEvent(systemId, event, data) {
        this.metrics.totalEvents++;
        
        const system = this.systems.get(systemId);
        if (system) {
            system.metrics.events++;
            system.lastUpdate = Date.now();
        }

        // Broadcast to command center UI
        this.emit('system:event', {
            systemId,
            event,
            data,
            timestamp: Date.now()
        });

        // Handle specific event types
        switch (event) {
            case 'deployment:complete':
            case 'health:check:complete':
            case 'ingestion:complete':
            case 'workflow:completed':
            case 'report:completed':
            case 'backup:complete':
                this.emit('system:success', { systemId, event, data });
                break;
                
            case 'deployment:failed':
            case 'health:critical:alert':
            case 'security:alert':
            case 'workflow:error':
            case 'report:failed':
                this.handleSystemAlert(systemId, event, data);
                break;
        }
    }

    handleSystemAlert(systemId, event, data) {
        this.metrics.alerts++;
        
        const alert = {
            id: `${systemId}-${Date.now()}`,
            systemId,
            event,
            data,
            timestamp: Date.now(),
            severity: this.determineSeverity(event, data),
            acknowledged: false
        };

        console.log(`🚨 SYSTEM ALERT [${alert.severity}]: ${systemId} - ${event}`);
        this.emit('command:alert', alert);
    }

    determineSeverity(event, data) {
        if (event.includes('critical') || event.includes('failed')) return 'critical';
        if (event.includes('error') || event.includes('alert')) return 'high';
        if (event.includes('warning')) return 'medium';
        return 'low';
    }

    getSystemsStatus() {
        const status = {};
        
        for (const [systemId, system] of this.systems) {
            status[systemId] = {
                status: system.status,
                lastUpdate: system.lastUpdate,
                uptime: Date.now() - (system.startTime || Date.now()),
                events: system.metrics.events,
                errors: system.metrics.errors,
                responsive: (Date.now() - system.lastUpdate) < 300000 // 5 minutes
            };
        }
        
        return status;
    }

    getOverallHealth() {
        const systems = Array.from(this.systems.values());
        const total = systems.length;
        const healthy = systems.filter(s => 
            s.status === 'running' && 
            (Date.now() - s.lastUpdate) < 300000
        ).length;
        
        return {
            overall: healthy / total,
            healthy: healthy,
            total: total,
            criticalSystemsOk: this.checkCriticalSystems()
        };
    }

    checkCriticalSystems() {
        for (const [systemId, config] of Object.entries(AUTOMATION_CONFIG.SYSTEMS)) {
            if (config.critical) {
                const system = this.systems.get(systemId);
                if (!system || system.status !== 'running') {
                    return false;
                }
            }
        }
        return true;
    }
}

// Master Automation Controller
class MasterAutomationController extends EventEmitter {
    constructor() {
        super();
        
        this.commandCenter = new CommandCenterHub();
        this.automationSystems = new Map();
        this.isRunning = false;
        this.startupSequence = [];
        this.healthMonitor = null;
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.commandCenter.on('command:alert', (alert) => {
            console.log(`🚨 Command Center Alert: ${alert.systemId} - ${alert.event}`);
            this.handleSystemAlert(alert);
        });

        this.commandCenter.on('system:success', (event) => {
            console.log(`✅ System Success: ${event.systemId} - ${event.event}`);
        });

        // Process termination handlers
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            this.emergencyShutdown();
        });
    }

    async initializeSystems() {
        console.log('🚀 Initializing Blaze Intelligence Automation Systems...');

        // Initialize systems but don't start them yet
        const systemInitializers = {
            'github-deployment': () => new GitHubDeploymentAutomation(),
            'health-monitoring': () => new HealthMonitoringSystem(),
            'sports-ingestion': () => new SportsDataIngestionSystem(),
            'ai-orchestrator': () => new AIOrchestratorDeploymentManager(),
            'report-pipeline': () => new ReportPipelineDeploymentManager(),
            'security-backup': () => new SecurityBackupAutomation()
        };

        for (const [systemId, config] of Object.entries(AUTOMATION_CONFIG.SYSTEMS)) {
            if (!config.enabled) {
                console.log(`⏭️ Skipping disabled system: ${config.name}`);
                continue;
            }

            try {
                const initializer = systemInitializers[systemId];
                if (!initializer) {
                    throw new Error(`No initializer found for system: ${systemId}`);
                }

                const system = initializer();
                this.automationSystems.set(systemId, {
                    instance: system,
                    config: config,
                    status: 'initialized',
                    startTime: null,
                    restartCount: 0
                });

                // Register with command center
                this.commandCenter.registerSystem(systemId, system);

                this.startupSequence.push({
                    systemId,
                    delay: config.startupDelay,
                    critical: config.critical
                });

                console.log(`✅ Initialized: ${config.name}`);

            } catch (error) {
                console.error(`❌ Failed to initialize ${config.name}:`, error.message);
                
                if (config.critical) {
                    throw new Error(`Critical system initialization failed: ${config.name}`);
                }
            }
        }

        // Sort startup sequence by delay
        this.startupSequence.sort((a, b) => a.delay - b.delay);
        console.log(`📋 Startup sequence prepared: ${this.startupSequence.length} systems`);
    }

    async start() {
        if (this.isRunning) {
            console.log('⚠️ Master Automation Controller is already running');
            return;
        }

        console.log('🚀 Starting Blaze Intelligence Master Automation Controller...');
        
        try {
            // Initialize all systems first
            await this.initializeSystems();

            // Start systems in sequence
            await this.executeStartupSequence();

            // Start health monitoring
            this.startHealthMonitoring();

            this.isRunning = true;
            console.log('🎉 ALL SYSTEMS OPERATIONAL - Blaze Intelligence Automation Active!');
            
            this.emit('controller:started', {
                timestamp: Date.now(),
                systems: this.startupSequence.length,
                health: this.commandCenter.getOverallHealth()
            });

            // Generate startup report
            await this.generateStartupReport();

        } catch (error) {
            console.error('❌ Master Controller startup failed:', error);
            await this.emergencyShutdown();
            throw error;
        }
    }

    async executeStartupSequence() {
        console.log('🔄 Executing system startup sequence...');

        for (const step of this.startupSequence) {
            if (step.delay > 0) {
                console.log(`⏳ Waiting ${step.delay}ms before starting ${step.systemId}...`);
                await new Promise(resolve => setTimeout(resolve, step.delay));
            }

            try {
                await this.startSystem(step.systemId);
            } catch (error) {
                console.error(`❌ Failed to start ${step.systemId}:`, error.message);
                
                if (step.critical) {
                    throw new Error(`Critical system startup failed: ${step.systemId}`);
                }
            }
        }

        console.log('✅ Startup sequence completed');
    }

    async startSystem(systemId) {
        const systemData = this.automationSystems.get(systemId);
        if (!systemData) {
            throw new Error(`System not found: ${systemId}`);
        }

        console.log(`🚀 Starting ${systemData.config.name}...`);
        
        try {
            const { instance } = systemData;
            
            // Different start methods for different system types
            if (typeof instance.start === 'function') {
                await instance.start();
            } else if (typeof instance.deploy === 'function') {
                await instance.deploy();
            } else {
                console.log(`⚠️ System ${systemId} has no start method - assuming auto-start`);
            }

            systemData.status = 'running';
            systemData.startTime = Date.now();
            
            console.log(`✅ Started: ${systemData.config.name}`);

        } catch (error) {
            systemData.status = 'failed';
            console.error(`❌ Failed to start ${systemData.config.name}:`, error.message);
            throw error;
        }
    }

    startHealthMonitoring() {
        console.log('💓 Starting master health monitoring...');
        
        this.healthMonitor = setInterval(async () => {
            try {
                await this.performHealthCheck();
            } catch (error) {
                console.error('Health monitoring error:', error);
            }
        }, AUTOMATION_CONFIG.MONITORING.healthCheckInterval);
    }

    async performHealthCheck() {
        const health = this.commandCenter.getOverallHealth();
        
        // Check for system failures
        if (!health.criticalSystemsOk) {
            console.log('🚨 Critical systems failure detected');
            this.emit('health:critical', health);
            
            if (AUTOMATION_CONFIG.RECOVERY.autoRestartEnabled) {
                await this.attemptSystemRecovery();
            }
        }
        
        // Emit health status
        this.emit('health:update', health);
    }

    async attemptSystemRecovery() {
        console.log('🔧 Attempting automatic system recovery...');
        
        for (const [systemId, systemData] of this.automationSystems) {
            if (systemData.status === 'failed' && systemData.config.critical) {
                if (systemData.restartCount < AUTOMATION_CONFIG.RECOVERY.maxRestartAttempts) {
                    console.log(`🔄 Restarting failed system: ${systemId}`);
                    
                    try {
                        await this.startSystem(systemId);
                        systemData.restartCount++;
                        console.log(`✅ Successfully restarted: ${systemId}`);
                    } catch (error) {
                        console.error(`❌ Failed to restart ${systemId}:`, error.message);
                        systemData.restartCount++;
                    }
                }
            }
        }
    }

    handleSystemAlert(alert) {
        // Implement alert handling logic
        if (alert.severity === 'critical') {
            console.log(`🚨 CRITICAL ALERT: ${alert.systemId} - ${alert.event}`);
            
            // Could implement:
            // - Slack/email notifications
            // - Automated recovery actions
            // - System isolation
            // - Escalation procedures
        }
    }

    async stop() {
        if (!this.isRunning) {
            console.log('⚠️ Master Automation Controller is not running');
            return;
        }

        console.log('🛑 Stopping Blaze Intelligence Master Automation Controller...');
        
        // Stop health monitoring
        if (this.healthMonitor) {
            clearInterval(this.healthMonitor);
            this.healthMonitor = null;
        }

        // Stop all systems in reverse order
        const shutdownSequence = [...this.startupSequence].reverse();
        
        for (const step of shutdownSequence) {
            try {
                await this.stopSystem(step.systemId);
            } catch (error) {
                console.error(`Error stopping ${step.systemId}:`, error.message);
            }
        }

        this.isRunning = false;
        console.log('✅ Master Automation Controller stopped');
        
        this.emit('controller:stopped', {
            timestamp: Date.now(),
            graceful: true
        });
    }

    async stopSystem(systemId) {
        const systemData = this.automationSystems.get(systemId);
        if (!systemData || systemData.status !== 'running') {
            return;
        }

        console.log(`🛑 Stopping ${systemData.config.name}...`);
        
        try {
            const { instance } = systemData;
            
            // Different stop methods for different system types
            if (typeof instance.stop === 'function') {
                await instance.stop();
            } else if (typeof instance.undeploy === 'function') {
                await instance.undeploy();
            }

            systemData.status = 'stopped';
            console.log(`✅ Stopped: ${systemData.config.name}`);

        } catch (error) {
            console.error(`❌ Error stopping ${systemData.config.name}:`, error.message);
            systemData.status = 'error';
        }
    }

    async gracefulShutdown(signal) {
        console.log(`\n🛑 Received ${signal}, initiating graceful shutdown...`);
        
        try {
            await this.stop();
            process.exit(0);
        } catch (error) {
            console.error('Graceful shutdown failed:', error);
            await this.emergencyShutdown();
        }
    }

    async emergencyShutdown() {
        console.log('🚨 Emergency shutdown initiated...');
        
        // Force stop all systems
        for (const [systemId, systemData] of this.automationSystems) {
            try {
                if (systemData.instance && typeof systemData.instance.stop === 'function') {
                    systemData.instance.stop();
                }
            } catch (error) {
                // Ignore errors during emergency shutdown
            }
        }
        
        process.exit(1);
    }

    async generateStartupReport() {
        const report = {
            timestamp: Date.now(),
            controller: 'Master Automation Controller',
            status: 'operational',
            systems: {},
            health: this.commandCenter.getOverallHealth(),
            metrics: this.commandCenter.metrics
        };

        // Collect system status
        for (const [systemId, systemData] of this.automationSystems) {
            report.systems[systemId] = {
                name: systemData.config.name,
                status: systemData.status,
                critical: systemData.config.critical,
                startTime: systemData.startTime,
                restartCount: systemData.restartCount
            };
        }

        try {
            const reportPath = path.join(process.cwd(), 'reports', 'automation', `startup-report-${Date.now()}.json`);
            await fs.mkdir(path.dirname(reportPath), { recursive: true });
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`📊 Startup report saved: ${reportPath}`);
        } catch (error) {
            console.error('Failed to save startup report:', error);
        }

        return report;
    }

    getSystemStatus() {
        return {
            running: this.isRunning,
            systems: Object.fromEntries(
                Array.from(this.automationSystems.entries()).map(([id, data]) => [
                    id,
                    {
                        name: data.config.name,
                        status: data.status,
                        uptime: data.startTime ? Date.now() - data.startTime : 0,
                        critical: data.config.critical,
                        restarts: data.restartCount
                    }
                ])
            ),
            health: this.commandCenter.getOverallHealth(),
            metrics: this.commandCenter.metrics
        };
    }

    // Manual control methods
    async restartSystem(systemId) {
        console.log(`🔄 Manually restarting system: ${systemId}`);
        
        try {
            await this.stopSystem(systemId);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            await this.startSystem(systemId);
            
            console.log(`✅ Successfully restarted: ${systemId}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to restart ${systemId}:`, error.message);
            return false;
        }
    }

    async pauseSystem(systemId) {
        await this.stopSystem(systemId);
    }

    async resumeSystem(systemId) {
        await this.startSystem(systemId);
    }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const controller = new MasterAutomationController();
    const command = process.argv[2] || 'start';

    // Event handlers for CLI
    controller.on('controller:started', (data) => {
        console.log(`\n🎉 BLAZE INTELLIGENCE AUTOMATION ONLINE`);
        console.log(`Systems: ${data.systems}`);
        console.log(`Health: ${(data.health.overall * 100).toFixed(1)}%`);
        console.log(`\n🌐 Access Command Center: http://localhost:3000/command-center.html`);
        console.log(`📊 System Status: ${Object.keys(controller.getSystemStatus().systems).join(', ')}`);
    });

    controller.on('health:critical', (health) => {
        console.log(`\n🚨 CRITICAL HEALTH ALERT`);
        console.log(`Healthy Systems: ${health.healthy}/${health.total}`);
        console.log(`Critical Systems OK: ${health.criticalSystemsOk}`);
    });

    switch (command) {
        case 'start':
            controller.start().then(() => {
                console.log('\n⚡ All systems operational. Press Ctrl+C to stop.');
            }).catch(error => {
                console.error('❌ Controller startup failed:', error);
                process.exit(1);
            });
            break;

        case 'status':
            const status = controller.getSystemStatus();
            console.log('\nBlaze Intelligence Automation Status:');
            console.log(`Running: ${status.running}`);
            console.log(`Health: ${(status.health.overall * 100).toFixed(1)}%`);
            console.log(`\nSystems:`);
            
            for (const [id, system] of Object.entries(status.systems)) {
                const uptime = system.uptime ? `${Math.floor(system.uptime / 60000)}m` : '0m';
                const critical = system.critical ? '🔴' : '🔵';
                console.log(`  ${critical} ${system.name}: ${system.status} (${uptime})`);
            }
            
            process.exit(0);
            break;

        case 'restart':
            const systemId = process.argv[3];
            if (!systemId) {
                console.log('Usage: node master-automation-controller.js restart <system-id>');
                console.log('Available systems: github-deployment, health-monitoring, sports-ingestion, ai-orchestrator, report-pipeline, security-backup');
                process.exit(1);
            }
            
            controller.initializeSystems().then(async () => {
                const success = await controller.restartSystem(systemId);
                process.exit(success ? 0 : 1);
            }).catch(error => {
                console.error('Restart failed:', error);
                process.exit(1);
            });
            break;

        default:
            console.log('Blaze Intelligence Master Automation Controller');
            console.log('');
            console.log('Usage: node master-automation-controller.js [command]');
            console.log('');
            console.log('Commands:');
            console.log('  start                    Start all automation systems');
            console.log('  status                   Show system status');
            console.log('  restart <system-id>      Restart specific system');
            console.log('');
            console.log('Systems:');
            console.log('  github-deployment        GitHub deployment automation');
            console.log('  health-monitoring         Health monitoring system');
            console.log('  sports-ingestion         Sports data ingestion');
            console.log('  ai-orchestrator          AI workflow orchestrator');
            console.log('  report-pipeline          Report generation pipeline');
            console.log('  security-backup          Security scanning & backup');
            console.log('');
            process.exit(1);
    }
}

export { MasterAutomationController, CommandCenterHub, AUTOMATION_CONFIG };