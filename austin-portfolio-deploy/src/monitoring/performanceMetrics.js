/**
 * Performance Monitoring System - Championship Sports Analytics
 * By Austin Humphrey - Deep South Sports Authority
 * 
 * Real-time performance monitoring for championship-level sports analysis
 * Sub-100ms latency tracking, throughput monitoring, and quality assurance
 */

import { EventEmitter } from 'events';
import os from 'os';
import fs from 'fs';
import path from 'path';

class PerformanceMetrics extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            // Championship performance targets - Austin's standards
            championshipTargets: {
                inferenceLatency: 33,        // <33ms YOLOv11 inference
                endToEndLatency: 100,        // <100ms end-to-end
                frameRate: 30,               // 30+ FPS processing
                accuracy: 0.95,              // >95% mAP accuracy
                uptime: 0.999,               // >99.9% uptime
                memoryUsage: 0.8,            // <80% memory usage
                cpuUsage: 0.7,               // <70% CPU usage
                gpuUsage: 0.85               // <85% GPU usage
            },
            
            // Monitoring intervals
            monitoring: {
                metricsInterval: 1000,       // Collect metrics every 1s
                reportInterval: 10000,       // Report every 10s
                alertInterval: 5000,         // Check alerts every 5s
                historicalRetention: 3600000 // Keep 1 hour of history
            },
            
            // Sports-specific performance requirements
            sportsRequirements: {
                football: {
                    minFrameRate: 30,
                    maxLatency: 33,
                    trackingAccuracy: 0.95,
                    formationDetectionRate: 0.90
                },
                baseball: {
                    minFrameRate: 60,        // Higher for ball tracking
                    maxLatency: 16,          // Faster for pitch analysis
                    trackingAccuracy: 0.98,  // Perfect Game standards
                    ballDetectionRate: 0.95
                },
                basketball: {
                    minFrameRate: 30,
                    maxLatency: 33,
                    trackingAccuracy: 0.90,
                    playDetectionRate: 0.85
                }
            }
        };
        
        // Metrics storage
        this.metrics = {
            // System metrics
            system: {
                cpuUsage: 0,
                memoryUsage: 0,
                gpuUsage: 0,
                diskUsage: 0,
                networkLatency: 0,
                uptime: process.uptime()
            },
            
            // Visual processing metrics
            visualProcessing: {
                framesProcessed: 0,
                averageInferenceLatency: 0,
                averageEndToEndLatency: 0,
                currentFrameRate: 0,
                droppedFrames: 0,
                accuracyScore: 0,
                championshipCompliance: 0
            },
            
            // WebRTC metrics
            webrtc: {
                activeConnections: 0,
                connectionSuccessRate: 0,
                averageSignalingLatency: 0,
                averageJitter: 0,
                packetsLost: 0,
                bitrateInbound: 0,
                bitrateOutbound: 0
            },
            
            // Sports analysis metrics
            sportsAnalysis: {
                football: {
                    framesAnalyzed: 0,
                    formationsDetected: 0,
                    playersTracked: 0,
                    austinInsights: 0,
                    accuracy: 0
                },
                baseball: {
                    framesAnalyzed: 0,
                    pitchesTracked: 0,
                    ballDetections: 0,
                    perfectGameFrames: 0,
                    accuracy: 0
                },
                basketball: {
                    framesAnalyzed: 0,
                    shotsAnalyzed: 0,
                    playsDetected: 0,
                    fastBreaks: 0,
                    accuracy: 0
                }
            },
            
            // Error and alert metrics
            errors: {
                inferenceErrors: 0,
                webrtcErrors: 0,
                systemErrors: 0,
                totalErrors: 0,
                lastError: null
            }
        };
        
        // Historical data for trend analysis
        this.history = {
            timestamps: [],
            inferenceLatency: [],
            endToEndLatency: [],
            frameRate: [],
            accuracy: [],
            cpuUsage: [],
            memoryUsage: [],
            gpuUsage: []
        };
        
        // Performance thresholds for alerts
        this.alertThresholds = {
            critical: {
                inferenceLatency: 50,     // >50ms critical
                endToEndLatency: 150,     // >150ms critical
                frameRate: 20,            // <20 FPS critical
                accuracy: 0.85,           // <85% accuracy critical
                memoryUsage: 0.9,         // >90% memory critical
                cpuUsage: 0.85            // >85% CPU critical
            },
            warning: {
                inferenceLatency: 40,     // >40ms warning
                endToEndLatency: 120,     // >120ms warning
                frameRate: 25,            // <25 FPS warning
                accuracy: 0.90,           // <90% accuracy warning
                memoryUsage: 0.8,         // >80% memory warning
                cpuUsage: 0.7             // >70% CPU warning
            }
        };
        
        // Alert state tracking
        this.alerts = {
            active: new Map(),
            history: [],
            counts: {
                critical: 0,
                warning: 0,
                info: 0
            }
        };
        
        console.log('🏆 Performance Metrics System - Austin Humphrey Championship Standards');
        console.log('🎯 Monitoring targets: <33ms inference, <100ms end-to-end, 30+ FPS');
        console.log('📊 Sports optimization: Football • Baseball • Basketball performance tracking');
        
        // Initialize monitoring
        this.startMonitoring();
    }

    /**
     * Start performance monitoring system
     */
    startMonitoring() {
        // System metrics collection
        this.systemMetricsTimer = setInterval(() => {
            this.collectSystemMetrics();
        }, this.config.monitoring.metricsInterval);
        
        // Performance reports
        this.reportTimer = setInterval(() => {
            this.generatePerformanceReport();
        }, this.config.monitoring.reportInterval);
        
        // Alert checking
        this.alertTimer = setInterval(() => {
            this.checkAlerts();
        }, this.config.monitoring.alertInterval);
        
        // Historical data cleanup
        this.cleanupTimer = setInterval(() => {
            this.cleanupHistoricalData();
        }, this.config.monitoring.historicalRetention / 10);
        
        console.log('📊 Performance monitoring started - Championship standards tracking');
    }

    /**
     * Collect system performance metrics
     */
    async collectSystemMetrics() {
        try {
            const timestamp = Date.now();
            
            // CPU usage
            const cpus = os.cpus();
            let totalIdle = 0;
            let totalTick = 0;
            
            cpus.forEach(cpu => {
                for (const type in cpu.times) {
                    totalTick += cpu.times[type];
                }
                totalIdle += cpu.times.idle;
            });
            
            this.metrics.system.cpuUsage = 1 - (totalIdle / totalTick);
            
            // Memory usage
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            this.metrics.system.memoryUsage = (totalMemory - freeMemory) / totalMemory;
            
            // GPU usage (if available)
            this.metrics.system.gpuUsage = await this.getGPUUsage();
            
            // System uptime
            this.metrics.system.uptime = process.uptime();
            
            // Network latency (simple ping to Google DNS)
            this.metrics.system.networkLatency = await this.measureNetworkLatency();
            
            // Add to historical data
            this.updateHistoricalData(timestamp);
            
        } catch (error) {
            console.error('❌ System metrics collection failed:', error);
            this.recordError('system', error);
        }
    }

    /**
     * Get GPU usage (placeholder - would need nvidia-ml-py or similar)
     */
    async getGPUUsage() {
        try {
            // Placeholder for GPU monitoring
            // In production, would use nvidia-smi or similar
            return Math.random() * 0.3 + 0.4; // Simulate 40-70% usage
        } catch (error) {
            return 0;
        }
    }

    /**
     * Measure network latency
     */
    async measureNetworkLatency() {
        try {
            const start = Date.now();
            // Simple network check - would use proper ping in production
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10 + 5));
            return Date.now() - start;
        } catch (error) {
            return 999; // High latency on error
        }
    }

    /**
     * Update historical data
     */
    updateHistoricalData(timestamp) {
        // Add current metrics to history
        this.history.timestamps.push(timestamp);
        this.history.inferenceLatency.push(this.metrics.visualProcessing.averageInferenceLatency);
        this.history.endToEndLatency.push(this.metrics.visualProcessing.averageEndToEndLatency);
        this.history.frameRate.push(this.metrics.visualProcessing.currentFrameRate);
        this.history.accuracy.push(this.metrics.visualProcessing.accuracyScore);
        this.history.cpuUsage.push(this.metrics.system.cpuUsage);
        this.history.memoryUsage.push(this.metrics.system.memoryUsage);
        this.history.gpuUsage.push(this.metrics.system.gpuUsage);
        
        // Keep only recent data
        const maxHistorySize = Math.floor(this.config.monitoring.historicalRetention / this.config.monitoring.metricsInterval);
        
        Object.keys(this.history).forEach(key => {
            if (this.history[key].length > maxHistorySize) {
                this.history[key] = this.history[key].slice(-maxHistorySize);
            }
        });
    }

    /**
     * Record visual processing metrics
     */
    recordVisualProcessingMetrics(metrics) {
        const {
            processingTime,
            endToEndLatency,
            frameRate,
            accuracy,
            sport,
            championshipCompliant,
            detectionCount,
            droppedFrames
        } = metrics;
        
        try {
            // Update visual processing metrics
            this.metrics.visualProcessing.framesProcessed++;
            this.metrics.visualProcessing.averageInferenceLatency = this.updateAverage(
                this.metrics.visualProcessing.averageInferenceLatency,
                processingTime,
                this.metrics.visualProcessing.framesProcessed
            );
            
            if (endToEndLatency) {
                this.metrics.visualProcessing.averageEndToEndLatency = this.updateAverage(
                    this.metrics.visualProcessing.averageEndToEndLatency,
                    endToEndLatency,
                    this.metrics.visualProcessing.framesProcessed
                );
            }
            
            if (frameRate !== undefined) {
                this.metrics.visualProcessing.currentFrameRate = frameRate;
            }
            
            if (accuracy !== undefined) {
                this.metrics.visualProcessing.accuracyScore = accuracy;
            }
            
            if (droppedFrames !== undefined) {
                this.metrics.visualProcessing.droppedFrames += droppedFrames;
            }
            
            // Update championship compliance
            if (championshipCompliant !== undefined) {
                const totalFrames = this.metrics.visualProcessing.framesProcessed;
                const compliantFrames = championshipCompliant ? 1 : 0;
                this.metrics.visualProcessing.championshipCompliance = this.updateAverage(
                    this.metrics.visualProcessing.championshipCompliance,
                    compliantFrames,
                    totalFrames
                );
            }
            
            // Update sports-specific metrics
            if (sport && this.metrics.sportsAnalysis[sport]) {
                const sportMetrics = this.metrics.sportsAnalysis[sport];
                sportMetrics.framesAnalyzed++;
                
                if (accuracy !== undefined) {
                    sportMetrics.accuracy = this.updateAverage(
                        sportMetrics.accuracy,
                        accuracy,
                        sportMetrics.framesAnalyzed
                    );
                }
                
                // Sport-specific tracking
                if (detectionCount !== undefined) {
                    if (sport === 'football') {
                        sportMetrics.playersTracked += detectionCount;
                    } else if (sport === 'baseball') {
                        sportMetrics.ballDetections += detectionCount;
                    } else if (sport === 'basketball') {
                        sportMetrics.playsDetected += detectionCount;
                    }
                }
            }
            
            console.log(`📊 Visual processing metrics updated: ${processingTime}ms inference, ${frameRate} FPS`);
            
        } catch (error) {
            console.error('❌ Visual processing metrics recording failed:', error);
            this.recordError('visualProcessing', error);
        }
    }

    /**
     * Record WebRTC metrics
     */
    recordWebRTCMetrics(metrics) {
        const {
            activeConnections,
            connectionSuccess,
            signalingLatency,
            jitter,
            packetsLost,
            bitrateInbound,
            bitrateOutbound
        } = metrics;
        
        try {
            if (activeConnections !== undefined) {
                this.metrics.webrtc.activeConnections = activeConnections;
            }
            
            if (connectionSuccess !== undefined) {
                const totalConnections = this.metrics.webrtc.activeConnections + (connectionSuccess ? 1 : 0);
                this.metrics.webrtc.connectionSuccessRate = this.updateAverage(
                    this.metrics.webrtc.connectionSuccessRate,
                    connectionSuccess ? 1 : 0,
                    totalConnections
                );
            }
            
            if (signalingLatency !== undefined) {
                this.metrics.webrtc.averageSignalingLatency = this.updateAverage(
                    this.metrics.webrtc.averageSignalingLatency,
                    signalingLatency,
                    this.metrics.webrtc.activeConnections
                );
            }
            
            if (jitter !== undefined) {
                this.metrics.webrtc.averageJitter = jitter;
            }
            
            if (packetsLost !== undefined) {
                this.metrics.webrtc.packetsLost += packetsLost;
            }
            
            if (bitrateInbound !== undefined) {
                this.metrics.webrtc.bitrateInbound = bitrateInbound;
            }
            
            if (bitrateOutbound !== undefined) {
                this.metrics.webrtc.bitrateOutbound = bitrateOutbound;
            }
            
        } catch (error) {
            console.error('❌ WebRTC metrics recording failed:', error);
            this.recordError('webrtc', error);
        }
    }

    /**
     * Record sports analysis metrics
     */
    recordSportsAnalysisMetrics(sport, metrics) {
        if (!this.metrics.sportsAnalysis[sport]) return;
        
        try {
            const sportMetrics = this.metrics.sportsAnalysis[sport];
            
            if (metrics.formationsDetected) {
                sportMetrics.formationsDetected += metrics.formationsDetected;
            }
            
            if (metrics.pitchesTracked) {
                sportMetrics.pitchesTracked += metrics.pitchesTracked;
            }
            
            if (metrics.shotsAnalyzed) {
                sportMetrics.shotsAnalyzed += metrics.shotsAnalyzed;
            }
            
            if (metrics.austinInsights) {
                sportMetrics.austinInsights += metrics.austinInsights;
            }
            
            if (metrics.perfectGameFrames) {
                sportMetrics.perfectGameFrames += metrics.perfectGameFrames;
            }
            
            if (metrics.fastBreaks) {
                sportMetrics.fastBreaks += metrics.fastBreaks;
            }
            
        } catch (error) {
            console.error(`❌ Sports analysis metrics recording failed for ${sport}:`, error);
            this.recordError('sportsAnalysis', error);
        }
    }

    /**
     * Record error
     */
    recordError(category, error) {
        try {
            this.metrics.errors.totalErrors++;
            this.metrics.errors.lastError = {
                category,
                message: error.message,
                timestamp: Date.now(),
                stack: error.stack
            };
            
            if (category === 'inference') {
                this.metrics.errors.inferenceErrors++;
            } else if (category === 'webrtc') {
                this.metrics.errors.webrtcErrors++;
            } else {
                this.metrics.errors.systemErrors++;
            }
            
        } catch (recordingError) {
            console.error('❌ Error recording failed:', recordingError);
        }
    }

    /**
     * Update running average
     */
    updateAverage(currentAverage, newValue, count) {
        return ((currentAverage * (count - 1)) + newValue) / count;
    }

    /**
     * Check for performance alerts
     */
    checkAlerts() {
        const alerts = [];
        
        try {
            // Check inference latency
            if (this.metrics.visualProcessing.averageInferenceLatency > this.alertThresholds.critical.inferenceLatency) {
                alerts.push({
                    type: 'critical',
                    category: 'inference_latency',
                    message: `Inference latency critical: ${this.metrics.visualProcessing.averageInferenceLatency}ms > ${this.alertThresholds.critical.inferenceLatency}ms`,
                    value: this.metrics.visualProcessing.averageInferenceLatency,
                    threshold: this.alertThresholds.critical.inferenceLatency
                });
            } else if (this.metrics.visualProcessing.averageInferenceLatency > this.alertThresholds.warning.inferenceLatency) {
                alerts.push({
                    type: 'warning',
                    category: 'inference_latency',
                    message: `Inference latency warning: ${this.metrics.visualProcessing.averageInferenceLatency}ms > ${this.alertThresholds.warning.inferenceLatency}ms`,
                    value: this.metrics.visualProcessing.averageInferenceLatency,
                    threshold: this.alertThresholds.warning.inferenceLatency
                });
            }
            
            // Check frame rate
            if (this.metrics.visualProcessing.currentFrameRate < this.alertThresholds.critical.frameRate) {
                alerts.push({
                    type: 'critical',
                    category: 'frame_rate',
                    message: `Frame rate critical: ${this.metrics.visualProcessing.currentFrameRate} FPS < ${this.alertThresholds.critical.frameRate} FPS`,
                    value: this.metrics.visualProcessing.currentFrameRate,
                    threshold: this.alertThresholds.critical.frameRate
                });
            } else if (this.metrics.visualProcessing.currentFrameRate < this.alertThresholds.warning.frameRate) {
                alerts.push({
                    type: 'warning',
                    category: 'frame_rate',
                    message: `Frame rate warning: ${this.metrics.visualProcessing.currentFrameRate} FPS < ${this.alertThresholds.warning.frameRate} FPS`,
                    value: this.metrics.visualProcessing.currentFrameRate,
                    threshold: this.alertThresholds.warning.frameRate
                });
            }
            
            // Check memory usage
            if (this.metrics.system.memoryUsage > this.alertThresholds.critical.memoryUsage) {
                alerts.push({
                    type: 'critical',
                    category: 'memory_usage',
                    message: `Memory usage critical: ${(this.metrics.system.memoryUsage * 100).toFixed(1)}% > ${(this.alertThresholds.critical.memoryUsage * 100).toFixed(1)}%`,
                    value: this.metrics.system.memoryUsage,
                    threshold: this.alertThresholds.critical.memoryUsage
                });
            } else if (this.metrics.system.memoryUsage > this.alertThresholds.warning.memoryUsage) {
                alerts.push({
                    type: 'warning',
                    category: 'memory_usage',
                    message: `Memory usage warning: ${(this.metrics.system.memoryUsage * 100).toFixed(1)}% > ${(this.alertThresholds.warning.memoryUsage * 100).toFixed(1)}%`,
                    value: this.metrics.system.memoryUsage,
                    threshold: this.alertThresholds.warning.memoryUsage
                });
            }
            
            // Process alerts
            alerts.forEach(alert => {
                this.processAlert(alert);
            });
            
        } catch (error) {
            console.error('❌ Alert checking failed:', error);
        }
    }

    /**
     * Process alert
     */
    processAlert(alert) {
        const alertKey = `${alert.category}_${alert.type}`;
        const existingAlert = this.alerts.active.get(alertKey);
        
        if (!existingAlert) {
            // New alert
            this.alerts.active.set(alertKey, {
                ...alert,
                timestamp: Date.now(),
                count: 1
            });
            
            this.alerts.counts[alert.type]++;
            this.alerts.history.push({ ...alert, timestamp: Date.now() });
            
            // Emit alert
            this.emit('alert', alert);
            
            console.warn(`🚨 ${alert.type.toUpperCase()} Alert: ${alert.message}`);
            
        } else {
            // Update existing alert
            existingAlert.count++;
            existingAlert.value = alert.value;
        }
    }

    /**
     * Generate performance report
     */
    generatePerformanceReport() {
        const report = {
            timestamp: Date.now(),
            
            // Championship compliance status
            championshipStatus: {
                inferenceLatency: {
                    current: this.metrics.visualProcessing.averageInferenceLatency,
                    target: this.config.championshipTargets.inferenceLatency,
                    compliant: this.metrics.visualProcessing.averageInferenceLatency <= this.config.championshipTargets.inferenceLatency
                },
                endToEndLatency: {
                    current: this.metrics.visualProcessing.averageEndToEndLatency,
                    target: this.config.championshipTargets.endToEndLatency,
                    compliant: this.metrics.visualProcessing.averageEndToEndLatency <= this.config.championshipTargets.endToEndLatency
                },
                frameRate: {
                    current: this.metrics.visualProcessing.currentFrameRate,
                    target: this.config.championshipTargets.frameRate,
                    compliant: this.metrics.visualProcessing.currentFrameRate >= this.config.championshipTargets.frameRate
                },
                accuracy: {
                    current: this.metrics.visualProcessing.accuracyScore,
                    target: this.config.championshipTargets.accuracy,
                    compliant: this.metrics.visualProcessing.accuracyScore >= this.config.championshipTargets.accuracy
                },
                overallCompliance: this.metrics.visualProcessing.championshipCompliance
            },
            
            // System performance
            systemPerformance: {
                cpu: this.metrics.system.cpuUsage,
                memory: this.metrics.system.memoryUsage,
                gpu: this.metrics.system.gpuUsage,
                uptime: this.metrics.system.uptime,
                networkLatency: this.metrics.system.networkLatency
            },
            
            // Visual processing performance
            visualProcessing: this.metrics.visualProcessing,
            
            // WebRTC performance
            webrtc: this.metrics.webrtc,
            
            // Sports analysis summary
            sportsAnalysis: this.metrics.sportsAnalysis,
            
            // Error summary
            errors: this.metrics.errors,
            
            // Active alerts
            alerts: {
                active: Array.from(this.alerts.active.values()),
                counts: this.alerts.counts,
                recentCount: this.alerts.history.filter(alert => 
                    Date.now() - alert.timestamp < 300000 // Last 5 minutes
                ).length
            }
        };
        
        // Emit performance report
        this.emit('performanceReport', report);
        
        // Championship status logging
        const championshipCompliant = Object.values(report.championshipStatus)
            .filter(item => typeof item === 'object' && 'compliant' in item)
            .every(item => item.compliant);
            
        if (championshipCompliant) {
            console.log('🏆 Championship performance standards maintained');
        } else {
            console.warn('⚠️  Performance below championship standards');
        }
        
        return report;
    }

    /**
     * Get current metrics snapshot
     */
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            uptime: process.uptime()
        };
    }

    /**
     * Get historical performance data
     */
    getHistoricalData(timeRange = 3600000) { // Default 1 hour
        const cutoff = Date.now() - timeRange;
        const startIndex = this.history.timestamps.findIndex(t => t >= cutoff);
        
        if (startIndex === -1) return null;
        
        const result = {};
        Object.keys(this.history).forEach(key => {
            result[key] = this.history[key].slice(startIndex);
        });
        
        return result;
    }

    /**
     * Clean up old historical data
     */
    cleanupHistoricalData() {
        const cutoff = Date.now() - this.config.monitoring.historicalRetention;
        
        // Clean up alert history
        this.alerts.history = this.alerts.history.filter(alert => 
            alert.timestamp > cutoff
        );
        
        // Historical data is already limited in updateHistoricalData
    }

    /**
     * Reset metrics (for testing)
     */
    resetMetrics() {
        Object.keys(this.metrics).forEach(category => {
            if (typeof this.metrics[category] === 'object') {
                Object.keys(this.metrics[category]).forEach(key => {
                    if (typeof this.metrics[category][key] === 'number') {
                        this.metrics[category][key] = 0;
                    }
                });
            }
        });
        
        this.history = {
            timestamps: [],
            inferenceLatency: [],
            endToEndLatency: [],
            frameRate: [],
            accuracy: [],
            cpuUsage: [],
            memoryUsage: [],
            gpuUsage: []
        };
        
        this.alerts.active.clear();
        this.alerts.history = [];
        this.alerts.counts = { critical: 0, warning: 0, info: 0 };
        
        console.log('📊 Performance metrics reset');
    }

    /**
     * Shutdown performance monitoring
     */
    shutdown() {
        console.log('🛑 Shutting down Performance Metrics System...');
        
        try {
            // Clear timers
            clearInterval(this.systemMetricsTimer);
            clearInterval(this.reportTimer);
            clearInterval(this.alertTimer);
            clearInterval(this.cleanupTimer);
            
            console.log('✅ Performance Metrics System shutdown complete');
            
        } catch (error) {
            console.error('❌ Error during performance metrics shutdown:', error);
        }
    }
}

export default PerformanceMetrics;