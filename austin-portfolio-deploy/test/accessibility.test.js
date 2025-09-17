/**
 * BLAZE INTELLIGENCE - Accessibility Test Suite
 * October 2025 Refresh
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

const PAGES_TO_TEST = [
    { name: 'Home', path: '/' },
    { name: 'Live Sports Data', path: '/sportsdataio-live.html' },
    { name: 'Enhanced Dashboard', path: '/sportsdataio-live-enhanced.html' },
    { name: 'Analytics', path: '/analytics.html' },
    { name: 'Cardinals Dashboard', path: '/cardinals-intelligence-dashboard.html' }
];

test.describe('Accessibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Set viewport
        await page.setViewportSize({ width: 1280, height: 720 });
    });

    PAGES_TO_TEST.forEach(({ name, path }) => {
        test(`${name} page should be accessible`, async ({ page }) => {
            await page.goto(`http://localhost:8080${path}`);
            await injectAxe(page);

            // Check for accessibility violations
            await checkA11y(page, null, {
                detailedReport: true,
                detailedReportOptions: {
                    html: true
                }
            });
        });

        test(`${name} should have proper heading structure`, async ({ page }) => {
            await page.goto(`http://localhost:8080${path}`);

            // Check for h1
            const h1 = await page.$('h1');
            expect(h1).toBeTruthy();

            // Check heading hierarchy
            const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements =>
                elements.map(el => ({
                    level: parseInt(el.tagName[1]),
                    text: el.textContent.trim()
                }))
            );

            // Verify no skipped heading levels
            let previousLevel = 0;
            for (const heading of headings) {
                expect(heading.level - previousLevel).toBeLessThanOrEqual(1);
                if (heading.level > previousLevel) {
                    previousLevel = heading.level;
                }
            }
        });

        test(`${name} should have skip links`, async ({ page }) => {
            await page.goto(`http://localhost:8080${path}`);

            // Check for skip link
            const skipLink = await page.$('a[href="#main-content"], .skip-link');
            if (skipLink) {
                // Focus the skip link and check visibility
                await skipLink.focus();
                const isVisible = await skipLink.isVisible();
                expect(isVisible).toBeTruthy();
            }
        });

        test(`${name} should have proper ARIA labels`, async ({ page }) => {
            await page.goto(`http://localhost:8080${path}`);

            // Check navigation has proper role and label
            const nav = await page.$('nav');
            if (nav) {
                const role = await nav.getAttribute('role');
                const label = await nav.getAttribute('aria-label');
                expect(role || 'navigation').toBe('navigation');
                expect(label).toBeTruthy();
            }

            // Check main content has proper role
            const main = await page.$('main');
            if (main) {
                const role = await main.getAttribute('role');
                expect(role || 'main').toBe('main');
            }
        });

        test(`${name} should support keyboard navigation`, async ({ page }) => {
            await page.goto(`http://localhost:8080${path}`);

            // Tab through interactive elements
            const interactiveElements = await page.$$('a, button, input, select, textarea, [tabindex="0"]');

            for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
                await page.keyboard.press('Tab');

                // Check if element has focus
                const focusedElement = await page.evaluateHandle(() => document.activeElement);
                const hasFocus = await page.evaluate(
                    ([focused, elements]) => elements.some(el => el === focused),
                    [focusedElement, interactiveElements]
                );
                expect(hasFocus).toBeTruthy();
            }
        });
    });

    test.describe('Reduced Motion Support', () => {
        test('should respect prefers-reduced-motion', async ({ page }) => {
            // Emulate reduced motion preference
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.goto('http://localhost:8080/sportsdataio-live-enhanced.html');

            // Check if animations are paused
            const animationsPaused = await page.evaluate(() => {
                const animations = document.getAnimations();
                return animations.every(animation =>
                    animation.playState === 'paused' ||
                    animation.playState === 'idle'
                );
            });

            expect(animationsPaused).toBeTruthy();
        });

        test('should have pause animation control', async ({ page }) => {
            await page.goto('http://localhost:8080/sportsdataio-live-enhanced.html');

            // Look for pause button
            const pauseBtn = await page.$('#pauseAnimBtn, button[aria-label*="animation"]');
            expect(pauseBtn).toBeTruthy();

            if (pauseBtn) {
                // Click pause button
                await pauseBtn.click();

                // Check button text changed
                const buttonText = await pauseBtn.textContent();
                expect(buttonText).toContain('Start');
            }
        });
    });

    test.describe('Color Contrast', () => {
        test('should have sufficient color contrast', async ({ page }) => {
            await page.goto('http://localhost:8080/sportsdataio-live-enhanced.html');
            await injectAxe(page);

            // Check specifically for color contrast violations
            const results = await page.evaluate(async () => {
                const axeResults = await window.axe.run(document, {
                    rules: {
                        'color-contrast': { enabled: true }
                    }
                });
                return axeResults.violations;
            });

            expect(results).toHaveLength(0);
        });
    });

    test.describe('Screen Reader Support', () => {
        test('should have proper landmark regions', async ({ page }) => {
            await page.goto('http://localhost:8080/sportsdataio-live-enhanced.html');

            const landmarks = await page.evaluate(() => {
                const regions = {
                    header: document.querySelector('header, [role="banner"]'),
                    nav: document.querySelector('nav, [role="navigation"]'),
                    main: document.querySelector('main, [role="main"]'),
                    footer: document.querySelector('footer, [role="contentinfo"]')
                };

                return Object.entries(regions).map(([name, element]) => ({
                    name,
                    exists: !!element,
                    hasLabel: element ? !!element.getAttribute('aria-label') : false
                }));
            });

            // Check main landmarks exist
            expect(landmarks.find(l => l.name === 'main')?.exists).toBeTruthy();
            expect(landmarks.find(l => l.name === 'nav')?.exists).toBeTruthy();
        });

        test('should have live regions for updates', async ({ page }) => {
            await page.goto('http://localhost:8080/sportsdataio-live-enhanced.html');

            const liveRegions = await page.$$('[aria-live], [role="status"], [role="alert"]');
            expect(liveRegions.length).toBeGreaterThan(0);
        });
    });

    test.describe('Focus Management', () => {
        test('should have visible focus indicators', async ({ page }) => {
            await page.goto('http://localhost:8080/sportsdataio-live-enhanced.html');

            // Get first link
            const firstLink = await page.$('a');
            if (firstLink) {
                await firstLink.focus();

                // Check if focus is visible
                const focusStyle = await firstLink.evaluate(el => {
                    const styles = window.getComputedStyle(el);
                    return {
                        outline: styles.outline,
                        outlineOffset: styles.outlineOffset,
                        boxShadow: styles.boxShadow
                    };
                });

                // Should have some focus indicator
                const hasFocusIndicator =
                    focusStyle.outline !== 'none' ||
                    focusStyle.boxShadow !== 'none';

                expect(hasFocusIndicator).toBeTruthy();
            }
        });
    });
});

// Performance metrics for accessibility
test.describe('Accessibility Performance', () => {
    test('should load accessibility features quickly', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('http://localhost:8080/sportsdataio-live-enhanced.html');

        // Wait for accessibility features
        await page.waitForSelector('.skip-link', { timeout: 3000 });
        await page.waitForSelector('[aria-label]', { timeout: 3000 });

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });
});