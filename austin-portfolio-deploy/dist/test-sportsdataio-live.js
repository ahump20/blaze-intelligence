/**
 * BLAZE INTELLIGENCE - SportsDataIO Live API Test
 * Tests all endpoints with live API key
 */

const API_KEY = '6ca2adb39404482da5406f0a6cd7aa37';
const BASE_URLS = {
  nfl: 'https://api.sportsdata.io/v3/nfl',
  mlb: 'https://api.sportsdata.io/v3/mlb',
  nba: 'https://api.sportsdata.io/v3/nba',
  ncaaFootball: 'https://api.sportsdata.io/v3/cfb'
};

// Test function with colored output
async function testEndpoint(sport, endpoint, description) {
  const url = `${BASE_URLS[sport]}${endpoint}?key=${API_KEY}`;

  try {
    console.log(`\n🔍 Testing ${sport.toUpperCase()} - ${description}...`);
    console.log(`   URL: ${url.replace(API_KEY, 'YOUR_KEY')}`);

    const startTime = Date.now();
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ SUCCESS - ${responseTime}ms`);
      console.log(`   📊 Data points: ${Array.isArray(data) ? data.length : 1}`);

      // Show sample data
      if (Array.isArray(data) && data.length > 0) {
        const sample = data[0];
        console.log(`   📋 Sample:`, JSON.stringify(sample).substring(0, 100) + '...');
      }

      return { success: true, responseTime, dataCount: Array.isArray(data) ? data.length : 1 };
    } else {
      console.log(`   ❌ FAILED - Status: ${response.status} ${response.statusText}`);
      return { success: false, error: `${response.status} ${response.statusText}` };
    }
  } catch (error) {
    console.log(`   ❌ ERROR:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main test suite
async function runTests() {
  console.log('🏆 BLAZE INTELLIGENCE - SportsDataIO API Test Suite');
  console.log('=' .repeat(60));

  const tests = [
    // MLB Tests (Priority #1)
    { sport: 'mlb', endpoint: '/scores/json/Teams', description: 'MLB Teams' },
    { sport: 'mlb', endpoint: '/scores/json/Standings/2024', description: 'MLB Standings 2024' },
    { sport: 'mlb', endpoint: '/scores/json/Games/2024', description: 'MLB Games 2024' },

    // NFL Tests (Priority #2)
    { sport: 'nfl', endpoint: '/scores/json/Teams', description: 'NFL Teams' },
    { sport: 'nfl', endpoint: '/scores/json/Standings/2024', description: 'NFL Standings 2024' },
    { sport: 'nfl', endpoint: '/scores/json/Scores/2024/3', description: 'NFL Week 3 Scores' },

    // NCAA Football Tests (Priority #3)
    { sport: 'ncaaFootball', endpoint: '/scores/json/Teams', description: 'NCAA Football Teams' },
    { sport: 'ncaaFootball', endpoint: '/scores/json/Rankings/2024', description: 'NCAA Rankings 2024' },

    // NBA Tests (Priority #4)
    { sport: 'nba', endpoint: '/scores/json/Teams', description: 'NBA Teams' },
    { sport: 'nba', endpoint: '/scores/json/Standings/2024', description: 'NBA Standings 2024' }
  ];

  const results = {
    total: tests.length,
    successful: 0,
    failed: 0,
    totalResponseTime: 0
  };

  // Run all tests
  for (const test of tests) {
    const result = await testEndpoint(test.sport, test.endpoint, test.description);
    if (result.success) {
      results.successful++;
      results.totalResponseTime += result.responseTime;
    } else {
      results.failed++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${results.successful}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);
  console.log(`⚡ Average Response Time: ${Math.round(results.totalResponseTime / results.successful)}ms`);
  console.log(`🎯 Success Rate: ${((results.successful / results.total) * 100).toFixed(1)}%`);

  // Performance verdict
  const avgResponseTime = results.totalResponseTime / results.successful;
  if (avgResponseTime < 100) {
    console.log(`\n🏆 CHAMPIONSHIP PERFORMANCE: Sub-100ms average! (${Math.round(avgResponseTime)}ms)`);
  } else if (avgResponseTime < 200) {
    console.log(`\n⚡ EXCELLENT PERFORMANCE: ${Math.round(avgResponseTime)}ms average`);
  } else {
    console.log(`\n⚠️  PERFORMANCE WARNING: ${Math.round(avgResponseTime)}ms average (target: <100ms)`);
  }

  console.log('\n🔥 Built with Texas Grit');
}

// Run the tests
runTests().catch(console.error);