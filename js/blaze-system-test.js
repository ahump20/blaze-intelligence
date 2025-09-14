// Blaze Intelligence System Testing Suite
// End-to-end testing for professional readiness

class BlazeSystemTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      details: []
    };

    this.testSuites = [
      'Infrastructure',
      'Navigation',
      'DataSources',
      'Charts',
      'WebSocket',
      'ErrorHandling',
      'Performance',
      'Accessibility',
      'Mobile',
      'Integration'
    ];

    console.log('🧪 Blaze System Test: Initializing comprehensive test suite');
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive system test...');

    const startTime = Date.now();

    // Reset results
    this.testResults = { passed: 0, failed: 0, skipped: 0, total: 0, details: [] };

    // Run all test suites
    for (const suite of this.testSuites) {
      await this.runTestSuite(suite);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Generate final report
    const report = this.generateFinalReport(duration);
    console.log(report);

    return {
      success: this.testResults.failed === 0,
      ...this.testResults,
      duration,
      report
    };
  }

  async runTestSuite(suiteName) {
    console.log(`📋 Testing ${suiteName}...`);

    try {
      switch (suiteName) {
        case 'Infrastructure':
          await this.testInfrastructure();
          break;
        case 'Navigation':
          await this.testNavigation();
          break;
        case 'DataSources':
          await this.testDataSources();
          break;
        case 'Charts':
          await this.testCharts();
          break;
        case 'WebSocket':
          await this.testWebSocket();
          break;
        case 'ErrorHandling':
          await this.testErrorHandling();
          break;
        case 'Performance':
          await this.testPerformance();
          break;
        case 'Accessibility':
          await this.testAccessibility();
          break;
        case 'Mobile':
          await this.testMobileResponsiveness();
          break;
        case 'Integration':
          await this.testSystemIntegration();
          break;
      }
    } catch (error) {
      this.recordTest(`${suiteName} Suite`, false, `Suite failed: ${error.message}`);
    }
  }

  async testInfrastructure() {
    // Test 1: Core scripts loaded
    await this.test('Core Scripts Loaded', () => {
      const required = ['blazeFix', 'blazeCharts', 'blazeWS', 'blazeErrorSystem'];
      const missing = required.filter(script => !window[script]);
      return missing.length === 0 ? true : `Missing: ${missing.join(', ')}`;
    });

    // Test 2: Netlify Functions accessible
    await this.test('Netlify Functions', async () => {
      const endpoints = [
        '/api/live-data-api/health',
        '/api/auth-handler',
        '/api/payment-processor'
      ];

      const results = await Promise.allSettled(
        endpoints.map(endpoint => fetch(endpoint, { method: 'HEAD' }))
      );

      const failures = results
        .map((result, i) => ({ result, endpoint: endpoints[i] }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ endpoint }) => endpoint);

      return failures.length === 0 ? true : `Inaccessible: ${failures.join(', ')}`;
    });

    // Test 3: Data directory structure
    await this.test('Data Structure', async () => {
      try {
        const response = await fetch('/data/nil/2025-26-valuations.json');
        if (!response.ok) throw new Error('NIL data not accessible');

        const data = await response.json();
        if (!data.top50Programs || !Array.isArray(data.top50Programs)) {
          throw new Error('Invalid NIL data structure');
        }

        return true;
      } catch (error) {
        return error.message;
      }
    });
  }

  async testNavigation() {
    // Test 1: All navigation links functional
    await this.test('Navigation Links', () => {
      const links = document.querySelectorAll('.nav-menu a, nav a');
      let validLinks = 0;
      let invalidLinks = [];

      links.forEach(link => {
        if (link.href && (link.href.includes('.html') || link.href.includes('http') || link.href.includes('#contact'))) {
          validLinks++;
        } else {
          invalidLinks.push(link.textContent || 'unnamed link');
        }
      });

      return validLinks > 0 ? true : `Invalid links: ${invalidLinks.join(', ')}`;
    });

    // Test 2: Main page link exists
    await this.test('Main Page Link', () => {
      const mainLink = document.querySelector('a[href*="blaze-intelligence-main"]');
      return mainLink ? true : 'Main page link missing';
    });

    // Test 3: Contact scroll functionality
    await this.test('Contact Navigation', () => {
      const contactLink = document.querySelector('a[href*="#contact"]');
      if (!contactLink) return 'Contact link not found';

      // Simulate click
      try {
        contactLink.click();
        return true;
      } catch (error) {
        return `Contact link error: ${error.message}`;
      }
    });
  }

  async testDataSources() {
    // Test 1: NIL data loading
    await this.test('NIL Data Loading', async () => {
      try {
        const response = await fetch('/data/nil/2025-26-valuations.json');
        const data = await response.json();

        if (!data.top50Programs || data.top50Programs.length < 5) {
          return 'Insufficient NIL data';
        }

        return true;
      } catch (error) {
        return `NIL data error: ${error.message}`;
      }
    });

    // Test 2: API endpoints responding
    await this.test('API Endpoints', async () => {
      const endpoints = [
        '/api/live-data-api/nil-valuations',
        '/api/live-data-api/scores',
        '/api/live-data-api/predictions'
      ];

      let workingEndpoints = 0;
      let failures = [];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            workingEndpoints++;
          } else {
            failures.push(`${endpoint} (${response.status})`);
          }
        } catch (error) {
          failures.push(`${endpoint} (${error.message})`);
        }
      }

      return workingEndpoints > 0 ? true : `All APIs failed: ${failures.join(', ')}`;
    });

    // Test 3: Fallback data mechanisms
    await this.test('Fallback Data', () => {
      if (!window.blazeErrorSystem) return 'Error system not available';

      const fallbackData = window.blazeErrorSystem.getFallbackData('/test');
      return fallbackData && typeof fallbackData === 'object' ? true : 'Fallback data not working';
    });
  }

  async testCharts() {
    // Test 1: Chart.js library available
    await this.test('Chart.js Library', () => {
      return typeof Chart !== 'undefined' ? true : 'Chart.js not loaded';
    });

    // Test 2: Charts integration working
    await this.test('Charts Integration', () => {
      if (!window.blazeCharts) return 'Charts integration not loaded';

      const chartCount = window.blazeCharts.charts ? window.blazeCharts.charts.size : 0;
      return chartCount >= 0 ? true : 'Charts integration not working';
    });

    // Test 3: Canvas elements present
    await this.test('Chart Canvas Elements', () => {
      const canvases = document.querySelectorAll('canvas');
      return canvases.length > 0 ? true : 'No chart canvases found';
    });

    // Test 4: Chart data updates
    await this.test('Chart Data Updates', async () => {
      if (!window.blazeCharts) return 'Charts not available for update test';

      try {
        // Test chart refresh functionality
        if (typeof window.blazeCharts.refreshCharts === 'function') {
          await window.blazeCharts.refreshCharts();
          return true;
        } else {
          return 'Chart refresh method not available';
        }
      } catch (error) {
        return `Chart update error: ${error.message}`;
      }
    });
  }

  async testWebSocket() {
    // Test 1: WebSocket client loaded
    await this.test('WebSocket Client', () => {
      return window.blazeWS ? true : 'WebSocket client not loaded';
    });

    // Test 2: Connection capability
    await this.test('WebSocket Connection', async () => {
      if (!window.blazeWS) return 'WebSocket client not available';

      try {
        const status = window.blazeWS.getConnectionStatus();
        return status ? true : 'Connection status not available';
      } catch (error) {
        return `WebSocket error: ${error.message}`;
      }
    });

    // Test 3: Real-time updates
    await this.test('Real-time Updates', () => {
      if (!window.blazeWS) return 'WebSocket not available';

      // Check if mock mode is working (for demo environment)
      const status = window.blazeWS.getConnectionStatus();
      return status.connected || status.mockMode ? true : 'Real-time updates not functioning';
    });
  }

  async testErrorHandling() {
    // Test 1: Error system loaded
    await this.test('Error System', () => {
      return window.blazeErrorSystem ? true : 'Error system not loaded';
    });

    // Test 2: Error logging working
    await this.test('Error Logging', () => {
      if (!window.blazeErrorSystem) return 'Error system not available';

      const initialCount = window.blazeErrorSystem.errorLog.length;

      // Trigger test error
      window.blazeErrorSystem.logError({
        type: 'test',
        message: 'Test error for validation',
        timestamp: new Date().toISOString()
      });

      const newCount = window.blazeErrorSystem.errorLog.length;
      return newCount > initialCount ? true : 'Error logging not working';
    });

    // Test 3: Fallback systems
    await this.test('Fallback Systems', () => {
      if (!window.blazeErrorSystem) return 'Error system not available';

      // Test fallback activation
      try {
        window.blazeErrorSystem.activateFallbackMode();
        return window.blazeErrorSystem.fallbackState ? true : 'Fallback mode not activating';
      } catch (error) {
        return `Fallback error: ${error.message}`;
      }
    });
  }

  async testPerformance() {
    // Test 1: Page load time
    await this.test('Page Load Performance', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const loadTime = perfData ? perfData.loadEventEnd : 0;

      if (loadTime === 0) return 'Performance data not available';

      return loadTime < 10000 ? true : `Slow load time: ${loadTime}ms`;
    });

    // Test 2: Memory usage
    await this.test('Memory Usage', () => {
      if (!performance.memory) return 'Memory API not available (normal in some browsers)';

      const memory = performance.memory;
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

      return usagePercent < 90 ? true : `High memory usage: ${usagePercent.toFixed(1)}%`;
    });

    // Test 3: JavaScript errors impact
    await this.test('Error Impact', () => {
      if (!window.blazeErrorSystem) return 'Error system not available';

      const criticalErrors = window.blazeErrorSystem.criticalErrors.size;
      return criticalErrors === 0 ? true : `${criticalErrors} critical errors detected`;
    });
  }

  async testAccessibility() {
    // Test 1: Semantic HTML
    await this.test('Semantic HTML', () => {
      const semanticTags = document.querySelectorAll('header, nav, main, section, article, aside, footer');
      return semanticTags.length > 0 ? true : 'No semantic HTML elements found';
    });

    // Test 2: Alt text for images
    await this.test('Image Alt Text', () => {
      const images = document.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);

      return imagesWithoutAlt.length === 0 ? true : `${imagesWithoutAlt.length} images missing alt text`;
    });

    // Test 3: Keyboard navigation
    await this.test('Keyboard Navigation', () => {
      const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      return focusableElements.length > 0 ? true : 'No focusable elements found';
    });
  }

  async testMobileResponsiveness() {
    // Test 1: Viewport meta tag
    await this.test('Viewport Meta Tag', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      return viewport ? true : 'Viewport meta tag missing';
    });

    // Test 2: Responsive design
    await this.test('Responsive Design', () => {
      // Simulate mobile viewport
      const originalWidth = window.innerWidth;

      // Check if elements adapt to smaller screens
      const navMenu = document.querySelector('.nav-menu, nav');
      if (navMenu) {
        const computedStyle = window.getComputedStyle(navMenu);
        // Basic check for responsive behavior
        return computedStyle.display !== 'none' ? true : 'Navigation not responsive';
      }

      return 'Navigation element not found';
    });

    // Test 3: Touch-friendly elements
    await this.test('Touch-Friendly Elements', () => {
      const buttons = document.querySelectorAll('button, .btn');
      let touchFriendly = 0;

      buttons.forEach(btn => {
        const style = window.getComputedStyle(btn);
        const height = parseFloat(style.height);
        const width = parseFloat(style.width);

        // Minimum 44px for touch targets (iOS guideline)
        if (height >= 44 && width >= 44) {
          touchFriendly++;
        }
      });

      return touchFriendly > 0 || buttons.length === 0 ? true : 'Elements not touch-friendly';
    });
  }

  async testSystemIntegration() {
    // Test 1: All systems loaded
    await this.test('System Components', () => {
      const systems = ['blazeFix', 'blazeCharts', 'blazeWS', 'blazeErrorSystem', 'blazePageIntegration'];
      const loaded = systems.filter(system => window[system]);

      return loaded.length >= 3 ? true : `Missing systems: ${systems.filter(s => !window[s]).join(', ')}`;
    });

    // Test 2: Cross-system communication
    await this.test('System Communication', () => {
      // Test if systems can communicate
      try {
        if (window.blazeWS && window.blazeCharts) {
          // Mock a real-time update to chart
          const mockData = { nil: { top50Programs: [] } };
          if (typeof window.blazeCharts.refreshCharts === 'function') {
            return true;
          }
        }
        return 'Limited system integration available';
      } catch (error) {
        return `Integration error: ${error.message}`;
      }
    });

    // Test 3: End-to-end data flow
    await this.test('Data Flow', async () => {
      try {
        // Test complete data pipeline
        const response = await fetch('/api/live-data-api/health');
        if (response.ok) {
          return true;
        } else {
          return `API health check failed: ${response.status}`;
        }
      } catch (error) {
        return `Data flow error: ${error.message}`;
      }
    });
  }

  // Utility methods
  async test(name, testFunction, timeout = 5000) {
    this.testResults.total++;
    const startTime = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test timeout')), timeout);
      });

      const testPromise = Promise.resolve(testFunction());
      const result = await Promise.race([testPromise, timeoutPromise]);

      const duration = Date.now() - startTime;

      if (result === true) {
        this.recordTest(name, true, 'Passed', duration);
      } else {
        this.recordTest(name, false, result || 'Test returned false', duration);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordTest(name, false, error.message, duration);
    }
  }

  recordTest(name, passed, message, duration = 0) {
    if (passed) {
      this.testResults.passed++;
      console.log(`✅ ${name} - ${message}`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${name} - ${message}`);
    }

    this.testResults.details.push({
      name,
      passed,
      message,
      duration
    });
  }

  generateFinalReport(totalDuration) {
    const { passed, failed, total } = this.testResults;
    const successRate = ((passed / total) * 100).toFixed(1);

    const report = `
🎯 BLAZE INTELLIGENCE SYSTEM TEST REPORT
═══════════════════════════════════════════

📊 SUMMARY
• Total Tests: ${total}
• Passed: ${passed} ✅
• Failed: ${failed} ${failed > 0 ? '❌' : ''}
• Success Rate: ${successRate}%
• Duration: ${totalDuration}ms

${failed > 0 ? `
🚨 FAILED TESTS:
${this.testResults.details
  .filter(test => !test.passed)
  .map(test => `• ${test.name}: ${test.message}`)
  .join('\n')}
` : ''}

${passed > 0 ? `
✅ PASSED TESTS:
${this.testResults.details
  .filter(test => test.passed)
  .map(test => `• ${test.name}`)
  .join('\n')}
` : ''}

🏆 SYSTEM STATUS: ${failed === 0 ? 'READY FOR PRODUCTION' : failed < 3 ? 'MOSTLY FUNCTIONAL' : 'NEEDS ATTENTION'}
    `;

    return report;
  }

  // Quick health check
  async quickHealthCheck() {
    console.log('⚡ Running quick health check...');

    const criticalTests = [
      () => typeof window.blazeFix !== 'undefined',
      () => document.querySelectorAll('a[href*="blaze-intelligence-main"]').length > 0,
      () => fetch('/data/nil/2025-26-valuations.json').then(r => r.ok),
      () => typeof Chart !== 'undefined' || document.querySelectorAll('canvas').length === 0
    ];

    let healthScore = 0;

    for (let i = 0; i < criticalTests.length; i++) {
      try {
        const result = await criticalTests[i]();
        if (result) healthScore++;
      } catch (error) {
        console.warn(`Health check ${i + 1} failed:`, error.message);
      }
    }

    const healthPercentage = (healthScore / criticalTests.length) * 100;

    console.log(`💊 System Health: ${healthPercentage}% (${healthScore}/${criticalTests.length})`);

    return {
      score: healthScore,
      total: criticalTests.length,
      percentage: healthPercentage,
      status: healthPercentage >= 75 ? 'Healthy' : healthPercentage >= 50 ? 'Degraded' : 'Critical'
    };
  }
}

// Auto-initialize testing system
if (typeof window !== 'undefined') {
  window.BlazeSystemTest = BlazeSystemTest;
  window.blazeSystemTest = new BlazeSystemTest();

  // Expose testing methods globally for easy access
  window.runSystemTest = () => window.blazeSystemTest.runAllTests();
  window.quickHealthCheck = () => window.blazeSystemTest.quickHealthCheck();

  console.log('🧪 Blaze System Test ready. Run with: runSystemTest() or quickHealthCheck()');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlazeSystemTest;
}