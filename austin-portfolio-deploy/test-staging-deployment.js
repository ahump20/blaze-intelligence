#!/usr/bin/env node

/**
 * Blaze Intelligence Staging Deployment Test Suite
 * Comprehensive testing for staging environment deployment
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://68c0c84048700d2e27810fa7--blaze-intelligence.netlify.app',
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 1000
};

// Test suite results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  startTime: Date.now(),
  tests: []
};

// Utility functions
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const requestLib = url.startsWith('https:') ? https : http;
    
    const req = requestLib.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: TEST_CONFIG.timeout
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: responseTime
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

function logTest(name, status, details = {}) {
  const timestamp = new Date().toISOString();
  const result = {
    name,
    status,
    timestamp,
    ...details
  };
  
  testResults.tests.push(result);
  testResults.total++;
  
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${name} - ${details.responseTime || 0}ms`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name} - ${details.error || 'Failed'}`);
  }
  
  return result;
}

// Test cases
async function testMainSite() {
  console.log('\n🌐 Testing Main Site Functionality...');
  
  try {
    const response = await makeRequest(TEST_CONFIG.baseUrl);
    
    if (response.statusCode === 200) {
      const hasTitle = response.data.includes('Blaze Intelligence');
      const hasContent = response.data.length > 1000;
      
      if (hasTitle && hasContent) {
        logTest('Main Site Load', 'PASS', {
          responseTime: response.responseTime,
          contentLength: response.data.length
        });
      } else {
        logTest('Main Site Load', 'FAIL', {
          error: 'Missing expected content',
          hasTitle,
          hasContent
        });
      }
    } else {
      logTest('Main Site Load', 'FAIL', {
        error: `HTTP ${response.statusCode}`,
        responseTime: response.responseTime
      });
    }
  } catch (error) {
    logTest('Main Site Load', 'FAIL', { error: error.message });
  }
}

async function testHealthEndpoint() {
  console.log('\n🔍 Testing Health Check Endpoint...');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.baseUrl}/.netlify/functions/health`);
    
    if (response.statusCode === 200) {
      try {
        const healthData = JSON.parse(response.data);
        
        const hasStatus = healthData.status === 'healthy';
        const hasTimestamp = healthData.timestamp;
        const hasSystem = healthData.system;
        const hasServices = healthData.services;
        
        if (hasStatus && hasTimestamp && hasSystem && hasServices) {
          logTest('Health Endpoint', 'PASS', {
            responseTime: response.responseTime,
            environment: healthData.environment,
            version: healthData.version
          });
        } else {
          logTest('Health Endpoint', 'FAIL', {
            error: 'Missing required health data fields',
            hasStatus,
            hasTimestamp,
            hasSystem,
            hasServices
          });
        }
      } catch (parseError) {
        logTest('Health Endpoint', 'FAIL', {
          error: 'Invalid JSON response',
          responseTime: response.responseTime
        });
      }
    } else {
      logTest('Health Endpoint', 'FAIL', {
        error: `HTTP ${response.statusCode}`,
        responseTime: response.responseTime
      });
    }
  } catch (error) {
    logTest('Health Endpoint', 'FAIL', { error: error.message });
  }
}

async function testStatusEndpoint() {
  console.log('\n📊 Testing Status Monitoring Endpoint...');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.baseUrl}/.netlify/functions/status`);
    
    if (response.statusCode === 200) {
      try {
        const statusData = JSON.parse(response.data);
        
        const hasPage = statusData.page;
        const hasStatus = statusData.status;
        const hasComponents = statusData.components;
        const hasMetrics = statusData.metrics;
        
        if (hasPage && hasStatus && hasComponents && hasMetrics) {
          logTest('Status Endpoint', 'PASS', {
            responseTime: response.responseTime,
            indicator: statusData.status.indicator,
            environment: statusData.environment?.name
          });
        } else {
          logTest('Status Endpoint', 'FAIL', {
            error: 'Missing required status data fields',
            hasPage,
            hasStatus,
            hasComponents,
            hasMetrics
          });
        }
      } catch (parseError) {
        logTest('Status Endpoint', 'FAIL', {
          error: 'Invalid JSON response',
          responseTime: response.responseTime
        });
      }
    } else {
      logTest('Status Endpoint', 'FAIL', {
        error: `HTTP ${response.statusCode}`,
        responseTime: response.responseTime
      });
    }
  } catch (error) {
    logTest('Status Endpoint', 'FAIL', { error: error.message });
  }
}

async function testRouting() {
  console.log('\n🛣️ Testing Site Routing...');
  
  const routes = [
    { path: '/dashboard', expectedRedirect: true },
    { path: '/video', expectedRedirect: true },
    { path: '/demo', expectedRedirect: true },
    { path: '/pricing', expectedRedirect: true },
    { path: '/contact', expectedRedirect: true }
  ];
  
  for (const route of routes) {
    try {
      const response = await makeRequest(`${TEST_CONFIG.baseUrl}${route.path}`);
      
      if (response.statusCode === 200) {
        logTest(`Route ${route.path}`, 'PASS', {
          responseTime: response.responseTime,
          contentLength: response.data.length
        });
      } else {
        logTest(`Route ${route.path}`, 'FAIL', {
          error: `HTTP ${response.statusCode}`,
          responseTime: response.responseTime
        });
      }
    } catch (error) {
      logTest(`Route ${route.path}`, 'FAIL', { error: error.message });
    }
  }
}

async function testSecurityHeaders() {
  console.log('\n🔐 Testing Security Headers...');
  
  try {
    const response = await makeRequest(TEST_CONFIG.baseUrl);
    
    const requiredHeaders = [
      'x-frame-options',
      'x-xss-protection',
      'x-content-type-options',
      'referrer-policy',
      'strict-transport-security'
    ];
    
    const missingHeaders = [];
    const presentHeaders = [];
    
    for (const header of requiredHeaders) {
      if (response.headers[header] || response.headers[header.toLowerCase()]) {
        presentHeaders.push(header);
      } else {
        missingHeaders.push(header);
      }
    }
    
    if (missingHeaders.length === 0) {
      logTest('Security Headers', 'PASS', {
        responseTime: response.responseTime,
        headersPresent: presentHeaders.length
      });
    } else {
      logTest('Security Headers', 'FAIL', {
        error: `Missing headers: ${missingHeaders.join(', ')}`,
        missingCount: missingHeaders.length,
        presentCount: presentHeaders.length
      });
    }
  } catch (error) {
    logTest('Security Headers', 'FAIL', { error: error.message });
  }
}

async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  const performanceTests = [];
  const testRuns = 3;
  
  for (let i = 0; i < testRuns; i++) {
    try {
      const response = await makeRequest(TEST_CONFIG.baseUrl);
      performanceTests.push(response.responseTime);
    } catch (error) {
      console.log(`Performance test run ${i + 1} failed: ${error.message}`);
    }
  }
  
  if (performanceTests.length > 0) {
    const avgResponseTime = Math.round(performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length);
    const maxResponseTime = Math.max(...performanceTests);
    const minResponseTime = Math.min(...performanceTests);
    
    const isAcceptable = avgResponseTime < 3000; // 3 seconds threshold for staging
    
    logTest('Performance', isAcceptable ? 'PASS' : 'FAIL', {
      averageResponseTime: avgResponseTime,
      maxResponseTime: maxResponseTime,
      minResponseTime: minResponseTime,
      testRuns: performanceTests.length,
      threshold: '3000ms'
    });
  } else {
    logTest('Performance', 'FAIL', { error: 'No successful performance test runs' });
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.baseUrl}/nonexistent-page`);
    
    // Should either return 404 or redirect to index (SPA behavior)
    if (response.statusCode === 404 || response.statusCode === 200) {
      logTest('404 Error Handling', 'PASS', {
        responseTime: response.responseTime,
        statusCode: response.statusCode
      });
    } else {
      logTest('404 Error Handling', 'FAIL', {
        error: `Unexpected status code: ${response.statusCode}`,
        responseTime: response.responseTime
      });
    }
  } catch (error) {
    logTest('404 Error Handling', 'FAIL', { error: error.message });
  }
}

async function generateReport() {
  console.log('\n📋 Generating Test Report...');
  
  const endTime = Date.now();
  const duration = Math.round((endTime - testResults.startTime) / 1000);
  const passRate = Math.round((testResults.passed / testResults.total) * 100);
  
  const report = {
    summary: {
      totalTests: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: `${passRate}%`,
      duration: `${duration}s`,
      timestamp: new Date().toISOString(),
      environment: 'staging',
      baseUrl: TEST_CONFIG.baseUrl
    },
    tests: testResults.tests,
    recommendations: []
  };
  
  // Add recommendations based on test results
  if (testResults.failed > 0) {
    report.recommendations.push('Investigate failed tests before promoting to production');
  }
  
  if (passRate < 80) {
    report.recommendations.push('Pass rate is below 80% - review deployment');
  } else if (passRate >= 95) {
    report.recommendations.push('Excellent test results - ready for production deployment');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 STAGING DEPLOYMENT TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`📈 Pass Rate: ${report.summary.passRate}`);
  console.log(`⏱️  Duration: ${report.summary.duration}`);
  console.log(`🌐 Environment: ${report.summary.environment}`);
  console.log(`🔗 URL: ${report.summary.baseUrl}`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`   • ${rec}`));
  }
  
  console.log('\n' + '='.repeat(60));
  
  return report;
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Blaze Intelligence Staging Deployment Tests...');
  console.log(`Target URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`Test Timeout: ${TEST_CONFIG.timeout}ms`);
  
  try {
    await testMainSite();
    await testHealthEndpoint();
    await testStatusEndpoint();
    await testRouting();
    await testSecurityHeaders();
    await testPerformance();
    await testErrorHandling();
    
    const report = await generateReport();
    
    // Save report to file
    const fs = require('fs');
    const reportPath = './staging-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 Detailed report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, testResults };