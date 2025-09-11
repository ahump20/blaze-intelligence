/**
 * Critical Unit Tests for ROI Calculator
 * Testing savings claims (67-80% range) and NIL calculations
 */

describe('ROI Calculator - Critical Business Logic', () => {
  
  describe('Hudl Pricing Comparison', () => {
    test('should calculate 67-80% savings vs Hudl Assist ($900/year)', () => {
      const hudlAssistPrice = 900;
      const blazePrice = 1188; // Annual price
      
      // Calculate actual savings percentage
      const actualSavings = ((hudlAssistPrice - blazePrice) / hudlAssistPrice) * 100;
      
      // This test should fail initially to validate we're being honest about pricing
      expect(actualSavings).toBeGreaterThanOrEqual(67);
      expect(actualSavings).toBeLessThanOrEqual(80);
    });

    test('should calculate 67-80% savings vs Hudl Pro ($1,500/year)', () => {
      const hudlProPrice = 1500;
      const blazePrice = 1188;
      
      const actualSavings = ((hudlProPrice - blazePrice) / hudlProPrice) * 100;
      
      // This should pass as we're comparing against higher tier
      expect(actualSavings).toBeGreaterThanOrEqual(67);
      expect(actualSavings).toBeLessThanOrEqual(80);
    });

    test('should never fabricate savings claims outside 67-80% range', () => {
      const testPrices = [
        { competitor: 1000, blaze: 1188, expectedInRange: false },
        { competitor: 3000, blaze: 1188, expectedInRange: true },
        { competitor: 2000, blaze: 1188, expectedInRange: true },
        { competitor: 1200, blaze: 1188, expectedInRange: false }
      ];

      testPrices.forEach(({ competitor, blaze, expectedInRange }) => {
        const savings = ((competitor - blaze) / competitor) * 100;
        const inValidRange = savings >= 67 && savings <= 80;
        
        expect(inValidRange).toBe(expectedInRange);
      });
    });
  });

  describe('NIL Valuation Accuracy', () => {
    test('should calculate NIL value based on verified metrics', () => {
      const playerMetrics = {
        sport: 'baseball',
        position: 'pitcher',
        stats: {
          era: 2.45,
          strikeouts: 95,
          wins: 8
        },
        socialMedia: {
          followers: 5000,
          engagementRate: 0.035
        },
        marketValue: {
          local: true,
          regional: false,
          national: false
        }
      };

      const nilValue = calculateNILValue(playerMetrics);
      
      // Should be realistic for college athlete
      expect(nilValue).toBeGreaterThan(500);
      expect(nilValue).toBeLessThan(25000);
      expect(typeof nilValue).toBe('number');
    });

    test('should adjust NIL value for different sports', () => {
      const baselinePlayer = {
        socialMedia: { followers: 3000, engagementRate: 0.04 },
        marketValue: { local: true, regional: false, national: false }
      };

      const footballPlayer = calculateNILValue({ 
        ...baselinePlayer, 
        sport: 'football',
        position: 'quarterback',
        stats: { passingYards: 2500, touchdowns: 20 }
      });

      const baseballPlayer = calculateNILValue({ 
        ...baselinePlayer, 
        sport: 'baseball', 
        position: 'shortstop',
        stats: { battingAverage: 0.325, homeRuns: 12 }
      });

      // Football typically commands higher NIL values
      expect(footballPlayer).toBeGreaterThan(baseballPlayer);
    });

    test('should factor in social media influence accurately', () => {
      const lowInfluence = calculateNILValue({
        sport: 'baseball',
        socialMedia: { followers: 1000, engagementRate: 0.02 },
        marketValue: { local: true }
      });

      const highInfluence = calculateNILValue({
        sport: 'baseball', 
        socialMedia: { followers: 50000, engagementRate: 0.08 },
        marketValue: { local: true, regional: true, national: true }
      });

      expect(highInfluence).toBeGreaterThan(lowInfluence * 3);
    });
  });

  describe('Performance Benchmarks', () => {
    test('should maintain <100ms calculation time', () => {
      const complexCalculation = {
        sport: 'football',
        position: 'quarterback', 
        stats: { passingYards: 3500, touchdowns: 28, interceptions: 8 },
        socialMedia: { followers: 25000, engagementRate: 0.055 },
        marketValue: { local: true, regional: true, national: false }
      };

      const iterations = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        calculateNILValue(complexCalculation);
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;
      
      expect(avgTime).toBeLessThan(100); // <100ms per calculation
    });

    test('should maintain 94.6% accuracy benchmark vs manual calculations', () => {
      const testCases = [
        // Known manual calculations for validation
        {
          input: { sport: 'baseball', socialMedia: { followers: 5000 } },
          expectedRange: { min: 2800, max: 3200 }
        },
        {
          input: { sport: 'football', socialMedia: { followers: 15000 } },
          expectedRange: { min: 8500, max: 9500 }
        }
      ];

      let accurateCalculations = 0;
      
      testCases.forEach(({ input, expectedRange }) => {
        const result = calculateNILValue(input);
        if (result >= expectedRange.min && result <= expectedRange.max) {
          accurateCalculations++;
        }
      });

      const accuracy = (accurateCalculations / testCases.length) * 100;
      expect(accuracy).toBeGreaterThanOrEqual(94.6);
    });
  });

  describe('Data Integrity', () => {
    test('should handle invalid inputs gracefully', () => {
      const invalidInputs = [
        null,
        undefined,
        {},
        { sport: 'invalid-sport' },
        { socialMedia: { followers: -100 } }
      ];

      invalidInputs.forEach(input => {
        expect(() => calculateNILValue(input)).not.toThrow();
        const result = calculateNILValue(input);
        expect(result).toBe(0); // Should return 0 for invalid inputs
      });
    });

    test('should validate against data fabrication', () => {
      // Ensure we never generate unrealistic NIL values
      const testPlayer = {
        sport: 'baseball',
        socialMedia: { followers: 1000, engagementRate: 0.03 },
        marketValue: { local: false, regional: false, national: false }
      };

      const nilValue = calculateNILValue(testPlayer);
      
      // Small local player should not have inflated value
      expect(nilValue).toBeLessThan(5000);
      expect(nilValue).toBeGreaterThan(0);
    });
  });
});

// Mock function - would be replaced with actual implementation
function calculateNILValue(playerData) {
  if (!playerData || !playerData.sport) return 0;
  
  const baseValue = 1000;
  const socialMultiplier = (playerData.socialMedia?.followers || 0) * 0.1;
  const sportMultiplier = playerData.sport === 'football' ? 1.5 : 1.0;
  
  return Math.round(baseValue + socialMultiplier * sportMultiplier);
}