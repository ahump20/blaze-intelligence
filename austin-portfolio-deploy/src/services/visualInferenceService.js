/**
 * Visual Inference Service - IPC Bridge for Championship YOLOv11
 * By Austin Humphrey - Deep South Sports Authority
 * 
 * High-performance IPC communication bridge between Node.js and Python workers
 * ZeroMQ-based communication for sub-33ms latency targets
 * Integrated with championship-level sports analysis capabilities
 */

import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import zmq from 'zeromq';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VisualInferenceService extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            // Worker configuration
            maxWorkers: options.maxWorkers || 4,
            workerTimeout: options.workerTimeout || 30000,
            restartDelay: options.restartDelay || 5000,
            
            // Communication settings
            basePort: options.basePort || 5555,
            requestTimeout: options.requestTimeout || 2000,
            maxRetries: options.maxRetries || 3,
            
            // Performance targets - Austin's Championship Standards
            championshipTargets: {
                maxLatencyMs: 33,         // <33ms per frame
                minAccuracy: 0.95,        // >95% detection accuracy
                targetThroughput: 30,     // 30+ FPS processing
                maxMemoryMB: 2048,        // Memory limit per worker
                errorRateThreshold: 0.01  // <1% error rate
            },
            
            // Python worker configuration
            pythonPath: options.pythonPath || 'python3',
            workerScript: path.join(__dirname, '../workers/realYOLOv11Worker.py'),
            modelPath: options.modelPath || null,
            device: options.device || 'auto',
            
            // Austin Humphrey's sports specialization
            sportsConfig: {
                defaultSport: 'football',
                expertiseLevels: ['standard', 'championship', 'sec_authority', 'perfect_game'],
                defaultExpertise: 'championship'
            }
        };
        
        // Worker management
        this.workers = new Map();
        this.activeRequests = new Map();
        this.workerQueue = [];
        this.requestQueue = [];
        
        // Performance tracking
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageLatency: 0,
            peakLatency: 0,
            championshipStandardsMet: 0,
            workersSpawned: 0,
            workersRestarted: 0,
            lastPerformanceCheck: Date.now()
        };
        
        // Load balancing and health monitoring
        this.loadBalancer = {
            roundRobinIndex: 0,
            healthChecks: new Map(),
            performanceMetrics: new Map()
        };
        
        this.initialize();
    }

    async initialize() {
        console.log('🏆 Visual Inference Service initializing - Austin Humphrey Championship System');
        console.log(`🎯 Performance targets: <${this.config.championshipTargets.maxLatencyMs}ms latency, >${this.config.championshipTargets.minAccuracy*100}% accuracy`);
        console.log(`🧠 Sports intelligence: Austin's expertise levels available`);
        console.log(`⚡ Worker pool: ${this.config.maxWorkers} Python YOLOv11 workers`);
        
        try {
            // Initialize worker pool
            await this.initializeWorkerPool();
            
            // Start performance monitoring
            this.startPerformanceMonitoring();
            
            // Start request processing loop
            this.startRequestProcessing();
            
            console.log('✅ Visual Inference Service ready - Championship standards active');
            this.emit('ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize Visual Inference Service:', error);
            this.emit('error', error);
            throw error;
        }
    }

    async initializeWorkerPool() {
        console.log(`🔧 Initializing ${this.config.maxWorkers} YOLOv11 workers...`);
        
        const workerPromises = [];
        for (let i = 0; i < this.config.maxWorkers; i++) {
            workerPromises.push(this.spawnWorker(i));
        }
        
        const results = await Promise.allSettled(workerPromises);
        const successfulWorkers = results.filter(r => r.status === 'fulfilled').length;
        
        if (successfulWorkers === 0) {
            throw new Error('Failed to start any YOLOv11 workers');
        }
        
        console.log(`✅ Worker pool ready: ${successfulWorkers}/${this.config.maxWorkers} workers active`);
    }

    async spawnWorker(workerId) {
        const port = this.config.basePort + workerId;
        const workerInfo = {
            id: workerId,
            port: port,
            process: null,
            socket: null,
            status: 'starting',
            startTime: Date.now(),
            requestCount: 0,
            errorCount: 0,
            averageLatency: 0,
            isHealthy: true,
            lastHealthCheck: Date.now()
        };

        try {
            // Spawn Python worker process
            const args = [
                this.config.workerScript,
                '--port', port.toString(),
                '--device', this.config.device
            ];
            
            if (this.config.modelPath) {
                args.push('--model', this.config.modelPath);
            }
            
            workerInfo.process = spawn(this.config.pythonPath, args, {
                stdio: ['ignore', 'pipe', 'pipe'],
                env: { ...process.env, PYTHONUNBUFFERED: '1' }
            });
            
            // Handle process events
            workerInfo.process.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`🔧 Worker ${workerId}: ${output}`);
                }
            });
            
            workerInfo.process.stderr.on('data', (data) => {
                const error = data.toString().trim();
                if (error) {
                    console.error(`❌ Worker ${workerId} error: ${error}`);
                    this.handleWorkerError(workerId, error);
                }
            });
            
            workerInfo.process.on('exit', (code, signal) => {
                console.log(`🛑 Worker ${workerId} exited with code ${code}, signal ${signal}`);
                this.handleWorkerExit(workerId, code, signal);
            });
            
            // Wait for worker to be ready
            await this.waitForWorkerReady(workerId, port);
            
            // Create ZeroMQ connection
            workerInfo.socket = new zmq.Request();
            await workerInfo.socket.connect(`tcp://localhost:${port}`);
            
            workerInfo.status = 'ready';
            workerInfo.isHealthy = true;
            this.workers.set(workerId, workerInfo);
            this.workerQueue.push(workerId);
            
            console.log(`✅ Worker ${workerId} ready on port ${port}`);
            this.stats.workersSpawned++;
            
            // Start health monitoring for this worker
            this.startWorkerHealthCheck(workerId);
            
            return workerInfo;
            
        } catch (error) {
            console.error(`❌ Failed to spawn worker ${workerId}:`, error);
            if (workerInfo.process) {
                workerInfo.process.kill();
            }
            throw error;
        }
    }

    async waitForWorkerReady(workerId, port, maxWait = 10000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            try {
                // Try to connect to worker
                const testSocket = new zmq.Request();
                await testSocket.connect(`tcp://localhost:${port}`);
                
                // Send test message
                await testSocket.send(JSON.stringify({
                    command: 'get_stats'
                }));
                
                // Wait for response with timeout
                const response = await Promise.race([
                    testSocket.receive(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 1000)
                    )
                ]);
                
                testSocket.close();
                
                if (response) {
                    console.log(`🟢 Worker ${workerId} health check passed`);
                    return true;
                }
                
            } catch (error) {
                // Worker not ready yet, wait and retry
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        throw new Error(`Worker ${workerId} failed to start within ${maxWait}ms`);
    }

    /**
     * Process frame with championship-level analysis
     * @param {Buffer|string} frameData - Frame data (Buffer, base64, or file path)
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Analysis results with Austin's insights
     */
    async processFrame(frameData, options = {}) {
        const requestId = uuidv4();
        const startTime = Date.now();
        
        try {
            // Validate inputs
            if (!frameData) {
                throw new Error('No frame data provided');
            }
            
            // Process frame data
            const processedFrame = await this.preprocessFrame(frameData);
            
            // Get available worker
            const workerId = await this.getAvailableWorker();
            if (workerId === null) {
                throw new Error('No available workers');
            }
            
            // Create request
            const request = {
                id: requestId,
                workerId,
                startTime,
                options: {
                    sport: options.sport || this.config.sportsConfig.defaultSport,
                    expertiseLevel: options.expertiseLevel || this.config.sportsConfig.defaultExpertise,
                    analysisTypes: options.analysisTypes || [
                        'player_detection',
                        'formation_analysis',
                        'austin_insights'
                    ],
                    confidence: options.confidence || 0.75,
                    austinMode: options.austinMode !== false,
                    championshipLevel: options.championshipLevel !== false,
                    ...options
                }
            };
            
            this.activeRequests.set(requestId, request);
            
            // Send request to worker
            const result = await this.sendWorkerRequest(workerId, {
                command: 'process_frame',
                frame_data: processedFrame.encoded,
                sport: request.options.sport,
                options: request.options
            });
            
            const processingTime = Date.now() - startTime;
            const championshipStandard = processingTime <= this.config.championshipTargets.maxLatencyMs;
            
            // Update statistics
            this.updateStats(processingTime, true, championshipStandard);
            
            // Clean up
            this.activeRequests.delete(requestId);
            this.releaseWorker(workerId);
            
            // Add metadata to result
            const enrichedResult = {
                ...result,
                requestId,
                totalProcessingTime: processingTime,
                championshipStandardMet: championshipStandard,
                austinExpertiseApplied: request.options.austinMode,
                service: 'visual_inference_service',
                timestamp: Date.now(),
                
                // Performance context
                performanceContext: {
                    workerUsed: workerId,
                    targetLatency: this.config.championshipTargets.maxLatencyMs,
                    actualLatency: processingTime,
                    performanceRatio: processingTime / this.config.championshipTargets.maxLatencyMs,
                    championshipCompliant: championshipStandard
                },
                
                // Austin's championship validation
                championshipValidation: {
                    latencyCompliant: championshipStandard,
                    expertiseLevel: request.options.expertiseLevel,
                    sportsSpecialty: request.options.sport,
                    austinApproved: championshipStandard && result.success
                }
            };
            
            console.log(`🏆 Frame processed: ${processingTime}ms (${championshipStandard ? 'Championship ✅' : 'Exceeded target ⚠️'})`);
            
            return enrichedResult;
            
        } catch (error) {
            const processingTime = Date.now() - startTime;
            
            // Update error statistics
            this.updateStats(processingTime, false, false);
            
            // Clean up
            this.activeRequests.delete(requestId);
            if (request && request.workerId !== undefined) {
                this.releaseWorker(request.workerId);
            }
            
            console.error(`❌ Frame processing failed (${processingTime}ms):`, error.message);
            
            return {
                success: false,
                requestId,
                error: error.message,
                processingTime,
                timestamp: Date.now(),
                service: 'visual_inference_service',
                championshipValidation: {
                    latencyCompliant: false,
                    expertiseLevel: 'error',
                    austinApproved: false
                }
            };
        }
    }

    async preprocessFrame(frameData) {
        try {
            let buffer;
            
            if (Buffer.isBuffer(frameData)) {
                buffer = frameData;
            } else if (typeof frameData === 'string') {
                if (frameData.startsWith('data:')) {
                    // Base64 data URL
                    const base64Data = frameData.split(',')[1];
                    buffer = Buffer.from(base64Data, 'base64');
                } else if (frameData.startsWith('/') || frameData.includes('\\')) {
                    // File path
                    buffer = await fs.promises.readFile(frameData);
                } else {
                    // Plain base64
                    buffer = Buffer.from(frameData, 'base64');
                }
            } else {
                throw new Error('Invalid frame data format');
            }
            
            // Optimize frame for processing
            const optimized = await sharp(buffer)
                .jpeg({ quality: 90 })
                .resize(640, 640, { fit: 'inside', withoutEnlargement: false })
                .toBuffer();
            
            return {
                buffer: optimized,
                encoded: optimized.toString('hex'),
                size: optimized.length
            };
            
        } catch (error) {
            throw new Error(`Frame preprocessing failed: ${error.message}`);
        }
    }

    async getAvailableWorker() {
        const maxWait = 5000; // 5 seconds
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            // Check for available worker in queue
            if (this.workerQueue.length > 0) {
                const workerId = this.workerQueue.shift();
                const worker = this.workers.get(workerId);
                
                if (worker && worker.status === 'ready' && worker.isHealthy) {
                    worker.status = 'busy';
                    return workerId;
                }
            }
            
            // Wait briefly before retrying
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        return null; // No workers available
    }

    releaseWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (worker && worker.status === 'busy') {
            worker.status = 'ready';
            this.workerQueue.push(workerId);
        }
    }

    async sendWorkerRequest(workerId, message) {
        const worker = this.workers.get(workerId);
        if (!worker || !worker.socket) {
            throw new Error(`Worker ${workerId} not available`);
        }
        
        try {
            // Send request with timeout
            await worker.socket.send(JSON.stringify(message));
            
            const response = await Promise.race([
                worker.socket.receive(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Worker timeout')), this.config.requestTimeout)
                )
            ]);
            
            const result = JSON.parse(response.toString());
            
            // Update worker metrics
            worker.requestCount++;
            worker.lastHealthCheck = Date.now();
            
            if (!result.success) {
                worker.errorCount++;
            }
            
            return result;
            
        } catch (error) {
            worker.errorCount++;
            console.error(`❌ Worker ${workerId} request failed:`, error.message);
            throw error;
        }
    }

    startWorkerHealthCheck(workerId) {
        const worker = this.workers.get(workerId);
        if (!worker) return;
        
        const healthCheckInterval = setInterval(async () => {
            try {
                if (worker.status === 'ready' && worker.socket) {
                    const stats = await this.sendWorkerRequest(workerId, {
                        command: 'get_stats'
                    });
                    
                    if (stats.success) {
                        worker.isHealthy = true;
                        worker.lastHealthCheck = Date.now();
                        this.loadBalancer.performanceMetrics.set(workerId, stats.stats);
                    } else {
                        worker.isHealthy = false;
                    }
                }
            } catch (error) {
                worker.isHealthy = false;
                console.warn(`⚠️  Worker ${workerId} health check failed: ${error.message}`);
                
                // Consider restarting worker if multiple failures
                if (worker.errorCount > 5) {
                    console.log(`🔄 Restarting unhealthy worker ${workerId}`);
                    this.restartWorker(workerId);
                }
            }
        }, 5000); // Health check every 5 seconds
        
        this.loadBalancer.healthChecks.set(workerId, healthCheckInterval);
    }

    async restartWorker(workerId) {
        try {
            console.log(`🔄 Restarting worker ${workerId}...`);
            
            // Stop existing worker
            const oldWorker = this.workers.get(workerId);
            if (oldWorker) {
                if (oldWorker.socket) {
                    try {
                        await oldWorker.socket.send(JSON.stringify({ command: 'shutdown' }));
                    } catch (e) {
                        // Ignore shutdown errors
                    }
                    oldWorker.socket.close();
                }
                
                if (oldWorker.process) {
                    oldWorker.process.kill();
                }
                
                // Clear health check
                const healthCheck = this.loadBalancer.healthChecks.get(workerId);
                if (healthCheck) {
                    clearInterval(healthCheck);
                    this.loadBalancer.healthChecks.delete(workerId);
                }
            }
            
            this.workers.delete(workerId);
            
            // Wait before restarting
            await new Promise(resolve => setTimeout(resolve, this.config.restartDelay));
            
            // Spawn new worker
            await this.spawnWorker(workerId);
            
            this.stats.workersRestarted++;
            console.log(`✅ Worker ${workerId} restarted successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to restart worker ${workerId}:`, error);
        }
    }

    handleWorkerError(workerId, error) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.errorCount++;
            worker.isHealthy = false;
        }
        
        this.emit('workerError', { workerId, error });
    }

    handleWorkerExit(workerId, code, signal) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.status = 'exited';
            worker.isHealthy = false;
        }
        
        this.emit('workerExit', { workerId, code, signal });
        
        // Auto-restart worker if unexpected exit
        if (code !== 0) {
            setTimeout(() => {
                this.restartWorker(workerId);
            }, this.config.restartDelay);
        }
    }

    updateStats(processingTime, success, championshipStandard) {
        this.stats.totalRequests++;
        
        if (success) {
            this.stats.successfulRequests++;
        } else {
            this.stats.failedRequests++;
        }
        
        if (championshipStandard) {
            this.stats.championshipStandardsMet++;
        }
        
        // Update latency metrics
        this.stats.averageLatency = (
            (this.stats.averageLatency * (this.stats.totalRequests - 1)) + processingTime
        ) / this.stats.totalRequests;
        
        if (processingTime > this.stats.peakLatency) {
            this.stats.peakLatency = processingTime;
        }
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            const now = Date.now();
            const timeSinceLastCheck = now - this.stats.lastPerformanceCheck;
            
            // Calculate performance metrics
            const successRate = this.stats.successfulRequests / Math.max(this.stats.totalRequests, 1);
            const championshipRate = this.stats.championshipStandardsMet / Math.max(this.stats.totalRequests, 1);
            
            // Log performance summary
            console.log(`📊 Performance Summary (${Math.round(timeSinceLastCheck/1000)}s):`);
            console.log(`   Requests: ${this.stats.totalRequests} | Success: ${(successRate*100).toFixed(1)}%`);
            console.log(`   Avg Latency: ${this.stats.averageLatency.toFixed(1)}ms | Peak: ${this.stats.peakLatency}ms`);
            console.log(`   Championship Standard: ${(championshipRate*100).toFixed(1)}%`);
            console.log(`   Active Workers: ${this.workers.size} | Available: ${this.workerQueue.length}`);
            
            this.stats.lastPerformanceCheck = now;
            
            // Emit performance data
            this.emit('performanceUpdate', {
                timestamp: now,
                stats: { ...this.stats },
                successRate,
                championshipRate,
                activeWorkers: this.workers.size,
                availableWorkers: this.workerQueue.length
            });
            
        }, 30000); // Report every 30 seconds
    }

    startRequestProcessing() {
        // This would handle queued requests if needed
        // For now, requests are processed immediately
    }

    /**
     * Get service performance statistics
     * @returns {Object} Performance statistics and health metrics
     */
    getStats() {
        const healthyWorkers = Array.from(this.workers.values()).filter(w => w.isHealthy).length;
        
        return {
            service: 'visual_inference_service',
            timestamp: Date.now(),
            
            // Core statistics
            stats: { ...this.stats },
            
            // Worker information
            workers: {
                total: this.workers.size,
                healthy: healthyWorkers,
                available: this.workerQueue.length,
                busy: this.workers.size - this.workerQueue.length
            },
            
            // Performance metrics
            performance: {
                successRate: this.stats.successfulRequests / Math.max(this.stats.totalRequests, 1),
                championshipRate: this.stats.championshipStandardsMet / Math.max(this.stats.totalRequests, 1),
                averageLatency: this.stats.averageLatency,
                peakLatency: this.stats.peakLatency,
                targetLatency: this.config.championshipTargets.maxLatencyMs
            },
            
            // Austin's championship validation
            championshipStatus: {
                latencyCompliant: this.stats.averageLatency <= this.config.championshipTargets.maxLatencyMs,
                reliabilityCompliant: (this.stats.successfulRequests / Math.max(this.stats.totalRequests, 1)) >= 0.99,
                austinApproved: healthyWorkers >= Math.ceil(this.config.maxWorkers * 0.8)
            }
        };
    }

    async shutdown() {
        console.log('🛑 Shutting down Visual Inference Service...');
        
        try {
            // Stop all workers
            const shutdownPromises = Array.from(this.workers.keys()).map(workerId => {
                return this.shutdownWorker(workerId);
            });
            
            await Promise.allSettled(shutdownPromises);
            
            // Clear health checks
            this.loadBalancer.healthChecks.forEach(interval => clearInterval(interval));
            this.loadBalancer.healthChecks.clear();
            
            console.log('✅ Visual Inference Service shutdown complete');
            
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        }
    }

    async shutdownWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (!worker) return;
        
        try {
            // Send shutdown command
            if (worker.socket) {
                await worker.socket.send(JSON.stringify({ command: 'shutdown' }));
                worker.socket.close();
            }
            
            // Kill process if still running
            if (worker.process && !worker.process.killed) {
                worker.process.kill();
            }
            
            this.workers.delete(workerId);
            
        } catch (error) {
            console.error(`❌ Error shutting down worker ${workerId}:`, error);
        }
    }
}

export default VisualInferenceService;