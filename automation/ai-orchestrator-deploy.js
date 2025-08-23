#!/usr/bin/env node

/**
 * Blaze Intelligence AI Workflow Orchestrator Deployment
 * Integrates the existing AI orchestrator with command center automation
 */

import EventEmitter from 'events';
import fs from 'fs/promises';
import path from 'path';
import { AIWorkflowOrchestrator } from '../Code/Integrations/ai-workflow-orchestrator.js';

// Enhanced AI Orchestrator with Command Center Integration
class EnhancedAIOrchestrator extends AIWorkflowOrchestrator {
    constructor(config) {
        super(config);
        
        this.commandCenter = null;
        this.automationIntegrations = new Map();
        this.workflowMetrics = {
            totalWorkflows: 0,
            successfulWorkflows: 0,
            failedWorkflows: 0,
            avgExecutionTime: 0,
            modelUtilization: {
                'CLAUDE_OPUS_4': { tasks: 0, totalTime: 0 },
                'CHATGPT_5_PRO': { tasks: 0, totalTime: 0 },
                'GEMINI_2_5_PRO': { tasks: 0, totalTime: 0 }
            }
        };
        
        this.setupCommandCenterIntegration();
        this.registerAutomationWorkflows();
    }

    setupCommandCenterIntegration() {
        // Enhanced event handlers for command center
        this.on('workflow:started', (workflow) => {
            this.workflowMetrics.totalWorkflows++;
            this.broadcastToCommandCenter('workflow:update', {
                type: 'started',
                workflow: {
                    id: workflow.id,
                    name: workflow.name,
                    timestamp: Date.now()
                }
            });
        });

        this.on('workflow:completed', (workflow) => {
            this.workflowMetrics.successfulWorkflows++;
            this.updateExecutionMetrics(workflow);
            this.broadcastToCommandCenter('workflow:update', {
                type: 'completed',
                workflow: {
                    id: workflow.id,
                    name: workflow.name,
                    duration: workflow.totalTime,
                    cost: workflow.metadata.totalCost,
                    models: Array.from(workflow.metadata.modelsUsed)
                }
            });
        });

        this.on('workflow:error', (workflow, error) => {
            this.workflowMetrics.failedWorkflows++;
            this.broadcastToCommandCenter('workflow:update', {
                type: 'failed',
                workflow: {
                    id: workflow.id,
                    name: workflow.name,
                    error: error.message
                }
            });
        });

        this.on('task:routed', (task, assignment) => {
            this.workflowMetrics.modelUtilization[assignment.primary].tasks++;
            this.broadcastToCommandCenter('task:routed', {
                task: task.description,
                model: assignment.primary,
                confidence: assignment.confidence
            });
        });
    }

    registerAutomationWorkflows() {
        // Register specialized workflows for automation systems
        this.automationWorkflows = {
            'health-analysis': this.createHealthAnalysisWorkflow.bind(this),
            'data-quality-check': this.createDataQualityWorkflow.bind(this),
            'performance-optimization': this.createPerformanceOptimizationWorkflow.bind(this),
            'security-audit': this.createSecurityAuditWorkflow.bind(this),
            'deployment-validation': this.createDeploymentValidationWorkflow.bind(this),
            'sports-insight-generation': this.createSportsInsightWorkflow.bind(this)
        };
    }

    // Specialized Automation Workflows

    async createHealthAnalysisWorkflow(healthData) {
        return {
            name: 'System Health Analysis',
            description: 'Analyze system health metrics and provide recommendations',
            context: { healthData },
            tasks: [
                {
                    description: 'Analyze system performance metrics',
                    prompt: `Analyze these system health metrics and identify any performance issues or anomalies:

${JSON.stringify(healthData, null, 2)}

Focus on:
1. Response time trends
2. Error rate patterns
3. Resource utilization
4. Availability metrics
5. Performance bottlenecks

Provide specific, actionable insights.`,
                    systemPrompt: 'You are an expert system performance analyst. Provide precise, technical analysis with specific recommendations.',
                    hints: { requiresDepth: true },
                    outputKey: 'healthAnalysis'
                },
                {
                    description: 'Generate automated recovery recommendations',
                    prompt: `Based on this health analysis: {{healthAnalysis}}

Generate specific automated recovery actions that the system can implement:
1. Immediate actions (< 5 minutes)
2. Short-term optimizations (< 1 hour)
3. Long-term improvements (< 24 hours)

Each recommendation should include:
- Specific action steps
- Expected impact
- Risk assessment
- Success metrics`,
                    systemPrompt: 'You are an expert DevOps engineer specializing in automated recovery and system optimization.',
                    requiresValidation: true
                }
            ]
        };
    }

    async createDataQualityWorkflow(dataMetrics) {
        return {
            name: 'Data Quality Assessment',
            description: 'Evaluate ingested data quality and completeness',
            context: { dataMetrics },
            tasks: [
                {
                    description: 'Assess data quality and completeness',
                    prompt: `Evaluate the quality of this sports data ingestion:

${JSON.stringify(dataMetrics, null, 2)}

Analyze:
1. Data completeness across all sports
2. Data freshness and update frequency
3. Error rates by data source
4. Missing or inconsistent data patterns
5. Priority team data coverage

Provide a quality score (0-100) and detailed assessment.`,
                    systemPrompt: 'You are a data quality expert specializing in sports analytics data validation.',
                    hints: { largeData: true },
                    outputKey: 'qualityAssessment'
                },
                {
                    description: 'Recommend data improvement actions',
                    prompt: `Based on this quality assessment: {{qualityAssessment}}

Recommend specific actions to improve data quality:
1. Immediate fixes for critical issues
2. Process improvements for data validation
3. Enhanced monitoring and alerting
4. Data source optimization strategies

Prioritize recommendations by impact and feasibility.`,
                    systemPrompt: 'You are a data engineering expert focused on automated data quality improvement.',
                    requiresValidation: true
                }
            ]
        };
    }

    async createPerformanceOptimizationWorkflow(performanceData) {
        return {
            name: 'Performance Optimization Analysis',
            description: 'Analyze performance metrics and generate optimization strategies',
            context: { performanceData },
            tasks: [
                {
                    description: 'Analyze performance bottlenecks',
                    prompt: `Analyze these performance metrics for optimization opportunities:

${JSON.stringify(performanceData, null, 2)}

Identify:
1. CPU, memory, and I/O bottlenecks
2. Network latency issues
3. Database query performance
4. Frontend rendering optimization
5. CDN and caching opportunities

Provide technical analysis with specific metrics.`,
                    systemPrompt: 'You are a senior performance engineer with expertise in web application optimization.',
                    hints: { requiresDepth: true },
                    outputKey: 'performanceAnalysis'
                },
                {
                    description: 'Generate optimization implementation plan',
                    prompt: `Based on this performance analysis: {{performanceAnalysis}}

Create a detailed optimization implementation plan:

1. Quick wins (< 1 hour implementation)
   - Specific code changes
   - Configuration optimizations
   - Cache tuning

2. Medium-term optimizations (< 1 week)
   - Database optimizations
   - Frontend improvements
   - Infrastructure scaling

3. Long-term strategic improvements
   - Architecture changes
   - Technology upgrades
   - Monitoring enhancements

For each optimization, provide:
- Implementation steps
- Expected performance gain
- Resource requirements
- Success metrics`,
                    systemPrompt: 'You are an expert solution architect specializing in performance optimization implementation.',
                    requiresValidation: true
                }
            ]
        };
    }

    async createSecurityAuditWorkflow(securityData) {
        return {
            name: 'Security Audit Analysis',
            description: 'Comprehensive security assessment and hardening recommendations',
            context: { securityData },
            tasks: [
                {
                    description: 'Analyze security scan results',
                    prompt: `Analyze these security scan results and identify vulnerabilities:

${JSON.stringify(securityData, null, 2)}

Focus on:
1. Critical vulnerabilities requiring immediate attention
2. Misconfigurations and security weaknesses
3. Dependency vulnerabilities
4. Access control issues
5. Data protection compliance gaps

Prioritize by severity and exploitability.`,
                    systemPrompt: 'You are a cybersecurity expert specializing in web application security and vulnerability assessment.',
                    hints: { requiresDepth: true },
                    outputKey: 'securityAnalysis'
                },
                {
                    description: 'Create security hardening plan',
                    prompt: `Based on this security analysis: {{securityAnalysis}}

Create a comprehensive security hardening plan:

1. Critical fixes (implement immediately)
2. High-priority improvements (within 24 hours)
3. Medium-priority enhancements (within 1 week)
4. Long-term security strategy

For each item, provide:
- Specific remediation steps
- Impact on operations
- Testing requirements
- Compliance considerations

Include automated security monitoring recommendations.`,
                    systemPrompt: 'You are a security architect focused on implementing robust security controls and automated defense systems.',
                    requiresValidation: true
                }
            ]
        };
    }

    async createDeploymentValidationWorkflow(deploymentData) {
        return {
            name: 'Deployment Validation',
            description: 'Validate deployment success and system integration',
            context: { deploymentData },
            tasks: [
                {
                    description: 'Validate deployment completeness',
                    prompt: `Validate this deployment and identify any issues:

${JSON.stringify(deploymentData, null, 2)}

Check:
1. All services deployed successfully
2. Database migrations completed
3. Configuration consistency
4. Feature availability
5. Integration points functioning
6. Performance baseline maintained

Provide a deployment health score and detailed validation report.`,
                    systemPrompt: 'You are a senior DevOps engineer specializing in deployment validation and system integration.',
                    outputKey: 'deploymentValidation'
                },
                {
                    description: 'Generate post-deployment monitoring plan',
                    prompt: `Based on this deployment validation: {{deploymentValidation}}

Create a comprehensive post-deployment monitoring plan:

1. Critical metrics to monitor (first 24 hours)
2. Automated health checks to implement
3. Rollback triggers and procedures
4. Performance benchmarks to track
5. User experience validation steps

Include specific monitoring thresholds and alert conditions.`,
                    systemPrompt: 'You are an expert site reliability engineer focused on deployment monitoring and automated recovery.',
                    requiresValidation: true
                }
            ]
        };
    }

    async createSportsInsightWorkflow(sportsData) {
        return {
            name: 'Sports Intelligence Analysis',
            description: 'Generate actionable sports insights from ingested data',
            context: { sportsData },
            tasks: [
                {
                    description: 'Analyze sports performance data',
                    prompt: `Analyze this sports data to identify key insights and patterns:

${JSON.stringify(sportsData, null, 2)}

Focus on:
1. Cardinals performance trends and championship probability
2. Key player performance indicators
3. Team strength/weakness analysis
4. Competitive positioning
5. Predictive indicators for future games

Provide data-driven insights with specific metrics and probabilities.`,
                    systemPrompt: 'You are an expert sports analyst with deep knowledge of baseball analytics and championship probability modeling.',
                    hints: { requiresDepth: true, sport: 'baseball' },
                    outputKey: 'sportsAnalysis'
                },
                {
                    description: 'Generate strategic recommendations',
                    prompt: `Based on this sports analysis: {{sportsAnalysis}}

Generate strategic recommendations for:

1. Cardinals optimization opportunities
   - Player development focus areas
   - Tactical adjustments
   - Resource allocation priorities

2. Market positioning insights
   - Competitive advantages
   - Value propositions
   - Client targeting strategies

3. Blaze Intelligence product improvements
   - Feature enhancements based on data insights
   - New analysis capabilities
   - Client deliverable improvements

Provide actionable, data-driven recommendations.`,
                    systemPrompt: 'You are a strategic sports business consultant specializing in data-driven decision making and competitive intelligence.',
                    requiresValidation: true
                }
            ]
        };
    }

    // Integration Methods

    connectCommandCenter(commandCenter) {
        this.commandCenter = commandCenter;
        console.log('🔗 AI Orchestrator connected to Command Center');
    }

    broadcastToCommandCenter(event, data) {
        if (this.commandCenter) {
            this.commandCenter.emit(event, data);
        }
    }

    updateExecutionMetrics(workflow) {
        this.workflowMetrics.avgExecutionTime = 
            (this.workflowMetrics.avgExecutionTime * (this.workflowMetrics.successfulWorkflows - 1) + workflow.totalTime) 
            / this.workflowMetrics.successfulWorkflows;

        // Update model utilization
        for (const model of workflow.metadata.modelsUsed) {
            if (this.workflowMetrics.modelUtilization[model]) {
                this.workflowMetrics.modelUtilization[model].totalTime += workflow.totalTime;
            }
        }
    }

    // Automation Integration API

    async runAutomationWorkflow(workflowType, data) {
        const workflowCreator = this.automationWorkflows[workflowType];
        if (!workflowCreator) {
            throw new Error(`Unknown automation workflow type: ${workflowType}`);
        }

        const workflowDefinition = await workflowCreator(data);
        return await this.executeWorkflow(workflowDefinition);
    }

    async processHealthData(healthData) {
        return await this.runAutomationWorkflow('health-analysis', healthData);
    }

    async validateDataQuality(dataMetrics) {
        return await this.runAutomationWorkflow('data-quality-check', dataMetrics);
    }

    async optimizePerformance(performanceData) {
        return await this.runAutomationWorkflow('performance-optimization', performanceData);
    }

    async auditSecurity(securityData) {
        return await this.runAutomationWorkflow('security-audit', securityData);
    }

    async validateDeployment(deploymentData) {
        return await this.runAutomationWorkflow('deployment-validation', deploymentData);
    }

    async generateSportsInsights(sportsData) {
        return await this.runAutomationWorkflow('sports-insight-generation', sportsData);
    }

    // Enhanced Metrics and Monitoring

    getEnhancedMetrics() {
        const baseMetrics = this.getSystemMetrics();
        
        return {
            ...baseMetrics,
            automation: {
                ...this.workflowMetrics,
                successRate: this.workflowMetrics.totalWorkflows > 0 
                    ? this.workflowMetrics.successfulWorkflows / this.workflowMetrics.totalWorkflows 
                    : 0,
                modelEfficiency: this.calculateModelEfficiency()
            },
            availableWorkflows: Object.keys(this.automationWorkflows),
            integrations: {
                commandCenter: !!this.commandCenter,
                totalIntegrations: this.automationIntegrations.size
            }
        };
    }

    calculateModelEfficiency() {
        const efficiency = {};
        
        for (const [model, metrics] of Object.entries(this.workflowMetrics.modelUtilization)) {
            efficiency[model] = {
                tasksPerMinute: metrics.tasks > 0 && metrics.totalTime > 0 
                    ? (metrics.tasks / (metrics.totalTime / 60000)) 
                    : 0,
                avgTimePerTask: metrics.tasks > 0 
                    ? metrics.totalTime / metrics.tasks 
                    : 0
            };
        }
        
        return efficiency;
    }

    async saveAutomationReport() {
        const metrics = this.getEnhancedMetrics();
        
        const report = {
            timestamp: Date.now(),
            metrics,
            recentWorkflows: this.completedWorkflows.slice(-10).map(w => ({
                name: w.name,
                duration: w.totalTime,
                cost: w.metadata.totalCost,
                models: Array.from(w.metadata.modelsUsed)
            })),
            modelPerformance: this.calculateModelEfficiency(),
            automationCapabilities: {
                totalWorkflows: Object.keys(this.automationWorkflows).length,
                integrations: this.automationIntegrations.size,
                commandCenterConnected: !!this.commandCenter
            }
        };

        try {
            const reportDir = path.join(process.cwd(), 'reports', 'ai-orchestrator');
            await fs.mkdir(reportDir, { recursive: true });
            
            const reportPath = path.join(reportDir, `orchestrator-report-${Date.now()}.json`);
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            
            console.log(`📊 AI Orchestrator report saved: ${reportPath}`);
        } catch (error) {
            console.error('Failed to save AI Orchestrator report:', error);
        }

        return report;
    }
}

// Deployment Configuration
const DEPLOYMENT_CONFIG = {
    AI_MODELS: {
        CLAUDE_OPUS_4: {
            enabled: true,
            apiKey: process.env.ANTHROPIC_API_KEY,
            maxConcurrentTasks: 3
        },
        CHATGPT_5_PRO: {
            enabled: true,
            apiKey: process.env.OPENAI_API_KEY,
            maxConcurrentTasks: 5
        },
        GEMINI_2_5_PRO: {
            enabled: true,
            apiKey: process.env.GOOGLE_AI_KEY,
            maxConcurrentTasks: 10
        }
    },
    AUTOMATION: {
        healthCheckInterval: 300000,    // 5 minutes
        reportGenerationInterval: 3600000, // 1 hour
        workflowTimeout: 600000,        // 10 minutes
        maxConcurrentWorkflows: 5
    }
};

// Deployment Manager
class AIOrchestratorDeploymentManager extends EventEmitter {
    constructor() {
        super();
        this.orchestrator = null;
        this.isDeployed = false;
        this.healthCheckInterval = null;
    }

    async deploy() {
        console.log('🚀 Deploying Enhanced AI Workflow Orchestrator...');

        try {
            // Initialize orchestrator with configuration
            this.orchestrator = new EnhancedAIOrchestrator({
                anthropicApiKey: DEPLOYMENT_CONFIG.AI_MODELS.CLAUDE_OPUS_4.apiKey,
                openaiApiKey: DEPLOYMENT_CONFIG.AI_MODELS.CHATGPT_5_PRO.apiKey,
                googleApiKey: DEPLOYMENT_CONFIG.AI_MODELS.GEMINI_2_5_PRO.apiKey
            });

            // Set up health monitoring
            this.setupHealthMonitoring();

            // Test model connections
            await this.testModelConnections();

            // Run initial test workflow
            await this.runDeploymentTest();

            this.isDeployed = true;
            console.log('✅ AI Workflow Orchestrator deployed successfully');
            
            this.emit('deployment:complete', {
                timestamp: Date.now(),
                models: Object.keys(DEPLOYMENT_CONFIG.AI_MODELS),
                automationWorkflows: Object.keys(this.orchestrator.automationWorkflows)
            });

            return this.orchestrator;

        } catch (error) {
            console.error('❌ AI Orchestrator deployment failed:', error);
            this.emit('deployment:failed', error);
            throw error;
        }
    }

    async testModelConnections() {
        console.log('🔍 Testing AI model connections...');
        
        const testResults = [];

        // Test each model with a simple task
        for (const [modelKey, config] of Object.entries(DEPLOYMENT_CONFIG.AI_MODELS)) {
            if (config.enabled && config.apiKey) {
                try {
                    const client = this.orchestrator.clients.get(modelKey);
                    if (client) {
                        const testTask = {
                            description: 'Connection test',
                            prompt: 'Respond with "Connection successful" to confirm the API is working.',
                            systemPrompt: 'You are testing an API connection.'
                        };
                        
                        const result = await client.execute(testTask);
                        testResults.push({ 
                            model: modelKey, 
                            status: 'connected', 
                            responseTime: result.metadata?.latency || 0 
                        });
                        console.log(`  ✅ ${modelKey}: Connected (${result.metadata?.latency?.toFixed(0) || 0}ms)`);
                    }
                } catch (error) {
                    testResults.push({ 
                        model: modelKey, 
                        status: 'failed', 
                        error: error.message 
                    });
                    console.log(`  ❌ ${modelKey}: Connection failed - ${error.message}`);
                }
            } else {
                testResults.push({ 
                    model: modelKey, 
                    status: 'disabled', 
                    reason: config.enabled ? 'No API key' : 'Disabled in config' 
                });
                console.log(`  ⚠️ ${modelKey}: ${config.enabled ? 'No API key provided' : 'Disabled in configuration'}`);
            }
        }

        const connectedModels = testResults.filter(r => r.status === 'connected').length;
        if (connectedModels === 0) {
            throw new Error('No AI models connected successfully');
        }

        console.log(`✅ ${connectedModels} AI models connected successfully`);
        return testResults;
    }

    async runDeploymentTest() {
        console.log('🧪 Running deployment test workflow...');

        try {
            const testWorkflow = {
                name: 'Deployment Test',
                description: 'Test workflow to validate orchestrator deployment',
                tasks: [
                    {
                        description: 'Generate deployment confirmation',
                        prompt: 'Generate a brief confirmation that the Blaze Intelligence AI Workflow Orchestrator is deployed and operational. Include the current timestamp and a success message.',
                        systemPrompt: 'You are confirming successful deployment of an AI system.',
                        requiresValidation: true
                    }
                ]
            };

            const result = await this.orchestrator.executeWorkflow(testWorkflow);
            
            if (result.status === 'completed') {
                console.log('✅ Deployment test completed successfully');
                console.log(`   Duration: ${result.totalTime}ms`);
                console.log(`   Models used: ${Array.from(result.metadata.modelsUsed).join(', ')}`);
                console.log(`   Total cost: $${result.metadata.totalCost.toFixed(4)}`);
            } else {
                throw new Error('Deployment test workflow failed');
            }

        } catch (error) {
            console.error('❌ Deployment test failed:', error);
            throw error;
        }
    }

    setupHealthMonitoring() {
        this.healthCheckInterval = setInterval(async () => {
            try {
                const metrics = this.orchestrator.getEnhancedMetrics();
                
                // Check for concerning metrics
                if (metrics.automation.successRate < 0.8) {
                    this.emit('health:warning', {
                        type: 'low_success_rate',
                        value: metrics.automation.successRate,
                        threshold: 0.8
                    });
                }
                
                if (metrics.aggregated.avgLatency > 10000) { // 10 seconds
                    this.emit('health:warning', {
                        type: 'high_latency',
                        value: metrics.aggregated.avgLatency,
                        threshold: 10000
                    });
                }

                // Generate periodic report
                if (Date.now() % DEPLOYMENT_CONFIG.AUTOMATION.reportGenerationInterval < 60000) {
                    await this.orchestrator.saveAutomationReport();
                }

            } catch (error) {
                console.error('Health monitoring error:', error);
                this.emit('health:error', error);
            }
        }, DEPLOYMENT_CONFIG.AUTOMATION.healthCheckInterval);
    }

    async undeploy() {
        console.log('🛑 Undeploying AI Workflow Orchestrator...');
        
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        
        if (this.orchestrator) {
            // Save final report
            await this.orchestrator.saveAutomationReport();
        }
        
        this.isDeployed = false;
        this.orchestrator = null;
        
        console.log('✅ AI Workflow Orchestrator undeployed');
        this.emit('deployment:stopped');
    }

    getStatus() {
        return {
            deployed: this.isDeployed,
            orchestrator: !!this.orchestrator,
            healthMonitoring: !!this.healthCheckInterval,
            metrics: this.orchestrator ? this.orchestrator.getEnhancedMetrics() : null
        };
    }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const deploymentManager = new AIOrchestratorDeploymentManager();
    const command = process.argv[2] || 'deploy';

    deploymentManager.on('deployment:complete', (data) => {
        console.log(`\n🎉 Deployment completed successfully!`);
        console.log(`Models: ${data.models.join(', ')}`);
        console.log(`Automation Workflows: ${data.automationWorkflows.length}`);
        console.log(`\n📊 Access metrics at: http://localhost:3000/ai-orchestrator/metrics`);
    });

    deploymentManager.on('health:warning', (warning) => {
        console.log(`⚠️ Health Warning: ${warning.type} - ${warning.value} (threshold: ${warning.threshold})`);
    });

    switch (command) {
        case 'deploy':
            deploymentManager.deploy().then(orchestrator => {
                console.log('\nAI Workflow Orchestrator ready for automation tasks:');
                console.log('• Health data analysis');
                console.log('• Data quality validation');
                console.log('• Performance optimization');
                console.log('• Security auditing');
                console.log('• Deployment validation');
                console.log('• Sports insight generation');
                console.log('\nPress Ctrl+C to stop...');
                
                process.on('SIGINT', async () => {
                    console.log('\nShutting down AI Orchestrator...');
                    await deploymentManager.undeploy();
                    process.exit(0);
                });
                
                process.on('SIGTERM', async () => {
                    console.log('\nShutting down AI Orchestrator...');
                    await deploymentManager.undeploy();
                    process.exit(0);
                });
                
            }).catch(error => {
                console.error('Deployment failed:', error);
                process.exit(1);
            });
            break;

        case 'test':
            deploymentManager.deploy().then(async (orchestrator) => {
                console.log('\n🧪 Running comprehensive test suite...');
                
                // Test automation workflows
                const testData = {
                    Cardinals: { wins: 85, losses: 77, championship_probability: 0.128 },
                    performance: { response_time: 150, cpu: 45, memory: 67 },
                    health: { availability: 0.999, errors: 2 }
                };

                console.log('\nTesting Sports Insights workflow...');
                const sportsResult = await orchestrator.generateSportsInsights(testData);
                console.log(`✅ Sports Insights: ${sportsResult.name} completed in ${sportsResult.totalTime}ms`);

                console.log('\nTesting Performance Optimization workflow...');
                const perfResult = await orchestrator.optimizePerformance(testData.performance);
                console.log(`✅ Performance Optimization: ${perfResult.name} completed in ${perfResult.totalTime}ms`);

                console.log('\nTesting Health Analysis workflow...');
                const healthResult = await orchestrator.processHealthData(testData.health);
                console.log(`✅ Health Analysis: ${healthResult.name} completed in ${healthResult.totalTime}ms`);

                console.log('\n📊 Final Metrics:');
                const metrics = orchestrator.getEnhancedMetrics();
                console.log(`Total Workflows: ${metrics.automation.totalWorkflows}`);
                console.log(`Success Rate: ${(metrics.automation.successRate * 100).toFixed(1)}%`);
                console.log(`Avg Execution Time: ${metrics.automation.avgExecutionTime.toFixed(0)}ms`);

                await deploymentManager.undeploy();
                process.exit(0);
            }).catch(error => {
                console.error('Test failed:', error);
                process.exit(1);
            });
            break;

        case 'status':
            console.log('AI Orchestrator Status:', deploymentManager.getStatus());
            process.exit(0);
            break;

        default:
            console.log('Usage: node ai-orchestrator-deploy.js [deploy|test|status]');
            console.log('  deploy - Deploy and run the AI Workflow Orchestrator');
            console.log('  test   - Run comprehensive test suite');
            console.log('  status - Show deployment status');
            process.exit(1);
    }
}

export { EnhancedAIOrchestrator, AIOrchestratorDeploymentManager, DEPLOYMENT_CONFIG };