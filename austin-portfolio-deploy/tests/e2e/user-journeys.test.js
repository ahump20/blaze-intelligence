/**
 * End-to-End Tests for Critical User Journeys
 * Testing complete user flows from landing to conversion
 */

const { test, expect } = require('@playwright/test');

test.describe('Blaze Intelligence User Journeys', () => {
  
  test.describe('Visitor to Lead Conversion Journey', () => {
    test('should convert visitor to lead through Cardinals analytics', async ({ page }) => {
      // Start at homepage
      await page.goto('/');
      
      // Verify homepage loads with proper branding
      await expect(page.locator('h1')).toContainText('Blaze Intelligence');
      
      // Check for Three.js hero animation
      await expect(page.locator('#hero-canvas')).toBeVisible();
      await page.waitForTimeout(2000); // Allow animation to start
      
      // Navigate to Cardinals analytics
      await page.click('text=Cardinals Analytics');
      await page.waitForURL('**/cardinals-analytics');
      
      // Verify Cardinals data loads
      await expect(page.locator('[data-testid="cardinals-readiness"]')).toBeVisible();
      await expect(page.locator('[data-testid="readiness-score"]')).toHaveText(/\d{1,3}\.\d{1,2}/);
      
      // Interact with analytics dashboard
      await page.click('[data-testid="trend-analysis"]');
      await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
      
      // Proceed to contact form
      await page.click('text=Get Started');
      await page.waitForURL('**/contact');
      
      // Fill out lead capture form
      await page.fill('[data-testid="contact-name"]', 'Austin Humphrey');
      await page.fill('[data-testid="contact-email"]', 'ahump20@outlook.com');
      await page.fill('[data-testid="contact-organization"]', 'Texas Longhorns Baseball');
      await page.selectOption('[data-testid="contact-interest"]', 'cardinals-analytics');
      await page.fill('[data-testid="contact-message"]', 'Interested in Cardinals analytics for our program.');
      
      // Submit form
      await page.click('[data-testid="contact-submit"]');
      
      // Verify successful submission
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Thank you');
    });

    test('should handle mobile visitor conversion', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 }); // iPhone 13 size
      
      await page.goto('/');
      
      // Mobile menu interaction
      await page.click('[data-testid="mobile-menu-toggle"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Navigate on mobile
      await page.click('text=Cardinals Analytics');
      
      // Verify mobile-optimized Cardinals view
      await expect(page.locator('[data-testid="cardinals-mobile-view"]')).toBeVisible();
      
      // Mobile form interaction
      await page.click('text=Contact Us');
      await page.fill('[data-testid="contact-name"]', 'Mobile User');
      await page.fill('[data-testid="contact-email"]', 'mobile@test.com');
      
      // Submit on mobile
      await page.click('[data-testid="contact-submit"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });

  test.describe('Cardinals Analytics Deep Dive Journey', () => {
    test('should provide comprehensive Cardinals analytics experience', async ({ page }) => {
      await page.goto('/cardinals-analytics');
      
      // Verify main analytics dashboard loads
      await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
      
      // Check readiness score display
      const readinessScore = await page.textContent('[data-testid="readiness-score"]');
      expect(parseFloat(readinessScore)).toBeGreaterThan(0);
      expect(parseFloat(readinessScore)).toBeLessThan(100);
      
      // Interact with performance metrics
      await page.click('[data-testid="performance-tab"]');
      await expect(page.locator('[data-testid="performance-charts"]')).toBeVisible();
      
      // Verify batting metrics
      await page.click('[data-testid="batting-metrics"]');
      await expect(page.locator('[data-testid="batting-avg"]')).toBeVisible();
      await expect(page.locator('[data-testid="batting-avg"]')).toHaveText(/\.\d{3}/);
      
      // Check pitching analytics
      await page.click('[data-testid="pitching-metrics"]');
      await expect(page.locator('[data-testid="era-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="era-display"]')).toHaveText(/\d\.\d{2}/);
      
      // Verify trend analysis
      await page.click('[data-testid="trend-analysis"]');
      await expect(page.locator('[data-testid="trend-positive"]')).toBeVisible();
      
      // Test export functionality
      await page.click('[data-testid="export-data"]');
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-confirm"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('cardinals-analytics');
    });

    test('should maintain performance during analytics interactions', async ({ page }) => {
      await page.goto('/cardinals-analytics');
      
      // Measure initial load time
      const navigationTiming = await page.evaluate(() => performance.timing);
      const loadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
      
      // Test responsive interactions
      const startTime = Date.now();
      
      await page.click('[data-testid="refresh-data"]');
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden();
      
      const refreshTime = Date.now() - startTime;
      expect(refreshTime).toBeLessThan(2000); // Data refresh should be under 2 seconds
    });
  });

  test.describe('NIL Calculator Journey', () => {
    test('should calculate NIL values accurately', async ({ page }) => {
      await page.goto('/nil-calculator');
      
      // Fill out athlete information
      await page.selectOption('[data-testid="sport-select"]', 'baseball');
      await page.selectOption('[data-testid="position-select"]', 'pitcher');
      
      // Enter performance stats
      await page.fill('[data-testid="era-input"]', '2.45');
      await page.fill('[data-testid="strikeouts-input"]', '95');
      await page.fill('[data-testid="wins-input"]', '8');
      
      // Social media metrics
      await page.fill('[data-testid="followers-input"]', '5000');
      await page.fill('[data-testid="engagement-rate"]', '3.5');
      
      // Market reach
      await page.check('[data-testid="local-market"]');
      await page.uncheck('[data-testid="regional-market"]');
      await page.uncheck('[data-testid="national-market"]');
      
      // Calculate NIL value
      await page.click('[data-testid="calculate-nil"]');
      
      // Verify calculation results
      await expect(page.locator('[data-testid="nil-value"]')).toBeVisible();
      const nilValue = await page.textContent('[data-testid="nil-value"]');
      expect(parseFloat(nilValue.replace(/[^0-9.]/g, ''))).toBeGreaterThan(500);
      expect(parseFloat(nilValue.replace(/[^0-9.]/g, ''))).toBeLessThan(25000);
      
      // Verify savings comparison
      await expect(page.locator('[data-testid="savings-comparison"]')).toBeVisible();
      const savingsText = await page.textContent('[data-testid="savings-comparison"]');
      expect(savingsText).toMatch(/6[7-9]|7[0-9]|80/); // 67-80% range
    });

    test('should handle different sports correctly', async ({ page }) => {
      await page.goto('/nil-calculator');
      
      // Test football player
      await page.selectOption('[data-testid="sport-select"]', 'football');
      await page.selectOption('[data-testid="position-select"]', 'quarterback');
      await page.fill('[data-testid="passing-yards"]', '2500');
      await page.fill('[data-testid="touchdowns"]', '20');
      await page.fill('[data-testid="followers-input"]', '10000');
      
      await page.click('[data-testid="calculate-nil"]');
      const footballValue = await page.textContent('[data-testid="nil-value"]');
      
      // Test basketball player  
      await page.selectOption('[data-testid="sport-select"]', 'basketball');
      await page.selectOption('[data-testid="position-select"]', 'guard');
      await page.fill('[data-testid="points-per-game"]', '18.5');
      await page.fill('[data-testid="assists"]', '6.2');
      await page.fill('[data-testid="followers-input"]', '10000');
      
      await page.click('[data-testid="calculate-nil"]');
      const basketballValue = await page.textContent('[data-testid="nil-value"]');
      
      // Football typically commands higher NIL values
      expect(parseFloat(footballValue.replace(/[^0-9.]/g, '')))
        .toBeGreaterThan(parseFloat(basketballValue.replace(/[^0-9.]/g, '')));
    });
  });

  test.describe('Multi-Sport Dashboard Journey', () => {
    test('should display all supported sports teams', async ({ page }) => {
      await page.goto('/multi-sport-dashboard');
      
      // Verify all core teams are present
      await expect(page.locator('[data-testid="cardinals-tile"]')).toBeVisible(); // MLB
      await expect(page.locator('[data-testid="titans-tile"]')).toBeVisible();    // NFL
      await expect(page.locator('[data-testid="longhorns-tile"]')).toBeVisible(); // NCAA
      await expect(page.locator('[data-testid="grizzlies-tile"]')).toBeVisible(); // NBA
      
      // Verify no soccer/football references
      const pageContent = await page.textContent('body');
      expect(pageContent.toLowerCase()).not.toMatch(/soccer|football(?!.*american)/);
      
      // Test team selection
      await page.click('[data-testid="cardinals-tile"]');
      await expect(page.locator('[data-testid="cardinals-details"]')).toBeVisible();
      
      // Verify real-time data updates
      await expect(page.locator('[data-testid="last-updated"]')).toBeVisible();
      const lastUpdated = await page.textContent('[data-testid="last-updated"]');
      expect(lastUpdated).toMatch(/\d{1,2}:\d{2}/); // Time format
    });

    test('should handle team comparisons', async ({ page }) => {
      await page.goto('/multi-sport-dashboard');
      
      // Select multiple teams for comparison
      await page.check('[data-testid="compare-cardinals"]');
      await page.check('[data-testid="compare-titans"]');
      
      await page.click('[data-testid="compare-teams"]');
      
      // Verify comparison view
      await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="cardinals-comparison"]')).toBeVisible();
      await expect(page.locator('[data-testid="titans-comparison"]')).toBeVisible();
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should meet Core Web Vitals thresholds', async ({ page }) => {
      await page.goto('/');
      
      // Measure LCP (Largest Contentful Paint)
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        });
      });
      
      expect(lcp).toBeLessThan(2500); // LCP should be under 2.5s
      
      // Check for accessibility
      await expect(page.locator('[data-testid="skip-to-content"]')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should work with keyboard navigation', async ({ page }) => {
      await page.goto('/');
      
      // Tab through navigation
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Should navigate to focused link
      await page.waitForTimeout(1000);
      expect(page.url()).not.toBe('/');
    });
  });
});