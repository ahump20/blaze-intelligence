#!/usr/bin/env node

/**
 * Blaze Intelligence Browser Compatibility Testing
 * Simulated cross-browser compatibility checks for staging environment
 */

const https = require('https');
const { performance } = require('perf_hooks');

// Browser simulation configuration
const BROWSER_CONFIG = {
  baseUrl: 'https://68c0c84048700d2e27810fa7--blaze-intelligence.netlify.app',
  userAgents: {
    'Chrome Desktop': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Firefox Desktop': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Safari Desktop': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Edge Desktop': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Chrome Mobile': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Safari Mobile': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Samsung Internet': 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/19.0 Chrome/102.0.5005.125 Mobile Safari/537.36'
  }
};

// Test results storage
const compatibilityResults = {
  browsers: {},
  summary: {
    totalBrowsers: 0,
    passedBrowsers: 0,
    failedBrowsers: 0
  }
};

// Make request with specific user agent
function makeRequestWithUserAgent(url, userAgent) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    const req = https.request(url, {
      timeout: 10000,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
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
    
    req.end();
  });
}

// Test browser compatibility
async function testBrowserCompatibility(browserName, userAgent) {
  console.log(`🌐 Testing ${browserName}...`);
  
  const testResults = {
    browser: browserName,
    userAgent: userAgent,
    tests: [],
    overallStatus: 'PASS',
    responseTime: 0
  };
  
  const testPages = [
    { path: '/', name: 'Homepage' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/.netlify/functions/health', name: 'Health API' }
  ];
  
  for (const page of testPages) {
    try {
      const url = BROWSER_CONFIG.baseUrl + page.path;
      const response = await makeRequestWithUserAgent(url, userAgent);
      
      const pageTest = {
        page: page.name,
        path: page.path,
        status: response.statusCode >= 200 && response.statusCode < 400 ? 'PASS' : 'FAIL',
        statusCode: response.statusCode,
        responseTime: Math.round(response.responseTime),
        contentLength: response.data.length
      };
      
      // Check for browser-specific content
      if (page.path === '/') {
        pageTest.hasTitle = response.data.includes('Blaze Intelligence');
        pageTest.hasViewport = response.data.includes('viewport');
        pageTest.hasCSS = response.data.includes('stylesheet') || response.data.includes('tailwind');
        pageTest.hasJS = response.data.includes('script');
        
        if (!pageTest.hasTitle || !pageTest.hasViewport) {
          pageTest.status = 'FAIL';
          testResults.overallStatus = 'FAIL';
        }
      }
      
      if (pageTest.status === 'FAIL') {
        testResults.overallStatus = 'FAIL';
      }
      
      testResults.tests.push(pageTest);
      testResults.responseTime += pageTest.responseTime;
      
    } catch (error) {
      const pageTest = {
        page: page.name,
        path: page.path,
        status: 'FAIL',
        error: error.message,
        responseTime: 0
      };
      
      testResults.tests.push(pageTest);
      testResults.overallStatus = 'FAIL';
    }
  }
  
  testResults.responseTime = Math.round(testResults.responseTime / testResults.tests.length);
  
  // Log results
  if (testResults.overallStatus === 'PASS') {
    console.log(`✅ ${browserName} - PASS (avg: ${testResults.responseTime}ms)`);
    compatibilityResults.summary.passedBrowsers++;
  } else {
    console.log(`❌ ${browserName} - FAIL`);
    compatibilityResults.summary.failedBrowsers++;
  }
  
  return testResults;
}

// Run all browser compatibility tests
async function runBrowserCompatibilityTests() {
  console.log('🚀 Starting Browser Compatibility Tests...');
  console.log(`Target URL: ${BROWSER_CONFIG.baseUrl}`);
  console.log(`Testing ${Object.keys(BROWSER_CONFIG.userAgents).length} browsers/devices\n`);
  
  compatibilityResults.summary.totalBrowsers = Object.keys(BROWSER_CONFIG.userAgents).length;
  
  for (const [browserName, userAgent] of Object.entries(BROWSER_CONFIG.userAgents)) {
    try {
      const result = await testBrowserCompatibility(browserName, userAgent);
      compatibilityResults.browsers[browserName] = result;
      
      // Small delay between browser tests
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.log(`❌ ${browserName} - ERROR: ${error.message}`);
      compatibilityResults.browsers[browserName] = {
        browser: browserName,
        userAgent: userAgent,
        tests: [],
        overallStatus: 'ERROR',
        error: error.message
      };
      compatibilityResults.summary.failedBrowsers++;
    }
  }
  
  // Calculate compatibility percentage
  const compatibilityRate = (compatibilityResults.summary.passedBrowsers / compatibilityResults.summary.totalBrowsers) * 100;
  
  console.log('\n' + '='.repeat(60));
  console.log('🌐 BROWSER COMPATIBILITY TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${compatibilityResults.summary.passedBrowsers}`);
  console.log(`❌ Failed: ${compatibilityResults.summary.failedBrowsers}`);
  console.log(`📊 Compatibility Rate: ${compatibilityRate.toFixed(1)}%`);
  
  console.log('\n📱 Browser Details:');
  for (const [browserName, result] of Object.entries(compatibilityResults.browsers)) {
    const status = result.overallStatus === 'PASS' ? '✅' : '❌';
    const avgTime = result.responseTime || 0;
    console.log(`   ${status} ${browserName}: ${result.overallStatus} (${avgTime}ms)`);
  }
  
  // Assessment
  let assessment = 'EXCELLENT';
  if (compatibilityRate < 70) assessment = 'POOR';
  else if (compatibilityRate < 85) assessment = 'FAIR';
  else if (compatibilityRate < 95) assessment = 'GOOD';
  
  console.log(`\n🎯 Compatibility Assessment: ${assessment}`);
  
  // Recommendations
  const recommendations = [];
  if (compatibilityRate < 90) {
    recommendations.push('Browser compatibility below 90% - investigate failing browsers');
  }
  if (compatibilityResults.summary.failedBrowsers > 0) {
    recommendations.push('Some browsers failed - check console for specific issues');
  }
  if (recommendations.length === 0) {
    recommendations.push('Excellent cross-browser compatibility');
  }
  
  console.log('\n💡 Recommendations:');
  recommendations.forEach(rec => console.log(`   • ${rec}`));
  
  console.log('\n' + '='.repeat(60));
  
  // Generate report
  const report = {
    summary: compatibilityResults.summary,
    compatibilityRate: compatibilityRate.toFixed(1) + '%',
    assessment,
    browsers: compatibilityResults.browsers,
    recommendations,
    timestamp: new Date().toISOString(),
    testConfiguration: {
      baseUrl: BROWSER_CONFIG.baseUrl,
      browsersTest: Object.keys(BROWSER_CONFIG.userAgents).length
    }
  };
  
  const fs = require('fs');
  fs.writeFileSync('./browser-compatibility-report.json', JSON.stringify(report, null, 2));
  console.log('📁 Browser compatibility report saved to: ./browser-compatibility-report.json');
  
  return report;
}

// Run tests if called directly
if (require.main === module) {
  runBrowserCompatibilityTests()
    .then(() => {
      console.log('\n🎉 Browser compatibility tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Browser compatibility tests failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runBrowserCompatibilityTests, compatibilityResults };