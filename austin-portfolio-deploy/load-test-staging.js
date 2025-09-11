#!/usr/bin/env node

/**
 * Blaze Intelligence Load Testing Suite
 * Performance and stress testing for staging environment
 */

const https = require('https');
const { performance } = require('perf_hooks');

// Load test configuration
const LOAD_CONFIG = {
  baseUrl: 'https://68c0c84048700d2e27810fa7--blaze-intelligence.netlify.app',
  concurrentUsers: 20,
  requestsPerUser: 10,
  testDuration: 30000, // 30 seconds
  endpoints: [
    '/',
    '/.netlify/functions/health',
    '/.netlify/functions/status',
    '/dashboard',
    '/pricing',
    '/demo'
  ]
};

// Test results storage
const loadResults = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: Date.now(),
  endTime: null
};

// Make HTTP request with performance tracking
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    const req = https.request(url, { timeout: 10000 }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        loadResults.totalRequests++;
        loadResults.responseTimes.push(responseTime);
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          loadResults.successfulRequests++;
        } else {
          loadResults.failedRequests++;
          loadResults.errors.push({
            url,
            statusCode: res.statusCode,
            responseTime
          });
        }
        
        resolve({
          statusCode: res.statusCode,
          responseTime,
          dataLength: data.length
        });
      });
    });
    
    req.on('error', (error) => {
      loadResults.totalRequests++;
      loadResults.failedRequests++;
      loadResults.errors.push({
        url,
        error: error.message,
        timestamp: Date.now()
      });
      
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      
      loadResults.totalRequests++;
      loadResults.failedRequests++;
      loadResults.errors.push({
        url,
        error: 'Request timeout',
        timestamp: Date.now()
      });
      
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Simulate user session
async function simulateUser(userId) {
  const userResults = {
    id: userId,
    requests: 0,
    successes: 0,
    failures: 0,
    avgResponseTime: 0
  };
  
  console.log(`👤 Starting user ${userId} simulation...`);
  
  for (let i = 0; i < LOAD_CONFIG.requestsPerUser; i++) {
    const endpoint = LOAD_CONFIG.endpoints[Math.floor(Math.random() * LOAD_CONFIG.endpoints.length)];
    const url = LOAD_CONFIG.baseUrl + endpoint;
    
    try {
      const result = await makeRequest(url);
      userResults.requests++;
      userResults.successes++;
      
      // Random delay between requests (100-1000ms)
      const delay = Math.random() * 900 + 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } catch (error) {
      userResults.requests++;
      userResults.failures++;
    }
  }
  
  console.log(`✅ User ${userId} completed ${userResults.requests} requests`);
  return userResults;
}

// Run concurrent user simulation
async function runLoadTest() {
  console.log('🚀 Starting Load Test...');
  console.log(`Target: ${LOAD_CONFIG.baseUrl}`);
  console.log(`Concurrent Users: ${LOAD_CONFIG.concurrentUsers}`);
  console.log(`Requests per User: ${LOAD_CONFIG.requestsPerUser}`);
  console.log(`Expected Total Requests: ${LOAD_CONFIG.concurrentUsers * LOAD_CONFIG.requestsPerUser}`);
  
  const startTime = Date.now();
  
  // Create array of user simulation promises
  const userPromises = [];
  for (let i = 1; i <= LOAD_CONFIG.concurrentUsers; i++) {
    userPromises.push(simulateUser(i));
  }
  
  // Wait for all users to complete
  const userResults = await Promise.allSettled(userPromises);
  
  loadResults.endTime = Date.now();
  
  // Calculate statistics
  const duration = (loadResults.endTime - loadResults.startTime) / 1000;
  const successRate = (loadResults.successfulRequests / loadResults.totalRequests) * 100;
  const avgResponseTime = loadResults.responseTimes.reduce((a, b) => a + b, 0) / loadResults.responseTimes.length;
  const minResponseTime = Math.min(...loadResults.responseTimes);
  const maxResponseTime = Math.max(...loadResults.responseTimes);
  const requestsPerSecond = loadResults.totalRequests / duration;
  
  // Calculate percentiles
  const sortedTimes = loadResults.responseTimes.sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
  const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 LOAD TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`🎯 Total Requests: ${loadResults.totalRequests}`);
  console.log(`✅ Successful: ${loadResults.successfulRequests}`);
  console.log(`❌ Failed: ${loadResults.failedRequests}`);
  console.log(`📈 Success Rate: ${successRate.toFixed(2)}%`);
  console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
  console.log(`📊 Requests/sec: ${requestsPerSecond.toFixed(2)}`);
  console.log('\n📊 Response Time Statistics:');
  console.log(`   Average: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   Min: ${minResponseTime.toFixed(2)}ms`);
  console.log(`   Max: ${maxResponseTime.toFixed(2)}ms`);
  console.log(`   50th percentile: ${p50.toFixed(2)}ms`);
  console.log(`   90th percentile: ${p90.toFixed(2)}ms`);
  console.log(`   95th percentile: ${p95.toFixed(2)}ms`);
  console.log(`   99th percentile: ${p99.toFixed(2)}ms`);
  
  if (loadResults.errors.length > 0) {
    console.log('\n🚨 Errors encountered:');
    loadResults.errors.slice(0, 5).forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.url}: ${error.error || error.statusCode}`);
    });
    
    if (loadResults.errors.length > 5) {
      console.log(`   ... and ${loadResults.errors.length - 5} more errors`);
    }
  }
  
  // Performance assessment
  let performance = 'EXCELLENT';
  if (avgResponseTime > 2000) performance = 'POOR';
  else if (avgResponseTime > 1000) performance = 'FAIR';
  else if (avgResponseTime > 500) performance = 'GOOD';
  
  console.log(`\n🎭 Performance Assessment: ${performance}`);
  
  // Generate recommendations
  const recommendations = [];
  if (successRate < 95) {
    recommendations.push('Success rate below 95% - investigate errors');
  }
  if (avgResponseTime > 1000) {
    recommendations.push('Average response time exceeds 1 second - optimize performance');
  }
  if (p95 > 3000) {
    recommendations.push('95th percentile exceeds 3 seconds - check for bottlenecks');
  }
  if (requestsPerSecond < 10) {
    recommendations.push('Low throughput - consider scaling improvements');
  }
  if (recommendations.length === 0) {
    recommendations.push('Performance looks good for staging environment');
  }
  
  console.log('\n💡 Recommendations:');
  recommendations.forEach(rec => console.log(`   • ${rec}`));
  
  console.log('\n' + '='.repeat(60));
  
  // Save detailed results
  const detailedReport = {
    summary: {
      totalRequests: loadResults.totalRequests,
      successfulRequests: loadResults.successfulRequests,
      failedRequests: loadResults.failedRequests,
      successRate: successRate.toFixed(2) + '%',
      duration: duration.toFixed(2) + 's',
      requestsPerSecond: requestsPerSecond.toFixed(2),
      performance
    },
    responseTimeStats: {
      average: avgResponseTime.toFixed(2) + 'ms',
      min: minResponseTime.toFixed(2) + 'ms',
      max: maxResponseTime.toFixed(2) + 'ms',
      p50: p50.toFixed(2) + 'ms',
      p90: p90.toFixed(2) + 'ms',
      p95: p95.toFixed(2) + 'ms',
      p99: p99.toFixed(2) + 'ms'
    },
    errors: loadResults.errors,
    recommendations,
    timestamp: new Date().toISOString(),
    configuration: LOAD_CONFIG
  };
  
  const fs = require('fs');
  fs.writeFileSync('./load-test-report.json', JSON.stringify(detailedReport, null, 2));
  console.log('📁 Detailed load test report saved to: ./load-test-report.json');
  
  return detailedReport;
}

// Run load test if called directly
if (require.main === module) {
  runLoadTest()
    .then(() => {
      console.log('\n🎉 Load test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Load test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runLoadTest, loadResults };