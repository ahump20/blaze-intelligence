// Scalability Infrastructure
// Blaze Intelligence Enterprise Auto-Scaling System
// Global CDN with Championship-Level Performance

import cluster from 'cluster';
import os from 'os';
import Redis from 'ioredis';
import nginx from 'nginx-conf';

class ScalabilityInfrastructure {
  constructor() {
    this.config = {
      clustering: {
        enabled: true,
        maxWorkers: os.cpus().length,
        gracefulShutdownTimeout: 30000,
        workerMemoryLimit: 512, // MB
        restartOnMemoryExceeded: true
      },
      loadBalancing: {
        algorithm: 'round_robin', // round_robin, least_connections, ip_hash
        healthCheckInterval: 30000,
        maxRetries: 3,
        timeout: 5000,
        stickySession: true
      },
      autoScaling: {
        enabled: true,
        minInstances: 2,
        maxInstances: 10,
        scaleUpThreshold: 70, // CPU percentage
        scaleDownThreshold: 30,
        cooldownPeriod: 300000, // 5 minutes
        metrics: ['cpu', 'memory', 'responseTime', 'errorRate']
      },
      cdn: {
        provider: 'cloudflare',
        cacheStrategy: 'aggressive',
        compressionEnabled: true,
        imageOptimization: true,
        globalPops: true,
        cacheTtl: {
          static: 31536000, // 1 year
          api: 300, // 5 minutes
          dynamic: 60 // 1 minute
        }
      },
      caching: {
        redis: {
          enabled: true,
          cluster: true,
          nodes: process.env.REDIS_CLUSTER_NODES?.split(',') || ['localhost:6379'],
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100
        },
        levels: {
          application: true, // In-memory cache
          distributed: true, // Redis cache
          cdn: true, // Edge cache
          browser: true // Client-side cache
        }
      },
      monitoring: {
        metricsInterval: 10000, // 10 seconds
        alertThresholds: {
          cpuUsage: 80,
          memoryUsage: 85,
          responseTime: 1000, // ms
          errorRate: 5, // percentage
          diskUsage: 80
        },
        apdex: {
          target: 100, // ms
          tolerance: 400 // ms
        }
      }
    };

    this.metrics = {
      requests: {
        total: 0,
        perSecond: 0,
        responseTime: [],
        errors: 0
      },
      system: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkIO: { in: 0, out: 0 }
      },
      scaling: {
        currentInstances: 1,
        scalingEvents: [],
        lastScaleTime: null
      }
    };

    this.redisCluster = null;
    this.loadBalancer = null;

    this.init();
  }

  async init() {
    try {
      // Initialize Redis cluster for distributed caching
      await this.initializeRedisCluster();

      // Setup clustering if enabled
      if (this.config.clustering.enabled) {
        await this.setupClustering();
      }

      // Initialize load balancer
      await this.initializeLoadBalancer();

      // Setup auto-scaling
      if (this.config.autoScaling.enabled) {
        this.setupAutoScaling();
      }

      // Configure CDN
      await this.configureCDN();

      // Start monitoring
      this.startMonitoring();

      console.log('🚀 Scalability infrastructure initialized successfully');

    } catch (error) {
      console.error('Failed to initialize scalability infrastructure:', error);
      throw error;
    }
  }

  async initializeRedisCluster() {
    if (!this.config.caching.redis.enabled) return;

    try {
      this.redisCluster = new Redis.Cluster(this.config.caching.redis.nodes, {
        scaleReads: 'slave',
        maxRetriesPerRequest: this.config.caching.redis.maxRetriesPerRequest,
        retryDelayOnFailover: this.config.caching.redis.retryDelayOnFailover,
        enableOfflineQueue: false,
        lazyConnect: true,
        redisOptions: {
          password: process.env.REDIS_PASSWORD,
          connectTimeout: 10000,
          commandTimeout: 5000
        }
      });

      // Test connection
      await this.redisCluster.ping();
      console.log('✅ Redis cluster connected successfully');

      // Setup event handlers
      this.redisCluster.on('error', (error) => {
        console.error('Redis cluster error:', error);
        this.handleRedisError(error);
      });

      this.redisCluster.on('connect', () => {
        console.log('Redis cluster connected');
      });

      this.redisCluster.on('ready', () => {
        console.log('Redis cluster ready');
      });

    } catch (error) {
      console.error('Redis cluster initialization failed:', error);
      // Fallback to single Redis instance
      this.redisCluster = new Redis({
        host: 'localhost',
        port: 6379,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      });
    }
  }

  async setupClustering() {
    if (cluster.isMaster) {
      console.log(`🔧 Master process ${process.pid} starting`);

      // Fork workers
      const numWorkers = Math.min(
        this.config.clustering.maxWorkers,
        os.cpus().length
      );

      for (let i = 0; i < numWorkers; i++) {
        this.forkWorker();
      }

      // Handle worker events
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);

        if (!worker.exitedAfterDisconnect) {
          console.log('Starting a new worker...');
          this.forkWorker();
        }
      });

      // Handle worker messages
      cluster.on('message', (worker, message) => {
        this.handleWorkerMessage(worker, message);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        this.gracefulShutdown();
      });

      process.on('SIGINT', () => {
        this.gracefulShutdown();
      });

    } else {
      // Worker process
      console.log(`🔧 Worker process ${process.pid} starting`);

      // Monitor worker memory usage
      if (this.config.clustering.restartOnMemoryExceeded) {
        this.monitorWorkerMemory();
      }

      // Start the application server
      await this.startApplicationServer();
    }
  }

  forkWorker() {
    const worker = cluster.fork();

    // Set up worker monitoring
    worker.on('message', (message) => {
      if (message.type === 'metrics') {
        this.updateWorkerMetrics(worker.id, message.data);
      }
    });

    return worker;
  }

  monitorWorkerMemory() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const memUsageMB = memUsage.heapUsed / 1024 / 1024;

      if (memUsageMB > this.config.clustering.workerMemoryLimit) {
        console.log(`Worker ${process.pid} memory limit exceeded: ${memUsageMB}MB`);

        // Graceful worker shutdown
        process.send?.({
          type: 'memory_exceeded',
          pid: process.pid,
          memoryUsage: memUsageMB
        });

        setTimeout(() => {
          process.exit(0);
        }, this.config.clustering.gracefulShutdownTimeout);
      }
    }, 30000); // Check every 30 seconds
  }

  async initializeLoadBalancer() {
    this.loadBalancer = new LoadBalancer({
      algorithm: this.config.loadBalancing.algorithm,
      healthCheck: {
        interval: this.config.loadBalancing.healthCheckInterval,
        timeout: this.config.loadBalancing.timeout,
        maxRetries: this.config.loadBalancing.maxRetries
      },
      stickySession: this.config.loadBalancing.stickySession
    });

    // Add backend servers
    const backends = await this.discoverBackendServers();
    backends.forEach(backend => {
      this.loadBalancer.addBackend(backend);
    });

    // Start health checks
    this.loadBalancer.startHealthChecks();

    console.log('✅ Load balancer initialized');
  }

  setupAutoScaling() {
    setInterval(() => {
      this.evaluateScalingDecision();
    }, 60000); // Check every minute

    console.log('✅ Auto-scaling enabled');
  }

  async evaluateScalingDecision() {
    try {
      const metrics = await this.collectSystemMetrics();
      const shouldScale = this.shouldScale(metrics);

      if (shouldScale.scale && this.canScale(shouldScale.direction)) {
        await this.executeScaling(shouldScale.direction, shouldScale.reason);
      }

    } catch (error) {
      console.error('Auto-scaling evaluation failed:', error);
    }
  }

  shouldScale(metrics) {
    const { cpuUsage, memoryUsage, responseTime, errorRate } = metrics;

    // Scale up conditions
    if (
      cpuUsage > this.config.autoScaling.scaleUpThreshold ||
      memoryUsage > this.config.autoScaling.scaleUpThreshold ||
      responseTime > this.config.monitoring.alertThresholds.responseTime ||
      errorRate > this.config.monitoring.alertThresholds.errorRate
    ) {
      return {
        scale: true,
        direction: 'up',
        reason: `High resource usage: CPU ${cpuUsage}%, Memory ${memoryUsage}%, RT ${responseTime}ms, Errors ${errorRate}%`
      };
    }

    // Scale down conditions
    if (
      cpuUsage < this.config.autoScaling.scaleDownThreshold &&
      memoryUsage < this.config.autoScaling.scaleDownThreshold &&
      responseTime < 200 &&
      errorRate < 1 &&
      this.metrics.scaling.currentInstances > this.config.autoScaling.minInstances
    ) {
      return {
        scale: true,
        direction: 'down',
        reason: `Low resource usage: CPU ${cpuUsage}%, Memory ${memoryUsage}%`
      };
    }

    return { scale: false };
  }

  canScale(direction) {
    const { currentInstances } = this.metrics.scaling;
    const { minInstances, maxInstances, cooldownPeriod } = this.config.autoScaling;

    // Check instance limits
    if (direction === 'up' && currentInstances >= maxInstances) {
      return false;
    }

    if (direction === 'down' && currentInstances <= minInstances) {
      return false;
    }

    // Check cooldown period
    const now = Date.now();
    const lastScaleTime = this.metrics.scaling.lastScaleTime;

    if (lastScaleTime && (now - lastScaleTime) < cooldownPeriod) {
      return false;
    }

    return true;
  }

  async executeScaling(direction, reason) {
    try {
      console.log(`🔄 Executing ${direction} scaling: ${reason}`);

      const result = direction === 'up' ?
        await this.scaleUp() :
        await this.scaleDown();

      if (result.success) {
        this.metrics.scaling.lastScaleTime = Date.now();
        this.metrics.scaling.scalingEvents.push({
          timestamp: new Date().toISOString(),
          direction,
          reason,
          oldInstances: this.metrics.scaling.currentInstances,
          newInstances: result.newInstanceCount
        });

        this.metrics.scaling.currentInstances = result.newInstanceCount;

        console.log(`✅ Scaling ${direction} completed: ${result.newInstanceCount} instances`);
      }

    } catch (error) {
      console.error(`Scaling ${direction} failed:`, error);
    }
  }

  async scaleUp() {
    // Add new instance/worker
    if (cluster.isMaster) {
      this.forkWorker();
      return {
        success: true,
        newInstanceCount: Object.keys(cluster.workers).length
      };
    }

    // For cloud deployments, this would trigger container/VM creation
    return { success: true, newInstanceCount: this.metrics.scaling.currentInstances + 1 };
  }

  async scaleDown() {
    // Remove instance/worker
    if (cluster.isMaster) {
      const workers = Object.values(cluster.workers);
      if (workers.length > 1) {
        const workerToKill = workers[workers.length - 1];
        workerToKill.disconnect();

        setTimeout(() => {
          workerToKill.kill();
        }, this.config.clustering.gracefulShutdownTimeout);

        return {
          success: true,
          newInstanceCount: workers.length - 1
        };
      }
    }

    return { success: true, newInstanceCount: this.metrics.scaling.currentInstances - 1 };
  }

  async configureCDN() {
    const cdnConfig = {
      // Cloudflare configuration
      zones: [{
        name: 'blaze-intelligence.com',
        settings: {
          cache_level: 'aggressive',
          browser_cache_ttl: this.config.cdn.cacheTtl.static,
          edge_cache_ttl: this.config.cdn.cacheTtl.api,
          compression: this.config.cdn.compressionEnabled,
          minify: {
            css: true,
            js: true,
            html: true
          },
          image_optimization: this.config.cdn.imageOptimization,
          http2: true,
          http3: true,
          security: {
            waf: true,
            ddos_protection: true,
            bot_management: true
          }
        }
      }],

      // Cache rules
      page_rules: [
        {
          targets: [{ target: 'url', constraint: { operator: 'matches', value: '*/api/analytics/*' }}],
          actions: [
            { id: 'cache_level', value: 'cache_everything' },
            { id: 'edge_cache_ttl', value: this.config.cdn.cacheTtl.api }
          ]
        },
        {
          targets: [{ target: 'url', constraint: { operator: 'matches', value: '*/static/*' }}],
          actions: [
            { id: 'cache_level', value: 'cache_everything' },
            { id: 'edge_cache_ttl', value: this.config.cdn.cacheTtl.static }
          ]
        }
      ],

      // Workers for edge computing
      workers: [
        {
          name: 'analytics-processor',
          script: this.generateAnalyticsWorkerScript(),
          routes: ['*/api/analytics/*']
        },
        {
          name: 'auth-validator',
          script: this.generateAuthWorkerScript(),
          routes: ['*/api/*']
        }
      ]
    };

    // Apply CDN configuration
    await this.applyCDNConfiguration(cdnConfig);

    console.log('✅ CDN configured successfully');
  }

  generateAnalyticsWorkerScript() {
    return `
      addEventListener('fetch', event => {
        event.respondWith(handleAnalyticsRequest(event.request))
      })

      async function handleAnalyticsRequest(request) {
        const cache = caches.default
        const cacheKey = new Request(request.url, request)

        // Check cache first
        let response = await cache.match(cacheKey)

        if (!response) {
          // Process analytics request
          response = await processAnalytics(request)

          // Cache the response
          if (response.status === 200) {
            const cacheResponse = response.clone()
            event.waitUntil(cache.put(cacheKey, cacheResponse))
          }
        }

        return response
      }

      async function processAnalytics(request) {
        // Enhanced analytics processing at edge
        const url = new URL(request.url)
        const team = url.pathname.split('/')[3]

        // Real-time data aggregation
        const analytics = await aggregateTeamData(team)

        return new Response(JSON.stringify(analytics), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
            'X-Edge-Cache': 'HIT'
          }
        })
      }
    `;
  }

  generateAuthWorkerScript() {
    return `
      addEventListener('fetch', event => {
        event.respondWith(handleAuthRequest(event.request))
      })

      async function handleAuthRequest(request) {
        const authHeader = request.headers.get('Authorization')

        if (!authHeader) {
          return new Response('Unauthorized', { status: 401 })
        }

        // Validate JWT at edge
        const isValid = await validateJWTAtEdge(authHeader)

        if (!isValid) {
          return new Response('Invalid token', { status: 401 })
        }

        // Forward to origin
        return fetch(request)
      }
    `;
  }

  // Caching Layer Implementation
  createCacheManager() {
    return {
      // Application-level cache (in-memory)
      applicationCache: new Map(),

      // Distributed cache (Redis)
      distributedCache: this.redisCluster,

      // Multi-level get
      async get(key, level = 'all') {
        // Try application cache first
        if (level === 'all' || level === 'application') {
          const appCacheValue = this.applicationCache.get(key);
          if (appCacheValue && !this.isCacheExpired(appCacheValue)) {
            return appCacheValue.data;
          }
        }

        // Try distributed cache
        if ((level === 'all' || level === 'distributed') && this.distributedCache) {
          try {
            const distCacheValue = await this.distributedCache.get(key);
            if (distCacheValue) {
              const parsed = JSON.parse(distCacheValue);

              // Populate application cache
              if (level === 'all') {
                this.applicationCache.set(key, {
                  data: parsed.data,
                  expires: parsed.expires
                });
              }

              return parsed.data;
            }
          } catch (error) {
            console.error('Distributed cache error:', error);
          }
        }

        return null;
      },

      // Multi-level set
      async set(key, data, ttl = 300000) {
        const expires = Date.now() + ttl;
        const cacheEntry = { data, expires };

        // Set in application cache
        if (this.config.caching.levels.application) {
          this.applicationCache.set(key, cacheEntry);
        }

        // Set in distributed cache
        if (this.config.caching.levels.distributed && this.distributedCache) {
          try {
            await this.distributedCache.setex(
              key,
              Math.floor(ttl / 1000),
              JSON.stringify(cacheEntry)
            );
          } catch (error) {
            console.error('Distributed cache set error:', error);
          }
        }
      },

      // Cache invalidation
      async invalidate(pattern) {
        // Clear application cache
        if (pattern === '*') {
          this.applicationCache.clear();
        } else {
          for (const key of this.applicationCache.keys()) {
            if (key.includes(pattern)) {
              this.applicationCache.delete(key);
            }
          }
        }

        // Clear distributed cache
        if (this.distributedCache) {
          try {
            const keys = await this.distributedCache.keys(pattern);
            if (keys.length > 0) {
              await this.distributedCache.del(...keys);
            }
          } catch (error) {
            console.error('Distributed cache invalidation error:', error);
          }
        }
      },

      isCacheExpired(cacheEntry) {
        return Date.now() > cacheEntry.expires;
      }
    };
  }

  // Monitoring and Metrics
  startMonitoring() {
    setInterval(() => {
      this.collectAndReportMetrics();
    }, this.config.monitoring.metricsInterval);

    console.log('✅ Monitoring started');
  }

  async collectSystemMetrics() {
    const cpuUsage = await this.getCPUUsage();
    const memoryUsage = this.getMemoryUsage();
    const diskUsage = await this.getDiskUsage();
    const networkIO = await this.getNetworkIO();

    return {
      cpuUsage,
      memoryUsage,
      diskUsage,
      networkIO,
      responseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate()
    };
  }

  async collectAndReportMetrics() {
    try {
      const systemMetrics = await this.collectSystemMetrics();
      const applicationMetrics = this.getApplicationMetrics();

      // Update internal metrics
      Object.assign(this.metrics.system, systemMetrics);
      Object.assign(this.metrics.requests, applicationMetrics);

      // Check alert thresholds
      this.checkAlertThresholds(systemMetrics);

      // Report to monitoring service
      await this.reportMetrics({
        timestamp: new Date().toISOString(),
        system: systemMetrics,
        application: applicationMetrics,
        scaling: this.metrics.scaling
      });

    } catch (error) {
      console.error('Metrics collection failed:', error);
    }
  }

  checkAlertThresholds(metrics) {
    const { alertThresholds } = this.config.monitoring;

    Object.entries(alertThresholds).forEach(([metric, threshold]) => {
      if (metrics[metric] > threshold) {
        this.triggerAlert(metric, metrics[metric], threshold);
      }
    });
  }

  triggerAlert(metric, value, threshold) {
    const alert = {
      timestamp: new Date().toISOString(),
      metric,
      value,
      threshold,
      severity: value > threshold * 1.5 ? 'critical' : 'warning'
    };

    console.warn(`🚨 Alert: ${metric} is ${value} (threshold: ${threshold})`);

    // Send to alerting system
    this.sendAlert(alert);
  }

  // Utility methods
  getCPUUsage() {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = process.hrtime();

      setTimeout(() => {
        const currentUsage = process.cpuUsage(startUsage);
        const currentTime = process.hrtime(startTime);

        const elapTimeMS = currentTime[0] * 1000 + currentTime[1] / 1e6;
        const elapUserMS = currentUsage.user / 1000;
        const elapSystMS = currentUsage.system / 1000;

        const cpuPercent = Math.round(((elapUserMS + elapSystMS) / elapTimeMS) * 100);
        resolve(cpuPercent);
      }, 100);
    });
  }

  getMemoryUsage() {
    const usage = process.memoryUsage();
    return Math.round((usage.heapUsed / usage.heapTotal) * 100);
  }

  async getDiskUsage() {
    // Implement disk usage check
    return 50; // Mock value
  }

  async getNetworkIO() {
    // Implement network I/O monitoring
    return { in: 0, out: 0 }; // Mock values
  }

  getAverageResponseTime() {
    const times = this.metrics.requests.responseTime;
    if (times.length === 0) return 0;

    const sum = times.reduce((a, b) => a + b, 0);
    return Math.round(sum / times.length);
  }

  getErrorRate() {
    const { total, errors } = this.metrics.requests;
    return total > 0 ? Math.round((errors / total) * 100) : 0;
  }

  getApplicationMetrics() {
    return {
      requestsPerSecond: this.metrics.requests.perSecond,
      totalRequests: this.metrics.requests.total,
      errorRate: this.getErrorRate(),
      averageResponseTime: this.getAverageResponseTime()
    };
  }

  // Express.js middleware for metrics collection
  createMetricsMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;

        // Update metrics
        this.metrics.requests.total++;
        this.metrics.requests.responseTime.push(responseTime);

        // Keep only last 1000 response times
        if (this.metrics.requests.responseTime.length > 1000) {
          this.metrics.requests.responseTime.shift();
        }

        // Count errors
        if (res.statusCode >= 400) {
          this.metrics.requests.errors++;
        }

        // Calculate requests per second
        this.updateRequestsPerSecond();
      });

      next();
    };
  }

  updateRequestsPerSecond() {
    // Simple implementation - would be more sophisticated in production
    const now = Date.now();
    if (!this.lastRequestCount) {
      this.lastRequestCount = { time: now, count: this.metrics.requests.total };
      return;
    }

    const timeDiff = (now - this.lastRequestCount.time) / 1000;
    const requestDiff = this.metrics.requests.total - this.lastRequestCount.count;

    if (timeDiff >= 1) {
      this.metrics.requests.perSecond = Math.round(requestDiff / timeDiff);
      this.lastRequestCount = { time: now, count: this.metrics.requests.total };
    }
  }

  // Graceful shutdown
  gracefulShutdown() {
    console.log('Starting graceful shutdown...');

    // Stop accepting new connections
    if (this.loadBalancer) {
      this.loadBalancer.drain();
    }

    // Disconnect workers
    Object.values(cluster.workers).forEach(worker => {
      worker.disconnect();
    });

    // Set shutdown timeout
    setTimeout(() => {
      console.log('Force shutdown');
      process.exit(1);
    }, this.config.clustering.gracefulShutdownTimeout);

    // Wait for workers to finish
    let workersAlive = Object.keys(cluster.workers).length;
    const checkInterval = setInterval(() => {
      workersAlive = Object.keys(cluster.workers).length;
      if (workersAlive === 0) {
        console.log('All workers shut down, exiting master');
        clearInterval(checkInterval);
        process.exit(0);
      }
    }, 1000);
  }

  // Helper methods (implement based on your infrastructure)
  async discoverBackendServers() {
    // Discover available backend servers
    return [
      { host: 'localhost', port: 3001, weight: 1 },
      { host: 'localhost', port: 3002, weight: 1 }
    ];
  }

  async applyCDNConfiguration(config) {
    // Apply CDN configuration via API
    console.log('Applying CDN configuration...');
  }

  async reportMetrics(metrics) {
    // Send metrics to monitoring service
    console.log('Reporting metrics:', JSON.stringify(metrics, null, 2));
  }

  async sendAlert(alert) {
    // Send alert to notification service
    console.log('Alert:', JSON.stringify(alert, null, 2));
  }

  handleRedisError(error) {
    console.error('Redis error handled:', error.message);
    // Implement Redis failover logic
  }

  handleWorkerMessage(worker, message) {
    console.log(`Message from worker ${worker.id}:`, message);
  }

  async startApplicationServer() {
    // Start your Express.js application here
    console.log(`Application server started on worker ${process.pid}`);
  }
}

// Load Balancer Implementation
class LoadBalancer {
  constructor(config) {
    this.config = config;
    this.backends = [];
    this.currentIndex = 0;
    this.healthCheckInterval = null;
  }

  addBackend(backend) {
    this.backends.push({
      ...backend,
      healthy: true,
      connections: 0,
      responseTime: 0,
      lastHealthCheck: null
    });
  }

  removeBackend(backend) {
    this.backends = this.backends.filter(b =>
      b.host !== backend.host || b.port !== backend.port
    );
  }

  getNextBackend() {
    const healthyBackends = this.backends.filter(b => b.healthy);

    if (healthyBackends.length === 0) {
      throw new Error('No healthy backends available');
    }

    switch (this.config.algorithm) {
      case 'round_robin':
        return this.roundRobinSelection(healthyBackends);

      case 'least_connections':
        return this.leastConnectionsSelection(healthyBackends);

      case 'ip_hash':
        return this.ipHashSelection(healthyBackends);

      default:
        return healthyBackends[0];
    }
  }

  roundRobinSelection(backends) {
    const backend = backends[this.currentIndex % backends.length];
    this.currentIndex++;
    return backend;
  }

  leastConnectionsSelection(backends) {
    return backends.reduce((prev, current) =>
      prev.connections < current.connections ? prev : current
    );
  }

  ipHashSelection(backends, clientIP) {
    const hash = this.hashCode(clientIP);
    const index = Math.abs(hash) % backends.length;
    return backends[index];
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  startHealthChecks() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheck.interval);
  }

  async performHealthChecks() {
    const healthCheckPromises = this.backends.map(backend =>
      this.checkBackendHealth(backend)
    );

    await Promise.allSettled(healthCheckPromises);
  }

  async checkBackendHealth(backend) {
    try {
      const startTime = Date.now();

      // Perform health check (HTTP request to health endpoint)
      const response = await fetch(`http://${backend.host}:${backend.port}/health`, {
        timeout: this.config.healthCheck.timeout
      });

      const responseTime = Date.now() - startTime;
      backend.responseTime = responseTime;
      backend.lastHealthCheck = new Date().toISOString();
      backend.healthy = response.ok;

    } catch (error) {
      backend.healthy = false;
      backend.lastHealthCheck = new Date().toISOString();
      console.error(`Health check failed for ${backend.host}:${backend.port}`, error.message);
    }
  }

  drain() {
    // Stop accepting new connections
    console.log('Load balancer draining...');
  }
}

// Express.js integration
export const setupScalabilityInfrastructure = (app) => {
  const infrastructure = new ScalabilityInfrastructure();

  // Add metrics middleware
  app.use(infrastructure.createMetricsMiddleware());

  // Add cache manager to app
  app.locals.cache = infrastructure.createCacheManager();

  return infrastructure;
};

export default ScalabilityInfrastructure;